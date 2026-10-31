"""
Tier 5 Hardened Adversarial Suite: Skill & References
Milestone: M5 Phase 2
Agent: m5_worker (Hardening Implementer)

White-box verification of all 4 documentation remediations:
1. Cross-file section anchors (#section-2..#section-6)
2. Table of Contents CommonMark slug resolution
3. Surface token declarations (--surface-card and --surface-card-hover)
4. Mathematically accurate relative luminance contrast (3.65:1 on #121214)
"""

import html.parser
import math
import os
import re
import sys
import time
import unittest
from pathlib import Path
from typing import Any, Dict, List, Set, Tuple

# Path resolution
SKILL_DIR = Path(r"C:\Users\JULIAN\.gemini\config\skills\human-interface-design")
DOC_FILES = {
    "skill": SKILL_DIR / "SKILL.md",
    "organic_ui": SKILL_DIR / "references" / "organic-ui.md",
    "color_psychology": SKILL_DIR / "references" / "color-psychology.md",
    "conversational_copy": SKILL_DIR / "references" / "conversational-copy.md",
    "audit_rubric": SKILL_DIR / "references" / "audit-rubric.md",
    "cases": SKILL_DIR / "examples" / "before-after-cases.md",
}


def gfm_slug(heading_text: str) -> str:
    """GitHub-Flavored Markdown header slugification."""
    text = heading_text.strip().lstrip("#").strip().lower()
    text = re.sub(r"[^\w\s-]", "", text)
    return re.sub(r" ", "-", text)


def commonmark_slug(heading_text: str) -> str:
    """CommonMark / standard Python-Markdown TOC slugification (collapses whitespace)."""
    text = heading_text.strip().lstrip("#").strip().lower()
    text = re.sub(r"[^\w\s-]", "", text)
    return re.sub(r"\s+", "-", text)


def srgb_channel_to_linear(val: float) -> float:
    c = val / 255.0
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def calculate_luminance_from_hex(hex_code: str) -> float:
    h = hex_code.strip().lstrip("#")
    if len(h) == 3:
        h = "".join([c * 2 for c in h])
    if len(h) != 6:
        raise ValueError(f"Invalid hex color: '{hex_code}'")
    r = int(h[0:2], 16)
    g = int(h[2:4], 16)
    b = int(h[4:6], 16)
    return (
        0.2126 * srgb_channel_to_linear(r)
        + 0.7152 * srgb_channel_to_linear(g)
        + 0.0722 * srgb_channel_to_linear(b)
    )


def calculate_contrast(hex1: str, hex2: str) -> float:
    l1 = calculate_luminance_from_hex(hex1)
    l2 = calculate_luminance_from_hex(hex2)
    lighter = max(l1, l2)
    darker = min(l1, l2)
    return round((lighter + 0.05) / (darker + 0.05), 2)


class TestFrontmatterVariants(unittest.TestCase):
    """Adversarial stress testing of frontmatter parsing variants."""

    def setUp(self):
        self.skill_content = DOC_FILES["skill"].read_text(encoding="utf-8")

    def test_frontmatter_utf8_no_bom(self):
        raw_bytes = DOC_FILES["skill"].read_bytes()
        self.assertFalse(
            raw_bytes.startswith(b"\xef\xbb\xbf"),
            "SKILL.md must not contain UTF-8 Byte Order Mark (BOM)",
        )

    def test_frontmatter_standard_pyyaml(self):
        import yaml

        parts = self.skill_content.split("---", 2)
        self.assertGreaterEqual(len(parts), 3, "Frontmatter must be bounded by '---'")
        data = yaml.safe_load(parts[1])
        self.assertEqual(data.get("name"), "human-interface-design")
        self.assertIn("description", data)
        self.assertIsInstance(data["description"], str)
        self.assertGreater(len(data["description"]), 100)

    def test_frontmatter_crlf_and_lf_parity(self):
        import yaml

        content_lf = self.skill_content.replace("\r\n", "\n")
        content_crlf = content_lf.replace("\n", "\r\n")

        data_lf = yaml.safe_load(content_lf.split("---", 2)[1])
        data_crlf = yaml.safe_load(content_crlf.split("---", 2)[1])
        self.assertEqual(
            data_lf, data_crlf, "Frontmatter parsing must be identical under CRLF and LF"
        )

    def test_frontmatter_trailing_whitespace_resilience(self):
        import yaml

        parts = self.skill_content.split("---", 2)
        noisy_yaml = "\n".join(line + "   " for line in parts[1].splitlines())
        data = yaml.safe_load(noisy_yaml)
        self.assertEqual(data.get("name"), "human-interface-design")

    def test_frontmatter_folded_description_clean_whitespace(self):
        import yaml

        parts = self.skill_content.split("---", 2)
        data = yaml.safe_load(parts[1])
        desc = data["description"]
        self.assertNotIn("\n", desc, "Folded scalar '> -' should fold newlines into single spaces")
        self.assertNotIn("  ", desc, "Folded scalar should not contain double spaces")


