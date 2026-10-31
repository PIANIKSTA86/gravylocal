# Test Infrastructure Document: `human-interface-design` E2E Test Suite

**Document Version**: 1.0.0  
**Date**: 2026-10-29  
**Author**: E2E Test Suite Architect (`e2e_test_writer`)  
**Target Skill Directory**: `C:\Users\JULIAN\.gemini\config\skills\human-interface-design\`  
**Test Suite Directory**: `c:\Users\JULIAN\Desktop\GravyLocalTABS\.agents\teamwork\e2e_tests\`  
**Parent Orchestrator**: `9eac7787-339d-48f5-a69c-a3a11783d614`  

---

## 1. Executive Summary & Philosophy

The `human-interface-design` skill in Antigravity eliminates synthetic, AI-generated design and copywriting clichés ("AI slop") by injecting production-grade human design principles, emotional color psychology, authentic conversational copywriting, comparative before-and-after cases, and an objective evaluation rubric into agent runtime contexts.

This document specifies the architecture, execution model, coverage matrix, and verification mechanisms for the **opaque-box, requirement-driven E2E test suite**. The test suite treats the skill files and executable scripts as a black box, verifying adherence to platform contracts, syntactic rules, color science, typographic constraints, copywriting blacklists, and realistic application workflows without depending on internal implementation details.

### Core Testing Principles
1. **Opaque-Box Requirement Verification**: Tests evaluate the target skill purely against specifications codified in `ORIGINAL_REQUEST.md`, `PROJECT.md`, and survey mining specifications.
2. **Deterministic Authoritative Oracles**: Expected outputs are derived from mathematical formulas (WCAG 2.2 relative luminance, APCA contrast, fluid typography bounds, spring physics curves), explicit dictionaries (40+ LLM slop blacklist), and formal platform contracts (Antigravity YAML frontmatter and file structure).
3. **Zero External Dependencies**: Pure Python 3 standard library (`unittest`, `re`, `subprocess`, `pathlib`, `argparse`, `json`, `math`). No third-party packages required, guaranteeing cross-platform portability on Windows, macOS, and Linux.
4. **4-Tier Progressive Verification**:
   - **Tier 1 (Feature Coverage)**: Isolated functional verification for all 24 features (≥5 assertions each = 120+ assertions).
   - **Tier 2 (Boundary & Corner Cases)**: Extreme conditions, edge values, missing fields, unicode, and malformed inputs (≥5 assertions each = 120+ assertions).
   - **Tier 3 (Cross-Feature Combinations)**: Pairwise interactions (e.g. bilingual copy in bento cards, dark mode contrast on multi-layer shadows, CLI audit on case studies).
   - **Tier 4 (Real-World Application Scenarios)**: ≥12 realistic end-to-end design and copy auditing scenarios (B2B SaaS, FinTech, Telemedicine, Creative Studio, etc.).

---

## 2. Test Architecture & Modular Layout

```
.agents/teamwork/e2e_tests/
├── run_tests.py                    # Master CLI Test Runner & Result Aggregator
├── test_utils.py                   # Shared utilities, YAML parsers, WCAG contrast engine, fixtures
├── test_tier1_features.py          # Tier 1: 24 Features x ≥5 Assertions (120+ tests)
├── test_tier2_boundaries.py        # Tier 2: 24 Features x ≥5 Boundary Assertions (120+ tests)
├── test_tier3_combinations.py      # Tier 3: Pairwise Cross-Feature Tests (15 tests)
└── test_tier4_scenarios.py         # Tier 4: Real-World Application Scenarios (14 scenarios)
```

### Module Responsibilities

1. **`run_tests.py`**:
   - Discovers and executes tests across all tiers or filtered by tier/feature.
   - Provides structured CLI arguments: `--target-dir`, `--tier {1,2,3,4,all}`, `--feature N`, `--verbose`, `--json`.
   - Returns exit code `0` when all tests pass, and `1` on any failure.
   - Outputs formatted summary tables with tier breakdown, assertion counts, execution duration, and failure diagnostics.

2. **`test_utils.py`**:
   - Standard-library YAML frontmatter extractor and validator.
   - Markdown structure and link graph extractor.
   - WCAG 2.2 relative luminance and contrast ratio calculator.
   - Text cadence analyzer (sentence length variance, triad parallelism detector).
   - Subprocess execution wrapper for `scripts/audit_copy.py`.

3. **`test_tier1_features.py`**:
   - Validates existence, structure, and isolated content for Features 1 through 24.
   - Enforces minimum 5 assertions per feature.

4. **`test_tier2_boundaries.py`**:
   - Validates error handling, extreme viewport clamp bounds, unicode and special character safety, empty files, malformed YAML, negative/zero spacing, and extreme contrast conditions.
   - Enforces minimum 5 assertions per feature.

5. **`test_tier3_combinations.py`**:
   - Pairwise cross-feature validation: checks multi-layer shadows in dark mode palettes, bilingual copy inside bento grids, CLI audit execution against before/after markdown examples, etc.

6. **`test_tier4_scenarios.py`**:
   - End-to-end real-world scenarios: SaaS hero refactoring, FinTech card audit, Telehealth form error states, Creative studio dark mode, accessibility under reduced motion, etc.

---

## 3. 24-Feature Coverage Matrix

| # | Feature | Category | Target File | Tier 1 Assertions | Tier 2 Assertions | Tier 3 Link | Tier 4 Scenario |
|---|---------|----------|-------------|-------------------|-------------------|-------------|-----------------|
| 1 | YAML Frontmatter Specification | Skill Platform | `SKILL.md` | 5 | 5 | T3.4 (Link Graph) | T4.7 (Skill Linter) |
| 2 | Progressive Disclosure Architecture | Skill Platform | `SKILL.md` & `references/` | 5 | 5 | T3.4, T3.15 | T4.12 (Onboarding Flow) |
| 3 | Anti-AI Design Manifesto & Heuristics | Skill Platform | `SKILL.md` | 5 | 5 | T3.15 | T4.1 (SaaS Hero Audit) |
| 4 | Intentional Asymmetry & Bento Layouts | Organic UI | `references/organic-ui.md` | 5 | 5 | T3.1, T3.5 | T4.2 (FinTech Bento) |
| 5 | Musical Spacing & Rhythm Cadence | Organic UI | `references/organic-ui.md` | 5 | 5 | T3.13 | T4.6 (EdTech Pathways) |
| 6 | Typographic Flow & Optical Tuning | Organic UI | `references/organic-ui.md` | 5 | 5 | T3.5 | T4.1 (SaaS Hero Audit) |
| 7 | Tactile Materiality & Multi-Layer Lighting | Organic UI | `references/organic-ui.md` | 5 | 5 | T3.2 | T4.4 (Creative Dark Mode) |
| 8 | Physics-Based Microinteractions | Organic UI | `references/organic-ui.md` | 5 | 5 | T3.8, T3.14 | T4.11 (Reduced Motion) |
| 9 | Semantic OKLCH / HSL Palettes | Color Psychology | `references/color-psychology.md` | 5 | 5 | T3.2 | T4.10 (WCAG Audit) |
| 10 | Emotional 60-30-10 Palette Architecture | Color Psychology | `references/color-psychology.md` | 5 | 5 | T3.6 | T4.4 (Creative Dark Mode) |
| 11 | AI Color Cliché Banishment | Color Psychology | `references/color-psychology.md` | 5 | 5 | T3.2 | T4.1 (SaaS Hero Audit) |
| 12 | Functional Contrast & Dark Mode Parity | Color Psychology | `references/color-psychology.md` | 5 | 5 | T3.2 | T4.10 (WCAG Audit) |
| 13 | The LLM Slop Blacklist | Conversational Copy | `references/conversational-copy.md` | 5 | 5 | T3.3, T3.11 | T4.7, T4.8 (CLI Scans) |
| 14 | Cliché Search-and-Replace Dictionary | Conversational Copy | `references/conversational-copy.md` | 5 | 5 | T3.3 | T4.1 (SaaS Refactor) |
| 15 | Staccato & Legato Cadence Tuning | Conversational Copy | `references/conversational-copy.md` | 5 | 5 | T3.1 | T4.1 (SaaS Hero Audit) |
| 16 | Value-First CTA Engineering | Conversational Copy | `references/conversational-copy.md` | 5 | 5 | T3.6, T3.7 | T4.5 (E-commerce CTA) |
| 17 | Empathetic Microcopy & Error Recovery | Conversational Copy | `references/conversational-copy.md` | 5 | 5 | T3.6, T3.12 | T4.3 (Medical Intake) |
| 18 | Bilingual Cliché Adaptation (EN & ES) | Conversational Copy | `references/conversational-copy.md` | 5 | 5 | T3.1, T3.12 | T4.9 (Spanish Copy Audit)|
| 19 | Case Study 1: B2B SaaS Hero Section | Comparative Cases | `examples/before-after-cases.md` | 5 | 5 | T3.3, T3.7 | T4.1 (SaaS Refactor) |
| 20 | Case Study 2: E-Commerce / Dashboard Card| Comparative Cases | `examples/before-after-cases.md` | 5 | 5 | T3.3, T3.8 | T4.2 (FinTech Bento) |
| 21 | Case Study 3: Multi-Step Form & Error State| Comparative Cases | `examples/before-after-cases.md` | 5 | 5 | T3.3, T3.6 | T4.3 (Medical Intake) |
| 22 | 30-Point Objective Scoring Matrix | Audit Rubric | `references/audit-rubric.md` | 5 | 5 | T3.10 | T4.13 (CRM Audit) |
| 23 | 10-Point Boolean Quick-Triage Checklist | Audit Rubric | `references/audit-rubric.md` | 5 | 5 | T3.9 | T4.14 (PR Review Triage) |
| 24 | Automated Copy Audit Script (`audit_copy.py`)| Tooling Extension | `scripts/audit_copy.py` | 5 | 5 | T3.3, T3.11 | T4.7, T4.8, T4.9 |
| **Total** | | | | **120** | **120** | **15** | **14** |

**Grand Total Assertion Count**: **269 Assertions** across 4 Tiers.

---

## 4. Detailed Tier Specifications

### Tier 1: Feature Coverage (≥120 Assertions)
Verifies isolated existence, syntax, and completeness of each feature:
- Frontmatter delimiter, `name`, `description`, folded scalar `>-`, routing keywords.
- Markdown links to all references and examples.
- Manifesto headers, 4 pillars, top-10 instant heuristics with numbering.
- Bento grid CSS template definitions, 60/40 splits, visual anchor rules.
- Macro spacing (64-128px) vs micro spacing (4-16px).
- Fluid typography `clamp()` expressions, optical line-heights, `text-wrap`.
- Dual-layer shadow stacking (`ambient` + `directional`), 120° light source, specular highlight.
- Non-linear spring bezier curves (`cubic-bezier(0.16, 1, 0.3, 1)`), click depression (`scale(0.97)`).
- Semantic color variables (`--bg-app`, `--bg-surface`, `--primary`), tinted neutrals.
- 60-30-10 distribution rules.
- AI color clichés banishment (indigo/violet gradients, cyan glows, pitch black).
- WCAG AA (4.5:1) and AAA (7:1) contrast definitions, elevated dark surfaces.
- 30+ banned AI buzzwords in blacklist catalog.
- Search-and-replace dictionary with 15+ conversion pairs.
- Staccato (<8 words) and Legato (12-18 words) cadence definitions.
- Value-first CTA formula (Action Verb + Tangible Benefit + Friction Reducer).
- Empathetic error formula (What happened + Why + 1-click recovery).
- Spanish AI clichés catalog, translation calques, "tú" vs "usted".
- Complete Before/After code for Case 1 (SaaS Hero), Case 2 (Dashboard Card), Case 3 (Multi-Step Form).
- 30-Point scoring matrix with 6 dimensions (0-5 pts) and 4 quality tiers.
- 10-Point boolean quick-triage checklist with binary pass/fail questions.
- `scripts/audit_copy.py` script presence, argument parsing (`--threshold`, `--lang`), and humanization score formula.

### Tier 2: Boundary & Corner Cases (≥120 Assertions)
Stress tests extreme inputs, malformed structures, and edge environments:
- Missing YAML frontmatter, invalid YAML indentation, malformed delimiters.
- Missing files, broken anchor links, cyclic markdown references.
- Empty heuristic descriptions, missing trigger conditions.
- Extreme screen widths: 320px ultra-narrow mobile collapse, 3440px ultra-wide measure limits (`max-w-prose` / 68ch).
- Extreme spacing: 0px or negative margins, double nested padding degradation.
- Fluid typography clamp bound ordering (`min` must be strictly `< max`), extreme zoom.
- Pure black OLED screens (`#000000`), invisible shadows in dark mode, forced colors mode.
- Accessibility: `@media (prefers-reduced-motion: reduce)` mandatory override, touch hover removal.
- Color hex parsing, neutral undertone saturation bounds (2% - 10%), monotonic lightness steps.
- Mathematical ratio integrity: 60 + 30 + 10 = 100%, secondary accent containment.
- Brand purple override edge cases, dark mode halation threshold.
- Contrast calculations on all provided palette color pairs (verifying > 4.5:1 for body, > 3.0:1 for large text).
- Blacklist scanner case-insensitivity, word boundaries, empty inputs, punctuation boundaries (`"empower!"`, `**delve**`).
- Dictionary replacement purity: ensuring no replacement text contains any banned buzzwords.
- Sentence length standard deviation calculation, symmetrical triad detection.
- CTA character length limits, touch target sizing (min 44x44px).
- Error recovery actionability: ensuring error messages contain actionable links/buttons.
- Spanish unicode character handling (á, é, í, ó, ú, ñ, ¿, ¡), text expansion allowance (20-35%).
- HTML/CSS syntax validity in case studies, responsive classes presence.
- Dashboard card overflow, tabular nums for financial data.
- Form accessibility: `<label for="...">`, `<input id="...">`, `aria-describedby`, keyboard navigation.
- Rubric scoring bounds: 0 to 30, mutually exclusive tiers, penalty deduction reproducibility.
- Quick-triage determinism: absence of subjective criteria, 100% remediation pointer coverage.
- CLI script non-existent file handling, non-UTF8 binary handling, JSON output format.

