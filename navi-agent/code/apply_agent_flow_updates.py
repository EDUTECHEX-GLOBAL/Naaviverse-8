import re
import os
import sys

MAIN_PY = os.path.join(os.path.dirname(__file__), "main.py")

with open(MAIN_PY, "r", encoding="utf-8") as f:
    code = f.read()

# ─── SECTION 1: PROMPTS REPLACEMENT ───
prompt_start = code.find("# ─── AGENT 1: BLUEPRINT GENERATOR PROMPT ───")
prompt_end = code.find("# ─── POST-PROCESSING: PERSONAL NAME SANITIZER ───")
assert prompt_start != -1 and prompt_end != -1, "Prompt section markers not found"

new_prompts_code = '''# ─── AGENT PROMPT BUILDERS (CATEGORY ISOLATION ENGINE) ──────────────────────

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
    degree_val = degree_type or "Not required"

    if cat == "academic":
        category_rules = f"""=== PRIMARY CATEGORY CONSTRAINTS: ACADEMIC & RESEARCH ===
Definition: Formal education, academic progression, university admissions, curriculum mastery, or academic research development.
- Educational context: Grade/level ({current_position}), curriculum (CBSE, IB, Cambridge, etc.), subjects, prerequisites, target degree, target university, country, test prep (SAT/ACT/IELTS/GRE where relevant), academic projects, research.
- Progression: Academic foundation & subject selection -> prerequisite preparation -> academic performance improvement -> research development -> test preparation -> profile development -> university research & application dossiers.
- Dynamic timeline: Calculate timeline based on educational progression from current stage to target admission.
- Dynamic readiness score: Score (0-100) based on GPA/academic performance relative to target institution selectivity.
- Dynamic step count: Determine genuinely required stages (e.g. 5 to 10 milestones).
"""
    elif cat == "practical":
        category_rules = f"""=== PRIMARY CATEGORY CONSTRAINTS: PRACTICAL & SKILLS ===
Definition: Learning, developing, applying, and demonstrating a practical skill. Skill acquisition and proof of ability (e.g., Python proficiency, Web Dev, Data Analysis, CAD, UI/UX).
- Progression: Core concept foundation -> guided practice & problem solving -> hands-on project building -> advanced application -> portfolio curation (GitHub / live demos) -> skill validation & code review.
- Focus: Hands-on deliverables, repositories, project architecture, and proof of work.
- Dynamic timeline: Typically 3 to 12 months based on beginner vs advanced skill gap.
- Dynamic readiness score: Score (0-100) based on current familiarity vs target skill mastery.
- Dynamic step count: Determine genuinely necessary skill progression stages (typically 4 to 6 milestones).

🚨 STRICT NEGATIVE CONSTRAINTS (FORBIDDEN IN THIS CATEGORY):
- DO NOT generate school selection, GPA targets, Grade 10/11/12 board exams, CBSE/IB curricula, SAT/ACT test prep, university applications, or college admissions dossiers unless the user's specific target goal explicitly demands a degree.
- The focus is on SKILL acquisition and PROOF OF WORK, not formal academic admissions.
"""
    elif cat == "jobs":
        category_rules = f"""=== PRIMARY CATEGORY CONSTRAINTS: JOBS & CAREERS ===
Definition: Entering, changing, progressing, or advancing in a profession or job role (e.g., Junior to Senior Engineer, Career Switcher to Cloud Engineer, Student to Product Manager).
- Progression: Role gap analysis & competency assessment -> skill gap development -> experience building & proof of work -> ATS-optimized resume & professional branding (LinkedIn/GitHub) -> networking & mock interviews -> job search & placement strategy.
- Focus: Workplace competencies, technical & behavioral interviews, system design/case studies, and employer evidence.
- Dynamic timeline: Typically 6 to 18 months based on current role vs target role gap.
- Dynamic readiness score: Score (0-100) based on current experience/competencies vs target role expectations.
- Dynamic step count: Determine genuinely required career progression stages (typically 4 to 7 milestones).

🚨 STRICT NEGATIVE CONSTRAINTS (FORBIDDEN IN THIS CATEGORY):
- DO NOT generate Grade 10/11/12 board exam preparation, school curriculum selection, SAT/ACT prep, or high school targets unless the user's goal explicitly requires an academic degree transition.
- A career progression request from a developer or graduate MUST NOT become a high school / student admissions roadmap.
"""
    else:  # non_academic
        category_rules = f"""=== PRIMARY CATEGORY CONSTRAINTS: NON-ACADEMIC COUNSELLING ===
Definition: Support, guidance, wellbeing, decision-making, life skills, or short-term personal guidance.
Sub-segment Focus: {sub_seg or 'Mental Health & Wellness / Life Skills'}

Guidance by Focus:
1. Mental Health & Wellness: Focus on stress management, trigger identification, daily mindfulness routines, sleep hygiene, healthy coping strategies, trusted support networks, and qualified professional counseling resources.
2. Life Skills & Decision Support: Focus on time management, decision frameworks, prioritization, routine building, habit trackers, and personal accountability.
3. Immediate Guidance & Support: Focus on immediate triage, practical time-boxed next actions, trusted helpline/resource navigation, and safe escalation options.

- Dynamic timeline: Typically 1 to 6 months (time-boxed to immediate needs and sustainable habit formation).
- Dynamic readiness score: Score (0-100) reflecting support readiness, self-awareness, and routine consistency.
- Dynamic step count: Typically 3 to 5 meaningful, empathetic support milestones.

🚨 STRICT NEGATIVE CONSTRAINTS (FORBIDDEN IN THIS CATEGORY):
- DO NOT generate curriculum selection, school selection, GPA targets, SAT/ACT prep, university applications, board exams, internships, or job placement.
- Do NOT promise diagnosis or medical treatment; recommend qualified professional support, safe practices, and trusted resources.
"""

    prompt = f"""You are the Naaviverse Pathway Blueprint Generator (Agent 1).
Your task is to generate a fully custom, category-specific pathway blueprint.

INPUT CONTEXT:
- Category: {cat.upper()} ({focus_title_prefix})
- Sub-Segment / Focus Area: {focus_area or sub_seg or 'Default'}
- Current Position: {current_position}
- Target Goal / Need: {target_goal}
- Degree Type: {degree_val}
- User Profile: {profile_json}

{category_rules}

SCHEMA REQUIREMENTS:
Respond ONLY with valid JSON. No markdown backticks, no text explanation outside JSON.
JSON format must strictly follow:
{{
  "path_title": "<Unique, descriptive path title matching category and goal>",
  "path_description": "<Rich 3-4 sentence strategic overview explaining how this specific pathway guides the user from {current_position} to {target_goal} in the {cat} category>",
  "readiness_score": 25,
  "readiness_label": "Early Starter",
  "total_duration": "<calculated duration string, e.g. '6 months', '12 months', '36 months'>",
  "blind_spots": [
    "<critical gap, constraint, or warning 1 based on profile & goal>",
    "<critical gap, constraint, or warning 2 based on profile & goal>"
  ],
  "steps": [
    {{
      "id": 1,
      "title": "<step/milestone title specific to {cat}>",
      "duration": "<calculated step range, e.g. 'Months 1-3' or 'Weeks 1-4'>",
      "description": "<detailed step description (3-4 comprehensive sentences) outlining exact tasks, focus areas, and why this milestone matters for {target_goal}>",
      "learning_objectives": [
        "<distinct learning objective 1>",
        "<distinct learning objective 2>",
        "<distinct learning objective 3>"
      ],
      "macro_view": "<4-5 sentence strategic paragraph explaining the BIG PICTURE PURPOSE of this milestone within the {cat} roadmap>",
      "micro_view": "<4-5 sentence strategic paragraph describing the PRECISE EXECUTION OUTPUT — tasks, tools, deliverables, time commitment, and verification checkpoints>",
      "nano_view": "<4-5 sentence strategic paragraph outlining the MENTOR/EXPERT GUIDANCE FOCUS — review sessions, validation criteria, accountability, and feedback loops>",
      "marketplace": {{
        "mentors": [
          {{
            "name": "<category-specific mentor or advisor>",
            "type": "Mentor",
            "why": "<why this fits macro free view>",
            "next_step": "<specific action to connect>",
            "tags": ["<tag1>", "<tag2>"],
            "section": "macro_free",
            "price": "Free"
          }},
          {{
            "name": "<structured 1-on-1 coaching or tutor>",
            "type": "Mentor",
            "why": "<why this fits micro view>",
            "next_step": "<how to book>",
            "tags": ["<tag>"],
            "section": "micro_structured",
            "price": "<price, e.g. $89 or Rs 1,500>"
          }},
          {{
            "name": "<premium strategic advisor or expert>",
            "type": "Mentor",
            "why": "<why this fits nano view>",
            "next_step": "<how to apply>",
            "tags": ["<tag>"],
            "section": "nano_expert",
            "price": "<price, e.g. $150 or Rs 5,000>"
          }}
        ],
        "vendors": [
          {{
            "name": "<free course, open docs, or platform>",
            "type": "Course",
            "why": "<why>",
            "next_step": "<action>",
            "tags": ["<tag>"],
            "section": "macro_free",
            "cost": "Free"
          }},
          {{
            "name": "<paid course or structured workshop>",
            "type": "Course",
            "why": "<why>",
            "next_step": "<action>",
            "tags": ["<tag>"],
            "section": "micro_structured",
            "cost": "<cost>"
          }},
          {{
            "name": "<premium intensive bootcamp or specialized program>",
            "type": "Bootcamp",
            "why": "<why>",
            "next_step": "<action>",
            "tags": ["<tag>"],
            "section": "nano_expert",
            "cost": "<cost>"
          }}
        ],
        "institutions": [
          {{
            "name": "<open institutional resource, foundation, or clinic/center>",
            "type": "Institute",
            "why": "<why>",
            "next_step": "<action>",
            "tags": ["<tag>"],
            "section": "macro_free",
            "cost": "Free"
          }},
          {{
            "name": "<structured certificate program or organization>",
            "type": "Institute",
            "why": "<why>",
            "next_step": "<action>",
            "tags": ["<tag>"],
            "section": "micro_structured",
            "cost": "<cost>"
          }},
          {{
            "name": "<premium executive or clinical / university program>",
            "type": "Institute",
            "why": "<why>",
            "next_step": "<action>",
            "tags": ["<tag>"],
            "section": "nano_expert",
            "cost": "<cost>"
          }}
        ],
        "distributors": [
          {{
            "name": "<free guide, docs, podcast, youtube channel, or app>",
            "type": "Resource",
            "why": "<why>",
            "next_step": "<action>",
            "tags": ["<tag>"],
            "section": "macro_free",
            "cost": "Free"
          }},
          {{
            "name": "<handbook, paid book, toolkit, or journal>",
            "type": "Book",
            "why": "<why>",
            "next_step": "<action>",
            "tags": ["<tag>"],
            "section": "micro_structured",
            "cost": "<cost>"
          }},
          {{
            "name": "<professional subscription or advanced resource library>",
            "type": "Subscription",
            "why": "<why>",
            "next_step": "<action>",
            "tags": ["<tag>"],
            "section": "nano_expert",
            "cost": "<cost>"
          }}
        ]
      }},
      "micro_steps": [
        {{"task": "<specific actionable task>", "resource": "<real specific resource>"}},
        {{"task": "<specific actionable task>", "resource": "<real specific resource>"}}
      ]
    }}
  ]
}}

CRITICAL RULES:
1. STRICT CATEGORY ADHERENCE: Generate milestones and resources strictly appropriate for {cat.upper()}.
2. NO GENERIC BOILERPLATE: Every single step must have unique, rich descriptions, distinct learning objectives, and custom Macro/Micro/Nano text.
3. DYNAMIC STEP COUNT: Create genuinely necessary stages based on the goal's real requirements. Do not artificially pad or truncate steps.
4. NAME BAN: NEVER include personal names, personal emails, or personal pronouns in any text fields. Keep all content objective and professional.
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
    return f"""You are the Naaviverse Path Audit Agent (Agent 2).
Your purpose is to validate and refine the overall pathway title, description, readiness score, and blind spots.

CATEGORY CONTEXT: {cat.upper()} ({sub_segment or 'Standard'})
Target Goal / Need: {target_goal}
Current Position: {current_position}
Student Profile: {json.dumps(profile or {{}})}

AUDIT TASKS:
1. Verify "path_title" is clear, accurate, and reflects {cat.upper()} pathway semantics.
2. Verify "path_description" is professional, informative, multi-sentence, and specific to {target_goal}.
3. Validate "readiness_score" (5-95) and "readiness_label" according to {cat.upper()} evaluation criteria.
4. Validate "blind_spots" to highlight 2+ real, actionable constraints.
5. NAME BAN: Ensure NO personal names, emails, or personal pronouns exist in any text.

Output ONLY valid JSON matching:
{{
  "path_title": "<audited and refined Path Title>",
  "path_description": "<audited and refined detailed multi-sentence Path Description>",
  "readiness_score": 25,
  "readiness_label": "Early Starter",
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
    return f"""You are the Naaviverse Steps and Views Audit Agent (Agent 3).
Your purpose is to validate and polish all steps, learning objectives, and Macro/Micro/Nano views.

CATEGORY CONTEXT: {cat.upper()} ({sub_segment or 'Standard'})
Target Goal / Need: {target_goal}
Current Position: {current_position}

AUDIT TASKS:
1. Ensure every step's title, duration, and description strictly belong to {cat.upper()} semantics.
2. PRESERVE DURATION: Keep the exact duration range from blueprint (e.g. 'Months 1-3', 'Weeks 1-4').
3. Verify rich multi-sentence text in 'macro_view' (big picture), 'micro_view' (execution deliverables), and 'nano_view' (expert/mentor validation).
4. Verify 'learning_objectives' and 'micro_steps' are hyper-specific and actionable for {target_goal}.
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
    return f"""You are the Naaviverse Marketplace Audit Agent (Agent 4).
Your purpose is to validate that all learning resource recommendations match {cat.upper()} needs.

CATEGORY CONTEXT: {cat.upper()} ({sub_segment or 'Standard'})
Target Goal / Need: {target_goal}
Current Position: {current_position}

AUDIT TASKS:
1. Verify mentors, vendors, institutions, and distributors are genuinely relevant to {cat.upper()} and the specific step.
   - Academic: Tutors, admissions advisors, test prep, universities, academic books.
   - Practical: Developer mentors, coding sandboxes, project courses (Coursera/freeCodeCamp/Udemy), GitHub, docs.
   - Jobs: Career coaches, mock interviewers, ATS resume reviews, LinkedIn, LeetCode, job boards.
   - Non-Academic: Certified counselors, therapists, mindfulness apps, routine trackers, support groups.
2. Validate realistic costs, action-oriented next steps, and proper section classification (macro_free, micro_structured, nano_expert).
3. CRITICAL STEP PRESERVATION: Return audited marketplace objects for EVERY step in the blueprint.
4. NAME BAN: Ensure NO personal names or emails appear.

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
'''

