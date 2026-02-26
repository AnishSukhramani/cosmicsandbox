"use client";
import { Suspense, useEffect, useMemo, useRef } from "react";
import { useFrame, useThree, useLoader } from "@react-three/fiber";
import { OrbitControls, useTexture } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import {
  Color,
  Vector3,
  AdditiveBlending,
  Mesh,
  Camera,
  SRGBColorSpace,
  Group,
  TextureLoader,
  EquirectangularReflectionMapping,
  BufferGeometry,
  Float32BufferAttribute,
  PointsMaterial,
  Points,
} from "three";
import Planet from "@/components/Planet";
import MoonComponent from "@/components/Moon";
import Spaceship from "@/components/Spaceship";
import {
  PLANETS,
  computeKeplerianPosition,
  SUN_DISPLAY_RADIUS,
  BODY_KM_TO_UNITS,
  daysSinceJ2000,
  AU_TO_UNITS,
} from "@/lib/planets";
import { MOONS } from "@/lib/moons";
import { useUiState } from "@/components/state";

// ─── Hooks ──────────────────────────────────────────────────────────────────

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
        const newDistance = Math.max(0.3, Math.min(2000, distance + delta * 0.1));
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
    const handleKeyDown = (event: KeyboardEvent) => keysPressed.current.add(event.key.toLowerCase());
    const handleKeyUp = (event: KeyboardEvent) => keysPressed.current.delete(event.key.toLowerCase());
    const handleMouseMove = (event: MouseEvent) => {
      if (!isPointerLocked.current) return;
      yaw.current -= event.movementX * 0.002;
      pitch.current = Math.max(-Math.PI / 2 + 0.1, Math.min(Math.PI / 2 - 0.1, pitch.current - event.movementY * 0.002));
      camera.rotation.set(0, 0, 0);
      camera.rotateY(yaw.current);
      camera.rotateX(pitch.current);
    };
    const handlePointerLockChange = () => { isPointerLocked.current = document.pointerLockElement !== null; };
    const handleClick = () => {
      if ((cameraMode === "free" || cameraMode === "spaceship") && !isPointerLocked.current) {
        document.querySelector("canvas")?.requestPointerLock().catch(() => {});
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
    const d = moveDir.current.set(0, 0, 0);
    if (keysPressed.current.has("w") || keysPressed.current.has("arrowup")) d.z -= 1;
    if (keysPressed.current.has("s") || keysPressed.current.has("arrowdown")) d.z += 1;
    if (keysPressed.current.has("a") || keysPressed.current.has("arrowleft")) d.x -= 1;
    if (keysPressed.current.has("d") || keysPressed.current.has("arrowright")) d.x += 1;
    if (d.lengthSq() > 0) {
      d.normalize().applyQuaternion(camera.quaternion);
      camera.position.addScaledVector(d, freeCameraSpeed * delta * 0.5);
    }
  });
}

// ─── Sub-components ─────────────────────────────────────────────────────────

const SUN_RADIUS_UNITS = SUN_DISPLAY_RADIUS;

function TexturedSun() {
  const sunTexture = useTexture("/textures/2k_sun.jpg");
  const sunRef = useRef<Mesh>(null);
  useMemo(() => { sunTexture.colorSpace = SRGBColorSpace; }, [sunTexture]);
  useFrame((_, delta) => { if (sunRef.current) sunRef.current.rotation.y += delta * 0.03; });

  return (
    <group>
      <mesh ref={sunRef}>
        <sphereGeometry args={[SUN_RADIUS_UNITS, 32, 16]} />
        <meshBasicMaterial map={sunTexture} toneMapped={false} />
      </mesh>
      <mesh>
        <sphereGeometry args={[SUN_RADIUS_UNITS * 1.25, 16, 8]} />
        <meshBasicMaterial color="#ffaa22" transparent opacity={0.12} blending={AdditiveBlending} toneMapped={false} />
      </mesh>
      <pointLight color="#ffd9a3" intensity={50} distance={5000} decay={2} />
    </group>
  );
}

