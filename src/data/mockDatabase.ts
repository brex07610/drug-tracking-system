/**
 * MoHCC Zimbabwe Drug Tracking System (DTS-Zim)
 * Baseline Reference Data: Zimbabwe Health Facilities, ZEML Commodities, Initial Batches
 */

import {
  Facility,
  FacilityType,
  DrugCommodity,
  DrugBatch,
  StockMovementEvent,
  RedistributionRequest,
  StockAlert,
  UserProfile,
  UserRole,
  ColdChainRequirement,
  TransactionType
} from '../types/index.ts';

export const ZIMBABWE_PROVINCES = [
  'Harare Metropolitan',
  'Bulawayo Metropolitan',
  'Manicaland',
  'Mashonaland Central',
  'Mashonaland East',
  'Mashonaland West',
  'Masvingo',
  'Matabeleland North',
  'Matabeleland South',
  'Midlands'
];

export const INITIAL_FACILITIES: Facility[] = [
  {
    id: 'fac-har-01',
    name: 'Parirenyatwa Group of Hospitals',
    code: 'HRE-CEN-01',
    province: 'Harare Metropolitan',
    district: 'Harare Central',
    type: FacilityType.CENTRAL_HOSPITAL,
    phone: '+263 242 701555',
    coordinates: { lat: -17.8136, lng: 31.0450 },
    contactPerson: 'Sister T. Moyo (Chief Pharmacist)',
    isOnline: true,
    lastSyncTimestamp: '2026-09-07T11:00:00Z'
  },
  {
    id: 'fac-har-02',
    name: 'Mbare Polyclinic',
    code: 'HRE-POL-04',
    province: 'Harare Metropolitan',
    district: 'Harare South',
    type: FacilityType.POLYCLINIC,
    phone: '+263 242 662301',
    coordinates: { lat: -17.8580, lng: 31.0412 },
    contactPerson: 'Nurse R. Chidambwe (Sister-in-Charge)',
    isOnline: true,
    lastSyncTimestamp: '2026-09-07T11:05:00Z'
  },
  {
    id: 'fac-byo-01',
    name: 'Mpilo Central Hospital',
    code: 'BYO-CEN-01',
    province: 'Bulawayo Metropolitan',
    district: 'Bulawayo Central',
    type: FacilityType.CENTRAL_HOSPITAL,
    phone: '+263 292 212911',
    coordinates: { lat: -20.1345, lng: 28.5721 },
    contactPerson: 'Mr. S. Sibanda (District Pharmacist)',
    isOnline: true,
    lastSyncTimestamp: '2026-09-07T10:45:00Z'
  },
  {
    id: 'fac-man-01',
    name: 'Mutare Provincial Hospital',
    code: 'MAN-PRV-01',
    province: 'Manicaland',
    district: 'Mutare Urban',
    type: FacilityType.PROVINCIAL_HOSPITAL,
    phone: '+263 20 64412',
    coordinates: { lat: -18.9758, lng: 32.6713 },
    contactPerson: 'Dr. F. Mutasa (Provincial Medical Director)',
    isOnline: true,
    lastSyncTimestamp: '2026-09-07T10:30:00Z'
  },
  {
    id: 'fac-matn-01',
    name: 'Binga District Hospital',
    code: 'MTN-DST-02',
    province: 'Matabeleland North',
    district: 'Binga',
    type: FacilityType.DISTRICT_HOSPITAL,
    phone: '+263 281 2234',
    coordinates: { lat: -17.6203, lng: 27.3414 },
    contactPerson: 'Sister N. Ncube (Pharmacy Technician)',
    isOnline: false,
    lastSyncTimestamp: '2026-09-06T15:20:00Z'
  },
  {
    id: 'fac-matn-02',
    name: 'Tsholotsho Rural Health Centre',
    code: 'MTN-RHC-09',
    province: 'Matabeleland North',
    district: 'Tsholotsho',
    type: FacilityType.RURAL_HEALTH_CENTRE,
    phone: '+263 287 2341',
    coordinates: { lat: -19.7667, lng: 27.7500 },
    contactPerson: 'Nurse E. Dube (Primary Care Nurse)',
    isOnline: false,
    lastSyncTimestamp: '2026-09-06T09:12:00Z'
  },
  {
    id: 'fac-mid-01',
    name: 'Gokwe South District Hospital',
    code: 'MID-DST-05',
    province: 'Midlands',
    district: 'Gokwe South',
    type: FacilityType.DISTRICT_HOSPITAL,
    phone: '+263 59 2314',
    coordinates: { lat: -18.2181, lng: 28.9322 },
    contactPerson: 'Mr. P. Shumba (District Health Executive)',
    isOnline: true,
    lastSyncTimestamp: '2026-09-07T08:15:00Z'
  },
  {
    id: 'fac-mas-01',
    name: 'Gutu Mission Hospital',
    code: 'MAS-MSN-03',
    province: 'Masvingo',
    district: 'Gutu',
    type: FacilityType.MISSION_HOSPITAL,
    phone: '+263 31 2309',
    coordinates: { lat: -19.6500, lng: 31.1667 },
    contactPerson: 'Sister A. Zvobgo (Nurse in Charge)',
    isOnline: true,
    lastSyncTimestamp: '2026-09-07T07:45:00Z'
  },
  {
    id: 'fac-nat-01',
    name: 'NatPharm Central Medical Store',
    code: 'ZIM-NAT-01',
    province: 'Harare Metropolitan',
    district: 'Southerton National Hub',
    type: FacilityType.CENTRAL_WAREHOUSE,
    phone: '+263 242 621004',
    coordinates: { lat: -17.8631, lng: 31.0205 },
    contactPerson: 'Director K. Gwatidzo (NatPharm Dispatch Operations)',
    isOnline: true,
    lastSyncTimestamp: '2026-09-07T11:10:00Z'
  }
];

