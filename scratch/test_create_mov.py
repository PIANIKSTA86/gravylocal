import urllib.request, json

# 1. Login
auth_req = urllib.request.Request(
    "http://127.0.0.1:8090/api/collections/users/auth-with-password",
    data=json.dumps({"identity": "admin@contaco.com", "password": "password"}).encode(),
    headers={"Content-Type": "application/json"}
)
# We don't know the exact password, let's check if there are test passwords or auth via token or SQLite
