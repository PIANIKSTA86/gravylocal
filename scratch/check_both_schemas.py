import sqlite3
import json

dbs = {
    "HUB DB": "c:/Users/JULIAN/Desktop/GravyLocal2.0/hub/pb_data/data.db",
    "TENANT DB": "c:/Users/JULIAN/Desktop/GravyLocal2.0/pb_data/data.db"
}

for name, path in dbs.items():
    print(f"=== Checking {name} ({path}) ===")
    try:
        conn = sqlite3.connect(path)
        cursor = conn.cursor()
        
        # Check if table exists in _collections
        cursor.execute("SELECT fields FROM _collections WHERE name='licenses'")
        row = cursor.fetchone()
        if row:
            fields_json = row[0]
            if fields_json:
                fields = json.loads(fields_json)
                print("Fields:")
                for f in fields:
                    if f.get('name') in ['enabled', 'module_key']:
                        print("  -", f)
            else:
                print("Fields is empty.")
        else:
            print("Collection 'licenses' not found in _collections table.")
        
        conn.close()
    except Exception as e:
        print("Error:", e)
    print()
