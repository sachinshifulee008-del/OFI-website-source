"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft, BarChart3, BookOpen, BrainCircuit, ChevronRight, FileText,
  FlaskConical, Flame, Gauge, LayoutDashboard, ListOrdered, Menu, Search, ShieldAlert, Sparkles, X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { navigate } from "../shared";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const ease = [0.21, 0.47, 0.32, 0.98] as const;

export type ViewId =
  | "overview" | "fire-safety" | "explorer" | "intelligence" | "visualization" | "comparison"
  | "flare-ai" | "rankings" | "reports" | "library" | "methodology";

export const NAV_ITEMS: { id: ViewId; label: string; icon: React.ReactNode; crumb: string }[] = [
  { id: "overview", label: "Overview", icon: <LayoutDashboard className="h-4 w-4" />, crumb: "Overview" },
  { id: "fire-safety", label: "Fire Safety Intelligence", icon: <ShieldAlert className="h-4 w-4" />, crumb: "Fire Safety Intelligence" },
  { id: "explorer", label: "NASA Research Explorer", icon: <Search className="h-4 w-4" />, crumb: "NASA Research Explorer" },
  { id: "intelligence", label: "Combustion Intelligence", icon: <Gauge className="h-4 w-4" />, crumb: "Combustion Intelligence" },
  { id: "visualization", label: "Visualization Lab", icon: <BarChart3 className="h-4 w-4" />, crumb: "Visualization Lab" },
  { id: "comparison", label: "Experiment Comparison", icon: <FlaskConical className="h-4 w-4" />, crumb: "Experiment Comparison" },
  { id: "flare-ai", label: "FLARE AI", icon: <BrainCircuit className="h-4 w-4" />, crumb: "FLARE AI" },
  { id: "rankings", label: "Research Rankings", icon: <ListOrdered className="h-4 w-4" />, crumb: "Research Rankings" },
  { id: "reports", label: "Reports", icon: <FileText className="h-4 w-4" />, crumb: "Reports" },
  { id: "library", label: "Science Library", icon: <BookOpen className="h-4 w-4" />, crumb: "Science Library" },
  { id: "methodology", label: "Methodology", icon: <Sparkles className="h-4 w-4" />, crumb: "Methodology" },
];

function NavList({
  active,
  collapsed,
  onSelect,
}: {
  active: ViewId;
  collapsed: boolean;
  onSelect: (id: ViewId) => void;
}) {
  return (
    <TooltipProvider delayDuration={200}>
      <nav aria-label="Application sections" className="flex-1 space-y-1 overflow-y-auto px-3 py-4 ofi-scroll">
        <p className={cn("ofi-mono px-2 pb-2 text-[9px] tracking-[0.2em] text-[#5B708C] uppercase", collapsed && "hidden")}>
          Workspace
        </p>
        {NAV_ITEMS.map((item) => {
          const isActive = active === item.id;
          const button = (
            <button
              key={item.id}
              onClick={() => onSelect(item.id)}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "group relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[13px] transition-all focus-visible:ring-2 focus-visible:ring-[#42D9FF] focus-visible:outline-none",
                isActive
                  ? "bg-[rgba(66,217,255,0.1)] font-medium text-[#F4F8FF]"
                  : "text-[#91A4BD] hover:bg-[rgba(16,34,56,0.38)] hover:text-[#F4F8FF]",
              )}
            >
              {isActive && (
                <motion.span
                  layoutId="nav-indicator"
                  className="absolute top-1/2 left-0 h-5 w-0.5 -translate-y-1/2 rounded-full bg-[#42D9FF]"
                />
              )}
              <span className={cn("shrink-0 transition-colors", isActive ? "text-[#42D9FF]" : "text-[#5B708C] group-hover:text-[#42D9FF]")}>
                {item.icon}
              </span>
              {!collapsed && <span className="truncate">{item.label}</span>}
            </button>
          );
          return collapsed ? (
            <Tooltip key={item.id}>
              <TooltipTrigger asChild>{button}</TooltipTrigger>
              <TooltipContent side="right" className="ofi-glass text-[#F4F8FF] text-xs">
                {item.label}
              </TooltipContent>
            </Tooltip>
          ) : (
            button
          );
        })}
      </nav>
    </TooltipProvider>
  );
}

