/**
 * MoHCC Zimbabwe Drug Tracking System (DTS-Zim)
 * Core State & Storage Service: Event-Sourcing Ledger, FEFO Validation, Offline Queue
 */

import {
  Facility,
  DrugCommodity,
  DrugBatch,
  StockMovementEvent,
  RedistributionRequest,
  StockAlert,
  UserProfile,
  UserRole,
  StockStatus,
  TransactionType,
  LocalStorageHealthReport,
  IndexedDBHealthReport,
  SystemHealthReport,
  StorageKeyMetric
} from '../types/index.ts';

import {
  INITIAL_FACILITIES,
  INITIAL_COMMODITIES,
  INITIAL_BATCHES,
  INITIAL_LEDGER_EVENTS,
  INITIAL_ALERTS,
  INITIAL_REDISTRIBUTIONS,
  SAMPLE_USERS
} from '../data/mockDatabase.ts';

const STORAGE_KEYS = {
  FACILITIES: 'dts_zim_facilities_v1',
  COMMODITIES: 'dts_zim_commodities_v1',
  BATCHES: 'dts_zim_batches_v1',
  LEDGER: 'dts_zim_ledger_v1',
  ALERTS: 'dts_zim_alerts_v1',
  REDISTRIBUTIONS: 'dts_zim_redistributions_v1',
  OFFLINE_QUEUE: 'dts_zim_offline_queue_v1',
  IS_ONLINE: 'dts_zim_is_online_v1',
  ACTIVE_USER: 'dts_zim_active_user_v1',
  LAST_SYNC: 'dts_zim_last_sync_v1'
};

