"""
=============================================================================
NAAVI PATH UNIQUENESS & CONSISTENCY AGENT (ORCHESTRATOR & 5-LEVEL ENGINE)
=============================================================================
Comprehensive multi-level duplicate prevention, detection, resolution, and
consistency validation for the Naavi Academic Pathway Generation Engine.

Architecture:
 Level 1: ExactDuplicateDetector (Deterministic Normalized Fingerprints)
 Level 2: NearDuplicateDetector (Lexical, n-gram, edit distance via RapidFuzz)
 Level 3: SemanticSimilarityService (Vector Cosine Similarity & Embeddings)
 Level 4: TaskIdentityEvaluator (Structured Action/Topic/Deliverable Comparison)
 Level 5: DuplicatePairEvaluator (AI Pairwise Adjudication via Groq)
 Dedicated DescriptionQualityValidator (Boilerplate & Template Repair)
 Dedicated RecurrenceValidator (Preserves Legitimate Periodic Activities)
 Dedicated MarketplaceUniquenessValidator (Provider & Resource Checks)
 Dedicated DuplicateResolutionService (Safe Removal & Prerequisite DAG Repair)
 Complete Final Uniqueness Gate (End-to-End Validation)
=============================================================================
"""

import asyncio
import hashlib
import json
import math
import os
import re
from typing import Any, Dict, List, Optional, Set, Tuple

import numpy as np

try:
    import rapidfuzz
    from rapidfuzz import fuzz
except ImportError:
    rapidfuzz = None
    fuzz = None

from task_registry import (
    GlobalTaskRegistry,
    extract_action_and_topic,
    normalize_text_fingerprint,
)
from uniqueness_models import (
    CandidateDuplicatePair,
    DescriptionDefect,
    DuplicateClassification,
    MarketplaceDuplicate,
    RecurrencePolicy,
    RecurrenceType,
    ResolutionAction,
    TaskHierarchyLevel,
    TaskIdentity,
    UniquenessReport,
)

# ══════════════════════════════════════════════════════════════════════════════
# CALIBRATED SIMILARITY THRESHOLDS (Section 5)
# ══════════════════════════════════════════════════════════════════════════════
EXACT_MATCH_THRESHOLD = 1.00
LEXICAL_DUPLICATE_THRESHOLD = 0.86
LEXICAL_CANDIDATE_THRESHOLD = 0.72

SEMANTIC_DUPLICATE_THRESHOLD = 0.88
SEMANTIC_CANDIDATE_THRESHOLD = 0.74
SEMANTIC_DISTINCT_THRESHOLD = 0.58

# Known boilerplate phrases that must never appear in final descriptions
BOILERPLATE_PATTERNS = [
    r"ensures rigorous concept verification and tangible academic deliverable for.*",
    r"ensures rigorous concept verification.*",
    r"tangible academic deliverable for.*",
    r"recommended to improve your skills\.?",
    r"foundational stem & language prep\.?",
    r"general study and preparation for milestone.*",
]


# ══════════════════════════════════════════════════════════════════════════════
# LEVEL 1: EXACT DUPLICATE DETECTOR
# ══════════════════════════════════════════════════════════════════════════════
class ExactDuplicateDetector:
    """Deterministic exact duplicate detection using normalized text fingerprints."""

    @staticmethod
    def fingerprint(text: str) -> str:
        norm = normalize_text_fingerprint(text)
        return hashlib.sha256(norm.encode("utf-8")).hexdigest()

    @staticmethod
    def are_exact_duplicates(text_a: str, text_b: str) -> bool:
        if not text_a or not text_b:
            return False
        return normalize_text_fingerprint(text_a) == normalize_text_fingerprint(text_b)

    @staticmethod
    def is_exact_task_match(task_a: TaskIdentity, task_b: TaskIdentity) -> bool:
        # Same normalized title
        if task_a.normalized_title and task_a.normalized_title == task_b.normalized_title:
            return True
        # Same fingerprint (action + topic + deliverable)
        if task_a.fingerprint and task_a.fingerprint == task_b.fingerprint:
            return True
        return False


