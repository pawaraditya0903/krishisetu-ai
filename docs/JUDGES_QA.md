# ⚖️ KrishiSetu AI — 30 Tough Judge Questions & Technical Answers
**Smart India Hackathon (SIH) 2026 — Grand Finale Evaluation Preparation**

---

## 🏛️ Category 1: Architecture & Scalability (Q1 – Q5)

### Q1: "Why did you build a custom Next.js/FastAPI stack instead of using an existing no-code or monolithic framework?"
**Answer**: Agricultural market-linkage requires decoupled execution: high-performance async mathematical optimization (OR-Tools CVRPTW), ML inference, and integer financial calculations belong in a typed Python backend (FastAPI + Pydantic v2). Meanwhile, a mobile-first, offline-resilient farmer interface with regional Indic speech and IndexedDB queuing requires a reactive frontend (Next.js 16). This architecture scales independently: the stateless API can scale horizontally behind a load balancer, while the Next.js frontend is distributed across edge CDNs.

### Q2: "How does your system handle rural areas with zero cellular reception?"
**Answer**: We implement a true offline-first architecture via browser `IndexedDB` (`offline-queue.ts`). When a farmer captures photos or drafts a crop lot in an offline field, mutations are serialized and queued in client storage. A service worker and window `online` event listener detect connectivity restoration and replay queued transactions chronologically to the `/api/v1` gateway.

### Q3: "What happens if your PostgreSQL database crashes during peak morning mandi auction hours?"
**Answer**: Our backend implements a multi-tier resilience strategy:
1. Production deployments utilize PostgreSQL 16 with streaming replication and connection pooling (`pool_pre_ping=True`).
2. If the primary database is unreachable, our database layer (`app/core/database.py`) gracefully falls back to an embedded SQLite local engine (`krishisetu_local.db`), allowing local FPO hubs to continue registering lots and recording weigh-bridge tickets without downtime.

### Q4: "How do you prevent floating-point rounding errors in multi-farmer settlement splits?"
**Answer**: We enforce an absolute integer paise financial accounting rule (`ADR-01`). All financial figures, freight deductions, commissions, and payouts are stored in the database as 64-bit integers representing paise (`1 INR = 100 paise`). Decimal conversion to Indian Rupee occurs only at the final presentation layer, guaranteeing zero floating-point drift across thousands of pooled transactions.

### Q5: "How does your backend handle concurrent buyer reservations without double-booking pool lots?"
**Answer**: We implement atomic reservation checks in `reserve_pool` with concurrency locking. When Buyer 1 initiates a reservation, the pool status transitions to `Reserved` within a single database transaction. Any concurrent request for the same pool is immediately rejected with `HTTP 409 Conflict: Pool is already reserved`.

---

## 👁️ Category 2: Machine Learning & Computer Vision (Q6 – Q10)

### Q6: "Can a farmer fool your camera grading by uploading a photo of high-quality tomatoes found on Google?"
**Answer**: We mitigate this through three anti-spoofing layers:
1. **Perceptual Hash Uniqueness (`pHash`)**: Detects duplicate or downloaded stock images matching existing catalog entries.
2. **Metadata & Time-Window Validation**: EXIF timestamp and GPS coordinates are cross-referenced with the farmer's registered geolocation in Baramati.
3. **Dual-Grade Accountability**: Visual grading is explicitly treated as an *estimate* for lot registration. Final financial clearing is locked only after physical weigh-bridge verification and visual confirmation by the FPO collection manager.

### Q7: "How do you detect if a farmer takes a blurry or underexposed photo in bad shed lighting?"
**Answer**: We deploy an OpenCV-style pre-inference Quality Gate before any ML model runs:
- **Blur**: Discrete 2D Laplacian operator computes image sharpness variance ($\text{Var}(\nabla^2 I)$). If $< 100.0$, the image is rejected with: *"Image is too blurry. Hold the camera steady with adequate lighting."*
- **Exposure**: Mean grayscale brightness is evaluated. If $< 80.0$ (underexposed) or $> 200.0$ (glare), it is rejected with: *"Exposure out of range. Avoid heavy shadows or direct lens flare."*
- **Occupancy**: Evaluates foreground fruit density. If $< 55\%$, it prompts the farmer to frame closer to the crate.

