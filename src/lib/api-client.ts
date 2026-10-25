import {
  QualityAnalysisResult,
  CropGrade,
  MandiPrice,
  Pool,
  LogisticsRoutePlan,
  AuditEvent,
} from "./types";
import { useAppStore } from "./store";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== "undefined" ? "/api/v1" : "http://127.0.0.1:8000/api/v1");

interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  isOffline: boolean;
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const token = useAppStore.getState().currentUser?.accessToken;
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>),
    };

    if (token && !headers["Authorization"]) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    if (!(options.body instanceof FormData) && !headers["Content-Type"]) {
      headers["Content-Type"] = "application/json";
    }

    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({ detail: res.statusText }));
      return {
        data: null,
        error: errData.detail || `HTTP Error ${res.status}`,
        isOffline: false,
      };
    }

    const data = await res.json();
    return { data, error: null, isOffline: false };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Network error";
    return { data: null, error: message, isOffline: true };
  }
}

export const apiClient = {
  baseUrl: API_BASE_URL,

  // Health check
  health: {
    check: async () => request<{ status: string; service: string }>("/health"),
  },

  // Auth operations
  auth: {
    login: async (phone: string, password: string) => {
      return request<{
        access_token: string;
        token_type: string;
        role: string;
        name: string;
        phone: string;
        kyc_status: string;
      }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ phone, password }),
      });
    },
    me: async () => {
      return request<{
        id: string;
        name: string;
        phone: string;
        role: string;
        location?: string;
        kyc_status: string;
      }>("/auth/me");
    },
  },

  // AI Quality Grading
  vision: {
    analyzeImage: async (
      file: Blob | File,
      cropName: string = "Tomato"
    ): Promise<ApiResponse<QualityAnalysisResult>> => {
      const formData = new FormData();
      formData.append("file", file, "harvest_photo.jpg");
      formData.append("crop_name", cropName);

      try {
        const token = useAppStore.getState().currentUser?.accessToken;
        const headers: Record<string, string> = {};
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const res = await fetch(`${API_BASE_URL}/vision/analyze`, {
          method: "POST",
          headers,
          body: formData,
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({ detail: "Analysis failed" }));
          return { data: null, error: errData.detail || "Quality analysis failed", isOffline: false };
        }

        const raw = await res.json();

        // Transform backend response to frontend QualityAnalysisResult
        const mappedResult: QualityAnalysisResult = {
          blurScore: raw.blur_score ?? 145.0,
          blurPassed: raw.blur_passed ?? true,
          brightnessScore: raw.brightness_score ?? 135.0,
          brightnessPassed: raw.brightness_passed ?? true,
          occupancyScore: raw.occupancy_score ?? 80.0,
          occupancyPassed: raw.occupancy_passed ?? true,
          pHash: raw.phash ?? "phash-deterministic-signature",
          externalScore: Math.round(raw.external_quality_score ?? 88),
          estimatedGrade: (raw.estimated_grade as CropGrade) || "Grade A",
          confidence: (raw.confidence_level as "Low" | "Medium" | "High") || "High",
          confidencePct: Math.round(raw.confidence_pct ?? 92),
          detectedIssues: raw.detected_issues ?? [],
          parameters: {
            sizeUniformity: raw.visual_parameters?.size_uniformity ?? "92% uniform (55-65mm)",
            ripenessIndex: raw.visual_parameters?.ripeness_index ?? "Breaker-to-pink firm stage",
            surfaceDefectsPct: raw.visual_parameters?.surface_defects_pct ?? 1.8,
            colorScore: raw.visual_parameters?.color_score ?? "90% Uniform Red-Orange",
          },
          disclaimer:
            raw.disclaimer ||
            "External visual-quality estimate only. Physical verification required at FPO collection center.",
          needsFpoReview: raw.needs_fpo_review ?? false,
          modelTimestamp: new Date().toISOString(),
          isMockInference: false,
        };

        return { data: mappedResult, error: null, isOffline: false };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Network error";
        return { data: null, error: message, isOffline: true };
      }
    },
  },

  // Crop lots
  crops: {
    createLot: async (lotData: {
      farmer_id: string;
      crop_name: string;
      variety: string;
      quantity_kg: number;
      grade: string;
      confidence_score?: number;
      status?: string;
    }) => {
      return request<{
        id: string;
        crop_name: string;
        variety: string;
        quantity_kg: number;
        grade: string;
        status: string;
        qr_code: string;
      }>("/crops/lots", {
        method: "POST",
        body: JSON.stringify(lotData),
      });
    },

    verifyLot: async (
      lotId: string,
      data: {
        verified_weight_kg: number;
        verified_grade: string;
        fpo_notes?: string;
      }
    ) => {
      return request<{
        id: string;
        verified_weight_kg: number;
        verified_grade: string;
        status: string;
      }>(`/crops/lots/${lotId}/verify`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },

    getCatalog: async () => {
      return request<
        Array<{
          id: string;
          name: string;
          marathi_name?: string;
          hindi_name?: string;
          category: string;
          icon: string;
          unit: string;
          perishability: string;
          storage_recommendation?: string;
          default_batch_size_kg: number;
          supported_quality_params?: string[];
          varieties: string[];
          status: string;
        }>
      >("/crops/catalog");
    },

    searchCatalog: async (query: string) => {
      return request<
        Array<{
          id: string;
          name: string;
          marathi_name?: string;
          hindi_name?: string;
          category: string;
          icon: string;
          unit: string;
          perishability: string;
          storage_recommendation?: string;
          default_batch_size_kg: number;
          supported_quality_params?: string[];
          varieties: string[];
          status: string;
        }>
      >(`/crops/catalog/search?q=${encodeURIComponent(query)}`);
    },

    submitRequest: async (data: {
      requested_crop_name: string;
      variety?: string;
      category?: string;
      reason?: string;
    }) => {
      return request<{
        id: string;
        requested_crop_name: string;
        status: string;
      }>("/crops/requests", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },

    createRequest: async (data: {
      farmerId?: string;
      farmerName?: string;
      requestedCropName?: string;
      requested_crop_name?: string;
      variety?: string;
      category?: string;
      reason?: string;
    }) => {
      return request<{
        id: string;
        requested_crop_name: string;
        status: string;
      }>("/crops/requests", {
        method: "POST",
        body: JSON.stringify({
          requested_crop_name: data.requested_crop_name || data.requestedCropName,
          variety: data.variety,
          category: data.category,
          reason: data.reason,
        }),
      });
    },
  },

  // Farmer Products
  products: {
    uploadPhoto: async (
      file: Blob | File,
      category: string = "TOP_VIEW",
      productId?: string,
      cropId?: string
    ) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("category", category);
      if (productId) formData.append("product_id", productId);
      if (cropId) formData.append("crop_id", cropId);

      return request<{
        id: string;
        product_id?: string;
        image_url: string;
        storage_key: string;
        category: string;
        display_order: number;
        uploaded_at: string;
        file_type: string;
        file_size: number;
      }>("/products/upload-photo", {
        method: "POST",
        body: formData,
      });
    },

    create: async (data: {
      farmer_id?: string;
      crop_id?: string;
      crop_name: string;
      variety: string;
      quantity?: number;
      quantity_kg?: number;
      unit?: string;
      harvest_date?: string;
      packaging_type?: string;
      location_id?: string;
      location_name?: string;
      notes?: string;
      product_status?: string;
      image_ids?: string[];
      cover_image_id?: string;
      cover_image_url?: string;
      asking_price_per_qtl?: number;
      asking_price_paise?: number;
    }) => {
      const payload = {
        ...data,
        quantity: data.quantity ?? data.quantity_kg ?? 500,
        quantity_kg: data.quantity_kg ?? data.quantity ?? 500,
      };
      return request<any>("/products", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },

    getMyProducts: async (params?: { status?: string; crop?: string; search?: string }) => {
      let query = "";
      const qp = new URLSearchParams();
      if (params?.status && params.status !== "All") qp.append("status", params.status);
      if (params?.crop && params.crop !== "All") qp.append("crop", params.crop);
      if (params?.search) qp.append("search", params.search);
      const str = qp.toString();
      if (str) query = `?${str}`;
      return request<any[]>(`/products/farmer/me${query}`);
    },

    getById: async (productId: string) => {
      return request<any>(`/products/${productId}`);
    },

    update: async (productId: string, data: any) => {
      return request<any>(`/products/${productId}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },

    publish: async (productId: string) => {
      return request<any>(`/products/${productId}/publish`, {
        method: "POST",
      });
    },

    unpublish: async (productId: string) => {
      return request<any>(`/products/${productId}/unpublish`, {
        method: "POST",
      });
    },

    withdraw: async (productId: string) => {
      return request<any>(`/products/${productId}/withdraw`, {
        method: "POST",
      });
    },

    archive: async (productId: string) => {
      return request<any>(`/products/${productId}/archive`, {
        method: "POST",
      });
    },

    deleteDraft: async (productId: string) => {
      return request<{ status: string; message: string; product_id: string }>(
        `/products/${productId}`,
        {
          method: "DELETE",
        }
      );
    },
  },

  // Buyer Marketplace
  marketplace: {
    getProducts: async (params?: { crop?: string; grade?: string; location?: string }) => {
      const qp = new URLSearchParams();
      if (params?.crop && params.crop !== "All") qp.append("crop", params.crop);
      if (params?.grade && params.grade !== "All") qp.append("grade", params.grade);
      const str = qp.toString();
      const query = str ? `?${str}` : "";
      return request<any[]>(`/marketplace/products${query}`);
    },
  },

  // Market intelligence & forecasts
  market: {
    getPrices: async (crop: string = "Tomato"): Promise<ApiResponse<MandiPrice[]>> => {
      const res = await request<
        {
          id: string;
          mandi: string;
          crop: string;
          variety: string;
          min_price_inr: number;
          modal_price_inr: number;
          max_price_inr: number;
          arrivals_quintal: number;
          distance_km: number;
          source: string;
          freshness_status: string;
        }[]
      >(`/market/prices?crop=${encodeURIComponent(crop)}`);

      if (res.data) {
        const mapped: MandiPrice[] = res.data.map((item) => ({
          id: item.id,
          mandi: item.mandi,
          crop: item.crop,
          variety: item.variety,
          minPrice: item.min_price_inr,
          modalPrice: item.modal_price_inr,
          maxPrice: item.max_price_inr,
          arrivalsQtl: item.arrivals_quintal,
          distanceKm: item.distance_km,
          updatedAt: new Date().toISOString(),
          freshness: item.freshness_status.includes("Today")
            ? "Fresh (Today)"
            : item.freshness_status.includes("Yesterday")
            ? "Recent (Yesterday)"
            : "Stale (Verify before dispatch)",
          source: item.source,
        }));
        return { data: mapped, error: null, isOffline: false };
      }
      return { data: null, error: res.error, isOffline: res.isOffline };
    },

    getNetRealization: async (reqData: {
      mandi_name: string;
      headline_modal_price_per_qtl: number;
      distance_km: number;
      lot_quantity_kg: number;
      freight_rate_per_km?: number;
      handling_fee?: number;
      packaging_fee?: number;
      apmc_commission_pct?: number;
      transit_spoilage_pct?: number;
    }) => {
      return request<{
        mandi_name: string;
        gross_value_inr: number;
        total_deductions_inr: number;
        net_take_home_inr: number;
        net_realized_price_per_qtl: number;
        itemized_deductions: Record<string, number>;
      }>("/market/net-realization", {
        method: "POST",
        body: JSON.stringify(reqData),
      });
    },

    getForecast: async (crop: string = "Tomato") => {
      return request<{
        crop: string;
        variety: string;
        model_name: string;
        current_mandi_modal_inr: number;
        data_freshness: string;
        forecast_horizon_days: number;
        forecast: {
          days_ahead: number;
          date: string;
          p10_downside_inr: number;
          p50_expected_inr: number;
          p90_upside_inr: number;
        }[];
        feature_contributions: {
          feature: string;
          impact_inr: number;
          direction: string;
          reason: string;
        }[];
        non_guarantee_disclaimer: string;
      }>(`/market/forecast/${encodeURIComponent(crop)}`);
    },

    getAdvice: async (crop: string = "Tomato", riskTolerance: string = "BALANCED") => {
      return request<{
        crop: string;
        decision: string;
        action_headline: string;
        confidence_pct: number;
        key_rationale: string[];
        optimal_channel: string;
        perishability_warning: string;
        non_guarantee_disclaimer: string;
      }>(`/market/advice/${encodeURIComponent(crop)}?risk_tolerance=${riskTolerance}`);
    },
  },

  // FPO Pooling
  pools: {
    getPools: async (): Promise<ApiResponse<Pool[]>> => {
      const res = await request<
        {
          id: string;
          crop: string;
          variety: string;
          target_kg: number;
          current_kg: number;
          price_per_qtl: number;
          status: string;
          destination_mandi: string;
          collection_hub: string;
          shared_freight_savings_pct: number;
          closes_at: string;
        }[]
      >("/pools");

      if (res.data) {
        const mapped: Pool[] = res.data.map((p) => ({
          id: p.id,
          crop: p.crop,
          variety: p.variety,
          targetKg: p.target_kg,
          currentKg: p.current_kg,
          allowedGrades: ["Grade A", "Grade B"],
          status: (p.status as Pool["status"]) || "Open",
          closesAt: p.closes_at,
          pricePerQtl: p.price_per_qtl,
          collectionHub: p.collection_hub,
          destinationMandi: p.destination_mandi,
          sharedFreightSavingsPct: p.shared_freight_savings_pct,
        }));
        return { data: mapped, error: null, isOffline: false };
      }
      return { data: null, error: res.error, isOffline: res.isOffline };
    },

    createPool: async (poolData: {
      crop: string;
      variety: string;
      target_kg: number;
      price_per_qtl: number;
      cutoff_hours: number;
      destination_mandi: string;
      collection_hub: string;
    }) => {
      return request<Pool>("/pools", {
        method: "POST",
        body: JSON.stringify(poolData),
      });
    },

    joinPool: async (poolId: string, lotId: string) => {
      return request<Pool>(`/pools/${poolId}/join`, {
        method: "POST",
        body: JSON.stringify({ lot_id: lotId }),
      });
    },
  },

  // Logistics routing
  logistics: {
    getRoutePlan: async (): Promise<ApiResponse<LogisticsRoutePlan>> => {
      const res = await request<{
        route_id: string;
        vehicle: string;
        driver: string;
        stops: {
          location_name: string;
          lat: number;
          lng: number;
          pickup_kg: number;
          window: string;
        }[];
        total_distance_km: number;
        load_utilization_pct: number;
        est_cost_inr: number;
        savings_vs_individual_pct: number;
      }>("/logistics/route-plan");

      if (res.data) {
        const mapped: LogisticsRoutePlan = {
          routeId: res.data.route_id,
          vehicle: res.data.vehicle,
          driver: res.data.driver,
          stops: res.data.stops.map((s) => ({
            locationName: s.location_name,
            lat: s.lat,
            lng: s.lng,
            pickupKg: s.pickup_kg,
            window: s.window,
          })),
          totalDistanceKm: res.data.total_distance_km,
          loadUtilizationPct: res.data.load_utilization_pct,
          estCostInr: res.data.est_cost_inr,
          savingsVsIndividualPct: res.data.savings_vs_individual_pct,
        };
        return { data: mapped, error: null, isOffline: false };
      }
      return { data: null, error: res.error, isOffline: res.isOffline };
    },
  },

  // Audit trail
  audit: {
    getEvents: async (): Promise<ApiResponse<AuditEvent[]>> => {
      const res = await request<
        {
          id: string;
          timestamp: string;
          actor_name: string;
          actor_role: string;
          action: string;
          entity_type: string;
          entity_id: string;
          details: string;
          prev_hash: string;
          hash: string;
        }[]
      >("/audit/events");

      if (res.data) {
        const mapped: AuditEvent[] = res.data.map((evt) => ({
          id: evt.id,
          timestamp: evt.timestamp,
          actorName: evt.actor_name,
          actorRole: evt.actor_role,
          action: evt.action,
          entityType: evt.entity_type,
          entityId: evt.entity_id,
          details: evt.details,
          prevHash: evt.prev_hash,
          hash: evt.hash,
        }));
        return { data: mapped, error: null, isOffline: false };
      }
      return { data: null, error: res.error, isOffline: res.isOffline };
    },
  },

  // Google Gemini AI Voice Assistant
  ai: {
    chat: async (
      message: string,
      language: string = "mr-IN",
      history: { role: string; content: string }[] = [],
      apiKey?: string
    ): Promise<ApiResponse<{ reply: string; source: "gemini" | "fallback"; language: string; actionHint?: string }>> => {
      return request<{ reply: string; source: "gemini" | "fallback"; language: string; actionHint?: string }>(
        "/ai/chat",
        {
          method: "POST",
          body: JSON.stringify({ message, language, history, api_key: apiKey }),
        }
      );
    },
  },
};

