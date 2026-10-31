# Milestone 4 Exploration: Cases 2 & 3 (Dashboard Card & Multi-Step Form)

## Mission
Design the comprehensive blueprints for Feature 20 and Feature 21 in `examples/before-after-cases.md`.

## Deliverables & Technical Specifications
1. **Case Study 2: Dashboard / Bento Card (Feature 20)**:
   - Header: `# Case Study 2: E-Commerce / Analytics Dashboard Card`
   - Before: Symmetrical 3-column identical card grid with centered icons, generic "+12% growth", sterile white surfaces, and repetitive copy.
   - After: Asymmetrical Bento card with tactile depth (layered shadow, subtle 1px border), tabular numeric formatting (`font-variant-numeric: tabular-nums` or `tabular-nums`, formatted currency `$`), overflow and truncation handling (`text-overflow: ellipsis`, `truncate`), responsive states (hover, focus-visible, active depression `scale(0.97)`), ARIA accessibility attributes (`role`, `aria-label`), and dark mode styling tokens (`dark:`, `--bg-surface`).
2. **Case Study 3: Multi-Step Form & Error State (Feature 21)**:
   - Header: `# Case Study 3: Multi-Step Onboarding Form & Empathetic Error Recovery`
   - Before: Rigid sterile form with cold red borders, generic "Invalid input" or "Error 500", no auto-save, blame-shifting "Oops!" copy.
   - After: Conversational multi-step form with clear progress indication, accessible markup (`<label for="input-id">` explicitly pairing with `<input id="input-id">`), mobile attributes (`inputmode`, `type`, `autocomplete`), accessible error bindings (`aria-invalid="true"`, `aria-describedby="error-id"`), 3-part empathetic error message with 1-click recovery, privacy/permission reassurance microcopy (e.g. data encryption, no spam), and auto-save draft preservation.

## Handoff Requirements
Write a complete, ready-to-implement specification in:
`c:\Users\JULIAN\Desktop\GravyLocalTABS\.agents\teamwork\m4_explorer_cases2_3\handoff.md`.
