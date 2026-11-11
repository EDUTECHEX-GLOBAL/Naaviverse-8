"""
=============================================================================
NAAVI GLOBAL TASK REGISTRY & CONCURRENT IDENTITY SYSTEM
=============================================================================
Tracks activities across the entire academic pathway (milestones, steps,
microtasks, nano tasks) with stable, structured task identities.

Features:
- Global Task Registry ensuring parallel Groq workers do not generate overlapping tasks
- Structured task identity based on semantic attributes (action, topic, outcome, deliverable)
- Concurrency-safe registry for 5-key parallel Groq workers
- Fast in-memory lookup for instant duplicate prevention at generation time
- Idempotent task creation across retries and continuations
- Preserves hierarchical parent-child relationships
=============================================================================
"""

import asyncio
import hashlib
import re
import threading
from typing import Any, Dict, List, Optional, Set, Tuple

from uniqueness_models import (
    AcademicComplexityLevel,
    DuplicateClassification,
    GenerationProvenance,
    RecurrencePolicy,
    RecurrenceType,
    ResolutionAction,
    TaskHierarchyLevel,
    TaskIdentity,
)


def normalize_text_fingerprint(text: str) -> str:
    """Normalize text by stripping punctuation, extra spaces, casing, and common affixes."""
    if not text:
        return ""
    t = text.lower().strip()
    t = re.sub(r"[^\w\s]", " ", t)
    t = re.sub(r"\s+", " ", t).strip()
    return t


def extract_action_and_topic(title: str) -> Tuple[str, str]:
    """
    Extracts imperative action verb and subject topic from an activity title.
    e.g. 'Master Single-Variable Calculus Derivatives & Optimization'
         -> action: 'Master', topic: 'Single-Variable Calculus Derivatives & Optimization'
    """
    if not title:
        return ("Complete", "Academic Unit")
    words = title.strip().split()
    if not words:
        return ("Complete", "Academic Unit")
    action = words[0].capitalize()
    topic = " ".join(words[1:]).strip() if len(words) > 1 else words[0]
    return (action, topic)


