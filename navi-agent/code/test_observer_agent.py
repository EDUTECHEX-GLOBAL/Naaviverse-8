"""
Test suite for Naavi Observer Agent.
Validates:
1. High-quality roadmap audit (Grade 11 CBSE -> VIT B.Tech CS) -> Expect APPROVED
2. Flawed roadmap (Inverted steps, hallucinated marketplace, impossible timeline) -> Expect REQUIRES_CORRECTION / REJECTED
3. Category cross-contamination detection (Coding steps in mental counselling) -> Expect Flagged
4. Budget conflict detection (Budget-constrained student + expensive $1500 items) -> Expect Flagged
"""

import sys
import os

sys.path.append(os.path.dirname(__file__))

from observer_agent import observer_agent

def test_high_quality_roadmap():
    print("\n--- TEST 1: High Quality Academic Roadmap ---")
    profile = {
        "academics": {
            "currentGrade": "11",
            "curriculum": "CBSE",
            "school": "little flower"
        },
        "personalityGeography": {
            "country": "India",
            "city": "Hyderabad",
            "financialSituation": "Moderate"
        },
        "activeSegment": "Academics"
    }

    high_quality_roadmap = {
        "path_title": "CBSE Grade 11 to B.Tech Computer Science Pathway",
        "path_description": "Comprehensive 6-year academic roadmap from High School to Engineering Graduation.",
        "readiness_score": 85,
        "total_duration": "6 Years (72 Months)",
        "total_duration_months": 72,
        "steps": [
            {
                "id": 1,
                "title": "Grade 11 CBSE Academic Foundation & Physics/Maths Mastery",
                "duration": "12 Months",
                "description": "Establish core foundation in Mathematics, Physics, and Chemistry while exploring introductory computer science.",
                "macro_view": "Complete CBSE Class 11 board curriculum with strong fundamental scores.",
                "micro_view": "Weekly problem sets in Calculus, Mechanics, and basic Python programming.",
                "nano_view": "NCERT textbooks and past competitive question banks.",
                "learning_objectives": ["Master Class 11 Physics & Calculus", "Introductory programming fundamentals"],
                "micro_steps": [
                    {"task": "Study NCERT Chapters 1-10", "resource": "NCERT Book"},
                    {"task": "Solve 50 Calculus problems weekly", "resource": "RD Sharma"}
                ],
                "marketplace": {
                    "macro_free": [{"name": "Khan Academy Physics", "type": "course", "cost": "Free"}],
                    "micro_structured": [{"name": "CBSE Class 11 Foundation Series", "type": "course", "cost": "₹4,999"}],
                    "nano_expert": [{"name": "1-on-1 Academic Mentor Session", "type": "mentor", "cost": "₹1,500"}]
                }
            },
            {
                "id": 2,
                "title": "Grade 12 Board Prep & Engineering Entrance Preparation",
                "duration": "12 Months",
                "description": "Excel in Grade 12 board examinations and prepare for university admissions.",
                "macro_view": "Achieve high percentile in board exams and entrance tests.",
                "micro_view": "Intensive mock tests and revision cycles.",
                "nano_view": "Past 10 years question papers and timed tests.",
                "learning_objectives": ["Achieve 90%+ in CBSE Class 12 Boards", "Prepare for VITEEE / JEE"],
                "micro_steps": [
                    {"task": "Complete Syllabus by November", "resource": "Board Guidelines"},
                    {"task": "Take 20 full-length mock exams", "resource": "Mock Test Portal"}
                ],
                "marketplace": {
                    "macro_free": [{"name": "NPTEL Foundation Modules", "type": "course", "cost": "Free"}],
                    "micro_structured": [{"name": "VITEEE Test Prep Masterclass", "type": "course", "cost": "₹7,500"}],
                    "nano_expert": [{"name": "Senior Engineering Admissions Counselor", "type": "mentor", "cost": "₹2,000"}]
                }
            },
            {
                "id": 3,
                "title": "Bachelor of Technology in Computer Science (4-Year Degree)",
                "duration": "48 Months",
                "description": "Complete 4-year undergraduate B.Tech CS degree, capstone projects, and campus placement.",
                "macro_view": "Undergraduate degree completion with practical internships.",
                "micro_view": "Core semester subjects: Data Structures, Operating Systems, AI, and Capstone.",
                "nano_view": "Campus labs, GitHub repositories, and industry internships.",
                "learning_objectives": ["Complete 8 academic semesters", "Publish capstone project and secure software role"],
                "micro_steps": [
                    {"task": "Maintain cumulative GPA above 8.5", "resource": "University Portal"},
                    {"task": "Complete summer internship", "resource": "Campus Placement Cell"}
                ],
                "marketplace": {
                    "macro_free": [{"name": "MIT OpenCourseWare DSA", "type": "course", "cost": "Free"}],
                    "micro_structured": [{"name": "Coursera Full-Stack Specialization", "type": "course", "cost": "₹12,000"}],
                    "nano_expert": [{"name": "Tech Industry Career Advisor", "type": "mentor", "cost": "₹3,500"}]
                }
            }
        ]
    }

    report = observer_agent.observe(
        roadmap=high_quality_roadmap,
        current_position="Grade 11 • General Stream • CBSE • little flower • Hyderabad, India",
        target_goal="Bachelor's • Computer Science • Vellore Institute of Technology • India",
        profile=profile,
        category="academic"
    )

    print(f"Observer Status: {report['observer_status']} ({report['status_label']})")
    print(f"Overall Quality Score: {report['overall_quality_score']}/100")
    print(f"Dimensions: {report['dimensions']}")
    print(f"Issues: {len(report['issues'])}, Warnings: {len(report['warnings'])}, Hallucinations: {len(report['hallucinations'])}")

    assert report["overall_quality_score"] >= 85, f"Expected high quality score >= 85, got {report['overall_quality_score']}"
    assert report["observer_status"] == "APPROVED"
    assert len(report["hallucinations"]) == 0
    print("[PASS] Test 1 completed successfully.")


