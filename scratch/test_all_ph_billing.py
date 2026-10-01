import urllib.request, json, time, subprocess

# Restart PB 8094
try:
    netstat_out = subprocess.check_output("netstat -ano | findstr :8094", shell=True, text=True)
    for line in netstat_out.strip().split("\n"):
        parts = line.strip().split()
        if len(parts) >= 5 and "LISTENING" in line:
            pid = parts[-1]
            subprocess.run(["taskkill", "/F", "/PID", pid], capture_output=True)
    time.sleep(1)
except Exception:
    pass

exe = r"C:\Users\JULIAN\Desktop\GravyLocalTABS\pocketbase.exe"
args = [
    exe, "serve", "--http=0.0.0.0:8094",
    r"--dir=C:\Users\JULIAN\Desktop\GravyLocalTABS\empresas\empresa_8094\pb_data",
    r"--hooksDir=C:\Users\JULIAN\Desktop\GravyLocalTABS\empresas\empresa_8094\pb_hooks",
    r"--publicDir=C:\Users\JULIAN\Desktop\GravyLocalTABS\pb_public",
    r"--migrationsDir=C:\Users\JULIAN\Desktop\GravyLocalTABS\pb_migrations"
]

proc = subprocess.Popen(args, cwd=r"C:\Users\JULIAN\Desktop\GravyLocalTABS\empresas\empresa_8094")
print(f"Launched PB 8094 with PID {proc.pid}")
time.sleep(2)

# Wait for PB to be UP
for _ in range(15):
    try:
        urllib.request.urlopen("http://localhost:8094/api/health", timeout=1)
        print("PB is UP!")
        break
    except Exception:
        time.sleep(0.5)

# Authenticate as superuser
url_auth = 'http://localhost:8094/api/collections/_superusers/auth-with-password'
data_auth = json.dumps({'identity': 'test2@admin.com', 'password': 'test123456'}).encode('utf-8')
req = urllib.request.Request(url_auth, data=data_auth, headers={'Content-Type': 'application/json'})
res = urllib.request.urlopen(req)
token = json.loads(res.read().decode())['token']
headers = {'Content-Type': 'application/json', 'Authorization': token}

def call_api(endpoint, payload):
    url = f"http://localhost:8094{endpoint}"
    req = urllib.request.Request(url, data=json.dumps(payload).encode('utf-8'), headers=headers)
    try:
        r = urllib.request.urlopen(req)
        data = json.loads(r.read().decode())
        print(f"[OK {r.status}] {endpoint} -> {data.get('message', data)}")
        return data
    except urllib.error.HTTPError as e:
        print(f"[ERROR {e.code}] {endpoint} -> {e.read().decode()}")
        return None

# Clean up any leftover 2026-09 or 2026-10
call_api('/api/ph/delete-period', {'period': '2026-09'})
call_api('/api/ph/delete-period', {'period': '2026-10'})

print("\n--- 1. Testing GENERATE 2026-10 ---")
gen_res = call_api('/api/ph/generate-period', {'period': '2026-10', 'dueDate': '2026-11-10'})

print("\n--- 2. Testing POST 2026-10 ---")
post_res = call_api('/api/ph/post-period', {'period': '2026-10'})

print("\n--- 3. Testing UNPOST 2026-10 ---")
unpost_res = call_api('/api/ph/unpost-period', {'period': '2026-10'})

print("\n--- 4. Testing DELETE 2026-10 ---")
del_res = call_api('/api/ph/delete-period', {'period': '2026-10'})

print("\nAll lifecycle tests complete!")
