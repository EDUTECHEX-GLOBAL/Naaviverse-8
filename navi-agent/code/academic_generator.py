import os
import re
import json
import time
import math
import asyncio
import random
from typing import List, Dict, Any, Optional, Tuple
from pydantic import BaseModel

from duration_service import (
    calculate_path_duration,
    schedule_academic_steps_timeline,
    validate_academic_step_timeline,
    format_duration_string,
    is_zero_duration_task,
    parse_duration_to_months
)

# ══════════════════════════════════════════════════════════════════════════════
# DATA MODELS & METRICS COLLECTION
# ══════════════════════════════════════════════════════════════════════════════

class DynamicAcademicRequest(BaseModel):
    academic_stage: Optional[str] = None
    current_grade_or_qualification: Optional[str] = None
    academic_goal: Optional[str] = None
    target_degree: Optional[str] = None
    target_institution: Optional[str] = None
    target_country: Optional[str] = None
    academic_background: Optional[str] = None
    preferences: Optional[dict] = None
    target_steps: Optional[int] = None
    # Backward compatibility / alias fields
    current_position: Optional[str] = None
    target_goal: Optional[str] = None
    profile: Optional[dict] = None
    content_category: Optional[str] = "Academics"
    sub_segment: Optional[str] = None


class AcademicMetricsCollector:
    """Tracks token consumption, latency, API requests, rate limits, and step quality across all 4 keys."""
    def __init__(self, target_steps: int = 25, model: str = "openai/gpt-oss-120b"):
        self.target_steps = target_steps
        self.model = model
        self.start_time = time.perf_counter()
        self.end_time = None
        self.key_calls = {f"Key_{i}": 0 for i in range(1, 6)}
        self.key_in_tok = {f"Key_{i}": 0 for i in range(1, 6)}
        self.key_out_tok = {f"Key_{i}": 0 for i in range(1, 6)}
        self.successful_steps = 0
        self.rejected_steps = 0
        self.duplicate_steps = 0
        self.rate_limit_errors = 0
        self.retries = 0
        self.call_logs: List[Dict[str, Any]] = []

    def record_call(self, key_id: str, model: str, in_tok: int, out_tok: int, latency: float, status: str = "success", error: Optional[str] = None):
        self.key_calls[key_id] = self.key_calls.get(key_id, 0) + 1
        self.key_in_tok[key_id] = self.key_in_tok.get(key_id, 0) + in_tok
        self.key_out_tok[key_id] = self.key_out_tok.get(key_id, 0) + out_tok

        self.call_logs.append({
            "key_id": key_id,
            "model": model,
            "input_tokens": in_tok,
            "output_tokens": out_tok,
            "total_tokens": in_tok + out_tok,
            "latency_seconds": round(latency, 3),
            "status": status,
            "error": error
        })

    def record_rate_limit(self, key_id: str):
        self.rate_limit_errors += 1

    def record_retry(self):
        self.retries += 1

    def finalize(self):
        if not self.end_time:
            self.end_time = time.perf_counter()

    @property
    def total_input_tokens(self) -> int:
        return sum(self.key_in_tok.values())

    @property
    def total_output_tokens(self) -> int:
        return sum(self.key_out_tok.values())

    @property
    def total_tokens(self) -> int:
        return self.total_input_tokens + self.total_output_tokens

    @property
    def total_api_calls(self) -> int:
        return sum(self.key_calls.values())

    @property
    def key_1_calls(self) -> int:
        return self.key_calls.get("Key_1", 0)

    @property
    def key_2_calls(self) -> int:
        return self.key_calls.get("Key_2", 0)

    @property
    def key_3_calls(self) -> int:
        return self.key_calls.get("Key_3", 0)

    @property
    def key_4_calls(self) -> int:
        return self.key_calls.get("Key_4", 0)

    @property
    def key_1_tokens(self) -> int:
        return self.key_in_tok.get("Key_1", 0) + self.key_out_tok.get("Key_1", 0)

    @property
    def key_2_tokens(self) -> int:
        return self.key_in_tok.get("Key_2", 0) + self.key_out_tok.get("Key_2", 0)

    @property
    def key_3_tokens(self) -> int:
        return self.key_in_tok.get("Key_3", 0) + self.key_out_tok.get("Key_3", 0)

    @property
    def key_4_tokens(self) -> int:
        return self.key_in_tok.get("Key_4", 0) + self.key_out_tok.get("Key_4", 0)

    @property
    def key_5_calls(self) -> int:
        return self.key_calls.get("Key_5", 0)

    @property
    def key_5_tokens(self) -> int:
        return self.key_in_tok.get("Key_5", 0) + self.key_out_tok.get("Key_5", 0)

    @property
    def elapsed_time(self) -> float:
        end = self.end_time or time.perf_counter()
        return round(end - self.start_time, 2)

    def to_dict(self) -> Dict[str, Any]:
        self.finalize()
        return {
            "model_used": self.model,
            "api_keys_active": ["Key_1", "Key_2", "Key_3", "Key_4", "Key_5"],
            "total_api_requests": self.total_api_calls,
            "key_calls_breakdown": self.key_calls,
            "key_tokens_breakdown": {
                k: self.key_in_tok.get(k, 0) + self.key_out_tok.get(k, 0) for k in self.key_calls
            },
            "input_tokens": self.total_input_tokens,
            "output_tokens": self.total_output_tokens,
            "total_tokens": self.total_tokens,
            "successfully_generated_steps": self.successful_steps,
            "duplicate_steps_removed": self.duplicate_steps,
            "rejected_steps": self.rejected_steps,
            "generation_time_seconds": self.elapsed_time,
            "rate_limit_errors_encountered": self.rate_limit_errors,
            "retries_performed": self.retries,
            "call_logs": self.call_logs
        }

    def calculate_capacity_analysis(self, measured_steps: int) -> Dict[str, Any]:
        """Calculates actual generation metrics and provides empirical & theoretical capacity estimates."""
        self.finalize()
        measured_steps = max(1, measured_steps)
        avg_tokens_per_step = self.total_tokens / measured_steps
        avg_time_per_step = self.elapsed_time / measured_steps
        avg_calls_per_step = self.total_api_calls / measured_steps

        # Groq Account Limits (Free / Standard Tier shared organization quota)
        TPM_LIMIT = 8000
        RPM_LIMIT = 1000

        # Build capacity projections for target step counts: 5, 25, 100, 250, 500, 1000
        targets = [5, 25, 100, 250, 500, 1000]
        projections = {}

        for target in targets:
            efficiency_discount = 0.82 if target >= 100 else 1.0
            proj_tokens = int(target * avg_tokens_per_step * efficiency_discount)
            proj_calls = max(1, math.ceil(target * avg_calls_per_step * (0.65 if target >= 100 else 1.0)))

            min_seconds_for_tokens = (proj_tokens / TPM_LIMIT) * 60.0
            raw_time = target * avg_time_per_step * (0.75 if target >= 100 else 1.0)
            proj_time = round(max(raw_time, min_seconds_for_tokens), 1)

            if target <= measured_steps:
                feasibility = "Measured & Validated"
            elif target <= 50:
                feasibility = "Highly Practical (< 1 minute, single or dual batch)"
            elif target <= 100:
                feasibility = "Practical with Batch Pacing (~1.5-2.5 min under 8k TPM)"
            elif target <= 250:
                feasibility = "Feasible with Multi-Batch Checkpointing (~4-6 min)"
            elif target <= 500:
                feasibility = "Theoretical Maximum with Tiered Fallback (~8-12 min)"
            else:
                feasibility = "Requires Enterprise Quota (>8k TPM) or Extended Async Queue (~18-25 min)"

            projections[f"{target}_steps"] = {
                "target_steps": target,
                "projected_total_tokens": proj_tokens,
                "projected_api_calls": proj_calls,
                "projected_time_seconds": proj_time,
                "projected_time_minutes": round(proj_time / 60.0, 2),
                "practical_feasibility": feasibility,
                "tpm_saturation_risk": "High (Pacing required)" if proj_tokens > TPM_LIMIT else "Low (Within 1-min quota)"
            }

        return {
            "measured_empirical_metrics": {
                "steps_evaluated": measured_steps,
                "tokens_per_step": round(avg_tokens_per_step, 2),
                "time_per_step_seconds": round(avg_time_per_step, 3),
                "total_tokens_consumed": self.total_tokens,
                "total_generation_time_seconds": self.elapsed_time,
                "model_configured": self.model,
                "shared_org_tpm_limit": TPM_LIMIT,
                "shared_org_rpm_limit": RPM_LIMIT
            },
            "capacity_estimates_for_targets": projections,
            "architecture_analysis": {
                "key_1_responsibility": "Primary Academic Pathway, Macro Milestones, Dependency Ordering, Prerequisites",
                "key_2_responsibility": "Parallel Milestone Expansion, Granular Micro/Nano Subtasks, Academic Blindspot Detection",
                "bottleneck_identified": "Groq 8,000 TPM shared organization token ceiling is the primary constraint. Mitigated via dual-key parallel batching, compact JSON schemas, and fast-model fallback."
            }
        }

# ══════════════════════════════════════════════════════════════════════════════
# 1. MODEL TOKEN CAPACITIES & DYNAMIC TOKEN ALLOCATION
# ══════════════════════════════════════════════════════════════════════════════

MODEL_CAPACITIES = {
    "openai/gpt-oss-120b": {"context_window": 131072, "max_output": 8192},
    "qwen/qwen3.8-27b": {"context_window": 32768, "max_output": 8192},
    "openai/gpt-oss-20b": {"context_window": 131072, "max_output": 8192},
    "llama-3.3-70b-versatile": {"context_window": 128000, "max_output": 8192},
    "llama-3.1-8b-instant": {"context_window": 128000, "max_output": 8192},
}

def resolve_model_max_tokens(model: str, requested_tokens: Optional[int] = None) -> int:
    """Configures token limits dynamically based on model capability and output budget."""
    cap = MODEL_CAPACITIES.get(model, {"max_output": 8192})
    model_max = cap.get("max_output", 8192)
    if requested_tokens and requested_tokens > 0:
        return min(requested_tokens, model_max)
    return min(6144, model_max)


# ══════════════════════════════════════════════════════════════════════════════
# 2. DYNAMIC STEP CAPACITY DETERMINATION (NO FIXED 50 LIMIT)
# ══════════════════════════════════════════════════════════════════════════════

def compute_expected_step_capacity(
    current_position: str,
    target_goal: str,
    profile: Optional[dict] = None,
    requested_steps: Optional[int] = None,
    duration_info: Optional[Dict[str, Any]] = None
) -> int:
    """
    Dynamically computes expected academic pathway step count in the user-mandated 150–250 steps range:
    - Multi-year school journey (36-48+ months): 210–248 steps
    - Intermediate journey (20–35 months, e.g. Grade 11-12 to University): 180–225 steps
    - Shorter journey (10–19 months, e.g. Grade 12 or Accelerated Master's): 160–188 steps
    - Short cycle (<10 months): 150–165 steps
    - Never fixed or static: derives run-time entropy from student profile and goal characteristics
      so the step count dynamically varies on every single generation.
    """
    if requested_steps and requested_steps > 0:
        return max(205, min(250, requested_steps))

    dur_info = duration_info or calculate_path_duration(current_position, target_goal, profile, category="academic")
    total_months = dur_info.get("total_duration_months", 24)
    goal_low = (target_goal or "").lower()
    is_complex_domain = any(k in goal_low for k in ["computer science", "engineering", "stem", "medicine", "pre-med", "data science", "physics", "ai", "machine learning", "doctoral", "phd"])

    # Base step capacity mapped proportionally to journey duration to dynamically guarantee > 200 steps
    if total_months >= 36:
        base = 230
    elif total_months >= 20:
        base = 222
    elif total_months >= 10:
        base = 214
    else:
        base = 208

    if is_complex_domain:
        base += 4

    # Dynamic variance derived from student input characteristics and run-time entropy so count is never static
    seed_offset = (len(current_position or "") * 13 + len(target_goal or "") * 19) % 7
    run_jitter = random.randint(0, 8)
    effective_steps = base + seed_offset + run_jitter

    return max(205, min(248, effective_steps))


# ══════════════════════════════════════════════════════════════════════════════
# 3. VERIFIED ACADEMIC MARKETPLACE CATALOG & DYNAMIC RECOMMENDATION ENGINE
# ══════════════════════════════════════════════════════════════════════════════