export const INITIAL_COMMODITIES: DrugCommodity[] = [
  {
    id: 'cmd-tld-01',
    code: 'ZEML-ARV-001',
    name: 'Tenofovir / Lamivudine / Dolutegravir (TLD)',
    category: 'ARV',
    unitOfMeasure: 'Pack of 30 tabs',
    standardPackSize: 30,
    coldChain: ColdChainRequirement.NONE,
    minMos: 2.0,
    maxMos: 5.0,
    unitCostUSD: 6.80,
    dosageForm: '300mg / 300mg / 50mg Tablet',
    description: 'First-line national Antiretroviral regimen for adults and adolescents living with HIV.'
  },
  {
    id: 'cmd-coart-02',
    code: 'ZEML-MAL-004',
    name: 'Artemether + Lumefantrine (Coartem 20/120)',
    category: 'Antimalarial',
    unitOfMeasure: 'Box of 24 tabs (6x4 blister)',
    standardPackSize: 24,
    coldChain: ColdChainRequirement.NONE,
    minMos: 2.0,
    maxMos: 4.5,
    unitCostUSD: 1.45,
    dosageForm: '20mg/120mg Dispersible Tablet',
    description: 'First-line ACT for uncomplicated Plasmodium falciparum malaria treatment.'
  },
  {
    id: 'cmd-amox-03',
    code: 'ZEML-ABX-012',
    name: 'Amoxicillin 250mg Dispersible Tablets',
    category: 'Antibiotic',
    unitOfMeasure: 'Bottle of 100 tabs',
    standardPackSize: 100,
    coldChain: ColdChainRequirement.NONE,
    minMos: 2.5,
    maxMos: 5.0,
    unitCostUSD: 2.20,
    dosageForm: '250mg Dispersible Tablet',
    description: 'Key child health antibiotic for pneumonia and pediatric bacterial infections.'
  },
  {
    id: 'cmd-oxy-04',
    code: 'ZEML-MAT-002',
    name: 'Oxytocin 10 IU/ml Ampoules',
    category: 'Maternal & Child',
    unitOfMeasure: 'Pack of 10 ampoules',
    standardPackSize: 10,
    coldChain: ColdChainRequirement.REFRIGERATED,
    minMos: 2.0,
    maxMos: 4.0,
    unitCostUSD: 3.50,
    dosageForm: '10 IU / 1ml Injectable Solution',
    description: 'Critical life-saving uterotonic to prevent post-partum haemorrhage (PPH) in labour wards.'
  },
  {
    id: 'cmd-ins-05',
    code: 'ZEML-CHR-008',
    name: 'Human Soluble Insulin (Regular) 100 IU/ml',
    category: 'Chronic & Non-Communicable',
    unitOfMeasure: 'Vial 10ml',
    standardPackSize: 1,
    coldChain: ColdChainRequirement.REFRIGERATED,
    minMos: 1.5,
    maxMos: 3.5,
    unitCostUSD: 5.10,
    dosageForm: '100 IU/ml 10ml Vial',
    description: 'Essential insulin for glycemic control in Type 1 & emergency Type 2 diabetes.'
  },
  {
    id: 'cmd-para-06',
    code: 'ZEML-ESS-005',
    name: 'Paracetamol 500mg Tablets',
    category: 'Essential Supply',
    unitOfMeasure: 'Tin of 1000 tabs',
    standardPackSize: 1000,
    coldChain: ColdChainRequirement.NONE,
    minMos: 2.0,
    maxMos: 6.0,
    unitCostUSD: 4.80,
    dosageForm: '500mg Tablet',
    description: 'Frontline analgesic and antipyretic for all clinical tiers.'
  },
  {
    id: 'cmd-ors-07',
    code: 'ZEML-PED-003',
    name: 'Oral Rehydration Salts (ORS) + Zinc Sulphate',
    category: 'Maternal & Child',
    unitOfMeasure: 'Co-pack of 2 sachets + 10 tabs Zinc',
    standardPackSize: 12,
    coldChain: ColdChainRequirement.NONE,
    minMos: 2.0,
    maxMos: 5.0,
    unitCostUSD: 1.10,
    dosageForm: 'Oral Sachet + Dispersible Zinc',
    description: 'Management of acute diarrheal dehydration in children under 5.'
  },
  {
    id: 'cmd-bcg-08',
    code: 'ZEML-VAC-001',
    name: 'BCG Vaccine 20-Dose with Diluent',
    category: 'Vaccine',
    unitOfMeasure: 'Vial with Diluent',
    standardPackSize: 1,
    coldChain: ColdChainRequirement.REFRIGERATED,
    minMos: 1.5,
    maxMos: 3.0,
    unitCostUSD: 4.20,
    dosageForm: 'Freeze-dried powder + Diluent ampoule',
    description: 'EPI vaccination against childhood tuberculosis for neonates.'
  }
];

