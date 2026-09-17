/**
 * MoHCC Zimbabwe Drug Tracking System (DTS-Zim)
 * NatPharm Central Medical Store Logistics & Dispatch Console
 */

import React, { useState } from 'react';
import {
  Truck,
  Package,
  Send,
  CheckCircle2,
  AlertCircle,
  Building2,
  Thermometer,
  ShieldCheck,
  FileSpreadsheet
} from 'lucide-react';
import {
  Facility,
  DrugCommodity,
  ColdChainRequirement
} from '../../types/index.ts';
import { storageService } from '../../services/storageService.ts';

interface NatPharmConsoleProps {
  facilities: Facility[];
  commodities: DrugCommodity[];
}

export const NatPharmConsole: React.FC<NatPharmConsoleProps> = ({
  facilities,
  commodities
}) => {
  const [destFacilityId, setDestFacilityId] = useState(facilities[0]?.id || '');
  const [commodityId, setCommodityId] = useState(commodities[0]?.id || '');
  const [batchNumber, setBatchNumber] = useState(`NAT-2026-TLD-${Math.floor(10 + Math.random() * 89)}`);
  const [manufactureDate, setManufactureDate] = useState('2025-02-10');
  const [expiryDate, setExpiryDate] = useState('2028-02-28');
  const [quantity, setQuantity] = useState<number>(300);
  const [waybillNumber, setWaybillNumber] = useState(`WB-NAT-HAR-${Math.floor(1000 + Math.random() * 9000)}`);
  const [coldChainVehicle, setColdChainVehicle] = useState('NatPharm ThermoKing Refrigerated Truck (AEG-4421)');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const selectedComm = commodities.find(c => c.id === commodityId);
  const isColdChain = selectedComm?.coldChain !== ColdChainRequirement.NONE;

  const handleDispatch = (e: React.FormEvent) => {
    e.preventDefault();

    try {
      storageService.dispatchFromNatPharm({
        destinationFacilityId: destFacilityId,
        commodityId,
        batchNumber: batchNumber.toUpperCase().trim(),
        manufactureDate,
        expiryDate,
        quantity: Number(quantity),
        waybillNumber,
        coldChainVehicleReg: isColdChain ? coldChainVehicle : undefined,
        dispatcherName: 'Director K. Gwatidzo (NatPharm Dispatch Operations)'
      });

      const dest = facilities.find(f => f.id === destFacilityId);
      setSuccessMessage(`Consignment of ${quantity} units (${batchNumber}) successfully dispatched from NatPharm Central Hub to ${dest?.name}. Waybill: ${waybillNumber}`);

      // Generate new next waybill #
      setWaybillNumber(`WB-NAT-HAR-${Math.floor(1000 + Math.random() * 9000)}`);
      setBatchNumber(`NAT-2026-${Math.floor(100 + Math.random() * 899)}`);

      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err: any) {
      alert(err.message || 'Dispatch error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-emerald-950 text-white p-5 rounded-xl border border-emerald-900/50 shadow-md">
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase px-2.5 py-0.5 bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 rounded font-bold">
            National Medical Distributor
          </span>
          <span className="text-xs text-slate-400">· Zimbabwe Informed Push (ZIP) Hub</span>
        </div>
        <h3 className="font-black text-xl text-white mt-1">
          NatPharm Central Warehouse & Dispatch Console
        </h3>
        <p className="text-xs text-slate-300 mt-1 max-w-2xl">
          Create verified lot consignments, allocate batches to district and provincial facilities, record temperature compliance for cold-chain medicines, and generate official MoHCC waybill manifests.
        </p>
      </div>

      {successMessage && (
        <div className="p-4 bg-emerald-50 text-emerald-900 rounded-xl border border-emerald-200 flex items-center gap-3 text-xs font-semibold shadow-xs animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Dispatch Creation Form */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-4 border-b border-slate-200 pb-3">
          <Truck className="w-5 h-5 text-emerald-700" />
          <h4 className="font-bold text-slate-900 text-sm">
            Issue New Dispatch Consignment (ZIP Delivery)
          </h4>
        </div>

        <form onSubmit={handleDispatch} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Destination Facility */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Destination Facility / District Store *
              </label>
              <select
                value={destFacilityId}
                onChange={(e) => setDestFacilityId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                {facilities.map(f => (
                  <option key={f.id} value={f.id}>
                    {f.name} ({f.district}, {f.province})
                  </option>
                ))}
              </select>
            </div>

            {/* Commodity */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Essential Medicine (ZEML) *
              </label>
              <select
                value={commodityId}
                onChange={(e) => setCommodityId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                {commodities.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.code} — {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Batch Number */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                NatPharm Batch / Lot Number *
              </label>
              <input
                type="text"
                value={batchNumber}
                onChange={(e) => setBatchNumber(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                required
              />
            </div>

            {/* Quantity */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Quantity to Dispatch (Packs / Bottles / Vials) *
              </label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 0))}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                required
              />
            </div>

            {/* Waybill */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Waybill Manifest Number *
              </label>
              <input
                type="text"
                value={waybillNumber}
                onChange={(e) => setWaybillNumber(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs font-mono text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Dates */}
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
                Expiry Date (FEFO Index) *
              </label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Cold Chain Vehicle Assignment */}
          {isColdChain && (
            <div className="p-3 bg-cyan-50 border border-cyan-200 rounded-xl space-y-1.5 text-cyan-950">
              <div className="flex items-center gap-1.5 font-bold text-cyan-900">
                <Thermometer className="w-4 h-4 text-cyan-700" />
                <span>Cold Chain Protocol Required (2°C - 8°C Monitored Logistics)</span>
              </div>
              <input
                type="text"
                value={coldChainVehicle}
                onChange={(e) => setColdChainVehicle(e.target.value)}
                className="w-full bg-white border border-cyan-300 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="Logistics Vehicle & Datalogger Registration"
              />
            </div>
          )}

          {/* Submit */}
          <div className="pt-3 border-t border-slate-200 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg shadow-sm transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Confirm & Dispatch Consignment</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
