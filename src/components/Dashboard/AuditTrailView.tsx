/**
 * MoHCC Zimbabwe Drug Tracking System (DTS-Zim)
 * Phase 8: Tamper-Evident Immutable Audit Log & Chain of Custody
 */

import React, { useState } from 'react';
import {
  ShieldCheck,
  Search,
  Filter,
  FileCheck,
  Download,
  AlertTriangle,
  UserCheck,
  Building2,
  Clock
} from 'lucide-react';
import {
  StockMovementEvent,
  Facility,
  DrugCommodity,
  UserRole
} from '../../types/index.ts';

interface AuditTrailViewProps {
  ledger: StockMovementEvent[];
  facilities: Facility[];
  commodities: DrugCommodity[];
}

export const AuditTrailView: React.FC<AuditTrailViewProps> = ({
  ledger,
  facilities,
  commodities
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');

  const filteredEvents = ledger.filter(event => {
    const matchesSearch =
      event.batchNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.performedByUserName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.sha256Signature.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'ALL' || event.transactionType === filterType;
    return matchesSearch && matchesType;
  });

  const handleExportAuditCsv = () => {
    const headers = [
      'Event_ID',
      'Timestamp_UTC',
      'Facility_ID',
      'Facility_Name',
      'Commodity_Code',
      'Commodity_Name',
      'Batch_Number',
      'Transaction_Type',
      'Quantity_Change',
      'Balance_After',
      'User_ID',
      'User_Name',
      'User_Role',
      'Department_Ward',
      'FEFO_Overridden',
      'FEFO_Override_Reason',
      'Cryptographic_SHA256_Signature'
    ];

    const rows = ledger.map(evt => {
      const fac = facilities.find(f => f.id === evt.facilityId);
      const comm = commodities.find(c => c.id === evt.commodityId);
      return [
        evt.id,
        evt.timestamp,
        evt.facilityId,
        `"${fac?.name || ''}"`,
        comm?.code || '',
        `"${comm?.name || ''}"`,
        evt.batchNumber,
        evt.transactionType,
        evt.quantityChange,
        evt.balanceAfter,
        evt.performedByUserId,
        `"${evt.performedByUserName}"`,
        evt.userRole,
        `"${evt.departmentOrWard || ''}"`,
        evt.fefoOverridden ? 'YES' : 'NO',
        `"${evt.fefoOverrideReason || ''}"`,
        evt.sha256Signature
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `MoHCC_DTS_Zim_Audit_Log_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded font-bold">
              Government Compliance · Zimbabwe Data Protection Act (2021)
            </span>
          </div>
          <h3 className="font-bold text-slate-900 text-lg mt-1">
            Tamper-Evident Stock Ledger & Chain of Custody
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Immutable, append-only transaction history. Each event is recorded with cryptographic checksum, handler credentials, batch identifier, and FEFO audit trail.
          </p>
        </div>

        <button
          onClick={handleExportAuditCsv}
          className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2.5 rounded-lg text-xs flex items-center gap-2 shadow-xs transition-colors cursor-pointer shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>Export Audit Trail (CSV)</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-transparent text-slate-800 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Transaction Types</option>
              <option value="DISPENSE_PATIENT">Dispense to Patient</option>
              <option value="RECEIPT_FROM_NATPHARM">Receipt from NatPharm</option>
              <option value="ISSUE_TO_WARD">Issue to Ward</option>
              <option value="ADJUSTMENT_STOCKTAKE">Physical Stocktake Adjustment</option>
              <option value="RECEIPT_REDISTRIBUTION">Inter-Facility Redistribution</option>
            </select>
          </div>
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search batch, staff name, or SHA hash..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <th className="p-3">Timestamp (UTC)</th>
                <th className="p-3">Transaction</th>
                <th className="p-3">Facility</th>
                <th className="p-3">Commodity & Batch</th>
                <th className="p-3 text-center">Qty Change</th>
                <th className="p-3 text-center">Bal After</th>
                <th className="p-3">Handler / Staff</th>
                <th className="p-3">FEFO Status</th>
                <th className="p-3">Cryptographic Signature</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEvents.map(evt => {
                const fac = facilities.find(f => f.id === evt.facilityId);
                const comm = commodities.find(c => c.id === evt.commodityId);
                const isDeduction = evt.quantityChange < 0;

                return (
                  <tr key={evt.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                      {new Date(evt.timestamp).toLocaleString()}
                    </td>
                    <td className="p-3">
                      <span className="font-bold text-slate-900 block">
                        {evt.transactionType.replace(/_/g, ' ')}
                      </span>
                      {evt.departmentOrWard && (
                        <span className="text-[10px] text-slate-500">
                          {evt.departmentOrWard}
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-slate-800 font-medium">
                      {fac?.name || evt.facilityId}
                    </td>
                    <td className="p-3">
                      <span className="font-semibold text-slate-900 block truncate max-w-[140px]">
                        {comm?.name || evt.commodityId}
                      </span>
                      <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-1 rounded">
                        Batch: {evt.batchNumber}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <span
                        className={`font-black px-2 py-0.5 rounded text-xs ${
                          isDeduction
                            ? 'bg-red-50 text-red-700'
                            : 'bg-emerald-50 text-emerald-700'
                        }`}
                      >
                        {evt.quantityChange > 0 ? `+${evt.quantityChange}` : evt.quantityChange}
                      </span>
                    </td>
                    <td className="p-3 text-center font-bold text-slate-800">
                      {evt.balanceAfter}
                    </td>
                    <td className="p-3">
                      <span className="font-semibold text-slate-900 block">
                        {evt.performedByUserName}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {evt.userRole.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-3">
                      {evt.fefoOverridden ? (
                        <div className="flex flex-col text-[10px] text-amber-800 font-bold bg-amber-50 p-1 rounded border border-amber-200">
                          <span>OVERRIDE</span>
                          <span className="font-normal text-amber-900 text-[9px] truncate max-w-[120px]" title={evt.fefoOverrideReason}>
                            {evt.fefoOverrideReason}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1 w-max">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          <span>FEFO OK</span>
                        </span>
                      )}
                    </td>
                    <td className="p-3 font-mono text-[10px] text-slate-400 truncate max-w-[130px]" title={evt.sha256Signature}>
                      {evt.sha256Signature}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
