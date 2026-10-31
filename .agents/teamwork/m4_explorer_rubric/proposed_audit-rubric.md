# Objective Humanization Audit Rubric & Quick-Triage Specification

A comprehensive, production-grade evaluation standard to audit digital interfaces and application copy against the synthetic signatures of AI generation ("AI slop"). This reference establishes a quantifiable **30-Point Objective Scoring Matrix** (Feature 22) and a rapid **10-Point Boolean Quick-Triage Checklist** (Feature 23) to eliminate subjective visual opinions and ground code/design reviews in verifiable, reproducible criteria.

---

# 30-Point Objective Humanization Scoring Matrix

## 1. Executive Overview & Mathematical Foundation

### 1.1 The Necessity of Objective Measurement
Generative AI models and boilerplate web frameworks consistently collapse into predictable aesthetic and lexical tropes: rigid three-column grids, uniform 24px container padding, ungrounded cybernetic neon gradients, pitch-black halation, and Latinate corporate buzzwords. Because design reviews often devolve into subjective personal preferences ("I don't like the color" or "it feels generic"), teams struggle to justify refactoring synthetic interfaces.

The **30-Point Objective Humanization Scoring Matrix** replaces subjective aesthetic debate with deterministic, reproducible metrics. Every dimension evaluates observable structural properties of the Document Object Model (DOM), CSS styling rules, photometric lighting vectors, and typographic or lexical content.

### 1.2 Mathematical Structure
The matrix evaluates six orthogonal dimensions of user interface craftsmanship. Each dimension is scored from **0 to 5 points**, yielding a composite score ranging from **0 to 30 points**:

$$\text{Total Humanization Score} = \sum_{i=1}^{6} D_i \quad \text{where } D_i \in [0, 5]$$

- **Maximum Theoretical Score**: 30 points (Mastercrafted Human Form)
- **Minimum Theoretical Score**: 0 points (Egregious Synthetic Slop)
- **Dimensions Evaluated**:
  1. $D_1$: Asymmetrical Composition & Visual Rhythm (Layout & Bento Architecture)
  2. $D_2$: Musical Spacing & Structural Hierarchy (Spatial Cadence & Proximity)
  3. $D_3$: Fluid Typography & Reader Comfort (Optical Scaling & Reading Measure)
  4. $D_4$: Tactile Materiality & Elevation Physics (Photometric Lighting & Kinetics)
  5. $D_5$: Chromatic Intent & Color Psychology (Harmonic Warmth & Contrast)
  6. $D_6$: Conversational UX Voice & Empathetic Microcopy (Lexical Craft & Error Recovery)

---

## 2. The 6 Distinct Evaluation Dimensions

