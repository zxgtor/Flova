"""Pydantic request/response models — single source of the typed HTTP contract."""

from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from flova_api.models import ProjectStatus, RenderStatus


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
    created_at: datetime
    updated_at: datetime


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
