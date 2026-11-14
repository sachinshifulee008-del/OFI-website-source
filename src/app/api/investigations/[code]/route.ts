import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { toInvestigationDTO } from "@/lib/ofi/serialize";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  try {
    const { code } = await params;
    const clean = decodeURIComponent(code).slice(0, 60);
    const record = await db.investigation.findUnique({
      where: { code: clean },
      include: { sources: true },
    });
    if (!record) {
      return NextResponse.json({ error: "Investigation not found" }, { status: 404 });
    }
    return NextResponse.json(toInvestigationDTO(record));
  } catch (err) {
    console.error("[api/investigations/[code]]", err);
    return NextResponse.json({ error: "Failed to load investigation" }, { status: 500 });
  }
}