def test_flawed_roadmap_detection():
    print("\n--- TEST 2: Flawed Roadmap (Inverted Steps, Hallucinations, Budget Conflict) ---")
    profile = {
        "academics": {
            "currentGrade": "10",
            "curriculum": "CBSE"
        },
        "personalityGeography": {
            "financialSituation": "Need-based / Constrained Budget",
            "country": "India"
        }
    }

    flawed_roadmap = {
        "path_title": "Flawed Pathway",
        "path_description": "Roadmap with several flaws.",
        "readiness_score": 60,
        "total_duration": "3 Months",  # Impossible duration for B.Tech
        "total_duration_months": 3,
        "steps": [
            {
                "id": 1,
                "title": "Apply for Senior Software Engineer Job & Campus Placements",  # Gross inversion!
                "duration": "1 Month",
                "description": "Immediately interview for corporate software roles.",
                "marketplace": {
                    "macro_free": [],  # Missing free tier
                    "micro_structured": [{"name": "TBD Course", "cost": "$1,500"}],  # Hallucinated + Overpriced for budget profile!
                    "nano_expert": [{"name": "placeholder", "cost": "$2,500"}]  # Hallucinated name!
                }
            },
            {
                "id": 2,
                "title": "Bachelor of Technology Degree",  # Degree in 2 weeks!
                "duration": "2 Weeks",
                "description": "Finish entire B.Tech degree in 2 weeks.",
                "marketplace": {
                    "macro_free": [{"name": "N/A", "cost": "0"}]  # Suspicious name!
                }
            },
            {
                "id": 3,
                "title": "Introduction to Computers and Basic School Fundamentals",  # Foundation placed at end!
                "duration": "1 Month",
                "description": "Learn what a mouse and keyboard are.",
                "marketplace": {}
            }
        ]
    }

    report = observer_agent.observe(
        roadmap=flawed_roadmap,
        current_position="Grade 10 • CBSE • Hyderabad, India",
        target_goal="Bachelor's • Computer Science",
        profile=profile,
        category="academic"
    )

    print(f"Observer Status: {report['observer_status']} ({report['status_label']})")
    print(f"Overall Quality Score: {report['overall_quality_score']}/100")
    print(f"Dimensions: {report['dimensions']}")
    print(f"Issues detected ({len(report['issues'])}):")
    for iss in report["issues"]:
        print(f"  - [{iss.get('severity', '').upper()}] {iss.get('message')}")
    print(f"Hallucinations detected ({len(report['hallucinations'])}):")
    for hal in report["hallucinations"]:
        print(f"  - {hal.get('message')}")

    assert report["overall_quality_score"] < 65, f"Expected flawed score < 65, got {report['overall_quality_score']}"
    assert report["observer_status"] in ["REQUIRES_CORRECTION", "REJECTED"]
    assert len(report["hallucinations"]) > 0, "Observer failed to catch dummy placeholder provider names!"
    assert any(iss.get("type") == "sequence_inversion" for iss in report["issues"]), "Observer failed to catch sequence inversion!"
    assert any(iss.get("type") == "budget_conflict" for iss in report["issues"]), "Observer failed to catch budget conflict!"
    print("[PASS] Test 2 completed successfully.")


