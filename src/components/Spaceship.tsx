import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Mesh, Vector3 } from "three";

interface SpaceshipProps {
  position: Vector3;
  rotation: Vector3;
}

const Spaceship = ({ position, rotation }: SpaceshipProps) => {
  const shipRef = useRef<Mesh>(null);

  useFrame(() => {
    if (shipRef.current) {
      shipRef.current.position.copy(position);
      shipRef.current.rotation.set(rotation.x, rotation.y, rotation.z);
    }
  });

  return (
    <group ref={shipRef}>
      {/* Main fuselage - sleek design */}
      <mesh castShadow>
        <cylinderGeometry args={[0.04, 0.12, 1.2, 16]} />
        <meshStandardMaterial 
          color="#1a1a2e" 
          metalness={0.9} 
          roughness={0.1}
          envMapIntensity={1.2}
        />
      </mesh>
      
      {/* Secondary body detail */}
      <mesh position={[0, 0, 0.1]} castShadow>
        <cylinderGeometry args={[0.06, 0.04, 0.9, 16]} />
        <meshStandardMaterial 
          color="#16213e" 
          metalness={0.8} 
          roughness={0.2}
        />
      </mesh>
      
      {/* Nose cone - aerodynamic */}
      <mesh position={[0, 0, 0.7]} castShadow>
        <coneGeometry args={[0.04, 0.4, 16]} />
        <meshStandardMaterial 
          color="#0f3460" 
          metalness={0.95} 
          roughness={0.05}
        />
      </mesh>
      
      {/* Main wings - swept back design */}
      <mesh position={[0.45, 0, 0]} rotation={[0, 0, -0.3]} castShadow>
        <boxGeometry args={[1.1, 0.015, 0.6]} />
        <meshStandardMaterial 
          color="#1a1a2e" 
          metalness={0.8} 
          roughness={0.2}
        />
      </mesh>
      <mesh position={[-0.45, 0, 0]} rotation={[0, 0, 0.3]} castShadow>
        <boxGeometry args={[1.1, 0.015, 0.6]} />
        <meshStandardMaterial 
          color="#1a1a2e" 
          metalness={0.8} 
          roughness={0.2}
        />
      </mesh>
      
      {/* Vertical stabilizers */}
      <mesh position={[0, 0.2, -0.25]} castShadow>
        <boxGeometry args={[0.01, 0.4, 0.3]} />
        <meshStandardMaterial 
          color="#16213e" 
          metalness={0.7} 
          roughness={0.3}
        />
      </mesh>
      <mesh position={[0, -0.2, -0.25]} castShadow>
        <boxGeometry args={[0.01, 0.4, 0.3]} />
        <meshStandardMaterial 
          color="#16213e" 
          metalness={0.7} 
          roughness={0.3}
        />
      </mesh>
      
      {/* Cockpit - modern design */}
      <mesh position={[0, 0.025, 0.2]} castShadow>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial 
          color="#e94560" 
          transparent 
          opacity={0.3} 
          metalness={0.95} 
          roughness={0.05}
          envMapIntensity={2}
        />
      </mesh>
      
      {/* Cockpit frame */}
      <mesh position={[0, 0.025, 0.2]} castShadow>
        <torusGeometry args={[0.12, 0.01, 8, 16]} />
        <meshStandardMaterial 
          color="#533483" 
          metalness={0.9} 
          roughness={0.1}
        />
      </mesh>
      
      {/* Engine nacelles */}
      <mesh position={[0.15, 0, -0.6]} castShadow>
        <cylinderGeometry args={[0.04, 0.06, 0.4, 12]} />
        <meshStandardMaterial 
          color="#533483" 
          metalness={0.8} 
          roughness={0.2}
        />
      </mesh>
      <mesh position={[-0.15, 0, -0.6]} castShadow>
        <cylinderGeometry args={[0.04, 0.06, 0.4, 12]} />
        <meshStandardMaterial 
          color="#533483" 
          metalness={0.8} 
          roughness={0.2}
        />
      </mesh>
      
      {/* Engine glow - blue plasma */}
      <mesh position={[0.15, 0, -0.8]}>
        <sphereGeometry args={[0.06, 12, 12]} />
        <meshStandardMaterial 
          color="#00d4ff" 
          emissive="#00d4ff" 
          emissiveIntensity={3}
          toneMapped={false}
        />
      </mesh>
      <mesh position={[-0.15, 0, -0.8]}>
        <sphereGeometry args={[0.06, 12, 12]} />
        <meshStandardMaterial 
          color="#00d4ff" 
          emissive="#00d4ff" 
          emissiveIntensity={3}
          toneMapped={false}
        />
      </mesh>
      
      {/* Thruster exhaust - ion blue */}
      <mesh position={[0.15, 0, -0.9]}>
        <coneGeometry args={[0.04, 0.6, 12]} />
        <meshStandardMaterial 
          color="#0099ff" 
          emissive="#0099ff" 
          emissiveIntensity={2}
          transparent
          opacity={0.8}
          toneMapped={false}
        />
      </mesh>
      <mesh position={[-0.15, 0, -0.9]}>
        <coneGeometry args={[0.04, 0.6, 12]} />
        <meshStandardMaterial 
          color="#0099ff" 
          emissive="#0099ff" 
          emissiveIntensity={2}
          transparent
          opacity={0.8}
          toneMapped={false}
        />
      </mesh>
      
      {/* Weapon hardpoints */}
      <mesh position={[0.3, 0, 0.1]} castShadow>
        <boxGeometry args={[0.15, 0.025, 0.15]} />
        <meshStandardMaterial 
          color="#2d142c" 
          metalness={0.9} 
          roughness={0.1}
        />
      </mesh>
      <mesh position={[-0.3, 0, 0.1]} castShadow>
        <boxGeometry args={[0.15, 0.025, 0.15]} />
        <meshStandardMaterial 
          color="#2d142c" 
          metalness={0.9} 
          roughness={0.1}
        />
      </mesh>
      
      {/* Energy shield effect */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.75, 16, 16]} />
        <meshStandardMaterial 
          color="#00d4ff" 
          transparent 
          opacity={0.05} 
          emissive="#00d4ff"
          emissiveIntensity={0.1}
        />
      </mesh>
    </group>
  );
};

export default Spaceship;
