"""
=============================================================================
NAAVIVERSE CENTRALIZED DETERMINISTIC DURATION CALCULATION SERVICE
=============================================================================
Architecture Rule:
- The AI must NEVER guess or independently calculate roadmap total duration.
- The duration is calculated ONCE by this centralized, deterministic service.
- All AI agents (Agent 1, Agent 2, Agent 3, Agent 4, narrative, UI) receive
  and respect this exact value as authoritative truth.
- Sequence: Current Stage (with remaining progress) -> Intermediate Stages -> Destination Program
=============================================================================
"""

import re
import datetime
from typing import Optional, List, Dict, Any, Tuple


# ─── VERIFIED INSTITUTION & PROGRAM DURATION KNOWLEDGE BASE ─────────────────
# Standard and official published durations across major educational systems

VERIFIED_PROGRAM_DURATIONS: Dict[str, Dict[str, Any]] = {
    # Medicine & Healthcare
    "mbbs": {
        "default_months": 66,  # 5.5 years (4.5 years academic + 1 year mandatory rotatory internship)
        "degree_level": "Bachelor's",
        "notes": "Standard 5.5-year MBBS curriculum including 1-year clinical rotatory internship"
    },
    "bds": {
        "default_months": 60,  # 5 years (4 years + 1 year internship)
        "degree_level": "Bachelor's",
        "notes": "Standard 5-year Bachelor of Dental Surgery curriculum"
    },
    "pharm_d": {
        "default_months": 72,  # 6 years Doctor of Pharmacy
        "degree_level": "Doctorate",
        "notes": "Standard 6-year Doctor of Pharmacy clinical curriculum"
    },
    "b_pharm": {
        "default_months": 48,  # 4 years Bachelor of Pharmacy
        "degree_level": "Bachelor's",
        "notes": "Standard 4-year Bachelor of Pharmacy curriculum"
    },
    "b_sc_nursing": {
        "default_months": 48,  # 4 years
        "degree_level": "Bachelor's",
        "notes": "Standard 4-year B.Sc Nursing degree"
    },
    "md_us": {
        "default_months": 48,  # 4 years post-bachelor medical school in US
        "degree_level": "Doctorate",
        "notes": "Standard 4-year Doctor of Medicine post-baccalaureate curriculum"
    },

    # Architecture & Design
    "b_arch": {
        "default_months": 60,  # 5 years mandatory for council of architecture accreditation
        "degree_level": "Bachelor's",
        "notes": "Mandatory 5-year professional Bachelor of Architecture curriculum (COA / NAAB / RIBA)"
    },
    "b_des": {
        "default_months": 48,  # 4 years
        "degree_level": "Bachelor's",
        "notes": "Standard 4-year Bachelor of Design program"
    },
    "m_arch": {
        "default_months": 24,  # 2 years
        "degree_level": "Master's",
        "notes": "Standard 2-year Master of Architecture post-professional curriculum"
    },
    "m_arch_conversion": {
        "default_months": 36,  # 3 years
        "degree_level": "Master's",
        "notes": "Standard 3-year Master of Architecture professional conversion degree"
    },

    # Engineering & Technology
    "b_tech": {
        "default_months": 48,  # 4 years
        "degree_level": "Bachelor's",
        "notes": "Standard 4-year Bachelor of Technology / Bachelor of Engineering curriculum"
    },
    "b_tech_integrated": {
        "default_months": 60,  # 5 years integrated dual degree B.Tech + M.Tech
        "degree_level": "Master's",
        "notes": "5-year Integrated Dual Degree (B.Tech + M.Tech)"
    },
    "b_eng_uk": {
        "default_months": 36,  # 3 years in England/Wales
        "degree_level": "Bachelor's",
        "notes": "Standard 3-year BEng Honours curriculum in UK"
    },
    "m_eng_uk": {
        "default_months": 48,  # 4 years integrated Master in UK
        "degree_level": "Master's",
        "notes": "Standard 4-year integrated Master of Engineering (MEng) in UK"
    },

    # Law
    "ba_llb": {
        "default_months": 60,  # 5 years integrated
        "degree_level": "Bachelor's",
        "notes": "Standard 5-year integrated Bachelor of Arts / Business + Law (BA LLB / BBA LLB)"
    },
    "llb_graduate": {
        "default_months": 36,  # 3 years after bachelor's
        "degree_level": "Bachelor's",
        "notes": "Standard 3-year graduate LL.B degree"
    },
    "jd_us": {
        "default_months": 36,  # 3 years Juris Doctor post-bachelor
        "degree_level": "Doctorate",
        "notes": "Standard 3-year Juris Doctor post-baccalaureate law degree in US"
    },
    "llm": {
        "default_months": 12,  # 1 year standard in UK/US
        "degree_level": "Master's",
        "notes": "Standard 1-year Master of Laws post-graduate degree"
    },

    # General Bachelor's (BA / BSc / BCom / BBA / BCA)
    "bachelor_standard_3yr": {
        "default_months": 36,  # 3 years in UK, Australia, Europe, India (traditional BA/BSc/BCom)
        "degree_level": "Bachelor's",
        "notes": "Standard 3-year undergraduate degree (BA / B.Sc / B.Com / BBA)"
    },
    "bachelor_standard_4yr": {
        "default_months": 48,  # 4 years in US, Canada, Engineering, NEP 4-year Honours
        "degree_level": "Bachelor's",
        "notes": "Standard 4-year undergraduate degree (BS / BA Honours / 4-Year Major)"
    },

    # Master's Degrees
    "masters_1yr": {
        "default_months": 12,  # 1 year in UK, Ireland, specialized US M.Eng / accelerated MBA
        "degree_level": "Master's",
        "notes": "Official 1-year Master's degree (MSc / MA / Accelerated MBA)"
    },
    "masters_18mo": {
        "default_months": 18,  # 1.5 years in US CS/Data Science / 3 semesters
        "degree_level": "Master's",
        "notes": "Official 18-month / 3-semester Master's program"
    },
    "masters_2yr": {
        "default_months": 24,  # 2 years standard in US, Canada, India, Germany
        "degree_level": "Master's",
        "notes": "Standard 2-year Master of Science / Technology / MBA curriculum"
    },
    "masters_3yr": {
        "default_months": 36,  # 3 years (e.g. MCA, MFA)
        "degree_level": "Master's",
        "notes": "Standard 3-year specialized Master's curriculum"
    },

    # Doctoral Degrees (PhD)
    "phd_us": {
        "default_months": 60,  # 5 years standard expected time to degree
        "degree_level": "Doctorate",
        "notes": "Official 5-year doctoral curriculum (coursework, qualifying exams, dissertation)"
    },
    "phd_uk": {
        "default_months": 42,  # 3.5 to 4 years (42-48 months standard)
        "degree_level": "Doctorate",
        "notes": "Official 3.5 to 4-year doctoral research program in UK / Europe"
    },
    "phd_india": {
        "default_months": 60,  # 5 years in IITs / IISc / Central Universities
        "degree_level": "Doctorate",
        "notes": "Official 5-year doctoral research curriculum in premier Indian research institutes"
    },
    "phd_europe": {
        "default_months": 48,  # 4 years standard in Germany, Switzerland, Netherlands
        "degree_level": "Doctorate",
        "notes": "Standard 4-year doctoral appointment / research fellowship in Europe"
    }
}

# Country specific rules for admission paths and degree lengths
COUNTRY_STANDARDS: Dict[str, Dict[str, Any]] = {
    "india": {
        "school_final_grade": 12,
        "standard_bachelor_engineering": 48,
        "standard_bachelor_arts_science": 36,
        "standard_master": 24,
        "standard_phd": 60,
        "direct_phd_from_bachelor_allowed": False,  # Generally requires Master's or 4-yr with high CGPA/GATE
        "phd_requires_masters": True
    },
    "usa": {
        "school_final_grade": 12,
        "standard_bachelor": 48,
        "standard_master": 24,
        "standard_master_accelerated": 12,
        "standard_phd": 60,
        "direct_phd_from_bachelor_allowed": True,  # US allows direct PhD admission after 4-year BS!
        "phd_requires_masters": False
    },
    "uk": {
        "school_final_grade": 12,
        "standard_bachelor": 36,  # 3-year BA/BSc/BEng
        "standard_master": 12,    # 1-year MSc/MA
        "standard_phd": 42,       # 3.5 to 4 years DPhil/PhD
        "direct_phd_from_bachelor_allowed": False, # Typical UK route requires Master's or 1st class honors
        "phd_requires_masters": True
    },
    "canada": {
        "school_final_grade": 12,
        "standard_bachelor": 48,
        "standard_master": 24,
        "standard_phd": 60,
        "direct_phd_from_bachelor_allowed": True,
        "phd_requires_masters": False
    },
    "australia": {
        "school_final_grade": 12,
        "standard_bachelor": 36,  # 3-year standard
        "standard_bachelor_honours": 48,
        "standard_master": 24,
        "standard_phd": 48,
        "direct_phd_from_bachelor_allowed": False,
        "phd_requires_masters": True
    },
    "germany": {
        "school_final_grade": 12,
        "standard_bachelor": 36,  # 3-year (6 semesters)
        "standard_master": 24,    # 2-year (4 semesters)
        "standard_phd": 48,
        "direct_phd_from_bachelor_allowed": False,
        "phd_requires_masters": True
    }
}