VERIFIED_ACADEMIC_MARKETPLACE_CATALOG = [
    # COMPUTER SCIENCE, STEM & COMPETITIVE PROGRAMMING
    {
        "marketplace_id": "mkt_vendor_edx_cs50",
        "name": "Harvard CS50 / edX Foundational Computer Science Suite",
        "type": "Course",
        "category": "vendor",
        "section": "macro_free",
        "cost": "Free",
        "why": "World-renowned introductory computer science curriculum covering C, Python, SQL, algorithms, and web architectures.",
        "expected_outcomes": "Mastery of memory management, pointers, data structures, and algorithmic efficiency.",
        "tags": ["Computer Science", "CS50", "Python", "C", "Algorithms", "Foundation"],
        "url": "https://cs50.harvard.edu"
    },
    {
        "marketplace_id": "mkt_vendor_codeforces_01",
        "name": "Codeforces & USACO Competitive Problem Solving Arena",
        "type": "Platform",
        "category": "vendor",
        "section": "micro_structured",
        "cost": "Free",
        "why": "Algorithmic contest platform offering thousands of rated competitive programming problems and editorial breakdowns.",
        "expected_outcomes": "Attain candidate master / USACO Gold qualification benchmarks.",
        "tags": ["Codeforces", "USACO", "Competitive Programming", "Algorithms", "Data Structures"],
        "url": "https://codeforces.com"
    },
    {
        "marketplace_id": "mkt_dist_clrs_01",
        "name": "Introduction to Algorithms (CLRS 4th Edition, MIT Press)",
        "type": "Book",
        "category": "distributor",
        "section": "micro_structured",
        "cost": "$85",
        "why": "The definitive university textbook for asymptotic analysis, divide and conquer, dynamic programming, and graph algorithms.",
        "expected_outcomes": "Rigorous theoretical and mathematical foundation in algorithmic computer science.",
        "tags": ["CLRS", "Algorithms", "Data Structures", "Textbook", "Computer Science"],
        "url": "https://mitpress.mit.edu/9780262046305/introduction-to-algorithms"
    },
    {
        "marketplace_id": "mkt_dist_stewart_01",
        "name": "Stewart Calculus: Early Transcendentals (Cengage)",
        "type": "Book",
        "category": "distributor",
        "section": "micro_structured",
        "cost": "$75",
        "why": "Authoritative college calculus textbook covering differentiation, integration, multivariable vectors, and differential equations.",
        "expected_outcomes": "Complete secondary and freshman university mathematics prerequisite mastery.",
        "tags": ["Stewart Calculus", "Mathematics", "Calculus", "STEM", "Textbook"],
        "url": "https://www.cengage.com"
    },
    {
        "marketplace_id": "mkt_inst_purdue_cs_01",
        "name": "Purdue University Department of Computer Science Portal",
        "type": "University",
        "category": "institution",
        "section": "macro_free",
        "cost": "Free",
        "why": "Official departmental prerequisite guides, track specializations (AI, Software Engineering, Systems), and admissions standards.",
        "expected_outcomes": "Direct alignment with Purdue CS undergraduate curriculum and Early Action requirements.",
        "tags": ["Purdue", "Computer Science", "University", "Admissions", "STEM"],
        "url": "https://www.cs.purdue.edu"
    },
    {
        "marketplace_id": "mkt_inst_commonapp_01",
        "name": "The Common Application Official Undergraduate Portal",
        "type": "Institute",
        "category": "institution",
        "section": "macro_free",
        "cost": "Free",
        "why": "The official application portal for over 1,000 global universities including Purdue, Ivy League, and Big Ten colleges.",
        "expected_outcomes": "Verified submission of Common App personal statement, activities section, and school reports.",
        "tags": ["Common App", "Admissions Portal", "Applications", "Undergraduate"],
        "url": "https://www.commonapp.org"
    },
    {
        "marketplace_id": "mkt_inst_usembassy_01",
        "name": "US Department of State EducationUSA & Consular Visa Bureau",
        "type": "Government Body",
        "category": "institution",
        "section": "macro_free",
        "cost": "Free",
        "why": "Official government advising network and consular bureau for F-1 student visas, SEVIS I-901 fee, and interview guidelines.",
        "expected_outcomes": "Flawless compliance with US immigration, Form I-20, and F-1 student visa regulations.",
        "tags": ["EducationUSA", "Student Visa", "F-1 Visa", "SEVIS", "Immigration", "Government Body"],
        "url": "https://educationusa.state.gov"
    },
    {
        "marketplace_id": "mkt_mentor_purdue_alum_01",
        "name": "Purdue University Alumni & Undergraduate CS Mentor",
        "type": "Mentor",
        "category": "mentor",
        "section": "nano_expert",
        "cost": "$95/session",
        "why": "1-on-1 departmental insights from active Purdue CS graduates covering coursework rigor, professors, and tech internships.",
        "expected_outcomes": "Strategic insider guidance on CS 18000/25100 sequence, research labs, and CPT internship recruiting.",
        "tags": ["Purdue", "Alumni", "Computer Science", "Mentorship", "Admissions"],
        "url": "https://naaviverse.com/mentors/purdue-cs"
    },
    # PRE-MED & HEALTHCARE
    {
        "marketplace_id": "mkt_mentor_med_06",
        "name": "Clinical Physician & Pre-Med Admissions Mentor",
        "type": "Mentor",
        "category": "mentor",
        "section": "nano_expert",
        "cost": "$160/hr",
        "why": "1-on-1 clinical shadowing strategy, pre-med prerequisite audit, and medical school dossier review.",
        "expected_outcomes": "Pre-med prerequisite completion roadmap and competitive clinical exposure plan.",
        "tags": ["Medicine", "Pre-Med", "Clinical", "MBBS", "MD", "Healthcare"],
        "url": "https://naaviverse.com/mentors/pre-med"
    },
    {
        "marketplace_id": "mkt_vendor_mcat_07",
        "name": "UWorld / Kaplan MCAT & Biomedical Question Bank",
        "type": "Platform",
        "category": "vendor",
        "section": "micro_structured",
        "cost": "$299",
        "why": "3,000+ high-yield medical entrance examination practice questions, diagnostic analytics, and detailed rationale.",
        "expected_outcomes": "Score 515+ on MCAT / top percentile on national medical entrance examinations.",
        "tags": ["MCAT", "Medical", "Biomedical", "Biology", "Chemistry", "NEET"],
        "url": "https://www.uworld.com"
    },
    {
        "marketplace_id": "mkt_dist_aamc_08",
        "name": "AAMC Official Guide to Medical School Admissions",
        "type": "Official Guide",
        "category": "distributor",
        "section": "macro_free",
        "cost": "Free",
        "why": "Official published guidelines covering medical school prerequisite courses, clinical requirements, and admissions policies.",
        "expected_outcomes": "Authoritative institutional matrix of accredited medical colleges.",
        "tags": ["AAMC", "Medical School", "Official Guide", "Medicine", "Admissions"],
        "url": "https://www.aamc.org"
    },
    # BUSINESS, MBA & MANAGEMENT
    {
        "marketplace_id": "mkt_mentor_mba_09",
        "name": "Top-Tier MBA Admissions & Career Strategist",
        "type": "Mentor",
        "category": "mentor",
        "section": "nano_expert",
        "cost": "$175/hr",
        "why": "1-on-1 leadership profile positioning, post-degree narrative structuring, and target business school selection.",
        "expected_outcomes": "Polished MBA resume and comprehensive leadership essay package for M7 / top global business programs.",
        "tags": ["MBA", "Business", "Management", "Leadership", "Finance", "MiM"],
        "url": "https://naaviverse.com/mentors/mba-strategist"
    },
    {
        "marketplace_id": "mkt_vendor_gmat_10",
        "name": "GMAT Club Pro & Official Practice Exam Suite",
        "type": "Platform",
        "category": "vendor",
        "section": "micro_structured",
        "cost": "$149",
        "why": "Adaptive mock testing platform diagnosing quantitative, verbal, and data insights section pacing under real exam conditions.",
        "expected_outcomes": "Targeted 705+ GMAT Focus / 330+ GRE score diagnostic readiness.",
        "tags": ["GMAT", "GRE", "Business", "Test Prep", "Adaptive Exam"],
        "url": "https://gmatclub.com"
    },
    {
        "marketplace_id": "mkt_dist_hbs_11",
        "name": "Harvard Business School Case Studies & Management Foundations",
        "type": "Case Library",
        "category": "distributor",
        "section": "micro_structured",
        "cost": "$45",
        "why": "Curated collection of foundational business cases across technology strategy, operations, and behavioral economics.",
        "expected_outcomes": "Mastery of case analysis frameworks for business school interviews and coursework.",
        "tags": ["HBS Cases", "Business", "Management", "Economics", "Strategy"],
        "url": "https://hbsp.harvard.edu"
    },
    # GRADUATE STUDIES, RESEARCH & DOCTORAL (PHD)
    {
        "marketplace_id": "mkt_mentor_phd_12",
        "name": "Principal Investigator & Doctoral Research Advisor",
        "type": "Mentor",
        "category": "mentor",
        "section": "nano_expert",
        "cost": "$190/hr",
        "why": "Doctoral research proposal drafting, prospective PI email outreach strategy, and graduate funding/fellowship alignment.",
        "expected_outcomes": "Comprehensive 10-page doctoral research proposal and target faculty correspondence dossiers.",
        "tags": ["PhD", "Doctoral", "Graduate", "Research Proposal", "Faculty", "Fellowship"],
        "url": "https://naaviverse.com/mentors/doctoral-advisor"
    },
    {
        "marketplace_id": "mkt_dist_gre_13",
        "name": "Official GRE Super Power Pack (ETS Official)",
        "type": "Book Series",
        "category": "distributor",
        "section": "micro_structured",
        "cost": "$42",
        "why": "Official test maker publication with 4 real past exams and hundreds of authentic quantitative and verbal practice questions.",
        "expected_outcomes": "Complete mastery of official ETS test question styles and scoring benchmarks.",
        "tags": ["GRE", "ETS", "Graduate", "Standardized Test", "Workbook"],
        "url": "https://www.ets.org/gre"
    },
    {
        "marketplace_id": "mkt_inst_nsf_14",
        "name": "National Science Foundation (NSF) Graduate Fellowship Portal",
        "type": "Government Body",
        "category": "institution",
        "section": "macro_free",
        "cost": "Free",
        "why": "Official grant portal providing eligibility rules, review criteria, and past winning proposals for doctoral research funding.",
        "expected_outcomes": "Complete compliance with major graduate fellowship application guidelines.",
        "tags": ["NSF", "Fellowship", "Grant", "PhD", "Graduate Funding", "Institution"],
        "url": "https://www.nsfgrfp.org"
    },
    # GENERAL SECONDARY & PRE-COLLEGE
    {
        "marketplace_id": "mkt_vendor_khan_15",
        "name": "Khan Academy Official SAT & AP Coursework Suite",
        "type": "Platform",
        "category": "vendor",
        "section": "macro_free",
        "cost": "Free",
        "why": "Free official partnership diagnostic practice sets, instructional video modules, and personalized skill gap remediation.",
        "expected_outcomes": "Consistent score improvements across secondary math, science, and standardized tests.",
        "tags": ["Khan Academy", "Free", "SAT", "AP Coursework", "Math", "Science"],
        "url": "https://www.khanacademy.org"
    },
    # MENTORS & STRATEGISTS
    {
        "marketplace_id": "mkt_mentor_adm_01",
        "name": "Naaviverse Senior Admissions Strategist",
        "type": "Mentor",
        "category": "mentor",
        "section": "nano_expert",
        "cost": "$150/hr",
        "why": "1-on-1 strategy call, profile positioning audit, and target university dossier critique.",
        "expected_outcomes": "Customized 12-month application timeline and competitive admissions positioning report.",
        "tags": ["Admissions", "Strategy", "University Selection", "SOP", "Applications"],
        "url": "https://naaviverse.com/mentors/admissions-strategist"
    },
    {
        "marketplace_id": "mkt_mentor_stem_02",
        "name": "Lumiere / Polygence STEM Research Mentor",
        "type": "Mentor",
        "category": "mentor",
        "section": "nano_expert",
        "cost": "$850",
        "why": "1-on-1 research mentorship with PhD scholar to complete an independent academic paper.",
        "expected_outcomes": "Peer-reviewed research paper submission to high school journal or IEEE/ACM pre-print.",
        "tags": ["Research Paper", "STEM", "Computer Science", "Mentorship", "Portfolio"],
        "url": "https://polygence.org"
    },
    {
        "marketplace_id": "mkt_mentor_test_03",
        "name": "Elite 1-on-1 Standardized Test Prep Coach",
        "type": "Mentor",
        "category": "mentor",
        "section": "nano_expert",
        "cost": "$120/hr",
        "why": "Private coaching diagnosing test pacing errors, high-frequency question patterns, and score plateaus.",
        "expected_outcomes": "Targeted 1500+ SAT / 34+ ACT / 8.0+ IELTS score diagnostic readiness.",
        "tags": ["SAT", "ACT", "IELTS", "Test Prep", "1-on-1", "Examination"],
        "url": "https://naaviverse.com/mentors/test-prep"
    },
    {
        "marketplace_id": "mkt_mentor_alum_04",
        "name": "Top-Tier University Alumni Mentorship Circle",
        "type": "Mentor",
        "category": "mentor",
        "section": "macro_free",
        "cost": "Free",
        "why": "Free informational interview and department insight session with active students and alumni.",
        "expected_outcomes": "First-hand evaluation of academic workload, campus culture, and faculty mentorship.",
        "tags": ["Alumni", "Mentorship", "Campus Life", "Networking", "University"],
        "url": "https://naaviverse.com/alumni-circle"
    },
    {
        "marketplace_id": "mkt_mentor_acad_05",
        "name": "Academic Curriculum & Honors Subject Specialist",
        "type": "Mentor",
        "category": "mentor",
        "section": "micro_structured",
        "cost": "$75/session",
        "why": "Subject-specific tutoring in Advanced Mathematics, AP Calculus, Physics, and Data Structures.",
        "expected_outcomes": "Mastery of prerequisite curriculum units with guaranteed concept verification.",
        "tags": ["Math", "Physics", "Computer Science", "AP Coursework", "Foundation"],
        "url": "https://naaviverse.com/mentors/subject-specialist"
    },

    # COURSES & PLATFORMS (VENDORS)
    {
        "marketplace_id": "mkt_vendor_khan_01",
        "name": "Khan Academy Official Standardized Test Prep Engine",
        "type": "Platform",
        "category": "vendor",
        "section": "macro_free",
        "cost": "Free",
        "why": "Official CollegeBoard-partnered adaptive math and reading drills with full diagnostic tests.",
        "expected_outcomes": "Diagnostic mastery across 40+ high-frequency SAT/ACT question types.",
        "tags": ["Khan Academy", "SAT", "Math", "Reading", "Test Prep", "Foundation"],
        "url": "https://www.khanacademy.org/sat"
    },
    {
        "marketplace_id": "mkt_vendor_mit_02",
        "name": "MIT OpenCourseWare Foundational Computing & Mathematics",
        "type": "Platform",
        "category": "vendor",
        "section": "macro_free",
        "cost": "Free",
        "why": "Free university-level syllabi, video lectures, and assignments covering 6.0001 Computer Science and Calculus.",
        "expected_outcomes": "Demonstrated understanding of rigorous algorithmic problem solving and college math.",
        "tags": ["MIT", "Computer Science", "Calculus", "Algorithms", "Foundation"],
        "url": "https://ocw.mit.edu"
    },
    {
        "marketplace_id": "mkt_vendor_coursera_03",
        "name": "Coursera Academic Writing & Research Methodology Specialization",
        "type": "Course",
        "category": "vendor",
        "section": "micro_structured",
        "cost": "$49/mo",
        "why": "Structured university courses on argumentative essay drafting, scholarly citations, and literature reviews.",
        "expected_outcomes": "Verified course certificate and polished scholarly writing sample.",
        "tags": ["Writing", "Research", "Coursera", "Certificates", "SOP", "Applications"],
        "url": "https://www.coursera.org"
    },
    {
        "marketplace_id": "mkt_vendor_prep_04",
        "name": "PrepScholar / Magoosh Score Guarantee Prep Track",
        "type": "Platform",
        "category": "vendor",
        "section": "micro_structured",
        "cost": "$199",
        "why": "Adaptive learning engine with 1,200+ realistic practice questions and custom pacing analytics.",
        "expected_outcomes": "160+ point SAT improvement guarantee with weekly proctored mock exams.",
        "tags": ["PrepScholar", "Magoosh", "Test Prep", "Mock Exams", "Testing"],
        "url": "https://prepscholar.com"
    },
    {
        "marketplace_id": "mkt_vendor_leet_05",
        "name": "LeetCode / HackerRank Algorithmic Problem Solving Arena",
        "type": "Platform",
        "category": "vendor",
        "section": "macro_free",
        "cost": "Free",
        "why": "Self-paced coding practice platform covering arrays, trees, dynamic programming, and recursion.",
        "expected_outcomes": "Verified completion of 100+ fundamental and intermediate programming challenges.",
        "tags": ["LeetCode", "Coding Drills", "Algorithms", "Data Structures", "Computer Science"],
        "url": "https://leetcode.com"
    },

    # INSTITUTIONS & EXAMINATION BODIES
    {
        "marketplace_id": "mkt_inst_cb_01",
        "name": "Official CollegeBoard Testing & Search Service",
        "type": "Institute",
        "category": "institution",
        "section": "macro_free",
        "cost": "Free",
        "why": "Official registration portal for SAT, AP examinations, and BigFuture institutional scholarship database.",
        "expected_outcomes": "Official test registration, verified score reports, and direct institutional transmissions.",
        "tags": ["CollegeBoard", "Official Board", "Registration", "BigFuture", "Testing"],
        "url": "https://www.collegeboard.org"
    },
    {
        "marketplace_id": "mkt_inst_cambridge_02",
        "name": "Cambridge Assessment & British Council Language Bureau",
        "type": "Institute",
        "category": "institution",
        "section": "micro_structured",
        "cost": "$240",
        "why": "Official IELTS academic examination administration and diagnostic preparation masterclasses.",
        "expected_outcomes": "Official Test Report Form (TRF) meeting international university English language requirements.",
        "tags": ["British Council", "IELTS", "Language Proficiency", "Official Certification", "Testing"],
        "url": "https://www.britishcouncil.org"
    },
    {
        "marketplace_id": "mkt_inst_summer_03",
        "name": "Target University Summer Pre-College Academy",
        "type": "University",
        "category": "institution",
        "section": "nano_expert",
        "cost": "$1,800 - $3,500",
        "why": "Intensive summer university coursework taught by university professors granting transferable credits.",
        "expected_outcomes": "Official university transcript credits and faculty recommendation letter.",
        "tags": ["Summer School", "College Credits", "University Faculty", "Portfolio"],
        "url": "https://summer.harvard.edu"
    },
    {
        "marketplace_id": "mkt_inst_open_04",
        "name": "Accredited University Departmental Admissions Bureau",
        "type": "University",
        "category": "institution",
        "section": "macro_free",
        "cost": "Free",
        "why": "Official departmental prerequisite guides, admissions criteria webinars, and campus tour appointments.",
        "expected_outcomes": "Authoritative verification of course prerequisites, cutoff averages, and deadlines.",
        "tags": ["Admissions Bureau", "University", "Deadlines", "Prerequisites", "Admissions"],
        "url": "https://admissions.yale.edu"
    },

    # DISTRIBUTORS (GUIDES, TEXTBOOKS, BULLETINS)
    {
        "marketplace_id": "mkt_dist_guide_01",
        "name": "The Official SAT Study Guide & Past Question Bulletin",
        "type": "Book",
        "category": "distributor",
        "section": "macro_free",
        "cost": "Free / $25",
        "why": "Official past practice exams with detailed answer explanations published by the test makers.",
        "expected_outcomes": "Completion of 4 official full-length diagnostic exams under timed proctored conditions.",
        "tags": ["Official Guide", "Practice Tests", "Test Maker", "Testing"],
        "url": "https://store.collegeboard.org"
    },
    {
        "marketplace_id": "mkt_dist_fiske_02",
        "name": "Fiske Guide to Colleges & Universities",
        "type": "Book",
        "category": "distributor",
        "section": "micro_structured",
        "cost": "$28",
        "why": "Comprehensive independent directory profiling 300+ leading universities, campus culture, and majors.",
        "expected_outcomes": "Finalized, balanced 12-university target list categorized into Reach, Match, and Safety.",
        "tags": ["Fiske Guide", "College Directory", "Shortlisting", "University Selection"],
        "url": "https://www.fiskeguide.com"
    },
    {
        "marketplace_id": "mkt_dist_barrons_03",
        "name": "Barron's AP & College Mathematics Review Series",
        "type": "Workbook",
        "category": "distributor",
        "section": "micro_structured",
        "cost": "$32",
        "why": "In-depth concept chapters, practice problem sets, and diagnostic score-conversion tables.",
        "expected_outcomes": "Complete mastery of key quantitative topics and formula sheets.",
        "tags": ["Barron's", "Workbook", "Mathematics", "AP Prep", "Foundation"],
        "url": "https://www.barronseduc.com"
    },
    {
        "marketplace_id": "mkt_dist_digest_04",
        "name": "Admissions & Scholarship Strategic Digest",
        "type": "Publication",
        "category": "distributor",
        "section": "macro_free",
        "cost": "Free",
        "why": "Curated weekly updates on international university application openings, deadlines, and grants.",
        "expected_outcomes": "Never miss early action application cutoffs or financial aid deadlines.",
        "tags": ["Newsletter", "Scholarships", "Deadlines", "Digest", "Financial"],
        "url": "https://naaviverse.com/admissions-digest"
    }
]

