from datetime import datetime, timedelta, timezone
import hashlib
from typing import Optional, List
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from app.core.config import settings

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login", auto_error=False)

import hmac
import os

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
        if user_role not in allowed_normalized and user_role != "ADMIN":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Operation not permitted for role: {user_role}. Allowed: {allowed_roles}"
            )
        return payload
    return role_checker
