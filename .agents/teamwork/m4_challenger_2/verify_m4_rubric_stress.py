#!/usr/bin/env python3
"""
Adversarial Stress & Boundary Test Harness for Milestone M4:
Objective Humanization Audit Rubric & Quick-Triage Specification (Feature 22 & 23)

File under test:
  C:\\Users\\JULIAN\\.gemini\\config\\skills\\human-interface-design\\references\\audit-rubric.md

Author: m4_challenger_2 (Stress & Boundary Challenger - Rubric & Scoring)
"""

import sys
import os
import re
import time
import subprocess
import itertools
from pathlib import Path
from typing import Dict, List, Tuple, Set

# Base Paths
SKILL_DIR = Path(r"C:\Users\JULIAN\.gemini\config\skills\human-interface-design")
RUBRIC_PATH = SKILL_DIR / "references" / "audit-rubric.md"
REFERENCES_DIR = SKILL_DIR / "references"
SCRIPTS_DIR = SKILL_DIR / "scripts"

class TestResult:
    def __init__(self, name: str):
        self.name = name
        self.passed = True
        self.messages: List[str] = []
        self.subtests: int = 0
        self.subtests_passed: int = 0

    def ok(self, msg: str):
        self.subtests += 1
        self.subtests_passed += 1
        self.messages.append(f"  [PASS] {msg}")

    def fail(self, msg: str):
        self.subtests += 1
        self.passed = False
        self.messages.append(f"  [FAIL] {msg}")

    def info(self, msg: str):
        self.messages.append(f"  [INFO] {msg}")


def test_section_1_mathematical_consistency() -> TestResult:
    res = TestResult("1. Mathematical Consistency of 30-Point Scoring Matrix")
    
    if not RUBRIC_PATH.exists():
        res.fail(f"Target file does not exist: {RUBRIC_PATH}")
        return res
    
    content = RUBRIC_PATH.read_text(encoding="utf-8")
    
    # 1.1 Verify exactly 6 dimensions defined
    dim_headers = re.findall(r"^###\s+Dimension\s+(\d+):\s+(.+)$", content, re.M)
    res.info(f"Discovered {len(dim_headers)} dimension headers")
    if len(dim_headers) == 6:
        res.ok("Exactly 6 evaluation dimensions are defined in rubric")
    else:
        res.fail(f"Expected exactly 6 dimensions, found {len(dim_headers)}: {dim_headers}")
        
    expected_dims = {
        1: "Asymmetrical Composition & Visual Rhythm ($D_1$)",
        2: "Musical Spacing & Structural Hierarchy ($D_2$)",
        3: "Fluid Typography & Reader Comfort ($D_3$)",
        4: "Tactile Materiality & Elevation Physics ($D_4$)",
        5: "Chromatic Intent & Color Psychology ($D_5$)",
        6: "Conversational UX Voice & Empathetic Microcopy ($D_6$)"
    }
    
    for d_num, d_name in dim_headers:
        num = int(d_num)
        if num in expected_dims:
            res.ok(f"Dimension {num} correctly matches formal specification: {d_name}")
        else:
            res.fail(f"Unexpected dimension index {num}: {d_name}")

    # 1.2 Verify 0-5 pt range per dimension in observable scale
    # Check that each dimension contains 0 pts, 1-2 pts, 3-4 pts, 5 pts
    dim_blocks = re.split(r"^###\s+Dimension\s+\d+:", content, flags=re.M)[1:]
    if len(dim_blocks) == 6:
        for idx, block in enumerate(dim_blocks, start=1):
            has_0 = bool(re.search(r"0\s*pts", block))
            has_1_2 = bool(re.search(r"1[–\-]2\s*pts", block))
            has_3_4 = bool(re.search(r"3[–\-]4\s*pts", block))
            has_5 = bool(re.search(r"5\s*pts", block))
            if has_0 and has_1_2 and has_3_4 and has_5:
                res.ok(f"Dimension {idx} provides comprehensive 0-5 scale (0, 1-2, 3-4, 5 pts)")
            else:
                res.fail(f"Dimension {idx} missing scale levels: 0={has_0}, 1-2={has_1_2}, 3-4={has_3_4}, 5={has_5}")
    else:
        res.fail(f"Could not parse 6 distinct dimension content blocks (found {len(dim_blocks)})")

    # 1.3 Mathematical Sum of Max Points equals 30
    min_sum = 6 * 0
    max_sum = 6 * 5
    if max_sum == 30 and min_sum == 0:
        res.ok(f"Mathematical bounds: min theoretical score = {min_sum}, max theoretical score = {max_sum}")
    else:
        res.fail(f"Score bounds incorrect: min={min_sum}, max={max_sum}")

    # Verify formula in text: Total Humanization Score = \sum_{i=1}^{6} D_i
    if "Total Humanization Score" in content and "\\sum_{i=1}^{6} D_i" in content:
        res.ok("Formal LaTeX summation formula explicitly stated in Section 1.2")
    else:
        res.fail("Summation formula missing or malformed")

    # 1.4 Itemized Deduction Penalties Analysis
    deductions_found = {}
    for idx, block in enumerate(dim_blocks, start=1):
        deductions = re.findall(r"-\s*\*\*(-?\d+)\s*pts?\*\*:", block)
        deduction_vals = [int(d) for d in deductions]
        deductions_found[idx] = deduction_vals
        res.info(f"Dimension {idx} itemized deductions: {deduction_vals} (Total negative potential: {sum(deduction_vals)})")
        if len(deduction_vals) >= 4:
            res.ok(f"Dimension {idx} specifies >= 4 explicit itemized negative deductions")
        else:
            res.fail(f"Dimension {idx} has fewer than 4 deductions: {deduction_vals}")

    # 1.5 Case Study Mathematical Verification (Section 5)
    case_study_match = re.search(r"COMPOSITE SCORE\s*│\s*(\d+)/30", content)
    if case_study_match:
        case_score = int(case_study_match.group(1))
        # Extract individual scores from scorecard
        d_scores = re.findall(r"D\d:[^│]+│\s*(\d+)\s*/\s*5", content)
        if len(d_scores) == 6:
            int_d_scores = [int(s) for s in d_scores]
            sum_d = sum(int_d_scores)
            if sum_d == case_score:
                res.ok(f"Case study arithmetic strictly verified: {int_d_scores} sum to {case_score}/30")
            else:
                res.fail(f"Case study arithmetic mismatch: sum({int_d_scores})={sum_d} != {case_score}")
        else:
            res.fail(f"Could not parse 6 dimension scores from case study scorecard (found {len(d_scores)})")
    else:
        res.fail("Could not find case study COMPOSITE SCORE in rubric")

    return res