code = code[:prompt_start] + new_prompts_code + "\n\n" + code[prompt_end:]

# ─── SECTION 2: ENRICH STEP NARRATIVE & ROADMAP NARRATIVES ───
enrich_start = code.find("def enrich_step_narrative(")
enrich_end = code.find("async def log_generation_event(")
assert enrich_start != -1 and enrich_end != -1, "Enrich section markers not found"

new_enrich_code = '''def enrich_step_narrative(step: dict, current: str, goal: str, category: str = "academic") -> dict:
    """Guarantee every roadmap step has detailed view text, even when a model returns one-liners."""
    if not isinstance(step, dict):
        return step

    cat = resolve_focus_category(category)
    title = str(step.get("title") or f"Step {step.get('id', '')}").strip()
    duration = str(step.get("duration") or "this phase").strip()
    existing_description = str(step.get("description") or "").strip()
    source_description = existing_description or f"Complete the planned work for {title}."

    if not is_rich_paragraph(existing_description, min_chars=200, min_sentences=2):
        if cat == "practical":
            step["description"] = (
                f"{source_description} This {duration} milestone focuses on hands-on practical skill acquisition, "
                f"code/design implementation, and creating demonstrable proof of work for {goal}. "
                f"The learner should build functional exercises, review best practices, and document key learnings. "
                f"By the end of this phase, concrete deliverables will validate readiness for more advanced project milestones."
            )
        elif cat == "jobs":
            step["description"] = (
                f"{source_description} This {duration} milestone targets core workplace competencies, role gap closures, "
                f"and professional portfolio building required for {goal}. "
                f"The candidate should practice technical/behavioral requirements, optimize evidence of capability, and engage with industry standards. "
                f"Completion of this phase confirms readiness for hiring and placement opportunities."
            )
        elif cat == "non_academic":
            step["description"] = (
                f"{source_description} This {duration} milestone is designed for personal wellbeing, habit formation, "
                f"and actionable support strategies to address {goal}. "
                f"The individual will establish healthy daily routines, apply coping mechanisms, and connect with trusted support resources. "
                f"By the end of this period, clear progress indicators and sustainable habits will provide steady guidance."
            )
        else:
            step["description"] = (
                f"{source_description} This {duration} milestone defines the exact academic target, evidence of progress, "
                f"and standards required to move forward in the pathway for {goal}. "
                f"The work connects daily study routines, academic preparation, and measurable readiness indicators. "
                f"By the end of the phase, the student will have clear outputs and a documented progression plan."
            )

    if not is_rich_paragraph(step.get("macro_view")):
        if cat == "practical":
            set_view_description(step, "macro_view", (
                f"{title} is a vital milestone because it converts foundational knowledge into tangible technical ability for {goal}. "
                f"During {duration}, this phase develops problem-solving speed, code cleanliness, and system understanding. "
                f"Mastering these skills builds practical confidence and unlocks the next level of project architecture. "
                f"The big-picture outcome is an authentic proof of work demonstrating real-world competency."
            ))
        elif cat == "jobs":
            set_view_description(step, "macro_view", (
                f"{title} represents a key career progression phase aligning existing experience from {current} toward {goal}. "
                f"During {duration}, this milestone closes role capability gaps and refines professional standing. "
                f"Strong execution here creates the credibility required for interviews, evaluations, and role transitions. "
                f"The strategic result is a differentiated candidate profile meeting industry expectations."
            ))
        elif cat == "non_academic":
            set_view_description(step, "macro_view", (
                f"{title} establishes essential emotional and routine foundations to support personal progress toward {goal}. "
                f"During {duration}, this phase reduces overwhelm, clarifies boundaries, and introduces positive coping mechanisms. "
                f"Building these life practices ensures long-term mental resilience and sustainable personal balance. "
                f"The overarching outcome is greater clarity, calmness, and personal empowerment."
            ))
        else:
            set_view_description(step, "macro_view", (
                f"{title} is a strategic milestone turning the ambition of reaching {goal} into concrete academic readiness. "
                f"During {duration}, this phase strengthens subject confidence, transcripts, and long-term preparation habits. "
                f"Completing this step proves the student can meet competitive standards and advance through prerequisites. "
                f"The big-picture outcome is a coherent academic profile matching the expectations of {goal}."
            ))

    if not is_rich_paragraph(step.get("micro_view")):
        if cat == "practical":
            set_view_description(step, "micro_view", (
                f"The execution focus for {title} involves hands-on coding, building modules, and completing sandbox exercises. "
                f"The learner should maintain a repository, track commits, test edge cases, and document technical notes. "
                f"Dedicate 4 to 8 focused hours per week to code implementation and debugging practice. "
                f"Completion is verified when functional code runs cleanly and is pushed with clear documentation."
            ))
        elif cat == "jobs":
            set_view_description(step, "micro_view", (
                f"Execution for {title} converts role requirements into concrete deliverables, resume updates, and interview prep. "
                f"The candidate should complete case studies, system design problems, or portfolio documentation weekly. "
                f"Reserve dedicated time for mock question drills, ATS keyword optimization, and professional outreach. "
                f"Completion is measured by tangible artifacts: verified code repos, polished work samples, or recorded mock sessions."
            ))
        elif cat == "non_academic":
            set_view_description(step, "micro_view", (
                f"Daily execution for {title} centers on habit tracking, structured journaling, and routine adherence. "
                f"Reserve 15 to 30 minutes daily for mindfulness, sleep scheduling, or task prioritization exercises. "
                f"Maintain a simple tracker in a journal or app to record stress triggers, moods, and routine completions. "
                f"Completion is validated when daily wellness routines are maintained consistently throughout the phase."
            ))
        else:
            set_view_description(step, "micro_view", (
                f"The execution focus for {title} is converted into weekly study blocks, chapter mastery, and mock tests. "
                f"The student should maintain a structured planner with revision targets, formula sheets, and practice scores. "
                f"At least two to three focused study sessions per week should be dedicated to core curriculum chapters. "
                f"Completion is measured through reviewed mock exams, syllabus coverage checks, and diagnostic logs."
            ))

    if not is_rich_paragraph(step.get("nano_view")):
        if cat == "practical":
            set_view_description(step, "nano_view", (
                f"The mentor focus for {title} centers on code review, architecture feedback, and technical diagnostic checks. "
                f"A senior developer or mentor should review project structure, identify antipatterns, and suggest optimizations. "
                f"Engage with developer communities to compare solutions, receive peer critiques, and fix code smells. "
                f"The phase concludes with a code review sign-off validating that project standards have been achieved."
            ))
        elif cat == "jobs":
            set_view_description(step, "nano_view", (
                f"The mentor focus for {title} is strategic career advisory, mock interview evaluations, and portfolio critiques. "
                f"An industry specialist or hiring manager should review competency evidence and pressure-test interview responses. "
                f"Seek constructive feedback on communication clarity, technical depth, and executive presence. "
                f"The phase wraps up with an expert assessment confirming role readiness for the next milestone."
            ))
        elif cat == "non_academic":
            set_view_description(step, "nano_view", (
                f"The guidance focus for {title} involves supportive check-ins, routine accountability, and qualified advisor feedback. "
                f"A life coach, counselor, or trusted peer should review progress logs, discuss obstacles, and calibrate coping strategies. "
                f"Utilize safe feedback loops to celebrate consistency, adjust routines, and identify when additional care is beneficial. "
                f"The phase closes with a supportive reflection session affirming personal growth and readiness to continue."
            ))
        else:
            set_view_description(step, "nano_view", (
                f"The mentor focus for {title} is diagnostic, evidence-based, and tied to prerequisite milestone readiness. "
                f"An academic counselor or subject tutor should review test performance, analyze weak topics, and address curriculum risks. "
                f"Peer cohort study sessions are encouraged to compare problem-solving approaches and maintain motivation. "
                f"The phase closes with mentor feedback confirming the student is prepared for subsequent academic stages."
            ))

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
'''

