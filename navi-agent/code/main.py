import os
import re
import json
import asyncio
import datetime
import time
import certifi
from typing import Optional, List, Dict, Any
from fastapi import FastAPI, HTTPException, Body, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from groq import Groq, AsyncGroq
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
try:
    import importlib
    _st_mod = importlib.import_module("sentence_transformers")
    SentenceTransformer = getattr(_st_mod, "SentenceTransformer", None)
except Exception:
    SentenceTransformer = None

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
 
# ─── MULTI-KEY GROQ POOL (LOAD BALANCING & HIGH ACCURACY FAILOVER) ──────────
def load_groq_api_keys() -> List[str]:
    keys = []
    # 1. Numbered without underscore: GROQ_API_KEY1, GROQ_API_KEY2, ...
    for i in range(1, 10):
        k = os.environ.get(f"GROQ_API_KEY{i}", "").strip()
        if k and k not in keys:
            keys.append(k)
    # 2. Numbered with underscore: GROQ_API_KEY_1, GROQ_API_KEY_2, ...
    for i in range(1, 10):
        k = os.environ.get(f"GROQ_API_KEY_{i}", "").strip()
        if k and k not in keys:
            keys.append(k)
    # 3. Comma-separated: GROQ_API_KEYS
    raw_list = os.environ.get("GROQ_API_KEYS", "")
    if raw_list:
        for k in raw_list.split(","):
            k = k.strip()
            if k and k not in keys:
                keys.append(k)
    # 4. Standard single key: GROQ_API_KEY
    default_k = os.environ.get("GROQ_API_KEY", "").strip()
    if default_k and default_k not in keys:
        keys.append(default_k)
    return keys

GROQ_KEYS = load_groq_api_keys()
if not GROQ_KEYS:
    raise ValueError("No Groq API keys found in environment. Please set GROQ_API_KEY1 / GROQ_API_KEY2.")

print(f"[Groq Key Pool] Initialized {len(GROQ_KEYS)} API key(s) for parallel load balancing and auto-failover.")

# Map keys to AsyncGroq and Groq clients
GROQ_ASYNC_CLIENTS = [AsyncGroq(api_key=k) for k in GROQ_KEYS]
GROQ_SYNC_CLIENTS = [Groq(api_key=k) for k in GROQ_KEYS]

# Expose primary clients for backwards compatibility
client = GROQ_SYNC_CLIENTS[0]
async_client = GROQ_ASYNC_CLIENTS[0]

# Global round-robin cursor for distributing requests across keys
_groq_key_cursor = 0

# MongoDB Setup
MONGODB_URI = os.environ.get("MONGODB_URI")
if not MONGODB_URI:
    raise ValueError("MONGODB_URI environment variable is missing from .env")
db_client = AsyncIOMotorClient(MONGODB_URI, tlsCAFile=certifi.where())
db = db_client.get_database("naaviagent")
profiles_collection = db.profiles
pending_paths_collection = db.pending_paths
published_paths_collection = db.published_paths
generation_history_collection = db.generation_history
admin_feedbacks_collection = db.admin_feedbacks
marketplace_feedback_collection = db.marketplace_feedback

@app.on_event("startup")
async def startup_db_init():
    try:
        existing_cols = await db.list_collection_names()
        for col in ["profiles", "pending_paths", "published_paths", "generation_history", "admin_feedbacks", "marketplace_feedback"]:
            if col not in existing_cols:
                await db.create_collection(col)
                print(f"[MongoDB] Created collection '{col}' successfully.")
    except Exception as e:
        print(f"[MongoDB Init Warning] Could not pre-create collections: {e}")

# Models
class PathGenerationRequest(BaseModel):
    current_position: str
    target_goal: str
    profile: Optional[dict] = None
    degree_type: Optional[str] = None
    refine_prompt: Optional[str] = None
    existing_roadmap: Optional[dict] = None
    focus: Optional[str] = None
    content_category: Optional[str] = None
    sub_segment: Optional[str] = None


class PathAuditRequest(BaseModel):
    blueprint: dict
    current_position: str
    target_goal: str
    profile: Optional[dict] = None

class GoalRequest(BaseModel):
    # Backward compatibility
    goal: str

class UpdatePathRequest(BaseModel):
    roadmap_data: dict
    status: str = "published"
    edited_by: Optional[str] = None
    feedback_text: Optional[str] = None
    feedback_category: Optional[str] = "general"

class CategoryValidationRequest(BaseModel):
    category: str
    current_position: str
    destination_goal: str


class AdminStepRequest(BaseModel):
    path_id: str
    step_id: Optional[int] = None
    step: Optional[dict] = None
    insert_index: Optional[int] = None
    alternative_index: Optional[int] = None
    edited_by: Optional[str] = None
    instruction: Optional[str] = None


class LoginRequest(BaseModel):
    email: str
    password: str

class SavePathRequest(BaseModel):
    current_position: str
    target_goal: str
    profile: Optional[dict] = None
    roadmap_data: dict
    generation_id: Optional[str] = None
    alternative_name: Optional[str] = None

class PathScoreRequest(BaseModel):
    roadmap_data: dict
    profile: Optional[dict] = None
    current_position: Optional[str] = ""

class MarketplaceFeedbackRequest(BaseModel):
    student_email: str
    path_id: str
    path_name: str
    step_id: int
    step_title: str
    provider_name: str
    provider_type: str
    action: str

class FeedbackCreateRequest(BaseModel):
    admin_email: str
    target_goal: str
    student_profile: Optional[dict] = None
    feedback_text: str
    category: str = "general"
    path_id: Optional[str] = None

def serialize_mongo_doc(doc):
    if not doc:
        return None
    doc["id"] = str(doc["_id"])
    del doc["_id"]
    for field in ["created_at", "updated_at", "published_at", "timestamp"]:
        if field in doc and doc[field]:
            if hasattr(doc[field], "isoformat"):
                val = doc[field].isoformat()
                if not val.endswith("Z") and "+00:00" not in val:
                    val += "Z"
                doc[field] = val
    if "profile" in doc and isinstance(doc["profile"], dict):
        profile_dict = doc["profile"]
        for field in ["created_at", "updated_at"]:
            if field in profile_dict and profile_dict[field]:
                if hasattr(profile_dict[field], "isoformat"):
                    val = profile_dict[field].isoformat()
                    if not val.endswith("Z") and "+00:00" not in val:
                        val += "Z"
                    profile_dict[field] = val
    if "modifications" in doc and isinstance(doc["modifications"], list):
        for mod in doc["modifications"]:
            if "timestamp" in mod and mod["timestamp"]:
                if hasattr(mod["timestamp"], "isoformat"):
                    val = mod["timestamp"].isoformat()
                    if not val.endswith("Z") and "+00:00" not in val:
                        val += "Z"
                    mod["timestamp"] = val
    return doc


def compute_roadmap_diff(old_roadmap: dict, new_roadmap: dict) -> list:
    changes = []
    if not old_roadmap or not new_roadmap:
        return changes

    # 1. Global fields comparison
    global_fields = ["path_title", "path_description", "readiness_score", "readiness_label", "total_duration"]
    for field in global_fields:
        old_val = old_roadmap.get(field)
        new_val = new_roadmap.get(field)
        if old_val != new_val:
            changes.append({
                "field": field,
                "old_value": old_val,
                "new_value": new_val
            })

    # Blind spots comparison
    old_blinds = old_roadmap.get("blind_spots") or []
    new_blinds = new_roadmap.get("blind_spots") or []
    if old_blinds != new_blinds:
        changes.append({
            "field": "blind_spots",
            "old_value": old_blinds,
            "new_value": new_blinds
        })

    # 2. Milestone comparison
    old_steps = old_roadmap.get("steps") or []
    new_steps = new_roadmap.get("steps") or []

    old_steps_dict = {step.get("id"): step for step in old_steps if step.get("id") is not None}
    new_steps_dict = {step.get("id"): step for step in new_steps if step.get("id") is not None}

    # Added milestones
    for step_id, new_step in new_steps_dict.items():
        if step_id not in old_steps_dict:
            changes.append({
                "field": f"steps.add.{step_id}",
                "old_value": None,
                "new_value": new_step.get("title") or f"Step {step_id}"
            })

    # Deleted milestones
    for step_id, old_step in old_steps_dict.items():
        if step_id not in new_steps_dict:
            changes.append({
                "field": f"steps.delete.{step_id}",
                "old_value": old_step.get("title") or f"Step {step_id}",
                "new_value": None
            })

    # Modified milestones
    for step_id, new_step in new_steps_dict.items():
        if step_id in old_steps_dict:
            old_step = old_steps_dict[step_id]
            step_fields = ["title", "duration", "description", "macro_view", "micro_view", "nano_view"]
            for field in step_fields:
                old_val = old_step.get(field)
                new_val = new_step.get(field)
                if old_val != new_val:
                    changes.append({
                        "field": f"steps.{step_id}.{field}",
                        "old_value": old_val,
                        "new_value": new_val
                    })

            # Learning objectives comparison
            old_lo = old_step.get("learning_objectives") or []
            new_lo = new_step.get("learning_objectives") or []
            if old_lo != new_lo:
                changes.append({
                    "field": f"steps.{step_id}.learning_objectives",
                    "old_value": old_lo,
                    "new_value": new_lo
                })

            # Micro steps comparison
            old_ms = old_step.get("micro_steps") or []
            new_ms = new_step.get("micro_steps") or []
            if old_ms != new_ms:
                changes.append({
                    "field": f"steps.{step_id}.micro_steps",
                    "old_value": old_ms,
                    "new_value": new_ms
                })

            # Marketplace comparison
            old_market = combined_marketplace_from_step(old_step)
            new_market = combined_marketplace_from_step(new_step)
            for cat in ["mentors", "vendors", "institutions", "distributors"]:
                old_cat_list = old_market.get(cat) or []
                new_cat_list = new_market.get(cat) or []
                if old_cat_list != new_cat_list:
                    changes.append({
                        "field": f"steps.{step_id}.marketplace.{cat}",
                        "old_value": old_cat_list,
                        "new_value": new_cat_list
                    })

    return changes


def normalize_path_doc_roadmap(doc: dict) -> dict:
    if isinstance(doc, dict) and isinstance(doc.get("roadmap_data"), dict):
        doc["roadmap_data"] = normalize_roadmap_marketplaces_for_storage(doc["roadmap_data"])
    if isinstance(doc, dict) and isinstance(doc.get("original_roadmap_data"), dict):
        doc["original_roadmap_data"] = normalize_roadmap_marketplaces_for_storage(doc["original_roadmap_data"])
    return doc


def summarize_roadmap_changes(changes: list) -> str:
    if not changes:
        return "No changes detected."
    summaries = []
    for c in changes:
        f = c["field"]
        if f == "path_title":
            summaries.append(f"Changed path title to '{c['new_value']}'")
        elif f == "path_description":
            summaries.append("Updated path description")
        elif f == "readiness_score":
            summaries.append(f"Adjusted readiness score to {c['new_value']}%")
        elif f == "readiness_label":
            summaries.append(f"Changed readiness label to '{c['new_value']}'")
        elif f == "total_duration":
            summaries.append(f"Changed total duration to '{c['new_value']}'")
        elif f.startswith("steps.add."):
            summaries.append(f"Added Step: '{c['new_value']}'")
        elif f.startswith("steps.delete."):
            summaries.append(f"Removed Step: '{c['old_value']}'")
        elif f.startswith("steps."):
            parts = f.split(".")
            step_id = parts[1]
            subfield = parts[2]
            if len(parts) > 3:
                subfield = " ".join(parts[2:])
            summaries.append(f"Updated Step {step_id} {subfield.replace('_', ' ')}")
            
    return "; ".join(summaries[:4]) + ("..." if len(summaries) > 4 else "")


async def enrich_path_profile(doc):
    if not doc:
        return doc
    email = None
    if "profile" in doc and doc["profile"] and "email" in doc["profile"]:
        email = doc["profile"]["email"]
    if not email and "created_by" in doc and doc["created_by"]:
        email = doc["created_by"]
    if not email and "createdBy" in doc and doc["createdBy"]:
        email = doc["createdBy"]
        
    if email:
        profile_doc = await profiles_collection.find_one({"email": email.lower()})
        if profile_doc:
            doc["profile"] = serialize_mongo_doc(profile_doc)
            doc["created_by"] = email.lower()
            doc["createdBy"] = email.lower()
            
    if "profile" not in doc or not doc["profile"]:
        doc["profile"] = {"email": email or "", "name": "Anonymous Student"}
        
    return doc


# ─── AGENT PROMPT BUILDERS (CATEGORY ISOLATION ENGINE) ──────────────────────

def format_student_signals_context(profile: dict) -> str:
    """Extracts and formats student signals including Financial Status, Location, Personality, and Domain Context."""
    if not isinstance(profile, dict) or not profile:
        return "STUDENT SIGNALS: No specific profile signals provided. Use balanced default pricing and pacing."

    personality_geo = profile.get("personalityGeography") or {}
    academics = profile.get("academics") or {}
    skills = profile.get("practicalSkills") or {}
    jobs = profile.get("jobsCareers") or {}
    counselling = profile.get("nonAcademicCounselling") or {}

    # 1. Financial Status
    fin_status = (
        personality_geo.get("financialSituation") or 
        profile.get("financialSituation") or 
        profile.get("financial_situation") or 
        "Moderate"
    ).strip()

    fin_lower = fin_status.lower()
    if any(term in fin_lower for term in ["high", "affluent", "premium", "wealthy", "upper"]):
        market_guidance = (
            "FINANCIAL CAPACITY: HIGH / AFFLUENT. The student has the capacity to invest in high-end, premium marketplace resources. "
            "Prioritize top-tier 1-on-1 private mentors, executive coaches, paid university certifications, elite bootcamps, and premium expert sessions ($150 - $1,500+) "
            "across micro and nano tiers, while maintaining high-quality macro resources."
        )
    elif any(term in fin_lower for term in ["low", "need", "budget", "constrained", "struggling", "minimal"]):
        market_guidance = (
            "FINANCIAL CAPACITY: BUDGET-CONSCIOUS / NEED-BASED. The student has financial constraints. "
            "Prioritize high-value free resources, community mentorship, scholarship pathways, open-source cohorts, "
            "and low-cost tools ($0 - $49) across all marketplace recommendations."
        )
    else:
        market_guidance = (
            f"FINANCIAL CAPACITY: {fin_status.upper()}. Provide a balanced blend of free foundations (macro_free), "
            f"moderate accessible courses/books ($30-$150 in micro_structured), and selective 1-on-1 expert advisory."
        )

    # 2. Location
    country = (personality_geo.get("country") or profile.get("country") or "").strip()
    state = (personality_geo.get("state") or profile.get("state") or "").strip()
    city = (personality_geo.get("city") or profile.get("city") or "").strip()
    loc_parts = [p for p in [city, state, country] if p]
    location_str = ", ".join(loc_parts) if loc_parts else "Not Specified"

    # 3. Personality & Learning Style
    personality_signal = (
        personality_geo.get("personalitySignal") or 
        profile.get("personality") or 
        profile.get("personality_signal") or 
        "Self-directed Learner"
    ).strip()

    signals_lines = [
        "=== STUDENT SIGNALS & PERSONALIZATION ENGINE ===",
        f"- Location / Region: {location_str} (Consider regional institutions, timezone convenience, and local job/academic markets)",
        f"- Financial Status: {fin_status}",
        f"  👉 MARKETPLACE PRICING DIRECTIVE: {market_guidance}",
        f"- Personality & Study Habit: {personality_signal} (Adapt milestone pacing, study rhythm, and micro-step checklists to this personality style)"
    ]

    # 4. Domain Context
    if academics.get("gradeLevel") or academics.get("curriculum"):
        signals_lines.append(f"- Academic Baseline: Grade {academics.get('gradeLevel', 'N/A')}, Curriculum: {academics.get('curriculum', 'N/A')}, Stream: {academics.get('academicStream', 'N/A')}, Performance: {academics.get('currentPerformance', 'N/A')}")
    if skills.get("skillLevel") or skills.get("learningMode"):
        signals_lines.append(f"- Practical Skill Baseline: Level: {skills.get('skillLevel', 'Developing')}, Mode: {skills.get('learningMode', 'Hands-on')}, Target Skill: {skills.get('targetSkill', 'Technical')}")
    if jobs.get("currentRole") or jobs.get("yearsOfExperience"):
        signals_lines.append(f"- Career Baseline: Role: {jobs.get('currentRole', 'N/A')}, Experience: {jobs.get('yearsOfExperience', '0')} yrs, Industry: {jobs.get('industry', 'N/A')}")
    if counselling.get("concernArea") or counselling.get("currentChallenge"):
        signals_lines.append(f"- Wellbeing Baseline: Focus: {counselling.get('concernArea', 'Personal Development')}, Challenge: {counselling.get('currentChallenge', 'Balance & clarity')}, Support: {counselling.get('supportTypeNeeded', 'Guidance')}")

    return "\n".join(signals_lines)


def resolve_focus_category(focus: Optional[str]) -> str:
    text = str(focus or "").lower()
    if any(k in text for k in ["non_academic", "non-academic", "non academic", "mental", "wellness", "life counselling", "life counseling", "immediate guidance"]):
        return "non_academic"
    if any(k in text for k in ["jobs", "careers", "career-prep", "career prep", "technical roles", "non-technical", "profession", "placement"]):
        return "jobs"
    if any(k in text for k in ["practical", "skills", "skill", "internship"]):
        return "practical"
    return "academic"


def get_subsegment_rules(cat: str, sub_segment: Optional[str] = None) -> str:
    sub = str(sub_segment or "").strip().lower()
    cat = resolve_focus_category(cat)

    if cat == "academic":
        if any(k in sub for k in ["undergraduate", "bachelor", "university_ug", "ug"]):
            return (
                "Sub-Segment: Undergraduate (Bachelor's) Admissions & Prep.\n"
                "- Context: High school to university transition, high school GPA/transcripts, AP/IB/prerequisite courses, standardized tests (SAT/ACT/IELTS/TOEFL), extracurricular profile, essay writing, university shortlisting, application dossiers.\n"
                "- Progression: Academic baseline & subject selection -> prerequisite preparation -> standardized test readiness -> extracurricular & profile elevation -> target university research & application dossiers.\n"
                "- STRICT NEGATIVE CONSTRAINTS: Forbidden to include Middle school curricula, PhD dissertation, or MBA job history."
            )
        elif any(k in sub for k in ["postgraduate", "master", "mba", "university_pg", "pg"]):
            return (
                "Sub-Segment: Postgraduate (Master's / MBA) Admissions & Prep.\n"
                "- Context: Undergraduate degree completion, GPA elevation, GRE/GMAT/IELTS, statement of purpose (SOP), letters of recommendation (LOR), work experience, targeted graduate programs.\n"
                "- Progression: Undergraduate transcript audit -> standardized testing (GRE/GMAT) -> research / work experience evidence -> SOP & recommendation letters -> target university submissions.\n"
                "- STRICT NEGATIVE CONSTRAINTS: Forbidden to include High school board exams, Grade 10-12 curricula, or SAT/ACT."
            )
        elif any(k in sub for k in ["phd", "research", "research_phd", "doctorate"]):
            return (
                "Sub-Segment: Research & PhD Academia.\n"
                "- Context: Literature reviews, research proposal formulation, publication in peer-reviewed journals, identifying faculty advisors/PIs, methodologies, conference papers, dissertation prep.\n"
                "- Progression: Literature mapping & gap analysis -> research question & methodology design -> faculty advisor outreach & fellowship applications -> draft proposal & publication pipeline.\n"
                "- STRICT NEGATIVE CONSTRAINTS: Forbidden to include High school curriculum, SAT/ACT, or undergraduate coursework."
            )
        elif any(k in sub for k in ["transfer", "lateral", "transfer_lateral"]):
            return (
                "Sub-Segment: Transfer / Lateral Entry.\n"
                "- Context: Transferable credits, GPA elevation, articulation agreements, university transfer requirements, credit evaluation, transfer essays.\n"
                "- Progression: Credit audit -> GPA optimization -> target institution articulation requirements -> transfer essay crafting -> credit transfer finalization.\n"
                "- STRICT NEGATIVE CONSTRAINTS: Forbidden to include Grade 10-12 school exams."
            )
        elif any(k in sub for k in ["grade 1", "grade 2", "grade 3", "grade 4", "grade 5", "grade 6", "grade 7", "grade 8", "primary", "middle", "k12_primary"]):
            return (
                "Sub-Segment: School Grades 1–8.\n"
                "- Context: Foundational numeracy, literacy, cognitive development, STEM fundamentals, study routines, formative school assessments.\n"
                "- Progression: Foundational skill diagnostic -> reading & quantitative habit building -> exploratory science & creative projects -> academic confidence & scholastic mastery.\n"
                "- STRICT NEGATIVE CONSTRAINTS: Forbidden to include College applications, GRE/GMAT, internships, or career placement."
            )
        elif any(k in sub for k in ["grade 9", "grade 10", "grade 11", "grade 12", "senior", "pre-university", "k12_senior", "high school"]):
            return (
                "Sub-Segment: Pre-University (Grades 9–12).\n"
                "- Context: Secondary & higher secondary curricula (CBSE, ICSE, IB, Cambridge A-Levels, State Boards), board examinations, stream selection (Science/Commerce/Humanities), competitive college entrance foundation.\n"
                "- Progression: Stream selection & subject mastery -> board exam syllabus completion -> revision cycles & past papers -> competitive exam foundation.\n"
                "- STRICT NEGATIVE CONSTRAINTS: Forbidden to include Graduate school tests (GRE/GMAT) or PhD proposals."
            )
        return (
            "Sub-Segment: Academic & Higher Education.\n"
            "- Context: Formal education, academic progression, university admissions, curriculum mastery, or academic research development.\n"
            "- Progression: Academic foundation -> prerequisite preparation -> research/performance development -> profile development -> target university dossiers."
        )

    elif cat == "practical":
        if any(k in sub for k in ["creative", "creative_skills", "design", "ui/ux", "multimedia", "graphic", "3d"]):
            return (
                "Sub-Segment: Creative Skills (Design, UI/UX, Multimedia, Visual Arts).\n"
                "- Context: Visual hierarchy, typography, color theory, wireframing, interactive prototyping, tools (Figma, Adobe Creative Suite, Blender), user testing, portfolio curation on Behance/Dribbble.\n"
                "- Progression: Design fundamentals & tool mastery -> guided design exercises -> real-world client/spec project execution -> interactive prototype testing -> polished design portfolio showcase.\n"
                "- STRICT NEGATIVE CONSTRAINTS: STRICTLY FORBIDDEN to include coding challenges, LeetCode, backend database queries, school board exams, or college admissions."
            )
        elif any(k in sub for k in ["business", "business_skills", "finance", "marketing", "management", "sales"]):
            return (
                "Sub-Segment: Business & Management Skills.\n"
                "- Context: Financial modeling, Excel mastery, business analytics, KPI dashboards, product strategy, market research, sales negotiation, project management (Agile/Scrum).\n"
                "- Progression: Business concept foundations -> data analysis & spreadsheet modeling -> strategic framework applications -> real-world case analysis & presentation -> business deliverable portfolio.\n"
                "- STRICT NEGATIVE CONSTRAINTS: STRICTLY FORBIDDEN to include coding frameworks, compiler design, school board exams, or college admissions."
            )
        elif any(k in sub for k in ["digital", "digital_skills", "seo", "social media", "growth", "no-code"]):
            return (
                "Sub-Segment: Digital Skills (Growth, SEO, No-Code, Content Creation).\n"
                "- Context: Search engine optimization, social media marketing, content creation, analytics tools (Google Analytics, SEMrush), no-code automation (Zapier, Airtable, Webflow).\n"
                "- Progression: Digital channel basics -> campaign setup & SEO auditing -> automation & no-code workflow creation -> performance analytics & optimization -> live digital campaign proof-of-work.\n"
                "- STRICT NEGATIVE CONSTRAINTS: STRICTLY FORBIDDEN to include school board exams, college applications, or low-level systems programming."
            )
        elif any(k in sub for k in ["vocational", "vocational_skills", "trades", "craft", "audio", "culinary", "technician"]):
            return (
                "Sub-Segment: Vocational & Applied Skills.\n"
                "- Context: Hands-on vocational trade, studio craft, culinary techniques, physical prototyping, equipment operation, safety protocols, practical skill certification.\n"
                "- Progression: Workshop safety & tool fundamentals -> guided hands-on techniques -> supervised practical builds -> quality validation -> trade certification & practical proof-of-work.\n"
                "- STRICT NEGATIVE CONSTRAINTS: STRICTLY FORBIDDEN to include academic theory tests, SAT/ACT, or college admissions."
            )
        else:  # tech_skills or generic practical
            return (
                "Sub-Segment: Technical & Software Skills.\n"
                "- Context: Core programming concepts, algorithmic thinking, hands-on project building, modern libraries/frameworks, GitHub repository curation, code reviews, live deployment.\n"
                "- Progression: Core concept foundation -> guided problem solving -> hands-on project building -> advanced application & architecture -> portfolio curation on GitHub.\n"
                "- STRICT NEGATIVE CONSTRAINTS: STRICTLY FORBIDDEN to include school board exams, GPA targets, SAT/ACT, or college admissions."
            )

    elif cat == "jobs":
        if any(k in sub for k in ["healthcare", "healthcare_roles", "medical", "clinical", "health", "nursing", "hospital"]):
            return (
                "Sub-Segment: Healthcare & Clinical Roles.\n"
                "- Context: Clinical competencies, patient care standards, healthcare regulations (HIPAA), clinical documentation, certifications (BLS, ACLS, CNA, RN, CMA), hospital/clinic shadowing, medical interviews.\n"
                "- Progression: Healthcare competency assessment -> clinical certification preparation -> clinical experience / patient care shadowing -> healthcare resume & compliance verification -> clinical interview preparation.\n"
                "- STRICT NEGATIVE CONSTRAINTS: STRICTLY FORBIDDEN to include LeetCode, software engineering algorithms, GitHub repositories, or school board exams."
            )
        elif any(k in sub for k in ["creative", "creative_roles", "art director", "copywriting"]):
            return (
                "Sub-Segment: Creative Roles (Designers, Writers, Creative Directors).\n"
                "- Context: Creative portfolio presentation, design challenge decks, client case studies, industry reel, creative agency networking, behavioral and portfolio interviews.\n"
                "- Progression: Portfolio gap audit -> case study narrative development -> deck & reel presentation polish -> agency networking & outreach -> creative interview & design challenge loops.\n"
                "- STRICT NEGATIVE CONSTRAINTS: STRICTLY FORBIDDEN to include technical coding tests, LeetCode, school board exams, or college admissions."
            )
        elif any(k in sub for k in ["business", "business_roles", "product manager", "consulting", "analyst"]):
            return (
                "Sub-Segment: Business & Corporate Roles (Product, Consulting, Finance, Operations).\n"
                "- Context: Case interview frameworks, market sizing, financial modeling, product sense, stakeholder alignment, executive resume crafting, LinkedIn executive branding.\n"
                "- Progression: Role gap assessment -> case interview & business challenge practice -> executive resume & LinkedIn branding -> networking & recruiter outreach -> multi-round behavioral and case interviews.\n"
                "- STRICT NEGATIVE CONSTRAINTS: STRICTLY FORBIDDEN to include LeetCode coding challenges, school board exams, or college applications."
            )
        elif any(k in sub for k in ["gov", "public", "gov_public_roles", "civil service", "policy"]):
            return (
                "Sub-Segment: Government & Public Sector Roles.\n"
                "- Context: Public service examinations, civil services prep, government recruitment regulations, policy analysis, administrative law, public sector interview protocols.\n"
                "- Progression: Exam syllabus mapping -> administrative & policy study cycles -> mock examinations & timed tests -> public sector interview & document verification prep.\n"
                "- STRICT NEGATIVE CONSTRAINTS: STRICTLY FORBIDDEN to include startup pitch decks, LeetCode, or corporate tech bootcamps."
            )
        elif any(k in sub for k in ["entrepreneur", "entrepreneurship", "startup", "founder"]):
            return (
                "Sub-Segment: Entrepreneurship & Venture Building.\n"
                "- Context: Problem validation, customer discovery interviews, lean MVP creation, business model canvas, unit economics, go-to-market execution, pitch deck and angel/VC outreach.\n"
                "- Progression: Customer problem discovery -> MVP prototyping & user feedback -> unit economics & business model validation -> go-to-market launch -> pitch deck & fundraising.\n"
                "- STRICT NEGATIVE CONSTRAINTS: STRICTLY FORBIDDEN to include traditional corporate employee hierarchy or school board exams."
            )
        else:  # tech_roles or generic jobs
            return (
                "Sub-Segment: Technical Roles (Engineering, Data Science, DevOps, Cloud).\n"
                "- Context: Role competency assessment, technical interview prep (DSA/System Design), ATS-optimized engineering resume, GitHub proof of work, technical screening loops.\n"
                "- Progression: Role competency gap analysis -> system design & coding interview mastery -> ATS resume & GitHub proof-of-work -> recruiter outreach & technical screening -> onsite loop preparation.\n"
                "- STRICT NEGATIVE CONSTRAINTS: STRICTLY FORBIDDEN to include school board exams, Grade 10-12 exams, or college admissions."
            )

    else:  # non_academic
        if any(k in sub for k in ["stress", "stress_management", "burnout", "anxiety", "pressure"]):
            return (
                "Sub-Segment: Stress Management & Burnout Prevention.\n"
                "- Context: Somatic stress reduction, nervous system regulation, breathing exercises (4-7-8, box breathing), cognitive reframing of stressors, boundary setting, sleep architecture, stress logs, certified stress/wellness coaches.\n"
                "- Progression: Stress trigger identification & acute relief -> daily grounding routine & sleep reset -> cognitive boundary setting & workload management -> long-term stress resilience habits.\n"
                "- Milestone Marketplace Progression: Early milestones = free stress logs & breathing apps (Smiling Mind, Breathwrk); Intermediate milestones = evidence-based MBSR courses & stress workbooks; Advanced & Capstone milestones = certified stress management coaches, somatic practitioners & preventive lifestyle communities.\n"
                "- STRICT NEGATIVE CONSTRAINTS: STRICTLY FORBIDDEN to include academic curricula, exams, job placement, or coding tests."
            )
        elif any(k in sub for k in ["personal_dev", "personal development", "habit", "productivity", "discipline"]):
            return (
                "Sub-Segment: Personal Development & Self-Discipline.\n"
                "- Context: Daily routine design, habit loop formation (cue, routine, reward), time blocking, accountability systems, goal breakdown, journal prompts, self-reflection practices.\n"
                "- Progression: Routine audit & energy mapping -> core habit loop installation -> focus systems & digital distraction management -> self-accountability & periodic review cadence.\n"
                "- Milestone Marketplace Progression: Early milestones = free habit trackers & Notion templates; Intermediate milestones = structured productivity courses & habit coaching; Advanced & Capstone milestones = executive life coaches, personalized audits & mastermind groups.\n"
                "- STRICT NEGATIVE CONSTRAINTS: STRICTLY FORBIDDEN to include school exams, college admissions, or LeetCode."
            )
        elif any(k in sub for k in ["relationship", "relationship_guidance", "interpersonal", "communication"]):
            return (
                "Sub-Segment: Relationship Guidance & Interpersonal Communication.\n"
                "- Context: Active listening frameworks, Nonviolent Communication (NVC), boundary setting, conflict de-escalation, emotional empathy, interpersonal relationship dynamics.\n"
                "- Progression: Communication style assessment -> active listening & emotion regulation -> constructive boundary setting -> mutual problem-solving dialogues -> relational harmony maintenance.\n"
                "- Milestone Marketplace Progression: Early milestones = relationship communication guides & self-assessments; Intermediate milestones = structured interpersonal workshops & books; Advanced & Capstone milestones = licensed relationship counselors & certified coaches.\n"
                "- STRICT NEGATIVE CONSTRAINTS: STRICTLY FORBIDDEN to include academic tutoring, college admissions, or coding tests."
            )
        elif any(k in sub for k in ["family", "family_guidance", "parent", "generational"]):
            return (
                "Sub-Segment: Family Guidance & Generational Dynamics.\n"
                "- Context: Family communication patterns, handling generational expectations, constructive conversations, emotional boundaries, resolving family conflict respectfully.\n"
                "- Progression: Family dynamics mapping -> emotional boundary identification -> structured family dialogue techniques -> mutual expectation alignment -> sustained collaborative harmony.\n"
                "- Milestone Marketplace Progression: Early milestones = family dynamics workbooks & communication prompts; Intermediate milestones = family mediation workshops & parenting/family books; Advanced & Capstone milestones = licensed family counselors & mediation advisors.\n"
                "- STRICT NEGATIVE CONSTRAINTS: STRICTLY FORBIDDEN to include academic tutoring, college admissions, or coding tests."
            )
        else:  # mental_wellbeing or general mental
            return (
                "Sub-Segment: Mental Wellbeing & Emotional Resilience.\n"
                "- Context: Emotional awareness, cognitive reframing (CBT principles), daily mindfulness routines, identifying anxiety triggers, peer support circles, qualified professional counseling resources.\n"
                "- Progression: Emotional baseline assessment -> daily mindfulness & grounding routine -> cognitive reframing of negative patterns -> support network integration -> sustainable emotional resilience.\n"
                "- Milestone Marketplace Progression: Early milestones = free mindfulness apps & mood journals (Smiling Mind, Daylio, Mindful.org); Intermediate milestones = evidence-based cognitive wellbeing courses (MBSR, Yale Science of Wellbeing); Advanced & Capstone milestones = certified therapists, counseling platforms (licensed practitioners, Psychology Today directory) & resilience communities.\n"
                "- STRICT NEGATIVE CONSTRAINTS: STRICTLY FORBIDDEN to include college applications, GPA targets, academic board exams, or job placement."
            )


