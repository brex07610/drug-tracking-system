/**
 * MoHCC Zimbabwe Drug Tracking System (DTS-Zim)
 * Main Application Component
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header.tsx';
import { NurseDashboard } from './components/MobileApp/NurseDashboard.tsx';
import { ReceiveStockModal } from './components/MobileApp/ReceiveStockModal.tsx';
import { DispenseModal } from './components/MobileApp/DispenseModal.tsx';
import { StockAuditModal } from './components/MobileApp/StockAuditModal.tsx';
import { AlertsView } from './components/MobileApp/AlertsView.tsx';
import { RedistributionModal } from './components/MobileApp/RedistributionModal.tsx';
import { OfflineQueueModal } from './components/MobileApp/OfflineQueueModal.tsx';
import { NationalOverview } from './components/Dashboard/NationalOverview.tsx';
import { StockOutPredictor } from './components/Dashboard/StockOutPredictor.tsx';
import { RedistributionMatcher } from './components/Dashboard/RedistributionMatcher.tsx';
import { WastageAnalytics } from './components/Dashboard/WastageAnalytics.tsx';
import { AuditTrailView } from './components/Dashboard/AuditTrailView.tsx';
import { NatPharmConsole } from './components/NatPharm/NatPharmConsole.tsx';
import { SystemBlueprintModal } from './components/Blueprint/SystemBlueprintModal.tsx';

import { storageService } from './services/storageService.ts';
import {
  Language,
  UserProfile,
  Facility,
  DrugCommodity,
  DrugBatch,
  StockMovementEvent,
  StockAlert,
  RedistributionRequest
} from './types/index.ts';
import {
  BarChart3,
  TrendingDown,
  ArrowRightLeft,
  DollarSign,
  ShieldCheck,
  Building2,
  Calendar,
  Smartphone
} from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'mobile' | 'dashboard' | 'natpharm' | 'blueprint'>('mobile');
  const [dashboardSubTab, setDashboardSubTab] = useState<'overview' | 'predictor' | 'redistribution' | 'wastage' | 'audit'>('overview');
  const [language, setLanguage] = useState<Language>(Language.ENGLISH);
  const [currentUser, setCurrentUser] = useState<UserProfile>(storageService.getCurrentUser());
  const [currentFacility, setCurrentFacility] = useState<Facility>(storageService.getCurrentFacility());

  // Reactive state from storageService
  const [facilities, setFacilities] = useState<Facility[]>(storageService.getFacilities());
  const [commodities, setCommodities] = useState<DrugCommodity[]>(storageService.getCommodities());
  const [batches, setBatches] = useState<DrugBatch[]>(storageService.getBatches());
  const [ledger, setLedger] = useState<StockMovementEvent[]>(storageService.getLedger());
  const [alerts, setAlerts] = useState<StockAlert[]>(storageService.getAlerts());
  const [redistributions, setRedistributions] = useState<RedistributionRequest[]>(storageService.getRedistributionRequests());
  const [offlineQueue, setOfflineQueue] = useState<StockMovementEvent[]>(storageService.getOfflineQueue());
  const [isOnline, setIsOnline] = useState<boolean>(storageService.isSystemOnline());

  // Mobile Modals State
  const [isReceiveOpen, setIsReceiveOpen] = useState(false);
  const [isDispenseOpen, setIsDispenseOpen] = useState(false);
  const [isAuditOpen, setIsAuditOpen] = useState(false);
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [isRedistributionOpen, setIsRedistributionOpen] = useState(false);
  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const [activeCommodityForModal, setActiveCommodityForModal] = useState<string | undefined>(undefined);

  // Subscribe to storageService updates
  useEffect(() => {
    const unsubscribe = storageService.subscribe(() => {
      setFacilities([...storageService.getFacilities()]);
      setCommodities([...storageService.getCommodities()]);
      setBatches([...storageService.getBatches()]);
      setLedger([...storageService.getLedger()]);
      setAlerts([...storageService.getAlerts()]);
      setRedistributions([...storageService.getRedistributionRequests()]);
      setOfflineQueue([...storageService.getOfflineQueue()]);
      setIsOnline(storageService.isSystemOnline());
      setCurrentUser(storageService.getCurrentUser());
      setCurrentFacility(storageService.getCurrentFacility());
    });
    return () => unsubscribe();
  }, []);

  const handleOpenReceive = (commodityId?: string) => {
    setActiveCommodityForModal(commodityId);
    setIsReceiveOpen(true);
  };

  const handleOpenDispense = (commodityId?: string) => {
    setActiveCommodityForModal(commodityId);
    setIsDispenseOpen(true);
  };

  const handleOpenAudit = (commodityId?: string) => {
    setActiveCommodityForModal(commodityId);
    setIsAuditOpen(true);
  };

  const handleOpenRedistribution = (commodityId?: string) => {
    setActiveCommodityForModal(commodityId);
    setIsRedistributionOpen(true);
  };

  return (
    <div id="mohcc-app-root" className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900">
      {/* Universal Header */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        language={language}
        setLanguage={setLanguage}
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
        isOnline={isOnline}
        pendingCount={offlineQueue.length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 space-y-6">
        {/* VIEW 1: Mobile Nurse / Clinic Dashboard */}
        {currentTab === 'mobile' && (
          <div className="space-y-4">
            {/* Context Switcher Banner */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-700" />
                <span className="font-semibold text-slate-700">Active Health Facility:</span>
                <select
                  value={currentFacility.id}
                  onChange={(e) => {
                    const f = facilities.find(fac => fac.id === e.target.value);
                    if (f) {
                      setCurrentFacility(f);
                      storageService.setCurrentFacility(f);
                    }
                  }}
                  className="bg-slate-50 border border-slate-300 rounded-md px-2.5 py-1 font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
                >
                  {facilities.map(f => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.district}, {f.province}) — {f.type}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 text-slate-500">
                <span className="text-[11px]">
                  Logged in as: <strong className="text-slate-800">{currentUser.name}</strong> ({currentUser.role.replace('_', ' ')})
                </span>
              </div>
            </div>

            {/* Mobile App Canvas */}
            <NurseDashboard
              currentFacility={currentFacility}
              commodities={commodities}
              batches={batches}
              currentUser={currentUser}
              isOnline={isOnline}
              pendingQueueCount={offlineQueue.length}
              alerts={alerts}
              language={language}
              onOpenReceive={handleOpenReceive}
              onOpenDispense={handleOpenDispense}
              onOpenAudit={handleOpenAudit}
              onOpenAlerts={() => setIsAlertsOpen(true)}
              onOpenRedistribution={handleOpenRedistribution}
              onOpenQueue={() => setIsQueueOpen(true)}
            />
          </div>
        )}

        {/* VIEW 2: National & District Analytics Web Dashboard */}
        {currentTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Dashboard Sub-navigation Tabs */}
            <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-2">
              <button
                onClick={() => setDashboardSubTab('overview')}
                className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  dashboardSubTab === 'overview'
                    ? 'bg-emerald-700 text-white shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>10-Province Stock Surveillance Heatmap</span>
              </button>

              <button
                onClick={() => setDashboardSubTab('predictor')}
                className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  dashboardSubTab === 'predictor'
                    ? 'bg-emerald-700 text-white shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <TrendingDown className="w-3.5 h-3.5" />
                <span>Stock-Out Risk Predictor (MOS vs AMC)</span>
              </button>

              <button
                onClick={() => setDashboardSubTab('redistribution')}
                className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  dashboardSubTab === 'redistribution'
                    ? 'bg-emerald-700 text-white shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
                <span>eLMIS Imbalance Redistribution Matcher</span>
              </button>

              <button
                onClick={() => setDashboardSubTab('wastage')}
                className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  dashboardSubTab === 'wastage'
                    ? 'bg-emerald-700 text-white shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>Wastage & FEFO Cost Savings</span>
              </button>

              <button
                onClick={() => setDashboardSubTab('audit')}
                className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  dashboardSubTab === 'audit'
                    ? 'bg-emerald-700 text-white shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Cryptographic Audit Ledger</span>
              </button>
            </div>

            {/* Render Subtab Component */}
            {dashboardSubTab === 'overview' && (
              <NationalOverview
                facilities={facilities}
                commodities={commodities}
                batches={batches}
                language={language}
                onSelectFacilityForMobile={(fac) => {
                  setCurrentFacility(fac);
                  storageService.setCurrentFacility(fac);
                  setCurrentTab('mobile');
                }}
              />
            )}

            {dashboardSubTab === 'predictor' && (
              <StockOutPredictor
                facilities={facilities}
                commodities={commodities}
              />
            )}

            {dashboardSubTab === 'redistribution' && (
              <RedistributionMatcher
                facilities={facilities}
                commodities={commodities}
                redistributions={redistributions}
              />
            )}

            {dashboardSubTab === 'wastage' && (
              <WastageAnalytics
                commodities={commodities}
                batches={batches}
              />
            )}

            {dashboardSubTab === 'audit' && (
              <AuditTrailView
                ledger={ledger}
                facilities={facilities}
                commodities={commodities}
              />
            )}
          </div>
        )}

        {/* VIEW 3: NatPharm Dispatch Console */}
        {currentTab === 'natpharm' && (
          <NatPharmConsole
            facilities={facilities}
            commodities={commodities}
          />
        )}

        {/* VIEW 4: Architecture Blueprint, DDL & Assumptions */}
        {currentTab === 'blueprint' && (
          <SystemBlueprintModal />
        )}
      </main>

      {/* MODALS */}
      <ReceiveStockModal
        isOpen={isReceiveOpen}
        onClose={() => setIsReceiveOpen(false)}
        currentFacility={currentFacility}
        commodities={commodities}
        currentUser={currentUser}
        initialCommodityId={activeCommodityForModal}
        language={language}
      />

      <DispenseModal
        isOpen={isDispenseOpen}
        onClose={() => setIsDispenseOpen(false)}
        currentFacility={currentFacility}
        commodities={commodities}
        currentUser={currentUser}
        initialCommodityId={activeCommodityForModal}
        language={language}
      />

      <StockAuditModal
        isOpen={isAuditOpen}
        onClose={() => setIsAuditOpen(false)}
        currentFacility={currentFacility}
        commodities={commodities}
        currentUser={currentUser}
        initialCommodityId={activeCommodityForModal}
        language={language}
      />

      <AlertsView
        isOpen={isAlertsOpen}
        onClose={() => setIsAlertsOpen(false)}
        alerts={alerts}
        currentFacility={currentFacility}
        language={language}
        onOpenRedistribution={(commodityId) => {
          setActiveCommodityForModal(commodityId);
          setIsRedistributionOpen(true);
        }}
      />

      <RedistributionModal
        isOpen={isRedistributionOpen}
        onClose={() => setIsRedistributionOpen(false)}
        currentFacility={currentFacility}
        facilities={facilities}
        commodities={commodities}
        currentUser={currentUser}
        initialCommodityId={activeCommodityForModal}
        language={language}
      />

      <OfflineQueueModal
        isOpen={isQueueOpen}
        onClose={() => setIsQueueOpen(false)}
        queue={offlineQueue}
        isOnline={isOnline}
        currentFacility={currentFacility}
        language={language}
      />

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 text-xs py-4 px-6 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div>
            <span className="font-bold text-slate-200">Ministry of Health and Child Care (MoHCC)</span>
            <span className="mx-2 text-slate-600">·</span>
            <span>Directorate of Pharmacy Services & Logistics</span>
          </div>
          <div className="text-[11px] text-slate-500">
            Zimbabwe Data Protection Act (2021) Compliant · Zero Patient PII · Offline-First Event Ledger
          </div>
        </div>
      </footer>
    </div>
  );
}
