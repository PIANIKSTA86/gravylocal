import sys
from pathlib import Path

# Add scripts directory
target_script = Path(r"C:\Users\JULIAN\.gemini\config\skills\human-interface-design\scripts")
sys.path.insert(0, str(target_script))
import audit_copy

lex = audit_copy.get_compiled_lexicon("all")
forms = audit_copy.get_compiled_formulas("all")

print("--- ADVERSARIAL PROBE START ---")

# Test 1: Uppercase accent in markdown heading
cnt1, f1 = audit_copy.audit_file_content("# SUMÉRGETE EN EL FLUJO", lex, forms, "test.md")
print("Test 1 (Uppercase accent in heading):", len(f1), [f["matched_text"] for f in f1])

# Test 2: Multiline HTML tag with attribute on newline
multiline_html = "<button\n    data-action=\"unleash\"\n    class=\"primary\">\n    Click here\n</button>"
cnt2, f2 = audit_copy.audit_file_content(multiline_html, lex, forms, "test.html")
print("Test 2 (Multiline HTML attribute):", len(f2), [f["matched_text"] for f in f2])

# Test 3: International punctuation «unleash» and ¿desatar?
guillemets = "«unleash» y ¿desatar?"
cnt3, f3 = audit_copy.audit_file_content(guillemets, lex, forms, "test.txt")
print("Test 3 (Punctuation bounds):", len(f3), [f["matched_text"] for f in f3])

# Test 4: Indented markdown heading
indented_heading = "  ###   Unleash your workflow"
cnt4, f4 = audit_copy.audit_file_content(indented_heading, lex, forms, "test.md")
print("Test 4 (Indented heading):", len(f4), [f["matched_text"] for f in f4])

# Test 5: Triad in markdown list
triad_md = """
- Boost your conversion rates today.
- Automate your recurring workflows quickly.
- Simplify your data pipelines now.
"""
cnt5, f5 = audit_copy.audit_file_content(triad_md, lex, forms, "test.md")
triads = [f for f in f5 if f["category"] == "Triad Parallelism"]
print("Test 5 (Markdown triad):", len(triads))

# Test 6: Python comment in .py file
py_comment = "# Unleash the dragon\nx = 1\n"
cnt6, f6 = audit_copy.audit_file_content(py_comment, lex, forms, "test.py")
print("Test 6 (Python comment in .py skipped):", len(f6), [f["matched_text"] for f in f6])

# Test 7: Multi-line CSS comment
css_comment = "/*\n * Unleash\n */\nbody { color: red; }\n"
cnt7, f7 = audit_copy.audit_file_content(css_comment, lex, forms, "test.css")
print("Test 7 (Multiline CSS comment):", len(f7), [f["matched_text"] for f in f7])

# Test 8: Trailing ATX heading hashes
trailing_hashes = "## Unleash Your Power ##\n"
cnt8, f8 = audit_copy.audit_file_content(trailing_hashes, lex, forms, "test.md")
print("Test 8 (Trailing ATX heading hashes):", len(f8), [f["matched_text"] for f in f8])

print("--- ADVERSARIAL PROBE END ---")
