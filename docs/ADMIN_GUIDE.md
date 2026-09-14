# KrishiSetu AI – Admin Control Panel & Platform Guide

## 1. Overview
The **KrishiSetu AI Admin Control Panel** (`/admin`) provides full governance, customization, and live operational management over India's National Digital Agriculture Platform without requiring any code changes.

All updates made in the Admin Control Panel are stored in persistent state (`krishisetu-storage-v2`), immediately reflected across all user portals (`/farmer`, `/farmer/market`, `/fpo`, `/buyer`), and recorded in an **immutable SHA-256 chained audit ledger**.

---

## 2. Navigation & Access Control
- **URL**: `https://krishisetu-ai-mu.vercel.app/admin`
- **Role Switcher**: Click the user profile badge in the top navigation bar and select **"System Administrator"** (`Admin User`).
- **RBAC Route Guard**: Non-admin users attempting to open `/admin/*` are automatically prevented and routed to their authorized portal.

### Admin Portal Sections:
1. **`/admin`** — Operational Overview & KPI Health Matrix
2. **`/admin/users`** — User Lifecycle Management (Farmers, FPOs, Buyers, Admins)
3. **`/admin/mandis`** — National Mandi Master Registry & CSV Bulk Importer
4. **`/admin/fpos`** — FPO Organizations, Collection Centers & Farmer Rosters
5. **`/admin/crops`** — Commodity Catalog & Grade A/B/C Pricing Matrix
6. **`/admin/logistics`** — Transporters & Fleet Vehicle Directory
7. **`/admin/settings`** — Market Discovery Radius (25-1000 km) & Cost Deductions
8. **`/admin/roles`** — 4-Role RBAC Capability Matrix
9. **`/admin/audit`** — Cryptographic SHA-256 Chained Audit Ledger

---

## 3. User Lifecycle Management (`/admin/users`)
### Adding a New Farmer:
1. Navigate to `/admin/users` and click **"Add Farmer (शेतकरी जोडा)"**.
2. Fill in:
   - **Full Name**, **Mobile Number** (10 digits).
   - **Land Size (Acres)** and **Farmer Type** (Small/Marginal, Medium, Large Commercial).
   - **Village, Taluka, District, State, Pincode**.
   - **Farm Coordinates (Latitude & Longitude)**: Click **"Pick on Map"** to pinpoint farm coordinates.
   - **Primary Crops**: Comma-separated list (e.g. `Tomato, Onion, Soyabean`).
   - **FPO Affiliation**: Select an active FPO (e.g. `Baramati Krushi Vikas FPO`).
3. Click **"Register Farmer"**. The farmer is immediately active, assigned to the FPO, and can participate in collective pooling and market discovery.

### Adding Other Roles:
- Click **"Add Other User"** to create **FPO Managers**, **Institutional Buyers**, or additional **System Admins**.

### Actions on Users:
- **Edit**: Update contact info, coordinates, crops, or land size.
- **Toggle Status**: Instantly switch between `Active` and `Inactive` (deactivated users cannot perform transactions).
- **Delete**: Soft-delete users with safeguards. Deleting the active session or the primary system administrator is strictly blocked.
- **Export CSV**: Download complete user directory as a `.csv` file.

---

## 4. FPO Organizations & Collection Centers (`/admin/fpos`)
### Managing FPOs:
- Register new farmer producer organizations with registration numbers, service fee paise/quintal, and minimum/maximum pool batch capacities.
- **Collection Centers**: Click **"Collection Centers"** on any FPO card to view, add, and activate rural collection hubs with storage capacities (kg), GPS pins, and local supervisor contacts.
- **Member Farmer Roster**:
  - Click **"Member Roster"** to view all registered farmers under that FPO.
  - Click **"Assign Farmer"** to enroll existing registered farmers into the FPO.
  - Click **"Remove"** to detach a farmer while maintaining their historical harvest data.

---

