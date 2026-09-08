import { NextRequest, NextResponse } from "next/server";
import { filterMandiPrices } from "@/lib/agricultural-data";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const crop = searchParams.get("crop") || undefined;
  const mandi = searchParams.get("mandi") || undefined;

  const records = filterMandiPrices(crop, mandi);

  const formatted = records.map((r) => ({
    id: r.id,
    mandi: r.mandi,
    district: r.district,
    crop: r.crop,
    variety: r.variety,
    min_price: r.min_price,
    modal_price: r.modal_price,
    max_price: r.max_price,
    min_price_inr: r.min_price,
    modal_price_inr: r.modal_price,
    max_price_inr: r.max_price,
    arrivals_qtl: r.arrivals_qtl,
    arrivals_quintal: r.arrivals_qtl,
    distance_km: r.distance_km,
    freshness_status: r.freshness_status,
    source: r.source,
    reported_date: r.reported_date,
  }));

  return NextResponse.json(formatted);
}
