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
  radiusKm: number;
  semiMajorAxisAU: number;
  orbitalPeriodDays: number;
  rotationPeriodHours: number;
  axialTiltDeg: number;
  color: string;
  hasRings?: boolean;
  // Keplerian orbital elements (J2000 epoch)
  eccentricity: number;
  inclinationDeg: number;
  longitudeAscNodeDeg: number;
  argPerihelionDeg: number;
  meanAnomalyJ2000Deg: number;
  // Texture paths (served from public/)
  texture: string;
  normalMap?: string;
  cloudMap?: string;
  nightMap?: string;
  ringTexture?: string;
}

// J2000 epoch orbital data from NASA JPL Horizons
export const PLANETS: PlanetData[] = [
  {
    name: "Mercury",
    radiusKm: 2440,
    semiMajorAxisAU: 0.3871,
    orbitalPeriodDays: 87.97,
    rotationPeriodHours: 1407.6,
    axialTiltDeg: 0.03,
    color: "#b2b2b2",
    eccentricity: 0.2056,
    inclinationDeg: 7.005,
    longitudeAscNodeDeg: 48.331,
    argPerihelionDeg: 29.124,
    meanAnomalyJ2000Deg: 174.796,
    texture: "/textures/2k_mercury.jpg",
  },
  {
    name: "Venus",
    radiusKm: 6052,
    semiMajorAxisAU: 0.7233,
    orbitalPeriodDays: 224.7,
    rotationPeriodHours: -5832.5,
    axialTiltDeg: 177.4,
    color: "#d9c28f",
    eccentricity: 0.0068,
    inclinationDeg: 3.3947,
    longitudeAscNodeDeg: 76.680,
    argPerihelionDeg: 54.884,
    meanAnomalyJ2000Deg: 50.416,
    texture: "/textures/2k_venus_surface.jpg",
    cloudMap: "/textures/2k_venus_atmosphere.jpg",
  },
  {
    name: "Earth",
    radiusKm: 6371,
    semiMajorAxisAU: 1.0,
    orbitalPeriodDays: 365.256,
    rotationPeriodHours: 23.934,
    axialTiltDeg: 23.44,
    color: "#6db7ff",
    eccentricity: 0.0167,
    inclinationDeg: 0.0,
    longitudeAscNodeDeg: -11.261,
    argPerihelionDeg: 114.208,
    meanAnomalyJ2000Deg: 357.517,
    texture: "/textures/2k_earth_daymap.jpg",
    nightMap: "/textures/2k_earth_nightmap.jpg",
    cloudMap: "/textures/2k_earth_clouds.jpg",
  },
  {
    name: "Mars",
    radiusKm: 3390,
    semiMajorAxisAU: 1.5237,
    orbitalPeriodDays: 686.98,
    rotationPeriodHours: 24.623,
    axialTiltDeg: 25.19,
    color: "#c1440e",
    eccentricity: 0.0934,
    inclinationDeg: 1.8506,
    longitudeAscNodeDeg: 49.558,
    argPerihelionDeg: 286.502,
    meanAnomalyJ2000Deg: 19.373,
    texture: "/textures/2k_mars.jpg",
  },
  {
    name: "Jupiter",
    radiusKm: 69911,
    semiMajorAxisAU: 5.2026,
    orbitalPeriodDays: 4332.59,
    rotationPeriodHours: 9.925,
    axialTiltDeg: 3.13,
    color: "#d2ad7c",
    eccentricity: 0.0484,
    inclinationDeg: 1.3053,
    longitudeAscNodeDeg: 100.464,
    argPerihelionDeg: 273.867,
    meanAnomalyJ2000Deg: 20.020,
    texture: "/textures/2k_jupiter.jpg",
  },
  {
    name: "Saturn",
    radiusKm: 58232,
    semiMajorAxisAU: 9.5549,
    orbitalPeriodDays: 10759.22,
    rotationPeriodHours: 10.656,
    axialTiltDeg: 26.73,
    color: "#e6d19c",
    hasRings: true,
    eccentricity: 0.0542,
    inclinationDeg: 2.4845,
    longitudeAscNodeDeg: 113.640,
    argPerihelionDeg: 339.392,
    meanAnomalyJ2000Deg: 317.020,
    texture: "/textures/2k_saturn.jpg",
    ringTexture: "/textures/2k_saturn_ring_alpha.png",
  },
  {
    name: "Uranus",
    radiusKm: 25362,
    semiMajorAxisAU: 19.2184,
    orbitalPeriodDays: 30688.5,
    rotationPeriodHours: -17.24,
    axialTiltDeg: 97.77,
    color: "#a6e1e3",
    eccentricity: 0.0472,
    inclinationDeg: 0.7699,
    longitudeAscNodeDeg: 74.006,
    argPerihelionDeg: 96.999,
    meanAnomalyJ2000Deg: 142.239,
    texture: "/textures/2k_uranus.jpg",
  },
  {
    name: "Neptune",
    radiusKm: 24622,
    semiMajorAxisAU: 30.069,
    orbitalPeriodDays: 60182.0,
    rotationPeriodHours: 16.11,
    axialTiltDeg: 28.32,
    color: "#6a8cff",
    eccentricity: 0.0086,
    inclinationDeg: 1.7692,
    longitudeAscNodeDeg: 131.722,
    argPerihelionDeg: 276.336,
    meanAnomalyJ2000Deg: 256.228,
    texture: "/textures/2k_neptune.jpg",
  },
  {
    name: "Pluto",
    radiusKm: 1188,
    semiMajorAxisAU: 39.482,
    orbitalPeriodDays: 90560,
    rotationPeriodHours: -153.3,
    axialTiltDeg: 119.6,
    color: "#bfae9a",
    eccentricity: 0.2488,
    inclinationDeg: 17.142,
    longitudeAscNodeDeg: 110.299,
    argPerihelionDeg: 113.763,
    meanAnomalyJ2000Deg: 14.530,
    texture: "/textures/2k_pluto.jpg",
  },
];