code = code[:enrich_start] + new_enrich_code + "\n\n" + code[enrich_end:]

# ─── SECTION 3: DEGREE TYPE & DURATION REPLACEMENT ───
degree_start = code.find("def ensure_degree_type_for_generation(")
duration_end = code.find("CONTENT_SEGMENTS = [")
assert degree_start != -1 and duration_end != -1, "Degree & Duration section markers not found"

new_degree_duration_code = '''def ensure_degree_type_for_generation(goal: str, profile: dict, explicit_degree_type: Optional[str] = None, category: str = "academic") -> dict:
    cat = resolve_focus_category(category)
    enriched_profile = dict(profile or {})
    degree_type = get_request_degree_type(goal, profile, explicit_degree_type)
    if degree_type:
        enriched_profile["degreeType"] = degree_type
    elif cat == "academic":
        enriched_profile["degreeType"] = "Bachelor's"
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


def calculate_total_duration_months(
    current: str,
    goal: str,
    profile: dict,
    explicit_degree_type: Optional[str] = None,
    category: str = "academic",
    sub_segment: Optional[str] = None
) -> int:
    cat = resolve_focus_category(category)
    curr_lower = (current or "").lower()
    goal_lower = (goal or "").lower()

    # 1. Practical & Skills Duration (3 to 12 months)
    if cat == "practical":
        if any(k in curr_lower for k in ["beginner", "zero", "starter", "novice", "no experience"]):
            return 8
        elif any(k in curr_lower for k in ["intermediate", "basic", "learner"]):
            return 6
        elif any(k in curr_lower for k in ["advanced", "experienced"]):
            return 4
        return 6

    # 2. Jobs & Careers Duration (6 to 18 months)
    elif cat == "jobs":
        if "senior" in goal_lower and any(k in curr_lower for k in ["junior", "entry", "student", "intern"]):
            return 12
        elif any(k in curr_lower for k in ["career switch", "transition", "non-tech"]):
            return 12
        elif any(k in goal_lower for k in ["lead", "manager", "director"]):
            return 12
        return 6

    # 3. Non-Academic Counselling Duration (1 to 6 months)
    elif cat == "non_academic":
        sub_lower = (sub_segment or "").lower()
        if "immediate" in sub_lower or "immediate" in goal_lower:
            return 2
        elif "life" in sub_lower or "habit" in goal_lower or "decision" in goal_lower:
            return 3
        return 3

    # 4. Academic & Research Duration (Cumulative Academic Progression)
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
        
    num_match = re.search(r'\\b(9|10|11|12)\\b', current_str)
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
        remaining_current_months = duration_months_for_level(current_level) // 2
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
'''

