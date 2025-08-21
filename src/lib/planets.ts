export type PlanetName =
  | "Mercury"
  | "Venus"
  | "Earth"
  | "Mars"
  | "Jupiter"
  | "Saturn"
  | "Uranus"
  | "Neptune"
  | "Pluto";

export interface PlanetData {
  name: PlanetName;
  radiusKm: number; // equatorial radius
  semiMajorAxisAU: number; // average distance from Sun in AU
  orbitalPeriodDays: number;
  rotationPeriodHours: number; // negative means retrograde
  axialTiltDeg: number;
  color: string;
  hasRings?: boolean;
  // Texture properties are optional and not used in this version
  textureUrl?: string;
  normalUrl?: string;
  ringTextureUrl?: string;
  textureUrlLo?: string;
  ringTextureUrlLo?: string;
}

export const PLANETS: PlanetData[] = [
  {
    name: "Mercury",
    radiusKm: 2440,
    semiMajorAxisAU: 0.39,
    orbitalPeriodDays: 88,
    rotationPeriodHours: 1407.6,
    axialTiltDeg: 0.03,
    color: "#b2b2b2",
    textureUrl: "/textures/mercury.jpg",
    textureUrlLo: "/textures/mercury.jpg",
  },
  {
    name: "Venus",
    radiusKm: 6052,
    semiMajorAxisAU: 0.72,
    orbitalPeriodDays: 224.7,
    rotationPeriodHours: -5832.5, // retrograde
    axialTiltDeg: 177.4,
    color: "#d9c28f",
    textureUrl: "/textures/venus.jpg",
    textureUrlLo: "/textures/venus.jpg",
  },
  {
    name: "Earth",
    radiusKm: 6371,
    semiMajorAxisAU: 1.0,
    orbitalPeriodDays: 365.25,
    rotationPeriodHours: 23.93,
    axialTiltDeg: 23.44,
    color: "#6db7ff",
    textureUrl: "/textures/earth_atmos_2048.jpg",
    textureUrlLo: "/textures/earth_atmos_2048.jpg",
  },
  {
    name: "Mars",
    radiusKm: 3390,
    semiMajorAxisAU: 1.52,
    orbitalPeriodDays: 686.98,
    rotationPeriodHours: 24.62,
    axialTiltDeg: 25.19,
    color: "#c1440e",
    textureUrl: "/textures/mars_1k_color.jpg",
    textureUrlLo: "/textures/mars_1k_color.jpg",
  },
  {
    name: "Jupiter",
    radiusKm: 69911,
    semiMajorAxisAU: 5.2,
    orbitalPeriodDays: 4332.59,
    rotationPeriodHours: 9.93,
    axialTiltDeg: 3.13,
    color: "#d2ad7c",
    textureUrl: "/textures/jupiter.jpg",
    textureUrlLo: "/textures/jupiter.jpg",
  },
  {
    name: "Saturn",
    radiusKm: 58232,
    semiMajorAxisAU: 9.58,
    orbitalPeriodDays: 10759,
    rotationPeriodHours: 10.7,
    axialTiltDeg: 26.73,
    color: "#e6d19c",
    hasRings: true,
    textureUrl: "/textures/saturn.jpg",
    textureUrlLo: "/textures/saturn.jpg",
    ringTextureUrl: "/textures/saturnringcolor.jpg",
    ringTextureUrlLo: "/textures/saturnringcolor.jpg",
  },
  {
    name: "Uranus",
    radiusKm: 25362,
    semiMajorAxisAU: 19.2,
    orbitalPeriodDays: 30687,
    rotationPeriodHours: -17.24, // retrograde
    axialTiltDeg: 97.77,
    color: "#a6e1e3",
    textureUrl: "/textures/uranus.jpg",
    textureUrlLo: "/textures/uranus.jpg",
  },
  {
    name: "Neptune",
    radiusKm: 24622,
    semiMajorAxisAU: 30.05,
    orbitalPeriodDays: 60190,
    rotationPeriodHours: 16.11,
    axialTiltDeg: 28.32,
    color: "#6a8cff",
    textureUrl: "/textures/neptune.jpg",
    textureUrlLo: "/textures/neptune.jpg",
  },
  {
    name: "Pluto",
    radiusKm: 1188,
    semiMajorAxisAU: 39.48,
    orbitalPeriodDays: 90560,
    rotationPeriodHours: -153.3,
    axialTiltDeg: 119.6,
    color: "#bfae9a",
    textureUrl: "/textures/pluto.jpg",
    textureUrlLo: "/textures/pluto.jpg",
  },
];

export const AU_TO_UNITS = 2; // 1 AU -> 2 world units (Neptune ~60u)
export const KM_TO_UNITS = 0.00005; // Earth radius ~0.32 units
