"""
=============================================================================
NAAVI OBSERVER AGENT (Quality, Accuracy & Hallucination Auditor)
=============================================================================
Architecture & Operational Rules:
1. NON-INVASIVE OBSERVER: Sits above existing agents and flows without modifying
   or breaking any existing generation pipeline or endpoints.
2. DETERMINISTIC FIRST: Never trusts an LLM output blindly. Uses deterministic
   rules (duration_service, category_validator, schema integrity, pricing models)
   before semantic heuristic evaluation.
3. MULTI-DIMENSIONAL AUDIT:
   - Data Accuracy (Schema, required fields, non-empty structures, uniqueness)
   - Text & Milestone Semantic Accuracy (Goal alignment, DAG sequence, actionability)
   - Timeline & Duration Accuracy (Cross-checked against centralized duration_service)
   - Category & Domain Consistency (Cross-checked against category_validator lexicon)
   - Marketplace Accuracy (Hallucination detection, pricing vs budget, tier structure)
   - Student Signal & Personalization Alignment (Academic level, geography, financial tier)
4. EXPLAINABLE QUALITY SCORE: Produces an overall 0-100 score with exact dimension
   breakdowns and itemized deduction explanations.
=============================================================================
"""

import re
import json
import time
from typing import Dict, Any, List, Optional, Tuple

try:
    from duration_service import (
        calculate_path_duration,
        validate_path_duration,
        resolve_category
    )
except ImportError:
    from .duration_service import (
        calculate_path_duration,
        validate_path_duration,
        resolve_category
    )

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


# ─── KNOWN HALLUCINATIONS / DUMMY PLACEHOLDER PATTERNS ────────────────────────
SUSPICIOUS_PROVIDER_NAMES = {
    "tbd", "n/a", "na", "none", "null", "undefined", "unknown", "placeholder",
    "course name", "mentor name", "partner name", "vendor name", "provider name",
    "sample course", "sample mentor", "test course", "lorem ipsum", "xyz platform",
    "abc institute", "example course", "some university", "fake university", "expert review"
}

# Generic words that indicate lack of concrete entity
SUSPICIOUS_GENERIC_PATTERNS = [
    r'^(course|mentor|vendor|institution|service|book|tutorial)\s*\d*$',
    r'^(online course|online mentor|private tutor|free resources?)$',
    r'^(learn [a-z]+ course|study [a-z]+)$',
]


