import sys
sys.path.append('navi-agent/code')
from duration_service import parse_goal_components, resolve_target_program_duration
parsed = parse_goal_components("Bachelor's • Computer Science • Vellore Institute of Technology • India")
print("Parsed:", parsed)
dur, notes, status = resolve_target_program_duration(parsed)
print("Degree duration:", dur, notes, status)
