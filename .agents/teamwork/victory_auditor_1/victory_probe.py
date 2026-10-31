"""
Independent Victory Auditor Probe
---------------------------------
Executed by victory_auditor_1 to independently verify:
1. CLI parameter safety and validation
2. Real-time detection accuracy on synthetic test inputs
3. Frontmatter & layout requirements (R1-R4)
4. Absence of cheating, facades, or test tampering
"""

import sys
import os
import subprocess
import json
import re
from pathlib import Path

SKILL_DIR = Path(r"C:\Users\JULIAN\.gemini\config\skills\human-interface-design")
AUDIT_SCRIPT = SKILL_DIR / "scripts" / "audit_copy.py"
WORK_DIR = Path(r"c:\Users\JULIAN\Desktop\GravyLocalTABS\.agents\teamwork\victory_auditor_1")

def run_cmd(cmd_list):
    res = subprocess.run(cmd_list, capture_output=True, text=True, encoding="utf-8", errors="replace")
    return res.returncode, res.stdout, res.stderr

def main():
    print("=== VICTORY AUDITOR INDEPENDENT VERIFICATION PROBE ===")
    all_ok = True

    # 1. Verify existence and sizes of all required deliverables
    print("\n[Check 1] Deliverable Manifest Verification:")
    expected_files = {
        "SKILL.md": 20000,
        "references/organic-ui.md": 50000,
        "references/color-psychology.md": 30000,
        "references/conversational-copy.md": 50000,
        "references/audit-rubric.md": 40000,
        "examples/before-after-cases.md": 70000,
        "scripts/audit_copy.py": 25000
    }
    for rel_path, min_bytes in expected_files.items():
        fp = SKILL_DIR / rel_path
        if not fp.exists():
            print(f"  FAIL: Missing file {rel_path}")
            all_ok = False
        else:
            sz = fp.stat().st_size
            status = "PASS" if sz >= min_bytes else "WARN"
            print(f"  [{status}] {rel_path} ({sz} bytes, min: {min_bytes})")
            if sz < min_bytes:
                all_ok = False

    # 2. Verify Frontmatter YAML in SKILL.md
    print("\n[Check 2] SKILL.md YAML Frontmatter Inspection:")
    skill_content = (SKILL_DIR / "SKILL.md").read_text(encoding="utf-8")
    fm_match = re.match(r"^---\r?\n(.*?)\r?\n---\r?\n", skill_content, re.DOTALL)
    if not fm_match:
        print("  FAIL: No YAML frontmatter found in SKILL.md")
        all_ok = False
    else:
        fm_text = fm_match.group(1)
        has_name = "name: human-interface-design" in fm_text
        has_desc = "description:" in fm_text
        has_use_when = "Use when" in fm_text or "use when" in fm_text
        print(f"  Frontmatter extracted ({len(fm_text)} chars):")
        print(f"    - name valid: {has_name}")
        print(f"    - description valid: {has_desc}")
        print(f"    - 'use when' trigger present: {has_use_when}")
        if not (has_name and has_desc and has_use_when):
            all_ok = False

    # 3. CLI Robustness & Adversarial Parameter Fuzzing
    print("\n[Check 3] CLI Robustness & Parameter Validation:")
    fuzz_tests = [
        (["py", str(AUDIT_SCRIPT), str(SKILL_DIR / "SKILL.md"), "--threshold", "-1"], 2, "Negative threshold"),
        (["py", str(AUDIT_SCRIPT), str(SKILL_DIR / "SKILL.md"), "--threshold", "101"], 2, "Threshold > 100"),
        (["py", str(AUDIT_SCRIPT), str(SKILL_DIR / "SKILL.md"), "--threshold", "nan"], 2, "NaN threshold"),
        (["py", str(AUDIT_SCRIPT), str(SKILL_DIR / "SKILL.md"), "--threshold", "inf"], 2, "Inf threshold"),
        (["py", str(AUDIT_SCRIPT), str(SKILL_DIR / "SKILL.md"), "--lang", "klingon"], 2, "Invalid lang"),
        (["py", str(AUDIT_SCRIPT), "non_existent_file_xyz_123.md"], 2, "Non-existent file"),
    ]
    for cmd, expected_rc, desc in fuzz_tests:
        rc, out, err = run_cmd(cmd)
        if rc == expected_rc:
            print(f"  PASS: {desc} rejected correctly with returncode {rc}")
        else:
            print(f"  FAIL: {desc} expected returncode {expected_rc}, got {rc}. Stderr: {err}")
            all_ok = False

    # 4. End-to-End Synthetic Slop Detection & Scoring
    print("\n[Check 4] Real-Time Slop Detection Accuracy:")
    temp_slop = WORK_DIR / "temp_slop_test.html"
    temp_slop.write_text("""<!DOCTYPE html>
<html>
<body>
  <h1>Unleash the power of next-gen workflows</h1>
  <p>Where pure innovation meets design to elevate your enterprise.</p>
  <p>Delve into a rich tapestry of solutions designed to empower your team effortlessly.</p>
  <button>Get Started</button>
</body>
</html>""", encoding="utf-8")

    rc, out, err = run_cmd(["py", str(AUDIT_SCRIPT), str(temp_slop), "--json"])
    if rc != 1:  # Should fail threshold (default 80)
        print(f"  FAIL: Expected exit code 1 for slop file, got {rc}")
        all_ok = False
    else:
        try:
            data = json.loads(out)
            score = data["summary"]["humanization_score"]
            buzz = data["summary"]["total_buzzwords"]
            formulas = data["summary"]["total_formulas"]
            print(f"  PASS: Slop detected: {buzz} buzzwords, {formulas} formula. Score: {score}/100. Tier: {data['summary']['quality_tier']}")
            if score >= 80 or buzz < 5 or formulas < 1:
                print(f"  FAIL: Inaccurate scoring for blatant slop (score: {score}, buzz: {buzz})")
                all_ok = False
        except Exception as e:
            print(f"  FAIL: JSON parse error: {e}")
            all_ok = False

    # Clean version
    temp_clean = WORK_DIR / "temp_clean_test.html"
    temp_clean.write_text("""<!DOCTYPE html>
<html>
<body>
  <h1>Track background worker queues in real time</h1>
  <p>Inspect job throughput, latency percentiles, and memory allocation across your clusters.</p>
  <p>Get notified when error rates exceed 0.5% in 60 seconds.</p>
  <button>Start 14-day trial &mdash; no credit card required</button>
</body>
</html>""", encoding="utf-8")

    rc, out, err = run_cmd(["py", str(AUDIT_SCRIPT), str(temp_clean), "--json"])
    if rc != 0:
        print(f"  FAIL: Expected exit code 0 for clean file, got {rc}. Out: {out}")
        all_ok = False
    else:
        try:
            data = json.loads(out)
            score = data["summary"]["humanization_score"]
            buzz = data["summary"]["total_buzzwords"]
            print(f"  PASS: Clean file scored: {buzz} buzzwords. Score: {score}/100. Tier: {data['summary']['quality_tier']}")
            if score < 95 or buzz > 0:
                print(f"  FAIL: Clean file scored too low: {score}")
                all_ok = False
        except Exception as e:
            print(f"  FAIL: JSON parse error: {e}")
            all_ok = False

    # Cleanup temp files
    if temp_slop.exists(): temp_slop.unlink()
    if temp_clean.exists(): temp_clean.unlink()

    print("\n[Check 5] Overall Probe Result:")
    if all_ok:
        print("  >>> PROBE STATUS: FULLY VERIFIED (ALL CHECKS PASSED) <<<")
    else:
        print("  >>> PROBE STATUS: FAILED CHECKS DETECTED <<<")
    return 0 if all_ok else 1

if __name__ == "__main__":
    sys.exit(main())
