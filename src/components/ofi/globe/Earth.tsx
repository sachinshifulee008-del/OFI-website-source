"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { useReducedMotion } from "framer-motion";
import * as THREE from "three";
import { SUN_DIRECTION } from "./lib";

/**
 * Earth — photorealistic day/night globe.
 *
 * Custom shader mixes the NASA Blue Marble day map with Black Marble city
 * lights across a soft terminator, adds ocean specular highlights, a cyan
 * Fresnel rim, and a separate lit cloud layer + atmospheric glow shell.
 * Rotation is smooth and automatic; paused while a marker is focused and
 * under prefers-reduced-motion.
 */

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormalW;
  varying vec3 vPosW;

  void main() {
    vUv = uv;
    vNormalW = normalize(mat3(modelMatrix) * normal);
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vPosW = worldPos.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

const fragmentShader = /* glsl */ `
  uniform sampler2D dayMap;
  uniform sampler2D nightMap;
  uniform sampler2D specMap;
  uniform vec3 sunDirection;

  varying vec2 vUv;
  varying vec3 vNormalW;
  varying vec3 vPosW;

  void main() {
    vec3 dayColor = texture2D(dayMap, vUv).rgb;
    vec3 nightColor = texture2D(nightMap, vUv).rgb;
    float oceanSpec = texture2D(specMap, vUv).r;

    vec3 n = normalize(vNormalW);
    vec3 viewDir = normalize(cameraPosition - vPosW);
    float sunDot = dot(n, sunDirection);

    // soft terminator between day and night hemispheres
    float dayMix = smoothstep(-0.12, 0.22, sunDot);

    vec3 lit = dayColor * (0.06 + 1.25 * clamp(sunDot, 0.0, 1.0));
    vec3 nightSide = nightColor * vec3(1.15, 0.98, 0.8) * 1.9; // boosted city lights
    vec3 color = mix(nightSide, lit, dayMix);

    // sun glint on the oceans (specular map: oceans white, land black)
    vec3 halfDir = normalize(normalize(sunDirection) + viewDir);
    float spec = pow(max(dot(n, halfDir), 0.0), 48.0) * oceanSpec * dayMix;
    color += vec3(0.45, 0.55, 0.7) * spec;

    // cyan atmospheric Fresnel rim on the sphere itself
    float fres = pow(1.0 - max(dot(n, viewDir), 0.0), 3.2);
    color += vec3(0.16, 0.5, 0.9) * fres * (0.18 + 0.82 * dayMix);

    gl_FragColor = vec4(color, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

const atmosphereVertex = /* glsl */ `
  varying vec3 vNormalV;
  varying vec3 vPosV;
  varying vec3 vNormalW;

  void main() {
    vNormalV = normalize(normalMatrix * normal);
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vPosV = mv.xyz;
    vNormalW = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * mv;
  }
`;

const atmosphereFragment = /* glsl */ `
  uniform vec3 sunDirection;

  varying vec3 vNormalV;
  varying vec3 vPosV;
  varying vec3 vNormalW;

  void main() {
    vec3 n = normalize(vNormalV);
    vec3 v = normalize(-vPosV);
    float fres = pow(1.0 - clamp(dot(n, v), 0.0, 1.0), 3.4);
    // atmosphere brighter on the sun-facing limb — a subtle sunrise arc
    float sunFacing = dot(normalize(vNormalW), sunDirection);
    float lift = 0.45 + 0.55 * smoothstep(-0.35, 0.55, sunFacing);
    vec3 col = mix(vec3(0.1, 0.32, 0.75), vec3(0.35, 0.8, 1.0), fres);
    float a = fres * lift;
    gl_FragColor = vec4(col * a * 2.2, a);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

const ROT_SPEED = 0.022; // rad/s — a full rotation in ~4.8 minutes

function Atmosphere() {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: { sunDirection: { value: SUN_DIRECTION } },
        vertexShader: atmosphereVertex,
        fragmentShader: atmosphereFragment,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    [],
  );
  useEffect(() => () => material.dispose(), [material]);

  return (
    <mesh>
      <sphereGeometry args={[1.05, 48, 48]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}

export default function Earth({ paused }: { paused: boolean }) {
  const earthRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);
  const reduced = useReducedMotion();

  const [dayMap, lightsMap, cloudsMap, specMap] = useTexture([
    "/ofi/earth3d/earth_atmos_2048.jpg",
    "/ofi/earth3d/earth_lights_2048.png",
    "/ofi/earth3d/earth_clouds_1024.jpg",
    "/ofi/earth3d/earth_specular_2048.jpg",
  ]);

  useEffect(() => {
    dayMap.colorSpace = THREE.SRGBColorSpace; // eslint-disable-line react-hooks/immutability
    lightsMap.colorSpace = THREE.SRGBColorSpace; // eslint-disable-line react-hooks/immutability
    dayMap.anisotropy = 8;
    lightsMap.anisotropy = 4;
  }, [dayMap, lightsMap]);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          dayMap: { value: dayMap },
          nightMap: { value: lightsMap },
          specMap: { value: specMap },
          sunDirection: { value: SUN_DIRECTION },
        },
        vertexShader,
        fragmentShader,
      }),
    [dayMap, lightsMap, specMap],
  );
  useEffect(() => () => material.dispose(), [material]);

  useFrame((_, delta) => {
    if (paused || reduced) return;
    const d = Math.min(delta, 0.05); // clamp tab-switch spikes
    if (earthRef.current) earthRef.current.rotation.y += d * ROT_SPEED;
    if (cloudsRef.current) cloudsRef.current.rotation.y += d * ROT_SPEED * 1.4;
  });

  return (
    <group>
      <mesh ref={earthRef} name="earth">
        <sphereGeometry args={[1, 64, 64]} />
        <primitive object={material} attach="material" />
      </mesh>
      {/* separate drifting cloud layer — lit by the scene's directional light */}
      <mesh ref={cloudsRef}>
        <sphereGeometry args={[1.012, 48, 48]} />
        <meshLambertMaterial
          alphaMap={cloudsMap}
          color="#e8f1ff"
          transparent
          opacity={0.8}
          depthWrite={false}
        />
      </mesh>
      <Atmosphere />
    </group>
  );
}