### Tier 3: Cross-Feature Combinations (15 Assertions)
Pairwise interactions across design, copy, and tooling:
1. **Bilingual Copy in Bento Grid**: Spanish expanded text layout in asymmetric 60/40 cards without overflow.
2. **Multi-Layer Shadows in Dark Mode**: Elevated surface contrast with warm specular highlights and ambient occlusion.
3. **Audit Script on Comparative Cases**: Running `audit_copy.py` directly against the Before vs After cases in `examples/before-after-cases.md`, proving Before fails and After passes.
4. **Markdown Link Graph Validity**: Validating that all internal relative markdown links across the entire skill resolve to valid files and existing heading anchors.
5. **Fluid Typography in Bento Layouts**: Evaluating `clamp()` headlines within responsive asymmetric grid containers.
6. **Emotional 60-30-10 Palette with Empathetic Form**: Verifying error states respect the 10% focal accent without exceeding saturation.
7. **Value-First CTA in SaaS Hero**: Verifying the CTA formula inside the production case study markup.
8. **Spring Physics Microinteractions on Bento Cards**: Verifying active depression `scale(0.98)` and spring curves on dashboard widgets.
9. **10-Point Quick Triage on Case Studies**: Running the 10-point diagnostic against the "Before" cases (must fail) and "After" cases (must pass).
10. **30-Point Scoring Matrix on Case Studies**: Scoring the Before cases (<14 pts, "AI Slop") vs After cases (≥26 pts, "Mastercrafted").
11. **Dogfooding Slop Blacklist on Skill Markdown**: Scanning all files in `references/` with the blacklist to verify zero AI slop in the skill itself.
12. **Bilingual Error Recovery**: Spanish error microcopy providing clear 1-click recovery actions with natural phrasing.
13. **High-Density Data Table with Warm Neutrals**: Verifying tabular-nums, stone borders, and alternating row tints in dashboard views.
14. **Reduced Motion Query on Tactile Buttons**: Verifying spring physics degrade to opacity/color transitions when reduced motion is requested.
15. **Top-10 Heuristics Traceability**: Verifying that each heuristic in `SKILL.md` maps directly to an in-depth chapter in `references/`.

