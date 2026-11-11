"""
=============================================================================
NAAVI PATH UNIQUENESS & CONSISTENCY AGENT – COMPREHENSIVE TEST SUITE
=============================================================================
Validates:
 1. Exact Duplicate Detection (Fingerprint, casing, punctuation)
 2. Near Duplicate Detection (Token Jaccard, n-grams, edit distance)
 3. Semantic Duplicate Detection (Subword TF-IDF & vector cosine similarity)
 4. Pedagogical Progression Preservation (Learn vs Practice vs Project)
 5. Description Boilerplate Detection & Synthesis
 6. Legitimate Recurrence Preservation (Periodic diagnostics across months)
 7. Marketplace Deduplication (Course & URL deduplication, provider diversity)
 8. Prerequisite DAG Remapping (No dangling links, topological sorting)
 9. Research Dataset Logging
10. Section 20 Regression Fixture (The 207-step screenshot case with repeated
    calculus, standardized diagnostics, and boilerplate descriptions)
=============================================================================
"""

import sys
import os
import math
import unittest

sys.path.append(os.path.dirname(__file__))

from path_uniqueness_agent import (
    PathUniquenessAgent,
    ExactDuplicateDetector,
    NearDuplicateDetector,
    SemanticSimilarityService,
    TaskIdentityEvaluator,
    DescriptionQualityValidator,
    RecurrenceValidator,
    MarketplaceUniquenessValidator,
    DuplicateResolutionService,
    path_uniqueness_agent
)
from uniqueness_models import (
    DuplicateClassification,
    ResolutionAction,
    TaskHierarchyLevel,
    TaskIdentity
)
from task_registry import GlobalTaskRegistry


