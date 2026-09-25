import urllib.request
import json

req = urllib.request.Request(
    'http://127.0.0.1:8090/api/collections/_superusers/auth-with-password',
    data=b'{"identity":"test2@admin.com","password":"test123456"}',
    headers={'Content-Type':'application/json'}
)
token = json.loads(urllib.request.urlopen(req).read().decode('utf-8'))['token']

# Query products collection directly via standard PB API
prods_req = urllib.request.Request(
    'http://127.0.0.1:8090/api/collections/products/records?filter=active%3Dtrue&perPage=10',
    headers={'Authorization': token}
)
resp = json.loads(urllib.request.urlopen(prods_req).read().decode('utf-8'))
print(f"Total items in collection: {resp.get('totalItems')}")
for p in resp.get('items', []):
    print(f" - [{p.get('code')}] {p.get('name')} (${p.get('base_price')}) Type: {p.get('type')}")
