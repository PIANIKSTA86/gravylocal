import urllib.request
import json

def test_hub_toggle():
    # 1. Login to HUB
    login_url = "http://localhost:8089/api/collections/hub_users/auth-with-password"
    data = json.dumps({"identity": "admin@contaco.com", "password": "Admin1234!"}).encode('utf-8')
    req = urllib.request.Request(login_url, data=data, headers={"Content-Type": "application/json"})
    
    try:
        with urllib.request.urlopen(req) as res:
            res_data = json.loads(res.read().decode())
            token = res_data.get("token")
            record = res_data.get("record")
            print("HUB Login Success! User:", record.get("email"), "is_superadmin:", record.get("is_superadmin"))
            print("Token starts with:", token[:20])
    except Exception as e:
        print("Login failed:", e)
        return

    # 2. Test toggle-license
    toggle_url = "http://localhost:8089/api/hub/toggle-license"
    payload = json.dumps({
        "company_id": "kojdt7illwylll1",
        "module_key": "spa-belleza",
        "enabled": True
    }).encode('utf-8')

    req2 = urllib.request.Request(toggle_url, data=payload, headers={
        "Content-Type": "application/json",
        "Authorization": f"Bearer {token}"
    })

    try:
        with urllib.request.urlopen(req2) as res:
            print("Toggle-license status:", res.status)
            print("Toggle-license response:", res.read().decode())
    except urllib.error.HTTPError as e:
        print("Toggle-license HTTP Error:", e.code, e.read().decode())
    except Exception as e:
        print("Toggle-license failed:", e)

    # 3. Test my-companies
    comp_url = "http://localhost:8089/api/hub/my-companies"
    req3 = urllib.request.Request(comp_url, headers={
        "Authorization": f"Bearer {token}"
    })
    try:
        with urllib.request.urlopen(req3) as res:
            print("\nMy-companies status:", res.status)
            res_comp = json.loads(res.read().decode())
            for c in res_comp.get("companies", []):
                print(" Company:", c.get("company_name"), "Modules count:", len(c.get("modules", [])), "Modules:", c.get("modules"))
    except urllib.error.HTTPError as e:
        print("My-companies HTTP Error:", e.code, e.read().decode())
    except Exception as e:
        print("My-companies failed:", e)

if __name__ == '__main__':
    test_hub_toggle()
