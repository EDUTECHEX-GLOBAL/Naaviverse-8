import asyncio
import json
import sys
import time

sys.stdout.reconfigure(encoding='utf-8')

from main import (
    DynamicAcademicRequest,
    generate_two_key_parallel_academic_pathway,
)

async def test_100():
    print("======================================================================")
    print("🚀 EVALUATING 100 STEPS ACADEMIC PATHWAY GENERATION")
    print("======================================================================")

    req = DynamicAcademicRequest(
        academic_stage="High School Graduate (Senior Secondary)",
        current_grade_or_qualification="Grade 12 Distinction (88%)",
        academic_background="Mathematics and Science Foundation",
        academic_goal="Bachelor of Science in Computer Science",
        target_degree="Bachelor of Science",
        target_institution="Accredited University",
        target_country="Global Higher Education Institution",
        target_steps=100
    )

    t0 = time.perf_counter()
    res = await generate_two_key_parallel_academic_pathway(req)
    elapsed = time.perf_counter() - t0

    steps = res.get("steps", [])
    metrics = res.get("execution_metrics", {})
    capacity = res.get("token_and_capacity_analysis", {})

    print(f"\n======================================================================")
    print(f"🎯 100-STEP EVALUATION COMPLETE!")
    print(f"Total Steps Generated: {len(steps)}")
    print(f"Elapsed Time: {elapsed:.2f} seconds")
    print(f"Total Tokens: {metrics.get('total_tokens')} (Key 1: {metrics.get('key_1_tokens')}, Key 2: {metrics.get('key_2_tokens')})")
    print(f"API Calls: Key 1={metrics.get('key_1_requests')}, Key 2={metrics.get('key_2_requests')}")
    print(f"Rate Limit Retries: {metrics.get('retries_performed')}")
    print(f"Duplicates Removed: {metrics.get('duplicate_steps_removed')}")
    print(f"======================================================================\n")

    # Sample output structure
    print("Sample Steps across the 100-step pathway:")
    for s in steps[:3]:
        print(f"  Step {s['id']}: [{s.get('hierarchy_level')}] {s['title']} ({s.get('duration')}) - Prereqs: {s.get('prerequisites')}")
    print("  ...")
    mid = len(steps) // 2
    for s in steps[mid-1:mid+2]:
        print(f"  Step {s['id']}: [{s.get('hierarchy_level')}] {s['title']} ({s.get('duration')}) - Prereqs: {s.get('prerequisites')}")
    print("  ...")
    for s in steps[-3:]:
        print(f"  Step {s['id']}: [{s.get('hierarchy_level')}] {s['title']} ({s.get('duration')}) - Prereqs: {s.get('prerequisites')}")

    with open("results_100_steps.json", "w", encoding="utf-8") as f:
        json.dump(res, f, indent=2)

if __name__ == "__main__":
    asyncio.run(test_100())
