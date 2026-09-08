export type Role = "farmer" | "fpo" | "buyer" | "admin";

export interface User {
  id: string;
  name: string;
  role: Role;
  location?: string;
  phone?: string;
  avatar?: string;
  fpoId?: string;
  fpoName?: string;
  accessToken?: string;
}

export type CropGrade = "Grade A" | "Grade B" | "Grade C" | "Pending";
export type LotStatus =
  | "Draft"
  | "Submitted"
  | "Verified"
  | "Pooled"
  | "Reserved"
  | "Dispatched"
  | "Delivered"
  | "Accepted"
  | "Disputed"
  | "Paid";

export interface QualityAnalysisResult {
  blurScore: number; // Laplacian variance
  blurPassed: boolean;
  brightnessScore: number;
  brightnessPassed: boolean;
  occupancyScore: number;
  occupancyPassed: boolean;
  pHash: string;
  externalScore: number; // 0-100
  estimatedGrade: CropGrade;
  confidence: "Low" | "Medium" | "High";
  confidencePct: number;
  detectedIssues: string[];
  parameters: {
    sizeUniformity: string;
    ripenessIndex: string;
    surfaceDefectsPct: number;
    colorScore: string;
  };
  disclaimer: string;
  needsFpoReview?: boolean;
  modelTimestamp: string;
  isMockInference: boolean;
}

export interface CropLot {
  id: string;
  farmerId: string;
  farmerName: string;
  crop: string;
  variety: string;
  quantityKg: number;
  grade: CropGrade;
  confidenceScore?: number;
  status: LotStatus;
  createdAt: string;
  images: string[];
  poolId?: string;
  qrCode?: string;
  verifiedWeightKg?: number;
  verifiedGrade?: CropGrade;
  fpoNotes?: string;
  analysis?: QualityAnalysisResult;
}

export interface FarmLocation {
  id: string;
  label: string;
  village?: string;
  taluka?: string;
  district: string;
  state: string;
  pincode?: string;
  lat: number;
  lng: number;
  accuracy: "High (GPS)" | "Medium (Pincode)" | "Manual (Taluka/District)";
  updatedAt: string;
}

export interface MandiPrice {
  id: string;
  mandi: string;
  district?: string;
  state?: string;
  crop: string;
  variety: string;
  minPrice: number;
  modalPrice: number;
  maxPrice: number;
  arrivalsQtl: number;
  distanceKm: number;
  lat?: number;
  lng?: number;
  travelTimeHours?: number;
  updatedAt: string;
  freshness: "Fresh (Today)" | "Recent (Yesterday)" | "Stale (Verify before dispatch)";
  dataStatus?: "Live" | "Cached" | "Stale" | "Demo";
  source: string;
}

export interface ChatActionCard {
  id: string;
  type:
    | "JOIN_POOL"
    | "CHANGE_LOCATION"
    | "SUBMIT_LOT"
    | "VIEW_MANDI"
    | "ACCEPT_OFFER"
    | "CREATE_DISPATCH"
    | "RAISE_DISPUTE";
  title: string;
  description: string;
  payload: Record<string, unknown>;
  confirmText: string;
  cancelText: string;
  status: "pending" | "confirmed" | "cancelled";
}

export interface AssistantMessage {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: string;
  language?: "mr" | "hi" | "en";
  actionCard?: ChatActionCard;
  dataStatus?: "Live" | "Cached" | "Stale" | "Demo";
  source?: string;
  marketDataRef?: {
    mandi: string;
    modalPrice: number;
    distanceKm: number;
    date: string;
  };
}

export type PoolStatus =
  | "Open"
  | "Closed"
  | "Reserved"
  | "Dispatched"
  | "Delivered"
  | "Accepted"
  | "Disputed";

export interface PoolContribution {
  lotId: string;
  farmerId: string;
  farmerName: string;
  quantityKg: number;
  grade: CropGrade;
  joinedAt: string;
  estShareFreightPaise: number;
}

export interface Pool {
  id: string;
  crop: string;
  variety: string;
  targetKg: number;
  currentKg: number;
  allowedGrades: CropGrade[];
  status: PoolStatus;
  closesAt: string;
  buyerId?: string;
  buyerName?: string;
  pricePerQtl: number;
  collectionHub: string;
  destinationMandi: string;
  sharedFreightSavingsPct: number;
  transporter?: {
    name: string;
    vehicleNumber: string;
    contact: string;
  };
  contributions?: PoolContribution[];
}

export interface SettlementBreakdown {
  gross: number;
  freight: number;
  packaging: number;
  handling: number;
  fpoFee: number;
  qualityAdj: number;
  lossBuffer: number;
  net: number;
}

export interface Settlement {
  id: string;
  transactionId: string;
  farmerId: string;
  farmerName?: string;
  poolId?: string;
  lotId?: string;
  amount: number;
  status: "Pending" | "Released" | "Disputed";
  date: string;
  nodalAccountRef: string;
  breakdown: SettlementBreakdown;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: string;
  action: string;
  entityType: string;
  entityId: string;
  details: string;
  prevHash: string;
  hash: string;
}

export interface LogisticsRoutePlan {
  routeId: string;
  vehicle: string;
  driver: string;
  stops: {
    locationName: string;
    lat: number;
    lng: number;
    pickupKg: number;
    window: string;
  }[];
  totalDistanceKm: number;
  loadUtilizationPct: number;
  estCostInr: number;
  savingsVsIndividualPct: number;
}
