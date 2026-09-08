"use client";

import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useAppStore } from "@/lib/store";
import { formatTravelTime, calculateDistanceKm } from "@/lib/geo-locations";
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Navigation,
  RotateCcw,
  Layers,
  MapPin,
  Store,
  Users,
  ShoppingCart,
  Phone,
  Clock,
  IndianRupee,
  Truck,
  CheckCircle2,
  X,
  Crosshair,
  Sliders,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface MapMarkerItem {
  id: string;
  type: "farmer" | "mandi" | "fpo" | "pool" | "buyer" | "pin";
  name: string;
  subtext?: string;
  lat: number;
  lng: number;
  price?: number;
  distanceKm?: number;
  travelTimeHours?: number;
  badge?: string;
  phone?: string;
  details?: Record<string, string | number>;
  data?: any;
}

export interface InteractiveAgricultureMapProps {
  centerLat?: number;
  centerLng?: number;
  radiusKm?: number;
  showRadiusOverlay?: boolean;
  heightClassName?: string;
  selectedMarkerId?: string;
  onSelectMarker?: (marker: MapMarkerItem) => void;
  language?: "mr" | "hi" | "en";
  allowClickToPickLocation?: boolean;
  onPickLocation?: (coords: { lat: number; lng: number }) => void;
  pickedPinCoords?: { lat: number; lng: number } | null;
  extraMarkers?: MapMarkerItem[];
  customTitle?: string;
}

