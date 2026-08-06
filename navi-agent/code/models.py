from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class FreeResource(BaseModel):
    name: str
    type: str
    why: str
    next_step: str
    tags: List[str]
     
      
class PaidResource(BaseModel):
    name: str
    type: str
    cost: str
    duration: str
    value: str
    next_step: str
    tags: List[str]


class ExpertResource(BaseModel):
    name: str
    type: str
    price: str
    session_details: str
    expected_outcomes: str
    tags: List[str]


class MarketplaceProvider(BaseModel):
    name: str
    type: str
    category: str
    provider_type: str
    structure: Optional[str] = None
    discount: Optional[str] = None
    cost: Optional[str] = None
    price: Optional[str] = None
    duration: Optional[str] = None
    why: Optional[str] = None
    value: Optional[str] = None
    next_step: Optional[str] = None
    session_details: Optional[str] = None
    expected_outcomes: Optional[str] = None
    tags: List[str] = Field(default_factory=list)
    section: Optional[str] = None
    view: Optional[str] = None


class ViewMarketplace(BaseModel):
    mentors: List[MarketplaceProvider] = Field(default_factory=list)
    vendors: List[MarketplaceProvider] = Field(default_factory=list)
    institutions: List[MarketplaceProvider] = Field(default_factory=list)
    distributors: List[MarketplaceProvider] = Field(default_factory=list)


class MacroView(BaseModel):
    description: str
    marketplace: ViewMarketplace = Field(default_factory=ViewMarketplace)


class MicroView(BaseModel):
    description: str
    marketplace: ViewMarketplace = Field(default_factory=ViewMarketplace)


class NanoView(BaseModel):
    description: str
    marketplace: ViewMarketplace = Field(default_factory=ViewMarketplace)


class MicroStep(BaseModel):
    task: str
    resource: str


class Milestone(BaseModel):
    id: int
    title: str
    duration: str
    description: str
    macro_view: MacroView
    micro_view: MicroView
    nano_view: NanoView
    micro_steps: List[MicroStep]


class RoadmapData(BaseModel):
    readiness_score: int
    readiness_label: str
    total_duration: str
    steps: List[Milestone]
    blind_spots: List[str]


class StudentProfileModel(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    name: str
    email: str
    grade: str
    degreeType: Optional[str] = ""
    curriculum: str
    stream: str
    school: str
    performance: str
    financialSituation: str
    personality: str
    country: str
    state: str
    city: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        json_encoders = {
            datetime: lambda dt: dt.isoformat() + "Z" if not dt.tzinfo else dt.isoformat()
        }


class ModificationChange(BaseModel):
    field: str
    old_value: Optional[Any] = None
    new_value: Optional[Any] = None


class ModificationRecord(BaseModel):
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    edited_by: Optional[str] = None
    action: str
    details: str
    changes: List[ModificationChange] = []


# Model for pending_paths collection
class PendingPathModel(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    query: str
    current_position: str
    target_goal: str
    profile: Optional[Dict[str, Any]] = None
    roadmap_data: RoadmapData
    created_at: datetime = Field(default_factory=datetime.utcnow)
    created_by: Optional[str] = Field(default=None, alias="createdBy")
    generation_id: Optional[str] = None
    original_alternative_name: Optional[str] = None
    original_roadmap_data: Optional[Dict[str, Any]] = None
    modifications: List[ModificationRecord] = Field(default_factory=list)

    class Config:
        populate_by_name = True
        json_encoders = {
            datetime: lambda dt: dt.isoformat() + "Z" if not dt.tzinfo else dt.isoformat()
        }


# Model for published_paths collection
class PublishedPathModel(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    query: str
    current_position: str
    target_goal: str
    profile: Optional[Dict[str, Any]] = None
    roadmap_data: RoadmapData
    published_at: datetime = Field(default_factory=datetime.utcnow)
    created_at: datetime
    created_by: Optional[str] = Field(default=None, alias="createdBy")
    generation_id: Optional[str] = None
    original_alternative_name: Optional[str] = None
    original_roadmap_data: Optional[Dict[str, Any]] = None
    modifications: List[ModificationRecord] = Field(default_factory=list)

    class Config:
        populate_by_name = True
        json_encoders = {
            datetime: lambda dt: dt.isoformat() + "Z" if not dt.tzinfo else dt.isoformat()
        }


class AdminFeedbackModel(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    admin_email: str
    target_goal: str
    student_profile: Dict[str, Any]
    feedback_text: str
    category: str = "general"
    path_id: Optional[str] = None

    class Config:
        populate_by_name = True
        json_encoders = {
            datetime: lambda dt: dt.isoformat() + "Z" if not dt.tzinfo else dt.isoformat()
        }
