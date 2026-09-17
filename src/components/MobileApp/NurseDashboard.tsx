/**
 * MoHCC Zimbabwe Drug Tracking System (DTS-Zim)
 * Mobile Nurse / Dispenser Dashboard
 * Designed for low-bandwidth, low-literacy-friendly UI: large touch targets (44px+),
 * icon-first navigation, minimal text entry, FEFO prioritization.
 */

import React, { useState } from 'react';
import {
  PackagePlus,
  Send,
  ClipboardList,
  AlertTriangle,
  ArrowRightLeft,
  CloudOff,
  Clock,
  Search,
  CheckCircle,
  Thermometer,
  ShieldCheck,
  Calendar,
  Smartphone,
  Maximize2
} from 'lucide-react';
import {
  Facility,
  DrugCommodity,
  DrugBatch,
  StockStatus,
  Language,
  UserProfile,
  ColdChainRequirement
} from '../../types/index.ts';
import { storageService } from '../../services/storageService.ts';
import { TRANSLATIONS } from '../../services/translations.ts';

interface NurseDashboardProps {
  currentFacility: Facility;
  commodities: DrugCommodity[];
  batches: DrugBatch[];
  currentUser: UserProfile;
  language: Language;
  onOpenReceive: () => void;
  onOpenDispense: (commodityId?: string, batchId?: string) => void;
  onOpenStockAudit: (commodityId?: string) => void;
  onOpenAlerts: () => void;
  onOpenRedistribution: (commodityId?: string) => void;
  onOpenOfflineQueue: () => void;
  isOnline: boolean;
  pendingQueueCount: number;
}

