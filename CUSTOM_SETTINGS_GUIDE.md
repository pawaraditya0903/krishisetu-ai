# KrishiSetu AI – Market Discovery & Custom Cost Settings Guide

## 1. Overview
Agricultural economics vary widely between perishable horticultural crops (e.g. tomatoes, grapes) and non-perishable commodities (e.g. wheat, soyabean, cotton). The **Platform Settings Engine** (`/admin/settings`) allows administrators and farmers to configure discovery boundaries and cost deduction formulas to reflect real-world market economics.

---

## 2. Search Radius Boundaries (25 km to 1000 km)

### Granular Preset Radius Pills:
- **25 km**: Ultra-local rural village markets and nearby farmer kiosks.
- **50 km**: Standard sub-district APMCs (e.g. Parbhani, Baramati, Niphad).
- **100 km**: District headquarters and primary aggregation hubs.
- **200 km**: Regional commercial centers (e.g. Pune, Jalna, Chhatrapati Sambhajinagar).
- **300 km**: State-level agricultural trading terminals (e.g. Solapur, Nashik).
- **500 km**: Major metropolitan consumption terminals (e.g. Vashi APMC Mumbai).
- **1000 km (Pan-India)**: National megamarkets (e.g. Azadpur APMC Delhi, Bengaluru, Ahmedabad).

### Expandable Custom Range Slider:
- Clicking the **"Custom Slider"** toggle in `/farmer/market` reveals a smooth numerical slider ranging from **25 km to 1000 km** in 5 km increments.
- As the slider moves:
  - The map radius circle overlay smoothly expands or contracts.
  - The candidate mandi list dynamically re-evaluates.
  - An intelligent counter displays the number of qualifying mandis (e.g. *Found 14 mandis within 285 km*).

---

## 3. Dynamic Cost Deduction Engine Formula
The **Net Realized Payout** for a farmer selling $Q$ quintals of produce at an APMC with modal price $P_{\text{modal}}$ located $D$ km away is calculated as:

$$\text{Gross Value} = P_{\text{modal}} \times Q$$

$$\text{Deductions} = \text{Freight} + \text{Handling} + \text{Packaging} + \text{Commission} + \text{Spoilage} + \text{FPO Fee}$$

Where:
- $\text{Freight} = D \times \text{Rate}_{\text{per\_km}}$
- $\text{Handling} = \text{Fixed or per-qtl loading/unloading (Hamali)}$
- $\text{Packaging} = \text{Crate rental and strapping fee}$
- $\text{Commission} = \text{Gross Value} \times \text{Commission \%}$
- $\text{Spoilage Loss} = \text{Gross Value} \times \text{Transit Spoilage Buffer \%}$
- $\text{FPO Fee} = \text{Gross Value} \times \text{FPO Facilitation \%}$

$$\text{Net Realized Total} = \max(0, \text{Gross Value} - \text{Deductions})$$
$$\text{Net Realized Per Quintal} = \frac{\text{Net Realized Total}}{Q}$$

---

## 4. Multi-Scenario Projections
In addition to the expected modal outcome, the dynamic calculator simultaneously renders:
1. **Low Scenario**: Evaluates minimum arrival price ($P_{\text{min}}$) after full deductions.
2. **Expected Scenario**: Evaluates median modal price ($P_{\text{modal}}$) with standard parameters.
3. **High Scenario**: Evaluates premium top-grade price ($P_{\text{max}}$) for certified Grade A produce.

Farmers can simulate varying vehicle types (e.g. sharing an FPO reefer truck lowers freight and eliminates transit spoilage) to make informed dispatch decisions.