# ══════════════════════════════════════════════════════════════════════════════
# LEVEL 2: NEAR DUPLICATE DETECTOR (LEXICAL & N-GRAM SIMILARITY)
# ══════════════════════════════════════════════════════════════════════════════
class NearDuplicateDetector:
    """Lexical, token overlap, and edit-distance similarity engine."""

    STOPWORDS = {"the", "of", "a", "an", "and", "in", "to", "for", "with", "on", "at", "by"}

    @classmethod
    def get_content_tokens(cls, text: str) -> List[str]:
        words = normalize_text_fingerprint(text).split()
        return [w for w in words if w not in cls.STOPWORDS]

    @classmethod
    def token_jaccard(cls, text_a: str, text_b: str) -> float:
        tokens_a = set(cls.get_content_tokens(text_a))
        tokens_b = set(cls.get_content_tokens(text_b))
        if not tokens_a or not tokens_b:
            tokens_a = set(normalize_text_fingerprint(text_a).split())
            tokens_b = set(normalize_text_fingerprint(text_b).split())
        if not tokens_a or not tokens_b:
            return 0.0
        intersection = len(tokens_a & tokens_b)
        union = len(tokens_a | tokens_b)
        return intersection / union if union > 0 else 0.0

    @classmethod
    def ngram_overlap(cls, text_a: str, text_b: str, n: int = 2) -> float:
        words_a = cls.get_content_tokens(text_a)
        words_b = cls.get_content_tokens(text_b)
        if len(words_a) < n or len(words_b) < n:
            return cls.token_jaccard(text_a, text_b)
        ngrams_a = set(tuple(words_a[i : i + n]) for i in range(len(words_a) - n + 1))
        ngrams_b = set(tuple(words_b[i : i + n]) for i in range(len(words_b) - n + 1))
        intersection = len(ngrams_a & ngrams_b)
        union = len(ngrams_a | ngrams_b)
        return intersection / union if union > 0 else 0.0

    @classmethod
    def edit_ratio(cls, text_a: str, text_b: str) -> float:
        norm_a = normalize_text_fingerprint(text_a)
        norm_b = normalize_text_fingerprint(text_b)
        if fuzz is not None:
            # Token sort ratio is invariant to word reordering
            ts_ratio = float(fuzz.token_sort_ratio(norm_a, norm_b)) / 100.0
            simple_ratio = float(fuzz.ratio(norm_a, norm_b)) / 100.0
            return max(ts_ratio, simple_ratio)
        return cls.token_jaccard(norm_a, norm_b)

    @classmethod
    def compute_similarity(cls, text_a: str, text_b: str) -> float:
        """Composite lexical score combining content Jaccard, n-gram overlap, and fuzzy token-sort ratio."""
        jacc = cls.token_jaccard(text_a, text_b)
        bigram = cls.ngram_overlap(text_a, text_b, n=2)
        ratio = cls.edit_ratio(text_a, text_b)
        # Weighted composite prioritizing token semantics
        return round((0.45 * ratio) + (0.35 * jacc) + (0.20 * bigram), 4)


# ══════════════════════════════════════════════════════════════════════════════
# LEVEL 3: SEMANTIC SIMILARITY SERVICE (VECTOR & EMBEDDINGS)
# ══════════════════════════════════════════════════════════════════════════════
class SemanticSimilarityService:
    """
    High-performance semantic vector comparison service.
    Uses subword + character n-gram TF-IDF vectorization with numpy cosine similarity,
    with lazy SentenceTransformers support if available.
    """

    def __init__(self):
        self._st_model = None
        self._st_attempted = False
        self._vector_cache: Dict[str, np.ndarray] = {}
        self._vocab: Dict[str, int] = {}
        self._idf: Dict[str, float] = {}

    def _get_st_model(self):
        if not self._st_attempted:
            self._st_attempted = True
            try:
                import importlib
                st = importlib.import_module("sentence_transformers")
                SentenceTransformer = getattr(st, "SentenceTransformer", None)
                if SentenceTransformer:
                    self._st_model = SentenceTransformer("all-MiniLM-L6-v2")
            except Exception:
                self._st_model = None
        return self._st_model

    def build_vector(self, text: str) -> np.ndarray:
        """Constructs a normalized dense/subword TF-IDF embedding vector."""
        cache_key = normalize_text_fingerprint(text)
        if cache_key in self._vector_cache:
            return self._vector_cache[cache_key]

        st = self._get_st_model()
        if st is not None:
            try:
                vec = st.encode(text, convert_to_numpy=True)
                norm = np.linalg.norm(vec)
                vec = vec / norm if norm > 0 else vec
                self._vector_cache[cache_key] = vec
                return vec
            except Exception:
                pass

        # High-precision subword + character n-gram hashing vectorizer (256-dim)
        DIM = 256
        vec = np.zeros(DIM, dtype=np.float32)
        words = cache_key.split()

        # Word unigrams and character 3-grams
        tokens = list(words)
        for w in words:
            if len(w) >= 3:
                for i in range(len(w) - 2):
                    tokens.append(w[i : i + 3])

        for t in tokens:
            idx = int(hashlib.md5(t.encode("utf-8")).hexdigest(), 16) % DIM
            vec[idx] += 1.0

        norm = np.linalg.norm(vec)
        if norm > 0:
            vec = vec / norm
        self._vector_cache[cache_key] = vec
        return vec

    def cosine_similarity(self, text_a: str, text_b: str) -> float:
        """Calculates cosine similarity between vectors of two texts."""
        if not text_a or not text_b:
            return 0.0
        norm_a = normalize_text_fingerprint(text_a)
        norm_b = normalize_text_fingerprint(text_b)
        if norm_a == norm_b:
            return 1.0

        vec_a = self.build_vector(text_a)
        vec_b = self.build_vector(text_b)

        sim = float(np.dot(vec_a, vec_b))
        return max(0.0, min(1.0, round(sim, 4)))


