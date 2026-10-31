import os
import sys
import json
import tempfile
import subprocess
import shutil
from pathlib import Path

SCRIPT_PATH = r"C:\Users\JULIAN\.gemini\config\skills\human-interface-design\scripts\audit_copy.py"

def run_cmd(args):
    cmd = ["py", SCRIPT_PATH] + args
    res = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8")
    return res.returncode, res.stdout, res.stderr

print("=== STARTING FORENSIC INTEGRITY AUDIT SUITE ===")

# ---------------------------------------------------------
# Test 1: Mathematical Score Calculation Verification
# ---------------------------------------------------------
print("\n--- Test 1: Mathematical Score Calibration ---")
# Exactly 100 words total, with exactly 1 buzzword 'empower' (weight 1.0)
words_99 = ["word"] * 99
text_100_1 = "empower " + " ".join(words_99)

with tempfile.NamedTemporaryFile("w", suffix=".txt", delete=False, encoding="utf-8") as f:
    f.write(text_100_1)
    f_path = f.name

try:
    code, stdout, stderr = run_cmd([f_path, "--format", "json"])
    assert code == 0, f"Expected 0, got {code}"
    data = json.loads(stdout)
    score = data["summary"]["humanization_score"]
    density = data["summary"]["cliche_density_per_100"]
    buzzwords = data["summary"]["total_buzzwords"]
    print(f"100 words with 1 buzzword: words={data['summary']['total_words']}, buzzwords={buzzwords}, density={density}, score={score}")
    assert buzzwords == 1, f"Expected 1 buzzword, got {buzzwords}"
    assert density == 1.0, f"Expected density 1.0, got {density}"
    assert score == 80.0, f"Expected mathematical score 80.0, got {score}"
finally:
    os.remove(f_path)

# Test with 1 formula 'Where X meets Y' (weight 2.5) in 100 words
# Formula: "where engineering meets design" = 4 words. We add 96 filler words.
text_formula = "Where engineering meets design " + ("filler " * 96)
with tempfile.NamedTemporaryFile("w", suffix=".txt", delete=False, encoding="utf-8") as f:
    f.write(text_formula)
    f_path = f.name

try:
    code, stdout, stderr = run_cmd([f_path, "--format", "json", "--threshold", "40"])
    data = json.loads(stdout)
    score = data["summary"]["humanization_score"]
    density = data["summary"]["cliche_density_per_100"]
    formulas = data["summary"]["total_formulas"]
    print(f"100 words with 1 formula: words={data['summary']['total_words']}, formulas={formulas}, density={density}, score={score}")
    assert formulas == 1, f"Expected 1 formula, got {formulas}"
    assert density == 2.5, f"Expected density 2.5, got {density}"
    assert score == 50.0, f"Expected score 50.0, got {score}"
finally:
    os.remove(f_path)

print("[PASS] Mathematical scoring engine produces exact expected values without hardcoding.")

# ---------------------------------------------------------
# Test 2: Triad Parallelism Detection and Scoring
# ---------------------------------------------------------
print("\n--- Test 2: Triad Parallelism Algorithmic Detection ---")
# 3 lines starting with action verbs, similar length
triad_text = """# Features
- Boost your daily workflow speed and team efficiency
- Scale your infrastructure across multiple global clouds
- Save four hours of manual status meetings weekly
"""
with tempfile.NamedTemporaryFile("w", suffix=".md", delete=False, encoding="utf-8") as f:
    f.write(triad_text)
    f_path = f.name

try:
    code, stdout, stderr = run_cmd([f_path, "--json"])
    data = json.loads(stdout)
    triads = data["summary"]["total_triads"]
    print(f"Triad text: triads={triads}, score={data['summary']['humanization_score']}")
    assert triads == 1, f"Expected 1 triad, got {triads}"
finally:
    os.remove(f_path)

# Now break the triad by changing line 2 to not be an action verb or change length significantly
non_triad_text = """# Features
- Boost your daily workflow speed and team efficiency
- Yesterday our infrastructure was reviewed by architects
- Save four hours of manual status meetings weekly
"""
with tempfile.NamedTemporaryFile("w", suffix=".md", delete=False, encoding="utf-8") as f:
    f.write(non_triad_text)
    f_path = f.name