### Q8: "Can your computer vision model detect internal fruit rot, pesticide residues, or sugar content (Brix)?"
**Answer**: Absolutely not, and we strictly refuse to make false claims. Photographic computer vision is physically restricted to external surface attributes: diameter uniformity, color ripeness stage (breaker, pink, light red), and percentage of surface blemishes. Internal acidity, pesticide residue, and Brix require refractometers and chemical assays. We display mandatory scientific disclaimers across the application stating these physical boundaries clearly.

### Q9: "What algorithm powers your 14-day price forecasting, and why not use an LSTM or Prophet?"
**Answer**: We deploy LightGBM Quantile Regressors trained on rolling historical APMC arrival data, seasonal price momentum lags, and inter-mandi spreads. We chose LightGBM over Prophet or LSTM because:
1. Quantile loss ($L_q$) allows simultaneous, robust prediction of **P10 (Downside)**, **P50 (Expected)**, and **P90 (Upside)** intervals rather than an uncalibrated point estimate.
2. It handles tabular exogenous features (arrival shocks, rainfall anomalies) with lower variance, faster inference ($< 15\text{ ms}$), and superior interpretability via SHAP feature contribution scores.

### Q10: "How do you monitor and handle model drift when market arrival dynamics change abruptly?"
**Answer**: Our Admin Model Registry (`/admin/model`) computes rolling Weighted Mean Absolute Percentage Error (WMAPE) on 7-day retrospective backtests. If WMAPE degrades past our SLA threshold of 8.5% (e.g. during an unseasonal unseasonal rain shock), an automated drift alert triggers, falling back to local rolling 7-day modal price averages until the model is retrained on the newly shifted distribution.

---

## 💰 Category 3: Economics & Market Intelligence (Q11 – Q15)

### Q11: "Why do you emphasize 'Net Realization' over gross mandi prices? Doesn't the farmer already know transport costs?"
**Answer**: Smallholders frequently fall into the "gross price trap." An APMC market 90 km away quoting ₹2,150/qtl appears significantly better than a local yard quoting ₹1,850/qtl. However, after solo tempo freight (₹15/km), driver return charges, unloading labour, APMC commission (5%), and 2% in-transit transit spoilage, the distant mandi yields lower net take-home pay. KrishiSetu makes these hidden deductions completely transparent before the farmer loads the vehicle.

### Q12: "How does FPO batch pooling create real economic savings?"
**Answer**: Solo transport for a 500 kg batch requires hiring an entire 1-tonne pickup tempo (costing ~₹900 for 12 km = ₹1.80/kg). When 4 to 5 farmers pool their produce into a single 2,500 kg Tata 407 dispatch, the vehicle operates at $> 85\%$ load factor, reducing per-kg freight cost to ₹0.85/kg—an immediate **28.5% to 53.7% freight saving** that flows directly back to the farmer.

### Q13: "What if your price forecast advises a farmer to 'Wait 3 Days', but the price crashes instead?"
**Answer**: Our decision-support engine operates under strict expected utility theory with probabilistic guardrails:
1. We present **P10 Downside Scenarios** so the farmer is fully aware of worst-case risk.
2. The UI explicitly states: *"Price forecasts are statistical quantile estimates and do not guarantee future clearing rates."*
3. For perishable crops like tomatoes, holding advice is capped at 3-4 days unless certified cold chain storage is available, preventing irreversible physical spoilage.

### Q14: "Why don't you recommend long-term storage for tomato farmers during price crashes?"
**Answer**: Tomatoes are climacteric and highly perishable. In ambient rural warehouse conditions, firm breaker-stage tomatoes soften within 48 to 72 hours, resulting in complete commercial value loss. KrishiSetu's `RiskAwareSaleAdvisor` includes an explicit perishability constraint that disables "Store" recommendations for tomatoes unless the farmer selects verified cold storage access.

