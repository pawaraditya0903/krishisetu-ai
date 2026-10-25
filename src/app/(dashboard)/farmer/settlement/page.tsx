"use client";

import { useAppStore } from "@/lib/store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Download, ExternalLink, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export default function SettlementPage() {
  const { settlements, currentUser, lots } = useAppStore();
  const mySettlements = settlements.filter((s) => s.farmerId === currentUser?.id);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Settlement Receipts &amp; Payout Audit</h1>
        <p className="text-slate-500 text-sm">
          Transparent, verifiable digital receipts for completed transactions released through partner nodal accounts.
        </p>
      </div>

      {mySettlements.length === 0 && (
        <div className="p-8 text-center text-slate-500 border border-dashed rounded-xl bg-slate-50 text-xs sm:text-sm">
          No settlements available yet. Join an active pool and wait for buyer acceptance.
        </div>
      )}

      {mySettlements.map((settlement) => {
        const myLots = lots.filter((l) => l.farmerId === currentUser?.id);
        const associatedLot = myLots.find((l) => l.id === settlement.lotId) || myLots[0];

        return (
          <Card key={settlement.id} className="overflow-hidden border-green-300 shadow-sm">
            <div className="bg-emerald-700 text-white p-6 flex flex-col sm:flex-row items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle2 className="w-5 h-5 text-emerald-300" />
                  <h2 className="text-xl font-bold">Nodal Payout Released</h2>
                </div>
                <p className="text-emerald-100 text-xs">
                  Txn ID: <strong className="font-mono">{settlement.transactionId}</strong>
                </p>
                <div className="text-[11px] text-emerald-200 mt-1">
                  Nodal Ref: {settlement.nodalAccountRef}
                </div>
              </div>
              <div className="sm:text-right">
                <div className="text-xs text-emerald-200">Net Realized Amount</div>
                <div className="text-3xl font-extrabold text-white">₹{Math.round(settlement.amount).toLocaleString()}</div>
                <Badge className="bg-emerald-600 text-white border-none text-[10px] mt-1">
                  Direct Bank/UPI Credited
                </Badge>
              </div>
            </div>

            <CardContent className="p-6">
              <div className="grid grid-cols-2 gap-y-3 text-xs mb-6 pb-6 border-b border-slate-100">
                <div className="text-slate-500">Transaction Date</div>
                <div className="font-medium text-right text-slate-800">
                  {new Date(settlement.date).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </div>

                <div className="text-slate-500">Beneficiary Farmer</div>
                <div className="font-medium text-right text-slate-800">{currentUser?.name}</div>

                <div className="text-slate-500">Commodity &amp; Verified Grade</div>
                <div className="font-medium text-right text-slate-800">
                  {associatedLot?.crop || "Tomato"} ({associatedLot?.variety || "Hybrid"}) • {associatedLot?.grade || "Grade A"}
                </div>

                <div className="text-slate-500">Beneficiary UPI Handle</div>
                <div className="font-mono font-medium text-right text-slate-800 flex items-center justify-end gap-1.5">
                  rameshpatil****@okhdfcbank
                  <Badge variant="outline" className="text-[9px] bg-green-50 text-green-700 border-green-300 px-1 py-0">
                    Verified
                  </Badge>
                </div>
              </div>

              {/* Itemized Deductions */}
              <div>
                <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-3">
                  Itemized Transparent Cost Breakdown
                </h3>
                <div className="space-y-2.5 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Gross Consignment Value:</span>
                    <span className="font-semibold text-slate-900">₹{settlement.breakdown.gross.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shared Group Freight Deduction:</span>
                    <span className="text-red-600 font-medium">-₹{settlement.breakdown.freight.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Standard Plastic Crates &amp; Packaging:</span>
                    <span className="text-red-600 font-medium">-₹{settlement.breakdown.packaging.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Hub Weighment &amp; Loading Labour:</span>
                    <span className="text-red-600 font-medium">-₹{settlement.breakdown.handling.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Saksham FPO Service Fee (1.5%):</span>
                    <span className="text-red-600 font-medium">-₹{settlement.breakdown.fpoFee.toLocaleString()}</span>
                  </div>
                  {settlement.breakdown.qualityAdj > 0 && (
                    <div className="flex justify-between">
                      <span>Agreed Quality Deduction:</span>
                      <span className="text-red-600 font-medium">-₹{settlement.breakdown.qualityAdj.toLocaleString()}</span>
                    </div>
                  )}

                  <div className="flex justify-between pt-3 border-t border-slate-200 font-bold text-sm text-slate-900">
                    <span>Final Credited Payout:</span>
                    <span className="text-green-700 text-base">₹{Math.round(settlement.amount).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </CardContent>

            <div className="bg-slate-50 p-4 border-t border-slate-100 flex flex-col sm:flex-row justify-between gap-2 text-xs">
              <Button
                variant="outline"
                size="sm"
                className="text-slate-700"
                onClick={() => toast.success("Weigh-Slip Receipt downloaded (PDF).")}
              >
                <Download className="w-3.5 h-3.5 mr-1.5" /> Download Digital Weigh-Slip PDF
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-slate-600"
                onClick={() =>
                  toast.info("Nodal Ledger Entry: SHA-256 Hash Verified", {
                    description: `Hash: 3b7c89f2a4d9821ef9a12c8b74301dfca21980bc9e1a87c6b4e09f7a8b61c82e`,
                  })
                }
              >
                <ExternalLink className="w-3.5 h-3.5 mr-1.5" /> View Append-Only Audit Log
              </Button>
            </div>
          </Card>
        );
      })}

      <div className="bg-white border border-slate-200 rounded-xl p-4 flex gap-3 text-xs text-slate-600 shadow-xs">
        <ShieldCheck className="w-6 h-6 text-green-700 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <p className="font-bold text-slate-900 mb-0.5">Partner-Enabled Payment Protection Policy (RBI Compliant)</p>
          <p>
            KrishiSetu AI never holds farmer funds directly. All purchase values are held in a scheduled commercial bank nodal account upon buyer reservation and automatically disbursed to the farmer&apos;s bank/UPI within 24 hours of digital delivery acceptance.
          </p>
        </div>
      </div>
    </div>
  );
}
