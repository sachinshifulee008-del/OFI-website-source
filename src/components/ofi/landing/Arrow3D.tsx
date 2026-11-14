"use client";

import { useEffect } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";

/**
 * Arrow3D — a genuinely three-dimensional animated arrow.
 *
 * Structure:
 *  - A glass compass badge sitting in a CSS `perspective` field.
 *  - Three chevrons placed at different `translateZ` depths; each one flies
 *    downward and fades in a staggered loop, creating the impression of an
 *    arrow travelling *through* 3D space toward the content below.
 *  - The whole badge tilts in 3D (rotateX / rotateY) following the pointer,
 *    spring-smoothed, so the arrow physically moves with the user.
 *  - Everything is transform/opacity only and disabled under reduced-motion.
 */
export default function Arrow3D({ onClick }: { onClick?: () => void }) {
  const reduced = useReducedMotion();

  // pointer-driven 3D tilt
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const rotateX = useSpring(useTransform(py, [-0.5, 0.5], [14, -14]), { stiffness: 120, damping: 18 });
  const rotateY = useSpring(useTransform(px, [-0.5, 0.5], [-14, 14]), { stiffness: 120, damping: 18 });

  useEffect(() => {
    if (reduced) return;
    const onMove = (e: PointerEvent) => {
      px.set(e.clientX / window.innerWidth - 0.5);
      py.set(e.clientY / window.innerHeight - 0.5);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [px, py, reduced]);

  const chevronAnim = (i: number) =>
    reduced
      ? {}
      : {
          y: [-4, 10, -4],
          opacity: [0.15, 1, 0.15],
          scale: [0.82, 1, 0.82],
        };
  const chevronTransition = (i: number) =>
    reduced
      ? { duration: 0 }
      : {
          duration: 2.1,
          repeat: Infinity,
          ease: "easeInOut" as const,
          delay: i * 0.42,
        };

  return (
    <div className="flex flex-col items-center gap-3" style={{ perspective: 700 }}>
      <motion.button
        type="button"
        onClick={onClick}
        aria-label="Scroll to explore the science"
        className="ofi-glass group relative flex h-16 w-16 cursor-pointer items-center justify-center rounded-full focus-visible:ring-2 focus-visible:ring-[#42D9FF] focus-visible:outline-none"
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        whileHover={reduced ? undefined : { scale: 1.08 }}
        whileTap={{ scale: 0.96 }}
      >
        {/* halo ring */}
        <motion.span
          aria-hidden
          className="absolute inset-0 rounded-full border border-[rgba(66,217,255,0.35)]"
          animate={reduced ? {} : { boxShadow: ["0 0 0px rgba(66,217,255,0.10)", "0 0 26px rgba(66,217,255,0.35)", "0 0 0px rgba(66,217,255,0.10)"] }}
          transition={reduced ? { duration: 0 } : { duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* orbiting satellite dot — real orbital motion around the badge */}
        {!reduced && (
          <motion.span
            aria-hidden
            className="absolute inset-[-7px]"
            animate={{ rotate: 360 }}
            transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
          >
            <span className="absolute top-0 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-[#42D9FF] shadow-[0_0_8px_rgba(66,217,255,0.9)]" />
          </motion.span>
        )}
        {/* 3D chevrons at staggered depths */}
        <span className="relative block h-7 w-7" style={{ transformStyle: "preserve-3d" }}>
          {[0, 1, 2].map((i) => (
            <motion.svg
              key={i}
              aria-hidden
              viewBox="0 0 24 24"
              className="absolute inset-0 h-full w-full"
              style={{ transform: `translateZ(${(2 - i) * 14}px)` }}
              animate={chevronAnim(i)}
              transition={chevronTransition(i)}
            >
              <path
                d="M5 8l7 7 7-7"
                fill="none"
                stroke="#42D9FF"
                strokeWidth={2.4}
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ filter: "drop-shadow(0 0 6px rgba(66,217,255,0.65))" }}
              />
            </motion.svg>
          ))}
        </span>
      </motion.button>

      <motion.p
        className="ofi-mono text-[9px] tracking-[0.28em] text-[#91A4BD] uppercase"
        initial={{ opacity: 0 }}
        animate={{ opacity: reduced ? 0.9 : [0.45, 0.95, 0.45] }}
        transition={reduced ? { duration: 0 } : { duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
      >
        Scroll to explore
      </motion.p>
    </div>
  );
}
