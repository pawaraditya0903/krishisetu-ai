"use client";

import React, { useState, useRef } from "react";
import { ProductImageItem, PhotoCategory } from "@/lib/types";
import { apiClient } from "@/lib/api-client";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  UploadCloud,
  Camera,
  Trash2,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Eye,
  Loader2,
  Image as ImageIcon,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

interface PhotoCategoryConfig {
  id: PhotoCategory;
  label: string;
  marathiLabel: string;
  description: string;
  recommendedAngle: string;
  minPhotos: number;
}

const CATEGORIES: PhotoCategoryConfig[] = [
  {
    id: "TOP_VIEW",
    label: "Top View",
    marathiLabel: "वरचा देखावा",
    description: "Captures skin texture, color uniformity, and stem/calyx condition.",
    recommendedAngle: "90° direct overhead shot of a clean flat layer",
    minPhotos: 1,
  },
  {
    id: "SIDE_VIEW",
    label: "Side View",
    marathiLabel: "बाजूचा देखावा",
    description: "Measures fruit/bulb caliber, length, diameter, and shape symmetry.",
    recommendedAngle: "Horizontal eye-level shot against neutral background",
    minPhotos: 1,
  },
  {
    id: "LOT_VIEW",
    label: "Crate / Full Lot View",
    marathiLabel: "क्रॅट / संपूर्ण ढीग",
    description: "Evaluates overall batch consistency, packing, and defects across harvest.",
    recommendedAngle: "Wide 45° angle of the crates or lot container",
    minPhotos: 1,
  },
];

interface PhotoUploadManagerProps {
  photos: ProductImageItem[];
  onChange: (photos: ProductImageItem[]) => void;
  disabled?: boolean;
}

