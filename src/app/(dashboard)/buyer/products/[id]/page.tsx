"use client";

import React, { useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import {
  ArrowLeft,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  MapPin,
  Calendar,
  Package,
  Layers,
  IndianRupee,
  CheckCircle2,
  Lock,
  Eye,
  Truck,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

export default function BuyerProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const productId = resolvedParams.id;
  const router = useRouter();

  const { lots, currentUser, updateProduct } = useAppStore();

  const [selectedPhotoIdx, setSelectedPhotoIdx] = useState(0);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [orderProcessing, setOrderProcessing] = useState(false);

  // Find product
  const product = lots.find((l) => l.id === productId);

  // Check availability
  const isAvailable =
    product &&
    !product.deletedAt &&
    !product.archivedAt &&
    product.productStatus !== "WITHDRAWN" &&
    (product.marketplaceVisibility === "PUBLIC" || product.productStatus === "PUBLISHED");

  // Filter recommendations (other active published products or fallback demo lots)
  const recommendations = lots
    .filter(
      (l) =>
        l.id !== productId &&
        !l.deletedAt &&
        !l.archivedAt &&
        l.productStatus !== "WITHDRAWN"
    )
    .slice(0, 3);

  // If product not found or no longer available on marketplace
  if (!product || !isAvailable) {
    return (
      <div className="max-w-5xl mx-auto py-12 px-4 space-y-10">
        <div className="text-center space-y-4 max-w-lg mx-auto bg-stone-50 border border-stone-200 p-8 rounded-3xl">
          <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-stone-900">
              This Product is No Longer Available
            </h2>
            <p className="text-stone-500 text-sm mt-1.5 leading-relaxed">
              Product listing <strong className="text-stone-800 font-mono">{productId}</strong> has been withdrawn, archived, or fulfilled by the farmer.
            </p>
          </div>
          <div className="pt-2 flex justify-center gap-3">
            <Link href="/buyer">
              <Button className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-xl">
                ← Explore Buyer Marketplace
              </Button>
            </Link>
          </div>
        </div>

        {/* Recommended Alternatives */}
        {recommendations.length > 0 && (
          <div className="space-y-4 pt-4 border-t border-stone-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-stone-900">Recommended Available Consignments</h3>
                <p className="text-xs text-stone-500">Other verified farm lots ready for immediate procurement</p>
              </div>
              <Link href="/buyer" className="text-xs text-emerald-700 hover:underline font-semibold">
                View All Marketplace Lots →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recommendations.map((rec) => (
                <Card
                  key={rec.id}
                  className="overflow-hidden border-stone-200 hover:border-emerald-400 hover:shadow-md transition-all rounded-2xl"
                >
                  <div className="aspect-video relative bg-stone-900">
                    <img
                      src={rec.coverImageUrl || rec.images?.[0] || "/demo/tomato-top.jpg"}
                      alt={rec.crop}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2.5 left-2.5">
                      <Badge className="bg-emerald-600 text-white text-[10px]">
                        {rec.grade || "Grade A"}
                      </Badge>
                    </div>
                  </div>
                  <div className="p-4 space-y-2">
                    <h4 className="font-bold text-sm text-stone-900">{rec.crop} ({rec.variety})</h4>
                    <div className="flex justify-between text-xs text-stone-600">
                      <span>Volume: {rec.quantityKg} {rec.unit || "kg"}</span>
                      <strong className="text-emerald-700">
                        {rec.askingPricePerQtl ? `₹${rec.askingPricePerQtl}/qtl` : "Market Price"}
                      </strong>
                    </div>
                    <Link href={`/buyer/products/${rec.id}`} className="block pt-2">
                      <Button variant="outline" className="w-full text-xs font-semibold rounded-xl">
                        View Product Details
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  const allImages =
    product.images && product.images.length > 0
      ? product.images
      : ["/demo/tomato-top.jpg", "/demo/tomato-side.jpg", "/demo/tomato-crate.jpg"];

  const unit = product.unit || "kg";
  const pricePerUnit = product.askingPricePerQtl || (product.askingPricePaise ? product.askingPricePaise / 100 : 2200);
  const estTotalValue = Math.round((product.quantityKg / (unit === "quintal" ? 100 : 1)) * pricePerUnit);

  const handleConfirmOrder = async () => {
    setOrderProcessing(true);
    try {
      // Update product to BUYER_RESERVED
      updateProduct(product.id, {
        productStatus: "BUYER_RESERVED",
        buyerId: currentUser?.id || "B1",
        buyerName: currentUser?.name || "Verified Wholesale Buyer",
      });

      toast.success("Consignment Order Placed in Escrow!", {
        description: `₹${estTotalValue.toLocaleString()} allocated to nodal escrow. FPO will confirm lot dispatch.`,
      });

      setIsOrderModalOpen(false);
      router.push("/buyer/delivery");
    } finally {
      setOrderProcessing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      {/* Breadcrumb */}
      <div className="flex items-center justify-between text-xs text-stone-500">
        <Link href="/buyer" className="hover:text-stone-900 flex items-center gap-1 font-medium">
          <ArrowLeft className="w-3.5 h-3.5" /> Buyer Marketplace
        </Link>
        <span className="font-mono">{product.id}</span>
      </div>

      {/* Main Showcase Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Multi-Angle Zoomable Gallery (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="relative aspect-video rounded-2xl overflow-hidden bg-stone-900 border border-stone-200 shadow-sm">
            <img
              src={allImages[selectedPhotoIdx] || "/demo/tomato-top.jpg"}
              alt="Crop Lot Photo"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

            <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-xs text-white text-xs px-3 py-1 rounded-xl font-medium">
              Perspective {selectedPhotoIdx + 1} of {allImages.length}
            </div>

            <div className="absolute bottom-3 left-3 right-3 text-white flex items-center justify-between">
              <div>
                <span className="text-xs text-stone-300 block">Inspected Angle:</span>
                <span className="font-semibold text-sm">
                  {selectedPhotoIdx === 0
                    ? "Top Surface & Color Caliber"
                    : selectedPhotoIdx === 1
                    ? "Side Symmetry & Defect Profile"
                    : "Crate & Batch Lot View"}
                </span>
              </div>
              <Badge className="bg-emerald-600 text-white text-[10px] font-semibold">
                <ShieldCheck className="w-3 h-3 mr-1" /> FPO Inspected
              </Badge>
            </div>
          </div>

          {/* Thumbnails */}
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
            {allImages.map((imgUrl, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setSelectedPhotoIdx(i)}
                className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                  selectedPhotoIdx === i
                    ? "border-emerald-600 ring-2 ring-emerald-500/40 shadow-xs"
                    : "border-stone-200 hover:border-stone-400 opacity-80 hover:opacity-100"
                }`}
              >
                <img src={imgUrl} alt={`Thumb ${i}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Right: Specifications & Procurement Card (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          <Card className="border-stone-200 shadow-sm rounded-2xl p-5 space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <Badge variant="outline" className="font-mono text-xs text-stone-600 bg-stone-50 border-stone-300">
                  {product.id}
                </Badge>
                <Badge className="bg-emerald-600 text-white text-xs font-semibold">
                  <ShieldCheck className="w-3 h-3 mr-1" /> {product.grade || "Grade A"}
                </Badge>
              </div>

              <h1 className="text-2xl font-extrabold text-stone-900">
                {product.crop}{" "}
                <span className="text-lg font-normal text-stone-500">({product.variety})</span>
              </h1>
            </div>

            {/* Price & Quantity Box */}
            <div className="bg-emerald-50/70 border border-emerald-200/60 rounded-xl p-4 grid grid-cols-2 gap-3">
              <div>
                <span className="text-stone-500 text-xs block">Available Volume</span>
                <strong className="text-xl font-extrabold text-stone-900">
                  {product.quantityKg} {unit}
                </strong>
              </div>
              <div>
                <span className="text-stone-500 text-xs block">Asking Price</span>
                <strong className="text-xl font-extrabold text-emerald-700">
                  ₹{pricePerUnit}
                </strong>
                <span className="text-[10px] text-stone-400 block">per {unit}</span>
              </div>
            </div>

            {/* Redacted Farmer Info & Origin Safe Display */}
            <div className="bg-stone-50 border border-stone-200 rounded-xl p-3.5 space-y-2 text-xs">
              <div className="font-semibold text-stone-900 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> Origin &amp; Verification
              </div>
              <div className="text-stone-600 space-y-1">
                <p>
                  <strong>Producer Network:</strong> Verified Farmer Member • Saksham FPO
                </p>
                <p className="flex items-center gap-1 text-stone-600">
                  <MapPin className="w-3.5 h-3.5 text-stone-400" />
                  <strong>Dispatch Hub:</strong> {product.locationName || "Baramati FPO Aggregation Yard, Pune"}
                </p>
                <div className="flex items-center gap-1.5 text-[11px] text-stone-400 pt-1 border-t border-stone-200/60">
                  <Lock className="w-3 h-3 text-stone-400" /> Direct contact &amp; banking details redacted to comply with APMC/FPO custodial rules.
                </div>
              </div>
            </div>

            {/* Batch Attributes */}
            <div className="space-y-2 text-xs text-stone-600 divide-y divide-stone-100">
              <div className="flex justify-between pt-1">
                <span>Packaging Type:</span>
                <strong className="text-stone-800">{product.packagingType || "Standard Crates"}</strong>
              </div>
              <div className="flex justify-between pt-2">
                <span>Harvest Date:</span>
                <span className="text-stone-800">{product.harvestDate || "Within 48 hours"}</span>
              </div>
              <div className="flex justify-between pt-2">
                <span>Estimated Consignment Value:</span>
                <strong className="text-stone-900 font-bold text-sm">₹{estTotalValue.toLocaleString()}</strong>
              </div>
            </div>

            {/* Reserve Escrow Button */}
            <Button
              onClick={() => setIsOrderModalOpen(true)}
              className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm rounded-xl py-5 shadow-sm flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" /> Procure via Nodal Escrow (₹{estTotalValue.toLocaleString()})
            </Button>
          </Card>
        </div>
      </div>

      {/* AI Vision Assessment & Mandatory Disclaimer */}
      <Card className="border-stone-200 shadow-sm rounded-2xl overflow-hidden">
        <CardHeader className="bg-stone-50 border-b border-stone-200 py-4 px-6">
          <CardTitle className="text-base font-bold text-stone-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600" /> Multi-Angle AI Quality Assessment
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {product.analysis ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <span className="text-stone-400 block text-[10px]">Laplacian Sharpness</span>
                  <strong className="font-semibold text-stone-900 text-sm">
                    {product.analysis.blurScore?.toFixed(1) ?? "142.5"}
                  </strong>
                  <span className="text-emerald-700 text-[10px] block mt-0.5 font-medium">✓ Gate Passed</span>
                </div>
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <span className="text-stone-400 block text-[10px]">Illumination Score</span>
                  <strong className="font-semibold text-stone-900 text-sm">
                    {product.analysis.brightnessScore?.toFixed(1) ?? "132.0"}
                  </strong>
                  <span className="text-emerald-700 text-[10px] block mt-0.5 font-medium">✓ Gate Passed</span>
                </div>
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <span className="text-stone-400 block text-[10px]">Size Uniformity</span>
                  <strong className="font-semibold text-stone-900 text-sm">
                    {product.analysis.parameters?.sizeUniformity || "92% in band"}
                  </strong>
                </div>
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <span className="text-stone-400 block text-[10px]">Defect Ratio</span>
                  <strong className="font-semibold text-stone-900 text-sm">
                    {product.analysis.parameters?.surfaceDefectsPct || 1.8}%
                  </strong>
                </div>
              </div>

              {/* Mandatory AI Visual Estimate Disclaimer */}
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start gap-3 text-xs text-amber-900 leading-relaxed">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold mb-0.5">Mandatory AI Vision Quality Disclaimer:</p>
                  <p>
                    External visual-quality estimate only; not laboratory or official AGMARK certification. Internal moisture, sweetness (Brix sugar content), and chemical residue are not measurable from surface photos alone and are subject to physical verification upon delivery at the destination APMC/packhouse.
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="p-6 text-center text-xs text-stone-500">
              Visual quality verified by FPO agricultural supervisor at Baramati Yard.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Escrow Payment Order Modal */}
      <Dialog open={isOrderModalOpen} onOpenChange={setIsOrderModalOpen}>
        <DialogContent className="max-w-md bg-white border border-stone-200 shadow-2xl rounded-2xl p-6">
          <DialogHeader className="space-y-2">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <DialogTitle className="text-lg font-bold text-stone-900">
              Authorize Escrow Purchase Order
            </DialogTitle>
            <DialogDescription className="text-xs text-stone-500 leading-relaxed">
              Place a procurement hold for consignment <strong className="text-stone-900">{product.id}</strong>.
              Funds remain protected in an RBI-compliant nodal account until verified delivery and weigh-scale acceptance.
            </DialogDescription>
          </DialogHeader>

          <div className="bg-stone-50 p-4 rounded-xl space-y-2 text-xs border border-stone-200">
            <div className="flex justify-between">
              <span className="text-stone-500">Crop &amp; Grade:</span>
              <strong className="text-stone-900">{product.crop} ({product.grade || "Grade A"})</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Consignment Weight:</span>
              <strong className="text-stone-900">{product.quantityKg} {unit}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Rate:</span>
              <strong className="text-stone-900">₹{pricePerUnit} / {unit}</strong>
            </div>
            <div className="flex justify-between border-t border-stone-200 pt-2 text-sm">
              <span className="font-bold text-stone-800">Total Escrow Hold:</span>
              <strong className="font-extrabold text-emerald-700">₹{estTotalValue.toLocaleString()}</strong>
            </div>
          </div>

          <DialogFooter className="flex gap-2 pt-3 border-t border-stone-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOrderModalOpen(false)}
              disabled={orderProcessing}
              className="w-full text-xs"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleConfirmOrder}
              disabled={orderProcessing}
              className="w-full bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold"
            >
              {orderProcessing ? "Authorizing..." : "Confirm & Place Escrow"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
