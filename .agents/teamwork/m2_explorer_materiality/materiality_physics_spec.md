# Proposed Section Specifications: Features 7 & 8 for `references/organic-ui.md`

This document contains the complete, production-ready markdown text, CSS tokens, and code snippets for:
- **Section 4: Tactile Materiality & Multi-Layer Lighting (Feature 7)**
- **Section 5: Physics-Based Microinteractions & Kinetics (Feature 8)**

These sections are authored to be dropped directly into `references/organic-ui.md` by the Milestone 2 integration worker.

---

## Section 4: Tactile Materiality & Multi-Layer Lighting (Feature 7)

### 4.1 The Physical Theory of Tactile Depth
The unmistakable hallmark of synthetic AI-generated UI is the **flat, dirty drop shadow** (`box-shadow: 0 4px 6px rgba(0,0,0,0.15)`). When machine learning models generate shadows, they treat depth as a single mathematical blur offset. In real-world optics, light scatters through ambient air, reflects off surrounding surfaces, and creates multi-layered gradients of occlusion. 

Furthermore, AI layouts exhibit **inconsistent light sources**: a card casts a shadow straight down (180°), an adjacent button glows uniformly in all directions (0°–360°), and an icon badge has an arbitrary top-right highlight (45°). This spatial incoherence subconsciously signals a fake, ungrounded environment to the human visual cortex.

Human craft establishes a **single virtual key light source originating from 120° (top-left)**, producing three coherent physical phenomena across all components:
1. **Top Specular Edge Highlights**: Microscopic bevels catching direct directional rays.
2. **Chromatic Multi-Layer Shadow Stacking**: A trio of contact occlusion, directional body shadow, and warm ambient bounce.
3. **Monotonic Elevation Surfaces**: Tangible physical elevation tiers from recessed wells to floating modals.

---

### 4.2 The 3-Layer Diffuse Shadow Stacking Architecture

Natural shadows have three distinct optical layers. Never use a single-layer harsh shadow. Instead, stack three comma-separated layers in `box-shadow`:

```
┌──────────────────────────────────────────────────────────────┐
│  LIGHT SOURCE (Key Light at 120° / Top-Left)                 │
│  ☀️                                                          │
│     \                                                        │
│      \  [ 1px Specular Bevel Highlight: inset 0 1px 0 ... ]  │
│       ┌──────────────────────────────────────────────┐       │
│       │               TACTILE SURFACE                │       │
│       └──────────────────────────────────────────────┘       │
│        ░░░ Layer 1: Contact Shadow (Tight AO, 1-2px)         │
│         ▒▒▒▒▒ Layer 2: Directional Body Shadow (6-16px)      │
│          ▓▓▓▓▓▓▓ Layer 3: Ambient Bounce Shadow (24-64px)    │
└──────────────────────────────────────────────────────────────┘
```

1. **Layer 1: Contact Shadow (Ambient Occlusion)**:
   - *Physics*: High-density occlusion right at the seam where the surface meets the canvas plane.
   - *Parameters*: Tight blur (1px–2px), negative spread (-1px), high opacity (0.40–0.60).
   - *Role*: Prevents the element from appearing to float detached like a sticker.
2. **Layer 2: Directional Body Shadow**:
   - *Physics*: The primary cast shadow projected along the 120° key light vector.
   - *Parameters*: Medium blur (4px–16px), Y-offset (2px–12px), moderate opacity (0.25–0.40).
   - *Role*: Communicates the element's actual elevation distance along the Z-axis.
3. **Layer 3: Ambient Bounce Shadow (Chromatic Tint)**:
   - *Physics*: Diffuse indirect light reflected back up from the canvas background.
   - *Parameters*: Wide blur (24px–64px), Y-offset (8px–32px), large negative spread (-4px to -8px), low opacity (0.15–0.25).
   - *Role*: Melts the shadow softly into the ambient atmosphere without muddy dark edges.

---

### 4.3 1px Specular Bevel Highlights

Physical hardware (machined aluminum, molded matte polymers, beveled glass) has micro-radii on its edges. An overhead key light creates a crisp, 1px highlight along the top rim:

- **Token Rule**: `inset 0 1px 0 0 rgba(255, 255, 255, 0.14)` (in dark mode) or `inset 0 1px 0 0 rgba(255, 255, 255, 0.85)` (in light mode).
- **Single Edge Constraint**: The specular highlight must strictly follow the top edge (`inset 0 1px 0`). Never apply highlights uniformly to all four edges (e.g., `box-shadow: 0 0 0 1px` or `inset 0 0 1px 1px`), which mimics a synthetic neon box rather than physical directional lighting.

