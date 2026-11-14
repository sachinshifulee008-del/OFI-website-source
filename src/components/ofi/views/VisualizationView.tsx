"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart,
  ResponsiveContainer, Scatter, ScatterChart, Tooltip as RTooltip, XAxis, YAxis,
} from "recharts";
import { Download, Info } from "lucide-react";
import { downloadCsv, fetchDatasets } from "@/lib/ofi/api";
import type { CorpusDataset } from "@/lib/ofi/types";
import { CardSkeleton, EmptyState, ErrorState, ViewHeader } from "../shared";
import { cn } from "@/lib/utils";

const CHART_KINDS: { value: CorpusDataset["kind"]; label: string }[] = [
  { value: "bar", label: "Bar" },
  { value: "line", label: "Line" },
  { value: "pie", label: "Donut" },
  { value: "scatter", label: "Scatter" },
];

const AXIS = { stroke: "#5B708C", fontSize: 10, tickLine: false } as const;
const GRID = { stroke: "rgba(140,190,230,0.08)" } as const;

const tooltipStyle = {
  backgroundColor: "#102238",
  border: "1px solid rgba(140,190,230,0.25)",
  borderRadius: 10,
  fontSize: 12,
  color: "#F4F8FF",
} as const;

const PALETTE = ["#42D9FF", "#397BFF", "#FF7438", "#8BE9C6", "#91A4BD"];

function ChartSurface({ ds, kind }: { ds: CorpusDataset; kind: CorpusDataset["kind"] }) {
  const render = () => {
    switch (kind) {
      case "bar":
        return (
          <BarChart data={ds.data} margin={{ top: 8, right: 12, bottom: 40, left: 0 }}>
            <CartesianGrid {...GRID} vertical={false} />
            <XAxis dataKey={ds.xKey} {...AXIS} angle={-28} textAnchor="end" interval={0} height={70} />
            <YAxis {...AXIS} allowDecimals={false} width={34} />
            <RTooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(66,217,255,0.06)" }} />
            <Bar dataKey={ds.seriesKeys[0].key} name={ds.seriesKeys[0].label} radius={[5, 5, 0, 0]} animationDuration={700}>
              {ds.data.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} fillOpacity={0.85} />)}
            </Bar>
          </BarChart>
        );
      case "line":
        return (
          <LineChart data={ds.data} margin={{ top: 8, right: 16, bottom: 40, left: 0 }}>
            <CartesianGrid {...GRID} vertical={false} />
            <XAxis dataKey={ds.xKey} {...AXIS} angle={-28} textAnchor="end" interval={0} height={70} />
            <YAxis {...AXIS} allowDecimals={false} width={34} />
            <RTooltip contentStyle={tooltipStyle} />
            <Line
              type="monotone" dataKey={ds.seriesKeys[0].key} name={ds.seriesKeys[0].label}
              stroke={ds.seriesKeys[0].color} strokeWidth={2} dot={{ r: 4, fill: "#42D9FF", strokeWidth: 0 }}
              activeDot={{ r: 6 }} animationDuration={800}
            />
          </LineChart>
        );
      case "pie":
        return (
          <PieChart>
            <RTooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: 11, color: "#91A4BD" }} />
            <Pie
              data={ds.data} dataKey={ds.seriesKeys[0].key} nameKey={ds.xKey}
              innerRadius="52%" outerRadius="80%" paddingAngle={2} animationDuration={700}
              stroke="#050914" strokeWidth={2}
            >
              {ds.data.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
            </Pie>
          </PieChart>
        );
      case "scatter":
        return (
          <ScatterChart margin={{ top: 8, right: 16, bottom: 44, left: 0 }}>
            <CartesianGrid {...GRID} />
            <XAxis type="number" dataKey={ds.xKey} name="Data quality" {...AXIS} domain={[0, 100]} />
            <YAxis type="number" dataKey={ds.seriesKeys[0].key} name={ds.seriesKeys[0].label} {...AXIS} domain={[0, 100]} width={34} />
            <RTooltip contentStyle={tooltipStyle} cursor={{ strokeDasharray: "3 3" }} />
            <Scatter data={ds.data} fill="#42D9FF" fillOpacity={0.75} animationDuration={700} />
          </ScatterChart>
        );
      case "radar":
        return null;
    }
  };

  return (
    <div className="h-[360px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        {render() as any}
      </ResponsiveContainer>
    </div>
  );
}