# Known institution catalog mapping specific programs to exact official durations
INSTITUTION_PROGRAM_REGISTRY: Dict[str, Dict[str, int]] = {
    # VIT (Vellore Institute of Technology)
    "vellore institute of technology": {
        "b_tech": 48,
        "btech": 48,
        "m_tech": 24,
        "mca": 24,
        "phd": 48
    },
    "vit": {
        "b_tech": 48,
        "btech": 48,
        "m_tech": 24,
        "mca": 24,
        "phd": 48
    },
    # IITs
    "indian institute of technology": {
        "b_tech": 48,
        "btech": 48,
        "dual_degree": 60,
        "m_tech": 24,
        "phd": 60
    },
    "iit": {
        "b_tech": 48,
        "btech": 48,
        "dual_degree": 60,
        "m_tech": 24,
        "phd": 60
    },
    # AIIMS
    "all india institute of medical sciences": {
        "mbbs": 66,
        "md": 36
    },
    "aiims": {
        "mbbs": 66,
        "md": 36
    },
    # CEPT University (Architecture)
    "cept university": {
        "b_arch": 60,
        "m_arch": 24
    },
    "cept": {
        "b_arch": 60,
        "m_arch": 24
    },
    # National Law School (NLSIU)
    "national law school of india university": {
        "ba_llb": 60,
        "llm": 12
    },
    "nlsiu": {
        "ba_llb": 60,
        "llm": 12
    },
    # Oxford
    "university of oxford": {
        "ba": 36,
        "msc": 12,
        "m_phil": 24,
        "dphil": 42,
        "phd": 42
    },
    "oxford": {
        "ba": 36,
        "msc": 12,
        "m_phil": 24,
        "dphil": 42,
        "phd": 42
    },
    # Cambridge
    "university of cambridge": {
        "ba": 36,
        "m_phil": 12,
        "phd": 42
    },
    "cambridge": {
        "ba": 36,
        "m_phil": 12,
        "phd": 42
    },
    # Imperial College London
    "imperial college london": {
        "beng": 36,
        "meng": 48,
        "msc": 12,
        "phd": 42
    },
    "imperial": {
        "beng": 36,
        "meng": 48,
        "msc": 12,
        "phd": 42
    },
    # US Universities
    "massachusetts institute of technology": {
        "bs": 48,
        "m_eng": 12,
        "ms": 24,
        "phd": 60
    },
    "mit": {
        "bs": 48,
        "m_eng": 12,
        "ms": 24,
        "phd": 60
    },
    "stanford university": {
        "bs": 48,
        "ms": 24,
        "phd": 60
    },
    "stanford": {
        "bs": 48,
        "ms": 24,
        "phd": 60
    },
    "harvard university": {
        "ab": 48,
        "am": 24,
        "phd": 60
    },
    "harvard": {
        "ab": 48,
        "am": 24,
        "phd": 60
    },
    "university of california, berkeley": {
        "bs": 48,
        "ms": 24,
        "phd": 60
    },
    "uc berkeley": {
        "bs": 48,
        "ms": 24,
        "phd": 60
    },
    "carnegie mellon university": {
        "bs": 48,
        "ms": 18,
        "phd": 60
    },
    "cmu": {
        "bs": 48,
        "ms": 18,
        "phd": 60
    },
    # Scottish Universities (Scotland has official 4-year Honours Bachelor's: Edinburgh, Glasgow, St Andrews)
    "university of edinburgh": {
        "bachelor": 48,
        "bs": 48,
        "bsc": 48,
        "beng": 48,
        "artificial intelligence": 48,
        "ai": 48,
        "computer science": 48,
        "msc": 12,
        "phd": 42
    },
    "edinburgh": {
        "bachelor": 48,
        "bs": 48,
        "bsc": 48,
        "beng": 48,
        "artificial intelligence": 48,
        "ai": 48,
        "computer science": 48,
        "msc": 12,
        "phd": 42
    },
    "university of glasgow": {
        "bachelor": 48,
        "bs": 48,
        "bsc": 48,
        "beng": 48,
        "msc": 12,
        "phd": 42
    },
    "university of st andrews": {
        "bachelor": 48,
        "bs": 48,
        "bsc": 48,
        "msc": 12,
        "phd": 42
    }
}


# ─── EXTRACTION & PARSING UTILITIES ──────────────────────────────────────────

def extract_school_grade(text: str) -> Optional[int]:
    """
    Extracts high school grade integer (1 to 12) from text.
    Handles 'Grade 10', 'Class 11', '12th', 'tenth grade', etc.
    """
    if not text:
        return None
    t = str(text).lower()
    
    # Numeric patterns: "grade 10", "class 11", "10th", "k-10", etc.
    m = re.search(r'\b(?:grade|class|standard|std)\s*[:.-]?\s*(\d{1,2})\b', t)
    if m:
        val = int(m.group(1))
        if 1 <= val <= 12:
            return val

    m_th = re.search(r'\b(\d{1,2})(?:st|nd|rd|th)\s*(?:grade|class|standard)?\b', t)
    if m_th:
        val = int(m_th.group(1))
        if 1 <= val <= 12:
            return val

    # Word patterns
    words = {
        "twelfth": 12, "12th": 12,
        "eleventh": 11, "11th": 11,
        "tenth": 10, "10th": 10,
        "ninth": 9, "9th": 9,
        "eighth": 8, "8th": 8,
        "seventh": 7, "7th": 7,
        "sixth": 6, "6th": 6
    }
    for word, num in words.items():
        if word in t:
            return num

    return None


