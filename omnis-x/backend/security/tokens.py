"""
Cryptographic Token Management.
Standard HMAC-SHA256 JWT encoding and verification without external dependencies.
"""
import hmac
import hashlib
import base64
import json
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
from backend.config import settings


def _base64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).decode("utf-8").rstrip("=")


def _base64url_decode(data: str) -> bytes:
    padding = 4 - (len(data) % 4)
    if padding != 4:
        data += "=" * padding
    return base64.urlsafe_b64decode(data.encode("utf-8"))


def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Creates an HMAC-SHA256 signed JWT token."""
    to_encode = data.copy()
    now = datetime.utcnow()
    expire = now + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": int(expire.timestamp()), "iat": int(now.timestamp())})

    header = {"alg": "HS256", "typ": "JWT"}
    header_bytes = json.dumps(header, separators=(",", ":")).encode("utf-8")
    payload_bytes = json.dumps(to_encode, separators=(",", ":")).encode("utf-8")

    header_b64 = _base64url_encode(header_bytes)
    payload_b64 = _base64url_encode(payload_bytes)
    signing_input = f"{header_b64}.{payload_b64}".encode("utf-8")

    signature = hmac.new(
        settings.JWT_SECRET_KEY.encode("utf-8"),
        signing_input,
        hashlib.sha256,
    ).digest()
    sig_b64 = _base64url_encode(signature)

    return f"{header_b64}.{payload_b64}.{sig_b64}"


def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    """Decodes and validates an HMAC-SHA256 signed JWT token."""
    try:
        parts = token.split(".")
        if len(parts) != 3:
            return None

        header_b64, payload_b64, sig_b64 = parts
        signing_input = f"{header_b64}.{payload_b64}".encode("utf-8")

        expected_sig = hmac.new(
            settings.JWT_SECRET_KEY.encode("utf-8"),
            signing_input,
            hashlib.sha256,
        ).digest()

        if not hmac.compare_digest(expected_sig, _base64url_decode(sig_b64)):
            return None

        payload_bytes = _base64url_decode(payload_b64)
        payload = json.loads(payload_bytes.decode("utf-8"))

        # Verify expiration
        exp = payload.get("exp")
        if exp and datetime.utcnow().timestamp() > exp:
            return None

        return payload
    except Exception:
        return None
