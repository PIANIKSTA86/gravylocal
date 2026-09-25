import urllib.request
import json

def verify_all():
    print("=== 1. VERIFICACIÓN TENANT (PUERTO 8090) ===")
    # Login local
    login_url = "http://localhost:8090/api/collections/users/auth-with-password"
    data = json.dumps({"identity": "admin@contaco.com", "password": "Admin1234!"}).encode('utf-8')
    req = urllib.request.Request(login_url, data=data, headers={"Content-Type": "application/json"})
    
    with urllib.request.urlopen(req) as res:
        token = json.loads(res.read().decode())["token"]
        print("Login local exitoso. Token generado.")

    # Consultar /api/gravy/my-licenses
    req_lic = urllib.request.Request("http://localhost:8090/api/gravy/my-licenses", headers={"Authorization": f"Bearer {token}"})
    with urllib.request.urlopen(req_lic) as res:
        lics = json.loads(res.read().decode())["modules"]
        keys = [l["module_key"] for l in lics]
        print(f"Módulos habilitados en Tenant ({len(keys)}):", keys)
        assert "spa-belleza" in keys, "ERROR: spa-belleza no está habilitado en Tenant"
        assert "copropiedades" in keys, "ERROR: copropiedades no está habilitado en Tenant"
        assert "crm" in keys, "ERROR: crm no está habilitado en Tenant"
        print("  -> Verificación de módulos clave en Tenant: OK")

    print("\n=== 2. VERIFICACIÓN HUB (PUERTO 8089) ===")
    login_hub = "http://localhost:8089/api/collections/hub_users/auth-with-password"
    req_h = urllib.request.Request(login_hub, data=data, headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req_h) as res:
        hub_token = json.loads(res.read().decode())["token"]
        print("Login HUB exitoso.")

    req_co = urllib.request.Request("http://localhost:8089/api/hub/my-companies", headers={"Authorization": f"Bearer {hub_token}"})
    with urllib.request.urlopen(req_co) as res:
        comps = json.loads(res.read().decode())["companies"]
        for c in comps:
            if c["company_id"] == "kojdt7illwylll1":
                print("Empresa DOMESTIKO SAS en HUB:")
                print(f"  Módulos concedidos ({len(c['modules'])}):", c["modules"])
                assert "spa-belleza" in c["modules"], "ERROR: spa-belleza no está en HUB"
                assert "copropiedades" in c["modules"], "ERROR: copropiedades no está en HUB"
                print("  -> Verificación HUB: OK")

    print("\n=== 3. VERIFICACIÓN ARCHIVOS ESTÁTICOS Y PORTAL CITAS ===")
    req_citas = urllib.request.Request("http://localhost:8090/citas.html")
    with urllib.request.urlopen(req_citas) as res:
        print("citas.html disponible (HTTP status):", res.status)

    req_index = urllib.request.Request("http://localhost:8090/")
    with urllib.request.urlopen(req_index) as res:
        print("index.html disponible (HTTP status):", res.status)

    print("\nTODAS LAS PRUEBAS PASARON EXITOSAMENTE.")

if __name__ == '__main__':
    verify_all()