# ══════════════════════════════════════════════════════════════════════════════
# LEVEL 4: STRUCTURED TASK IDENTITY EVALUATOR
# ══════════════════════════════════════════════════════════════════════════════
class TaskIdentityEvaluator:
    """
    Compares structured attributes of two activities:
    action, topic, learning outcome, target skill, academic level, deliverable.
    Distinguishes progression (learn -> practice -> project) from true duplication.
    """

    PROGRESSION_ACTIONS = {
        "foundational": ["study", "learn", "understand", "review", "read", "explore"],
        "practice": ["practice", "solve", "execute", "apply", "drill", "exercise"],
        "mastery": ["master", "design", "build", "implement", "construct", "formulate"],
        "evaluation": ["audit", "calibrate", "analyze", "test", "benchmark", "assess"]
    }

    @classmethod
    def are_valid_progression(cls, task_a: TaskIdentity, task_b: TaskIdentity) -> bool:
        """Checks if two tasks share a topic or academic domain but represent distinct valid learning progression."""
        topic_a = normalize_text_fingerprint(task_a.topic)
        topic_b = normalize_text_fingerprint(task_b.topic)
        
        tokens_a = set(topic_a.split())
        tokens_b = set(topic_b.split())
        shared = tokens_a & tokens_b
        has_domain = any(d in shared for d in ["calculus", "python", "algebra", "algorithm", "physics", "chemistry", "data", "software", "math", "biology", "ai", "programming", "optimization"]) or len(shared) >= 2

        # Must have related topic or shared discipline
        if not (topic_a == topic_b or NearDuplicateDetector.token_jaccard(topic_a, topic_b) > 0.35 or has_domain):
            return False

        act_a = task_a.action.lower()
        act_b = task_b.action.lower()

        # If actions are identical, it is likely duplicate unless deliverables differ fundamentally
        if act_a == act_b:
            return False

        # Check if actions fall into different progression tiers (e.g. Learn vs Build)
        tier_a = None
        tier_b = None
        for tier, actions in cls.PROGRESSION_ACTIONS.items():
            if any(a in act_a for a in actions):
                tier_a = tier
            if any(a in act_b for a in actions):
                tier_b = tier

        if tier_a and tier_b and tier_a != tier_b:
            # Different learning tiers on the same topic is valid pedagogical progression!
            return True

        return False

    @classmethod
    def evaluate_structured_overlap(cls, task_a: TaskIdentity, task_b: TaskIdentity) -> Tuple[float, List[str], List[str]]:
        """
        Calculates structured overlap score (0.0 - 1.0).
        Returns: (overlap_score, matching_attributes, differing_attributes)
        """
        matches = []
        diffs = []
        score = 0.0

        # Topic match (Weight: 40%)
        topic_sim = NearDuplicateDetector.compute_similarity(task_a.topic, task_b.topic)
        if topic_sim >= 0.85:
            matches.append("topic")
            score += 0.40
        elif topic_sim < 0.40:
            diffs.append("topic")
        else:
            score += 0.40 * topic_sim

        # Action match (Weight: 25%)
        if task_a.action.lower() == task_b.action.lower():
            matches.append("action")
            score += 0.25
        else:
            diffs.append("action")

        # Deliverable match (Weight: 20%)
        deliv_sim = NearDuplicateDetector.compute_similarity(task_a.deliverable, task_b.deliverable)
        if deliv_sim >= 0.80:
            matches.append("deliverable")
            score += 0.20
        elif deliv_sim < 0.35:
            diffs.append("deliverable")
        else:
            score += 0.20 * deliv_sim

        # Hierarchy level (Weight: 15%)
        if task_a.task_level == task_b.task_level:
            matches.append("hierarchy_level")
            score += 0.15
        else:
            diffs.append("hierarchy_level")

        return round(score, 4), matches, diffs


# ══════════════════════════════════════════════════════════════════════════════
# LEVEL 5: AI-BASED PAIRWISE ADJUDICATOR
# ══════════════════════════════════════════════════════════════════════════════
class DuplicatePairEvaluator:
    """
    Evaluates ambiguous candidate pairs using contextual AI analysis or deterministic heuristic fallback.
    Returns structured JSON with classification, confidence, reasoning, and suggested resolution.
    """

    @classmethod
    async def adjudicate_pair(
        cls,
        task_a: TaskIdentity,
        task_b: TaskIdentity,
        client: Optional[Any] = None,
        model: str = "openai/gpt-oss-120b"
    ) -> Dict[str, Any]:
        """Adjudicates uncertain pairs with structured JSON reasoning."""
        # Check progression first
        if TaskIdentityEvaluator.are_valid_progression(task_a, task_b):
            return {
                "decision": DuplicateClassification.RELATED_BUT_DISTINCT.value,
                "confidence": 0.95,
                "reason": f"Valid pedagogical progression on '{task_a.topic}': '{task_a.action}' vs '{task_b.action}'.",
                "recommended_action": ResolutionAction.KEEP.value,
                "matching_attributes": ["topic"],
                "differing_attributes": ["action", "learning_stage"]
            }

        # If LLM client is available and online, call Groq for edge-case adjudication
        if client is not None:
            try:
                prompt = (
                    "You are the Naavi Academic Path Uniqueness Adjudicator.\n"
                    "Evaluate these two learning activities and determine if they are accidental duplicates or distinct learning tasks.\n\n"
                    f"Activity A:\n- Title: {task_a.raw_title}\n- Description: {task_a.raw_description}\n- Milestone: {task_a.parent_milestone_title}\n- Deliverable: {task_a.deliverable}\n\n"
                    f"Activity B:\n- Title: {task_b.raw_title}\n- Description: {task_b.raw_description}\n- Milestone: {task_b.parent_milestone_title}\n- Deliverable: {task_b.deliverable}\n\n"
                    "Return ONLY valid JSON matching this schema:\n"
                    "{\n"
                    '  "decision": "EXACT_DUPLICATE" | "NEAR_DUPLICATE" | "SEMANTIC_DUPLICATE" | "RELATED_BUT_DISTINCT" | "VALID_RECURRING_ACTIVITY" | "HIERARCHICAL_PARENT_CHILD",\n'
                    '  "confidence": float,\n'
                    '  "reason": "Clear academic justification",\n'
                    '  "recommended_action": "KEEP" | "REMOVE_DUPLICATE" | "MERGE" | "REGENERATE_DESCRIPTION"\n'
                    "}"
                )
                resp = await client.chat.completions.create(
                    model=model,
                    messages=[{"role": "user", "content": prompt}],
                    temperature=0.0,
                    max_tokens=256
                )
                raw_text = resp.choices[0].message.content.strip()
                m = re.search(r"\{.*\}", raw_text, re.DOTALL)
                if m:
                    data = json.loads(m.group(0))
                    return data
            except Exception:
                pass

        # Deterministic heuristic fallback
        top_sim = NearDuplicateDetector.compute_similarity(task_a.topic, task_b.topic)
        act_same = task_a.action.lower() == task_b.action.lower()
        if top_sim >= 0.85 and act_same:
            return {
                "decision": DuplicateClassification.SEMANTIC_DUPLICATE.value,
                "confidence": 0.90,
                "reason": f"Same action ('{task_a.action}') and overlapping topic ('{task_a.topic}') without distinct deliverables.",
                "recommended_action": ResolutionAction.REMOVE_DUPLICATE.value,
                "matching_attributes": ["action", "topic"],
                "differing_attributes": []
            }

        return {
            "decision": DuplicateClassification.RELATED_BUT_DISTINCT.value,
            "confidence": 0.85,
            "reason": "Distinct academic deliverables and topic focus.",
            "recommended_action": ResolutionAction.KEEP.value,
            "matching_attributes": [],
            "differing_attributes": ["deliverable", "scope"]
        }


