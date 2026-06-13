import os

search_paths = [r'c:\Users\JULIAN\Desktop', r'c:\Users\JULIAN\Downloads']
keywords = ['muestra', 'tienda', 'gravy', 'mockup', 'ejemplo', 'screenshot', 'captura', 'diseño']

print("Searching for files with keywords:")
for p in search_paths:
    if not os.path.exists(p):
        continue
    for f in os.listdir(p):
        f_lower = f.lower()
        if any(kw in f_lower for kw in keywords):
            print(f"Found match: {os.path.join(p, f)}")

print("Finished searching.")