Each dimension provides explicit, observable scoring criteria for 0, 1–2, 3–4, and 5 points, accompanied by deterministic itemized deduction penalties.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                 THE 6 OBJECTIVE HUMANIZATION DIMENSIONS                     │
├───────────────────────────────┬─────────────────────────────────────────────┤
│ D1: ASYMMETRICAL COMPOSITION  │ D2: MUSICAL SPACING & CADENCE               │
│ • 60/40 or 70/30 Split Ratios │ • Micro-Proximity Clusters (4px–12px)       │
│ • Dominant Lead Anchor (55–70%)│ • Component Breathing Room (20px–36px)     │
│ • Bento Mosaic with Var-Spans │ • Macro Chapter Breaks (72px–128px)         │
├───────────────────────────────┼─────────────────────────────────────────────┤
│ D3: FLUID TYPOGRAPHY          │ D4: TACTILE MATERIALITY & PHYSICS           │
│ • Fluid clamp() Headline Scale│ • Coherent 120° Virtual Key Light           │
│ • Contained Measure (max 65ch)│ • 3-Layer Chromatic Shadow Stacking         │
│ • Balanced Headings & Tabular │ • Hardware Scale Compression & Spring Ease  │
├───────────────────────────────┼─────────────────────────────────────────────┤
│ D5: CHROMATIC INTENT          │ D6: CONVERSATIONAL UX VOICE                 │
│ • Tinted Warm Neutrals (2–6%) │ • 100% Slop Blacklist Elimination          │
│ • Disciplined 60-30-10 Rule   │ • Dynamic Staccato / Legato Cadence         │
│ • WCAG 2.2 AA / AAA Parity    │ • Value-First CTAs & 3-Part Error Recovery  │
└───────────────────────────────┴─────────────────────────────────────────────┘
```

---

### Dimension 1: Asymmetrical Composition & Visual Rhythm ($D_1$)
Evaluates the geometric organization of viewport content, prevention of mechanical clone patterns, and intentional focal hierarchy.

#### Observable Scoring Scale (0–5 pts):
- **0 pts (Egregious Failure)**: Pure cookie-cutter clone grid (`repeat(3, 1fr)` or identical 3-column row) where 3 or more sibling cards share identical width (33.3%), identical height, identical internal padding, and identical icon-in-circle headers; or hero sections divided into equal 50/50 halves without visual hierarchy.
- **1–2 pts (Uncanny AI Slop)**: Asymmetry is simulated superficially (e.g., one card has a colored border or badge), but structural layout remains rigid equal columns; cards lack a functional domain artifact; supporting stream competes with lead card for visual weight.
- **3–4 pts (Polished Professional)**: Clear 60/40 or 70/30 spatial split or bento grid; designated primary visual anchor present; minor defects in responsive wrap, or secondary cards exhibit slight structural cloning.
- **5 pts (Mastercrafted Human Form)**: Calibrated 60/40 or 70/30 asymmetric split or 12-column bento mosaic; exactly one primary visual anchor card commanding 55%–70% width and housing a live, domain-specific functional artifact (interactive workbench, terminal, code preview, dense telemetry); secondary cards visually restrained; flexible sizing with zero clipping across multilingual expansion.

#### Explicit Deduction Penalties:
- **-3 pts**: Unbroken 3-column clone grid (`grid-cols-3` / `repeat(3, 1fr)`) with identical card footprints.
- **-2 pts**: Absence of a designated primary visual anchor card in hero or showcase sections.
- **-1 pt**: Anchor card contains generic decorative stock vectors/icons rather than a functional domain artifact.
- **-1 pt**: Symmetric 50/50 two-column hero causing split-attention friction.
- **-1 pt**: Fixed pixel widths on cards causing horizontal overflow or clipping during text expansion.

---

### Dimension 2: Musical Spacing & Structural Hierarchy ($D_2$)
Evaluates whitespace calibration, rhythmic cadence across viewport containers, and application of the Gestalt Law of Proximity.

#### Observable Scoring Scale (0–5 pts):
- **0 pts (Egregious Failure)**: Monotonous spatial pacing throughout. Every container, card, list item, and section boundary applies identical padding/margin (e.g., universal `p-6`, `gap-4`, or `margin: 24px` on all elements); zero cognitive breathing room between unrelated themes.
- **1–2 pts (Uncanny AI Slop)**: Irregular spacing without systematic hierarchy; semantic pairs (label and input, stat and trend, avatar and author) separated by excessive space (>16px), causing perceptual decoupling; section breaks cramped (<48px).
- **3–4 pts (Polished Professional)**: Clear differentiation between container interior padding (20px–32px) and micro-spacing (6px–10px); section margins present but slightly uniform (48px–64px) without dramatic narrative breaks.
- **5 pts (Mastercrafted Human Form)**: Strict 3-tier spacing cadence:
  - *Micro-proximity (4px–12px)* tightly binds semantic units.
  - *Component interior (20px–36px)* delivers clear, structured breathing room.
  - *Macro-rhythm (72px–128px)* establishes dramatic chapter pauses between major narrative sections. Zero spatial collisions or ambiguous element groupings.

#### Explicit Deduction Penalties:
- **-3 pts**: Uniform padding/margin applied across all container scales (e.g. `24px` everywhere).
- **-2 pts**: Decoupled semantic pairs (label-to-input or stat-to-delta distance exceeds 16px).
- **-2 pts**: Section chapter boundaries compressed below 48px, causing optical crowding.
- **-1 pt**: Inconsistent horizontal padding between adjacent container tiers.

---

### Dimension 3: Fluid Typography & Reader Comfort ($D_3$)
Evaluates optical readability, responsive font scaling expressions, line length constraints, and vertical typographical harmony.

#### Observable Scoring Scale (0–5 pts):
- **0 pts (Egregious Failure)**: Narrative text paragraphs stretch across full container width (>100 characters per line / >900px wide); static oversized desktop fonts overflowing viewport on mobile displays; default loose leading (`1.5` on 48px headlines); dangling single-word widows throughout paragraph breaks.
- **1–2 pts (Uncanny AI Slop)**: Body text constrained but exceeds comfortable measure (80ch–100ch); display headlines lack optical tracking adjustments (loose default letter-spacing on large weights); metrics and numeric counters lack tabular figures, vibrating horizontally during state updates.
- **3–4 pts (Polished Professional)**: Narrative paragraphs constrained to `max-width: 65ch`; headlines use responsive `clamp()` expressions; headings utilize `text-wrap: balance`; minor typographical defects (e.g., body line-height slightly loose at 1.7 or occasional line break widow).
- **5 pts (Mastercrafted Human Form)**: Display headlines scaled fluidly via `clamp()` with inverted line-height proportionality (1.1–1.2 leading) and optical negative tracking (-0.025em to -0.035em); body prose strictly bounded to 55–75 characters (`max-width: 65ch`); `text-wrap: balance` enforced on headlines and `text-wrap: pretty` on paragraphs; all numeric telemetry and currency metrics declare `font-variant-numeric: tabular-nums`.

#### Explicit Deduction Penalties:
- **-3 pts**: Body copy measure unconstrained, exceeding 85 characters per line (`max-width` missing on prose `<p>`).
- **-2 pts**: Display headings lack fluid sizing, resulting in horizontal overflow or awkward wrapping on mobile viewports.
- **-1 pt**: Headings lack `text-wrap: balance`, leaving isolated single-word widows.
- **-1 pt**: Numeric data, timestamps, or telemetry displayed without `tabular-nums` (`font-variant-numeric: tabular-nums`).
- **-1 pt**: Large headlines (>32px) utilize default loose leading (`line-height >= 1.5`), causing disconnected optical blocks.

---

### Dimension 4: Tactile Materiality & Elevation Physics ($D_4$)
Evaluates physical lighting coherence, depth stratification, surface edge definitions, and interactive kinematic feedback.

#### Observable Scoring Scale (0–5 pts):
- **0 pts (Egregious Failure)**: Flat, single-layer dirty gray drop shadows (`box-shadow: 0 4px 6px rgba(0,0,0,0.15)`); ungrounded full-bleed glassmorphism applied across data surfaces; buttons display only color change on hover with zero active click feedback; sluggish or floaty linear animations (`transition: all 0.3s ease`).
- **1–2 pts (Uncanny AI Slop)**: Multi-directional conflicting shadow vectors; interactive buttons lack hardware press compression; cards float without structural borders; animations feel disconnected or linger beyond 300ms.
- **3–4 pts (Polished Professional)**: Single directional key light mostly respected; diffuse layered shadows with subtle ambient undertones; buttons feature `:active` state changes; minor imperfections (e.g., generic ease-in-out curve rather than calibrated spring curve, or specular highlight opacity slightly high).
- **5 pts (Mastercrafted Human Form)**: Unified 120° virtual key light rigorously maintained across all elevations; 3-layer chromatic shadow stacking (contact occlusion + directional body + ambient tinted bounce); 1px specular top highlight (`inset 0 1px 0 hsla(...)`); glassmorphism strictly restricted to floating viewport overlays (sticky headers, menus); interactive buttons deliver hardware click compression (`scale(0.97)` at 60–75ms) governed by snappy spring deceleration curves (`cubic-bezier(0.16, 1, 0.3, 1)`); universal `prefers-reduced-motion` compliance.

#### Explicit Deduction Penalties:
- **-2 pts**: Flat single-layer gray shadow (`box-shadow: 0 Xpx Ypx rgba(0,0,0,...)`) lacking multi-tier depth.
- **-2 pts**: Primary action buttons completely missing `:active` click feedback or compression.
- **-1 pt**: Incoherent lighting angles (elements projecting shadows in conflicting directions, e.g. 90° mixed with 180°).
- **-1 pt**: Interactive transitions relying on linear or default `ease` curves exceeding 300ms duration.
- **-1 pt**: Glassmorphism (`backdrop-filter: blur(...)`) misapplied to permanent resting card surfaces.
- **-1 pt**: Missing specular top bevel edge highlight on elevated cards in dark mode.

---

### Dimension 5: Chromatic Intent & Color Psychology ($D_5$)
Evaluates emotional temperature calibration, neutral surface undertones, chromatic balance, and functional accessibility contrast.

#### Observable Scoring Scale (0–5 pts):
- **0 pts (Egregious Failure)**: Pitch-black (`#000000`) canvas paired with stark white (`#FFFFFF`) text causing severe ocular halation; radioactive cyan-to-purple linear gradients (`#06b6d4` to `#8b5cf6`), glowing neon background blobs, and glowing 1px border gimmicks pasted onto non-cyberpunk interfaces; saturated accent color covers >30% of viewport area; WCAG AA contrast failures (<4.5:1 / <3:1) on primary interface text.
- **1–2 pts (Uncanny AI Slop)**: Surfaces built from cold, clinical zero-saturation gray scales (`#71717a`, `#a1a1aa`); primary accent over-saturated and splashed across multiple secondary elements, pills, and card icons; secondary text contrast falls below WCAG AA thresholds.
- **3–4 pts (Polished Professional)**: Tinted warm neutrals employed; 60-30-10 distribution generally maintained; all text passes WCAG 2.2 AA (4.5:1 / 3:1); minor saturation creep where primary accent accounts for 12%–15% of viewport area.
- **5 pts (Mastercrafted Human Form)**: Domain-calibrated color temperature (2700K Warm Organic, 4000K Balanced Humanist, or 5000K Crisp Studio) using tinted neutrals with 2%–6% chroma undertone; disciplined 60-30-10 palette architecture (60% canvas backdrop, 30% structural form/ink, 10% intentional accent); zero AI neon gradient gimmicks; 100% WCAG 2.2 AA compliance across all states with AAA on high-frequency text; dark mode halation parity achieved through monotonic surface elevation luminances.

