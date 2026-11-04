import re
import math
from typing import List, Dict, Any, Tuple, Optional

def parse_duration_to_months(dur_str: str) -> float:
    """Converts days, weeks, or months strings to duration in months."""
    if not dur_str:
        return 1.0
    s = str(dur_str).lower().strip()
    
    # Check for explicit months: "2 months", "1.5 months", "1 month"
    m_mo = re.search(r'([\d\.]+)\s*(?:month|mo)', s)
    if m_mo:
        val = float(m_mo.group(1))
        return max(1.0, round(val))
    
    # Check for weeks: "2 weeks", "4 weeks", "6 weeks"
    m_wk = re.search(r'([\d\.]+)\s*(?:week|wk)', s)
    if m_wk:
        weeks = float(m_wk.group(1))
        if weeks <= 2:
            return 1.0
        elif weeks <= 5:
            return 1.0
        elif weeks <= 9:
            return 2.0
        else:
            return max(1.0, round(weeks / 4.0))

    # Check for days: "10 days", "30 days"
    m_day = re.search(r'(\d+)\s*day', s)
    if m_day:
        days = int(m_day.group(1))
        return max(1.0, round(days / 30.0))
        
    # Check for plain digits
    m_dig = re.search(r'\d+', s)
    if m_dig:
        return max(1.0, float(m_dig.group(0)))
        
    return 1.0


