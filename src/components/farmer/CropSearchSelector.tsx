"use client";

import React, { useState, useEffect, useRef } from "react";
import { useStore } from "@/lib/store";
import { CropCatalogItem } from "@/lib/types";
import { apiClient } from "@/lib/api-client";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CropAddRequestModal } from "./CropAddRequestModal";
import {
  Search,
  Check,
  ChevronDown,
  Sparkles,
  Info,
  ShieldCheck,
  PlusCircle,
  X,
  Thermometer,
  Clock,
} from "lucide-react";

interface CropSearchSelectorProps {
  selectedCropId?: string;
  selectedVariety?: string;
  onCropChange: (crop: CropCatalogItem | null, variety: string, unit: string) => void;
  disabled?: boolean;
}

export function CropSearchSelector({
  selectedCropId,
  selectedVariety,
  onCropChange,
  disabled = false,
}: CropSearchSelectorProps) {
  const { cropsCatalog } = useStore();

  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [selectedCrop, setSelectedCrop] = useState<CropCatalogItem | null>(null);
  const [currentVariety, setCurrentVariety] = useState(selectedVariety || "");
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [catalogList, setCatalogList] = useState<CropCatalogItem[]>(cropsCatalog);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync catalog from backend API if available, fallback to store
  useEffect(() => {
    let isMounted = true;
    apiClient.crops
      .getCatalog()
      .then((res) => {
        const items = res?.data || (Array.isArray(res) ? (res as any) : null);
        if (isMounted && Array.isArray(items) && items.length > 0) {
          // Normalize backend items to CropCatalogItem format if needed
          const normalized: CropCatalogItem[] = items.map((it: any) => ({
            id: it.id,
            name: it.name,
            marathiName: it.marathiName || (it as any).marathi_name || "",
            hindiName: it.hindiName || (it as any).hindi_name || "",
            category: it.category as any,
            icon: it.icon || "🌱",
            varieties: it.varieties || [],
            perishability: (it.perishability || (it as any).perishability || "Medium (1-3 weeks)") as any,
            storageRecommendation:
              it.storageRecommendation || (it as any).storage_recommendation || "",
            defaultBatchSizeKg: it.defaultBatchSizeKg || (it as any).default_batch_size_kg || 1000,
            unit: it.unit || "kg",
            supportedQualityParams:
              it.supportedQualityParams || (it as any).supported_quality_params || [],
            gradeRules: it.gradeRules || [],
            status: "Active",
          }));
          setCatalogList(normalized);
        }
      })
      .catch(() => {
        // Fallback to store
        setCatalogList(cropsCatalog);
      });

    return () => {
      isMounted = false;
    };
  }, [cropsCatalog]);

  // Sync with prop selectedCropId
  useEffect(() => {
    if (selectedCropId) {
      const match = catalogList.find(
        (c) =>
          c.id.toLowerCase() === selectedCropId.toLowerCase() ||
          c.name.toLowerCase() === selectedCropId.toLowerCase()
      );
      if (match) {
        setSelectedCrop(match);
        const defaultVar = selectedVariety || match.varieties?.[0] || "Standard";
        setCurrentVariety(defaultVar);
      }
    } else {
      setSelectedCrop(null);
    }
  }, [selectedCropId, catalogList, selectedVariety]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filtered crops
  const filteredCrops = catalogList.filter((crop) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase().trim();
    return (
      crop.name.toLowerCase().includes(q) ||
      (crop.marathiName && crop.marathiName.toLowerCase().includes(q)) ||
      (crop.hindiName && crop.hindiName.toLowerCase().includes(q)) ||
      crop.category.toLowerCase().includes(q) ||
      (crop.varieties && crop.varieties.some((v) => v.toLowerCase().includes(q)))
    );
  });

  const handleSelectCrop = (crop: CropCatalogItem) => {
    setSelectedCrop(crop);
    const initialVar = crop.varieties && crop.varieties.length > 0 ? crop.varieties[0] : "Standard";
    setCurrentVariety(initialVar);
    setIsOpen(false);
    setQuery("");
    onCropChange(crop, initialVar, crop.unit || "kg");
  };

  const handleVarietyChange = (newVariety: string) => {
    setCurrentVariety(newVariety);
    if (selectedCrop) {
      onCropChange(selectedCrop, newVariety, selectedCrop.unit || "kg");
    }
  };

  const handleClear = () => {
    setSelectedCrop(null);
    setCurrentVariety("");
    setQuery("");
    onCropChange(null, "", "kg");
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "Enter") {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev < filteredCrops.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : filteredCrops.length - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredCrops[highlightedIndex]) {
        handleSelectCrop(filteredCrops[highlightedIndex]);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div className="space-y-4" ref={containerRef}>
      {/* 1. If NO crop is selected, show searchable input */}
      {!selectedCrop ? (
        <div className="relative">
          <Label className="block text-xs font-semibold text-stone-700 mb-1.5">
            Select Crop Type <span className="text-rose-500">*</span>
          </Label>

          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <Input
              ref={inputRef}
              type="text"
              disabled={disabled}
              placeholder="Search crop by English, Marathi, or Hindi (e.g. Tomato, कांदा, Wheat)..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setIsOpen(true);
                setHighlightedIndex(0);
              }}
              onFocus={() => setIsOpen(true)}
              onKeyDown={handleKeyDown}
              className="pl-10 pr-10 h-11 bg-white border-stone-300 rounded-xl shadow-sm text-sm focus-visible:ring-emerald-600"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Autocomplete Dropdown */}
          {isOpen && (
            <div className="absolute z-50 left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-stone-200 max-h-80 overflow-y-auto divide-y divide-stone-100 animate-in fade-in-50 slide-in-from-top-1">
              {filteredCrops.length > 0 ? (
                <>
                  <div className="px-3 py-1.5 text-[11px] font-medium text-stone-600 bg-stone-50 flex items-center justify-between">
                    <span>Verified APMC/FPO Crops ({filteredCrops.length})</span>
                    <span>Use ↑↓ to navigate, Enter to select</span>
                  </div>
                  {filteredCrops.map((crop, idx) => {
                    const isHighlighted = idx === highlightedIndex;
                    return (
                      <div
                        key={crop.id}
                        onMouseEnter={() => setHighlightedIndex(idx)}
                        onClick={() => handleSelectCrop(crop)}
                        className={`px-3.5 py-2.5 flex items-center justify-between cursor-pointer transition-colors ${
                          isHighlighted ? "bg-emerald-50 text-emerald-950" : "hover:bg-stone-50 text-stone-800"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl w-8 text-center">{crop.icon || "🌱"}</span>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm">{crop.name}</span>
                              {crop.marathiName && (
                                <span className="text-xs text-stone-500 font-medium">
                                  ({crop.marathiName})
                                </span>
                              )}
                              {crop.hindiName && (
                                <span className="text-xs text-stone-400">
                                  • {crop.hindiName}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5 text-xs text-stone-500">
                              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                                {crop.category}
                              </Badge>
                              <span>
                                {crop.varieties?.length || 0} varieties:{" "}
                                {crop.varieties?.slice(0, 2).join(", ")}
                                {(crop.varieties?.length || 0) > 2 ? "..." : ""}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <Badge
                            variant="outline"
                            className="text-[10px] text-stone-600 font-mono bg-stone-50 border-stone-200"
                          >
                            Unit: {crop.unit || "kg"}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </>
              ) : (
                /* Empty state when not found */
                <div className="p-5 text-center space-y-3">
                  <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
                    <Search className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-stone-800">
                      No matching crop found for &quot;{query}&quot;
                    </p>
                    <p className="text-xs text-stone-500 mt-0.5">
                      KrishiSetu verifies all crops before allowing them into the commercial buyer marketplace.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsRequestModalOpen(true)}
                    className="border-emerald-600 text-emerald-700 hover:bg-emerald-50 text-xs font-semibold gap-1.5 mx-auto"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    Request to Add &quot;{query}&quot; to Catalog
                  </Button>
                </div>
              )}

              {/* Bottom footer button to request other crops */}
              <div className="p-2 bg-stone-50 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500 px-3">
                <span>Can&apos;t find your specific crop or variety?</span>
                <button
                  type="button"
                  onClick={() => setIsRequestModalOpen(true)}
                  className="text-emerald-700 hover:text-emerald-800 font-semibold hover:underline flex items-center gap-1"
                >
                  <PlusCircle className="w-3.5 h-3.5" /> Request New Crop
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* 2. When a crop IS selected: Rich Selected Card */
        <div className="bg-white border-2 border-emerald-500/40 rounded-2xl p-4 shadow-sm relative space-y-4">
          {/* Header row */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl p-2 bg-emerald-50 rounded-xl border border-emerald-100">
                {selectedCrop.icon || "🌱"}
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base text-stone-900">{selectedCrop.name}</h3>
                  {selectedCrop.marathiName && (
                    <span className="text-xs font-semibold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full">
                      {selectedCrop.marathiName}
                    </span>
                  )}
                  {selectedCrop.hindiName && (
                    <span className="text-xs text-stone-500">
                      ({selectedCrop.hindiName})
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs text-stone-600 bg-stone-50 border-stone-300">
                    Category: {selectedCrop.category}
                  </Badge>
                  <Badge variant="outline" className="text-xs text-emerald-700 bg-emerald-50 border-emerald-200">
                    Standard Trading Unit: <strong>{selectedCrop.unit || "kg"}</strong>
                  </Badge>
                </div>
              </div>
            </div>

            {/* Change button */}
            {!disabled && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="text-stone-500 hover:text-rose-600 hover:bg-rose-50 text-xs gap-1"
              >
                <X className="w-3.5 h-3.5" /> Change Crop
              </Button>
            )}
          </div>

          {/* Variety Selector */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-stone-100">
            <div>
              <Label htmlFor="varietySelect" className="text-xs font-semibold text-stone-700 mb-1 block">
                Select Cultivar / Variety <span className="text-rose-500">*</span>
              </Label>
              {selectedCrop.varieties && selectedCrop.varieties.length > 0 ? (
                <select
                  id="varietySelect"
                  disabled={disabled}
                  value={currentVariety}
                  onChange={(e) => handleVarietyChange(e.target.value)}
                  className="w-full text-sm h-10 rounded-xl border border-stone-300 px-3 bg-white text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 font-medium"
                >
                  {selectedCrop.varieties.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                  <option value="Other / Hybrid">Other / Local Hybrid</option>
                </select>
              ) : (
                <Input
                  id="varietySelect"
                  disabled={disabled}
                  value={currentVariety}
                  onChange={(e) => handleVarietyChange(e.target.value)}
                  placeholder="e.g. Desi, Hybrid"
                  className="rounded-xl"
                />
              )}
            </div>

            <div>
              <Label className="text-xs font-semibold text-stone-700 mb-1 block">
                AI Vision Model Parameters
              </Label>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {selectedCrop.supportedQualityParams && selectedCrop.supportedQualityParams.length > 0 ? (
                  selectedCrop.supportedQualityParams.map((param, pIdx) => (
                    <span
                      key={pIdx}
                      className="inline-flex items-center gap-1 text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-md"
                    >
                      <Sparkles className="w-3 h-3 text-emerald-600" />
                      {param}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-stone-400 italic">Standard visual grading enabled</span>
                )}
              </div>
            </div>
          </div>

          {/* Perishability & Storage notice */}
          {(selectedCrop.perishability || selectedCrop.storageRecommendation) && (
            <div className="bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs text-stone-600 flex items-start gap-3">
              <div className="flex items-center gap-1 font-semibold text-stone-700 shrink-0">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                {selectedCrop.perishability}
              </div>
              <div className="border-l border-stone-200 pl-3">
                <span className="font-semibold text-stone-700">Storage Guidance: </span>
                {selectedCrop.storageRecommendation || "Keep in shaded dry environment."}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Unlisted Crop Request Modal */}
      <CropAddRequestModal
        isOpen={isRequestModalOpen}
        initialCropName={query}
        onClose={() => setIsRequestModalOpen(false)}
        onSuccess={(reqName) => {
          // Keep current modal closed
          setIsRequestModalOpen(false);
        }}
      />
    </div>
  );
}
