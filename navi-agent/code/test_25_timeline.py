import asyncio
import json
from main import generate_two_key_parallel_academic_pathway, DynamicAcademicRequest

async def test_25():
    req = DynamicAcademicRequest(
        academic_stage="Grade 11",
        academic_goal="Bachelor's degree admission",
        target_institution="University of Warwick",
        target_degree="B.Sc. Statistics",
        target_country="UK",
        target_steps=25
    )
    p = await generate_two_key_parallel_academic_pathway(req)
    print("Steps count:", p["total_steps_generated"])
    print(f"Total duration: {p['total_duration']} ({p['total_duration_months']}m)")
    print("Timeline valid:", p["timeline_validation"]["is_valid"])
    print("Timeline issues:", p["timeline_validation"]["issues"])
    print("Month coverage count:", len(p["month_by_month_timeline"]))
    parallel_count = sum(1 for s in p["steps"] if s.get("can_parallel"))
    print("Parallel tasks count:", parallel_count)
    print("First 8 steps:")
    for s in p["steps"][:8]:
        t_safe = s["title"][:40].encode("ascii", "replace").decode("ascii")
        print(f"  Step {s['id']:2d}: {t_safe:<40} | {s['duration']:<12} (M{s['start_month']}-M{s['end_month']}) | Par: {s['can_parallel']}")
    print(f"Month 1 active: {len(p['month_by_month_timeline']['1'])} steps")
    print(f"Month 24 active: {len(p['month_by_month_timeline']['24'])} steps")

if __name__ == "__main__":
    asyncio.run(test_25())
