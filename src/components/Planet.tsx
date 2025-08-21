"use client";
import { memo, useMemo, useRef } from "react";
import { Html } from "@react-three/drei";
import { Vector3, Color, AdditiveBlending, MeshStandardMaterial, Mesh } from "three";
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

// Planet-specific material properties
function getPlanetRoughness(planetName: string): number {
  switch (planetName) {
    case "Mercury": return 0.98; // Extremely rough, heavily cratered surface
    case "Venus": return 0.6; // Cloudy atmosphere, smoother
    case "Earth": return 0.4; // Mixed terrain, oceans and land
    case "Mars": return 0.95; // Very dusty, rocky surface
    case "Jupiter": return 0.1; // Gaseous, very smooth
    case "Saturn": return 0.2; // Gaseous with rings, smooth
    case "Uranus": return 0.3; // Icy, relatively smooth
    case "Neptune": return 0.4; // Icy, stormy
    case "Pluto": return 0.99; // Extremely rough, icy
    default: return 0.7;
  }
}

function getPlanetMetalness(planetName: string): number {
  switch (planetName) {
    case "Mercury": return 0.1; // Rocky
    case "Venus": return 0.0; // Cloudy
    case "Earth": return 0.0; // Rocky/watery
    case "Mars": return 0.05; // Rocky
    case "Jupiter": return 0.0; // Gaseous
    case "Saturn": return 0.0; // Gaseous
    case "Uranus": return 0.0; // Icy
    case "Neptune": return 0.0; // Icy
    case "Pluto": return 0.0; // Icy
    default: return 0.0;
  }
}

function getPlanetEmissive(planetName: string): Color {
  switch (planetName) {
    case "Venus": return new Color("#ff6b35"); // Hot surface glow
    case "Jupiter": return new Color("#ff8c42"); // Internal heat
    case "Saturn": return new Color("#ffd700"); // Golden glow
    case "Uranus": return new Color("#87ceeb"); // Icy blue glow
    case "Neptune": return new Color("#4169e1"); // Deep blue glow
    default: return new Color("#000000");
  }
}

function getPlanetEmissiveIntensity(planetName: string): number {
  switch (planetName) {
    case "Venus": return 0.25; // Hot surface
    case "Jupiter": return 0.3; // Strong internal heat
    case "Saturn": return 0.2; // Moderate heat
    case "Uranus": return 0.15; // Weak heat
    case "Neptune": return 0.2; // Moderate heat
    default: return 0.0;
  }
}

function getAtmosphereColor(planetName: string): Color {
  switch (planetName) {
    case "Venus": return new Color("#ff6b35"); // Thick CO2 atmosphere
    case "Earth": return new Color("#87ceeb"); // Blue atmosphere
    case "Mars": return new Color("#cd853f"); // Dusty atmosphere
    case "Jupiter": return new Color("#ff8c42"); // Ammonia clouds
    case "Saturn": return new Color("#ffd700"); // Golden atmosphere
    case "Uranus": return new Color("#87ceeb"); // Methane atmosphere
    case "Neptune": return new Color("#4169e1"); // Deep blue atmosphere
    default: return new Color("#ffffff");
  }
}

function getAtmosphereOpacity(planetName: string): number {
  switch (planetName) {
    case "Venus": return 0.7; // Very thick atmosphere
    case "Earth": return 0.6; // Moderate atmosphere
    case "Mars": return 0.4; // Thin atmosphere
    case "Jupiter": return 0.8; // Very thick gas atmosphere
    case "Saturn": return 0.7; // Thick gas atmosphere
    case "Uranus": return 0.6; // Moderate gas atmosphere
    case "Neptune": return 0.65; // Thick gas atmosphere
    default: return 0.3;
  }
}