code = code[:degree_start] + new_degree_duration_code + "\n\n" + code[duration_end:]

# ─── SECTION 4: MOCK MARKETPLACE & CUSTOMIZE STEPS ───
market_start = code.find("def get_mock_marketplace(")
metrics_start = code.find("def calculate_path_metrics(")
assert market_start != -1 and metrics_start != -1, "Marketplace section markers not found"

new_marketplace_code = '''def get_mock_marketplace(
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
'''

code = code[:market_start] + new_marketplace_code + "\n\n" + code[metrics_start:]

# ─── SECTION 5: CALCULATE PATH METRICS ───
metrics_start = code.find("def calculate_path_metrics(")
accuracy_start = code.find("def calculate_path_accuracy_score(")
assert metrics_start != -1 and accuracy_start != -1, "Metrics section markers not found"

new_metrics_code = '''def calculate_path_metrics(
    current: str,
    goal: str,
    profile: dict,
    path_type: str = "Academic & Research",
    sub_segment: Optional[str] = None
) -> dict:
    path_category = resolve_focus_category(path_type)
    total_months = calculate_total_duration_months(current, goal, profile, category=path_category, sub_segment=sub_segment)
    total_duration = format_total_duration(total_months)

    goal_lower = (goal or "").lower()
    perf_str = str((profile or {}).get("performance") or "").lower()
    if any(k in perf_str for k in ["90", "above 90", "excellent", "gpa 4", "a+", "top"]):
        perf_cat = "high"
    elif any(k in perf_str for k in ["75", "80", "85", "good", "average"]):
        perf_cat = "medium"
    else:
        perf_cat = "low"

    stream_str = str((profile or {}).get("stream") or "").lower()
    curriculum_str = str((profile or {}).get("curriculum") or "").lower()
    personality_str = str((profile or {}).get("personality") or "").lower()
    financial_str = str((profile or {}).get("financialSituation") or "").lower()

    if path_category == "academic":
        base_score = {"high": 55, "medium": 35, "low": 20}.get(perf_cat, 20)
        if any(k in curriculum_str for k in ["cbse", "ib", "igcse", "cambridge", "icse"]):
            base_score += 10
        if any(k in stream_str for k in ["science", "maths", "math", "commerce"]):
            base_score += 8
        if any(kw in goal_lower for kw in ["harvard", "yale", "stanford", "mit", "oxford", "cambridge", "iit", "bits"]):
            base_score = int(base_score * 0.75)
    elif path_category == "practical":
        base_score = {"high": 50, "medium": 40, "low": 30}.get(perf_cat, 30)
        if any(k in personality_str for k in ["practical", "hands-on", "builder", "maker", "curious"]):
            base_score += 12
        if any(k in goal_lower for k in ["developer", "software", "python", "web", "data", "ai", "cloud"]):
            base_score += 8
    elif path_category == "jobs":
        base_score = {"high": 45, "medium": 35, "low": 25}.get(perf_cat, 25)
        if any(k in personality_str for k in ["leader", "communication", "team", "social", "enterprising"]):
            base_score += 10
        if any(k in current.lower() for k in ["developer", "engineer", "analyst", "intern", "associate"]):
            base_score += 10
    else:  # non_academic
        base_score = 40
        if any(k in personality_str for k in ["open", "reflective", "self-aware", "determined"]):
            base_score += 12
        if any(k in financial_str for k in ["stable", "supported", "family"]):
            base_score += 8

    readiness_score = max(5, min(95, base_score))
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
'''

code = code[:metrics_start] + new_metrics_code + "\n\n" + code[accuracy_start:]

# ─── SECTION 6: FALLBACK GENERATION REPLACEMENT ───
fallback_start = code.find("def get_fallback_mock_roadmap(")
scale_start = code.find("def scale_blueprint_steps(")
assert fallback_start != -1 and scale_start != -1, "Fallback section markers not found"

