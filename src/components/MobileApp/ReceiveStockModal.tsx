/**
 * MoHCC Zimbabwe Drug Tracking System (DTS-Zim)
 * Receive Stock Modal with Barcode/QR Scanning & Delivery Note Capture
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  QrCode,
  Camera,
  CheckCircle2,
  AlertCircle,
  Truck,
  Upload,
  Sparkles,
  Barcode
} from 'lucide-react';
import {
  Facility,
  DrugCommodity,
  UserRole,
  UserProfile,
  Language
} from '../../types/index.ts';
import { storageService } from '../../services/storageService.ts';
import { TRANSLATIONS } from '../../services/translations.ts';

interface ReceiveStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentFacility: Facility;
  commodities: DrugCommodity[];
  currentUser: UserProfile;
  initialCommodityId?: string;
  language: Language;
}

export const ReceiveStockModal: React.FC<ReceiveStockModalProps> = ({
  isOpen,
  onClose,
  currentFacility,
  commodities,
  currentUser,
  initialCommodityId,
  language
}) => {
  const t = TRANSLATIONS[language];

  const [selectedCommodityId, setSelectedCommodityId] = useState(initialCommodityId || commodities[0]?.id || '');
  const [batchNumber, setBatchNumber] = useState('');
  const [manufactureDate, setManufactureDate] = useState('2025-01-15');
  const [expiryDate, setExpiryDate] = useState('2027-06-30');
  const [quantity, setQuantity] = useState<number>(100);
  const [supplierOrSource, setSupplierOrSource] = useState('NatPharm Central Hub (Harare)');
  const [deliveryNoteRef, setDeliveryNoteRef] = useState(`WB-ZIM-${Math.floor(1000 + Math.random() * 9000)}`);
  const [storageBin, setStorageBin] = useState('Main Store Shelf A-1');
  const [isScanning, setIsScanning] = useState(false);
  const [scanDetected, setScanDetected] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (isOpen && initialCommodityId) {
      setSelectedCommodityId(initialCommodityId);
    }
  }, [isOpen, initialCommodityId]);

  if (!isOpen) return null;

  // Simulate scanning a real GS1 DataMatrix / Barcode on medicine packaging
  const handleSimulateScan = () => {
    setIsScanning(true);
    setScanDetected(false);
    setTimeout(() => {
      // Pick a realistic barcode from ZEML
      const sampleBatch = `NAT-${new Date().getFullYear()}-TLD-${Math.floor(10 + Math.random() * 89)}`;
      const sampleExpiry = '2027-11-30';
      setBatchNumber(sampleBatch);
      setExpiryDate(sampleExpiry);
      setQuantity(250);
      setDeliveryNoteRef(`NAT-DISP-${Math.floor(4000 + Math.random() * 5000)}`);
      setIsScanning(false);
      setScanDetected(true);
    }, 1200);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!batchNumber.trim()) {
      setFeedback({ type: 'error', message: 'Batch number is required.' });
      return;
    }
    if (quantity <= 0) {
      setFeedback({ type: 'error', message: 'Quantity must be greater than 0.' });
      return;
    }
    if (!expiryDate) {
      setFeedback({ type: 'error', message: 'Expiry date is required for FEFO tracking.' });
      return;
    }

    try {
      storageService.receiveStock({
        facilityId: currentFacility.id,
        commodityId: selectedCommodityId,
        batchNumber: batchNumber.toUpperCase().trim(),
        manufactureDate,
        expiryDate,
        quantity: Number(quantity),
        supplierOrSource,
        deliveryNoteReference: deliveryNoteRef,
        storageBin,
        performedByUserId: currentUser.id,
        performedByUserName: currentUser.name,
        userRole: currentUser.role
      });

      setFeedback({
        type: 'success',
        message: `Stock successfully logged into facility ledger under FEFO batch ${batchNumber.toUpperCase().trim()}`
      });

      setTimeout(() => {
        setFeedback(null);
        onClose();
      }, 1500);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Error recording stock receipt' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-scaleIn">
        {/* Header */}
        <div className="bg-emerald-800 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-700 flex items-center justify-center">
              <Truck className="w-4 h-4 text-emerald-200" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-none">
                {t.receiveStock}
              </h3>
              <span className="text-xs text-emerald-200 mt-0.5 block">
                {currentFacility.name} · Chain of Custody Intake
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-emerald-200 hover:text-white p-1 rounded-md hover:bg-emerald-700/50"
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
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              )}
              <span>{feedback.message}</span>
            </div>
          )}

          {/* Barcode/QR Scanning Tool */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <Barcode className="w-4 h-4 text-emerald-700" />
                <span>Barcode / QR Scanner (GS1 DataMatrix)</span>
              </span>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                Low-Literacy Aid
              </span>
            </div>

            {isScanning ? (
              <div className="bg-slate-900 text-white rounded-lg p-6 text-center space-y-2 relative overflow-hidden">
                <div className="w-32 h-20 border-2 border-emerald-400 mx-auto rounded flex items-center justify-center relative animate-pulse">
                  <div className="w-full h-0.5 bg-red-500 shadow-md"></div>
                </div>
                <p className="text-xs text-emerald-300 font-mono">Reading package barcode...</p>
              </div>
            ) : scanDetected ? (
              <div className="bg-emerald-50 border border-emerald-300 rounded-lg p-2.5 flex items-center justify-between text-emerald-900">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="font-semibold">Barcode detected: {batchNumber}</span>
                </div>
                <button
                  type="button"
                  onClick={handleSimulateScan}
                  className="text-xs font-bold text-emerald-800 underline"
                >
                  Rescan
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSimulateScan}
                  className="flex-1 bg-white hover:bg-slate-100 text-slate-800 font-semibold py-2 px-3 border border-slate-300 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-2xs"
                >
                  <Camera className="w-4 h-4 text-emerald-700" />
                  <span>Scan Box / Carton Barcode</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setBatchNumber(`NAT-2025-${Math.floor(100 + Math.random() * 900)}`);
                    setExpiryDate('2027-12-31');
                  }}
                  className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-medium"
                  title="Auto-fill sample batch"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Commodity Selection */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              {t.selectCommodity} *
            </label>
            <select
              value={selectedCommodityId}
              onChange={(e) => setSelectedCommodityId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              {commodities.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} — {c.name} ({c.dosageForm})
                </option>
              ))}
            </select>
          </div>

          {/* Batch Number & Quantity */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {t.batchNumber} *
              </label>
              <input
                type="text"
                value={batchNumber}
                onChange={(e) => setBatchNumber(e.target.value)}
                placeholder="e.g. NAT-2025-TLD-14"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 font-mono uppercase focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {t.quantity} *
              </label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 0))}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Manufacture & Expiry Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Manufacture Date
              </label>
              <input
                type="date"
                value={manufactureDate}
                onChange={(e) => setManufactureDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {t.expiryDate} (FEFO Index) *
              </label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-900 font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Supplier & Delivery Note */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {t.receivedFrom}
              </label>
              <select
                value={supplierOrSource}
                onChange={(e) => setSupplierOrSource(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="NatPharm Central Hub (Harare)">NatPharm Central Hub (Harare)</option>
                <option value="NatPharm Bulawayo Regional Depot">NatPharm Bulawayo Regional Depot</option>
                <option value="NatPharm Mutare Regional Depot">NatPharm Mutare Regional Depot</option>
                <option value="District Medical Stores">District Medical Stores</option>
                <option value="Inter-Facility Redistribution">Inter-Facility Redistribution</option>
                <option value="Donor / Partner Consignment">Donor / Partner Consignment</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {t.deliveryNote} *
              </label>
              <input
                type="text"
                value={deliveryNoteRef}
                onChange={(e) => setDeliveryNoteRef(e.target.value)}
                placeholder="e.g. WB-ZIM-9481"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Storage Bin */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Storage Bin / Cold Chain Shelf
            </label>
            <input
              type="text"
              value={storageBin}
              onChange={(e) => setStorageBin(e.target.value)}
              placeholder="e.g. Pharmacy Store Shelf B-2 or Vaccine Fridge 1"
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Action Buttons */}
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
              className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              {t.submit}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
