"use client";
import { memo, useRef, Suspense, useMemo } from "react";
import { useTexture, Billboard, Text } from "@react-three/drei";
import { Mesh, SRGBColorSpace, Group } from "three";
import { useFrame } from "@react-three/fiber";
import type { MoonData } from "@/lib/moons";
import { MOON_BODY_SCALE, computeMoonPosition } from "@/lib/moons";

interface MoonComponentProps {
  moon: MoonData;
  simDaysRef: React.MutableRefObject<number>;
  showLabel: boolean;
}

function TexturedMoonBody({ moon, radius }: { moon: MoonData; radius: number }) {
  const meshRef = useRef<Mesh>(null);
  const texture = useTexture(moon.texture!);
  useMemo(() => { texture.colorSpace = SRGBColorSpace; }, [texture]);

  useFrame((_, delta) => {
    if (meshRef.current) meshRef.current.rotation.y += delta * 0.1;
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[radius, 16, 8]} />
      <meshBasicMaterial map={texture} />
    </mesh>
  );
}

function ColorMoonBody({ moon, radius }: { moon: MoonData; radius: number }) {
  const meshRef = useRef<Mesh>(null);
  useFrame((_, delta) => {
    if (meshRef.current) meshRef.current.rotation.y += delta * 0.1;
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[radius, 12, 6]} />
      <meshBasicMaterial color={moon.color} />
    </mesh>
  );
}

const MoonComponent = ({ moon, simDaysRef, showLabel }: MoonComponentProps) => {
  const radius = Math.max(0.01, moon.radiusKm * MOON_BODY_SCALE);
  const groupRef = useRef<Group>(null);

  useFrame(() => {
    if (groupRef.current) {
      const [x, y, z] = computeMoonPosition(moon, simDaysRef.current);
      groupRef.current.position.set(x, y, z);
    }
  });

  return (
    <group ref={groupRef}>
      {moon.texture ? (
        <Suspense fallback={<ColorMoonBody moon={moon} radius={radius} />}>
          <TexturedMoonBody moon={moon} radius={radius} />
        </Suspense>
      ) : (
        <ColorMoonBody moon={moon} radius={radius} />
      )}
      {showLabel && (
        <Billboard position={[0, radius * 3, 0]}>
          <Text
            fontSize={0.12}
            color="#aaaacc"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.01}
            outlineColor="#000000"
          >
            {moon.name}
          </Text>
        </Billboard>
      )}
    </group>
  );
};

export default memo(MoonComponent);
