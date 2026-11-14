"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BrainCircuit, Clock, Database, FileSearch, FlaskConical, Layers, Search, TrendingUp } from "lucide-react";
import { fetchStats } from "@/lib/ofi/api";
import { getActivity, getRecent } from "@/lib/ofi/api";
import type { StatsResponse } from "@/lib/ofi/types";
import { CardSkeleton, ErrorState, Eyebrow, ViewHeader, navigate } from "../shared";
import OverviewScrollSequence from "./OverviewScrollSequence";
import { cn } from "@/lib/utils";

function StatCard({
  label,
  value,
  sub,
  icon,
  delay,
  accent,
}: {
  label: string;
  value: number | string;
  sub: string;
  icon: React.ReactNode;
  delay: number;
  accent: "cyan" | "violet" | "gold" | "flame";
}) {
  const accents = {
    cyan: { text: "text-[#42D9FF]", chip: "border-[#42D9FF]/30 bg-[rgba(66,217,255,0.08)]", rule: "from-[#42D9FF]/70" },
    violet: { text: "text-[#9B8CFF]", chip: "border-[#9B8CFF]/30 bg-[rgba(155,140,255,0.08)]", rule: "from-[#9B8CFF]/70" },
    gold: { text: "text-[#E2B25F]", chip: "border-[#E2B25F]/30 bg-[rgba(232,178,90,0.08)]", rule: "from-[#E2B25F]/70" },
    flame: { text: "text-[#FF7438]", chip: "border-[#FF7438]/30 bg-[rgba(255,116,56,0.08)]", rule: "from-[#FF7438]/70" },
  }[accent];
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="ofi-card p-5"
    >
      <span aria-hidden className={cn("absolute inset-x-0 top-0 h-px bg-gradient-to-r to-transparent", accents.rule)} />
      <div className="flex items-start justify-between">
        <div>
          <p className="ofi-mono text-[10px] tracking-[0.18em] text-[#91A4BD] uppercase">{label}</p>
          <p className={cn("ofi-display mt-2 text-3xl", accents.text)}>{value}</p>
        </div>
        <span className={cn("rounded-lg border p-2.5", accents.chip, accents.text)}>{icon}</span>
      </div>
      <p className="mt-3 text-[11px] text-[#5B708C]">{sub}</p>
    </motion.div>
  );
}