export function PhotoUploadManager({
  photos,
  onChange,
  disabled = false,
}: PhotoUploadManagerProps) {
  const { currentUser } = useStore();
  const [uploadingCategory, setUploadingCategory] = useState<PhotoCategory | null>(null);
  const [previewModalUrl, setPreviewModalUrl] = useState<string | null>(null);

  // Separate file inputs for each category
  const fileInputRefs: Record<string, React.RefObject<HTMLInputElement | null>> = {
    TOP_VIEW: useRef<HTMLInputElement>(null),
    SIDE_VIEW: useRef<HTMLInputElement>(null),
    LOT_VIEW: useRef<HTMLInputElement>(null),
  };

  const validateFile = (file: File): string | null => {
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!validTypes.includes(file.type.toLowerCase())) {
      return "Only JPEG, PNG, and WebP image formats are supported.";
    }
    const maxSizeBytes = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSizeBytes) {
      return `File ${file.name} exceeds the 10MB maximum size limit.`;
    }
    return null;
  };

  const handleFilesSelected = async (
    files: FileList | null,
    category: PhotoCategory,
    replaceIndex?: number
  ) => {
    if (!files || files.length === 0) return;

    setUploadingCategory(category);
    const farmerId = currentUser?.id || "F1";
    const newItems: ProductImageItem[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const error = validateFile(file);
      if (error) {
        toast.error(error);
        continue;
      }

      try {
        // Try uploading to backend API
        let uploadedItem: ProductImageItem | null = null;
        try {
          const res = await apiClient.products.uploadPhoto(file, category);
          if (res && res.data) {
            uploadedItem = {
              id: res.data.id,
              productId: res.data.product_id,
              farmerId,
              imageUrl: res.data.image_url,
              storageKey: res.data.storage_key,
              category: (res.data.category as PhotoCategory) || category,
              displayOrder: res.data.display_order || 1,
              uploadedAt: res.data.uploaded_at || new Date().toISOString(),
              fileType: res.data.file_type || file.type,
              fileSize: res.data.file_size || file.size,
            };
          }
        } catch (apiErr) {
          console.warn("Backend upload error, fallback to local object URL:", apiErr);
        }

        if (uploadedItem) {
          newItems.push(uploadedItem);
        } else {
          // Fallback object URL
          const localUrl = URL.createObjectURL(file);
          const mockItem: ProductImageItem = {
            id: `IMG-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            farmerId,
            imageUrl: localUrl,
            storageKey: `local_${file.name}`,
            category,
            displayOrder: photos.filter((p) => p.category === category).length + newItems.length + 1,
            uploadedAt: new Date().toISOString(),
            fileType: file.type,
            fileSize: file.size,
          };
          newItems.push(mockItem);
        }
      } catch (err) {
        toast.error(`Failed to process ${file.name}`);
      }
    }

    if (newItems.length > 0) {
      if (typeof replaceIndex === "number" && replaceIndex >= 0) {
        // Replace single item
        const updated = [...photos];
        updated[replaceIndex] = newItems[0];
        onChange(updated);
        toast.success("Photo updated successfully");
      } else {
        onChange([...photos, ...newItems]);
        toast.success(`Added ${newItems.length} photo(s)`);
      }
    }

    setUploadingCategory(null);
  };

  const handleRemove = (photoId: string) => {
    const updated = photos.filter((p) => p.id !== photoId);
    onChange(updated);
    toast.info("Photo removed");
  };

  const getCategoryPhotos = (category: PhotoCategory) => {
    return photos.filter((p) => p.category === category);
  };

  // Check completeness
  const missingCategories = CATEGORIES.filter(
    (cat) => getCategoryPhotos(cat.id).length < cat.minPhotos
  );
  const isAllCategoriesFilled = missingCategories.length === 0;

  return (
    <div className="space-y-6">
      {/* Category Upload Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {CATEGORIES.map((cat) => {
          const categoryPhotos = getCategoryPhotos(cat.id);
          const isSatisfied = categoryPhotos.length >= cat.minPhotos;
          const isUploading = uploadingCategory === cat.id;

          return (
            <div
              key={cat.id}
              className={`border-2 rounded-2xl p-4 flex flex-col justify-between transition-all ${
                isSatisfied
                  ? "border-emerald-500/40 bg-emerald-50/20 shadow-sm"
                  : "border-dashed border-stone-300 bg-stone-50/50 hover:border-emerald-400"
              }`}
            >
              {/* Header */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-stone-900">{cat.label}</span>
                    <span className="text-xs text-stone-500 font-medium">({cat.marathiLabel})</span>
                  </div>
                  {isSatisfied ? (
                    <Badge className="bg-emerald-600 text-white text-[10px] px-1.5 py-0 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Ready
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-[10px] text-amber-700 bg-amber-50 border-amber-300">
                      Required
                    </Badge>
                  )}
                </div>

                <p className="text-xs text-stone-500 line-clamp-2">{cat.description}</p>
                <p className="text-[11px] text-emerald-800 font-medium mt-1">
                  📐 {cat.recommendedAngle}
                </p>
              </div>

              {/* Photo Thumbnails in this category */}
              {categoryPhotos.length > 0 && (
                <div className="grid grid-cols-2 gap-2 my-3">
                  {categoryPhotos.map((photo, pIdx) => (
                    <div
                      key={photo.id}
                      className="relative group rounded-xl overflow-hidden border border-stone-200 bg-stone-100 aspect-square"
                    >
                      <img
                        src={photo.imageUrl}
                        alt={`${cat.label} ${pIdx + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />

                      {/* Hover action overlay */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-1">
                        <button
                          type="button"
                          onClick={() => setPreviewModalUrl(photo.imageUrl)}
                          className="p-1.5 bg-white/90 text-stone-800 rounded-lg hover:bg-white shadow-sm"
                          title="View Full Size"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        {!disabled && (
                          <button
                            type="button"
                            onClick={() => handleRemove(photo.id)}
                            className="p-1.5 bg-rose-600/90 text-white rounded-lg hover:bg-rose-700 shadow-sm"
                            title="Remove Photo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="absolute bottom-1 right-1 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded font-mono">
                        {(photo.fileSize / (1024 * 1024)).toFixed(1)} MB
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload CTA */}
              <div className="mt-3">
                <input
                  type="file"
                  ref={fileInputRefs[cat.id]}
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  disabled={disabled || isUploading}
                  className="hidden"
                  onChange={(e) => handleFilesSelected(e.target.files, cat.id)}
                />

                <Button
                  type="button"
                  variant={isSatisfied ? "outline" : "default"}
                  size="sm"
                  disabled={disabled || isUploading}
                  onClick={() => fileInputRefs[cat.id].current?.click()}
                  className={`w-full text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 ${
                    isSatisfied
                      ? "border-emerald-300 text-emerald-800 hover:bg-emerald-50"
                      : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                  }`}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading...
                    </>
                  ) : categoryPhotos.length > 0 ? (
                    <>
                      <Camera className="w-3.5 h-3.5" /> Add Another Photo
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-3.5 h-3.5" /> Upload {cat.label}
                    </>
                  )}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Validation Status Bar */}
      <div
        className={`rounded-2xl p-4 border flex items-center justify-between ${
          isAllCategoriesFilled
            ? "bg-emerald-50 border-emerald-200 text-emerald-900"
            : "bg-amber-50 border-amber-200 text-amber-900"
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              isAllCategoriesFilled ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
            }`}
          >
            {isAllCategoriesFilled ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
          </div>
          <div>
            <h4 className="text-sm font-bold">
              {isAllCategoriesFilled
                ? "All Required Quality Angles Ready for AI Inference"
                : `Action Needed: Please provide all 3 required photographic angles`}
            </h4>
            <p className="text-xs opacity-90 mt-0.5">
              {isAllCategoriesFilled
                ? `Total ${photos.length} photos staged. Multi-angle triangulation produces the highest quality rating confidence.`
                : `Missing: ${missingCategories.map((c) => c.label).join(", ")}. High-accuracy visual estimation requires all 3 perspectives.`}
            </p>
          </div>
        </div>

        <div className="text-right">
          <Badge
            variant={isAllCategoriesFilled ? "default" : "outline"}
            className={
              isAllCategoriesFilled
                ? "bg-emerald-600 hover:bg-emerald-600 text-white text-xs px-3 py-1 font-semibold"
                : "border-amber-400 text-amber-900 bg-amber-100/60 text-xs px-3 py-1"
            }
          >
            {photos.length} Photos Uploaded
          </Badge>
        </div>
      </div>

      {/* Full Image Preview Modal */}
      {previewModalUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setPreviewModalUrl(null)}
        >
          <div className="relative max-w-3xl max-h-[85vh] bg-stone-900 rounded-2xl overflow-hidden shadow-2xl p-2">
            <button
              type="button"
              onClick={() => setPreviewModalUrl(null)}
              className="absolute top-4 right-4 z-10 bg-stone-800/80 hover:bg-stone-700 text-white p-2 rounded-full text-xs"
            >
              ✕ Close
            </button>
            <img
              src={previewModalUrl}
              alt="Photo preview"
              className="max-h-[80vh] w-auto mx-auto object-contain rounded-xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}
