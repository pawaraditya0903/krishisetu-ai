"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { MandiPrice } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  MapPin,
  Clock,
  TrendingUp,
  IndianRupee,
  RefreshCw,
  Sprout,
  Navigation,
  SlidersHorizontal,
  ArrowUpDown,
  AlertTriangle,
  Info,
  Truck,
} from "lucide-react";
import { toast } from "sonner";
import { translations } from "@/lib/i18n";
import { calculateDynamicMandisForLocation } from "@/lib/agricultural-data";
import { formatTravelTime } from "@/lib/geo-locations";
import LocationSelectorModal from "@/components/layout/LocationSelectorModal";

const CROPS = [
  "Tomato",
  "Onion",
  "Potato",
  "Pomegranate",
  "Green Chilli",
  "Soyabean",
  "Cotton",
  "Wheat",
  "Maize",
  "Ginger",
  "Garlic",
  "Turmeric",
  "Chickpea",
  "Banana",
  "Grapes",
  "All",
];

const RADIUS_OPTIONS = [
  { label: "50 km", value: 50 },
  { label: "100 km", value: 100 },
  { label: "200 km", value: 200 },
  { label: "300 km", value: 300 },
  { label: "All India (सर्व भारत)", value: 9999 },
];

type SortOption = "nearest" | "price" | "net" | "freshness";

