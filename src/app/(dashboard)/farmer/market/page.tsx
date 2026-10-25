"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { MandiPrice } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Clock, TrendingUp, IndianRupee, RefreshCw, Sprout } from "lucide-react";
import { toast } from "sonner";
import { translations } from "@/lib/i18n";

const CROPS = ["Tomato", "Onion", "Potato", "Pomegranate", "Green Chilli", "Soyabean", "All"];

export default function MarketPricesPage() {
  const { mandiPrices, fetchRealTimeMandiPrices, language } = useAppStore();
  const t = translations[language] || translations.en;
  const [selectedCrop, setSelectedCrop] = useState("Tomato");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const getMandiDisplayName = (mandiName: string) => {
    if (language !== "mr") return mandiName;
    if (mandiName.includes("Baramati")) return "बारामती बाजार समिती";
    if (mandiName.includes("Pune Gultekdi")) return "पुणे गुलटेकडी मार्केट यार्ड";
    if (mandiName.includes("Solapur")) return "सोलापूर बाजार समिती";
    if (mandiName.includes("Mumbai Vashi")) return "मुंबई वाशी एपीएमसी";
    if (mandiName.includes("Lasalgaon")) return "लासलगाव कांदा बाजार";
    if (mandiName.includes("Nashik")) return "नाशिक कृषी उत्पन्न बाजार समिती";
    if (mandiName.includes("Kolhapur")) return "कोल्हापूर बाजार समिती";
    if (mandiName.includes("Ahmednagar")) return "अहमदनगर बाजार समिती";
    if (mandiName.includes("Sangli")) return "सांगली हळद व शेतीमाल बाजार";
    if (mandiName.includes("Nagpur")) return "नागपूर कॉटन मार्केट यार्ड";
    return mandiName;
  };

  const filteredMandis = mandiPrices.filter((m) =>
    selectedCrop === "All" ? true : m.crop.toLowerCase().includes(selectedCrop.toLowerCase())
  );

  const [selectedMandi, setSelectedMandi] = useState<MandiPrice>(
    filteredMandis[0] || mandiPrices[0]
  );

  const activeMandi =
    filteredMandis.find((m) => m.id === selectedMandi?.id) || filteredMandis[0] || mandiPrices[0];

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

  const selectedCalc = calculateNet(activeMandi, activeMandi.modalPrice);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchRealTimeMandiPrices(selectedCrop);
    setIsRefreshing(false);
    toast.success("Mandi Price Feed Updated", {
      description: `Loaded authentic AGMARKNET / MSAMB bulletins for ${selectedCrop}.`,
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t.market.title}</h1>
          <p className="text-slate-500 text-sm">
            {t.market.subtitle}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="text-xs shrink-0 self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isRefreshing ? "animate-spin" : ""}`} />
          {isRefreshing ? "..." : t.market.liveFeed}
        </Button>
      </div>

      {/* Multi-Crop Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-xs font-semibold text-slate-500 flex items-center gap-1 shrink-0">
          <Sprout className="w-3.5 h-3.5 text-green-700" /> {t.market.commodity}
        </span>
        {CROPS.map((crop) => {
          const isActive = selectedCrop === crop;
          const translatedCrop = t.market.crops[crop] || crop;
          return (
            <button
              key={crop}
              onClick={() => {
                setSelectedCrop(crop);
                const first = mandiPrices.find((m) =>
                  crop === "All" ? true : m.crop.toLowerCase().includes(crop.toLowerCase())
                );
                if (first) setSelectedMandi(first);
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors shrink-0 ${
                isActive
                  ? "bg-green-700 text-white shadow-sm"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {translatedCrop}
            </button>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Mandi Cards List */}
        <div className="lg:col-span-2 space-y-4">
          {filteredMandis.map((mandi) => {
            const calc = calculateNet(mandi, mandi.modalPrice);
            const isSelected = activeMandi.id === mandi.id;
            const isBestNet =
              mandi.id === "M2" ||
              mandi.id === "M6" ||
              mandi.id === "M11" ||
              mandi.id === "M13" ||
              mandi.id === "M15" ||
              mandi.id === "M17";

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
                        <h3 className="font-bold text-lg text-slate-900">{getMandiDisplayName(mandi.mandi)}</h3>
                        {isBestNet && (
                          <Badge className="bg-green-100 text-green-800 border-none text-[10px]">
                            {t.market.bestNetTag}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" /> {mandi.distanceKm} km {t.market.distanceSuffix}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> {t.market.freshToday}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1">
                        {language === "mr" ? `वाण: ${mandi.variety} • स्रोत: ${mandi.source}` : `Variety: ${mandi.variety} • Source: ${mandi.source}`}
                      </div>
                    </div>

                    <div className="text-right sm:self-center">
                      <div className="text-2xl font-extrabold text-slate-900">₹{mandi.modalPrice}</div>
                      <div className="text-[10px] text-slate-500 uppercase font-semibold">{t.market.modalPrice}</div>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3.5 border-t border-slate-100 flex justify-between items-center text-xs">
                    <span className="text-slate-600">
                      {t.market.range}: ₹{mandi.minPrice} - ₹{mandi.maxPrice}/qtl | {t.market.arrivals}: {mandi.arrivalsQtl} qtl
                    </span>
                    <span className="font-bold text-green-700 text-sm">
                      {t.market.takeHome}: ₹{Math.round(calc.netPerQtl)}/qtl
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          <div className="bg-amber-50 border border-amber-200 text-amber-900 text-xs p-4 rounded-xl flex items-start gap-3">
            <TrendingUp className="w-5 h-5 shrink-0 text-amber-700 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-bold">
                {language === "mr" ? "बाजार समिती नफा नियम:" : language === "hi" ? "मंडी बुद्धिमत्ता नियम:" : "Mandi Intelligence Rule:"}
              </p>
              <p className="leading-relaxed">
                {language === "mr"
                  ? "सोलापूर (१९० किमी) किंवा पुणे (९२ किमी) सारख्या दूरच्या बाजारात वरकरणी भाव जास्त दिसतो, परंतु एकट्याने माल नेल्यास वाहतूक खर्चामुळे नफा कमी होतो. FPO पूलिंगद्वारे गट वाहतूक केल्यास वाहतूक खर्चात ३०% पर्यंत थेट बचत होते."
                  : language === "hi"
                  ? "दूर की मंडियों में थोक भाव अधिक दिख सकता है, लेकिन अकेले परिवहन से किसान का शुद्ध मुनाफा घट जाता है। एफपीओ पूलिंग के माध्यम से सामूहिक ढुलाई करने पर मालभाड़े में 30% तक बचत होती है।"
                  : "Gross price in distant mandis like Solapur (190 km) or Pune (92 km) may look attractive, but solo transport quickly wipes out farmer margins. FPO pooling unlocks group freight rates (up to 30% reduction)."}
              </p>
            </div>
          </div>
        </div>

        {/* Cost Deduction Calculator Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6 border-slate-200 shadow-sm">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <IndianRupee className="w-4 h-4 text-green-700" /> {t.market.calculatorTitle}
              </CardTitle>
              <CardDescription className="text-xs">
                {t.market.calculatorSubtitle} <strong>{getMandiDisplayName(activeMandi.mandi)}</strong>
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-3.5 text-xs">
              <div className="space-y-1">
                <Label className="text-[11px] text-slate-600">{t.market.batchQuantity}</Label>
                <Input
                  type="number"
                  value={quantityKg}
                  onChange={(e) => setQuantityKg(Math.max(1, parseInt(e.target.value) || 0))}
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-[11px] text-slate-600">{t.market.freightRate}</Label>
                <Input
                  type="number"
                  value={freightPerKm}
                  onChange={(e) => setFreightPerKm(Math.max(0, parseInt(e.target.value) || 0))}
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-[11px] text-slate-600">{t.market.apmcCommission}</Label>
                <Input
                  type="number"
                  value={commissionPct}
                  onChange={(e) => setCommissionPct(Math.max(0, parseInt(e.target.value) || 0))}
                  className="h-8 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-[11px] text-slate-600">{t.market.handlingFee}</Label>
                  <Input
                    type="number"
                    value={handlingFee}
                    onChange={(e) => setHandlingFee(Math.max(0, parseInt(e.target.value) || 0))}
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px] text-slate-600">{t.market.packagingFee}</Label>
                  <Input
                    type="number"
                    value={packagingFee}
                    onChange={(e) => setPackagingFee(Math.max(0, parseInt(e.target.value) || 0))}
                    className="h-8 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-[11px] text-slate-600">{t.market.spoilageBuffer}</Label>
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
                  <span>{t.market.grossValue} ({quantityKg} kg @ ₹{activeMandi.modalPrice}/qtl):</span>
                  <span className="font-semibold text-slate-900">₹{Math.round(selectedCalc.grossValue)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t.market.freight} ({activeMandi.distanceKm} km x ₹{freightPerKm}):</span>
                  <span className="text-red-600">-₹{Math.round(selectedCalc.freight)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t.market.handling}:</span>
                  <span className="text-red-600">-₹{handlingFee}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t.market.cratesPackaging}:</span>
                  <span className="text-red-600">-₹{packagingFee}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t.market.commission} ({commissionPct}%):</span>
                  <span className="text-red-600">-₹{Math.round(selectedCalc.commission)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t.market.spoilage} ({spoilagePct}%):</span>
                  <span className="text-red-600">-₹{Math.round(selectedCalc.spoilageLoss)}</span>
                </div>
              </div>

              {/* Multi-Scenario Realization Projection */}
              <div className="pt-2 border-t border-slate-100">
                <div className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  {language === "mr" ? "निव्वळ प्राप्ती अंदाज (किमान / सरासरी / कमाल)" : "Realization Scenarios (Min / Modal / Max)"}
                </div>
                <div className="grid grid-cols-3 gap-1.5 text-center text-[10px]">
                  <div className="bg-slate-50 p-1.5 rounded border border-slate-200">
                    <span className="text-slate-500 block text-[9px]">{language === "mr" ? "किमान" : "Min"} (₹{activeMandi.minPrice})</span>
                    <strong className="text-slate-800 text-[11px]">₹{Math.round(calculateNet(activeMandi, activeMandi.minPrice).netTotal)}</strong>
                    <span className="text-[9px] text-slate-500 block">₹{Math.round(calculateNet(activeMandi, activeMandi.minPrice).netPerQtl)}/qtl</span>
                  </div>
                  <div className="bg-green-50 p-1.5 rounded border border-green-200">
                    <span className="text-green-700 font-semibold block text-[9px]">{language === "mr" ? "सरासरी" : "Modal"} (₹{activeMandi.modalPrice})</span>
                    <strong className="text-green-900 text-[11px]">₹{Math.round(selectedCalc.netTotal)}</strong>
                    <span className="text-[9px] text-green-700 block font-medium">₹{Math.round(selectedCalc.netPerQtl)}/qtl</span>
                  </div>
                  <div className="bg-slate-50 p-1.5 rounded border border-slate-200">
                    <span className="text-slate-500 block text-[9px]">{language === "mr" ? "कमाल" : "Max"} (₹{activeMandi.maxPrice})</span>
                    <strong className="text-slate-800 text-[11px]">₹{Math.round(calculateNet(activeMandi, activeMandi.maxPrice).netTotal)}</strong>
                    <span className="text-[9px] text-slate-500 block">₹{Math.round(calculateNet(activeMandi, activeMandi.maxPrice).netPerQtl)}/qtl</span>
                  </div>
                </div>
              </div>

              {/* Final Realization */}
              <div className="pt-3 border-t border-slate-200">
                <div className="flex justify-between items-end mb-1">
                  <span className="font-bold text-slate-900 text-sm">{t.market.takeHome}</span>
                  <span className="text-2xl font-extrabold text-green-700">₹{Math.round(selectedCalc.netTotal)}</span>
                </div>
                <div className="text-right text-xs text-slate-500 font-medium">
                  ₹{Math.round(selectedCalc.netPerQtl)} {language === "mr" ? "/ क्विंटल हाती" : "/ quintal realized"}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
