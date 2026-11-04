import sys
sys.path.append('navi-agent/code')

from starlette.testclient import TestClient
from main import app

client = TestClient(app)

# 1. Test /docs
resp = client.get("/docs")
print(f"GET /docs -> Status {resp.status_code}")
assert resp.status_code == 200

# 2. Test POST /api/observer/observe
test_payload = {
    "roadmap_data": {
        "path_title": "Test Path",
        "total_duration": "12 Months",
        "total_duration_months": 12,
        "steps": [
            {
                "id": 1,
                "title": "Master Python Basics",
                "duration": "6 Months",
                "description": "Learn syntax.",
                "learning_objectives": ["Python"],
                "micro_steps": [{"task": "Code"}]
            }
        ]
    },
    "current_position": "Beginner",
    "target_goal": "Python Developer"
}

resp_obs = client.post("/api/observer/observe", json=test_payload)
print(f"POST /api/observer/observe -> Status {resp_obs.status_code}")
assert resp_obs.status_code == 200
data = resp_obs.json()
print("Observer Status:", data.get("observer_status"))
print("AI Score:", data.get("overall_quality_score"))
print("Dimensions:", data.get("dimensions"))

# 3. Test GET /api/observer/research-dataset
resp_ds = client.get("/api/observer/research-dataset")
print(f"GET /api/observer/research-dataset -> Status {resp_ds.status_code}")
assert resp_ds.status_code == 200
print("Dataset record count:", resp_ds.json().get("count"))

print("\nALL IN-PROCESS SERVER ENDPOINTS VERIFIED 100% HEALTHY!")