export const NurseDashboard: React.FC<NurseDashboardProps> = ({
  currentFacility,
  commodities,
  batches,
  currentUser,
  language,
  onOpenReceive,
  onOpenDispense,
  onOpenStockAudit,
  onOpenAlerts,
  onOpenRedistribution,
  onOpenOfflineQueue,
  isOnline,
  pendingQueueCount
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [isPhoneFrame, setIsPhoneFrame] = useState(false);
  const t = TRANSLATIONS[language];

  // Filter commodities
  const filteredCommodities = commodities.filter(commodity => {
    const matchesSearch =
      commodity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      commodity.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'ALL' || commodity.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  // Calculate facility stats
  const facilityBatches = batches.filter(b => b.facilityId === currentFacility.id);
  let stockedOutCount = 0;
  let nearExpiryCount = 0;
  let lowStockCount = 0;

  commodities.forEach(c => {
    const { status } = storageService.getStockStatus(currentFacility.id, c.id);
    if (status === StockStatus.STOCKED_OUT) stockedOutCount++;
    if (status === StockStatus.STOCK_OUT_RISK || status === StockStatus.LOW_STOCK) lowStockCount++;
  });

  facilityBatches.forEach(b => {
    if (b.quantityOnHand > 0) {
      const days = storageService.getDaysUntilExpiry(b.expiryDate);
      if (days <= 60) nearExpiryCount++;
    }
  });

  const categories = ['ALL', 'ARV', 'Antimalarial', 'Antibiotic', 'Maternal & Child', 'Vaccine', 'Chronic & Non-Communicable'];

  const content = (
    <div className="space-y-5">
      {/* Facility Header Card */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 rounded-xl p-4 text-white shadow-md border border-emerald-700/50">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase px-2 py-0.5 bg-emerald-700/80 rounded font-semibold text-emerald-200">
                {currentFacility.code}
              </span>
              <span className="text-xs text-emerald-200/90 font-medium">
                {currentFacility.district} · {currentFacility.province}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold mt-1 tracking-tight">
              {currentFacility.name}
            </h2>
            <p className="text-xs text-emerald-100/80 mt-0.5">
              Logged in: <strong className="text-white">{currentUser.name}</strong> ({currentUser.employeeNumber})
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPhoneFrame(!isPhoneFrame)}
              className="bg-emerald-950/60 hover:bg-emerald-950 text-emerald-200 px-2.5 py-1.5 rounded-lg text-xs flex items-center gap-1.5 border border-emerald-600/40 transition-colors"
              title="Toggle mobile device frame"
            >
              {isPhoneFrame ? <Maximize2 className="w-3.5 h-3.5" /> : <Smartphone className="w-3.5 h-3.5" />}
              <span>{isPhoneFrame ? 'Full Width' : 'Phone Frame'}</span>
            </button>
          </div>
        </div>

        {/* Quick KPI pills */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-emerald-700/60">
          <div className="bg-emerald-950/40 rounded-lg p-2 text-center border border-emerald-600/20">
            <span className="text-[10px] text-emerald-200 uppercase font-semibold block">Stock-outs</span>
            <span className={`text-base sm:text-lg font-extrabold ${stockedOutCount > 0 ? 'text-red-300' : 'text-emerald-200'}`}>
              {stockedOutCount}
            </span>
          </div>
          <div className="bg-emerald-950/40 rounded-lg p-2 text-center border border-emerald-600/20">
            <span className="text-[10px] text-emerald-200 uppercase font-semibold block">Low Stock (&lt;2 MOS)</span>
            <span className={`text-base sm:text-lg font-extrabold ${lowStockCount > 0 ? 'text-amber-300' : 'text-emerald-200'}`}>
              {lowStockCount}
            </span>
          </div>
          <div className="bg-emerald-950/40 rounded-lg p-2 text-center border border-emerald-600/20">
            <span className="text-[10px] text-emerald-200 uppercase font-semibold block">Near Expiry (&lt;60d)</span>
            <span className={`text-base sm:text-lg font-extrabold ${nearExpiryCount > 0 ? 'text-amber-300' : 'text-emerald-200'}`}>
              {nearExpiryCount}
            </span>
          </div>
        </div>
      </div>

      {/* Primary Action Buttons (Touch Target >= 48px, Icon-First, Tri-lingual) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {/* 1. Receive Stock */}
        <button
          id="action-receive-stock"
          onClick={onOpenReceive}
          className="bg-emerald-700 hover:bg-emerald-800 active:scale-98 text-white p-3.5 rounded-xl shadow-sm border border-emerald-600 flex flex-col items-center justify-center text-center gap-2 min-h-[90px] transition-all cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-full bg-emerald-600 group-hover:bg-emerald-500 flex items-center justify-center shadow-inner transition-colors">
            <PackagePlus className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-sm block leading-tight text-white">{t.receiveStock}</span>
            <span className="text-[10px] text-emerald-100 font-normal">NatPharm / District</span>
          </div>
        </button>

        {/* 2. Dispense Stock (FEFO) */}
        <button
          id="action-dispense-stock"
          onClick={() => onOpenDispense()}
          className="bg-blue-700 hover:bg-blue-800 active:scale-98 text-white p-3.5 rounded-xl shadow-sm border border-blue-600 flex flex-col items-center justify-center text-center gap-2 min-h-[90px] transition-all cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-full bg-blue-600 group-hover:bg-blue-500 flex items-center justify-center shadow-inner transition-colors">
            <Send className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-sm block leading-tight text-white">{t.dispenseStock}</span>
            <span className="text-[10px] text-blue-100 font-normal">FEFO Auto-Select</span>
          </div>
        </button>

        {/* 3. Physical Stock Count / Audit */}
        <button
          id="action-stock-audit"
          onClick={() => onOpenStockAudit()}
          className="bg-indigo-700 hover:bg-indigo-800 active:scale-98 text-white p-3.5 rounded-xl shadow-sm border border-indigo-600 flex flex-col items-center justify-center text-center gap-2 min-h-[90px] transition-all cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-full bg-indigo-600 group-hover:bg-indigo-500 flex items-center justify-center shadow-inner transition-colors">
            <ClipboardList className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-sm block leading-tight text-white">{t.stockAudit}</span>
            <span className="text-[10px] text-indigo-100 font-normal">Variance Check</span>
          </div>
        </button>

        {/* 4. Stock Alerts */}
        <button
          id="action-stock-alerts"
          onClick={onOpenAlerts}
          className="bg-amber-600 hover:bg-amber-700 active:scale-98 text-white p-3.5 rounded-xl shadow-sm border border-amber-500 flex flex-col items-center justify-center text-center gap-2 min-h-[90px] transition-all cursor-pointer group relative"
        >
          {(stockedOutCount > 0 || nearExpiryCount > 0) && (
            <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-red-600 text-white text-[10px] font-extrabold flex items-center justify-center border-2 border-white">
              {stockedOutCount + nearExpiryCount}
            </span>
          )}
          <div className="w-10 h-10 rounded-full bg-amber-500 group-hover:bg-amber-400 flex items-center justify-center shadow-inner transition-colors">
            <AlertTriangle className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-sm block leading-tight text-white">{t.reportAlert}</span>
            <span className="text-[10px] text-amber-100 font-normal">Stockout & Expiry</span>
          </div>
        </button>

        {/* 5. Redistribution Request */}
        <button
          id="action-redistribution"
          onClick={() => onOpenRedistribution()}
          className="bg-teal-700 hover:bg-teal-800 active:scale-98 text-white p-3.5 rounded-xl shadow-sm border border-teal-600 flex flex-col items-center justify-center text-center gap-2 min-h-[90px] transition-all cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-full bg-teal-600 group-hover:bg-teal-500 flex items-center justify-center shadow-inner transition-colors">
            <ArrowRightLeft className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-sm block leading-tight text-white">{t.redistribution}</span>
            <span className="text-[10px] text-teal-100 font-normal">Facility Transfer</span>
          </div>
        </button>

        {/* 6. Offline Sync Queue */}
        <button
          id="action-offline-queue"
          onClick={onOpenOfflineQueue}
          className="bg-slate-700 hover:bg-slate-800 active:scale-98 text-white p-3.5 rounded-xl shadow-sm border border-slate-600 flex flex-col items-center justify-center text-center gap-2 min-h-[90px] transition-all cursor-pointer group relative"
        >
          {pendingQueueCount > 0 && (
            <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-bold">
              {pendingQueueCount}
            </span>
          )}
          <div className="w-10 h-10 rounded-full bg-slate-600 group-hover:bg-slate-500 flex items-center justify-center shadow-inner transition-colors">
            <CloudOff className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-sm block leading-tight text-white">{t.offlineQueue}</span>
            <span className="text-[10px] text-slate-300 font-normal">
              {isOnline ? 'Online Cache' : 'Local Storage'}
            </span>
          </div>
        </button>
      </div>

      {/* FEFO Banner */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 flex items-center gap-2.5 text-xs text-emerald-900 shadow-xs">
        <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
        <div>
          <strong className="font-semibold text-emerald-950">{t.fefoEnforced}</strong>: The system calculates and automatically dispenses from the earliest expiring batch.
        </div>
      </div>

      {/* Inventory & Batch Management Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              Facility Essential Medicines (ZEML)
            </h3>
            <p className="text-xs text-slate-500">
              Real-time stock balance, active batches, and FEFO priority sequence
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search medicine or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="px-4 py-2 bg-slate-100/70 border-b border-slate-200 flex items-center gap-1.5 overflow-x-auto text-xs">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-full whitespace-nowrap font-medium transition-colors ${
                selectedCategory === cat
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Commodity Inventory Cards / Rows */}
        <div className="divide-y divide-slate-100">
          {filteredCommodities.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              No matching commodities found.
            </div>
          ) : (
            filteredCommodities.map(commodity => {
              const { status, totalOnHand, amc, mos } = storageService.getStockStatus(currentFacility.id, commodity.id);
              const batches = storageService.getBatchesForFacilityCommodity(currentFacility.id, commodity.id);
              const earliestBatch = batches.length > 0 ? batches[0] : null;

              // Color badge styling
              let statusBadge = (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                  {t.healthy} ({mos} MOS)
                </span>
              );

              if (status === StockStatus.STOCKED_OUT) {
                statusBadge = (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-red-100 text-red-800 border border-red-200 animate-pulse">
                    {t.stockedOut} (0 Units)
                  </span>
                );
              } else if (status === StockStatus.STOCK_OUT_RISK) {
                statusBadge = (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-red-100 text-red-700">
                    {t.stockOutRisk} ({mos} MOS)
                  </span>
                );
              } else if (status === StockStatus.LOW_STOCK) {
                statusBadge = (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-800">
                    {t.lowStock} ({mos} MOS)
                  </span>
                );
              } else if (status === StockStatus.OVERSTOCK) {
                statusBadge = (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-purple-100 text-purple-800">
                    {t.overstock} ({mos} MOS)
                  </span>
                );
              }

              return (
                <div key={commodity.id} className="p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] font-mono font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                          {commodity.code}
                        </span>
                        <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                          {commodity.category}
                        </span>
                        {commodity.coldChain !== ColdChainRequirement.NONE && (
                          <span className="text-xs font-medium text-cyan-800 bg-cyan-50 px-2 py-0.5 rounded flex items-center gap-1">
                            <Thermometer className="w-3 h-3 text-cyan-600" />
                            Cold Chain (2-8°C)
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 mt-1">
                        {commodity.name}
                      </h4>
                      <p className="text-xs text-slate-500">
                        {commodity.dosageForm} · {commodity.unitOfMeasure} · Cost: ${commodity.unitCostUSD.toFixed(2)} USD
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-lg font-black text-slate-900">
                          {totalOnHand} <span className="text-xs font-medium text-slate-500">{t.packs}</span>
                        </div>
                        <div>{statusBadge}</div>
                      </div>

                      {/* Quick Action buttons */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => onOpenDispense(commodity.id)}
                          disabled={totalOnHand === 0}
                          className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors flex items-center gap-1"
                        >
                          <Send className="w-3 h-3" />
                          <span>Dispense</span>
                        </button>
                        <button
                          onClick={() => onOpenStockAudit(commodity.id)}
                          className="px-2 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors"
                          title="Count stock"
                        >
                          <ClipboardList className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Batches & FEFO Order Preview */}
                  {batches.length > 0 ? (
                    <div className="mt-3 pt-3 border-t border-slate-100">
                      <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                        <span>Active Batches (Sorted by FEFO Expiry)</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                        {batches.map((batch, index) => {
                          const daysUntil = storageService.getDaysUntilExpiry(batch.expiryDate);
                          const isEarliest = index === 0;

                          return (
                            <div
                              key={batch.id}
                              className={`p-2 rounded-lg border text-xs flex flex-col justify-between ${
                                isEarliest
                                  ? 'bg-emerald-50/60 border-emerald-300 shadow-2xs'
                                  : 'bg-slate-50/70 border-slate-200'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-mono font-bold text-slate-800">
                                  {batch.batchNumber}
                                </span>
                                {isEarliest && (
                                  <span className="text-[10px] font-bold bg-emerald-600 text-white px-1.5 py-0.2 rounded">
                                    FEFO 1st
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center justify-between mt-1 text-[11px] text-slate-600">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3 text-slate-400" />
                                  Exp: {batch.expiryDate}
                                </span>
                                <span className="font-semibold text-slate-900">
                                  {batch.quantityOnHand} units
                                </span>
                              </div>
                              <div className="mt-1 flex items-center justify-between text-[10px]">
                                <span className={daysUntil <= 30 ? 'text-red-600 font-bold' : daysUntil <= 60 ? 'text-amber-600 font-bold' : 'text-slate-500'}>
                                  {daysUntil <= 0 ? 'EXPIRED' : `${daysUntil} ${t.daysLeft}`}
                                </span>
                                <button
                                  onClick={() => onOpenDispense(commodity.id, batch.id)}
                                  className="text-blue-700 hover:text-blue-900 font-medium underline"
                                >
                                  Select
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="mt-2 text-xs text-amber-700 bg-amber-50 p-2 rounded border border-amber-200 flex items-center justify-between">
                      <span>No active inventory batches at this facility.</span>
                      <button
                        onClick={() => onOpenRedistribution(commodity.id)}
                        className="text-xs font-bold text-amber-900 underline ml-2"
                      >
                        Request Emergency Redistribution
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );

  // If phone frame preview is enabled, wrap in an authentic mobile bezel
  if (isPhoneFrame) {
    return (
      <div className="py-4 flex justify-center bg-slate-900/5 px-2">
        <div className="w-full max-w-[420px] bg-slate-900 rounded-[40px] p-3 shadow-2xl border-4 border-slate-800">
          {/* Phone Top Notch / Speaker */}
          <div className="h-4 flex items-center justify-center mb-2">
            <div className="w-20 h-3.5 bg-slate-800 rounded-full flex items-center justify-center">
              <div className="w-2.5 h-2.5 bg-slate-950 rounded-full mr-2"></div>
              <div className="w-8 h-1 bg-slate-700 rounded-full"></div>
            </div>
          </div>
          {/* Screen Content */}
          <div className="bg-slate-50 rounded-[30px] p-3 max-h-[85vh] overflow-y-auto border border-slate-200">
            {content}
          </div>
        </div>
      </div>
    );
  }

  return <div className="max-w-7xl mx-auto px-4 py-6">{content}</div>;
};
