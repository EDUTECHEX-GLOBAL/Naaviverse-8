import asyncio
import json
import duration_service
from main import generate_two_key_parallel_academic_pathway, DynamicAcademicRequest

async def run_stage_duration_tests():
    print("=" * 70)
    print("TEST 1: DYNAMIC DURATION CALCULATION ACROSS ALL 4 STARTING GRADES")
    print("=" * 70)
    
    stages = ["Grade 9", "Grade 10", "Grade 11", "Grade 12"]
    goal = "Bachelor's degree admission"
    
    results = {}
    for st in stages:
        res = duration_service.calculate_path_duration(st, goal)
        total_m = res["total_duration_months"]
        results[st] = {
            "total_months": total_m,
            "total_duration": res["total_duration"],
            "stages": [(s["stage"], s["months"], s["notes"]) for s in res["calculation"]]
        }
        print(f"\n[Starting Stage: {st}] -> Academic Goal: {goal}")
        print(f"  Calculated Total Duration: {res['total_duration']} ({total_m} Months)")
        print("  Academic Stage Breakdown:")
        for s in res["calculation"]:
            print(f"    - {s['stage']}: {s['months']}m ({s['notes']})")

    # Assert logical progression: Grade 9 > Grade 10 > Grade 11 > Grade 12
    assert results["Grade 9"]["total_months"] == 48, f"Expected 48m, got {results['Grade 9']['total_months']}"
    assert results["Grade 10"]["total_months"] == 36, f"Expected 36m, got {results['Grade 10']['total_months']}"
    assert results["Grade 11"]["total_months"] == 24, f"Expected 24m, got {results['Grade 11']['total_months']}"
    assert results["Grade 12"]["total_months"] == 12, f"Expected 12m, got {results['Grade 12']['total_months']}"
    print("\n>>> All 4 Duration Invariants Verified Successfully! <<<")


async def run_end_to_end_parallel_test(grade: str, target_steps: int = 5):
    print("\n" + "=" * 70)
    print(f"TEST 2: GENERATION & STEP-WISE TIMELINE ALIGNMENT FOR {grade}")
    print("=" * 70)
    
    req = DynamicAcademicRequest(
        academic_stage=grade,
        current_position=grade,
        academic_goal="Bachelor's degree admission",
        target_goal="Bachelor's degree admission",
        target_degree="Bachelor of Science",
        target_institution="University of Edinburgh",
        target_country="UK",
        academic_background="Mathematics and Sciences",
        target_steps=target_steps
    )
    
    pathway = await generate_two_key_parallel_academic_pathway(req)
    
    print(f"\n[Result for {grade}]")
    print(f"Path Title: {pathway['path_title']}")
    print(f"Total Duration: {pathway['total_duration']} ({pathway['total_duration_months']} Months)")
    print(f"Total Steps Generated: {pathway['total_steps_generated']}")
    print(f"Timeline Validation Status: {pathway['timeline_validation']}")
    
    steps = pathway["steps"]
    m_by_m = pathway["month_by_month_timeline"]
    
    print("\nSample Scheduled Steps:")
    for s in steps[:8]:
        pr = s.get("prerequisites", [])
        par = s.get("can_parallel", False)
        title_safe = s['title'][:45].encode('ascii', 'replace').decode('ascii')
        dur_safe = s['duration'].encode('ascii', 'replace').decode('ascii')
        print(f"  Step {s['id']:2d}: {title_safe:<45} | {dur_safe:<12} (M{s['start_month']}-M{s['end_month']}) | Prereqs: {str(pr):<8} | Parallel: {str(par):<5}")
        
    print(f"\nMonth-by-Month Timeline Coverage: {len(m_by_m)} months mapped.")
    first_month = "1"
    last_month = str(pathway["total_duration_months"])
    m1_titles = [x['title'][:30].encode('ascii', 'replace').decode('ascii') for x in m_by_m.get(first_month, [])]
    last_titles = [x['title'][:30].encode('ascii', 'replace').decode('ascii') for x in m_by_m.get(last_month, [])]
    print(f"  Month 1 Steps ({len(m_by_m.get(first_month, []))} active): {m1_titles}")
    print(f"  Month {last_month} Steps ({len(m_by_m.get(last_month, []))} active): {last_titles}")
    
    return pathway

async def main():
    await run_stage_duration_tests()
    
    # Test Grade 10 (36 months) and Grade 11 (24 months) and Grade 12 (12 months) and Grade 9 (48 months)
    for g in ["Grade 10", "Grade 11", "Grade 12", "Grade 9"]:
        await run_end_to_end_parallel_test(g, target_steps=5)

if __name__ == "__main__":
    asyncio.run(main())
