import * as THREE from "three";

/**
 * Shared data + math for the 3D Earth scene.
 *
 * SCIENTIFIC INTEGRITY:
 * - Marker locations are verified, publicly documented NASA facility
 *   coordinates. No invented locations.
 * - Satellite orbits are ILLUSTRATIVE (decorative motion), clearly labelled
 *   as such — never presented as live telemetry.
 */

/** Fixed sun direction (world space, normalized) — creates the day/night terminator. */
export const SUN_DIRECTION = new THREE.Vector3(1.0, 0.22, 0.5).normalize();

export interface MarkerData {
  id: string;
  name: string;
  category: string;
  lat: number;
  lon: number;
  place: string;
  role: string;
  color: string;
}

/**
 * Verified NASA facilities with documented roles in microgravity
 * combustion research (public facility locations + program assignments).
 */
export const MARKERS: MarkerData[] = [
  {
    id: "glenn",
    name: "NASA Glenn Research Center",
    category: "Experiment Operations",
    lat: 41.845,
    lon: -81.885,
    place: "Cleveland, Ohio, USA",
    role: "Home of the Combustion Integrated Rack science team. The FLEX, FLEX-2, ACME and SoFIE microgravity combustion investigations are operated and analysed from Glenn.",
    color: "#42D9FF",
  },
  {
    id: "marshall",
    name: "NASA Marshall Space Flight Center",
    category: "Project Management",
    lat: 34.648,
    lon: -86.665,
    place: "Huntsville, Alabama, USA",
    role: "Managed the SAFFIRE spacecraft fire-safety experiments flown aboard uncrewed Cygnus cargo vehicles, among other microgravity combustion projects.",
    color: "#8B7BFF",
  },
  {
    id: "jsc",
    name: "NASA Johnson Space Center",
    category: "Research Locations",
    lat: 29.56,
    lon: -95.085,
    place: "Houston, Texas, USA",
    role: "International Space Station program science operations and telescience support for orbiting laboratory payloads, including combustion rack operations.",
    color: "#397BFF",
  },
  {
    id: "ksc",
    name: "NASA Kennedy Space Center",
    category: "Launch Site",
    lat: 28.573,
    lon: -80.649,
    place: "Merritt Island, Florida, USA",
    role: "Launch site for the commercial resupply missions that carried combustion experiment hardware — SAFFIRE modules, ACME and SoFIE racks — to the ISS.",
    color: "#FF7438",
  },
];

/**
 * Convert latitude/longitude to a position on a THREE sphere whose UVs match
 * an equirectangular Earth texture (the standard webgl-globe mapping).
 */
export function latLonToVec3(lat: number, lon: number, radius: number): THREE.Vector3 {
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = ((lon + 180) * Math.PI) / 180;
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  );
}
