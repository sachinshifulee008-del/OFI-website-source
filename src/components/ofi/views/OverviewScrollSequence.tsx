"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { navigate } from "../shared";

const FRAME_COUNT = 94;
const ease = [0.21, 0.47, 0.32, 0.98] as const;

/**
 * OverviewScrollSequence — cinematic scroll-scrubbed Earth sequence for the
 * Overview workspace page.
 *
 * Source: user-supplied cinematic Earthrise footage (NASA-styled concept
 * animation). It is presented as illustrative visual material only — a fixed
 * label states it is not real-time mission data, in line with OFI's scientific
 * honesty rules. (The footage's own HUD text, e.g. its counters, is part of
 * the animation, not live telemetry.)
 *
 * Mechanics mirror the landing EarthScrollSequence:
 * - 260vh scroll track + sticky FULL-FRAME viewport (the sequence fills the
 *   whole browser window; 4:3 frames are cover-cropped to the viewport with
 *   lerp-smoothed scrubbing).
 * - Frames live in /ofi/overview-seq (1280x960 WebP, ~2.4 MB total), stream
 *   in progressively (first 6 immediately, then batches of 8).
 * - Overlay HUD readouts sit below the footage's own baked-in top HUD line;
 *   captions crossfade at non-overlapping scroll windows.
 * - transform/opacity-only DOM motion; fully static under reduced-motion.
 */

function frameUrl(i: number) {
  return `/ofi/overview-seq/frame-${String(i + 1).padStart(2, "0")}.webp`;
}

interface Caption {
  at: number;
  // explicit opacity keyframes [start, full-in, full-out-start, end] — kept
  // non-overlapping between adjacent captions so two captions never mix
  window: [number, number, number, number];
  eyebrow: string;
  title: string;
  body: string;
}

// Anchors follow the footage's own beats: dark horizon → full Earth →
// on-screen debris readout → fade-to-black ending (baked-in closing line).
const CAPTIONS: Caption[] = [
  {
    at: 0.14,
    window: [0.08, 0.14, 0.2, 0.28],
    eyebrow: "Sequence 01 — Orbital dawn",
    title: "Every research mission starts here.",
    body: "Out of the dark, the horizon curves into view. The investigations curated in OFI all share this vantage — 400 km above Earth aboard the International Space Station.",
  },
  {
    at: 0.34,
    window: [0.28, 0.34, 0.4, 0.47],
    eyebrow: "Sequence 02 — The vantage",
    title: "A laboratory in freefall.",
    body: "Aboard the ISS, buoyant convection vanishes. Flames turn spherical, burn cooler, and reveal chemistry no ground laboratory can reproduce — the research domain this workspace organizes.",
  },
  {
    at: 0.52,
    window: [0.47, 0.53, 0.62, 0.72],
    eyebrow: "Sequence 03 — The workspace",
    title: "Decades of experiments, one corpus.",
    body: "FLEX, SAFFIRE, SoFIE, ACME and more — verified NASA records structured for search, comparison, visualization and FLARE AI questioning, all summarized on this page.",
  },
];