function FallbackSun() {
  return (
    <group>
      <mesh>
        <sphereGeometry args={[SUN_RADIUS_UNITS, 32, 16]} />
        <meshBasicMaterial color="#ffdd99" toneMapped={false} />
      </mesh>
      <pointLight color="#ffd9a3" intensity={50} distance={5000} decay={2} />
    </group>
  );
}

function Orbits({ visible }: { visible: boolean }) {
  const rings = useMemo(() => {
    return PLANETS.map((p) => {
      const steps = 100;
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
            <bufferAttribute attach="attributes-position" args={[r.positions, 3]} />
          </bufferGeometry>
          <lineBasicMaterial color="#334466" transparent opacity={0.4} />
        </line>
      ))}
    </group>
  );
}

function SceneBackground() {
  const { scene } = useThree();
  const bgTexture = useLoader(TextureLoader, "/textures/8k_stars_milky_way.jpg");
  useEffect(() => {
    bgTexture.mapping = EquirectangularReflectionMapping;
    bgTexture.colorSpace = SRGBColorSpace;
    scene.background = bgTexture;
    return () => { scene.background = new Color("#000005"); };
  }, [bgTexture, scene]);
  return null;
}

function AsteroidBelt() {
  const geometry = useMemo(() => {
    const count = 1500;
    const positions = new Float32Array(count * 3);
    const innerAU = 2.1;
    const outerAU = 3.3;
    for (let i = 0; i < count; i++) {
      const r = (innerAU + Math.random() * (outerAU - innerAU)) * AU_TO_UNITS;
      const angle = Math.random() * Math.PI * 2;
      const y = (Math.random() - 0.5) * 0.8;
      positions[i * 3] = Math.cos(angle) * r;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = Math.sin(angle) * r;
    }
    const geo = new BufferGeometry();
    geo.setAttribute("position", new Float32BufferAttribute(positions, 3));
    return geo;
  }, []);

  const material = useMemo(
    () => new PointsMaterial({ color: "#887766", size: 0.08, transparent: true, opacity: 0.6, sizeAttenuation: true }),
    []
  );

  return <primitive object={new Points(geometry, material)} />;
}

// ─── Main ───────────────────────────────────────────────────────────────────

