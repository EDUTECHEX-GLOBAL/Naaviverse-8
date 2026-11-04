import sys

with open('navi-agent/code/main.py', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add research_evaluations_collection and attach to observer_agent
target_db = '''marketplace_feedback_collection = db.marketplace_feedback'''
replacement_db = '''marketplace_feedback_collection = db.marketplace_feedback
research_evaluations_collection = db.research_evaluations

try:
    from observer_agent import observer_agent
    observer_agent.db = db
except Exception:
    pass'''

if target_db in content:
    content = content.replace(target_db, replacement_db, 1)
    print("1. DB collections updated.")
else:
    print("1. Target DB not found!")

# 1b. Startup collection create
target_cols = '["profiles", "pending_paths", "published_paths", "generation_history", "admin_feedbacks", "marketplace_feedback"]'
replacement_cols = '["profiles", "pending_paths", "published_paths", "generation_history", "admin_feedbacks", "marketplace_feedback", "research_evaluations"]'
if target_cols in content:
    content = content.replace(target_cols, replacement_cols, 1)
    print("1b. Startup collections list updated.")
else:
    print("1b. Target startup cols not found!")

# 2. Update ObserverAuditRequest and add HumanReviewSubmission
target_req = '''class ObserverAuditRequest(BaseModel):
    roadmap_data: dict
    current_position: str
    target_goal: str
    profile: Optional[dict] = None
    category: Optional[str] = "academic"
    sub_segment: Optional[str] = None'''

replacement_req = '''class ObserverAuditRequest(BaseModel):
    roadmap_data: dict
    current_position: str
    target_goal: str
    profile: Optional[dict] = None
    category: Optional[str] = "academic"
    sub_segment: Optional[str] = None
    human_review: Optional[dict] = None
    path_id: Optional[str] = None

class HumanReviewSubmission(BaseModel):
    overall_score: float
    dimension_ratings: Optional[dict] = None
    feedback: Optional[str] = None
    reviewer_email: Optional[str] = "admin@naavi.com"'''

if target_req in content:
    content = content.replace(target_req, replacement_req, 1)
    print("2. ObserverAuditRequest & HumanReviewSubmission updated.")
else:
    print("2. Target ObserverAuditRequest not found!")

# 3. Update /api/path/score to use Observer Agent
target_score = '''@app.post("/api/path/score")
async def get_path_score(req: PathScoreRequest):
    profile = req.profile or {}
    current = req.current_position or ""
    return calculate_path_accuracy_score(req.roadmap_data, profile, current)'''

replacement_score = '''@app.post("/api/path/score")
async def get_path_score(req: PathScoreRequest):
    profile = req.profile or {}
    current = req.current_position or ""
    from observer_agent import observer_agent
    report = observer_agent.observe(
        roadmap=req.roadmap_data,
        current_position=current,
        target_goal="",
        profile=profile,
        category="academic"
    )
    return {
        "accuracy_score": report["overall_quality_score"],
        "accuracy_label": report["status_label"],
        "accuracy_color": report["status_color"],
        "breakdown": report["dimensions"],
        "details": report["summary"],
        "observer_report": report
    }'''

if target_score in content:
    content = content.replace(target_score, replacement_score, 1)
    print("3. /api/path/score updated.")
else:
    print("3. Target /api/path/score not found!")

# 4. Streamed path generation observer attachment
target_stream_acc = '''                accuracy = calculate_path_accuracy_score(final_json, profile, current, goal)
                final_json["accuracy_score"] = accuracy["accuracy_score"]
                final_json["accuracy_label"] = accuracy["accuracy_label"]
                final_json["accuracy_color"] = accuracy["accuracy_color"]
                final_json["accuracy_breakdown"] = accuracy["breakdown"]
                final_json["accuracy_details"] = accuracy["details"]
                try:
                    from observer_agent import observer_agent
                    final_json["observer_report"] = observer_agent.observe(
                        roadmap=final_json,
                        current_position=current,
                        target_goal=goal,
                        profile=profile,
                        category=cat,
                        sub_segment=sub_seg
                    )
                except Exception as obs_err:
                    print(f"[Observer Audit Notice] {obs_err}")'''

replacement_stream_acc = '''                try:
                    from observer_agent import observer_agent
                    obs_report = observer_agent.observe(
                        roadmap=final_json,
                        current_position=current,
                        target_goal=goal,
                        profile=profile,
                        category=cat,
                        sub_segment=sub_seg
                    )
                    final_json["observer_evaluation"] = obs_report
                    final_json["observer_report"] = obs_report
                    final_json["accuracy_score"] = obs_report["overall_quality_score"]
                    final_json["accuracy_label"] = obs_report["status_label"]
                    final_json["accuracy_color"] = obs_report["status_color"]
                    final_json["accuracy_breakdown"] = obs_report["dimensions"]
                    final_json["accuracy_details"] = obs_report["summary"]
                    final_json["human_review"] = {
                        "status": "not_reviewed",
                        "overall_score": None,
                        "feedback": None,
                        "reviewed_at": None,
                        "reviewer_email": None
                    }
                    final_json["score_comparison"] = obs_report.get("comparison", {})
                except Exception as obs_err:
                    print(f"[Observer Audit Notice] {obs_err}")'''

if target_stream_acc in content:
    content = content.replace(target_stream_acc, replacement_stream_acc, 1)
    print("4. Streamed path accuracy calculation updated.")
else:
    print("4. Target stream acc not found!")

# 5. Alternatives path generation observer attachment
target_alt_acc = '''            accuracy = calculate_path_accuracy_score(final_json, profile, current, goal)
            final_json["accuracy_score"] = accuracy["accuracy_score"]
            final_json["accuracy_label"] = accuracy["accuracy_label"]
            final_json["accuracy_color"] = accuracy["accuracy_color"]
            final_json["accuracy_breakdown"] = accuracy["breakdown"]
            final_json["accuracy_details"] = accuracy["details"]'''

replacement_alt_acc = '''            try:
                from observer_agent import observer_agent
                obs_report = observer_agent.observe(
                    roadmap=final_json,
                    current_position=current,
                    target_goal=goal,
                    profile=profile,
                    category=cat,
                    sub_segment=sub_seg
                )
                final_json["observer_evaluation"] = obs_report
                final_json["observer_report"] = obs_report
                final_json["accuracy_score"] = obs_report["overall_quality_score"]
                final_json["accuracy_label"] = obs_report["status_label"]
                final_json["accuracy_color"] = obs_report["status_color"]
                final_json["accuracy_breakdown"] = obs_report["dimensions"]
                final_json["accuracy_details"] = obs_report["summary"]
                final_json["human_review"] = {
                    "status": "not_reviewed",
                    "overall_score": None,
                    "feedback": None,
                    "reviewed_at": None,
                    "reviewer_email": None
                }
                final_json["score_comparison"] = obs_report.get("comparison", {})
            except Exception as obs_err:
                print(f"[Observer Audit Notice] {obs_err}")'''

if target_alt_acc in content:
    content = content.replace(target_alt_acc, replacement_alt_acc, 1)
    print("5. Alternatives path accuracy calculation updated.")
else:
    print("5. Target alt acc not found!")

# 6. Observer endpoints: /api/observer/observe, /api/observer/paths/{path_id}, human-review, research-dataset
target_obs_endpoints = '''@app.post("/api/observer/observe")
async def api_observer_audit(req: ObserverAuditRequest):
    from observer_agent import observer_agent
    return observer_agent.observe(
        roadmap=req.roadmap_data,
        current_position=req.current_position,
        target_goal=req.target_goal,
        profile=req.profile,
        category=req.category,
        sub_segment=req.sub_segment
    )

@app.get("/api/observer/paths/{path_id}")
async def api_observer_audit_path_id(path_id: str):
    from observer_agent import observer_agent
    try:
        obj_id = ObjectId(path_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid path ID format")

    doc = await pending_paths_collection.find_one({"_id": obj_id})
    if not doc:
        doc = await published_paths_collection.find_one({"_id": obj_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Career path not found")

    roadmap_data = doc.get("roadmap_data") or {}
    current = doc.get("current_position") or ""
    goal = doc.get("target_goal") or ""
    profile = doc.get("profile") or {}
    category = profile.get("activeSegment") or "academic"

    return observer_agent.observe(
        roadmap=roadmap_data,
        current_position=current,
        target_goal=goal,
        profile=profile,
        category=category
    )'''

replacement_obs_endpoints = '''@app.post("/api/observer/observe")
async def api_observer_audit(req: ObserverAuditRequest):
    from observer_agent import observer_agent
    return observer_agent.observe(
        roadmap=req.roadmap_data,
        current_position=req.current_position,
        target_goal=req.target_goal,
        profile=req.profile,
        category=req.category,
        sub_segment=req.sub_segment,
        human_review=req.human_review,
        path_id=req.path_id
    )

@app.get("/api/observer/paths/{path_id}")
async def api_observer_audit_path_id(path_id: str):
    from observer_agent import observer_agent
    try:
        obj_id = ObjectId(path_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid path ID format")

    doc = await pending_paths_collection.find_one({"_id": obj_id})
    if not doc:
        doc = await published_paths_collection.find_one({"_id": obj_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Career path not found")

    roadmap_data = doc.get("roadmap_data") or {}
    current = doc.get("current_position") or ""
    goal = doc.get("target_goal") or ""
    profile = doc.get("profile") or {}
    category = profile.get("activeSegment") or "academic"
    human_review = doc.get("human_review")

    return observer_agent.observe(
        roadmap=roadmap_data,
        current_position=current,
        target_goal=goal,
        profile=profile,
        category=category,
        human_review=human_review,
        path_id=path_id
    )

@app.post("/api/observer/paths/{path_id}/human-review")
async def api_submit_human_review(path_id: str, req: HumanReviewSubmission):
    try:
        obj_id = ObjectId(path_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid path ID format")

    doc = await pending_paths_collection.find_one({"_id": obj_id})
    target_col = pending_paths_collection
    if not doc:
        doc = await published_paths_collection.find_one({"_id": obj_id})
        target_col = published_paths_collection
    if not doc:
        raise HTTPException(status_code=404, detail="Career path not found")

    from datetime import datetime, timezone
    human_rev = {
        "status": "reviewed",
        "overall_score": round(float(req.overall_score), 1),
        "dimension_ratings": req.dimension_ratings or {},
        "feedback": req.feedback or "",
        "reviewer_email": req.reviewer_email or "admin@naavi.com",
        "reviewed_at": datetime.now(timezone.utc).isoformat()
    }

    await target_col.update_one(
        {"_id": obj_id},
        {"$set": {"human_review": human_rev}}
    )

    from observer_agent import observer_agent
    roadmap_data = doc.get("roadmap_data") or {}
    current = doc.get("current_position") or ""
    goal = doc.get("target_goal") or ""
    profile = doc.get("profile") or {}
    category = profile.get("activeSegment") or "academic"

    report = observer_agent.observe(
        roadmap=roadmap_data,
        current_position=current,
        target_goal=goal,
        profile=profile,
        category=category,
        human_review=human_rev,
        path_id=path_id
    )

    if research_evaluations_collection is not None:
        try:
            await research_evaluations_collection.update_many(
                {"path_id": path_id},
                {"$set": {
                    "human_review": human_rev,
                    "comparison": report["comparison"]
                }}
            )
        except Exception as e:
            print(f"[Research dataset update notice] {e}")

    return {
        "success": True,
        "human_review": human_rev,
        "comparison": report["comparison"],
        "observer_score": report["overall_quality_score"]
    }

@app.get("/api/observer/research-dataset")
async def api_get_research_dataset(limit: int = 50):
    from observer_agent import observer_agent
    if research_evaluations_collection is not None:
        try:
            cursor = research_evaluations_collection.find({}, {"_id": 0}).sort("created_at", -1).limit(limit)
            records = await cursor.to_list(length=limit)
            if records:
                return {"records": records, "count": len(records), "source": "database"}
        except Exception as e:
            print(f"[Dataset fetch notice] {e}")
    records = observer_agent.get_research_dataset(limit=limit)
    return {"records": records, "count": len(records), "source": "in_memory"}'''

if target_obs_endpoints in content:
    content = content.replace(target_obs_endpoints, replacement_obs_endpoints, 1)
    print("6. Observer endpoints updated.")
else:
    print("6. Target observer endpoints not found!")

with open('navi-agent/code/main.py', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated main.py successfully!")

