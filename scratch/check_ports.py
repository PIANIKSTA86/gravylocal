import urllib.request
import json

for port in [8090, 8091, 8092, 8093, 8094]:
    try:
        url = f'http://127.0.0.1:{port}/api/collections/ph_invoices/records?perPage=5&filter=(period=%272026-09%27)'
        req = urllib.request.urlopen(url)
        data = json.loads(req.read().decode())
        total = data.get('totalItems')
        print(f"Port {port}: totalItems = {total}")
        for item in data.get('items', []):
            print(f"   {item.get('number')} - {item.get('status')}")
    except Exception as e:
        print(f"Port {port}: {e}")