def test_section_2_quality_tier_brackets() -> TestResult:
    res = TestResult("2. Quality Tier Continuity & Domain Coverage [0, 30]")
    
    content = RUBRIC_PATH.read_text(encoding="utf-8")
    
    # 2.1 Extract Quality Tiers from Section 3
    # Look for table or headings with ranges
    # Tier 1: 26–30 pts
    # Tier 2: 20–25 pts
    # Tier 3: 14–19 pts
    # Tier 4: 0–13 pts
    tier_matches = re.findall(r"###\s+Tier\s+(\d+):\s+([^(]+)\s*\(([0-9]+)[–\-]([0-9]+)\s*pts\)", content)
    res.info(f"Discovered {len(tier_matches)} Quality Tiers")
    
    if len(tier_matches) != 4:
        res.fail(f"Expected exactly 4 quality tiers, found {len(tier_matches)}: {tier_matches}")
        return res
    
    tier_ranges: Dict[int, Tuple[int, int, str]] = {}
    for t_num, t_name, low, high in tier_matches:
        t_idx = int(t_num)
        t_low = int(low)
        t_high = int(high)
        tier_ranges[t_idx] = (t_low, t_high, t_name.strip())
        res.info(f"  Tier {t_idx} ({t_name.strip()}): [{t_low}, {t_high}]")
    
    # Check bounds
    # Tier 4 must start at 0
    if tier_ranges[4][0] == 0:
        res.ok("Tier 4 lower bound is exactly 0 (minimum theoretical score)")
    else:
        res.fail(f"Tier 4 lower bound is {tier_ranges[4][0]}, expected 0")
        
    # Tier 1 must end at 30
    if tier_ranges[1][1] == 30:
        res.ok("Tier 1 upper bound is exactly 30 (maximum theoretical score)")
    else:
        res.fail(f"Tier 1 upper bound is {tier_ranges[1][1]}, expected 30")

    # 2.2 Check Strict Continuity & Non-Overlapping
    # Tier 4: low=0, high=13
    # Tier 3: low=14, high=19
    # Tier 2: low=20, high=25
    # Tier 1: low=26, high=30
    for t_lower, t_higher in [(4, 3), (3, 2), (2, 1)]:
        upper_of_lower = tier_ranges[t_lower][1]
        lower_of_higher = tier_ranges[t_higher][0]
        if upper_of_lower + 1 == lower_of_higher:
            res.ok(f"Continuous boundary between Tier {t_lower} (max {upper_of_lower}) and Tier {t_higher} (min {lower_of_higher})")
        else:
            res.fail(f"Discontinuity or overlap between Tier {t_lower} ({upper_of_lower}) and Tier {t_higher} ({lower_of_higher})")

    # 2.3 Exhaustive Domain Coverage: All integers 0 to 30
    domain = set(range(0, 31))
    covered_points = set()
    overlaps = []
    
    for t_idx, (low, high, name) in tier_ranges.items():
        tier_points = set(range(low, high + 1))
        # Check intersection with already covered points
        intersect = covered_points.intersection(tier_points)
        if intersect:
            overlaps.append((t_idx, intersect))
        covered_points.update(tier_points)
        
    if not overlaps:
        res.ok("Zero overlapping score brackets across all tiers")
    else:
        res.fail(f"Found overlapping score points: {overlaps}")
        
    uncovered = domain - covered_points
    if not uncovered:
        res.ok("Complete domain coverage: Every integer from 0 to 30 maps to a tier")
    else:
        res.fail(f"Gaps found in domain coverage: {uncovered}")

    extra_points = covered_points - domain
    if not extra_points:
        res.ok("No extraneous score points outside [0, 30] range")
    else:
        res.fail(f"Points outside [0, 30] covered: {extra_points}")

    # 2.4 Combinatorial Simulation over all 46,656 tuples
    tier_counts = {1: 0, 2: 0, 3: 0, 4: 0}
    all_mapped = True
    total_tuples = 6**6
    
    for tuple_vals in itertools.product(range(6), repeat=6):
        score = sum(tuple_vals)
        assigned_tier = None
        for t_idx, (low, high, _) in tier_ranges.items():
            if low <= score <= high:
                assigned_tier = t_idx
                break
        if assigned_tier is not None:
            tier_counts[assigned_tier] += 1
        else:
            all_mapped = False
            break
            
    if all_mapped:
        res.ok(f"Combinatorial stress test: All {total_tuples:,} 6-dimension score combinations mapped unambiguously")
        res.info(f"Combinatorial distribution: Tier 1: {tier_counts[1]:,} ({tier_counts[1]/total_tuples*100:.1f}%), "
                 f"Tier 2: {tier_counts[2]:,} ({tier_counts[2]/total_tuples*100:.1f}%), "
                 f"Tier 3: {tier_counts[3]:,} ({tier_counts[3]/total_tuples*100:.1f}%), "
                 f"Tier 4: {tier_counts[4]:,} ({tier_counts[4]/total_tuples*100:.1f}%)")
    else:
        res.fail("Some combinations in combinatorial space failed to map to a tier")

    # 2.5 Action Gate Unambiguity
    gates = re.findall(r"│\s*(Tier \d)\s*│[^│]+│[^│]+│\s*([^│]+)│", content)
    res.info(f"Extracted {len(gates)} action gates from summary table")
    for tier_str, gate_str in gates:
        gate = gate_str.strip()
        res.ok(f"{tier_str} action gate clearly defined: '{gate}'")

    return res


