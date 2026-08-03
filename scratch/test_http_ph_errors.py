import urllib.request
import json
import sqlite3

def test_api_errors():
    # Find running port or try 8090 / 8091 / 8092
    ports = [8090, 8091, 8092]
    
    # Get user token
    conn = sqlite3.connect('pb_data/data.db')
    cursor = conn.cursor()
    cursor.execute("SELECT email FROM users WHERE role IN ('admin', 'contador', 'auxiliar', 'superadmin') LIMIT 1")
    user = cursor.fetchone()
    conn.close()
    
    if not user:
        print("No user found")
        return
    email = user[0]
    
    for port in ports:
        print(f"\n--- Testing Port {port} ---")
        login_url = f"http://localhost:{port}/api/collections/users/auth-with-password"
        token = None
        for pw in ["Admin123!", "12345678", "gravy123", "admin123", "123456"]:
            try:
                data = json.dumps({"identity": email, "password": pw}).encode('utf-8')
                req = urllib.request.Request(login_url, data=data, headers={'Content-Type': 'application/json'})
                with urllib.request.urlopen(req) as resp:
                    res_json = json.loads(resp.read().decode())
                    token = res_json.get('token')
                    print(f"Logged in on port {port} as {email} with role {res_json.get('record',{}).get('role')}")
                    break
            except Exception:
                pass
        
        if not token:
            print(f"Could not authenticate on port {port}")
            continue

        # Test 1: ph_individual_charges POST with typical payload
        url_ic = f"http://localhost:{port}/api/collections/ph_individual_charges/records"
        test_payloads_ic = [
            # Payload from copropiedades.ts line 2958:
            {
                "code": "TEST1",
                "name": "Concepto Test 1",
                "description": "Desc Test",
                "amount": 50000,
                "active": True,
                "account_code": "413505",
                "period": "2026-07",
                "notes": "ACC:413505",
                "property_id": None
            },
            {
                "code": "TEST2",
                "name": "Concepto Test 2",
                "description": "Desc Test",
                "amount": 50000,
                "active": True,
                "account_code": "413505",
                "period": "2026-07",
                "notes": "ACC:413505",
                "property_id": ""
            },
            {
                "code": "TEST3",
                "name": "Concepto Test 3",
                "description": "Desc Test",
                "amount": 50000,
                "active": True,
                "account_code": "413505",
                "period": "2026-07",
                "notes": "ACC:413505"
            }
        ]
        
        for idx, payload in enumerate(test_payloads_ic):
            print(f"\n[Port {port}] Testing ph_individual_charges payload {idx+1}: {payload}")
            req = urllib.request.Request(url_ic, data=json.dumps(payload).encode(), headers={
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {token}'
            })
            try:
                with urllib.request.urlopen(req) as resp:
                    print("  SUCCESS:", resp.read().decode())
            except urllib.error.HTTPError as e:
                print(f"  HTTP ERROR {e.code}: {e.read().decode()}")
            except Exception as e:
                print(f"  ERR: {e}")

        # Test 2: ph_invoices POST with typical payload
        url_inv = f"http://localhost:{port}/api/collections/ph_invoices/records"
        # Get property ID
        conn_p = sqlite3.connect('pb_data/data.db')
        cur_p = conn_p.cursor()
        cur_p.execute("SELECT id FROM ph_properties LIMIT 1")
        p_row = cur_p.fetchone()
        conn_p.close()
        prop_id = p_row[0] if p_row else "nonexistent12345"

        test_payloads_inv = [
            {
                "number": "CF-202607-000001",
                "period": "2026-07",
                "property_id": prop_id,
                "date": "2026-07-01",
                "due_date": "2026-07-10",
                "subtotal": 100000,
                "total": 100000,
                "status": "draft",
                "notes": ""
            }
        ]
        for idx, payload in enumerate(test_payloads_inv):
            print(f"\n[Port {port}] Testing ph_invoices payload {idx+1}: {payload}")
            req = urllib.request.Request(url_inv, data=json.dumps(payload).encode(), headers={
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {token}'
            })
            try:
                with urllib.request.urlopen(req) as resp:
                    print("  SUCCESS:", resp.read().decode())
            except urllib.error.HTTPError as e:
                print(f"  HTTP ERROR {e.code}: {e.read().decode()}")
            except Exception as e:
                print(f"  ERR: {e}")

if __name__ == '__main__':
    test_api_errors()