---

### 4.4 The 6-Tier Tactile Elevation Scale (Levels -1 to 4)

| Elevation Level | Physical Metaphor | Usage Examples | CSS Shadow & Border Recipe |
|---|---|---|---|
| **Level -1** | Inset Recessed Well | Form text inputs, search fields, data table interiors, code blocks | `box-shadow: inset 0 2px 4px 0 hsla(220, 50%, 4%, 0.5), inset 0 0 0 1px var(--border-recessed);` |
| **Level 0** | Base Foundation Canvas | Application canvas, background backdrop | `box-shadow: 0px 0px 0px 0px transparent;` |
| **Level 1** | Grounded Resting Card | Dashboard bento tiles, feature cards, content containers | `box-shadow: 0 1px 2px -1px hsla(220, 40%, 4%, 0.4), 0 2px 5px 0 hsla(220, 30%, 6%, 0.25), inset 0 1px 0 0 rgba(255, 255, 255, 0.14);` |
| **Level 2** | Lifted Interactive Surface | Hovered cards, primary action buttons, active tab pills | `box-shadow: 0 2px 4px -1px hsla(220, 40%, 4%, 0.5), 0 6px 16px -2px hsla(220, 35%, 6%, 0.35), 0 12px 32px -4px hsla(220, 25%, 8%, 0.20), inset 0 1px 0 0 rgba(255, 255, 255, 0.14);` |
| **Level 3** | Floating Contextual Menu | Dropdown menus, popovers, select drawers, floating search bar | `box-shadow: 0 4px 8px -2px hsla(220, 40%, 4%, 0.6), 0 16px 36px -4px hsla(220, 35%, 6%, 0.45), 0 32px 64px -8px hsla(220, 25%, 8%, 0.35), inset 0 1px 0 0 rgba(255, 255, 255, 0.14);` |
| **Level 4** | Modal Dialogue / Sheet | System confirmation modals, command palettes (`Cmd+K`), sheets | `box-shadow: 0 8px 16px -4px hsla(220, 40%, 4%, 0.7), 0 24px 48px -6px hsla(220, 35%, 6%, 0.55), 0 48px 96px -12px hsla(220, 25%, 8%, 0.45), inset 0 1px 0 0 rgba(255, 255, 255, 0.14);` |

---

### 4.5 Dark Mode Shadow Adaptation & Monotonic Lightness Steps

In dark mode interfaces, drop shadows cast against dark canvas surfaces (`hsl(220, 16%, 9%)` or `#121214`) lose perceived optical contrast. A pure black shadow cannot be darker than an already dark background.

To maintain depth and tactile hierarchy in dark mode:
1. **Elevated Surface Tints (Monotonic Lightness)**: Express elevation by increasing surface lightness by 3%–5% per tier:
   - Canvas Foundation (`--surface-base`): `hsl(220, 16%, 9%)`
   - Resting Card Level 1 (`--surface-card`): `hsl(220, 13%, 16%)`
   - Lifted Surface Level 2 (`--surface-card-hover`): `hsl(220, 13%, 20%)`
   - Floating Overlay Level 3 (`--surface-overlay-solid`): `hsl(220, 12%, 24%)`
   - Modal Dialog Level 4 (`--surface-modal`): `hsl(220, 11%, 28%)`
2. **Tactile Structural Borders**: Reinforce surface edges using warm, subtle borders: `border: 1px solid hsla(220, 15%, 85%, 0.08);`.
3. **High-Contrast Mode Compatibility**: In operating systems with high-contrast accessibility active (`@media (forced-colors: active)`), box-shadows are suppressed. Ensure all interactive containers define an explicit semantic border (`border: 1px solid ButtonBorder` or `outline: 1px solid ButtonBorder`) so boundaries remain distinct.

---

### 4.6 The Glass Boundary Rule: Contextual Overlays vs. Solid Cards

AI-generated designs habitually apply universal glassmorphism (`backdrop-filter: blur(12px); background: rgba(255, 255, 255, 0.05);`) indiscriminately to cards, sidebars, and data tables. This produces washed-out surfaces, milky grays, and severe legibility degradation.

