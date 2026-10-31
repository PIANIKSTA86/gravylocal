#!/usr/bin/env python3
"""
Empirical Adversarial Verification & Stress Harness: Milestone 1 Iteration 2
Author: Challenger 2 (m1_iter2_challenger_2)
"""

import sys
import os
import re
import json
import subprocess
import tempfile
from pathlib import Path

SKILL_DIR = Path(r"C:\Users\JULIAN\.gemini\config\skills\human-interface-design")
SKILL_MD = SKILL_DIR / "SKILL.md"
AUDIT_SCRIPT = SKILL_DIR / "scripts" / "audit_copy.py"
CHALLENGER2_VERIFY = Path(r"c:\Users\JULIAN\Desktop\GravyLocalTABS\.agents\teamwork\m1_challenger_2\verify_skill_md.py")
E2E_RUNNER = Path(r"c:\Users\JULIAN\Desktop\GravyLocalTABS\.agents\teamwork\e2e_tests\run_tests.py")

test_results = []

def record(name: str, passed: bool, msg: str):
    icon = "PASS" if passed else "FAIL"
    test_results.append((name, passed, msg))
    print(f"[{icon}] {name}: {msg}")

def run_cmd(args):
    res = subprocess.run(args, capture_output=True, text=True, encoding="utf-8", errors="replace")
    return res.returncode, res.stdout, res.stderr

print("=" * 70)
print("RUNNING CHALLENGER 2 EMPIRICAL TEST BATTERY (M1 ITERATION 2)")
print("=" * 70)

# -------------------------------------------------------------
# 1. verify_skill_md.py Re-verification
# -------------------------------------------------------------
code, out, err = run_cmd([sys.executable, str(CHALLENGER2_VERIFY)])
passed_36 = ("Passed: 36 | Failed: 0" in out) and (code == 0)
record("Re-run verify_skill_md.py (36 tests)", passed_36, f"Exit code {code}, 36/36 passed: {passed_36}")

# -------------------------------------------------------------
# 2. E2E Test Suite Runs: Features 1, 3, 24
# -------------------------------------------------------------
# Feature 1 Tier 1
code1, out1, err1 = run_cmd([sys.executable, str(E2E_RUNNER), "--tier", "1", "--feature", "1"])
pass1 = (code1 == 0) and ("Passed: 5 | Failed: 0 | Errors: 0" in out1)
record("E2E Tier 1 Feature 1", pass1, f"Exit {code1}, 5/5 passed")

# Feature 3 Tier 1
code3, out3, err3 = run_cmd([sys.executable, str(E2E_RUNNER), "--tier", "1", "--feature", "3"])
pass3 = (code3 == 0) and ("Passed: 5 | Failed: 0 | Errors: 0" in out3)
record("E2E Tier 1 Feature 3", pass3, f"Exit {code3}, 5/5 passed")

# Feature 24 Tier 1
code24_t1, out24_t1, err24_t1 = run_cmd([sys.executable, str(E2E_RUNNER), "--tier", "1", "--feature", "24"])
pass24_t1 = (code24_t1 == 0) and ("Passed: 5 | Failed: 0 | Errors: 0" in out24_t1)
record("E2E Tier 1 Feature 24", pass24_t1, f"Exit {code24_t1}, 5/5 passed")

# Feature 24 All Tiers
code24_all, out24_all, err24_all = run_cmd([sys.executable, str(E2E_RUNNER), "--feature", "24"])
pass24_all = (code24_all == 0) and ("Passed: 10 | Failed: 0 | Errors: 0" in out24_all)
record("E2E All Tiers Feature 24", pass24_all, f"Exit {code24_all}, 10/10 passed")

# -------------------------------------------------------------
# 3. Direct Adversarial Stress Testing of audit_copy.py
# -------------------------------------------------------------
def audit_content(content: str, suffix: str = ".txt", extra_args=None):
    with tempfile.NamedTemporaryFile("w", delete=False, suffix=suffix, encoding="utf-8") as f:
        f.write(content)
        path = f.name
    try:
        cmd = [sys.executable, str(AUDIT_SCRIPT), path, "--format", "json"]
        if extra_args:
            cmd.extend(extra_args)
        c, o, e = run_cmd(cmd)
        data = None
        try:
            data = json.loads(o)
        except:
            pass
        return c, o, e, data
    finally:
        if os.path.exists(path):
            os.remove(path)

# Test 3.1: Markdown Headings with Varied Syntax
md_headings = """# Unleash the true power of your team
## In today's fast-paced world, simplicity matters
###   A bespoke platform designed for you   ###
#### Clear instructions for setting up the account
##### Desata tu potencial ahora mismo
###### Normal subtitle with zero buzzwords
"""
c, o, e, d = audit_content(md_headings, suffix=".md")
buzzwords_found = d["summary"]["total_buzzwords"] if d else 0
formulas_found = d["summary"]["total_formulas"] if d else 0
# "Unleash", "bespoke", "Desata", and formula "In today's fast-paced world"
p3_1 = (buzzwords_found >= 3 and formulas_found >= 1 and c == 1)
record("Markdown Headings Detection", p3_1, f"Found {buzzwords_found} buzzwords, {formulas_found} formulas in markdown headings")

