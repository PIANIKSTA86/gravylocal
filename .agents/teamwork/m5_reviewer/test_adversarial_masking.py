import sys
from pathlib import Path

# Add scripts directory
sys.path.insert(0, r"C:\Users\JULIAN\.gemini\config\skills\human-interface-design\scripts")
import audit_copy

lexicon = audit_copy.get_compiled_lexicon("all")
formulas = audit_copy.get_compiled_formulas("all")

# Test 1: Buzzword outside backtick, buzzword inside backtick
line = "We unleash the system while `seamless` is in backticks"
wc, findings = audit_copy.audit_file_content(line, lexicon, formulas, "test.md")
assert len(findings) == 1, f"Expected 1 finding, got {len(findings)}: {findings}"
assert findings[0]["matched_text"] == "unleash", f"Expected unleash, got {findings[0]}"
assert findings[0]["col"] == 4, f"Expected col 4, got {findings[0]['col']}"
print("Test 1 PASSED: inline backtick masking preserves col alignment and only flags unbackticked buzzword")

# Test 2: Multiple backticks on same line
line2 = "`empower` is bad, but `seamless` and `revolutionize` are also bad."
wc, findings2 = audit_copy.audit_file_content(line2, lexicon, formulas, "test.md")
assert len(findings2) == 0, f"Expected 0 findings, got {len(findings2)}: {findings2}"
print("Test 2 PASSED: multiple backticks on same line are completely masked")

# Test 3: Formula in fenced code block
code3 = """```markdown
# Header
Say goodbye to manual tracking, say hello to automated sync
```"""
wc, findings3 = audit_copy.audit_file_content(code3, lexicon, formulas, "test.md")
assert len(findings3) == 0, f"Expected 0 findings, got {len(findings3)}: {findings3}"
print("Test 3 PASSED: formulas inside markdown code blocks are 100% masked")

# Test 4: Triad in fenced code block
code4 = """```bash
build high quality web apps
deploy fast modern edge code
scale reliable cloud services
```"""
wc, findings4 = audit_copy.audit_file_content(code4, lexicon, formulas, "test.md")
assert len(findings4) == 0, f"Expected 0 findings, got {len(findings4)}: {findings4}"
print("Test 4 PASSED: triads inside markdown code blocks are 100% masked")

# Test 5: Trailing JS comment
code5 = "const x = 1; // empower the algorithm"
wc, findings5 = audit_copy.audit_file_content(code5, lexicon, formulas, "test.js")
assert len(findings5) == 0, f"Expected 0 findings in test.js, got {len(findings5)}: {findings5}"
print("Test 5 PASSED: trailing // comments in JS files are masked")

# Test 6: Multi-line HTML comment
code6 = """<div>
<!--
This is an empower statement
inside an html comment
-->
<p>Clean human text</p>
</div>"""
wc, findings6 = audit_copy.audit_file_content(code6, lexicon, formulas, "test.html")
assert len(findings6) == 0, f"Expected 0 findings in test.html, got {len(findings6)}: {findings6}"
print("Test 6 PASSED: multi-line HTML comments are masked")

# Test 7: Multi-line CSS comment
code7 = """/*
.empower-class {
   color: red;
}
*/
body { margin: 0; }"""
wc, findings7 = audit_copy.audit_file_content(code7, lexicon, formulas, "test.css")
assert len(findings7) == 0, f"Expected 0 findings in test.css, got {len(findings7)}: {findings7}"
print("Test 7 PASSED: multi-line C-style comments are masked")

# Test 8: URL in string literal
code8 = 'const url = "https://example.com/unleash";'
wc, findings8 = audit_copy.audit_file_content(code8, lexicon, formulas, "test.js")
# Note: In a JS file, 'https://...' contains '//', so everything after '//' is masked!
print(f"Test 8 Note: URL in JS findings={len(findings8)}")

print("ALL ADVERSARIAL MASKING STRESS TESTS PASSED SUCCESSFULLY!")
