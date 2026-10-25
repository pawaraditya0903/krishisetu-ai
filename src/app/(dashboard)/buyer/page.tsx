"use client";

import { useState, useMemo } from "react";
import { useAppStore } from "@/lib/store";
import { Pool } from "@/lib/types";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ShieldCheck,
  MapPin,
  Truck,
  IndianRupee,
  Layers,
  SlidersHorizontal,
  Star,
  TrendingUp,
  BarChart3,
  Clock,
  Package,
  Filter,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// Gradient per crop type for visual variety
const CROP_GRADIENTS: Record<string, string> = {
  Tomato: "from-red-700 via-orange-600 to-amber-700",
  Onion: "from-purple-700 via-violet-600 to-indigo-700",
  Potato: "from-amber-700 via-yellow-600 to-orange-700",
  Cotton: "from-slate-700 via-zinc-600 to-stone-700",
  Soyabean: "from-green-700 via-emerald-600 to-teal-700",
  Wheat: "from-yellow-700 via-amber-600 to-orange-600",
  Pomegranate: "from-pink-700 via-rose-600 to-red-700",
  Maize: "from-yellow-600 via-lime-600 to-green-600",
  Grapes: "from-purple-800 via-violet-700 to-purple-600",
  default: "from-slate-700 via-slate-600 to-slate-700",
};

const GRADE_LABELS: Record<string, string> = {
  "Grade A": "Premium",
  "Grade B": "Standard",
  "Grade C": "Economy",
};

