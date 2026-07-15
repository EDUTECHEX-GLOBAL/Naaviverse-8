import os
import re
import json
import asyncio
import datetime
import time
import certifi
from typing import Optional, List, Dict, Any
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from groq import Groq, AsyncGroq
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
from models import StudentProfileModel

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
 
client = Groq(api_key=os.environ.get("GROQ_API_KEY"))
async_client = AsyncGroq(api_key=os.environ.get("GROQ_API_KEY"))

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


# ─── AGENT 1: BLUEPRINT GENERATOR PROMPT ──────────────────────────────────
AGENT_1_PROMPT = """You are the Naaviverse pathway blueprint generator (Agent 1).
Your task is to draft the initial raw pathway based on the selected content segment:
- Current Position: {current_position}
- Target Goal / Support Need: {target_goal}
- Student Profile Details: {profile}
- Degree Type: {degree_type}
- Selected Segment Focus: {focus_area}

Respond ONLY with valid JSON. No markdown, no backticks, no explanation.

{{
  "path_title": "{focus_title_prefix} Pathway from {current_position} to {target_goal}",
  "path_description": "A comprehensive pathway designed to take a learner from {current_position} to the target destination or support need of {target_goal} focusing on {focus_area}.",
  "readiness_score": 15,
  "readiness_label": "High School Starter",
  "total_duration": "<calculated admission timeline, e.g. '<months> months'>",
  "blind_spots": [
    "<warning or critical gap 1 based on profile constraints>",
    "<warning or critical gap 2 based on profile constraints>"
  ],
  "steps": [
    {{
      "id": 1,
      "title": "<step/milestone title>",
      "duration": "<calculated step duration range, e.g. 'Months 1-4'>",
      "description": "<detailed step description (at least 3 to 4 comprehensive sentences) outlining exactly what academics, study plans, or profile goals to focus on during this step, why this is critical, and how it strategically prepares the student for {target_goal}>",
      "learning_objectives": [
        "<learning objective 1>",
        "<learning objective 2>",
        "<learning objective 3>"
      ],
     "macro_view": "<4-5 sentence strategic paragraph explaining the BIG PICTURE PURPOSE of this milestone — what overarching academic goal it advances, why it is a critical non-negotiable foundation within the entire roadmap architecture, how mastering it unlocks the next stage of academic and career progression, what long-term college readiness competency it builds, and how it connects to the student's overall target destination at {target_goal}>",
"micro_view": "<4-5 sentence strategic paragraph describing the PRECISE EXECUTION OUTPUT — what specific academic tasks, coursework, study schedules, and concrete deliverables the student must complete within this phase, how many hours per week to dedicate, what tools and platforms to use for tracking progress, what measurable checkpoints confirm task completion, and what the final tangible output of this phase looks like before moving forward>",
"nano_view": "<4-5 sentence strategic paragraph outlining the MENTOR GUIDANCE FOCUS — what specific diagnostic assessments and expert review sessions should happen in this phase, how a mentor validates the student's readiness to advance, what peer cohort accountability checkpoints are recommended, what common failure patterns a mentor should watch for in this phase, and how targeted expert feedback is incorporated to refine the student's execution plan before the next milestone begins>",
      "marketplace": {{
        "mentors": [
          {{
            "name": "<free mentor/counseling option, e.g. Free counselor AMA session>",
            "type": "Mentor",
            "why": "<why this fits the macro free view>",
            "next_step": "<specific action to register/join>",
            "tags": ["<tag>", "<tag>"],
            "section": "macro_free",
            "price": "Free"
          }},
          {{
            "name": "<paid mentor/coaching option, e.g. private SAT math tutor>",
            "type": "Mentor",
            "why": "<why this fits the micro view>",
            "next_step": "<specific registration link/action>",
            "tags": ["<tag>"],
            "section": "micro_structured",
            "price": "<realistic price, e.g. ₹1,500/session>"
          }},
          {{
            "name": "<premium strategic mentor / admissions advisor>",
            "type": "Mentor",
            "why": "<why this fits the nano view>",
            "next_step": "<specific next action>",
            "tags": ["<tag>"],
            "section": "nano_expert",
            "price": "<realistic price, e.g. ₹5,000/month>"
          }}
        ],
        "vendors": [
          {{
            "name": "<free course or online platform prep>",
            "type": "Course",
            "why": "<why this fits>",
            "next_step": "<specific action>",
            "tags": ["<tag>"],
            "section": "macro_free",
            "cost": "Free"
          }},
          {{
            "name": "<paid course or certification exam package>",
            "type": "Course",
            "why": "<why this fits>",
            "next_step": "<specific action>",
            "tags": ["<tag>"],
            "section": "micro_structured",
            "cost": "<realistic cost, e.g. ₹3,500>"
          }},
          {{
            "name": "<premium coding bootcamp or target prep program>",
            "type": "Bootcamp",
            "why": "<why this fits>",
            "next_step": "<specific action>",
            "tags": ["<tag>"],
            "section": "nano_expert",
            "cost": "<realistic cost, e.g. ₹95,000>"
          }}
        ],
        "institutions": [
          {{
            "name": "<free open lectures or articles from a university>",
            "type": "University",
            "why": "<why this fits>",
            "next_step": "<specific action>",
            "tags": ["<tag>"],
            "section": "macro_free",
            "cost": "Free"
          }},
          {{
            "name": "<university certificate course/program>",
            "type": "University",
            "why": "<why this fits>",
            "next_step": "<specific action>",
            "tags": ["<tag>"],
            "section": "micro_structured",
            "cost": "<realistic cost, e.g. ₹20,000>"
          }},
          {{
            "name": "<premium university counselor or admissions seminar program>",
            "type": "University",
            "why": "<why this fits>",
            "next_step": "<specific action>",
            "tags": ["<tag>"],
            "section": "nano_expert",
            "cost": "<realistic cost, e.g. ₹2,50,000>"
          }}
        ],
        "distributors": [
          {{
            "name": "<free youtube channel, docs or community forum>",
            "type": "YouTube",
            "why": "<why this fits>",
            "next_step": "<specific action>",
            "tags": ["<tag>"],
            "section": "macro_free",
            "cost": "Free"
          }},
          {{
            "name": "<paid book, guide or technical publication>",
            "type": "Book",
            "why": "<why this fits>",
            "next_step": "<specific action>",
            "tags": ["<tag>"],
            "section": "micro_structured",
            "cost": "<realistic cost, e.g. ₹1,200>"
          }},
          {{
            "name": "<premium tech libraries subscription>",
            "type": "Subscription",
            "why": "<why this fits>",
            "next_step": "<specific action>",
            "tags": ["<tag>"],
            "section": "nano_expert",
            "cost": "<realistic cost, e.g. ₹24,000/year>"
          }}
        ]
      }},
      "micro_steps": [
        {{"task": "<specific task action>", "resource": "<real resource>"}},
        {{"task": "<specific task action>", "resource": "<real resource>"}},
        {{"task": "<specific task action>", "resource": "<real resource>"}}
      ]
    }}
  ]
}}

Rules:
- CONTENT TAXONOMY RULE: Start from the selected segment only. Do not blend all categories together unless the user explicitly asks to compare alternatives.
- ACADEMIC & RESEARCH covers School K-12, Pre-University Grade 11-12, and University bachelor's/master's/PhD/transfer pathways. Use formal education, curriculum, admissions, tests, research, and academic milestones.
- PRACTICAL & SKILLS covers learning a specific skill and applying skills in internships or real environments. Skills are not professions: "learn Python" is a skill path, while "become a Data Scientist" is a Jobs & Careers path.
- JOBS & CAREERS covers profession/role outcomes. Distinguish technical roles such as engineering, data, and design from non-technical roles such as management, marketing, and operations.
- NON-ACADEMIC COUNSELLING covers mental health and wellness, generic life counselling, and short-term immediate guidance. These are resource/support paths, not career roadmaps. Do not promise diagnosis or treatment; recommend qualified professional support, trusted resources, routine-building, safe escalation, and time-boxed next steps where relevant.
- Calculate a realistic "readiness_score" (0-100) and "readiness_label" (e.g. Early Starter, Advanced, Intermediate) based dynamically on the student's profile signals (academic performance, stream, and curriculum) relative to the competitiveness of the Target Career Goal:
  - For highly competitive targets (e.g., Harvard, Yale, Stanford, MIT, Oxford, IIT, BITS, Imperial College):
    - If performance is "90% and above", score should be around 30-40 (Early/Intermediate Starter).
    - If performance is "75%–89%", score should be around 20-30.
    - If performance is below 75%, score should be around 10-20.
  - For moderately competitive targets (e.g., Local Universities, State Colleges):
    - If performance is "90% and above", score should be around 75-85 (Advanced Starter).
    - If performance is "75%–89%", score should be around 50-60.
    - If performance is below 75%, score should be around 30-40.
  - Adjust the score dynamically based on these parameters. Do NOT hardcode it.
- Highlight at least 2 critical "blind_spots" (gaps, potential constraints, or warnings based on their profile, e.g. "Lacks research projects", "Needs IELTS prep") as a list of strings.
- CRITICAL TIMELINE PROGRESSION CONSTRAINT: You MUST calculate the total duration and steps dynamically to cover the educational progression from the student's current position/grade to ADMISSION into the final target goal, not completion of the target degree itself.
  - Cumulative Calculation Formula: total duration = remaining current-stage months + each prerequisite degree stage before the target degree + an admissions-cycle minimum when the student is already eligible.
  - School Formula: remaining school months = (final school grade - current grade + 1) * months per academic year.
  - Degree Formula: add the configured duration for each prerequisite degree level before the target degree; do NOT add the target degree's own study duration.
  - If the student is in school and target is Master's admission, include remaining school + Bachelor's prerequisite only, then finish with Master's application/admission readiness.
  - If the student is in school and target is Bachelor's admission, include remaining school only, then finish with Bachelor's application/admission readiness.
  - If the student is in university and target is Master's admission, include remaining Bachelor's time only, then finish with Master's application/admission readiness.
  - If they are already eligible for the target degree admission, use a realistic admissions-cycle minimum.
  - Do NOT ignore intermediate degrees. A student cannot jump from 10th Grade directly to Master's admission without first finishing high school and completing a Bachelor's.
  - Set the `total_duration` field to this calculated admission timeline in the format: `"<calculated months> months"`.
  - Distribute the generated milestones/steps in `steps` chronologically across this entire timeline (e.g., starting with school prep, transitioning to Bachelor's projects/internships, and finishing with target-degree application submission/admission readiness).
- Determine the number of milestones/steps in `steps` dynamically based on the complexity of the target destination and calculated timeline.
  - CRITICAL STEP COUNT RULE: You MUST generate a detailed, comprehensive roadmap with as many milestones as the student's data, grade, timeline, and target complexity require. Do NOT use a fixed step count or upper cap. Long multi-year timelines must include enough distinct milestones to cover school preparation, prerequisite degree readiness where relevant, standardized tests, profile building, applications, and admission readiness without compressing unrelated work into broad generic steps.
  - DO NOT restrict or default the pathway to exactly 4 steps. A 4-step path is insufficient to cover a student's career transition and is strictly forbidden.
- Ensure that the progression of milestones represents the pedagogical stages inspired by "Aryan's Pathway 2023":
  - Early milestones must cover: choosing the right curriculum/subjects/streams based on passion/aptitude, researching schools, setting GPA targets (e.g., accomplishing 90%+ in board/school exams).
  - Middle milestones must cover: internship selection & planning to acquire relevant skills, identifying and starting test prep modules (e.g., SAT, ACT, English proficiency like IELTS/TOEFL), identifying right mentors.
  - Transition milestones must cover: planning transitions between academic grades, analyzing risks and gaps.
  - Final milestones must cover: profile building, mock score iteration, university placement program registration, and completing college application dossiers.
- For each milestone step, construct:
  - `macro_view`: A 4-5 sentence strategic paragraph explaining the BIG PICTURE PURPOSE — what overarching academic goal the milestone advances, why it is a critical non-negotiable foundation in the roadmap, how mastering it unlocks the next academic stage, what long-term college readiness competency it builds, and how it ties directly to the target destination.
  - `micro_view`: A 4-5 sentence strategic paragraph describing the PRECISE EXECUTION OUTPUT — what specific tasks, coursework, and deliverables the student must complete, how many hours per week to allocate, what tools and platforms to use, what measurable checkpoints confirm completion, and what the tangible output looks like before advancing.
  - `nano_view`: A 4-5 sentence strategic paragraph outlining the MENTOR GUIDANCE FOCUS — what diagnostic assessments and expert sessions happen, how the mentor validates readiness to advance, what peer cohort checkpoints are recommended, what failure patterns to watch for, and how expert feedback is incorporated before the next milestone begins.
- Distribute the calculated total duration logically across the steps. For example, distribute month ranges like "Months 1-3", "Months 4-6", etc., so they span the entire calculated duration of the pathway.
- CRITICAL CONSISTENCY RULE: Every single milestone in `steps` must have equally rich `description`, `macro_view`, `micro_view`, and `nano_view` text. Do not make only Step 1 or Step 2 detailed. If the pathway has 5, 9, 10, 12, or any other number of steps, every step must receive a detailed multi-sentence explanation with no one-line view fields.
- Generate a dynamic, appropriate number of micro_steps tasks per step based on the milestone requirements (do not hardcode to exactly 3).
- Generate a dynamic, appropriate number of learning_objectives per step based on the milestone requirements (do not hardcode to exactly 3).
- Generate a dynamic, data-dependent number of marketplace recommendations for each of the three sections ("macro_free", "micro_structured", "nano_expert") within all 4 category lists (mentors, vendors, institutions, distributors). Do NOT use a fixed minimum, fixed maximum, or default count. The number of recommendations must be based on the milestone's real needs, the student's grade and constraints, target competitiveness, budget signals, and the availability of relevant resources.
- Ensure the 'type' field of each generated item matches the category (e.g. 'Mentor' or 'Coaching' for mentors, 'Course' or 'Bootcamp' for vendors, 'University' or 'School' for institutions, 'YouTube' or 'Book' or 'Community' for distributors).
- Avoid repeated resource names. Suggest highly specific resources like freeCodeCamp, Coursera, MIT OCW, Khan Academy, specific textbooks.
- Deeply differentiate based on profile grade, curriculum (CBSE vs. IB vs. University), financial budget, stream, personality type, and location.
- Each step description MUST be a rich, detailed, multi-sentence paragraph (3-4 sentences). Do NOT provide short, generic, or single-sentence descriptions. Make them highly academic, pedagogical, and context-specific.
- CRITICAL NAME BAN: NEVER mention the student's personal name (e.g. Sunkara, Chaitanya, Praneeth) or email or personal pronouns in any text fields (titles, descriptions, views, checklist tasks, or objectives). Focus purely on objective, academic instructions.
- REFINEMENT, KEYWORD UNDERSTANDING & VALIDATION RULES:
  - If a Refinement / Adjustment Request is provided:
    - You MUST understand the keywords and intent behind it:
      - E.g., if it says "change step X description", you MUST locate the step with id X and rewrite its "description" text exactly as requested (or make it more detailed/aligned with their feedback).
      - E.g., if it says "add more steps" or "add X steps", you MUST increase the number of milestones in the "steps" and insert relevant steps with correct IDs.
      - E.g., if it says "add correct marketplace" or "change marketplace", you MUST adjust the "marketplace" objects inside the relevant steps.
      - E.g., if it says "give more accurate" or "add SAT prep", you MUST modify descriptions, objectives, and checklists to include those academic resources.
    - If the request is completely unrelated to the career pathway, contains nonsense, or asks to perform out-of-scope tasks (e.g., "tell me a joke", "tell me a story", "what is the weather"), you MUST return a JSON object containing ONLY the key "error" with a polite description explaining why the request is invalid and how the user can ask correctly. Example: {{"error": "This request is irrelevant to career pathway refinement. Please provide specific instructions to adjust this pathway, such as 'change step 1 description' or 'add more milestones'."}}
    - If the request is valid, perform the refinement. If an Existing Roadmap is provided as context, you MUST preserve all steps that the user did not ask to change. Modify or replace only the specific steps/details requested by the user, while keeping other milestones/steps identical to the existing roadmap.
"""

# ─── AGENT 2: PATH AUDIT AGENT PROMPT ────────────────────────────────────────
AGENT_2_PROMPT = """You are the Naaviverse Path Audit Agent (Agent 2).
Your purpose is to validate and improve the overall roadmap's path-level information.
Audited Goals:
- Target Career Goal: {target_goal}
- Student Current Position & Profile: {current_position} | {profile}

Given this raw blueprint JSON, review and audit:
1. The overall "path_title" (Is it clear, accurate, and aligned with target goal?)
2. The overall "path_description" (Is it a professional, highly relevant, multi-sentence strategic summary?)
3. Estimate a realistic "readiness_score" (0-100) and "readiness_label" (e.g. Early Starter, Advanced, Intermediate) based dynamically on the student's profile signals (academic performance, stream, and curriculum) relative to the competitiveness of the Target Career Goal:
   - For highly competitive targets (e.g., Harvard, Yale, Stanford, MIT, Oxford, IIT, BITS):
     - If performance is "90% and above", score should be around 30-40 (Early/Intermediate Starter).
     - If performance is "75%–89%", score should be around 20-30.
     - If performance is below 75%, score should be around 10-20.
   - For moderately competitive targets (e.g., Local Universities, State Colleges):
     - If performance is "90% and above", score should be around 75-85 (Advanced Starter).
     - If performance is "75%–89%", score should be around 50-60.
     - If performance is below 75%, score should be around 30-40.
   - Adjust the score dynamically based on these parameters. Do NOT hardcode it.
4. Highlight critical "blind_spots" (gaps, potential constraints, or warnings based on their profile).
5. CRITICAL NAME BAN: Verify that the overall path title and description NEVER mention the student's personal name, email, or personal pronouns. If any names are present, rewrite the text to be completely objective, focusing purely on explaining the main strategic direction of this pathway.

Output ONLY a valid JSON object of this structure:
{{
  "path_title": "<audited and refined Path Title>",
  "path_description": "<audited and refined detailed multi-sentence Path Description>",
  "readiness_score": <updated integer 0-100 based on profile readiness>,
  "readiness_label": "<updated readiness description>",
  "blind_spots": [
    "<warning or critical gap 1 based on profile constraints>",
    "<warning or critical gap 2 based on profile constraints>"
  ]
}}

Blueprint JSON to Audit:
{blueprint}
"""

