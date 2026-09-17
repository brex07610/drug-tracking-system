/**
 * MoHCC Zimbabwe Drug Tracking System (DTS-Zim)
 * Phase 6: eLMIS Stock Imbalance Solver & Redistribution Recommendation Engine
 */

import React, { useState } from 'react';
import {
  ArrowRightLeft,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Truck,
  Sparkles,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import {
  Facility,
  DrugCommodity,
  RedistributionRequest,
  StockStatus
} from '../../types/index.ts';
import { storageService } from '../../services/storageService.ts';

interface RedistributionMatcherProps {
  facilities: Facility[];
  commodities: DrugCommodity[];
  redistributions: RedistributionRequest[];
}

export const RedistributionMatcher: React.FC<RedistributionMatcherProps> = ({
  facilities,
  commodities,
  redistributions
}) => {
  const [selectedCommodityId, setSelectedCommodityId] = useState(commodities[0]?.id || '');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const selectedCommodity = commodities.find(c => c.id === selectedCommodityId) || commodities[0];

  // Calculate surplus facilities and deficit facilities for this commodity
  const deficitFacilities: { facility: Facility; onHand: number; mos: number; deficitUnits: number }[] = [];
  const surplusFacilities: { facility: Facility; onHand: number; mos: number; surplusUnits: number }[] = [];

  facilities.forEach(fac => {
    const { totalOnHand, amc, mos } = storageService.getStockStatus(fac.id, selectedCommodityId);
    if (mos < 1.0) {
      const targetMinUnits = Math.round(amc * 2.0); // 2.0 MOS safety stock
      const deficitUnits = Math.max(10, targetMinUnits - totalOnHand);
      deficitFacilities.push({ facility: fac, onHand: totalOnHand, mos, deficitUnits });
    } else if (mos > 4.0 && totalOnHand > 100) {
      const maxKeepUnits = Math.round(amc * 3.5);
      const surplusUnits = Math.max(15, totalOnHand - maxKeepUnits);
      surplusFacilities.push({ facility: fac, onHand: totalOnHand, mos, surplusUnits });
    }
  });

  const handleApproveRecommendation = (deficitFac: Facility, surplusFac: Facility, quantity: number) => {
    const req = storageService.createRedistributionRequest({
      requestingFacilityId: deficitFac.id,
      commodityId: selectedCommodityId,
      quantityRequested: quantity,
      priority: 'CRITICAL_STOCK_OUT',
      notes: `Automated eLMIS Imbalance Recommendation: Reallocated ${quantity} units from ${surplusFac.name} (${surplusFac.district}) to relieve stockout.`
    });

    setSuccessMessage(`Approved redistribution of ${quantity} units from ${surplusFac.name} to ${deficitFac.name}. Tracking: ${req.trackingWaybillNumber}`);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase px-2 py-0.5 bg-teal-50 text-teal-800 border border-teal-200 rounded font-bold">
              eLMIS Complementary Algorithm
            </span>
          </div>
          <h3 className="font-bold text-slate-900 text-lg mt-1">
            Inter-Facility Stock Balancing & Redistribution Engine
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Automatically pairs health facilities suffering stock-outs with nearby clinics carrying surplus inventory to eliminate emergency stock-outs without awaiting central shipments.
          </p>
        </div>

        {/* Commodity Filter */}
        <div className="w-full sm:w-80">
          <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
            Filter Medicine
          </label>
          <select
            value={selectedCommodityId}
            onChange={(e) => setSelectedCommodityId(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
          >
            {commodities.map(c => (
              <option key={c.id} value={c.id}>
                {c.code} — {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 bg-emerald-50 text-emerald-900 rounded-xl border border-emerald-200 flex items-center gap-3 text-xs font-semibold shadow-xs animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Suggested Pairings */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-teal-600" />
            <h4 className="font-bold text-slate-900 text-sm">
              Recommended Redistribution Pairings for {selectedCommodity?.name}
            </h4>
          </div>
          <span className="text-xs text-slate-500">
            {deficitFacilities.length} Deficits identified · {surplusFacilities.length} Surplus sources
          </span>
        </div>

        {deficitFacilities.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 text-slate-500 text-xs">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
            <p className="font-bold text-slate-800 text-sm">Optimal Supply Balance</p>
            <p className="text-slate-400 mt-1">No acute inter-facility stock imbalances exist for this medicine.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {deficitFacilities.map((def, index) => {
              const matchingSurplus = surplusFacilities[index % Math.max(1, surplusFacilities.length)];
              const transferQty = matchingSurplus ? Math.min(def.deficitUnits, matchingSurplus.surplusUnits) : def.deficitUnits;

              return (
                <div
                  key={def.facility.id}
                  className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 text-xs"
                >
                  {/* Deficit Facility */}
                  <div className="flex-1 bg-white p-3 rounded-lg border border-red-200 shadow-2xs">
                    <span className="text-[10px] font-bold uppercase text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
                      Deficit Recipient ({def.mos} MOS)
                    </span>
                    <h5 className="font-bold text-slate-900 text-sm mt-1">{def.facility.name}</h5>
                    <p className="text-[11px] text-slate-500">{def.facility.district}, {def.facility.province}</p>
                    <div className="mt-2 text-[11px] font-semibold text-red-700">
                      Current On-Hand: {def.onHand} units (Need +{def.deficitUnits} units to safety level)
                    </div>
                  </div>

                  {/* Transfer Action Indicator */}
                  <div className="flex flex-col items-center justify-center px-2">
                    <div className="bg-teal-700 text-white font-mono font-bold px-3 py-1 rounded-full text-xs flex items-center gap-1.5 shadow-2xs">
                      <Truck className="w-3.5 h-3.5" />
                      <span>Transfer {transferQty} units</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 mt-1 hidden lg:block" />
                  </div>

                  {/* Surplus Facility */}
                  <div className="flex-1 bg-white p-3 rounded-lg border border-emerald-200 shadow-2xs">
                    {matchingSurplus ? (
                      <>
                        <span className="text-[10px] font-bold uppercase text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                          Surplus Donor ({matchingSurplus.mos} MOS)
                        </span>
                        <h5 className="font-bold text-slate-900 text-sm mt-1">{matchingSurplus.facility.name}</h5>
                        <p className="text-[11px] text-slate-500">{matchingSurplus.facility.district}, {matchingSurplus.facility.province}</p>
                        <div className="mt-2 text-[11px] font-semibold text-emerald-800">
                          Current On-Hand: {matchingSurplus.onHand} units (Surplus: +{matchingSurplus.surplusUnits} units)
                        </div>
                      </>
                    ) : (
                      <>
                        <span className="text-[10px] font-bold uppercase text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                          National Depot Fallback
                        </span>
                        <h5 className="font-bold text-slate-900 text-sm mt-1">NatPharm Regional Depot</h5>
                        <p className="text-[11px] text-slate-500">Central Buffer Reserve</p>
                        <div className="mt-2 text-[11px] text-slate-600">
                          No district surplus. Dispatch directly from central warehouse.
                        </div>
                      </>
                    )}
                  </div>

                  {/* Approve Button */}
                  <div className="flex items-center justify-end lg:justify-center">
                    <button
                      onClick={() => handleApproveRecommendation(def.facility, matchingSurplus?.facility || facilities[0], transferQty)}
                      className="w-full lg:w-auto bg-teal-700 hover:bg-teal-800 text-white font-bold px-4 py-2.5 rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4 text-teal-200" />
                      <span>Approve & Dispatch</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Active Inter-Facility Transfer Waybills Table */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <h4 className="font-bold text-slate-900 text-sm mb-3">
          Recent Inter-Facility Waybills & Transit Status
        </h4>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <th className="p-3">Waybill #</th>
                <th className="p-3">Medicine</th>
                <th className="p-3">From (Surplus)</th>
                <th className="p-3">To (Deficit)</th>
                <th className="p-3">Quantity</th>
                <th className="p-3">Status</th>
                <th className="p-3">Requested At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {redistributions.map(r => (
                <tr key={r.id} className="hover:bg-slate-50">
                  <td className="p-3 font-mono font-bold text-teal-800">{r.trackingWaybillNumber || r.id}</td>
                  <td className="p-3 font-semibold text-slate-900">{r.commodityName}</td>
                  <td className="p-3 text-slate-600">{r.fulfillingFacilityName || 'District Store'}</td>
                  <td className="p-3 text-slate-900 font-medium">{r.requestingFacilityName}</td>
                  <td className="p-3 font-bold text-slate-900">{r.quantityRequested} units</td>
                  <td className="p-3">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      {r.status}
                    </span>
                  </td>
                  <td className="p-3 text-slate-500 text-[11px]">{new Date(r.requestedAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