### Tier 4: Real-World Application Scenarios (14 Scenarios)
Realistic production workflows executed by agents and developers:
1. **Scenario 1: B2B SaaS Hero Audit & Refactor**: Audits a typical synthetic hero section, flags AI clichés, and refactors to an asymmetric, value-driven design.
2. **Scenario 2: FinTech Cash Flow Dashboard Card**: Audits a generic 3-card crypto/fintech widget, transforming it into an asymmetric bento widget with tabular numerals and warm neutrals.
3. **Scenario 3: Anxious Patient Telehealth Intake Form**: Audits clinical hospital intake copy, eliminating cold jargon in favor of empathetic microcopy and inline validation recovery.
4. **Scenario 4: Creative Studio Dark Mode App**: Audits an OLED pitch-black interface, applying Warm Obsidian surfaces, analog amber accents, and halation prevention.
5. **Scenario 5: E-Commerce Checkout Error Recovery**: Audits coupon code validation failure, transforming generic "Invalid code" into a clear explanation with one-click alternatives.
6. **Scenario 6: EdTech Learning Pathway Navigation**: Audits a uniform 3x3 course grid, refactoring into an asymmetric guided journey with dynamic spacing rhythm.
7. **Scenario 7: CLI Audit on Synthetic Code Fixture**: Runs `scripts/audit_copy.py` against a fixture with heavy AI slop; verifies non-zero exit code and detailed line report.
8. **Scenario 8: CLI Audit on Humanized Code Fixture**: Runs `scripts/audit_copy.py` against clean production code; verifies exit code 0 and high score (>90).
9. **Scenario 9: CLI Spanish Copy Audit (`--lang es`)**: Scans Spanish application copy for calques ("empoderar tu flujo") and verifies detection.
10. **Scenario 10: Automated WCAG Contrast Audit**: Evaluates all 4 domain color palettes against WCAG 2.2 AA (4.5:1) and AAA (7:1) mathematical standards.
11. **Scenario 11: Motion Sensitivity & Vestibular Accessibility**: Evaluates CSS animations under `prefers-reduced-motion: reduce` to ensure zero vestibular discomfort.
12. **Scenario 12: Multi-Step Onboarding Wizard**: Evaluates cognitive pacing, progressive disclosure, and auto-save state recovery.
13. **Scenario 13: Enterprise CRM Audit via 30-Point Matrix**: Audits an enterprise CRM pipeline view using the full 6-dimension scoring matrix.
14. **Scenario 14: Pull Request Sanity Check via 10-Point Checklist**: Simulates a 2-minute CI/CD PR review using the boolean triage checklist.

