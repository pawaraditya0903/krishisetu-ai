import { NextRequest, NextResponse } from "next/server";
import { filterMandiPrices, calculateDynamicMandisForLocation } from "@/lib/agricultural-data";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const crop = searchParams.get("crop") || undefined;
  const variety = searchParams.get("variety") || undefined;
  const mandi = searchParams.get("mandi") || undefined;
  const latStr = searchParams.get("lat");
  const lngStr = searchParams.get("lng");
  const radiusStr = searchParams.get("radius_km");
  const sortParam = (searchParams.get("sort") || "nearest") as "nearest" | "price" | "net" | "freshness";

  // If latitude and longitude are supplied, compute real-time dynamic distances
  if (latStr && lngStr) {
    const lat = parseFloat(latStr);
    const lng = parseFloat(lngStr);
    const radius = radiusStr ? parseInt(radiusStr, 10) : 50;

    if (!isNaN(lat) && !isNaN(lng)) {
      const result = calculateDynamicMandisForLocation(
        lat,
        lng,
        crop || "All",
        variety,
        radius,
        sortParam
      );

      const formatted = result.mandis.map((m) => ({
        id: m.id,
        mandi: m.mandi,
        district: m.district,
        state: m.state,
        crop: m.crop,
        variety: m.variety,
        min_price: m.minPrice,
        modal_price: m.modalPrice,
        max_price: m.maxPrice,
        min_price_inr: m.minPrice,
        modal_price_inr: m.modalPrice,
        max_price_inr: m.maxPrice,
        arrivals_qtl: m.arrivalsQtl,
        arrivals_quintal: m.arrivalsQtl,
        distance_km: m.distanceKm,
        travel_time_hours: m.travelTimeHours,
        lat: m.lat,
        lng: m.lng,
        freshness_status: m.freshness || "Live (Today)",
        data_status: m.dataStatus || "Live",
        source: m.source,
        reported_date: m.updatedAt,
      }));

      return NextResponse.json({
        mandis: formatted,
        effective_radius_km: result.effectiveRadiusKm,
        auto_expanded: result.autoExpanded,
        total_available: result.totalAvailableAcrossState,
      });
    }
  }

  // Fallback / legacy non-geolocation query
  const records = filterMandiPrices(crop, mandi);

  const formatted = records.map((r) => ({
    id: r.id,
    mandi: r.mandi,
    district: r.district,
    state: r.state,
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
    lat: r.lat,
    lng: r.lng,
    freshness_status: r.freshness_status || "Live (Today)",
    data_status: r.data_status || "Live",
    source: r.source,
    reported_date: r.reported_date,
  }));

  return NextResponse.json(formatted);
}