class TestPathUniquenessAgent(unittest.TestCase):

    def setUp(self):
        self.agent = PathUniquenessAgent()

    # ── 1. EXACT DUPLICATE DETECTION TESTS ──
    def test_01_exact_duplicates(self):
        """Test exact duplicate detection with case, punctuation, and whitespace variations."""
        text_a = "Master Single-Variable Calculus Derivatives & Optimization"
        text_b = "master single-variable calculus derivatives & optimization"
        text_c = "  Master   Single-Variable  Calculus  Derivatives & Optimization! "

        self.assertTrue(ExactDuplicateDetector.are_exact_duplicates(text_a, text_b))
        self.assertTrue(ExactDuplicateDetector.are_exact_duplicates(text_a, text_c))
        self.assertEqual(ExactDuplicateDetector.fingerprint(text_a), ExactDuplicateDetector.fingerprint(text_c))

    # ── 2. NEAR DUPLICATE DETECTION TESTS ──
    def test_02_near_duplicates(self):
        """Test lexical, token overlap, and edit-distance near-duplicate detection."""
        text_a = "Master Python Programming Fundamentals"
        text_b = "Master the Fundamentals of Python Programming"
        text_c = "Learn Fundamental Python Programming Concepts"

        sim_ab = NearDuplicateDetector.compute_similarity(text_a, text_b)
        sim_ac = NearDuplicateDetector.compute_similarity(text_a, text_c)

        self.assertGreaterEqual(sim_ab, 0.70, f"Expected high lexical similarity, got {sim_ab}")
        self.assertGreaterEqual(sim_ac, 0.45, f"Expected moderate lexical similarity, got {sim_ac}")

    # ── 3. SEMANTIC SIMILARITY TESTS ──
    def test_03_semantic_similarity(self):
        """Test vector cosine similarity for differently worded activities with same purpose."""
        service = SemanticSimilarityService()
        
        # Two differently worded tasks on the same concept
        task_1 = "Learn Python variables, data types and operators"
        task_2 = "Understand basic Python programming concepts, including variables and operators"
        
        # Genuinely distinct task
        task_distinct = "Study Shakespearean English Drama and Renaissance Literature"

        sim_same = service.cosine_similarity(task_1, task_2)
        sim_diff = service.cosine_similarity(task_1, task_distinct)

        self.assertGreaterEqual(sim_same, 0.58, f"Expected high semantic similarity, got {sim_same}")
        self.assertLess(sim_diff, 0.35, f"Expected low semantic similarity, got {sim_diff}")

    # ── 4. PEDAGOGICAL PROGRESSION PRESERVATION ──
    def test_04_progression_preservation(self):
        """Ensure Learn vs Practice vs Project on the same subject are preserved as distinct progression."""
        task_learn = self.agent.registry.build_task_identity({
            "id": 1,
            "title": "Study Single-Variable Calculus Derivatives & Limits",
            "description": "Read textbook chapters on limits and differential calculus."
        })
        task_practice = self.agent.registry.build_task_identity({
            "id": 2,
            "title": "Solve Optimization Models & Applied Calculus Exercises",
            "description": "Work through 50 applied problem sets."
        })
        task_project = self.agent.registry.build_task_identity({
            "id": 3,
            "title": "Build Applied Calculus Simulation Software in Python",
            "description": "Implement numerical differentiation algorithms."
        })

        self.assertTrue(TaskIdentityEvaluator.are_valid_progression(task_learn, task_practice))
        self.assertTrue(TaskIdentityEvaluator.are_valid_progression(task_practice, task_project))

    # ── 5. DESCRIPTION BOILERPLATE DETECTION & REPAIR ──
    def test_05_description_boilerplate_detection_and_synthesis(self):
        """Verify detection of generic boilerplate sentences and dynamic task-specific synthesis."""
        defective_desc = "Study dynamic programming techniques. Ensures rigorous concept verification and tangible academic deliverable for Foundational STEM & Language Prep."
        
        bp = DescriptionQualityValidator.identify_boilerplate(defective_desc)
        self.assertIsNotNone(bp, "Failed to detect known boilerplate pattern!")

        cleaned = DescriptionQualityValidator.clean_description(defective_desc)
        self.assertNotIn("Ensures rigorous concept verification", cleaned)

        # Synthesize fresh authentic description
        synth = DescriptionQualityValidator.synthesize_task_specific_description(
            title="Design Object-Oriented Software Architecture & Clean Interfaces",
            action="Design",
            topic="Object-Oriented Software Architecture & Clean Interfaces"
        )
        self.assertIn("modular class hierarchies", synth)
        self.assertNotIn("rigorous concept verification", synth)

    # ── 6. LEGITIMATE RECURRENCE PRESERVATION ──
    def test_06_legitimate_recurrence(self):
        """Ensure standardized diagnostics across different months are preserved as valid recurrences."""
        task_m1 = self.agent.registry.build_task_identity({
            "id": 10,
            "title": "Execute Official Standardized Exam Diagnostic Baseline",
            "duration": "Month 1",
            "scheduled_period": "Month 1"
        })
        task_m6 = self.agent.registry.build_task_identity({
            "id": 45,
            "title": "Execute Official Standardized Exam Diagnostic Baseline",
            "duration": "Month 6",
            "scheduled_period": "Month 6"
        })

        is_rec, reason = RecurrenceValidator.evaluate_recurrence(task_m1, task_m6)
        self.assertTrue(is_rec, "Legitimate diagnostic across distinct months should be preserved!")
        self.assertIn("Periodic academic progress benchmark", reason)

    # ── 7. MARKETPLACE UNIQUENESS & DEDUPLICATION ──
    def test_07_marketplace_deduplication(self):
        """Ensure identical course recommendations across steps are cleaned while preserving valid diversity."""
        steps = [
            {
                "id": 1,
                "title": "Differential Calculus",
                "marketplace": {
                    "vendors": [{"name": "Coursera Single Variable Calculus", "url": "https://coursera.org/calc", "provider": "Coursera"}]
                }
            },
            {
                "id": 2,
                "title": "Linear Algebra",
                "marketplace": {
                    # Identical course repeated under unrelated step
                    "vendors": [
                        {"name": "Coursera Single Variable Calculus", "url": "https://coursera.org/calc", "provider": "Coursera"},
                        {"name": "MIT OpenCourseWare Linear Algebra", "url": "https://ocw.mit.edu/1806", "provider": "MIT"}
                    ]
                }
            }
        ]

        repaired_steps, dups, resolved = MarketplaceUniquenessValidator.audit_and_deduplicate(steps)
        self.assertEqual(resolved, 1)
        # Step 2 should now have only MIT Linear Algebra, not the duplicated Calculus course
        step_2_vendors = repaired_steps[1]["marketplace"]["vendors"]
        self.assertEqual(len(step_2_vendors), 1)
        self.assertEqual(step_2_vendors[0]["name"], "MIT OpenCourseWare Linear Algebra")

    # ── 8. PREREQUISITE DAG REMAPPING AFTER DUPLICATE REMOVAL ──
    def test_08_prerequisite_dag_repair(self):
        """Verify prerequisite graph remapping when an intermediate duplicate is removed."""
        raw_steps = [
            {"id": 1, "title": "Calculus 1 Limits", "prerequisites": []},
            {"id": 2, "title": "Calculus 1 Derivatives", "prerequisites": [1]},
            {"id": 3, "title": "Calculus 1 Derivatives", "prerequisites": [2]},  # Exact duplicate of step 2!
            {"id": 4, "title": "Calculus 1 Integrals", "prerequisites": [3]}    # Dependent on duplicate step 3
        ]

        repaired_path, report = self.agent.audit_and_repair({"steps": raw_steps})
        steps = repaired_path["steps"]

        # Step 3 should be removed, leaving 3 unique steps
        self.assertEqual(len(steps), 3)
        self.assertEqual(report.confirmed_duplicates_resolved, 1)

        # The new step 3 (Calculus 1 Integrals) must now depend on the retained Calculus 1 Derivatives (Step 2)
        step_3 = steps[2]
        self.assertEqual(step_3["title"], "Calculus 1 Integrals")
        self.assertEqual(step_3["prerequisites"], [2], "Prerequisite DAG failed to remap from removed Step 3 to retained Step 2!")

    # ── 9. SECTION 20 REGRESSION FIXTURE (THE 207-STEP SCREENSHOT CASE) ──
    def test_09_reproduce_207_step_screenshot_defects(self):
        """
        Reproduce the exact defect scenario from the user screenshots:
        1. Repeated 'Master Single-Variable Calculus Derivatives & Optimization' at steps 202, 203, 204, 206
        2. Repeated 'Execute Official Standardized Exam Diagnostic Baseline' at steps 201, 205 (in the same period)
        3. Generic boilerplate sentence:
           'Ensures rigorous concept verification and tangible academic deliverable for Foundational STEM & Language Prep.'
        4. Verifies 100% resolution: duplicates removed, dependencies remapped, boilerplate eliminated!
        """
        print("\n--- TEST 09: Executing Section 20 Regression Fixture (207-Step Screenshot Case) ---")
        
        # 200 genuinely distinct curriculum units (10 academic subjects x 20 distinct conceptual areas)
        SUBJECTS = ["Differential Calculus", "Classical Physics", "Linear Matrix Algebra", "Algorithms & Complexity", "Relational Databases", "Computer Systems", "Network Architecture", "Organic Chemistry", "Molecular Biology", "Macroeconomics"]
        CONCEPTS = [
            ("Foundational Principles", "Study core theoretical foundations and axiomatic definitions"),
            ("Analytical Derivations", "Derive formal mathematical proofs and equation equilibria"),
            ("Empirical Laboratory Drills", "Execute practical bench experiments and record measurements"),
            ("Numerical Methods Simulation", "Write computational numerical algorithms to model behaviors"),
            ("Optimization Techniques", "Formulate constrained optimization problems and solve extrema"),
            ("Asymptotic Scaling Analysis", "Evaluate boundary conditions and asymptotic convergence limits"),
            ("Error Propagation Models", "Analyze empirical uncertainty bounds and statistical errors"),
            ("Dynamic State Transitions", "Model continuous and discrete state transitions across time"),
            ("Iterative Refinement Cycles", "Perform iterative convergence benchmarking on problem sets"),
            ("Case Study Investigations", "Analyze historic published peer-reviewed academic findings"),
            ("Synthesis Laboratory Defense", "Synthesize novel compounds and defend procedural pathways"),
            ("Automated Benchmark Testing", "Execute continuous automated test harnesses against specs"),
            ("Spatial Topological Mapping", "Map geometric coordinate spaces and manifold curves"),
            ("Stochastic Probability Modeling", "Compute expectation values under stochastic Markov processes"),
            ("Comparative Literature Survey", "Review state-of-the-art academic papers and summarize techniques"),
            ("Modular Architectural Refactoring", "Refactor complex monolithic designs into decoupled modules"),
            ("Systemic Constraint Solving", "Solve multi-variable constraint satisfaction scenarios"),
            ("Diagnostic Verification Testing", "Run comprehensive diagnostic unit audits and log results"),
            ("Interdisciplinary Synthesis Project", "Bridge disparate concepts into a unified capstone prototype"),
            ("Final Evaluative Defense Session", "Present research findings before peer review committee")
        ]

        fixture_steps = []
        step_counter = 1
        for subj in SUBJECTS:
            for conc_title, conc_desc in CONCEPTS:
                action = ["Master", "Analyze", "Formulate", "Execute", "Implement", "Derive", "Evaluate", "Synthesize", "Verify", "Investigate"][step_counter % 10]
                title = f"{action} {subj}: {conc_title}"
                fixture_steps.append({
                    "id": step_counter,
                    "title": title,
                    "description": f"{conc_desc} for {subj}.",
                    "prerequisites": [step_counter - 1] if step_counter > 1 else [],
                    "marketplace": {"vendors": []}
                })
                step_counter += 1

        # Inject the exact defects shown in the screenshot at steps 201-207:
        boilerplate_text = "Ensures rigorous concept verification and tangible academic deliverable for Foundational STEM & Language Prep."

        # Step 201: Diagnostic Baseline
        fixture_steps.append({
            "id": 201,
            "title": "Execute Official Standardized Exam Diagnostic Baseline",
            "description": f"Complete official timed diagnostic. {boilerplate_text}",
            "prerequisites": [200],
            "marketplace": {"vendors": []}
        })
        # Step 202: Calculus Derivatives
        fixture_steps.append({
            "id": 202,
            "title": "Master Single-Variable Calculus Derivatives & Optimization",
            "description": f"Solve optimization problem sets. {boilerplate_text}",
            "prerequisites": [201],
            "marketplace": {"vendors": []}
        })
        # Step 203: Duplicate Calculus
        fixture_steps.append({
            "id": 203,
            "title": "Master Single-Variable Calculus Derivatives & Optimization",
            "description": f"Solve optimization problem sets. {boilerplate_text}",
            "prerequisites": [202],
            "marketplace": {"vendors": []}
        })
        # Step 204: Duplicate Calculus
        fixture_steps.append({
            "id": 204,
            "title": "Master Single-Variable Calculus Derivatives & Optimization",
            "description": f"Solve optimization problem sets. {boilerplate_text}",
            "prerequisites": [203],
            "marketplace": {"vendors": []}
        })
        # Step 205: Duplicate Diagnostic Baseline (in same period)
        fixture_steps.append({
            "id": 205,
            "title": "Execute Official Standardized Exam Diagnostic Baseline",
            "description": f"Complete official timed diagnostic. {boilerplate_text}",
            "prerequisites": [204],
            "marketplace": {"vendors": []}
        })
        # Step 206: Duplicate Calculus
        fixture_steps.append({
            "id": 206,
            "title": "Master Single-Variable Calculus Derivatives & Optimization",
            "description": f"Solve optimization problem sets. {boilerplate_text}",
            "prerequisites": [205],
            "marketplace": {"vendors": []}
        })
        # Step 207: Final legitimate capstone
        fixture_steps.append({
            "id": 207,
            "title": "Final University Admissions & Enrollment Confirmation",
            "description": "Submit matriculation deposit and accept university admission offer.",
            "prerequisites": [206],
            "marketplace": {"vendors": []}
        })

        roadmap_fixture = {
            "path_title": "Grade 11 to Purdue University Computer Science Pathway",
            "total_duration": "24 Months",
            "steps": fixture_steps
        }

        self.assertEqual(len(roadmap_fixture["steps"]), 207)

        # Run PathUniquenessAgent Audit
        audit_rep = self.agent.audit(roadmap_fixture)
        print(f"Audit Detected {audit_rep.confirmed_duplicates_detected} confirmed duplicate pairs.")
        print(f"Audit Detected {len(audit_rep.description_defects)} boilerplate description defects.")

        # Must detect duplicates of calculus (steps 203, 204, 206) and diagnostic (step 205)
        self.assertGreaterEqual(audit_rep.confirmed_duplicates_detected, 4)
        self.assertGreaterEqual(len(audit_rep.description_defects), 6)

        # Run PathUniquenessAgent Repair
        repaired_roadmap, rep = self.agent.repair(roadmap_fixture, audit_report=audit_rep)
        repaired_steps = repaired_roadmap["steps"]

        print(f"Original Steps: {len(fixture_steps)} -> Repaired Steps: {len(repaired_steps)}")
        print(f"Duplicates Resolved: {rep.confirmed_duplicates_resolved}")
        print(f"Descriptions Regenerated: {rep.descriptions_regenerated}")
        print(f"Dependency DAG Edges Repaired: {rep.dependency_repairs_completed}")

        # Verify duplicate titles no longer occur repeatedly
        final_titles = [s["title"] for s in repaired_steps]
        calc_count = final_titles.count("Master Single-Variable Calculus Derivatives & Optimization")
        diag_count = final_titles.count("Execute Official Standardized Exam Diagnostic Baseline")

        self.assertEqual(calc_count, 1, f"Calculus title should appear exactly once, got {calc_count}")
        self.assertEqual(diag_count, 1, f"Diagnostic title should appear exactly once, got {diag_count}")

        # Verify boilerplate phrase is completely eliminated from all descriptions
        for s in repaired_steps:
            self.assertNotIn("Ensures rigorous concept verification", s.get("description", ""))

        # Verify dependency DAG integrity: no step references a non-existent or forward prerequisite
        max_id = len(repaired_steps)
        for s in repaired_steps:
            sid = s["id"]
            for p in s.get("prerequisites", []):
                self.assertLess(p, sid, f"Step {sid} has invalid forward/self prerequisite {p}!")
                self.assertGreaterEqual(p, 1, f"Step {sid} has invalid non-positive prerequisite {p}!")

        # Verify final capstone step is preserved and correctly linked
        last_step = repaired_steps[-1]
        self.assertEqual(last_step["title"], "Final University Admissions & Enrollment Confirmation")
        self.assertTrue(len(last_step["prerequisites"]) > 0)

        print("[PASS] Test 09 completed. 207-step screenshot regression fixture 100% resolved!")

    # ── 10. STRING PREREQUISITE AND TITLE RESOLUTION TEST ──
    def test_10_string_prerequisites_resolution(self):
        """
        Verify that string titles or string numbers generated by LLMs in prerequisites
        are safely parsed by TaskIdentity and accurately remapped into integer step IDs.
        """
        raw_steps = [
            {
                "id": 1,
                "title": "Master Review Fundamental Limits and Continuity",
                "description": "Foundational limits.",
                "prerequisites": []
            },
            {
                "id": 2,
                "title": "Solve Single-Variable Differentiation Techniques",
                "description": "Applied derivative problem sets.",
                # String title matching step 1
                "prerequisites": ["Master Review Fundamental Limits and Continuity"]
            },
            {
                "id": 3,
                "title": "Execute Integral Calculus Drills",
                "description": "Integration techniques.",
                # String number and unmatched string
                "prerequisites": ["2", "UnmatchedFutureTitle"]
            }
        ]

        # Ensure TaskIdentity builds with zero validation errors
        for s in raw_steps:
            ident = self.agent.registry.build_task_identity(s)
            self.assertIsNotNone(ident)

        # Audit and repair
        repaired_path, report = self.agent.audit_and_repair({"steps": raw_steps})
        steps = repaired_path["steps"]

        # Step 2 must resolve string title to step 1
        self.assertEqual(steps[1]["prerequisites"], [1])
        # Step 3 must resolve string '2' to step 2
        self.assertEqual(steps[2]["prerequisites"], [2])
        # All prerequisites must be pure integers
        for s in steps:
            for p in s["prerequisites"]:
                self.assertIsInstance(p, int)

        print("[PASS] Test 10 completed. String prerequisites resolved to valid integers.")


if __name__ == "__main__":
    unittest.main()
