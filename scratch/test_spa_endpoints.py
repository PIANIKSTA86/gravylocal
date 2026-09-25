import urllib.request
import json

def get(url):
    req = urllib.request.Request(url)
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode('utf-8'))

print("=== CONFIG ===")
cfg = get("http://127.0.0.1:8090/api/public/spa/config")
print(json.dumps(cfg, indent=2))

print("\n=== SERVICES ===")
svcs = get("http://127.0.0.1:8090/api/public/spa/services")
print(f"Total services online: {len(svcs)}")
for s in svcs[:5]:
    print(f" - [{s.get('code')}] {s.get('name')}: ${s.get('total')} ({s.get('duration')} min) - Badge: {s.get('category')}")

print("\n=== SPECIALISTS ===")
specs = get("http://127.0.0.1:8090/api/public/spa/specialists")
print(f"Total specialists: {len(specs)}")
for sp in specs[:3]:
    print(f" - {sp.get('name')}")

print("\n=== AVAILABILITY ===")
avail = get("http://127.0.0.1:8090/api/public/spa/availability?date=2026-09-25&duration=60")
print(f"Date: {avail.get('date')}, Total slots: {len(avail.get('slots', []))}")
if avail.get('slots'):
    print("First 3 slots:", avail.get('slots')[:3])
