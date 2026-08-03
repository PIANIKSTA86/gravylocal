import json
import os
import urllib.request
import urllib.error

def test_restore():
    url = "http://127.0.0.1:8095"
    backup_file = r"c:\Users\JULIAN\Desktop\GravyLocal2.0\DatosReferencia\EMPRESA_DE_PRUEBA_SAS_plantilla_config_2026-06-24_02-51.json"
    
    if not os.path.exists(backup_file):
        print(f"Backup file not found at {backup_file}")
        return
        
    print(f"Loading backup file: {backup_file}")
    with open(backup_file, "r", encoding="utf-8") as f:
        backup_data = json.load(f)
        
    # Count accounts in backup
    accounts = backup_data.get("collections", {}).get("accounts", [])
    print(f"Found {len(accounts)} accounts in backup file.")
    
    # Try authentication
    print("Authenticating on port 8095...")
    auth_url = f"{url}/api/collections/users/auth-with-password"
    auth_data = json.dumps({
        "identity": "admin@contaco.com",
        "password": "Admin1234!"
    }).encode("utf-8")
    
    req = urllib.request.Request(
        auth_url,
        data=auth_data,
        headers={"Content-Type": "application/json"}
    )
    
    try:
        with urllib.request.urlopen(req) as res:
            auth_resp = json.loads(res.read().decode("utf-8"))
            token = auth_resp.get("token")
            print("Authentication successful! Token obtained.")
    except urllib.error.HTTPError as e:
        print(f"Auth failed with HTTP status {e.code}: {e.read().decode('utf-8')}")
        return
    except Exception as e:
        print(f"Auth failed with error: {e}")
        return
        
    # Call restore endpoint
    print("Calling /api/gravy/restore...")
    restore_url = f"{url}/api/gravy/restore"
    restore_payload = json.dumps(backup_data).encode("utf-8")
    
    req_restore = urllib.request.Request(
        restore_url,
        data=restore_payload,
        headers={
            "Content-Type": "application/json",
            "Authorization": token
        }
    )
    
    try:
        with urllib.request.urlopen(req_restore) as res:
            restore_resp = json.loads(res.read().decode("utf-8"))
            print("Restore response:")
            print(json.dumps(restore_resp, indent=2))
    except urllib.error.HTTPError as e:
        print(f"Restore failed with HTTP status {e.code}: {e.read().decode('utf-8')}")
    except Exception as e:
        print(f"Restore failed with error: {e}")

if __name__ == "__main__":
    test_restore()
