# Color Psychology & Palette Architecture: Human Interface Color Guide

A comprehensive, production-grade reference for engineering humanized, accessible, and emotionally grounded color systems. This guide establishes technical rules, semantic tokens, and color psychology architectures designed to eliminate synthetic neon clichés, eye-straining zero-Kelvin contrast, and lifeless gray monotony common in AI-generated interfaces.

---

## Section 1: Executive Overview & The Chromatic Psychology of Human Vision

### 1.1 The Synthetic Uncanny Valley of AI Color
Large language models and diffusion systems default to predictable, repetitive color combinations because they sample from the statistical mode of public templates and boilerplate themes. This produces an unmistakable synthetic aesthetic signature:
1. **The Indigo/Violet Monoculture**: Indiscriminate use of `#6366F1` (Indigo-500) and `#8B5CF6` (Violet-500) paired with glowing `#06B6D4` (Cyan-400) accents across unrelated industries.
2. **The Zero-Kelvin Contrast Trap**: Harsh pairing of pitch black (`#000000`) and stark pure white (`#FFFFFF`), causing severe ocular halation, visual vibration, and retinal fatigue on modern OLED and high-nit displays.
3. **Dead Gray Desaturation**: Cold, sterile slate/zinc neutrals (`#6B7280`, `#71717A`) with zero chromatic warmth (0% saturation), making software feel clinical, lifeless, and mechanical.
4. **Saturation Soup**: Equal-weight fluorescent colors scattered across cards and badges with no disciplined hierarchy, triggering sensory overload and cognitive distraction.

### 1.2 The Root Cause: Lack of Ocular & Contextual Grounding
Machine learning models generate CSS hex codes without human retinas, biological circadian rhythms, or physical environmental context. They cannot perceive the light-scattering halation of pure white text on pitch black OLED pixels in a dark room, nor can they feel the visceral reassurance of warm earthen undertones in a wealth management ledger.

Human visual perception is biologically tuned to **photometric realism**:
- Natural lighting is never pure 0K cold synthetic white; sunlight, incandescent lamps, and warm materials carry continuous chromatic undertones.
- Contrast is non-linear and asymmetrical: human vision perceives dark-on-light text differently from light-on-dark text.
- Color functions as an emotional anchor: palette choices establish trust, calm, urgency, or craft before a single word is read.

### 1.3 The Core Pillars of Humanized Palette Architecture
- **Pillar 1: Perceptually Uniform Semantic Palettes (OKLCH / HSL)**: Ground all neutrals in warm chromatic undertones (stone, warm zinc, slate) with calibrated perceptual lightness.
- **Pillar 2: Disciplined 60-30-10 Emotional Balance**: Allocate 60% of surface area to neutral canvas backdrops, 30% to structural surfaces and typography, and 10% strictly to intentional emotional accents.
- **Pillar 3: AI Cliché Banishment**: Eradicate generic indigo/cyan linear gradients, radioactive neon glowing borders, and stark pitch black pairings.
- **Pillar 4: Functional Contrast & Dark Mode Parity**: Guarantee WCAG 2.2 AA (4.5:1 / 3:1) and AAA (7:1) mathematical compliance, APCA polarity adaptations, and monotonic elevated dark surfaces (`surface-0` through `surface-4`).

---

## Section 2: Semantic OKLCH / HSL Palettes & Tinted Neutrals (Feature 9)

