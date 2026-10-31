import sys
from pathlib import Path

sys.path.insert(0, r"C:\Users\JULIAN\.gemini\config\skills\human-interface-design\scripts")
import audit_copy

lexicon = audit_copy.get_compiled_lexicon("all")
formulas = audit_copy.get_compiled_formulas("all")

# Repro 1: Formula in code block
code1 = "```markdown\nSay goodbye to manual tracking, say hello to automated sync\n```"
_, findings1 = audit_copy.audit_file_content(code1, lexicon, formulas, "doc.md")

# Repro 2: Triad in code block
code2 = "```bash\nbuild web apps\ndeploy modern edge code\nscale cloud services\n```"
_, findings2 = audit_copy.audit_file_content(code2, lexicon, formulas, "doc.md")

# Repro 3: Inline backtick in markdown
code3 = "Do not use `empower` in your UI text."
_, findings3 = audit_copy.audit_file_content(code3, lexicon, formulas, "doc.md")

# Repro 4: Trailing comment
code4 = "const retries = 3; // empower retry engine"
_, findings4 = audit_copy.audit_file_content(code4, lexicon, formulas, "code.js")

print(f"findings1 (code block formula): {len(findings1)}")
print(f"findings2 (code block triad): {len(findings2)}")
print(f"findings3 (inline backtick): {len(findings3)}")
print(f"findings4 (trailing comment): {len(findings4)}")

assert len(findings1) == 0, f"Expected 0 findings in code block, got {len(findings1)}"
assert len(findings2) == 0, f"Expected 0 findings in code block triad, got {len(findings2)}"
assert len(findings3) == 0, f"Expected 0 findings in inline backtick, got {len(findings3)}"
assert len(findings4) == 0, f"Expected 0 findings in trailing comment, got {len(findings4)}"

print("SUCCESS: All 4 false positive gaps are completely resolved!")
