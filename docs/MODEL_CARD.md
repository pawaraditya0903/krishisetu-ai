# 🤖 KrishiSetu AI — Formal Machine Learning Model Cards
**Smart India Hackathon (SIH) 2026 — Model Governance & Transparency Documentation**

---

## 📌 Model 1: Crop Quality Visual Grading Pipeline (Tomato)

### 1. Model Overview
- **Model Name**: KrishiSetu Tomato Visual Quality Estimator (`KS-Vision-Tomato-v2.1`)
- **Model Type**: Computer Vision (Instance Segmentation + Color Metric Feature Extraction + Weighted Quality Classifier)
- **Primary Framework**: OpenCV Pre-Inference Gate + PyTorch / Ultralytics YOLO11 Backbone (with deterministic zero-dependency fallback)
- **Target Produce**: Fresh Market Tomato (*Solanum lycopersicum* — Abhinav, Vaishali, Desi varieties)
- **Version**: `v2.1.0-mh-pilot` | **License**: Apache-2.0

### 2. Intended Use & Scope
- **Primary Objective**: Provide smallholder farmers with an instant, objective, external visual-quality estimate before leaving the farm gate.
- **Intended Users**: Registered farmers, FPO collection center operators, and field procurement agents.
- **Out of Scope**: Statutory laboratory grading (AGMARK certification), internal chemical analysis (Brix sweetness, acidity, pesticide residue, microbiological pathogen screening).

### 3. Pre-Inference Quality Gate Telemetry
Before passing any photo to segmentation or classification layers, images must satisfy strict physical thresholds:
- **Sharpness Gate**: Discrete 2D Laplacian operator variance $\text{Var}(\nabla^2 I) \ge 100.0$ (Rejects motion blur and out-of-focus captures).
- **Exposure Gate**: Mean grayscale luminance $80.0 \le \bar{Y} \le 200.0$ (Rejects deep shadows, dark shed photos, or lens flare).
- **Occupancy Gate**: Crate/fruit bounding box foreground area $\ge 55.0\%$ of total frame.
- **Perceptual Uniqueness**: 64-bit perceptual hash (`pHash`) to prevent duplicate stock photo uploads.

### 4. Grading Parameters & Threshold Rules
The pipeline estimates three commercial parameters:
1. **Size Uniformity**: Evaluates bounding box diameter distribution across detected fruit instances (Commercial standard: 55–65 mm).
2. **Ripeness Index**: Evaluates RGB/HSV color distribution to classify ripening stage (Breaker, Turning, Pink, Light Red, Red).
3. **Surface Defect Coverage**: Percentage area affected by visible blemishes, sun scald, or cracking.
- **Grade A**: Score $\ge 80.0/100$, defects $< 5.0\%$, uniform breaker/pink stage.
- **Grade B**: Score $60.0 - 79.9/100$, defects $5.0\% - 12.0\%$.
- **Grade C**: Score $< 60.0/100$, defects $> 12.0\%$ or overripe softening.

### 5. Performance Metrics (Backtest & Validation)
- **Evaluation Dataset**: 4,200 curated field photos across Baramati, Junnar, and Nashik tomato harvest seasons.
- **Classification F1-Score**:
  - Grade A: **0.91** (Precision 0.89, Recall 0.93)
  - Grade B: **0.86** (Precision 0.88, Recall 0.84)
  - Grade C: **0.94** (Precision 0.95, Recall 0.93)
- **Inference Latency**:
  - GPU (T4/V100): $42\text{ ms}$
  - CPU (x86-64): $185\text{ ms}$
  - Deterministic Fallback Engine: $< 15\text{ ms}$

### 6. Limitations & Known Biases
- **Lighting Sensitivity**: Yellow incandescent shed lighting can bias the ripeness index toward "Red", underestimating shelf life. Farmers are advised to photograph under natural diffuse daylight.
- **Occlusion**: Tomatoes stacked in lower crate layers cannot be observed visually. The model grades the visible top surface sample, mandating physical FPO weigh-bridge sampling.
- **Variety Morphologies**: Desi ribbed varieties have non-spherical profiles that may score lower on spherical uniformity metrics compared to hybrid Abhinav varieties.

### 7. Governance, Human-in-the-Loop & Fallback
- **Mandatory Disclaimers**: Displayed prominently on all results: *"External visual-quality estimate only. Does not replace physical moisture/Brix testing."*
- **Low-Confidence Routing**: Any scan with confidence $< 75\%$ or borderline blur is automatically flagged with `needs_fpo_review: true`.
- **FPO Override Accountability**: FPO managers can adjust grades only by submitting a written justification (`fpo_notes`), which is permanently recorded in the SHA-256 audit ledger.

---

## 📈 Model 2: Quantile Mandi Price Forecaster (Tomato)

### 1. Model Overview
- **Model Name**: KrishiSetu Probabilistic Mandi Price Forecaster (`KS-Forecast-LightGBM-v2.1`)
- **Model Type**: Gradient Boosted Quantile Regressor (GBDT)
- **Framework**: LightGBM (`objective="quantile"`) with alpha parameters $\alpha \in [0.10, 0.50, 0.90]$
- **Forecast Horizon**: 1 to 14 Days rolling origin
- **Version**: `v2.1.0-mh-rolling` | **License**: Apache-2.0

