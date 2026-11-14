"use client";

import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, ArrowUpRight, Atom, BrainCircuit, Database, FileSearch, Flame, Layers, LineChart, Quote, ShieldCheck } from "lucide-react";
import { Eyebrow, ParticleField, Reveal, navigate } from "../shared";
import EarthBackdrop from "./EarthBackdrop";
import EarthScrollSequence from "./EarthScrollSequence";
import EarthGlobeSection from "../globe/EarthGlobeSection";
import Arrow3D from "./Arrow3D";

const ease = [0.21, 0.47, 0.32, 0.98] as const;

function FloatingPanel({
  className,
  label,
  value,
  delay,
}: {
  className?: string;
  label: string;
  value: string;
  delay: number;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      aria-hidden
      className={`ofi-glass pointer-events-none absolute hidden rounded-lg px-4 py-3 md:block ${className}`}
      initial={reduced ? false : { opacity: 0, y: 14, scale: 0.96 }}
      animate={{ opacity: 1, y: [0, -7, 0] }}
      transition={{
        opacity: { duration: 0.8, delay, ease },
        y: reduced ? { duration: 0 } : { duration: 6, repeat: Infinity, ease: "easeInOut", delay },
        scale: { duration: 0.8, delay, ease },
      }}
    >
      <p className="ofi-mono text-[9px] tracking-[0.2em] text-[#91A4BD] uppercase">{label}</p>
      <p className="ofi-mono mt-1 text-[11px] font-medium text-[#42D9FF]">{value}</p>
    </motion.div>
  );
}

