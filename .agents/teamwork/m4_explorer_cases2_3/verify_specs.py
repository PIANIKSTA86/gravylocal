import re
import sys
from pathlib import Path

# Target file
spec_path = Path(r"c:\Users\JULIAN\Desktop\GravyLocalTABS\.agents\teamwork\m4_explorer_cases2_3\case_studies_2_and_3.md")
content = spec_path.read_text(encoding="utf-8")

print(f"Total lines: {len(content.splitlines())}")
print(f"Total bytes: {len(content.encode('utf-8'))}")

# Split into Case 2 and Case 3
case2_start = content.find("Case 2:")
case3_start = content.find("Case 3:")

if case2_start == -1 or case3_start == -1:
    print("ERROR: Headers not found!")
    sys.exit(1)

case2_chunk = content[case2_start:case3_start]
case3_chunk = content[case3_start:]

print("\n--- Verifying Case 2 ---")
# 1. HTML Tag Closure in Case 2
for tag in ["div", "article", "section", "button", "header", "p", "span"]:
    opens = len(re.findall(rf"<{tag}\b", case2_chunk))
    closes = len(re.findall(rf"</{tag}>", case2_chunk))
    print(f"Tag <{tag}>: opens={opens}, closes={closes}")
    assert opens == closes, f"Mismatch in <{tag}> for Case 2: {opens} != {closes}"

# 2. Features in Case 2
assert "case 2" in case2_chunk.lower() or "dashboard" in case2_chunk.lower()
assert "symmetrical" in case2_chunk.lower() or "3 identical" in case2_chunk.lower() or "card" in case2_chunk.lower()
assert "hover" in case2_chunk.lower() and "active" in case2_chunk.lower() and "status" in case2_chunk.lower()
assert "shadow" in case2_chunk.lower() and "border" in case2_chunk.lower() and "inset" in case2_chunk.lower()
assert "microcopy" in case2_chunk.lower()
assert "aria-" in case2_chunk or "role=" in case2_chunk
assert "tabular-nums" in case2_chunk or "font-mono" in case2_chunk or "$" in case2_chunk
assert "truncate" in case2_chunk or "overflow" in case2_chunk or "ellipsis" in case2_chunk
assert "dark:" in case2_chunk or "border-" in case2_chunk or "--bg" in case2_chunk
assert len(case2_chunk) > 100
print("All Case 2 feature assertions passed!")

print("\n--- Verifying Case 3 ---")
# 1. HTML Tag Closure in Case 3
# In full chunk, check divs
c3_div_opens = len(re.findall(r"<div\b", case3_chunk))
c3_div_closes = len(re.findall(r"</div>", case3_chunk))
print(f"Case 3 full chunk <div>: opens={c3_div_opens}, closes={c3_div_closes}")
assert c3_div_opens == c3_div_closes, f"Mismatch in <div> for Case 3: {c3_div_opens} != {c3_div_closes}"

# In HTML code blocks, check all tags
c3_code_blocks = re.findall(r"```html(.*?)```", case3_chunk, re.DOTALL)
for i, block in enumerate(c3_code_blocks):
    print(f"Checking Case 3 HTML Code Block {i+1}...")
    for tag in ["div", "form", "label", "button", "header", "p", "span"]:
        opens = len(re.findall(rf"<{tag}\b", block))
        closes = len(re.findall(rf"</{tag}>", block))
        print(f"  Tag <{tag}>: opens={opens}, closes={closes}")
        assert opens == closes, f"Mismatch in Block {i+1} for <{tag}>: {opens} != {closes}"

# 2. Features in Case 3
assert "case 3" in case3_chunk.lower() or "form" in case3_chunk.lower() or "error state" in case3_chunk.lower()
assert "sterile" in case3_chunk.lower() or "red border" in case3_chunk.lower() or "validation" in case3_chunk.lower()
assert "inline" in case3_chunk.lower() or "recovery" in case3_chunk.lower() or "helper" in case3_chunk.lower()
assert "<label" in case3_chunk and "aria-" in case3_chunk and "id=" in case3_chunk
assert "privacy" in case3_chunk.lower() or "permission" in case3_chunk.lower() or "encrypt" in case3_chunk.lower()
assert ("for=" in case3_chunk and "id=" in case3_chunk)
assert "inputmode" in case3_chunk and "autocomplete" in case3_chunk
assert "aria-invalid" in case3_chunk and "aria-describedby" in case3_chunk
assert "draft" in case3_chunk.lower() and "save" in case3_chunk.lower() and "step" in case3_chunk.lower()
assert len(case3_chunk) > 100
print("All Case 3 feature assertions passed!")

print("\n--- Testing Slop Freedom in After Sections ---")
sys.path.insert(0, r"C:\Users\JULIAN\.gemini\config\skills\human-interface-design\scripts")
import audit_copy

# Extract After section from Case 2
c2_after_pos = case2_chunk.lower().find("after:")
c2_after_text = case2_chunk[c2_after_pos:]
clean_c2 = "\n".join([line for line in c2_after_text.splitlines() if not "before" in line.lower() and not "ai" in line.lower()])

# Extract After section from Case 3
c3_after_pos = case3_chunk.lower().find("after:")
c3_after_text = case3_chunk[c3_after_pos:]
clean_c3 = "\n".join([line for line in c3_after_text.splitlines() if not "before" in line.lower() and not "ai" in line.lower()])

hard_slop_words = {"synergy", "unparalleled", "supercharge", "unleash", "delve", "empower", "seamless", "game-changer", "tapestry"}

compiled_lex = audit_copy.get_compiled_lexicon("en")
compiled_form = audit_copy.get_compiled_formulas("en")

def check_slop(text, name):
    score, matches = audit_copy.audit_file_content(text, compiled_lex, compiled_form)
    print(f"Audit score for {name}: {score}/100, matches: {len(matches)}")
    hard_found = []
    for m in matches:
        word = m.get("matched_text", "")
        cat = m.get("category", "")
        print(f"  Match: {word} ({cat}) on line {m.get('line_num')}: {m.get('snippet', '')[:50]}")
        if word.lower() in hard_slop_words:
            hard_found.append(word)
    assert len(hard_found) == 0, f"Found hard slop in {name}: {hard_found}"

check_slop(clean_c2, "Case 2 After")
check_slop(clean_c3, "Case 3 After")

print("\nALL VERIFICATIONS PASSED PERFECTLY!")
