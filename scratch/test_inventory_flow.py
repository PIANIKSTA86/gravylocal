import urllib.request
import json

req = urllib.request.Request(
    'http://127.0.0.1:8090/api/collections/_superusers/auth-with-password',
    data=b'{"identity":"test2@admin.com","password":"test123456"}',
    headers={'Content-Type':'application/json'}
)
token = json.loads(urllib.request.urlopen(req).read().decode('utf-8'))['token']

inv_req = urllib.request.Request(
    'http://127.0.0.1:8090/api/gravy/spa-beauty/inventory-products',
    headers={'Authorization': token}
)
try:
    with urllib.request.urlopen(inv_req) as resp:
        print('Status:', resp.status)
        raw = resp.read().decode('utf-8')
        print('Length:', len(raw))
        print('Body:', raw[:300])
except urllib.error.HTTPError as e:
    print('HTTPError:', e.code)
    print('Body:', e.read().decode('utf-8'))
