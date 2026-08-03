import urllib.request
import urllib.parse
import json

def run_test():
    # 1. Login to HUB
    hub_login_url = "http://127.0.0.1:8089/api/collections/hub_users/auth-with-password"
    payload = {
        "identity": "admin@contaco.com",
        "password": "Admin1234!"
    }
    
    print("1. Logging into HUB...")
    req = urllib.request.Request(
        hub_login_url,
        data=json.dumps(payload).encode('utf-8'),
        headers={'Content-Type': 'application/json'}
    )
    
    try:
        with urllib.request.urlopen(req) as response:
            res_data = json.loads(response.read().decode('utf-8'))
            hub_token = res_data.get("token")
            print("   Success!")
    except Exception as e:
        print(f"   Error: {e}")
        return

    # 2. Call Tenant 8091 auth-via-hub
    tenant_url = "http://127.0.0.1:8091/api/tenant/auth-via-hub"
    sso_payload = {
        "hub_token": hub_token
    }
    print("\n2. Calling Tenant 8091 SSO endpoint...")
    req_sso = urllib.request.Request(
        tenant_url,
        data=json.dumps(sso_payload).encode('utf-8'),
        headers={'Content-Type': 'application/json'}
    )
    
    try:
        with urllib.request.urlopen(req_sso) as response:
            res_data = json.loads(response.read().decode('utf-8'))
            print("   Success! Local token obtained:")
            print(json.dumps(res_data, indent=2))
    except Exception as e:
        print(f"   Error: {e}")
        if hasattr(e, 'read'):
            print(e.read().decode('utf-8'))

if __name__ == "__main__":
    run_test()