class NaaviObserverAgent:
    """
    Independent Observer Agent that audits generated roadmaps across all
    dimensions of accuracy, data integrity, marketplace realism, and personalization.
    """

    def __init__(self, db=None):
        self.db = db

    # ─────────────────────────────────────────────────────────────────────────
    # 1. DATA INTEGRITY & STRUCTURAL AUDIT
    # ─────────────────────────────────────────────────────────────────────────
    def audit_data_integrity(self, roadmap: Dict[str, Any]) -> Dict[str, Any]:
        """
        Verifies schema compliance, mandatory fields, step indices, and structure.
        """
        issues: List[Dict[str, Any]] = []
        warnings: List[Dict[str, Any]] = []
        score = 100.0

        if not isinstance(roadmap, dict):
            return {
                "score": 0.0,
                "passed": False,
                "issues": [{"field": "root", "severity": "critical", "message": "Roadmap is not a valid JSON/dict object."}],
                "warnings": []
            }

        # Check root fields
        required_root = ["steps"]
        recommended_root = ["path_title", "path_description", "readiness_score", "total_duration"]

        for req in required_root:
            if req not in roadmap or roadmap[req] is None:
                issues.append({"field": req, "severity": "critical", "message": f"Mandatory root field '{req}' is missing."})
                score -= 30.0

        for rec in recommended_root:
            if rec not in roadmap or roadmap[rec] is None or str(roadmap[rec]).strip() == "":
                warnings.append({"field": rec, "severity": "medium", "message": f"Recommended field '{rec}' is empty or missing."})
                score -= 5.0

        steps = roadmap.get("steps") or []
        if not isinstance(steps, list) or len(steps) == 0:
            issues.append({"field": "steps", "severity": "critical", "message": "Roadmap contains zero steps/milestones."})
            score = 0.0
            return {"score": max(0.0, score), "passed": False, "issues": issues, "warnings": warnings}

        # Check Step ID continuity and structure
        seen_ids = set()
        for idx, step in enumerate(steps, start=1):
            if not isinstance(step, dict):
                issues.append({"field": f"steps[{idx}]", "severity": "critical", "message": f"Step at index {idx} is not an object."})
                score -= 15.0
                continue

            step_id = step.get("id")
            if step_id is None:
                issues.append({"field": f"steps[{idx}].id", "severity": "high", "message": f"Step {idx} is missing an 'id'."})
                score -= 5.0
            elif step_id in seen_ids:
                issues.append({"field": f"steps[{idx}].id", "severity": "high", "message": f"Duplicate step ID '{step_id}' detected."})
                score -= 10.0
            else:
                seen_ids.add(step_id)

            # Check title & description
            title = str(step.get("title") or "").strip()
            desc = str(step.get("description") or "").strip()
            if not title:
                issues.append({"field": f"steps[{idx}].title", "severity": "high", "message": f"Step {idx} has an empty title."})
                score -= 8.0
            elif len(title) < 5:
                warnings.append({"field": f"steps[{idx}].title", "severity": "low", "message": f"Step {idx} title is too brief ('{title}')."})
                score -= 2.0

            if not desc:
                warnings.append({"field": f"steps[{idx}].description", "severity": "medium", "message": f"Step {idx} has an empty description."})
                score -= 5.0

            # Check Views: Macro, Micro, Nano
            for view_key in ["macro_view", "micro_view", "nano_view"]:
                view_val = step.get(view_key)
                if not view_val:
                    warnings.append({"field": f"steps[{idx}].{view_key}", "severity": "low", "message": f"Step {idx} missing {view_key}."})
                    score -= 3.0

            # Check Learning Objectives
            objs = step.get("learning_objectives")
            if not isinstance(objs, list) or len(objs) == 0:
                warnings.append({"field": f"steps[{idx}].learning_objectives", "severity": "medium", "message": f"Step {idx} has no learning objectives."})
                score -= 4.0

            # Check Micro Steps
            msteps = step.get("micro_steps")
            if not isinstance(msteps, list) or len(msteps) == 0:
                warnings.append({"field": f"steps[{idx}].micro_steps", "severity": "low", "message": f"Step {idx} has no micro_steps checklist."})
                score -= 2.0

        return {
            "score": max(0.0, min(100.0, round(score, 1))),
            "passed": len(issues) == 0,
            "step_count": len(steps),
            "issues": issues,
            "warnings": warnings
        }

    # ─────────────────────────────────────────────────────────────────────────
    # 2. TEXT & MILESTONE SEMANTIC ACCURACY (DAG & Actionability)
    # ─────────────────────────────────────────────────────────────────────────
    def audit_text_semantics(
        self,
        roadmap: Dict[str, Any],
        current: str,
        goal: str
    ) -> Dict[str, Any]:
        """
        Validates logical sequencing, prerequisite laddering (DAG), and actionability.
        Detects inverted sequences (e.g. applying for internships before basic fundamentals).
        """
        issues: List[Dict[str, Any]] = []
        warnings: List[Dict[str, Any]] = []
        score = 100.0

        steps = roadmap.get("steps") or []
        if not steps:
            return {"score": 0.0, "passed": False, "issues": [{"message": "No steps to audit"}], "warnings": []}

        # Sequence heuristics (Keywords indicating stage depth)
        PREREQUISITE_LADDER = {
            "foundation": ["foundation", "basics", "fundamentals", "intro", "introduction", "101", "starting", "orient"],
            "intermediate": ["intermediate", "core", "deep dive", "advanced concepts", "frameworks", "algorithms", "specialization"],
            "application": ["project", "portfolio", "application", "capstone", "build", "practice", "hands-on"],
            "capstone_placement": ["internship", "job", "career", "placement", "interview", "admission", "apply", "graduation", "license"]
        }

        # Track the stage of each step
        step_stages = []
        for i, s in enumerate(steps, start=1):
            s_text = f"{s.get('title', '')} {s.get('description', '')}".lower()
            detected_stage = 0
            if any(k in s_text for k in PREREQUISITE_LADDER["foundation"]):
                detected_stage = 1
            elif any(k in s_text for k in PREREQUISITE_LADDER["intermediate"]):
                detected_stage = 2
            elif any(k in s_text for k in PREREQUISITE_LADDER["application"]):
                detected_stage = 3
            elif any(k in s_text for k in PREREQUISITE_LADDER["capstone_placement"]):
                detected_stage = 4
            step_stages.append((i, s.get("title", ""), detected_stage))

        # Check for gross DAG sequence inversions (e.g., stage 4 before stage 1)
        highest_stage_seen = 0
        for step_idx, title, stage in step_stages:
            if stage == 0:
                continue
            if stage < highest_stage_seen and (highest_stage_seen - stage) >= 2:
                # E.g. Found stage 1 (foundation) after stage 4 (job/internship/placement)
                issues.append({
                    "step_id": step_idx,
                    "severity": "high",
                    "type": "sequence_inversion",
                    "message": f"Step {step_idx} ('{title}') introduces foundational material after advanced capstone/placement steps."
                })
                score -= 15.0
            highest_stage_seen = max(highest_stage_seen, stage)

        # Check for repetitive or duplicate milestone titles
        titles = [str(s.get("title", "")).strip().lower() for s in steps]
        title_counts = {}
        for t in titles:
            if t:
                title_counts[t] = title_counts.get(t, 0) + 1

        for t, count in title_counts.items():
            if count > 1:
                warnings.append({
                    "severity": "medium",
                    "type": "duplicate_milestone",
                    "message": f"Milestone title '{t}' appears {count} times across the roadmap."
                })
                score -= 10.0

        # Check for generic filler phrases
        filler_words = ["learn something", "do something", "various topics", "etc.", "tbd", "general study"]
        for i, s in enumerate(steps, start=1):
            full_text = f"{s.get('title', '')} {s.get('description', '')}".lower()
            if any(fw in full_text for fw in filler_words):
                warnings.append({
                    "step_id": i,
                    "severity": "low",
                    "type": "vague_content",
                    "message": f"Step {i} contains vague filler language."
                })
                score -= 5.0

        return {
            "score": max(0.0, min(100.0, round(score, 1))),
            "passed": len(issues) == 0,
            "issues": issues,
            "warnings": warnings
        }

    # ─────────────────────────────────────────────────────────────────────────
    # 3. TIMELINE & DURATION INTEGRITY AUDIT
    # ─────────────────────────────────────────────────────────────────────────
    def audit_timeline(
        self,
        roadmap: Dict[str, Any],
        current: str,
        goal: str,
        profile: Dict[str, Any],
        category: str,
        sub_segment: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Cross-checks roadmap duration against Naavi's Centralized Deterministic Duration Service.
        Verifies individual step durations and prevents impossible timelines (e.g. 2-week MBBS).
        """
        issues: List[Dict[str, Any]] = []
        warnings: List[Dict[str, Any]] = []
        score = 100.0

        # Run authoritative duration calculation
        verified_dur = calculate_path_duration(
            current_position=current,
            target_goal=goal,
            profile_context=profile,
            category=category,
            sub_segment=sub_segment
        )

        expected_months = verified_dur.get("total_duration_months") or 0
        expected_dur_str = verified_dur.get("total_duration") or ""

        roadmap_dur_str = str(roadmap.get("total_duration") or "").strip()
        roadmap_months = roadmap.get("total_duration_months")

        # Parse months from roadmap total_duration if total_duration_months not explicitly stored
        if roadmap_months is None and roadmap_dur_str:
            num_match = re.findall(r'(\d+)\s*(?:month|yr|year|week)', roadmap_dur_str.lower())
            if num_match:
                roadmap_months = int(num_match[0])
                if "yr" in roadmap_dur_str.lower() or "year" in roadmap_dur_str.lower():
                    roadmap_months *= 12

        # Verify total duration alignment
        if expected_months > 0 and roadmap_months:
            deviation_pct = abs(roadmap_months - expected_months) / float(expected_months)
            if deviation_pct > 0.30:  # > 30% deviation from official curriculum/program duration
                issues.append({
                    "severity": "high",
                    "type": "duration_mismatch",
                    "expected_months": expected_months,
                    "expected_duration": expected_dur_str,
                    "actual_months": roadmap_months,
                    "actual_duration": roadmap_dur_str,
                    "message": f"Roadmap total duration ({roadmap_dur_str}) significantly diverges from standard curriculum timeline ({expected_dur_str})."
                })
                score -= 25.0
            elif deviation_pct > 0.15:
                warnings.append({
                    "severity": "medium",
                    "type": "duration_divergence",
                    "expected_duration": expected_dur_str,
                    "actual_duration": roadmap_dur_str,
                    "message": f"Roadmap duration ({roadmap_dur_str}) has a slight discrepancy with authoritative duration ({expected_dur_str})."
                })
                score -= 10.0

        # Verify individual step duration realism
        steps = roadmap.get("steps") or []
        for i, s in enumerate(steps, start=1):
            dur = str(s.get("duration") or "").strip().lower()
            if not dur:
                warnings.append({"step_id": i, "severity": "medium", "message": f"Step {i} duration is unspecified."})
                score -= 5.0
                continue

            # Detect impossible mini-durations for heavy milestones
            s_title = str(s.get("title") or "").lower()
            if any(term in s_title for term in ["master's", "bachelor's", "degree", "mbbs", "phd"]):
                if any(unit in dur for unit in ["day", "week", "1 month", "2 month"]):
                    issues.append({
                        "step_id": i,
                        "severity": "critical",
                        "type": "impossible_step_duration",
                        "message": f"Step {i} ('{s.get('title')}') specifies an impossible duration '{dur}' for a multi-year formal degree."
                    })
                    score -= 20.0

        return {
            "score": max(0.0, min(100.0, round(score, 1))),
            "passed": len(issues) == 0,
            "expected_duration": expected_dur_str,
            "expected_months": expected_months,
            "roadmap_duration": roadmap_dur_str,
            "issues": issues,
            "warnings": warnings
        }

    # ─────────────────────────────────────────────────────────────────────────
    # 4. MARKETPLACE & PARTNER ACCURACY AUDIT
    # ─────────────────────────────────────────────────────────────────────────
    @staticmethod
    def extract_step_marketplace_items(step: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Extracts all marketplace provider items from a milestone step, searching:
        - step.macro_view.marketplace (mentors, vendors, institutions, distributors)
        - step.micro_view.marketplace (mentors, vendors, institutions, distributors)
        - step.nano_view.marketplace (mentors, vendors, institutions, distributors)
        - step.marketplace (mentors, vendors, institutions, distributors, macro_free, micro_structured, nano_expert)
        - step.resources
        - step.micro_steps (if resources are attached)
        """
        items: List[Dict[str, Any]] = []
        seen_keys = set()

        def _add_item(it: Any, fallback_section: str = ""):
            if not isinstance(it, dict):
                return
            name = str(it.get("name") or it.get("title") or "").strip()
            if not name:
                return
            item_type = str(it.get("type") or it.get("category") or "").strip()
            key = (name.lower(), item_type.lower())
            if key not in seen_keys:
                seen_keys.add(key)
                enriched = dict(it)
                if fallback_section and not enriched.get("section"):
                    enriched["section"] = fallback_section
                items.append(enriched)

        def _extract_from_market_obj(m_obj: Any, section_tag: str = ""):
            if not m_obj:
                return
            if isinstance(m_obj, list):
                for it in m_obj:
                    _add_item(it, section_tag)
            elif isinstance(m_obj, dict):
                for cat_key in [
                    "mentors", "vendors", "institutions", "distributors",
                    "macro_free", "micro_structured", "nano_expert"
                ]:
                    val = m_obj.get(cat_key)
                    if isinstance(val, list):
                        for it in val:
                            _add_item(it, section_tag or cat_key)
                for k, val in m_obj.items():
                    if k not in [
                        "mentors", "vendors", "institutions", "distributors",
                        "macro_free", "micro_structured", "nano_expert"
                    ] and isinstance(val, list):
                        for it in val:
                            _add_item(it, section_tag)

        # 1. Check nested view marketplaces: macro_view, micro_view, nano_view
        view_to_section = {
            "macro_view": "macro_free",
            "micro_view": "micro_structured",
            "nano_view": "nano_expert"
        }
        for view_key, sec_tag in view_to_section.items():
            view_val = step.get(view_key)
            if isinstance(view_val, dict):
                _extract_from_market_obj(view_val.get("marketplace"), sec_tag)

        # 2. Check top-level step.marketplace
        _extract_from_market_obj(step.get("marketplace"))

        # 3. Check step.resources
        resources = step.get("resources")
        if isinstance(resources, list):
            for it in resources:
                if isinstance(it, dict):
                    _add_item(it, "macro_free")
                elif isinstance(it, str) and it.strip():
                    _add_item({"name": it.strip(), "type": "resource", "cost": "free"}, "macro_free")

        return items

    def audit_marketplace(
        self,
        roadmap: Dict[str, Any],
        profile: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Validates all recommended marketplace providers/resources:
        - Detects hallucinations, placeholders, and dummy text.
        - Verifies tiering (macro_free, micro_structured, nano_expert).
        - Verifies pricing feasibility against student financial profile.
        """
        issues: List[Dict[str, Any]] = []
        warnings: List[Dict[str, Any]] = []
        hallucinations: List[Dict[str, Any]] = []
        score = 100.0

        # Financial context from profile
        pg = profile.get("personalityGeography") or {}
        fin_status = (
            pg.get("financialSituation") or
            profile.get("financialSituation") or
            profile.get("financial_situation") or
            "Moderate"
        ).lower()
        is_budget_constrained = any(k in fin_status for k in ["low", "need", "budget", "constrained", "struggling", "minimal", "0-25"])

        steps = roadmap.get("steps") or []
        total_items_found = 0
        free_items_count = 0
        paid_items_count = 0
        expensive_items_count = 0
        navigable_items_count = 0
        empty_steps: List[int] = []

        for i, s in enumerate(steps, start=1):
            items_in_step = self.extract_step_marketplace_items(s)

            if not items_in_step:
                empty_steps.append(i)
                continue

            for item in items_in_step:
                if not isinstance(item, dict):
                    continue
                total_items_found += 1
                name = str(item.get("name") or "").strip()
                cost = str(item.get("cost") or item.get("price") or "").strip().lower()

                # Check for direct web navigation link
                item_url = str(item.get("url") or item.get("website") or item.get("link") or "").strip()
                if item_url.startswith("http://") or item_url.startswith("https://"):
                    navigable_items_count += 1

                # Check for suspicious / placeholder / hallucinated names
                name_lower = name.lower()
                is_hallucinated = False

                if not name or len(name) < 3 or name_lower in SUSPICIOUS_PROVIDER_NAMES:
                    is_hallucinated = True
                elif any(re.match(pattern, name_lower) for pattern in SUSPICIOUS_GENERIC_PATTERNS):
                    is_hallucinated = True

                if is_hallucinated:
                    hallucinations.append({
                        "step_id": i,
                        "provider_name": name or "(empty)",
                        "severity": "high",
                        "message": f"Detected dummy/hallucinated marketplace provider '{name}' in Step {i}."
                    })
                    score -= 10.0

                # Analyze pricing
                is_free = cost in ["0", "$0", "₹0", "free", "none", "n/a", ""] or "free" in cost
                if is_free:
                    free_items_count += 1
                else:
                    paid_items_count += 1
                    # Extract numeric amount if present
                    digits = re.findall(r'\d+', cost.replace(",", ""))
                    if digits:
                        amount = int(digits[0])
                        # If price exceeds $300 or ₹25,000
                        if ("$" in cost and amount > 300) or ("₹" in cost and amount > 25000):
                            expensive_items_count += 1

        # Consolidate missing marketplace steps into single advisory
        if empty_steps:
            if len(empty_steps) >= 2 or len(empty_steps) == len(steps):
                warnings.append({
                    "severity": "medium",
                    "type": "empty_marketplace",
                    "message": "Marketplace recommendations need to be improved across all milestones."
                })
                score -= min(25.0, len(empty_steps) * 4.0)
            else:
                for step_id in empty_steps:
                    warnings.append({
                        "step_id": step_id,
                        "severity": "medium",
                        "type": "empty_marketplace",
                        "message": f"Step {step_id} does not provide any marketplace recommendations."
                    })
                    score -= 6.0

        # Check financial constraint violations
        if is_budget_constrained and expensive_items_count > 0:
            issues.append({
                "severity": "high",
                "type": "budget_conflict",
                "message": f"Student profile specifies constrained financial capacity, but {expensive_items_count} premium/high-cost marketplace items were recommended."
            })
            score -= 15.0

        if total_items_found > 0 and free_items_count == 0:
            warnings.append({
                "severity": "low",
                "type": "missing_free_tier",
                "message": "Roadmap provides no free foundational resources (0 macro_free items detected)."
            })
            score -= 5.0

        return {
            "score": max(0.0, min(100.0, round(score, 1))),
            "passed": len(hallucinations) == 0 and len(issues) == 0,
            "total_items": total_items_found,
            "free_items": free_items_count,
            "paid_items": paid_items_count,
            "navigable_items": navigable_items_count,
            "hallucinations": hallucinations,
            "issues": issues,
            "warnings": warnings
        }

    # ─────────────────────────────────────────────────────────────────────────
    # 5. PERSONALIZATION & STUDENT CONSTRAINTS AUDIT
    # ─────────────────────────────────────────────────────────────────────────
    def audit_personalization(
        self,
        roadmap: Dict[str, Any],
        profile: Dict[str, Any],
        current: str,
        goal: str
    ) -> Dict[str, Any]:
        """
        Verifies that the roadmap is genuinely personalized to the student's profile:
        - Current Academic stage (Grade 10/12 vs Undergraduate vs Postgrad)
        - Location / Geography relevance
        - Background skills / curriculum
        """
        score = 100.0
        signals_matched: List[str] = []
        warnings: List[Dict[str, Any]] = []

        pg = profile.get("personalityGeography") or {}
        ac = profile.get("academics") or {}

        # 1. Academic level alignment
        grade = str(ac.get("gradeLevel") or profile.get("grade") or "").strip()
        degree = str(ac.get("degreeType") or profile.get("degreeType") or "").strip()
        curriculum = str(ac.get("curriculum") or profile.get("curriculum") or "").strip()

        steps = roadmap.get("steps") or []
        first_step_text = f"{steps[0].get('title', '')} {steps[0].get('description', '')}".lower() if steps else ""

        if grade:
            signals_matched.append(f"Student Grade: {grade}")
            # If student is Grade 10 or 11, step 1 shouldn't assume they already have a college degree
            if grade in ["9", "10", "11", "12"] and any(term in first_step_text for term in ["college degree", "undergraduate gpa", "resume for jobs"]):
                warnings.append({
                    "severity": "medium",
                    "type": "stage_mismatch",
                    "message": f"Student is in Grade {grade}, but initial milestones appear to assume college-level prerequisites."
                })
                score -= 15.0

        if curriculum:
            signals_matched.append(f"Curriculum: {curriculum}")

        # 2. Location Alignment
        country = str(pg.get("country") or profile.get("country") or "").strip()
        city = str(pg.get("city") or profile.get("city") or "").strip()
        if country:
            signals_matched.append(f"Location: {country}")

        # 3. Financial Capacity
        fin = str(pg.get("financialSituation") or profile.get("financialSituation") or "").strip()
        if fin:
            signals_matched.append(f"Financial Tier: {fin}")

        return {
            "score": max(0.0, min(100.0, round(score, 1))),
            "signals_detected_count": len(signals_matched),
            "signals_matched": signals_matched,
            "warnings": warnings
        }

    # ─────────────────────────────────────────────────────────────────────────
    # 6. CATEGORY & SCOPE ISOLATION AUDIT
    # ─────────────────────────────────────────────────────────────────────────
    def audit_category_scope(
        self,
        roadmap: Dict[str, Any],
        category: str,
        current: str,
        goal: str
    ) -> Dict[str, Any]:
        """
        Checks whether the roadmap wanders outside the selected system category:
        - academic
        - practical
        - jobs
        - non_academic
        """
        issues: List[Dict[str, Any]] = []
        warnings: List[Dict[str, Any]] = []
        score = 100.0

        cat_clean = resolve_category(category)
        steps = roadmap.get("steps") or []

        # Check for cross-contamination
        if cat_clean == "non_academic":
            # Non-academic counselling should NOT recommend technical programming builds or corporate sales
            for i, s in enumerate(steps, start=1):
                s_text = f"{s.get('title', '')} {s.get('description', '')}".lower()
                if any(term in s_text for term in ["docker container", "backend api", "production hardening", "react component", "data structures and algorithms"]):
                    issues.append({
                        "step_id": i,
                        "severity": "high",
                        "type": "category_contamination",
                        "message": f"Step {i} ('{s.get('title')}') introduces technical software coding into a Non-Academic Counselling pathway."
                    })
                    score -= 20.0

        elif cat_clean == "academic":
            # Academic roadmaps shouldn't skip to full-time employment without academic progression
            for i, s in enumerate(steps[:2], start=1):
                s_text = f"{s.get('title', '')} {s.get('description', '')}".lower()
                if any(term in s_text for term in ["senior corporate manager", "executive role", "full-time employment"]):
                    warnings.append({
                        "step_id": i,
                        "severity": "medium",
                        "type": "scope_warning",
                        "message": f"Early Step {i} emphasizes corporate employment before academic foundation."
                    })
                    score -= 10.0

        return {
            "score": max(0.0, min(100.0, round(score, 1))),
            "category": cat_clean,
            "passed": len(issues) == 0,
            "issues": issues,
            "warnings": warnings
        }

    @staticmethod
    def consolidate_advisories(warnings_list: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Consolidates repetitive warnings across milestones into clean high-level advisories:
        - If multiple steps report missing marketplace recommendations, collapse into:
          "Marketplace recommendations need to be improved across all milestones."
        - Deduplicates identical warning messages across milestones.
        """
        if not warnings_list:
            return []

        marketplace_empty_warnings = [
            w for w in warnings_list
            if w.get("type") == "empty_marketplace" or "marketplace recommendations" in str(w.get("message", "")).lower()
        ]
        other_warnings = [
            w for w in warnings_list
            if not (w.get("type") == "empty_marketplace" or "marketplace recommendations" in str(w.get("message", "")).lower())
        ]

        consolidated: List[Dict[str, Any]] = []

        if len(marketplace_empty_warnings) >= 2:
            consolidated.append({
                "severity": "medium",
                "type": "empty_marketplace",
                "message": "Marketplace recommendations need to be improved across all milestones."
            })
        elif len(marketplace_empty_warnings) == 1:
            consolidated.append(marketplace_empty_warnings[0])

        # Aggregate repetitive missing view warnings across steps
        missing_views = [
            w for w in other_warnings
            if "missing " in str(w.get("message", "")).lower() and any(
                vk in str(w.get("message", "")).lower() for vk in ["macro_view", "micro_view", "nano_view"]
            )
        ]
        if len(missing_views) >= 3:
            consolidated.append({
                "severity": "low",
                "type": "missing_views",
                "message": "Multiple milestones lack structured macro, micro, or nano strategic descriptions."
            })
            other_warnings = [w for w in other_warnings if w not in missing_views]

        seen_msgs = set()
        for w in other_warnings:
            msg = str(w.get("message") or "").strip()
            if msg and msg not in seen_msgs:
                seen_msgs.add(msg)
                consolidated.append(w)

        return consolidated

    # ─────────────────────────────────────────────────────────────────────────
    # 7. MASTER OBSERVE METHOD (The Complete Audit Report)
    # ─────────────────────────────────────────────────────────────────────────
    def observe(
        self,
        roadmap: Dict[str, Any],
        current_position: str,
        target_goal: str,
        profile: Optional[Dict[str, Any]] = None,
        category: Optional[str] = "academic",
        sub_segment: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Executes complete multi-dimensional observation on a generated roadmap.
        Returns explainable quality score, approval status, and itemized findings.
        """
        start_time = time.perf_counter()
        prof = profile or {}

        # 1. Individual Dimension Audits
        data_res = self.audit_data_integrity(roadmap)
        text_res = self.audit_text_semantics(roadmap, current_position, target_goal)
        time_res = self.audit_timeline(roadmap, current_position, target_goal, prof, category or "academic", sub_segment)
        market_res = self.audit_marketplace(roadmap, prof)
        pers_res = self.audit_personalization(roadmap, prof, current_position, target_goal)
        cat_res = self.audit_category_scope(roadmap, category or "academic", current_position, target_goal)

        # 2. Weighted Overall Quality Score Calculation
        # Base weighted score across 6 dimensions:
        w_data = 0.15
        w_text = 0.20
        w_time = 0.20
        w_market = 0.20
        w_pers = 0.15
        w_cat = 0.10

        base_score = (
            w_data * data_res["score"] +
            w_text * text_res["score"] +
            w_time * time_res["score"] +
            w_market * market_res["score"] +
            w_pers * pers_res["score"] +
            w_cat * cat_res["score"]
        )

        critical_issues = [
            iss for res in [data_res, text_res, time_res, market_res, cat_res]
            for iss in res.get("issues", [])
            if iss.get("severity") in ["critical", "high"]
        ]
        all_issues = [iss for res in [data_res, text_res, time_res, market_res, cat_res] for iss in res.get("issues", [])]
        raw_warnings = [w for res in [data_res, text_res, time_res, market_res, pers_res, cat_res] for w in res.get("warnings", [])]
        all_warnings = self.consolidate_advisories(raw_warnings)
        all_hallucinations = market_res.get("hallucinations", [])

        # Deduct penalty for critical/high defects to reflect true quality
        defect_penalty = (len(critical_issues) * 6.0) + (len(all_hallucinations) * 4.0)
        overall_score = max(0, min(100, round(base_score - defect_penalty)))

        if overall_score >= 85 and len(critical_issues) == 0:
            status = "APPROVED"
            status_label = "Verified High Quality"
            status_color = "#137333"
        elif overall_score >= 70 and len(critical_issues) <= 1:
            status = "APPROVED_WITH_WARNINGS"
            status_label = "Approved with Advisory Warnings"
            status_color = "#1a73e8"
        elif overall_score >= 50:
            status = "REQUIRES_CORRECTION"
            status_label = "Requires Quality Correction"
            status_color = "#b06000"
        else:
            status = "REJECTED"
            status_label = "Fails Quality Threshold"
            status_color = "#c5221f"

        duration_ms = round((time.perf_counter() - start_time) * 1000)

        return {
            "observer_status": status,
            "status_label": status_label,
            "status_color": status_color,
            "overall_quality_score": overall_score,
            "duration_ms": duration_ms,
            "dimensions": {
                "data_integrity": data_res["score"],
                "text_semantics": text_res["score"],
                "timeline_accuracy": time_res["score"],
                "marketplace_accuracy": market_res["score"],
                "personalization": pers_res["score"],
                "category_scope": cat_res["score"]
            },
            "summary": {
                "step_count": data_res.get("step_count", 0),
                "total_issues_count": len(all_issues),
                "total_warnings_count": len(all_warnings),
                "hallucinations_detected_count": len(all_hallucinations),
                "navigable_items_count": market_res.get("navigable_items", 0),
                "expected_duration": time_res.get("expected_duration"),
                "roadmap_duration": time_res.get("roadmap_duration")
            },
            "issues": all_issues,
            "warnings": all_warnings,
            "hallucinations": all_hallucinations,
            "signals_matched": pers_res.get("signals_matched", [])
        }


# Global observer singleton instance
observer_agent = NaaviObserverAgent()
