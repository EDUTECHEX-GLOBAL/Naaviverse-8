path = 'navi-agent/code/observer_agent.py'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

target = """        STAGE_KEYWORDS = {
            1: ["foundation", "basics", "fundamentals", "intro", "introduction", "grade 9", "grade 10", "grade 11", "cbse", "icse", "high school", "ncert"],
            2: ["entrance", "jee", "neet", "sat", "act", "viteee", "gate", "gre", "gmat", "cat", "exam prep", "mock test"],
            3: ["admission", "counseling", "counselling", "application", "apply to university", "sop", "visa", "enrollment", "college application"],
            4: ["bachelor", "b.tech", "undergraduate", "first year", "semester 1", "semester 2", "semester 3", "semester 4", "core curriculum", "dsa", "degree coursework"],
            5: ["specialization", "internship", "summer intern", "semester 5", "semester 6", "semester 7", "electives", "advanced engineering"],
            6: ["capstone", "dissertation", "thesis", "final year project"],
            7: ["placement", "job application", "corporate software engineer", "campus placement", "corporate employment", "senior software engineer", "interview preparation for full-time"]
        }

        step_stages = []
        for idx, s in enumerate(steps, start=1):
            text = f"{s.get('title', '')} {s.get('description', '')}".lower()
            detected_stage = 0
            # Check from stage 7 down to 1
            for st_num in sorted(STAGE_KEYWORDS.keys(), reverse=True):
                if any(kw in text for kw in STAGE_KEYWORDS[st_num]):
                    detected_stage = st_num
                    break
            step_stages.append((idx, s.get("id", idx), s.get("title", ""), detected_stage))"""

replacement = """        # Precise pedagogical stage indicators: distinguishes secondary school AP/foundations from collegiate/corporate stages
        STAGE_KEYWORDS = {
            1: ["introductory high school", "grade 9 basics", "grade 10 basics", "ncert basics", "elementary arithmetic", "basic secondary education"],
            2: ["sat prep", "act prep", "jee main", "neet exam", "entrance examination preparation", "standardized testing baseline"],
            3: ["university application", "common application", "apply to university", "counselor recommendation", "admissions essay", "visa interview", "enrollment deposit"],
            4: ["degree semester 1", "degree semester 2", "b.tech core coursework", "undergraduate degree coursework in progress", "freshman college semester"],
            5: ["industry internship", "corporate summer intern", "advanced engineering specialization", "semester 6 electives"],
            6: ["undergraduate capstone thesis", "senior degree thesis", "final dissertation defense"],
            7: ["campus placement drive", "full-time employment hiring", "corporate software engineer job offer", "final placement recruitment"]
        }

        step_stages = []
        for idx, s in enumerate(steps, start=1):
            text = f"{s.get('title', '')} {s.get('description', '')}".lower()
            detected_stage = 0

            # Special check for Stage 7: ignore "advanced placement", "ap ", "placement test", "course placement"
            is_ap_or_course_placement = any(ap in text for ap in ["advanced placement", "ap calculus", "ap computer science", "ap physics", "placement test", "placement exam", "math placement", "course placement"])
            if any(kw in text for kw in STAGE_KEYWORDS[7]) and not is_ap_or_course_placement:
                detected_stage = 7
            else:
                for st_num in [6, 5, 4, 3, 2, 1]:
                    if any(kw in text for kw in STAGE_KEYWORDS[st_num]):
                        detected_stage = st_num
                        break
            step_stages.append((idx, s.get("id", idx), s.get("title", ""), detected_stage))"""

text_norm = text.replace('\r\n', '\n')
target_norm = target.replace('\r\n', '\n')
replacement_norm = replacement.replace('\r\n', '\n')

assert target_norm in text_norm, 'target_norm not found in observer_agent.py'
text_norm = text_norm.replace(target_norm, replacement_norm, 1)

with open(path, 'w', encoding='utf-8', newline='') as f:
    f.write(text_norm)

print("observer_agent.py updated successfully!")

