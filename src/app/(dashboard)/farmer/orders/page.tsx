"use client";

import React from "react";
import Link from "next/link";
import { useAppStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Package,
  Truck,
  ShieldCheck,
  FileText,
  MapPin,
} from "lucide-react";

export default function FarmerOrdersPage() {
  const { lots, pools, settlements, currentUser, language } = useAppStore();
  const isMr = language === "mr";

  // Farmer lots that have reached pool, reserved, or sold status
  const activeOrders = lots.filter(
    (l) =>
      (l.farmerId === currentUser?.id || l.farmerId === "F1") &&
      ["IN_POOL", "BUYER_RESERVED", "DISPATCHED", "DELIVERED", "SOLD", "Pooled", "Reserved"].includes(
        l.productStatus || l.status
      )
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {isMr ? "माझे खरेदीदार ऑर्डर व एस्क्रो ट्रॅकिंग" : "Farmer Orders & Milestone Escrow"}
            </h1>
            <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 text-xs font-semibold">
              {activeOrders.length} {isMr ? "सक्रिय ऑर्डर्स" : "Active Orders"}
            </Badge>
          </div>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            {isMr
              ? "खरेदीदारांकडून राखीव केलेले लॉट्स, ONDC ट्रान्सपोर्टर माहिती आणि RBI नोडल एस्क्रो हप्ते तपासा."
              : "Track buyer reservations, assigned ONDC freight carriers, and RBI Nodal milestone escrow disbursements."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/farmer/settlement">
            <Button variant="outline" size="sm" className="text-xs border-emerald-300 text-emerald-800 bg-emerald-50/50 hover:bg-emerald-100">
              <FileText className="w-3.5 h-3.5 mr-1 text-emerald-700" />
              {isMr ? "पेमेंट पावत्या" : "Settlement Receipts"}
            </Button>
          </Link>
          <Link href="/farmer/products">
            <Button size="sm" className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-xs">
              <Package className="w-3.5 h-3.5 mr-1" />
              {isMr ? "सर्व उत्पादने" : "Manage Products"}
            </Button>
          </Link>
        </div>
      </div>

      {/* Escrow Safeguard Architecture Card */}
      <Card className="bg-gradient-to-r from-emerald-50 via-teal-50/60 to-blue-50/50 border-emerald-200 shadow-xs">
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold text-slate-900 text-sm">
                  {isMr ? "नोडल एस्क्रो कार्यप्रवाह सिम्युलेशन (टप्प्याटप्प्याने सेटलमेंट)" : "Nodal Escrow Workflow Simulation (Milestone-Based Settlement)"}
                </span>
                <Badge className="bg-amber-100 text-amber-900 border-none text-[10px] font-bold">
                  SIMULATED PAYMENT
                </Badge>
                <Badge className="bg-purple-100 text-purple-800 border-none text-[10px] font-semibold">
                  Zero Advance Default Protection
                </Badge>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                {isMr
                  ? "खरेदीदारांचे पैसे थेट सुरक्षित नोडल खाते सिम्युलेशनमध्ये (YESB0000109-NODAL) राखीव ठेवले जातात. ₹0 आगाऊ उचल, FPO वजन पडताळणीनंतर ८०% थेट खात्यात, आणि उर्वरित २०% डिलिव्हरीनंतर वितरित केले जातात."
                  : "Nodal escrow workflow simulation designed around milestone-based settlement (YESB0000109-NODAL-*). ₹0 advance at booking, 80% on FPO weighment verification, and 20% post-delivery clearance."}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-3 border-t border-emerald-200/60 text-xs">
            <div className="bg-white/80 p-2.5 rounded-lg border border-emerald-100 flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-[11px]">1</div>
              <div>
                <span className="text-[10px] text-slate-500 block">Stage 1: Reservation</span>
                <strong className="text-slate-900 font-semibold text-[11px]">100% Locked in Nodal Account</strong>
              </div>
            </div>
            <div className="bg-white/80 p-2.5 rounded-lg border border-emerald-100 flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[11px]">2</div>
              <div>
                <span className="text-[10px] text-slate-500 block">Stage 2: FPO Gate Scan</span>
                <strong className="text-slate-900 font-semibold text-[11px]">80% Immediate Net Payout</strong>
              </div>
            </div>
            <div className="bg-white/80 p-2.5 rounded-lg border border-emerald-100 flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-[11px]">3</div>
              <div>
                <span className="text-[10px] text-slate-500 block">Stage 3: Buyer Acceptance</span>
                <strong className="text-slate-900 font-semibold text-[11px]">20% Balance Release (24h SLA)</strong>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      {activeOrders.length === 0 ? (
        <Card className="border-dashed border-slate-300 bg-slate-50/50 p-12 text-center rounded-2xl">
          <Package className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h3 className="font-bold text-slate-800 text-sm">
            {isMr ? "सध्या कोणतीही सक्रिय खरेदीदार ऑर्डर नाही" : "No active buyer orders found"}
          </h3>
          <p className="text-slate-500 text-xs max-w-sm mx-auto mt-1 mb-4">
            {isMr
              ? "तुमची उत्पादने FPO पूलमध्ये सामील करा किंवा B2B मार्केटप्लेसवर प्रकाशित करा."
              : "Pool your harvest lots or publish them to the B2B marketplace to receive buyer orders."}
          </p>
          <Link href="/farmer/grade">
            <Button size="sm" className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs">
              + {isMr ? "नवीन पीक ग्रेड करा" : "Grade New Harvest Lot"}
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {activeOrders.map((lot) => {
            const pool = pools.find((p) => p.contributions?.some((c) => c.lotId === lot.id));
            const pricePerQtl = lot.askingPricePerQtl || pool?.pricePerQtl || 2150;
            const hubName = lot.locationName || pool?.collectionHub || "Saksham Baramati Hub";
            const mandiName = pool?.destinationMandi || "Pune Market Yard";

            return (
              <Card key={lot.id} className="border-slate-200 overflow-hidden shadow-xs hover:border-emerald-300 transition-all">
                <CardHeader className="p-4 pb-3 bg-slate-50/60 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                      <Package className="w-5 h-5 text-emerald-700" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-sm font-bold text-slate-900">
                          {lot.crop} ({lot.variety || "Abhinav"}) • #{lot.id}
                        </CardTitle>
                        <Badge className="bg-emerald-100 text-emerald-800 border-none text-[10px]">
                          {lot.grade || "Grade A"}
                        </Badge>
                        <Badge variant="outline" className="border-blue-300 text-blue-800 bg-blue-50 text-[10px]">
                          {lot.productStatus || lot.status}
                        </Badge>
                      </div>
                      <CardDescription className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1.5">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        Hub: {hubName} &rarr; Mandi: {mandiName}
                      </CardDescription>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 block">Total Lot Value</span>
                    <strong className="text-emerald-800 font-bold text-sm">
                      ₹{Math.round(((lot.quantityKg || 450) / 100) * pricePerQtl).toLocaleString()}
                    </strong>
                  </div>
                </CardHeader>

                <CardContent className="p-4 space-y-4">
                  {/* Grid attributes */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="bg-slate-50 p-2.5 rounded-lg">
                      <span className="text-slate-400 block text-[10px]">Harvest Volume</span>
                      <strong className="text-slate-900 font-semibold">{lot.quantityKg} kg</strong>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-lg">
                      <span className="text-slate-400 block text-[10px]">Contract Rate</span>
                      <strong className="text-emerald-700 font-semibold">₹{pricePerQtl}/qtl</strong>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-lg">
                      <span className="text-slate-400 block text-[10px]">Logistics Protocol</span>
                      <strong className="text-blue-900 font-semibold flex items-center gap-1">
                        <Truck className="w-3 h-3 text-blue-600" /> ONDC Beckn v1.2.0
                      </strong>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-lg">
                      <span className="text-slate-400 block text-[10px]">Assigned Carrier</span>
                      <strong className="text-slate-900 font-semibold">Delhivery Rural / Sahyadri Pool</strong>
                    </div>
                  </div>

                  {/* Escrow Progress Bar */}
                  <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200 text-xs space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        RBI Nodal Account Escrow Disbursement Status
                      </span>
                      <span className="text-emerald-700 font-mono text-[10px]">
                        Ref: YESB0000109-NODAL-F1
                      </span>
                    </div>

                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden flex">
                      <div className="bg-emerald-500 h-full w-[80%]" title="80% released at weigh-bridge"></div>
                      <div className="bg-amber-400 h-full w-[20%]" title="20% held for 24h inspection SLA"></div>
                    </div>

                    <div className="flex justify-between text-[10px] text-slate-500 pt-0.5">
                      <span>✓ ₹0 Advance (Default Safeguard)</span>
                      <span className="text-emerald-700 font-medium">✓ 80% Released on Weigh-slip</span>
                      <span className="text-amber-700 font-medium">⏳ 20% Release upon Delivery (24h SLA)</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100 text-xs">
                    <div className="text-[11px] text-slate-500">
                      QR Gate Pass: <code className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">KS-LOT-{lot.id}-VERIFIED</code>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link href={`/farmer/products/${lot.id}`}>
                        <Button variant="outline" size="sm" className="text-xs h-8">
                          View Batch Audit Trail
                        </Button>
                      </Link>
                      <Link href="/farmer/settlement">
                        <Button size="sm" className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs h-8">
                          Inspect Settlement Breakdown &rarr;
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
