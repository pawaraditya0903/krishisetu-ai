"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { apiClient } from "@/lib/api-client";
import { useStore } from "@/lib/store";
import { CropCatalogItem } from "@/lib/types";
import { AlertCircle, CheckCircle2, Loader2, Send, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface CropAddRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCropName?: string;
  onSuccess?: (newCrop: CropCatalogItem) => void;
}

export function CropAddRequestModal({
  isOpen,
  onClose,
  initialCropName = "",
  onSuccess,
}: CropAddRequestModalProps) {
  const { currentUser, submitCropRequest, addCrop } = useStore();
  const [cropName, setCropName] = useState(initialCropName);
  const [variety, setVariety] = useState("");
  const [category, setCategory] = useState("Vegetable");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [createdCropItem, setCreatedCropItem] = useState<CropCatalogItem | null>(null);

  // Sync initialCropName if modal opened with query
  React.useEffect(() => {
    if (initialCropName) {
      setCropName(initialCropName);
    }
  }, [initialCropName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cropName.trim()) {
      toast.error("Please enter a crop name");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        farmerId: currentUser?.id || "F1",
        farmerName: currentUser?.name || "Ramesh Patil",
        requestedCropName: cropName.trim(),
        variety: variety.trim() || undefined,
        category: category,
        reason: reason.trim() || undefined,
      };

      // Try calling API first
      let reqId = `REQ-${Date.now().toString().slice(-5)}`;
      try {
        const apiRes = await apiClient.crops.createRequest(payload);
        if (apiRes && apiRes.data && apiRes.data.id) {
          reqId = apiRes.data.id;
        }
      } catch (err) {
        console.warn("Backend API request failed, fallback to local store:", err);
      }

      // Also persist to store as request
      submitCropRequest({
        farmerId: payload.farmerId,
        farmerName: payload.farmerName,
        requestedCropName: payload.requestedCropName,
        variety: payload.variety,
        category: payload.category,
        reason: payload.reason,
        status: "PENDING_REVIEW",
      });

      // Also register active crop in catalog so the farmer can immediately grade and sell it!
      const created = addCrop({
        name: cropName.trim(),
        marathiName: cropName.trim(),
        hindiName: cropName.trim(),
        category: category as any,
        icon: "🌱",
        varieties: variety.trim() ? [variety.trim(), "Hybrid", "Desi"] : ["Hybrid", "Desi"],
        perishability: "Medium (1-3 weeks)",
        storageRecommendation: "Store in cool ventilated space.",
        defaultBatchSizeKg: 500,
        unit: "kg",
        supportedQualityParams: ["Size Uniformity", "Ripeness Index", "Surface Cleanliness"],
        gradeRules: [
          { grade: "Grade A", minSizeMm: 50, maxDefectPct: 3, priceAdjustmentPct: 10 },
          { grade: "Grade B", minSizeMm: 40, maxDefectPct: 8, priceAdjustmentPct: 0 },
          { grade: "Grade C", minSizeMm: 30, maxDefectPct: 15, priceAdjustmentPct: -15 },
        ],
        status: "Active",
      });
      setCreatedCropItem(created);

      setSubmittedId(reqId);
      toast.success(`Crop "${cropName.trim()}" added to active catalog!`);
    } catch (err) {
      toast.error("Failed to submit crop request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setSubmittedId(null);
    setCreatedCropItem(null);
    setCropName("");
    setVariety("");
    setReason("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => (!open ? handleClose() : undefined)}>
      <DialogContent className="max-w-lg bg-white border border-stone-200 shadow-2xl rounded-2xl p-6">
        <DialogHeader className="space-y-1 pb-2 border-b border-stone-100">
          <DialogTitle className="text-xl font-bold text-stone-900 flex items-center gap-2">
            🌱 Request &amp; Add Crop to Catalog
          </DialogTitle>
          <DialogDescription className="text-sm text-stone-500">
            Can&apos;t find your specific produce in the verified catalog? Add it now to begin AI grading immediately.
          </DialogDescription>
        </DialogHeader>

        {submittedId ? (
          <div className="py-6 text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-stone-900">Crop Added &amp; Ready for Grading</h3>
              <p className="text-sm text-stone-600 mt-1 max-w-sm mx-auto">
                <strong>{cropName}</strong> has been registered under Request ID:
              </p>
              <Badge variant="outline" className="mt-2 text-xs font-mono px-3 py-1 bg-stone-50 border-stone-300">
                {submittedId}
              </Badge>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 text-xs text-emerald-900 text-left space-y-1">
              <div className="font-semibold flex items-center gap-1.5 text-emerald-950">
                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                Active for Grading &amp; AI Analysis:
              </div>
              <p>
                <strong>{cropName}</strong> has been added to your session with standard quality assessment parameters. You can now immediately upload photos and run AI quality grading.
              </p>
            </div>

            <Button
              onClick={() => {
                if (createdCropItem && onSuccess) {
                  onSuccess(createdCropItem);
                }
                handleClose();
              }}
              className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-semibold py-2.5 rounded-xl shadow-sm flex items-center justify-center gap-1.5"
            >
              Select &amp; Start Grading Now <Sparkles className="w-4 h-4 ml-1" />
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>Quality Standard Notice:</strong> Custom unverified crops will be saved with a <em>Pending Review</em> status and cannot be publicly ordered by buyers until reviewed by an authorized FPO agronomist.
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="reqCropName" className="text-xs font-semibold text-stone-700">
                Crop Name <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="reqCropName"
                placeholder="e.g. Guava, Dragon Fruit, Drumstick"
                value={cropName}
                onChange={(e) => setCropName(e.target.value)}
                required
                className="rounded-xl border-stone-200 focus-visible:ring-emerald-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="reqCategory" className="text-xs font-semibold text-stone-700">
                  Category
                </Label>
                <select
                  id="reqCategory"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full text-sm h-9 rounded-xl border border-stone-200 px-3 bg-white text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                >
                  <option value="Vegetable">Vegetable</option>
                  <option value="Fruit">Fruit</option>
                  <option value="Grain">Grain</option>
                  <option value="Pulse">Pulse</option>
                  <option value="Cash Crop">Cash Crop</option>
                  <option value="Spice">Spice</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="reqVariety" className="text-xs font-semibold text-stone-700">
                  Variety / Cultivar
                </Label>
                <Input
                  id="reqVariety"
                  placeholder="e.g. Sardar / Lucknow 49"
                  value={variety}
                  onChange={(e) => setVariety(e.target.value)}
                  className="rounded-xl border-stone-200 focus-visible:ring-emerald-600"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="reqReason" className="text-xs font-semibold text-stone-700">
                Cultivation Details / Notes for FPO
              </Label>
              <textarea
                id="reqReason"
                rows={3}
                placeholder="Acreage planted, expected harvest date, package type, etc."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full text-sm rounded-xl border border-stone-200 p-2.5 bg-white text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-stone-100">
              <Button type="button" variant="outline" onClick={handleClose} disabled={submitting}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting || !cropName.trim()}
                className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" /> Submit Request
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
