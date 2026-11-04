import asyncio
import sys

sys.stdout.reconfigure(encoding='utf-8')
from main import generate_path, PathGenerationRequest

async def test_ui_scenario():
    print("======================================================================")
    print("🧪 TESTING USER UI SCENARIO WITH 4 GROQ KEYS (ACADEMICS)")
    print("======================================================================")
    req = PathGenerationRequest(
        current_position="Grade 11 • General (K-10) Stream • CBSE • little flower • Hyderabad, Telangana, India",
        target_goal="Bachelor's • Statistics • University of Warwick • UK",
        content_category="Academics",
        sub_segment="Undergraduate (Bachelor's)"
    )
    res = await generate_path(req)
    alt = res["alternatives"][0]
    steps = alt["steps"]
    print(f"\n🎯 GENERATION COMPLETE! Total steps generated: {len(steps)}")
    print(f"Path Title: {alt.get('path_title')}")
    print(f"Total Duration: {alt.get('total_duration')}")
    print(f"Readiness Score: {alt.get('readiness_score')}%")
    print(f"\nStep List Breakdown (First 5 and Last 5):")
    for s in steps[:5]:
        print(f"  Step {s['id']}: {s['title']} | Duration: {s.get('duration')}")
    print("  ...")
    for s in steps[-5:]:
        print(f"  Step {s['id']}: {s['title']} | Duration: {s.get('duration')}")

if __name__ == "__main__":
    asyncio.run(test_ui_scenario())
