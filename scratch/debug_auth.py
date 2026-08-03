import urllib.request
import json
import urllib.error

def test_auth(url, email, password):
    auth_url = f"{url}/api/collections/users/auth-with-password"
    payload = json.dumps({
        "identity": email,
        "password": password
    }).encode("utf-8")
    
    req = urllib.request.Request(
        auth_url,
        data=payload,
        headers={"Content-Type": "application/json"}
    )
    
    print(f"Testing Auth at {auth_url} with {email} / {password}...")
    try:
        with urllib.request.urlopen(req) as res:
            resp = json.loads(res.read().decode('utf-8'))
            print("  [SUCCESS] Response:")
            print(json.dumps(resp, indent=2))
    except urllib.error.HTTPError as e:
        print(f"  [HTTPError] Status: {e.code}")
        try:
            err_body = e.read().decode('utf-8')
            print("  Response Body:", err_body)
        except Exception as read_err:
            print("  Could not read response body:", read_err)
    except Exception as e:
        print("  [Error]:", e)

if __name__ == "__main__":
    # Test on both 8090 and 8091
    test_auth("http://127.0.0.1:8090", "admin@contaco.com", "Admin1234!")
    test_auth("http://127.0.0.1:8091", "admin@contaco.com", "Admin1234!")
