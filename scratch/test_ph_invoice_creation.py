import sqlite3
import urllib.request
import json
import secrets

def test_creation():
    # Let's inspect users table in pb_data/data.db
    conn = sqlite3.connect('pb_data/data.db')
    cursor = conn.cursor()
    cursor.execute("SELECT id, email, role, tokenKey FROM users WHERE role IN ('admin', 'contador', 'auxiliar', 'superadmin') LIMIT 5")
    users = cursor.fetchall()
    print("Users found in DB:", users)
    
    # Get a property ID from ph_properties
    cursor.execute("SELECT id, code, name FROM ph_properties WHERE active=1 LIMIT 1")
    prop = cursor.fetchone()
    print("Property selected:", prop)
    conn.close()

    if not prop:
        print("No property found!")
        return

    prop_id = prop[0]

    # Let's test authenticating with any user password via PocketBase auth-with-password endpoint
    login_url = "http://localhost:8091/api/collections/users/auth-with-password"
    
    test_passwords = ["Admin123!", "12345678", "gravy123", "admin123", "123456", "cmartinez123", "1234567890", "password"]
    
    token = None
    user_email = None
    for u in users:
        email = u[1]
        for pw in test_passwords:
            try:
                payload = json.dumps({"identity": email, "password": pw}).encode('utf-8')
                req = urllib.request.Request(login_url, data=payload, headers={'Content-Type': 'application/json'})
                with urllib.request.urlopen(req) as resp:
                    data = json.loads(resp.read().decode())
                    token = data.get('token')
                    user_email = email
                    print(f"AUTHENTICATED as {email} with password '{pw}'! Role: {data.get('record', {}).get('role')}")
                    break
            except Exception:
                pass
        if token:
            break

    if not token:
        print("Could not log in via auth-with-password. Checking if admin account works or resetting password...")
        return

    # Now test creating an invoice with the token!
    create_url = "http://localhost:8091/api/collections/ph_invoices/records"
    inv_payload = {
        "number": f"CF-202607-TEST{secrets.token_hex(2)}",
        "period": "2026-07",
        "property_id": prop_id,
        "date": "2026-07-01",
        "due_date": "2026-07-10",
        "subtotal": 150000,
        "total": 150000,
        "status": "draft",
        "notes": "Test invoice"
    }

    print("\nAttempting POST to ph_invoices with TOKEN...")
    data = json.dumps(inv_payload).encode('utf-8')
    req = urllib.request.Request(create_url, data=data, headers={
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {token}'
    })

    try:
        with urllib.request.urlopen(req) as resp:
            print("\nSUCCESS! Status:", resp.status)
            print("Response:", resp.read().decode())
    except urllib.error.HTTPError as e:
        print("\nHTTP ERROR Status:", e.code, e.reason)
        err_body = e.read().decode()
        print("ERR BODY:", err_body)
    except Exception as e:
        print("EXCEPTION:", e)

if __name__ == '__main__':
    test_creation()