def schedule_academic_steps_timeline(
    steps: List[Dict[str, Any]],
    total_duration_months: int,
    current_stage: str,
    target_goal: str,
    calculation_stages: Optional[List[Dict[str, Any]]] = None
) -> Tuple[List[Dict[str, Any]], Dict[str, List[Dict[str, Any]]]]:
    """
    Dependency-based DAG timeline scheduling algorithm.
    Schedules individual steps across months 1..total_duration_months based on:
    - Task dependencies (prerequisites)
    - Parallel capability (can_parallel)
    - Natural academic stage windows (Grade 9, 10, 11, 12, admissions, visa, enrollment)
    - Critical path analysis
    Returns: (scheduled_steps, month_by_month_timeline)
    """
    if not steps:
        return [], {}

    # 1. Determine Stage Windows from calculation_stages
    stages_windows = []
    curr_m = 1
    if calculation_stages:
        for st in calculation_stages:
            st_months = st.get("months", 0)
            if st_months > 0:
                end_m = curr_m + st_months - 1
                stages_windows.append({
                    "stage_name": st.get("stage", ""),
                    "stage_type": st.get("stage_type", ""),
                    "start_month": curr_m,
                    "end_month": end_m,
                    "months": st_months
                })
                curr_m = end_m + 1
    else:
        stages_windows.append({
            "stage_name": "Academic Progression to Goal",
            "stage_type": "full_journey",
            "start_month": 1,
            "end_month": total_duration_months,
            "months": total_duration_months
        })

    num_steps = len(steps)
    scheduled_steps: List[Dict[str, Any]] = []
    
    # Map step id to its position
    id_to_step: Dict[int, Dict[str, Any]] = {}
    
    # 2. Stage partitioning: Assign each step to its logical academic stage
    num_windows = len(stages_windows)
    
    for idx, s in enumerate(steps):
        s_copy = dict(s)
        s_id = s_copy.get("id", idx + 1)
        s_copy["id"] = s_id
        
        # Determine parent milestone / stage
        p_milestone = s_copy.get("parent_milestone") or s_copy.get("academic_stage") or ""
        matched_window = None
        if p_milestone:
            for w in stages_windows:
                if (w["stage_name"].lower() in p_milestone.lower() or
                    p_milestone.lower() in w["stage_name"].lower()):
                    matched_window = w
                    break
                    
        if not matched_window:
            # Distribute proportionally across stage windows
            win_idx = min(int(idx * num_windows / num_steps), num_windows - 1)
            matched_window = stages_windows[win_idx]
            
        s_copy["_window"] = matched_window
        s_copy["parent_milestone"] = p_milestone or matched_window["stage_name"]
        
        # Parallel capability detection
        title_desc = f"{s_copy.get('title', '')} {s_copy.get('description', '')}".lower()
        can_par = s_copy.get("can_parallel")
        if can_par is None:
            if any(k in title_desc for k in [
                "research", "shortlist", "explore", "english", "ielts", "toefl", "pte",
                "sat", "act", "standardized", "recommendation", "extracurricular",
                "portfolio", "profile building", "drafting essay", "reviewing requirements"
            ]) and not any(k in title_desc for k in ["final submission", "submit application", "visa interview", "enrollment", "matriculation"]):
                can_par = True
            else:
                can_par = False
        s_copy["can_parallel"] = bool(can_par)
        
        # Base duration in months
        raw_dur = s_copy.get("duration") or s_copy.get("duration_months") or "1 Month"
        base_dur_m = parse_duration_to_months(str(raw_dur))
        s_copy["_base_duration_months"] = base_dur_m
        
        id_to_step[s_id] = s_copy
        scheduled_steps.append(s_copy)

    # 3. Topological forward-pass scheduling
    for idx, s in enumerate(scheduled_steps):
        s_id = s["id"]
        win = s["_window"]
        win_start = win["start_month"]
        win_end = win["end_month"]
        
        prereqs = s.get("prerequisites", [])
        if isinstance(prereqs, int):
            prereqs = [prereqs]
        elif not isinstance(prereqs, list):
            prereqs = []
            
        # Filter valid prereqs
        valid_prereqs = [p for p in prereqs if p in id_to_step and p != s_id]
        s["prerequisites"] = valid_prereqs
        
        earliest_start = win_start
        
        if valid_prereqs:
            for p_id in valid_prereqs:
                p_step = id_to_step[p_id]
                p_end = p_step.get("end_month", win_start)
                if s["can_parallel"] and p_step.get("can_parallel"):
                    earliest_start = max(earliest_start, p_step.get("start_month", win_start))
                else:
                    earliest_start = max(earliest_start, p_end + 1)
        else:
            stage_steps = [x for x in scheduled_steps if x["_window"] == win]
            step_pos_in_stage = stage_steps.index(s)
            num_stage_steps = len(stage_steps)
            if num_stage_steps > 1 and not s["can_parallel"]:
                stage_span = max(1, win_end - win_start)
                offset = int(step_pos_in_stage * stage_span / num_stage_steps)
                earliest_start = max(earliest_start, win_start + offset)
                
        start_m = min(earliest_start, total_duration_months)
        
        dur_m = int(s["_base_duration_months"])
        end_m = min(start_m + dur_m - 1, total_duration_months)
        if end_m < start_m:
            end_m = start_m
            
        dur_m = end_m - start_m + 1
        
        s["start_month"] = start_m
        s["end_month"] = end_m
        s["duration_months"] = dur_m
        
        if start_m == end_m:
            s["duration"] = f"Month {start_m}"
        else:
            s["duration"] = f"Month {start_m}\u2013{end_m}"

    # 4. Final step alignment: Ensure the final admission milestone ends at total_duration_months
    if scheduled_steps:
        last_step = scheduled_steps[-1]
        if last_step["end_month"] < total_duration_months:
            last_step["end_month"] = total_duration_months
            last_step["duration_months"] = last_step["end_month"] - last_step["start_month"] + 1
            if last_step["start_month"] == last_step["end_month"]:
                last_step["duration"] = f"Month {last_step['start_month']}"
            else:
                last_step["duration"] = f"Month {last_step['start_month']}\u2013{last_step['end_month']}"

    # Clean up internal temporary fields
    for s in scheduled_steps:
        s.pop("_window", None)
        s.pop("_base_duration_months", None)
        if not s.get("completion_criteria"):
            s["completion_criteria"] = f"Verified completion of {s.get('title', 'milestone')} objectives."

    # 5. Month-Wise Categorization
    month_by_month: Dict[str, List[Dict[str, Any]]] = {}
    for m in range(1, total_duration_months + 1):
        month_str = str(m)
        month_by_month[month_str] = []
        for s in scheduled_steps:
            if s["start_month"] <= m <= s["end_month"]:
                month_by_month[month_str].append({
                    "step_id": s["id"],
                    "title": s["title"],
                    "parent_milestone": s.get("parent_milestone", ""),
                    "duration": s["duration"],
                    "can_parallel": s["can_parallel"],
                    "start_month": s["start_month"],
                    "end_month": s["end_month"],
                    "completion_criteria": s.get("completion_criteria", "")
                })

    return scheduled_steps, month_by_month


def validate_academic_step_timeline(
    steps: List[Dict[str, Any]],
    total_duration_months: int
) -> Tuple[bool, List[str]]:
    issues = []
    id_map = {s["id"]: s for s in steps}
    
    if not steps:
        return False, ["No steps provided to validate."]
        
    for s in steps:
        s_id = s.get("id")
        start = s.get("start_month")
        end = s.get("end_month")
        
        if start is None or end is None:
            issues.append(f"Step {s_id} is missing start_month or end_month.")
            continue
            
        if start < 1:
            issues.append(f"Step {s_id} start_month ({start}) is < 1.")
        if end > total_duration_months:
            issues.append(f"Step {s_id} end_month ({end}) exceeds total duration ({total_duration_months}m).")
        if start > end:
            issues.append(f"Step {s_id} start_month ({start}) > end_month ({end}).")
            
        # Check prerequisites
        for p_id in s.get("prerequisites", []):
            if p_id in id_map:
                p = id_map[p_id]
                p_end = p.get("end_month", 0)
                p_start = p.get("start_month", 0)
                if not (s.get("can_parallel") and p.get("can_parallel")):
                    if start <= p_end and start < p_start:
                        issues.append(
                            f"Step {s_id} ('{s.get('title')}', starts M{start}) starts before prerequisite "
                            f"Step {p_id} ('{p.get('title')}', finishes M{p_end}) is completed."
                        )

    # Check final step reaches total_duration_months
    max_end = max((s.get("end_month", 0) for s in steps), default=0)
    if max_end != total_duration_months:
        issues.append(f"Timeline completion mismatch: max step month is M{max_end}, expected M{total_duration_months}.")
        
    return len(issues) == 0, issues


