"use client";

import { useAppStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Camera, ArrowRight, IndianRupee, Layers, Sprout } from "lucide-react";
import Link from "next/link";
import { translations } from "@/lib/i18n";

export default function FarmerDashboard() {
  const { currentUser, isOffline, lots, language } = useAppStore();
  const t = translations[language] || translations.en;

  if (!currentUser) return null;

  const myLots = lots.filter((l) => l.farmerId === currentUser.id);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {t.farmer.greeting}, {currentUser.name.split(" ")[0]} 👋
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm">
            {isOffline ? "Offline Mode • Queued locally" : "Online • Real-Time Baramati APMC Connected"}
          </p>
        </div>
        <Link href="/farmer/grade">
          <Button className="bg-green-700 hover:bg-green-800 w-full md:w-auto text-xs sm:text-sm">
            <Camera className="w-4 h-4 mr-2" /> {t.farmer.startSelling}
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <p className="text-xs font-semibold text-slate-500">{t.farmer.bestNet}</p>
              <IndianRupee className="w-4 h-4 text-green-600" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900">
              ₹1,940<span className="text-xs font-normal text-slate-500">/qtl</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Tomato • Baramati APMC Yard</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <p className="text-xs font-semibold text-slate-500">{t.farmer.cropGrade}</p>
              <Sprout className="w-4 h-4 text-green-600" />
            </div>
            <div className="text-2xl font-extrabold text-green-700">Grade A</div>
            <p className="text-[11px] text-slate-500 mt-1">External Visual AI Estimate</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <p className="text-xs font-semibold text-slate-500">{t.farmer.poolProgress}</p>
              <Layers className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900">
              650 <span className="text-xs font-normal text-slate-500">/ 1,000 kg</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
              <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: "65%" }}></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <p className="text-xs font-semibold text-slate-500">{t.farmer.pendingPayout}</p>
              <IndianRupee className="w-4 h-4 text-green-600" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900">₹8,420</div>
            <p className="text-[11px] text-emerald-700 font-medium mt-1">Released in Nodal Account</p>
          </CardContent>
        </Card>
      </div>

      {/* Market Journey Stepper */}
      <div className="bg-green-50 rounded-xl p-4 md:p-5 border border-green-200">
        <h3 className="font-semibold text-green-950 text-xs uppercase tracking-wider mb-3">
          End-to-End Market Linkage Journey
        </h3>
        <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-green-800">
          <Badge className="bg-green-700 text-white border-none">1. Capture 3 Photos</Badge>
          <ArrowRight className="w-3.5 h-3.5 text-green-600" />
          <Badge variant="outline" className="bg-white text-green-800 border-green-300">2. External AI Grade</Badge>
          <ArrowRight className="w-3.5 h-3.5 text-green-600" />
          <Badge variant="outline" className="bg-white text-green-800 border-green-300">3. Net Mandi Compare</Badge>
          <ArrowRight className="w-3.5 h-3.5 text-green-600" />
          <Badge variant="outline" className="bg-white text-green-800 border-green-300">4. FPO Group Pooling</Badge>
          <ArrowRight className="w-3.5 h-3.5 text-green-600" />
          <Badge variant="outline" className="bg-white text-green-800 border-green-300">5. Nodal Payout</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-slate-200">
          <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold">{t.farmer.recentLots}</CardTitle>
              <CardDescription className="text-xs">Your active and verified crop lots in the system</CardDescription>
            </div>
            <Link href="/farmer/orders">
              <Button variant="ghost" size="sm" className="text-xs text-green-700">
                View All Orders
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {myLots.map((lot) => (
              <div
                key={lot.id}
                className="flex items-center justify-between p-3.5 bg-white border border-slate-100 rounded-lg shadow-xs"
              >
                <div>
                  <h4 className="font-semibold text-slate-900 text-sm">
                    {lot.crop} ({lot.variety}) - {lot.quantityKg} kg
                  </h4>
                  <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                    <span>Lot: {lot.id}</span>
                    <span>•</span>
                    <span>{new Date(lot.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="text-right flex flex-col items-end gap-1">
                  <Badge
                    className={
                      lot.status === "Verified" || lot.status === "Paid"
                        ? "bg-green-100 text-green-800 border-none text-[10px]"
                        : "bg-slate-100 text-slate-700 border-none text-[10px]"
                    }
                  >
                    {lot.status}
                  </Badge>
                  <span className="text-xs font-semibold text-green-700">{lot.grade}</span>
                </div>
              </div>
            ))}
            {myLots.length === 0 && (
              <div className="text-center p-6 text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-200 text-xs">
                No lots created yet. Click &quot;Start Selling&quot; to begin.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="text-base font-bold">{t.farmer.nearbyMandis}</CardTitle>
            <CardDescription className="text-xs">Daily rates for Tomato</CardDescription>
          </CardHeader>
          <CardContent className="p-4 space-y-3.5">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2.5">
              <div>
                <div className="font-semibold text-sm text-slate-900">Baramati APMC</div>
                <div className="text-xs text-slate-500">12 km (Local hub)</div>
              </div>
              <div className="font-bold text-green-700 text-base">₹1,850/qtl</div>
            </div>
            <div className="flex justify-between items-center border-b border-slate-100 pb-2.5">
              <div>
                <div className="font-semibold text-sm text-slate-900">Pune Gultekdi</div>
                <div className="text-xs text-slate-500">92 km (Terminal)</div>
              </div>
              <div className="font-bold text-green-700 text-base">₹2,150/qtl</div>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <div className="font-semibold text-sm text-slate-900">Solapur APMC</div>
                <div className="text-xs text-slate-500">190 km</div>
              </div>
              <div className="font-bold text-green-700 text-base">₹2,020/qtl</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="text-center text-xs text-slate-400 pb-4">
        Disclaimer: All prices and recommendations are demo estimates, not guarantees. This is an SIH prototype.
      </div>
    </div>
  );
}