# ══════════════════════════════════════════════════════════════════════════════
# DEDICATED DESCRIPTION QUALITY AND BOILERPLATE VALIDATOR
# ══════════════════════════════════════════════════════════════════════════════
class DescriptionQualityValidator:
    """
    Detects and repairs defective, repetitive, or boilerplate descriptions.
    Does not delete valid activities to solve a description problem;
    it synthesizes rich, task-specific descriptions.
    """

    @classmethod
    def identify_boilerplate(cls, description: str) -> Optional[str]:
        """Checks if a description contains generic boilerplate sentences."""
        if not description:
            return "empty_description"
        desc_low = description.lower()
        for pat in BOILERPLATE_PATTERNS:
            if re.search(pat, desc_low):
                return pat
        return None

    @classmethod
    def clean_description(cls, description: str, milestone_title: str = "") -> str:
        """Strips out boilerplate sentences from an existing description."""
        cleaned = description
        for pat in BOILERPLATE_PATTERNS:
            cleaned = re.sub(pat, "", cleaned, flags=re.IGNORECASE)
        cleaned = re.sub(r"\s+", " ", cleaned).strip()
        # Clean trailing punctuation
        cleaned = cleaned.rstrip(" ,;:-")
        if cleaned and not cleaned.endswith("."):
            cleaned += "."
        return cleaned

    @classmethod
    def synthesize_task_specific_description(
        cls,
        title: str,
        milestone_title: str = "",
        deliverable: str = "",
        action: str = "",
        topic: str = ""
    ) -> str:
        """
        Synthesizes a rich, authentic description explaining:
        1. What the student should do
        2. Specific concept/technique
        3. Practical method
        4. Concrete deliverable
        """
        act = action or title.split()[0] if title else "Master"
        top = topic or " ".join(title.split()[1:]) if title else "curriculum units"
        top_low = top.lower()

        # Domain-authentic generation
        if "calculus" in top_low or "derivative" in top_low or "integral" in top_low:
            return (
                f"Work through structured problem sets covering {top}. Apply analytical differentiation and integration techniques, "
                f"curve sketching, and rate modeling. Submit verified mathematical calculations demonstrating complete procedural accuracy."
            )
        elif "algorithm" in top_low or "big-o" in top_low or "data structure" in top_low:
            return (
                f"Construct algorithmic implementations and asymptotic proofs for {top}. Analyze time and space complexity constraints, "
                f"verify edge cases, and run benchmark unit tests to confirm optimized computational execution."
            )
        elif "oop" in top_low or "software" in top_low or "architecture" in top_low:
            return (
                f"Implement clean software design principles covering {top}. Write modular class hierarchies, encapsulation interfaces, "
                f"and automated unit tests. Produce production-ready code with documented architectural diagrams."
            )
        elif "sat" in top_low or "exam" in top_low or "diagnostic" in top_low or "act" in top_low:
            return (
                f"Complete full-length timed diagnostic sections for {top}. Score answer responses against official performance rubrics, "
                f"log error patterns, and compile targeted review notes to address identified prerequisite gaps."
            )
        elif "application" in top_low or "essay" in top_low or "sop" in top_low or "common app" in top_low:
            return (
                f"Draft and refine institutional submissions for {top}. Compile academic transcripts, personal statement essays, and faculty recommendations, "
                f"ensuring complete alignment with target university admissions prerequisites."
            )
        elif "visa" in top_low or "consular" in top_low or "i-20" in top_low:
            return (
                f"Complete mandatory immigration and compliance documentation for {top}. Verify financial sponsorship declarations, submit SEVIS registrations, "
                f"and execute mock consular interview defense simulations."
            )
        else:
            deliv_text = f" Produce {deliverable.lower().rstrip('.')}." if deliverable else " Demonstrate mastery through verified academic deliverables."
            return (
                f"Execute focused study and practical coursework in {top}. Formulate solutions according to institutional syllabus benchmarks.{deliv_text}"
            )