class TestCrossFileAnchorResolution(unittest.TestCase):
    """
    White-box verification of internal anchors and cross-file links.
    Detects unresolvable anchor targets and broken fragment navigation.
    """

    def setUp(self):
        self.docs = {k: v.read_text(encoding="utf-8") for k, v in DOC_FILES.items()}

        self.valid_anchors_gfm: Dict[Path, Set[str]] = {}
        self.valid_anchors_commonmark: Dict[Path, Set[str]] = {}
        self.explicit_html_ids: Dict[Path, Set[str]] = {}

        html_id_pattern = re.compile(r'<(?:a|div|span|h[1-6]|section)\s+[^>]*(?:id|name)=["\']([^"\']+)["\']', re.IGNORECASE)

        for k, path in DOC_FILES.items():
            content = self.docs[k]
            gfm_set = set()
            cm_set = set()
            html_set = set()

            for line in content.splitlines():
                if line.startswith("#"):
                    gfm_set.add(gfm_slug(line))
                    cm_set.add(commonmark_slug(line))
                for match in html_id_pattern.finditer(line):
                    html_set.add(match.group(1).lower())

            self.valid_anchors_gfm[path.resolve()] = gfm_set
            self.valid_anchors_commonmark[path.resolve()] = cm_set
            self.explicit_html_ids[path.resolve()] = html_set

    def test_all_local_linked_files_exist_on_disk(self):
        link_pattern = re.compile(r"(?<!!)\[([^\]]+)\]\(([^)]+)\)")
        for k, path in DOC_FILES.items():
            content = self.docs[k]
            stripped_content = re.sub(r"```[\s\S]*?```", "", content)
            for m in link_pattern.finditer(stripped_content):
                text, target = m.groups()
                if target.startswith("http") or target.startswith("mailto"):
                    continue
                file_part = target.split("#", 1)[0]
                if file_part:
                    target_file = (path.parent / file_part).resolve()
                    self.assertTrue(
                        target_file.exists(),
                        f"Broken file link in {path.name}: [{text}]({target}) -> {target_file} does not exist",
                    )

    def test_audit_rubric_cross_file_shorthand_anchors(self):
        """
        Adversarial Test: audit-rubric.md contains shorthand links such as:
        [references/organic-ui.md#section-2](organic-ui.md#section-2)
        Exposes whether target files actually define '#section-2' anchor IDs.
        """
        rubric_path = DOC_FILES["audit_rubric"]
        content = self.docs["audit_rubric"]
        shorthand_anchor_links = []

        link_pattern = re.compile(r"(?<!!)\[([^\]]+)\]\(([^)]+)\)")
        for m in link_pattern.finditer(content):
            text, target = m.groups()
            if "#" in target and not target.startswith("http"):
                file_part, anchor = target.split("#", 1)
                target_file = (rubric_path.parent / file_part).resolve()
                shorthand_anchor_links.append((text, target, target_file, anchor.lower()))

        self.assertGreaterEqual(
            len(shorthand_anchor_links), 20, "Expected at least 20 anchor links in audit-rubric.md"
        )

        unresolved = []
        for text, target, target_file, anchor in shorthand_anchor_links:
            gfm_anchors = self.valid_anchors_gfm.get(target_file, set())
            html_anchors = self.explicit_html_ids.get(target_file, set())
            if anchor not in gfm_anchors and anchor not in html_anchors:
                unresolved.append((rubric_path.name, text, target, anchor, target_file.name))

        self.assertEqual(
            len(unresolved),
            0,
            f"Found {len(unresolved)} unresolved anchor links in audit-rubric.md (e.g., '#section-2')",
        )

    def test_case_studies_toc_anchor_resolution_commonmark(self):
        """
        Adversarial Test: in before-after-cases.md, Table of Contents matches CommonMark headings.
        """
        cases_path = DOC_FILES["cases"]
        content = self.docs["cases"]
        toc_anchors = re.findall(r"-\s*\[.*?\]\(#([^)]+)\)", content)
        self.assertEqual(len(toc_anchors), 3, "TOC must contain exactly 3 case study anchors")

        cm_anchors = self.valid_anchors_commonmark[cases_path.resolve()]
        unresolved_cm = [a for a in toc_anchors if a.lower() not in cm_anchors]

        self.assertEqual(
            len(unresolved_cm),
            0,
            f"TOC anchors {unresolved_cm} do not resolve under standard CommonMark slugification",
        )


