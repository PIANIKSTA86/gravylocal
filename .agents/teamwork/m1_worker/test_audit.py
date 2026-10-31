import subprocess
import json
import tempfile
import os
import sys

script_path = r"C:\Users\JULIAN\.gemini\config\skills\human-interface-design\scripts\audit_copy.py"

print(f"Testing script: {script_path}")

# Test 1: Clean file should score 100 and exit 0
clean_content = """# Product Documentation
Our team built a fast markdown editor. 
It opens in 200ms and saves files locally without tracking user data.
"""

with tempfile.NamedTemporaryFile("w", delete=False, suffix=".md", encoding="utf-8") as f:
    f.write(clean_content)
    clean_file = f.name

res = subprocess.run(["py", script_path, clean_file, "--format", "json"], capture_output=True, text=True, encoding="utf-8")
print("Clean test returncode:", res.returncode)
assert res.returncode == 0, f"Expected 0, got {res.returncode}: {res.stderr}"
data = json.loads(res.stdout)
assert data["summary"]["humanization_score"] == 100.0, f"Expected 100, got {data['summary']['humanization_score']}"
assert data["summary"]["passed"] is True
print("Test 1 Passed: Clean file = 100.0 (Tier 1)")

# Test 2: Hyphenated CSS class names must NOT trigger false positives
css_content = """<div class="unleash-btn seamless-flow empower-user">
  <p>Direct communication without extra meetings.</p>
</div>
"""

with tempfile.NamedTemporaryFile("w", delete=False, suffix=".html", encoding="utf-8") as f:
    f.write(css_content)
    css_file = f.name

res = subprocess.run(["py", script_path, css_file, "--format", "json"], capture_output=True, text=True, encoding="utf-8")
print("CSS test returncode:", res.returncode)
assert res.returncode == 0, f"Expected 0, got {res.returncode}: {res.stderr}"
data = json.loads(res.stdout)
assert data["summary"]["total_buzzwords"] == 0, f"Expected 0 buzzwords, got {data['summary']['total_buzzwords']}"
assert data["summary"]["humanization_score"] == 100.0
print("Test 2 Passed: Hyphenated CSS class false-positive immunity verified")

# Test 3: Slop file with English & Spanish buzzwords + formula + triad
slop_content = """# Welcome to the future of cloud computing
We empower teams to seamlessly unleash the full power of their data.
Our platform lets you delve into a rich tapestry of cutting-edge solutions.
En el mundo acelerado de hoy, desata tu creatividad con un enfoque holistico sin friccion.
- Boost your daily workflow speed
- Scale your team across borders
- Save four hours every week
"""

with tempfile.NamedTemporaryFile("w", delete=False, suffix=".md", encoding="utf-8") as f:
    f.write(slop_content)
    slop_file = f.name

res_text = subprocess.run(["py", script_path, slop_file, "--threshold", "80"], capture_output=True, text=True, encoding="utf-8")
print("Slop text returncode:", res_text.returncode)
assert res_text.returncode == 1, f"Expected exit code 1 for slop, got {res_text.returncode}"
assert "HUMAN INTERFACE DESIGN - COPY & AI SLOP AUDIT REPORT" in res_text.stdout

res_json = subprocess.run(["py", script_path, slop_file, "--json"], capture_output=True, text=True, encoding="utf-8")
data = json.loads(res_json.stdout)
print("Slop Score:", data["summary"]["humanization_score"])
print("Total Buzzwords:", data["summary"]["total_buzzwords"])
print("Total Formulas:", data["summary"]["total_formulas"])
print("Total Triads:", data["summary"]["total_triads"])
print("Tier:", data["summary"]["quality_tier"])
assert data["summary"]["total_buzzwords"] >= 6, f"Expected >=6 buzzwords, got {data['summary']['total_buzzwords']}"
assert data["summary"]["total_formulas"] >= 2, f"Expected >=2 formulas, got {data['summary']['total_formulas']}"
assert data["summary"]["total_triads"] >= 1, f"Expected >=1 triad, got {data['summary']['total_triads']}"
assert data["summary"]["passed"] is False
assert data["summary"]["humanization_score"] < 80.0
print("Test 3 Passed: Slop detection, formula detection, triad detection and exit code 1 verified")

# Test 4: Missing target path returns exit code 2
res_missing = subprocess.run(["py", script_path, "non_existent_file_xyz.txt"], capture_output=True, text=True, encoding="utf-8")
print("Missing file returncode:", res_missing.returncode)
assert res_missing.returncode == 2, f"Expected 2, got {res_missing.returncode}"
print("Test 4 Passed: Missing file returns exit code 2")

# Test 5: Strict mode fails on single buzzword even if score >= threshold
single_slop = """# Overview
We empower users with clear tools.
""" + ("word " * 100) # 100 extra words so density is low

with tempfile.NamedTemporaryFile("w", delete=False, suffix=".md", encoding="utf-8") as f:
    f.write(single_slop)
    strict_file = f.name

# Normal mode should pass (score ~ 98.0 >= 80.0)
res_normal = subprocess.run(["py", script_path, strict_file, "--threshold", "80"], capture_output=True, text=True, encoding="utf-8")
assert res_normal.returncode == 0, f"Expected 0 in normal mode, got {res_normal.returncode}"

# Strict mode should fail (exit code 1)
res_strict = subprocess.run(["py", script_path, strict_file, "--strict"], capture_output=True, text=True, encoding="utf-8")
assert res_strict.returncode == 1, f"Expected 1 in strict mode, got {res_strict.returncode}"
print("Test 5 Passed: Strict mode flag verified")

# Cleanup
for p in [clean_file, css_file, slop_file, strict_file]:
    try:
        os.remove(p)
    except:
        pass

print("\n>>> ALL 5 SELF-TEST SUITES PASSED FLAWLESSLY! <<<")