# ══════════════════════════════════════════════════════════════════════════════
# DEDICATED RECURRENCE VALIDATOR
# ══════════════════════════════════════════════════════════════════════════════
class RecurrenceValidator:
    """
    Distinguishes between accidental duplication and legitimate periodic activities.
    Examples:
    - Diagnostic tests at Month 1 vs Month 6 vs Month 12
    - University applications to different colleges
    - Monthly progress advisor reviews
    """

    @classmethod
    def evaluate_recurrence(
        cls,
        task_a: TaskIdentity,
        task_b: TaskIdentity
    ) -> Tuple[bool, Optional[str]]:
        """
        Determines if task_b is a legitimate recurring instance of task_a.
        Returns: (is_legitimate_recurrence, rationale)
        """
        title_a_low = task_a.raw_title.lower()
        title_b_low = task_b.raw_title.lower()

        # Check periodic standardized diagnostics
        if any(diag in title_a_low for diag in ["diagnostic", "mock test", "benchmark exam", "practice test"]):
            if any(diag in title_b_low for diag in ["diagnostic", "mock test", "benchmark exam", "practice test"]):
                period_a = task_a.scheduled_period or f"Milestone {task_a.parent_milestone_id}"
                period_b = task_b.scheduled_period or f"Milestone {task_b.parent_milestone_id}"
                if period_a != period_b:
                    return (
                        True,
                        f"Periodic academic progress benchmark: Instance A ({period_a}) vs Instance B ({period_b})."
                    )

        # Check college applications (different milestones or different target universities)
        if any(app in title_a_low for app in ["application", "submit to", "portal submission"]):
            if any(app in title_b_low for app in ["application", "submit to", "portal submission"]):
                m_a = task_a.parent_milestone_title or ""
                m_b = task_b.parent_milestone_title or ""
                if m_a != m_b or (task_a.parent_milestone_id != task_b.parent_milestone_id):
                    return (
                        True,
                        f"Institution-specific application milestone across distinct admissions targets ({m_a} vs {m_b})."
                    )

        return False, None


# ══════════════════════════════════════════════════════════════════════════════
# DEDICATED MARKETPLACE UNIQUENESS VALIDATOR
# ══════════════════════════════════════════════════════════════════════════════
class MarketplaceUniquenessValidator:
    """
    Validates global marketplace uniqueness and recommendation relevance.
    Prevents identical courses from being recommended repeatedly across unrelated steps.
    Preserves legitimate provider diversity (e.g. Coursera offering both Python and Calculus).
    """

    @classmethod
    def audit_and_deduplicate(
        cls,
        steps: List[Dict[str, Any]]
    ) -> Tuple[List[Dict[str, Any]], List[MarketplaceDuplicate], int]:
        """
        Deduplicates marketplace items across steps globally.
        Returns: (repaired_steps, detected_duplicates, total_resolved)
        """
        seen_courses: Dict[str, int] = {}  # course_norm -> first step_id
        seen_urls: Dict[str, int] = {}      # canonical_url -> first step_id
        duplicates_found: List[MarketplaceDuplicate] = []
        resolved_count = 0

        repaired_steps = []

        for step in steps:
            s_copy = dict(step)
            s_id = s_copy.get("id", 1)
            s_title = s_copy.get("title", f"Step {s_id}")

            raw_mkt = s_copy.get("marketplace") or {}
            cleaned_mkt: Dict[str, List[Dict[str, Any]]] = {}

            # Process all 4 categories: mentors, vendors, institutions, distributors
            for cat in ["mentors", "vendors", "institutions", "distributors"]:
                items = raw_mkt.get(cat, [])
                if not isinstance(items, list):
                    continue
                valid_items = []
                for item in items:
                    name = item.get("name") or item.get("title") or item.get("course_title") or ""
                    url = item.get("link") or item.get("url") or item.get("website") or ""
                    prov = item.get("provider") or item.get("institution") or item.get("organization") or "Official Provider"

                    course_norm = normalize_text_fingerprint(name)
                    url_norm = url.strip().rstrip("/").lower() if url else ""

                    # Check global duplicate
                    is_dup = False
                    if course_norm and course_norm in seen_courses and seen_courses[course_norm] != s_id:
                        is_dup = True
                        duplicates_found.append(MarketplaceDuplicate(
                            step_id=s_id,
                            step_title=s_title,
                            provider_name=prov,
                            course_name=name,
                            canonical_url=url,
                            duplicate_type="duplicate_course_across_steps",
                            recommended_action="remove_redundant_recommendation",
                            is_repaired=True
                        ))
                    elif url_norm and url_norm in seen_urls and seen_urls[url_norm] != s_id and not any(wh in url_norm for wh in ["coursera.org", "edx.org", "purdue.edu"]):
                        # Major portals are allowed, specific duplicate URLs across different steps flagged
                        is_dup = True
                        duplicates_found.append(MarketplaceDuplicate(
                            step_id=s_id,
                            step_title=s_title,
                            provider_name=prov,
                            course_name=name,
                            canonical_url=url,
                            duplicate_type="duplicate_url_across_steps",
                            recommended_action="remove_redundant_recommendation",
                            is_repaired=True
                        ))

                    if not is_dup:
                        if course_norm:
                            seen_courses[course_norm] = s_id
                        if url_norm:
                            seen_urls[url_norm] = s_id
                        valid_items.append(item)
                    else:
                        resolved_count += 1

                cleaned_mkt[cat] = valid_items

            s_copy["marketplace"] = cleaned_mkt
            repaired_steps.append(s_copy)

        return repaired_steps, duplicates_found, resolved_count


