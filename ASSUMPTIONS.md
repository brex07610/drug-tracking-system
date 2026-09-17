# MoHCC Zimbabwe Drug Tracking System (DTS-Zim)
## Master Assumptions Log & System Specifications

*Date: September 2026*  
*Client: Ministry of Health and Child Care (MoHCC), Republic of Zimbabwe*  
*Complementary Systems: National eLMIS (Bileeta), DHIS2 (HMIS), NatPharm ZIP (Zimbabwe Informed Push)*

---

### 1. Scope & System Role
- **[ASSUMPTION-01] eLMIS Relationship**: DTS-Zim is not a replacement for the central national eLMIS (Bileeta). Rather, it functions as an offline-first "last-mile" digital data capture and FEFO traceability layer designed for primary healthcare facilities (Rural Health Centres, Polyclinics, District Hospitals) where full eLMIS infrastructure is currently inaccessible due to connectivity and hardware constraints. DTS-Zim outputs DHIS2- and eLMIS-compliant data formats (CSV, HL7-FHIR JSON).
- **[ASSUMPTION-02] Patient Privacy & Zero PII**: Under the **Zimbabwe Data Protection Act (2021)**, DTS-Zim does NOT store patient names, national identity numbers, residential addresses, or clinical diagnoses. Dispensations are tracked strictly by commodity, batch number, unit count, and service delivery point (e.g. OPD, Maternity Ward, ART Clinic, EPI).

### 2. Connectivity, Offline Operation & Conflict Resolution
- **[ASSUMPTION-03] Low-Bandwidth & Extended Blackouts**: In rural districts (e.g. Tsholotsho, Binga, Gokwe, Mudzi), 2G/EDGE network blackouts lasting 24–72 hours are standard. Therefore, the application stores full state in indexed local cache.
- **[ASSUMPTION-04] Event-Sourcing Ledger**: Traditional CRUD databases cause severe overwrite conflicts when multiple offline devices reconnect. DTS-Zim implements an append-only event ledger with SHA-256 signatures (`DISPENSE`, `RECEIPT`, `STOCKTAKE`, `REDISTRIBUTE`). Reconnecting devices replay ordered events to recalculate on-hand inventory without overwriting records.
- **[ASSUMPTION-05] Data-Lite Network Mode**: On rural 2G networks, payloads are compressed into minimal JSON tuples, suppressing heavy imagery and non-essential logs until an unmetered Wi-Fi connection is detected.

### 3. FEFO (First-Expiry-First-Out) Enforcement
- **[ASSUMPTION-06] Earliest Batch Auto-Selection**: The dispensing interface algorithmically forces selection of the earliest-expiring lot.
- **[ASSUMPTION-07] Mandatory Clinical Override Justification**: If a nurse physically cannot dispense the earliest lot (e.g. broken vial packaging, localized sunlight damage, cold chain temperature excursion), the system permits an override only after selecting a mandatory clinical reason. Every override is permanently flagged in the tamper-evident audit ledger.

### 4. Inter-Facility Redistribution & eLMIS Stock Balancing
- **[ASSUMPTION-08] District-Level Buffer Swapping**: In accordance with MoHCC guidelines, health facilities within the same district or province are authorized to balance stock through inter-facility transfer waybills when one clinic is in surplus (>4.5 Months of Stock) and a neighbor is in deficit (<0.5 Months of Stock), preventing preventable stockouts before NatPharm's scheduled quarterly delivery cycle.

### 5. Multi-Lingual Usability
- **[ASSUMPTION-09] Tri-Lingual Support**: Zimbabwe's constitution recognizes 16 official languages. For the core operational pilot, full localized strings are provided for English, chiShona, and isiNdebele.
