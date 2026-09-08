# KrishiSetu AI – Role-Based Access Control (RBAC) Matrix

## 1. Overview
KrishiSetu AI implements an enterprise-grade 5-role capability model ensuring strict separation of duties between agricultural producers, rural aggregators, institutional purchasers, field quality certifiers, and platform administrators.

---

## 2. Capability Matrix

| Capability / Permission | Farmer (`farmer`) | FPO Manager (`fpo`) | Buyer (`buyer`) | Field Verifier (`verifier`) | System Admin (`admin`) |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **View Real-Time Mandi Prices** | ✅ Allowed | ✅ Allowed | ✅ Allowed | ✅ Allowed | ✅ Allowed |
| **Discover Dynamic Markets (<1000 km)** | ✅ Allowed | ✅ Allowed | ✅ Allowed | ✅ Allowed | ✅ Allowed |
| **Dynamic Cost Calculator** | ✅ Allowed | ✅ Allowed | ✅ Allowed | ❌ Restricted | ✅ Allowed |
| **AI Computer Vision Crop Grading** | ✅ Allowed | ✅ Allowed | ❌ Restricted | ✅ Allowed | ✅ Allowed |
| **Create Transport / Pooling Lots** | ✅ Allowed | ✅ Allowed | ❌ Restricted | ❌ Restricted | ✅ Allowed |
| **Aggregate Multi-Farmer Pools** | ❌ Restricted | ✅ Allowed | ❌ Restricted | ❌ Restricted | ✅ Allowed |
| **Dispatch Vehicle Logistics** | ❌ Restricted | ✅ Allowed | ❌ Restricted | ❌ Restricted | ✅ Allowed |
| **FPO Farmer Member Roster** | ❌ Restricted | ✅ Allowed | ❌ Restricted | ❌ Restricted | ✅ Allowed |
| **Browse Verified Bulk Lots** | ❌ Restricted | ❌ Restricted | ✅ Allowed | ❌ Restricted | ✅ Allowed |
| **Submit Binding Escrow Bids** | ❌ Restricted | ❌ Restricted | ✅ Allowed | ❌ Restricted | ✅ Allowed |
| **Confirm Consignment Delivery** | ❌ Restricted | ❌ Restricted | ✅ Allowed | ❌ Restricted | ✅ Allowed |
| **Certify Crop Quality & Grades** | ❌ Restricted | ❌ Restricted | ❌ Restricted | ✅ Allowed | ✅ Allowed |
| **Issue Lot Quality Certificates** | ❌ Restricted | ❌ Restricted | ❌ Restricted | ✅ Allowed | ✅ Allowed |
| **User CRUD & Status Toggles** | ❌ Restricted | ❌ Restricted | ❌ Restricted | ❌ Restricted | ✅ Allowed |
| **Mandi Master Registry & CSV Import** | ❌ Restricted | ❌ Restricted | ❌ Restricted | ❌ Restricted | ✅ Allowed |
| **FPO & Collection Hub CRUD** | ❌ Restricted | ❌ Restricted | ❌ Restricted | ❌ Restricted | ✅ Allowed |
| **Crop Catalog & Grade Multipliers** | ❌ Restricted | ❌ Restricted | ❌ Restricted | ❌ Restricted | ✅ Allowed |
| **Platform Radius & Cost Settings** | ❌ Restricted | ❌ Restricted | ❌ Restricted | ❌ Restricted | ✅ Allowed |
| **Configure RBAC Matrix** | ❌ Restricted | ❌ Restricted | ❌ Restricted | ❌ Restricted | ✅ Allowed |
| **View SHA-256 Chained Audit Ledger**| ❌ Restricted | ❌ Restricted | ❌ Restricted | ❌ Restricted | ✅ Allowed |

---

## 3. Dynamic In-Memory Permission Toggles (`/admin/roles`)
The System Administrator can selectively grant or revoke capabilities in real time from the **Role Permissions** tab in the Admin Control Panel. Any toggle immediately modifies the client state and enforces runtime checks throughout the navigation hierarchy and action buttons.
