import asyncio
import os
import json
from dotenv import load_dotenv
from groq import AsyncGroq

load_dotenv()
client = AsyncGroq(api_key=os.environ.get("GROQ_API_KEY"))

prompt = """You are the Naaviverse Pathway Blueprint Generator (Agent 1).
Generate a JSON roadmap for a Grade 10 CBSE student wanting to do Bachelor in CS at Yale University.

Respond ONLY with valid JSON:
{
  "path_title": "Academic & Research Pathway: Grade 10 to Yale CS",
  "path_description": "A comprehensive multi-year pathway...",
  "readiness_score": 30,
  "readiness_label": "Early Starter",
  "total_duration": "36 months",
  "blind_spots": ["SAT preparation timeline", "Extracurricular profile depth"],
  "steps": [
    {
      "id": 1,
      "title": "Grade 10 Curriculum & Stream Selection",
      "duration": "Months 1-4",
      "description": "Establish core subject combinations and target 95%+ in board exams.",
      "learning_objectives": ["Select science stream with Math", "Achieve top grades"],
      "micro_steps": [{"task": "Complete diagnostic test", "resource": "CBSE Portal"}]
    }
  ]
}

CRITICAL: Generate between 6 and 9 genuinely distinct milestones spanning the 36-month timeline.
"""

async def test():
    res = await client.chat.completions.create(
        model="openai/gpt-oss-120b",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=3200,
        temperature=0.3
    )
    raw = res.choices[0].message.content.strip("`").replace("```json", "").replace("```", "").strip()
    parsed = json.loads(raw)
    print("SUCCESS! Steps generated:", len(parsed.get("steps", [])))
    for s in parsed.get("steps", []):
        print(f" - Step {s.get('id')}: {s.get('title')} ({s.get('duration')})")

asyncio.run(test())
