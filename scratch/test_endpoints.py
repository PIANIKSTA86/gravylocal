import urllib.request
import json

def test_endpoints():
    endpoints = ["/temp-seed", "/test-query", "/api/gravy/restore"]
    for ep in endpoints:
        url = f"http://127.0.0.1:8091{ep}"
        print(f"Testing {url}...")
        try:
            with urllib.request.urlopen(url) as res:
                print(f"  Response ({res.status}): {res.read().decode('utf-8')[:200]}")
        except urllib.error.HTTPError as e:
            print(f"  HTTPError ({e.code}): {e.read().decode('utf-8')[:200]}")
        except Exception as e:
            print(f"  Error: {e}")

if __name__ == "__main__":
    test_endpoints()