if __name__ == "__main__":
    sample_steps = [
        {"id": 1, "title": "Comprehensive Academic Diagnostic & Profile Assessment", "duration": "1 Month", "can_parallel": False, "parent_milestone": "Grade 10"},
        {"id": 2, "title": "Grade 10 Core Syllabus Mastery & Subject Planning", "duration": "3 Months", "prerequisites": [1], "can_parallel": False, "parent_milestone": "Grade 10"},
        {"id": 3, "title": "Extracurricular & Olympiad Foundation", "duration": "2 Months", "prerequisites": [1], "can_parallel": True, "parent_milestone": "Grade 10"},
        {"id": 4, "title": "Grade 10 Board Examination Preparation & Testing", "duration": "4 Months", "prerequisites": [2], "can_parallel": False, "parent_milestone": "Grade 10"},
        {"id": 5, "title": "Grade 11 Subject Stream Selection & Advanced Syllabus", "duration": "4 Months", "prerequisites": [4], "can_parallel": False, "parent_milestone": "Grade 11"},
        {"id": 6, "title": "University Research & Preliminary Shortlisting", "duration": "2 Months", "prerequisites": [5], "can_parallel": True, "parent_milestone": "Grade 11"},
        {"id": 7, "title": "Standardized Test (SAT/ACT) & English Prep (IELTS)", "duration": "3 Months", "prerequisites": [5], "can_parallel": True, "parent_milestone": "Grade 11"},
        {"id": 8, "title": "Summer School / Research Internship Profile Building", "duration": "2 Months", "prerequisites": [6, 7], "can_parallel": False, "parent_milestone": "Grade 11"},
        {"id": 9, "title": "Final University List & Admission Requirements Audit", "duration": "2 Months", "prerequisites": [8], "can_parallel": False, "parent_milestone": "Grade 12"},
        {"id": 10, "title": "Statement of Purpose & Common App Essay Drafting", "duration": "2 Months", "prerequisites": [9], "can_parallel": False, "parent_milestone": "Grade 12"},
        {"id": 11, "title": "Academic Transcripts & Letters of Recommendation Requests", "duration": "1 Month", "prerequisites": [9], "can_parallel": True, "parent_milestone": "Grade 12"},
        {"id": 12, "title": "University Applications Submission & Portal Monitoring", "duration": "2 Months", "prerequisites": [10, 11], "can_parallel": False, "parent_milestone": "Grade 12"},
        {"id": 13, "title": "Admission Decision Receipt & Offer Acceptance", "duration": "2 Months", "prerequisites": [12], "can_parallel": False, "parent_milestone": "Grade 12"},
        {"id": 14, "title": "Financial Documentation, Visa Interview & Pre-Departure", "duration": "2 Months", "prerequisites": [13], "can_parallel": False, "parent_milestone": "Grade 12"},
        {"id": 15, "title": "Final Admission & University Matriculation / Enrollment", "duration": "1 Month", "prerequisites": [14], "can_parallel": False, "parent_milestone": "Grade 12"},
    ]
    
    stages = [
        {"stage": "Grade 10", "months": 12, "stage_type": "current_academic_stage"},
        {"stage": "Grade 11", "months": 12, "stage_type": "intermediate_school_stage"},
        {"stage": "Grade 12", "months": 12, "stage_type": "intermediate_school_stage"},
    ]
    
    sched, m_by_m = schedule_academic_steps_timeline(sample_steps, 36, "Grade 10", "Bachelor's degree admission", stages)
    is_valid, issues = validate_academic_step_timeline(sched, 36)
    print("Validation Valid:", is_valid)
    print("Issues:", issues)
    print("\nScheduled Steps Summary:")
    for s in sched:
        print(f"Step {s['id']:2d}: {s['title'][:50]:<50} | {s['duration']:<12} | Prereqs: {str(s['prerequisites']):<8} | Parallel: {str(s['can_parallel']):<5}")
    print(f"\nTotal Months: 36. Month-by-month keys count: {len(m_by_m)}")
    print("Month 1:", [x['title'][:30] for x in m_by_m['1']])
    print("Month 13:", [x['title'][:30] for x in m_by_m['13']])
    print("Month 25:", [x['title'][:30] for x in m_by_m['25']])
    print("Month 36:", [x['title'][:30] for x in m_by_m['36']])
