"""
RAG Service for Naaviverse Academic Pathways
Ingests university admission pathway guides, performs dense semantic retrieval,
and injects grounded context into Groq LLM prompts for generating comprehensive roadmaps.
"""

import os
import re
import json
import math
import importlib
from typing import List, Dict, Any, Optional
from collections import Counter
from pathlib import Path

# Optional RapidFuzz for high-speed token and fuzzy matching
try:
    from rapidfuzz import fuzz
    HAS_RAPIDFUZZ = True
except Exception:
    HAS_RAPIDFUZZ = False

# Lazy SentenceTransformer embedding service (safely imported via importlib to avoid IDE/linter unresolved import errors)
_EMBED_MODEL = None
_EMBED_INITIALIZED = False

def get_embedder():
    """Lazily load sentence-transformers model if available in the environment."""
    global _EMBED_MODEL, _EMBED_INITIALIZED
    if not _EMBED_INITIALIZED and _EMBED_MODEL is None:
        _EMBED_INITIALIZED = True
        try:
            st_mod = importlib.import_module("sentence_transformers")
            _EMBED_MODEL = getattr(st_mod, "SentenceTransformer")("sentence-transformers/all-MiniLM-L6-v2")
        except Exception:
            _EMBED_MODEL = None
    return _EMBED_MODEL


def tokenize(text: str) -> List[str]:
    """Extract lowercased alphanumeric tokens with length > 1."""
    if not text:
        return []
    return [w for w in re.findall(r'[a-zA-Z0-9]+', text.lower()) if len(w) > 1]


def compute_sparse_vector(text: str) -> Dict[str, float]:
    """Compute normalized term-frequency sparse vector for pure Python similarity."""
    tokens = tokenize(text)
    if not tokens:
        return {}
    tf = Counter(tokens)
    total = len(tokens)
    return {k: v / total for k, v in tf.items()}


def sparse_cosine_sim(vec1: Dict[str, float], vec2: Dict[str, float]) -> float:
    """Compute cosine similarity between two term-frequency sparse dictionaries."""
    if not vec1 or not vec2:
        return 0.0
    common = set(vec1.keys()) & set(vec2.keys())
    if not common:
        return 0.0
    dot = sum(vec1[k] * vec2[k] for k in common)
    norm1 = math.sqrt(sum(v * v for v in vec1.values()))
    norm2 = math.sqrt(sum(v * v for v in vec2.values()))
    if norm1 == 0 or norm2 == 0:
        return 0.0
    return dot / (norm1 * norm2)


def compute_vector(text: str) -> Optional[List[float]]:
    """Compute dense 384-dimensional embedding vector if sentence-transformers is installed."""
    model = get_embedder()
    if not model or not text or not text.strip():
        return None
    try:
        vec = model.encode(text.strip(), convert_to_numpy=True)
        return vec.tolist() if hasattr(vec, "tolist") else [float(x) for x in vec]
    except Exception:
        return None


def cosine_sim(a: List[float], b: List[float]) -> float:
    """Compute cosine similarity between two dense float vectors."""
    if not a or not b or len(a) != len(b):
        return 0.0
    dot = sum(x * y for x, y in zip(a, b))
    norm_a = math.sqrt(sum(x * x for x in a))
    norm_b = math.sqrt(sum(y * y for y in b))
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return dot / (norm_a * norm_b)


