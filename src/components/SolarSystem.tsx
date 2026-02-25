"use client";
import { Suspense, useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Stars, useTexture } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import {
  Color,
  Vector3,
  AdditiveBlending,
  Mesh,
  Camera,
  BackSide,
  SRGBColorSpace,
  Group,
} from "three";
import Planet from "@/components/Planet";
import Spaceship from "@/components/Spaceship";
import { AU_TO_UNITS, PLANETS, computeKeplerianPosition } from "@/lib/planets";
import { useUiState } from "@/components/state";

function useEnhancedZoom(
  controlsRef: React.RefObject<OrbitControlsImpl | null>
) {
  const dirVec = useRef(new Vector3());
  useEffect(() => {
    const handleWheel = (event: WheelEvent) => {
      if (event.ctrlKey && controlsRef.current) {
        event.preventDefault();
        const delta = event.deltaY;
        const distance = controlsRef.current.getDistance();
        const newDistance = Math.max(
          0.5,
          Math.min(1000, distance + delta * 0.1)
        );
        controlsRef.current.object.getWorldDirection(dirVec.current);
        controlsRef.current.object.position.addScaledVector(
          dirVec.current,
          -(newDistance - distance)
        );
        controlsRef.current.update();
      }
    };
    document.addEventListener("wheel", handleWheel, { passive: false });
    return () => document.removeEventListener("wheel", handleWheel);
  }, [controlsRef]);
}