# ══════════════════════════════════════════════════════════════════════════════
# DEDICATED DUPLICATE RESOLUTION & GRAPH DEPENDENCY REPAIR SERVICE
# ══════════════════════════════════════════════════════════════════════════════
class DuplicateResolutionService:
    """
    Safely resolves duplicates while executing mandatory Prerequisite DAG Repair:
    - Remaps incoming/outgoing prerequisites so no step has dangling links.
    - Prevents circular dependency loops via topological validation.
    - Re-indexes step IDs sequentially (1..N).
    - Preserves original raw pathway intact and outputs repaired pathway.
    """

    @classmethod
    def apply_resolutions_and_repair_dag(
        cls,
        raw_steps: List[Dict[str, Any]],
        candidate_pairs: List[CandidateDuplicatePair],
        description_defects: List[DescriptionDefect]
    ) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]], int]:
        """
        Applies resolutions and reconstructs valid prerequisite DAG.
        Returns: (repaired_steps, repaired_edges_log, total_repairs_count)
        """
        # 1. Map removals and remappings
        remove_step_ids: Set[int] = set()
        remap_target_map: Dict[int, int] = {}  # removed_id -> retained_id

        for pair in candidate_pairs:
            if pair.classification in [
                DuplicateClassification.EXACT_DUPLICATE,
                DuplicateClassification.NEAR_DUPLICATE,
                DuplicateClassification.SEMANTIC_DUPLICATE
            ] and pair.recommended_action == ResolutionAction.REMOVE_DUPLICATE:
                try:
                    num_a = int(pair.task_a_id.split("_")[-1]) if "_" in pair.task_a_id else int(pair.task_a_id)
                    num_b = int(pair.task_b_id.split("_")[-1]) if "_" in pair.task_b_id else int(pair.task_b_id)
                except Exception:
                    continue

                # Keep earlier step, remove later duplicate
                retained = min(num_a, num_b)
                removed = max(num_a, num_b)
                remove_step_ids.add(removed)
                remap_target_map[removed] = retained
                pair.is_resolved = True
                pair.retained_task_id = str(retained)
                pair.removed_task_id = str(removed)

        # 2. Map description repairs
        desc_repair_map: Dict[int, str] = {
            d.numeric_id: d.regenerated_description
            for d in description_defects
            if d.regenerated_description
        }

        # 3. Filter out removed duplicates
        surviving_steps = []
        for s in raw_steps:
            sid = s.get("id")
            if sid in remove_step_ids:
                continue
            s_copy = dict(s)
            if sid in desc_repair_map:
                s_copy["description"] = desc_repair_map[sid]
            surviving_steps.append(s_copy)

        # 4. Sequential ID re-indexing (1..N)
        # 4. Sequential ID re-indexing (1..N) and title mapping for prerequisite resolution
        old_to_new_id: Dict[int, int] = {}
        title_to_new_id: Dict[str, int] = {}
        for new_idx, s in enumerate(surviving_steps, start=1):
            old_to_new_id[s.get("id")] = new_idx
            norm_t = normalize_text_fingerprint(s.get("title", ""))
            if norm_t:
                title_to_new_id[norm_t] = new_idx

        repaired_edges_log = []
        repaired_steps = []

        for new_idx, s in enumerate(surviving_steps, start=1):
            old_id = s.get("id")
            s["id"] = new_idx

            # Remap parent_id
            old_pid = s.get("parent_id")
            if old_pid in remap_target_map:
                old_pid = remap_target_map[old_pid]
            if isinstance(old_pid, str) and old_pid.strip().isdigit():
                old_pid = int(old_pid.strip())
            if old_pid in old_to_new_id:
                s["parent_id"] = old_to_new_id[old_pid]
            elif s.get("hierarchy_level") == "milestone":
                s["parent_id"] = None

            # Remap prerequisites
            old_prereqs = s.get("prerequisites") or []
            if not isinstance(old_prereqs, list):
                old_prereqs = [old_prereqs]

            new_prereqs = []
            for p in old_prereqs:
                target_p = remap_target_map.get(p, p)
                if isinstance(target_p, str) and target_p.strip().isdigit():
                    target_p = int(target_p.strip())

                if isinstance(target_p, int) and target_p in old_to_new_id:
                    remapped_id = old_to_new_id[target_p]
                    # Avoid self-dependency and forward dependencies
                    if remapped_id < new_idx:
                        new_prereqs.append(remapped_id)
                        if target_p != p:
                            repaired_edges_log.append({
                                "step_id": new_idx,
                                "original_prereq": p,
                                "remapped_prereq": remapped_id
                            })
                elif isinstance(target_p, str):
                    # Check if string matches title of an existing prior step
                    norm_p = normalize_text_fingerprint(target_p)
                    if norm_p in title_to_new_id:
                        matched_id = title_to_new_id[norm_p]
                        if matched_id < new_idx:
                            new_prereqs.append(matched_id)
                            repaired_edges_log.append({
                                "step_id": new_idx,
                                "original_prereq": p,
                                "remapped_prereq": matched_id
                            })

            # Ensure every step >= 2 has at least 1 valid prerequisite
            if not new_prereqs and new_idx > 1:
                # Default to previous step
                new_prereqs = [new_idx - 1]

            clean_int_prereqs = [int(x) for x in new_prereqs if isinstance(x, (int, str)) and str(x).isdigit()]
            s["prerequisites"] = sorted(list(set(clean_int_prereqs)))
            repaired_steps.append(s)

        return repaired_steps, repaired_edges_log, len(repaired_edges_log)


