import os

log_path = r'C:\Users\JULIAN\.gemini\antigravity-ide\brain\82319753-0105-4a58-a8c5-12f801fdbf39\.system_generated\logs\transcript.jsonl'

if os.path.exists(log_path):
    print("Log file exists. Searching...")
    with open(log_path, 'r', encoding='utf-8') as f:
        for i, line in enumerate(f):
            if '.png' in line.lower() or '.jpg' in line.lower() or '.jpeg' in line.lower() or 'media' in line.lower():
                print(f"Line {i+1}: {line[:300]}...")
else:
    print("Log file does not exist")