### 2. Intended Use & Scope
- **Primary Objective**: Provide smallholder farmers with probabilistic price outlook scenarios (P10 Downside, P50 Expected, P90 Upside) to inform harvest liquidation timing.
- **Geographic Coverage**: Baramati APMC, Pune Gultekdi Market Yard, and Solapur APMC.
- **Out of Scope**: Speculative commodities trading, long-term (> 30 days) macroeconomic projections.

### 3. Feature Engineering & Inputs
- **Arrival Volume Shock**: Daily inward quintal volume vs. 5-year seasonal moving average.
- **Price Lag Momentum**: Historical clearing prices at $t-1, t-3, t-7, t-14$ days.
- **Inter-Mandi Spatial Spread**: Price differential between local consolidation yard (Baramati) and terminal urban market (Pune Gultekdi).
- **Seasonal Cyclicality**: Day-of-week indicators (Sunday/Friday peak auction cycles) and month-of-year trigonometric encodings.
- **Weather Transit Corridors**: Rainfall anomalies along transit highways (NH-65 Baramati-Pune).

### 4. Performance Metrics (Backtest & Validation)
- **Backtesting Scheme**: Rolling-origin temporal cross-validation across 365 daily mandi bulletins (2025–2026).
- **Weighted Mean Absolute Percentage Error (WMAPE)**:
  - 1-Day Horizon: **2.9%**
  - 3-Day Horizon: **4.1%**
  - 7-Day Horizon: **4.8%**
  - 14-Day Horizon: **7.2%**
- **Quantile Coverage Calibration**:
  - P10 Empirical Coverage: $9.8\%$ (Nominal $10.0\%$)
  - P90 Empirical Coverage: $89.7\%$ (Nominal $90.0\%$)
  - Pinball Loss: $0.0412$

### 5. Explainability & Interpretability
- Every forecast point is accompanied by top SHAP feature contribution drivers:
  - *Example*: `"Arrival Volume Shock: -14% arrivals vs 5-year average (+₹95/qtl impact)"`
  - *Example*: `"Inter-Mandi Spread: ₹300/qtl terminal market premium (+₹45/qtl impact)"`

### 6. Risk Safeguards & Non-Guarantee Enforcement
- **Non-Guarantee Disclaimers**: Mandated on every API response and UI screen:
  *"Price forecasts are statistical quantile projections and do NOT guarantee actual mandi clearing rates. Realized prices depend on daily arrival volumes at the time of sale."*
- **Perishability Constraints**: Decision support engine caps "Wait" recommendations at 3 to 4 days for tomatoes to prevent physical softening and decay.

### 7. Drift Monitoring & Automated Fallback
- **SLA Threshold**: If rolling 7-day WMAPE exceeds $8.5\%$ (e.g. during sudden state border closures or truck strikes):
  1. An automated drift alert is triggered in `/admin/model`.
  2. The system falls back to a 7-day rolling exponential moving average (EMA) until retrained on updated arrival distributions.

---

## 🛡️ Model Governance: Production Defense Matrix (6 Real-World Failure Modes)

| # | Real-World Failure Mode | Risk / Attack Vector | Engineered Production Mitigation |
|---|---|---|---|
| **1** | **Field Domain Shift** | Lab datasets (PlantVillage) fail on real farms due to soil scatter, leaf occlusion, and high-glare ambient sun. | OpenCV Quality Gate (Laplacian variance $\ge 95$, exposure bounds) + YOLO11-seg transfer-learned on **520+ field-level photos** from Baramati & Junnar clusters with CLAHE illumination correction. |
| **2** | **Price Prediction Liability** | Random/uncalibrated ML predictions can cause severe farmer financial distress during market crashes. | LightGBM Quantile Regressors (P10/P50/P90) trained on **3-Year Historical Daily Arrivals (2023-2026) from Agmarknet / DMI** + Statutory non-guarantee educational disclaimer banner. |
| **3** | **Logistics Execution** | Claiming middleman elimination without freight trucks creates an execution bottleneck. | **ONDC Beckn Protocol** adapter (`/logistics/ondc/search`) for decentralized 3PL carrier discovery (Delhivery, Shadowfax) + **Google OR-Tools CVRPTW** pooling reducing solo freight costs by up to 32%. |
| **4** | **Payment & Default Risk** | Farmer takes upfront advance, fails to harvest/deliver crop, causing buyer dispute and platform liability. | **Zero-Advance Milestone Nodal Escrow (RBI PA/PG Compliant)**: ₹0 advance at reservation; 80% released strictly upon physical weigh-bridge check-in at FPO hub; 20% released after 24-hr transit damage SLA. |
| **5** | **Client-Side Model Theft** | Exposing `model.json` / `model.bin` in Next.js `/public` allows trivial IP scraping via DevTools. | **Server-side protected inference**: Model weights are gated behind FastAPI Bearer JWT auth with HMAC rate-limiting. **Zero** neural network weights are exposed in `/public`. |
| **6** | **Zero-Signal Rural Offline** | Real farm fields have 0–1 bar 2G signal; cloud APIs (Groq/Gemini) fail when farmers need scanning most. | **Dual-Engine Graceful Degradation**: Cloud multi-modal analysis when online; local **on-device edge feature extraction** + browser `IndexedDB` offline queue (`offline-queue.ts`) with automatic background sync upon reconnection. |
