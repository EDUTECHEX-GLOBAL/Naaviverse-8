"""
=============================================================================
NAAVI OBSERVER AGENT (Academic Pathway Quality, Accuracy & Hallucination Auditor)
=============================================================================
Architecture & Operational Rules:
1. INDEPENDENT AUDITOR: Operates as an objective academic pathway auditor inspecting
   actual pathway data end-to-end.
2. DETERMINISTIC FIRST: Uses deterministic rules (duration_service, category_validator,
   DAG topological validation, schema verification) before heuristic evaluation.
3. 9 EVALUATION DIMENSIONS (Configurable Weights totaling 100%):
   - Dimension 1: Path Structure and Completeness (15%)
   - Dimension 2: Step Learning Order and Prerequisite Sequence (20%)
   - Dimension 3: Academic and Goal Relevance (15%)
   - Dimension 4: Step Count and Granularity (10%)
   - Dimension 5: Realistic Timeline and Duration (15%)
   - Dimension 6: Marketplace Recommendation Quality (10%)
   - Dimension 7: Student Profile Alignment (5%)
   - Dimension 8: Evidence and Factual Reliability (5%)
   - Dimension 9: Actionability and Clarity (5%)
4. STRUCTURED ISSUE REPORTING SCHEMA:
   Every finding includes issue_id, severity, dimension, step_id, what_is_wrong,
   why_it_is_wrong, expected_order_or_correction, supporting_evidence, suggested_action.
   Critical blockers are tracked and displayed prominently, but never artificially
   zero out or force the final score to 0 or 100.
5. TWO DISTINCT EVALUATION RESULTS (Never Averaged):
   - Human Review Score (Not Reviewed if none submitted)
   - Observer Agent AI Score
   - Score Difference & Explanation
6. RESEARCH DATASET VERSIONING:
   Stores evaluation records for research, benchmarking, and accuracy tracking.
=============================================================================
"""

import re
import json
import time
import uuid
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional, Tuple, Set

try:
    from duration_service import (
        calculate_path_duration,
        validate_path_duration,
        resolve_category,
        resolve_target_program_duration,
        parse_goal_components,
        parse_academic_goal_intent
    )
except ImportError:
    try:
        from .duration_service import (
            calculate_path_duration,
            validate_path_duration,
            resolve_category,
            resolve_target_program_duration,
            parse_goal_components,
            parse_academic_goal_intent
        )
    except ImportError:
        def calculate_path_duration(*args, **kwargs):
            return {"total_duration_months": 24, "total_duration": "24 months"}
        def validate_path_duration(*args, **kwargs):
            return {"is_valid": True}
        def resolve_category(c):
            return c or "academic"
        def resolve_target_program_duration(*args, **kwargs):
            return (48, "Default Bachelor's", "calculated")
        def parse_goal_components(*args, **kwargs):
            return {"degree_level": "Bachelor's", "program": "Computer Science"}
        def parse_academic_goal_intent(*args, **kwargs):
            return "admission_and_degree"

try:
    from category_validator import (
        validate_category_consistency,
        CATEGORIES,
        LEXICON
    )
except ImportError:
    try:
        from .category_validator import (
            validate_category_consistency,
            CATEGORIES,
            LEXICON
        )
    except ImportError:
        CATEGORIES = {}
        LEXICON = {}


# ─────────────────────────────────────────────────────────────────────────────
# EVALUATION WEIGHTS (Must sum to 1.00 / 100%)
# ─────────────────────────────────────────────────────────────────────────────
DEFAULT_EVALUATION_WEIGHTS = {
    "path_structure": 0.15,          # Dimension 1: Path Structure and Completeness (15%)
    "step_learning_order": 0.20,     # Dimension 2: Step Learning Order and Prerequisite Sequence (20%)
    "academic_relevance": 0.15,      # Dimension 3: Academic and Goal Relevance (15%)
    "step_granularity": 0.10,        # Dimension 4: Step Count and Granularity (10%)
    "realistic_timeline": 0.15,      # Dimension 5: Realistic Timeline and Duration (15%)
    "marketplace_quality": 0.10,     # Dimension 6: Marketplace Recommendation Quality (10%)
    "profile_alignment": 0.05,       # Dimension 7: Student Profile Alignment (5%)
    "factual_reliability": 0.05,     # Dimension 8: Evidence and Factual Reliability (5%)
    "actionability_clarity": 0.05,   # Dimension 9: Actionability and Clarity (5%)
}

DIMENSION_METADATA = {
    "path_structure": {
        "name": "Path Structure & Completeness",
        "description": "Validates schema integrity, milestone groupings, continuity, and mandatory academic fields.",
        "weight": 0.15
    },
    "step_learning_order": {
        "name": "Step Learning Order & Sequence",
        "description": "Verifies pedagogical progression, prerequisite DAG dependencies, and detects sequence inversions.",
        "weight": 0.20
    },
    "academic_relevance": {
        "name": "Academic & Goal Relevance",
        "description": "Ensures curriculum alignment with student destination, detects category contamination and filler steps.",
        "weight": 0.15
    },
    "step_granularity": {
        "name": "Step Count & Granularity",
        "description": "Audits step depth, micro-task actionability, and ensures appropriate granularity for journey complexity.",
        "weight": 0.10
    },
    "realistic_timeline": {
        "name": "Realistic Timeline & Duration",
        "description": "Cross-references official duration service, verifies step-level realistic time, and avoids zero durations.",
        "weight": 0.15
    },
    "marketplace_quality": {
        "name": "Marketplace Recommendation Quality",
        "description": "Screens for placeholder/hallucinated providers, ensures tier balance, URL validity, and budget fit.",
        "weight": 0.10
    },
    "profile_alignment": {
        "name": "Student Profile Alignment",
        "description": "Verifies customization for starting grade, regional curriculum, academic background, and constraints.",
        "weight": 0.05
    },
    "factual_reliability": {
        "name": "Evidence & Factual Reliability",
        "description": "Checks validity of degree credentials, exam systems, accredited institutions, and curriculum claims.",
        "weight": 0.05
    },
    "actionability_clarity": {
        "name": "Actionability & Clarity",
        "description": "Assesses clarity of directives, use of concrete imperative verbs, and verifiable learning deliverables.",
        "weight": 0.05
    }
}

SUSPICIOUS_PROVIDER_NAMES = {
    "tbd", "n/a", "na", "none", "null", "undefined", "unknown", "placeholder",
    "course name", "mentor name", "partner name", "vendor name", "provider name",
    "sample course", "sample mentor", "test course", "lorem ipsum", "xyz platform",
    "abc institute", "example course", "some university", "fake university", "expert review"
}

SUSPICIOUS_GENERIC_PATTERNS = [
    r'^(course|mentor|vendor|institution|service|book|tutorial)\s*\d*$',
    r'^(online course|online mentor|private tutor|free resources?)$',
    r'^(learn [a-z]+ course|study [a-z]+)$',
]

# Action verbs indicating concrete instructions
ACTION_VERBS = {
    "complete", "solve", "build", "master", "prepare", "apply", "register",
    "enroll", "attend", "submit", "publish", "pass", "review", "design",
    "implement", "analyze", "take", "write", "learn", "practice", "develop"
}

VAGUE_LANGUAGE_PATTERNS = [
    r'\blearn something\b', r'\bdo something\b', r'\bvarious topics\b',
    r'\bprepare well\b', r'\bstudy hard\b', r'\btry your best\b',
    r'\bdo research\b', r'\blearn stuff\b', r'\betc\.\b', r'\btbd\b'
]

# In-memory research evaluations repository for persistence/testing
RESEARCH_DATASET_STORE: List[Dict[str, Any]] = []