export const INITIAL_BATCHES: DrugBatch[] = [
  // Mbare Polyclinic (Urban, high turnover)
  {
    id: 'bat-mbare-tld-01',
    commodityId: 'cmd-tld-01',
    facilityId: 'fac-har-02',
    batchNumber: 'NAT-2024-TLD-08',
    manufactureDate: '2024-03-10',
    expiryDate: '2026-09-30', // Expiring in ~23 days! Triggers FEFO urgency
    quantityOnHand: 45,
    quantityReceived: 400,
    supplierOrSource: 'NatPharm Central Hub',
    receivedDate: '2024-05-12',
    barcodeQrCode: 'ZIM9480-TLD-NAT202408',
    storageBin: 'Bin A-12'
  },
  {
    id: 'bat-mbare-tld-02',
    commodityId: 'cmd-tld-01',
    facilityId: 'fac-har-02',
    batchNumber: 'NAT-2025-TLD-03',
    manufactureDate: '2025-01-15',
    expiryDate: '2027-06-30', // Later expiry
    quantityOnHand: 350,
    quantityReceived: 350,
    supplierOrSource: 'NatPharm Central Hub',
    receivedDate: '2025-03-01',
    barcodeQrCode: 'ZIM9480-TLD-NAT202503',
    storageBin: 'Bin A-13'
  },
  {
    id: 'bat-mbare-coart-01',
    commodityId: 'cmd-coart-02',
    facilityId: 'fac-har-02',
    batchNumber: 'CIP-2024-COA-99',
    manufactureDate: '2024-08-01',
    expiryDate: '2026-11-15', // Near expiry (< 70 days)
    quantityOnHand: 80,
    quantityReceived: 200,
    supplierOrSource: 'Harare District Store',
    receivedDate: '2024-10-05',
    barcodeQrCode: 'ZIM9480-COA-CIP202499',
    storageBin: 'Bin B-04'
  },
  {
    id: 'bat-mbare-amox-01',
    commodityId: 'cmd-amox-03',
    facilityId: 'fac-har-02',
    batchNumber: 'GSK-2025-AMX-11',
    manufactureDate: '2025-02-10',
    expiryDate: '2027-08-31',
    quantityOnHand: 220,
    quantityReceived: 250,
    supplierOrSource: 'NatPharm Central Hub',
    receivedDate: '2025-04-18',
    barcodeQrCode: 'ZIM9480-AMX-GSK202511',
    storageBin: 'Bin C-01'
  },
  {
    id: 'bat-mbare-oxy-01',
    commodityId: 'cmd-oxy-04',
    facilityId: 'fac-har-02',
    batchNumber: 'SER-2024-OXY-03',
    manufactureDate: '2024-06-20',
    expiryDate: '2026-10-25', // 48 days left! Cold chain monitored
    quantityOnHand: 25,
    quantityReceived: 100,
    supplierOrSource: 'NatPharm Cold Chain Vehicle #8',
    receivedDate: '2024-08-02',
    barcodeQrCode: 'ZIM9480-OXY-SER202403',
    storageBin: 'Fridge 1 - Tray 2',
    temperatureBreached: false
  },
  {
    id: 'bat-mbare-para-01',
    commodityId: 'cmd-para-06',
    facilityId: 'fac-har-02',
    batchNumber: 'CAPS-2024-PAR-44',
    manufactureDate: '2024-05-15',
    expiryDate: '2028-04-30',
    quantityOnHand: 15, // Low stock!
    quantityReceived: 50,
    supplierOrSource: 'Harare District Store',
    receivedDate: '2024-07-10',
    barcodeQrCode: 'ZIM9480-PAR-CAPS202444',
    storageBin: 'Bin D-08'
  },

  // Tsholotsho RHC (Rural clinic in Matabeleland North, severe stockout on Amoxicillin & TLD)
  {
    id: 'bat-tshol-tld-01',
    commodityId: 'cmd-tld-01',
    facilityId: 'fac-matn-02',
    batchNumber: 'NAT-2024-TLD-22',
    manufactureDate: '2024-04-10',
    expiryDate: '2026-10-15',
    quantityOnHand: 6, // Dangerously low stock (< 0.2 MOS)
    quantityReceived: 80,
    supplierOrSource: 'Binga District Store',
    receivedDate: '2024-06-15',
    barcodeQrCode: 'ZIM9480-TLD-NAT202422',
    storageBin: 'Shelf 1'
  },
  {
    id: 'bat-tshol-amox-01',
    commodityId: 'cmd-amox-03',
    facilityId: 'fac-matn-02',
    batchNumber: 'GSK-2024-AMX-02',
    manufactureDate: '2024-01-10',
    expiryDate: '2026-08-30', // Expired!
    quantityOnHand: 0, // Stock-out!
    quantityReceived: 60,
    supplierOrSource: 'Binga District Store',
    receivedDate: '2024-03-20',
    barcodeQrCode: 'ZIM9480-AMX-GSK202402',
    storageBin: 'Shelf 2'
  },
  {
    id: 'bat-tshol-ors-01',
    commodityId: 'cmd-ors-07',
    facilityId: 'fac-matn-02',
    batchNumber: 'VAR-2025-ORS-14',
    manufactureDate: '2025-01-10',
    expiryDate: '2027-12-31',
    quantityOnHand: 45,
    quantityReceived: 50,
    supplierOrSource: 'Binga District Store',
    receivedDate: '2025-02-14',
    barcodeQrCode: 'ZIM9480-ORS-VAR202514',
    storageBin: 'Shelf 3'
  },

  // Binga District Hospital (Has surplus TLD and Amox, candidate for redistribution to Tsholotsho!)
  {
    id: 'bat-binga-tld-01',
    commodityId: 'cmd-tld-01',
    facilityId: 'fac-matn-01',
    batchNumber: 'NAT-2025-TLD-55',
    manufactureDate: '2025-02-01',
    expiryDate: '2027-08-31',
    quantityOnHand: 480, // High surplus!
    quantityReceived: 500,
    supplierOrSource: 'NatPharm Bulawayo Depot',
    receivedDate: '2025-03-12',
    barcodeQrCode: 'ZIM9480-TLD-NAT202555',
    storageBin: 'Store Room 2'
  },
  {
    id: 'bat-binga-amox-01',
    commodityId: 'cmd-amox-03',
    facilityId: 'fac-matn-01',
    batchNumber: 'CIP-2025-AMX-40',
    manufactureDate: '2025-03-01',
    expiryDate: '2027-09-30',
    quantityOnHand: 310,
    quantityReceived: 350,
    supplierOrSource: 'NatPharm Bulawayo Depot',
    receivedDate: '2025-04-10',
    barcodeQrCode: 'ZIM9480-AMX-CIP202540',
    storageBin: 'Store Room 1'
  },

  // Mutare Provincial Hospital (Manicaland)
  {
    id: 'bat-mut-oxy-01',
    commodityId: 'cmd-oxy-04',
    facilityId: 'fac-man-01',
    batchNumber: 'SER-2025-OXY-88',
    manufactureDate: '2025-01-20',
    expiryDate: '2027-04-30',
    quantityOnHand: 180,
    quantityReceived: 200,
    supplierOrSource: 'NatPharm Mutare Depot',
    receivedDate: '2025-02-28',
    barcodeQrCode: 'ZIM9480-OXY-SER202588',
    storageBin: 'Maternity Fridge B'
  },
  {
    id: 'bat-mut-ins-01',
    commodityId: 'cmd-ins-05',
    facilityId: 'fac-man-01',
    batchNumber: 'NOV-2024-INS-12',
    manufactureDate: '2024-07-15',
    expiryDate: '2026-10-05', // Near expiry
    quantityOnHand: 40,
    quantityReceived: 100,
    supplierOrSource: 'NatPharm Mutare Depot',
    receivedDate: '2024-09-12',
    barcodeQrCode: 'ZIM9480-INS-NOV202412',
    storageBin: 'Main Pharmacy Fridge A'
  }
];

