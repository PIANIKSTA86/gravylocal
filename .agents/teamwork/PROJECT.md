# Project: human-interface-design Antigravity Skill

## Architecture

The `human-interface-design` skill extends the Antigravity agent runtime by injecting expert, production-grade heuristics, design tokens, copy frameworks, and audit rubrics to eliminate unmistakable AI-generated patterns ("AI slop") from interfaces and application copy.

The skill follows the canonical Antigravity modular architecture with progressive disclosure:
- **Root Entrypoint (`SKILL.md`)**: Contains YAML frontmatter (`name: human-interface-design`, description with explicit routing keywords), the Anti-AI Design Manifesto, the 4 Core Pillars, the Top-10 Instant Triage Heuristics, and index pointers to deep references.
- **Reference Deep Dives (`references/`)**:
  - `organic-ui.md`: Intentional asymmetry, bento grids, macro/micro rhythm, tactile depth (shadow stacking, physical lighting), natural typography (`clamp()`, `text-wrap: balance`), and spring physics microinteractions.
  - `color-psychology.md`: Emotional palettes, OKLCH/HSL semantic tokens, 60-30-10 rule with soul, elimination of AI cyan/purple glow clichés, WCAG AAA/AA functional contrast, and dark mode halation parity.
  - `conversational-copy.md`: 40+ LLM slop blacklist with search-and-replace dictionary, staccato/legato cadence, value-first CTAs, empathetic microcopy (error states, empty states), and bilingual (EN/ES) support.
  - `audit-rubric.md`: 30-point objective scoring rubric (6 dimensions x 5 pts), quality scoring tiers (0-30), and 10-point boolean quick triage checklist.
- **Production Reference Examples (`examples/`)**:
  - `before-after-cases.md`: 3 practical side-by-side comparative cases (B2B SaaS Hero Section, E-commerce/Dashboard Bento Card, Multi-Step Form with Error Recovery) illustrating visual composition, color tokens, and microcopy.
- **Tooling Extension (`scripts/`)**:
  - `audit_copy.py`: Standalone CLI utility scanning code/text files for banned AI buzzwords, calculating an objective humanization score (0-100), and reporting actionable fixes.

---

## Feature Inventory

Every discovered feature from the Survey phase is enumerated here and assigned to a milestone.

| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | YAML Frontmatter Specification | Strict metadata block specifying skill identifier and routing trigger rules | M1 | survey_spec_miner |
| 2 | Progressive Disclosure Architecture | Modular decomposition into SKILL.md, references/, examples/, and scripts/ | M1 | survey_spec_miner |
| 3 | Anti-AI Design Manifesto & Heuristics | Core philosophical principles and top-10 instant heuristics in SKILL.md | M1 | survey_spec_miner |
| 4 | Intentional Asymmetry & Bento Layouts | Breaking rigid 3-column grids via 60/40 splits, visual anchors, and bento cards | M2 | survey_spec_miner & survey_explorer_ui |
| 5 | Musical Spacing & Rhythm Cadence | Macro-rhythm (64-128px) vs micro-proximity (4-16px) dynamic spacing scale | M2 | survey_spec_miner & survey_explorer_ui |
| 6 | Typographic Flow & Optical Tuning | Fluid typography `clamp()`, tight line-heights, `text-wrap: balance/pretty` | M2 | survey_spec_miner & survey_explorer_ui |
| 7 | Tactile Materiality & Multi-Layer Lighting | Dual-layer shadows (ambient + directional) and subtle specular bevel highlights | M2 | survey_spec_miner & survey_explorer_ui |
| 8 | Physics-Based Microinteractions | Non-linear easing `cubic-bezier(0.16, 1, 0.3, 1)`, tactile compression `scale(0.97)` | M2 | survey_spec_miner & survey_explorer_ui |
| 9 | Semantic OKLCH / HSL Palettes | Tinted neutrals with warm undertones (stone, warm zinc, slate) | M3 | survey_spec_miner & survey_explorer_copy_color |
| 10 | Emotional 60-30-10 Palette Architecture | 60% canvas backdrop, 30% structural surfaces, 10% emotional intentional accent | M3 | survey_spec_miner & survey_explorer_copy_color |
| 11 | AI Color Cliché Banishment | Blacklisting generic indigo/cyan gradients and neon dark mode halos | M3 | survey_spec_miner & survey_explorer_copy_color |
| 12 | Functional Contrast & Dark Mode Parity | WCAG AAA/AA compliance, halation prevention, and elevated dark surfaces | M3 | survey_spec_miner & survey_explorer_copy_color |
| 13 | The LLM Slop Blacklist | 40+ banned AI buzzwords ("empower", "unlock", "seamless", "delve", etc.) | M3 | survey_spec_miner & survey_explorer_copy_color |
| 14 | Cliché Search-and-Replace Dictionary | Explicit mapping table converting generic AI phrases to concrete human alternatives | M3 | survey_spec_miner & survey_explorer_copy_color |
| 15 | Staccato & Legato Cadence Tuning | Balancing punchy short sentences with flowing descriptive phrases | M3 | survey_spec_miner & survey_explorer_copy_color |
| 16 | Value-First CTA Engineering | Action verb + tangible benefit + friction reducer formula | M3 | survey_spec_miner & survey_explorer_copy_color |
| 17 | Empathetic Microcopy & Error Recovery | Friendly error states, empty states, and onboarding hints with 1-click recovery | M3 | survey_spec_miner & survey_explorer_copy_color |
| 18 | Bilingual Cliché Adaptation (EN & ES) | Dual-language cliché catalogs covering typical Spanish and English AI translation artifacts | M3 | survey_spec_miner & survey_explorer_copy_color |
| 19 | Case Study 1: B2B SaaS Hero Section | Complete before-and-after breakdown (HTML/CSS + copy + visual anatomy) | M4 | survey_spec_miner & survey_explorer_ui |
| 20 | Case Study 2: E-Commerce / Dashboard Card | Symmetrical card vs asymmetrical bento widget with state handling | M4 | survey_spec_miner & survey_explorer_ui |
| 21 | Case Study 3: Multi-Step Form & Error State | Sterile form vs conversational humanized form with inline recovery | M4 | survey_spec_miner & survey_explorer_copy_color |
| 22 | 30-Point Objective Scoring Matrix | 6 evaluation dimensions (0-5 pts) with observable criteria for auditing interfaces | M4 | survey_spec_miner & survey_explorer_copy_color |
| 23 | 10-Point Boolean Quick-Triage Checklist | Binary yes/no diagnostic questions for rapid 2-minute triage of AI slop | M4 | survey_spec_miner & survey_explorer_copy_color |
| 24 | Automated Copy Audit Script (`audit_copy.py`) | Python CLI utility scanning project files for banned AI words and scoring | M1 | survey_spec_miner |

