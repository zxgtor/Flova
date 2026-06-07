"""Pydantic request/response models — single source of the typed HTTP contract."""

from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from flova_api.models import (
    ProjectStatus,
    RenderStatus,
    SubscriptionPlan,
    SubscriptionStatus,
    TeamRole,
)


class Health(BaseModel):
    status: str = "ok"
    version: str


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    display_name: str = ""


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    email: str
    display_name: str
    created_at: datetime


class RenderSubmitRequest(BaseModel):
    prompt: str = Field(min_length=1, max_length=4000)


class RenderJobOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    prompt: str
    status: RenderStatus
    failure_reason: str | None = None
    output_file_id: str | None = None
    external_job_id: str | None = None
    is_public: bool = False
    created_at: datetime
    updated_at: datetime


class RenderJobUpdate(BaseModel):
    is_public: bool | None = None


class CommunityRenderOut(BaseModel):
    id: str
    prompt: str
    author: str  # display_name fallback to email-prefix
    created_at: datetime
    output_file_id: str | None = None


class TeamCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)


class TeamOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    owner_id: str
    name: str
    created_at: datetime
    my_role: TeamRole  # caller's role on this team


class TeamMemberOut(BaseModel):
    id: str
    user_id: str
    email: str
    display_name: str
    role: TeamRole
    created_at: datetime


class TeamMemberAdd(BaseModel):
    email: EmailStr
    role: TeamRole = TeamRole.viewer


class ProjectCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: str = Field(default="", max_length=4000)


class ProjectUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    description: str | None = Field(default=None, max_length=4000)
    status: ProjectStatus | None = None


class ProjectOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    title: str
    description: str
    status: ProjectStatus
    created_at: datetime
    updated_at: datetime


class SubscriptionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    plan: SubscriptionPlan
    status: SubscriptionStatus
    current_period_end: datetime | None
    provider: str  # "stub" | "stripe" — frontend uses this to decide UX


class CheckoutOut(BaseModel):
    url: str


class PresetCreate(BaseModel):
    kind: str = Field(min_length=1, max_length=40)
    name: str = Field(min_length=1, max_length=120)
    payload: dict = Field(default_factory=dict)


class PresetOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    kind: str
    name: str
    payload: dict
    created_at: datetime
    updated_at: datetime