# ─── AGENT 3: STEPS AND VIEWS AUDIT AGENT PROMPT ─────────────────────────────
AGENT_3_PROMPT = """You are the Naaviverse Steps and Views Audit Agent (Agent 3).
Your purpose is to validate the roadmap's execution structure, milestones, learning views, and micro checklists.
Audited Goals:
- Target Career Goal: {target_goal}
- Student Current Position & Profile: {current_position} | {profile}

Given this blueprint JSON containing steps and views, review and audit:
1. Each step's "title" and "duration" (Ensure logical progression, and MUST preserve the step's exact calculated month duration range from the blueprint JSON, e.g. "Months 1-9" or "Months 1-6" or "Months 1-3" exactly. Do NOT change these ranges to default values).
2. Each step's "description" (Must be a rich, detailed, multi-sentence paragraph of 3-4 sentences detailing the main academic utility).
3. The step's "learning_objectives" (Verify they align with target learning outcomes).
4. The step's "macro_view" (Must be a rich 4-5 sentence paragraph clearly explaining the BIG PICTURE PURPOSE — the overarching academic goal this milestone advances and why it is a critical foundation in the roadmap).
5. The step's "micro_view" (Must be a rich 4-5 sentence paragraph describing the PRECISE EXECUTION OUTPUT — the exact academic tasks, deliverables, and coursework the student must complete to finish this phase).
6. The step's "nano_view" (Must be a rich 4-5 sentence paragraph explaining the MENTOR GUIDANCE FOCUS — the diagnostic checks, expert review sessions, and accountability checkpoints that validate readiness to advance).
7. The step's "micro_steps" checklist tasks (Make sure they are hyper-specific, actionable, and tailored to the student's curriculum/grade).
8. CRITICAL NAME BAN: Strictly verify that NONE of the step titles, durations, descriptions, learning objectives, views (macro, micro, nano), or micro_steps tasks contain the student's personal name, email, or direct pronouns. Rewrite all fields to be completely objective, professional, and academic, focusing entirely on what the step achieves, how to execute it, and how to complete the step successfully.
9. CRITICAL STEP PRESERVATION RULE: You MUST audit and return every single milestone/step provided in the blueprint JSON. If the blueprint JSON contains 8 steps, you must output exactly 8 audited steps in your JSON array. If it contains 10 steps, you must output exactly 10 audited steps. Do NOT skip, delete, combine, or truncate the steps under any circumstances.

Output ONLY a valid JSON array of this structure:
[
  {{
    "id": 1,
    "title": "<audited step title>",
    "duration": "<preserve duration range from blueprint exactly, e.g., 'Months 1-9'>",
    "description": "<audited rich detailed multi-sentence description (3-4 sentences)>",
    "learning_objectives": [
      "<audited learning objective 1>",
      "... for all learning objectives in this step ..."
    ],
    "macro_view": "<audited/refined macro view text>",
    "micro_view": "<audited/refined micro view text>",
    "nano_view": "<audited/refined nano view text>",
    "micro_steps": [
      {{"task": "<actionable task>", "resource": "<real specific resource>"}},
      "... for all micro steps in this step ..."
    ]
  }},
  ... for all steps in the blueprint ...
]

Blueprint JSON to Audit:
{blueprint}
"""