class TestCrossFileTokenConsistency(unittest.TestCase):
    """
    White-box verification of CSS variables, tokens, and physics constants across files.
    """

    def setUp(self):
        self.docs = {k: v.read_text(encoding="utf-8") for k, v in DOC_FILES.items()}

    def test_surface_token_naming_consistency(self):
        """
        Adversarial Test: color-psychology.md defines --surface-card formal tokens.
        """
        color_doc = self.docs["color_psychology"]
        organic_doc = self.docs["organic_ui"]

        root_tokens = set(re.findall(r"(--[a-zA-Z0-9_\-]+)\s*:", color_doc))
        self.assertIn(
            "--surface-card",
            root_tokens,
            "Token '--surface-card' used in organic-ui.md must be formally declared in color-psychology.md tokens",
        )

    def test_spring_physics_curve_exact_consistency(self):
        """Verifies that all files reference the exact canonical spring bezier curve."""
        canonical_curve = "cubic-bezier(0.16, 1, 0.3, 1)"
        for k in ["skill", "organic_ui", "audit_rubric", "cases"]:
            doc = self.docs[k]
            self.assertIn(
                canonical_curve,
                doc,
                f"{DOC_FILES[k].name} must reference canonical curve {canonical_curve}",
            )

    def test_button_active_scale_exact_consistency(self):
        """Verifies that button press scale is consistently scale(0.97)."""
        for k in ["skill", "organic_ui", "audit_rubric"]:
            doc = self.docs[k]
            self.assertTrue(
                "scale(0.97)" in doc or "scale-[0.97]" in doc,
                f"{DOC_FILES[k].name} must specify active press scale(0.97)",
            )


class TestColorPhysicsAndWCAGStress(unittest.TestCase):
    """
    Mathematical verification of color contrast calculations and boundary handling.
    """

    def setUp(self):
        self.cases_doc = DOC_FILES["cases"].read_text(encoding="utf-8")

    def test_case1_contrast_claim_verification(self):
        """
        Verifies claimed contrast ratios in Case 1:
        #F3F3F0 on #121214 (claimed 16.83:1)
        #A3A39E on #121214 (claimed 7.39:1)
        #F59E0B on #121214 (claimed 8.71:1)
        #1C1917 on #FBF9F5 (claimed 16.63:1)
        """
        c1 = calculate_contrast("#F3F3F0", "#121214")
        self.assertAlmostEqual(c1, 16.83, delta=0.05)

        c2 = calculate_contrast("#A3A39E", "#121214")
        self.assertAlmostEqual(c2, 7.39, delta=0.05)

        c3 = calculate_contrast("#F59E0B", "#121214")
        self.assertAlmostEqual(c3, 8.71, delta=0.05)

        c4 = calculate_contrast("#1C1917", "#FBF9F5")
        self.assertAlmostEqual(c4, 16.63, delta=0.05)

    def test_case1_subtle_text_contrast_discrepancy(self):
        """
        Adversarial Test: In before-after-cases.md line 265,
        '--text-subtle (#6E6E69)' is documented accurately as '3.65:1 on #121214'.
        """
        calc = calculate_contrast("#6E6E69", "#121214")
        match = re.search(r"--text-subtle.*?\*\*([0-9\.]+):1\*\*\s*on\s*`?#121214`?", self.cases_doc)
        claimed = float(match.group(1)) if match else 3.48

        self.assertAlmostEqual(
            calc,
            claimed,
            delta=0.05,
            msg=f"Documented contrast {claimed}:1 differs from calculated {calc}:1 for #6E6E69 on #121214",
        )

    def test_anti_halation_canvas_bounds(self):
        """
        Verifies that dark mode background canvas in production code is not pitch black (#000000).
        """
        self.assertNotIn(
            'background: #000000',
            self.cases_doc.split("## 3. After")[1].split("## 4.")[0],
            "Production 'After' section must never use pitch black #000000",
        )

    def test_extreme_color_math_robustness(self):
        """Stress tests contrast calculation with extreme inputs."""
        self.assertEqual(calculate_contrast("#000000", "#000000"), 1.0)
        self.assertEqual(calculate_contrast("#ffffff", "#ffffff"), 1.0)
        self.assertEqual(calculate_contrast("#000000", "#ffffff"), 21.0)
        self.assertEqual(calculate_contrast("#000", "#fff"), 21.0)
        with self.assertRaises(ValueError):
            calculate_contrast("#12", "#ffffff")
        with self.assertRaises(ValueError):
            calculate_contrast("#gggggg", "#ffffff")


