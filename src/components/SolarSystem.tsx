"use client";
import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Stars, Environment } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { Color, Vector3, AdditiveBlending, Mesh, Camera, MeshBasicMaterial } from "three";
import Planet from "@/components/Planet";
import Spaceship from "@/components/Spaceship";
import { AU_TO_UNITS, PLANETS } from "@/lib/planets";
import type { PlanetData } from "@/lib/planets";
import { useUiState } from "@/components/state";

// Custom hook for enhanced scroll wheel zoom
function useEnhancedZoom(controlsRef: React.RefObject<OrbitControlsImpl | null>) {
  useEffect(() => {
    const handleWheel = (event: WheelEvent) => {
      if (event.ctrlKey && controlsRef.current) {
        event.preventDefault();
        const delta = event.deltaY;
        const zoomSpeed = 0.1;
        const distance = controlsRef.current.getDistance();
        const newDistance = Math.max(0.5, Math.min(1000, distance + delta * zoomSpeed));
        
        // Calculate zoom direction
        const direction = new Vector3();
        controlsRef.current.object.getWorldDirection(direction);
        
        // Move camera along the direction
        const moveDistance = newDistance - distance;
        controlsRef.current.object.position.addScaledVector(direction, -moveDistance);
        controlsRef.current.update();
      }
    };

    document.addEventListener('wheel', handleWheel, { passive: false });
    return () => document.removeEventListener('wheel', handleWheel);
  }, [controlsRef]);
}

// Custom hook for free camera movement
function useFreeCamera(camera: Camera, cameraMode: string, freeCameraSpeed: number, keysPressed: React.MutableRefObject<Set<string>>) {
  const isPointerLocked = useRef(false);
  const pitch = useRef(0); // Vertical rotation (up/down)
  const yaw = useRef(0);   // Horizontal rotation (left/right)

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
        
        // Update yaw (horizontal rotation)
        yaw.current -= event.movementX * sensitivity;
        
        // Update pitch (vertical rotation) - inverted for natural feel
        pitch.current -= event.movementY * sensitivity;
        
        // Clamp pitch to prevent over-rotation
        pitch.current = Math.max(-Math.PI / 2 + 0.1, Math.min(Math.PI / 2 - 0.1, pitch.current));

        
        
        // Reset camera rotation and apply new angles
        camera.rotation.set(0, 0, 0);
        camera.rotateY(yaw.current);
        camera.rotateX(pitch.current);
      }
    };

    const handlePointerLockChange = () => {
      isPointerLocked.current = document.pointerLockElement !== null;
    };

    const handleClick = () => {
      if ((cameraMode === "free" || cameraMode === "spaceship") && !isPointerLocked.current) {
        try {
          // Try to request pointer lock on the canvas element
          const canvas = document.querySelector('canvas');
          if (canvas) {
            canvas.requestPointerLock().catch((error) => {
              console.log("Pointer lock request failed:", error);
            });
          } else {
            document.body.requestPointerLock().catch((error) => {
              console.log("Pointer lock request failed:", error);
            });
          }
        } catch (error) {
          console.log("Pointer lock not supported:", error);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('pointerlockchange', handlePointerLockChange);
    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
      document.removeEventListener('click', handleClick);
    };
  }, [camera, cameraMode, keysPressed]);

  useFrame((_, delta) => {
    if (cameraMode !== "free" && cameraMode !== "spaceship") return;

    const moveSpeed = freeCameraSpeed * delta * 0.5;
    const direction = new Vector3();

    if (keysPressed.current.has('w') || keysPressed.current.has('arrowup')) {
      direction.z -= 1;
    }
    if (keysPressed.current.has('s') || keysPressed.current.has('arrowdown')) {
      direction.z += 1;
    }
    if (keysPressed.current.has('a') || keysPressed.current.has('arrowleft')) {
      direction.x -= 1;
    }
    if (keysPressed.current.has('d') || keysPressed.current.has('arrowright')) {
      direction.x += 1;
    }

    if (direction.length() > 0) {
      direction.normalize();
      direction.applyQuaternion(camera.quaternion);
      camera.position.addScaledVector(direction, moveSpeed);
    }
  });
}

const SUN_RADIUS_UNITS = 1.2; // stylized size for readability

function computePlanetPosition(planet: PlanetData, simDays: number): Vector3 {
  const angle = (simDays / planet.orbitalPeriodDays) * Math.PI * 2;
  const r = planet.semiMajorAxisAU * AU_TO_UNITS;
  return new Vector3(Math.cos(angle) * r, 0, Math.sin(angle) * r);
}

