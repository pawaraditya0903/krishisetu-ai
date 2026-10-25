"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Users, Truck, Clock, TrendingDown, MapPin } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function FPOPoolsPage() {
  const { pools, createPool } = useAppStore();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const [formData, setFormData] = useState({
    crop: "Tomato",
    variety: "Abhinav (Hybrid)",
    targetKg: "1200",
    pricePerQtl: "2150",
    destinationMandi: "Pune Market Yard",
    collectionHub: "Baramati APMC Hub",
    cutoffHours: "8",
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createPool({
      crop: formData.crop,
      variety: formData.variety,
      targetKg: parseInt(formData.targetKg) || 1000,
      currentKg: 0,
      allowedGrades: ["Grade A", "Grade B"],
      status: "Open",
      closesAt: new Date(Date.now() + (parseInt(formData.cutoffHours) || 8) * 3600 * 1000).toISOString(),
      pricePerQtl: parseInt(formData.pricePerQtl) || 2100,
      collectionHub: formData.collectionHub,
      destinationMandi: formData.destinationMandi,
      sharedFreightSavingsPct: 29.0,
      transporter: {
        name: "Patil Agro Logistics",
        vehicleNumber: "MH-12-RN-5821",
        contact: "+91 98220 12345",
      },
      contributions: [],
    });

    setIsCreateOpen(false);
    toast.success("New FPO Pool Created!", {
      description: `Targeting ${formData.targetKg} kg ${formData.crop} to ${formData.destinationMandi}.`
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">FPO Pool Management</h1>
          <p className="text-slate-500 text-sm">
            Consolidate verified farmer lots into bulk commercial dispatches to reduce freight and access wholesale buyer pricing.
          </p>
        </div>

        <Button onClick={() => setIsCreateOpen(true)} className="bg-green-700 hover:bg-green-800">
          <Plus className="w-4 h-4 mr-1.5" /> Create New Batch Pool
        </Button>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <form onSubmit={handleCreate}>
              <DialogHeader>
                <DialogTitle>Launch New FPO Batch Pool</DialogTitle>
                <DialogDescription>
                  Set capacity target, destination mandi, asking price, and collection cutoff.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Crop</Label>
                    <Select value={formData.crop} onValueChange={(v) => setFormData({ ...formData, crop: v || "Tomato" })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Tomato">Tomato</SelectItem>
                        <SelectItem value="Onion">Onion</SelectItem>
                        <SelectItem value="Pomegranate">Pomegranate</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Target Variety</Label>
                    <Input
                      value={formData.variety}
                      onChange={(e) => setFormData({ ...formData, variety: e.target.value })}
                      placeholder="e.g. Abhinav"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Target Capacity (kg)</Label>
                    <Input
                      type="number"
                      value={formData.targetKg}
                      onChange={(e) => setFormData({ ...formData, targetKg: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Asking Price (₹/quintal)</Label>
                    <Input
                      type="number"
                      value={formData.pricePerQtl}
                      onChange={(e) => setFormData({ ...formData, pricePerQtl: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Destination Market</Label>
                    <Select
                      value={formData.destinationMandi}
                      onValueChange={(v) => setFormData({ ...formData, destinationMandi: v || "Pune Market Yard" })}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pune Market Yard">Pune Market Yard (92 km)</SelectItem>
                        <SelectItem value="Solapur APMC">Solapur APMC (190 km)</SelectItem>
                        <SelectItem value="Vashi APMC Mumbai">Vashi APMC Navi Mumbai (245 km)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Closing Cutoff (Hours)</Label>
                    <Input
                      type="number"
                      value={formData.cutoffHours}
                      onChange={(e) => setFormData({ ...formData, cutoffHours: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-green-700 hover:bg-green-800">
                  Launch Pool
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        {pools.map((pool) => {
          const fillPct = Math.min(100, Math.round((pool.currentKg / pool.targetKg) * 100));
          return (
            <Card key={pool.id} className="border-slate-200 shadow-sm overflow-hidden">
              <div className="h-2 bg-slate-100 w-full">
                <div
                  className={`h-full transition-all ${
                    fillPct >= 100 ? "bg-emerald-600" : fillPct > 60 ? "bg-green-600" : "bg-amber-500"
                  }`}
                  style={{ width: `${fillPct}%` }}
                />
              </div>

              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row justify-between gap-6">
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {pool.id}
                      </span>
                      <Badge variant="outline" className="text-slate-700 border-slate-300">
                        {pool.crop} - {pool.variety}
                      </Badge>
                      <Badge className="bg-green-100 text-green-800 border-none">
                        {pool.status.toUpperCase()}
                      </Badge>
                      {pool.buyerName && (
                        <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200">
                          Reserved by: {pool.buyerName}
                        </Badge>
                      )}
                    </div>

                    <div>
                      <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-green-700" />
                        {pool.collectionHub} &rarr; {pool.destinationMandi}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Transporter: <strong>{pool.transporter?.name || "Assigned FPO Transport"}</strong> ({pool.transporter?.vehicleNumber})
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
                      <span className="flex items-center gap-1.5 font-medium text-green-700 bg-green-50 px-2 py-1 rounded">
                        <TrendingDown className="w-4 h-4" /> {pool.sharedFreightSavingsPct}% Shared Freight Savings
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" /> {(pool.contributions || []).length + 1} Farmer Lots Included
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> Cutoff: {new Date(pool.closesAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  <div className="lg:text-right flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-slate-100 pt-4 lg:pt-0 lg:pl-6 min-w-[240px]">
                    <div>
                      <div className="text-xs text-slate-500">Capacity Utilization</div>
                      <div className="text-3xl font-extrabold text-slate-900">
                        {pool.currentKg} <span className="text-sm font-normal text-slate-500">/ {pool.targetKg} kg</span>
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        Target Price: <strong className="text-green-700 font-bold text-sm">₹{pool.pricePerQtl}/qtl</strong>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4">
                      <Link href="/fpo/logistics" className="w-full">
                        <Button variant="outline" size="sm" className="w-full text-xs">
                          <Truck className="w-3.5 h-3.5 mr-1.5" /> Optimize Route
                        </Button>
                      </Link>
                      {pool.status === "Open" && (
                        <Button
                          size="sm"
                          className="bg-green-700 hover:bg-green-800 text-xs shrink-0"
                          onClick={() => toast.success(`Pool ${pool.id} marked ready for dispatch reservation.`)}
                        >
                          Lock Pool
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Farmer Contributions Breakdown */}
                {pool.contributions && pool.contributions.length > 0 && (
                  <div className="mt-5 pt-4 border-t border-slate-100">
                    <div className="text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wider">
                      Farmer Contributions in this Pool
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                      {pool.contributions.map((c, idx) => (
                        <div key={idx} className="bg-slate-50 p-2.5 rounded border border-slate-100 flex justify-between items-center">
                          <div>
                            <span className="font-semibold text-slate-800">{c.farmerName}</span>
                            <div className="text-[10px] text-slate-500">{c.lotId} • {c.grade}</div>
                          </div>
                          <span className="font-bold text-green-700">{c.quantityKg} kg</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
