import sqlite3
import urllib.request
import json
import secrets

def test_exact_ph():
    # 1. Update user password for cmartinez@gravy.com or admin@contaco.com directly in DB to a known password if needed, or inspect password format.
    # PocketBase uses bcrypt for passwordHash.
    # Let's check if we can generate a valid admin auth token using PocketBase admin or user auth.
    conn = sqlite3.connect('pb_data/data.db')
    cursor = conn.cursor()
    cursor.execute("SELECT id, email, role FROM users")
    users = cursor.fetchall()
    print("Users in DB:", users)
    
    # Check ph_properties in DB
    cursor.execute("SELECT id, code, name FROM ph_properties WHERE active=1")
    props = cursor.fetchall()
    print("Active properties in DB:", len(props), props[:3])
    conn.close()

    if not props:
        print("NO ACTIVE PROPERTIES FOUND!")
        return

    prop_id = props[0][0]

    # Let's test calling POST /api/collections/ph_invoices/records with different field combinations
    url = "http://localhost:8090/api/collections/ph_invoices/records"
    
    # Try different tokens or requests
    payload = {
        "number": f"CF-202607-DIAG{secrets.token_hex(2)}",
        "period": "2026-07",
        "property_id": prop_id,
        "date": "2026-07-01",
        "due_date": "2026-07-10",
        "subtotal": 100000,
        "total": 100000,
        "status": "draft",
        "notes": ""
    }

    print("\nSending payload to PocketBase:", json.dumps(payload, indent=2))

    data = json.dumps(payload).encode('utf-8')
    req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'})

    try:
        with urllib.request.urlopen(req) as resp:
            print("\nSUCCESS! Status:", resp.status)
            print("Response:", resp.read().decode())
    except urllib.error.HTTPError as e:
        print("\nHTTP ERROR STATUS:", e.code, e.reason)
        err_body = e.read().decode()
        print("ERR BODY:", err_body)
    except Exception as e:
        print("EXCEPTION:", e)

if __name__ == '__main__':
    test_exact_ph()