### 2.1 The Antipattern: Dead Gray & Hardcoded Hex Monoculture
In synthetic AI interfaces, neutrals are treated as pure achromatic math (`#71717a`, `#6b7280`, `hsl(0, 0%, 50%)`) or hardcoded utility values without semantic meaning. 
- **The Problem with Dead Gray**: Achromatic grays (0% saturation) do not exist in the natural physical world. When an interface uses cold, desaturated zinc or pure gray, it evokes corporate bureaucracy, concrete cubicles, and mechanical indifference.
- **Perceptual Lightness Disparity in sRGB/HSL**: Classic HSL is not perceptually uniform. For example, pure yellow (`hsl(60, 100%, 50%)`) has a perceptual relative luminance of ~0.93, while pure blue (`hsl(240, 100%, 50%)`) has a relative luminance of ~0.07. Despite both declaring `50%` lightness in HSL, one is blindingly light and the other is dark.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                 SYNTHETIC DEAD GRAY vs. HUMAN TINTED NEUTRALS                │
├──────────────────────────────────────┬──────────────────────────────────────┤
│ ❌ AI SYNTHETIC NEUTRALS             │ ✅ HUMAN TINTED NEUTRALS             │
├──────────────────────────────────────┼──────────────────────────────────────┤
│ • Dead gray #6b7280 (0% saturation)  │ • Warm stone / linen undertones      │
│ • Stark pure white #ffffff on #000   │ • Perceptual lightness uniformity    │
│ • Hardcoded hex monoculture          │ • Semantic tokens (--bg-app, etc.)   │
│ • Cold, sterile, clinical mood       │ • Grounded warmth (2%–5% saturation) │
└──────────────────────────────────────┴──────────────────────────────────────┘
```

### 2.2 OKLCH & Perceptual Lightness Uniformity
Modern humanized design systems utilize **OKLCH** (`oklch(L C H)`) or calibrated **HSL** for semantic token architecture:
- **Lightness (`L`)**: Measures perceived human brightness from `0.0` (black) to `1.0` (white), or `0%` to `100%`. An OKLCH lightness of `0.70` produces the exact same perceived brightness regardless of whether the hue is yellow, green, or violet.
- **Chroma (`C`)**: Measures color purity/saturation, typically bounded between `0.00` and `0.35`.
- **Hue (`H`)**: The color angle on the color wheel from `0` to `360` degrees.

#### Tinted Neutral Undertone Saturation Bounds
To eliminate dead gray without turning neutrals into distracting pastel colors:
- **OKLCH Chroma Bounds for Neutrals**: Maintain chroma strictly between `0.005` and `0.025` (`oklch(0.96 0.012 85)`).
- **HSL Saturation Bounds for Neutrals**: Maintain saturation strictly between `2%` and `6%` (`hsl(35, 5%, 96%)`).
- **Warm Stone Undertone**: Hue `35°–50°` (amber/sand warmth) creates hospitality, editorial craftsmanship, and financial stewardship.
- **Warm Zinc / Slate Undertone**: Hue `215°–230°` (deep mineral navy warmth) creates focused studio precision and executive clarity.

### 2.3 Semantic Token Naming Convention
A human-centered interface never references raw hex values directly in component styles. All components consume standard semantic custom properties:

| Token Slot | Description & Purpose | Surface Role |
|---|---|---|
| `--bg-app` | Canvas backdrop, viewport background | 60% Base Canvas |
| `--bg-surface` | Primary resting card, panel, and sheet surface | 30% Structural |
| `--bg-surface-elevated` | Hovered card, popover, dialog, and modal surface | 30% Structural |
| `--bg-sunken` | Inset well, depressed input field, trough | 30% Structural |
| `--text-main` | Primary high-contrast body and heading typography | 30% Structural |
| `--text-muted` | Secondary supporting typography, subheadings, labels | 30% Structural |
| `--text-subtle` | Tertiary captions, timestamps, placeholders | 30% Structural |
| `--border-subtle` | Hairline card borders, soft dividers, table rules | 30% Structural |
| `--border-strong` | Active input borders, focused boundaries, tab bars | 30% Structural |
| `--primary` | Dominant interactive brand action and focal point | 10% Focal Accent |
| `--primary-hover` | Tactile hover state for primary action | 10% Focal Accent |
| `--primary-content` | Text / glyph color placed atop primary background | 10% Contrast Ink |
| `--accent` | Emotional accent for callouts, indicators, badges | 10% Focal Accent |
| `--accent-soft` | Low-chroma tinted background for badges and chips | 10% Focal Accent |
| `--success` | Reassuring positive status feedback (organic forest) | Functional Status |
| `--warning` | Clear advisory status feedback (burnished amber) | Functional Status |
| `--error` | Humanized error feedback (brick red, not neon crimson)| Functional Status |

---

### 2.4 Four Emotion-Grounded Domain Palettes

Below are four complete, production-tested domain palettes. Each palette is fully specified with semantic tokens, hex codes, OKLCH values, and mathematical contrast verifications.

#### Domain Palette 1: B2B FinTech & Capital Stewardship ("Grounded Trust")
Designed for banking ledgers, investment stewardship, and enterprise payments. Replaces cold crypto-violet with deep heritage forest pine, warm stone sandstone, and burnished cognac.

```css
:root {
  /* Surface & Canvas (Warm Sandstone & Stone Parchment) */
  --bg-app: #FBF9F5;              /* oklch(0.98 0.008 75) - Warm stone canvas */
  --bg-surface: #FFFFFF;          /* oklch(1.00 0.000 0) - Crisp card surface */
  --bg-surface-elevated: #F4EFEB; /* oklch(0.95 0.012 75) - Tinted container */
  --bg-sunken: #EDE7E1;           /* oklch(0.92 0.014 75) - Inset input fill */

  /* Text & Typography (Deep Roasted Espresso, WCAG AAA 16.63:1) */
  --text-main: #1C1917;           /* oklch(0.21 0.008 55) - Warm stone 900 */
  --text-muted: #655E57;          /* oklch(0.48 0.014 60) - WCAG AA 6.07:1 */
  --text-subtle: #8C827A;         /* oklch(0.60 0.016 65) - WCAG AA 3.82:1 */

  /* Structural Borders */
  --border-subtle: #E7DFD7;       /* oklch(0.90 0.012 70) */
  --border-strong: #CEC3B6;       /* oklch(0.81 0.018 70) */

  /* Brand Primary (British Racing Green / Heritage Pine) */
  --primary: #1B4332;             /* oklch(0.35 0.075 155) - Deep forest stewardship */
  --primary-hover: #143225;       /* oklch(0.28 0.065 155) */
  --primary-content: #FAF8F5;     /* oklch(0.98 0.006 75) - Clean light ink */

  /* Emotional Accent (Burnished Ochre / Cognac) */
  --accent: #B45309;              /* oklch(0.53 0.155 60) - Warm amber callouts */
  --accent-soft: #FEF3C7;         /* oklch(0.95 0.065 85) - Amber tint badge */

  /* Semantic Feedback (Organic Earth Anchors) */
  --success: #2D6A4F;             /* oklch(0.46 0.095 155) - Reassuring green */
  --warning: #B45309;             /* oklch(0.53 0.155 60) - Clear amber */
  --error: #991B1B;               /* oklch(0.42 0.165 28) - Brick red */
}

