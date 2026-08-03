import urllib.request
import json

def hit_it():
    url = "http://127.0.0.1:8095/test-relation-field"
    try:
        with urllib.request.urlopen(url) as res:
            resp = json.loads(res.read().decode('utf-8'))
            print("Response:")
            print(json.dumps(resp, indent=2))
    except Exception as e:
        print("Error:", e)

if __name__ == "__main__":
    hit_it()
