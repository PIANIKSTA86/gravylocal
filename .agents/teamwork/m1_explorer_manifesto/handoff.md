# Handoff Report: Manifesto, Core Pillars, Heuristics & Operational Workflows for `human-interface-design`

**Target Skill**: `C:\Users\JULIAN\.gemini\config\skills\human-interface-design\`  
**Investigating Agent**: M1 Manifesto & Heuristics Specialist (`m1_explorer_manifesto`)  
**Parent Orchestrator**: `9eac7787-339d-48f5-a69c-a3a11783d614`  
**Date**: 2026-10-29T16:35:00Z  
**Milestone**: M1 - Skill Platform & Core Manifesto  

---

## 1. Observation

Direct inspection of project directives, survey reports, and existing reference skills yielded the following foundational facts:

1. **Original Request Directives (`ORIGINAL_REQUEST.md`)**:
   - Lines 12–14 (R1): Requires structured skill with `SKILL.md` containing frontmatter and *"instrucciones operativas completas que los agentes puedan consultar al diseñar o refactorizar interfaces y textos."*
   - Lines 15–17 (R2): Mandates organic web design guidelines that *"rompan la simetría artificial, la monotonía de espaciados y la rigidez visual típica de interfaces generadas por IA, integrando jerarquía visual natural, ritmo dinámico y microinteracciones orientadas a la experiencia humana."*
   - Lines 18–20 (R3): Directs the incorporation of color psychology (chromatic harmony, functional contrast, emotional intention) and digital marketing/copywriting (authentic conversational tone, eliminating LLM clichés and recurrent formulas).
   - Lines 27–30: Acceptance criteria require `SKILL.md` to cover human design principles, color heuristics, copywriting pautas, and an explicit catalog of AI antipatterns.

2. **Project Architecture Plan (`PROJECT.md`)**:
   - Lines 8–18: Defines `SKILL.md` as the root entrypoint containing YAML frontmatter, the Anti-AI Design Manifesto, the 4 Core Pillars, the Top-10 Instant Triage Heuristics, and index pointers to deep references in `references/`.
   - Line 29: Feature 3: *"Anti-AI Design Manifesto & Heuristics (Core philosophical principles and top-10 instant heuristics in SKILL.md)"* scheduled for Milestone 1.

3. **Survey UI Investigation (`survey_explorer_ui/handoff.md`)**:
   - Lines 34–47: Identifies the root cause of AI visual degradation: statistical mode collapse towards cookie-cutter 3-column grids (`repeat(3, 1fr)`), uniform container padding (`p-6`), uncalibrated radioactive purple/cyan glows (`#8b5cf6`/`#06b6d4`), dirty single-layer shadows (`box-shadow: 0 4px 6px rgba(0,0,0,0.15)`), and lifeless button states lacking tactile compression.
   - Lines 121–186: Supplies production-grade warm chromatic surface tokens (`hsl(220, 16%, 9%)`), multi-layer chromatic shadow stacking (`--shadow-elevation-low/mid/high`), specular bevel highlights (`inset 0 1px 0 rgba(255,255,255,0.14)`), and non-linear spring timing curves (`cubic-bezier(0.16, 1, 0.3, 1)`).

4. **Survey Copy & Color Investigation (`survey_explorer_copy_color/analysis.md`)**:
   - Lines 12–18: Diagnoses the "Digital Uncanny Valley" in AI copy and color: hollow Latinate superlatives ("elevate", "unleash", "delve"), symmetrical triads with identical grammatical parallelism, pitch black (`#000000`) on white causing OLED halation, and clinical zero-Kelvin cold zinc.
   - Lines 34–40: Documents the 40+ LLM slop blacklist with concrete replacements.
   - Lines 114–130: Defines the Emotional Temperature framework (2700K Warm Organic to 5000K Crisp Studio) and functional contrast calibration (WCAG AA 4.5:1 / 3:1).
   - Lines 400–445: Establishes quantifiable audit dimensions across Copywriting, Chromatics, Structural Rhythm, and Microinteractions.

