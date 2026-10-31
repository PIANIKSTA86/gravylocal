"""
Adversarial Stress Test Suite for scripts/audit_copy.py
Milestone 1 Challenger 1
"""

import sys
import os
import re
import json
import time
import tempfile
import subprocess
from pathlib import Path
from typing import Dict, Any, List, Tuple

AUDIT_SCRIPT = Path(r"C:\Users\JULIAN\.gemini\config\skills\human-interface-design\scripts\audit_copy.py")
PYTHON_EXE = sys.executable

class AdversarialRunner:
    def __init__(self):
        self.results = []
        self.total_tests = 0
        self.passed_tests = 0
        self.failed_tests = 0
        self.findings_log = []

    def log_result(self, test_name: str, passed: bool, details: str, empirical_data: Dict[str, Any] = None):
        self.total_tests += 1
        if passed:
            self.passed_tests += 1
            status = "PASS"
        else:
            self.failed_tests += 1
            status = "FAIL"
        entry = {
            "test_name": test_name,
            "status": status,
            "passed": passed,
            "details": details,
            "data": empirical_data or {}
        }
        self.results.append(entry)
        print(f"[{status}] {test_name}: {details}")

    def run_cmd(self, args: List[str]) -> Tuple[int, str, str, float]:
        cmd = [PYTHON_EXE, str(AUDIT_SCRIPT)] + args
        start = time.perf_counter()
        res = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8", errors="replace")
        duration = time.perf_counter() - start
        return res.returncode, res.stdout, res.stderr, duration

    def run_on_temp_file(self, content: str, suffix: str = ".md", extra_args: List[str] = None) -> Tuple[int, str, str, Any, float]:
        if extra_args is None:
            extra_args = ["--format", "json"]
        with tempfile.NamedTemporaryFile("w", delete=False, suffix=suffix, encoding="utf-8") as f:
            f.write(content)
            tmp_path = f.name
        try:
            cmd = [PYTHON_EXE, str(AUDIT_SCRIPT), tmp_path] + extra_args
            start = time.perf_counter()
            res = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8", errors="replace")
            duration = time.perf_counter() - start
            parsed_json = None
            if "--format json" in " ".join(extra_args) or "--json" in extra_args or extra_args == ["--format", "json"]:
                try:
                    parsed_json = json.loads(res.stdout)
                except Exception:
                    parsed_json = None
            return res.returncode, res.stdout, res.stderr, parsed_json, duration
        finally:
            try:
                os.remove(tmp_path)
            except:
                pass

    def run_on_temp_bytes(self, data: bytes, suffix: str = ".txt", extra_args: List[str] = None) -> Tuple[int, str, str, Any, float]:
        if extra_args is None:
            extra_args = ["--format", "json"]
        with tempfile.NamedTemporaryFile("wb", delete=False, suffix=suffix) as f:
            f.write(data)
            tmp_path = f.name
        try:
            cmd = [PYTHON_EXE, str(AUDIT_SCRIPT), tmp_path] + extra_args
            start = time.perf_counter()
            res = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8", errors="replace")
            duration = time.perf_counter() - start
            parsed_json = None
            try:
                parsed_json = json.loads(res.stdout)
            except Exception:
                pass
            return res.returncode, res.stdout, res.stderr, parsed_json, duration
        finally:
            try:
                os.remove(tmp_path)
            except:
                pass

    # =========================================================================
    # BATTERY 1: False Positive Stress Tests
    # =========================================================================
    def test_battery_1_false_positives(self):
        print("\n--- BATTERY 1: False Positive Immunity Tests ---")

        # 1.1 Hyphenated CSS classes
        css_snippet = """
        <div class="unleash-container" id="delve-header">
            <span class="border-seamless">Direct message</span>
        </div>
        """
        code, out, err, data, dur = self.run_on_temp_file(css_snippet, suffix=".html")
        buzzwords = data["summary"]["total_buzzwords"] if data else -1
        score = data["summary"]["humanization_score"] if data else -1
        self.log_result(
            "B1.1_hyphenated_css_attributes",
            passed=(buzzwords == 0 and score == 100.0 and code == 0),
            details=f"Exit={code}, Buzzwords={buzzwords}, Score={score}",
            empirical_data={"code": code, "buzzwords": buzzwords, "score": score}
        )

        # 1.2 Color / ID token with # prefix (#elevate)
        # Testing CSS rule: color: #elevate;
        css_color_snippet = """
        .button {
            border-seamless: 1px solid #333;
            color: #elevate;
        }
        """
        code, out, err, data, dur = self.run_on_temp_file(css_color_snippet, suffix=".html")
        buzzwords = data["summary"]["total_buzzwords"] if data else -1
        findings = data["files"][0]["findings"] if (data and data.get("files")) else []
        matched_items = [f["matched_text"] for f in findings]
        has_fp = any("elevate" in m for m in matched_items)
        self.log_result(
            "B1.2_css_color_hash_token_elevate",
            passed=(not has_fp),
            details=f"Exit={code}, Buzzwords={buzzwords}, Matched={matched_items}. False positive triggered on '#elevate' in CSS!" if has_fp else f"Immune to #elevate: buzzwords={buzzwords}",
            empirical_data={"code": code, "findings": findings, "has_false_positive": has_fp}
        )

        # 1.3 CSS variables and prefixed IDs
        css_vars = """
        :root {
            --unleash-theme: #ffffff;
            --supercharge-speed: 250ms;
            --seamless-transition: ease-in-out;
        }
        """
        code, out, err, data, dur = self.run_on_temp_file(css_vars, suffix=".html")
        buzzwords = data["summary"]["total_buzzwords"] if data else -1
        self.log_result(
            "B1.3_css_custom_properties_variables",
            passed=(buzzwords == 0 and code == 0),
            details=f"Exit={code}, Buzzwords={buzzwords}",
            empirical_data={"code": code, "buzzwords": buzzwords}
        )

        # 1.4 Code comments (C-style, HTML, Python)
        comments_snippet = """
        // We will unleash the cache in v2
        # Fostering connection between nodes
        /* Seamlessly handle packet loss */
        <!-- Empower user to toggle dark mode -->
        <p>Real human user interface text.</p>
        """
        code, out, err, data, dur = self.run_on_temp_file(comments_snippet, suffix=".html")
        findings = data["files"][0]["findings"] if (data and data.get("files")) else []
        buzzwords = data["summary"]["total_buzzwords"] if data else -1
        self.log_result(
            "B1.4_code_comments_filtering",
            passed=(buzzwords == 0 and code == 0),
            details=f"Exit={code}, Buzzwords={buzzwords}, Findings={[f['matched_text'] for f in findings]}",
            empirical_data={"code": code, "findings": findings}
        )

        # 1.5 Fenced markdown code blocks
        md_code_block = """
# Developer Guide
Here is the implementation:
```python
def unleash_power():
    # revolutionize everything
    seamless = True
    return elevate(seamless)
```
The above code is an example.
"""
        code, out, err, data, dur = self.run_on_temp_file(md_code_block, suffix=".md")
        findings = data["files"][0]["findings"] if (data and data.get("files")) else []
        buzzwords = data["summary"]["total_buzzwords"] if data else -1
        self.log_result(
            "B1.5_markdown_fenced_code_blocks",
            passed=(buzzwords == 0 and code == 0),
            details=f"Exit={code}, Buzzwords={buzzwords}",
            empirical_data={"code": code, "findings": findings}
        )

        # 1.6 Inline HTML attributes like href="#elevate" or data-action="unleash"
        attr_snippet = """
        <a href="#elevate" data-action="unleash" class="delve-nav">Jump to section</a>
        """
        code, out, err, data, dur = self.run_on_temp_file(attr_snippet, suffix=".html")
        findings = data["files"][0]["findings"] if (data and data.get("files")) else []
        matched_attr = [f["matched_text"] for f in findings]
        has_attr_fp = len(findings) > 0
        self.log_result(
            "B1.6_html_attribute_values_href_and_data",
            passed=(not has_attr_fp),
            details=f"Exit={code}, Matched in attributes: {matched_attr}" if has_attr_fp else "Immune to attributes",
            empirical_data={"code": code, "findings": findings, "has_attr_fp": has_attr_fp}
        )

    # =========================================================================
    # BATTERY 2: True Positive Stress Tests & Vulnerability Mining
    # =========================================================================
    def test_battery_2_true_positives(self):
        print("\n--- BATTERY 2: True Positive & Accent Recall Tests ---")

        # 2.1 Spanish inverted punctuation and accented characters
        es_accents = """
        ¡Desata el potencial! ¿Quieres potenciar tu flujo?
        ¡Sumérgete en este tapiz de oportunidades!
        Un enfoque holístico sin fricción.
        No busques más para tu empresa.
        """
        code, out, err, data, dur = self.run_on_temp_file(es_accents, suffix=".md", extra_args=["--lang", "es", "--format", "json"])
        findings = data["files"][0]["findings"] if (data and data.get("files")) else []
        matched_words = [f["matched_text"].lower() for f in findings]
        
        has_desata = any("desata" in m for m in matched_words)
        has_potenciar = any("potenciar" in m for m in matched_words)
        has_sumergete = any("sumérgete" in m or "sumergete" in m for m in matched_words)
        has_tapiz = any("tapiz" in m for m in matched_words)
        has_holistico = any("holístico" in m or "holistico" in m for m in matched_words)
        has_sin_friccion = any("fricción" in m or "friccion" in m for m in matched_words)
        has_no_busques_mas = any("no busques más" in m or "no busques mas" in m for m in matched_words)

        all_detected = (has_desata and has_potenciar and has_sumergete and has_tapiz and has_holistico and has_sin_friccion and has_no_busques_mas)
        self.log_result(
            "B2.1_spanish_accents_and_inverted_punctuation",
            passed=all_detected,
            details=f"Detected: desata={has_desata}, potenciar={has_potenciar}, sumérgete={has_sumergete}, tapiz={has_tapiz}, holístico={has_holistico}, sin fricción={has_sin_friccion}, no busques más={has_no_busques_mas}. Total={len(findings)}",
            empirical_data={"matched_words": matched_words, "all_detected": all_detected}
        )

        # 2.2 Uppercase & Mixed Case Clichés
        upper_text = """
        UNLEASH THE REVOLUTIONARY POWER OF YOUR DATA.
        DeLvE INTO THE TAPESTRY OF BESPOKE SOLUTIONS.
        OUR ROBUST PLATFORM WILL SUPERCHARGE YOUR EFFICIENCY.
        """
        code, out, err, data, dur = self.run_on_temp_file(upper_text, suffix=".txt")
        findings = data["files"][0]["findings"] if (data and data.get("files")) else []
        matched = [f["matched_text"].upper() for f in findings]
        req = ["UNLEASH", "DELVE", "TAPESTRY", "BESPOKE", "ROBUST", "SUPERCHARGE"]
        detected_all = all(any(r in m for m in matched) for r in req)
        self.log_result(
            "B2.2_uppercase_and_mixed_case_cliches",
            passed=detected_all,
            details=f"Matched={matched}, Found {len(findings)} buzzwords",
            empirical_data={"matched": matched}
        )

        # 2.3 Quoted Clichés (single & double quotes)
        quoted_text = """
        He promised an "effortless" onboarding and 'seamless' transitions.
        They call it a "game-changer" in the "realm" of analytics.
        """
        code, out, err, data, dur = self.run_on_temp_file(quoted_text, suffix=".txt")
        findings = data["files"][0]["findings"] if (data and data.get("files")) else []
        matched = [f["matched_text"].lower() for f in findings]
        req = ["effortless", "seamless", "game-changer", "realm"]
        detected_all = all(any(r in m for m in matched) for r in req)
        self.log_result(
            "B2.3_quoted_cliches",
            passed=detected_all,
            details=f"Matched={matched}",
            empirical_data={"matched": matched}
        )

        # 2.4 Structural Formulas (EN & ES)
        formula_text = """
        Where speed meets reliability in cloud systems.
        Donde la potencia se encuentra con el control total.
        Welcome to the future of enterprise software.
        Bienvenidos al futuro de la gestión de proyectos.
        Say goodbye to manual spreadsheets, and say hello to automated reports.
        Dile adiós a la lentitud, y dale la bienvenida a la agilidad.
        The all-in-one platform to revolutionize your workflow.
        La plataforma todo en uno para revolucionar tu equipo.
        In today's fast-paced world, teams need clarity.
        En el mundo acelerado de hoy, cada segundo cuenta.
        """
        code, out, err, data, dur = self.run_on_temp_file(formula_text, suffix=".md")
        total_formulas = data["summary"]["total_formulas"] if data else -1
        self.log_result(
            "B2.4_structural_formula_recall_en_es",
            passed=(total_formulas >= 10),
            details=f"Formulas detected={total_formulas} / 10 expected, Exit={code}",
            empirical_data={"total_formulas": total_formulas}
        )

        # 2.5 Triad Parallelism Detection
        triad_text = """
        Our core benefits:
        - Boost your daily workflow speed by twenty percent
        - Scale your distributed engineering team across continents
        - Save four hours every single week with ease
        """
        code, out, err, data, dur = self.run_on_temp_file(triad_text, suffix=".md")
        total_triads = data["summary"]["total_triads"] if data else -1
        self.log_result(
            "B2.5_triad_parallelism_detection",
            passed=(total_triads >= 1),
            details=f"Triads detected={total_triads}, Exit={code}",
            empirical_data={"total_triads": total_triads}
        )

        # 2.6 CRITICAL STRESS TEST: Markdown Headings Blindspot
        # Line 356 has `if stripped.startswith("#"): continue` which skips all markdown headings!
        md_headings = """
# Unleash the Power of AI
## Supercharge Your Team Workflow
### Seamless and Effortless Integration
#### Delve into the Infinite Tapestry
##### Revolutionize Everything Today
"""
        code, out, err, data, dur = self.run_on_temp_file(md_headings, suffix=".md")
        total_buzzwords = data["summary"]["total_buzzwords"] if data else -1
        score = data["summary"]["humanization_score"] if data else -1
        # An accurate copy auditor MUST detect buzzwords in markdown titles/headers!
        # If total_buzzwords == 0, it means all headings are blind-skipped.
        headings_detected = total_buzzwords >= 5
        self.log_result(
            "B2.6_markdown_headings_buzzword_recall",
            passed=headings_detected,
            details=f"Exit={code}, Headings Buzzwords={total_buzzwords}/7, Score={score}. " +
                    ("CRITICAL VULNERABILITY: Line 356 `stripped.startswith('#')` skips all Markdown headings!" if not headings_detected else "Markdown headings audited correctly"),
            empirical_data={"total_buzzwords": total_buzzwords, "score": score, "critical_blindspot": not headings_detected}
        )

    # =========================================================================
    # BATTERY 3: Extreme Boundary Conditions
    # =========================================================================
    def test_battery_3_extreme_boundaries(self):
        print("\n--- BATTERY 3: Extreme Boundary Conditions ---")

        # 3.1 Empty file (0 bytes)
        code, out, err, data, dur = self.run_on_temp_file("", suffix=".md")
        score = data["summary"]["humanization_score"] if data else -1
        self.log_result(
            "B3.1_empty_file_zero_bytes",
            passed=(code == 0 and score == 100.0),
            details=f"Exit={code}, Score={score}, Time={dur*1000:.1f}ms",
            empirical_data={"code": code, "score": score, "duration_ms": dur*1000}
        )

        # 3.2 Single word clean file
        code, out, err, data, dur = self.run_on_temp_file("Architecture", suffix=".txt")
        score = data["summary"]["humanization_score"] if data else -1
        self.log_result(
            "B3.2_single_word_clean",
            passed=(code == 0 and score == 100.0),
            details=f"Exit={code}, Score={score}",
            empirical_data={"code": code, "score": score}
        )

        # 3.3 Single word slop file
        code, out, err, data, dur = self.run_on_temp_file("unleash", suffix=".txt")
        score = data["summary"]["humanization_score"] if data else -1
        self.log_result(
            "B3.3_single_word_slop",
            passed=(code == 1 and score == 0.0),
            details=f"Exit={code}, Score={score} (Correctly failed on 100% density)",
            empirical_data={"code": code, "score": score}
        )

        # 3.4 Whitespace and punctuation only
        ws_text = "   \n\n\t   \n   !??... -- -- \n   "
        code, out, err, data, dur = self.run_on_temp_file(ws_text, suffix=".txt")
        score = data["summary"]["humanization_score"] if data else -1
        self.log_result(
            "B3.4_whitespace_and_punctuation_only",
            passed=(code == 0 and score == 100.0),
            details=f"Exit={code}, Score={score}",
            empirical_data={"code": code, "score": score}
        )

        # 3.5 Unicode and Emojis
        emoji_text = """
        🚀 Unleash your potential ✨ with our seamless platform! 💡
        ⚡ High speed processing 🌐 across global nodes 🔒.
        """
        code, out, err, data, dur = self.run_on_temp_file(emoji_text, suffix=".md")
        findings = data["files"][0]["findings"] if (data and data.get("files")) else []
        matched = [f["matched_text"] for f in findings]
        self.log_result(
            "B3.5_unicode_emojis_support",
            passed=(code == 1 and len(findings) >= 2),
            details=f"Exit={code}, Findings={matched}, No UnicodeEncode/Decode crash",
            empirical_data={"code": code, "findings": matched}
        )

        # 3.6 Binary bytes handling
        binary_data = b"\x00\x01\x02\xff\xfe\x00\xaa\xbb\xcc\xdd\xee" + b" unleash " + b"\x00\xff\xfe"
        code, out, err, data, dur = self.run_on_temp_bytes(binary_data, suffix=".txt")
        survived = (data is not None and code in (0, 1))
        self.log_result(
            "B3.6_binary_bytes_resilience",
            passed=survived,
            details=f"Exit={code}, Survived crash={survived}, Findings={data['summary']['total_buzzwords'] if data else 0}",
            empirical_data={"code": code, "survived": survived}
        )

        # 3.7 10MB text stress test
        print("  Generating 10MB test file...")
        line_clean = "This is a clean high quality software documentation line with factual statements.\n"
        target_size = 10 * 1024 * 1024 # 10 MB
        line_bytes = len(line_clean.encode("utf-8"))
        repeat_count = target_size // line_bytes + 1

        with tempfile.NamedTemporaryFile("w", delete=False, suffix=".txt", encoding="utf-8") as f:
            for _ in range(repeat_count):
                f.write(line_clean)
            large_file_path = f.name

        try:
            actual_size = os.path.getsize(large_file_path)
            actual_mb = actual_size / (1024 * 1024)
            print(f"  Running audit on {actual_mb:.2f} MB file...")
            start_t = time.perf_counter()
            cmd = [PYTHON_EXE, str(AUDIT_SCRIPT), large_file_path, "--format", "json"]
            res = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8", errors="replace")
            dur = time.perf_counter() - start_t
            parsed = None
            try:
                parsed = json.loads(res.stdout)
            except:
                pass
            score = parsed["summary"]["humanization_score"] if parsed else -1
            words = parsed["summary"]["total_words"] if parsed else -1
            self.log_result(
                "B3.7_10mb_large_file_stress",
                passed=(res.returncode == 0 and score == 100.0 and dur < 60.0),
                details=f"Exit={res.returncode}, Size={actual_mb:.2f}MB, Words={words:,}, Duration={dur:.2f}s, Score={score}",
                empirical_data={"size_mb": actual_mb, "duration_s": dur, "words": words, "score": score}
            )
        finally:
            try:
                os.remove(large_file_path)
            except:
                pass

    # =========================================================================
    # BATTERY 4: CLI Flags & Exit Codes
    # =========================================================================
    def test_battery_4_cli_flags(self):
        print("\n--- BATTERY 4: CLI Flags & Exit Codes Tests ---")

        mild_slop = "Our platform is robust and fast. Built for engineers."

        # 4.1 --threshold 95 with score ~78 (Should fail, exit 1)
        code, out, err, data, dur = self.run_on_temp_file(mild_slop, extra_args=["--threshold", "95", "--format", "json"])
        score = data["summary"]["humanization_score"] if data else -1
        self.log_result(
            "B4.1_cli_threshold_95_fail",
            passed=(code == 1 and score < 95.0),
            details=f"Exit={code}, Score={score} < 95.0",
            empirical_data={"code": code, "score": score}
        )

        # 4.2 --threshold 0 with slop (Should pass, exit 0)
        code, out, err, data, dur = self.run_on_temp_file(mild_slop, extra_args=["--threshold", "0", "--format", "json"])
        score = data["summary"]["humanization_score"] if data else -1
        passed_summary = data["summary"]["passed"] if data else False
        self.log_result(
            "B4.2_cli_threshold_0_pass",
            passed=(code == 0 and passed_summary is True),
            details=f"Exit={code}, Passed={passed_summary}, Score={score} >= 0",
            empirical_data={"code": code, "score": score, "passed": passed_summary}
        )

        # 4.3 --lang es (Ignore English buzzwords)
        en_slop = "We empower teams to unleash innovation."
        code, out, err, data, dur = self.run_on_temp_file(en_slop, extra_args=["--lang", "es", "--format", "json"])
        buzzwords = data["summary"]["total_buzzwords"] if data else -1
        self.log_result(
            "B4.3_cli_lang_es_ignores_english",
            passed=(buzzwords == 0 and code == 0),
            details=f"Exit={code}, Buzzwords={buzzwords} (EN buzzwords ignored under --lang es)",
            empirical_data={"code": code, "buzzwords": buzzwords}
        )

        # 4.4 --lang en (Ignore Spanish buzzwords)
        es_slop = "Desata el potencial de tu equipo hoy."
        code, out, err, data, dur = self.run_on_temp_file(es_slop, extra_args=["--lang", "en", "--format", "json"])
        buzzwords = data["summary"]["total_buzzwords"] if data else -1
        self.log_result(
            "B4.4_cli_lang_en_ignores_spanish",
            passed=(buzzwords == 0 and code == 0),
            details=f"Exit={code}, Buzzwords={buzzwords} (ES buzzwords ignored under --lang en)",
            empirical_data={"code": code, "buzzwords": buzzwords}
        )

        # 4.5 --format json vs --json flag equivalence (tested on SAME file)
        with tempfile.NamedTemporaryFile("w", delete=False, suffix=".md", encoding="utf-8") as f:
            f.write("Clean documentation file for json flag comparison.")
            same_file = f.name
        try:
            _, _, _, d1, _ = self.run_on_temp_file("", extra_args=["--format", "json"]) # scratch
            cmd1 = [PYTHON_EXE, str(AUDIT_SCRIPT), same_file, "--format", "json"]
            r1 = subprocess.run(cmd1, capture_output=True, text=True, encoding="utf-8")
            cmd2 = [PYTHON_EXE, str(AUDIT_SCRIPT), same_file, "--json"]
            r2 = subprocess.run(cmd2, capture_output=True, text=True, encoding="utf-8")
            j1 = json.loads(r1.stdout)
            j2 = json.loads(r2.stdout)
            equiv = (j1 == j2 and r1.returncode == r2.returncode == 0)
            self.log_result(
                "B4.5_cli_format_json_and_flag_json_equivalence",
                passed=equiv,
                details=f"Summary match={equiv}, ReturnCodes={r1.returncode}/{r2.returncode}",
                empirical_data={"equiv": equiv}
            )
        finally:
            try:
                os.remove(same_file)
            except:
                pass

        # 4.6 Non-existent path handling (Exit code 2)
        code, out, err, dur = self.run_cmd(["non_existent_path_xyz_123.md"])
        self.log_result(
            "B4.6_cli_non_existent_path_exit_2",
            passed=(code == 2 and "does not exist" in err.lower()),
            details=f"Exit={code}, Stderr='{err.strip()}'",
            empirical_data={"code": code, "stderr": err.strip()}
        )

        # 4.7 Invalid CLI argument choices (Exit code 2)
        code, out, err, dur = self.run_cmd(["some_file.md", "--lang", "fr"])
        self.log_result(
            "B4.7_cli_invalid_lang_choice_exit_2",
            passed=(code == 2),
            details=f"Exit={code}",
            empirical_data={"code": code}
        )

        # 4.8 Directory traversal and ignored directories (.git, node_modules)
        with tempfile.TemporaryDirectory() as tmp_dir:
            dir_path = Path(tmp_dir)
            (dir_path / "index.html").write_text("<p>Hello world</p>", encoding="utf-8")
            sub = dir_path / "sub"
            sub.mkdir()
            (sub / "page.tsx").write_text("const msg = 'unleash';", encoding="utf-8")
            node_m = dir_path / "node_modules"
            node_m.mkdir()
            (node_m / "vendor.js").write_text("function elevate() { return 'delve'; }", encoding="utf-8")

            code, out, err, dur = self.run_cmd([str(dir_path), "--format", "json"])
            parsed = json.loads(out)
            scanned_files = [f["file_path"] for f in parsed["files"]]
            has_node_modules = any("node_modules" in p for p in scanned_files)
            total_files = parsed["summary"]["total_files"]
            self.log_result(
                "B4.8_directory_scan_ignores_node_modules",
                passed=(not has_node_modules and total_files == 2),
                details=f"Total files={total_files}, Ignored node_modules={not has_node_modules}",
                empirical_data={"total_files": total_files, "scanned_files": scanned_files}
            )

    def run_all(self):
        print("================================================================================")
        print("          EMPIRICAL ADVERSARIAL STRESS TEST HARNESS — M1 CHALLENGER 1           ")
        print("================================================================================")
        t_start = time.perf_counter()
        self.test_battery_1_false_positives()
        self.test_battery_2_true_positives()
        self.test_battery_3_extreme_boundaries()
        self.test_battery_4_cli_flags()
        total_dur = time.perf_counter() - t_start

        print("\n================================================================================")
        print(f"TEST RUN COMPLETED IN {total_dur:.2f}s")
        print(f"Total Tests Run: {self.total_tests}")
        print(f"PASSED:          {self.passed_tests}")
        print(f"FAILED:          {self.failed_tests}")
        print("================================================================================")

        return {
            "total": self.total_tests,
            "passed": self.passed_tests,
            "failed": self.failed_tests,
            "duration_s": total_dur,
            "results": self.results
        }

if __name__ == "__main__":
    runner = AdversarialRunner()
    summary = runner.run_all()
    res_path = Path(__file__).parent / "adversarial_results.json"
    with open(res_path, "w", encoding="utf-8") as f:
        json.dump(summary, f, indent=2)
    print(f"Detailed empirical results saved to: {res_path}")
    sys.exit(0 if summary["failed"] == 0 else 1)
