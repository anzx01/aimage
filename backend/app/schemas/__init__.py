"""
Pydantic schemas for API request/response models.
"""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


# Enums
class SubscriptionTier(str, Enum):
    FREE = "free"
    PRO = "pro"
    STARTUP = "startup"
    ENTERPRISE = "enterprise"


class ProjectType(str, Enum):
    ONE_CLICK_BASIC = "one_click_basic"
    ONE_CLICK_ADVANCED = "one_click_advanced"
    DIGITAL_HUMAN = "digital_human"
    VIRAL_CLONE = "viral_clone"
    REVERSE_PROMPT = "reverse_prompt"


class ProjectStatus(str, Enum):
    DRAFT = "draft"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    ARCHIVED = "archived"


class TaskStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None


class UserCreate(UserBase):
    password: str = Field(..., min_length=8)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(UserBase):
    id: str
    avatar_url: Optional[str] = None
    credits: int
    subscription_tier: SubscriptionTier
    created_at: datetime

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# Project Schemas
class ProjectBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    project_type: ProjectType


class ProjectCreate(ProjectBase):
    config: dict = Field(default_factory=dict)


class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[ProjectStatus] = None
    config: Optional[dict] = None


class ProjectResponse(ProjectBase):
    id: str
    user_id: str
    status: ProjectStatus
    model_version: Optional[str] = None
    video_url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    duration_seconds: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# Generation Task Schemas
class GenerationTaskCreate(BaseModel):
    project_id: str
    model_version: str
    credits_cost: int = Field(..., ge=1)


class GenerationTaskResponse(BaseModel):
    id: str
    project_id: str
    user_id: str
    status: TaskStatus
    progress: int = Field(..., ge=0, le=100)
    model_version: str
    credits_cost: int
    error_message: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Credit Transaction Schemas
class CreditTransactionResponse(BaseModel):
    id: str
    amount: int
    balance_after: int
    transaction_type: str
    description: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


# Showcase Case Schemas
class ShowcaseCaseResponse(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    category: str
    model_version: str
    thumbnail_url: str
    video_url: str
    tags: List[str] = []
    is_featured: bool
    view_count: int
    favorite_count: int
    created_at: datetime

    class Config:
        from_attributes = True


# Digital Human Schemas
class DigitalHumanCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    digital_human_type: str = Field(..., pattern="^(advanced|sora2)$")
    voice_config: dict = Field(default_factory=dict)
    appearance_config: dict = Field(default_factory=dict)
    is_public: bool = False


class DigitalHumanResponse(BaseModel):
    id: str
    user_id: str
    name: str
    avatar_url: Optional[str] = None
    digital_human_type: str
    is_public: bool
    created_at: datetime

    class Config:
        from_attributes = True
