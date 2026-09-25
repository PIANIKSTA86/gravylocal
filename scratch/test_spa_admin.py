import urllib.request
import json

def get_auth_token():
    req = urllib.request.Request(
        "http://127.0.0.1:8090/api/collections/_superusers/auth-with-password",
        data=json.dumps({"identity": "test2@admin.com", "password": "test123456"}).encode('utf-8'),
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode('utf-8'))
        return data["token"]

token = get_auth_token()
print("Authenticated successfully as superuser, token obtained.")

# GET admin settings
req = urllib.request.Request(
    "http://127.0.0.1:8090/api/gravy/spa-beauty/settings",
    headers={"Authorization": f"Bearer {token}"}
)
with urllib.request.urlopen(req) as resp:
    admin_data = json.loads(resp.read().decode('utf-8'))

cfg = admin_data.get("config", {})
all_services = admin_data.get("all_services", [])
print(f"Admin endpoint returned {len(all_services)} total services.")

# Save custom config with custom title and start/end hour
cfg["spa_name"] = "Élite Spa & Belleza Integral"
cfg["whatsapp"] = "573105559988"
cfg["start_hour"] = 7
cfg["end_hour"] = 20
cfg["welcome_msg"] = "¡Bienvenido a Élite Spa! Reserva tu tratamiento exclusivo en línea."

post_req = urllib.request.Request(
    "http://127.0.0.1:8090/api/gravy/spa-beauty/settings",
    data=json.dumps({"config": cfg}).encode('utf-8'),
    headers={"Content-Type": "application/json", "Authorization": f"Bearer {token}"}
)
with urllib.request.urlopen(post_req) as resp:
    save_res = json.loads(resp.read().decode('utf-8'))
    print("Save result:", save_res)

# Check public endpoint to verify dynamic update
pub_req = urllib.request.Request("http://127.0.0.1:8090/api/public/spa/config")
with urllib.request.urlopen(pub_req) as resp:
    pub_cfg = json.loads(resp.read().decode('utf-8'))
    print("\nUpdated Public Config:")
    print(" - Name:", pub_cfg.get("name"))
    print(" - WhatsApp:", pub_cfg.get("whatsapp"))
    print(" - Hours:", pub_cfg.get("start_hour"), "to", pub_cfg.get("end_hour"))
    print(" - Welcome:", pub_cfg.get("welcome_msg"))
