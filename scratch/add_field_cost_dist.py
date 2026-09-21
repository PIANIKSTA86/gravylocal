import sqlite3
import json

conn = sqlite3.connect('pb_data/data.db')
c = conn.cursor()

c.execute("SELECT fields FROM _collections WHERE name = 'import_invoices'")
fields_json = c.fetchone()[0]
fields = json.loads(fields_json)

# Check if cost_distribution_pct already exists in fields
existing = [f for f in fields if f.get('name') == 'cost_distribution_pct']
print("Existing cost_distribution_pct field:", existing)

if not existing:
    new_field = {
        "help": "",
        "hidden": False,
        "id": "num_cost_dist_pct",
        "max": 100,
        "min": 0,
        "name": "cost_distribution_pct",
        "onlyInt": False,
        "presentable": False,
        "required": False,
        "system": False,
        "type": "number"
    }
    fields.append(new_field)
    updated_json = json.dumps(fields)
    c.execute("UPDATE _collections SET fields = ? WHERE name = 'import_invoices'", (updated_json,))
    conn.commit()
    print("Successfully added cost_distribution_pct to _collections.fields for import_invoices!")
else:
    print("Field already present in _collections")

conn.close()
