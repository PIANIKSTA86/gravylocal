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
            print(f"   Success! HUB token: {hub_token[:20]}...")
    except Exception as e:
        print(f"   Error logging into HUB: {e}")
        if hasattr(e, 'read'):
            print(e.read().decode('utf-8'))
        return

    # 2. Call Tenant auth-via-hub
    tenant_url = "http://127.0.0.1:8090/api/tenant/auth-via-hub"
    sso_payload = {
        "hub_token": hub_token
    }
    print("\n2. Calling Tenant SSO endpoint (auth-via-hub)...")
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
        print(f"   Error calling Tenant SSO: {e}")
        if hasattr(e, 'read'):
            err_body = e.read().decode('utf-8')
            print("   Response Body:")
            print(err_body)
        else:
            print(e)

if __name__ == "__main__":
    run_test()
