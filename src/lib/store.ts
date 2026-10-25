import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  User,
  CropLot,
  Pool,
  MandiPrice,
  Settlement,
  AuditEvent,
  LogisticsRoutePlan,
} from "./types";
import { Language } from "./i18n";
import { queueOfflineAction } from "./offline-queue";
import { WIDE_MAHARASHTRA_MANDI_DATA, WIDE_FPO_POOLS } from "./agricultural-data";

interface AppState {
  currentUser: User | null;
  isOffline: boolean;
  language: Language;
  lots: CropLot[];
  pools: Pool[];
  mandiPrices: MandiPrice[];
  settlements: Settlement[];
  auditEvents: AuditEvent[];
  routePlans: LogisticsRoutePlan[];

  // Actions
  login: (user: User, token?: string) => void;
  logout: () => void;
  setOffline: (status: boolean) => void;
  setLanguage: (lang: Language) => void;

  addLot: (lot: CropLot) => void;
  updateLotStatus: (
    id: string,
    status: CropLot["status"],
    grade?: CropLot["grade"],
    verifiedWeight?: number,
    fpoNotes?: string
  ) => void;

  createPool: (pool: Omit<Pool, "id">) => void;
  joinPool: (lotId: string, poolId: string) => void;
  reservePool: (poolId: string, buyerId: string, buyerName?: string) => void;
  dispatchPool: (
    poolId: string,
    transporter?: { name: string; vehicleNumber: string; contact: string }
  ) => void;
  acceptDelivery: (poolId: string) => void;
  raiseDispute: (poolId: string, reason: string) => void;
  addAuditEvent: (
    action: string,
    entityType: string,
    entityId: string,
    details: string
  ) => void;

  fetchRealTimeMandiPrices: (crop?: string, mandi?: string) => Promise<void>;

  resetDemoData: () => void;
}

// Initial wide seed data for Maharashtra clusters
const initialLots: CropLot[] = [
  {
    id: "LOT-TOM-8491",
    farmerId: "F1",
    farmerName: "Ramesh Patil",
    crop: "Tomato",
    variety: "Abhinav (Hybrid)",
    quantityKg: 450,
    grade: "Grade A",
    confidenceScore: 91,
    status: "Verified",
    createdAt: "2026-09-07T09:30:00Z",
    images: ["/demo/tomato-top.jpg", "/demo/tomato-side.jpg", "/demo/tomato-crate.jpg"],
    qrCode: "KS-LOT-TOM-8491-VERIFIED-BARAMATI",
    verifiedWeightKg: 450,
    verifiedGrade: "Grade A",
    fpoNotes: "Verified at Baramati Collection Center #2. Excellent firmness and uniform reddish-orange color.",
    analysis: {
      blurScore: 142.5,
      blurPassed: true,
      brightnessScore: 135.0,
      brightnessPassed: true,
      occupancyScore: 78.4,
      occupancyPassed: true,
      pHash: "a7c8e19f2b4c8d11",
      externalScore: 89,
      estimatedGrade: "Grade A",
      confidence: "High",
      confidencePct: 91,
      detectedIssues: ["Minor sunscald on 2% sample (< 5% tolerance)"],
      parameters: {
        sizeUniformity: "92% within 55-65mm band",
        ripenessIndex: "85% Table-firm breaker-to-pink",
        surfaceDefectsPct: 2.1,
        colorScore: "Optimal uniform red",
      },
      disclaimer: "External visual-quality estimate only; not laboratory or official AGMARK certification.",
      modelTimestamp: "2026-09-07T09:28:14Z",
      isMockInference: true,
    },
  },
  {
    id: "LOT-ONI-3912",
    farmerId: "F1",
    farmerName: "Ramesh Patil",
    crop: "Onion",
    variety: "Unhali Red Garva",
    quantityKg: 1200,
    grade: "Grade A",
    confidenceScore: 89,
    status: "Pooled",
    createdAt: "2026-09-08T06:15:00Z",
    images: ["/demo/tomato-desi.jpg"],
    qrCode: "KS-LOT-ONI-3912-POOLED-NASHIK",
  },
  {
    id: "LOT-COT-5104",
    farmerId: "F2",
    farmerName: "Suresh Gaikwad",
    crop: "Cotton",
    variety: "Long Staple White Gold",
    quantityKg: 850,
    grade: "Grade A",
    confidenceScore: 94,
    status: "Verified",
    createdAt: "2026-09-08T07:45:00Z",
    images: ["/demo/tomato-crate-2.jpg"],
    qrCode: "KS-LOT-COT-5104-VERIFIED-AKOLA",
  },
  {
    id: "LOT-POM-7219",
    farmerId: "F1",
    farmerName: "Ramesh Patil",
    crop: "Pomegranate",
    variety: "Bhagwa Export Grade",
    quantityKg: 600,
    grade: "Grade A",
    confidenceScore: 93,
    status: "Draft",
    createdAt: "2026-09-08T08:30:00Z",
    images: ["/demo/tomato-side.jpg"],
    qrCode: "KS-LOT-POM-7219-DRAFT",
  },
  {
    id: "LOT-SOY-4482",
    farmerId: "F3",
    farmerName: "Vikas Shinde",
    crop: "Soyabean",
    variety: "Yellow High Protein",
    quantityKg: 1500,
    grade: "Grade A",
    confidenceScore: 90,
    status: "Submitted",
    createdAt: "2026-09-08T09:00:00Z",
    images: ["/demo/tomato-crate.jpg"],
    qrCode: "KS-LOT-SOY-4482-SUBMITTED-LATUR",
  },
];

