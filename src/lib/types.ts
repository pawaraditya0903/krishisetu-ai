export type Role = "farmer" | "fpo" | "buyer" | "admin";

export type UserStatus = "Active" | "Pending" | "Inactive";

export interface User {
  id: string;
  name: string;
  role: Role;
  location?: string;
  phone?: string;
  email?: string;
  avatar?: string;
  gender?: "Male" | "Female" | "Other" | "Prefer not to say";
  preferredLanguage?: "mr" | "hi" | "en";
  status: UserStatus;
  farmerType?: "Individual" | "Tenant" | "FPO Member" | "SHG Member" | "Small/Marginal" | "Medium" | "Large";
  farmName?: string;
  village?: string;
  taluka?: string;
  district?: string;
  state?: string;
  pincode?: string;
  lat?: number;
  lng?: number;
  farmAreaAcres?: number;
  crops?: string[];
  primaryCrops?: string[];
  bankUpiMasked?: string;
  upiId?: string;
  fpoId?: string;
  fpoName?: string;
  assignedFpoId?: string;
  assignedFpoName?: string;
  assignedDistricts?: string[];
  organization?: string;
  rating?: number;
  paymentReliabilityScore?: number;
  defaultPassword?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
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
  freshness: "Live (Today)" | "Fresh (Today)" | "Recent (Yesterday)" | "Stale (Verify before dispatch)";
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

// ==================== FPO & COLLECTION CENTERS ====================
export interface FPOCollectionCenter {
  id: string;
  fpoId: string;
  name: string;
  village?: string;
  taluka: string;
  district: string;
  state: string;
  pincode?: string;
  lat: number;
  lng: number;
  capacityKg: number;
  contactPerson?: string;
  phone?: string;
  status: "Active" | "Inactive";
}

export interface FPOOrganization {
  id: string;
  name: string;
  regNumber?: string;
  contactPerson: string;
  phone: string;
  email?: string;
  village?: string;
  taluka: string;
  district: string;
  state: string;
  pincode?: string;
  lat: number;
  lng: number;
  collectionCenters: FPOCollectionCenter[];
  supportedCrops: string[];
  serviceFeePaisePerQtl: number;
  poolMinKg: number;
  poolMaxKg: number;
  defaultPoolClosingDays: number;
  managerIds: string[];
  memberFarmerIds: string[];
  status: "Active" | "Pending" | "Inactive";
  notes?: string;
  createdAt: string;
}

// ==================== MANDI MASTER REGISTRY ====================
export interface MandiMaster {
  id: string;
  mandi: string;
  marketCode?: string;
  village?: string;
  taluka?: string;
  district: string;
  state: string;
  pincode?: string;
  lat: number;
  lng: number;
  supportedCrops: string[];
  varieties?: string[];
  contactPerson?: string;
  phone?: string;
  dataSource: "Agmarknet (Govt of India)" | "MSAMB" | "e-NAM" | "APMC Direct" | "Manual Admin";
  status: "Active" | "Inactive" | "Archived";
  notes?: string;
  lastSyncAt: string;
}

// ==================== CROP CATALOG & GRADE RULES ====================
export interface CropGradeRule {
  grade: "Grade A" | "Grade B" | "Grade C";
  minSizeMm?: number;
  maxDefectPct?: number;
  minColorScorePct?: number;
  priceAdjustmentPct: number; // e.g. +10% for A, -15% for C
}

export interface CropCatalogItem {
  id: string;
  name: string;
  marathiName: string;
  hindiName: string;
  category: "Vegetable" | "Fruit" | "Grain" | "Pulse" | "Cash Crop" | "Spice";
  icon?: string;
  varieties: string[];
  perishability: "Very High (1-3 days)" | "High (4-7 days)" | "Medium (1-3 weeks)" | "Low (Months)";
  storageRecommendation: string;
  defaultBatchSizeKg: number;
  gradeRules: CropGradeRule[];
  status: "Active" | "Inactive";
}

// ==================== TRANSPORTER & FLEET ====================
export interface FleetVehicle {
  id: string;
  regNumber: string;
  vehicleType: "Pickup Tempo" | "Mini Truck (14ft)" | "Eicher 17ft" | "Reefer Truck";
  capacityKg: number;
  isRefrigerated: boolean;
  driverName?: string;
  driverPhone?: string;
  status: "Available" | "In Transit" | "Maintenance" | "Inactive";
}

export interface Transporter {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email?: string;
  baseLocation: string;
  baseLat: number;
  baseLng: number;
  serviceDistricts: string[];
  costPerKmInr: number;
  vehicles: FleetVehicle[];
  status: "Active" | "Inactive";
}

// ==================== PLATFORM SETTINGS ====================
export interface PlatformSettings {
  defaultSearchRadiusKm: number;
  minRadiusKm: number;
  maxRadiusKm: number;
  radiusExpansionSteps: number[]; // [50, 100, 200, 300, 500]
  maxFarmerSelectableRadiusKm: number;
  allowFarmerCustomRadius: boolean;
  searchOnlyActiveMandis: boolean;
  searchOnlyWithLatestPrice: boolean;
  priceFreshnessThresholdHours: number;
  stalePriceThresholdHours: number;
  showMarketsWithoutLatestPrice: boolean;
  defaultCrop: string;
  defaultTransportCostPerKm: number;
  defaultHandlingCostPaise: number;
  defaultPackagingCostPaise: number;
  defaultCommissionPct: number;
  defaultExpectedSpoilagePct: number;
  voiceAssistantModel: string;
  voiceAssistantSpeed: number;
  enableLiveAgmarknetFeed: boolean;
}

// ==================== ROLE PERMISSIONS ====================
export interface RolePermissions {
  role: Role;
  label: string;
  canViewMarketPrices: boolean;
  canUseVoiceAssistant: boolean;
  canGradeCrop: boolean;
  canCreatePools: boolean;
  canManageLogistics: boolean;
  canAuthorizeEscrow: boolean;
  canViewPrivateFarmerData: boolean;
  canManageUsers: boolean;
  canManageMandis: boolean;
  canManageSettings: boolean;
}
