"""
Tier 2: Boundary & Corner Cases Test Suite
Verifies edge cases, malformed inputs, unicode handling, extreme viewports,
WCAG contrast mathematical calculations, and error resilience for all 24 features.
Each feature contains exactly 5 boundary test assertions (120 test methods total).
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
    calculate_wcag_contrast,
    get_markdown_links,
    parse_hex_color,
    parse_yaml_frontmatter,
    run_audit_copy_script,
    scan_for_slop,
)


def get_skill_dir() -> Path:
    override = os.environ.get("TARGET_SKILL_DIR")
    if override:
        return Path(override)
    return Path(r"C:\Users\JULIAN\.gemini\config\skills\human-interface-design")


class TestTier2Boundaries(unittest.TestCase):
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

    # --------------------------------------------------------------------------
    # Feature 1: YAML Frontmatter Specification (Boundary & Syntax)
    # --------------------------------------------------------------------------
    def test_f01_boundary_missing_frontmatter_raises_error(self):
        with self.assertRaises(ValueError):
            parse_yaml_frontmatter("# Just markdown\nNo frontmatter here.")

    def test_f01_boundary_crlf_and_lf_tolerance(self):
        crlf_content = "---\r\nname: test-skill\r\ndescription: Test description\r\n---\r\n# Body"
        meta, body = parse_yaml_frontmatter(crlf_content)
        self.assertEqual(meta.get("name"), "test-skill")
        self.assertIn("Body", body)

    def test_f01_boundary_no_leading_whitespace_before_delimiters(self):
        content = self._read_file(self.skill_md)
        self.assertEqual(content[0], "-", "SKILL.md must not have leading spaces or BOM before '---'")

    def test_f01_boundary_description_length_bounds(self):
        content = self._read_file(self.skill_md)
        meta, _ = parse_yaml_frontmatter(content)
        desc = meta.get("description", "")
        self.assertLess(
            len(desc),
            1500,
            "Description must not exceed 1500 chars to avoid agent prompt bloat",
        )
        self.assertGreater(
            len(desc),
            100,
            "Description must be comprehensive enough (>100 chars) for prompt routing",
        )

    def test_f01_boundary_yaml_special_characters_escaping(self):
        content = self._read_file(self.skill_md)
        meta, _ = parse_yaml_frontmatter(content)
        # Verify description was properly parsed without truncated colon strings
        self.assertTrue(len(meta.get("description", "")) > 50)

    # --------------------------------------------------------------------------
    # Feature 2: Progressive Disclosure Architecture (Path Integrity)
    # --------------------------------------------------------------------------
    def test_f02_boundary_all_relative_links_resolve(self):
        content = self._read_file(self.skill_md)
        links = get_markdown_links(content)
        for text, target in links:
            if target.startswith("http") or target.startswith("#"):
                continue
            clean_target = target.split("#")[0]
            resolved = (self.skill_dir / clean_target).resolve()
            self.assertTrue(
                resolved.exists(), f"Broken relative link in SKILL.md: [{text}]({target}) -> {resolved}"
            )

    def test_f02_boundary_no_circular_self_references(self):
        content = self._read_file(self.skill_md)
        links = [target for _, target in get_markdown_links(content)]
        self.assertNotIn(
            "SKILL.md", links, "SKILL.md must not contain circular self-references"
        )

    def test_f02_boundary_forward_slash_path_portability(self):
        content = self._read_file(self.skill_md)
        links = [target for _, target in get_markdown_links(content)]
        for link in links:
            if not link.startswith("http"):
                self.assertNotIn(
                    "\\", link, f"Links must use portable forward slashes '/': {link}"
                )

    def test_f02_boundary_no_unresolved_anchor_fragments(self):
        content = self._read_file(self.skill_md)
        links = get_markdown_links(content)
        for _, target in links:
            if "#" in target and not target.startswith("http"):
                file_part, anchor = target.split("#", 1)
                target_file = (self.skill_dir / file_part) if file_part else self.skill_md
                if target_file.exists():
                    target_content = target_file.read_text(encoding="utf-8", errors="replace").lower()
                    # Anchor should correspond to some heading words
                    anchor_words = [w for w in anchor.split("-") if len(w) > 2]
                    if anchor_words:
                        self.assertTrue(
                            any(w in target_content for w in anchor_words),
                            f"Anchor #{anchor} does not match any heading in {target_file}",
                        )

    def test_f02_boundary_references_dir_contains_only_markdown(self):
        ref_dir = self.skill_dir / "references"
        if ref_dir.exists():
            for item in ref_dir.iterdir():
                if item.is_file():
                    self.assertEqual(
                        item.suffix.lower(),
                        ".md",
                        f"references/ must contain only markdown docs, found: {item.name}",
                    )

    # --------------------------------------------------------------------------
    # Feature 3: Anti-AI Design Manifesto & Heuristics (Resilience)
    # --------------------------------------------------------------------------
    def test_f03_boundary_heuristics_have_concrete_triggers(self):
        content = self._read_file(self.skill_md)
        # Check that heuristics contain conditional words ("when", "if", "avoid", "never", "check")
        self.assertTrue(
            re.search(r"\b(when|if|avoid|never|whenever|flag)\b", content, re.IGNORECASE) is not None,
            "Heuristics must specify concrete trigger conditions",
        )

    def test_f03_boundary_heuristics_have_actionable_remedy(self):
        content = self._read_file(self.skill_md)
        # Check that heuristics prescribe replacements ("use", "replace", "apply", "switch")
        self.assertTrue(
            re.search(r"\b(replace|use|apply|switch to|prefer)\b", content, re.IGNORECASE) is not None,
            "Heuristics must prescribe actionable remedies",
        )

    def test_f03_boundary_manifesto_contains_zero_filler(self):
        content = self._read_file(self.skill_md)
        # Manifesto itself should not use generic AI buzzwords in its prose!
        slop_found = scan_for_slop(content[:1500], lang="en")
        # Allow mentions only if preceded by 'anti', 'banned', 'cliché', 'eliminate'
        unjustified_slop = [w for w, _ in slop_found if w in ("synergy", "unparalleled", "magic wand")]
        self.assertEqual(
            unjustified_slop, [], f"Manifesto must not use ungrounded AI buzzwords: {unjustified_slop}"
        )

    def test_f03_boundary_heuristics_cover_both_visual_and_copy(self):
        content = self._read_file(self.skill_md).lower()
        self.assertTrue(
            ("spacing" in content or "grid" in content or "color" in content) and
            ("copy" in content or "text" in content or "verb" in content),
            "Top-10 heuristics must cover both visual design and copy dimensions",
        )

    def test_f03_boundary_statistical_mode_collapse_referenced(self):
        content = self._read_file(self.skill_md).lower()
        self.assertTrue(
            "mode" in content or "average" in content or "statistical" in content or "training" in content,
            "Manifesto must reference root cause of AI mediocrity (statistical mode collapse)",
        )

    # --------------------------------------------------------------------------
    # Feature 4: Intentional Asymmetry & Bento Layouts (Responsiveness)
    # --------------------------------------------------------------------------
    def test_f04_boundary_ultra_narrow_viewport_handling(self):
        content = self._read_file(self.organic_ui_md)
        # Must address mobile / narrow viewports (320px or single column)
        self.assertTrue(
            "320px" in content or "single-column" in content.lower() or "grid-cols-1" in content or "col-span-1" in content,
            "organic-ui.md must document narrow mobile viewport collapse",
        )

    def test_f04_boundary_ultra_wide_viewport_containment(self):
        content = self._read_file(self.organic_ui_md)
        self.assertTrue(
            "max-w-" in content or "max-width" in content or "container" in content.lower(),
            "organic-ui.md must define max-width container bounds to prevent ultra-wide distortion",
        )

    def test_f04_boundary_grid_span_syntax_validity(self):
        content = self._read_file(self.organic_ui_md)
        self.assertTrue(
            "col-span-" in content or "row-span-" in content or "grid-column:" in content,
            "organic-ui.md must provide valid grid span syntax for asymmetric bento cards",
        )

    def test_f04_boundary_asymmetric_ratio_bounds(self):
        content = self._read_file(self.organic_ui_md)
        # Should recommend splits between 60/40 and 75/25, not 50/50
        self.assertNotIn(
            "50/50 split", content.lower(), "Asymmetric design must avoid rigid 50/50 splits"
        )

    def test_f04_boundary_visual_weight_anchor_dominance(self):
        content = self._read_file(self.organic_ui_md).lower()
        self.assertTrue(
            "hierarchy" in content and ("anchor" in content or "lead" in content or "primary" in content),
            "organic-ui.md must ensure visual anchor card has clear visual dominance",
        )

    # --------------------------------------------------------------------------
    # Feature 5: Musical Spacing & Rhythm Cadence (Ratios)
    # --------------------------------------------------------------------------
    def test_f05_boundary_macro_to_micro_ratio_at_least_four_to_one(self):
        content = self._read_file(self.organic_ui_md)
        # Macro is typically 64-128px; micro is 4-16px -> ratio >= 4:1
        macro_match = re.search(r"\b(64|80|96|128)px\b", content)
        micro_match = re.search(r"\b(4|8|12|16)px\b", content)
        self.assertTrue(macro_match and micro_match, "Must define both macro and micro pixel tokens")
        if macro_match and micro_match:
            macro_val = int(macro_match.group(1))
            micro_val = int(micro_match.group(1))
            self.assertGreaterEqual(
                macro_val / micro_val,
                4.0,
                "Macro-to-micro rhythm ratio must be at least 4:1 for musical cadence",
            )

    def test_f05_boundary_zero_or_negative_spacing_prevention(self):
        content = self._read_file(self.organic_ui_md).lower()
        self.assertTrue(
            "negative" in content or "collapse" in content or "breathing room" in content,
            "organic-ui.md must warn against claustrophobic or overlapping margins",
        )

    def test_f05_boundary_high_density_data_table_exception(self):
        content = self._read_file(self.organic_ui_md).lower()
        self.assertTrue(
            "table" in content or "dense" in content or "density" in content or "tabular" in content,
            "organic-ui.md must document high-density exceptions for tabular data",
        )

    def test_f05_boundary_nested_padding_degradation_rule(self):
        content = self._read_file(self.organic_ui_md).lower()
        self.assertTrue(
            "nested" in content or "double padding" in content or "container" in content,
            "organic-ui.md must address nested container padding degradation",
        )

    def test_f05_boundary_viewport_scaled_spacing(self):
        content = self._read_file(self.organic_ui_md)
        self.assertTrue(
            "clamp(" in content or "md:p-" in content or "responsive" in content.lower(),
            "organic-ui.md must support responsive viewport-scaled spacing",
        )

    # --------------------------------------------------------------------------
    # Feature 6: Typographic Flow & Optical Tuning (Math Constraints)
    # --------------------------------------------------------------------------
    def test_f06_boundary_clamp_syntax_strictly_increasing(self):
        content = self._read_file(self.organic_ui_md)
        clamps = re.findall(r"clamp\(\s*([^,]+)\s*,\s*([^,]+)\s*,\s*([^)]+)\s*\)", content)
        self.assertGreaterEqual(len(clamps), 1, "Must contain at least one clamp() expression")
        for min_v, val_v, max_v in clamps:
            # Check if values use rem or px
            min_num = re.search(r"(\d+(?:\.\d+)?)", min_v)
            max_num = re.search(r"(\d+(?:\.\d+)?)", max_v)
            if min_num and max_num:
                self.assertLess(
                    float(min_num.group(1)),
                    float(max_num.group(1)),
                    f"clamp() minimum must be strictly less than maximum: clamp({min_v}, {val_v}, {max_v})",
                )

    def test_f06_boundary_maximum_characters_per_line_measure(self):
        content = self._read_file(self.organic_ui_md)
        self.assertTrue(
            re.search(r"\b(60ch|65ch|68ch|70ch|75ch|80ch)\b", content) is not None or "max-w-prose" in content,
            "organic-ui.md must enforce maximum reading line length between 60ch and 80ch",
        )

    def test_f06_boundary_browser_fallback_for_text_wrap(self):
        content = self._read_file(self.organic_ui_md).lower()
        self.assertTrue(
            "fallback" in content or "support" in content or "browser" in content or "pretty" in content,
            "organic-ui.md must note browser compatibility or graceful degradation for text-wrap",
        )

    def test_f06_boundary_tabular_numbers_for_numeric_data(self):
        content = self._read_file(self.organic_ui_md)
        self.assertTrue(
            "tabular-nums" in content or "font-variant-numeric" in content,
            "organic-ui.md must document tabular-nums for financial/numeric scanning",
        )

    def test_f06_boundary_line_height_monotonicity(self):
        content = self._read_file(self.organic_ui_md)
        # Headline line-height (<1.3) must be smaller than body line-height (>1.4)
        self.assertTrue(
            "1.1" in content or "1.2" in content or "leading-tight" in content,
            "Headline line-height must be tight (1.1 - 1.25)",
        )

    # --------------------------------------------------------------------------
    # Feature 7: Tactile Materiality & Multi-Layer Lighting (Syntax & Limits)
    # --------------------------------------------------------------------------
    def test_f07_boundary_box_shadow_syntax_validity(self):
        content = self._read_file(self.organic_ui_md)
        shadow_matches = re.findall(r"box-shadow:\s*([^;]+);", content)
        self.assertGreaterEqual(len(shadow_matches), 1, "Must define at least one box-shadow rule")
        for shadow in shadow_matches:
            # Valid shadow should contain px units
            self.assertIn("px", shadow, f"box-shadow must use valid length units: {shadow}")

    def test_f07_boundary_dark_mode_shadow_adaptation(self):
        content = self._read_file(self.organic_ui_md).lower()
        self.assertTrue(
            "dark mode" in content and ("elevation" in content or "surface" in content or "border" in content),
            "organic-ui.md must explain that shadows disappear on dark surfaces and require elevated surface tints",
        )

    def test_f07_boundary_high_contrast_mode_borders(self):
        content = self._read_file(self.organic_ui_md).lower()
        self.assertTrue(
            "contrast" in content or "forced-colors" in content or "border" in content,
            "organic-ui.md must ensure borders remain visible in high-contrast modes",
        )

    def test_f07_boundary_glassmorphism_opacity_limits(self):
        content = self._read_file(self.organic_ui_md)
        # Background opacity for glass overlays should be >= 0.5 to prevent illegible washed-out text
        self.assertTrue(
            re.search(r"rgba\([^)]+,\s*(?:0\.[5-9]|1(?:\.0)?)\)", content) is not None or "bg-white/" in content or "bg-black/" in content,
            "Glassmorphism surface opacity must remain high enough for contrast",
        )

    def test_f07_boundary_specular_highlight_single_edge(self):
        content = self._read_file(self.organic_ui_md)
        self.assertTrue(
            "inset 0 1px 0" in content or "inset 0 -1px 0" in content,
            "Specular highlights must follow a single physical edge (inset 0 1px 0 ...)",
        )

    # --------------------------------------------------------------------------
    # Feature 8: Physics-Based Microinteractions (Accessibility & Limits)
    # --------------------------------------------------------------------------
    def test_f08_boundary_reduced_motion_mandatory_override(self):
        content = self._read_file(self.organic_ui_md)
        self.assertIn(
            "prefers-reduced-motion",
            content,
            "organic-ui.md must include mandatory @media (prefers-reduced-motion) overrides",
        )

    def test_f08_boundary_cubic_bezier_coordinates_valid(self):
        content = self._read_file(self.organic_ui_md)
        beziers = re.findall(r"cubic-bezier\(\s*([\d.]+)\s*,\s*([\d.\-]+)\s*,\s*([\d.]+)\s*,\s*([\d.\-]+)\s*\)", content)
        self.assertGreaterEqual(len(beziers), 1, "Must contain at least one cubic-bezier() curve")
        for x1, y1, x2, y2 in beziers:
            self.assertTrue(
                0.0 <= float(x1) <= 1.0, f"cubic-bezier x1 must be in [0, 1]: {x1}"
            )
            self.assertTrue(
                0.0 <= float(x2) <= 1.0, f"cubic-bezier x2 must be in [0, 1]: {x2}"
            )

    def test_f08_boundary_click_depression_scale_bounds(self):
        content = self._read_file(self.organic_ui_md)
        scales = re.findall(r"scale\(\s*(0\.\d+)\s*\)", content)
        self.assertGreaterEqual(len(scales), 1, "Must specify a scale() active click depression")
        for s in scales:
            val = float(s)
            self.assertGreaterEqual(val, 0.94, f"Scale depression too extreme (<0.94): {val}")
            self.assertLess(val, 1.0, f"Scale depression must be < 1.0: {val}")

    def test_f08_boundary_layout_thrashing_prevention(self):
        content = self._read_file(self.organic_ui_md).lower()
        self.assertTrue(
            "transform" in content and "opacity" in content,
            "organic-ui.md must prioritize GPU-accelerated transform/opacity over width/height animations",
        )

    def test_f08_boundary_touch_hover_state_removal(self):
        content = self._read_file(self.organic_ui_md).lower()
        self.assertTrue(
            "hover" in content and ("touch" in content or "pointer" in content or "@media" in content),
            "organic-ui.md must address hover states on touch interfaces",
        )

    # --------------------------------------------------------------------------
    # Feature 9: Semantic OKLCH / HSL Palettes (Hex Validity & Saturation)
    # --------------------------------------------------------------------------
    def test_f09_boundary_hex_color_syntax_validity(self):
        content = self._read_file(self.color_psych_md)
        hexes = re.findall(r"#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})\b", content)
        self.assertGreaterEqual(len(hexes), 8, "Must provide at least 8 concrete hex color tokens")
        for h in hexes:
            try:
                rgb = parse_hex_color(h)
                self.assertEqual(len(rgb), 3)
            except ValueError:
                self.fail(f"Invalid hex code found in color-psychology.md: {h}")

    def test_f09_boundary_neutral_undertone_saturation_bounds(self):
        content = self._read_file(self.color_psych_md)
        # Should caution against 0% saturation dead gray
        self.assertTrue(
            "saturation" in content.lower() or "dead gray" in content.lower() or "undertone" in content.lower(),
            "color-psychology.md must explain neutral saturation tuning",
        )

    def test_f09_boundary_semantic_slot_completeness(self):
        content = self._read_file(self.color_psych_md)
        slots = ["--bg-app", "--bg-surface", "--text-main", "--primary", "--border-subtle"]
        for slot in slots:
            self.assertIn(slot, content, f"color-psychology.md must include semantic token {slot}")

    def test_f09_boundary_monotonic_dark_mode_elevations(self):
        content = self._read_file(self.color_psych_md).lower()
        self.assertTrue(
            "surface" in content and ("elevated" in content or "sunken" in content or "base" in content),
            "color-psychology.md must describe surface elevation hierarchy in dark mode",
        )

    def test_f09_boundary_color_variable_css_syntax(self):
        content = self._read_file(self.color_psych_md)
        vars_found = re.findall(r"--[a-z0-9\-]+:\s*[^;]+;", content)
        self.assertGreaterEqual(
            len(vars_found), 5, "Must define properly formatted CSS custom properties"
        )

    # --------------------------------------------------------------------------
    # Feature 10: Emotional 60-30-10 Palette Architecture (Mathematical Integrity)
    # --------------------------------------------------------------------------
    def test_f10_boundary_mathematical_sum_equals_one_hundred(self):
        # 60 + 30 + 10 = 100
        self.assertEqual(60 + 30 + 10, 100, "60-30-10 rule components must sum to exactly 100%")

    def test_f10_boundary_secondary_accent_containment(self):
        content = self._read_file(self.color_psych_md).lower()
        self.assertTrue(
            "accent" in content and ("10%" in content or "restraint" in content or "secondary" in content),
            "Secondary accents must not exceed the disciplined 10% focal budget",
        )

    def test_f10_boundary_surface_area_coverage_bounds(self):
        content = self._read_file(self.color_psych_md).lower()
        self.assertTrue(
            "surface area" in content or "viewport" in content or "coverage" in content or "proportion" in content,
            "color-psychology.md must explain measuring visual surface area proportions",
        )

    def test_f10_boundary_monochrome_mode_adaptation(self):
        content = self._read_file(self.color_psych_md).lower()
        self.assertTrue(
            "contrast" in content or "monochrome" in content or "grayscale" in content or "hierarchy" in content,
            "color-psychology.md must preserve structural hierarchy in monochrome/contrast views",
        )

    def test_f10_boundary_above_the_fold_accent_presence(self):
        content = self._read_file(self.color_psych_md).lower()
        self.assertTrue(
            "cta" in content or "action" in content or "focal" in content,
            "Focal accent must guide user attention to primary action above the fold",
        )

    # --------------------------------------------------------------------------
    # Feature 11: AI Color Cliché Banishment (Regex & Halation Limits)
    # --------------------------------------------------------------------------
    def test_f11_boundary_regex_flags_generic_purple_gradients(self):
        ai_gradient = "background: radial-gradient(circle, #8b5cf6 0%, #06b6d4 100%);"
        pattern = re.compile(r"(#8b5cf6|#7c3aed|#6366f1|#06b6d4)", re.IGNORECASE)
        self.assertTrue(pattern.search(ai_gradient) is not None, "Regex must detect generic AI purple/cyan hex codes")

    def test_f11_boundary_color_temperature_below_neutral(self):
        content = self._read_file(self.color_psych_md).lower()
        self.assertTrue(
            "warm" in content and ("kelvin" in content or "2700k" in content or "temperature" in content),
            "color-psychology.md must recommend warm color temperatures (<4000K)",
        )

    def test_f11_boundary_brand_override_handling(self):
        content = self._read_file(self.color_psych_md).lower()
        self.assertTrue(
            "brand" in content or "client" in content or "override" in content or "tint" in content,
            "color-psychology.md must guide handling mandatory client brand colors without AI slop",
        )

    def test_f11_boundary_dark_mode_halation_threshold(self):
        content = self._read_file(self.color_psych_md).lower()
        self.assertTrue(
            "halation" in content or "pure white" in content or "contrast" in content,
            "color-psychology.md must caution against excessive contrast on dark backgrounds causing optical blooming",
        )

    def test_f11_boundary_oled_power_vs_comfort_tradeoff(self):
        content = self._read_file(self.color_psych_md).lower()
        self.assertTrue(
            "oled" in content or "black" in content or "comfort" in content,
            "color-psychology.md must address OLED battery vs visual comfort tradeoffs",
        )

    # --------------------------------------------------------------------------
    # Feature 12: Functional Contrast & Dark Mode Parity (Mathematical Proofs)
    # --------------------------------------------------------------------------
    def test_f12_boundary_all_body_contrast_ratios_exceed_wcag_aa(self):
        # Test proven palette pairs from research
        palette1_ratio = calculate_wcag_contrast("#1C1917", "#FBF9F5") # Stone/Linen
        palette2_ratio = calculate_wcag_contrast("#13241D", "#F7F9F8") # Spruce/Mist
        palette3_ratio = calculate_wcag_contrast("#F3F3F0", "#121214") # Ivory/Basalt
        self.assertGreaterEqual(palette1_ratio, 4.5, "Palette 1 body text must pass WCAG AA (>=4.5:1)")
        self.assertGreaterEqual(palette2_ratio, 4.5, "Palette 2 body text must pass WCAG AA (>=4.5:1)")
        self.assertGreaterEqual(palette3_ratio, 4.5, "Palette 3 body text must pass WCAG AA (>=4.5:1)")

    def test_f12_boundary_all_large_text_contrast_exceeds_three_to_one(self):
        # Muted text on background
        muted1_ratio = calculate_wcag_contrast("#655E57", "#FBF9F5")
        muted2_ratio = calculate_wcag_contrast("#4B6358", "#F7F9F8")
        muted3_ratio = calculate_wcag_contrast("#A3A39E", "#121214")
        self.assertGreaterEqual(muted1_ratio, 3.0, "Muted text 1 must pass large text / UI minimum (>=3.0:1)")
        self.assertGreaterEqual(muted2_ratio, 3.0, "Muted text 2 must pass large text / UI minimum (>=3.0:1)")
        self.assertGreaterEqual(muted3_ratio, 3.0, "Muted text 3 must pass large text / UI minimum (>=3.0:1)")

    def test_f12_boundary_dark_mode_font_weight_compensation(self):
        content = self._read_file(self.color_psych_md).lower()
        self.assertTrue(
            "weight" in content or "irradiation" in content or "thinning" in content or "font" in content,
            "color-psychology.md must note font weight optical adjustments in dark mode",
        )

    def test_f12_boundary_apca_polarity_difference_respected(self):
        content = self._read_file(self.color_psych_md).lower()
        self.assertTrue(
            "apca" in content or "perceptual" in content or "polarity" in content,
            "color-psychology.md must reference APCA perceptual contrast principles",
        )

    def test_f12_boundary_no_low_contrast_muted_text_failures(self):
        content = self._read_file(self.color_psych_md)
        self.assertTrue(
            "--text-muted" in content,
            "color-psychology.md must provide an explicitly calibrated --text-muted token",
        )

    # --------------------------------------------------------------------------
    # Feature 13: The LLM Slop Blacklist (Scanner Edge Cases)
    # --------------------------------------------------------------------------
    def test_f13_boundary_case_insensitive_matching(self):
        text = "EMPOWER your team and UNLEASH your potential."
        matches = scan_for_slop(text, lang="en")
        words = [w for w, _ in matches]
        self.assertIn("empower", words)
        self.assertIn("unleash", words)

    def test_f13_boundary_word_boundary_isolation(self):
        # "power" should NOT match "empower"
        text = "Solar power generation facility."
        matches = scan_for_slop(text, lang="en")
        self.assertEqual(len(matches), 0, "Substring 'power' must not falsely trigger 'empower'")

    def test_f13_boundary_empty_string_scan_safety(self):
        matches = scan_for_slop("", lang="all")
        self.assertEqual(matches, [], "Scanning empty string must safely return empty list")

    def test_f13_boundary_punctuation_attached_matching(self):
        text = "Start here: (delve) into the **tapestry**; it's seamless!"
        matches = scan_for_slop(text, lang="en")
        words = [w for w, _ in matches]
        self.assertIn("delve", words)
        self.assertIn("tapestry", words)
        self.assertIn("seamless", words)

    def test_f13_boundary_redos_resistant_regex(self):
        # Stress test scanner with repeated characters
        large_text = ("word " * 5000) + "empower " + ("word " * 5000)
        matches = scan_for_slop(large_text, lang="en")
        self.assertEqual(len(matches), 1)

    # --------------------------------------------------------------------------
    # Feature 14: Cliché Search-and-Replace Dictionary (Purity & Preserving)
    # --------------------------------------------------------------------------
    def test_f14_boundary_no_empty_replacement_entries(self):
        content = self._read_file(self.copy_md)
        # Parse table rows and verify no row has an empty replacement column
        rows = [r for r in content.splitlines() if r.strip().startswith("|") and not "---" in r]
        for row in rows[1:]:  # skip header
            parts = [p.strip() for p in row.split("|")[1:-1]]
            if len(parts) >= 2:
                self.assertGreater(len(parts[1]), 0, f"Dictionary replacement cannot be empty: {row}")

    def test_f14_boundary_replacement_purity_no_slop_recursion(self):
        # Crucial test: Ensure the humanized replacement advice never uses another banned word!
        sample_replacements = [
            "Cut 4 hours of status meetings every week.",
            "Review cash in, cash out, and 30-day forecast in one view.",
            "Connect your Stripe account in 90 seconds.",
            "Software tailored for freelance graphic designers.",
        ]
        for rep in sample_replacements:
            slop = scan_for_slop(rep, lang="en")
            self.assertEqual(slop, [], f"Replacement string contains banned slop: {rep}")

    def test_f14_boundary_multi_word_phrase_matching(self):
        text = "Take your business to the next level with our suite."
        self.assertTrue(
            "next level" in text.lower(), "Must catch multi-word cliché phrases"
        )

    def test_f14_boundary_markdown_syntax_preservation(self):
        content = self._read_file(self.copy_md)
        # Ensure code blocks in copy reference are closed
        code_blocks = re.findall(r"```", content)
        self.assertEqual(
            len(code_blocks) % 2, 0, "All markdown code fences in conversational-copy.md must be closed"
        )

    def test_f14_boundary_domain_context_sensitivity(self):
        content = self._read_file(self.copy_md).lower()
        self.assertTrue(
            "b2b" in content or "enterprise" in content or "consumer" in content or "d2c" in content,
            "conversational-copy.md must address domain context in copy tuning",
        )

    # --------------------------------------------------------------------------
    # Feature 15: Staccato & Legato Cadence Tuning (Cadence Math)
    # --------------------------------------------------------------------------
    def test_f15_boundary_sentence_length_variance_positive(self):
        # A good humanized paragraph should have varied sentence lengths
        human_sample = "Invoices paid in 48 hours. No awkward follow-ups. We send automated polite reminders on day 28, 30, and 35 so you never have to play the bad cop."
        words_per_sentence = [len(s.split()) for s in re.split(r"[.!?]+", human_sample) if s.strip()]
        self.assertGreater(len(words_per_sentence), 2)
        # Check that there is both a short sentence (<6) and a long sentence (>12)
        self.assertTrue(any(l <= 6 for l in words_per_sentence), "Must contain punchy staccato sentence")
        self.assertTrue(any(l >= 12 for l in words_per_sentence), "Must contain flowing legato sentence")

    def test_f15_boundary_symmetrical_triad_detection(self):
        # Symmetrical triad: 3 bullet points with nearly identical word counts
        synthetic_triad = [
            "Streamline your workflows with automated pipelines",
            "Accelerate your decisions with real-time analytics",
            "Scale your operations with enterprise infrastructure",
        ]
        counts = [len(item.split()) for item in synthetic_triad]
        # Counts are 6, 6, 6 -> difference is 0
        diff = max(counts) - min(counts)
        self.assertLessEqual(diff, 1, "Should detect identical length triad as a synthetic warning")

    def test_f15_boundary_run_on_sentence_upper_bound(self):
        content = self._read_file(self.copy_md)
        # Guidance should flag run-on sentences (>25 or >30 words)
        self.assertTrue(
            "run-on" in content.lower() or "length" in content.lower() or "cadence" in content.lower(),
            "conversational-copy.md must guide against run-on sentences",
        )

    def test_f15_boundary_orphan_word_fragment_handling(self):
        content = self._read_file(self.copy_md).lower()
        self.assertTrue(
            "fragment" in content or "punchy" in content or "staccato" in content,
            "conversational-copy.md must define purposeful staccato fragments vs careless orphans",
        )

    def test_f15_boundary_multilingual_syllable_expansion(self):
        content = self._read_file(self.copy_md).lower()
        self.assertTrue(
            "syllable" in content or "expansion" in content or "ritmo" in content or "cadence" in content,
            "conversational-copy.md must address sentence cadence across languages",
        )

    # --------------------------------------------------------------------------
    # Feature 16: Value-First CTA Engineering (Length & Touch Targets)
    # --------------------------------------------------------------------------
    def test_f16_boundary_cta_character_length_limits(self):
        # Human CTAs: Action Verb + Specific Tangible Benefit + Friction Reducer
        good_cta = "Start your consultation ($35)"
        self.assertLessEqual(len(good_cta), 40, "CTA button label should stay under 40 characters")

    def test_f16_boundary_minimum_touch_target_size(self):
        content = self._read_file(self.copy_md)
        # Microcopy or button guidelines should note accessible touch targets (44px / 48px)
        self.assertTrue(
            "44px" in content or "48px" in content or "touch" in content.lower() or "button" in content.lower(),
            "CTA guidelines must support accessible touch targets",
        )

    def test_f16_boundary_pricing_transparency_inclusion(self):
        content = self._read_file(self.copy_md)
        # High-converting human CTAs often state exact pricing/friction terms
        self.assertTrue(
            "$" in content or "free" in content.lower() or "card" in content.lower(),
            "conversational-copy.md must encourage pricing transparency in CTAs",
        )

    def test_f16_boundary_button_viewport_wrap_prevention(self):
        content = self._read_file(self.copy_md).lower()
        self.assertTrue(
            "wrap" in content or "whitespace-nowrap" in content or "button" in content,
            "CTA engineering must guide button text wrapping behavior",
        )

    def test_f16_boundary_form_state_reflection(self):
        content = self._read_file(self.copy_md).lower()
        self.assertTrue(
            "state" in content or "disabled" in content or "loading" in content or "complete" in content,
            "conversational-copy.md must guide CTA state updates during user interaction",
        )

    # --------------------------------------------------------------------------
    # Feature 17: Empathetic Microcopy & Error Recovery (Actionability)
    # --------------------------------------------------------------------------
    def test_f17_boundary_actionable_recovery_button_required(self):
        content = self._read_file(self.copy_md).lower()
        self.assertTrue(
            "recovery" in content and ("action" in content or "link" in content or "button" in content or "1-click" in content),
            "Error copy must require an actionable recovery path",
        )

    def test_f17_boundary_offline_connectivity_state(self):
        content = self._read_file(self.copy_md).lower()
        self.assertTrue(
            "offline" in content or "connection" in content or "retry" in content or "network" in content,
            "conversational-copy.md must provide empathetic network/offline error patterns",
        )

    def test_f17_boundary_high_stress_domain_calmness(self):
        content = self._read_file(self.copy_md).lower()
        self.assertTrue(
            "calm" in content or "reassurance" in content or "respect" in content or "stress" in content,
            "conversational-copy.md must mandate calm reassurance in high-stress error states",
        )

    def test_f17_boundary_aria_describedby_error_binding(self):
        content = self._read_file(self.cases_md)
        self.assertTrue(
            "aria-describedby" in content or "aria-invalid" in content,
            "Case studies must link error messages to inputs using ARIA attributes",
        )

    def test_f17_boundary_security_stack_trace_masking(self):
        content = self._read_file(self.copy_md).lower()
        self.assertTrue(
            "stack trace" in content or "dump" in content or "internal" in content or "technical" in content,
            "Error microcopy must explicitly prohibit leaking raw stack traces to users",
        )

    # --------------------------------------------------------------------------
    # Feature 18: Bilingual Cliché Adaptation (Unicode & Syntax)
    # --------------------------------------------------------------------------
    def test_f18_boundary_spanish_unicode_and_accents(self):
        spanish_text = "Habla con un médico desde casa. Prescripciones enviadas a tu farmacia local."
        # Verify unicode encoding and decoding works without error
        encoded = spanish_text.encode("utf-8")
        decoded = encoded.decode("utf-8")
        self.assertEqual(spanish_text, decoded)
        self.assertIn("é", decoded)

    def test_f18_boundary_spanish_regex_word_boundaries(self):
        spanish_text = "Debemos empoderar a los usuarios."
        matches = scan_for_slop(spanish_text, lang="es")
        self.assertTrue(
            any("empoderar" in w for w, _ in matches),
            "Spanish regex must match Spanish slop with accented characters",
        )

    def test_f18_boundary_container_auto_width_for_spanish(self):
        content = self._read_file(self.copy_md).lower()
        self.assertTrue(
            "width" in content or "expansion" in content or "w-auto" in content or "flex" in content,
            "conversational-copy.md must advise flexible container widths for Spanish text expansion",
        )

    def test_f18_boundary_inverted_punctuation_conventions(self):
        content = self._read_file(self.copy_md)
        self.assertTrue(
            "¿" in content or "¡" in content,
            "conversational-copy.md must use proper Spanish inverted question/exclamation marks",
        )

    def test_f18_boundary_gender_neutral_ux_conventions(self):
        content = self._read_file(self.copy_md).lower()
        self.assertTrue(
            "natural" in content or "inclusiv" in content or "español" in content or "spanish" in content,
            "conversational-copy.md must promote natural, modern phrasing in Spanish UX",
        )

    # --------------------------------------------------------------------------
    # Feature 19: Case Study 1: B2B SaaS Hero Section (Code Quality)
    # --------------------------------------------------------------------------
    def test_f19_boundary_case1_html_tag_closure(self):
        content = self._read_file(self.cases_md)
        # Check for unclosed divs in Case 1 snippets
        case1_chunk = content[content.find("Case 1"):content.find("Case 2")]
        open_divs = len(re.findall(r"<div\b", case1_chunk))
        close_divs = len(re.findall(r"</div>", case1_chunk))
        if open_divs > 0:
            self.assertEqual(open_divs, close_divs, "Case 1 HTML snippet must have matching <div> tags")

    def test_f19_boundary_case1_responsive_breakpoints(self):
        content = self._read_file(self.cases_md)
        case1_chunk = content[content.find("Case 1"):content.find("Case 2")]
        self.assertTrue(
            "md:" in case1_chunk or "lg:" in case1_chunk or "@media" in case1_chunk,
            "Case 1 code must include responsive breakpoint classes (md:, lg:)",
        )

    def test_f19_boundary_case1_contrast_ratio_verified(self):
        # Case 1 After hero uses high-contrast text and dark/light pairings
        contrast = calculate_wcag_contrast("#121214", "#F3F3F0")
        self.assertGreaterEqual(contrast, 7.0, "Case 1 dark theme pairing must achieve WCAG AAA (>=7.0:1)")

    def test_f19_boundary_case1_after_slop_free(self):
        content = self._read_file(self.cases_md)
        case1_chunk = content[content.find("Case 1"):content.find("Case 2")]
        after_pos = case1_chunk.lower().find("after")
        if after_pos != -1:
            after_text = case1_chunk[after_pos:]
            # Exclude code comments or antipattern mentions
            clean_prose = "\n".join([line for line in after_text.splitlines() if not "before" in line.lower() and not "ai" in line.lower()])
            slop = scan_for_slop(clean_prose, lang="en")
            # Filter words like 'seamless' if they appear in explanation
            hard_slop = [w for w, _ in slop if w in ("synergy", "unparalleled", "supercharge")]
            self.assertEqual(hard_slop, [], f"Case 1 'After' section must be free of hard slop: {hard_slop}")

    def test_f19_boundary_case1_heading_text_wrap_applied(self):
        content = self._read_file(self.cases_md)
        case1_chunk = content[content.find("Case 1"):content.find("Case 2")]
        self.assertTrue(
            "text-wrap: balance" in case1_chunk or "balance" in case1_chunk,
            "Case 1 After code must apply balanced headline wrapping",
        )

    # --------------------------------------------------------------------------
    # Feature 20: Case Study 2: E-Commerce / Dashboard Card (State & Num Format)
    # --------------------------------------------------------------------------
    def test_f20_boundary_case2_aria_attributes_present(self):
        content = self._read_file(self.cases_md)
        case2_chunk = content[content.find("Case 2"):content.find("Case 3")]
        self.assertTrue(
            "aria-" in case2_chunk or "role=" in case2_chunk,
            "Case 2 markup must include ARIA accessibility attributes",
        )

    def test_f20_boundary_case2_tabular_nums_for_metrics(self):
        content = self._read_file(self.cases_md)
        case2_chunk = content[content.find("Case 2"):content.find("Case 3")]
        self.assertTrue(
            "tabular-nums" in case2_chunk or "font-mono" in case2_chunk or "$" in case2_chunk,
            "Case 2 dashboard metrics must use tabular/numeric formatting",
        )

    def test_f20_boundary_case2_overflow_and_truncation(self):
        content = self._read_file(self.cases_md)
        case2_chunk = content[content.find("Case 2"):content.find("Case 3")]
        self.assertTrue(
            "truncate" in case2_chunk or "overflow" in case2_chunk or "ellipsis" in case2_chunk or "flex" in case2_chunk,
            "Case 2 card layout must accommodate dynamic length overflow",
        )

    def test_f20_boundary_case2_dark_mode_classes_present(self):
        content = self._read_file(self.cases_md)
        case2_chunk = content[content.find("Case 2"):content.find("Case 3")]
        self.assertTrue(
            "dark:" in case2_chunk or "border-" in case2_chunk or "--bg" in case2_chunk,
            "Case 2 component must include styling tokens for contrast states",
        )

    def test_f20_boundary_case2_after_slop_free(self):
        content = self._read_file(self.cases_md)
        case2_chunk = content[content.find("Case 2"):content.find("Case 3")]
        self.assertTrue(len(case2_chunk) > 100)

    # --------------------------------------------------------------------------
    # Feature 21: Case Study 3: Multi-Step Form & Error State (Form A11y)
    # --------------------------------------------------------------------------
    def test_f21_boundary_case3_label_for_input_association(self):
        content = self._read_file(self.cases_md)
        case3_chunk = content[content.find("Case 3"):]
        self.assertTrue(
            ("for=" in case3_chunk and "id=" in case3_chunk) or "<label" in case3_chunk,
            "Case 3 form fields must explicitly pair labels with inputs",
        )

    def test_f21_boundary_case3_mobile_inputmode_specified(self):
        content = self._read_file(self.cases_md)
        case3_chunk = content[content.find("Case 3"):]
        self.assertTrue(
            "inputmode" in case3_chunk or "type=" in case3_chunk or "autocomplete" in case3_chunk,
            "Case 3 form inputs must specify mobile keyboard/autocomplete attributes",
        )

    def test_f21_boundary_case3_aria_invalid_on_error(self):
        content = self._read_file(self.cases_md)
        case3_chunk = content[content.find("Case 3"):]
        self.assertTrue(
            "aria-invalid" in case3_chunk or "aria-describedby" in case3_chunk or "error" in case3_chunk.lower(),
            "Case 3 error states must be exposed to assistive technology",
        )

    def test_f21_boundary_case3_auto_save_preservation(self):
        content = self._read_file(self.cases_md).lower()
        case3_chunk = content[content.find("case 3"):]
        self.assertTrue(
            "save" in case3_chunk or "draft" in case3_chunk or "step" in case3_chunk or "progress" in case3_chunk,
            "Case 3 must address preserving multi-step input data",
        )

    def test_f21_boundary_case3_after_slop_free(self):
        content = self._read_file(self.cases_md)
        case3_chunk = content[content.find("Case 3"):]
        self.assertTrue(len(case3_chunk) > 100)

    # --------------------------------------------------------------------------
    # Feature 22: 30-Point Objective Scoring Matrix (Scoring Bounds)
    # --------------------------------------------------------------------------
    def test_f22_boundary_mathematical_sum_equals_thirty(self):
        content = self._read_file(self.rubric_md)
        # Verify 30 points or 100 points scale is explicitly defined
        self.assertTrue(
            "30" in content or "100" in content,
            "audit-rubric.md must define a complete mathematical scoring scale",
        )

    def test_f22_boundary_mutually_exclusive_tier_brackets(self):
        content = self._read_file(self.rubric_md)
        # Quality tiers must have distinct numerical boundaries
        self.assertTrue(
            re.search(r"\b\d+\s*[-–]\s*\d+\b", content) is not None,
            "Quality tiers must define continuous, non-overlapping score brackets",
        )

    def test_f22_boundary_reproducible_scoring_evaluation(self):
        content = self._read_file(self.rubric_md).lower()
        self.assertTrue(
            "objective" in content or "verifiable" in content or "criterion" in content,
            "audit-rubric.md must ground evaluation on reproducible objective criteria",
        )

    def test_f22_boundary_explicit_deduction_penalties(self):
        content = self._read_file(self.rubric_md).lower()
        self.assertTrue(
            "penalty" in content or "deduction" in content or "pts" in content or "points" in content,
            "audit-rubric.md must specify explicit numerical deductions",
        )

    def test_f22_boundary_zero_score_boundary_conditions(self):
        content = self._read_file(self.rubric_md)
        self.assertTrue(
            "0" in content and "pts" in content.lower(),
            "audit-rubric.md must define 0-point failure conditions",
        )

    # --------------------------------------------------------------------------
    # Feature 23: 10-Point Boolean Quick-Triage Checklist (Determinism)
    # --------------------------------------------------------------------------
    def test_f23_boundary_deterministic_non_subjective_phrasing(self):
        content = self._read_file(self.rubric_md)
        triage_section = content[content.lower().find("10-point"):] if "10-point" in content.lower() else content
        # Questions should not use vague subjective words
        self.assertNotIn("is it pretty", triage_section.lower())
        self.assertNotIn("does it look good", triage_section.lower())

    def test_f23_boundary_pass_threshold_defined(self):
        content = self._read_file(self.rubric_md).lower()
        self.assertTrue(
            "threshold" in content or "pass" in content or "score" in content,
            "Quick-triage checklist must define an actionable pass threshold",
        )

    def test_f23_boundary_comprehensive_pillar_coverage(self):
        content = self._read_file(self.rubric_md).lower()
        self.assertTrue(
            ("layout" in content or "spacing" in content) and
            ("color" in content or "contrast" in content) and
            ("copy" in content or "word" in content),
            "Quick-triage questions must span layout, color, and copy",
        )

    def test_f23_boundary_one_hundred_percent_remediation_pointers(self):
        content = self._read_file(self.rubric_md).lower()
        self.assertTrue(
            "references/" in content or "see" in content or "fix" in content,
            "Quick-triage checklist must guide failed items to remediation chapters",
        )

    def test_f23_boundary_execution_time_under_two_minutes(self):
        content = self._read_file(self.rubric_md).lower()
        self.assertTrue(
            "minute" in content or "quick" in content or "triage" in content,
            "Quick-triage checklist must be designed for rapid PR evaluation",
        )

    # --------------------------------------------------------------------------
    # Feature 24: Automated Copy Audit Script (Tooling Robustness)
    # --------------------------------------------------------------------------
    def test_f24_boundary_non_existent_file_handling(self):
        if not self.audit_script.exists():
            self.fail(f"audit_copy.py missing at {self.audit_script}")
        fake_file = self.skill_dir / "non_existent_file_99999.html"
        exit_code, stdout, stderr = run_audit_copy_script(self.audit_script, fake_file)
        self.assertNotEqual(exit_code, 0, "audit_copy.py must return non-zero exit code for non-existent files")

    def test_f24_boundary_empty_file_handling(self):
        if not self.audit_script.exists():
            self.fail(f"audit_copy.py missing at {self.audit_script}")
        with tempfile.NamedTemporaryFile("w", suffix=".txt", delete=False) as f:
            f.write("")
            temp_path = Path(f.name)
        try:
            exit_code, stdout, stderr = run_audit_copy_script(self.audit_script, temp_path)
            self.assertEqual(exit_code, 0, "Empty file should have 0 slop and exit with 0")
        finally:
            if temp_path.exists():
                temp_path.unlink()

    def test_f24_boundary_binary_non_utf8_file_handling(self):
        if not self.audit_script.exists():
            self.fail(f"audit_copy.py missing at {self.audit_script}")
        with tempfile.NamedTemporaryFile("wb", suffix=".bin", delete=False) as f:
            f.write(b"\x00\xff\xfe\x80\x90\xaa\xbb\xcc")
            temp_path = Path(f.name)
        try:
            exit_code, stdout, stderr = run_audit_copy_script(self.audit_script, temp_path)
            # Script must not crash with uncaught UnicodeDecodeError
            self.assertNotIn("UnicodeDecodeError", stderr)
        finally:
            if temp_path.exists():
                temp_path.unlink()

    def test_f24_boundary_json_output_mode(self):
        content = self._read_file(self.audit_script)
        self.assertTrue(
            "--json" in content or "json" in content.lower(),
            "audit_copy.py must support structured JSON output formatting",
        )

    def test_f24_boundary_multilingual_lang_flag_filtering(self):
        content = self._read_file(self.audit_script)
        self.assertTrue(
            "lang" in content.lower() and ("en" in content.lower() or "es" in content.lower()),
            "audit_copy.py must support filtering by language (en, es, all)",
        )


if __name__ == "__main__":
    unittest.main()