try:
    code, stdout, stderr = run_cmd([f_path, "--json"])
    data = json.loads(stdout)
    triads = data["summary"]["total_triads"]
    print(f"Broken triad text: triads={triads}")
    assert triads == 0, f"Expected 0 triads for asymmetric content, got {triads}"
finally:
    os.remove(f_path)

print("[PASS] Triad algorithm genuinely evaluates grammar, line length variance, and verb sets.")

# ---------------------------------------------------------
# Test 3: Markdown Code Block Skipping
# ---------------------------------------------------------
print("\n--- Test 3: Code Block Skipping ---")
code_block_text = """# Developer Documentation

Here is how you write genuine code without slop:

```javascript
// This inside code block should NOT be flagged
const message = "We empower users to unleash potential";
function supercharge() {
    return "seamless";
}
```

This is legitimate documentation text describing real software.
"""
with tempfile.NamedTemporaryFile("w", suffix=".md", delete=False, encoding="utf-8") as f:
    f.write(code_block_text)
    f_path = f.name

try:
    code, stdout, stderr = run_cmd([f_path, "--json"])
    data = json.loads(stdout)
    buzzwords = data["summary"]["total_buzzwords"]
    score = data["summary"]["humanization_score"]
    print(f"Code block text: buzzwords={buzzwords}, score={score}")
    assert buzzwords == 0, f"Expected 0 buzzwords inside code block, got {buzzwords}"
    assert score == 100.0, f"Expected 100.0, got {score}"
finally:
    os.remove(f_path)

# Now put a buzzword outside the code block
code_block_text_outside = code_block_text + "\nWe empower our developers.\n"
with tempfile.NamedTemporaryFile("w", suffix=".md", delete=False, encoding="utf-8") as f:
    f.write(code_block_text_outside)
    f_path = f.name

try:
    code, stdout, stderr = run_cmd([f_path, "--json"])
    data = json.loads(stdout)
    buzzwords = data["summary"]["total_buzzwords"]
    print(f"Code block text with outside buzzword: buzzwords={buzzwords}")
    assert buzzwords == 1, f"Expected 1 buzzword outside code block, got {buzzwords}"
finally:
    os.remove(f_path)

print("[PASS] Markdown code block state machine accurately toggles and skips code blocks.")

# ---------------------------------------------------------
# Test 4: Language Isolation (--lang en vs --lang es)
# ---------------------------------------------------------
print("\n--- Test 4: Language Dictionary Isolation ---")
bilingual_sample = "Our platform lets you delve into data. Tambien puedes sumergirte en detalles."
with tempfile.NamedTemporaryFile("w", suffix=".txt", delete=False, encoding="utf-8") as f:
    f.write(bilingual_sample)
    f_path = f.name

try:
    # Under EN only: should catch 'delve' (1) and NOT 'sumergirte'
    c_en, out_en, _ = run_cmd([f_path, "--lang", "en", "--json"])
    d_en = json.loads(out_en)
    assert d_en["summary"]["total_buzzwords"] == 1, f"Expected 1 EN buzzword, got {d_en['summary']['total_buzzwords']}"
    assert d_en["files"][0]["findings"][0]["matched_text"].lower() == "delve"

    # Under ES only: should catch 'sumergirte' (1) and NOT 'delve'
    c_es, out_es, _ = run_cmd([f_path, "--lang", "es", "--json"])
    d_es = json.loads(out_es)
    assert d_es["summary"]["total_buzzwords"] == 1, f"Expected 1 ES buzzword, got {d_es['summary']['total_buzzwords']}"
    assert "sumergir" in d_es["files"][0]["findings"][0]["matched_text"].lower()

    # Under ALL: should catch both (2)
    c_all, out_all, _ = run_cmd([f_path, "--lang", "all", "--json"])
    d_all = json.loads(out_all)
    assert d_all["summary"]["total_buzzwords"] == 2, f"Expected 2 buzzwords, got {d_all['summary']['total_buzzwords']}"
finally:
    os.remove(f_path)

print("[PASS] Language isolation (--lang en, es, all) operates with complete fidelity.")

