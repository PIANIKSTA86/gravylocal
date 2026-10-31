import subprocess
import json
import tempfile
import os
import sys

script_path = r"C:\Users\JULIAN\.gemini\config\skills\human-interface-design\scripts\audit_copy.py"

print("=========================================================")
print("ADVERSARIAL STRESS TEST SUITE FOR audit_copy.py")
print("=========================================================")

results = []

def record(test_name, status, details):
    results.append({"name": test_name, "status": status, "details": details})
    print(f"[{status}] {test_name}: {details}")

# 1. Syntax check
res = subprocess.run(["py", "-m", "py_compile", script_path], capture_output=True, text=True)
if res.returncode == 0:
    record("Python Syntax & Compilation", "PASS", "py_compile succeeded without error")
else:
    record("Python Syntax & Compilation", "FAIL", res.stderr)

# 2. Dependency check
with open(script_path, "r", encoding="utf-8") as f:
    lines = f.readlines()
imports = [l.strip() for l in lines if l.startswith("import ") or l.startswith("from ")]
std_modules = {"sys", "os", "re", "json", "argparse", "pathlib", "typing"}
non_std = []
for imp in imports:
    mod = imp.split()[1].split(".")[0]
    if mod not in std_modules:
        non_std.append(mod)
if not non_std:
    record("Zero External Dependencies", "PASS", f"All imports are stdlib: {imports}")
else:
    record("Zero External Dependencies", "FAIL", f"Found non-std modules: {non_std}")

# 3. Help and CLI options
res = subprocess.run(["py", script_path, "--help"], capture_output=True, text=True, encoding="utf-8")
if res.returncode == 0 and "--threshold" in res.stdout and "--lang" in res.stdout and "--format" in res.stdout:
    record("CLI Help Output", "PASS", "Return code 0 with expected flags documented")
else:
    record("CLI Help Output", "FAIL", f"Return code {res.returncode}")

# 4. Exit Code 2 on missing target
res = subprocess.run(["py", script_path, "non_existent_path_xyz123.txt"], capture_output=True, text=True, encoding="utf-8")
if res.returncode == 2:
    record("Exit Code 2 on Missing File", "PASS", f"Returned code 2 as expected: {res.stderr.strip()}")
else:
    record("Exit Code 2 on Missing File", "FAIL", f"Returned code {res.returncode}")

# 5. Exit Code 2 on invalid arguments
res = subprocess.run(["py", script_path, "--invalid-flag"], capture_output=True, text=True, encoding="utf-8")
if res.returncode == 2:
    record("Exit Code 2 on Invalid Arg", "PASS", f"Returned code 2 as expected: {res.stderr.strip()[:100]}")
else:
    record("Exit Code 2 on Invalid Arg", "FAIL", f"Returned code {res.returncode}")

# 6. JSON output mode (--format json and --json)
with tempfile.NamedTemporaryFile("w", delete=False, suffix=".md", encoding="utf-8") as f:
    f.write("# Clean Document\nThis is a simple text with no slop words.\n")
    clean_p = f.name

res1 = subprocess.run(["py", script_path, clean_p, "--format", "json"], capture_output=True, text=True, encoding="utf-8")
res2 = subprocess.run(["py", script_path, clean_p, "--json"], capture_output=True, text=True, encoding="utf-8")
os.remove(clean_p)

try:
    d1 = json.loads(res1.stdout)
    d2 = json.loads(res2.stdout)
    if "summary" in d1 and "files" in d1 and d1["summary"]["humanization_score"] == 100.0:
        record("JSON Output Structure", "PASS", "Valid JSON payload with summary and files keys")
    else:
        record("JSON Output Structure", "FAIL", f"Missing keys or unexpected score: {d1}")
except Exception as e:
    record("JSON Output Structure", "FAIL", f"Failed to parse JSON: {e}")

