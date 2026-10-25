import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json([
    {
      id: "AUD-1725781200-101",
      timestamp: "2026-09-08T06:00:00Z",
      actor_name: "System Nodal Daemon",
      actor_role: "system",
      action: "NODAL_PAYOUT_RELEASED",
      entity_type: "SETTLEMENT",
      entity_id: "SET-2026-00041",
      details: "RBI Nodal Escrow disbursement executed for Farmer Ramesh Patil. Amount: ₹8,420.",
      prev_hash: "0000000000000000000000000000000000000000000000000000000000000000",
      hash: "8f4b23c91a7e2b10d5c8e3f94a1b7c2d5e6f8a9b0c1d2e3f4a5b6c7d8e9f0a1b",
    },
    {
      id: "AUD-1725784800-102",
      timestamp: "2026-09-08T07:00:00Z",
      actor_name: "FPO Baramati Center Inspector",
      actor_role: "fpo",
      action: "LOT_VERIFIED",
      entity_type: "CROP_LOT",
      entity_id: "LOT-TOM-8491",
      details: "Physical weigh-bridge and visual calibration confirmed 450 kg Grade A.",
      prev_hash: "8f4b23c91a7e2b10d5c8e3f94a1b7c2d5e6f8a9b0c1d2e3f4a5b6c7d8e9f0a1b",
      hash: "3a9c7d1e5b8f2a04c6d8e9f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1",
    },
  ]);
}
