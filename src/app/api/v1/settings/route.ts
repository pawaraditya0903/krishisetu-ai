import { NextResponse } from "next/server";
import { initialPlatformSettings } from "@/lib/admin-initial-data";

// In-memory runtime persistence for Next.js server instance
let liveSettings = { ...initialPlatformSettings };

export async function GET() {
  return NextResponse.json(liveSettings);
}

export async function POST(request: Request) {
  try {
    const updates = await request.json();
    liveSettings = {
      ...liveSettings,
      ...updates,
    };
    return NextResponse.json({
      status: "success",
      message: "Platform settings updated successfully",
      settings: liveSettings,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to update platform settings", details: err?.message },
      { status: 400 }
    );
  }
}