function Hero() {
  const reduced = useReducedMotion();
  const { scrollY } = useScroll();
  const yVisual = useTransform(scrollY, [0, 600], [0, reduced ? 0 : 60]);
  const yText = useTransform(scrollY, [0, 600], [0, reduced ? 0 : -40]);

  return (
    <section className="relative flex min-h-[100svh] items-center overflow-hidden">
      {/* cinematic Earth-from-orbit backdrop */}
      <EarthBackdrop />
      <ParticleField />

      <div className="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-12 px-6 pt-28 pb-16 md:px-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8 lg:pt-24">
        {/* LEFT */}
        <motion.div style={{ y: yText }} className="space-y-8">
          <motion.div
            initial={reduced ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease }}
            className="inline-flex items-center gap-2.5 rounded-full border border-[rgba(140,190,230,0.18)] bg-[rgba(9,20,38,0.7)] px-4 py-1.5"
          >
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#FF7438]" />
            <span className="ofi-mono text-[10px] tracking-[0.22em] text-[#91A4BD] uppercase">
              NASA Space Apps Challenge 2026 · Flame in Freefall
            </span>
          </motion.div>

          <motion.h1
            initial={reduced ? false : { opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease }}
            className="ofi-display text-[clamp(2.1rem,7vw,5rem)] text-[#F4F8FF]"
          >
            UNDERSTANDING FIRE
            <br />
            <span className="ofi-text-gradient">BEYOND GRAVITY.</span>
          </motion.h1>

          <motion.p
            initial={reduced ? false : { opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.22, ease }}
            className="max-w-xl text-base leading-relaxed text-[#91A4BD] md:text-lg"
          >
            Exploring microgravity combustion research through scientific intelligence, interactive
            visualization, and evidence-grounded AI.
          </motion.p>

          <motion.div
            initial={reduced ? false : { opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.34, ease }}
            className="flex flex-wrap items-center gap-3"
          >
            <button
              onClick={() => navigate("overview")}
              className="group inline-flex items-center gap-2.5 rounded-lg bg-gradient-to-r from-[#42D9FF] to-[#397BFF] px-6 py-3 text-sm font-semibold text-[#050914] transition-transform hover:scale-[1.02] focus-visible:ring-2 focus-visible:ring-[#42D9FF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#050914] focus-visible:outline-none"
            >
              EXPLORE RESEARCH
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
            <button
              onClick={() => navigate("flare-ai")}
              className="inline-flex items-center gap-2.5 rounded-lg border border-[rgba(140,190,230,0.25)] bg-[rgba(16,34,56,0.5)] px-6 py-3 text-sm font-medium text-[#F4F8FF] transition-colors hover:border-[#42D9FF]/50 hover:bg-[rgba(16,34,56,0.8)] focus-visible:ring-2 focus-visible:ring-[#42D9FF] focus-visible:outline-none"
            >
              <Flame className="h-4 w-4 text-[#FF7438]" />
              DISCOVER FLARE AI
            </button>
          </motion.div>

          <motion.div
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.55 }}
            className="ofi-mono flex items-center gap-6 pt-2 text-[10px] tracking-wider text-[#5B708C] uppercase"
          >
            <span>Evidence-grounded · every answer cited</span>
            <span className="hidden sm:inline">·</span>
            <span className="hidden sm:inline">No fabricated data, ever</span>
          </motion.div>
        </motion.div>

        {/* RIGHT — flame visual */}
        <motion.div style={{ y: yVisual }} className="relative mx-auto w-full max-w-[560px]">
          <motion.div
            initial={reduced ? false : { opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.1, ease }}
            className="relative overflow-hidden rounded-2xl border border-[rgba(140,190,230,0.16)]"
          >
            <Image
              src="/ofi/hero-flame.png"
              alt="Spherical blue flame with a warm orange core suspended in a dark microgravity combustion chamber"
              width={1344}
              height={768}
              priority
              className="h-auto w-full object-cover"
            />
            {/* measurement overlay lines */}
            <div aria-hidden className="absolute inset-0">
              <div className="absolute top-1/2 left-0 h-px w-full bg-gradient-to-r from-transparent via-[rgba(66,217,255,0.25)] to-transparent" />
              <div className="absolute top-0 left-1/2 h-full w-px bg-gradient-to-b from-transparent via-[rgba(66,217,255,0.18)] to-transparent" />
              <div className="absolute top-4 left-4 h-5 w-5 border-t border-l border-[rgba(66,217,255,0.4)]" />
              <div className="absolute top-4 right-4 h-5 w-5 border-t border-r border-[rgba(66,217,255,0.4)]" />
              <div className="absolute bottom-4 left-4 h-5 w-5 border-b border-l border-[rgba(66,217,255,0.4)]" />
              <div className="absolute right-4 bottom-4 h-5 w-5 border-b border-r border-[rgba(66,217,255,0.4)]" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050914]/70 via-transparent to-[#050914]/25" />
            </div>
            {/* caption strip */}
            <div className="absolute bottom-3 left-1/2 w-[86%] -translate-x-1/2">
              <div className="ofi-glass flex items-center justify-between rounded-lg px-4 py-2.5">
                <span className="ofi-mono text-[10px] tracking-wider text-[#91A4BD] uppercase">
                  Fig. 01 — Spherical diffusion regime
                </span>
                <span className="ofi-mono text-[10px] text-[#42D9FF]">µg ≈ 10⁻⁶ g</span>
              </div>
            </div>
          </motion.div>

          <FloatingPanel label="Context" value="MICROGRAVITY COMBUSTION" className="top-6 -left-4 lg:-left-10" delay={0.9} />
          <FloatingPanel label="Program" value="NASA RESEARCH" className="-right-2 bottom-24 lg:-right-8" delay={1.3} />
          <FloatingPanel label="Method" value="SCIENTIFIC ANALYSIS" className="-bottom-6 left-10" delay={1.7} />
        </motion.div>
      </div>

      {/* 3D animated scroll arrow */}
      <motion.div
        aria-hidden={false}
        className="absolute bottom-5 left-1/2 z-20 -translate-x-1/2"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.6, duration: 1, ease }}
      >
        <Arrow3D onClick={() => document.getElementById("orbit")?.scrollIntoView({ behavior: reduced ? "auto" : "smooth" })} />
      </motion.div>
    </section>
  );
}

function SectionShell({
  id,
  eyebrow,
  title,
  lead,
  children,
  flip,
}: {
  id: string;
  eyebrow: string;
  title: string;
  lead: string;
  children: React.ReactNode;
  flip?: boolean;
}) {
  return (
    <section id={id} className="relative border-t border-[rgba(140,190,230,0.08)] py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <Reveal className="max-w-3xl">
          <Eyebrow>{eyebrow}</Eyebrow>
          <h2 className="ofi-display mt-3 text-3xl text-[#F4F8FF] md:text-4xl">{title}</h2>
          <p className="mt-4 text-base leading-relaxed text-[#91A4BD]">{lead}</p>
        </Reveal>
        <div className={`mt-12 grid grid-cols-1 gap-6 lg:grid-cols-3 ${flip ? "lg:[direction:rtl]" : ""} [&>*]:[direction:ltr]`}>
          {children}
        </div>
      </div>
    </section>
  );
}

