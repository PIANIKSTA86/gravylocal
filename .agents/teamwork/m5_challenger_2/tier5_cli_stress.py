#!/usr/bin/env python3
"""
Tier 5 Adversarial Coverage Hardening Suite: CLI & Tooling (scripts/audit_copy.py)
---------------------------------------------------------------------------------
White-box stress testing targeting:
1. Extreme CLI parameters (--threshold 0, 100, negative, non-integer, nan/inf, flags).
2. Language filtering (--lang en, es, all, invalid, accents).
3. File & Directory inputs (single file, directory, non-existent, empty, read-only, huge, binary, corrupt).
4. Code masking edge cases (multi-line comments, ATX headings, HTML hex, code blocks, backticks, string literals).
5. Scoring boundary math (monotonicity, clamping, stability, density, quality tiers).

Author: m5_challenger_2 (Empirical Challenger)
"""

import os
import sys
import json
import stat
import math
import shutil
import tempfile
import unittest
import subprocess
from pathlib import Path
from typing import Tuple, List, Dict, Any, Optional

# Locate target script
TARGET_SCRIPT = Path(r"C:\Users\JULIAN\.gemini\config\skills\human-interface-design\scripts\audit_copy.py")
PYTHON_EXE = sys.executable


def run_cli(args: List[str], timeout: float = 30.0) -> Tuple[int, str, str]:
    """Execute audit_copy.py with specified arguments."""
    cmd = [PYTHON_EXE, str(TARGET_SCRIPT)] + args
    proc = subprocess.run(
        cmd,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        encoding="utf-8",
        errors="replace",
        timeout=timeout
    )
    return proc.returncode, proc.stdout, proc.stderr


class TestExtremeCLIParameters(unittest.TestCase):
    """Stress test extreme and adversarial CLI arguments."""

    @classmethod
    def setUpClass(cls):
        cls.temp_dir = Path(tempfile.mkdtemp(prefix="tier5_cli_params_"))
        cls.clean_file = cls.temp_dir / "clean.txt"
        cls.clean_file.write_text("This is an authentic human sentence crafted with genuine care and clarity.", encoding="utf-8")
        
        cls.slop_file = cls.temp_dir / "slop.txt"
        cls.slop_file.write_text("Unleash the power to supercharge your workflow with seamless bespoke synergy.", encoding="utf-8")

    @classmethod
    def tearDownClass(cls):
        shutil.rmtree(cls.temp_dir, ignore_errors=True)

    def test_cli_threshold_zero(self):
        """--threshold 0 should pass even heavily slop-ridden files if score >= 0.0"""
        rc, out, err = run_cli(["--threshold", "0", str(self.slop_file)])
        self.assertEqual(rc, 0, f"Expected returncode 0 with --threshold 0, got {rc}. Out: {out}")
        self.assertIn("PASSED", out)

    def test_cli_threshold_100_clean(self):
        """--threshold 100 should pass completely clean human copy"""
        rc, out, err = run_cli(["--threshold", "100", str(self.clean_file)])
        self.assertEqual(rc, 0, f"Expected returncode 0 with --threshold 100 on clean file, got {rc}")
        self.assertIn("100.0 / 100.0", out)
        self.assertIn("PASSED", out)

    def test_cli_threshold_100_slop(self):
        """--threshold 100 must fail if any slop reduces score below 100"""
        rc, out, err = run_cli(["--threshold", "100", str(self.slop_file)])
        self.assertEqual(rc, 1, f"Expected returncode 1 with --threshold 100 on slop file, got {rc}")
        self.assertIn("FAILED", out)

    def test_cli_negative_threshold(self):
        """--threshold -50 should parse as float and pass any score >= -50"""
        rc, out, err = run_cli(["--threshold", "-50", str(self.slop_file)])
        self.assertEqual(rc, 0, f"Negative threshold should allow pass, got {rc}")
        self.assertIn("PASSED", out)

    def test_cli_threshold_greater_than_100(self):
        """--threshold 120 should fail even clean copy since max score is 100.0"""
        rc, out, err = run_cli(["--threshold", "120", str(self.clean_file)])
        self.assertEqual(rc, 1, f"Threshold > 100 should fail clean file, got {rc}")
        self.assertIn("FAILED", out)

    def test_cli_non_integer_threshold(self):
        """--threshold with float value e.g. 84.5 should parse accurately"""
        rc, out, err = run_cli(["--threshold", "84.5", "--json", str(self.clean_file)])
        self.assertEqual(rc, 0)
        data = json.loads(out)
        self.assertEqual(data["summary"]["threshold"], 84.5)

    def test_cli_invalid_threshold_string(self):
        """--threshold with invalid non-numeric string should exit with code 2"""
        rc, out, err = run_cli(["--threshold", "invalid_value", str(self.clean_file)])
        self.assertEqual(rc, 2, f"Expected exit code 2 for invalid float, got {rc}")
        self.assertIn("invalid float value", err)

    def test_cli_threshold_nan(self):
        """--threshold nan should fail comparisons (x >= nan is always False), exiting 1"""
        rc, out, err = run_cli(["--threshold", "nan", str(self.clean_file)])
        self.assertEqual(rc, 1, f"Expected exit code 1 with nan threshold, got {rc}")
        self.assertIn("FAILED", out)

    def test_cli_threshold_inf(self):
        """--threshold inf should fail comparisons (x >= inf is False), exiting 1"""
        rc, out, err = run_cli(["--threshold", "inf", str(self.clean_file)])
        self.assertEqual(rc, 1, f"Expected exit code 1 with inf threshold, got {rc}")
        self.assertIn("FAILED", out)

    def test_cli_json_flags(self):
        """Verify --json and --format json produce valid parseable JSON output"""
        for flag in [["--json"], ["--format", "json"]]:
            rc, out, err = run_cli(flag + [str(self.clean_file)])
            self.assertEqual(rc, 0)
            data = json.loads(out)
            self.assertIn("summary", data)
            self.assertIn("files", data)
            self.assertEqual(data["summary"]["humanization_score"], 100.0)

    def test_cli_strict_flag(self):
        """--strict flag must fail even if score >= threshold when any violation is present"""
        # slop file with threshold 0 passes normally, but with --strict must fail
        rc, out, err = run_cli(["--threshold", "0", "--strict", str(self.slop_file)])
        self.assertEqual(rc, 1, f"Expected --strict to fail when violations exist, got {rc}")


