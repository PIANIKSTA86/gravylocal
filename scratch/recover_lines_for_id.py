import os

db_path = 'empresas/pb_data/data.db'
if not os.path.exists(db_path):
    print("File not found.")
else:
    with open(db_path, 'rb') as f:
        data = f.read()
        
    search_id = b'pkhmaudmhlrhris'
    idx = 0
    matches = []
    while True:
        idx = data.find(search_id, idx)
        if idx == -1:
            break
        matches.append(idx)
        idx += len(search_id)
        
    print(f"Found {len(matches)} occurrences of ID {search_id.decode()} in binary:")
    for i, m in enumerate(matches):
        start = max(0, m - 100)
        end = min(len(data), m + 200)
        chunk = data[start:end]
        readable = "".join([chr(b) if 32 <= b < 127 else '.' for b in chunk])
        print(f"Match {i+1} at offset {m}: {readable}")
        print("-" * 80)
