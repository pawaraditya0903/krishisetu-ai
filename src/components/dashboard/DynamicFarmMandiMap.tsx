"use client";

import { useState } from "react";
import { FarmLocation, MandiPrice } from "@/lib/types";
import { formatTravelTime } from "@/lib/geo-locations";
import { MapPin, Navigation, Compass, Truck, Clock, IndianRupee, Layers } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface DynamicFarmMandiMapProps {
  farmLocation: FarmLocation;
  mandis: MandiPrice[];
  selectedMandiId?: string;
  onSelectMandi?: (mandi: MandiPrice) => void;
  language?: "mr" | "hi" | "en";
}

export default function DynamicFarmMandiMap({
  farmLocation,
  mandis,
  selectedMandiId,
  onSelectMandi,
  language = "en",
}: DynamicFarmMandiMapProps) {
  const isMr = language === "mr";
  const isHi = language === "hi";

  const activeMandi =
    mandis.find((m) => m.id === selectedMandiId) || mandis[0] || null;

  // Calculate bounding box enclosing farm and all nearby mandis with padding
  const allPoints = [
    { lat: farmLocation.lat, lng: farmLocation.lng },
    ...mandis.filter((m) => m.lat && m.lng).map((m) => ({ lat: m.lat!, lng: m.lng! })),
  ];

  const lats = allPoints.map((p) => p.lat);
  const lngs = allPoints.map((p) => p.lng);

  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  // Add 15% margin
  const latSpan = Math.max(0.4, (maxLat - minLat) * 1.3);
  const lngSpan = Math.max(0.5, (maxLng - minLng) * 1.3);

  const centerLat = (minLat + maxLat) / 2;
  const centerLng = (minLng + maxLng) / 2;

  const mapMinLat = centerLat - latSpan / 2;
  const mapMaxLat = centerLat + latSpan / 2;
  const mapMinLng = centerLng - lngSpan / 2;
  const mapMaxLng = centerLng + lngSpan / 2;

  // Project lat/lng to percentage coordinates (0% to 100%)
  const project = (lat: number, lng: number) => {
    const x = ((lng - mapMinLng) / (mapMaxLng - mapMinLng)) * 100;
    const y = ((mapMaxLat - lat) / (mapMaxLat - mapMinLat)) * 100;
    return {
      x: Math.max(8, Math.min(92, x)),
      y: Math.max(10, Math.min(90, y)),
    };
  };

  const farmPos = project(farmLocation.lat, farmLocation.lng);
  const activeMandiPos = activeMandi && activeMandi.lat && activeMandi.lng
    ? project(activeMandi.lat, activeMandi.lng)
    : null;

  return (
    <div className="relative w-full h-80 sm:h-96 rounded-2xl overflow-hidden bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border border-slate-800 shadow-lg select-none">
      {/* Dynamic Grid Background with Cartographic Radar Lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
        <defs>
          <pattern id="cartoGrid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#334155" strokeWidth="0.5" strokeDasharray="3,3" />
          </pattern>
          <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.9" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#cartoGrid)" />

        {/* Selected Mandi Direct Freight Route Line */}
        {activeMandiPos && (
          <>
            <line
              x1={`${farmPos.x}%`}
              y1={`${farmPos.y}%`}
              x2={`${activeMandiPos.x}%`}
              y2={`${activeMandiPos.y}%`}
              stroke="url(#routeGradient)"
              strokeWidth="3"
              strokeDasharray="6,4"
              className="animate-pulse"
            />
            {/* Route midpoint circle */}
            <circle
              cx={`${(farmPos.x + activeMandiPos.x) / 2}%`}
              cy={`${(farmPos.y + activeMandiPos.y) / 2}%`}
              r="4"
              fill="#3b82f6"
              stroke="#ffffff"
              strokeWidth="1.5"
            />
          </>
        )}
      </svg>

      {/* Top Overlay Badge Bar */}
      <div className="absolute top-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2 pointer-events-none z-10">
        <div className="bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700/60 shadow-md flex items-center gap-2 pointer-events-auto">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-xs font-semibold text-slate-200">
            {farmLocation.label.split(",")[0]}
          </span>
          <Badge variant="outline" className="text-[9px] text-emerald-400 border-emerald-500/40 py-0">
            {farmLocation.accuracy}
          </Badge>
        </div>

        {activeMandi && (
          <div className="bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700/60 shadow-md flex items-center gap-3 text-xs text-slate-300 pointer-events-auto">
            <span className="flex items-center gap-1 text-emerald-400 font-semibold">
              <Truck className="w-3.5 h-3.5" /> {activeMandi.distanceKm} km
            </span>
            <span className="flex items-center gap-1 text-blue-400">
              <Clock className="w-3.5 h-3.5" /> {formatTravelTime(activeMandi.travelTimeHours || activeMandi.distanceKm / 40)}
            </span>
            <span className="font-extrabold text-amber-400">
              ₹{activeMandi.modalPrice}/qtl
            </span>
          </div>
        )}
      </div>

      {/* Farmer Location Pin (Origin) */}
      <div
        className="absolute transform -translate-x-1/2 -translate-y-full transition-all duration-500 z-20"
        style={{ left: `${farmPos.x}%`, top: `${farmPos.y}%` }}
      >
        <div className="relative flex flex-col items-center group cursor-pointer">
          <div className="bg-emerald-600 text-white px-2 py-0.5 rounded-md text-[10px] font-bold shadow-md whitespace-nowrap mb-1 flex items-center gap-1">
            <Navigation className="w-2.5 h-2.5" /> {isMr ? "आपले शेत" : "Your Farm"}
          </div>
          <div className="relative">
            <span className="animate-ping absolute h-4 w-4 rounded-full bg-emerald-400 opacity-75" />
            <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg border-2 border-white">
              <Navigation className="w-3 h-3" />
            </div>
          </div>
        </div>
      </div>

      {/* Nearby Mandi Markers (Destinations) */}
      {mandis.map((mandi) => {
        if (!mandi.lat || !mandi.lng) return null;
        const pos = project(mandi.lat, mandi.lng);
        const isSelected = activeMandi && activeMandi.id === mandi.id;

        return (
          <div
            key={mandi.id}
            onClick={() => onSelectMandi && onSelectMandi(mandi)}
            className="absolute transform -translate-x-1/2 -translate-y-full transition-all duration-300 z-20 cursor-pointer group"
            style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
          >
            <div className="relative flex flex-col items-center">
              {/* Tooltip / Label */}
              <div
                className={`px-2 py-0.5 rounded-md text-[10px] font-bold shadow-md whitespace-nowrap mb-1 transition-all flex items-center gap-1 ${
                  isSelected
                    ? "bg-amber-500 text-slate-950 scale-105"
                    : "bg-slate-800/90 text-slate-200 border border-slate-700 group-hover:bg-slate-700"
                }`}
              >
                <span>{mandi.mandi.split(" ")[0]}</span>
                <span className="font-mono text-[9px] opacity-80">({mandi.distanceKm}km)</span>
              </div>

              {/* Pin Icon */}
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center shadow-lg border-2 transition-transform group-hover:scale-110 ${
                  isSelected
                    ? "bg-amber-500 text-slate-950 border-white ring-4 ring-amber-500/30"
                    : "bg-slate-700 text-amber-400 border-slate-500"
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        );
      })}

      {/* Bottom Floating Route Summary Card */}
      {activeMandi && (
        <div className="absolute bottom-3 left-3 right-3 bg-slate-900/95 backdrop-blur-md p-3 rounded-xl border border-slate-800 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-800 text-emerald-400 flex items-center justify-center shrink-0">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-100 flex items-center gap-2">
                <span>{activeMandi.mandi}</span>
                <Badge className="bg-emerald-500/20 text-emerald-400 border-none text-[9px] px-1 py-0">
                  {activeMandi.crop}
                </Badge>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {activeMandi.distanceKm} km {isMr ? "थेट अंतर" : "freight route"} •{" "}
                {formatTravelTime(activeMandi.travelTimeHours || activeMandi.distanceKm / 40)}{" "}
                {isMr ? "अंदाजे वेळ" : "estimated transit"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:self-center">
            <div className="text-right">
              <div className="text-base font-extrabold text-emerald-400">
                ₹{activeMandi.modalPrice}
                <span className="text-[10px] text-slate-400 font-normal">/qtl</span>
              </div>
              <div className="text-[9px] text-slate-500 uppercase font-semibold">
                {isMr ? "सरासरी भाव" : "Modal Rate"}
              </div>
            </div>
            <Badge
              variant="outline"
              className="text-[10px] text-emerald-400 border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5"
            >
              {activeMandi.dataStatus || "Demo"}
            </Badge>
          </div>
        </div>
      )}
    </div>
  );
}