class GlobalTaskRegistry:
    """
    Thread-safe & Async-safe Global Task Registry for a pathway generation run.
    Maintains active task inventories, claimed milestone scopes, and semantic signatures.
    """

    def __init__(self, generation_id: Optional[str] = None):
        self.generation_id = generation_id or str(hashlib.md5(str(asyncio.get_event_loop()).encode()).hexdigest()[:12])
        self._lock = threading.RLock()
        
        # Primary storage
        self._tasks_by_id: Dict[str, TaskIdentity] = {}
        self._tasks_by_numeric_id: Dict[int, TaskIdentity] = {}
        
        # Index lookups
        self._fingerprint_index: Dict[str, str] = {}            # fingerprint -> task_id
        self._title_norm_index: Dict[str, str] = {}             # normalized_title -> task_id
        self._action_topic_index: Dict[Tuple[str, str], str] = {} # (action, topic_norm) -> task_id
        
        # Scope and milestone tracking
        self._milestone_scopes: Dict[int, Set[str]] = {}        # milestone_id -> set of normalized topics
        self._tasks_by_milestone: Dict[int, List[str]] = {}     # milestone_id -> list of task_ids
        
        # Planned Activity Inventory (Phase B blueprint)
        self._planned_inventory: List[Dict[str, Any]] = []

    def set_planned_inventory(self, inventory: List[Dict[str, Any]]) -> None:
        """Populate pre-generation activity inventory from the academic blueprint."""
        with self._lock:
            self._planned_inventory = list(inventory)
            for item in inventory:
                m_id = item.get("parent_milestone_id") or item.get("milestone_id", 1)
                topic = normalize_text_fingerprint(item.get("topic") or item.get("title", ""))
                if m_id not in self._milestone_scopes:
                    self._milestone_scopes[m_id] = set()
                if topic:
                    self._milestone_scopes[m_id].add(topic)

    def get_planned_inventory_for_milestone(self, milestone_id: int) -> List[Dict[str, Any]]:
        """Retrieve planned inventory items designated for a specific milestone."""
        with self._lock:
            return [
                item for item in self._planned_inventory
                if (item.get("parent_milestone_id") == milestone_id or item.get("milestone_id") == milestone_id)
            ]

    def claim_milestone_scope(self, milestone_id: int, topics: List[str]) -> None:
        """Assign non-overlapping topic ownership to a milestone batch."""
        with self._lock:
            if milestone_id not in self._milestone_scopes:
                self._milestone_scopes[milestone_id] = set()
            for t in topics:
                norm = normalize_text_fingerprint(t)
                if norm:
                    self._milestone_scopes[milestone_id].add(norm)

    def is_topic_already_covered(self, topic: str, exclude_milestone_id: Optional[int] = None) -> bool:
        """Check if a topic is already generated or owned by another milestone."""
        norm = normalize_text_fingerprint(topic)
        if not norm:
            return False
        with self._lock:
            for m_id, scopes in self._milestone_scopes.items():
                if exclude_milestone_id is not None and m_id == exclude_milestone_id:
                    continue
                if norm in scopes:
                    return True
            # Also check existing registered tasks
            for task in self._tasks_by_id.values():
                if exclude_milestone_id is not None and task.parent_milestone_id == exclude_milestone_id:
                    continue
                if normalize_text_fingerprint(task.topic) == norm:
                    return True
        return False

    def build_task_identity(
        self,
        raw_step: Dict[str, Any],
        parent_milestone_id: Optional[int] = None,
        parent_milestone_title: Optional[str] = None,
        batch_id: Optional[str] = None,
        model: str = "openai/gpt-oss-120b"
    ) -> TaskIdentity:
        """Constructs a rich TaskIdentity from a generated raw step dictionary."""
        num_id = raw_step.get("id")
        title = raw_step.get("title", "").strip()
        desc = raw_step.get("description", "").strip()
        deliverable = raw_step.get("completion_criteria", "").strip() or raw_step.get("deliverable", "").strip()
        
        action, topic = extract_action_and_topic(title)
        
        level_raw = raw_step.get("hierarchy_level", "step").lower()
        if "milestone" in level_raw:
            level = TaskHierarchyLevel.MILESTONE
        elif "nano" in level_raw:
            level = TaskHierarchyLevel.NANO_SUBTASK
        elif "micro" in level_raw:
            level = TaskHierarchyLevel.MICRO_TASK
        else:
            level = TaskHierarchyLevel.STEP

        norm_title = normalize_text_fingerprint(title)
        norm_desc = normalize_text_fingerprint(desc)
        
        # Check recurrence markers
        is_rec = False
        rec_type = RecurrenceType.NONE
        rec_reason = None
        period = raw_step.get("duration") or raw_step.get("scheduled_period")
        
        title_low = title.lower()
        if any(diag in title_low for diag in ["diagnostic", "mock exam", "progress assessment", "benchmark test"]):
            is_rec = True
            rec_type = RecurrenceType.STANDARDIZED_DIAGNOSTIC
            rec_reason = f"Periodic diagnostic assessment for {topic}"
        elif any(app in title_low for app in ["university application", "submit application", "common app submission"]):
            is_rec = True
            rec_type = RecurrenceType.APPLICATION_SUBMISSION
            rec_reason = "Institution-specific university application filing"
        elif any(adv in title_low for adv in ["advisor consultation", "academic advising check-in"]):
            is_rec = True
            rec_type = RecurrenceType.ADVISOR_CONSULTATION
            rec_reason = "Periodic academic progression checkpoint"

        provenance = GenerationProvenance(
            generation_id=self.generation_id,
            batch_id=batch_id,
            model=model,
            worker_key_id=raw_step.get("worker_key_id")
        )

        task_id = f"task_{self.generation_id[:6]}_{parent_milestone_id or 'root'}_{num_id or hashlib.md5(title.encode()).hexdigest()[:6]}"

        raw_prereqs = raw_step.get("prerequisites", [])
        if not isinstance(raw_prereqs, list):
            raw_prereqs = [raw_prereqs] if raw_prereqs is not None else []
        clean_prereqs = []
        for p in raw_prereqs:
            if isinstance(p, int):
                clean_prereqs.append(p)
            elif isinstance(p, str):
                p_strip = p.strip()
                if p_strip.isdigit():
                    clean_prereqs.append(int(p_strip))
                elif p_strip:
                    clean_prereqs.append(p_strip)
            elif p is not None:
                clean_prereqs.append(p)

        identity = TaskIdentity(
            task_id=task_id,
            numeric_id=num_id,
            parent_milestone_id=parent_milestone_id or raw_step.get("parent_id"),
            parent_milestone_title=parent_milestone_title or raw_step.get("parent_milestone"),
            task_level=level,
            action=action,
            topic=topic,
            learning_outcome=raw_step.get("learning_objectives", [""])[0] if raw_step.get("learning_objectives") else "",
            target_skill=topic,
            academic_level=AcademicComplexityLevel.FOUNDATIONAL,
            scope="academic",
            deliverable=deliverable,
            prerequisites=clean_prereqs,
            estimated_duration=raw_step.get("duration"),
            scheduled_period=period,
            can_parallel=raw_step.get("can_parallel", False),
            recurrence_policy=RecurrencePolicy(
                is_recurring=is_rec,
                recurrence_type=rec_type,
                recurrence_reason=rec_reason,
                occurrence_period=period,
                unique_objective=f"Assess {topic} at {period or 'designated milestone'}"
            ),
            provenance=provenance,
            raw_title=title,
            raw_description=desc,
            normalized_title=norm_title,
            normalized_description=norm_desc
        )
        identity.fingerprint = identity.generate_fingerprint()
        return identity

    def register_task(self, identity: TaskIdentity) -> Tuple[bool, Optional[str], Optional[TaskIdentity]]:
        """
        Thread-safely register a task.
        Returns:
            (success: bool, conflict_reason: Optional[str], conflicting_existing_task: Optional[TaskIdentity])
        """
        with self._lock:
            # Check 1: Exact title duplicate
            norm_title = identity.normalized_title
            if norm_title and norm_title in self._title_norm_index:
                existing_id = self._title_norm_index[norm_title]
                existing_task = self._tasks_by_id.get(existing_id)
                # Check if it is a legitimate recurring activity
                if identity.recurrence_policy.is_recurring and existing_task:
                    # Legitimate recurrence preserved with distinct task_id
                    pass
                else:
                    return False, f"Duplicate exact title: '{identity.raw_title}' already exists as task {existing_id}", existing_task

            # Check 2: Exact fingerprint duplicate (same action + topic + deliverable)
            fp = identity.fingerprint
            if fp and fp in self._fingerprint_index:
                existing_id = self._fingerprint_index[fp]
                existing_task = self._tasks_by_id.get(existing_id)
                if not identity.recurrence_policy.is_recurring:
                    return False, f"Duplicate activity fingerprint: '{identity.action} - {identity.topic}' already generated in task {existing_id}", existing_task

            # Check 3: Same numeric ID collision (re-index if necessary)
            if identity.numeric_id is not None and identity.numeric_id in self._tasks_by_numeric_id:
                # Update existing or assign new id
                pass

            # Safe insertion
            self._tasks_by_id[identity.task_id] = identity
            if identity.numeric_id is not None:
                self._tasks_by_numeric_id[identity.numeric_id] = identity

            if norm_title:
                self._title_norm_index[norm_title] = identity.task_id
            if fp:
                self._fingerprint_index[fp] = identity.task_id

            action_topic_key = (identity.action.lower(), normalize_text_fingerprint(identity.topic))
            self._action_topic_index[action_topic_key] = identity.task_id

            m_id = identity.parent_milestone_id or 1
            if m_id not in self._tasks_by_milestone:
                self._tasks_by_milestone[m_id] = []
            self._tasks_by_milestone[m_id].append(identity.task_id)

            if m_id not in self._milestone_scopes:
                self._milestone_scopes[m_id] = set()
            self._milestone_scopes[m_id].add(normalize_text_fingerprint(identity.topic))

            return True, None, None

    def get_context_for_worker(self, milestone_id: int) -> Dict[str, Any]:
        """
        Provides a Groq worker batch with context of what already exists,
        so the worker avoids regenerating already-covered tasks.
        """
        with self._lock:
            existing_titles = [t.raw_title for t in self._tasks_by_id.values()]
            covered_topics = [t.topic for t in self._tasks_by_id.values()]
            planned_items = self.get_planned_inventory_for_milestone(milestone_id)
            
            return {
                "milestone_id": milestone_id,
                "existing_task_count": len(self._tasks_by_id),
                "existing_titles": existing_titles[-25:],  # Most recent 25 to preserve prompt tokens
                "covered_topics": list(set(covered_topics))[-35:],
                "planned_activities": planned_items
            }

    def get_all_tasks(self) -> List[TaskIdentity]:
        with self._lock:
            return list(self._tasks_by_id.values())

    def get_task_by_id(self, task_id: str) -> Optional[TaskIdentity]:
        with self._lock:
            return self._tasks_by_id.get(task_id)

    def get_task_by_numeric_id(self, num_id: int) -> Optional[TaskIdentity]:
        with self._lock:
            return self._tasks_by_numeric_id.get(num_id)

    def total_count(self) -> int:
        with self._lock:
            return len(self._tasks_by_id)

    def clear(self) -> None:
        with self._lock:
            self._tasks_by_id.clear()
            self._tasks_by_numeric_id.clear()
            self._fingerprint_index.clear()
            self._title_norm_index.clear()
            self._action_topic_index.clear()
            self._milestone_scopes.clear()
            self._tasks_by_milestone.clear()
            self._planned_inventory.clear()