function useFreeCamera(
  camera: Camera,
  cameraMode: string,
  freeCameraSpeed: number,
  keysPressed: React.MutableRefObject<Set<string>>
) {
  const isPointerLocked = useRef(false);
  const pitch = useRef(0);
  const yaw = useRef(0);
  const moveDir = useRef(new Vector3());

  useEffect(() => {
    if (cameraMode !== "free" && cameraMode !== "spaceship") return;

    const handleKeyDown = (event: KeyboardEvent) => {
      keysPressed.current.add(event.key.toLowerCase());
    };
    const handleKeyUp = (event: KeyboardEvent) => {
      keysPressed.current.delete(event.key.toLowerCase());
    };
    const handleMouseMove = (event: MouseEvent) => {
      if (isPointerLocked.current) {
        const sensitivity = 0.002;
        yaw.current -= event.movementX * sensitivity;
        pitch.current -= event.movementY * sensitivity;
        pitch.current = Math.max(
          -Math.PI / 2 + 0.1,
          Math.min(Math.PI / 2 - 0.1, pitch.current)
        );
        camera.rotation.set(0, 0, 0);
        camera.rotateY(yaw.current);
        camera.rotateX(pitch.current);
      }
    };
    const handlePointerLockChange = () => {
      isPointerLocked.current = document.pointerLockElement !== null;
    };
    const handleClick = () => {
      if (
        (cameraMode === "free" || cameraMode === "spaceship") &&
        !isPointerLocked.current
      ) {
        const canvas = document.querySelector("canvas");
        if (canvas) canvas.requestPointerLock().catch(() => {});
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("pointerlockchange", handlePointerLockChange);
    document.addEventListener("click", handleClick);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("pointerlockchange", handlePointerLockChange);
      document.removeEventListener("click", handleClick);
    };
  }, [camera, cameraMode, keysPressed]);

  useFrame((_, delta) => {
    if (cameraMode !== "free" && cameraMode !== "spaceship") return;
    const moveSpeed = freeCameraSpeed * delta * 0.5;
    const d = moveDir.current;
    d.set(0, 0, 0);
    if (keysPressed.current.has("w") || keysPressed.current.has("arrowup"))
      d.z -= 1;
    if (keysPressed.current.has("s") || keysPressed.current.has("arrowdown"))
      d.z += 1;
    if (keysPressed.current.has("a") || keysPressed.current.has("arrowleft"))
      d.x -= 1;
    if (keysPressed.current.has("d") || keysPressed.current.has("arrowright"))
      d.x += 1;
    if (d.lengthSq() > 0) {
      d.normalize().applyQuaternion(camera.quaternion);
      camera.position.addScaledVector(d, moveSpeed);
    }
  });
}

const SUN_RADIUS_UNITS = 1.2;

// ---------- Milky Way background sphere ----------
function MilkyWayBackground() {
  const texture = useTexture("/textures/2k_stars_milky_way.jpg");
  useMemo(() => {
    texture.colorSpace = SRGBColorSpace;
  }, [texture]);
  return (
    <mesh>
      <sphereGeometry args={[900, 32, 16]} />
      <meshBasicMaterial map={texture} side={BackSide} toneMapped={false} />
    </mesh>
  );
}

// ---------- Textured Sun ----------
function TexturedSun() {
  const sunTexture = useTexture("/textures/2k_sun.jpg");
  const sunRef = useRef<Mesh>(null);
  useMemo(() => {
    sunTexture.colorSpace = SRGBColorSpace;
  }, [sunTexture]);

  useFrame((_, delta) => {
    if (sunRef.current) sunRef.current.rotation.y += delta * 0.03;
  });

  return (
    <group>
      <mesh ref={sunRef}>
        <sphereGeometry args={[SUN_RADIUS_UNITS, 48, 24]} />
        <meshBasicMaterial map={sunTexture} toneMapped={false} />
      </mesh>
      {/* Single corona glow layer instead of three */}
      <mesh>
        <sphereGeometry args={[SUN_RADIUS_UNITS * 1.3, 24, 12]} />
        <meshBasicMaterial
          color="#ffaa22"
          transparent
          opacity={0.15}
          blending={AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
      {/* Point light — NO shadow casting */}
      <pointLight color="#ffd9a3" intensity={8} distance={2000} decay={2} />
    </group>
  );
}

// ---------- Fallback Sun (no texture) ----------
function FallbackSun() {
  return (
    <group>
      <mesh>
        <sphereGeometry args={[SUN_RADIUS_UNITS, 48, 24]} />
        <meshBasicMaterial
          color="#ffdd99"
          toneMapped={false}
        />
      </mesh>
      <pointLight color="#ffd9a3" intensity={8} distance={2000} decay={2} />
    </group>
  );
}

// ---------- Orbit rings ----------
function Orbits({ visible }: { visible: boolean }) {
  const rings = useMemo(() => {
    return PLANETS.map((p) => {
      const steps = 128;
      const arr = new Float32Array((steps + 1) * 3);
      for (let j = 0; j <= steps; j++) {
        const simDays = (j / steps) * p.orbitalPeriodDays;
        const [x, y, z] = computeKeplerianPosition(p, simDays);
        arr[j * 3] = x;
        arr[j * 3 + 1] = y;
        arr[j * 3 + 2] = z;
      }
      return { name: p.name, positions: arr };
    });
  }, []);

  return (
    <group visible={visible}>
      {rings.map((r) => (
        <line key={r.name}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[r.positions, 3]}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#444466" transparent opacity={0.5} />
        </line>
      ))}
    </group>
  );
}

// ---------- Main SolarSystem component ----------
export default function SolarSystem() {
  const { camera, scene } = useThree();
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const {
    selected,
    showOrbits,
    showLabels,
    paused,
    daysPerSecond,
    cameraMode,
    freeCameraSpeed,
  } = useUiState();

  const spaceshipPosition = useRef(new Vector3(0, 0, 0));
  const keysPressed = useRef<Set<string>>(new Set());

  useEnhancedZoom(controlsRef);
  useFreeCamera(camera, cameraMode, freeCameraSpeed, keysPressed);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "f" || event.key === "F") {
        event.preventDefault();
        useUiState.getState().toggleCameraMode();
      } else if (event.key === "r" || event.key === "R") {
        event.preventDefault();
        useUiState.getState().resetCamera();
      } else if (event.key === "Escape") {
        document.exitPointerLock();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    scene.background = new Color("#000005");
  }, [scene]);

  const simDaysRef = useRef(0);

  // Pre-allocate reusable vectors for the frame loop
  const _targetPos = useRef(new Vector3());
  const _desiredPos = useRef(new Vector3());
  const _currentTarget = useRef(new Vector3());
  const _moveDir = useRef(new Vector3());
  const _cameraOffset = useRef(new Vector3(0, 5, 15));
  const _desiredCamPos = useRef(new Vector3());

  useFrame((_, delta) => {
    if (!paused) {
      simDaysRef.current += delta * daysPerSecond;
    }

    if (cameraMode === "spaceship") {
      const moveSpeed = freeCameraSpeed * delta * 0.5;
      const d = _moveDir.current.set(0, 0, 0);
      if (keysPressed.current.has("w") || keysPressed.current.has("arrowup"))
        d.z -= 1;
      if (keysPressed.current.has("s") || keysPressed.current.has("arrowdown"))
        d.z += 1;
      if (keysPressed.current.has("a") || keysPressed.current.has("arrowleft"))
        d.x -= 1;
      if (keysPressed.current.has("d") || keysPressed.current.has("arrowright"))
        d.x += 1;
      if (d.lengthSq() > 0) {
        d.normalize().applyQuaternion(camera.quaternion);
        spaceshipPosition.current.addScaledVector(d, moveSpeed);
      }
      _desiredCamPos.current
        .copy(spaceshipPosition.current)
        .add(_cameraOffset.current);
      camera.position.lerp(_desiredCamPos.current, 0.1);
      camera.lookAt(spaceshipPosition.current);
    }

    const targetPlanet = PLANETS.find((p) => p.name === selected);
    if (targetPlanet && controlsRef.current && cameraMode === "follow") {
      const [tx, ty, tz] = computeKeplerianPosition(
        targetPlanet,
        simDaysRef.current
      );
      const tp = _targetPos.current.set(tx, ty, tz);
      const distance = Math.max(
        4,
        targetPlanet.semiMajorAxisAU * AU_TO_UNITS * 0.3
      );
      _desiredPos.current.set(
        tx + distance,
        ty + distance * 0.3,
        tz + distance
      );
      const lerpAlpha = 1 - Math.pow(0.001, delta);
      const ctrl = controlsRef.current;
      _currentTarget.current.copy(ctrl.target).lerp(tp, lerpAlpha);
      ctrl.target.copy(_currentTarget.current);
      camera.position.lerp(_desiredPos.current, lerpAlpha);
      camera.updateProjectionMatrix();
      ctrl.update();
    }
  });

  return (
    <group>
      {/* Milky Way background skybox */}
      <Suspense fallback={null}>
        <MilkyWayBackground />
      </Suspense>

      {/* Single star layer — reduced count */}
      <Stars
        radius={300}
        depth={80}
        count={4000}
        factor={2.5}
        saturation={0.1}
        fade
        speed={0.3}
      />

      {/* Textured Sun */}
      <Suspense fallback={<FallbackSun />}>
        <TexturedSun />
      </Suspense>

      {/* Orbit paths */}
      <Orbits visible={showOrbits} />

      {/* Planets — position updated via refs in useFrame */}
      <PlanetsGroup simDaysRef={simDaysRef} showLabels={showLabels} />

      {/* Orbit controls */}
      {cameraMode !== "free" && cameraMode !== "spaceship" && (
        <OrbitControls
          ref={controlsRef}
          enableDamping
          dampingFactor={0.05}
          minDistance={0.5}
          maxDistance={1000}
          enablePan
          enableZoom
          enableRotate
          zoomSpeed={1.2}
          panSpeed={1.0}
          rotateSpeed={0.8}
          maxPolarAngle={Math.PI}
          minPolarAngle={0}
          target={[0, 0, 0]}
        />
      )}

      {cameraMode === "spaceship" && (
        <Spaceship
          position={spaceshipPosition.current}
          rotation={
            new Vector3(
              camera.rotation.x,
              camera.rotation.y,
              camera.rotation.z
            )
          }
        />
      )}

      <ambientLight intensity={0.06} />

      {/* Lighter post-processing — smaller bloom kernel */}
      <EffectComposer>
        <Bloom
          mipmapBlur
          intensity={0.8}
          luminanceThreshold={0.2}
          luminanceSmoothing={0.5}
          kernelSize={1}
        />
        <Vignette eskil={false} offset={0.15} darkness={0.5} />
      </EffectComposer>
    </group>
  );
}

// Planet group that updates positions via refs each frame (no React re-renders)
function PlanetsGroup({
  simDaysRef,
  showLabels,
}: {
  simDaysRef: React.MutableRefObject<number>;
  showLabels: boolean;
}) {
  const setSelected = useUiState((s) => s.setSelected);
  const groupRefs = useRef<(Group | null)[]>(new Array(PLANETS.length).fill(null));

  useFrame(() => {
    for (let i = 0; i < PLANETS.length; i++) {
      const g = groupRefs.current[i];
      if (!g) continue;
      const [x, y, z] = computeKeplerianPosition(
        PLANETS[i],
        simDaysRef.current
      );
      g.position.set(x, y, z);
    }
  });

  return (
    <group>
      {PLANETS.map((p, i) => (
        <group
          key={p.name}
          ref={(el) => {
            groupRefs.current[i] = el;
          }}
        >
          <Planet
            data={p}
            onClick={() => setSelected(p.name)}
            showLabel={showLabels}
          />
        </group>
      ))}
    </group>
  );
}
