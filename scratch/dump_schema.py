import sqlite3
import json

db_path = r'c:\Users\JULIAN\Desktop\GravyLocal2.0\pb_data\data.db'
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

cursor.execute("SELECT name, listRule, viewRule, createRule, updateRule, deleteRule, fields FROM _collections")
rows = cursor.fetchall()

for row in rows:
    name, list_rule, view_rule, create_rule, update_rule, delete_rule, fields_json = row
    print("=" * 50)
    print(f"Collection: {name}")
    print(f"Rules: list={list_rule}, view={view_rule}, create={create_rule}, update={update_rule}, delete={delete_rule}")
    try:
        fields = json.loads(fields_json)
        print("Fields:")
        for f in fields:
            name_f = f.get('name')
            type_f = f.get('type')
            req = '*' if f.get('required') else ''
            print(f"  - {name_f} ({type_f}){req}")
    except Exception as e:
        print(f"Fields (error parsing): {fields_json}")

conn.close()
