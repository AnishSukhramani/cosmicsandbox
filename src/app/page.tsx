"use client";
import { Canvas } from "@react-three/fiber";
import SolarSystem from "@/components/SolarSystem";
import Hud from "@/components/Hud";

export default function Home() {
  return (
    <div className="relative h-[100svh] w-screen overflow-hidden bg-black">
      <Canvas camera={{ position: [30, 18, 30], fov: 45 }} shadows>
        <SolarSystem />
      </Canvas>
      <div className="pointer-events-none">
        <Hud />
      </div>
    </div>
  );
}