#### Explicit Deduction Penalties:
- **-3 pts**: Pitch-black (`#000000`) canvas with stark white (`#FFFFFF`) text causing ocular halation.
- **-3 pts**: Synthetic AI neon gradient trope (cyan-to-purple `#06b6d4` → `#8b5cf6` or radioactive blur blobs).
- **-2 pts**: WCAG 2.2 AA contrast violation on body copy, form labels, or primary actions (<4.5:1).
- **-2 pts**: Primary accent color covers >15% of the visible viewport, creating rainbow clutter.
- **-1 pt**: Cold, untinted neutral gray palette in domains demanding warmth and trust (e.g. finance, health, productivity).
- **-1 pt**: Saturated accent color applied to secondary utility badges, decorative icons, or container borders.

---

### Dimension 6: Conversational UX Voice & Empathetic Microcopy ($D_6$)
Evaluates natural language authenticity, eradication of machine-generated boilerplate, rhythmic cadence, and actionable error recovery.

#### Observable Scoring Scale (0–5 pts):
- **0 pts (Egregious Failure)**: Copy saturated with blacklisted LLM buzzwords (e.g., *"unleash the power"*, *"seamlessly elevate"*, *"revolutionary tapestry of bespoke solutions"*, *"supercharge your workflow"*); sycophantic exclamation points or childish emoji spam; cryptic system dump errors (*"Error 500: Unexpected exception"*) with zero diagnostic context or recovery path; generic robotic button labels (*"Submit"*, *"Click Here"*).
- **1–2 pts (Uncanny AI Slop)**: Repetitive grammatical triads across all feature descriptions; vague value propositions devoid of exact numbers or measurable outcomes; error states declare *"Oops! Something went wrong"* without root cause or retry mechanism; hollow corporate cheerfulness.
- **3–4 pts (Polished Professional)**: 100% free of blacklisted LLM buzzwords; active verbs employed; error states clearly explain what went wrong but lack automated 1-click recovery; CTA buttons are action-oriented but lack specific benefit or friction reduction.
- **5 pts (Mastercrafted Human Form)**: 100% free of blacklisted LLM buzzwords; visceral Anglo-Saxon verbs paired with exact, verifiable metrics (minutes saved, dollar amounts, specific operational tasks); dynamic cadence alternating punchy staccato statements (<8 words) with descriptive clauses; value-first CTAs engineered via **[Active Verb] + [Specific Benefit] + [Friction Reducer]**; 3-part empathetic error recovery (What happened, Why it happened, 1-click recovery path); respectful empty states and honest product boundaries; natural native phrasing across bilingual translations (EN/ES).