**The Strict Production Rule**:
- **Resting cards and data containers MUST be solid, tactile surfaces**: They provide guaranteed high contrast for dense operational data.
- **Glassmorphism is strictly restricted to floating contextual overlays**: Reserved only for sticky navigation headers, context dropdowns, and floating command palettes that temporarily overlay dynamic scrolling content.
- **Opacity Safety Floor**: Glass overlays must maintain a high background opacity (>= 0.50):
  - Dark mode overlay: `background: rgba(18, 20, 24, 0.82); backdrop-filter: blur(16px);` (or `bg-black/80`).
  - Light mode overlay: `background: rgba(255, 255, 255, 0.75); backdrop-filter: blur(16px);` (or `bg-white/75`).
  This opacity floor guarantees that typography comfortably satisfies WCAG 2.2 AA contrast standards (>= 4.5:1) regardless of whatever graphic or content passes underneath.

---

## Section 5: Physics-Based Microinteractions & Kinetics (Feature 8)

### 5.1 The Mechanical Easing Problem
Synthetic AI code relies on robotic linear or symmetric transitions: `transition: all 0.3s ease;` or generic `ease-in-out`. In physical reality, objects possess mass, friction, and inertia; they do not instantly accelerate and slowly coast to a stop along a symmetric curve.

Furthermore, AI buttons suffer from the **Lifeless Button Trap**: changing color on hover, but remaining static and unyielding when clicked. Tapping on screen without mechanical response feels like tapping on dead glass.

Human interfaces implement **authentic spring physics deceleration** and **tactile click depression**, grounding digital state transitions in hardware mechanics.

---

### 5.2 Non-Linear Spring Curves & Timing Tokens

```css
:root {
  /* ==========================================================================
     PHYSICS-BASED SPRING EASING CURVES
     ========================================================================== */
  /* Primary Snappy Deceleration: Fast initial impulse with smooth physical settle */
  --ease-spring-out:     cubic-bezier(0.16, 1, 0.3, 1);

  /* Playful Settle Spring: Gentle tactile overshoot for badges, toggles, indicators */
  --ease-spring-bounce:  cubic-bezier(0.34, 1.56, 0.64, 1);

  /* Instant Press Compression: Immediate mechanical hardware reaction */
  --ease-tactile-press:  cubic-bezier(0.2, 0, 0, 1);

  /* ==========================================================================
     MICROINTERACTION DURATION BOUNDS (<250ms)
     ========================================================================== */
  --duration-instant:    75ms;   /* Active click compression, toggle snap */
  --duration-snappy:     180ms;  /* Button hover, card lift, focus rings */
  --duration-deliberate: 220ms;  /* Dialog reveal, drawer expansion */
}
```

- **Curve Safety**: Both `--ease-spring-out` (x1=0.16, x2=0.30) and `--ease-spring-bounce` (x1=0.34, x2=0.64) strictly maintain cubic-bezier horizontal coordinates within `[0.0, 1.0]`.
- **Duration Boundary**: All interactive transitions are capped under 250ms (typically `150ms`–`180ms`). Durations exceeding 250ms introduce perceptual friction and make applications feel unresponsive.

---

### 5.3 Tactile Click Depression (`scale(0.97)` on `:active`)

When pressing a physical key switch, the component physically depresses into the chassis while its shadow collapses. We reproduce this tactile affordance in CSS:

```css
.tactile-button {
  background: hsl(222, 89%, 60%);
  color: #ffffff;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  border: 1px solid hsl(222, 89%, 68%);
  box-shadow: 
    0 1px 2px 0 hsla(220, 40%, 4%, 0.4),
    0 4px 12px 0 hsla(222, 89%, 60%, 0.35),
    inset 0 1px 0 0 rgba(255, 255, 255, 0.25);
  cursor: pointer;
  transform: translateY(0px) scale(1);
  transition: 
    transform var(--duration-snappy) var(--ease-spring-out),
    box-shadow var(--duration-snappy) var(--ease-spring-out);
}

/* Hover: subtle physical lift */
@media (hover: hover) and (pointer: fine) {
  .tactile-button:hover {
    transform: translateY(-1px) scale(1);
    box-shadow: 
      0 2px 4px -1px hsla(220, 40%, 4%, 0.5),
      0 6px 16px -2px hsla(222, 89%, 60%, 0.45),
      inset 0 1px 0 0 rgba(255, 255, 255, 0.30);
  }
}

/* Active: tactile click depression (mechanical spring compression) */
.tactile-button:active {
  transform: translateY(1px) scale(0.97);
  box-shadow: 
    0 1px 2px 0 hsla(220, 40%, 4%, 0.4),
    inset 0 1px 0 0 rgba(255, 255, 255, 0.15);
  transition-duration: var(--duration-instant);
  transition-timing-function: var(--ease-tactile-press);
}
```

