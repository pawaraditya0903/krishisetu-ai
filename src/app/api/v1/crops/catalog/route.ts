import { NextResponse } from "next/server";
import { initialCropsCatalog } from "@/lib/admin-initial-data";
import { CropCatalogItem } from "@/lib/types";

// Runtime in-memory storage for server-side persistence
let serverCropsCatalog: CropCatalogItem[] = [...initialCropsCatalog];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") || "").toLowerCase().trim();

  let crops = serverCropsCatalog;

  if (q) {
    crops = crops.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.marathiName && c.marathiName.toLowerCase().includes(q)) ||
        (c.hindiName && c.hindiName.toLowerCase().includes(q)) ||
        c.category.toLowerCase().includes(q) ||
        (c.varieties && c.varieties.some((v) => v.toLowerCase().includes(q)))
    );
  }

  return NextResponse.json({
    status: "success",
    total: crops.length,
    crops,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.name) {
      return NextResponse.json({ error: "Crop name is required" }, { status: 400 });
    }

    const newId =
      body.id ||
      `CROP-${body.name.slice(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newCrop: CropCatalogItem = {
      id: newId,
      name: body.name.trim(),
      marathiName: body.marathiName?.trim() || body.name.trim(),
      hindiName: body.hindiName?.trim() || body.name.trim(),
      category: body.category || "Vegetable",
      icon: body.icon || "🌱",
      unit: body.unit || "kg",
      varieties: body.varieties && body.varieties.length > 0 ? body.varieties : ["Hybrid", "Desi"],
      perishability: body.perishability || "Medium (1-3 weeks)",
      storageRecommendation: body.storageRecommendation || "Store properly in ventilated crates.",
      defaultBatchSizeKg: body.defaultBatchSizeKg || 500,
      supportedQualityParams: body.supportedQualityParams || [
        "Size Uniformity",
        "Ripeness Index",
        "Color Uniformity",
      ],
      gradeRules: body.gradeRules || [
        { grade: "Grade A", minSizeMm: 50, maxDefectPct: 3, priceAdjustmentPct: 10 },
        { grade: "Grade B", minSizeMm: 40, maxDefectPct: 8, priceAdjustmentPct: 0 },
        { grade: "Grade C", minSizeMm: 30, maxDefectPct: 15, priceAdjustmentPct: -15 },
      ],
      status: body.status || "Active",
    };

    // Prevent duplicates
    const existingIdx = serverCropsCatalog.findIndex(
      (c) => c.id.toLowerCase() === newCrop.id.toLowerCase() || c.name.toLowerCase() === newCrop.name.toLowerCase()
    );

    if (existingIdx >= 0) {
      serverCropsCatalog[existingIdx] = { ...serverCropsCatalog[existingIdx], ...newCrop };
    } else {
      serverCropsCatalog = [newCrop, ...serverCropsCatalog];
    }

    return NextResponse.json(
      {
        status: "success",
        message: `Crop "${newCrop.name}" created successfully in catalog`,
        crop: newCrop,
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to create crop in catalog", details: err?.message },
      { status: 400 }
    );
  }
}