export const AU_TO_UNITS = 2;
export const KM_TO_UNITS = 0.00005;

const DEG2RAD = Math.PI / 180;

/**
 * Solve Kepler's equation M = E - e*sin(E) for eccentric anomaly E
 * using Newton-Raphson iteration.
 */
function solveKepler(M: number, e: number): number {
  let E = M;
  for (let i = 0; i < 20; i++) {
    const dE = (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
    E -= dE;
    if (Math.abs(dE) < 1e-10) break;
  }
  return E;
}

/**
 * Compute the 3D heliocentric position of a planet at a given simulation
 * time using full Keplerian orbital mechanics.
 */
export function computeKeplerianPosition(
  planet: PlanetData,
  simDays: number
): [number, number, number] {
  const { semiMajorAxisAU, eccentricity: e, orbitalPeriodDays } = planet;
  const i = planet.inclinationDeg * DEG2RAD;
  const Omega = planet.longitudeAscNodeDeg * DEG2RAD;
  const omega = planet.argPerihelionDeg * DEG2RAD;
  const M0 = planet.meanAnomalyJ2000Deg * DEG2RAD;

  // Mean motion (radians per day)
  const n = (2 * Math.PI) / orbitalPeriodDays;

  // Mean anomaly at simulation time
  const M = M0 + n * simDays;

  // Solve Kepler's equation
  const E = solveKepler(M, e);

  // True anomaly
  const sinNu = (Math.sqrt(1 - e * e) * Math.sin(E)) / (1 - e * Math.cos(E));
  const cosNu = (Math.cos(E) - e) / (1 - e * Math.cos(E));
  const nu = Math.atan2(sinNu, cosNu);

  // Distance from Sun
  const r = semiMajorAxisAU * (1 - e * Math.cos(E));

  // Position in orbital plane
  const xOrb = r * Math.cos(nu);
  const yOrb = r * Math.sin(nu);

  // Transform to 3D heliocentric coordinates (ecliptic)
  const cosO = Math.cos(Omega);
  const sinO = Math.sin(Omega);
  const cosw = Math.cos(omega);
  const sinw = Math.sin(omega);
  const cosI = Math.cos(i);
  const sinI = Math.sin(i);

  const x =
    xOrb * (cosO * cosw - sinO * sinw * cosI) -
    yOrb * (cosO * sinw + sinO * cosw * cosI);
  const z =
    xOrb * (sinO * cosw + cosO * sinw * cosI) -
    yOrb * (sinO * sinw - cosO * cosw * cosI);
  const y = xOrb * sinw * sinI + yOrb * cosw * sinI;

  return [x * AU_TO_UNITS, y * AU_TO_UNITS, z * AU_TO_UNITS];
}