#### Explicit Deduction Penalties:
- **-3 pts**: Presence of blacklisted AI buzzwords (e.g., *empower*, *seamlessly*, *elevate*, *delve*, *supercharge*, *unleash*, *tapestry*, *game-changer*).
- **-2 pts**: Cryptic error state or dead-end alert lacking explanation and recovery button.
- **-2 pts**: Generic, friction-heavy CTA button text (*"Submit"*, *"Start Free Trial"*, *"Get Started"*, *"Click Here"*).
- **-1 pt**: Monotonous grammatical triad symmetry across consecutive feature cards.
- **-1 pt**: Unsubstantiated superlative claims lacking verifiable numbers or concrete metrics.
- **-1 pt**: Juvenile emoji spam or sycophantic exclamation cheerleading (*"Awesome job! 🎉🚀"*).

---

## 3. Quality Scoring Tiers

The total score maps to four continuous, non-overlapping quality tiers that establish unambiguous production deployment gates.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       HUMANIZATION QUALITY TIERS                            │
├────────┬──────────────────────────────────────────┬───────────┬─────────────┤
│ TIER   │ CLASSIFICATION                           │ RANGE     │ ACTION GATE │
├────────┼──────────────────────────────────────────┼───────────┼─────────────┤
│ Tier 1 │ Mastercrafted Human Voice & Form         │ 26–30 pts │ PASS (Ship) │
│ Tier 2 │ Polished Professional Interface          │ 20–25 pts │ PASS (Ship) │
│ Tier 3 │ Uncanny AI Slop Zone                     │ 14–19 pts │ REVIEW/HOLD │
│ Tier 4 │ Egregious AI Slop                        │  0–13 pts │ FAIL/REJECT │
└────────┴──────────────────────────────────────────┴───────────┴─────────────┘
```

### Tier 1: Mastercrafted Human Voice & Form (26–30 pts)
- **Status**: Production Flagship Grade.
- **Profile**: The interface displays exemplary artisanal polish. Visual layout breaks mechanical symmetry with dynamic bento architecture or calibrated 60/40 splits; spacing provides rhythmic breathing room; lighting obeys physical optics with 3-layer chromatic shadows; color temperature evokes domain-appropriate emotional calm; copy speaks with visceral clarity, specific proof points, and empathetic error handling.
- **Action Gate**: Approved for immediate production deployment, design system ratification, and high-visibility public release.

### Tier 2: Polished Professional Interface (20–25 pts)
- **Status**: Production-Ready Commercial Grade.
- **Profile**: Solid, comfortable, and functional digital product. Free of egregious AI clichés or blacklisted buzzwords. Layout exhibits hierarchy, typography respects reading measure, contrast meets WCAG AA standards, and buttons provide tactile feedback. Minor optical or microcopy optimizations remain (e.g., slight spacing uniformity, standard ease curves instead of spring physics, or standard action CTAs).
- **Action Gate**: Approved for pull request merge and release. Non-blocking polish items logged to backlog for iterative refinement.

### Tier 3: Uncanny AI Slop Zone (14–19 pts)
- **Status**: Substandard / Uncanny Valley Risk.
- **Profile**: Triggers user skepticism and cognitive fatigue. While superficially structured, the interface exhibits unmistakable AI generation signatures: rigid clone card rows, uniform 24px padding everywhere, ungrounded cold palettes, unconstrained paragraph measures, or hollow corporate copy (*"Empower your workflow with seamless collaboration"*).
- **Action Gate**: Blocked from production deployment. Mandatory targeted refactoring required using the designated remediation pointers before re-scoring.

### Tier 4: Egregious AI Slop (0–13 pts)
- **Status**: Critical Failure / Mode Collapse.
- **Profile**: Severe, unfiltered AI generation tropes. Pitch-black `#000000` halation with radioactive cyan/purple glow blobs; cookie-cutter 3-column cards with identical icon-in-circle headers; flat single-layer gray shadows; full-width text walls; copy saturated with banned buzzwords and dead-end error popups.
- **Action Gate**: Immediate PR rejection. Interface must undergo a complete structural, chromatic, and lexical rebuild following the human-interface-design workflow.

---

## 4. Audit Execution Protocol

Follow this deterministic 7-step procedure when conducting an objective audit of any user interface or pull request.

```
[Step 1: Environment Setup] ➔ [Step 2: Asymmetric Layout] ➔ [Step 3: Spacing Cadence]
          ➔ [Step 4: Typography & Flow] ➔ [Step 5: Tactile Materiality]
          ➔ [Step 6: Chromatic Palette] ➔ [Step 7: Conversational Voice & Report]
```

### Step 1: Pre-Audit Environment & Asset Preparation
1. Deploy target application in a clean staging environment or load production preview URLs.
2. Prepare inspection tooling:
   - Browser DevTools DOM / Computed Styles Inspector.
   - Color contrast analyzer (WCAG 2.2 APCA / AA algorithm).
   - Python CLI copy auditor: `python scripts/audit_copy.py <target_path>`.
3. Set viewport to standard 1440px desktop display, then test responsive breakpoints at 1024px, 768px, and 390px mobile.

### Step 2: Visual & Asymmetric Composition Analysis ($D_1$)
1. Inspect container grid definitions in hero and feature sections:
   - Identify instances of `repeat(3, 1fr)`, `grid-cols-3`, or 3 identical sibling cards. Deduct 3 points if detected.
   - Verify presence of a dominant visual anchor card occupying 55%–70% footprint. If absent, deduct 2 points.
   - Confirm anchor card houses a functional domain artifact rather than decorative stock graphics. If decorative only, deduct 1 point.
2. Score Dimension 1 ($D_1 \in [0, 5]$).

### Step 3: Musical Spacing & Spatial Cadence Measurement ($D_2$)
1. Measure vertical and horizontal padding across element tiers:
   - Check if section margins, card interiors, and label/input pairs all share the same padding (e.g. `24px`). If uniform, deduct 3 points.
   - Measure distance between form labels and inputs. If gap > 16px, deduct 2 points for decoupled semantic proximity.
   - Measure vertical distance between major narrative sections. If < 48px, deduct 2 points for cramped macro-rhythm.