# ─── PRE-INDEXED UNIVERSITY PATHWAY KNOWLEDGE BASE ───
DOCUMENT_PATHWAYS_KB: List[Dict[str, Any]] = [
    {
        "id": "purdue_cs_bachelors",
        "title": "Bachelor's, Computer Science, Purdue University (USA)",
        "level": "Bachelor's",
        "subject": "Computer Science",
        "university": "Purdue University",
        "country": "USA",
        "route_and_length": "BS in Computer Science (College of Science, Department of Computer Science). 4 years (8 semesters), starting in August (Fall Intake). Tracks include Machine Intelligence, Software Engineering, Systems Programming, Security, and Algorithms.",
        "eligibility": "Secondary school graduation with high academic standing in Mathematics (Pre-Calculus/Calculus), Physics, and Computing. Recommended SAT Math 750+, SAT Composite 1450+ for College of Science.",
        "english_proof": "TOEFL iBT (min 80, 20+ per subscore) or IELTS (min 6.5 overall, 6.0 min per subscore) or Duolingo English Test (115+).",
        "preparation_timeline": (
            "T-24 to T-12: Master advanced STEM coursework (Calculus, Physics, Python/Java). Build competitive programming profile "
            "(USACO, Codeforces, LeetCode), build GitHub portfolio projects, and prepare for SAT/ACT.\n"
            "T-12 to T-3: Standardized testing consolidation, drafting Common App personal essay, and writing Purdue supplemental essays ('Why Purdue', 'Why CS at Purdue'). Submit before November 1 Early Action."
        ),
        "application_package": (
            "Common Application online portal, official high school transcripts / self-reported academic record (SRAR), counselor recommendation, "
            "Purdue supplemental questions, and application fee ($60 international). Crucial Early Action deadline: November 1."
        ),
        "funding": (
            "Tuition ~$31,000/yr for international students plus living expenses ($10,000-$15,000/yr). Highly competitive merit awards (e.g. Stamps, Presidential Scholarships) "
            "require Nov 1 Early Action submission. On-campus teaching assistantships (TA/RA) and paid corporate summer internships (CPT)."
        ),
        "visa_and_arrival": (
            "Form I-20 issuance via Purdue ISS (International Students and Scholars), SEVIS I-901 fee payment, DS-160 submission, and US F-1 visa interview. "
            "Provide proof of liquid funds ($45,000+ USD). Arrive in mid-August for Boiler Gold Rush (BGR) international orientation."
        ),
        "beyond_year_1": (
            "Foundational CS core: CS 18000 (Problem Solving / Java), CS 18200 (Discrete Math), CS 24000 (C Programming), CS 25000 (Computer Architecture), "
            "and CS 25100 (Data Structures & Algorithms). Industrial co-ops and paid summer CPT tech internships (Amazon, Google, Microsoft, Chicago fintech). Post-graduation 36-month STEM OPT work authorization."
        ),
        "verify": "Common App Early Action cutoff (Nov 1), departmental prerequisite rigor, English language test minimums, and SEVIS I-20 financial affidavit cutoff."
    },
    {
        "id": "uoft_geology_bachelors",
        "title": "Bachelor's, Geology, University of Toronto (Canada)",
        "level": "Bachelor's",
        "subject": "Geology / Earth Sciences",
        "university": "University of Toronto",
        "country": "Canada",
        "route_and_length": "Honours BSc in the Faculty of Arts & Science. Geology sits inside Earth Sciences (Specialist or Major track). 4 years, starting in September (Fall Intake).",
        "eligibility": "Secondary school graduation with high academic standing. Strong Mathematics (Calculus), Chemistry, and Physics. Earth Science coursework is helpful.",
        "english_proof": "IELTS (min 6.5 overall, no band < 6.0) or TOEFL iBT (min 100 overall, 22 on writing) unless exempt.",
        "preparation_timeline": (
            "T-12 to T-6: Lift STEM grades (Calculus, Chemistry, Physics). Build geoscience exposure: rock and mineral "
            "collecting, joining geological societies/clubs, studying local geological maps, completing introductory online geoscience courses, "
            "mastering Excel data analysis and basic QGIS geospatial mapping.\n"
            "T-6 to T-2: Final secondary school examinations, predicted grades consolidation, drafting personal profile responses."
        ),
        "application_package": (
            "Online application via OUAC (Ontario Universities' Application Centre) or direct international portal. "
            "Official transcripts, predicted grades, English language test scores, extracurricular activity profiles, and application fee. "
            "Main deadline: Mid-January. Decision rollout: February through May."
        ),
        "funding": (
            "International tuition is CAD $60,000+ per year. Apply for University of Toronto International Scholar awards and "
            "the prestigious Lester B. Pearson International Scholarship (requires secondary school nomination, covering full tuition, books, and residence; early Nov/Dec deadline)."
        ),
        "visa_and_arrival": (
            "Apply for Canadian Study Permit immediately upon offer acceptance. Obtain Provincial Attestation Letter (PAL) under IRCC cap rules. "
            "Provide proof of unencumbered living funds (CAD $20,635+) plus first-year tuition. Arrive for international orientation and register for first-year "
            "calculus, chemistry, and introductory earth sciences."
        ),
        "beyond_year_1": (
            "Mandatory field camp and mapping coursework. Research project assistantships in geophysics/mineralogy. Summer co-op/internship positions in mining exploration, "
            "environmental remediation, hydrogeology, and geohazard consulting. Professional licensing pathway to P.Geo (Professional Geoscientist) via APGO."
        ),
        "verify": "Exact Earth Sciences specialist stream code, OUAC application deadline dates, Lester B. Pearson school nomination deadline, PAL exemption criteria, IRCC proof-of-funds requirement."
    },
    {
        "id": "waterloo_mechatronics_bachelors",
        "title": "Bachelor's, Mechatronics Engineering, University of Waterloo (Canada)",
        "level": "Bachelor's",
        "subject": "Mechatronics Engineering",
        "university": "University of Waterloo",
        "country": "Canada",
        "route_and_length": "BASc in Mechatronics Engineering with mandatory 5-year alternating study and paid work co-op terms.",
        "eligibility": "Highly competitive secondary school entry. Advanced Calculus, Physics, Chemistry, and English proficiency.",
        "english_proof": "IELTS 6.5 or TOEFL 90+.",
        "preparation_timeline": "T-12 to T-6: Top 5% class standing, robotics club / FIRST robotics, Arduino/Raspberry Pi robotics projects, Python/C programming, CEMC mathematics contests. T-6 to T-3: Admission Information Form (AIF) drafting.",
        "application_package": "OUAC application, high school transcripts, AIF portfolio responses, English scores.",
        "funding": "Entrance scholarships for top averages; 6 paid co-op work terms help offset tuition.",
        "visa_and_arrival": "Study permit plus mandatory Co-op Work Permit from IRCC.",
        "beyond_year_1": "6 paid industry work terms across automation, automotive, and robotics. Path to P.Eng licensing.",
        "verify": "AIF deadlines, math contest cutoff weights, co-op work permit requirements."
    },
    {
        "id": "melbourne_veterinary_science",
        "title": "Bachelor's, Veterinary Science, University of Melbourne (Australia)",
        "level": "Bachelor's",
        "subject": "Veterinary Science / Doctor of Veterinary Medicine (DVM)",
        "university": "University of Melbourne",
        "country": "Australia",
        "route_and_length": "Pathway Bachelor of Science or Agriculture (3 years) followed by 4-year Doctor of Veterinary Medicine (DVM). Total ~7 years.",
        "eligibility": "Secondary completion with chemistry and biology. Undergraduate WAM threshold plus animal handling log.",
        "english_proof": "IELTS 7.0 (no band < 7.0).",
        "preparation_timeline": "Clinical shadowing, shelter volunteering, farm livestock management logs.",
        "application_package": "Transcripts, CASPer test (if required), animal handling log, referee letters.",
        "funding": "High international tuition; look into Melbourne International Undergraduate Scholarship.",
        "visa_and_arrival": "Subclass 500 Student Visa, OSHC (Overseas Student Health Cover).",
        "beyond_year_1": "Veterinary board registration in Australia and international reciprocal boards.",
        "verify": "DVM prerequisite subject matching, animal experience hours certification."
    },
    {
        "id": "warwick_statistics_bachelors",
        "title": "Bachelor's, Statistics, University of Warwick (UK)",
        "level": "Bachelor's",
        "subject": "Statistics",
        "university": "University of Warwick",
        "country": "UK",
        "route_and_length": "BSc Statistics, 3 years (or 4 years with placement/master's).",
        "eligibility": "A* in Mathematics/Further Maths or equivalent IB 7.",
        "english_proof": "IELTS 6.5 or 7.0 depending on band requirement.",
        "preparation_timeline": "Urgent January UCAS deadline. Practice statistics with R/Python, probability competitions.",
        "application_package": "UCAS application, personal statement (structured format), teacher reference, predicted grades.",
        "funding": "Warwick undergraduate scholarships and bursaries.",
        "visa_and_arrival": "CAS letter, Student Route Visa, Immigration Health Surcharge (IHS).",
        "beyond_year_1": "Year in industry placement, Royal Statistical Society accreditation.",
        "verify": "UCAS mid-January cutoff, TMUA test requirements."
    },
    {
        "id": "polimi_industrial_design_bachelors",
        "title": "Bachelor's, Industrial Design, Politecnico di Milano (Italy)",
        "level": "Bachelor's",
        "subject": "Industrial Design",
        "university": "Politecnico di Milano",
        "country": "Italy",
        "route_and_length": "Laurea (Bachelor) in Product Design, 3 years.",
        "eligibility": "Secondary school diploma, TIL/TOL admission entrance test.",
        "english_proof": "English or Italian B2 certificate depending on stream.",
        "preparation_timeline": "Drawing and visual reasoning preparation, design portfolio development.",
        "application_package": "Online portal test registration, Statement of Value (Dichiarazione di Valore), Universitaly pre-enrolment.",
        "funding": "DSU regional right-to-study scholarship, income-based tuition reductions.",
        "visa_and_arrival": "Type D National Visa, Codice Fiscale, Permesso di Soggiorno within 8 days of arrival.",
        "beyond_year_1": "Studio design workshops and Milan design week internships.",
        "verify": "Entrance exam sessions, language stream availability."
    },
    {
        "id": "cbs_international_business_bachelors",
        "title": "Bachelor's, International Business, Copenhagen Business School (Denmark)",
        "level": "Bachelor's",
        "subject": "International Business",
        "university": "Copenhagen Business School",
        "country": "Denmark",
        "route_and_length": "BSc in International Business, 3 years.",
        "eligibility": "Upper secondary certificate, Danish Level A Mathematics equivalent.",
        "english_proof": "English Level A (IELTS 7.0+ or TOEFL 94+).",
        "preparation_timeline": "Model UN, business ventures, grade conversion to Danish 7-point scale.",
        "application_package": "Optagelse.dk national portal, verified grade transcripts.",
        "funding": "Free tuition for EU/EEA; non-EU fees apply.",
        "visa_and_arrival": "Danish residence permit via SIRI, CPR number, MitID.",
        "beyond_year_1": "Exchange semester with partner business schools, MSc progression.",
        "verify": "Optagelse quota 2 application deadlines (typically March 15)."
    },
    {
        "id": "nus_environmental_engineering_bachelors",
        "title": "Bachelor's, Environmental Engineering, National University of Singapore (Singapore)",
        "level": "Bachelor's",
        "subject": "Environmental Engineering",
        "university": "National University of Singapore",
        "country": "Singapore",
        "route_and_length": "Bachelor of Engineering (B.Eng) in Environmental Engineering, 4 years.",
        "eligibility": "High school diploma with high grades in Mathematics, Chemistry, and Physics.",
        "english_proof": "IELTS or TOEFL if medium of instruction was not English.",
        "preparation_timeline": "Sustainability and environmental sensor projects, water filtration research.",
        "application_package": "NUS international applicant portal, transcripts, standardized test scores.",
        "funding": "Singapore MOE Tuition Grant (with 3-year service obligation/work bond).",
        "visa_and_arrival": "Student's Pass via ICA (Immigration & Checkpoints Authority), campus hostel.",
        "beyond_year_1": "Industrial attachment with PUB (Singapore National Water Agency) or sustainability consultancies.",
        "verify": "Application window (usually November to February), MOE bond details."
    },
    {
        "id": "stanford_ai_masters",
        "title": "Master's, Computer Science (AI Track), Stanford University (USA)",
        "level": "Master's",
        "subject": "Artificial Intelligence / Computer Science",
        "university": "Stanford University",
        "country": "USA",
        "route_and_length": "MS in Computer Science (Artificial Intelligence Specialization). 45 quarter units, typically 1.5 to 2 years.",
        "eligibility": "Bachelor's degree in CS, Mathematics, or related quantitative STEM discipline. Superior academic track record in Linear Algebra, Multivariable Calculus, Algorithms, and Probability.",
        "english_proof": "TOEFL iBT (min 100 overall, 25+ on all subscores). GRE optional but strong quantitative percentiles recommended.",
        "preparation_timeline": "T-18 to T-6: Original AI/ML research publications (NeurIPS, ICML, CVPR workshops), open-source contributions, high GPA consolidation, and faculty research collaborations.",
        "application_package": "Stanford Graduate Admissions Portal, Statement of Purpose (SOP), 3 strong academic/industry Letters of Recommendation, transcripts, CV/resume, application fee ($125). Deadline: Early December.",
        "funding": "Graduate Course Assistant (CA) / Teaching Assistant (TA) and Research Assistant (RA) appointments cover full tuition plus monthly stipend.",
        "visa_and_arrival": "F-1 student visa via Stanford Bechtel International Center, I-20 processing, arrive for New Graduate Student Orientation.",
        "beyond_year_1": "Advanced coursework (CS 229 Machine Learning, CS 231n Deep Learning, CS 224n NLP), Silicon Valley summer research internships, and industry transitions to AI research labs.",
        "verify": "Departmental early December application deadline, prerequisite equivalencies, faculty lab openings."
    },
    {
        "id": "oxford_ppe_bachelors",
        "title": "Bachelor's, Philosophy, Politics and Economics (PPE), University of Oxford (UK)",
        "level": "Bachelor's",
        "subject": "Philosophy, Politics and Economics (PPE)",
        "university": "University of Oxford",
        "country": "UK",
        "route_and_length": "BA (Hons) in Philosophy, Politics and Economics (PPE), 3 years through collegiate Oxford tutorial system.",
        "eligibility": "A*AA at A-Level (or 39 points with 766 at Higher Level in IB, or equivalent top secondary grades). Strong analytical reading and quantitative mathematical aptitude.",
        "english_proof": "IELTS Academic 7.5 (minimum 7.0 in each component) or TOEFL iBT 110 (min 22 L, 24 R, 25 S, 24 W).",
        "preparation_timeline": "T-14 to T-3: Extensive reading across political theory, economic models, and ethical philosophy; preparation for the Thinking Skills Assessment (TSA) section 1 & 2.",
        "application_package": "UCAS application by October 15 strict deadline, college preference or open application, TSA entrance test registration, and submission of written work.",
        "funding": "Oxford international fees apply; apply for Oxford Reach, Clarendon, and college bursaries before January.",
        "visa_and_arrival": "Confirmation of Acceptance for Studies (CAS), UK Student Route Visa, arrival at designated collegiate college.",
        "beyond_year_1": "Rigorous weekly 1-on-1 and 2-on-1 Oxford tutorials, essay defenses, summer policy internships in Whitehall, international organizations, or investment banking.",
        "verify": "October 15 UCAS deadline, TSA test registration cutoffs, collegiate admissions criteria."
    }
]


