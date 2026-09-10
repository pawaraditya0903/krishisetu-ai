import { NextResponse } from "next/server";
import { initialCropsCatalog } from "@/lib/admin-initial-data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") || "").toLowerCase().trim();

  let crops = initialCropsCatalog;

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
