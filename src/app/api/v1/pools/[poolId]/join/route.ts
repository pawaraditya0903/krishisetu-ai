import { NextRequest, NextResponse } from "next/server";
import { WIDE_FPO_POOLS } from "@/lib/agricultural-data";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ poolId: string }> }
) {
  const resolvedParams = await params;
  const poolId = resolvedParams.poolId;

  try {
    const body = await request.json();
    const lotId = body.lot_id || "LOT-GENERIC";

    const pool = WIDE_FPO_POOLS.find((p) => p.id === poolId) || WIDE_FPO_POOLS[0];
    const updated = {
      ...pool,
      current_kg: Math.min(pool.target_kg, pool.current_kg + 350),
      last_joined_lot: lotId,
    };

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Failed to join pool" }, { status: 400 });
  }
}
