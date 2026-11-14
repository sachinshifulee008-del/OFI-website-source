"use client";

import { useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html, Trail } from "@react-three/drei";
import * as THREE from "three";

/**
 * Satellite — reusable animated satellite that follows a THREE curve.
 *
 * - Moves smoothly along the orbit curve (speed = orbits per second).
 * - Maintains correct orientation by looking along the curve tangent.
 * - Subtle illuminated details: emissive solar panels + a blinking beacon.
 * - Hoverable and selectable, with an information tooltip.
 *
 * HONESTY: positions are illustrative motion, NOT live telemetry — the
 * tooltip states this explicitly.
 */
export interface SatelliteProps {
  name: string;
  curve: THREE.CatmullRomCurve3;
  /** fraction of the orbit completed per second */
  speed: number;
  offset: number;
  color: string;
  reduced: boolean;
  selected: boolean;
  onSelect: () => void;
}

export default function Satellite({
  name,
  curve,
  speed,
  offset,
  color,
  reduced,
  selected,
  onSelect,
}: SatelliteProps) {
  const group = useRef<THREE.Group>(null);
  const beacon = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const u = useRef(offset);

  // reusable scratch vectors — no per-frame allocations
  const tmp = useMemo(
    () => ({ p: new THREE.Vector3(), t: new THREE.Vector3(), target: new THREE.Vector3() }),
    [],
  );

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    if (!reduced) u.current = (u.current + Math.min(delta, 0.05) * speed) % 1;
    curve.getPointAt(u.current, tmp.p);
    g.position.copy(tmp.p);
    curve.getTangentAt(u.current, tmp.t);
    tmp.target.copy(tmp.p).add(tmp.t);
    g.parent?.localToWorld(tmp.target);
    g.lookAt(tmp.target);
    if (beacon.current) {
      const mat = beacon.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 1.4 + Math.sin(state.clock.elapsedTime * 3.5) * 1.1;
    }
  });

  return (
    <>
      <group
        ref={group}
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = "auto";
        }}
      >
        {/* bus */}
        <mesh castShadow={false}>
          <boxGeometry args={[0.045, 0.045, 0.085]} />
          <meshStandardMaterial color="#c9d2e6" metalness={0.7} roughness={0.35} />
        </mesh>
        {/* solar panels */}
        {[0.052, -0.052].map((x) => (
          <mesh key={x} position={[x, 0, 0]}>
            <boxGeometry args={[0.05, 0.004, 0.095]} />
            <meshStandardMaterial
              color="#16294e"
              emissive="#1d4ed8"
              emissiveIntensity={0.35}
              metalness={0.4}
              roughness={0.3}
            />
          </mesh>
        ))}
        {/* beacon light */}
        <mesh ref={beacon} position={[0, 0.032, 0]}>
          <sphereGeometry args={[0.008, 8, 8]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.6} toneMapped={false} />
        </mesh>

        {(hovered || selected) && (
          <Html center position={[0, 0.14, 0]} zIndexRange={[30, 0]}>
            <div className="pointer-events-none w-48 whitespace-normal rounded-lg border border-[rgba(140,190,230,0.25)] bg-[rgba(5,9,20,0.88)] px-3 py-2 shadow-[0_8px_30px_rgba(0,0,0,0.5)] backdrop-blur-sm">
              <p className="ofi-mono text-[9px] font-medium tracking-wider" style={{ color }}>
                {name}
              </p>
              <p className="mt-1 text-[9px] leading-snug text-[#91A4BD]">
                Illustrative orbit — not live satellite telemetry.
              </p>
            </div>
          </Html>
        )}
      </group>

      {/* glowing orbital trail behind the satellite */}
      {!reduced && (
        <Trail
          width={0.9}
          length={4.5}
          color={color}
          attenuation={(w) => w * w}
          target={group as unknown as React.RefObject<THREE.Object3D>}
        />
      )}
    </>
  );
}
