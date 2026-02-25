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
  position: Vector3;
  onClick?: () => void;
  showLabel?: boolean;
}

// Atmosphere Fresnel shader for realistic glow
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

/** Inner component that loads and applies the real texture */
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
  const cloudTexture = data.cloudMap && Array.isArray(textures) ? textures[1] : null;

  useMemo(() => {
    if (mainTexture) {
      mainTexture.colorSpace = SRGBColorSpace;
    }
    if (cloudTexture) {
      cloudTexture.wrapS = RepeatWrapping;
      cloudTexture.wrapT = RepeatWrapping;
    }
  }, [mainTexture, cloudTexture]);

  const cloudRef = useRef<Mesh>(null);

  useFrame((_, delta) => {
    if (planetRef.current) {
      const hoursPerSecond = 24;
      const angularSpeed =
        (Math.PI * 2) / (Math.abs(data.rotationPeriodHours) / hoursPerSecond);
      planetRef.current.rotation.y +=
        (data.rotationPeriodHours < 0 ? -1 : 1) * angularSpeed * delta * 0.5;
    }
    if (cloudRef.current) {
      cloudRef.current.rotation.y += delta * 0.02;
    }
  });

  return (
    <>
      {/* Main planet body with texture */}
      <mesh
        ref={planetRef}
        onPointerDown={onClick}
        scale={isSelected ? 1.08 : 1}
        castShadow
        receiveShadow
      >
        <sphereGeometry args={[radius, 128, 64]} />
        <meshStandardMaterial
          map={mainTexture}
          roughness={getPlanetRoughness(data.name)}
          metalness={getPlanetMetalness(data.name)}
        />
      </mesh>

      {/* Cloud layer */}
      {cloudTexture && (
        <mesh ref={cloudRef} scale={isSelected ? 1.08 : 1}>
          <sphereGeometry args={[radius * 1.005, 128, 64]} />
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

/** Fallback: solid-color planet when textures haven't loaded yet */
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
      const hoursPerSecond = 24;
      const angularSpeed =
        (Math.PI * 2) / (Math.abs(data.rotationPeriodHours) / hoursPerSecond);
      planetRef.current.rotation.y +=
        (data.rotationPeriodHours < 0 ? -1 : 1) * angularSpeed * delta * 0.5;
    }
  });

  return (
    <mesh
      ref={planetRef}
      onPointerDown={onClick}
      scale={isSelected ? 1.08 : 1}
      castShadow
      receiveShadow
    >
      <sphereGeometry args={[radius, 64, 32]} />
      <meshStandardMaterial
        color={data.color}
        roughness={getPlanetRoughness(data.name)}
        metalness={getPlanetMetalness(data.name)}
      />
    </mesh>
  );
}

/** Saturn ring with real texture or gradient fallback */
function SaturnRings({
  radius,
}: {
  radius: number;
}) {
  return (
    <group rotation={[Math.PI / 2, 0, 0]}>
      {/* B Ring (bright inner) */}
      <mesh>
        <ringGeometry args={[radius * 1.3, radius * 1.7, 256]} />
        <meshStandardMaterial
          color="#c8a86e"
          transparent
          opacity={0.85}
          side={DoubleSide}
          roughness={0.6}
        />
      </mesh>
      {/* A Ring (middle) */}
      <mesh>
        <ringGeometry args={[radius * 1.75, radius * 2.05, 256]} />
        <meshStandardMaterial
          color="#d4b67a"
          transparent
          opacity={0.7}
          side={DoubleSide}
          roughness={0.5}
        />
      </mesh>
      {/* Cassini Division (dark gap) */}
      <mesh>
        <ringGeometry args={[radius * 1.7, radius * 1.75, 256]} />
        <meshStandardMaterial
          color="#2a2015"
          transparent
          opacity={0.9}
          side={DoubleSide}
        />
      </mesh>
      {/* C Ring (faint inner) */}
      <mesh>
        <ringGeometry args={[radius * 1.15, radius * 1.3, 256]} />
        <meshStandardMaterial
          color="#a08550"
          transparent
          opacity={0.3}
          side={DoubleSide}
          roughness={0.8}
        />
      </mesh>
      {/* F Ring (thin outer) */}
      <mesh>
        <ringGeometry args={[radius * 2.08, radius * 2.12, 256]} />
        <meshStandardMaterial
          color="#b09060"
          transparent
          opacity={0.4}
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
      {/* Atmosphere glow (Fresnel shader) */}
      {atmosphereMaterial && (
        <mesh scale={isSelected ? 1.12 : 1.04}>
          <sphereGeometry args={[radius * 1.12, 64, 32]} />
          <primitive object={atmosphereMaterial} />
        </mesh>
      )}

      {/* Planet body with real texture (Suspense fallback to solid color) */}
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