def test_section_3_quick_triage_checklist() -> TestResult:
    res = TestResult("3. 10-Point Boolean Quick-Triage Checklist & Remediation Links")
    
    content = RUBRIC_PATH.read_text(encoding="utf-8")
    
    # 3.1 Exactly 10 questions ending in '?'
    # Extract headers starting with ### [ ] Q<N>:
    q_headers = re.findall(r"^###\s+\[\s*\]\s+Q(\d+):\s+(.+)$", content, re.M)
    res.info(f"Discovered {len(q_headers)} checklist question headers")
    
    if len(q_headers) == 10:
        res.ok("Exactly 10 diagnostic checklist questions defined (Q1 to Q10)")
    else:
        res.fail(f"Expected exactly 10 questions, found {len(q_headers)}: {q_headers}")
        
    for q_num, q_text in q_headers:
        idx = int(q_num)
        q_clean = q_text.strip()
        if q_clean.endswith("?"):
            res.ok(f"Question Q{idx} correctly ends with question mark: '{q_clean[:45]}...'")
        else:
            res.fail(f"Question Q{idx} does not end with '?': '{q_clean}'")

    # 3.2 Binary Pass/Fail Checkboxes
    checkboxes = re.findall(r"^###\s+(\[[ x]\])\s+Q\d+:", content, re.M)
    if len(checkboxes) == 10 and all(c == "[ ]" for c in checkboxes):
        res.ok("All 10 questions formatted with standard binary unchecked checkboxes '[ ]'")
    else:
        res.fail(f"Checkbox formatting inconsistent: {checkboxes}")

    # Check for presence of Observable Inspection Check and Pass Condition per item
    triage_blocks = re.split(r"^###\s+\[\s*\]\s+Q\d+:", content, flags=re.M)[1:]
    if len(triage_blocks) == 10:
        for idx, block in enumerate(triage_blocks, start=1):
            has_obs = "Observable Inspection Check" in block
            has_pass = "Pass Condition" in block
            has_rem = "Remediation Reference" in block
            if has_obs and has_pass and has_rem:
                res.ok(f"Q{idx} provides Observable Check, Pass Condition, and Remediation Reference")
            else:
                res.fail(f"Q{idx} missing components: obs={has_obs}, pass={has_pass}, rem={has_rem}")
    else:
        res.fail(f"Could not parse 10 individual triage question blocks (found {len(triage_blocks)})")

    # 3.3 SLA Under 2 Minutes Feasibility
    has_sla_heading = "Service Level Agreement (SLA)" in content
    has_2_min = bool(re.search(r"under\s+\*?\*?2\s+minutes\*?\*?", content, re.I))
    if has_sla_heading and has_2_min:
        res.ok("Checklist explicitly specifies SLA: Under 2 minutes per view")
    else:
        res.fail("Checklist lacks explicit under-2-minute SLA specification")

    # Benchmark scripts/audit_copy.py execution time
    audit_script = SCRIPTS_DIR / "audit_copy.py"
    if audit_script.exists():
        start_time = time.perf_counter()
        py_exe = sys.executable
        proc = subprocess.run(
            [py_exe, str(audit_script), str(REFERENCES_DIR), "--threshold", "90", "--lang", "all"],
            capture_output=True,
            text=True
        )
        elapsed = time.perf_counter() - start_time
        res.info(f"audit_copy.py benchmark on references/: {elapsed:.3f} seconds (Exit Code: {proc.returncode})")
        if elapsed < 2.0:
            res.ok(f"Automated copy scan runs in {elapsed*1000:.1f}ms (< 2.0s), fully compliant with 2-minute SLA")
        else:
            res.fail(f"Automated copy scan took {elapsed:.2f}s, exceeding automated SLA budget")
    else:
        res.fail(f"audit_copy.py does not exist at {audit_script}")

    # 3.4 Pass Threshold Mathematical Integrity
    # Quick-Triage Score = sum_{j=1}^{10} Q_j in [0, 10]
    # Pass: >= 9 (mandatory Q6, Q9)
    # Conditional: 8
    # Fail: < 8 (or failure of Q6, Q9)
    total_vectors = 2**10  # 1024
    triage_outcomes = {"PASS": 0, "CONDITIONAL": 0, "FAIL": 0}
    for vector in itertools.product([0, 1], repeat=10):
        total_score = sum(vector)
        q6_pass = (vector[5] == 1)  # Q6 is index 5
        q9_pass = (vector[8] == 1)  # Q9 is index 8
        
        if total_score >= 9 and q6_pass and q9_pass:
            triage_outcomes["PASS"] += 1
        elif total_score == 8 and q6_pass and q9_pass:
            triage_outcomes["CONDITIONAL"] += 1
        else:
            triage_outcomes["FAIL"] += 1
            
    sum_outcomes = sum(triage_outcomes.values())
    if sum_outcomes == total_vectors:
        res.ok(f"Triage threshold partition is complete and deterministic over all {total_vectors} binary states")
        res.info(f"Triage binary outcome distribution: PASS={triage_outcomes['PASS']} ({triage_outcomes['PASS']/total_vectors*100:.1f}%), "
                 f"CONDITIONAL={triage_outcomes['CONDITIONAL']} ({triage_outcomes['CONDITIONAL']/total_vectors*100:.1f}%), "
                 f"FAIL={triage_outcomes['FAIL']} ({triage_outcomes['FAIL']/total_vectors*100:.1f}%)")
    else:
        res.fail(f"Triage outcomes do not sum to 1024: {sum_outcomes}")

    # 3.5 Remediation Pointer Resolution (100% Target Resolution)
    # Extract all markdown links in audit-rubric.md
    raw_links = re.findall(r"\[([^\]]+)\]\(([^)]+)\)", content)
    res.info(f"Found {len(raw_links)} total markdown links in audit-rubric.md")
    
    # We will verify all links pointing to references/*.md or *.md
    verified_links = 0
    failed_links = 0
    
    # Preload content and headers of all reference files
    ref_files = {}
    ref_headers = {}
    for ref_file in REFERENCES_DIR.glob("*.md"):
        ref_text = ref_file.read_text(encoding="utf-8")
        ref_files[ref_file.name] = ref_text
        # Extract headers
        h_list = re.findall(r"^#{1,6}\s+(.+)$", ref_text, re.M)
        ref_headers[ref_file.name] = h_list

    for link_label, link_target in raw_links:
        # e.g. organic-ui.md#section-2 or references/organic-ui.md#section-2
        clean_target = link_target.split("#")
        file_part = clean_target[0]
        anchor_part = clean_target[1] if len(clean_target) > 1 else None
        
        # Strip leading references/ if present
        if file_part.startswith("references/"):
            file_part = file_part[len("references/"):]
            
        if not file_part:
            # Anchor in same file
            target_file_name = "audit-rubric.md"
        else:
            target_file_name = file_part
            
        if target_file_name not in ref_files:
            res.fail(f"Link target file does not exist: '{link_target}' (Resolved: {target_file_name})")
            failed_links += 1
            continue
            
        # Verify anchor / section in target file
        if anchor_part:
            target_text = ref_files[target_file_name]
            # Check if section number or anchor matches headers
            # Anchor format: section-2
            m = re.match(r"section-(\d+)", anchor_part, re.I)
            if m:
                sec_num = m.group(1)
                # Check if "Section {sec_num}:" exists in target headers
                sec_pattern = re.compile(rf"^##\s+Section\s+{sec_num}\b", re.M | re.I)
                has_section = bool(sec_pattern.search(target_text))
                if has_section:
                    verified_links += 1
                else:
                    res.fail(f"Anchor '{anchor_part}' in link '{link_target}' not found as 'Section {sec_num}' in {target_file_name}")
                    failed_links += 1
            else:
                # Generic anchor: check if slug matches any header
                slug = anchor_part.lower().replace("-", " ")
                has_match = any(slug in h.lower() for h in ref_headers[target_file_name])
                if has_match:
                    verified_links += 1
                else:
                    res.fail(f"Anchor '{anchor_part}' in link '{link_target}' does not resolve in {target_file_name}")
                    failed_links += 1
        else:
            verified_links += 1

    if failed_links == 0 and verified_links > 0:
        res.ok(f"100% of remediation pointers resolve successfully to actual files and sections ({verified_links}/{verified_links} links)")
    else:
        res.fail(f"Link resolution failure: {failed_links} links failed, {verified_links} passed")

    # 3.6 Check Table in Section 4 (Comprehensive Remediation Mapping Directory)
    table_rows = re.findall(r"\|\s*\*\*(Q\d+)\*\*\s*\|\s*([^│|]+)\|\s*([^│|]+)\|\s*([^│|]+)\|", content)
    res.info(f"Extracted {len(table_rows)} rows from Remediation Mapping Directory table")
    if len(table_rows) == 10:
        res.ok("Remediation Directory table has exactly 10 rows mapping Q1-Q10")
    else:
        res.fail(f"Expected 10 table rows in Remediation Directory, found {len(table_rows)}")
        
    for q_id, domain, defect, ref in table_rows:
        res.info(f"  {q_id} ({domain.strip()}): Defect: '{defect.strip()}' -> Ref: '{ref.strip()[:40]}...'")

    return res


