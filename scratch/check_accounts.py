import urllib.request
import urllib.parse
import json

def run():
    # 1. Login to superuser
    login_url = "http://127.0.0.1:8090/api/collections/_superusers/auth-with-password"
    
    # Try different admin accounts
    admins = [
        ("admin@admin.com", "admin"),
        ("admin@gravy.com", "admin12345")
    ]
    
    token = None
    for email, password in admins:
        try:
            data = json.dumps({"identity": email, "password": password}).encode('utf-8')
            req = urllib.request.Request(
                login_url, 
                data=data, 
                headers={'Content-Type': 'application/json'}
            )
            with urllib.request.urlopen(req) as res:
                body = json.loads(res.read().decode('utf-8'))
                token = body['token']
                print(f"Authenticated successfully as {email}!")
                break
        except Exception as e:
            print(f"Failed to authenticate as {email}: {e}")
            
    if not token:
        print("Could not authenticate as admin.")
        return

    headers = {
        'Authorization': token,
        'Content-Type': 'application/json'
    }

    # 2. Get accounts starting with 1105
    try:
        url = "http://127.0.0.1:8090/api/collections/accounts/records?filter=" + urllib.parse.quote('code ~ "1105"')
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req) as res:
            body = json.loads(res.read().decode('utf-8'))
            print("\nFound accounts starting with 1105:")
            for a in body.get('items', []):
                print(f"ID: {a['id']} | Code: {a['code']} | Name: {a['name']}")
    except Exception as e:
        print("Error getting accounts:", e)

    # 3. Get treasury settings
    try:
        url = "http://127.0.0.1:8090/api/collections/treasury_settings/records"
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req) as res:
            body = json.loads(res.read().decode('utf-8'))
            print("\nTreasury Settings:")
            print(json.dumps(body.get('items', []), indent=2))
    except Exception as e:
        print("Error getting treasury settings:", e)

    # 4. Get last shifts
    try:
        url = "http://127.0.0.1:8090/api/collections/pos_shifts/records?sort=-created&perPage=5"
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req) as res:
            body = json.loads(res.read().decode('utf-8'))
            print("\nLast POS Shifts:")
            for s in body.get('items', []):
                print(f"ID: {s['id']} | Opened: {s['opened_at']} | Closed: {s['closed_at']} | Expected: {s['cash_expected']} | Recs: {s['cash_recaudos']} | Egrs: {s['cash_egresos']}")
    except Exception as e:
        print("Error getting shifts:", e)

    # 5. Get last transactions
    try:
        url = "http://127.0.0.1:8090/api/collections/transactions/records?sort=-created&perPage=5&expand=tx_type_id"
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req) as res:
            body = json.loads(res.read().decode('utf-8'))
            print("\nLast Transactions:")
            for t in body.get('items', []):
                print(f"ID: {t['id']} | Num: {t['number']} | Type: {t.get('expand', {}).get('tx_type_id', {}).get('code')} | Shift: {t.get('pos_shift_id')} | Status: {t['status']}")
                # Get lines
                lines_url = "http://127.0.0.1:8090/api/collections/tx_lines/records?filter=" + urllib.parse.quote(f'tx_id = "{t["id"]}"') + "&expand=account_id"
                lines_req = urllib.request.Request(lines_url, headers=headers)
                with urllib.request.urlopen(lines_req) as lines_res:
                    lines_body = json.loads(lines_res.read().decode('utf-8'))
                    for l in lines_body.get('items', []):
                        print(f"  - Line ID: {l['id']} | Acc ID: {l['account_id']} | Acc Code: {l.get('expand', {}).get('account_id', {}).get('code')} | Debit: {l['debit']} | Credit: {l['credit']}")
    except Exception as e:
        print("Error getting transactions:", e)

if __name__ == "__main__":
    run()
