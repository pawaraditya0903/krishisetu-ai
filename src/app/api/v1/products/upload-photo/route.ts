import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const category = (formData.get("category") as string) || "OTHER";
    const farmerId = (formData.get("farmerId") as string) || "F1";

    if (!file) {
      return NextResponse.json({ error: "No image file uploaded" }, { status: 400 });
    }

    // Validation
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!allowed.includes(file.type.toLowerCase())) {
      return NextResponse.json({ error: "Invalid image format" }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File exceeds 10MB limit" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const filename = `${Date.now()}_${category}_${safeName}`;

    // Target upload directory
    const uploadDir = path.join(process.cwd(), "public", "uploads", "products");
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch {}

    const filePath = path.join(uploadDir, filename);
    await writeFile(filePath, buffer);

    const publicUrl = `/uploads/products/${filename}`;
    const imgId = `IMG-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    return NextResponse.json({
      id: imgId,
      farmerId,
      imageUrl: publicUrl,
      storageKey: `uploads/products/${filename}`,
      category,
      displayOrder: 1,
      uploadedAt: new Date().toISOString(),
      fileType: file.type,
      fileSize: file.size,
    });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to process photo upload", details: err.message }, { status: 500 });
  }
}
