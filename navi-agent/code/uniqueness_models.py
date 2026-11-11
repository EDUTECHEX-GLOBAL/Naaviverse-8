"""
=============================================================================
NAAVI PATH UNIQUENESS & CONSISTENCY AGENT – CORE DATA MODELS
=============================================================================
Defines structured schemas for:
- TaskIdentity: Semantic & structured identity of every activity
- DuplicatePairClassification: Five-level classification results
- ResolutionAction: Supported deterministic and AI repair actions
- UniquenessReport: Complete pathway audit and resolution metrics
- ResearchDatasetRecord: Longitudinal dataset schema for academic research
=============================================================================
"""

import uuid
from datetime import datetime, timezone
from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class TaskHierarchyLevel(str, Enum):
    MILESTONE = "milestone"
    STEP = "step"
    MICRO_TASK = "micro_task"
    NANO_SUBTASK = "nano_subtask"


class AcademicComplexityLevel(str, Enum):
    FOUNDATIONAL = "foundational"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"
    CAPSTONE = "capstone"
    ADMISSIONS_PREP = "admissions_prep"


class RecurrenceType(str, Enum):
    PERIODIC_ASSESSMENT = "periodic_assessment"
    STANDARDIZED_DIAGNOSTIC = "standardized_diagnostic"
    APPLICATION_SUBMISSION = "application_submission"
    ADVISOR_CONSULTATION = "advisor_consultation"
    SKILL_REFRESHER = "skill_refresher"
    NONE = "none"


class DuplicateClassification(str, Enum):
    EXACT_DUPLICATE = "EXACT_DUPLICATE"
    NEAR_DUPLICATE = "NEAR_DUPLICATE"
    SEMANTIC_DUPLICATE = "SEMANTIC_DUPLICATE"
    RELATED_BUT_DISTINCT = "RELATED_BUT_DISTINCT"
    VALID_RECURRING_ACTIVITY = "VALID_RECURRING_ACTIVITY"
    HIERARCHICAL_PARENT_CHILD = "HIERARCHICAL_PARENT_CHILD"
    NEEDS_HUMAN_REVIEW = "NEEDS_HUMAN_REVIEW"


class ResolutionAction(str, Enum):
    KEEP = "KEEP"
    REMOVE_DUPLICATE = "REMOVE_DUPLICATE"
    MERGE = "MERGE"
    REGENERATE_DESCRIPTION = "REGENERATE_DESCRIPTION"
    REGENERATE_ACTIVITY = "REGENERATE_ACTIVITY"
    PRESERVE_AS_RECURRING = "PRESERVE_AS_RECURRING"
    MOVE_TO_CORRECT_MILESTONE = "MOVE_TO_CORRECT_MILESTONE"
    NEEDS_HUMAN_REVIEW = "NEEDS_HUMAN_REVIEW"


class RecurrencePolicy(BaseModel):
    is_recurring: bool = False
    recurrence_type: RecurrenceType = RecurrenceType.NONE
    recurrence_reason: Optional[str] = None
    occurrence_period: Optional[str] = None
    unique_objective: Optional[str] = None
    expected_outcome: Optional[str] = None


class GenerationProvenance(BaseModel):
    generation_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    batch_id: Optional[str] = None
    model: str = "openai/gpt-oss-120b"
    prompt_version: str = "2.1"
    generation_attempt: int = 1
    worker_key_id: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class TaskIdentity(BaseModel):
    """
    Structured identity of an activity across the pathway.
    Identity is determined by structured semantic attributes, not merely string titles.
    """
    task_id: str
    numeric_id: Optional[int] = None
    parent_milestone_id: Optional[int] = None
    parent_milestone_title: Optional[str] = None
    task_level: TaskHierarchyLevel = TaskHierarchyLevel.STEP
    action: str = ""                         # Primary imperative verb: Master, Implement, Solve, Formulate
    topic: str = ""                          # Domain topic: Differential Calculus, Asymptotic Complexity
    learning_outcome: str = ""               # Concrete outcome
    target_skill: str = ""                   # Specific skill
    academic_level: AcademicComplexityLevel = AcademicComplexityLevel.FOUNDATIONAL
    scope: str = "academic"
    deliverable: str = ""                    # Tangible deliverable: completed 40 problem sets, GitHub repo
    prerequisites: List[Any] = Field(default_factory=list)
    estimated_duration: Optional[str] = None
    scheduled_period: Optional[str] = None   # e.g., "Month 1", "Month 12-14"
    can_parallel: bool = False
    recurrence_policy: RecurrencePolicy = Field(default_factory=RecurrencePolicy)
    provenance: GenerationProvenance = Field(default_factory=GenerationProvenance)

    # Raw references
    raw_title: str = ""
    raw_description: str = ""
    normalized_title: str = ""
    normalized_description: str = ""
    fingerprint: str = ""

    def generate_fingerprint(self) -> str:
        """Deterministic fingerprint based on normalized action + topic + deliverable."""
        import hashlib
        core = f"{self.action.lower()}|{self.topic.lower()}|{self.deliverable.lower()}"
        return hashlib.sha256(core.encode("utf-8")).hexdigest()[:16]