export const INITIAL_LEDGER_EVENTS: StockMovementEvent[] = [
  {
    id: 'evt-001',
    timestamp: '2026-09-07T08:30:00Z',
    facilityId: 'fac-har-02',
    commodityId: 'cmd-tld-01',
    batchId: 'bat-mbare-tld-01',
    batchNumber: 'NAT-2024-TLD-08',
    transactionType: TransactionType.DISPENSE_PATIENT,
    quantityChange: -2,
    balanceAfter: 45,
    performedByUserId: 'usr-nurse-01',
    performedByUserName: 'Sister R. Chidambwe',
    userRole: UserRole.FACILITY_NURSE,
    departmentOrWard: 'Opportunistic Infections (OI) Clinic',
    fefoOverridden: false,
    sha256Signature: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    syncStatus: 'synced'
  },
  {
    id: 'evt-002',
    timestamp: '2026-09-07T09:15:00Z',
    facilityId: 'fac-har-02',
    commodityId: 'cmd-oxy-04',
    batchId: 'bat-mbare-oxy-01',
    batchNumber: 'SER-2024-OXY-03',
    transactionType: TransactionType.ISSUE_TO_WARD,
    quantityChange: -5,
    balanceAfter: 25,
    performedByUserId: 'usr-nurse-01',
    performedByUserName: 'Sister R. Chidambwe',
    userRole: UserRole.FACILITY_NURSE,
    departmentOrWard: 'Labour & Delivery Ward',
    fefoOverridden: false,
    sha256Signature: 'c7be0c58e5a07297e6be959f6213c4c9522137cf90b2131ef78f149887ec347c',
    syncStatus: 'synced'
  }
];

