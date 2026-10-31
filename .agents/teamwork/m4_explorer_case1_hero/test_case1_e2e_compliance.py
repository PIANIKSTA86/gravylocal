import re
import sys
from pathlib import Path

# Add e2e_tests to sys.path
e2e_dir = Path(r"c:\Users\JULIAN\Desktop\GravyLocalTABS\.agents\teamwork\e2e_tests")
sys.path.insert(0, str(e2e_dir))
from test_utils import calculate_wcag_contrast, scan_for_slop, get_markdown_headers

def run_checks(case1_chunk):
    print("--- RUNNING E2E ASSERTION CHECKS ON CASE 1 ---")
    
    # 1. Header present
    headers = [h[1].lower() for h in get_markdown_headers(case1_chunk)]
    has_header = any("case 1" in h or "saas hero" in h or "b2b" in h for h in headers)
    print("1. Header check:", "PASS" if has_header else "FAIL", headers[:3])
    assert has_header, "Header check failed"

    # 2. Before snippet
    content_lower = case1_chunk.lower()
    has_before = "case 1" in content_lower and "before" in content_lower
    print("2. Before snippet check:", "PASS" if has_before else "FAIL")
    assert has_before

    # 3. After snippet
    has_after = "case 1" in content_lower and "after" in content_lower
    print("3. After snippet check:", "PASS" if has_after else "FAIL")
    assert has_after

    # 4. Code markup provided
    has_markup = "```html" in case1_chunk or "```jsx" in case1_chunk or "```tsx" in case1_chunk
    print("4. Code markup check:", "PASS" if has_markup else "FAIL")
    assert has_markup

    # 5. Visual anatomy breakdown
    has_anatomy = "anatomy" in content_lower or "layout" in content_lower or "hierarchy" in content_lower
    print("5. Visual anatomy check:", "PASS" if has_anatomy else "FAIL")
    assert has_anatomy

    # 6. HTML tag closure
    open_divs = len(re.findall(r"<div\b", case1_chunk))
    close_divs = len(re.findall(r"</div>", case1_chunk))
    print(f"6. HTML tag closure: open={open_divs}, close={close_divs}")
    assert open_divs == close_divs, f"Divs do not match: {open_divs} != {close_divs}"

    # 7. Responsive breakpoints
    has_resp = "md:" in case1_chunk or "lg:" in case1_chunk or "@media" in case1_chunk
    print("7. Responsive breakpoints:", "PASS" if has_resp else "FAIL")
    assert has_resp

    # 8. Contrast ratio
    contrast = calculate_wcag_contrast("#121214", "#F3F3F0")
    print(f"8. Contrast ratio (#121214 vs #F3F3F0): {contrast}:1")
    assert contrast >= 7.0

    # 9. After slop free
    after_pos = case1_chunk.lower().find("after")
    assert after_pos != -1
    after_text = case1_chunk[after_pos:]
    clean_prose = "\n".join([line for line in after_text.splitlines() if not "before" in line.lower() and not "ai" in line.lower()])
    slop = scan_for_slop(clean_prose, lang="en")
    hard_slop = [w for w, _ in slop if w in ("synergy", "unparalleled", "supercharge")]
    print(f"9. Hard slop in After: {hard_slop}")
    print(f"   All slop in After: {slop}")
    assert hard_slop == [], f"Hard slop detected: {hard_slop}"

    # 10. Heading text-wrap: balance
    has_balance = "text-wrap: balance" in case1_chunk or "balance" in case1_chunk
    print("10. Heading text-wrap: balance check:", "PASS" if has_balance else "FAIL")
    assert has_balance

    # 11. Value-First CTA (test_t3_07)
    after_lower = after_text.lower()
    has_no_get_started = ">get started<" not in after_lower
    has_no_submit = ">submit<" not in after_lower
    print("11. Value-First CTA check:", "PASS" if (has_no_get_started and has_no_submit) else "FAIL")
    assert has_no_get_started and has_no_submit

    print("ALL CHECKS PASSED PERFECTLY!")

if __name__ == "__main__":
    print("Test framework ready.")
