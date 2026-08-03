import base64

b64 = "PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPE5PVEE+CiAgPEVOQz4KICAgIDxFTkNfMT5OQzwvRU5DXzE+CiAgICA8RU5DXzI+OTAxNDI4ODM0PC9FTkNfMj4KICAgIDxFTkNfMz45MDIwNDU2MDA8L0VOQ18zPgogICAgPEVOQ180PlVCTCAyLjE8L0VOQ180PgogICAgPEVOQ181PkRJQU4gMi4xPC9FTkNfNT4KICAgIDxFTkNfNh5OQzQ1MTwvRU5DXzY+CiAgICA8RU5DXzc+MjAyNi0wNy0zMTwvRU5DXzc+CiAgICA8RU5DXzg+MTU6NDk6NTUtMDU6MDA8L0VOQ184PgogICAgPEVOQ185PjkxPC9FTkNfOT4KICAgIDxFTkNfMTA+Q09QPC9FTkNfMTA+CiAgICAKICAgIDxFTkNfMTU+MzwvRU5DXzE1PgogICAgPEVOQ18xNj4yMDI2LTA4LTMwPC9FTkNfMTY+CiAgICA8RU5DXzIwPjE8L0VOQ18yMD4KICAgIDxFTkNfMjE+MjA8L0VOQ18yMT4KICA8L0VOQz4="

# Get line 17 from log file directly
with open(r'c:\Users\JULIAN\Desktop\GravyLocal2.0\logs\dian\NC-00000451_log.txt', 'r', encoding='utf-8') as f:
    lines = f.readlines()
    for line in lines:
        if '<xmlBase64' in line:
            start = line.find('>') + 1
            end = line.rfind('</xmlBase64>')
            raw_b64 = line[start:end].strip()
            print("Found b64 len:", len(raw_b64))
            decoded = base64.b64decode(raw_b64).decode('utf-8')
            print("=== DECODED XML ===")
            print(decoded)
            break