class TestLanguageFiltering(unittest.TestCase):
    """Stress test multilingual dictionary switching and filtering."""

    @classmethod
    def setUpClass(cls):
        cls.temp_dir = Path(tempfile.mkdtemp(prefix="tier5_lang_"))
        
        # File with English slop only
        cls.en_file = cls.temp_dir / "en_sample.txt"
        cls.en_file.write_text("We empower users with cutting-edge tools to unleash their potential.", encoding="utf-8")
        
        # File with Spanish slop only
        cls.es_file = cls.temp_dir / "es_sample.txt"
        cls.es_file.write_text("Una solución para desatar el potencial de tu equipo sin esfuerzo y de vanguardia.", encoding="utf-8")

        # File with Spanish accented words
        cls.es_accents = cls.temp_dir / "es_accents.txt"
        cls.es_accents.write_text("Sumergirte en el tapiz holístico sin fricción. No busques más.", encoding="utf-8")

    @classmethod
    def tearDownClass(cls):
        shutil.rmtree(cls.temp_dir, ignore_errors=True)

    def test_lang_en_ignores_es(self):
        """--lang en should NOT detect Spanish slop words in Spanish file"""
        rc, out, err = run_cli(["--lang", "en", "--json", str(self.es_file)])
        self.assertEqual(rc, 0)
        data = json.loads(out)
        self.assertEqual(data["summary"]["total_buzzwords"], 0)
        self.assertEqual(data["summary"]["humanization_score"], 100.0)

    def test_lang_es_ignores_en(self):
        """--lang es should NOT detect English slop words in English file"""
        rc, out, err = run_cli(["--lang", "es", "--json", str(self.en_file)])
        self.assertEqual(rc, 0)
        data = json.loads(out)
        self.assertEqual(data["summary"]["total_buzzwords"], 0)
        self.assertEqual(data["summary"]["humanization_score"], 100.0)

    def test_lang_all_detects_both(self):
        """--lang all must detect both English and Spanish slop words"""
        rc_en, out_en, _ = run_cli(["--lang", "all", "--json", str(self.en_file)])
        data_en = json.loads(out_en)
        self.assertGreater(data_en["summary"]["total_buzzwords"], 0)

        rc_es, out_es, _ = run_cli(["--lang", "all", "--json", str(self.es_file)])
        data_es = json.loads(out_es)
        self.assertGreater(data_es["summary"]["total_buzzwords"], 0)

    def test_lang_invalid_choice(self):
        """--lang with invalid language must exit 2 with choices error"""
        rc, out, err = run_cli(["--lang", "fr", str(self.en_file)])
        self.assertEqual(rc, 2)
        self.assertIn("invalid choice", err)

    def test_spanish_accented_patterns(self):
        """Ensure Spanish accented terms (sumergirte, holístico, fricción) are matched"""
        rc, out, err = run_cli(["--lang", "es", "--json", str(self.es_accents)])
        data = json.loads(out)
        matched_words = [item["matched_text"].lower() for item in data["files"][0]["findings"]]
        # Check matched accented words
        self.assertTrue(any("holístico" in m or "holistico" in m for m in matched_words))
        self.assertTrue(any("fricción" in m or "friccion" in m for m in matched_words))
        self.assertTrue(any("no busques más" in m or "no busques mas" in m for m in matched_words))


