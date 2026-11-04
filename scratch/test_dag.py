import re
from typing import Dict, Any, List

def detect_dag_cycles_and_inversions(steps: List[Dict[str, Any]]):
    # Step 1: Check explicit prerequisites DAG
    adj = {}
    in_degree = {}
    id_to_idx = {}
    
    for idx, s in enumerate(steps, start=1):
        sid = s.get("id", idx)
        id_to_idx[sid] = idx
        adj[sid] = []
        in_degree[sid] = 0

    explicit_edges = []
    for idx, s in enumerate(steps, start=1):
        sid = s.get("id", idx)
        prereqs = s.get("prerequisites") or []
        for p in prereqs:
            if p in adj:
                adj[p].append(sid)
                in_degree[sid] += 1
                explicit_edges.append((p, sid))

    # Kahn's algorithm for cycles
    queue = [sid for sid, deg in in_degree.items() if deg == 0]
    visited_count = 0
    while queue:
        u = queue.pop(0)
        visited_count += 1
        for v in adj.get(u, []):
            in_degree[v] -= 1
            if in_degree[v] == 0:
                queue.append(v)

    has_cycle = visited_count < len(adj) if adj else False
    
    # Check for forward prerequisites (prerequisite placed after dependent step)
    prereq_inversions = []
    for p, dep in explicit_edges:
        if id_to_idx[p] > id_to_idx[dep]:
            prereq_inversions.append((dep, p))

    return has_cycle, prereq_inversions

print("Testing DAG cycle detection:")
steps_with_cycle = [
    {"id": 1, "title": "A", "prerequisites": [2]},
    {"id": 2, "title": "B", "prerequisites": [1]}
]
print("Has cycle:", detect_dag_cycles_and_inversions(steps_with_cycle))

steps_valid = [
    {"id": 1, "title": "A", "prerequisites": []},
    {"id": 2, "title": "B", "prerequisites": [1]}
]
print("Valid DAG:", detect_dag_cycles_and_inversions(steps_valid))

