import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const productId = `LOT-${(body.crop_name || body.crop || "CRP").slice(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const product = {
      id: productId,
      farmerId: body.farmer_id || body.farmerId || "F1",
      farmerName: body.farmer_name || body.farmerName || "Ramesh Patil",
      cropId: body.crop_id || body.cropId,
      crop: body.crop_name || body.crop,
      variety: body.variety || "Standard",
      quantityKg: body.quantity_kg || body.quantityKg || 500,
      unit: body.unit || "kg",
      harvestDate: body.harvest_date || body.harvestDate,
      packagingType: body.packaging_type || body.packagingType,
      locationName: body.location_name || body.locationName || "Baramati FPO Hub",
      notes: body.notes,
      productStatus: body.product_status || body.productStatus || "AWAITING_FPO_VERIFICATION",
      status: (body.product_status === "DRAFT" ? "Draft" : "Submitted") as any,
      marketplaceVisibility: body.marketplace_visibility || "PRIVATE",
      coverImageUrl: body.cover_image_url || "/demo/tomato-top.jpg",
      grade: body.grade || "Grade A",
      confidenceScore: body.confidence_score || 91,
      askingPricePaise: body.asking_price_paise || 200000,
      createdAt: new Date().toISOString(),
      images: body.cover_image_url ? [body.cover_image_url] : ["/demo/tomato-top.jpg"],
    };

    return NextResponse.json(product, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to create product", details: err.message }, { status: 400 });
  }
}
