# 📚 KrishiSetu AI — Documentation Index

Welcome to the comprehensive engineering documentation and architectural specifications for **KrishiSetu AI** (Smart India Hackathon 2026).

---

## 📑 Technical & System Architecture

| Document | Purpose & Key Topics |
| :--- | :--- |
| **[ARCHITECTURE.md](ARCHITECTURE.md)** | End-to-end system topology, Next.js App Router layout, FastAPI service contracts, PostgreSQL/PostGIS schemas, and data flow pipelines. |
| **[AI_ML.md](AI_ML.md)** | Computer vision quality gates (Laplacian blur > 100, exposure 80–200), LightGBM multi-quantile price forecaster (WMAPE 5.09%), and OR-Tools CVRPTW solver mathematical formulation. |
| **[MODEL_CARD.md](MODEL_CARD.md)** | Full ML model lineage, training datasets (Agmarknet 2023–2026, 520+ field photos), evaluation metrics, and statutory non-guarantee disclosures. |
| **[SECURITY.md](../SECURITY.md)** | Threat model, zero-trust API boundaries, server-side Gemini key isolation, strict CSP policies, and RBAC matrix. |

---

## ⚖️ Governance, Compliance & Verification

| Document | Purpose & Key Topics |
| :--- | :--- |
| **[AUDIT_REPORT.md](AUDIT_REPORT.md)** | Cryptographic SHA-256 Merkle-chained event ledger verification, tamper detection protocols, and chain reconstruction proofs. |
| **[DECISIONS.md](DECISIONS.md)** | Architectural Decision Records (ADRs): Why Next.js + FastAPI, why LightGBM over LSTM for sparse APMC arrivals, and why OR-Tools CVRPTW. |
| **[JUDGES_QA.md](JUDGES_QA.md)** | Smart India Hackathon jury defense manual addressing scalability, offline resilience, farmer adoption, and economic feasibility. |
| **[FINAL_QA_REPORT.md](FINAL_QA_REPORT.md)** | Comprehensive test pass matrices across 36 backend tests, 16 platform tests, and 46 compiled Next.js routes. |

---

## 🛠️ Operations, Administration & Features

| Document | Purpose & Key Topics |
| :--- | :--- |
| **[ADMIN_GUIDE.md](ADMIN_GUIDE.md)** | Operational handbook for managing APMC mandis, FPO clusters, crop pricing multipliers, and fleet transporters. |
| **[ROLE_PERMISSION_MATRIX.md](ROLE_PERMISSION_MATRIX.md)** | Fine-grained RBAC permission matrix for Farmers, FPO Managers, B2B Buyers, and System Administrators. |
| **[MAP_FEATURES.md](MAP_FEATURES.md)** | Cartographic map engine implementation, Leaflet integration, dynamic radius circles, and interactive market pins. |
| **[LOCATION_PICKER_GUIDE.md](LOCATION_PICKER_GUIDE.md)** | 3-in-1 Location Picker integration: HTML5 device GPS auto-detect, 35+ Gazetteer autocomplete, and pin-to-locate. |
| **[CUSTOM_SETTINGS_GUIDE.md](CUSTOM_SETTINGS_GUIDE.md)** | Dynamic configuration guide for platform discovery radius (25–1000 km) and itemized cost deduction parameters. |