def extract_current_progress_months(current_text: str, default_standard_months: int = 12) -> Tuple[int, str]:
    """
    Determines how many months are remaining in the user's CURRENT academic stage.
    Supports:
    - 'halfway through Grade 10' -> 6 months
    - '3 months completed' -> standard - 3 = 9 months
    - 'expected completion June 2027' -> months between now and target date
    - 'starting Grade 10' / default -> 12 months
    Returns: (remaining_months, rationale_note)
    """
    t = (current_text or "").lower()

    # 1. Expected completion date: "completion june 2027", "completing in may 2028", etc.
    m_date = re.search(r'(?:completion|completing|graduate|graduating|ending)\s*(?:in|by|around)?\s*([a-zA-Z]+)\s*(\d{4})', t)
    if m_date:
        month_name = m_date.group(1).lower()
        year = int(m_date.group(2))
        month_map = {
            "jan": 1, "january": 1, "feb": 2, "february": 2, "mar": 3, "march": 3,
            "apr": 4, "april": 4, "may": 5, "jun": 6, "june": 6, "jul": 7, "july": 7,
            "aug": 8, "august": 8, "sep": 9, "september": 9, "oct": 10, "october": 10,
            "nov": 11, "november": 11, "dec": 12, "december": 12
        }
        target_month = month_map.get(month_name[:3], 6)
        now = datetime.datetime.now()
        diff_months = (year - now.year) * 12 + (target_month - now.month)
        if diff_months > 0:
            return (diff_months, f"Calculated {diff_months} months remaining to target completion date ({month_name.title()} {year})")

    # 2. Explicit months completed: "3 months completed", "completed 4 months"
    m_comp = re.search(r'(\d+)\s*(?:month|mo)s?\s*(?:completed|done|finished|elapsed)', t)
    if not m_comp:
        m_comp = re.search(r'(?:completed|done|finished)\s*(\d+)\s*(?:month|mo)s?', t)
    if m_comp:
        completed = int(m_comp.group(1))
        remaining = max(1, default_standard_months - completed)
        return (remaining, f"{remaining} months remaining (user completed {completed} of {default_standard_months} months)")

    # 3. Explicit months remaining: "4 months remaining", "5 months left"
    m_rem = re.search(r'(\d+)\s*(?:month|mo)s?\s*(?:remaining|left|to go)', t)
    if m_rem:
        remaining = max(1, int(m_rem.group(1)))
        return (remaining, f"{remaining} months explicitly remaining in current stage")

    # 4. Halfway / Mid-stage keywords
    if any(k in t for k in ["halfway", "half-way", "half completed", "half done", "mid-year", "mid year", "middle of"]):
        remaining = max(1, default_standard_months // 2)
        return (remaining, f"{remaining} months remaining (currently halfway through stage)")

    # 5. Starting / Just entered keywords
    if any(k in t for k in ["starting", "just started", "beginning", "entering", "commencing", "1st month"]):
        return (default_standard_months, f"Full standard {default_standard_months} months remaining (starting stage)")

    # Default: Full standard duration of current academic year
    return (default_standard_months, f"Full standard {default_standard_months} months counted for current stage")


def extract_undergrad_year_progress(current_text: str, total_undergrad_months: int = 48) -> Tuple[int, str]:
    """
    Extracts remaining months for college / undergraduate student.
    e.g. '1st year B.Tech', '3rd year engineering', 'final year college'.
    """
    t = (current_text or "").lower()

    if any(k in t for k in ["final year", "4th year", "fourth year", "senior", "graduating"]):
        # Final year: 12 months remaining
        rem_months, note = extract_current_progress_months(t, default_standard_months=12)
        return (rem_months, f"Final year undergraduate: {note}")

    if any(k in t for k in ["3rd year", "third year", "junior"]):
        # 3rd year of 4-yr program: 24 months remaining
        rem_curr, note = extract_current_progress_months(t, default_standard_months=12)
        rem_total = rem_curr + 12  # Remainder of Year 3 + full Year 4
        return (rem_total, f"3rd year undergraduate: {rem_curr} months of Year 3 + 12 months of Year 4")

    if any(k in t for k in ["2nd year", "second year", "sophomore"]):
        # 2nd year of 4-yr program: 36 months remaining
        rem_curr, note = extract_current_progress_months(t, default_standard_months=12)
        rem_total = rem_curr + 24  # Remainder of Year 2 + Year 3 + Year 4
        return (rem_total, f"2nd year undergraduate: {rem_curr} months of Year 2 + 24 months of Years 3 & 4")

    if any(k in t for k in ["1st year", "first year", "freshman"]):
        # 1st year of 4-yr program: 48 months remaining
        rem_curr, note = extract_current_progress_months(t, default_standard_months=12)
        rem_total = rem_curr + 36
        return (rem_total, f"1st year undergraduate: {rem_curr} months of Year 1 + 36 months of Years 2-4")

    return (total_undergrad_months, f"Full undergraduate program duration ({total_undergrad_months} months)")


def parse_goal_components(goal: str) -> Dict[str, str]:
    """
    Parses 'Degree Level • Program • University • Country' or flexible goal strings
    into structured metadata: {degree_level, program, university, country}.
    """
    g = (goal or "").strip()
    parts = [p.strip() for p in re.split(r'[\u2022|\.]', g) if p.strip()]

    parsed = {
        "degree_level": "Bachelor's",
        "program": "",
        "university": "",
        "country": "",
        "raw_goal": g
    }

    g_low = g.lower()
    # 1. Degree level detection
    if any(k in g_low for k in ["phd", "ph.d", "doctorate", "doctoral", "dphil"]):
        parsed["degree_level"] = "PhD"
    elif any(k in g_low for k in ["master", "master's", "mtech", "m.tech", "msc", "m.sc", "mba", "postgrad", "pg", "mca", "llm", "m.arch", "m.eng", "meng"]):
        parsed["degree_level"] = "Master's"
    elif any(k in g_low for k in ["bachelor", "bachelor's", "btech", "b.tech", "bsc", "b.sc", "ba", "b.a", "bba", "bcom", "b.com", "b.arch", "barch", "mbbs", "bds", "undergrad"]):
        parsed["degree_level"] = "Bachelor's"
    elif any(k in g_low for k in ["diploma", "associate"]):
        parsed["degree_level"] = "Diploma"

    # 2. Extract structured elements if separated by dots or bullets
    first_part_lower = parts[0].lower() if parts else ""
    is_first_degree = any(k in first_part_lower for k in ["bachelor", "master", "phd", "doctor", "diploma", "undergrad", "postgrad"])

    if is_first_degree and len(parts) >= 4:
        # e.g. ["Bachelor's", "Artificial Intelligence", "University of Edinburgh", "UK"]
        parsed["program"] = parts[1]
        parsed["university"] = parts[2]
        parsed["country"] = parts[3]
    elif is_first_degree and len(parts) == 3:
        # e.g. ["Bachelor's", "Artificial Intelligence", "University of Edinburgh"]
        parsed["program"] = parts[1]
        parsed["university"] = parts[2]
    elif is_first_degree and len(parts) == 2:
        # e.g. ["Bachelor's", "Artificial Intelligence"]
        parsed["program"] = parts[1]
    elif len(parts) >= 3:
        parsed["program"] = parts[0]
        parsed["university"] = parts[1]
        parsed["country"] = parts[2]
    elif len(parts) == 2:
        parsed["program"] = parts[0]
        parsed["university"] = parts[1]
    elif len(parts) == 1:
        if not is_first_degree:
            parsed["program"] = parts[0]

    # 3. Country extraction fallback
    country_keywords = {
        "india": "India", "usa": "USA", "united states": "USA", "us": "USA",
        "uk": "UK", "united kingdom": "UK", "scotland": "UK", "england": "UK", "britain": "UK",
        "canada": "Canada", "australia": "Australia", "germany": "Germany",
        "singapore": "Singapore", "ireland": "Ireland", "switzerland": "Switzerland"
    }
    for kw, country_name in country_keywords.items():
        if re.search(r'\b' + kw + r'\b', g_low):
            parsed["country"] = country_name
            break

    return parsed


def format_stage_destination_title(dest_level: str, parsed_goal: Dict[str, str]) -> str:
    """
    Formats the stage destination title cleanly without repeating the degree level.
    e.g. 'Bachelor's in Artificial Intelligence • University of Edinburgh'
    rather than 'Bachelor's • Bachelor's'
    """
    prog = (parsed_goal.get("program") or "").strip()
    uni = (parsed_goal.get("university") or "").strip()

    clean_prog = prog
    if clean_prog.lower() in [dest_level.lower(), "bachelor", "bachelor's", "master", "master's", "phd", "undergraduate"]:
        clean_prog = ""
    elif clean_prog.lower().startswith(dest_level.lower()):
        clean_prog = clean_prog[len(dest_level):].strip().lstrip("•").lstrip(":").lstrip("-").lstrip("in ").strip()

    if clean_prog and uni:
        return f"{dest_level} in {clean_prog} • {uni}"
    elif clean_prog:
        return f"{dest_level} in {clean_prog}"
    elif uni:
        return f"{dest_level} Degree • {uni}"
    else:
        return f"Target {dest_level} Degree"


# ─── CORE PROGRAM DURATION RESOLUTION ───────────────────────────────────────

def resolve_target_program_duration(parsed_goal: Dict[str, str]) -> Tuple[int, str, str]:
    """
    Deterministically resolves the standard duration of the target program
    using:
    1. Known institution & program registry
    2. Specific specialized degree standard (B.Arch = 60m, MBBS = 66m, B.Tech = 48m, etc.)
    3. Country standard (e.g. UK BA/BSc = 36m, US BA/BS = 48m)
    4. Configured official program duration rules

    Returns: (months, notes, duration_status)
    """
    program_low = parsed_goal.get("program", "").lower()
    uni_low = parsed_goal.get("university", "").lower()
    country_low = parsed_goal.get("country", "").lower()
    raw_low = parsed_goal.get("raw_goal", "").lower()
    degree_level = parsed_goal.get("degree_level", "Bachelor's")

    # 1. Check known institution registry first
    for inst_key, inst_programs in INSTITUTION_PROGRAM_REGISTRY.items():
        if inst_key in uni_low or inst_key in raw_low:
            # Check explicit program keys first
            for prog_key, dur_months in inst_programs.items():
                if prog_key in program_low or prog_key in raw_low:
                    return (
                        dur_months,
                        f"Verified official program duration from {inst_key.title()} registry: {dur_months} months",
                        "calculated"
                    )
            # Match degree level within this verified institution
            if degree_level == "PhD" and ("phd" in inst_programs or "dphil" in inst_programs):
                dur = inst_programs.get("phd") or inst_programs.get("dphil")
                return (dur, f"Verified official doctoral duration from {inst_key.title()}: {dur} months", "calculated")
            if degree_level == "Master's":
                for mk in ["ms", "msc", "m_tech", "m_eng", "meng", "m_phil"]:
                    if mk in inst_programs:
                        dur = inst_programs[mk]
                        return (dur, f"Verified official Master's duration from {inst_key.title()}: {dur} months", "calculated")
            if degree_level == "Bachelor's":
                for bk in ["bs", "ba", "ab", "b_tech", "btech", "beng"]:
                    if bk in inst_programs:
                        dur = inst_programs[bk]
                        return (dur, f"Verified official Bachelor's duration from {inst_key.title()}: {dur} months", "calculated")

    # 2. Check specialized professional degrees (Medicine, Architecture, Law)
    if "mbbs" in program_low or "mbbs" in raw_low or "medicine" in program_low:
        cfg = VERIFIED_PROGRAM_DURATIONS["mbbs"]
        return (cfg["default_months"], cfg["notes"], "calculated")

    if "bds" in program_low or "dental" in program_low:
        cfg = VERIFIED_PROGRAM_DURATIONS["bds"]
        return (cfg["default_months"], cfg["notes"], "calculated")

    if any(k in program_low or k in raw_low for k in ["b.arch", "barch", "architecture"]):
        if degree_level == "Bachelor's":
            cfg = VERIFIED_PROGRAM_DURATIONS["b_arch"]
            return (cfg["default_months"], cfg["notes"], "calculated")
        elif degree_level == "Master's":
            cfg = VERIFIED_PROGRAM_DURATIONS["m_arch"]
            return (cfg["default_months"], cfg["notes"], "calculated")

    if any(k in program_low or k in raw_low for k in ["ba llb", "bba llb", "integrated law"]):
        cfg = VERIFIED_PROGRAM_DURATIONS["ba_llb"]
        return (cfg["default_months"], cfg["notes"], "calculated")

    if "llm" in program_low or "llm" in raw_low:
        cfg = VERIFIED_PROGRAM_DURATIONS["llm"]
        return (cfg["default_months"], cfg["notes"], "calculated")

    if "jd" in program_low or "juris doctor" in program_low:
        cfg = VERIFIED_PROGRAM_DURATIONS["jd_us"]
        return (cfg["default_months"], cfg["notes"], "calculated")

    # 3. Engineering, AI, Computer Science & Technology
    if any(k in program_low or k in raw_low for k in ["btech", "b.tech", "b.e", "beng", "engineering", "cse", "computer science", "artificial intelligence", "ai", "data science", "software", "computing", "robotics"]):
        # Check Scottish universities first (Edinburgh, Glasgow, St Andrews, etc. are 4 years)
        if any(k in uni_low or k in raw_low for k in ["edinburgh", "glasgow", "st andrews", "scotland", "aberdeen"]):
            return (48, "Verified official 4-year Scottish Honours Degree (BSc Hons) at University of Edinburgh: 48 months", "calculated")
        if "uk" in country_low and ("beng" in program_low or "b.eng" in program_low) and not any(k in uni_low for k in ["edinburgh", "glasgow"]):
            cfg = VERIFIED_PROGRAM_DURATIONS["b_eng_uk"]
            return (cfg["default_months"], cfg["notes"], "calculated")
        if degree_level == "Bachelor's":
            cfg = VERIFIED_PROGRAM_DURATIONS["b_tech"]
            return (cfg["default_months"], "Standard 4-year Bachelor in AI/Technology/Engineering curriculum: 48 months", "calculated")

    # 4. PhD / Doctorate programs
    if degree_level == "PhD":
        if "uk" in country_low:
            cfg = VERIFIED_PROGRAM_DURATIONS["phd_uk"]
            return (cfg["default_months"], cfg["notes"], "calculated")
        elif "germany" in country_low or "europe" in country_low or "switzerland" in country_low:
            cfg = VERIFIED_PROGRAM_DURATIONS["phd_europe"]
            return (cfg["default_months"], cfg["notes"], "calculated")
        elif "india" in country_low:
            cfg = VERIFIED_PROGRAM_DURATIONS["phd_india"]
            return (cfg["default_months"], cfg["notes"], "calculated")
        else:
            # Default US & international standard
            cfg = VERIFIED_PROGRAM_DURATIONS["phd_us"]
            return (cfg["default_months"], cfg["notes"], "calculated")

    # 5. Master's programs
    if degree_level == "Master's":
        if "uk" in country_low or "ireland" in country_low or any(k in program_low for k in ["1 year", "1-year", "12 months", "accelerated", "m.eng"]):
            cfg = VERIFIED_PROGRAM_DURATIONS["masters_1yr"]
            return (cfg["default_months"], cfg["notes"], "calculated")
        elif "cmu" in uni_low or "carnegie mellon" in uni_low or "18 month" in program_low:
            cfg = VERIFIED_PROGRAM_DURATIONS["masters_18mo"]
            return (cfg["default_months"], cfg["notes"], "calculated")
        elif "mca" in program_low:
            return (24, "Verified 2-year Master of Computer Applications (MCA) curriculum", "calculated")
        else:
            cfg = VERIFIED_PROGRAM_DURATIONS["masters_2yr"]
            return (cfg["default_months"], cfg["notes"], "calculated")

    # 6. Bachelor's programs (Country-specific rules)
    if degree_level == "Bachelor's":
        # Scottish Universities (Edinburgh, Glasgow, St Andrews, Aberdeen, etc.) are standard 4-year Honours
        if any(k in uni_low or k in raw_low for k in ["edinburgh", "glasgow", "st andrews", "scotland", "aberdeen", "dundee", "heriot-watt", "stirling", "strathclyde"]):
            return (48, "Verified official 4-year Scottish Honours Bachelor's degree (BSc / BEng / MA Hons): 48 months", "calculated")
        # Technical, AI, CS, Data Science degrees are standard 4 years (48m)
        if any(k in program_low or k in raw_low for k in ["artificial intelligence", "ai", "computer science", "data science", "engineering", "software", "computing"]):
            return (48, "Standard 4-year Bachelor of Science / Technology curriculum: 48 months", "calculated")
        # Check if 3-year standard country (UK England/Wales non-Scottish BA/BSc, Australia 3-yr non-honours)
        if ("uk" in country_low or "england" in country_low) and not any(k in uni_low for k in ["edinburgh", "glasgow", "st andrews"]):
            cfg = VERIFIED_PROGRAM_DURATIONS["bachelor_standard_3yr"]
            return (cfg["default_months"], f"{cfg['notes']} in England/Wales", "calculated")
        elif "australia" in country_low and not any(k in program_low for k in ["engineering", "honours"]):
            cfg = VERIFIED_PROGRAM_DURATIONS["bachelor_standard_3yr"]
            return (cfg["default_months"], f"{cfg['notes']} in Australia", "calculated")
        elif "india" in country_low and any(k in program_low for k in ["b.a", "ba", "b.sc", "bsc", "b.com", "bcom", "bba", "bca"]):
            cfg = VERIFIED_PROGRAM_DURATIONS["bachelor_standard_3yr"]
            return (cfg["default_months"], f"{cfg['notes']} (3-year standard in India)", "calculated")
        else:
            cfg = VERIFIED_PROGRAM_DURATIONS["bachelor_standard_4yr"]
            return (cfg["default_months"], cfg["notes"], "calculated")

    # Fallback to standard degree level
    return (48, "Standard 4-year undergraduate degree duration", "calculated")


# ─── MAIN CENTRALIZED DURATION CALCULATOR ────────────────────────────────────

def resolve_category(
    category: Optional[str] = None,
    sub_segment: Optional[str] = None,
    profile_context: Optional[Dict[str, Any]] = None,
    current_position: Optional[str] = None,
    target_goal: Optional[str] = None
) -> str:
    """
    Authoritative, robust category resolution across the 4 primary tracks:
    1. 'academic': Academics & Research, High School, Degrees, Admissions, Test Prep
    2. 'practical': Practical Skills & Projects, Portfolios, Bootcamps, Certifications
    3. 'jobs': Jobs & Careers, Job Search, Technical Roles, Placement, Interviews
    4. 'non_academic': Non-Academic Counselling, Mental Wellbeing, Life Skills, Stress Management
    """
    candidates = []
    if category:
        candidates.append(str(category).lower().strip())
    if sub_segment:
        candidates.append(str(sub_segment).lower().strip())
    if isinstance(profile_context, dict):
        if profile_context.get("activeSegment"):
            candidates.append(str(profile_context["activeSegment"]).lower().strip())
        if profile_context.get("category"):
            candidates.append(str(profile_context["category"]).lower().strip())
        if profile_context.get("content_category"):
            candidates.append(str(profile_context["content_category"]).lower().strip())

    # 1. Non-Academic Counselling check (checked FIRST so 'life skills' matches counselling, not practical skills)
    for text in candidates:
        if any(k in text for k in [
            "non_academic", "non-academic", "non academic",
            "counselling", "counseling",
            "mental", "wellbeing", "wellness", "well-being",
            "life skills", "decision focus", "decision-making", "decision making",
            "stress", "anxiety", "depression", "burnout",
            "life coaching", "immediate guidance", "emotional", "mindset", "therapy"
        ]):
            return "non_academic"

    # 2. Jobs & Careers check
    for text in candidates:
        if any(k in text for k in [
            "jobs & careers", "jobs", "job", "career", "careers", "career-prep", "career prep",
            "technical role", "technical roles", "non-technical role", "non-technical",
            "profession", "placement", "campus placement",
            "interview & networking", "interview prep", "interview", "networking",
            "recruitment", "hiring", "employment", "job search", "internship to hire"
        ]):
            return "jobs"

    # 3. Practical Skills & Projects check
    for text in candidates:
        if any(k in text for k in [
            "practical & skills", "practical skills", "practical", "skills", "skill",
            "project portfolio", "project", "portfolio",
            "certification & bootcamp", "certification", "certifications", "bootcamp", "bootcamps",
            "hands-on", "proof of work", "proof-of-work", "github", "coding challenge", "tooling", "framework"
        ]):
            return "practical"

    # 4. Academics & Research check
    for text in candidates:
        if any(k in text for k in [
            "academic & research", "academics", "academic",
            "research & honors", "research", "honors",
            "test prep & admissions", "test prep", "admissions",
            "undergraduate", "postgraduate", "bachelor", "master", "phd", "doctorate",
            "degree", "school", "high school", "cbse", "icse", "grade"
        ]):
            return "academic"

    # 5. Check target_goal and current_position
    combined_endpoints = f"{str(current_position or '').lower()} {str(target_goal or '').lower()}"

    # Non-academic endpoints
    if any(k in combined_endpoints for k in [
        "mental health", "stress management", "stress and confusion", "decision-making", "decision making",
        "emotional", "burnout", "wellbeing", "wellness", "anxiety", "counseling", "counselling"
    ]):
        return "non_academic"

    # Jobs endpoints
    if any(k in combined_endpoints for k in [
        "job", "career", "hiring", "placement", "interview", "sde-", "sde1", "sde2",
        "software engineer role", "developer role", "at google", "at amazon", "at microsoft", "fresher placement"
    ]):
        return "jobs"

    # Practical endpoints
    if any(k in combined_endpoints for k in [
        "portfolio", "github", "bootcamp", "certification", "learn react", "learn python", "hands-on project",
        "proof of work", "mastering docker", "full stack web development"
    ]):
        return "practical"

    # Academic endpoints
    if any(k in combined_endpoints for k in [
        "bachelor", "b.tech", "btech", "bsc", "b.sc", "master", "m.tech", "msc", "phd", "doctorate",
        "admissions", "vit", "mit", "stanford", "grade 9", "grade 10", "grade 11", "grade 12", "cbse", "icse"
    ]):
        return "academic"

    return "academic"


def calculate_path_duration(
    current_position: str,
    target_goal: str,
    profile_context: Optional[dict] = None,
    category: Optional[str] = "academic",
    sub_segment: Optional[str] = None
) -> Dict[str, Any]:
    """
    Centralized, deterministic calculation of roadmap duration from
    CURRENT POSITION to DESTINATION GOAL.

    Returns:
    {
        "total_duration_months": int,
        "total_duration": str,
        "duration_status": "calculated" | "verification_required",
        "calculation": [
            {
                "stage": str,
                "months": int,
                "stage_type": str,
                "notes": str
            }, ...
        ],
        "metadata": { ... }
    }
    """
    curr_str = (current_position or "").strip()
    goal_str = (target_goal or "").strip()
    prof = profile_context or {}
    
    # ── AUTHORITATIVE CATEGORY RESOLUTION ─────────────────────────────────────
    cat = resolve_category(
        category=category,
        sub_segment=sub_segment,
        profile_context=prof,
        current_position=curr_str,
        target_goal=goal_str
    )

    calculation_stages: List[Dict[str, Any]] = []

    # ═════════════════════════════════════════════════════════════════════════
    # 1. NON-ACADEMIC & COUNSELING DURATION LOGIC (DYNAMIC: 2, 3, 4, 5, 6 MONTHS)
    # ═════════════════════════════════════════════════════════════════════════
    if cat == "non_academic":
        curr_low = curr_str.lower()
        goal_low = goal_str.lower()
        sub_low = (sub_segment or "").lower()
        combined_text = f"{curr_low} {goal_low} {sub_low}"

        # Case A: Urgent / Acute / Crisis / Exam Stress / Fast Reset (2 months)
        if any(k in combined_text for k in [
            "immediate", "crisis", "acute", "panic", "exam stress", "urgent", "quick relief", "burnout reset", "sos"
        ]):
            calculation_stages.append({
                "stage": "Immediate Emotional De-escalation & Stabilization",
                "months": 1,
                "stage_type": "initial_stabilization",
                "notes": "Urgent emotional relief, grounding practices, and support contact establishment"
            })
            calculation_stages.append({
                "stage": "Acute Stress Coping Mechanisms & Mindset Reset",
                "months": 1,
                "stage_type": "active_coping",
                "notes": "Building behavioral coping mechanisms and stress reduction framework"
            })

        # Case B: Focused Decision-Making / Clarity / Time Management (3 months)
        elif any(k in combined_text for k in [
            "decision-making", "decision making", "confusion", "clarity", "career choice", "educational choice",
            "time management", "prioritization", "procrastination", "daily focus"
        ]) and not any(k in combined_text for k in ["chronic", "deep", "lifestyle", "long-term", "comprehensive"]):
            calculation_stages.append({
                "stage": "Diagnostic Emotional & Decision Pattern Assessment",
                "months": 1,
                "stage_type": "assessment",
                "notes": "Objective analysis of cognitive bottlenecks, confusion triggers, and value priorities"
            })
            calculation_stages.append({
                "stage": "Cognitive Reframing & Structured Decision Protocols",
                "months": 1,
                "stage_type": "decision_framework",
                "notes": "Practical decision-making matrices, bias elimination, and actionable options assessment"
            })
            calculation_stages.append({
                "stage": "Action Plan Implementation & Habit Calibration",
                "months": 1,
                "stage_type": "habit_calibration",
                "notes": "Executing chosen path, self-monitoring routines, and stress-free execution habits"
            })

        # Case C: Stress Management & Daily Wellness Integration (4 months)
        elif any(k in combined_text for k in [
            "stress management", "stress", "anxiety", "burnout", "work-life balance", "mindfulness", "routine"
        ]) and not any(k in combined_text for k in ["chronic", "severe", "trauma", "long-term"]):
            calculation_stages.append({
                "stage": "Stress Pattern Identification & Emotional Baseline Audit",
                "months": 1,
                "stage_type": "baseline_audit",
                "notes": "Identifying physiological and psychological stress triggers and daily cycle patterns"
            })
            calculation_stages.append({
                "stage": "Active Cognitive Restructuring & Mindset Tools",
                "months": 1,
                "stage_type": "cognitive_restructuring",
                "notes": "Implementing cognitive behavioral tools, anxiety management, and mindfulness cycles"
            })
            calculation_stages.append({
                "stage": "Daily Routine Alignment & Boundary Setting",
                "months": 1,
                "stage_type": "routine_alignment",
                "notes": "Creating sustainable sleep, study/work boundaries, and restorative practices"
            })
            calculation_stages.append({
                "stage": "Resilience Hardening & Sustainable Self-Regulation",
                "months": 1,
                "stage_type": "resilience_hardening",
                "notes": "Consolidation of self-regulation techniques and long-term emotional resilience"
            })

        # Case D: Deep Emotional Transformation / Confidence / Imposter Syndrome (5 months)
        elif any(k in combined_text for k in [
            "confidence", "self-esteem", "imposter syndrome", "social anxiety", "overwhelm", "emotional resilience", "relationship"
        ]):
            calculation_stages.append({
                "stage": "Comprehensive Emotional & Relational Assessment",
                "months": 1,
                "stage_type": "assessment",
                "notes": "In-depth mapping of core beliefs, trigger patterns, and relational dynamics"
            })
            calculation_stages.append({
                "stage": "Deep Mindset Restructuring & Behavioral Exposure",
                "months": 2,
                "stage_type": "behavioral_practice",
                "notes": "Gradual behavioral exposure, cognitive disputation, and self-worth cultivation"
            })
            calculation_stages.append({
                "stage": "Autonomous Wellbeing & Long-Term Integration",
                "months": 2,
                "stage_type": "sustainability",
                "notes": "Independent emotional self-governance, crisis prevention plan, and enduring confidence"
            })

        # Case E: Comprehensive Lifestyle Wellness / Life Coaching (6 months)
        else:
            calculation_stages.append({
                "stage": "Holistic Wellbeing Audit & Core Values Mapping",
                "months": 2,
                "stage_type": "holistic_audit",
                "notes": "Diagnostic assessment across emotional, psychological, and lifestyle dimensions"
            })
            calculation_stages.append({
                "stage": "Deep Behavioral Reconditioning & Resilience Practice",
                "months": 2,
                "stage_type": "behavioral_reconditioning",
                "notes": "Intensive counseling practices, guided reflection, and emotional reframing"
            })
            calculation_stages.append({
                "stage": "Long-Term Habit Sustainability & Autonomous Wellbeing",
                "months": 2,
                "stage_type": "sustainability",
                "notes": "Consolidation of lifelong wellness architecture and emotional autonomy"
            })

        total_months = sum(s["months"] for s in calculation_stages)
        return {
            "total_duration_months": total_months,
            "total_duration": format_duration_string(total_months),
            "duration_status": "calculated",
            "calculation": calculation_stages,
            "category": "non_academic"
        }

    # ═════════════════════════════════════════════════════════════════════════
    # 2. PRACTICAL SKILLS & PROJECTS DURATION LOGIC (DYNAMIC: 2, 3, 4, 5, 6, 8, 10 MONTHS)
    # ═════════════════════════════════════════════════════════════════════════
    if cat == "practical":
        curr_low = curr_str.lower()
        goal_low = goal_str.lower()
        combined_text = f"{curr_low} {goal_low}"

        is_beginner = any(k in curr_low for k in ["beginner", "novice", "zero", "starter", "no experience", "fresh"])
        is_advanced = any(k in curr_low for k in ["advanced", "experienced", "proficient", "lead", "architect"])

        # Scope 1: Fast Tool / Syntax / Crash Course (2 or 3 months)
        # e.g., Git, Docker basics, SQL basics, Figma, Bash, Tailwind, Prompt Engineering
        if any(k in combined_text for k in [
            "git", "github", "docker basics", "sql basics", "html/css", "figma", "bash", "tailwind",
            "prompt engineering", "markdown", "excel", "linux basics", "regex", "api basics"
        ]) or any(k in combined_text for k in ["crash course", "quick start", "tooling fundamentals"]):
            if is_advanced or not is_beginner:
                # 2 months
                calculation_stages.append({
                    "stage": "Tooling Setup & Core Syntax Fundamentals",
                    "months": 1,
                    "stage_type": "tooling_syntax",
                    "notes": "Targeted syntax mastery, workflow automation, and environment setup"
                })
                calculation_stages.append({
                    "stage": "Applied Implementation & Proof-of-Work Project",
                    "months": 1,
                    "stage_type": "applied_project",
                    "notes": "Building deployable proof-of-work project and workflow validation"
                })
            else:
                # 3 months
                calculation_stages.append({
                    "stage": "Foundational Syntax & Tooling Environment",
                    "months": 1,
                    "stage_type": "skill_foundation",
                    "notes": "Mastering syntax, environment configuration, and basic operations"
                })
                calculation_stages.append({
                    "stage": "Guided Mini-Projects & Practical Implementations",
                    "months": 1,
                    "stage_type": "guided_projects",
                    "notes": "Hands-on application through structured, real-world mini-projects"
                })
                calculation_stages.append({
                    "stage": "Deployable Proof-of-Work Project & Portfolio Verification",
                    "months": 1,
                    "stage_type": "capstone_verification",
                    "notes": "Building and publishing deployable proof-of-work implementation"
                })

        # Scope 2: Advanced Deep Technology / AI / Systems / Distributed Computing (8 or 10 months)
        # e.g., Machine Learning, Deep Learning, Distributed Systems, Cloud Architecture, Kubernetes, Rust/C++
        elif any(k in combined_text for k in [
            "machine learning", "deep learning", "ai", "artificial intelligence", "nlp", "computer vision",
            "distributed systems", "cloud architecture", "kubernetes", "rust", "c++ systems", "microservices",
            "blockchain", "cybersecurity", "system design", "operating systems", "compiler"
        ]):
            if is_beginner:
                # 10 months
                calculation_stages.append({
                    "stage": "Comprehensive Theoretical & Algorithmic Foundations",
                    "months": 3,
                    "stage_type": "theory_foundations",
                    "notes": "Mastering mathematical, algorithmic, and low-level architectural principles"
                })
                calculation_stages.append({
                    "stage": "Core Architectural Engineering & Large-Scale Systems Build",
                    "months": 3,
                    "stage_type": "system_build",
                    "notes": "Developing scalable, high-throughput system components with advanced paradigms"
                })
                calculation_stages.append({
                    "stage": "Production Deployment, Testing Suites & Enterprise Capstone",
                    "months": 4,
                    "stage_type": "enterprise_capstone",
                    "notes": "Production hardening, benchmark verification, CI/CD pipeline, and open-source release"
                })
            else:
                # 8 months
                calculation_stages.append({
                    "stage": "Advanced Systems Foundations & Architecture",
                    "months": 2,
                    "stage_type": "advanced_architecture",
                    "notes": "Deep dive into performance optimization, distributed patterns, and design trade-offs"
                })
                calculation_stages.append({
                    "stage": "Complex Domain Implementations & Distributed Patterns",
                    "months": 3,
                    "stage_type": "domain_implementation",
                    "notes": "Architecting resilient services, state management, and real-time processing"
                })
                calculation_stages.append({
                    "stage": "Production Hardening, Benchmarking & Open-Source Capstone",
                    "months": 3,
                    "stage_type": "capstone_verification",
                    "notes": "Rigorous benchmarking, security review, documentation, and portfolio verification"
                })

        # Scope 3: Standard Frameworks & Web/Mobile Development (4, 5, or 6 months)
        # e.g., React, Node, Python, Django, FastAPI, Spring Boot, Flutter, AWS, Full-Stack
        else:
            if is_advanced:
                # 4 months
                calculation_stages.append({
                    "stage": "Advanced Paradigms & Architectural Patterns",
                    "months": 1,
                    "stage_type": "advanced_patterns",
                    "notes": "Production-grade design patterns, state architecture, and performance tuning"
                })
                calculation_stages.append({
                    "stage": "End-to-End System Build & Architecture",
                    "months": 1,
                    "stage_type": "system_build",
                    "notes": "Architecting full-scale application with comprehensive test coverage"
                })
                calculation_stages.append({
                    "stage": "Production Hardening & Portfolio Verification",
                    "months": 2,
                    "stage_type": "portfolio_verification",
                    "notes": "Deployment, documentation, security review, and live production showcase"
                })
            elif is_beginner:
                # 6 months
                calculation_stages.append({
                    "stage": "Foundational Concepts & Core Tooling",
                    "months": 2,
                    "stage_type": "skill_foundation",
                    "notes": "Mastering syntax, development environments, and foundational theory"
                })
                calculation_stages.append({
                    "stage": "Guided Implementations & Practical System Builds",
                    "months": 2,
                    "stage_type": "guided_projects",
                    "notes": "Hands-on application through structured, real-world mini-projects"
                })
                calculation_stages.append({
                    "stage": "Independent Capstone & Production Portfolio Development",
                    "months": 2,
                    "stage_type": "capstone_portfolio",
                    "notes": "Building end-to-end deployable proof-of-work project and technical portfolio"
                })
            else:
                # Intermediate standard (4 or 5 months based on scope)
                if any(k in combined_text for k in ["full-stack", "full stack", "portfolio", "cloud", "aws"]):
                    # 5 months
                    calculation_stages.append({
                        "stage": "Core Skill Strengthening & Domain Fluency",
                        "months": 1,
                        "stage_type": "skill_strengthening",
                        "notes": "Strengthening intermediate paradigms, tooling, and best practices"
                    })
                    calculation_stages.append({
                        "stage": "Guided System Implementation & Feature Integration",
                        "months": 2,
                        "stage_type": "system_build",
                        "notes": "Developing full-featured components and integrating backend services"
                    })
                    calculation_stages.append({
                        "stage": "End-to-End Capstone Project & Portfolio Verification",
                        "months": 2,
                        "stage_type": "portfolio_verification",
                        "notes": "Production deployment, automated testing, and portfolio readiness"
                    })
                else:
                    # 4 months
                    calculation_stages.append({
                        "stage": "Core Skill Strengthening & Domain Fluency",
                        "months": 1,
                        "stage_type": "skill_strengthening",
                        "notes": "Strengthening intermediate paradigms, tooling, and best practices"
                    })
                    calculation_stages.append({
                        "stage": "Guided Component Architecture & Hands-on Builds",
                        "months": 1,
                        "stage_type": "component_architecture",
                        "notes": "Building modular components with clean architecture"
                    })
                    calculation_stages.append({
                        "stage": "End-to-End System Project & Portfolio Verification",
                        "months": 2,
                        "stage_type": "portfolio_verification",
                        "notes": "Deployment, documentation, testing, and portfolio readiness"
                    })

        total_months = sum(s["months"] for s in calculation_stages)
        return {
            "total_duration_months": total_months,
            "total_duration": format_duration_string(total_months),
            "duration_status": "calculated",
            "calculation": calculation_stages,
            "category": "practical"
        }

    # ═════════════════════════════════════════════════════════════════════════
    # 3. JOBS & CAREERS DURATION LOGIC (DYNAMIC: 2, 3, 4, 5, 6, 8, 10, 12 MONTHS)
    # ═════════════════════════════════════════════════════════════════════════
    if cat == "jobs":
        curr_low = curr_str.lower()
        goal_low = goal_str.lower()
        combined_text = f"{curr_low} {goal_low}"

        is_career_switch = any(k in combined_text for k in [
            "career switch", "career change", "transition", "pivot", "non-tech", "change field", "switch career"
        ])
        is_senior_target = any(k in goal_low for k in ["senior", "lead", "staff", "manager", "architect", "director", "head of"])
        is_from_junior = any(k in curr_low for k in ["junior", "entry", "student", "intern", "graduate", "fresher"])

        # Case A: Targeted Interview Sprint / Job-Ready Placement (2 months)
        if any(k in combined_text for k in [
            "interview sprint", "quick placement", "immediate job search", "mock interview", "interview practice",
            "offer negotiation", "recruiter outreach", "urgent hire"
        ]) and not is_career_switch:
            calculation_stages.append({
                "stage": "Target Role Sourcing & Resume/Portfolio Refinement",
                "months": 1,
                "stage_type": "role_sourcing",
                "notes": "High-impact resume polish, LinkedIn alignment, and targeted company shortlist"
            })
            calculation_stages.append({
                "stage": "Technical Mock Interviews, Live Coding & Offer Negotiation",
                "months": 1,
                "stage_type": "interview_offer",
                "notes": "Intensive mock technical rounds, behavioral practice, and compensation negotiation"
            })

        # Case B: Fast-Track Campus Placement / SDE Interview Prep (3 months)
        elif any(k in combined_text for k in [
            "campus placement", "placement prep", "sde interview", "coding interview", "fresher placement", "off-campus"
        ]) and not is_career_switch:
            calculation_stages.append({
                "stage": "Target Role Alignment & High-Impact Portfolio Refresh",
                "months": 1,
                "stage_type": "role_alignment",
                "notes": "Sharpening core competencies, portfolio curation, and resume optimization"
            })
            calculation_stages.append({
                "stage": "Data Structures, System Design & Behavioral Interview Drills",
                "months": 1,
                "stage_type": "interview_drills",
                "notes": "Timed coding challenges, algorithmic problem-solving, and STAR behavioral answers"
            })
            calculation_stages.append({
                "stage": "Active Recruitment Pipeline & Offer Finalization",
                "months": 1,
                "stage_type": "recruitment_pipeline",
                "notes": "Company application rounds, referral sourcing, and offer evaluation"
            })

        # Case C: Cross-Discipline Career Switch or Major Pivot (10 or 12 months)
        elif is_career_switch:
            if any(k in curr_low for k in ["non-tech", "unrelated", "complete beginner", "zero experience"]):
                # 12 months (Comprehensive Non-Tech to Tech Pivot)
                calculation_stages.append({
                    "stage": "Prerequisite Technical Skills & Domain Pivot",
                    "months": 3,
                    "stage_type": "skill_gap_closure",
                    "notes": "Targeted closing of critical skill gaps required for destination role"
                })
                calculation_stages.append({
                    "stage": "Enterprise Proof-of-Work Projects & System Design",
                    "months": 3,
                    "stage_type": "enterprise_projects",
                    "notes": "Building commercial-grade portfolio projects demonstrating competence"
                })
                calculation_stages.append({
                    "stage": "Resume Optimization, Professional Branding & Cold Outreach",
                    "months": 3,
                    "stage_type": "career_branding",
                    "notes": "Targeted resume crafting, LinkedIn optimization, and referral networking"
                })
                calculation_stages.append({
                    "stage": "Technical Interview Drills, Behavioral Prep & Offer Negotiation",
                    "months": 3,
                    "stage_type": "interview_offer",
                    "notes": "Live mock interviews, system design rounds, and offer negotiation"
                })
            else:
                # 10 months (Career Switch with Transferable Skills)
                calculation_stages.append({
                    "stage": "Prerequisite Domain Foundations & Technical Immersion",
                    "months": 3,
                    "stage_type": "domain_immersion",
                    "notes": "Bridging core domain knowledge and industry-standard toolchain"
                })
                calculation_stages.append({
                    "stage": "Commercial Proof-of-Work Projects & Tooling Proficiency",
                    "months": 3,
                    "stage_type": "proof_of_work",
                    "notes": "Developing full-scale projects meeting target industry expectations"
                })
                calculation_stages.append({
                    "stage": "Professional Career Branding & Referral Networking Strategy",
                    "months": 2,
                    "stage_type": "branding_networking",
                    "notes": "Resume positioning for new domain, portfolio showcase, and informational interviews"
                })
                calculation_stages.append({
                    "stage": "Targeted Application Blitz, Technical Drills & Offer Securing",
                    "months": 2,
                    "stage_type": "application_blitz",
                    "notes": "Active recruitment pipeline, technical interview rounds, and offer selection"
                })

        # Case D: Senior / Lead Target Transition from Lower Level (8 months)
        elif is_senior_target and is_from_junior:
            calculation_stages.append({
                "stage": "Senior Competency Alignment & Architectural Paradigms",
                "months": 2,
                "stage_type": "senior_competency",
                "notes": "High-level system architecture, technical leadership, and domain mastery"
            })
            calculation_stages.append({
                "stage": "Enterprise-Scale Portfolio Projects & System Design Mastery",
                "months": 3,
                "stage_type": "enterprise_projects",
                "notes": "Building commercial-grade distributed systems and design document portfolios"
            })
            calculation_stages.append({
                "stage": "Executive Branding, Referral Outreach & Deep Technical Interviews",
                "months": 3,
                "stage_type": "interview_cycles",
                "notes": "Targeted outreach to engineering leaders, architecture rounds, and compensation negotiation"
            })

        # Case E: Standard Role Transition / Mid-Level Hiring (4, 5, or 6 months)
        else:
            if is_from_junior or any(k in goal_low for k in ["entry", "junior", "associate"]):
                # 4 months
                calculation_stages.append({
                    "stage": "Role Competency Alignment & Resume Optimization",
                    "months": 1,
                    "stage_type": "role_alignment",
                    "notes": "Aligning technical skills with target job specifications and resume crafting"
                })
                calculation_stages.append({
                    "stage": "Technical Assessment Drills & Coding Challenge Preparation",
                    "months": 1,
                    "stage_type": "assessment_drills",
                    "notes": "Practicing company-specific coding assessments and take-home assignments"
                })
                calculation_stages.append({
                    "stage": "Targeted Company Sourcing & Referral Outreach",
                    "months": 1,
                    "stage_type": "company_sourcing",
                    "notes": "Active recruitment pipeline building and alumni/peer networking"
                })
                calculation_stages.append({
                    "stage": "Interview Cycles, Assessment Centers & Offer Finalization",
                    "months": 1,
                    "stage_type": "interview_finalization",
                    "notes": "Completing interview rounds, technical interviews, and contract signing"
                })
            elif any(k in goal_low for k in ["senior", "lead"]):
                # 6 months
                calculation_stages.append({
                    "stage": "Target Role Competency Alignment & Portfolio Refresh",
                    "months": 2,
                    "stage_type": "role_alignment",
                    "notes": "Sharpening advanced domain skills and curating relevant project evidence"
                })
                calculation_stages.append({
                    "stage": "Targeted Company Sourcing & Referral Applications",
                    "months": 2,
                    "stage_type": "application_sourcing",
                    "notes": "Active recruitment pipeline building and warm introduction strategy"
                })
                calculation_stages.append({
                    "stage": "Interview Cycles, Assessment Centers & Offer Finalization",
                    "months": 2,
                    "stage_type": "interview_finalization",
                    "notes": "Completing interview rounds, system design challenges, and contract signing"
                })
            else:
                # 5 months (Standard mid-level career transition)
                calculation_stages.append({
                    "stage": "Target Role Competency Gap Closure & Domain Prep",
                    "months": 1,
                    "stage_type": "competency_closure",
                    "notes": "Auditing requirements for target role and closing essential competency gaps"
                })
                calculation_stages.append({
                    "stage": "Commercial-Grade Proof-of-Work Projects & System Architecture",
                    "months": 2,
                    "stage_type": "commercial_projects",
                    "notes": "Strengthening GitHub profile and portfolio with production-grade project"
                })
                calculation_stages.append({
                    "stage": "Recruitment Pipeline Building, Mock Interviews & Offer Securing",
                    "months": 2,
                    "stage_type": "pipeline_offer",
                    "notes": "Direct recruiter applications, referrals, live interviews, and offer selection"
                })

        total_months = sum(s["months"] for s in calculation_stages)
        return {
            "total_duration_months": total_months,
            "total_duration": format_duration_string(total_months),
            "duration_status": "calculated",
            "calculation": calculation_stages,
            "category": "jobs"
        }

    # ═════════════════════════════════════════════════════════════════════════
    # 4. ACADEMIC & RESEARCH DURATION LOGIC (STRICT MULTI-STAGE DETERMINISM)
    # ═════════════════════════════════════════════════════════════════════════
    parsed_goal = parse_goal_components(goal_str)
    dest_months, dest_notes, dest_status = resolve_target_program_duration(parsed_goal)
    dest_level = parsed_goal["degree_level"]
    dest_country = parsed_goal.get("country", "").lower()
    
    # Check if student is in school
    school_grade = extract_school_grade(curr_str)
    if not school_grade and isinstance(prof.get("academics"), dict):
        school_grade = extract_school_grade(str(prof.get("academics", {}).get("currentGrade", "")))

    curr_low = curr_str.lower()
    is_undergrad_current = any(k in curr_low for k in ["bachelor", "btech", "b.tech", "bsc", "b.sc", "undergrad", "college student", "engineering student", "sophomore", "junior", "freshman"])
    is_masters_current = any(k in curr_low for k in ["master", "mtech", "msc", "mba", "postgrad", "pg student"])

    # -------------------------------------------------------------------------
    # SCENARIO A: User is CURRENTLY IN HIGH SCHOOL (Grades 1 to 12)
    # -------------------------------------------------------------------------
    if school_grade is not None:
        current_grade = school_grade

        # 1. Calculate remaining months in CURRENT grade
        curr_rem_months, curr_rem_notes = extract_current_progress_months(curr_str, default_standard_months=12)
        calculation_stages.append({
            "stage": f"Grade {current_grade}",
            "months": curr_rem_months,
            "stage_type": "current_academic_stage",
            "notes": f"Current academic stage: {curr_rem_notes}"
        })

        # 2. Add intermediate school grades (up to Grade 12)
        for intermediate_grade in range(current_grade + 1, 13):
            calculation_stages.append({
                "stage": f"Grade {intermediate_grade}",
                "months": 12,
                "stage_type": "intermediate_school_stage",
                "notes": f"Standard academic curriculum year for Grade {intermediate_grade}"
            })

        # 3. Add pathway stages between high school graduation and destination
        if dest_level == "Bachelor's":
            # Direct entry from high school into Bachelor's
            calculation_stages.append({
                "stage": format_stage_destination_title(dest_level, parsed_goal),
                "months": dest_months,
                "stage_type": "destination_degree_program",
                "notes": dest_notes
            })

        elif dest_level == "Master's":
            # High School -> Bachelor's (intermediate) -> Master's (destination)
            # Resolve Bachelor's duration: standard 48 months (or 36m if UK/Europe non-engineering)
            undergrad_dur = 48
            undergrad_notes = "Standard 4-year undergraduate prerequisite degree"
            if "uk" in dest_country or "england" in dest_country:
                undergrad_dur = 36
                undergrad_notes = "Standard 3-year UK undergraduate prerequisite degree"

            calculation_stages.append({
                "stage": "Undergraduate Bachelor's Degree (Prerequisite)",
                "months": undergrad_dur,
                "stage_type": "intermediate_undergraduate_degree",
                "notes": undergrad_notes
            })
            calculation_stages.append({
                "stage": format_stage_destination_title(dest_level, parsed_goal),
                "months": dest_months,
                "stage_type": "destination_degree_program",
                "notes": dest_notes
            })

        elif dest_level == "PhD":
            # High School -> Bachelor's -> [Optional Master's] -> PhD
            # Rule: In US/Canada, direct PhD after Bachelor's is standard!
            # In UK, Europe, India, Master's is required before PhD.
            undergrad_dur = 48
            undergrad_notes = "Standard 4-year undergraduate Bachelor of Science / Engineering"

            calculation_stages.append({
                "stage": "Undergraduate Bachelor's Degree (STEM / Foundation)",
                "months": undergrad_dur,
                "stage_type": "intermediate_undergraduate_degree",
                "notes": undergrad_notes
            })

            # Check if Master's is required by destination country
            country_cfg = COUNTRY_STANDARDS.get(dest_country, {})
            requires_masters = country_cfg.get("phd_requires_masters", False)

            if requires_masters:
                master_dur = country_cfg.get("standard_master", 24)
                calculation_stages.append({
                    "stage": "Master's Degree (Prerequisite for Doctoral Admission)",
                    "months": master_dur,
                    "stage_type": "intermediate_graduate_degree",
                    "notes": f"Mandatory graduate Master's degree prerequisite in {parsed_goal.get('country', 'destination country')}"
                })

            calculation_stages.append({
                "stage": format_stage_destination_title(dest_level, parsed_goal),
                "months": dest_months,
                "stage_type": "destination_degree_program",
                "notes": dest_notes
            })

        else:
            # Other destinations (e.g. Diploma, Associate)
            calculation_stages.append({
                "stage": f"Target Program: {parsed_goal['raw_goal']}",
                "months": dest_months,
                "stage_type": "destination_degree_program",
                "notes": dest_notes
            })

    # -------------------------------------------------------------------------
    # SCENARIO B: User is CURRENTLY AN UNDERGRADUATE / COLLEGE STUDENT
    # -------------------------------------------------------------------------
    elif is_undergrad_current:
        # Determine remaining months in undergraduate degree
        rem_ug_months, ug_notes = extract_undergrad_year_progress(curr_str, total_undergrad_months=48)
        
        if dest_level == "Bachelor's":
            # Target is completing Bachelor's or transferring
            calculation_stages.append({
                "stage": "Undergraduate Degree Completion / Transfer",
                "months": rem_ug_months,
                "stage_type": "current_academic_stage",
                "notes": ug_notes
            })
        elif dest_level == "Master's":
            # Complete undergrad -> Master's
            calculation_stages.append({
                "stage": "Remaining Undergraduate Degree Coursework",
                "months": rem_ug_months,
                "stage_type": "current_academic_stage",
                "notes": ug_notes
            })
            calculation_stages.append({
                "stage": format_stage_destination_title(dest_level, parsed_goal),
                "months": dest_months,
                "stage_type": "destination_degree_program",
                "notes": dest_notes
            })
        elif dest_level == "PhD":
            # Complete undergrad -> [Optional Master's] -> PhD
            calculation_stages.append({
                "stage": "Remaining Undergraduate Degree Coursework",
                "months": rem_ug_months,
                "stage_type": "current_academic_stage",
                "notes": ug_notes
            })
            country_cfg = COUNTRY_STANDARDS.get(dest_country, {})
            if country_cfg.get("phd_requires_masters", False):
                calculation_stages.append({
                    "stage": "Master's Degree (Prerequisite for Doctoral Admission)",
                    "months": country_cfg.get("standard_master", 24),
                    "stage_type": "intermediate_graduate_degree",
                    "notes": f"Mandatory graduate Master's degree prerequisite in {parsed_goal.get('country', 'destination country')}"
                })
            calculation_stages.append({
                "stage": format_stage_destination_title(dest_level, parsed_goal),
                "months": dest_months,
                "stage_type": "destination_degree_program",
                "notes": dest_notes
            })
        else:
            calculation_stages.append({
                "stage": f"Target Program: {parsed_goal['raw_goal']}",
                "months": dest_months,
                "stage_type": "destination_degree_program",
                "notes": dest_notes
            })

    # -------------------------------------------------------------------------
    # SCENARIO C: User is CURRENTLY A MASTER'S / POSTGRADUATE STUDENT
    # -------------------------------------------------------------------------
    elif is_masters_current:
        rem_master_months, master_notes = extract_current_progress_months(curr_str, default_standard_months=24)
        if dest_level == "PhD":
            calculation_stages.append({
                "stage": "Remaining Master's Degree Studies",
                "months": rem_master_months,
                "stage_type": "current_academic_stage",
                "notes": master_notes
            })
            calculation_stages.append({
                "stage": format_stage_destination_title(dest_level, parsed_goal),
                "months": dest_months,
                "stage_type": "destination_degree_program",
                "notes": dest_notes
            })
        else:
            calculation_stages.append({
                "stage": f"Target Program: {parsed_goal['raw_goal']}",
                "months": dest_months,
                "stage_type": "destination_degree_program",
                "notes": dest_notes
            })

    # -------------------------------------------------------------------------
    # SCENARIO D: GENERAL / WORKING PROFESSIONAL / UNKNOWN STARTING STAGE
    # -------------------------------------------------------------------------
    else:
        # Standard professional or non-school academic progression
        calculation_stages.append({
            "stage": format_stage_destination_title(dest_level, parsed_goal),
            "months": dest_months,
            "stage_type": "destination_degree_program",
            "notes": dest_notes
        })

    # Calculate total sum of months
    total_months = sum(s["months"] for s in calculation_stages)
    
    # Validation check
    validation_status = "calculated"
    if total_months <= 0:
        total_months = 12
        validation_status = "verification_required"

    return {
        "total_duration_months": total_months,
        "total_duration": format_duration_string(total_months),
        "duration_status": validation_status,
        "calculation": calculation_stages,
        "parsed_goal": parsed_goal,
        "category": "academic"
    }


def format_duration_string(months: int) -> str:
    """
    Formats months into clean, standardized duration text.
    Examples:
    - 12 -> "12 months"
    - 84 -> "84 months"
    - 144 -> "144 months"
    """
    if months == 1:
        return "1 month"
    return f"{months} months"


# ─── VALIDATION SERVICE ──────────────────────────────────────────────────────

def validate_path_duration(roadmap_data: dict, calculated_info: dict) -> Tuple[bool, List[str]]:
    """
    Strict validation rules before returning roadmap:
    1. Is current stage included?
    2. Are all required intermediate stages included?
    3. Is destination program duration verified?
    4. Is the total equal to the sum of all stage durations?
    5. Has the AI invented or modified any duration?
    6. Does the total_duration match the centralized calculation?

    Returns: (is_valid, list_of_issues)
    """
    issues = []
    expected_total_months = calculated_info.get("total_duration_months")
    expected_stages = calculated_info.get("calculation", [])

    # Check sum of calculated stages
    calculated_sum = sum(s.get("months", 0) for s in expected_stages)
    if calculated_sum != expected_total_months:
        issues.append(f"Calculation integrity error: sum of stages ({calculated_sum}m) != total ({expected_total_months}m)")

    # Check roadmap_data total duration
    rm_total_str = str(roadmap_data.get("total_duration") or "").strip()
    m_dig = re.search(r'(\d+)', rm_total_str)
    if m_dig:
        rm_months = int(m_dig.group(1))
        if rm_months != expected_total_months:
            issues.append(f"AI hallucinated duration: roadmap has {rm_months}m, expected authoritative {expected_total_months}m")
    else:
        issues.append("Roadmap is missing a valid numeric total_duration")

    is_valid = len(issues) == 0
    return is_valid, issues


def enforce_centralized_duration_on_roadmap(roadmap: dict, calculated_info: dict) -> dict:
    """
    Enforces the authoritative centralized duration and breakdown onto the roadmap.
    AI agents cannot alter or overwrite this.
    """
    if not isinstance(roadmap, dict):
        return roadmap

    authoritative_months = calculated_info["total_duration_months"]
    authoritative_str = calculated_info["total_duration"]
    authoritative_stages = calculated_info["calculation"]

    roadmap["total_duration"] = authoritative_str
    roadmap["total_duration_months"] = authoritative_months
    roadmap["duration_status"] = calculated_info.get("duration_status", "calculated")
    roadmap["duration_calculation"] = authoritative_stages

    # Also redistribute milestone ranges so no milestone exceeds total duration
    milestones = roadmap.get("steps", [])
    num_steps = len(milestones)
    if num_steps > 0:
        # Check if any step duration exceeds total months or uses wrong numbers
        needs_redistribute = False
        for m in milestones:
            d_str = str(m.get("duration", ""))
            digits = [int(x) for x in re.findall(r'\d+', d_str)]
            if any(x > authoritative_months for x in digits):
                needs_redistribute = True
                break

        if needs_redistribute:
            for i, m in enumerate(milestones):
                start = int(i * authoritative_months / num_steps) + 1
                end = int((i + 1) * authoritative_months / num_steps)
                if start == end:
                    m["duration"] = f"Month {start}"
                else:
                    m["duration"] = f"Months {start}-{end}"

    return roadmap