---

## 5. Authoritative Expected Output Derivation

All expected values in this test suite are derived from explicit authoritative sources:

1. **Platform & Syntax Contracts**:
   - YAML Frontmatter RFC 8259 & YAML 1.2: Delimiters `---`, key-value formatting, folded block scalars `>-`.
   - Antigravity Skill Ecosystem: Skills registered in `~/.gemini/config/skills/<name>/` via `SKILL.md` frontmatter `name` and `description` with `"Use when..."` router trigger clause.
2. **Mathematical Color Science**:
   - WCAG 2.2 § 1.4.3 & 1.4.6: Contrast Ratio = `(L1 + 0.05) / (L2 + 0.05)`, where `L = 0.2126 * R + 0.7152 * G + 0.0722 * B` (sRGB gamma expanded).
   - 60-30-10 Rule: `Sum(backdrops) ~ 0.60`, `Sum(surfaces/typography) ~ 0.30`, `Sum(accents) <= 0.10`.
3. **CSS Specifications**:
   - CSS Values and Units Module Level 4: `clamp(MIN, VAL, MAX)` where `MIN <= MAX`.
   - CSS Easing Functions Level 1: `cubic-bezier(x1, y1, x2, y2)` where `0 <= x1, x2 <= 1`.
   - CSS Media Queries Level 5: `@media (prefers-reduced-motion: reduce)`.