# Test 3.2: Fenced Code Block Immunity
fenced_md = """# Legitimate Documentation

Here is how you write CSS:

```css
/* Unleash the styles */
.btn-frictionless {
    color: #elevate;
}
```

```html
<button class="bespoke-card">Click here</button>
```

Everything above is in code fences.
"""
c, o, e, d = audit_content(fenced_md, suffix=".md")
bw_count = d["summary"]["total_buzzwords"] if d else -1
p3_2 = (c == 0 and bw_count == 0)
record("Fenced Code Block False Positive Immunity", p3_2, f"Exit {c}, Buzzwords={bw_count} (expected 0)")

# Test 3.3: HTML Tag & Attribute Immunity vs Visible Text Recall
mixed_html = """
<div class="unleash-container" data-action="potenciar" id="seamless-wrapper">
    <a href="#elevate" class="btn-frictionless">Normal link text</a>
    <p>This is genuine copy that will unleash your productivity.</p>
</div>
"""
c, o, e, d = audit_content(mixed_html, suffix=".html")
findings = d["files"][0]["findings"] if d else []
matched_words = [f["matched_text"].lower() for f in findings]
p3_3 = (len(findings) == 1 and matched_words == ["unleash"])
record("HTML Tag/Attribute Immunity with Text Recall", p3_3, f"Matches: {matched_words} (expected only 'unleash')")

# Test 3.4: CSS File Immunity (hex colors, class names, variables)
css_content = """
/* Theme stylesheet */
:root {
    --color-elevate: #elevate;
    --unleash-radius: 8px;
}

.btn-frictionless {
    background-color: #123456;
    border: 1px solid #elevate;
}

.card-bespoke:hover {
    opacity: 0.95;
}
"""
c, o, e, d = audit_content(css_content, suffix=".css")
bw_css = d["summary"]["total_buzzwords"] if d else -1
p3_4 = (c == 0 and bw_css == 0)
record("CSS Classes/Tokens Immunity", p3_4, f"Exit {c}, Buzzwords={bw_css} (expected 0)")

# Test 3.5: Spanish Diacritics and Accents Recall
spanish_text = """
Nuestra solución holística te permite potenciar tu negocio sin fricción.
Sumérgete en un tapiz de posibilidades y desata el crecimiento.
No busques más, esta es la plataforma definitiva.
"""
c, o, e, d = audit_content(spanish_text, suffix=".txt", extra_args=["--lang", "es"])
findings_es = d["files"][0]["findings"] if d else []
p3_5 = (c == 1 and len(findings_es) >= 6)
record("Spanish Diacritics and Buzzword Recall", p3_5, f"Exit {c}, Findings count={len(findings_es)} (expected >=6)")

# Test 3.6: English Cliché Ignored under --lang es
en_text_under_es = "Unleash your seamless and effortless potential with our bespoke platform."
c, o, e, d = audit_content(en_text_under_es, suffix=".txt", extra_args=["--lang", "es"])
findings_lang_es = d["files"][0]["findings"] if d else []
p3_6 = (c == 0 and len(findings_lang_es) == 0)
record("Language Filter Separation (EN ignored under --lang es)", p3_6, f"Exit {c}, Findings count={len(findings_lang_es)}")

# Test 3.7: Triad Parallelism Detection (3 consecutive lines starting with action verbs)
triad_text = """- Accelerate your development cycle
- Optimize your resource allocation
- Maximize your revenue growth
"""
c, o, e, d = audit_content(triad_text, suffix=".md")
triads = d["summary"]["total_triads"] if d else 0
p3_7 = (triads >= 1 and c == 1)
record("Triad Parallelism Detection", p3_7, f"Triads detected={triads}")

# Test 3.8: Clean Text 100% Score
clean_text = """
# Getting Started with the Database Client

Connect to the PostgreSQL database by providing the connection string in your environment file.
Run migrations using the CLI tool:

$ migrate up

Check system status on the dashboard. All services report healthy response times.
"""
c, o, e, d = audit_content(clean_text, suffix=".md")
score = d["summary"]["humanization_score"] if d else -1
p3_8 = (c == 0 and score == 100.0)
record("Clean Text 100% Humanization Score", p3_8, f"Exit {c}, Score={score}")

# -------------------------------------------------------------
# Summary
# -------------------------------------------------------------
print("\n" + "=" * 70)
total_tests = len(test_results)
passed_tests = sum(1 for _, p, _ in test_results if p)
failed_tests = total_tests - passed_tests
print(f"TOTAL TESTS: {total_tests} | PASSED: {passed_tests} | FAILED: {failed_tests}")
verdict = "APPROVE" if failed_tests == 0 else "REQUEST_CHANGES"
print(f"VERDICT: {verdict}")
print("=" * 70)

sys.exit(0 if failed_tests == 0 else 1)
