import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    route_id: "RT-PUNE-0908-01",
    vehicle: "Eicher Pro 2049 (4-Tonne Reefer)",
    driver: "Tukaram Shinde (+91 98220 54321)",
    stops: [
      {
        location_name: "Baramati APMC Yard Hub",
        lat: 18.1517,
        lng: 74.5772,
        pickup_kg: 650,
        window: "08:00 - 08:30",
      },
      {
        location_name: "Patas Collection Point",
        lat: 18.4354,
        lng: 74.4172,
        pickup_kg: 200,
        window: "09:15 - 09:40",
      },
      {
        location_name: "Pune Gultekdi Market Yard",
        lat: 18.4965,
        lng: 73.8672,
        pickup_kg: 0,
        window: "11:00 (Final Mandi Unload)",
      },
    ],
    total_distance_km: 104,
    load_utilization_pct: 85,
    est_cost_inr: 1850,
    savings_vs_individual_pct: 28.5,
  });
}
