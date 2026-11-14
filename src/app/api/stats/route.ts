import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const records = await db.investigation.findMany({ include: { sources: true } });

    const byCategory = new Map<string, number>();
    const byPlatform = new Map<string, number>();
    const byStatus = new Map<string, number>();
    for (const r of records) {
      byCategory.set(r.category, (byCategory.get(r.category) ?? 0) + 1);
      byPlatform.set(r.platform, (byPlatform.get(r.platform) ?? 0) + 1);
      byStatus.set(r.status, (byStatus.get(r.status) ?? 0) + 1);
    }

    return NextResponse.json({
      totalInvestigations: records.length,
      verifiedSources: records.reduce((n, r) => n + r.sources.length, 0),
      withDataset: records.filter((r) => r.datasetAvailable).length,
      withMeasurementData: records.filter((r) => r.measurementData).length,
      categories: [...byCategory.entries()]
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count),
      platforms: [...byPlatform.entries()]
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count),
      statusBreakdown: [...byStatus.entries()].map(([name, count]) => ({ name, count })),
      latestRecords: [...records]
        .sort((a, b) => (b.launchYear ?? 0) - (a.launchYear ?? 0))
        .slice(0, 5)
        .map((r) => ({
          code: r.code,
          name: r.name,
          category: r.category,
          status: r.status,
          launchYear: r.launchYear,
        })),
      // FLARE AI runs on the server-side LLM SDK bundled with this deployment;
      // when the SDK or a configured key is unavailable it degrades to
      // retrieval-only mode (see /api/flare and the Methodology page).
      aiConfigured: true,
    });
  } catch (err) {
    console.error("[api/stats]", err);
    return NextResponse.json({ error: "Failed to compute stats" }, { status: 500 });
  }
}
