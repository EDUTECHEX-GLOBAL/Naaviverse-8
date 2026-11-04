import duration_service

c = "Grade 11 - General (K-10) Stream - CBSE - little flower - Hyderabad, Telangana, India"
g = "Bachelor's - Computer Science - Georgia Institute of Technology - USA"

res = duration_service.calculate_path_duration(c, g)
print("=== DURATION CALCULATION VERIFICATION ===")
print("Total Duration Months:", res["total_duration_months"])
print("Total Duration String:", res["total_duration"])
print("Stages:")
for s in res["calculation"]:
    print(f"  * {s['stage']}: {s['months']}m ({s['stage_type']})")

assert res["total_duration_months"] == 24, f"Expected 24 months, got {res['total_duration_months']}"

# Now test scheduling of 50 steps across this 24-month duration
sample_50_steps = []
step_id = 1
for m in range(1, 11):
    m_id = step_id
    stage = "Grade 11" if m <= 5 else "Grade 12"
    sample_50_steps.append({
        "id": m_id,
        "title": f"Milestone {m}: Academic Progression in {stage}",
        "parent_milestone": stage,
        "hierarchy_level": "milestone",
        "prerequisites": [m_id - 5] if m_id > 5 else [],
        "can_parallel": False
    })
    step_id += 1
    for sub in range(1, 5):
        sample_50_steps.append({
            "id": step_id,
            "title": f"Milestone {m} Subtask {sub}: Syllabus Mastery & Exam Prep",
            "parent_milestone": stage,
            "parent_id": m_id,
            "hierarchy_level": "nano_subtask",
            "prerequisites": [m_id],
            "can_parallel": (sub % 2 == 1)
        })
        step_id += 1

scheduled, m_by_m = duration_service.schedule_academic_steps_timeline(
    steps=sample_50_steps,
    total_duration_months=res["total_duration_months"],
    current_stage=c,
    target_goal=g,
    calculation_stages=res["calculation"]
)

print("\n=== STEP DISTRIBUTION VERIFICATION (50 STEPS) ===")
print("Total Scheduled Steps:", len(scheduled))
print(f"Step 1: {scheduled[0]['title']} -> {scheduled[0]['duration']}")
for s in scheduled[1:10]:
    print(f"Step {s['id']:2d}: {s['title'][:40]:<40} -> {s['duration']}")

print("...")
for s in scheduled[-5:]:
    print(f"Step {s['id']:2d}: {s['title'][:40]:<40} -> {s['duration']}")

# Verify that steps are not clumped into Month 2-3
durations = [s['duration'] for s in scheduled]
month_2_3_count = sum(1 for d in durations if "Month 2" in d or "Month 3" in d)
print(f"\nSteps in Month 2 or 3: {month_2_3_count} / 50")
assert month_2_3_count < 15, f"Too many steps clumped in Month 2-3: {month_2_3_count}"

# Verify span reaches month 24
assert scheduled[-1]['end_month'] == 24, f"Final step should reach Month 24, got {scheduled[-1]['end_month']}"
print("\n>>> ALL TESTS PASSED SUCCESSFULLY! <<<")