const initialPools: Pool[] = WIDE_FPO_POOLS.map((p) => ({
  id: p.id,
  crop: p.crop,
  variety: p.variety,
  targetKg: p.target_kg,
  currentKg: p.current_kg,
  allowedGrades: ["Grade A", "Grade B"],
  status: p.status as Pool["status"],
  closesAt: p.closes_at,
  pricePerQtl: p.price_per_qtl,
  collectionHub: p.collection_hub,
  destinationMandi: p.destination_mandi,
  sharedFreightSavingsPct: p.shared_freight_savings_pct,
  transporter: {
    name: "Maha Kisan Logistics",
    vehicleNumber: "MH-12-RN-5821",
    contact: "+91 98220 12345",
  },
  contributions: [
    {
      lotId: `LOT-${p.crop.slice(0, 3).toUpperCase()}-8491`,
      farmerId: "F1",
      farmerName: "Ramesh Patil",
      quantityKg: Math.round(p.current_kg * 0.35),
      grade: "Grade A",
      joinedAt: new Date(Date.now() - 3600 * 1000).toISOString(),
      estShareFreightPaise: 18000,
    },
  ],
}));

const initialMandiPrices: MandiPrice[] = WIDE_MAHARASHTRA_MANDI_DATA.map((r) => ({
  id: r.id,
  mandi: r.mandi,
  crop: r.crop,
  variety: r.variety,
  minPrice: r.min_price,
  modalPrice: r.modal_price,
  maxPrice: r.max_price,
  arrivalsQtl: r.arrivals_qtl,
  distanceKm: r.distance_km,
  updatedAt: "2026-09-08T06:00:00Z",
  freshness: "Fresh (Today)",
  source: r.source,
}));

const initialSettlements: Settlement[] = [
  {
    id: "SET-2026-00041",
    transactionId: "KS-TXN-90218",
    farmerId: "F1",
    farmerName: "Ramesh Patil",
    poolId: "POOL-SOLAPUR-PREV",
    lotId: "LOT-TOM-8401",
    amount: 8645,
    status: "Released",
    date: "2026-09-06T15:30:00Z",
    nodalAccountRef: "YESB0000109-NODAL-ESCROW-SIM-81",
    breakdown: {
      gross: 9450,
      freight: 420,
      packaging: 180,
      handling: 75,
      fpoFee: 130,
      qualityAdj: 0,
      lossBuffer: 0,
      net: 8645,
    },
  },
];