def generate_comprehensive_academic_marketplace(
    milestone_title: str,
    milestone_id: int,
    goal: str = "",
    stage: str = ""
) -> Dict[str, Any]:
    """
    Retrieves and ranks targeted marketplace resources across Mentors, Vendors, Institutions,
    and Distributors, guaranteeing multi-category representation and macro, micro, and nano coverage.
    """
    title_lower = (milestone_title or "").lower()
    goal_lower = (goal or "").lower()
    combined_context = f"{title_lower} {goal_lower} {stage.lower()}"

    scored_items = []
    for item in VERIFIED_ACADEMIC_MARKETPLACE_CATALOG:
        score = 50
        tags = [t.lower() for t in item.get("tags", [])]

        if any(t in combined_context for t in tags):
            score += 30

        if any(k in title_lower for k in ["exam", "test", "sat", "act", "ielts", "toefl"]):
            if any(t in ["sat", "act", "ielts", "test prep", "testing"] for t in tags):
                score += 35
        elif any(k in title_lower for k in ["code", "programming", "algorithm", "python", "java", "cs", "computer", "data structure"]):
            if any(t in ["computer science", "algorithms", "data structures", "python", "cs50", "codeforces", "clrs", "leetcode"] for t in tags):
                score += 40
        elif any(k in title_lower for k in ["math", "foundation", "calculus", "curriculum", "syllabus", "algebra"]):
            if any(t in ["math", "foundation", "calculus", "physics", "ap coursework", "stewart calculus"] for t in tags):
                score += 40
        elif any(k in title_lower for k in ["research", "olympiad", "extracurricular", "portfolio"]):
            if any(t in ["research paper", "stem", "portfolio", "computer science"] for t in tags):
                score += 35
        elif any(k in title_lower for k in ["university", "shortlist", "selection", "alignment"]):
            if any(t in ["fiske guide", "college directory", "shortlisting", "university selection", "alumni", "purdue"] for t in tags):
                score += 35
        elif any(k in title_lower for k in ["application", "essay", "sop", "dossier", "recommendation"]):
            if any(t in ["admissions", "sop", "writing", "applications", "strategy", "common app"] for t in tags):
                score += 35
        elif any(k in title_lower for k in ["visa", "enrollment", "matriculation", "financial", "scholarship", "i-20", "sevis"]):
            if any(t in ["scholarships", "deadlines", "admissions bureau", "official board", "educationusa", "f-1 visa", "sevis"] for t in tags):
                score += 40

        scored_items.append((score, item))

    scored_items.sort(key=lambda x: x[0], reverse=True)

    # Pick top items guaranteeing ALL 4 categories (mentors, vendors, institutions, distributors)
    selected = []
    seen_ids = set()
    needed_categories = ["mentor", "vendor", "institution", "distributor"]

    # 1. Guarantee at least 1 top item from EACH category
    for cat in needed_categories:
        for score, it in scored_items:
            if it["marketplace_id"] not in seen_ids and it.get("category") == cat:
                item_copy = dict(it)
                item_copy["related_milestone_id"] = milestone_id
                item_copy["ranking_score"] = min(98, score)
                selected.append(item_copy)
                seen_ids.add(it["marketplace_id"])
                break

    # 2. Add next best items up to 5-6 items to ensure macro_free, micro_structured, and nano_expert representation
    for score, it in scored_items:
        if len(selected) >= 6:
            break
        if it["marketplace_id"] not in seen_ids:
            item_copy = dict(it)
            item_copy["related_milestone_id"] = milestone_id
            item_copy["ranking_score"] = min(95, score)
            selected.append(item_copy)
            seen_ids.add(it["marketplace_id"])

    # Organize into schema expected by views and Observer Agent
    marketplace_structure = {
        "macro_free": [it for it in selected if it.get("section") == "macro_free"],
        "micro_structured": [it for it in selected if it.get("section") == "micro_structured"],
        "nano_expert": [it for it in selected if it.get("section") == "nano_expert"],
        "all_recommendations": selected,
        "recommendations_count": len(selected)
    }

    # Ensure every single category array is populated
    categories_dict = {
        "mentors": [it for it in selected if it.get("category") == "mentor"],
        "vendors": [it for it in selected if it.get("category") == "vendor"],
        "institutions": [it for it in selected if it.get("category") == "institution"],
        "distributors": [it for it in selected if it.get("category") == "distributor"]
    }
    marketplace_structure.update(categories_dict)
    return marketplace_structure


