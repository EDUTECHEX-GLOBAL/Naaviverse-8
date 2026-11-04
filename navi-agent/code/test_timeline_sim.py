stages_windows = [
    {'stage_name': 'Grade 11', 'start_month': 1, 'end_month': 12, 'months': 12},
    {'stage_name': 'Grade 12', 'start_month': 13, 'end_month': 24, 'months': 12}
]

steps = []
step_id = 1
for m in range(1, 11):
    m_id = step_id
    stage = 'Grade 11' if m <= 5 else 'Grade 12'
    steps.append({
        'id': m_id,
        'title': f'Milestone {m} in {stage}',
        'parent_milestone': stage,
        'hierarchy_level': 'milestone',
        'prerequisites': [m_id - 5] if m_id > 5 else [],
        'can_parallel': False
    })
    step_id += 1
    for sub in range(1, 5):
        steps.append({
            'id': step_id,
            'title': f'Milestone {m} Subtask {sub}',
            'parent_milestone': stage,
            'parent_id': m_id,
            'hierarchy_level': 'nano_subtask',
            'prerequisites': [m_id],
            'can_parallel': (sub % 2 == 1)
        })
        step_id += 1
        
# Assign windows
for s in steps:
    if 'Grade 11' in s['title'] or 'Grade 11' in s.get('parent_milestone', ''):
        s['_win'] = stages_windows[0]
    else:
        s['_win'] = stages_windows[1]
        
id_to_step = {s['id']: s for s in steps}

for win in stages_windows:
    stage_steps = [s for s in steps if s['_win'] == win]
    stage_len = len(stage_steps)
    win_span = win['end_month'] - win['start_month']
    for pos, s in enumerate(stage_steps):
        target_start = win['start_month'] + int(pos * win_span / max(1, stage_len - 1))
        earliest_start = target_start
        for p_id in s.get('prerequisites', []):
            if p_id in id_to_step:
                p_s = id_to_step[p_id]
                if s['can_parallel']:
                    earliest_start = max(earliest_start, p_s.get('start_month', win['start_month']))
                else:
                    earliest_start = max(earliest_start, p_s.get('end_month', win['start_month']))
        start_m = min(earliest_start, win['end_month'])
        is_m = s.get('hierarchy_level') == 'milestone'
        dur_m = 2 if is_m else 1
        end_m = min(start_m + dur_m - 1, win['end_month'])
        if end_m < start_m: end_m = start_m
        s['start_month'] = start_m
        s['end_month'] = end_m
        s['duration'] = f'Month {start_m}' if start_m == end_m else f'Month {start_m}-{end_m}'

for s in steps:
    print(f"Step {s['id']:2d} ({s['hierarchy_level'][:4]}): {s['title'][:32]:<32} -> {s['duration']}")