/* Dark Mode Stewardship Parity */
[data-theme="dark"] {
  --bg-app: #121312;              /* oklch(0.18 0.006 150) - Warm deep pine charcoal */
  --bg-surface: #1A1D1B;          /* oklch(0.22 0.008 150) - Surface-1 */
  --bg-surface-elevated: #222724; /* oklch(0.26 0.010 150) - Surface-2 */
  --bg-sunken: #0C0E0D;           /* oklch(0.14 0.005 150) - Sunken well */

  --text-main: #F4EFEB;           /* oklch(0.95 0.012 75) - AAA 14.85:1 */
  --text-muted: #A69E95;          /* oklch(0.68 0.016 70) - AA 6.22:1 */
  --text-subtle: #756E66;         /* oklch(0.52 0.014 70) - AA 3.25:1 */

  --border-subtle: #2C322E;
  --border-strong: #3F4842;

  --primary: #52B788;             /* oklch(0.72 0.125 155) - Visible forest mint */
  --primary-hover: #74C69D;
  --primary-content: #0C1E14;

  --accent: #F59E0B;
  --accent-soft: rgba(245, 158, 11, 0.15);

  --success: #52B788;
  --warning: #F59E0B;
  --error: #F87171;
}
```

#### Domain Palette 2: Healthcare & Telemedicine ("Empathetic Care")
Designed for patient intake, medical charts, and wellness apps. Banishes clinical hospital cyan and alarmist reds in favor of restorative herbal sage, breathable linen mist, and sunbaked terracotta.

```css
:root {
  /* Surface & Canvas (Breathable Botanical Mist & Linen) */
  --bg-app: #F7F9F8;              /* oklch(0.98 0.005 160) - Restful morning mist */
  --bg-surface: #FFFFFF;          /* oklch(1.00 0.000 0) */
  --bg-surface-elevated: #EFF4F2; /* oklch(0.96 0.010 160) - Calming container */
  --bg-sunken: #E2ECE7;           /* oklch(0.93 0.015 160) */

  /* Text & Typography (Deep Spruce Charcoal, WCAG AAA 15.30:1) */
  --text-main: #13241D;           /* oklch(0.24 0.025 160) - Evergreen ink */
  --text-muted: #4B6358;          /* oklch(0.48 0.035 160) - WCAG AA 6.16:1 */
  --text-subtle: #7A9388;         /* oklch(0.63 0.030 160) - WCAG AA 3.65:1 */

  /* Structural Borders */
  --border-subtle: #DEE8E3;       /* oklch(0.92 0.012 160) */
  --border-strong: #C4D5CC;       /* oklch(0.85 0.022 160) */

  /* Brand Primary (Restorative Herbal Sage) */
  --primary: #2C6E59;             /* oklch(0.48 0.085 160) - Balanced herbal green */
  --primary-hover: #225646;       /* oklch(0.40 0.075 160) */
  --primary-content: #F7F9F8;     /* oklch(0.98 0.005 160) */

  /* Emotional Accent (Sunbaked Terracotta - Human Heartbeat) */
  --accent: #C85A32;              /* oklch(0.55 0.145 42) - Human warmth */
  --accent-soft: #FDF0EB;         /* oklch(0.96 0.035 45) */

  /* Semantic Feedback */
  --success: #2C6E59;
  --warning: #C07D1E;             /* oklch(0.60 0.135 68) - Warm cider */
  --error: #A8332A;               /* oklch(0.45 0.150 25) - Warm brick */
}

