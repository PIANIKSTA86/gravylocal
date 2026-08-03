import os

brain_path = r'C:\Users\JULIAN\.gemini\antigravity-ide\brain\82319753-0105-4a58-a8c5-12f801fdbf39'

print("Searching for images in brain path:")
for root, dirs, files in os.walk(brain_path):
    for f in files:
        if f.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg')):
            f_path = os.path.join(root, f)
            print(f"Found image in brain: {f_path} | Size: {os.path.getsize(f_path)} bytes")

print("Done searching.")
