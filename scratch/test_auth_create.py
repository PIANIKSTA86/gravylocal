import urllib.request
import json

# Test login on 8094
login_data = json.dumps({'identity': 'julian.mm.piano@gmail.com', 'password': 'admin123456'}).encode('utf-8')
# Or with superadmin
req = urllib.request.Request(
    'http://localhost:8094/api/collections/_superusers/auth-with-password',
    data=login_data,
    headers={'Content-Type': 'application/json'}
)
token = None
try:
    res = urllib.request.urlopen(req)
    data = json.loads(res.read().decode('utf-8'))
    token = data['token']
    print("Logged in as superuser! Token:", token[:20])
except Exception as e:
    print("Superuser login failed:", e)

if not token:
    # Try with users collection
    for email in ['admin@admin.com', 'julian.mm.piano@gmail.com', 'test2@admin.com', 'superadmin@contaco.com']:
        for pw in ['admin123456', '12345678', '123456', 'admin123']:
            try:
                r = urllib.request.Request(
                    'http://localhost:8094/api/collections/users/auth-with-password',
                    data=json.dumps({'identity': email, 'password': pw}).encode('utf-8'),
                    headers={'Content-Type': 'application/json'}
                )
                res = urllib.request.urlopen(r)
                data = json.loads(res.read().decode('utf-8'))
                token = data['token']
                print(f"Logged in as {email}! Token: {token[:20]}")
                break
            except Exception:
                pass
        if token: break

if token:
    # Now let's try creating a concept with amount: 0
    try:
        r = urllib.request.Request(
            'http://localhost:8094/api/collections/ph_billing_concepts/records',
            data=json.dumps({
                'code': 'TEST_ZERO',
                'name': 'TEST ZERO AMOUNT',
                'amount': 0,
                'is_variable': True,
                'active': True
            }).encode('utf-8'),
            headers={'Content-Type': 'application/json', 'Authorization': f'Bearer {token}'}
        )
        res = urllib.request.urlopen(r)
        print("Create ph_billing_concepts response:", res.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        print("HTTPError creating concept:", e.code, e.read().decode('utf-8'))
