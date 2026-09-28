import urllib.request, json

req = urllib.request.Request("http://127.0.0.1:8090/api/health")
try:
    with urllib.request.urlopen(req) as resp:
        print("Health:", resp.status, resp.read().decode())
except Exception as e:
    print("Health error:", e)
