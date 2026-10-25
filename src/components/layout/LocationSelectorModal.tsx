"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MapPin, Navigation, Search, Map as MapIcon, Check, Loader2, AlertCircle, Edit3, Compass } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { FarmLocation } from "@/lib/types";
import {
  searchIndianLocations,
  reverseGeocodeLocation,
  INDIAN_AGRICULTURAL_PLACES,
  PlaceRecord,
} from "@/lib/geo-locations";
import { toast } from "sonner";

interface LocationSelectorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLocationSelected?: (location: FarmLocation) => void;
}

type Mode = "select_method" | "gps_confirm" | "search" | "map_picker";

export default function LocationSelectorModal({
  open,
  onOpenChange,
  onLocationSelected,
}: LocationSelectorModalProps) {
  const { farmLocation, setFarmLocation, language } = useAppStore();
  const [mode, setMode] = useState<Mode>("select_method");
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [gpsPendingLocation, setGpsPendingLocation] = useState<FarmLocation | null>(null);
  const [isEditingGps, setIsEditingGps] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const searchResults = searchIndianLocations(searchQuery, 8);

  // Map picker state
  const [pickerCoords, setPickerCoords] = useState<{ lat: number; lng: number }>({
    lat: farmLocation?.lat || 19.2608, // default to Parbhani
    lng: farmLocation?.lng || 76.7748,
  });
  const [isGeocodingMap, setIsGeocodingMap] = useState(false);

  const isMr = language === "mr";
  const isHi = language === "hi";

  // Handle GPS detection
  const handleUseCurrentLocation = () => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      toast.error(
        isMr
          ? "आपल्या ब्राउझरमध्ये GPS समर्थित नाही. कृपया खाली शोध वापरा."
          : isHi
          ? "आपके ब्राउज़र में जीपीएस समर्थित नहीं है। कृपया खोज का उपयोग करें।"
          : "Geolocation is not supported by your browser. Please search manually."
      );
      setMode("search");
      return;
    }

    setIsDetectingGps(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const detected = await reverseGeocodeLocation(lat, lng);
          setGpsPendingLocation(detected);
          setIsDetectingGps(false);
          setMode("gps_confirm");
        } catch {
          setIsDetectingGps(false);
          toast.error(
            isMr
              ? "स्थान पत्ता शोधण्यात अडचण आली. कृपया मॅन्युअल शोधा."
              : isHi
              ? "स्थान खोजने में त्रुटि। कृपया खोज का उपयोग करें।"
              : "Could not reverse geocode GPS location. Please search manually."
          );
          setMode("search");
        }
      },
      (error) => {
        setIsDetectingGps(false);
        // Error code 1 is PERMISSION_DENIED
        if (error.code === 1) {
          toast.info(
            isMr
              ? "स्थान परवानगी नाकारली. कृपया मॅन्युअल गाव किंवा जिल्हा शोधा."
              : isHi
              ? "स्थान की अनुमति अस्वीकृत। कृपया अपनी तहसील या जिला खोजें।"
              : "Location permission denied. Switching to manual place search."
          );
        } else {
          toast.error(
            isMr
              ? "GPS सिग्नल मिळाला नाही. कृपया शोध पर्याय वापरा."
              : isHi
              ? "जीपीएस सिग्नल नहीं मिला। कृपया खोजें।"
              : "GPS signal unavailable. Please use search."
          );
        }
        // Gracefully open search automatically without breaking!
        setMode("search");
      },
      {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 60000,
      }
    );
  };

  // Confirm GPS location
  const handleConfirmGpsLocation = () => {
    if (!gpsPendingLocation) return;
    setFarmLocation(gpsPendingLocation);
    if (onLocationSelected) onLocationSelected(gpsPendingLocation);
    toast.success(
      isMr
        ? `शेताचे स्थान सेट केले: ${gpsPendingLocation.label}`
        : isHi
        ? `खेत का स्थान सेट किया: ${gpsPendingLocation.label}`
        : `Farm location set: ${gpsPendingLocation.label}`
    );
    onOpenChange(false);
    setMode("select_method");
  };

  // Select place from search list
  const handleSelectPlace = (place: PlaceRecord) => {
    const loc: FarmLocation = {
      id: `LOC-${Date.now()}`,
      label: `${place.name}, ${place.district}, ${place.state}`,
      taluka: place.taluka,
      district: place.district,
      state: place.state,
      pincode: place.pincode,
      lat: place.lat,
      lng: place.lng,
      accuracy: "Medium (Pincode)",
      updatedAt: new Date().toISOString(),
    };
    setFarmLocation(loc);
    if (onLocationSelected) onLocationSelected(loc);
    toast.success(
      isMr
        ? `शेताचे स्थान निवडले: ${loc.label}`
        : isHi
        ? `खेत का स्थान चुना: ${loc.label}`
        : `Farm location selected: ${loc.label}`
    );
    onOpenChange(false);
    setMode("select_method");
  };

  // Select place on interactive map
  const handleMapClick = async (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Convert pixel position to Maharashtra bounding box
    // Lat: 15.6° N to 22.0° N (Height: 6.4°)
    // Lng: 72.6° E to 80.9° E (Width: 8.3°)
    const normX = Math.max(0, Math.min(1, clickX / rect.width));
    const normY = Math.max(0, Math.min(1, clickY / rect.height));

    const lng = 72.6 + normX * (80.9 - 72.6);
    const lat = 22.0 - normY * (22.0 - 15.6);

    setPickerCoords({ lat, lng });
    setIsGeocodingMap(true);
    const resolved = await reverseGeocodeLocation(lat, lng);
    setIsGeocodingMap(false);
    setGpsPendingLocation(resolved);
    setMode("gps_confirm");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md sm:max-w-lg p-0 overflow-hidden bg-white border-slate-200">
        <DialogHeader className="p-5 pb-3 border-b border-slate-100 bg-emerald-50/60">
          <div className="flex items-center gap-2 text-emerald-800">
            <MapPin className="w-5 h-5 text-emerald-700" />
            <DialogTitle className="text-base sm:text-lg font-bold">
              {isMr
                ? "तुमचे शेताचे किंवा माल संकलनाचे स्थान कोठे आहे?"
                : isHi
                ? "आपके खेत या संग्रह का स्थान कहाँ है?"
                : "Where is your farm or collection location?"}
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-slate-500">
            {isMr
              ? "जवळचे बाजार, थेट अंतर, वाहतूक खर्च आणि FPO पूल अचूक मोजण्यासाठी स्थान आवश्यक आहे."
              : isHi
              ? "सटीक नजदीकी मंडियां, दूरी, भाड़ा और एफपीओ पूल खोजने के लिए स्थान अनिवार्य है।"
              : "Required to accurately find nearby mandis, real distances, net realizations, and FPO pools."}
          </DialogDescription>
        </DialogHeader>

        <div className="p-5 space-y-4">
          {/* Mode 1: Selection Menu */}
          {mode === "select_method" && (
            <div className="space-y-3">
              {/* Option A: Current Location */}
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                disabled={isDetectingGps}
                className="w-full text-left p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 hover:bg-emerald-50 transition-all flex items-center justify-between group cursor-pointer shadow-xs"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    {isDetectingGps ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Navigation className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    )}
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-slate-900 flex items-center gap-2">
                      {isMr
                        ? "माझे सध्याचे स्थान वापरा"
                        : isHi
                        ? "मेरा वर्तमान स्थान उपयोग करें"
                        : "Use My Current Location"}
                      <Badge className="bg-emerald-600 text-white border-none text-[9px] px-1.5 py-0">
                        GPS
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {isDetectingGps
                        ? isMr
                          ? "GPS द्वारे अचूक स्थान तपासत आहे..."
                          : "Detecting exact latitude & longitude..."
                        : isMr
                        ? "ब्राउझर GPS द्वारे गाव, तालुका व जिल्हा आपोआप ओळखा"
                        : isHi
                        ? "ब्राउज़र जीपीएस से स्वचालित रूप से गांव और जिला पहचानें"
                        : "Auto-detect village, taluka, and district via browser GPS"}
                    </p>
                  </div>
                </div>
              </button>

              {/* Option B: Search Village / Taluka / District / Pincode */}
              <button
                type="button"
                onClick={() => setMode("search")}
                className="w-full text-left p-4 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 transition-all flex items-center justify-between group cursor-pointer shadow-xs"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 border border-blue-100">
                    <Search className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-slate-900">
                      {isMr
                        ? "गाव / तालुका / जिल्हा / पिनकोड शोधा"
                        : isHi
                        ? "गांव / तहसील / जिला / पिनकोड खोजें"
                        : "Search Village / Taluka / District / Pincode"}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {isMr
                        ? "उदा. परभणी, गंगाखेड, नाशिक, बारामती, पुणे, लातूर किंवा पिनकोड"
                        : isHi
                        ? "उदा. परभणी, गंगाखेड, नासिक, बारामती, पुणे, लातूर या पिनकोड"
                        : "e.g. Parbhani, Gangakhed, Nashik, Baramati, Pune, Latur, 431401"}
                    </p>
                  </div>
                </div>
              </button>

              {/* Option C: Choose on Map */}
              <button
                type="button"
                onClick={() => setMode("map_picker")}
                className="w-full text-left p-4 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 transition-all flex items-center justify-between group cursor-pointer shadow-xs"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 border border-amber-100">
                    <MapIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-slate-900">
                      {isMr ? "नकाशावर निवडा" : isHi ? "मानचित्र पर चुनें" : "Choose on Map"}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {isMr
                        ? "नकाशावर कुठेही क्लिक करून अचूक शेताचे स्थान निश्चित करा"
                        : isHi
                        ? "नक्शे पर क्लिक करके खेत का स्थान तय करें"
                        : "Click anywhere on the interactive map to place a pin"}
                    </p>
                  </div>
                </div>
              </button>

              {/* Quick Hub Shortcuts */}
              <div className="pt-2 border-t border-slate-100">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                  {isMr ? "प्रमुख कृषी हब त्वरित निवडा:" : "Quick Agricultural Hubs:"}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    "Parbhani",
                    "Nashik",
                    "Pune",
                    "Baramati",
                    "Solapur",
                    "Nagpur",
                    "Latur",
                    "Kolhapur",
                    "Sangli",
                    "Ahmednagar",
                  ].map((city) => {
                    const place = INDIAN_AGRICULTURAL_PLACES.find((p) => p.district === city);
                    if (!place) return null;
                    return (
                      <button
                        key={city}
                        type="button"
                        onClick={() => handleSelectPlace(place)}
                        className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-emerald-100 hover:text-emerald-900 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
                      >
                        {city}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Mode 2: GPS Confirmation Screen */}
          {mode === "gps_confirm" && gpsPendingLocation && (
            <div className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl">
                <div className="flex items-start gap-3">
                  <Navigation className="w-5 h-5 text-emerald-700 mt-0.5 shrink-0" />
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                      {isMr ? "शोधलेले शेत स्थान:" : "Detected Farm Location:"}
                    </span>
                    <h4 className="font-extrabold text-base text-slate-900">
                      {gpsPendingLocation.label}
                    </h4>
                    <div className="flex flex-wrap gap-2 text-xs text-slate-600 mt-1">
                      <span>
                        {gpsPendingLocation.district}, {gpsPendingLocation.state}
                      </span>
                      <span>•</span>
                      <span>
                        {gpsPendingLocation.lat.toFixed(4)}° N, {gpsPendingLocation.lng.toFixed(4)}° E
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {isEditingGps ? (
                <div className="space-y-2 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      {isMr ? "गाव / वाडी:" : "Village / Area:"}
                    </label>
                    <Input
                      value={gpsPendingLocation.village || ""}
                      onChange={(e) =>
                        setGpsPendingLocation({
                          ...gpsPendingLocation,
                          village: e.target.value,
                          label: `${e.target.value}, ${gpsPendingLocation.district}, ${gpsPendingLocation.state}`,
                        })
                      }
                      className="h-8 text-xs bg-white"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      {isMr ? "तालुका:" : "Taluka:"}
                    </label>
                    <Input
                      value={gpsPendingLocation.taluka || ""}
                      onChange={(e) =>
                        setGpsPendingLocation({
                          ...gpsPendingLocation,
                          taluka: e.target.value,
                        })
                      }
                      className="h-8 text-xs bg-white"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      {isMr ? "जिल्हा:" : "District:"}
                    </label>
                    <Input
                      value={gpsPendingLocation.district || ""}
                      onChange={(e) =>
                        setGpsPendingLocation({
                          ...gpsPendingLocation,
                          district: e.target.value,
                          label: `${gpsPendingLocation.village || gpsPendingLocation.taluka}, ${e.target.value}, ${gpsPendingLocation.state}`,
                        })
                      }
                      className="h-8 text-xs bg-white"
                    />
                  </div>
                </div>
              ) : null}

              <div className="flex items-center justify-between pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditingGps(!isEditingGps)}
                  className="text-xs text-slate-600"
                >
                  <Edit3 className="w-3.5 h-3.5 mr-1" />
                  {isEditingGps ? (isMr ? "बदल पूर्ण" : "Done Editing") : isMr ? "नाव संपादित करा" : "Edit Name"}
                </Button>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setMode("select_method")}
                    className="text-xs"
                  >
                    {isMr ? "मागे" : "Back"}
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleConfirmGpsLocation}
                    className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold"
                  >
                    <Check className="w-4 h-4 mr-1.5" />
                    {isMr ? "स्थान पुष्टी करा" : "Confirm Farm Location"}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Mode 3: Search Village / Taluka / District / Pincode */}
          {mode === "search" && (
            <div className="space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <Input
                  placeholder={
                    isMr
                      ? "गाव, तालुका, जिल्हा किंवा ६ अंकी पिनकोड टाईप करा..."
                      : isHi
                      ? "गांव, तहसील, जिला या 6-अंकीय पिनकोड टाइप करें..."
                      : "Type village, taluka, district, or 6-digit pincode..."
                  }
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="pl-9 h-10 text-xs"
                />
              </div>

              <div className="max-h-60 overflow-y-auto space-y-1.5 divide-y divide-slate-100">
                {searchResults.map((place) => (
                  <button
                    key={place.id}
                    type="button"
                    onClick={() => handleSelectPlace(place)}
                    className="w-full text-left p-2.5 rounded-lg hover:bg-emerald-50 transition-colors flex items-center justify-between group cursor-pointer"
                  >
                    <div>
                      <div className="font-semibold text-xs text-slate-900 group-hover:text-emerald-900">
                        {place.name}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {place.taluka}, {place.district}, {place.state} • {place.pincode}
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[10px] text-slate-500 border-slate-200">
                      {place.hubType || "Taluka Center"}
                    </Badge>
                  </button>
                ))}

                {searchResults.length === 0 && (
                  <div className="text-center p-6 text-slate-500 text-xs">
                    <AlertCircle className="w-6 h-6 mx-auto mb-1 text-slate-400" />
                    {isMr
                      ? "कोणतेही स्थान सापडले नाही. कृपया योग्य नाव किंवा पिनकोड टाईप करा."
                      : "No matching location found. Please try another place name or pincode."}
                  </div>
                )}
              </div>

              <div className="pt-2 flex justify-between items-center border-t border-slate-100">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setMode("select_method")}
                  className="text-xs text-slate-600"
                >
                  {isMr ? "मागे" : "Back"}
                </Button>
                <span className="text-[11px] text-slate-400">
                  {isMr ? "भारतातील ३५+ कृषी मंडई समर्थित" : "35+ Indian APMC Mandis Supported"}
                </span>
              </div>
            </div>
          )}

          {/* Mode 4: Interactive Map Coordinate Picker */}
          {mode === "map_picker" && (
            <div className="space-y-3">
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs text-slate-600 flex items-center gap-2">
                <Compass className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>
                  {isMr
                    ? "नकाशावर शेताच्या परिसरावर क्लिक करा. अचूक अक्षांश व रेखांश आपोआप निवडले जातील."
                    : "Click on the region where your farm is located to drop your pin."}
                </span>
              </div>

              {/* Interactive SVG Radar Map of Maharashtra */}
              <div
                onClick={handleMapClick}
                className="relative w-full h-56 bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 rounded-xl overflow-hidden cursor-crosshair border border-slate-800 shadow-inner group"
              >
                {/* SVG Radar Grid & Maharashtra Hubs */}
                <svg className="w-full h-full opacity-60">
                  <defs>
                    <radialGradient id="gridGlow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#022c22" stopOpacity="0" />
                    </radialGradient>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#gridGlow)" />
                  <circle cx="50%" cy="50%" r="35%" fill="none" stroke="#10b981" strokeWidth="0.5" strokeDasharray="4,4" />
                  <circle cx="50%" cy="50%" r="70%" fill="none" stroke="#10b981" strokeWidth="0.5" strokeDasharray="4,4" />
                  <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#10b981" strokeWidth="0.5" strokeDasharray="2,2" />
                  <line x1="50%" y1="0" x2="50%" y2="100%" stroke="#10b981" strokeWidth="0.5" strokeDasharray="2,2" />
                </svg>

                {/* Major Cluster Badges on Map */}
                <div className="absolute top-[35%] left-[22%] text-[10px] font-bold text-emerald-400 bg-black/60 px-1.5 py-0.5 rounded pointer-events-none">
                  Nashik (नाशिक)
                </div>
                <div className="absolute top-[60%] left-[26%] text-[10px] font-bold text-emerald-400 bg-black/60 px-1.5 py-0.5 rounded pointer-events-none">
                  Pune (पुणे)
                </div>
                <div className="absolute top-[68%] left-[34%] text-[10px] font-bold text-emerald-400 bg-black/60 px-1.5 py-0.5 rounded pointer-events-none">
                  Baramati (बारामती)
                </div>
                <div className="absolute top-[48%] left-[54%] text-[10px] font-bold text-amber-400 bg-black/60 px-1.5 py-0.5 rounded pointer-events-none ring-1 ring-amber-400">
                  Parbhani (परभणी)
                </div>
                <div className="absolute top-[65%] left-[53%] text-[10px] font-bold text-emerald-400 bg-black/60 px-1.5 py-0.5 rounded pointer-events-none">
                  Latur (लातूर)
                </div>
                <div className="absolute top-[75%] left-[45%] text-[10px] font-bold text-emerald-400 bg-black/60 px-1.5 py-0.5 rounded pointer-events-none">
                  Solapur (सोलापूर)
                </div>
                <div className="absolute top-[22%] left-[78%] text-[10px] font-bold text-emerald-400 bg-black/60 px-1.5 py-0.5 rounded pointer-events-none">
                  Nagpur (नागपूर)
                </div>

                {/* Map Pin Indicator */}
                <div
                  className="absolute transform -translate-x-1/2 -translate-y-full transition-all duration-300 pointer-events-none"
                  style={{
                    left: `${((pickerCoords.lng - 72.6) / (80.9 - 72.6)) * 100}%`,
                    top: `${((22.0 - pickerCoords.lat) / (22.0 - 15.6)) * 100}%`,
                  }}
                >
                  <div className="relative flex flex-col items-center">
                    <span className="animate-ping absolute h-3 w-3 rounded-full bg-emerald-400 opacity-75" />
                    <MapPin className="w-7 h-7 text-emerald-400 drop-shadow-md fill-emerald-500" />
                  </div>
                </div>

                {isGeocodingMap && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-xs font-medium gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {isMr ? "नकाशा स्थान ओळखत आहे..." : "Resolving map location..."}
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setMode("select_method")}
                  className="text-xs text-slate-600"
                >
                  {isMr ? "मागे" : "Back"}
                </Button>
                <span className="text-[11px] text-slate-500 font-mono">
                  {pickerCoords.lat.toFixed(4)}° N, {pickerCoords.lng.toFixed(4)}° E
                </span>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