def test_category_contamination():
    print("\n--- TEST 3: Category Cross-Contamination (Coding in Mental Health) ---")
    counselling_roadmap = {
        "path_title": "Mental Wellbeing and Stress Management",
        "path_description": "Counseling path for student anxiety.",
        "total_duration": "3 Months",
        "total_duration_months": 3,
        "steps": [
            {
                "id": 1,
                "title": "Mindfulness & Stress Identification",
                "duration": "1 Month",
                "description": "Identify stress triggers.",
                "marketplace": {
                    "macro_free": [{"name": "Mindfulness Audio Guides", "type": "resource", "cost": "Free"}]
                }
            },
            {
                "id": 2,
                "title": "Deploy Docker Container and Backend API",  # Contamination!
                "duration": "1 Month",
                "description": "Write Python code and deploy production containers.",
                "marketplace": {
                    "macro_free": [{"name": "Docker Docs", "type": "docs", "cost": "Free"}]
                }
            }
        ]
    }

    report = observer_agent.observe(
        roadmap=counselling_roadmap,
        current_position="High Exam Stress • Hyderabad",
        target_goal="Overcome Exam Anxiety",
        category="non_academic"
    )

    print(f"Observer Status: {report['observer_status']}")
    print(f"Category Scope Score: {report['dimensions']['category_scope']}/100")
    print(f"Issues: {[i['message'] for i in report['issues']]}")

    assert any(iss.get("type") == "category_contamination" for iss in report["issues"]), "Failed to catch Docker/Coding in Mental Counselling!"
    print("[PASS] Test 3 completed successfully.")


