import type { InvestigationDTO, OfiScore } from "./types";

/**
 * OFI-defined Research Relevance Score.
 *
 * IMPORTANT (see /methodology in the app):
 *  - This is an OFI heuristic based purely on record metadata quality and
 *    topical alignment with the Space Apps 2026 challenge. It is NOT a
 *    NASA-approved ranking and NOT a spacecraft fire-risk prediction.
 *  - Scores are only computed from fields actually present in the record;
 *    missing fields reduce completeness honestly instead of being guessed.
 */

const FIRE_SAFETY_AREAS = [
  "spacecraft fire safety",
  "fire suppression",
  "fire prevention",
  "fire detection",
  "flammability limits",
  "material flammability",
  "flame spread",
  "flame spread over solids",
  "smoke characterization",
];

function clamp(v: number, lo = 0, hi = 100) {
  return Math.max(lo, Math.min(hi, Math.round(v)));
}

export function computeScore(inv: {
  researchAreas: string[];
  fuelsMaterials: string[];
  keyFindings: string[];
  variables: { name: string; unit: string | null }[];
  sources: unknown[];
  doi: string | null;
  sourceUrl: string | null;
  ntrsUrl: string | null;
  launchYear: number | null;
  delivery: string | null;
  datasetAvailable: boolean;
  measurementData: boolean;
  gravityCondition: string;
  facility: string;
  platform: string;
  objective: string;
  summary: string;
}): OfiScore {
  // --- Data quality: how strong is the evidence trail for this record ---
  let dq = 0;
  dq += Math.min(40, inv.sources.length * 20); // verified source documents
  if (inv.doi) dq += 20; // verifiable peer-reviewed DOI
  if (inv.sourceUrl) dq += 10;
  if (inv.ntrsUrl) dq += 10;
  if (inv.datasetAvailable) dq += 10;
  if (inv.measurementData) dq += 10;
  const dataQuality = clamp(dq);

  // --- Scientific relevance: topical alignment with microgravity fire safety ---
  const areas = inv.researchAreas.map((a) => a.toLowerCase());
  const hits = areas.filter((a) => FIRE_SAFETY_AREAS.some((f) => a.includes(f))).length;
  let sr = 25 + hits * 18; // base relevance for being microgravity combustion research
  if (areas.some((a) => a.includes("cool flames"))) sr += 8;
  if (areas.some((a) => a.includes("soot") || a.includes("smoke"))) sr += 6;
  const scientificRelevance = clamp(sr);

  // --- Completeness: fraction of core fields populated ---
  const coreFields = [
    inv.objective.length > 40,
    inv.summary.length > 80,
    inv.researchAreas.length >= 2,
    inv.fuelsMaterials.length >= 1,
    inv.keyFindings.length >= 1,
    inv.variables.length >= 1,
    inv.launchYear !== null,
    inv.gravityCondition.length > 3,
    inv.facility.length > 3,
    inv.platform.length > 3,
  ];
  const completeness = clamp((coreFields.filter(Boolean).length / coreFields.length) * 100);

  // --- Metadata quality: identifiers, provenance, dates ---
  let mq = 20;
  if (inv.launchYear !== null) mq += 15;
  if (inv.delivery) mq += 10;
  if (inv.doi) mq += 20;
  if (inv.sourceUrl || inv.ntrsUrl) mq += 20;
  if (inv.variables.every((v) => v.unit !== null) && inv.variables.length > 0) mq += 15;
  const metadataQuality = clamp(mq);

  const overall = clamp(
    dataQuality * 0.3 + scientificRelevance * 0.3 + completeness * 0.2 + metadataQuality * 0.2,
  );

  return { dataQuality, scientificRelevance, completeness, metadataQuality, overall };
}
