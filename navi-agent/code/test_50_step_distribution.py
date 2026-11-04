import duration_service

# Simulate 50 steps like in user's scenario
sample_50_steps = []
milestones = [
    ("Grade 11 Consolidation & Foundational Research Skills", "Grade 11"),
    ("Advanced Mathematics & Mechanics Core Syllabus", "Grade 11"),
    ("Introductory Computer Science & Coding Foundations", "Grade 11"),
    ("Grade 11 Final Examination & Profile Building", "Grade 11"),
    ("Grade 12 Advanced Coursework & Test Preparation", "Grade 12"),
    ("University Shortlisting & Common App Preparation", "Grade 12"),
    ("Application Essays & Letter of Recommendation Requests", "Grade 12"),
    ("Final Submission & Portal Follow-Ups", "Grade 12"),
    ("Admission Decisions & Financial Documentation", "Grade 12"),
    ("Student Visa Clearance & University Enrollment", "Grade 12"),
]

step_id = 1
for m_idx, (m_title, stage) in enumerate(milestones, start=1):
    m_step_id = step_id
    sample_50_steps.append({
        "id": m_step_id,
        "title": m_title,
        "academic_stage": stage,
        "parent_milestone": stage,
        "hierarchy_level": "milestone",
        "prerequisites": [m_step_id - 5] if m_step_id > 5 else [],
        "duration": "1 Month",
        "can_parallel": False
    })
    step_id += 1
    # 4 subtasks per milestone
    for sub_i in range(1, 5):
        is_par = (sub_i % 2 == 1)
        sample_50_steps.append({
            "id": step_id,
            "title": f"{m_title} - Module {sub_i}",
            "academic_stage": stage,
            "parent_milestone": stage,
            "hierarchy_level": "micro_task",
            "prerequisites": [m_step_id],
            "duration": "1 Month",
            "can_parallel": is_par
        })
        step_id += 1

stages = [
    {"stage": "Grade 11", "months": 12, "stage_type": "current_academic_stage"},
    {"stage": "Grade 12", "months": 12, "stage_type": "intermediate_school_stage"},
]

scheduled, m_by_m = duration_service.schedule_academic_steps_timeline(
    steps=sample_50_steps,
    total_duration_months=24,
    current_stage="Grade 11",
    target_goal="Georgia Tech B.S. CS",
    calculation_stages=stages
)

print(f"Total Scheduled Steps: {len(scheduled)}")
print(f"Total Months: 24. Mapped months count: {len(m_by_m)}")
for s in scheduled[:15]:
    print(f"  Step {s['id']:2d}: {s['title'][:45]:<45} | {s['duration']:<12} | Par: {s['can_parallel']}")

print("\nLast 5 steps:")
for s in scheduled[-5:]:
    print(f"  Step {s['id']:2d}: {s['title'][:45]:<45} | {s['duration']:<12} | Par: {s['can_parallel']}")
