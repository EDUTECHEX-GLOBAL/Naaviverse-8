import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from duration_service import calculate_path_duration, validate_path_duration, enforce_centralized_duration_on_roadmap

def run_tests():
    print("Running Centralized Duration Service Test Suite...\n" + "=" * 60)

    # Example A
    res_a = calculate_path_duration(
        "Grade 10",
        "Bachelor's • Computer Science & Engineering • Vellore Institute of Technology • India"
    )
    print(f"Example A (Grade 10 -> B.Tech VIT): {res_a['total_duration_months']} months")
    assert res_a['total_duration_months'] == 84, f"Expected 84, got {res_a['total_duration_months']}"
    assert len(res_a['calculation']) == 4, f"Expected 4 stages, got {len(res_a['calculation'])}"

    # Example B
    res_b = calculate_path_duration(
        "Grade 11",
        "Bachelor's • Computer Science & Engineering • Vellore Institute of Technology • India"
    )
    print(f"Example B (Grade 11 -> B.Tech VIT): {res_b['total_duration_months']} months")
    assert res_b['total_duration_months'] == 72, f"Expected 72, got {res_b['total_duration_months']}"

    # Example C
    res_c = calculate_path_duration(
        "Grade 10",
        "Master's • Data Science • Carnegie Mellon University • USA"
    )
    print(f"Example C (Grade 10 -> Master's CMU 18m): {res_c['total_duration_months']} months")
    # 12 (Gr 10) + 12 (Gr 11) + 12 (Gr 12) + 48 (BS) + 18 (CMU MS) = 102
    assert res_c['total_duration_months'] == 102, f"Expected 102, got {res_c['total_duration_months']}"

    # Standard 2-year Master's
    res_c2 = calculate_path_duration(
        "Grade 10",
        "Master's • Computer Science • Stanford University • USA"
    )
    print(f"Example C2 (Grade 10 -> Master's Stanford 24m): {res_c2['total_duration_months']} months")
    # 12 + 12 + 12 + 48 + 24 = 108
    assert res_c2['total_duration_months'] == 108, f"Expected 108, got {res_c2['total_duration_months']}"

    # Example D
    res_d = calculate_path_duration(
        "Grade 10",
        "PhD • Chemistry • UC Berkeley • USA"
    )
    print(f"Example D (Grade 10 -> PhD UC Berkeley 60m): {res_d['total_duration_months']} months")
    # 12 + 12 + 12 + 48 (BS) + 60 (PhD) = 144
    assert res_d['total_duration_months'] == 144, f"Expected 144, got {res_d['total_duration_months']}"

    # Grade 9 to Bachelor's
    res_gr9 = calculate_path_duration(
        "Grade 9",
        "Bachelor's • Computer Science & Engineering • Vellore Institute of Technology • India"
    )
    print(f"Grade 9 -> B.Tech VIT: {res_gr9['total_duration_months']} months")
    # 12 + 12 + 12 + 12 + 48 = 96
    assert res_gr9['total_duration_months'] == 96, f"Expected 96, got {res_gr9['total_duration_months']}"

    # Grade 12 to Bachelor's
    res_gr12 = calculate_path_duration(
        "Grade 12",
        "Bachelor's • Computer Science & Engineering • Vellore Institute of Technology • India"
    )
    print(f"Grade 12 -> B.Tech VIT: {res_gr12['total_duration_months']} months")
    # 12 + 48 = 60
    assert res_gr12['total_duration_months'] == 60, f"Expected 60, got {res_gr12['total_duration_months']}"

    # Current stage progress: Halfway through Grade 10
    res_prog1 = calculate_path_duration(
        "Currently halfway through Grade 10",
        "Bachelor's • Computer Science & Engineering • Vellore Institute of Technology • India"
    )
    print(f"Halfway through Grade 10: {res_prog1['total_duration_months']} months")
    # 6 + 12 + 12 + 48 = 78
    assert res_prog1['total_duration_months'] == 78, f"Expected 78, got {res_prog1['total_duration_months']}"

    # Current stage progress: Grade 10, 3 months completed
    res_prog2 = calculate_path_duration(
        "Grade 10, 3 months completed",
        "Bachelor's • Computer Science & Engineering • Vellore Institute of Technology • India"
    )
    print(f"Grade 10, 3 months completed: {res_prog2['total_duration_months']} months")
    # 9 + 12 + 12 + 48 = 81
    assert res_prog2['total_duration_months'] == 81, f"Expected 81, got {res_prog2['total_duration_months']}"

    # Architecture (B.Arch - 60m)
    res_arch = calculate_path_duration(
        "Grade 10",
        "Bachelor's • Architecture (B.Arch) • CEPT University • India"
    )
    print(f"Grade 10 -> B.Arch: {res_arch['total_duration_months']} months")
    # 12 + 12 + 12 + 60 = 96
    assert res_arch['total_duration_months'] == 96, f"Expected 96, got {res_arch['total_duration_months']}"

    # Medicine (MBBS - 66m)
    res_mbbs = calculate_path_duration(
        "Grade 11",
        "Medicine (MBBS) • AIIMS • India"
    )
    print(f"Grade 11 -> MBBS: {res_mbbs['total_duration_months']} months")
    # 12 + 12 + 66 = 90
    assert res_mbbs['total_duration_months'] == 90, f"Expected 90, got {res_mbbs['total_duration_months']}"

    # UK 3-year Bachelor's
    res_uk = calculate_path_duration(
        "Grade 11",
        "Bachelor's in Economics • University of Oxford • UK"
    )
    print(f"Grade 11 -> Oxford BA (36m): {res_uk['total_duration_months']} months")
    # 12 + 12 + 36 = 60
    assert res_uk['total_duration_months'] == 60, f"Expected 60, got {res_uk['total_duration_months']}"

    # UK 1-year Master's
    res_uk_ms = calculate_path_duration(
        "Grade 12",
        "Master's in Finance • Imperial College London • UK"
    )
    print(f"Grade 12 -> Imperial MSc (36m UG + 12m MS): {res_uk_ms['total_duration_months']} months")
    # 12 + 36 + 12 = 60
    assert res_uk_ms['total_duration_months'] == 60, f"Expected 60, got {res_uk_ms['total_duration_months']}"

    # Practical skills
    res_prac = calculate_path_duration(
        "Beginner Python",
        "Build a Python Web Portfolio",
        category="practical"
    )
    print(f"Practical Skills: {res_prac['total_duration_months']} months")
    assert res_prac['total_duration_months'] == 6

    # Jobs & Careers
    res_jobs = calculate_path_duration(
        "Junior Developer",
        "Senior Software Engineer",
        category="jobs"
    )
    print(f"Jobs: {res_jobs['total_duration_months']} months")
    assert res_jobs['total_duration_months'] == 12

    # Non-Academic
    res_nonacad = calculate_path_duration(
        "High exam stress and anxiety",
        "Manage exam anxiety and build focus routine",
        category="non_academic"
    )
    print(f"Non-Academic: {res_nonacad['total_duration_months']} months")
    assert res_nonacad['total_duration_months'] == 3

    # Roadmap Enforcement Test
    mock_roadmap = {
        "path_title": "Test Path",
        "total_duration": "48 months", # AI hallucinated wrong duration!
        "steps": [
            {"id": 1, "duration": "Months 1-12"},
            {"id": 2, "duration": "Months 13-24"},
            {"id": 3, "duration": "Months 25-48"}
        ]
    }
    enforce_centralized_duration_on_roadmap(mock_roadmap, res_a)
    assert mock_roadmap["total_duration"] == "84 months", f"Expected 84 months, got {mock_roadmap['total_duration']}"
    assert mock_roadmap["total_duration_months"] == 84
    assert len(mock_roadmap["duration_calculation"]) == 4
    print("Roadmap enforcement test passed!")

    # University of Edinburgh Scottish AI Honours Bachelor's (4 years = 48m)
    res_edin = calculate_path_duration(
        "Grade 10 • General (K-10) Stream • CBSE • little flower • Hyderabad, Telangana, India",
        "Bachelor's • Artificial Intelligence • University of Edinburgh • UK"
    )
    print(f"Grade 10 -> Edinburgh AI Bachelor's: {res_edin['total_duration_months']} months")
    # Grade 10 (12) + Grade 11 (12) + Grade 12 (12) + Edinburgh AI Bachelor's (48) = 84 months
    assert res_edin['total_duration_months'] == 84, f"Expected 84, got {res_edin['total_duration_months']}"
    assert res_edin['calculation'][-1]['months'] == 48, f"Expected 48 for Edinburgh AI, got {res_edin['calculation'][-1]['months']}"
    assert "Bachelor's • Bachelor's" not in res_edin['calculation'][-1]['stage'], f"Duplicate title found: {res_edin['calculation'][-1]['stage']}"
    assert "Artificial Intelligence" in res_edin['calculation'][-1]['stage'], f"Missing program in stage title: {res_edin['calculation'][-1]['stage']}"
    print(f"Edinburgh Stage Title: '{res_edin['calculation'][-1]['stage']}' ({res_edin['calculation'][-1]['months']}m)")

    print("\n" + "=" * 60 + "\nALL 18 DURATION TESTS PASSED PERFECTLY!\n" + "=" * 60)

if __name__ == "__main__":
    run_tests()
