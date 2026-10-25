import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ lotId: string }> }
) {
  const resolvedParams = await params;
  const lotId = resolvedParams.lotId;

  try {
    const body = await request.json();
    return NextResponse.json({
      id: lotId,
      verified_weight_kg: body.verified_weight_kg || 500,
      verified_grade: body.verified_grade || "Grade A",
      status: "Verified",
      fpo_notes: body.fpo_notes || "Verified by FPO collection center quality inspector.",
    });
  } catch {
    return NextResponse.json({ error: "Failed to verify lot" }, { status: 400 });
  }
}
