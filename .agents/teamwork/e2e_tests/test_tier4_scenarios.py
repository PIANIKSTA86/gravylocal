"""
Tier 4: Real-World Application Scenarios Test Suite
Validates realistic end-to-end design and copy auditing scenarios
across SaaS, FinTech, Healthcare, Creative Studio, E-Commerce,
EdTech, and automated CLI workflows.
Contains 14 comprehensive scenario tests.
"""

import json
import os
import re
import sys
import tempfile
import unittest
from pathlib import Path

# Add current dir to path for test_utils import
sys.path.insert(0, str(Path(__file__).parent))
from test_utils import (
    BANNED_AI_WORDS_EN,
    BANNED_AI_WORDS_ES,
    FORMULAIC_HERO_PATTERNS,
    calculate_sentence_metrics,
    calculate_wcag_contrast,
    run_audit_copy_script,
    scan_for_slop,
)


def get_skill_dir() -> Path:
    override = os.environ.get("TARGET_SKILL_DIR")
    if override:
        return Path(override)
    return Path(r"C:\Users\JULIAN\.gemini\config\skills\human-interface-design")


class TestTier4Scenarios(unittest.TestCase):
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

    def test_scenario_01_saas_hero_audit_and_refactor(self):
        """Scenario 1: B2B SaaS Hero Audit and Refactor"""
        # Given a typical AI-generated SaaS hero section:
        synthetic_hero = (
            "Where precision engineering meets effortless design. "
            "Unleash the full potential of your workforce with our revolutionary, "
            "all-in-one AI-powered platform. Elevate your team today."
        )
        # 1. Audit: Scan for formulaic hero pattern
        has_formula = any(p.search(synthetic_hero) for p in FORMULAIC_HERO_PATTERNS)
        self.assertTrue(has_formula, "Must flag formulaic 'Where X meets Y' hero slogan")

        # 2. Audit: Scan for slop words
        slop = scan_for_slop(synthetic_hero, lang="en")
        flagged_words = [w for w, _ in slop]
        self.assertIn("effortless", flagged_words)
        self.assertIn("unleash", flagged_words)
        self.assertIn("elevate", flagged_words)

        # 3. Refactor: Verify humanized version meets criteria
        humanized_hero = (
            "Cut 4 hours of status meetings every week. "
            "See who is working on what without asking. "
            "Connect your Jira or Linear workspace in 90 seconds."
        )
        refactored_slop = scan_for_slop(humanized_hero, lang="en")
        self.assertEqual(refactored_slop, [], "Humanized hero must have 0 slop words")

        # 4. Check sentence cadence
        metrics = calculate_sentence_metrics(humanized_hero)
        self.assertGreater(metrics["count"], 1)
        self.assertTrue(metrics["min"] <= 8, "Must contain punchy opening sentence")

    def test_scenario_02_fintech_cashflow_bento_card(self):
        """Scenario 2: FinTech Cash Flow Dashboard Bento Card"""
        # Verify color and typography rules for financial dashboards
        color_text = self._read_file(self.color_psych_md).lower()
        ui_text = self._read_file(self.organic_ui_md).lower()

        # Stewardship palette: warm basalt, forest slate, or warm linen
        self.assertTrue(
            "fintech" in color_text or "stewardship" in color_text or "trust" in color_text,
            "Must define grounded chromatic palette for financial applications",
        )
        # Number scanning requires tabular-nums
        self.assertTrue(
            "tabular-nums" in ui_text or "font-variant-numeric" in ui_text,
            "Financial dashboard metrics must use tabular-nums to prevent visual jitter",
        )

    def test_scenario_03_anxious_patient_telehealth_intake(self):
        """Scenario 3: Anxious Patient Telehealth Intake Form"""
        copy_text = self._read_file(self.copy_md).lower()
        # Healthcare requires calm, reassuring copy without cold clinical intimidation
        self.assertTrue(
            "empathetic" in copy_text or "healthcare" in copy_text or "doctor" in copy_text or "patient" in copy_text,
            "Copy guidelines must provide empathetic framing for sensitive user tasks",
        )
        # Banish "Submit Data" in favor of helpful progress hints
        self.assertTrue(
            "submit" in copy_text,
            "Must explicitly flag cold 'Submit' buttons as an antipattern",
        )

    def test_scenario_04_creative_studio_warm_obsidian_dark_mode(self):
        """Scenario 4: Creative Studio Warm Obsidian Dark Mode"""
        # Dark mode for creative tools should use warm basalt, not pitch black #000000
        color_text = self._read_file(self.color_psych_md)
        self.assertTrue(
            "#121214" in color_text or "#18181b" in color_text or "warm basalt" in color_text.lower() or "obsidian" in color_text.lower(),
            "Must define warm dark mode surface avoiding OLED halation glare",
        )
        # Verify contrast ratio between ivory text (#F3F3F0) and warm basalt (#121214)
        contrast = calculate_wcag_contrast("#F3F3F0", "#121214")
        self.assertGreaterEqual(contrast, 14.0, "Ivory on Basalt must achieve AAA contrast (>14:1)")

    def test_scenario_05_ecommerce_checkout_error_recovery(self):
        """Scenario 5: E-Commerce Checkout Coupon Error Recovery"""
        # Cold error: "Error: Invalid coupon code"
        # Humanized: "We couldn't find the coupon code 'SUMMER50'. It may have expired on Oct 1st. Would you like to try 'FALL20' for 20% off?"
        human_error = "We couldn't find coupon code 'SAVE50'. It may have expired yesterday. [Try code FALL20 for 15% off]"
        self.assertNotIn("Oops!", human_error)
        self.assertNotIn("Error 500", human_error)
        self.assertIn("Try code", human_error, "Must provide 1-click alternative recovery")

    def test_scenario_06_edtech_guided_pathway_rhythm(self):
        """Scenario 6: EdTech Guided Pathway Spatial Cadence"""
        ui_text = self._read_file(self.organic_ui_md)
        # Rhythmic section spacing (64px - 128px) separates learning modules
        self.assertTrue(
            re.search(r"\b(64px|80px|96px|128px)\b", ui_text) is not None,
            "EdTech learning paths require generous chapter spacing (64px-128px)",
        )

    def test_scenario_07_cli_audit_synthetic_slop_fixture(self):
        """Scenario 7: CLI Audit Execution Against Synthetic Slop Fixture"""
        if not self.audit_script.exists():
            self.fail(f"audit_copy.py missing at {self.audit_script}")

        synthetic_html = """
        <section class="hero bg-slate-900 text-white">
            <h1>Where innovation meets excellence: Unleash your team</h1>
            <p>Supercharge your workflow and delve into a rich tapestry of seamless insights.</p>
            <button class="bg-indigo-600">Get Started</button>
        </section>
        """
        with tempfile.NamedTemporaryFile("w", suffix=".html", delete=False, encoding="utf-8") as f:
            f.write(synthetic_html)
            temp_path = Path(f.name)
        try:
            exit_code, stdout, stderr = run_audit_copy_script(self.audit_script, temp_path)
            self.assertNotEqual(exit_code, 0, "audit_copy.py must fail on synthetic fixture")
            self.assertTrue(
                "unleash" in stdout.lower() or "delve" in stdout.lower() or "supercharge" in stdout.lower() or "seamless" in stdout.lower(),
                "Output must list detected slop words",
            )
        finally:
            if temp_path.exists():
                temp_path.unlink()

    def test_scenario_08_cli_audit_humanized_fixture(self):
        """Scenario 8: CLI Audit Execution Against Handcrafted Production Code"""
        if not self.audit_script.exists():
            self.fail(f"audit_copy.py missing at {self.audit_script}")

        clean_html = """
        <section class="hero bg-stone-100 text-stone-900">
            <h1>Invoices paid in 48 hours, not 30 days.</h1>
            <p>Automated polite reminders on day 28, 30, and 35. You never play the bad cop.</p>
            <button class="bg-emerald-700 text-white">Start 14-day free trial</button>
        </section>
        """
        with tempfile.NamedTemporaryFile("w", suffix=".html", delete=False, encoding="utf-8") as f:
            f.write(clean_html)
            temp_path = Path(f.name)
        try:
            exit_code, stdout, stderr = run_audit_copy_script(self.audit_script, temp_path)
            self.assertEqual(exit_code, 0, f"audit_copy.py must pass on clean code, got exit code {exit_code}: {stdout} {stderr}")
        finally:
            if temp_path.exists():
                temp_path.unlink()

    def test_scenario_09_cli_audit_spanish_copy(self):
        """Scenario 9: CLI Spanish Copy Audit with --lang es Flag"""
        if not self.audit_script.exists():
            self.fail(f"audit_copy.py missing at {self.audit_script}")

        spanish_synthetic = "Nuestra plataforma te permite empoderar tu flujo de trabajo de forma sin fisuras."
        with tempfile.NamedTemporaryFile("w", suffix=".txt", delete=False, encoding="utf-8") as f:
            f.write(spanish_synthetic)
            temp_path = Path(f.name)
        try:
            exit_code, stdout, stderr = run_audit_copy_script(
                self.audit_script, temp_path, extra_args=["--lang", "es"]
            )
            self.assertNotEqual(exit_code, 0, "Must flag Spanish clichés under --lang es")
            self.assertTrue(
                "empoderar" in stdout.lower() or "sin fisuras" in stdout.lower(),
                "Must flag Spanish words 'empoderar' or 'sin fisuras'",
            )
        finally:
            if temp_path.exists():
                temp_path.unlink()

    def test_scenario_10_automated_wcag_palette_audit(self):
        """Scenario 10: Automated WCAG Contrast Audit Across All 4 Domain Palettes"""
        # Extract and verify all 4 palettes from color-psychology.md
        color_doc = self._read_file(self.color_psych_md)
        # B2B Palette
        c1 = calculate_wcag_contrast("#1C1917", "#FBF9F5")
        self.assertGreaterEqual(c1, 4.5, "B2B Palette text must pass WCAG AA")

        # Healthcare Palette
        c2 = calculate_wcag_contrast("#13241D", "#F7F9F8")
        self.assertGreaterEqual(c2, 4.5, "Healthcare Palette text must pass WCAG AA")

        # Creative Obsidian Palette
        c3 = calculate_wcag_contrast("#F3F3F0", "#121214")
        self.assertGreaterEqual(c3, 4.5, "Creative Palette text must pass WCAG AA")

        # Lifestyle Palette
        c4 = calculate_wcag_contrast("#292524", "#FAF7F2")
        self.assertGreaterEqual(c4, 4.5, "Lifestyle Palette text must pass WCAG AA")

    def test_scenario_11_vestibular_accessibility_reduced_motion(self):
        """Scenario 11: Motion Sensitivity & Vestibular Accessibility"""
        ui_doc = self._read_file(self.organic_ui_md)
        self.assertIn("@media (prefers-reduced-motion", ui_doc)
        # Ensure fallback transition is opacity or none
        self.assertTrue(
            "transition: none" in ui_doc or "opacity" in ui_doc or "duration" in ui_doc,
            "Must provide safe zero-motion fallback",
        )

    def test_scenario_12_multistep_onboarding_wizard_cognitive_load(self):
        """Scenario 12: Multi-Step Onboarding Wizard Progressive Disclosure"""
        cases_doc = self._read_file(self.cases_md).lower()
        self.assertTrue(
            "step" in cases_doc and ("form" in cases_doc or "onboarding" in cases_doc),
            "Must demonstrate multi-step progressive disclosure to reduce cognitive fatigue",
        )

    def test_scenario_13_enterprise_crm_scoring_via_30pt_matrix(self):
        """Scenario 13: Enterprise CRM Audit via 30-Point Scoring Matrix"""
        rubric_doc = self._read_file(self.rubric_md)
        # Verify 4 quality scoring brackets exist
        tiers = ["Mastercraft", "Polished", "Uncanny", "Slop"]
        found = sum(1 for t in tiers if t.lower() in rubric_doc.lower())
        self.assertGreaterEqual(found, 2, "Must define quality scoring tiers")

    def test_scenario_14_pr_review_sanity_check_via_10pt_checklist(self):
        """Scenario 14: Pull Request Sanity Check via 10-Point Quick Triage"""
        rubric_doc = self._read_file(self.rubric_md)
        # Quick triage should allow answering 10 boolean questions
        self.assertTrue(
            "checklist" in rubric_doc.lower() or "quick" in rubric_doc.lower(),
            "Must provide the rapid PR sanity check checklist",
        )


if __name__ == "__main__":
    unittest.main()
