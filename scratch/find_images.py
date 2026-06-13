import os
import glob

# Search in workspace and Desktop
paths_to_search = [
    r'c:\Users\JULIAN\Desktop\GravyLocal2.0',
    r'c:\Users\JULIAN\Desktop'
]

extensions = ['*.png', '*.jpg', '*.jpeg', '*.webp', '*.gif']

print("Searching for images...")
for base_path in paths_to_search:
    print(f"\nIn path: {base_path}")
    if not os.path.exists(base_path):
        print("Path does not exist")
        continue
    # Search non-recursively first to avoid node_modules spam
    for ext in extensions:
        files = glob.glob(os.path.join(base_path, ext))
        for f in files:
            print(f"Found: {f} ({os.path.getsize(f)} bytes)")
            
    # Search one level deep in workspace
    if base_path == r'c:\Users\JULIAN\Desktop\GravyLocal2.0':
        for sub in os.listdir(base_path):
            sub_path = os.path.join(base_path, sub)
            if os.path.isdir(sub_path) and not sub.startswith('.') and sub != 'node_modules':
                for ext in extensions:
                    files = glob.glob(os.path.join(sub_path, ext))
                    for f in files:
                        print(f"Found: {f} ({os.path.getsize(f)} bytes)")
print("Search finished.")
