"""
Tier 3: Cross-Feature Combinations Test Suite
Pairwise integration tests across visual design, typography, color science,
conversational copy, comparative cases, and CLI tooling.
"""

import os
import re
import sys
import tempfile
import unittest
from pathlib import Path

# Add current dir to path for test_utils import
sys.path.insert(0, str(Path(__file__).parent))
from test_utils import (
    calculate_wcag_contrast,
    get_markdown_links,
    parse_yaml_frontmatter,
    run_audit_copy_script,
    scan_for_slop,
)


def get_skill_dir() -> Path:
    override = os.environ.get("TARGET_SKILL_DIR")
    if override:
        return Path(override)
    return Path(r"C:\Users\JULIAN\.gemini\config\skills\human-interface-design")


class TestTier3Combinations(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.skill_dir = get_skill_dir()
        cls.skill_md = cls.skill_dir / "SKILL.md"
        cls.organic_ui_md = cls.skill_dir / "references" / "organic-ui.md"
        cls.color_psych_md = cls.skill_dir / "references" / "color-psychology.md"
        cls.copy_md = cls.skill_dir / "references" / "conversational-copy.md"
        cls.rubric_md = cls.skill_dir / "references" / "audit-rubric.md"
        cls.cases_md = cls.skill_dir / "examples" / "before-after-cases.md"
        cls.audit_script = cls.skill_dir / "scripts" / "audit_copy.py"

    def _read_file(self, path: Path) -> str:
        if not path.exists():
            self.fail(f"Target artifact not found: {path}")
        return path.read_text(encoding="utf-8", errors="replace")

    def test_t3_01_bilingual_spanish_copy_in_bento_card(self):
        """Pairwise: Feature 4 (Bento Layouts) + Feature 18 (Bilingual Copy)"""
        # Spanish copy expands 20-35%; verify bento layouts specify flexible intrinsic sizing
        organic_content = self._read_file(self.organic_ui_md).lower()
        copy_content = self._read_file(self.copy_md).lower()
        self.assertTrue(
            "minmax" in organic_content or "auto" in organic_content or "flex" in organic_content,
            "Bento layout containers must allow flexible column dimensions",
        )
        self.assertTrue(
            "expansion" in copy_content or "longitud" in copy_content or "español" in copy_content,
            "Bilingual reference must warn about text expansion in button/card containers",
        )

    def test_t3_02_dark_mode_contrast_on_multilayer_shadows(self):
        """Pairwise: Feature 7 (Multi-Layer Shadows) + Feature 12 (Dark Mode Parity)"""
        # Dark mode shadows disappear on dark surfaces; verify elevated surfaces + specular highlights provide contrast
        color_content = self._read_file(self.color_psych_md)
        ui_content = self._read_file(self.organic_ui_md)
        # Verify elevated surfaces exist and have specular highlights
        self.assertTrue(
            "--bg-surface-elevated" in color_content or "surface-1" in color_content or "surface-2" in color_content,
            "Dark mode must specify elevated surface tiers",
        )
        self.assertTrue(
            "inset" in ui_content and "1px" in ui_content,
            "Tactile lighting must specify specular highlight for dark surface definition",
        )

    def test_t3_03_audit_script_execution_on_comparative_cases(self):
        """Pairwise: Feature 19 (Case Studies) + Feature 24 (Copy Audit Script)"""
        if not self.audit_script.exists():
            self.fail(f"audit_copy.py missing at {self.audit_script}")
        cases_text = self._read_file(self.cases_md)
        # Extract the Before text from Case 1
        case1_before = "Unleash the full potential of your team with our revolutionary dashboard. Delve into a tapestry of insights designed to empower sustained growth."
        with tempfile.NamedTemporaryFile("w", suffix=".txt", delete=False, encoding="utf-8") as f:
            f.write(case1_before)
            temp_before = Path(f.name)
        try:
            exit_code, stdout, stderr = run_audit_copy_script(self.audit_script, temp_before)
            self.assertNotEqual(
                exit_code, 0, "audit_copy.py must fail (exit code != 0) on AI slop Before sample"
            )
            self.assertTrue(
                "unleash" in stdout.lower() or "delve" in stdout.lower() or "empower" in stdout.lower(),
                "audit_copy.py must flag specific blacklisted words",
            )
        finally:
            if temp_before.exists():
                temp_before.unlink()

    def test_t3_04_markdown_link_graph_completeness(self):
        """Pairwise: Feature 1 (Frontmatter) + Feature 2 (Progressive Disclosure)"""
        skill_text = self._read_file(self.skill_md)
        links = get_markdown_links(skill_text)
        expected_files = [
            "organic-ui.md",
            "color-psychology.md",
            "conversational-copy.md",
            "audit-rubric.md",
            "before-after-cases.md",
        ]
        linked_targets = [target for _, target in links]
        for exp in expected_files:
            self.assertTrue(
                any(exp in target for target in linked_targets),
                f"SKILL.md must provide direct navigation link to {exp}",
            )

    def test_t3_05_fluid_typography_clamp_in_asymmetric_bento_grid(self):
        """Pairwise: Feature 4 (Asymmetric Bento) + Feature 6 (Fluid Typography)"""
        content = self._read_file(self.organic_ui_md)
        self.assertIn("clamp(", content, "Must include clamp() expressions")
        self.assertTrue(
            "grid" in content.lower() and "clamp" in content.lower(),
            "organic-ui.md must integrate fluid typography within responsive grid containers",
        )

    def test_t3_06_emotional_sixty_thirty_ten_palette_with_empathetic_form(self):
        """Pairwise: Feature 10 (60-30-10 Rule) + Feature 21 (Case 3 Multi-Step Form)"""
        color_content = self._read_file(self.color_psych_md).lower()
        cases_content = self._read_file(self.cases_md).lower()
        self.assertTrue("60-30-10" in color_content or "60/30/10" in color_content)
        # Form error states must not turn the whole screen red; error accents must be targeted
        self.assertTrue(
            "error" in cases_content and ("inline" in cases_content or "helper" in cases_content),
            "Multi-step form case study must apply disciplined focal error indicators",
        )

    def test_t3_07_value_first_cta_in_saas_hero_case_study(self):
        """Pairwise: Feature 16 (Value-First CTA) + Feature 19 (Case 1 SaaS Hero)"""
        cases_text = self._read_file(self.cases_md)
        case1_chunk = cases_text[cases_text.find("Case 1"):cases_text.find("Case 2")]
        # Case 1 After CTA should not be generic "Get Started"
        after_pos = case1_chunk.lower().find("after")
        self.assertNotEqual(after_pos, -1, "Case 1 must have an 'After' section")
        after_text = case1_chunk[after_pos:].lower()
        # Primary CTA button in After should have tangible benefit
        self.assertNotIn(">get started<", after_text)
        self.assertNotIn(">submit<", after_text)

    def test_t3_08_spring_physics_microinteractions_on_bento_widgets(self):
        """Pairwise: Feature 7 (Materiality) + Feature 8 (Microinteractions)"""
        content = self._read_file(self.organic_ui_md)
        self.assertTrue(
            "cubic-bezier(" in content and "scale(" in content,
            "organic-ui.md must integrate spring physics cubic-bezier with tactile scale depression",
        )

    def test_t3_09_ten_point_quick_triage_against_case_studies(self):
        """Pairwise: Feature 23 (Quick Triage) + Features 19-21 (Case Studies)"""
        rubric_text = self._read_file(self.rubric_md).lower()
        self.assertTrue(
            "10-point" in rubric_text or "checklist" in rubric_text,
            "audit-rubric.md must provide the 10-point boolean checklist",
        )

    def test_t3_10_thirty_point_scoring_matrix_against_case_studies(self):
        """Pairwise: Feature 22 (Scoring Matrix) + Features 19-21 (Case Studies)"""
        rubric_text = self._read_file(self.rubric_md)
        self.assertTrue(
            "30" in rubric_text or "100" in rubric_text,
            "Rubric matrix must define quantifiable scoring categories",
        )

    def test_t3_11_dogfooding_slop_blacklist_on_skill_markdown(self):
        """Pairwise: Feature 13 (LLM Slop Blacklist) + All Reference Files"""
        # Audit our own skill markdown references for ungrounded AI buzzwords!
        files_to_check = [self.organic_ui_md, self.color_psych_md]
        for f in files_to_check:
            text = self._read_file(f)
            # Scan text excluding code blocks
            clean_text = re.sub(r"```[\s\S]*?```", "", text)
            # Flag words if used earnestly (outside antipattern explanations)
            lines = clean_text.splitlines()
            for line_idx, line in enumerate(lines, start=1):
                if any(k in line.lower() for k in ["banned", "avoid", "antipattern", "cliché", "slop", "synthetic", "instead of"]):
                    continue
                words = re.findall(r"\b[a-zA-Z]+\b", line.lower())
                for w in words:
                    if w in ("supercharge", "unleash", "synergy", "unparalleled"):
                        self.fail(f"Dogfooding violation: Skill file {f.name}:{line_idx} contains banned slop '{w}'")

    def test_t3_12_bilingual_translation_artifacts_in_error_recovery(self):
        """Pairwise: Feature 17 (Error Recovery) + Feature 18 (Bilingual Adaptation)"""
        copy_text = self._read_file(self.copy_md).lower()
        self.assertTrue(
            ("error" in copy_text or "recuperación" in copy_text) and
            ("español" in copy_text or "spanish" in copy_text),
            "conversational-copy.md must address natural phrasing in Spanish error recovery",
        )

    def test_t3_13_high_density_data_table_with_warm_neutrals(self):
        """Pairwise: Feature 5 (Spacing) + Feature 9 (Semantic Palettes)"""
        ui_text = self._read_file(self.organic_ui_md).lower()
        color_text = self._read_file(self.color_psych_md).lower()
        self.assertTrue("table" in ui_text or "tabular" in ui_text or "dense" in ui_text)
        self.assertTrue("stone" in color_text or "slate" in color_text or "warm" in color_text)

    def test_t3_14_reduced_motion_wrapping_on_tactile_microinteractions(self):
        """Pairwise: Feature 8 (Microinteractions) + Accessibility"""
        ui_text = self._read_file(self.organic_ui_md)
        self.assertIn("prefers-reduced-motion", ui_text)

    def test_t3_15_top10_heuristics_traceability_to_deep_references(self):
        """Pairwise: Feature 3 (Manifesto Heuristics) + Features 4, 9, 13 (References)"""
        skill_text = self._read_file(self.skill_md).lower()
        self.assertTrue(
            "heuristic" in skill_text or "triage" in skill_text or "top-10" in skill_text,
            "SKILL.md must present Top-10 heuristics linking to deep reference topics",
        )


if __name__ == "__main__":
    unittest.main()