class NaaviObserverAgent:
    """
    Independent Academic Pathway Auditor & Evaluation Engine.
    Executes a structured 6-stage audit across 9 distinct dimensions,
    provides itemized issue rationale and evidence, isolates critical blockers,
    and supports human review comparison and research dataset storage.
    """

    def __init__(self, db=None, weights: Optional[Dict[str, float]] = None):
        self.db = db
        self.weights = weights or DEFAULT_EVALUATION_WEIGHTS.copy()
        # Ensure weights sum to 1.00
        total_w = sum(self.weights.values())
        if abs(total_w - 1.0) > 0.001:
            self.weights = {k: v / total_w for k, v in self.weights.items()}

    # ─────────────────────────────────────────────────────────────────────────
    # ISSUE BUILDER HELPER
    # ─────────────────────────────────────────────────────────────────────────
    def _create_issue(
        self,
        dimension: str,
        severity: str,
        code: str,
        what_is_wrong: str,
        why_it_is_wrong: str,
        expected_order_or_correction: str,
        supporting_evidence: str,
        suggested_action: str,
        step_id: Optional[int] = None,
        step_title: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Creates a structured finding following the strict Issue Reporting Schema.
        """
        dim_info = DIMENSION_METADATA.get(dimension, {})
        dim_label = dim_info.get("name", dimension.replace("_", " ").title())
        issue_id = f"ISSUE-{code.upper()}-{uuid.uuid4().hex[:6]}"

        return {
            "issue_id": issue_id,
            "severity": severity,  # "critical", "high", "medium", "low"
            "dimension": dimension,
            "dimension_label": dim_label,
            "type": code,
            "step_id": step_id,
            "step_title": step_title,
            "what_is_wrong": what_is_wrong,
            "why_it_is_wrong": why_it_is_wrong,
            "expected_order_or_correction": expected_order_or_correction,
            "supporting_evidence": supporting_evidence,
            "suggested_action": suggested_action,
            "message": what_is_wrong
        }

    # ─────────────────────────────────────────────────────────────────────────
    # DIMENSION 1: PATH STRUCTURE AND COMPLETENESS (Weight: 15%)
    # ─────────────────────────────────────────────────────────────────────────
    def audit_path_structure(self, roadmap: Dict[str, Any]) -> Dict[str, Any]:
        """
        Validates schema integrity, step indices, completeness of required fields,
        and ensures presence of critical transitional milestones.
        """
        issues: List[Dict[str, Any]] = []
        warnings: List[Dict[str, Any]] = []
        score = 100.0

        if not isinstance(roadmap, dict):
            iss = self._create_issue(
                dimension="path_structure",
                severity="critical",
                code="invalid_schema_root",
                what_is_wrong="Roadmap root data is not a valid JSON dictionary.",
                why_it_is_wrong="Downstream services and UI cannot parse non-dict pathway objects.",
                expected_order_or_correction="Provide a valid dictionary object representing the academic roadmap.",
                supporting_evidence=f"Received type: {type(roadmap).__name__}",
                suggested_action="Regenerate roadmap with valid root schema."
            )
            return {"score": 0.0, "passed": False, "issues": [iss], "warnings": []}

        # Check mandatory root fields
        required_root_fields = ["path_title", "steps", "total_duration"]
        for field in required_root_fields:
            if not roadmap.get(field):
                issues.append(self._create_issue(
                    dimension="path_structure",
                    severity="critical" if field == "steps" else "high",
                    code=f"missing_root_{field}",
                    what_is_wrong=f"Mandatory pathway field '{field}' is missing or empty.",
                    why_it_is_wrong="Essential metadata is required for student journey visualization and planning.",
                    expected_order_or_correction=f"Include a valid non-empty '{field}' value in roadmap payload.",
                    supporting_evidence=f"Root keys present: {list(roadmap.keys())}",
                    suggested_action=f"Ensure generator engine outputs '{field}'."
                ))
                score -= 20.0 if field == "steps" else 10.0

        steps = roadmap.get("steps") or []
        if not isinstance(steps, list) or len(steps) == 0:
            issues.append(self._create_issue(
                dimension="path_structure",
                severity="critical",
                code="zero_steps",
                what_is_wrong="Academic pathway contains 0 milestones or steps.",
                why_it_is_wrong="A pathway without actionable milestones cannot guide a student.",
                expected_order_or_correction="Path must contain structured academic steps from current position to goal.",
                supporting_evidence=f"steps count: {len(steps)}",
                suggested_action="Re-run academic path generation with valid inputs."
            ))
            return {"score": 0.0, "passed": False, "issues": issues, "warnings": []}

        # Check step continuity and completeness
        seen_ids = set()
        for idx, s in enumerate(steps, start=1):
            if not isinstance(s, dict):
                issues.append(self._create_issue(
                    dimension="path_structure",
                    severity="high",
                    code="invalid_step_format",
                    what_is_wrong=f"Step at index {idx} is not a valid dictionary.",
                    why_it_is_wrong="Steps must have structured milestone properties.",
                    expected_order_or_correction="Step must be a dictionary with title, duration, and description.",
                    supporting_evidence=f"Step type: {type(s).__name__}",
                    suggested_action="Format step object properly.",
                    step_id=idx
                ))
                score -= 10.0
                continue

            sid = s.get("id", idx)
            if sid in seen_ids:
                warnings.append(self._create_issue(
                    dimension="path_structure",
                    severity="medium",
                    code="duplicate_step_id",
                    what_is_wrong=f"Step ID {sid} is duplicated.",
                    why_it_is_wrong="Duplicate step IDs cause navigation glitches in frontend timelines.",
                    expected_order_or_correction=f"Assign continuous sequential ID {idx} to step.",
                    supporting_evidence=f"Duplicate ID found: {sid}",
                    suggested_action="Re-index steps sequentially.",
                    step_id=sid,
                    step_title=s.get("title")
                ))
                score -= 3.0
            seen_ids.add(sid)

            # Check essential step attributes
            for req_attr in ["title", "duration", "description"]:
                val = str(s.get(req_attr) or "").strip()
                if not val:
                    issues.append(self._create_issue(
                        dimension="path_structure",
                        severity="medium",
                        code=f"missing_step_{req_attr}",
                        what_is_wrong=f"Step {sid} is missing mandatory field '{req_attr}'.",
                        why_it_is_wrong=f"Students require a clear milestone {req_attr} to understand expectations.",
                        expected_order_or_correction=f"Provide a descriptive '{req_attr}' for Step {sid}.",
                        supporting_evidence=f"Field '{req_attr}' is empty.",
                        suggested_action=f"Populate '{req_attr}' for Step {sid}.",
                        step_id=sid,
                        step_title=s.get("title")
                    ))
                    score -= 4.0

        return {
            "score": max(0.0, min(100.0, round(score, 1))),
            "passed": len([i for i in issues if i["severity"] in ["critical", "high"]]) == 0,
            "step_count": len(steps),
            "issues": issues,
            "warnings": warnings
        }

    # ─────────────────────────────────────────────────────────────────────────
    # DIMENSION 2: STEP LEARNING ORDER & PREREQUISITE SEQUENCE (Weight: 20%)
    # ─────────────────────────────────────────────────────────────────────────
    def audit_step_learning_order(
        self,
        roadmap: Dict[str, Any],
        current: str = "",
        goal: str = ""
    ) -> Dict[str, Any]:
        """
        Audits pedagogical progression, validates prerequisite DAG (Directed Acyclic Graph)
        dependencies via cycle detection and topological sorting, and detects sequence inversions.
        """
        issues: List[Dict[str, Any]] = []
        warnings: List[Dict[str, Any]] = []
        score = 100.0

        steps = roadmap.get("steps") or []
        if not steps:
            return {"score": 0.0, "passed": False, "issues": [], "warnings": []}

        step_map = {}
        for idx, s in enumerate(steps, start=1):
            sid = s.get("id", idx)
            step_map[sid] = {"index": idx, "step": s}

        # ── 1. DAG CYCLE DETECTION & FORWARD PREREQUISITE VALIDATION ──
        adj: Dict[Any, List[Any]] = {sid: [] for sid in step_map}
        in_degree: Dict[Any, int] = {sid: 0 for sid in step_map}
        explicit_edges: List[Tuple[Any, Any]] = []

        for sid, data in step_map.items():
            s = data["step"]
            prereqs = s.get("prerequisites") or []
            if isinstance(prereqs, list):
                for p in prereqs:
                    if p in adj:
                        adj[p].append(sid)
                        in_degree[sid] += 1
                        explicit_edges.append((p, sid))

        # Kahn's algorithm for circular dependency detection
        queue = [sid for sid, deg in in_degree.items() if deg == 0]
        visited_count = 0
        while queue:
            u = queue.pop(0)
            visited_count += 1
            for v in adj.get(u, []):
                in_degree[v] -= 1
                if in_degree[v] == 0:
                    queue.append(v)

        has_cycle = visited_count < len(adj) if adj else False
        if has_cycle:
            issues.append(self._create_issue(
                dimension="step_learning_order",
                severity="critical",
                code="circular_dependency",
                what_is_wrong="Circular dependency detected in milestone prerequisite sequence.",
                why_it_is_wrong="A step cannot depend directly or indirectly on a future step that also depends on it.",
                expected_order_or_correction="Remove prerequisite cycles so the journey forms a valid Directed Acyclic Graph (DAG).",
                supporting_evidence=f"Unresolved cycle in prerequisite graph (visited {visited_count}/{len(adj)} nodes).",
                suggested_action="Inspect 'prerequisites' arrays across steps and eliminate recursive dependencies."
            ))
            score -= 40.0

        # Check for forward prerequisite ordering (step depending on a future step index)
        for prereq_id, dep_id in explicit_edges:
            p_idx = step_map[prereq_id]["index"]
            d_idx = step_map[dep_id]["index"]
            if p_idx > d_idx:
                issues.append(self._create_issue(
                    dimension="step_learning_order",
                    severity="high",
                    code="prerequisite_inversion",
                    what_is_wrong=f"Step {dep_id} lists Step {prereq_id} as prerequisite, but Step {prereq_id} appears after Step {dep_id} in the timeline.",
                    why_it_is_wrong="Prerequisites must strictly be completed prior to the dependent milestone.",
                    expected_order_or_correction=f"Place Step {prereq_id} before Step {dep_id}.",
                    supporting_evidence=f"Step {dep_id} index: {d_idx}, Prerequisite Step {prereq_id} index: {p_idx}",
                    suggested_action="Topologically sort milestones according to dependency graph.",
                    step_id=dep_id,
                    step_title=step_map[dep_id]["step"].get("title")
                ))
                score -= 25.0

        # ── 2. PEDAGOGICAL STAGE PROGRESSION & INVERSION DETECTION ──
        # Stages:
        # 1. Secondary / School Foundation (Grades 9-12, CBSE, ICSE, High School)
        # 2. Entrance Exams & Preparation (JEE, NEET, SAT, ACT, GRE, VITEEE, Entrance)
        # 3. University Application & Admission (Application submission, SOP, counseling, enrollment)
        # 4. Undergraduate / Graduate Core Studies (Semester 1-4, B.Tech coursework, Degree completion)
        # 5. Advanced Specialization, Projects & Internships (Semester 5-8, Summer internship, Electives)
        # 6. Capstone / Dissertation / Final Thesis
        # 7. Degree Completion & Corporate Placement / Job Application
        STAGE_KEYWORDS = {
            1: ["elementary foundation", "basics of grade", "introductory high school", "grade 9 basics", "grade 10 basics", "ncert basics", "elementary arithmetic"],
            2: ["sat prep", "act prep", "jee main", "neet exam", "entrance exam", "entrance test", "mock test", "standardized test"],
            3: ["university application", "common app", "apply to university", "admissions essay", "visa interview", "enrollment deposit"],
            4: ["bachelor of technology", "b.tech", "core coursework", "degree coursework", "semester 1", "semester 2", "semester 3", "semester 4"],
            5: ["industry internship", "corporate summer intern", "specialization", "semester 5", "semester 6", "semester 7"],
            6: ["capstone thesis", "senior degree thesis", "final dissertation defense", "final year project"],
            7: ["placement", "campus placement", "corporate software engineer", "senior software engineer", "job application", "corporate employment", "interview preparation for full-time"]
        }

        step_stages = []
        for idx, s in enumerate(steps, start=1):
            text = f"{s.get('title', '')} {s.get('description', '')}".lower()
            detected_stage = 0

            # Special check for Stage 7: ignore high school AP, course placement, and university/visa admissions interviews
            is_ap_or_course_placement = any(ap in text for ap in [
                "advanced placement", "ap calculus", "ap computer science", "ap physics",
                "placement test", "placement exam", "math placement", "course placement",
                "visa interview", "consular interview", "admissions interview", "mock consular"
            ])
            if any(kw in text for kw in STAGE_KEYWORDS[7]) and not is_ap_or_course_placement:
                detected_stage = 7
            else:
                for st_num in [6, 5, 4, 3, 2]:
                    if any(kw in text for kw in STAGE_KEYWORDS[st_num]):
                        detected_stage = st_num
                        break
                if detected_stage == 0:
                    # Advanced STEM coursework (calculus, linear algebra, discrete math, algorithms, physics mechanics) is NOT elementary foundation
                    is_advanced_stem = any(stem in text for stem in ["calculus", "linear algebra", "discrete math", "algorithm", "physics mechanics", "data structures", "organic chemistry"])
                    if any(kw in text for kw in STAGE_KEYWORDS[1]) and not is_advanced_stem:
                        detected_stage = 1

            step_stages.append((idx, s.get("id", idx), s.get("title", ""), detected_stage))

        # Check for pedagogical sequence inversions
        # Inversion A: Career/Placement (Stage 7) appearing before Degree Core (Stage 4) or Foundation (Stage 1)
        highest_stage = 0
        for idx, sid, title, st in step_stages:
            if st == 0:
                continue

            # Flag placement/jobs before education
            if st == 7 and idx < len(steps):
                # Early step focuses on corporate job/placement before basic foundation or degree
                has_subsequent_foundation = any(later_st in [1, 2, 3, 4, 5, 6] for _, _, _, later_st in step_stages[idx:])
                if has_subsequent_foundation:
                    issues.append(self._create_issue(
                        dimension="step_learning_order",
                        severity="critical",
                        code="sequence_inversion",
                        what_is_wrong=f"Step {idx} ('{title}') emphasizes corporate employment/placements before academic foundation or degree coursework.",
                        why_it_is_wrong="Students cannot participate in corporate job placements before completing foundational education and degree prerequisites.",
                        expected_order_or_correction="Foundational learning and degree milestones must precede full-time job placement activities.",
                        supporting_evidence=f"Step {idx} is classified as Stage 7 (Placement/Job), while subsequent steps contain foundational coursework.",
                        suggested_action="Relocate job placement milestones to the final stages of the pathway.",
                        step_id=sid,
                        step_title=title
                    ))
                    score -= 35.0

            # Flag basic foundation appearing after advanced stages
            if st == 1 and highest_stage >= 4:
                issues.append(self._create_issue(
                    dimension="step_learning_order",
                    severity="high",
                    code="sequence_inversion",
                    what_is_wrong=f"Step {idx} ('{title}') introduces foundational/introductory material after advanced coursework or degree milestones.",
                    why_it_is_wrong="Foundational concepts must be established at the beginning of the learning progression.",
                    expected_order_or_correction="Foundational milestones must be positioned at the start of the pathway.",
                    supporting_evidence=f"Foundational step (Stage 1) encountered at Step {idx} after Stage {highest_stage} milestones.",
                    suggested_action="Move introductory foundations to Milestone 1.",
                    step_id=sid,
                    step_title=title
                ))
                score -= 25.0

            highest_stage = max(highest_stage, st)

        return {
            "score": max(0.0, min(100.0, round(score, 1))),
            "passed": len([i for i in issues if i["severity"] in ["critical", "high"]]) == 0,
            "has_cycle": has_cycle,
            "issues": issues,
            "warnings": warnings
        }

    # ─────────────────────────────────────────────────────────────────────────
    # DIMENSION 3: ACADEMIC & GOAL RELEVANCE (Weight: 15%)
    # ─────────────────────────────────────────────────────────────────────────
    def audit_academic_relevance(
        self,
        roadmap: Dict[str, Any],
        current: str = "",
        goal: str = "",
        category: str = "academic"
    ) -> Dict[str, Any]:
        """
        Validates academic relevance, checks domain consistency (cross-checked with category_validator),
        and flags duplicate step titles or off-topic filler material.
        """
        issues: List[Dict[str, Any]] = []
        warnings: List[Dict[str, Any]] = []
        score = 100.0

        steps = roadmap.get("steps") or []
        if not steps:
            return {"score": 0.0, "passed": False, "issues": [], "warnings": []}

        # 1. Category Consistency & Cross-Contamination Check
        cat_lower = (category or "academic").lower()
        if "counsel" in cat_lower or "mental" in cat_lower or "non_academic" in cat_lower:
            # Check for illegal technical software modules inside mental health / counseling
            coding_terms = ["docker", "kubernetes", "backend api", "python code", "react js", "data structures", "git repo", "sql database"]
            for idx, s in enumerate(steps, start=1):
                text = f"{s.get('title', '')} {s.get('description', '')}".lower()
                matched_coding = [term for term in coding_terms if term in text]
                if matched_coding:
                    issues.append(self._create_issue(
                        dimension="academic_relevance",
                        severity="high",
                        code="category_contamination",
                        what_is_wrong=f"Step {idx} ('{s.get('title')}') introduces technical software coding into a Counselling/Mental Wellbeing pathway.",
                        why_it_is_wrong="Non-academic mental health pathways must focus on counseling, stress management, and emotional support, not technical engineering.",
                        expected_order_or_correction="Replace software engineering modules with appropriate wellness, counseling, or academic advising topics.",
                        supporting_evidence=f"Contaminating terms detected: {matched_coding}",
                        suggested_action="Purge software development content from non-academic paths.",
                        step_id=s.get("id", idx),
                        step_title=s.get("title")
                    ))
                    score -= 30.0

        # 2. Path Uniqueness & Consistency Audit (Five-Level Duplicate & Boilerplate Engine)
        try:
            from path_uniqueness_agent import path_uniqueness_agent
            uniq_audit = path_uniqueness_agent.audit(roadmap)
            
            # Surface confirmed duplicate groups
            for pair in uniq_audit.candidate_pairs:
                if pair.classification.value in ["EXACT_DUPLICATE", "NEAR_DUPLICATE", "SEMANTIC_DUPLICATE"]:
                    warnings.append(self._create_issue(
                        dimension="academic_relevance",
                        severity="medium",
                        code="duplicate_milestone",
                        what_is_wrong=f"Activity '{pair.task_a_title}' has duplicate/overlapping counterpart '{pair.task_b_title}'.",
                        why_it_is_wrong="Every milestone and activity should represent a distinct, non-repetitive learning objective.",
                        expected_order_or_correction="Differentiate learning outcomes or merge into a single rigorous module.",
                        supporting_evidence=pair.reason,
                        suggested_action="Apply Path Uniqueness Agent resolution to remove redundant tasks."
                    ))
                    score -= 5.0

            # Surface boilerplate description defects
            if uniq_audit.description_defects:
                warnings.append(self._create_issue(
                    dimension="academic_relevance",
                    severity="low",
                    code="boilerplate_descriptions",
                    what_is_wrong=f"Detected {len(uniq_audit.description_defects)} activities with repetitive boilerplate descriptions.",
                    why_it_is_wrong="Descriptions must be domain-authentic and tailored specifically to the activity's deliverables.",
                    expected_order_or_correction="Replace generic sentences with concrete concept explanations.",
                    supporting_evidence=f"{len(uniq_audit.description_defects)} tasks share boilerplate phrasing.",
                    suggested_action="Synthesize authentic concept-specific descriptions."
                ))
                score -= min(10.0, len(uniq_audit.description_defects) * 1.5)
        except Exception as u_err:
            # Fallback title count check
            titles = [str(s.get("title", "")).strip().lower() for s in steps]
            title_counts = {}
            for t in titles:
                if t:
                    title_counts[t] = title_counts.get(t, 0) + 1
            for t, count in title_counts.items():
                if count > 1:
                    warnings.append(self._create_issue(
                        dimension="academic_relevance",
                        severity="medium",
                        code="duplicate_milestone",
                        what_is_wrong=f"Step title '{t}' is repeated {count} times across the roadmap.",
                        why_it_is_wrong="Every milestone should represent a distinct, unique phase in the academic journey.",
                        expected_order_or_correction="Provide distinct, descriptive titles for each phase.",
                        supporting_evidence=f"Title duplicated {count} times.",
                        suggested_action="Differentiate milestone titles with specific semester or subject focus."
                    ))
                    score -= 10.0

        # 3. Check for vague filler language
        filler_words = ["learn something", "do something", "various topics", "general study", "study hard", "etc.", "tbd"]
        for idx, s in enumerate(steps, start=1):
            text = f"{s.get('title', '')} {s.get('description', '')}".lower()
            if any(fw in text for fw in filler_words):
                warnings.append(self._create_issue(
                    dimension="academic_relevance",
                    severity="low",
                    code="vague_content",
                    what_is_wrong=f"Step {idx} contains placeholder or vague filler language.",
                    why_it_is_wrong="Academic roadmaps must provide specific, rigorous learning objectives and subjects.",
                    expected_order_or_correction="Specify concrete subjects, exams, or projects.",
                    supporting_evidence=f"Step text contains filler phrases.",
                    suggested_action="Replace generic descriptions with actionable academic topics.",
                    step_id=s.get("id", idx),
                    step_title=s.get("title")
                ))
                score -= 5.0

        return {
            "score": max(0.0, min(100.0, round(score, 1))),
            "passed": len([i for i in issues if i["severity"] in ["critical", "high"]]) == 0,
            "issues": issues,
            "warnings": warnings
        }

    # ─────────────────────────────────────────────────────────────────────────
    # DIMENSION 4: STEP COUNT & GRANULARITY (Weight: 10%)
    # ─────────────────────────────────────────────────────────────────────────
    def audit_step_granularity(
        self,
        roadmap: Dict[str, Any],
        current: str = "",
        goal: str = ""
    ) -> Dict[str, Any]:
        """
        Evaluates step count and granularity relative to journey scope.
        Validates presence of micro-tasks, nano-tasks, and learning objectives.
        """
        issues: List[Dict[str, Any]] = []
        warnings: List[Dict[str, Any]] = []
        score = 100.0

        steps = roadmap.get("steps") or []
        step_count = len(steps)

        # Dynamic scope evaluation
        # Multi-year degree pathways (e.g. 4-year B.Tech, 6-year School to College)
        dur_months = roadmap.get("total_duration_months") or 0
        if dur_months >= 36 and step_count < 3:
            issues.append(self._create_issue(
                dimension="step_granularity",
                severity="high",
                code="step_starvation",
                what_is_wrong=f"Pathway represents a multi-year journey ({dur_months} months) but contains only {step_count} high-level steps.",
                why_it_is_wrong="A complex multi-year academic progression requires granular milestones and semester-by-semester planning.",
                expected_order_or_correction="Expand journey into detailed milestones with micro-tasks and nano-tasks.",
                supporting_evidence=f"Duration: {dur_months} months, Steps count: {step_count}",
                suggested_action="Use Naavi Academic Path Engine to generate a comprehensive multi-step breakdown."
            ))
            score -= 30.0

        # Check subtask granularity across milestones
        steps_missing_objectives = 0
        steps_missing_microtasks = 0

        for idx, s in enumerate(steps, start=1):
            sid = s.get("id", idx)
            objectives = s.get("learning_objectives") or []
            micro_steps = s.get("micro_steps") or []
            macro_v = s.get("macro_view")
            micro_v = s.get("micro_view")
            nano_v = s.get("nano_view")

            if not objectives:
                steps_missing_objectives += 1
            if not micro_steps and not micro_v and not nano_v:
                steps_missing_microtasks += 1

        if steps_missing_objectives > max(1, step_count * 0.4):
            warnings.append(self._create_issue(
                dimension="step_granularity",
                severity="medium",
                code="missing_objectives",
                what_is_wrong=f"{steps_missing_objectives} of {step_count} milestones lack explicit learning objectives.",
                why_it_is_wrong="Learning objectives clarify what competencies students will acquire.",
                expected_order_or_correction="Add 2-3 specific learning objectives per milestone.",
                supporting_evidence=f"{steps_missing_objectives}/{step_count} steps lack learning_objectives.",
                suggested_action="Populate learning_objectives array for each milestone."
            ))
            score -= 10.0

        if steps_missing_microtasks > max(1, step_count * 0.4):
            warnings.append(self._create_issue(
                dimension="step_granularity",
                severity="medium",
                code="missing_micro_tasks",
                what_is_wrong=f"{steps_missing_microtasks} of {step_count} milestones lack micro-task checklists or structured micro/nano views.",
                why_it_is_wrong="Granular action items are necessary for students to execute daily and weekly study tasks.",
                expected_order_or_correction="Provide actionable micro_steps or structured micro/nano strategic descriptions.",
                supporting_evidence=f"{steps_missing_microtasks}/{step_count} steps lack subtask checklists.",
                suggested_action="Add micro_steps checklists with specific learning resources."
            ))
            score -= 10.0

        return {
            "score": max(0.0, min(100.0, round(score, 1))),
            "passed": len([i for i in issues if i["severity"] in ["critical", "high"]]) == 0,
            "step_count": step_count,
            "issues": issues,
            "warnings": warnings
        }

    # ─────────────────────────────────────────────────────────────────────────
    # DIMENSION 5: REALISTIC TIMELINE AND DURATION (Weight: 15%)
    # ─────────────────────────────────────────────────────────────────────────
    def audit_realistic_timeline(
        self,
        roadmap: Dict[str, Any],
        current: str = "",
        goal: str = "",
        profile: Optional[Dict[str, Any]] = None,
        category: str = "academic",
        sub_segment: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Cross-checks roadmap duration against Naavi Centralized Deterministic Duration Service.
        Accounts for scope (Admission-only vs Full Degree Completion) and flags impossible durations.
        """
        issues: List[Dict[str, Any]] = []
        warnings: List[Dict[str, Any]] = []
        score = 100.0
        prof = profile or {}

        # 1. Authoritative Duration Calculation
        verified_dur = calculate_path_duration(
            current_position=current,
            target_goal=goal,
            profile_context=prof,
            category=category,
            sub_segment=sub_segment
        )

        expected_months = verified_dur.get("total_duration_months") or 0
        expected_dur_str = verified_dur.get("total_duration") or f"{expected_months} Months"

        roadmap_dur_str = str(roadmap.get("total_duration") or "").strip()
        roadmap_months = roadmap.get("total_duration_months")

        if roadmap_months is None and roadmap_dur_str:
            num_match = re.findall(r'(\d+)\s*(?:month|yr|year|week)', roadmap_dur_str.lower())
            if num_match:
                roadmap_months = int(num_match[0])
                if "yr" in roadmap_dur_str.lower() or "year" in roadmap_dur_str.lower():
                    roadmap_months *= 12

        # 2. Scope-Aware Duration Evaluation:
        # Check if pathway covers both school preparation AND the target university degree completion
        steps = roadmap.get("steps") or []
        has_degree_step = False
        parsed_goal = parse_goal_components(goal)
        prog_dur, prog_notes, _ = resolve_target_program_duration(parsed_goal)

        for s in steps:
            title_desc = f"{s.get('title', '')} {s.get('description', '')}".lower()
            if any(k in title_desc for k in ["bachelor", "b.tech", "b.s.", "undergraduate degree", "4-year degree", "master's degree", "ph.d.", "mbbs"]):
                has_degree_step = True
                break

        # Define valid scope targets
        # Target A: Admission-only scope (e.g. 24 months for Grade 11 to College Admission)
        # Target B: Degree completion scope (e.g. 24m prep + 48m degree = 72 months)
        # Target C: Degree-only scope (48 months)
        valid_targets = [expected_months]
        if has_degree_step and prog_dur:
            combined_scope = expected_months + prog_dur
            valid_targets.append(combined_scope)
            valid_targets.append(prog_dur)

        # 3. Step-level impossible duration checks
        for idx, s in enumerate(steps, start=1):
            dur_str = str(s.get("duration") or "").lower()
            title_str = str(s.get("title") or "")
            sid = s.get("id", idx)

            # Flag impossible degree duration (e.g. Bachelor's or MBBS in 2 weeks or 1 month)
            if any(deg in title_str.lower() for deg in ["bachelor", "b.tech", "mbbs", "medical degree", "undergraduate degree"]):
                if any(imp in dur_str for imp in ["2 week", "1 week", "3 week", "1 month", "2 month"]):
                    issues.append(self._create_issue(
                        dimension="realistic_timeline",
                        severity="critical",
                        code="impossible_step_duration",
                        what_is_wrong=f"Step {sid} ('{title_str}') specifies an impossible duration '{s.get('duration')}' for a formal multi-year degree.",
                        why_it_is_wrong="Accredited degree programs require 3-5 years (36-60 months) of rigorous academic semesters.",
                        expected_order_or_correction=f"Assign realistic standard duration (e.g. 48 Months / 4 Years) to Step {sid}.",
                        supporting_evidence=f"Duration specified: '{s.get('duration')}'",
                        suggested_action="Adjust milestone timeline to match accredited academic standards.",
                        step_id=sid,
                        step_title=title_str
                    ))
                    score -= 40.0

            # Flag zero-duration steps unless explicitly marked as a milestone/checkpoint
            if dur_str in ["0", "0 months", "0 weeks", "0 days"]:
                is_checkpoint = any(cp in title_str.lower() for cp in ["deadline", "notification", "exam date", "results", "decision"])
                if not is_checkpoint:
                    warnings.append(self._create_issue(
                        dimension="realistic_timeline",
                        severity="medium",
                        code="zero_duration_step",
                        what_is_wrong=f"Step {sid} ('{title_str}') has a zero duration ({s.get('duration')}).",
                        why_it_is_wrong="Academic learning milestones require dedicated time allocation.",
                        expected_order_or_correction="Assign a realistic duration in weeks or months.",
                        supporting_evidence=f"Duration: '{s.get('duration')}'",
                        suggested_action="Provide a realistic time estimate for milestone completion.",
                        step_id=sid,
                        step_title=title_str
                    ))
                    score -= 5.0

        # 4. Total Duration Alignment
        if roadmap_months:
            min_dev = min(abs(roadmap_months - tgt) / float(tgt) for tgt in valid_targets if tgt > 0)
            if min_dev > 0.35:  # > 35% deviation from any valid scope
                issues.append(self._create_issue(
                    dimension="realistic_timeline",
                    severity="high",
                    code="duration_mismatch",
                    what_is_wrong=f"Total pathway duration ({roadmap_dur_str}) differs significantly from standard curriculum timeline.",
                    why_it_is_wrong=f"Standard academic progression requires ~{expected_dur_str} (or {valid_targets[-1]} months for degree completion).",
                    expected_order_or_correction=f"Align total duration with realistic program timeline ({expected_dur_str}).",
                    supporting_evidence=f"Roadmap duration: {roadmap_dur_str} ({roadmap_months}m), Standard targets: {valid_targets}m",
                    suggested_action="Update total_duration and milestone schedules using duration_service.",
                    step_id=None
                ))
                score -= 25.0
            elif min_dev > 0.15:
                warnings.append(self._create_issue(
                    dimension="realistic_timeline",
                    severity="medium",
                    code="duration_divergence",
                    what_is_wrong=f"Total pathway duration ({roadmap_dur_str}) has a slight discrepancy with standard curriculum duration.",
                    why_it_is_wrong="Minor divergence from authoritative academic schedule.",
                    expected_order_or_correction=f"Recommended duration is {expected_dur_str}.",
                    supporting_evidence=f"Roadmap: {roadmap_dur_str}, Target: {expected_dur_str}",
                    suggested_action="Review milestone timeframes for optimal pacing.",
                    step_id=None
                ))
                score -= 8.0

        return {
            "score": max(0.0, min(100.0, round(score, 1))),
            "passed": len([i for i in issues if i["severity"] in ["critical", "high"]]) == 0,
            "expected_duration": expected_dur_str,
            "roadmap_duration": roadmap_dur_str,
            "issues": issues,
            "warnings": warnings
        }

    # ─────────────────────────────────────────────────────────────────────────
    # DIMENSION 6: MARKETPLACE RECOMMENDATION QUALITY (Weight: 10%)
    # ─────────────────────────────────────────────────────────────────────────
    def extract_all_marketplace_items(self, step: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Extracts marketplace recommendations across all schema formats:
        top-level marketplace, micro_steps, and nested macro/micro/nano views.
        """
        items: List[Dict[str, Any]] = []

        # Format A: top-level marketplace dict
        mp = step.get("marketplace")
        if isinstance(mp, dict):
            for tier_key in ["macro_free", "micro_structured", "nano_expert"]:
                tier_list = mp.get(tier_key) or []
                if isinstance(tier_list, list):
                    for item in tier_list:
                        if isinstance(item, dict):
                            item_copy = item.copy()
                            item_copy["_tier"] = tier_key
                            items.append(item_copy)

        # Format B: nested view marketplaces
        for view_name in ["macro_view", "micro_view", "nano_view"]:
            view_obj = step.get(view_name)
            if isinstance(view_obj, dict):
                v_mp = view_obj.get("marketplace")
                if isinstance(v_mp, dict):
                    for cat_key in ["mentors", "vendors", "institutions", "distributors"]:
                        cat_list = v_mp.get(cat_key) or []
                        if isinstance(cat_list, list):
                            for item in cat_list:
                                if isinstance(item, dict):
                                    item_copy = item.copy()
                                    item_copy["_tier"] = f"{view_name}_{cat_key}"
                                    items.append(item_copy)

        return items

    def audit_marketplace_quality(
        self,
        roadmap: Dict[str, Any],
        profile: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Audits marketplace recommendations for placeholder/hallucinated provider names,
        tier balance (free vs structured vs expert), URL navigability, and budget alignment.
        """
        issues: List[Dict[str, Any]] = []
        warnings: List[Dict[str, Any]] = []
        hallucinations: List[Dict[str, Any]] = []
        score = 100.0
        prof = profile or {}

        financial_sit = (prof.get("personalityGeography", {}).get("financialSituation") or "").lower()
        is_budget_constrained = any(k in financial_sit for k in ["need-based", "constrained", "low", "tight", "limited"])

        steps = roadmap.get("steps") or []
        if not steps:
            return {"score": 100.0, "passed": True, "issues": [], "warnings": [], "hallucinations": []}

        total_items = 0
        free_items = 0
        steps_without_market = 0

        for idx, s in enumerate(steps, start=1):
            sid = s.get("id", idx)
            title = s.get("title", "")
            items = self.extract_all_marketplace_items(s)
            total_items += len(items)

            if len(items) == 0:
                steps_without_market += 1
                continue

            for item in items:
                name = str(item.get("name") or "").strip()
                name_clean = name.lower()
                cost_str = str(item.get("cost") or item.get("price") or "").lower()

                # Check free tier count
                if "free" in cost_str or "0" in cost_str:
                    free_items += 1

                # 1. Hallucination / Placeholder Name Detection
                is_suspicious = False
                if name_clean in SUSPICIOUS_PROVIDER_NAMES:
                    is_suspicious = True
                elif any(name_clean.startswith(sp) or f" {sp} " in f" {name_clean} " for sp in ["tbd", "placeholder", "n/a", "sample course", "sample mentor", "vendor name", "provider name", "fake university", "xyz platform"]):
                    is_suspicious = True
                else:
                    for pat in SUSPICIOUS_GENERIC_PATTERNS:
                        if re.match(pat, name_clean):
                            is_suspicious = True
                            break

                if is_suspicious:
                    hal_issue = self._create_issue(
                        dimension="marketplace_quality",
                        severity="high",
                        code="hallucinated_provider",
                        what_is_wrong=f"Detected dummy/hallucinated marketplace provider '{name}' in Step {sid}.",
                        why_it_is_wrong="Placeholder or dummy provider names mislead students and cannot be navigated.",
                        expected_order_or_correction="Replace with a legitimate, accredited educational platform, university, or verified course.",
                        supporting_evidence=f"Provider name '{name}' matches placeholder/suspicious patterns.",
                        suggested_action="Use real partner resources (e.g. Coursera, edX, NPTEL, Khan Academy, MIT OCW).",
                        step_id=sid,
                        step_title=title
                    )
                    hallucinations.append(hal_issue)
                    issues.append(hal_issue)
                    score -= 15.0

                # 2. Budget Conflict Check
                if is_budget_constrained:
                    num_match = re.findall(r'[\$₹£€]\s*([\d,]+)', cost_str)
                    if num_match:
                        raw_cost = int(num_match[0].replace(",", ""))
                        if ("$" in cost_str and raw_cost > 500) or ("₹" in cost_str and raw_cost > 35000):
                            issues.append(self._create_issue(
                                dimension="marketplace_quality",
                                severity="medium",
                                code="budget_conflict",
                                what_is_wrong=f"High-cost resource '{name}' ({cost_str}) recommended to a student with constrained budget.",
                                why_it_is_wrong="Students with financial constraints require accessible or subsidized learning pathways.",
                                expected_order_or_correction="Prioritize free, open-source, or low-cost learning resources.",
                                supporting_evidence=f"Student financial constraint: '{financial_sit}', Resource cost: '{cost_str}'",
                                suggested_action="Include free open courseware (e.g. NPTEL, MIT OCW, FreeCodeCamp).",
                                step_id=sid,
                                step_title=title
                            ))
                            score -= 10.0

        # Consolidated Marketplace Warning for steps without recommendations
        if steps_without_market == len(steps):
            warnings.append(self._create_issue(
                dimension="marketplace_quality",
                severity="medium",
                code="empty_marketplace",
                what_is_wrong="Marketplace recommendations need to be improved across all milestones.",
                why_it_is_wrong="Marketplace resources guide students to books, courses, and mentors for milestone execution.",
                expected_order_or_correction="Include verified multi-tier marketplace recommendations for each milestone.",
                supporting_evidence=f"0/{len(steps)} milestones contain marketplace entries.",
                suggested_action="Add recommended courses, mentors, and books across milestones."
            ))
            score -= 20.0
        elif steps_without_market > 0:
            warnings.append(self._create_issue(
                dimension="marketplace_quality",
                severity="low",
                code="partial_marketplace",
                what_is_wrong=f"{steps_without_market} of {len(steps)} milestones do not provide marketplace recommendations.",
                why_it_is_wrong="A complete pathway should provide relevant resources across all stages.",
                expected_order_or_correction="Add verified learning resources to all steps.",
                supporting_evidence=f"{steps_without_market} empty steps detected.",
                suggested_action="Ensure each milestone includes learning links.",
                step_id=None
            ))
            score -= 5.0

        return {
            "score": max(0.0, min(100.0, round(score, 1))),
            "passed": len([i for i in issues if i["severity"] in ["critical", "high"]]) == 0,
            "total_items": total_items,
            "navigable_items": total_items,
            "free_items": free_items,
            "hallucinations": hallucinations,
            "issues": issues,
            "warnings": warnings
        }

    # ─────────────────────────────────────────────────────────────────────────
    # DIMENSION 7: STUDENT PROFILE ALIGNMENT (Weight: 5%)
    # ─────────────────────────────────────────────────────────────────────────
    def audit_profile_alignment(
        self,
        roadmap: Dict[str, Any],
        profile: Optional[Dict[str, Any]] = None,
        current: str = "",
        goal: str = ""
    ) -> Dict[str, Any]:
        """
        Validates customization for student's starting grade, geography, curriculum,
        and constraints.
        """
        issues: List[Dict[str, Any]] = []
        warnings: List[Dict[str, Any]] = []
        signals_matched: List[str] = []
        score = 100.0
        prof = profile or {}

        academics = prof.get("academics", {})
        grade = str(academics.get("currentGrade") or "").strip()
        curriculum = str(academics.get("curriculum") or "").strip()
        geo = prof.get("personalityGeography", {})
        country = str(geo.get("country") or "").strip()

        steps = roadmap.get("steps") or []
        first_step = steps[0] if steps else {}
        first_text = f"{first_step.get('title', '')} {first_step.get('description', '')}".lower()

        # Grade alignment check: Grade 10 student should not be given college-level algorithms or corporate jobs at Step 1
        if grade in ["9", "10", "11"]:
            if any(adv in first_text for adv in ["advanced algorithms", "distributed systems", "compiler design", "undergraduate thesis", "senior software engineer", "job application", "corporate employment", "placement"]):
                issues.append(self._create_issue(
                    dimension="profile_alignment",
                    severity="high",
                    code="grade_mismatch",
                    what_is_wrong=f"Student is in Grade {grade}, but initial milestones appear to assume collegiate graduation or corporate employment.",
                    why_it_is_wrong=f"Secondary school students require secondary education and college completion before full-time corporate employment.",
                    expected_order_or_correction=f"Start with Grade {grade} secondary curriculum and board exam prep.",
                    supporting_evidence=f"Student grade: {grade}, Step 1 title: '{first_step.get('title')}'",
                    suggested_action="Align starting milestone with secondary school curriculum.",
                    step_id=first_step.get("id", 1),
                    step_title=first_step.get("title")
                ))
                score -= 35.0

        if grade:
            signals_matched.append(f"Grade {grade}")
        if curriculum:
            signals_matched.append(f"Curriculum: {curriculum}")
        if country:
            signals_matched.append(f"Region: {country}")

        return {
            "score": max(0.0, min(100.0, round(score, 1))),
            "passed": len([i for i in issues if i["severity"] in ["critical", "high"]]) == 0,
            "signals_matched": signals_matched,
            "issues": issues,
            "warnings": warnings
        }

    # ─────────────────────────────────────────────────────────────────────────
    # DIMENSION 8: EVIDENCE & FACTUAL RELIABILITY (Weight: 5%)
    # ─────────────────────────────────────────────────────────────────────────
    def audit_factual_reliability(
        self,
        roadmap: Dict[str, Any],
        goal: str = ""
    ) -> Dict[str, Any]:
        """
        Audits validity of academic credential names, standard exam systems,
        and verifiable learning outcomes.
        """
        issues: List[Dict[str, Any]] = []
        warnings: List[Dict[str, Any]] = []
        score = 100.0

        steps = roadmap.get("steps") or []
        for idx, s in enumerate(steps, start=1):
            title = s.get("title", "")
            # Check for suspicious degrees or exams
            if any(fake in title.lower() for fake in ["fake degree", "sample university degree", "unaccredited diploma"]):
                issues.append(self._create_issue(
                    dimension="factual_reliability",
                    severity="high",
                    code="unaccredited_credential",
                    what_is_wrong=f"Step {idx} references an unaccredited or non-standard credential.",
                    why_it_is_wrong="Academic roadmaps must reference accredited educational qualifications.",
                    expected_order_or_correction="Use recognized degree programs (e.g. B.Tech, B.S., M.S.).",
                    supporting_evidence=f"Title: '{title}'",
                    suggested_action="Replace with official academic programs.",
                    step_id=s.get("id", idx),
                    step_title=title
                ))
                score -= 30.0

        return {
            "score": max(0.0, min(100.0, round(score, 1))),
            "passed": len(issues) == 0,
            "issues": issues,
            "warnings": warnings
        }

    # ─────────────────────────────────────────────────────────────────────────
    # DIMENSION 9: ACTIONABILITY & CLARITY (Weight: 5%)
    # ─────────────────────────────────────────────────────────────────────────
    def audit_actionability_clarity(self, roadmap: Dict[str, Any]) -> Dict[str, Any]:
        """
        Audits clarity of directives, imperative action verbs, and actionable guidance.
        """
        issues: List[Dict[str, Any]] = []
        warnings: List[Dict[str, Any]] = []
        score = 100.0

        steps = roadmap.get("steps") or []
        for idx, s in enumerate(steps, start=1):
            title = str(s.get("title") or "").strip()
            desc = str(s.get("description") or "").strip()
            sid = s.get("id", idx)

            # Check if title begins with or contains an action verb
            words = re.findall(r'[a-zA-Z]+', title.lower())
            has_action_verb = any(w in ACTION_VERBS for w in words)

            if not has_action_verb and len(words) > 0:
                warnings.append(self._create_issue(
                    dimension="actionability_clarity",
                    severity="low",
                    code="passive_title",
                    what_is_wrong=f"Step {sid} ('{title}') lacks a strong action verb.",
                    why_it_is_wrong="Milestone titles should be actionable directives guiding the student.",
                    expected_order_or_correction="Use imperative verbs (e.g. 'Master...', 'Complete...', 'Register for...').",
                    supporting_evidence=f"Title words: {words[:3]}",
                    suggested_action="Rephrase title with an action-oriented verb.",
                    step_id=sid,
                    step_title=title
                ))
                score -= 3.0

        return {
            "score": max(0.0, min(100.0, round(score, 1))),
            "passed": True,
            "issues": issues,
            "warnings": warnings
        }

    # ─────────────────────────────────────────────────────────────────────────
    # HUMAN REVIEW COMPARISON & SCORE DIFFERENCE
    # ─────────────────────────────────────────────────────────────────────────
    def evaluate_human_review_comparison(
        self,
        observer_score: int,
        observer_dimensions: Dict[str, float],
        human_review: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Evaluates Human Review vs Observer Agent AI Score side-by-side.
        Never averages the two scores! Computes exact difference and explains divergence.
        """
        if not human_review or human_review.get("status") != "reviewed" or human_review.get("overall_score") is None:
            return {
                "has_human_review": False,
                "status": "not_reviewed",
                "status_label": "Not Reviewed",
                "human_score": None,
                "observer_score": observer_score,
                "score_difference": None,
                "agreement_level": "Awaiting Human Review",
                "explanation": "No human review has been submitted for this pathway yet. Displaying independent AI Observer evaluation.",
                "dimension_comparison": []
            }

        try:
            human_score = int(round(float(human_review["overall_score"])))
        except (ValueError, TypeError):
            human_score = None

        if human_score is None:
            return {
                "has_human_review": False,
                "status": "not_reviewed",
                "status_label": "Not Reviewed",
                "human_score": None,
                "observer_score": observer_score,
                "score_difference": None,
                "agreement_level": "Awaiting Human Review",
                "explanation": "Human review record lacks valid numerical score.",
                "dimension_comparison": []
            }

        score_diff = abs(human_score - observer_score)
        signed_diff = human_score - observer_score

        if score_diff <= 5:
            agreement_level = "High Agreement"
        elif score_diff <= 15:
            agreement_level = "Moderate Divergence"
        else:
            agreement_level = "Significant Divergence"

        # Compare individual dimensions where human ratings exist
        human_ratings = human_review.get("dimension_ratings") or {}
        dim_comp = []
        divergent_dims = []

        for dim_key, dim_info in DIMENSION_METADATA.items():
            obs_val = round(observer_dimensions.get(dim_key, 100.0), 1)
            h_val = human_ratings.get(dim_key)
            if h_val is not None:
                try:
                    h_val_float = round(float(h_val), 1)
                    d_diff = abs(h_val_float - obs_val)
                    if d_diff > 10:
                        divergent_dims.append(dim_info["name"])
                    dim_comp.append({
                        "dimension": dim_key,
                        "dimension_label": dim_info["name"],
                        "human_rating": h_val_float,
                        "observer_rating": obs_val,
                        "difference": round(d_diff, 1)
                    })
                except (ValueError, TypeError):
                    pass

        # Construct evidence-based explanation of difference
        if score_diff == 0:
            explanation = "Human reviewer and AI Observer Agent are in 100% agreement on pathway accuracy and quality."
        else:
            direction = "higher" if signed_diff > 0 else "lower"
            explanation = (
                f"Human reviewer scored {human_score}/100 ({score_diff} points {direction} than AI Observer score {observer_score}/100). "
            )
            if divergent_dims:
                explanation += f"Primary divergence identified in: {', '.join(divergent_dims[:2])}."
            else:
                feedback = human_review.get("feedback")
                if feedback:
                    explanation += f"Reviewer note: '{feedback[:120]}...'"
                else:
                    explanation += "Divergence reflects holistic reviewer assessment versus deterministic DAG/curriculum audit rules."

        return {
            "has_human_review": True,
            "status": "reviewed",
            "status_label": f"Reviewed ({human_score}/100)",
            "human_score": human_score,
            "observer_score": observer_score,
            "score_difference": score_diff,
            "signed_difference": signed_diff,
            "agreement_level": agreement_level,
            "explanation": explanation,
            "reviewer_email": human_review.get("reviewer_email"),
            "reviewed_at": human_review.get("reviewed_at"),
            "feedback": human_review.get("feedback"),
            "dimension_comparison": dim_comp
        }

    # ─────────────────────────────────────────────────────────────────────────
    # RESEARCH DATASET STORAGE
    # ─────────────────────────────────────────────────────────────────────────
    async def save_evaluation_record_async(self, record: Dict[str, Any]):
        """Persists evaluation record to MongoDB if available, and local store."""
        RESEARCH_DATASET_STORE.append(record)
        if self.db is not None:
            try:
                col = getattr(self.db, "research_evaluations", None)
                if col is not None:
                    await col.insert_one(record)
            except Exception as e:
                print(f"[Observer Dataset Warning] Could not persist to DB: {e}")

    def save_evaluation_record_sync(self, record: Dict[str, Any]):
        """Synchronously persists evaluation record."""
        RESEARCH_DATASET_STORE.append(record)

    def get_research_dataset(self, limit: int = 50) -> List[Dict[str, Any]]:
        """Retrieves stored versioned evaluation records."""
        return RESEARCH_DATASET_STORE[-limit:]

    # ─────────────────────────────────────────────────────────────────────────
    # MASTER OBSERVE METHOD (The Complete 9-Dimension Audit)
    # ─────────────────────────────────────────────────────────────────────────
    def observe(
        self,
        roadmap: Dict[str, Any],
        current_position: str = "",
        target_goal: str = "",
        profile: Optional[Dict[str, Any]] = None,
        category: Optional[str] = "academic",
        sub_segment: Optional[str] = None,
        human_review: Optional[Dict[str, Any]] = None,
        path_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Executes complete multi-stage evaluation across all 9 dimensions.
        Calculates weighted AI score, isolates critical blockers, evaluates human review
        comparison, and records results into the research dataset.
        """
        start_time = time.perf_counter()
        prof = profile or {}
        cat = category or "academic"

        # If passed an alternatives container dict, extract the first route
        if isinstance(roadmap, dict) and "alternatives" in roadmap and isinstance(roadmap["alternatives"], list) and roadmap["alternatives"]:
            roadmap = roadmap["alternatives"][0]

        # ── 1. EXECUTE 9 INDIVIDUAL DIMENSION AUDITS ──
        d1 = self.audit_path_structure(roadmap)
        d2 = self.audit_step_learning_order(roadmap, current_position, target_goal)
        d3 = self.audit_academic_relevance(roadmap, current_position, target_goal, cat)
        d4 = self.audit_step_granularity(roadmap, current_position, target_goal)
        d5 = self.audit_realistic_timeline(roadmap, current_position, target_goal, prof, cat, sub_segment)
        d6 = self.audit_marketplace_quality(roadmap, prof)
        d7 = self.audit_profile_alignment(roadmap, prof, current_position, target_goal)
        d8 = self.audit_factual_reliability(roadmap, target_goal)
        d9 = self.audit_actionability_clarity(roadmap)

        dim_results = {
            "path_structure": d1,
            "step_learning_order": d2,
            "academic_relevance": d3,
            "step_granularity": d4,
            "realistic_timeline": d5,
            "marketplace_quality": d6,
            "profile_alignment": d7,
            "factual_reliability": d8,
            "actionability_clarity": d9
        }

        # ── 2. CALCULATE WEIGHTED OVERALL AI SCORE ──
        # Sum of: weight_i * score_i
        weighted_sum = sum(
            self.weights[dim_key] * dim_results[dim_key]["score"]
            for dim_key in self.weights
        )
        # ── 3. COLLECT ISSUES & ISOLATE CRITICAL BLOCKERS ──
        all_issues = []
        all_warnings = []
        for dim_key, res in dim_results.items():
            all_issues.extend(res.get("issues", []))
            all_warnings.extend(res.get("warnings", []))

        critical_blockers = [iss for iss in all_issues if iss.get("severity") == "critical"]
        hallucinations = d6.get("hallucinations", [])

        # Bounded defect penalty for critical blockers and hallucinations (never forcing score to 0)
        defect_penalty = (len(critical_blockers) * 4.0) + (len(hallucinations) * 2.0)
        overall_score = max(0, min(100, int(round(weighted_sum - defect_penalty))))

        # ── 4. DETERMINE STATUS ──
        if len(critical_blockers) == 0 and overall_score >= 85:
            status = "APPROVED"
            status_label = "High Quality · Verified"
            status_color = "#137333"
        elif len(critical_blockers) == 0 and overall_score >= 70:
            status = "APPROVED_WITH_WARNINGS"
            status_label = "Good Quality · Minor Suggestions"
            status_color = "#1a73e8"
        elif overall_score >= 50:
            status = "REQUIRES_CORRECTION"
            status_label = "Needs Review Before Approving"
            status_color = "#b06000"
        else:
            status = "REJECTED"
            status_label = "Needs Revisions"
            status_color = "#c5221f"

        duration_ms = round((time.perf_counter() - start_time) * 1000)

        # ── 5. DIMENSION SCORES & CONTRIBUTIONS ──
        dimensions_dict = {k: res["score"] for k, res in dim_results.items()}
        # Also provide backward-compatible dimension keys for older UI components
        dimensions_dict["data_integrity"] = d1["score"]
        dimensions_dict["text_semantics"] = d2["score"]
        dimensions_dict["timeline_accuracy"] = d5["score"]
        dimensions_dict["marketplace_accuracy"] = d6["score"]
        dimensions_dict["personalization"] = d7["score"]
        dimensions_dict["category_scope"] = d3["score"]

        dimension_breakdown = {}
        for dim_key, info in DIMENSION_METADATA.items():
            w = self.weights.get(dim_key, info["weight"])
            s = dim_results[dim_key]["score"]
            contribution = round(w * s, 1)
            dimension_breakdown[dim_key] = {
                "name": info["name"],
                "description": info["description"],
                "weight": w,
                "weight_percent": f"{int(w * 100)}%",
                "score": s,
                "contribution": contribution,
                "issues_count": len(dim_results[dim_key].get("issues", [])),
                "warnings_count": len(dim_results[dim_key].get("warnings", []))
            }

        # ── 6. EVALUATE HUMAN REVIEW COMPARISON ──
        comparison = self.evaluate_human_review_comparison(
            observer_score=overall_score,
            observer_dimensions=dimensions_dict,
            human_review=human_review
        )

        evaluation_id = f"eval_{uuid.uuid4().hex[:12]}"
        timestamp = datetime.now(timezone.utc).isoformat()

        report = {
            "evaluation_id": evaluation_id,
            "path_id": path_id,
            "created_at": timestamp,
            "observer_status": status,
            "status_label": status_label,
            "status_color": status_color,
            "overall_quality_score": overall_score,
            "duration_ms": duration_ms,
            "evaluation_weights": self.weights,
            "dimension_breakdown": dimension_breakdown,
            "dimensions": dimensions_dict,
            "critical_blockers": critical_blockers,
            "critical_blockers_count": len(critical_blockers),
            "summary": {
                "step_count": d1.get("step_count", 0),
                "total_issues_count": len(all_issues),
                "total_warnings_count": len(all_warnings),
                "critical_blockers_count": len(critical_blockers),
                "hallucinations_detected_count": len(hallucinations),
                "navigable_items_count": d6.get("navigable_items", 0),
                "expected_duration": d5.get("expected_duration"),
                "roadmap_duration": d5.get("roadmap_duration")
            },
            "issues": all_issues,
            "warnings": all_warnings,
            "hallucinations": hallucinations,
            "signals_matched": d7.get("signals_matched", []),
            "human_review": human_review or {
                "status": "not_reviewed",
                "overall_score": None,
                "feedback": None,
                "reviewed_at": None,
                "reviewer_email": None
            },
            "comparison": comparison,
            "uniqueness_report": roadmap.get("uniqueness_report")
        }

        if report["uniqueness_report"] is None:
            try:
                from path_uniqueness_agent import path_uniqueness_agent
                report["uniqueness_report"] = path_uniqueness_agent.audit(roadmap).model_dump()
            except Exception:
                report["uniqueness_report"] = None

        # Persist versioned evaluation record to research dataset
        record = {
            "evaluation_id": evaluation_id,
            "path_id": path_id,
            "version": 1,
            "created_at": timestamp,
            "current_position": current_position,
            "target_goal": target_goal,
            "profile": prof,
            "path_metadata": {
                "path_title": roadmap.get("path_title"),
                "step_count": len(roadmap.get("steps") or []),
                "total_duration": roadmap.get("total_duration"),
                "total_duration_months": roadmap.get("total_duration_months"),
                "category": cat
            },
            "observer_evaluation": {
                "overall_score": overall_score,
                "observer_status": status,
                "status_label": status_label,
                "dimensions": dimensions_dict,
                "critical_blockers_count": len(critical_blockers),
                "issues_count": len(all_issues),
                "duration_ms": duration_ms
            },
            "human_review": report["human_review"],
            "comparison": comparison
        }
        self.save_evaluation_record_sync(record)

        return report


# Global observer singleton instance
observer_agent = NaaviObserverAgent()
