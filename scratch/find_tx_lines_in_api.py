import sys

def find_tx_lines(filepath):
    print(f"=== {filepath} ===")
    with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
        lines = f.readlines()
        for idx, line in enumerate(lines, 1):
            if 'tx_lines' in line:
                cleaned = line.strip().encode('ascii', errors='backslashreplace').decode('ascii')
                print(f"L{idx:4d}: {cleaned}")

find_tx_lines(r"c:\Users\JULIAN\Desktop\GravyLocal2.0\frontend\src\api.ts")
find_tx_lines(r"c:\Users\JULIAN\Desktop\GravyLocal2.0\frontend\src\modules\transacciones.ts")
