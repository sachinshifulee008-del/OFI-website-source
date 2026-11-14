"use client";

import { useEffect, useMemo, useState } from "react";
import { Info, SlidersHorizontal } from "lucide-react";
import { fetchInvestigations } from "@/lib/ofi/api";
import type { InvestigationDTO } from "@/lib/ofi/types";
import {
  compositeScore, DIMENSIONS, profileInvestigation,
  type DimensionKey, type DimensionResult,
} from "@/lib/ofi/fireSafety";
import { CardSkeleton, ErrorState, ScoreBar, ScoreRing, ViewHeader } from "../shared";
import { cn } from "@/lib/utils";

type Mode = "fireSafety" | "metadata";

const DEFAULT_WEIGHTS: Record<DimensionKey, number> = {
  flammability: 4, flameBehavior: 4, smokeDetection: 3, suppression: 3, habitats: 2,
};

const BUCKET_LABEL: Record<DimensionResult["reasons"][number]["bucket"], string> = {
  identity: "record identity",
  core: "objectives & conditions",
  findings: "documented findings",
};

export default function RankingsView() {
  const [items, setItems] = useState<InvestigationDTO[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>("fireSafety");
  const [weights, setWeights] = useState<Record<DimensionKey, number>>(DEFAULT_WEIGHTS);

  useEffect(() => {
    fetchInvestigations({ pageSize: 50 })
      .then((r) => setItems(r.items))
      .catch((e) => setError(e.message));
  }, []);

  const profiles = useMemo(() => {
    if (!items) return new Map<string, Record<DimensionKey, DimensionResult>>();
    return new Map(items.map((inv) => [inv.code, profileInvestigation(inv)]));
  }, [items]);

  const ranked = useMemo(() => {
    if (!items) return [];
    if (mode === "metadata") return [...items];
    return [...items].sort(
      (a, b) =>
        compositeScore(profiles.get(b.code)!, weights) - compositeScore(profiles.get(a.code)!, weights),
    );
  }, [items, mode, weights, profiles]);

  return (
    <div className="mx-auto max-w-7xl">
      <ViewHeader
        eyebrow="Workspace · Research Intelligence"
        title="Research Rankings"
        description="Two transparent, fully disclosed ranking lenses: a fire-safety relevance profile you can weight yourself, and the OFI metadata-quality score. Both are heuristics over record metadata — not measured scientific results."
      />

      {/* What this is / is not */}
      <div className="mb-6 flex gap-3 rounded-xl border border-[rgba(140,190,230,0.16)] bg-[rgba(9,20,38,0.38)] p-5">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#42D9FF]" />
        <p className="text-xs leading-relaxed text-[#91A4BD]">
          <span className="font-medium text-[#F4F8FF]">What this is not:</span> neither ranking is NASA-approved, a
          spacecraft fire-risk prediction, or a judgment of scientific merit. The{" "}
          <span className="text-[#F4F8FF]">fire-safety profile</span> is a deterministic keyword analysis of each
          record&apos;s documented scope across five fire-safety needs — you control how important each need is, and the
          matched evidence is shown for every score. The <span className="text-[#F4F8FF]">metadata score</span> measures
          data quality only. Full formula in{" "}
          <button onClick={() => (window.location.hash = "/methodology")} className="text-[#42D9FF] hover:underline focus-visible:outline-none">
            Methodology
          </button>.
        </p>
      </div>

      {error && <ErrorState message={error} />}
      {!items && !error && (
        <div className="space-y-3">{[0, 1, 2, 3, 4].map((i) => <CardSkeleton key={i} />)}</div>
      )}

      {items && (
        <>
          {/* Mode switch */}
          <div className="mb-4 flex items-center gap-2">
            {([
              ["fireSafety", "Fire-safety relevance"],
              ["metadata", "Metadata quality"],
            ] as [Mode, string][]).map(([k, label]) => (
              <button
                key={k}
                onClick={() => setMode(k)}
                aria-pressed={mode === k}
                className={cn(
                  "rounded-full border px-3.5 py-1.5 text-[11px] transition-colors focus-visible:ring-2 focus-visible:ring-[#42D9FF] focus-visible:outline-none",
                  mode === k
                    ? "border-[#42D9FF]/60 bg-[rgba(66,217,255,0.12)] text-[#42D9FF]"
                    : "border-[rgba(140,190,230,0.16)] text-[#91A4BD] hover:text-[#F4F8FF]",
                )}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Weight sliders (§9 — user-adjustable importance) */}
          {mode === "fireSafety" && (
            <div className="ofi-card mb-6 p-5">
              <div className="mb-4 flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-[#42D9FF]" />
                <h2 className="text-sm font-semibold text-[#F4F8FF]">Set the importance of each fire-safety need</h2>
              </div>
              <div className="grid grid-cols-1 gap-x-8 gap-y-4 md:grid-cols-2 xl:grid-cols-3">
                {DIMENSIONS.map((d) => (
                  <div key={d.key}>
                    <div className="flex items-baseline justify-between gap-2">
                      <label htmlFor={`w-${d.key}`} className="text-xs font-medium text-[#F4F8FF]" title={d.description}>
                        {d.label}
                      </label>
                      <span className="ofi-mono text-[10px] text-[#42D9FF]">{weights[d.key]}/5</span>
                    </div>
                    <input
                      id={`w-${d.key}`}
                      type="range"
                      min={0}
                      max={5}
                      step={1}
                      value={weights[d.key]}
                      onChange={(e) => setWeights((w) => ({ ...w, [d.key]: Number(e.target.value) }))}
                      className="mt-2 w-full accent-[#42D9FF]"
                      aria-label={`Importance of ${d.label}`}
                    />
                    <p className="mt-1 text-[11px] leading-snug text-[#7C93AE]">{d.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <ol className="space-y-3">
            {ranked.map((inv, i) => {
              const profile = profiles.get(inv.code);
              const composite = profile ? compositeScore(profile, weights) : 0;
              return (
                <li
                  key={inv.code}
                  className={cn("ofi-card p-5", i === 0 && mode === "fireSafety" && "border-[rgba(66,217,255,0.35)]")}
                >
                  <div className="flex flex-col gap-5 md:flex-row">
                    <div className="flex w-16 shrink-0 flex-col items-center">
                      <span className="ofi-mono text-[10px] tracking-wider text-[#5B708C] uppercase">Rank</span>
                      <span className={cn("ofi-display text-2xl", i === 0 ? "text-[#42D9FF]" : "text-[#F4F8FF]")}>{i + 1}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="ofi-mono rounded-md border border-[rgba(66,217,255,0.3)] bg-[rgba(66,217,255,0.08)] px-2 py-0.5 text-[10px] text-[#42D9FF]">{inv.code}</span>
                        <h3 className="text-sm font-semibold text-[#F4F8FF]">{inv.name}</h3>
                      </div>
                      <p className="mt-1.5 line-clamp-1 text-xs text-[#91A4BD]">{inv.objective}</p>

                      {mode === "metadata" ? (
                        <div className="mt-3 grid max-w-xl grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-4">
                          <ScoreBar label="Data quality" value={inv.score.dataQuality} />
                          <ScoreBar label="Relevance" value={inv.score.scientificRelevance} />
                          <ScoreBar label="Completeness" value={inv.score.completeness} />
                          <ScoreBar label="Metadata" value={inv.score.metadataQuality} />
                        </div>
                      ) : (
                        profile && (
                          <>
                            <div className="mt-3 grid max-w-3xl grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-5">
                              {DIMENSIONS.map((d) => (
                                <ScoreBar key={d.key} label={d.short} value={profile[d.key].score} />
                              ))}
                            </div>
                            <div className="mt-3 flex flex-wrap items-center gap-1.5">
                              <span className="ofi-mono mr-1 text-[9px] tracking-[0.18em] text-[#5B708C] uppercase">why</span>
                              {DIMENSIONS.flatMap((d) =>
                                profile[d.key].reasons.map((r) => (
                                  <span
                                    key={`${d.key}-${r.label}`}
                                    className="rounded-full border border-[rgba(140,190,230,0.16)] bg-[rgba(16,34,56,0.38)] px-2 py-0.5 text-[10px] text-[#91A4BD]"
                                    title={`Matched in ${BUCKET_LABEL[r.bucket]} · ${d.label}`}
                                  >
                                    {r.label}
                                  </span>
                                )),
                              ).slice(0, 8)}
                              {DIMENSIONS.every((d) => profile[d.key].reasons.length === 0) && (
                                <span className="text-[10px] text-[#5B708C]">no fire-safety signals documented in this record</span>
                              )}
                            </div>
                          </>
                        )
                      )}
                    </div>
                    <div className="flex shrink-0 flex-col items-center">
                      <ScoreRing value={mode === "fireSafety" ? composite : inv.score.overall} size={58} />
                      <span className="ofi-mono mt-1.5 text-[9px] tracking-wider text-[#5B708C] uppercase">
                        {mode === "fireSafety" ? "weighted" : `overall ${inv.score.overall}`}
                      </span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </>
      )}
    </div>
  );
}