new_fallback_code = '''def get_academic_fallback(current: str, goal: str, profile: dict, focus: Optional[str] = None) -> dict:
    total_months = calculate_total_duration_months(current, goal, profile, category="academic")
    return {
        "path_title": f"Academic & Research Pathway to {goal}",
        "path_description": f"A structured academic pathway navigating formal education requirements, curriculum excellence, and admissions milestones toward {goal}.",
        "readiness_score": 35,
        "readiness_label": "Early Starter",
        "total_duration": format_total_duration(total_months),
        "blind_spots": ["Requires strong GPA consistency across all terms", "Must schedule standardized tests well in advance of application deadlines"],
        "steps": [
            {
                "id": 1,
                "title": "Curriculum Alignment & Academic Target Setup",
                "duration": "Months 1-3",
                "description": f"Establish core academic targets, choose key subject combinations, and map prerequisite coursework for {goal}.",
                "learning_objectives": ["Map prerequisite subjects", "Set minimum 90%+ academic GPA targets", "Identify core academic advisors"],
                "macro_view": "This foundational milestone establishes academic rigor and transcript strength necessary for competitive admissions.",
                "micro_view": "Review term syllabus, set weekly study blocks in Notion, and take initial diagnostic subject assessments.",
                "nano_view": "Conduct diagnostic review with an academic counselor to flag curriculum gaps.",
                "marketplace": get_mock_marketplace(focus, "Curriculum Alignment", 1, goal, category="academic"),
                "micro_steps": [{"task": "Review prerequisite subject criteria", "resource": "Official Curriculum Guide"}]
            },
            {
                "id": 2,
                "title": "Academic Rigor & Diagnostic Standardized Prep",
                "duration": "Months 4-6",
                "description": "Maintain high term GPA performance and initiate diagnostic prep for standardized admissions exams where applicable.",
                "learning_objectives": ["Complete baseline test diagnostics", "Target weak concept areas", "Maintain top 10% class standing"],
                "macro_view": "Strengthen academic indicators that serve as prerequisites for international or national admissions.",
                "micro_view": "Take 2 full-length diagnostic exams, analyze error logs, and dedicate 6 hours weekly to test problem solving.",
                "nano_view": "Review diagnostic score reports with a test prep specialist to build a tailored study schedule.",
                "marketplace": get_mock_marketplace(focus, "Diagnostic Prep", 2, goal, category="academic"),
                "micro_steps": [{"task": "Complete diagnostic test sitting", "resource": "Official Practice Portal"}]
            },
            {
                "id": 3,
                "title": "Academic Projects & Profile Differentiation",
                "duration": "Months 7-9",
                "description": "Engage in specialized academic research projects, honors papers, or extracurricular competitions relevant to target field.",
                "learning_objectives": ["Author a research paper or project draft", "Participate in academic seminars", "Secure faculty advisor support"],
                "macro_view": "Differentiate the student profile through genuine academic curiosity and demonstrable scholarly work.",
                "micro_view": "Draft a 10-page research paper outline, conduct literature reviews, and submit to student symposiums.",
                "nano_view": "Subject mentor reviews methodology and citations before final paper submission.",
                "marketplace": get_mock_marketplace(focus, "Academic Projects", 3, goal, category="academic"),
                "micro_steps": [{"task": "Draft research paper outline", "resource": "Academic Research Guide"}]
            },
            {
                "id": 4,
                "title": "Target Institution Selection & Admissions Dossier",
                "duration": "Months 10-12",
                "description": f"Finalize target university list, draft personal statements, secure letters of recommendation, and submit dossiers for {goal}.",
                "learning_objectives": ["Finalize 8-10 balanced institution choices", "Complete personal statement drafts", "Submit complete application dossiers"],
                "macro_view": "Convert academic preparation and profile rigor into successful admissions outcomes.",
                "micro_view": "Submit all application portals, draft supplementary essays, and compile financial/visa documentation.",
                "nano_view": "Admissions counselor line-by-line review of essays and application materials.",
                "marketplace": get_mock_marketplace(focus, "Admissions Dossier", 4, goal, category="academic"),
                "micro_steps": [{"task": "Submit application dossiers", "resource": "Admissions Portals"}]
            }
        ]
    }


def get_practical_fallback(current: str, goal: str, profile: dict, focus: Optional[str] = None) -> dict:
    total_months = calculate_total_duration_months(current, goal, profile, category="practical")
    return {
        "path_title": f"Practical & Skills Pathway: {goal}",
        "path_description": f"A project-driven, practical skill-building pathway to master core technologies, build real-world software/tools, and showcase an exceptional portfolio for {goal}.",
        "readiness_score": 40,
        "readiness_label": "Early Starter",
        "total_duration": format_total_duration(total_months),
        "blind_spots": ["Need to maintain consistent daily coding habits", "Ensure portfolio projects have live deployed demos and clean documentation"],
        "steps": [
            {
                "id": 1,
                "title": "Core Foundations & Sandbox Environment Setup",
                "duration": "Months 1-2",
                "description": f"Master fundamental syntax, algorithms, and core architecture principles required for {goal}.",
                "learning_objectives": ["Master core language syntax and tools", "Set up professional Git/GitHub workflow", "Complete 20+ algorithmic exercises"],
                "macro_view": "Building an unshakable technical foundation ensures rapid progress when tackling complex projects.",
                "micro_view": "Complete freeCodeCamp/Coursera modules, solve 5 coding exercises weekly, and push clean code to GitHub.",
                "nano_view": "Senior developer reviews initial repository setup and code style compliance.",
                "marketplace": get_mock_marketplace(focus, "Core Foundations", 1, goal, category="practical"),
                "micro_steps": [{"task": "Set up GitHub repository and dev environment", "resource": "Official Documentation"}]
            },
            {
                "id": 2,
                "title": "Hands-on Project Development & Module Building",
                "duration": "Months 3-4",
                "description": "Design and build 2 end-to-end practical projects implementing industry-standard design patterns and clean architecture.",
                "learning_objectives": ["Build functional full-stack/standalone application", "Implement robust error handling and tests", "Deploy project to cloud hosting"],
                "macro_view": "Applied project building transforms theoretical understanding into demonstrable proof of capability.",
                "micro_view": "Build a modular application with API endpoints, automated unit tests, and live cloud deployment on Vercel/AWS.",
                "nano_view": "Conduct an architectural code review with an experienced engineer to eliminate antipatterns.",
                "marketplace": get_mock_marketplace(focus, "Project Development", 2, goal, category="practical"),
                "micro_steps": [{"task": "Build and deploy capstone project 1", "resource": "GitHub & Cloud Sandbox"}]
            },
            {
                "id": 3,
                "title": "Advanced Applications & Open Source Contributions",
                "duration": "Months 5-6",
                "description": "Tackle advanced optimizations, contribute to existing open-source codebases, and write technical documentation.",
                "learning_objectives": ["Submit 2+ open source pull requests", "Optimize application performance and latency", "Write technical architecture breakdown"],
                "macro_view": "Collaborating on complex codebases validates professional engineering standards and teamwork ability.",
                "micro_view": "Profile memory and performance bottlenecks, refactor complex modules, and write a comprehensive project README.",
                "nano_view": "Open source maintainer or senior peer review of submitted pull requests.",
                "marketplace": get_mock_marketplace(focus, "Advanced Applications", 3, goal, category="practical"),
                "micro_steps": [{"task": "Submit pull request to open-source repository", "resource": "GitHub Community"}]
            },
            {
                "id": 4,
                "title": "Portfolio Showcase & Proof-of-Work Validation",
                "duration": "Months 7-8",
                "description": f"Curate a professional developer portfolio website showcasing live demos, code repositories, and technical writing for {goal}.",
                "learning_objectives": ["Deploy high-impact developer portfolio", "Create video walkthroughs of key projects", "Pass peer technical code review"],
                "macro_view": "A verified portfolio serves as undeniable evidence of practical competence.",
                "micro_view": "Launch portfolio site, record 3-minute video walkthroughs, and publish technical case studies.",
                "nano_view": "Principal engineer audit of complete portfolio and GitHub presence.",
                "marketplace": get_mock_marketplace(focus, "Portfolio Showcase", 4, goal, category="practical"),
                "micro_steps": [{"task": "Launch portfolio website with live demos", "resource": "Developer Portfolio"}]
            }
        ]
    }


def get_jobs_fallback(current: str, goal: str, profile: dict, focus: Optional[str] = None) -> dict:
    total_months = calculate_total_duration_months(current, goal, profile, category="jobs")
    return {
        "path_title": f"Jobs & Careers Pathway: {goal}",
        "path_description": f"A targeted career transition and job readiness pathway focusing on role competency, ATS resume evidence, networking, and interview mastery for {goal}.",
        "readiness_score": 45,
        "readiness_label": "Intermediate Starter",
        "total_duration": format_total_duration(total_months),
        "blind_spots": ["Need to tailor resume achievements with quantifiable metrics (STAR format)", "Schedule weekly mock interviews to build communication confidence"],
        "steps": [
            {
                "id": 1,
                "title": "Role Competency & Skill-Gap Analysis",
                "duration": "Months 1-2",
                "description": f"Analyze current qualifications against hiring benchmarks for {goal} to identify key technical and soft-skill gaps.",
                "learning_objectives": ["Benchmark 15+ job descriptions for target role", "Identify top 3 competency gaps", "Build structured 6-month closing plan"],
                "macro_view": "Targeted gap analysis prevents wasted effort by focusing purely on employer-demanded skills.",
                "micro_view": "Compile a matrix of required competencies, complete technical self-assessments, and draft development goals.",
                "nano_view": "Career coach review of competency matrix to align targets with realistic market demand.",
                "marketplace": get_mock_marketplace(focus, "Competency Analysis", 1, goal, category="jobs"),
                "micro_steps": [{"task": "Compile target role competency matrix", "resource": "Job Market Data"}]
            },
            {
                "id": 2,
                "title": "Workplace Proof of Work & Technical Evidence",
                "duration": "Months 3-4",
                "description": "Construct high-impact work samples, case studies, and technical artifacts proving readiness for target responsibilities.",
                "learning_objectives": ["Complete 2 enterprise-grade case studies", "Document measurable business/technical outcomes", "Publish case studies publicly"],
                "macro_view": "Demonstrable workplace outputs make candidates stand out immediately to recruiters.",
                "micro_view": "Develop end-to-end case studies detailing problem statement, architectural choices, and quantifiable impact.",
                "nano_view": "Industry hiring manager review of case study relevance and technical depth.",
                "marketplace": get_mock_marketplace(focus, "Proof of Work", 2, goal, category="jobs"),
                "micro_steps": [{"task": "Complete enterprise case study", "resource": "Case Study Framework"}]
            },
            {
                "id": 3,
                "title": "ATS Resume, LinkedIn & Professional Branding",
                "duration": "Months 5-6",
                "description": "Optimize resume with quantifiable impact metrics, align LinkedIn headline and experience, and build professional presence.",
                "learning_objectives": ["Achieve 85%+ score on ATS resume scanners", "Optimize LinkedIn for recruiter search keywords", "Create targeted outreach list"],
                "macro_view": "Optimized branding ensures inbound recruiter visibility and high application-to-interview conversion rates.",
                "micro_view": "Rewrite resume bullet points using XYZ format ('Accomplished [X] as measured by [Y], by doing [Z]'), update LinkedIn profile, and connect with 20 industry peers.",
                "nano_view": "HR recruiter line-by-line review of resume ATS compliance and executive presence.",
                "marketplace": get_mock_marketplace(focus, "ATS Resume", 3, goal, category="jobs"),
                "micro_steps": [{"task": "Optimize resume and run ATS diagnostic", "resource": "ATS Resume Builder"}]
            },
            {
                "id": 4,
                "title": "Mock Interviews, Networking & Job Placement",
                "duration": "Months 7-8",
                "description": f"Conduct intensive technical and behavioral mock interview simulations, leverage networking referrals, and secure offer for {goal}.",
                "learning_objectives": ["Complete 5+ realistic mock interviews", "Execute warm referral outreach campaign", "Master offer negotiation strategies"],
                "macro_view": "Mastering the interview loop and salary negotiation unlocks optimal career placement.",
                "micro_view": "Complete 3 technical mock loops, practice behavioral STAR responses, and apply to 10 target companies weekly via referrals.",
                "nano_view": "Senior interviewer mock simulation with detailed scoring rubric and negotiation coaching.",
                "marketplace": get_mock_marketplace(focus, "Mock Interviews", 4, goal, category="jobs"),
                "micro_steps": [{"task": "Complete full mock interview simulation", "resource": "Mock Interview Platform"}]
            }
        ]
    }


def get_non_academic_fallback(current: str, goal: str, profile: dict, focus: Optional[str] = None, sub_segment: Optional[str] = None) -> dict:
    total_months = calculate_total_duration_months(current, goal, profile, category="non_academic", sub_segment=sub_segment)
    sub_lower = (sub_segment or "").lower()

    if "life" in sub_lower or "decision" in goal.lower():
        return {
            "path_title": f"Life Skills & Decision Support: {goal}",
            "path_description": f"A practical, structured personal development plan to build daily routines, master time management, and establish clear decision-making frameworks for {goal}.",
            "readiness_score": 45,
            "readiness_label": "Intermediate Starter",
            "total_duration": format_total_duration(total_months),
            "blind_spots": ["Avoid over-committing to too many changes at once; focus on 1-2 habit anchors", "Schedule regular weekly reflection check-ins to maintain consistency"],
            "steps": [
                {
                    "id": 1,
                    "title": "Current Routine & Time-Audit Assessment",
                    "duration": "Weeks 1-3",
                    "description": "Log daily activities, identify energy drains and time leaks, and establish clear priorities for personal balance.",
                    "learning_objectives": ["Track 7-day time allocation", "Identify top 3 productivity bottlenecks", "Define personal non-negotiables"],
                    "macro_view": "Understanding current baseline habits is the prerequisite for sustainable lifestyle adjustments.",
                    "micro_view": "Log hourly activities in a journal or app, categorize high vs low value time, and set up a weekly planner.",
                    "nano_view": "Productivity advisor reviews time logs to help establish realistic habit anchors.",
                    "marketplace": get_mock_marketplace(focus, "Routine Assessment", 1, goal, category="non_academic", sub_segment=sub_segment),
                    "micro_steps": [{"task": "Complete 7-day time audit log", "resource": "Notion Time Tracker"}]
                },
                {
                    "id": 2,
                    "title": "Structured Daily Habits & Decision Frameworks",
                    "duration": "Weeks 4-7",
                    "description": "Implement morning/evening routines, prioritize tasks using the Eisenhower Matrix, and apply decision-making checklists.",
                    "learning_objectives": ["Establish consistent morning/evening routine", "Apply task prioritization matrix daily", "Build weekly review habit"],
                    "macro_view": "Consistent daily frameworks eliminate decision fatigue and build reliable self-discipline.",
                    "micro_view": "Follow fixed morning routine for 21 consecutive days, plan daily top 3 priorities, and conduct Sunday reviews.",
                    "nano_view": "Life coach check-in to calibrate habit friction and troubleshoot routine disruptions.",
                    "marketplace": get_mock_marketplace(focus, "Decision Frameworks", 2, goal, category="non_academic", sub_segment=sub_segment),
                    "micro_steps": [{"task": "Set up daily top-3 task prioritization system", "resource": "Habit Tracker"}]
                },
                {
                    "id": 3,
                    "title": "Long-term Autonomy & Sustainable Habit Review",
                    "duration": "Weeks 8-12",
                    "description": "Review progress metrics, celebrate habit consistency, and establish an autonomous ongoing growth rhythm.",
                    "learning_objectives": ["Review 90-day habit adherence score", "Automate weekly life planning reviews", "Establish ongoing accountability system"],
                    "macro_view": "Transitioning from guided coaching to self-sustaining personal autonomy ensures lifelong balance.",
                    "micro_view": "Review habit completion logs, refine quarterly goals, and maintain monthly peer check-ins.",
                    "nano_view": "Final reflective session with coach to celebrate wins and set long-term autonomy targets.",
                    "marketplace": get_mock_marketplace(focus, "Habit Review", 3, goal, category="non_academic", sub_segment=sub_segment),
                    "micro_steps": [{"task": "Complete 90-day progress and habit evaluation", "resource": "Personal Growth Review"}]
                }
            ]
        }
    else:  # Mental Health & Wellness / Immediate Guidance
        return {
            "path_title": f"Mental Health & Wellness Plan: {goal}",
            "path_description": f"A compassionate, evidence-based wellness roadmap designed to identify stress triggers, introduce restorative daily routines, and establish trusted support networks for {goal}.",
            "readiness_score": 40,
            "readiness_label": "Early Starter",
            "total_duration": format_total_duration(total_months),
            "blind_spots": ["Do not attempt to fix everything overnight; focus on gentle, steady daily practices", "Reach out to qualified professionals whenever stress feels overwhelming"],
            "steps": [
                {
                    "id": 1,
                    "title": "Stress Triggers & Current Wellbeing Assessment",
                    "duration": "Weeks 1-3",
                    "description": "Identify root stressors, emotional triggers, and physical tension patterns to build personal self-awareness.",
                    "learning_objectives": ["Map primary stress triggers and patterns", "Establish a safe personal decompression space", "Identify trusted support contacts"],
                    "macro_view": "Recognizing personal triggers without judgment is the first empowering step toward emotional balance.",
                    "micro_view": "Complete a 5-minute daily mood log, note situations that elevate anxiety, and list 3 grounding activities.",
                    "nano_view": "Supportive intake conversation with a counselor or mentor to review wellbeing indicators.",
                    "marketplace": get_mock_marketplace(focus, "Wellbeing Assessment", 1, goal, category="non_academic", sub_segment=sub_segment),
                    "micro_steps": [{"task": "Complete daily mood and trigger reflection", "resource": "Mood Journal"}]
                },
                {
                    "id": 2,
                    "title": "Daily Mindfulness Routines & Sleep Hygiene",
                    "duration": "Weeks 4-7",
                    "description": "Introduce restorative 10-minute daily mindfulness exercises, sleep consistency routines, and digital detox boundaries.",
                    "learning_objectives": ["Practice daily 10-minute breathwork/mindfulness", "Establish 8-hour sleep hygiene schedule", "Set healthy screen time boundaries"],
                    "macro_view": "Physical nervous system regulation and restful sleep create the foundation for mental resilience.",
                    "micro_view": "Listen to guided audio meditations before bed, stop screens 45 minutes before sleep, and practice 4-7-8 breathing.",
                    "nano_view": "Check in with a wellness coach or peer circle to share progress and receive encouragement.",
                    "marketplace": get_mock_marketplace(focus, "Mindfulness Routines", 2, goal, category="non_academic", sub_segment=sub_segment),
                    "micro_steps": [{"task": "Complete 10-minute mindfulness practice daily", "resource": "Headspace / Calm"}]
                },
                {
                    "id": 3,
                    "title": "Healthy Coping Strategies & Sustainable Balance",
                    "duration": "Weeks 8-12",
                    "description": f"Solidify actionable coping strategies for exam/work pressure, build regular exercise habits, and sustain emotional wellness for {goal}.",
                    "learning_objectives": ["Apply coping strategies during high-stress moments", "Maintain supportive peer connections", "Establish ongoing wellness check-ins"],
                    "macro_view": "Embedding positive coping mechanisms transforms temporary relief into permanent personal strength.",
                    "micro_view": "Maintain weekly reflection sessions, engage in restorative hobbies, and keep support contacts accessible.",
                    "nano_view": "Licensed counselor or therapist review of coping toolbox and long-term care continuity.",
                    "marketplace": get_mock_marketplace(focus, "Sustainable Balance", 3, goal, category="non_academic", sub_segment=sub_segment),
                    "micro_steps": [{"task": "Finalize personal stress-response action plan", "resource": "Wellness Plan"}]
                }
            ]
        }


def get_fallback_mock_roadmap(
    current: str,
    goal: str,
    profile: dict,
    refine_prompt: Optional[str] = None,
    focus: Optional[str] = None,
    category: Optional[str] = None,
    sub_segment: Optional[str] = None
) -> dict:
    cat = resolve_focus_category(category or focus)
    if cat == "practical":
        return get_practical_fallback(current, goal, profile, focus)
    elif cat == "jobs":
        return get_jobs_fallback(current, goal, profile, focus)
    elif cat == "non_academic":
        return get_non_academic_fallback(current, goal, profile, focus, sub_segment)
    else:
        return get_academic_fallback(current, goal, profile, focus)
'''

