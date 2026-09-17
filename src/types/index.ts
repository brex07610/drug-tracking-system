/**
 * MoHCC Zimbabwe Drug Tracking System (DTS-Zim)
 * Core Types and Interfaces
 */

export enum UserRole {
  FACILITY_NURSE = 'FACILITY_NURSE',
  DISTRICT_PHARMACIST = 'DISTRICT_PHARMACIST',
  PROVINCIAL_MANAGER = 'PROVINCIAL_MANAGER',
  NATPHARM_LOGISTICS = 'NATPHARM_LOGISTICS',
  AUDITOR = 'AUDITOR'
}

export enum FacilityType {
  CENTRAL_HOSPITAL = 'Central Hospital (Quaternary)',
  PROVINCIAL_HOSPITAL = 'Provincial Hospital (Secondary)',
  DISTRICT_HOSPITAL = 'District Hospital (Primary Referral)',
  MISSION_HOSPITAL = 'Designated Mission Hospital',
  POLYCLINIC = 'Urban Polyclinic',
  RURAL_HEALTH_CENTRE = 'Rural Health Centre (RHC)',
  CENTRAL_WAREHOUSE = 'Central Medical Store (NatPharm)'
}

export enum StockStatus {
  HEALTHY = 'HEALTHY',         // 2.0 - 5.0 MOS
  LOW_STOCK = 'LOW_STOCK',     // 0.5 - 2.0 MOS
  STOCK_OUT_RISK = 'STOCK_OUT_RISK', // < 0.5 MOS
  STOCKED_OUT = 'STOCKED_OUT', // 0 On Hand
  OVERSTOCK = 'OVERSTOCK'      // > 5.0 MOS
}

export enum ColdChainRequirement {
  NONE = 'Ambient (15-25°C)',
  REFRIGERATED = 'Cold Chain (2-8°C)',
  FROZEN = 'Ultra-Cold / Frozen (-20°C)'
}

export enum TransactionType {
  RECEIPT_FROM_DISTRICT = 'RECEIPT_FROM_DISTRICT',
  RECEIPT_FROM_NATPHARM = 'RECEIPT_FROM_NATPHARM',
  RECEIPT_REDISTRIBUTION = 'RECEIPT_REDISTRIBUTION',
  DISPENSE_PATIENT = 'DISPENSE_PATIENT',
  ISSUE_TO_WARD = 'ISSUE_TO_WARD',
  DISPATCH_REDISTRIBUTION = 'DISPATCH_REDISTRIBUTION',
  ADJUSTMENT_STOCKTAKE = 'ADJUSTMENT_STOCKTAKE',
  WRITE_OFF_EXPIRED = 'WRITE_OFF_EXPIRED',
  WRITE_OFF_DAMAGED = 'WRITE_OFF_DAMAGED'
}

export enum Language {
  ENGLISH = 'en',
  SHONA = 'sn',
  NDEBELE = 'nd'
}

export interface Facility {
  id: string;
  name: string;
  code: string;
  province: string;
  district: string;
  type: FacilityType;
  phone: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  contactPerson: string;
  isOnline: boolean;
  lastSyncTimestamp: string;
}

export interface DrugCommodity {
  id: string;
  code: string; // ZEML code (e.g. ZEML-ARV-01)
  name: string;
  category: 'ARV' | 'Antimalarial' | 'Antibiotic' | 'Maternal & Child' | 'Vaccine' | 'Chronic & Non-Communicable' | 'Essential Supply';
  unitOfMeasure: string; // 'Pack of 30 tabs', 'Vial 10ml', 'Box of 100 tabs', 'Ampoule 1ml'
  standardPackSize: number;
  coldChain: ColdChainRequirement;
  minMos: number; // Minimum Months of Stock (usually 2.0)
  maxMos: number; // Maximum Months of Stock (usually 5.0)
  unitCostUSD: number;
  dosageForm: string;
  description: string;
}

