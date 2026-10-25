from typing import Dict, Any, Optional

class NetRealizationEngine:
    """
    Transparent net price calculation engine.
    Deducts freight, handling, packaging, APMC commission, and in-transit spoilage
    from gross mandi value to calculate actual farmer take-home payout across min, modal, and max scenarios.
    """

    @staticmethod
    def calculate_net(
        mandi_name: str,
        distance_km: float,
        modal_price_per_qtl: float,
        quantity_kg: float,
        freight_per_km: float = 15.0,
        handling_fee: float = 180.0,
        packaging_fee: float = 150.0,
        commission_pct: float = 5.0,
        spoilage_pct: float = 2.0,
        is_pooled: bool = False,
        min_price_per_qtl: Optional[float] = None,
        max_price_per_qtl: Optional[float] = None
    ) -> Dict[str, Any]:
        qtl = quantity_kg / 100.0
        gross_revenue = modal_price_per_qtl * qtl

        # Group pooling reduces freight by 28.5%
        raw_freight = distance_km * freight_per_km
        effective_freight = raw_freight * 0.715 if is_pooled else raw_freight

        commission = gross_revenue * (commission_pct / 100.0)
        spoilage_loss = gross_revenue * (spoilage_pct / 100.0)
        fpo_service_fee = gross_revenue * 0.015 if is_pooled else 0.0

        total_deductions = (
            effective_freight
            + handling_fee
            + packaging_fee
            + commission
            + spoilage_loss
            + fpo_service_fee
        )

        net_realization = max(0.0, gross_revenue - total_deductions)
        net_per_qtl = net_realization / qtl if qtl > 0 else 0.0

        assumptions = [
            f"Gross price based on latest APMC bulletin for {mandi_name} (₹{modal_price_per_qtl}/qtl).",
            f"Distance calculated from Baramati FPO Hub: {distance_km} km.",
            f"Transport: {'Group pooled freight (28.5% saving)' if is_pooled else 'Solo dedicated transport'}.",
            f"Spoilage risk buffer: {spoilage_pct}% for ambient transport."
        ]

        # Multi-scenario projection (Min, Modal, Max)
        min_p = min_price_per_qtl if min_price_per_qtl is not None else modal_price_per_qtl * 0.90
        max_p = max_price_per_qtl if max_price_per_qtl is not None else modal_price_per_qtl * 1.10

        def calc_scenario(p: float):
            g = p * qtl
            comm = g * (commission_pct / 100.0)
            spoil = g * (spoilage_pct / 100.0)
            fpo = g * 0.015 if is_pooled else 0.0
            d = effective_freight + handling_fee + packaging_fee + comm + spoil + fpo
            n = max(0.0, g - d)
            return {
                "price_per_qtl": round(p, 2),
                "gross_inr": round(g, 2),
                "deductions_inr": round(d, 2),
                "net_realization_inr": round(n, 2),
                "net_per_quintal_inr": round(n / qtl, 2) if qtl > 0 else 0.0
            }

        scenarios = {
            "min_worst_case": calc_scenario(min_p),
            "modal_expected": calc_scenario(modal_price_per_qtl),
            "max_best_case": calc_scenario(max_p)
        }

        waterfall_breakdown = [
            {
                "step": 1,
                "item": "Gross Realization",
                "amount_inr": round(gross_revenue, 2),
                "sign": "+",
                "description": f"₹{modal_price_per_qtl:.2f}/qtl × {qtl:.2f} quintals"
            },
            {
                "step": 2,
                "item": "Freight Transit Deduction",
                "amount_inr": round(effective_freight, 2),
                "sign": "-",
                "description": f"{distance_km} km @ ₹{freight_per_km}/km {'(Cooperative Pooled: 28.5% savings)' if is_pooled else '(Solo transit)'}"
            },
            {
                "step": 3,
                "item": "Mandi Handling & Staging",
                "amount_inr": round(handling_fee, 2),
                "sign": "-",
                "description": "Unloading, crate staging & weigh-slip fee"
            },
            {
                "step": 4,
                "item": "Packaging & Crating",
                "amount_inr": round(packaging_fee, 2),
                "sign": "-",
                "description": "Ventilated plastic crate amortization fee"
            },
            {
                "step": 5,
                "item": "APMC Commission / Cess",
                "amount_inr": round(commission, 2),
                "sign": "-",
                "description": f"{commission_pct}% statutory commission on gross clearance"
            },
            {
                "step": 6,
                "item": "In-Transit Spoilage Buffer",
                "amount_inr": round(spoilage_loss, 2),
                "sign": "-",
                "description": f"{spoilage_pct}% transit physical damage / shrinkage buffer"
            },
            {
                "step": 7,
                "item": "FPO Cooperative Service Fee",
                "amount_inr": round(fpo_service_fee, 2),
                "sign": "-",
                "description": "1.5% aggregation & testing fee" if is_pooled else "₹0.00 (Non-pooled solo run)"
            },
            {
                "step": 8,
                "item": "Net Farmer Take-Home Payout",
                "amount_inr": round(net_realization, 2),
                "sign": "=",
                "description": f"₹{net_per_qtl:.2f}/quintal credited to bank account"
            }
        ]

        return {
            "mandi_name": mandi_name,
            "distance_km": distance_km,
            "gross_revenue_inr": round(gross_revenue, 2),
            "freight_deduction_inr": round(effective_freight, 2),
            "handling_deduction_inr": round(handling_fee, 2),
            "packaging_deduction_inr": round(packaging_fee, 2),
            "commission_deduction_inr": round(commission, 2),
            "spoilage_deduction_inr": round(spoilage_loss, 2),
            "fpo_fee_inr": round(fpo_service_fee, 2),
            "net_realization_inr": round(net_realization, 2),
            "net_per_quintal_inr": round(net_per_qtl, 2),
            "assumptions": assumptions,
            "scenarios": scenarios,
            "waterfall_breakdown": waterfall_breakdown
        }
