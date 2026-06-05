"""POST /api/auth/register, /login, GET /api/auth/me."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from flova_api.db import get_session
from flova_api.models import User
from flova_api.schemas import LoginRequest, RegisterRequest, TokenResponse, UserOut
from flova_api.security import (
    current_user,
    hash_password,
    issue_token,
    verify_password,
)

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=TokenResponse, status_code=201)
async def register(
    body: RegisterRequest,
    session: Annotated[AsyncSession, Depends(get_session)],
) -> TokenResponse:
    existing = await session.execute(select(User).where(User.email == body.email))
    if existing.scalar_one_or_none() is not None:
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(
        email=body.email,
        password_hash=hash_password(body.password),
        display_name=body.display_name,
    )
    session.add(user)
    await session.commit()
    await session.refresh(user)
    return TokenResponse(access_token=issue_token(user.id))


@router.post("/login", response_model=TokenResponse)
async def login(
    body: LoginRequest,
    session: Annotated[AsyncSession, Depends(get_session)],
) -> TokenResponse:
    row = await session.execute(select(User).where(User.email == body.email))
    user = row.scalar_one_or_none()
    if user is None or not verify_password(body.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )
    return TokenResponse(access_token=issue_token(user.id))


@router.get("/me", response_model=UserOut)
async def me(user: Annotated[User, Depends(current_user)]) -> User:
    return user
