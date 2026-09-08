"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { Pool } from "@/lib/types";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, MapPin, Truck } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function BuyerMarketplacePage() {
  const router = useRouter();
  const { pools, reservePool, currentUser } = useAppStore();
  const openPools = pools.filter((p) => p.status === "Open" || p.status === "Closed");
  const [selectedPool, setSelectedPool] = useState<Pool | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const handleReserve = () => {
    if (selectedPool && currentUser) {
      reservePool(selectedPool.id, currentUser.id, currentUser.name);
      setIsAuthOpen(false);
      toast.success("Payment Authorized & Pool Reserved!", {
        description: `Consignment ${selectedPool.id} reserved. Protected nodal escrow funds placed on hold.`,
      });
      router.push("/buyer/delivery");
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">B2B Wholesale Marketplace</h1>
          <p className="text-slate-500 text-sm">
            Procure verified aggregated lots from Baramati &amp; Pune FPO clusters with regulated payment protection.
          </p>
        </div>
        <div className="flex gap-2">
          <select className="border border-slate-300 rounded-lg text-xs p-2 bg-white">
            <option>All Crops (Tomato)</option>
          </select>
          <select className="border border-slate-300 rounded-lg text-xs p-2 bg-white">
            <option>All Grades (Grade A/B)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {openPools.length === 0 && (
          <div className="col-span-full p-8 text-center text-slate-500 border border-dashed rounded-lg bg-slate-50">
            No open pools available right now. New farmer consignments are being verified.
          </div>
        )}
        {openPools.map((pool) => {
          const totalValue = Math.round((pool.currentKg / 100) * pool.pricePerQtl);
          return (
            <Card key={pool.id} className="border-slate-200 overflow-hidden shadow-sm hover:border-green-400 transition-all flex flex-col justify-between">
              <div>
                <div className="h-32 bg-slate-800 relative flex items-end p-3">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                  <Badge className="absolute top-3 left-3 bg-green-600 text-white border-none text-[10px]">
                    <ShieldCheck className="w-3 h-3 mr-1" /> FPO Verified
                  </Badge>
                  <div className="relative z-10 text-white">
                    <h3 className="font-bold text-base">{pool.crop} - {pool.variety}</h3>
                    <div className="text-xs text-slate-300 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" /> {pool.collectionHub}
                    </div>
                  </div>
                </div>

                <CardContent className="p-4 space-y-3">
                  <div className="flex justify-between items-end pb-2 border-b border-slate-100">
                    <div>
                      <div className="text-xs text-slate-500 mb-0.5">Available Volume</div>
                      <div className="font-bold text-slate-900 text-base">{pool.currentKg} kg</div>
                      <div className="text-[10px] text-slate-400">Target: {pool.targetKg} kg</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-slate-500 mb-0.5">Asking Price</div>
                      <div className="font-bold text-green-700 text-lg">
                        ₹{pool.pricePerQtl}
                        <span className="text-xs font-normal text-slate-500">/qtl</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <Badge variant="outline" className="text-[10px]">
                        {pool.allowedGrades.join(", ")}
                      </Badge>
                      <span className="text-green-700 font-medium">{pool.sharedFreightSavingsPct}% Freight Saved</span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-slate-500">
                      <Truck className="w-3.5 h-3.5" /> Dispatch Ready
                    </div>
                  </div>
                </CardContent>
              </div>

              <CardFooter className="p-4 pt-0">
                <Button
                  className="w-full bg-green-700 hover:bg-green-800 text-xs"
                  onClick={() => {
                    setSelectedPool(pool);
                    setIsAuthOpen(true);
                  }}
                >
                  Reserve Pool (Est. ₹{totalValue.toLocaleString()})
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* Payment Authorization Modal */}
      <Dialog open={isAuthOpen} onOpenChange={setIsAuthOpen}>
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-900">
              <ShieldCheck className="w-5 h-5 text-green-600" />
              Nodal Escrow Payment Authorization
            </DialogTitle>
            <DialogDescription className="text-xs">
              Automated Partner Banking Gateway (RBI Electronic Mandate &amp; Nodal Guidelines Compliant).
            </DialogDescription>
          </DialogHeader>

          <div className="bg-slate-50 p-4 rounded-lg space-y-2.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Consignment Pool ID:</span>
              <span className="font-mono font-semibold">{selectedPool?.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Total Pooled Weight:</span>
              <span className="font-semibold">{selectedPool?.currentKg} kg</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Rate per Quintal:</span>
              <span className="font-semibold">₹{selectedPool?.pricePerQtl}</span>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-2 text-sm">
              <span className="font-bold text-slate-800">Total Held Amount:</span>
              <span className="font-bold text-green-700 text-base">
                ₹{Math.round(((selectedPool?.currentKg || 0) / 100) * (selectedPool?.pricePerQtl || 2050)).toLocaleString()}
              </span>
            </div>
          </div>

          <div className="text-[11px] text-slate-600 bg-emerald-50 p-3 rounded-lg border border-emerald-200 leading-relaxed">
            <strong>Payment Protection Guarantee:</strong> KrishiSetu does not hold buyer funds directly. Authorization is held securely in an RBI-compliant partner nodal escrow account. Funds are released to farmers only upon verified gate acceptance.
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setIsAuthOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleReserve} size="sm" className="bg-green-700 hover:bg-green-800">
              Authorize Escrow Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