const initialAuditEvents: AuditEvent[] = [
  {
    id: "AUD-001",
    timestamp: "2026-09-07T09:30:00Z",
    actorName: "Saksham FPO Manager",
    actorRole: "fpo",
    action: "LOT_VERIFIED",
    entityType: "CROP_LOT",
    entityId: "LOT-TOM-8491",
    details: "Grade A confirmed. Verified weight 450 kg at Baramati Hub.",
    prevHash: "0000000000000000000000000000000000000000000000000000000000000000",
    hash: "3b7c89f2a4d9821ef9a12c8b74301dfca21980bc9e1a87c6b4e09f7a8b61c82e",
  },
  {
    id: "AUD-002",
    timestamp: "2026-09-07T14:30:00Z",
    actorName: "FreshMart Foods Pvt. Ltd.",
    actorRole: "buyer",
    action: "PAYMENT_AUTHORIZED_NODAL",
    entityType: "POOL",
    entityId: "POOL-SOLAPUR-0907",
    details: "Nodal guarantee of ₹16,400 authorized for 800 kg lot.",
    prevHash: "3b7c89f2a4d9821ef9a12c8b74301dfca21980bc9e1a87c6b4e09f7a8b61c82e",
    hash: "c98df71a6e29810fba4b721890cf28a19b0c741e8f9a2b5e6c7d8190af12e34d",
  },
];

const initialRoutePlans: LogisticsRoutePlan[] = [
  {
    routeId: "ROUTE-BARAMATI-NORTH",
    vehicle: "Tata 407 (MH-12-RN-5821)",
    driver: "Santosh Kadam (+91 98223 98765)",
    stops: [
      { locationName: "Ramesh Patil Farm, Malegaon BK", lat: 18.154, lng: 74.582, pickupKg: 450, window: "07:00 - 08:30" },
      { locationName: "Suresh Gaikwad Farm, Rui", lat: 18.172, lng: 74.595, pickupKg: 350, window: "08:45 - 09:30" },
      { locationName: "Baramati FPO Hub (Consolidation)", lat: 18.151, lng: 74.577, pickupKg: 0, window: "10:00 - 11:00" },
    ],
    totalDistanceKm: 26.4,
    loadUtilizationPct: 88.8,
    estCostInr: 1250,
    savingsVsIndividualPct: 28.5,
  },
];

