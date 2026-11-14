"use client";

import { Suspense, useEffect, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { useReducedMotion } from "framer-motion";
import Earth from "./Earth";
import SpaceEnvironment from "./SpaceEnvironment";
import Orbits from "./Orbits";
import ResearchMarkers from "./ResearchMarkers";
import { SUN_DIRECTION } from "./lib";

/**
 * EarthScene — the full cinematic R3F canvas:
 * Earth (day/night shader + clouds + atmosphere), stars/dust/nebulae,
 * glowing orbits with satellites, clickable research markers, smooth
 * camera focusing on selection and OrbitControls (drag / zoom / idle
 * auto-rotate). Markers/satellites that are selected pause the idle motion
 * for a stable, readable focus.
 */

/** Dev-only test bridge: exposes the scene for automated interaction tests. */
function DebugBridge() {
  const scene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera);
  const controls = useThree((s) => s.controls);
  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;
    (window as unknown as { __ofiGlobe?: object }).__ofiGlobe = { scene, camera, controls };
    return () => {
      delete (window as unknown as { __ofiGlobe?: object }).__ofiGlobe;
    };
  }, [scene, camera, controls]);
  return null;
}

/** Smoothly moves the camera to frame a selected marker. */
function CameraRig({ focusId }: { focusId: string | null }) {
  const controls = useThree((s) => s.controls) as unknown as
    | { target: THREE.Vector3 }
    | null;
  const scene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera);
  const desired = useRef<{ target: THREE.Vector3; cam: THREE.Vector3 } | null>(null);

  useEffect(() => {
    if (!focusId) {
      desired.current = null;
      return;
    }
    const obj = scene.getObjectByName(`marker-${focusId}`);
    if (!obj) return;
    // idle rotation is paused while a marker is selected, so the world
    // position is stable across the transition
    const wp = obj.getWorldPosition(new THREE.Vector3());
    const normal = wp.clone().normalize();
    const cam = wp
      .clone()
      .add(normal.multiplyScalar(0.85))
      .add(new THREE.Vector3(0, 0.12, 0));
    desired.current = { target: wp.clone(), cam };
  }, [focusId, scene]);

  useFrame(() => {
    if (!desired.current) return;
    if (controls) controls.target.lerp(desired.current.target, 0.08);
    camera.position.lerp(desired.current.cam, 0.06);
  });

  return null;
}

export default function EarthScene({
  selectedMarker,
  onSelectMarker,
  selectedSatellite,
  onSelectSatellite,
  onReady,
  lowSpec,
}: {
  selectedMarker: string | null;
  onSelectMarker: (id: string | null) => void;
  selectedSatellite: string | null;
  onSelectSatellite: (name: string | null) => void;
  onReady?: () => void;
  lowSpec: boolean;
}) {
  const reduced = useReducedMotion();
  const paused = selectedMarker !== null; // hold idle motion while focused

  return (
    <Canvas
      camera={{ position: [0, 0.4, 3.4], fov: 42, near: 0.1, far: 200 }}
      dpr={[1, lowSpec ? 1.5 : 2]}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        onReady?.();
      }}
      onPointerMissed={() => {
        onSelectMarker(null);
        onSelectSatellite(null);
      }}
      style={{ touchAction: "none" }}
    >
      <color attach="background" args={["#02040a"]} />

      {/* lighting: warm key "sun" for the Lambert cloud layer + faint fill */}
      <directionalLight
        position={SUN_DIRECTION.clone().multiplyScalar(10)}
        intensity={2.6}
        color="#fff2dd"
      />
      <ambientLight intensity={0.12} />

      <Suspense fallback={null}>
        <Earth paused={paused || !!reduced} />
        <ResearchMarkers selectedId={selectedMarker} onSelect={onSelectMarker} />
      </Suspense>

      <SpaceEnvironment lowSpec={lowSpec} />
      <Orbits
        reduced={!!reduced}
        onSelectSatellite={onSelectSatellite}
        selectedSatellite={selectedSatellite}
      />

      <CameraRig focusId={selectedMarker} />
      <DebugBridge />

      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.08}
        enablePan={false}
        minDistance={1.7}
        maxDistance={5.5}
        autoRotate={!reduced && !paused}
        autoRotateSpeed={0.35}
        rotateSpeed={0.6}
        zoomSpeed={0.7}
      />
    </Canvas>
  );
}