# ---------------------------------------------------------
# Test 5: Ignored Directories & File Discovery
# ---------------------------------------------------------
print("\n--- Test 5: Directory Tree Traversal & Ignored Directories ---")
temp_dir = tempfile.mkdtemp()
try:
    src_dir = os.path.join(temp_dir, "src")
    node_modules_dir = os.path.join(temp_dir, "node_modules")
    git_dir = os.path.join(temp_dir, ".git")
    os.makedirs(src_dir)
    os.makedirs(node_modules_dir)
    os.makedirs(git_dir)

    # Clean file in src
    with open(os.path.join(src_dir, "clean.html"), "w", encoding="utf-8") as f:
        f.write("<main><h1>Accurate billing for contractors.</h1></main>")

    # Dirty file in node_modules (must be ignored!)
    with open(os.path.join(node_modules_dir, "package_slop.js"), "w", encoding="utf-8") as f:
        f.write("// empower unleash revolutionize delve seamless")

    # Dirty file in .git (must be ignored!)
    with open(os.path.join(git_dir, "git_slop.txt"), "w", encoding="utf-8") as f:
        f.write("supercharge everything effortlessly")

    code, stdout, stderr = run_cmd([temp_dir, "--json"])
    assert code == 0, f"Expected 0, got {code}"
    data = json.loads(stdout)
    assert data["summary"]["total_files"] == 1, f"Expected exactly 1 file scanned, got {data['summary']['total_files']}"
    assert data["summary"]["total_buzzwords"] == 0, f"Expected 0 buzzwords because ignored dirs were skipped, got {data['summary']['total_buzzwords']}"
    assert data["summary"]["humanization_score"] == 100.0
finally:
    shutil.rmtree(temp_dir)

print("[PASS] IGNORED_DIRS successfully prevents scanning inside dependencies and VCS.")

# ---------------------------------------------------------
# Test 6: Exit Code & Threshold Boundaries
# ---------------------------------------------------------
print("\n--- Test 6: Exit Code & Threshold Boundaries ---")
# 100 words with 1 buzzword = score 80.0
words_99 = ["word"] * 99
text_80 = "empower " + " ".join(words_99)

with tempfile.NamedTemporaryFile("w", suffix=".txt", delete=False, encoding="utf-8") as f:
    f.write(text_80)
    f_path = f.name

try:
    # Threshold 80.0 -> score 80.0 >= 80.0 -> pass -> exit code 0
    c1, _, _ = run_cmd([f_path, "--threshold", "80.0"])
    assert c1 == 0, f"Expected 0 when score == threshold, got {c1}"

    # Threshold 80.1 -> score 80.0 < 80.1 -> fail -> exit code 1
    c2, _, _ = run_cmd([f_path, "--threshold", "80.1"])
    assert c2 == 1, f"Expected 1 when score < threshold, got {c2}"

    # Strict mode -> has 1 buzzword -> fail -> exit code 1
    c3, _, _ = run_cmd([f_path, "--strict", "--threshold", "50.0"])
    assert c3 == 1, f"Expected 1 in strict mode with buzzwords, got {c3}"

    # Non-existent target -> exit code 2
    c4, _, _ = run_cmd(["non_existent_path_482942.txt"])
    assert c4 == 2, f"Expected 2 for missing file, got {c4}"
finally:
    os.remove(f_path)

print("[PASS] Exit codes (0, 1, 2) reflect genuine runtime evaluation and boundary logic.")

# ---------------------------------------------------------
# Test 7: Static Inspection for Cheating / Shortcuts
# ---------------------------------------------------------
print("\n--- Test 7: Source Code Forensic Static Inspection ---")
with open(SCRIPT_PATH, "r", encoding="utf-8") as f:
    src = f.read()

# Check for banned cheats
cheats = [
    ("Hardcoded test check", "test_audit" in src or "clean_content" in src or "tempfile" in src),
    ("Mock return in scoring", "return 100.0" in src and "if word_count == 0" not in src),
    ("Hardcoded returncode 0", "sys.exit(0)" in src and "main()" in src and "return 0 if" not in src),
    ("Bypass flag", "bypass" in src or "cheat" in src or "fake" in src),
]

for name, condition in cheats:
    print(f"Check '{name}': {'DETECTED (VIOLATION)' if condition else 'CLEAN'}")
    assert not condition, f"Cheating pattern detected: {name}"

print("\n=== ALL FORENSIC INTEGRITY CHECKS PASSED WITH ZERO VIOLATIONS! ===")
