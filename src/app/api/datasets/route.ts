import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { toInvestigationDTO } from "@/lib/ofi/serialize";
import type { CorpusDataset } from "@/lib/ofi/types";

export const dynamic = "force-dynamic";

const SERIES_COLORS = ["#42D9FF", "#397BFF", "#FF7438", "#91A4BD", "#8BE9C6"];

export async function GET() {
  try {
    const records = await db.investigation.findMany({ include: { sources: true } });
    const dtos = records.map(toInvestigationDTO);

    const countBy = (items: string[]) => {
      const m = new Map<string, number>();
      for (const it of items) m.set(it, (m.get(it) ?? 0) + 1);
      return [...m.entries()]
        .map(([label, count]) => ({ label, count }))
        .sort((a, b) => b.count - a.count);
    };

    // 1. Investigations per research category (derived from corpus records)
    const byCategory = countBy(dtos.map((d) => d.category));

    // 2. Investigations per platform
    const byPlatform = countBy(dtos.map((d) => d.platform));

    // 3. Investigations per primary research area (first listed area per record)
    const byArea = countBy(dtos.map((d) => d.researchAreas[0]).filter(Boolean) as string[]);

    // 4. Corpus timeline: records per verified launch year (undated records grouped as "Not dated in source")
    const byYear = new Map<string, number>();
    for (const d of dtos) {
      const key = d.launchYear ? String(d.launchYear) : "Not dated";
      byYear.set(key, (byYear.get(key) ?? 0) + 1);
    }
    const timeline = [...byYear.entries()]
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => (a.label === "Not dated" ? 1 : b.label === "Not dated" ? -1 : Number(a.label) - Number(b.label)));

    // 5. OFI score scatter: data quality vs scientific relevance per investigation
    const scatter = dtos
      .map((d) => ({
        label: d.code,
        dataQuality: d.score.dataQuality,
        relevance: d.score.scientificRelevance,
      }))
      .sort((a, b) => b.relevance - a.relevance);

    // 6. Facility distribution
    const byFacility = countBy(dtos.map((d) => d.facility));

    const datasets: CorpusDataset[] = [
      {
        id: "corpus-by-category",
        title: "Investigations by research category",
        description:
          "Number of verified NASA microgravity combustion investigations in the OFI corpus, grouped by research category.",
        unit: "investigations",
        sourceNote: "Computed live from the OFI research corpus (curated public NASA records).",
        kind: "bar",
        data: byCategory,
        xKey: "label",
        seriesKeys: [{ key: "count", label: "Investigations", color: SERIES_COLORS[0] }],
      },
      {
        id: "corpus-by-platform",
        title: "Investigations by platform",
        description:
          "Which flight platform hosted each investigation — ISS racks, free-flying Cygnus vehicles, or the Space Shuttle.",
        unit: "investigations",
        sourceNote: "Computed live from the OFI research corpus (curated public NASA records).",
        kind: "pie",
        data: byPlatform,
        xKey: "label",
        seriesKeys: [{ key: "count", label: "Investigations", color: SERIES_COLORS[0] }],
      },
      {
        id: "corpus-by-area",
        title: "Primary research areas",
        description:
          "The first-listed research area of each investigation in the corpus, showing the topical structure of NASA microgravity combustion research.",
        unit: "investigations",
        sourceNote: "Computed live from the OFI research corpus (curated public NASA records).",
        kind: "bar",
        data: byArea,
        xKey: "label",
        seriesKeys: [{ key: "count", label: "Investigations", color: SERIES_COLORS[1] }],
      },
      {
        id: "corpus-timeline",
        title: "Corpus timeline by launch year",
        description:
          "Investigations grouped by verified launch year. Records without a source-verified launch year are grouped under 'Not dated' rather than guessed.",
        unit: "investigations",
        sourceNote: "Computed live from the OFI research corpus (curated public NASA records).",
        kind: "line",
        data: timeline,
        xKey: "label",
        seriesKeys: [{ key: "count", label: "Investigations", color: SERIES_COLORS[2] }],
      },
      {
        id: "corpus-score-scatter",
        title: "OFI score: data quality vs scientific relevance",
        description:
          "Each point is one investigation. The OFI Research Relevance Score is an OFI-defined metadata heuristic — not a NASA-approved ranking and not a fire-risk prediction.",
        unit: "score (0–100)",
        sourceNote: "Computed live from the OFI research corpus (curated public NASA records).",
        kind: "scatter",
        data: scatter,
        xKey: "dataQuality",
        seriesKeys: [{ key: "relevance", label: "Scientific relevance", color: SERIES_COLORS[0] }],
      },
      {
        id: "corpus-by-facility",
        title: "Investigations by facility",
        description:
          "Which experimental facility hosted each investigation in the corpus (CIR, MSG, SAFFIRE duct, Shuttle module).",
        unit: "investigations",
        sourceNote: "Computed live from the OFI research corpus (curated public NASA records).",
        kind: "bar",
        data: byFacility,
        xKey: "label",
        seriesKeys: [{ key: "count", label: "Investigations", color: SERIES_COLORS[1] }],
      },
    ];

    return NextResponse.json({ datasets, measurementNote:
      "No experimental measurement time-series are bundled. OFI does not fabricate NASA measurement values; import a verified NASA dataset (CSV) to unlock measurement visualization." });
  } catch (err) {
    console.error("[api/datasets]", err);
    return NextResponse.json({ error: "Failed to compute datasets" }, { status: 500 });
  }
}
