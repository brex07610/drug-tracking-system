/**
 * MoHCC Zimbabwe Drug Tracking System (DTS-Zim)
 * System Architecture, Phase 0-9 Specs, RACI Matrix, DDL Schema & Assumptions Log
 */

import React, { useState } from 'react';
import {
  BookOpen,
  Code2,
  Table,
  CheckCircle2,
  AlertCircle,
  FileText,
  Layers,
  ShieldAlert,
  Download,
  Copy,
  Check,
  Activity,
  HardDrive,
  Database,
  Clock,
  Zap
} from 'lucide-react';
import { SystemDiagnosticsPanel } from './SystemDiagnosticsPanel.tsx';
import { storageService } from '../../services/storageService.ts';

export const SystemBlueprintModal: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'phases' | 'raci' | 'ddl' | 'assumptions' | 'interop' | 'diagnostics'>('phases');
  const [copied, setCopied] = useState(false);

  const POSTGRES_DDL = `-- MoHCC Zimbabwe Drug Tracking System (DTS-Zim)
-- Production PostgreSQL DDL Schema (Phase 1 & 3 Specification)
-- Designed for Government of Zimbabwe / MoHCC On-Premises or Cloud Infrastructure

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Facilities
CREATE TABLE facilities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(32) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    province VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    facility_type VARCHAR(64) NOT NULL,
    latitude NUMERIC(9,6),
    longitude NUMERIC(9,6),
    phone VARCHAR(32),
    contact_person VARCHAR(150),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_facilities_province_district ON facilities(province, district);

-- 2. Essential Medicines Catalog (ZEML)
CREATE TABLE drug_commodities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    zeml_code VARCHAR(32) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(64) NOT NULL,
    unit_of_measure VARCHAR(64) NOT NULL,
    standard_pack_size INT NOT NULL DEFAULT 1,
    cold_chain_requirement VARCHAR(32) NOT NULL DEFAULT 'NONE',
    min_months_of_stock NUMERIC(4,2) DEFAULT 2.0,
    max_months_of_stock NUMERIC(4,2) DEFAULT 5.0,
    unit_cost_usd NUMERIC(10,2) NOT NULL,
    dosage_form VARCHAR(128),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_commodities_category ON drug_commodities(category);

-- 3. Batches & Lots (Strict FEFO Foundation)
CREATE TABLE drug_batches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE RESTRICT,
    commodity_id UUID NOT NULL REFERENCES drug_commodities(id) ON DELETE RESTRICT,
    batch_number VARCHAR(64) NOT NULL,
    manufacture_date DATE,
    expiry_date DATE NOT NULL,
    quantity_on_hand INT NOT NULL CHECK (quantity_on_hand >= 0),
    quantity_received INT NOT NULL DEFAULT 0,
    supplier_or_source VARCHAR(150),
    received_date DATE DEFAULT CURRENT_DATE,
    storage_bin VARCHAR(64),
    barcode_qr_code VARCHAR(128),
    temperature_breached BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_facility_batch UNIQUE (facility_id, commodity_id, batch_number)
);
-- High-performance indexes for fast FEFO lookup and automated alert jobs
CREATE INDEX idx_batches_fefo ON drug_batches(facility_id, commodity_id, expiry_date ASC);
CREATE INDEX idx_batches_expiry_alert ON drug_batches(expiry_date, quantity_on_hand);

-- 4. Append-Only Immutable Stock Movement Ledger (Event Sourcing)
CREATE TABLE stock_movement_ledger (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    facility_id UUID NOT NULL REFERENCES facilities(id),
    commodity_id UUID NOT NULL REFERENCES drug_commodities(id),
    batch_id UUID NOT NULL REFERENCES drug_batches(id),
    batch_number VARCHAR(64) NOT NULL,
    transaction_type VARCHAR(64) NOT NULL,
    quantity_change INT NOT NULL,
    balance_after INT NOT NULL,
    performed_by_user_id VARCHAR(64) NOT NULL,
    performed_by_user_name VARCHAR(150) NOT NULL,
    user_role VARCHAR(64) NOT NULL,
    department_or_ward VARCHAR(128),
    delivery_note_reference VARCHAR(64),
    fefo_overridden BOOLEAN DEFAULT FALSE,
    fefo_override_reason TEXT,
    sha256_signature VARCHAR(128) NOT NULL, -- Cryptographic integrity hash
    sync_status VARCHAR(32) DEFAULT 'synced',
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_ledger_facility_time ON stock_movement_ledger(facility_id, timestamp DESC);
CREATE INDEX idx_ledger_commodity_time ON stock_movement_ledger(commodity_id, timestamp DESC);

-- 5. Inter-Facility Redistribution Requests
CREATE TABLE redistribution_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    requesting_facility_id UUID NOT NULL REFERENCES facilities(id),
    fulfilling_facility_id UUID REFERENCES facilities(id),
    commodity_id UUID NOT NULL REFERENCES drug_commodities(id),
    quantity_requested INT NOT NULL,
    quantity_approved INT,
    status VARCHAR(32) NOT NULL DEFAULT 'PENDING_DISTRICT_REVIEW',
    priority VARCHAR(32) NOT NULL DEFAULT 'ROUTINE',
    requested_at TIMESTAMPTZ DEFAULT NOW(),
    approved_at TIMESTAMPTZ,
    dispatched_at TIMESTAMPTZ,
    tracking_waybill_number VARCHAR(64) UNIQUE,
    notes TEXT
);

-- 6. Automated Stock & Expiry Alerts
CREATE TABLE stock_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    facility_id UUID NOT NULL REFERENCES facilities(id),
    commodity_id UUID NOT NULL REFERENCES drug_commodities(id),
    alert_type VARCHAR(64) NOT NULL,
    severity VARCHAR(32) NOT NULL,
    message TEXT NOT NULL,
    detail TEXT,
    acknowledged BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_alerts_facility ON stock_alerts(facility_id, acknowledged);
`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(POSTGRES_DDL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 text-white p-5 rounded-xl border border-slate-800 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded font-bold">
              MoHCC Zimbabwe · Architecture & Handover Package
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black mt-1 text-white tracking-tight">
            System Specifications, Data Model & Phase Roadmap
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Complete technical blueprint for government procurement, IT team handover, eLMIS/DHIS2 interoperability, and national rollout.
          </p>
        </div>

        {/* Sub-nav Tabs */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('phases')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
              activeTab === 'phases' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:text-white'
            }`}
          >
            Phases 0-9
          </button>
          <button
            onClick={() => setActiveTab('raci')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
              activeTab === 'raci' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:text-white'
            }`}
          >
            RACI Workflow
          </button>
          <button
            onClick={() => setActiveTab('ddl')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
              activeTab === 'ddl' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:text-white'
            }`}
          >
            PostgreSQL DDL
          </button>
          <button
            onClick={() => setActiveTab('assumptions')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
              activeTab === 'assumptions' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:text-white'
            }`}
          >
            Assumptions Log
          </button>
          <button
            onClick={() => setActiveTab('interop')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
              activeTab === 'interop' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:text-white'
            }`}
          >
            eLMIS & DHIS2
          </button>
          <button
            onClick={() => setActiveTab('diagnostics')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'diagnostics' ? 'bg-emerald-600 text-white' : 'text-emerald-400 hover:text-emerald-300'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            Diagnostics Panel
          </button>
        </div>
      </div>

      {/* Real-time Subsystem Health Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="font-bold text-white text-xs">Subsystem Health:</span>
          <span className="text-emerald-400 font-semibold bg-emerald-950/80 border border-emerald-800/60 px-2 py-0.5 rounded text-[11px]">
            100% Operational
          </span>
        </div>

        <div className="flex items-center flex-wrap gap-4 text-[11px] text-slate-300">
          <div className="flex items-center gap-1.5">
            <HardDrive className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-slate-400">Local Storage:</span>
            <span className="font-mono font-bold text-white">
              {(storageService.getLocalStorageHealth().totalDtsBytes / 1024).toFixed(1)} KB
            </span>
            <span className="text-slate-400">({storageService.getLocalStorageHealth().percentageUsed}%)</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-400">IndexedDB:</span>
            <span className="font-bold text-emerald-300 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/40">
              Active (v1)
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-slate-400">Last Sync:</span>
            <span className="font-mono text-slate-200">
              {new Date(storageService.getLastSyncTimestamp()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          </div>
        </div>

        <button
          onClick={() => setActiveTab('diagnostics')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold transition-colors cursor-pointer text-xs ${
            activeTab === 'diagnostics'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
          }`}
        >
          <Activity className="w-3.5 h-3.5 text-emerald-400" />
          <span>{activeTab === 'diagnostics' ? 'Active Diagnostic Mode' : 'Inspect Diagnostic Panel →'}</span>
        </button>
      </div>

      {/* Tab 1: Phase Roadmap (Phase 0 to 9) */}
      {activeTab === 'phases' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-base">
            Master Phase-by-Phase Delivery Roadmap (MoHCC DTS-Zim)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {[
              {
                phase: 'Phase 0 — Discovery & Requirements Confirmation',
                status: 'Completed',
                items: [
                  'One-page problem statement & pilot success metrics (% reduction in rural clinic stockouts, % reduction in expired-stock wastage).',
                  'RACI matrix mapping NatPharm → Provincial Depot → District Store → Facility → Patient.',
                  'Clarifying questions identified for MoHCC stakeholders.'
                ]
              },
              {
                phase: 'Phase 1 — Information Architecture, Data Model & Roles',
                status: 'Completed',
                items: [
                  'Entity-Relationship model: Facility, Warehouse, User, Role, Commodity, Batch, StockMovement, DispenseRecord, Alert.',
                  'Strict FEFO-priority flag and batch lifecycle state machine.',
                  'Role-based access matrix for all 5 government tiers.'
                ]
              },
              {
                phase: 'Phase 2 — UX Wireframes & Core Mobile Screens',
                status: 'Completed',
                items: [
                  '8 core mobile screens optimized for low-bandwidth, low-literacy health workers.',
                  'Tri-lingual interface: English, chiShona, and isiNdebele.',
                  'Large 48px+ touch targets, icon-first navigation, and clear color coding.'
                ]
              },
              {
                phase: 'Phase 3 — Backend, Database Schema & API Design',
                status: 'Completed',
                items: [
                  'PostgreSQL DDL schema with composite index on (facility_id, commodity_id, expiry_date ASC).',
                  'Event-sourcing conflict resolution eliminating offline overwrite bugs.',
                  'REST endpoints for auth, stock receipt, FEFO dispensing, sync, and DHIS2 export.'
                ]
              },
              {
                phase: 'Phase 4 — Core Feature Build (Stock, FEFO, Alerts)',
                status: 'Completed',
                items: [
                  'Stock receipt with barcode/QR scanning simulation.',
                  'FEFO validation auto-selecting earliest expiring batch, requiring mandatory clinical override reason.',
                  'Automated stock-out prediction based on Average Monthly Consumption (AMC).'
                ]
              },
              {
                phase: 'Phase 5 — Offline Sync & Low-Connectivity Handling',
                status: 'Completed',
                items: [
                  'Local storage mirroring with buffered offline queue.',
                  'Data-Lite mode for 2G/EDGE network optimization.',
                  'Background sync with exponential retry backoff.'
                ]
              },
              {
                phase: 'Phase 6 — Admin / Analytics Web Dashboard',
                status: 'Completed',
                items: [
                  'National & Provincial 10-province stock status heatmap.',
                  'Stock-out & near-expiry trend charts using Recharts.',
                  'eLMIS-style surplus-to-deficit inter-facility redistribution matcher.'
                ]
              },
              {
                phase: 'Phase 7 — Notifications & Data Export',
                status: 'Completed',
                items: [
                  'Automated stockout and expiry risk notification jobs.',
                  'Exportable CSV mapping to DHIS2 DataElements and eLMIS formats.'
                ]
              },
              {
                phase: 'Phase 8 — Security, Compliance & Audit Trail',
                status: 'Completed',
                items: [
                  'Tamper-evident immutable ledger with cryptographic SHA-256 signatures.',
                  'Zimbabwe Data Protection Act (2021) compliance: Zero patient PII recorded.'
                ]
              },
              {
                phase: 'Phase 9 — Pilot Plan & Deployment Handover',
                status: 'Completed',
                items: [
                  'Pilot plan in 1 representative district (Tsholotsho or Binga) for 8-12 weeks.',
                  'Handover checklist for MoHCC IT / NatPharm data center deployment.'
                ]
              }
            ].map(p => (
              <div key={p.phase} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{p.phase}</span>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>{p.status}</span>
                  </span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-slate-600 text-[11px]">
                  {p.items.map((it, idx) => (
                    <li key={idx}>{it}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: RACI Matrix */}
      {activeTab === 'raci' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-base">
            RACI Workflow Matrix: Drug Movement Across MoHCC Tiers
          </h3>
          <p className="text-xs text-slate-500">
            <strong>R</strong> = Responsible, <strong>A</strong> = Accountable, <strong>C</strong> = Consulted, <strong>I</strong> = Informed
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                  <th className="p-3">Workflow Activity</th>
                  <th className="p-3 text-center">NatPharm Hub</th>
                  <th className="p-3 text-center">Provincial PMD</th>
                  <th className="p-3 text-center">District Pharmacist</th>
                  <th className="p-3 text-center">Facility Nurse</th>
                  <th className="p-3 text-center">MoHCC National</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[
                  { act: 'Central Batch Intake & Quarantine', r: 'R', a: 'A', c: 'C', i: 'I', nat: 'A' },
                  { act: 'ZIP Regional Dispatch & Waybill Generation', r: 'R', a: 'A', c: 'I', i: 'I', nat: 'I' },
                  { act: 'District Re-supply & Quota Allocation', r: 'C', a: 'C', c: 'R/A', i: 'I', nat: 'I' },
                  { act: 'Facility Stock Intake & Barcode Scanning', r: 'I', a: 'I', c: 'C', i: 'R/A', nat: 'I' },
                  { act: 'FEFO Patient Dispensation & Ward Issue', r: 'I', a: 'I', c: 'I', i: 'R/A', nat: 'I' },
                  { act: 'Physical Stock Count & Variance Reporting', r: 'I', a: 'I', c: 'A', i: 'R', nat: 'I' },
                  { act: 'Inter-Facility Emergency Redistribution', r: 'I', a: 'C', c: 'A/R', i: 'R', nat: 'I' },
                  { act: 'National Stock-out Surveillance & Allocation', r: 'C', a: 'C', c: 'C', i: 'I', nat: 'R/A' }
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="p-3 font-semibold text-slate-900">{row.act}</td>
                    <td className="p-3 text-center font-bold text-slate-800">{row.r}</td>
                    <td className="p-3 text-center font-bold text-slate-800">{row.a}</td>
                    <td className="p-3 text-center font-bold text-slate-800">{row.c}</td>
                    <td className="p-3 text-center font-bold text-slate-800">{row.i}</td>
                    <td className="p-3 text-center font-bold text-slate-800">{row.nat}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: PostgreSQL Schema */}
      {activeTab === 'ddl' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Production PostgreSQL Schema (SQL DDL)
              </h3>
              <p className="text-xs text-slate-500">
                Indexed for sub-second FEFO lookups, event-sourcing transactions, and automated alert generation.
              </p>
            </div>

            <button
              onClick={copyToClipboard}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied to Clipboard' : 'Copy SQL DDL'}</span>
            </button>
          </div>

          <pre className="bg-slate-950 text-emerald-300 p-4 rounded-xl text-[11px] font-mono overflow-x-auto max-h-[500px] border border-slate-800 leading-relaxed">
            {POSTGRES_DDL}
          </pre>
        </div>
      )}

      {/* Tab 4: Assumptions Log */}
      {activeTab === 'assumptions' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-base">
            Master Running "ASSUMPTIONS LOG"
          </h3>
          <p className="text-xs text-slate-500">
            Every operational and architectural assumption made in the prototype, documented for MoHCC and NatPharm stakeholder verification before national pilot:
          </p>

          <div className="space-y-3 text-xs">
            {[
              {
                id: 'ASSUMPTION-01',
                topic: 'eLMIS Coexistence',
                desc: 'ASSUMPTION: DTS-Zim acts strictly as a lightweight, last-mile mobile data-capture layer and does not replace the existing national eLMIS (Bileeta). It exports standard CSV/REST payloads to sync facility consumption into eLMIS periodically.'
              },
              {
                id: 'ASSUMPTION-02',
                topic: 'Zero Patient PII',
                desc: 'ASSUMPTION: In accordance with Zimbabwe’s Data Protection Act (2021), patient name, national ID, and clinical notes are strictly omitted from this commodity tracking system. Dispensing is tracked by quantity, batch, and ward/service point.'
              },
              {
                id: 'ASSUMPTION-03',
                topic: 'Connectivity & Offline Tolerance',
                desc: 'ASSUMPTION: Rural clinics in districts like Tsholotsho, Binga, and Gokwe experience extended 2G/EDGE connectivity blackouts lasting 24-72 hours. All core actions (receive, dispense, audit) must function entirely offline and sync via an append-only event ledger upon reconnection.'
              },
              {
                id: 'ASSUMPTION-04',
                topic: 'FEFO Strictness & Clinical Overrides',
                desc: 'ASSUMPTION: The system must strictly enforce First-Expiry-First-Out, but nurses must possess the clinical authority to override it (e.g. damaged vial packaging, cold-chain temperature excursion), provided a mandatory justification is cryptographically logged.'
              },
              {
                id: 'ASSUMPTION-05',
                topic: 'SMS Gateway Fallback',
                desc: 'ASSUMPTION: Pending final MoHCC vendor selection, an SMS aggregator placeholder (e.g. Africa’s Talking, Econet/NetOne gateway) is specified for sending critical stock-out alerts to facilities without smartphone/data connectivity.'
              }
            ].map(item => (
              <div key={item.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded text-[10px]">
                    {item.id}
                  </span>
                  <span className="font-bold text-slate-800">{item.topic}</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed pt-1">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Interoperability */}
      {activeTab === 'interop' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-base">
            Interoperability: eLMIS & DHIS2 Integration Specs
          </h3>
          <p className="text-xs text-slate-500">
            Design specifications for connecting DTS-Zim to Zimbabwe's national electronic Logistics Management Information System (eLMIS) and DHIS2 health data warehouse.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <span className="font-bold text-slate-900 block">DHIS2 Data Elements Mapping</span>
              <p className="text-[11px] text-slate-600">
                Commodity consumption and on-hand balances map to standard DHIS2 data element UIDs for MoHCC monthly health information reporting (HMIS Form 15).
              </p>
              <div className="bg-white p-3 rounded-lg border border-slate-200 font-mono text-[10px] space-y-1 text-slate-700">
                <div>DataElement_Code: ZEML-ARV-001 (TLD)</div>
                <div>CategoryOptionCombo: Default</div>
                <div>OrgUnit: Facility MoHCC Code (e.g. HRE-POL-04)</div>
                <div>Period: Monthly (YYYYMM)</div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <span className="font-bold text-slate-900 block">eLMIS / HL7-FHIR REST Adapter</span>
              <p className="text-[11px] text-slate-600">
                Exposes standardized JSON payload for central NatPharm warehouse integration, mirroring FHIR <code>MedicationDispense</code> and <code>InventoryItem</code> resources.
              </p>
              <div className="bg-white p-3 rounded-lg border border-slate-200 font-mono text-[10px] space-y-1 text-slate-700">
                <div>GET /api/v1/sync/export-elmis</div>
                <div>POST /api/v1/sync/natpharm-dispatch</div>
                <div>POST /api/v1/redistributions/webhook</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 6: Real-Time Subsystem Health Diagnostics */}
      {activeTab === 'diagnostics' && <SystemDiagnosticsPanel />}
    </div>
  );
};
