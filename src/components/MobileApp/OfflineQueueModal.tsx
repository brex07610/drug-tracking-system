/**
 * MoHCC Zimbabwe Drug Tracking System (DTS-Zim)
 * Offline Sync Queue & Connectivity Manager
 */

import React, { useState } from 'react';
import {
  X,
  CloudOff,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Database,
  ShieldCheck,
  Zap,
  Wifi,
  WifiOff
} from 'lucide-react';
import {
  StockMovementEvent,
  Language,
  Facility
} from '../../types/index.ts';
import { storageService } from '../../services/storageService.ts';
import { TRANSLATIONS } from '../../services/translations.ts';

interface OfflineQueueModalProps {
  isOpen: boolean;
  onClose: () => void;
  queue: StockMovementEvent[];
  isOnline: boolean;
  currentFacility: Facility;
  language: Language;
}

export const OfflineQueueModal: React.FC<OfflineQueueModalProps> = ({
  isOpen,
  onClose,
  queue,
  isOnline,
  currentFacility,
  language
}) => {
  const t = TRANSLATIONS[language];
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);
  const [dataLiteMode, setDataLiteMode] = useState(true);

  if (!isOpen) return null;

  const handleSyncNow = async () => {
    setIsSyncing(true);
    const result = await storageService.syncOfflineQueue();
    setIsSyncing(false);
    setSyncFeedback(`Successfully synchronized ${result.syncedCount} queued events to national central ledger.`);
    setTimeout(() => {
      setSyncFeedback(null);
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-scaleIn">
        {/* Header */}
        <div className="bg-slate-800 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center">
              <CloudOff className="w-4 h-4 text-slate-200" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-none">
                {t.offlineQueue}
              </h3>
              <span className="text-xs text-slate-300 mt-0.5 block">
                {currentFacility.name} · Local Storage & Sync Manager
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-300 hover:text-white p-1 rounded-md hover:bg-slate-700/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Bar */}
        <div className="bg-slate-100 px-5 py-3 border-b border-slate-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            {isOnline ? (
              <span className="flex items-center gap-1.5 text-emerald-700 font-bold">
                <Wifi className="w-4 h-4" /> Connected to National Gateway
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-amber-700 font-bold">
                <WifiOff className="w-4 h-4 animate-pulse" /> Operating Offline (No Connection)
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-600">Pending:</span>
            <span className="px-2 py-0.5 bg-amber-200 text-amber-900 rounded-full font-bold">
              {queue.length}
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {syncFeedback && (
            <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg flex items-center gap-2 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{syncFeedback}</span>
            </div>
          )}

          {/* Architecture info callout */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5 space-y-2 text-blue-900">
            <div className="flex items-center gap-2 font-bold text-blue-950">
              <ShieldCheck className="w-4 h-4 text-blue-700" />
              <span>Event-Sourcing Conflict Resolution</span>
            </div>
            <p className="text-[11px] text-blue-800 leading-relaxed">
              DTS-Zim implements an append-only stock movement log. Instead of overwriting global stock balances, every transaction (dispense, receipt, adjustment) is recorded as an immutable event with a cryptographic signature. When reconnecting, events replay seamlessly without overwriting transactions made by other clinics.
            </p>
          </div>

          {/* Data-Lite Mode Toggle */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-600" />
              <div>
                <span className="font-bold text-slate-900 block">Data-Lite 2G/EDGE Mode</span>
                <span className="text-[10px] text-slate-500">
                  Compress payloads and defer photo uploads on rural low-bandwidth networks
                </span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={dataLiteMode}
              onChange={(e) => setDataLiteMode(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
            />
          </div>

          {/* Queue Items */}
          <div>
            <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] block mb-2">
              Locally Buffered Transactions
            </span>

            {queue.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 text-slate-500">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                <p className="font-semibold text-slate-800 text-sm">All local records are synchronized</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Transactions performed while offline will be staged here automatically.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {queue.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">
                          {item.transactionType.replace(/_/g, ' ')}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500 bg-slate-200 px-1.5 py-0.2 rounded">
                          Batch: {item.batchNumber}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-2">
                        <span>Quantity: <strong className="text-slate-800">{item.quantityChange}</strong></span>
                        <span>·</span>
                        <span>{new Date(item.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <div className="text-[9px] font-mono text-slate-400 mt-0.5 truncate max-w-xs">
                        {item.sha256Signature}
                      </div>
                    </div>

                    <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded uppercase">
                      Staged
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={() => storageService.toggleOnlineStatus()}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 underline"
          >
            {isOnline ? 'Simulate Disconnect' : 'Simulate Reconnect'}
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg font-semibold transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleSyncNow}
              disabled={queue.length === 0 || !isOnline || isSyncing}
              className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-300 text-white font-bold rounded-lg shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{t.syncNow}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
