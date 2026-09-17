/**
 * MoHCC Zimbabwe Drug Tracking System (DTS-Zim)
 * Tri-lingual dictionary: English, chiShona, isiNdebele
 */

import { Language } from '../types/index.ts';

export const TRANSLATIONS = {
  [Language.ENGLISH]: {
    appTitle: 'MoHCC Zimbabwe Drug Tracking System',
    subTitle: 'Ministry of Health and Child Care · Traceability & FEFO Layer',
    selectRole: 'Active User Profile',
    mobileAppView: 'Mobile Clinic View',
    adminDashboardView: 'MoHCC Management Dashboard',
    natpharmView: 'NatPharm Central Hub',
    systemSpecs: 'Architecture & Phase Roadmap',
    online: 'Online (Connected)',
    offline: 'Offline Mode (Local Cache)',
    pendingSync: 'Queued to Sync',
    syncNow: 'Sync Now',
    fefoEnforced: 'FEFO Active (Earliest Expiry First)',
    
    // Quick Actions
    receiveStock: 'Receive Stock',
    dispenseStock: 'Dispense / Issue',
    stockAudit: 'Physical Stock Count',
    reportAlert: 'Report Issue / Alert',
    redistribution: 'Redistribution Request',
    offlineQueue: 'Offline Sync Queue',

    // Statuses
    healthy: 'Adequate Stock',
    lowStock: 'Low Stock (< 2 MOS)',
    stockOutRisk: 'Imminent Stock-Out (< 0.5 MOS)',
    stockedOut: 'Complete Stock-Out',
    overstock: 'Overstocked (> 5 MOS)',
    
    // Form Labels
    selectCommodity: 'Select Essential Medicine (ZEML)',
    batchNumber: 'Batch / Lot Number',
    expiryDate: 'Expiry Date',
    quantity: 'Quantity (Packs / Units)',
    department: 'Dispensing Ward / Point',
    receivedFrom: 'Dispatched By',
    deliveryNote: 'Waybill / Delivery Note #',
    fefoWarning: 'Warning: This is NOT the earliest expiring batch!',
    overrideReason: 'Mandatory Clinical/Logistical Override Reason',
    submit: 'Confirm Transaction',
    cancel: 'Cancel',
    scanBarcode: 'Scan QR / Barcode',
    cameraScan: 'Use Camera',
    simulatedBarcode: 'Auto-Detect Delivery Barcode',
    
    // Units
    packs: 'Packs',
    daysLeft: 'days until expiry',
    monthsOfStock: 'Months of Stock (MOS)',
    monthlyConsumption: 'Avg Monthly Consumption (AMC)'
  },
  [Language.SHONA]: {
    appTitle: 'MoHCC Hurongwa Hwekutsvaga Mishonga',
    subTitle: 'Bazi reHutano neKurerwa kweVana · Kutsvaga Mishonga neFEFO',
    selectRole: 'Munhu Arikushanda',
    mobileAppView: 'Chiratidziro cheKiriniki (Nharembozha)',
    adminDashboardView: 'Dhibhodhi reVakuru veMoHCC',
    natpharmView: 'NatPharm Muzinda weMishonga',
    systemSpecs: 'Maitirwo eHurongwa',
    online: 'PaIndaneti (Kwakabatana)',
    offline: 'Pasina Indaneti (Kwakachengetwa muFoni)',
    pendingSync: 'Zvichamirira Kutumirwa',
    syncNow: 'Tumira Zvose Iyezvino',
    fefoEnforced: 'FEFO Inoshanda (Mishonga Inokurumidza Kuparara Kutanga)',

    // Quick Actions
    receiveStock: 'Gamuchira Mishonga',
    dispenseStock: 'Pana Mushonga KuMurwere',
    stockAudit: 'Kuverenga Mishonga muKiriniki',
    reportAlert: 'Mhan' + 'g' + 'ara Dambudziko',
    redistribution: 'Chikumbiro Chekugovanirana',
    offlineQueue: 'Mutsara weMabasa Asina Kutumirwa',

    // Statuses
    healthy: 'Mushonga Wakakwana',
    lowStock: 'Mushonga Wava Mushoma',
    stockOutRisk: 'Wave Kupera Chaizvo',
    stockedOut: 'Mushonga Wapera Kwese',
    overstock: 'Mushonga Wakawandisa',

    // Form Labels
    selectCommodity: 'Sarudza Mushonga (ZEML)',
    batchNumber: 'Nhamba yeBatch',
    expiryDate: 'Zuva reKupera Basa (Expiry)',
    quantity: 'Huwandu (Mapaki / Zvikamu)',
    department: 'Dhipatimendi / Wadhu',
    receivedFrom: 'Kwabva Nako',
    deliveryNote: 'Nhamba yeGwaro reKutakura',
    fefoWarning: 'Yambiro: Uyu HAUZI mushonga unokurumidza kupera basa!',
    overrideReason: 'Chikonzero Chekushandisa Batch Iri',
    submit: 'Simbisa Zvaitwa',
    cancel: 'Kanzura',
    scanBarcode: 'Sikena Bhakodhi / QR',
    cameraScan: 'Shandisa Kamera',
    simulatedBarcode: 'Ziva Bhakodhi Pakarepo',

    // Units
    packs: 'Mapaki',
    daysLeft: 'mazuva asara kuparara',
    monthsOfStock: 'Mwedzi yeKugara (MOS)',
    monthlyConsumption: 'Zvinoshandiswa paMwedzi (AMC)'
  },
  [Language.NDEBELE]: {
    appTitle: 'Uhlelo lwe-MoHCC Lokulandelela Imithi',
    subTitle: 'Ugatsha Lwezempilakahle Nokunakekelwa Kwabantwana',
    selectRole: 'Umsebenzisi Osebenzayo',
    mobileAppView: 'Ukubuka Kwekliniki (Ucingo)',
    adminDashboardView: 'Ideshibhodi Yabaphathi be-MoHCC',
    natpharmView: 'Isiphalala Se-NatPharm',
    systemSpecs: 'Indlela Uhlelo Oluqhutshwa Ngayo',
    online: 'Ku-inthanethi (Kuxhumene)',
    offline: 'Ngaphandle Kwe-inthanethi (Kulondolozwe Efonini)',
    pendingSync: 'Kulinde Ukuthunyelwa',
    syncNow: 'Thumela Konke Manje',
    fefoEnforced: 'I-FEFO Iyasebenza (Imithi Eshesha Yonakale Kuqala)',

    // Quick Actions
    receiveStock: 'Yamukela Imithi',
    dispenseStock: 'Nika Imithi Isigulane',
    stockAudit: 'Ukubala Imithi Ekliniki',
    reportAlert: 'Bika Inkinga / Isixwayiso',
    redistribution: 'Isicelo Sokwabelana',
    offlineQueue: 'Uhele Olulinde Ukuthunyelwa',

    // Statuses
    healthy: 'Imithi Yenele',
    lowStock: 'Imithi Isiyancipha',
    stockOutRisk: 'Isizaphela Ngokushesha',
    stockedOut: 'Imithi Iphele Qho',
    overstock: 'Imithi Iyanqwabelana',

    // Form Labels
    selectCommodity: 'Khetha Umuthi (ZEML)',
    batchNumber: 'Inombolo ye-Batch',
    expiryDate: 'Usuku Lokuphelelwa Isikhathi',
    quantity: 'Inani (Amaphakethe)',
    department: 'Iwadi / Indawo Yokuphela',
    receivedFrom: 'Ivela Kuphi',
    deliveryNote: 'Inombolo Yencwadi Yokulethwa',
    fefoWarning: 'Isixwayiso: Lona AKUSIYE umuthi oshesha uphelele!',
    overrideReason: 'Isizathu Sokusebenzisa Le Batch',
    submit: 'Qinisekisa Umsebenzi',
    cancel: 'Cima',
    scanBarcode: 'Skena I-Barcode / QR',
    cameraScan: 'Sebenzisa Ikhamera',
    simulatedBarcode: 'Bona I-Barcode Ngokushesha',

    // Units
    packs: 'Amaphakethe',
    daysLeft: 'izinsuku ezisele kungakapheli',
    monthsOfStock: 'Izinyanga Zokulondolozwa (MOS)',
    monthlyConsumption: 'Ukusetshenziswa Ngenyanga (AMC)'
  }
};