### Q15: "How does your platform incentivize FPOs to participate rather than sticking to traditional commissions?"
**Answer**: FPOs earn a transparent **1.5% aggregation and facilitation service fee** on pooled volume, which is significantly more predictable and scalable than ad-hoc middleman commissions. Furthermore, FPOs gain automated driver manifests, digital weigh-bridge accounting, and verified institutional buyer access (reducing FPO default risk).

---

## 🚚 Category 4: Logistics & Supply Chain (Q16 – Q20)

### Q16: "What algorithm does your logistics optimizer use, and how does it prevent route delays?"
**Answer**: We use Google OR-Tools to solve the **Capacitated Vehicle Routing Problem with Time Windows (CVRPTW)**. The solver constraints include:
1. Maximum vehicle payload capacity (e.g. 2,500 kg for Tata 407).
2. Farmer morning harvest pickup windows (07:00 - 10:15 AM).
3. APMC yard morning auction arrival deadline (11:30 AM).
A nearest-neighbor geographic heuristic provides instant fallback execution in offline or resource-constrained hub environments.

### Q17: "What happens if the total harvest in a cluster exceeds the truck's maximum payload capacity?"
**Answer**: The CVRPTW solver evaluates total load before route generation. If total pickup weight exceeds vehicle payload capacity (e.g., 3,200 kg on a 2,500 kg truck), the system rejects single-route overloading with an explicit validation error, automatically partitioning the pickups into multiple trips or dispatching an additional vehicle from the transporter pool.

### Q18: "How does the system ensure drivers actually visit every farm on time?"
**Answer**: The driver receives a digital dispatch manifest with GPS coordinates and sequential pickup windows. Each farm stop requires the farmer or driver to confirm pickup with a timestamped digital weigh-slip, preventing skipped farms or route deviation.

### Q19: "How do you account for produce spoilage and shrinkage during transit on hot rural roads?"
**Answer**: Our Net Realization Engine incorporates an explicit **In-Transit Spoilage Buffer (default 2%)** in deduction calculations. In addition, CVRPTW limits transit duration to under 3.5 hours for ambient dispatches, scheduling pickups early in the morning (07:00 - 10:00 AM) to avoid midday heat degradation.

### Q20: "Can your logistics module integrate with commercial fleet tracking (Fastag, GPS telematics)?"
**Answer**: Yes. Our `Dispatch` model includes standardized vehicle registration numbers and driver phone numbers, ready to link with Vahan telematics APIs and GPS tracking webhooks as outlined in our `API_INTEGRATION_ROADMAP.md`.

---

## 🔒 Category 5: Security, Trust & Provenance (Q21 – Q25)

### Q21: "Why did you use a custom SHA-256 hash chain instead of an Ethereum or Hyperledger blockchain?"
**Answer**: Deploying public blockchain networks in Indian agricultural supply chains introduces severe real-world friction: gas fees, wallet management, slow transaction finality, and massive computational overhead. Our append-only SHA-256 cryptographic hash chain provides identical **tamper-evident mathematical guarantees**:
$$H_i = \text{SHA256}(H_{i-1} \parallel \text{Timestamp} \parallel \text{Actor} \parallel \text{Action} \parallel \text{Details})$$
Any alteration of historic weights or grades immediately breaks subsequent hashes, detectable in milliseconds without gas costs.

### Q22: "What prevents an FPO manager from secretly changing a farmer's verified weight or grade in the database?"
**Answer**: FPO managers are restricted by role-based permissions and mandatory justification rules:
1. Any grade change requires written justification in `fpo_notes`.
2. Every verification action creates a non-repudiable audit event in the SHA-256 ledger recording the manager's user ID, timestamp, original grade, and verified weight.
3. The farmer's QR gate pass and digital receipt are cryptographically bound to the initial registration.

### Q23: "How is your Role-Based Access Control (RBAC) enforced across API endpoints?"
**Answer**: RBAC is enforced at the FastAPI dependency layer via `require_roles(["ROLE"])`:
- A Farmer attempting to access FPO verification endpoints receives **HTTP 403 Forbidden**.
- A Buyer attempting to create FPO pools receives **HTTP 403 Forbidden**.
- Unauthenticated requests lacking a valid Bearer JWT receive **HTTP 401 Unauthorized**.
All role boundaries are verified by automated security test suites (`test_rbac_and_flow.py`).

