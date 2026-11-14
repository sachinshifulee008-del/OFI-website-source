"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";
import Satellite from "./Satellite";

/**
 * Orbits — multiple elliptical, tilted orbital trajectories with glowing
 * cyan/violet lines and satellites travelling along them.
 *
 * Orbits are decorative illustrations (clearly labelled in tooltips), sized
 * between 1.3–1.75 Earth radii for readability. Not live telemetry.
 */

interface OrbitConfig {
  name: string;
  color: string;
  radiusX: number;
  radiusY: number;
  /** tilt applied to the whole orbit plane */
  tilt: [number, number, number];
  /** fraction of orbit per second */
  speed: number;
  offset: number;
  lineOpacity: number;
}

const ORBIT_CONFIGS: OrbitConfig[] = [
  {
    name: "ISS · Low Earth Orbit — illustrative",
    color: "#42D9FF",
    radiusX: 1.52,
    radiusY: 1.36,
    tilt: [0.45, 0, 0.25],
    speed: 0.05,
    offset: 0.1,
    lineOpacity: 0.4,
  },
  {
    name: "Research CubeSat A — illustrative",
    color: "#8B7BFF",
    radiusX: 1.74,
    radiusY: 1.58,
    tilt: [-0.3, 0, 0.9],
    speed: 0.075,
    offset: 0.55,
    lineOpacity: 0.28,
  },
  {
    name: "Research CubeSat B — illustrative",
    color: "#397BFF",
    radiusX: 1.36,
    radiusY: 1.24,
    tilt: [0.15, 0, -0.62],
    speed: 0.09,
    offset: 0.8,
    lineOpacity: 0.28,
  },
];

function OrbitLine({ config }: { config: OrbitConfig }) {
  const line = useMemo(() => {
    const ellipse = new THREE.EllipseCurve(0, 0, config.radiusX, config.radiusY);
    const pts = ellipse
      .getPoints(180)
      .map((p) => new THREE.Vector3(p.x, p.y, 0));
    const curve = new THREE.CatmullRomCurve3(pts, true);
    const geometry = new THREE.BufferGeometry().setFromPoints(curve.getPoints(220));
    const material = new THREE.LineBasicMaterial({
      color: config.color,
      transparent: true,
      opacity: config.lineOpacity,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    return new THREE.Line(geometry, material);
  }, [config]);

  useEffect(
    () => () => {
      line.geometry.dispose();
      (line.material as THREE.Material).dispose();
    },
    [line],
  );

  return <primitive object={line} />;
}

export default function Orbits({
  reduced,
  onSelectSatellite,
  selectedSatellite,
}: {
  reduced: boolean;
  onSelectSatellite: (name: string | null) => void;
  selectedSatellite: string | null;
}) {
  const curves = useMemo(
    () =>
      ORBIT_CONFIGS.map((cfg) => {
        const ellipse = new THREE.EllipseCurve(0, 0, cfg.radiusX, cfg.radiusY);
        const pts = ellipse.getPoints(180).map((p) => new THREE.Vector3(p.x, p.y, 0));
        return new THREE.CatmullRomCurve3(pts, true);
      }),
    [],
  );

  return (
    <group aria-hidden={false}>
      {ORBIT_CONFIGS.map((cfg, i) => (
        <group key={cfg.name} rotation={cfg.tilt}>
          <OrbitLine config={cfg} />
          <Satellite
            name={cfg.name}
            curve={curves[i]}
            speed={cfg.speed}
            offset={cfg.offset}
            color={cfg.color}
            reduced={reduced}
            selected={selectedSatellite === cfg.name}
            onSelect={() =>
              onSelectSatellite(selectedSatellite === cfg.name ? null : cfg.name)
            }
          />
        </group>
      ))}
    </group>
  );
}
