"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Truck, Clock, CheckCircle2, MapPin } from "lucide-react";
import { toast } from "sonner";

export default function PoolingPage() {
  const { pools, lots, joinPool, currentUser } = useAppStore();

  // Find verified lots belonging to current user that are not yet pooled
  const currentUserLots = lots.filter(
    (l) => l.farmerId === currentUser?.id && (l.status === "Verified" || l.status === "Submitted") && !l.poolId
  );

  const [selectedLotId, setSelectedLotId] = useState<string>(currentUserLots[0]?.id || "");
  const [joined, setJoined] = useState(false);

  const selectedLot = lots.find((l) => l.id === selectedLotId) || currentUserLots[0];

  const handleJoin = (poolId: string) => {
    if (!selectedLot) {
      toast.error("Please select a verified lot to join the pool.");
      return;
    }
    joinPool(selectedLot.id, poolId);
    setJoined(true);
    toast.success("Joined FPO Pool Successfully!", {
      description: `Your ${selectedLot.quantityKg} kg Tomato lot has been allocated to Pool ${poolId}.`,
    });
    setTimeout(() => setJoined(false), 4000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">FPO Group Pooling</h1>
        <p className="text-slate-500 text-sm">
          Pool your verified harvest with other farmers to unlock bulk freight savings (up to 30%) and access wholesale institutional buyers.
        </p>
      </div>

      {currentUserLots.length > 0 ? (
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">
              Select Your Verified Lot to Pool:
            </div>
            <select
              className="border border-slate-300 rounded-lg text-xs p-2.5 w-full sm:w-80 bg-slate-50 font-medium"
              value={selectedLotId}
              onChange={(e) => setSelectedLotId(e.target.value)}
            >
              {currentUserLots.map((lot) => (
                <option key={lot.id} value={lot.id}>
                  {lot.id} • {lot.crop} ({lot.variety}) - {lot.grade} ({lot.quantityKg} kg)
                </option>
              ))}
            </select>
          </div>
          <Badge className="bg-green-100 text-green-800 border-none text-xs h-fit px-3 py-1">
            Eligible for FPO Freight Discount
          </Badge>
        </div>
      ) : (
        <div className="bg-slate-50 p-6 rounded-xl border border-dashed border-slate-300 text-center text-slate-500 text-xs sm:text-sm">
          You don&apos;t have any verified lots available for pooling right now. Complete crop grading and FPO verification first.
        </div>
      )}

      {joined && (
        <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-xl flex items-center text-xs sm:text-sm shadow-xs">
          <CheckCircle2 className="w-5 h-5 mr-2.5 text-green-600 shrink-0" />
          <span>Successfully joined the FPO pool! Your shared transport discount is locked in.</span>
        </div>
      )}

      <div className="space-y-4">
        {pools.map((pool) => {
          const progressPct = Math.min(100, Math.round((pool.currentKg / pool.targetKg) * 100));
          return (
            <Card key={pool.id} className="overflow-hidden border-slate-200 shadow-sm">
              <div className="h-2 bg-slate-100 w-full">
                <div
                  className="h-full bg-green-600 transition-all"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {pool.id}
                      </span>
                      <Badge variant="outline" className="text-slate-700">
                        {pool.crop} - {pool.variety}
                      </Badge>
                      <Badge variant="outline" className="text-amber-700 border-amber-200 bg-amber-50 text-[10px]">
                        {pool.allowedGrades.join(" / ")}
                      </Badge>
                      {progressPct >= 100 ? (
                        <Badge className="bg-red-100 text-red-800 border-none text-[10px]">Full</Badge>
                      ) : (
                        <Badge className="bg-green-100 text-green-800 border-none text-[10px]">Filling Fast</Badge>
                      )}
                    </div>

                    <h3 className="text-xl font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-green-700" />
                      {pool.collectionHub} &rarr; {pool.destinationMandi}
                    </h3>

                    <div className="text-xs text-slate-500 flex flex-wrap items-center gap-4 mt-3">
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4 text-slate-400" /> {(pool.contributions || []).length + 3} Farmers Participating
                      </span>
                      <span className="flex items-center gap-1 text-green-700 font-semibold bg-green-50 px-2 py-0.5 rounded">
                        <Truck className="w-4 h-4" /> -{pool.sharedFreightSavingsPct}% Shared Freight
                      </span>
                    </div>
                  </div>

                  <div className="md:text-right flex flex-col md:items-end justify-center border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6">
                    <div className="text-xs text-slate-500 mb-1">Pool Capacity</div>
                    <div className="text-2xl font-extrabold text-slate-900">
                      {pool.currentKg} <span className="text-xs font-normal text-slate-500">/ {pool.targetKg} kg</span>
                    </div>
                    <div className="text-xs text-amber-700 flex items-center gap-1 mt-1.5 font-medium">
                      <Clock className="w-3.5 h-3.5" /> Closes in 4 hours
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-slate-50 px-6 py-3.5 border-t border-slate-100 flex justify-between items-center text-xs">
                <div className="text-slate-600">
                  <span className="font-semibold text-slate-800">Target Buyer Rate:</span>{" "}
                  <strong className="text-green-700 text-sm">₹{pool.pricePerQtl}/qtl</strong>
                </div>
                <Button
                  onClick={() => handleJoin(pool.id)}
                  disabled={!selectedLot || progressPct >= 100}
                  className="bg-green-700 hover:bg-green-800 text-xs"
                >
                  Join This Pool ({selectedLot ? `${selectedLot.quantityKg} kg` : "Select Lot"})
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* Transparent Settlement Preview for Selected Lot */}
      {selectedLot && (
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-5 shadow-xs">
          <h4 className="font-bold text-blue-950 text-sm mb-1">
            Individual Settlement Estimation for {selectedLot.id} ({selectedLot.quantityKg} kg)
          </h4>
          <p className="text-xs text-blue-800 mb-4 leading-relaxed">
            By joining this shared FPO dispatch to Pune Market Yard, your per-kg freight drops from ₹1.25/kg to ₹0.85/kg:
          </p>
          <div className="bg-white p-4 rounded-lg border border-blue-100 text-xs grid grid-cols-2 gap-y-2">
            <div className="text-slate-500">Gross Harvest Value ({selectedLot.quantityKg} kg @ ₹2,050/qtl):</div>
            <div className="font-medium text-right text-slate-800">
              ₹{Math.round((selectedLot.quantityKg / 100) * 2050).toLocaleString()}
            </div>
            <div className="text-slate-500">Shared Group Freight (28.5% Discount):</div>
            <div className="font-medium text-right text-red-600">
              -₹{Math.round(selectedLot.quantityKg * 0.85).toLocaleString()}
            </div>
            <div className="text-slate-500">FPO Operational Fee (1.5%):</div>
            <div className="font-medium text-right text-red-600">
              -₹{Math.round((selectedLot.quantityKg / 100) * 2050 * 0.015).toLocaleString()}
            </div>
            <div className="text-slate-700 font-bold pt-2 border-t mt-1">Estimated Net Realization:</div>
            <div className="text-green-700 font-bold text-right pt-2 border-t mt-1 text-sm">
              ₹{Math.round((selectedLot.quantityKg / 100) * 2050 - selectedLot.quantityKg * 0.85 - (selectedLot.quantityKg / 100) * 2050 * 0.015).toLocaleString()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
