# E-WorkForce – Smart Field Workforce & Dispatch SaaS Platform

A multi-tenant field workforce management SaaS application built with **React 19**, **Vite**, **Tailwind CSS v4**, **Node.js Express 5**, and native **SQLite** (`ework.db`), offering **Freemium + Paid Subscription** tiers.

---

## 🌟 Features Overview

### 1. Freemium + Paid Subscription Engine
- **3-Tier Subscription Plans**:
  - **Free Starter ($0)**: 5 field employee seats, live GPS map, 150m site check-ins, proof of work & digital signatures, offline sync. No credit card or license key required.
  - **Professional ($19/mo)**: 100 field employee seats, turn-by-turn route history playback, automated mileage and overtime payroll, emergency SOS panic broadcast, PDF audit certificates.
  - **Enterprise ($49/mo)**: 1,000 field employee seats, multi-hub polygon boundaries, 99.98% platform SLA, dedicated onboarding architect.
- **Organization Registration**:
  - Instant onboarding for Free Starter plans without license keys.
  - Real-time license validation for Professional & Enterprise plans.
  - One-license-per-organization cryptographic linkage.
- **Payment Verification Gateways**:
  - Simulated online credit card / netbanking gateway with automated license key issuance (`EWF-PRO-XXXX` / `EWF-ENT-XXXX`).
  - Manual UPI payment gateway with QR code and 12-digit UTR reference tracking.
- **In-Place Seamless Upgrades**:
  - Existing Free organizations can upgrade to Professional or Enterprise by entering an active license key or purchasing one online without duplicating accounts or losing historical data.
- **Employee Seat Limit Enforcement**:
  - Free accounts enforce a hard 5-employee limit in backend controllers (`403 Forbidden` response for unauthorized staff creation).

### 2. Super Admin Management Console
Accessible via the header, footer, or logging in as `superadmin@ework.com`:
- **Platform Analytics**: Total organizations (Free vs Paid), active licenses, MRR, and platform metrics.
- **Organization Explorer**: Live search, filters, subscription statuses, staff seat occupancy, and renewal dates.
- **License Generator**: Generate on-demand organization license keys with custom durations and seat counts.
- **Payment Desk**: Review pending manual UPI payments (with UTR verification) and approve/reject with one click.
- **Lifecycle Controls**: Suspend, renew, upgrade, or revoke customer licenses in real-time.

### 3. Core Field Workforce Modules
- **Real-Time GPS Tracking**: Live telemetry, vehicle speed, device battery, and moving markers via Socket.io.
- **Geofenced Check-In & Proof of Work**: Site-boundary verification (150m) with photo capture and digital sign-off.
- **Offline-First PWA Synchronization**: IndexedDB caching with automated background sync when connectivity resumes.
- **Turn-by-Turn Route Playback**: Interactive step-by-step waypoint scrubber.
- **Emergency SOS Panic Alerts**: One-touch broadcast with audible siren and high-priority dispatcher toast notifications.
- **Separate Portals**: Manager Console & Scoped Field Employee Portals.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js 20+ or 22+ (Native SQLite enabled)
- Windows / macOS / Linux

### 1. Launching the Platform
Run the all-in-one startup launcher:
```bash
# On Windows: Double-click start.bat or run:
start.bat

# Or using npm:
npm run dev
```

This concurrently launches:
- **Backend API & WebSockets**: `http://localhost:5000`
- **React Admin & Employee Web Portal**: `http://localhost:5173`

---

## 🔑 Demo Login Personas

| Role | Email | Password | Access / Capabilities |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `superadmin@ework.com` | `Workforce@2026` | Master SaaS console, licenses, payments, and platform metrics |
| **Operations Manager** | `manager@ework.com` | `Workforce@2026` | Live dispatch, task assignment, shifts, attendance, upgrades |
| **Senior Technician** | `rahul@ework.com` | `Workforce@2026` | Scoped Employee Portal: Tasks, GPS punches, proof of work |
| **Field Sales Exec** | `priya@ework.com` | `Workforce@2026` | Scoped Employee Portal: Client visits, expenses, location log |
| **Quality Inspector** | `sneha@ework.com` | `Workforce@2026` | Scoped Employee Portal: Audits, checklist sign-offs, camera proof |

---

## 🧪 Automated SaaS Test Suite

Execute the 19-assertion backend test suite covering free registration, seat limit enforcement, payment verification, manual UPI approvals, and in-place upgrades:

```bash
cd backend
node --experimental-sqlite test-subscription-saas.mjs
```

**Test Coverage**:
- `GET /api/subscriptions/plans` returns Free, Pro, and Enterprise tiers.
- Free organization instant registration without license key.
- 5-seat capacity limit enforcement; blocking the 6th employee (`403`).
- Paid registration rejection on missing or invalid keys.
- Online card payment verification & `EWF-PRO` license issuance.
- Duplicate license key activation prevention.
- Manual UPI payment submission with UTR proof.
- Super Admin manual payment verification and approval.
- In-place Free-to-Enterprise upgrade unlocking employee seats.
- Super Admin overview metrics and multi-tenant isolation.

---

## 📂 Project Architecture

```
Ework/
├── admin_dashboard/         # React 19 + Vite + Tailwind CSS v4 Frontend
│   ├── src/
│   │   ├── components/      # UI Modals (Subscription, Checkout, Org Reg, SuperAdmin)
│   │   ├── employee/        # Dedicated Scoped Employee Web Portal
│   │   ├── pages/           # Manager Pages (Tasks, Shifts, Attendance, Live Tracking)
│   │   ├── App.jsx          # Root State, Routing, Header, and Manager Sidebar
│   │   └── main.jsx         # App Entry Point
├── backend/                 # Node.js Express 5 + SQLite Backend
│   ├── src/
│   │   ├── config/          # database.js (SQLite Tables: orgs, subscriptions, licenses, payments)
│   │   ├── controllers/     # subscriptionController.js, authController.js, etc.
│   │   ├── middlewares/     # authMiddleware.js (Super Admin RBAC)
│   │   ├── routes/          # Express route registrations
│   │   └── server.js        # HTTP & Socket.io Server Entry
│   ├── ework.db             # Persistent SQLite 3 Database
│   └── test-subscription-saas.mjs # 19-Step Automated Verification Suite
├── database/migrations/     # SQL Migration Files (01 through 04)
├── supabase/migrations/     # Supabase Cloud Migration Scripts
├── scripts/                 # dev.js (Concurrent Multi-Service Runner)
└── start.bat                # 1-Click Windows Development Launcher
```

---

## 🔒 Security & Data Isolation
- **Organization Scoping**: All users, subscriptions, and tasks include `organization_id` for multi-tenant data isolation.
- **RBAC**: Employees cannot access manager routes; non-superadmins are strictly blocked from `/api/superadmin/*`.
- **License Authenticity**: Licenses enforce format matching (`EWF-PRO-XXXX` / `EWF-ENT-XXXX`), status transitions (`available` ➔ `active`), and single-organization locks.
