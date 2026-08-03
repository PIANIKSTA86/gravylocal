import json
import os

def check_keys():
    backup_file = r"c:\Users\JULIAN\Desktop\GravyLocal2.0\DatosReferencia\EMPRESA_DE_PRUEBA_SAS_plantilla_config_2026-06-24_02-51.json"
    if not os.path.exists(backup_file):
        print("Backup file not found")
        return
        
    with open(backup_file, "r", encoding="utf-8") as f:
        data = json.load(f)
        
    collections = data.get("collections", {})
    print("Collections in backup:")
    for col_name, rows in collections.items():
        if len(rows) > 0 or col_name == "users":
            print(f"  {col_name}: {len(rows)} records")

if __name__ == "__main__":
    check_keys()
