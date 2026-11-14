import type { InvestigationDTO } from "./types";

/**
 * OFI-defined fire-safety relevance heuristic — deterministic keyword analysis
 * over metadata fields actually present in each record. These are NOT
 * experimentally measured results; they transparently rank how strongly each
 * investigation's documented scope connects to five spacecraft fire-safety
 * needs (challenge spec §9).
 */

export type DimensionKey =
  | "flammability" | "flameBehavior" | "smokeDetection" | "suppression" | "habitats";

type Bucket = "identity" | "core" | "findings";

type Signal = { kw: string; weight: number; label: string };

export const DIMENSIONS: { key: DimensionKey; label: string; short: string; description: string; signals: Signal[] }[] = [
  {
    key: "flammability",
    label: "Material flammability",
    short: "Flammability",
    description: "How strongly the investigation documents material/solid-fuel burning behaviour, ignition and burning rates.",
    signals: [
      { kw: "flammab", weight: 30, label: "flammability of materials" },
      { kw: "solid fuel", weight: 28, label: "solid fuel samples" },
      { kw: "ignition", weight: 20, label: "ignition behaviour" },
      { kw: "burning rate", weight: 24, label: "burning rate" },
      { kw: "material", weight: 10, label: "material properties" },
      { kw: "bass", weight: 22, label: "BASS solids burning" },
      { kw: "bre", weight: 20, label: "BRE material-flammability emulator" },
      { kw: "sample", weight: 8, label: "sample geometry" },
      { kw: "fabric", weight: 12, label: "fabric samples" },
      { kw: "pyrolysis", weight: 14, label: "pyrolysis" },
    ],
  },
  {
    key: "flameBehavior",
    label: "Flame spread & combustion behaviour",
    short: "Flame behaviour",
    description: "Documented flame spread, structure, stability, liftoff, extinction and droplet-burning physics.",
    signals: [
      { kw: "flame spread", weight: 30, label: "flame spread" },
      { kw: "liftoff", weight: 24, label: "liftoff / blowoff" },
      { kw: "stability", weight: 18, label: "flame stability" },
      { kw: "structure", weight: 12, label: "flame structure" },
      { kw: "extinction", weight: 22, label: "extinction limits" },
      { kw: "cool flame", weight: 20, label: "cool flames" },
      { kw: "droplet", weight: 24, label: "droplet combustion" },
      { kw: "flex", weight: 18, label: "FLEX droplet family" },
      { kw: "slice", weight: 18, label: "SLICE gaseous flames" },
      { kw: "spice", weight: 16, label: "SPICE co-flow flames" },
      { kw: "burning rate", weight: 12, label: "burning rate" },
    ],
  },
  {
    key: "smokeDetection",
    label: "Smoke detection & aerosol monitoring",
    short: "Smoke & aerosol",
    description: "Smoke/aerosol characterization, particle sizing and detector technology development.",
    signals: [
      { kw: "smoke", weight: 30, label: "smoke characterization" },
      { kw: "aerosol", weight: 28, label: "aerosol measurement" },
      { kw: "soot", weight: 22, label: "soot production" },
      { kw: "particulate", weight: 20, label: "particulate matter" },
      { kw: "particle size", weight: 22, label: "particle size distribution" },
      { kw: "same", weight: 22, label: "SAME / SAME-R instruments" },
      { kw: "daft", weight: 22, label: "DAFT / DAFT-2 dust studies" },
      { kw: "detector", weight: 24, label: "smoke detector technology" },
      { kw: "detection", weight: 16, label: "fire detection" },
      { kw: "dust", weight: 16, label: "dust measurement" },
    ],
  },
  {
    key: "suppression",
    label: "Fire suppression",
    short: "Suppression",
    description: "Research informing extinguishing agents, suppression strategies and fire-control equipment.",
    signals: [
      { kw: "suppression", weight: 32, label: "suppression physics" },
      { kw: "suppress", weight: 22, label: "suppressant effects" },
      { kw: "extinguish", weight: 26, label: "extinguishment" },
      { kw: "water mist", weight: 26, label: "water-mist systems" },
      { kw: "nitrogen", weight: 14, label: "nitrogen as inert agent" },
      { kw: "inert", weight: 12, label: "inert atmospheres" },
      { kw: "agent", weight: 14, label: "suppression agents" },
      { kw: "bass", weight: 16, label: "BASS suppression tests" },
    ],
  },
  {
    key: "habitats",
    label: "Lunar / Martian habitat & crew environments",
    short: "Habitats",
    description: "Relevance to enriched-oxygen, reduced-pressure and partial-gravity crew environments (bases, rovers, suits).",
    signals: [
      { kw: "oxygen", weight: 20, label: "oxygen concentration effects" },
      { kw: "enriched", weight: 18, label: "oxygen-enriched atmospheres" },
      { kw: "lunar", weight: 24, label: "lunar environment" },
      { kw: "moon", weight: 20, label: "Moon-base context" },
      { kw: "mars", weight: 22, label: "Mars context" },
      { kw: "rover", weight: 20, label: "pressurized rovers" },
      { kw: "habitat", weight: 22, label: "habitats" },
      { kw: "spacecraft", weight: 12, label: "spacecraft environments" },
      { kw: "partial gravity", weight: 20, label: "partial gravity" },
      { kw: "electric field", weight: 16, label: "electric-field gravity mimicry" },
      { kw: "cfi", weight: 12, label: "CFI high-oxygen studies" },
    ],
  },
];

export type DimensionResult = {
  key: DimensionKey;
  score: number;
  reasons: { label: string; bucket: Bucket }[];
};

export type FireSafetyProfile = {
  dimensions: Record<DimensionKey, DimensionResult>;
  composite(weights: Record<DimensionKey, number>): number;
};

function buildBuckets(inv: InvestigationDTO): Record<Bucket, string> {
  const identity = [inv.code, inv.name, inv.category, inv.facility].join(" ").toLowerCase();
  const core = [
    inv.objective, inv.summary, inv.gravityCondition, inv.platform,
    ...inv.researchAreas, ...inv.fuelsMaterials,
    ...inv.variables.map((v) => v.name),
  ].join(" ").toLowerCase();
  const findings = [...inv.keyFindings].join(" ").toLowerCase();
  return { identity, core, findings };
}

export function profileInvestigation(inv: InvestigationDTO): Record<DimensionKey, DimensionResult> {
  const hay = buildBuckets(inv);
  const out = {} as Record<DimensionKey, DimensionResult>;
  for (const dim of DIMENSIONS) {
    let score = 0;
    const reasons: { label: string; bucket: Bucket }[] = [];
    for (const s of dim.signals) {
      if (hay.identity.includes(s.kw)) {
        score += s.weight;
        reasons.push({ label: s.label, bucket: "identity" });
      } else if (hay.core.includes(s.kw)) {
        score += s.weight;
        reasons.push({ label: s.label, bucket: "core" });
      } else if (hay.findings.includes(s.kw)) {
        score += Math.round(s.weight * 0.7);
        reasons.push({ label: s.label, bucket: "findings" });
      }
    }
    out[dim.key] = { key: dim.key, score: Math.min(100, score), reasons: reasons.slice(0, 4) };
  }
  return out;
}

export function compositeScore(profile: Record<DimensionKey, DimensionResult>, weights: Record<DimensionKey, number>): number {
  let total = 0;
  let wsum = 0;
  for (const d of DIMENSIONS) {
    const w = Math.max(0, weights[d.key]);
    total += w * profile[d.key].score;
    wsum += w;
  }
  return wsum === 0 ? 0 : Math.round(total / wsum);
}
