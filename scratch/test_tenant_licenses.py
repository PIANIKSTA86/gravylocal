import urllib.request
import json

def test_tenant_licenses():
    # 1. Login to Tenant on 8090 as admin@contaco.com
    login_url = "http://localhost:8090/api/collections/users/auth-with-password"
    data = json.dumps({"identity": "admin@contaco.com", "password": "Admin1234!"}).encode('utf-8')
    req = urllib.request.Request(login_url, data=data, headers={"Content-Type": "application/json"})
    
    try:
        with urllib.request.urlopen(req) as res:
            res_data = json.loads(res.read().decode())
            token = res_data.get("token")
            record = res_data.get("record")
            print("Tenant Login Success! User:", record.get("email"), "role:", record.get("role"))
    except Exception as e:
        print("Tenant Login failed:", e)
        return

    # 2. Query /api/gravy/my-licenses
    my_lic_url = "http://localhost:8090/api/gravy/my-licenses"
    req_lic = urllib.request.Request(my_lic_url, headers={"Authorization": f"Bearer {token}"})
    try:
        with urllib.request.urlopen(req_lic) as res:
            data = json.loads(res.read().decode())
            print("\n/api/gravy/my-licenses returned:")
            print(" Modules count:", len(data.get("modules", [])))
            print(" Modules keys:", [m.get("module_key") for m in data.get("modules", [])])
    except urllib.error.HTTPError as e:
        print("my-licenses error:", e.code, e.read().decode())

    # 3. Test toggle on tenant
    toggle_url = "http://localhost:8090/api/gravy/toggle-license"
    payload = json.dumps({"module_key": "spa-belleza", "enabled": True}).encode('utf-8')
    req_tog = urllib.request.Request(toggle_url, data=payload, headers={
        "Content-Type": "application/json",
        "Authorization": f"Bearer {token}"
    })
    try:
        with urllib.request.urlopen(req_tog) as res:
            print("\nTenant toggle-license status:", res.status)
            print(" Tenant toggle-license response:", res.read().decode())
    except urllib.error.HTTPError as e:
        print("Tenant toggle-license error:", e.code, e.read().decode())

if __name__ == '__main__':
    test_tenant_licenses()
