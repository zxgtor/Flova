"""Password hashing + JWT issuing/verification."""

from datetime import UTC, datetime, timedelta
from typing import Annotated

import bcrypt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from flova_api.db import get_session
from flova_api.models import User
from flova_api.settings import get_settings

_ALG = "HS256"
_oauth2 = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)


def _to_bcrypt_bytes(plain: str) -> bytes:
    # bcrypt has a 72-byte hard limit on the password input. We pre-truncate the encoded
    # bytes (not chars) so multi-byte Unicode passwords also fit. This matches the de
    # facto industry pattern.
    return plain.encode("utf-8")[:72]


def hash_password(plain: str) -> str:
    return bcrypt.hashpw(_to_bcrypt_bytes(plain), bcrypt.gensalt()).decode("ascii")


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(_to_bcrypt_bytes(plain), hashed.encode("ascii"))
    except ValueError:
        return False


def issue_token(user_id: str) -> str:
    s = get_settings()
    exp = datetime.now(UTC) + timedelta(seconds=s.auth_token_ttl_seconds)
    return jwt.encode({"sub": user_id, "exp": exp}, s.auth_secret, algorithm=_ALG)


def decode_token(token: str) -> str:
    s = get_settings()
    try:
        payload = jwt.decode(token, s.auth_secret, algorithms=[_ALG])
    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"},
        ) from e
    user_id = payload.get("sub")
    if not isinstance(user_id, str):
        raise HTTPException(status_code=401, detail="Invalid token payload")
    return user_id


async def current_user(
    token: Annotated[str | None, Depends(_oauth2)],
    session: Annotated[AsyncSession, Depends(get_session)],
) -> User:
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user_id = decode_token(token)
    row = await session.execute(select(User).where(User.id == user_id))
    user = row.scalar_one_or_none()
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return user
