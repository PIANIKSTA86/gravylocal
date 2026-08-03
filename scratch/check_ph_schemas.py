import sqlite3
import json
import glob

def check_db(db_path):
    print(f"\n=== DB: {db_path} ===")
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        cursor.execute("SELECT name, createRule, updateRule, listRule, viewRule, fields FROM _collections WHERE name IN ('ph_individual_charges', 'ph_invoices', 'ph_invoice_lines', 'ph_properties')")
        cols = cursor.fetchall()
        for name, cR, uR, lR, vR, fields_json in cols:
            print(f"\nCollection: {name}")
            print(f"  Rules -> create: {cR}")
            print(f"           update: {uR}")
            print(f"           list:   {lR}")
            print(f"           view:   {vR}")
            fields = json.loads(fields_json)
            for f in fields:
                req = f.get('required')
                mSel = f.get('maxSelect')
                patt = f.get('pattern')
                print(f"    Field: {f.get('name'):<20} | Type: {f.get('type'):<10} | Req: {str(req):<5} | MaxSel: {str(mSel):<5} | Pattern: {patt}")
        conn.close()
    except Exception as e:
        print(f"Error checking {db_path}: {e}")

check_db('pb_data/data.db')
for f in glob.glob('empresas/*/pb_data/data.db'):
    check_db(f)
