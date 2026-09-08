"use client";

import { useAppStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RefreshCw, AlertCircle, CheckCircle2, MapPin } from "lucide-react";
import { toast } from "sonner";

export default function AdminMarketDataPage() {
  const { mandiPrices } = useAppStore();

  const handleSimulateSync = () => {
    toast.success("Mandi Feeds Ingestion Synchronized!", {
      description: "Fetched 3 APMC price bulletins for Baramati cluster.",
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Mandi Price Ingestion &amp; Freshness Monitor</h1>
          <p className="text-slate-500 text-sm">
            Monitor incoming agricultural market arrivals, daily price bulletins, and stale-data flags.
          </p>
        </div>
        <Button onClick={handleSimulateSync} className="bg-green-700 hover:bg-green-800 text-xs">
          <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Trigger Ingestion Sync
        </Button>
      </div>

      {/* Freshness Status Banner */}
      <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-semibold text-emerald-950 text-sm">All Pilot Mandi Feeds are Up to Date</h4>
            <p className="text-xs text-emerald-800">
              Baramati, Pune, and Solapur APMC bulletins have been ingested within the last 4 hours. Freshness SLA: 100%.
            </p>
          </div>
        </div>
        <Badge className="bg-emerald-600 text-white border-none">HEALTHY</Badge>
      </div>

      {/* Mandi Price Feeds Table */}
      <Card>
        <CardHeader className="pb-3 border-b border-slate-100">
          <CardTitle className="text-base font-bold">Active Mandi Price Feeds</CardTitle>
          <CardDescription className="text-xs">
            Normalized per-quintal rates with arrival volume records.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mandi Market</TableHead>
                <TableHead>Crop &amp; Variety</TableHead>
                <TableHead>Min / Modal / Max</TableHead>
                <TableHead>Daily Arrivals</TableHead>
                <TableHead>Freshness Status</TableHead>
                <TableHead className="text-right">Source</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mandiPrices.map((mandi) => (
                <TableRow key={mandi.id}>
                  <TableCell>
                    <div className="font-semibold text-slate-900 text-sm flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {mandi.mandi}
                    </div>
                    <div className="text-xs text-slate-500">{mandi.distanceKm} km from Baramati Hub</div>
                  </TableCell>
                  <TableCell className="text-xs">
                    <span className="font-semibold text-slate-800">{mandi.crop}</span>
                    <span className="text-slate-500 block text-[11px]">{mandi.variety}</span>
                  </TableCell>
                  <TableCell>
                    <div className="font-bold text-green-700 text-sm">
                      ₹{mandi.modalPrice} <span className="text-xs font-normal text-slate-500">/qtl</span>
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Min: ₹{mandi.minPrice} | Max: ₹{mandi.maxPrice}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs font-semibold text-slate-700">
                    {mandi.arrivalsQtl.toLocaleString()} Quintals
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-green-100 text-green-800 border-none text-[10px]">
                      {mandi.freshness}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-xs text-slate-500">{mandi.source}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-xs text-amber-900 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold mb-0.5">Stale Data Warning Safeguard Policy</p>
          <p className="leading-relaxed">
            If any mandi rate exceeds 24 hours without an official bulletin update, the system automatically marks the
            record with a <strong>&quot;Stale data: verify before dispatch&quot;</strong> badge across all farmer
            dashboards and prevents automated pool dispatch lock-in.
          </p>
        </div>
      </div>
    </div>
  );
}