4. **Linguistic & Lexical Blacklists**:
   - The 40+ LLM slop dictionary codified in `survey_explorer_copy_color/analysis.md` Section 2.1.
   - Spanish calque mappings codified in `PROJECT.md` Feature 18.
5. **Tooling CLI Contracts**:
   - `scripts/audit_copy.py <path> [--threshold N] [--lang en|es|all] [--json]`
   - Exit code: 0 if score >= threshold, 1 if score < threshold or critical slop detected.

---

## 6. Test Runner CLI & Execution

### Command-Line Interface

The test suite is executed via pure Python 3:

```powershell
python c:\Users\JULIAN\Desktop\GravyLocalTABS\.agents\teamwork\e2e_tests\run_tests.py [OPTIONS]
```

### Supported CLI Flags

| Flag | Argument | Default | Description |
|---|---|---|---|
| `--target-dir` | `<path>` | `C:\Users\JULIAN\.gemini\config\skills\human-interface-design\` | Directory of the target skill to test |
| `--tier` | `1`, `2`, `3`, `4`, `all` | `all` | Filter execution to a specific test tier |
| `--feature` | `1` .. `24` | `None` | Filter Tier 1 & 2 execution to a specific feature ID |
| `--verbose`, `-v` | Flag | `False` | Show individual test assertion names and timings |
| `--json` | Flag | `False` | Output results in structured JSON format |
| `--fail-fast`, `-x` | Flag | `False` | Stop test execution on the first assertion failure |

### Exit Code Protocol
- **`0`**: All tests passed successfully.
- **`1`**: One or more test assertions failed, or target directory/files are missing.

---

## 7. Verification Method

To independently verify the test infrastructure and run the suite:

1. **Verify Python Environment**:
   ```powershell
   python --version
   ```
   *(Requires Python 3.8+; uses only standard library).*

2. **Run Full Test Suite**:
   ```powershell
   python c:\Users\JULIAN\Desktop\GravyLocalTABS\.agents\teamwork\e2e_tests\run_tests.py
   ```

3. **Run Tier 1 Only**:
   ```powershell
   python c:\Users\JULIAN\Desktop\GravyLocalTABS\.agents\teamwork\e2e_tests\run_tests.py --tier 1
   ```

4. **Run Specific Feature (e.g. Feature 1 Frontmatter)**:
   ```powershell
   python c:\Users\JULIAN\Desktop\GravyLocalTABS\.agents\teamwork\e2e_tests\run_tests.py --tier 1 --feature 1 -v
   ```

5. **Generate JSON Report**:
   ```powershell
   python c:\Users\JULIAN\Desktop\GravyLocalTABS\.agents\teamwork\e2e_tests\run_tests.py --json
   ```
