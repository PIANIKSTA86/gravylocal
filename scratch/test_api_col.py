import urllib.request
import json

def update_collection_via_api(port):
    url = f"http://127.0.0.1:{port}/api/admins/auth-with-password"
    # Or superuser auth
    print(f"Checking port {port}...")

update_collection_via_api(8094)
