"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useAppStore } from "@/lib/store";
import { CropLot, ProductStatus } from "@/lib/types";
import { apiClient } from "@/lib/api-client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import {
  Package,
  Plus,
  Search,
  Filter,
  Eye,
  Trash2,
  Archive,
  ArrowUpRight,
  Globe,
  Lock,
  QrCode,
  ShieldCheck,
  AlertTriangle,
  Layers,
  Sparkles,
  CheckCircle2,
  Clock,
  ChevronRight,
  LayoutGrid,
  Table as TableIcon,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { translations } from "@/lib/i18n";

export default function FarmerProductsPage() {
  const {
    lots,
    currentUser,
    deleteDraftProduct,
    withdrawProduct,
    archiveProduct,
    publishProduct,
    language,
  } = useAppStore();

  const t = translations[language] || translations.en;

  // Filter state
  const [selectedTab, setSelectedTab] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCrop, setSelectedCrop] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "qty_desc" | "qty_asc">("newest");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Modals state
  const [deleteTarget, setDeleteTarget] = useState<CropLot | null>(null);
  const [withdrawTarget, setWithdrawTarget] = useState<CropLot | null>(null);
  const [qrModalTarget, setQrModalTarget] = useState<CropLot | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Farmer's products (matching current farmer ID or fallback)
  const farmerLots = useMemo(() => {
    return lots.filter((l) => !l.deletedAt && (l.farmerId === currentUser?.id || l.farmerId === "F1"));
  }, [lots, currentUser]);

  // Distinct crops for dropdown filter
  const distinctCrops = useMemo(() => {
    const set = new Set<string>();
    farmerLots.forEach((l) => set.add(l.crop));
    return Array.from(set);
  }, [farmerLots]);

  // KPI Calculations
  const kpiStats = useMemo(() => {
    const total = farmerLots.length;
    const drafts = farmerLots.filter((l) =>
      ["DRAFT", "PHOTOS_UPLOADED", "Draft"].includes(l.productStatus || l.status)
    ).length;
    const underAnalysis = farmerLots.filter((l) =>
      ["UNDER_ANALYSIS", "NEEDS_REUPLOAD"].includes(l.productStatus || "")
    ).length;
    const awaitingVerification = farmerLots.filter((l) =>
      ["AWAITING_FPO_VERIFICATION", "Submitted"].includes(l.productStatus || l.status)
    ).length;
    const published = farmerLots.filter((l) =>
      l.productStatus === "PUBLISHED" || l.marketplaceVisibility === "PUBLIC"
    ).length;
    const inPool = farmerLots.filter((l) =>
      ["IN_POOL", "POOL_REQUESTED", "Pooled"].includes(l.productStatus || l.status)
    ).length;
    const buyerReserved = farmerLots.filter((l) =>
      ["BUYER_RESERVED", "Reserved"].includes(l.productStatus || l.status)
    ).length;
    const sold = farmerLots.filter((l) =>
      ["SOLD", "DELIVERED", "DISPATCHED", "Delivered", "Accepted", "Paid"].includes(l.productStatus || l.status)
    ).length;
    const archived = farmerLots.filter((l) =>
      ["ARCHIVED", "WITHDRAWN"].includes(l.productStatus || "") || l.archivedAt
    ).length;

    return {
      total,
      drafts,
      underAnalysis,
      awaitingVerification,
      published,
      inPool,
      buyerReserved,
      sold,
      archived,
    };
  }, [farmerLots]);

  // Tab Filtering logic
  const filteredProducts = useMemo(() => {
    return farmerLots
      .filter((l) => {
        // Status tab
        const status = (l.productStatus || l.status).toUpperCase();
        if (selectedTab === "DRAFT") {
          if (!["DRAFT", "PHOTOS_UPLOADED"].includes(status)) return false;
        } else if (selectedTab === "AWAITING_VERIFICATION") {
          if (!["AWAITING_FPO_VERIFICATION", "SUBMITTED"].includes(status)) return false;
        } else if (selectedTab === "FPO_VERIFIED") {
          if (!["FPO_VERIFIED", "VERIFIED"].includes(status)) return false;
        } else if (selectedTab === "PUBLISHED") {
          if (l.productStatus !== "PUBLISHED" && l.marketplaceVisibility !== "PUBLIC") return false;
        } else if (selectedTab === "IN_POOL") {
          if (!["IN_POOL", "POOL_REQUESTED", "POOLED"].includes(status)) return false;
        } else if (selectedTab === "BUYER_RESERVED") {
          if (!["BUYER_RESERVED", "RESERVED"].includes(status)) return false;
        } else if (selectedTab === "DISPATCHED") {
          if (status !== "DISPATCHED") return false;
        } else if (selectedTab === "DELIVERED") {
          if (status !== "DELIVERED") return false;
        } else if (selectedTab === "SOLD") {
          if (!["SOLD", "ACCEPTED", "PAID"].includes(status)) return false;
        } else if (selectedTab === "ARCHIVED") {
          if (!["ARCHIVED", "WITHDRAWN"].includes(status) && !l.archivedAt) return false;
        }

        // Crop dropdown
        if (selectedCrop !== "ALL" && l.crop.toLowerCase() !== selectedCrop.toLowerCase()) {
          return false;
        }

        // Search text
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchId = l.id.toLowerCase().includes(q);
          const matchCrop = l.crop.toLowerCase().includes(q);
          const matchVariety = (l.variety || "").toLowerCase().includes(q);
          const matchHub = (l.locationName || "").toLowerCase().includes(q);
          if (!matchId && !matchCrop && !matchVariety && !matchHub) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "newest") {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        } else if (sortBy === "oldest") {
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        } else if (sortBy === "qty_desc") {
          return b.quantityKg - a.quantityKg;
        } else if (sortBy === "qty_asc") {
          return a.quantityKg - b.quantityKg;
        }
        return 0;
      });
  }, [farmerLots, selectedTab, selectedCrop, searchQuery, sortBy]);

  // Handler: Delete Draft
  const handleConfirmDeleteDraft = async () => {
    if (!deleteTarget) return;
    setActionLoading(true);

    try {
      // Call backend delete API
      try {
        await apiClient.products.deleteDraft(deleteTarget.id);
      } catch (err: any) {
        console.warn("Backend draft deletion failed or fallback:", err);
      }

      // Update Zustand store
      const res = deleteDraftProduct(deleteTarget.id);
      if (res.success) {
        toast.success(`Draft product ${deleteTarget.id} deleted successfully`);
      } else {
        toast.error(res.message || "Failed to delete product");
      }
    } catch (err) {
      toast.error("Error deleting draft");
    } finally {
      setActionLoading(false);
      setDeleteTarget(null);
    }
  };

  // Handler: Withdraw from Marketplace
  const handleConfirmWithdraw = async () => {
    if (!withdrawTarget) return;
    setActionLoading(true);

    try {
      try {
        await apiClient.products.withdraw(withdrawTarget.id);
      } catch (err) {
        console.warn("Backend withdrawal fallback:", err);
      }

      const res = withdrawProduct(withdrawTarget.id);
      if (res.success) {
        toast.success(`Product ${withdrawTarget.id} withdrawn from Marketplace`, {
          description: "It is immediately hidden from buyer search and commercial catalogs.",
        });
      } else {
        toast.error(res.message || "Unable to withdraw product.");
      }
    } catch (err) {
      toast.error("Failed to withdraw product.");
    } finally {
      setActionLoading(false);
      setWithdrawTarget(null);
    }
  };

  // Handler: Quick Publish
  const handleQuickPublish = async (lot: CropLot) => {
    try {
      try {
        await apiClient.products.publish(lot.id);
      } catch (err) {
        console.warn("Backend publish fallback:", err);
      }

      const res = publishProduct(lot.id);
      if (res.success) {
        toast.success(`Product ${lot.id} is now Live on Buyer Marketplace!`, {
          description: "Buyers across India can view your verified lot and place purchase orders.",
        });
      } else {
        toast.error(res.message || "Unable to publish product.");
      }
    } catch (err) {
      toast.error("Failed to publish product.");
    }
  };

  // Helper for Status Badge
  const getStatusBadge = (status: string, visibility?: string) => {
    const s = status.toUpperCase();

    if (visibility === "PUBLIC" || s === "PUBLISHED") {
      return (
        <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white text-[11px] font-semibold flex items-center gap-1 border-none shadow-xs">
          <Globe className="w-3 h-3" /> Live on Marketplace
        </Badge>
      );
    }

    switch (s) {
      case "DRAFT":
      case "PHOTOS_UPLOADED":
        return (
          <Badge variant="outline" className="bg-stone-50 text-stone-600 border-stone-300 text-[11px]">
            Draft
          </Badge>
        );
      case "UNDER_ANALYSIS":
        return (
          <Badge className="bg-amber-100 text-amber-900 border-none text-[11px] flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-700 animate-spin" /> Under AI Analysis
          </Badge>
        );
      case "AWAITING_FPO_VERIFICATION":
      case "SUBMITTED":
        return (
          <Badge className="bg-blue-100 text-blue-900 border-none text-[11px] flex items-center gap-1">
            <Clock className="w-3 h-3 text-blue-700" /> Awaiting FPO Verification
          </Badge>
        );
      case "FPO_VERIFIED":
      case "VERIFIED":
        return (
          <Badge className="bg-teal-100 text-teal-900 border-none text-[11px] flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-teal-700" /> FPO Verified
          </Badge>
        );
      case "IN_POOL":
      case "POOL_REQUESTED":
      case "POOLED":
        return (
          <Badge className="bg-purple-100 text-purple-900 border-none text-[11px] flex items-center gap-1">
            <Layers className="w-3 h-3 text-purple-700" /> In FPO Pool
          </Badge>
        );
      case "BUYER_RESERVED":
      case "RESERVED":
        return (
          <Badge className="bg-amber-100 text-amber-900 border-none text-[11px] font-bold">
            Buyer Reserved
          </Badge>
        );
      case "DISPATCHED":
        return <Badge className="bg-indigo-100 text-indigo-900 border-none text-[11px]">Dispatched</Badge>;
      case "DELIVERED":
      case "SOLD":
      case "ACCEPTED":
      case "PAID":
        return (
          <Badge className="bg-emerald-100 text-emerald-900 border-none text-[11px] flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-700" /> Sold &amp; Settled
          </Badge>
        );
      case "WITHDRAWN":
        return (
          <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200 text-[11px]">
            Withdrawn
          </Badge>
        );
      case "ARCHIVED":
        return (
          <Badge variant="outline" className="bg-stone-100 text-stone-500 border-stone-300 text-[11px]">
            Archived
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16">
      {/* 1. Header with Title & Add Product Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 flex items-center gap-2.5">
            <Package className="w-7 h-7 text-emerald-700" />
            My Products
            <span className="text-base font-normal text-stone-500">
              ({farmerLots.length} items)
            </span>
          </h1>
          <p className="text-stone-500 text-sm mt-0.5">
            Manage your crop inventory, multi-angle AI quality assessments, pooling, and marketplace listings.
          </p>
        </div>

        <Link href="/farmer/grade">
          <Button className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-xl shadow-sm flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add New Product
          </Button>
        </Link>
      </div>

      {/* 2. 9 KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 gap-2.5">
        {[
          { label: "Total Products", count: kpiStats.total, color: "text-stone-900", tab: "ALL" },
          { label: "Drafts", count: kpiStats.drafts, color: "text-stone-600", tab: "DRAFT" },
          { label: "Under Analysis", count: kpiStats.underAnalysis, color: "text-amber-700", tab: "UNDER_ANALYSIS" },
          { label: "Awaiting Verification", count: kpiStats.awaitingVerification, color: "text-blue-700", tab: "AWAITING_VERIFICATION" },
          { label: "Published Live", count: kpiStats.published, color: "text-emerald-700 font-bold", tab: "PUBLISHED" },
          { label: "In FPO Pool", count: kpiStats.inPool, color: "text-purple-700", tab: "IN_POOL" },
          { label: "Buyer Reserved", count: kpiStats.buyerReserved, color: "text-amber-800 font-bold", tab: "BUYER_RESERVED" },
          { label: "Sold & Settled", count: kpiStats.sold, color: "text-emerald-800", tab: "SOLD" },
          { label: "Archived", count: kpiStats.archived, color: "text-stone-500", tab: "ARCHIVED" },
        ].map((kpi, idx) => {
          const isSelected = selectedTab === kpi.tab;
          return (
            <div
              key={idx}
              onClick={() => setSelectedTab(kpi.tab)}
              className={`p-3 rounded-xl border cursor-pointer transition-all ${
                isSelected
                  ? "bg-emerald-50/80 border-emerald-500 shadow-xs ring-1 ring-emerald-500"
                  : "bg-white border-stone-200 hover:border-stone-300 hover:bg-stone-50/50"
              }`}
            >
              <span className="text-[11px] font-medium text-stone-500 block truncate" title={kpi.label}>
                {kpi.label}
              </span>
              <span className={`text-xl font-extrabold mt-1 block ${kpi.color}`}>
                {kpi.count}
              </span>
            </div>
          );
        })}
      </div>

      {/* 3. Filter Bar & Controls */}
      <Card className="border-stone-200 shadow-xs rounded-2xl">
        <CardContent className="p-4 space-y-4">
          {/* Top row: Search, Crop select, Sort & View toggle */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <Input
                placeholder="Search by ID, crop, variety, location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-10 rounded-xl border-stone-200 text-sm focus-visible:ring-emerald-600"
              />
            </div>

            {/* Filters & View Toggles */}
            <div className="flex items-center gap-2.5 w-full md:w-auto justify-between md:justify-end">
              {/* Crop Filter */}
              <select
                value={selectedCrop}
                onChange={(e) => setSelectedCrop(e.target.value)}
                className="text-xs h-10 rounded-xl border border-stone-200 px-3 bg-white text-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              >
                <option value="ALL">All Crops ({distinctCrops.length})</option>
                {distinctCrops.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              {/* Sort By */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="text-xs h-10 rounded-xl border border-stone-200 px-3 bg-white text-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="qty_desc">Quantity: High to Low</option>
                <option value="qty_asc">Quantity: Low to High</option>
              </select>

              {/* Grid / Table switch */}
              <div className="flex items-center bg-stone-100 p-1 rounded-xl border border-stone-200">
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 rounded-lg text-xs transition-colors ${
                    viewMode === "grid" ? "bg-white text-emerald-800 shadow-xs font-semibold" : "text-stone-500 hover:text-stone-800"
                  }`}
                  title="Grid Cards"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("table")}
                  className={`p-1.5 rounded-lg text-xs transition-colors ${
                    viewMode === "table" ? "bg-white text-emerald-800 shadow-xs font-semibold" : "text-stone-500 hover:text-stone-800"
                  }`}
                  title="Table View"
                >
                  <TableIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Status Tabs Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs border-t border-stone-100 pt-3 scrollbar-none">
            {[
              { id: "ALL", label: "All Products" },
              { id: "DRAFT", label: "Drafts" },
              { id: "AWAITING_VERIFICATION", label: "Awaiting Verification" },
              { id: "FPO_VERIFIED", label: "FPO Verified" },
              { id: "PUBLISHED", label: "Published Live" },
              { id: "IN_POOL", label: "In FPO Pool" },
              { id: "BUYER_RESERVED", label: "Buyer Reserved" },
              { id: "DISPATCHED", label: "Dispatched" },
              { id: "DELIVERED", label: "Delivered" },
              { id: "SOLD", label: "Sold & Settled" },
              { id: "ARCHIVED", label: "Archived/Withdrawn" },
            ].map((tab) => {
              const active = selectedTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id)}
                  className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-all ${
                    active
                      ? "bg-emerald-700 text-white font-semibold shadow-xs"
                      : "bg-stone-50 text-stone-600 hover:bg-stone-100"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* 4. Products Display (Grid or Table) */}
      {filteredProducts.length === 0 ? (
        <Card className="p-12 text-center border-dashed border-stone-300 rounded-2xl">
          <CardContent className="space-y-4">
            <div className="mx-auto w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-700">
              <Package className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-stone-800">No Products Found</h3>
              <p className="text-sm text-stone-500 max-w-sm mx-auto mt-1">
                {searchQuery || selectedCrop !== "ALL" || selectedTab !== "ALL"
                  ? "No products match the selected filters or search terms. Try clearing filters."
                  : "You haven't uploaded or graded any products yet. Start by grading your crop to build your listing."}
              </p>
            </div>
            <Link href="/farmer/grade">
              <Button className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-xl text-xs px-5">
                + Grade &amp; Add New Crop
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : viewMode === "grid" ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProducts.map((lot) => {
            const isDraft = ["DRAFT", "PHOTOS_UPLOADED", "Draft"].includes(lot.productStatus || lot.status);
            const isPublished = lot.productStatus === "PUBLISHED" || lot.marketplaceVisibility === "PUBLIC";
            const canDeleteDraft = isDraft && !lot.poolId && !lot.buyerId;
            const canWithdraw = isPublished && !["BUYER_RESERVED", "DISPATCHED", "DELIVERED", "SOLD"].includes(lot.productStatus || "");
            const canQuickPublish =
              !isPublished &&
              ["FPO_VERIFIED", "VERIFIED", "ANALYSIS_COMPLETE", "Grade A", "Grade B"].includes(lot.grade || "") &&
              !lot.archivedAt;

            const coverImg =
              lot.coverImageUrl ||
              lot.images?.[0] ||
              "/demo/tomato-top.jpg";

            return (
              <Card
                key={lot.id}
                className="overflow-hidden border-stone-200 hover:border-emerald-400 hover:shadow-md transition-all rounded-2xl flex flex-col justify-between"
              >
                <div>
                  {/* Top Image & Status Banner */}
                  <div className="relative aspect-video bg-stone-900 overflow-hidden">
                    <img
                      src={coverImg}
                      alt={lot.crop}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent pointer-events-none" />

                    {/* Status Badge */}
                    <div className="absolute top-3 left-3">
                      {getStatusBadge(lot.productStatus || lot.status, lot.marketplaceVisibility)}
                    </div>

                    {/* AI Grade Badge */}
                    <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-xs text-stone-900 text-xs font-bold px-2.5 py-1 rounded-xl shadow-sm flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      {lot.grade || lot.aiGrade || "Grade A"}
                    </div>

                    {/* Bottom overlay text */}
                    <div className="absolute bottom-2.5 left-3 right-3 text-white">
                      <h3 className="font-extrabold text-lg leading-tight">
                        {lot.crop}{" "}
                        <span className="text-sm font-normal text-stone-200">({lot.variety})</span>
                      </h3>
                      <div className="flex items-center justify-between text-xs text-stone-300 mt-0.5">
                        <span className="font-mono text-[11px]">{lot.id}</span>
                        <span>{new Date(lot.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Body Details */}
                  <div className="p-4 space-y-3 text-xs">
                    <div className="grid grid-cols-2 gap-2 bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                      <div>
                        <span className="text-stone-400 block text-[10px]">Volume</span>
                        <strong className="text-stone-800 font-semibold text-sm">
                          {lot.quantityKg} {lot.unit || "kg"}
                        </strong>
                      </div>
                      <div>
                        <span className="text-stone-400 block text-[10px]">Target Price</span>
                        <strong className="text-emerald-700 font-semibold text-sm">
                          {lot.askingPricePerQtl || lot.askingPricePaise
                            ? `₹${lot.askingPricePerQtl || (lot.askingPricePaise ? lot.askingPricePaise / 100 : 0)} / ${lot.unit || "qtl"}`
                            : "Market Rate"}
                        </strong>
                      </div>
                    </div>

                    {/* Quality summary */}
                    <div className="flex items-center justify-between text-stone-600">
                      <span>Quality Confidence:</span>
                      <strong className="text-stone-900 font-semibold">
                        {lot.confidenceScore || 91}% (High)
                      </strong>
                    </div>

                    {/* Collection Hub */}
                    <div className="flex items-center justify-between text-stone-600">
                      <span>FPO Hub:</span>
                      <span className="text-stone-800 font-medium truncate max-w-[170px]">
                        {lot.locationName || "Baramati FPO Yard"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="p-3 bg-stone-50/70 border-t border-stone-100 flex items-center justify-between gap-1.5">
                  {/* Left: QR Pass button */}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setQrModalTarget(lot)}
                    className="text-stone-600 hover:text-stone-900 text-xs gap-1 px-2"
                    title="View QR Dispatch Pass"
                  >
                    <QrCode className="w-3.5 h-3.5" /> Pass
                  </Button>

                  {/* Right Action buttons */}
                  <div className="flex items-center gap-1.5">
                    {/* Safe Delete Draft Button (Strictly uncommitted draft only) */}
                    {canDeleteDraft && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setDeleteTarget(lot)}
                        className="text-rose-600 border-rose-200 hover:bg-rose-50 text-xs px-2.5 h-8 gap-1"
                        title="Delete Draft Product"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </Button>
                    )}

                    {/* Withdraw from Marketplace Button */}
                    {canWithdraw && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setWithdrawTarget(lot)}
                        className="text-amber-700 border-amber-300 hover:bg-amber-50 text-xs px-2.5 h-8 gap-1 font-medium"
                      >
                        Withdraw
                      </Button>
                    )}

                    {/* Quick Publish Button */}
                    {canQuickPublish && (
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => handleQuickPublish(lot)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-2.5 h-8 gap-1 font-medium"
                      >
                        <Globe className="w-3.5 h-3.5" /> Publish
                      </Button>
                    )}

                    {/* Full Product Detail Link */}
                    <Link href={`/farmer/products/${lot.id}`}>
                      <Button
                        size="sm"
                        className="bg-stone-900 hover:bg-stone-800 text-white text-xs px-3 h-8 gap-1 font-medium rounded-xl"
                      >
                        <Eye className="w-3.5 h-3.5" /> View
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <Card className="border-stone-200 overflow-hidden shadow-xs rounded-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="p-3.5">Product</th>
                  <th className="p-3.5">ID</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Grade</th>
                  <th className="p-3.5">Quantity</th>
                  <th className="p-3.5">Target Price</th>
                  <th className="p-3.5">Date</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredProducts.map((lot) => {
                  const isDraft = ["DRAFT", "PHOTOS_UPLOADED", "Draft"].includes(lot.productStatus || lot.status);
                  const isPublished = lot.productStatus === "PUBLISHED" || lot.marketplaceVisibility === "PUBLIC";
                  const canDeleteDraft = isDraft && !lot.poolId && !lot.buyerId;
                  const canWithdraw = isPublished && !["BUYER_RESERVED", "DISPATCHED", "DELIVERED", "SOLD"].includes(lot.productStatus || "");
                  const coverImg = lot.coverImageUrl || lot.images?.[0] || "/demo/tomato-top.jpg";

                  return (
                    <tr key={lot.id} className="hover:bg-stone-50/70 transition-colors">
                      <td className="p-3.5 flex items-center gap-3">
                        <img
                          src={coverImg}
                          alt={lot.crop}
                          className="w-10 h-10 rounded-xl object-cover border border-stone-200 shrink-0"
                        />
                        <div>
                          <div className="font-bold text-stone-900">{lot.crop}</div>
                          <div className="text-stone-500 text-[11px]">{lot.variety || "Standard"}</div>
                        </div>
                      </td>
                      <td className="p-3.5 font-mono text-stone-600">{lot.id}</td>
                      <td className="p-3.5">
                        {getStatusBadge(lot.productStatus || lot.status, lot.marketplaceVisibility)}
                      </td>
                      <td className="p-3.5">
                        <Badge variant="outline" className="font-bold text-emerald-800 bg-emerald-50 border-emerald-200">
                          {lot.grade || "Grade A"}
                        </Badge>
                      </td>
                      <td className="p-3.5 font-semibold text-stone-800">
                        {lot.quantityKg} {lot.unit || "kg"}
                      </td>
                      <td className="p-3.5 font-semibold text-emerald-700">
                        {lot.askingPricePerQtl
                          ? `₹${lot.askingPricePerQtl} / ${lot.unit || "qtl"}`
                          : "Market Rate"}
                      </td>
                      <td className="p-3.5 text-stone-500">
                        {new Date(lot.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-3.5 text-right space-x-1.5">
                        {canDeleteDraft && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteTarget(lot)}
                            className="text-rose-600 hover:bg-rose-50 h-7 px-2"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        )}
                        {canWithdraw && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setWithdrawTarget(lot)}
                            className="text-amber-700 border-amber-300 h-7 px-2 text-[11px]"
                          >
                            Withdraw
                          </Button>
                        )}
                        <Link href={`/farmer/products/${lot.id}`}>
                          <Button size="sm" variant="outline" className="h-7 px-2.5 text-[11px]">
                            View
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* 5. Safe Delete Confirmation Modal (Drafts Only) */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => (!open ? setDeleteTarget(null) : undefined)}>
        <DialogContent className="max-w-md bg-white border border-stone-200 shadow-2xl rounded-2xl p-6">
          <DialogHeader className="space-y-2">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <DialogTitle className="text-lg font-bold text-stone-900">
              Permanently Delete Draft Product?
            </DialogTitle>
            <DialogDescription className="text-xs text-stone-500 leading-relaxed">
              Are you sure you want to permanently delete draft{" "}
              <strong className="text-stone-900 font-mono">{deleteTarget?.id}</strong> ({deleteTarget?.crop} - {deleteTarget?.variety})?
              This will remove all associated staged photos and inspection records. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex gap-2 pt-4 border-t border-stone-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={actionLoading}
              className="w-full text-xs"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleConfirmDeleteDraft}
              disabled={actionLoading}
              className="w-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold"
            >
              {actionLoading ? "Deleting..." : "Yes, Delete Draft"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 6. Withdraw Confirmation Modal */}
      <Dialog open={!!withdrawTarget} onOpenChange={(open) => (!open ? setWithdrawTarget(null) : undefined)}>
        <DialogContent className="max-w-md bg-white border border-stone-200 shadow-2xl rounded-2xl p-6">
          <DialogHeader className="space-y-2">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <DialogTitle className="text-lg font-bold text-stone-900">
              Withdraw Product from Marketplace?
            </DialogTitle>
            <DialogDescription className="text-xs text-stone-500 leading-relaxed">
              Withdrawing <strong className="text-stone-900">{withdrawTarget?.crop}</strong> ({withdrawTarget?.id})
              will immediately delist it from the commercial Buyer Marketplace. Buyers who attempt to view the public URL will be informed that the product is no longer available.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex gap-2 pt-4 border-t border-stone-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setWithdrawTarget(null)}
              disabled={actionLoading}
              className="w-full text-xs"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleConfirmWithdraw}
              disabled={actionLoading}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold"
            >
              {actionLoading ? "Withdrawing..." : "Confirm Withdrawal"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 7. QR Code Check-in Modal */}
      <Dialog open={!!qrModalTarget} onOpenChange={(open) => (!open ? setQrModalTarget(null) : undefined)}>
        <DialogContent className="max-w-sm bg-white border border-stone-200 shadow-2xl rounded-2xl p-6 text-center space-y-4">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-stone-900">
              FPO Collection Center Digital Pass
            </DialogTitle>
            <DialogDescription className="text-xs text-stone-500">
              Show this digital code to the weigh-bridge operator at {qrModalTarget?.locationName || "Baramati FPO Yard"}
            </DialogDescription>
          </DialogHeader>

          <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl inline-block mx-auto">
            <div className="w-44 h-44 bg-white border border-stone-300 rounded-xl p-2 mx-auto flex flex-col items-center justify-center text-center">
              <QrCode className="w-28 h-28 text-stone-800" />
              <span className="font-mono text-[10px] text-stone-600 font-bold mt-1">
                {qrModalTarget?.qrCode || qrModalTarget?.id}
              </span>
            </div>
          </div>

          <div className="text-xs text-stone-600 space-y-1">
            <p>
              <strong>Product:</strong> {qrModalTarget?.crop} ({qrModalTarget?.variety})
            </p>
            <p>
              <strong>Quantity:</strong> {qrModalTarget?.quantityKg} {qrModalTarget?.unit || "kg"}
            </p>
            <p>
              <strong>Grade Estimate:</strong> {qrModalTarget?.grade || "Grade A"}
            </p>
          </div>

          <Button
            type="button"
            onClick={() => setQrModalTarget(null)}
            className="w-full bg-emerald-700 hover:bg-emerald-800 text-white text-xs rounded-xl"
          >
            Close Pass
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