export default function SolarSystem() {
  const { camera, scene } = useThree();
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const {
    selected, showOrbits, showLabels, paused, daysPerSecond, cameraMode, freeCameraSpeed,
  } = useUiState();

  const spaceshipPosition = useRef(new Vector3(0, 0, 0));
  const keysPressed = useRef<Set<string>>(new Set());

  useEnhancedZoom(controlsRef);
  useFreeCamera(camera, cameraMode, freeCameraSpeed, keysPressed);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "f" || event.key === "F") { event.preventDefault(); useUiState.getState().toggleCameraMode(); }
      else if (event.key === "r" || event.key === "R") { event.preventDefault(); useUiState.getState().resetCamera(); }
      else if (event.key === "Escape") document.exitPointerLock();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => { scene.background = new Color("#000005"); }, [scene]);

  // Seed the simulation at the *current real date* so positions match reality
  const simDaysRef = useRef(daysSinceJ2000());

  const _targetPos = useRef(new Vector3());
  const _desiredPos = useRef(new Vector3());
  const _currentTarget = useRef(new Vector3());
  const _moveDir = useRef(new Vector3());
  const _cameraOffset = useRef(new Vector3(0, 5, 15));
  const _desiredCamPos = useRef(new Vector3());

  useFrame((_, delta) => {
    // At 1× speed, 1 real second = 1 simulation day (so you can see orbits move).
    // The HUD shows the multiplier. Actual real-time would be imperceptibly slow
    // for outer planets, so 1× = 1 day/s is the standard planetarium convention.
    if (!paused) {
      simDaysRef.current += delta * daysPerSecond;
    }

    if (cameraMode === "spaceship") {
      const d = _moveDir.current.set(0, 0, 0);
      if (keysPressed.current.has("w") || keysPressed.current.has("arrowup")) d.z -= 1;
      if (keysPressed.current.has("s") || keysPressed.current.has("arrowdown")) d.z += 1;
      if (keysPressed.current.has("a") || keysPressed.current.has("arrowleft")) d.x -= 1;
      if (keysPressed.current.has("d") || keysPressed.current.has("arrowright")) d.x += 1;
      if (d.lengthSq() > 0) {
        d.normalize().applyQuaternion(camera.quaternion);
        spaceshipPosition.current.addScaledVector(d, freeCameraSpeed * delta * 0.5);
      }
      _desiredCamPos.current.copy(spaceshipPosition.current).add(_cameraOffset.current);
      camera.position.lerp(_desiredCamPos.current, 0.1);
      camera.lookAt(spaceshipPosition.current);
    }

    const targetPlanet = PLANETS.find((p) => p.name === selected);
    if (targetPlanet && controlsRef.current && cameraMode === "follow") {
      const [tx, ty, tz] = computeKeplerianPosition(targetPlanet, simDaysRef.current);
      const tp = _targetPos.current.set(tx, ty, tz);
      const bodyRadius = targetPlanet.radiusKm * BODY_KM_TO_UNITS;
      const distance = Math.max(bodyRadius * 8, 3);
      _desiredPos.current.set(tx + distance, ty + distance * 0.35, tz + distance);
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
      <Suspense fallback={null}><SceneBackground /></Suspense>

      <Suspense fallback={<FallbackSun />}><TexturedSun /></Suspense>

      <Orbits visible={showOrbits} />

      <AsteroidBelt />

      <PlanetsGroup simDaysRef={simDaysRef} showLabels={showLabels} />

      {cameraMode !== "free" && cameraMode !== "spaceship" && (
        <OrbitControls
          ref={controlsRef}
          enableDamping dampingFactor={0.05}
          minDistance={0.3} maxDistance={2000}
          enablePan enableZoom enableRotate
          zoomSpeed={1.2} panSpeed={1.0} rotateSpeed={0.8}
          maxPolarAngle={Math.PI} minPolarAngle={0}
          target={[0, 0, 0]}
        />
      )}

      {cameraMode === "spaceship" && (
        <Spaceship
          position={spaceshipPosition.current}
          rotation={new Vector3(camera.rotation.x, camera.rotation.y, camera.rotation.z)}
        />
      )}

      <ambientLight intensity={0.08} />
    </group>
  );
}

// ─── Planet group with moons ────────────────────────────────────────────────

function PlanetsGroup({
  simDaysRef,
  showLabels,
}: {
  simDaysRef: React.MutableRefObject<number>;
  showLabels: boolean;
}) {
  const setSelected = useUiState((s) => s.setSelected);
  const groupRefs = useRef<(Group | null)[]>(new Array(PLANETS.length).fill(null));

  // Pre-compute which moons belong to which planet
  const moonsByPlanet = useMemo(() => {
    const map: Record<string, typeof MOONS> = {};
    for (const m of MOONS) {
      if (!map[m.parentPlanet]) map[m.parentPlanet] = [];
      map[m.parentPlanet].push(m);
    }
    return map;
  }, []);

  useFrame(() => {
    for (let i = 0; i < PLANETS.length; i++) {
      const g = groupRefs.current[i];
      if (!g) continue;
      const [x, y, z] = computeKeplerianPosition(PLANETS[i], simDaysRef.current);
      g.position.set(x, y, z);
    }
  });

  return (
    <group>
      {PLANETS.map((p, i) => (
        <group key={p.name} ref={(el) => { groupRefs.current[i] = el; }}>
          <Planet data={p} onClick={() => setSelected(p.name)} showLabel={showLabels} />
          {/* Render moons for this planet */}
          {moonsByPlanet[p.name]?.map((moon) => (
            <MoonComponent
              key={moon.name}
              moon={moon}
              simDaysRef={simDaysRef}
              showLabel={showLabels}
            />
          ))}
        </group>
      ))}
    </group>
  );
}