code = code[:fallback_start] + new_fallback_code + "\n\n" + code[scale_start:]

# ─── SECTION 7: SEMANTIC VALIDATION & IS_COMPLETE_BLUEPRINT ───
validation_insertion = '''# ─── CATEGORY SEMANTIC VALIDATION ──────────────────────────────────────────
def validate_category_semantics(blueprint: Any, category: str, sub_segment: Optional[str] = None) -> tuple[bool, str]:
    """Validates structural and semantic validity according to agent_flow.md rules."""
    if not isinstance(blueprint, dict) or blueprint.get("error"):
        return False, "Blueprint is empty or returned an error."

    steps = blueprint.get("steps")
    if not isinstance(steps, list) or len(steps) < 2:
        return False, f"Blueprint must contain at least 2 structured steps (received {len(steps) if isinstance(steps, list) else 0})."

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
'''

min_steps_start = code.find("def minimum_blueprint_steps(")
assert min_steps_start != -1, "minimum_blueprint_steps not found"

new_is_complete_code = validation_insertion + '''\ndef minimum_blueprint_steps(current: str, goal: str, profile: dict, category: str = "academic") -> int:
    cat = resolve_focus_category(category)
    if cat == "non_academic":
        return 3
    elif cat in ["practical", "jobs"]:
        return 4
    return 4


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
    
    if requested_steps:
        return len(milestones) == requested_steps

    required_min = minimum_blueprint_steps(current, goal, profile, category)
    return len(milestones) >= required_min
'''

