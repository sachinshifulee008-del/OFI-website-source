import type { Investigation, Source } from "@prisma/client";
import type { InvestigationDTO, SourceInfo, VariableInfo } from "./types";
import { computeScore } from "./scoring";

function parseJson<T>(raw: string, fallback: T): T {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function toSourceDTO(s: Source): SourceInfo {
  return {
    id: s.id,
    title: s.title,
    authors: s.authors,
    year: s.year,
    venue: s.venue,
    kind: s.kind as SourceInfo["kind"],
    doi: s.doi,
    url: s.url,
  };
}

export function toInvestigationDTO(inv: Investigation & { sources?: Source[] }): InvestigationDTO {
  const sources = (inv.sources ?? []).map(toSourceDTO);
  const base = {
    researchAreas: parseJson<string[]>(inv.researchAreas, []),
    fuelsMaterials: parseJson<string[]>(inv.fuelsMaterials, []),
    keyFindings: parseJson<string[]>(inv.keyFindings, []),
    variables: parseJson<VariableInfo[]>(inv.variables, []),
    sources,
    doi: inv.doi,
    sourceUrl: inv.sourceUrl,
    ntrsUrl: inv.ntrsUrl,
    launchYear: inv.launchYear,
    delivery: inv.delivery,
    datasetAvailable: inv.datasetAvailable,
    measurementData: inv.measurementData,
    gravityCondition: inv.gravityCondition,
    facility: inv.facility,
    platform: inv.platform,
    objective: inv.objective,
    summary: inv.summary,
  };
  return {
    id: inv.id,
    code: inv.code,
    name: inv.name,
    category: inv.category,
    objective: inv.objective,
    summary: inv.summary,
    gravityCondition: inv.gravityCondition,
    facility: inv.facility,
    platform: inv.platform,
    status: inv.status,
    launchYear: inv.launchYear,
    delivery: inv.delivery,
    doi: inv.doi,
    sourceUrl: inv.sourceUrl,
    ntrsUrl: inv.ntrsUrl,
    datasetAvailable: inv.datasetAvailable,
    measurementData: inv.measurementData,
    researchAreas: base.researchAreas,
    fuelsMaterials: base.fuelsMaterials,
    keyFindings: base.keyFindings,
    variables: base.variables,
    sources,
    score: computeScore(base),
  };
}
