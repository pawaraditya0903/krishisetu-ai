"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { MandiPrice } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Clock, TrendingUp, IndianRupee } from "lucide-react";

export default function MarketPricesPage() {
  const { mandiPrices } = useAppStore();
  const [selectedMandi, setSelectedMandi] = useState<MandiPrice>(mandiPrices[0]);

  // Dynamic cost calculator state
  const [quantityKg, setQuantityKg] = useState(500);
  const [freightPerKm, setFreightPerKm] = useState(15);
  const [handlingFee, setHandlingFee] = useState(180);
  const [packagingFee, setPackagingFee] = useState(150);
  const [commissionPct, setCommissionPct] = useState(5);
  const [spoilagePct, setSpoilagePct] = useState(2);

  const calculateNet = (mandi: MandiPrice, pricePerQtl: number) => {
    const qtl = quantityKg / 100;
    const grossValue = pricePerQtl * qtl;
    const freight = freightPerKm * mandi.distanceKm;
    const commission = grossValue * (commissionPct / 100);
    const spoilageLoss = grossValue * (spoilagePct / 100);
    const totalDeductions = freight + handlingFee + packagingFee + commission + spoilageLoss;
    const netTotal = grossValue - totalDeductions;
    return {
      netTotal,
      netPerQtl: qtl > 0 ? netTotal / qtl : 0,
      freight,
      commission,
      spoilageLoss,
      grossValue,
    };
  };

  const selectedCalc = calculateNet(selectedMandi, selectedMandi.modalPrice);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-slate-900">Mandi Price Discovery &amp; Net Realization</h1>
        <p className="text-slate-500 text-sm">
          Never judge a mandi by gross headline price alone. Deduct route freight, handling, and commission to find your true take-home pay.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Mandi Cards List */}
        <div className="lg:col-span-2 space-y-4">
          {mandiPrices.map((mandi) => {
            const calc = calculateNet(mandi, mandi.modalPrice);
            const isSelected = selectedMandi.id === mandi.id;
            const isBestNet = mandi.id === "M2"; // Pune gives highest net due to modal price premium

            return (
              <Card
                key={mandi.id}
                className={`cursor-pointer transition-all border-slate-200 ${
                  isSelected ? "border-green-600 ring-2 ring-green-600/20 shadow-md" : "hover:border-slate-300"
                }`}
                onClick={() => setSelectedMandi(mandi)}
              >
                <CardContent className="p-0">
                  <div className="p-5 flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-lg text-slate-900">{mandi.mandi}</h3>
                        {isBestNet && (
                          <Badge className="bg-green-100 text-green-800 border-none text-[10px]">
                            Best Estimated Net Outcome
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" /> {mandi.distanceKm} km from Baramati
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> {mandi.freshness}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1">
                        Variety: {mandi.variety} • Source: {mandi.source}
                      </div>
                    </div>

                    <div className="text-right sm:self-center">
                      <div className="text-2xl font-extrabold text-slate-900">₹{mandi.modalPrice}</div>
                      <div className="text-[10px] text-slate-500 uppercase font-semibold">Modal Price / Quintal</div>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3.5 border-t border-slate-100 flex justify-between items-center text-xs">
                    <span className="text-slate-600">
                      Range: ₹{mandi.minPrice} - ₹{mandi.maxPrice}/qtl | Arrivals: {mandi.arrivalsQtl} qtl
                    </span>
                    <span className="font-bold text-green-700 text-sm">
                      Take-Home: ₹{Math.round(calc.netPerQtl)}/qtl
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          <div className="bg-amber-50 border border-amber-200 text-amber-900 text-xs p-4 rounded-xl flex items-start gap-3">
            <TrendingUp className="w-5 h-5 shrink-0 text-amber-700 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-bold">Mandi Intelligence Rule:</p>
              <p className="leading-relaxed">
                Gross price in distant mandis like Solapur (190 km) or Pune (92 km) may look attractive, but solo transport quickly wipes out farmer margins. FPO pooling unlocks group freight rates (up to 30% reduction).
              </p>
            </div>
          </div>
        </div>

        {/* Cost Deduction Calculator Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6 border-slate-200 shadow-sm">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <IndianRupee className="w-4 h-4 text-green-700" /> Transparent Net Calculator
              </CardTitle>
              <CardDescription className="text-xs">
                Adjust parameters for <strong>{selectedMandi.mandi}</strong>
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-3.5 text-xs">
              <div className="space-y-1">
                <Label className="text-[11px] text-slate-600">Batch Quantity (kg)</Label>
                <Input
                  type="number"
                  value={quantityKg}
                  onChange={(e) => setQuantityKg(Math.max(1, parseInt(e.target.value) || 0))}
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-[11px] text-slate-600">Freight Rate (₹/km for solo vehicle)</Label>
                <Input
                  type="number"
                  value={freightPerKm}
                  onChange={(e) => setFreightPerKm(Math.max(0, parseInt(e.target.value) || 0))}
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-[11px] text-slate-600">APMC Commission ({commissionPct}%)</Label>
                <Input
                  type="number"
                  value={commissionPct}
                  onChange={(e) => setCommissionPct(Math.max(0, parseInt(e.target.value) || 0))}
                  className="h-8 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-[11px] text-slate-600">Handling (₹)</Label>
                  <Input
                    type="number"
                    value={handlingFee}
                    onChange={(e) => setHandlingFee(Math.max(0, parseInt(e.target.value) || 0))}
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px] text-slate-600">Packaging (₹)</Label>
                  <Input
                    type="number"
                    value={packagingFee}
                    onChange={(e) => setPackagingFee(Math.max(0, parseInt(e.target.value) || 0))}
                    className="h-8 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-[11px] text-slate-600">In-Transit Spoilage Buffer ({spoilagePct}%)</Label>
                <Input
                  type="number"
                  value={spoilagePct}
                  onChange={(e) => setSpoilagePct(Math.max(0, parseInt(e.target.value) || 0))}
                  className="h-8 text-xs"
                />
              </div>

              {/* Itemized Deductions List */}
              <div className="space-y-2 pt-2 border-t border-slate-100 text-slate-600 text-[11px]">
                <div className="flex justify-between">
                  <span>Gross Value ({quantityKg} kg @ ₹{selectedMandi.modalPrice}/qtl):</span>
                  <span className="font-semibold text-slate-900">₹{Math.round(selectedCalc.grossValue)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Freight ({selectedMandi.distanceKm} km x ₹{freightPerKm}):</span>
                  <span className="text-red-600">-₹{Math.round(selectedCalc.freight)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Loading &amp; Labour Handling:</span>
                  <span className="text-red-600">-₹{handlingFee}</span>
                </div>
                <div className="flex justify-between">
                  <span>Crates &amp; Packaging:</span>
                  <span className="text-red-600">-₹{packagingFee}</span>
                </div>
                <div className="flex justify-between">
                  <span>APMC Commission ({commissionPct}%):</span>
                  <span className="text-red-600">-₹{Math.round(selectedCalc.commission)}</span>
                </div>
                <div className="flex justify-between">
                  <span>In-Transit Spoilage Buffer ({spoilagePct}%):</span>
                  <span className="text-red-600">-₹{Math.round(selectedCalc.spoilageLoss)}</span>
                </div>
              </div>

              {/* Multi-Scenario Realization Projection */}
              <div className="pt-2 border-t border-slate-100">
                <div className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Realization Scenarios (Min / Modal / Max)
                </div>
                <div className="grid grid-cols-3 gap-1.5 text-center text-[10px]">
                  <div className="bg-slate-50 p-1.5 rounded border border-slate-200">
                    <span className="text-slate-500 block text-[9px]">Min (₹{selectedMandi.minPrice})</span>
                    <strong className="text-slate-800 text-[11px]">₹{Math.round(calculateNet(selectedMandi, selectedMandi.minPrice).netTotal)}</strong>
                    <span className="text-[9px] text-slate-500 block">₹{Math.round(calculateNet(selectedMandi, selectedMandi.minPrice).netPerQtl)}/qtl</span>
                  </div>
                  <div className="bg-green-50 p-1.5 rounded border border-green-200">
                    <span className="text-green-700 font-semibold block text-[9px]">Modal (₹{selectedMandi.modalPrice})</span>
                    <strong className="text-green-900 text-[11px]">₹{Math.round(selectedCalc.netTotal)}</strong>
                    <span className="text-[9px] text-green-700 block font-medium">₹{Math.round(selectedCalc.netPerQtl)}/qtl</span>
                  </div>
                  <div className="bg-slate-50 p-1.5 rounded border border-slate-200">
                    <span className="text-slate-500 block text-[9px]">Max (₹{selectedMandi.maxPrice})</span>
                    <strong className="text-slate-800 text-[11px]">₹{Math.round(calculateNet(selectedMandi, selectedMandi.maxPrice).netTotal)}</strong>
                    <span className="text-[9px] text-slate-500 block">₹{Math.round(calculateNet(selectedMandi, selectedMandi.maxPrice).netPerQtl)}/qtl</span>
                  </div>
                </div>
              </div>

              {/* Final Realization */}
              <div className="pt-3 border-t border-slate-200">
                <div className="flex justify-between items-end mb-1">
                  <span className="font-bold text-slate-900 text-sm">Estimated Net Payout</span>
                  <span className="text-2xl font-extrabold text-green-700">₹{Math.round(selectedCalc.netTotal)}</span>
                </div>
                <div className="text-right text-xs text-slate-500 font-medium">
                  ₹{Math.round(selectedCalc.netPerQtl)} / quintal realized
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