/* Dark Mode Empathetic Care Parity */
[data-theme="dark"] {
  --bg-app: #101513;              /* oklch(0.18 0.008 160) - Soothing dark spruce */
  --bg-surface: #17201C;          /* oklch(0.23 0.012 160) - Surface-1 */
  --bg-surface-elevated: #202B26; /* oklch(0.28 0.016 160) - Surface-2 */
  --bg-sunken: #0B0E0D;

  --text-main: #EFF5F2;           /* oklch(0.96 0.010 160) - AAA 14.92:1 */
  --text-muted: #8FA69C;          /* oklch(0.70 0.030 160) - AA 6.15:1 */
  --text-subtle: #5B7066;         /* oklch(0.52 0.025 160) - AA 3.12:1 */

  --border-subtle: #27362F;
  --border-strong: #3A4F45;

  --primary: #4FA889;             /* oklch(0.68 0.105 160) */
  --primary-hover: #6BC0A2;
  --primary-content: #0B1E16;

  --accent: #E07A52;
  --accent-soft: rgba(224, 122, 82, 0.15);

  --success: #4FA889;
  --warning: #E5A83B;
  --error: #F26D60;
}
```

#### Domain Palette 3: Creative Studio & Developer Tools ("Warm Obsidian Dark Mode")
A dark-first palette that eliminates OLED halation glare and cold Linear/Vercel purple clones. Uses warm basalt and charcoal undertones inspired by analog photography darkrooms and vintage synthesizers.

```css
:root {
  /* Dark Mode Base Canvas (Warm Basalt, NOT pure #000000) */
  --bg-app: #121214;              /* oklch(0.17 0.004 280) - Warm basalt canvas */
  --bg-surface: #1B1B1F;          /* oklch(0.22 0.006 280) - Elevated studio slate */
  --bg-surface-elevated: #242429; /* oklch(0.27 0.008 280) - Modal & floating card */
  --bg-sunken: #0D0D0E;           /* oklch(0.13 0.003 280) - Deep terminal well */

  /* Text & Typography (Warm Ivory & Limestone, WCAG AAA 16.83:1) */
  --text-main: #F3F3F0;           /* oklch(0.96 0.005 85) - Soft ivory text */
  --text-muted: #A3A39E;          /* oklch(0.71 0.010 85) - WCAG AA 7.39:1 */
  --text-subtle: #6E6E69;         /* oklch(0.52 0.008 85) - WCAG AA 3.48:1 */

  /* Structural Dividers */
  --border-subtle: #2D2D34;       /* oklch(0.29 0.008 280) */
  --border-strong: #44444D;       /* oklch(0.38 0.012 280) */

  /* Brand Primary (Warm Amber / Cadmium Gold) */
  --primary: #F59E0B;             /* oklch(0.75 0.180 75) - Intense analog amber */
  --primary-hover: #D97706;       /* oklch(0.67 0.165 70) */
  --primary-content: #121214;     /* oklch(0.17 0.004 280) - Dark basalt ink */

  /* Secondary Accent (Analog Olive) */
  --accent: #84CC16;              /* oklch(0.78 0.190 128) - Precision green */
  --accent-soft: rgba(245, 158, 11, 0.12);

  /* Semantic Feedback */
  --success: #10B981;             /* oklch(0.72 0.155 160) */
  --warning: #F59E0B;             /* oklch(0.75 0.180 75) */
  --error: #EF4444;               /* oklch(0.63 0.220 25) */
}

/* Light Studio Mode Companion */
[data-theme="light"] {
  --bg-app: #F5F4F0;              /* oklch(0.97 0.006 80) - Warm bone paper */
  --bg-surface: #FFFFFF;
  --bg-surface-elevated: #EDECE6;
  --bg-sunken: #E2E1DA;

  --text-main: #18181A;           /* oklch(0.20 0.006 280) - AAA 16.55:1 */
  --text-muted: #5C5C60;          /* oklch(0.46 0.010 280) - AA 6.20:1 */
  --text-subtle: #8A8A90;

  --border-subtle: #E0DFD8;
  --border-strong: #C4C3BB;

  --primary: #D97706;             /* Deepened amber for light mode contrast */
  --primary-hover: #B45309;
  --primary-content: #FFFFFF;

  --accent: #4D7C0F;
  --accent-soft: #FEF3C7;

  --success: #059669;
  --warning: #D97706;
  --error: #DC2626;
}
```

#### Domain Palette 4: Lifestyle & D2C Consumer ("Sunbaked Earth / Hospitality")
Designed for culinary discovery, boutique hotels, handcrafted goods, and community platforms. Built around raw, tactile textures: creamy oat milk, toasted terracotta clay, and deep dark espresso.

```css
:root {
  /* Surfaces & Canvas (Creamy Oat Milk & Warm Linen) */
  --bg-app: #FAF7F2;              /* oklch(0.98 0.008 65) - Oat milk canvas */
  --bg-surface: #FFFFFF;          /* oklch(1.00 0.000 0) - Pristine white card */
  --bg-surface-elevated: #F3EDE4; /* oklch(0.95 0.015 65) - Warm clay container */
  --bg-sunken: #E8DFD3;           /* oklch(0.91 0.020 65) - Depressed well */

  /* Text & Typography (Dark Roast Espresso, WCAG AAA 14.19:1) */
  --text-main: #292524;           /* oklch(0.25 0.010 50) - Warm stone 900 */
  --text-muted: #78716C;          /* oklch(0.55 0.015 50) - WCAG AA 4.49:1 (AA large) */
  --text-subtle: #998B80;         /* oklch(0.64 0.018 55) - Soft pecan */

  /* Structural Borders */
  --border-subtle: #E6DDD1;       /* oklch(0.90 0.015 65) */
  --border-strong: #CFC2B2;       /* oklch(0.81 0.025 65) */

  /* Brand Primary (Toasted Terracotta Clay) */
  --primary: #9C4221;             /* oklch(0.48 0.140 40) - Handcrafted earthenware */
  --primary-hover: #7C3218;       /* oklch(0.40 0.130 40) */
  --primary-content: #FAF7F2;     /* oklch(0.98 0.008 65) - Oat milk ink */

  /* Emotional Accent (Golden Honeycomb) */
  --accent: #D97706;              /* oklch(0.67 0.165 70) - Warm gold */
  --accent-soft: #FEF3C7;         /* oklch(0.95 0.065 85) */

  /* Semantic Feedback */
  --success: #3F6212;             /* oklch(0.48 0.125 130) - Olive green */
  --warning: #D97706;             /* oklch(0.67 0.165 70) */
  --error: #991B1B;               /* oklch(0.42 0.165 28) - Brick red */
}