# 7. Exit Code 0 on clean pass
if res1.returncode == 0:
    record("Exit Code 0 on Clean Pass", "PASS", "Return code 0 on score >= threshold")
else:
    record("Exit Code 0 on Clean Pass", "FAIL", f"Returned code {res1.returncode}")

# 8. Exit Code 1 on fail threshold
with tempfile.NamedTemporaryFile("w", delete=False, suffix=".md", encoding="utf-8") as f:
    f.write("We empower users to seamlessly supercharge and unleash their workflows with cutting-edge bespoke synergy.\n")
    slop_p = f.name
res_slop = subprocess.run(["py", script_path, slop_p, "--threshold", "80"], capture_output=True, text=True, encoding="utf-8")
os.remove(slop_p)
if res_slop.returncode == 1:
    record("Exit Code 1 on Fail Threshold", "PASS", "Return code 1 when score < threshold")
else:
    record("Exit Code 1 on Fail Threshold", "FAIL", f"Returned code {res_slop.returncode}")

# 9. Hyphenated CSS class false-positive check: unleash-btn
with tempfile.NamedTemporaryFile("w", delete=False, suffix=".html", encoding="utf-8") as f:
    f.write('<button class="unleash-btn">Action</button>\n')
    css1_p = f.name
res_css1 = subprocess.run(["py", script_path, css1_p, "--json"], capture_output=True, text=True, encoding="utf-8")
os.remove(css1_p)
d_css1 = json.loads(res_css1.stdout)
if d_css1["summary"]["total_buzzwords"] == 0:
    record("CSS Class: unleash-btn", "PASS", "No buzzwords flagged for unleash-btn")
else:
    record("CSS Class: unleash-btn", "FAIL", f"Flagged: {d_css1['summary']['total_buzzwords']} buzzwords")

# 10. Hyphenated CSS class with alternation: btn-frictionless / frictionless-wrapper
with tempfile.NamedTemporaryFile("w", delete=False, suffix=".html", encoding="utf-8") as f:
    f.write('<button class="btn-frictionless">Action</button>\n')
    css2_p = f.name
res_css2 = subprocess.run(["py", script_path, css2_p, "--json"], capture_output=True, text=True, encoding="utf-8")
os.remove(css2_p)
d_css2 = json.loads(res_css2.stdout)
if d_css2["summary"]["total_buzzwords"] == 0:
    record("CSS Class: btn-frictionless", "PASS", "No buzzwords flagged for btn-frictionless")
else:
    record("CSS Class: btn-frictionless", "FAIL", f"FALSE POSITIVE: Flagged '{d_css2['files'][0]['findings'][0]['matched_text']}' in class name!")

# 11. Hyphenated CSS class with Spanish alternation: btn-sumergete
with tempfile.NamedTemporaryFile("w", delete=False, suffix=".html", encoding="utf-8") as f:
    f.write('<button class="btn-sumergete">Accion</button>\n')
    css3_p = f.name
res_css3 = subprocess.run(["py", script_path, css3_p, "--json"], capture_output=True, text=True, encoding="utf-8")
os.remove(css3_p)
d_css3 = json.loads(res_css3.stdout)
if d_css3["summary"]["total_buzzwords"] == 0:
    record("CSS Class: btn-sumergete", "PASS", "No buzzwords flagged for btn-sumergete")
else:
    record("CSS Class: btn-sumergete", "FAIL", f"FALSE POSITIVE: Flagged '{d_css3['files'][0]['findings'][0]['matched_text']}' in class name!")

# 12. Markdown Heading Slop Detection: # Unleash Your Potential
with tempfile.NamedTemporaryFile("w", delete=False, suffix=".md", encoding="utf-8") as f:
    f.write('# Unleash Your Potential\nSome normal body text here.\n')
    md_h_p = f.name