def test_nested_view_marketplaces():
    print("\n--- TEST 4: Nested View Marketplaces (macro_view, micro_view, nano_view) ---")
    nested_roadmap = {
        "path_title": "Full-Stack Web Engineering",
        "path_description": "Career roadmap with nested view marketplaces.",
        "readiness_score": 90,
        "total_duration": "6 Months",
        "total_duration_months": 6,
        "steps": [
            {
                "id": 1,
                "title": "HTML, CSS and JavaScript Fundamentals",
                "duration": "2 Months",
                "description": "Master foundational web technologies and responsive design.",
                "learning_objectives": ["Understand HTML5 & CSS3", "Learn JavaScript ES6+ basics"],
                "micro_steps": [{"task": "Build 5 static pages", "resource": "MDN Web Docs"}],
                "macro_view": {
                    "description": "Foundational understanding of core web architecture.",
                    "marketplace": {
                        "mentors": [{"name": "Frontend Senior Mentor", "type": "mentor", "cost": "₹1,000"}],
                        "vendors": [{"name": "Coursera Meta Frontend Certificate", "type": "course", "cost": "₹3,000"}],
                        "institutions": [{"name": "freeCodeCamp Web Responsive", "type": "course", "cost": "Free"}],
                        "distributors": [{"name": "MDN Web Docs", "type": "docs", "cost": "Free"}]
                    }
                },
                "micro_view": {
                    "description": "Weekly hands-on DOM manipulation and CSS Flexbox/Grid exercises.",
                    "marketplace": {
                        "mentors": [],
                        "vendors": [{"name": "Scrimba Frontend Career Path", "type": "course", "cost": "₹2,500"}],
                        "institutions": [],
                        "distributors": []
                    }
                },
                "nano_view": {
                    "description": "1-on-1 code reviews on semantic markup and responsive layouts.",
                    "marketplace": {
                        "mentors": [{"name": "Web Accessibility Expert Review", "type": "mentor", "cost": "₹1,500"}],
                        "vendors": [],
                        "institutions": [],
                        "distributors": []
                    }
                }
            }
        ]
    }

    report = observer_agent.observe(
        roadmap=nested_roadmap,
        current_position="Beginner",
        target_goal="Full-Stack Web Developer",
        category="practical"
    )

    print(f"Marketplace Accuracy Score: {report['dimensions']['marketplace_accuracy']}/100")
    print(f"Total Navigable Items: {report['summary']['navigable_items_count']}")
    print(f"Warnings: {[w['message'] for w in report['warnings']]}")

    assert report["dimensions"]["marketplace_accuracy"] == 100.0, "Failed to extract items from nested macro/micro/nano views!"
    assert not any("marketplace recommendations" in w.get("message", "").lower() for w in report["warnings"]), "Should not warn about empty marketplace when nested views are populated!"
    print("[PASS] Test 4 completed successfully.")


def test_consolidated_marketplace_advisories():
    print("\n--- TEST 5: Repetitive Marketplace Advisory Consolidation ---")
    empty_market_roadmap = {
        "path_title": "Data Science Career Path",
        "path_description": "Roadmap with 6 steps that all lack marketplace entries.",
        "readiness_score": 75,
        "total_duration": "6 Months",
        "total_duration_months": 6,
        "steps": [
            {
                "id": i,
                "title": f"Milestone Phase {i}: Practical Applied Skills",
                "duration": "1 Month",
                "description": f"Perform comprehensive hands-on practice for milestone {i}.",
                "learning_objectives": ["Objective 1", "Objective 2"],
                "micro_steps": [{"task": "Task 1", "resource": "Docs"}]
                # No marketplace key provided
            }
            for i in range(1, 7)
        ]
    }

    report = observer_agent.observe(
        roadmap=empty_market_roadmap,
        current_position="Beginner Analyst",
        target_goal="Data Scientist",
        category="practical"
    )

    market_warnings = [
        w for w in report["warnings"]
        if "marketplace recommendations" in w.get("message", "").lower() or w.get("type") == "empty_marketplace"
    ]

    print(f"Observer Warnings count: {len(report['warnings'])}")
    for w in report["warnings"]:
        print(f"  - Advisory: {w.get('message')}")

    # Must NOT have 6 separate warnings! Must consolidate into EXACTLY 1 advisory!
    assert len(market_warnings) == 1, f"Expected exactly 1 consolidated marketplace advisory, got {len(market_warnings)}!"
    assert market_warnings[0]["message"] == "Marketplace recommendations need to be improved across all milestones."
    print("[PASS] Test 5 completed successfully.")


if __name__ == "__main__":
    test_high_quality_roadmap()
    test_flawed_roadmap_detection()
    test_category_contamination()
    test_nested_view_marketplaces()
    test_consolidated_marketplace_advisories()
    print("\n" + "=" * 60)
    print("ALL 5 OBSERVER AGENT TESTS PASSED WITH 100% SUCCESS!")
    print("=" * 60)