export default function BuyerMarketplacePage() {
  const router = useRouter();
  const { pools, reservePool, currentUser, users, language } = useAppStore();

  const isMr = language === "mr";
  const isHi = language === "hi";

  // Filter state
  const [cropFilter, setCropFilter] = useState("All");
  const [gradeFilter, setGradeFilter] = useState("All");
  const [selectedPool, setSelectedPool] = useState<Pool | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Available pools: Open or Reserved (for marketplace visibility)
  const allAvailable = pools.filter((p) => p.status === "Open" || p.status === "Reserved");

  // Unique crops and grades from available pools
  const uniqueCrops = ["All", ...Array.from(new Set(allAvailable.map((p) => p.crop)))];
  const uniqueGrades = ["All", ...Array.from(new Set(allAvailable.flatMap((p) => p.allowedGrades)))];

  const filteredPools = useMemo(() => {
    return allAvailable.filter((p) => {
      if (cropFilter !== "All" && p.crop !== cropFilter) return false;
      if (gradeFilter !== "All" && !p.allowedGrades.includes(gradeFilter as any)) return false;
      return true;
    });
  }, [allAvailable, cropFilter, gradeFilter]);

  // Stats
  const totalVolume = allAvailable.reduce((s, p) => s + p.currentKg, 0);
  const totalValue = allAvailable.reduce((s, p) => s + Math.round((p.currentKg / 100) * p.pricePerQtl), 0);
  const activeBuyers = users.filter((u) => u.role === "buyer" && u.status === "Active").length;

  const handleReserve = () => {
    if (selectedPool && currentUser) {
      reservePool(selectedPool.id, currentUser.id, currentUser.name);
      setIsAuthOpen(false);
      toast.success(
        isMr ? "पेमेंट अधिकृत व पूल राखीव!" : "Payment Authorized & Pool Reserved!",
        {
          description: isMr
            ? `कन्साइनमेंट ${selectedPool.id} राखीव. एस्क्रो खात्यात निधी ठेवला.`
            : `Consignment ${selectedPool.id} reserved. Escrow funds placed on hold.`,
        }
      );
      router.push("/buyer/delivery");
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {isMr ? "बी2बी घाऊक कृषी बाजार" : "B2B Wholesale Agri Marketplace"}
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {isMr
              ? "एफपीओ-सत्यापित, एस्क्रो-संरक्षित लॉट खरेदी करा. थेट शेतकऱ्यांशी जोडा."
              : "Procure FPO-verified, escrow-protected aggregated consignments. Connected directly to farms."}
          </p>
        </div>
        <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-300 text-xs h-fit flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5" />
          {isMr ? "RBI-अनुपालित एस्क्रो" : "RBI-Compliant Escrow"}
        </Badge>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200 rounded-xl p-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center">
            <Package className="w-4.5 h-4.5 text-emerald-700" />
          </div>
          <div>
            <div className="text-lg font-extrabold text-slate-900">{allAvailable.length}</div>
            <div className="text-[10px] text-slate-500">{isMr ? "उपलब्ध पूल" : "Available Pools"}</div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center">
            <Truck className="w-4.5 h-4.5 text-amber-700" />
          </div>
          <div>
            <div className="text-lg font-extrabold text-slate-900">
              {(totalVolume / 1000).toFixed(1)} MT
            </div>
            <div className="text-[10px] text-slate-500">{isMr ? "एकूण माल" : "Total Stock"}</div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center">
            <IndianRupee className="w-4.5 h-4.5 text-blue-700" />
          </div>
          <div>
            <div className="text-lg font-extrabold text-slate-900">
              ₹{(totalValue / 1000).toFixed(0)}K
            </div>
            <div className="text-[10px] text-slate-500">{isMr ? "एकूण मूल्य" : "Total Market Value"}</div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-purple-100 flex items-center justify-center">
            <Star className="w-4.5 h-4.5 text-purple-700" />
          </div>
          <div>
            <div className="text-lg font-extrabold text-slate-900">{activeBuyers}</div>
            <div className="text-[10px] text-slate-500">{isMr ? "नोंदणीकृत खरेदीदार" : "Registered Buyers"}</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <Filter className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-xs text-slate-500 font-medium">{isMr ? "फिल्टर:" : "Filter:"}</span>
        
        <div className="flex flex-wrap gap-1.5">
          {uniqueCrops.map((crop) => (
            <button
              key={crop}
              onClick={() => setCropFilter(crop)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                cropFilter === crop
                  ? "bg-emerald-700 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {crop}
            </button>
          ))}
        </div>

        {gradeFilter !== "All" || cropFilter !== "All" ? (
          <button
            onClick={() => { setCropFilter("All"); setGradeFilter("All"); }}
            className="flex items-center gap-1 text-xs text-rose-600 font-medium hover:text-rose-700"
          >
            <X className="w-3 h-3" /> {isMr ? "साफ करा" : "Clear"}
          </button>
        ) : null}
      </div>

      {/* Pool Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredPools.length === 0 && (
          <div className="col-span-full p-10 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50">
            <Package className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <p className="text-sm font-semibold text-slate-600">
              {isMr ? "या फिल्टर साठी कोणतेही पूल नाही." : "No pools match this filter."}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {isMr ? "नवीन शेतकरी कन्साइनमेंट पडताळणी प्रक्रियेत आहेत." : "New farmer consignments are being verified."}
            </p>
          </div>
        )}

        {filteredPools.map((pool) => {
          const totalVal = Math.round((pool.currentKg / 100) * pool.pricePerQtl);
          const fillPct = pool.targetKg > 0 ? Math.round((pool.currentKg / pool.targetKg) * 100) : 0;
          const gradientClass = CROP_GRADIENTS[pool.crop] || CROP_GRADIENTS.default;
          const isReserved = pool.status === "Reserved";

          return (
            <Card
              key={pool.id}
              className={`border-slate-200 overflow-hidden shadow-sm hover:shadow-md hover:border-emerald-300 transition-all flex flex-col justify-between ${
                isReserved ? "opacity-70" : ""
              }`}
            >
              {/* Crop Header */}
              <div className={`h-28 bg-gradient-to-br ${gradientClass} relative flex flex-col items-start justify-end p-3`}>
                <div className="absolute inset-0 bg-black/20" />
                <div className="absolute top-2.5 left-3">
                  <Badge className="bg-white/20 text-white border-white/30 text-[9px] backdrop-blur-sm">
                    <ShieldCheck className="w-2.5 h-2.5 mr-0.5" /> FPO Certified
                  </Badge>
                </div>
                {isReserved && (
                  <div className="absolute top-2.5 right-3">
                    <Badge className="bg-amber-500/90 text-white border-none text-[9px]">
                      Reserved
                    </Badge>
                  </div>
                )}
                <div className="relative z-10 text-white">
                  <h3 className="font-bold text-base leading-tight">{pool.crop}</h3>
                  <div className="text-xs text-white/80 font-medium">{pool.variety}</div>
                  <div className="text-[10px] text-white/70 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-2.5 h-2.5" /> {pool.collectionHub} → {pool.destinationMandi}
                  </div>
                </div>
              </div>

              <CardContent className="p-4 space-y-3">
                {/* Volume & Price */}
                <div className="flex justify-between items-end pb-2.5 border-b border-slate-100">
                  <div>
                    <div className="text-[10px] text-slate-500 mb-0.5">
                      {isMr ? "उपलब्ध माल" : "Available Volume"}
                    </div>
                    <div className="font-bold text-slate-900 text-lg leading-tight">{pool.currentKg} kg</div>
                    <div className="text-[10px] text-slate-400">
                      {isMr ? "लक्ष्य:" : "Target:"} {pool.targetKg} kg
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-slate-500 mb-0.5">
                      {isMr ? "मागणी दर" : "Asking Rate"}
                    </div>
                    <div className="font-extrabold text-emerald-700 text-xl leading-tight">
                      ₹{pool.pricePerQtl}
                    </div>
                    <div className="text-[10px] text-slate-400">/qtl</div>
                  </div>
                </div>

                {/* Fill Progress */}
                <div>
                  <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                    <span>{isMr ? "पूल भरण्याची प्रगती" : "Pool Fill Progress"}</span>
                    <span className="font-semibold text-slate-600">{fillPct}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full ${fillPct >= 90 ? "bg-emerald-500" : fillPct >= 50 ? "bg-amber-400" : "bg-slate-400"}`}
                      style={{ width: `${Math.min(100, fillPct)}%` }}
                    />
                  </div>
                </div>

                {/* Grade & Freight */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    {pool.allowedGrades.map((g) => (
                      <Badge key={g} variant="outline" className="text-[9px] px-1.5 py-0">
                        {g}
                      </Badge>
                    ))}
                  </div>
                  <span className="text-emerald-700 font-semibold text-[11px]">
                    {pool.sharedFreightSavingsPct}% {isMr ? "वाहतूक बचत" : "Freight Saved"}
                  </span>
                </div>

                {/* Total Value */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
                  <span className="text-slate-500">
                    {isMr ? "एकूण अंदाजित मूल्य:" : "Est. Total Value:"}
                  </span>
                  <span className="font-bold text-slate-800">₹{totalVal.toLocaleString()}</span>
                </div>
              </CardContent>

              <CardFooter className="p-4 pt-0">
                <Button
                  className={`w-full text-xs font-bold shadow-sm ${
                    isReserved
                      ? "bg-slate-200 text-slate-500 cursor-not-allowed hover:bg-slate-200"
                      : "bg-emerald-700 hover:bg-emerald-800 text-white"
                  }`}
                  disabled={isReserved}
                  onClick={() => {
                    if (!isReserved) {
                      setSelectedPool(pool);
                      setIsAuthOpen(true);
                    }
                  }}
                >
                  <ShieldCheck className="w-3.5 h-3.5 mr-1.5" />
                  {isReserved
                    ? (isMr ? "आधीच राखीव" : "Already Reserved")
                    : (isMr ? `पूल राखीव करा (₹${totalVal.toLocaleString()})` : `Reserve Pool (₹${totalVal.toLocaleString()})`)}
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
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              {isMr ? "नोडल एस्क्रो पेमेंट अधिकृतता" : "Nodal Escrow Payment Authorization"}
            </DialogTitle>
            <DialogDescription className="text-xs">
              {isMr
                ? "आरबीआय अनुपालित नोडल खाते. शेतकऱ्यांच्या माल स्वीकृतीनंतरच निधी सोडला जातो."
                : "RBI-compliant nodal partner escrow. Funds released only after verified farmer gate acceptance."}
            </DialogDescription>
          </DialogHeader>

          <div className="bg-slate-50 p-4 rounded-xl space-y-2.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">{isMr ? "कन्साइनमेंट ID:" : "Consignment Pool ID:"}</span>
              <span className="font-mono font-semibold">{selectedPool?.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">{isMr ? "पीक:" : "Crop:"}</span>
              <span className="font-semibold">{selectedPool?.crop} ({selectedPool?.variety})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">{isMr ? "एकूण माल:" : "Total Pooled Weight:"}</span>
              <span className="font-semibold">{selectedPool?.currentKg} kg</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">{isMr ? "दर प्रति क्विंटल:" : "Rate per Quintal:"}</span>
              <span className="font-semibold">₹{selectedPool?.pricePerQtl}</span>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-2.5">
              <span className="font-bold text-slate-800 text-sm">{isMr ? "एकूण एस्क्रो रक्कम:" : "Total Escrow Amount:"}</span>
              <span className="font-extrabold text-emerald-700 text-base">
                ₹{Math.round(((selectedPool?.currentKg || 0) / 100) * (selectedPool?.pricePerQtl || 2050)).toLocaleString()}
              </span>
            </div>
          </div>

          <div className="text-[11px] text-slate-600 bg-emerald-50 p-3 rounded-xl border border-emerald-200 leading-relaxed">
            <strong>
              {isMr ? "पेमेंट संरक्षण हमी:" : "Payment Protection Guarantee:"}
            </strong>{" "}
            {isMr
              ? "KrishiSetu खरेदीदाराचे पैसे थेट ठेवत नाही. गेट स्वीकृतीनंतरच शेतकऱ्यांना निधी सोडला जातो."
              : "KrishiSetu does not hold buyer funds directly. Funds are released to farmers only upon verified gate acceptance."}
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setIsAuthOpen(false)}>
              {isMr ? "रद्द करा" : "Cancel"}
            </Button>
            <Button onClick={handleReserve} size="sm" className="bg-emerald-700 hover:bg-emerald-800">
              {isMr ? "एस्क्रो पेमेंट मंजूर करा" : "Authorize Escrow Payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
