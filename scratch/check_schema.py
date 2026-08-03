import sqlite3
import json

db_path = 'c:/Users/JULIAN/Desktop/GravyLocal2.0/hub/pb_data/data.db'
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

cursor.execute("SELECT * FROM _collections WHERE name='licenses'")
row = cursor.fetchone()
if row:
    # Print the columns of _collections table
    col_names = [description[0] for description in cursor.description]
    data = dict(zip(col_names, row))
    print("Collection keys:", data.keys())
    print("Collection name:", data.get('name'))
    
    # PocketBase v0.22/v0.23 schema or fields is stored in 'schema' or 'fields'
    for k in ['schema', 'fields']:
        val = data.get(k)
        if val:
            print(f"\n--- Content of {k} ---")
            try:
                parsed = json.loads(val)
                print(json.dumps(parsed, indent=2))
            except Exception as e:
                print(f"Could not parse {k} as JSON: {val}")
else:
    print("Collection 'licenses' not found.")

conn.close()
