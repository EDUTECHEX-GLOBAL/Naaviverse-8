import sys
sys.path.append('navi-agent/code')
from observer_agent import observer_agent

# Build 70-step academic pathway
steps_70 = []
for i in range(1, 21):
    steps_70.append({
        "id": i,
        "title": f"Grade 11 Subject Module {i}: Advanced Calculus and Physics",
        "duration": "2 Weeks",
        "description": f"Master fundamentals of topic {i}.",
        "learning_objectives": [f"Solve exercises for module {i}"],
        "micro_steps": [{"task": "NCERT", "resource": "Book"}]
    })

for i in range(21, 41):
    steps_70.append({
        "id": i,
        "title": f"Grade 12 Senior Prep & Entrance Exam Practice {i-20}",
        "duration": "2 Weeks",
        "description": f"Timed mock test series for module {i-20}.",
        "learning_objectives": [f"Score 90%+ on test {i-20}"],
        "micro_steps": [{"task": "Mock Exam", "resource": "Portal"}]
    })

for i in range(41, 71):
    steps_70.append({
        "id": i,
        "title": f"Bachelor of Technology in Computer Science Core Course {i-40}: Data Structures & Algorithms",
        "duration": "4 Weeks",
        "description": f"Learn foundational and advanced algorithms for course {i-40}.",
        "learning_objectives": [f"Implement algorithms for course {i-40}"],
        "micro_steps": [{"task": "Lab Work", "resource": "Lab"}]
    })

roadmap_70 = {
    "path_title": "CBSE 11 to B.Tech Computer Science Degree Pathway",
    "total_duration": "6 Years (72 Months)",
    "total_duration_months": 72,
    "steps": steps_70
}

report = observer_agent.observe(
    roadmap=roadmap_70,
    current_position="Grade 11 • CBSE • Hyderabad, India",
    target_goal="Bachelor's • Computer Science • VIT",
    category="academic"
)

print("Step Count:", report["summary"]["step_count"])
print("Overall Quality Score:", report["overall_quality_score"])
print("Observer Status:", report["observer_status"])
print("Step Learning Order Score:", report["dimensions"]["step_learning_order"])
print("Path Structure Score:", report["dimensions"]["path_structure"])
print("Realistic Timeline Score:", report["dimensions"]["realistic_timeline"])
print("Issues Count:", len(report["issues"]))
for iss in report["issues"]:
    print(f"  - [{iss['severity']}] {iss['what_is_wrong']}")

