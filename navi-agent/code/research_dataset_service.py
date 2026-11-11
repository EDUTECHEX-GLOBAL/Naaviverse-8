"""
=============================================================================
NAAVI RESEARCH DATASET SERVICE
=============================================================================
Persists complete academic pathway generation provenance, multi-level uniqueness
evaluations, candidate duplicate pairs, AI adjudications, repair decisions,
and human review labels for empirical research.

Data is stored in:
1. Local JSONL / JSON dataset directory (`navi-agent/research_dataset/`)
2. MongoDB `research_evaluations` collection (when DB connection is active)
=============================================================================
"""

import json
import os
import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional

from uniqueness_models import ResearchDatasetRecord


RESEARCH_DIR = os.path.join(os.path.dirname(__file__), "..", "research_dataset")


class ResearchDatasetService:
    """Manages persistent logging of pathway generations and uniqueness audits."""

    def __init__(self, output_dir: Optional[str] = None):
        self.output_dir = output_dir or os.path.abspath(RESEARCH_DIR)
        os.makedirs(self.output_dir, exist_ok=True)
        self.jsonl_path = os.path.join(self.output_dir, "naavi_uniqueness_research_dataset.jsonl")

    def record_generation_and_audit(
        self,
        generation_id: str,
        current_position: str,
        target_goal: str,
        profile: Dict[str, Any],
        raw_pathway: Dict[str, Any],
        repaired_pathway: Optional[Dict[str, Any]] = None,
        uniqueness_report: Optional[Dict[str, Any]] = None,
        db: Optional[Any] = None
    ) -> ResearchDatasetRecord:
        """
        Creates and persists a research record for an academic pathway generation run.
        """
        record = ResearchDatasetRecord(
            record_id=f"rec_{generation_id[:8]}_{uuid.uuid4().hex[:6]}",
            timestamp=datetime.utcnow().isoformat(),
            student_profile_snapshot=profile or {},
            target_goal=target_goal,
            current_position=current_position,
            generator_version="2.1-uniqueness-agent",
            raw_pathway_snapshot={
                "path_title": raw_pathway.get("path_title"),
                "total_duration": raw_pathway.get("total_duration"),
                "total_steps": len(raw_pathway.get("steps") or []),
                "steps": raw_pathway.get("steps") or []
            },
            repaired_pathway_snapshot={
                "path_title": repaired_pathway.get("path_title"),
                "total_duration": repaired_pathway.get("total_duration"),
                "total_steps": len(repaired_pathway.get("steps") or []),
                "steps": repaired_pathway.get("steps") or []
            } if repaired_pathway else None,
            uniqueness_report=uniqueness_report,
            detector_config_version="v2.0-calibrated"
        )

        # 1. Append to local JSONL for offline research analysis
        try:
            with open(self.jsonl_path, "a", encoding="utf-8") as f:
                f.write(record.model_dump_json() + "\n")
        except Exception as e:
            print(f"[Research Dataset Warning] Failed to append to JSONL: {e}")

        # 2. Persist individual record snapshot
        rec_file = os.path.join(self.output_dir, f"{record.record_id}.json")
        try:
            with open(rec_file, "w", encoding="utf-8") as f:
                f.write(record.model_dump_json(indent=2))
        except Exception as e:
            print(f"[Research Dataset Warning] Failed to write individual record: {e}")

        # 3. Store in MongoDB if db is provided
        if db is not None:
            try:
                import asyncio
                coll = getattr(db, "research_evaluations", None)
                if coll is not None:
                    asyncio.create_task(coll.insert_one(record.model_dump()))
            except Exception as e:
                print(f"[Research Dataset Warning] Async MongoDB insert failed: {e}")

        return record

    def record_human_feedback(
        self,
        record_id: str,
        human_decision: Dict[str, Any],
        db: Optional[Any] = None
    ) -> bool:
        """Records human review feedback into the research dataset."""
        feedback_file = os.path.join(self.output_dir, f"{record_id}_feedback.json")
        try:
            with open(feedback_file, "w", encoding="utf-8") as f:
                json.dump({
                    "record_id": record_id,
                    "timestamp": datetime.utcnow().isoformat(),
                    "feedback": human_decision
                }, f, indent=2)
            return True
        except Exception as e:
            print(f"[Research Dataset Warning] Failed to record human feedback: {e}")
            return False


research_dataset_service = ResearchDatasetService()