class TestFileDirectoryInputs(unittest.TestCase):
    """Stress test file and directory discovery, encoding, size, and corruption."""

    @classmethod
    def setUpClass(cls):
        cls.temp_dir = Path(tempfile.mkdtemp(prefix="tier5_file_inputs_"))

    @classmethod
    def tearDownClass(cls):
        shutil.rmtree(cls.temp_dir, ignore_errors=True)

    def test_non_existent_target(self):
        """Target path that does not exist must exit 2 with error message"""
        missing = self.temp_dir / "does_not_exist_file.txt"
        rc, out, err = run_cli([str(missing)])
        self.assertEqual(rc, 2)
        self.assertIn("Target path does not exist", err)

    def test_empty_file(self):
        """Empty 0-byte file must exit 0 with score 100.0 and Tier 1 voice"""
        empty_f = self.temp_dir / "empty.txt"
        empty_f.write_text("", encoding="utf-8")
        rc, out, err = run_cli(["--json", str(empty_f)])
        self.assertEqual(rc, 0)
        data = json.loads(out)
        self.assertEqual(data["summary"]["total_words"], 0)
        self.assertEqual(data["summary"]["humanization_score"], 100.0)
        self.assertEqual(data["summary"]["quality_tier"], "Tier 1: Mastercrafted Human Voice")

    def test_empty_directory(self):
        """Empty directory must return 0 with 0 files scanned cleanly"""
        empty_d = self.temp_dir / "empty_dir"
        empty_d.mkdir(parents=True, exist_ok=True)
        rc, out, err = run_cli(["--json", str(empty_d)])
        self.assertEqual(rc, 0)
        data = json.loads(out)
        self.assertEqual(data["summary"]["total_files"], 0)
        self.assertTrue(data["summary"]["passed"])

    def test_directory_with_unsupported_extensions_only(self):
        """Directory containing only .py, .png, .pdf should report 0 supported files"""
        sub = self.temp_dir / "unsupported_dir"
        sub.mkdir(parents=True, exist_ok=True)
        (sub / "script.py").write_text("print('empower')", encoding="utf-8")
        (sub / "image.png").write_bytes(b"\x89PNG\r\n\x1a\n")
        rc, out, err = run_cli(["--json", str(sub)])
        self.assertEqual(rc, 0)
        data = json.loads(out)
        self.assertEqual(data["summary"]["total_files"], 0)

    def test_single_file_unsupported_extension_direct_audit(self):
        """If an individual file is explicitly passed, it should be audited directly"""
        py_f = self.temp_dir / "single_test.py"
        py_f.write_text("def test(): return 'empower users with robust tools'", encoding="utf-8")
        rc, out, err = run_cli(["--json", str(py_f)])
        self.assertEqual(rc, 1) # Has empower and robust -> fails threshold 80
        data = json.loads(out)
        self.assertEqual(data["summary"]["total_files"], 1)
        self.assertGreater(data["summary"]["total_buzzwords"], 0)

    def test_read_only_file(self):
        """Read-only file should be opened in 'r' mode and audited without permission error"""
        ro_f = self.temp_dir / "readonly.txt"
        ro_f.write_text("A simple authentic message for readers.", encoding="utf-8")
        os.chmod(ro_f, stat.S_IREAD)
        try:
            rc, out, err = run_cli(["--json", str(ro_f)])
            self.assertEqual(rc, 0)
            data = json.loads(out)
            self.assertEqual(data["summary"]["humanization_score"], 100.0)
        finally:
            os.chmod(ro_f, stat.S_IWRITE | stat.S_IREAD)

    def test_binary_file_direct(self):
        """Binary file passed directly must not crash with UnicodeDecodeError"""
        bin_f = self.temp_dir / "binary.bin"
        # Write arbitrary binary junk including invalid UTF-8 sequences
        bin_f.write_bytes(b"\x00\xff\xfe\x80\x90\xaa\xbb\xcc" * 100)
        rc, out, err = run_cli([str(bin_f)])
        self.assertNotIn("UnicodeDecodeError", err)
        self.assertIn("HUMAN INTERFACE DESIGN", out)

    def test_corrupt_non_utf8_encoding(self):
        """File containing Latin-1 / Windows-1252 high bytes must be decoded with replacement chars"""
        corrupt_f = self.temp_dir / "corrupt.txt"
        # 0xE9, 0xE8, 0xE0, 0xF1 are accented chars in Latin-1, invalid standalone in UTF-8
        corrupt_f.write_bytes(b"Cafe con leche para el desayuno diario: \xe9\xe8\xe0\xf1")
        rc, out, err = run_cli(["--json", str(corrupt_f)])
        self.assertEqual(rc, 0)
        data = json.loads(out)
        self.assertGreater(data["summary"]["total_words"], 0)
        self.assertEqual(data["summary"]["humanization_score"], 100.0)

    def test_huge_file_performance(self):
        """Large text file (1.4MB, 20,000 lines) should complete within 25 seconds (linear O(N) scaling)"""
        huge_f = self.temp_dir / "huge.txt"
        sentence = "Authentic clarity delivers reliable outcome for users every single day.\n"
        with open(huge_f, "w", encoding="utf-8") as f:
            for _ in range(20000):
                f.write(sentence)
        
        rc, out, err = run_cli(["--json", str(huge_f)], timeout=25.0)
        self.assertEqual(rc, 0)
        data = json.loads(out)
        self.assertGreater(data["summary"]["total_words"], 100000)
        self.assertEqual(data["summary"]["humanization_score"], 100.0)

    def test_deeply_nested_directory_discovery(self):
        """Files nested 10 levels deep must be discovered recursively"""
        deep_dir = self.temp_dir / "l1" / "l2" / "l3" / "l4" / "l5" / "l6" / "l7" / "l8" / "l9" / "l10"
        deep_dir.mkdir(parents=True, exist_ok=True)
        deep_f = deep_dir / "deep.md"
        deep_f.write_text("Human interface design principles.", encoding="utf-8")
        
        rc, out, err = run_cli(["--json", str(self.temp_dir / "l1")])
        self.assertEqual(rc, 0)
        data = json.loads(out)
        scanned_paths = [Path(f["file_path"]).name for f in data["files"]]
        self.assertIn("deep.md", scanned_paths)