5. **Survey Architecture Blueprint (`survey_spec_miner/handoff.md`)**:
   - Lines 188–194: Outlines the required structure of `SKILL.md`: (1) Executive Overview & Anti-AI Design Manifesto, (2) The 4 Pillars of Human Interface Design, (3) The Top-10 Instant Triage Heuristics, (4) Progressive Disclosure Index, (5) Operational Agent Workflow (net-new design vs refactoring).

---

## 2. Logic Chain

From the observations above, the analytical logic chain dictates the technical substance of `SKILL.md`:

1. **Why an Anti-AI Manifesto is Crucial**:
   - AI coding agents do not generate bad UI because they lack CSS syntax knowledge; they generate bad UI because they lack optical and emotional judgment. They optimize for the statistical mean of web training data (which is saturated with SaaS boilerplate, generic Tailwind landing pages, and AI-generated hype).
   - Without an explicit philosophical manifesto defining *why* AI interfaces feel synthetic and *what* constitutes human craft, agents will continue falling back on robotic defaults. The Manifesto establishes the cognitive baseline and negative constraints that halt the regression to the mean.

2. **The 4 Core Pillars as Comprehensive System Anchors**:
   - Interface humanization cannot be solved on a single front. A humanized layout with robotic copy still feels synthetic; conversational copy with neon cyberpunk glows and ungrounded glassmorphism still feels untrustworthy.
   - Therefore, the 4 Pillars must cover the complete perceptual stack:
     - **Pillar I (Organic Layout & Spatial Cadence)** breaks geometric rigidity via asymmetry, musical rhythm, and optical typography.
     - **Pillar II (Emotional Color & Chromatic Warmth)** eliminates cold clinical monotony via warm chromatic neutrals, domain temperature, and the 60-30-10 rule.
     - **Pillar III (Authentic Conversational Voice)** eradicates LLM slop words, mechanical triads, and sycophancy, replacing them with visceral specificity and active voice.
     - **Pillar IV (Tactile Physics & Environmental Materiality)** replaces floaty, weightless digital screens with physical light coherence, multi-layer shadows, bevel highlights, and hardware spring compression.

3. **The Top-10 Instant Triage Heuristics as Operational Guardrails**:
   - In production agent execution, an agent rarely has the token budget or time to re-read 50-page design books on every turn.
   - The Top-10 Heuristics (H1 to H10) must be **observable, measurable, and enforceable within 60 seconds**. Each heuristic must identify a specific code/text pattern, why it fails, the concrete human rule, and the immediate fix.

4. **Operational Agent Workflows as Deterministic Execution Paths**:
   - Agents operate in two distinct modes: creating net-new components (greenfield) or humanizing existing legacy/AI code (brownfield refactoring).
   - Explicit step-by-step workflows prevent agents from getting lost or skipping crucial layers (e.g., adding styling without fixing copy, or rewriting copy without fixing visual hierarchy).

---

## 3. Caveats

