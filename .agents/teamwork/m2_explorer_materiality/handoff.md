# Handoff Report: Materiality, Depth & Physics Specifications (Features 7 & 8)

**Target Skill**: `C:\Users\JULIAN\.gemini\config\skills\human-interface-design\`  
**Investigating Agent**: Materiality, Depth & Physics Specialist (`m2_explorer_materiality`)  
**Parent Orchestrator**: `9eac7787-339d-48f5-a69c-a3a11783d614`  
**Milestone**: Milestone 2 (Organic UI & Visual Design System)  
**Date**: 2026-10-29T17:25:30Z  

---

## 1. Observation

Direct examination of project planning, survey reports, test suites, and target configurations revealed the following empirical evidence:

1. **Project Scope & Feature Directives (`PROJECT.md`)**:
   - Line 33: *"Feature 7: Tactile Materiality & Multi-Layer Lighting — Dual-layer shadows (ambient + directional) and subtle specular bevel highlights"* assigned to Milestone 2.
   - Line 34: *"Feature 8: Physics-Based Microinteractions — Non-linear easing `cubic-bezier(0.16, 1, 0.3, 1)`, tactile compression `scale(0.97)`"* assigned to Milestone 2.
   - Target reference file: `references/organic-ui.md`.

2. **Survey Foundation (`survey_explorer_ui/handoff.md`)**:
   - Lines 95–102 (Dimension 3: Tactile Depth & Lighting): Outlines the flat dirty drop shadow antipattern, single light source logic (120° / top-left), and tactile elevation scale (Levels -1 to 4).
   - Lines 111–118 (Dimension 5: Motion & Microinteractions): Outlines robotic linear tweens (`all 0.3s ease`), lack of tactile press states, and introduces `scale(0.97)` active depression and spring deceleration curves.
   - Lines 147–185: Catalog of baseline CSS custom properties (`--shadow-elevation-low`, `--shadow-elevation-mid`, `--shadow-elevation-high`, `--shadow-inset-well`, `--ease-spring-out`, `--ease-tactile-press`, `--duration-snappy`).

3. **Tier 1 Feature Coverage Test Assertions (`test_tier1_features.py`)**:
   - Lines 292–326 (Feature 7):
     - `test_f07_dirty_drop_shadow_antipattern`: Verifies `organic-ui.md` documents the antipattern (matches `drop shadow`, `flat dirty`, or `harsh shadow`).
     - `test_f07_multi_layer_shadow_stacking_rules`: Verifies `box-shadow:` contains comma-separated multi-layer definitions.
     - `test_f07_single_light_source_angle`: Verifies requirement for a coherent virtual key light source (matches `light source`, `top-left`, or `120`).
     - `test_f07_specular_bevel_highlight_token`: Verifies subtle top bevel highlight (matches `inset` and `1px`).
     - `test_f07_contextual_floating_glassmorphism`: Verifies glassmorphism is restricted to floating contextual overlays (matches `glassmorphism` or `backdrop-blur`).
   - Lines 330–364 (Feature 8):
     - `test_f08_mechanical_linear_easing_antipattern`: Verifies antipattern documentation (matches `linear`, `0.3s ease`, or `mechanical`).
     - `test_f08_spring_curve_cubic_bezier_definition`: Verifies standard spring cubic-bezier curve (`cubic-bezier(`).
     - `test_f08_tactile_click_depression_scale`: Verifies active tactile depression token matching `r"scale\(\s*0\.9[78]\s*\)"`.
     - `test_f08_accessible_focus_ring_offsets`: Verifies accessible focus rings with distinct offset (matches `focus-visible`, `ring-offset`, or `outline-offset`).
     - `test_f08_microinteraction_duration_bounds`: Verifies snappy durations under 250ms (matches `\b(150ms|180ms|200ms|0\.1[5-8]s|0\.2s)\b`).

4. **Tier 2 Boundary & Corner Case Assertions (`test_tier2_boundaries.py`)**:
   - Lines 330–366 (Feature 7 Boundaries):
     - `test_f07_boundary_box_shadow_syntax_validity`: Every regex match of `box-shadow:\s*([^;]+);` in `organic-ui.md` MUST contain explicit `"px"` length units.
     - `test_f07_boundary_dark_mode_shadow_adaptation`: Verifies that shadows disappear on dark surfaces and require elevated surface lightness tints (matches `dark mode` and (`elevation`, `surface`, or `border`)).
     - `test_f07_boundary_high_contrast_mode_borders`: Verifies borders remain visible under high-contrast modes (matches `contrast`, `forced-colors`, or `border`).
     - `test_f07_boundary_glassmorphism_opacity_limits`: Surface opacity for glass overlays must be >= 0.50 (matches `rgba\([^)]+,\s*(?:0\.[5-9]|1(?:\.0)?)\)` or `bg-white/` or `bg-black/`).
     - `test_f07_boundary_specular_highlight_single_edge`: Requires specular highlight on a single physical edge (strictly matches `"inset 0 1px 0"` or `"inset 0 -1px 0"`).
   - Lines 370–412 (Feature 8 Boundaries):
     - `test_f08_boundary_reduced_motion_mandatory_override`: Requires mandatory `@media (prefers-reduced-motion)` override.
     - `test_f08_boundary_cubic_bezier_coordinates_valid`: All `cubic-bezier(x1, y1, x2, y2)` matches must have `0.0 <= x1 <= 1.0` and `0.0 <= x2 <= 1.0`.
     - `test_f08_boundary_click_depression_scale_bounds`: Every `scale(0.\d+)` in the document must be bounded within `0.94 <= val < 1.0`.
     - `test_f08_boundary_layout_thrashing_prevention`: Prioritizes GPU-accelerated compositing (matches `transform` and `opacity`).
     - `test_f08_boundary_touch_hover_state_removal`: Addresses hover state stickiness on touch devices (matches `hover` and (`touch`, `pointer`, or `@media`)).

5. **Cross-Tier & Scenario Integrations (`test_tier3_combinations.py` & `test_tier4_scenarios.py`)**:
   - `test_t3_02_dark_mode_contrast_on_multilayer_shadows`: Requires `inset` and `1px` in `organic-ui.md`.
   - `test_t3_08_spring_physics_microinteractions_on_bento_widgets`: Requires `cubic-bezier(` and `scale(`.
   - `test_t3_11_dogfooding_slop_blacklist_on_skill_markdown`: Scans markdown outside code blocks and disclaimers; strictly forbids `supercharge`, `unleash`, `synergy`, and `unparalleled`.
   - `test_t3_14_reduced_motion_wrapping_on_tactile_microinteractions`: Requires `prefers-reduced-motion`.
   - `test_scenario_11_vestibular_accessibility_reduced_motion`: Requires `@media (prefers-reduced-motion` and either `transition: none`, `opacity`, or `duration`.

---

## 2. Logic Chain

From the observations above, we establish the following causal technical logic:

1. **Root Flaw in AI Depth & Motion**:
   - Artificial models treat elevation as a single black blur (`rgba(0,0,0,0.15)`), ignoring optical ambient occlusion and environmental bounce light.
   - Artificial models lack physical intuition for mass, relying on linear tweens (`transition: all 0.3s ease`) or omitting click feedback entirely (`:active` absent).
   - Indiscriminate glassmorphism (`backdrop-blur` with low opacity `0.05` on all cards) breaks text contrast and causes illegible washed-out interfaces.

2. **Optical & Physical Grounding**:
   - Grounding depth requires a **single coherent key light at 120° (top-left)**. This produces a **1px specular top highlight** (`inset 0 1px 0 rgba(255,255,255,0.14)`) and a **3-layer shadow stack** (Layer 1: Contact AO, Layer 2: Directional body, Layer 3: Ambient bounce).
   - In dark mode, shadows against dark surfaces lose optical contrast; elevation must therefore be communicated through **monotonic surface lightness steps** (e.g., Base: 9%, Card L1: 16%, Hover L2: 20%, Overlay L3: 24%, Modal L4: 28%) and subtle borders.
   - Restricting glassmorphism strictly to **floating contextual overlays** (sticky headers, context menus) with an opacity floor (>= 0.50, e.g., `rgba(18, 20, 24, 0.82)`) preserves WCAG AA contrast while retaining modern depth.

3. **Kinetic & Mechanical Hardware Polish**:
   - Hardware switches depress under force: applying `transform: scale(0.97)` on `:active` with an instant duration (`75ms`) and collapsing the drop shadow simulates physical mechanical pushback.
   - Non-linear spring curves (`cubic-bezier(0.16, 1, 0.3, 1)`) provide immediate kinetic impulse followed by smooth natural deceleration without robotic linear motion.
   - Bounding microinteraction durations under 250ms (`75ms` instant, `180ms` snappy, `220ms` deliberate) eliminates perceptual latency.
   - Decoupling hover states via `@media (hover: hover) and (pointer: fine)` prevents sticky hover artifacts on touchscreens.
   - Mandating `@media (prefers-reduced-motion: reduce)` with `transform: none !important` and graceful opacity crossfades satisfies WCAG 2.2 SC 2.3.3.

4. **Test Suite Syntax Traps Uncovered & Resolved**:
   - *Trap 1*: `test_f07_boundary_box_shadow_syntax_validity` validates all `box-shadow:\s*([^;]+);` matches and asserts that `"px"` is present in every match. Therefore, writing `box-shadow: var(--shadow-elevation-mid);` or `box-shadow: none;` without `px` fails the test. We resolved this by explicitly including length units (`px`) in all CSS rules and token recipes.
   - *Trap 2*: `test_f08_boundary_click_depression_scale_bounds` checks every `scale(0.\d+)` and asserts `0.94 <= val < 1.0`. Any scale like `scale(0.90)` or `scale(0.50)` triggers a test failure. We calibrated all depression tokens strictly to `scale(0.97)` and `scale(0.98)`.
   - *Trap 3*: `test_f07_boundary_glassmorphism_opacity_limits` expects `rgba(...)` with alpha in `[0.5, 1.0]` or `bg-white/` / `bg-black/`. We provided explicit `rgba(18, 20, 24, 0.82)` and `rgba(255, 255, 255, 0.75)` definitions.

---

## 3. Caveats

1. **Integration Responsibility**: This exploration is strictly read-only per agent constraints. The target skill file `C:\Users\JULIAN\.gemini\config\skills\human-interface-design\references\organic-ui.md` has not been modified directly. The complete, tested specification is authored in `.agents/teamwork/m2_explorer_materiality/materiality_physics_spec.md` for the Milestone 2 worker agent to assemble alongside Features 4, 5, and 6.
2. **GPU Performance on Massive Lists**: While 3-layer box shadows are GPU-accelerated and negligible in cost on modern devices, rendering over 200 simultaneous animated cards in an unvirtualized infinite list on low-end mobile hardware can induce compositor pressure. For ultra-dense virtualized feeds, cards should collapse to a 2-layer shadow (`--shadow-elevation-low`).
3. **Cross-Feature Alignment**: Feature 7 and Feature 8 tokens depend on base surface colors that will be standardized in Milestone 3 (`color-psychology.md`). The tokens recommended here use warm chromatic defaults (`hsl(220, 16%, 9%)`, warm obsidian `#121214`) that harmonize directly with Pillar II in `SKILL.md`.

---

## 4. Conclusion

We have completed the investigation and authored a comprehensive, production-ready specification for Features 7 and 8:

1. **Feature 7 Deliverables**:
   - Physical key light doctrine (single 120° virtual light source).
   - 3-tier diffuse shadow stacking architecture (Contact AO + Directional body + Ambient chromatic bounce).
   - 1px specular bevel highlight tokens (`inset 0 1px 0 rgba(255, 255, 255, 0.14)`).
   - 6-tier elevation scale (Level -1 Inset Recessed Well through Level 4 Modal Sheet).
   - Dark mode monotonic lightness elevation steps and high-contrast accessibility rules (`@media (forced-colors: active)`).
   - The Glass Boundary Rule: Solid resting containers with glassmorphism restricted to floating overlays with >= 0.50 opacity floor (`rgba(18, 20, 24, 0.82)`).

2. **Feature 8 Deliverables**:
   - Physics-based spring curves: `--ease-spring-out: cubic-bezier(0.16, 1, 0.3, 1)`, `--ease-spring-bounce: cubic-bezier(0.34, 1.56, 0.64, 1)`, `--ease-tactile-press: cubic-bezier(0.2, 0, 0, 1)`.
   - Tactile click depression: `scale(0.97)` on `:active` with instant 75ms compression and shadow collapse.
   - Snappy microinteraction duration bounds: `75ms`, `180ms`, `220ms` (strictly <250ms).
   - Accessible focus rings: `:focus-visible` with 2px optical offset (`outline-offset: 2px`).
   - GPU-accelerated compositing rule (animating strictly `transform` and `opacity` to prevent layout thrashing).
   - Mobile pointer decoupling via `@media (hover: hover) and (pointer: fine)`.
   - Vestibular accessibility and graceful zero-motion degradation under `@media (prefers-reduced-motion: reduce)`.

All deliverables are fully documented in:
`c:\Users\JULIAN\Desktop\GravyLocalTABS\.agents\teamwork\m2_explorer_materiality\materiality_physics_spec.md`

---

## 5. Verification Method

To independently verify the technical findings and test compliance:

1. **Run In-Memory Python Verification**:
   Execute the validation script against `materiality_physics_spec.md`:
   ```powershell
   py -c "
   import re
   from pathlib import Path
   content = Path(r'c:\Users\JULIAN\Desktop\GravyLocalTABS\.agents\teamwork\m2_explorer_materiality\materiality_physics_spec.md').read_text(encoding='utf-8')
   # Feature 7 checks
   assert any(k in content.lower() for k in ['drop shadow', 'flat dirty', 'harsh shadow'])
   assert 'box-shadow:' in content and ',' in content
   assert any(k in content.lower() for k in ['light source', 'top-left', '120'])
   assert 'inset' in content and '1px' in content
   assert any(k in content.lower() for k in ['glassmorphism', 'backdrop-blur'])
   shadow_matches = re.findall(r'box-shadow:\s*([^;]+);', content)
   assert len(shadow_matches) >= 1
   for s in shadow_matches: assert 'px' in s
   assert 'dark mode' in content.lower() and any(k in content.lower() for k in ['elevation', 'surface', 'border'])
   assert any(k in content.lower() for k in ['contrast', 'forced-colors', 'border'])
   assert re.search(r'rgba\([^)]+,\s*(?:0\.[5-9]|1(?:\.0)?)\)', content) is not None
   assert 'inset 0 1px 0' in content or 'inset 0 -1px 0' in content
   # Feature 8 checks
   assert any(k in content.lower() for k in ['linear', '0.3s ease', 'mechanical'])
   assert 'cubic-bezier(' in content
   assert re.search(r'scale\(\s*0\.9[78]\s*\)', content) is not None
   assert any(k in content for k in ['focus-visible', 'ring-offset', 'outline-offset'])
   assert re.search(r'\b(150ms|180ms|200ms|0\.1[5-8]s|0\.2s)\b', content) is not None
   assert 'prefers-reduced-motion' in content
   beziers = re.findall(r'cubic-bezier\(\s*([\d.]+)\s*,\s*([\d.\-]+)\s*,\s*([\d.]+)\s*,\s*([\d.\-]+)\s*\)', content)
   for x1, y1, x2, y2 in beziers: assert 0.0 <= float(x1) <= 1.0 and 0.0 <= float(x2) <= 1.0
   scales = re.findall(r'scale\(\s*(0\.\d+)\s*\)', content)
   for s in scales: assert 0.94 <= float(s) < 1.0
   assert 'transform' in content.lower() and 'opacity' in content.lower()
   assert 'hover' in content.lower() and any(k in content.lower() for k in ['touch', 'pointer', '@media'])
   assert '@media (prefers-reduced-motion' in content and any(k in content for k in ['transition: none', 'opacity', 'duration'])
   print('ALL ASSERTIONS VERIFIED SUCCESSFULLY!')
   "
   ```

2. **Verify Zero Dogfooding Slop Violations**:
   Confirm that no ungrounded banned AI words exist in the prose:
   ```powershell
   py -c "
   import re
   from pathlib import Path
   content = Path(r'c:\Users\JULIAN\Desktop\GravyLocalTABS\.agents\teamwork\m2_explorer_materiality\materiality_physics_spec.md').read_text(encoding='utf-8')
   clean_text = re.sub(r'```[\s\S]*?```', '', content)
   lines = clean_text.splitlines()
   for line_idx, line in enumerate(lines, start=1):
       if any(k in line.lower() for k in ['banned', 'avoid', 'antipattern', 'cliché', 'slop', 'synthetic', 'instead of']): continue
       words = re.findall(r'\b[a-zA-Z]+\b', line.lower())
       for w in words:
           if w in ('supercharge', 'unleash', 'synergy', 'unparalleled'):
               raise AssertionError(f'Slop detected on line {line_idx}: {w}')
   print('DOGFOODING SLOP AUDIT PASSED: 0 VIOLATIONS')
   "
   ```

3. **Post-Integration E2E Test Execution**:
   Once the Milestone 2 worker merges the contents of `materiality_physics_spec.md` into `C:\Users\JULIAN\.gemini\config\skills\human-interface-design\references\organic-ui.md`, verify by executing:
   ```powershell
   py c:\Users\JULIAN\Desktop\GravyLocalTABS\.agents\teamwork\e2e_tests\run_tests.py --tier 1 --feature 7
   py c:\Users\JULIAN\Desktop\GravyLocalTABS\.agents\teamwork\e2e_tests\run_tests.py --tier 1 --feature 8
   py c:\Users\JULIAN\Desktop\GravyLocalTABS\.agents\teamwork\e2e_tests\run_tests.py --tier 2 --feature 7
   py c:\Users\JULIAN\Desktop\GravyLocalTABS\.agents\teamwork\e2e_tests\run_tests.py --tier 2 --feature 8
   ```
   *Expected outcome*: 100% pass across all 20 assertions for Features 7 and 8.
