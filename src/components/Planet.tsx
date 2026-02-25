"use client";
import { memo, useMemo, useRef, Suspense } from "react";
import { Html, useTexture } from "@react-three/drei";
import {
  Vector3,
  Color,
  Mesh,
  FrontSide,
  DoubleSide,
  RepeatWrapping,
  SRGBColorSpace,
  ShaderMaterial,
} from "three";
import { useFrame } from "@react-three/fiber";
import type { PlanetData } from "@/lib/planets";
import { KM_TO_UNITS } from "@/lib/planets";
import { useUiState } from "@/components/state";

export interface PlanetProps {
  data: PlanetData;
  position?: Vector3;
  onClick?: () => void;
  showLabel?: boolean;
}

const atmosphereVertexShader = `
  varying vec3 vNormal;
  varying vec3 vPosition;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const atmosphereFragmentShader = `
  uniform vec3 uColor;
  uniform float uIntensity;
  varying vec3 vNormal;
  varying vec3 vPosition;
  void main() {
    vec3 viewDir = normalize(-vPosition);
    float fresnel = 1.0 - dot(viewDir, vNormal);
    fresnel = pow(fresnel, 3.0) * uIntensity;
    gl_FragColor = vec4(uColor, fresnel);
  }
`;

function getAtmosphereColor(planetName: string): Color {
  switch (planetName) {
    case "Venus": return new Color(1.0, 0.75, 0.4);
    case "Earth": return new Color(0.3, 0.6, 1.0);
    case "Mars": return new Color(0.9, 0.5, 0.3);
    case "Jupiter": return new Color(0.9, 0.7, 0.4);
    case "Saturn": return new Color(0.9, 0.8, 0.5);
    case "Uranus": return new Color(0.5, 0.8, 0.9);
    case "Neptune": return new Color(0.3, 0.4, 1.0);
    default: return new Color(0.5, 0.5, 0.5);
  }
}

function getAtmosphereIntensity(planetName: string): number {
  switch (planetName) {
    case "Venus": return 1.5;
    case "Earth": return 1.2;
    case "Mars": return 0.6;
    case "Jupiter": return 1.0;
    case "Saturn": return 0.8;
    case "Uranus": return 0.9;
    case "Neptune": return 1.1;
    default: return 0.0;
  }
}

function getPlanetRoughness(planetName: string): number {
  switch (planetName) {
    case "Mercury": return 0.95;
    case "Venus": return 0.7;
    case "Earth": return 0.6;
    case "Mars": return 0.9;
    case "Jupiter": return 0.3;
    case "Saturn": return 0.4;
    case "Uranus": return 0.5;
    case "Neptune": return 0.5;
    case "Pluto": return 0.95;
    default: return 0.7;
  }
}

function getPlanetMetalness(planetName: string): number {
  switch (planetName) {
    case "Mercury": return 0.1;
    default: return 0.0;
  }
}

// Sphere segment counts — lower = faster, still looks good
const PLANET_SEGMENTS = 48;
const PLANET_RINGS = 24;
const ATMO_SEGMENTS = 32;
const ATMO_RINGS = 16;

function TexturedPlanetBody({
  data,
  radius,
  isSelected,
  onClick,
}: {
  data: PlanetData;
  radius: number;
  isSelected: boolean;
  onClick?: () => void;
}) {
  const planetRef = useRef<Mesh>(null);

  const texturePaths: string[] = [data.texture];
  if (data.cloudMap) texturePaths.push(data.cloudMap);
  if (data.nightMap) texturePaths.push(data.nightMap);

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

  useFrame((_, delta) => {
    if (planetRef.current) {
      const angularSpeed =
        (Math.PI * 2) / (Math.abs(data.rotationPeriodHours) / 24);
      planetRef.current.rotation.y +=
        (data.rotationPeriodHours < 0 ? -1 : 1) * angularSpeed * delta * 0.5;
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
        <sphereGeometry args={[radius, PLANET_SEGMENTS, PLANET_RINGS]} />
        <meshStandardMaterial
          map={mainTexture}
          roughness={getPlanetRoughness(data.name)}
          metalness={getPlanetMetalness(data.name)}
        />
      </mesh>

      {cloudTexture && (
        <mesh ref={cloudRef} scale={isSelected ? 1.08 : 1}>
          <sphereGeometry args={[radius * 1.005, PLANET_SEGMENTS, PLANET_RINGS]} />
          <meshStandardMaterial
            map={cloudTexture}
            transparent
            opacity={data.name === "Venus" ? 0.95 : 0.45}
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
  onClick?: () => void;
}) {
  const planetRef = useRef<Mesh>(null);

  useFrame((_, delta) => {
    if (planetRef.current) {
      const angularSpeed =
        (Math.PI * 2) / (Math.abs(data.rotationPeriodHours) / 24);
      planetRef.current.rotation.y +=
        (data.rotationPeriodHours < 0 ? -1 : 1) * angularSpeed * delta * 0.5;
    }
  });

  return (
    <mesh
      ref={planetRef}
      onPointerDown={onClick}
      scale={isSelected ? 1.08 : 1}
    >
      <sphereGeometry args={[radius, 32, 16]} />
      <meshStandardMaterial
        color={data.color}
        roughness={getPlanetRoughness(data.name)}
        metalness={getPlanetMetalness(data.name)}
      />
    </mesh>
  );
}

// Saturn rings using cheap MeshBasicMaterial and lower segment count
const RING_SEGMENTS = 96;

function SaturnRings({ radius }: { radius: number }) {
  return (
    <group rotation={[Math.PI / 2, 0, 0]}>
      {/* B Ring */}
      <mesh>
        <ringGeometry args={[radius * 1.3, radius * 1.7, RING_SEGMENTS]} />
        <meshBasicMaterial
          color="#c8a86e"
          transparent
          opacity={0.8}
          side={DoubleSide}
        />
      </mesh>
      {/* A Ring */}
      <mesh>
        <ringGeometry args={[radius * 1.75, radius * 2.05, RING_SEGMENTS]} />
        <meshBasicMaterial
          color="#d4b67a"
          transparent
          opacity={0.65}
          side={DoubleSide}
        />
      </mesh>
      {/* Cassini Division */}
      <mesh>
        <ringGeometry args={[radius * 1.7, radius * 1.75, RING_SEGMENTS]} />
        <meshBasicMaterial
          color="#1a1510"
          transparent
          opacity={0.85}
          side={DoubleSide}
        />
      </mesh>
      {/* C Ring */}
      <mesh>
        <ringGeometry args={[radius * 1.15, radius * 1.3, RING_SEGMENTS]} />
        <meshBasicMaterial
          color="#a08550"
          transparent
          opacity={0.25}
          side={DoubleSide}
        />
      </mesh>
    </group>
  );
}

const Planet = ({ data, position, onClick, showLabel }: PlanetProps) => {
  const { selected } = useUiState();
  const radius = Math.max(0.1, data.radiusKm * KM_TO_UNITS);
  const isSelected = selected === data.name;

  const atmosphereColor = getAtmosphereColor(data.name);
  const atmosphereIntensity = getAtmosphereIntensity(data.name);

  const atmosphereMaterial = useMemo(() => {
    if (atmosphereIntensity <= 0) return null;
    return new ShaderMaterial({
      vertexShader: atmosphereVertexShader,
      fragmentShader: atmosphereFragmentShader,
      uniforms: {
        uColor: { value: atmosphereColor },
        uIntensity: { value: atmosphereIntensity },
      },
      transparent: true,
      side: FrontSide,
      depthWrite: false,
    });
  }, [atmosphereColor, atmosphereIntensity]);

  return (
    <group
      position={position}
      rotation={[0, 0, (data.axialTiltDeg * Math.PI) / 180]}
    >
      {/* Atmosphere glow */}
      {atmosphereMaterial && (
        <mesh scale={isSelected ? 1.12 : 1.04}>
          <sphereGeometry args={[radius * 1.12, ATMO_SEGMENTS, ATMO_RINGS]} />
          <primitive object={atmosphereMaterial} />
        </mesh>
      )}

      {/* Planet body */}
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

      {/* Saturn rings */}
      {data.hasRings && <SaturnRings radius={radius} />}

      {/* Planet label */}
      {showLabel && (
        <Html center distanceFactor={10} style={{ pointerEvents: "none" }}>
          <div
            style={{
              background: "rgba(0,0,0,0.7)",
              color: "white",
              padding: "4px 8px",
              borderRadius: 8,
              fontSize: 14,
              fontWeight: "bold",
              whiteSpace: "nowrap",
              transform: "translateY(-8px)",
              border: isSelected
                ? "2px solid #00ff88"
                : "1px solid rgba(255,255,255,0.3)",
              boxShadow: isSelected
                ? "0 0 10px rgba(0,255,136,0.5)"
                : "none",
            }}
          >
            {data.name}
          </div>
        </Html>
      )}
    </group>
  );
};

export default memo(Planet);
