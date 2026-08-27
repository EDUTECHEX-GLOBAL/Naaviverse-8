import asyncio
import os
from dotenv import load_dotenv
from groq import AsyncGroq

load_dotenv()
client = AsyncGroq(api_key=os.environ.get("GROQ_API_KEY"))

models_to_test = [
    "qwen/qwen3.8-27b",
    "qwen/qwen3.6-27b",
    "openai/gpt-oss-120b",
    "openai/gpt-oss-20b",
    "groq/compound",
    "groq/compound-mini"
]

async def test_models():
    for m in models_to_test:
        try:
            res = await client.chat.completions.create(
                model=m,
                messages=[{"role": "user", "content": 'Respond ONLY with JSON: {"hello": "world", "steps_count": 6}'}],
                max_tokens=100
            )
            print(f"[SUCCESS] {m}: {res.choices[0].message.content.strip()}")
        except Exception as e:
            print(f"[FAILED] {m}: {e}")

asyncio.run(test_models())