2. Score Dimension 2 ($D_2 \in [0, 5]$).

### Step 4: Fluid Typography & Readability Verification ($D_3$)
1. Inspect paragraph reading measure:
   - Count characters per line in narrative `<p>` elements. If measure > 85 characters without `max-width: 65ch`, deduct 3 points.
2. Inspect headline font scaling:
   - Check H1/H2 font sizes across viewport resize. If static pixel sizes cause overflow or wrapping fractures, deduct 2 points.
   - Verify `text-wrap: balance` on headlines and check for single-word widows. If widows exist, deduct 1 point.
   - Verify `font-variant-numeric: tabular-nums` on financial, data, and counter elements. If absent, deduct 1 point.
3. Score Dimension 3 ($D_3 \in [0, 5]$).

### Step 5: Tactile Physics & Lighting Calibration ($D_4$)
1. Inspect shadow stacking and lighting vectors:
   - Inspect CSS `box-shadow` on cards. If flat single-layer gray shadow (`rgba(0,0,0,0.15)`), deduct 2 points.
   - Verify directional angle of shadow offset. If inconsistent with 120° key light, deduct 1 point.
   - Check for top specular highlight on elevated cards in dark mode (`inset 0 1px 0 hsla(...)`). If absent, deduct 1 point.
2. Test interactive kinetics:
   - Click and hold primary buttons. If `:active` state lacks physical compression (`scale(0.97)`), deduct 2 points.
   - Inspect transition timing curves. If transitions use linear or default `ease` > 300ms, deduct 1 point.
3. Score Dimension 4 ($D_4 \in [0, 5]$).

### Step 6: Chromatic Warmth & Contrast Testing ($D_5$)
1. Inspect dark mode canvas and text values:
   - Check if canvas is pitch black (`#000000`) and text is `#FFFFFF`. If halation detected, deduct 3 points.
   - Search CSS for radioactive neon gradients (`#06b6d4` to `#8b5cf6`) or blur blobs. If found, deduct 3 points.
2. Calculate color distribution:
   - Measure screen area covered by saturated brand accent. If accent > 15%, deduct 2 points.
   - Check text contrast against container backgrounds using WCAG 2.2 AA standards (4.5:1 body, 3:1 large). Deduct 2 points for failures.
3. Score Dimension 5 ($D_5 \in [0, 5]$).

### Step 7: Conversational Voice Audit & Score Synthesis ($D_6$)
1. Run automated lexical scan:
   - Execute `python scripts/audit_copy.py <files>`. If blacklisted buzzwords are flagged, deduct 3 points.
2. Inspect action microcopy and error states:
   - Trigger a form error or disconnected network state. If error is a cryptic system dump or generic "Oops!", deduct 2 points.
   - Inspect primary conversion buttons. If labeled "Submit", "Get Started", or "Click Here", deduct 2 points.
3. Score Dimension 6 ($D_6 \in [0, 5]$).
4. Tally composite score:
   $$\text{Total Score} = D_1 + D_2 + D_3 + D_4 + D_5 + D_6$$
5. Map composite score to Quality Scoring Tier (Tier 1 to 4) and issue remediation verdict.

---

## 5. Illustrative Forensic Audit Case Study: Enterprise CRM Dashboard

To demonstrate the deterministic precision of the 30-Point Scoring Matrix, consider this forensic evaluation of a representative AI-generated B2B CRM analytics interface.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│             AUDIT SCORECARD: CLOUDPRO CRM DASHBOARD (SYNTHETIC)             │
├──────────────────────────────────────────┬───────┬──────────────────────────┤
│ EVALUATION DIMENSION                     │ SCORE │ DEDUCTIONS IDENTIFIED    │
├──────────────────────────────────────────┼───────┼──────────────────────────┤
│ D1: Asymmetrical Composition & Rhythm    │ 2 / 5 │ -3 pts: repeat(3, 1fr)   │
│ D2: Musical Spacing & Hierarchy          │ 1 / 5 │ -3 pts: uniform p-6/gap-4│
│                                          │       │ -1 pt: cramped headers   │
│ D3: Fluid Typography & Measure           │ 2 / 5 │ -3 pts: unconstrained 98ch│
│ D4: Tactile Materiality & Physics        │ 2 / 5 │ -2 pts: flat gray shadow │
│                                          │       │ -1 pt: no click compress │
│ D5: Chromatic Intent & Color Psychology  │ 2 / 5 │ -3 pts: pitch #000 + neon│
│ D6: Conversational UX Voice & Microcopy  │ 2 / 5 │ -3 pts: "seamlessly", etc│
├──────────────────────────────────────────┼───────┼──────────────────────────┤
│ COMPOSITE SCORE                          │ 11/30 │ TIER 4: EGREGIOUS SLOP   │
│ ACTION GATE                              │ FAIL  │ PR REJECTED / MANDATORY  │
└──────────────────────────────────────────┴───────┴──────────────────────────┘
```

### Forensic Defect Breakdown & Deductions:
1. **$D_1$ (2/5)**: The analytics summary displays 3 identical cards (`grid-cols-3`) showing "Total Revenue", "Active Leads", and "Conversion Rate" with identical pastel icon badges and identical heights. No anchor card exists. (-3 pts).
2. **$D_2$ (1/5)**: All dashboard widgets, navigation sidebars, and stat tiles utilize identical `p-6` (24px) padding and `gap-4` (16px). Form inputs have 20px gaps from their labels. Macro chapter breaks between reports are limited to 32px. (-4 pts, floored at 1 pt).
3. **$D_3$ (2/5)**: Executive summary text expands 100% across the container (98 characters per line). Headings use static `text-2xl` without `clamp()`. Headings lack `text-wrap: balance`, causing single-word orphans. Revenue metrics lack `tabular-nums`. (-3 pts).
4. **$D_4$ (2/5)**: Cards apply flat single-layer gray shadow `box-shadow: 0 4px 6px rgba(0,0,0,0.1)`. Primary filter buttons shift background color on hover but provide zero `:active` click scale feedback. Transitions use `transition: all 0.3s ease`. (-3 pts).
5. **$D_5$ (2/5)**: Dark mode theme uses pitch black `#000000` with radioactive cyan `#06b6d4` neon borders. Saturated blue `#3b82f6` covers 28% of the screen area across badges, cards, and icons. (-3 pts).
6. **$D_6$ (2/5)**: Header text reads: *"Seamlessly empower your sales pipeline with next-gen AI insights"*. Filter button reads *"Submit"*. Disconnected API alert displays *"Error 500: Failed to fetch stream"*. (-3 pts).

