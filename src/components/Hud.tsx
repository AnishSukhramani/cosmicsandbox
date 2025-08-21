"use client";
import { useMemo } from "react";
import { useUiState } from "@/components/state";
import { PLANETS } from "@/lib/planets";
import type { PlanetName } from "@/lib/planets";

export default function Hud() {
  const {
    selected,
    showOrbits,
    showLabels,
    paused,
    daysPerSecond,
    hiResTextures,
    cameraMode,
    freeCameraSpeed,
    setSelected,
    toggleLabels,
    toggleOrbits,
    togglePaused,
    setDaysPerSecond,
    toggleHiResTextures,
    toggleCameraMode,
    resetCamera,
    setFreeCameraSpeed,
  } = useUiState();

  const planet = useMemo(() => PLANETS.find((p) => p.name === selected) ?? null, [selected]);

  return (
    <div className="pointer-events-auto absolute inset-x-0 top-0 p-4 flex flex-col gap-3 text-white">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-lg font-semibold">Solar 3D</span>
          <span className="text-xs opacity-70">(click a planet to focus)</span>
          <div className={`px-2 py-1 rounded text-xs ${
            cameraMode === "free" 
              ? "bg-blue-600/80 text-white" 
              : "bg-green-600/80 text-white"
          }`}>
            {cameraMode === "free" ? "Free Camera" : "Follow Mode"}
          </div>
          {cameraMode === "free" && (
            <div className="px-2 py-1 rounded text-xs bg-yellow-600/80 text-white animate-pulse">
              Click to Lock Mouse
            </div>
          )}
        </div>
        <div className="flex items-center gap-3 bg-black/40 rounded-xl px-3 py-2">
          <label className="flex items-center gap-2 text-xs">
            <input type="checkbox" checked={showOrbits} onChange={toggleOrbits} />
            Orbits
          </label>
          <label className="flex items-center gap-2 text-xs">
            <input type="checkbox" checked={showLabels} onChange={toggleLabels} />
            Labels
          </label>
          <label className="flex items-center gap-2 text-xs">
            <input type="checkbox" checked={paused} onChange={togglePaused} />
            Pause
          </label>
          <div className="flex items-center gap-2 text-xs">
            <span>Speed</span>
            <input
              type="range"
              min={1}
              max={200}
              value={daysPerSecond}
              onChange={(e) => setDaysPerSecond(Number(e.target.value))}
            />
            <span className="tabular-nums w-10 text-right">{daysPerSecond}×</span>
          </div>
          <label className="flex items-center gap-2 text-xs">
            <input type="checkbox" checked={hiResTextures} onChange={toggleHiResTextures} />
            Hi-res textures
          </label>
          <button
            onClick={toggleCameraMode}
            className={`px-2 py-1 rounded text-xs transition-colors ${
              cameraMode === "free" 
                ? "bg-blue-600 text-white" 
                : "bg-white/20 text-white hover:bg-white/30"
            }`}
          >
            {cameraMode === "free" ? "Free Cam" : cameraMode === "follow" ? "Follow" : "Spaceship"}
          </button>
          <button
            onClick={resetCamera}
            className="px-2 py-1 rounded text-xs bg-white/20 text-white hover:bg-white/30 transition-colors"
          >
            Reset
          </button>
          {(cameraMode === "free" || cameraMode === "spaceship") && (
            <div className="flex items-center gap-2 text-xs">
              <span>Speed</span>
              <input
                type="range"
                min={10}
                max={200}
                value={freeCameraSpeed}
                onChange={(e) => setFreeCameraSpeed(Number(e.target.value))}
                className="w-16"
              />
              <span className="tabular-nums w-8 text-right">{freeCameraSpeed}</span>
            </div>
          )}
        </div>
      </div>

      {planet && (
        <div className="self-start bg-black/50 rounded-2xl p-3 text-xs backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full overflow-hidden ring-1 ring-white/20">
              {((hiResTextures ? planet.textureUrl : planet.textureUrlLo) ?? planet.textureUrl) ? (
                <img src={(hiResTextures ? planet.textureUrl : planet.textureUrlLo) ?? planet.textureUrl} alt={planet.name} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full bg-gray-600 flex items-center justify-center text-xs text-white/70">
                  {planet.name.charAt(0)}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="opacity-70">Selected:</span>
              <select
                className="bg-black/30 rounded px-2 py-1"
                value={planet.name}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setSelected(e.target.value as PlanetName)
                }
              >
                {PLANETS.map((p) => (
                  <option key={p.name} value={p.name}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1 opacity-95">
            <div className="flex items-baseline gap-1"><span className="opacity-70">Radius</span><span className="tabular-nums font-semibold">{planet.radiusKm.toLocaleString()}</span><span className="opacity-70">km</span></div>
            <div className="flex items-baseline gap-1"><span className="opacity-70">Orbit</span><span className="tabular-nums font-semibold">{planet.semiMajorAxisAU}</span><span className="opacity-70">AU</span></div>
            <div className="flex items-baseline gap-1"><span className="opacity-70">Year</span><span className="tabular-nums font-semibold">{planet.orbitalPeriodDays}</span><span className="opacity-70">days</span></div>
            <div className="flex items-baseline gap-1"><span className="opacity-70">Day</span><span className="tabular-nums font-semibold">{Math.abs(planet.rotationPeriodHours)}</span><span className="opacity-70">h{planet.rotationPeriodHours < 0 ? " (retro)" : ""}</span></div>
          </div>
        </div>
      )}

      {/* Controls Help */}
      <div className="self-start bg-black/50 rounded-2xl p-3 text-xs backdrop-blur">
        <div className="font-semibold mb-2">Controls</div>
        <div className="space-y-1 opacity-80">
          {cameraMode === "free" ? (
            <>
              <div>• <kbd className="bg-white/20 px-1 rounded">W</kbd> Move forward (where you're looking)</div>
              <div>• <kbd className="bg-white/20 px-1 rounded">S</kbd> Move backward</div>
              <div>• <kbd className="bg-white/20 px-1 rounded">A/D</kbd> Strafe left/right</div>
              <div>• <kbd className="bg-white/20 px-1 rounded">Mouse</kbd> Look around (click to lock)</div>
              <div>• <kbd className="bg-white/20 px-1 rounded">Escape</kbd> Unlock mouse</div>
              <div>• <kbd className="bg-white/20 px-1 rounded">F</kbd> Switch to follow mode</div>
              <div>• <kbd className="bg-white/20 px-1 rounded">R</kbd> Reset camera</div>
            </>
          ) : cameraMode === "spaceship" ? (
            <>
              <div>• <kbd className="bg-white/20 px-1 rounded">W</kbd> Fly forward</div>
              <div>• <kbd className="bg-white/20 px-1 rounded">S</kbd> Fly backward</div>
              <div>• <kbd className="bg-white/20 px-1 rounded">A/D</kbd> Strafe left/right</div>
              <div>• <kbd className="bg-white/20 px-1 rounded">Mouse</kbd> Control spaceship direction</div>
              <div>• <kbd className="bg-white/20 px-1 rounded">Escape</kbd> Unlock mouse</div>
              <div>• <kbd className="bg-white/20 px-1 rounded">F</kbd> Switch to follow mode</div>
              <div>• <kbd className="bg-white/20 px-1 rounded">R</kbd> Reset camera</div>
            </>
          ) : (
            <>
              <div>• <kbd className="bg-white/20 px-1 rounded">Mouse</kbd> Drag to rotate camera</div>
              <div>• <kbd className="bg-white/20 px-1 rounded">Ctrl + Scroll</kbd> Zoom in/out</div>
              <div>• <kbd className="bg-white/20 px-1 rounded">Right Click</kbd> Pan camera</div>
              <div>• <kbd className="bg-white/20 px-1 rounded">Click Planet</kbd> Select to focus</div>
              <div>• <kbd className="bg-white/20 px-1 rounded">F</kbd> Switch to free camera</div>
              <div>• <kbd className="bg-white/20 px-1 rounded">R</kbd> Reset camera</div>
            </>
          )}
        </div>
      </div>

      {/* Crosshair for free camera and spaceship modes */}
      {(cameraMode === "free" || cameraMode === "spaceship") && (
        <div className="fixed inset-0 pointer-events-none flex items-center justify-center">
          <div className="w-4 h-4 border border-white/60 rounded-full flex items-center justify-center">
            <div className="w-1 h-1 bg-white/80 rounded-full"></div>
          </div>
          {/* Click to lock indicator */}
          {!document.pointerLockElement && (
            <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded text-sm">
              Click to lock mouse
            </div>
          )}
        </div>
      )}
    </div>
  );
}