1. **Role Scope & Non-Modification Boundary**: As an Explorer agent, this report provides the complete, authoritative technical text and specifications ready for implementation, but does NOT write directly to `C:\Users\JULIAN\.gemini\config\skills\human-interface-design\`. The M1 implementer/synthesizer will place this content into `SKILL.md`.
2. **Progressive Disclosure Boundary**: `SKILL.md` serves as the high-impact operational cockpit and triage center. Deep dive mathematical formulas, exhaustive 40-word replacement tables, full CSS token codebases, and multi-file case studies belong in `references/` and `examples/`. `SKILL.md` must link to them seamlessly without bloating context.
3. **Framework Independence**: The heuristics and pillars are expressed in universal design and web standards (semantic HTML5, modern CSS custom properties, fluid `clamp()`, `cubic-bezier()`, active voice English/Spanish). They apply equally across React, Vue, Svelte, Tailwind, vanilla CSS, and mobile frameworks (Flutter, Compose).

---

## 4. Conclusion & Complete Technical Text for `SKILL.md`

Below is the complete, production-grade text developed for Milestone 1, ready to be incorporated into `C:\Users\JULIAN\.gemini\config\skills\human-interface-design\SKILL.md` directly following the YAML frontmatter.

---

### [BEGIN COMPLETE TECHNICAL TEXT FOR `SKILL.md`]

# Human Interface Design: The Anti-AI UI & Copy Standard

Expert guidance, actionable heuristics, and production standards to eliminate unmistakable AI-generated patterns ("AI slop") from interfaces, visual styling, and application copy.

---

## 1. The Anti-AI Design Manifesto

### The Uncanny Valley of AI Interfaces
When Large Language Models and generative UI tools build software, they optimize for the statistical mean of their training data. This mode collapse produces an unmistakable digital signature: the **Uncanny Valley of UI**. 

At a cursory five-second glance, an AI-generated interface appears modern and clean. But the moment a human attempts to read, navigate, or trust it, a subconscious revulsion triggers. The interface feels robotic, hollow, and alienating.

### The 5 Anatomical Markers of AI Slop:
1. **Mathematical Symmetry Over Optical Balance**: AI models align bounding boxes with mechanical precision (e.g., rigid 3-column grids where every card has identical dimensions, identical padding, and identical icon-in-circle headers). Humans design with *intentional visual tension*, focal hierarchy, and asymmetric breathing room.
2. **The Default Neon/Obsidian Trope**: When asked for dark mode, AI models invariably generate pitch black (`#000000`) surfaces with glowing cyan (`#06b6d4`), radioactive purple (`#8b5cf6`), and hot magenta radial blurs. This "cyberpunk template" is pasted onto accounting tools, healthcare portals, and SaaS dashboards with zero contextual relevance.
3. **Monotonous Spatial Pacing**: AI outputs treat whitespace uniformly: every container receives `gap-4`, `p-6`, and `mb-4`. It lacks the musical rhythm of high-end editorial craft: dense informational clusters (4–12px) paired with dramatic chapter breaks (72–128px).
4. **The LLM Vocabulary Mask**: AI copywriting defaults to Latinate hyper-abstractions, sycophantic cheerfulness, and hollow escalators (*"Unleash the power of next-gen workflows with our seamless, game-changing tapestry of bespoke solutions"*). It promises everything to everyone and describes nothing.
5. **Weightless, Lifeless Physics**: AI buttons glow on hover but do nothing on click. Panels float without environmental lighting coherence or drop down with sluggish, floaty linear tweens (`transition: all 0.3s ease`). The interface lacks tactile physical pushback.

### The Core Human Thesis
> **Human interfaces are opinionated, tactile, emotionally grounded, and structurally rhythmic.**  
> They respect the user's intelligence and time. They state exact numbers instead of superlatives, admit product boundaries instead of promising magic, anchor light to a consistent physical environment, and allow asymmetric visual breathing room.

---

## 2. The 4 Core Pillars of Human Interface Design