### Composite Audit Verdict:
- **Total Score**: 11 / 30 points.
- **Classification**: **Tier 4: Egregious AI Slop (0–13 pts)**.
- **Gating Decision**: **FAIL**. Pull request blocked from production merge.
- **Remediation Roadmap**:
  1. Reconfigure analytics grid into a 70/30 bento layout featuring a lead interactive pipeline chart anchor.
  2. Remap background to warm slate (`hsl(220, 16%, 9%)`) and strip radioactive cyan borders.
  3. Purge "seamlessly empower", replace "Submit" with *"Filter Pipeline Results"*, and add 1-click retry on API failures.
  4. Constrain prose to `max-width: 65ch` and add `tabular-nums` to revenue metrics.
  5. Apply 3-layer chromatic shadow tokens and button click compression `scale(0.97)`.

---

# 10-Point Boolean Quick-Triage Checklist

## 1. Executive Purpose & SLA

The **10-Point Boolean Quick-Triage Checklist** provides an agile, binary diagnostic instrument designed for rapid evaluation during:
- Pull Request (PR) code reviews.
- Design handoff sign-offs.
- Continuous deployment pre-flight checks.
- Rapid developer self-audits before committing code.

### Service Level Agreement (SLA):
- **Execution Time**: Under **2 minutes** per view.
- **Determinism**: 10 objective, non-subjective binary questions ending with `?` using `[ ]` checkboxes.
- **Zero Vague Aesthetic Terms**: Questions avoid subjective aesthetic appraisals (e.g., asking if something is attractive, appealing, or well-liked). Every item verifies an observable technical property.

---

## 2. The 10 Verifiable Diagnostic Checks

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                 10-POINT BOOLEAN QUICK-TRIAGE CHECKLIST                     │
├────┬────────────────────────────────────────────────────────┬───────────────┤
│ #  │ DIAGNOSTIC QUESTION                                    │ PILLAR DOMAIN │
├────┼────────────────────────────────────────────────────────┼───────────────┤
│ Q1 │ Layout breaks 3-column clone symmetry with anchor?     │ Organic UI    │
│ Q2 │ Spacing contrasts micro-proximity with macro breaks?   │ Organic UI    │
│ Q3 │ Paragraphs constrained to max-width: 65ch with wrap?   │ Organic UI    │
│ Q4 │ 120° virtual key light with 3-layer chromatic shadows? │ Tactile Depth │
│ Q5 │ Buttons provide :active scale(0.97) spring feedback?   │ Tactile Depth │
│ Q6 │ Warm tinted neutrals avoid pitch-black halation?       │ Color Psych   │
│ Q7 │ Free of generic AI cyan/purple neon gradient clichés?  │ Color Psych   │
│ Q8 │ Saturated accent <= 10% and passes WCAG 2.2 AA?        │ Color Psych   │
│ Q9 │ Copy 100% free of banned LLM buzzword blacklist?      │ Conversational│
│ Q10│ Value-first CTAs and 3-part empathetic error recovery? │ Conversational│
└────┴────────────────────────────────────────────────────────┴───────────────┘
```

Review each item and check `[x]` for PASS or leave `[ ]` for FAIL.

### [ ] Q1: Does the layout break rigid 3-column clone symmetry by featuring an asymmetric split (60/40 or 70/30) with a single dominant visual anchor card?
- **Observable Inspection Check**: Inspect the container grid in DevTools. Look for `repeat(3, 1fr)` or three sibling cards with identical widths, identical heights, and icon-in-circle headers.
- **Pass Condition**: Viewport organizes content into an asymmetric split (60/40 or 70/30) or 12-column bento mosaic where one primary anchor card occupies 55%–70% width and houses an interactive/domain artifact.
- **Remediation Reference**: [`references/organic-ui.md#section-2`](organic-ui.md#section-2) — Section 2: Intentional Asymmetry & Modern Bento Architecture.