export default function MarketPricesPage() {
  const {
    farmLocation,
    fetchRealTimeMandiPrices,
    language,
    searchRadiusKm,
    setSearchRadiusKm,
  } = useAppStore();

  const t = translations[language] || translations.en;
  const isMr = language === "mr";
  const isHi = language === "hi";

  const [selectedCrop, setSelectedCrop] = useState("Tomato");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("nearest");
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  // Dynamic cost calculator state
  const [quantityKg, setQuantityKg] = useState(500);
  const [freightPerKm, setFreightPerKm] = useState(15);
  const [handlingFee, setHandlingFee] = useState(180);
  const [packagingFee, setPackagingFee] = useState(150);
  const [commissionPct, setCommissionPct] = useState(5);
  const [spoilagePct, setSpoilagePct] = useState(2);
  const [fpoFeePct, setFpoFeePct] = useState(1.5);

  // Calculate dynamic nearby mandis from farmer coordinates if available
  const farmerLat = farmLocation?.lat || 19.2608; // default to Parbhani
  const farmerLng = farmLocation?.lng || 76.7748;

  const dynamicData = calculateDynamicMandisForLocation(
    farmerLat,
    farmerLng,
    selectedCrop,
    undefined,
    searchRadiusKm,
    sortBy,
    quantityKg
  );

  const displayMandis = dynamicData.mandis;

  const [selectedMandiId, setSelectedMandiId] = useState<string>(
    displayMandis[0]?.id || ""
  );

  const activeMandi =
    displayMandis.find((m) => m.id === selectedMandiId) || displayMandis[0] || null;

  // Complete Itemized Net Realization Calculation
  const calculateNet = (mandi: MandiPrice | null, pricePerQtl: number) => {
    if (!mandi) {
      return {
        grossValue: 0,
        freight: 0,
        handling: 0,
        packaging: 0,
        commission: 0,
        spoilageLoss: 0,
        fpoFee: 0,
        totalDeductions: 0,
        netTotal: 0,
        netPerQtl: 0,
      };
    }
    const qtl = quantityKg / 100;
    const grossValue = pricePerQtl * qtl;
    const freight = freightPerKm * mandi.distanceKm;
    const handling = handlingFee;
    const packaging = packagingFee;
    const commission = grossValue * (commissionPct / 100);
    const spoilageLoss = grossValue * (spoilagePct / 100);
    const fpoFee = grossValue * (fpoFeePct / 100);
    const totalDeductions =
      freight + handling + packaging + commission + spoilageLoss + fpoFee;
    const netTotal = Math.max(0, grossValue - totalDeductions);
    const netPerQtl = qtl > 0 ? netTotal / qtl : 0;

    return {
      grossValue,
      freight,
      handling,
      packaging,
      commission,
      spoilageLoss,
      fpoFee,
      totalDeductions,
      netTotal,
      netPerQtl,
    };
  };

  const selectedCalc = calculateNet(activeMandi, activeMandi?.modalPrice || 0);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchRealTimeMandiPrices(selectedCrop);
    setIsRefreshing(false);
    toast.success(isMr ? "बाजार दर अद्यतन केले" : "Mandi Price Feed Updated", {
      description: isMr
        ? `${selectedCrop} साठी अधिकृत AGMARKNET / MSAMB दर लोड झाले.`
        : `Loaded authentic AGMARKNET / MSAMB records for ${selectedCrop}.`,
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header & Location Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t.market.title}</h1>
          <p className="text-slate-500 text-sm">
            {isMr
              ? "भारतातील कोणत्याही शेत स्थानावरून थेट अंतर, अचूक वाहतूक खर्च व निव्वळ प्राप्तीची तुलना"
              : "Compare dynamic APMC mandis, real distances, itemized transit deductions, and net realization across India."}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isRefreshing ? "animate-spin" : ""}`} />
            {isRefreshing ? "..." : isMr ? "दर ताजे करा" : t.market.liveFeed}
          </Button>
        </div>
      </div>

      {/* Location Status Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-emerald-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
            <MapPin className="w-4 h-4 text-emerald-700" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
              <span>
                {isMr ? "शेत स्थान:" : isHi ? "खेत का स्थान:" : "Farm Location:"}{" "}
                <span className="text-emerald-800">
                  {farmLocation ? farmLocation.label : "Parbhani, Maharashtra (Default Demo)"}
                </span>
              </span>
              <Badge
                variant="outline"
                className="bg-emerald-50 text-emerald-800 border-emerald-300 text-[10px] py-0"
              >
                {farmLocation ? farmLocation.accuracy : "Demo Location"}
              </Badge>
            </div>
            <div className="text-[11px] text-slate-500">
              {dynamicData.autoExpanded ? (
                <span className="text-amber-700 font-medium">
                  {isMr
                    ? `लगतच्या भागात मंडया कमी असल्याने शोध क्षेत्र आपोआप ${dynamicData.effectiveRadiusKm} किमी पर्यंत वाढवले.`
                    : `Auto-expanded search radius to ${dynamicData.effectiveRadiusKm} km to discover competitive buyers.`}
                </span>
              ) : (
                <span>
                  {isMr
                    ? `सक्रिय शोध त्रिज्या: ${searchRadiusKm} किमी`
                    : `Active search radius: ${searchRadiusKm} km`}
                </span>
              )}
            </div>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsLocationModalOpen(true)}
          className="text-xs shrink-0 self-start sm:self-auto border-slate-300 text-slate-700 hover:bg-slate-50"
        >
          <Navigation className="w-3.5 h-3.5 mr-1 text-emerald-700" />
          {isMr ? "स्थान बदला" : isHi ? "स्थान बदलें" : "Change Location"}
        </Button>
      </div>

      {/* Multi-Crop Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-xs font-semibold text-slate-500 flex items-center gap-1 shrink-0">
          <Sprout className="w-3.5 h-3.5 text-emerald-700" /> {t.market.commodity}
        </span>
        {CROPS.map((crop) => {
          const isActive = selectedCrop === crop;
          const translatedCrop = t.market.crops[crop] || crop;
          return (
            <button
              key={crop}
              onClick={() => {
                setSelectedCrop(crop);
                setSelectedMandiId("");
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors shrink-0 cursor-pointer ${
                isActive
                  ? "bg-emerald-700 text-white shadow-xs"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {translatedCrop}
            </button>
          );
        })}
      </div>

      {/* Filter & Sorting Toolbar */}
      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Radius Filter */}
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-600 flex items-center gap-1">
            <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-700" />
            {isMr ? "शोध त्रिज्या:" : "Search Radius:"}
          </span>
          <select
            value={searchRadiusKm}
            onChange={(e) => setSearchRadiusKm(parseInt(e.target.value, 10))}
            className="bg-white border border-slate-300 rounded-md p-1.5 text-xs font-medium text-slate-800"
          >
            {RADIUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Sorting Selector */}
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-600 flex items-center gap-1">
            <ArrowUpDown className="w-3.5 h-3.5 text-emerald-700" />
            {isMr ? "क्रमवारी:" : "Sort by:"}
          </span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="bg-white border border-slate-300 rounded-md p-1.5 text-xs font-medium text-slate-800"
          >
            <option value="nearest">
              {isMr ? "जवळची मंडी (Nearest)" : "Nearest mandi"}
            </option>
            <option value="price">
              {isMr ? "सर्वोच्च बाजारभाव (Highest Price)" : "Highest modal price"}
            </option>
            <option value="net">
              {isMr ? "सर्वोत्तम अंदाजे निव्वळ प्राप्ती (Best Net)" : "Best estimated net outcome"}
            </option>
            <option value="freshness">
              {isMr ? "ताजा बाजार अपडेट (Latest Update)" : "Latest market update"}
            </option>
          </select>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Mandi Cards List */}
        <div className="lg:col-span-2 space-y-4">
          {displayMandis.map((mandi, idx) => {
            const calc = calculateNet(mandi, mandi.modalPrice);
            const isSelected = activeMandi?.id === mandi.id;
            const isBestNet = idx === 0 && sortBy === "net";

            return (
              <Card
                key={mandi.id}
                className={`cursor-pointer transition-all border-slate-200 ${
                  isSelected
                    ? "border-emerald-600 ring-2 ring-emerald-600/20 shadow-md bg-emerald-50/20"
                    : "hover:border-slate-300 hover:shadow-xs"
                }`}
                onClick={() => setSelectedMandiId(mandi.id)}
              >
                <CardContent className="p-0">
                  <div className="p-5 flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="font-bold text-lg text-slate-900">{mandi.mandi}</h3>
                        {isBestNet && (
                          <Badge className="bg-emerald-100 text-emerald-800 border-none text-[10px]">
                            {isMr ? "सर्वोत्तम निव्वळ प्राप्ती" : "Best estimated net outcome"}
                          </Badge>
                        )}
                        <Badge
                          variant="outline"
                          className="text-[10px] text-emerald-700 border-emerald-300 bg-emerald-50 flex items-center gap-1 font-semibold"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                          {mandi.dataStatus === "Cached" || mandi.dataStatus === "Stale"
                            ? mandi.dataStatus
                            : "Live APMC"}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1 font-medium text-emerald-700">
                          <Truck className="w-3.5 h-3.5" /> {mandi.distanceKm} km
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />{" "}
                          {formatTravelTime(
                            mandi.travelTimeHours || mandi.distanceKm / 40
                          )}
                        </span>
                        <span>•</span>
                        <span>
                          {mandi.district}, {mandi.state || "Maharashtra"}
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-400 mt-1.5">
                        {isMr
                          ? `वाण: ${mandi.variety} • स्रोत: ${mandi.source}`
                          : `Variety: ${mandi.variety} • Source: ${mandi.source}`}
                      </div>
                    </div>

                    <div className="text-right sm:self-center">
                      <div className="text-2xl font-extrabold text-slate-900">
                        ₹{mandi.modalPrice}
                      </div>
                      <div className="text-[10px] text-slate-500 uppercase font-semibold">
                        {t.market.modalPrice}
                      </div>
                    </div>
                  </div>

                  {/* Net take-home footer line */}
                  <div className="bg-slate-50 p-3.5 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs">
                    <span className="text-slate-600">
                      {t.market.range}: ₹{mandi.minPrice} - ₹{mandi.maxPrice}/qtl |{" "}
                      {t.market.arrivals}: {mandi.arrivalsQtl} qtl
                    </span>
                    <span className="font-bold text-emerald-700 text-sm">
                      {isMr ? "अंदाजे हाती:" : "Est. Take-Home:"} ₹
                      {Math.round(calc.netPerQtl)}/qtl
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {displayMandis.length === 0 && (
            <Card className="border-dashed border-slate-300 p-8 text-center text-slate-500 text-xs">
              <Info className="w-8 h-8 mx-auto mb-2 text-slate-400" />
              <p className="font-semibold text-slate-700 text-sm">
                {isMr
                  ? `${selectedCrop} साठी या त्रिजेत थेट बाजार दर उपलब्ध नाहीत`
                  : `No Mandi Prices Available for ${selectedCrop} in this radius`}
              </p>
              <p className="mt-1 mb-4 text-slate-500">
                {isMr
                  ? "कृपया शोध त्रिज्या वाढवा किंवा वाण बदला."
                  : "Try expanding your search radius to 200 km or 300 km to find regional APMCs."}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSearchRadiusKm(300)}
                className="text-xs"
              >
                {isMr ? "शोध क्षेत्र ३०० किमी करा" : "Expand Radius to 300 km"}
              </Button>
            </Card>
          )}

          {/* Mandatory Net Realization Advisory Note */}
          <div className="bg-amber-50 border border-amber-200 text-amber-900 text-xs p-4 rounded-xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0 text-amber-700 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold">
                {isMr
                  ? "महत्त्वाची दक्षता व वास्तववादी नफा सल्ला:"
                  : "Critical Advisory & Net Realization Notice:"}
              </p>
              <p className="leading-relaxed text-amber-800">
                {isMr
                  ? "“हा निव्वळ अंदाज आहे. मालाचा दर्जा, बाजारातील मागणी, आवक आणि खरेदीदाराच्या अटींनुसार अंतिम दर बदलू शकतो.” आम्ही 'सर्वोत्तम अंदाजे निव्वळ प्राप्ती' सादर करतो, कोणतीही खोटी 'हमी' देत नाही."
                  : "“This is an estimate. Final price may change based on quality, market demand, quantity, and buyer conditions.” We calculate the 'Best estimated net outcome' taking into account all real freight and handling deductions."}
              </p>
            </div>
          </div>
        </div>

        {/* Cost Deduction Calculator Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6 border-slate-200 shadow-sm">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <IndianRupee className="w-4 h-4 text-emerald-700" /> {t.market.calculatorTitle}
              </CardTitle>
              <CardDescription className="text-xs">
                {t.market.calculatorSubtitle} <strong>{activeMandi?.mandi || "Select Mandi"}</strong>
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
                <Label className="text-[11px] text-slate-600">
                  {t.market.freightRate} (₹/km for vehicle)
                </Label>
                <Input
                  type="number"
                  value={freightPerKm}
                  onChange={(e) => setFreightPerKm(Math.max(0, parseInt(e.target.value) || 0))}
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

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-[11px] text-slate-600">
                    {t.market.apmcCommission} (%)
                  </Label>
                  <Input
                    type="number"
                    value={commissionPct}
                    onChange={(e) => setCommissionPct(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px] text-slate-600">FPO Fee (%)</Label>
                  <Input
                    type="number"
                    value={fpoFeePct}
                    step="0.5"
                    onChange={(e) => setFpoFeePct(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="h-8 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-[11px] text-slate-600">{t.market.spoilageBuffer} (%)</Label>
                <Input
                  type="number"
                  value={spoilagePct}
                  onChange={(e) => setSpoilagePct(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="h-8 text-xs"
                />
              </div>

              {/* Itemized Deductions Breakdown */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100 text-slate-600 text-[11px]">
                <div className="flex justify-between">
                  <span>
                    {t.market.grossValue} ({quantityKg} kg @ ₹{activeMandi?.modalPrice || 0}/qtl):
                  </span>
                  <span className="font-semibold text-slate-900">
                    ₹{Math.round(selectedCalc.grossValue)}
                  </span>
                </div>
                <div className="flex justify-between text-red-600">
                  <span>
                    {t.market.freight} ({activeMandi?.distanceKm || 0} km x ₹{freightPerKm}):
                  </span>
                  <span>-₹{Math.round(selectedCalc.freight)}</span>
                </div>
                <div className="flex justify-between text-red-600">
                  <span>{t.market.handling}:</span>
                  <span>-₹{handlingFee}</span>
                </div>
                <div className="flex justify-between text-red-600">
                  <span>{t.market.cratesPackaging}:</span>
                  <span>-₹{packagingFee}</span>
                </div>
                <div className="flex justify-between text-red-600">
                  <span>
                    {t.market.commission} ({commissionPct}%):
                  </span>
                  <span>-₹{Math.round(selectedCalc.commission)}</span>
                </div>
                <div className="flex justify-between text-red-600">
                  <span>
                    {isMr ? "अपेक्षित घट/नुकसान" : "Expected Loss"} ({spoilagePct}%):
                  </span>
                  <span>-₹{Math.round(selectedCalc.spoilageLoss)}</span>
                </div>
                <div className="flex justify-between text-red-600">
                  <span>FPO Fee ({fpoFeePct}%):</span>
                  <span>-₹{Math.round(selectedCalc.fpoFee)}</span>
                </div>
              </div>

              {/* Multi-Scenario Projections: Low / Expected / High */}
              <div className="pt-2 border-t border-slate-100">
                <div className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  {isMr
                    ? "संभाव्य प्राप्ती परिस्थिती (किमान / अपेक्षित / कमाल)"
                    : "Realization Projections (Low / Expected / High)"}
                </div>
                <div className="grid grid-cols-3 gap-1.5 text-center text-[10px]">
                  {/* Low Outcome */}
                  <div className="bg-slate-50 p-1.5 rounded border border-slate-200">
                    <span className="text-slate-500 block text-[9px]">
                      {isMr ? "किमान (Low)" : "Low"} (₹{activeMandi?.minPrice || 0})
                    </span>
                    <strong className="text-slate-800 text-[11px]">
                      ₹
                      {Math.round(
                        calculateNet(activeMandi, activeMandi?.minPrice || 0).netTotal
                      )}
                    </strong>
                    <span className="text-[9px] text-slate-500 block">
                      ₹
                      {Math.round(
                        calculateNet(activeMandi, activeMandi?.minPrice || 0).netPerQtl
                      )}
                      /qtl
                    </span>
                  </div>

                  {/* Expected Outcome */}
                  <div className="bg-emerald-50 p-1.5 rounded border border-emerald-200">
                    <span className="text-emerald-800 font-semibold block text-[9px]">
                      {isMr ? "अपेक्षित (Modal)" : "Expected"} (₹
                      {activeMandi?.modalPrice || 0})
                    </span>
                    <strong className="text-emerald-950 text-[11px]">
                      ₹{Math.round(selectedCalc.netTotal)}
                    </strong>
                    <span className="text-[9px] text-emerald-800 block font-medium">
                      ₹{Math.round(selectedCalc.netPerQtl)}/qtl
                    </span>
                  </div>

                  {/* High Outcome */}
                  <div className="bg-slate-50 p-1.5 rounded border border-slate-200">
                    <span className="text-slate-500 block text-[9px]">
                      {isMr ? "कमाल (High)" : "High"} (₹{activeMandi?.maxPrice || 0})
                    </span>
                    <strong className="text-slate-800 text-[11px]">
                      ₹
                      {Math.round(
                        calculateNet(activeMandi, activeMandi?.maxPrice || 0).netTotal
                      )}
                    </strong>
                    <span className="text-[9px] text-slate-500 block">
                      ₹
                      {Math.round(
                        calculateNet(activeMandi, activeMandi?.maxPrice || 0).netPerQtl
                      )}
                      /qtl
                    </span>
                  </div>
                </div>
              </div>

              {/* Best Estimated Net Outcome Total */}
              <div className="pt-3 border-t border-slate-200">
                <div className="flex justify-between items-end mb-1">
                  <span className="font-bold text-slate-900 text-sm">
                    {isMr ? "सर्वोत्तम अंदाजे निव्वळ प्राप्ती:" : "Best Estimated Net Outcome:"}
                  </span>
                  <span className="text-2xl font-extrabold text-emerald-700">
                    ₹{Math.round(selectedCalc.netTotal)}
                  </span>
                </div>
                <div className="text-right text-xs text-slate-500 font-medium">
                  ₹{Math.round(selectedCalc.netPerQtl)}{" "}
                  {isMr ? "/ क्विंटल हाती निव्वळ" : "/ quintal realized"}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Location Selector Modal */}
      <LocationSelectorModal
        open={isLocationModalOpen}
        onOpenChange={setIsLocationModalOpen}
      />
    </div>
  );
}
