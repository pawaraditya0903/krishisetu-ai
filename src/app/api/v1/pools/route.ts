import { NextRequest, NextResponse } from "next/server";
import { WIDE_FPO_POOLS } from "@/lib/agricultural-data";

export async function GET() {
  return NextResponse.json(WIDE_FPO_POOLS);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const newPool = {
      id: `POOL-NEW-${Date.now().toString().slice(-4)}`,
      crop: body.crop || "Tomato",
      variety: body.variety || "Commercial Grade",
      target_kg: body.target_kg || 1000,
      current_kg: 0,
      price_per_qtl: body.price_per_qtl || 2000,
      status: "Open",
      destination_mandi: body.destination_mandi || "Pune Market Yard",
      collection_hub: body.collection_hub || "Baramati APMC Hub",
      shared_freight_savings_pct: 25.0,
      closes_at: new Date(Date.now() + (body.cutoff_hours || 12) * 3600 * 1000).toISOString(),
    };
    return NextResponse.json(newPool, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid pool data" }, { status: 400 });
  }
}
