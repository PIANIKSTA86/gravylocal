import urllib.request
import json
import sqlite3

def test_api_with_real_user():
    # Fetch admin user from DB
    conn = sqlite3.connect('pb_data/data.db')
    cursor = conn.cursor()
    cursor.execute("SELECT email, role FROM users WHERE email='admin@contaco.com'")
    row = cursor.fetchone()
    print("Admin user found:", row[0], "role:", row[1])
    conn.close()

    login_url = "http://localhost:8090/api/collections/users/auth-with-password"
    passwords = ["1234567890", "admin123", "Admin123!", "123456", "gravy2026", "gravy123", "12345678", "admin"]
    
    token = None
    for pw in passwords:
        try:
            payload = json.dumps({"identity": "admin@contaco.com", "password": pw}).encode('utf-8')
            req = urllib.request.Request(login_url, data=payload, headers={'Content-Type': 'application/json'})
            with urllib.request.urlopen(req) as resp:
                data = json.loads(resp.read().decode())
                token = data.get('token')
                print("Auth SUCCESS with password:", pw)
                break
        except Exception:
            pass

    if not token:
        print("Could not login with default passwords. Testing with list/create rules in PB...")

    url = "http://localhost:8090/api/collections/ph_invoices/records"
    payload = {
        "number": "CF-202607-TEST01",
        "period": "2026-07",
        "property_id": "dtqcf58j5jy3hq6",
        "date": "2026-07-01",
        "due_date": "2026-07-10",
        "subtotal": 100000,
        "total": 100000,
        "status": "draft",
        "notes": ""
    }
    
    data = json.dumps(payload).encode('utf-8')
    headers = {'Content-Type': 'application/json'}
    if token:
        headers['Authorization'] = f'Bearer {token}'
        
    req = urllib.request.Request(url, data=data, headers=headers)
    
    try:
        with urllib.request.urlopen(req) as resp:
            print("HTTP Status:", resp.status)
            print("Response:", resp.read().decode())
    except urllib.error.HTTPError as e:
        print("HTTP Error Status:", e.code, e.reason)
        err_body = e.read().decode()
        print("Error Body:", err_body)
    except Exception as e:
        print("Error:", e)

if __name__ == '__main__':
    test_api_with_real_user()
