"use client";

import React, { useState, useEffect } from "react";
import {
  INDIAN_AGRICULTURAL_PLACES,
  PlaceRecord,
  calculateDistanceKm,
} from "@/lib/geo-locations";
import {
  MapPin,
  Search,
  Navigation,
  Crosshair,
  CheckCircle2,
  X,
  AlertCircle,
  Building,
  Map as MapIcon,
  Sliders,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import InteractiveAgricultureMap from "@/components/dashboard/InteractiveAgricultureMap";

export interface SelectedLocationData {
  id?: string;
  label: string;
  village?: string;
  taluka: string;
  district: string;
  state: string;
  pincode?: string;
  lat: number;
  lng: number;
}

interface LocationPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLocation: (loc: SelectedLocationData) => void;
  initialLocation?: Partial<SelectedLocationData>;
  language?: "mr" | "hi" | "en";
  title?: string;
}

export default function LocationPickerModal({
  isOpen,
  onClose,
  onSelectLocation,
  initialLocation,
  language = "en",
  title,
}: LocationPickerModalProps) {
  const isMr = language === "mr";
  const isHi = language === "hi";

  // Form field states
  const [village, setVillage] = useState(initialLocation?.village || "");
  const [taluka, setTaluka] = useState(initialLocation?.taluka || "Baramati");
  const [district, setDistrict] = useState(initialLocation?.district || "Pune");
  const [state, setState] = useState(initialLocation?.state || "Maharashtra");
  const [pincode, setPincode] = useState(initialLocation?.pincode || "413102");
  const [lat, setLat] = useState<number>(initialLocation?.lat || 18.1517);
  const [lng, setLng] = useState<number>(initialLocation?.lng || 74.5772);

  // Search query & gazetteer results
  const [searchQuery, setSearchQuery] = useState("");
  const [isGpsLoading, setIsGpsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"search" | "map" | "manual">("map");

  useEffect(() => {
    if (initialLocation) {
      if (initialLocation.village) setVillage(initialLocation.village);
      if (initialLocation.taluka) setTaluka(initialLocation.taluka);
      if (initialLocation.district) setDistrict(initialLocation.district);
      if (initialLocation.state) setState(initialLocation.state);
      if (initialLocation.pincode) setPincode(initialLocation.pincode);
      if (initialLocation.lat !== undefined) setLat(initialLocation.lat);
      if (initialLocation.lng !== undefined) setLng(initialLocation.lng);
    }
  }, [initialLocation, isOpen]);

  if (!isOpen) return null;

  // Gazetteer filtering
  const filteredPlaces = searchQuery.trim()
    ? INDIAN_AGRICULTURAL_PLACES.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.taluka.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.pincode.includes(searchQuery.trim())
      ).slice(0, 8)
    : [];

  // Handler for selecting gazetteer item
  const handleSelectPlace = (place: PlaceRecord) => {
    setVillage(place.name);
    setTaluka(place.taluka);
    setDistrict(place.district);
    setState(place.state);
    setPincode(place.pincode);
    setLat(place.lat);
    setLng(place.lng);
    setSearchQuery("");
  };

  // Browser GPS auto-detection
  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      alert(isMr ? "आपल्या ब्राउझरमध्ये जीपीएस उपलब्ध नाही." : "GPS not supported in browser.");
      return;
    }

    setIsGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsGpsLoading(false);
        const userLat = Number(pos.coords.latitude.toFixed(4));
        const userLng = Number(pos.coords.longitude.toFixed(4));
        setLat(userLat);
        setLng(userLng);

        // Find closest gazetteer place to approximate village/taluka
        let closest: PlaceRecord | null = null;
        let minDist = Infinity;
        INDIAN_AGRICULTURAL_PLACES.forEach((p) => {
          const d = calculateDistanceKm(userLat, userLng, p.lat, p.lng);
          if (d < minDist) {
            minDist = d;
            closest = p;
          }
        });

        if (closest) {
          const c = closest as PlaceRecord;
          setVillage(isMr ? "वर्तमान शेत स्थान" : "Current Farm Site");
          setTaluka(c.taluka);
          setDistrict(c.district);
          setState(c.state);
          setPincode(c.pincode);
        }
      },
      (err) => {
        setIsGpsLoading(false);
        console.warn("GPS lookup failed:", err);
        alert(
          isMr
            ? "जीपीएस स्थान मिळवता आले नाही. कृपया नकाशावर निवडा किंवा शोधा."
            : "GPS location unavailable. Please select on map or use place search."
        );
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  // Handle map click
  const handlePickFromMap = (coords: { lat: number; lng: number }) => {
    const roundLat = Number(coords.lat.toFixed(4));
    const roundLng = Number(coords.lng.toFixed(4));
    setLat(roundLat);
    setLng(roundLng);

    // Approximate nearest place for labels
    let closest: PlaceRecord | null = null;
    let minDist = Infinity;
    INDIAN_AGRICULTURAL_PLACES.forEach((p) => {
      const d = calculateDistanceKm(roundLat, roundLng, p.lat, p.lng);
      if (d < minDist) {
        minDist = d;
        closest = p;
      }
    });

    if (closest) {
      const c = closest as PlaceRecord;
      if (!village) setVillage(c.name);
      setTaluka(c.taluka);
      setDistrict(c.district);
      setState(c.state);
      if (!pincode) setPincode(c.pincode);
    }
  };

  const handleConfirm = () => {
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      alert("Invalid latitude/longitude coordinates.");
      return;
    }
    if (!district.trim()) {
      alert("Please specify at least a district name.");
      return;
    }

    const label = `${village ? `${village}, ` : ""}${taluka ? `${taluka}, ` : ""}${district}`;
    onSelectLocation({
      id: `LOC-${Date.now()}`,
      label,
      village: village.trim() || undefined,
      taluka: taluka.trim() || "Rural Hub",
      district: district.trim(),
      state: state.trim() || "Maharashtra",
      pincode: pincode.trim() || undefined,
      lat,
      lng,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800">
              <MapPin className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-slate-900 tracking-tight">
                {title || (isMr ? "अचूक स्थान निवडा (जीपीएस / नकाशा / शोध)" : "Pinpoint Precise Location (GPS / Map / Search)")}
              </h3>
              <p className="text-xs text-slate-500">
                {isMr
                  ? "नकाशावर क्लिक करा, जीपीएसने शोधा किंवा गावाचे नाव टाईप करा."
                  : "Tap on the map, auto-detect via device GPS, or search your taluka/village."}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* Top Quick Actions Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  isMr
                    ? "गाव, तालुका, जिल्हा किंवा पिनकोड शोधा (उदा. बारामती, निफाड, 413102)..."
                    : "Search village, taluka, district, or 6-digit pincode..."
                }
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
              {/* Autocomplete Dropdown */}
              {filteredPlaces.length > 0 && (
                <div className="absolute left-0 right-0 top-11 bg-white border border-slate-200 rounded-xl shadow-xl z-30 max-h-56 overflow-y-auto">
                  {filteredPlaces.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => handleSelectPlace(p)}
                      className="px-3 py-2 text-xs hover:bg-emerald-50 cursor-pointer border-b border-slate-100 last:border-0 flex items-center justify-between"
                    >
                      <div>
                        <span className="font-semibold text-slate-800">{p.name}</span>
                        <span className="text-slate-500 ml-1.5">
                          ({p.taluka}, {p.district})
                        </span>
                      </div>
                      <Badge variant="outline" className="text-[10px] bg-slate-50">
                        {p.pincode}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* GPS Detect Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleDetectGPS}
              disabled={isGpsLoading}
              className="bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100 shrink-0 font-medium text-xs h-9"
            >
              <Navigation className={`w-3.5 h-3.5 mr-1.5 ${isGpsLoading ? "animate-spin" : ""}`} />
              {isGpsLoading
                ? isMr ? "शोधत आहे..." : "Detecting GPS..."
                : isMr ? "वर्तमान स्थान वापरा (GPS)" : "Use My Device GPS"}
            </Button>
          </div>

          {/* Map Viewport for Location Clicking */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs relative">
            <InteractiveAgricultureMap
              centerLat={lat}
              centerLng={lng}
              heightClassName="h-64 sm:h-80"
              allowClickToPickLocation={true}
              onPickLocation={handlePickFromMap}
              pickedPinCoords={{ lat, lng }}
              language={language}
              customTitle={
                isMr
                  ? `स्थान: ${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E (क्लिक करून बदला)`
                  : `Coordinates: ${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E (Tap to adjust)`
              }
            />
          </div>

          {/* Coordinate & Address Input Fields */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
            <div>
              <label className="text-[11px] font-semibold text-slate-600 uppercase block mb-1">
                {isMr ? "गाव / संकलन ठिकाण" : "Village / Landmark"}
              </label>
              <input
                type="text"
                value={village}
                onChange={(e) => setVillage(e.target.value)}
                placeholder="Malegaon BK"
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 font-medium"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-600 uppercase block mb-1">
                {isMr ? "तालुका" : "Taluka"}
              </label>
              <input
                type="text"
                value={taluka}
                onChange={(e) => setTaluka(e.target.value)}
                placeholder="Baramati"
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 font-medium"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-600 uppercase block mb-1">
                {isMr ? "जिल्हा" : "District"} *
              </label>
              <input
                type="text"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                placeholder="Pune"
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 font-bold text-emerald-800"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-600 uppercase block mb-1">
                {isMr ? "पिनकोड" : "Pincode"}
              </label>
              <input
                type="text"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                placeholder="413115"
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 font-medium"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-600 uppercase block mb-1">
                {isMr ? "अक्षांश (Latitude)" : "Latitude"} *
              </label>
              <input
                type="number"
                step="0.0001"
                value={lat}
                onChange={(e) => setLat(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 font-mono"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-600 uppercase block mb-1">
                {isMr ? "रेखांश (Longitude)" : "Longitude"} *
              </label>
              <input
                type="number"
                step="0.0001"
                value={lng}
                onChange={(e) => setLng(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 font-mono"
              />
            </div>
            <div className="col-span-2">
              <label className="text-[11px] font-semibold text-slate-600 uppercase block mb-1">
                {isMr ? "राज्य" : "State"}
              </label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="Maharashtra"
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 font-medium"
              />
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="text-xs text-slate-600 hidden sm:block">
            <span>📍 {village ? `${village}, ` : ""}{taluka}, {district} ({lat.toFixed(4)}, {lng.toFixed(4)})</span>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
              {isMr ? "रद्द करा" : "Cancel"}
            </Button>
            <Button
              size="sm"
              onClick={handleConfirm}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-5 shadow-md"
            >
              <CheckCircle2 className="w-4 h-4 mr-1.5" />
              {isMr ? "स्थान निश्चित करा" : "Confirm Location"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