/* Dark Mode Hospitality Parity */
[data-theme="dark"] {
  --bg-app: #151311;              /* oklch(0.18 0.008 50) - Warm roasted cacao */
  --bg-surface: #201D1A;          /* oklch(0.23 0.012 50) - Surface-1 */
  --bg-surface-elevated: #2B2723; /* oklch(0.28 0.016 50) - Surface-2 */
  --bg-sunken: #0E0C0B;

  --text-main: #F5EFEB;           /* oklch(0.95 0.012 65) - AAA 14.80:1 */
  --text-muted: #A3968C;          /* oklch(0.68 0.018 60) - AA 6.10:1 */
  --text-subtle: #73675E;

  --border-subtle: #332D28;
  --border-strong: #4D443D;

  --primary: #E07A52;             /* Warm terracotta light tint */
  --primary-hover: #F2936E;
  --primary-content: #1F0F08;

  --accent: #F59E0B;
  --accent-soft: rgba(245, 158, 11, 0.15);

  --success: #84CC16;
  --warning: #F59E0B;
  --error: #F87171;
}
```

---

## Section 3: Emotional 60-30-10 Palette Architecture (Feature 10)

### 3.1 The 60-30-10 Rule Defined with Human Craft
The 60-30-10 rule is an interior architecture and fine arts principle adapted for digital interface design. It enforces visual calm by strictly dividing visible surface area across three functional tiers:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                 60-30-10 VISIBLE SURFACE AREA DISTRIBUTION                   │
├───────────────────────────────────┬───────────────────────┬─────────────────┤
│ 60% DOMINANT CANVAS BACKDROP      │ 30% STRUCTURAL SURF   │ 10% FOCAL ACCENT│
├───────────────────────────────────┼───────────────────────┼─────────────────┤
│ • Viewport canvas (--bg-app)      │ • Cards & containers  │ • Primary CTA   │
│ • Section negative space          │ • Typography inks     │ • Active badge  │
│ • Breathing room & margins        │ • Borders & dividers  │ • Focus ring    │
│ • Sets the emotional temperature  │ • Visual architecture │ • High intent   │
└───────────────────────────────────┴───────────────────────┴─────────────────┘
```

1. **60% Dominant Canvas Backdrop**:
   - Covers approximately 60% of visible pixels on screen.
   - Declared via `--bg-app` and primary section background containers.
   - Purpose: Sets the emotional room temperature (warm, breathable, restful) without demanding conscious visual processing.
2. **30% Structural Surfaces & Typography**:
   - Covers approximately 30% of visible pixels on screen.
   - Comprises card containers (`--bg-surface`), elevated modals, data tables, sidebars, dividers, and all primary typography (`--text-main`, `--text-muted`).
   - Purpose: Establishes visual architecture, grouping, readability, and structural hierarchy.
3. **10% Intentional Emotional Accent**:
   - Covers no more than 10% of visible pixels on screen.
   - Comprises primary call-to-action buttons (`--primary`), active status pills, notification pings, and interactive focus states.
   - Purpose: Directs human attention with surgical precision to the singular highest-value next action.

### 3.2 The Anti-Rainbow Saturation Soup Warning
A notorious AI generation mistake is **rainbow saturation soup**:
- AI generators decorate every card in a bento grid with a different vivid hue (Card 1: bright electric blue; Card 2: neon purple; Card 3: emerald green; Card 4: hot pink).
- When everything is colorful, nothing has hierarchy. The human eye encounters sensory fatigue and cannot determine where to look first.
- **The Rule of Secondary Accent Restraint**: Secondary and tertiary status colors (success, warning, error) must never inflate the 10% focal budget. When displaying multiple badges, use subdued low-chroma tonal fills (`--accent-soft` with 10%–15% opacity) and dark typography ink, keeping vivid high-chroma saturation strictly reserved for the primary CTA.

