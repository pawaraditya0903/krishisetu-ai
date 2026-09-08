"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckSquare, AlertTriangle, Truck } from "lucide-react";
import { toast } from "sonner";

export default function BuyerDeliveryPage() {
  const { pools, currentUser, acceptDelivery, raiseDispute } = useAppStore();
  const [selectedDisputePool, setSelectedDisputePool] = useState<string | null>(null);
  const [disputeReason, setDisputeReason] = useState("Underweight by 15kg and 8% fruit bruising detected upon unloading");

  // Show pools reserved by this buyer
  const activeDeliveries = pools.filter(
    (p) =>
      p.buyerId === currentUser?.id &&
      (p.status === "Reserved" || p.status === "Dispatched" || p.status === "Accepted" || p.status === "Disputed")
  );

  const handleAccept = (poolId: string) => {
    acceptDelivery(poolId);
    toast.success("Delivery Formally Accepted!", {
      description: "Protected nodal sandbox funds have been split and released to farmers.",
    });
  };

  const handleOpenDispute = (poolId: string) => {
    setSelectedDisputePool(poolId);
  };

  const handleConfirmDispute = () => {
    if (selectedDisputePool) {
      raiseDispute(selectedDisputePool, disputeReason);
      setSelectedDisputePool(null);
      toast.error("Dispute Formally Raised", {
        description: "Payment release is held in sandbox until FPO and Admin resolution.",
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Delivery Acceptance &amp; Payout Release</h1>
        <p className="text-slate-500 text-sm">
          Inspect arrived consignments against digital weigh-slips. Release funds or log quality adjustments within 24 hours.
        </p>
      </div>

      {activeDeliveries.length === 0 && (
        <div className="p-8 text-center text-slate-500 border border-dashed rounded-lg bg-slate-50">
          You have no active deliveries. Reserve a pool in the B2B Marketplace first.
        </div>
      )}

      {activeDeliveries.map((pool) => (
        <Card key={pool.id} className="border-slate-200 overflow-hidden shadow-sm">
          <CardHeader className="bg-slate-50/50 pb-3 border-b border-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-lg font-bold">Consignment #{pool.id}</CardTitle>
                  {pool.status === "Reserved" && <Badge className="bg-amber-100 text-amber-800 border-none">Awaiting FPO Dispatch</Badge>}
                  {pool.status === "Dispatched" && <Badge className="bg-blue-100 text-blue-800 border-none">In Transit</Badge>}
                  {pool.status === "Accepted" && <Badge className="bg-emerald-100 text-emerald-800 border-none">Accepted &amp; Paid</Badge>}
                  {pool.status === "Disputed" && <Badge className="bg-red-100 text-red-800 border-none">Disputed (Funds Held)</Badge>}
                </div>
                <CardDescription className="text-xs text-slate-500 mt-0.5">
                  Origin: {pool.collectionHub} &rarr; Destination: Hadapsar Warehouse, Pune
                </CardDescription>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-500">Consignment Value:</span>
                <div className="font-bold text-green-700 text-base">
                  ₹{Math.round((pool.currentKg / 100) * pool.pricePerQtl).toLocaleString()}
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 text-xs">
              <div className="bg-slate-50 p-3 rounded-lg">
                <div className="text-slate-500 mb-0.5">Assigned FPO</div>
                <div className="font-semibold text-slate-900">Saksham Baramati Krushi PC</div>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg">
                <div className="text-slate-500 mb-0.5">Verified Bulk Weight</div>
                <div className="font-semibold text-slate-900">{pool.currentKg} kg</div>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg">
                <div className="text-slate-500 mb-0.5">Assigned Transporter</div>
                <div className="font-semibold text-slate-900">{pool.transporter?.vehicleNumber || "MH-12-RN-5821"}</div>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg">
                <div className="text-slate-500 mb-0.5">Contract Price</div>
                <div className="font-semibold text-green-700">₹{pool.pricePerQtl}/qtl</div>
              </div>
            </div>

            {(pool.status === "Reserved" || pool.status === "Dispatched") && (
              <div className="border border-slate-200 rounded-xl p-6 text-center space-y-4 bg-slate-50/50">
                <div className="mx-auto w-14 h-14 bg-green-50 text-green-700 rounded-full flex items-center justify-center">
                  <Truck className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Vehicle Arrival &amp; Quality Inspection</h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                    Scan the vehicle gate QR pass and match crates against the FPO digital weigh-slip before releasing the nodal sandbox payment.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => handleOpenDispute(pool.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 text-xs"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 mr-1.5" /> Raise Quality/Weight Dispute
                  </Button>
                  <Button
                    onClick={() => handleAccept(pool.id)}
                    className="bg-green-700 hover:bg-green-800 text-xs"
                  >
                    <CheckSquare className="w-3.5 h-3.5 mr-1.5" /> Confirm Delivery &amp; Release Funds
                  </Button>
                </div>
              </div>
            )}

            {pool.status === "Accepted" && (
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-start gap-3 text-emerald-900">
                <CheckSquare className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs leading-relaxed">
                  <p className="font-bold mb-0.5">Delivery Accepted &amp; Payment Released</p>
                  <p className="text-emerald-800">
                    The nodal authorized payment of ₹{Math.round((pool.currentKg / 100) * pool.pricePerQtl).toLocaleString()} has been split into farmer bank/UPI accounts based on verified weights. Individual transparent receipts have been generated.
                  </p>
                </div>
              </div>
            )}

            {pool.status === "Disputed" && (
              <div className="bg-red-50 border border-red-200 p-4 rounded-xl flex items-start gap-3 text-red-900">
                <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div className="text-xs leading-relaxed">
                  <p className="font-bold mb-0.5">Dispute Raised — Funds on Nodal Hold</p>
                  <p className="text-red-800">
                    Resolution timer initiated (SLA 24 hours). Saksham FPO Manager and KrishiSetu Admin have been notified to inspect evidence.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      {/* Dispute Modal */}
      <Dialog open={!!selectedDisputePool} onOpenChange={(o) => !o && setSelectedDisputePool(null)}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="text-red-700 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" /> Raise Consignment Dispute
            </DialogTitle>
            <DialogDescription className="text-xs">
              Log discrepancies for Pool #{selectedDisputePool}. Funds remain frozen until resolved.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Dispute Reason &amp; Findings</Label>
              <Input
                value={disputeReason}
                onChange={(e) => setDisputeReason(e.target.value)}
                className="text-xs"
              />
            </div>
            <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded border">
              Attach sample photos of damaged crates or weigh-bridge slip. The FPO manager will receive an immediate notification to review deductions.
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setSelectedDisputePool(null)}>
              Cancel
            </Button>
            <Button variant="destructive" size="sm" onClick={handleConfirmDispute}>
              Submit Dispute
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