- **Scale Bounds**: Active scale depression must remain within `scale(0.97)` to `scale(0.98)` (never below 0.94). Extreme scaling (>6% shrink) disorients eye focus and causes visual distortion.

---

### 5.4 Accessible Focus Rings with Distinct Offsets

Synthetic code frequently disables focus outlines (`outline: none`) without an accessible alternative, or applies a tight glow that clashes with rounded corners.

Human interfaces implement crystal-clear, non-obscuring `:focus-visible` rings:

```css
.tactile-button:focus-visible,
.interactive-card:focus-visible {
  outline: 2px solid hsl(222, 89%, 60%);
  outline-offset: 2px;
}
```

- **Offset Separation**: The 2px `outline-offset` keeps the focus indicator distinct from the element's border and specular top highlight, preventing visual collision.
- **Keyboard Intent**: Use `:focus-visible` rather than `:focus` so that mouse and touch taps do not generate persistent focus rings.

---

### 5.5 Layout Thrashing Prevention via GPU-Accelerated Compositing

Animating layout properties (`width`, `height`, `padding`, `margin`, `top`, `left`) triggers the browser's synchronous layout calculation (reflow) and repaint pipeline on every frame, generating stuttering and battery drain.

**The GPU Compositing Rule**:
- Microinteractions must animate **ONLY compositor properties**: `transform` and `opacity`.
- Compositor properties bypass the layout and paint stages entirely, executing directly on the GPU at 120 frames per second.

```css
/* ANTIPATTERN (Avoid): Triggers layout reflow */
.ai-modal-expand {
  transition: height 0.3s ease;
  height: 400px;
}

/* HUMAN CRAFT (Use): GPU-accelerated transform & opacity */
.human-modal-expand {
  transition: 
    transform var(--duration-snappy) var(--ease-spring-out),
    opacity var(--duration-snappy) ease-out;
  transform: translateY(0px) scale(1);
  opacity: 1;
}
```

---

### 5.6 Touch and Mobile Pointer Decoupling

On mobile touchscreen devices, `:hover` pseudo-classes trigger on tap and remain stuck ("sticky hover") even after the user lifts their finger. This confuses users and leads to stale visual states.

**Production Pointer Decoupling**:
- Wrap all hover elevation shifts inside `@media (hover: hover) and (pointer: fine)`.
- Apply `:active` tactile click compression universally across both touch and pointer inputs.

```css
/* Fine pointer (desktop mouse/trackpad): enable hover lift */
@media (hover: hover) and (pointer: fine) {
  .interactive-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px -2px hsla(220, 35%, 6%, 0.35), inset 0 1px 0 0 rgba(255, 255, 255, 0.14);
  }
}

/* Universal: tactile feedback on touch tap and mouse click */
.interactive-card:active {
  transform: scale(0.98);
  transition-duration: var(--duration-instant);
}
```

---

### 5.7 Vestibular Accessibility & `@media (prefers-reduced-motion)`

For users with vestibular motion disorders, inner-ear balance conditions, or motion sensitivity, spatial animations (scaling, sliding, bouncing) trigger real physical dizziness and disorientation.

Full compliance with WCAG 2.2 Success Criterion 2.3.3 requires a graceful zero-motion fallback:

```css
/* ==========================================================================
   VESTIBULAR ACCESSIBILITY: PREFERS-REDUCED-MOTION
   ========================================================================== */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }

  /* Graceful Degradation: Disable spatial movement, fallback to subtle opacity */
  .tactile-button,
  .interactive-card,
  .modal-dialog {
    transform: none !important;
    transition: opacity 150ms ease, background-color 150ms ease !important;
  }

  .tactile-button:active {
    transform: none !important;
    opacity: 0.85 !important;
  }
}
```

When reduced motion is enabled:
1. Spatial transforms (`scale()`, `translate()`, spring bounces) are disabled immediately (`transform: none !important`).
2. Interactive states degrade gracefully to gentle, non-disorienting `opacity` transitions.
3. System transitions execute instantaneously without blocking user workflows.