export default function InteractiveAgricultureMap({
  centerLat,
  centerLng,
  radiusKm,
  showRadiusOverlay = true,
  heightClassName = "h-96 sm:h-[480px]",
  selectedMarkerId,
  onSelectMarker,
  language = "en",
  allowClickToPickLocation = false,
  onPickLocation,
  pickedPinCoords,
  extraMarkers,
  customTitle,
}: InteractiveAgricultureMapProps) {
  const isMr = language === "mr";
  const isHi = language === "hi";

  const {
    farmLocation,
    mandiPrices,
    mandisMaster,
    fpos,
    pools,
    users,
    searchRadiusKm,
  } = useAppStore();

  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Layer Visibility State
  const [layers, setLayers] = useState({
    farmer: true,
    mandis: true,
    fpos: true,
    pools: true,
    buyers: true,
    radius: showRadiusOverlay,
  });
  const [showLayerMenu, setShowLayerMenu] = useState(false);

  // Active popup card marker
  const [activePopup, setActivePopup] = useState<MapMarkerItem | null>(null);

  // Effective Center Coordinates
  const initialLat = centerLat ?? farmLocation?.lat ?? 18.5204;
  const initialLng = centerLng ?? farmLocation?.lng ?? 73.8567;
  const effectiveRadius = radiusKm ?? searchRadiusKm ?? 100;

  // Pan and Zoom viewport state
  const [viewCenter, setViewCenter] = useState({ lat: initialLat, lng: initialLng });
  const [zoomLevel, setZoomLevel] = useState(1.0); // 0.4 (wide) to 5.0 (close)

  // Dragging interaction state
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number; centerLat: number; centerLng: number }>({
    x: 0,
    y: 0,
    centerLat: initialLat,
    centerLng: initialLng,
  });

  // Touch pinch-to-zoom state
  const touchDistanceRef = useRef<number | null>(null);

  // Synchronize when external center coordinates change
  useEffect(() => {
    if (centerLat !== undefined && centerLng !== undefined) {
      setViewCenter({ lat: centerLat, lng: centerLng });
    }
  }, [centerLat, centerLng]);

  // Aggregate All Markers
  const allMarkers: MapMarkerItem[] = useMemo(() => {
    if (extraMarkers && extraMarkers.length > 0) {
      return extraMarkers;
    }

    const list: MapMarkerItem[] = [];

    // 1. Farmer Location / Live Pin
    if (farmLocation && layers.farmer) {
      list.push({
        id: "farmer-home",
        type: "farmer",
        name: farmLocation.label,
        subtext: isMr ? "आपले नोंदणीकृत शेत / संकलन केंद्र" : "Your Farm / Aggregation Hub",
        lat: farmLocation.lat,
        lng: farmLocation.lng,
        badge: isMr ? "माझे शेत" : "My Farm",
      });
    }

    // 2. Picked Location Pin (if clicking to pick location)
    if (pickedPinCoords) {
      list.push({
        id: "picked-pin",
        type: "pin",
        name: isMr ? "निवडलेले स्थान" : "Selected Pin Point",
        subtext: `${pickedPinCoords.lat.toFixed(4)}° N, ${pickedPinCoords.lng.toFixed(4)}° E`,
        lat: pickedPinCoords.lat,
        lng: pickedPinCoords.lng,
        badge: isMr ? "नवीन स्थान" : "Target Pin",
      });
    }

    // 3. Mandi Master Registry & Current Prices
    if (layers.mandis) {
      const activeMandis = mandisMaster.filter((m) => m.status === "Active");
      activeMandis.forEach((m) => {
        const matchingPrice = mandiPrices.find(
          (p) => p.mandi.toLowerCase() === m.mandi.toLowerCase()
        );
        const dist = farmLocation
          ? calculateDistanceKm(farmLocation.lat, farmLocation.lng, m.lat, m.lng)
          : undefined;

        list.push({
          id: m.id,
          type: "mandi",
          name: m.mandi,
          subtext: `${m.district}, ${m.state} • ${m.dataSource}`,
          lat: m.lat,
          lng: m.lng,
          price: matchingPrice?.modalPrice,
          distanceKm: dist,
          travelTimeHours: dist ? dist / 40 : undefined,
          badge: matchingPrice ? `₹${matchingPrice.modalPrice}/qtl` : "APMC",
          phone: m.phone,
          details: {
            "Market Code": m.marketCode || "N/A",
            "Supported Crops": m.supportedCrops.slice(0, 3).join(", "),
            "Data Source": m.dataSource,
          },
        });
      });
    }

    // 4. FPO Consolidation Hubs
    if (layers.fpos) {
      fpos.filter((f) => f.status === "Active").forEach((fpo) => {
        list.push({
          id: fpo.id,
          type: "fpo",
          name: fpo.name,
          subtext: `${fpo.taluka}, ${fpo.district} • Contact: ${fpo.contactPerson}`,
          lat: fpo.lat,
          lng: fpo.lng,
          phone: fpo.phone,
          badge: "FPO Hub",
          details: {
            "Supported Crops": fpo.supportedCrops.join(", "),
            "Pooling Fee": `₹${(fpo.serviceFeePaisePerQtl / 100).toFixed(2)}/qtl`,
            "Registered Members": `${fpo.memberFarmerIds.length} farmers`,
          },
        });

        // Add sub collection centers
        fpo.collectionCenters.forEach((cc) => {
          list.push({
            id: cc.id,
            type: "fpo",
            name: cc.name,
            subtext: `${fpo.name} (Sub Hub) • ${cc.village || cc.taluka}`,
            lat: cc.lat,
            lng: cc.lng,
            phone: cc.phone,
            badge: `${cc.capacityKg / 1000}T Hub`,
          });
        });
      });
    }

    // 5. Active Shared Logistics Pools
    if (layers.pools) {
      pools.filter((p) => p.status === "Open" || p.status === "Reserved").forEach((pool) => {
        // approximate pool center around destination
        const destMandi = mandisMaster.find(
          (m) => m.mandi.toLowerCase() === pool.destinationMandi.toLowerCase()
        );
        const lat = destMandi ? destMandi.lat : initialLat;
        const lng = destMandi ? destMandi.lng : initialLng;

        list.push({
          id: pool.id,
          type: "pool",
          name: `${pool.crop} Pool (${pool.currentKg}/${pool.targetKg} kg)`,
          subtext: `Target: ${pool.destinationMandi} • Hub: ${pool.collectionHub}`,
          lat: lat + 0.04,
          lng: lng - 0.04,
          price: pool.pricePerQtl,
          badge: `${pool.sharedFreightSavingsPct}% Saved`,
          details: {
            "Target Quantity": `${pool.targetKg} kg`,
            "Offered Rate": `₹${pool.pricePerQtl}/qtl`,
            "Closes In": new Date(pool.closesAt).toLocaleDateString(),
          },
        });
      });
    }

    // 6. Institutional Buyers
    if (layers.buyers) {
      users.filter((u) => u.role === "buyer" && u.lat && u.lng).forEach((buyer) => {
        list.push({
          id: buyer.id,
          type: "buyer",
          name: buyer.name,
          subtext: `${buyer.organization || "Verified Institutional Buyer"} • Rating: ${buyer.rating || "4.8"}★`,
          lat: buyer.lat!,
          lng: buyer.lng!,
          phone: buyer.phone,
          badge: "Buyer Yard",
        });
      });
    }

    return list;
  }, [
    extraMarkers,
    farmLocation,
    pickedPinCoords,
    mandisMaster,
    mandiPrices,
    fpos,
    pools,
    users,
    layers,
    isMr,
    initialLat,
    initialLng,
  ]);

  // Set selected marker if selectedMarkerId provided
  useEffect(() => {
    if (selectedMarkerId) {
      const match = allMarkers.find((m) => m.id === selectedMarkerId);
      if (match) {
        setActivePopup(match);
        setViewCenter({ lat: match.lat, lng: match.lng });
      }
    }
  }, [selectedMarkerId, allMarkers]);

  // Map coordinate projection relative to viewCenter and zoomLevel
  // 1 degree latitude ~= 111 km. 1 degree longitude at 19°N ~= 105 km.
  const baseLatSpan = 2.4 / zoomLevel;
  const baseLngSpan = 3.0 / zoomLevel;

  const project = useCallback(
    (lat: number, lng: number) => {
      const minLat = viewCenter.lat - baseLatSpan / 2;
      const maxLat = viewCenter.lat + baseLatSpan / 2;
      const minLng = viewCenter.lng - baseLngSpan / 2;
      const maxLng = viewCenter.lng + baseLngSpan / 2;

      const xPct = ((lng - minLng) / (maxLng - minLng)) * 100;
      const yPct = ((maxLat - lat) / (maxLat - minLat)) * 100;

      return { x: xPct, y: yPct, visible: xPct >= -10 && xPct <= 110 && yPct >= -10 && yPct <= 110 };
    },
    [viewCenter, baseLatSpan, baseLngSpan]
  );

  // Invert percentage to lat/lng for map clicks
  const unproject = useCallback(
    (xPct: number, yPct: number) => {
      const minLat = viewCenter.lat - baseLatSpan / 2;
      const maxLat = viewCenter.lat + baseLatSpan / 2;
      const minLng = viewCenter.lng - baseLngSpan / 2;
      const maxLng = viewCenter.lng + baseLngSpan / 2;

      const lng = minLng + (xPct / 100) * (maxLng - minLng);
      const lat = maxLat - (yPct / 100) * (maxLat - minLat);

      return { lat, lng };
    },
    [viewCenter, baseLatSpan, baseLngSpan]
  );

  // Zoom Handlers
  const handleZoomIn = () => setZoomLevel((z) => Math.min(5.0, Number((z * 1.35).toFixed(2))));
  const handleZoomOut = () => setZoomLevel((z) => Math.max(0.35, Number((z / 1.35).toFixed(2))));

  // Mouse wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      handleZoomIn();
    } else {
      handleZoomOut();
    }
  };

  // Reset view to original center
  const handleResetView = () => {
    setViewCenter({ lat: initialLat, lng: initialLng });
    setZoomLevel(1.0);
    setActivePopup(null);
  };

  // Fit view to include all markers
  const handleFitAll = () => {
    if (allMarkers.length === 0) return;
    const lats = allMarkers.map((m) => m.lat);
    const lngs = allMarkers.map((m) => m.lng);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    const centerL = (minLat + maxLat) / 2;
    const centerG = (minLng + maxLng) / 2;
    const latSpan = Math.max(0.4, (maxLat - minLat) * 1.35);
    const lngSpan = Math.max(0.5, (maxLng - minLng) * 1.35);

    const calculatedZoom = Math.min(
      4.0,
      Math.max(0.4, Math.min(2.4 / latSpan, 3.0 / lngSpan))
    );

    setViewCenter({ lat: centerL, lng: centerG });
    setZoomLevel(Number(calculatedZoom.toFixed(2)));
  };

  // Center on device GPS
  const handleLocateMe = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setViewCenter({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setZoomLevel(1.8);
        },
        () => {
          alert(isMr ? "जीपीएस स्थान मिळवता आले नाही." : "Unable to retrieve GPS coordinates.");
        }
      );
    }
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  // Mouse Pan Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // only left click
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      centerLat: viewCenter.lat,
      centerLng: viewCenter.lng,
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    const rect = containerRef.current.getBoundingClientRect();

    const dLng = -(dx / rect.width) * baseLngSpan;
    const dLat = (dy / rect.height) * baseLatSpan;

    setViewCenter({
      lat: dragStartRef.current.centerLat + dLat,
      lng: dragStartRef.current.centerLng + dLng,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  // Click on map to pick location (if enabled)
  const handleMapClick = (e: React.MouseEvent) => {
    if (!allowClickToPickLocation || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const xPct = ((e.clientX - rect.left) / rect.width) * 100;
    const yPct = ((e.clientY - rect.top) / rect.height) * 100;
    const coords = unproject(xPct, yPct);
    if (onPickLocation) {
      onPickLocation(coords);
    }
  };

  // Mobile Touch Pan & Pinch Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      dragStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        centerLat: viewCenter.lat,
        centerLng: viewCenter.lng,
      };
    } else if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      touchDistanceRef.current = dist;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && isDragging && containerRef.current) {
      const dx = e.touches[0].clientX - dragStartRef.current.x;
      const dy = e.touches[0].clientY - dragStartRef.current.y;
      const rect = containerRef.current.getBoundingClientRect();

      const dLng = -(dx / rect.width) * baseLngSpan;
      const dLat = (dy / rect.height) * baseLatSpan;

      setViewCenter({
        lat: dragStartRef.current.centerLat + dLat,
        lng: dragStartRef.current.centerLng + dLng,
      });
    } else if (e.touches.length === 2 && touchDistanceRef.current) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const ratio = dist / touchDistanceRef.current;
      if (Math.abs(ratio - 1) > 0.05) {
        setZoomLevel((z) => Math.min(5.0, Math.max(0.35, Number((z * ratio).toFixed(2)))));
        touchDistanceRef.current = dist;
      }
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    touchDistanceRef.current = null;
  };

  // Center position of farm for radius circle
  const farmPos = farmLocation ? project(farmLocation.lat, farmLocation.lng) : null;

  // Radius circle dimension calculation (km to SVG radius %):
  // 1 degree lat ~ 111 km. Height span = baseLatSpan degrees = baseLatSpan * 111 km.
  const radiusYRadiusPct = farmPos
    ? (effectiveRadius / (baseLatSpan * 111)) * 100
    : 0;
  const radiusXRadiusPct = farmPos
    ? (effectiveRadius / (baseLngSpan * 105)) * 100
    : 0;

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={handleMapClick}
      className={`relative w-full ${heightClassName} rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl select-none cursor-grab active:cursor-grabbing font-sans`}
    >
      {/* Dynamic Background: Tactical Agriculture Topo Grid */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
        <defs>
          <pattern id="gridLarge" width="80" height="80" patternUnits="userSpaceOnUse">
            <path d="M 80 0 L 0 0 0 80" fill="none" stroke="#334155" strokeWidth="0.75" strokeDasharray="4,4" />
          </pattern>
          <pattern id="gridSmall" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e293b" strokeWidth="0.5" />
          </pattern>
          <radialGradient id="radiusGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.18" />
            <stop offset="85%" stopColor="#059669" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#047857" stopOpacity="0.25" />
          </radialGradient>
        </defs>

        <rect width="100%" height="100%" fill="url(#gridSmall)" />
        <rect width="100%" height="100%" fill="url(#gridLarge)" />

        {/* Dynamic Search Radius Circle Overlay */}
        {layers.radius && farmPos && radiusXRadiusPct > 0 && (
          <g>
            <ellipse
              cx={`${farmPos.x}%`}
              cy={`${farmPos.y}%`}
              rx={`${radiusXRadiusPct}%`}
              ry={`${radiusYRadiusPct}%`}
              fill="url(#radiusGradient)"
              stroke="#10b981"
              strokeWidth="1.75"
              strokeDasharray="6,4"
              className="animate-pulse"
            />
            {/* Radius distance callout */}
            <text
              x={`${farmPos.x}%`}
              y={`${farmPos.y - radiusYRadiusPct + 3}%`}
              fill="#34d399"
              fontSize="10"
              fontWeight="600"
              textAnchor="middle"
              className="tracking-wider uppercase"
            >
              {effectiveRadius} KM {isMr ? "शोध परीघ" : "DISCOVERY RANGE"}
            </text>
          </g>
        )}

        {/* Direct connection vector to active popup marker */}
        {farmPos && activePopup && activePopup.id !== "farmer-home" && (
          <line
            x1={`${farmPos.x}%`}
            y1={`${farmPos.y}%`}
            x2={`${project(activePopup.lat, activePopup.lng).x}%`}
            y2={`${project(activePopup.lat, activePopup.lng).y}%`}
            stroke="#10b981"
            strokeWidth="2.5"
            strokeDasharray="5,4"
            className="animate-pulse"
          />
        )}
      </svg>

      {/* Top Floating Header & Stats Banner */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10">
        <div className="flex items-center gap-2 pointer-events-auto bg-slate-900/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/80 shadow-md">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping shrink-0" />
          <div>
            <div className="text-xs font-bold text-white tracking-tight flex items-center gap-1.5">
              <span>{customTitle || (isMr ? "थेट कृषी नकाशा आणि बाजार नेटवर्क" : "National Live Agriculture Network")}</span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              Center: {viewCenter.lat.toFixed(3)}°N, {viewCenter.lng.toFixed(3)}°E • Zoom: {zoomLevel.toFixed(1)}x
            </div>
          </div>
        </div>

        {/* Layer Toggle Button */}
        <div className="relative pointer-events-auto">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowLayerMenu(!showLayerMenu)}
            className="h-8 text-xs bg-slate-900/85 backdrop-blur-md border-slate-700 text-slate-200 hover:text-white hover:bg-slate-800"
          >
            <Layers className="w-3.5 h-3.5 mr-1 text-emerald-400" />
            <span className="hidden sm:inline">{isMr ? "स्तर" : "Layers"}</span>
          </Button>

          {/* Layer Menu Dropdown */}
          {showLayerMenu && (
            <div className="absolute right-0 top-10 w-52 bg-slate-900/95 backdrop-blur-xl border border-slate-700 rounded-xl p-3 shadow-2xl z-20 space-y-2 text-xs text-slate-200">
              <div className="font-bold text-white border-b border-slate-700 pb-1.5 flex items-center justify-between">
                <span>{isMr ? "नकाशा स्तर निवडा" : "Map Layer Filters"}</span>
                <button
                  onClick={() => setShowLayerMenu(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <label className="flex items-center justify-between cursor-pointer hover:bg-slate-800/60 p-1 rounded">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  {isMr ? "माझे शेत स्थान" : "Farmer Location"}
                </span>
                <input
                  type="checkbox"
                  checked={layers.farmer}
                  onChange={(e) => setLayers({ ...layers, farmer: e.target.checked })}
                  className="accent-emerald-600"
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer hover:bg-slate-800/60 p-1 rounded">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-400" />
                  {isMr ? "कृषी बाजार समित्या (APMC)" : "APMC Mandis"}
                </span>
                <input
                  type="checkbox"
                  checked={layers.mandis}
                  onChange={(e) => setLayers({ ...layers, mandis: e.target.checked })}
                  className="accent-emerald-600"
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer hover:bg-slate-800/60 p-1 rounded">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  {isMr ? "एफपीओ संकलन हब" : "FPO Hubs & Centers"}
                </span>
                <input
                  type="checkbox"
                  checked={layers.fpos}
                  onChange={(e) => setLayers({ ...layers, fpos: e.target.checked })}
                  className="accent-emerald-600"
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer hover:bg-slate-800/60 p-1 rounded">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-400" />
                  {isMr ? "सामायिक वाहतूक पूल" : "Active Freight Pools"}
                </span>
                <input
                  type="checkbox"
                  checked={layers.pools}
                  onChange={(e) => setLayers({ ...layers, pools: e.target.checked })}
                  className="accent-emerald-600"
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer hover:bg-slate-800/60 p-1 rounded">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-400" />
                  {isMr ? "खरेदीदार यार्ड" : "Institutional Buyers"}
                </span>
                <input
                  type="checkbox"
                  checked={layers.buyers}
                  onChange={(e) => setLayers({ ...layers, buyers: e.target.checked })}
                  className="accent-emerald-600"
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer hover:bg-slate-800/60 p-1 rounded border-t border-slate-700/60 pt-1.5">
                <span className="flex items-center gap-1.5 text-emerald-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  {isMr ? "शोध परीघ वर्तुळ" : "Radius Overlay"}
                </span>
                <input
                  type="checkbox"
                  checked={layers.radius}
                  onChange={(e) => setLayers({ ...layers, radius: e.target.checked })}
                  className="accent-emerald-600"
                />
              </label>
            </div>
          )}
        </div>
      </div>

      {/* Floating Tactical Zoom & Navigation Controls */}
      <div className="absolute right-3 bottom-5 flex flex-col gap-1.5 z-10">
        <Button
          size="icon"
          variant="outline"
          onClick={handleZoomIn}
          title="Zoom In (+)"
          className="w-8 h-8 rounded-lg bg-slate-900/90 backdrop-blur-md border-slate-700 text-white hover:bg-emerald-600 hover:border-emerald-500 shadow-lg"
        >
          <ZoomIn className="w-4 h-4" />
        </Button>
        <Button
          size="icon"
          variant="outline"
          onClick={handleZoomOut}
          title="Zoom Out (-)"
          className="w-8 h-8 rounded-lg bg-slate-900/90 backdrop-blur-md border-slate-700 text-white hover:bg-emerald-600 hover:border-emerald-500 shadow-lg"
        >
          <ZoomOut className="w-4 h-4" />
        </Button>
        <Button
          size="icon"
          variant="outline"
          onClick={handleFitAll}
          title="Fit All Results"
          className="w-8 h-8 rounded-lg bg-slate-900/90 backdrop-blur-md border-slate-700 text-emerald-400 hover:bg-slate-800 shadow-lg"
        >
          <Crosshair className="w-4 h-4" />
        </Button>
        <Button
          size="icon"
          variant="outline"
          onClick={handleLocateMe}
          title="Locate Device GPS"
          className="w-8 h-8 rounded-lg bg-slate-900/90 backdrop-blur-md border-slate-700 text-blue-400 hover:bg-slate-800 shadow-lg"
        >
          <Navigation className="w-4 h-4" />
        </Button>
        <Button
          size="icon"
          variant="outline"
          onClick={handleResetView}
          title="Reset Center"
          className="w-8 h-8 rounded-lg bg-slate-900/90 backdrop-blur-md border-slate-700 text-slate-300 hover:bg-slate-800 shadow-lg"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </Button>
        <Button
          size="icon"
          variant="outline"
          onClick={toggleFullscreen}
          title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          className="w-8 h-8 rounded-lg bg-slate-900/90 backdrop-blur-md border-slate-700 text-slate-300 hover:bg-slate-800 shadow-lg"
        >
          {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
        </Button>
      </div>

      {/* Markers Layer */}
      <div className="absolute inset-0 pointer-events-none">
        {allMarkers.map((marker) => {
          const pos = project(marker.lat, marker.lng);
          if (!pos.visible) return null;

          const isSelected = activePopup?.id === marker.id;

          // Distinct styling per marker type
          let pinBg = "bg-blue-600 border-blue-400 text-white";
          let Icon = Store;

          if (marker.type === "farmer") {
            pinBg = "bg-emerald-600 border-emerald-300 text-white animate-bounce";
            Icon = MapPin;
          } else if (marker.type === "fpo") {
            pinBg = "bg-amber-600 border-amber-300 text-white";
            Icon = Users;
          } else if (marker.type === "pool") {
            pinBg = "bg-purple-600 border-purple-300 text-white";
            Icon = Truck;
          } else if (marker.type === "buyer") {
            pinBg = "bg-rose-600 border-rose-300 text-white";
            Icon = ShoppingCart;
          } else if (marker.type === "pin") {
            pinBg = "bg-indigo-600 border-indigo-300 text-white animate-pulse";
            Icon = Crosshair;
          }

          return (
            <div
              key={marker.id}
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                transform: "translate(-50%, -100%)",
              }}
              onClick={(e) => {
                e.stopPropagation();
                setActivePopup(marker);
                if (onSelectMarker) onSelectMarker(marker);
              }}
              className={`absolute pointer-events-auto cursor-pointer group transition-all duration-200 z-10 hover:z-30 ${
                isSelected ? "scale-125 z-40" : ""
              }`}
            >
              {/* Marker Tooltip on Hover */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-900/90 text-white text-[10px] font-medium px-2 py-0.5 rounded shadow-lg border border-slate-700 pointer-events-none">
                {marker.name} {marker.price ? `(₹${marker.price})` : ""}
              </div>

              {/* Pin Icon Bubble */}
              <div
                className={`flex items-center gap-1 px-1.5 py-1 rounded-full border-2 shadow-lg transition-transform group-hover:scale-110 ${pinBg} ${
                  isSelected ? "ring-4 ring-emerald-400 ring-offset-2 ring-offset-slate-950" : ""
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                {marker.badge && (
                  <span className="text-[9px] font-bold tracking-tight pr-0.5 max-w-[80px] truncate">
                    {marker.badge}
                  </span>
                )}
              </div>

              {/* Pin Tip Arrow */}
              <div className="w-1.5 h-1.5 bg-slate-900 rotate-45 mx-auto -mt-1 border-r border-b border-slate-700" />
            </div>
          );
        })}
      </div>

      {/* Selected Marker Rich Popup Card */}
      {activePopup && (
        <div className="absolute left-4 bottom-5 max-w-xs sm:max-w-sm w-full bg-slate-900/95 backdrop-blur-xl border border-slate-700 rounded-2xl p-4 shadow-2xl z-30 animate-in fade-in slide-in-from-bottom-3 duration-200 text-slate-100">
          <div className="flex items-start justify-between gap-2 mb-2 pb-2 border-b border-slate-800">
            <div className="overflow-hidden">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge
                  variant="outline"
                  className={`text-[10px] py-0 px-2 uppercase font-bold tracking-wider ${
                    activePopup.type === "farmer"
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                      : activePopup.type === "mandi"
                      ? "bg-blue-500/20 text-blue-300 border-blue-500/40"
                      : activePopup.type === "fpo"
                      ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                      : activePopup.type === "pool"
                      ? "bg-purple-500/20 text-purple-300 border-purple-500/40"
                      : "bg-rose-500/20 text-rose-300 border-rose-500/40"
                  }`}
                >
                  {activePopup.type.toUpperCase()}
                </Badge>
                {activePopup.price && (
                  <span className="text-xs font-bold text-emerald-400 flex items-center">
                    <IndianRupee className="w-3 h-3" />
                    {activePopup.price}/qtl
                  </span>
                )}
              </div>
              <h4 className="font-bold text-sm text-white mt-1 truncate">{activePopup.name}</h4>
              <p className="text-xs text-slate-400 truncate">{activePopup.subtext}</p>
            </div>
            <button
              onClick={() => setActivePopup(null)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-2 text-xs py-1 text-slate-300">
            {activePopup.distanceKm !== undefined && (
              <div className="bg-slate-800/60 p-2 rounded-lg border border-slate-700/50">
                <span className="text-[10px] text-slate-400 block">{isMr ? "अंतर" : "Distance"}</span>
                <span className="font-semibold text-white">
                  {activePopup.distanceKm.toFixed(1)} km
                </span>
              </div>
            )}
            {activePopup.travelTimeHours !== undefined && (
              <div className="bg-slate-800/60 p-2 rounded-lg border border-slate-700/50">
                <span className="text-[10px] text-slate-400 block">{isMr ? "प्रवास वेळ" : "Travel Time"}</span>
                <span className="font-semibold text-white">
                  {formatTravelTime(activePopup.travelTimeHours)}
                </span>
              </div>
            )}
          </div>

          {/* Extra Detail Rows */}
          {activePopup.details && (
            <div className="mt-2 space-y-1 text-[11px] text-slate-300 border-t border-slate-800/80 pt-2">
              {Object.entries(activePopup.details).map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <span className="text-slate-400">{k}:</span>
                  <span className="font-medium text-slate-200">{v}</span>
                </div>
              ))}
            </div>
          )}

          {/* Phone action */}
          {activePopup.phone && (
            <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-slate-400 flex items-center gap-1">
                <Phone className="w-3 h-3 text-emerald-400" /> {activePopup.phone}
              </span>
              <a
                href={`tel:${activePopup.phone}`}
                className="px-2.5 py-1 bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 rounded border border-emerald-500/40 text-[11px] font-semibold"
              >
                {isMr ? "कॉल करा" : "Call"}
              </a>
            </div>
          )}
        </div>
      )}

      {/* Click-to-pick indicator banner */}
      {allowClickToPickLocation && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-indigo-900/90 backdrop-blur-md px-3 py-1 rounded-full border border-indigo-400/50 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xl pointer-events-none">
          <Crosshair className="w-3.5 h-3.5 text-indigo-300 animate-spin" />
          <span>{isMr ? "नकाशावर कुठेही क्लिक करून स्थान निवडा" : "Click anywhere on map to set coordinates"}</span>
        </div>
      )}
    </div>
  );
}