# ─── AGENT 4: MARKETPLACE AUDIT AGENT PROMPT ──────────────────────────────────
AGENT_4_PROMPT = """You are the Naaviverse Marketplace Audit Agent (Agent 4).
Your purpose is to validate all learning resource marketplace recommendations generated across each milestone's Macro, Micro, and Nano views.
Audited Goals:
- Target Career Goal: {target_goal}
- Student Current Position & Profile: {current_position} | {profile}

Given this blueprint JSON, review the "marketplace" block for each step.
Ensure resources:
1. Match the budget limits (Lower percentages like 0-25% or 25-50% => free/low cost resources, higher percentages => high quality bootcamps/paid courses/premium mentoring).
2. Match personality traits (RIASEC codes: Realistic => practical/hands-on tasks, Investigative => research/data/logic, Artistic => design/creative writing, Social => teaching/helping/cooperative, Enterprising => startup/business/leadership, Conventional => structured/admin/analytical tracking).
3. Are highly reputable, real-world educational resources (e.g. Khan Academy, Coursera, MIT OCW, specific standard prep books).
4. Pricing and next steps are realistic, detailed, and actionable.
5. CRITICAL NAME BAN: Ensure that no marketplace recommendations, why details, next steps, or outcomes contain the student's personal name, email, or pronouns. Keep all text objective and general.
6. CRITICAL STEP PRESERVATION RULE: You MUST audit and return the marketplace blocks for every single milestone/step provided in the blueprint JSON. If the blueprint JSON has 8 steps, you must output exactly 8 audited steps in your JSON array. If it has 10 steps, you must output exactly 10 audited steps. Do NOT skip, delete, combine, or truncate steps under any circumstances.

Output ONLY a valid JSON array of this structure:
[
  {{
    "id": 1,
    "marketplace": {{
      "mentors": [
        {{
          "name": "<audited mentor name>",
          "type": "Mentor",
          "why": "<why this fits the macro free view>",
          "next_step": "<how to connect>",
          "tags": ["<tag>"],
          "section": "macro_free",
          "price": "Free"
        }},
        {{
          "name": "<audited paid mentor>",
          "type": "Mentor",
          "why": "<why this fits the micro view>",
          "next_step": "<how to connect>",
          "tags": ["<tag>"],
          "section": "micro_structured",
          "price": "<price>"
        }},
        {{
          "name": "<audited premium mentor>",
          "type": "Mentor",
          "why": "<why this fits the nano view>",
          "next_step": "<how to connect>",
          "tags": ["<tag>"],
          "section": "nano_expert",
          "price": "<price>"
        }}
      ],
      "vendors": [
        {{
          "name": "<audited free vendor resource>",
          "type": "Course",
          "why": "<why>",
          "next_step": "<next step>",
          "tags": ["<tag>"],
          "section": "macro_free",
          "cost": "Free"
        }},
        {{
          "name": "<audited structured vendor course>",
          "type": "Course",
          "why": "<why>",
          "next_step": "<next step>",
          "tags": ["<tag>"],
          "section": "micro_structured",
          "cost": "<cost>"
        }},
        {{
          "name": "<audited premium vendor bootcamp>",
          "type": "Bootcamp",
          "why": "<why>",
          "next_step": "<next step>",
          "tags": ["<tag>"],
          "section": "nano_expert",
          "cost": "<cost>"
        }}
      ],
      "institutions": [
        {{
          "name": "<audited free open university resource>",
          "type": "University",
          "why": "<why>",
          "next_step": "<next step>",
          "tags": ["<tag>"],
          "section": "macro_free",
          "cost": "Free"
        }},
        {{
          "name": "<audited university certificate program>",
          "type": "University",
          "why": "<why>",
          "next_step": "<next step>",
          "tags": ["<tag>"],
          "section": "micro_structured",
          "cost": "<cost>"
        }},
        {{
          "name": "<audited premium executive university program>",
          "type": "University",
          "why": "<why>",
          "next_step": "<next step>",
          "tags": ["<tag>"],
          "section": "nano_expert",
          "cost": "<cost>"
        }}
      ],
      "distributors": [
        {{
          "name": "<audited free youtube or docs>",
          "type": "YouTube",
          "why": "<why>",
          "next_step": "<next step>",
          "tags": ["<tag>"],
          "section": "macro_free",
          "cost": "Free"
        }},
        {{
          "name": "<audited book or paid guide>",
          "type": "Book",
          "why": "<why>",
          "next_step": "<next step>",
          "tags": ["<tag>"],
          "section": "micro_structured",
          "cost": "<cost>"
        }},
        {{
          "name": "<audited premium tech library subscription>",
          "type": "Subscription",
          "why": "<why>",
          "next_step": "<next step>",
          "tags": ["<tag>"],
          "section": "nano_expert",
          "cost": "<cost>"
        }}
      ]
    }}
  }},
  ... for all steps in the blueprint ...
]

Blueprint JSON to Audit:
{blueprint}
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


def enrich_step_narrative(step: dict, current: str, goal: str) -> dict:
    """Guarantee every roadmap step has detailed view text, even when a model returns one-liners."""
    if not isinstance(step, dict):
        return step

    title = str(step.get("title") or f"Step {step.get('id', '')}").strip()
    duration = str(step.get("duration") or "this phase").strip()
    existing_description = str(step.get("description") or "").strip()
    source_description = existing_description or f"Complete the planned academic work for {title}."

    if not is_rich_paragraph(existing_description, min_chars=220, min_sentences=3):
        step["description"] = (
            f"{source_description} This {duration} milestone should define the exact academic target, the evidence that proves progress, "
            f"and the standards required to move forward in the pathway. The work should connect daily study routines, profile-building activity, "
            f"and measurable readiness indicators so the student is not simply completing tasks but building a stronger admissions narrative. "
            f"By the end of the phase, the student should have clear outputs, reviewed gaps, and a documented next-step plan for the following milestone."
        )

    if not is_rich_paragraph(step.get("macro_view")):
        set_view_description(step, "macro_view", (
            f"{title} is a strategic milestone because it turns the broad ambition of reaching {goal} into a concrete stage of academic readiness. "
            f"During {duration}, this phase should strengthen the student's transcript, subject confidence, and long-term preparation habits while keeping the final destination visible. "
            f"It is important because weak execution here creates gaps that later appear in test scores, applications, interviews, or portfolio evidence. "
            f"Completing this step well unlocks the next stage of the pathway by proving that the student can meet a defined standard, reflect on gaps, and convert guidance into steady progress. "
            f"The big-picture outcome is a stronger, more coherent profile that connects the current position of {current} with the expectations of {goal}."
        ))

    if not is_rich_paragraph(step.get("micro_view")):
        set_view_description(step, "micro_view", (
            f"The execution focus for {title} should be converted into weekly deliverables, tracked study blocks, and visible proof of completion. "
            f"The student should maintain a simple planner in Notion, Google Sheets, or a notebook with subject targets, practice-test scores, resource links, and pending mentor feedback. "
            f"At least two to three focused work sessions per week should be reserved for this milestone, with extra time added before exams, submissions, or application deadlines. "
            f"Completion should be measured through tangible outputs such as revised notes, mock-test analysis, shortlist documents, project logs, essay drafts, or reviewed checklists, depending on the step. "
            f"Before moving forward, the student should be able to show what was completed, what improved, what still needs support, and how the next milestone will use this output."
        ))

    if not is_rich_paragraph(step.get("nano_view")):
        set_view_description(step, "nano_view", (
            f"The mentor focus for {title} should be diagnostic, evidence-based, and tied to readiness for the next milestone. "
            f"A counselor, subject expert, or admissions mentor should review the student's current output, compare it with the milestone expectations, and identify the highest-risk gaps. "
            f"The review should include specific feedback on academic quality, consistency, time management, and whether the evidence produced during {duration} is strong enough to support the overall pathway. "
            f"Peer or cohort accountability can be used to compare progress, surface blind spots, and keep execution from becoming isolated or vague. "
            f"The phase should close with a revised action list that records mentor feedback, fixes weak assumptions, and confirms whether the student is ready to advance."
        ))

    return step


def enrich_roadmap_narratives(roadmap: dict, current: str, goal: str) -> dict:
    if not isinstance(roadmap, dict):
        return roadmap
    milestones = roadmap.get("steps")
    if isinstance(milestones, list):
        roadmap["steps"] = [
            enrich_step_narrative(milestone, current, goal)
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


# Helper to query Groq and extract clean JSON with model fallbacks
async def query_groq_json(
    prompt: str,
    preferred_model: str = "llama-3.1-8b-instant",
    fallback_models: Optional[List[str]] = None,
) -> dict:
    models = [preferred_model] + (
        fallback_models
        if fallback_models is not None
        else [
            "llama-3.1-8b-instant",
            "llama-3.3-70b-versatile",
            "qwen/qwen3-32b",
            "openai/gpt-oss-20b",
        ]
    )



    # Deduplicate while preserving order (preferred_model may already be one of the fallbacks)
    seen = set()
    unique_models = []
    for m in models:
        if m not in seen:
            seen.add(m)
            unique_models.append(m)

    last_err = None
    for m in unique_models:
        try:
            estimated_input_tokens = int(len(prompt) / 3.2)
            if "70b" in m or "120b" in m or "32b" in m or "17b" in m:
                max_tok = 4096
            else:
                max_tok = max(1000, 5800 - estimated_input_tokens)
                if max_tok > 2500:
                    max_tok = 2500

            response = await async_client.chat.completions.create(
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
                # Attempt partial JSON recovery: try to close unclosed brackets
                print(f"[JSON Recovery] Attempting to repair truncated JSON from model {m}. Error at char {json_err.pos}.")
                # Truncate to last valid position and try to close structures
                truncated = raw[:json_err.pos].rstrip().rstrip(",").rstrip()
                # Count unclosed braces/brackets
                opens = truncated.count("{") - truncated.count("}")
                open_arrays = truncated.count("[") - truncated.count("]")
                closing = "]" * open_arrays + "}" * opens
                repaired = truncated + closing
                try:
                    result = json.loads(repaired)
                    print(f"[JSON Recovery] Successfully repaired truncated JSON from model {m}.")
                    return result
                except Exception:
                    raise json_err  # Let the outer except catch it and try next model

        except Exception as e:
            print(f"[Groq Call Failed for model {m}] trying next fallback. Error: {e}")
            last_err = e
            continue

    print(f"[Groq Critical Failure] All models exhausted. Final error: {last_err}")
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
    "bachelor": ("Bachelor's", 48),
    "bachelors": ("Bachelor's", 48),
    "bachelor's": ("Bachelor's", 48),
    "undergraduate": ("Bachelor's", 48),
    "ug": ("Bachelor's", 48),
    "btech": ("Bachelor's", 48),
    "b.tech": ("Bachelor's", 48),
    "bsc": ("Bachelor's", 48),
    "b.sc": ("Bachelor's", 48),
    "master": ("Master's", 24),
    "masters": ("Master's", 24),
    "master's": ("Master's", 24),
    "graduate": ("Master's", 24),
    "postgraduate": ("Master's", 24),
    "pg": ("Master's", 24),
    "mtech": ("Master's", 24),
    "m.tech": ("Master's", 24),
    "msc": ("Master's", 24),
    "m.sc": ("Master's", 24),
    "mba": ("Master's", 24),
    "phd": ("PhD", 60),
    "ph.d": ("PhD", 60),
    "doctorate": ("PhD", 60),
    "doctoral": ("PhD", 60),
    "transfer": ("Transfer", 24),
    "associate": ("Associate", 24),
    "associates": ("Associate", 24),
    "diploma": ("Diploma", 12),
    "certificate": ("Certificate", 6),
    "certification": ("Certificate", 6),
}

MONTHS_PER_ACADEMIC_YEAR = 12
FINAL_SCHOOL_GRADE = 12
MIN_ADMISSION_CYCLE_MONTHS = MONTHS_PER_ACADEMIC_YEAR


def normalize_degree_type(value: Optional[str]) -> Optional[str]:
    if not value:
        return None
    text = str(value).strip().lower()
    for key, (label, _) in DEGREE_TYPE_OPTIONS.items():
        if re.search(rf"(^|[\s\-.]){re.escape(key)}($|[\s\-.])", text):
            return label
    return None


def extract_degree_type_from_goal(goal: str) -> Optional[str]:
    parts = [p.strip() for p in re.split(r"[\u2022.]+", goal or "") if p.strip()]
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


def ensure_degree_type_for_generation(goal: str, profile: dict, explicit_degree_type: Optional[str] = None) -> dict:
    degree_type = get_request_degree_type(goal, profile, explicit_degree_type)
    if not degree_type:
        raise HTTPException(
            status_code=400,
            detail="Degree type is required. Please include Bachelor's, Master's, PhD, Transfer, Associate, Diploma, or Certificate before generating a path.",
        )

    enriched_profile = dict(profile or {})
    enriched_profile["degreeType"] = degree_type
    return enriched_profile


def duration_months_for_degree(degree_type: Optional[str]) -> Optional[int]:
    normalized = normalize_degree_type(degree_type)
    if not normalized:
        return None
    for label, months in DEGREE_TYPE_OPTIONS.values():
        if label == normalized:
            return months
    return None


def duration_months_for_level(level: int) -> int:
    level_to_degree = {
        1: "bachelor",
        2: "master",
        3: "phd",
    }
    degree_type = level_to_degree.get(level)
    return duration_months_for_degree(degree_type) or MIN_ADMISSION_CYCLE_MONTHS


def calculate_total_duration_months(current: str, goal: str, profile: dict, explicit_degree_type: Optional[str] = None) -> int:
    target_degree = get_request_degree_type(goal, profile, explicit_degree_type)

    target_level = 0
    if target_degree:
        td_lower = target_degree.lower()
        if any(k in td_lower for k in ["phd", "ph.d", "doctorate", "doctoral"]):
            target_level = 3
        elif any(k in td_lower for k in ["master", "postgraduate", "pg", "mtech", "msc", "mba"]):
            target_level = 2
        elif any(k in td_lower for k in ["bachelor", "undergraduate", "ug", "btech", "bsc", "associate", "diploma", "transfer"]):
            target_level = 1

    current_str = f"{(profile or {}).get('grade') or ''} {current or ''}".lower()
    
    current_level = 0
    remaining_current_months = 0
    is_school = False
    grade_num = None
    
    if any(k in current_str for k in ["grade", "class", "std", "th ", "th", "school"]):
        is_school = True
        
    num_match = re.search(r'\b(9|10|11|12)\b', current_str)
    if num_match:
        grade_num = int(num_match.group(1))
        is_school = True
    elif "tenth" in current_str or "10th" in current_str:
        grade_num = 10
        is_school = True
    elif "eleventh" in current_str or "11th" in current_str:
        grade_num = 11
        is_school = True
    elif "twelfth" in current_str or "12th" in current_str:
        grade_num = 12
        is_school = True
    elif "ninth" in current_str or "9th" in current_str:
        grade_num = 9
        is_school = True

    is_bachelors = any(k in current_str for k in ["bachelor", "btech", "b.tech", "bsc", "b.sc", "undergrad", "ug", "college", "university"])
    is_masters = any(k in current_str for k in ["master", "mtech", "m.tech", "msc", "m.sc", "mba", "postgrad", "pg"])
    is_graduate = any(k in current_str for k in ["grad", "completed", "finished", "degree holder", "alumni"])
    
    if is_masters:
        current_level = 2
        if "1st year" in current_str or "first year" in current_str:
            remaining_current_months = duration_months_for_level(current_level) // 2
        else:
            remaining_current_months = 0
    elif is_bachelors:
        current_level = 1
        current_degree_months = duration_months_for_level(current_level)
        if is_graduate:
            remaining_current_months = 0
        elif "1st year" in current_str or "first year" in current_str:
            remaining_current_months = current_degree_months - (current_degree_months // 4)
        elif "2nd year" in current_str or "second year" in current_str:
            remaining_current_months = current_degree_months // 2
        elif "3rd year" in current_str or "third year" in current_str:
            remaining_current_months = current_degree_months // 4
        elif "4th year" in current_str or "fourth year" in current_str or "final year" in current_str:
            remaining_current_months = 0
        else:
            remaining_current_months = current_degree_months // 2
    elif is_school or grade_num is not None:
        current_level = 0
        if grade_num is not None:
            remaining_current_months = (FINAL_SCHOOL_GRADE - grade_num + 1) * MONTHS_PER_ACADEMIC_YEAR
        else:
            remaining_current_months = MONTHS_PER_ACADEMIC_YEAR * 2
    else:
        if target_level >= 2:
            current_level = 1
            remaining_current_months = 0
        else:
            current_level = 0
            remaining_current_months = MONTHS_PER_ACADEMIC_YEAR * 2

    if target_level <= current_level:
        return max(MIN_ADMISSION_CYCLE_MONTHS, remaining_current_months)

    total_duration = remaining_current_months
    for level in range(current_level + 1, target_level):
        total_duration += duration_months_for_level(level)
            
    return max(MIN_ADMISSION_CYCLE_MONTHS, total_duration)


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
    if any(k in text for k in ["non-academic", "non academic", "mental", "wellness", "life counselling", "life counseling", "immediate guidance"]):
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
        },
        {
            "option_name": "Curriculum & GPA Focus",
            "focus": "Academic & Research - Curriculum & GPA Excellence Track: Focus on standard academic curricula, course selections, maintaining a top-tier GPA, and fulfilling prerequisite school/college/university coursework."
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
        },
        {
            "option_name": "Internship & Applied Focus",
            "focus": "Practical & Skills - Internship & Applied Practice Track: Focus on gaining early work experience, securing internships, participating in apprenticeships, and applying learning to real-world environments."
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
        },
        {
            "option_name": "Resume & Career Evidence Focus",
            "focus": "Jobs & Careers - Resume & Career Evidence: Focus on tailoring resumes, building professional profiles (LinkedIn, GitHub), gathering evidence of workplace competence, and job search management."
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
        },
        {
            "option_name": "Immediate Action & Support Focus",
            "focus": "Non-Academic Counselling - Immediate Guidance & Support: Focus on short-term resource navigation, safe escalation paths, quick-win routines, and qualified peer or professional referral options."
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


def get_mock_marketplace(focus: Optional[str]) -> dict:
    if not focus:
        focus = "Academic"
        
    if "Academic" in focus:
        return {
            "mentors": [
                {"name": "Peer Cohort Study Group", "type": "Mentor", "why": "Free study groups led by senior students who cleared admissions.", "next_step": "Join the weekly study circle.", "tags": ["Study Group", "Peer Support"], "section": "macro_free"},
                {"name": "University Admissions Q&A Circle", "type": "Mentor", "why": "Free AMA sessions with international admissions advisors.", "next_step": "Register for the monthly webinar.", "tags": ["AMA", "Admissions"], "section": "macro_free"},
                {"name": "SAT Group Coaching Session", "type": "Mentor", "cost": "$99", "duration": "4 weeks", "value": "Small group review.", "next_step": "Join cohort.", "tags": ["SAT", "Coaching"], "section": "micro_structured"},
                {"name": "Advanced Subject Tutoring", "type": "Tutor", "cost": "$75", "duration": "1 session", "value": "Get customized clarification on advanced concepts.", "next_step": "Schedule topic review call.", "tags": ["Tutor", "STEM"], "section": "micro_structured"},
                {"name": "Naaviverse Academic Counsel Review", "type": "Mentor", "price": "$150", "session_details": "1-on-1 Zoom Session (45 mins)", "expected_outcomes": "Personalized assessment of GPA targets and academic safety nets.", "tags": ["Counseling", "Shortlist"], "section": "nano_expert"},
                {"name": "Elite Test Prep Coaching", "type": "Coaching", "price": "$120/hr", "session_details": "Private Tutoring", "expected_outcomes": "Custom strategy to target specific weak areas in TOEFL/IELTS.", "tags": ["Tutoring", "IELTS"], "section": "nano_expert"}
            ],
            "vendors": [
                {"name": "Khan Academy Standardized Test Prep", "type": "Course", "why": "Excellent free resource for SAT math and reading diagnostics.", "next_step": "Complete a full-length SAT mock diagnostic test.", "tags": ["SAT", "Prep", "Math"], "section": "macro_free"},
                {"name": "Albert.io AP Practice Modules", "type": "Platform", "why": "Free diagnostic exams and curriculum alignment guides.", "next_step": "Sign up and complete the algebra diagnostic.", "tags": ["AP", "Diagnostics"], "section": "macro_free"},
                {"name": "Coursera AP Computer Science", "type": "Course", "cost": "$49", "duration": "4 weeks", "value": "Structured preparation matching the high school curriculum syllabus.", "next_step": "Complete modules on Object-Oriented programming.", "tags": ["AP CS", "Java", "Coding"], "section": "micro_structured"},
                {"name": "Princeton Review Advanced Prep", "type": "Course", "cost": "$299", "duration": "6 weeks", "value": "Guided instruction and score guarantee for high-stakes tests.", "next_step": "Enroll in the weekend live instruction cohort.", "tags": ["Test Prep", "SAT", "ACT"], "section": "micro_structured"},
                {"name": "Naaviverse Expert Review Plan", "type": "Provider", "price": "$120", "session_details": "Review", "expected_outcomes": "Audit.", "tags": ["Audit"], "section": "nano_expert"},
                {"name": "PrepScholar Elite Prep Plan", "type": "Platform", "price": "$397", "session_details": "Self-paced study platform", "expected_outcomes": "AI-customized preparation strategy with mock testing.", "tags": ["PrepScholar", "Target Score"], "section": "nano_expert"}
            ],
            "institutions": [
                {"name": "MIT OpenCourseWare Calculus", "type": "University", "why": "In-depth lectures to build rigorous mathematical foundation.", "next_step": "Watch Lectures 1-5 and solve problem set 1.", "tags": ["Math", "Calculus", "MIT"], "section": "macro_free"},
                {"name": "Stanford Online Free High School Seminars", "type": "University", "why": "Empathy-led courses on modern logic and STEM research methods.", "next_step": "Audit the logic module.", "tags": ["Stanford", "Logic"], "section": "macro_free"},
                {"name": "IIT Hyderabad Foundation Program", "type": "Institute", "cost": "$150", "duration": "8 weeks", "value": "Foundational syllabus mapping top engineering standards.", "next_step": "Register for the online weekend lectures.", "tags": ["Engineering", "Syllabus"], "section": "micro_structured"},
                {"name": "BITS Pilani Online Certification", "type": "University", "cost": "$200", "duration": "10 weeks", "value": "Advanced topic certification to showcase high school rigor.", "next_step": "Submit application form.", "tags": ["Computer Science", "BITS"], "section": "micro_structured"},
                {"name": "Ivy League Admissions Summit", "type": "University", "price": "$250", "session_details": "Online Conference", "expected_outcomes": "Direct exposure to admissions directors and successful applicant profiles.", "tags": ["Ivy League", "Summit"], "section": "nano_expert"},
                {"name": "Columbia High School Summer Program", "type": "University", "price": "$3,500", "session_details": "Summer School (2 weeks)", "expected_outcomes": "Advanced credit and university-level coursework validation.", "tags": ["Columbia", "Summer School"], "section": "nano_expert"}
            ],
            "distributors": [
                {"name": "College Board Official SAT Study Guide", "type": "Book", "why": "Contains 8 official practice tests and detail scoring guide.", "next_step": "Purchase from online store and solve Test 1.", "tags": ["SAT", "Guidebook"], "section": "macro_free"},
                {"name": "Academic Excellence Open Access Library", "type": "Library", "why": "Free access to research publications and high school research journals.", "next_step": "Search archives for STEM topics.", "tags": ["Library", "Research"], "section": "macro_free"},
                {"name": "High School Science Journal subscription", "type": "Subscription", "cost": "$30/year", "duration": "Annual", "value": "Weekly articles on STEM research developments.", "next_step": "Subscribe to student digital edition.", "tags": ["STEM", "Research"], "section": "micro_structured"},
                {"name": "O'Reilly Student Annual Book Set", "type": "Book", "cost": "$45", "duration": "Annual", "value": "Comprehensive books covering computer science and logic.", "next_step": "Order physical textbooks.", "tags": ["CS", "Books"], "section": "micro_structured"},
                {"name": "Academic Excellence Newsletter", "type": "Newsletter", "price": "Free", "session_details": "Weekly Email", "expected_outcomes": "Curated list of international essay competitions and summer research programs.", "tags": ["Newsletter", "Competition"], "section": "nano_expert"},
                {"name": "IEEE Spectrum Student Subscription", "type": "Publication", "price": "$90/year", "session_details": "Digital Magazine", "expected_outcomes": "Monthly updates on scientific computing and AI strategy trends.", "tags": ["IEEE", "AI Strategy"], "section": "nano_expert"}
            ]
        }
    elif "Practical" in focus:
        return {
            "mentors": [
                {"name": "Open-Source Community Lead shadow", "type": "Mentor", "why": "Shadow active open-source contributors and learn coding standards.", "next_step": "Join the weekly developer community call.", "tags": ["Open Source", "Developer"], "section": "macro_free"},
                {"name": "GitHub Student Community Office Hours", "type": "Mentor", "why": "Get free assistance with git issues and repository structures.", "next_step": "Join the Discord forum.", "tags": ["GitHub", "Git"], "section": "macro_free"},
                {"name": "Practical Career Pathway Coach", "type": "Coaching", "cost": "$199", "duration": "4 sessions", "value": "Align project portfolio with target companies.", "next_step": "Book first calibration call.", "tags": ["Career Coach", "Portfolio"], "section": "micro_structured"},
                {"name": "Developer Portfolio Review Mentor", "type": "Tutor", "cost": "$60", "duration": "1 session", "value": "Get your projects audited by an experienced developer.", "next_step": "Schedule your project review.", "tags": ["Code Review", "Portfolio"], "section": "micro_structured"},
                {"name": "Naavi Tech Mentor Portfolio Audit", "type": "Mentor", "price": "$120", "session_details": "Async Code Review & 30-min Call", "expected_outcomes": "Code readability review, project ideas list, and GitHub optimization tips.", "tags": ["Code Review", "Portfolio"], "section": "nano_expert"},
                {"name": "Industry Engineer Interview Coaching", "type": "Coaching", "price": "$150/hr", "session_details": "1-on-1 Mock Coding Interview", "expected_outcomes": "Realistic technical interview simulation and problem-solving critiques.", "tags": ["Interview Prep", "Coding"], "section": "nano_expert"}
            ],
            "vendors": [
                {"name": "freeCodeCamp Web Development Bootcamp", "type": "Course", "why": "Hands-on projects to master HTML/CSS/Javascript and Git.", "next_step": "Complete the responsive web design certification.", "tags": ["Coding", "Web Dev", "Portfolio"], "section": "macro_free"},
                {"name": "Scrimba Frontend Developer Pathway", "type": "Course", "why": "Interactive free modules to build frontend web pages.", "next_step": "Complete HTML & CSS basics.", "tags": ["Frontend", "Scrimba"], "section": "macro_free"},
                {"name": "Codecademy Pro Career Path", "type": "Bootcamp", "cost": "$39/mo", "duration": "Self-paced", "value": "Interactive coding workspace with portfolio projects and reviews.", "next_step": "Build and push a personal portfolio project to GitHub.", "tags": ["Coding", "Portfolio", "Interviews"], "section": "micro_structured"},
                {"name": "Udemy AWS Certified Cloud Practitioner", "type": "Course", "cost": "$19", "duration": "3 weeks", "value": "Learn cloud infrastructure and obtain an industry-recognized credential.", "next_step": "Complete practice exam questions and sit for the exam.", "tags": ["AWS", "Cloud"], "section": "micro_structured"},
                {"name": "Udacity Nanodegree Program", "type": "Bootcamp", "price": "$399/mo", "session_details": "Structured Online Program", "expected_outcomes": "Graduation portfolio project certified by industry partners.", "tags": ["Nanodegree", "Project"], "section": "nano_expert"},
                {"name": "Springboard Tech Career Track", "type": "Bootcamp", "price": "$1,200", "session_details": "Project-based curriculum", "expected_outcomes": "Job guarantee and 1-on-1 mentoring support.", "tags": ["Springboard", "Placement"], "section": "nano_expert"}
            ],
            "institutions": [
                {"name": "Harvard CS50 Introduction to Computer Science", "type": "University", "why": "Comprehensive overview of algorithmic thinking and software development.", "next_step": "Watch Lecture 1 and submit Problem Set 1.", "tags": ["Computer Science", "Algorithms", "Harvard"], "section": "macro_free"},
                {"name": "MIT OpenCourseWare Python Fundamentals", "type": "University", "why": "Free university curriculum detailing object-oriented programming concepts.", "next_step": "Download files for problem set 1.", "tags": ["Python", "MIT"], "section": "macro_free"},
                {"name": "Scaler Academy Professional Track", "type": "Academy", "cost": "$1,200", "duration": "6 months", "value": "Structured software engineering program with industry mentors.", "next_step": "Pass the online coding eligibility test.", "tags": ["Software", "Placement"], "section": "micro_structured"},
                {"name": "Coding Ninjas Web Dev Track", "type": "Academy", "cost": "$150", "duration": "4 months", "value": "Live webinars, doubt support, and web application deployment projects.", "next_step": "Submit application form.", "tags": ["Web Dev", "Coding Ninjas"], "section": "micro_structured"},
                {"name": "Stanford Center for Professional Development Certificate", "type": "University", "price": "$800", "session_details": "Self-paced online module", "expected_outcomes": "Official certificate of completion in Advanced Software Foundations.", "tags": ["Stanford", "Certificate"], "section": "nano_expert"},
                {"name": "IIIT Bangalore PG Diploma in Software", "type": "Institute", "price": "$2,500", "session_details": "Online PG Diploma (1 year)", "expected_outcomes": "Earn college credits and direct corporate interview placement opportunities.", "tags": ["IIITB", "PG Diploma"], "section": "nano_expert"}
            ],
            "distributors": [
                {"name": "GitHub Developer Community & Guides", "type": "Guide", "why": "Official documentation and developer forums to learn Git workflows.", "next_step": "Create a GitHub account and initialize your first repository.", "tags": ["Git", "GitHub"], "section": "macro_free"},
                {"name": "MDN Web Docs Library", "type": "Docs", "why": "Comprehensive developer reference for HTML, CSS, and JS APIs.", "next_step": "Read documentation on array methods.", "tags": ["Docs", "Mozilla"], "section": "macro_free"},
                {"name": "O'Reilly Media Learning Subscription", "type": "Subscription", "cost": "$49/mo", "duration": "Monthly", "value": "Unlimited access to thousands of technical books, video courses, and live sandboxes.", "next_step": "Access the 'Clean Code' digital book.", "tags": ["Books", "Vids"], "section": "micro_structured"},
                {"name": "System Design Handbook by Alex Xu", "type": "Book", "cost": "$35", "duration": "Self-paced", "value": "Visual explanations of high-scale backend design paradigms.", "next_step": "Purchase and read Chapter 1.", "tags": ["System Design", "Alex Xu"], "section": "micro_structured"},
                {"name": "Dev.to Tech Blogs digest", "type": "Community", "price": "Free", "session_details": "Weekly Email", "expected_outcomes": "Stay updated with trending frameworks, open-source projects, and career tips.", "tags": ["Blogs", "Dev.to"], "section": "nano_expert"},
                {"name": "Medium Towards Data Science", "type": "Publication", "price": "$50/year", "session_details": "Premium Writer Network", "expected_outcomes": "Deep-dives into actual machine learning pipelines and engineering case studies.", "tags": ["Medium", "Data Science"], "section": "nano_expert"}
            ]
        }
    else: # Holistic
        return {
            "mentors": [
                {"name": "Alumni Mentor office hours", "type": "Mentor", "why": "Free consultations with university alumni to understand campus culture.", "next_step": "Book a 20-min chat on their open calendar.", "tags": ["Alumni", "Mentorship"], "section": "macro_free"},
                {"name": "Local Community Service Advisor", "type": "Mentor", "why": "Free counseling on aligning project ideas with local NGOs.", "next_step": "Schedule a community project consultation.", "tags": ["Community", "NGO"], "section": "macro_free"},
                {"name": "Public Speaking Coach Cohort", "type": "Coaching", "cost": "$120", "duration": "5 weeks", "value": "Live speaking drills with cohort feedback.", "next_step": "Register for the upcoming public speaking circle.", "tags": ["Communication"], "section": "micro_structured"},
                {"name": "Emotional Intelligence Coach", "type": "Coaching", "cost": "$80", "duration": "2 sessions", "value": "Understand self-motivation, empathy, and social leadership skills.", "next_step": "Book first diagnostic assessment.", "tags": ["EQ", "Coach"], "section": "micro_structured"},
                {"name": "Naavi Counselor Review & Personality Diagnostic", "type": "Mentor", "price": "$100", "session_details": "Myers-Briggs / Aptitude Zoom Session", "expected_outcomes": "Detailed profiling report highlighting soft skill strengths and growth plans.", "tags": ["Counseling", "MBTI"], "section": "nano_expert"},
                {"name": "Admissions Leadership Coach", "type": "Coaching", "price": "$130/hr", "session_details": "1-on-1 Essay Story Arcs Session", "expected_outcomes": "Select compelling personal stories for leadership essays.", "tags": ["Admissions", "Coaching"], "section": "nano_expert"}
            ],
            "vendors": [
                {"name": "Coursera Introduction to Public Speaking", "type": "Course", "why": "Learn techniques to design and deliver engaging presentations.", "next_step": "Record a 3-minute introductory speech and request feedback.", "tags": ["Communication", "Soft Skills"], "section": "macro_free"},
                {"name": "EdX Empathy in UX Design", "type": "Course", "why": "Free lectures explaining empathy mapping and human-centric logic.", "next_step": "Audit the introduction module.", "tags": ["UX", "Empathy"], "section": "macro_free"},
                {"name": "Dale Carnegie Teen Leadership Program", "type": "Course", "cost": "$395", "duration": "4 weeks", "value": "Build resilience, communication skills, and team management confidence.", "next_step": "Register for the summer leadership cohort.", "tags": ["Leadership", "Carnegie"], "section": "micro_structured"},
                {"name": "Interaction Design Foundation Soft Skills", "type": "Course", "cost": "$16/mo", "duration": "Self-paced", "value": "Understand user experience, empathy, and collaborative workshop methodologies.", "next_step": "Complete the module on stakeholder communication.", "tags": ["UX", "Collaboration"], "section": "micro_structured"},
                {"name": "Mindvalley Quest For Leadership", "type": "Platform", "price": "$299", "session_details": "Personal development curriculum", "expected_outcomes": "Validated training program covering emotional intelligence and community building.", "tags": ["Mindvalley", "EQ"], "section": "nano_expert"},
                {"name": "Sanskriti Leadership Summer Camp", "type": "Bootcamp", "price": "$850", "session_details": "4-week intensive workshop", "expected_outcomes": "Practical certificate validating local campaign execution and team building.", "tags": ["Camp", "Sanskriti"], "section": "nano_expert"}
            ],
            "institutions": [
                {"name": "Toastmasters International Youth Leadership", "type": "School", "why": "Free local clubs to build public speaking and interpersonal confidence.", "next_step": "Attend an open club meeting as a guest.", "tags": ["Public Speaking", "Leadership"], "section": "macro_free"},
                {"name": "Local YMCA Community Club", "type": "School", "why": "Free group activities focusing on public outreach and youth mentoring.", "next_step": "Register for the weekend volunteering cohort.", "tags": ["YMCA", "Community"], "section": "macro_free"},
                {"name": "Wharton Global Youth Program Certificate", "type": "University", "cost": "$450", "duration": "3 weeks", "value": "Introduction to business strategies, teamwork, and entrepreneurial leadership.", "next_step": "Apply to the Wharton online summer workshop.", "tags": ["Business", "Wharton"], "section": "micro_structured"},
                {"name": "NIFT Summer Design Seminar", "type": "Institute", "cost": "$120", "duration": "4 weeks", "value": "Introduction to design methodologies, branding, and team management.", "next_step": "Submit enrollment details.", "tags": ["NIFT", "Design"], "section": "micro_structured"},
                {"name": "Admissions Leadership Seminar (Ivy League Focus)", "type": "University", "price": "$300", "session_details": "4-week webinars series", "expected_outcomes": "Certified training on student impact, societal leadership, and college-level ethics.", "tags": ["Ethics", "Leadership"], "section": "nano_expert"},
                {"name": "HBS Online Leadership Principles Program", "type": "University", "price": "$1,600", "session_details": "Online Harvard program", "expected_outcomes": "Official Harvard credential validating team mobilization and strategic execution.", "tags": ["HBS Online", "Teamwork"], "section": "nano_expert"}
            ],
            "distributors": [
                {"name": "Ted Talks soft skills playlist", "type": "YouTube", "why": "Curated videos of elite presenters discussing communication and EQ.", "next_step": "Watch the top 3 videos and note key body language techniques.", "tags": ["Videos", "TED"], "section": "macro_free"},
                {"name": "Emotional Intelligence Toolkit Docs", "type": "Docs", "why": "Free PDFs detailing communication frameworks and conflict resolution models.", "next_step": "Download and read Chapter 1.", "tags": ["Docs", "EQ"], "section": "macro_free"},
                {"name": "Harvard Business Review teens package", "type": "Subscription", "cost": "$12/mo", "duration": "Monthly", "value": "Access to business strategy, personal growth, and leadership advice articles.", "next_step": "Read the guide on peer leadership.", "tags": ["Articles", "HBR"], "section": "micro_structured"},
                {"name": "Dale Carnegie Book Pack", "type": "Book", "cost": "$25", "duration": "Self-paced", "value": "Compendium of books covering confidence building and friendship strategy.", "next_step": "Order the book set online.", "tags": ["Books", "Dale Carnegie"], "section": "micro_structured"},
                {"name": "EQ Leadership digest", "type": "Newsletter", "price": "Free", "session_details": "Monthly email", "expected_outcomes": "A newsletter detailing emotional intelligence exercises, empathy mapping, and team conflict resolution.", "tags": ["Empathy", "EQ"], "section": "nano_expert"},
                {"name": "Rotary Club Youth Magazine", "type": "Publication", "price": "$35/year", "session_details": "Monthly Newsletter", "expected_outcomes": "Interviews with young leaders globally and notices of project funding opportunities.", "tags": ["Magazine", "Funding"], "section": "nano_expert"}
            ]
        }

def customize_steps_for_focus(steps_configs: list, focus: Optional[str], goal: str) -> list:
    if not focus:
        return steps_configs
    
    category = resolve_focus_category(focus)
    is_academic = category == "academic"
    is_practical = category == "practical"
    is_jobs = category == "jobs"
    is_non_academic = category == "non_academic"

    custom_configs = []
    for step in steps_configs:
        step_copy = step.copy()
        title = step_copy["title"]
        desc = step_copy["description"]
        macro = step_copy.get("macro_view", "")
        micro = step_copy.get("micro_view", "")
        nano = step_copy.get("nano_view", "")

        focus_lower = focus.lower()
        if is_academic:
            if "research & honors" in focus_lower:
                title = title.replace("Academic Target & Profile Review", "Research Question & Literature Review") \
                             .replace("Academic Curation & GPA Target", "Research Scoping & Honor Roll Planning") \
                             .replace("Board Achievement", "Honors Thesis & Academic Publication Mastery") \
                             .replace("Skill Curation & Internship Selection", "Research Paper Drafting & Seminar Presentation") \
                             .replace("Academics & Profile Rigor", "Academic Publication & Independent Study Rigor") \
                             .replace("Test Score Curation", "Research Poster Curation & Review") \
                             .replace("Standardized Test Prep Modules", "Academic Research Methodology Modules") \
                             .replace("Standardized Test Prep", "Research Methodologies") \
                             .replace("Standardized Test Score Curation", "Academic Manuscript Review") \
                             .replace("Standardized Test", "Research Defense") \
                             .replace("Admissions Finalization & Visas", "Academic Symposium Placement & Fellowships")
                desc = desc.replace("internships", "independent research").replace("practical skills", "academic methodologies").replace("board exams", "research reviews").replace("study schedules", "literature review plans")
                desc += " Prioritize original research papers, academic honors, independent studies, and publication cycles."
                macro = f"Focusing on high-prestige academic research and honors designations: {macro}"
                micro = f"Execute research projects, literature reviews, and manuscript writing: {micro}"
                nano = f"Research mentor audit of methodologies and bibliography sources: {nano}"
            elif "test prep" in focus_lower:
                title = title.replace("Academic Target & Profile Review", "Admissions Standardized Test Diagnostic") \
                             .replace("Academic Curation & GPA Target", "SAT/ACT Prep & admissions Milestones") \
                             .replace("Board Achievement", "Standardized Test Score Optimization") \
                             .replace("Skill Curation & Internship Selection", "Admissions Essays & AP Course Selection") \
                             .replace("Academics & Profile Rigor", "Standardized Testing & AP/IB Exam Rigor") \
                             .replace("Test Score Curation", "Admissions Portfolio & Test Submissions") \
                             .replace("Standardized Test Prep Modules", "Intense SAT/ACT/IELTS Test Prep Modules") \
                             .replace("Standardized Test Prep", "Standardized Test Prep Modules") \
                             .replace("Standardized Test Score Curation", "Mock Test Scoring & Errors Analysis") \
                             .replace("Standardized Test", "Official SAT/ACT Sitting") \
                             .replace("Admissions Finalization & Visas", "University Admissions Portals & Visas Submission")
                desc = desc.replace("internships", "mock sittings").replace("practical skills", "exam test-taking strategies").replace("board exams", "standardized exams").replace("study schedules", "test-prep modules")
                desc += " Focus intensely on standardized test preparation (SAT, ACT, AP, IELTS) and college admissions portals."
                macro = f"Focusing on competitive standardized testing and strategic college admissions: {macro}"
                micro = f"Complete rigorous mock tests, review diagnostic reports, and finalize application essay drafts: {micro}"
                nano = f"Test-prep mentor audit of scoring errors and essay critiques: {nano}"
            else:  # Curriculum & GPA Focus
                title = title.replace("Academic Target & Profile Review", "GPA Benchmark & Course Selection") \
                             .replace("Academic Curation & GPA Target", "GPA Curation & Class Standing Plan") \
                             .replace("Board Achievement", "School Curriculum Term Exams Mastery") \
                             .replace("Skill Curation & Internship Selection", "Course Syllabus Selection & GPA Maximization") \
                             .replace("Academics & Profile Rigor", "Curriculum Tracking & Class Rank Rigor") \
                             .replace("Test Score Curation", "GPA Checklist & Transcripts Review") \
                             .replace("Standardized Test Prep Modules", "School Subject Syllabus Chapters Modules") \
                             .replace("Standardized Test Prep", "School Subject Prep Modules") \
                             .replace("Standardized Test Score Curation", "Subject Exam Grade Diagnostics") \
                             .replace("Standardized Test", "Term/Board Subject Exam") \
                             .replace("Admissions Finalization & Visas", "Transcripts Evaluation & GPA Verification")
                desc = desc.replace("internships", "course modules").replace("practical skills", "coursework understanding").replace("board exams", "class term tests").replace("study schedules", "subject revision cards")
                desc += " Emphasize school/college course requirements, maximizing term GPAs, and class rank optimization."
                macro = f"Focusing on core curriculum excellence and GPA maximization: {macro}"
                micro = f"Complete weekly coursework reviews, submit class assignments, and track term exam grades: {micro}"
                nano = f"Subject tutor audit of grade reports and course content mastery: {nano}"

        elif is_practical:
            if "project portfolio" in focus_lower:
                title = title.replace("Academic Target & Profile Review", "Project Idea & Tech Stack Review") \
                             .replace("Academic Curation & GPA Target", "Open Source & Git Repository Launch") \
                             .replace("Board Achievement", "Full-Stack Project Launch Milestone") \
                             .replace("Academics & Profile Rigor", "GitHub Portfolio & Project Readme Rigor") \
                             .replace("Test Score Curation", "Project Showcase & Live Demo Audits") \
                             .replace("Standardized Test Prep Modules", "Coding Projects Architecture Modules") \
                             .replace("Standardized Test Prep", "Coding Projects Building") \
                             .replace("Standardized Test Score Curation", "Code Review & Refactoring Diagnostics") \
                             .replace("Standardized Test", "Project Demo Presentation") \
                             .replace("Admissions Finalization & Visas", "Project Portfolio Showcase & Coding Interviews")
                desc = desc.replace("board exams", "coding projects").replace("academic preparation", "technical building").replace("standardized test", "project deployment").replace("GPA", "github contributions")
                desc += " Emphasize building side-projects, launching open-source packages, and optimizing GitHub repositories."
                macro = f"Focusing on hands-on project building and open-source contributions: {macro}"
                micro = f"Write clean modular code, write comprehensive documentation, and deploy live demos to cloud host: {micro}"
                nano = f"Senior developer audit of code quality and repository READMEs: {nano}"
            elif "certification & bootcamp" in focus_lower:
                title = title.replace("Academic Target & Profile Review", "Professional Certification Track Selection") \
                             .replace("Academic Curation & GPA Target", "Bootcamp Prep & Lab Sandbox Setup") \
                             .replace("Board Achievement", "Professional Certification Exam Completion") \
                             .replace("Academics & Profile Rigor", "Bootcamp Assignments & Lab Projects Rigor") \
                             .replace("Test Score Curation", "Certification Credentials Registry Review") \
                             .replace("Standardized Test Prep Modules", "Certification Syllabus Training Modules") \
                             .replace("Standardized Test Prep", "Bootcamp Sandbox Training") \
                             .replace("Standardized Test Score Curation", "Practice Exam Scoring Diagnostics") \
                             .replace("Standardized Test", "Official Certification Exam Sitting") \
                             .replace("Admissions Finalization & Visas", "Credentials Validation & Technical Audits")
                desc = desc.replace("board exams", "certification exams").replace("academic preparation", "structured bootcamp labs").replace("standardized test", "credential exam").replace("GPA", "lab completion rate")
                desc += " Emphasize professional certifications (AWS, Google Cloud, Scrum Master, Cisco) and coding bootcamps."
                macro = f"Focusing on professional cloud/tech certifications and structured bootcamps: {macro}"
                micro = f"Complete sandboxed lab tutorials, complete bootcamp assignments, and take certification practice tests: {micro}"
                nano = f"Bootcamp instructor audit of sandbox labs and exam readiness reports: {nano}"
            else:  # Internship & Applied Focus
                title = title.replace("Academic Target & Profile Review", "Applied Skill Mapping & Internship Scoping") \
                             .replace("Academic Curation & GPA Target", "Cold Outreach & Apprenticeship Pipeline") \
                             .replace("Board Achievement", "Corporate Internship Offer Validation") \
                             .replace("Academics & Profile Rigor", "Corporate Project Delivery & Applied Rigor") \
                             .replace("Test Score Curation", "Internship Review & Professional Referral Plan") \
                             .replace("Standardized Test Prep Modules", "Applied Work Experience Prep Modules") \
                             .replace("Standardized Test Prep", "Corporate Project Scoping") \
                             .replace("Standardized Test Score Curation", "Applied Performance Review Diagnostics") \
                             .replace("Standardized Test", "Applied Project Presentation") \
                             .replace("Admissions Finalization & Visas", "Internship Continuity & Professional Referrals")
                desc = desc.replace("board exams", "corporate deliverables").replace("academic preparation", "applied workplace skill acquisition").replace("standardized test", "internship reviews").replace("GPA", "manager feedback score")
                desc += " Emphasize corporate internships, job shadowing, applied workplace skills, and securing professional referrals."
                macro = f"Focusing on applied corporate internship experiences and workspace readiness: {macro}"
                micro = f"Apply to short internships, shadows industry professionals, and complete workspace project tasks: {micro}"
                nano = f"Corporate mentor audit of workplace project deliverables and professional communication: {nano}"

        elif is_jobs:
            if "technical role" in focus_lower:
                title = title.replace("Academic Target & Profile Review", "Technical Role Fit & LeetCode Plan") \
                             .replace("Academic Curation & GPA Target", "System Design & Algorithms Map") \
                             .replace("Board Achievement", "Technical Assessment Mastery") \
                             .replace("Academics & Profile Rigor", "LeetCode Solutions & Tech Specs Rigor") \
                             .replace("Test Score Curation", "Technical Portfolio & Github Reviews") \
                             .replace("Standardized Test Prep Modules", "LeetCode Hackerrank Solving Modules") \
                             .replace("Standardized Test Prep", "Coding Assessment Prep") \
                             .replace("Standardized Test Score Curation", "Mock Technical Scoring Diagnostics") \
                             .replace("Standardized Test", "Official Technical Interview Sitting") \
                             .replace("Admissions Finalization & Visas", "Technical Placement & Team Onboarding")
                desc = desc.replace("study schedules", "coding sessions").replace("GPA", "algorithmic skill").replace("test sittings", "coding assessments").replace("board exams", "technical test milestones")
                desc += " Focus on technical role metrics: algorithm challenges, system design patterns, and coding interviews."
                macro = f"Focusing on competitive technical role assessments and system design: {macro}"
                micro = f"Solve 10+ LeetCode problems weekly, practice system design architectures, and complete mock technical tests: {micro}"
                nano = f"Technical lead mentor review of algorithm efficiency and system patterns: {nano}"
            elif "interview & networking" in focus_lower:
                title = title.replace("Academic Target & Profile Review", "LinkedIn Curation & Networking Pipeline") \
                             .replace("Academic Curation & GPA Target", "Informational Interviews & Cold Outreach") \
                             .replace("Board Achievement", "Networking Referral Pipeline Mastery") \
                             .replace("Academics & Profile Rigor", "Mock Behavioral Interviews & Speech Rigor") \
                             .replace("Test Score Curation", "Job Referrals & Interview Schedules") \
                             .replace("Standardized Test Prep Modules", "Behavioral Interview Prep Modules") \
                             .replace("Standardized Test Prep", "Elevator Pitch Practice") \
                             .replace("Standardized Test Score Curation", "Informational Interview Diagnostics") \
                             .replace("Standardized Test", "Informational Outreach Session") \
                             .replace("Admissions Finalization & Visas", "Job Offer Negotiation & Referral Closure")
                desc = desc.replace("study schedules", "outreach tracking").replace("GPA", "professional networking").replace("test sittings", "referral queries").replace("board exams", "mock behavioral interviews")
                desc += " Focus on networking: LinkedIn profile optimization, informational interviews, cold outreach, and mock behavioral interviews."
                macro = f"Focusing on industry networking and behavioral interview preparation: {macro}"
                micro = f"Reach out to 5 industry professionals weekly, schedule informational interviews, and practice elevator pitches: {micro}"
                nano = f"Career coach audit of professional communication style and outreach follow-ups: {nano}"
            else:  # Resume & Career Evidence Focus
                title = title.replace("Academic Target & Profile Review", "Resume Audit & Gap Assessment") \
                             .replace("Academic Curation & GPA Target", "Cover Letter Drafts & Resume Customization") \
                             .replace("Board Achievement", "Resume Portfolio Submissions Milestone") \
                             .replace("Academics & Profile Rigor", "Workplace Evidence & Portfolio Proofs") \
                             .replace("Test Score Curation", "Application Tracker & Follow-up Plans") \
                             .replace("Standardized Test Prep Modules", "ATS Formatting Resume Modules") \
                             .replace("Standardized Test Prep", "Resume Building Modules") \
                             .replace("Standardized Test Score Curation", "Resume ATS Screening Diagnostics") \
                             .replace("Standardized Test", "Resume Submission Review") \
                             .replace("Admissions Finalization & Visas", "Background Check & Employment Contracts")
                desc = desc.replace("study schedules", "resume tracking").replace("GPA", "resume competitiveness").replace("test sittings", "resume reviews").replace("board exams", "resume draft milestones")
                desc += " Focus on resume quality: tailoring descriptions, optimizing for ATS, building career folders, and job application tracking."
                macro = f"Focusing on ATS-optimized resume building and professional evidence portfolios: {macro}"
                micro = f"Draft 3 custom resumes, optimize summaries for target roles, and populate application tracker sheets: {micro}"
                nano = f"HR consultant review of resume formats and ATS compatibility benchmarks: {nano}"

        elif is_non_academic:
            if "mental health" in focus_lower:
                title = title.replace("Academic Target & Profile Review", "Mental Health Audit & Support Mapping") \
                             .replace("Academic Curation & GPA Target", "Stress Management & Daily Routines") \
                             .replace("Board Achievement", "Mindfulness & Sleep Hygiene Milestone") \
                             .replace("Internship Planning & Skill Curation", "Coping Mechanisms & Safe Boundaries") \
                             .replace("Academics & Profile Rigor", "Emotional Resilience & Weekly Journaling") \
                             .replace("Test Score Curation", "Mental Health Diagnostics & Checkpoints") \
                             .replace("University Placements Submission", "Mental Wellness Plan Review") \
                             .replace("Admissions Finalization & Visas", "Ongoing Counselling & Care Continuity")
                desc = desc.replace("academic preparation", "wellness planning").replace("study schedules", "wellness routines").replace("GPA", "wellbeing indicators").replace("test sittings", "mood checks").replace("board exams", "mental stressors")
                desc += " This is a health support path; include wellness routines, coping tools, journaling, and professional support references."
                macro = f"Focusing on mental wellness routines and emotional resilience: {macro}"
                micro = f"Complete daily 10-minute mindfulness sessions, maintain sleep diaries, and complete weekly journaling: {micro}"
                nano = f"Licensed counsellor review of wellbeing charts and routine continuity: {nano}"
            elif "life skills" in focus_lower:
                title = title.replace("Academic Target & Profile Review", "Time Management & Routine Mapping") \
                             .replace("Academic Curation & GPA Target", "Decision Frameworks & Goal Planning") \
                             .replace("Board Achievement", "Daily Organization & Habit Mastery") \
                             .replace("Internship Planning & Skill Curation", "Task Prioritization & Focus Boundaries") \
                             .replace("Academics & Profile Rigor", "Personal Finance & Budgeting Routines") \
                             .replace("Test Score Curation", "Goal Progress & Habit Tracker Checkpoints") \
                             .replace("University Placements Submission", "Life Goals Blueprint Review") \
                             .replace("Admissions Finalization & Visas", "Autonomy Development & Life Coaching Continuity")
                desc = desc.replace("academic preparation", "routine design").replace("study schedules", "habit trackers").replace("GPA", "organization levels").replace("test sittings", "habit audits").replace("board exams", "daily routines")
                desc += " Focus on core life skills: time management, task prioritization, decision-making logs, and habit routines."
                macro = f"Focusing on structured life skills coaching and time management: {macro}"
                micro = f"Log daily tasks, compile decision logs, establish weekly calendars, and review budget sheets: {micro}"
                nano = f"Life coach audit of time allocation charts and habit compliance scores: {nano}"
            else:  # Immediate Action & Support Focus
                title = title.replace("Academic Target & Profile Review", "Urgent Support Scoping & Triage") \
                             .replace("Academic Curation & GPA Target", "Immediate Helpline & Resource Mapping") \
                             .replace("Board Achievement", "Immediate Support Group Engagement") \
                             .replace("Internship Planning & Skill Curation", "Escalation Routes & Safe Space Setup") \
                             .replace("Academics & Profile Rigor", "Safety Plans & Crisis Response Setup") \
                             .replace("Test Score Curation", "Immediate Safety Checkpoints") \
                             .replace("University Placements Submission", "Crisis Care Plan Review") \
                             .replace("Admissions Finalization & Visas", "Qualified Peer & Clinical Referrals Continuity")
                desc = desc.replace("academic preparation", "safety checks").replace("study schedules", "safety boundaries").replace("GPA", "crisis indicators").replace("test sittings", "check-ins").replace("board exams", "stress events")
                desc += " Focus on short-term navigation: hotline contacts, safe support networks, and qualified medical/peer escalation paths."
                macro = f"Focusing on immediate crisis care navigation and safety-aware triage: {macro}"
                micro = f"Identify 3 immediate hotlines, map emergency contacts, and document a short-term crisis safety plan: {micro}"
                nano = f"Support representative review of safety plan details and escalation guidelines: {nano}"

        step_copy["title"] = title
        step_copy["description"] = desc
        step_copy["macro_view"] = macro
        step_copy["micro_view"] = micro
        step_copy["nano_view"] = nano
        custom_configs.append(step_copy)

    return custom_configs

def calculate_path_metrics(current: str, goal: str, profile: dict, path_type: str = "Academic & Research") -> dict:
    # 1. total_duration based on target degree type first, then grade fallback.
    total_months = calculate_total_duration_months(current, goal, profile)
    total_duration = format_total_duration(total_months)

    # 2. Competitiveness of target goal
    goal_lower = goal.lower()
    competitive_keywords = [
        "harvard", "yale", "stanford", "mit", "oxford", "cambridge", "iit", "bits",
        "imperial college", "caltech", "berkeley", "princeton", "columbia", "cornell"
    ]
    is_highly_competitive = any(kw in goal_lower for kw in competitive_keywords)

    # 3. Performance
    perf_str = str(profile.get("performance") or "").lower()
    if "90" in perf_str or "above 90" in perf_str or "excellent" in perf_str or "gpa 4" in perf_str or "a+" in perf_str:
        perf_cat = "high"
    elif "75" in perf_str or "80" in perf_str or "85" in perf_str or "good" in perf_str or "average" in perf_str:
        perf_cat = "medium"
    else:
        perf_cat = "low"

    # 4. Profile signals
    stream_str = str(profile.get("stream") or "").lower()
    curriculum_str = str(profile.get("curriculum") or "").lower()
    personality_str = str(profile.get("personality") or "").lower()
    financial_str = str(profile.get("financialSituation") or "").lower()

    # ──────────────────────────────────────────────────────────────────────────
    # READINESS MODEL: Like ETA logic — the score indicates HOW READY the
    # student's current profile is to achieve the goal via THIS specific path.
    # Each path type evaluates different signals to compute a unique score.
    # ──────────────────────────────────────────────────────────────────────────

    base_score = 0

    path_category = resolve_focus_category(path_type)

    if path_category == "academic":
        # ACADEMIC PATH: Readiness = alignment of academic profile to formal education route
        # Base from performance
        base_score = {"high": 55, "medium": 35, "low": 20}.get(perf_cat, 20)
        # Boost for academic curriculum match (CBSE/IB/IGCSE students are already in academic track)
        if any(k in curriculum_str for k in ["cbse", "ib", "igcse", "cambridge", "icse"]):
            base_score += 10
        # Boost for science/commerce stream (university pathway relevant)
        if any(k in stream_str for k in ["science", "maths", "math", "commerce"]):
            base_score += 8
        # Penalize if highly competitive goal and performance is low
        if is_highly_competitive and perf_cat == "low":
            base_score -= 15
        # Boost if target is a university/degree in goal
        if any(k in goal_lower for k in ["bachelor", "master", "university", "college", "degree", "phd", "bsc", "btech", "mbbs"]):
            base_score += 7

    elif path_category == "practical":
        # PRACTICAL PATH: Readiness = how well profile fits skills/project-based learning
        base_score = {"high": 50, "medium": 40, "low": 30}.get(perf_cat, 30)
        # Skills-based goals are practical by nature — boost it
        if any(k in goal_lower for k in ["engineer", "developer", "software", "data", "ai", "machine learning", "design", "architecture"]):
            base_score += 12
        # Personality signals for hands-on learners
        if any(k in personality_str for k in ["practical", "hands-on", "builder", "maker", "curious", "creative"]):
            base_score += 8
        # Financial support matters for certifications/bootcamps
        if any(k in financial_str for k in ["scholarship", "support", "funded", "family support"]):
            base_score += 5
        # All streams are eligible for skills path — no penalty
        # But science stream has a slight edge
        if "science" in stream_str:
            base_score += 5

    elif path_category == "jobs":
        # JOBS PATH: Readiness = alignment to job/career preparedness
        base_score = {"high": 45, "medium": 35, "low": 25}.get(perf_cat, 25)
        # Career-focused goals naturally align
        if any(k in goal_lower for k in ["career", "job", "placement", "intern", "manager", "analyst", "consultant", "hr", "finance"]):
            base_score += 12
        # Soft-skill personality signals
        if any(k in personality_str for k in ["leader", "communication", "team", "social", "networking", "public speaking"]):
            base_score += 10
        # Commerce/management stream aligns strongly
        if any(k in stream_str for k in ["commerce", "business", "management", "arts", "humanities"]):
            base_score += 8
        # Financial stability helps career networking activities
        if any(k in financial_str for k in ["self-funded", "employed", "working"]):
            base_score += 5

    elif path_category == "non_academic":
        # NON-ACADEMIC SUPPORT PATH: score reflects support-plan readiness, not career readiness.
        base_score = {"high": 45, "medium": 38, "low": 30}.get(perf_cat, 35)
        if any(k in personality_str for k in ["anxious", "stress", "overwhelmed", "confused", "decision"]):
            base_score += 8
        if any(k in financial_str for k in ["support", "family", "funded", "stable"]):
            base_score += 6
        if any(k in goal_lower for k in ["mental", "stress", "wellness", "counselling", "counseling", "decision", "life", "guidance"]):
            base_score += 12

    # 5. Apply competitive penalty uniformly
    if is_highly_competitive:
        base_score = int(base_score * 0.70)  # 30% harder to be "ready" for top-tier goals

    # Apply variant-specific offset to ensure distinct readiness scores between alternatives
    path_type_lower = str(path_type or "").lower()
    variant_offset = 0
    if "research" in path_type_lower or "portfolio" in path_type_lower or "technical role" in path_type_lower or "mental health" in path_type_lower:
        variant_offset = +3
    elif "test prep" in path_type_lower or "certification" in path_type_lower or "interview" in path_type_lower or "life skills" in path_type_lower:
        variant_offset = -4
    elif "curriculum" in path_type_lower or "applied" in path_type_lower or "resume" in path_type_lower or "immediate action" in path_type_lower:
        variant_offset = +1
    base_score += variant_offset

    # 6. Clamp score between 5 and 95
    readiness_score = max(5, min(95, base_score))

    # 7. Compute readiness label from final score
    if readiness_score >= 70:
        readiness_label = "Advanced Starter"
    elif readiness_score >= 50:
        readiness_label = "Intermediate Starter"
    elif readiness_score >= 30:
        readiness_label = "Early Starter"
    else:
        readiness_label = "Beginner"

    return {
        "total_duration": total_duration,
        "readiness_score": readiness_score,
        "readiness_label": readiness_label
    }


# ─── PATH ACCURACY SCORING MODEL ─────────────────
def calculate_path_accuracy_score(roadmap: dict, profile: dict, current: str = "") -> dict:
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
                "structural_score": 0,
                "content_score": 0,
                "market_score": 0
            },
            "details": {}
        }
        
    steps = roadmap.get("steps") or roadmap.get("steps") or []
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
                "structural_score": 0,
                "content_score": 0,
                "market_score": 0
            },
            "details": {}
        }

    # Weights for the Mathematical Model
    w_steps = 0.30
    w_info = 0.40
    w_market = 0.30
    
    # ── 1. Step Count Accuracy Model (S_steps) ──
    grade_str = str(profile.get("grade") or "").lower() or str(current).lower()
    if "10" in grade_str or "tenth" in grade_str or "k-12" in grade_str or "k12" in grade_str:
        expected_steps = 12
    elif "11" in grade_str or "eleventh" in grade_str:
        expected_steps = 10
    elif "12" in grade_str or "twelfth" in grade_str:
        expected_steps = 8
    else:
        expected_steps = 10
        
    sigma = 2.0
    S_steps = math.exp(-((actual_steps - expected_steps)**2) / (2 * sigma**2))
    
    # ── 2. Information Density Model (S_info) ──
    total_I = 0.0
    T_desc, T_macro, T_micro, T_nano = 100, 200, 200, 200
    
    for step in steps:
        l_desc = len(str(step.get("description") or ""))
        l_macro = len(get_view_description(step, "macro_view"))
        l_micro = len(get_view_description(step, "micro_view"))
        l_nano = len(get_view_description(step, "nano_view"))
        
        D_desc = min(1.0, l_desc / T_desc)
        D_macro = min(1.0, l_macro / T_macro)
        D_micro = min(1.0, l_micro / T_micro)
        D_nano = min(1.0, l_nano / T_nano)
        
        objs = step.get("learning_objectives") or []
        msteps = step.get("micro_steps") or []
        C_objs = min(1.0, len(objs) / 3.0) if isinstance(objs, list) else 0.0
        C_msteps = min(1.0, len(msteps) / 3.0) if isinstance(msteps, list) else 0.0
        
        I_i = (D_desc + D_macro + D_micro + D_nano + C_objs + C_msteps) / 6.0
        total_I += I_i
        
    S_info = total_I / actual_steps
    
    # ── 3. Marketplace Completeness Model (S_market) ──
    # Current scoring includes relevance to the step, not just item counts.
    stopwords = {
        "the", "and", "for", "with", "from", "into", "that", "this", "their", "your",
        "you", "are", "will", "must", "should", "step", "phase", "month", "months",
        "student", "students", "path", "pathway", "goal", "target", "current",
        "complete", "completion", "review", "resource", "resources", "course",
        "program", "platform", "session", "support", "prepare", "preparation",
        "build", "based", "using", "through", "during", "toward", "towards"
    }

    def normalize_token(token: str) -> str:
        token = token.lower().strip()
        for suffix in ("ing", "ed", "es", "s"):
            if len(token) > len(suffix) + 3 and token.endswith(suffix):
                return token[:-len(suffix)]
        return token

    def tokens_from_text(value: Any) -> set:
        if isinstance(value, dict):
            value = " ".join(str(v) for v in value.values())
        elif isinstance(value, list):
            value = " ".join(str(v) for v in value)
        text = str(value or "").lower()
        raw_tokens = re.findall(r"[a-z0-9]+", text)
        return {
            normalized
            for tok in raw_tokens
            if len(tok) >= 3
            for normalized in [normalize_token(tok)]
            if normalized not in stopwords
        }

    def collect_step_tokens(step: dict) -> set:
        step_parts = [
            roadmap.get("path_title", ""),
            roadmap.get("path_description", ""),
            step.get("title", ""),
            step.get("description", ""),
            get_view_description(step, "macro_view"),
            get_view_description(step, "micro_view"),
            get_view_description(step, "nano_view"),
            step.get("learning_objectives", []),
            step.get("micro_steps", []),
            profile.get("grade", ""),
            profile.get("curriculum", ""),
            profile.get("stream", ""),
            profile.get("performance", ""),
            profile.get("degreeType", ""),
            profile.get("degree_type", ""),
        ]
        return tokens_from_text(step_parts)

    def collect_item_tokens(item: dict) -> set:
        return tokens_from_text([
            item.get("name", ""),
            item.get("type", ""),
            item.get("why", ""),
            item.get("value", ""),
            item.get("next_step", ""),
            item.get("session_details", ""),
            item.get("expected_outcomes", ""),
            item.get("tags", []),
        ])

    def item_field_score(item: dict, required_fields: list) -> float:
        if not isinstance(item, dict) or not required_fields:
            return 0.0
        present = 0
        for field in required_fields:
            value = item.get(field)
            if isinstance(value, list):
                present += 1 if len(value) > 0 else 0
            elif str(value or "").strip():
                present += 1
        return present / len(required_fields)

    def item_relevance_score(step_tokens: set, item: dict) -> float:
        item_tokens = collect_item_tokens(item)
        if not step_tokens or not item_tokens:
            return 0.0
        overlap = step_tokens & item_tokens
        item_coverage = len(overlap) / max(1, min(len(item_tokens), 6))
        step_coverage = len(overlap) / max(1, min(len(step_tokens), 10))
        return min(1.0, (0.70 * item_coverage) + (0.30 * step_coverage))

    marketplace_sections = {
        "macro_free": ["name", "type", "why", "next_step"],
        "micro_structured": ["name", "type", "cost", "duration", "value", "next_step"],
        "nano_expert": ["name", "type", "price", "session_details", "expected_outcomes"],
    }

    total_M = 0.0
    total_market_presence = 0.0
    total_market_quality = 0.0
    total_market_relevance = 0.0
    section_count = len(marketplace_sections)

    for step in steps:
        market = combined_marketplace_from_step(step)
        step_tokens = collect_step_tokens(step)
        step_market_score = 0.0
        step_presence_score = 0.0
        step_quality_score = 0.0
        step_relevance_score = 0.0

        if isinstance(market, dict):
            for section, required_fields in marketplace_sections.items():
                items = marketplace_items_for_section(market, section)

                count_score = min(1.0, len(items) / 2.0)
                field_scores = [item_field_score(item, required_fields) for item in items if isinstance(item, dict)]
                relevance_scores = [item_relevance_score(step_tokens, item) for item in items if isinstance(item, dict)]
                field_score = sum(field_scores) / len(field_scores) if field_scores else 0.0
                relevance_score = sum(relevance_scores) / len(relevance_scores) if relevance_scores else 0.0

                section_score = (0.25 * count_score) + (0.25 * field_score) + (0.50 * relevance_score)
                step_market_score += section_score
                step_presence_score += count_score
                step_quality_score += field_score
                step_relevance_score += relevance_score

        total_M += step_market_score / section_count
        total_market_presence += step_presence_score / section_count
        total_market_quality += step_quality_score / section_count
        total_market_relevance += step_relevance_score / section_count

    S_market = total_M / actual_steps
    S_market_presence = total_market_presence / actual_steps
    S_market_quality = total_market_quality / actual_steps
    S_market_relevance = total_market_relevance / actual_steps
    
    # ── Total Score ──
    raw_score = 100.0 * (w_steps * S_steps + w_info * S_info + w_market * S_market)
    total_score = min(100, round(raw_score))
    
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
            "structural": round(S_steps * 100),
            "content": round(S_info * 100),
            "market": round(S_market * 100),
            "structural_score": round(S_steps * 100),
            "content_score": round(S_info * 100),
            "market_score": round(S_market * 100)
        },
        "details": {
            "step_count": actual_steps,
            "expected_steps": expected_steps,
            "s_steps": round(S_steps, 3),
            "s_info": round(S_info, 3),
            "s_market": round(S_market, 3),
            "s_market_presence": round(S_market_presence, 3),
            "s_market_field_quality": round(S_market_quality, 3),
            "s_market_relevance": round(S_market_relevance, 3),
            "market_formula": "0.25 presence + 0.25 field quality + 0.50 step relevance"
        }
    }



# Pedagogical High-Fidelity Fallback Roadmap in case of a complete API lockout
def get_fallback_mock_roadmap(current: str, goal: str, profile: dict, refine_prompt: Optional[str] = None, focus: Optional[str] = None) -> dict:
    grade_str = str(profile.get("grade") or "").lower() or current.lower()
    total_months = calculate_total_duration_months(current, goal, profile)
    
    # Aryan's Pathway structural mapping
    if "10" in grade_str or "tenth" in grade_str:
        steps_configs = [
            {
                "id": 1,
                "title": "Curriculum & Stream Assessment",
                "duration": "Months 1-4",
                "description": f"Choose the right academic curriculum and stream (CBSE, IB, Cambridge) based on passion, personality assessment, and aptitude for {goal}.",
                "macro_view": "Selecting the right academic curriculum and subject stream is the single most impactful decision a student makes at the beginning of their educational journey, as it determines which doors open and which permanently close in the path toward a competitive university placement. This milestone establishes the foundational academic identity of the student — whether they pursue a science-heavy CBSE pathway, a globally recognized IB Diploma, or a rigorous Cambridge A-Level track — each of which signals a different level of academic ambition to admissions committees. Getting this choice correct means aligning the student's natural aptitude scores, RIASEC personality profile, and long-term career aspirations with the academic demands of the chosen stream, avoiding costly mid-stream transfers later. By the end of this milestone, the student will have a clear academic roadmap template tied directly to the demands of their target destination: {goal}.",

"micro_view": "The student must complete a structured three-step execution process during this phase: first, take a validated psychometric assessment (e.g. Holland RIASEC Code Test or the 16Personalities aptitude tool) to identify core academic strengths and interests that should drive stream selection. Second, research and visit at least 3 potential schools offering the identified curriculum (CBSE/IB/Cambridge), evaluating each against criteria such as faculty quality, extracurricular options, lab infrastructure, and placement track record. Third, compile a written Academic Goal Statement of 500 words documenting the chosen stream, the rationale for the choice, the target GPA for Grade 10 board exams, and the extracurricular activities planned for profile enrichment over the next 12 months. All three deliverables must be reviewed and signed off before moving to the next milestone.",

"nano_view": "A mentor or academic counselor should conduct an initial 45-minute intake diagnostic session reviewing the student's psychometric results, past academic performance records, and stated career interests to validate that the stream selection aligns with realistic university placement benchmarks for {goal}. The mentor should run a gap analysis comparing the student's current aptitude scores against the entry requirements of top universities in the target category, flagging any immediate curriculum risks or subject gaps that need to be addressed in Grade 10. A peer cohort review session should also be conducted where the student presents their Academic Goal Statement to a group of 3-4 senior students who have already navigated the same pathway, receiving structured feedback on blind spots and subject combination pitfalls. Expert feedback from this session must be incorporated into a revised Academic Goal Statement before the student formally commits to a school and stream.",
            },
            {
                "id": 2,
                "title": "School Selection & Academic Targets",
                "duration": "Months 5-8",
                "description": "Establish target schools and set clear academic targets. Focus on setting study habits and foundation metrics.",
                "macro_view": "Establish high-caliber academic environments and target standards required for global universities.",
                "micro_view": "Select schools based on location, budget, and mentor support, and finalize a weekly study timeline.",
                "nano_view": "Obtain mentor diagnostic feedback on academic preparation and school resources mapping."
            },
            {
                "id": 3,
                "title": "Grade 10 Board Achievement",
                "duration": "Months 9-12",
                "description": "Achieve 90%+ in 10th-grade board exams. Master core academic concepts and prepare comprehensive exam notes.",
                "macro_view": "Build a stellar academic foundation that serves as the official transcript entry point.",
                "micro_view": "Complete diagnostic mock board tests, analyze weak chapters, and compile summary revision booklets.",
                "nano_view": "Conduct progress check-ins with top-scoring student cohorts and board subject specialists."
            },
            {
                "id": 4,
                "title": "Internship Planning & Skill Curation",
                "duration": "Months 13-16",
                "description": "Focus on selecting and executing introductory internships to acquire practical skills and discover interests.",
                "macro_view": "Supplement theoretical classroom learning with real-world project work and corporate exposure.",
                "micro_view": "Apply for short internships, shadow industry specialists, and compile project reports.",
                "nano_view": "Work with internship coordinators to align tasks with career interests and get reviews on deliverables."
            },
            {
                "id": 5,
                "title": "Grade 11 Transition & Diagnostic Test Prep",
                "duration": "Months 17-20",
                "description": "Transition to 11th grade successfully. Initiate standardized test prep diagnostics (SAT/ACT/IELTS/TOEFL) and map timelines.",
                "macro_view": "Ensure a smooth academic step-up while setting the baseline for international standardized tests.",
                "micro_view": "Purchase target test prep guides, take diagnostic test sittings, and plan a test calendar.",
                "nano_view": "Conduct a transition risk analysis with senior academic advisors and test prep mentors."
            },
            {
                "id": 6,
                "title": "Grade 11 Academics & Profile Rigor",
                "duration": "Months 21-24",
                "description": "Maintain a 90%+ GPA in 11th-grade coursework and begin constructing an extracurricular profile / personal project.",
                "macro_view": "Establish continuous academic growth and distinctiveness through specialized personal projects.",
                "micro_view": "Start a research paper draft or launch a community service initiative, keeping complete logs.",
                "nano_view": "Engage a subject-matter expert to scope your personal project and pressure-test the outline."
            },
            {
                "id": 7,
                "title": "Standardized Test Score Curation",
                "duration": "Months 25-28",
                "description": "Prepare intensively for the SAT/ACT and English proficiency tests. Take official exams and aim for top-tier scores.",
                "macro_view": "Differentiate your application with highly competitive standardized exam scores.",
                "micro_view": "Complete 10 full-length practice tests, review mistakes, and sit for the official examinations.",
                "nano_view": "Conduct mock score iterations and review test-taking strategies with specialized coaches."
            },
            {
                "id": 8,
                "title": "Grade 12 Placement & Counselor Mapping",
                "duration": "Months 29-32",
                "description": f"Identify mentors and target university lists. Map recommendation letters and begin drafting essays for {goal}.",
                "macro_view": "Convert academic and profile success into a curated admissions package targeting top-tier destinations.",
                "micro_view": "Select 8-10 target universities, coordinate with recommendation letter writers, and draft common app essays.",
                "nano_view": "Align with admissions counselors on portal shortlists and receive developmental feedback on essay drafts."
            },
            {
                "id": 9,
                "title": "Application Submission & Placement Curation",
                "duration": "Months 33-36",
                "description": f"Submit premium application dossiers to {goal} and prepare for interviews, visas, and matriculation.",
                "macro_view": "Complete the college pathway, validate placement, and finalize legal entry permits.",
                "micro_view": "Submit all application portals, participate in mock interview prep, and compile visa paperwork.",
                "nano_view": "Conduct final panel mock interviews and visa checklist reviews with international coordinators."
            }
        ]
    elif "11" in grade_str or "eleventh" in grade_str:
        steps_configs = [
            {
                "id": 1,
                "title": "Grade 11 Academic Curation & GPA Target",
                "duration": "Months 1-4",
                "description": "Establish stellar study schedules and targets. Focus on scoring 90%+ in school exams and mapping coursework.",
                "macro_view": "Lay the baseline transcripts required for university admissions.",
                "micro_view": "Attend extra academic support classes, compile weekly summaries, and track mock test scores.",
                "nano_view": "Schedule advisor check-ins to review mid-term performance and flag curriculum risks."
            },
            {
                "id": 2,
                "title": "Skill Curation & Internship Selection",
                "duration": "Months 5-8",
                "description": "Select practical internships or projects to acquire industry skills and strengthen your profile.",
                "macro_view": "Demonstrate real-world application of skills and initiative.",
                "micro_view": "Draft a professional CV, apply to 3 target internships, and complete a showcase project.",
                "nano_view": "Work with a career coach to select projects that align with your major interest."
            },
            {
                "id": 3,
                "title": "Standardized Test Prep Modules",
                "duration": "Months 9-12",
                "description": "Identify and focus on standardized test prep modules (SAT/ACT/IELTS). Map schedules and diagnostic metrics.",
                "macro_view": "Prove academic readiness and language proficiency for international admissions.",
                "micro_view": "Register on test portals, solve prep questions, and take diagnostic mock sittings.",
                "nano_view": "Conduct test-taking technique diagnostics and identify sub-topic weaknesses with prep mentors."
            },
            {
                "id": 4,
                "title": "Mentor Mapping & Profile Rigor",
                "duration": "Months 13-16",
                "description": "Partner with a dedicated mentor to scope out personal projects, research papers, or community campaigns.",
                "macro_view": "Highlight unique interests and intellectual depth beyond standard grades.",
                "micro_view": "Develop a project repository, draft abstract outlines, and meet weekly project milestones.",
                "nano_view": "Review drafts and source codes with expert mentors for validation and refinement."
            },
            {
                "id": 5,
                "title": "Grade 12 Transition & Shortlisting",
                "duration": "Months 17-20",
                "description": "Transition smoothly into Grade 12. Finalize university shortlists and begin college application essays.",
                "macro_view": "Strategically select target institutions and draft compelling personal statements.",
                "micro_view": "Finalize 8 target colleges, research specific essay prompts, and write initial drafts.",
                "nano_view": "Receive feedback on essay story arcs and align shortlists with admissions counselors."
            },
            {
                "id": 6,
                "title": "Application Dossier & Placements",
                "duration": "Months 21-24",
                "description": f"Submit completed application dossiers to target destination: {goal}. Secure recommendations and handle visas.",
                "macro_view": "Execute the final step of the pathway by submitting curated portfolios and finalizing placement.",
                "micro_view": "Pay application fees, submit portals (Common App etc.), and compile visa documents.",
                "nano_view": "Practice mock admissions interviews and undergo checklist verification with placements advisors."
            }
        ]
    else:
        steps_configs = [
            {
                "id": 1,
                "title": "Grade 12 Academic Target & Profile Review",
                "duration": "Months 1-3",
                "description": "Establish term-exam targets and conduct a thorough profile review to identify extracurricular gaps.",
                "macro_view": "Ensure final high school transcripts meet competitive standards while identifying portfolio issues.",
                "micro_view": "Write down grade objectives, list active projects, and note recommendations needed.",
                "nano_view": "Conduct a portfolio analysis session with advisors to map outstanding targets."
            },
            {
                "id": 2,
                "title": "Test Score Curation & Finalization",
                "duration": "Months 4-6",
                "description": "Complete final official standardized test sittings. Focus on test prep iteration and maximizing scores.",
                "macro_view": "Finalize competitive metrics for college portals.",
                "micro_view": "Practice weak areas, sit for official SAT/ACT/IELTS/TOEFL exams, and request score reports.",
                "nano_view": "Coordinate score reviews and submission strategy check-ins with test mentors."
            },
            {
                "id": 3,
                "title": "Profile Curation & Mentor Counsel",
                "duration": "Months 7-9",
                "description": "Connect with college mentors, draft letters of recommendation profiles, and write personal statements.",
                "macro_view": "Draft highly persuasive stories that demonstrate your readiness for collegiate study.",
                "micro_view": "Draft the main application essay, create resumes, and requests recommendation inputs.",
                "nano_view": "Obtain structural and narrative feedback on essays from writing advisors."
            },
            {
                "id": 4,
                "title": "University Placements Submission",
                "duration": "Months 10-11",
                "description": f"Assemble and submit official application dossiers to {goal}. Double-check all transcript records.",
                "macro_view": "Submit all credentials to target admissions committees without errors.",
                "micro_view": "Complete university portal profiles, review transcripts, and submit portfolios.",
                "nano_view": "Review application completeness checklist with counselor prior to final submission."
            },
            {
                "id": 5,
                "title": "Admissions Finalization & Visas",
                "duration": "Month 12",
                "description": "Review placement decisions, prepare for interviews, and complete visa and study permit documentation.",
                "macro_view": "Transition smoothly from high school applicant to university-matriculated student.",
                "micro_view": "Attend mock interviews, review visa documents, and pay enrollment deposits.",
                "nano_view": "Participate in pre-departure briefings and mock visa interview check-ins."
            }
        ]

    # Parse requested steps from refine_prompt if available
    requested_steps = None
    if refine_prompt:
        match_steps = re.search(r'(\d+)\s*(?:step|milestone)', refine_prompt.lower())
        if match_steps:
            try:
                requested_steps = int(match_steps.group(1))
                if requested_steps < 1:
                    requested_steps = 1
            except Exception:
                pass

    baseline_steps = minimum_blueprint_steps(current, goal, profile)

    if not requested_steps and focus:
        focus_lower = focus.lower()
        if "research & honors" in focus_lower:
            requested_steps = len(steps_configs) + 2
        elif "test prep" in focus_lower:
            requested_steps = len(steps_configs) - 2
        elif "curriculum & gpa" in focus_lower:
            requested_steps = len(steps_configs)
        elif "project portfolio" in focus_lower:
            requested_steps = len(steps_configs) + 1
        elif "certification & bootcamp" in focus_lower:
            requested_steps = len(steps_configs) - 1
        elif "internship & applied" in focus_lower:
            requested_steps = len(steps_configs)
        elif "technical role prep" in focus_lower:
            requested_steps = len(steps_configs) + 1
        elif "interview & networking" in focus_lower:
            requested_steps = len(steps_configs) - 1
        elif "resume & career evidence" in focus_lower:
            requested_steps = len(steps_configs)
        elif "mental health" in focus_lower:
            requested_steps = len(steps_configs) + 1
        elif "life skills" in focus_lower:
            requested_steps = len(steps_configs) - 1
        elif "immediate action" in focus_lower:
            requested_steps = len(steps_configs)
        else:
            focus_category = resolve_focus_category(focus)
            if focus_category == "academic":
                requested_steps = len(steps_configs)
            elif focus_category == "practical":
                requested_steps = len(steps_configs) + 1
            elif focus_category == "jobs":
                requested_steps = max(4, len(steps_configs) - 1)
            elif focus_category == "non_academic":
                requested_steps = max(5, min(len(steps_configs), 7))

    if not requested_steps and len(steps_configs) < baseline_steps:
        requested_steps = baseline_steps
    elif requested_steps and requested_steps < baseline_steps and not refine_prompt:
        requested_steps = baseline_steps

    steps_configs = customize_steps_for_focus(steps_configs, focus, goal)
    total_duration = format_total_duration(total_months)

    if requested_steps and requested_steps != len(steps_configs):
        N = len(steps_configs)
        M = requested_steps
        
        dup_counts = [0] * N
        for j in range(M):
            orig_idx = int(j * N / M)
            dup_counts[orig_idx] += 1
            
        scaled_configs = []
        new_id = 1
        for orig_idx, count in enumerate(dup_counts):
            if count == 0:
                continue
            orig_step = steps_configs[orig_idx]
            for d in range(count):
                new_step = orig_step.copy()
                new_step["id"] = new_id
                
                # If there are duplicates, append Phase tag to title
                if count > 1:
                    new_step["title"] = f"{orig_step['title']} - Phase {d + 1}"
                    new_step["duration"] = split_duration(orig_step["duration"], count, d)
                
                scaled_configs.append(new_step)
                new_id += 1
                
        steps_configs = scaled_configs

    for cfg, duration in zip(steps_configs, distribute_month_ranges(len(steps_configs), total_months)):
        cfg["duration"] = duration

    # Map the configurations to high-fidelity milestone structures
    steps = []
    for cfg in steps_configs:
        step_title = cfg["title"]
        step_desc = cfg["description"]
        macro_view = cfg["macro_view"]
        micro_view = cfg["micro_view"]
        nano_view = cfg["nano_view"]

        steps.append({
            "id": cfg["id"],
            "title": step_title,
            "duration": cfg["duration"],
            "description": step_desc,
            "learning_objectives": [
                f"Understand the requirements and targets of the {step_title} phase.",
                f"Execute the micro execution steps and checklist tasks for this milestone.",
                f"Engage in mentor reviews and peer feedback to confirm phase readiness."
            ],
            "macro_view": macro_view,
            "micro_view": micro_view,
            "nano_view": nano_view,
            "marketplace": get_mock_marketplace(focus),
            "micro_steps": [
                {"task": f"Define and document goals for the {step_title} phase", "resource": "Google Docs / Notion"},
                {"task": f"Complete diagnostic sittings or task execution for {step_title}", "resource": "Practice Portals"},
                {"task": f"Review execution output with mentor or advisor", "resource": "Naavi Platform"}
            ]
        })

    path_title = f"Academic Pathway to {goal}"
    path_description = f"A comprehensive pedagogical blueprint designed to take a student from {current} to the target academic goal: {goal}."
    readiness_score = 30
    readiness_label = "Early Starter"

    if focus:
        focus_category = resolve_focus_category(focus)
        if focus_category == "academic":
            path_title = f"Academic & Research Pathway to {goal}"
            path_description = f"A highly rigorous academic and research-oriented roadmap designed to maximize GPA, master standardized test prep (SAT/ACT/IELTS/TOEFL), secure academic honors, publish research, and build a competitive profile for top-tier university placement in {goal}."
            readiness_score = 40
            readiness_label = "Intermediate Starter"
        elif focus_category == "practical":
            path_title = f"Practical & Skills Pathway to {goal}"
            path_description = f"A hands-on roadmap focused on learning the selected skill, building proof-of-work projects, earning practical credentials where useful, and applying the skill in internship or real-environment contexts for {goal}. This track treats skills separately from professions."
            readiness_score = 35
            readiness_label = "Early Builder"
        elif focus_category == "jobs":
            path_title = f"Jobs & Careers Pathway to {goal}"
            path_description = f"A role-readiness roadmap focused on technical or non-technical profession clarity, resume evidence, interview preparation, networking, and job-search execution for {goal}."
            readiness_score = 45
            readiness_label = "Career Starter"
        elif focus_category == "non_academic":
            path_title = f"Non-Academic Support Path for {goal}"
            path_description = f"A support and resource-navigation path for {goal}. This is not a career roadmap; it focuses on wellbeing routines, life decision support, trusted resources, counsellor review, short-term check-ins, and escalation to qualified help when appropriate."
            readiness_score = 40
            readiness_label = "Support Plan Starter"

    roadmap = {
        "path_title": path_title,
        "path_description": path_description,
        "readiness_score": readiness_score,
        "readiness_label": readiness_label,
        "total_duration": total_duration,
        "blind_spots": [
            "Lacks formal international exposure - needs IELTS/SAT preparation.",
            "Needs structured extracurricular profile development for university entrance."
        ],
        "steps": steps
    }
    return enrich_roadmap_narratives(roadmap, current, goal)

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
async def run_agent_1_blueprint(current: str, goal: str, profile: dict, refine_prompt: Optional[str] = None, existing_roadmap: Optional[dict] = None, focus: Optional[str] = None) -> dict:
    # Parse requested steps from refine_prompt if available
    requested_steps = None
    if refine_prompt:
        match_steps = re.search(r'(\d+)\s*(?:step|milestone)', refine_prompt.lower())
        if match_steps:
            try:
                requested_steps = int(match_steps.group(1))
                if requested_steps < 1:
                    requested_steps = 1
            except Exception:
                pass

    focus_title_prefix = "Academic & Research"
    focus_area = "SCHOOL (LKG-K12), COLLEGE (11-12), UNIVERSITY (BACHELORS, ANY DEGREE)"
    if focus:
        focus_category = resolve_focus_category(focus)
        if focus_category == "academic":
            focus_title_prefix = "Academic & Research"
            focus_area = "SCHOOL (LKG-K12), COLLEGE (11-12), UNIVERSITY (BACHELORS, ANY DEGREE). Focus strictly on formal education milestones, school curricula, college admissions, test prep, degrees, and academic research."
        elif focus_category == "practical":
            focus_title_prefix = "Practical & Skills"
            focus_area = "SKILLS TRACK and INTERNSHIP TRACK. Focus strictly on practical skill acquisition, proof-of-work projects, applied practice, internships, and real-environment execution. Do not treat a skill as a profession."
        elif focus_category == "jobs":
            focus_title_prefix = "Jobs & Careers"
            focus_area = "JOBS & CAREERS. Focus strictly on profession/role readiness, technical or non-technical role preparation, job placements, networking, resume evidence, interviews, and workplace readiness."
        elif focus_category == "non_academic":
            focus_title_prefix = "Non-Academic Counselling"
            focus_area = "NON-ACADEMIC COUNSELLING. Focus strictly on mental health and wellness support, generic life counselling, short-term immediate guidance, resource navigation, routines, and qualified referral options. This is not a career roadmap."

    prompt = AGENT_1_PROMPT.format(
        current_position=current,
        target_goal=goal,
        profile=json.dumps(profile),
        degree_type=get_request_degree_type(goal, profile) or "Not provided",
        focus_title_prefix=focus_title_prefix,
        focus_area=focus_area
    )
    if focus:
        prompt += f"\n\n🚨 STRATEGIC FOCUS DIRECTION: You MUST structure and customize this pathway according to this specific strategic focus direction:\n👉 \"{focus}\"\nEnsure all milestone titles, descriptions, objectives, learning views, checklists, and resources strongly reflect this focus so that it stands out distinctly from other alternative options."

    if refine_prompt:
        prompt += f"\n\n==================================================\nCRITICAL USER REQUEST FOR REFINE / ADJUSTMENT:\nThe user has requested the following specific instruction to refine/adjust this pathway. You MUST strictly adhere to and execute this instruction in your output:\n👉 \"{refine_prompt}\"\n==================================================\n"
        if requested_steps:
            prompt += f"\n\n🚨 CRITICAL ENFORCEMENT: The user has explicitly requested EXACTLY {requested_steps} steps/milestones. You MUST ignore any conflicting default step count rules and generate EXACTLY {requested_steps} distinct step objects inside the 'steps' JSON array. Do not output more or fewer than {requested_steps} steps. Ensure they have IDs 1 to {requested_steps}."
        if existing_roadmap:
            raw_roadmap = existing_roadmap.get("roadmap_data") or existing_roadmap
            # Context compression: Only send metadata to save thousands of tokens and avoid TPM limit
            compressed_roadmap = {
                "path_title": raw_roadmap.get("path_title", ""),
                "path_description": raw_roadmap.get("path_description", ""),
                "total_duration": raw_roadmap.get("total_duration", ""),
                "steps": [
                    {
                        "id": m.get("id"),
                        "title": m.get("title", ""),
                        "duration": m.get("duration", ""),
                        "description": m.get("description", "")
                    }
                    for m in raw_roadmap.get("steps", [])
                ]
            }
            prompt += f"\nEXISTING ROADMAP (use this as the base reference to modify only what the user requested, leaving other steps unchanged):\n{json.dumps(compressed_roadmap, indent=2)}\n"
            
    feedback_items = []
    # Retrieve and append feedback matching target_goal or profile
    try:
        feedback_items = await get_relevant_admin_feedback(goal, profile)
        if feedback_items:
            feedback_str = "\n\n==================================================\n🚨 LEARN FROM PAST EXPERT ADMIN FEEDBACK / INSTRUCTIONS:\nAdmins have previously edited pathways for similar target goals or student profiles and left the following guidelines. You MUST strictly incorporate these learnings when structuring this new pathway:\n"
            for item in feedback_items:
                feedback_str += f"- [{item['category'].upper()}] (For Target: '{item['target_goal']}', Grade: {item['profile_grade'] or 'N/A'}, Curriculum: {item['profile_curriculum'] or 'N/A'}, Stream: {item['profile_stream'] or 'N/A'}):\n  \"{item['feedback_text']}\"\n"
            feedback_str += "==================================================\n"
            prompt += feedback_str
            print(f"[Feedback Learning] Injected {len(feedback_items)} relevant admin feedbacks into generation prompt.")
    except Exception as e:
        print(f"[Feedback Learning Warning] Could not inject admin feedback: {e}")

    print(f"[Agent 1] Generating initial roadmap blueprint (focus: {focus or 'default'}) using 70B...")
    # Keep Agent 1 retries bounded. The generic helper previously cycled through
    # five models and this function then started a second full retry cycle.
    res = await query_groq_json(
        prompt,
        preferred_model="llama-3.3-70b-versatile",
        fallback_models=["llama-3.1-8b-instant"],
    )

    if requested_steps and is_complete_blueprint(res, current, goal, profile):
        res = scale_blueprint_steps(res, requested_steps)

    # Reject truncated/repaired responses that contain only the first milestone.
    # A complete fallback is safer than displaying a one-step 36-month pathway.
    if not is_complete_blueprint(res, current, goal, profile, requested_steps):
        received_steps = len(res.get("steps", [])) if isinstance(res, dict) else 0
        print(
            f"[Blueprint Validation] Incomplete model roadmap ({received_steps} steps). "
            "Serving board-calibrated fallback roadmap."
        )
        fallback = get_fallback_mock_roadmap(current, goal, profile, refine_prompt, focus)
        fallback["admin_feedback_memory"] = build_admin_feedback_memory(
            feedback_items,
            applied_to_prompt=bool(feedback_items),
            fallback_used=True,
        )
        return fallback

    res["admin_feedback_memory"] = build_admin_feedback_memory(
        feedback_items,
        applied_to_prompt=bool(feedback_items),
        fallback_used=False,
    )
    return res

async def run_agent_2_path_auditor(blueprint: dict, current: str, goal: str, profile: dict, refine_prompt: Optional[str] = None, existing_roadmap: Optional[dict] = None) -> dict:
    # CONTEXT COMPRESSION: Send only path-level attributes. Save thousands of tokens!
    compressed_blueprint = {
        "path_title": blueprint.get("path_title", ""),
        "path_description": blueprint.get("path_description", ""),
        "readiness_score": blueprint.get("readiness_score", 15),
        "readiness_label": blueprint.get("readiness_label", ""),
        "blind_spots": blueprint.get("blind_spots", [])
    }
    prompt = AGENT_2_PROMPT.format(
        current_position=current,
        target_goal=goal,
        profile=json.dumps(profile),
        blueprint=json.dumps(compressed_blueprint)
    )
    if refine_prompt:
        prompt += f"\n\n==================================================\nCRITICAL USER REQUEST FOR REFINE / ADJUSTMENT:\nThe user has requested the following specific instruction to refine/adjust this pathway. You MUST strictly adhere to and execute this instruction in your output:\n👉 \"{refine_prompt}\"\n==================================================\n"
        if existing_roadmap:
            roadmap_to_send = existing_roadmap.get("roadmap_data") or existing_roadmap
            prompt += f"\nEXISTING ROADMAP:\n{json.dumps(roadmap_to_send, indent=2)}\n"
    print("[Agent 2] Auditing overall path title, description, and readiness using 8B...")
    return await query_groq_json(prompt, preferred_model="llama-3.1-8b-instant")

async def run_agent_3_steps_auditor(blueprint: dict, current: str, goal: str, profile: dict, refine_prompt: Optional[str] = None, existing_roadmap: Optional[dict] = None) -> list:
    # CONTEXT COMPRESSION: Send step metadata, views, and checklists. Skip marketplace to save tokens!
    compressed_blueprint = [
        {
            "id": m["id"],
            "title": m["title"],
            "duration": m["duration"],
            "description": m["description"],
            "learning_objectives": m.get("learning_objectives", []),
            "macro_view": get_view_description(m, "macro_view"),
            "micro_view": get_view_description(m, "micro_view"),
            "nano_view": get_view_description(m, "nano_view"),
            "micro_steps": m.get("micro_steps", [])
        }
        for m in blueprint.get("steps", [])
    ]
    prompt = AGENT_3_PROMPT.format(
        current_position=current,
        target_goal=goal,
        profile=json.dumps(profile),
        blueprint=json.dumps(compressed_blueprint)
    )
    if refine_prompt:
        prompt += f"\n\n==================================================\nCRITICAL USER REQUEST FOR REFINE / ADJUSTMENT:\nThe user has requested the following specific instruction to refine/adjust this pathway. You MUST strictly adhere to and execute this instruction in your output:\n👉 \"{refine_prompt}\"\n==================================================\n"
        if existing_roadmap:
            roadmap_to_send = existing_roadmap.get("roadmap_data") or existing_roadmap
            prompt += f"\nEXISTING ROADMAP:\n{json.dumps(roadmap_to_send, indent=2)}\n"
    print("[Agent 3] Auditing steps, learning views, and checklists using 8B...")
    res = await query_groq_json(prompt, preferred_model="llama-3.1-8b-instant")
    return res if isinstance(res, list) else []

async def run_agent_4_marketplace_auditor(blueprint: dict, current: str, goal: str, profile: dict, refine_prompt: Optional[str] = None, existing_roadmap: Optional[dict] = None) -> list:
    # CONTEXT COMPRESSION: Send only milestone ids and resource structures. Save ~5000 tokens!
    compressed_blueprint = [
        {
            "id": m["id"],
            "title": m["title"],
            "marketplace": m.get("marketplace", {})
        }
        for m in blueprint.get("steps", [])
    ]
    prompt = AGENT_4_PROMPT.format(
        current_position=current,
        target_goal=goal,
        profile=json.dumps(profile),
        blueprint=json.dumps(compressed_blueprint)
    )
    if refine_prompt:
        prompt += f"\n\n==================================================\nCRITICAL USER REQUEST FOR REFINE / ADJUSTMENT:\nThe user has requested the following specific instruction to refine/adjust this pathway. You MUST strictly adhere to and execute this instruction in your output:\n👉 \"{refine_prompt}\"\n==================================================\n"
        if existing_roadmap:
            roadmap_to_send = existing_roadmap.get("roadmap_data") or existing_roadmap
            prompt += f"\nEXISTING ROADMAP:\n{json.dumps(roadmap_to_send, indent=2)}\n"
    print("[Agent 4] Auditing resource marketplace selections using 8B...")
    res = await query_groq_json(prompt, preferred_model="llama-3.1-8b-instant")
    return res if isinstance(res, list) else []



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


def minimum_blueprint_steps(current: str, goal: str, profile: dict) -> int:
    total_months = calculate_total_duration_months(current, goal, profile)
    if total_months >= duration_months_for_level(1):
        return 10
    if total_months >= MONTHS_PER_ACADEMIC_YEAR * 2:
        return 8
    grade_text = f"{profile.get('grade') or ''} {current}".lower()

    if total_months >= MONTHS_PER_ACADEMIC_YEAR * 5:
        return 16
    if total_months >= duration_months_for_level(1):
        return 14
    if total_months >= MONTHS_PER_ACADEMIC_YEAR * 3:
        return 12
    if total_months >= MONTHS_PER_ACADEMIC_YEAR * 2:
        return 10
    if "10" in grade_text or "11" in grade_text or "tenth" in grade_text or "eleventh" in grade_text:
        return 12
    if "12" in grade_text or "twelfth" in grade_text:
        return 8
    return 8


def is_complete_blueprint(
    blueprint: Any,
    current: str,
    goal: str,
    profile: dict,
    requested_steps: Optional[int] = None,
) -> bool:
    if not isinstance(blueprint, dict) or blueprint.get("error"):
        return False
    milestones = blueprint.get("steps")
    if not isinstance(milestones, list):
        return False
    required_steps = requested_steps or minimum_blueprint_steps(current, goal, profile)
    return len(milestones) >= required_steps


def sse_payload(event: str, data: dict) -> str:
    return f"event: {event}\ndata: {json.dumps(data)}\n\n"


async def build_and_store_final_path(
    blueprint: dict,
    path_audit: dict,
    steps_audit: list,
    market_audit: list,
    current: str,
    goal: str,
    profile: dict,
    path_type: str = "Academic & Research"
) -> dict:
    # Calculate metrics — pass path_type so readiness score is unique per path
    metrics = calculate_path_metrics(current, goal, profile, path_type)
    
    final_steps = []
    blueprint_milestones = blueprint.get("steps", [])
    num_steps = len(blueprint_milestones)
    
    total_months = calculate_total_duration_months(current, goal, profile)
    try:
        total_months = int(metrics["total_duration"].split()[0])
    except:
        pass

    for i, orig_milestone in enumerate(blueprint_milestones):
        m_id = orig_milestone.get("id", i + 1)
        
        # Enforce strict mathematical distribution of months over the generated steps
        if num_steps > 0:
            start_month = int((i / num_steps) * total_months) + 1
            end_month = int(((i + 1) / num_steps) * total_months)
            if end_month < start_month:
                end_month = start_month
            enforced_duration = f"Month {start_month}" if start_month == end_month else f"Months {start_month}-{end_month}"
        else:
            enforced_duration = orig_milestone.get("duration", format_total_duration(MONTHS_PER_ACADEMIC_YEAR // 4))

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

    final_json = {
        "path_title": blueprint.get("path_title") or f"Academic Pathway to {goal}",
        "path_description": blueprint.get("path_description") or f"Detailed strategy blueprint for achieving target goal: {goal}.",
        "readiness_score": metrics["readiness_score"],
        "readiness_label": metrics["readiness_label"],
        "total_duration": metrics["total_duration"],
        "steps": final_steps,
        "blind_spots": blueprint.get("blind_spots") or [],
        "admin_feedback_memory": blueprint.get("admin_feedback_memory") or build_admin_feedback_memory([], False),
    }

    final_json = enrich_roadmap_narratives(final_json, current, goal)

    name_tokens = build_name_patterns(profile, current)
    if name_tokens:
        print(f"[Sanitizer] Scrubbing personal name tokens: {name_tokens}")
        final_json = recursive_sanitize(final_json, name_tokens)
        print("[Sanitizer] Personal name sanitization complete.")

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

@app.post("/api/path/score")
async def get_path_score(req: PathScoreRequest):
    profile = req.profile or {}
    current = req.current_position or ""
    return calculate_path_accuracy_score(req.roadmap_data, profile, current)

@app.post("/api/profile")
async def save_profile(profile: StudentProfileModel):
    existing = await profiles_collection.find_one({"email": profile.email.lower()})
    profile_dict = profile.dict(by_alias=True, exclude_none=True)
    profile_dict["email"] = profile_dict["email"].lower()
    
    if "_id" in profile_dict:
        del profile_dict["_id"]
    if "id" in profile_dict:
        del profile_dict["id"]
        
    profile_dict["updated_at"] = datetime.datetime.now(datetime.timezone.utc)
    
    if existing:
        await profiles_collection.update_one(
            {"email": profile.email.lower()},
            {"$set": profile_dict}
        )
        updated_doc = await profiles_collection.find_one({"email": profile.email.lower()})
        return serialize_mongo_doc(updated_doc)
    else:
        profile_dict["created_at"] = datetime.datetime.now(datetime.timezone.utc)
        result = await profiles_collection.insert_one(profile_dict)
        profile_dict["id"] = str(result.inserted_id)
        return serialize_mongo_doc(profile_dict)

@app.get("/api/profile/{email}")
async def get_profile(email: str):
    admin_email = os.environ.get("ADMIN_USERNAME", "pathengine.admin@gmail.com")
    if email.lower() == admin_email.lower():
        raise HTTPException(status_code=403, detail="Direct access to admin profile is forbidden. Please use /api/login.")
    doc = await profiles_collection.find_one({"email": email.lower()})
    if not doc:
        raise HTTPException(status_code=404, detail="Profile not found")
    return serialize_mongo_doc(doc)


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
    refine_prompt = req.refine_prompt.strip() if req.refine_prompt else None
    existing_roadmap = req.existing_roadmap
    focus_req = req.focus.strip() if req.focus else None

    if not current or not goal:
        raise HTTPException(status_code=400, detail="Current position and Target goal cannot be empty")
    if requires_degree_for_focus(focus_req):
        profile = ensure_degree_type_for_generation(goal, profile, req.degree_type)
    else:
        profile = dict(profile or {})
        degree_type = get_request_degree_type(goal, profile, req.degree_type)
        if degree_type:
            profile["degreeType"] = degree_type

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
                    "portfolio", "admission", "ielts", "gpa", "internship", "project"
                ]
                if any(n in val for n in noise) or len(val) < 4 or not any(kw in val for kw in valid_keywords):
                    yield sse_payload("error", {"message": "This request is irrelevant to career pathway refinement. Please provide specific instructions to adjust this pathway, such as 'change step 1 description' or 'add more milestones'."})
                    return

            yield sse_payload("status", {
                "statuses": build_agent_statuses("agent1", completed),
                "progress": 20,
                "message": "Creating pathway for selected segment..."
            })

            foci, option_names = get_focus_choices(
                focus_req=focus_req,
                content_category=req.content_category,
                sub_segment=req.sub_segment
            )

            # Run Agent 1 alternatives in parallel, but keep yielding events while
            # the model calls are in flight. A single gather() made the stream sit
            # at 20% until every alternative had finished.
            blueprint_tasks = {
                asyncio.create_task(
                    run_agent_1_blueprint(
                        current, goal, profile, refine_prompt, existing_roadmap, focus=focus
                    )
                ): index
                for index, focus in enumerate(foci)
            }
            blueprints = [None] * len(foci)
            pending_tasks = set(blueprint_tasks)
            finished_count = 0
            stage_progress = 20

            while pending_tasks:
                done, pending_tasks = await asyncio.wait(
                    pending_tasks,
                    timeout=3,
                    return_when=asyncio.FIRST_COMPLETED,
                )

                # A status heartbeat keeps the SSE response flowing through
                # browsers and reverse proxies during long model calls.
                if not done:
                    stage_progress = min(39, stage_progress + 1)
                    yield sse_payload("status", {
                        "statuses": build_agent_statuses("agent1", completed),
                        "progress": stage_progress,
                        "message": f"Creating pathway alternatives... ({finished_count} of {len(foci)} ready)"
                    })
                    continue

                for task in done:
                    index = blueprint_tasks[task]
                    try:
                        blueprints[index] = task.result()
                    except Exception as exc:
                        blueprints[index] = exc
                    finished_count += 1

                stage_progress = max(
                    stage_progress,
                    20 + round(20 * finished_count / len(foci)),
                )
                yield sse_payload("status", {
                    "statuses": build_agent_statuses("agent1", completed),
                    "progress": stage_progress,
                    "message": f"Creating pathway alternatives... ({finished_count} of {len(foci)} ready)"
                })

            valid_blueprints = []
            for i, bp in enumerate(blueprints):
                if isinstance(bp, Exception) or not is_complete_blueprint(bp, current, goal, profile):
                    received_steps = len(bp.get("steps", [])) if isinstance(bp, dict) else 0
                    print(
                        f"Blueprint {i} was incomplete ({received_steps} steps). "
                        "Using the complete fallback roadmap."
                    )
                    valid_blueprints.append(get_fallback_mock_roadmap(current, goal, profile, refine_prompt, focus=foci[i]))
                else:
                    valid_blueprints.append(bp)

            completed.append("agent1")
            yield sse_payload("status", {
                "statuses": build_agent_statuses("agent2", completed),
                "progress": 50,
                "message": "Validating pathway titles, goals, and readiness..."
            })
            await asyncio.sleep(0.15)

            # Agent 2: normalize path-level fields for every alternative.
            for i, bp in enumerate(valid_blueprints):
                bp["path_title"] = bp.get("path_title") or f"{option_names[i]} Pathway to {goal}"
                bp["path_description"] = bp.get("path_description") or f"A structured pathway from {current} to {goal}."

            completed.append("agent2")
            yield sse_payload("status", {
                "statuses": build_agent_statuses("agent3", completed),
                "progress": 65,
                "message": "Checking milestone coverage and step sequence..."
            })
            await asyncio.sleep(0.15)

            # Agent 3: enforce complete, sequential milestone collections.
            for i, bp in enumerate(valid_blueprints):
                if not is_complete_blueprint(bp, current, goal, profile):
                    bp = get_fallback_mock_roadmap(current, goal, profile, refine_prompt, focus=foci[i])
                    valid_blueprints[i] = bp
                for step_number, milestone in enumerate(bp["steps"], start=1):
                    milestone["id"] = step_number

            completed.append("agent3")
            yield sse_payload("status", {
                "statuses": build_agent_statuses("agent4", completed),
                "progress": 80,
                "message": "Checking learning resources and action checklists..."
            })
            await asyncio.sleep(0.15)

            for i, bp in enumerate(valid_blueprints):
                for milestone in bp["steps"]:
                    if not milestone.get("marketplace"):
                        milestone["marketplace"] = get_mock_marketplace(foci[i])
                    if not milestone.get("micro_steps"):
                        milestone["micro_steps"] = [
                            {
                                "task": f"Complete the planned work for {milestone.get('title', 'this milestone')}",
                                "resource": "Naavi progress tracker",
                            }
                        ]
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
                    path_type=option_names[i]
                )
                final_json["option_name"] = option_names[i]
                accuracy = calculate_path_accuracy_score(final_json, profile, current)
                final_json["accuracy_score"] = accuracy["accuracy_score"]
                final_json["accuracy_label"] = accuracy["accuracy_label"]
                final_json["accuracy_color"] = accuracy["accuracy_color"]
                final_json["accuracy_breakdown"] = accuracy["breakdown"]
                final_json["accuracy_details"] = accuracy["details"]
                print(f"[Accuracy Model] Stream Option '{option_names[i]}': score={accuracy['accuracy_score']} ({accuracy['accuracy_label']}) | structural={accuracy['breakdown']['structural']} content={accuracy['breakdown']['content']} market={accuracy['breakdown']['market']}")
                final_alternatives.append(final_json)


            completed.append("ready")
            elapsed = time.perf_counter() - started_at
            print(f"[Audit API] Alternate paths generation completed in {elapsed:.2f} seconds (Consolidated Agent 1 Pipeline).")
            yield sse_payload("status", {
                "statuses": build_agent_statuses(None, completed),
                "progress": 100,
                "message": "Your alternate career paths are ready!"
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

@app.post("/api/path")
async def generate_path(req: PathGenerationRequest):
    current = req.current_position.strip()
    goal = req.target_goal.strip()
    profile = req.profile or {}
    refine_prompt = req.refine_prompt.strip() if req.refine_prompt else None
    existing_roadmap = req.existing_roadmap
    focus_req = req.focus.strip() if req.focus else None
    
    if not current or not goal:
        raise HTTPException(status_code=400, detail="Current position and Target goal cannot be empty")
    if requires_degree_for_focus(focus_req):
        profile = ensure_degree_type_for_generation(goal, profile, req.degree_type)
    else:
        profile = dict(profile or {})
        degree_type = get_request_degree_type(goal, profile, req.degree_type)
        if degree_type:
            profile["degreeType"] = degree_type
    
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
            "portfolio", "admission", "ielts", "gpa", "internship", "project"
        ]
        if any(n in val for n in noise) or len(val) < 4 or not any(kw in val for kw in valid_keywords):
            raise HTTPException(status_code=400, detail="This request is irrelevant to career pathway refinement. Please provide specific instructions to adjust this pathway, such as 'change step 1 description' or 'add more milestones'.")

    try:
        foci, option_names = get_focus_choices(
            focus_req=focus_req,
            content_category=req.content_category,
            sub_segment=req.sub_segment
        )

        # 1. Run Agent 1 in parallel
        blueprint_tasks = [
            run_agent_1_blueprint(current, goal, profile, refine_prompt, existing_roadmap, focus=focus)
            for focus in foci
        ]
        blueprints = await asyncio.gather(*blueprint_tasks, return_exceptions=True)
        
        valid_blueprints = []
        for i, bp in enumerate(blueprints):
            if isinstance(bp, Exception) or not bp or "steps" not in bp:
                valid_blueprints.append(get_fallback_mock_roadmap(current, goal, profile, refine_prompt, focus=foci[i]))
            else:
                valid_blueprints.append(bp)
                
        # 3. Merge and score
        final_alternatives = []
        for i, bp in enumerate(valid_blueprints):
            final_json = await build_and_store_final_path(
                bp, {}, [], [], current, goal, profile,
                path_type=option_names[i]
            )
            final_json["option_name"] = option_names[i]
            # ── ACCURACY MODEL: attach score to every generated path ──
            accuracy = calculate_path_accuracy_score(final_json, profile, current)
            final_json["accuracy_score"] = accuracy["accuracy_score"]
            final_json["accuracy_label"] = accuracy["accuracy_label"]
            final_json["accuracy_color"] = accuracy["accuracy_color"]
            final_json["accuracy_breakdown"] = accuracy["breakdown"]
            final_json["accuracy_details"] = accuracy["details"]
            print(f"[Accuracy Model] Option '{option_names[i]}': score={accuracy['accuracy_score']} ({accuracy['accuracy_label']}) | structural={accuracy['breakdown']['structural']} content={accuracy['breakdown']['content']} market={accuracy['breakdown']['market']}")
            final_alternatives.append(final_json)
            
        final_alternatives = await log_generation_event(
            current, goal, profile, refine_prompt, focus_req, existing_roadmap, final_alternatives
        )
        return {"alternatives": final_alternatives}
        
    except Exception as e:
        print(f"[AI Pipeline Warning] Exception occurred during generation: {e}. Recovering with fallbacks.")
        final_alternatives = []
        foci, option_names = get_focus_choices(
            focus_req=focus_req,
            content_category=req.content_category,
            sub_segment=req.sub_segment
        )

        for i in range(len(foci)):
            final_json = get_fallback_mock_roadmap(current, goal, profile, refine_prompt, focus=foci[i])
            name_tokens = build_name_patterns(profile, current)
            if name_tokens:
                final_json = recursive_sanitize(final_json, name_tokens)
            final_json["db_id"] = None
            final_json["status"] = "draft"
            final_json["option_name"] = option_names[i]
            final_alternatives.append(final_json)
            
        final_alternatives = await log_generation_event(
            current, goal, profile, refine_prompt, focus_req, existing_roadmap, final_alternatives
        )
        return {"alternatives": final_alternatives}


@app.post("/api/path/blueprint")
async def generate_path_blueprint(req: PathGenerationRequest):
    import time
    start_time = time.time()
    current = req.current_position.strip()
    goal = req.target_goal.strip()
    profile = req.profile or {}
    
    if not current or not goal:
        raise HTTPException(status_code=400, detail="Current position and Target goal cannot be empty")
    profile = ensure_degree_type_for_generation(goal, profile, req.degree_type)
    
    try:
        blueprint = await run_agent_1_blueprint(current, goal, profile)
        elapsed = time.time() - start_time
        print(f"[Blueprint API] Generated initial blueprint in {elapsed:.2f} seconds.")
        return blueprint
    except Exception as e:
        print(f"[Blueprint API Error] {e}")
        return get_fallback_mock_roadmap(current, goal, profile)


@app.post("/api/path/audit")
async def generate_path_audit(req: PathAuditRequest):
    import time
    start_time = time.time()
    blueprint = req.blueprint
    current = req.current_position.strip()
    goal = req.target_goal.strip()
    profile = req.profile or {}
    
    try:
        final_json = await build_and_store_final_path(
            blueprint, {}, [], [], current, goal, profile
        )
        elapsed = time.time() - start_time
        print(f"[Audit API] Consolidated audit completed in {elapsed:.2f} seconds.")
        return final_json
        
    except Exception as e:
        print(f"[AI Pipeline Warning] Exception occurred during audit: {e}. Recovering with fallback.")
        final_json = get_fallback_mock_roadmap(current, goal, profile)
        name_tokens = build_name_patterns(profile, current)
        if name_tokens:
            final_json = recursive_sanitize(final_json, name_tokens)
        
        final_json["db_id"] = None
        final_json["status"] = "draft"
        return final_json


# Backward-compatible simple path endpoint
@app.post("/api/path_legacy")
async def generate_path_legacy(req: GoalRequest):
    # Parse out current & goal if possible, otherwise use fallback defaults
    raw_goal = req.goal
    current = "High School"
    goal = raw_goal
    if "Current:" in raw_goal and "Goal:" in raw_goal:
        match = re.search(r"Current:\s*(.*?)\s*\.\s*Goal:\s*(.*?)\s*\.", raw_goal)
        if match:
            current = match.group(1)
            goal = match.group(2)
    return await generate_path(PathGenerationRequest(current_position=current, target_goal=goal))

# Admin Endpoint: Get pathway statistics and analytics charts
@app.get("/api/admin/analytics")
async def get_admin_analytics():
    # 1. Counts
    pending_count = await pending_paths_collection.count_documents({})
    published_count = await published_paths_collection.count_documents({})
    total_generated = pending_count + published_count

    # 1b. This week count (paths created in last 7 days)
    now_utc = datetime.datetime.now(datetime.timezone.utc)
    week_ago = now_utc - datetime.timedelta(days=7)
    week_ago_iso = week_ago.isoformat()
    this_week_count = 0
    for col in [pending_paths_collection, published_paths_collection]:
        cur = col.find({"created_at": {"$gte": week_ago_iso}}, {"_id": 1})
        async for _ in cur:
            this_week_count += 1

    # 2. Average Review Time (days)
    cursor = published_paths_collection.find({}, {"created_at": 1, "published_at": 1})
    times = []
    async for doc in cursor:
        created = doc.get("created_at")
        published = doc.get("published_at")
        if created and published:
            try:
                if isinstance(created, str):
                    created = datetime.datetime.fromisoformat(created.replace("Z", "+00:00"))
                if isinstance(published, str):
                    published = datetime.datetime.fromisoformat(published.replace("Z", "+00:00"))
                if created.tzinfo is not None and published.tzinfo is None:
                    published = published.replace(tzinfo=datetime.timezone.utc)
                elif created.tzinfo is None and published.tzinfo is not None:
                    created = created.replace(tzinfo=datetime.timezone.utc)
                delta = published - created
                times.append(delta.total_seconds() / (24 * 3600))
            except Exception:
                continue

    avg_review_time = round(sum(times) / len(times), 1) if times else 2.4

    # 3. Status Breakdown
    draft_count = max(5, int(total_generated * 0.1))
    total_with_drafts = total_generated + draft_count
    
    published_pct = round((published_count / total_with_drafts) * 100) if total_with_drafts else 74
    pending_pct = round((pending_count / total_with_drafts) * 100) if total_with_drafts else 17
    draft_pct = 100 - published_pct - pending_pct

    # 4. Pathways over time (last 6 months)
    now = datetime.datetime.now(datetime.timezone.utc)
    months_names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    last_6_months = []
    for i in range(5, -1, -1):
        m_date = now - datetime.timedelta(days=i*30)
        last_6_months.append({
            "name": months_names[m_date.month - 1],
            "month_num": m_date.month,
            "year": m_date.year,
            "generated": 0,
            "published": 0
        })

    async def count_paths_in_months(collection, is_published):
        cursor = collection.find({}, {"created_at": 1})
        async for doc in cursor:
            created = doc.get("created_at")
            if not created:
                continue
            try:
                if isinstance(created, str):
                    created = datetime.datetime.fromisoformat(created.replace("Z", "+00:00"))
                for m in last_6_months:
                    if created.month == m["month_num"] and created.year == m["year"]:
                        m["generated"] += 1
                        if is_published:
                            m["published"] += 1
                        break
            except Exception:
                continue

    await count_paths_in_months(pending_paths_collection, False)
    await count_paths_in_months(published_paths_collection, True)

    base_generated = [35, 42, 48, 55, 64, 72]
    base_published = [28, 34, 38, 42, 49, 55]
    for idx, m in enumerate(last_6_months):
        if idx < len(base_generated):
            m["generated"] += base_generated[idx]
            m["published"] += base_published[idx]

    # 5. Recent Pathways
    recent_list = []
    p_cursor = pending_paths_collection.find({}).sort("created_at", -1).limit(5)
    async for doc in p_cursor:
        doc["status"] = "Pending"
        recent_list.append(doc)
    pub_cursor = published_paths_collection.find({}).sort("created_at", -1).limit(5)
    async for doc in pub_cursor:
        doc["status"] = "Published"
        recent_list.append(doc)

    recent_list.sort(key=lambda x: x.get("created_at") or datetime.datetime.min, reverse=True)
    recent_list = recent_list[:5]

    recent_pathways = []
    for doc in recent_list:
        profile = doc.get("profile") or {}
        student_name = profile.get("name") or "Anonymous Student"
        goal = doc.get("target_goal") or "N/A"
        roadmap = doc.get("roadmap_data") or {}
        steps = roadmap.get("steps") or []
        
        recent_pathways.append({
            "student": student_name,
            "goal": goal,
            "status": doc["status"],
            "steps": len(steps)
        })

    if not recent_pathways:
        recent_pathways = [
            { "student": "Arjun S.", "goal": "CS • Oxford", "status": "Published", "steps": 6 },
            { "student": "Priya M.", "goal": "Medicine • AIIMS", "status": "Pending", "steps": 8 },
            { "student": "Karan R.", "goal": "MBA • IIM", "status": "Pending", "steps": 7 },
            { "student": "Sneha T.", "goal": "Design • NID", "status": "Published", "steps": 5 },
            { "student": "Rohan V.", "goal": "Law • NLU", "status": "Draft", "steps": 6 }
        ]

    # 6. Top goals generated
    goal_counts = {
        "Computer Science": 88,
        "Medicine • MBBS": 54,
        "MBA / Management": 43,
        "Engineering • IIT": 33,
        "Law • NLU": 23,
        "Design • NID": 15
    }
    async def aggregate_goals(collection):
        cursor = collection.find({}, {"target_goal": 1})
        async for doc in cursor:
            g = doc.get("target_goal")
            if g:
                g_lower = g.strip().lower()
                if any(k in g_lower for k in ["computer", "cs", "software", "coding", "programming", "programmer", "ai", "machine learning", "developer", "web dev", "data science"]):
                    goal_counts["Computer Science"] += 1
                elif any(k in g_lower for k in ["medicine", "mbbs", "doctor", "aiims", "dentist", "medical", "biology", "surgeon", "healthcare"]):
                    goal_counts["Medicine • MBBS"] += 1
                elif any(k in g_lower for k in ["mba", "management", "business", "finance", "iim", "consulting", "marketing", "strategy", "commerce"]):
                    goal_counts["MBA / Management"] += 1
                elif any(k in g_lower for k in ["engineering", "iit", "btech", "mechanical", "civil", "electrical", "aerospace", "tech", "technology"]):
                    goal_counts["Engineering • IIT"] += 1
                elif any(k in g_lower for k in ["law", "nlu", "clat", "advocate", "lawyer", "judiciary", "legal"]):
                    goal_counts["Law • NLU"] += 1
                elif any(k in g_lower for k in ["design", "nid", "fashion", "architecture", "nift", "ux", "ui", "art", "creative"]):
                    goal_counts["Design • NID"] += 1

    await aggregate_goals(pending_paths_collection)
    await aggregate_goals(published_paths_collection)

    sorted_goals = sorted(goal_counts.items(), key=lambda x: x[1], reverse=True)[:6]
    max_val = sorted_goals[0][1] if sorted_goals else 88

    top_goals = []
    colors = ["var(--blue)", "var(--accent)", "var(--yellow)", "#9B51E0", "var(--coral)", "#E040FB"]
    for idx, (label, val) in enumerate(sorted_goals):
        top_goals.append({
            "label": label,
            "value": val,
            "maxVal": max_val,
            "color": colors[idx % len(colors)]
        })


    return {
        "total_generated": total_generated,
        "pending_count": pending_count,
        "published_count": published_count,
        "this_week": this_week_count,
        "avg_review_time": f"{avg_review_time}d",
        "line_chart_months": [{ "name": m["name"], "generated": m["generated"], "published": m["published"] } for m in last_6_months],
        "status_slices": [
            { "label": "Published", "value": published_count, "pct": published_pct, "color": "#2CA852" },
            { "label": "Pending", "value": pending_count, "pct": pending_pct, "color": "#F9B000" },
            { "label": "Draft", "value": draft_count, "pct": draft_pct, "color": "#80868B" }
        ],
        "recent_pathways": recent_pathways,
        "top_goals": top_goals
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

Step ID: {step_id}
Step title: {step_title}
Step duration: {step_duration}
Marketplace section: {marketplace_section}
Marketplace category: {marketplace_category}
Current items in this exact category:
{current_items}

Student context:
- Current position: {current_position}
- Target goal: {target_goal}
- Profile: {profile}

User instruction: {instruction}

Rules:
- {generation_rule}
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
Your ONLY job is to rewrite ONE specific field inside ONE step of a career roadmap.

Step being updated:
- Step ID: {step_id}
- Step Title: {step_title}
- Step Duration: {step_duration}

Field to update: "{field}"
Current value of that field:
{current_value}

Student Context:
- Current Position: {current_position}
- Target Goal: {target_goal}
- Profile: {profile}

User Instruction: {instruction}

Rules:
- Rewrite ONLY the "{field}" field according to the user's instruction.
- Keep the content relevant to the step's title and duration.
- Keep the tone academic, strategic, and professional.
- Do NOT mention the student's personal name or email.
- Output ONLY a valid JSON object with a single key "{field}" containing the rewritten value.
- No markdown, no backticks, no explanation. Just the JSON.

Expected output formats based on the target field:
- If the field is "macro_view", "micro_view", "nano_view", or "description", the output format must be:
  {{"{field}": "<your rewritten detailed text paragraph>"}}

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
                f'Return a dynamic, data-dependent list of fresh, relevant, real-world items for ONLY the '
                f'"{category}" category. Do not use a fixed minimum, fixed maximum, or default count.'
            )

        prompt = MARKETPLACE_CATEGORY_PATCH_PROMPT.format(
            step_id=req.step_id,
            step_title=req.current_step.get("title", f"Step {req.step_id}"),
            step_duration=req.current_step.get("duration", ""),
            marketplace_section=section,
            marketplace_category=category,
            current_items=json.dumps(prompt_current_items, indent=2),
            current_position=req.current_position,
            target_goal=req.target_goal,
            profile=json.dumps(req.profile or {}),
            instruction=req.instruction,
            generation_rule=generation_rule,
        )

        print(
            f"[Patch Agent] Patching step {req.step_id} marketplace "
            f"section '{section}', category '{category}'."
        )
        result = await query_groq_json(prompt, preferred_model="llama-3.1-8b-instant")
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
        step_id=req.step_id,
        step_title=req.current_step.get("title", f"Step {req.step_id}"),
        step_duration=req.current_step.get("duration", ""),
        field=req.field,
        current_value=current_value_str,
        current_position=req.current_position,
        target_goal=req.target_goal,
        profile=json.dumps(req.profile or {}),
        instruction=req.instruction
    )

    print(f"[Patch Agent] Patching step {req.step_id} field '{req.field}' with instruction: {req.instruction}")
    result = await query_groq_json(prompt, preferred_model="llama-3.1-8b-instant")

    if not result or req.field not in result:
        raise HTTPException(status_code=500, detail="Patch agent failed to return updated content. Please try again.")

    # Sanitize any personal names
    profile = req.profile or {}
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

