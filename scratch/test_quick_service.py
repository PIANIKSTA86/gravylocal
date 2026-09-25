import urllib.request
import json

req = urllib.request.Request(
    'http://127.0.0.1:8090/api/collections/_superusers/auth-with-password',
    data=b'{"identity":"test2@admin.com","password":"test123456"}',
    headers={'Content-Type':'application/json'}
)
with urllib.request.urlopen(req) as resp:
    token = json.loads(resp.read().decode('utf-8'))['token']

# Create a new quick aesthetic service
new_svc_payload = {
    "name": "Tratamiento Facial Anti-Edad con Colágeno Marino",
    "category": "Facial",
    "base_price": 120000,
    "iva_rate": 19,
    "duration": 75,
    "published": True,
    "description": "Terapia regenerativa y reafirmante para combatir líneas de expresión y revitalizar la textura de la piel."
}

post_req = urllib.request.Request(
    'http://127.0.0.1:8090/api/gravy/spa-beauty/quick-service',
    data=json.dumps(new_svc_payload).encode('utf-8'),
    headers={'Content-Type': 'application/json', 'Authorization': token}
)

with urllib.request.urlopen(post_req) as resp:
    res = json.loads(resp.read().decode('utf-8'))
    print("Quick Service creation response:")
    print(json.dumps(res, indent=2))

# Verify it now appears immediately in public services
pub_req = urllib.request.Request('http://127.0.0.1:8090/api/public/spa/services')
with urllib.request.urlopen(pub_req) as resp:
    pub_svcs = json.loads(resp.read().decode('utf-8'))
    print(f"\nTotal online services now: {len(pub_svcs)}")
    for s in pub_svcs:
        print(f" - [{s.get('code')}] {s.get('name')}: ${s.get('total')} ({s.get('duration')} min) - Badge: {s.get('category')}")