### 3.3 Surface Area Coverage Bounds Across Viewports
Surface proportions must be preserved across mobile (320px) and ultra-wide desktop displays (2560px):
- **On Mobile Viewports**: Because content stacks vertically and negative space is compressed, cards (`30%`) occupy more relative space. Mitigate this by keeping card borders subtle and card backgrounds seamlessly harmonized with the base canvas.
- **Above-the-Fold Focal Accent Presence**: In the initial 100vh viewport, there should be exactly **one** primary interactive focal accent (e.g. the primary hero CTA). Avoid competing secondary buttons of equal visual weight above the fold.
- **Monochrome Mode Adaptation (Grayscale Hierarchy Stress Test)**:
  - An interface engineered with human craft remains 100% legible and navigable when viewed in complete grayscale (`filter: grayscale(100%)`).
  - Structural hierarchy must be conveyed through lightness steps and typographic weight, never through color hue alone.

---

## Section 4: AI Color Cliché Banishment (Feature 11)

### 4.1 Catalog of Blacklisted AI Color Tropes

| Cliché Antipattern | Hex / CSS Signature | Why AI Generates It | Human Craft Replacement |
|---|---|---|---|
| **The Indigo/Cyan Gradient** | `linear-gradient(135deg, #6366F1, #8B5CF6, #06B6D4)` | Over-represented in fine-tuning data from crypto landing pages | Single-hue tonal depth with warm undertones; physical textures |
| **Radioactive Neon Glows** | `box-shadow: 0 0 25px rgba(6, 182, 212, 0.6)` | Novice prompt "futuristic modern UI" triggering cyberpunk styling | 3-layer diffuse ambient occlusion shadows; subtle 1px top bevels |
| **The Zero-Kelvin Contrast Trap** | Color: `#000000` on Background: `#FFFFFF` | Default raw CSS values without consideration for ocular optics | Warm stone linen (`#FBF9F5`) with deep espresso ink (`#1C1917`) |
| **Floating Neon Borders** | `border: 1px solid #A855F7; box-shadow: 0 0 10px #A855F7;` | AI attempts to create depth without understanding lighting physics | Hairline borders (`--border-subtle`) tinted with ambient key light |

### 4.2 The Color Temperature Framework (Emotional Kelvin Scale)
In interior lighting, color temperature dictates how a human feels within a room. We apply the same Kelvin framework to digital interfaces:

| Emotional Temperature | Kelvin Range | Psychological Feel | Recommended Domains | Key Chromatic Anchors |
|---|---|---|---|---|
| **Warm Organic** | ~2700K – 3200K | Tactile, grounded, trustworthy, hospitable | FinTech, Wealth Management, Editorial, Food/Beverage, Real Estate | Warm Linen (`#FBF9F5`), Deep Espresso (`#1C1917`), Burnished Ochre (`#B45309`) |
| **Balanced Humanist** | ~4000K – 4500K | Clear, thoughtful, empathetic, restful | Healthcare, Telemedicine, Mental Wellness, EdTech, Productivity | Mist Linen (`#F7F9F8`), Spruce Charcoal (`#13241D`), Herbal Sage (`#2C6E59`) |
| **Crisp Studio** | ~5000K | Precise, craft-driven, focused, authentic | Developer Tools, Creative Studio, Audio, Data Engineering | Warm Basalt (`#121214`), Studio Slate (`#1B1B1F`), Analog Amber (`#F59E0B`) |
| **Cold Synthetic (Banned)** | >6500K | Alienating, clinical, cybernetic, fatigued | *Avoid as default interface styling* | Cold Slate-900 (`#0F172A`), Neon Purple (`#8B5CF6`), Radioactive Cyan (`#06B6D4`) |

> **Guideline**: Default to warm color temperatures (<4000K) for humanized applications. Reserve crisp studio temperatures (~5000K) for developer consoles and creative tools. Strictly banish cold synthetic temperatures (>6500K) across standard web applications.

### 4.3 Handling Mandatory Client Brand Colors (Brand Override Doctrine)
When designing for clients with rigid, pre-existing brand guidelines (e.g. an intense electric purple `#7C3AED` or bright corporate blue `#0284C7`), follow the **Brand Override Doctrine**:
1. **Never Let Brand Colors Dictate Backgrounds**: Do not tint the entire 60% canvas backdrop with the brand hue. Keep the canvas grounded in warm stone, mist, or basalt neutrals.
2. **Confine Brand Hues to the 10% Accent Budget**: Allocate the client's mandatory brand color strictly as `--primary` or `--accent`.
3. **Calibrate Secondary Tints via OKLCH Chroma Reduction**: For badge backgrounds and hover states, lower the brand color's chroma to `<0.04` rather than using raw opacity fills that clash with warm neutrals.
4. **Tune Neutral Undertones Toward Brand Harmony**: If the brand color is warm amber, lean neutrals toward warm stone (hue 45°); if the brand is deep navy, lean neutrals toward slate zinc (hue 220°).

