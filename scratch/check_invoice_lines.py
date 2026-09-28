import sqlite3, glob, json

for dbpath in glob.glob("empresas/**/data.db", recursive=True) + glob.glob("pb_data/data.db"):
    conn = sqlite3.connect(dbpath)
    c = conn.cursor()
    c.execute("SELECT fields FROM _collections WHERE name='ph_invoice_lines'")
    row = c.fetchone()
    if row:
        fields = json.loads(row[0])
        print(dbpath, "ph_invoice_lines fields:")
        for f in fields:
            print("  ", f.get('name'), "type=", f.get('type'), "required=", f.get('required'))
