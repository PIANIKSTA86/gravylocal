import sys
import os
import re
import tempfile
import json
import subprocess
from pathlib import Path

# Path to audit_copy.py
AUDIT_SCRIPT = r"C:\Users\JULIAN\.gemini\config\skills\human-interface-design\scripts\audit_copy.py"

def run_audit(file_path: str, extra_args=None) -> tuple[int, dict, str, str]:
    cmd = [sys.executable, AUDIT_SCRIPT, file_path, "--format", "json"]
    if extra_args:
        cmd.extend(extra_args)
    proc = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8")
    parsed_json = {}
    if proc.stdout.strip():
        try:
            parsed_json = json.loads(proc.stdout)
        except json.JSONDecodeError:
            pass
    return proc.returncode, parsed_json, proc.stdout, proc.stderr

def run_tests():
    passed = 0
    failed = 0
    results = []

    def check(name: str, cond: bool, msg: str = ""):
        nonlocal passed, failed
        if cond:
            passed += 1
            results.append((name, "PASS", msg))
            print(f"[PASS] {name}: {msg}")
        else:
            failed += 1
            results.append((name, "FAIL", msg))
            print(f"[FAIL] {name}: {msg}")

    print("=================================================================")
    print("FORENSIC INDEPENDENT AUDITOR ADVERSARIAL STRESS TEST")
    print("=================================================================")

    # Test 1: HTML Tag and Attribute Immunity
    # Buzzwords inside tag attributes MUST NOT trigger findings, but clean content must pass.
    html_content = """<!DOCTYPE html>
<html>
<head>
    <link rel="stylesheet" href="#elevate">
    <style>
        .btn-frictionless { color: #f00; }
        .btn-sumergete { margin: 10px; }
        #unleash-id { display: flex; }
    </style>
</head>
<body>
    <div data-slop="unleash" id="elevate" class="supercharge-card">
        <a href="https://example.com/unleash/power" title="delve into nothing">
            This is honest human copy about simple direct tools.
        </a>
    </div>
</body>
</html>"""
    with tempfile.NamedTemporaryFile("w", suffix=".html", delete=False, encoding="utf-8") as f:
        f.write(html_content)
        tmp_html = f.name

    try:
        code, data, out, err = run_audit(tmp_html)
        buzzwords = data.get("summary", {}).get("total_buzzwords", -1)
        score = data.get("summary", {}).get("humanization_score", 0.0)
        check("HTML_Attributes_Immunity", code == 0 and buzzwords == 0 and score == 100.0,
              f"Buzzwords: {buzzwords}, Score: {score}")
    finally:
        os.remove(tmp_html)

    # Test 2: True Positives Inside HTML Tags
    # Buzzwords inside HTML text nodes MUST be detected accurately.
    html_tp_content = """<div class="card">
    <p>We <strong>unleash</strong> real value for your team.</p>
    <span>An <em>effortless</em> workflow awaits.</span>
</div>"""
    with tempfile.NamedTemporaryFile("w", suffix=".html", delete=False, encoding="utf-8") as f:
        f.write(html_tp_content)
        tmp_html_tp = f.name

    try:
        code, data, out, err = run_audit(tmp_html_tp)
        buzzwords = data.get("summary", {}).get("total_buzzwords", -1)
        findings = data.get("files", [{}])[0].get("findings", [])
        matched = [fi.get("matched_text") for fi in findings]
        check("HTML_Text_Nodes_Detection", buzzwords == 2 and "unleash" in matched and "effortless" in matched,
              f"Detected buzzwords: {matched}")
    finally:
        os.remove(tmp_html_tp)

    # Test 3: Markdown Headings All Levels (H1 to H6) + Trailing Closing Markers
    # Headings MUST be scanned, and buzzwords inside them MUST be flagged.
    md_headings_content = """# Unleash your project
## Elevate your metrics
### Supercharge your database
#### Revolutionize your workflow
##### Maximize your team
###### Delve into data
## Tapestry of ideas ##
"""
    with tempfile.NamedTemporaryFile("w", suffix=".md", delete=False, encoding="utf-8") as f:
        f.write(md_headings_content)
        tmp_md = f.name

    try:
        code, data, out, err = run_audit(tmp_md)
        buzzwords = data.get("summary", {}).get("total_buzzwords", -1)
        check("Markdown_Headings_All_Levels", code == 1 and buzzwords == 7,
              f"Detected {buzzwords}/7 buzzwords in headings across H1-H6 and closing ##")
    finally:
        os.remove(tmp_md)

    # Test 4: Code Comments in Non-Markdown Files
    # Comments starting with '#' in python files MUST be ignored.
    py_comment_content = """# Unleash the dragon in comments
# Elevate everything in comments
def build_tool():
    # Supercharge the engine
    return "clean implementation"
"""
    with tempfile.NamedTemporaryFile("w", suffix=".js", delete=False, encoding="utf-8") as f:
        f.write(py_comment_content)
        tmp_py = f.name

    try:
        code, data, out, err = run_audit(tmp_py)
        buzzwords = data.get("summary", {}).get("total_buzzwords", -1)
        score = data.get("summary", {}).get("humanization_score", 0.0)
        check("Non_Markdown_Hash_Comments_Ignored", code == 0 and buzzwords == 0 and score == 100.0,
              f"Buzzwords: {buzzwords}, Score: {score}")
    finally:
        os.remove(tmp_py)

    # Test 5: String Literals in Non-Markdown Files
    # Buzzwords inside string literals in code MUST be detected.
    py_string_content = """function getCopy() {
    return "Unleash your productivity today";
}
"""
    with tempfile.NamedTemporaryFile("w", suffix=".js", delete=False, encoding="utf-8") as f:
        f.write(py_string_content)
        tmp_js = f.name

    try:
        code, data, out, err = run_audit(tmp_js)
        buzzwords = data.get("summary", {}).get("total_buzzwords", -1)
        check("Code_String_Literals_Detected", buzzwords == 1,
              f"Detected {buzzwords} buzzword in JS string literal")
    finally:
        os.remove(tmp_js)

    # Test 6: Spanish Diacritics and Inverted Punctuation
    es_content = """¿Desata todo tu potencial al potenciar hoy mismo?
¡Sumérgete en una experiencia única!
Un enfoque holístico donde no busques más.
"""
    with tempfile.NamedTemporaryFile("w", suffix=".txt", delete=False, encoding="utf-8") as f:
        f.write(es_content)
        tmp_es = f.name

    try:
        code, data, out, err = run_audit(tmp_es, extra_args=["--lang", "es"])
        buzzwords = data.get("summary", {}).get("total_buzzwords", -1)
        check("Spanish_Accents_Punctuation", buzzwords == 5,
              f"Detected {buzzwords}/5 Spanish buzzwords with inverted ¿ ¡ and accents")
    finally:
        os.remove(tmp_es)

    # Test 7: Alternation Boundary Checks (Hyphen & Hash Isolation)
    # Neither 'btn-frictionless' nor 'sumergete-action' nor 'friction-free-zone' should false positive
    # but standalone 'frictionless', 'sin fricción', 'friction-free' must trigger.
    compound_content = """<button class="btn-frictionless sumergete-btn elevate-box">
    A truly frictionless and seamless tool for daily use.
</button>"""
    with tempfile.NamedTemporaryFile("w", suffix=".html", delete=False, encoding="utf-8") as f:
        f.write(compound_content)
        tmp_comp = f.name

    try:
        code, data, out, err = run_audit(tmp_comp)
        buzzwords = data.get("summary", {}).get("total_buzzwords", -1)
        findings = data.get("files", [{}])[0].get("findings", [])
        matched = [fi.get("matched_text") for fi in findings]
        check("Alternation_Boundary_Isolation", buzzwords == 2 and "frictionless" in matched and "seamless" in matched,
              f"Detected: {matched} (class names correctly ignored)")
    finally:
        os.remove(tmp_comp)

    # Test 8: Random Filename Invariance (Verifying no hardcoded test file name checking)
    import uuid
    rand_name = f"random_prod_{uuid.uuid4().hex[:8]}.md"
    rand_path = os.path.join(tempfile.gettempdir(), rand_name)
    with open(rand_path, "w", encoding="utf-8") as f:
        f.write("# Elevate your workflow\nThis is a test of bespoke tools.")
    try:
        code, data, out, err = run_audit(rand_path)
        buzzwords = data.get("summary", {}).get("total_buzzwords", -1)
        check("Random_Filename_Invariance", buzzwords == 2,
              f"Random file {rand_name} correctly detected {buzzwords}/2 buzzwords without hardcoded filename dependence")
    finally:
        if os.path.exists(rand_path):
            os.remove(rand_path)

    # Test 9: Formula Recall Across Line Breaks & Punctuation
    formula_content = """In today's fast-paced world, speed matters.
Where creativity meets execution.
Welcome to the future of design.
Say goodbye to complexity, say hello to simplicity.
"""
    with tempfile.NamedTemporaryFile("w", suffix=".txt", delete=False, encoding="utf-8") as f:
        f.write(formula_content)
        tmp_form = f.name

    try:
        code, data, out, err = run_audit(tmp_form)
        formulas = data.get("summary", {}).get("total_formulas", -1)
        check("Formula_Recall_Multi", formulas == 4,
              f"Detected {formulas}/4 formulas")
    finally:
        os.remove(tmp_form)

    # Test 10: Triad Parallelism Precision
    triad_content = """Boost your team velocity with fast feedback.
Scale your operations with automated workflows.
Deliver exceptional value every single sprint.
"""
    with tempfile.NamedTemporaryFile("w", suffix=".txt", delete=False, encoding="utf-8") as f:
        f.write(triad_content)
        tmp_triad = f.name

    try:
        code, data, out, err = run_audit(tmp_triad)
        triads = data.get("summary", {}).get("total_triads", -1)
        check("Triad_Parallelism_Recall", triads == 1,
              f"Detected {triads}/1 triad")
    finally:
        os.remove(tmp_triad)

    print("=================================================================")
    print(f"RESULTS: {passed} PASSED, {failed} FAILED out of {passed + failed}")
    print("=================================================================")
    return failed == 0

if __name__ == "__main__":
    success = run_tests()
    sys.exit(0 if success else 1)