function Orbits({ visible }: { visible: boolean }) {
  const rings = useMemo(() => {
    return PLANETS.map((p) => ({
      radius: p.semiMajorAxisAU * AU_TO_UNITS,
      name: p.name,
    }));
  }, []);
  return (
    <group visible={visible}>
      {rings.map((r) => (
        <mesh key={r.name} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[r.radius * 0.995, r.radius * 1.005, 256]} />
          <meshBasicMaterial color="#333" side={2} transparent opacity={0.6} />
        </mesh>
      ))}
    </group>
  );
}

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

  // Spaceship state - simplified
  const spaceshipPosition = useRef(new Vector3(0, 0, 0));
  const keysPressed = useRef<Set<string>>(new Set());

  // Enable enhanced zoom functionality
  useEnhancedZoom(controlsRef);

  // Enable free camera movement
  useFreeCamera(camera, cameraMode, freeCameraSpeed, keysPressed);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'f' || event.key === 'F') {
        event.preventDefault();
        const { toggleCameraMode } = useUiState.getState();
        toggleCameraMode();
      } else if (event.key === 'r' || event.key === 'R') {
        event.preventDefault();
        const { resetCamera } = useUiState.getState();
        resetCamera();
      } else if (event.key === 'Escape') {
        // Exit pointer lock when pressing Escape
        document.exitPointerLock();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // lighting & background
  useEffect(() => {
    scene.background = new Color("#000011");
  }, [scene]);

  const simDaysRef = useRef(0);
  useFrame((_, delta) => {
    if (!paused) {
      simDaysRef.current += delta * daysPerSecond;
    }

    // Spaceship movement and camera control
    if (cameraMode === "spaceship") {
      // Handle spaceship movement based on camera direction
      const moveSpeed = freeCameraSpeed * delta * 0.5;
      const direction = new Vector3();

      if (keysPressed.current.has('w') || keysPressed.current.has('arrowup')) {
        direction.z -= 1;
      }
      if (keysPressed.current.has('s') || keysPressed.current.has('arrowdown')) {
        direction.z += 1;
      }
      if (keysPressed.current.has('a') || keysPressed.current.has('arrowleft')) {
        direction.x -= 1;
      }
      if (keysPressed.current.has('d') || keysPressed.current.has('arrowright')) {
        direction.x += 1;
      }

      if (direction.length() > 0) {
        direction.normalize();
        direction.applyQuaternion(camera.quaternion);
        spaceshipPosition.current.addScaledVector(direction, moveSpeed);
      }

      // Simple third-person camera: fixed offset behind spaceship
      const cameraOffset = new Vector3(0, 5, 15);
      const desiredCameraPos = spaceshipPosition.current.clone().add(cameraOffset);
      
      // Smoothly move camera to new position
      camera.position.lerp(desiredCameraPos, 0.1);
      
      // Look at spaceship
      camera.lookAt(spaceshipPosition.current);
    }

    // Smooth camera follow when a planet is selected and in follow mode
    const targetPlanet = PLANETS.find((p) => p.name === selected);
    if (targetPlanet && controlsRef.current && cameraMode === "follow") {
      const targetPos = computePlanetPosition(targetPlanet, simDaysRef.current);
      const desiredTarget = targetPos.clone();
      // desired camera position offset
      const distance = Math.max(4, targetPlanet.semiMajorAxisAU * AU_TO_UNITS * 0.3);
      const desiredPos = targetPos.clone().add(new Vector3(distance, distance * 0.3, distance));

      // lerp camera and controls target
      const lerpAlpha = 1 - Math.pow(0.001, delta); // time-constant smoothing
      const ctrl = controlsRef.current;
      const currentTarget = new Vector3().copy(ctrl.target);
      currentTarget.lerp(desiredTarget, lerpAlpha);
      ctrl.target.copy(currentTarget);
      camera.position.lerp(desiredPos, lerpAlpha);
      camera.updateProjectionMatrix();
      ctrl.update();
    }
  });

  return (
    <group>
      {/* Click handler for pointer lock */}
      <mesh position={[0, 0, 0]} visible={false}>
        <boxGeometry args={[10000, 10000, 1]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
      
      {/* Environment lighting for physically-based materials */}
      <Environment preset="night" background={false} />
      
      {/* Enhanced space background with multiple layers */}
      
      {/* Realistic Milky Way Galaxy - Far Background */}
      <group>
        {/* Milky Way Galaxy - Proper Spiral Structure */}
        {/* Galactic Core - Bright Central Bulge */}
        {Array.from({ length: 300 }, (_, i) => {
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos(2 * Math.random() - 1);
          const radius = Math.random() * 800; // Dense central bulge
          
          return (
            <mesh 
              key={`core-${i}`}
              position={[
                radius * Math.sin(phi) * Math.cos(theta),
                radius * Math.sin(phi) * Math.sin(theta) * 0.3, // Flattened
                -12000 + radius * Math.cos(phi)
              ]}
            >
              <sphereGeometry args={[Math.random() * 0.08 + 0.02, 4, 4]} />
              <meshBasicMaterial 
                color="#ffd700" 
                transparent 
                opacity={Math.random() * 0.2 + 0.1}
              />
            </mesh>
          );
        })}
        
        {/* Spiral Arms - 4 Major Arms */}
        {Array.from({ length: 4 }, (_, armIndex) => {
          const armAngle = (armIndex * Math.PI) / 2; // 4 arms at 90° intervals
          
          return Array.from({ length: 400 }, (_, i) => {
            const spiralAngle = (i / 400) * Math.PI * 4; // Multiple rotations
            const radius = 1000 + (i * 3); // Spiral outward
            const spiralTightness = 0.15; // How tight the spiral is
            const armOffset = armAngle + (spiralAngle * spiralTightness);
            
            return (
              <mesh 
                key={`arm-${armIndex}-${i}`}
                position={[
                  Math.cos(armOffset) * radius,
                  (Math.random() - 0.5) * 200, // Thickness of the arm
                  -12000 + Math.sin(armOffset) * radius
                ]}
              >
                <sphereGeometry args={[Math.random() * 0.06 + 0.01, 4, 4]} />
                <meshBasicMaterial 
                  color={armIndex % 2 === 0 ? "#ffffff" : "#e6e6fa"} 
                  transparent 
                  opacity={Math.random() * 0.15 + 0.05}
                />
              </mesh>
            );
          });
        })}
        
        {/* Galactic Disk - Background Stars */}
        {Array.from({ length: 600 }, (_, i) => {
          const angle = Math.random() * Math.PI * 2;
          const radius = 800 + Math.random() * 2000;
          const height = (Math.random() - 0.5) * 300; // Thickness of disk
          
          return (
            <mesh 
              key={`disk-${i}`}
              position={[
                Math.cos(angle) * radius,
                height,
                -12000 + Math.sin(angle) * radius
              ]}
            >
              <sphereGeometry args={[Math.random() * 0.04 + 0.01, 4, 4]} />
              <meshBasicMaterial 
                color="#ffffff" 
                transparent 
                opacity={Math.random() * 0.1 + 0.02}
              />
            </mesh>
          );
        })}
        
        {/* Distant Background Galaxies */}
        {Array.from({ length: 5 }, (_, galaxyIndex) => {
          const galaxyX = (galaxyIndex - 2) * 4000;
          
          return Array.from({ length: 80 }, (_, i) => {
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const radius = Math.random() * 150;
            
            return (
              <mesh 
                key={`distant-galaxy-${galaxyIndex}-${i}`}
                position={[
                  galaxyX + radius * Math.sin(phi) * Math.cos(theta),
                  radius * Math.sin(phi) * Math.sin(theta),
                  -18000 + radius * Math.cos(phi)
                ]}
              >
                <sphereGeometry args={[Math.random() * 0.03 + 0.005, 4, 4]} />
                <meshBasicMaterial 
                  color="#ffffff" 
                  transparent 
                  opacity={Math.random() * 0.08 + 0.01}
                />
              </mesh>
            );
          });
        })}
        
        {/* Deep Space Background */}
        {Array.from({ length: 300 }, (_, i) => (
          <mesh 
            key={`deep-space-${i}`}
            position={[
              (Math.random() - 0.5) * 20000,
              (Math.random() - 0.5) * 20000,
              -25000 + (Math.random() - 0.5) * 5000
            ]}
          >
            <sphereGeometry args={[Math.random() * 0.03 + 0.005, 4, 4]} />
            <meshBasicMaterial 
              color="#ffffff" 
              transparent 
              opacity={Math.random() * 0.05 + 0.01}
            />
          </mesh>
        ))}
      </group>
      
      {/* Multiple star layers for depth */}
      <Stars radius={300} depth={50} count={8000} factor={2} saturation={0.1} fade speed={0.8} />
      <Stars radius={600} depth={100} count={12000} factor={3} saturation={0} fade speed={0.4} />
      <Stars radius={1000} depth={150} count={20000} factor={5} saturation={0} fade speed={0.2} />
      
      {/* Animated cosmic effects */}
      <AnimatedCosmicEffects />

      {/* Enhanced Sun */}
      <group>
        <mesh>
          <sphereGeometry args={[SUN_RADIUS_UNITS, 128, 128]} />
          <meshStandardMaterial 
            emissive={new Color("#ffb200")} 
            emissiveIntensity={8.0} 
            color="#ffdd99"
            toneMapped={false}
          />
        </mesh>
        {/* Inner glow */}
        <mesh>
          <sphereGeometry args={[SUN_RADIUS_UNITS * 1.2, 64, 64]} />
          <meshBasicMaterial 
            color="#ffb200" 
            transparent 
            opacity={0.3} 
            blending={AdditiveBlending}
            toneMapped={false}
          />
        </mesh>
        {/* Outer glow */}
        <mesh>
          <sphereGeometry args={[SUN_RADIUS_UNITS * 2.0, 64, 64]} />
          <meshBasicMaterial 
            color="#ffb200" 
            transparent 
            opacity={0.08} 
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

      {/* Orbits */}
      <Orbits visible={showOrbits} />

      {/* Planets */}
      <PlanetsGroup
        simDaysRef={simDaysRef}
        showLabels={showLabels}
      />

      {/* Controls - only show when not in free camera or spaceship mode */}
      {cameraMode !== "free" && cameraMode !== "spaceship" && (
        <OrbitControls 
          ref={controlsRef} 
          enableDamping 
          dampingFactor={0.05} 
          minDistance={0.5} 
          maxDistance={1000}
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          zoomSpeed={1.2}
          panSpeed={1.0}
          rotateSpeed={0.8}
          maxPolarAngle={Math.PI}
          minPolarAngle={0}
          target={[0, 0, 0]}
        />
      )}

      {/* Spaceship - only show in spaceship mode */}
      {cameraMode === "spaceship" && (
        <Spaceship 
          position={spaceshipPosition.current} 
          rotation={new Vector3(camera.rotation.x, camera.rotation.y, camera.rotation.z)} 
        />
      )}
      <ambientLight intensity={0.05} />

      {/* Enhanced space postprocessing */}
      <EffectComposer>
        <Bloom 
          mipmapBlur 
          intensity={1.2} 
          luminanceThreshold={0.1} 
          luminanceSmoothing={0.4}
          kernelSize={3}
        />
        <Vignette eskil={false} offset={0.2} darkness={0.6} />
      </EffectComposer>
    </group>
  );
}

function PulsingStar() {
  const ref = useRef<Mesh>(null);
  const pulseSpeed = Math.random() * 2 + 1;
  const baseOpacity = Math.random() * 0.4 + 0.1;
  
  useFrame(({ clock }) => {
    if (ref.current && ref.current.material) {
      const time = clock.getElapsedTime();
      const pulse = Math.sin(time * pulseSpeed) * 0.3 + 0.7;
      (ref.current.material as MeshBasicMaterial).opacity = baseOpacity * pulse;
    }
  });
  
  return (
    <mesh 
      ref={ref}
      position={[
        (Math.random() - 0.5) * 1500,
        (Math.random() - 0.5) * 1500,
        (Math.random() - 0.5) * 1500
      ]}
    >
      <sphereGeometry args={[Math.random() * 0.3 + 0.05, 4, 4]} />
      <meshBasicMaterial 
        color="#ffffff" 
        transparent 
        opacity={baseOpacity}
      />
    </mesh>
  );
}

function DriftingDust() {
  const ref = useRef<Mesh>(null);
  const speed = Math.random() * 0.3 + 0.05;
  const rotationSpeed = Math.random() * 0.01 + 0.005;
  
  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.position.z += speed * delta;
      ref.current.rotation.z += rotationSpeed;
      
      // Reset particle when it goes too far
      if (ref.current.position.z > 800) {
        ref.current.position.z = -800;
        ref.current.position.x = (Math.random() - 0.5) * 1500;
        ref.current.position.y = (Math.random() - 0.5) * 1500;
      }
    }
  });
  
  return (
    <mesh 
      ref={ref}
      position={[
        (Math.random() - 0.5) * 1500,
        (Math.random() - 0.5) * 1500,
        (Math.random() - 0.5) * 1500
      ]}
    >
      <sphereGeometry args={[Math.random() * 0.2 + 0.02, 4, 4]} />
      <meshBasicMaterial 
        color="#ffffff" 
        transparent 
        opacity={Math.random() * 0.2 + 0.05}
      />
    </mesh>
  );
}

function AnimatedCosmicEffects() {
  return (
    <group>
      {/* Pulsing stars */}
      {Array.from({ length: 200 }, (_, i) => (
        <PulsingStar key={`pulse-${i}`} />
      ))}
      
      {/* Drifting cosmic dust */}
      {Array.from({ length: 300 }, (_, i) => (
        <DriftingDust key={`dust-${i}`} />
      ))}
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
        const pos = computePlanetPosition(p, simDaysRef.current);
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
