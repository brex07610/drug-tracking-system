/**
 * MoHCC Zimbabwe Drug Tracking System (DTS-Zim)
 * Header Navigation, User Role Switcher, Online/Offline Toggle, Language Selector
 */

import React, { useState } from 'react';
import {
  ShieldAlert,
  Wifi,
  WifiOff,
  RefreshCw,
  UserCheck,
  Globe,
  Layers,
  Smartphone,
  BarChart3,
  Truck,
  BookOpen,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { UserRole, Language, UserProfile } from '../types/index.ts';
import { storageService } from '../services/storageService.ts';
import { TRANSLATIONS } from '../services/translations.ts';
import { SAMPLE_USERS } from '../data/mockDatabase.ts';

interface HeaderProps {
  currentTab: 'mobile' | 'dashboard' | 'natpharm' | 'blueprint';
  setCurrentTab: (tab: 'mobile' | 'dashboard' | 'natpharm' | 'blueprint') => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  currentUser: UserProfile;
  setCurrentUser: (user: UserProfile) => void;
  isOnline: boolean;
  pendingCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  language,
  setLanguage,
  currentUser,
  setCurrentUser,
  isOnline,
  pendingCount
}) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);
  const t = TRANSLATIONS[language];

  const handleSync = async () => {
    setIsSyncing(true);
    const result = await storageService.syncOfflineQueue();
    setIsSyncing(false);
    setSyncFeedback(`Synced ${result.syncedCount} queued transactions to national ledger`);
    setTimeout(() => setSyncFeedback(null), 4000);
  };

  const handleToggleOnline = () => {
    storageService.toggleOnlineStatus();
  };

  return (
    <header id="mohcc-main-header" className="bg-slate-900 text-slate-100 border-b border-slate-800 sticky top-0 z-50">
      {/* Top Governmental Bar */}
      <div className="bg-emerald-900/90 px-4 py-1.5 border-b border-emerald-800 text-xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {/* Zimbabwe Flag Accent Bars */}
          <div className="flex h-3.5 w-6 rounded-xs overflow-hidden shadow-xs border border-white/20">
            <div className="w-1/5 bg-emerald-600"></div>
            <div className="w-1/5 bg-amber-400"></div>
            <div className="w-1/5 bg-red-600"></div>
            <div className="w-1/5 bg-black"></div>
            <div className="w-1/5 bg-red-600"></div>
          </div>
          <span className="font-semibold text-emerald-100 tracking-wide">
            GOVERNMENT OF ZIMBABWE · MINISTRY OF HEALTH AND CHILD CARE (MoHCC)
          </span>
          <span className="hidden md:inline-block text-emerald-300/70">|</span>
          <span className="hidden md:inline-block text-emerald-200 text-[11px]">
            National Drug Tracking & FEFO Traceability System (DTS-Zim)
          </span>
        </div>

        {/* Sync & Connectivity status */}
        <div className="flex items-center gap-3">
          <button
            id="toggle-connectivity-btn"
            onClick={handleToggleOnline}
            className={`px-2.5 py-0.5 rounded-full flex items-center gap-1.5 font-medium transition-colors text-[11px] ${
              isOnline
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
            }`}
            title="Click to simulate network drop / reconnect"
          >
            {isOnline ? (
              <>
                <Wifi className="w-3 h-3 text-emerald-400" />
                <span>{t.online}</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3 text-amber-400 animate-pulse" />
                <span>{t.offline}</span>
              </>
            )}
          </button>

          {pendingCount > 0 && (
            <button
              id="sync-now-btn"
              onClick={handleSync}
              disabled={!isOnline || isSyncing}
              className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-2.5 py-0.5 rounded text-[11px] flex items-center gap-1 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{pendingCount} {t.pendingSync}</span>
            </button>
          )}

          {/* Language Switcher */}
          <div className="flex items-center gap-1 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
            <Globe className="w-3 h-3 text-slate-400" />
            <select
              id="language-select"
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              aria-label="Select System Language"
              className="bg-transparent text-slate-200 text-[11px] focus:outline-none cursor-pointer"
            >
              <option value={Language.ENGLISH} className="bg-slate-900 text-white">English</option>
              <option value={Language.SHONA} className="bg-slate-900 text-white">chiShona</option>
              <option value={Language.NDEBELE} className="bg-slate-900 text-white">isiNdebele</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-600 to-teal-800 flex items-center justify-center shadow-md border border-emerald-500/30 text-white">
            <ShieldAlert className="w-5 h-5 text-emerald-200" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-white tracking-tight leading-none">
                DTS-Zim
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded">
                eLMIS Last-Mile
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 hidden sm:block">
              {t.subTitle}
            </p>
          </div>
        </div>

        {/* View Switchers */}
        <nav className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-lg border border-slate-800 text-xs">
          <button
            id="nav-mobile-view"
            onClick={() => setCurrentTab('mobile')}
            className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 font-medium transition-all ${
              currentTab === 'mobile'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>{t.mobileAppView}</span>
          </button>

          <button
            id="nav-dashboard-view"
            onClick={() => setCurrentTab('dashboard')}
            className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 font-medium transition-all ${
              currentTab === 'dashboard'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>{t.adminDashboardView}</span>
          </button>

          <button
            id="nav-natpharm-view"
            onClick={() => setCurrentTab('natpharm')}
            className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 font-medium transition-all ${
              currentTab === 'natpharm'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>{t.natpharmView}</span>
          </button>

          <button
            id="nav-blueprint-view"
            onClick={() => setCurrentTab('blueprint')}
            className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 font-medium transition-all ${
              currentTab === 'blueprint'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>{t.systemSpecs}</span>
          </button>
        </nav>

        {/* User Role Switcher */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-700">
            <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
            <div className="flex flex-col">
              <label htmlFor="user-profile-select" className="text-[10px] text-slate-400 leading-none">
                {t.selectRole}
              </label>
              <select
                id="user-profile-select"
                value={currentUser.id}
                onChange={(e) => {
                  const found = SAMPLE_USERS.find(u => u.id === e.target.value);
                  if (found) {
                    storageService.setCurrentUser(found);
                    setCurrentUser(found);
                  }
                }}
                className="bg-transparent text-white font-medium text-xs focus:outline-none cursor-pointer pt-0.5"
              >
                {SAMPLE_USERS.map(user => (
                  <option key={user.id} value={user.id} className="bg-slate-900 text-white">
                    {user.name} ({user.facilityName} - {user.role.replace('_', ' ')})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Sync Toast Notification */}
      {syncFeedback && (
        <div className="bg-emerald-500 text-slate-950 px-4 py-1.5 text-xs font-semibold flex items-center justify-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4" />
          <span>{syncFeedback}</span>
        </div>
      )}
    </header>
  );
};
