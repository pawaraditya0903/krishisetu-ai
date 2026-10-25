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
  Globe,
  Mountain,
  Map as MapIcon,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

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

type MapTileStyle = "satellite" | "streets" | "terrain";

const RADIUS_PRESETS = [25, 50, 100, 200, 300, 500, 1000];

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
    setSearchRadiusKm,
  } = useAppStore();

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const tileLayersRef = useRef<{ [key: string]: any }>({});
  const markersLayerRef = useRef<any>(null);
  const circleLayerRef = useRef<any>(null);
  const pickPinMarkerRef = useRef<any>(null);

  const [mapStyle, setMapStyle] = useState<MapTileStyle>("satellite");
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showRangePanel, setShowRangePanel] = useState(false);
  const [showLayersPanel, setShowLayersPanel] = useState(false);

  // Active Radius State (synchronized with store or prop)
  const currentRadius = radiusKm ?? searchRadiusKm ?? 100;
  const [localRadius, setLocalRadius] = useState<number>(currentRadius);

  useEffect(() => {
    setLocalRadius(radiusKm ?? searchRadiusKm ?? 100);
  }, [radiusKm, searchRadiusKm]);

  // Center Coordinates
  const effectiveLat = centerLat ?? farmLocation?.lat ?? 19.2608;
  const effectiveLng = centerLng ?? farmLocation?.lng ?? 76.7748;

  // Layer Toggles
  const [layers, setLayers] = useState({
    farmer: true,
    mandis: true,
    fpos: true,
    pools: true,
    buyers: true,
    radius: showRadiusOverlay,
  });

  // Selected Marker State for UI Card
  const [activePopupMarker, setActivePopupMarker] = useState<MapMarkerItem | null>(null);

  // Compile list of markers
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
        subtext: isMr ? "आपले शेत / मुख्य स्थान" : "Your Farm / Farm Gate",
        lat: farmLocation.lat,
        lng: farmLocation.lng,
        badge: isMr ? "माझे शेत" : "My Farm",
      });
    }

    // 2. Picked Location Pin
    if (pickedPinCoords) {
      list.push({
        id: "picked-pin",
        type: "pin",
        name: isMr ? "निवडलेले स्थान" : "Selected Pin",
        subtext: `${pickedPinCoords.lat.toFixed(4)}°N, ${pickedPinCoords.lng.toFixed(4)}°E`,
        lat: pickedPinCoords.lat,
        lng: pickedPinCoords.lng,
        badge: "Custom Pin",
      });
    }

    // 3. APMC Mandis (from Mandis Master & Prices)
    if (layers.mandis) {
      mandisMaster.forEach((m) => {
        if (m.status === "Inactive") return;
        const matchingPrice = mandiPrices.find((p) => p.mandi.toLowerCase().includes(m.mandi.toLowerCase()) || m.mandi.toLowerCase().includes(p.mandi.toLowerCase()));
        const dist = calculateDistanceKm(effectiveLat, effectiveLng, m.lat, m.lng);

        list.push({
          id: m.id,
          type: "mandi",
          name: m.mandi,
          subtext: `${m.district}, ${m.state}`,
          lat: m.lat,
          lng: m.lng,
          price: matchingPrice?.modalPrice || 2400,
          distanceKm: dist,
          travelTimeHours: dist / 45,
          badge: matchingPrice ? `₹${matchingPrice.modalPrice}/qtl` : `${m.supportedCrops[0] || "Mandi"}`,
          phone: m.phone,
          details: {
            "Modal Rate": matchingPrice ? `₹${matchingPrice.modalPrice}/qtl` : "₹2,400/qtl",
            "Arrivals": matchingPrice ? `${matchingPrice.arrivalsQtl} qtl` : "420 qtl",
            "Distance": `${dist} km`,
            "Travel Time": formatTravelTime(dist / 45),
            "Commodities": m.supportedCrops.slice(0, 3).join(", "),
          },
          data: m,
        });
      });
    }

    // 4. FPO Collection Centers
    if (layers.fpos) {
      fpos.forEach((fpo) => {
        if (fpo.status === "Inactive") return;
        const dist = calculateDistanceKm(effectiveLat, effectiveLng, fpo.lat, fpo.lng);
        list.push({
          id: fpo.id,
          type: "fpo",
          name: fpo.name,
          subtext: `${fpo.taluka}, ${fpo.district}`,
          lat: fpo.lat,
          lng: fpo.lng,
          distanceKm: dist,
          travelTimeHours: dist / 40,
          badge: "FPO Hub",
          phone: fpo.phone,
          details: {
            "FPO Organization": fpo.name,
            "Service Fee": `₹${fpo.serviceFeePaisePerQtl / 100}/qtl`,
            "Distance": `${dist} km`,
            "Contact": fpo.contactPerson,
          },
          data: fpo,
        });
      });
    }

    // 5. Active Freight Pools
    if (layers.pools) {
      pools.forEach((pool) => {
        if (pool.status === "Delivered" || pool.status === "Closed") return;
        const matchedFpo = fpos.find(
          (f) =>
            f.name.toLowerCase().includes(pool.collectionHub.toLowerCase()) ||
            pool.collectionHub.toLowerCase().includes(f.name.toLowerCase())
        );
        const pLat = matchedFpo?.lat || (effectiveLat + 0.05);
        const pLng = matchedFpo?.lng || (effectiveLng + 0.05);
        const dist = calculateDistanceKm(effectiveLat, effectiveLng, pLat, pLng);

        list.push({
          id: pool.id,
          type: "pool",
          name: `${pool.crop} Freight Pool`,
          subtext: `${pool.collectionHub} → ${pool.destinationMandi}`,
          lat: pLat,
          lng: pLng,
          distanceKm: dist,
          badge: `${Math.round((pool.currentKg / 1000) * 10) / 10} / ${Math.round(pool.targetKg / 1000)} MT`,
          details: {
            "Crop": pool.crop,
            "Target Mandi": pool.destinationMandi,
            "Progress": `${Math.round((pool.currentKg / pool.targetKg) * 100)}% Filled`,
            "Cost Saving": `~${pool.sharedFreightSavingsPct}% vs Solo`,
          },
          data: pool,
        });
      });
    }

    // 6. Institutional Buyers
    if (layers.buyers) {
      users.filter((u) => u.role === "buyer" && u.status === "Active" && u.lat && u.lng).forEach((buyer) => {
        const bLat = buyer.lat || 18.5204;
        const bLng = buyer.lng || 73.8567;
        const dist = calculateDistanceKm(effectiveLat, effectiveLng, bLat, bLng);
        list.push({
          id: buyer.id,
          type: "buyer",
          name: buyer.name,
          subtext: buyer.organization || `${buyer.district}, ${buyer.state}`,
          lat: bLat,
          lng: bLng,
          distanceKm: dist,
          badge: "Buyer",
          phone: buyer.phone,
          details: {
            "Entity": buyer.organization || "Verified Purchaser",
            "Distance": `${dist} km`,
            "Payment Score": `${buyer.paymentReliabilityScore || 98}%`,
          },
          data: buyer,
        });
      });
    }

    return list;
  }, [extraMarkers, farmLocation, layers, mandisMaster, mandiPrices, fpos, pools, users, effectiveLat, effectiveLng, isMr, pickedPinCoords]);

  // Mandis in current radius count
  const mandisInRange = useMemo(() => {
    return allMarkers.filter((m) => m.type === "mandi" && (m.distanceKm || 0) <= localRadius);
  }, [allMarkers, localRadius]);

  // Initialize Leaflet Map
  useEffect(() => {
    let isMounted = true;

    async function initLeaflet() {
      if (typeof window === "undefined" || !mapContainerRef.current) return;

      const L = (await import("leaflet")).default || (await import("leaflet"));

      // Avoid double initialization
      if (mapInstanceRef.current) {
        return;
      }

      // Initialize map instance
      const map = L.map(mapContainerRef.current, {
        center: [effectiveLat, effectiveLng],
        zoom: localRadius > 300 ? 7 : localRadius > 100 ? 8 : 9,
        zoomControl: false,
        attributionControl: false,
      });

      mapInstanceRef.current = map;

      // Base Tile Layers:
      // 1. Satellite Imagery (ESRI World Imagery) + Reference Overlays
      const esriSatellite = L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        {
          maxZoom: 19,
          attribution: "Tiles &copy; Esri &mdash; Earthstar Geographics",
        }
      );

      const esriLabels = L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
        {
          maxZoom: 19,
        }
      );

      const satelliteGroup = L.layerGroup([esriSatellite, esriLabels]);

      // 2. Streets Layer (Carto Voyager / OpenStreetMap)
      const streetsLayer = L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
        {
          maxZoom: 19,
          attribution: "&copy; OpenStreetMap &copy; CARTO",
        }
      );

      // 3. Terrain Layer (ESRI World Topo)
      const terrainLayer = L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}",
        {
          maxZoom: 18,
          attribution: "Tiles &copy; Esri",
        }
      );

      tileLayersRef.current = {
        satellite: satelliteGroup,
        streets: streetsLayer,
        terrain: terrainLayer,
      };

      // Add default tile layer (Satellite)
      satelliteGroup.addTo(map);

      // Layer groups for markers and dynamic circle
      circleLayerRef.current = L.layerGroup().addTo(map);
      markersLayerRef.current = L.layerGroup().addTo(map);

      // Click to pick location
      map.on("click", (e: any) => {
        if (allowClickToPickLocation && onPickLocation) {
          onPickLocation({ lat: e.latlng.lat, lng: e.latlng.lng });
        }
      });

      if (isMounted) {
        setIsMapLoaded(true);
      }
    }

    initLeaflet();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Base Tile Layer when mapStyle changes
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayersRef.current.satellite) return;

    const map = mapInstanceRef.current;
    Object.values(tileLayersRef.current).forEach((layer: any) => {
      if (map.hasLayer(layer)) {
        map.removeLayer(layer);
      }
    });

    const targetLayer = tileLayersRef.current[mapStyle];
    if (targetLayer) {
      targetLayer.addTo(map);
    }
  }, [mapStyle]);

  // Update Dynamic Search Radius Circle
  useEffect(() => {
    if (!mapInstanceRef.current || !circleLayerRef.current) return;

    async function drawCircle() {
      const L = (await import("leaflet")).default || (await import("leaflet"));
      const circleGroup = circleLayerRef.current;
      circleGroup.clearLayers();

      if (layers.radius && localRadius > 0) {
        // Outer glow circle
        const radiusCircle = L.circle([effectiveLat, effectiveLng], {
          radius: localRadius * 1000,
          color: "#10b981",
          weight: 2.5,
          opacity: 0.85,
          dashArray: "6, 8",
          fillColor: "#10b981",
          fillOpacity: 0.12,
        });

        radiusCircle.bindTooltip(
          `${localRadius} km ${isMr ? "शोध मर्यादा" : "Search Radius"} (${mandisInRange.length} ${isMr ? "मंडया" : "Mandis"})`,
          {
            permanent: false,
            direction: "top",
            className: "bg-emerald-950 text-emerald-200 text-xs px-2 py-1 rounded shadow border border-emerald-500",
          }
        );

        radiusCircle.addTo(circleGroup);
      }
    }

    drawCircle();
  }, [layers.radius, localRadius, effectiveLat, effectiveLng, isMr, mandisInRange.length]);

  // Update Markers on Leaflet Map
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    async function drawMarkers() {
      const L = (await import("leaflet")).default || (await import("leaflet"));
      const markersGroup = markersLayerRef.current;
      markersGroup.clearLayers();

      allMarkers.forEach((m) => {
        const isSelected = selectedMarkerId === m.id;

        // Custom HTML Marker Icon
        let iconHtml = "";
        let iconSize: [number, number] = [36, 36];
        let anchor: [number, number] = [18, 18];

        if (m.type === "farmer") {
          iconHtml = `
            <div class="relative flex items-center justify-center cursor-pointer group">
              <span class="absolute w-10 h-10 rounded-full bg-emerald-400/40 animate-ping"></span>
              <div class="w-9 h-9 rounded-full bg-emerald-700 border-2 border-white shadow-xl flex items-center justify-center text-white text-sm font-bold">
                📍
              </div>
              <div class="absolute -bottom-6 whitespace-nowrap bg-emerald-950/90 text-emerald-200 px-2 py-0.5 rounded text-[10px] font-bold shadow border border-emerald-500/50">
                ${m.name.split(",")[0]}
              </div>
            </div>
          `;
          iconSize = [40, 50];
          anchor = [20, 25];
        } else if (m.type === "pin") {
          iconHtml = `
            <div class="relative flex items-center justify-center cursor-pointer">
              <div class="w-8 h-8 rounded-full bg-rose-600 border-2 border-white shadow-2xl flex items-center justify-center text-white text-xs font-bold animate-bounce">
                🎯
              </div>
            </div>
          `;
          iconSize = [32, 32];
          anchor = [16, 16];
        } else if (m.type === "mandi") {
          const inRange = (m.distanceKm || 0) <= localRadius;
          iconHtml = `
            <div class="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold shadow-xl border cursor-pointer transition-all transform hover:scale-110 ${
              isSelected
                ? "bg-amber-400 text-slate-950 border-amber-300 ring-2 ring-amber-500 scale-110"
                : inRange
                ? "bg-rose-600 text-white border-rose-400 hover:bg-rose-700"
                : "bg-slate-800/80 text-slate-300 border-slate-600 opacity-75"
            }">
              <span class="text-[11px]">🏢</span>
              <span class="text-[10px] font-extrabold">${m.badge || m.name.split(" ")[0]}</span>
            </div>
          `;
          iconSize = [90, 28];
          anchor = [45, 14];
        } else if (m.type === "fpo") {
          iconHtml = `
            <div class="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold shadow-xl border bg-blue-600 text-white border-blue-400 cursor-pointer hover:bg-blue-700">
              <span class="text-[11px]">🏭</span>
              <span class="text-[10px] font-semibold">${m.name.split(" ")[0]}</span>
            </div>
          `;
          iconSize = [80, 28];
          anchor = [40, 14];
        } else if (m.type === "pool") {
          iconHtml = `
            <div class="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold shadow-xl border bg-amber-500 text-slate-950 border-amber-300 cursor-pointer hover:bg-amber-600">
              <span class="text-[11px]">🚚</span>
              <span class="text-[10px] font-bold">${m.badge || "Pool"}</span>
            </div>
          `;
          iconSize = [75, 28];
          anchor = [37, 14];
        } else if (m.type === "buyer") {
          iconHtml = `
            <div class="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold shadow-xl border bg-purple-600 text-white border-purple-400 cursor-pointer hover:bg-purple-700">
              <span class="text-[11px]">🛒</span>
              <span class="text-[10px] font-semibold">${m.name.split(" ")[0]}</span>
            </div>
          `;
          iconSize = [75, 28];
          anchor = [37, 14];
        }

        const customIcon = L.divIcon({
          className: "clean-leaflet-div-icon",
          html: iconHtml,
          iconSize,
          iconAnchor: anchor,
        });

        const marker = L.marker([m.lat, m.lng], { icon: customIcon });

        // Popup Content
        const popupContent = `
          <div class="p-2 text-slate-900 font-sans max-w-[240px]">
            <div class="font-bold text-sm text-emerald-950 mb-0.5">${m.name}</div>
            ${m.subtext ? `<div class="text-[11px] text-slate-500 mb-2">${m.subtext}</div>` : ""}
            
            <div class="space-y-1 py-1.5 border-t border-slate-100 text-xs">
              ${m.price ? `<div class="flex justify-between font-bold text-emerald-800"><span>Modal Rate:</span><span>₹${m.price}/qtl</span></div>` : ""}
              ${m.distanceKm !== undefined ? `<div class="flex justify-between text-slate-600"><span>Distance:</span><span>${m.distanceKm} km</span></div>` : ""}
              ${m.travelTimeHours ? `<div class="flex justify-between text-slate-600"><span>Travel Time:</span><span>${formatTravelTime(m.travelTimeHours)}</span></div>` : ""}
            </div>

            <div class="pt-2 mt-2 border-t border-slate-100 flex gap-1">
              <a href="https://www.google.com/maps/dir/?api=1&destination=${m.lat},${m.lng}" target="_blank" rel="noopener noreferrer" class="text-[10px] text-emerald-700 font-bold hover:underline flex items-center">
                Directions ↗
              </a>
            </div>
          </div>
        `;

        marker.bindPopup(popupContent, {
          closeButton: false,
          offset: [0, -10],
          className: "custom-modern-popup",
        });

        marker.on("click", () => {
          setActivePopupMarker(m);
          if (onSelectMarker) onSelectMarker(m);
        });

        marker.addTo(markersGroup);
      });
    }

    drawMarkers();
  }, [allMarkers, selectedMarkerId, localRadius, onSelectMarker]);

  // Center or flyTo when center coordinates change
  useEffect(() => {
    if (mapInstanceRef.current && centerLat !== undefined && centerLng !== undefined) {
      mapInstanceRef.current.flyTo([centerLat, centerLng], mapInstanceRef.current.getZoom(), {
        animate: true,
        duration: 0.8,
      });
    }
  }, [centerLat, centerLng]);

  // Handle Radius Change (Slider or Pill)
  const handleRadiusChange = (newRadius: number) => {
    setLocalRadius(newRadius);
    setSearchRadiusKm(newRadius);
  };

  // Zoom In / Out
  const handleZoomIn = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomIn();
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomOut();
  };

  // Reset to Farm Center
  const handleLocateMe = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([effectiveLat, effectiveLng], 10, {
        animate: true,
        duration: 1,
      });
    }
  };

  // Fit All Markers & Radius
  const handleFitAll = () => {
    if (!mapInstanceRef.current) return;
    async function fitBounds() {
      const L = (await import("leaflet")).default || (await import("leaflet"));
      if (allMarkers.length === 0) return;
      const bounds = L.latLngBounds(allMarkers.map((m) => [m.lat, m.lng]));
      mapInstanceRef.current.fitBounds(bounds.pad(0.15));
    }
    fitBounds();
  };

  // Fit Radius Circle
  const handleFitRadius = () => {
    if (!mapInstanceRef.current) return;
    async function fitCircle() {
      const L = (await import("leaflet")).default || (await import("leaflet"));
      const circleBounds = L.latLng([effectiveLat, effectiveLng]).toBounds(localRadius * 1000 * 2);
      mapInstanceRef.current.fitBounds(circleBounds.pad(0.1));
    }
    fitCircle();
  };

  return (
    <div
      className={`relative w-full ${
        isFullscreen
          ? "fixed inset-0 z-50 h-screen w-screen bg-slate-950 p-0"
          : `${heightClassName} rounded-2xl overflow-hidden border border-slate-700/60 shadow-xl bg-slate-950`
      }`}
    >
      {/* Real Leaflet Map Container */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Top Header Bar: Title, Satellite Switcher, Custom Range & Tools */}
      <div className="absolute top-2.5 left-2.5 right-2.5 z-10 flex items-center justify-between gap-2 pointer-events-none flex-wrap">
        {/* Title & Coordinates Badge */}
        <div className="bg-slate-950/85 backdrop-blur-md border border-slate-700/80 px-3 py-1.5 rounded-xl text-white shadow-lg pointer-events-auto flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-bold tracking-tight">
            {customTitle || (isMr ? "थेट उपग्रह कृषी नकाशा" : "Live Satellite Agri Grid")}
          </span>
          <Badge
            variant="outline"
            className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-[10px] px-1.5 py-0"
          >
            {mapStyle.toUpperCase()}
          </Badge>
        </div>

        {/* Top Controls: Satellite / Street Switcher + Range Drawer Button */}
        <div className="flex items-center gap-1.5 pointer-events-auto">
          {/* Map Style Selector (Satellite, Streets, Terrain) */}
          <div className="bg-slate-950/85 backdrop-blur-md border border-slate-700/80 rounded-xl p-0.5 flex items-center shadow-lg text-xs">
            <button
              onClick={() => setMapStyle("satellite")}
              className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition-all ${
                mapStyle === "satellite"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{isMr ? "उपग्रह" : "Satellite"}</span>
            </button>
            <button
              onClick={() => setMapStyle("streets")}
              className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition-all ${
                mapStyle === "streets"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>{isMr ? "रस्ते" : "Streets"}</span>
            </button>
            <button
              onClick={() => setMapStyle("terrain")}
              className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition-all ${
                mapStyle === "terrain"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              <Mountain className="w-3.5 h-3.5" />
              <span>{isMr ? "भूप्रदेश" : "Terrain"}</span>
            </button>
          </div>

          {/* Customize Range Button */}
          <Button
            size="sm"
            onClick={() => setShowRangePanel(!showRangePanel)}
            className={`text-xs font-bold border shadow-lg ${
              showRangePanel
                ? "bg-amber-500 hover:bg-amber-600 text-slate-950 border-amber-300 ring-2 ring-amber-400"
                : "bg-slate-950/85 hover:bg-slate-900 text-emerald-300 border-emerald-500/50"
            }`}
          >
            <Sliders className="w-3.5 h-3.5 mr-1" />
            <span>{localRadius} km</span>
          </Button>

          {/* Layers Toggle Button */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowLayersPanel(!showLayersPanel)}
            className="bg-slate-950/85 hover:bg-slate-900 text-slate-200 border-slate-700/80 text-xs px-2.5"
          >
            <Layers className="w-3.5 h-3.5" />
          </Button>

          {/* Fullscreen Button */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="bg-slate-950/85 hover:bg-slate-900 text-slate-200 border-slate-700/80 text-xs px-2.5"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </Button>
        </div>
      </div>

      {/* Floating Expandable Range Customizer Panel */}
      {showRangePanel && (
        <div className="absolute top-14 left-2.5 right-2.5 sm:left-auto sm:right-2.5 sm:w-96 z-20 bg-slate-950/95 backdrop-blur-xl border border-emerald-500/40 rounded-2xl p-4 text-white shadow-2xl space-y-3 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-400" />
              <h4 className="font-bold text-xs uppercase tracking-wider text-emerald-300">
                {isMr ? "शोध त्रिज्या सानुकूल करा" : "Customize Search Radius"}
              </h4>
            </div>
            <button
              onClick={() => setShowRangePanel(false)}
              className="w-6 h-6 rounded-full hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Preset Pills */}
          <div>
            <div className="text-[11px] text-slate-400 font-semibold mb-1.5">
              {isMr ? "द्रुत निवडी (Quick Presets):" : "Quick Presets:"}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {RADIUS_PRESETS.map((preset) => (
                <button
                  key={preset}
                  onClick={() => handleRadiusChange(preset)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    localRadius === preset
                      ? "bg-emerald-600 text-white ring-2 ring-emerald-400 shadow-sm"
                      : "bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700"
                  }`}
                >
                  {preset >= 1000 ? (isMr ? "सर्व भारत" : "Pan-India") : `${preset} km`}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Range Slider */}
          <div className="space-y-1 pt-1">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-medium">{isMr ? "त्रिज्या स्लायडर:" : "Radius Slider:"}</span>
              <span className="font-extrabold text-emerald-400 text-sm font-mono">{localRadius} km</span>
            </div>
            <input
              type="range"
              min="10"
              max="1000"
              step="5"
              value={localRadius}
              onChange={(e) => handleRadiusChange(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>10 km</span>
              <span>250 km</span>
              <span>500 km</span>
              <span>1000 km</span>
            </div>
          </div>

          {/* Manual Input & Stats */}
          <div className="flex items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-slate-400">{isMr ? "अचूक किमी:" : "Exact km:"}</span>
              <Input
                type="number"
                min="10"
                max="1500"
                value={localRadius}
                onChange={(e) => handleRadiusChange(Math.max(10, Math.min(1500, Number(e.target.value) || 10)))}
                className="w-20 h-7 text-xs bg-slate-900 border-slate-700 text-white font-mono px-2"
              />
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleFitRadius}
              className="text-[10px] h-7 bg-emerald-950/60 text-emerald-300 border-emerald-600/60 hover:bg-emerald-900 px-2"
            >
              {isMr ? "नकाशा जुळवा" : "Fit Range View"}
            </Button>
          </div>

          {/* Live Markets Found In Range */}
          <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-2 flex items-center justify-between text-xs">
            <span className="text-emerald-200 font-medium flex items-center gap-1.5">
              <span>🌾</span>
              <span>{isMr ? "कक्षेतील मंडया:" : "Markets in Range:"}</span>
            </span>
            <Badge className="bg-emerald-600 text-white font-bold font-mono">
              {mandisInRange.length} APMCs
            </Badge>
          </div>
        </div>
      )}

      {/* Floating Layers Panel */}
      {showLayersPanel && (
        <div className="absolute top-14 right-2.5 w-64 z-20 bg-slate-950/95 backdrop-blur-xl border border-slate-700 rounded-2xl p-3 text-white shadow-2xl space-y-2 animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
            <span className="font-bold text-xs uppercase tracking-wider text-slate-300">
              {isMr ? "नकाशा स्तर (Layers)" : "Map Layers"}
            </span>
            <button
              onClick={() => setShowLayersPanel(false)}
              className="w-5 h-5 rounded-full hover:bg-slate-800 flex items-center justify-center text-slate-400"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-1.5 text-xs">
            <label className="flex items-center justify-between cursor-pointer py-0.5">
              <span className="flex items-center gap-1.5">📍 {isMr ? "शेत स्थान" : "Farm Pin"}</span>
              <input
                type="checkbox"
                checked={layers.farmer}
                onChange={(e) => setLayers({ ...layers, farmer: e.target.checked })}
                className="rounded accent-emerald-500"
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer py-0.5">
              <span className="flex items-center gap-1.5">🏢 {isMr ? "एपीएमसी मंडया" : "APMC Mandis"}</span>
              <input
                type="checkbox"
                checked={layers.mandis}
                onChange={(e) => setLayers({ ...layers, mandis: e.target.checked })}
                className="rounded accent-emerald-500"
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer py-0.5">
              <span className="flex items-center gap-1.5">🏭 {isMr ? "एफपीओ केंद्रे" : "FPO Hubs"}</span>
              <input
                type="checkbox"
                checked={layers.fpos}
                onChange={(e) => setLayers({ ...layers, fpos: e.target.checked })}
                className="rounded accent-emerald-500"
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer py-0.5">
              <span className="flex items-center gap-1.5">🚚 {isMr ? "वाहतूक पूल" : "Freight Pools"}</span>
              <input
                type="checkbox"
                checked={layers.pools}
                onChange={(e) => setLayers({ ...layers, pools: e.target.checked })}
                className="rounded accent-emerald-500"
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer py-0.5">
              <span className="flex items-center gap-1.5">🛒 {isMr ? "खरेदीदार" : "Buyers"}</span>
              <input
                type="checkbox"
                checked={layers.buyers}
                onChange={(e) => setLayers({ ...layers, buyers: e.target.checked })}
                className="rounded accent-emerald-500"
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer py-0.5 border-t border-slate-800 pt-1 text-emerald-300">
              <span className="flex items-center gap-1.5">⭕ {isMr ? "शोध त्रिज्या रिंग" : "Radius Overlay"}</span>
              <input
                type="checkbox"
                checked={layers.radius}
                onChange={(e) => setLayers({ ...layers, radius: e.target.checked })}
                className="rounded accent-emerald-500"
              />
            </label>
          </div>
        </div>
      )}

      {/* Floating Bottom-Right Map Controls: Zoom, Locate, Fit All */}
      <div className="absolute bottom-4 right-3 z-10 flex flex-col gap-1.5">
        <button
          onClick={handleZoomIn}
          title="Zoom In"
          className="w-8 h-8 rounded-xl bg-slate-950/85 backdrop-blur-md border border-slate-700/80 text-white flex items-center justify-center hover:bg-slate-900 shadow-lg transition-transform active:scale-95"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomOut}
          title="Zoom Out"
          className="w-8 h-8 rounded-xl bg-slate-950/85 backdrop-blur-md border border-slate-700/80 text-white flex items-center justify-center hover:bg-slate-900 shadow-lg transition-transform active:scale-95"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleLocateMe}
          title="Center on Farm"
          className="w-8 h-8 rounded-xl bg-slate-950/85 backdrop-blur-md border border-emerald-500/60 text-emerald-400 flex items-center justify-center hover:bg-slate-900 shadow-lg transition-transform active:scale-95"
        >
          <Navigation className="w-4 h-4" />
        </button>
        <button
          onClick={handleFitAll}
          title="Fit All Markets"
          className="w-8 h-8 rounded-xl bg-slate-950/85 backdrop-blur-md border border-slate-700/80 text-white flex items-center justify-center hover:bg-slate-900 shadow-lg transition-transform active:scale-95"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Selected Marker Detail Card (Bottom Left Overlay) */}
      {activePopupMarker && (
        <div className="absolute bottom-4 left-3 right-14 sm:right-auto sm:w-80 z-10 bg-slate-950/90 backdrop-blur-xl border border-emerald-500/50 rounded-2xl p-3 text-white shadow-2xl animate-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm">
                  {activePopupMarker.type === "farmer" ? "📍" : activePopupMarker.type === "mandi" ? "🏢" : activePopupMarker.type === "fpo" ? "🏭" : activePopupMarker.type === "pool" ? "🚚" : "🛒"}
                </span>
                <h5 className="font-bold text-xs text-white truncate max-w-[180px]">{activePopupMarker.name}</h5>
              </div>
              {activePopupMarker.subtext && (
                <div className="text-[10px] text-slate-400 truncate">{activePopupMarker.subtext}</div>
              )}
            </div>
            <button
              onClick={() => setActivePopupMarker(null)}
              className="w-5 h-5 rounded-full hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white"
            >
              <X className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-800/80 text-[11px]">
            {activePopupMarker.price && (
              <div className="bg-emerald-950/50 p-1.5 rounded-lg border border-emerald-600/30">
                <span className="text-[9px] text-emerald-400 block font-semibold">Modal Price</span>
                <span className="font-extrabold text-emerald-300">₹{activePopupMarker.price}/qtl</span>
              </div>
            )}
            {activePopupMarker.distanceKm !== undefined && (
              <div className="bg-slate-900/60 p-1.5 rounded-lg border border-slate-800">
                <span className="text-[9px] text-slate-400 block font-semibold">Distance</span>
                <span className="font-bold text-slate-200">{activePopupMarker.distanceKm} km</span>
              </div>
            )}
          </div>

          <div className="mt-2.5 flex items-center justify-between gap-2">
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${activePopupMarker.lat},${activePopupMarker.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-slate-300 hover:text-white underline flex items-center gap-1"
            >
              Google Maps ↗
            </a>
            {activePopupMarker.type === "mandi" && onSelectMarker && (
              <Button
                size="sm"
                onClick={() => onSelectMarker(activePopupMarker)}
                className="h-6 text-[10px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2.5 py-0"
              >
                {isMr ? "दर गणना निवडा" : "Select for Payout"}
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {!isMapLoaded && (
        <div className="absolute inset-0 z-30 bg-slate-950 flex flex-col items-center justify-center text-white space-y-2">
          <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
          <span className="text-xs font-semibold text-slate-400">
            {isMr ? "उपग्रह नकाशा लोड होत आहे..." : "Loading High-Resolution Satellite Map..."}
          </span>
        </div>
      )}
    </div>
  );
}
