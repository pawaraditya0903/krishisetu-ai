import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json([
    {
      id: "LOT-TOM-8491",
      farmer_id: "F1",
      farmer_name: "Ramesh Patil",
      crop_name: "Tomato",
      variety: "Abhinav (Hybrid)",
      quantity_kg: 450,
      grade: "Grade A",
      confidence_score: 91,
      status: "Verified",
      qr_code: "KS-LOT-TOM-8491-VERIFIED-BARAMATI",
      created_at: "2026-09-07T09:30:00Z",
    },
    {
      id: "LOT-ONI-3912",
      farmer_id: "F1",
      farmer_name: "Ramesh Patil",
      crop_name: "Onion",
      variety: "Unhali Red",
      quantity_kg: 1200,
      grade: "Grade A",
      confidence_score: 89,
      status: "Pooled",
      qr_code: "KS-LOT-ONI-3912-POOLED-NASHIK",
      created_at: "2026-09-08T07:15:00Z",
    },
    {
      id: "LOT-COT-5104",
      farmer_id: "F2",
      farmer_name: "Suresh Gaikwad",
      crop_name: "Cotton",
      variety: "Long Staple",
      quantity_kg: 850,
      grade: "Grade A",
      confidence_score: 94,
      status: "Verified",
      qr_code: "KS-LOT-COT-5104-VERIFIED-AKOLA",
      created_at: "2026-09-08T08:00:00Z",
    },
  ]);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const id = `LOT-${(body.crop_name || "CRP").slice(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const lot = {
      id,
      farmer_id: body.farmer_id || "F1",
      crop_name: body.crop_name || "Tomato",
      variety: body.variety || "Hybrid",
      quantity_kg: body.quantity_kg || 500,
      grade: body.grade || "Grade A",
      status: body.status || "Submitted",
      qr_code: `KS-${id}-${(body.status || "SUBMITTED").toUpperCase()}-MAHA`,
    };
    return NextResponse.json(lot, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid lot payload" }, { status: 400 });
  }
}
