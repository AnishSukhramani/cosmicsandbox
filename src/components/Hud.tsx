"use client";
import { useMemo, useEffect, useState } from "react";
import { useUiState } from "@/components/state";
import { PLANETS, daysSinceJ2000 } from "@/lib/planets";
import type { PlanetName } from "@/lib/planets";

function SimulationDate({ daysPerSecond, paused }: { daysPerSecond: number; paused: boolean }) {
  const [simDays, setSimDays] = useState(daysSinceJ2000());

  useEffect(() => {
    if (paused) return;
    const interval = setInterval(() => {
      setSimDays((d) => d + (daysPerSecond * 0.1));
    }, 100);
    return () => clearInterval(interval);
  }, [daysPerSecond, paused]);

  const date = useMemo(() => {
    const j2000Ms = Date.UTC(2000, 0, 1, 12, 0, 0);
    const d = new Date(j2000Ms + simDays * 86_400_000);
    return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  }, [simDays]);

  return <span className="font-mono text-[11px] text-cyan-300/80">{date}</span>;
}

export default function Hud() {
  const {
    selected, showOrbits, showLabels, paused, daysPerSecond,
    cameraMode, freeCameraSpeed,
    setSelected, toggleLabels, toggleOrbits, togglePaused,
    setDaysPerSecond, toggleCameraMode, resetCamera, setFreeCameraSpeed,
  } = useUiState();

  const planet = useMemo(() => PLANETS.find((p) => p.name === selected) ?? null, [selected]);

  return (
    <div className="pointer-events-auto absolute inset-x-0 top-0 p-3 flex flex-col gap-2 text-white select-none">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-base font-bold tracking-wide">Cosmic Sandbox</span>
          <SimulationDate daysPerSecond={daysPerSecond} paused={paused} />
          <div className={`px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider ${
            cameraMode === "free" ? "bg-blue-500/60" : cameraMode === "spaceship" ? "bg-purple-500/60" : "bg-emerald-500/60"
          }`}>
            {cameraMode === "free" ? "Free Cam" : cameraMode === "follow" ? "Follow" : "Ship"}
          </div>
        </div>

        {/* Controls bar */}
        <div className="flex items-center gap-2 bg-black/50 backdrop-blur-md rounded-lg px-3 py-1.5 border border-white/10">
          <label className="flex items-center gap-1.5 text-[10px] cursor-pointer">
            <input type="checkbox" checked={showOrbits} onChange={toggleOrbits} className="w-3 h-3 accent-cyan-400" />
            Orbits
          </label>
          <label className="flex items-center gap-1.5 text-[10px] cursor-pointer">
            <input type="checkbox" checked={showLabels} onChange={toggleLabels} className="w-3 h-3 accent-cyan-400" />
            Labels
          </label>
          <div className="w-px h-4 bg-white/20" />
          <label className="flex items-center gap-1.5 text-[10px] cursor-pointer">
            <input type="checkbox" checked={paused} onChange={togglePaused} className="w-3 h-3 accent-amber-400" />
            Pause
          </label>
          <div className="flex items-center gap-1.5 text-[10px]">
            <span className="opacity-60">Speed</span>
            <input
              type="range" min={1} max={365} value={daysPerSecond}
              onChange={(e) => setDaysPerSecond(Number(e.target.value))}
              className="w-20 h-1 accent-cyan-400"
            />
            <span className="font-mono w-12 text-right text-cyan-300/80">{daysPerSecond} d/s</span>
          </div>
          <div className="w-px h-4 bg-white/20" />
          <button onClick={toggleCameraMode}
            className="px-2 py-0.5 rounded text-[10px] bg-white/10 hover:bg-white/20 transition-colors">
            {cameraMode === "free" ? "Free" : cameraMode === "follow" ? "Follow" : "Ship"}
          </button>
          <button onClick={resetCamera}
            className="px-2 py-0.5 rounded text-[10px] bg-white/10 hover:bg-white/20 transition-colors">
            Reset
          </button>
          {(cameraMode === "free" || cameraMode === "spaceship") && (
            <div className="flex items-center gap-1 text-[10px]">
              <input
                type="range" min={10} max={200} value={freeCameraSpeed}
                onChange={(e) => setFreeCameraSpeed(Number(e.target.value))}
                className="w-14 h-1 accent-cyan-400"
              />
              <span className="font-mono w-6 text-right opacity-60">{freeCameraSpeed}</span>
            </div>
          )}
        </div>
      </div>

      {/* Planet info panel */}
      {planet && (
        <div className="self-start bg-black/50 backdrop-blur-md rounded-xl p-3 border border-white/10 max-w-xs">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-9 w-9 rounded-full overflow-hidden ring-1 ring-white/20 shrink-0">
              {planet.texture ? (
                <img src={planet.texture} alt={planet.name} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full bg-gray-700 flex items-center justify-center text-[10px] text-white/60">
                  {planet.name.charAt(0)}
                </div>
              )}
            </div>
            <div>
              <select
                className="bg-transparent text-sm font-semibold appearance-none cursor-pointer outline-none"
                value={planet.name}
                onChange={(e) => setSelected(e.target.value as PlanetName)}
              >
                {PLANETS.map((p) => (
                  <option key={p.name} value={p.name} className="bg-gray-900">{p.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-[10px]">
            <div><span className="opacity-50">Radius</span> <span className="font-mono">{planet.radiusKm.toLocaleString()}</span> <span className="opacity-40">km</span></div>
            <div><span className="opacity-50">Orbit</span> <span className="font-mono">{planet.semiMajorAxisAU}</span> <span className="opacity-40">AU</span></div>
            <div><span className="opacity-50">Year</span> <span className="font-mono">{planet.orbitalPeriodDays.toLocaleString()}</span> <span className="opacity-40">d</span></div>
            <div><span className="opacity-50">Day</span> <span className="font-mono">{Math.abs(planet.rotationPeriodHours).toFixed(1)}</span> <span className="opacity-40">h</span></div>
            <div><span className="opacity-50">Tilt</span> <span className="font-mono">{planet.axialTiltDeg.toFixed(1)}°</span></div>
            <div><span className="opacity-50">Incl.</span> <span className="font-mono">{planet.inclinationDeg.toFixed(2)}°</span></div>
          </div>
        </div>
      )}

      {/* Crosshair */}
      {(cameraMode === "free" || cameraMode === "spaceship") && (
        <div className="fixed inset-0 pointer-events-none flex items-center justify-center">
          <div className="w-4 h-4 border border-white/40 rounded-full flex items-center justify-center">
            <div className="w-0.5 h-0.5 bg-white/60 rounded-full" />
          </div>
        </div>
      )}
    </div>
  );
}