code = code[:min_steps_start] + new_is_complete_code + "\n\n" + code[code.find("def sse_payload("):]

# ─── SECTION 8: RUN AGENT 1, 2, 3, 4 UPDATE ───
agent1_start = code.find("async def run_agent_1_blueprint(")
agent_end = code.find("def build_agent_statuses(")
assert agent1_start != -1 and agent_end != -1, "Agent execution section markers not found"

new_agent_code = '''async def run_agent_1_blueprint(
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
    if refine_prompt:
        match_steps = re.search(r'(\\d+)\\s*(?:step|milestone)', refine_prompt.lower())
        if match_steps:
            try:
                requested_steps = int(match_steps.group(1))
                if requested_steps < 1:
                    requested_steps = 1
            except Exception:
                pass

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
        prompt += f"\\n\\n🚨 STRATEGIC FOCUS DIRECTION: Structure this pathway according to: \\"{focus}\\".\\nEnsure all milestone titles, descriptions, and learning views reflect this focus."

    if refine_prompt:
        prompt += f"\\n\\n==================================================\\nCRITICAL USER REQUEST FOR REFINE / ADJUSTMENT:\\n👉 \\"{refine_prompt}\\"\\n==================================================\\n"
        if requested_steps:
            prompt += f"\\n🚨 CRITICAL ENFORCEMENT: Output EXACTLY {requested_steps} distinct step objects inside 'steps'."
        if existing_roadmap:
            raw_roadmap = existing_roadmap.get("roadmap_data") or existing_roadmap
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
            prompt += f"\\nEXISTING ROADMAP (preserve unedited steps):\\n{json.dumps(compressed_roadmap, indent=2)}\\n"

    feedback_items = []
    try:
        feedback_items = await get_relevant_admin_feedback(goal, profile)
        if feedback_items:
            feedback_str = "\\n\\n==================================================\\n🚨 PAST EXPERT ADMIN GUIDANCE:\\n"
            for item in feedback_items:
                feedback_str += f"- [{item['category'].upper()}]: \\"{item['feedback_text']}\\"\\n"
            feedback_str += "==================================================\\n"
            prompt += feedback_str
    except Exception as e:
        print(f"[Feedback Learning Warning] {e}")

    print(f"[Agent 1] Generating roadmap blueprint (cat: {cat}, focus: {focus or 'default'}) using 70B...")

    # Generation loop with semantic validation & auto-regeneration
    res = None
    for attempt in range(2):
        current_prompt = prompt
        if attempt > 0:
            current_prompt += f"\\n\\n🚨 PREVIOUS GENERATION CORRECTION: The previous response contained cross-category artifacts. You MUST output a pure {cat.upper()} roadmap focusing strictly on {focus_area}. STRICTLY OBEY NEGATIVE CONSTRAINTS."

        res = await query_groq_json(
            current_prompt,
            preferred_model="llama-3.3-70b-versatile",
            fallback_models=["llama-3.1-8b-instant"],
        )

        # Check semantic validity
        is_valid, reason = validate_category_semantics(res, cat, sub_segment)
        if is_valid:
            break
        print(f"[Agent 1 Semantic Validation Warning] Attempt {attempt + 1} rejected: {reason}. Retrying...")

    if requested_steps and is_complete_blueprint(res, current, goal, profile, requested_steps, category=cat):
        res = scale_blueprint_steps(res, requested_steps)

    if not is_complete_blueprint(res, current, goal, profile, requested_steps, category=cat):
        received_steps = len(res.get("steps", [])) if isinstance(res, dict) else 0
        print(f"[Blueprint Validation] Incomplete blueprint ({received_steps} steps). Using category-native fallback for {cat}.")
        fallback = get_fallback_mock_roadmap(current, goal, profile, refine_prompt, focus, category=cat, sub_segment=sub_segment)
        fallback["admin_feedback_memory"] = build_admin_feedback_memory(feedback_items, applied_to_prompt=bool(feedback_items), fallback_used=True)
        return fallback

    res["admin_feedback_memory"] = build_admin_feedback_memory(feedback_items, applied_to_prompt=bool(feedback_items), fallback_used=False)
    return res


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
        preferred_model="llama-3.1-8b-instant",
        fallback_models=["llama-3.3-70b-versatile"]
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
        preferred_model="llama-3.1-8b-instant",
        fallback_models=["llama-3.3-70b-versatile"]
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
        preferred_model="llama-3.1-8b-instant",
        fallback_models=["llama-3.3-70b-versatile"]
    )
    if isinstance(res, list):
        return res
    return blueprint.get("steps", [])
'''

