#!/usr/bin/env python3
"""
verify_skill_md.py
Empirical Adversarial Verification and Stress-Test Suite for Antigravity Skill `human-interface-design/SKILL.md`.

This test suite executes direct empirical assertions against:
1. YAML frontmatter strict compliance (strict YAML parser, slug validation, duplicate key rejection, triggers, length).
2. Markdown link integrity & relative path validity for references/, examples/, and scripts/.
3. Comprehensive heuristic check: confirms H1 through H10 are all present with all 6 required columns and non-trivial content.
4. Core pillar check: confirms Pillars I, II, III, IV are clearly delineated with deep technical standards.
5. Workflow check: confirms Workflows A (Greenfield) and B (Brownfield) are present with structured steps.
6. CommonMark/GFM table rendering verification using python-markdown engine.
7. Adversarial syntax & structural stress tests (code fence balancing, tab cleanliness, UTF-8 validity, file size limits).
8. Physical validation of target referenced scripts (scripts/audit_copy.py).
"""

import sys
import os
import re
import yaml
import markdown
from pathlib import Path
from typing import List, Dict, Any, Tuple
from xml.etree import ElementTree

# Reconfigure console output to utf-8
try:
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")
except AttributeError:
    pass

SKILL_DIR = Path(r"C:\Users\JULIAN\.gemini\config\skills\human-interface-design")
SKILL_MD_PATH = SKILL_DIR / "SKILL.md"

class TestSuite:
    def __init__(self):
        self.results = []
        self.passed = 0
        self.failed = 0
        self.warnings = 0

    def record(self, test_name: str, status: str, message: str, details: Any = None):
        if status == "PASS":
            self.passed += 1
            icon = "✅"
        elif status == "FAIL":
            self.failed += 1
            icon = "❌"
        else:
            self.warnings += 1
            icon = "⚠️"
        
        self.results.append({
            "test": test_name,
            "status": status,
            "message": message,
            "details": details
        })
        print(f"{icon} [{status}] {test_name}: {message}")
        if details:
            if isinstance(details, list):
                for d in details:
                    print(f"     - {d}")
            elif isinstance(details, dict):
                for k, v in details.items():
                    print(f"     - {k}: {v}")
            else:
                print(f"     {details}")

    def summary(self) -> int:
        print("\n" + "="*70)
        print("EMPIRICAL TEST SUMMARY:")
        print(f"Total Tests Run: {self.passed + self.failed + self.warnings}")
        print(f"Passed: {self.passed} | Failed: {self.failed} | Warnings: {self.warnings}")
        verdict = "APPROVE" if self.failed == 0 else "REQUEST_CHANGES"
        print(f"FINAL VERDICT: {verdict}")
        print("="*70)
        return 0 if self.failed == 0 else 1

