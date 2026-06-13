import zipfile

zip_path = r'c:\Users\JULIAN\Desktop\cia F09 portal.zip'

try:
    with zipfile.ZipFile(zip_path, 'r') as z:
        print(f"Files inside '{zip_path}':")
        for name in z.namelist():
            print(f"  - {name}")
except Exception as e:
    print(f"Error reading zip: {e}")
