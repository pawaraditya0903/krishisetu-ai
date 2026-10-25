import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const crop = (searchParams.get("crop") || "").toLowerCase().trim();
  const grade = (searchParams.get("grade") || "").trim();

  // Sample verified published products adhering strictly to buyer redaction rules
  const mockMarketplaceProducts = [
    {
      id: "LOT-TOM-8491",
      crop: "Tomato",
      variety: "Abhinav (Hybrid)",
      quantity_kg: 450,
      unit: "crates",
      grade: "Grade A",
      ai_grade: "Grade A",
      ai_quality_score: 89,
      ai_confidence: "High",
      asking_price_paise: 180000,
      cover_image_url: "/demo/tomato-top.jpg",
      images: ["/demo/tomato-top.jpg", "/demo/tomato-side.jpg", "/demo/tomato-crate.jpg"],
      packaging_type: "Plastic Crates (20kg)",
      harvest_date: "2026-09-07",
      hub_location: "Baramati FPO Hub #2, Pune",
      fpo_name: "Saksham FPO Network",
      fpo_verified: true,
      created_at: "2026-09-07T09:30:00Z",
    },
    {
      id: "LOT-ONI-3912",
      crop: "Onion",
      variety: "Unhali Red Garva",
      quantity_kg: 1200,
      unit: "quintal",
      grade: "Grade A",
      ai_grade: "Grade A",
      ai_quality_score: 92,
      ai_confidence: "High",
      asking_price_paise: 240000,
      cover_image_url: "/demo/tomato-desi.jpg",
      images: ["/demo/tomato-desi.jpg"],
      packaging_type: "Jute Gunny Bags (50kg)",
      harvest_date: "2026-09-08",
      hub_location: "Mohadi Packhouse, Nashik",
      fpo_name: "Sahyadri Farmers Network",
      fpo_verified: true,
      created_at: "2026-09-08T06:15:00Z",
    },
    {
      id: "LOT-POM-7219",
      crop: "Pomegranate",
      variety: "Bhagwa Export Grade",
      quantity_kg: 600,
      unit: "crates",
      grade: "Grade A",
      ai_grade: "Grade A",
      ai_quality_score: 94,
      ai_confidence: "High",
      asking_price_paise: 850000,
      cover_image_url: "/demo/tomato-side.jpg",
      images: ["/demo/tomato-side.jpg"],
      packaging_type: "Foam Wrapped Export Cartons",
      harvest_date: "2026-09-08",
      hub_location: "Solapur APMC Center",
      fpo_name: "Saksham FPO Network",
      fpo_verified: true,
      created_at: "2026-09-08T08:30:00Z",
    },
  ];

  let results = mockMarketplaceProducts;
  if (crop) {
    results = results.filter((p) => p.crop.toLowerCase().includes(crop));
  }
  if (grade) {
    results = results.filter((p) => p.grade === grade);
  }

  return NextResponse.json({
    total: results.length,
    products: results,
    ai_disclaimer:
      "External visual-quality estimate only; not laboratory or official AGMARK certification.",
  });
}
