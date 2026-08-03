import urllib.request
import json
import sqlite3

def test_quick():
    conn = sqlite3.connect('pb_data/data.db')
    cursor = conn.cursor()
    cursor.execute("SELECT email FROM users WHERE role IN ('admin', 'contador', 'auxiliar', 'superadmin') LIMIT 1")
    user = cursor.fetchone()
    conn.close()
    
    if not user:
        print("No user found")
        return
    email = user[0]
    
    for port in [8090, 8091, 8092]:
        print(f"\n--- Checking Port {port} ---")
        login_url = f"http://localhost:{port}/api/collections/users/auth-with-password"
        token = None
        for pw in ["Admin123!", "12345678", "gravy123", "admin123", "123456"]:
            try:
                data = json.dumps({"identity": email, "password": pw}).encode('utf-8')
                req = urllib.request.Request(login_url, data=data, headers={'Content-Type': 'application/json'})
                with urllib.request.urlopen(req, timeout=2) as resp:
                    res_json = json.loads(resp.read().decode())
                    token = res_json.get('token')
                    print(f"Logged in on port {port} as {email} with role {res_json.get('record',{}).get('role')}")
                    break
            except Exception as e:
                pass
        
        if not token:
            print(f"Port {port} not responsive or credentials fail.")
            continue

        # Check ph_individual_charges
        url_ic = f"http://localhost:{port}/api/collections/ph_individual_charges/records"
        payloads_ic = [
            {"code": "TEST1", "name": "Concepto Test 1", "property_id": None},
            {"code": "TEST2", "name": "Concepto Test 2", "property_id": ""},
            {"code": "TEST3", "name": "Concepto Test 3"},
        ]
        for p in payloads_ic:
            print(f"Testing IC payload: {p}")
            req = urllib.request.Request(url_ic, data=json.dumps(p).encode(), headers={
                'Content-Type': 'application/json', 'Authorization': f'Bearer {token}'
            })
            try:
                with urllib.request.urlopen(req, timeout=3) as resp:
                    print("  SUCCESS:", resp.read().decode())
            except urllib.error.HTTPError as e:
                print(f"  HTTP ERROR {e.code}: {e.read().decode()}")
            except Exception as e:
                print(f"  ERR: {e}")

        # Check ph_invoices
        url_inv = f"http://localhost:{port}/api/collections/ph_invoices/records"
        conn_p = sqlite3.connect('pb_data/data.db')
        cur_p = conn_p.cursor()
        cur_p.execute("SELECT id FROM ph_properties LIMIT 1")
        p_row = cur_p.fetchone()
        conn_p.close()
        prop_id = p_row[0] if p_row else ""

        payloads_inv = [
            {
                "number": "CF-202607-TEST99",
                "period": "2026-07",
                "property_id": prop_id,
                "date": "2026-07-01",
                "due_date": "2026-07-10",
                "subtotal": 100000,
                "total": 100000,
                "status": "draft",
                "notes": ""
            },
            {
                "number": "",
                "period": "2026-07",
                "property_id": prop_id,
                "date": "2026-07-01"
            }
        ]
        for p in payloads_inv:
            print(f"Testing INV payload: {p}")
            req = urllib.request.Request(url_inv, data=json.dumps(p).encode(), headers={
                'Content-Type': 'application/json', 'Authorization': f'Bearer {token}'
            })
            try:
                with urllib.request.urlopen(req, timeout=3) as resp:
                    print("  SUCCESS:", resp.read().decode())
            except urllib.error.HTTPError as e:
                print(f"  HTTP ERROR {e.code}: {e.read().decode()}")
            except Exception as e:
                print(f"  ERR: {e}")

if __name__ == '__main__':
    test_quick()
