#!/usr/bin/env python3
"""
Forensic Audit Independent Probe
---------------------------------
Independently verifies:
1. WCAG 2.1 relative luminance and contrast calculation for #6E6E69 on #121214.
2. Cross-file anchor resolution for all markdown links in references/ and examples/.
3. audit_copy.py line masking behavior with positive and negative controls.
4. e2e_tests/ code integrity check (no monkeypatching, no mock facades).
5. Live execution of audit_copy.py on target files.
"""

import sys
import re
import math
import subprocess
from pathlib import Path

SKILL_DIR = Path(r"C:\Users\JULIAN\.gemini\config\skills\human-interface-design")
E2E_DIR = Path(r"c:\Users\JULIAN\Desktop\GravyLocalTABS\.agents\teamwork\e2e_tests")
AUDIT_SCRIPT = SKILL_DIR / "scripts" / "audit_copy.py"

def srgb_to_linear(val: float) -> float:
    return val / 12.92 if val <= 0.04045 else ((val + 0.055) / 1.055) ** 2.4

def hex_to_relative_luminance(hex_str: str) -> float:
    hex_str = hex_str.lstrip("#")
    r = int(hex_str[0:2], 16) / 255.0
    g = int(hex_str[2:4], 16) / 255.0
    b = int(hex_str[4:6], 16) / 255.0
    r_lin = srgb_to_linear(r)
    g_lin = srgb_to_linear(g)
    b_lin = srgb_to_linear(b)
    return 0.2126 * r_lin + 0.7152 * g_lin + 0.0722 * b_lin

def contrast_ratio(hex1: str, hex2: str) -> float:
    l1 = hex_to_relative_luminance(hex1)
    l2 = hex_to_relative_luminance(hex2)
    lighter = max(l1, l2)
    darker = min(l1, l2)
    return (lighter + 0.05) / (darker + 0.05)

def check_wcag_math():
    print("--- 1. WCAG Math Verification ---")
    ratio = contrast_ratio("#6E6E69", "#121214")
    rounded = round(ratio, 2)
    print(f"Calculated contrast ratio for #6E6E69 on #121214: {ratio:.4f} -> {rounded:.2f}:1")
    assert rounded == 3.65, f"Expected 3.65:1, got {rounded}:1"
    print("PASS: Exact mathematical contrast verified (3.65:1).")

def check_cross_file_anchors():
    print("\n--- 2. Cross-File Anchor Resolution ---")
    rubric_path = SKILL_DIR / "references" / "audit-rubric.md"
    rubric_text = rubric_path.read_text(encoding="utf-8")
    
    # Extract links like (organic-ui.md#section-2)
    links = re.findall(r"\(([\w\-]+\.md)#([a-zA-Z0-9_\-]+)\)", rubric_text)
    print(f"Found {len(links)} cross-file fragment links in audit-rubric.md:")
    
    for filename, fragment in links:
        target_file = SKILL_DIR / "references" / filename
        assert target_file.exists(), f"Target file does not exist: {target_file}"
        target_text = target_file.read_text(encoding="utf-8")
        
        # Check if anchor exists either as <a id="fragment"> or as heading slug
        anchor_tag = f'<a id="{fragment}">'
        has_anchor_tag = anchor_tag in target_text
        
        # Also check standard markdown heading
        heading_matches = [
            line for line in target_text.splitlines()
            if line.startswith("#") and fragment in line.lower()
        ]
        
        resolved = has_anchor_tag or len(heading_matches) > 0
        print(f"  {filename}#{fragment} -> tag:{has_anchor_tag}, resolved:{resolved}")
        assert resolved, f"Anchor #{fragment} failed to resolve in {filename}"
        
    print("PASS: All cross-file links resolved successfully.")

def check_before_after_cases_toc():
    print("\n--- 3. TOC Resolution in before-after-cases.md ---")
    cases_path = SKILL_DIR / "examples" / "before-after-cases.md"
    text = cases_path.read_text(encoding="utf-8")
    
    toc_links = re.findall(r"\[([^\]]+)\]\(#([a-zA-Z0-9_\-]+)\)", text[:600])
    print(f"Found {len(toc_links)} TOC links:")
    
    for title, anchor in toc_links:
        # Check if anchor is present as heading slug or <a id="...">
        has_tag = f'<a id="{anchor}">' in text
        # Generate slug from headings
        headings = [line.lstrip("#").strip() for line in text.splitlines() if line.startswith("# ")]
        def slugify(h):
            s = h.lower()
            s = re.sub(r"[^\w\s\-]", "", s)
            s = re.sub(r"[\s_]+", "-", s)
            return s.strip("-")
        slugs = [slugify(h) for h in headings]
        
        resolved = has_tag or (anchor in slugs)
        print(f"  TOC '{title}' -> #{anchor} (tag:{has_tag}, heading_slug:{anchor in slugs})")
        assert resolved, f"TOC anchor #{anchor} could not be resolved!"
        
    print("PASS: TOC links resolved in before-after-cases.md.")