export default function OverviewScrollSequence() {
  const reduced = useReducedMotion();
  const trackRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<(HTMLImageElement | null)[]>([]);
  const [, setReady] = useState(0); // frames decoded so far (preload bookkeeping)

  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });

  // ---- frame loading (progressive: first frames first) ----
  useEffect(() => {
    let cancelled = false;
    let loaded = 0;
    const imgs: (HTMLImageElement | null)[] = imagesRef.current;

    const load = (i: number) =>
      new Promise<void>((resolve) => {
        const img = new Image();
        img.src = frameUrl(i);
        img.decoding = "async";
        const done = () => {
          if (!cancelled) {
            loaded += 1;
            setReady(loaded);
          }
          resolve();
        };
        if (img.complete && img.naturalWidth > 0) done();
        else {
          img.onload = done;
          img.onerror = done;
        }
        imgs[i] = img;
      });

    (async () => {
      for (let i = 0; i < 6 && !cancelled; i++) await load(i);
      if (cancelled) return;
      for (let i = 6; i < FRAME_COUNT; i += 8) {
        await Promise.all(
          Array.from({ length: Math.min(8, FRAME_COUNT - i) }, (_, k) => load(i + k)),
        );
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // ---- scroll-scrubbed canvas draw with lerp smoothing ----
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let target = 0;
    let current = 0;
    let running = true;

    const drawCover = (img: HTMLImageElement) => {
      const cw = canvas.width;
      const ch = canvas.height;
      const scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
      const w = img.naturalWidth * scale;
      const h = img.naturalHeight * scale;
      ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
    };

    const paint = (idx: number) => {
      const img = imagesRef.current[Math.min(FRAME_COUNT - 1, Math.max(0, Math.round(idx)))];
      if (img && img.complete && img.naturalWidth > 0) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawCover(img);
      }
    };

    const loop = () => {
      if (!running) return;
      current += (target - current) * 0.14;
      if (Math.abs(target - current) > 0.001 || firstPaint) {
        paint(current);
        firstPaint = false;
      }
      raf = requestAnimationFrame(loop);
    };
    let firstPaint = true;

    const onResize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      firstPaint = true;
    };
    onResize();
    window.addEventListener("resize", onResize, { passive: true });

    const unsub = scrollYProgress.on("change", (p) => {
      target = p * (FRAME_COUNT - 1);
    });
    target = scrollYProgress.get() * (FRAME_COUNT - 1);

    if (reduced) {
      const paintWhenLoaded = () => paint(0);
      if (imagesRef.current[0]?.complete) paintWhenLoaded();
      else window.setTimeout(paintWhenLoaded, 350);
      return () => {
        unsub();
        window.removeEventListener("resize", onResize);
      };
    }

    raf = requestAnimationFrame(loop);
    return () => {
      running = false;
      cancelAnimationFrame(raf);
      unsub();
      window.removeEventListener("resize", onResize);
    };
  }, [scrollYProgress, reduced]);

  // hooks stay unconditional — precompute all caption transforms up-front
  const cap0 = useTransform(scrollYProgress, CAPTIONS[0].window, [0, 1, 1, 0]);
  const cap1 = useTransform(scrollYProgress, CAPTIONS[1].window, [0, 1, 1, 0]);
  const cap2 = useTransform(scrollYProgress, CAPTIONS[2].window, [0, 1, 1, 0]);
  const capY = useTransform(scrollYProgress, [0, 1], [reduced ? 0 : 30, reduced ? 0 : -30]);
  const capTransforms = [cap0, cap1, cap2];

  // scroll hint + final CTA visibility (discrete states, low-frequency updates)
  const [phase, setPhase] = useState<"intro" | "scrubbing" | "ending">("intro");
  useEffect(() => {
    const unsub = scrollYProgress.on("change", (p) => {
      setPhase(p < 0.04 ? "intro" : p > 0.82 ? "ending" : "scrubbing");
    });
    return () => unsub();
  }, [scrollYProgress]);

  // frame counter — updated imperatively from scroll, zero re-renders
  const readoutRef = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const unsub = scrollYProgress.on("change", (p) => {
      const no = Math.min(FRAME_COUNT, Math.max(1, Math.round(p * (FRAME_COUNT - 1)) + 1));
      if (readoutRef.current) readoutRef.current.textContent = `${String(no).padStart(2, "0")}/${FRAME_COUNT}`;
    });
    return () => unsub();
  }, [scrollYProgress]);

  return (
    <section ref={trackRef} className="relative my-4 h-[260vh]" aria-label="Cinematic Earthrise scroll sequence">
      {/* FULL-FRAME viewport — the sequence fills the entire browser window */}
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        {/* frame-sequence canvas */}
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden />

        {/* cinematic grade — keeps OFI deep-navy identity and guarantees text contrast */}
        <div aria-hidden className="absolute inset-0 bg-[#050914]/25" />
        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(120%_95%_at_50%_50%,rgba(5,9,20,0.08)_0%,rgba(5,9,20,0.7)_88%)]" />
        <div aria-hidden className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#050914] via-[#050914]/55 to-transparent" />
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-[#050914] via-[#050914]/50 to-transparent" />

        {/* HUD frame markers */}
        <div aria-hidden className="pointer-events-none absolute top-24 left-6 h-6 w-6 border-t border-l border-[rgba(66,217,255,0.35)] md:top-28 md:left-10" />
        <div aria-hidden className="pointer-events-none absolute top-24 right-6 h-6 w-6 border-t border-r border-[rgba(66,217,255,0.35)] md:top-28 md:right-10" />
        <div aria-hidden className="pointer-events-none absolute bottom-36 left-6 hidden h-6 w-6 border-b border-l border-[rgba(66,217,255,0.35)] md:bottom-40 md:block" />
        <div aria-hidden className="pointer-events-none absolute right-6 bottom-36 hidden h-6 w-6 border-r border-b border-[rgba(66,217,255,0.35)] md:right-10 md:bottom-40 md:block" />

        {/* overlay readouts — below the footage's baked-in top HUD line */}
        <p className="ofi-mono absolute top-24 left-1/2 z-20 -translate-x-1/2 text-[9px] tracking-[0.22em] text-[rgba(145,164,189,0.85)] uppercase md:top-28 md:text-[10px] md:tracking-[0.3em]">
          <span className="hidden md:inline">Earthrise · Cinematic sequence · frame </span>
          <span className="md:hidden">Earthrise · </span>
          <span ref={readoutRef}>01/{FRAME_COUNT}</span>
        </p>

        {/* captions — crossfade through the scroll */}
        <motion.div style={{ y: capY }} className="absolute inset-0 z-10">
          {CAPTIONS.map((c, i) => (
            <motion.div
              key={c.eyebrow}
              style={{ opacity: reduced ? (i === 0 ? 1 : 0) : capTransforms[i] }}
              className="absolute inset-x-0 top-1/2 mx-auto max-w-2xl -translate-y-1/2 px-6 text-center md:px-10"
            >
              <p className="ofi-mono text-[10px] tracking-[0.28em] text-[#42D9FF] uppercase [text-shadow:0_1px_12px_rgba(2,4,10,0.95)]">{c.eyebrow}</p>
              <h2 className="ofi-display mt-3 text-3xl leading-snug text-[#F4F8FF] [text-shadow:0_2px_24px_rgba(2,4,10,0.95),0_0_8px_rgba(2,4,10,0.6)] md:mt-4 md:text-5xl">{c.title}</h2>
              <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-[rgba(212,224,240,0.9)] [text-shadow:0_1px_10px_rgba(2,4,10,0.95)] md:text-base">{c.body}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* scroll hint — only while the sequence has not started */}
        <motion.div
          className="absolute inset-x-0 bottom-16 z-20 flex justify-center"
          animate={{ opacity: phase === "intro" ? 1 : 0 }}
          transition={{ duration: 0.4, ease }}
        >
          <span className="ofi-mono inline-flex items-center gap-2 text-[9px] tracking-[0.26em] text-[rgba(145,164,189,0.9)] uppercase [text-shadow:0_1px_10px_rgba(2,4,10,0.95)]">
            Scroll to scrub
            <motion.span animate={reduced ? undefined : { y: [0, 4, 0] }} transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}>
              <ChevronDown className="h-3 w-3 text-[#42D9FF]" aria-hidden />
            </motion.span>
          </span>
        </motion.div>

        {/* final CTA — appears over the footage's fade-to-black ending */}
        <motion.div
          className="absolute inset-x-0 bottom-28 z-20 flex justify-center px-6"
          animate={{ opacity: phase === "ending" ? 1 : 0 }}
          transition={{ duration: 0.5, ease }}
          style={{ pointerEvents: phase === "ending" ? "auto" : "none" }}
        >
          <button
            onClick={() => navigate("explorer")}
            className="group inline-flex items-center gap-2.5 rounded-lg bg-gradient-to-r from-[#42D9FF] to-[#397BFF] px-7 py-3 text-sm font-semibold text-[#050914] transition-transform hover:scale-[1.02] focus-visible:ring-2 focus-visible:ring-[#42D9FF] focus-visible:outline-none"
          >
            EXPLORE THE RESEARCH CORPUS
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </button>
        </motion.div>

        {/* honesty label — this is illustrative footage, not telemetry */}
        <p className="ofi-mono absolute inset-x-0 bottom-1.5 z-20 text-center text-[8px] tracking-[0.2em] text-[rgba(145,164,189,0.75)] uppercase [text-shadow:0_1px_8px_rgba(5,9,20,1)] md:text-[9px]">
          <span className="md:hidden">Illustrative render — not mission data</span>
          <span className="hidden md:inline">Cinematic sequence · Illustrative render — not real-time mission data</span>
        </p>

        {/* scroll progress rail */}
        <div aria-hidden className="absolute top-1/2 right-6 z-20 hidden h-40 w-px -translate-y-1/2 bg-[rgba(140,190,230,0.15)] md:block">
          <motion.div className="w-px origin-top bg-[#42D9FF]" style={{ scaleY: scrollYProgress, height: "100%" }} />
        </div>
      </div>
    </section>
  );
}