export interface DrugBatch {
  id: string;
  commodityId: string;
  facilityId: string;
  batchNumber: string;
  manufactureDate: string; // YYYY-MM-DD
  expiryDate: string;      // YYYY-MM-DD
  quantityOnHand: number;
  quantityReceived: number;
  supplierOrSource: string;
  receivedDate: string;
  barcodeQrCode: string;
  storageBin: string;
  temperatureBreached?: boolean;
}

export interface StockMovementEvent {
  id: string;
  timestamp: string;
  facilityId: string;
  commodityId: string;
  batchId: string;
  batchNumber: string;
  transactionType: TransactionType;
  quantityChange: number; // positive for additions, negative for deductions
  balanceAfter: number;
  performedByUserId: string;
  performedByUserName: string;
  userRole: UserRole;
  notes?: string;
  departmentOrWard?: string;
  deliveryNoteReference?: string;
  fefoOverridden?: boolean;
  fefoOverrideReason?: string;
  sha256Signature: string; // cryptographic audit integrity hash
  syncStatus: 'synced' | 'pending' | 'conflict';
}

export interface RedistributionRequest {
  id: string;
  requestingFacilityId: string;
  requestingFacilityName: string;
  fulfillingFacilityId?: string;
  fulfillingFacilityName?: string;
  commodityId: string;
  commodityName: string;
  quantityRequested: number;
  quantityApproved?: number;
  status: 'PENDING_DISTRICT_REVIEW' | 'APPROVED' | 'DISPATCHED' | 'RECEIVED' | 'REJECTED';
  priority: 'ROUTINE' | 'URGENT' | 'CRITICAL_STOCK_OUT';
  requestedAt: string;
  approvedAt?: string;
  dispatchedAt?: string;
  trackingWaybillNumber?: string;
  notes?: string;
}

export interface StockAlert {
  id: string;
  facilityId: string;
  facilityName: string;
  commodityId: string;
  commodityName: string;
  type: 'STOCK_OUT_IMMINENT' | 'EXPIRED_BATCH' | 'NEAR_EXPIRY_30D' | 'NEAR_EXPIRY_60D' | 'OVERSTOCK' | 'COLD_CHAIN_ALERT';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'INFO';
  message: string;
  detail: string;
  timestamp: string;
  acknowledged: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  facilityId: string;
  facilityName: string;
  province: string;
  district: string;
  phone: string;
  employeeNumber: string;
}

export interface StorageKeyMetric {
  key: string;
  name: string;
  bytes: number;
  formattedSize: string;
  itemCount: number;
  percentOfDtsStorage: number;
  status: 'HEALTHY' | 'WARNING' | 'EMPTY';
}

export interface LocalStorageHealthReport {
  totalDtsBytes: number;
  totalLocalStorageBytes: number;
  estimatedQuotaBytes: number;
  percentageUsed: number;
  keysTracked: number;
  breakdown: StorageKeyMetric[];
}

export interface IndexedDBHealthReport {
  supported: boolean;
  status: 'ACTIVE' | 'STANDBY' | 'DEGRADED' | 'UNSUPPORTED';
  databaseName: string;
  version: number;
  objectStores: string[];
  probeLatencyMs: number;
  persistedQuotaGranted: boolean;
  estimatedQuotaBytes?: number;
  estimatedUsageBytes?: number;
  lastCheckedAt: string;
}

export interface SystemHealthReport {
  timestamp: string;
  lastSuccessfulSync: string;
  syncGateway: string;
  syncStatus: 'SYNCED' | 'PENDING' | 'OFFLINE_STANDBY';
  offlineQueueDepth: number;
  localStorage: LocalStorageHealthReport;
  indexedDB: IndexedDBHealthReport;
  ledgerIntegrity: {
    totalEvents: number;
    validSignaturesCount: number;
    tamperDetected: boolean;
  };
  networkStatus: {
    isOnline: boolean;
    effectiveType: string;
    rttMs: number;
  };
}