export const INITIAL_ALERTS: StockAlert[] = [
  {
    id: 'alt-001',
    facilityId: 'fac-matn-02',
    facilityName: 'Tsholotsho Rural Health Centre',
    commodityId: 'cmd-amox-03',
    commodityName: 'Amoxicillin 250mg Dispersible Tablets',
    type: 'STOCK_OUT_IMMINENT',
    severity: 'CRITICAL',
    message: 'Zero stock on hand for frontline child antibiotic',
    detail: 'Average Monthly Consumption is 35 bottles. Current on-hand is 0. Immediate inter-facility redistribution needed from Binga District.',
    timestamp: '2026-09-07T06:00:00Z',
    acknowledged: false
  },
  {
    id: 'alt-002',
    facilityId: 'fac-har-02',
    facilityName: 'Mbare Polyclinic',
    commodityId: 'cmd-tld-01',
    commodityName: 'Tenofovir / Lamivudine / Dolutegravir (TLD)',
    type: 'NEAR_EXPIRY_30D',
    severity: 'HIGH',
    message: 'Batch NAT-2024-TLD-08 expires in 23 days (45 packs remaining)',
    detail: 'FEFO enforcement prioritizes this batch for the next 2 weeks. Estimated consumption will consume 40 packs before expiry.',
    timestamp: '2026-09-07T07:15:00Z',
    acknowledged: false
  },
  {
    id: 'alt-003',
    facilityId: 'fac-man-01',
    facilityName: 'Mutare Provincial Hospital',
    commodityId: 'cmd-ins-05',
    commodityName: 'Human Soluble Insulin (Regular) 100 IU/ml',
    type: 'NEAR_EXPIRY_60D',
    severity: 'MEDIUM',
    message: 'Batch NOV-2024-INS-12 expires in 28 days (40 vials remaining)',
    detail: 'Stored in Main Pharmacy Fridge A. Require redistribution or prioritized dispensation.',
    timestamp: '2026-09-07T08:00:00Z',
    acknowledged: true
  }
];

