import urllib.request
import json

req = urllib.request.Request(
    'http://127.0.0.1:8090/api/collections/_superusers/auth-with-password',
    data=b'{"identity":"test2@admin.com","password":"test123456"}',
    headers={'Content-Type':'application/json'}
)
token = json.loads(urllib.request.urlopen(req).read().decode('utf-8'))['token']

admin_req = urllib.request.Request(
    'http://127.0.0.1:8090/api/gravy/spa-beauty/settings',
    headers={'Authorization': token}
)
admin_data = json.loads(urllib.request.urlopen(admin_req).read().decode('utf-8'))
cfg = admin_data['config']
for s in admin_data['all_services']:
    if s['id'] not in cfg.get('services', {}):
        cfg.setdefault('services', {})[s['id']] = {
            'published': True,
            'duration': 60,
            'badge': s.get('category') or 'Estética',
            'description_override': s.get('description') or ''
        }
    else:
        cfg['services'][s['id']]['published'] = True

post_req = urllib.request.Request(
    'http://127.0.0.1:8090/api/gravy/spa-beauty/settings',
    data=json.dumps({'config': cfg}).encode('utf-8'),
    headers={'Content-Type': 'application/json', 'Authorization': token}
)
print('Save:', json.loads(urllib.request.urlopen(post_req).read().decode('utf-8')))

pub_svcs = json.loads(urllib.request.urlopen('http://127.0.0.1:8090/api/public/spa/services').read().decode('utf-8'))
print(f'Total online now: {len(pub_svcs)}')
for ps in pub_svcs:
    print(f" - [{ps['code']}] {ps['name']} (${ps['total']}) - {ps['duration']} min - Badge: {ps['category']}")
