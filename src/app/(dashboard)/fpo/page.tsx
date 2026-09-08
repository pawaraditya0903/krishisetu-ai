"use client";

import { useAppStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckSquare, Users, Truck, Store } from "lucide-react";
import Link from "next/link";

export default function FPODashboard() {
  const { currentUser, lots, pools } = useAppStore();
  
  if (!currentUser) return null;

  const pendingVerification = lots.filter(l => l.status === "Submitted").length;
  const activePools = pools.filter(p => p.status === "Open").length;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{currentUser.name} Dashboard</h1>
          <p className="text-slate-500">Manage farmer lots, pools, and logistics.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/fpo/verify">
            <Button className="bg-green-700 hover:bg-green-800">
              <CheckSquare className="w-4 h-4 mr-2" /> Verify New Lots {pendingVerification > 0 && `(${pendingVerification})`}
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 flex flex-col items-center justify-center text-center">
            <CheckSquare className="w-8 h-8 text-blue-500 mb-2" />
            <div className="text-2xl font-bold">{pendingVerification}</div>
            <p className="text-sm text-slate-500">Lots Awaiting Verification</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex flex-col items-center justify-center text-center">
            <Users className="w-8 h-8 text-green-500 mb-2" />
            <div className="text-2xl font-bold">{activePools}</div>
            <p className="text-sm text-slate-500">Active Pools</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex flex-col items-center justify-center text-center">
            <Truck className="w-8 h-8 text-amber-500 mb-2" />
            <div className="text-2xl font-bold">2</div>
            <p className="text-sm text-slate-500">Dispatches Scheduled</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex flex-col items-center justify-center text-center">
            <Store className="w-8 h-8 text-purple-500 mb-2" />
            <div className="text-2xl font-bold">3</div>
            <p className="text-sm text-slate-500">Active Buyers</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Consolidated Logistics Route Map</CardTitle>
            <CardDescription>Visualizing collection to buyer routes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-slate-100 rounded-xl p-8 flex flex-col items-center justify-center min-h-[300px] border border-slate-200">
              <div className="flex items-center w-full justify-between max-w-sm relative">
                <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-300 -z-10 -translate-y-1/2"></div>
                
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 bg-white rounded-full border-4 border-green-500 flex items-center justify-center z-10">
                    <Users className="w-5 h-5 text-green-600" />
                  </div>
                  <span className="text-xs font-semibold text-slate-600">Farms</span>
                </div>
                
                <div className="flex flex-col items-center gap-2">
                  <div className="w-16 h-16 bg-white rounded-full border-4 border-blue-500 flex items-center justify-center z-10 shadow-lg">
                    <CheckSquare className="w-6 h-6 text-blue-600" />
                  </div>
                  <span className="text-sm font-bold text-slate-800">FPO Hub</span>
                </div>
                
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 bg-white rounded-full border-4 border-amber-500 flex items-center justify-center z-10">
                    <Store className="w-5 h-5 text-amber-600" />
                  </div>
                  <span className="text-xs font-semibold text-slate-600">Buyer</span>
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-8 text-center max-w-xs">
                In a production environment, this would integrate with map APIs for real-time tracking of empanelled transporters.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Recent Lots for Verification</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {lots.filter(l => l.status === "Submitted").map(lot => (
                  <div key={lot.id} className="flex justify-between items-center p-3 border border-slate-100 rounded-lg bg-white">
                    <div>
                      <div className="font-semibold text-sm">{lot.farmerName}</div>
                      <div className="text-xs text-slate-500">{lot.crop} • {lot.quantityKg} kg</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="text-blue-600 bg-blue-50">{lot.grade}</Badge>
                      <Link href="/fpo/verify">
                        <Button size="sm" variant="outline">Review</Button>
                      </Link>
                    </div>
                  </div>
                ))}
                {lots.filter(l => l.status === "Submitted").length === 0 && (
                  <div className="text-center text-sm text-slate-500 py-4">No lots pending verification.</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