class TestCodeMaskingEdgeCases(unittest.TestCase):
    """Stress test code masking heuristics, ATX headings, HTML tags, and code blocks."""

    @classmethod
    def setUpClass(cls):
        cls.temp_dir = Path(tempfile.mkdtemp(prefix="tier5_masking_"))

    @classmethod
    def tearDownClass(cls):
        shutil.rmtree(cls.temp_dir, ignore_errors=True)

    def test_block_comment_masking(self):
        """Multi-line /* ... */ block comments must mask buzzwords inside them"""
        css_f = self.temp_dir / "style.js"
        css_f.write_text("""
        /*
         * This comment mentions unleash and supercharge.
         * It should be ignored by the copy scanner.
         */
        const title = "Genuine clear text for real humans";
        """, encoding="utf-8")
        rc, out, err = run_cli(["--json", str(css_f)])
        self.assertEqual(rc, 0)
        data = json.loads(out)
        self.assertEqual(data["summary"]["total_buzzwords"], 0)
        self.assertEqual(data["summary"]["humanization_score"], 100.0)

    def test_single_line_block_comment_preserves_code(self):
        """Single-line /* comment */ should be stripped while preserving subsequent code"""
        js_f = self.temp_dir / "inline_comment.js"
        js_f.write_text("""
        /* ignored comment */ const msg = "empower your team";
        """, encoding="utf-8")
        rc, out, err = run_cli(["--json", str(js_f)])
        data = json.loads(out)
        # 'empower' in msg must still be detected even after inline comment
        self.assertEqual(data["summary"]["total_buzzwords"], 1)

    def test_atx_headings_in_markdown(self):
        """Markdown ATX headings (#, ###, ######) must have their text audited for buzzwords"""
        md_f = self.temp_dir / "headings.md"
        md_f.write_text("""
# Unleash Your Workflow
### Elevate Your Team
###### Supercharge Speed
        """, encoding="utf-8")
        rc, out, err = run_cli(["--json", str(md_f)])
        data = json.loads(out)
        self.assertEqual(data["summary"]["total_buzzwords"], 3)

    def test_closed_atx_headings(self):
        """Closed ATX headings with trailing # should also be properly audited"""
        md_f = self.temp_dir / "closed_heading.md"
        md_f.write_text("""
# Revolutionize Your Code #
        """, encoding="utf-8")
        rc, out, err = run_cli(["--json", str(md_f)])
        data = json.loads(out)
        self.assertEqual(data["summary"]["total_buzzwords"], 1)

    def test_html_hex_colors_and_attributes(self):
        """HTML attributes containing #hex or anchor hashtags should NOT trigger false buzzwords"""
        html_f = self.temp_dir / "page.html"
        html_f.write_text("""
        <div style="color: #robust; background: #c0ffee;" id="seamless" class="empower">
            Clean human headline without robotic buzzwords.
        </div>
        <a href="#seamless">Go to section</a>
        """, encoding="utf-8")
        rc, out, err = run_cli(["--json", str(html_f)])
        data = json.loads(out)
        # HTML tags and attributes should be masked, so 0 buzzwords in user-facing copy
        self.assertEqual(data["summary"]["total_buzzwords"], 0)
        self.assertEqual(data["summary"]["humanization_score"], 100.0)

    def test_markdown_fenced_code_blocks(self):
        """Buzzwords inside markdown ``` code blocks must be ignored"""
        md_f = self.temp_dir / "code_block.md"
        md_f.write_text("""
# Documentation
Here is an example code snippet:
```python
def unleash_power():
    supercharge_engine()
    return "empower"
```
Genuine text following the code block.
        """, encoding="utf-8")
        rc, out, err = run_cli(["--json", str(md_f)])
        data = json.loads(out)
        self.assertEqual(data["summary"]["total_buzzwords"], 0)
        self.assertEqual(data["summary"]["humanization_score"], 100.0)

    def test_hyphenated_compound_identifiers(self):
        """Hyphenated identifiers like 'empower-token' should not match isolated 'empower'"""
        js_f = self.temp_dir / "compound.js"
        js_f.write_text("""
        const className = "empower-button-wrapper";
        const id = "seamless-navigation-bar";
        """, encoding="utf-8")
        rc, out, err = run_cli(["--json", str(js_f)])
        data = json.loads(out)
        self.assertEqual(data["summary"]["total_buzzwords"], 0)

    # --------------------------------------------------------------------------
    # Documented Architectural Gaps (Adversarial White-Box Exposures)
    # --------------------------------------------------------------------------

    def test_gap_formula_unmasked_inside_code_blocks(self):
        """GAP: Structural formulas inside markdown code blocks ``` are NOT masked (trigger false positives)"""
        md_f = self.temp_dir / "gap_formula_in_code.md"
        md_f.write_text("""
```markdown
Say goodbye to manual tracking, say hello to automated sync
```
        """, encoding="utf-8")
        rc, out, err = run_cli(["--json", str(md_f)])
        data = json.loads(out)
        # Gap confirmed: audit_copy.py scans raw lines for formulas without checking in_code_block
        self.assertEqual(data["summary"]["total_formulas"], 1)

    def test_gap_triad_unmasked_inside_code_blocks(self):
        """GAP: Triad parallelism sequences inside markdown code blocks ``` are NOT masked"""
        md_f = self.temp_dir / "gap_triad_in_code.md"
        md_f.write_text("""
```bash
build high quality web apps
deploy fast modern edge code
scale reliable cloud services
```
        """, encoding="utf-8")
        rc, out, err = run_cli(["--json", str(md_f)])
        data = json.loads(out)
        # Gap confirmed: detect_triad_parallelism runs on raw lines without code block masking
        self.assertEqual(data["summary"]["total_triads"], 1)

    def test_gap_inline_backticks_unmasked(self):
        """GAP: Words inside inline backticks `empower` in markdown are NOT masked"""
        md_f = self.temp_dir / "gap_inline_backticks.md"
        md_f.write_text("Do not use `empower` in your user interface.", encoding="utf-8")
        rc, out, err = run_cli(["--json", str(md_f)])
        data = json.loads(out)
        # Gap confirmed: inline backticks are not masked
        self.assertEqual(data["summary"]["total_buzzwords"], 1)

    def test_gap_trailing_comment_unmasked(self):
        """GAP: Buzzwords in trailing comments (const x = 1; // empower) are NOT masked"""
        js_f = self.temp_dir / "gap_trailing_comment.js"
        js_f.write_text("const x = 1; // empower the algorithm", encoding="utf-8")
        rc, out, err = run_cli(["--json", str(js_f)])
        data = json.loads(out)
        # Gap confirmed: line doesn't start with // so comment is not stripped
        self.assertEqual(data["summary"]["total_buzzwords"], 1)