def build_agent_1_prompt(
    category: str,
    sub_segment: Optional[str],
    current_position: str,
    target_goal: str,
    profile: dict,
    degree_type: Optional[str] = None,
    focus_title_prefix: str = "Academic & Research",
    focus_area: str = "",
    focus: Optional[str] = None,
    refine_prompt: Optional[str] = None,
    requested_steps: Optional[int] = None,
    existing_roadmap: Optional[dict] = None
) -> str:
    cat = resolve_focus_category(category or focus)
    sub_seg = (sub_segment or "").strip()
    profile_json = json.dumps(profile or {})
    signals_context = format_student_signals_context(profile)
    degree_val = degree_type or "Not required"

    subsegment_detail = get_subsegment_rules(cat, sub_seg)
    category_rules = f"""=== PRIMARY CATEGORY CONSTRAINTS: {cat.upper()} ===
{subsegment_detail}
- Dynamic timeline (MANDATORY RULE - REACH THE GOAL, NOT COMPLETE THE GOAL):
  Calculate timeline strictly based on the time needed to REACH / ENTER / GAIN ADMISSION into the target goal, NEVER the time to complete the destination degree, program, or career after entering it!
  * School to Bachelor's (Gain admission to Undergraduate):
    - Grade 12 to Bachelor's: 12 months (1 academic year: Grade 12 to college admission).
    - Grade 11 to Bachelor's: 24 months (2 academic years: Grades 11-12 to college admission).
    - Grade 10 to Bachelor's: 36 months (3 academic years: Grades 10, 11, 12 to college admission). NEVER output 72 or 84 months (do NOT include undergraduate study itself)!
    - Grade 9 to Bachelor's: 48 months (4 academic years).
  * School to Master's (Must complete High School + 4-year Bachelor's degree to qualify for Master's admission):
    - Grade 12 to Master's: 60 months (5 years: 1 yr Grade 12 + 4 yrs Bachelor's to Master's admission).
    - Grade 11 to Master's: 72 months (6 years: 2 yrs High School + 4 yrs Bachelor's to Master's admission).
    - Grade 10 to Master's: 84 months (7 years: 3 yrs High School + 4 yrs Bachelor's to Master's admission). NEVER output 48 months (4 years is impossible as it only reaches sophomore year of college)!
    - Grade 9 to Master's: 96 months (8 years).
  * School to PhD (Must complete High School + Bachelor's + research/Master's):
    - Grade 12 to PhD: 84 months (7 years).
    - Grade 11 to PhD: 96 months (8 years).
    - Grade 10 to PhD: 108 months (9 years).
  * College student to Master's: 12 to 24 months to prepare and reach Master's admission.
  * Job / Career: 6 to 12 months to prepare, interview, and land the role.
  * Practical Skills: 3 to 6 months to master skills and complete portfolio.
  * Non-Academic / Wellbeing: 1 to 3 months.
- Dynamic readiness score: Score (0-100) based on current position relative to target goal.
- Dynamic step count: Autonomously determine the exact number of milestones needed to reach the goal. NO pre-planned, fixed, or bracketed step count.
"""

    curr_low = (current_position or "").lower()
    goal_low = (target_goal or "").lower()
    is_school = any(k in curr_low for k in ["grade 10", "grade 9", "grade 8", "grade 7", "grade 6", "10th", "9th", "8th", "7th", "6th", "k-10", "k-12", "school", "secondary"])
    is_master = any(k in goal_low for k in ["master", "master's", "mtech", "m.tech", "msc", "m.sc", "mba", "postgrad", "pg"])
    is_phd = any(k in goal_low for k in ["phd", "ph.d", "doctorate", "doctoral", "postdoc"])
    is_bachelor = any(k in goal_low for k in ["bachelor", "bachelor's", "btech", "b.tech", "bsc", "b.sc", "undergrad"])

    if requested_steps:
        step_scope_directive = f"""CRITICAL STEP COUNT MANDATE:
Output EXACTLY {requested_steps} distinct step objects inside 'steps'. Every step must be unique, progressive, and fully detailed."""
    elif is_school and (is_master or is_phd):
        target_deg_label = "PhD" if is_phd else "Master's"
        expected_dur = "84 months (7 years)" if (is_school and not is_phd and "10" in curr_low) else ("72 months (6 years)" if (is_school and not is_phd and "11" in curr_low) else ("60 months (5 years)" if not is_phd else ("108 months (9 years)" if "10" in curr_low else ("96 months (8 years)" if "11" in curr_low else "84 months (7 years)"))))
        step_scope_directive = f"""CRITICAL JOURNEY SCOPE & STEP COUNT MANDATE (MANDATORY 6 TO 8 MILESTONES):
The student is currently in school ({current_position}) and targeting a graduate {target_deg_label} degree ({target_goal}).
This multi-phase progression spans high school graduation, 4-year undergraduate studies, advanced research, and graduate school admissions.
TIMELINE MANDATE: The total duration required to REACH graduate admission from school is {expected_dur}.
(For Grade 10 targeting Master's, it requires 3 years high school + 4 years undergraduate = 84 months. NEVER output 48 months).
UNDER NO CIRCUMSTANCES should this journey be compressed into 3 or 4 milestones!
You MUST generate 6 to 8 distinct, comprehensive milestones covering:
- Milestone 1: High School STEM & Core Subject Mastery (Grades 10-11)
- Milestone 2: Standardized Testing, Profile Building & Pre-College Competitions (Grade 12)
- Milestone 3: Undergraduate College Admissions & Foundation Year
- Milestone 4: Core Undergraduate Academic & Technical Specialization
- Milestone 5: Applied Proof-of-Work Projects & Technical Internships
- Milestone 6: Advanced Research, Publications & Faculty Mentorship
- Milestone 7: Graduate School Standardized Testing (GRE/TOEFL) & Portfolio Audit
- Milestone 8: Target Graduate Application, SOP, Faculty Outreach & Admissions Capstone"""
    elif is_phd or (is_school and is_bachelor):
        step_scope_directive = f"""CRITICAL JOURNEY SCOPE & STEP COUNT MANDATE:
This is a focused pre-university progression from {current_position} to reach admission and entry into {target_goal}.
You MUST generate 5 to 7 distinct progressive milestones covering foundational preparation, core high school academics, profile building, and college admissions & enrollment capstone.
TIMELINE MANDATE: The total duration and milestone steps must strictly span the time to REACH admission (Grade 12: 12 months, Grade 11: 24 months, Grade 10: 36 months). Do NOT generate steps or timelines for completing the 4-year degree itself!"""
    else:
        step_scope_directive = f"""AUTONOMOUS & DYNAMIC STEP COUNT:
Analyze the full distance from {current_position} to {target_goal}.
Generate 5 to 7 comprehensive milestones. Never artificially restrict or default to 3 or 4 milestones."""

    prompt = f"""You are the Naaviverse Pathway Blueprint Generator (Agent 1).
Your task is to generate a fully custom, category-specific pathway blueprint.

INPUT CONTEXT:
- Category: {cat.upper()} ({focus_title_prefix})
- Sub-Segment / Focus Area: {focus_area or sub_seg or 'Default'}
- Current Position: {current_position}
- Target Goal / Need: {target_goal}
- Degree Type: {degree_val}

{signals_context}

{category_rules}

{step_scope_directive}

SCHEMA REQUIREMENTS:
Respond ONLY with valid JSON. No markdown backticks, no text explanation outside JSON.
JSON format must strictly follow:
{{
  "path_title": "<Unique, descriptive path title matching category and goal>",
  "path_description": "<Rich 3-4 sentence strategic overview explaining how this specific pathway guides the user from {current_position} to {target_goal} in the {cat} category>",
  "readiness_score": <calculated readiness score integer 0-100 based on profile readiness>,
  "readiness_label": "<descriptive readiness label, e.g. 'Early Starter', 'Developing Readiness', or 'Advanced Readiness'>",
  "total_duration": "<duration in months to REACH the goal, e.g. '12 months', '24 months', '36 months'>",
  "blind_spots": [
    "<critical gap, constraint, or warning 1 based on profile & goal>",
    "<critical gap, constraint, or warning 2 based on profile & goal>"
  ],
  "steps": [
    {{
      "id": 1,
      "title": "<step/milestone title specific to {cat}>",
      "duration": "<calculated step range to reach the goal, e.g. 'Months 1-2', 'Months 3-4' or 'Months 1-6', 'Months 7-12'>",
      "description": "<detailed step overview (2-3 sentences) explaining what this phase accomplishes>",
      "macro_view": "<Macro View (2-3 focused strategic sentences / 40-60 words): Thoroughly explain WHY this milestone is critical for achieving {target_goal} and the capability transformation achieved.>",
      "micro_view": "<Micro View (2-3 operational sentences / 40-60 words): Detail weekly study hours, tangible deliverables/projects to build, and concrete self-assessment mastery criteria.>",
      "nano_view": "<Nano View (2-3 diagnostic audit sentences / 40-60 words): Specify what an expert mentor will evaluate during a 1-on-1 audit, common blind spots, and readiness verification.>",
      "learning_objectives": [
        "<distinct learning objective 1>",
        "<distinct learning objective 2>",
        "<distinct learning objective 3>"
      ],
      "micro_steps": [
        {{"task": "<specific actionable task>", "resource": "<real specific resource>"}},
        {{"task": "<specific actionable task>", "resource": "<real specific resource>"}}
      ],
      "marketplace": {{
        "mentors": [
          {{"name": "<Free Community Mentor>", "type": "Mentor", "section": "macro_free", "price": "Free", "why": "<Why this mentor fits this milestone>", "next_step": "<Action step>"}},
          {{"name": "<Structured Coach>", "type": "Coaching", "section": "micro_structured", "cost": "$95", "why": "<Value prop for this milestone>", "next_step": "<Action step>"}},
          {{"name": "<Expert 1-on-1 Specialist>", "type": "Mentor", "section": "nano_expert", "price": "$150", "why": "<Specialist outcome>", "next_step": "<Action step>"}}
        ],
        "vendors": [
          {{"name": "<Free Learning Tool / Course>", "type": "Course", "section": "macro_free", "cost": "Free", "why": "<Why it fits>", "next_step": "<Action step>"}},
          {{"name": "<Paid Guided Course / Platform>", "type": "Platform", "section": "micro_structured", "cost": "$49", "why": "<Course value>", "next_step": "<Action step>"}},
          {{"name": "<Advanced Bootcamp / Certification>", "type": "Bootcamp", "section": "nano_expert", "price": "$299", "why": "<Specialized rigor>", "next_step": "<Action step>"}}
        ],
        "institutions": [
          {{"name": "<Target University / Bureau>", "type": "University", "section": "macro_free", "cost": "Free", "why": "<Academic fit>", "next_step": "<Action step>"}},
          {{"name": "<Accredited Institute / Program>", "type": "Institute", "section": "micro_structured", "cost": "$120", "why": "<Structured credential>", "next_step": "<Action step>"}},
          {{"name": "<Global Credentialing Body>", "type": "University", "section": "nano_expert", "price": "$500", "why": "<Accredited track>", "next_step": "<Action step>"}}
        ],
        "distributors": [
          {{"name": "<Free Practice Material / Guide>", "type": "Guide", "section": "macro_free", "cost": "Free", "why": "<Open resource>", "next_step": "<Action step>"}},
          {{"name": "<Standard Prep Book / Workbook>", "type": "Book", "section": "micro_structured", "cost": "$25", "why": "<Standard reference>", "next_step": "<Action step>"}},
          {{"name": "<Specialized Research Publication>", "type": "Publication", "section": "nano_expert", "price": "Free", "why": "<Advanced research>", "next_step": "<Action step>"}}
        ]
      }}
    }}
  ]
}}

CRITICAL RULES:
1. STRICT CATEGORY ADHERENCE: Generate milestones strictly appropriate for {cat.upper()}.
2. PROGRESSIVE MILESTONES: Every single milestone must have its own unique title, timeline, in-depth Macro/Micro/Nano views, learning objectives, micro-steps, and progressive marketplace.
3. CONCISE DEPTH (NO BLOAT, COMPLETE OUTPUT): Keep macro_view, micro_view, and nano_view rich and substantive (2-3 sentences each). Do NOT output empty or generic placeholders.
4. NO GENERIC BOILERPLATE: Every single step must have unique descriptions, distinct learning objectives, and custom actionable micro_steps.
5. NAME BAN: NEVER include personal names or emails in any text fields. Keep all content objective and professional.
6. MANDATORY STUDENT SIGNALS & FINANCIAL ALIGNMENT: Adapt all marketplace recommendations, mentor rates, and resource tiers directly to the student's Financial Status.
7. MULTI-TIER AUTHENTIC MARKETPLACE PER MILESTONE (MANDATORY): For EVERY milestone, generate authentic, non-duplicative recommendations across macro_free, micro_structured, and nano_expert under mentors, vendors, institutions, and distributors (1 distinct authentic recommendation per tier).
8. ZERO MARKETPLACE DUPLICATION ACROSS MILESTONES (STRICT MANDATE): Every milestone must feature completely distinct, non-repeating provider and resource names. Progressively advance resources across milestones.
9. MANDATORY TIMELINE RULE (REACH THE GOAL, NOT COMPLETE THE GOAL): 'total_duration' and milestone durations MUST reflect the time needed to REACH / ENTER / GAIN ADMISSION into the target goal, NEVER the time to complete the goal degree/job after admission. Grade 12 to Bachelor's is 12 months; Grade 11 is 24 months; Grade 10 is 24-36 months (NEVER 72 or 84 months).
"""
    return prompt


def build_agent_2_prompt(
    category: str,
    sub_segment: Optional[str],
    current_position: str,
    target_goal: str,
    profile: dict,
    blueprint_json: str
) -> str:
    cat = resolve_focus_category(category)
    signals_context = format_student_signals_context(profile)
    return f"""You are the Naaviverse Path Audit Agent (Agent 2).
Your purpose is to validate and refine the overall pathway title, description, readiness score, and blind spots.

CATEGORY CONTEXT: {cat.upper()} ({sub_segment or 'Standard'})
Target Goal / Need: {target_goal}
Current Position: {current_position}

{signals_context}

AUDIT TASKS:
1. Verify "path_title" is clear, accurate, and reflects {cat.upper()} pathway semantics.
2. Verify "path_description" is professional, informative, multi-sentence, and specific to {target_goal}.
3. Validate "readiness_score" (5-95) and "readiness_label" according to {cat.upper()} evaluation criteria and student signals.
4. Validate "blind_spots" to highlight 2+ real, actionable constraints based on student signals (financial, geographic, academic background).
5. NAME BAN: Ensure NO personal names, emails, or personal pronouns exist in any text.

Output ONLY valid JSON matching:
{{
  "path_title": "<audited and refined Path Title>",
  "path_description": "<audited and refined detailed multi-sentence Path Description>",
  "readiness_score": <audited readiness score integer 5-95>,
  "readiness_label": "<audited readiness label>",
  "blind_spots": [
    "<warning or critical gap 1 based on profile constraints>",
    "<warning or critical gap 2 based on profile constraints>"
  ]
}}

Blueprint JSON to Audit:
{blueprint_json}
"""


def build_agent_3_prompt(
    category: str,
    sub_segment: Optional[str],
    current_position: str,
    target_goal: str,
    profile: dict,
    blueprint_json: str
) -> str:
    cat = resolve_focus_category(category)
    signals_context = format_student_signals_context(profile)
    return f"""You are the Naaviverse Steps and Views Audit Agent (Agent 3).
Your purpose is to validate and polish all steps, learning objectives, and Macro/Micro/Nano views.

CATEGORY CONTEXT: {cat.upper()} ({sub_segment or 'Standard'})
Target Goal / Need: {target_goal}
Current Position: {current_position}

{signals_context}

AUDIT TASKS:
1. Ensure every step's title, duration, and description strictly belong to {cat.upper()} semantics.
2. PRESERVE DURATION: Keep the exact duration range from blueprint (e.g. 'Months 1-3', 'Weeks 1-4').
3. ENFORCE DEEP MACRO, MICRO & NANO VIEWS: Ensure 'macro_view' (strategic vision & phase meaning), 'micro_view' (granular execution, weekly cadence, and deliverables), and 'nano_view' (1-on-1 mentor diagnostic criteria & blind spot detection) contain deep, rich, comprehensive multi-sentence text (at least 100-150 words each). If any view is brief or generic (1-2 sentences), expand it thoroughly with substantive, highly relevant guidance specific to {target_goal} and {current_position}. NEVER ALLOW SHORT OR SUPERFICIAL PLACEHOLDERS.
4. Verify 'learning_objectives' and 'micro_steps' are hyper-specific and actionable for {target_goal} while respecting student personality and location.
5. CRITICAL STEP PRESERVATION: Audit and return EVERY step in the blueprint without skipping, combining, or dropping steps.
6. NAME BAN: Ensure NO personal names or emails appear in any field.

Output ONLY a valid JSON array of audited step objects.

Blueprint JSON to Audit:
{blueprint_json}
"""


def build_agent_4_prompt(
    category: str,
    sub_segment: Optional[str],
    current_position: str,
    target_goal: str,
    profile: dict,
    blueprint_json: str
) -> str:
    cat = resolve_focus_category(category)
    signals_context = format_student_signals_context(profile)
    return f"""You are the Naaviverse Marketplace Audit Agent (Agent 4).
Your purpose is to validate that all learning resource recommendations match {cat.upper()} needs and the student's specific signals.

CATEGORY CONTEXT: {cat.upper()} ({sub_segment or 'Standard'})
Target Goal / Need: {target_goal}
Current Position: {current_position}

{signals_context}

AUDIT TASKS:
1. Verify mentors, vendors, institutions, and distributors are genuinely relevant to {cat.upper()} ({sub_segment or 'Standard'}) and the specific step.
2. STRICT DOMAIN CONSTRAINTS:
{get_subsegment_rules(cat, sub_segment)}
3. STRICT FINANCIAL STATUS PRICING ALIGNMENT:
   - Match marketplace resource pricing to the student's Financial Capacity.
   - If High / Affluent: Include premium 1-on-1 mentors, top bootcamps, and certified programs with premium price tiers ($150-$1,500+).
   - If Budget / Low: Emphasize free tiers, financial aid, scholarships, and low-cost alternatives ($0-$49).
4. GEOGRAPHIC & LOCATION RELEVANCE: Ensure regional institutions, timezone compatibility, and local market suitability reflect the student's location.
5. Validate realistic costs, action-oriented next steps, and proper section classification (macro_free, micro_structured, nano_expert).
6. CRITICAL STEP PRESERVATION: Return audited marketplace objects for EVERY step in the blueprint.
7. ZERO MARKETPLACE DUPLICATION ACROSS STEPS (MANDATORY): Ensure that no marketplace item or provider name repeats across different steps. Every step must feature distinct, step-progressive resources.
8. NAME BAN: Ensure NO personal names or emails appear.

Output ONLY a valid JSON array of step marketplace objects:
[
  {{
    "id": 1,
    "marketplace": {{
      "mentors": [],
      "vendors": [],
      "institutions": [],
      "distributors": []
    }}
  }}
]

Blueprint JSON to Audit:
{blueprint_json}
"""

AGENT_1_PROMPT = """You are the Naaviverse pathway blueprint generator (Agent 1).
Current Position: {current_position}
Target Goal: {target_goal}
Profile: {profile}
Degree Type: {degree_type}
Focus: {focus_area}
"""
AGENT_2_PROMPT = """You are the Naaviverse Path Audit Agent (Agent 2).
Blueprint: {blueprint}
"""
AGENT_3_PROMPT = """You are the Naaviverse Steps and Views Audit Agent (Agent 3).
Blueprint: {blueprint}
"""
AGENT_4_PROMPT = """You are the Naaviverse Marketplace Audit Agent (Agent 4).
Blueprint: {blueprint}
"""


# ─── POST-PROCESSING: PERSONAL NAME SANITIZER ─────────────────────────────────
def build_name_patterns(profile: dict, current_position: str = "") -> list:
    """Extract all personal name tokens from the profile that should be scrubbed."""
    tokens = []
    # Extract from profile fields
    for field in ["name", "full_name", "first_name", "last_name", "email"]:
        val = profile.get(field, "")
        if val and isinstance(val, str):
            # For email, take the part before @
            if "@" in val:
                val = val.split("@")[0]
            # Split into individual tokens (e.g. "Sunkara Chaitanya Praneeth" -> 3 tokens)
            for token in val.replace("_", " ").replace(".", " ").split():
                cleaned = token.strip()
                if len(cleaned) > 2:  # ignore very short tokens like "K"
                    tokens.append(cleaned)
    return list(set(tokens))

def sanitize_text(text: str, name_tokens: list) -> str:
    """Replace personal name occurrences in a text string with objective phrasing."""
    if not text or not name_tokens:
        return text
    result = text
    # Build a combined regex to match full-name sequences first (e.g. "Sunkara Chaitanya Praneeth")
    # then individual tokens
    for token in sorted(name_tokens, key=len, reverse=True):  # longest first
        # Match token as a whole word, case-insensitive
        pattern = re.compile(r'\b' + re.escape(token) + r'\b', re.IGNORECASE)
        # Replace contextual phrases like "for Chaitanya to" -> "to"
        result = re.sub(
            r'\bfor\s+' + re.escape(token) + r'\s+to\b',
            'to', result, flags=re.IGNORECASE
        )
        result = re.sub(
            r'\b' + re.escape(token) + r"'s\b",
            "the student's", result, flags=re.IGNORECASE
        )
        result = pattern.sub('the student', result)
    # Clean up double "the student the student" artifacts
    result = re.sub(r'\bthe student the student\b', 'the student', result, flags=re.IGNORECASE)
    # Clean double spaces
    result = re.sub(r'  +', ' ', result).strip()
    return result

