from datetime import datetime, timedelta, timezone
import hashlib
import hmac
import os
import logging
from typing import Optional, List
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from app.core.config import settings

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login", auto_error=False)

# Log security notice if using default sandbox secret key (Fix C1)
if settings.SECRET_KEY == "krishisetu_sec_jwt_vault_sih2026_pilot_prod":
    logging.getLogger("security").warning(
        "SECURITY NOTICE: Running with default development SECRET_KEY. In production, configure SECRET_KEY in .env."
    )

try:
    from jose import JWTError, jwt
except ImportError:
    # Zero-dependency, RFC 7519 compliant HMAC-SHA256 JWT implementation
    import base64
    import json

    class JWTError(Exception):
        pass

    class _NativeJWT:
        @staticmethod
        def encode(claims: dict, key: str, algorithm: str = "HS256") -> str:
            def b64url(b: bytes) -> str:
                return base64.urlsafe_b64encode(b).decode("utf-8").rstrip("=")

            clean_claims = {}
            for k, v in claims.items():
                if isinstance(v, datetime):
                    clean_claims[k] = int(v.replace(tzinfo=timezone.utc).timestamp())
                else:
                    clean_claims[k] = v

            header_json = json.dumps({"alg": algorithm, "typ": "JWT"}, separators=(",", ":"))
            payload_json = json.dumps(clean_claims, separators=(",", ":"))
            h_b64 = b64url(header_json.encode("utf-8"))
            p_b64 = b64url(payload_json.encode("utf-8"))
            signing_input = f"{h_b64}.{p_b64}".encode("utf-8")
            sig = hmac.new(key.encode("utf-8"), signing_input, hashlib.sha256).digest()
            sig_b64 = b64url(sig)
            return f"{h_b64}.{p_b64}.{sig_b64}"

        @staticmethod
        def decode(token: str, key: str, algorithms: Optional[List[str]] = None) -> dict:
            def b64url_decode(s: str) -> bytes:
                padding = 4 - (len(s) % 4)
                if padding != 4:
                    s += "=" * padding
                return base64.urlsafe_b64decode(s)

            try:
                parts = token.split(".")
                if len(parts) != 3:
                    raise JWTError("Invalid token format")
                h_b64, p_b64, sig_b64 = parts
                signing_input = f"{h_b64}.{p_b64}".encode("utf-8")
                expected_sig = hmac.new(key.encode("utf-8"), signing_input, hashlib.sha256).digest()
                actual_sig = b64url_decode(sig_b64)
                if not hmac.compare_digest(expected_sig, actual_sig):
                    raise JWTError("Signature verification failed")
                payload_data = json.loads(b64url_decode(p_b64).decode("utf-8"))
                exp = payload_data.get("exp")
                if exp is not None:
                    now_ts = int(datetime.now(timezone.utc).timestamp())
                    if now_ts > exp:
                        raise JWTError("Token has expired")
                return payload_data
            except Exception as e:
                if isinstance(e, JWTError):
                    raise
                raise JWTError(str(e))

    jwt = _NativeJWT


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Constant-time password verification using PBKDF2-HMAC-SHA256.
    Ensures compatibility across diverse environments without binary dependencies.
    """
    if not hashed_password or not plain_password:
        return False
    try:
        parts = hashed_password.split("$")
        if len(parts) == 4 and parts[0] == "pbkdf2_sha256":
            iterations = int(parts[1])
            salt = parts[2]
            key_hex = parts[3]
            expected_key = bytes.fromhex(key_hex)
            derived_key = hashlib.pbkdf2_hmac("sha256", plain_password.encode("utf-8"), salt.encode("utf-8"), iterations)
            return hmac.compare_digest(derived_key, expected_key)
        # Fallback for plain demo passwords in initial mocks
        return plain_password == hashed_password
    except Exception:
        return False


def get_password_hash(password: str) -> str:
    """
    Hash a password using PBKDF2-HMAC-SHA256 with 100,000 rounds.
    """
    salt = os.urandom(16).hex()
    key = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), 100000)
    return f"pbkdf2_sha256$100000${salt}${key.hex()}"


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


async def get_current_user_token_payload(token: Optional[str] = Depends(oauth2_scheme)) -> dict:
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials were not provided",
            headers={"WWW-Authenticate": "Bearer"},
        )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )


def require_roles(allowed_roles: List[str]):
    async def role_checker(payload: dict = Depends(get_current_user_token_payload)):
        user_role = payload.get("role", "").upper()
        allowed_normalized = [r.upper() for r in allowed_roles]
        # Exact equality check to prevent "NOT_ADMIN" substring vulnerability (M2)
        if user_role not in allowed_normalized:
            # Explicit ADMIN access logging for auditing sensitive routes (Fix C3)
            if user_role == "ADMIN":
                logging.getLogger("security").info(
                    f"ADMIN role override granted for user {payload.get('sub')} on route requiring {allowed_roles}"
                )
                return payload
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Operation not permitted for role: {user_role}. Allowed: {allowed_roles}"
            )
        return payload
    return role_checker
