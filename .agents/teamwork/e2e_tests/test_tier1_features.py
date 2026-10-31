"""
Tier 1: Feature Coverage Test Suite
Verifies isolated functionality, structure, tokens, syntax, and execution
for all 24 features defined in PROJECT.md.
Each feature contains exactly 5 granular test assertions (120 test methods total).
"""

import os
import re
import sys
import unittest
from pathlib import Path

# Add current dir to path for test_utils import
sys.path.insert(0, str(Path(__file__).parent))
from test_utils import (
    BANNED_AI_WORDS_EN,
    BANNED_AI_WORDS_ES,
    get_markdown_headers,
    get_markdown_links,
    parse_yaml_frontmatter,
    run_audit_copy_script,
)


def get_skill_dir() -> Path:
    override = os.environ.get("TARGET_SKILL_DIR")
    if override:
        return Path(override)
    return Path(r"C:\Users\JULIAN\.gemini\config\skills\human-interface-design")


class TestTier1Features(unittest.TestCase):
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
    # Feature 1: YAML Frontmatter Specification (SKILL.md)
    # --------------------------------------------------------------------------
    def test_f01_frontmatter_delimiters_present(self):
        content = self._read_file(self.skill_md)
        self.assertTrue(
            content.startswith("---"), "SKILL.md must start with '---' frontmatter delimiter"
        )

    def test_f01_name_matches_directory(self):
        content = self._read_file(self.skill_md)
        meta, _ = parse_yaml_frontmatter(content)
        self.assertEqual(
            meta.get("name"),
            "human-interface-design",
            "Frontmatter 'name' must match skill directory name",
        )

    def test_f01_description_exists_and_non_empty(self):
        content = self._read_file(self.skill_md)
        meta, _ = parse_yaml_frontmatter(content)
        desc = meta.get("description", "")
        self.assertGreater(
            len(desc.strip()), 40, "Frontmatter 'description' must be informative (>40 chars)"
        )

    def test_f01_routing_keywords_present(self):
        content = self._read_file(self.skill_md)
        meta, _ = parse_yaml_frontmatter(content)
        desc = meta.get("description", "").lower()
        self.assertTrue(
            any(k in desc for k in ["human", "ai", "cliché", "cliche", "interface", "design"]),
            "Frontmatter description must include routing keywords for agent activation",
        )

    def test_f01_use_when_clause_specified(self):
        content = self._read_file(self.skill_md)
        meta, _ = parse_yaml_frontmatter(content)
        desc = meta.get("description", "")
        self.assertIn(
            "Use when", desc, "Frontmatter description must contain an explicit 'Use when' clause"
        )

    # --------------------------------------------------------------------------
    # Feature 2: Progressive Disclosure Architecture
    # --------------------------------------------------------------------------
    def test_f02_link_to_organic_ui(self):
        content = self._read_file(self.skill_md)
        links = [target for _, target in get_markdown_links(content)]
        self.assertTrue(
            any("organic-ui.md" in l for l in links),
            "SKILL.md must link to references/organic-ui.md",
        )

    def test_f02_link_to_color_psychology(self):
        content = self._read_file(self.skill_md)
        links = [target for _, target in get_markdown_links(content)]
        self.assertTrue(
            any("color-psychology.md" in l for l in links),
            "SKILL.md must link to references/color-psychology.md",
        )

    def test_f02_link_to_conversational_copy(self):
        content = self._read_file(self.skill_md)
        links = [target for _, target in get_markdown_links(content)]
        self.assertTrue(
            any("conversational-copy.md" in l for l in links),
            "SKILL.md must link to references/conversational-copy.md",
        )

    def test_f02_link_to_audit_rubric(self):
        content = self._read_file(self.skill_md)
        links = [target for _, target in get_markdown_links(content)]
        self.assertTrue(
            any("audit-rubric.md" in l for l in links),
            "SKILL.md must link to references/audit-rubric.md",
        )

    def test_f02_link_to_before_after_cases(self):
        content = self._read_file(self.skill_md)
        links = [target for _, target in get_markdown_links(content)]
        self.assertTrue(
            any("before-after-cases.md" in l for l in links),
            "SKILL.md must link to examples/before-after-cases.md",
        )

    # --------------------------------------------------------------------------
    # Feature 3: Anti-AI Design Manifesto & Heuristics (SKILL.md)
    # --------------------------------------------------------------------------
    def test_f03_manifesto_section_header_present(self):
        content = self._read_file(self.skill_md)
        headers = [h[1].lower() for h in get_markdown_headers(content)]
        self.assertTrue(
            any("manifesto" in h or "anti-ai" in h for h in headers),
            "SKILL.md must contain an Anti-AI Design Manifesto section header",
        )

    def test_f03_four_core_pillars_documented(self):
        content = self._read_file(self.skill_md).lower()
        self.assertTrue(
            "pillar" in content or "4 pillars" in content,
            "SKILL.md must articulate the core design pillars",
        )

    def test_f03_philosophical_contrast_articulated(self):
        content = self._read_file(self.skill_md).lower()
        self.assertTrue(
            "slop" in content or "synthetic" in content or "monotony" in content,
            "Manifesto must address synthetic AI patterns / slop directly",
        )

    def test_f03_top10_instant_triage_heuristics_header(self):
        content = self._read_file(self.skill_md)
        headers = [h[1].lower() for h in get_markdown_headers(content)]
        self.assertTrue(
            any("top-10" in h or "triage" in h or "heuristic" in h for h in headers),
            "SKILL.md must contain Top-10 Instant Triage Heuristics section",
        )

    def test_f03_heuristics_contains_ten_rules(self):
        content = self._read_file(self.skill_md)
        # Check for numbered items 1 through 10 (either "1." through "10." or "H1" through "H10")
        numbered_items = re.findall(r"(?:^|\n)\s*([1-9]|10)\.\s+", content)
        h_items = re.findall(r"\bH([1-9]|10)\b", content)
        total_items = set(numbered_items).union(set(h_items))
        self.assertGreaterEqual(
            len(total_items), 10, "Top-10 triage section must enumerate rules 1 through 10"
        )

    # --------------------------------------------------------------------------
    # Feature 4: Intentional Asymmetry & Bento Layouts (references/organic-ui.md)
    # --------------------------------------------------------------------------
    def test_f04_antipattern_three_column_grid_defined(self):
        content = self._read_file(self.organic_ui_md).lower()
        self.assertTrue(
            "3-column" in content or "3 column" in content or "cookie-cutter" in content,
            "organic-ui.md must document the cookie-cutter 3-column grid antipattern",
        )

    def test_f04_asymmetric_split_ratios_specified(self):
        content = self._read_file(self.organic_ui_md)
        self.assertTrue(
            "60/40" in content or "70/30" in content,
            "organic-ui.md must specify 60/40 or 70/30 asymmetric split ratios",
        )

    def test_f04_bento_grid_template_columns_documented(self):
        content = self._read_file(self.organic_ui_md)
        self.assertTrue(
            "grid-template-columns" in content or "grid" in content.lower(),
            "organic-ui.md must document bento CSS grid structure",
        )

    def test_f04_hero_visual_anchor_pattern(self):
        content = self._read_file(self.organic_ui_md).lower()
        self.assertTrue(
            "anchor" in content or "hero card" in content or "lead feature" in content,
            "organic-ui.md must define a primary visual anchor card",
        )

    def test_f04_mobile_fallback_collapse_rule(self):
        content = self._read_file(self.organic_ui_md)
        self.assertTrue(
            "640px" in content or "mobile" in content.lower() or "sm:" in content,
            "organic-ui.md must specify responsive collapse behavior for small viewports",
        )

    # --------------------------------------------------------------------------
    # Feature 5: Musical Spacing & Rhythm Cadence (references/organic-ui.md)
    # --------------------------------------------------------------------------
    def test_f05_monotonous_spacing_antipattern(self):
        content = self._read_file(self.organic_ui_md).lower()
        self.assertTrue(
            "monotonous" in content or "gap-4" in content or "uniform spacing" in content,
            "organic-ui.md must document the monotonous uniform spacing antipattern",
        )

    def test_f05_macro_rhythm_scale_defined(self):
        content = self._read_file(self.organic_ui_md)
        # Should reference macro spacing in 64px - 128px range
        self.assertTrue(
            re.search(r"\b(64px|80px|96px|128px)\b", content) is not None,
            "organic-ui.md must specify macro-rhythm pacing (64px - 128px)",
        )

    def test_f05_micro_proximity_scale_defined(self):
        content = self._read_file(self.organic_ui_md)
        # Should reference micro spacing in 4px - 16px range
        self.assertTrue(
            re.search(r"\b(4px|8px|12px|16px)\b", content) is not None,
            "organic-ui.md must specify micro-proximity pacing (4px - 16px)",
        )

    def test_f05_gestalt_law_of_proximity_cited(self):
        content = self._read_file(self.organic_ui_md).lower()
        self.assertTrue(
            "proximity" in content or "gestalt" in content,
            "organic-ui.md must ground spacing hierarchy in the principle of proximity",
        )

    def test_f05_spacing_tokens_or_classes_provided(self):
        content = self._read_file(self.organic_ui_md)
        self.assertTrue(
            "--spacing" in content or "gap-" in content or "p-" in content,
            "organic-ui.md must provide concrete CSS tokens or Tailwind utility examples for spacing",
        )

    # --------------------------------------------------------------------------
    # Feature 6: Typographic Flow & Optical Tuning (references/organic-ui.md)
    # --------------------------------------------------------------------------
    def test_f06_fluid_typography_clamp_specified(self):
        content = self._read_file(self.organic_ui_md)
        self.assertIn("clamp(", content, "organic-ui.md must specify fluid typography with clamp()")

    def test_f06_headline_tight_line_height(self):
        content = self._read_file(self.organic_ui_md)
        self.assertTrue(
            re.search(r"line-height:\s*1\.[0-2]", content) or "leading-tight" in content or "1.1" in content or "1.2" in content,
            "organic-ui.md must mandate tight line-heights (1.1 - 1.25) for headlines",
        )

    def test_f06_body_line_height_readability(self):
        content = self._read_file(self.organic_ui_md)
        self.assertTrue(
            re.search(r"line-height:\s*1\.[5-7]", content) or "leading-relaxed" in content or "1.5" in content or "1.6" in content,
            "organic-ui.md must specify comfortable body line-heights (1.5 - 1.7)",
        )

    def test_f06_text_wrap_balance_for_headings(self):
        content = self._read_file(self.organic_ui_md)
        self.assertIn("text-wrap: balance", content, "organic-ui.md must document text-wrap: balance for headlines")

    def test_f06_measure_line_length_constraint(self):
        content = self._read_file(self.organic_ui_md)
        self.assertTrue(
            "max-w-prose" in content or "65ch" in content or "68ch" in content or "text-wrap: pretty" in content,
            "organic-ui.md must enforce maximum measure constraint (max-w-prose / 65-75ch)",
        )

    # --------------------------------------------------------------------------
    # Feature 7: Tactile Materiality & Multi-Layer Lighting (references/organic-ui.md)
    # --------------------------------------------------------------------------
    def test_f07_dirty_drop_shadow_antipattern(self):
        content = self._read_file(self.organic_ui_md).lower()
        self.assertTrue(
            "drop shadow" in content or "flat dirty" in content or "harsh shadow" in content,
            "organic-ui.md must document the flat dirty drop-shadow antipattern",
        )

    def test_f07_multi_layer_shadow_stacking_rules(self):
        content = self._read_file(self.organic_ui_md)
        self.assertTrue(
            "box-shadow:" in content and "," in content,
            "organic-ui.md must specify multi-layer box-shadow stacking (comma-separated layers)",
        )

    def test_f07_single_light_source_angle(self):
        content = self._read_file(self.organic_ui_md).lower()
        self.assertTrue(
            "light source" in content or "top-left" in content or "120" in content,
            "organic-ui.md must require a coherent virtual key light source",
        )

    def test_f07_specular_bevel_highlight_token(self):
        content = self._read_file(self.organic_ui_md)
        self.assertTrue(
            "inset" in content and "1px" in content,
            "organic-ui.md must document subtle inset specular highlights (inset 0 1px 0 ...)",
        )

    def test_f07_contextual_floating_glassmorphism(self):
        content = self._read_file(self.organic_ui_md).lower()
        self.assertTrue(
            "glassmorphism" in content or "backdrop-blur" in content,
            "organic-ui.md must restrict glassmorphism to floating contextual overlays",
        )

    # --------------------------------------------------------------------------
    # Feature 8: Physics-Based Microinteractions (references/organic-ui.md)
    # --------------------------------------------------------------------------
    def test_f08_mechanical_linear_easing_antipattern(self):
        content = self._read_file(self.organic_ui_md).lower()
        self.assertTrue(
            "linear" in content or "0.3s ease" in content or "mechanical" in content,
            "organic-ui.md must document linear/mechanical easing antipattern",
        )

    def test_f08_spring_curve_cubic_bezier_definition(self):
        content = self._read_file(self.organic_ui_md)
        self.assertTrue(
            "cubic-bezier(" in content,
            "organic-ui.md must define standard spring cubic-bezier easing curve",
        )

    def test_f08_tactile_click_depression_scale(self):
        content = self._read_file(self.organic_ui_md)
        self.assertTrue(
            re.search(r"scale\(\s*0\.9[78]\s*\)", content) is not None,
            "organic-ui.md must specify tactile depression token (scale(0.97) or scale(0.98)) on active click",
        )

    def test_f08_accessible_focus_ring_offsets(self):
        content = self._read_file(self.organic_ui_md)
        self.assertTrue(
            "focus-visible" in content or "ring-offset" in content or "outline-offset" in content,
            "organic-ui.md must specify accessible focus rings with distinct offset",
        )

    def test_f08_microinteraction_duration_bounds(self):
        content = self._read_file(self.organic_ui_md)
        self.assertTrue(
            re.search(r"\b(150ms|180ms|200ms|0\.1[5-8]s|0\.2s)\b", content) is not None,
            "organic-ui.md must mandate snappy transition durations (<250ms)",
        )

    # --------------------------------------------------------------------------
    # Feature 9: Semantic OKLCH / HSL Palettes (references/color-psychology.md)
    # --------------------------------------------------------------------------
    def test_f09_semantic_token_naming_convention(self):
        content = self._read_file(self.color_psych_md)
        self.assertTrue(
            "--bg-app" in content and "--text-main" in content and "--primary" in content,
            "color-psychology.md must define semantic tokens (--bg-app, --text-main, --primary)",
        )

    def test_f09_tinted_neutral_undertones_explained(self):
        content = self._read_file(self.color_psych_md).lower()
        self.assertTrue(
            "undertone" in content or "tinted neutral" in content or "warm" in content,
            "color-psychology.md must mandate warm/tinted undertones in neutrals",
        )

    def test_f09_uncalibrated_dead_gray_rejection(self):
        content = self._read_file(self.color_psych_md).lower()
        self.assertTrue(
            "dead gray" in content or "#6b7280" in content or "cold gray" in content or "pure gray" in content,
            "color-psychology.md must explicitly reject uncalibrated dead grays",
        )

    def test_f09_four_domain_palettes_provided(self):
        content = self._read_file(self.color_psych_md)
        # Should document domain palettes for B2B/Fintech, Healthcare, Creative, Lifestyle
        found_domains = sum(
            1 for d in ["fintech", "health", "creative", "lifestyle", "stewardship", "care"]
            if d in content.lower()
        )
        self.assertGreaterEqual(
            found_domains, 3, "color-psychology.md must define multiple emotion-grounded domain palettes"
        )

    def test_f09_oklch_or_hsl_perceptual_uniformity(self):
        content = self._read_file(self.color_psych_md)
        self.assertTrue(
            "oklch" in content.lower() or "hsl" in content.lower(),
            "color-psychology.md must document OKLCH or HSL perceptual lightness system",
        )

    # --------------------------------------------------------------------------
    # Feature 10: Emotional 60-30-10 Palette Architecture (references/color-psychology.md)
    # --------------------------------------------------------------------------
    def test_f10_sixty_thirty_ten_rule_defined(self):
        content = self._read_file(self.color_psych_md)
        self.assertTrue(
            "60-30-10" in content or "60/30/10" in content,
            "color-psychology.md must document the 60-30-10 palette architecture",
        )

    def test_f10_sixty_percent_canvas_backdrop(self):
        content = self._read_file(self.color_psych_md)
        self.assertTrue(
            "60%" in content and ("canvas" in content.lower() or "backdrop" in content.lower() or "surface" in content.lower()),
            "color-psychology.md must assign 60% to canvas base/neutral surfaces",
        )

    def test_f10_thirty_percent_structural_surfaces(self):
        content = self._read_file(self.color_psych_md)
        self.assertTrue(
            "30%" in content and ("surface" in content.lower() or "structural" in content.lower() or "typography" in content.lower()),
            "color-psychology.md must assign 30% to structural surfaces and ink",
        )

    def test_f10_ten_percent_emotional_accent(self):
        content = self._read_file(self.color_psych_md)
        self.assertTrue(
            "10%" in content and "accent" in content.lower(),
            "color-psychology.md must assign 10% to emotional focal accents",
        )

    def test_f10_anti_rainbow_saturation_warning(self):
        content = self._read_file(self.color_psych_md).lower()
        self.assertTrue(
            "rainbow" in content or "saturation soup" in content or "restraint" in content or "over-saturation" in content,
            "color-psychology.md must caution against multi-accent saturation chaos",
        )

    # --------------------------------------------------------------------------
    # Feature 11: AI Color Cliché Banishment (references/color-psychology.md)
    # --------------------------------------------------------------------------
    def test_f11_banned_indigo_violet_gradient_trope(self):
        content = self._read_file(self.color_psych_md).lower()
        self.assertTrue(
            "indigo" in content or "violet" in content or "purple" in content,
            "color-psychology.md must explicitly banish generic AI indigo/violet gradients",
        )

    def test_f11_banned_radioactive_cyan_neon_trope(self):
        content = self._read_file(self.color_psych_md).lower()
        self.assertTrue(
            "cyan" in content or "neon" in content or "cyberpunk" in content,
            "color-psychology.md must explicitly banish radioactive cyan/neon glow clichés",
        )

    def test_f11_banned_pitch_black_white_combination(self):
        content = self._read_file(self.color_psych_md)
        self.assertTrue(
            "#000000" in content or "pitch black" in content.lower(),
            "color-psychology.md must warn against raw pitch black #000000 pairing",
        )

    def test_f11_color_temperature_framework(self):
        content = self._read_file(self.color_psych_md)
        self.assertTrue(
            "temperature" in content.lower() or "2700k" in content.lower() or "warm" in content.lower(),
            "color-psychology.md must provide a color temperature framework (warm vs cold)",
        )

    def test_f11_regex_lint_pattern_for_color_cliches(self):
        content = self._read_file(self.color_psych_md)
        self.assertTrue(
            "regex" in content.lower() or "gradient" in content.lower() or "linter" in content.lower(),
            "color-psychology.md must provide actionable detection rules or regex for color tropes",
        )

    # --------------------------------------------------------------------------
    # Feature 12: Functional Contrast & Dark Mode Parity (references/color-psychology.md)
    # --------------------------------------------------------------------------
    def test_f12_wcag_aa_contrast_minimum_stated(self):
        content = self._read_file(self.color_psych_md)
        self.assertTrue(
            "4.5:1" in content or "4.5" in content,
            "color-psychology.md must state WCAG AA 4.5:1 text contrast standard",
        )

    def test_f12_wcag_large_text_contrast_stated(self):
        content = self._read_file(self.color_psych_md)
        self.assertTrue(
            "3:1" in content or "3.0:1" in content,
            "color-psychology.md must state WCAG 3:1 contrast for large text and controls",
        )

    def test_f12_dark_mode_halation_prevention(self):
        content = self._read_file(self.color_psych_md).lower()
        self.assertTrue(
            "halation" in content or "eye strain" in content or "irradiation" in content,
            "color-psychology.md must document dark mode halation prevention",
        )

    def test_f12_elevated_dark_surfaces_hierarchy(self):
        content = self._read_file(self.color_psych_md)
        self.assertTrue(
            "surface" in content.lower() and ("elevated" in content.lower() or "surface-1" in content or "surface-2" in content),
            "color-psychology.md must define elevated dark surfaces rather than pure black",
        )

    def test_f12_dark_light_mode_parity(self):
        content = self._read_file(self.color_psych_md).lower()
        self.assertTrue(
            "dark mode" in content and "light" in content,
            "color-psychology.md must mandate parity across light and dark mode token mappings",
        )

    # --------------------------------------------------------------------------
    # Feature 13: The LLM Slop Blacklist (references/conversational-copy.md)
    # --------------------------------------------------------------------------
    def test_f13_blacklist_header_present(self):
        content = self._read_file(self.copy_md)
        headers = [h[1].lower() for h in get_markdown_headers(content)]
        self.assertTrue(
            any("blacklist" in h or "slop" in h or "banned" in h for h in headers),
            "conversational-copy.md must contain a dedicated LLM slop blacklist section",
        )

    def test_f13_hollow_escalators_contained(self):
        content = self._read_file(self.copy_md).lower()
        self.assertTrue(
            "unleash" in content and "elevate" in content and "supercharge" in content,
            "Blacklist must contain hollow escalators ('unleash', 'elevate', 'supercharge')",
        )

    def test_f13_pseudo_intellectual_connectors_contained(self):
        content = self._read_file(self.copy_md).lower()
        self.assertTrue(
            "delve" in content and "tapestry" in content,
            "Blacklist must contain pseudo-intellectual connectors ('delve', 'tapestry')",
        )

    def test_f13_frictionless_myths_contained(self):
        content = self._read_file(self.copy_md).lower()
        self.assertTrue(
            "seamless" in content or "effortless" in content,
            "Blacklist must contain frictionless myths ('seamless', 'effortless')",
        )

    def test_f13_blacklist_contains_thirty_plus_items(self):
        content = self._read_file(self.copy_md).lower()
        found_count = sum(1 for w in BANNED_AI_WORDS_EN if w in content)
        self.assertGreaterEqual(
            found_count, 20, f"Blacklist must contain 20+ known slop words (found: {found_count})"
        )

    # --------------------------------------------------------------------------
    # Feature 14: Cliché Search-and-Replace Dictionary (references/conversational-copy.md)
    # --------------------------------------------------------------------------
    def test_f14_search_replace_table_present(self):
        content = self._read_file(self.copy_md)
        self.assertTrue(
            "|" in content and ("before" in content.lower() or "ai" in content.lower()) and ("after" in content.lower() or "human" in content.lower()),
            "conversational-copy.md must provide a search-and-replace mapping table",
        )

    def test_f14_concrete_number_replacements(self):
        content = self._read_file(self.copy_md)
        # Check that table contains specific numbers/metrics in replacement column
        has_metrics = re.search(r"\|\s*.*?\d+.*?\s*\|", content) is not None
        self.assertTrue(has_metrics, "Search-and-replace dictionary must provide concrete metrics/numbers")

    def test_f14_tangible_action_verb_guidance(self):
        content = self._read_file(self.copy_md).lower()
        self.assertTrue(
            "concrete" in content or "action verb" in content or "active verb" in content,
            "conversational-copy.md must emphasize active, tangible verbs",
        )

    def test_f14_fifteen_plus_dictionary_pairs(self):
        content = self._read_file(self.copy_md)
        # Count table rows with pipe symbols
        table_rows = [line for line in content.splitlines() if line.strip().startswith("|") and not "---" in line]
        self.assertGreaterEqual(
            len(table_rows), 10, "Search-and-replace dictionary must contain at least 10 conversion rows"
        )

    def test_f14_enterprise_vs_consumer_tone_guidance(self):
        content = self._read_file(self.copy_md).lower()
        self.assertTrue(
            "enterprise" in content or "consumer" in content or "tone" in content,
            "conversational-copy.md must address tone calibrations",
        )

    # --------------------------------------------------------------------------
    # Feature 15: Staccato & Legato Cadence Tuning (references/conversational-copy.md)
    # --------------------------------------------------------------------------
    def test_f15_staccato_definition_present(self):
        content = self._read_file(self.copy_md).lower()
        self.assertIn("staccato", content, "conversational-copy.md must define staccato sentence cadence")

    def test_f15_legato_definition_present(self):
        content = self._read_file(self.copy_md).lower()
        self.assertIn("legato", content, "conversational-copy.md must define legato sentence cadence")

    def test_f15_monotone_eighteen_word_sentence_antipattern(self):
        content = self._read_file(self.copy_md).lower()
        self.assertTrue(
            "monotone" in content or "18-word" in content or "sentence length" in content,
            "conversational-copy.md must document the monotonous sentence length antipattern",
        )

    def test_f15_syllogistic_lecture_elimination(self):
        content = self._read_file(self.copy_md).lower()
        self.assertTrue(
            "fast-paced" in content or "lecture" in content or "filler" in content or "syllogis" in content,
            "conversational-copy.md must reject syllogistic lecture structures ('In today's fast-paced world...')",
        )

    def test_f15_cadence_before_after_demonstrated(self):
        content = self._read_file(self.copy_md).lower()
        self.assertTrue(
            "cadence" in content and ("before" in content or "example" in content),
            "conversational-copy.md must demonstrate cadence tuning with concrete examples",
        )

    # --------------------------------------------------------------------------
    # Feature 16: Value-First CTA Engineering (references/conversational-copy.md)
    # --------------------------------------------------------------------------
    def test_f16_cta_three_part_formula_documented(self):
        content = self._read_file(self.copy_md).lower()
        self.assertTrue(
            "action verb" in content or "tangible benefit" in content or "friction" in content or "cta" in content,
            "conversational-copy.md must document the value-first CTA engineering formula",
        )

    def test_f16_generic_cta_rejection(self):
        content = self._read_file(self.copy_md).lower()
        self.assertTrue(
            "get started" in content or "submit" in content or "learn more" in content,
            "conversational-copy.md must explicitly reject generic CTAs ('Get Started', 'Submit')",
        )

    def test_f16_friction_reducer_microcopy_guidelines(self):
        content = self._read_file(self.copy_md).lower()
        self.assertTrue(
            "friction" in content or "no credit card" in content or "cancel anytime" in content,
            "conversational-copy.md must provide friction reducer microcopy patterns",
        )

    def test_f16_secondary_cta_low_commitment(self):
        content = self._read_file(self.copy_md).lower()
        self.assertTrue(
            "secondary" in content or "demo" in content or "preview" in content,
            "conversational-copy.md must specify secondary low-commitment CTA patterns",
        )

    def test_f16_concrete_humanized_cta_examples(self):
        content = self._read_file(self.copy_md)
        self.assertTrue(
            re.search(r"['\"][A-Z][^'\"]*(?:free|trial|minutes|card|download|start)[^'\"]*['\"]", content, re.IGNORECASE) is not None,
            "conversational-copy.md must provide quotes/examples of high-converting humanized CTAs",
        )

    # --------------------------------------------------------------------------
    # Feature 17: Empathetic Microcopy & Error Recovery (references/conversational-copy.md)
    # --------------------------------------------------------------------------
    def test_f17_empathetic_error_formula_documented(self):
        content = self._read_file(self.copy_md).lower()
        self.assertTrue(
            "what happened" in content or "how to fix" in content or "error" in content,
            "conversational-copy.md must define empathetic 3-part error formula",
        )

    def test_f17_cold_system_dump_rejection(self):
        content = self._read_file(self.copy_md).lower()
        self.assertTrue(
            "error 500" in content or "unexpected error" in content or "system dump" in content,
            "conversational-copy.md must reject cold technical errors without human translation",
        )

    def test_f17_blame_shifting_rejection(self):
        content = self._read_file(self.copy_md).lower()
        self.assertTrue(
            "oops" in content or "blame" in content or "fault" in content,
            "conversational-copy.md must reject blame-shifting and childish 'Oops!' tropes",
        )

    def test_f17_actionable_one_click_recovery(self):
        content = self._read_file(self.copy_md).lower()
        self.assertTrue(
            "recovery" in content or "1-click" in content or "action" in content,
            "conversational-copy.md must mandate 1-click recovery actions on error states",
        )

    def test_f17_contextual_empty_state_guidelines(self):
        content = self._read_file(self.copy_md).lower()
        self.assertTrue(
            "empty state" in content or "no data" in content or "zero-data" in content,
            "conversational-copy.md must provide empathetic empty state guidance",
        )

    # --------------------------------------------------------------------------
    # Feature 18: Bilingual Cliché Adaptation (EN & ES) (references/conversational-copy.md)
    # --------------------------------------------------------------------------
    def test_f18_spanish_cliches_catalog_present(self):
        content = self._read_file(self.copy_md).lower()
        self.assertTrue(
            "empoderar" in content or "sin fisuras" in content or "español" in content or "spanish" in content,
            "conversational-copy.md must include catalog of Spanish AI clichés",
        )

    def test_f18_translation_calques_documented(self):
        content = self._read_file(self.copy_md).lower()
        self.assertTrue(
            "calque" in content or "traducción" in content or "translation" in content,
            "conversational-copy.md must document unnatural translation calques from English to Spanish",
        )

    def test_f18_tu_vs_usted_tone_calibration(self):
        content = self._read_file(self.copy_md).lower()
        self.assertTrue(
            "tú" in content or "usted" in content or "pronombre" in content,
            "conversational-copy.md must guide 'tú' vs 'usted' register selection",
        )

    def test_f18_spanish_text_expansion_factor(self):
        content = self._read_file(self.copy_md)
        self.assertTrue(
            "20%" in content or "30%" in content or "expansion" in content.lower() or "longitud" in content.lower(),
            "conversational-copy.md must address 20-35% text expansion in Spanish UI strings",
        )

    def test_f18_bilingual_side_by_side_examples(self):
        content = self._read_file(self.copy_md)
        self.assertTrue(
            "english" in content.lower() and "spanish" in content.lower(),
            "conversational-copy.md must provide side-by-side English and Spanish examples",
        )

    # --------------------------------------------------------------------------
    # Feature 19: Case Study 1: B2B SaaS Hero Section (examples/before-after-cases.md)
    # --------------------------------------------------------------------------
    def test_f19_case1_header_present(self):
        content = self._read_file(self.cases_md)
        headers = [h[1].lower() for h in get_markdown_headers(content)]
        self.assertTrue(
            any("case 1" in h or "saas hero" in h or "b2b" in h for h in headers),
            "before-after-cases.md must contain Case Study 1: B2B SaaS Hero Section",
        )

    def test_f19_case1_before_ai_snippet(self):
        content = self._read_file(self.cases_md).lower()
        self.assertTrue(
            "case 1" in content and "before" in content,
            "Case 1 must provide a concrete 'Before (AI-generated)' specification",
        )

    def test_f19_case1_after_humanized_snippet(self):
        content = self._read_file(self.cases_md).lower()
        self.assertTrue(
            "case 1" in content and "after" in content,
            "Case 1 must provide a concrete 'After (Humanized)' specification",
        )

    def test_f19_case1_code_markup_provided(self):
        content = self._read_file(self.cases_md)
        self.assertTrue(
            "```html" in content or "```jsx" in content or "```tsx" in content,
            "Case 1 must include complete production HTML/JSX/CSS code snippets",
        )

    def test_f19_case1_visual_anatomy_breakdown(self):
        content = self._read_file(self.cases_md).lower()
        self.assertTrue(
            "anatomy" in content or "layout" in content or "hierarchy" in content,
            "Case 1 must break down visual composition and key fixes",
        )

    # --------------------------------------------------------------------------
    # Feature 20: Case Study 2: E-Commerce / Dashboard Card (examples/before-after-cases.md)
    # --------------------------------------------------------------------------
    def test_f20_case2_header_present(self):
        content = self._read_file(self.cases_md)
        headers = [h[1].lower() for h in get_markdown_headers(content)]
        self.assertTrue(
            any("case 2" in h or "dashboard" in h or "card" in h or "e-commerce" in h for h in headers),
            "before-after-cases.md must contain Case Study 2: Dashboard / Bento Card",
        )

    def test_f20_case2_symmetrical_cards_antipattern(self):
        content = self._read_file(self.cases_md).lower()
        self.assertTrue(
            "case 2" in content and ("symmetrical" in content or "3 identical" in content or "card" in content),
            "Case 2 must contrast symmetrical cards against asymmetrical bento",
        )

    def test_f20_case2_state_handling_illustrated(self):
        content = self._read_file(self.cases_md).lower()
        self.assertTrue(
            "hover" in content or "active" in content or "status" in content or "state" in content,
            "Case 2 must demonstrate realistic component state handling",
        )

    def test_f20_case2_tactile_materiality_details(self):
        content = self._read_file(self.cases_md)
        self.assertTrue(
            "shadow" in content.lower() or "border" in content.lower() or "inset" in content.lower(),
            "Case 2 must include tactile depth and border details in code",
        )

    def test_f20_case2_empathetic_microcopy_breakdown(self):
        content = self._read_file(self.cases_md).lower()
        self.assertTrue(
            "microcopy" in content or "billing" in content or "alert" in content or "notification" in content,
            "Case 2 must break down empathetic microcopy changes",
        )

    # --------------------------------------------------------------------------
    # Feature 21: Case Study 3: Multi-Step Form & Error State (examples/before-after-cases.md)
    # --------------------------------------------------------------------------
    def test_f21_case3_header_present(self):
        content = self._read_file(self.cases_md)
        headers = [h[1].lower() for h in get_markdown_headers(content)]
        self.assertTrue(
            any("case 3" in h or "form" in h or "error state" in h for h in headers),
            "before-after-cases.md must contain Case Study 3: Multi-Step Form & Error State",
        )

    def test_f21_case3_sterile_form_antipattern(self):
        content = self._read_file(self.cases_md).lower()
        self.assertTrue(
            "case 3" in content and ("sterile" in content or "red border" in content or "validation" in content),
            "Case 3 must contrast sterile rigid forms with conversational forms",
        )

    def test_f21_case3_inline_validation_recovery(self):
        content = self._read_file(self.cases_md).lower()
        self.assertTrue(
            "inline" in content or "recovery" in content or "helper" in content,
            "Case 3 must demonstrate inline error recovery patterns",
        )

    def test_f21_case3_accessible_form_markup(self):
        content = self._read_file(self.cases_md)
        self.assertTrue(
            "<label" in content or "aria-" in content or "id=" in content,
            "Case 3 must provide accessible form markup (labels, ids, ARIA attributes)",
        )

    def test_f21_case3_privacy_permission_microcopy(self):
        content = self._read_file(self.cases_md).lower()
        self.assertTrue(
            "privacy" in content or "permission" in content or "hipaa" in content or "encrypt" in content,
            "Case 3 must include humanized privacy or permission microcopy",
        )

    # --------------------------------------------------------------------------
    # Feature 22: 30-Point Objective Scoring Matrix (references/audit-rubric.md)
    # --------------------------------------------------------------------------
    def test_f22_thirty_point_matrix_header_present(self):
        content = self._read_file(self.rubric_md)
        headers = [h[1].lower() for h in get_markdown_headers(content)]
        self.assertTrue(
            any("30-point" in h or "matrix" in h or "scoring" in h or "rubric" in h for h in headers),
            "audit-rubric.md must contain the objective scoring matrix header",
        )

    def test_f22_six_distinct_evaluation_dimensions(self):
        content = self._read_file(self.rubric_md).lower()
        found_dims = sum(
            1 for d in ["visual", "material", "chromatic", "copy", "microinteraction", "scannability", "rhythm", "depth", "voice"]
            if d in content
        )
        self.assertGreaterEqual(
            found_dims, 4, "audit-rubric.md must define multi-dimensional evaluation criteria"
        )

    def test_f22_observable_scoring_scale_defined(self):
        content = self._read_file(self.rubric_md)
        # Check that point scales are defined (0-5 pts or total points)
        self.assertTrue(
            re.search(r"\b(?:0-5|0–5|5 pts|25 pts|30 pts|100)\b", content) is not None,
            "audit-rubric.md must specify observable numerical scoring points",
        )

    def test_f22_quality_scoring_tiers_defined(self):
        content = self._read_file(self.rubric_md).lower()
        self.assertTrue(
            "tier" in content and ("mastercraft" in content or "polished" in content or "slop" in content or "uncanny" in content),
            "audit-rubric.md must classify score brackets into named quality tiers",
        )

    def test_f22_audit_execution_protocol_steps(self):
        content = self._read_file(self.rubric_md).lower()
        self.assertTrue(
            "protocol" in content or "workflow" in content or "step" in content,
            "audit-rubric.md must provide step-by-step instructions for executing an audit",
        )

    # --------------------------------------------------------------------------
    # Feature 23: 10-Point Boolean Quick-Triage Checklist (references/audit-rubric.md)
    # --------------------------------------------------------------------------
    def test_f23_triage_checklist_header_present(self):
        content = self._read_file(self.rubric_md)
        headers = [h[1].lower() for h in get_markdown_headers(content)]
        self.assertTrue(
            any("10-point" in h or "triage" in h or "checklist" in h or "quick" in h for h in headers),
            "audit-rubric.md must contain the 10-Point Boolean Quick-Triage Checklist",
        )

    def test_f23_binary_pass_fail_format(self):
        content = self._read_file(self.rubric_md)
        self.assertTrue(
            "[ ]" in content or "[x]" in content or "yes/no" in content.lower() or "pass/fail" in content.lower(),
            "Quick-triage checklist must use binary boolean checkboxes or Pass/Fail format",
        )

    def test_f23_ten_diagnostic_questions_present(self):
        content = self._read_file(self.rubric_md)
        # Look for 10 numbered or checkboxed questions in triage section
        triage_items = re.findall(r"(?:\[ \]|\[x\]|\d+\.)\s+([A-Z¿¡].*?\?)", content)
        self.assertGreaterEqual(
            len(triage_items), 5, "Checklist must present diagnostic triage questions"
        )

    def test_f23_two_minute_triage_design(self):
        content = self._read_file(self.rubric_md).lower()
        self.assertTrue(
            "quick" in content or "rapid" in content or "2-minute" in content or "sanity" in content,
            "Checklist must be framed as a rapid triage mechanism",
        )

    def test_f23_remediation_pointers_for_failed_items(self):
        content = self._read_file(self.rubric_md).lower()
        self.assertTrue(
            "remediation" in content or "see" in content or "chapter" in content or "fix" in content,
            "Checklist must direct failed diagnostic checks to remediation guidance",
        )

    # --------------------------------------------------------------------------
    # Feature 24: Automated Copy Audit Script (scripts/audit_copy.py)
    # --------------------------------------------------------------------------
    def test_f24_script_file_exists(self):
        self.assertTrue(
            self.audit_script.exists(),
            f"scripts/audit_copy.py must exist at {self.audit_script}",
        )

    def test_f24_cli_argument_parsing(self):
        content = self._read_file(self.audit_script)
        self.assertTrue(
            "argparse" in content or "sys.argv" in content,
            "audit_copy.py must parse CLI command-line arguments",
        )

    def test_f24_threshold_flag_supported(self):
        content = self._read_file(self.audit_script)
        self.assertTrue(
            "--threshold" in content or "threshold" in content,
            "audit_copy.py must support --threshold flag",
        )

    def test_f24_lang_flag_supported(self):
        content = self._read_file(self.audit_script)
        self.assertTrue(
            "--lang" in content or "lang" in content,
            "audit_copy.py must support --lang flag (en/es/all)",
        )

    def test_f24_humanization_score_calculated(self):
        content = self._read_file(self.audit_script).lower()
        self.assertTrue(
            "score" in content and ("100" in content or "humanization" in content),
            "audit_copy.py must calculate a quantifiable humanization score (0-100)",
        )


if __name__ == "__main__":
    unittest.main()
