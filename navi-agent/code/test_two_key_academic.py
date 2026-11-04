import asyncio
import json
import sys
import time

# Ensure UTF-8 output encoding for Windows terminal
sys.stdout.reconfigure(encoding='utf-8')

from main import (
    DynamicAcademicRequest,
    generate_two_key_parallel_academic_pathway,
    GROQ_KEY_1,
    GROQ_KEY_2
)

async def run_evaluation():
    print("======================================================================")
    print("🧪 NAAVI TWO-KEY PARALLEL ACADEMIC PATHWAY BENCHMARK EVALUATION")
    print(f"API Key 1: {GROQ_KEY_1[:7]}...{GROQ_KEY_1[-4:]}")
    print(f"API Key 2: {GROQ_KEY_2[:7]}...{GROQ_KEY_2[-4:]}")
    print("======================================================================\n")

    # Generic Bachelor's degree academic goal (Dynamic - no hardcoded assumptions)
    generic_student = {
        "academic_stage": "High School Graduate (Senior Secondary)",
        "current_grade_or_qualification": "Grade 12 Completion with Distinction (88%)",
        "academic_background": "Mathematics and Science Foundation",
        "academic_goal": "Bachelor of Science in Computer Science",
        "target_degree": "Bachelor of Science",
        "target_institution": "Accredited University",
        "target_country": "Global Higher Education Institution",
        "preferences": {"coursework_depth": "Standard Academic Progression"}
    }

    # Evaluate multiple step counts
    targets_to_evaluate = [5, 25]

    results_summary = []

    for target in targets_to_evaluate:
        print(f"\n▶ Testing Target: {target} steps...")
        req = DynamicAcademicRequest(
            academic_stage=generic_student["academic_stage"],
            current_grade_or_qualification=generic_student["current_grade_or_qualification"],
            academic_background=generic_student["academic_background"],
            academic_goal=generic_student["academic_goal"],
            target_degree=generic_student["target_degree"],
            target_institution=generic_student["target_institution"],
            target_country=generic_student["target_country"],
            preferences=generic_student["preferences"],
            target_steps=target
        )

        t_start = time.perf_counter()
        res = await generate_two_key_parallel_academic_pathway(req)
        t_elapsed = round(time.perf_counter() - t_start, 2)

        steps = res.get("steps", [])
        metrics = res.get("execution_metrics", {})
        capacity = res.get("token_and_capacity_analysis", {})

        print(f"✅ Generated {len(steps)} steps in {t_elapsed}s")
        print(f"   Key 1 calls: {metrics.get('key_1_requests')}, Key 2 calls: {metrics.get('key_2_requests')}")
        print(f"   Total tokens: {metrics.get('total_tokens')} (Key 1: {metrics.get('key_1_tokens')}, Key 2: {metrics.get('key_2_tokens')})")
        print(f"   Duplicates removed: {metrics.get('duplicate_steps_removed')}, 429 Errors: {metrics.get('rate_limit_errors_encountered')}")

        # Print first 3 and last 2 steps as sample
        print("   Sample Generated Steps:")
        for s in steps[:3]:
            print(f"     [{s['id']}] ({s.get('hierarchy_level', 'step')}) {s['title']} | Prereqs: {s.get('prerequisites', [])} | {s.get('duration')}")
        if len(steps) > 5:
            print("     ...")
            for s in steps[-2:]:
                print(f"     [{s['id']}] ({s.get('hierarchy_level', 'step')}) {s['title']} | Prereqs: {s.get('prerequisites', [])} | {s.get('duration')}")

        results_summary.append({
            "target": target,
            "generated_steps": len(steps),
            "time_seconds": t_elapsed,
            "total_tokens": metrics.get("total_tokens"),
            "key_1_calls": metrics.get("key_1_requests"),
            "key_2_calls": metrics.get("key_2_requests"),
            "duplicates": metrics.get("duplicate_steps_removed"),
            "rate_limit_errors": metrics.get("rate_limit_errors_encountered"),
            "capacity_analysis": capacity
        })

        # Pause to reset rate-limit token bucket before next target
        await asyncio.sleep(4.0)

    # Save benchmark results to file for complete reporting
    with open("benchmark_results.json", "w", encoding="utf-8") as f:
        json.dump(results_summary, f, indent=2)

    print("\n======================================================================")
    print("📊 BENCHMARK EVALUATION SUMMARY TABLE")
    print("======================================================================")
    for r in results_summary:
        print(f"Target: {r['target']:3d} | Steps: {r['generated_steps']:3d} | Time: {r['time_seconds']:6.1f}s | Tokens: {r['total_tokens']:5d} | Key 1 Calls: {r['key_1_calls']} | Key 2 Calls: {r['key_2_calls']} | Dups: {r['duplicates']}")
    print("======================================================================\n")

if __name__ == "__main__":
    asyncio.run(run_evaluation())