## 5. Mandi Master Registry & CSV Bulk Import (`/admin/mandis`)
### Adding / Editing Individual Mandis:
1. Click **"Add Mandi"**.
2. Enter Mandi Name (e.g. `Parbhani Cotton APMC`), Market Code, District, State, and coordinates.
3. Use the integrated **3-in-1 Location Picker** to select coordinates from GPS or map click.
4. Set supported commodities and data source (e.g. `Agmarknet Daily Feed`, `eNAM Direct`, `APMC Digital Board`).

### CSV Bulk Import:
1. Download the verified template: Click **"Download Sample Template"** (or use `MANDI_IMPORT_TEMPLATE.csv`).
2. Populate columns: `mandi,marketCode,village,taluka,district,state,lat,lng,supportedCrops,contactPerson,phone`.
3. Click **"Choose File"** in the Bulk Import card and select your CSV.
4. The system validates required headers, coordinates, and prevents duplicate records.
5. Click **"Import Mandis"**. All entries are immediately loaded into the live registry and made discoverable to farmers.

---

## 6. Crop Catalog & Grade Rules (`/admin/crops`)
- Add or configure crops (Tomato, Onion, Soyabean, Cotton, Wheat, etc.).
- Set Grade A, Grade B, and Grade C price adjustment multipliers:
  - **Grade A**: e.g., `+12%` premium over modal APMC rate.
  - **Grade B**: Standard modal benchmark (`0%`).
  - **Grade C**: e.g., `-18%` deduction for commercial/processing grade.
- These rules dynamically calculate quality payouts in the AI Quality Assessor (`/farmer/grade`).

---

## 7. Transporters & Fleet Vehicles (`/admin/logistics`)
- Register transport agencies and logistics providers.
- Maintain vehicle fleets:
  - **Vehicle Types**: Reefer Cold Chain, 14ft Open Truck, 3-Wheeler Tempo, Tractor Trolley.
  - **Payload Capacity**: 1.5 MT to 25 MT.
  - **Driver Phone & Tracking**: Real-time dispatch coordinates and availability toggle (`Available`, `In Transit`, `Maintenance`).

---

## 8. Market Discovery & Cost Settings (`/admin/settings`)
### Search Radius Controls:
- **Default Search Radius**: Configurable (default `50 km`).
- **Maximum Search Radius**: Up to `1000 km` for cross-state and pan-India trading.
- **Auto-Expansion**: Automatically expands radius if fewer than 3 mandis exist locally.

### Itemized Net Realization Deductions:
- **Freight Rate**: ₹/km/tonne.
- **Handling / Hamali**: ₹/quintal.
- **Crates & Packaging**: ₹/quintal.
- **Mandi Commission**: % of gross value.
- **Spoilage Buffer**: % expected transit shrinkage.
- **FPO Facilitation Fee**: % retained for collective aggregation.

### AI Engine Configuration:
- Select active model: `Gemini 2.5 Flash`, `Gemini Pro Vision`, or `Hybrid Offline`.
- Set Gemini API Key securely from the UI.

---

## 9. 4-Role RBAC Capability Matrix (`/admin/roles`)
Configure granular permissions across 4 system roles:
1. **Farmer (`farmer`)**: View prices, join pools, scan crop quality, view settlements.
2. **FPO Manager (`fpo`)**: Create collective pools, approve lots, dispatch freight, manage roster.
3. **Buyer (`buyer`)**: Browse verified bulk lots, place escrow bids, confirm delivery.
4. **System Admin (`admin`)**: Master registry control, configuration, audit logs.

---

## 10. Immutable SHA-256 Audit Ledger (`/admin/audit`)
- Every mutation (User created, Mandi imported, Setting modified, Pool approved) generates a cryptographically signed `AuditEvent`.
- **Chain Formula**:
  $$\text{Hash}_n = \text{SHA256}(\text{Hash}_{n-1} \parallel \text{Timestamp} \parallel \text{Actor} \parallel \text{Action} \parallel \text{EntityType} \parallel \text{EntityId} \parallel \text{Details})$$
- The ledger displays parent hash linkages, cryptographic verification status (`Verified Chain`), and offers one-click CSV export for government and compliance reporting.
