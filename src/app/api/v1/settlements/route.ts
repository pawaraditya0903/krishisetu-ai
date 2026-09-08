import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json([
    {
      id: "SET-2026-00041",
      transaction_id: "TXN-NODAL-8921-SBI-BMT",
      farmer_id: "F1",
      farmer_name: "Ramesh Patil",
      lot_id: "LOT-TOM-8491",
      amount: 8420,
      status: "Released",
      date: "2026-09-07",
      nodal_account_ref: "SBI-NODAL-ESCROW-BARAMATI-0012",
      breakdown: {
        gross: 9675,
        freight: 480,
        packaging: 150,
        handling: 180,
        fpo_fee: 195,
        quality_adj: 0,
        loss_buffer: 250,
        net: 8420,
      },
    },
    {
      id: "SET-2026-00042",
      transaction_id: "TXN-NODAL-8922-SBI-BMT",
      farmer_id: "F1",
      farmer_name: "Ramesh Patil",
      lot_id: "LOT-ONI-3912",
      amount: 19450,
      status: "Pending",
      date: "2026-09-08",
      nodal_account_ref: "SBI-NODAL-ESCROW-BARAMATI-0012",
      breakdown: {
        gross: 21600,
        freight: 850,
        packaging: 300,
        handling: 250,
        fpo_fee: 450,
        quality_adj: 0,
        loss_buffer: 300,
        net: 19450,
      },
    },
  ]);
}
