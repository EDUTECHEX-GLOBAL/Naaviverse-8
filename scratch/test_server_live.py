import subprocess
import time
import urllib.request
import json
import sys

# Start uvicorn on port 8008
proc = subprocess.Popen(
    [sys.executable, "-m", "uvicorn", "main:app", "--port", "8008"],
    cwd="navi-agent/code",
    stdout=subprocess.PIPE,
    stderr=subprocess.STDOUT,
    text=True
)

try:
    print("Waiting 5 seconds for uvicorn to start...")
    time.sleep(5)
    
    # Test GET docs or root
    req = urllib.request.Request("http://127.0.0.1:8008/docs")
    with urllib.request.urlopen(req, timeout=5) as resp:
        print(f"GET /docs -> Status {resp.status}")
        assert resp.status == 200

    # Test POST /api/observer/observe
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
    
    post_data = json.dumps(test_payload).encode('utf-8')
    post_req = urllib.request.Request(
        "http://127.0.0.1:8008/api/observer/observe",
        data=post_data,
        headers={"Content-Type": "application/json"},
        method="POST"
    )
    with urllib.request.urlopen(post_req, timeout=5) as resp:
        print(f"POST /api/observer/observe -> Status {resp.status}")
        data = json.loads(resp.read().decode('utf-8'))
        print("Observer Status:", data.get("observer_status"))
        print("AI Score:", data.get("overall_quality_score"))
        print("Summary:", data.get("summary"))
        assert resp.status == 200
        assert "overall_quality_score" in data

    # Test GET /api/observer/research-dataset
    dataset_req = urllib.request.Request("http://127.0.0.1:8008/api/observer/research-dataset")
    with urllib.request.urlopen(dataset_req, timeout=5) as resp:
        print(f"GET /api/observer/research-dataset -> Status {resp.status}")
        ds_data = json.loads(resp.read().decode('utf-8'))
        print("Dataset count:", ds_data.get("count"))
        assert resp.status == 200

    print("\nSERVER TEST PASSED 100%! All endpoints working correctly.")

finally:
    proc.terminate()
    try:
        proc.wait(timeout=3)
    except Exception:
        proc.kill()
    print("Test server stopped.")

