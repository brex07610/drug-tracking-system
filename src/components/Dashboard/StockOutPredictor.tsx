/**
 * MoHCC Zimbabwe Drug Tracking System (DTS-Zim)
 * Phase 4 & 6: Automated Stock-Out Risk Predictor (MOS vs AMC)
 */

import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  CartesianGrid
} from 'recharts';
import {
  AlertOctagon,
  Clock,
  TrendingDown,
  Info,
  Building2
} from 'lucide-react';
import {
  Facility,
  DrugCommodity,
  StockStatus
} from '../../types/index.ts';
import { storageService } from '../../services/storageService.ts';

interface StockOutPredictorProps {
  facilities: Facility[];
  commodities: DrugCommodity[];
}

export const StockOutPredictor: React.FC<StockOutPredictorProps> = ({
  facilities,
  commodities
}) => {
  const [selectedCommodityId, setSelectedCommodityId] = useState(commodities[0]?.id || '');
  const selectedCommodity = commodities.find(c => c.id === selectedCommodityId) || commodities[0];

  // Prepare chart data: For each facility, compute Months of Stock (MOS)
  const chartData = facilities.map(fac => {
    const { totalOnHand, amc, mos, status } = storageService.getStockStatus(fac.id, selectedCommodityId);
    
    // Days of supply remaining
    const dailyConsumption = amc / 30;
    const daysRemaining = dailyConsumption > 0 ? Math.round(totalOnHand / dailyConsumption) : 999;

    return {
      facilityName: fac.name.split(' ')[0], // short name for chart axis
      fullName: fac.name,
      district: fac.district,
      mos,
      totalOnHand,
      amc,
      daysRemaining: Math.min(daysRemaining, 180),
      status
    };
  });

  // Calculate critically vulnerable facilities
  const vulnerableList = chartData.filter(d => d.mos < 1.0);

  return (
    <div className="space-y-6">
      {/* Overview Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-slate-900 text-lg">
            Stock-Out Vulnerability & AMC Runway Predictor
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Automated predictive modeling: Months of Stock (MOS = On-Hand ÷ Average Monthly Consumption)
          </p>
        </div>

        {/* Commodity Selector */}
        <div className="w-full sm:w-80">
          <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
            Tracer Medicine
          </label>
          <select
            value={selectedCommodityId}
            onChange={(e) => setSelectedCommodityId(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          >
            {commodities.map(c => (
              <option key={c.id} value={c.id}>
                {c.code} — {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Recharts Bar Chart */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="font-bold text-slate-800 text-sm">
              Months of Stock (MOS) by Facility — {selectedCommodity?.name}
            </h4>
            <span className="text-[11px] text-slate-500">
              Thresholds: Red (&lt;0.5 MOS: Emergency Stockout), Yellow (&lt;2.0 MOS: Low Stock), Green (2.0 - 5.0 MOS: Safe)
            </span>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="facilityName"
                tick={{ fontSize: 11, fill: '#64748b' }}
                interval={0}
                angle={-25}
                textAnchor="end"
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#64748b' }}
                label={{ value: 'MOS', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 12 }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-900 text-white p-3 rounded-lg shadow-xl text-xs border border-slate-700">
                        <p className="font-bold text-emerald-300">{data.fullName}</p>
                        <p className="text-slate-300 text-[11px]">{data.district} District</p>
                        <div className="mt-2 space-y-1 border-t border-slate-800 pt-2">
                          <p>Stock on Hand: <strong className="text-white">{data.totalOnHand} units</strong></p>
                          <p>Avg Monthly Consumption: <strong className="text-white">{data.amc} units/mo</strong></p>
                          <p>Months of Stock: <strong className="text-amber-300">{data.mos} MOS</strong></p>
                          <p>Estimated Runway: <strong className="text-red-300">{data.daysRemaining} days remaining</strong></p>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <ReferenceLine y={0.5} stroke="#ef4444" strokeDasharray="4 4" label={{ value: 'Critical Stockout (0.5)', fill: '#ef4444', fontSize: 10 }} />
              <ReferenceLine y={2.0} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: 'Reorder Level (2.0)', fill: '#f59e0b', fontSize: 10 }} />
              <ReferenceLine y={5.0} stroke="#a855f7" strokeDasharray="4 4" label={{ value: 'Max Ceiling (5.0)', fill: '#a855f7', fontSize: 10 }} />
              <Bar dataKey="mos" fill="#059669" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Vulnerable Clinics Priority Callout */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-3">
          <AlertOctagon className="w-5 h-5 text-red-600" />
          <h4 className="font-bold text-slate-900 text-sm">
            Facilities Imminently Stocking Out within 30 Days ({vulnerableList.length} Facilities)
          </h4>
        </div>

        {vulnerableList.length === 0 ? (
          <div className="p-4 bg-emerald-50 text-emerald-900 text-xs rounded-lg border border-emerald-200">
            No health facilities are currently below the critical 1.0 MOS safety threshold for this medicine.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {vulnerableList.map(item => (
              <div
                key={item.fullName}
                className="p-3.5 bg-red-50/70 border border-red-200 rounded-xl text-xs space-y-1.5 shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm truncate max-w-[180px]">
                    {item.fullName}
                  </span>
                  <span className="text-[10px] font-bold bg-red-600 text-white px-2 py-0.5 rounded">
                    {item.daysRemaining}d Runway
                  </span>
                </div>
                <div className="text-slate-600 text-[11px]">
                  District: {item.district} · Balance: <strong className="text-slate-900">{item.totalOnHand}</strong> units
                </div>
                <div className="text-[11px] text-red-800 font-semibold pt-1 border-t border-red-200/60">
                  AMC: {item.amc} units/mo · MOS: {item.mos}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
