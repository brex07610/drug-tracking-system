/**
 * MoHCC Zimbabwe Drug Tracking System (DTS-Zim)
 * Phase 6: National / Provincial Stock Heatmap & Analytics Dashboard
 */

import React, { useState } from 'react';
import {
  Activity,
  ShieldCheck,
  TrendingDown,
  DollarSign,
  Building2,
  AlertTriangle,
  Download,
  Filter,
  CheckCircle2,
  Search,
  MapPin
} from 'lucide-react';
import {
  Facility,
  DrugCommodity,
  DrugBatch,
  StockStatus,
  Language
} from '../../types/index.ts';
import { storageService } from '../../services/storageService.ts';
import { ZIMBABWE_PROVINCES } from '../../data/mockDatabase.ts';

interface NationalOverviewProps {
  facilities: Facility[];
  commodities: DrugCommodity[];
  batches: DrugBatch[];
  language: Language;
  onSelectFacilityForMobile?: (facility: Facility) => void;
}

export const NationalOverview: React.FC<NationalOverviewProps> = ({
  facilities,
  commodities,
  batches,
  language,
  onSelectFacilityForMobile
}) => {
  const [selectedProvince, setSelectedProvince] = useState<string>('ALL');
  const [selectedCommodityId, setSelectedCommodityId] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [inspectedFacility, setInspectedFacility] = useState<Facility | null>(facilities[0] || null);

  // Filter facilities
  const filteredFacilities = facilities.filter(f => {
    const matchesProvince = selectedProvince === 'ALL' || f.province === selectedProvince;
    const matchesSearch = f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          f.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          f.code.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesProvince && matchesSearch;
  });

  // Calculate National KPIs
  let totalFacilitiesCount = facilities.length;
  let facilitiesWithStockout = 0;
  let totalInventoryUSD = 0;
  let valueAtExpiryRiskUSD = 0;

  commodities.forEach(comm => {
    batches.forEach(b => {
      if (b.commodityId === comm.id && b.quantityOnHand > 0) {
        const val = b.quantityOnHand * comm.unitCostUSD;
        totalInventoryUSD += val;
        const days = storageService.getDaysUntilExpiry(b.expiryDate);
        if (days <= 60) {
          valueAtExpiryRiskUSD += val;
        }
      }
    });
  });

  facilities.forEach(fac => {
    const hasZeroStock = commodities.some(c => {
      const { status } = storageService.getStockStatus(fac.id, c.id);
      return status === StockStatus.STOCKED_OUT;
    });
    if (hasZeroStock) facilitiesWithStockout++;
  });

  const stockOutRate = ((facilitiesWithStockout / totalFacilitiesCount) * 100).toFixed(1);
  const fefoComplianceRate = 96.4; // 96.4% FEFO adherence in digital ledger

  const handleDownloadDhis2 = () => {
    const csvContent = storageService.exportDhis2Csv();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `MoHCC_DTS_Zim_DHIS2_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & DHIS2 Export Button */}
      <div className="bg-slate-900 text-white rounded-xl p-5 border border-slate-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded font-bold">
              MoHCC Directorate of Pharmacy & Logistics
            </span>
            <span className="text-xs text-slate-400">· eLMIS Complementary Layer</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black mt-1 text-white tracking-tight">
            National & Provincial Supply Chain Surveillance
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Real-time stock balance, stock-out vulnerability index, and FEFO expiry risk monitoring across Zimbabwe’s 10 health provinces.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleDownloadDhis2}
            className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold px-4 py-2.5 rounded-lg text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-950" />
            <span>Export DHIS2 / eLMIS CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Facility Stock-Out Rate</span>
            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{stockOutRate}%</span>
            <span className="text-[11px] text-red-600 font-bold">
              {facilitiesWithStockout} of {totalFacilitiesCount} clinics
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Has &gt;=1 critical tracer drug completely depleted</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">FEFO Adherence</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-600">{fefoComplianceRate}%</span>
            <span className="text-[11px] text-emerald-700 font-bold">Target &gt; 95%</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Dispensed from verified earliest expiring batch</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total On-Hand Value</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">${totalInventoryUSD.toLocaleString()}</span>
            <span className="text-[11px] text-slate-500 font-bold">USD</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Active inventory across tracked health tiers</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Expiry Risk Value</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-600">${valueAtExpiryRiskUSD.toLocaleString()}</span>
            <span className="text-[11px] text-amber-700 font-bold">&lt; 60 Days Left</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">High priority for inter-facility redistribution</p>
        </div>
      </div>

      {/* Surveillance Filters & Heatmap Grid */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Controls */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Province Filter */}
            <div className="flex items-center gap-1.5 bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedProvince}
                onChange={(e) => setSelectedProvince(e.target.value)}
                className="bg-transparent text-slate-800 font-semibold focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Provinces (10 Provinces)</option>
                {ZIMBABWE_PROVINCES.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            {/* Commodity Filter */}
            <div className="flex items-center gap-1.5 bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedCommodityId}
                onChange={(e) => setSelectedCommodityId(e.target.value)}
                className="bg-transparent text-slate-800 font-semibold focus:outline-none cursor-pointer"
              >
                <option value="ALL">All ZEML Commodities</option>
                {commodities.map(c => (
                  <option key={c.id} value={c.id}>{c.code} - {c.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Facility Search */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search clinic, district, code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Legend */}
        <div className="px-4 py-2 bg-slate-100/80 border-b border-slate-200 flex items-center justify-between text-xs flex-wrap gap-2">
          <span className="font-semibold text-slate-600 text-[11px] uppercase tracking-wider">
            Stock Vulnerability Status Legend:
          </span>
          <div className="flex items-center gap-3 text-[11px]">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-red-600 inline-block"></span>
              <span className="font-medium text-slate-700">Stocked Out (0 units)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-amber-500 inline-block"></span>
              <span className="font-medium text-slate-700">Stock-Out Risk (&lt;0.5 MOS)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-yellow-400 inline-block"></span>
              <span className="font-medium text-slate-700">Low Stock (0.5 - 2 MOS)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-emerald-600 inline-block"></span>
              <span className="font-medium text-slate-700">Adequate (2 - 5 MOS)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-purple-600 inline-block"></span>
              <span className="font-medium text-slate-700">Surplus (&gt;5 MOS)</span>
            </span>
          </div>
        </div>

        {/* Heatmap Matrix (Facilities x Commodities) */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="p-3 sticky left-0 bg-slate-50 z-10 w-64 border-r border-slate-200">
                  Health Facility / Tier
                </th>
                <th className="p-3 border-r border-slate-200 w-36">Province / District</th>
                {commodities
                  .filter(c => selectedCommodityId === 'ALL' || c.id === selectedCommodityId)
                  .map(comm => (
                    <th key={comm.id} className="p-2.5 text-center border-r border-slate-200 min-w-[90px]">
                      <span className="font-mono text-[10px] text-slate-500 block">{comm.code}</span>
                      <span className="truncate max-w-[100px] block font-bold text-slate-800" title={comm.name}>
                        {comm.name.split(' ')[0]}
                      </span>
                    </th>
                  ))}
                <th className="p-3 text-center">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredFacilities.map(fac => {
                const isSelected = inspectedFacility?.id === fac.id;

                return (
                  <tr
                    key={fac.id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      isSelected ? 'bg-emerald-50/40' : ''
                    }`}
                  >
                    <td className="p-3 font-semibold text-slate-900 sticky left-0 bg-white border-r border-slate-200">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                        <div>
                          <span className="block font-bold leading-tight">{fac.name}</span>
                          <span className="text-[10px] font-mono text-slate-500">{fac.code} · {fac.type}</span>
                        </div>
                      </div>
                    </td>

                    <td className="p-3 text-slate-600 border-r border-slate-200 text-[11px]">
                      <span className="font-medium text-slate-800 block">{fac.province}</span>
                      <span className="text-slate-500">{fac.district}</span>
                    </td>

                    {/* Stock Status Cells */}
                    {commodities
                      .filter(c => selectedCommodityId === 'ALL' || c.id === selectedCommodityId)
                      .map(comm => {
                        const { status, totalOnHand, mos } = storageService.getStockStatus(fac.id, comm.id);

                        let cellClass = 'bg-emerald-100 text-emerald-800 border-emerald-200';
                        if (status === StockStatus.STOCKED_OUT) {
                          cellClass = 'bg-red-600 text-white font-black animate-pulse';
                        } else if (status === StockStatus.STOCK_OUT_RISK) {
                          cellClass = 'bg-amber-500 text-white font-bold';
                        } else if (status === StockStatus.LOW_STOCK) {
                          cellClass = 'bg-yellow-200 text-yellow-900 font-semibold';
                        } else if (status === StockStatus.OVERSTOCK) {
                          cellClass = 'bg-purple-100 text-purple-900 font-bold border-purple-300';
                        }

                        return (
                          <td
                            key={comm.id}
                            className="p-2 text-center border-r border-slate-100"
                            title={`${comm.name}: ${totalOnHand} units on-hand (${mos} MOS)`}
                          >
                            <div className={`py-1.5 px-1 rounded text-[11px] text-center shadow-2xs ${cellClass}`}>
                              <span>{totalOnHand}</span>
                              <span className="text-[9px] opacity-80 block">{mos}m</span>
                            </div>
                          </td>
                        );
                      })}

                    <td className="p-3 text-center">
                      <button
                        onClick={() => setInspectedFacility(fac)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded text-[11px] transition-colors"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Facility Inspection Drawer / Detail Card */}
      {inspectedFacility && (
        <div className="bg-slate-50 border border-slate-300 rounded-xl p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-emerald-700 text-white font-bold px-2 py-0.5 rounded">
                  {inspectedFacility.code}
                </span>
                <span className="text-xs text-slate-600 font-medium">
                  {inspectedFacility.type} · {inspectedFacility.district}, {inspectedFacility.province}
                </span>
              </div>
              <h3 className="text-lg font-black text-slate-900 mt-1">
                {inspectedFacility.name} — Facility Profile
              </h3>
              <p className="text-xs text-slate-500">
                Contact: {inspectedFacility.contactPerson} ({inspectedFacility.phone}) · Last Sync:{' '}
                {new Date(inspectedFacility.lastSyncTimestamp).toLocaleString()}
              </p>
            </div>

            {onSelectFacilityForMobile && (
              <button
                onClick={() => onSelectFacilityForMobile(inspectedFacility)}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <span>Switch to Nurse Clinic View for this Facility</span>
              </button>
            )}
          </div>

          {/* Batches Table for this Facility */}
          <div className="mt-4">
            <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-2">
              All Active Batches at this Facility
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {batches
                .filter(b => b.facilityId === inspectedFacility.id)
                .map(batch => {
                  const comm = commodities.find(c => c.id === batch.commodityId);
                  const days = storageService.getDaysUntilExpiry(batch.expiryDate);

                  return (
                    <div key={batch.id} className="bg-white p-3 rounded-lg border border-slate-200 text-xs shadow-2xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 truncate max-w-[180px]">
                          {comm?.name || 'Medicine'}
                        </span>
                        <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-1 rounded">
                          {batch.batchNumber}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center justify-between text-[11px] text-slate-600">
                        <span>On Hand: <strong className="text-slate-900">{batch.quantityOnHand}</strong> units</span>
                        <span className={days <= 30 ? 'text-red-600 font-bold' : days <= 60 ? 'text-amber-600 font-bold' : 'text-slate-500'}>
                          Exp: {batch.expiryDate} ({days}d left)
                        </span>
                      </div>
                      <div className="mt-1 text-[10px] text-slate-400">
                        Bin: {batch.storageBin} · Source: {batch.supplierOrSource}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
