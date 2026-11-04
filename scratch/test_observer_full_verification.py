import sys
sys.path.append('navi-agent/code')

from observer_agent import observer_agent

# 1. Test unreviewed pathway
roadmap = {
    "path_title": "Machine Learning Pathway",
    "total_duration": "12 Months",
    "total_duration_months": 12,
    "steps": [
        {
            "id": 1,
            "title": "Master Python and Calculus Fundamentals",
            "duration": "6 Months",
            "description": "Learn foundational programming and linear algebra.",
            "learning_objectives": ["Python syntax", "Matrix operations"],
            "micro_steps": [{"task": "Complete Exercises", "resource": "Python Docs"}],
            "marketplace": {
                "macro_free": [{"name": "MIT Linear Algebra OCW", "cost": "Free"}],
                "micro_structured": [{"name": "Coursera Python", "cost": "₹2,500"}]
            }
        },
        {
            "id": 2,
            "title": "Build Applied Machine Learning Models",
            "duration": "6 Months",
            "description": "Train scikit-learn models and deploy APIs.",
            "learning_objectives": ["Classification", "Regression"],
            "micro_steps": [{"task": "Kaggle competition", "resource": "Kaggle"}],
            "marketplace": {
                "macro_free": [{"name": "Scikit-learn Guides", "cost": "Free"}],
                "micro_structured": [{"name": "DeepLearning.AI ML Specialization", "cost": "₹4,000"}],
                "nano_expert": [{"name": "Senior ML Engineer 1-on-1", "cost": "₹2,000"}]
            }
        }
    ]
}

report_unreviewed = observer_agent.observe(
    roadmap=roadmap,
    current_position="College Student",
    target_goal="Machine Learning Engineer",
    path_id="path_test_101"
)

print("--- UNREVIEWED REPORT ---")
print("Observer Status:", report_unreviewed["observer_status"])
print("AI Score:", report_unreviewed["overall_quality_score"])
print("Has Human Review:", report_unreviewed["comparison"]["has_human_review"])
print("Human Status:", report_unreviewed["comparison"]["status"])
print("Human Status Label:", report_unreviewed["comparison"]["status_label"])
print("Human Score:", report_unreviewed["comparison"]["human_score"])

assert report_unreviewed["comparison"]["has_human_review"] is False
assert report_unreviewed["comparison"]["status_label"] == "Not Reviewed"
assert report_unreviewed["comparison"]["human_score"] is None

# 2. Test reviewed pathway
human_review_data = {
    "status": "reviewed",
    "overall_score": 88,
    "dimension_ratings": {
        "path_structure": 95,
        "step_learning_order": 90,
        "realistic_timeline": 85,
        "marketplace_quality": 80
    },
    "feedback": "Excellent pedagogical flow and strong practical labs.",
    "reviewer_email": "dean.ai@university.edu",
    "reviewed_at": "2026-11-04T12:00:00Z"
}

report_reviewed = observer_agent.observe(
    roadmap=roadmap,
    current_position="College Student",
    target_goal="Machine Learning Engineer",
    human_review=human_review_data,
    path_id="path_test_101"
)

print("\n--- REVIEWED REPORT ---")
comp = report_reviewed["comparison"]
print("Has Human Review:", comp["has_human_review"])
print("Human Score:", comp["human_score"])
print("Observer AI Score:", comp["observer_score"])
print("Score Difference:", comp["score_difference"], "points")
print("Agreement Level:", comp["agreement_level"])
print("Explanation:", comp["explanation"])
print("Reviewer:", comp["reviewer_email"])

assert comp["has_human_review"] is True
assert comp["human_score"] == 88
assert comp["score_difference"] == abs(88 - report_reviewed["overall_quality_score"])

# 3. Check Research Dataset Repository
dataset = observer_agent.get_research_dataset()
print(f"\nResearch Dataset Records Stored: {len(dataset)}")
assert len(dataset) >= 2
latest_record = dataset[-1]
print("Latest Record Path ID:", latest_record["path_id"])
print("Latest Record AI Score:", latest_record["observer_evaluation"]["overall_score"])
print("Latest Record Human Status:", latest_record["human_review"]["status"])
print("Latest Record Human Score:", latest_record["human_review"]["overall_score"])

print("\nALL VERIFICATIONS PASSED CLEANLY!")

