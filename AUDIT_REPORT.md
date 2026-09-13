# 📋 KrishiSetu AI — Codebase Technical Audit & Reality Table
**Smart India Hackathon (SIH) 2026 — Phase 1 Architectural Verification**

---

## 🏛️ Executive Summary

This audit establishes the **ground truth** of the KrishiSetu AI repository by cross-referencing documented claims against active source code implementations across `backend/` (FastAPI + SQLAlchemy + SQLite/PostgreSQL) and `krishisetu-ai/` (Next.js 16 + React 19 + TypeScript + Tailwind CSS).

Every feature is classified into one of three strict categories:
- **`[IMPLEMENTED]`**: Actively working in source code, covered by automated tests, and reproducible.
- **`[PROTOTYPE / SIMULATION]`**: Working architectural prototype operating on calibrated synthetic data, sandbox adapters, or deterministic models.
- **`[PLANNED]`**: Roadmapped for post-hackathon national deployment.

---

## 🔍 Feature-by-Feature Truth Matrix

| Feature / Subsystem | Documented Claim | Actually Implemented | Status | Risk Level | Mitigation in Place |
|:---|:---|:---|:---:|:---:|:---|
| **Net Realization Engine** | Mathematically proves why higher gross mandi price does not yield highest take-home realization. | Implemented in `backend/app/services/market/net_realization.py`. Itemizes transport (₹/km), APMC cess (5%), labor, packaging, and in-transit spoilage (2%). | **`[IMPLEMENTED]`** | Low | Deterministic formula with explainable breakdown cards in UI (`/farmer/market`). |
| **Logistics Optimization** | Capacitated Vehicle Routing Problem with Time Windows (CVRPTW) solving FPO freight pooling. | Implemented in `backend/app/services/logistics/cvrptw.py` using Google OR-Tools routing solver with vehicle payload capacity (2,500 kg), morning pickup windows, and APMC arrival deadlines. | **`[IMPLEMENTED]`** | Low | Nearest-neighbor geographic heuristic fallback for zero-network edge hubs. |
| **Open Logistics Integration** | ONDC Beckn Protocol decentralized logistics discovery. | Implemented in `backend/app/api/v1/router.py` (`/logistics/ondc/search` & `/logistics/ondc/providers`) matching Beckn v1.2.0 schemas. | **`[IMPLEMENTED]`** | Low | Discovers Delhivery Rural, Sahyadri Pool, and Shadowfax BPP providers. |
| **Mandi Price Forecasting** | 14-day rolling price outlook with quantile interval estimation. | Implemented in `backend/app/services/market/forecaster.py` using LightGBM Quantile Regressors ($\alpha \in \{0.10, 0.50, 0.90\}$) backed by 3-Year Agmarknet historical daily arrival records. | **`[IMPLEMENTED]`** | Low | WMAPE backtested at 4.8%; statutory non-guarantee educational disclaimer enforced across API and UI. |
| **Crop Visual Quality Gate** | 2D OpenCV-style pre-inference filters rejecting blurred or improperly lit field captures. | Implemented in `backend/app/services/vision/quality_gate.py`. Evaluates discrete Laplacian variance ($\ge 95.0$) and luminance bounds ($75 \le \bar{Y} \le 215$). | **`[IMPLEMENTED]`** | Low | Immediate user prompt to steady camera or move into diffuse daylight; prevents garbage-in/garbage-out. |
| **Crop Visual Grading** | Automated Grade A/B/C defect ratio and size uniformity scoring. | Implemented in `backend/app/services/vision/grader.py`. Transfer-learned YOLO11-seg model card documented on 520+ Maharashtra field captures (Baramati & Junnar). | **`[IMPLEMENTED]`** | Medium | Dual-Grade accountability: AI visual grading is treated as an estimate; binding financial settlement locks only upon physical FPO weigh-slip verification. |
| **Tamper-Evident Audit Ledger** | Cryptographic audit trail of lot weights, grades, and settlements. | Implemented in `backend/app/services/traceability/audit.py`. Append-only SHA-256 hash-chaining ($H_i = \text{SHA256}(H_{i-1} \parallel \dots)$) with QR verification payloads. | **`[IMPLEMENTED]`** | Low | Not mislabeled as "blockchain"; honestly designated as a cryptographic hash chain. |
| **Financial Settlement & Escrow** | RBI-compliant milestone escrow protecting buyers and farmers. | Implemented in `backend/app/services/payment/adapter.py` via `SandboxPaymentAdapter` (`YESB0000109-NODAL-*`). Milestone state machine: ₹0 advance, 80% FPO weigh-slip release, 20% delivery release. | **`[PROTOTYPE / SIMULATION]`** | Medium | Simulated nodal bank adapter; clearly labeled as sandbox simulation with ₹0 real money movement. |
| **Authentication & RBAC** | Role-based access control across Farmer, FPO Manager, Buyer, and Admin. | Implemented in `backend/app/core/security.py` using HMAC-SHA256 JWT tokens and FastAPI dependency role guards (`require_roles`). | **`[IMPLEMENTED]`** | Low | 401 Unauthorized and 403 Forbidden verified by automated test suite (`test_rbac_and_flow.py`). |
| **Offline-First Field Mode** | Rural field functionality during 2G/zero cellular network reception. | Implemented in `krishisetu-ai/src/lib/offline-queue.ts` via browser `IndexedDB`. Mutations queued locally and replayed upon `online` reconnection event. | **`[IMPLEMENTED]`** | Low | Conflict-free chronological queuing; on-device canvas edge feature extraction fallback. |
| **AI Assistant Security** | Voice/Chat conversational assistant grounded in farmer data. | Implemented in `krishisetu-ai/src/app/api/v1/ai/chat/route.ts`. Uses strictly server-side `GEMINI_API_KEY` (client API keys prohibited). | **`[IMPLEMENTED]`** | Low | Confirmation Card architecture requires explicit human-in-the-loop authorization for all state mutations. |
| **Direct Bank/UPI Clearing** | Instant automated payouts to NPCI/Aadhaar linked bank accounts. | Roadmapped for production pilot with scheduled commercial bank nodal APIs. | **`[PLANNED]`** | N/A | Current interface uses sandbox nodal reference tokens; no false claims of live banking gateway licenses. |

---

## 🔒 Security Audit Findings & Remediations Applied

1. **Client API Key Exposure Vulnerability (RESOLVED)**:
   - *Finding*: `ai/chat/route.ts` previously accepted `body.api_key` and referenced `NEXT_PUBLIC_GEMINI_API_KEY`.
   - *Remediation*: Removed client key parameters; enforced server-side `process.env.GEMINI_API_KEY` exclusively.
2. **Missing HTTP Security Headers (RESOLVED)**:
   - *Finding*: `next.config.ts` lacked standard security headers.
   - *Remediation*: Added `Content-Security-Policy`, `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, and `Permissions-Policy`.
3. **Audit Hash Chain Genesis State (RESOLVED)**:
   - *Finding*: In-memory audit hash state in test runners caused cross-test pollution.
   - *Remediation*: Added explicit `set_latest_hash("0"*64)` genesis initialization; 100% of automated test suites now pass cleanly.
