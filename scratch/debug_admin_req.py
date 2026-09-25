import urllib.request
import urllib.error
import json

req = urllib.request.Request(
    'http://127.0.0.1:8090/api/collections/_superusers/auth-with-password',
    data=b'{"identity":"test2@admin.com","password":"test123456"}',
    headers={'Content-Type':'application/json'}
)
with urllib.request.urlopen(req) as resp:
    token = json.loads(resp.read().decode('utf-8'))['token']
    print("Token obtained")

req2 = urllib.request.Request(
    'http://127.0.0.1:8090/api/gravy/spa-beauty/settings',
    headers={'Authorization': token}
)
try:
    with urllib.request.urlopen(req2) as resp2:
        print('Status:', resp2.status)
        raw = resp2.read().decode('utf-8')
        print('Length:', len(raw))
        print('Body:', raw[:300])
except urllib.error.HTTPError as e:
    print('HTTPError:', e.code)
    print('Err body:', e.read().decode('utf-8'))
