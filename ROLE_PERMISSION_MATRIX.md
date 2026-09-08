# KrishiSetu AI – Role-Based Access Control (RBAC) Matrix

## 1. Overview
KrishiSetu AI implements a streamlined 4-role capability model ensuring clear separation of duties between agricultural producers, rural aggregators, institutional purchasers, and platform administrators.

---

## 2. Capability Matrix

| Capability / Permission | Farmer (`farmer`) | FPO Manager (`fpo`) | Buyer (`buyer`) | System Admin (`admin`) |
| :--- | :---: | :---: | :---: | :---: |
| **View Real-Time Mandi Prices** | ✅ Allowed | ✅ Allowed | ✅ Allowed | ✅ Allowed |
| **Discover Dynamic Markets (<1000 km)** | ✅ Allowed | ✅ Allowed | ✅ Allowed | ✅ Allowed |
| **Dynamic Cost Calculator** | ✅ Allowed | ✅ Allowed | ✅ Allowed | ✅ Allowed |
| **AI Computer Vision Crop Grading** | ✅ Allowed | ✅ Allowed | ❌ Restricted | ✅ Allowed |
| **Create Transport / Pooling Lots** | ✅ Allowed | ✅ Allowed | ❌ Restricted | ✅ Allowed |
| **Aggregate Multi-Farmer Pools** | ❌ Restricted | ✅ Allowed | ❌ Restricted | ✅ Allowed |
| **Dispatch Vehicle Logistics** | ❌ Restricted | ✅ Allowed | ❌ Restricted | ✅ Allowed |
| **FPO Farmer Member Roster** | ❌ Restricted | ✅ Allowed | ❌ Restricted | ✅ Allowed |
| **Browse Verified Bulk Lots** | ❌ Restricted | ❌ Restricted | ✅ Allowed | ✅ Allowed |
| **Submit Binding Escrow Bids** | ❌ Restricted | ❌ Restricted | ✅ Allowed | ✅ Allowed |
| **Confirm Consignment Delivery** | ❌ Restricted | ❌ Restricted | ✅ Allowed | ✅ Allowed |
| **User CRUD & Status Toggles** | ❌ Restricted | ❌ Restricted | ❌ Restricted | ✅ Allowed |
| **Mandi Master Registry & CSV Import** | ❌ Restricted | ❌ Restricted | ❌ Restricted | ✅ Allowed |
| **FPO & Collection Hub CRUD** | ❌ Restricted | ❌ Restricted | ❌ Restricted | ✅ Allowed |
| **Crop Catalog & Grade Multipliers** | ❌ Restricted | ❌ Restricted | ❌ Restricted | ✅ Allowed |
| **Platform Radius & Cost Settings** | ❌ Restricted | ❌ Restricted | ❌ Restricted | ✅ Allowed |
| **Configure RBAC Matrix** | ❌ Restricted | ❌ Restricted | ❌ Restricted | ✅ Allowed |
| **View SHA-256 Chained Audit Ledger**| ❌ Restricted | ❌ Restricted | ❌ Restricted | ✅ Allowed |

---

## 3. Dynamic In-Memory Permission Toggles (`/admin/roles`)
The System Administrator can selectively grant or revoke capabilities in real time from the **Role Permissions** tab in the Admin Control Panel. Any toggle immediately modifies the client state and enforces runtime checks throughout the navigation hierarchy and action buttons.
