import duration_service

c = "Grade 11 • General (K-10) Stream • CBSE • little flower • Hyderabad, Telangana, India"
g = "Bachelor's • Computer Science • Georgia Institute of Technology • USA"

res = duration_service.calculate_path_duration(c, g)
print(f"Goal: '{g}'")
print(f"Current: '{c}'")
print(f"Total Months: {res['total_duration_months']}")
print("Stages:")
for s in res['calculation']:
    print(f"  - {s['stage']}: {s['months']}m ({s['stage_type']})")
