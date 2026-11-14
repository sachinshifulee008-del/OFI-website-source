"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { AlertCircle, Database } from "lucide-react";
import { cn } from "@/lib/utils";

/* ---------------- primitives ---------------- */

export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn("ofi-eyebrow", className)}>{children}</p>;
}

export function StatusBadge({ status }: { status: string }) {
  const tone =
    status === "Active"
      ? "text-emerald-300 border-emerald-400/30 bg-emerald-400/10"
      : status === "Preliminary Results"
        ? "text-[#FF7438] border-[#FF7438]/30 bg-[#FF7438]/10"
        : "text-[#42D9FF] border-[#42D9FF]/25 bg-[#42D9FF]/10";
  return (
    <span className={cn("ofi-mono inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] tracking-wider uppercase", tone)}>
      {status}
    </span>
  );
}

export function ScoreRing({ value, size = 52 }: { value: number; size?: number }) {
  const r = (size - 8) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(140,190,230,0.15)" strokeWidth={4} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#42D9FF"
          strokeWidth={4}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c - (c * value) / 100 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        />
      </svg>
      <span className="ofi-mono absolute text-[11px] font-medium text-[#F4F8FF]">{value}</span>
    </div>
  );
}

export function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-[#91A4BD]">{label}</span>
        <span className="ofi-mono text-[#F4F8FF]">{value}</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-[rgba(140,190,230,0.12)]">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-[#42D9FF] via-[#9B8CFF] to-[#E2B25F]"
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

export function EmptyState({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="ofi-card flex flex-col items-center justify-center gap-3 p-10 text-center">
      <div className="rounded-full border border-[rgba(140,190,230,0.2)] bg-[rgba(16,34,56,0.6)] p-3 text-[#91A4BD]">
        {icon ?? <Database className="h-5 w-5" />}
      </div>
      <h3 className="text-sm font-semibold text-[#F4F8FF]">{title}</h3>
      <p className="max-w-md text-xs leading-relaxed text-[#91A4BD]">{description}</p>
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="ofi-card flex items-center gap-3 border-[rgba(255,93,93,0.3)] p-4">
      <AlertCircle className="h-4 w-4 shrink-0 text-[#FF5D5D]" />
      <p className="text-xs text-[#F4F8FF]">{message}</p>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="ofi-card animate-pulse space-y-3 p-6">
      <div className="h-3 w-1/3 rounded bg-[rgba(140,190,230,0.12)]" />
      <div className="h-5 w-2/3 rounded bg-[rgba(140,190,230,0.12)]" />
      <div className="h-3 w-full rounded bg-[rgba(140,190,230,0.08)]" />
      <div className="h-3 w-4/5 rounded bg-[rgba(140,190,230,0.08)]" />
    </div>
  );
}

export function ViewHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow: string;
  title: string;
  description: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <span aria-hidden className="ofi-accent-rule w-10 shrink-0" />
          <Eyebrow>{eyebrow}</Eyebrow>
        </div>
        <h1 className="ofi-display text-2xl text-[#F4F8FF] md:text-3xl">{title}</h1>
        <p className="max-w-2xl text-sm leading-relaxed text-[#91A4BD]">{description}</p>
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}

/* ---------------- scroll reveal ---------------- */

export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduced ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98], delay }}
    >
      {children}
    </motion.div>
  );
}

/* ---------------- ambient particle field (lightweight canvas) ---------------- */

export function ParticleField({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let running = true;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      const { clientWidth, clientHeight } = canvas;
      canvas.width = clientWidth * dpr;
      canvas.height = clientHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const N = 42;
    const parts = Array.from({ length: N }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: 0.6 + Math.random() * 1.6,
      vx: (Math.random() - 0.5) * 0.00016,
      vy: -(0.00008 + Math.random() * 0.00022),
      a: 0.12 + Math.random() * 0.3,
      hue: Math.random() > 0.72 ? "255,116,56" : "66,217,255",
    }));

    const tick = () => {
      if (!running) return;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);
      for (const p of parts) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.y < -0.02) p.y = 1.02;
        if (p.x < -0.02) p.x = 1.02;
        if (p.x > 1.02) p.x = -0.02;
        ctx.beginPath();
        ctx.arc(p.x * w, p.y * h, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.hue},${p.a})`;
        ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [reduced]);

  return <canvas ref={ref} aria-hidden className={cn("pointer-events-none absolute inset-0 h-full w-full", className)} />;
}

/* ---------------- useHashRoute ---------------- */

export function useHashRoute(): string {
  const [route, setRoute] = useState("");
  useEffect(() => {
    const read = () => setRoute(window.location.hash.replace(/^#\/?/, "") || "home");
    read();
    window.addEventListener("hashchange", read);
    return () => window.removeEventListener("hashchange", read);
  }, []);
  return route;
}

export function navigate(route: string) {
  window.location.hash = route === "home" ? "/" : `/${route}`;
  window.scrollTo({ top: 0 });
}
