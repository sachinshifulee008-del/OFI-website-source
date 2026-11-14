"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { navigate } from "../shared";

const FRAME_COUNT = 48;
const ease = [0.21, 0.47, 0.32, 0.98] as const;

/**
 * EarthScrollSequence — cinematic scroll-scrubbed orbital sequence.
 *
 * A 300vh scroll track with a sticky viewport. Scrolling scrubs through the
 * 48-frame Earth-from-orbit footage frame by frame (lerp-smoothed so the
 * scrub feels filmic, not steppy). Overlaid mission captions crossfade at
 * thirds of the sequence, plus a mono progress readout and HUD frame lines.
 *
 * - Canvas draw, `cover` fit; frames stream in progressively, first frame
 *   paints immediately.
 * - transform/opacity only for DOM motion; fully static under reduced-motion
 *   (first frame + first caption).
 */

function frameUrl(i: number) {
  return `/ofi/earth-seq/frame-${String(i + 1).padStart(2, "0")}.webp`;
}

function captionOpacity(progress: number, at: number) {
  const fadeIn = Math.min(1, Math.max(0, (progress - (at - 0.2)) / 0.14));
  const fadeOut = Math.min(1, Math.max(0, (at + 0.2 - progress) / 0.14));
  return Math.min(fadeIn, fadeOut);
}

interface Caption {
  at: number; // sequence progress where this caption is centered
  eyebrow: string;
  title: string;
  body: string;
}

const CAPTIONS: Caption[] = [
  {
    at: 0.12,
    eyebrow: "Sequence 01 — Orbit",
    title: "Our laboratory circles overhead.",
    body: "Every experiment in this platform ran 400 km above Earth, aboard the International Space Station — where fire behaves in ways no ground laboratory can reproduce.",
  },
  {
    at: 0.5,
    eyebrow: "Sequence 02 — Microgravity",
    title: "Remove gravity. Fire transforms.",
    body: "Buoyant convection vanishes in freefall. Flames turn spherical, burn cooler and slower, and expose chemistry that Earth's gravity hides — the research domain OFI was built to organize.",
  },
  {
    at: 0.88,
    eyebrow: "Sequence 03 — Intelligence",
    title: "Decades of research, structured at last.",
    body: "FLEX, SAFFIRE, SoFIE, ACME and more — curated into a verified corpus you can search, compare, visualize, and interrogate with FLARE AI.",
  },
];

