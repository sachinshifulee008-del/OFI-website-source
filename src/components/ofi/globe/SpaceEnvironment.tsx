"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import * as THREE from "three";
import { useReducedMotion } from "framer-motion";

/**
 * SpaceEnvironment — cinematic, performance-conscious background:
 * - drei <Stars>: GPU point cloud of thousands of subtle stars
 * - floating dust particles in a shell around Earth
 * - distant blue/violet nebula sprites (cheap canvas-gradient textures)
 */

function makeGlowTexture(inner: string, mid: string): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  g.addColorStop(0, inner);
  g.addColorStop(0.45, mid);
  g.addColorStop(1, "rgba(2,4,10,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function Dust({ reduced, lowSpec }: { reduced: boolean; lowSpec: boolean }) {
  const pointsRef = useRef<THREE.Points>(null);

  const geometry = useMemo(() => {
    const count = lowSpec ? 160 : 380;
    const positions = new Float32Array(count * 3);
    const dir = new THREE.Vector3();
    for (let i = 0; i < count; i++) {
      dir
        .set(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1)
        .normalize()
        .multiplyScalar(1.5 + Math.random() * 1.3);
      positions.set([dir.x, dir.y, dir.z], i * 3);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return g;
  }, [lowSpec]);
  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame((_, delta) => {
    if (reduced || !pointsRef.current) return;
    pointsRef.current.rotation.y += Math.min(delta, 0.05) * 0.012;
    pointsRef.current.rotation.x += Math.min(delta, 0.05) * 0.004;
  });

  return (
    <points ref={pointsRef} geometry={geometry} aria-hidden>
      <pointsMaterial
        size={0.014}
        color="#9fd4ff"
        transparent
        opacity={0.5}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
}

function Nebula({ position, scale, opacity, inner, mid }: {
  position: [number, number, number];
  scale: number;
  opacity: number;
  inner: string;
  mid: string;
}) {
  const texture = useMemo(() => makeGlowTexture(inner, mid), [inner, mid]);
  useEffect(() => () => texture.dispose(), [texture]);
  return (
    <sprite position={position} scale={[scale, scale, 1]} aria-hidden>
      <spriteMaterial
        map={texture}
        transparent
        opacity={opacity}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </sprite>
  );
}

export default function SpaceEnvironment({ lowSpec }: { lowSpec: boolean }) {
  const reduced = useReducedMotion();

  return (
    <group aria-hidden>
      <Stars
        radius={70}
        depth={30}
        count={lowSpec ? 1800 : 4200}
        factor={2.6}
        saturation={0}
        fade
        speed={reduced ? 0 : 0.5}
      />
      <Dust reduced={!!reduced} lowSpec={lowSpec} />
      {/* distant nebulae — very subtle violet/blue depth cues */}
      <Nebula position={[-18, 5, -34]} scale={26} opacity={0.13} inner="rgba(90,70,200,0.85)" mid="rgba(60,50,160,0.35)" />
      <Nebula position={[20, -7, -38]} scale={30} opacity={0.1} inner="rgba(50,110,210,0.8)" mid="rgba(40,80,180,0.3)" />
      <Nebula position={[4, 14, -30]} scale={18} opacity={0.08} inner="rgba(66,217,255,0.7)" mid="rgba(40,90,170,0.28)" />
    </group>
  );
}