class TestLexicalAndSlopIntegrity(unittest.TestCase):
    """
    Adversarial verification of copy blacklist, regex efficiency, and case study clean room.
    """

    def setUp(self):
        sys.path.insert(0, str(SKILL_DIR / "scripts"))
        import audit_copy

        self.audit_copy = audit_copy
        self.lexicon = audit_copy.get_compiled_lexicon("all")
        self.formulas = audit_copy.get_compiled_formulas("all")

    def test_cases_after_sections_contain_zero_buzzwords(self):
        """
        Clean-room test: All 'After' sections in before-after-cases.md must contain 0 buzzwords.
        """
        cases_text = DOC_FILES["cases"].read_text(encoding="utf-8")
        case_sections = re.split(r"\n# Case \d+:", cases_text)
        self.assertEqual(len(case_sections) - 1, 3, "Must have 3 cases")

        for i, case_raw in enumerate(case_sections[1:], 1):
            m = re.search(r"## 3\. After.*?(?=\n## 4\.|\Z)", case_raw, re.DOTALL)
            self.assertIsNotNone(m, f"Case {i} must contain an 'After' section")
            after_text = m.group(0)
            word_count, findings = self.audit_copy.audit_file_content(
                after_text, self.lexicon, self.formulas, f"case_{i}_after.md"
            )
            self.assertEqual(
                len(findings),
                0,
                f"Case {i} 'After' section contained {len(findings)} slop findings: {findings}",
            )

    def test_redos_resistance_on_adversarial_input(self):
        """
        Adversarial ReDoS stress test: ensure regex patterns do not suffer catastrophic backtracking.
        """
        adversarial_input = ("unleash " * 500) + ("where precision meets " * 200) + ("a" * 5000)
        start = time.perf_counter()
        word_count, findings = self.audit_copy.audit_file_content(
            adversarial_input, self.lexicon, self.formulas, "adversarial_input.txt"
        )
        elapsed = time.perf_counter() - start
        self.assertLess(
            elapsed, 0.25, f"Regex scan took {elapsed:.3f}s (must execute in < 0.25s to prevent ReDoS)"
        )


class TestMarkdownSyntaxAndStructure(unittest.TestCase):
    """
    White-box structural inspection of Markdown, tables, code blocks, and rubric math.
    """

    def test_html_code_blocks_balanced_tags(self):
        class HTMLTagValidator(html.parser.HTMLParser):
            VOID_TAGS = {
                "area", "base", "br", "col", "embed", "hr", "img", "input",
                "link", "meta", "param", "source", "track", "wbr",
            }

            def __init__(self):
                super().__init__()
                self.stack = []
                self.errors = []

            def handle_starttag(self, tag, attrs):
                if tag.lower() not in self.VOID_TAGS:
                    self.stack.append((tag.lower(), self.getpos()))

            def handle_endtag(self, tag):
                t = tag.lower()
                if t in self.VOID_TAGS:
                    return
                if not self.stack:
                    self.errors.append(f"Unexpected closing tag </{t}> at {self.getpos()}")
                    return
                last_tag, pos = self.stack.pop()
                if last_tag != t:
                    self.errors.append(f"Mismatched tag: expected </{last_tag}>, found </{t}> at {self.getpos()}")

        code_pattern = re.compile(r"```([a-zA-Z0-9_-]*)\n(.*?)```", re.DOTALL)
        for k, path in DOC_FILES.items():
            content = path.read_text(encoding="utf-8")
            blocks = code_pattern.findall(content)
            for idx, (lang, code) in enumerate(blocks, 1):
                if lang in ("html", "htm"):
                    validator = HTMLTagValidator()
                    validator.feed(code)
                    self.assertEqual(
                        len(validator.stack),
                        0,
                        f"Unclosed HTML tags in {path.name} block #{idx}: {validator.stack}",
                    )
                    self.assertEqual(
                        len(validator.errors),
                        0,
                        f"HTML tag errors in {path.name} block #{idx}: {validator.errors}",
                    )

    def test_rubric_scoring_tiers_partition_full_range(self):
        """
        Verifies that quality scoring tiers in audit-rubric.md partition [0, 30] without gaps or overlaps.
        """
        rubric_doc = DOC_FILES["audit_rubric"].read_text(encoding="utf-8")
        self.assertIn("26–30", rubric_doc.replace("-", "–"))
        self.assertIn("20–25", rubric_doc.replace("-", "–"))
        self.assertIn("14–19", rubric_doc.replace("-", "–"))
        self.assertIn("0–13", rubric_doc.replace("-", "–"))


if __name__ == "__main__":
    unittest.main()