export default function VisualizationView() {
  const [datasets, setDatasets] = useState<CorpusDataset[] | null>(null);
  const [note, setNote] = useState<string>("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [kindOverride, setKindOverride] = useState<CorpusDataset["kind"] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDatasets()
      .then((d) => {
        setDatasets(d.datasets);
        setNote(d.measurementNote);
        if (d.datasets.length > 0) setSelectedId(d.datasets[0].id);
      })
      .catch((e) => setError(e.message));
  }, []);

  const ds = useMemo(() => datasets?.find((d) => d.id === selectedId) ?? null, [datasets, selectedId]);
  const kind = kindOverride ?? ds?.kind ?? "bar";

  const exportCsv = () => {
    if (!ds) return;
    const keys = Object.keys(ds.data[0] ?? {});
    downloadCsv(`ofi-${ds.id}.csv`, [
      keys,
      ...ds.data.map((row) => keys.map((k) => row[k] as string | number)),
    ]);
  };

  return (
    <div className="mx-auto max-w-7xl">
      <ViewHeader
        eyebrow="Workspace · Scientific Visualization Lab"
        title="Visualization Lab"
        description="A scientific charting workspace over the OFI research corpus. Charts are computed live from verified record metadata — units and provenance are stated for every dataset. OFI never visualizes invented NASA measurements."
      />

      {error && <ErrorState message={error} />}

      {!datasets && !error && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      )}

      {datasets && datasets.length === 0 && (
        <EmptyState
          title="No datasets available"
          description="The corpus does not currently expose any structured datasets. Import verified NASA data to unlock visualization."
        />
      )}

      {datasets && ds && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
          {/* Selectors */}
          <aside className="space-y-4">
            <div className="ofi-card p-4">
              <p className="ofi-mono mb-3 text-[10px] tracking-[0.2em] text-[#91A4BD] uppercase">Dataset selector</p>
              <div className="space-y-1.5">
                {datasets.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => { setSelectedId(d.id); setKindOverride(null); }}
                    aria-pressed={selectedId === d.id}
                    className={cn(
                      "w-full rounded-lg px-3 py-2.5 text-left text-xs transition-colors focus-visible:ring-2 focus-visible:ring-[#42D9FF] focus-visible:outline-none",
                      selectedId === d.id
                        ? "bg-[rgba(66,217,255,0.1)] font-medium text-[#F4F8FF]"
                        : "text-[#91A4BD] hover:bg-[rgba(16,34,56,0.38)] hover:text-[#F4F8FF]",
                    )}
                  >
                    {d.title}
                  </button>
                ))}
              </div>
            </div>

            <div className="ofi-card p-4">
              <p className="ofi-mono mb-3 text-[10px] tracking-[0.2em] text-[#91A4BD] uppercase">Chart type</p>
              <div className="grid grid-cols-2 gap-1.5">
                {CHART_KINDS.map((k) => (
                  <button
                    key={k.value}
                    onClick={() => setKindOverride(k.value)}
                    aria-pressed={kind === k.value}
                    className={cn(
                      "rounded-lg border px-3 py-2 text-[11px] transition-colors focus-visible:ring-2 focus-visible:ring-[#42D9FF] focus-visible:outline-none",
                      kind === k.value
                        ? "border-[#42D9FF]/50 bg-[rgba(66,217,255,0.1)] text-[#42D9FF]"
                        : "border-[rgba(140,190,230,0.14)] text-[#91A4BD] hover:text-[#F4F8FF]",
                    )}
                  >
                    {k.label}
                  </button>
                ))}
              </div>
              <p className="mt-3 text-[10px] leading-relaxed text-[#5B708C]">
                Line and donut renderings are most meaningful for temporal and categorical datasets respectively; the
                chart-type selector lets you re-render any dataset, with scientific caution.
              </p>
            </div>

            <div className="ofi-card p-4">
              <p className="ofi-mono mb-2 text-[10px] tracking-[0.2em] text-[#91A4BD] uppercase">Experimental conditions</p>
              <p className="text-[11px] leading-relaxed text-[#91A4BD]">{ds.sourceNote}</p>
              <p className="ofi-mono mt-3 text-[10px] text-[#42D9FF]">Unit: {ds.unit}</p>
            </div>
          </aside>

          {/* Chart + table */}
          <div className="min-w-0 space-y-6">
            <div className="ofi-card p-6">
              <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                <div>
                  <h3 className="text-base font-semibold text-[#F4F8FF]">{ds.title}</h3>
                  <p className="mt-1 max-w-2xl text-xs leading-relaxed text-[#91A4BD]">{ds.description}</p>
                </div>
                <button
                  onClick={exportCsv}
                  className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-[rgba(140,190,230,0.2)] px-3.5 py-2 text-[11px] text-[#F4F8FF] transition-colors hover:border-[#42D9FF]/50 focus-visible:outline-none"
                >
                  <Download className="h-3.5 w-3.5 text-[#42D9FF]" /> Export CSV
                </button>
              </div>
              <ChartSurface ds={ds} kind={kind} />
            </div>

            {/* Data table */}
            <div className="ofi-card p-6">
              <p className="ofi-mono mb-3 text-[10px] tracking-[0.2em] text-[#91A4BD] uppercase">Data table</p>
              <div className="ofi-scroll max-h-72 overflow-y-auto rounded-xl border border-[rgba(140,190,230,0.12)]">
                <table className="w-full text-left text-xs">
                  <thead className="sticky top-0 bg-[rgba(16,34,56,0.95)] backdrop-blur">
                    <tr className="text-[#5B708C]">
                      {Object.keys(ds.data[0] ?? {}).map((k) => (
                        <th key={k} className="px-4 py-2.5 font-medium capitalize">{k.replace(/([A-Z])/g, " $1").trim()}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[rgba(140,190,230,0.08)]">
                    {ds.data.map((row, i) => (
                      <tr key={i} className="text-[#91A4BD]">
                        {Object.keys(ds.data[0] ?? {}).map((k) => (
                          <td key={k} className={cn("px-4 py-2.5", k === "label" && "text-[#F4F8FF]")}>
                            {String(row[k])}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Measurement empty-state note */}
            <div className="ofi-card flex gap-3 border-dashed p-5">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#42D9FF]" />
              <div>
                <p className="text-sm font-medium text-[#F4F8FF]">About measurement time-series</p>
                <p className="mt-1.5 text-xs leading-relaxed text-[#91A4BD]">{note}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
