/**
 * MoHCC Zimbabwe Drug Tracking System (DTS-Zim)
 * Physical Stock Count & Variance Audit Modal
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  ClipboardList,
  CheckCircle2,
  AlertTriangle,
  Scale,
  ArrowUpDown
} from 'lucide-react';
import {
  Facility,
  DrugCommodity,
  DrugBatch,
  UserProfile,
  Language
} from '../../types/index.ts';
import { storageService } from '../../services/storageService.ts';
import { TRANSLATIONS } from '../../services/translations.ts';

interface StockAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentFacility: Facility;
  commodities: DrugCommodity[];
  currentUser: UserProfile;
  initialCommodityId?: string;
  language: Language;
}

export const StockAuditModal: React.FC<StockAuditModalProps> = ({
  isOpen,
  onClose,
  currentFacility,
  commodities,
  currentUser,
  initialCommodityId,
  language
}) => {
  const t = TRANSLATIONS[language];

  const [selectedCommodityId, setSelectedCommodityId] = useState(
    initialCommodityId || commodities[0]?.id || ''
  );
  
  const batches = storageService.getBatchesForFacilityCommodity(
    currentFacility.id,
    selectedCommodityId
  );

  const [selectedBatchId, setSelectedBatchId] = useState(batches[0]?.id || '');
  const currentBatch = batches.find(b => b.id === selectedBatchId) || batches[0];
  const [physicalCount, setPhysicalCount] = useState<number>(currentBatch ? currentBatch.quantityOnHand : 0);
  const [reason, setReason] = useState('Routine monthly physical stocktaking count');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (isOpen && initialCommodityId) {
      setSelectedCommodityId(initialCommodityId);
      const newBatches = storageService.getBatchesForFacilityCommodity(currentFacility.id, initialCommodityId);
      if (newBatches.length > 0) {
        setSelectedBatchId(newBatches[0].id);
        setPhysicalCount(newBatches[0].quantityOnHand);
      }
    }
  }, [isOpen, initialCommodityId, currentFacility.id]);

  if (!isOpen) return null;

  const systemQuantity = currentBatch ? currentBatch.quantityOnHand : 0;
  const variance = physicalCount - systemQuantity;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentBatch) {
      setFeedback({ type: 'error', message: 'No batch available to audit.' });
      return;
    }

    try {
      storageService.performStocktake({
        facilityId: currentFacility.id,
        commodityId: selectedCommodityId,
        batchId: currentBatch.id,
        physicalCount: Number(physicalCount),
        reason,
        performedByUserId: currentUser.id,
        performedByUserName: currentUser.name,
        userRole: currentUser.role
      });

      setFeedback({
        type: 'success',
        message: `Stocktake recorded for Batch ${currentBatch.batchNumber}. Variance: ${variance > 0 ? '+' : ''}${variance}. System adjusted.`
      });

      setTimeout(() => {
        setFeedback(null);
        onClose();
      }, 1500);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Audit recording failed' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-scaleIn">
        {/* Header */}
        <div className="bg-indigo-800 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-700 flex items-center justify-center">
              <ClipboardList className="w-4 h-4 text-indigo-200" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-none">
                {t.stockAudit}
              </h3>
              <span className="text-xs text-indigo-200 mt-0.5 block">
                {currentFacility.name} · Physical Verification vs System
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-indigo-200 hover:text-white p-1 rounded-md hover:bg-indigo-700/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
          {feedback && (
            <div
              className={`p-3 rounded-lg flex items-center gap-2 text-xs font-medium ${
                feedback.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              )}
              <span>{feedback.message}</span>
            </div>
          )}

          {/* Commodity Selection */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              {t.selectCommodity} *
            </label>
            <select
              value={selectedCommodityId}
              onChange={(e) => {
                setSelectedCommodityId(e.target.value);
                const newBatches = storageService.getBatchesForFacilityCommodity(currentFacility.id, e.target.value);
                if (newBatches.length > 0) {
                  setSelectedBatchId(newBatches[0].id);
                  setPhysicalCount(newBatches[0].quantityOnHand);
                }
              }}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              {commodities.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} — {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Batch Selection */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Select Batch to Audit *
            </label>
            {batches.length === 0 ? (
              <div className="p-3 bg-amber-50 text-amber-800 rounded-lg border border-amber-200">
                No active batches found at this facility for this medicine.
              </div>
            ) : (
              <select
                value={selectedBatchId}
                onChange={(e) => {
                  setSelectedBatchId(e.target.value);
                  const b = batches.find(item => item.id === e.target.value);
                  if (b) setPhysicalCount(b.quantityOnHand);
                }}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 font-mono font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                {batches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.batchNumber} (System balance: {b.quantityOnHand} units, Exp: {b.expiryDate})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Variance Comparison Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold block">
                  System Recorded
                </span>
                <span className="text-lg font-black text-slate-800">
                  {systemQuantity}
                </span>
              </div>

              <div className="flex flex-col items-center justify-center">
                <ArrowUpDown className="w-4 h-4 text-slate-400 mb-1" />
                <span className="text-[10px] text-slate-400 font-semibold">vs Physical</span>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold block">
                  Variance
                </span>
                <span
                  className={`text-lg font-black ${
                    variance === 0
                      ? 'text-emerald-600'
                      : variance > 0
                      ? 'text-blue-600'
                      : 'text-red-600'
                  }`}
                >
                  {variance > 0 ? `+${variance}` : variance}
                </span>
              </div>
            </div>

            {variance !== 0 && (
              <div className={`mt-3 p-2 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 ${
                variance < 0 ? 'bg-red-50 text-red-800 border border-red-200' : 'bg-blue-50 text-blue-800 border border-blue-200'
              }`}>
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>
                  {variance < 0
                    ? `Negative variance detected (-${Math.abs(variance)} units). Shortage will be logged to the audit ledger.`
                    : `Positive variance detected (+${variance} units). Surplus will be added to the inventory balance.`}
                </span>
              </div>
            )}
          </div>

          {/* Physical Count Input */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Physically Counted Quantity (Bottles / Packs / Vials) *
            </label>
            <input
              type="number"
              min="0"
              value={physicalCount}
              onChange={(e) => setPhysicalCount(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full bg-white border border-slate-300 rounded-lg p-3 text-base text-slate-900 font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              required
            />
          </div>

          {/* Variance Reason */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Reason / Justification for Variance *
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="Routine monthly physical stocktaking count">Routine monthly physical stocktaking count</option>
              <option value="Unrecorded dispensation during high-volume OPD surge">Unrecorded dispensation during high-volume OPD surge</option>
              <option value="Packaging damage or broken glass ampoules in store">Packaging damage or broken glass ampoules in store</option>
              <option value="Manufacturer carton count discrepancy on receipt">Manufacturer carton count discrepancy on receipt</option>
              <option value="Clerical keying error during previous receipt">Clerical keying error during previous receipt</option>
            </select>
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
              disabled={!currentBatch}
              className="px-5 py-2 bg-indigo-700 hover:bg-indigo-800 disabled:bg-slate-300 text-white font-bold rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              Adjust & Confirm
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
