"use client";

import React from "react";
import Link from "next/link";
import { useAppStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  Store,
  Building2,
  Sprout,
  Truck,
  ShieldAlert,
  ShieldCheck,
  FileText,
  Sliders,
  Plus,
  ArrowRight,
  TrendingUp,
  MapPin,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import InteractiveAgricultureMap from "@/components/dashboard/InteractiveAgricultureMap";

export default function AdminOverviewDashboard() {
  const {
    users,
    fpos,
    mandisMaster,
    cropsCatalog,
    transporters,
    settlements,
    pools,
    lots,
    auditEvents,
    platformSettings,
    language,
    resetDemoData,
  } = useAppStore();

  const isMr = language === "mr";

  const farmersCount = users.filter((u) => u.role === "farmer").length;
  const buyersCount = users.filter((u) => u.role === "buyer").length;
  const activeMandisCount = mandisMaster.filter((m) => m.status === "Active").length;
  const totalVehicles = transporters.reduce((acc, tr) => acc + tr.vehicles.length, 0);
  const totalSettledAmount = settlements.reduce((acc, s) => acc + s.amount, 0);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              {isMr ? "प्लॅटफॉर्म ॲडमिन व गव्हर्नन्स केंद्र" : "National Platform Admin & Governance Center"}
            </h1>
            <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-300 text-xs">
              <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Enterprise v2.5 Live
            </Badge>
          </div>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            {isMr
              ? "थेट डेटा व्यवस्थापन: शेतकरी, बाजार समित्या, एफपीओ, पिके, शोध त्रिज्या आणि सुरक्षित ऑडिट लेजर."
              : "Full dynamic control suite: Farmers, Mandis, FPOs, Crops, Discovery Settings & Cryptographic Audit Trail."}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (confirm("Reset all portal data to initial wide benchmark seeds?")) {
                resetDemoData();
              }
            }}
            className="text-xs text-slate-600 border-slate-300"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1" /> Reset Demo Seeds
          </Button>
          <Link href="/admin/settings">
            <Button size="sm" variant="outline" className="text-xs border-emerald-300 text-emerald-800 bg-emerald-50">
              <Sliders className="w-3.5 h-3.5 mr-1 text-emerald-700" />
              {isMr ? "शोध सेटिंग्ज" : "Discovery Bounds"}
            </Button>
          </Link>
          <Link href="/admin/mandis">
            <Button size="sm" className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs shadow-md">
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              {isMr ? "मंडी जोडा / इंपोर्ट" : "Mandis & Import"}
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Counters Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card className="bg-white border-slate-200 shadow-xs">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[11px] font-bold uppercase">{isMr ? "एकूण वापरकर्ते" : "Total Users"}</span>
              <Users className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-black text-slate-900">{users.length}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              {farmersCount} Farmers • {buyersCount} Buyers
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-xs">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[11px] font-bold uppercase">{isMr ? "बाजार समित्या" : "APMC Mandis"}</span>
              <Store className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-slate-900">{mandisMaster.length}</div>
            <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">
              {activeMandisCount} Active Nationwide
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-xs">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[11px] font-bold uppercase">{isMr ? "नोंदणीकृत एफपीओ" : "Active FPOs"}</span>
              <Building2 className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-black text-slate-900">{fpos.length}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              {fpos.reduce((acc, f) => acc + f.collectionCenters.length, 0)} Collection Hubs
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-xs">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[11px] font-bold uppercase">{isMr ? "पिके आणि ग्रेड" : "Crop Catalog"}</span>
              <Sprout className="w-4 h-4 text-green-600" />
            </div>
            <div className="text-2xl font-black text-slate-900">{cropsCatalog.length}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              {cropsCatalog.reduce((acc, c) => acc + c.gradeRules.length, 0)} Quality Rules
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-xs">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[11px] font-bold uppercase">{isMr ? "वाहतूक ताफा" : "Fleet Fleet"}</span>
              <Truck className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-2xl font-black text-slate-900">{totalVehicles}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              {transporters.length} Transporters
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-xs">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[11px] font-bold uppercase">{isMr ? "एस्क्रो वाटप" : "Escrow Settled"}</span>
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-xl font-black text-emerald-800">
              ₹{(totalSettledAmount / 1000).toFixed(0)}k
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              {settlements.length} Protected Txns
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Interactive National Agriculture Map */}
      <Card className="bg-white border-slate-200 shadow-xs overflow-hidden">
        <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-700" />
              {isMr ? "अखिल भारतीय कृषी नकाशा आणि क्लस्टर दृश्य" : "Live National Agricultural Coverage Map"}
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Interactive map displaying registered mandis, FPO collection hubs, logistics pools, and institutional buyer yards.
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-xs bg-slate-50 font-mono">
            Radius: {platformSettings.defaultSearchRadiusKm} km default
          </Badge>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <InteractiveAgricultureMap
            heightClassName="h-96 sm:h-[440px]"
            language={language}
            showRadiusOverlay={true}
          />
        </CardContent>
      </Card>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/admin/users" className="block group">
          <Card className="h-full bg-white border-slate-200 shadow-xs hover:border-emerald-500 hover:shadow-md transition-all">
            <CardContent className="p-5 flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800 shrink-0 group-hover:scale-110 transition-transform">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 group-hover:text-emerald-700 transition-colors flex items-center gap-1">
                  User Registry <ArrowRight className="w-3.5 h-3.5" />
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Register new farmers with GPS pin, manage roles, activate/deactivate accounts.
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/mandis" className="block group">
          <Card className="h-full bg-white border-slate-200 shadow-xs hover:border-emerald-500 hover:shadow-md transition-all">
            <CardContent className="p-5 flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-800 shrink-0 group-hover:scale-110 transition-transform">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 group-hover:text-blue-700 transition-colors flex items-center gap-1">
                  Mandi Master &amp; CSV Import <ArrowRight className="w-3.5 h-3.5" />
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Add custom mandis across India or bulk import hundreds via CSV template.
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/settings" className="block group">
          <Card className="h-full bg-white border-slate-200 shadow-xs hover:border-emerald-500 hover:shadow-md transition-all">
            <CardContent className="p-5 flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-800 shrink-0 group-hover:scale-110 transition-transform">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 group-hover:text-purple-700 transition-colors flex items-center gap-1">
                  Market Discovery Settings <ArrowRight className="w-3.5 h-3.5" />
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Tune search radius bounds (up to 1000 km), freight/km rates, and AI model configs.
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Cryptographic Audit Trail Stream */}
      <Card className="bg-white border-slate-200 shadow-xs">
        <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-700" />
              {isMr ? "अपरिवर्तनीय ऑडिट लेजर प्रवाह" : "Recent Cryptographic Audit Ledger Stream"}
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              SHA-256 hash-chained immutable event logs for every administrative mutation.
            </CardDescription>
          </div>
          <Link href="/admin/audit">
            <Button variant="ghost" size="sm" className="text-xs text-emerald-700 hover:text-emerald-800">
              View Complete Ledger <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          <div className="space-y-2">
            {auditEvents.slice(0, 5).map((evt) => (
              <div
                key={evt.id}
                className="flex items-start justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100/80 transition-colors border border-slate-100 text-xs"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono text-[10px] bg-white">
                      {evt.action}
                    </Badge>
                    <span className="font-bold text-slate-900">{evt.actorName}</span>
                    <span className="text-slate-400 capitalize">({evt.actorRole})</span>
                  </div>
                  <p className="text-slate-600 text-xs">{evt.details}</p>
                  <div className="text-[10px] text-slate-400 font-mono">
                    Hash: {evt.hash.slice(0, 16)}... • Entity: {evt.entityType}:{evt.entityId}
                  </div>
                </div>
                <div className="text-[10px] text-slate-400 shrink-0 font-mono text-right">
                  {new Date(evt.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
