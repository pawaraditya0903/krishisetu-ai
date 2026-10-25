"use client";

import { useState, useMemo } from "react";
import { useAppStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckSquare,
  Users,
  Truck,
  Store,
  TrendingUp,
  IndianRupee,
  MapPin,
  Package,
  Clock,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  ChevronRight,
  Layers,
  Navigation,
  Star,
  BarChart3,
  RefreshCw,
  Eye,
  Phone,
} from "lucide-react";
import Link from "next/link";
import DynamicFarmMandiMap from "@/components/dashboard/DynamicFarmMandiMap";
import { calculateDynamicMandisForLocation } from "@/lib/agricultural-data";
import { formatTravelTime } from "@/lib/geo-locations";

export default function FPODashboard() {
  const {
    currentUser,
    lots,
    pools,
    users,
    fpos,
    mandisMaster,
    settlements,
    language,
    farmLocation,
  } = useAppStore();

  const isMr = language === "mr";
  const isHi = language === "hi";

  const [activeTab, setActiveTab] = useState<"overview" | "lots" | "pools" | "logistics">("overview");

  if (!currentUser) return null;

  // Live computed stats from real data
  const pendingLots = lots.filter((l) => l.status === "Submitted");
  const verifiedLots = lots.filter((l) => l.status === "Verified" || l.status === "Pooled");
  const openPools = pools.filter((p) => p.status === "Open" || p.status === "Reserved");
  const dispatchedPools = pools.filter((p) => p.status === "Dispatched");
  const activeBuyers = users.filter((u) => u.role === "buyer" && u.status === "Active");
  const totalSettled = settlements.reduce((sum, s) => sum + s.amount, 0);
  const myFpo = fpos.find((f) => f.status === "Active");

  // FPO center coordinates from the first active FPO
  const fpoLat = myFpo?.lat || 18.5204;
  const fpoLng = myFpo?.lng || 73.8567;

  // Find nearest mandis to FPO center
  const nearbyMandiData = calculateDynamicMandisForLocation(fpoLat, fpoLng, "Tomato", undefined, 200, "nearest");
  const nearbyMandis = nearbyMandiData.mandis.slice(0, 4);

  // Pool fill stats
  const totalPoolKg = pools.reduce((sum, p) => sum + (p.targetKg || 0), 0);
  const currentPoolKg = pools.reduce((sum, p) => sum + (p.currentKg || 0), 0);
  const poolFillPct = totalPoolKg > 0 ? Math.round((currentPoolKg / totalPoolKg) * 100) : 0;

  const TABS = [
    { id: "overview", label: isMr ? "आढावा" : "Overview" },
    { id: "lots", label: isMr ? "लॉट्स" : "Lots" },
    { id: "pools", label: isMr ? "पूल्स" : "Pools" },
    { id: "logistics", label: isMr ? "लॉजिस्टिक्स" : "Logistics" },
  ] as const;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">
              {myFpo?.name || currentUser.name}
            </h1>
            <Badge className="bg-emerald-100 text-emerald-800 border-none text-[10px]">
              <ShieldCheck className="w-3 h-3 mr-1" />
              {isMr ? "नोंदणीकृत एफपीओ" : "Registered FPO"}
            </Badge>
          </div>
          <p className="text-slate-500 text-sm mt-0.5">
            {myFpo
              ? `${myFpo.taluka}, ${myFpo.district} • ${myFpo.contactPerson}`
              : (isMr ? "शेतकरी उत्पादक संस्था" : "Farmer Producer Organization")}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {pendingLots.length > 0 && (
            <Link href="/fpo/verify">
              <Button className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-sm">
                <AlertTriangle className="w-3.5 h-3.5 mr-1.5" />
                {isMr ? `${pendingLots.length} लॉट प्रलंबित` : `${pendingLots.length} Lots Pending`}
              </Button>
            </Link>
          )}
          <Link href="/fpo/verify">
            <Button variant="outline" size="sm" className="text-xs border-emerald-300 text-emerald-800 bg-emerald-50">
              <CheckSquare className="w-3.5 h-3.5 mr-1" />
              {isMr ? "पडताळणी केंद्र" : "Verify Lots"}
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-amber-200 bg-amber-50/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-amber-700 uppercase tracking-wide">
                {isMr ? "प्रलंबित" : "Pending"}
              </span>
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-3xl font-extrabold text-amber-900">{pendingLots.length}</div>
            <p className="text-[11px] text-amber-700 mt-0.5">
              {isMr ? "लॉट पडताळणी बाकी" : "Lots awaiting verification"}
            </p>
          </CardContent>
        </Card>

        <Card className="border-emerald-200 bg-emerald-50/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">
                {isMr ? "सत्यापित" : "Verified"}
              </span>
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-3xl font-extrabold text-emerald-900">{verifiedLots.length}</div>
            <p className="text-[11px] text-emerald-700 mt-0.5">
              {isMr ? "तयार / पूलमध्ये" : "Ready or Pooled"}
            </p>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-blue-700 uppercase tracking-wide">
                {isMr ? "सक्रिय पूल" : "Active Pools"}
              </span>
              <Layers className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-3xl font-extrabold text-blue-900">{openPools.length}</div>
            <p className="text-[11px] text-blue-700 mt-0.5">
              {poolFillPct}% {isMr ? "भरलेले" : "filled on avg"}
            </p>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-purple-700 uppercase tracking-wide">
                {isMr ? "सेटलमेंट" : "Settled"}
              </span>
              <IndianRupee className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-3xl font-extrabold text-purple-900">
              ₹{(totalSettled / 1000).toFixed(0)}K
            </div>
            <p className="text-[11px] text-purple-700 mt-0.5">
              {isMr ? "एकूण एस्क्रो मुक्त" : "Total escrow released"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-slate-100 rounded-xl w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === tab.id
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="grid lg:grid-cols-5 gap-6">
          {/* Satellite Map — FPO collection center area */}
          <div className="lg:col-span-3">
            <Card className="border-slate-200 overflow-hidden shadow-sm">
              <CardHeader className="pb-2 border-b border-slate-100 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Navigation className="w-4 h-4 text-emerald-700" />
                    {isMr ? "एफपीओ संकलन केंद्र व जवळचे मंडी नकाशा" : "FPO Hub & Nearby Mandi Map"}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {myFpo
                      ? `${myFpo.taluka}, ${myFpo.district} — Live APMC satellite grid`
                      : "Consolidated logistics route visualization"}
                  </CardDescription>
                </div>
                <Badge variant="outline" className="text-[10px] text-emerald-700 border-emerald-300 bg-emerald-50">
                  {nearbyMandis.length} {isMr ? "मंडया" : "APMCs"}
                </Badge>
              </CardHeader>
              <CardContent className="p-3">
                <DynamicFarmMandiMap
                  farmLocation={{
                    id: myFpo?.id || "fpo-hub",
                    lat: fpoLat,
                    lng: fpoLng,
                    label: myFpo ? `${myFpo.name} Hub` : "FPO Collection Hub",
                    district: myFpo?.district || "Pune",
                    state: "Maharashtra",
                    accuracy: "High (GPS)",
                    updatedAt: new Date().toISOString(),
                  }}
                  mandis={nearbyMandis}
                  language={language as "mr" | "hi" | "en"}
                />
              </CardContent>
            </Card>
          </div>

          {/* Right side: Active Pools + Pending Lots */}
          <div className="lg:col-span-2 space-y-4">
            {/* Pending Lots */}
            <Card className="border-slate-200">
              <CardHeader className="pb-2 border-b border-slate-100 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-bold">
                  {isMr ? "पडताळणी प्रलंबित लॉट" : "Lots Awaiting Verification"}
                </CardTitle>
                <Link href="/fpo/verify">
                  <Button variant="ghost" size="sm" className="text-[10px] text-emerald-700 h-6 px-2">
                    {isMr ? "सर्व पहा" : "View All"} →
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="p-3 space-y-2">
                {pendingLots.slice(0, 4).map((lot) => (
                  <div
                    key={lot.id}
                    className="flex items-center justify-between p-2.5 border border-amber-100 bg-amber-50/40 rounded-lg"
                  >
                    <div>
                      <div className="font-semibold text-xs text-slate-800">{lot.farmerName}</div>
                      <div className="text-[10px] text-slate-500">
                        {lot.crop} • {lot.quantityKg} kg • {lot.grade}
                      </div>
                    </div>
                    <Link href="/fpo/verify">
                      <Button size="sm" variant="outline" className="h-6 px-2 text-[10px] border-amber-400 text-amber-700">
                        {isMr ? "तपासा" : "Review"}
                      </Button>
                    </Link>
                  </div>
                ))}
                {pendingLots.length === 0 && (
                  <div className="text-center py-4 text-xs text-slate-500 bg-slate-50 rounded-lg">
                    <ShieldCheck className="w-5 h-5 mx-auto mb-1 text-emerald-400" />
                    {isMr ? "सर्व लॉट पडताळले!" : "All lots verified!"}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Active Pools */}
            <Card className="border-slate-200">
              <CardHeader className="pb-2 border-b border-slate-100 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-bold">
                  {isMr ? "सक्रिय वाहतूक पूल" : "Active Freight Pools"}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 space-y-2">
                {openPools.slice(0, 3).map((pool) => {
                  const fillPct = pool.targetKg > 0 ? Math.round((pool.currentKg / pool.targetKg) * 100) : 0;
                  return (
                    <div key={pool.id} className="p-2.5 border border-slate-100 rounded-lg space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-xs text-slate-800">
                          {pool.crop} — {pool.variety}
                        </span>
                        <Badge className={`text-[9px] ${fillPct >= 80 ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"} border-none`}>
                          {fillPct}% {isMr ? "भरले" : "Filled"}
                        </Badge>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5">
                        <div
                          className="h-1.5 rounded-full bg-emerald-500"
                          style={{ width: `${Math.min(100, fillPct)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-2.5 h-2.5" />{pool.collectionHub}
                        </span>
                        <span>→ {pool.destinationMandi}</span>
                      </div>
                    </div>
                  );
                })}
                {openPools.length === 0 && (
                  <div className="text-center py-4 text-xs text-slate-500 bg-slate-50 rounded-lg">
                    {isMr ? "सध्या कोणतेही सक्रिय पूल नाही." : "No active pools at the moment."}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Nearby Mandis */}
            <Card className="border-slate-200">
              <CardHeader className="pb-2 border-b border-slate-100">
                <CardTitle className="text-sm font-bold">
                  {isMr ? "जवळच्या APMC मंडया" : "Nearest APMC Mandis"}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 space-y-2">
                {nearbyMandis.map((mandi) => (
                  <div key={mandi.id} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-50 last:border-0">
                    <div>
                      <div className="font-semibold text-slate-800">{mandi.mandi}</div>
                      <div className="text-[10px] text-slate-500 flex items-center gap-1">
                        <Truck className="w-2.5 h-2.5" />
                        {mandi.distanceKm} km • {formatTravelTime(mandi.travelTimeHours || mandi.distanceKm / 40)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-emerald-700">₹{mandi.modalPrice}</div>
                      <div className="text-[9px] text-slate-400">/qtl</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === "lots" && (
        <Card className="border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <CardTitle className="text-base font-bold">
                {isMr ? "सर्व शेतकरी लॉट्स" : "All Farmer Lots"}
              </CardTitle>
              <CardDescription className="text-xs">
                {isMr ? "पडताळणी करा, स्थिती अद्यावत करा आणि पूलमध्ये जोडा" : "Review, update status, and add to freight pools"}
              </CardDescription>
            </div>
            <Link href="/fpo/verify">
              <Button size="sm" className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs">
                <CheckSquare className="w-3.5 h-3.5 mr-1.5" />
                {isMr ? "पडताळणी केंद्र" : "Verification Center"}
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-2">
              {lots.map((lot) => (
                <div
                  key={lot.id}
                  className="flex items-center justify-between p-3.5 border border-slate-100 rounded-lg hover:bg-slate-50/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                        lot.status === "Submitted"
                          ? "bg-amber-100 text-amber-700"
                          : lot.status === "Verified"
                          ? "bg-emerald-100 text-emerald-700"
                          : lot.status === "Pooled"
                          ? "bg-blue-100 text-blue-700"
                          : lot.status === "Paid"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {lot.status === "Submitted"
                        ? "⏳"
                        : lot.status === "Verified"
                        ? "✅"
                        : lot.status === "Pooled"
                        ? "🚚"
                        : "₹"}
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-slate-900">
                        {lot.farmerName} — {lot.crop}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {lot.variety} • {lot.quantityKg} kg • {lot.grade} • {lot.id}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      className={`text-[10px] border-none ${
                        lot.status === "Submitted"
                          ? "bg-amber-100 text-amber-800"
                          : lot.status === "Verified"
                          ? "bg-emerald-100 text-emerald-800"
                          : lot.status === "Pooled"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-purple-100 text-purple-800"
                      }`}
                    >
                      {lot.status}
                    </Badge>
                    {lot.status === "Submitted" && (
                      <Link href="/fpo/verify">
                        <Button size="sm" variant="outline" className="h-7 px-2 text-[10px]">
                          {isMr ? "तपासा" : "Review"}
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              ))}
              {lots.length === 0 && (
                <div className="text-center py-8 text-slate-500 text-sm">
                  <Package className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                  {isMr ? "कोणतेही लॉट नाही" : "No lots yet"}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === "pools" && (
        <div className="space-y-4">
          {pools.map((pool) => {
            const fillPct = pool.targetKg > 0 ? Math.round((pool.currentKg / pool.targetKg) * 100) : 0;
            const totalValue = Math.round((pool.currentKg / 100) * pool.pricePerQtl);
            return (
              <Card key={pool.id} className="border-slate-200">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                        <Truck className="w-5 h-5 text-emerald-700" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-sm text-slate-900">
                            {pool.crop} — {pool.variety}
                          </h3>
                          <Badge
                            className={`text-[9px] border-none ${
                              pool.status === "Open"
                                ? "bg-emerald-100 text-emerald-800"
                                : pool.status === "Dispatched"
                                ? "bg-blue-100 text-blue-800"
                                : pool.status === "Delivered"
                                ? "bg-purple-100 text-purple-800"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {pool.status}
                          </Badge>
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {pool.collectionHub} → {pool.destinationMandi}
                        </div>
                        <div className="text-xs text-slate-500 mt-1 flex items-center gap-3">
                          <span className="font-semibold text-slate-700">
                            {pool.currentKg} / {pool.targetKg} kg
                          </span>
                          <span className="text-emerald-700 font-semibold">
                            ₹{pool.pricePerQtl}/qtl
                          </span>
                          <span>Total: ₹{totalValue.toLocaleString()}</span>
                        </div>
                        <div className="w-48 mt-2">
                          <div className="flex justify-between text-[9px] text-slate-400 mb-0.5">
                            <span>Fill Progress</span><span>{fillPct}%</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-1.5">
                            <div
                              className="h-1.5 rounded-full bg-emerald-500"
                              style={{ width: `${Math.min(100, fillPct)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Badge variant="outline" className="text-[10px]">
                        {pool.allowedGrades.join(", ")}
                      </Badge>
                      <Badge variant="outline" className="text-[10px] text-emerald-700 border-emerald-300">
                        {pool.sharedFreightSavingsPct}% Freight Saved
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          {pools.length === 0 && (
            <div className="text-center py-10 text-slate-500 text-sm border border-dashed border-slate-200 rounded-xl">
              <Layers className="w-10 h-10 mx-auto mb-2 text-slate-300" />
              {isMr ? "कोणतेही पूल नाही" : "No freight pools created yet"}
            </div>
          )}
        </div>
      )}

      {activeTab === "logistics" && (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Dispatch Pipeline */}
          <Card className="border-slate-200">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-sm font-bold">
                {isMr ? "डिस्पॅच पाइपलाइन" : "Dispatch Pipeline"}
              </CardTitle>
              <CardDescription className="text-xs">
                {isMr ? "चालू वाहतूक व डिलिव्हरी स्थिती" : "Current transport and delivery status"}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {pools.filter((p) => p.status !== "Closed").map((pool) => (
                <div key={pool.id} className="flex items-center gap-3 p-3 border border-slate-100 rounded-lg">
                  <div
                    className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                      pool.status === "Dispatched"
                        ? "bg-blue-500 animate-pulse"
                        : pool.status === "Delivered" || pool.status === "Accepted"
                        ? "bg-emerald-500"
                        : pool.status === "Open" || pool.status === "Reserved"
                        ? "bg-amber-400"
                        : "bg-slate-300"
                    }`}
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-xs text-slate-800">
                      {pool.crop} — {pool.collectionHub}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      → {pool.destinationMandi} • {pool.currentKg} kg • ₹{pool.pricePerQtl}/qtl
                    </div>
                  </div>
                  <Badge
                    className={`text-[9px] border-none ${
                      pool.status === "Dispatched"
                        ? "bg-blue-100 text-blue-800"
                        : pool.status === "Delivered" || pool.status === "Accepted"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {pool.status}
                  </Badge>
                </div>
              ))}
              {pools.filter((p) => p.status !== "Closed").length === 0 && (
                <div className="text-center py-6 text-xs text-slate-500">
                  {isMr ? "कोणतेही सक्रिय शिपमेंट नाही" : "No active shipments"}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Buyers & Settlement */}
          <Card className="border-slate-200">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-sm font-bold">
                {isMr ? "नोंदणीकृत खरेदीदार" : "Registered Buyers"}
              </CardTitle>
              <CardDescription className="text-xs">
                {isMr ? "सत्यापित संस्थात्मक खरेदीदार" : "Verified institutional procurement partners"}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {activeBuyers.slice(0, 5).map((buyer) => (
                <div key={buyer.id} className="flex items-center justify-between p-3 border border-slate-100 rounded-lg">
                  <div>
                    <div className="font-semibold text-xs text-slate-800">{buyer.name}</div>
                    <div className="text-[10px] text-slate-500">
                      {buyer.organization || buyer.district} • Score: {buyer.paymentReliabilityScore || 96}%
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <Badge variant="outline" className="text-[9px] text-emerald-700 border-emerald-300">
                      Verified
                    </Badge>
                    {buyer.phone && (
                      <a href={`tel:${buyer.phone}`}>
                        <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                          <Phone className="w-3 h-3 text-slate-500" />
                        </Button>
                      </a>
                    )}
                  </div>
                </div>
              ))}
              {activeBuyers.length === 0 && (
                <div className="text-center py-6 text-xs text-slate-500">
                  {isMr ? "कोणतेही सक्रिय खरेदीदार नाही" : "No active buyers registered"}
                </div>
              )}
              <div className="pt-2 text-xs text-slate-500 font-medium flex items-center justify-between">
                <span>
                  {isMr ? "एकूण सेटलमेंट:" : "Total Settlement:"}
                </span>
                <span className="font-bold text-emerald-700 text-sm">
                  ₹{totalSettled.toLocaleString()}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Journey Stepper */}
      <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
        <h3 className="font-semibold text-emerald-950 text-xs uppercase tracking-wider mb-3">
          {isMr ? "एफपीओ प्रवास: शेतकरी → बाजार → पेमेंट" : "FPO Value Chain: Farmer → Market → Payment"}
        </h3>
        <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-emerald-800">
          <Badge className="bg-emerald-700 text-white border-none">
            {isMr ? "लॉट संकलन" : "Lot Collection"}
          </Badge>
          <ArrowRight className="w-3.5 h-3.5 text-emerald-500" />
          <Badge variant="outline" className="bg-white text-emerald-800 border-emerald-300">
            {isMr ? "AI गुणवत्ता पडताळणी" : "AI Quality Verification"}
          </Badge>
          <ArrowRight className="w-3.5 h-3.5 text-emerald-500" />
          <Badge variant="outline" className="bg-white text-emerald-800 border-emerald-300">
            {isMr ? "पूल एकत्रीकरण" : "Pool Aggregation"}
          </Badge>
          <ArrowRight className="w-3.5 h-3.5 text-emerald-500" />
          <Badge variant="outline" className="bg-white text-emerald-800 border-emerald-300">
            {isMr ? "APMC / खरेदीदार" : "APMC / Buyer"}
          </Badge>
          <ArrowRight className="w-3.5 h-3.5 text-emerald-500" />
          <Badge variant="outline" className="bg-white text-emerald-800 border-emerald-300">
            {isMr ? "एस्क्रो सेटलमेंट" : "Escrow Settlement"}
          </Badge>
        </div>
      </div>
    </div>
  );
}