---

## Milestones

| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Skill Platform & Core Manifesto | `SKILL.md` (frontmatter, manifesto, top-10 heuristics, reference index) & `scripts/audit_copy.py` | None | DONE |
| M2 | Organic UI & Visual Design System | `references/organic-ui.md` (asymmetry, rhythm, typography, shadow stacking, spring physics) | M1 | DONE |
| M3 | Color Psychology & Conversational Copy | `references/color-psychology.md` & `references/conversational-copy.md` (palettes, contrast, blacklist, dictionary, bilingual EN/ES) | M1 | DONE |
| M4 | Comparative Cases & Objective Audit Rubric | `examples/before-after-cases.md` & `references/audit-rubric.md` (3 full production cases, 30-point rubric, 10-point triage) | M2, M3 | DONE |
| M5 | Final E2E Test Suite Pass & Adversarial Hardening | Pass 100% of E2E test suite (Tiers 1-4) published by E2E Testing Track, followed by Tier 5 adversarial stress testing | M1, M2, M3, M4, TEST_READY.md | DONE |

---

## Interface Contracts

### Skill Directory Structure
The target location for the skill is:
`C:\Users\JULIAN\.gemini\config\skills\human-interface-design\`

Expected structure:
```text
C:\Users\JULIAN\.gemini\config\skills\human-interface-design\
├── SKILL.md
├── references/
│   ├── organic-ui.md
│   ├── color-psychology.md
│   ├── conversational-copy.md
│   └── audit-rubric.md
├── examples/
│   └── before-after-cases.md
└── scripts/
    └── audit_copy.py
```

### Frontmatter Contract (`SKILL.md`)
```yaml
---
name: human-interface-design
description: >-
  Expert guidance, heuristics, and production standards for humanizing user interfaces, visual design, and application copy by eliminating unmistakable AI-generated patterns and clichés.
  Use when designing, building, or refactoring web interfaces, landing pages, dashboards, design systems, UI components, or writing microcopy, headings, CTA buttons, and marketing text;
  when auditing existing designs for AI rigidity, unnatural symmetry, monotonous spacing, or sterile palettes; or when applying organic visual rhythm, emotional color psychology, and authentic conversational UX copy.
---
```

### CLI Tooling Contract (`scripts/audit_copy.py`)
- Executable via `python audit_copy.py <path_or_file> [--threshold N] [--lang en|es|all]`
- Outputs: matched line numbers, banned words, contextual snippet, suggested replacement, and a composite humanization score (0-100).
- Exit code: 0 if score >= threshold, 1 if critical slop detected above threshold.

---

## Code Layout

The project writes strictly to the target skill directory and agent metadata folders:
- Target skill files: `C:\Users\JULIAN\.gemini\config\skills\human-interface-design\`
- Orchestrator metadata: `c:\Users\JULIAN\Desktop\GravyLocalTABS\.agents\teamwork\`
- E2E Test suite: `c:\Users\JULIAN\Desktop\GravyLocalTABS\.agents\teamwork\e2e_tests\`
