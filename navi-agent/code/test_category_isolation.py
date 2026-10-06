import sys
import os

sys.path.append(os.path.dirname(__file__))

from duration_service import calculate_path_duration, resolve_category

def run_tests():
    print("=" * 60)
    print("RUNNING COMPREHENSIVE CATEGORY ISOLATION & DURATION TEST")
    print("=" * 60)

    # Student Profile with Grade 11 CBSE (Active in student session)
    profile_gr11 = {
        "academics": {
            "currentGrade": "11",
            "curriculum": "CBSE",
            "school": "little flower"
        },
        "activeSegment": "Academics"
    }

    # ─────────────────────────────────────────────────────────────
    # TEST 1: CATEGORY RESOLUTION OF ALL VARIANTS & SEGMENTS
    # ─────────────────────────────────────────────────────────────
    assert resolve_category("Research & Honors Focus") == "academic"
    assert resolve_category("Test Prep & Admissions Focus") == "academic"
    assert resolve_category("Academics") == "academic"
    assert resolve_category("Undergraduate (Bachelor's)") == "academic"

    assert resolve_category("Project Portfolio Focus") == "practical"
    assert resolve_category("Certification & Bootcamp Focus") == "practical"
    assert resolve_category("Practical Skills") == "practical"
    assert resolve_category("Practical & Skills") == "practical"

    assert resolve_category("Technical Role Prep Focus") == "jobs"
    assert resolve_category("Interview & Networking Focus") == "jobs"
    assert resolve_category("Jobs & Careers") == "jobs"
    assert resolve_category("Jobs") == "jobs"

    assert resolve_category("Mental Health & Wellness Focus") == "non_academic"
    assert resolve_category("Life Skills & Decision Focus") == "non_academic"
    assert resolve_category("Non-Academic Counselling") == "non_academic"
    assert resolve_category("Mental Wellbeing") == "non_academic"
    print("[PASS] All 16 Category Resolution checks passed successfully.")

    # ─────────────────────────────────────────────────────────────
    # TEST 2: ACADEMICS LOGIC (Must remain 72 months - IMAGE 1)
    # ─────────────────────────────────────────────────────────────
    res_acad = calculate_path_duration(
        current_position="Grade 11 • General (K-10) Stream • CBSE • little flower • Hyderabad, Telangana, India",
        target_goal="Bachelor's • Computer Science • Vellore Institute of Technology • India",
        profile_context=profile_gr11,
        category="academic"
    )
    print(f"[PASS] Academics (Grade 11 -> VIT BTech CS): {res_acad['total_duration_months']} months [Expected 72]")
    assert res_acad['total_duration_months'] == 72
    assert res_acad['category'] == "academic"
    assert len(res_acad['calculation']) == 3
    assert res_acad['calculation'][0]['stage'] == "Grade 11" and res_acad['calculation'][0]['months'] == 12
    assert res_acad['calculation'][1]['stage'] == "Grade 12" and res_acad['calculation'][1]['months'] == 12
    assert "Bachelor" in res_acad['calculation'][2]['stage'] and res_acad['calculation'][2]['months'] == 48

    # ─────────────────────────────────────────────────────────────
    # TEST 3: NON-ACADEMIC COUNSELLING DYNAMIC DURATIONS (IMAGE 2)
    # ─────────────────────────────────────────────────────────────
    # Scenario A: Decision Making (Image 2) - 3 months
    res_mental_dec = calculate_path_duration(
        current_position="Mental Health & Stress Management • Decision Making , stress and confusion • Hyderabad, Telangana, India",
        target_goal="Develop Better Decision-Making Skills",
        profile_context=profile_gr11,
        category="Life Skills & Decision Focus"
    )
    print(f"[PASS] Mental (Decision-Making): {res_mental_dec['total_duration_months']} months, Stages: {[s['stage'] for s in res_mental_dec['calculation']]}")
    assert res_mental_dec['category'] == "non_academic"
    assert res_mental_dec['total_duration_months'] == 3
    for s in res_mental_dec['calculation']:
        assert "System Build" not in s['stage'], "Found practical coding stage in mental health!"
        assert "Production Hardening" not in s['stage'], "Found practical coding stage in mental health!"

    # Scenario B: Exam Stress / Crisis - 2 months
    res_mental_crisis = calculate_path_duration(
        current_position="Acute board exam stress and panic attacks",
        target_goal="Immediate exam stress relief and stabilization",
        profile_context=profile_gr11,
        category="Non-Academic Counselling"
    )
    print(f"[PASS] Mental (Acute Exam Stress): {res_mental_crisis['total_duration_months']} months [Expected 2]")
    assert res_mental_crisis['total_duration_months'] == 2

    # Scenario C: Stress Management & Wellness - 4 months
    res_mental_stress = calculate_path_duration(
        current_position="Daily study stress and anxiety",
        target_goal="Stress management and sustainable daily routine",
        profile_context=profile_gr11,
        category="Mental Health & Wellness Focus"
    )
    print(f"[PASS] Mental (Stress Management): {res_mental_stress['total_duration_months']} months [Expected 4]")
    assert res_mental_stress['total_duration_months'] == 4

    # Scenario D: Deep Transformation / Life Coaching - 6 months
    res_mental_coach = calculate_path_duration(
        current_position="General confusion about identity and values",
        target_goal="Comprehensive life coaching and emotional autonomy",
        profile_context=profile_gr11,
        category="Non-Academic Counselling"
    )
    print(f"[PASS] Mental (Life Coaching): {res_mental_coach['total_duration_months']} months [Expected 6]")
    assert res_mental_coach['total_duration_months'] == 6

    # ─────────────────────────────────────────────────────────────
    # TEST 4: PRACTICAL SKILLS & PROJECTS DYNAMIC DURATIONS
    # ─────────────────────────────────────────────────────────────
    # Scenario A: Tool syntax (Git/SQL) - 2 or 3 months
    res_prac_git = calculate_path_duration(
        current_position="Basic command line knowledge",
        target_goal="Mastering Git, GitHub & Docker Basics",
        profile_context=profile_gr11,
        category="Certification & Bootcamp Focus"
    )
    print(f"[PASS] Practical (Git/Docker Tools): {res_prac_git['total_duration_months']} months, cat={res_prac_git['category']}")
    assert res_prac_git['category'] == "practical"
    assert res_prac_git['total_duration_months'] in [2, 3]

    # Scenario B: Intermediate Web Dev - 4 or 5 months
    res_prac_web = calculate_path_duration(
        current_position="Intermediate JavaScript & CSS",
        target_goal="Full-Stack React & Node.js Project Portfolio",
        profile_context=profile_gr11,
        category="Project Portfolio Focus"
    )
    print(f"[PASS] Practical (Full-Stack Portfolio): {res_prac_web['total_duration_months']} months, cat={res_prac_web['category']}")
    assert res_prac_web['category'] == "practical"
    assert res_prac_web['total_duration_months'] in [4, 5]

    # Scenario C: Beginner Web Dev - 6 months
    res_prac_beg = calculate_path_duration(
        current_position="Beginner with no coding experience",
        target_goal="Web Development Fundamentals & Project Portfolio",
        profile_context=profile_gr11,
        category="Practical Skills"
    )
    print(f"[PASS] Practical (Beginner Web Dev): {res_prac_beg['total_duration_months']} months [Expected 6]")
    assert res_prac_beg['total_duration_months'] == 6

    # Scenario D: Deep AI / Systems - 8 or 10 months
    res_prac_ai = calculate_path_duration(
        current_position="Intermediate Python Programmer",
        target_goal="Machine Learning & Deep Learning Portfolio",
        profile_context=profile_gr11,
        category="Practical Skills"
    )
    print(f"[PASS] Practical (Machine Learning Systems): {res_prac_ai['total_duration_months']} months, cat={res_prac_ai['category']}")
    assert res_prac_ai['category'] == "practical"
    assert res_prac_ai['total_duration_months'] in [8, 10]

    # ─────────────────────────────────────────────────────────────
    # TEST 5: JOBS & CAREERS DYNAMIC DURATIONS
    # ─────────────────────────────────────────────────────────────
    # Scenario A: Targeted Interview Sprint - 2 months
    res_job_sprint = calculate_path_duration(
        current_position="Prepared CS Graduate",
        target_goal="Immediate SDE Interview Sprint & Offer Negotiation",
        profile_context=profile_gr11,
        category="Interview & Networking Focus"
    )
    print(f"[PASS] Jobs (Interview Sprint): {res_job_sprint['total_duration_months']} months [Expected 2]")
    assert res_job_sprint['category'] == "jobs"
    assert res_job_sprint['total_duration_months'] == 2

    # Scenario B: Campus Placement Prep - 3 months
    res_job_campus = calculate_path_duration(
        current_position="Final Year Student",
        target_goal="Campus Placement Prep for Software Engineering",
        profile_context=profile_gr11,
        category="Technical Role Prep Focus"
    )
    print(f"[PASS] Jobs (Campus Placement): {res_job_campus['total_duration_months']} months [Expected 3]")
    assert res_job_campus['category'] == "jobs"
    assert res_job_campus['total_duration_months'] == 3

    # Scenario C: Junior Role Search - 4 months
    res_job_jr = calculate_path_duration(
        current_position="Entry Level Graduate",
        target_goal="Junior Frontend Developer Role",
        profile_context=profile_gr11,
        category="Technical Role Prep Focus"
    )
    print(f"[PASS] Jobs (Junior Role): {res_job_jr['total_duration_months']} months [Expected 4]")
    assert res_job_jr['category'] == "jobs"
    assert res_job_jr['total_duration_months'] == 4

    # Scenario D: Mid-Level Role Transition - 5 or 6 months
    res_job_mid = calculate_path_duration(
        current_position="Software Engineer with 2 years experience",
        target_goal="Cloud DevOps Engineer Role",
        profile_context=profile_gr11,
        category="Jobs & Careers"
    )
    print(f"[PASS] Jobs (Mid-Level Role): {res_job_mid['total_duration_months']} months, cat={res_job_mid['category']}")
    assert res_job_mid['category'] == "jobs"
    assert res_job_mid['total_duration_months'] in [5, 6]

    # Scenario E: Senior Role Transition - 8 months
    res_job_sr = calculate_path_duration(
        current_position="Junior Developer",
        target_goal="Senior Software Engineer",
        profile_context=profile_gr11,
        category="Jobs & Careers"
    )
    print(f"[PASS] Jobs (Junior -> Senior): {res_job_sr['total_duration_months']} months [Expected 8]")
    assert res_job_sr['category'] == "jobs"
    assert res_job_sr['total_duration_months'] == 8

    # Scenario F: Career Switch with Transferable Skills - 10 months
    res_job_switch10 = calculate_path_duration(
        current_position="Mechanical Engineer with basic Python",
        target_goal="Career Switch to Software Developer",
        profile_context=profile_gr11,
        category="Jobs & Careers"
    )
    print(f"[PASS] Jobs (Career Switch Transferable): {res_job_switch10['total_duration_months']} months [Expected 10]")
    assert res_job_switch10['category'] == "jobs"
    assert res_job_switch10['total_duration_months'] == 10

    # Scenario G: Non-Tech Career Switch - 12 months
    res_job_switch12 = calculate_path_duration(
        current_position="Non-Tech Sales Associate with zero experience",
        target_goal="Career Switch to Software Engineer",
        profile_context=profile_gr11,
        category="Jobs & Careers"
    )
    print(f"[PASS] Jobs (Non-Tech Switch): {res_job_switch12['total_duration_months']} months [Expected 12]")
    assert res_job_switch12['category'] == "jobs"
    assert res_job_switch12['total_duration_months'] == 12

    print("=" * 60)
    print("ALL TESTS PASSED WITH 100% PRECISION!")
    print("=" * 60)

if __name__ == "__main__":
    run_tests()