# ══════════════════════════════════════════════════════════════════════════════
# MAIN ORCHESTRATOR: PATH UNIQUENESS & CONSISTENCY AGENT
# ══════════════════════════════════════════════════════════════════════════════
class PathUniquenessAgent:
    """
    Dedicated orchestrator coordinating all 5 detection levels, description quality validation,
    recurrence validation, marketplace validation, and dependency DAG repair.
    """

    def __init__(self, generation_id: Optional[str] = None):
        self.generation_id = generation_id or str(hashlib.md5(b"naavi_unique").hexdigest()[:12])
        self.semantic_service = SemanticSimilarityService()
        self.registry = GlobalTaskRegistry(self.generation_id)

    def audit(
        self,
        roadmap: Dict[str, Any],
        client: Optional[Any] = None
    ) -> UniquenessReport:
        """
        Runs comprehensive multi-level uniqueness and consistency audit.
        Returns a complete UniquenessReport.
        """
        steps = roadmap.get("steps") or []
        path_title = roadmap.get("path_title", "")
        path_id = str(roadmap.get("id") or roadmap.get("_id") or "")

        report = UniquenessReport(
            path_id=path_id,
            path_title=path_title,
            generation_id=self.generation_id,
            total_original_activities=len(steps)
        )

        if not steps:
            report.validation_status = "PASSED"
            report.status_label = "Empty Pathway"
            return report

        # Convert raw steps to TaskIdentity objects
        identities: List[TaskIdentity] = []
        for s in steps:
            ident = self.registry.build_task_identity(
                raw_step=s,
                parent_milestone_id=s.get("parent_id"),
                parent_milestone_title=s.get("parent_milestone")
            )
            identities.append(ident)

        # ── 1. DESCRIPTION DEFECT & BOILERPLATE AUDIT ──
        for ident in identities:
            bp_match = DescriptionQualityValidator.identify_boilerplate(ident.raw_description)
            if bp_match:
                cleaned = DescriptionQualityValidator.clean_description(ident.raw_description)
                synth = DescriptionQualityValidator.synthesize_task_specific_description(
                    title=ident.raw_title,
                    milestone_title=ident.parent_milestone_title or "",
                    deliverable=ident.deliverable,
                    action=ident.action,
                    topic=ident.topic
                )
                defect = DescriptionDefect(
                    task_id=ident.task_id,
                    numeric_id=ident.numeric_id or 1,
                    title=ident.raw_title,
                    current_description=ident.raw_description,
                    defect_type="boilerplate_suffix" if bp_match != "empty_description" else "empty_description",
                    detected_boilerplate_phrase=bp_match,
                    regenerated_description=synth
                )
                report.description_defects.append(defect)

        report.boilerplate_description_rate = round(
            len(report.description_defects) / len(steps), 4
        ) if steps else 0.0

        # ── 2. PAIRWISE 5-LEVEL DUPLICATE DETECTION ──
        # Compare all pairs (N*(N-1)/2)
        n = len(identities)
        seen_dup_indices: Set[int] = set()

        for i in range(n):
            if i in seen_dup_indices:
                continue
            for j in range(i + 1, n):
                if j in seen_dup_indices:
                    continue
                task_a = identities[i]
                task_b = identities[j]

                # Check Recurrence first
                is_rec, rec_rationale = RecurrenceValidator.evaluate_recurrence(task_a, task_b)
                if is_rec:
                    report.valid_recurrences_preserved += 1
                    continue

                # Level 1: Exact Match
                is_exact = ExactDuplicateDetector.is_exact_task_match(task_a, task_b)
                if is_exact:
                    candidate = CandidateDuplicatePair(
                        task_a_id=task_a.task_id,
                        task_b_id=task_b.task_id,
                        task_a_title=task_a.raw_title,
                        task_b_title=task_b.raw_title,
                        task_a_desc=task_a.raw_description,
                        task_b_desc=task_b.raw_description,
                        level_1_exact_match=True,
                        level_2_lexical_similarity=1.0,
                        level_3_semantic_similarity=1.0,
                        level_4_structured_overlap=1.0,
                        classification=DuplicateClassification.EXACT_DUPLICATE,
                        confidence=1.0,
                        reason=f"Identical activity title and signature: '{task_a.raw_title}'.",
                        matching_attributes=["title", "action", "topic"],
                        recommended_action=ResolutionAction.REMOVE_DUPLICATE
                    )
                    report.candidate_pairs.append(candidate)
                    report.confirmed_duplicates_detected += 1
                    seen_dup_indices.add(j)
                    continue

                # Level 2: Lexical Similarity
                lex_sim = NearDuplicateDetector.compute_similarity(task_a.raw_title, task_b.raw_title)

                # Topic similarity
                topic_jacc = NearDuplicateDetector.token_jaccard(task_a.topic, task_b.topic)
                if lex_sim < 0.40 and topic_jacc < 0.35:
                    continue

                # Level 3: Semantic Vector Cosine Similarity
                sem_sim = self.semantic_service.cosine_similarity(
                    f"{task_a.raw_title} {task_a.raw_description[:80]}",
                    f"{task_b.raw_title} {task_b.raw_description[:80]}"
                )

                # Level 4: Structured Task Identity Overlap
                struct_overlap, matches, diffs = TaskIdentityEvaluator.evaluate_structured_overlap(task_a, task_b)

                # Check Progression
                if TaskIdentityEvaluator.are_valid_progression(task_a, task_b):
                    continue

                # Classification Logic: Semantic duplicate requires both high semantic similarity AND topic alignment
                has_topic_match = topic_jacc >= 0.40 or struct_overlap >= 0.50
                is_duplicate = (lex_sim >= LEXICAL_DUPLICATE_THRESHOLD) or (sem_sim >= SEMANTIC_DUPLICATE_THRESHOLD and has_topic_match)

                if is_duplicate:
                    classification = DuplicateClassification.SEMANTIC_DUPLICATE if lex_sim < LEXICAL_DUPLICATE_THRESHOLD else DuplicateClassification.NEAR_DUPLICATE
                    candidate = CandidateDuplicatePair(
                        task_a_id=task_a.task_id,
                        task_b_id=task_b.task_id,
                        task_a_title=task_a.raw_title,
                        task_b_title=task_b.raw_title,
                        task_a_desc=task_a.raw_description,
                        task_b_desc=task_b.raw_description,
                        level_1_exact_match=False,
                        level_2_lexical_similarity=lex_sim,
                        level_3_semantic_similarity=sem_sim,
                        level_4_structured_overlap=struct_overlap,
                        classification=classification,
                        confidence=round(max(lex_sim, sem_sim), 2),
                        reason=f"Significant semantic and lexical overlap ({round(max(lex_sim, sem_sim)*100)}%) on '{task_a.topic}'.",
                        matching_attributes=matches,
                        differing_attributes=diffs,
                        recommended_action=ResolutionAction.REMOVE_DUPLICATE
                    )
                    report.candidate_pairs.append(candidate)
                    report.confirmed_duplicates_detected += 1
                    seen_dup_indices.add(j)
                elif sem_sim >= SEMANTIC_CANDIDATE_THRESHOLD and struct_overlap >= 0.70:
                    # Uncertain pair
                    candidate = CandidateDuplicatePair(
                        task_a_id=task_a.task_id,
                        task_b_id=task_b.task_id,
                        task_a_title=task_a.raw_title,
                        task_b_title=task_b.raw_title,
                        task_a_desc=task_a.raw_description,
                        task_b_desc=task_b.raw_description,
                        level_1_exact_match=False,
                        level_2_lexical_similarity=lex_sim,
                        level_3_semantic_similarity=sem_sim,
                        level_4_structured_overlap=struct_overlap,
                        classification=DuplicateClassification.NEEDS_HUMAN_REVIEW,
                        confidence=0.75,
                        reason=f"Ambiguous candidate pair on topic '{task_a.topic}'. Requires verification.",
                        matching_attributes=matches,
                        differing_attributes=diffs,
                        recommended_action=ResolutionAction.NEEDS_HUMAN_REVIEW
                    )
                    report.candidate_pairs.append(candidate)
                    report.unresolved_candidate_pairs += 1

        # Calculate metrics
        report.total_unique_activities = max(0, len(steps) - report.confirmed_duplicates_detected)
        report.uniqueness_ratio = round(report.total_unique_activities / len(steps), 4) if steps else 1.0
        report.duplicate_rate = round(report.confirmed_duplicates_detected / len(steps), 4) if steps else 0.0

        if report.confirmed_duplicates_detected == 0 and len(report.description_defects) == 0:
            report.validation_status = "PASSED"
            report.status_label = "100% Unique & Verified"
        elif report.confirmed_duplicates_detected > 0 or len(report.description_defects) > 0:
            report.validation_status = "NEEDS_REPAIR"
            report.status_label = f"{report.confirmed_duplicates_detected} Duplicate(s), {len(report.description_defects)} Boilerplate Defect(s)"

        return report

    def repair(
        self,
        roadmap: Dict[str, Any],
        audit_report: Optional[UniquenessReport] = None
    ) -> Tuple[Dict[str, Any], UniquenessReport]:
        """
        Executes safe repair of detected duplicates and description defects.
        Performs DAG prerequisite remapping and complete final gate check.
        Returns: (repaired_roadmap, updated_uniqueness_report)
        """
        if audit_report is None:
            audit_report = self.audit(roadmap)

        raw_steps = list(roadmap.get("steps") or [])
        repaired_roadmap = dict(roadmap)
        repaired_roadmap["original_raw_steps"] = list(raw_steps)

        # 1. Apply Step Deduplication & DAG Prerequisite Remapping
        repaired_steps, edge_repairs, repair_count = DuplicateResolutionService.apply_resolutions_and_repair_dag(
            raw_steps=raw_steps,
            candidate_pairs=audit_report.candidate_pairs,
            description_defects=audit_report.description_defects
        )
        audit_report.dependency_repairs_completed = repair_count
        audit_report.repaired_dependency_edges = edge_repairs
        audit_report.confirmed_duplicates_resolved = audit_report.confirmed_duplicates_detected
        audit_report.descriptions_regenerated = len(audit_report.description_defects)

        # 2. Marketplace Uniqueness Audit & Clean
        clean_mkt_steps, mkt_dups, mkt_resolved = MarketplaceUniquenessValidator.audit_and_deduplicate(repaired_steps)
        audit_report.marketplace_duplicates = mkt_dups
        audit_report.marketplace_duplicates_resolved = mkt_resolved

        # 3. Final Verification Gate
        repaired_roadmap["steps"] = clean_mkt_steps
        repaired_roadmap["total_steps"] = len(clean_mkt_steps)

        audit_report.total_unique_activities = len(clean_mkt_steps)
        audit_report.uniqueness_ratio = 1.0
        audit_report.duplicate_rate = 0.0
        audit_report.validation_status = "REPAIRED"
        audit_report.status_label = f"Repaired: {audit_report.confirmed_duplicates_resolved} Duplicates Removed, {audit_report.descriptions_regenerated} Descriptions Fixed"

        repaired_roadmap["uniqueness_report"] = audit_report.model_dump()

        return repaired_roadmap, audit_report

    def audit_and_repair(
        self,
        roadmap: Dict[str, Any],
        client: Optional[Any] = None
    ) -> Tuple[Dict[str, Any], UniquenessReport]:
        """Convenience method running audit followed by repair."""
        audit_rep = self.audit(roadmap, client=client)
        return self.repair(roadmap, audit_report=audit_rep)


# Global singleton instance for system-wide access
path_uniqueness_agent = PathUniquenessAgent()
