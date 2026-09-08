"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Camera,
  ArrowRight,
  IndianRupee,
  Layers,
  Sprout,
  MapPin,
  Navigation,
  Search,
  Map as MapIcon,
  Clock,
  Truck,
  TrendingUp,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { translations } from "@/lib/i18n";
import LocationSelectorModal from "@/components/layout/LocationSelectorModal";
import DynamicFarmMandiMap from "@/components/dashboard/DynamicFarmMandiMap";
import { calculateDynamicMandisForLocation } from "@/lib/agricultural-data";
import { formatTravelTime } from "@/lib/geo-locations";
import { MandiPrice } from "@/lib/types";

export default function FarmerDashboard() {
  const {
    currentUser,
    farmLocation,
    isOffline,
    lots,
    pools,
    language,
    searchRadiusKm,
  } = useAppStore();

  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [selectedCrop, setSelectedCrop] = useState("Tomato");
  const [selectedMandiId, setSelectedMandiId] = useState<string | undefined>(undefined);

  const t = translations[language] || translations.en;
  const isMr = language === "mr";
  const isHi = language === "hi";

  if (!currentUser) return null;

  const myLots = lots.filter((l) => l.farmerId === currentUser.id);

  // If farmerLocation is selected, dynamically compute nearby mandis from real coordinates
  const dynamicResult = farmLocation
    ? calculateDynamicMandisForLocation(
        farmLocation.lat,
        farmLocation.lng,
        selectedCrop,
        undefined,
        searchRadiusKm,
        "nearest"
      )
    : null;

  const nearbyMandis = dynamicResult?.mandis || [];
  const activeMandi =
    nearbyMandis.find((m) => m.id === selectedMandiId) || nearbyMandis[0] || null;

  // Calculate best estimated net realization for the active nearby market
  const calculateBestNet = (mandi: MandiPrice | null) => {
    if (!mandi) return { netPerQtl: 0, mandiName: "" };
    // Standard 500kg batch estimate
    const dist = mandi.distanceKm;
    const freightPaisePerQtl = (15 * dist) / 5; // 15/km for 5 qtl = 3/qtl/km
    const handlingPaisePerQtl = (180 + 150) / 5; // ~66/qtl
    const commissionPaise = mandi.modalPrice * 0.05;
    const spoilagePaise = mandi.modalPrice * 0.02;
    const totalDeductions = freightPaisePerQtl + handlingPaisePerQtl + commissionPaise + spoilagePaise;
    const net = Math.max(0, Math.round(mandi.modalPrice - totalDeductions));
    return { netPerQtl: net, mandiName: mandi.mandi };
  };

  const bestNetOutcome = calculateBestNet(activeMandi || nearbyMandis[0]);

  // Find matching FPO pool for this crop and location
  const matchingPool =
    pools.find((p) =>
      farmLocation
        ? p.collectionHub.toLowerCase().includes(farmLocation.district.toLowerCase()) ||
          p.destinationMandi.toLowerCase().includes(farmLocation.district.toLowerCase())
        : false
    ) ||
    pools.find((p) => p.crop.toLowerCase().includes(selectedCrop.toLowerCase())) ||
    pools[0];

  const poolHubName = farmLocation
    ? `${farmLocation.district} FPO Hub → ${matchingPool?.destinationMandi || "Terminal Mandi"}`
    : matchingPool?.collectionHub || "Regional FPO Consolidation Hub";

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Greeting & Start Selling Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {t.farmer.greeting}, {currentUser.name.split(" ")[0]} 👋
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm flex flex-wrap items-center gap-1.5 mt-0.5">
            {isOffline ? (
              <span className="text-amber-700 font-medium">{t.farmer.offlineStatus}</span>
            ) : (
              <>
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <span className="font-semibold text-emerald-700">
                  {isMr
                    ? `ऑनलाइन • थेट ${farmLocation ? farmLocation.district + " APMC" : "सर्व APMC"} जोडणी सक्रिय`
                    : isHi
                    ? `ऑनलाइन • लाइव ${farmLocation ? farmLocation.district + " APMC" : "सभी APMC"} कनेक्टेड`
                    : `Online • Real-Time ${farmLocation ? farmLocation.district + " APMC" : "National APMC"} Connected`}
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-500 text-[11px] font-medium">
                  {isMr ? "थेट बाजार दर अद्ययावत" : "Live Market Feed Active"}
                </span>
              </>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/farmer/grade">
            <Button className="bg-emerald-700 hover:bg-emerald-800 text-white w-full md:w-auto text-xs sm:text-sm shadow-xs font-semibold">
              <Camera className="w-4 h-4 mr-2" /> {t.farmer.startSelling}
            </Button>
          </Link>
        </div>
      </div>

      {/* LOCATION STATUS LINE / ONBOARDING GATE */}
      {farmLocation ? (
        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-emerald-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-slate-900">
                  {isMr ? "सध्याचे शेत स्थान:" : isHi ? "वर्तमान खेत का स्थान:" : "Current Farm Location:"}{" "}
                  <span className="text-emerald-800">{farmLocation.label}</span>
                </span>
                <Badge
                  variant="outline"
                  className="bg-emerald-50 text-emerald-800 border-emerald-300 text-[10px] py-0"
                >
                  {isMr ? "अचूकता: " : "Accuracy: "}
                  {farmLocation.accuracy}
                </Badge>
              </div>
              <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                <span>
                  {farmLocation.lat.toFixed(4)}° N, {farmLocation.lng.toFixed(4)}° E
                </span>
                <span>•</span>
                <span>{isMr ? "अपडेट: नुकतेच" : "Last updated: just now"}</span>
                <span>•</span>
                <span>
                  {dynamicResult?.autoExpanded ? (
                    <span className="text-amber-700 font-medium">
                      {isMr
                        ? `(शोध क्षेत्र आपोआप ${dynamicResult.effectiveRadiusKm} किमी पर्यंत वाढवले)`
                        : `(Auto-expanded to ${dynamicResult.effectiveRadiusKm} km)`}
                    </span>
                  ) : (
                    <span>{searchRadiusKm} km radius</span>
                  )}
                </span>
              </div>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsLocationModalOpen(true)}
            className="text-xs shrink-0 self-start sm:self-auto border-slate-300 hover:bg-slate-50 text-slate-700"
          >
            <Navigation className="w-3.5 h-3.5 mr-1 text-emerald-700" />
            {isMr ? "स्थान बदला" : isHi ? "स्थान बदलें" : "Change Location"}
          </Button>
        </div>
      ) : (
        /* Prominent Onboarding Card when NO location is set */
        <Card className="border-2 border-dashed border-emerald-300 bg-emerald-50/50">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {isMr
                      ? "तुमचे शेताचे किंवा माल संकलनाचे स्थान निवडा"
                      : isHi
                      ? "अपने खेत या माल संकलन का स्थान चुनें"
                      : "Where is your farm or collection location?"}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl">
                    {isMr
                      ? "परभणी, नाशिक, पुणे, सोलापूर, नागपूर किंवा कोणत्याही भारतीय गावातील जवळचे बाजार, थेट अंतर आणि सर्वोत्तम निव्वळ नफा पाहण्यासाठी स्थान निश्चित करा."
                      : isHi
                      ? "परभणी, नासिक, पुणे, सोलापुर, नागपुर या किसी भी भारतीय गांव से नजदीकी मंडियां और शुद्ध आय देखने के लिए स्थान सेट करें।"
                      : "Find nearby mandis dynamically for Parbhani, Nashik, Pune, Baramati, Solapur, Nagpur, Latur, or any location across India."}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <Badge variant="outline" className="bg-white text-slate-700 text-xs py-1">
                      📍 {isMr ? "कोणतेही भारतीय गाव / तालुका" : "Any Indian Village / Taluka"}
                    </Badge>
                    <Badge variant="outline" className="bg-white text-slate-700 text-xs py-1">
                      🚚 {isMr ? "अचूक वाहतूक अंतर" : "Dynamic Haversine Distance"}
                    </Badge>
                    <Badge variant="outline" className="bg-white text-slate-700 text-xs py-1">
                      💰 {isMr ? "खर्च वजा निव्वळ प्राप्ती" : "Net Realization Engine"}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto shrink-0">
                <Button
                  onClick={() => setIsLocationModalOpen(true)}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-bold shadow-md"
                >
                  <Navigation className="w-4 h-4 mr-2" />
                  {isMr ? "बाजार शोधा (स्थान निवडा)" : "Find Markets Near Me"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Metrics Row: Only show real market realizations once location is selected */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-slate-200">
          <CardContent className="p-5">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <p className="text-xs font-semibold text-slate-500">
                {isMr ? "सर्वोत्तम अंदाजे निव्वळ प्राप्ती" : t.farmer.bestNet}
              </p>
              <IndianRupee className="w-4 h-4 text-emerald-600" />
            </div>
            {farmLocation && bestNetOutcome.netPerQtl > 0 ? (
              <>
                <div className="text-2xl font-extrabold text-slate-900">
                  ₹{bestNetOutcome.netPerQtl.toLocaleString()}
                  <span className="text-xs font-normal text-slate-500">/qtl</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 truncate">
                  {selectedCrop} • {bestNetOutcome.mandiName}
                </p>
              </>
            ) : (
              <>
                <div className="text-lg font-bold text-slate-400">
                  {isMr ? "स्थान निवडा" : "Select Location"}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  {isMr ? "बाजार दर मोजण्यासाठी" : "To calculate dynamic net"}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="p-5">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <p className="text-xs font-semibold text-slate-500">{t.farmer.cropGrade}</p>
              <Sprout className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-extrabold text-emerald-700">Grade A</div>
            <p className="text-[11px] text-slate-500 mt-1">{t.farmer.externalAIEstimate}</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="p-5">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <p className="text-xs font-semibold text-slate-500">{t.farmer.poolProgress}</p>
              <Layers className="w-4 h-4 text-amber-600" />
            </div>
            {matchingPool ? (
              <>
                <div className="text-2xl font-extrabold text-slate-900">
                  {matchingPool.currentKg}{" "}
                  <span className="text-xs font-normal text-slate-500">
                    / {matchingPool.targetKg} kg
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
                  <div
                    className="bg-amber-500 h-1.5 rounded-full"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.round((matchingPool.currentKg / matchingPool.targetKg) * 100)
                      )}%`,
                    }}
                  />
                </div>
                <p className="text-[10px] text-slate-500 font-medium mt-1 truncate">
                  📍 {poolHubName}
                </p>
              </>
            ) : (
              <div className="text-sm font-semibold text-slate-500">650 / 1000 kg</div>
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="p-5">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <p className="text-xs font-semibold text-slate-500">{t.farmer.pendingPayout}</p>
              <IndianRupee className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900">₹8,420</div>
            <p className="text-[11px] text-emerald-700 font-medium mt-1">{t.farmer.releasedNodal}</p>
          </CardContent>
        </Card>
      </div>

      {/* Dynamic Interactive Farm & Mandi Map (When Location is active) */}
      {farmLocation && nearbyMandis.length > 0 && (
        <Card className="border-slate-200 overflow-hidden shadow-xs">
          <CardHeader className="pb-2 border-b border-slate-100 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Navigation className="w-4 h-4 text-emerald-700" />
                {isMr ? "नकाशा व जवळचे बाजार" : "Farm & Nearby Mandi Map"}
              </CardTitle>
              <CardDescription className="text-xs">
                {isMr
                  ? `${farmLocation.label} पासूनचे थेट अंतर, वाहतूक वेळ व बाजार मार्ग`
                  : `Dynamic routes and travel times originating from ${farmLocation.label}`}
              </CardDescription>
            </div>
            <Badge
              variant="outline"
              className="text-xs text-emerald-700 border-emerald-300 bg-emerald-50 hidden sm:inline-flex"
            >
              {nearbyMandis.length} {isMr ? "जवळच्या मंडया" : "Mandis Found"}
            </Badge>
          </CardHeader>
          <CardContent className="p-4">
            <DynamicFarmMandiMap
              farmLocation={farmLocation}
              mandis={nearbyMandis}
              selectedMandiId={activeMandi?.id}
              onSelectMandi={(m) => setSelectedMandiId(m.id)}
              language={language as "mr" | "hi" | "en"}
            />
          </CardContent>
        </Card>
      )}

      {/* Market Journey Stepper */}
      <div className="bg-emerald-50 rounded-xl p-4 md:p-5 border border-emerald-200">
        <h3 className="font-semibold text-emerald-950 text-xs uppercase tracking-wider mb-3">
          {t.farmer.journeyTitle}
        </h3>
        <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-emerald-800">
          <Badge className="bg-emerald-700 text-white border-none">{t.farmer.journey1}</Badge>
          <ArrowRight className="w-3.5 h-3.5 text-emerald-600" />
          <Badge variant="outline" className="bg-white text-emerald-800 border-emerald-300">{t.farmer.journey2}</Badge>
          <ArrowRight className="w-3.5 h-3.5 text-emerald-600" />
          <Badge variant="outline" className="bg-white text-emerald-800 border-emerald-300">{t.farmer.journey3}</Badge>
          <ArrowRight className="w-3.5 h-3.5 text-emerald-600" />
          <Badge variant="outline" className="bg-white text-emerald-800 border-emerald-300">{t.farmer.journey4}</Badge>
          <ArrowRight className="w-3.5 h-3.5 text-emerald-600" />
          <Badge variant="outline" className="bg-white text-emerald-800 border-emerald-300">{t.farmer.journey5}</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Lots */}
        <Card className="lg:col-span-2 border-slate-200">
          <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold">{t.farmer.recentLots}</CardTitle>
              <CardDescription className="text-xs">{t.farmer.lotsDescription}</CardDescription>
            </div>
            <Link href="/farmer/orders">
              <Button variant="ghost" size="sm" className="text-xs text-emerald-700">
                {t.farmer.viewAllOrders}
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
                        ? "bg-emerald-100 text-emerald-800 border-none text-[10px]"
                        : "bg-slate-100 text-slate-700 border-none text-[10px]"
                    }
                  >
                    {lot.status}
                  </Badge>
                  <span className="text-xs font-semibold text-emerald-700">{lot.grade}</span>
                </div>
              </div>
            ))}
            {myLots.length === 0 && (
              <div className="text-center p-6 text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-200 text-xs">
                {t.farmer.noLots}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dynamic Nearby Mandis Card */}
        <Card className="border-slate-200">
          <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold">{t.farmer.nearbyMandis}</CardTitle>
              <CardDescription className="text-xs">
                {farmLocation
                  ? isMr
                    ? `${farmLocation.label.split(",")[0]} जवळील थेट बाजार`
                    : `Near ${farmLocation.label.split(",")[0]}`
                  : t.farmer.dailyRates}
              </CardDescription>
            </div>
            <Link href="/farmer/market">
              <Button variant="ghost" size="sm" className="text-xs text-emerald-700">
                {isMr ? "सर्व पहा" : "View All"}
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-4 space-y-3.5">
            {farmLocation && nearbyMandis.length > 0 ? (
              nearbyMandis.slice(0, 4).map((mandi) => {
                const isSelected = activeMandi?.id === mandi.id;
                return (
                  <div
                    key={mandi.id}
                    onClick={() => setSelectedMandiId(mandi.id)}
                    className={`p-2.5 rounded-lg border cursor-pointer transition-all flex justify-between items-center ${
                      isSelected
                        ? "bg-emerald-50/70 border-emerald-300 ring-1 ring-emerald-400"
                        : "border-slate-100 hover:bg-slate-50"
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-sm text-slate-900 flex items-center gap-1.5">
                        {mandi.mandi}
                        <Badge
                          variant="outline"
                          className="text-[9px] text-slate-500 border-slate-200 px-1 py-0"
                        >
                          {mandi.dataStatus || "Demo"}
                        </Badge>
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                        <span className="flex items-center gap-0.5 text-emerald-700 font-medium">
                          <Truck className="w-3 h-3" /> {mandi.distanceKm} km
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-0.5">
                          <Clock className="w-3 h-3" />{" "}
                          {formatTravelTime(
                            mandi.travelTimeHours || mandi.distanceKm / 40
                          )}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-emerald-700 text-base">
                        ₹{mandi.modalPrice}
                        <span className="text-[10px] text-slate-400 font-normal">/qtl</span>
                      </div>
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">
                        {mandi.crop}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : farmLocation ? (
              <div className="text-center p-6 text-slate-500 text-xs bg-slate-50 rounded-lg">
                {isMr
                  ? "या परिसरात सध्या कोणतेही बाजार सापडले नाहीत. कृपया त्रिज्या वाढवा."
                  : "No mandis found within active radius. Try expanding search radius."}
              </div>
            ) : (
              <div className="text-center p-6 text-slate-500 text-xs bg-slate-50 rounded-lg border border-dashed border-slate-200">
                <MapPin className="w-6 h-6 mx-auto mb-2 text-slate-400" />
                <p className="font-semibold text-slate-700">
                  {isMr ? "स्थान निश्चित केलेले नाही" : "No Farm Location Set"}
                </p>
                <p className="text-slate-500 mt-1 mb-3">
                  {isMr
                    ? "आपल्या भागातील दर पाहण्यासाठी स्थान निवडा"
                    : "Select your farm location to discover nearby mandis."}
                </p>
                <Button
                  size="sm"
                  onClick={() => setIsLocationModalOpen(true)}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs"
                >
                  <Navigation className="w-3.5 h-3.5 mr-1" />
                  {isMr ? "स्थान निवडा" : "Select Location"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Advisory Disclaimer */}
      <div className="text-center text-xs text-slate-400 pb-4">
        {t.farmer.footerDisclaimer}
      </div>

      {/* Location Selector Modal */}
      <LocationSelectorModal
        open={isLocationModalOpen}
        onOpenChange={setIsLocationModalOpen}
      />
    </div>
  );
}
