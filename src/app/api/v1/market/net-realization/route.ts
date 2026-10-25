import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      mandi_name = "Pune Gultekdi Market Yard",
      headline_modal_price_per_qtl = 2150,
      distance_km = 92,
      lot_quantity_kg = 500,
      freight_rate_per_km = 15,
      handling_fee = 180,
      packaging_fee = 150,
      apmc_commission_pct = 5.0,
      transit_spoilage_pct = 2.0,
    } = body;

    const quintals = lot_quantity_kg / 100.0;
    const gross_value = headline_modal_price_per_qtl * quintals;
    const freight = freight_rate_per_km * distance_km;
    const handling = handling_fee;
    const packaging = packaging_fee;
    const apmc_commission = gross_value * (apmc_commission_pct / 100.0);
    const transit_spoilage = gross_value * (transit_spoilage_pct / 100.0);

    const total_deductions = freight + handling + packaging + apmc_commission + transit_spoilage;
    const net_take_home = gross_value - total_deductions;
    const net_realized_price_per_qtl = quintals > 0 ? net_take_home / quintals : 0;

    return NextResponse.json({
      mandi_name,
      gross_value_inr: Math.round(gross_value * 100) / 100,
      total_deductions_inr: Math.round(total_deductions * 100) / 100,
      net_take_home_inr: Math.round(net_take_home * 100) / 100,
      net_realized_price_per_qtl: Math.round(net_realized_price_per_qtl * 100) / 100,
      itemized_deductions: {
        freight_inr: Math.round(freight * 100) / 100,
        handling_inr: handling,
        packaging_inr: packaging,
        apmc_commission_inr: Math.round(apmc_commission * 100) / 100,
        transit_spoilage_inr: Math.round(transit_spoilage * 100) / 100,
      },
    });
  } catch {
    return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
  }
}