class TestScoringMathAndMonotonicity(unittest.TestCase):
    """Stress test the mathematical behavior, monotonicity, and stability of scoring curve."""

    @classmethod
    def setUpClass(cls):
        cls.temp_dir = Path(tempfile.mkdtemp(prefix="tier5_math_"))

    @classmethod
    def tearDownClass(cls):
        shutil.rmtree(cls.temp_dir, ignore_errors=True)

    def test_scoring_monotonicity(self):
        """As buzzword violations increase with fixed word count, score must be monotonically non-increasing"""
        base_words = ["authentic", "clarity", "design", "component", "interface", "system", "layout", "button", "screen", "state"]
        # 100 words baseline
        text_words = base_words * 10
        
        buzzwords = ["unleash", "elevate", "supercharge", "revolutionize", "streamline", "seamless", "empower", "delve", "harness", "robust"]
        
        scores = []
        for count in [0, 1, 2, 3, 5, 10]:
            test_words = list(text_words)
            for i in range(count):
                test_words[i] = buzzwords[i % len(buzzwords)]
            
            f_path = self.temp_dir / f"mono_{count}.txt"
            f_path.write_text(" ".join(test_words), encoding="utf-8")
            
            rc, out, err = run_cli(["--json", str(f_path)])
            data = json.loads(out)
            scores.append(data["summary"]["humanization_score"])
        
        # Verify strict non-increasing monotonicity: s[i] >= s[i+1]
        for i in range(len(scores) - 1):
            self.assertGreaterEqual(
                scores[i], scores[i + 1],
                f"Score monotonicity violated: count={i} has score {scores[i]}, but count={i+1} has score {scores[i+1]}"
            )

    def test_scoring_boundary_clamping_at_zero(self):
        """Even with 100% buzzwords or extreme penalties, score must clamp stably at 0.0, never negative"""
        f_path = self.temp_dir / "all_slop.txt"
        f_path.write_text("unleash elevate supercharge revolutionize streamline seamless empower delve harness robust " * 10, encoding="utf-8")
        rc, out, err = run_cli(["--json", str(f_path)])
        data = json.loads(out)
        self.assertEqual(data["summary"]["humanization_score"], 0.0)
        self.assertEqual(data["summary"]["quality_tier"], "Tier 4: Blatant Synthetic Clone")

    def test_scoring_boundary_clamping_at_100(self):
        """Score must never exceed 100.0 under any clean input"""
        f_path = self.temp_dir / "clean_large.txt"
        f_path.write_text("Clear simple helpful friendly concise direct " * 200, encoding="utf-8")
        rc, out, err = run_cli(["--json", str(f_path)])
        data = json.loads(out)
        self.assertEqual(data["summary"]["humanization_score"], 100.0)
        self.assertEqual(data["summary"]["quality_tier"], "Tier 1: Mastercrafted Human Voice")

    def test_quality_tier_boundaries(self):
        """Verify quality tier thresholds: Tier 1 (>=90), Tier 2 (80-89.9), Tier 3 (50-79.9), Tier 4 (<50)"""
        test_cases = [
            (0, "Tier 1: Mastercrafted Human Voice"),  # 100.0
            (1, "Tier 2: Polished Professional"),      # ~80.0
            (2, "Tier 3: The Uncanny Valley (AI Slop Detected)"), # ~60.0
            (4, "Tier 4: Blatant Synthetic Clone"),    # ~20.0
        ]
        base_100 = ["interface"] * 100
        for buzz_count, expected_tier in test_cases:
            words = list(base_100)
            for i in range(buzz_count):
                words[i] = "empower"
            f_p = self.temp_dir / f"tier_test_{buzz_count}.txt"
            f_p.write_text(" ".join(words), encoding="utf-8")
            
            rc, out, err = run_cli(["--json", str(f_p)])
            data = json.loads(out)
            self.assertEqual(data["summary"]["quality_tier"], expected_tier,
                             f"Failed for buzz_count={buzz_count}, score={data['summary']['humanization_score']}")


if __name__ == "__main__":
    unittest.main(verbosity=2)
