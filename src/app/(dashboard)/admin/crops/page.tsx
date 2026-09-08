"use client";

import React, { useState } from "react";
import { useAppStore } from "@/lib/store";
import { CropCatalogItem, CropGradeRule } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sprout,
  Plus,
  Edit2,
  Trash2,
  Search,
  CheckCircle2,
  X,
  Sliders,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

export default function AdminCropsPage() {
  const { cropsCatalog, addCrop, updateCrop, setCropStatus, language } = useAppStore();
  const isMr = language === "mr";

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCrop, setEditingCrop] = useState<CropCatalogItem | null>(null);

  // Form State
  const [cropForm, setCropForm] = useState<Partial<CropCatalogItem>>({
    name: "",
    marathiName: "",
    hindiName: "",
    category: "Vegetable",
    icon: "🌱",
    varieties: ["Hybrid", "Desi"],
    perishability: "High (4-7 days)",
    storageRecommendation: "Store in ventilated crates away from direct sun.",
    defaultBatchSizeKg: 500,
    status: "Active",
    gradeRules: [
      { grade: "Grade A", minSizeMm: 50, maxDefectPct: 3, priceAdjustmentPct: 10 },
      { grade: "Grade B", minSizeMm: 40, maxDefectPct: 8, priceAdjustmentPct: 0 },
      { grade: "Grade C", minSizeMm: 30, maxDefectPct: 15, priceAdjustmentPct: -15 },
    ],
  });

  const filteredCrops = cropsCatalog.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.marathiName.includes(searchTerm) ||
      c.hindiName.includes(searchTerm);
    const matchesCat = categoryFilter === "all" || c.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const categories = Array.from(new Set(cropsCatalog.map((c) => c.category)));

  // Save Crop
  const handleSaveCrop = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cropForm.name?.trim() || !cropForm.marathiName?.trim()) {
      toast.error("English and Marathi crop names are mandatory.");
      return;
    }

    if (editingCrop) {
      updateCrop(editingCrop.id, cropForm);
      toast.success(`Crop "${cropForm.name}" updated successfully.`);
      setEditingCrop(null);
    } else {
      const created = addCrop({
        name: cropForm.name.trim(),
        marathiName: cropForm.marathiName.trim(),
        hindiName: cropForm.hindiName?.trim() || cropForm.name.trim(),
        category: cropForm.category || "Vegetable",
        icon: cropForm.icon || "🌱",
        varieties: cropForm.varieties || ["Hybrid"],
        perishability: cropForm.perishability || "Medium (1-3 weeks)",
        storageRecommendation: cropForm.storageRecommendation || "Store properly.",
        defaultBatchSizeKg: Number(cropForm.defaultBatchSizeKg) || 500,
        gradeRules: cropForm.gradeRules || [],
        status: cropForm.status || "Active",
      });
      toast.success(`Crop "${created.name}" created with ID ${created.id}!`);
      setIsAddModalOpen(false);
    }
  };

  // Toggle Status
  const handleToggleStatus = (crop: CropCatalogItem) => {
    const nextStatus = crop.status === "Active" ? "Inactive" : "Active";
    setCropStatus(crop.id, nextStatus);
    toast.success(`Crop ${crop.name} is now ${nextStatus}`);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {isMr ? "पीक कॅटलॉग आणि ग्रेडिंग नियम" : "Crop Catalog & Quality Grade Rules"}
            </h1>
            <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-300 font-mono text-xs">
              {cropsCatalog.length} {isMr ? "पिके" : "Crops Catalog"}
            </Badge>
          </div>
          <p className="text-slate-500 text-xs sm:text-sm">
            {isMr
              ? "पिके, संकरित वाण, नाशवंतपणा आणि एआय ग्रेड ए/बी/सी दर समायोजन व्यवस्थापित करा."
              : "Define standard crop specifications, allowable varieties, perishability, and Grade A/B/C price premium rules."}
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => {
            setEditingCrop(null);
            setCropForm({
              name: "",
              marathiName: "",
              hindiName: "",
              category: "Vegetable",
              icon: "🌱",
              varieties: ["Hybrid", "Desi"],
              perishability: "High (4-7 days)",
              storageRecommendation: "Store in ventilated crates.",
              defaultBatchSizeKg: 500,
              status: "Active",
              gradeRules: [
                { grade: "Grade A", minSizeMm: 50, maxDefectPct: 3, priceAdjustmentPct: 10 },
                { grade: "Grade B", minSizeMm: 40, maxDefectPct: 8, priceAdjustmentPct: 0 },
                { grade: "Grade C", minSizeMm: 30, maxDefectPct: 15, priceAdjustmentPct: -15 },
              ],
            });
            setIsAddModalOpen(true);
          }}
          className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs shadow-md"
        >
          <Plus className="w-3.5 h-3.5 mr-1.5" />
          {isMr ? "+ नवीन पीक जोडा" : "+ Add New Crop"}
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="bg-white border-slate-200 shadow-xs">
        <CardContent className="p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search crop name in English, Marathi, or Hindi..."
              className="pl-9 text-xs h-9"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-9 text-xs px-3 rounded-md border border-slate-200 bg-slate-50 font-medium text-slate-700"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </CardContent>
      </Card>

      {/* Crops Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCrops.map((crop) => (
          <Card key={crop.id} className="bg-white border-slate-200 shadow-xs hover:border-emerald-400 transition-all flex flex-col justify-between">
            <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <span className="text-3xl p-1 bg-emerald-50 rounded-xl">{crop.icon || "🌱"}</span>
                <div>
                  <h3 className="font-bold text-base text-slate-900">{crop.name}</h3>
                  <div className="text-xs text-emerald-800 font-semibold">
                    {crop.marathiName} • {crop.hindiName}
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleToggleStatus(crop)}
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                  crop.status === "Active"
                    ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                    : "bg-slate-100 text-slate-600 border-slate-300"
                }`}
              >
                {crop.status}
              </button>
            </CardHeader>

            <CardContent className="p-4 pt-1 space-y-3 text-xs text-slate-600">
              <div className="flex justify-between items-center bg-slate-50 p-2 rounded-lg">
                <span className="text-slate-400">Category:</span>
                <Badge variant="outline" className="text-[10px]">{crop.category}</Badge>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 block mb-1">Key Varieties:</span>
                <div className="flex flex-wrap gap-1">
                  {crop.varieties.map((v) => (
                    <span
                      key={v}
                      className="bg-slate-100 text-slate-700 text-[10px] px-1.5 py-0.5 rounded border border-slate-200 font-medium"
                    >
                      {v}
                    </span>
                  ))}
                </div>
              </div>

              {/* Quality Grade Rules Preview */}
              <div className="border border-slate-200 rounded-xl p-2.5 space-y-1 bg-slate-50/50">
                <span className="font-bold text-slate-800 text-[11px] block">AI Grade Pricing Adjustments:</span>
                <div className="grid grid-cols-3 gap-1 text-center">
                  {crop.gradeRules.map((gr) => (
                    <div key={gr.grade} className="p-1 rounded bg-white border border-slate-200">
                      <div className="font-bold text-[10px] text-slate-700">{gr.grade}</div>
                      <div
                        className={`text-xs font-black ${
                          gr.priceAdjustmentPct > 0
                            ? "text-emerald-700"
                            : gr.priceAdjustmentPct < 0
                            ? "text-red-600"
                            : "text-slate-600"
                        }`}
                      >
                        {gr.priceAdjustmentPct > 0 ? `+${gr.priceAdjustmentPct}%` : `${gr.priceAdjustmentPct}%`}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>

            <div className="p-3 border-t border-slate-100 flex items-center justify-between bg-slate-50/50 rounded-b-2xl">
              <span className="text-[10px] text-slate-400 font-mono">
                Batch: {crop.defaultBatchSizeKg} kg
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setEditingCrop(crop);
                  setCropForm(crop);
                  setIsAddModalOpen(true);
                }}
                className="text-xs text-blue-700 hover:text-blue-800 h-7"
              >
                <Edit2 className="w-3 h-3 mr-1" /> Edit Rules
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* ==================== ADD / EDIT CROP MODAL ==================== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-emerald-50/60">
              <h3 className="font-bold text-base text-slate-900">
                {editingCrop ? `Edit Crop: ${editingCrop.name}` : "Add Crop to Master Catalog"}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCrop} className="p-5 space-y-3 text-xs">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">English Name *</label>
                  <Input
                    required
                    value={cropForm.name || ""}
                    onChange={(e) => setCropForm({ ...cropForm, name: e.target.value })}
                    placeholder="Tomato"
                    className="text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Marathi Name *</label>
                  <Input
                    required
                    value={cropForm.marathiName || ""}
                    onChange={(e) => setCropForm({ ...cropForm, marathiName: e.target.value })}
                    placeholder="टोमॅटो"
                    className="text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Hindi Name</label>
                  <Input
                    value={cropForm.hindiName || ""}
                    onChange={(e) => setCropForm({ ...cropForm, hindiName: e.target.value })}
                    placeholder="टमाटर"
                    className="text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Category</label>
                  <select
                    value={cropForm.category}
                    onChange={(e) => setCropForm({ ...cropForm, category: e.target.value as any })}
                    className="w-full h-9 text-xs px-2 rounded-md border border-slate-200 bg-white"
                  >
                    <option value="Vegetable">Vegetable</option>
                    <option value="Fruit">Fruit</option>
                    <option value="Grain">Grain</option>
                    <option value="Pulse">Pulse</option>
                    <option value="Cash Crop">Cash Crop</option>
                    <option value="Spice">Spice</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Icon Emoji</label>
                  <Input
                    value={cropForm.icon || "🌱"}
                    onChange={(e) => setCropForm({ ...cropForm, icon: e.target.value })}
                    className="text-xs text-center text-lg"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Perishability</label>
                  <select
                    value={cropForm.perishability}
                    onChange={(e) => setCropForm({ ...cropForm, perishability: e.target.value as any })}
                    className="w-full h-9 text-xs px-2 rounded-md border border-slate-200 bg-white"
                  >
                    <option value="Very High (1-3 days)">Very High (1-3 days)</option>
                    <option value="High (4-7 days)">High (4-7 days)</option>
                    <option value="Medium (1-3 weeks)">Medium (1-3 weeks)</option>
                    <option value="Low (Months)">Low (Months)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Varieties (comma separated)</label>
                <Input
                  value={cropForm.varieties?.join(", ") || ""}
                  onChange={(e) =>
                    setCropForm({
                      ...cropForm,
                      varieties: e.target.value.split(",").map((v) => v.trim()).filter((v) => v.length > 0),
                    })
                  }
                  placeholder="Abhinav, Vaibhav, Saaho, Rupali"
                  className="text-xs"
                />
              </div>

              {/* Grade Rules Editor */}
              <div className="border border-slate-200 rounded-xl p-3 space-y-2 bg-slate-50">
                <span className="font-bold text-slate-800 block">Grade Pricing Premium / Discount (%):</span>
                <div className="grid grid-cols-3 gap-2">
                  {["Grade A", "Grade B", "Grade C"].map((gradeName, idx) => {
                    const rule = cropForm.gradeRules?.[idx] || {
                      grade: gradeName as any,
                      priceAdjustmentPct: 0,
                    };

                    return (
                      <div key={gradeName} className="p-2 bg-white rounded-lg border border-slate-200 space-y-1">
                        <span className="font-bold text-slate-700 block">{gradeName}</span>
                        <label className="text-[10px] text-slate-400">Adj %</label>
                        <Input
                          type="number"
                          value={rule.priceAdjustmentPct}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 0;
                            const updated = [...(cropForm.gradeRules || [])];
                            updated[idx] = { ...rule, priceAdjustmentPct: val };
                            setCropForm({ ...cropForm, gradeRules: updated });
                          }}
                          className="text-xs h-7 font-mono"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="bg-emerald-700 hover:bg-emerald-800 text-white">
                  {editingCrop ? "Save Changes" : "Create Crop"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
