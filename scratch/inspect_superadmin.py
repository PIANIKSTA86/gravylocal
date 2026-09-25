import sqlite3
import json

def inspect_hub():
    print("=== HUB DB ===")
    con = sqlite3.connect('hub/pb_data/data.db')
    cur = con.cursor()
    tables = [r[0] for r in cur.execute("SELECT name FROM sqlite_master WHERE type='table'")]
    print("Tables in HUB:", tables)
    
    if 'hub_users' in tables:
        print("\nhub_users:")
        for r in cur.execute("SELECT id, email, is_superadmin FROM hub_users"):
            print(" ", r)
            
    if 'companies' in tables:
        print("\ncompanies:")
        for r in cur.execute("SELECT id, name, url, active FROM companies"):
            print(" ", r)
            
    if 'licenses' in tables:
        print("\nlicenses in HUB:")
        for r in cur.execute("SELECT id, company_id, module_key, enabled, plan FROM licenses"):
            print(" ", r)

def inspect_tenant():
    print("\n=== TENANT DB ===")
    con = sqlite3.connect('pb_data/data.db')
    cur = con.cursor()
    tables = [r[0] for r in cur.execute("SELECT name FROM sqlite_master WHERE type='table'")]
    print("Tables in Tenant:", tables)
    
    if 'licenses' in tables:
        print("\nlicenses in Tenant:")
        for r in cur.execute("SELECT id, module_key, enabled, plan FROM licenses"):
            print(" ", r)
            
    if 'users' in tables:
        print("\nusers in Tenant:")
        for r in cur.execute("SELECT id, email, role FROM users"):
            print(" ", r)

if __name__ == '__main__':
    inspect_hub()
    inspect_tenant()