### Q24: "How do you protect farmer personal identifiable information (PII) like phone numbers and bank accounts?"
**Answer**: Passwords and PINs are hashed using salted cryptographic algorithms. Bank account details and IFSC codes are processed via masked payment gateway tokens. Only verified FPO hub managers within the farmer's registered tehsil can view farm-gate pickup addresses.

### Q25: "Can an attacker tamper with JWT tokens to elevate privileges to Admin?"
**Answer**: No. Tokens are signed using asymmetric or HMAC-SHA256 algorithms with a 256-bit server-side secret key stored in environment variables. If a client tampers with the payload claims (e.g. changing `"role": "FARMER"` to `"role": "ADMIN"`), signature verification fails, returning `HTTP 401 Unauthorized: Could not validate credentials`.

---

## 📜 Category 6: Business Sustainability & Regulations (Q26 – Q30)

### Q26: "Are you operating an illegal escrow wallet without an RBI Payment Aggregator license?"
**Answer**: Absolutely not. KrishiSetu **strictly acts as a technology facilitator and never takes custody of funds**. Payments are handled via a simulated **Regulated Nodal Account Adapter** (`YESB0000109-NODAL-*`), mirroring RBI guidelines for scheduled commercial bank nodal accounts (such as YES Bank or ICICI Nodal Accounts). Disputed funds are frozen in the nodal bank account, not in a KrishiSetu custodial wallet.

### Q27: "What happens if a buyer receives the tomatoes, claims 20% are crushed, and refuses to pay?"
**Answer**: Our system handles partial acceptance and dispute reconciliation:
1. The buyer submits proof of damage, accepting e.g. 80% of the consignment.
2. The accepted 80% payout is **immediately released to farmers**, ensuring they are not starved of cash.
3. The remaining 20% is held in the nodal account under a formal dispute ticket with a **24-hour SLA**.
4. The FPO collection manager is notified to review transit dispatch logs and physical crate seals to resolve or refund the balance.

### Q28: "How does KrishiSetu AI generate sustainable revenue without exploiting farmers?"
**Answer**: KrishiSetu operates a B2B SaaS and transaction facilitation model:
1. **Zero Farmer Fees**: Basic grading, price discovery, and pooling are 100% free for farmers.
2. **Institutional Buyer Convenience Fee (0.75% - 1.25%)**: Charged to bulk buyers for quality-graded consignment sourcing, route optimization, and digital settlements.
3. **Enterprise FPO Dashboard Tier**: Nominal annual subscription for large FPOs utilizing automated fleet management and multi-cluster member accounting.

### Q29: "Does your platform violate state APMC Acts or bypass mandi market committees?"
**Answer**: No. KrishiSetu operates in full harmony with state APMC regulations:
1. It supports direct APMC yard sales by helping farmers choose the best nearby mandi.
2. In-transit transactions account for statutory APMC market cess and commission fees (default 5%) in the net realization calculator.
3. For direct FPO-to-B2B institutional sales, it operates under state Direct Marketing Licenses (DML) granted to certified Farmer Producer Companies.

### Q30: "What is your roadmap to scale from the Baramati Tomato pilot to the rest of India?"
**Answer**: Our scaling roadmap follows a 3-stage horticultural expansion:
1. **Phase 1 (Months 1–3)**: Expand from Tomato to Onion and Pomegranate across Western Maharashtra (Nashik, Pune, Solapur clusters).
2. **Phase 2 (Months 4–8)**: Integrate live Government of India APIs—e-NAM/Agmarknet daily feeds, Digital Bhashini voice pipelines, and ONDC Beckn protocol for open buyer discovery.
3. **Phase 3 (Months 9–12)**: Partner with national FPO federations (SFAC, NAFED, Sahyadri Farms) to onboard 50,000+ smallholders across multi-state horticultural corridors.