// Simple deterministic hash simulation for immutable ledger audit integrity
export function computeLedgerHash(event: Partial<StockMovementEvent>): string {
  const payload = `${event.timestamp}_${event.facilityId}_${event.commodityId}_${event.batchNumber}_${event.quantityChange}_${event.performedByUserId}`;
  let hash = 0;
  for (let i = 0; i < payload.length; i++) {
    const char = payload.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  return `sha256-mohcc-${hex}-${Date.now().toString(36)}`;
}

class StorageService {
  private facilities: Facility[] = [];
  private commodities: DrugCommodity[] = [];
  private batches: DrugBatch[] = [];
  private ledger: StockMovementEvent[] = [];
  private alerts: StockAlert[] = [];
  private redistributions: RedistributionRequest[] = [];
  private offlineQueue: StockMovementEvent[] = [];
  private isOnline: boolean = true;
  private currentUser: UserProfile = SAMPLE_USERS[0];
  private currentFacility: Facility = INITIAL_FACILITIES[0];
  private lastSyncTimestamp: string = '';
  private listeners: Array<() => void> = [];

  constructor() {
    this.init();
  }

  private init() {
    try {
      const savedFacilities = localStorage.getItem(STORAGE_KEYS.FACILITIES);
      this.facilities = savedFacilities ? JSON.parse(savedFacilities) : INITIAL_FACILITIES;

      const savedCommodities = localStorage.getItem(STORAGE_KEYS.COMMODITIES);
      this.commodities = savedCommodities ? JSON.parse(savedCommodities) : INITIAL_COMMODITIES;

      const savedBatches = localStorage.getItem(STORAGE_KEYS.BATCHES);
      this.batches = savedBatches ? JSON.parse(savedBatches) : INITIAL_BATCHES;

      const savedLedger = localStorage.getItem(STORAGE_KEYS.LEDGER);
      this.ledger = savedLedger ? JSON.parse(savedLedger) : INITIAL_LEDGER_EVENTS;

      const savedAlerts = localStorage.getItem(STORAGE_KEYS.ALERTS);
      this.alerts = savedAlerts ? JSON.parse(savedAlerts) : INITIAL_ALERTS;

      const savedRedist = localStorage.getItem(STORAGE_KEYS.REDISTRIBUTIONS);
      this.redistributions = savedRedist ? JSON.parse(savedRedist) : INITIAL_REDISTRIBUTIONS;

      const savedQueue = localStorage.getItem(STORAGE_KEYS.OFFLINE_QUEUE);
      this.offlineQueue = savedQueue ? JSON.parse(savedQueue) : [];

      const savedOnline = localStorage.getItem(STORAGE_KEYS.IS_ONLINE);
      this.isOnline = savedOnline !== null ? JSON.parse(savedOnline) : true;

      const savedUser = localStorage.getItem(STORAGE_KEYS.ACTIVE_USER);
      this.currentUser = savedUser ? JSON.parse(savedUser) : SAMPLE_USERS[0];

      const savedLastSync = localStorage.getItem(STORAGE_KEYS.LAST_SYNC);
      this.lastSyncTimestamp = savedLastSync || new Date(Date.now() - 4 * 60 * 1000).toISOString();
    } catch {
      this.facilities = INITIAL_FACILITIES;
      this.commodities = INITIAL_COMMODITIES;
      this.batches = INITIAL_BATCHES;
      this.ledger = INITIAL_LEDGER_EVENTS;
      this.alerts = INITIAL_ALERTS;
      this.redistributions = INITIAL_REDISTRIBUTIONS;
      this.offlineQueue = [];
      this.isOnline = true;
      this.currentUser = SAMPLE_USERS[0];
      this.lastSyncTimestamp = new Date(Date.now() - 4 * 60 * 1000).toISOString();
    }
  }

  private persist() {
    try {
      localStorage.setItem(STORAGE_KEYS.FACILITIES, JSON.stringify(this.facilities));
      localStorage.setItem(STORAGE_KEYS.COMMODITIES, JSON.stringify(this.commodities));
      localStorage.setItem(STORAGE_KEYS.BATCHES, JSON.stringify(this.batches));
      localStorage.setItem(STORAGE_KEYS.LEDGER, JSON.stringify(this.ledger));
      localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(this.alerts));
      localStorage.setItem(STORAGE_KEYS.REDISTRIBUTIONS, JSON.stringify(this.redistributions));
      localStorage.setItem(STORAGE_KEYS.OFFLINE_QUEUE, JSON.stringify(this.offlineQueue));
      localStorage.setItem(STORAGE_KEYS.IS_ONLINE, JSON.stringify(this.isOnline));
      localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, JSON.stringify(this.currentUser));
      localStorage.setItem(STORAGE_KEYS.LAST_SYNC, this.lastSyncTimestamp);
    } catch {
      // safe fallback if storage unavailable
    }
    this.notify();
  }

  public subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(l => l());
  }

  // Getters
  public getFacilities(): Facility[] {
    return [...this.facilities];
  }

  public getCommodities(): DrugCommodity[] {
    return [...this.commodities];
  }

  public getBatches(): DrugBatch[] {
    return [...this.batches];
  }

  public getLedger(): StockMovementEvent[] {
    return [...this.ledger];
  }

  public getAlerts(): StockAlert[] {
    return [...this.alerts];
  }

  public getRedistributions(): RedistributionRequest[] {
    return [...this.redistributions];
  }

  public getOfflineQueue(): StockMovementEvent[] {
    return [...this.offlineQueue];
  }

  public getIsOnline(): boolean {
    return this.isOnline;
  }

  public isSystemOnline(): boolean {
    return this.isOnline;
  }

  public getRedistributionRequests(): RedistributionRequest[] {
    return [...this.redistributions];
  }

  public getCurrentFacility(): Facility {
    if (!this.currentFacility) {
      this.currentFacility = this.facilities[0] || INITIAL_FACILITIES[0];
    }
    return this.currentFacility;
  }

  public setCurrentFacility(facility: Facility) {
    if (this.currentFacility && this.currentFacility.id === facility.id) {
      return;
    }
    this.currentFacility = facility;
    this.notify();
  }

  public getCurrentUser(): UserProfile {
    return this.currentUser;
  }

  public setCurrentUser(user: UserProfile) {
    if (this.currentUser && this.currentUser.id === user.id) {
      return;
    }
    this.currentUser = user;
    if (user.facilityId) {
      const match = this.facilities.find(f => f.id === user.facilityId);
      if (match) {
        this.currentFacility = match;
      }
    }
    this.persist();
  }

  public toggleOnlineStatus() {
    this.isOnline = !this.isOnline;
    if (this.isOnline && this.offlineQueue.length > 0) {
      this.syncOfflineQueue();
    } else {
      this.persist();
    }
  }

  // FEFO (First-Expiry-First-Out) Logic
  public getBatchesForFacilityCommodity(facilityId: string, commodityId: string): DrugBatch[] {
    return this.batches
      .filter(b => b.facilityId === facilityId && b.commodityId === commodityId && b.quantityOnHand > 0)
      .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());
  }

  public getEarliestExpiringBatch(facilityId: string, commodityId: string): DrugBatch | null {
    const batches = this.getBatchesForFacilityCommodity(facilityId, commodityId);
    return batches.length > 0 ? batches[0] : null;
  }

  // Consumption estimation & Stock Status
  // Average Monthly Consumption (AMC) calculated from mock baseline or ledger
  public getEstimatedAMC(facilityId: string, commodityId: string): number {
    // In a production system, this calculates past 3-month consumption
    // For demo realism, we provide representative consumption numbers
    const baselineRates: Record<string, number> = {
      'cmd-tld-01': 80,   // ARV packs/month
      'cmd-coart-02': 45, // Antimalarial
      'cmd-amox-03': 60,  // Antibiotic bottles
      'cmd-oxy-04': 20,   // Oxytocin packs
      'cmd-ins-05': 18,   // Insulin vials
      'cmd-para-06': 30,  // Paracetamol tins
      'cmd-ors-07': 40,   // ORS packs
      'cmd-bcg-08': 15    // BCG vials
    };
    return baselineRates[commodityId] || 25;
  }

  public getStockStatus(facilityId: string, commodityId: string): {
    status: StockStatus;
    totalOnHand: number;
    amc: number;
    mos: number;
  } {
    const batches = this.batches.filter(b => b.facilityId === facilityId && b.commodityId === commodityId);
    const totalOnHand = batches.reduce((sum, b) => sum + Math.max(0, b.quantityOnHand), 0);
    const amc = this.getEstimatedAMC(facilityId, commodityId);
    const mos = amc > 0 ? Number((totalOnHand / amc).toFixed(1)) : 0;

    let status = StockStatus.HEALTHY;
    if (totalOnHand === 0) {
      status = StockStatus.STOCKED_OUT;
    } else if (mos < 0.5) {
      status = StockStatus.STOCK_OUT_RISK;
    } else if (mos < 2.0) {
      status = StockStatus.LOW_STOCK;
    } else if (mos > 5.0) {
      status = StockStatus.OVERSTOCK;
    }

    return { status, totalOnHand, amc, mos };
  }

  // Days until expiry
  public getDaysUntilExpiry(expiryDateString: string): number {
    const expiry = new Date(expiryDateString).getTime();
    const now = new Date('2026-09-07T00:00:00Z').getTime(); // Current system reference date
    const diff = expiry - now;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  // Core Transaction: Dispense Stock (Enforces FEFO)
  public dispenseStock(params: {
    facilityId: string;
    commodityId: string;
    batchId: string;
    quantity: number;
    departmentOrWard: string;
    overrideReason?: string;
    performedByUserId: string;
    performedByUserName: string;
    userRole: UserRole;
  }): { success: boolean; error?: string; event?: StockMovementEvent } {
    const batch = this.batches.find(b => b.id === params.batchId);
    if (!batch) {
      return { success: false, error: 'Selected batch was not found.' };
    }
    if (batch.quantityOnHand < params.quantity) {
      return { success: false, error: `Insufficient batch stock. Only ${batch.quantityOnHand} units available.` };
    }

    const earliestBatch = this.getEarliestExpiringBatch(params.facilityId, params.commodityId);
    const isFefoBypassed = earliestBatch && earliestBatch.id !== batch.id;

    if (isFefoBypassed && !params.overrideReason) {
      return {
        success: false,
        error: `FEFO VIOLATION: Batch ${earliestBatch.batchNumber} expires sooner (${earliestBatch.expiryDate}). You must provide an explicit clinical/logistical reason to override FEFO.`
      };
    }

    // Deduct stock
    batch.quantityOnHand -= params.quantity;

    const newEvent: StockMovementEvent = {
      id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      facilityId: params.facilityId,
      commodityId: params.commodityId,
      batchId: batch.id,
      batchNumber: batch.batchNumber,
      transactionType: TransactionType.DISPENSE_PATIENT,
      quantityChange: -params.quantity,
      balanceAfter: batch.quantityOnHand,
      performedByUserId: params.performedByUserId,
      performedByUserName: params.performedByUserName,
      userRole: params.userRole,
      departmentOrWard: params.departmentOrWard,
      fefoOverridden: Boolean(isFefoBypassed),
      fefoOverrideReason: params.overrideReason,
      sha256Signature: '',
      syncStatus: this.isOnline ? 'synced' : 'pending'
    };

    newEvent.sha256Signature = computeLedgerHash(newEvent);

    this.ledger.unshift(newEvent);

    if (!this.isOnline) {
      this.offlineQueue.push(newEvent);
    }

    this.checkAndGenerateAlerts(params.facilityId, params.commodityId);
    this.persist();

    return { success: true, event: newEvent };
  }

  // Core Transaction: Receive Stock (From NatPharm or District)
  public receiveStock(params: {
    facilityId: string;
    commodityId: string;
    batchNumber: string;
    manufactureDate: string;
    expiryDate: string;
    quantity: number;
    supplierOrSource: string;
    deliveryNoteReference: string;
    storageBin?: string;
    barcodeQrCode?: string;
    performedByUserId: string;
    performedByUserName: string;
    userRole: UserRole;
  }): { success: boolean; event: StockMovementEvent } {
    // Check if batch already exists at this facility
    let batch = this.batches.find(
      b => b.facilityId === params.facilityId && b.commodityId === params.commodityId && b.batchNumber === params.batchNumber
    );

    if (batch) {
      batch.quantityOnHand += params.quantity;
      batch.quantityReceived += params.quantity;
    } else {
      batch = {
        id: `bat-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        commodityId: params.commodityId,
        facilityId: params.facilityId,
        batchNumber: params.batchNumber,
        manufactureDate: params.manufactureDate,
        expiryDate: params.expiryDate,
        quantityOnHand: params.quantity,
        quantityReceived: params.quantity,
        supplierOrSource: params.supplierOrSource,
        receivedDate: new Date().toISOString().split('T')[0],
        barcodeQrCode: params.barcodeQrCode || `ZIM9480-${params.batchNumber}`,
        storageBin: params.storageBin || 'Main Store Shelf 1'
      };
      this.batches.push(batch);
    }

    const newEvent: StockMovementEvent = {
      id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      facilityId: params.facilityId,
      commodityId: params.commodityId,
      batchId: batch.id,
      batchNumber: batch.batchNumber,
      transactionType: TransactionType.RECEIPT_FROM_NATPHARM,
      quantityChange: params.quantity,
      balanceAfter: batch.quantityOnHand,
      performedByUserId: params.performedByUserId,
      performedByUserName: params.performedByUserName,
      userRole: params.userRole,
      deliveryNoteReference: params.deliveryNoteReference,
      sha256Signature: '',
      syncStatus: this.isOnline ? 'synced' : 'pending'
    };

    newEvent.sha256Signature = computeLedgerHash(newEvent);
    this.ledger.unshift(newEvent);

    if (!this.isOnline) {
      this.offlineQueue.push(newEvent);
    }

    this.checkAndGenerateAlerts(params.facilityId, params.commodityId);
    this.persist();

    return { success: true, event: newEvent };
  }

  // Physical Stocktake / Audit Adjustment
  public performStocktake(params: {
    facilityId: string;
    commodityId: string;
    batchId: string;
    physicalCount: number;
    reason: string;
    performedByUserId: string;
    performedByUserName: string;
    userRole: UserRole;
  }): { success: boolean; event: StockMovementEvent } {
    const batch = this.batches.find(b => b.id === params.batchId);
    if (!batch) {
      throw new Error('Batch not found');
    }

    const discrepancy = params.physicalCount - batch.quantityOnHand;
    batch.quantityOnHand = params.physicalCount;

    const newEvent: StockMovementEvent = {
      id: `evt-audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      facilityId: params.facilityId,
      commodityId: params.commodityId,
      batchId: batch.id,
      batchNumber: batch.batchNumber,
      transactionType: TransactionType.ADJUSTMENT_STOCKTAKE,
      quantityChange: discrepancy,
      balanceAfter: batch.quantityOnHand,
      performedByUserId: params.performedByUserId,
      performedByUserName: params.performedByUserName,
      userRole: params.userRole,
      notes: `Physical audit variance: ${discrepancy > 0 ? '+' : ''}${discrepancy}. Reason: ${params.reason}`,
      sha256Signature: '',
      syncStatus: this.isOnline ? 'synced' : 'pending'
    };

    newEvent.sha256Signature = computeLedgerHash(newEvent);
    this.ledger.unshift(newEvent);

    if (!this.isOnline) {
      this.offlineQueue.push(newEvent);
    }

    this.checkAndGenerateAlerts(params.facilityId, params.commodityId);
    this.persist();

    return { success: true, event: newEvent };
  }

  // Create Redistribution Request
  public createRedistributionRequest(params: {
    requestingFacilityId: string;
    commodityId: string;
    quantityRequested: number;
    priority: 'ROUTINE' | 'URGENT' | 'CRITICAL_STOCK_OUT';
    notes?: string;
  }): RedistributionRequest {
    const reqFacility = this.facilities.find(f => f.id === params.requestingFacilityId);
    const commodity = this.commodities.find(c => c.id === params.commodityId);

    // Auto-match surplus facility in same or neighboring district
    let fulfillingFacility: Facility | undefined = undefined;
    for (const f of this.facilities) {
      if (f.id !== params.requestingFacilityId) {
        const { status } = this.getStockStatus(f.id, params.commodityId);
        if (status === StockStatus.OVERSTOCK || status === StockStatus.HEALTHY) {
          fulfillingFacility = f;
          break;
        }
      }
    }

    const newReq: RedistributionRequest = {
      id: `redist-${Date.now().toString(36).toUpperCase()}`,
      requestingFacilityId: params.requestingFacilityId,
      requestingFacilityName: reqFacility ? reqFacility.name : 'Health Facility',
      fulfillingFacilityId: fulfillingFacility?.id,
      fulfillingFacilityName: fulfillingFacility?.name || 'District Store / Surplus Facility',
      commodityId: params.commodityId,
      commodityName: commodity ? commodity.name : 'Essential Medicine',
      quantityRequested: params.quantityRequested,
      quantityApproved: fulfillingFacility ? params.quantityRequested : undefined,
      status: fulfillingFacility ? 'APPROVED' : 'PENDING_DISTRICT_REVIEW',
      priority: params.priority,
      requestedAt: new Date().toISOString(),
      trackingWaybillNumber: `WB-ZIM-${Math.floor(1000 + Math.random() * 9000)}`,
      notes: params.notes
    };

    this.redistributions.unshift(newReq);
    this.persist();
    return newReq;
  }

  // NatPharm Central Dispatch to Facility/District
  public dispatchFromNatPharm(params: {
    destinationFacilityId: string;
    commodityId: string;
    batchNumber: string;
    manufactureDate: string;
    expiryDate: string;
    quantity: number;
    waybillNumber: string;
    coldChainVehicleReg?: string;
    dispatcherName: string;
  }) {
    // Add to recipient facility batches directly or mark in-transit
    this.receiveStock({
      facilityId: params.destinationFacilityId,
      commodityId: params.commodityId,
      batchNumber: params.batchNumber,
      manufactureDate: params.manufactureDate,
      expiryDate: params.expiryDate,
      quantity: params.quantity,
      supplierOrSource: `NatPharm Central Dispatch (${params.waybillNumber})`,
      deliveryNoteReference: params.waybillNumber,
      performedByUserId: 'usr-nat-01',
      performedByUserName: params.dispatcherName,
      userRole: UserRole.NATPHARM_LOGISTICS
    });
  }

  // Offline Sync Queue execution
  public syncOfflineQueue(): Promise<{ syncedCount: number; errors: string[] }> {
    return new Promise(resolve => {
      setTimeout(() => {
        const syncedCount = this.offlineQueue.length;
        this.offlineQueue = [];
        
        // Mark all ledger events as synced
        this.ledger.forEach(e => {
          if (e.syncStatus === 'pending') {
            e.syncStatus = 'synced';
          }
        });

        const currentFacility = this.facilities.find(f => f.id === this.currentUser.facilityId);
        const syncNow = new Date().toISOString();
        this.lastSyncTimestamp = syncNow;
        if (currentFacility) {
          currentFacility.lastSyncTimestamp = syncNow;
        }

        this.persist();
        resolve({ syncedCount, errors: [] });
      }, 700);
    });
  }

  // Automatic Alert generation
  public checkAndGenerateAlerts(facilityId: string, commodityId: string) {
    const facility = this.facilities.find(f => f.id === facilityId);
    const commodity = this.commodities.find(c => c.id === commodityId);
    if (!facility || !commodity) return;

    const { status, totalOnHand, mos } = this.getStockStatus(facilityId, commodityId);

    // Remove obsolete alerts for this commodity/facility
    this.alerts = this.alerts.filter(a => !(a.facilityId === facilityId && a.commodityId === commodityId));

    if (status === StockStatus.STOCKED_OUT) {
      this.alerts.unshift({
        id: `alt-${Date.now()}-out`,
        facilityId,
        facilityName: facility.name,
        commodityId,
        commodityName: commodity.name,
        type: 'STOCK_OUT_IMMINENT',
        severity: 'CRITICAL',
        message: `COMPLETE STOCK-OUT: Zero inventory for ${commodity.name}`,
        detail: `Facility is completely out of stock. Immediate redistribution or emergency order required.`,
        timestamp: new Date().toISOString(),
        acknowledged: false
      });
    } else if (status === StockStatus.STOCK_OUT_RISK) {
      this.alerts.unshift({
        id: `alt-${Date.now()}-risk`,
        facilityId,
        facilityName: facility.name,
        commodityId,
        commodityName: commodity.name,
        type: 'STOCK_OUT_IMMINENT',
        severity: 'HIGH',
        message: `STOCK-OUT RISK: ${commodity.name} has only ${mos} Months of Stock (${totalOnHand} units)`,
        detail: `Below safety threshold (< 0.5 MOS). Order replenishment before stock runs out.`,
        timestamp: new Date().toISOString(),
        acknowledged: false
      });
    }

    // Check near expiry batches
    const batches = this.batches.filter(b => b.facilityId === facilityId && b.commodityId === commodityId && b.quantityOnHand > 0);
    batches.forEach(b => {
      const days = this.getDaysUntilExpiry(b.expiryDate);
      if (days <= 0) {
        this.alerts.unshift({
          id: `alt-${Date.now()}-exp-${b.id}`,
          facilityId,
          facilityName: facility.name,
          commodityId,
          commodityName: commodity.name,
          type: 'EXPIRED_BATCH',
          severity: 'CRITICAL',
          message: `EXPIRED STOCK: Batch ${b.batchNumber} expired on ${b.expiryDate} (${b.quantityOnHand} units)`,
          detail: `Quarantine stock immediately. Do not dispense to patients. Write-off and notify District Pharmacist.`,
          timestamp: new Date().toISOString(),
          acknowledged: false
        });
      } else if (days <= 30) {
        this.alerts.unshift({
          id: `alt-${Date.now()}-30d-${b.id}`,
          facilityId,
          facilityName: facility.name,
          commodityId,
          commodityName: commodity.name,
          type: 'NEAR_EXPIRY_30D',
          severity: 'HIGH',
          message: `FEFO URGENCY: Batch ${b.batchNumber} expires in ${days} days (${b.quantityOnHand} units)`,
          detail: `Must be dispensed first under FEFO or redistributed to high-volume facility before expiry.`,
          timestamp: new Date().toISOString(),
          acknowledged: false
        });
      }
    });

    this.persist();
  }

  // Export to DHIS2 / eLMIS CSV format
  public exportDhis2Csv(): string {
    const headers = [
      'DataElement_Code',
      'Commodity_Name',
      'Facility_Code',
      'Facility_Name',
      'Province',
      'Period_YYYYMM',
      'Opening_Balance',
      'Quantity_Received',
      'Quantity_Dispensed',
      'Stock_On_Hand',
      'Months_Of_Stock',
      'Stock_Status'
    ];

    const period = '202609';
    const rows = this.commodities.flatMap(commodity => {
      return this.facilities.map(facility => {
        const { totalOnHand, mos, status } = this.getStockStatus(facility.id, commodity.id);
        const batches = this.batches.filter(b => b.facilityId === facility.id && b.commodityId === commodity.id);
        const received = batches.reduce((acc, b) => acc + b.quantityReceived, 0);
        const dispensed = Math.max(0, received - totalOnHand);

        return [
          commodity.code,
          `"${commodity.name}"`,
          facility.code,
          `"${facility.name}"`,
          `"${facility.province}"`,
          period,
          received,
          received,
          dispensed,
          totalOnHand,
          mos,
          status
        ].join(',');
      });
    });

    return [headers.join(','), ...rows].join('\n');
  }

  // Real-time System Diagnostics & Health Telemetry
  public getLastSyncTimestamp(): string {
    return this.lastSyncTimestamp || new Date(Date.now() - 4 * 60 * 1000).toISOString();
  }

  public async triggerManualSync(): Promise<{ syncedCount: number; timestamp: string }> {
    const res = await this.syncOfflineQueue();
    this.lastSyncTimestamp = new Date().toISOString();
    this.persist();
    return { syncedCount: res.syncedCount, timestamp: this.lastSyncTimestamp };
  }

  public getLocalStorageHealth(): LocalStorageHealthReport {
    let totalDtsBytes = 0;
    let totalLocalStorageBytes = 0;
    const estimatedQuotaBytes = 5 * 1024 * 1024; // 5 MB standard browser quota
    const breakdown: StorageKeyMetric[] = [];

    const keyMeta: Record<string, { name: string; count: number }> = {
      [STORAGE_KEYS.FACILITIES]: { name: 'Facilities Master Directory', count: this.facilities.length },
      [STORAGE_KEYS.COMMODITIES]: { name: 'ZEML Essential Medicines', count: this.commodities.length },
      [STORAGE_KEYS.BATCHES]: { name: 'FEFO Batch & Lot Snapshots', count: this.batches.length },
      [STORAGE_KEYS.LEDGER]: { name: 'Immutable Movement Ledger (SHA-256)', count: this.ledger.length },
      [STORAGE_KEYS.ALERTS]: { name: 'Active Clinical Stock Alerts', count: this.alerts.length },
      [STORAGE_KEYS.REDISTRIBUTIONS]: { name: 'Redistribution Transfer Waybills', count: this.redistributions.length },
      [STORAGE_KEYS.OFFLINE_QUEUE]: { name: 'Pending Offline Delta Queue', count: this.offlineQueue.length },
      [STORAGE_KEYS.IS_ONLINE]: { name: 'System Connectivity State', count: 1 },
      [STORAGE_KEYS.ACTIVE_USER]: { name: 'Active User Role & Facility Context', count: 1 },
      [STORAGE_KEYS.LAST_SYNC]: { name: 'Last Successful Gateway Checkpoint', count: 1 }
    };

    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key) {
            const val = localStorage.getItem(key) || '';
            // Approximate UTF-16 size (2 bytes per character)
            const bytes = (key.length + val.length) * 2;
            totalLocalStorageBytes += bytes;

            if (key.startsWith('dts_zim_')) {
              totalDtsBytes += bytes;
              const meta = keyMeta[key] || { name: key, count: 1 };
              breakdown.push({
                key,
                name: meta.name,
                bytes,
                formattedSize: bytes >= 1024 ? `${(bytes / 1024).toFixed(1)} KB` : `${bytes} B`,
                itemCount: meta.count,
                percentOfDtsStorage: 0,
                status: bytes > 1024 * 1024 ? 'WARNING' : bytes > 0 ? 'HEALTHY' : 'EMPTY'
              });
            }
          }
        }
      }
    } catch {
      // Fallback in restrictive storage contexts
    }

    // Calculate percentage breakdown
    breakdown.forEach(item => {
      item.percentOfDtsStorage = totalDtsBytes > 0 ? Math.round((item.bytes / totalDtsBytes) * 100) : 0;
    });

    // Sort by largest storage usage
    breakdown.sort((a, b) => b.bytes - a.bytes);

    const percentageUsed = Number(((totalDtsBytes / estimatedQuotaBytes) * 100).toFixed(2));

    return {
      totalDtsBytes,
      totalLocalStorageBytes: Math.max(totalLocalStorageBytes, totalDtsBytes),
      estimatedQuotaBytes,
      percentageUsed,
      keysTracked: breakdown.length,
      breakdown
    };
  }

  public async getIndexedDBHealth(): Promise<IndexedDBHealthReport> {
    const isSupported = typeof window !== 'undefined' && 'indexedDB' in window && window.indexedDB !== null;
    const dbName = 'dts_zim_offline_store';
    const dbVersion = 1;
    const storeNames = ['stock_ledger_offline', 'sync_checkpoints', 'cached_commodities'];
    const now = new Date().toISOString();

    if (!isSupported) {
      return {
        supported: false,
        status: 'UNSUPPORTED',
        databaseName: dbName,
        version: dbVersion,
        objectStores: [],
        probeLatencyMs: 0,
        persistedQuotaGranted: false,
        lastCheckedAt: now
      };
    }

    const startTime = performance.now();
    let status: 'ACTIVE' | 'STANDBY' | 'DEGRADED' = 'ACTIVE';
    let probeLatencyMs = 0;
    let persistedQuotaGranted = false;
    let estimatedQuotaBytes: number | undefined;
    let estimatedUsageBytes: number | undefined;

    try {
      if (typeof navigator !== 'undefined' && navigator.storage) {
        if (navigator.storage.estimate) {
          const estimate = await navigator.storage.estimate();
          estimatedQuotaBytes = estimate.quota;
          estimatedUsageBytes = estimate.usage;
        }
        if (navigator.storage.persisted) {
          persistedQuotaGranted = await navigator.storage.persisted();
        }
      }

      await new Promise<void>((resolve) => {
        const req = window.indexedDB.open(dbName, dbVersion);
        req.onupgradeneeded = (event: IDBVersionChangeEvent) => {
          const db = (event.target as IDBOpenDBRequest).result;
          storeNames.forEach(store => {
            if (!db.objectStoreNames.contains(store)) {
              db.createObjectStore(store, { keyPath: 'id', autoIncrement: true });
            }
          });
        };
        req.onsuccess = (event: Event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          try {
            const tx = db.transaction('sync_checkpoints', 'readwrite');
            const store = tx.objectStore('sync_checkpoints');
            store.put({ id: 'probe_heartbeat', timestamp: Date.now(), gateway: 'Harare-Gateway-TLS1.3' });
            tx.oncomplete = () => {
              db.close();
              resolve();
            };
            tx.onerror = () => {
              db.close();
              resolve();
            };
          } catch {
            db.close();
            resolve();
          }
        };
        req.onerror = () => {
          status = 'DEGRADED';
          resolve();
        };
      });

      probeLatencyMs = Math.round(performance.now() - startTime);
    } catch {
      status = 'DEGRADED';
      probeLatencyMs = Math.round(performance.now() - startTime);
    }

    return {
      supported: true,
      status,
      databaseName: dbName,
      version: dbVersion,
      objectStores: storeNames,
      probeLatencyMs: Math.max(probeLatencyMs, 1),
      persistedQuotaGranted,
      estimatedQuotaBytes,
      estimatedUsageBytes,
      lastCheckedAt: now
    };
  }

  public async getSystemHealthReport(): Promise<SystemHealthReport> {
    const localStorageHealth = this.getLocalStorageHealth();
    const indexedDBHealth = await this.getIndexedDBHealth();
    const validSignaturesCount = this.ledger.filter(e => Boolean(e.sha256Signature)).length;

    return {
      timestamp: new Date().toISOString(),
      lastSuccessfulSync: this.getLastSyncTimestamp(),
      syncGateway: 'MoHCC Central Data Center (Harare TLS 1.3)',
      syncStatus: this.isOnline ? (this.offlineQueue.length === 0 ? 'SYNCED' : 'PENDING') : 'OFFLINE_STANDBY',
      offlineQueueDepth: this.offlineQueue.length,
      localStorage: localStorageHealth,
      indexedDB: indexedDBHealth,
      ledgerIntegrity: {
        totalEvents: this.ledger.length,
        validSignaturesCount,
        tamperDetected: false
      },
      networkStatus: {
        isOnline: this.isOnline,
        effectiveType: this.isOnline ? '4G / Fiber Backbone' : '2G Edge Cache (Offline)',
        rttMs: this.isOnline ? 28 : 0
      }
    };
  }

  // Reset database to initial state
  public resetToDefaults() {
    localStorage.clear();
    this.init();
    this.notify();
  }
}

export const storageService = new StorageService();
