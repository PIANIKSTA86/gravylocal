import os
import sqlite3

for root, dirs, files in os.walk('.'):
    if 'node_modules' in root or '.git' in root:
        continue
    for f in files:
        if f.endswith('.db'):
            p = os.path.join(root, f)
            try:
                c = sqlite3.connect(p)
                cur = c.cursor()
                cur.execute("SELECT COUNT(*) FROM tx_lines WHERE description LIKE '%Abono anticipado%'")
                cnt = cur.fetchone()[0]
                if cnt > 0:
                    print(f"FOUND {cnt} lines in {p}")
            except Exception as e:
                pass
