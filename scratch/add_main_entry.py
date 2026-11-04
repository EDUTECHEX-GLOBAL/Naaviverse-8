with open('navi-agent/code/main.py', 'r', encoding='utf-8') as f:
    content = f.read()

if '__main__' not in content[-300:]:
    addition = '''

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        reload_excludes=["test_*.py", "results_*.json", "benchmark_*.json", "scratch/*", "*.log"]
    )
'''
    content = content.rstrip() + addition
    with open('navi-agent/code/main.py', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Added __main__ entry point to main.py successfully.")
else:
    print("__main__ already exists.")

