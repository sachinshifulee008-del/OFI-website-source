"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { MARKERS, latLonToVec3, type MarkerData } from "./lib";

/**
 * ResearchMarkers — clickable markers pinned to the rotating globe.
 *
 * Only VERIFIED NASA facility locations are used (see lib.ts). Hover shows
 * a label; clicking selects the marker, which the scene then highlights and
 * smoothly focuses the camera on.
 */

function Marker({
  data,
  selected,
  onSelect,
  onHover,
}: {
  data: MarkerData;
  selected: boolean;
  onSelect: () => void;
  onHover: (id: string | null) => void;
}) {
  const ring = useRef<THREE.Mesh>(null);
  const group = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const position = useMemo(() => latLonToVec3(data.lat, data.lon, 1.006), [data]);

  // orient the ring so it faces away from the globe surface
  useEffect(() => {
    if (group.current) {
      group.current.lookAt(position.clone().multiplyScalar(2));
    }
  }, [position]);

  useFrame((state) => {
    if (ring.current && (selected || hovered)) {
      const t = state.clock.elapsedTime;
      const s = 1 + 0.35 * Math.sin(t * 3.2);
      ring.current.scale.setScalar(s);
      (ring.current.material as THREE.MeshBasicMaterial).opacity = 0.65 - 0.25 * Math.sin(t * 3.2);
    }
  });

  const showLabel = hovered || selected;

  return (
    <group
      ref={group}
      name={`marker-${data.id}`}
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        onHover(data.id);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        setHovered(false);
        onHover(null);
        document.body.style.cursor = "auto";
      }}
    >
      {/* invisible larger hit area for touch friendliness */}
      <mesh visible={false}>
        <sphereGeometry args={[0.035, 8, 8]} />
        <meshBasicMaterial />
      </mesh>
      {/* core dot */}
      <mesh>
        <sphereGeometry args={[0.0075, 12, 12]} />
        <meshBasicMaterial color={data.color} toneMapped={false} />
      </mesh>
      {/* glow ring */}
      <mesh ref={ring}>
        <ringGeometry args={[0.014, 0.019, 32]} />
        <meshBasicMaterial
          color={data.color}
          transparent
          opacity={0.45}
          side={THREE.DoubleSide}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      {showLabel && (
        <Html center position={[0, 0.11, 0]} zIndexRange={[30, 0]} style={{ pointerEvents: "none" }}>
          <div className="pointer-events-none w-44 whitespace-normal rounded-lg border border-[rgba(140,190,230,0.25)] bg-[rgba(5,9,20,0.88)] px-3 py-2 shadow-[0_8px_30px_rgba(0,0,0,0.5)] backdrop-blur-sm">
            <p
              className="ofi-mono text-[8px] uppercase tracking-[0.18em]"
              style={{ color: data.color }}
            >
              {data.category}
            </p>
            <p className="mt-0.5 text-[10px] font-medium leading-snug text-[#F4F8FF]">{data.name}</p>
          </div>
        </Html>
      )}
    </group>
  );
}

export default function ResearchMarkers({
  selectedId,
  onSelect,
}: {
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}) {
  const [, setHoverId] = useState<string | null>(null);
  return (
    <group aria-hidden={false}>
      {MARKERS.map((m) => (
        <Marker
          key={m.id}
          data={m}
          selected={selectedId === m.id}
          onSelect={() => onSelect(selectedId === m.id ? null : m.id)}
          onHover={setHoverId}
        />
      ))}
    </group>
  );
}
