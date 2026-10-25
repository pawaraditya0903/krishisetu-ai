import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const reqId = `REQ-${Date.now().toString().slice(-6)}`;

    const cropRequest = {
      id: reqId,
      farmerId: body.farmerId || "F1",
      farmerName: body.farmerName || "Verified Farmer",
      requestedCropName: body.requestedCropName || body.requested_crop_name,
      variety: body.variety,
      category: body.category || "Vegetable",
      reason: body.reason,
      status: "PENDING_REVIEW",
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json(cropRequest, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: "Invalid request payload", details: err.message }, { status: 400 });
  }
}