class CandidateDuplicatePair(BaseModel):
    """Pairwise comparison result across detection levels."""
    task_a_id: str
    task_b_id: str
    task_a_title: str
    task_b_title: str
    task_a_desc: str = ""
    task_b_desc: str = ""
    level_1_exact_match: bool = False
    level_2_lexical_similarity: float = 0.0
    level_3_semantic_similarity: float = 0.0
    level_4_structured_overlap: float = 0.0
    level_5_ai_confidence: Optional[float] = None
    classification: DuplicateClassification = DuplicateClassification.RELATED_BUT_DISTINCT
    confidence: float = 1.0
    reason: str = ""
    matching_attributes: List[str] = Field(default_factory=list)
    differing_attributes: List[str] = Field(default_factory=list)
    recommended_action: ResolutionAction = ResolutionAction.KEEP
    is_resolved: bool = False
    resolution_applied: Optional[ResolutionAction] = None
    retained_task_id: Optional[str] = None
    removed_task_id: Optional[str] = None


class DescriptionDefect(BaseModel):
    """Identifies boilerplate or defective descriptions."""
    task_id: str
    numeric_id: int
    title: str
    current_description: str
    defect_type: str                        # boilerplate_suffix, generic_template, mismatch, empty
    detected_boilerplate_phrase: Optional[str] = None
    regenerated_description: Optional[str] = None
    is_repaired: bool = False


class MarketplaceDuplicate(BaseModel):
    """Marketplace recommendation duplicate record."""
    step_id: int
    step_title: str
    provider_name: str
    course_name: str
    canonical_url: Optional[str] = None
    duplicate_type: str                     # duplicate_url, duplicate_course, generic_rationale
    recommended_action: str                 # remove, replace, clarify_rationale
    is_repaired: bool = False


class UniquenessReport(BaseModel):
    """Comprehensive output of the Path Uniqueness & Consistency Agent."""
    path_id: Optional[str] = None
    path_title: str = ""
    generation_id: str = ""
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    agent_version: str = "2.0-uniqueness"
    
    # Quantitative Counts
    total_original_activities: int = 0
    total_unique_activities: int = 0
    confirmed_duplicates_detected: int = 0
    confirmed_duplicates_resolved: int = 0
    descriptions_regenerated: int = 0
    valid_recurrences_preserved: int = 0
    marketplace_duplicates_resolved: int = 0
    unresolved_candidate_pairs: int = 0
    dependency_repairs_completed: int = 0
    
    # Ratios
    uniqueness_ratio: float = 1.0           # unique / total
    duplicate_rate: float = 0.0
    boilerplate_description_rate: float = 0.0
    
    # Status
    validation_status: str = "PASSED"       # PASSED, NEEDS_REVIEW, REPAIRED, FAILED
    status_label: str = "100% Unique & Consistent"
    
    # Detailed collections
    candidate_pairs: List[CandidateDuplicatePair] = Field(default_factory=list)
    description_defects: List[DescriptionDefect] = Field(default_factory=list)
    marketplace_duplicates: List[MarketplaceDuplicate] = Field(default_factory=list)
    repaired_dependency_edges: List[Dict[str, Any]] = Field(default_factory=list)
    resolution_log: List[Dict[str, Any]] = Field(default_factory=list)
    human_review_items: List[Dict[str, Any]] = Field(default_factory=list)


class ResearchDatasetRecord(BaseModel):
    """Schema for persistent academic research dataset."""
    record_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    student_profile_snapshot: Dict[str, Any] = Field(default_factory=dict)
    target_goal: str = ""
    current_position: str = ""
    generator_version: str = "2.1"
    
    # Raw & Repaired Snapshots
    raw_pathway_snapshot: Dict[str, Any] = Field(default_factory=dict)
    repaired_pathway_snapshot: Optional[Dict[str, Any]] = None
    
    # Evaluation & Uniqueness
    uniqueness_report: Optional[Dict[str, Any]] = None
    detector_config_version: str = "v2.0-calibrated"
    
    # Human Review
    human_confirmed_duplicates: List[Dict[str, Any]] = Field(default_factory=list)
    human_rejected_duplicates: List[Dict[str, Any]] = Field(default_factory=list)
    human_overrides: List[Dict[str, Any]] = Field(default_factory=list)
    review_status: str = "unreviewed"       # unreviewed, reviewed, verified