def check_audit_copy_masking():
    print("\n--- 4. audit_copy.py Masking & Sensitivity Probing ---")
    sys.path.insert(0, str(SKILL_DIR / "scripts"))
    import audit_copy
    
    lex = audit_copy.get_compiled_lexicon("all")
    formulas = audit_copy.get_compiled_formulas("all")
    
    # Test A: Buzzword in code block should be ignored
    code_in_block = "```python\n# Unleash the power\ndef unleash(): pass\n```"
    w1, f1 = audit_copy.audit_file_content(code_in_block, lex, formulas, file_path="test.md")
    print(f"  Test A (code block): findings={len(f1)}")
    assert len(f1) == 0, f"Expected 0 findings in code block, got {len(f1)}"
    
    # Test B: Buzzword outside code block MUST be detected
    text_outside = "We unleash the power of AI."
    w2, f2 = audit_copy.audit_file_content(text_outside, lex, formulas, file_path="test.md")
    print(f"  Test B (outside code block): findings={len(f2)}, matched='{f2[0]['matched_text']}'")
    assert len(f2) == 1 and f2[0]["matched_text"].lower() == "unleash", "Failed to detect buzzword outside code block!"
    
    # Test C: Formula in code block should be ignored
    formula_in_block = "```markdown\nWhere Quality Meets Speed\n```"
    w3, f3 = audit_copy.audit_file_content(formula_in_block, lex, formulas, file_path="test.md")
    print(f"  Test C (formula in code block): findings={len(f3)}")
    assert len(f3) == 0, f"Expected 0 findings in formula code block, got {len(f3)}"
    
    # Test D: Formula outside code block MUST be detected
    formula_outside = "Where Quality Meets Speed"
    w4, f4 = audit_copy.audit_file_content(formula_outside, lex, formulas, file_path="test.md")
    print(f"  Test D (formula outside code block): findings={len(f4)}")
    assert len(f4) == 1, f"Expected 1 finding for formula outside block, got {len(f4)}"
    
    # Test E: Triad in code block should be ignored
    triad_in_block = "```html\nDeploy your apps\nTrack your logs\nScale your database\n```"
    w5, f5 = audit_copy.audit_file_content(triad_in_block, lex, formulas, file_path="test.md")
    print(f"  Test E (triad in code block): findings={len(f5)}")
    assert len(f5) == 0, f"Expected 0 findings for triad in code block, got {len(f5)}"
    
    # Test F: Triad outside code block MUST be detected
    triad_outside = "Deploy your apps now\nTrack your logs daily\nScale your database fast"
    w6, f6 = audit_copy.audit_file_content(triad_outside, lex, formulas, file_path="test.md")
    print(f"  Test F (triad outside code block): findings={len(f6)}")
    assert len(f6) == 1, f"Expected 1 finding for triad outside block, got {len(f6)}"
    
    print("PASS: audit_copy.py correctly discriminates between code blocks and genuine copy.")

def check_e2e_tests_integrity():
    print("\n--- 5. e2e_tests/ Code Integrity Check ---")
    for py_file in E2E_DIR.glob("*.py"):
        text = py_file.read_text(encoding="utf-8")
        # Check for monkeypatching unittest
        assert "unittest.TestCase.assertTrue = " not in text, f"Tampered assert in {py_file}"
        assert "unittest.TestCase.assertEqual = " not in text, f"Tampered assert in {py_file}"
        assert "sys.modules[" not in text, f"Suspicious module mock in {py_file}"
        assert "mock" not in text.lower() or "mockup" in text.lower(), f"Suspicious mock reference in {py_file}"
        print(f"  {py_file.name}: clean ({len(text.splitlines())} lines)")
    print("PASS: No tampering detected in e2e_tests/.")

def run_live_audit():
    print("\n--- 6. Live Execution of audit_copy.py on SKILL.md ---")
    proc = subprocess.run(
        [sys.executable, str(AUDIT_SCRIPT), str(SKILL_DIR / "SKILL.md"), "--json"],
        capture_output=True,
        text=True
    )
    print(f"Exit code: {proc.returncode}")
    assert proc.returncode == 0, f"audit_copy.py failed with exit code {proc.returncode}"
    import json
    data = json.loads(proc.stdout)
    score = data["summary"]["humanization_score"]
    passed = data["summary"]["passed"]
    print(f"Score: {score}/100.0, Passed: {passed}, Buzzwords: {data['summary']['total_buzzwords']}")
    assert passed is True, "SKILL.md failed audit!"
    assert score >= 80.0, f"Expected score >= 80 (default threshold), got {score}"
    print("PASS: Live audit of SKILL.md succeeded with passing score.")

if __name__ == "__main__":
    check_wcag_math()
    check_cross_file_anchors()
    check_before_after_cases_toc()
    check_audit_copy_masking()
    check_e2e_tests_integrity()
    run_live_audit()
    print("\n=============================================")
    print("ALL INDEPENDENT FORENSIC CHECKS PASSED: CLEAN")
    print("=============================================")
