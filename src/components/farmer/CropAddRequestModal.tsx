"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { apiClient } from "@/lib/api-client";
import { useStore } from "@/lib/store";
import { AlertCircle, CheckCircle2, Loader2, Send } from "lucide-react";
import { toast } from "sonner";

interface CropAddRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCropName?: string;
  onSuccess?: (requestedCropName: string) => void;
}

export function CropAddRequestModal({
  isOpen,
  onClose,
  initialCropName = "",
  onSuccess,
}: CropAddRequestModalProps) {
  const { currentUser, submitCropRequest } = useStore();
  const [cropName, setCropName] = useState(initialCropName);
  const [variety, setVariety] = useState("");
  const [category, setCategory] = useState("Vegetable");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);

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

      // Also persist to store
      submitCropRequest({
        farmerId: payload.farmerId,
        farmerName: payload.farmerName,
        requestedCropName: payload.requestedCropName,
        variety: payload.variety,
        category: payload.category,
        reason: payload.reason,
        status: "PENDING_REVIEW",
      });

      setSubmittedId(reqId);
      toast.success("Crop addition request submitted successfully!");
      if (onSuccess) {
        onSuccess(cropName.trim());
      }
    } catch (err) {
      toast.error("Failed to submit crop request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setSubmittedId(null);
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
            🌱 Request Unlisted Crop Addition
          </DialogTitle>
          <DialogDescription className="text-sm text-stone-500">
            Can&apos;t find your specific produce in the verified catalog? Submit a request to the FPO Agricultural Board.
          </DialogDescription>
        </DialogHeader>

        {submittedId ? (
          <div className="py-6 text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-stone-900">Request Submitted for Review</h3>
              <p className="text-sm text-stone-600 mt-1 max-w-sm mx-auto">
                Your request for <strong>{cropName}</strong> has been logged under Request ID:
              </p>
              <Badge variant="outline" className="mt-2 text-xs font-mono px-3 py-1 bg-stone-50 border-stone-300">
                {submittedId}
              </Badge>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-800 text-left space-y-1">
              <div className="font-semibold flex items-center gap-1.5 text-amber-900">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                Marketplace Protection Rule:
              </div>
              <p>
                Unverified crops cannot be listed immediately on the public Buyer Marketplace. Once the FPO Agricultural Team approves this crop type and parameters, it will become available for public trading.
              </p>
            </div>

            <Button onClick={handleClose} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
              Done & Return
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
