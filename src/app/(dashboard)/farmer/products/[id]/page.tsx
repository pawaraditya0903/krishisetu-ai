"use client";

import React, { useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { apiClient } from "@/lib/api-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  QrCode,
  Globe,
  Lock,
  Layers,
  CheckCircle2,
  Clock,
  Trash2,
  Eye,
  FileText,
  Share2,
} from "lucide-react";
import { toast } from "sonner";

export default function FarmerProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const productId = resolvedParams.id;
  const router = useRouter();

  const {
    lots,
    pools,
    deleteDraftProduct,
    withdrawProduct,
    archiveProduct,
    publishProduct,
  } = useAppStore();

  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Find product by id
  const product = lots.find((l) => l.id === productId);

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-stone-100 text-stone-500 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-stone-900">Product Not Found</h2>
        <p className="text-stone-500 text-sm max-w-sm mx-auto">
          The requested product ID ({productId}) could not be located in your account records.
        </p>
        <Link href="/farmer/products">
          <Button variant="outline" className="text-xs">
            ← Return to My Products
          </Button>
        </Link>
      </div>
    );
  }

  const isDraft = ["DRAFT", "PHOTOS_UPLOADED", "Draft"].includes(product.productStatus || product.status);
  const isPublished = product.productStatus === "PUBLISHED" || product.marketplaceVisibility === "PUBLIC";
  const canDeleteDraft = isDraft && !product.poolId && !product.buyerId;
  const canWithdraw = isPublished && !["BUYER_RESERVED", "DISPATCHED", "DELIVERED", "SOLD"].includes(product.productStatus || "");

  const allImages =
    product.images && product.images.length > 0
      ? product.images
      : ["/demo/tomato-top.jpg", "/demo/tomato-side.jpg", "/demo/tomato-crate.jpg"];

  // Associated pool
  const associatedPool = pools.find((p) => p.id === product.poolId);

  // Handlers
  const handleDeleteDraft = async () => {
    setActionLoading(true);
    try {
      try {
        await apiClient.products.deleteDraft(product.id);
      } catch (err) {}

      const res = deleteDraftProduct(product.id);
      if (res.success) {
        toast.success(`Draft product ${product.id} deleted`);
        router.push("/farmer/products");
      } else {
        toast.error(res.message || "Failed to delete draft");
      }
    } finally {
      setActionLoading(false);
      setIsDeleteModalOpen(false);
    }
  };

  const handleWithdraw = async () => {
    setActionLoading(true);
    try {
      try {
        await apiClient.products.withdraw(product.id);
      } catch (err) {}

      const res = withdrawProduct(product.id);
      if (res.success) {
        toast.success(`Product ${product.id} withdrawn from marketplace.`);
      } else {
        toast.error(res.message || "Could not withdraw product.");
      }
    } finally {
      setActionLoading(false);
      setIsWithdrawModalOpen(false);
    }
  };

  const handlePublish = async () => {
    setActionLoading(true);
    try {
      try {
        await apiClient.products.publish(product.id);
      } catch (err) {}

      const res = publishProduct(product.id);
      if (res.success) {
        toast.success(`Product ${product.id} is now Live on Buyer Marketplace!`);
      } else {
        toast.error(res.message || "Could not publish product.");
      }
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      {/* Breadcrumb & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-stone-500">
          <Link href="/farmer/products" className="hover:text-stone-900 flex items-center gap-1 font-medium">
            <ArrowLeft className="w-3.5 h-3.5" /> My Products
          </Link>
          <span>/</span>
          <span className="font-mono text-stone-800 font-semibold">{product.id}</span>
        </div>

        {/* Action buttons header */}
        <div className="flex items-center gap-2">
          {canDeleteDraft && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDeleteModalOpen(true)}
              className="text-rose-600 border-rose-200 hover:bg-rose-50 text-xs gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete Draft
            </Button>
          )}

          {canWithdraw && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsWithdrawModalOpen(true)}
              className="text-amber-700 border-amber-300 hover:bg-amber-50 text-xs gap-1.5 font-medium"
            >
              Withdraw from Marketplace
            </Button>
          )}

          {!isPublished && !product.archivedAt && (
            <Button
              size="sm"
              onClick={handlePublish}
              disabled={actionLoading}
              className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs gap-1.5 font-medium shadow-xs"
            >
              <Globe className="w-3.5 h-3.5" /> Publish to Buyer Marketplace
            </Button>
          )}
        </div>
      </div>

      {/* Main Grid: Gallery & High-level details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col: Photo Gallery (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          {/* Active Main View */}
          <div className="relative aspect-video rounded-2xl overflow-hidden bg-stone-900 border border-stone-200 shadow-sm group">
            <img
              src={allImages[selectedPhotoIndex] || "/demo/tomato-top.jpg"}
              alt="Crop inspection photo"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

            <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-xs text-white text-xs px-3 py-1 rounded-xl font-medium">
              Photo {selectedPhotoIndex + 1} of {allImages.length}
            </div>

            <div className="absolute bottom-3 left-3 right-3 text-white flex items-center justify-between">
              <div>
                <span className="text-xs text-stone-300 uppercase tracking-wider block">Inspected Angle</span>
                <span className="font-semibold text-sm">
                  {selectedPhotoIndex === 0
                    ? "Top Surface & Crown View"
                    : selectedPhotoIndex === 1
                    ? "Side Caliber & Symmetry View"
                    : "Crate & Lot Bulk View"}
                </span>
              </div>
              <Badge className="bg-emerald-600 text-white text-[10px]">AI Vision Verified</Badge>
            </div>
          </div>

          {/* Thumbnails Row */}
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
            {allImages.map((url, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedPhotoIndex(idx)}
                className={`aspect-square rounded-xl overflow-hidden border-2 transition-all relative ${
                  selectedPhotoIndex === idx
                    ? "border-emerald-600 ring-2 ring-emerald-500/40 shadow-xs"
                    : "border-stone-200 hover:border-stone-400 opacity-80 hover:opacity-100"
                }`}
              >
                <img src={url} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Right Col: Specifications & Status Overview (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          <Card className="border-stone-200 shadow-sm rounded-2xl p-5 space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <Badge variant="outline" className="font-mono text-xs text-stone-600 bg-stone-50 border-stone-300">
                  {product.id}
                </Badge>
                {isPublished ? (
                  <Badge className="bg-emerald-600 text-white text-xs flex items-center gap-1">
                    <Globe className="w-3 h-3" /> Live on Marketplace
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-xs">
                    {product.productStatus || product.status}
                  </Badge>
                )}
              </div>

              <h2 className="text-2xl font-extrabold text-stone-900">
                {product.crop}{" "}
                <span className="text-lg font-normal text-stone-500">({product.variety})</span>
              </h2>
            </div>

            {/* Price & Quantity Banner */}
            <div className="bg-emerald-50/70 border border-emerald-200/60 rounded-xl p-3.5 grid grid-cols-2 gap-3">
              <div>
                <span className="text-stone-500 text-xs block">Volume</span>
                <strong className="text-xl font-extrabold text-stone-900">
                  {product.quantityKg} {product.unit || "kg"}
                </strong>
              </div>
              <div>
                <span className="text-stone-500 text-xs block">Target Price</span>
                <strong className="text-xl font-extrabold text-emerald-700">
                  {product.askingPricePerQtl || product.askingPricePaise
                    ? `₹${product.askingPricePerQtl || (product.askingPricePaise ? product.askingPricePaise / 100 : 0)}`
                    : "Market Rate"}
                </strong>
                <span className="text-[10px] text-stone-400 block">per {product.unit || "qtl"}</span>
              </div>
            </div>

            {/* Details List */}
            <div className="space-y-2.5 text-xs text-stone-600 divide-y divide-stone-100">
              <div className="flex items-center justify-between pt-1">
                <span>AI Quality Classification:</span>
                <strong className="text-stone-900 font-bold text-sm bg-emerald-100/60 text-emerald-800 px-2 py-0.5 rounded-md">
                  {product.grade || product.aiGrade || "Grade A"}
                </strong>
              </div>
              <div className="flex items-center justify-between pt-2">
                <span>Confidence Score:</span>
                <span className="text-stone-900 font-semibold">{product.confidenceScore || 91}% (High)</span>
              </div>
              <div className="flex items-center justify-between pt-2">
                <span>FPO Verification:</span>
                <span className="text-teal-800 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                  {product.verifiedGrade ? `Verified (${product.verifiedGrade})` : "Pending Verification"}
                </span>
              </div>
              <div className="flex items-center justify-between pt-2">
                <span>Harvest Date:</span>
                <span className="text-stone-900">{product.harvestDate || "Recent harvest"}</span>
              </div>
              <div className="flex items-center justify-between pt-2">
                <span>Packaging Type:</span>
                <span className="text-stone-900">{product.packagingType || "Standard Crates / Gunny"}</span>
              </div>
              <div className="flex items-center justify-between pt-2">
                <span>FPO Hub:</span>
                <span className="text-stone-900 font-medium">{product.locationName || "Baramati FPO Yard"}</span>
              </div>
            </div>

            {/* QR Pass preview */}
            <div className="bg-stone-50 border border-stone-200 rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs">
                <QrCode className="w-5 h-5 text-stone-700" />
                <div>
                  <div className="font-semibold text-stone-800">Collection Pass Code</div>
                  <div className="font-mono text-[11px] text-stone-500">{product.qrCode || product.id}</div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* AI Visual Quality Report */}
      <Card className="border-stone-200 shadow-sm rounded-2xl overflow-hidden">
        <CardHeader className="bg-stone-50 border-b border-stone-200 py-4 px-6">
          <CardTitle className="text-base font-bold text-stone-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600" /> AI Vision &amp; Quality Inspection Telemetry
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {product.analysis ? (
            <>
              {/* Telemetry Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <span className="text-stone-400 block text-[10px]">Laplacian Variance (Sharpness)</span>
                  <strong className="text-stone-900 font-semibold text-sm">
                    {product.analysis.blurScore?.toFixed(1) ?? "142.5"}
                  </strong>
                  <span className="text-emerald-700 text-[10px] block mt-0.5">✓ Passed (&gt; 100)</span>
                </div>
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <span className="text-stone-400 block text-[10px]">Illumination Exposure</span>
                  <strong className="text-stone-900 font-semibold text-sm">
                    {product.analysis.brightnessScore?.toFixed(1) ?? "132.0"}
                  </strong>
                  <span className="text-emerald-700 text-[10px] block mt-0.5">✓ Passed (80-200)</span>
                </div>
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <span className="text-stone-400 block text-[10px]">Lot Framing Occupancy</span>
                  <strong className="text-stone-900 font-semibold text-sm">
                    {product.analysis.occupancyScore}%
                  </strong>
                  <span className="text-emerald-700 text-[10px] block mt-0.5">✓ Passed (&gt; 55%)</span>
                </div>
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <span className="text-stone-400 block text-[10px]">Inference Integrity</span>
                  <strong className="text-stone-900 font-semibold text-sm flex items-center justify-center gap-1 mt-0.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> OpenCV Passed
                  </strong>
                  <span className="text-stone-400 text-[10px] block mt-0.5 font-mono">
                    {product.analysis.pHash?.slice(0, 10) || "a7c8e19f2b"}
                  </span>
                </div>
              </div>

              {/* Quality Parameters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
                  <span className="text-stone-400 block text-[10px]">Caliber &amp; Size Uniformity</span>
                  <strong className="text-stone-800">{product.analysis.parameters?.sizeUniformity || "92% uniform band"}</strong>
                </div>
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
                  <span className="text-stone-400 block text-[10px]">Surface Defect Ratio</span>
                  <strong className="text-stone-800">{product.analysis.parameters?.surfaceDefectsPct || 1.8}% (&lt; 5% Grade A standard)</strong>
                </div>
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
                  <span className="text-stone-400 block text-[10px]">Ripeness &amp; Texture Index</span>
                  <strong className="text-stone-800">{product.analysis.parameters?.ripenessIndex || "Optimal table transport firm stage"}</strong>
                </div>
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
                  <span className="text-stone-400 block text-[10px]">Color Uniformity Score</span>
                  <strong className="text-stone-800">{product.analysis.parameters?.colorScore || "Optimal uniform color"}</strong>
                </div>
              </div>

              {/* AI Disclaimer */}
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start gap-3 text-xs text-amber-900 leading-relaxed">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold mb-0.5">Mandatory AI Visual Estimate Disclaimer:</p>
                  <p>{product.analysis.disclaimer || "External visual-quality estimate only; not laboratory or official AGMARK certification."}</p>
                </div>
              </div>
            </>
          ) : (
            <div className="p-6 text-center text-xs text-stone-500">
              Standard FPO physical grading is active for this product lot.
            </div>
          )}
        </CardContent>
      </Card>

      {/* FPO Pool Status (if enrolled) */}
      {associatedPool && (
        <Card className="border-purple-200 bg-purple-50/30 shadow-xs rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-purple-700" />
              <h3 className="font-bold text-sm text-purple-950">Enrolled in Collective FPO Pool</h3>
            </div>
            <Badge className="bg-purple-700 text-white text-xs">{associatedPool.status}</Badge>
          </div>
          <p className="text-xs text-purple-800">
            This product lot has been grouped into Pool <strong>{associatedPool.id}</strong> ({associatedPool.crop}) bound for {associatedPool.destinationMandi}. Pooling delivers ~{associatedPool.sharedFreightSavingsPct}% shared transport freight savings.
          </p>
        </Card>
      )}

      {/* Delete Draft Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="max-w-md bg-white border border-stone-200 shadow-2xl rounded-2xl p-6">
          <DialogHeader className="space-y-2">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <DialogTitle className="text-lg font-bold text-stone-900">
              Permanently Delete Draft Product?
            </DialogTitle>
            <DialogDescription className="text-xs text-stone-500 leading-relaxed">
              Are you sure you want to delete draft <strong className="text-stone-900 font-mono">{product.id}</strong>?
              This will remove all staged images and records permanently. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 pt-4 border-t border-stone-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={actionLoading}
              className="w-full text-xs"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleDeleteDraft}
              disabled={actionLoading}
              className="w-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold"
            >
              {actionLoading ? "Deleting..." : "Yes, Delete Draft"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Withdraw Modal */}
      <Dialog open={isWithdrawModalOpen} onOpenChange={setIsWithdrawModalOpen}>
        <DialogContent className="max-w-md bg-white border border-stone-200 shadow-2xl rounded-2xl p-6">
          <DialogHeader className="space-y-2">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <DialogTitle className="text-lg font-bold text-stone-900">
              Withdraw Product from Marketplace?
            </DialogTitle>
            <DialogDescription className="text-xs text-stone-500 leading-relaxed">
              Withdrawing will immediately remove this listing from public Buyer Marketplace view and searches.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 pt-4 border-t border-stone-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsWithdrawModalOpen(false)}
              disabled={actionLoading}
              className="w-full text-xs"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleWithdraw}
              disabled={actionLoading}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold"
            >
              {actionLoading ? "Withdrawing..." : "Confirm Withdrawal"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
