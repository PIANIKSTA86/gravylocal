import urllib.request
import json
import urllib.error
import time
import os
import socket

HUB_URL = "http://127.0.0.1:8089"

def check_port_listening(port):
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.settimeout(1.0)
    try:
        s.connect(("127.0.0.1", port))
        s.close()
        return True
    except:
        return False

def make_request(url, method="GET", payload=None, token=None):
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    
    data = None
    if payload:
        data = json.dumps(payload).encode("utf-8")
        
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as res:
            return res.status, json.loads(res.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        body = e.read().decode('utf-8')
        try:
            return e.code, json.loads(body)
        except:
            return e.code, body
    except Exception as e:
        return 0, str(e)

def run_test():
    print("=== STARTING AUTOMATED DELETION FLOW VERIFICATION ===")
    
    # 1. Login to HUB
    print("\n1. Logging into HUB...")
    status, auth_data = make_request(
        f"{HUB_URL}/api/collections/hub_users/auth-with-password",
        method="POST",
        payload={"identity": "admin@contaco.com", "password": "Admin1234!"}
    )
    
    if status != 200:
        print(f"[-] Login failed with status {status}: {auth_data}")
        return False
    
    token = auth_data.get("token")
    print(f"[+] Login successful. Token obtained.")

    # 2. Create a test company
    print("\n2. Creating a test company via HUB...")
    company_name = "EMPRESA PRUEBA BORRADO AUTOMATICO"
    company_nit = "999-999-999-K"
    payload = {
        "name": company_name,
        "nit": company_nit,
        "color": "#EF4444",
        "password": "TemporalPassword123!",
        "modules": ["core", "copropiedades"]
    }
    
    status, create_data = make_request(
        f"{HUB_URL}/api/hub/create-company",
        method="POST",
        payload=payload,
        token=token
    )
    
    if status != 200:
        print(f"[-] Create company failed with status {status}: {create_data}")
        return False
        
    company_id = create_data.get("company")
    print(f"[+] Company created successfully. ID: {company_id}")

    # Wait 15 seconds for orchestrator to finish spinning up the instance
    print("Waiting for instance to initialize...")
    time.sleep(15.0)

    # 3. Retrieve company details from HUB to find its assigned port
    print("\n3. Finding company details...")
    status, comp_record = make_request(
        f"{HUB_URL}/api/collections/companies/records/{company_id}",
        method="GET",
        token=token
    )
    
    if status != 200:
        print(f"[-] Failed to fetch company record with status {status}: {comp_record}")
        return False
        
    port = comp_record.get("port")
    print(f"[+] Assigned Port: {port}")
    
    if not port:
        print("[-] Assigned port is null or empty.")
        return False

    # 4. Verify physical files and active port
    company_dir = f"c:\\Users\\JULIAN\\Desktop\\GravyLocal2.0\\empresas\\empresa_{port}"
    print(f"\n4. Verifying resources for company on port {port}...")
    
    if not os.path.exists(company_dir):
        print(f"[-] Directory {company_dir} does not exist!")
        return False
    print(f"[+] Verified: Directory exists: {company_dir}")
    
    if not check_port_listening(port):
        print(f"[-] Port {port} is not listening!")
        return False
    print(f"[+] Verified: Port {port} is active and listening.")

    # 5. Perform Deletion
    print(f"\n5. Requesting deletion of company {company_id}...")
    status, delete_data = make_request(
        f"{HUB_URL}/api/hub/delete-company",
        method="POST",
        payload={"company_id": company_id},
        token=token
    )
    
    if status != 200:
        print(f"[-] Deletion failed with status {status}: {delete_data}")
        return False
    print(f"[+] Deletion request succeeded: {delete_data}")

    # Wait 6 seconds for orchestrator to stop process and delete files
    print("Waiting for deletion to complete...")
    time.sleep(6.0)

    # 6. Post-deletion verifications
    print("\n6. Running post-deletion checks...")
    
    # 6a. Check port is not listening
    if check_port_listening(port):
        print(f"[-] FAILED: Port {port} is still listening!")
        return False
    print(f"[+] Verified: Port {port} is no longer active/listening.")
    
    # 6b. Check physical folder is gone
    if os.path.exists(company_dir):
        print(f"[-] FAILED: Physical directory {company_dir} still exists!")
        return False
    print(f"[+] Verified: Physical directory {company_dir} was deleted.")
    
    # 6c. Verify company record is gone from HUB
    status, verify_rec = make_request(
        f"{HUB_URL}/api/collections/companies/records/{company_id}",
        method="GET",
        token=token
    )
    if status == 404:
        print(f"[+] Verified: Company record was deleted from HUB (Status 404).")
    else:
        print(f"[-] FAILED: Company record was not deleted from HUB (Status: {status}, Response: {verify_rec})")
        return False

    print("\n[SUCCESS] ALL CHECKS PASSED! Company deletion is working flawlessly!")
    return True

if __name__ == "__main__":
    run_test()