res_md_h = subprocess.run(["py", script_path, md_h_p, "--json"], capture_output=True, text=True, encoding="utf-8")
os.remove(md_h_p)
d_md_h = json.loads(res_md_h.stdout)
if d_md_h["summary"]["total_buzzwords"] == 1:
    record("Markdown Heading Detection", "PASS", "Detected buzzword 'Unleash' in Markdown H1")
else:
    record("Markdown Heading Detection", "FAIL", f"MISSED SLOP: Found {d_md_h['summary']['total_buzzwords']} buzzwords (heading skipped as comment)")

# 13. Spanish Diacritics and Unicode Output
with tempfile.NamedTemporaryFile("w", delete=False, suffix=".md", encoding="utf-8") as f:
    f.write('Enfoque holístico y visión de vanguardia sin precedentes.\n')
    es_p = f.name
res_es = subprocess.run(["py", script_path, es_p, "--format", "text"], capture_output=True, text=True, encoding="utf-8")
os.remove(es_p)
if res_es.returncode in (0, 1) and "holístico" in res_es.stdout or "hol" in res_es.stdout:
    record("Spanish Diacritics Terminal Output", "PASS", "No UnicodeEncodeError on stdout")
else:
    record("Spanish Diacritics Terminal Output", "FAIL", f"Stderr: {res_es.stderr}")

# 14. Empty file handling
with tempfile.NamedTemporaryFile("w", delete=False, suffix=".md", encoding="utf-8") as f:
    f.write('')
    empty_p = f.name
res_empty = subprocess.run(["py", script_path, empty_p, "--json"], capture_output=True, text=True, encoding="utf-8")
os.remove(empty_p)
d_empty = json.loads(res_empty.stdout)
if res_empty.returncode == 0 and d_empty["summary"]["humanization_score"] == 100.0:
    record("Empty File Handling", "PASS", "Empty file handled gracefully with score 100.0 and exit code 0")
else:
    record("Empty File Handling", "FAIL", f"Code {res_empty.returncode}, score {d_empty['summary']['humanization_score']}")

# 15. Triad Parallelism Detection
triad_text = """- Accelerate your development cycle
- Optimize your resource allocation
- Maximize your revenue growth
"""
with tempfile.NamedTemporaryFile("w", delete=False, suffix=".md", encoding="utf-8") as f:
    f.write(triad_text)
    triad_p = f.name
res_triad = subprocess.run(["py", script_path, triad_p, "--json"], capture_output=True, text=True, encoding="utf-8")
os.remove(triad_p)
d_triad = json.loads(res_triad.stdout)
if d_triad["summary"]["total_triads"] >= 1:
    record("Triad Parallelism Detection", "PASS", f"Detected {d_triad['summary']['total_triads']} triad(s)")
else:
    record("Triad Parallelism Detection", "FAIL", "Failed to detect 3-action-verb triad")

# 16. Formula Detection
formula_text = "Where speed meets simplicity.\nSay goodbye to spreadsheets, say hello to automated insights.\n"
with tempfile.NamedTemporaryFile("w", delete=False, suffix=".md", encoding="utf-8") as f:
    f.write(formula_text)
    formula_p = f.name
res_formula = subprocess.run(["py", script_path, formula_p, "--json"], capture_output=True, text=True, encoding="utf-8")
os.remove(formula_p)
d_formula = json.loads(res_formula.stdout)
if d_formula["summary"]["total_formulas"] >= 2:
    record("Structural Formula Detection", "PASS", f"Detected {d_formula['summary']['total_formulas']} formulas")
else:
    record("Structural Formula Detection", "FAIL", f"Expected >=2 formulas, got {d_formula['summary']['total_formulas']}")

print("=========================================================")
print("SUMMARY OF FAILURES:")
failures = [r for r in results if r["status"] == "FAIL"]
for f in failures:
    print(f"  - {f['name']}: {f['details']}")
print(f"Total Tests: {len(results)}, Passed: {len(results) - len(failures)}, Failed: {len(failures)}")
