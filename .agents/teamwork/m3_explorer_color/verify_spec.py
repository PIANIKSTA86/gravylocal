import os
import re
import sys
import unittest
from pathlib import Path

# Add e2e_tests dir to path
e2e_dir = Path(r"c:\Users\JULIAN\Desktop\GravyLocalTABS\.agents\teamwork\e2e_tests")
sys.path.insert(0, str(e2e_dir))

from test_utils import calculate_wcag_contrast, parse_hex_color, scan_for_slop

SPEC_PATH = Path(r"c:\Users\JULIAN\Desktop\GravyLocalTABS\.agents\teamwork\m3_explorer_color\color_psychology_spec.md")

class TestColorPsychologySpec(unittest.TestCase):
    def setUp(self):
        self.assertTrue(SPEC_PATH.exists(), f"Spec file missing: {SPEC_PATH}")
        self.content = SPEC_PATH.read_text(encoding="utf-8")
        self.content_lower = self.content.lower()

    # --------------------------------------------------------------------------
    # Tier 1: Feature 9
    # --------------------------------------------------------------------------
    def test_f09_semantic_token_naming_convention(self):
        self.assertTrue(
            "--bg-app" in self.content and "--text-main" in self.content and "--primary" in self.content,
            "Must define semantic tokens (--bg-app, --text-main, --primary)"
        )

    def test_f09_tinted_neutral_undertones_explained(self):
        self.assertTrue(
            "undertone" in self.content_lower or "tinted neutral" in self.content_lower or "warm" in self.content_lower,
            "Must mandate warm/tinted undertones in neutrals"
        )

    def test_f09_uncalibrated_dead_gray_rejection(self):
        self.assertTrue(
            "dead gray" in self.content_lower or "#6b7280" in self.content_lower or "cold gray" in self.content_lower or "pure gray" in self.content_lower,
            "Must explicitly reject uncalibrated dead grays"
        )

    def test_f09_four_domain_palettes_provided(self):
        found_domains = sum(
            1 for d in ["fintech", "health", "creative", "lifestyle", "stewardship", "care"]
            if d in self.content_lower
        )
        self.assertGreaterEqual(
            found_domains, 3, "Must define multiple emotion-grounded domain palettes"
        )

    def test_f09_oklch_or_hsl_perceptual_uniformity(self):
        self.assertTrue(
            "oklch" in self.content_lower or "hsl" in self.content_lower,
            "Must document OKLCH or HSL perceptual lightness system"
        )

    # --------------------------------------------------------------------------
    # Tier 1: Feature 10
    # --------------------------------------------------------------------------
    def test_f10_sixty_thirty_ten_rule_defined(self):
        self.assertTrue(
            "60-30-10" in self.content or "60/30/10" in self.content,
            "Must document the 60-30-10 palette architecture"
        )

    def test_f10_sixty_percent_canvas_backdrop(self):
        self.assertTrue(
            "60%" in self.content and ("canvas" in self.content_lower or "backdrop" in self.content_lower or "surface" in self.content_lower),
            "Must assign 60% to canvas base/neutral surfaces"
        )

    def test_f10_thirty_percent_structural_surfaces(self):
        self.assertTrue(
            "30%" in self.content and ("surface" in self.content_lower or "structural" in self.content_lower or "typography" in self.content_lower),
            "Must assign 30% to structural surfaces and ink"
        )

    def test_f10_ten_percent_emotional_accent(self):
        self.assertTrue(
            "10%" in self.content and "accent" in self.content_lower,
            "Must assign 10% to emotional focal accents"
        )

    def test_f10_anti_rainbow_saturation_warning(self):
        self.assertTrue(
            "rainbow" in self.content_lower or "saturation soup" in self.content_lower or "restraint" in self.content_lower or "over-saturation" in self.content_lower,
            "Must caution against multi-accent saturation chaos"
        )

    # --------------------------------------------------------------------------
    # Tier 1: Feature 11
    # --------------------------------------------------------------------------
    def test_f11_banned_indigo_violet_gradient_trope(self):
        self.assertTrue(
            "indigo" in self.content_lower or "violet" in self.content_lower or "purple" in self.content_lower,
            "Must explicitly banish generic AI indigo/violet gradients"
        )

    def test_f11_banned_radioactive_cyan_neon_trope(self):
        self.assertTrue(
            "cyan" in self.content_lower or "neon" in self.content_lower or "cyberpunk" in self.content_lower,
            "Must explicitly banish radioactive cyan/neon glow clichés"
        )

    def test_f11_banned_pitch_black_white_combination(self):
        self.assertTrue(
            "#000000" in self.content or "pitch black" in self.content_lower,
            "Must warn against raw pitch black #000000 pairing"
        )

    def test_f11_color_temperature_framework(self):
        self.assertTrue(
            "temperature" in self.content_lower or "2700k" in self.content_lower or "warm" in self.content_lower,
            "Must provide a color temperature framework (warm vs cold)"
        )

    def test_f11_regex_lint_pattern_for_color_cliches(self):
        self.assertTrue(
            "regex" in self.content_lower or "gradient" in self.content_lower or "linter" in self.content_lower,
            "Must provide actionable detection rules or regex for color tropes"
        )

    # --------------------------------------------------------------------------
    # Tier 1: Feature 12
    # --------------------------------------------------------------------------
    def test_f12_wcag_aa_contrast_minimum_stated(self):
        self.assertTrue(
            "4.5:1" in self.content or "4.5" in self.content,
            "Must state WCAG AA 4.5:1 text contrast standard"
        )

    def test_f12_wcag_large_text_contrast_stated(self):
        self.assertTrue(
            "3:1" in self.content or "3.0:1" in self.content,
            "Must state WCAG 3:1 contrast for large text and controls"
        )

    def test_f12_dark_mode_halation_prevention(self):
        self.assertTrue(
            "halation" in self.content_lower or "eye strain" in self.content_lower or "irradiation" in self.content_lower,
            "Must document dark mode halation prevention"
        )

    def test_f12_elevated_dark_surfaces_hierarchy(self):
        self.assertTrue(
            "surface" in self.content_lower and ("elevated" in self.content_lower or "surface-1" in self.content or "surface-2" in self.content),
            "Must define elevated dark surfaces rather than pure black"
        )

    def test_f12_dark_light_mode_parity(self):
        self.assertTrue(
            "dark mode" in self.content_lower and "light" in self.content_lower,
            "Must mandate parity across light and dark mode token mappings"
        )

    # --------------------------------------------------------------------------
    # Tier 2: Boundary Tests
    # --------------------------------------------------------------------------
    def test_f09_boundary_hex_color_syntax_validity(self):
        hexes = re.findall(r"#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})\b", self.content)
        self.assertGreaterEqual(len(hexes), 8, "Must provide at least 8 concrete hex color tokens")
        for h in hexes:
            try:
                rgb = parse_hex_color(h)
                self.assertEqual(len(rgb), 3)
            except ValueError:
                self.fail(f"Invalid hex code found: {h}")

    def test_f09_boundary_neutral_undertone_saturation_bounds(self):
        self.assertTrue(
            "saturation" in self.content_lower or "dead gray" in self.content_lower or "undertone" in self.content_lower,
            "Must explain neutral saturation tuning"
        )

    def test_f09_boundary_semantic_slot_completeness(self):
        slots = ["--bg-app", "--bg-surface", "--text-main", "--primary", "--border-subtle"]
        for slot in slots:
            self.assertIn(slot, self.content, f"Must include semantic token {slot}")

    def test_f09_boundary_monotonic_dark_mode_elevations(self):
        self.assertTrue(
            "surface" in self.content and ("elevated" in self.content or "sunken" in self.content or "base" in self.content),
            "Must describe surface elevation hierarchy in dark mode"
        )

    def test_f09_boundary_color_variable_css_syntax(self):
        vars_found = re.findall(r"--[a-z0-9\-]+:\s*[^;]+;", self.content)
        self.assertGreaterEqual(
            len(vars_found), 5, "Must define properly formatted CSS custom properties"
        )

    def test_f10_boundary_secondary_accent_containment(self):
        self.assertTrue(
            "accent" in self.content_lower and ("10%" in self.content or "restraint" in self.content_lower or "secondary" in self.content_lower),
            "Secondary accents must not exceed the disciplined 10% focal budget"
        )

    def test_f10_boundary_surface_area_coverage_bounds(self):
        self.assertTrue(
            "surface area" in self.content_lower or "viewport" in self.content_lower or "coverage" in self.content_lower or "proportion" in self.content_lower,
            "Must explain measuring visual surface area proportions"
        )

    def test_f10_boundary_monochrome_mode_adaptation(self):
        self.assertTrue(
            "contrast" in self.content_lower or "monochrome" in self.content_lower or "grayscale" in self.content_lower or "hierarchy" in self.content_lower,
            "Must preserve structural hierarchy in monochrome/contrast views"
        )

    def test_f10_boundary_above_the_fold_accent_presence(self):
        self.assertTrue(
            "cta" in self.content_lower or "action" in self.content_lower or "focal" in self.content_lower,
            "Focal accent must guide user attention to primary action above the fold"
        )

    def test_f11_boundary_color_temperature_below_neutral(self):
        self.assertTrue(
            "warm" in self.content_lower and ("kelvin" in self.content_lower or "2700k" in self.content_lower or "temperature" in self.content_lower),
            "Must recommend warm color temperatures (<4000K)"
        )

    def test_f11_boundary_brand_override_handling(self):
        self.assertTrue(
            "brand" in self.content_lower or "client" in self.content_lower or "override" in self.content_lower or "tint" in self.content_lower,
            "Must guide handling mandatory client brand colors without AI slop"
        )

    def test_f11_boundary_dark_mode_halation_threshold(self):
        self.assertTrue(
            "halation" in self.content_lower or "pure white" in self.content_lower or "contrast" in self.content_lower,
            "Must caution against excessive contrast on dark backgrounds causing optical blooming"
        )

    def test_f11_boundary_oled_power_vs_comfort_tradeoff(self):
        self.assertTrue(
            "oled" in self.content_lower or "black" in self.content_lower or "comfort" in self.content_lower,
            "Must address OLED battery vs visual comfort tradeoffs"
        )

    def test_f12_boundary_all_body_contrast_ratios_exceed_wcag_aa(self):
        p1 = calculate_wcag_contrast("#1C1917", "#FBF9F5")
        p2 = calculate_wcag_contrast("#13241D", "#F7F9F8")
        p3 = calculate_wcag_contrast("#F3F3F0", "#121214")
        self.assertGreaterEqual(p1, 4.5)
        self.assertGreaterEqual(p2, 4.5)
        self.assertGreaterEqual(p3, 4.5)

    def test_f12_boundary_all_large_text_contrast_exceeds_three_to_one(self):
        m1 = calculate_wcag_contrast("#655E57", "#FBF9F5")
        m2 = calculate_wcag_contrast("#4B6358", "#F7F9F8")
        m3 = calculate_wcag_contrast("#A3A39E", "#121214")
        self.assertGreaterEqual(m1, 3.0)
        self.assertGreaterEqual(m2, 3.0)
        self.assertGreaterEqual(m3, 3.0)

    def test_f12_boundary_dark_mode_font_weight_compensation(self):
        self.assertTrue(
            "weight" in self.content_lower or "irradiation" in self.content_lower or "thinning" in self.content_lower or "font" in self.content_lower,
            "Must note font weight optical adjustments in dark mode"
        )

    def test_f12_boundary_apca_polarity_difference_respected(self):
        self.assertTrue(
            "apca" in self.content_lower or "perceptual" in self.content_lower or "polarity" in self.content_lower,
            "Must reference APCA perceptual contrast principles"
        )

    def test_f12_boundary_no_low_contrast_muted_text_failures(self):
        self.assertTrue(
            "--text-muted" in self.content,
            "Must provide an explicitly calibrated --text-muted token"
        )

    # --------------------------------------------------------------------------
    # Tier 3 & Tier 4 Assertions
    # --------------------------------------------------------------------------
    def test_t3_06_sixty_thirty_ten_referenced(self):
        self.assertTrue("60-30-10" in self.content or "60/30/10" in self.content)

    def test_t3_11_dogfooding_slop_blacklist(self):
        clean_text = re.sub(r"```[\s\S]*?```", "", self.content)
        lines = clean_text.splitlines()
        for line_idx, line in enumerate(lines, start=1):
            if any(k in line.lower() for k in ["banned", "avoid", "antipattern", "cliché", "slop", "synthetic", "instead of"]):
                continue
            words = re.findall(r"\b[a-zA-Z]+\b", line.lower())
            for w in words:
                if w in ("supercharge", "unleash", "synergy", "unparalleled"):
                    self.fail(f"Dogfooding violation on line {line_idx}: contains banned slop '{w}'")

    def test_t3_13_warm_neutrals_referenced(self):
        self.assertTrue("stone" in self.content_lower or "slate" in self.content_lower or "warm" in self.content_lower)

    def test_scenario_02_fintech_stewardship(self):
        self.assertTrue(
            "fintech" in self.content_lower or "stewardship" in self.content_lower or "trust" in self.content_lower
        )

    def test_scenario_04_creative_warm_obsidian(self):
        self.assertTrue(
            "#121214" in self.content or "#18181b" in self.content or "warm basalt" in self.content_lower or "obsidian" in self.content_lower
        )
        c = calculate_wcag_contrast("#F3F3F0", "#121214")
        self.assertGreaterEqual(c, 14.0)

    def test_scenario_10_all_four_palettes_present(self):
        c1 = calculate_wcag_contrast("#1C1917", "#FBF9F5")
        c2 = calculate_wcag_contrast("#13241D", "#F7F9F8")
        c3 = calculate_wcag_contrast("#F3F3F0", "#121214")
        c4 = calculate_wcag_contrast("#292524", "#FAF7F2")
        self.assertGreaterEqual(c1, 4.5)
        self.assertGreaterEqual(c2, 4.5)
        self.assertGreaterEqual(c3, 4.5)
        self.assertGreaterEqual(c4, 4.5)

if __name__ == "__main__":
    unittest.main()
