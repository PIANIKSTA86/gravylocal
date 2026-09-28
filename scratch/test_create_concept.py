import urllib.request
import json

# Try to create a dummy concept with amount: 0
req = urllib.request.Request(
    'http://localhost:8094/api/collections/ph_billing_concepts/records',
    data=json.dumps({
        'code': 'TEST',
        'name': 'TEST',
        'amount': 0,
        'active': True
    }).encode('utf-8'),
    headers={'Content-Type': 'application/json'}
)

try:
    res = urllib.request.urlopen(req)
    print("Response:", res.read().decode('utf-8'))
except urllib.error.HTTPError as e:
    print("HTTPError:", e.code, e.read().decode('utf-8'))
except Exception as e:
    print("Error:", e)
