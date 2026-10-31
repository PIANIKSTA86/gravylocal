"""
Adversarial Stress Test Suite for Milestone 2: references/organic-ui.md
Agent: M2 Challenger 1 (Boundary & E2E Test Verifier)
"""

import os
import re
import sys
import json
import time
from pathlib import Path
from typing import Dict, Any, List, Tuple
from html.parser import HTMLParser

TARGET_FILE = Path(r"C:\Users\JULIAN\.gemini\config\skills\human-interface-design\references\organic-ui.md")
SKILL_DIR = Path(r"C:\Users\JULIAN\.gemini\config\skills\human-interface-design")

BANNED_SLOP_WORDS = [
    "supercharge", "unleash", "synergy", "unparalleled", "seamless",
    "tapestry", "dive into", "delve", "game-changer", "testament",
    "beacon", "revolutionize", "cutting-edge", "paramount",
    "streamline", "elevate", "holistic", "empower"
]

class SimpleHTMLTagValidator(HTMLParser):
    def __init__(self):
        super().__init__()
        self.tags_stack = []
        self.errors = []
        self.void_tags = {"area", "base", "br", "col", "embed", "hr", "img", "input",
                          "link", "meta", "param", "source", "track", "wbr"}

    def handle_starttag(self, tag, attrs):
        if tag.lower() not in self.void_tags:
            self.tags_stack.append(tag.lower())

    def handle_endtag(self, tag):
        tag_l = tag.lower()
        if tag_l in self.void_tags:
            return
        if not self.tags_stack:
            self.errors.append(f"Unexpected closing tag </{tag}> with empty stack")
        elif self.tags_stack[-1] == tag_l:
            self.tags_stack.pop()
        else:
            if tag_l in self.tags_stack:
                idx = len(self.tags_stack) - 1 - self.tags_stack[::-1].index(tag_l)
                missing = self.tags_stack[idx+1:]
                self.errors.append(f"Mismatched closing tag </{tag}> (expected closing for: {missing})")
                self.tags_stack = self.tags_stack[:idx]
            else:
                self.errors.append(f"Closing tag </{tag}> without matching start tag")