const Planet = ({ data, position, onClick, showLabel }: PlanetProps) => {
  const { selected, hiResTextures } = useUiState();
  const radius = Math.max(0.1, data.radiusKm * KM_TO_UNITS);
  const isSelected = selected === data.name;
  const planetRef = useRef<Mesh>(null);

  // Enhanced materials without textures for now
  // Textures can be added later when available

  // Enhanced planet material with physically-based properties
  const planetMaterial = useMemo(() => {
    const material = new MeshStandardMaterial({
      color: data.color,
      roughness: getPlanetRoughness(data.name),
      metalness: getPlanetMetalness(data.name),
      emissive: getPlanetEmissive(data.name),
      emissiveIntensity: getPlanetEmissiveIntensity(data.name),
    });

    // No textures for now - using enhanced materials only

    return material;
  }, [data.color, data.name]);

  // Atmospheric glow effect
  const atmosphereMaterial = useMemo(() => {
    const atmosphereColor = getAtmosphereColor(data.name);
    return new MeshStandardMaterial({
      color: atmosphereColor,
      transparent: true,
      opacity: getAtmosphereOpacity(data.name),
      blending: AdditiveBlending,
      side: 2, // Double-sided
    });
  }, [data.name]);

  // Cloud layer material
  const cloudMaterial = useMemo(() => {
    return new MeshStandardMaterial({
      color: new Color("#ffffff"),
      transparent: true,
      opacity: 0.4,
      depthWrite: false,
    });
  }, []);

  // Planet rotation
  useFrame((_, delta) => {
    if (planetRef.current) {
      const hoursPerSecond = 24;
      const angularSpeed = (Math.PI * 2) / (Math.abs(data.rotationPeriodHours) / hoursPerSecond);
      planetRef.current.rotation.y += (data.rotationPeriodHours < 0 ? -1 : 1) * angularSpeed * delta * 0.5;
    }
  });

  return (
    <group position={position} rotation={[0, 0, (data.axialTiltDeg * Math.PI) / 180]}>
      {/* Atmospheric glow layer */}
      <mesh scale={isSelected ? 1.2 : 1.05}>
        <sphereGeometry args={[radius * 1.1, 64, 64]} />
        <primitive object={atmosphereMaterial} />
      </mesh>
      
      {/* Cloud layer (for Earth and gas giants) */}
      {(data.name === "Earth" || data.name === "Jupiter" || data.name === "Saturn") && (
        <mesh>
          <sphereGeometry args={[radius * 1.003, 128, 128]} />
          <primitive object={cloudMaterial} />
        </mesh>
      )}
      
      {/* Main planet body */}
      <mesh ref={planetRef} onPointerDown={onClick} scale={isSelected ? 1.15 : 1} castShadow receiveShadow>
        <sphereGeometry args={[radius, hiResTextures ? 256 : 128, hiResTextures ? 256 : 128]} />
        <primitive object={planetMaterial} />
      </mesh>
      
      {/* Enhanced Saturn rings */}
      {data.hasRings && (
        <group>
          {/* Inner ring */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[radius * 1.4, radius * 1.8, 1024]} />
            <meshStandardMaterial
              color="#d4af37"
              transparent
              opacity={0.9}
              side={2}
              roughness={0.2}
              metalness={0.2}
              emissive={new Color("#d4af37")}
              emissiveIntensity={0.1}
            />
          </mesh>
          {/* Middle ring */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[radius * 1.8, radius * 2.0, 1024]} />
            <meshStandardMaterial
              color="#f4e4bc"
              transparent
              opacity={0.7}
              side={2}
              roughness={0.3}
              metalness={0.1}
            />
          </mesh>
          {/* Outer ring */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[radius * 2.0, radius * 2.4, 1024]} />
            <meshStandardMaterial
              color="#e6d19c"
              transparent
              opacity={0.5}
              side={2}
              roughness={0.4}
              metalness={0.05}
            />
          </mesh>
        </group>
      )}
      
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
              border: isSelected ? "2px solid #00ff88" : "1px solid rgba(255,255,255,0.3)",
              boxShadow: isSelected ? "0 0 10px rgba(0,255,136,0.5)" : "none",
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
