import asyncio
import os
import sys

# Ensure utf-8 output encoding for Windows terminal
sys.stdout.reconfigure(encoding='utf-8')

from main import generate_path, PathGenerationRequest

async def run_tests():
    # 1. Academic & Research
    req_acad = PathGenerationRequest(
        current_position="Grade 10 CBSE",
        target_goal="Bachelor's in Computer Science at Yale",
        content_category="Academic & Research"
    )
    res_acad = await generate_path(req_acad)
    alt_acad = res_acad["alternatives"][0]
    print(f"[ACADEMIC] Generated {len(alt_acad['steps'])} steps:")
    for s in alt_acad['steps']:
        print(f"  - Step {s['id']}: {s['title']} ({s['duration']})")

    # 2. Jobs & Careers
    req_jobs = PathGenerationRequest(
        current_position="Junior Software Engineer",
        target_goal="Senior Software Engineer",
        content_category="Jobs & Careers"
    )
    res_jobs = await generate_path(req_jobs)
    alt_jobs = res_jobs["alternatives"][0]
    print(f"\n[JOBS] Generated {len(alt_jobs['steps'])} steps:")
    for s in alt_jobs['steps']:
        print(f"  - Step {s['id']}: {s['title']} ({s['duration']})")

    # 3. Non-Academic Counselling (Mental Health)
    req_mh = PathGenerationRequest(
        current_position="Exam stress and anxiety",
        target_goal="Manage exam stress and build healthy routines",
        content_category="Non-Academic Counselling",
        sub_segment="Mental Health & Wellness"
    )
    res_mh = await generate_path(req_mh)
    alt_mh = res_mh["alternatives"][0]
    print(f"\n[MENTAL HEALTH] Generated {len(alt_mh['steps'])} steps:")
    for s in alt_mh['steps']:
        print(f"  - Step {s['id']}: {s['title']} ({s['duration']})")

asyncio.run(run_tests())
