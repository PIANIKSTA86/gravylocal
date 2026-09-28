import sqlite3
import json
import glob

dbs = glob.glob("empresas/**/data.db", recursive=True) + glob.glob("pb_data/data.db")
print("Found databases:", dbs)

for dbpath in dbs:
    try:
        conn = sqlite3.connect(dbpath)
        c = conn.cursor()
        c.execute("SELECT fields FROM _collections WHERE name='ph_billing_concepts'")
        row = c.fetchone()
        if not row:
            continue
        fields = json.loads(row[0])
        modified = False
        for f in fields:
            if f.get('name') == 'amount' and f.get('required') is True:
                f['required'] = False
                modified = True
                print(f"[{dbpath}] Setting ph_billing_concepts.amount required = False")
        
        if modified:
            c.execute("UPDATE _collections SET fields=? WHERE name='ph_billing_concepts'", (json.dumps(fields),))
            conn.commit()
            print(f"[{dbpath}] Updated _collections successfully")

        # Also check if MORA concept exists in ph_billing_concepts
        c.execute("SELECT id, code, name, amount FROM ph_billing_concepts WHERE code='MORA'")
        mora = c.fetchone()
        if not mora:
            print(f"[{dbpath}] MORA concept missing, creating it...")
            # Generate random 15-char id like pocketbase (e.g. 'mora' + random or hex)
            import secrets, string
            chars = string.ascii_lowercase + string.digits
            new_id = ''.join(secrets.choice(chars) for _ in range(15))
            c.execute("""
                INSERT INTO ph_billing_concepts (id, code, name, description, amount, is_variable, applies_coef, active, account_id)
                VALUES (?, 'MORA', 'INTERESES DE MORA', 'Intereses de mora por pagos de administración vencidos', 0, 1, 0, 1, '')
            """, (new_id,))
            conn.commit()
            print(f"[{dbpath}] Created MORA concept with id: {new_id}")
        else:
            print(f"[{dbpath}] MORA concept already exists: {mora}")
        conn.close()
    except Exception as e:
        print(f"[{dbpath}] Error: {e}")
