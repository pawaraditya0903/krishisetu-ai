"use client";

import { useAppStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Truck, CheckCircle, Navigation, TrendingDown } from "lucide-react";
import { toast } from "sonner";

export default function FPOLogisticsPage() {
  const { pools, dispatchPool, routePlans } = useAppStore();
  const reservedPools = pools.filter((p) => p.status === "Reserved" || p.status === "Dispatched" || p.status === "Open");
  const activeRoute = routePlans[0];

  const handleDispatch = (poolId: string) => {
    dispatchPool(poolId, {
      name: "Patil Agro Logistics",
      vehicleNumber: "MH-12-RN-5821",
      contact: "+91 98220 12345",
    });
    toast.success("Consignment Dispatched!", {
      description: `Pool ${poolId} dispatched via MH-12-RN-5821. Digital weigh-slip shared with buyer.`,
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Logistics &amp; Route Optimization</h1>
          <p className="text-slate-500 text-sm">
            Google OR-Tools CVRPTW solver generates optimal farmer pickup sequences and bulk transport dispatches.
          </p>
        </div>
        <Badge variant="outline" className="bg-green-50 text-green-800 border-green-300 w-fit text-xs">
          <TrendingDown className="w-3.5 h-3.5 mr-1" /> 28.5% Freight Cost Reduction vs Solo Vehicles
        </Badge>
      </div>

      {/* OR-Tools Route Solver Card */}
      {activeRoute && (
        <Card className="border-slate-200 shadow-sm overflow-hidden">
          <CardHeader className="bg-slate-50/70 pb-3 border-b border-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-green-700" />
                  <CardTitle className="text-base font-bold">
                    Optimized Multi-Stop Pickup Sequence ({activeRoute.routeId})
                  </CardTitle>
                </div>
                <CardDescription className="text-xs text-slate-500 mt-0.5">
                  Algorithm: Capacitated Vehicle Routing Problem with Time Windows (CVRPTW)
                </CardDescription>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="bg-white border px-2 py-1 rounded font-medium text-slate-700">
                  Vehicle: <strong>{activeRoute.vehicle}</strong>
                </span>
                <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-1 rounded">
                  {activeRoute.loadUtilizationPct}% Full
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-5">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs mb-5">
              <div className="bg-slate-50 p-3 rounded-lg">
                <span className="text-slate-400 block text-[10px]">Total Loop Distance</span>
                <strong className="text-slate-800 text-sm">{activeRoute.totalDistanceKm} km</strong>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg">
                <span className="text-slate-400 block text-[10px]">Driver Assigned</span>
                <strong className="text-slate-800 text-sm truncate block">{activeRoute.driver}</strong>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg">
                <span className="text-slate-400 block text-[10px]">Estimated Route Cost</span>
                <strong className="text-green-700 text-sm">₹{activeRoute.estCostInr}</strong>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg">
                <span className="text-slate-400 block text-[10px]">Collective Farmer Savings</span>
                <strong className="text-emerald-700 text-sm">₹520 saved on fuel</strong>
              </div>
            </div>

            {/* Sequence Stops */}
            <div className="space-y-3">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Scheduled Pickup Timeline &amp; Geolocation Stops
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {activeRoute.stops.map((stop, idx) => (
                  <div key={idx} className="bg-white border border-slate-200 rounded-lg p-3 text-xs space-y-1 relative shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-green-800 text-[11px]">Stop #{idx + 1}</span>
                      <span className="text-[10px] text-slate-500 font-medium">{stop.window}</span>
                    </div>
                    <div className="font-semibold text-slate-900 truncate">{stop.locationName}</div>
                    <div className="text-[11px] text-slate-500 flex justify-between pt-1 border-t border-slate-100">
                      <span>Coordinates: {stop.lat}, {stop.lng}</span>
                      <strong className="text-slate-800">{stop.pickupKg > 0 ? `+${stop.pickupKg} kg` : "Hub Unload"}</strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dispatches Management Grid */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Consignments Awaiting Dispatch</h2>
        {reservedPools.length === 0 && (
          <div className="p-8 text-center text-slate-500 border border-dashed rounded-lg bg-slate-50 text-xs">
            No pool consignments currently scheduled for dispatch.
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {reservedPools.map((pool) => (
            <Card key={pool.id} className="border-slate-200 shadow-sm flex flex-col justify-between">
              <CardHeader className="pb-3 border-b border-slate-100">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-base font-bold">{pool.crop} Pool ({pool.id})</CardTitle>
                    <CardDescription className="text-xs mt-0.5">
                      {pool.variety} • Total Weight: <strong>{pool.currentKg} kg</strong>
                    </CardDescription>
                  </div>
                  {pool.status === "Reserved" && <Badge className="bg-amber-100 text-amber-800 border-none text-[10px]">Buyer Reserved</Badge>}
                  {pool.status === "Dispatched" && <Badge className="bg-blue-100 text-blue-800 border-none text-[10px]">In Transit</Badge>}
                  {pool.status === "Open" && <Badge className="bg-green-100 text-green-800 border-none text-[10px]">Filling Lots</Badge>}
                </div>
              </CardHeader>

              <CardContent className="p-5 space-y-4 text-xs">
                <div className="bg-slate-50 p-3 rounded-lg flex items-center gap-3">
                  <Truck className="w-6 h-6 text-slate-500" />
                  <div>
                    <p className="font-semibold text-slate-900">Transporter: {pool.transporter?.name || "Patil Agro Logistics"}</p>
                    <p className="text-[11px] text-slate-500">{pool.transporter?.vehicleNumber || "MH-12-RN-5821"} • Driver Contact: +91 98220 12345</p>
                  </div>
                </div>

                <div className="space-y-2 border-l-2 border-green-600 pl-3 ml-2 text-xs">
                  <div>
                    <p className="font-semibold text-slate-900">Consolidation Hub</p>
                    <p className="text-slate-500">{pool.collectionHub}</p>
                  </div>
                  <div className="pt-2">
                    <p className="font-semibold text-slate-900">Destination Delivery Point</p>
                    <p className="text-slate-500">{pool.destinationMandi} (Buyer Warehouse)</p>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="p-4 bg-slate-50/50 border-t border-slate-100">
                <Button
                  className="w-full text-xs"
                  variant={pool.status === "Dispatched" ? "outline" : "default"}
                  disabled={pool.status === "Dispatched"}
                  onClick={() => handleDispatch(pool.id)}
                >
                  {pool.status === "Dispatched" ? (
                    <>
                      <CheckCircle className="w-3.5 h-3.5 mr-1.5 text-blue-600" /> In Transit to Buyer
                    </>
                  ) : (
                    "Mark Dispatch Verified & Generate Weigh-Slip"
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
