"use client";
import { Canvas } from "@react-three/fiber";
import SolarSystem from "@/components/SolarSystem";
import Hud from "@/components/Hud";

export default function Home() {
  return (
    <div className="relative h-[100svh] w-screen overflow-hidden bg-black">
      <Canvas
        camera={{ position: [25, 15, 25], fov: 50, near: 0.01, far: 5000 }}
        dpr={[0.75, 1]}
        performance={{ min: 0.5 }}
        gl={{
          antialias: false,
          powerPreference: "high-performance",
          stencil: false,
          depth: true,
        }}
      >
        <SolarSystem />
      </Canvas>
      <div className="pointer-events-none">
        <Hud />
      </div>
    </div>
  );
}
