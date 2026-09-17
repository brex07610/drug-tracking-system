/**
 * MoHCC Zimbabwe Drug Tracking System (DTS-Zim)
 * FEFO-Enforced Dispensing / Issuing Modal
 * Enforces First-Expiry-First-Out logic with mandatory clinical override audit trail.
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  Send,
  ShieldAlert,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Lock,
  Building2
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

interface DispenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentFacility: Facility;
  commodities: DrugCommodity[];
  currentUser: UserProfile;
  initialCommodityId?: string;
  initialBatchId?: string;
  language: Language;
}

export const DispenseModal: React.FC<DispenseModalProps> = ({
  isOpen,
  onClose,
  currentFacility,
  commodities,
  currentUser,
  initialCommodityId,
  initialBatchId,
  language
}) => {
  const t = TRANSLATIONS[language];

  const [selectedCommodityId, setSelectedCommodityId] = useState(
    initialCommodityId || commodities[0]?.id || ''
  );
  const [selectedBatchId, setSelectedBatchId] = useState(initialBatchId || '');
  const [quantity, setQuantity] = useState<number>(1);
  const [departmentOrWard, setDepartmentOrWard] = useState('Outpatient Department (OPD) Pharmacy');
  const [overrideReason, setOverrideReason] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Available batches for this facility and commodity, sorted by FEFO
  const batches = storageService.getBatchesForFacilityCommodity(
    currentFacility.id,
    selectedCommodityId
  );
  const earliestBatch = batches.length > 0 ? batches[0] : null;

  // Sync commodity when modal opens with initialCommodityId
  useEffect(() => {
    if (isOpen && initialCommodityId) {
      setSelectedCommodityId(initialCommodityId);
    }
  }, [isOpen, initialCommodityId]);

  // Set default batch to earliest FEFO batch when modal opens or commodity changes
  useEffect(() => {
    if (!isOpen) return;

    const availableBatches = storageService.getBatchesForFacilityCommodity(
      currentFacility.id,
      selectedCommodityId
    );
    const earliest = availableBatches.length > 0 ? availableBatches[0] : null;

    if (initialBatchId && availableBatches.some(b => b.id === initialBatchId)) {
      setSelectedBatchId(initialBatchId);
    } else if (earliest) {
      setSelectedBatchId(earliest.id);
    } else {
      setSelectedBatchId('');
    }
  }, [isOpen, selectedCommodityId, currentFacility.id, initialBatchId]);

  if (!isOpen) return null;

  const currentBatch = batches.find(b => b.id === selectedBatchId);
  const isFefoBypassed = earliestBatch && currentBatch && earliestBatch.id !== currentBatch.id;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentBatch) {
      setFeedback({ type: 'error', message: 'Please select an active stock batch.' });
      return;
    }

    if (quantity <= 0) {
      setFeedback({ type: 'error', message: 'Quantity must be at least 1 unit.' });
      return;
    }

    if (quantity > currentBatch.quantityOnHand) {
      setFeedback({
        type: 'error',
        message: `Insufficient stock in batch ${currentBatch.batchNumber}. Available: ${currentBatch.quantityOnHand}`
      });
      return;
    }

    if (isFefoBypassed && !overrideReason.trim()) {
      setFeedback({
        type: 'error',
        message: 'FEFO OVERRIDE: You must select a mandatory reason for bypassing the earliest expiring batch.'
      });
      return;
    }

    const result = storageService.dispenseStock({
      facilityId: currentFacility.id,
      commodityId: selectedCommodityId,
      batchId: currentBatch.id,
      quantity: Number(quantity),
      departmentOrWard,
      overrideReason: isFefoBypassed ? overrideReason : undefined,
      performedByUserId: currentUser.id,
      performedByUserName: currentUser.name,
      userRole: currentUser.role
    });

    if (!result.success) {
      setFeedback({ type: 'error', message: result.error || 'Failed to record dispensation.' });
      return;
    }

    setFeedback({
      type: 'success',
      message: `Dispensed ${quantity} units from Batch ${currentBatch.batchNumber}. Ledger updated.`
    });

    setTimeout(() => {
      setFeedback(null);
      onClose();
    }, 1400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-scaleIn">
        {/* Header */}
        <div className="bg-blue-800 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-700 flex items-center justify-center">
              <Send className="w-4 h-4 text-blue-200" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-none">
                {t.dispenseStock}
              </h3>
              <span className="text-xs text-blue-200 mt-0.5 block">
                {currentFacility.name} · FEFO-Enforced Dispensing
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-blue-200 hover:text-white p-1 rounded-md hover:bg-blue-700/50"
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
              onChange={(e) => setSelectedCommodityId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              {commodities.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} — {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* FEFO Batch Picker */}
          <div>
            <label className="block font-bold text-slate-700 mb-1 flex items-center justify-between">
              <span>{t.batchNumber} (FEFO Priority Order) *</span>
              {earliestBatch && (
                <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Recommended: {earliestBatch.batchNumber} (Exp: {earliestBatch.expiryDate})
                </span>
              )}
            </label>

            {batches.length === 0 ? (
              <div className="p-3 bg-red-50 text-red-700 rounded-lg border border-red-200 text-xs font-semibold">
                No active stock available for this medicine at {currentFacility.name}!
              </div>
            ) : (
              <div className="space-y-1.5">
                {batches.map((b, idx) => {
                  const days = storageService.getDaysUntilExpiry(b.expiryDate);
                  const isEarliest = idx === 0;
                  const isSelected = selectedBatchId === b.id;

                  return (
                    <div
                      key={b.id}
                      onClick={() => setSelectedBatchId(b.id)}
                      className={`p-2.5 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/80 ring-2 ring-blue-500/20 shadow-2xs'
                          : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="batchRadio"
                          checked={isSelected}
                          onChange={() => setSelectedBatchId(b.id)}
                          className="text-blue-600 focus:ring-blue-500"
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-slate-900">
                              {b.batchNumber}
                            </span>
                            {isEarliest && (
                              <span className="text-[9px] bg-emerald-600 text-white font-extrabold px-1.5 py-0.2 rounded uppercase">
                                FEFO Priority 1
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <Calendar className="w-3 h-3" /> Exp: {b.expiryDate} ({days} days remaining)
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-bold text-slate-900 block">
                          {b.quantityOnHand} units
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {b.storageBin}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* FEFO Violation Warning Banner */}
          {isFefoBypassed && (
            <div className="p-3 bg-amber-50 border border-amber-300 rounded-lg space-y-2 text-amber-900">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold text-amber-950">
                    {t.fefoWarning}
                  </strong>
                  <p className="text-[11px] text-amber-800 mt-0.5">
                    Batch <strong>{earliestBatch?.batchNumber}</strong> expires earlier (
                    {earliestBatch?.expiryDate}). Choosing batch{' '}
                    <strong>{currentBatch?.batchNumber}</strong> risks stock expiration and wastage.
                  </p>
                </div>
              </div>

              <div>
                <label className="block font-bold text-amber-950 mb-1">
                  {t.overrideReason} *
                </label>
                <select
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  className="w-full bg-white border border-amber-300 rounded-md p-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                >
                  <option value="">-- Select Validated Clinical / Logistical Reason --</option>
                  <option value="Earlier batch quarantined for cold-chain temperature review">Earlier batch quarantined for cold-chain temperature review</option>
                  <option value="Packaging or seal defect noticed on earlier lot">Packaging or seal defect noticed on earlier lot</option>
                  <option value="Specific dosage formulation required for pediatric patient">Specific dosage formulation required for pediatric patient</option>
                  <option value="Doctor prescribed specific manufacturer / brand formulation">Doctor prescribed specific manufacturer / brand formulation</option>
                  <option value="Earlier batch reserved for confirmed inpatient surgery">Earlier batch reserved for confirmed inpatient surgery</option>
                </select>
              </div>
            </div>
          )}

          {/* Quantity & Ward / Dispensing Point */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {t.quantity} *
              </label>
              <input
                type="number"
                min="1"
                max={currentBatch?.quantityOnHand || 999}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 0))}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
              {currentBatch && (
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  Max available: {currentBatch.quantityOnHand}
                </span>
              )}
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {t.department} *
              </label>
              <select
                value={departmentOrWard}
                onChange={(e) => setDepartmentOrWard(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="Outpatient Department (OPD) Pharmacy">Outpatient (OPD) Pharmacy</option>
                <option value="Opportunistic Infections (OI/ART) Clinic">Opportunistic Infections (OI) Clinic</option>
                <option value="Maternity / Labour Ward">Maternity / Labour Ward</option>
                <option value="Under-5 / Child Immunization Clinic">Under-5 Clinic</option>
                <option value="Female Inpatient Ward">Female Inpatient Ward</option>
                <option value="Male Inpatient Ward">Male Inpatient Ward</option>
                <option value="Emergency & Casualty Unit">Emergency & Casualty</option>
              </select>
            </div>
          </div>

          {/* Privacy Notice (Zimbabwe Data Protection Act 2021) */}
          <div className="bg-slate-100 rounded-lg p-2.5 flex items-center gap-2 text-[11px] text-slate-600">
            <Lock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span>
              <strong>Zimbabwe Data Protection Act (2021) Compliance:</strong> Patient personal identifiers (PII) are not collected. This transaction tracks commodity movement and batch depletion only.
            </span>
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
              disabled={batches.length === 0}
              className="px-5 py-2 bg-blue-700 hover:bg-blue-800 disabled:bg-slate-300 text-white font-bold rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              {t.submit}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
