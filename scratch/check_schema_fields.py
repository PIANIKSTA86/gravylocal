import sqlite3
import json

try:
    conn = sqlite3.connect('pb_data/data.db')
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM _collections WHERE name='products'")
    row = cursor.fetchone()
    if row:
        # Print column names and values
        cursor.execute("PRAGMA table_info(_collections)")
        cols = [c[1] for c in cursor.fetchall()]
        data = dict(zip(cols, row))
        print("Collection data:")
        for k, v in data.items():
            if k in ('schema', 'fields'):
                try:
                    print(f"  {k}:", json.dumps(json.loads(v), indent=2))
                except:
                    print(f"  {k}:", v)
            else:
                print(f"  {k}:", v)
    else:
        print("Collection not found")
except Exception as e:
    print("Error:", e)
finally:
    conn.close()