Every interface, component, and copy string must satisfy the **4 Core Pillars**:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                 THE 4 PILLARS OF HUMAN INTERFACE DESIGN                     │
├───────────────────────────────┬─────────────────────────────────────────────┤
│ PILLAR I: ORGANIC LAYOUT      │ PILLAR II: EMOTIONAL COLOR                  │
│ • Intentional Asymmetry       │ • Tinted Warm Neutrals (No Pure #000/#FFF)  │
│ • Macro vs Micro Spatial Cadence│ • 60-30-10 Palette Architecture with Soul │
│ • Natural Typographic Measure │ • Domain-Anchored Color Temperature         │
├───────────────────────────────┼─────────────────────────────────────────────┤
│ PILLAR III: CONVERSATIONAL VOICE│ PILLAR IV: TACTILE PHYSICS                │
│ • The LLM Slop Blacklist      │ • Single Coherent Virtual Key Light         │
│ • Visceral Specificity & Metrics│ • Chromatic Multi-Layer Shadow Stacking   │
│ • Empathetic Microcopy & Bounds│ • Hardware Spring Deceleration & Press Snap│
└───────────────────────────────┴─────────────────────────────────────────────┘
```

### Pillar I: Organic Layout & Spatial Cadence
- **Break Artificial Symmetry**: Never build three identical clone cards in a row. Use **60/40 or 70/30 asymmetric splits**. Designate one primary visual anchor (an interactive preview, realistic live code snippet, or high-density metric) and pair it with stacked secondary supporting cards.
- **Musical Spacing Rhythm**: Replace uniform `1.5rem` / `24px` spacing everywhere with distinct cadence:
  - *Micro-proximity (4px–12px)*: Tightly bind semantic units (label + input, stat + trend, avatar + author).
  - *Component interior (20px–36px)*: Roomy, structured breathing space.
  - *Macro-rhythm (72px–128px)*: Generous chapter pauses between narrative sections to allow cognitive rest.
- **Natural Typographic Measure**:
  - Restrict prose to **55–75 characters per line** (`max-width: 65ch`).
  - Scale display headlines fluidly using `clamp()` with tight tracking (`-0.025em` to `-0.035em`) and tight leading (`1.1` to `1.2`).
  - Enforce `text-wrap: balance` on headings and `text-wrap: pretty` on body paragraphs to prevent orphaned single words (widows).

### Pillar II: Emotional Color & Chromatic Warmth
- **Banish Zero-Kelvin Contrast & OLED Halation**: Never place pure white text (`#FFFFFF`) on pure pitch-black (`#000000`). The 21:1 contrast ratio scatters light inside human eyes (ocular halation) and causes rapid visual fatigue. Use warm, tinted surfaces (warm obsidian `#121214`, warm slate `#0f141c`, linen `#FBF9F5`, oat milk `#FAF7F2`) with 2%–6% chromatic undertone.
- **Extinguish the AI Neon Trope**: Blacklist generic cyan-to-purple linear gradients (`#06b6d4` → `#8b5cf6`), radioactive blurred background blobs, and glowing 1px border gimmicks. 
- **The 60-30-10 Rule with Soul**:
  - **60% Dominant Base**: Neutral background/canvas with subtle warmth.
  - **30% Structural Form**: High-contrast typography, crisp card surfaces, and tactile borders.
  - **10% Emotional Accent**: A single, disciplined accent color reserved exclusively for the primary call-to-action or focal anchor.
- **Calibrate to Emotional Temperature**:
  - *2700K–3200K (Warm Organic)*: Sandstone, deep forest pine, burnished ochre (Fintech stewardship, wealth, editorial).
  - *4000K–4500K (Balanced Humanist)*: Sage, morning mist, sunbaked terracotta (Healthcare, edtech, collaboration).
  - *5000K (Crisp Studio)*: Warm basalt, ivory, analog amber (Developer tools, creative studios, audio hardware).

### Pillar III: Authentic Conversational Voice
- **Zero-Tolerance for the LLM Slop Vocabulary**: Instantly purge the 40+ banned AI buzzwords:
  * *Hollow Escalators*: `unleash`, `elevate`, `supercharge`, `revolutionize`, `transform`, `skyrocket`, `maximize`, `powerhouse`.
  * *Pseudo-Intellectual Connectors*: `delve`, `tapestry`, `beacon`, `testament`, `foster`, `pivotal`, `holistic`, `intertwined`, `navigate`.
  * *Frictionless Myths*: `seamlessly`, `effortlessly`, `friction-free`, `intuitive`, `hassle-free`, `magical`, `game-changer`.
  * *Corporate Sycophancy*: `empower`, `harness`, `bespoke`, `embark`, `synergy`, `cutting-edge`, `unparalleled`, `robust`.
- **Visceral Specificity & Anglo-Saxon Verbs**: Replace Latinate abstractions with concrete nouns and active verbs. Name the exact number of clicks, minutes saved, or dollars earned:
  - *AI Slop*: *"Elevate your organizational synergy with our revolutionary collaboration platform."*
  - *Human*: *"See who is working on what without asking in Slack. Cut 4 hours of status meetings every week."*
- **Dynamic Cadence (Staccato & Legato)**: Alternate between punchy short sentences (<8 words) and descriptive clauses. Kill repetitive grammatical triads across feature cards.
- **Value-First CTAs**: Eliminate sterile "Submit" or generic "Get Started". Use the formula: **[Active Verb] + [Specific Benefit] + [Friction Reducer]** (e.g., *"Download for macOS — Free 14-day trial, no credit card required"*).
- **Empathetic Microcopy & Honest Boundaries**: In errors and empty states, explain *what happened*, *why*, and provide a *1-click recovery*. Admit who the product is NOT for to build unshakeable credibility.

### Pillar IV: Tactile Physics & Environmental Materiality
- **Unified Environmental Key Light**: All shadows, highlights, and gradients must obey a single virtual key light originating from **120° / top-left**:
  - Specular top border highlight: `inset 0 1px 0 hsla(0, 0%, 100%, 0.12)`.
  - Recessed bottom shadow: `0 8px 24px -4px hsla(220, 30%, 6%, 0.3)`.
- **Chromatic Multi-Layer Shadow Stacking**: Banish flat, single-layer grayish drop shadows (`0 4px 6px rgba(0,0,0,0.15)`). Layer 3 distinct physics-based components:
  1. *Contact shadow*: Tight, dark, high opacity (ambient occlusion right where surface meets canvas).
  2. *Directional body shadow*: Medium blur, cast downward at 120°.
  3. *Ambient bounce shadow*: Wide, soft, tinted with the canvas undertone.
- **Hardware Spring Deceleration & Tactile Press**:
  - Replace floaty `transition: all 0.3s ease` with fast-settling physical spring curves: `cubic-bezier(0.16, 1, 0.3, 1)`.
  - On button click/active tap, provide tactile compression hardware feedback: `transform: scale(0.97)` with immediate 60–75ms snapback (`cubic-bezier(0.2, 0, 0, 1)`).
- **Restricted Floating Glass**: Glassmorphism (`backdrop-filter: blur(...)`) must be strictly reserved for *floating viewport overlays* (sticky navigation headers, context dropdowns, tooltips). Permanent resting cards and structural data containers must remain solid, tactile surfaces.

---

## 3. The Top-10 Instant Triage Heuristics

Apply this rapid 60-second diagnostic checklist whenever reviewing, designing, or refactoring an interface. If any heuristic fails, apply the mandatory remediation immediately.

| # | Heuristic Name | The Robotic Trap (AI Slop Signal) | The Human Standard | Observable Diagnostic Check | Immediate Remediation Action |
|---|---|---|---|---|---|
| **H1** | **The Asymmetry Rule** | 3 clone cards of identical width, height, and structure (`repeat(3, 1fr)`). | Asymmetric visual hierarchy (60/40 or 70/30 split) with 1 dominant focal anchor. | Look for `grid-cols-3` or 3 identical sibling cards with icon-in-circle headers. | Promote 1 card to Hero Anchor (interactive preview, code block, or stat); collapse others into supporting stream. |
| **H2** | **The Slop Word Blacklist** | Copy littered with *"empower"*, *"seamlessly"*, *"elevate"*, *"delve"*, *"unleash"*, *"supercharge"*. | Concrete Anglo-Saxon verbs, exact physical tasks, and measurable proof points. | Regex search: `/\b(unleash\|elevate\|supercharge\|delve\|empower\|seamlessly\|tapestry\|game-changer)\b/i`. | Purge the word. State the literal task performed and the exact number of minutes/dollars saved. |
| **H3** | **Anti-Halation Contrast** | Pitch black (`#000000`) canvas paired with stark white (`#FFFFFF`) text, or cold zinc. | Warm chromatic neutrals with 2%–6% tint (warm obsidian `#121214`, sandstone `#FBF9F5`). | Check base CSS: `background: #000` / `#000000` or `color: #fff` / `#ffffff`. | Remap background to warm slate/obsidian (`hsl(220, 16%, 9%)`) and text to soft ivory (`hsl(220, 18%, 92%)`). |
| **H4** | **Banish Cyberpunk Glow** | Dark background drowned in radioactive purple/cyan blur blobs and glowing 1px border gradients. | Atmospheric key lighting (15% warm amber or indigo vignette) and solid grounded cards. | Look for `blur-3xl`, `radial-gradient` with `#8b5cf6`/`#06b6d4`, or glowing border pseudo-elements. | Strip the glow. Use solid card surfaces, subtle 1px specular top highlight, and warm ambient shadows. |
| **H5** | **Dynamic Spatial Cadence** | Monotonous spacing scale where every container uses `gap-4`, `p-6`, or `margin: 24px`. | Micro-proximity (4px–12px) for semantic pairs; Macro-rhythm (72px–128px) between chapters. | Inspect container padding: identical `24px` padding across sections, cards, and list items. | Tighten labels/inputs to `6px–8px`; expand section boundaries to `80px–110px` for breathing room. |
| **H6** | **Editorial Line Measure** | Text paragraphs stretch 100% across the container (>100 chars) with single-word widows. | Enforce `max-width: 65ch`, `text-wrap: balance` for titles, and `text-wrap: pretty` for paragraphs. | Narrative `<p>` elements without `max-width` or with single dangling words on line breaks. | Add `max-width: 65ch; text-wrap: pretty;` to body text; set fluid `clamp()` and `text-wrap: balance` on H1/H2. |
| **H7** | **Tactile Spring Physics** | Buttons only shift color on hover; zero press feedback; or floaty linear tweens (`all 0.3s ease`). | Snappy spring deceleration (`cubic-bezier(0.16, 1, 0.3, 1)`) and `:active` compression `scale(0.97)`. | Check button CSS: missing `:active` state or using `ease` / `ease-in-out` > 300ms. | Add `:active { transform: scale(0.97); }` (60ms) and use spring bezier on interactive transforms. |
| **H8** | **Single Environmental Light** | Single-layer dirty gray drop shadow (`box-shadow: 0 4px 6px rgba(0,0,0,0.15)`) with random angles. | Chromatic 3-layer shadow stacking adhering to a single coherent virtual key light at 120°. | Single-layer `box-shadow: 0 Xpx Ypx rgba(0,0,0,...)` with neutral black/gray alphas. | Replace with 3-tier shadow (contact + directional + ambient bounce) + top specular highlight. |
| **H9** | **60-30-10 Accent Restraint** | Bright primary accents pasted on every icon, pill badge, border, and link (rainbow noise). | 60% neutral backdrop, 30% structural ink/cards, 10% intentional accent for primary conversion. | Saturated colors covering >20% of the viewport; multiple competing saturated hues. | Neutralize secondary badges and icons to subtle surface tints; reserve primary color strictly for main CTA. |
| **H10** | **Empathetic Action Microcopy** | Juvenile cheering ("Awesome job! 🎉🚀") or cryptic system dumps ("Error 500: Unexpected error"). | Calm, respectful voice explaining *what happened*, *why*, and offering a *1-click recovery path*. | Errors with "Oops!" or "Something went wrong" without recovery buttons; excessive emoji spam. | Rewrite: *"We couldn't connect to Stripe. Your draft invoice is saved. [Retry Connection]"*. |

---

## 4. Operational Agent Workflows

Agents must execute the skill deterministically according to task context:

### Workflow A: Net-New Human Interface Design (Greenfield Creation)
When prompted to design or build a new landing page, dashboard, or UI component:

```
[Phase 1: Domain & Tone] ➔ [Phase 2: Asymmetric Layout] ➔ [Phase 3: Conversational Copy] ➔ [Phase 4: Tactile Styling] ➔ [Phase 5: Kinetic Motion] ➔ [Phase 6: Triage Verification]
```

1. **Phase 1: Domain & Emotional Temperature Calibration**:
   - Identify the user's emotional state in this domain (e.g., Anxious in healthcare, Cautious in finance, Focused in devtools).
   - Select the corresponding color temperature:
     * *Warm Organic (2700K–3200K)*: Sandstone, pine, warm espresso (`#FBF9F5`, `#1B4332`, `#1C1917`).
     * *Balanced Humanist (4000K–4500K)*: Sage, mist, terracotta (`#F7F9F8`, `#2C6E59`, `#C85A32`).
     * *Crisp Studio (5000K)*: Warm obsidian, ivory, analog amber (`#121214`, `#F3F3F0`, `#F59E0B`).
   - Consult `references/color-psychology.md` for exact semantic token definitions.

2. **Phase 2: Narrative Anchor & Asymmetric Grid Architecture**:
   - Establish a **singular visual anchor** for the viewport (interactive demo, code sandbox, live chart).
   - Lay out the container using a **60/40 or 70/30 asymmetric split** (never 3 equal cards).
   - Set macro-chapter spacing (`72px–128px`) and constrain all narrative text to `max-width: 65ch`.
   - Consult `references/organic-ui.md` for bento and asymmetric layout patterns.

3. **Phase 3: Conversational Copywriting & Microcopy Drafting**:
   - Write headlines using **Job-to-be-Done formulas**; never use "Where X meets Y" or "The Future of Z".
   - Draft the primary CTA using: **[Verb] + [Benefit] + [Friction Reducer]**.
   - Check copy against the LLM slop blacklist (`references/conversational-copy.md`).
   - Draft calm empty states and actionable error messages with 1-click recovery.

4. **Phase 4: Tactile Styling & Environmental Lighting**:
   - Apply warm chromatic surfaces (never pure `#000000` or `#FFFFFF`).
   - Add top specular 1px highlights (`inset 0 1px 0 hsla(0,0%,100%,0.12)`) and chromatic 3-layer shadows.
   - Enforce the 60-30-10 distribution; ensure text passes WCAG 2.2 AA (4.5:1 / 3:1).

5. **Phase 5: Kinetic Motion & Hardware Polish**:
   - Bind interactive states to spring curves: `transition: transform 180ms cubic-bezier(0.16, 1, 0.3, 1)`.
   - Add hardware click compression to buttons: `:active { transform: scale(0.97); }` (60ms).
   - Wrap all transforms in `@media (prefers-reduced-motion: no-preference)`.

6. **Phase 6: Instant Triage Heuristics Verification**:
   - Run the Top-10 Heuristics table (Section 3). Ensure 10/10 compliance before delivering output.

---

### Workflow B: Humanizing Existing Interfaces (Brownfield Refactoring & Auditing)
When auditing, reviewing, or refactoring an existing interface that exhibits AI slop:

```
[Step 1: The Lexical Purge] ➔ [Step 2: Chromatic Remap] ➔ [Step 3: Symmetry Shatter] ➔ [Step 4: Tactile Injection] ➔ [Step 5: Objective Audit Scoring]
```

1. **Step 1: The Lexical Purge (Copy Audit)**:
   - Run `python scripts/audit_copy.py <file_or_dir>` (or execute regex scan for blacklisted terms).
   - Replace abstract escalation verbs (*"revolutionize", "elevate"*) with specific operational actions.
   - Break parallel grammatical triads in 3-card sections; give each card distinct length, purpose, and rhythm.
   - Strip excessive exclamation marks and sycophantic emojis.

2. **Step 2: Chromatic & Contrast Remap**:
   - Search-and-replace pure pitch black (`#000000`) and clinical cold grays with warm obsidian (`#121214`) or warm slate.
   - Extinguish radioactive purple/cyan gradient overlays (`#8b5cf6`, `#06b6d4`, `radial-gradient`).
   - Check contrast ratios with WCAG AA tools; fix low-contrast "milky" glassmorphism cards by giving them solid tactile backgrounds.

3. **Step 3: Symmetry Shatter (Layout Refactoring)**:
   - Identify repetitive `repeat(3, 1fr)` or identical 3-column rows.
   - Reconfigure into a 65/35 or bento hierarchy: expand the killer feature to span 2 columns with a live UI preview; stack the remaining 2 features vertically on the right.
   - Enforce `max-width: 65ch` and `text-wrap: balance` on headings.

4. **Step 4: Tactile & Kinetic Injection**:
   - Replace flat single-layer drop shadows with the 3-layer shadow stacking tokens.
   - Add `scale(0.97)` active press state to buttons and replace linear transitions with `cubic-bezier(0.16, 1, 0.3, 1)`.
   - Remove floaty delayed scroll-stagger animations; ensure critical content renders immediately.

5. **Step 5: Objective Audit Scoring**:
   - Score the refactored output against the 30-Point Scoring Matrix in `references/audit-rubric.md`.
   - Verify that the resulting score achieves **Tier 1 (Mastercraft, 26–30 pts)** or **Tier 2 (Production Polished, 20–25 pts)** before finalizing PR/handoff.

---

## 5. Progressive Disclosure Index

Consult these specialized reference deep-dives and production case studies for complete implementations:

- **[references/organic-ui.md](references/organic-ui.md)**: Deep dive into asymmetric CSS Grid patterns, macro/micro spacing tokens, fluid `clamp()` typographic scales, physical light logic, multi-layer shadow stacking formulas, and spring microinteractions.
- **[references/color-psychology.md](references/color-psychology.md)**: Deep dive into OKLCH/HSL perceptual lightness curves, the 4 complete production palettes (Fintech, Healthcare, Creative Studio, Lifestyle), APCA contrast polarity, and halation prevention.
- **[references/conversational-copy.md](references/conversational-copy.md)**: Deep dive into the full 40+ LLM slop blacklist, search-and-replace dictionary, staccato/legato cadence tuning, value-first CTA formulas, empathetic error recovery, and bilingual (English/Spanish) translation adaptations.
- **[references/audit-rubric.md](references/audit-rubric.md)**: The authoritative 30-Point Objective Scoring Matrix (6 dimensions x 5 pts), quality scoring tiers, the 10-Question Boolean Quick-Triage Checklist, and audit protocol.
- **[examples/before-after-cases.md](examples/before-after-cases.md)**: Three complete side-by-side comparative production case studies with HTML/CSS code, copy breakdowns, and visual diagrams:
  1. *Case 1*: B2B SaaS Landing Page Hero & Value Proposition.
  2. *Case 2*: E-Commerce / Subscription Dashboard Card (Symmetrical vs Asymmetrical Bento).
  3. *Case 3*: Multi-Step Onboarding Form & Error Recovery Flow.
- **[scripts/audit_copy.py](scripts/audit_copy.py)**: Standalone Python CLI utility to scan project files for banned AI buzzwords, passive voice density, and compute an objective humanization score.

### [END COMPLETE TECHNICAL TEXT FOR `SKILL.md`]

---

## 5. Verification Method

To independently verify the technical rigor, validity, and applicability of this work:

1. **Verify Heuristics Diagnostic Criteria**:
   - Test each of the Top-10 Heuristics (H1 to H10) against known AI-generated components (such as Case 1, 2, and 3 "Before" snippets in `survey_explorer_ui/handoff.md` and `survey_explorer_copy_color/analysis.md`). Confirm that:
     * H1 flags the 3-column feature grids.
     * H2 regex flags *"unleash"*, *"elevate"*, *"seamlessly"*.
     * H3 flags `#000000` with `#FFFFFF`.
     * H4 flags `#8b5cf6` and `#06b6d4` gradients.
     * H7 flags buttons lacking `:active` scale.
     * H10 flags generic "Oops!" error states.

2. **Verify Cross-Reference Alignment**:
   - Confirm that every reference link in Section 5 (`references/organic-ui.md`, `references/color-psychology.md`, `references/conversational-copy.md`, `references/audit-rubric.md`, `examples/before-after-cases.md`, `scripts/audit_copy.py`) matches the file structure established in `PROJECT.md` and `survey_spec_miner/handoff.md`.

3. **Verify Operational Feasibility**:
   - Walk through Workflow A (Net-New) and Workflow B (Refactoring) from an agent's perspective. Verify that each step has a clear input, concrete transformation, and clear output without gaps.

4. **Verify Artifact Locations**:
   - `handoff.md`: `c:\Users\JULIAN\Desktop\GravyLocalTABS\.agents\teamwork\m1_explorer_manifesto\handoff.md`
   - `BRIEFING.md`: `c:\Users\JULIAN\Desktop\GravyLocalTABS\.agents\teamwork\m1_explorer_manifesto\BRIEFING.md`
   - `progress.md`: `c:\Users\JULIAN\Desktop\GravyLocalTABS\.agents\teamwork\m1_explorer_manifesto\progress.md`
   - `DISPATCH.md`: `c:\Users\JULIAN\Desktop\GravyLocalTABS\.agents\teamwork\m1_explorer_manifesto\DISPATCH.md`
