from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class FreeResource(BaseModel):
    name: str
    type: str
    why: str
    next_step: str
    tags: List[str] = Field(default_factory=list)
     
      
class PaidResource(BaseModel):
    name: str
    type: str
    cost: str
    duration: str
    value: str
    next_step: str
    tags: List[str] = Field(default_factory=list)


class ExpertResource(BaseModel):
    name: str
    type: str
    price: str
    session_details: str
    expected_outcomes: str
    tags: List[str] = Field(default_factory=list)


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
    micro_steps: List[MicroStep] = Field(default_factory=list)


class RoadmapData(BaseModel):
    readiness_score: int
    readiness_label: str
    total_duration: str
    steps: List[Milestone] = Field(default_factory=list)
    blind_spots: List[str] = Field(default_factory=list)


# ── PURE STUDENT SIGNALS MODELS ──

class PersonalInformationModel(BaseModel):
    name: str = ""
    age: Optional[str] = ""
    dateOfBirth: Optional[str] = ""
    gender: Optional[str] = ""


class LocationModel(BaseModel):
    country: str = ""
    state: str = ""
    city: str = ""


class AcademicInformationModel(BaseModel):
    educationStage: str = "undergraduate"  # "school" | "undergraduate" | "postgraduate"
    # Stage: School Student (Grades 1-12)
    gradeLevel: str = ""
    schoolName: str = ""
    curriculum: str = ""  # CBSE, ICSE, IB, IGCSE, State Board, etc.
    academicStream: str = ""  # Science, Commerce, Arts, etc.
    # Stage: Undergraduate Student
    undergraduateDegree: str = ""  # B.Tech, B.Sc, BBA, etc.
    undergraduateMajor: str = ""
    collegeOrUniversity: str = ""
    currentYearOrSemester: str = ""
    # Stage: Postgraduate Student
    postgraduateDegree: str = ""  # Master's, MBA, M.Tech, PhD
    postgraduateSpecialization: str = ""
    postgraduateUniversity: str = ""
    postgraduateCurrentYear: str = ""
    # Universal academic performance
    academicPerformance: str = ""


class FinancialInformationModel(BaseModel):
    financialSituation: str = ""  # "0-25%", "25-50%", "50-75%", "75-100%"
    budgetRange: str = ""  # e.g. "$10,000 - $25,000 / year"
    scholarshipRequirement: str = ""  # "None", "Partial", "Full"


class StudentCharacteristicsModel(BaseModel):
    interests: str = ""
    skills: str = ""
    personalitySignal: str = ""
    preferences: str = ""


# Legacy models retained for backwards compatibility
class PersonalityGeographyModel(BaseModel):
    country: str = ""
    state: str = ""
    city: str = ""
    financialSituation: str = ""
    personalitySignal: str = ""


class AcademicsProfileModel(BaseModel):
    degreeType: str = ""
    gradeLevel: str = ""
    curriculum: str = ""
    academicStream: str = ""
    schoolOrCollege: str = ""
    currentPerformance: str = ""


class StudentProfileModel(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    email: str
    name: Optional[str] = ""

    # Pure Student Signals structured components
    personalInfo: PersonalInformationModel = Field(default_factory=PersonalInformationModel)
    location: LocationModel = Field(default_factory=LocationModel)
    academicInfo: AcademicInformationModel = Field(default_factory=AcademicInformationModel)
    financialInfo: FinancialInformationModel = Field(default_factory=FinancialInformationModel)
    characteristics: StudentCharacteristicsModel = Field(default_factory=StudentCharacteristicsModel)

    # Legacy embedded containers for backwards compatibility
    personalityGeography: PersonalityGeographyModel = Field(default_factory=PersonalityGeographyModel)
    academics: AcademicsProfileModel = Field(default_factory=AcademicsProfileModel)

    # Legacy flat fields for backward compatibility
    grade: Optional[str] = ""
    degreeType: Optional[str] = ""
    curriculum: Optional[str] = ""
    stream: Optional[str] = ""
    school: Optional[str] = ""
    performance: Optional[str] = ""
    financialSituation: Optional[str] = ""
    personality: Optional[str] = ""
    country: Optional[str] = ""
    state: Optional[str] = ""
    city: Optional[str] = ""
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
    changes: List[ModificationChange] = Field(default_factory=list)


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