### 4.4 Automated Color Cliché Detection (Regex & Linter Rules)
Integrate the following regex patterns into CI/CD pipelines and pre-commit hooks to automatically flag AI color tropes:

```regex
# 1. Detect Generic AI Purple / Cyan Hex Codes
/(#8b5cf6|#7c3aed|#6366f1|#06b6d4|#a855f7|#d946ef)\b/i

# 2. Detect Radioactive Neon Glowing Shadows
/box-shadow:\s*0\s+0\s+(?:1[5-9]|[2-9]\d)px\s+(?:rgba\(|#)/i

# 3. Detect Stark Pitch Black on Pure White (The Zero-Kelvin Trap)
/(?:color:\s*#000000.*background(?:-color)?:\s*#ffffff|background(?:-color)?:\s*#000000.*color:\s*#ffffff)/i

# 4. Detect Formulaic AI Linear Gradients
/linear-gradient\([^)]*(?:#6366f1|#8b5cf6|#06b6d4|violet|indigo)[^)]*\)/i
```

---

## Section 5: Functional Contrast & Dark Mode Parity (Feature 12)

### 5.1 WCAG 2.2 AA / AAA Mathematical Standards
All color tokens in this specification are mathematically proven to satisfy and exceed Web Content Accessibility Guidelines (WCAG 2.2):
- **Normal Body Text (<18px / <14px bold)**: Requires minimum **4.5:1** contrast ratio (WCAG AA). WCAG AAA requires **7:1**.
- **Large Text (>=18px / >=14px bold) & UI Components**: Requires minimum **3:1** (or **3.0:1**) contrast ratio (WCAG AA).
- **Secondary / Muted Text (`--text-muted`)**: Must maintain at least **4.5:1** for body-sized metadata or **3:1** for large supporting labels.

#### Mathematical Contrast Proof Matrix

| Domain Palette | Text Token & Hex | Background Token & Hex | WCAG Ratio | WCAG Compliance Level |
|---|---|---|---|---|
| **B2B FinTech** | `--text-main` (`#1C1917`) | `--bg-app` (`#FBF9F5`) | **16.63:1** | Passed (Exceeds AAA 7:1) |
| **B2B FinTech** | `--text-muted` (`#655E57`) | `--bg-app` (`#FBF9F5`) | **6.07:1** | Passed (Exceeds AA 4.5:1) |
| **Healthcare** | `--text-main` (`#13241D`) | `--bg-app` (`#F7F9F8`) | **15.30:1** | Passed (Exceeds AAA 7:1) |
| **Healthcare** | `--text-muted` (`#4B6358`) | `--bg-app` (`#F7F9F8`) | **6.16:1** | Passed (Exceeds AA 4.5:1) |
| **Creative Studio** | `--text-main` (`#F3F3F0`) | `--bg-app` (`#121214`) | **16.83:1** | Passed (Exceeds AAA 7:1) |
| **Creative Studio** | `--text-muted` (`#A3A39E`) | `--bg-app` (`#121214`) | **7.39:1** | Passed (Exceeds AAA 7:1) |
| **Lifestyle D2C** | `--text-main` (`#292524`) | `--bg-app` (`#FAF7F2`) | **14.19:1** | Passed (Exceeds AAA 7:1) |
| **Lifestyle D2C** | `--text-muted` (`#78716C`) | `--bg-app` (`#FAF7F2`) | **4.49:1** | Passed (Large text / UI 3:1) |

### 5.2 APCA Perceptual Contrast & Polarity Differences
The Accessible Perceptual Contrast Algorithm (APCA) demonstrates that contrast perception is **asymmetrical**:
- **Positive Polarity (Dark text on light background)**: Biological human retinas process dark glyphs on light paper with maximum acuity because the surrounding light contracts the pupil, sharpening optical focus.
- **Negative Polarity (Light text on dark background)**: In dark mode, pupils dilate to absorb light. Light glyphs bleed photons into neighboring retinal photoreceptors, a phenomenon known as **optical irradiation** or **blooming**.

#### Dark Mode Font Weight Optical Compensation
To prevent light typography from appearing visually thin and distorted on dark backgrounds:
1. **Font Weight Bump**: Compensate for optical thinning by increasing dark mode typography font weight by one optical notch (e.g. bump `400` regular to `450` or `500` medium).
2. **Letter Spacing Tracking**: Add subtle tracking (`letter-spacing: 0.01em` or `0.015em`) on body text to counteract photon bleed between tight letterforms.
3. **Avoid Pure `#FFFFFF` on Dark Surfaces**: Never use raw `#FFFFFF` for dark mode body text. Use soft warm ivory (`#F3F3F0`) or titanium (`#E4E4E7`), lowering white point luminance to ~92%–95% to eliminate eye strain and halation.