class AdmissionRAGService:
    """
    RAG Engine that matches incoming target queries to authoritative admission roadmaps,
    extracts universal phase rules and pathway facts, and constructs grounded prompts.
    """

    def __init__(self):
        self.knowledge_base = DOCUMENT_PATHWAYS_KB
        self._cache_embeddings()

    def _cache_embeddings(self):
        """Pre-compute search indices and sparse representations for knowledge base entries."""
        for entry in self.knowledge_base:
            combined_text = (
                f"{entry['title']}. Subject: {entry['subject']}. University: {entry['university']}, {entry['country']}. "
                f"Route: {entry['route_and_length']}. Eligibility: {entry['eligibility']}. Timeline: {entry['preparation_timeline']}. "
                f"Application: {entry['application_package']}. Funding: {entry['funding']}. Visa: {entry['visa_and_arrival']}."
            )
            entry["sparse_vector"] = compute_sparse_vector(combined_text)
            # Only compute dense vector if sentence-transformers is installed
            if get_embedder() is not None:
                entry["vector"] = compute_vector(combined_text)

    def retrieve_pathway_context(self, query: str, top_k: int = 1) -> Optional[Dict[str, Any]]:
        """
        Multi-stage hybrid retrieval:
        1. Exact entity & keyword match (University + Subject)
        2. High-precision fuzzy token matching (RapidFuzz token_set_ratio)
        3. Sparse TF-IDF cosine similarity
        4. Dense vector cosine similarity (if embedder available)
        Returns None if no pathway satisfies the minimum relevance threshold (preventing prompt pollution).
        """
        if not query or not query.strip():
            return None

        query_norm = query.lower().strip()
        tokens_q = set(tokenize(query_norm))

        # ─── Stage 1: Direct entity / keyword matching ───
        for entry in self.knowledge_base:
            univ_words = [uw for uw in tokenize(entry["university"].lower()) if len(uw) > 3]
            subj_words = [sw for sw in tokenize(entry["subject"].lower()) if len(sw) > 3]

            univ_match = any(uw in query_norm for uw in univ_words)
            subj_match = any(sw in query_norm for sw in subj_words) or (
                ("cs" in tokens_q or "computer" in tokens_q or "coding" in tokens_q or "software" in tokens_q)
                and "computer" in entry["subject"].lower()
            )

            if univ_match and subj_match:
                return {
                    "matched_entry": entry,
                    "score": 0.98,
                    "match_type": "exact_entity_match"
                }

        # ─── Stage 2: RapidFuzz / Token matching ───
        best_fuzz_entry = None
        best_fuzz_score = 0.0

        if HAS_RAPIDFUZZ:
            for entry in self.knowledge_base:
                target_str = f"{entry['university']} {entry['subject']} {entry['title']} {entry['country']}"
                ratio = fuzz.token_set_ratio(query_norm, target_str.lower())
                norm_score = ratio / 100.0
                if norm_score > best_fuzz_score:
                    best_fuzz_score = norm_score
                    best_fuzz_entry = entry

        # ─── Stage 3: Sparse TF-IDF vector similarity ───
        q_sparse = compute_sparse_vector(query_norm)
        best_sparse_entry = None
        best_sparse_score = 0.0
        for entry in self.knowledge_base:
            sim = sparse_cosine_sim(q_sparse, entry.get("sparse_vector", {}))
            if sim > best_sparse_score:
                best_sparse_score = sim
                best_sparse_entry = entry

        # Candidate selection from lexical/fuzzy signals
        candidate = best_fuzz_entry or best_sparse_entry
        candidate_score = max(best_fuzz_score, best_sparse_score)

        # ─── Stage 4: Dense semantic embedding if available ───
        q_vec = compute_vector(query)
        if q_vec:
            for entry in self.knowledge_base:
                vec = entry.get("vector")
                if vec:
                    sim = cosine_sim(q_vec, vec)
                    if sim > candidate_score:
                        candidate_score = sim
                        candidate = entry

        # ─── Stage 5: Strict Relevance Threshold Check ───
        # Only return matches that satisfy high confidence (>= 0.60 for fuzzy/sparse, >= 0.55 for dense)
        # Never fall back to an arbitrary first entry if the query is unrelated!
        if candidate and candidate_score >= 0.60:
            return {
                "matched_entry": candidate,
                "score": round(candidate_score, 3),
                "match_type": "semantic_similarity"
            }

        return None

    def build_grounded_prompt_augmentation(self, query: str) -> str:
        """
        Constructs authoritative grounding instructions to be injected into the Groq LLM prompt.
        If no relevant admission blueprint is found, returns an empty string so the model
        generates the pathway based on its core curriculum knowledge without interference.
        """
        retrieval = self.retrieve_pathway_context(query)
        if not retrieval:
            return ""

        kb = retrieval["matched_entry"]
        score = retrieval.get("score", 0.0)

        prompt_block = f"""
AUTHORITATIVE ADMISSION BLUEPRINT (GROUND TRUTH FROM RAG KNOWLEDGE BASE - Match Confidence: {int(score * 100)}%):
========================================================================
Target Pathway: {kb['title']}
University: {kb['university']} ({kb['country']})
Route & Length: {kb['route_and_length']}
Academic Eligibility: {kb['eligibility']}
Language Requirements: {kb['english_proof']}
Preparation Timeline: {kb['preparation_timeline']}
Application Package & Portal: {kb['application_package']}
Funding & Scholarships: {kb['funding']}
Immigration & Arrival: {kb['visa_and_arrival']}
Career & Progression (Beyond Year 1): {kb['beyond_year_1']}
Mandatory Verifications: {kb['verify']}

GROUNDED ADMISSIONS EXECUTION DIRECTIVE:
Align the generated pathway with the verified institutional guidelines above:
1. Early Phase: Diagnostic assessment, prerequisite coursework ({kb['eligibility']}), standardized testing, and portfolio/extracurricular development.
2. Middle Phase: Formal application submission via the designated institutional portal ({kb['application_package']}), recommendation briefings, and scholarship/funding applications.
3. Final Phase: Offer acceptance auditing, immigration/visa clearances ({kb['visa_and_arrival']}), orientation arrival, and Year 1 curriculum progression.
========================================================================
"""
        return prompt_block


# Singleton instance for direct import
rag_engine = AdmissionRAGService()