function Brand({ collapsed, onClick }: { collapsed: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 border-b border-[rgba(140,190,230,0.1)] px-4 py-4 focus-visible:ring-2 focus-visible:ring-[#42D9FF] focus-visible:outline-none"
      aria-label="Orbital Flame Intelligence home"
    >
      <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[rgba(66,217,255,0.35)] bg-[rgba(66,217,255,0.08)]">
        <Flame className="h-4.5 w-4.5 text-[#FF7438]" />
        <span className="absolute inset-0 rounded-lg shadow-[0_0_16px_rgba(66,217,255,0.25)_inset,0_0_18px_rgba(232,178,90,0.12)]" />
      </span>
      {!collapsed && (
        <span className="text-left">
          <span className="block text-[13px] leading-tight font-semibold tracking-wide text-[#F4F8FF]">ORBITAL FLAME</span>
          <span className="ofi-mono block text-[9px] tracking-[0.24em] text-[#42D9FF] uppercase">Intelligence</span>
        </span>
      )}
    </button>
  );
}

export default function AppShell({
  active,
  children,
}: {
  active: ViewId;
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const reduced = useReducedMotion();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const item = NAV_ITEMS.find((n) => n.id === active);

  const go = (id: ViewId) => {
    setMobileOpen(false);
    navigate(id);
  };

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 68 : 248 }}
        transition={reduced ? { duration: 0 } : { duration: 0.3, ease }}
        className="ofi-panel sticky top-0 z-30 hidden h-screen shrink-0 flex-col border-r border-[rgba(140,190,230,0.1)] md:flex"
      >
        <Brand collapsed={collapsed} onClick={() => go("overview")} />
        <NavList active={active} collapsed={collapsed} onSelect={go} />
        <div className="border-t border-[rgba(140,190,230,0.1)] p-3">
          <button
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-[rgba(140,190,230,0.14)] px-3 py-2 text-[11px] text-[#91A4BD] transition-colors hover:border-[#42D9FF]/40 hover:text-[#F4F8FF] focus-visible:ring-2 focus-visible:ring-[#42D9FF] focus-visible:outline-none"
          >
            <ChevronRight className={cn("h-3.5 w-3.5 transition-transform", !collapsed && "rotate-180")} />
            {!collapsed && "Collapse"}
          </button>
        </div>
      </motion.aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              className="ofi-panel fixed top-0 left-0 z-50 flex h-full w-[270px] flex-col border-r border-[rgba(140,190,230,0.1)] md:hidden"
              initial={reduced ? { opacity: 0 } : { x: -280 }}
              animate={{ x: 0, opacity: 1 }}
              exit={reduced ? { opacity: 0 } : { x: -280, opacity: 0 }}
              transition={{ duration: 0.25, ease }}
            >
              <div className="flex items-center justify-between border-b border-[rgba(140,190,230,0.1)] pr-3">
                <Brand collapsed={false} onClick={() => { setMobileOpen(false); go("overview"); }} />
                <button
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close navigation"
                  className="rounded-lg p-2 text-[#91A4BD] hover:bg-[rgba(16,34,56,0.38)] hover:text-[#F4F8FF] focus-visible:ring-2 focus-visible:ring-[#42D9FF] focus-visible:outline-none"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <NavList active={active} collapsed={false} onSelect={go} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-20 border-b border-[rgba(140,190,230,0.1)] bg-[rgba(5,9,20,0.35)] backdrop-blur-xl">
          <div className="flex items-center gap-3 px-4 py-3 md:px-6">
            <button
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation"
              className="rounded-lg border border-[rgba(140,190,230,0.14)] p-2 text-[#91A4BD] transition-colors hover:text-[#F4F8FF] focus-visible:ring-2 focus-visible:ring-[#42D9FF] focus-visible:outline-none md:hidden"
            >
              <Menu className="h-4 w-4" />
            </button>
            <button
              onClick={() => navigate("home")}
              className="hidden items-center gap-1.5 text-[12px] text-[#91A4BD] transition-colors hover:text-[#F4F8FF] focus-visible:ring-2 focus-visible:ring-[#42D9FF] focus-visible:outline-none sm:inline-flex"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              OFI
            </button>
            <span className="hidden text-[#5B708C] sm:inline">/</span>
            <nav aria-label="Breadcrumb" className="min-w-0">
              <ol className="flex items-center gap-1.5 text-[12px]">
                <li className="text-[#91A4BD]">Workspace</li>
                <li className="text-[#5B708C]">/</li>
                <li className="truncate font-medium text-[#F4F8FF]">{item?.crumb ?? "Overview"}</li>
              </ol>
            </nav>
            <div className="ml-auto flex items-center gap-2">
              <span className="ofi-mono hidden items-center gap-1.5 rounded-full border border-[rgba(140,190,230,0.16)] px-3 py-1.5 text-[9px] tracking-wider text-[#91A4BD] uppercase lg:inline-flex">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                Corpus online
              </span>
              <span className="ofi-mono hidden rounded-full border border-[#E2B25F]/30 bg-[rgba(232,178,90,0.08)] px-3 py-1.5 text-[9px] tracking-wider text-[#E2B25F] uppercase md:inline-flex">
                Space Apps 2026
              </span>
            </div>
          </div>
        </header>

        <main id="main-content" className="min-w-0 flex-1 px-4 py-6 md:px-8 md:py-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={reduced ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduced ? undefined : { opacity: 0, y: -8 }}
              transition={{ duration: 0.28, ease }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>

        <footer className="border-t border-[rgba(140,190,230,0.08)] px-6 py-4">
          <div className="flex flex-col items-center justify-between gap-2 text-[10px] text-[#5B708C] md:flex-row">
            <span className="ofi-mono tracking-wider uppercase">OFI · Orbital Flame Intelligence</span>
            <span>Independent platform · Not affiliated with or endorsed by NASA</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
