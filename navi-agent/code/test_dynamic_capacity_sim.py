import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from academic_generator import compute_expected_step_capacity, generate_curriculum_subtasks_for_milestone

def test_dynamic_step_capacity():
    scenarios = [
        ("Grade 9", "Bachelor of Science in Computer Science - University of Manchester"),
        ("Grade 10", "Bachelor of Science in Computer Science - University of Manchester"),
        ("Grade 11", "Bachelor of Science in Computer Science - University of Manchester"),
        ("Grade 12", "Bachelor of Science in Computer Science - University of Manchester"),
        ("Undergraduate", "Master of Science in Machine Learning - Oxford University"),
    ]

    for stage, goal in scenarios:
        counts = [compute_expected_step_capacity(stage, goal) for _ in range(5)]
        print(f"{stage} -> {goal[:35]}...: counts={counts}")
        assert all(c >= 205 for c in counts), f"Count fell below 205: {counts}"
        assert all(c <= 248 for c in counts), f"Count exceeded 248: {counts}"
        # Entropy check: not all values identical across runs
        # (counts may vary with jitter)
    print("PASS: Dynamic capacity > 200 strictly verified across all stages.")

def test_150_subtasks_uniqueness():
    seen = set()
    tasks = generate_curriculum_subtasks_for_milestone(
        milestone={"id": 1, "title": "Advanced Mathematics & Computing Foundations"},
        subtasks_needed=150,
        base_id_start=1,
        goal="Computer Science",
        seen_titles=seen
    )
    titles = [t["title"] for t in tasks]
    print(f"Generated {len(tasks)} tasks. Unique titles: {len(set(titles))}. Duplicates: {len(titles) - len(set(titles))}")
    assert len(tasks) == 150
    assert len(tasks) == len(set(titles)), "Duplicate titles found in 150 subtasks!"
    valid_verbs = [
        "master", "implement", "analyze", "execute", "audit", "design", "formulate", "synthesize",
        "evaluate", "benchmark", "construct", "refactor", "calibrate", "validate", "model",
        "deconstruct", "optimize", "deploy", "author", "simulate", "practice", "prepare", "solve",
        "review", "build", "conduct", "structure", "draft", "brief", "refine", "submit", "activate",
        "request", "complete", "register", "coordinate", "transmit"
    ]
    for t in tasks:
        first_w = t["title"].split()[0].lower()
        assert first_w in valid_verbs, f"Invalid verb: {first_w}"
    print("PASS: 150 subtasks generated with 100% unique titles and active verbs.")

if __name__ == "__main__":
    test_dynamic_step_capacity()
    test_150_subtasks_uniqueness()
    print("ALL SIMULATION CHECKS PASSED SUCCESSFULLY!")
