with open('frontend/src/utils.ts', 'r', encoding='utf-8') as f:
    for i, line in enumerate(f, 1):
        if 'fmt' in line or 'format' in line:
            if 'function' in line or '=' in line:
                print(f"Line {i}: {line.strip()}")
