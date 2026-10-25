"use client";

import { useAppStore } from "@/lib/store";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { QrCode, CheckCircle2, Truck, FileText, ArrowRight, ShieldCheck, Users } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function FarmerOrdersPage() {
  const { lots, currentUser, pools } = useAppStore();

  const myLots = lots.filter((l) => l.farmerId === currentUser?.id);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Draft":
        return <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-300">Draft</Badge>;
      case "Submitted":
        return <Badge className="bg-blue-100 text-blue-800 border-none">Awaiting FPO Check</Badge>;
      case "Verified":
        return <Badge className="bg-green-100 text-green-800 border-none">FPO Verified</Badge>;
      case "Pooled":
        return <Badge className="bg-purple-100 text-purple-800 border-none">Pooled for Dispatch</Badge>;
      case "Reserved":
        return <Badge className="bg-amber-100 text-amber-800 border-none">Buyer Reserved</Badge>;
      case "Dispatched":
        return <Badge className="bg-indigo-100 text-indigo-800 border-none">In Transit</Badge>;
      case "Delivered":
        return <Badge className="bg-cyan-100 text-cyan-800 border-none">Delivered to Buyer</Badge>;
      case "Accepted":
      case "Paid":
        return <Badge className="bg-emerald-100 text-emerald-800 border-none">Settled &amp; Paid</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Crop Lots &amp; Orders</h1>
          <p className="text-slate-500 text-sm">
            Track lot progress from AI quality grading to FPO pooling and payment release.
          </p>
        </div>
        <Link href="/farmer/grade">
          <Button className="bg-green-700 hover:bg-green-800">
            Create New Lot
          </Button>
        </Link>
      </div>

      {myLots.length === 0 ? (
        <Card className="p-8 text-center border-dashed">
          <CardContent className="space-y-3">
            <div className="mx-auto w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-green-700">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-slate-800">No crop lots submitted yet</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto">
              Start by taking photos of your tomato harvest to generate an external quality estimate and digital gate pass.
            </p>
            <Link href="/farmer/grade">
              <Button className="bg-green-700 hover:bg-green-800 mt-2">Start Selling</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {myLots.map((lot) => {
            const associatedPool = pools.find((p) => p.id === lot.poolId);
            return (
              <Card key={lot.id} className="overflow-hidden border-slate-200 hover:border-green-300 transition-all">
                <div className="p-5 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-lg text-slate-900">{lot.crop} ({lot.variety})</h3>
                        {getStatusBadge(lot.status)}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span>Lot ID: <strong className="font-mono text-slate-700">{lot.id}</strong></span>
                        <span>Date: {new Date(lot.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                        <span>Hub: Baramati FPO Yard</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toast.info(`Digital QR Pass: ${lot.qrCode || lot.id}`, {
                          description: "Show this QR code to the Saksham FPO weigh-bridge operator upon arrival."
                        })}
                        className="text-xs"
                      >
                        <QrCode className="w-3.5 h-3.5 mr-1.5" /> Show Gate QR
                      </Button>
                      {lot.status === "Paid" && (
                        <Link href="/farmer/settlement">
                          <Button size="sm" className="bg-green-700 hover:bg-green-800 text-xs">
                            View Receipt
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* Lot Details Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 text-sm">
                    <div className="bg-slate-50 p-3 rounded-lg">
                      <div className="text-xs text-slate-500 mb-0.5">Declared Weight</div>
                      <div className="font-bold text-slate-800">{lot.quantityKg} kg</div>
                      <div className="text-[10px] text-slate-400">~{(lot.quantityKg / 100).toFixed(2)} quintals</div>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg">
                      <div className="text-xs text-slate-500 mb-0.5">Verified Weight</div>
                      <div className="font-bold text-slate-800">
                        {lot.verifiedWeightKg ? `${lot.verifiedWeightKg} kg` : "Pending Physical Check"}
                      </div>
                      <div className="text-[10px] text-green-700 font-medium">
                        {lot.verifiedWeightKg ? "Weigh-slip logged" : "At collection center"}
                      </div>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg">
                      <div className="text-xs text-slate-500 mb-0.5">External AI Grade</div>
                      <div className="font-bold text-green-700">{lot.grade}</div>
                      <div className="text-[10px] text-slate-500">{lot.confidenceScore ? `${lot.confidenceScore}% confidence` : "Visual estimate"}</div>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg">
                      <div className="text-xs text-slate-500 mb-0.5">Pool Linkage</div>
                      <div className="font-bold text-slate-800">{lot.poolId ? lot.poolId : "Not Pooled"}</div>
                      <div className="text-[10px] text-purple-700">
                        {associatedPool ? `${associatedPool.destinationMandi}` : "Eligible to join"}
                      </div>
                    </div>
                  </div>

                  {/* Workflow Progress Bar */}
                  <div className="pt-2 border-t border-slate-100">
                    <div className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">
                      FPO Market Lifecycle Status
                    </div>
                    <div className="flex items-center justify-between text-xs font-medium text-slate-600 gap-1 overflow-x-auto pb-1">
                      <div className="flex items-center gap-1 text-green-700 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-600" /> Image Graded
                      </div>
                      <ArrowRight className="w-3 h-3 text-slate-300 shrink-0" />
                      <div className={`flex items-center gap-1 ${["Verified", "Pooled", "Reserved", "Dispatched", "Delivered", "Accepted", "Paid"].includes(lot.status) ? "text-green-700 font-semibold" : "text-slate-400"}`}>
                        <CheckCircle2 className="w-3.5 h-3.5" /> FPO Verified
                      </div>
                      <ArrowRight className="w-3 h-3 text-slate-300 shrink-0" />
                      <div className={`flex items-center gap-1 ${["Pooled", "Reserved", "Dispatched", "Delivered", "Accepted", "Paid"].includes(lot.status) ? "text-green-700 font-semibold" : "text-slate-400"}`}>
                        <Users className="w-3.5 h-3.5" /> Pooled
                      </div>
                      <ArrowRight className="w-3 h-3 text-slate-300 shrink-0" />
                      <div className={`flex items-center gap-1 ${["Dispatched", "Delivered", "Accepted", "Paid"].includes(lot.status) ? "text-green-700 font-semibold" : "text-slate-400"}`}>
                        <Truck className="w-3.5 h-3.5" /> Dispatched
                      </div>
                      <ArrowRight className="w-3 h-3 text-slate-300 shrink-0" />
                      <div className={`flex items-center gap-1 ${lot.status === "Paid" ? "text-green-700 font-semibold" : "text-slate-400"}`}>
                        <ShieldCheck className="w-3.5 h-3.5" /> Payout Settled
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
