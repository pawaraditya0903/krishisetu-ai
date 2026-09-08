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
  login: (user: User) => void;
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

  resetDemoData: () => void;
}

// Initial deterministic seed data for Baramati pilot
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
    id: "LOT-TOM-8492",
    farmerId: "F1",
    farmerName: "Ramesh Patil",
    crop: "Tomato",
    variety: "Desi Special",
    quantityKg: 300,
    grade: "Grade B",
    confidenceScore: 74,
    status: "Draft",
    createdAt: "2026-09-08T06:15:00Z",
    images: ["/demo/tomato-desi.jpg"],
    qrCode: "KS-LOT-TOM-8492-DRAFT",
  },
  {
    id: "LOT-TOM-8493",
    farmerId: "F2",
    farmerName: "Suresh Gaikwad",
    crop: "Tomato",
    variety: "Abhinav (Hybrid)",
    quantityKg: 350,
    grade: "Grade A",
    confidenceScore: 88,
    status: "Submitted",
    createdAt: "2026-09-08T07:45:00Z",
    images: ["/demo/tomato-crate-2.jpg"],
    qrCode: "KS-LOT-TOM-8493-SUBMITTED",
  },
];

const initialPools: Pool[] = [
  {
    id: "POOL-PUNE-0908",
    crop: "Tomato",
    variety: "Abhinav (Hybrid)",
    targetKg: 1000,
    currentKg: 650,
    allowedGrades: ["Grade A"],
    status: "Open",
    closesAt: new Date(Date.now() + 6 * 3600 * 1000).toISOString(),
    pricePerQtl: 2150,
    collectionHub: "Baramati APMC Yard Hub",
    destinationMandi: "Pune Market Yard",
    sharedFreightSavingsPct: 28.5,
    transporter: {
      name: "Patil Agro Logistics",
      vehicleNumber: "MH-12-RN-5821",
      contact: "+91 98220 12345",
    },
    contributions: [
      {
        lotId: "LOT-TOM-8490",
        farmerId: "F3",
        farmerName: "Vikas Shinde",
        quantityKg: 200,
        grade: "Grade A",
        joinedAt: "2026-09-07T14:00:00Z",
        estShareFreightPaise: 18000,
      },
    ],
  },
  {
    id: "POOL-SOLAPUR-0907",
    crop: "Tomato",
    variety: "Abhinav (Hybrid)",
    targetKg: 800,
    currentKg: 800,
    allowedGrades: ["Grade A", "Grade B"],
    status: "Reserved",
    closesAt: "2026-09-07T18:00:00Z",
    buyerId: "B1",
    buyerName: "FreshMart Foods Pvt. Ltd.",
    pricePerQtl: 2050,
    collectionHub: "Baramati APMC Yard Hub",
    destinationMandi: "Solapur APMC",
    sharedFreightSavingsPct: 31.0,
    transporter: {
      name: "Shivaji Freightlines",
      vehicleNumber: "MH-42-B-9912",
      contact: "+91 94230 54321",
    },
  },
];

const initialMandiPrices: MandiPrice[] = [
  {
    id: "M1",
    mandi: "Baramati APMC",
    crop: "Tomato",
    variety: "Hybrid",
    minPrice: 1650,
    modalPrice: 1850,
    maxPrice: 2000,
    arrivalsQtl: 420,
    distanceKm: 12,
    updatedAt: "2026-09-08T06:00:00Z",
    freshness: "Fresh (Today)",
    source: "APMC Baramati Daily Yard Bulletin",
  },
  {
    id: "M2",
    mandi: "Pune Gultekdi Market Yard",
    crop: "Tomato",
    variety: "Hybrid",
    minPrice: 1800,
    modalPrice: 2150,
    maxPrice: 2350,
    arrivalsQtl: 1450,
    distanceKm: 92,
    updatedAt: "2026-09-08T06:30:00Z",
    freshness: "Fresh (Today)",
    source: "MSAMB e-Mandi Daily Bulletin",
  },
  {
    id: "M3",
    mandi: "Solapur APMC",
    crop: "Tomato",
    variety: "Hybrid",
    minPrice: 1700,
    modalPrice: 2020,
    maxPrice: 2180,
    arrivalsQtl: 880,
    distanceKm: 190,
    updatedAt: "2026-09-08T05:45:00Z",
    freshness: "Fresh (Today)",
    source: "Solapur Market Committee",
  },
];

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

      login: (user) => set({ currentUser: user }),
      logout: () => set({ currentUser: null }),
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

          return {
            id: `SET-${Date.now()}-${idx}`,
            transactionId: `KS-TXN-${Math.floor(100000 + Math.random() * 900000)}`,
            farmerId: lot.farmerId,
            farmerName: lot.farmerName,
            poolId,
            lotId: lot.id,
            amount: net,
            status: "Released",
            date: new Date().toISOString(),
            nodalAccountRef: `YESB0000109-SANDBOX-NODAL-${Math.floor(1000 + Math.random() * 9000)}`,
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

        // Simple deterministic hash simulation for immutable ledger demo
        const str = `${lastHash}|${timestamp}|${actor}|${action}|${entityType}|${entityId}|${details}`;
        let hashInt = 0;
        for (let i = 0; i < str.length; i++) {
          hashInt = (hashInt << 5) - hashInt + str.charCodeAt(i);
          hashInt |= 0;
        }
        const pseudoHash = Math.abs(hashInt).toString(16).padStart(16, "0") + "fa89bc01";

        const newEvent: AuditEvent = {
          id: `AUD-${Date.now()}`,
          timestamp,
          actorName: actor,
          actorRole: role,
          action,
          entityType,
          entityId,
          details,
          prevHash: lastHash,
          hash: pseudoHash,
        };

        set((state) => ({ auditEvents: [newEvent, ...state.auditEvents] }));
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
