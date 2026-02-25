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
} from "three";
import Planet from "@/components/Planet";
import Spaceship from "@/components/Spaceship";
import { AU_TO_UNITS, PLANETS, computeKeplerianPosition } from "@/lib/planets";
// PlanetData type used indirectly via PLANETS array
import { useUiState } from "@/components/state";

function useEnhancedZoom(
  controlsRef: React.RefObject<OrbitControlsImpl | null>
) {
  useEffect(() => {
    const handleWheel = (event: WheelEvent) => {
      if (event.ctrlKey && controlsRef.current) {
        event.preventDefault();
        const delta = event.deltaY;
        const zoomSpeed = 0.1;
        const distance = controlsRef.current.getDistance();
        const newDistance = Math.max(
          0.5,
          Math.min(1000, distance + delta * zoomSpeed)
        );
        const direction = new Vector3();
        controlsRef.current.object.getWorldDirection(direction);
        const moveDistance = newDistance - distance;
        controlsRef.current.object.position.addScaledVector(
          direction,
          -moveDistance
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
        if (canvas)
          canvas
            .requestPointerLock()
            .catch(() => {});
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
    const direction = new Vector3();
    if (
      keysPressed.current.has("w") ||
      keysPressed.current.has("arrowup")
    )
      direction.z -= 1;
    if (
      keysPressed.current.has("s") ||
      keysPressed.current.has("arrowdown")
    )
      direction.z += 1;
    if (
      keysPressed.current.has("a") ||
      keysPressed.current.has("arrowleft")
    )
      direction.x -= 1;
    if (
      keysPressed.current.has("d") ||
      keysPressed.current.has("arrowright")
    )
      direction.x += 1;
    if (direction.length() > 0) {
      direction.normalize();
      direction.applyQuaternion(camera.quaternion);
      camera.position.addScaledVector(direction, moveSpeed);
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
      <sphereGeometry args={[900, 64, 32]} />
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
      {/* Textured Sun surface */}
      <mesh ref={sunRef}>
        <sphereGeometry args={[SUN_RADIUS_UNITS, 128, 64]} />
        <meshBasicMaterial
          map={sunTexture}
          toneMapped={false}
        />
      </mesh>
      {/* Corona glow layers */}
      <mesh>
        <sphereGeometry args={[SUN_RADIUS_UNITS * 1.15, 64, 32]} />
        <meshBasicMaterial
          color="#ffcc44"
          transparent
          opacity={0.25}
          blending={AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[SUN_RADIUS_UNITS * 1.6, 64, 32]} />
        <meshBasicMaterial
          color="#ff8800"
          transparent
          opacity={0.08}
          blending={AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[SUN_RADIUS_UNITS * 2.5, 32, 16]} />
        <meshBasicMaterial
          color="#ff6600"
          transparent
          opacity={0.03}
          blending={AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
      {/* Sun light */}
      <pointLight
        castShadow
        color="#ffd9a3"
        intensity={8}
        distance={2000}
        decay={2}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={2000}
        shadow-camera-near={1}
      />
    </group>
  );
}

// ---------- Fallback Sun (no texture) ----------
function FallbackSun() {
  return (
    <group>
      <mesh>
        <sphereGeometry args={[SUN_RADIUS_UNITS, 128, 64]} />
        <meshStandardMaterial
          emissive={new Color("#ffb200")}
          emissiveIntensity={8.0}
          color="#ffdd99"
          toneMapped={false}
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[SUN_RADIUS_UNITS * 1.2, 64, 32]} />
        <meshBasicMaterial
          color="#ffb200"
          transparent
          opacity={0.3}
          blending={AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
      <pointLight
        castShadow
        color="#ffd9a3"
        intensity={8}
        distance={2000}
        decay={2}
      />
    </group>
  );
}

// ---------- Orbit rings (now supports Keplerian ellipses) ----------
function Orbits({ visible }: { visible: boolean }) {
  const rings = useMemo(() => {
    return PLANETS.map((p) => {
      const steps = 256;
      const points: Vector3[] = [];
      for (let j = 0; j <= steps; j++) {
        const simDays = (j / steps) * p.orbitalPeriodDays;
        const [x, y, z] = computeKeplerianPosition(p, simDays);
        points.push(new Vector3(x, y, z));
      }
      return { name: p.name, points };
    });
  }, []);

  return (
    <group visible={visible}>
      {rings.map((r) => (
        <line key={r.name}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[
                new Float32Array(r.points.flatMap((p) => [p.x, p.y, p.z])),
                3,
              ]}
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

  useFrame((_, delta) => {
    if (!paused) {
      simDaysRef.current += delta * daysPerSecond;
    }

    if (cameraMode === "spaceship") {
      const moveSpeed = freeCameraSpeed * delta * 0.5;
      const direction = new Vector3();
      if (keysPressed.current.has("w") || keysPressed.current.has("arrowup"))
        direction.z -= 1;
      if (keysPressed.current.has("s") || keysPressed.current.has("arrowdown"))
        direction.z += 1;
      if (keysPressed.current.has("a") || keysPressed.current.has("arrowleft"))
        direction.x -= 1;
      if (keysPressed.current.has("d") || keysPressed.current.has("arrowright"))
        direction.x += 1;
      if (direction.length() > 0) {
        direction.normalize();
        direction.applyQuaternion(camera.quaternion);
        spaceshipPosition.current.addScaledVector(direction, moveSpeed);
      }
      const cameraOffset = new Vector3(0, 5, 15);
      const desiredCameraPos = spaceshipPosition.current
        .clone()
        .add(cameraOffset);
      camera.position.lerp(desiredCameraPos, 0.1);
      camera.lookAt(spaceshipPosition.current);
    }

    const targetPlanet = PLANETS.find((p) => p.name === selected);
    if (targetPlanet && controlsRef.current && cameraMode === "follow") {
      const [tx, ty, tz] = computeKeplerianPosition(
        targetPlanet,
        simDaysRef.current
      );
      const targetPos = new Vector3(tx, ty, tz);
      const distance = Math.max(
        4,
        targetPlanet.semiMajorAxisAU * AU_TO_UNITS * 0.3
      );
      const desiredPos = targetPos
        .clone()
        .add(new Vector3(distance, distance * 0.3, distance));
      const lerpAlpha = 1 - Math.pow(0.001, delta);
      const ctrl = controlsRef.current;
      const currentTarget = new Vector3().copy(ctrl.target);
      currentTarget.lerp(targetPos, lerpAlpha);
      ctrl.target.copy(currentTarget);
      camera.position.lerp(desiredPos, lerpAlpha);
      camera.updateProjectionMatrix();
      ctrl.update();
    }
  });

  return (
    <group>
      {/* Invisible click target for pointer lock */}
      <mesh position={[0, 0, 0]} visible={false}>
        <boxGeometry args={[10000, 10000, 1]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* Milky Way background skybox */}
      <Suspense fallback={null}>
        <MilkyWayBackground />
      </Suspense>

      {/* Multi-layer star field for nearby stars */}
      <Stars
        radius={200}
        depth={60}
        count={6000}
        factor={2}
        saturation={0.2}
        fade
        speed={0.5}
      />
      <Stars
        radius={400}
        depth={80}
        count={8000}
        factor={3}
        saturation={0.1}
        fade
        speed={0.3}
      />

      {/* Textured Sun */}
      <Suspense fallback={<FallbackSun />}>
        <TexturedSun />
      </Suspense>

      {/* Keplerian orbit paths */}
      <Orbits visible={showOrbits} />

      {/* Planets */}
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

      <EffectComposer>
        <Bloom
          mipmapBlur
          intensity={1.0}
          luminanceThreshold={0.15}
          luminanceSmoothing={0.4}
          kernelSize={3}
        />
        <Vignette eskil={false} offset={0.15} darkness={0.5} />
      </EffectComposer>
    </group>
  );
}

function PlanetsGroup({
  simDaysRef,
  showLabels,
}: {
  simDaysRef: React.MutableRefObject<number>;
  showLabels: boolean;
}) {
  const setSelected = useUiState((s) => s.setSelected);
  return (
    <group>
      {PLANETS.map((p) => {
        const [x, y, z] = computeKeplerianPosition(p, simDaysRef.current);
        const pos = new Vector3(x, y, z);
        return (
          <Planet
            key={p.name}
            data={p}
            position={pos}
            onClick={() => setSelected(p.name)}
            showLabel={showLabels}
          />
        );
      })}
    </group>
  );
}