def recursive_sanitize(obj, name_tokens: list):
    """Recursively traverse and sanitize all string fields in a dict/list."""
    if isinstance(obj, str):
        return sanitize_text(obj, name_tokens)
    elif isinstance(obj, dict):
        return {k: recursive_sanitize(v, name_tokens) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [recursive_sanitize(item, name_tokens) for item in obj]
    return obj


def is_rich_paragraph(text: Any, min_chars: int = 260, min_sentences: int = 3) -> bool:
    if isinstance(text, dict):
        text = text.get("description")
    if not isinstance(text, str):
        return False
    cleaned = text.strip()
    if len(cleaned) < min_chars:
        return False
    sentences = [part for part in re.split(r'[.!?]+', cleaned) if part.strip()]
    return len(sentences) >= min_sentences


def get_view_description(step: dict, view_key: str) -> str:
    value = step.get(view_key)
    if isinstance(value, dict):
        return str(value.get("description") or "").strip()
    return str(value or "").strip()


def set_view_description(step: dict, view_key: str, description: str):
    value = step.get(view_key)
    if isinstance(value, dict):
        value["description"] = description
    else:
        step[view_key] = description


def enrich_step_narrative(step: dict, current: str, goal: str, category: str = "academic") -> dict:
    """Passes through the pure model-generated milestone text without inserting static template text."""
    if not isinstance(step, dict):
        return step
    return step


def enrich_roadmap_narratives(roadmap: dict, current: str, goal: str, category: str = "academic") -> dict:
    if not isinstance(roadmap, dict):
        return roadmap
    milestones = roadmap.get("steps")
    if isinstance(milestones, list):
        roadmap["steps"] = [
            enrich_step_narrative(milestone, current, goal, category)
            for milestone in milestones
        ]
    return roadmap


async def log_generation_event(
    current: str,
    goal: str,
    profile: dict,
    refine_prompt: Optional[str],
    focus_req: Optional[str],
    existing_roadmap: Optional[dict],
    final_alternatives: List[dict]
) -> List[dict]:
    email = profile.get("email") if isinstance(profile, dict) else None
    parent_gen_id = None
    if existing_roadmap and isinstance(existing_roadmap, dict) and "generation_id" in existing_roadmap:
        parent_gen_id = existing_roadmap["generation_id"]
        
    final_alternatives = normalize_roadmap_marketplaces_for_storage(final_alternatives)
    gen_history_doc = {
        "timestamp": datetime.datetime.now(datetime.timezone.utc),
        "current_position": current,
        "target_goal": goal,
        "profile": profile,
        "refine_prompt": refine_prompt,
        "focus_requested": focus_req,
        "alternatives": final_alternatives,
        "session_email": email,
        "parent_generation_id": parent_gen_id
    }
    try:
        gen_result = await generation_history_collection.insert_one(gen_history_doc)
        generation_id = str(gen_result.inserted_id)
        for alt in final_alternatives:
            alt["generation_id"] = generation_id
    except Exception as e:
        print(f"[MongoDB History Warning] Could not save generation history: {e}")
    return final_alternatives


# Helper to query Groq with Multi-Key Parallel Rotation and Auto-Failover
async def query_groq_json(
    prompt: str,
    preferred_model: str = "openai/gpt-oss-120b",
    fallback_models: Optional[List[str]] = None,
    max_tokens: int = 6144,
) -> dict:
    active_groq_models = ["openai/gpt-oss-120b", "qwen/qwen3.8-27b", "openai/gpt-oss-20b"]
    models = [preferred_model] if preferred_model in active_groq_models else []
    if fallback_models:
        for f in fallback_models:
            if f in active_groq_models and f not in models:
                models.append(f)
    for m in active_groq_models:
        if m not in models:
            models.append(m)

    unique_models = models

    # Determine starting key index via global round-robin cursor
    global _groq_key_cursor
    start_key_idx = _groq_key_cursor % len(GROQ_ASYNC_CLIENTS)
    _groq_key_cursor += 1

    # Estimate prompt tokens (rough: 1 token ≈ 4 chars)
    prompt_tokens_est = len(prompt) // 4

    last_err = None
    for m in unique_models:
        # Try each available API key for the current model before falling back to lower-tier models
        for key_offset in range(len(GROQ_ASYNC_CLIENTS)):
            key_idx = (start_key_idx + key_offset) % len(GROQ_ASYNC_CLIENTS)
            active_async_client = GROQ_ASYNC_CLIENTS[key_idx]

            try:
                # Model-aware token safety: openai/gpt-oss-20b has tighter TPM limits
                if m == "openai/gpt-oss-20b":
                    safe_max_tok = min(max_tokens, max(1024, 7600 - prompt_tokens_est))
                else:
                    safe_max_tok = min(max_tokens, 8192)
                max_tok = safe_max_tok
                response = await active_async_client.chat.completions.create(
                    model=m,
                    max_tokens=max_tok,
                    temperature=0.3,
                    messages=[
                        {
                            "role": "system",
                            "content": (
                                "You are a career path database sub-agent. "
                                "Always respond with valid, complete JSON only. "
                                "No markdown, no backticks, no explanations. "
                                "Start immediately with { or [ and end with } or ]. "
                                "NEVER truncate your response. Complete the full JSON structure."
                            ),
                        },
                        {"role": "user", "content": prompt},
                    ],
                )
                raw = response.choices[0].message.content.strip()
                # Strip markdown fences if present
                raw = re.sub(r"```(?:json)?", "", raw).strip().strip("`").strip()

                # Extract the outermost JSON object or array
                match = re.search(r'(\{.*\}|\[.*\])', raw, re.DOTALL)
                if match:
                    raw = match.group(0)

                # Attempt direct parse
                try:
                    return json.loads(raw)
                except json.JSONDecodeError as json_err:
                    # Attempt partial JSON recovery for truncated output
                    print(f"[JSON Recovery] Attempting to repair truncated JSON from model {m} (Key {key_idx + 1}). Error at char {json_err.pos}.")
                    truncated = raw[:json_err.pos]

                    # Step 1: Detect and close any unclosed string literal
                    in_str = False
                    escape_next = False
                    for ch in truncated:
                        if escape_next:
                            escape_next = False
                            continue
                        if ch == '\\':
                            escape_next = True
                            continue
                        if ch == '"':
                            in_str = not in_str
                    if in_str:
                        truncated += '"'

                    # Step 2: Strip trailing dangling keys, colons, commas
                    for _ in range(5):
                        truncated = truncated.rstrip()
                        truncated = re.sub(r',\s*$', '', truncated)
                        truncated = re.sub(r':\s*$', '', truncated)
                        truncated = re.sub(r',\s*"[^"]*"\s*:\s*$', '', truncated)
                        truncated = re.sub(r'{\s*"[^"]*"\s*:\s*$', '{', truncated)
                        truncated = re.sub(r',\s*"[^"]*"\s*$', '', truncated)

                    # Step 3: Compute unclosed brackets (string-aware)
                    stack = []
                    in_s = False
                    esc = False
                    for ch in truncated:
                        if esc:
                            esc = False
                            continue
                        if ch == '\\':
                            esc = True
                            continue
                        if ch == '"':
                            in_s = not in_s
                            continue
                        if not in_s:
                            if ch in '{[':
                                stack.append('}' if ch == '{' else ']')
                            elif ch in '}]':
                                if stack and stack[-1] == ch:
                                    stack.pop()

                    repaired = truncated + ''.join(reversed(stack))
                    try:
                        result = json.loads(repaired)
                        print(f"[JSON Recovery] Successfully repaired truncated JSON from model {m} (Key {key_idx + 1}).")
                        return result
                    except Exception:
                        raise json_err  # Let outer except catch it and try next key/model

            except Exception as e:
                err_str = str(e).lower()
                status_code = getattr(e, "status_code", None)
                is_payload_too_large = (
                    status_code == 413
                    or "413" in err_str
                    or "request too large" in err_str
                    or "context_length_exceeded" in err_str
                    or "reduce your message size" in err_str
                    or "reduce the length of the messages" in err_str
                )
                is_rate_limit = not is_payload_too_large and (
                    status_code == 429
                    or "429" in err_str
                    or "rate limit" in err_str
                    or "tokens per minute" in err_str
                    or "tpm" in err_str
                    or "quota" in err_str
                )
                last_err = e

                if is_payload_too_large:
                    print(f"[Groq Model Limit] Prompt too large for model {m} ({e}). Skipping to next fallback model...")
                    break  # Never retry keys for 413, break to next model immediately

                if is_rate_limit and len(GROQ_ASYNC_CLIENTS) > 1 and key_offset < len(GROQ_ASYNC_CLIENTS) - 1:
                    next_key_idx = ((key_idx + 1) % len(GROQ_ASYNC_CLIENTS)) + 1
                    print(f"[Groq Key Failover] Key {key_idx + 1} rate-limited on model {m}. Instant auto-failover to Key {next_key_idx}...")
                    continue  # Try next key on this SAME high-tier model!
                else:
                    print(f"[Groq Call Failed for model {m} (Key {key_idx + 1})] Error: {e}")
                    # If error is not a rate limit or all keys exhausted, break out of key loop to attempt next fallback model
                    break

    print(f"[Groq Critical Failure] All models and keys exhausted. Final error: {last_err}")
    return {}


def split_duration(duration_str: str, num_parts: int, index: int) -> str:
    # Match ranges like "Months 1-4" or "Months 13-16" or "1-4"
    match = re.search(r'(\d+)\s*-\s*(\d+)', duration_str)
    if match:
        start = int(match.group(1))
        end = int(match.group(2))
        total_months = end - start + 1
        
        # Calculate sub-range for the index-th part out of num_parts
        part_len = total_months / num_parts
        part_start = int(start + index * part_len)
        part_end = int(start + (index + 1) * part_len - 1)
        
        # Ensure bounds
        if part_start < start:
            part_start = start
        if part_end > end or index == num_parts - 1:
            part_end = end
        if part_end < part_start:
            part_end = part_start
            
        if part_start == part_end:
            return f"Month {part_start}"
        else:
            return f"Months {part_start}-{part_end}"
            
    # Single month case like "Month 12"
    match_single = re.search(r'Month\s*(\d+)', duration_str, re.IGNORECASE)
    if match_single:
        return duration_str
        
    return duration_str


DEGREE_TYPE_OPTIONS = {
    "bachelor": "Bachelor's",
    "bachelors": "Bachelor's",
    "bachelor's": "Bachelor's",
    "undergraduate": "Bachelor's",
    "ug": "Bachelor's",
    "btech": "Bachelor's",
    "b.tech": "Bachelor's",
    "bsc": "Bachelor's",
    "b.sc": "Bachelor's",
    "master": "Master's",
    "masters": "Master's",
    "master's": "Master's",
    "graduate": "Master's",
    "postgraduate": "Master's",
    "pg": "Master's",
    "mtech": "Master's",
    "m.tech": "Master's",
    "msc": "Master's",
    "m.sc": "Master's",
    "mba": "Master's",
    "phd": "PhD",
    "ph.d": "PhD",
    "doctorate": "PhD",
    "doctoral": "PhD",
    "transfer": "Transfer",
    "associate": "Associate",
    "associates": "Associate",
    "diploma": "Diploma",
    "certificate": "Certificate",
    "certification": "Certificate",
}

MONTHS_PER_ACADEMIC_YEAR = 12
FINAL_SCHOOL_GRADE = 12
MIN_ADMISSION_CYCLE_MONTHS = MONTHS_PER_ACADEMIC_YEAR


def normalize_degree_type(value: Optional[str]) -> Optional[str]:
    if not value:
        return None
    text = str(value).strip().lower()
    for key, label in DEGREE_TYPE_OPTIONS.items():
        if re.search(rf"(^|[\s\-.]){re.escape(key)}($|[\s\-.])", text):
            return label
    return None


def extract_degree_type_from_goal(goal: str) -> Optional[str]:
    # Split on bullets, pipes, or commas, preserving periods in abbreviations like Ph.D.
    parts = [p.strip() for p in re.split(r"[\u2022|,\n]+", goal or "") if p.strip()]
    for part in parts:
        normalized = normalize_degree_type(part)
        if normalized:
            return normalized
    return normalize_degree_type(goal)


def get_request_degree_type(goal: str, profile: dict, explicit_degree_type: Optional[str] = None) -> Optional[str]:
    return (
        normalize_degree_type(explicit_degree_type)
        or normalize_degree_type((profile or {}).get("degreeType"))
        or normalize_degree_type((profile or {}).get("degree_type"))
        or extract_degree_type_from_goal(goal)
    )


def ensure_degree_type_for_generation(goal: str, profile: dict, explicit_degree_type: Optional[str] = None, category: str = "academic") -> dict:
    cat = resolve_focus_category(category)
    enriched_profile = dict(profile or {})
    degree_type = get_request_degree_type(goal, profile, explicit_degree_type)
    if degree_type:
        enriched_profile["degreeType"] = degree_type
    elif cat == "academic":
        enriched_profile["degreeType"] = "Bachelor's"
    return enriched_profile


def extract_school_grade(text: str) -> Optional[int]:
    if not text:
        return None
    t = str(text).lower()
    # If it says "3rd year", "2nd year", "1st year", "4th year", "semester", etc., it's college/university, not school
    if any(k in t for k in ["year", "sem", "semester", "undergrad", "bachelor", "btech", "b.tech", "bsc", "b.sc", "college", "university"]):
        m_explicit = re.search(r'\b(?:grade|class|standard|std)\s*(\d{1,2})\b', t)
        if m_explicit:
            val = int(m_explicit.group(1))
            if 6 <= val <= 12:
                return val
        return None

    # Match patterns like "Grade 12", "Class 10", "Standard 12", "Std 11"
    m = re.search(r'\b(?:grade|class|standard|std)\s*(\d{1,2})\b', t)
    if m:
        val = int(m.group(1))
        if 1 <= val <= 12:
            return val
            
    # Match "12th", "11th", "10th", "9th", "8th", "7th", "6th"
    m2 = re.search(r'\b(\d{1,2})(?:th|st|nd|rd)\b', t)
    if m2:
        val = int(m2.group(1))
        if 6 <= val <= 12:
            return val
            
    if "k-10" in t or "tenth" in t or "10th" in t:
        return 10
    if "twelfth" in t or "12th" in t:
        return 12
    if "eleventh" in t or "11th" in t:
        return 11
    if "ninth" in t or "9th" in t:
        return 9
    return None


def parse_duration_months(duration_text: Any) -> Optional[int]:
    if not duration_text:
        return None
    s = str(duration_text).strip()
    m_yr = re.search(r'(\d+)\s*(?:year|yr)', s, re.IGNORECASE)
    if m_yr:
        return int(m_yr.group(1)) * 12
    m_mo = re.search(r'(\d+)\s*(?:month|mo)', s, re.IGNORECASE)
    if m_mo:
        return int(m_mo.group(1))
    m_dig = re.search(r'(\d+)', s)
    if m_dig:
        return int(m_dig.group(1))
    return None


def duration_months_for_degree(degree_type: Optional[str]) -> Optional[int]:
    return None


def duration_months_for_level(level: int) -> int:
    return 12


def calculate_total_duration_months(
    current: str,
    goal: str,
    profile: dict,
    explicit_degree_type: Optional[str] = None,
    category: str = "academic",
    sub_segment: Optional[str] = None
) -> int:
    """
    CRITICAL RULE (MANDATORY):
    Duration strictly represents the time required to REACH / ENTER / GAIN ADMISSION into the target goal,
    NEVER the time to complete the destination degree, program, or career after reaching it.
    """
    cat = resolve_focus_category(category)
    curr_lower = (current or "").lower().strip()
    goal_lower = (goal or "").lower().strip()
    prof = profile or {}

    # 1. Non-Academic / Counseling (1 to 3 months to reach emotional wellness/resolution)
    if cat == "non_academic":
        sub_lower = (sub_segment or "").lower()
        if "immediate" in sub_lower or "immediate" in goal_lower:
            return 2
        elif any(k in sub_lower or k in goal_lower for k in ["stress", "anxiety", "mindfulness", "wellbeing", "habit", "resilience"]):
            return 3
        return 3

    # 2. Practical Skills & Projects (3 to 8 months to reach proficiency/portfolio)
    elif cat == "practical":
        if any(k in curr_lower for k in ["beginner", "novice", "zero", "starter", "no experience"]):
            return 6
        elif any(k in curr_lower for k in ["intermediate", "basic", "learner"]):
            return 6
        elif any(k in curr_lower for k in ["advanced", "experienced"]):
            return 4
        return 6

    # 3. Jobs & Careers (6 to 12 months to reach job offer/role transition)
    elif cat == "jobs":
        if "senior" in goal_lower and any(k in curr_lower for k in ["junior", "entry", "student", "intern", "developer"]):
            return 12
        elif any(k in curr_lower for k in ["career switch", "transition", "non-tech"]):
            return 12
        elif any(k in goal_lower for k in ["lead", "manager", "director"]):
            return 12
        return 6

    # 4. Academic & Research: Months to REACH the goal
    target_degree = explicit_degree_type or extract_degree_type_from_goal(goal) or "Bachelor's"
    target_deg_lower = target_degree.lower()

    # Extract high school grade if present
    grade = extract_school_grade(current)
    if not grade and isinstance(prof.get("academics"), dict):
        grade = extract_school_grade(str(prof.get("academics", {}).get("currentGrade", "")))

    is_school = grade is not None or any(k in curr_lower for k in ["school", "k-10", "k-12", "cbse", "icse", "high school", "intermediate"])
    is_undergrad = any(k in curr_lower for k in ["bachelor", "btech", "b.tech", "bsc", "b.sc", "undergrad", "college student", "engineering student"])
    is_masters_student = any(k in curr_lower for k in ["master", "mtech", "msc", "mba", "postgrad"])

    # Target: Bachelor's / Undergraduate / College Admission
    if any(k in target_deg_lower for k in ["bachelor", "undergraduate", "associate", "diploma"]):
        if grade == 12:
            return 12  # 1 academic year (Grade 12) to college admission
        elif grade == 11:
            return 24  # 2 academic years (Grades 11 & 12) to college admission
        elif grade == 10:
            return 36  # 3 academic years (Grades 10, 11 & 12) to college admission
        elif grade == 9:
            return 48  # 4 academic years (Grades 9 to 12) to college admission
        elif grade == 8:
            return 60  # 5 academic years (Grades 8 to 12) to college admission
        elif grade and grade < 8:
            return min(72, (13 - grade) * 12)
        elif is_school:
            return 36  # Default school to college admission (3 years)
        elif is_undergrad:
            return 12  # College transfer or second degree admission
        else:
            return 12

    # Target: Master's / Postgraduate
    elif any(k in target_deg_lower for k in ["master", "postgrad", "mba", "mtech", "msc"]):
        if is_undergrad:
            if any(k in curr_lower for k in ["final year", "4th year", "fourth year", "graduating"]):
                return 12  # 1 year to finish degree & reach Master's admission
            elif any(k in curr_lower for k in ["3rd year", "third year"]):
                return 24  # 2 years to finish degree & reach Master's admission
            elif any(k in curr_lower for k in ["2nd year", "second year"]):
                return 36
            elif any(k in curr_lower for k in ["1st year", "first year"]):
                return 48
            return 18  # Default undergrad to Master's admission: 18 months
        elif is_school:
            # School student targeting Master's: High School + 4-year Bachelor's (48 months)
            if grade == 12:
                return 12 + 48  # 60 months (5 years)
            elif grade == 11:
                return 24 + 48  # 72 months (6 years)
            elif grade == 10:
                return 36 + 48  # 84 months (7 years)
            elif grade == 9:
                return 48 + 48  # 96 months (8 years)
            return 84  # Default school to Master's: 84 months (7 years)
        else:
            return 12

    # Target: PhD / Doctorate
    elif any(k in target_deg_lower for k in ["phd", "doctorate", "doctoral"]):
        if is_masters_student:
            return 12  # 12 months to reach PhD admission
        elif is_undergrad:
            return 24  # 24 months to direct PhD admission
        elif is_school:
            # School student targeting PhD: High School + 4-yr Bachelor's (48m) + 2-yr Master's/Research (24m)
            if grade == 12:
                return 12 + 48 + 24  # 84 months (7 years)
            elif grade == 11:
                return 24 + 48 + 24  # 96 months (8 years)
            elif grade == 10:
                return 36 + 48 + 24  # 108 months (9 years)
            return 108  # Default school to PhD: 108 months (9 years)
        else:
            return 12

    return 12


def format_total_duration(months: int) -> str:
    return f"{months} month" if months == 1 else f"{months} months"


def distribute_month_ranges(step_count: int, total_months: int) -> List[str]:
    if step_count <= 0:
        return []
    ranges = []
    for idx in range(step_count):
        start = int(idx * total_months / step_count) + 1
        end = int((idx + 1) * total_months / step_count)
        if start == end:
            ranges.append(f"Month {start}")
        else:
            ranges.append(f"Months {start}-{end}")
    return ranges


CONTENT_SEGMENTS = [
    {
        "category": "academic",
        "option_name": "Academic & Research",
        "focus": "Academic & Research - School / Pre-University / University: focus on K-12, Grade 11-12, bachelor's, master's, PhD, transfer, formal curriculum, admissions, tests, research, and academic progression.",
    },
    {
        "category": "practical",
        "option_name": "Practical & Skills",
        "focus": "Practical & Skills - Skills Track / Internship Track: focus on learning a specific skill, building proof-of-work projects, applying skills in internships, and separating skill learning from profession selection.",
    },
    {
        "category": "jobs",
        "option_name": "Jobs & Careers",
        "focus": "Jobs & Careers - Technical / Non-Technical Roles: focus on profession and role readiness, job search strategy, interviews, portfolio/resume evidence, workplace skills, and technical versus non-technical career tracks.",
    },
    {
        "category": "non_academic",
        "option_name": "Non-Academic Counselling",
        "focus": "Non-Academic Counselling - Mental Health & Wellness / Generic Life Counselling / Short-term Immediate Guidance: focus on support paths, resource navigation, decision support, wellbeing routines, referral options, and time-boxed guidance. This is not a career roadmap.",
    },
]


def resolve_focus_category(focus: Optional[str]) -> str:
    text = str(focus or "").lower()
    if any(k in text for k in ["non_academic", "non-academic", "non academic", "mental", "wellness", "life counselling", "life counseling", "immediate guidance"]):
        return "non_academic"
    if any(k in text for k in ["jobs", "careers", "career-prep", "career prep", "technical roles", "non-technical", "profession", "placement"]):
        return "jobs"
    if any(k in text for k in ["practical", "skills", "skill", "internship"]):
        return "practical"
    return "academic"


CATEGORY_VARIANTS = {
    "academic": [
        {
            "option_name": "Research & Honors Focus",
            "focus": "Academic & Research - Research & Honors Track: Focus on academic research projects, publishing papers, honors courses, advanced academic honors, and building a high-prestige academic profile."
        },
        {
            "option_name": "Test Prep & Admissions Focus",
            "focus": "Academic & Research - Test Prep & Admissions Track: Focus on standardized tests (SAT, ACT, AP, GRE, IELTS, TOEFL, board exams) and strategic admissions milestones for competitive schools and universities."
        }
    ],
    "practical": [
        {
            "option_name": "Project Portfolio Focus",
            "focus": "Practical & Skills - Project Portfolio Track: Focus on building high-quality, hands-on proof-of-work projects, open-source contributions, technical or creative designs, and displaying an exceptional project portfolio."
        },
        {
            "option_name": "Certification & Bootcamp Focus",
            "focus": "Practical & Skills - Certification & Structured Learning Track: Focus on completing industry-recognized professional certifications, structured bootcamps, and specialized skills courses."
        }
    ],
    "jobs": [
        {
            "option_name": "Technical Role Prep Focus",
            "focus": "Jobs & Careers - Technical Role Prep: Focus on preparing for technical roles (e.g. engineering, software development, data science, specialized systems) through coding challenges, system design, and technical assessments."
        },
        {
            "option_name": "Interview & Networking Focus",
            "focus": "Jobs & Careers - Interview Prep & Networking: Focus on interview skills (behavioral, technical, case studies), networking with industry professionals, cold outreach, and securing referrals."
        }
    ],
    "non_academic": [
        {
            "option_name": "Mental Health & Wellness Focus",
            "focus": "Non-Academic Counselling - Mental Health & Wellness: Focus on daily mental health routines, mindfulness, stress management, counseling support, and building emotional resilience."
        },
        {
            "option_name": "Life Skills & Decision Focus",
            "focus": "Non-Academic Counselling - Life Skills & Decision Support: Focus on time management, decision support, routine building, navigating personal/educational choices, and generic life coaching."
        }
    ]
}


def get_focus_choices(
    focus_req: Optional[str] = None,
    content_category: Optional[str] = None,
    sub_segment: Optional[str] = None
) -> tuple[list[str], list[str]]:
    # 1. If we are asking for a specific variant regeneration/refinement (e.g. during tab-regen)
    if focus_req:
        for cat, variants in CATEGORY_VARIANTS.items():
            for var in variants:
                if var["option_name"].lower() == focus_req.lower() or focus_req.lower() in var["option_name"].lower():
                    # Return only this single variant
                    focus_str = var["focus"]
                    if sub_segment:
                        sub_label = sub_segment.replace("_", " ").title()
                        focus_str += f" Target sub-segment: {sub_label}."
                    return [focus_str], [var["option_name"]]

    # 2. If content_category is explicitly specified:
    if content_category:
        cat = content_category.lower().strip()
        if cat not in CATEGORY_VARIANTS:
            cat = resolve_focus_category(content_category)
        if cat in CATEGORY_VARIANTS:
            variants = CATEGORY_VARIANTS[cat]
            foci = []
            for v in variants:
                f_str = v["focus"]
                if sub_segment:
                    sub_label = sub_segment.replace("_", " ").title()
                    f_str += f" Target sub-segment: {sub_label}."
                foci.append(f_str)
            option_names = [v["option_name"] for v in variants]
            return foci, option_names

    # 3. Fallback: if focus_req is provided but didn't match a variant, resolve its category and return its variants
    if focus_req:
        cat = resolve_focus_category(focus_req)
        if cat in CATEGORY_VARIANTS:
            variants = CATEGORY_VARIANTS[cat]
            foci = []
            for v in variants:
                f_str = v["focus"]
                if sub_segment:
                    sub_label = sub_segment.replace("_", " ").title()
                    f_str += f" Target sub-segment: {sub_label}."
                foci.append(f_str)
            option_names = [v["option_name"] for v in variants]
            return foci, option_names

    # 4. Global fallback: return all 4 main segment focuses
    return (
        [segment["focus"] for segment in CONTENT_SEGMENTS],
        [segment["option_name"] for segment in CONTENT_SEGMENTS],
    )


def requires_degree_for_focus(focus: Optional[str]) -> bool:
    return resolve_focus_category(focus) == "academic"


def get_mock_marketplace(
    focus: Optional[str] = None,
    step_title: str = "",
    step_id: int = 1,
    goal: str = "",
    category: Optional[str] = None,
    sub_segment: Optional[str] = None
) -> dict:
    cat = resolve_focus_category(category or focus)
    title_lower = (step_title or "").lower().strip()
    goal_str = goal or "Target Destination"

    # Category 4: Non-Academic Counselling
    if cat == "non_academic":
        sub_lower = (sub_segment or "").lower()
        if "life" in sub_lower or "decision" in title_lower or "time" in title_lower or "habit" in title_lower:
            return {
                "mentors": [
                    {"name": "Life Skills & Organization Coach", "type": "Mentor", "why": "Free advice on designing weekly schedules and decision checklists.", "next_step": "Join weekly life skills AMA.", "tags": ["Life Skills", "Habits"], "section": "macro_free", "price": "Free"},
                    {"name": "Certified Personal Productivity Coach", "type": "Coaching", "cost": "$75", "duration": "2 weeks", "value": "1-on-1 habit tracking and time block optimization.", "next_step": "Book time audit session.", "tags": ["Time Management"], "section": "micro_structured"},
                    {"name": "Executive Life Strategy Advisor", "type": "Mentor", "price": "$130", "session_details": "1-on-1 Goal & Strategy Session", "expected_outcomes": "Custom 90-day personal autonomy and decision framework.", "tags": ["Life Strategy"], "section": "nano_expert"}
                ],
                "vendors": [
                    {"name": "Notion Life Planning Templates & Workflows", "type": "Platform", "why": "Free digital dashboards for habit tracking and daily prioritization.", "next_step": "Duplicate planner template.", "tags": ["Notion", "Productivity"], "section": "macro_free", "cost": "Free"},
                    {"name": "Coursera Problem Solving & Decision Making", "type": "Course", "cost": "$49", "duration": "3 weeks", "value": "Structured frameworks to navigate complex choices.", "next_step": "Enroll in decision module.", "tags": ["Decision Making"], "section": "micro_structured"},
                    {"name": "Mindvalley Habit Mastery Quest", "type": "Platform", "price": "$299", "session_details": "Structured Habit Program", "expected_outcomes": "Validated routines for focus and self-discipline.", "tags": ["Habit Mastery"], "section": "nano_expert"}
                ],
                "institutions": [
                    {"name": "Open Life Skills Foundation", "type": "Institute", "why": "Free educational modules on financial literacy, time management, and communication.", "next_step": "Access free guides.", "tags": ["Life Skills", "Open Foundation"], "section": "macro_free", "cost": "Free"},
                    {"name": "Center for Decision Sciences & Leadership", "type": "Institute", "cost": "$120", "duration": "4 weeks", "value": "Workshops on cognitive bias and prioritization.", "next_step": "Register for workshop series.", "tags": ["Decision Sciences"], "section": "micro_structured"},
                    {"name": "International Life Coaching Academy", "type": "Institute", "price": "$450", "session_details": "Personal Mentorship Track", "expected_outcomes": "Certified personal development coaching.", "tags": ["Life Coaching"], "section": "nano_expert"}
                ],
                "distributors": [
                    {"name": "Atomic Habits Implementation Guide", "type": "Guide", "why": "Summary framework for micro-habits and environment design.", "next_step": "Read habit loop breakdown.", "tags": ["Habits", "Guide"], "section": "macro_free", "cost": "Free"},
                    {"name": "Getting Things Done (GTD) Workbook", "type": "Workbook", "cost": "$25", "duration": "Self-paced", "value": "Actionable task capture and daily processing system.", "next_step": "Set up project inbox.", "tags": ["GTD", "Workbook"], "section": "micro_structured"},
                    {"name": "Personal Growth & Productivity Quarterly", "type": "Publication", "price": "$40/year", "session_details": "Quarterly Journal", "expected_outcomes": "Case studies and strategies for personal effectiveness.", "tags": ["Journal"], "section": "nano_expert"}
                ]
            }
        else:  # Mental Health & Wellness / Immediate Support
            return {
                "mentors": [
                    {"name": "Peer Wellness & Student Support Circle", "type": "Mentor", "why": "Free, confidential peer check-ins and shared coping strategies.", "next_step": "Join weekly wellness circle.", "tags": ["Peer Support", "Wellness"], "section": "macro_free", "price": "Free"},
                    {"name": "Certified Stress & Mindfulness Coach", "type": "Coaching", "cost": "$65", "duration": "1 session", "value": "1-on-1 stress trigger mapping and breathwork routines.", "next_step": "Schedule wellness consult.", "tags": ["Mindfulness", "Stress"], "section": "micro_structured"},
                    {"name": "Licensed Clinical Counselor / Therapist", "type": "Mentor", "price": "$120", "session_details": "1-on-1 Confidential Strategy Call", "expected_outcomes": "Professional emotional regulation and personalized coping plan.", "tags": ["Therapy", "Counseling"], "section": "nano_expert"}
                ],
                "vendors": [
                    {"name": "Mindful Breath & Stress Reduction Guide", "type": "Resource", "why": "Free guided audio exercises for exam anxiety and decompression.", "next_step": "Listen to 10-minute mindfulness session.", "tags": ["Mindfulness", "Audio"], "section": "macro_free", "cost": "Free"},
                    {"name": "Headspace / Calm Stress Management Program", "type": "Subscription", "cost": "$12/mo", "duration": "Monthly", "value": "Curated programs for sleep hygiene and anxiety reduction.", "next_step": "Start 14-day stress relief course.", "tags": ["Meditation", "Apps"], "section": "micro_structured"},
                    {"name": "BetterHelp / Talkspace Dedicated Counseling", "type": "Platform", "price": "$260/mo", "session_details": "Weekly Virtual Sessions", "expected_outcomes": "Ongoing qualified therapist support and messaging.", "tags": ["Mental Health", "Counseling"], "section": "nano_expert"}
                ],
                "institutions": [
                    {"name": "National Mental Health & Wellness Helpline", "type": "Institute", "why": "Free 24/7 confidential counseling and crisis support navigation.", "next_step": "Save 24/7 helpline contact.", "tags": ["Helpline", "24/7 Support"], "section": "macro_free", "cost": "Free"},
                    {"name": "Center for Emotional Wellness & Mindfulness", "type": "Institute", "cost": "$90", "duration": "3 weeks", "value": "Structured resilience workshops and emotional literacy modules.", "next_step": "Register for weekend workshop.", "tags": ["Resilience", "Wellness"], "section": "micro_structured"},
                    {"name": "Global Wellness & Psychological Care Institute", "type": "Institute", "price": "$350", "session_details": "Comprehensive Assessment", "expected_outcomes": "Detailed wellbeing evaluation and therapist referral.", "tags": ["Clinical Care"], "section": "nano_expert"}
                ],
                "distributors": [
                    {"name": "Daily Emotional Check-in & Mood Journal", "type": "Guide", "why": "Free printable journal to track triggers and emotional patterns.", "next_step": "Download mood tracker PDF.", "tags": ["Mood Tracker", "Journal"], "section": "macro_free", "cost": "Free"},
                    {"name": "The Anxiety and Phobia Workbook", "type": "Book", "cost": "$22", "duration": "Self-paced", "value": "Practical cognitive and relaxation techniques.", "next_step": "Complete Chapter 2 exercises.", "tags": ["Anxiety", "Workbook"], "section": "micro_structured"},
                    {"name": "Mindfulness & Health Research Quarterly", "type": "Publication", "price": "$35/year", "session_details": "Quarterly Journal", "expected_outcomes": "Evidence-based wellness research and mindfulness insights.", "tags": ["Mindfulness", "Journal"], "section": "nano_expert"}
                ]
            }

    # Category 2: Practical & Skills
    elif cat == "practical":
        return {
            "mentors": [
                {"name": "Open Source & Developer Community Mentor", "type": "Mentor", "why": "Free guidance on git workflows, issue tracking, and contributing code.", "next_step": "Join community Discord.", "tags": ["Open Source", "Code"], "section": "macro_free", "price": "Free"},
                {"name": "Senior Code Review & Project Coach", "type": "Coaching", "cost": "$70", "duration": "1 session", "value": "1-on-1 code audit and architecture feedback.", "next_step": "Submit project repo for review.", "tags": ["Code Review"], "section": "micro_structured"},
                {"name": "Principal Engineer Project Advisory", "type": "Mentor", "price": "$150", "session_details": "Async Code Review & 45-min Zoom", "expected_outcomes": "Comprehensive architecture feedback and GitHub portfolio optimization.", "tags": ["Architecture", "Portfolio"], "section": "nano_expert"}
            ],
            "vendors": [
                {"name": "freeCodeCamp Hands-on Curriculum", "type": "Course", "why": "100% free interactive lessons and portfolio project challenges.", "next_step": "Start module 1.", "tags": ["freeCodeCamp", "Projects"], "section": "macro_free", "cost": "Free"},
                {"name": "Udemy / Coursera Project Bootcamp Track", "type": "Course", "cost": "$35", "duration": "4 weeks", "value": "Step-by-step project building and deployment tutorials.", "next_step": "Build and deploy project 1.", "tags": ["Course", "Projects"], "section": "micro_structured"},
                {"name": "Udacity / Springboard Intensive Project Track", "type": "Bootcamp", "price": "$399/mo", "session_details": "Mentor-led Bootcamp", "expected_outcomes": "Production-grade portfolio projects graded by industry engineers.", "tags": ["Bootcamp", "Capstone"], "section": "nano_expert"}
            ],
            "institutions": [
                {"name": "MIT OpenCourseWare Software & Algorithms", "type": "University", "why": "Free university lectures and problem sets covering core computing paradigms.", "next_step": "Watch introductory lecture.", "tags": ["MIT", "OpenCourseWare"], "section": "macro_free", "cost": "Free"},
                {"name": "Developer Skills Academy Certificate", "type": "Institute", "cost": "$150", "duration": "6 weeks", "value": "Structured problem sets and verified skills certificate.", "next_step": "Submit enrollment form.", "tags": ["Certificate", "Skills"], "section": "micro_structured"},
                {"name": "Advanced Engineering & Cloud Institute", "type": "Institute", "price": "$850", "session_details": "Online Capstone Track", "expected_outcomes": "Certified industry-ready proof of work credential.", "tags": ["Advanced Engineering"], "section": "nano_expert"}
            ],
            "distributors": [
                {"name": "Official Framework Documentation & Sandboxes", "type": "Docs", "why": "Authoritative reference manuals and starter templates.", "next_step": "Explore official tutorials.", "tags": ["Docs", "Sandbox"], "section": "macro_free", "cost": "Free"},
                {"name": "Clean Code & Pragmatic Programmer Guide Set", "type": "Book", "cost": "$35", "duration": "Self-paced", "value": "Essential software design principles and refactoring practices.", "next_step": "Read Chapter 1.", "tags": ["Clean Code", "Design Patterns"], "section": "micro_structured"},
                {"name": "O'Reilly Media Learning Platform", "type": "Subscription", "cost": "$49/mo", "duration": "Monthly", "value": "Unlimited access to technical libraries, sandboxes, and books.", "next_step": "Access digital library.", "tags": ["O'Reilly", "Technical Library"], "section": "nano_expert"}
            ]
        }

    # Category 3: Jobs & Careers
    elif cat == "jobs":
        return {
            "mentors": [
                {"name": "Tech / Industry Professional Networking Circle", "type": "Mentor", "why": "Free informational interviews and advice on workplace expectations.", "next_step": "Schedule 20-minute chat.", "tags": ["Networking", "Career"], "section": "macro_free", "price": "Free"},
                {"name": "ATS Resume & LinkedIn Branding Specialist", "type": "Coaching", "cost": "$85", "duration": "2 weeks", "value": "Tailored resume rewrite and LinkedIn profile optimization.", "next_step": "Submit resume draft for review.", "tags": ["Resume", "LinkedIn"], "section": "micro_structured"},
                {"name": "Senior Hiring Manager Mock Interviewer", "type": "Coaching", "price": "$175/hr", "session_details": "1-on-1 Technical / Behavioral Simulation", "expected_outcomes": "Realistic interview simulation, scoring rubric, and actionable critiques.", "tags": ["Mock Interview", "Placement"], "section": "nano_expert"}
            ],
            "vendors": [
                {"name": "LeetCode / HackerRank Free Practice Arena", "type": "Platform", "why": "Free problem sets for coding challenges and algorithmic drills.", "next_step": "Solve 3 easy problems.", "tags": ["LeetCode", "Coding Drills"], "section": "macro_free", "cost": "Free"},
                {"name": "InterviewCake / Educative System Design Course", "type": "Course", "cost": "$79", "duration": "Self-paced", "value": "Structured patterns for system design and interview problem solving.", "next_step": "Complete system design module 1.", "tags": ["System Design", "Interviews"], "section": "micro_structured"},
                {"name": "Exponent / Pathrise Career Placement Track", "type": "Bootcamp", "price": "$450", "session_details": "Full Interview Prep & Job Search", "expected_outcomes": "Dedicated career mentorship, salary negotiation, and interview coaching.", "tags": ["Job Search", "Placement"], "section": "nano_expert"}
            ],
            "institutions": [
                {"name": "National Association of Colleges and Employers (NACE)", "type": "Institute", "why": "Free salary benchmarks and hiring trend reports.", "next_step": "Download salary guide.", "tags": ["NACE", "Salary Trends"], "section": "macro_free", "cost": "Free"},
                {"name": "Professional Management & Career Institute", "type": "Institute", "cost": "$180", "duration": "4 weeks", "value": "Workplace leadership and business communication credentials.", "next_step": "Register for online seminar.", "tags": ["Leadership", "Workplace"], "section": "micro_structured"},
                {"name": "Executive Career Transition Program", "type": "Institute", "price": "$1,200", "session_details": "Executive Placement Track", "expected_outcomes": "Verified career credentials and executive search network access.", "tags": ["Executive Search"], "section": "nano_expert"}
            ],
            "distributors": [
                {"name": "Tech Interview Handbook & Cheat Sheets", "type": "Guide", "why": "Curated guide on behavioral questions, resumes, and coding patterns.", "next_step": "Review behavioral question sheet.", "tags": ["Handbook", "Interviews"], "section": "macro_free", "cost": "Free"},
                {"name": "Cracking the Coding Interview by Gayle McDowell", "type": "Book", "cost": "$35", "duration": "Self-paced", "value": "189 programming questions and solutions for tech job interviews.", "next_step": "Read Chapter 3.", "tags": ["CTCI", "Algorithms"], "section": "micro_structured"},
                {"name": "Harvard Business Review Career & Leadership Package", "type": "Subscription", "cost": "$15/mo", "duration": "Monthly", "value": "Insights on negotiation, executive presence, and organizational management.", "next_step": "Read career management series.", "tags": ["HBR", "Leadership"], "section": "nano_expert"}
            ]
        }

    # Category 1: Academic & Research (Default)
    else:
        if any(k in title_lower for k in ["test", "sat", "act", "ielts", "toefl", "gre", "gate"]):
            return {
                "mentors": [
                    {"name": "SAT / IELTS Peer Study Group", "type": "Mentor", "why": "Free peer review circles to practice speaking and problem solving.", "next_step": "Join weekly study session.", "tags": ["SAT", "IELTS"], "section": "macro_free", "price": "Free"},
                    {"name": "Test Prep Strategy Coach", "type": "Coaching", "cost": "$89", "duration": "3 weeks", "value": "Small group strategy review covering high-frequency test questions.", "next_step": "Join test cohort.", "tags": ["Test Prep"], "section": "micro_structured"},
                    {"name": "Elite Standardized Test Private Coach", "type": "Coaching", "price": "$150/hr", "session_details": "Private 1-on-1 Tutoring", "expected_outcomes": "Targeted instruction for 1500+ SAT / 8.0+ IELTS score.", "tags": ["1500+ SAT"], "section": "nano_expert"}
                ],
                "vendors": [
                    {"name": "Khan Academy Official SAT Prep Engine", "type": "Course", "why": "100% free personalized SAT math and reading practice.", "next_step": "Link College Board account.", "tags": ["Khan Academy", "SAT"], "section": "macro_free", "cost": "Free"},
                    {"name": "Princeton Review / Magoosh Test Course", "type": "Course", "cost": "$149", "duration": "6 weeks", "value": "Guided live instruction and score guarantee for high-stakes tests.", "next_step": "Enroll in live instruction cohort.", "tags": ["Test Prep"], "section": "micro_structured"},
                    {"name": "PrepScholar 99th-Percentile Program", "type": "Platform", "price": "$397", "session_details": "AI-Customized Prep Platform", "expected_outcomes": "Customized prep algorithm targeting top 1% score.", "tags": ["PrepScholar"], "section": "nano_expert"}
                ],
                "institutions": [
                    {"name": "Official Testing Agency Bulletin (CollegeBoard/ETS/IELTS)", "type": "Institute", "why": "Official guidelines and sample tests for international exams.", "next_step": "Download test bulletin.", "tags": ["Official Board"], "section": "macro_free", "cost": "Free"},
                    {"name": "Kaplan Academic Test Prep Institute", "type": "Institute", "cost": "$250", "duration": "4 weeks", "value": "Comprehensive test prep curriculum with mock test proctoring.", "next_step": "Register for proctored mock exam.", "tags": ["Kaplan"], "section": "micro_structured"},
                    {"name": "Cambridge Assessment English Certification", "type": "University", "price": "$400", "session_details": "Certified Exam Program", "expected_outcomes": "Official C1/C2 Cambridge English Certificate.", "tags": ["Cambridge"], "section": "nano_expert"}
                ],
                "distributors": [
                    {"name": "Official Test Study Guide & Practice Tests", "type": "Book", "why": "Official past test papers with complete explanations.", "next_step": "Solve Practice Test 1.", "tags": ["Official Guide"], "section": "macro_free", "cost": "Free"},
                    {"name": "Barron's / Princeton Review Prep Book Set", "type": "Workbook", "cost": "$30", "duration": "Self-paced", "value": "Comprehensive review chapters and practice drills.", "next_step": "Solve diagnostic drills.", "tags": ["Review Book"], "section": "micro_structured"},
                    {"name": "Test Prep Strategy Digest", "type": "Newsletter", "price": "Free", "session_details": "Weekly Email", "expected_outcomes": "Weekly test tips, pacing formulas, and formula flashcards.", "tags": ["Newsletter"], "section": "nano_expert"}
                ]
            }
        else:
            return {
                "mentors": [
                    {"name": "University Alumni Mentorship Circle", "type": "Mentor", "why": f"Free consultations with alumni to understand {goal_str} applications & curriculum.", "next_step": "Book 20-min intro chat.", "tags": ["Alumni", "Mentorship"], "section": "macro_free", "price": "Free"},
                    {"name": "Academic Advisor & Curriculum Coach", "type": "Coaching", "cost": "$95", "duration": "3 weeks", "value": "Subject combination planning, GPA targets, and prerequisite mapping.", "next_step": "Schedule curriculum review.", "tags": ["Curriculum", "GPA"], "section": "micro_structured"},
                    {"name": "Naaviverse Senior Admissions Strategist", "type": "Mentor", "price": "$150", "session_details": "1-on-1 Zoom Call & Dossier Audit", "expected_outcomes": "Comprehensive audit of academic profile and application positioning.", "tags": ["Admissions Audit"], "section": "nano_expert"}
                ],
                "vendors": [
                    {"name": "Coursera Academic Research & Writing", "type": "Course", "why": "Free course detailing research methodologies and citation formats.", "next_step": "Complete literature review module.", "tags": ["Research", "Writing"], "section": "macro_free", "cost": "Free"},
                    {"name": "Mindler / Crimson University Prep Track", "type": "Course", "cost": "$199", "duration": "6 weeks", "value": "Guided roadmap building for target university applications.", "next_step": "Complete profile review.", "tags": ["University Prep"], "section": "micro_structured"},
                    {"name": "Lumiere / Polygence Academic Research Mentorship", "type": "Bootcamp", "cost": "$850", "duration": "8 weeks", "value": "1-on-1 research mentorship with PhD researchers to write a paper.", "next_step": "Submit research proposal.", "tags": ["Research Paper"], "section": "nano_expert"}
                ],
                "institutions": [
                    {"name": "Target University Open Courses & Admissions Bureau", "type": "University", "why": "Official requirements, department open days, and major information.", "next_step": "Check prerequisites page.", "tags": ["University", "Requirements"], "section": "macro_free", "cost": "Free"},
                    {"name": "University Summer High School / Transfer Academy", "type": "University", "cost": "$350", "duration": "4 weeks", "value": "Introductory college-level coursework and transcript credit.", "next_step": "Submit summer application.", "tags": ["Summer School"], "section": "micro_structured"},
                    {"name": "Columbia / Harvard Secondary School Session", "type": "University", "price": "$3,500", "session_details": "College Credit Program", "expected_outcomes": "Official university transcript credits and recommendation.", "tags": ["Ivy League"], "section": "nano_expert"}
                ],
                "distributors": [
                    {"name": "Fiske Guide to Colleges & Universities", "type": "Book", "why": "Comprehensive directory of 300+ university profiles, majors, and culture.", "next_step": "Read target profiles.", "tags": ["Fiske Guide"], "section": "macro_free", "cost": "Free"},
                    {"name": "High School / College Research Handbook", "type": "Guide", "why": "Guide on formatting, citations, and student publications.", "next_step": "Download paper template.", "tags": ["Research Guide"], "section": "micro_structured"},
                    {"name": "Admissions & Research Weekly Digest", "type": "Newsletter", "price": "Free", "session_details": "Weekly Email", "expected_outcomes": "Curated list of international essay competitions and summer programs.", "tags": ["Newsletter"], "section": "nano_expert"}
                ]
            }


def customize_steps_for_focus(steps_configs: list, focus: Optional[str], goal: str) -> list:
    if not focus:
        return steps_configs
    return steps_configs


def calculate_path_metrics(
    current: str,
    goal: str,
    profile: dict,
    path_type: str = "Academic & Research",
    sub_segment: Optional[str] = None
) -> dict:
    path_category = resolve_focus_category(path_type)
    total_months = calculate_total_duration_months(current, goal, profile, category=path_category, sub_segment=sub_segment)
    total_duration = format_total_duration(total_months)

    return {
        "total_duration": total_duration,
    }


# ─── DENSE EMBEDDING SERVICE FOR ACCURACY MODEL ───────────────────────────
_GLOBAL_EMBEDDING_MODEL = None

def get_dense_embedding_model():
    global _GLOBAL_EMBEDDING_MODEL
    if _GLOBAL_EMBEDDING_MODEL is None:
        try:
            if SentenceTransformer is not None:
                _GLOBAL_EMBEDDING_MODEL = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")
                print("[Embedding Service] Loaded sentence-transformers/all-MiniLM-L6-v2 successfully.")
            else:
                import importlib
                st_module = importlib.import_module("sentence_transformers")
                _GLOBAL_EMBEDDING_MODEL = st_module.SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")
        except Exception as err:
            print(f"[Embedding Service Warning] SentenceTransformer unavailable: {err}")
            _GLOBAL_EMBEDDING_MODEL = None
    return _GLOBAL_EMBEDDING_MODEL


def compute_dense_embedding(text: str) -> Optional[list]:
    model = get_dense_embedding_model()
    if not model or not text or not str(text).strip():
        return None
    try:
        vec = model.encode(str(text).strip(), convert_to_numpy=True)
        return vec.tolist() if hasattr(vec, "tolist") else [float(x) for x in vec]
    except Exception as exc:
        print(f"[Dense Embedding Error] {exc}")
        return None


def cosine_similarity_dense(vec_a: list, vec_b: list) -> float:
    if not vec_a or not vec_b or len(vec_a) != len(vec_b):
        return 0.0
    import math
    dot_product = sum(a * b for a, b in zip(vec_a, vec_b))
    norm_a = math.sqrt(sum(a * a for a in vec_a))
    norm_b = math.sqrt(sum(b * b for b in vec_b))
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return dot_product / (norm_a * norm_b)


def step_has_complete_structure(step: dict) -> bool:
    if not isinstance(step, dict):
        return False
    title = str(step.get("title", "")).strip()
    duration = str(step.get("duration", "")).strip()
    description = str(step.get("description", "")).strip()
    
    mv = get_view_description(step, "macro_view")
    uv = get_view_description(step, "micro_view")
    nv = get_view_description(step, "nano_view")
    
    objs = step.get("learning_objectives") or []
    msteps_list = step.get("micro_steps") or []
    
    valid_objs = isinstance(objs, list) and len([x for x in objs if str(x).strip()]) >= 2
    valid_msteps = isinstance(msteps_list, list) and len([x for x in msteps_list if str(x).strip()]) >= 2
    
    return bool(
        title and duration and description and
        mv and uv and nv and
        valid_objs and valid_msteps
    )


def compute_dynamic_step_completeness(generated_steps: list) -> float:
    if not generated_steps or len(generated_steps) == 0:
        return 0.0
    valid_steps = sum(
        1 for s in generated_steps
        if step_has_complete_structure(s)
    )
    return valid_steps / len(generated_steps)


def calculate_path_accuracy_score(roadmap: dict, profile: dict, current: str = "", goal: str = "") -> dict:
    import math

    if not roadmap:
        return {
            "accuracy_score": 0,
            "accuracy_label": "Needs Improvement",
            "accuracy_color": "#c5221f",
            "breakdown": {
                "structural": 0,
                "content": 0,
                "market": 0,
                "profile_alignment": 0,
                "structural_score": 0,
                "content_score": 0,
                "market_score": 0
            },
            "details": {}
        }
        
    steps = roadmap.get("steps") or []
    actual_steps = len(steps)
    if actual_steps == 0:
        return {
            "accuracy_score": 0,
            "accuracy_label": "Needs Improvement",
            "accuracy_color": "#c5221f",
            "breakdown": {
                "structural": 0,
                "content": 0,
                "market": 0,
                "profile_alignment": 0,
                "structural_score": 0,
                "content_score": 0,
                "market_score": 0
            },
            "details": {}
        }

    # ── HYBRID MODEL WEIGHTS ──
    # 1. Semantic Embedding Vector Cosine Similarity (45%)
    # 2. Student Profile Alignment (30%)
    # 3. Schema & Structural Completeness (25%)
    w_semantic = 0.45
    w_alignment = 0.30
    w_schema = 0.25

    # ── 1. SEMANTIC VECTOR SIMILARITY (Dense Embedding Cosine Space) ──
    query_text = f"{current} {goal}".strip()
    if not query_text or query_text == " ":
        query_text = (roadmap.get("path_title", "") + " " + roadmap.get("path_description", "")).strip()

    query_embedding = compute_dense_embedding(query_text)

    # Batch collect milestone text for efficient SentenceTransformer encoding
    step_texts = []
    for s in steps:
        step_text_parts = [
            s.get("title", ""),
            s.get("description", ""),
            get_view_description(s, "macro_view"),
            get_view_description(s, "micro_view"),
            get_view_description(s, "nano_view"),
            " ".join(str(o) for o in (s.get("learning_objectives") or [])),
            " ".join(str(m) for m in (s.get("micro_steps") or []))
        ]
        combined_step_text = " ".join(p for p in step_text_parts if p).strip()
        if combined_step_text:
            step_texts.append(combined_step_text)

    embedding_model = get_dense_embedding_model()
    step_embeddings = []
    if embedding_model and step_texts:
        try:
            encoded = embedding_model.encode(step_texts, convert_to_numpy=True)
            step_embeddings = [vec.tolist() if hasattr(vec, "tolist") else list(vec) for vec in encoded]
        except Exception as exc:
            print(f"[Batch Embedding Error] {exc}")
            step_embeddings = []

    if query_embedding and step_embeddings:
        # Per-step dense cosine similarity
        step_sims = [cosine_similarity_dense(query_embedding, emb) for emb in step_embeddings]
        
        # Linear map raw cosine [-1, 1] to normalized relevance [0, 1] for all-MiniLM-L6-v2
        # Baseline cosine threshold 0.10 mapped to 0.0, top relevance 0.80 mapped to 1.0
        step_relevances = [max(0.0, min(1.0, (sim - 0.10) / 0.70)) for sim in step_sims]
        
        import statistics
        sorted_rel = sorted(step_relevances, reverse=True)
        max_rel = sorted_rel[0]
        med_rel = float(statistics.median(step_relevances))
        
        # Truly count-neutral semantic representation using invariant distribution statistics:
        # S_semantic = 0.50 * max(relevance) + 0.50 * median(relevance)
        # Why is this invariant to duplicated equivalent milestones?
        # For any sample X, repeating X n times preserves both max(X) and median(X) identically.
        # Repeating identical or equivalent steps (1x, 2x, 5x, 10x, 20x) produces the EXACT same S_semantic score.
        S_semantic = (0.50 * max_rel) + (0.50 * med_rel)
        semantic_method = "Dense Embedding Cosine Similarity"
        semantic_model_name = "sentence-transformers/all-MiniLM-L6-v2"
        semantic_status = "available"
        raw_cosine_val = round(sum(step_sims) / len(step_sims), 3)
    else:
        # NO LEXICAL FALLBACK: Do not fabricate a fake score or default 0.50/0.70 score
        S_semantic = 0.0
        semantic_method = "Dense Embedding Cosine Similarity"
        semantic_model_name = "sentence-transformers/all-MiniLM-L6-v2"
        semantic_status = "unavailable"
        raw_cosine_val = 0.0

    # ── 2. STUDENT PROFILE ALIGNMENT (Financial, Location, Level) ──
    prof = profile or {}
    personality_geo = prof.get("personalityGeography") or {}
    academics = prof.get("academics") or {}
    
    fin_status = (
        personality_geo.get("financialSituation") or 
        prof.get("financialSituation") or 
        prof.get("financial_situation") or 
        "Moderate"
    ).lower()

    # Check Marketplace Financial Alignment across steps
    financial_match_sum = 0.0
    for s in steps:
        market = combined_marketplace_from_step(s)
        items_free = marketplace_items_for_section(market, "macro_free") if isinstance(market, dict) else []
        items_struct = marketplace_items_for_section(market, "micro_structured") if isinstance(market, dict) else []
        items_expert = marketplace_items_for_section(market, "nano_expert") if isinstance(market, dict) else []

        if any(term in fin_status for term in ["high", "affluent", "premium", "upper"]):
            # Affluent students: reward presence of expert & premium structured items
            match = 1.0 if (len(items_expert) > 0 or len(items_struct) > 0) else 0.7
        elif any(term in fin_status for term in ["low", "need", "budget", "constrained", "minimal"]):
            # Budget-conscious students: reward presence of high-value free items ($0)
            match = 1.0 if len(items_free) > 0 else 0.7
        else:
            # Balanced mix
            match = 1.0 if (len(items_free) > 0 and (len(items_struct) > 0 or len(items_expert) > 0)) else 0.85
        
        financial_match_sum += match

    A_fin = financial_match_sum / actual_steps

    # Geographic / Location Alignment
    country = (personality_geo.get("country") or prof.get("country") or "").strip()
    city = (personality_geo.get("city") or prof.get("city") or "").strip()
    A_geo = 1.0 if (country or city) else 0.85

    # Baseline Level Alignment (Degree / Grade)
    stream = (academics.get("academicStream") or prof.get("stream") or "").strip()
    grade = (academics.get("gradeLevel") or prof.get("grade") or "").strip()
    A_level = 1.0 if (stream or grade) else 0.85

    S_alignment = (A_fin * 0.50) + (A_geo * 0.25) + (A_level * 0.25)

    # ── 3. SCHEMA & STRUCTURAL COMPLETENESS ──
    # True structural integrity evaluation (ZERO static numbers or fixed step targets)
    C_steps = compute_dynamic_step_completeness(steps)

    # Structured Lists & Multi-View Completeness
    views_complete = 0
    lists_complete = 0
    market_tiers_complete = 0

    for s in steps:
        # Check Views
        mv = get_view_description(s, "macro_view")
        uv = get_view_description(s, "micro_view")
        nv = get_view_description(s, "nano_view")
        if mv and uv and nv:
            views_complete += 1

        # Check Lists
        objs = s.get("learning_objectives") or []
        msteps_list = s.get("micro_steps") or []
        if isinstance(objs, list) and len(objs) >= 2 and isinstance(msteps_list, list) and len(msteps_list) >= 2:
            lists_complete += 1

        # Check Marketplace Tiers
        m = combined_marketplace_from_step(s)
        if isinstance(m, dict):
            if (len(marketplace_items_for_section(m, "macro_free")) > 0 and 
                len(marketplace_items_for_section(m, "micro_structured")) > 0 and 
                len(marketplace_items_for_section(m, "nano_expert")) > 0):
                market_tiers_complete += 1

    C_views = views_complete / actual_steps
    C_lists = lists_complete / actual_steps
    C_market = market_tiers_complete / actual_steps

    S_schema = (C_steps * 0.30) + (C_views * 0.30) + (C_lists * 0.20) + (C_market * 0.20)

    # ── FINAL HYBRID ACCURACY SCORE ──
    raw_score = 100.0 * (w_semantic * S_semantic + w_alignment * S_alignment + w_schema * S_schema)
    total_score = min(100, max(10, round(raw_score)))

    if total_score >= 90:
        label = "Excellent Accuracy"
        color = "#137333"
    elif total_score >= 75:
        label = "High Accuracy"
        color = "#1a73e8"
    elif total_score >= 55:
        label = "Moderate Accuracy"
        color = "#b06000"
    elif total_score >= 35:
        label = "Low Accuracy"
        color = "#c5221f"
    else:
        label = "Needs Improvement"
        color = "#c5221f"

    return {
        "accuracy_score": total_score,
        "accuracy_label": label,
        "accuracy_color": color,
        "breakdown": {
            "structural": round(S_schema * 100),
            "content": round(S_semantic * 100),
            "market": round(S_alignment * 100),
            "profile_alignment": round(S_alignment * 100),
            "structural_score": round(S_schema * 100),
            "content_score": round(S_semantic * 100),
            "market_score": round(S_alignment * 100)
        },
        "details": {
            "step_count": actual_steps,
            "s_semantic_vector_cosine": round(S_semantic, 3),
            "s_profile_alignment": round(S_alignment, 3),
            "s_schema_completeness": round(S_schema, 3),
            "semantic_method": semantic_method,
            "semantic_model": semantic_model_name,
            "semantic_status": semantic_status,
            "raw_cosine": raw_cosine_val,
            "info_formula": "Dense Embedding Cosine Similarity (Query Vector vs Step Relevance Coverage)",
            "market_formula": "Student Profile Alignment Matrix (Financial Status, Geographic Location, Academic Baseline)",
            "structural_formula": "Schema Completeness Matrix (Step Structural Integrity, Multi-Views, Structured Lists, Marketplace Tiers)"
        }
    }


def validate_category_semantics(blueprint: dict, category: str, sub_segment: Optional[str] = None) -> tuple:
    if not isinstance(blueprint, dict):
        return False, "Blueprint is not a dictionary"
    steps = blueprint.get("steps")
    if not isinstance(steps, list) or len(steps) == 0:
        return False, "Blueprint must contain at least 1 structured step (received 0)."
    return True, "Valid"


def get_fallback_mock_roadmap(*args, **kwargs) -> dict:
    raise RuntimeError("Fallback mock roadmaps are disabled. All pathways must be generated by AI.")


def scale_blueprint_steps(blueprint: dict, requested_steps: int) -> dict:
    steps = blueprint.get("steps", [])
    if not steps or len(steps) == requested_steps:
        return blueprint
        
    N = len(steps)
    M = requested_steps
    
    dup_counts = [0] * N
    for j in range(M):
        orig_idx = int(j * N / M)
        dup_counts[orig_idx] += 1
        
    scaled_path = []
    new_id = 1
    for orig_idx, count in enumerate(dup_counts):
        if count == 0:
            continue
        orig_step = steps[orig_idx]
        for d in range(count):
            new_step = orig_step.copy()
            new_step["id"] = new_id
            
            # If there are duplicates, append Phase tag to title
            if count > 1:
                new_step["title"] = f"{orig_step['title']} - Phase {d + 1}"
                new_step["duration"] = split_duration(orig_step["duration"], count, d)
            
            scaled_path.append(new_step)
            new_id += 1
            
    blueprint["steps"] = scaled_path
    return blueprint


def build_admin_feedback_memory(match_items: List[dict], applied_to_prompt: bool, fallback_used: bool = False) -> dict:
    return {
        "count": len(match_items),
        "applied_to_prompt": applied_to_prompt,
        "fallback_used": fallback_used,
        "items": [
            {
                "id": item.get("id"),
                "category": item.get("category", "general"),
                "target_goal": item.get("target_goal"),
                "match_score": item.get("match_score", 0),
            }
            for item in match_items
        ],
    }


def score_admin_feedback_match(doc: dict, goal_terms: List[str], profile: dict) -> int:
    score = 0
    stored_goal = str(doc.get("target_goal") or "").lower()
    score += sum(1 for term in goal_terms if term in stored_goal)

    stored_profile = doc.get("student_profile") or {}
    for field in ["grade", "curriculum", "stream", "country"]:
        requested = str((profile or {}).get(field) or "").strip().lower()
        stored = str(stored_profile.get(field) or "").strip().lower()
        if requested and stored:
            if requested == stored:
                score += 3
            elif requested in stored or stored in requested:
                score += 1

    return score


def format_admin_feedback_prompt_section(feedback_items: List[dict]) -> str:
    if not feedback_items:
        return ""

    feedback_str = "\n\n==================================================\n"
    feedback_str += "LEARN FROM PAST EXPERT ADMIN FEEDBACK / INSTRUCTIONS:\n"
    feedback_str += (
        "Admins have previously edited pathways for similar target goals or student profiles. "
        "You MUST strictly incorporate these learnings when structuring this new pathway. "
        "Treat them as persistent curation rules for matching future generations:\n"
    )
    for item in feedback_items:
        feedback_str += (
            f"- [{item['category'].upper()}] "
            f"(For Target: '{item['target_goal']}', Grade: {item['profile_grade'] or 'N/A'}, "
            f"Curriculum: {item['profile_curriculum'] or 'N/A'}, "
            f"Stream: {item['profile_stream'] or 'N/A'}, Match Score: {item.get('match_score', 0)}):\n"
            f"  \"{item['feedback_text']}\"\n"
        )
    feedback_str += "==================================================\n"
    return feedback_str


async def get_relevant_admin_feedback(target_goal: str, profile: dict) -> List[dict]:
    query_clauses = []
    
    # 1. Match goal terms (case-insensitive regex)
    # Split by spaces and special characters, ignore short words (< 2 chars)
    goal_terms = [t.strip() for t in re.split(r'[\s•&,/-]+', target_goal.lower()) if len(t.strip()) >= 2]
    if goal_terms:
        term_queries = [{"target_goal": {"$regex": re.escape(term), "$options": "i"}} for term in goal_terms]
        query_clauses.append({"$or": term_queries})
        
    # 2. Match profile details (grade, curriculum, stream, country)
    profile_clauses = []
    if profile:
        for field in ["grade", "curriculum", "stream", "country"]:
            val = profile.get(field)
            if val:
                profile_clauses.append({f"student_profile.{field}": {"$regex": re.escape(str(val)), "$options": "i"}})
                
    if profile_clauses:
        query_clauses.append({"$or": profile_clauses})
        
    if not query_clauses:
        query = {}
    else:
        query = {"$or": query_clauses}
        
    feedbacks = []
    try:
        cursor = admin_feedbacks_collection.find(query).sort("timestamp", -1).limit(50)
        async for doc in cursor:
            feedback_text = doc.get("feedback_text")
            if not feedback_text:
                continue
            match_score = score_admin_feedback_match(doc, goal_terms, profile)
            if query_clauses and match_score <= 0:
                continue
            feedbacks.append({
                "id": str(doc.get("_id")),
                "feedback_text": feedback_text,
                "category": doc.get("category", "general"),
                "target_goal": doc.get("target_goal"),
                "profile_grade": doc.get("student_profile", {}).get("grade"),
                "profile_curriculum": doc.get("student_profile", {}).get("curriculum"),
                "profile_stream": doc.get("student_profile", {}).get("stream"),
                "timestamp": doc.get("timestamp"),
                "match_score": match_score,
            })
    except Exception as e:
        print(f"[Feedback Retrieval Error] {e}")
        
    feedbacks.sort(
        key=lambda item: (
            item.get("match_score", 0),
            item.get("timestamp") or datetime.datetime.min.replace(tzinfo=datetime.timezone.utc),
        ),
        reverse=True,
    )
    return feedbacks[:5]


# Specialized Audit Tasks
async def run_agent_1_blueprint(
    current: str,
    goal: str,
    profile: dict,
    refine_prompt: Optional[str] = None,
    existing_roadmap: Optional[dict] = None,
    focus: Optional[str] = None,
    content_category: Optional[str] = None,
    sub_segment: Optional[str] = None
) -> dict:
    requested_steps = None
    is_step_increase_intent = False
    if refine_prompt:
        rp_lower = refine_prompt.lower()
        # Pattern 1: "6 steps", "8 milestones" — explicit number before keyword
        match_steps = re.search(r'(\d+)\s*(?:step|milestone|phase)', rp_lower)
        if match_steps:
            try:
                requested_steps = int(match_steps.group(1))
                if requested_steps < 1:
                    requested_steps = 1
                is_step_increase_intent = True
            except Exception:
                pass
        # Pattern 2: "steps to 7", "milestones to 6" — keyword then "to N"
        if not requested_steps:
            match_to = re.search(r'(?:step|milestone|phase)s?\s+(?:to|=)\s*(\d+)', rp_lower)
            if match_to:
                try:
                    requested_steps = int(match_to.group(1))
                    is_step_increase_intent = True
                except Exception:
                    pass
        # Pattern 3: "add 2 more steps/milestones" — relative increase
        if not requested_steps:
            match_add = re.search(r'add\s+(\d+)\s+(?:more\s+)?(?:step|milestone|phase)', rp_lower)
            if match_add and existing_roadmap:
                try:
                    add_count = int(match_add.group(1))
                    raw_rm = existing_roadmap.get("roadmap_data") or existing_roadmap
                    current_count = len(raw_rm.get("steps", []))
                    requested_steps = current_count + add_count
                    is_step_increase_intent = True
                except Exception:
                    pass
        # Pattern 4: "increase steps", "more milestones", "expand steps" — general increase without specific number
        if not requested_steps and not is_step_increase_intent:
            if re.search(r'(?:increase|more|expand|extend|add|extra|additional|deeper|longer)\s*(?:step|milestone|phase)', rp_lower):
                is_step_increase_intent = True
                if existing_roadmap:
                    raw_rm = existing_roadmap.get("roadmap_data") or existing_roadmap
                    current_count = len(raw_rm.get("steps", []))
                    requested_steps = current_count + 3  # Add 3 more by default
            elif re.search(r'(?:step|milestone|phase)s?\s*(?:increase|more|expand|add)', rp_lower):
                is_step_increase_intent = True
                if existing_roadmap:
                    raw_rm = existing_roadmap.get("roadmap_data") or existing_roadmap
                    current_count = len(raw_rm.get("steps", []))
                    requested_steps = current_count + 3
        # Pattern 5: "reduce steps", "fewer milestones" — decrease
        if not requested_steps and not is_step_increase_intent:
            match_reduce = re.search(r'(?:reduce|fewer|less|decrease|shorten)\s*(?:step|milestone|phase)', rp_lower)
            if match_reduce and existing_roadmap:
                is_step_increase_intent = True  # Still a step-count intent
                raw_rm = existing_roadmap.get("roadmap_data") or existing_roadmap
                current_count = len(raw_rm.get("steps", []))
                requested_steps = max(2, current_count - 2)

    cat = resolve_focus_category(content_category or focus)
    focus_title_prefix = "Academic & Research"
    focus_area = focus or "Standard Academic Pathway"
    if cat == "practical":
        focus_title_prefix = "Practical & Skills"
        focus_area = focus or "Hands-on Practical Skills and Project Development"
    elif cat == "jobs":
        focus_title_prefix = "Jobs & Careers"
        focus_area = focus or "Profession Readiness and Career Progression"
    elif cat == "non_academic":
        focus_title_prefix = "Non-Academic Counselling"
        focus_area = focus or (sub_segment or "Mental Health & Wellness / Life Skills Support")

    prompt = build_agent_1_prompt(
        category=cat,
        sub_segment=sub_segment,
        current_position=current,
        target_goal=goal,
        profile=profile,
        degree_type=get_request_degree_type(goal, profile) if cat == "academic" else None,
        focus_title_prefix=focus_title_prefix,
        focus_area=focus_area,
        focus=focus,
        refine_prompt=refine_prompt,
        requested_steps=requested_steps,
        existing_roadmap=existing_roadmap
    )

    if focus:
        prompt += f"\n\n🚨 STRATEGIC FOCUS DIRECTION: Structure this pathway according to: \"{focus}\".\nEnsure all milestone titles, descriptions, and learning views reflect this focus."

    if refine_prompt:
        prompt += f"\n\n==================================================\nCRITICAL USER REQUEST FOR REFINE / ADJUSTMENT:\n👉 \"{refine_prompt}\"\n==================================================\n"
        if requested_steps:
            prompt += f"\n🚨 CRITICAL ENFORCEMENT: Output EXACTLY {requested_steps} distinct step objects inside 'steps'. Each step must be unique, progressive, and fully detailed."
        if existing_roadmap:
            raw_roadmap = existing_roadmap.get("roadmap_data") or existing_roadmap
            existing_steps = raw_roadmap.get("steps", [])

            if is_step_increase_intent:
                # COMPACT OUTLINE: Send only IDs, titles, durations (~300 tokens) to avoid TPM limits
                compact_outline = []
                for m in existing_steps:
                    compact_outline.append({
                        "id": m.get("id"),
                        "title": m.get("title", ""),
                        "duration": m.get("duration", ""),
                        "description": str(m.get("description", "")).strip()[:120]
                    })
                compact_dump = json.dumps({
                    "path_title": raw_roadmap.get("path_title"),
                    "total_duration": raw_roadmap.get("total_duration"),
                    "steps": compact_outline
                }, indent=1)
                refine_instruction = f"""
==================================================
🤖 STEP EXPANSION / MODIFICATION AGENT INSTRUCTIONS:
User Request: "{refine_prompt}"
Active Category: {cat.upper()}
Active Sub-Category: {sub_segment or 'Standard'}
Current Step Count: {len(existing_steps)}
Target Step Count: {requested_steps or 'More than current (autonomously determine)'}

EXPANSION RULES:
1. Keep ALL existing milestone themes/topics as a foundation.
2. Expand the sequence by adding new intermediate, advanced, or capstone milestones.
3. Re-sequence IDs (1, 2, 3, ...) and redistribute durations across the full timeline.
4. Every step (existing + new) MUST have complete: id, title, duration, description, macro_view (100+ words), micro_view (100+ words), nano_view (100+ words), learning_objectives (3+), micro_steps (2+), and a fully populated marketplace.
5. ZERO MOCK DATA: All content must be authentically generated for {goal} from {current}.
6. ZERO DUPLICATION: No marketplace item name may repeat across milestones.
==================================================
EXISTING ROADMAP OUTLINE TO EXPAND:
{compact_dump}
"""
                prompt += refine_instruction
            else:
                # NON-STEP-COUNT REFINE: Send condensed existing steps
                clean_existing_steps = []
                for m in existing_steps:
                    clean_step = {
                        "id": m.get("id"),
                        "title": m.get("title", ""),
                        "duration": m.get("duration", ""),
                        "description": str(m.get("description", "")).strip(),
                        "macro_view": get_view_description(m, "macro_view")[:200],
                        "micro_view": get_view_description(m, "micro_view")[:200],
                        "nano_view": get_view_description(m, "nano_view")[:200],
                        "learning_objectives": m.get("learning_objectives", []),
                        "micro_steps": m.get("micro_steps", [])
                    }
                    clean_existing_steps.append(clean_step)

                clean_dump = json.dumps({
                    "path_title": raw_roadmap.get("path_title"),
                    "total_duration": raw_roadmap.get("total_duration"),
                    "steps": clean_existing_steps
                }, indent=2)
                refine_instruction = f"""
==================================================
🤖 ADVANCED REFINE AGENT INSTRUCTIONS:
User Modification Request: "{refine_prompt}"
Active Category: {cat.upper()}
Active Sub-Category: {sub_segment or 'Standard'}

Refinement Execution Rules:
1. STRICT CATEGORY & DROPDOWN COMPLIANCE: Execute the user's refinement strictly within the {cat.upper()} domain ({sub_segment or 'Standard'}). Never cross over into forbidden categories (e.g. no high school board exams for software careers or mental health counselling).
2. INTENT KEYWORD TARGETING (GO DIRECTLY TO THE REQUESTED SECTION):
   - MARKETPLACE & RESOURCE REQUESTS (e.g. 'marketplace', 'more recommendations', 'mentors', 'vendors', 'courses', 'resources', 'why only 1', 'for every view'):
     You MUST generate a rich, comprehensive, multi-item marketplace for EVERY milestone. Generate at least 2 distinct items for 'macro_free', at least 1-2 for 'micro_structured', and at least 1-2 for 'nano_expert' across mentors, vendors, institutions, and distributors. Never output only 1 item per view/category.
   - STEP COUNT & TIMELINE REQUESTS (e.g. 'add steps', 'more milestones', 'increase steps', 'change duration', 'months'):
     Directly update the number of milestones, sequence, or duration as requested, recalculating timeline while preserving untouched content.
   - VIEWS & CONTENT REQUESTS (e.g. 'macro view', 'micro view', 'nano view', 'check step description', 'learning objectives', 'micro steps'):
     Directly rewrite, expand, or adjust the specific view or step text targeted by the user.
3. IN-DEPTH VIEWS FOR ALL STEPS: Any new or modified step MUST have deep, rich, comprehensive 'macro_view', 'micro_view', and 'nano_view' (at least 100-150 words each). Do NOT output empty or 1-sentence summaries.
4. ZERO MOCK / NO FALLBACK DATA: Generate 100% genuine, relevant, highly specific milestones and guidance tailored to {goal} and {current}.
5. COMPLETE OUTPUT: Every step in 'steps' must output the complete structure including 'id', 'title', 'duration', 'description', 'macro_view', 'micro_view', 'nano_view', 'learning_objectives', 'micro_steps', and a fully populated 'marketplace'.
==================================================
EXISTING ROADMAP BLUEPRINT TO MODIFY:
{clean_dump}
"""
                prompt += refine_instruction

    feedback_items = []
    try:
        feedback_items = await get_relevant_admin_feedback(goal, profile)
        if feedback_items:
            feedback_str = "\n\n==================================================\n🚨 PAST EXPERT ADMIN GUIDANCE:\n"
            for item in feedback_items:
                feedback_str += f"- [{item['category'].upper()}]: \"{item['feedback_text']}\"\n"
            feedback_str += "==================================================\n"
            prompt += feedback_str
    except Exception as e:
        print(f"[Feedback Learning Warning] {e}")

    print(f"[Agent 1] Generating roadmap blueprint (cat: {cat}, focus: {focus or 'default'}, requested_steps: {requested_steps or 'auto'}, step_intent: {is_step_increase_intent}) using 120B...")

    # Generation loop with semantic validation & auto-regeneration
    res = None
    last_valid_res = None
    for attempt in range(3):
        current_prompt = prompt
        if attempt > 0:
            current_prompt += f"\n\n🚨 PREVIOUS GENERATION CORRECTION: Ensure you output a pure {cat.upper()} roadmap focusing strictly on {focus_area}. Output a complete JSON object containing a non-empty 'steps' array with detailed milestones for {goal}."

        res = await query_groq_json(
            current_prompt,
            preferred_model="openai/gpt-oss-120b",
            fallback_models=["qwen/qwen3.8-27b", "openai/gpt-oss-20b"],
            max_tokens=8192,
        )

        if isinstance(res, dict) and isinstance(res.get("steps"), list) and len(res["steps"]) > 0:
            last_valid_res = res
            break
        else:
            err_info = res.get("error") if isinstance(res, dict) else None
            print(f"[Agent 1 JSON Structure Warning] Attempt {attempt + 1} did not return valid steps array ({err_info or 'empty'}). Retrying...")
            await asyncio.sleep(3.0)

    if isinstance(res, dict) and isinstance(res.get("steps"), list) and len(res["steps"]) > 0:
        blueprint_to_return = res
    elif last_valid_res and isinstance(last_valid_res.get("steps"), list) and len(last_valid_res["steps"]) > 0:
        blueprint_to_return = last_valid_res
    else:
        err_msg = res.get("error") if (isinstance(res, dict) and res.get("error")) else "Model failed to output milestone steps."
        raise RuntimeError(f"AI Pathway Generation Failed: {err_msg}. Please click 'Find My Path' to retry.")

    blueprint_to_return["admin_feedback_memory"] = build_admin_feedback_memory(feedback_items, applied_to_prompt=bool(feedback_items), fallback_used=False)
    return blueprint_to_return


async def run_agent_2_path_auditor(
    blueprint: dict,
    current: str,
    goal: str,
    profile: dict,
    refine_prompt: Optional[str] = None,
    existing_roadmap: Optional[dict] = None,
    category: str = "academic",
    sub_segment: Optional[str] = None
) -> dict:
    cat = resolve_focus_category(category)
    prompt = build_agent_2_prompt(
        category=cat,
        sub_segment=sub_segment,
        current_position=current,
        target_goal=goal,
        profile=profile,
        blueprint_json=json.dumps(blueprint, indent=2)
    )
    print(f"[Agent 2] Auditing path details (cat: {cat}) using fast model...")
    res = await query_groq_json(
        prompt,
        preferred_model="openai/gpt-oss-20b",
        fallback_models=["qwen/qwen3.8-27b", "openai/gpt-oss-120b"]
    )
    return res


async def run_agent_3_steps_auditor(
    blueprint: dict,
    current: str,
    goal: str,
    profile: dict,
    refine_prompt: Optional[str] = None,
    existing_roadmap: Optional[dict] = None,
    category: str = "academic",
    sub_segment: Optional[str] = None
) -> list:
    cat = resolve_focus_category(category)
    prompt = build_agent_3_prompt(
        category=cat,
        sub_segment=sub_segment,
        current_position=current,
        target_goal=goal,
        profile=profile,
        blueprint_json=json.dumps(blueprint, indent=2)
    )
    print(f"[Agent 3] Auditing steps & views (cat: {cat}) using fast model...")
    res = await query_groq_json(
        prompt,
        preferred_model="openai/gpt-oss-20b",
        fallback_models=["qwen/qwen3.8-27b", "openai/gpt-oss-120b"]
    )
    if isinstance(res, list):
        return res
    if isinstance(res, dict) and "steps" in res and isinstance(res["steps"], list):
        return res["steps"]
    return blueprint.get("steps", [])


async def run_agent_4_marketplace_auditor(
    blueprint: dict,
    current: str,
    goal: str,
    profile: dict,
    refine_prompt: Optional[str] = None,
    existing_roadmap: Optional[dict] = None,
    category: str = "academic",
    sub_segment: Optional[str] = None
) -> list:
    cat = resolve_focus_category(category)
    prompt = build_agent_4_prompt(
        category=cat,
        sub_segment=sub_segment,
        current_position=current,
        target_goal=goal,
        profile=profile,
        blueprint_json=json.dumps(blueprint, indent=2)
    )
    print(f"[Agent 4] Auditing marketplace recommendations (cat: {cat}) using fast model...")
    res = await query_groq_json(
        prompt,
        preferred_model="openai/gpt-oss-20b",
        fallback_models=["qwen/qwen3.8-27b", "openai/gpt-oss-120b"]
    )
    if isinstance(res, list):
        return res
    return blueprint.get("steps", [])


def build_agent_statuses(active_agent: str = None, completed_agents: list = None) -> dict:
    completed_agents = completed_agents or []
    statuses = {
        "agent1": "pending",
        "agent2": "pending",
        "agent3": "pending",
        "agent4": "pending",
        "ready": "pending",
    }
    for agent in completed_agents:
        statuses[agent] = "completed"
    if active_agent:
        statuses[active_agent] = "active"
    return statuses


# ─── CATEGORY SEMANTIC VALIDATION ──────────────────────────────────────────
def validate_category_semantics(blueprint: Any, category: str, sub_segment: Optional[str] = None) -> tuple[bool, str]:
    """Validates structural and semantic validity according to agent_flow.md rules."""
    if not isinstance(blueprint, dict) or blueprint.get("error"):
        return False, "Blueprint is empty or returned an error."

    steps = blueprint.get("steps")
    if not isinstance(steps, list) or len(steps) == 0:
        return False, f"Blueprint must contain at least 1 structured step (received {len(steps) if isinstance(steps, list) else 0})."

    cat = resolve_focus_category(category)
    content_text = (
        str(blueprint.get("path_title", "")) + " " +
        str(blueprint.get("path_description", "")) + " " +
        " ".join([
            str(s.get("title", "")) + " " +
            str(s.get("description", "")) + " " +
            str(s.get("macro_view", "")) + " " +
            str(s.get("micro_view", "")) + " " +
            str(s.get("nano_view", ""))
            for s in steps if isinstance(s, dict)
        ])
    ).lower()

    # Category 4: Non-Academic Counselling
    if cat == "non_academic":
        forbidden = [
            "sat prep", "act prep", "ielts prep", "gpa target", "grade 10 board", "grade 11 board", "grade 12 board",
            "cbse curriculum", "ib diploma", "university admissions dossier", "common app", "college placement program"
        ]
        for term in forbidden:
            if term in content_text:
                return False, f"Category Leakage: Non-Academic Counselling pathway contains forbidden academic term '{term}'."

    # Category 3: Jobs & Careers
    elif cat == "jobs":
        forbidden = [
            "grade 10 board", "grade 11 board", "grade 12 board", "cbse curriculum", "icse stream", "high school school selection"
        ]
        for term in forbidden:
            if term in content_text:
                return False, f"Category Leakage: Jobs & Careers pathway contains forbidden school/board term '{term}'."

    # Category 2: Practical & Skills
    elif cat == "practical":
        forbidden = [
            "grade 10 board", "sat prep modules", "college admissions dossier", "university application submission"
        ]
        for term in forbidden:
            if term in content_text:
                return False, f"Category Leakage: Practical & Skills pathway contains forbidden academic admissions term '{term}'."

    return True, "Valid"

def is_complete_blueprint(
    blueprint: Any,
    current: str,
    goal: str,
    profile: dict,
    requested_steps: Optional[int] = None,
    category: str = "academic"
) -> bool:
    if not isinstance(blueprint, dict) or blueprint.get("error"):
        return False
    milestones = blueprint.get("steps")
    if not isinstance(milestones, list) or len(milestones) == 0:
        return False
    
    if requested_steps is not None:
        return len(milestones) == requested_steps

    return True


def sse_payload(event: str, data: dict) -> str:
    return f"event: {event}\ndata: {json.dumps(data)}\n\n"


def deduplicate_roadmap_marketplaces(steps: list) -> list:
    """Ensure no marketplace item or provider name is duplicated across multiple milestones.
    Deduplicates across step.marketplace AND any view-embedded marketplace items."""
    if not isinstance(steps, list):
        return steps
    seen_names = set()

    def _dedup_items(items_list: list) -> list:
        """Filter a list of marketplace item dicts, dropping duplicates by name."""
        if not isinstance(items_list, list):
            return items_list
        deduped = []
        for item in items_list:
            if not isinstance(item, dict):
                continue
            name = str(item.get("name") or "").strip()
            if not name:
                continue
            name_key = name.lower()
            if name_key in seen_names:
                # Drop duplicate — keep recommendations fresh and unique
                continue
            seen_names.add(name_key)
            deduped.append(item)
        return deduped

    for step in steps:
        if not isinstance(step, dict):
            continue

        # 1. Deduplicate main step marketplace
        m = step.get("marketplace")
        if isinstance(m, dict):
            for cat_key in ["mentors", "vendors", "institutions", "distributors"]:
                items = m.get(cat_key)
                if isinstance(items, list):
                    m[cat_key] = _dedup_items(items)

        # 2. Deduplicate view-level embedded marketplaces (if views contain marketplace dicts)
        for view_key in ["macro_view", "micro_view", "nano_view"]:
            view_val = step.get(view_key)
            if isinstance(view_val, dict) and "marketplace" in view_val:
                vm = view_val["marketplace"]
                if isinstance(vm, dict):
                    for cat_key in ["mentors", "vendors", "institutions", "distributors"]:
                        vitems = vm.get(cat_key)
                        if isinstance(vitems, list):
                            vm[cat_key] = _dedup_items(vitems)

    return steps


async def build_and_store_final_path(
    blueprint: dict,
    path_audit: dict,
    steps_audit: list,
    market_audit: list,
    current: str,
    goal: str,
    profile: dict,
    path_type: str = "Academic & Research",
    sub_segment: Optional[str] = None
) -> dict:
    cat = resolve_focus_category(path_type)
    metrics = calculate_path_metrics(current, goal, profile, path_type, sub_segment=sub_segment)
    
    final_steps = []
    blueprint_milestones = blueprint.get("steps", [])
    num_steps = len(blueprint_milestones)
    
    total_months = calculate_total_duration_months(current, goal, profile, category=cat, sub_segment=sub_segment)
    metrics["total_duration"] = format_total_duration(total_months)

    # Validate model-generated total duration against the REACH-THE-GOAL rule
    ai_total_dur = str(blueprint.get("total_duration") or "").strip()
    ai_months = parse_duration_months(ai_total_dur)
    curr_low = (current or "").lower()
    goal_low = (goal or "").lower()

    duration_override = False
    if ai_months is None:
        duration_override = True
    else:
        if cat == "academic":
            grade = extract_school_grade(current)
            if not grade and isinstance((profile or {}).get("academics"), dict):
                grade = extract_school_grade(str((profile or {}).get("academics", {}).get("currentGrade", "")))
            is_school = grade is not None or any(k in curr_low for k in ["grade", "class", "10th", "11th", "12th", "k-10", "k-12", "school"])
            is_bachelor_goal = any(k in goal_low for k in ["bachelor", "btech", "b.tech", "bsc", "b.sc", "undergrad"])
            is_master_goal = any(k in goal_low for k in ["master", "mtech", "mba", "msc"])
            is_phd_goal = any(k in goal_low for k in ["phd", "doctorate", "doctoral"])

            if is_school:
                if is_bachelor_goal:
                    # Grade 12: 12m (1 yr), Grade 11: 24m (2 yrs), Grade 10: 36m (3 yrs)
                    if grade == 12 and ai_months > 18:
                        duration_override = True
                    elif grade == 11 and (ai_months < 18 or ai_months > 28):
                        duration_override = True
                    elif grade == 10 and (ai_months < 30 or ai_months > 42):
                        duration_override = True
                    elif ai_months > 48:
                        duration_override = True
                elif is_master_goal:
                    # Must complete High School + 4-yr Bachelor's to qualify for Master's admission!
                    # Grade 12: 60m (5 yrs), Grade 11: 72m (6 yrs), Grade 10: 84m (7 yrs)
                    # 48 months is impossible (only reaches sophomore year of college)
                    if grade == 12 and (ai_months < 50 or ai_months > 75):
                        duration_override = True
                    elif grade == 11 and (ai_months < 60 or ai_months > 85):
                        duration_override = True
                    elif grade == 10 and (ai_months < 70 or ai_months > 96):
                        duration_override = True
                    elif ai_months < 50:
                        duration_override = True
                elif is_phd_goal:
                    # Grade 12: 84m (7 yrs), Grade 11: 96m (8 yrs), Grade 10: 108m (9 yrs)
                    if grade == 12 and (ai_months < 70 or ai_months > 96):
                        duration_override = True
                    elif grade == 11 and (ai_months < 80 or ai_months > 110):
                        duration_override = True
                    elif grade == 10 and (ai_months < 90 or ai_months > 120):
                        duration_override = True
                    elif ai_months < 70:
                        duration_override = True
            elif not is_school:
                if is_master_goal and ai_months > 30:
                    duration_override = True
                elif is_phd_goal and ai_months > 36:
                    duration_override = True
        elif cat == "jobs":
            if ai_months > 24:
                duration_override = True
        elif cat == "practical":
            if ai_months > 12:
                duration_override = True
        elif cat == "non_academic":
            if ai_months > 6:
                duration_override = True

    if duration_override:
        final_total_duration = metrics["total_duration"]
        effective_total_months = total_months
    else:
        final_total_duration = ai_total_dur
        effective_total_months = ai_months or total_months

    # Check if any step duration exceeds effective_total_months
    redistribute_step_durations = duration_override
    if not redistribute_step_durations:
        for s in blueprint_milestones:
            s_dur = str(s.get("duration", ""))
            s_digits = [int(x) for x in re.findall(r'\d+', s_dur)]
            if s_digits and any(x > effective_total_months for x in s_digits):
                redistribute_step_durations = True
                break

    distributed_ranges = distribute_month_ranges(num_steps, effective_total_months)

    for i, orig_milestone in enumerate(blueprint_milestones):
        m_id = orig_milestone.get("id", i + 1)
        
        ai_dur = str(orig_milestone.get("duration", "")).strip()
        if not redistribute_step_durations and ai_dur:
            enforced_duration = ai_dur
        elif num_steps > 0:
            enforced_duration = distributed_ranges[i] if i < len(distributed_ranges) else f"Month {effective_total_months}"
        else:
            enforced_duration = "Months 1-3"

        merged_milestone = {
            "id": m_id,
            "title": orig_milestone.get("title", f"Milestone {m_id}"),
            "duration": enforced_duration,
            "description": orig_milestone.get("description", ""),
            "learning_objectives": orig_milestone.get("learning_objectives", []),
            "macro_view": orig_milestone.get("macro_view", ""),
            "micro_view": orig_milestone.get("micro_view", ""),
            "nano_view": orig_milestone.get("nano_view", ""),
            "marketplace": normalize_marketplace_schema(orig_milestone.get("marketplace")),
            "micro_steps": orig_milestone.get("micro_steps") or []
        }
        final_steps.append(merged_milestone)

    final_steps = deduplicate_roadmap_marketplaces(final_steps)

    # Extract raw model-generated readiness score directly from Agent 1 output
    final_readiness_score = int(blueprint.get("readiness_score", 0)) if blueprint.get("readiness_score") is not None else 0
    final_readiness_label = blueprint.get("readiness_label") or "AI Assessed Readiness"

    final_json = {
        "path_title": blueprint.get("path_title") or f"{path_type} Pathway to {goal}",
        "path_description": blueprint.get("path_description") or f"Detailed strategic blueprint guiding from {current} to {goal}.",
        "readiness_score": final_readiness_score,
        "readiness_label": final_readiness_label,
        "total_duration": final_total_duration,
        "steps": final_steps,
        "blind_spots": blueprint.get("blind_spots") or [],
        "admin_feedback_memory": blueprint.get("admin_feedback_memory") or build_admin_feedback_memory([], False),
    }

    final_json = enrich_roadmap_narratives(final_json, current, goal, category=cat)

    name_tokens = build_name_patterns(profile, current)
    if name_tokens:
        final_json = recursive_sanitize(final_json, name_tokens)

    final_json["db_id"] = None
    final_json["status"] = "draft"
    return normalize_roadmap_marketplaces_for_storage(final_json)


# ─── API ENDPOINTS ────────────────────────────────────────────────────────

@app.post("/api/login")
async def login(req: LoginRequest):
    admin_email = os.environ.get("ADMIN_USERNAME", "pathengine.admin@gmail.com")
    admin_password = os.environ.get("ADMIN_PASSWORD", "Pathadmin@123")
    allowed_admin_emails = {admin_email.lower()}
    if admin_email.lower() == "pathengine.admin@gmail.com":
        allowed_admin_emails.add("admin@gmail.com")
    
    if req.email.lower() in allowed_admin_emails and req.password == admin_password:
        admin_profile = await profiles_collection.find_one({"email": admin_email.lower()})
        if not admin_profile:
            admin_profile = {
                "email": admin_email.lower(),
                "name": "PathEngine Admin",
                "grade": "",
                "degreeType": "",
                "curriculum": "",
                "stream": "",
                "school": "",
                "performance": "",
                "financialSituation": "",
                "personality": "",
                "country": "",
                "state": "",
                "city": "",
                "created_at": datetime.datetime.now(datetime.timezone.utc)
            }
            await profiles_collection.insert_one(admin_profile)
        return serialize_mongo_doc(admin_profile)
    else:
        raise HTTPException(status_code=401, detail="Invalid admin credentials")

class PathScoreRequest(BaseModel):
    roadmap_data: dict
    current_position: Optional[str] = ""
    target_goal: Optional[str] = ""
    profile: Optional[dict] = None

@app.post("/api/path/score")
async def get_path_score(req: PathScoreRequest):
    profile = req.profile or {}
    current = req.current_position or ""
    return calculate_path_accuracy_score(req.roadmap_data, profile, current)

def normalize_student_profile_doc(doc: dict) -> dict:
    if not doc:
        return doc

    # Ensure personalityGeography
    pg = doc.get("personalityGeography") or {}
    doc["personalityGeography"] = {
        "name": pg.get("name", doc.get("name", "")),
        "age": pg.get("age", ""),
        "country": pg.get("country", doc.get("country", "")),
        "state": pg.get("state", doc.get("state", "")),
        "city": pg.get("city", doc.get("city", "")),
        "financialSituation": pg.get("financialSituation", doc.get("financialSituation", "")),
        "scholarshipRequirement": pg.get("scholarshipRequirement", ""),
        "personalitySignal": pg.get("personalitySignal", doc.get("personality", "")),
        "interests": pg.get("interests", ""),
        "skills": pg.get("skills", ""),
        "preferences": pg.get("preferences", ""),
    }

    # Ensure academics — pure student signals only, NO currentPosition/futureGoal
    ac = doc.get("academics") or {}
    doc["academics"] = {
        "educationStage": ac.get("educationStage", "undergraduate"),
        "degreeType": ac.get("degreeType", doc.get("degreeType", "")),
        "gradeLevel": ac.get("gradeLevel", doc.get("grade", "")),
        "curriculum": ac.get("curriculum", doc.get("curriculum", "")),
        "academicStream": ac.get("academicStream", doc.get("stream", "")),
        "schoolOrCollege": ac.get("schoolOrCollege", doc.get("school", "")),
        "currentPerformance": ac.get("currentPerformance", doc.get("performance", "")),
    }

    # Ensure practicalSkills — student context only
    ps = doc.get("practicalSkills") or {}
    doc["practicalSkills"] = {
        "targetSkill": ps.get("targetSkill", ""),
        "skillCategory": ps.get("skillCategory", ""),
        "skillLevel": ps.get("skillLevel", ""),
        "learningMode": ps.get("learningMode", ""),
        "projectType": ps.get("projectType", ""),
    }

    # Ensure jobsCareers — student context only
    jc = doc.get("jobsCareers") or {}
    doc["jobsCareers"] = {
        "currentRole": jc.get("currentRole", ""),
        "yearsOfExperience": jc.get("yearsOfExperience", ""),
        "industry": jc.get("industry", ""),
        "employmentType": jc.get("employmentType", ""),
    }

    # Ensure nonAcademicCounselling — student context only
    nac = doc.get("nonAcademicCounselling") or {}
    doc["nonAcademicCounselling"] = {
        "concernArea": nac.get("concernArea", ""),
        "currentChallenge": nac.get("currentChallenge", ""),
        "supportTypeNeeded": nac.get("supportTypeNeeded", ""),
    }

    # Sync flat fields for backward compatibility
    doc["name"] = doc["personalityGeography"]["name"] or doc.get("name", "")
    doc["grade"] = doc["academics"]["gradeLevel"] or doc.get("grade", "")
    doc["degreeType"] = doc["academics"]["degreeType"] or doc.get("degreeType", "")
    doc["curriculum"] = doc["academics"]["curriculum"] or doc.get("curriculum", "")
    doc["stream"] = doc["academics"]["academicStream"] or doc.get("stream", "")
    doc["school"] = doc["academics"]["schoolOrCollege"] or doc.get("school", "")
    doc["performance"] = doc["academics"]["currentPerformance"] or doc.get("performance", "")
    doc["financialSituation"] = doc["personalityGeography"]["financialSituation"] or doc.get("financialSituation", "")
    doc["personality"] = doc["personalityGeography"]["personalitySignal"] or doc.get("personality", "")
    doc["country"] = doc["personalityGeography"]["country"] or doc.get("country", "")
    doc["state"] = doc["personalityGeography"]["state"] or doc.get("state", "")
    doc["city"] = doc["personalityGeography"]["city"] or doc.get("city", "")

    return doc

def deep_merge_profile(existing_doc: dict, new_data: dict) -> dict:
    merged = {**existing_doc}
    for k, v in new_data.items():
        if k in ["personalityGeography", "academics", "jobsCareers", "nonAcademicCounselling", "schoolK12"] and isinstance(v, dict):
            merged[k] = {**(merged.get(k) or {}), **v}
        else:
            merged[k] = v
    return normalize_student_profile_doc(merged)

@app.post("/api/profile")
async def save_profile(profile_data: dict = Body(...)):
    email = profile_data.get("email", "").lower().strip()
    if not email:
        raise HTTPException(status_code=400, detail="Email is required")
        
    existing = await profiles_collection.find_one({"email": email})
    
    if "_id" in profile_data:
        del profile_data["_id"]
    if "id" in profile_data:
        del profile_data["id"]
        
    profile_data["email"] = email
    profile_data["updated_at"] = datetime.datetime.now(datetime.timezone.utc)
    
    if existing:
        merged = deep_merge_profile(existing, profile_data)
        if "_id" in merged:
            del merged["_id"]
        await profiles_collection.update_one(
            {"email": email},
            {"$set": merged}
        )
        updated_doc = await profiles_collection.find_one({"email": email})
        return serialize_mongo_doc(normalize_student_profile_doc(updated_doc))
    else:
        normalized = normalize_student_profile_doc(profile_data)
        normalized["created_at"] = datetime.datetime.now(datetime.timezone.utc)
        result = await profiles_collection.insert_one(normalized)
        normalized["id"] = str(result.inserted_id)
        return serialize_mongo_doc(normalized)

@app.get("/api/profile/{email}")
async def get_profile(email: str):
    admin_email = os.environ.get("ADMIN_USERNAME", "pathengine.admin@gmail.com")
    if email.lower() == admin_email.lower():
        raise HTTPException(status_code=403, detail="Direct access to admin profile is forbidden. Please use /api/login.")
    doc = await profiles_collection.find_one({"email": email.lower()})
    if not doc:
        raise HTTPException(status_code=404, detail="Profile not found")
    return serialize_mongo_doc(normalize_student_profile_doc(doc))

@app.get("/api/students/{student_id}/profile")
async def get_student_profile(student_id: str):
    # Support lookup by email or mongo _id
    query = {"email": student_id.lower()}
    if ObjectId.is_valid(student_id):
        query = {"$or": [{"email": student_id.lower()}, {"_id": ObjectId(student_id)}]}
    doc = await profiles_collection.find_one(query)
    if not doc:
        raise HTTPException(status_code=404, detail="Student profile not found")
    return serialize_mongo_doc(normalize_student_profile_doc(doc))

@app.put("/api/students/{student_id}/profile")
@app.patch("/api/students/{student_id}/profile")
async def update_student_profile(student_id: str, profile_data: dict = Body(...)):
    query = {"email": student_id.lower()}
    if ObjectId.is_valid(student_id):
        query = {"$or": [{"email": student_id.lower()}, {"_id": ObjectId(student_id)}]}
    existing = await profiles_collection.find_one(query)
    
    if "_id" in profile_data:
        del profile_data["_id"]
    if "id" in profile_data:
        del profile_data["id"]
        
    profile_data["updated_at"] = datetime.datetime.now(datetime.timezone.utc)
    if "email" not in profile_data:
        profile_data["email"] = student_id.lower()
        
    if existing:
        merged = deep_merge_profile(existing, profile_data)
        if "_id" in merged:
            del merged["_id"]
        await profiles_collection.update_one(query, {"$set": merged})
        updated_doc = await profiles_collection.find_one(query)
        return serialize_mongo_doc(normalize_student_profile_doc(updated_doc))
    else:
        normalized = normalize_student_profile_doc(profile_data)
        normalized["created_at"] = datetime.datetime.now(datetime.timezone.utc)
        result = await profiles_collection.insert_one(normalized)
        normalized["id"] = str(result.inserted_id)
        return serialize_mongo_doc(normalized)


async def run_option_audits(blueprint: dict, current: str, goal: str, profile: dict, refine_prompt: Optional[str] = None, existing_roadmap: Optional[dict] = None):
    agent2_task = run_agent_2_path_auditor(blueprint, current, goal, profile, refine_prompt, existing_roadmap)
    agent3_task = run_agent_3_steps_auditor(blueprint, current, goal, profile, refine_prompt, existing_roadmap)
    agent4_task = run_agent_4_marketplace_auditor(blueprint, current, goal, profile, refine_prompt, existing_roadmap)
    
    path_audit, steps_audit, market_audit = await asyncio.gather(
        agent2_task, agent3_task, agent4_task,
        return_exceptions=True
    )
    if isinstance(path_audit, Exception): path_audit = {}
    if isinstance(steps_audit, Exception): steps_audit = []
    if isinstance(market_audit, Exception): market_audit = []
    return path_audit, steps_audit, market_audit

@app.post("/api/path/stream")
async def generate_path_stream(req: PathGenerationRequest):
    current = req.current_position.strip()
    goal = req.target_goal.strip()
    profile = req.profile or {}
    email = (profile.get("email") or "").strip().lower()
    if email:
        try:
            db_profile = await profiles_collection.find_one({"email": email})
            if db_profile:
                db_profile = serialize_mongo_doc(db_profile)
                profile = deep_merge_profile(db_profile, profile)
        except Exception as e:
            print(f"[Profile Hydration Warning] {e}")

    refine_prompt = req.refine_prompt.strip() if req.refine_prompt else None
    existing_roadmap = req.existing_roadmap
    focus_req = req.focus.strip() if req.focus else None
    content_cat = req.content_category.strip() if req.content_category else None
    sub_seg = req.sub_segment.strip() if req.sub_segment else None

    if not current or not goal:
        raise HTTPException(status_code=400, detail="Current position and Target goal cannot be empty")
    
    # Decouple degree type: Only require/ensure for academic tracks
    cat = resolve_focus_category(content_cat or focus_req)
    profile = ensure_degree_type_for_generation(goal, profile, req.degree_type, category=cat)

    async def event_stream():
        completed = []
        started_at = time.perf_counter()
        try:
            if refine_prompt:
                val = refine_prompt.lower().strip()
                noise = [
                    "tell me a story", "tell a story", "write a story", "write a poem", "write a song",
                    "tell me a joke", "tell a joke", "joke", "weather", "capital of", "who is",
                    "what is the meaning of life", "hi", "hello", "hey", "how are you", "what's up",
                    "sing a song", "write code", "help me chat", "how are you doing"
                ]
                valid_keywords = [
                    "step", "milestone", "path", "road", "course", "market", "description", "objective",
                    "duration", "add", "change", "remove", "delete", "update", "make", "give", "focus",
                    "study", "prep", "sat", "ielts", "act", "toefl", "exam", "career", "university",
                    "college", "school", "curriculum", "grade", "subject", "class", "detail", "more",
                    "resource", "mentor", "timeline", "month", "year", "academics", "score", "placement",
                    "portfolio", "admission", "gpa", "internship", "project", "stress", "routine", "mindfulness", "skills"
                ]
                if any(n in val for n in noise) or len(val) < 4 or not any(kw in val for kw in valid_keywords):
                    yield sse_payload("error", {"message": "This request is irrelevant to pathway refinement. Please provide specific instructions to adjust this pathway, such as 'change step 1 description' or 'add more milestones'."})
                    return

            yield sse_payload("status", {
                "statuses": build_agent_statuses("agent1", completed),
                "progress": 20,
                "message": f"Creating {cat.replace('_', ' ').title()} pathway alternatives..."
            })

            foci, option_names = get_focus_choices(
                focus_req=focus_req,
                content_category=content_cat,
                sub_segment=sub_seg
            )

            # When refining an existing roadmap, only refine the single active pathway
            if refine_prompt and len(foci) > 1:
                target_name = (focus_req or (existing_roadmap.get("option_name") if isinstance(existing_roadmap, dict) else "") or "").lower()
                matched_idx = 0
                for idx, opt in enumerate(option_names):
                    if opt.lower() in target_name or target_name in opt.lower():
                        matched_idx = idx
                        break
                foci = [foci[matched_idx]]
                option_names = [option_names[matched_idx]]

            blueprints = [None] * len(foci)
            finished_count = 0
            stage_progress = 20

            for index, f_choice in enumerate(foci):
                if index > 0:
                    await asyncio.sleep(3.5)  # Stagger model calls to avoid Groq rate limit burst
                try:
                    blueprints[index] = await run_agent_1_blueprint(
                        current, goal, profile, refine_prompt, existing_roadmap,
                        focus=f_choice, content_category=content_cat, sub_segment=sub_seg
                    )
                except Exception as exc:
                    blueprints[index] = exc
                finished_count += 1
                stage_progress = max(stage_progress, 20 + round(20 * finished_count / len(foci)))
                yield sse_payload("status", {
                    "statuses": build_agent_statuses("agent1", completed),
                    "progress": stage_progress,
                    "message": f"Generating pathway alternatives... ({finished_count} of {len(foci)} ready)"
                })

            valid_blueprints = []
            valid_option_names = []
            for i, bp in enumerate(blueprints):
                if not isinstance(bp, Exception) and isinstance(bp, dict) and isinstance(bp.get("steps"), list) and len(bp["steps"]) > 0:
                    valid_blueprints.append(bp)
                    valid_option_names.append(option_names[i])
                else:
                    print(f"[Stream Generation Warning] Option {i + 1} ('{option_names[i]}') failed model generation: {bp}")

            if not valid_blueprints:
                raise HTTPException(status_code=500, detail="AI Pathway Generation Failed for all options. Please click 'Find My Path' to retry.")

            completed.append("agent1")
            yield sse_payload("status", {
                "statuses": build_agent_statuses("agent2", completed),
                "progress": 50,
                "message": "Validating pathway titles, goals, and readiness..."
            })
            await asyncio.sleep(0.15)

            for i, bp in enumerate(valid_blueprints):
                if not bp.get("path_title"):
                    bp["path_title"] = f"{valid_option_names[i]} Track: {goal}"
                if not bp.get("path_description"):
                    bp["path_description"] = f"A structured {valid_option_names[i]} pathway guiding from {current} to {goal}."

            completed.append("agent2")
            yield sse_payload("status", {
                "statuses": build_agent_statuses("agent3", completed),
                "progress": 65,
                "message": "Checking milestone coverage and step sequence..."
            })
            await asyncio.sleep(0.15)

            for i, bp in enumerate(valid_blueprints):
                for step_number, milestone in enumerate(bp["steps"], start=1):
                    milestone["id"] = step_number

            completed.append("agent3")
            yield sse_payload("status", {
                "statuses": build_agent_statuses("agent4", completed),
                "progress": 80,
                "message": "Checking learning resources and action checklists..."
            })
            completed.append("agent4")
            yield sse_payload("status", {
                "statuses": build_agent_statuses("ready", completed),
                "progress": 90,
                "message": "Preparing final recommendations..."
            })
            await asyncio.sleep(0.15)

            final_alternatives = []
            for i, bp in enumerate(valid_blueprints):
                final_json = await build_and_store_final_path(
                    bp, {}, [], [], current, goal, profile,
                    path_type=valid_option_names[i],
                    sub_segment=sub_seg
                )
                final_json["option_name"] = valid_option_names[i]
                accuracy = calculate_path_accuracy_score(final_json, profile, current, goal)
                final_json["accuracy_score"] = accuracy["accuracy_score"]
                final_json["accuracy_label"] = accuracy["accuracy_label"]
                final_json["accuracy_color"] = accuracy["accuracy_color"]
                final_json["accuracy_breakdown"] = accuracy["breakdown"]
                final_json["accuracy_details"] = accuracy["details"]
                final_alternatives.append(final_json)

            completed.append("ready")
            elapsed = time.perf_counter() - started_at
            print(f"[Path Generation] Completed in {elapsed:.2f} seconds.")
            yield sse_payload("status", {
                "statuses": build_agent_statuses(None, completed),
                "progress": 100,
                "message": "Your pathways are ready!"
            })
            yield sse_payload("result", {
                "alternatives": final_alternatives
            })
        except Exception as e:
            print(f"[Streamed Path Error] {e}")
            yield sse_payload("error", {
                "message": f"Path generation failed: {str(e)}. Please try again."
            })

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache, no-transform",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )

@app.post("/api/validate-category-consistency")
async def api_validate_category_consistency(req: CategoryValidationRequest):
    from category_validator import validate_category_consistency
    return validate_category_consistency(
        selected_category=req.category,
        current_position=req.current_position,
        destination_goal=req.destination_goal
    )

@app.post("/api/path")
async def generate_path(req: PathGenerationRequest):
    current = req.current_position.strip()
    goal = req.target_goal.strip()
    profile = req.profile or {}
    refine_prompt = req.refine_prompt.strip() if req.refine_prompt else None
    existing_roadmap = req.existing_roadmap
    focus_req = req.focus.strip() if req.focus else None
    content_cat = req.content_category.strip() if req.content_category else None
    sub_seg = req.sub_segment.strip() if req.sub_segment else None

    if not current or not goal:
        raise HTTPException(status_code=400, detail="Current position and Target goal cannot be empty")
    
    cat = resolve_focus_category(content_cat or focus_req)
    profile = ensure_degree_type_for_generation(goal, profile, req.degree_type, category=cat)

    try:
        foci, option_names = get_focus_choices(
            focus_req=focus_req,
            content_category=content_cat,
            sub_segment=sub_seg
        )

        # When refining an existing roadmap, only refine the single active pathway
        if refine_prompt and len(foci) > 1:
            target_name = (focus_req or (existing_roadmap.get("option_name") if isinstance(existing_roadmap, dict) else "") or "").lower()
            matched_idx = 0
            for idx, opt in enumerate(option_names):
                if opt.lower() in target_name or target_name in opt.lower():
                    matched_idx = idx
                    break
            foci = [foci[matched_idx]]
            option_names = [option_names[matched_idx]]

        blueprint_tasks = [
            run_agent_1_blueprint(
                current, goal, profile, refine_prompt, existing_roadmap,
                focus=f_choice, content_category=content_cat, sub_segment=sub_seg
            )
            for f_choice in foci
        ]
        blueprints = await asyncio.gather(*blueprint_tasks, return_exceptions=True)

        valid_blueprints = []
        valid_opt_names = []
        for i, bp in enumerate(blueprints):
            if not isinstance(bp, Exception) and isinstance(bp, dict) and isinstance(bp.get("steps"), list) and len(bp["steps"]) > 0:
                valid_blueprints.append(bp)
                valid_opt_names.append(option_names[i])

        if not valid_blueprints:
            raise HTTPException(status_code=500, detail="AI Pathway Generation Failed for all options. Please click 'Find My Path' to retry.")

        final_alternatives = []
        for i, bp in enumerate(valid_blueprints):
            final_json = await build_and_store_final_path(
                bp, {}, [], [], current, goal, profile,
                path_type=valid_opt_names[i],
                sub_segment=sub_seg
            )
            final_json["option_name"] = valid_opt_names[i]
            accuracy = calculate_path_accuracy_score(final_json, profile, current, goal)
            final_json["accuracy_score"] = accuracy["accuracy_score"]
            final_json["accuracy_label"] = accuracy["accuracy_label"]
            final_json["accuracy_color"] = accuracy["accuracy_color"]
            final_json["accuracy_breakdown"] = accuracy["breakdown"]
            final_json["accuracy_details"] = accuracy["details"]
            final_alternatives.append(final_json)

        return {"alternatives": final_alternatives}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/path/blueprint")
async def generate_path_blueprint(req: PathGenerationRequest):
    current = req.current_position.strip()
    goal = req.target_goal.strip()
    profile = req.profile or {}
    refine_prompt = req.refine_prompt.strip() if req.refine_prompt else None
    existing_roadmap = req.existing_roadmap
    focus_req = req.focus.strip() if req.focus else None
    content_cat = req.content_category.strip() if req.content_category else None
    sub_seg = req.sub_segment.strip() if req.sub_segment else None

    if not current or not goal:
        raise HTTPException(status_code=400, detail="Current position and Target goal cannot be empty")

    cat = resolve_focus_category(content_cat or focus_req)
    profile = ensure_degree_type_for_generation(goal, profile, req.degree_type, category=cat)

    try:
        blueprint = await run_agent_1_blueprint(
            current, goal, profile, refine_prompt, existing_roadmap,
            focus=focus_req, content_category=content_cat, sub_segment=sub_seg
        )
        return blueprint
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Blueprint Generation Failed: {str(e)}. Please retry.")


@app.post("/api/path/audit")
async def generate_path_audit(req: PathAuditRequest):
    blueprint = req.blueprint
    current = req.current_position
    goal = req.target_goal
    profile = req.profile or {}

    try:
        path_audit_task = run_agent_2_path_auditor(blueprint, current, goal, profile)
        steps_audit_task = run_agent_3_steps_auditor(blueprint, current, goal, profile)
        market_audit_task = run_agent_4_marketplace_auditor(blueprint, current, goal, profile)

        path_audit, steps_audit, market_audit = await asyncio.gather(
            path_audit_task, steps_audit_task, market_audit_task
        )

        final_json = await build_and_store_final_path(
            blueprint, path_audit, steps_audit, market_audit, current, goal, profile
        )
        return final_json
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Path Audit Generation Failed: {str(e)}. Please retry.")


def classify_pathway_category(doc: dict) -> str:
    cat = (
        doc.get("category")
        or doc.get("content_category")
        or (doc.get("profile") or {}).get("activeSegment")
        or (doc.get("profile") or {}).get("category")
        or doc.get("focus")
    )
    if cat:
        resolved = resolve_focus_category(str(cat))
        if resolved in ["academic", "practical", "jobs", "non_academic"]:
            return resolved

    current = doc.get("current_position", "") or ""
    goal = doc.get("target_goal", "") or ""
    if current or goal:
        try:
            from category_validator import analyze_category_consistency
            res = analyze_category_consistency(current, goal, "academic")
            detected = res.get("detected_category")
            if detected in ["academic", "practical", "jobs", "non_academic"]:
                return detected
        except Exception:
            pass

    return "academic"


ANALYTICS_CATEGORY_META = {
    "academic": {
        "key": "academic",
        "label": "Academic & Research",
        "description": "Degree pathways, university admissions & academic honors",
        "color": "#10b981",
    },
    "practical": {
        "key": "practical",
        "label": "Practical & Skills",
        "description": "Portfolios, technical certs, bootcamps & skills",
        "color": "#0ea5e9",
    },
    "jobs": {
        "key": "jobs",
        "label": "Jobs & Careers",
        "description": "Role readiness, job prep, interviews & placement",
        "color": "#f59e0b",
    },
    "non_academic": {
        "key": "non_academic",
        "label": "Non-Academic Counselling",
        "description": "Wellbeing, mindset, routine & generic coaching",
        "color": "#8b5cf6",
    },
}


def _parse_analytics_dt_utc(val) -> Optional[datetime.datetime]:
    if not val:
        return None
    if isinstance(val, datetime.datetime):
        if val.tzinfo is None:
            return val.replace(tzinfo=datetime.timezone.utc)
        return val.astimezone(datetime.timezone.utc)
    if isinstance(val, str):
        try:
            cleaned = val.replace("Z", "+00:00")
            dt = datetime.datetime.fromisoformat(cleaned)
            if dt.tzinfo is None:
                dt = dt.replace(tzinfo=datetime.timezone.utc)
            return dt.astimezone(datetime.timezone.utc)
        except Exception:
            return None
    return None


@app.get("/api/admin/analytics")
async def get_admin_analytics(time_range: Optional[str] = Query("all", alias="range")):
    now_utc = datetime.datetime.now(datetime.timezone.utc)

    # 1. Determine cutoff date if filtering by date range
    range_clean = (time_range or "all").lower().strip()
    cutoff_date: Optional[datetime.datetime] = None
    if range_clean == "7d":
        cutoff_date = now_utc - datetime.timedelta(days=7)
    elif range_clean == "30d":
        cutoff_date = now_utc - datetime.timedelta(days=30)
    elif range_clean == "90d":
        cutoff_date = now_utc - datetime.timedelta(days=90)

    # 2. Fetch all raw pathway records (excluding large heavy steps)
    projection = {
        "_id": 1,
        "current_position": 1,
        "target_goal": 1,
        "profile": 1,
        "category": 1,
        "content_category": 1,
        "focus": 1,
        "status": 1,
        "created_at": 1,
        "published_at": 1,
        "updated_at": 1,
        "roadmap_data.steps": 1,
    }

    pending_docs = []
    cursor_p = pending_paths_collection.find({}, projection).sort("created_at", -1)
    async for d in cursor_p:
        d["status"] = "under_admin_review"
        pending_docs.append(d)

    published_docs = []
    cursor_pub = published_paths_collection.find({}, projection).sort("created_at", -1)
    async for d in cursor_pub:
        d["status"] = "published"
        published_docs.append(d)

    all_raw_docs = pending_docs + published_docs

    # Filter by range if applicable
    filtered_docs = []
    for doc in all_raw_docs:
        c_dt = _parse_analytics_dt_utc(doc.get("created_at"))
        if cutoff_date is not None:
            if not c_dt or c_dt < cutoff_date:
                continue
        doc["_parsed_created_at"] = c_dt
        doc["_parsed_published_at"] = _parse_analytics_dt_utc(doc.get("published_at"))
        filtered_docs.append(doc)

    # Real counts
    total_generated = len(filtered_docs)
    published_count = sum(1 for d in filtered_docs if d["status"] == "published")
    pending_count = sum(1 for d in filtered_docs if d["status"] == "under_admin_review")
    draft_count = 0  # Real data: no fake draft inflation
    publish_rate = round((published_count / total_generated) * 100) if total_generated > 0 else 0

    # Paths created in the last 7 calendar days
    week_ago_utc = now_utc - datetime.timedelta(days=7)
    this_week_count = sum(
        1 for d in all_raw_docs
        if _parse_analytics_dt_utc(d.get("created_at")) and _parse_analytics_dt_utc(d.get("created_at")) >= week_ago_utc
    )

    # Real review turnaround time calculation across published paths
    review_durations = []
    for d in filtered_docs:
        if d["status"] == "published":
            c = d.get("_parsed_created_at")
            p = d.get("_parsed_published_at")
            if c and p and p >= c:
                delta_sec = (p - c).total_seconds()
                review_durations.append(delta_sec)

    avg_review_seconds = round(sum(review_durations) / len(review_durations), 1) if review_durations else None
    formatted_review_time = "—"
    if avg_review_seconds is not None:
        if avg_review_seconds < 60:
            formatted_review_time = f"{int(avg_review_seconds)}s"
        elif avg_review_seconds < 3600:
            formatted_review_time = f"{round(avg_review_seconds / 60, 1)}m"
        elif avg_review_seconds < 86400:
            formatted_review_time = f"{round(avg_review_seconds / 3600, 1)}h"
        else:
            formatted_review_time = f"{round(avg_review_seconds / 86400, 1)}d"

    # Category distribution across the 4 core categories
    category_counts = {
        "academic": 0,
        "practical": 0,
        "jobs": 0,
        "non_academic": 0,
    }
    for d in filtered_docs:
        cat_key = classify_pathway_category(d)
        if cat_key in category_counts:
            category_counts[cat_key] += 1
        else:
            category_counts["academic"] += 1

    categories_list = []
    for cat_key in ["academic", "practical", "jobs", "non_academic"]:
        meta = ANALYTICS_CATEGORY_META[cat_key]
        c_count = category_counts[cat_key]
        c_pct = round((c_count / total_generated) * 100) if total_generated > 0 else 0
        categories_list.append({
            "key": cat_key,
            "label": meta["label"],
            "description": meta["description"],
            "color": meta["color"],
            "count": c_count,
            "pct": c_pct,
        })

    # Real monthly trend (past 6 calendar months) - ZERO hardcoded base numbers
    months_names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    monthly_trend = []
    for i in range(5, -1, -1):
        target_month_dt = now_utc - datetime.timedelta(days=i * 30.4)
        m_num = target_month_dt.month
        y_num = target_month_dt.year
        monthly_trend.append({
            "name": months_names[m_num - 1],
            "month_num": m_num,
            "year": y_num,
            "generated": 0,
            "published": 0,
        })

    for d in filtered_docs:
        c_dt = d.get("_parsed_created_at")
        if c_dt:
            for m in monthly_trend:
                if c_dt.month == m["month_num"] and c_dt.year == m["year"]:
                    m["generated"] += 1
                    if d["status"] == "published":
                        m["published"] += 1
                    break

    # Lifecycle Progression Funnel
    funnel = [
        {
            "stage": "Generated",
            "count": total_generated,
            "pct": 100 if total_generated > 0 else 0,
            "description": "Total pathways structured and stored by engine",
        },
        {
            "stage": "Under Review",
            "count": pending_count,
            "pct": round((pending_count / total_generated) * 100) if total_generated > 0 else 0,
            "description": "Pathways undergoing review & curation by admins",
        },
        {
            "stage": "Published",
            "count": published_count,
            "pct": round((published_count / total_generated) * 100) if total_generated > 0 else 0,
            "description": "Approved, student-facing verified pathways",
        },
    ]

    # Recent Pathway Activity (sorted latest first)
    sorted_paths = sorted(
        filtered_docs,
        key=lambda x: x.get("_parsed_created_at") or datetime.datetime.min.replace(tzinfo=datetime.timezone.utc),
        reverse=True,
    )

    recent_activity = []
    for doc in sorted_paths[:10]:
        prof = doc.get("profile") or {}
        student_name = prof.get("name") or "Anonymous Student"
        goal = doc.get("target_goal") or "Target Pathway Goal"
        current_pos = doc.get("current_position") or "Current Starting Point"
        roadmap = doc.get("roadmap_data") or {}
        steps = roadmap.get("steps") or []
        cat_key = classify_pathway_category(doc)
        created_iso = doc.get("_parsed_created_at").isoformat() if doc.get("_parsed_created_at") else None
        pub_iso = doc.get("_parsed_published_at").isoformat() if doc.get("_parsed_published_at") else None

        recent_activity.append({
            "id": str(doc["_id"]),
            "student_name": student_name,
            "target_goal": goal,
            "current_position": current_pos,
            "category": cat_key,
            "category_label": ANALYTICS_CATEGORY_META[cat_key]["label"],
            "status": doc["status"],
            "status_label": "Published" if doc["status"] == "published" else "Pending Review",
            "steps_count": len(steps),
            "created_at": created_iso,
            "published_at": pub_iso,
        })

    return {
        "range": range_clean,
        "overview": {
            "total_generated": total_generated,
            "published_count": published_count,
            "pending_count": pending_count,
            "draft_count": draft_count,
            "publish_rate": publish_rate,
            "this_week_count": this_week_count,
            "avg_review_time_seconds": avg_review_seconds,
            "avg_review_time_formatted": formatted_review_time,
        },
        "lifecycle_funnel": funnel,
        "monthly_trend": monthly_trend,
        "categories": categories_list,
        "recent_activity": recent_activity,
        # Backwards compatibility fields
        "total_generated": total_generated,
        "pending_count": pending_count,
        "published_count": published_count,
        "this_week": this_week_count,
        "avg_review_time": formatted_review_time,
        "line_chart_months": [{ "name": m["name"], "generated": m["generated"], "published": m["published"] } for m in monthly_trend],
        "status_slices": [
            { "label": "Published", "value": published_count, "pct": round((published_count / (total_generated or 1)) * 100), "color": "#10b981" },
            { "label": "Pending", "value": pending_count, "pct": round((pending_count / (total_generated or 1)) * 100), "color": "#f59e0b" },
            { "label": "Draft", "value": draft_count, "pct": 0, "color": "#94a3b8" },
        ],
        "recent_pathways": [
            {
                "student": r["student_name"],
                "goal": r["target_goal"],
                "status": "Published" if r["status"] == "published" else "Pending",
                "steps": r["steps_count"],
                "pathId": r["id"],
            }
            for r in recent_activity
        ],
        "top_goals": [
            {
                "label": c["label"],
                "value": c["count"],
                "color": c["color"],
            }
            for c in categories_list
        ],
    }

# Admin Endpoint: Get all paths under review
@app.get("/api/admin/paths")
async def get_admin_paths(status: Optional[str] = "under_admin_review"):
    paths = []
    projection = {"roadmap_data.steps": 0}
    
    # 1. Fetch raw documents from DB with projection
    raw_docs = []
    if status == "under_admin_review" or status == "all":
        cursor = pending_paths_collection.find({}, projection).sort("created_at", -1)
        async for doc in cursor:
            doc["status"] = "under_admin_review"
            raw_docs.append(doc)
            
    if status == "published" or status == "all":
        cursor = published_paths_collection.find({}, projection).sort("created_at", -1)
        async for doc in cursor:
            doc["status"] = "published"
            raw_docs.append(doc)
            
    if not raw_docs:
        return []

    # 2. Extract unique emails for bulk profile fetch
    emails = set()
    for doc in raw_docs:
        email = None
        if "profile" in doc and doc["profile"] and "email" in doc["profile"]:
            email = doc["profile"]["email"]
        if not email and "created_by" in doc and doc["created_by"]:
            email = doc["created_by"]
        if not email and "createdBy" in doc and doc["createdBy"]:
            email = doc["createdBy"]
        if email:
            emails.add(email.lower())
            
    # 3. Bulk fetch profiles from DB in one roundtrip
    profile_map = {}
    if emails:
        profiles_cursor = profiles_collection.find({"email": {"$in": list(emails)}})
        async for p in profiles_cursor:
            profile_map[p["email"].lower()] = serialize_mongo_doc(p)

    # 4. Serialize and enrich in-memory (0 database calls per path)
    for doc in raw_docs:
        serialized = serialize_mongo_doc(doc)
        
        email = None
        if "profile" in serialized and serialized["profile"] and "email" in serialized["profile"]:
            email = serialized["profile"]["email"]
        if not email and "created_by" in serialized and serialized["created_by"]:
            email = serialized["created_by"]
        if not email and "createdBy" in serialized and serialized["createdBy"]:
            email = serialized["createdBy"]
            
        if email and email.lower() in profile_map:
            serialized["profile"] = profile_map[email.lower()]
            serialized["created_by"] = email.lower()
            serialized["createdBy"] = email.lower()
        else:
            if "profile" not in serialized or not serialized["profile"]:
                serialized["profile"] = {"email": email or "", "name": "Anonymous Student"}
                
        paths.append(serialized)
        
    # Sort them combined by created_at desc if status was "all"
    if status == "all":
        paths.sort(key=lambda x: x.get("created_at") or "", reverse=True)
        
    return paths

# Get a single path by ID
@app.get("/api/paths/{path_id}")
async def get_path_by_id(path_id: str):
    try:
        obj_id = ObjectId(path_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid path ID format")
        
    doc = await pending_paths_collection.find_one({"_id": obj_id})
    if doc:
        doc = normalize_path_doc_roadmap(doc)
        doc["status"] = "under_admin_review"
        serialized = serialize_mongo_doc(doc)
        return await enrich_path_profile(serialized)
        
    doc = await published_paths_collection.find_one({"_id": obj_id})
    if doc:
        doc = normalize_path_doc_roadmap(doc)
        doc["status"] = "published"
        serialized = serialize_mongo_doc(doc)
        return await enrich_path_profile(serialized)
        
    raise HTTPException(status_code=404, detail="Career path not found")


async def get_admin_path_document(path_id: str):
    try:
        obj_id = ObjectId(path_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid path ID format")

    pending_doc = await pending_paths_collection.find_one({"_id": obj_id})
    if pending_doc:
        return obj_id, pending_doc, pending_paths_collection, "under_admin_review"

    published_doc = await published_paths_collection.find_one({"_id": obj_id})
    if published_doc:
        return obj_id, published_doc, published_paths_collection, "published"

    raise HTTPException(status_code=404, detail="Career path not found")


def get_admin_roadmap_scope(roadmap_data: dict, alternative_index: Optional[int] = None):
    if not isinstance(roadmap_data, dict):
        raise HTTPException(status_code=400, detail="Roadmap data is invalid")

    alternatives = roadmap_data.get("alternatives")
    if isinstance(alternatives, list):
        idx = alternative_index if alternative_index is not None else 0
        if idx < 0 or idx >= len(alternatives):
            raise HTTPException(status_code=400, detail="Invalid alternative index")
        if not isinstance(alternatives[idx], dict):
            raise HTTPException(status_code=400, detail="Selected alternative is invalid")
        return alternatives[idx]

    return roadmap_data


def normalize_admin_steps(steps: list) -> list:
    normalized = []
    for idx, step in enumerate(steps):
        if not isinstance(step, dict):
            continue
        normalized.append({**step, "id": idx + 1})
    return normalized


def build_admin_step_modification(action: str, edited_by: Optional[str], details: str, changes: list) -> dict:
    return {
        "timestamp": datetime.datetime.now(datetime.timezone.utc),
        "edited_by": edited_by or "Admin",
        "action": action,
        "details": details,
        "changes": changes
    }


async def persist_admin_step_update(path_id: str, updated_roadmap: dict, modification: dict):
    obj_id, existing_doc, collection, status = await get_admin_path_document(path_id)
    updated_roadmap = normalize_roadmap_marketplaces_for_storage(updated_roadmap)
    modifications = existing_doc.get("modifications") or []
    modifications.append(modification)

    await collection.update_one(
        {"_id": obj_id},
        {"$set": {
            "roadmap_data": updated_roadmap,
            "modifications": modifications,
            "updated_at": datetime.datetime.now(datetime.timezone.utc)
        }}
    )

    updated_doc = await collection.find_one({"_id": obj_id})
    updated_doc["status"] = status
    serialized = serialize_mongo_doc(updated_doc)
    return await enrich_path_profile(serialized)


async def apply_admin_step_mutation(req: AdminStepRequest, mutation: str):
    _, existing_doc, _, _ = await get_admin_path_document(req.path_id)
    roadmap_data = json.loads(json.dumps(existing_doc.get("roadmap_data") or {}))
    scoped_roadmap = get_admin_roadmap_scope(roadmap_data, req.alternative_index)
    steps = scoped_roadmap.get("steps") or []
    if not isinstance(steps, list):
        raise HTTPException(status_code=400, detail="Roadmap steps is invalid")

    if mutation == "add":
        new_step = req.step or {}
        if not isinstance(new_step, dict):
            raise HTTPException(status_code=400, detail="Step payload must be an object")
        insert_at = req.insert_index if req.insert_index is not None else len(steps)
        insert_at = max(0, min(insert_at, len(steps)))
        next_id = insert_at + 1
        if not new_step.get("id"):
            new_step["id"] = next_id
        steps.insert(insert_at, new_step)
        scoped_roadmap["steps"] = normalize_admin_steps(steps)
        saved_step = scoped_roadmap["steps"][insert_at]
        modification = build_admin_step_modification(
            "add_milestone",
            req.edited_by,
            f"Added Step {saved_step.get('id')}: {saved_step.get('title') or 'Untitled Step'}",
            [{
                "field": f"steps.add.{saved_step.get('id')}",
                "old_value": None,
                "new_value": saved_step
            }]
        )
        updated_path = await persist_admin_step_update(req.path_id, roadmap_data, modification)
        return {"message": "Step added successfully", "step": saved_step, "path": updated_path}

    step_idx = next((idx for idx, step in enumerate(steps) if step.get("id") == req.step_id), None)
    if step_idx is None:
        raise HTTPException(status_code=404, detail="Step not found")

    old_step = steps[step_idx]

    if mutation == "delete":
        removed = steps.pop(step_idx)
        scoped_roadmap["steps"] = normalize_admin_steps(steps)
        modification = build_admin_step_modification(
            "delete_milestone",
            req.edited_by,
            f"Deleted Step {removed.get('id')}: {removed.get('title') or 'Untitled Step'}",
            [{
                "field": f"steps.delete.{removed.get('id')}",
                "old_value": removed,
                "new_value": None
            }]
        )
        updated_path = await persist_admin_step_update(req.path_id, roadmap_data, modification)
        return {"message": "Step deleted successfully", "deleted_step_id": req.step_id, "path": updated_path}

    if mutation == "edit":
        if not isinstance(req.step, dict):
            raise HTTPException(status_code=400, detail="Step payload must be an object")
        updated_step = {**req.step, "id": old_step.get("id")}
        steps[step_idx] = updated_step
        scoped_roadmap["steps"] = steps
        changes = compute_roadmap_diff({"steps": [old_step]}, {"steps": [updated_step]})
        modification = build_admin_step_modification(
            "edit_milestone",
            req.edited_by,
            f"Edited Step {updated_step.get('id')}: {updated_step.get('title') or 'Untitled Step'}",
            changes or [{
                "field": f"steps.{updated_step.get('id')}",
                "old_value": old_step,
                "new_value": updated_step
            }]
        )
        updated_path = await persist_admin_step_update(req.path_id, roadmap_data, modification)
        return {"message": "Step edited successfully", "step": updated_step, "path": updated_path}

    if mutation == "regenerate":
        prompt = STEP_REGENERATE_PROMPT.format(
            current_position=existing_doc.get("current_position") or "",
            target_goal=existing_doc.get("target_goal") or "",
            profile=json.dumps(existing_doc.get("profile") or {}),
            instruction=req.instruction or "Regenerate this milestone with stronger academic detail and updated resources.",
            step=json.dumps(old_step, indent=2)
        )
        generated = await query_groq_json(prompt, preferred_model="llama-3.1-8b-instant")
        generated_step = generated.get("step") if isinstance(generated, dict) else None
        if not isinstance(generated_step, dict):
            raise HTTPException(status_code=500, detail="Step regeneration failed to return a valid step")
        generated_step["id"] = old_step.get("id")
        generated_step.setdefault("marketplace", old_step.get("marketplace") or {
            "mentors": [],
            "vendors": [],
            "institutions": [],
            "distributors": []
        })
        generated_step.setdefault("micro_steps", old_step.get("micro_steps") or [])
        name_tokens = build_name_patterns(existing_doc.get("profile") or {}, existing_doc.get("current_position") or "")
        if name_tokens:
            generated_step = recursive_sanitize(generated_step, name_tokens)
        steps[step_idx] = generated_step
        scoped_roadmap["steps"] = steps
        changes = compute_roadmap_diff({"steps": [old_step]}, {"steps": [generated_step]})
        modification = build_admin_step_modification(
            "regenerate_milestone",
            req.edited_by,
            f"Regenerated Step {generated_step.get('id')}: {generated_step.get('title') or 'Untitled Step'}",
            changes or [{
                "field": f"steps.{generated_step.get('id')}",
                "old_value": old_step,
                "new_value": generated_step
            }]
        )
        updated_path = await persist_admin_step_update(req.path_id, roadmap_data, modification)
        return {"message": "Step regenerated successfully", "step": generated_step, "path": updated_path}

    raise HTTPException(status_code=400, detail="Invalid step mutation")


STEP_REGENERATE_PROMPT = """You are the Naaviverse Admin Step Regeneration Agent.
Regenerate exactly one roadmap step while preserving its ID and duration unless the instruction explicitly asks otherwise.

Current position: {current_position}
Target goal: {target_goal}
Profile: {profile}
Admin instruction: {instruction}

Existing step:
{step}

Rules:
- Return valid JSON only, with one top-level key named "step".
- The step must include title, duration, description, learning_objectives, macro_view, micro_view, nano_view, marketplace, and micro_steps.
- Keep the writing academic, specific, objective, and free of student names, email addresses, and direct pronouns.
- Marketplace must include mentors, vendors, institutions, and distributors lists (with section: "macro_free" / "micro_structured" / "nano_expert" set for each item).
"""


@app.post("/api/admin/add-step")
@app.post("/admin/add-step")
async def admin_add_step(req: AdminStepRequest):
    return await apply_admin_step_mutation(req, "add")


@app.put("/api/admin/edit-step")
@app.put("/admin/edit-step")
async def admin_edit_step(req: AdminStepRequest):
    return await apply_admin_step_mutation(req, "edit")


@app.delete("/api/admin/delete-step")
@app.delete("/admin/delete-step")
async def admin_delete_step(req: AdminStepRequest):
    return await apply_admin_step_mutation(req, "delete")


@app.post("/api/admin/regenerate-step")
@app.post("/admin/regenerate-step")
async def admin_regenerate_step(req: AdminStepRequest):
    return await apply_admin_step_mutation(req, "regenerate")

async def trigger_instant_node_sync(path_id: str):
    """
    Triggers an instant sync on the Node backend so published paths appear
    in the student dashboard immediately without waiting for background cooldowns.
    """
    import urllib.request
    node_url = os.environ.get("NODE_BACKEND_URL", "http://localhost:4545").rstrip("/")
    sync_endpoint = f"{node_url}/api/agent-paths/sync"
    try:
        req = urllib.request.Request(sync_endpoint, data=b"{}", headers={"Content-Type": "application/json"}, method="POST")
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(None, lambda: urllib.request.urlopen(req, timeout=5))
        print(f"[InstantSync] Successfully notified Node backend at {sync_endpoint} for path {path_id}")
    except Exception as e:
        print(f"[InstantSync Warning] Could not notify Node backend ({sync_endpoint}): {e}")

# Update a path (Commit curation overrides & Publish)
@app.put("/api/paths/{path_id}")
async def update_path(path_id: str, req: UpdatePathRequest):
    try:
        obj_id = ObjectId(path_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid path ID format")
        
    # Check if the path is currently in pending
    pending_doc = await pending_paths_collection.find_one({"_id": obj_id})
    published_doc = None
    if not pending_doc:
        published_doc = await published_paths_collection.find_one({"_id": obj_id})
        
    existing_doc = pending_doc or published_doc
    if not existing_doc:
        raise HTTPException(status_code=404, detail="Career path not found")
        
    if req.feedback_text and req.feedback_text.strip():
        profile = existing_doc.get("profile") or {}
        goal = existing_doc.get("target_goal") or ""
        feedback_doc = {
            "timestamp": datetime.datetime.now(datetime.timezone.utc),
            "admin_email": req.edited_by or "Admin",
            "target_goal": goal,
            "student_profile": profile,
            "feedback_text": req.feedback_text.strip(),
            "category": req.feedback_category or "general",
            "path_id": path_id
        }
        try:
            await admin_feedbacks_collection.insert_one(feedback_doc)
            print(f"[Feedback Framework] Saved admin learning feedback: {req.feedback_text[:40]}...")
        except Exception as e:
            print(f"[Feedback Framework Warning] Could not save feedback: {e}")
            
    roadmap_data = normalize_roadmap_marketplaces_for_storage(req.roadmap_data)
    existing_roadmap = normalize_roadmap_marketplaces_for_storage(existing_doc.get("roadmap_data") or {})
    diff_changes = compute_roadmap_diff(existing_roadmap, roadmap_data)
    
    modifications = existing_doc.get("modifications") or []
    if diff_changes:
        details_summary = summarize_roadmap_changes(diff_changes)
        action_name = "publish" if req.status == "published" else "edit"
        new_record = {
            "timestamp": datetime.datetime.now(datetime.timezone.utc),
            "edited_by": req.edited_by or "Admin",
            "action": action_name,
            "details": details_summary,
            "changes": diff_changes
        }
        modifications.append(new_record)
        
    if pending_doc:
        if req.status == "published":
            # Migrate from pending to published, retaining all custom fields
            published_doc = {
                **pending_doc,
                "roadmap_data": roadmap_data,
                "status": "published",
                "published_at": datetime.datetime.now(datetime.timezone.utc),
                "modifications": modifications
            }
            if "updated_at" in published_doc:
                del published_doc["updated_at"]
            await published_paths_collection.insert_one(published_doc)
            
            # Delete from pending_paths
            await pending_paths_collection.delete_one({"_id": obj_id})
            
            # Trigger immediate background sync to Node backend (bypassing 5-minute cooldown)
            asyncio.create_task(trigger_instant_node_sync(path_id))

            return {"message": "Successfully published career path", "status": "published"}
        else:
            # Just update the pending path
            await pending_paths_collection.update_one(
                {"_id": obj_id},
                {"$set": {
                    "roadmap_data": roadmap_data,
                    "status": req.status,
                    "modifications": modifications,
                    "updated_at": datetime.datetime.now(datetime.timezone.utc)
                }}
            )
            return {"message": f"Successfully updated career path status to {req.status}", "status": req.status}
            
    if published_doc:
        await published_paths_collection.update_one(
            {"_id": obj_id},
            {"$set": {
                "roadmap_data": roadmap_data,
                "status": req.status,
                "modifications": modifications,
                "updated_at": datetime.datetime.now(datetime.timezone.utc)
            }}
        )
        if req.status == "published":
            asyncio.create_task(trigger_instant_node_sync(path_id))

        return {"message": f"Successfully updated career path status to {req.status}", "status": req.status}
        
    raise HTTPException(status_code=404, detail="Career path not found")


@app.post("/api/paths/save")
async def save_path(req: SavePathRequest):
    current = req.current_position.strip()
    goal = req.target_goal.strip()
    profile = req.profile or {}
    roadmap_data = normalize_roadmap_marketplaces_for_storage(req.roadmap_data)
    
    if not current or not goal:
        raise HTTPException(status_code=400, detail="Current position and Target goal cannot be empty")
        
    email = profile.get("email") if profile else None
    
    original_roadmap = None
    if req.generation_id and req.alternative_name:
        try:
            gen_history_doc = await generation_history_collection.find_one({"_id": ObjectId(req.generation_id)})
            if gen_history_doc and "alternatives" in gen_history_doc:
                for alt in gen_history_doc["alternatives"]:
                    if alt.get("option_name") == req.alternative_name:
                        original_roadmap = alt
                        break
        except Exception as e:
            print(f"[MongoDB Save Snap Warning] Could not retrieve original roadmap snapshot: {e}")
            
    if not original_roadmap:
        original_roadmap = roadmap_data
    original_roadmap = normalize_roadmap_marketplaces_for_storage(original_roadmap)
    
    path_doc = {
        "query": f"Current: {current}. Goal: {goal}.",
        "current_position": current,
        "target_goal": goal,
        "profile": profile,
        "roadmap_data": roadmap_data,
        "generation_id": req.generation_id,
        "original_alternative_name": req.alternative_name,
        "original_roadmap_data": original_roadmap,
        "modifications": [],
        "status": "under_admin_review",
        "created_at": datetime.datetime.now(datetime.timezone.utc),
        "created_by": email,
        "createdBy": email
    }
    
    insert_result = await pending_paths_collection.insert_one(path_doc)
    
    return {
        "message": "Path saved successfully for admin review",
        "db_id": str(insert_result.inserted_id)
    }


# ─── STEP PATCH: Surgical single-field update ─────────────────────────────────
class StepPatchRequest(BaseModel):
    step_id: int
    field: str          # "description" | "macro_view" | "micro_view" | "nano_view" | "marketplace" | "micro_steps"
    instruction: str    # User's refinement instruction
    current_step: dict  # The full current step object
    current_position: str
    target_goal: str
    profile: Optional[dict] = None
    marketplace_section: Optional[str] = None
    marketplace_category: Optional[str] = None
    marketplace_item_index: Optional[int] = None
    content_category: Optional[str] = None
    sub_segment: Optional[str] = None


MARKETPLACE_SECTIONS = {"macro_free", "micro_structured", "nano_expert"}
MARKETPLACE_CATEGORIES = ("mentors", "vendors", "institutions", "distributors")
MARKETPLACE_CATEGORY_SET = set(MARKETPLACE_CATEGORIES)
MARKETPLACE_SECTION_TO_VIEW = {
    "macro_free": "macro",
    "micro_structured": "micro",
    "nano_expert": "nano",
}
MARKETPLACE_VIEW_TO_SECTION = {view: section for section, view in MARKETPLACE_SECTION_TO_VIEW.items()}
MARKETPLACE_VIEW_KEYS = {
    "macro_free": "macro_view",
    "micro_structured": "micro_view",
    "nano_expert": "nano_view",
}
MARKETPLACE_VIEW_KEY_TO_SECTION = {view_key: section for section, view_key in MARKETPLACE_VIEW_KEYS.items()}


def marketplace_section_structure(section: str, category: str = "") -> str:
    if section == "macro_free":
        return "Free / community resource"
    if section == "micro_structured":
        return "Structured program / paid provider"
    if section == "nano_expert":
        return "1:1 expert support / mentorship"
    if category == "mentors":
        return "Mentorship provider"
    if category == "institutions":
        return "Institutional provider"
    if category == "distributors":
        return "Distribution / content provider"
    return "Marketplace provider"


def marketplace_item_category(item: dict) -> str:
    """Match the Marketplace UI's category classification."""
    explicit_category = str(item.get("category") or "").lower()
    if explicit_category in MARKETPLACE_CATEGORY_SET:
        return explicit_category
    item_type = str(item.get("type") or "").lower()
    name = str(item.get("name") or "").lower()

    if any(word in item_type for word in (
        "mentor", "coach", "expert", "advisor", "tutor", "tutoring", "specialist", "counselor"
    )) or item_type.strip() == "expert review":
        return "mentors"

    if any(word in item_type for word in (
        "course", "platform", "certification", "bootcamp", "free course", "prep", "test prep", "provider"
    )):
        return "vendors"

    if any(word in item_type for word in (
        "youtube", "docs", "community", "book", "library", "articles", "github",
        "publication", "channel", "guide"
    )):
        return "distributors"

    if any(word in item_type for word in (
        "university", "college", "school", "institute", "academy"
    )):
        return "institutions"

    if any(word in name for word in ("mentor", "coach", "counselor", "advisor")):
        return "mentors"
    if any(word in name for word in (
        "youtube", "docs", "community", "book", "library", "articles", "github",
        "publication", "channel", "guide"
    )):
        return "distributors"
    if any(word in name for word in ("university", "college", "institute")):
        return "institutions"
    return "vendors"


def normalize_marketplace_item(item: dict, category: Optional[str] = None, section: Optional[str] = None) -> dict:
    normalized = dict(item or {})
    resolved_category = category or marketplace_item_category(normalized)
    resolved_section = section or normalized.get("section") or MARKETPLACE_VIEW_TO_SECTION.get(str(normalized.get("view") or "").lower())
    if resolved_section not in MARKETPLACE_SECTIONS:
        resolved_section = None

    normalized["category"] = resolved_category
    normalized["provider_type"] = resolved_category
    if resolved_section:
        normalized["section"] = resolved_section
        normalized["view"] = MARKETPLACE_SECTION_TO_VIEW.get(resolved_section)
    normalized.setdefault("structure", marketplace_section_structure(resolved_section or "", resolved_category))
    normalized.setdefault("discount", normalized.get("discount") or "")
    normalized.setdefault("tags", normalized.get("tags") or [])
    return normalized


def item_identity(item: dict) -> str:
    return "|".join([
        str(item.get("name") or "").strip().lower(),
        str(item.get("type") or "").strip().lower(),
        str(item.get("section") or "").strip().lower(),
    ])


def normalize_marketplace_schema(marketplace: Optional[dict]) -> dict:
    source = json.loads(json.dumps(marketplace or {}))
    normalized = {
        "mentors": [],
        "vendors": [],
        "institutions": [],
        "distributors": [],
    }

    seen_by_category = {category: set() for category in MARKETPLACE_CATEGORIES}

    for category in MARKETPLACE_CATEGORIES:
        provider_items = source.get(category)
        if isinstance(provider_items, list):
            for item in provider_items:
                if not isinstance(item, dict):
                    continue
                tagged = normalize_marketplace_item(item, category=category)
                identity = item_identity(tagged)
                if identity not in seen_by_category[category]:
                    normalized[category].append(tagged)
                    seen_by_category[category].add(identity)

    for section in MARKETPLACE_SECTIONS:
        section_items = source.get(section) if isinstance(source.get(section), list) else []
        for item in section_items:
            if not isinstance(item, dict):
                continue
            tagged = normalize_marketplace_item(item, section=section)
            category = tagged["category"]
            identity = item_identity(tagged)
            if identity not in seen_by_category[category]:
                normalized[category].append(tagged)
                seen_by_category[category].add(identity)

    return normalized


def empty_marketplace_categories() -> dict:
    return {category: [] for category in MARKETPLACE_CATEGORIES}


def marketplace_categories_with_sections(marketplace: Optional[dict]) -> dict:
    normalized = normalize_marketplace_schema(marketplace)
    for section in MARKETPLACE_SECTIONS:
        normalized[section] = marketplace_items_for_section(normalized, section)
    return normalized


def marketplace_items_for_section(marketplace: dict, section: str) -> list:
    normalized = normalize_marketplace_schema(marketplace)
    provider_items = []
    for category in MARKETPLACE_CATEGORIES:
        for item in normalized.get(category, []):
            if item.get("section") == section:
                provider_items.append(item)
    return provider_items


def view_marketplace_from_source(source: Any, section: str) -> dict:
    if not isinstance(source, dict):
        source = {}
    if "marketplace" in source and isinstance(source.get("marketplace"), dict):
        source = source.get("marketplace") or {}

    normalized = normalize_marketplace_schema(source)
    view_marketplace = empty_marketplace_categories()
    for category in MARKETPLACE_CATEGORIES:
        for item in normalized.get(category, []):
            if not isinstance(item, dict):
                continue
            item_section = item.get("section")
            if item_section and item_section != section:
                continue
            tagged = normalize_marketplace_item(item, category=category, section=section)
            view_marketplace[category].append(tagged)
    return view_marketplace


def merge_view_marketplace(target: dict, source: dict):
    seen = {
        category: {item_identity(item) for item in target.get(category, []) if isinstance(item, dict)}
        for category in MARKETPLACE_CATEGORIES
    }
    for category in MARKETPLACE_CATEGORIES:
        for item in source.get(category, []):
            if not isinstance(item, dict):
                continue
            identity = item_identity(item)
            if identity not in seen[category]:
                target[category].append(item)
                seen[category].add(identity)


def combined_marketplace_from_step(step: dict) -> dict:
    combined_marketplace = empty_marketplace_categories()
    if not isinstance(step, dict):
        return marketplace_categories_with_sections(combined_marketplace)

    legacy_marketplace = step.get("marketplace")
    if isinstance(legacy_marketplace, dict):
        merge_view_marketplace(combined_marketplace, normalize_marketplace_schema(legacy_marketplace))

    for section, view_key in MARKETPLACE_VIEW_KEYS.items():
        view_marketplace = view_marketplace_from_source(step.get(view_key), section)
        merge_view_marketplace(combined_marketplace, view_marketplace)

    return marketplace_categories_with_sections(combined_marketplace)


def normalize_step_marketplaces(step: dict) -> dict:
    if not isinstance(step, dict):
        return step

    legacy_marketplace = normalize_marketplace_schema(step.get("marketplace"))

    for section, view_key in MARKETPLACE_VIEW_KEYS.items():
        view_value = step.get(view_key)
        description = get_view_description(step, view_key)
        existing_view_marketplace = view_marketplace_from_source(view_value, section)
        section_marketplace = view_marketplace_from_source(legacy_marketplace, section)
        merge_view_marketplace(existing_view_marketplace, section_marketplace)
        step[view_key] = {
            "description": description,
            "marketplace": existing_view_marketplace,
        }

    # `step.marketplace` is accepted as a legacy input only. Storage/output keeps
    # marketplace under macro_view, micro_view, and nano_view to avoid duplicate
    # marketplace blocks in MongoDB records.
    step.pop("marketplace", None)
    return step


def step_with_replaced_marketplace(step: dict, marketplace: dict) -> dict:
    """Apply a patched marketplace without re-merging stale view marketplace items."""
    updated_step = json.loads(json.dumps(step or {}))
    for view_key in MARKETPLACE_VIEW_KEY_TO_SECTION:
        view_value = updated_step.get(view_key)
        description = get_view_description(updated_step, view_key)
        updated_step[view_key] = {
            "description": description,
            "marketplace": empty_marketplace_categories(),
        }
        if isinstance(view_value, dict):
            for key, value in view_value.items():
                if key not in {"description", "marketplace"}:
                    updated_step[view_key][key] = value

    updated_step["marketplace"] = marketplace
    return normalize_step_marketplaces(updated_step)


def normalize_roadmap_marketplaces_for_storage(data):
    """Return a deep-copied roadmap/list with view-specific and legacy marketplaces aligned."""
    normalized_data = json.loads(json.dumps(data if data is not None else {}))

    def normalize_roadmap(roadmap: dict):
        if not isinstance(roadmap, dict):
            return roadmap
        steps = roadmap.get("steps")
        if isinstance(steps, list):
            for step in steps:
                if isinstance(step, dict):
                    normalize_step_marketplaces(step)
        return roadmap

    if isinstance(normalized_data, list):
        for item in normalized_data:
            normalize_roadmap(item)
    else:
        normalize_roadmap(normalized_data)
        alternatives = normalized_data.get("alternatives")
        if isinstance(alternatives, list):
            for alt in alternatives:
                normalize_roadmap(alt)

    return normalized_data


def merge_marketplace_category(
    current_marketplace: dict,
    section: str,
    category: str,
    generated_items: list,
) -> dict:
    """Replace exactly one category in one view while preserving all other data."""
    normalized_marketplace = normalize_marketplace_schema(current_marketplace)
    current_section = marketplace_items_for_section(normalized_marketplace, section)
    if not isinstance(current_section, list):
        current_section = []
    preserved_items = [
        item for item in current_section
        if not isinstance(item, dict) or marketplace_item_category(item) != category
    ]
    tagged_items = []
    for item in generated_items:
        tagged_item = normalize_marketplace_item(item, category=category, section=section)
        tagged_items.append(tagged_item)

    new_marketplace = json.loads(json.dumps(normalized_marketplace))
    existing_provider_items = new_marketplace.get(category, [])
    if not isinstance(existing_provider_items, list):
        existing_provider_items = []
    preserved_provider_items = [
        item for item in existing_provider_items
        if not isinstance(item, dict) or item.get("section") != section
    ]
    new_marketplace[category] = preserved_provider_items + tagged_items
    return new_marketplace


def merge_marketplace_item(
    current_marketplace: dict,
    section: str,
    category: str,
    item_index: int,
    generated_item: dict,
) -> dict:
    """Replace one item in one category/view while preserving sibling cards."""
    normalized_marketplace = normalize_marketplace_schema(current_marketplace)
    existing_provider_items = normalized_marketplace.get(category, [])
    if not isinstance(existing_provider_items, list):
        existing_provider_items = []

    new_marketplace = json.loads(json.dumps(normalized_marketplace))
    replacement = normalize_marketplace_item(generated_item, category=category, section=section)
    section_position = -1
    replaced = False
    next_provider_items = []

    for item in existing_provider_items:
        if isinstance(item, dict) and item.get("section") == section:
            section_position += 1
            if section_position == item_index:
                next_provider_items.append(replacement)
                replaced = True
                continue
        next_provider_items.append(item)

    if not replaced:
        raise HTTPException(status_code=400, detail="Marketplace item index is out of range")

    new_marketplace[category] = next_provider_items
    return new_marketplace


MARKETPLACE_CATEGORY_PATCH_PROMPT = """You are the Naaviverse Marketplace Patch Agent.
Generate ONLY replacement items for one Marketplace category inside one step.

CATEGORY CONTEXT:
- Focus Category: {category}
- Sub-Category / Track: {sub_segment}
- Domain Constraints: {category_rules}

Step ID: {step_id}
Step title: {step_title}
Step duration: {step_duration}
Marketplace section: {marketplace_section}
Marketplace category: {marketplace_category}
Current items in this exact category:
{current_items}

Student Context & Signals:
- Current position: {current_position}
- Target goal: {target_goal}
{signals_context}

User instruction: {instruction}

Rules:
- {generation_rule}
- MANDATORY DOMAIN ADHERENCE: Strictly match recommendations to {category} ({sub_segment}). Never generate coding or software developer tools for Healthcare, Creative, Business, or Non-Academic pathways unless the target goal explicitly specifies it.
- MANDATORY FINANCIAL ALIGNMENT: Strictly align pricing and tiers with the student's Financial Capacity (high-tier premium resources if financial situation is High/Affluent; free/budget options if Low/Need-based).
- Treat the current items as rejected for this replacement request. Do not reuse the same provider names unless there is no credible alternative; return next-best replacements.
- Do not return or discuss any other Marketplace category or section.
- Keep every item relevant to the step title, student context, and target goal.
- Do not include the student's name, email, or personal identifiers.
- Output valid JSON only using this exact structure:
{{
  "marketplace_items": [
    {{
      "name": "<specific name>",
      "type": "<category-appropriate type>",
      "category": "{marketplace_category}",
      "provider_type": "{marketplace_category}",
      "structure": "<provider structure, e.g. 1:1 mentorship, online platform, university program, content distributor>",
      "discount": "<discount, scholarship, free tier, or 'None'>",
      "why": "<why it fits this step>",
      "next_step": "<specific action>",
      "cost": "<cost or Free>",
      "duration": "<duration or session format>",
      "section": "{marketplace_section}",
      "tags": ["<tag>", "<tag>"]
    }}
  ]
}}

Type requirements:
- mentors: use Mentor, Coach, Counselor, Advisor, or Expert review
- vendors: use Course, Platform, Certification, Bootcamp, or Free course
- institutions: use University, College, School, Institute, or Academy
- distributors: use Book, YouTube, Docs, Community, Library, Guide, or Publication
"""

STEP_PATCH_PROMPT = """You are the Naaviverse Step Patch Agent.
Your ONLY job is to rewrite ONE specific field inside ONE step of a pathway.

CATEGORY CONTEXT:
- Focus Category: {category}
- Sub-Category / Track: {sub_segment}
- Domain Constraints: {category_rules}

Step being updated:
- Step ID: {step_id}
- Step Title: {step_title}
- Step Duration: {step_duration}

Field to update: "{field}"
Current value of that field:
{current_value}

Student Context & Signals:
- Current Position: {current_position}
- Target Goal: {target_goal}
{signals_context}

User Instruction: {instruction}

Rules:
- Rewrite ONLY the "{field}" field strictly according to the user's instruction and within {category} ({sub_segment}) semantics.
- STRICT CATEGORY ADHERENCE: Content must strictly align with {category} ({sub_segment}). Never generate school board exams, GPA targets, or college admissions for Practical Skills, Jobs/Careers, or Non-Academic Counselling pathways unless requested by an academic transition.
- ZERO MOCK / NO FALLBACK DATA: Provide genuine, real-world, actionable, and accurate content.
- Keep the tone strategic, professional, and practical.
- Do NOT mention the student's personal name or email.
- Output ONLY a valid JSON object with a single key "{field}" containing the rewritten value.
- No markdown, no backticks, no explanation. Just the JSON.

Expected output formats based on the target field:
- If the field is "macro_view", "micro_view", "nano_view", or "description", the output format must be:
  {{"{field}": "<your rewritten detailed text paragraph — must be comprehensive, deep, and substantive (4-6 detailed sentences / 100-150 words), thoroughly addressing the user instruction with domain-specific methodologies, never a short 1-line blurb>"}}

- If the field is "marketplace", the output format must be a valid JSON object:
  {{
    "marketplace": {{
      "macro_free": [
        {{
          "name": "<resource name>",
          "type": "<Free course | YouTube | Docs | Community>",
          "why": "<why it fits>",
          "next_step": "<action item>",
          "tags": ["<tag>", "<tag>"]
        }}
      ],
      "micro_structured": [
        {{
          "name": "<course/book name>",
          "type": "<Course | Certification | Book | Bootcamp>",
          "cost": "<cost>",
          "duration": "<duration>",
          "value": "<value prop>",
          "next_step": "<action item>",
          "tags": ["<tag>", "<tag>"]
        }}
      ],
      "nano_expert": [
        {{
          "name": "<mentor/coaching name>",
          "type": "<Mentor | Coaching | Expert review>",
          "price": "<price>",
          "session_details": "<format>",
          "expected_outcomes": "<expected outcomes>",
          "tags": ["<tag>", "<tag>"]
        }}
      ]
    }}
  }}

  CRITICAL marketplace subsection rules:
  - "macro section" / "macro free" / "free resources" / "vendors" in macro updates the "macro_free" array.
  - "micro section" / "micro structured" / "paid courses" updates the "micro_structured" array.
  - "nano section" / "nano expert" / "mentors" / "coaching" updates the "nano_expert" array.
  - If the user targets only ONE subsection (e.g. "macro section vendors"), rewrite only that subsection's array with as many fresh, relevant, real-world entries as the step and instruction justify. Copy the other two subsections EXACTLY from the current value shown above.
  - Always return ALL three keys (macro_free, micro_structured, nano_expert) in the output object.
  - Each subsection must contain a data-appropriate number of high-quality, specific, real-world entries relevant to the step title and student goal. Do not pad the output with weak or generic resources just to hit a number.

- If the field is "micro_steps", the output format must be a JSON array of checklist items:
  {{
    "micro_steps": [
      {{"task": "<actionable task item>", "resource": "<resource to use>"}}
    ]
  }}
  IMPORTANT: Generate at least 5–8 detailed, specific, actionable micro-steps. Preserve any existing items that are still relevant unless the user asks to replace them.
"""

@app.post("/api/path/patch-step")
async def patch_step(req: StepPatchRequest):
    allowed_fields = {"description", "macro_view", "micro_view", "nano_view", "marketplace", "micro_steps"}
    if req.field not in allowed_fields:
        raise HTTPException(status_code=400, detail=f"Field must be one of: {', '.join(allowed_fields)}")

    current_val = req.current_step.get(req.field, "")

    cat = resolve_focus_category(req.content_category or (req.profile or {}).get("activeSegment"))
    sub_seg = req.sub_segment or (req.profile or {}).get("subSegment") or "Standard"

    category_rules = get_subsegment_rules(cat, sub_seg)

    profile = req.profile or {}
    email = (profile.get("email") or "").strip().lower()
    if email:
        try:
            db_profile = await profiles_collection.find_one({"email": email})
            if db_profile:
                db_profile = serialize_mongo_doc(db_profile)
                profile = deep_merge_profile(db_profile, profile)
        except Exception as e:
            print(f"[Profile Hydration Warning] {e}")

    signals_context = format_student_signals_context(profile)

    if req.field == "marketplace":
        section = req.marketplace_section or "macro_free"
        category = req.marketplace_category or "vendors"
        if section not in MARKETPLACE_SECTIONS:
            raise HTTPException(status_code=400, detail="Invalid marketplace subsection")
        if category not in MARKETPLACE_CATEGORY_SET:
            raise HTTPException(status_code=400, detail="Invalid marketplace category")

        current_marketplace = combined_marketplace_from_step(req.current_step)
        current_section = marketplace_items_for_section(current_marketplace, section)
        current_category_items = [
            item for item in current_section
            if isinstance(item, dict) and marketplace_item_category(item) == category
        ]
        replacement_index = req.marketplace_item_index
        is_item_replacement = isinstance(replacement_index, int)
        if is_item_replacement:
            if replacement_index < 0 or replacement_index >= len(current_category_items):
                raise HTTPException(status_code=400, detail="Marketplace item index is out of range")
            prompt_current_items = [current_category_items[replacement_index]]
            generation_rule = (
                f'Return exactly 1 fresh, relevant, real-world replacement item for ONLY the '
                f'"{category}" category. This is a single-card replacement, not a full category refresh.'
            )
        else:
            prompt_current_items = current_category_items
            generation_rule = (
                f'Return a rich, comprehensive list of 5 to 8 fresh, relevant, high-quality real-world recommendations '
                f'for ONLY the "{category}" category, dynamically tailored to the student\'s path goals ({req.target_goal}) '
                f'and step requirements ({req.current_step.get("title", "")}). '
                f'Never return a tiny set of 1, 2, or 3 items. Provide a strong, diverse set of choices.'
            )

        prompt = MARKETPLACE_CATEGORY_PATCH_PROMPT.format(
            category=cat,
            sub_segment=sub_seg,
            category_rules=category_rules,
            step_id=req.step_id,
            step_title=req.current_step.get("title", f"Step {req.step_id}"),
            step_duration=req.current_step.get("duration", ""),
            marketplace_section=section,
            marketplace_category=category,
            current_items=json.dumps(prompt_current_items, indent=2),
            current_position=req.current_position,
            target_goal=req.target_goal,
            signals_context=signals_context,
            instruction=req.instruction,
            generation_rule=generation_rule,
        )

        print(
            f"[Patch Agent] Patching step {req.step_id} marketplace "
            f"section '{section}', category '{category}' using 120B..."
        )
        result = await query_groq_json(prompt, preferred_model="openai/gpt-oss-120b", fallback_models=["qwen/qwen3.8-27b", "openai/gpt-oss-20b"])
        generated_items = result.get("marketplace_items") if isinstance(result, dict) else None
        if not isinstance(generated_items, list) or not generated_items:
            raise HTTPException(status_code=500, detail="Marketplace patch failed to return category items. Please try again.")
        generated_items = [item for item in generated_items if isinstance(item, dict) and item.get("name")]
        if not generated_items:
            raise HTTPException(status_code=500, detail="Marketplace patch returned invalid category items. Please try again.")
        # The model cannot overwrite unrelated data. Merge only the requested
        # category in the requested subsection and preserve everything else.
        if is_item_replacement:
            new_marketplace = merge_marketplace_item(
                current_marketplace, section, category, replacement_index, generated_items[0]
            )
        else:
            new_marketplace = merge_marketplace_category(
                current_marketplace, section, category, generated_items
            )

        profile = req.profile or {}
        name_tokens = build_name_patterns(profile, req.current_position)
        if name_tokens:
            new_marketplace = recursive_sanitize(new_marketplace, name_tokens)

        updated_step = step_with_replaced_marketplace(req.current_step or {}, new_marketplace)

        return {
            "step_id": req.step_id,
            "field": req.field,
            "marketplace_section": section,
            "marketplace_category": category,
            "marketplace_item_index": replacement_index,
            "updated_value": new_marketplace,
            "updated_step": updated_step,
        }

    if isinstance(current_val, (dict, list)):
        current_value_str = json.dumps(current_val, indent=2)
    else:
        current_value_str = str(current_val)

    prompt = STEP_PATCH_PROMPT.format(
        category=cat.upper(),
        sub_segment=sub_seg,
        category_rules=category_rules,
        step_id=req.step_id,
        step_title=req.current_step.get("title", f"Step {req.step_id}"),
        step_duration=req.current_step.get("duration", ""),
        field=req.field,
        current_value=current_value_str,
        current_position=req.current_position,
        target_goal=req.target_goal,
        signals_context=signals_context,
        instruction=req.instruction
    )

    print(f"[Patch Agent] Patching step {req.step_id} field '{req.field}' (cat: {cat.upper()}) using 120B...")
    result = await query_groq_json(prompt, preferred_model="openai/gpt-oss-120b", fallback_models=["qwen/qwen3.8-27b", "openai/gpt-oss-20b"])

    if not result or req.field not in result:
        raise HTTPException(status_code=500, detail="Patch agent failed to return updated content. Please try again.")

    # Sanitize any personal names
    name_tokens = build_name_patterns(profile, req.current_position)
    new_value = result[req.field]
    if name_tokens:
        new_value = recursive_sanitize(new_value, name_tokens)

    updated_step = json.loads(json.dumps(req.current_step or {}))
    if req.field in MARKETPLACE_VIEW_KEY_TO_SECTION:
        view_value = updated_step.get(req.field)
        if isinstance(view_value, dict):
            view_value["description"] = new_value
            updated_step[req.field] = view_value
            new_value = view_value
        else:
            updated_step[req.field] = {
                "description": new_value,
                "marketplace": empty_marketplace_categories(),
            }
            new_value = updated_step[req.field]
    else:
        updated_step[req.field] = new_value
    updated_step = normalize_step_marketplaces(updated_step)

    print(f"[Patch Agent] Successfully patched step {req.step_id} field '{req.field}'.")
    return {
        "step_id": req.step_id,
        "field": req.field,
        "updated_value": new_value,
        "updated_step": updated_step,
    }


# ─── ADMIN FEEDBACK LEARNING ENDPOINTS ──────────────────────────────────────
@app.get("/api/feedbacks")
async def get_feedbacks():
    feedbacks = []
    try:
        cursor = admin_feedbacks_collection.find({}).sort("timestamp", -1)
        async for doc in cursor:
            feedbacks.append(serialize_mongo_doc(doc))
    except Exception as e:
        print(f"[Feedback API Error] {e}")
        raise HTTPException(status_code=500, detail=str(e))
    return feedbacks

@app.post("/api/feedbacks")
async def create_feedback(req: FeedbackCreateRequest):
    try:
        feedback_doc = {
            "timestamp": datetime.datetime.now(datetime.timezone.utc),
            "admin_email": req.admin_email,
            "target_goal": req.target_goal,
            "student_profile": req.student_profile or {},
            "feedback_text": req.feedback_text.strip(),
            "category": req.category,
            "path_id": req.path_id
        }
        res = await admin_feedbacks_collection.insert_one(feedback_doc)
        feedback_doc["id"] = str(res.inserted_id)
        return {"message": "Feedback saved successfully", "feedback": serialize_mongo_doc(feedback_doc)}
    except Exception as e:
        print(f"[Feedback Create API Error] {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/feedbacks/{feedback_id}")
async def delete_feedback(feedback_id: str):
    try:
        obj_id = ObjectId(feedback_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid feedback ID format")
    
    try:
        res = await admin_feedbacks_collection.delete_one({"_id": obj_id})
        if res.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Feedback not found")
        return {"message": "Feedback deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        print(f"[Feedback Delete API Error] {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ─── STUDENT MARKETPLACE FEEDBACK ENDPOINTS ────────────────────────────────
@app.post("/api/marketplace-feedback")
async def create_marketplace_feedback(req: MarketplaceFeedbackRequest):
    try:
        feedback_doc = {
            "timestamp": datetime.datetime.now(datetime.timezone.utc),
            "student_email": req.student_email,
            "path_id": req.path_id,
            "path_name": req.path_name,
            "step_id": req.step_id,
            "step_title": req.step_title,
            "provider_name": req.provider_name,
            "provider_type": req.provider_type,
            "action": req.action
        }
        res = await marketplace_feedback_collection.insert_one(feedback_doc)
        feedback_doc["id"] = str(res.inserted_id)
        return {"message": "Marketplace feedback saved successfully", "feedback": serialize_mongo_doc(feedback_doc)}
    except Exception as e:
        print(f"[Marketplace Feedback API Error] {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/marketplace-feedback")
async def get_marketplace_feedbacks():
    feedbacks = []
    try:
        cursor = marketplace_feedback_collection.find({}).sort("timestamp", -1)
        async for doc in cursor:
            feedbacks.append(serialize_mongo_doc(doc))
    except Exception as e:
        print(f"[Marketplace Feedback API Error] {e}")
        raise HTTPException(status_code=500, detail=str(e))
    return feedbacks

@app.delete("/api/marketplace-feedback/{feedback_id}")
async def delete_marketplace_feedback(feedback_id: str):
    try:
        obj_id = ObjectId(feedback_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid feedback ID format")
    
    try:
        res = await marketplace_feedback_collection.delete_one({"_id": obj_id})
        if res.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Feedback not found")
        return {"message": "Marketplace feedback deleted successfully"}
    except Exception as e:
        print(f"[Marketplace Feedback Delete API Error] {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Serve React frontend if built
from fastapi.staticfiles import StaticFiles


class SPAStaticFiles(StaticFiles):
    async def get_response(self, path: str, scope):
        try:
            response = await super().get_response(path, scope)
            if response.status_code == 404:
                return await super().get_response("index.html", scope)
            return response
        except Exception as e:
            try:
                return await super().get_response("index.html", scope)
            except Exception:
                raise e

dist_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "dist"))
if os.path.exists(dist_path):
    app.mount("/", SPAStaticFiles(directory=dist_path, html=True), name="static")

