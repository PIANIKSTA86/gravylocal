import sqlite3
import json

def patch_tenant_licenses_schema():
    con = sqlite3.connect('pb_data/data.db')
    cur = con.cursor()
    cur.execute("SELECT fields FROM _collections WHERE name='licenses'")
    row = cur.fetchone()
    if not row:
        print("Collection 'licenses' not found in pb_data/data.db")
        con.close()
        return

    fields = json.loads(row[0])
    all_needed = [
        "core", "contabilidad", "comercial", "crm", "nomina",
        "copropiedades", "inmobiliarias", "logistica", "inventarios",
        "tesoreria", "tienda-virtual", "spa", "spa-belleza",
        "conciliacion", "niif", "activos_fijos", "full"
    ]
    
    modified = False
    for f in fields:
        if f.get('name') == 'module_key' and f.get('type') == 'select':
            current_vals = f.get('values', [])
            for mod in all_needed:
                if mod not in current_vals:
                    current_vals.append(mod)
                    modified = True
            f['values'] = current_vals
            # Also ensure required is false so it doesn't fail on empty
            print("Updated module_key values:", current_vals)
            break
            
    if modified:
        cur.execute("UPDATE _collections SET fields=? WHERE name='licenses'", (json.dumps(fields),))
        con.commit()
        print("Schema updated in _collections successfully.")
    else:
        print("Schema already contained all needed module keys.")

    # Now let's synchronize licenses table in pb_data/data.db
    # Read licenses from HUB for kojdt7illwylll1
    con_hub = sqlite3.connect('hub/pb_data/data.db')
    cur_hub = con_hub.cursor()
    hub_licenses = {}
    for r in cur_hub.execute("SELECT module_key, enabled, plan FROM licenses WHERE company_id='kojdt7illwylll1'"):
        hub_licenses[r[0]] = {"enabled": bool(r[1]), "plan": r[2]}
    con_hub.close()
    print("HUB licenses for kojdt7illwylll1:", hub_licenses)

    # Insert or update each license in Tenant DB
    for mod, data in hub_licenses.items():
        cur.execute("SELECT id, enabled FROM licenses WHERE module_key=?", (mod,))
        existing = cur.fetchone()
        if existing:
            cur.execute("UPDATE licenses SET enabled=?, plan=? WHERE id=?", 
                        (1 if data['enabled'] else 0, data['plan'], existing[0]))
            print(f"Updated tenant license '{mod}': enabled={data['enabled']}")
        else:
            # Generate a 15-char random id for pocketbase record
            import random, string
            rec_id = ''.join(random.choices(string.ascii_lowercase + string.digits, k=15))
            cur.execute("INSERT INTO licenses (id, module_key, enabled, plan) VALUES (?, ?, ?, ?)",
                        (rec_id, mod, 1 if data['enabled'] else 0, data['plan']))
            print(f"Inserted tenant license '{mod}': enabled={data['enabled']}")

    con.commit()
    con.close()
    print("Tenant licenses synchronized successfully.")

if __name__ == '__main__':
    patch_tenant_licenses_schema()