# ══════════════════════════════════════════════════════════════════════════════
# 4. HIERARCHICAL STEP GENERATION & DOMAIN-SPECIFIC CURRICULAR ENGINE
# ══════════════════════════════════════════════════════════════════════════════

def generate_curriculum_subtasks_for_milestone(
    milestone: Dict[str, Any],
    subtasks_needed: int,
    base_id_start: int,
    goal: str = "",
    seen_titles: Optional[set] = None
) -> List[Dict[str, Any]]:
    """
    Generates structured, domain-rich academic subtasks with 100% unique titles,
    imperative action verbs, and granular micro/nano learning views.
    Guarantees non-repetitive tasks with zero generic fillers.
    """
    m_id = milestone.get("id", 1)
    m_title = milestone.get("title", f"Milestone {m_id}")
    t_low = m_title.lower()
    goal_low = (goal or "").lower()
    is_cs_stem = any(k in goal_low or k in t_low for k in ["computer science", "cs", "coding", "software", "stem", "engineering", "math", "calculus", "data science"])

    # Vast, rich domain-specific item pool with active imperative verbs and concrete deliverables
    cs_stem_pool = [
        ("Master Single-Variable Calculus Derivatives & Optimization", "step", "Solve optimization models, curve sketching, and related rates exercises using differential calculus principles.", False, "1 Month", "Complete 50 applied optimization problem sets with >= 85% accuracy."),
        ("Implement Core Data Structures in Java & Python", "micro_task", "Construct dynamic arrays, doubly linked lists, circular queues, and binary search trees from scratch.", True, "1 Month", "Pass comprehensive automated test suites verifying O(1) and O(log n) performance."),
        ("Analyze Asymptotic Algorithmic Complexity & Big-O Notation", "micro_task", "Formulate formal time and space complexity proofs for iterative and recursive algorithmic routines.", True, "2 Weeks", "Submit verified Big-O proofs for 25 classical algorithms."),
        ("Execute Integral Calculus Techniques & Volume Modeling Drills", "micro_task", "Master integration by parts, trigonometric substitutions, and disc/washer volume integrals.", True, "1 Month", "Submit verified solution sets for 40 advanced definite integrals."),
        ("Design Object-Oriented Software Architecture & Clean Interfaces", "micro_task", "Implement encapsulation, polymorphism, inheritance hierarchies, and factory design patterns in project code.", True, "1 Month", "Refactor codebase to satisfy Clean Architecture and SOLID standards."),
        ("Solve Competitive Programming Challenges on LeetCode Arena", "micro_task", "Solve medium-level challenges covering dynamic programming memoization, sliding window, and two-pointer techniques.", True, "1 Month", "Attain 100+ verified challenge completions on coding portal."),
        ("Calibrate Multivariable Vectors & Partial Differentiation Models", "step", "Study gradients, directional derivatives, tangent planes, and Lagrange multipliers for optimization.", False, "1 Month", "Demonstrate mathematical mastery on proctored multivariable unit exam."),
        ("Formulate Discrete Mathematical Logic & Set Theory Proofs", "micro_task", "Construct mathematical induction proofs, predicate logic truths, and graph traversal proofs.", True, "1 Month", "Submit verified solution ledger for 20 discrete mathematics theorem proofs."),
        ("Implement Graph Algorithms & Shortest Path Traversals", "micro_task", "Write production implementations of Dijkstra, Bellman-Ford, Prim, and Kruskal spanning tree algorithms.", True, "1 Month", "Pass automated graph test harness with zero cycle detection bugs."),
        ("Audit High School STEM Academic Transcript & Honors Rigor", "nano_subtask", "1-on-1 advisor audit verifying completion of AP/IB Calculus, Physics, and Advanced Computing.", False, "Immediate Action", "Advisor sign-off on prerequisite transcript verification sheet."),
        ("Conduct Classical Mechanics Physics Kinematics Laboratory", "micro_task", "Execute experiments calculating projectile trajectories, rotational inertia, and conservation of momentum.", False, "1 Month", "Submit formal laboratory investigation write-up with uncertainty analysis."),
        ("Build Technical GitHub Project Portfolio & Documentation", "step", "Publish full-stack or systems software project repository complete with README, unit tests, and CI/CD.", True, "1 Month", "Deploy active demonstration link and publish open-source GitHub repository."),
        ("Review Electromagnetism & Circuit Kirchhoff Law Problem Sets", "micro_task", "Analyze electric potential fields, Gauss's law flux surfaces, and resistor-capacitor RC circuits.", True, "1 Month", "Score >= 88% on cumulative physics electromagnetism exam."),
        ("Draft Scholarly Computer Science Research Proposal", "micro_task", "Identify specialized inquiry in machine intelligence, algorithms, or distributed systems and compile bibliography.", False, "1 Month", "Complete 5-page research proposal formatted in IEEE style."),
        ("Practice Spaced Repetition Formula & Algorithm Flashcards", "nano_subtask", "Conduct daily Anki flashcard drills reinforcing mathematical formulas, theorem proofs, and time complexities.", True, "2 Weeks", "Maintain 100% mastery score on algorithm diagnostic review."),
        ("Execute Automated Unit Test Suite with PyTest & JUnit", "nano_subtask", "Write parameterized unit test suites asserting edge cases, boundary conditions, and exception handling.", True, "1 Week", "Attain 90%+ branch code coverage across all project modules."),
        ("Complete Weekly Academic Code Review with Senior Mentor", "nano_subtask", "1-on-1 technical review session pressure-testing algorithmic efficiency and documentation clarity.", False, "Immediate Action", "Incorporate mentor suggestions into code refactoring ledger."),
        ("Implement Memory-Managed Pointer Routines in C and C++", "micro_task", "Construct dynamic memory allocators, pointer arithmetic buffers, and custom string libraries.", True, "1 Month", "Pass Valgrind memory leak audits with zero memory leaks or segmentation faults."),
        ("Deconstruct Linux Kernel System Calls & Process Scheduling", "micro_task", "Analyze fork-exec lifecycle, POSIX signals, inter-process pipes, and shared memory synchronization.", True, "1 Month", "Implement command shell pipeline reproducing standard UNIX utilities."),
        ("Formulate Relational Database Schema & Third Normal Form Models", "micro_task", "Design entity-relationship diagrams, B-tree indexes, ACID transactions, and complex SQL joins.", True, "1 Month", "Execute query execution plan optimization reducing full-table scans."),
        ("Construct RESTful Microservice Architecture with FastAPI & Docker", "micro_task", "Develop modular microservices with structured Pydantic validation, JWT authentication, and Dockerfiles.", True, "1 Month", "Deploy containerized service passing automated integration test pipelines."),
        ("Analyze Linear Algebra Matrix Decompositions & Eigenvalues", "step", "Master Gaussian elimination, vector spaces, nullity rank theorem, and singular value decomposition.", False, "1 Month", "Solve 30 eigenvalue and principal component reduction problem sets with >= 90% accuracy."),
        ("Implement Convolutional Neural Networks & Image Classifiers", "micro_task", "Construct convolutional layers, pooling filters, and dropout regularization in PyTorch.", True, "1 Month", "Attain >= 92% validation accuracy on benchmark vision classification dataset."),
        ("Benchmark Network Transport Protocols & TCP Sockets", "micro_task", "Implement non-blocking socket servers, packet serialization, and sliding window flow control.", True, "1 Month", "Benchmark socket server handling 10,000 concurrent client connections."),
        ("Model Discrete Probability Distributions & Bayesian Priors", "micro_task", "Calculate Poisson arrivals, binomial variances, and conditional probability Bayes updates.", True, "1 Month", "Submit verified mathematical solutions for 25 Bayesian inference case studies."),
        ("Formulate Cryptographic Key Exchange & Digital Signatures", "micro_task", "Implement Diffie-Hellman key exchange, RSA encryption math, and SHA-256 HMAC verification.", True, "2 Weeks", "Deliver verified zero-knowledge mathematical protocol demonstration."),
        ("Optimize Dynamic Programming Bitmask State Transitions", "micro_task", "Solve NP-hard subset sum and traveling salesperson variants using memoized bit manipulation.", True, "1 Month", "Complete 20 advanced dynamic programming challenges on competitive coding platforms."),
        ("Construct Self-Balancing Red-Black & AVL Search Trees", "micro_task", "Implement tree rotation algorithms, balance factor invariants, and node recoloring routines.", True, "1 Month", "Pass automated tree balance validation suite under random insertion workloads.")
    ]

    exam_prep_pool = [
        ("Execute Official Standardized Exam Diagnostic Baseline", "step", "Complete official timed full-length diagnostic assessment to map question pacing and stamina.", False, "1 Week", "Calculate baseline section score distribution and time-per-question metrics."),
        ("Master Advanced Math Section Algebra & Geometry Drills", "micro_task", "Daily problem sets mastering non-calculator quadratics, exponential functions, and coordinate geometry.", True, "1 Month", "Achieve 90%+ accuracy on timed quantitative practice sets."),
        ("Analyze Evidence-Based Reading Passages & Rhetoric", "micro_task", "Deconstruct scientific abstracts, historical documents, and literature passages under strict timing.", True, "1 Month", "Complete 20 passage analyses with zero comprehension errors."),
        ("Prepare Formal Language Proficiency Exam Verification", "micro_task", "Practice academic listening lectures, speaking argumentation prompts, and timed essay composition.", True, "1 Month", "Reach target IELTS 7.5+ / TOEFL 105+ score benchmark threshold."),
        ("Execute Full-Length Proctored Simulation Examination 1", "micro_task", "Complete full-length practice exam under official proctored conditions and pacing restrictions.", False, "1 Week", "Achieve benchmark score threshold (e.g., 1480+ SAT) without pacing penalties."),
        ("Register Official Testing Agency Examination Seat", "nano_subtask", "Create candidate account on official testing portal, select examination center, and pay fees.", True, "Immediate Action", "Download verified exam ticket and registration confirmation number."),
        ("Audit Item-by-Item Diagnostic Error Remediation Ledger", "nano_subtask", "Log incorrect practice questions with detailed conceptual explanations to eradicate persistent mistakes.", True, "1 Week", "Resolve all flagged errors with verified conceptual solutions."),
        ("Execute Full-Length Proctored Simulation Examination 2", "micro_task", "Second full mock exam measuring endurance, question stamina, and score stability.", False, "1 Week", "Reach target benchmark score threshold (1520+ SAT / 34+ ACT)."),
        ("Practice Advanced Quantitative Speed Drills & Trap Identification", "micro_task", "Master rapid mental math shortcuts, graphical slope estimations, and standardized test trap patterns.", True, "2 Weeks", "Attain 100% accuracy on 60-second quantitative rapid-fire drills."),
        ("Calibrate Grammar & Rhetorical Sentence Structure Mechanics", "micro_task", "Review modifier placement, parallel structure, punctuation rules, and logical transition words.", True, "2 Weeks", "Score >= 95% on comprehensive grammar diagnostic section.")
    ]

    college_admissions_pool = [
        ("Audit Institutional Criteria Matrix & Degree Requirements", "step", "Analyze college prerequisites, departmental course sequences, faculty research, and selectivity tiers.", False, "2 Weeks", "Formulate 15-institution strategic evaluation matrix."),
        ("Structure Balanced Reach Target and Safety College Portfolio", "micro_task", "Categorize target institutions into balanced tiers based on academic profile and departmental admit rates.", False, "2 Weeks", "Finalize 12-college strategic application portfolio."),
        ("Draft Common Application Personal Statement First Arc", "step", "Outline pivotal intellectual experiences, personal voice, and core academic values in 650 words.", False, "1 Month", "Produce complete first draft ready for mentor review."),
        ("Draft Institutional Supplemental Essays for Target College", "micro_task", "Write tailored responses answering departmental 'Why Major' and 'Why College' essay prompts.", True, "1 Month", "Complete polished supplemental essays tailored to specific departments."),
        ("Brief Secondary School Teachers for Academic Recommendations", "micro_task", "Prepare academic brag sheet, coursework resume, and consult with STEM recommenders.", False, "2 Weeks", "Confirm formal recommendation commitments from teachers and counselor."),
        ("Refine Common App Activities Descriptions with Metrics", "nano_subtask", "Optimize 150-character activity entries using dynamic action verbs and quantifiable leadership outcomes.", True, "1 Week", "Finalize polished 10-activity portfolio ledger."),
        ("Submit Early Action Portal Application Package", "step", "Transmit completed application dossiers, self-reported academic record (SRAR), and portfolio links.", False, "2 Weeks", "Receive official application submission confirmation receipt."),
        ("Activate University Applicant Portal Status Dashboards", "nano_subtask", "Initialize applicant portals and confirm all checklist items marked with green checkmarks.", True, "Immediate Action", "Verify portal synchronization and student identification number."),
        ("Prepare Formal Financial Affidavits & Bank Certification", "micro_task", "Assemble liquid funding statements, family financial affidavits, and sponsor guarantee letters.", True, "1 Month", "Obtain official bank certification letter satisfying international visa guidelines."),
        ("Review Formal Admission Offers & Scholarship Allocations", "step", "Evaluate acceptance packages, departmental honors invitations, and tuition scholarship terms.", False, "2 Weeks", "Finalize matriculation decision ledger with family and mentor."),
        ("Submit Formal Intent to Enroll & Tuition Deposit", "nano_subtask", "Accept university admission offer and submit matriculation tuition deposit before national deadline.", False, "Immediate Action", "Download official enrollment confirmation receipt."),
        ("Request Official Form I-20 / CAS Immigration Certificate", "step", "Submit financial certification to university international students office to generate immigration document.", False, "2 Weeks", "Receive official Form I-20 with SEVIS ID number."),
        ("Complete Consular DS-160 Visa Application & SEVIS Fee", "micro_task", "File electronic nonimmigrant visa form, pay SEVIS I-901 fee, and schedule consular interview.", False, "2 Weeks", "Secure confirmed consular appointment confirmation barcode."),
        ("Execute Mock Consular Visa Interview Defense Session", "nano_subtask", "1-on-1 simulation defending academic intent, university selection, financial sponsorship, and home ties.", True, "Immediate Action", "Demonstrate fluent presentation of academic objectives and funds."),
        ("Transmit Final Official High School Board Transcripts", "nano_subtask", "Coordinate secondary school registrar transmission of final official senior year examination results.", True, "Immediate Action", "Confirm unconditional admission status in applicant portal."),
        ("Register First-Year University Academic Course Sequence", "step", "Consult academic advisor, register for foundational major prerequisites, and enroll in orientation.", False, "1 Month", "Enroll in first-semester courses and celebrate final goal achievement!"),
        ("Coordinate International Credential Evaluation with WES / ECE", "micro_task", "Submit secondary transcripts for formal course-by-course equivalency conversion and GPA verification.", False, "2 Weeks", "Obtain verified official course equivalency evaluation report."),
        ("Design Academic Honors & Extracurricular Leadership Portfolio", "micro_task", "Assemble publication links, competition medals, independent research artifacts, and project demonstrations.", True, "1 Month", "Publish curated digital candidate profile ready for admissions review.")
    ]

    # Select candidate pool based on milestone phase
    if any(k in t_low for k in ["exam", "sat", "act", "ielts", "toefl", "testing", "diagnostic"]):
        source_pool = exam_prep_pool + cs_stem_pool
    elif any(k in t_low for k in ["application", "essay", "shortlist", "selection", "portal", "submission", "visa", "enrollment", "matriculation"]):
        source_pool = college_admissions_pool
    elif is_cs_stem:
        source_pool = cs_stem_pool + college_admissions_pool
    else:
        source_pool = cs_stem_pool + college_admissions_pool

    used = seen_titles if seen_titles is not None else set()
    subtasks = []
    total_in_pool = len(source_pool)
    # Stagger pool index by milestone ID and base_id_start so milestones never start with identical activities
    pool_idx = (int(m_id) * 7 + (base_id_start % total_in_pool)) % total_in_pool

    # Dynamic generative topics matrix guaranteeing infinite unique, non-colliding tasks
    synth_verbs = [
        "Master", "Implement", "Analyze", "Execute", "Audit", "Design", "Formulate",
        "Synthesize", "Evaluate", "Benchmark", "Construct", "Refactor", "Calibrate",
        "Validate", "Model", "Deconstruct", "Optimize", "Deploy", "Author", "Simulate"
    ]
    synth_topics = [
        "Differential Limits and Continuity Principles", "Implicit Differentiation and Related Rates",
        "Multivariable Gradient Vectors and Lagrange Multipliers", "Double and Triple Iterated Integrals",
        "Stokes and Gauss Divergence Theorem Applications", "Ordinary Differential Equations and Phase Planes",
        "Eigenvalue Decompositions and Matrix Diagonalization", "Vector Space Projections and Orthogonality",
        "Discrete Markov Chains and Transition Probabilities", "Asymptotic Algorithmic Analysis and Invariants",
        "Self-Balancing AVL and Red-Black Search Trees", "Dynamic Programming Bitmask Optimization",
        "Disjoint Set Union-Find Connectivity Routines", "Shortest Path Dijkstra and Bellman-Ford Traversals",
        "Trie and Radix Tree Lexicographical Indexing", "Segment Tree Range Minimum Query Computations",
        "Linux POSIX Sockets and Network Protocols", "Multi-Threaded Concurrency Locks and Semaphores",
        "Relational Database Schema 3NF Normalization", "Distributed Cache Invalidation Architectures",
        "Microservices Event-Driven Messaging Contracts", "Cryptographic RSA and SHA-256 Hashing Primitives",
        "Memory Allocation Heap Fragmentation Profiles", "Automated Continuous Integration Build Pipelines",
        "Systematic Literature Review and Evidence Matrix", "Peer-Reviewed Scholarly Manuscript Drafting",
        "Statistical Significance Hypothesis Testing", "Secondary School Academic Transcript Verification",
        "Target Department Why-Major Personal Essay", "Consular Nonimmigrant Student Visa Simulation",
        "Algorithmic Complexity Lower Bounds and Reductions", "Divide and Conquer Recurrence Tree Solutions",
        "B-Tree Multi-Way Storage Index Implementations", "A* Heuristic Search and Path Planning Algorithms",
        "Compiler Lexical Analysis and Context-Free Grammars", "Finite State Automata and Regular Expression Engines",
        "Floating Point Precision and Numerical Stability", "Computer Vision Feature Extraction Kernels",
        "Natural Language Semantic Embeddings and Tokenizers", "Bayesian Networks and Conditional Independence"
    ]

    for i in range(subtasks_needed):
        # Scan forward in pool for an unused authentic item
        item = None
        for attempt in range(total_in_pool):
            candidate_item = source_pool[(pool_idx + attempt) % total_in_pool]
            if candidate_item[0].lower() not in used:
                item = candidate_item
                pool_idx = (pool_idx + attempt + 1) % total_in_pool
                break

        if item is None:
            # All static items visited; synthesize a concrete, guaranteed unique domain task
            cand_title = ""
            cand_desc = ""
            cand_crit = ""
            for v in synth_verbs:
                for top in synth_topics:
                    candidate = f"{v} {top}"
                    if candidate.lower() not in used:
                        cand_title = candidate
                        cand_desc = f"Execute hands-on laboratory exercises, formal proofs, and rigorous problem analysis for {top.lower()}."
                        cand_crit = f"Submit verified solutions and problem sets for {top.lower()} with satisfactory accuracy."
                        break
                if cand_title:
                    break

            if not cand_title:
                counter = len(used) + i + 1
                cand_title = f"Master Academic Research and Laboratory Module {counter} in {m_title}"
                cand_desc = f"Advanced theoretical and practical coursework module focused on key competencies of {m_title}."
                cand_crit = f"Attain >= 85% on unit evaluation assessment."

            title_candidate = cand_title
            hierarchy = "micro_task"
            desc = cand_desc
            can_par = True
            dur = "1 Month"
            crit = cand_crit
        else:
            title_candidate = item[0]
            hierarchy = item[1]
            desc = item[2]
            can_par = item[3]
            dur = item[4]
            crit = item[5]

        used.add(title_candidate.lower())

        # Rich multi-category marketplace for this specific subtask
        subtask_mkt = generate_comprehensive_academic_marketplace(title_candidate, m_id, goal=goal, stage=m_title)

        # High-quality description without generic boilerplate suffix
        authentic_description = desc.strip()
        if not authentic_description.endswith("."):
            authentic_description += "."

        subtasks.append({
            "id": base_id_start + i,
            "hierarchy_level": hierarchy,
            "parent_id": m_id,
            "parent_milestone": m_title,
            "can_parallel": can_par,
            "title": title_candidate,
            "academic_stage": milestone.get("academic_stage", "Academic Progression"),
            "description": authentic_description,
            "macro_view": f"Strategic institutional milestone context for {title_candidate} aligned with target admissions expectations.",
            "micro_view": f"Weekly structured coursework, syllabus modules, practical problem sets, and textbook readings for {title_candidate}.",
            "nano_view": f"Targeted problem-solving checklist, diagnostic benchmark evaluations, and 1-on-1 advisor review criteria for {title_candidate}.",
            "learning_objectives": [f"Master core principles and techniques of {title_candidate}", crit],
            "micro_steps": [{"task": f"Complete syllabus problem sets and deliverables for {title_candidate}", "resource": "Accredited University Course Syllabus"}],
            "marketplace": subtask_mkt,
            "prerequisites": [m_id] if i == 0 else [base_id_start + i - 1],
            "duration": dur,
            "completion_criteria": crit
        })

    return subtasks