export default function EarthScrollSequence() {
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

    // load first 6 frames immediately (initial paint), rest in small batches
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
    let target = 0; // frame index derived from scroll
    let current = 0; // lerped frame index actually drawn
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
      // spring-less exponential lerp toward the scroll target
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
      // static, accessible fallback: first frame only
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

  // hooks must be unconditional — precompute all caption transforms up-front
  const cap0 = useTransform(scrollYProgress, (progress) => captionOpacity(progress, CAPTIONS[0].at));
  const cap1 = useTransform(scrollYProgress, (progress) => captionOpacity(progress, CAPTIONS[1].at));
  const cap2 = useTransform(scrollYProgress, (progress) => captionOpacity(progress, CAPTIONS[2].at));
  const capY = useTransform(scrollYProgress, [0, 1], [reduced ? 0 : 40, reduced ? 0 : -40]);
  const capTransforms = [cap0, cap1, cap2];

  // dominant caption index — used to know which section CTA to show (2 = final)
  const [dominant, setDominant] = useState(0);
  useEffect(() => {
    const unsub = scrollYProgress.on("change", (p) => {
      let best = 0;
      let bestDist = Infinity;
      CAPTIONS.forEach((c, i) => {
        const d = Math.abs(p - c.at);
        if (d < bestDist) {
          bestDist = d;
          best = i;
        }
      });
      setDominant(best);
    });
    return () => unsub();
  }, [scrollYProgress]);

  // frame counter is updated imperatively from the draw loop — zero re-renders
  const readoutRef = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const unsub = scrollYProgress.on("change", (p) => {
      const no = Math.min(FRAME_COUNT, Math.max(1, Math.round(p * (FRAME_COUNT - 1)) + 1));
      if (readoutRef.current) readoutRef.current.textContent = `${String(no).padStart(2, "0")}/${FRAME_COUNT}`;
    });
    return () => unsub();
  }, [scrollYProgress]);

  return (
    <section id="orbit" ref={trackRef} className="relative h-[300vh]" aria-label="Orbital Earth scroll sequence">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        {/* frame-sequence canvas */}
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden />

        {/* cinematic grade — keeps OFI deep-navy identity and guarantees text contrast */}
        <div aria-hidden className="absolute inset-0 bg-[#050914]/30" />
        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(120%_95%_at_50%_50%,rgba(5,9,20,0.1)_0%,rgba(5,9,20,0.72)_88%)]" />
        <div aria-hidden className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#050914] via-[#050914]/55 to-transparent" />
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-[#050914] via-[#050914]/50 to-transparent" />
        <div aria-hidden className="ofi-grid-bg absolute inset-0 opacity-25" />

        {/* HUD frame markers */}
        <div aria-hidden className="pointer-events-none absolute top-24 left-6 h-6 w-6 border-t border-l border-[rgba(66,217,255,0.35)] md:top-28 md:left-10" />
        <div aria-hidden className="pointer-events-none absolute top-24 right-6 h-6 w-6 border-t border-r border-[rgba(66,217,255,0.35)] md:top-28 md:right-10" />
        <div aria-hidden className="pointer-events-none absolute bottom-40 left-6 hidden h-6 w-6 border-b border-l border-[rgba(66,217,255,0.35)] md:bottom-44 md:block" />
        <div aria-hidden className="pointer-events-none absolute right-6 bottom-40 hidden h-6 w-6 border-r border-b border-[rgba(66,217,255,0.35)] md:right-10 md:bottom-44 md:block" />

        {/* telemetry readout */}
        <motion.div
          className="absolute top-28 left-1/2 z-20 -translate-x-1/2"
          initial={reduced ? false : { opacity: 0, y: -8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease }}
        >
          <p className="ofi-mono text-[9px] tracking-[0.22em] text-[rgba(145,164,189,0.85)] uppercase md:text-[10px] md:tracking-[0.3em]">
            <span className="md:hidden">Orbit · </span>
            <span className="hidden md:inline">Orbital sequence · ISS view · frame </span>
            <span ref={readoutRef}>01/{FRAME_COUNT}</span>
          </p>
        </motion.div>

        {/* mission captions — crossfade through the scroll */}
        <motion.div style={{ y: capY }} className="absolute inset-0 z-10">
          {CAPTIONS.map((c, i) => (
            <motion.div
              key={c.eyebrow}
              style={{ opacity: reduced ? (i === 0 ? 1 : 0) : capTransforms[i] }}
              className="absolute inset-x-0 top-1/2 mx-auto max-w-2xl px-6 text-center md:px-10"
            >
              <p className="ofi-mono text-[10px] tracking-[0.28em] text-[#42D9FF] uppercase">{c.eyebrow}</p>
              <h2 className="ofi-display mt-4 text-3xl text-[#F4F8FF] md:text-5xl">{c.title}</h2>
              <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-[rgba(212,224,240,0.85)] md:text-base">{c.body}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* final CTA appears with the last caption */}
        <motion.div
          className="absolute inset-x-0 bottom-24 z-20 flex justify-center px-6"
          style={{ opacity: reduced ? (dominant === 2 ? 1 : 0) : capTransforms[2] }}
        >
          <button
            onClick={() => navigate("overview")}
            className="group inline-flex items-center gap-2.5 rounded-lg bg-gradient-to-r from-[#42D9FF] to-[#397BFF] px-7 py-3 text-sm font-semibold text-[#050914] transition-transform hover:scale-[1.02] focus-visible:ring-2 focus-visible:ring-[#42D9FF] focus-visible:outline-none"
          >
            ENTER THE WORKSPACE
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </button>
        </motion.div>

        {/* scroll progress rail */}
        <div aria-hidden className="absolute top-1/2 right-6 z-20 hidden h-40 w-px -translate-y-1/2 bg-[rgba(140,190,230,0.15)] md:block">
          <motion.div
            className="w-px origin-top bg-[#42D9FF]"
            style={{ scaleY: scrollYProgress, height: "100%" }}
          />
        </div>
      </div>
    </section>
  );
}