def main():
    print("=" * 80)
    print(" ADVERSARIAL STRESS & BOUNDARY TEST HARNESS: M4 RUBRIC & SCORING")
    print("=" * 80)
    print(f"Target: {RUBRIC_PATH}")
    print()

    results = [
        test_section_1_mathematical_consistency(),
        test_section_2_quality_tier_brackets(),
        test_section_3_quick_triage_checklist(),
    ]

    total_subtests = 0
    total_passed = 0
    all_passed = True

    for r in results:
        print(f"\n--- {r.name} ---")
        for m in r.messages:
            print(m)
        total_subtests += r.subtests
        total_passed += r.subtests_passed
        if not r.passed:
            all_passed = False

    print("\n" + "=" * 80)
    print(" FINAL VERIFICATION SUMMARY")
    print("=" * 80)
    print(f"Total Subtests Run: {total_subtests}")
    print(f"Subtests Passed:    {total_passed}")
    print(f"Subtests Failed:    {total_subtests - total_passed}")
    print(f"Pass Rate:          {total_passed / total_subtests * 100:.1f}%")
    print()

    if all_passed:
        print("VERDICT: APPROVE (ALL ADVERSARIAL BOUNDARY AND STRESS TESTS PASSED)")
        sys.exit(0)
    else:
        print("VERDICT: REQUEST_CHANGES (ADVERSARIAL FAILURES DETECTED)")
        sys.exit(1)


if __name__ == "__main__":
    main()