function FeatureCard({
  icon,
  title,
  body,
  mono,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  mono?: string;
}) {
  return (
    <Reveal className="h-full">
      <div className="ofi-card group flex h-full flex-col gap-4 p-7">
        <div className="inline-flex w-fit rounded-lg border border-[rgba(140,190,230,0.16)] bg-[rgba(16,34,56,0.6)] p-3 text-[#42D9FF] transition-colors group-hover:border-[#42D9FF]/40 group-hover:text-[#F4F8FF]">
          {icon}
        </div>
        <h3 className="text-lg font-semibold text-[#F4F8FF]">{title}</h3>
        <p className="flex-1 text-sm leading-relaxed text-[#91A4BD]">{body}</p>
        {mono && <p className="ofi-mono text-[10px] tracking-wider text-[#5B708C] uppercase">{mono}</p>}
      </div>
    </Reveal>
  );
}

export default function LandingPage() {
  return (
    <main className="relative">
      <Hero />

      {/* SCROLL SEQUENCE — scroll-scrubbed Earth orbit footage (48 frames) */}
      <EarthScrollSequence />

      {/* INTERACTIVE 3D EARTH — lazy-loaded cinematic globe */}
      <EarthGlobeSection />

      {/* SECTION 1 — THE SCIENCE */}
      <SectionShell
        id="science"
        eyebrow="Section 01 — The Science"
        title="How microgravity rewrites fire."
        lead="On Earth, buoyancy shapes every flame: hot gases rise, drawing fresh oxygen upward and stretching flames into familiar teardrops. In freefall, that engine disappears — flames become spherical, burn more slowly, and reveal chemistry that is invisible in normal gravity."
      >
        <FeatureCard
          icon={<Atom className="h-5 w-5" />}
          title="Spherical flames"
          body="Without buoyant convection, transport of fuel and oxygen happens by diffusion alone. Flames shrink into soft spheres — like the droplet flames of FLEX — burning at rates set purely by molecular transport."
          mono="Diffusion-limited combustion"
        />
        <FeatureCard
          icon={<Flame className="h-5 w-5" />}
          title="Cool flames"
          body="NASA's FLEX investigation discovered droplets that keep burning after the visible hot flame extinguishes — a faint, low-temperature cool-flame regime that buoyancy normally masks on Earth."
          mono="Discovered aboard the ISS"
        />
        <FeatureCard
          icon={<ShieldCheck className="h-5 w-5" />}
          title="Fire safety in space"
          body="Microgravity changes how materials ignite and how flames spread across solids — the SAFFIRE experiments burned full-scale samples in unmanned spacecraft to make crewed vehicles safer."
          mono="SAFFIRE I · II · III · VI"
        />
      </SectionShell>

      {/* SECTION 2 — RESEARCH INTELLIGENCE */}
      <SectionShell
        id="intelligence"
        eyebrow="Section 02 — Research Intelligence"
        title="Explore and compare the NASA corpus."
        lead="OFI organizes verified NASA microgravity combustion investigations into a structured catalogue. Search by research area, platform or facility; open rich metadata views; and compare compatible experiments side by side — with scientific compatibility checks built in."
        flip
      >
        <FeatureCard
          icon={<FileSearch className="h-5 w-5" />}
          title="Research Explorer"
          body="A curated catalogue of investigations — FLEX, SAFFIRE, ACME, SoFIE, SAME and more — with objectives, facilities, fuel materials, research areas and links to NASA source documents."
          mono="14 verified records"
        />
        <FeatureCard
          icon={<Layers className="h-5 w-5" />}
          title="Experiment Comparison"
          body="Compare investigations only where comparison is scientifically valid. OFI checks combustion type, gravity conditions and measurement modality, and explains honestly when a comparison is not valid."
          mono="Compatibility-aware"
        />
        <FeatureCard
          icon={<LineChart className="h-5 w-5" />}
          title="Visualization Lab"
          body="Charts are computed live from the corpus — research categories, platforms, facilities, timelines and score distributions. No invented measurements, ever."
          mono="Real data only"
        />
      </SectionShell>

      {/* SECTION 3 — FLARE AI */}
      <section id="flare" className="relative overflow-hidden border-t border-[rgba(140,190,230,0.08)] py-20 md:py-28">
        <div aria-hidden className="ofi-glow-cyan absolute top-1/2 left-1/2 h-[600px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full" />
        <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 md:px-10 lg:grid-cols-2">
          <Reveal>
            <Eyebrow>Section 03 — FLARE AI</Eyebrow>
            <h2 className="ofi-display mt-3 text-3xl text-[#F4F8FF] md:text-4xl">
              Fire &amp; Laboratory Analysis
              <br />
              Research Engine.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-[#91A4BD]">
              FLARE AI retrieves relevant NASA research records <em className="text-[#F4F8FF] not-italic">before</em> answering,
              cites every source it uses, separates facts from interpretation, and states openly when the evidence is
              insufficient. It never fabricates measurements, citations or DOIs.
            </p>
            <ul className="mt-8 space-y-3">
              {[
                "Retrieval-grounded answers with inline record citations",
                "Fact vs. interpretation clearly separated",
                "Uncertainty and evidence gaps disclosed",
                "Rate-limited and key-safe: credentials stay server-side",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-[#91A4BD]">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#42D9FF]" />
                  {item}
                </li>
              ))}
            </ul>
            <button
              onClick={() => navigate("flare-ai")}
              className="group mt-8 inline-flex items-center gap-2.5 rounded-lg bg-gradient-to-r from-[#FF7438] to-[#FF9A38] px-6 py-3 text-sm font-semibold text-[#050914] transition-transform hover:scale-[1.02] focus-visible:ring-2 focus-visible:ring-[#FF7438] focus-visible:outline-none"
            >
              Ask FLARE AI
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="ofi-glass relative rounded-2xl p-6 md:p-8">
              <div className="flex items-center justify-between border-b border-[rgba(140,190,230,0.12)] pb-4">
                <div className="flex items-center gap-3">
                  <span className="rounded-lg border border-[#FF7438]/30 bg-[#FF7438]/10 p-2">
                    <BrainCircuit className="h-4 w-4 text-[#FF7438]" />
                  </span>
                  <div>
                    <p className="text-sm font-medium text-[#F4F8FF]">FLARE AI</p>
                    <p className="ofi-mono text-[10px] text-[#91A4BD]">evidence-grounded research assistant</p>
                  </div>
                </div>
                <span className="ofi-mono rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-0.5 text-[9px] tracking-wider text-emerald-300 uppercase">
                  grounded
                </span>
              </div>
              <div className="space-y-4 pt-5 text-sm">
                <div className="ml-auto max-w-[85%] rounded-xl rounded-br-sm border border-[rgba(140,190,230,0.14)] bg-[rgba(57,123,255,0.12)] px-4 py-3 text-[#F4F8FF]">
                  Explain flame behaviour in microgravity.
                </div>
                <div className="max-w-[92%] rounded-xl rounded-bl-sm border border-[rgba(140,190,230,0.14)] bg-[rgba(9,20,38,0.8)] px-4 py-3 leading-relaxed text-[#91A4BD]">
                  In freefall, buoyant convection vanishes — flames become spherical and diffusion-limited.
                  The FLEX investigation observed droplets that continue to burn after the visible flame
                  extinguishes: the cool-flame regime <span className="ofi-mono text-[#42D9FF]">[FLEX]</span>. SAFFIRE
                  demonstrated that flame spread over large solid samples persists in low gravity{" "}
                  <span className="ofi-mono text-[#42D9FF]">[SAFFIRE-I]</span>.
                  <span className="mt-2 block text-[#5B708C] italic">Interpretation: combustion chemistry sets the pace…</span>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {["[FLEX]", "[SAFFIRE-I]", "[CFI-G]"].map((c) => (
                    <span key={c} className="ofi-mono rounded-md border border-[rgba(66,217,255,0.25)] bg-[rgba(66,217,255,0.08)] px-2.5 py-1 text-[10px] text-[#42D9FF]">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* SECTION 4 — RESEARCH COLLECTIONS */}
      <SectionShell
        id="collections"
        eyebrow="Section 04 — Research Collections"
        title="Verified investigations, honestly presented."
        lead="Every record in OFI is curated from public NASA and peer-reviewed sources. Launch years are shown only when a source states them, DOIs appear only when verified, and records without sufficient evidence are labelled as such."
      >
        {[
          {
            title: "Droplet Combustion",
            body: "FLEX and FLEX-2 on the ISS Combustion Integrated Rack — inert-gas suppression effectiveness and cool-flame discovery.",
          },
          {
            title: "Spacecraft Fire Safety",
            body: "SAFFIRE I, II, III and VI — full-scale flame spread and flammability limits aboard uncrewed Cygnus vehicles.",
          },
          {
            title: "Soot & Smoke",
            body: "LSP and SAME — soot formation in jet diffusion flames and the first real-time smoke aerosol data in microgravity.",
          },
        ].map((c, i) => (
          <FeatureCard key={c.title} title={c.title} body={c.body} icon={<Database className="h-5 w-5" />} mono={`Collection 0${i + 1}`} />
        ))}
      </SectionShell>

      {/* SECTION 5 — FINAL CTA (Earth reprise) */}
      <section id="enter" className="relative overflow-hidden border-t border-[rgba(140,190,230,0.08)] py-24 md:py-32">
        {/* cinematic Earth reprise, heavily graded */}
        <motion.div
          aria-hidden
          className="absolute inset-0 overflow-hidden"
          initial={false}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <motion.div
            className="absolute inset-[-4%]"
            initial={{ scale: 1.05 }}
            whileInView={{ scale: 1.12 }}
            viewport={{ once: true }}
            transition={{ duration: 24, ease: "easeInOut" }}
          >
            <Image
              src="/ofi/earth-orbit.jpg"
              alt=""
              fill
              sizes="100vw"
              className="object-cover object-[60%_72%]"
            />
          </motion.div>
          <div className="absolute inset-0 bg-[#050914]/86" />
          <div className="absolute inset-0 bg-[radial-gradient(90%_70%_at_50%_45%,rgba(5,9,20,0.55)_0%,rgba(5,9,20,0.92)_80%)]" />
        </motion.div>
        <div aria-hidden className="ofi-glow-flame absolute top-0 left-1/2 h-[420px] w-[720px] -translate-x-1/2 rounded-full" />
        <Reveal className="relative mx-auto max-w-3xl px-6 text-center">
          <Quote className="mx-auto mb-6 h-8 w-8 text-[#FF7438]" />
          <h2 className="ofi-display text-3xl text-[#F4F8FF] md:text-5xl">
            Enter the research environment.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-[#91A4BD]">
            The full OFI workspace — overview dashboard, research explorer, visualization lab, experiment
            comparison, research rankings and FLARE AI — is one click away.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => navigate("overview")}
              className="group inline-flex items-center gap-2.5 rounded-lg bg-gradient-to-r from-[#42D9FF] to-[#397BFF] px-8 py-3.5 text-sm font-semibold text-[#050914] transition-transform hover:scale-[1.02] focus-visible:ring-2 focus-visible:ring-[#42D9FF] focus-visible:outline-none"
            >
              ENTER WORKSPACE
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
            <button
              onClick={() => navigate("methodology")}
              className="inline-flex items-center gap-2 rounded-lg border border-[rgba(140,190,230,0.25)] bg-[rgba(16,34,56,0.5)] px-8 py-3.5 text-sm font-medium text-[#F4F8FF] transition-colors hover:border-[#42D9FF]/50"
            >
              READ METHODOLOGY
              <ArrowUpRight className="h-4 w-4 text-[#42D9FF]" />
            </button>
          </div>
        </Reveal>
      </section>

      <footer className="border-t border-[rgba(140,190,230,0.08)] py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 md:flex-row md:px-10">
          <p className="ofi-mono text-[10px] tracking-wider text-[#5B708C] uppercase">
            ORBITAL FLAME INTELLIGENCE — independent research platform
          </p>
          <p className="text-[11px] text-[#5B708C]">
            Built for NASA Space Apps Challenge 2026 · Not affiliated with or endorsed by NASA
          </p>
        </div>
      </footer>
    </main>
  );
}
