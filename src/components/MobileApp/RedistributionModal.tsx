/**
 * MoHCC Zimbabwe Drug Tracking System (DTS-Zim)
 * Inter-Facility & District Redistribution Modal
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  ArrowRightLeft,
  CheckCircle2,
  AlertCircle,
  Building2,
  Truck,
  Sparkles
} from 'lucide-react';
import {
  Facility,
  DrugCommodity,
  UserProfile,
  Language,
  StockStatus
} from '../../types/index.ts';
import { storageService } from '../../services/storageService.ts';
import { TRANSLATIONS } from '../../services/translations.ts';

interface RedistributionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentFacility: Facility;
  facilities: Facility[];
  commodities: DrugCommodity[];
  currentUser: UserProfile;
  initialCommodityId?: string;
  language: Language;
}

export const RedistributionModal: React.FC<RedistributionModalProps> = ({
  isOpen,
  onClose,
  currentFacility,
  facilities,
  commodities,
  currentUser,
  initialCommodityId,
  language
}) => {
  const t = TRANSLATIONS[language];

  const [selectedCommodityId, setSelectedCommodityId] = useState(
    initialCommodityId || commodities[0]?.id || ''
  );
  const [quantityRequested, setQuantityRequested] = useState<number>(50);
  const [priority, setPriority] = useState<'ROUTINE' | 'URGENT' | 'CRITICAL_STOCK_OUT'>('CRITICAL_STOCK_OUT');
  const [notes, setNotes] = useState('Stock-out imminent at clinic; emergency stock balancing request.');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string; trackingId?: string } | null>(null);

  useEffect(() => {
    if (isOpen && initialCommodityId) {
      setSelectedCommodityId(initialCommodityId);
    }
  }, [isOpen, initialCommodityId]);

  if (!isOpen) return null;

  // Find facilities with healthy or surplus stock of this commodity
  const surplusFacilities = facilities
    .filter(f => f.id !== currentFacility.id)
    .map(f => {
      const info = storageService.getStockStatus(f.id, selectedCommodityId);
      return { facility: f, ...info };
    })
    .filter(f => f.totalOnHand > 0)
    .sort((a, b) => b.mos - a.mos);

  const bestMatch = surplusFacilities[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (quantityRequested <= 0) {
      setFeedback({ type: 'error', message: 'Quantity must be greater than zero.' });
      return;
    }

    try {
      const request = storageService.createRedistributionRequest({
        requestingFacilityId: currentFacility.id,
        commodityId: selectedCommodityId,
        quantityRequested: Number(quantityRequested),
        priority,
        notes
      });

      setFeedback({
        type: 'success',
        message: `Redistribution request submitted. Assigned to ${request.fulfillingFacilityName || 'District Pool'}.`,
        trackingId: request.trackingWaybillNumber
      });

      setTimeout(() => {
        setFeedback(null);
        onClose();
      }, 2000);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Error submitting request.' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-scaleIn">
        {/* Header */}
        <div className="bg-teal-800 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-700 flex items-center justify-center">
              <ArrowRightLeft className="w-4 h-4 text-teal-200" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-none">
                {t.redistribution}
              </h3>
              <span className="text-xs text-teal-200 mt-0.5 block">
                {currentFacility.name} · Surplus/Deficit Matching
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-teal-200 hover:text-white p-1 rounded-md hover:bg-teal-700/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
          {feedback && (
            <div
              className={`p-3 rounded-lg flex flex-col gap-1 text-xs font-medium ${
                feedback.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              <div className="flex items-center gap-2">
                {feedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                )}
                <span>{feedback.message}</span>
              </div>
              {feedback.trackingId && (
                <span className="font-mono text-[11px] text-emerald-700 font-bold ml-6">
                  Waybill Manifest: {feedback.trackingId}
                </span>
              )}
            </div>
          )}

          {/* Commodity Selection */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              {t.selectCommodity} *
            </label>
            <select
              value={selectedCommodityId}
              onChange={(e) => setSelectedCommodityId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
            >
              {commodities.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} — {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Smart Surplus Matching Card */}
          <div className="bg-emerald-50/70 border border-emerald-300 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between text-emerald-950 font-bold">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>Smart Surplus Match (eLMIS Imbalance Solver)</span>
              </span>
            </div>

            {bestMatch ? (
              <div className="bg-white rounded-lg p-3 border border-emerald-200 text-xs">
                <div className="flex items-center justify-between">
                  <strong className="text-slate-900">{bestMatch.facility.name}</strong>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                    Surplus: {bestMatch.mos} MOS ({bestMatch.totalOnHand} units)
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Located in {bestMatch.facility.district}, {bestMatch.facility.province}. High stock balance available to safely reallocate without risking stockout.
                </p>
              </div>
            ) : (
              <div className="text-[11px] text-amber-800 bg-amber-50 p-2 rounded border border-amber-200">
                No local clinics currently have surplus. Request will escalate directly to NatPharm Central Medical Store.
              </div>
            )}
          </div>

          {/* Quantity & Priority */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Requested Quantity (Packs) *
              </label>
              <input
                type="number"
                min="1"
                value={quantityRequested}
                onChange={(e) => setQuantityRequested(Math.max(1, parseInt(e.target.value) || 0))}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 font-bold focus:ring-2 focus:ring-teal-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Urgency / Priority *
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 font-semibold focus:ring-2 focus:ring-teal-500 focus:outline-none"
              >
                <option value="CRITICAL_STOCK_OUT">Critical (Stock-Out Imminent)</option>
                <option value="URGENT">Urgent (&lt; 2 Weeks Supply)</option>
                <option value="ROUTINE">Routine Monthly Balancing</option>
              </select>
            </div>
          </div>

          {/* Justification Notes */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Clinical & Logistical Justification
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              placeholder="e.g. Stockout due to patient surge from surrounding rural wards..."
            />
          </div>

          {/* Submit / Cancel */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold transition-colors"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              Submit Transfer Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