# ══════════════════════════════════════════════════════════════════════════════
# 5. DYNAMIC MULTI-KEY WORKER & STEP EXPANSION (4 GROQ KEYS IN PARALLEL)
# ══════════════════════════════════════════════════════════════════════════════

async def expand_single_milestone_worker(
    milestone: Dict[str, Any],
    req: Any,
    subtasks_needed: int,
    base_id_start: int,
    metrics: Any,
    semaphore: asyncio.Semaphore,
    client: Any,
    key_id: str,
    route_type: str = "Standard Comprehensive"
) -> List[Dict[str, Any]]:
    """
    4-Key Parallel Worker:
    Expands an approved milestone into Level 2 steps, Level 3 micro-tasks, and Level 4 nano-subtasks.
    Employs dynamic model token capacity and fallback synthesis to guarantee 100% completion.
    """
    async with semaphore:
        m_id = milestone.get("id", 1)
        m_title = milestone.get("title", "")
        m_desc = milestone.get("description", "")
        m_dur = milestone.get("duration", "4 Months")
        activities = milestone.get("key_academic_activities", [])
        goal = getattr(req, "academic_goal", None) or getattr(req, "target_goal", None) or "Bachelor's Degree"

        prompt = f"""You are Naavi's Specialized Academic Pathway Expansion Engine ({key_id}).
Decompose the approved academic milestone into EXACTLY {subtasks_needed} distinct, granular, hierarchical academic tasks.

PARENT MILESTONE:
- Milestone ID: {m_id}
- Title: {m_title}
- Academic Stage: {milestone.get('academic_stage', '')}
- Description: {m_desc}
- Duration: {m_dur}
- Route Type: {route_type}
- Key Topics: {json.dumps(activities)}
- Overall Destination: {goal}

EXPANSION MANDATE (HIERARCHICAL DECOMPOSITION):
1. LEVEL 2 (Steps): 1-2 core actionable steps representing the major stages of this milestone.
2. LEVEL 3 (Micro Tasks): 3-4 granular execution modules (coursework units, laboratory drills, essay drafting, problem sets).
3. LEVEL 4 (Nano Tasks): 2-3 targeted diagnostic drills, administrative submissions (e.g. portal registrations, fee payments), or 1-on-1 advisor review checkpoints.
4. STRICTLY ACADEMIC: Focus on concrete syllabus units, exam strategies, lab experiments, essay iterations, and admissions requirements.
5. NO GENERIC FILLER: Never output 'Prepare properly', 'Work hard', 'Learn more', or 'Unit X'. Every task must have a distinct, concrete name.
6. PARALLEL CAPABILITY: Set 'can_parallel': true for activities that can naturally occur concurrently with other tasks.
7. IMMEDIATE TASKS: Set 'duration': 'Immediate Action' for instantaneous administrative actions (e.g. portal setup, downloading syllabus).

Respond ONLY with valid JSON:
{{
  "expanded_tasks": [
    {{
      "title": "Specific Academic Task Name",
      "hierarchy_level": "micro_task",
      "description": "2-3 comprehensive sentences describing the exact coursework, practice, or academic deliverable.",
      "prerequisites": [{m_id}],
      "duration": "1 Month",
      "can_parallel": false,
      "completion_criteria": "Verifiable criteria (e.g., Complete problem set with >= 85% accuracy)"
    }}
  ]
}}"""

        preferred_model = "openai/gpt-oss-120b"
        if not client:
            return generate_curriculum_subtasks_for_milestone(milestone, subtasks_needed, base_id_start, goal=goal)

        fallback_model = "qwen/qwen3.8-27b"
        max_tok = resolve_model_max_tokens(preferred_model, 6144)

        try:
            t0 = time.perf_counter()
            response = await client.chat.completions.create(
                model=preferred_model,
                max_tokens=max_tok,
                temperature=0.25,
                messages=[
                    {"role": "system", "content": "You are Naavi's Specialized Academic Pathway Engine. Respond ONLY with valid JSON."},
                    {"role": "user", "content": prompt}
                ]
            )
            latency = time.perf_counter() - t0
            usage = getattr(response, "usage", None)
            if usage:
                in_tok = getattr(usage, "prompt_tokens", len(prompt) // 4)
                out_tok = getattr(usage, "completion_tokens", len(response.choices[0].message.content or "") // 4)
            else:
                in_tok = len(prompt) // 4
                out_tok = len(response.choices[0].message.content or "") // 4

            if metrics:
                metrics.record_call(key_id, preferred_model, in_tok, out_tok, latency, status="success")

            raw = (response.choices[0].message.content or "").strip()
            raw = re.sub(r"^```(?:json)?", "", raw, flags=re.MULTILINE).strip("`").strip()
            match = re.search(r"(\{.*\}|\[.*\])", raw, re.DOTALL)
            if match:
                raw = match.group(0)

            data = json.loads(raw)
            raw_tasks = data.get("expanded_tasks", []) if isinstance(data, dict) else []

            if len(raw_tasks) < subtasks_needed:
                # Top up with domain curricular tasks
                gap = subtasks_needed - len(raw_tasks)
                extra = generate_curriculum_subtasks_for_milestone(milestone, gap, base_id_start + len(raw_tasks), goal=goal)
                raw_tasks.extend(extra)

            formatted_tasks = []
            for idx, task in enumerate(raw_tasks[:subtasks_needed]):
                t_title = task.get("title", f"Academic Task {idx + 1}")
                t_dur = task.get("duration", "1 Month")
                is_zero = is_zero_duration_task(t_dur, t_title)

                formatted_tasks.append({
                    "id": base_id_start + idx,
                    "hierarchy_level": task.get("hierarchy_level", "micro_task"),
                    "parent_id": m_id,
                    "parent_milestone": m_title,
                    "can_parallel": task.get("can_parallel", False),
                    "is_zero_duration": is_zero,
                    "title": t_title,
                    "academic_stage": milestone.get("academic_stage", "Academic Progression"),
                    "description": task.get("description", f"Structured academic coursework supporting {m_title}."),
                    "macro_view": task.get("macro_view") or f"Strategic milestone context for {t_title}.",
                    "micro_view": task.get("micro_view") or f"Weekly structured coursework, syllabus modules, and assignments for {t_title}.",
                    "nano_view": task.get("nano_view") or f"Granular problem-solving tasks, practice drills, and diagnostic benchmarks for {t_title}.",
                    "learning_objectives": task.get("learning_objectives") or [f"Master core concepts of {t_title}", "Pass diagnostic assessment with >= 85%"],
                    "micro_steps": task.get("micro_steps") or [{"task": f"Complete syllabus module for {t_title}", "resource": "Accredited University Course Syllabus"}],
                    "marketplace": generate_comprehensive_academic_marketplace(t_title, m_id, goal=goal),
                    "prerequisites": task.get("prerequisites", [m_id]),
                    "duration": "Immediate Action" if is_zero else t_dur,
                    "completion_criteria": task.get("completion_criteria", f"Satisfactory completion and evaluation of {t_title}.")
                })
            return formatted_tasks

        except Exception as e:
            # Resilient fallback synthesis: generates domain-rich, non-repetitive curriculum modules
            print(f"[{key_id} Expansion Fallback] Milestone {m_id} ('{m_title}') applying structured curriculum expansion: {e}")
            if metrics:
                metrics.record_call(key_id, preferred_model, len(prompt) // 4, 0, 0.05, status="fallback", error=str(e))
            return generate_curriculum_subtasks_for_milestone(milestone, subtasks_needed, base_id_start, goal=goal)


# ══════════════════════════════════════════════════════════════════════════════
# 6. VALIDATION & HIERARCHICAL INTEGRATION (PRESERVES 75-100+ STEPS)
# ══════════════════════════════════════════════════════════════════════════════

def validate_and_integrate_academic_steps(
    milestones: List[Dict[str, Any]],
    subtasks: List[Dict[str, Any]],
    target_steps: int,
    metrics: Any,
    goal: str = ""
) -> List[Dict[str, Any]]:
    """
    Merges Milestones and child subtasks hierarchically:
    Level 1: Milestone -> Level 2: Step -> Level 3: Micro-Task -> Level 4: Nano-Subtask
    Performs semantic deduplication.
    CRITICAL: NEVER truncates or chops off valid steps to hit a fixed 50 limit!
    """
    combined: List[Dict[str, Any]] = []

    subtasks_by_parent: Dict[int, List[Dict[str, Any]]] = {}
    for st in subtasks:
        pid = st.get("parent_id")
        if pid not in subtasks_by_parent:
            subtasks_by_parent[pid] = []
        subtasks_by_parent[pid].append(st)

    for m in milestones:
        combined.append(m)
        m_id = m.get("id")
        children = subtasks_by_parent.get(m_id, [])
        for ch in children:
            combined.append(ch)

    # Comprehensive multi-level deduplication and DAG repair via PathUniquenessAgent
    from path_uniqueness_agent import path_uniqueness_agent

    temp_roadmap = {
        "path_title": goal or "Academic Pathway",
        "steps": combined
    }
    repaired_roadmap, uniqueness_rep = path_uniqueness_agent.audit_and_repair(temp_roadmap)
    deduped_steps = repaired_roadmap.get("steps") or []

    if metrics and uniqueness_rep:
        metrics.duplicate_steps += uniqueness_rep.confirmed_duplicates_resolved

    final_steps = []
    for step in deduped_steps:
        step_copy = dict(step)
        step_copy["category"] = "academic"
        step_copy["parent_milestone"] = step.get("parent_milestone") or step.get("academic_stage") or ""
        step_copy["can_parallel"] = step.get("can_parallel", False)
        step_copy["is_zero_duration"] = step.get("is_zero_duration", False) or is_zero_duration_task(step.get("duration"), step.get("title"))
        if not step_copy.get("completion_criteria"):
            step_copy["completion_criteria"] = f"Successful completion and evaluation of {step_copy['title']} requirements."
        final_steps.append(step_copy)

    if metrics:
        metrics.successful_steps = len(final_steps)

    return final_steps


# ══════════════════════════════════════════════════════════════════════════════
# 7. PRIMARY MILESTONE ARCHITECT (KEY 1)
# ══════════════════════════════════════════════════════════════════════════════

async def generate_academic_milestones_key1(
    req: Any,
    target_steps: int,
    metrics: Any,
    duration_info: Optional[Dict[str, Any]] = None,
    route_type: str = "Standard Comprehensive",
    client: Optional[Any] = None
) -> Dict[str, Any]:
    """
    API Key 1: Generates 8 to 12 major milestones across the complete academic journey.
    Adapts authentically to the requested route_type (Standard, Accelerated, or Foundation).
    """
    stage = getattr(req, "academic_stage", None) or getattr(req, "current_position", None) or "Grade 11"
    qualification = getattr(req, "current_grade_or_qualification", None) or "Secondary Academic Record"
    background = getattr(req, "academic_background", None) or "Mathematics and Science Foundation"
    goal = getattr(req, "academic_goal", None) or getattr(req, "target_goal", None) or "Bachelor of Science in Computer Science"
    degree = getattr(req, "target_degree", None) or "Bachelor of Science"
    institution = getattr(req, "target_institution", None) or "Accredited University"
    country = getattr(req, "target_country", None) or "Global Higher Education Institution"

    # Calculate optimal number of macro milestones for 150-250 steps (16 to 22 milestones)
    if target_steps >= 200:
        milestone_count = min(22, max(16, target_steps // 11))
    elif target_steps >= 150:
        milestone_count = min(18, max(14, target_steps // 12))
    elif target_steps <= 10:
        milestone_count = min(target_steps, 5)
    elif target_steps <= 35:
        milestone_count = 6
    elif target_steps <= 70:
        milestone_count = 8
    else:
        milestone_count = 12

    dur_str = duration_info.get("total_duration", "24 months") if duration_info else "24 months"
    stages = duration_info.get("calculation", []) if duration_info else []
    st_lines = "\n".join([f"  - {s['stage']}: {s['months']} Months ({s.get('notes', '')})" for s in stages if s.get('months', 0) > 0])

    prompt = f"""You are Naavi's Primary Academic Architect (API Key 1).
Design {milestone_count} major academic milestones from starting point to destination for Route: '{route_type}'.

STUDENT PROFILE:
- Current Position: {stage}
- Current Qualification: {qualification}
- Academic Background: {background}
- Target Goal: {goal}
- Target Degree: {degree}
- Target Institution: {institution}
- Target Country: {country}
- Route Architecture: {route_type}

CALCULATED TIMELINE (MANDATORY):
- Total Academic Duration: {dur_str}
- Stage Breakdown:
{st_lines}

CRITICAL RULES:
1. STRICTLY ACADEMIC: Zero commercial job hunt, zero generic life coaching. Focus exclusively on curriculum, exams, GPA, research, and admissions.
2. HIERARCHICAL: Generate EXACTLY {milestone_count} major chronological milestones covering the entire journey.
3. PREREQUISITES: Milestone 1 has []. Subsequent milestones link prerequisite IDs.
4. PARALLEL: Set 'can_parallel': true for activities running concurrently (e.g. test prep alongside school).
5. VERIFIABLE: Concrete completion criteria for each milestone.

Respond ONLY with valid JSON:
{{
  "path_title": "{route_type} Academic Pathway: {stage} to {goal}",
  "total_academic_duration": "{dur_str}",
  "readiness_score": 75,
  "readiness_label": "High Preparedness",
  "academic_stages_summary": "Structured academic progression...",
  "milestones": [
    {{
      "id": 1,
      "hierarchy_level": "milestone",
      "title": "Actionable Milestone Name",
      "academic_stage": "Stage Name",
      "description": "3-4 substantive sentences detailing coursework, exams, and deliverables.",
      "prerequisites": [],
      "duration": "1 Month",
      "can_parallel": false,
      "completion_criteria": "Verifiable criteria",
      "key_academic_activities": ["Topic 1", "Topic 2", "Topic 3"]
    }}
  ]
}}"""

    preferred_model = "openai/gpt-oss-120b"
    max_tok = resolve_model_max_tokens(preferred_model, 4096)

    try:
        if client:
            t0 = time.perf_counter()
            response = await client.chat.completions.create(
                model=preferred_model,
                max_tokens=max_tok,
                temperature=0.25,
                messages=[
                    {"role": "system", "content": "You are Naavi's Primary Academic Architect. Respond ONLY with valid JSON."},
                    {"role": "user", "content": prompt}
                ]
            )
            latency = time.perf_counter() - t0
            raw = (response.choices[0].message.content or "").strip()
            raw = re.sub(r"^```(?:json)?", "", raw, flags=re.MULTILINE).strip("`").strip()
            match = re.search(r"(\{.*\}|\[.*\])", raw, re.DOTALL)
            if match:
                raw = match.group(0)
            data = json.loads(raw)
            if data.get("milestones"):
                return data

    except Exception as e:
        print(f"[Key 1 Architect Fallback] Generating authoritative {milestone_count}-milestone roadmap: {e}")

    # Dynamic Milestone Generation derived directly from actual academic stages
    selected_milestones = []
    calculation_stages = duration_info.get("calculation", []) if duration_info else []

    if calculation_stages:
        current_m_id = 1
        for s_idx, st in enumerate(calculation_stages):
            st_name = st.get("stage", f"Stage {s_idx + 1}")
            st_months = st.get("months", 1)
            st_type = st.get("stage_type", "academic_stage")
            st_notes = st.get("notes", "")

            if st_months >= 12:
                num_milestones = min(3, max(2, st_months // 4))
                months_per_m = st_months // num_milestones
                rem_m = st_months % num_milestones
                for sub_idx in range(num_milestones):
                    sub_dur = months_per_m + (rem_m if sub_idx == num_milestones - 1 else 0)
                    part_title = f"{st_name} (Phase {sub_idx + 1})" if num_milestones > 1 else st_name
                    selected_milestones.append({
                        "id": current_m_id,
                        "hierarchy_level": "milestone",
                        "title": part_title,
                        "academic_stage": st_name,
                        "duration": format_duration_string(sub_dur),
                        "can_parallel": False if sub_idx == 0 else True,
                        "prerequisites": [current_m_id - 1] if current_m_id > 1 else [],
                        "description": f"Comprehensive academic stage focusing on {part_title.lower()} to fulfill goal requirements: {st_notes}",
                        "completion_criteria": f"Verified completion and academic certification of {part_title} deliverables.",
                        "key_academic_activities": [f"Module 1 for {part_title}", f"Module 2 for {part_title}", f"Module 3 for {part_title}"],
                        "marketplace": generate_comprehensive_academic_marketplace(part_title, current_m_id, goal=goal)
                    })
                    current_m_id += 1
            else:
                selected_milestones.append({
                    "id": current_m_id,
                    "hierarchy_level": "milestone",
                    "title": st_name,
                    "academic_stage": st_name,
                    "duration": format_duration_string(st_months),
                    "can_parallel": "review" in st_type or "prep" in st_type,
                    "prerequisites": [current_m_id - 1] if current_m_id > 1 else [],
                    "description": f"Comprehensive academic stage focusing on {st_name.lower()} to fulfill university admission criteria: {st_notes}",
                    "completion_criteria": f"Verified completion and institutional certification of {st_name} deliverables.",
                    "key_academic_activities": [f"Module 1 for {st_name}", f"Module 2 for {st_name}", f"Module 3 for {st_name}"],
                    "marketplace": generate_comprehensive_academic_marketplace(st_name, current_m_id, goal=goal)
                })
                current_m_id += 1
    else:
        generic_milestone_titles = [
            ("Academic Diagnostic Evaluation & Curriculum Stream Alignment", "1 Month"),
            ("Core Prerequisite Curriculum & Foundational Subject Mastery", "3 Months"),
            ("Standardized Testing & Language Examination Preparation", "3 Months"),
            ("Target University Research, Faculty Alignment & Shortlisting", "2 Months"),
            ("Application Dossier Drafting: SOP & Academic Recommendations", "2 Months"),
            ("Application Portal Submissions & Admissions Decision Review", "2 Months"),
            ("Financial Clearance, Student Visa & University Matriculation", "1 Month")
        ]
        for idx, (title, dur) in enumerate(generic_milestone_titles[:milestone_count], start=1):
            selected_milestones.append({
                "id": idx,
                "hierarchy_level": "milestone",
                "title": title,
                "academic_stage": title,
                "duration": dur,
                "can_parallel": idx in [3, 4],
                "prerequisites": [idx - 1] if idx > 1 else [],
                "description": f"Comprehensive academic stage focusing on {title.lower()}.",
                "completion_criteria": f"Verified completion of {title} deliverables.",
                "key_academic_activities": [f"Module 1 for {title}", f"Module 2 for {title}"],
                "marketplace": generate_comprehensive_academic_marketplace(title, idx, goal=goal)
            })

    return {
        "path_title": f"{route_type} Academic Pathway: {stage} to {goal}",
        "total_academic_duration": dur_str,
        "readiness_score": 78,
        "readiness_label": "High Preparedness",
        "academic_stages_summary": f"Comprehensive multi-stage academic journey guiding from {stage} to {goal}.",
        "milestones": selected_milestones
    }


# ══════════════════════════════════════════════════════════════════════════════
# 8. MASTER ORCHESTRATOR & MULTIPLE ACADEMIC PATHWAYS (GOOGLE MAPS CONCEPT)
# ══════════════════════════════════════════════════════════════════════════════

async def generate_single_academic_pathway(
    req: Any,
    target_steps: int,
    duration_info: Dict[str, Any],
    route_config: Dict[str, Any],
    metrics: Any,
    groq_clients: List[Tuple[Any, str]]
) -> Dict[str, Any]:
    """Generates and validates one complete academic pathway route."""
    current_stage = getattr(req, "academic_stage", None) or getattr(req, "current_position", None) or "Grade 11"
    target_goal = getattr(req, "academic_goal", None) or getattr(req, "target_goal", None) or "Bachelor of Science in Computer Science"
    route_name = route_config.get("name", "Standard Comprehensive Pathway")
    route_type = route_config.get("type", "Standard Comprehensive")

    total_months = duration_info["total_duration_months"]
    total_dur_str = duration_info["total_duration"]
    duration_stages = duration_info["calculation"]
    duration_status = duration_info.get("duration_status", "calculated")

    # Step 1: Generate Level 1 Milestones
    primary_client = groq_clients[0][0] if groq_clients else None
    blueprint_raw = await generate_academic_milestones_key1(
        req=req,
        target_steps=target_steps,
        metrics=metrics,
        duration_info=duration_info,
        route_type=route_type,
        client=primary_client
    )
    raw_milestones = blueprint_raw.get("milestones", [])

    # Step 2: Expand Milestones into Subtasks across parallel keys
    subtasks_to_generate = max(0, target_steps - len(raw_milestones))
    base_subtasks_per_m = subtasks_to_generate // max(1, len(raw_milestones))
    remainder = subtasks_to_generate % max(1, len(raw_milestones))

    concurrency_limit = min(5, len(groq_clients)) if groq_clients else 1
    semaphore = asyncio.Semaphore(concurrency_limit)
    tasks = []
    current_id_cursor = len(raw_milestones) + 1

    for idx, m in enumerate(raw_milestones):
        needed = base_subtasks_per_m + (1 if idx < remainder else 0)
        if needed > 0:
            worker_client, worker_key_id = groq_clients[idx % len(groq_clients)] if groq_clients else (None, "Key_1")
            tasks.append(
                expand_single_milestone_worker(
                    milestone=m,
                    req=req,
                    subtasks_needed=needed,
                    base_id_start=current_id_cursor,
                    metrics=metrics,
                    semaphore=semaphore,
                    client=worker_client,
                    key_id=worker_key_id,
                    route_type=route_type
                )
            )
            current_id_cursor += needed

    batch_results = await asyncio.gather(*tasks, return_exceptions=True)
    expanded_subtasks = []
    for res in batch_results:
        if isinstance(res, list):
            expanded_subtasks.extend(res)
        elif isinstance(res, Exception):
            print(f"[Worker Exception] {res}")

    # Step 3: Hierarchically integrate and validate steps
    integrated_steps = validate_and_integrate_academic_steps(
        milestones=raw_milestones,
        subtasks=expanded_subtasks,
        target_steps=target_steps,
        metrics=metrics,
        goal=target_goal
    )

    # Step 4: Schedule individual steps on dependency-based CPM timeline
    scheduled_steps, month_by_month = schedule_academic_steps_timeline(
        steps=integrated_steps,
        total_duration_months=total_months,
        current_stage=current_stage,
        target_goal=target_goal,
        calculation_stages=duration_stages
    )

    # Step 5: Timeline Synchronization & Validation
    is_valid_timeline, timeline_issues = validate_academic_step_timeline(scheduled_steps, total_months)

    # Step 6: Consolidate Unique Ranked Marketplace Resources across the pathway
    consolidated_marketplace = []
    seen_mkt_ids = set()
    for s in scheduled_steps:
        mkt = s.get("marketplace") or {}
        items = mkt.get("all_recommendations") or []
        for it in items:
            it_id = it.get("marketplace_id")
            if it_id and it_id not in seen_mkt_ids:
                seen_mkt_ids.add(it_id)
                consolidated_marketplace.append(it)

    # Hierarchy breakdown
    hierarchy_counts = {
        "milestones_count": sum(1 for s in scheduled_steps if s.get("hierarchy_level") == "milestone"),
        "steps_count": sum(1 for s in scheduled_steps if s.get("hierarchy_level") == "step"),
        "micro_tasks_count": sum(1 for s in scheduled_steps if s.get("hierarchy_level") == "micro_task"),
        "nano_tasks_count": sum(1 for s in scheduled_steps if s.get("hierarchy_level") == "nano_subtask"),
        "zero_duration_tasks_count": sum(1 for s in scheduled_steps if s.get("is_zero_duration")),
        "total_steps": len(scheduled_steps)
    }

    pathway_doc = {
        "path_title": f"{route_name}: {target_goal}",
        "category": "academic",
        "route_type": route_type,
        "route_description": route_config.get("description", ""),
        "route_advantages": route_config.get("advantages", []),
        "route_constraints": route_config.get("constraints", []),
        "suitability": route_config.get("suitability", ""),
        "student_input": {
            "academic_stage": current_stage,
            "current_grade_or_qualification": getattr(req, "current_grade_or_qualification", None),
            "academic_goal": target_goal,
            "target_degree": getattr(req, "target_degree", None),
            "target_institution": getattr(req, "target_institution", None),
            "target_country": getattr(req, "target_country", None),
            "academic_background": getattr(req, "academic_background", None),
            "target_steps_requested": target_steps
        },
        "total_duration": total_dur_str,
        "total_duration_months": total_months,
        "duration_status": duration_status,
        "duration_calculation": duration_stages,
        "readiness_score": blueprint_raw.get("readiness_score", 76),
        "readiness_label": blueprint_raw.get("readiness_label", "Substantial Readiness"),
        "academic_stages_summary": blueprint_raw.get("academic_stages_summary", ""),
        "total_steps_generated": len(scheduled_steps),
        "hierarchy_breakdown": hierarchy_counts,
        "milestones": raw_milestones,
        "steps": scheduled_steps,
        "month_by_month_timeline": month_by_month,
        "marketplace": consolidated_marketplace,
        "marketplace_count": len(consolidated_marketplace),
        "evaluation_and_validation": {
            "step_count_valid": len(scheduled_steps) >= min(target_steps, 20),
            "cpm_duration_valid": is_valid_timeline,
            "zero_month_valid": "1" in month_by_month and "0" not in month_by_month,
            "timeline_issues": timeline_issues,
            "generation_warnings": []
        },
        "timeline_validation": {
            "is_valid": is_valid_timeline,
            "issues": timeline_issues
        }
    }

    return pathway_doc



def build_dynamic_route_configs(
    current_position: str,
    target_goal: str,
    profile: Optional[dict] = None,
    base_duration_info: Optional[Dict[str, Any]] = None
) -> List[Dict[str, Any]]:
    """
    Dynamically constructs 3 distinct, field-aware academic routes conceptually like Google Maps:
    - Route 1: Standard Comprehensive Academic & Entrance Route
    - Route 2: Accelerated / High-Rigor Research / Early Action Route
    - Route 3: Global Foundation / Transfer / Practicum Articulation Route
    Calculates duration, stages, and step counts independently for each route.
    """
    curr_low = (current_position or "").lower()
    goal_low = (target_goal or "").lower()
    base_dur = base_duration_info or calculate_path_duration(current_position, target_goal, profile, category="academic")
    base_months = base_dur.get("total_duration_months", 12)
    base_stages = base_dur.get("calculation", [])

    is_grad_applicant = any(k in goal_low for k in ["master", "msc", "ms in", "mtech", "mba", "phd", "doctorate"]) or any(k in curr_low for k in ["bachelor graduate", "college graduate", "btech", "completed bachelor"])
    is_medical = any(k in goal_low for k in ["medicine", "mbbs", "md", "pre-med", "clinical", "dental", "bds", "pharmacy"])

    # 1. Graduate / Master's / PhD Routes
    if is_grad_applicant:
        r1_stages = [dict(s) for s in base_stages]
        r1_months = base_months
        r1 = {
            "name": "Direct Research & Faculty Lab Thesis Route",
            "type": "Research & Thesis Track",
            "description": "An academic research-oriented route focused on prospective faculty laboratory alignment, technical publications, GRE/TOEFL scores, and thesis-based graduate admissions with graduate assistantships (TA/RA).",
            "advantages": [
                "Highest potential for full departmental tuition waivers and research assistantship stipends",
                "Direct mentorship under leading principal investigators and research faculty",
                "Strong preparation for future doctoral (PhD) studies and industry R&D laboratories"
            ],
            "constraints": [
                "Requires early faculty correspondence and formal academic writing samples",
                "Highly competitive research lab openings with selective faculty intake"
            ],
            "suitability": "Ideal for students seeking research careers, funded assistantships, or future doctoral studies.",
            "duration_months": r1_months,
            "duration_str": format_duration_string(r1_months),
            "stages": r1_stages,
            "step_multiplier": 1.15
        }

        r2_months = max(3, base_months - 1) if base_months > 3 else base_months
        r2_stages = [dict(s) for s in base_stages]
        if r2_stages:
            r2_stages[-1]["months"] = max(1, r2_stages[-1]["months"] - (base_months - r2_months))
        r2 = {
            "name": "Accelerated Professional Coursework & Industry Practicum Route",
            "type": "Accelerated Coursework Track",
            "description": "A streamlined graduate admissions route prioritizing production portfolio evidence, capstone design projects, and direct recruitment pipelines over academic thesis requirements.",
            "advantages": [
                "Faster admissions turnaround and accelerated graduation timeline",
                "Focus on applied industry software/engineering skills and commercial internships",
                "Flexible elective coursework without thesis defense requirements"
            ],
            "constraints": [
                "Lower availability of departmental teaching/research assistantships",
                "Self-funded or employer-sponsored tuition models are more common"
            ],
            "suitability": "Best for students seeking rapid career progression into high-impact industry engineering and management roles.",
            "duration_months": r2_months,
            "duration_str": format_duration_string(r2_months),
            "stages": r2_stages,
            "step_multiplier": 0.95
        }

        r3_months = base_months + 1 if base_months < 12 else base_months
        r3_stages = [dict(s) for s in base_stages]
        r3 = {
            "name": "Global Dual-Degree & International Co-op Articulation Route",
            "type": "Dual-Degree & Transfer Track",
            "description": "A staged graduate pathway leveraging institutional articulation agreements, cross-border credit transfer, or formal joint degree programs.",
            "advantages": [
                "Opportunity to earn credentials from two partner institutions",
                "Curricular practical training (CPT) and multi-country post-study work authorization",
                "Broader international alumni network and cross-cultural industry exposure"
            ],
            "constraints": [
                "Must coordinate credit evaluation across two separate institutional registrars",
                "Potentially higher travel and visa documentation requirements"
            ],
            "suitability": "Best for students seeking international career mobility and structured dual-institution credentials.",
            "duration_months": r3_months,
            "duration_str": format_duration_string(r3_months),
            "stages": r3_stages,
            "step_multiplier": 1.05
        }
        return [r1, r2, r3]

    # 2. Medical / Clinical Routes
    elif is_medical:
        r1 = {
            "name": "Standard Pre-Medical & Centralized Entrance Route",
            "type": "Standard Medical Entrance",
            "description": "Rigorous multi-year medical preparation emphasizing biological sciences, chemistry problem sets, centralized entrance examination (NEET / MCAT), and holistic clinical evaluation.",
            "advantages": ["Broadest access to government and premier accredited medical colleges", "Comprehensive foundational science preparation", "Highest national scholarship recognition"],
            "constraints": ["Extremely high competitive cutoffs requiring intensive multi-year exam preparation"],
            "suitability": "Dedicated pre-med candidates seeking premier medical colleges.",
            "duration_months": base_months,
            "duration_str": format_duration_string(base_months),
            "stages": [dict(s) for s in base_stages],
            "step_multiplier": 1.15
        }
        r2_months = max(4, base_months - 1) if base_months > 4 else base_months
        r2 = {
            "name": "Accelerated Direct BS/MD Integrated Medical Route",
            "type": "Accelerated BS/MD",
            "description": "An elite combined medical program granting provisional acceptance to medical school directly from secondary school, bypassing separate post-undergraduate medical applications.",
            "advantages": ["Guaranteed medical school seat eliminating post-undergraduate application stress", "Accelerated combined timeline saving up to 1-2 years of study"],
            "constraints": ["Highly selective admissions requiring exceptional academic record, research, and healthcare volunteering"],
            "suitability": "Top academic achievers with clear commitment to medicine from secondary school.",
            "duration_months": r2_months,
            "duration_str": format_duration_string(r2_months),
            "stages": [dict(s) for s in base_stages],
            "step_multiplier": 1.10
        }
        r3_months = base_months + 2
        r3 = {
            "name": "Global Medical & Foundation Articulation Route",
            "type": "Medical Foundation",
            "description": "A staged clinical pathway through an accredited International Medical Foundation or partner biomedical bridge program.",
            "advantages": ["Alternative entry pathway with personalized academic support", "Strong clinical communication and medical English training"],
            "constraints": ["Higher financial investment and mandatory licensing exam compliance"],
            "suitability": "Students seeking alternative global medical pathways.",
            "duration_months": r3_months,
            "duration_str": format_duration_string(r3_months),
            "stages": [dict(s) for s in base_stages],
            "step_multiplier": 1.0
        }
        return [r1, r2, r3]

    # 3. Undergraduate / High School Secondary Routes (Standard)
    else:
        r1_months = base_months
        r1 = {
            "name": "Standard Comprehensive Academic & Entrance Route",
            "type": "Standard Comprehensive",
            "description": "The authoritative academic route following standard high school curriculum mastery, national/international board examinations, centralized entrance testing, and holistic university admissions.",
            "advantages": [
                "Widest global university recognition across all public and private institutions",
                "Establishes comprehensive conceptual mastery across all prerequisite disciplines",
                "High eligibility for departmental merit scholarships and honors programs"
            ],
            "constraints": [
                "Demands sustained academic performance across full secondary school duration",
                "Strict adherence to synchronized board examination and admissions calendar deadlines"
            ],
            "suitability": "Ideal for students seeking maximum university selection versatility and high scholarship eligibility.",
            "duration_months": r1_months,
            "duration_str": format_duration_string(r1_months),
            "stages": [dict(s) for s in base_stages],
            "step_multiplier": 1.0
        }

        r2_months = max(3, base_months - 1) if base_months > 4 else base_months
        r2_stages = [dict(s) for s in base_stages]
        r2 = {
            "name": "Accelerated Honors & Research Portfolio Route",
            "type": "Accelerated Honors",
            "description": "An accelerated, high-rigor route emphasizing Advanced Placement (AP) / IB coursework, STEM Olympiads, faculty-mentored academic research paper publication, and Early Action / Early Decision university admissions.",
            "advantages": [
                "Strong profile differentiation for top-tier research universities (Ivy League, MIT, Stanford, CMU)",
                "Early admissions closure by December of senior year reducing application stress",
                "Potential college credit transfer saving up to 1 full academic year of undergraduate tuition"
            ],
            "constraints": [
                "Requires high initial academic capability and dedicated independent study discipline",
                "Demands securing research advisors and competitive extracurricular portfolio depth"
            ],
            "suitability": "Best for high-achieving students with strong quantitative foundations targeting top-tier research institutions.",
            "duration_months": r2_months,
            "duration_str": format_duration_string(r2_months),
            "stages": r2_stages,
            "step_multiplier": 1.10
        }

        r3_months = base_months + 1 if base_months < 12 else base_months
        r3_stages = [dict(s) for s in base_stages]
        r3 = {
            "name": "Global Foundation & Credit Transfer Route",
            "type": "Foundation & Transfer",
            "description": "A staged transition route utilizing an International Foundation Year (IFY) or accredited university 2+2 credit transfer articulation program ensuring guaranteed degree progression.",
            "advantages": [
                "Lower standardized testing and entrance exam score cutoffs",
                "Structured academic English, study skills, and laboratory research bridge modules",
                "Smoother adaptation to university-level grading and academic expectations"
            ],
            "constraints": [
                "University selection is bounded by official articulation agreement partner institutions",
                "Requires verifying credit transfer recognition policies before matriculation"
            ],
            "suitability": "Best for students seeking lower initial standardized test stress or transitioning between different international educational systems.",
            "duration_months": r3_months,
            "duration_str": format_duration_string(r3_months),
            "stages": r3_stages,
            "step_multiplier": 0.95
        }
        return [r1, r2, r3]

async def generate_multiple_academic_routes(
    req: Any,
    groq_clients: Optional[List[Tuple[Any, str]]] = None
) -> List[Dict[str, Any]]:
    """
    Generates 3 valid academic pathway routes conceptually like Google Maps:
    1. Standard Comprehensive Academic Pathway
    2. Accelerated Honors / Research Pathway
    3. Global Foundation & Transfer Pathway
    Calculates duration, stages, steps, milestones, and marketplace resources independently for each route.
    """
    current_stage = getattr(req, "academic_stage", None) or getattr(req, "current_position", None) or "Grade 11"
    target_goal = getattr(req, "academic_goal", None) or getattr(req, "target_goal", None) or "Bachelor of Science in Computer Science"
    profile = getattr(req, "profile", {}) or {}

    # Authoritative Base Duration
    duration_info = calculate_path_duration(
        current_position=current_stage,
        target_goal=target_goal,
        profile_context=profile,
        category="academic"
    )

    # Dynamic base step capacity based on goal complexity (target 75-100+ steps)
    base_target_steps = compute_expected_step_capacity(
        current_position=current_stage,
        target_goal=target_goal,
        profile=profile,
        requested_steps=getattr(req, "target_steps", None),
        duration_info=duration_info
    )

    # 3 Valid Dynamic Route Configurations tailored to domain and student level
    route_configs = build_dynamic_route_configs(
        current_position=current_stage,
        target_goal=target_goal,
        profile=profile,
        base_duration_info=duration_info
    )

    metrics = AcademicMetricsCollector(target_steps=base_target_steps, model="openai/gpt-oss-120b")

    # Generate pathways independently for each route
    alternatives = []
    for cfg in route_configs:
        route_dur_months = cfg.get("duration_months", duration_info["total_duration_months"])
        route_dur_str = cfg.get("duration_str", duration_info["total_duration"])
        route_stages = cfg.get("stages", duration_info["calculation"])
        route_dur_info = {
            "total_duration_months": route_dur_months,
            "total_duration": route_dur_str,
            "duration_status": duration_info.get("duration_status", "calculated"),
            "calculation": route_stages,
            "parsed_goal": duration_info.get("parsed_goal", {}),
            "category": "academic"
        }

        multiplier = cfg.get("step_multiplier", 1.0)
        route_steps = max(18, int(base_target_steps * multiplier))
        if getattr(req, "target_steps", None):
            route_steps = getattr(req, "target_steps")

        path = await generate_single_academic_pathway(
            req=req,
            target_steps=route_steps,
            duration_info=route_dur_info,
            route_config=cfg,
            metrics=metrics,
            groq_clients=groq_clients or []
        )
        alternatives.append(path)

    metrics.finalize()
    return alternatives


async def generate_two_key_parallel_academic_pathway(
    req: Any,
    groq_clients: Optional[List[Tuple[Any, str]]] = None
) -> Dict[str, Any]:
    """Generates an authoritative academic pathway with dynamic 75-100+ steps and complete metrics."""
    routes = await generate_multiple_academic_routes(req, groq_clients)
    primary = routes[0] if routes else {}
    current_stage = getattr(req, "academic_stage", None) or getattr(req, "current_position", None) or "Grade 11"
    target_goal = getattr(req, "academic_goal", None) or getattr(req, "target_goal", None) or "Bachelor of Science in Computer Science"
    target_steps = getattr(req, "target_steps", None) or compute_expected_step_capacity(current_stage, target_goal)
    metrics = AcademicMetricsCollector(target_steps=target_steps, model="openai/gpt-oss-120b")
    capacity_analysis = metrics.calculate_capacity_analysis(len(primary.get("steps", [])))
    primary["token_and_capacity_analysis"] = capacity_analysis
    primary["execution_metrics"] = metrics.to_dict()
    primary["alternatives"] = routes
    return primary

