/**
 * MoHCC Zimbabwe Drug Tracking System (DTS-Zim)
 * Facility & District Stock Alerts Modal
 */

import React, { useState } from 'react';
import {
  X,
  AlertTriangle,
  AlertOctagon,
  Clock,
  Thermometer,
  ArrowRightLeft,
  CheckCircle2,
  Check,
  Filter
} from 'lucide-react';
import {
  Facility,
  StockAlert,
  Language
} from '../../types/index.ts';
import { TRANSLATIONS } from '../../services/translations.ts';

interface AlertsViewProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: StockAlert[];
  currentFacility: Facility;
  language: Language;
  onOpenRedistribution: (commodityId: string) => void;
}

export const AlertsView: React.FC<AlertsViewProps> = ({
  isOpen,
  onClose,
  alerts,
  currentFacility,
  language,
  onOpenRedistribution
}) => {
  const t = TRANSLATIONS[language];
  const [filterSeverity, setFilterSeverity] = useState<'ALL' | 'CRITICAL' | 'HIGH' | 'MEDIUM'>('ALL');
  const [localAlerts, setLocalAlerts] = useState<StockAlert[]>(alerts);

  if (!isOpen) return null;

  // Filter alerts for current facility or general
  const facilityAlerts = localAlerts.filter(a => a.facilityId === currentFacility.id || !a.facilityId);
  const filtered = facilityAlerts.filter(a => filterSeverity === 'ALL' || a.severity === filterSeverity);

  const handleAcknowledge = (id: string) => {
    setLocalAlerts(prev => prev.map(a => a.id === id ? { ...a, acknowledged: true } : a));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-scaleIn">
        {/* Header */}
        <div className="bg-amber-700 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-amber-200" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-none">
                {t.reportAlert}
              </h3>
              <span className="text-xs text-amber-200 mt-0.5 block">
                {currentFacility.name} · Real-Time Stockout & Expiry Risks
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-amber-200 hover:text-white p-1 rounded-md hover:bg-amber-600/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Severity Filter Tabs */}
        <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center gap-1.5 text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-400 mr-1" />
          {(['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'] as const).map(sev => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={`px-3 py-1 rounded-full font-semibold transition-colors ${
                filterSeverity === sev
                  ? 'bg-amber-700 text-white shadow-2xs'
                  : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>

        {/* Alerts List */}
        <div className="p-5 overflow-y-auto space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-80" />
              <p className="font-semibold text-slate-700 text-sm">No active alerts for this facility</p>
              <p className="text-slate-400 mt-1">Stock levels and expiry dates are within safe parameters.</p>
            </div>
          ) : (
            filtered.map(alert => {
              const isCritical = alert.severity === 'CRITICAL';
              const isHigh = alert.severity === 'HIGH';

              return (
                <div
                  key={alert.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    alert.acknowledged
                      ? 'bg-slate-50 border-slate-200 opacity-60'
                      : isCritical
                      ? 'bg-red-50/70 border-red-300 shadow-xs'
                      : isHigh
                      ? 'bg-amber-50/70 border-amber-300 shadow-xs'
                      : 'bg-blue-50/70 border-blue-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <div className="mt-0.5">
                        {isCritical ? (
                          <AlertOctagon className="w-5 h-5 text-red-600 shrink-0" />
                        ) : isHigh ? (
                          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                        ) : (
                          <Clock className="w-5 h-5 text-blue-600 shrink-0" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.2 rounded uppercase ${
                              isCritical
                                ? 'bg-red-600 text-white'
                                : isHigh
                                ? 'bg-amber-600 text-white'
                                : 'bg-blue-600 text-white'
                            }`}
                          >
                            {alert.severity}
                          </span>
                          <span className="text-xs font-bold text-slate-900">
                            {alert.commodityName}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-slate-800 mt-1">
                          {alert.message}
                        </p>
                        <p className="text-[11px] text-slate-600 mt-1">
                          {alert.detail}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      {!alert.acknowledged ? (
                        <button
                          onClick={() => handleAcknowledge(alert.id)}
                          className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded text-[11px] font-medium flex items-center gap-1 shadow-2xs"
                        >
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span>Acknowledge</span>
                        </button>
                      ) : (
                        <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          Acknowledged
                        </span>
                      )}

                      {alert.type === 'STOCK_OUT_IMMINENT' && (
                        <button
                          onClick={() => {
                            onClose();
                            onOpenRedistribution(alert.commodityId);
                          }}
                          className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-[11px] font-semibold flex items-center gap-1 shadow-2xs"
                        >
                          <ArrowRightLeft className="w-3 h-3" />
                          <span>Redistribute</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Alerts sync automatically every 15 minutes with District Medical Directorate</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 text-white font-semibold rounded-lg hover:bg-slate-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