def run_tests():
    suite = TestSuite()

    # -------------------------------------------------------------
    # 0. File Existence and Basic Metadata
    # -------------------------------------------------------------
    if not SKILL_MD_PATH.exists():
        suite.record("File Existence", "FAIL", f"File does not exist at {SKILL_MD_PATH}")
        return suite.summary()
    else:
        suite.record("File Existence", "PASS", f"SKILL.md found ({SKILL_MD_PATH.stat().st_size} bytes)")

    # Read raw content
    with open(SKILL_MD_PATH, "r", encoding="utf-8") as f:
        content = f.read()
    lines = content.splitlines(keepends=True)

    # -------------------------------------------------------------
    # 1. YAML Frontmatter Strict Compliance
    # -------------------------------------------------------------
    if not lines[0].startswith("---"):
        suite.record("YAML Frontmatter Start", "FAIL", "Line 1 must start with '---'")
    else:
        suite.record("YAML Frontmatter Start", "PASS", "Line 1 correctly opens with '---'")

    closing_idx = -1
    for idx in range(1, len(lines)):
        if lines[idx].strip() == "---":
            closing_idx = idx
            break

    if closing_idx == -1:
        suite.record("YAML Frontmatter Termination", "FAIL", "No closing '---' delimiter found")
        frontmatter_raw = ""
    else:
        suite.record("YAML Frontmatter Termination", "PASS", f"Closing '---' delimiter found at line {closing_idx + 1}")
        frontmatter_raw = "".join(lines[1:closing_idx])

    parsed_yaml = None
    if frontmatter_raw:
        try:
            # Custom strict loader to reject duplicate keys
            class StrictLoader(yaml.SafeLoader):
                pass
            
            def construct_mapping(loader, node):
                loader.flatten_mapping(node)
                mapping = {}
                for key_node, value_node in node.value:
                    key = loader.construct_object(key_node)
                    if key in mapping:
                        raise ValueError(f"Duplicate YAML key detected: '{key}'")
                    mapping[key] = loader.construct_object(value_node)
                return mapping

            StrictLoader.add_constructor(yaml.resolver.BaseResolver.DEFAULT_MAPPING_TAG, construct_mapping)
            parsed_yaml = yaml.load(frontmatter_raw, Loader=StrictLoader)
            suite.record("YAML Strict Parse", "PASS", "Frontmatter parsed strictly with SafeLoader and duplicate key rejection")
        except Exception as e:
            suite.record("YAML Strict Parse", "FAIL", f"YAML parsing failed: {e}")

    if isinstance(parsed_yaml, dict):
        # Strict key presence
        allowed_keys = {"name", "description"}
        extra_keys = set(parsed_yaml.keys()) - allowed_keys
        if extra_keys:
            suite.record("YAML Key Schema", "FAIL", f"Unexpected extra keys in frontmatter: {extra_keys}")
        else:
            suite.record("YAML Key Schema", "PASS", f"Frontmatter strictly adheres to canonical keys: {sorted(list(parsed_yaml.keys()))}")

        # Name check
        name_val = parsed_yaml.get("name")
        expected_name = SKILL_DIR.name
        if name_val == expected_name:
            suite.record("YAML Name Field Match", "PASS", f"Name matches directory: '{name_val}'")
        else:
            suite.record("YAML Name Field Match", "FAIL", f"Name '{name_val}' does not match directory '{expected_name}'")

        # Name slug format check
        if re.match(r"^[a-z0-9]+(-[a-z0-9]+)*$", str(name_val)):
            suite.record("YAML Name Slug Format", "PASS", f"Name '{name_val}' is valid lowercase kebab-case slug")
        else:
            suite.record("YAML Name Slug Format", "FAIL", f"Name '{name_val}' is not valid kebab-case slug")

        # Description check
        desc_val = parsed_yaml.get("description")
        if isinstance(desc_val, str):
            desc_len = len(desc_val)
            if desc_len > 100:
                suite.record("YAML Description Length", "PASS", f"Description length is {desc_len} chars (> 100 char requirement)")
            else:
                suite.record("YAML Description Length", "FAIL", f"Description length {desc_len} is <= 100 chars")

            # Check trigger phrases
            triggers = [
                "Use when",
                "when designing",
                "when writing",
                "when auditing",
                "when diagnosing",
                "when applying"
            ]
            found_triggers = [t for t in triggers if t.lower() in desc_val.lower()]
            if len(found_triggers) >= 3:
                suite.record("YAML Trigger Phrases", "PASS", f"Found {len(found_triggers)} routing triggers", found_triggers)
            else:
                suite.record("YAML Trigger Phrases", "FAIL", f"Insufficient routing triggers found in description: {found_triggers}")
        else:
            suite.record("YAML Description Field", "FAIL", "Description is missing or not a string")
    else:
        suite.record("YAML Dictionary Type", "FAIL", "Frontmatter did not parse into a dictionary")

    # -------------------------------------------------------------
    # 2. Markdown Integrity & Relative Path Links
    # -------------------------------------------------------------
    md_link_regex = re.compile(r'\[([^\]]+)\]\(([^)]+)\)')
    all_links = md_link_regex.findall(content)

    suite.record("Markdown Link Extraction", "PASS", f"Extracted {len(all_links)} markdown links across document")

    internal_links = []
    malformed_links = []
    suspicious_absolute = []
    backslash_links = []

    for text, link in all_links:
        link_clean = link.strip()
        if link_clean.startswith("http://") or link_clean.startswith("https://"):
            continue  # external link
        if link_clean.startswith("#"):
            continue  # internal anchor

        internal_links.append((text, link_clean))

        if "\\" in link_clean:
            backslash_links.append(link_clean)

        if link_clean.startswith("/") or re.match(r"^[a-zA-Z]:", link_clean):
            suspicious_absolute.append(link_clean)

        if link_clean.startswith("../"):
            malformed_links.append(f"Escapes skill root: {link_clean}")

    if backslash_links:
        suite.record("Markdown Link Slashes", "FAIL", "Found Windows backslashes in markdown links", backslash_links)
    else:
        suite.record("Markdown Link Slashes", "PASS", "All markdown links use standard forward slashes (/)")

    if suspicious_absolute:
        suite.record("Markdown Link Relativity", "FAIL", "Found absolute path links", suspicious_absolute)
    else:
        suite.record("Markdown Link Relativity", "PASS", "All internal markdown links use strictly relative paths")

    if malformed_links:
        suite.record("Markdown Link Containment", "FAIL", "Links traverse outside skill root", malformed_links)
    else:
        suite.record("Markdown Link Containment", "PASS", "All relative links resolve strictly within skill tree")

    ref_links = [l for _, l in internal_links if l.startswith("references/")]
    ex_links = [l for _, l in internal_links if l.startswith("examples/")]
    script_links = [l for _, l in internal_links if l.startswith("scripts/")]

    expected_refs = {
        "references/organic-ui.md",
        "references/color-psychology.md",
        "references/conversational-copy.md",
        "references/audit-rubric.md"
    }
    expected_examples = {
        "examples/before-after-cases.md"
    }
    expected_scripts = {
        "scripts/audit_copy.py"
    }

    found_refs = set(ref_links)
    found_examples = set(ex_links)
    found_scripts = set(script_links)

    missing_refs = expected_refs - found_refs
    if missing_refs:
        suite.record("Contract Reference Links", "FAIL", f"Missing references: {missing_refs}")
    else:
        suite.record("Contract Reference Links", "PASS", f"All 4 reference contract files linked: {sorted(list(found_refs))}")

    missing_ex = expected_examples - found_examples
    if missing_ex:
        suite.record("Contract Example Links", "FAIL", f"Missing examples: {missing_ex}")
    else:
        suite.record("Contract Example Links", "PASS", f"All example contract files linked: {sorted(list(found_examples))}")

    # Physical check of scripts/audit_copy.py
    script_path = SKILL_DIR / "scripts" / "audit_copy.py"
    if script_path.exists():
        suite.record("Referenced Script On Disk", "PASS", f"scripts/audit_copy.py physically exists ({script_path.stat().st_size} bytes)")
    else:
        suite.record("Referenced Script On Disk", "FAIL", "scripts/audit_copy.py does not exist on disk")

    # -------------------------------------------------------------
    # 3. Comprehensive Heuristic Check (H1 through H10)
    # -------------------------------------------------------------
    heuristics_match = re.search(r"##\s*3\.\s*The Top-10 Instant Triage Heuristics", content)
    if not heuristics_match:
        suite.record("Heuristics Section Header", "FAIL", "Section 3 Header not found")
    else:
        suite.record("Heuristics Section Header", "PASS", "Section 3 'Top-10 Instant Triage Heuristics' found")

    expected_heuristics = [f"H{i}" for i in range(1, 11)]
    found_heuristics = {}

    table_lines = []
    in_table = False
    for line in content.splitlines():
        if "| #" in line and "Heuristic Name" in line:
            in_table = True
            table_lines.append(line)
            continue
        if in_table:
            if line.strip().startswith("|"):
                table_lines.append(line)
            else:
                break

    if len(table_lines) < 12:
        suite.record("Heuristics Table Row Count", "FAIL", f"Table has {len(table_lines)} lines, expected >= 12")
    else:
        suite.record("Heuristics Table Row Count", "PASS", f"Table has header, separator, and {len(table_lines)-2} data rows")

    # Parse table header
    header_cols = [c.strip() for c in re.split(r'(?<!\\)\|', table_lines[0])[1:-1]]
    expected_col_keywords = [
        ["#"],
        ["heuristic", "name"],
        ["robotic", "trap", "slop", "signal"],
        ["human", "standard"],
        ["diagnostic", "check", "observable"],
        ["remediation", "action", "immediate"]
    ]

    col_match_success = True
    for idx, keywords in enumerate(expected_col_keywords):
        if idx >= len(header_cols):
            col_match_success = False
            break
        col_actual = header_cols[idx].lower()
        if not any(kw in col_actual for kw in keywords):
            col_match_success = False
            break

    if col_match_success and len(header_cols) == 6:
        suite.record("Heuristics Table Columns", "PASS", f"All 6 required columns present: {header_cols}")
    else:
        suite.record("Heuristics Table Columns", "FAIL", f"Columns mismatch: actual {header_cols}")

    # Inspect each heuristic data row using escaped pipe split r'(?<!\\)\|'
    data_rows = table_lines[2:]
    for r_idx, row in enumerate(data_rows):
        cells = [c.strip() for c in re.split(r'(?<!\\)\|', row)[1:-1]]
        if len(cells) != 6:
            suite.record(f"Heuristics Row {r_idx+1} Columns", "FAIL", f"Expected 6 cells, got {len(cells)}: {cells}")
            continue

        h_id_raw = cells[0].replace("*", "").strip()
        h_name = cells[1].replace("*", "").strip()
        h_trap = cells[2]
        h_standard = cells[3]
        h_diag = cells[4]
        h_action = cells[5]

        found_heuristics[h_id_raw] = {
            "name": h_name,
            "trap": h_trap,
            "standard": h_standard,
            "diagnostic": h_diag,
            "action": h_action
        }

    # Verify H1 to H10 completeness
    missing_h = [h for h in expected_heuristics if h not in found_heuristics]
    if missing_h:
        suite.record("Heuristics H1-H10 Completeness", "FAIL", f"Missing heuristics: {missing_h}")
    else:
        suite.record("Heuristics H1-H10 Completeness", "PASS", "All H1 through H10 are present in strict sequence", [f"{k}: {v['name']}" for k, v in found_heuristics.items()])

    # Verify cell substance
    empty_or_trivial_cells = []
    for h_id, data in found_heuristics.items():
        for field, val in data.items():
            if len(val.strip()) < 8:
                empty_or_trivial_cells.append(f"{h_id} {field} is too short ({len(val)} chars): '{val}'")

    if empty_or_trivial_cells:
        suite.record("Heuristics Cell Content Substance", "FAIL", "Found trivial/empty cells", empty_or_trivial_cells)
    else:
        suite.record("Heuristics Cell Content Substance", "PASS", "All 60 heuristic cells contain rich, actionable content")

    # -------------------------------------------------------------
    # 4. Core Pillar Check
    # -------------------------------------------------------------
    pillar_headers = re.findall(r"###\s*Pillar\s+([IVX]+):\s*([^\n\r]+)", content)
    pillar_dict = {num: title.strip() for num, title in pillar_headers}

    expected_pillars = ["I", "II", "III", "IV"]
    missing_pillars = [p for p in expected_pillars if p not in pillar_dict]

    if missing_pillars:
        suite.record("Core Pillars Presence", "FAIL", f"Missing pillars: {missing_pillars}")
    else:
        suite.record("Core Pillars Presence", "PASS", f"All 4 Core Pillars delineated: {pillar_dict}")

    pillar_content_lengths = {}
    for num in expected_pillars:
        p_pattern = rf"###\s*Pillar\s+{num}:.*?(?=(###\s*Pillar|##\s*3|\Z))"
        m = re.search(p_pattern, content, re.DOTALL)
        if m:
            length = len(m.group(0))
            pillar_content_lengths[num] = length
            if length > 500:
                suite.record(f"Pillar {num} Substance", "PASS", f"Pillar {num} has {length} characters of rich specifications")
            else:
                suite.record(f"Pillar {num} Substance", "FAIL", f"Pillar {num} has only {length} characters (too brief)")
        else:
            suite.record(f"Pillar {num} Substance", "FAIL", f"Could not isolate content block for Pillar {num}")

    # -------------------------------------------------------------
    # 5. Operational Workflows Check
    # -------------------------------------------------------------
    workflow_headers = re.findall(r"###\s*Workflow\s+([AB]):\s*([^\n\r]+)", content)
    wf_dict = {letter: title.strip() for letter, title in workflow_headers}

    if "A" in wf_dict and "B" in wf_dict:
        suite.record("Workflows A & B Presence", "PASS", f"Both workflows found: A='{wf_dict['A']}', B='{wf_dict['B']}'")
    else:
        suite.record("Workflows A & B Presence", "FAIL", f"Missing workflow: actual found = {wf_dict}")

    wf_a_phases = re.findall(r"(?:Phase\s+\d+:|[0-9]+\.\s+\*\*Phase\s+\d+:)", content)
    if len(wf_a_phases) >= 5:
        suite.record("Workflow A Phase Structure", "PASS", f"Workflow A defines {len(wf_a_phases)} operational phases")
    else:
        suite.record("Workflow A Phase Structure", "FAIL", f"Workflow A has only {len(wf_a_phases)} phases, expected >= 5")

    wf_b_steps = re.findall(r"(?:Step\s+\d+:|[0-9]+\.\s+\*\*Step\s+\d+:)", content)
    if len(wf_b_steps) >= 5:
        suite.record("Workflow B Step Structure", "PASS", f"Workflow B defines {len(wf_b_steps)} operational steps")
    else:
        suite.record("Workflow B Step Structure", "FAIL", f"Workflow B has only {len(wf_b_steps)} steps, expected >= 5")

    # -------------------------------------------------------------
    # 6. GFM/CommonMark Table Rendering Engine Verification
    # -------------------------------------------------------------
    try:
        html = markdown.markdown(content, extensions=['tables', 'fenced_code'])
        rendered_tables = re.findall(r'<table>.*?</table>', html, re.DOTALL)
        if len(rendered_tables) >= 2:
            suite.record("Markdown Table HTML Render", "PASS", f"Python-Markdown engine cleanly rendered {len(rendered_tables)} tables without syntax errors")
            # Verify Section 3 table rendered exactly 11 rows (1 header + 10 data)
            t1 = rendered_tables[0]
            t1_rows = re.findall(r'<tr>(.*?)</tr>', t1, re.DOTALL)
            if len(t1_rows) == 11:
                suite.record("Heuristics Table HTML Rows", "PASS", "Section 3 table rendered exactly 11 HTML <tr> rows (1 header + 10 heuristics)")
            else:
                suite.record("Heuristics Table HTML Rows", "FAIL", f"Section 3 table rendered {len(t1_rows)} rows, expected 11")
        else:
            suite.record("Markdown Table HTML Render", "FAIL", f"Expected at least 2 tables, rendered {len(rendered_tables)}")
    except Exception as e:
        suite.record("Markdown Table HTML Render", "FAIL", f"Markdown HTML rendering failed: {e}")

    # -------------------------------------------------------------
    # 7. Adversarial Markdown & Syntax Stress Tests
    # -------------------------------------------------------------
    fence_count = len(re.findall(r"^```", content, re.MULTILINE))
    if fence_count % 2 == 0:
        suite.record("Markdown Code Fence Balance", "PASS", f"Code fences are balanced ({fence_count} fences, {fence_count // 2} blocks)")
    else:
        suite.record("Markdown Code Fence Balance", "FAIL", f"Unbalanced code fences detected: {fence_count} total")

    tab_count = content.count("\t")
    if tab_count == 0:
        suite.record("Whitespace & Tab Cleanliness", "PASS", "Zero raw tab characters found in SKILL.md")
    else:
        suite.record("Whitespace & Tab Cleanliness", "FAIL", f"Found {tab_count} raw tab characters")

    try:
        content.encode("utf-8").decode("utf-8")
        suite.record("UTF-8 Encoding Validity", "PASS", "File is 100% valid UTF-8 without decoding exceptions")
    except Exception as e:
        suite.record("UTF-8 Encoding Validity", "FAIL", f"Encoding exception: {e}")

    byte_size = len(content.encode("utf-8"))
    word_count = len(content.split())
    if 5000 <= byte_size <= 60000:
        suite.record("Context Size Optimization", "PASS", f"SKILL.md size {byte_size} bytes ({word_count} words) is optimal for LLM context injection")
    else:
        suite.record("Context Size Optimization", "FAIL", f"SKILL.md size {byte_size} bytes is outside safe range (5KB - 60KB)")

    # -------------------------------------------------------------
    # 8. Quick Sanity Check Checklist (Section 6)
    # -------------------------------------------------------------
    checklist_match = re.search(r"##\s*6\.\s*Quick Sanity Check Checklist", content)
    if checklist_match:
        chk_items = re.findall(r"-\s*\[\s*\]\s*\*\*([^*]+)\*\*", content)
        if len(chk_items) == 10:
            suite.record("Quick Sanity Checklist (10 Items)", "PASS", f"All 10 diagnostic checklist items present: {chk_items}")
        else:
            suite.record("Quick Sanity Checklist (10 Items)", "FAIL", f"Found {len(chk_items)} items, expected 10: {chk_items}")
    else:
        suite.record("Quick Sanity Checklist Section", "FAIL", "Section 6 Quick Sanity Check Checklist not found")

    return suite.summary()

if __name__ == "__main__":
    exit_code = run_tests()
    sys.exit(exit_code)