export default function OverviewView() {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [recent, setRecent] = useState<{ code: string; name: string; at: number }[]>([]);
  const [activity, setActivity] = useState<string[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetchStats().then(setStats).catch((e) => setError(e.message));
    // localStorage reads must happen after mount (SSR-safe)
    Promise.resolve().then(() => {
      setRecent(getRecent());
      setActivity(getActivity());
    });
  }, []);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`explorer?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <ViewHeader
        eyebrow="Workspace · Overview"
        title="Research Overview"
        description="A live summary of the OFI research corpus — verified NASA microgravity combustion investigations, verified sources, and entry points into the full workspace. Every metric on this page is computed from real application data."
      />

      {/* Cinematic scroll-scrubbed Earthrise sequence (illustrative footage) */}
      <OverviewScrollSequence />

      {/* Research search */}
      <form onSubmit={submitSearch} className="ofi-glass flex items-center gap-3 rounded-xl p-2 pl-4" role="search">
        <Search className="h-4 w-4 shrink-0 text-[#91A4BD]" aria-hidden />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          type="search"
          aria-label="Search the research corpus"
          placeholder="Search investigations — e.g. cool flames, SAFFIRE, droplet combustion…"
          className="min-w-0 flex-1 bg-transparent py-2 text-sm text-[#F4F8FF] placeholder:text-[#5B708C] focus:outline-none"
        />
        <button
          type="submit"
          className="shrink-0 rounded-lg bg-gradient-to-r from-[#42D9FF] via-[#397BFF] to-[#9B8CFF] px-5 py-2 text-xs font-semibold text-[#050914] transition-transform hover:scale-[1.02] focus-visible:ring-2 focus-visible:ring-[#42D9FF] focus-visible:outline-none"
        >
          Search corpus
        </button>
      </form>

      {error && <ErrorState message={error} />}

      {!stats && !error && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      )}

      {stats && (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Verified investigations" value={stats.totalInvestigations} sub="Curated public NASA records in the OFI corpus" icon={<FileSearch className="h-4 w-4" />} delay={0} accent="cyan" />
            <StatCard label="Verified sources" value={stats.verifiedSources} sub="Linked NASA reports, papers and mission pages" icon={<Layers className="h-4 w-4" />} delay={0.08} accent="violet" />
            <StatCard label="Dataset-annotated records" value={stats.withDataset} sub="Investigations with dataset availability flagged from sources" icon={<Database className="h-4 w-4" />} delay={0.16} accent="gold" />
            <StatCard label="Measurement-annotated records" value={stats.withMeasurementData} sub="Records describing measured variables with units" icon={<TrendingUp className="h-4 w-4" />} delay={0.24} accent="flame" />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Research categories */}
            <div className="ofi-card p-6 lg:col-span-2">
              <Eyebrow>Research categories</Eyebrow>
              <div className="mt-5 space-y-3.5">
                {stats.categories.map((c, i) => (
                  <div key={c.name} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#F4F8FF]">{c.name}</span>
                      <span className="ofi-mono text-[#91A4BD]">{c.count}</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-[rgba(140,190,230,0.1)]">
                      <motion.div
                        className={cn(
                          "h-full rounded-full bg-gradient-to-r",
                          [
                            "from-[#42D9FF] to-[#397BFF]",
                            "from-[#9B8CFF] to-[#42D9FF]",
                            "from-[#E2B25F] to-[#FF9A38]",
                            "from-[#FF7438] to-[#E2B25F]",
                            "from-[#7CE7C4] to-[#42D9FF]",
                            "from-[#397BFF] to-[#9B8CFF]",
                          ][i % 6],
                        )}
                        initial={{ width: 0 }}
                        animate={{ width: `${(c.count / stats.totalInvestigations) * 100}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* FLARE AI entry */}
            <div className="ofi-card relative overflow-hidden p-6">
              <div aria-hidden className="ofi-glow-flame absolute -top-16 -right-16 h-48 w-48 rounded-full" />
              <div className="relative">
                <span className="inline-flex rounded-lg border border-[#FF7438]/30 bg-[#FF7438]/10 p-2.5 text-[#FF7438]">
                  <BrainCircuit className="h-4 w-4" />
                </span>
                <h3 className="mt-4 text-base font-semibold text-[#F4F8FF]">FLARE AI</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-[#91A4BD]">
                  Fire &amp; Laboratory Analysis Research Engine — retrieval-grounded answers with citations to verified
                  corpus records.
                </p>
                <button
                  onClick={() => navigate("flare-ai")}
                  className="mt-5 w-full rounded-lg bg-gradient-to-r from-[#FF7438] to-[#FF9A38] px-4 py-2.5 text-xs font-semibold text-[#050914] transition-transform hover:scale-[1.02] focus-visible:ring-2 focus-visible:ring-[#FF7438] focus-visible:outline-none"
                >
                  Open FLARE AI
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Latest records */}
            <div className="ofi-card p-6 lg:col-span-2">
              <div className="flex items-center justify-between">
                <Eyebrow>Latest verified records</Eyebrow>
                <button onClick={() => navigate("explorer")} className="text-[11px] text-[#42D9FF] hover:underline focus-visible:outline-none">
                  View all →
                </button>
              </div>
              <ul className="mt-4 divide-y divide-[rgba(140,190,230,0.08)]">
                {stats.latestRecords.map((r) => (
                  <li key={r.code}>
                    <button
                      onClick={() => navigate(`explorer?code=${encodeURIComponent(r.code)}`)}
                      className="flex w-full items-center justify-between gap-4 py-3 text-left transition-colors hover:text-[#42D9FF] focus-visible:outline-none"
                    >
                      <div className="min-w-0">
                        <span className="ofi-mono text-[10px] text-[#42D9FF]">{r.code}</span>
                        <p className="truncate text-sm text-[#F4F8FF]">{r.name}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-3 text-[11px] text-[#91A4BD]">
                        <span className="hidden sm:inline">{r.category}</span>
                        <span className="ofi-mono">{r.launchYear ?? "—"}</span>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Dataset availability */}
            <div className="ofi-card p-6">
              <Eyebrow>Dataset availability</Eyebrow>
              <div className="mt-5 space-y-4">
                {stats.statusBreakdown.map((s) => (
                  <div key={s.name} className="flex items-center justify-between rounded-lg border border-[rgba(140,190,230,0.1)] bg-[rgba(9,20,38,0.32)] px-4 py-3">
                    <span className="text-xs text-[#91A4BD]">{s.name}</span>
                    <span className="ofi-mono text-sm text-[#F4F8FF]">{s.count}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => navigate("visualization")}
                className="mt-5 w-full rounded-lg border border-[rgba(140,190,230,0.2)] px-4 py-2.5 text-xs text-[#F4F8FF] transition-colors hover:border-[#42D9FF]/50 focus-visible:outline-none"
              >
                Open Visualization Lab
              </button>
            </div>
          </div>

          {/* Visualization previews + recent activity */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="ofi-card p-6 lg:col-span-2">
              <Eyebrow>Scientific visualization previews</Eyebrow>
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                {[
                  { icon: <Layers className="h-4 w-4" />, label: "Categories", view: "visualization" },
                  { icon: <Clock className="h-4 w-4" />, label: "Timeline", view: "visualization" },
                  { icon: <FlaskConical className="h-4 w-4" />, label: "Facilities", view: "visualization" },
                ].map((p) => (
                  <button
                    key={p.label}
                    onClick={() => navigate(p.view)}
                    className="group flex flex-col items-start gap-3 rounded-xl border border-[rgba(140,190,230,0.12)] bg-[rgba(9,20,38,0.32)] p-4 text-left transition-colors hover:border-[#42D9FF]/40 focus-visible:outline-none"
                  >
                    <span className="rounded-lg bg-[rgba(66,217,255,0.08)] p-2 text-[#42D9FF]">{p.icon}</span>
                    <span className="text-xs text-[#F4F8FF]">{p.label} distribution</span>
                    <span className="ofi-mono text-[9px] text-[#5B708C] uppercase group-hover:text-[#42D9FF]">Open chart →</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Recent activity — honest scope note */}
            <div className="ofi-card p-6">
              <Eyebrow>Recently explored</Eyebrow>
              {recent.length === 0 ? (
                <p className="mt-4 text-xs leading-relaxed text-[#5B708C]">
                  No explorations recorded in this browser session yet. Open an investigation in the Research Explorer
                  and it will appear here (stored locally on this device only).
                </p>
              ) : (
                <ul className="mt-4 space-y-2.5">
                  {recent.map((r) => (
                    <li key={r.code}>
                      <button
                        onClick={() => navigate(`explorer?code=${encodeURIComponent(r.code)}`)}
                        className="flex w-full items-center justify-between gap-3 rounded-lg border border-[rgba(140,190,230,0.1)] bg-[rgba(9,20,38,0.32)] px-3.5 py-2.5 text-left transition-colors hover:border-[#42D9FF]/40 focus-visible:outline-none"
                      >
                        <span className="truncate text-xs text-[#F4F8FF]">{r.name}</span>
                        <span className="ofi-mono shrink-0 text-[10px] text-[#42D9FF]">{r.code}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-5 border-t border-[rgba(140,190,230,0.08)] pt-4">
                <p className="ofi-mono text-[9px] tracking-[0.2em] text-[#5B708C] uppercase">Session activity</p>
                {activity.length === 0 ? (
                  <p className="mt-2 text-[11px] text-[#5B708C]">No session activity yet.</p>
                ) : (
                  <ul className="ofi-scroll mt-2 max-h-24 space-y-1 overflow-y-auto">
                    {activity.slice(0, 5).map((a, i) => (
                      <li key={i} className="ofi-mono text-[10px] text-[#91A4BD]">{a}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
