"use client";

import { useEffect, useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer, Tooltip as RTooltip, XAxis, YAxis } from "recharts";
import { fetchInvestigations } from "@/lib/ofi/api";
import type { InvestigationDTO } from "@/lib/ofi/types";
import { CardSkeleton, ErrorState, ViewHeader } from "../shared";

const tooltipStyle = {
  backgroundColor: "#102238",
  border: "1px solid rgba(140,190,230,0.25)",
  borderRadius: 10,
  fontSize: 12,
  color: "#F4F8FF",
} as const;

export default function IntelligenceView() {
  const [items, setItems] = useState<InvestigationDTO[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchInvestigations({ pageSize: 50 })
      .then((r) => setItems(r.items))
      .catch((e) => setError(e.message));
  }, []);

  const areaMatrix = useMemo(() => {
    if (!items) return [];
    const m = new Map<string, { count: number; scoreSum: number }>();
    for (const inv of items) {
      for (const area of inv.researchAreas) {
        const cur = m.get(area) ?? { count: 0, scoreSum: 0 };
        cur.count += 1;
        cur.scoreSum += inv.score.scientificRelevance;
        m.set(area, cur);
      }
    }
    return [...m.entries()]
      .map(([area, v]) => ({ area, investigations: v.count, avgRelevance: Math.round(v.scoreSum / v.count) }))
      .sort((a, b) => b.investigations - a.investigations)
      .slice(0, 10);
  }, [items]);

  const gravitySpread = useMemo(() => {
    if (!items) return [];
    const buckets = new Map<string, number>();
    for (const inv of items) {
      const g = inv.gravityCondition.includes("ISS") ? "ISS (long-duration µg)"
        : inv.gravityCondition.includes("Shuttle") ? "Space Shuttle (short µg)"
        : inv.gravityCondition.includes("Cygnus") || inv.gravityCondition.includes("free-flying") ? "Free-flying spacecraft"
        : "Other / partial-g";
      buckets.set(g, (buckets.get(g) ?? 0) + 1);
    }
    return [...buckets.entries()].map(([bucket, count]) => ({ bucket, count }));
  }, [items]);

  const radarData = useMemo(() => {
    if (!items) return [];
    const catMap = new Map<string, { dq: number; mq: number; rel: number; n: number }>();
    for (const inv of items) {
      const cur = catMap.get(inv.category) ?? { dq: 0, mq: 0, rel: 0, n: 0 };
      cur.dq += inv.score.dataQuality;
      cur.mq += inv.score.metadataQuality;
      cur.rel += inv.score.scientificRelevance;
      cur.n += 1;
      catMap.set(inv.category, cur);
    }
    return [...catMap.entries()].map(([category, v]) => ({
      category: category.replace(" Combustion", "").replace("Spacecraft Fire Safety", "Fire Safety"),
      dataQuality: Math.round(v.dq / v.n),
      metadataQuality: Math.round(v.mq / v.n),
      relevance: Math.round(v.rel / v.n),
    }));
  }, [items]);

  return (
    <div className="mx-auto max-w-7xl">
      <ViewHeader
        eyebrow="Workspace · Combustion Intelligence"
        title="Combustion Intelligence"
        description="Structural analytics over the verified research corpus — how NASA microgravity combustion research distributes across areas, gravity environments and quality dimensions. All figures derive directly from corpus records."
      />

      {error && <ErrorState message={error} />}
      {!items && !error && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">{[0, 1, 2, 3].map((i) => <CardSkeleton key={i} />)}</div>
      )}

      {items && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Research areas */}
          <div className="ofi-card p-6">
            <h3 className="text-sm font-semibold text-[#F4F8FF]">Research area coverage</h3>
            <p className="mt-1 text-xs text-[#91A4BD]">Investigations per research area (all areas counted, top 10 shown).</p>
            <div className="mt-4 h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={areaMatrix} margin={{ top: 4, right: 8, bottom: 60, left: 0 }}>
                  <CartesianGrid stroke="rgba(140,190,230,0.08)" vertical={false} />
                  <XAxis dataKey="area" stroke="#5B708C" fontSize={9} tickLine={false} angle={-32} textAnchor="end" interval={0} height={80} />
                  <YAxis stroke="#5B708C" fontSize={10} tickLine={false} allowDecimals={false} width={30} />
                  <RTooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(66,217,255,0.06)" }} />
                  <Bar dataKey="investigations" name="Investigations" radius={[5, 5, 0, 0]} animationDuration={700}>
                    {areaMatrix.map((_, i) => <Cell key={i} fill={i % 2 ? "#397BFF" : "#42D9FF"} fillOpacity={0.85} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Gravity environments */}
          <div className="ofi-card p-6">
            <h3 className="text-sm font-semibold text-[#F4F8FF]">Gravity environments</h3>
            <p className="mt-1 text-xs text-[#91A4BD]">
              Where each investigation obtained its microgravity condition — ISS racks, Shuttle sorties or free-flying Cygnus vehicles.
            </p>
            <div className="mt-5 space-y-4">
              {gravitySpread.map((g) => (
                <div key={g.bucket} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#F4F8FF]">{g.bucket}</span>
                    <span className="ofi-mono text-[#91A4BD]">{g.count}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-[rgba(140,190,230,0.1)]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#397BFF] to-[#42D9FF]"
                      style={{ width: `${(g.count / items.length) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-6 rounded-lg border border-[rgba(140,190,230,0.12)] bg-[rgba(9,20,38,0.38)] p-3.5 text-[11px] leading-relaxed text-[#91A4BD]">
              Interpretation: long-duration ISS facilities dominate the corpus because droplet, solid-fuel and smoke
              studies all require extended experimental runs — a fact, not an extrapolation; short-duration Shuttle
              platforms appear only in the older LSP record.
            </p>
          </div>

          {/* Quality radar */}
          <div className="ofi-card p-6 lg:col-span-2">
            <h3 className="text-sm font-semibold text-[#F4F8FF]">Quality dimensions by category</h3>
            <p className="mt-1 text-xs text-[#91A4BD]">
              Average OFI score components per research category. OFI-defined metadata heuristic — not a NASA-approved ranking.
            </p>
            <div className="mt-4 grid h-[340px] grid-cols-1 lg:grid-cols-2">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} outerRadius="72%">
                  <PolarGrid stroke="rgba(140,190,230,0.14)" />
                  <PolarAngleAxis dataKey="category" tick={{ fill: "#91A4BD", fontSize: 10 }} />
                  <RTooltip contentStyle={tooltipStyle} />
                  <Radar name="Data quality" dataKey="dataQuality" stroke="#42D9FF" fill="#42D9FF" fillOpacity={0.18} animationDuration={700} />
                  <Radar name="Relevance" dataKey="relevance" stroke="#FF7438" fill="#FF7438" fillOpacity={0.12} animationDuration={700} />
                  <Radar name="Metadata quality" dataKey="metadataQuality" stroke="#397BFF" fill="#397BFF" fillOpacity={0.12} animationDuration={700} />
                </RadarChart>
              </ResponsiveContainer>
              <div className="hidden flex-col justify-center gap-3 pl-6 lg:flex">
                {radarData.map((r) => (
                  <div key={r.category} className="flex items-center justify-between rounded-lg border border-[rgba(140,190,230,0.1)] bg-[rgba(9,20,38,0.32)] px-4 py-2.5">
                    <span className="text-xs text-[#F4F8FF]">{r.category}</span>
                    <span className="ofi-mono text-[10px] text-[#91A4BD]">DQ {r.dataQuality} · REL {r.relevance} · MQ {r.metadataQuality}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
