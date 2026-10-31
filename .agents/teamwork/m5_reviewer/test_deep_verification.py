import re
from pathlib import Path

SKILL_DIR = Path(r"C:\Users\JULIAN\.gemini\config\skills\human-interface-design")

def gfm_slug(heading_text: str) -> str:
    text = heading_text.strip().lstrip("#").strip().lower()
    text = re.sub(r"[^\w\s-]", "", text)
    return re.sub(r" ", "-", text)

def commonmark_slug(heading_text: str) -> str:
    text = heading_text.strip().lstrip("#").strip().lower()
    text = re.sub(r"[^\w\s-]", "", text)
    return re.sub(r"\s+", "-", text)

def srgb_channel_to_linear(val: float) -> float:
    c = val / 255.0
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4

def calculate_luminance_from_hex(hex_code: str) -> float:
    h = hex_code.strip().lstrip("#")
    if len(h) == 3:
        h = "".join([c * 2 for c in h])
    if len(h) != 6:
        raise ValueError(f"Invalid hex color: '{hex_code}'")
    r = int(h[0:2], 16)
    g = int(h[2:4], 16)
    b = int(h[4:6], 16)
    return (
        0.2126 * srgb_channel_to_linear(r)
        + 0.7152 * srgb_channel_to_linear(g)
        + 0.0722 * srgb_channel_to_linear(b)
    )

def calculate_contrast(hex1: str, hex2: str) -> float:
    l1 = calculate_luminance_from_hex(hex1)
    l2 = calculate_luminance_from_hex(hex2)
    lighter = max(l1, l2)
    darker = min(l1, l2)
    return round((lighter + 0.05) / (darker + 0.05), 2)

# Collect all md files
md_files = list(SKILL_DIR.rglob("*.md"))
print(f"Total markdown files found: {len(md_files)}")

# Build inventory of targets and anchors
file_anchors = {}
for mf in md_files:
    content = mf.read_text(encoding="utf-8")
    anchors = set()
    # 1. HTML ids
    for tag_id in re.findall(r'<[a-zA-Z0-9]+\s+[^>]*(?:id|name)=["\']([^"\']+)["\']', content):
        anchors.add(tag_id)
        anchors.add(tag_id.lower())
    # 2. Heading slugs
    for line in content.splitlines():
        if line.strip().startswith("#"):
            anchors.add(gfm_slug(line))
            anchors.add(commonmark_slug(line))
    file_anchors[mf.resolve()] = anchors

# Check all links
broken_links = []
total_links = 0
for mf in md_files:
    content = mf.read_text(encoding="utf-8")
    # match markdown links [text](path#anchor)
    matches = re.findall(r'\[([^\]]*)\]\(([^)]+)\)', content)
    for text, target in matches:
        if target.startswith("http://") or target.startswith("https://") or target.startswith("mailto:"):
            continue
        total_links += 1
        parts = target.split("#", 1)
        target_path_str = parts[0]
        anchor = parts[1] if len(parts) > 1 else None

        if target_path_str:
            resolved_file = (mf.parent / target_path_str).resolve()
        else:
            resolved_file = mf.resolve()

        if not resolved_file.exists():
            broken_links.append((str(mf.relative_to(SKILL_DIR)), text, target, f"File does not exist: {resolved_file}"))
            continue

        if anchor:
            valid_targets = file_anchors.get(resolved_file, set())
            if anchor not in valid_targets and anchor.lower() not in valid_targets:
                broken_links.append((str(mf.relative_to(SKILL_DIR)), text, target, f"Anchor '{anchor}' not found in {resolved_file.name}"))

print(f"Total internal markdown links scanned: {total_links}")
if broken_links:
    print(f"BROKEN LINKS DETECTED ({len(broken_links)}):")
    for src, text, target, reason in broken_links:
        print(f"  In {src}: [{text}]({target}) -> {reason}")
else:
    print("ALL INTERNAL MARKDOWN LINKS AND FRAGMENT ANCHORS RESOLVE PERFECTLY (0 BROKEN LINKS)!")

# Mathematical contrast checks
print("\n--- Contrast Verification ---")
# #6E6E69 on #121214
c_subtle = calculate_contrast("#6E6E69", "#121214")
print(f"#6E6E69 on #121214: {c_subtle}:1")
assert c_subtle == 3.65, f"Expected 3.65, got {c_subtle}"

# #F3F3F0 on #121214
c_main = calculate_contrast("#F3F3F0", "#121214")
print(f"#F3F3F0 on #121214: {c_main}:1 (claimed 16.83:1)")
assert abs(c_main - 16.83) < 0.05

# #A3A39E on #121214
c_muted = calculate_contrast("#A3A39E", "#121214")
print(f"#A3A39E on #121214: {c_muted}:1 (claimed 7.39:1)")
assert abs(c_muted - 7.39) < 0.05

# #1C1917 on #FBF9F5
c_fintech_main = calculate_contrast("#1C1917", "#FBF9F5")
print(f"#1C1917 on #FBF9F5: {c_fintech_main}:1 (claimed 16.63:1)")
assert abs(c_fintech_main - 16.63) < 0.05

# #655E57 on #FBF9F5
c_fintech_muted = calculate_contrast("#655E57", "#FBF9F5")
print(f"#655E57 on #FBF9F5: {c_fintech_muted}:1 (claimed 6.07:1)")
assert abs(c_fintech_muted - 6.07) < 0.05

# #13241D on #F7F9F8
c_health_main = calculate_contrast("#13241D", "#F7F9F8")
print(f"#13241D on #F7F9F8: {c_health_main}:1 (claimed 15.30:1)")
assert abs(c_health_main - 15.30) < 0.05

print("ALL MATHEMATICAL CONTRAST CHECKS VERIFIED ACCURATELY!")