export const INITIAL_REDISTRIBUTIONS: RedistributionRequest[] = [
  {
    id: 'redist-2026-001',
    requestingFacilityId: 'fac-matn-02',
    requestingFacilityName: 'Tsholotsho Rural Health Centre',
    fulfillingFacilityId: 'fac-matn-01',
    fulfillingFacilityName: 'Binga District Hospital',
    commodityId: 'cmd-amox-03',
    commodityName: 'Amoxicillin 250mg Dispersible Tablets',
    quantityRequested: 50,
    quantityApproved: 50,
    status: 'APPROVED',
    priority: 'CRITICAL_STOCK_OUT',
    requestedAt: '2026-09-06T14:30:00Z',
    approvedAt: '2026-09-07T08:00:00Z',
    trackingWaybillNumber: 'WB-ZIM-2026-0941',
    notes: 'Emergency transfer approved by District Health Executive.'
  }
];

export const SAMPLE_USERS: UserProfile[] = [
  {
    id: 'usr-nurse-01',
    name: 'Sister R. Chidambwe',
    role: UserRole.FACILITY_NURSE,
    facilityId: 'fac-har-02',
    facilityName: 'Mbare Polyclinic',
    province: 'Harare Metropolitan',
    district: 'Harare South',
    phone: '+263 77 234 5678',
    employeeNumber: 'MOHCC-NRC-4482'
  },
  {
    id: 'usr-nurse-02',
    name: 'Nurse E. Dube',
    role: UserRole.FACILITY_NURSE,
    facilityId: 'fac-matn-02',
    facilityName: 'Tsholotsho Rural Health Centre',
    province: 'Matabeleland North',
    district: 'Tsholotsho',
    phone: '+263 71 890 1234',
    employeeNumber: 'MOHCC-RHC-1109'
  },
  {
    id: 'usr-dist-01',
    name: 'Mr. S. Sibanda',
    role: UserRole.DISTRICT_PHARMACIST,
    facilityId: 'fac-matn-01',
    facilityName: 'Binga District Health Directorate',
    province: 'Matabeleland North',
    district: 'Binga',
    phone: '+263 77 912 3456',
    employeeNumber: 'MOHCC-PHM-9021'
  },
  {
    id: 'usr-prov-01',
    name: 'Dr. F. Mutasa',
    role: UserRole.PROVINCIAL_MANAGER,
    facilityId: 'fac-man-01',
    facilityName: 'Manicaland Provincial Health Directorate',
    province: 'Manicaland',
    district: 'Mutare Urban',
    phone: '+263 73 456 7890',
    employeeNumber: 'MOHCC-PMD-0045'
  },
  {
    id: 'usr-nat-01',
    name: 'Mr. K. Gwatidzo',
    role: UserRole.NATPHARM_LOGISTICS,
    facilityId: 'fac-nat-01',
    facilityName: 'NatPharm Central Hub',
    province: 'Harare Metropolitan',
    district: 'Southerton',
    phone: '+263 77 654 3210',
    employeeNumber: 'NATPHARM-DISP-104'
  }
];