// Pure TypeScript implementation of standard SHA-256 for browser ledger integrity
function sha256Hex(ascii: string): string {
  function rightRotate(value: number, amount: number) {
    return (value >>> amount) | (value << (32 - amount));
  }
  const lengthProperty = "length";
  let i = 0, j = 0;
  let result = "";
  const words: number[] = [];
  const asciiBitLength = ascii[lengthProperty] * 8;
  const hash = [
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
    0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
  ];
  const k = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ];
  const compositeLength = asciiBitLength;
  for (i = 0; i < ascii[lengthProperty]; i++) {
    words[i >> 2] |= (ascii.charCodeAt(i) & 0xff) << ((3 - (i % 4)) * 8);
  }
  words[compositeLength >> 5] |= 0x80 << (24 - (compositeLength % 32));
  words[(((compositeLength + 64) >> 9) << 4) + 15] = compositeLength;

  const w: number[] = new Array(64);
  for (i = 0; i < words[lengthProperty]; i += 16) {
    let a = hash[0], b = hash[1], c = hash[2], d = hash[3], e = hash[4], f = hash[5], g = hash[6], h = hash[7];
    for (j = 0; j < 64; j++) {
      if (j < 16) {
        w[j] = words[i + j] | 0;
      } else {
        const gamma0 = rightRotate(w[j - 15], 7) ^ rightRotate(w[j - 15], 18) ^ (w[j - 15] >>> 3);
        const gamma1 = rightRotate(w[j - 2], 17) ^ rightRotate(w[j - 2], 19) ^ (w[j - 2] >>> 10);
        w[j] = (w[j - 16] + gamma0 + w[j - 7] + gamma1) | 0;
      }
      const ch = (e & f) ^ (~e & g);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const sigma0 = rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22);
      const sigma1 = rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25);
      const t1 = (h + sigma1 + ch + k[j] + w[j]) | 0;
      const t2 = (sigma0 + maj) | 0;
      h = g; g = f; f = e; e = (d + t1) | 0; d = c; c = b; b = a; a = (t1 + t2) | 0;
    }
    hash[0] = (hash[0] + a) | 0; hash[1] = (hash[1] + b) | 0; hash[2] = (hash[2] + c) | 0; hash[3] = (hash[3] + d) | 0;
    hash[4] = (hash[4] + e) | 0; hash[5] = (hash[5] + f) | 0; hash[6] = (hash[6] + g) | 0; hash[7] = (hash[7] + h) | 0;
  }
  for (i = 0; i < 8; i++) {
    for (j = 3; j >= 0; j--) {
      const byte = (hash[i] >> (j * 8)) & 0xff;
      result += byte.toString(16).padStart(2, "0");
    }
  }
  return result;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      isOffline: false,
      language: "en",
      lots: initialLots,
      pools: initialPools,
      mandiPrices: initialMandiPrices,
      settlements: initialSettlements,
      auditEvents: initialAuditEvents,
      routePlans: initialRoutePlans,

      login: (user, token) => {
        const userWithToken = { ...user, accessToken: token || user.accessToken };
        set({ currentUser: userWithToken });
        if (typeof window !== "undefined" && token) {
          try {
            localStorage.setItem("krishisetu_jwt", token);
          } catch {}
        }
      },
      logout: () => {
        set({ currentUser: null });
        if (typeof window !== "undefined") {
          try {
            localStorage.removeItem("krishisetu_jwt");
          } catch {}
        }
      },
      setOffline: (status) => set({ isOffline: status }),
      setLanguage: (language) => set({ language }),

      addLot: (lot) => {
        const { isOffline, addAuditEvent } = get();
        if (isOffline) {
          queueOfflineAction("CREATE_LOT", lot);
        }
        set((state) => ({ lots: [lot, ...state.lots] }));
        addAuditEvent("CREATE_LOT", "CROP_LOT", lot.id, `Created lot ${lot.id} for ${lot.quantityKg} kg ${lot.crop}`);
      },

      updateLotStatus: (id, status, grade, verifiedWeight, fpoNotes) => {
        const { addAuditEvent } = get();
        set((state) => ({
          lots: state.lots.map((l) =>
            l.id === id
              ? {
                  ...l,
                  status,
                  ...(grade ? { grade, verifiedGrade: grade } : {}),
                  ...(verifiedWeight !== undefined ? { verifiedWeightKg: verifiedWeight } : {}),
                  ...(fpoNotes ? { fpoNotes } : {}),
                }
              : l
          ),
        }));
        addAuditEvent("UPDATE_LOT_STATUS", "CROP_LOT", id, `Updated status to ${status}${grade ? ` with grade ${grade}` : ""}`);
      },

      createPool: (poolData) => {
        const newPool: Pool = {
          ...poolData,
          id: `POOL-${Date.now().toString().slice(-6)}`,
        };
        set((state) => ({ pools: [newPool, ...state.pools] }));
        get().addAuditEvent("CREATE_POOL", "POOL", newPool.id, `Created pool for ${newPool.crop} targeting ${newPool.targetKg} kg`);
      },

      joinPool: (lotId, poolId) => {
        const lot = get().lots.find((l) => l.id === lotId);
        if (!lot) return;

        if (get().isOffline) {
          queueOfflineAction("JOIN_POOL", { lotId, poolId });
        }

        set((state) => ({
          lots: state.lots.map((l) =>
            l.id === lotId ? { ...l, status: "Pooled", poolId } : l
          ),
          pools: state.pools.map((p) =>
            p.id === poolId
              ? {
                  ...p,
                  currentKg: p.currentKg + lot.quantityKg,
                  contributions: [
                    ...(p.contributions || []),
                    {
                      lotId: lot.id,
                      farmerId: lot.farmerId,
                      farmerName: lot.farmerName,
                      quantityKg: lot.quantityKg,
                      grade: lot.grade,
                      joinedAt: new Date().toISOString(),
                      estShareFreightPaise: Math.round(lot.quantityKg * 0.9 * 100),
                    },
                  ],
                }
              : p
          ),
        }));

        get().addAuditEvent(
          "JOIN_POOL",
          "POOL",
          poolId,
          `Farmer ${lot.farmerName} joined pool with ${lot.quantityKg} kg`
        );
      },

      reservePool: (poolId, buyerId, buyerName = "FreshMart Foods Pvt. Ltd.") => {
        set((state) => ({
          pools: state.pools.map((p) =>
            p.id === poolId ? { ...p, status: "Reserved", buyerId, buyerName } : p
          ),
          lots: state.lots.map((l) =>
            l.poolId === poolId ? { ...l, status: "Reserved" } : l
          ),
        }));

        get().addAuditEvent(
          "RESERVE_POOL",
          "POOL",
          poolId,
          `Buyer ${buyerName} reserved pool. Sandbox nodal payment authorized.`
        );
      },

      dispatchPool: (poolId, transporter) => {
        set((state) => ({
          pools: state.pools.map((p) =>
            p.id === poolId
              ? {
                  ...p,
                  status: "Dispatched",
                  ...(transporter ? { transporter } : {}),
                }
              : p
          ),
          lots: state.lots.map((l) =>
            l.poolId === poolId ? { ...l, status: "Dispatched" } : l
          ),
        }));

        get().addAuditEvent(
          "DISPATCH_POOL",
          "POOL",
          poolId,
          `Pool dispatched via ${transporter?.vehicleNumber || "Assigned Transporter"}. Weigh-slip generated.`
        );
      },

      acceptDelivery: (poolId) => {
        const pool = get().pools.find((p) => p.id === poolId);
        const poolLots = get().lots.filter((l) => l.poolId === poolId);
        const pricePerQtl = pool?.pricePerQtl || 2050;

        const newSettlements: Settlement[] = poolLots.map((lot, idx) => {
          const weightKg = lot.verifiedWeightKg || lot.quantityKg;
          const gross = Math.round((weightKg / 100) * pricePerQtl);
          const freight = Math.round(weightKg * 0.85); // shared freight rate
          const packaging = Math.round(weightKg * 0.35);
          const handling = Math.round(weightKg * 0.15);
          const fpoFee = Math.round(gross * 0.015);
          const qualityAdj = 0;
          const lossBuffer = 0;
          const net = gross - freight - packaging - handling - fpoFee - qualityAdj - lossBuffer;

          const safePoolId = poolId.replace(/[^a-zA-Z0-9]/g, "");
          const safeLotId = lot.id.replace(/[^a-zA-Z0-9]/g, "");

          return {
            id: `SET-${safePoolId}-${safeLotId}`,
            transactionId: `KS-TXN-${safePoolId.slice(-6)}-${safeLotId.slice(-6)}`,
            farmerId: lot.farmerId,
            farmerName: lot.farmerName,
            poolId,
            lotId: lot.id,
            amount: net,
            status: "Released",
            date: new Date().toISOString(),
            nodalAccountRef: `YESB0000109-SANDBOX-NODAL-${safePoolId.slice(-4)}-00${idx + 1}`,
            breakdown: { gross, freight, packaging, handling, fpoFee, qualityAdj, lossBuffer, net },
          };
        });

        set((state) => ({
          pools: state.pools.map((p) =>
            p.id === poolId ? { ...p, status: "Accepted" } : p
          ),
          lots: state.lots.map((l) =>
            l.poolId === poolId ? { ...l, status: "Paid" } : l
          ),
          settlements: [...newSettlements, ...state.settlements],
        }));

        get().addAuditEvent(
          "DELIVERY_ACCEPTED",
          "POOL",
          poolId,
          `Buyer accepted delivery. Authorized sandbox funds released to ${newSettlements.length} farmers.`
        );
      },

      raiseDispute: (poolId, reason) => {
        set((state) => ({
          pools: state.pools.map((p) =>
            p.id === poolId ? { ...p, status: "Disputed" } : p
          ),
          lots: state.lots.map((l) =>
            l.poolId === poolId ? { ...l, status: "Disputed" } : l
          ),
        }));

        get().addAuditEvent(
          "DISPUTE_RAISED",
          "POOL",
          poolId,
          `Dispute raised by buyer: "${reason}". Sandbox payment placed on hold pending FPO/Admin review.`
        );
      },

      addAuditEvent: (action, entityType, entityId, details) => {
        const prevEvents = get().auditEvents;
        const lastHash = prevEvents[0]?.hash || "0000000000000000000000000000000000000000000000000000000000000000";
        const actor = get().currentUser?.name || "System Automated";
        const role = get().currentUser?.role || "system";
        const timestamp = new Date().toISOString();

        // Cryptographic SHA-256 for immutable ledger chaining (Fix C7 & L2)
        const str = `${lastHash}|${timestamp}|${actor}|${role}|${action}|${entityType}|${entityId}|${details}`;
        const shaHash = sha256Hex(str);

        const newEvent: AuditEvent = {
          id: `AUD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
          timestamp,
          actorName: actor,
          actorRole: role,
          action,
          entityType,
          entityId,
          details,
          prevHash: lastHash,
          hash: shaHash,
        };

        set((state) => ({ auditEvents: [newEvent, ...state.auditEvents] }));
      },

      fetchRealTimeMandiPrices: async (crop?: string, mandi?: string) => {
        try {
          const apiBaseUrl =
            process.env.NEXT_PUBLIC_API_URL ||
            (typeof window !== "undefined" ? "/api/v1" : "http://127.0.0.1:8000/api/v1");
          const query = new URLSearchParams();
          if (crop && crop !== "All") query.append("crop", crop);
          if (mandi) query.append("mandi", mandi);

          const url = `${apiBaseUrl}/market/prices${
            query.toString() ? `?${query.toString()}` : ""
          }`;
          const res = await fetch(url);
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
              const mapped: MandiPrice[] = data.map((item: {
                id: string;
                mandi: string;
                crop: string;
                variety: string;
                min_price: number;
                modal_price: number;
                max_price: number;
                arrivals_qtl: number;
                distance_km: number;
                freshness?: string;
                source: string;
              }) => ({
                id: item.id,
                mandi: item.mandi,
                crop: item.crop,
                variety: item.variety,
                minPrice: item.min_price,
                modalPrice: item.modal_price,
                maxPrice: item.max_price,
                arrivalsQtl: item.arrivals_qtl,
                distanceKm: item.distance_km,
                updatedAt: new Date().toISOString(),
                freshness:
                  item.freshness && item.freshness.includes("Yesterday")
                    ? "Recent (Yesterday)"
                    : item.freshness && item.freshness.includes("Stale")
                    ? "Stale (Verify before dispatch)"
                    : "Fresh (Today)",
                source: item.source,
              }));
              set({ mandiPrices: mapped });
              return;
            }
          }
        } catch {
          // Backend offline or error: retain current / local state
        }
      },

      resetDemoData: () =>
        set({
          lots: initialLots,
          pools: initialPools,
          mandiPrices: initialMandiPrices,
          settlements: initialSettlements,
          auditEvents: initialAuditEvents,
          routePlans: initialRoutePlans,
        }),
    }),
    {
      name: "krishisetu-storage-v2",
    }
  )
);