### [ ] Q2: Does the spacing distinguish between dense micro-proximity (4px–12px for semantic pairs) and spacious macro-rhythm (72px–128px between narrative sections)?
- **Observable Inspection Check**: Measure element margins and padding. Verify whether identical 24px/1.5rem padding is stamped on cards, lists, and section wrappers.
- **Pass Condition**: Semantic pairs (label+input, stat+delta, avatar+name) are tightly grouped (4px–12px); component interior delivers 20px–36px breathing space; major chapter transitions provide 72px–128px pauses.
- **Remediation Reference**: [`references/organic-ui.md#section-3`](organic-ui.md#section-3) — Section 3: Musical Spacing & Rhythm Cadence.

### [ ] Q3: Are narrative paragraphs constrained to a comfortable reading measure (max-width: 65ch) with titles utilizing balanced line wrapping?
- **Observable Inspection Check**: Inspect prose `<p>` containers in DevTools. Check if characters per line exceed 85 characters on wide viewports. Check headline line wraps for dangling single-word widows.
- **Pass Condition**: Narrative body text enforces `max-width: 65ch` (55–75 characters per line); headlines declare `text-wrap: balance` and body paragraphs declare `text-wrap: pretty`; numbers and currencies declare `font-variant-numeric: tabular-nums`.
- **Remediation Reference**: [`references/organic-ui.md#section-4`](organic-ui.md#section-4) — Section 4: Typographic Flow & Optical Tuning.

### [ ] Q4: Do elevated surfaces obey a coherent 120° virtual key light with multi-layer chromatic shadow stacking instead of flat single-layer gray drop shadows?
- **Observable Inspection Check**: Inspect CSS `box-shadow` property on elevated cards and dialogs. Look for generic single-layer `rgba(0,0,0,0.15)` rules.
- **Pass Condition**: Shadows utilize 3-tier chromatic stacking (contact occlusion + directional body + ambient tinted bounce) aligned to a 120° virtual key light, complemented by a 1px top specular bevel (`inset 0 1px 0 hsla(...)`).
- **Remediation Reference**: [`references/organic-ui.md#section-5`](organic-ui.md#section-5) — Section 5: Tactile Materiality & Multi-Layer Lighting.

### [ ] Q5: Do interactive buttons provide immediate tactile click compression (scale: 0.97 on :active) governed by snappy spring deceleration curves?
- **Observable Inspection Check**: Click and hold buttons in the UI. Inspect CSS for `:active { transform: scale(0.97); }` and transition timing functions.
- **Pass Condition**: Buttons immediately compress physically on click (60–75ms) and settle using spring deceleration curves (`cubic-bezier(0.16, 1, 0.3, 1)`) rather than linear or floating `all 0.3s ease` tweens.
- **Remediation Reference**: [`references/organic-ui.md#section-6`](organic-ui.md#section-6) — Section 6: Physics-Based Microinteractions & Kinetics.

### [ ] Q6: Are canvas surfaces and text rendered using warm tinted neutrals (warm obsidian #121214, warm slate, or linen) rather than harsh pitch-black (#000000) or stark white (#FFFFFF)?
- **Observable Inspection Check**: Inspect computed root background and typography colors. Test dark mode background hex values.
- **Pass Condition**: Canvas background utilizes tinted warm neutrals (warm obsidian `#121214`, warm slate `#0f141c`, or linen `#FBF9F5`) containing 2%–6% chromatic undertone; pure `#000000` pitch black paired with stark `#FFFFFF` is completely eliminated.
- **Remediation Reference**: [`references/color-psychology.md#section-2`](color-psychology.md#section-2) — Section 2: Semantic OKLCH / HSL Palettes & Tinted Neutrals.

### [ ] Q7: Is the interface completely free of generic AI cyan/purple gradients (#06b6d4 to #8b5cf6), radioactive blurred ambient background blobs, and glowing 1px border gimmicks?
- **Observable Inspection Check**: Run regex search across CSS/styles: `/(?:#06b6d4|#8b5cf6|blur-3xl|radial-gradient)/i`.
- **Pass Condition**: Zero instances of cyan-to-purple linear gradients, radioactive background blur blobs, or glowing pseudo-element neon borders on non-cyberpunk interfaces. Permanent surfaces remain solid and grounded.
- **Remediation Reference**: [`references/color-psychology.md#section-4`](color-psychology.md#section-4) — Section 4: AI Color Cliché Banishment.

### [ ] Q8: Does the color distribution restrict saturated accent color to <= 10% of the viewport while satisfying WCAG 2.2 AA (4.5:1 for body text, 3:1 for large text/UI)?
- **Observable Inspection Check**: Estimate viewport area covered by saturated brand accents. Run automated contrast tool on all text strings.
- **Pass Condition**: 60-30-10 palette discipline maintained (60% neutral backdrop, 30% structural form/ink, 10% intentional accent reserved for primary action); 100% of text and functional controls achieve WCAG 2.2 AA contrast ratios.
- **Remediation Reference**: [`references/color-psychology.md#section-3`](color-psychology.md#section-3) — Section 3: Emotional 60-30-10 Palette Architecture & [`references/color-psychology.md#section-5`](color-psychology.md#section-5) — Section 5: Functional Contrast.

### [ ] Q9: Is the copy 100% free of banned LLM buzzwords ("empower", "seamlessly", "elevate", "delve", "supercharge", "unleash", "tapestry", "game-changer")?
- **Observable Inspection Check**: Execute `python scripts/audit_copy.py <files>` or run regex scan: `/\b(unleash|elevate|supercharge|delve|empower|seamlessly|tapestry|game-changer|pivotal|synergy|bespoke|beacon)\b/i`.
- **Pass Condition**: Zero matches found across all customer-facing strings, headings, tooltips, and microcopy. Concrete Anglo-Saxon operational verbs and exact metrics used throughout.
- **Remediation Reference**: [`references/conversational-copy.md#section-2`](conversational-copy.md#section-2) — Section 2: The LLM Slop Blacklist & [`references/conversational-copy.md#section-3`](conversational-copy.md#section-3) — Section 3: Cliché Search-and-Replace Dictionary.

### [ ] Q10: Do primary action buttons follow the value-first formula ([Verb] + [Benefit] + [Friction Reducer]) and do error states explain what happened, why, with a 1-click recovery path?
- **Observable Inspection Check**: Inspect primary CTA button labels (must not say "Submit" or "Get Started"). Trigger an error condition and inspect message copy and buttons.
- **Pass Condition**: Primary CTAs follow the value-first formula (e.g., *"Download for macOS — Free 14-day trial, no card required"*); error messages provide 3-part clarity (What happened, Why, 1-click recovery action button); zero sycophantic cheering or cryptic system code dumps.
- **Remediation Reference**: [`references/conversational-copy.md#section-5`](conversational-copy.md#section-5) — Section 5: Value-First CTA Engineering & [`references/conversational-copy.md#section-6`](conversational-copy.md#section-6) — Section 6: Empathetic Microcopy & Resilient Error Recovery.

---

## 3. Actionable Pass Threshold & Remediation Protocol

### The Pass Threshold:
$$\text{Quick-Triage Score} = \sum_{j=1}^{10} Q_j \quad \text{where } Q_j \in \{0, 1\}$$

- **Pass (Production Ready)**: **$\ge 9 / 10$ checks passed** (with mandatory passing on Q6 [Anti-Halation] and Q9 [Slop Blacklist]).
  - *Action*: Pull request approved. Interface cleared for production build.
- **Conditional Review (Minor Adjustments)**: **$8 / 10$ checks passed**.
  - *Action*: PR author granted a 30-minute remediation window to address the 1–2 failing items before automated re-check. No architecture rewrite required.
- **Fail (Blocked from Production)**: **$< 8 / 10$ checks passed** (or failure of Q6 or Q9).
  - *Action*: PR blocked. Author must execute the corresponding chapter remediation actions documented below.

---

## 4. Comprehensive Remediation Mapping Directory

When any diagnostic check fails during triage, immediately navigate to the corresponding reference chapter and apply the production fix:

| Failed Check | Topic Domain | Primary Defect | Mandatory Remediation Reference |
|---|---|---|---|
| **Q1** | Layout Architecture | Cookie-cutter 3-column clone cards | [`references/organic-ui.md#section-2`](organic-ui.md#section-2) — Section 2: Intentional Asymmetry & Modern Bento Architecture |
| **Q2** | Spatial Cadence | Uniform padding / decoupled pairs | [`references/organic-ui.md#section-3`](organic-ui.md#section-3) — Section 3: Musical Spacing & Rhythm Cadence |
| **Q3** | Typographic Flow | Line measure > 85ch / orphaned widows | [`references/organic-ui.md#section-4`](organic-ui.md#section-4) — Section 4: Typographic Flow & Optical Tuning |
| **Q4** | Physical Lighting | Flat gray shadows / missing key light | [`references/organic-ui.md#section-5`](organic-ui.md#section-5) — Section 5: Tactile Materiality & Multi-Layer Lighting |
| **Q5** | Interactive Kinetics| Missing button press / floaty tweens | [`references/organic-ui.md#section-6`](organic-ui.md#section-6) — Section 6: Physics-Based Microinteractions & Kinetics |
| **Q6** | Neutral Surfaces | Pitch black `#000000` / ocular halation | [`references/color-psychology.md#section-2`](color-psychology.md#section-2) — Section 2: Semantic OKLCH / HSL Palettes & Tinted Neutrals |
| **Q7** | Color Clichés | Cyan/purple neon gradient blobs | [`references/color-psychology.md#section-4`](color-psychology.md#section-4) — Section 4: AI Color Cliché Banishment |
| **Q8** | Contrast & Balance | Accent > 10% / WCAG AA failure | [`references/color-psychology.md#section-3`](color-psychology.md#section-3) — Section 3: 60-30-10 Rule & [`references/color-psychology.md#section-5`](color-psychology.md#section-5) — Section 5: Functional Contrast |
| **Q9** | Lexical Quality | Banned AI buzzwords ("empower", etc.) | [`references/conversational-copy.md#section-2`](conversational-copy.md#section-2) — Section 2: Slop Blacklist & [`references/conversational-copy.md#section-3`](conversational-copy.md#section-3) — Section 3: Search-and-Replace |
| **Q10**| Action Microcopy | Friction CTAs / cryptic error dumps | [`references/conversational-copy.md#section-5`](conversational-copy.md#section-5) — Section 5: Value CTAs & [`references/conversational-copy.md#section-6`](conversational-copy.md#section-6) — Section 6: Empathetic Microcopy |

---

## 5. CI/CD & Automated Pull Request Integration

The 10-Point Quick-Triage Checklist can be automated in continuous integration workflows using the following execution template:

```bash
#!/usr/bin/env bash
# .github/workflows/human-interface-triage.sh
set -euo pipefail

echo "========================================================"
echo " Running Antigravity Human Interface Quick Triage (SLA < 2m)"
echo "========================================================"

# Step 1: Automated Copy Scan (Q9)
python scripts/audit_copy.py ./src --threshold 90 --lang all

# Step 2: CSS Token & Halation Checks (Q6, Q7)
if grep -rnE "(#000000|#000;)" ./src/**/*.css; then
  echo "❌ Halation Violation (Q6): Found pure pitch-black #000000. Use warm obsidian #121214."
  exit 1
fi

if grep -rnE "(#06b6d4.*#8b5cf6|blur-3xl)" ./src/**/*.css; then
  echo "❌ AI Neon Cliché Violation (Q7): Cyan-to-purple gradient detected. Strip glowing gradients."
  exit 1
fi

# Step 3: Typography & Measure Verification (Q3)
if grep -rnE "text-2xl" ./src/**/*.html | grep -v "clamp"; then
  echo "⚠️ Warning (Q3): Fixed large headline detected without fluid clamp() expression."
fi

echo "✅ Automated Triage pre-flight passed. Complete manual visual checks (Q1, Q2, Q4, Q5, Q8, Q10)."
exit 0
```

---

## 6. Document Metadata & Verification Checklist

- **Skill**: `human-interface-design`
- **Specification ID**: `Feature 22 & Feature 23`
- **Standard Version**: `1.0.0 (Production Mastercraft)`
- **Cross-Reference Integrity**:
  - `references/organic-ui.md` (Features 4, 5, 6, 7, 8)
  - `references/color-psychology.md` (Features 9, 10, 11, 12)
  - `references/conversational-copy.md` (Features 13, 14, 15, 16, 17, 18)
  - `scripts/audit_copy.py` (Feature 24)
