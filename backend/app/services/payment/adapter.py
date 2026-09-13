import uuid
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone

class PaymentAdapter:
    """
    Abstract regulated payment gateway interface.
    KrishiSetu strictly acts as a facilitator and never holds escrow or deposits directly.
    """
    def authorize_payment(self, pool_id: str, buyer_id: str, amount_paise: int) -> Dict[str, Any]:
        raise NotImplementedError

    def release_to_farmers(
        self,
        pool_id: str,
        contributions: List[Dict[str, Any]],
        price_per_qtl: float,
        accepted_ratio: float = 1.0,
        dispute_reason: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        raise NotImplementedError

    def raise_dispute(self, pool_id: str, buyer_id: str, reason: str) -> Dict[str, Any]:
        raise NotImplementedError

class SandboxPaymentAdapter(PaymentAdapter):
    """
    Deterministic Sandbox Payment Gateway Adapter simulating RBI-regulated nodal account operations.
    """

    def authorize_payment(self, pool_id: str, buyer_id: str, amount_paise: int) -> Dict[str, Any]:
        txn_id = f"KS-TXN-{uuid.uuid4().hex[:10].upper()}"
        nodal_ref = f"YESB0000109-NODAL-ESCROW-SANDBOX-{txn_id[-4:]}"
        return {
            "transaction_id": txn_id,
            "status": "PAYMENT_AUTHORIZED",
            "amount_paise": amount_paise,
            "amount_inr": amount_paise / 100.0,
            "nodal_account_ref": nodal_ref,
            "authorized_at": datetime.now(timezone.utc).isoformat(),
            "advance_payout_inr": 0.0,
            "advance_policy": "Zero-Advance Safeguard: ₹0 upfront payout before physical verification to prevent non-delivery default",
            "milestone_schedule": {
                "stage_1_deposit": "100% funds held in RBI Scheduled Commercial Bank Nodal Account",
                "stage_2_fpo_checkin": "80% released upon physical weigh-bridge verification and signed QR receipt",
                "stage_3_delivery": "20% released following 24h buyer transit inspection window"
            },
            "buyer_protection": "100% automatic refund from nodal account if harvest is not checked in at FPO within pickup SLA",
            "disclaimer": "Funds securely placed on hold in scheduled commercial bank nodal account (RBI PA/PG guidelines compliant)."
        }

    def release_to_farmers(
        self,
        pool_id: str,
        contributions: List[Dict[str, Any]],
        price_per_qtl: float,
        accepted_ratio: float = 1.0,
        dispute_reason: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        settlements = []
        for c in contributions:
            weight_kg = c.get("quantity_kg", 450.0)
            full_gross = (weight_kg / 100.0) * price_per_qtl
            gross_accepted = full_gross * accepted_ratio
            disputed_hold = full_gross * (1.0 - accepted_ratio)

            freight = weight_kg * 0.85 # shared freight discount
            packaging = weight_kg * 0.35
            handling = weight_kg * 0.15
            fpo_fee = gross_accepted * 0.015
            quality_adj = 0.0
            net = max(0.0, gross_accepted - freight - packaging - handling - fpo_fee - quality_adj)

            status = "RELEASED" if accepted_ratio >= 0.999 else "PARTIALLY_RELEASED"

            settlements.append({
                "settlement_id": f"SET-{uuid.uuid4().hex[:8].upper()}",
                "transaction_id": f"KS-TXN-{uuid.uuid4().hex[:8].upper()}",
                "farmer_id": c.get("farmer_id", "F1"),
                "farmer_name": c.get("farmer_name", "Ramesh Patil"),
                "pool_id": pool_id,
                "amount_inr": round(net, 2),
                "status": status,
                "accepted_ratio": round(accepted_ratio, 2),
                "disputed_hold_inr": round(disputed_hold, 2),
                "dispute_reason": dispute_reason,
                "date": datetime.now(timezone.utc).isoformat(),
                "breakdown": {
                    "gross_inr": round(gross_accepted, 2),
                    "full_lot_gross_inr": round(full_gross, 2),
                    "disputed_held_inr": round(disputed_hold, 2),
                    "freight_inr": round(freight, 2),
                    "packaging_inr": round(packaging, 2),
                    "handling_inr": round(handling, 2),
                    "fpo_fee_inr": round(fpo_fee, 2),
                    "quality_adj_inr": round(quality_adj, 2),
                    "net_payout_inr": round(net, 2)
                }
            })
        return settlements

    def raise_dispute(self, pool_id: str, buyer_id: str, reason: str) -> Dict[str, Any]:
        return {
            "dispute_id": f"DISP-{uuid.uuid4().hex[:6].upper()}",
            "pool_id": pool_id,
            "buyer_id": buyer_id,
            "status": "DISPUTE_RAISED",
            "reason": reason,
            "funds_status": "FROZEN_IN_NODAL_ACCOUNT",
            "sla_deadline_hours": 24,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }

payment_adapter = SandboxPaymentAdapter()
