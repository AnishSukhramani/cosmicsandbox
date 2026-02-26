"use client";
import { memo, useMemo, useRef, Suspense } from "react";
import { useTexture, Billboard, Text } from "@react-three/drei";
import {
  Vector3,
  Mesh,
  DoubleSide,
  RepeatWrapping,
  SRGBColorSpace,
  AdditiveBlending,
} from "three";
import { useFrame, ThreeEvent } from "@react-three/fiber";
import type { PlanetData } from "@/lib/planets";
import { BODY_KM_TO_UNITS } from "@/lib/planets";
import { useUiState } from "@/components/state";

export interface PlanetProps {
  data: PlanetData;
  position?: Vector3;
  onClick?: () => void;
  showLabel?: boolean;
}

const PLANET_W = 32;
const PLANET_H = 16;

function getAtmosphereColor(name: string): string {
  switch (name) {
    case "Venus": return "#cc9944";
    case "Earth": return "#4488ff";
    case "Mars": return "#cc7744";
    case "Jupiter": return "#cc9944";
    case "Saturn": return "#ccaa55";
    case "Uranus": return "#66bbcc";
    case "Neptune": return "#4466ff";
    default: return "";
  }
}

function TexturedPlanetBody({
  data,
  radius,
  isSelected,
  onClick,
}: {
  data: PlanetData;
  radius: number;
  isSelected: boolean;
  onClick?: (e: ThreeEvent<PointerEvent>) => void;
}) {
  const planetRef = useRef<Mesh>(null);

  const texturePaths: string[] = [data.texture];
  if (data.cloudMap) texturePaths.push(data.cloudMap);

  const textures = useTexture(texturePaths);
  const mainTexture = Array.isArray(textures) ? textures[0] : textures;
  const cloudTexture =
    data.cloudMap && Array.isArray(textures) ? textures[1] : null;

  useMemo(() => {
    if (mainTexture) mainTexture.colorSpace = SRGBColorSpace;
    if (cloudTexture) {
      cloudTexture.wrapS = RepeatWrapping;
      cloudTexture.wrapT = RepeatWrapping;
    }
  }, [mainTexture, cloudTexture]);

  const cloudRef = useRef<Mesh>(null);

  // Rotation is tied to the simulation time scale from state.
  // At daysPerSecond=1, 1 real second = 1 sim day. A planet with
  // rotationPeriodHours=24 should do 1 full turn per second at that rate.
  const daysPerSecond = useUiState.getState().daysPerSecond;
  const paused = useUiState.getState().paused;

  useFrame((_, delta) => {
    if (paused) return;
    const simDaysDelta = delta * daysPerSecond;
    if (planetRef.current) {
      const rotationsPerDay = 24 / Math.abs(data.rotationPeriodHours);
      const angleThisFrame = simDaysDelta * rotationsPerDay * Math.PI * 2;
      planetRef.current.rotation.y +=
        (data.rotationPeriodHours < 0 ? -1 : 1) * angleThisFrame;
    }
    if (cloudRef.current) {
      cloudRef.current.rotation.y += delta * 0.02;
    }
  });

  return (
    <>
      <mesh
        ref={planetRef}
        onPointerDown={onClick}
        scale={isSelected ? 1.08 : 1}
      >
        <sphereGeometry args={[radius, PLANET_W, PLANET_H]} />
        <meshBasicMaterial map={mainTexture} />
      </mesh>

      {cloudTexture && (
        <mesh ref={cloudRef} scale={isSelected ? 1.08 : 1}>
          <sphereGeometry args={[radius * 1.005, PLANET_W, PLANET_H]} />
          <meshBasicMaterial
            map={cloudTexture}
            transparent
            opacity={data.name === "Venus" ? 0.9 : 0.4}
            depthWrite={false}
            side={DoubleSide}
          />
        </mesh>
      )}
    </>
  );
}

function FallbackPlanetBody({
  data,
  radius,
  isSelected,
  onClick,
}: {
  data: PlanetData;
  radius: number;
  isSelected: boolean;
  onClick?: (e: ThreeEvent<PointerEvent>) => void;
}) {
  const planetRef = useRef<Mesh>(null);

  useFrame((_, delta) => {
    if (useUiState.getState().paused) return;
    const simDaysDelta = delta * useUiState.getState().daysPerSecond;
    if (planetRef.current) {
      const rotationsPerDay = 24 / Math.abs(data.rotationPeriodHours);
      planetRef.current.rotation.y +=
        (data.rotationPeriodHours < 0 ? -1 : 1) * simDaysDelta * rotationsPerDay * Math.PI * 2;
    }
  });

  return (
    <mesh
      ref={planetRef}
      onPointerDown={onClick}
      scale={isSelected ? 1.08 : 1}
    >
      <sphereGeometry args={[radius, 24, 12]} />
      <meshBasicMaterial color={data.color} />
    </mesh>
  );
}

const RING_SEGS = 64;

function SaturnRings({ radius }: { radius: number }) {
  return (
    <group rotation={[Math.PI / 2, 0, 0]}>
      <mesh>
        <ringGeometry args={[radius * 1.3, radius * 1.7, RING_SEGS]} />
        <meshBasicMaterial
          color="#c8a86e"
          transparent
          opacity={0.8}
          side={DoubleSide}
        />
      </mesh>
      <mesh>
        <ringGeometry args={[radius * 1.75, radius * 2.05, RING_SEGS]} />
        <meshBasicMaterial
          color="#d4b67a"
          transparent
          opacity={0.65}
          side={DoubleSide}
        />
      </mesh>
      <mesh>
        <ringGeometry args={[radius * 1.7, radius * 1.75, RING_SEGS]} />
        <meshBasicMaterial
          color="#1a1510"
          transparent
          opacity={0.8}
          side={DoubleSide}
        />
      </mesh>
    </group>
  );
}

const Planet = ({ data, position, onClick, showLabel }: PlanetProps) => {
  const { selected } = useUiState();
  const radius = Math.max(0.02, data.radiusKm * BODY_KM_TO_UNITS);
  const isSelected = selected === data.name;
  const atmoColor = getAtmosphereColor(data.name);

  return (
    <group
      position={position}
      rotation={[0, 0, (data.axialTiltDeg * Math.PI) / 180]}
    >
      {/* Simple atmosphere glow */}
      {atmoColor && (
        <mesh scale={isSelected ? 1.1 : 1.03}>
          <sphereGeometry args={[radius * 1.1, 16, 8]} />
          <meshBasicMaterial
            color={atmoColor}
            transparent
            opacity={0.15}
            blending={AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      )}

      <Suspense
        fallback={
          <FallbackPlanetBody
            data={data}
            radius={radius}
            isSelected={isSelected}
            onClick={onClick}
          />
        }
      >
        <TexturedPlanetBody
          data={data}
          radius={radius}
          isSelected={isSelected}
          onClick={onClick}
        />
      </Suspense>

      {data.hasRings && <SaturnRings radius={radius} />}

      {/* WebGL text label instead of DOM Html overlay — avoids per-frame layout/paint */}
      {showLabel && (
        <Billboard position={[0, radius * 2.5, 0]}>
          <Text
            fontSize={0.3}
            color="white"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.02}
            outlineColor="#000000"
          >
            {data.name}
          </Text>
        </Billboard>
      )}
    </group>
  );
};

export default memo(Planet);
