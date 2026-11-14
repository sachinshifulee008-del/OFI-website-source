"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Minus, ShieldAlert, XCircle } from "lucide-react";
import { fetchInvestigations } from "@/lib/ofi/api";
import type { InvestigationDTO } from "@/lib/ofi/types";
import { CardSkeleton, ErrorState, ViewHeader } from "../shared";
import { cn } from "@/lib/utils";

function select({ value, onChange, label, options }: {
  value: string;
  onChange: (v: string) => void;
  label: string;
  options: InvestigationDTO[];
}) {
  return (
    <label className="block">
      <span className="ofi-mono mb-2 block text-[10px] tracking-[0.2em] text-[#91A4BD] uppercase">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="ofi-input-glass w-full rounded-lg border border-[rgba(140,190,230,0.2)] px-3 py-2.5 text-sm text-[#F4F8FF] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#42D9FF]"
      >
        <option value="">Select investigation…</option>
        {options.map((o) => (
          <option key={o.code} value={o.code}>{o.code} — {o.name}</option>
        ))}
      </select>
    </label>
  );
}

type Compatibility = {
  compatible: boolean;
  reasons: string[];
  sharedVariables: string[];
};

/**
 * Scientific compatibility check: investigations are only called comparable
 * when combustion modality and measured-variable units align. OFI never
 * compares numbers without matching units and definitions.
 */
function assess(a: InvestigationDTO | null, b: InvestigationDTO | null): Compatibility | null {
  if (!a || !b) return null;
  const reasons: string[] = [];
  const sameCategory = a.category === b.category;
  const modalityA = a.researchAreas.map((r) => r.toLowerCase());
  const modalityB = b.researchAreas.map((r) => r.toLowerCase());
  const sharedAreas = modalityA.filter((x) => modalityB.includes(x));
  const sharedVariables = a.variables
    .filter((va) => b.variables.some((vb) => vb.name === va.name))
    .map((v) => v.name);
  const unitMismatch = a.variables.some((va) =>
    b.variables.some((vb) => vb.name === va.name && vb.unit !== va.unit),
  );

  if (sameCategory) reasons.push(`Same research category (${a.category}).`);
  else reasons.push(`Different research categories — ${a.category} vs. ${b.category}. Comparing measurements across these modalities is not scientifically valid.`);

  if (sharedAreas.length > 0) reasons.push(`Shared research areas: ${sharedAreas.join(", ")}.`);
  else reasons.push("No overlapping research areas — the experiments address different physical phenomena.");

  if (sharedVariables.length > 0 && !unitMismatch) {
    reasons.push(`Compatible measured variables (same definitions and units): ${sharedVariables.join(", ")}.`);
  } else if (sharedVariables.length > 0 && unitMismatch) {
    reasons.push(`Overlapping variable names but inconsistent units — numerical comparison is not valid.`);
  } else {
    reasons.push("No shared measured variables — there is no common quantity to compare numerically.");
  }

  return {
    compatible: sameCategory && sharedVariables.length > 0 && !unitMismatch,
    reasons,
    sharedVariables,
  };
}

function FieldRow({ label, a, b }: { label: string; a: React.ReactNode; b: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-3 border-b border-[rgba(140,190,230,0.08)] py-3.5 sm:grid-cols-[160px_1fr_1fr] sm:gap-4">
      <p className="ofi-mono text-[10px] tracking-wider text-[#5B708C] uppercase sm:pt-0.5">{label}</p>
      <div className="text-xs leading-relaxed text-[#91A4BD]">{a}</div>
      <div className="text-xs leading-relaxed text-[#91A4BD]">{b}</div>
    </div>
  );
}

