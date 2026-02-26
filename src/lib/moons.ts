export interface MoonData {
  name: string;
  parentPlanet: string;
  radiusKm: number;
  semiMajorAxisKm: number;
  orbitalPeriodDays: number;
  color: string;
  texture?: string;
}

// km → world units for moon orbital distances
export const MOON_ORBIT_SCALE = 0.000008;

// km → world units for moon body radii (same as planet body scale)
export const MOON_BODY_SCALE = 0.00002;

export const MOONS: MoonData[] = [
  // ── Earth ──
  {
    name: "Moon",
    parentPlanet: "Earth",
    radiusKm: 1737.4,
    semiMajorAxisKm: 384_400,
    orbitalPeriodDays: 27.322,
    color: "#aaaaaa",
    texture: "/textures/2k_moon.jpg",
  },

  // ── Mars ──
  {
    name: "Phobos",
    parentPlanet: "Mars",
    radiusKm: 11.267,
    semiMajorAxisKm: 9_376,
    orbitalPeriodDays: 0.3189,
    color: "#887766",
  },
  {
    name: "Deimos",
    parentPlanet: "Mars",
    radiusKm: 6.2,
    semiMajorAxisKm: 23_463,
    orbitalPeriodDays: 1.2624,
    color: "#998877",
  },

  // ── Jupiter ──
  {
    name: "Io",
    parentPlanet: "Jupiter",
    radiusKm: 1821.6,
    semiMajorAxisKm: 421_700,
    orbitalPeriodDays: 1.769,
    color: "#ccaa44",
  },
  {
    name: "Europa",
    parentPlanet: "Jupiter",
    radiusKm: 1560.8,
    semiMajorAxisKm: 671_034,
    orbitalPeriodDays: 3.551,
    color: "#ccccdd",
  },
  {
    name: "Ganymede",
    parentPlanet: "Jupiter",
    radiusKm: 2634.1,
    semiMajorAxisKm: 1_070_412,
    orbitalPeriodDays: 7.155,
    color: "#887766",
  },
  {
    name: "Callisto",
    parentPlanet: "Jupiter",
    radiusKm: 2410.3,
    semiMajorAxisKm: 1_882_709,
    orbitalPeriodDays: 16.689,
    color: "#665544",
  },

  // ── Saturn ──
  {
    name: "Titan",
    parentPlanet: "Saturn",
    radiusKm: 2574.7,
    semiMajorAxisKm: 1_221_870,
    orbitalPeriodDays: 15.945,
    color: "#cc9944",
  },
  {
    name: "Rhea",
    parentPlanet: "Saturn",
    radiusKm: 763.8,
    semiMajorAxisKm: 527_108,
    orbitalPeriodDays: 4.518,
    color: "#cccccc",
  },
  {
    name: "Enceladus",
    parentPlanet: "Saturn",
    radiusKm: 252.1,
    semiMajorAxisKm: 238_042,
    orbitalPeriodDays: 1.37,
    color: "#ffffff",
  },

  // ── Uranus ──
  {
    name: "Titania",
    parentPlanet: "Uranus",
    radiusKm: 788.4,
    semiMajorAxisKm: 435_910,
    orbitalPeriodDays: 8.706,
    color: "#aabbcc",
  },
  {
    name: "Oberon",
    parentPlanet: "Uranus",
    radiusKm: 761.4,
    semiMajorAxisKm: 583_520,
    orbitalPeriodDays: 13.463,
    color: "#998888",
  },
  {
    name: "Miranda",
    parentPlanet: "Uranus",
    radiusKm: 235.8,
    semiMajorAxisKm: 129_390,
    orbitalPeriodDays: 1.413,
    color: "#bbbbcc",
  },

  // ── Neptune ──
  {
    name: "Triton",
    parentPlanet: "Neptune",
    radiusKm: 1353.4,
    semiMajorAxisKm: 354_759,
    orbitalPeriodDays: -5.877,
    color: "#aaccdd",
  },

  // ── Pluto ──
  {
    name: "Charon",
    parentPlanet: "Pluto",
    radiusKm: 606,
    semiMajorAxisKm: 19_591,
    orbitalPeriodDays: 6.387,
    color: "#bbaa99",
  },
];

export function computeMoonPosition(
  moon: MoonData,
  simDays: number,
): [number, number, number] {
  const period = moon.orbitalPeriodDays;
  const direction = period < 0 ? -1 : 1;
  const angle = (simDays / Math.abs(period)) * 2 * Math.PI * direction;
  const r = moon.semiMajorAxisKm * MOON_ORBIT_SCALE;

  const x = r * Math.cos(angle);
  const z = r * Math.sin(angle);
  return [x, 0, z];
}
