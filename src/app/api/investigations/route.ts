import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { toInvestigationDTO } from "@/lib/ofi/serialize";

const querySchema = z.object({
  q: z.string().max(120).optional(),
  category: z.string().max(60).optional(),
  hardware: z.string().max(80).optional(),
  platform: z.string().max(80).optional(),
  area: z.string().max(80).optional(),
  status: z.string().max(40).optional(),
  sort: z.enum(["relevance", "name", "year", "sources"]).default("relevance"),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(9),
});

export async function GET(req: NextRequest) {
  try {
    const parsed = querySchema.safeParse(Object.fromEntries(req.nextUrl.searchParams));
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid query parameters" }, { status: 400 });
    }
    const { q, category, hardware, platform, area, status, sort, page, pageSize } = parsed.data;

    const records = await db.investigation.findMany({ include: { sources: true } });
    let dtos = records.map(toInvestigationDTO);

    const needle = (q ?? "").trim().toLowerCase();
    if (needle) {
      dtos = dtos.filter((d) =>
        [d.code, d.name, d.objective, d.summary, d.category, d.facility, d.platform, ...d.researchAreas, ...d.fuelsMaterials]
          .join(" ")
          .toLowerCase()
          .includes(needle),
      );
    }
    if (hardware && hardware !== "All") {
      const hw = hardware.toLowerCase();
      dtos = dtos.filter((d) => d.facility.toLowerCase().includes(hw));
    }
    if (category && category !== "All") dtos = dtos.filter((d) => d.category === category);
    if (platform && platform !== "All") dtos = dtos.filter((d) => d.platform === platform);
    if (status && status !== "All") dtos = dtos.filter((d) => d.status === status);
    if (area && area !== "All") dtos = dtos.filter((d) => d.researchAreas.includes(area));

    switch (sort) {
      case "name":
        dtos.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "year":
        dtos.sort((a, b) => (b.launchYear ?? -1) - (a.launchYear ?? -1));
        break;
      case "sources":
        dtos.sort((a, b) => b.sources.length - a.sources.length);
        break;
      default:
        dtos.sort((a, b) => b.score.overall - a.score.overall);
    }

    const total = dtos.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const safePage = Math.min(page, totalPages);
    const items = dtos.slice((safePage - 1) * pageSize, safePage * pageSize);

    return NextResponse.json({ items, total, page: safePage, totalPages, pageSize });
  } catch (err) {
    console.error("[api/investigations]", err);
    return NextResponse.json({ error: "Failed to load investigations" }, { status: 500 });
  }
}
