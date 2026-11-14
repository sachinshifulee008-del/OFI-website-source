"use client";

import dynamic from "next/dynamic";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useProgress } from "@react-three/drei";
import { Info, MousePointerClick, Satellite, X } from "lucide-react";
import { Eyebrow, Reveal } from "../shared";
import { MARKERS } from "./lib";

/**
 * EarthGlobeSection — landing-page section hosting the interactive 3D Earth.
 *
 * - Scene is lazy-loaded (next/dynamic, ssr:false) and only mounts when the
 *   section approaches the viewport (IntersectionObserver).
 * - Graceful fallback if WebGL is unavailable.
 * - Loading progress via drei's useProgress (DefaultLoadingManager).
 * - Glass information panel for the selected marker.
 * - Honest labelling: markers = verified NASA facilities; satellite orbits =
 *   illustrative, not live telemetry.
 */
const EarthScene = dynamic(() => import("./EarthScene"), { ssr: false });

const ease = [0.21, 0.47, 0.32, 0.98] as const;

function webglAvailable(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext("webgl2") || canvas.getContext("webgl"))
    );
  } catch {
    return false;
  }
}

export default function EarthGlobeSection() {
  const [webgl, setWebgl] = useState<boolean | null>(null);
  const [mounted, setMounted] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState<string | null>(null);
  const [selectedSatellite, setSelectedSatellite] = useState<string | null>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { active, progress } = useProgress();

  useEffect(() => {
    // WebGL detection and mounting happen in async callbacks (Intersection-
    // Observer / timeout) so state updates never cascade synchronously.
    const detect = () => setWebgl(webglAvailable());
    const el = frameRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      const t = setTimeout(() => {
        setMounted(true);
        detect();
      }, 0);
      return () => clearTimeout(t);
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setMounted(true);
          detect();
          io.disconnect();
        }
      },
      { rootMargin: "600px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const marker = MARKERS.find((m) => m.id === selectedMarker) ?? null;
  const lowSpec =
    typeof window !== "undefined" &&
    (window.innerWidth < 768 || (navigator.hardwareConcurrency ?? 8) <= 4);

  return (
    <section id="earth" className="relative overflow-hidden border-t border-[rgba(140,190,230,0.08)] py-20 md:py-28">
      <div aria-hidden className="ofi-glow-cyan absolute top-24 left-1/2 h-[380px] w-[720px] -translate-x-1/2 rounded-full opacity-40" />
      <div className="relative mx-auto max-w-7xl px-6 md:px-10">
        <Reveal className="max-w-3xl">
          <Eyebrow>Interactive — Orbital Earth</Eyebrow>
          <h2 className="ofi-display mt-3 text-3xl text-[#F4F8FF] md:text-4xl">
            A living globe of the research.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-[#91A4BD]">
            Drag to rotate, scroll to zoom, and select the glowing markers to explore the NASA
            facilities behind the microgravity combustion corpus. Satellites trace illustrative
            orbits — never presented as live telemetry.
          </p>
        </Reveal>

        {/* 3D frame */}
        <Reveal delay={0.1} className="mt-10">
          <div
            ref={frameRef}
            className="ofi-glass relative h-[68svh] min-h-[500px] overflow-hidden rounded-2xl border border-[rgba(140,190,230,0.16)]"
          >
            {webgl === false ? (
              /* graceful non-WebGL fallback */
              <div className="absolute inset-0">
                <img
                  src="/ofi/earth-orbit.jpg"
                  alt="Earth seen from orbit"
                  className="h-full w-full object-cover opacity-80"
                />
                <div className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-[#050914]/90 via-transparent to-transparent pb-8">
                  <p className="ofi-mono max-w-md px-6 text-center text-[10px] leading-relaxed tracking-wider text-[#91A4BD] uppercase">
                    Interactive 3D view needs WebGL — showing a static orbital view instead
                  </p>
                </div>
              </div>
            ) : (
              <>
                {mounted && (
                  <EarthScene
                    selectedMarker={selectedMarker}
                    onSelectMarker={setSelectedMarker}
                    selectedSatellite={selectedSatellite}
                    onSelectSatellite={setSelectedSatellite}
                    onReady={() => setSceneReady(true)}
                    lowSpec={lowSpec}
                  />
                )}

                {/* loading veil */}
                {!sceneReady && (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-[#050914]">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-[rgba(66,217,255,0.25)] border-t-[#42D9FF]" />
                    <p className="ofi-mono text-[10px] tracking-[0.25em] text-[#91A4BD] uppercase">
                      Loading orbital view… {active ? Math.round(progress) : 0}%
                    </p>
                  </div>
                )}

                {/* HUD labels */}
                <div className="pointer-events-none absolute top-4 left-5 z-20 flex items-center gap-2">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#42D9FF]" />
                  <span className="ofi-mono text-[9px] tracking-[0.25em] text-[#91A4BD] uppercase">
                    Orbital view · Earth 3D
                  </span>
                </div>
                <div className="pointer-events-none absolute right-5 bottom-4 z-20 hidden items-center gap-3 md:flex">
                  <span className="ofi-mono flex items-center gap-1.5 text-[9px] tracking-[0.2em] text-[#5B708C] uppercase">
                    <MousePointerClick className="h-3 w-3" /> drag to rotate · scroll to zoom · click markers
                  </span>
                </div>

                {/* HUD corners */}
                <div aria-hidden className="pointer-events-none absolute top-3 left-3 z-20 h-5 w-5 border-t border-l border-[rgba(66,217,255,0.4)]" />
                <div aria-hidden className="pointer-events-none absolute top-3 right-3 z-20 h-5 w-5 border-t border-r border-[rgba(66,217,255,0.4)]" />
                <div aria-hidden className="pointer-events-none absolute bottom-3 left-3 z-20 h-5 w-5 border-b border-l border-[rgba(66,217,255,0.4)]" />
                <div aria-hidden className="pointer-events-none absolute right-3 bottom-3 z-20 h-5 w-5 border-r border-b border-[rgba(66,217,255,0.4)]" />

                {/* marker information panel */}
                <AnimatePresence>
                  {marker && (
                    <motion.div
                      key={marker.id}
                      initial={reduced ? false : { opacity: 0, y: 14, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={reduced ? undefined : { opacity: 0, y: 10, scale: 0.98 }}
                      transition={{ duration: 0.35, ease }}
                      className="absolute bottom-8 left-4 z-30 w-[calc(100%-2rem)] max-w-sm rounded-xl border border-[rgba(140,190,230,0.2)] bg-[rgba(5,9,20,0.82)] p-5 shadow-[0_16px_50px_rgba(0,0,0,0.55)] backdrop-blur-md md:left-6"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p
                            className="ofi-mono text-[9px] uppercase tracking-[0.2em]"
                            style={{ color: marker.color }}
                          >
                            {marker.category}
                          </p>
                          <h3 className="mt-1 text-sm font-semibold text-[#F4F8FF] md:text-base">
                            {marker.name}
                          </h3>
                          <p className="ofi-mono mt-0.5 text-[10px] text-[#91A4BD]">{marker.place}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedMarker(null)}
                          aria-label="Close information panel"
                          className="rounded-md p-1.5 text-[#91A4BD] transition-colors hover:bg-[rgba(140,190,230,0.1)] hover:text-[#F4F8FF] focus-visible:ring-2 focus-visible:ring-[#42D9FF] focus-visible:outline-none"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="mt-3 text-xs leading-relaxed text-[#91A4BD] md:text-sm">
                        {marker.role}
                      </p>
                      <p className="ofi-mono mt-3 flex items-start gap-1.5 text-[9px] leading-relaxed text-[#5B708C]">
                        <Info className="mt-0.5 h-3 w-3 shrink-0" />
                        Facility location verified from public NASA sources. Satellite orbits are
                        illustrative — not live telemetry.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* satellite notice */}
                <AnimatePresence>
                  {selectedSatellite && (
                    <motion.div
                      key={selectedSatellite}
                      initial={reduced ? false : { opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={reduced ? undefined : { opacity: 0, y: 10 }}
                      transition={{ duration: 0.35, ease }}
                      className="absolute top-12 right-4 z-30 w-64 rounded-xl border border-[rgba(139,123,255,0.3)] bg-[rgba(5,9,20,0.82)] p-4 backdrop-blur-md md:right-6"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="ofi-mono flex items-center gap-1.5 text-[9px] tracking-[0.16em] text-[#8B7BFF] uppercase">
                          <Satellite className="h-3 w-3" /> {selectedSatellite}
                        </p>
                        <button
                          type="button"
                          onClick={() => setSelectedSatellite(null)}
                          aria-label="Close satellite information"
                          className="rounded-md p-1 text-[#91A4BD] transition-colors hover:bg-[rgba(140,190,230,0.1)] hover:text-[#F4F8FF] focus-visible:ring-2 focus-visible:ring-[#42D9FF] focus-visible:outline-none"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <p className="mt-2 text-[11px] leading-relaxed text-[#91A4BD]">
                        Decorative orbit animation. Positions are illustrative and are not live
                        satellite telemetry.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            )}
          </div>
        </Reveal>

        <Reveal delay={0.15}>
          <p className="ofi-mono mt-4 text-[10px] leading-relaxed tracking-wider text-[#5B708C] uppercase">
            Markers show verified NASA facility locations with documented roles in microgravity
            combustion research. Satellite paths are illustrative visualizations, not live data.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