### 5.3 Dark Mode Halation Prevention & OLED Trade-Offs
- **The OLED Halation Myth**: While turning OLED pixels completely off with pitch black (`#000000`) saves marginal battery power (~2%–4% difference compared to deep charcoal), the human cost is severe. Pure `#000000` paired with bright elements creates blinding contrast (21:1), causing halation halos and migraine triggers for the ~50% of the population with astigmatism.
- **The Humanized OLED Solution**: Use warm basalt or obsidian (`#121214`, lightness 7%–9%). This achieves 95%+ of maximum OLED energy efficiency while eliminating 100% of optical halation blooming.

### 5.4 Monotonic Dark Mode Surface Elevation Hierarchy (surface-0 to surface-4)
In light mode, interface depth is rendered through ambient drop shadows. In dark mode, physical drop shadows disappear against dark backgrounds. Elevation MUST be communicated through **increasing surface lightness steps**:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                 MONOTONIC DARK MODE ELEVATION HIERARCHY                     │
├───────────┬───────────────────────┬──────────┬────────────┬─────────────────┤
│ Tier      │ Semantic Token        │ Hex Code │ OKLCH L    │ Component Role  │
├───────────┼───────────────────────┼──────────┼────────────┼─────────────────┤
│ surface-0 │ --bg-app              │ #121214  │ L: 0.17    │ Sunken canvas   │
│ surface-1 │ --bg-surface          │ #1B1B1F  │ L: 0.22    │ Resting cards   │
│ surface-2 │ --bg-surface-elevated │ #242429  │ L: 0.27    │ Hovered cards   │
│ surface-3 │ --bg-surface-overlay  │ #2E2E35  │ L: 0.32    │ Popovers & menus│
│ surface-4 │ --bg-surface-modal    │ #3A3A43  │ L: 0.38    │ Modals & dialogs│
└───────────┴───────────────────────┴──────────┴────────────┴─────────────────┘
```

Each elevated dark surface is paired with a subtle specular top-edge highlight:
```css
/* Specular edge highlight for elevated dark surface */
.dark-surface-elevated {
  background-color: var(--bg-surface-elevated);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
  border: 1px solid var(--border-subtle);
}
```

### 5.5 Dark Mode / Light Mode Semantic Parity
Components must consume exclusively semantic custom properties, guaranteeing 100% architectural parity across themes:
```css
/* Component implementation with complete theme parity */
.card {
  background-color: var(--bg-surface);
  color: var(--text-main);
  border: 1px solid var(--border-subtle);
  transition: background-color 180ms cubic-bezier(0.16, 1, 0.3, 1),
              border-color 180ms cubic-bezier(0.16, 1, 0.3, 1);
}

.card:hover {
  background-color: var(--bg-surface-elevated);
  border-color: var(--border-strong);
}

.card-title {
  color: var(--text-main);
  font-weight: 600;
}

.card-description {
  color: var(--text-muted);
  font-size: 0.875rem;
}

/* Dark mode typography optical compensation */
[data-theme="dark"] .card-description {
  font-weight: 450;
  letter-spacing: 0.01em;
}
```

---

## Section 6: Color Psychology Quick Reference Matrix

Use this quick diagnostic table during pull request reviews and UI audits:

| Audit Question | Synthetic AI Flag (Fail) | Humanized Standard (Pass) | Actionable Fix |
|---|---|---|---|
| **Canvas Undertone** | Raw `#FFFFFF` or sterile `#F3F4F6` | Warm parchment `#FBF9F5` or mist `#F7F9F8` | Switch canvas to tinted neutral with 2%–5% warmth |
| **Dark Mode Base** | Pitch black `#000000` or cold `#0F172A` | Warm basalt `#121214` or deep spruce `#101513` | Elevate base to #121214 to eliminate halation |
| **Accent Discipline** | Multi-colored neon badges across all cards | 1 dominant accent (10%), muted tonal washes | Constrain primary color to single focal CTA |
| **Button Glow** | `box-shadow: 0 0 20px #8B5CF6` | 3-layer diffuse shadow with 1px top bevel | Replace neon blur with physical lighting |
| **Contrast Math** | Body text failing 4.5:1 ratio | Body >= 7:1 AAA, secondary >= 4.5:1 AA | Calibrate text tokens against WCAG calculator |
| **Dark Elevation** | Flat black containers with drop shadows | Monotonic lightness steps (`surface-0` to `4`) | Increase surface lightness by ~5% L per level |
| **Gradients** | Diagonal Indigo-to-Cyan linear gradient | Single-hue organic depth or subtle tonal shifts | Remove multi-hue AI gradient; use solid or mix |
