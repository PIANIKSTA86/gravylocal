import sqlite3
import urllib.request
import json
import secrets
import os

def test_tenant_db():
    # Check all data.db files in the project
    db_paths = [
        ('Root DB', 'pb_data/data.db'),
        ('Empresa 8091 DB', 'empresas/empresa_8091/pb_data/data.db'),
        ('Empresa 8092 DB', 'empresas/empresa_8092/pb_data/data.db'),
        ('HUB DB', 'hub/pb_data/data.db'),
    ]

    for label, path in db_paths:
        if os.path.exists(path):
            conn = sqlite3.connect(path)
            cursor = conn.cursor()
            try:
                cursor.execute("SELECT count(*) FROM ph_properties")
                props_count = cursor.fetchone()[0]
            except Exception:
                props_count = 'N/A'
            try:
                cursor.execute("SELECT count(*) FROM ph_invoices")
                invs_count = cursor.fetchone()[0]
            except Exception:
                invs_count = 'N/A'
            print(f"{label} ({path}): Properties={props_count}, Invoices={invs_count}")
            conn.close()
        else:
            print(f"{label} ({path}): FILE NOT FOUND")

if __name__ == '__main__':
    test_tenant_db()
