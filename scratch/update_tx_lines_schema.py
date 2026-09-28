import sqlite3, json

con = sqlite3.connect('pb_data/data.db')
cur = con.cursor()
row = cur.execute("SELECT fields FROM _collections WHERE name = 'tx_lines'").fetchone()
if row and row[0]:
    fields = json.loads(row[0])
    for f in fields:
        if f.get('name') == 'import_concept':
            vals = f.get('values', [])
            if 'capitalization' not in vals:
                vals.append('capitalization')
                f['values'] = vals
                print("Updated import_concept values:", vals)
    new_fields_json = json.dumps(fields)
    cur.execute("UPDATE _collections SET fields = ? WHERE name = 'tx_lines'", (new_fields_json,))
    con.commit()
    print("tx_lines collection updated in SQLite successfully.")
con.close()
