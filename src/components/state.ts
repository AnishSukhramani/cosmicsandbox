"use client";
import { create } from "zustand";
import type { PlanetName } from "@/lib/planets";

interface UiState {
  selected: PlanetName | null;
  showOrbits: boolean;
  showLabels: boolean;
  paused: boolean;
  daysPerSecond: number; // simulation speed
  hiResTextures: boolean;
  cameraMode: "free" | "follow" | "spaceship"; // free camera, follow selected planet, or spaceship mode
  freeCameraSpeed: number; // movement speed for free camera
  setSelected: (name: PlanetName | null) => void;
  toggleOrbits: () => void;
  toggleLabels: () => void;
  togglePaused: () => void;
  setDaysPerSecond: (v: number) => void;
  toggleHiResTextures: () => void;
  toggleCameraMode: () => void;
  setCameraMode: (mode: "free" | "follow" | "spaceship") => void;
  resetCamera: () => void;
  setFreeCameraSpeed: (speed: number) => void;
}

export const useUiState = create<UiState>((set) => ({
  selected: "Earth",
  showOrbits: true,
  showLabels: true,
  paused: false,
  daysPerSecond: 20,
  hiResTextures: false,
  cameraMode: "follow",
  freeCameraSpeed: 50,
  setSelected: (name) => set({ selected: name }),
  toggleOrbits: () => set((s) => ({ showOrbits: !s.showOrbits })),
  toggleLabels: () => set((s) => ({ showLabels: !s.showLabels })),
  togglePaused: () => set((s) => ({ paused: !s.paused })),
  setDaysPerSecond: (v) => set({ daysPerSecond: v }),
  toggleHiResTextures: () => set((s) => ({ hiResTextures: !s.hiResTextures })),
      toggleCameraMode: () => set((s) => ({ 
      cameraMode: s.cameraMode === "free" ? "follow" : s.cameraMode === "follow" ? "spaceship" : "free" 
    })),
  setCameraMode: (mode) => set({ cameraMode: mode }),
  resetCamera: () => set({ selected: "Earth", cameraMode: "follow" }),
  setFreeCameraSpeed: (speed) => set({ freeCameraSpeed: speed }),
}));
