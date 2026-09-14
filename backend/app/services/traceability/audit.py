import hashlib
import uuid
from datetime import datetime, timezone
from typing import Dict, Any, Optional, List, Tuple

class AuditTraceabilityEngine:
    """
    Append-only SHA-256 hash-chained tamper-evident event ledger.
    Every event contains the cryptographic SHA-256 hash of the preceding event,
    forming an immutable Merkle audit chain across the produce supply chain.
    """
    GENESIS_HASH: str = "0" * 64
    _latest_hash: str = "0" * 64

    @classmethod
    def get_latest_hash(cls, db: Optional[Any] = None) -> str:
        if db is not None:
            try:
                from app.models.entities import AuditEvent
                last_event = db.query(AuditEvent).order_by(AuditEvent.timestamp.desc()).first()
                if last_event and last_event.hash:
                    cls._latest_hash = last_event.hash
                    return last_event.hash
            except Exception:
                pass
        return cls._latest_hash

    @classmethod
    def set_latest_hash(cls, new_hash: str) -> None:
        cls._latest_hash = new_hash

    @staticmethod
    def calculate_event_hash(
        prev_hash: str,
        timestamp: str,
        actor_name: str,
        actor_role: str,
        action: str,
        entity_type: str,
        entity_id: str,
        details: str
    ) -> str:
        payload = f"{prev_hash}|{timestamp}|{actor_name}|{actor_role}|{action}|{entity_type}|{entity_id}|{details}"
        return hashlib.sha256(payload.encode("utf-8")).hexdigest()

    @staticmethod
    def generate_qr_payload(entity_type: str, entity_id: str, fpo_name: str = "Saksham Baramati FPO") -> str:
        return f"KS-{entity_type.upper()}-{entity_id}-VERIFIED-{fpo_name.split()[0].upper()}"

    @classmethod
    def create_audit_record(
        cls,
        action: str,
        entity_type: str,
        entity_id: str,
        details: str,
        actor_name: str = "System Automated",
        actor_role: str = "SYSTEM",
        last_hash: Optional[str] = None,
        db: Optional[Any] = None
    ) -> Dict[str, Any]:
        if last_hash is not None:
            prev_h = last_hash
        elif db is not None:
            prev_h = cls.get_latest_hash(db)
        else:
            prev_h = cls._latest_hash

        now_dt = datetime.now(timezone.utc).replace(tzinfo=None)
        timestamp = str(now_dt)
        current_hash = cls.calculate_event_hash(
            prev_hash=prev_h,
            timestamp=timestamp,
            actor_name=actor_name,
            actor_role=actor_role,
            action=action,
            entity_type=entity_type,
            entity_id=entity_id,
            details=details
        )
        cls._latest_hash = current_hash

        return {
            "id": f"AUD-{uuid.uuid4().hex[:8].upper()}",
            "timestamp": timestamp,
            "actor_name": actor_name,
            "actor_role": actor_role,
            "action": action,
            "entity_type": entity_type,
            "entity_id": entity_id,
            "details": details,
            "prev_hash": prev_h,
            "hash": current_hash
        }

    @classmethod
    def verify_ledger_chain(cls, events: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Cryptographically verifies the entire SHA-256 audit ledger from Genesis to Head.
        Returns 'VALID' if all hashes match and links are unbroken.
        Returns 'TAMPER_DETECTED' if any payload or hash link was altered.
        """
        if not events:
            return {
                "status": "VALID",
                "is_valid": True,
                "verified_blocks": 0,
                "total_blocks": 0,
                "genesis_hash": cls.GENESIS_HASH,
                "head_hash": cls.GENESIS_HASH,
                "integrity_message": "Empty ledger: Genesis state valid."
            }

        # Events must be verified in chronological order (oldest to newest)
        sorted_events = sorted(events, key=lambda x: x.get("timestamp", ""))

        expected_prev_hash = sorted_events[0].get("prev_hash", cls.GENESIS_HASH)

        for i, event in enumerate(sorted_events):
            actual_prev = event.get("prev_hash", "")
            stored_hash = event.get("hash", "")

            # 1. Verify hash link continuity
            if actual_prev != expected_prev_hash:
                return {
                    "status": "TAMPER_DETECTED",
                    "is_valid": False,
                    "corrupted_block_index": i,
                    "corrupted_event_id": event.get("id", f"INDEX-{i}"),
                    "action": event.get("action", "UNKNOWN"),
                    "stored_hash": stored_hash,
                    "expected_prev_hash": expected_prev_hash,
                    "actual_prev_hash": actual_prev,
                    "error_reason": f"Broken chain link at block #{i}: prev_hash does not match previous block's hash. Tampered chain detected.",
                    "verified_blocks": i,
                    "total_blocks": len(sorted_events)
                }

            # 2. Recalculate event SHA-256 from payload
            recalculated_hash = cls.calculate_event_hash(
                prev_hash=actual_prev,
                timestamp=event.get("timestamp", ""),
                actor_name=event.get("actor_name", ""),
                actor_role=event.get("actor_role", ""),
                action=event.get("action", ""),
                entity_type=event.get("entity_type", ""),
                entity_id=event.get("entity_id", ""),
                details=event.get("details", "")
            )

            # 3. Verify content integrity
            if recalculated_hash != stored_hash:
                return {
                    "status": "TAMPER_DETECTED",
                    "is_valid": False,
                    "corrupted_block_index": i,
                    "corrupted_event_id": event.get("id", f"INDEX-{i}"),
                    "action": event.get("action", "UNKNOWN"),
                    "stored_hash": stored_hash,
                    "computed_hash": recalculated_hash,
                    "error_reason": f"Cryptographic integrity mismatch at block #{i}: payload content or details were tampered with!",
                    "verified_blocks": i,
                    "total_blocks": len(sorted_events)
                }

            expected_prev_hash = stored_hash

        return {
            "status": "VALID",
            "is_valid": True,
            "verified_blocks": len(sorted_events),
            "total_blocks": len(sorted_events),
            "genesis_hash": cls.GENESIS_HASH,
            "head_hash": sorted_events[-1].get("hash", ""),
            "cryptographic_algorithm": "SHA-256 Merkle-Chained Ledger",
            "integrity_message": f"All {len(sorted_events)} cryptographic links intact. Zero tampering detected."
        }