code = code[:agent1_start] + new_agent_code + "\n\n" + code[agent_end:]

# ─── SECTION 9: BUILD AND STORE FINAL PATH UPDATE ───
store_start = code.find("async def build_and_store_final_path(")
store_end = code.find("# ─── API ENDPOINTS ───")
assert store_start != -1 and store_end != -1, "Store final path markers not found"

new_store_code = '''async def build_and_store_final_path(
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
    try:
        total_months = int(metrics["total_duration"].split()[0])
    except Exception:
        pass

    for i, orig_milestone in enumerate(blueprint_milestones):
        m_id = orig_milestone.get("id", i + 1)
        
        if num_steps > 0:
            start_month = int((i / num_steps) * total_months) + 1
            end_month = int(((i + 1) / num_steps) * total_months)
            if end_month < start_month:
                end_month = start_month
            enforced_duration = f"Month {start_month}" if start_month == end_month else f"Months {start_month}-{end_month}"
        else:
            enforced_duration = orig_milestone.get("duration", "Months 1-3")

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
        "path_title": blueprint.get("path_title") or f"{path_type} Pathway to {goal}",
        "path_description": blueprint.get("path_description") or f"Detailed strategic blueprint guiding from {current} to {goal}.",
        "readiness_score": metrics["readiness_score"],
        "readiness_label": metrics["readiness_label"],
        "total_duration": metrics["total_duration"],
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
'''

code = code[:store_start] + new_store_code + "\n\n" + code[store_end:]

# ─── SECTION 10: ENDPOINTS UPDATE (generate_path_stream & generate_path) ───
stream_start = code.find("@app.post(\"/api/path/stream\")")
admin_analytics_start = code.find("@app.get(\"/api/admin/analytics\")")
assert stream_start != -1 and admin_analytics_start != -1, "Endpoint section markers not found"

new_endpoints_code = '''@app.post("/api/path/stream")
async def generate_path_stream(req: PathGenerationRequest):
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

            blueprint_tasks = {
                asyncio.create_task(
                    run_agent_1_blueprint(
                        current, goal, profile, refine_prompt, existing_roadmap,
                        focus=f_choice, content_category=content_cat, sub_segment=sub_seg
                    )
                ): index
                for index, f_choice in enumerate(foci)
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

                if not done:
                    stage_progress = min(39, stage_progress + 1)
                    yield sse_payload("status", {
                        "statuses": build_agent_statuses("agent1", completed),
                        "progress": stage_progress,
                        "message": f"Generating pathway alternatives... ({finished_count} of {len(foci)} ready)"
                    })
                    continue

                for task in done:
                    index = blueprint_tasks[task]
                    try:
                        blueprints[index] = task.result()
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
            for i, bp in enumerate(blueprints):
                if isinstance(bp, Exception) or not is_complete_blueprint(bp, current, goal, profile, category=cat):
                    received_steps = len(bp.get("steps", [])) if isinstance(bp, dict) else 0
                    print(f"Blueprint {i} was incomplete ({received_steps} steps). Using category-native fallback.")
                    valid_blueprints.append(get_fallback_mock_roadmap(current, goal, profile, refine_prompt, focus=foci[i], category=cat, sub_segment=sub_seg))
                else:
                    valid_blueprints.append(bp)

            completed.append("agent1")
            yield sse_payload("status", {
                "statuses": build_agent_statuses("agent2", completed),
                "progress": 50,
                "message": "Validating pathway titles, goals, and readiness..."
            })
            await asyncio.sleep(0.15)

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

            for i, bp in enumerate(valid_blueprints):
                if not is_complete_blueprint(bp, current, goal, profile, category=cat):
                    bp = get_fallback_mock_roadmap(current, goal, profile, refine_prompt, focus=foci[i], category=cat, sub_segment=sub_seg)
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
                        milestone["marketplace"] = get_mock_marketplace(
                            foci[i],
                            step_title=milestone.get("title", ""),
                            step_id=milestone.get("id", 1),
                            goal=goal,
                            category=cat,
                            sub_segment=sub_seg
                        )
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
                    path_type=option_names[i],
                    sub_segment=sub_seg
                )
                final_json["option_name"] = option_names[i]
                accuracy = calculate_path_accuracy_score(final_json, profile, current)
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

        blueprint_tasks = [
            run_agent_1_blueprint(
                current, goal, profile, refine_prompt, existing_roadmap,
                focus=f_choice, content_category=content_cat, sub_segment=sub_seg
            )
            for f_choice in foci
        ]
        blueprints = await asyncio.gather(*blueprint_tasks, return_exceptions=True)

        valid_blueprints = []
        for i, bp in enumerate(blueprints):
            if isinstance(bp, Exception) or not is_complete_blueprint(bp, current, goal, profile, category=cat):
                valid_blueprints.append(get_fallback_mock_roadmap(current, goal, profile, refine_prompt, focus=foci[i], category=cat, sub_segment=sub_seg))
            else:
                valid_blueprints.append(bp)

        final_alternatives = []
        for i, bp in enumerate(valid_blueprints):
            final_json = await build_and_store_final_path(
                bp, {}, [], [], current, goal, profile,
                path_type=option_names[i],
                sub_segment=sub_seg
            )
            final_json["option_name"] = option_names[i]
            accuracy = calculate_path_accuracy_score(final_json, profile, current)
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
        return get_fallback_mock_roadmap(current, goal, profile, refine_prompt, focus=focus_req, category=cat, sub_segment=sub_seg)


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
        return get_fallback_mock_roadmap(current, goal, profile)
'''

code = code[:stream_start] + new_endpoints_code + "\n\n" + code[admin_analytics_start:]

# Write updated code back to main.py
with open(MAIN_PY, "w", encoding="utf-8") as f:
    f.write(code)

print("Successfully updated main.py with complete Agent Flow Category-Driven Architecture!")