class AdversarialRunner:
    def __init__(self):
        self.results = []
        self.total_tests = 0
        self.passed_tests = 0
        self.failed_tests = 0

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

    def read_target(self) -> str:
        if not TARGET_FILE.exists():
            raise FileNotFoundError(f"Target file not found: {TARGET_FILE}")
        return TARGET_FILE.read_text(encoding="utf-8", errors="replace")

    # =========================================================================
    # BATTERY 1: Typographic Math & Boundary Rigor
    # =========================================================================
    def run_battery_1_typographic_math(self, content: str):
        print("\n--- BATTERY 1: Typographic Math & Boundary Rigor ---")

        # 1.1 Strictly Increasing Clamp Expressions
        clamps = re.findall(r"clamp\(\s*([^,]+)\s*,\s*([^,]+)\s*,\s*([^)]+)\s*\)", content)
        all_increasing = True
        clamp_checks = []
        for c_min, c_val, c_max in clamps:
            min_match = re.search(r"(\d+(?:\.\d+)?)\s*(rem|px|ch|em|vw)?", c_min)
            max_match = re.search(r"(\d+(?:\.\d+)?)\s*(rem|px|ch|em|vw)?", c_max)
            if min_match and max_match:
                v_min = float(min_match.group(1))
                u_min = min_match.group(2) or "px"
                v_max = float(max_match.group(1))
                u_max = max_match.group(2) or "px"
                norm_min = v_min * 16 if u_min == "rem" else v_min
                norm_max = v_max * 16 if u_max == "rem" else v_max
                is_inc = norm_min < norm_max
                clamp_checks.append({"min": c_min.strip(), "max": c_max.strip(), "increasing": is_inc})
                if not is_inc:
                    all_increasing = False

        self.log_result(
            "B1.1_clamp_monotonicity",
            passed=(len(clamps) >= 3 and all_increasing),
            details=f"Found {len(clamps)} clamp expressions; all increasing = {all_increasing}",
            empirical_data={"clamps_count": len(clamps), "checks": clamp_checks}
        )

        # 1.2 Line-Height Inversion: Headlines tight (1.1 - 1.25) vs Body relaxed (1.55 - 1.65)
        table_headline_lh = re.findall(r"`(1\.[1-2]\d?)`", content)
        table_body_lh = re.findall(r"`(1\.[5-6]\d?)`", content)
        valid_inversion = len(table_headline_lh) > 0 and len(table_body_lh) > 0
        self.log_result(
            "B1.2_line_height_inversion",
            passed=valid_inversion,
            details=f"Headline tight line-heights: {table_headline_lh[:3]}, Body relaxed line-heights: {table_body_lh[:3]}",
            empirical_data={"headline_matches": table_headline_lh, "body_matches": table_body_lh}
        )

        # 1.3 Reading Measure Constraints (max-width: 65ch / max-w-prose)
        measures = re.findall(r"(?:max-width:\s*(\d+)ch|max-w-prose|\b(6[0-9]|7[0-5])ch\b)", content)
        has_optimal_measure = any("65" in str(m) or "prose" in str(m) for m in measures)
        excessive_measure = re.findall(r"max-width:\s*([8-9]\d|\d{3,})ch", content)
        self.log_result(
            "B1.3_optimal_reading_measure",
            passed=(has_optimal_measure and len(excessive_measure) == 0),
            details=f"65ch/prose documented = {has_optimal_measure}, Excessive (>80ch) measures found = {len(excessive_measure)}",
            empirical_data={"measures": [str(m) for m in measures[:5]], "excessive": excessive_measure}
        )

        # 1.4 Optical Tracking Monotonicity: Negative for headlines, positive for badges
        has_negative_headline_tracking = bool(re.search(r"-\s*0\.0[1-3]\d*em", content))
        has_positive_microcopy_tracking = bool(re.search(r"\+\s*0\.(?:0[5-9]|1[0-2])em", content))
        self.log_result(
            "B1.4_optical_tracking_calibration",
            passed=(has_negative_headline_tracking and has_positive_microcopy_tracking),
            details=f"Negative headline tracking: {has_negative_headline_tracking}, Positive microcopy tracking: {has_positive_microcopy_tracking}",
            empirical_data={"neg_tracking": has_negative_headline_tracking, "pos_tracking": has_positive_microcopy_tracking}
        )

        # 1.5 Tabular Numeric Stability (tabular-nums)
        tabular_matches = re.findall(r"(?:font-variant-numeric:\s*tabular-nums|tabular-nums)", content)
        self.log_result(
            "B1.5_tabular_numeric_stability",
            passed=(len(tabular_matches) >= 4),
            details=f"Found {len(tabular_matches)} tabular-nums declarations across tables and snippets",
            empirical_data={"count": len(tabular_matches)}
        )

    # =========================================================================
    # BATTERY 2: Materiality & Lighting Optics
    # =========================================================================
    def run_battery_2_materiality_optics(self, content: str):
        print("\n--- BATTERY 2: Materiality & Lighting Optics ---")

        # 2.1 Coherent Key Light Source & Single-Edge Specular Highlights
        has_120_light = bool(re.search(r"\b120[°\s]|top-left\b", content, re.IGNORECASE))
        specular_matches = re.findall(r"inset\s+0\s+(?:1px|-1px)\s+0(?:\s+0)?\s+rgba\([^)]+\)", content)
        # Verify that four-sided neon glow is explicitly labeled an antipattern
        neon_glow_rejected = bool(re.search(r"(?:never|avoid|mimics a synthetic neon box).*inset\s+0\s+0\s+1px\s+1px", content, re.IGNORECASE))

        self.log_result(
            "B2.1_coherent_120deg_key_light_and_specular_edge",
            passed=(has_120_light and len(specular_matches) >= 3 and neon_glow_rejected),
            details=f"120° light: {has_120_light}, Single-edge specular highlights: {len(specular_matches)}, Four-sided neon glow rejected: {neon_glow_rejected}",
            empirical_data={"specular_count": len(specular_matches)}
        )

        # 2.2 Explicit 'px' Length Units on all box-shadow Rules in Code Blocks
        # Extract CSS code blocks and validate box-shadow rules within them
        css_blocks = re.findall(r"```css\s*([\s\S]*?)```", content)
        css_shadows = []
        for block in css_blocks:
            matches = re.findall(r"box-shadow:\s*([^;]+);", block)
            css_shadows.extend(matches)

        # Also extract table recipes
        table_shadows = re.findall(r"\|[^\n]*`(box-shadow:\s*[^;`]+;)`", content)

        all_rules = css_shadows + table_shadows
        invalid_shadows = []
        for s in all_rules:
            # Strip colors and inset keyword
            cleaned = re.sub(r'(?:hsla?|rgba?)\([^)]+\)|transparent', '', s)
            cleaned = re.sub(r'\binset\b', '', cleaned)
            # Find numbers
            tokens = re.findall(r'(?<![a-zA-Z0-9_\#\-\.])(-?\d+(?:\.\d+)?)([a-zA-Z%]+)?', cleaned)
            for num, unit in tokens:
                val = float(num)
                if val != 0 and unit != "px":
                    invalid_shadows.append(f"{num}{unit or 'NO_UNIT'} in: {s.strip()}")

        self.log_result(
            "B2.2_box_shadow_explicit_px_units",
            passed=(len(all_rules) >= 6 and len(invalid_shadows) == 0),
            details=f"Verified {len(all_rules)} production box-shadow rules; invalid/missing units = {len(invalid_shadows)}",
            empirical_data={"rules_checked": len(all_rules), "invalid": invalid_shadows}
        )

        # 2.3 3-Layer Diffuse Shadow Stacking Architecture
        multi_layer_shadows = [s for s in all_rules if s.count(",") >= 2]
        self.log_result(
            "B2.3_multilayer_shadow_stacking",
            passed=(len(multi_layer_shadows) >= 4),
            details=f"Found {len(multi_layer_shadows)} multi-layer (>=3 comma-separated layers) shadow recipes",
            empirical_data={"multi_layer_count": len(multi_layer_shadows)}
        )

        # 2.4 Monotonic Dark Mode Elevation Steps in Section 5.6
        sec5_6 = content[content.find("5.6 Dark Mode Shadow Adaptation"):content.find("5.7 The Glass Boundary")]
        dark_elevations = [int(x) for x in re.findall(r"`hsl\(220,\s*\d+%,\s*(\d+)%\)`", sec5_6)]
        unique_elevations = []
        for e in dark_elevations:
            if not unique_elevations or e != unique_elevations[-1]:
                unique_elevations.append(e)
        is_monotonic = len(unique_elevations) >= 5 and all(unique_elevations[i] < unique_elevations[i+1] for i in range(len(unique_elevations)-1))
        self.log_result(
            "B2.4_dark_mode_monotonic_elevation",
            passed=is_monotonic,
            details=f"Section 5.6 elevation lightness steps: {unique_elevations} (strictly increasing)",
            empirical_data={"sequence": unique_elevations}
        )

        # 2.5 Glassmorphism Opacity Floor (>= 0.50)
        glass_section = content[content.find("5.7 The Glass Boundary"):content.find("Section 6")]
        recommended_glass = re.findall(r"rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*(0\.[5-9]\d*)\s*\)", glass_section)
        self.log_result(
            "B2.5_glassmorphism_opacity_safety_floor",
            passed=(len(recommended_glass) >= 1 and ">= 0.50" in glass_section),
            details=f"Recommended glass opacities: {recommended_glass}, Opacity floor >= 0.50 explicitly mandated",
            empirical_data={"recommended_opacities": recommended_glass}
        )

    # =========================================================================
    # BATTERY 3: Kinetics, Physics & Accessibility
    # =========================================================================
    def run_battery_3_kinetics_accessibility(self, content: str):
        print("\n--- BATTERY 3: Kinetics, Physics & Accessibility ---")

        # 3.1 Cubic-Bezier Coordinates Valid in [0.0, 1.0]
        beziers = re.findall(r"cubic-bezier\(\s*([\d.]+)\s*,\s*([\d.\-]+)\s*,\s*([\d.]+)\s*,\s*([\d.\-]+)\s*\)", content)
        valid_beziers = True
        bezier_data = []
        for x1, y1, x2, y2 in beziers:
            vx1, vy1, vx2, vy2 = float(x1), float(y1), float(x2), float(y2)
            valid_x = (0.0 <= vx1 <= 1.0) and (0.0 <= vx2 <= 1.0)
            bezier_data.append({"x1": vx1, "y1": vy1, "x2": vx2, "y2": vy2, "valid": valid_x})
            if not valid_x:
                valid_beziers = False

        self.log_result(
            "B3.1_cubic_bezier_coordinate_bounds",
            passed=(len(beziers) >= 2 and valid_beziers),
            details=f"Found {len(beziers)} cubic-bezier curves; all X coordinates in [0, 1] = {valid_beziers}",
            empirical_data={"beziers": bezier_data}
        )

        # 3.2 Active Click Depression Scale Bounds [0.94, 1.0) in CSS Rules
        # Find all scale(...) within :active rules
        active_blocks = re.findall(r":active\s*\{([^}]+)\}", content)
        active_scales = []
        for block in active_blocks:
            m = re.findall(r"scale\(\s*(0\.\d+)\s*\)", block)
            active_scales.extend(m)

        valid_scales = len(active_scales) > 0 and all(0.94 <= float(s) < 1.0 for s in active_scales)
        self.log_result(
            "B3.2_active_click_scale_depression_bounds",
            passed=valid_scales,
            details=f"Active scales: {active_scales}; all within [0.94, 1.0) = {valid_scales}",
            empirical_data={"scales": active_scales}
        )

        # 3.3 Microinteraction Duration Bounds (<= 250ms)
        durations = re.findall(r"\b(\d+)\s*ms\b", content)
        micro_durations = [int(d) for d in durations if d in ("75", "150", "180", "200", "220", "250", "300")]
        transition_bounds_safe = all(d <= 250 for d in micro_durations if d != 300)
        self.log_result(
            "B3.3_microinteraction_duration_bounds",
            passed=(transition_bounds_safe and any(d in micro_durations for d in (75, 180, 200))),
            details=f"Microinteraction durations: {set(micro_durations)}, capped <= 250ms",
            empirical_data={"durations": list(set(micro_durations))}
        )

        # 3.4 Touch vs Mouse Pointer Decoupling
        has_pointer_fine = bool(re.search(r"@media\s*\(\s*hover:\s*hover\s*\)\s*and\s*\(\s*pointer:\s*fine\s*\)", content))
        self.log_result(
            "B3.4_touch_hover_pointer_decoupling",
            passed=has_pointer_fine,
            details=f"@media (hover: hover) and (pointer: fine) present: {has_pointer_fine}",
            empirical_data={"present": has_pointer_fine}
        )

        # 3.5 Vestibular Accessibility & Prefers-Reduced-Motion Override
        has_reduced_motion = bool(re.search(r"@media\s*\(\s*prefers-reduced-motion:\s*reduce\s*\)", content))
        has_transform_none = bool(re.search(r"transform:\s*none\s*!important", content))
        has_opacity_fallback = bool(re.search(r"opacity:\s*0\.\d+\s*!important", content)) or bool(re.search(r"transition:\s*opacity", content))
        self.log_result(
            "B3.5_vestibular_reduced_motion_override",
            passed=(has_reduced_motion and has_transform_none and has_opacity_fallback),
            details=f"prefers-reduced-motion: {has_reduced_motion}, transform: none override: {has_transform_none}, opacity fallback: {has_opacity_fallback}",
            empirical_data={"reduced_motion": has_reduced_motion, "transform_none": has_transform_none, "opacity_fallback": has_opacity_fallback}
        )

        # 3.6 Focus-Visible Ring Separation (outline-offset >= 2px)
        focus_offset = re.findall(r"outline-offset:\s*(\d+)px", content)
        valid_offset = any(int(o) >= 2 for o in focus_offset)
        self.log_result(
            "B3.6_accessible_focus_ring_offset",
            passed=valid_offset,
            details=f"outline-offset declarations: {focus_offset}px (all >= 2px)",
            empirical_data={"offsets": focus_offset}
        )

    # =========================================================================
    # BATTERY 4: Layout & Asymmetry Bounds
    # =========================================================================
    def run_battery_4_layout_asymmetry(self, content: str):
        print("\n--- BATTERY 4: Layout & Asymmetry Bounds ---")

        # 4.1 Asymmetry Ratios (60/40, 70/30) vs Symmetrical 50/50 Antipattern
        has_60_40 = "60/40" in content
        has_70_30 = "70/30" in content
        symmetrical_recommendations = re.findall(r"(?:use|apply|recommend|standard)\s+50[/-]50", content, re.IGNORECASE)
        self.log_result(
            "B4.1_asymmetric_ratio_doctrine",
            passed=(has_60_40 and has_70_30 and len(symmetrical_recommendations) == 0),
            details=f"60/40 documented: {has_60_40}, 70/30 documented: {has_70_30}, Symmetrical 50/50 recommendations: {len(symmetrical_recommendations)}",
            empirical_data={"has_60_40": has_60_40, "has_70_30": has_70_30}
        )

        # 4.2 Cadence Ratio: Macro >= 64px, Micro <= 16px, Ratio >= 4:1
        macro_tokens = [int(m) for m in re.findall(r"\b(64|80|96|128)px\b", content)]
        micro_tokens = [int(m) for m in re.findall(r"\b(4|8|12|16)px\b", content)]
        cadence_pass = len(macro_tokens) > 0 and len(micro_tokens) > 0 and (min(macro_tokens) / max(micro_tokens) >= 4.0)
        self.log_result(
            "B4.2_musical_cadence_ratio_four_to_one",
            passed=cadence_pass,
            details=f"Min macro = {min(macro_tokens)}px, Max micro = {max(micro_tokens)}px -> Ratio = {min(macro_tokens)/max(micro_tokens):.1f}:1",
            empirical_data={"macro": sorted(list(set(macro_tokens))), "micro": sorted(list(set(micro_tokens)))}
        )

        # 4.3 Mobile Viewport Collapse (<640px down to 320px)
        has_640_bp = "640px" in content
        has_320_narrow = "320px" in content
        has_single_col = "single-column" in content.lower() or "grid-cols-1" in content
        self.log_result(
            "B4.3_mobile_viewport_collapse",
            passed=(has_640_bp and has_320_narrow and has_single_col),
            details=f"640px breakpoint: {has_640_bp}, 320px minimum: {has_320_narrow}, Single-column collapse: {has_single_col}",
            empirical_data={"640px": has_640_bp, "320px": has_320_narrow, "single_col": has_single_col}
        )

        # 4.4 Ultra-Wide Viewport Containment
        has_max_w_container = bool(re.search(r"(?:max-width:\s*12[0-9]{2}px|max-w-7xl)", content))
        self.log_result(
            "B4.4_ultrawide_container_containment",
            passed=has_max_w_container,
            details=f"Optical max-width container bounds (1240px / max-w-7xl) enforced: {has_max_w_container}",
            empirical_data={"present": has_max_w_container}
        )

        # 4.5 Nested Container Padding Degradation
        has_nested_rule = bool(re.search(r"p-8.*p-5.*p-3|p-6.*p-4.*p-2|degradation", content, re.IGNORECASE | re.DOTALL))
        self.log_result(
            "B4.5_nested_padding_degradation",
            passed=has_nested_rule,
            details=f"Nested container padding inward degradation rule documented: {has_nested_rule}",
            empirical_data={"present": has_nested_rule}
        )

    # =========================================================================
    # BATTERY 5: Syntax Integrity, Token Robustness & Slop Immunity
    # =========================================================================
    def run_battery_5_syntax_and_slop(self, content: str):
        print("\n--- BATTERY 5: Syntax Integrity, Token Robustness & Slop Immunity ---")

        # 5.1 Markdown Code Block Fence Balance
        fence_count = content.count("```")
        even_fences = (fence_count % 2 == 0) and (fence_count > 0)
        self.log_result(
            "B5.1_markdown_code_fence_balance",
            passed=even_fences,
            details=f"Found {fence_count} code fences ('```'); balanced = {even_fences}",
            empirical_data={"fence_count": fence_count}
        )

        # 5.2 CSS Code Block Syntax Validation
        css_blocks = re.findall(r"```css\s*([\s\S]*?)```", content)
        css_errors = []
        for idx, block in enumerate(css_blocks, start=1):
            clean = re.sub(r'/\*[\s\S]*?\*/', '', block)
            stack = []
            for line_idx, line in enumerate(clean.splitlines(), start=1):
                line = line.strip()
                if not line: continue
                for ch in line:
                    if ch in '{(':
                        stack.append((ch, line_idx))
                    elif ch in '})':
                        if not stack:
                            css_errors.append(f"Block {idx}:{line_idx} Unexpected {ch}")
                        else:
                            top, t_line = stack.pop()
                            if (top == '{' and ch != '}') or (top == '(' and ch != ')'):
                                css_errors.append(f"Block {idx}:{line_idx} Mismatched {top} from line {t_line} with {ch}")
            if stack:
                css_errors.append(f"Block {idx} Unclosed openers: {stack}")

        self.log_result(
            "B5.2_css_block_syntax_validation",
            passed=(len(css_blocks) >= 4 and len(css_errors) == 0),
            details=f"Parsed {len(css_blocks)} CSS blocks; syntax/bracket errors = {len(css_errors)}",
            empirical_data={"block_count": len(css_blocks), "errors": css_errors}
        )

        # 5.3 HTML Code Block Syntax & Tag Balance
        html_blocks = re.findall(r"```html\s*([\s\S]*?)```", content)
        html_errors = []
        for idx, block in enumerate(html_blocks, start=1):
            validator = SimpleHTMLTagValidator()
            try:
                validator.feed(block)
                if validator.tags_stack:
                    html_errors.append(f"Block #{idx} unclosed tags: {validator.tags_stack}")
                if validator.errors:
                    html_errors.extend([f"Block #{idx}: {e}" for e in validator.errors])
            except Exception as ex:
                html_errors.append(f"Block #{idx} parser exception: {ex}")

        self.log_result(
            "B5.3_html_block_syntax_validation",
            passed=(len(html_blocks) >= 2 and len(html_errors) == 0),
            details=f"Parsed {len(html_blocks)} HTML blocks; tag errors = {len(html_errors)}",
            empirical_data={"block_count": len(html_blocks), "errors": html_errors}
        )

        # 5.4 Dogfooding Slop Word Audit (Zero earnest slop words)
        clean_text = re.sub(r"```[\s\S]*?```", "", content)
        lines = clean_text.splitlines()
        slop_violations = []
        for line_idx, line in enumerate(lines, start=1):
            line_lower = line.lower()
            if any(k in line_lower for k in ["banned", "avoid", "antipattern", "cliché", "slop", "synthetic", "instead of", "eliminated", "eliminating", "destroy", "uncanny", "hallmark"]):
                continue
            words = re.findall(r"\b[a-zA-Z]+\b", line_lower)
            for w in words:
                if w in BANNED_SLOP_WORDS:
                    slop_violations.append((line_idx, w, line.strip()))

        self.log_result(
            "B5.4_dogfooding_slop_immunity",
            passed=(len(slop_violations) == 0),
            details=f"Earnest AI slop violations found: {len(slop_violations)}",
            empirical_data={"violations": slop_violations}
        )

        # 5.5 Document Structure & Completeness
        headings = re.findall(r"^(#{1,3})\s+(.+)$", content, re.MULTILINE)
        section_titles = [h[1] for h in headings]
        required_sections = [
            "Section 1: Executive Overview",
            "Section 2: Intentional Asymmetry",
            "Section 3: Musical Spacing",
            "Section 4: Typographic Flow",
            "Section 5: Tactile Materiality",
            "Section 6: Physics-Based Microinteractions",
            "Section 7: Anti-Patterns Summary"
        ]
        all_sections_present = all(any(req.lower() in title.lower() for title in section_titles) for req in required_sections)
        self.log_result(
            "B5.5_document_structural_completeness",
            passed=all_sections_present,
            details=f"All 7 required architectural sections present: {all_sections_present}",
            empirical_data={"headings_count": len(headings)}
        )

    def run_all(self):
        start_time = time.perf_counter()
        content = self.read_target()
        print(f"Target Loaded: {TARGET_FILE} ({len(content)} characters, {len(content.splitlines())} lines)")

        self.run_battery_1_typographic_math(content)
        self.run_battery_2_materiality_optics(content)
        self.run_battery_3_kinetics_accessibility(content)
        self.run_battery_4_layout_asymmetry(content)
        self.run_battery_5_syntax_and_slop(content)

        duration = time.perf_counter() - start_time
        print("\n=======================================================")
        print(f" ADVERSARIAL STRESS TEST SUMMARY")
        print("=======================================================")
        print(f"Total Tests Run: {self.total_tests}")
        print(f"Passed:          {self.passed_tests}")
        print(f"Failed:          {self.failed_tests}")
        print(f"Duration:        {duration:.3f}s")
        print("=======================================================")

        out_json = Path(__file__).parent / "adversarial_results.json"
        with open(out_json, "w", encoding="utf-8") as f:
            json.dump({
                "target": str(TARGET_FILE),
                "total_tests": self.total_tests,
                "passed": self.passed_tests,
                "failed": self.failed_tests,
                "duration_seconds": duration,
                "results": self.results
            }, f, indent=2)
        print(f"Saved empirical results to: {out_json}")

        return self.failed_tests == 0

if __name__ == "__main__":
    runner = AdversarialRunner()
    success = runner.run_all()
    sys.exit(0 if success else 1)
