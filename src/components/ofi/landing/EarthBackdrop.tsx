"use client";

import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";

/**
 * Cinematic Earth-from-orbit backdrop.
 *
 * - Slow "Ken Burns" drift/zoom loop over the uploaded NASA-style orbital image.
 * - Scroll parallax: the Earth sinks and fades as the user scrolls into the page.
 * - Cinematic grade: directional gradient (text column readability), top/bottom
 *   vignettes and a slow sunrise pulse on the atmospheric limb.
 * - All motion uses GPU-friendly transform/opacity only; disabled under
 *   prefers-reduced-motion.
 */
export default function EarthBackdrop() {
  const reduced = useReducedMotion();
  const { scrollY } = useScroll();
  const parallaxY = useTransform(scrollY, [0, 900], [0, reduced ? 0 : 150]);
  const fade = useTransform(scrollY, [0, 750], [1, reduced ? 1 : 0.18]);
  const scrollZoom = useTransform(scrollY, [0, 900], [1, reduced ? 1 : 1.14]);

  return (
    <motion.div
      aria-hidden
      className="absolute inset-0 overflow-hidden"
      style={{ y: parallaxY, opacity: fade }}
    >
      {/* Earth image — continuous cinematic drift */}
      <motion.div className="absolute inset-[-6%]" style={{ scale: scrollZoom }}>
        <motion.div
          className="absolute inset-0"
          initial={reduced ? false : { scale: 1.01 }}
          animate={reduced ? {} : { scale: [1.01, 1.1, 1.05, 1.01], x: ["0%", "-2.2%", "-0.8%", "0%"] }}
          transition={{ duration: 52, repeat: Infinity, ease: "easeInOut" }}
        >
          <Image
            src="/ofi/earth-orbit.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-[68%_38%]"
          />
        </motion.div>
      </motion.div>

      {/* cinematic colour grade — keeps the deep-navy OFI identity */}
      <div className="absolute inset-0 bg-[#050914]/38" />
      <div className="absolute inset-0 bg-[radial-gradient(115%_90%_at_16%_42%,rgba(5,9,20,0.9)_0%,rgba(5,9,20,0.5)_45%,rgba(5,9,20,0.05)_78%)]" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#050914] via-[#050914]/40 to-transparent" />

      {/* top / bottom vignettes */}
      <div className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-[#050914] via-[#050914]/60 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-[#050914] via-[#050914]/45 to-transparent" />

      {/* slow sunrise pulse on the atmospheric limb */}
      <motion.div
        className="ofi-glow-flame absolute top-[16%] right-[6%] h-[420px] w-[420px] rounded-full"
        animate={reduced ? {} : { opacity: [0.4, 0.85, 0.4], scale: [1, 1.18, 1] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* cyan atmosphere haze */}
      <motion.div
        className="ofi-glow-cyan absolute top-[30%] right-[16%] h-[520px] w-[520px] rounded-full"
        animate={reduced ? {} : { opacity: [0.5, 0.9, 0.5] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
      />

      {/* fine technical grid, very subtle over the earth */}
      <div className="ofi-grid-bg absolute inset-0 opacity-40" />

      {/* orbital sweep line — slow diagonal light scan */}
      <motion.div
        className="absolute top-0 bottom-0 left-1/2 w-px bg-gradient-to-b from-transparent via-[rgba(66,217,255,0.10)] to-transparent"
        animate={reduced ? {} : { left: ["18%", "82%", "18%"] }}
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
      />
    </motion.div>
  );
}
