import asyncio
import json
import os
import re
import sys

# Import functions from main
from main import (
    resolve_focus_category,
    calculate_total_duration_months,
    calculate_path_metrics,
    get_fallback_mock_roadmap,
    validate_category_semantics,
    enrich_step_narrative,
    build_agent_1_prompt,
    build_agent_2_prompt,
    build_agent_3_prompt,
    build_agent_4_prompt,
    get_mock_marketplace,
    is_complete_blueprint
)

print("=" * 60)
print("TEST 1: Category Resolution")
print("=" * 60)
assert resolve_focus_category("Academic & Research") == "academic"
assert resolve_focus_category("Practical & Skills") == "practical"
assert resolve_focus_category("Jobs & Careers") == "jobs"
assert resolve_focus_category("Non-Academic Counselling") == "non_academic"
assert resolve_focus_category("Mental Health & Wellness") == "non_academic"
print("[OK] Category resolution passed!")

print("\n" + "=" * 60)
print("TEST 2: Duration Calculation Across Categories")
print("=" * 60)
dur_acad = calculate_total_duration_months("Grade 11 CBSE", "Bachelor's in Computer Science", {}, category="academic")
dur_prac = calculate_total_duration_months("Beginner Python", "Build a Python portfolio", {}, category="practical")
dur_jobs = calculate_total_duration_months("Junior Developer", "Senior Software Engineer", {}, category="jobs")
dur_mental = calculate_total_duration_months("Exam stress", "Manage exam stress", {}, category="non_academic", sub_segment="Mental Health & Wellness")

print(f"Academic Duration: {dur_acad} months")
print(f"Practical Duration: {dur_prac} months")
print(f"Jobs Duration: {dur_jobs} months")
print(f"Non-Academic Duration: {dur_mental} months")

assert dur_prac in [6, 8]
assert dur_jobs in [6, 12]
assert dur_mental in [2, 3]
print("[OK] Dynamic duration calculation passed!")

print("\n" + "=" * 60)
print("TEST 3: Fallback Roadmaps - Zero Academic Leakage Check")
print("=" * 60)
# 1. Non-Academic Mental Health
mh_fallback = get_fallback_mock_roadmap("Exam stress", "Manage exam stress", {}, focus="Mental Health & Wellness", category="non_academic", sub_segment="Mental Health & Wellness")
mh_text = json.dumps(mh_fallback).lower()
assert not re.search(r'\b(sat|act|gpa|cbse|ielts|toefl)\b', mh_text), "Academic testing/board acronym found in Mental Health fallback!"
assert "university admission" not in mh_text, "University admission found in Mental Health fallback!"
is_mh_valid, reason = validate_category_semantics(mh_fallback, "non_academic", "Mental Health & Wellness")
assert is_mh_valid, f"Mental health validation failed: {reason}"
print(f"[OK] Non-Academic Mental Health Fallback: {len(mh_fallback['steps'])} steps, valid = {is_mh_valid}")

# 2. Practical & Skills
prac_fallback = get_fallback_mock_roadmap("Beginner Python", "Build Python Portfolio", {}, focus="Practical & Skills", category="practical")
prac_text = json.dumps(prac_fallback).lower()
assert not re.search(r'\b(sat|act|gpa|cbse|ielts)\b', prac_text), "Academic acronym found in Practical fallback!"
assert "board exam" not in prac_text, "Board exam found in Practical fallback!"
is_prac_valid, reason = validate_category_semantics(prac_fallback, "practical")
assert is_prac_valid, f"Practical validation failed: {reason}"
print(f"[OK] Practical & Skills Fallback: {len(prac_fallback['steps'])} steps, valid = {is_prac_valid}")

# 3. Jobs & Careers
jobs_fallback = get_fallback_mock_roadmap("Junior Developer", "Senior Software Engineer", {}, focus="Jobs & Careers", category="jobs")
jobs_text = json.dumps(jobs_fallback).lower()
assert not re.search(r'\b(cbse|icse|sat|act)\b', jobs_text), "Academic testing acronym found in Jobs fallback!"
assert "grade 10" not in jobs_text, "Grade 10 found in Jobs fallback!"
is_jobs_valid, reason = validate_category_semantics(jobs_fallback, "jobs")
assert is_jobs_valid, f"Jobs validation failed: {reason}"
print(f"[OK] Jobs & Careers Fallback: {len(jobs_fallback['steps'])} steps, valid = {is_jobs_valid}")

# 4. Academic & Research
acad_fallback = get_fallback_mock_roadmap("Grade 11 CBSE", "Bachelor's in CS at MIT", {}, focus="Academic & Research", category="academic")
is_acad_valid, reason = validate_category_semantics(acad_fallback, "academic")
assert is_acad_valid, f"Academic validation failed: {reason}"
print(f"[OK] Academic & Research Fallback: {len(acad_fallback['steps'])} steps, valid = {is_acad_valid}")

print("\n" + "=" * 60)
print("TEST 4: Semantic Validator Detecting Violations")
print("=" * 60)
leaked_mh = {
    "path_title": "Mental Health Plan",
    "steps": [
        {"title": "Step 1", "description": "Prepare for SAT prep and university admissions"},
        {"title": "Step 2", "description": "Practice mindfulness"}
    ]
}
is_valid, violation = validate_category_semantics(leaked_mh, "non_academic")
assert not is_valid, "Failed to catch category leakage!"
print(f"[OK] Correctly caught category leakage: '{violation}'")

print("\n" + "=" * 60)
print("TEST 5: Pure Model Pass-Through Narrative Check")
print("=" * 60)
raw_step = {"id": 1, "title": "Foundation", "duration": "Month 1", "description": "Custom LLM text"}
enriched = enrich_step_narrative(dict(raw_step), "Exam stress", "Manage stress", "non_academic")
assert enriched["description"] == "Custom LLM text"
print("[OK] Pure model pass-through verified!")

print("\n" + "=" * 60)
print("TEST 6: Category-Specific Prompt Builders")
print("=" * 60)
p1_acad = build_agent_1_prompt("academic", None, "Grade 11", "MIT CS", {})
assert "ACADEMIC & RESEARCH" in p1_acad

p1_prac = build_agent_1_prompt("practical", None, "Beginner Python", "Python Portfolio", {})
assert "PRACTICAL & SKILLS" in p1_prac
assert "STRICT NEGATIVE CONSTRAINTS" in p1_prac

p1_jobs = build_agent_1_prompt("jobs", None, "Junior Dev", "Senior Dev", {})
assert "JOBS & CAREERS" in p1_jobs
assert "STRICT NEGATIVE CONSTRAINTS" in p1_jobs

p1_mh = build_agent_1_prompt("non_academic", "Mental Health & Wellness", "Exam Stress", "Manage Stress", {})
assert "NON-ACADEMIC COUNSELLING" in p1_mh
assert "STRICT NEGATIVE CONSTRAINTS" in p1_mh

print("[OK] All prompt builders properly configure category isolation and negative constraints!")

print("\n" + "=" * 60)
print("ALL CORE TESTS PASSED SUCCESSFULLY!")
print("=" * 60)