export default function ComparisonView() {
  const [items, setItems] = useState<InvestigationDTO[] | null>(null);
  const [codeA, setCodeA] = useState("");
  const [codeB, setCodeB] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchInvestigations({ pageSize: 50, sort: "name" })
      .then((r) => setItems(r.items))
      .catch((e) => setError(e.message));
  }, []);

  const a = useMemo(() => items?.find((i) => i.code === codeA) ?? null, [items, codeA]);
  const b = useMemo(() => items?.find((i) => i.code === codeB) ?? null, [items, codeB]);
  const compat = assess(a, b);
  const ready = Boolean(a && b);
  const same = codeA && codeA === codeB;

  return (
    <div className="mx-auto max-w-7xl">
      <ViewHeader
        eyebrow="Workspace · Experiment Comparison"
        title="Experiment Comparison"
        description="A scientific comparison workspace. OFI checks combustion modality, gravity conditions and variable definitions before allowing comparison, and explains honestly when a comparison is not scientifically valid."
      />

      {error && <ErrorState message={error} />}

      {!items && !error && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">{[0, 1].map((i) => <CardSkeleton key={i} />)}</div>
      )}

      {items && (
        <>
          <div className="ofi-card mb-6 grid grid-cols-1 gap-5 p-5 md:grid-cols-2">
            {select({ value: codeA, onChange: setCodeA, label: "Investigation A", options: items })}
            {select({ value: codeB, onChange: setCodeB, label: "Investigation B", options: items })}
          </div>

          {same && (
            <div className="mb-6 flex items-center gap-3 rounded-xl border border-[rgba(255,116,56,0.3)] bg-[rgba(255,116,56,0.07)] p-4 text-xs text-[#FFB088]">
              <ShieldAlert className="h-4 w-4 shrink-0" />
              Two identical investigations are selected. Pick two different experiments to compare.
            </div>
          )}

          {!ready && !same && (
            <div className="ofi-card border-dashed p-10 text-center">
              <p className="text-sm text-[#91A4BD]">
                Select two investigations to begin. OFI will assess scientific compatibility before displaying any
                comparison — records are only compared when modality, gravity conditions and variable definitions align.
              </p>
            </div>
          )}

          {a && b && ready && compat && (
            <>
              {/* Compatibility verdict */}
              <div
                className={cn(
                  "mb-6 rounded-xl border p-5",
                  compat.compatible
                    ? "border-emerald-400/30 bg-[rgba(52,211,153,0.06)]"
                    : "border-[rgba(255,116,56,0.3)] bg-[rgba(255,116,56,0.06)]",
                )}
              >
                <div className="flex items-center gap-3">
                  {compat.compatible ? (
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-300" />
                  ) : (
                    <XCircle className="h-5 w-5 shrink-0 text-[#FF7438]" />
                  )}
                  <div>
                    <p className="text-sm font-semibold text-[#F4F8FF]">
                      {compat.compatible ? "Comparison is scientifically valid" : "Comparison is not scientifically valid"}
                    </p>
                    <ul className="mt-2 space-y-1">
                      {compat.reasons.map((r) => (
                        <li key={r} className="flex gap-2 text-xs leading-relaxed text-[#91A4BD]">
                          <Minus className="mt-1 h-2.5 w-2.5 shrink-0 text-[#5B708C]" />
                          {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Side-by-side metadata */}
              <div className="ofi-card overflow-hidden">
                <div className="grid grid-cols-1 border-b border-[rgba(140,190,230,0.12)] bg-[rgba(16,34,56,0.45)] sm:grid-cols-[160px_1fr_1fr]">
                  <div className="hidden sm:block" />
                  {[a, b].map((inv, i) => (
                    <div key={inv.code} className="p-4">
                      <span className="ofi-mono text-[10px] text-[#42D9FF]">Investigation {"AB"[i]} · {inv.code}</span>
                      <p className="mt-1 text-sm leading-snug font-semibold text-[#F4F8FF]">{inv.name}</p>
                    </div>
                  ))}
                </div>
                <div className="px-5 py-2 sm:px-6">
                  <FieldRow label="Objective" a={a.objective} b={b.objective} />
                  <FieldRow
                    label="Experiment code"
                    a={<span className="ofi-mono text-[#42D9FF]">{a.code}</span>}
                    b={<span className="ofi-mono text-[#42D9FF]">{b.code}</span>}
                  />
                  <FieldRow label="Gravity conditions" a={a.gravityCondition} b={b.gravityCondition} />
                  <FieldRow
                    label="Fuel & materials"
                    a={
                      <span className="flex flex-wrap gap-1.5">
                        {a.fuelsMaterials.map((f) => <span key={f} className="rounded-md border border-[#FF7438]/25 bg-[rgba(255,116,56,0.06)] px-2 py-0.5 text-[11px]">{f}</span>)}
                      </span>
                    }
                    b={
                      <span className="flex flex-wrap gap-1.5">
                        {b.fuelsMaterials.map((f) => <span key={f} className="rounded-md border border-[#FF7438]/25 bg-[rgba(255,116,56,0.06)] px-2 py-0.5 text-[11px]">{f}</span>)}
                      </span>
                    }
                  />
                  <FieldRow
                    label="Experimental conditions"
                    a={`${a.facility} · ${a.platform}${a.delivery ? ` · ${a.delivery}` : ""}`}
                    b={`${b.facility} · ${b.platform}${b.delivery ? ` · ${b.delivery}` : ""}`}
                  />
                  <FieldRow
                    label="Measured variables"
                    a={
                      <ul className="space-y-1">
                        {a.variables.map((v) => <li key={v.name}>{v.name}{v.unit ? ` (${v.unit})` : ""}</li>)}
                      </ul>
                    }
                    b={
                      <ul className="space-y-1">
                        {b.variables.map((v) => <li key={v.name}>{v.name}{v.unit ? ` (${v.unit})` : ""}</li>)}
                      </ul>
                    }
                  />
                  <FieldRow
                    label="Available findings"
                    a={
                      <ul className="list-disc space-y-1 pl-4">
                        {a.keyFindings.map((f) => <li key={f}>{f}</li>)}
                      </ul>
                    }
                    b={
                      <ul className="list-disc space-y-1 pl-4">
                        {b.keyFindings.map((f) => <li key={f}>{f}</li>)}
                      </ul>
                    }
                  />
                  <FieldRow
                    label="Source documents"
                    a={
                      <ul className="space-y-1">
                        {a.sources.map((s) => <li key={s.id} className="truncate">{s.title}{s.year ? ` (${s.year})` : ""}</li>)}
                        {a.sources.length === 0 && <li>—</li>}
                      </ul>
                    }
                    b={
                      <ul className="space-y-1">
                        {b.sources.map((s) => <li key={s.id} className="truncate">{s.title}{s.year ? ` (${s.year})` : ""}</li>)}
                        {b.sources.length === 0 && <li>—</li>}
                      </ul>
                    }
                  />
                </div>
              </div>

              {/* Numeric comparison policy */}
              <div className="mt-6 rounded-xl border border-[rgba(140,190,230,0.16)] bg-[rgba(9,20,38,0.38)] p-5">
                <p className="ofi-mono text-[10px] tracking-[0.2em] text-[#91A4BD] uppercase">Numerical comparison policy</p>
                <p className="mt-2.5 text-xs leading-relaxed text-[#91A4BD]">
                  {compat.compatible
                    ? "Although these investigations share measured variables and units, OFI does not hold the underlying numeric measurement series in its corpus, so no numeric cross-comparison is rendered. Import verified measurement data (see Methodology) to enable quantitative comparison."
                    : "No numerical comparison is shown: the investigations differ in modality or variable definitions, and comparing measurements across incompatible conditions would be scientifically misleading."}
                </p>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
