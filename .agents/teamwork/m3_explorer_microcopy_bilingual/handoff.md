# Handoff Report: Microcopy, CTA Engineering & Bilingual Adaptation (Features 16, 17, 18)

**Agent:** `m3_explorer_microcopy_bilingual`  
**Milestone:** Milestone 3 — Color Psychology & Conversational Copy  
**Working Directory:** `c:\Users\JULIAN\Desktop\GravyLocalTABS\.agents\teamwork\m3_explorer_microcopy_bilingual\`  
**Target Specification File:** `C:\Users\JULIAN\.gemini\config\skills\human-interface-design\references\conversational-copy.md`  
**Recipient:** Orchestrator (`9eac7787-339d-48f5-a69c-a3a11783d614`)  
**Date:** 2026-10-29  

---

## 1. Observation

Direct inspection of the project requirements, architecture, test suite, and research artifacts revealed the following verified facts:

### 1.1 Original Request & Architectural Requirements
- **`ORIGINAL_REQUEST.md` (lines 18–20):**
  > `"R3. Psicología del Color y Marketing Digital: Incorporar directrices fundamentadas de psicología del color (armonía cromática, contraste funcional, paletas con intención emocional) y principios de marketing digital/copywriting (tono conversacional genuino, mensajes claros y eliminación de fórmulas o clichés recurrentes de modelos de lenguaje)."`
- **`PROJECT.md` Feature Inventory (lines 42–44):**
  - Feature 16: *Value-First CTA Engineering* (Action verb + tangible benefit + friction reducer formula).
  - Feature 17: *Empathetic Microcopy & Error Recovery* (Friendly error states, empty states, and onboarding hints with 1-click recovery).
  - Feature 18: *Bilingual Cliché Adaptation (EN & ES)* (Dual-language cliché catalogs covering typical Spanish and English AI translation artifacts).
- **Target File Contract (`PROJECT.md` lines 79, 108):**
  - Target path: `C:\Users\JULIAN\.gemini\config\skills\human-interface-design\references\conversational-copy.md`. Currently pending M3 implementation.

### 1.2 E2E Test Suite Assertions (Features 16, 17, 18)

Direct inspection of `e2e_tests/test_tier1_features.py`, `test_tier2_boundaries.py`, `test_tier3_combinations.py`, and `test_tier4_scenarios.py` revealed the exact programmatic assertions that the final `references/conversational-copy.md` must pass:

#### Feature 16: Value-First CTA Engineering
1. **`test_f16_cta_three_part_formula_documented` (`test_tier1_features.py`):**
   - Asserts content contains: `"action verb"` or `"tangible benefit"` or `"friction"` or `"cta"`.
2. **`test_f16_generic_cta_rejection` (`test_tier1_features.py`):**
   - Asserts content explicitly rejects generic CTAs: `"get started"` or `"submit"` or `"learn more"`.
3. **`test_f16_friction_reducer_microcopy_guidelines` (`test_tier1_features.py`):**
   - Asserts content provides friction-reducer patterns: `"friction"` or `"no credit card"` or `"cancel anytime"`.
4. **`test_f16_secondary_cta_low_commitment` (`test_tier1_features.py`):**
   - Asserts content specifies secondary low-commitment CTA patterns: `"secondary"` or `"demo"` or `"preview"`.
5. **`test_f16_concrete_humanized_cta_examples` (`test_tier1_features.py`):**
   - Matches regex: `r"['\"][A-Z][^'\"]*(?:free|trial|minutes|card|download|start)[^'\"]*['\"]"`.
6. **`test_f16_boundary_cta_character_length_limits` (`test_tier2_boundaries.py`):**
   - Asserts human CTA button labels stay under 40 characters (`len(good_cta) <= 40`).
7. **`test_f16_boundary_minimum_touch_target_size` (`test_tier2_boundaries.py`):**
   - Asserts content mentions accessible touch target size: `"44px"` or `"48px"` or `"touch"` or `"button"`.
8. **`test_f16_boundary_pricing_transparency_inclusion` (`test_tier2_boundaries.py`):**
   - Asserts encouragement of pricing transparency in CTAs: `"$"`, `"free"`, `"card"`.
9. **`test_f16_boundary_button_viewport_wrap_prevention` (`test_tier2_boundaries.py`):**
   - Asserts button wrapping guidance: `"wrap"` or `"whitespace-nowrap"` or `"button"`.
10. **`test_f16_boundary_form_state_reflection` (`test_tier2_boundaries.py`):**
    - Asserts state updates during interaction: `"state"` or `"disabled"` or `"loading"` or `"complete"`.
11. **`test_t3_07_value_first_cta_in_saas_hero_case_study` (`test_tier3_combinations.py`):**
    - Verifies case studies do not contain raw `>get started<` or `>submit<`.

#### Feature 17: Empathetic Microcopy & Error Recovery
1. **`test_f17_empathetic_error_formula_documented` (`test_tier1_features.py`):**
   - Asserts 3-part formula: `"what happened"` or `"how to fix"` or `"error"`.
2. **`test_f17_cold_system_dump_rejection` (`test_tier1_features.py`):**
   - Asserts rejection of cold technical errors: `"error 500"` or `"unexpected error"` or `"system dump"`.
3. **`test_f17_blame_shifting_rejection` (`test_tier1_features.py`):**
   - Asserts rejection of blame-shifting and infantile tropes: `"oops"` or `"blame"` or `"fault"`.
4. **`test_f17_actionable_one_click_recovery` (`test_tier1_features.py`):**
   - Asserts mandate for 1-click recovery actions: `"recovery"` or `"1-click"` or `"action"`.
5. **`test_f17_contextual_empty_state_guidelines` (`test_tier1_features.py`):**
   - Asserts contextual empty state guidance: `"empty state"` or `"no data"` or `"zero-data"`.
6. **`test_f17_boundary_actionable_recovery_button_required` (`test_tier2_boundaries.py`):**
   - Asserts error copy requires an actionable recovery path: `"recovery"` and (`"action"` or `"link"` or `"button"` or `"1-click"`).
7. **`test_f17_boundary_offline_connectivity_state` (`test_tier2_boundaries.py`):**
   - Asserts empathetic network/offline error patterns: `"offline"` or `"connection"` or `"retry"` or `"network"`.
8. **`test_f17_boundary_high_stress_domain_calmness` (`test_tier2_boundaries.py`):**
   - Asserts calm reassurance in high-stress domains: `"calm"` or `"reassurance"` or `"respect"` or `"stress"`.
9. **`test_f17_boundary_aria_describedby_error_binding` (`test_tier2_boundaries.py`):**
   - Asserts linking error messages to inputs using ARIA: `"aria-describedby"` or `"aria-invalid"`.
10. **`test_f17_boundary_security_stack_trace_masking` (`test_tier2_boundaries.py`):**
    - Prohibits leaking raw stack traces: `"stack trace"` or `"dump"` or `"internal"` or `"technical"`.
11. **`test_scenario_05_ecommerce_checkout_error_recovery` (`test_tier4_scenarios.py`):**
    - Verifies 1-click alternative recovery (e.g., fallback discount code) without "Oops!" or "Error 500".

#### Feature 18: Bilingual Cliché Adaptation (EN & ES)
1. **`test_f18_spanish_cliches_catalog_present` (`test_tier1_features.py`):**
   - Asserts catalog of Spanish AI clichés: `"empoderar"` or `"sin fisuras"` or `"español"` or `"spanish"`.
2. **`test_f18_translation_calques_documented` (`test_tier1_features.py`):**
   - Asserts documentation of translation calques: `"calque"` or `"traducción"` or `"translation"`.
3. **`test_f18_tu_vs_usted_tone_calibration` (`test_tier1_features.py`):**
   - Asserts guidance on register selection: `"tú"` or `"usted"` or `"pronombre"`.
4. **`test_f18_spanish_text_expansion_factor` (`test_tier1_features.py`):**
   - Asserts text expansion guidance: `"20%"` or `"30%"` or `"expansion"` or `"longitud"`.
5. **`test_f18_bilingual_side_by_side_examples` (`test_tier1_features.py`):**
   - Asserts side-by-side English and Spanish examples: `"english"` and `"spanish"`.
6. **`test_f18_boundary_spanish_unicode_and_accents` (`test_tier2_boundaries.py`):**
   - Asserts Unicode encoding/decoding of Spanish accents (`á`, `é`, `í`, `ó`, `ú`, `ñ`, `ü`).
7. **`test_f18_boundary_spanish_regex_word_boundaries` (`test_tier2_boundaries.py`):**
   - Matches Spanish slop in `scan_for_slop(..., lang="es")` using `BANNED_AI_WORDS_ES`:
     `{"empoderar", "empoderando", "sin fisuras", "desbloquear", "revolucionar", "transformar", "tapiz", "profundizar", "holístico", "holística", "de vanguardia", "sin precedentes", "potenciar al máximo", "navegar por el ámbito", "libera el potencial", "eleva tu"}`.
8. **`test_f18_boundary_container_auto_width_for_spanish` (`test_tier2_boundaries.py`):**
   - Advises flexible containers: `"width"` or `"expansion"` or `"w-auto"` or `"flex"`.
9. **`test_f18_boundary_inverted_punctuation_conventions` (`test_tier2_boundaries.py`):**
   - Asserts proper Spanish inverted punctuation marks: `"¿"` or `"¡"`.
10. **`test_f18_boundary_gender_neutral_ux_conventions` (`test_tier2_boundaries.py`):**
    - Promotes natural phrasing in Spanish UX: `"natural"` or `"inclusiv"` or `"español"` or `"spanish"`.
11. **`test_t3_01_bilingual_spanish_copy_in_bento_card` (`test_tier3_combinations.py`):**
    - Asserts bento containers and Spanish text expansion warnings.
12. **`test_t3_12_bilingual_translation_artifacts_in_error_recovery` (`test_tier3_combinations.py`):**
    - Asserts natural Spanish phrasing in error recovery.

---

## 2. Logic Chain

1. **Root Cause of AI Failure in CTAs, Microcopy & Localization:**
   - LLMs and generative UI platforms default to hyper-generic Call to Action buttons (*"Get Started"*, *"Submit"*, *"Click Here"*) because these phrases have the highest probability across millions of scraped landing pages. However, they force the user to perform cognitive extrapolation: *What happens when I click? Will I be charged? How long will it take?* This friction causes conversion drop-offs.
   - For error states, LLMs default to either cold technical dumps (*"Error 500: An unexpected error occurred"*) or childish, sycophantic tropes (*"Oops! Something went wrong! 🙈"*). Both fail the user: the former induces anxiety and confusion; the latter patronizes and shifts blame without offering a path forward.
   - In bilingual (EN to ES) generation, LLMs commit literal translation calques (*"Navega por el tapiz de tus finanzas"*, *"Una solución sin fisuras"*, *"Empodera tu flujo de trabajo"*). These sound robotic, alien, and ungrammatical to native Spanish speakers. Furthermore, AI models frequently ignore the **20% to 35% text expansion** of Spanish relative to English, causing layout truncation and ugly button wraps in rigid containers.

2. **De-biasing Feature 16 (Value-First CTA Engineering):**
   - Human CTAs eliminate cognitive anxiety by combining **[Action Verb] + [Tangible Benefit]** in the button label, anchored by a **[Friction Reducer]** microcopy subtext (e.g., *"Start 14-day free trial"* + *"No credit card required • Cancel in 2 clicks"*).
   - Strict ergonomic constraints are required: button labels must stay under 40 characters (`<=40 chars`), button heights must satisfy `min-height: 48px` (accessible touch targets), text must enforce `white-space: nowrap` inside flex containers to prevent awkward mobile wrapping, and state transitions (`idle` → `loading` → `success` → `disabled`) must provide continuous user feedback.

3. **De-biasing Feature 17 (Empathetic Microcopy & Error Recovery):**
   - Human error handling follows an empathetic 3-part formula:
     1. **What happened**: Jargon-free, calm description.
     2. **Why it happened**: Honest transparency without accusing the user or resorting to "Oops!".
     3. **How to fix it**: Mandatory 1-click recovery actions (e.g. fallback discount codes, offline draft preservation with auto-retry, instant retry links).
   - In high-stress domains (FinTech, Healthcare, E-commerce checkout), microcopy must prioritize emotional reassurance (confirming no money was lost, data was preserved, or appointment is pending).
   - Technical standards must be adhered to: masking raw stack traces for security, and binding errors to inputs via `aria-describedby` and `aria-invalid="true"`.

4. **De-biasing Feature 18 (Bilingual Cliché Adaptation EN & ES):**
   - A dedicated Spanish AI cliché blacklist and search-and-replace catalog must eradicate buzzwords (`empoderar`, `sin fisuras`, `tapiz`, `profundizar`, `holístico`, `de vanguardia`).
   - Tone calibration must establish clear rules for grammatical register: **"Tú"** for modern SaaS and consumer applications; **"Usted"** for formal banking and clinical medical contexts, enforcing strict internal consistency (never mixing registers).
   - Text expansion (20%–35%) must be codified with CSS responsive layout rules (`min-width`, `w-auto`, flexbox/grid auto-flow).
   - Strict adherence to native Spanish orthography: mandatory inverted punctuation (`¿` and `¡`), and natural gender-neutral phrasing using collective nouns and direct verbs rather than unpronounceable characters (`@`, `x`, `*`) that break screen readers.

---

## 3. Caveats

1. **Integration Division with `m3_explorer_copy`:**
   - Milestone 3 is partitioned across two copy specialists:
     - `m3_explorer_copy`: Features 13 (LLM Slop Blacklist), 14 (Search-and-Replace Dictionary), and 15 (Staccato & Legato Cadence).
     - `m3_explorer_microcopy_bilingual` (this agent): Features 16 (Value-First CTAs), 17 (Empathetic Microcopy & Error Recovery), and 18 (Bilingual Cliché Adaptation EN & ES).
   - Both sets of specifications belong in `references/conversational-copy.md`. The specifications developed in Section 4 below are designed to be dropped directly as Sections 5, 6, and 7 of `references/conversational-copy.md`.
2. **Read-Only Scope Compliance:**
   - In accordance with explorer rules, target skill files in `C:\Users\JULIAN\.gemini\config\skills\human-interface-design\` were NOT written directly. All recommendations are delivered via this report.
3. **Unicode & Character Encoding:**
   - All Spanish character sets (`¿`, `¡`, `á`, `é`, `í`, `ó`, `ú`, `ñ`, `ü`) must be saved in standard UTF-8 without BOM to preserve compatibility with `py` on Windows and Python's `read_text(encoding="utf-8")`.

---

## 4. Conclusion & Production-Ready Specifications

Below are the complete, production-grade specifications, lookup tables, CSS tokens, and implementation guidelines for Features 16, 17, and 18, formatted for direct insertion into `references/conversational-copy.md`.

---

### Section 5: Value-First CTA Engineering (Feature 16)

#### 5.1 The Value-First CTA Formula
AI models and generic UI libraries default to passive, lazy Call-to-Action labels: *"Get Started"*, *"Submit"*, *"Click Here"*, *"Learn More"*. These labels create cognitive drag: the user is forced to speculate about the cost, time commitment, and consequences of clicking.

Human interface engineering employs the **Three-Part Value-First CTA Formula**:

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                     THE VALUE-FIRST CTA FORMULA                             │
├─────────────────────────────────────────────────────────────────────────────┤
│  [ACTION VERB]  +  [TANGIBLE BENEFIT]  +  [FRICTION REDUCER MICROCOPY]      │
│                                                                             │
│  Examples:                                                                  │
│  • Primary Button: "Start your consultation ($35)"                         │
│    Friction Subtext: "Board-certified doctors • Average wait time: 8 mins"  │
│                                                                             │
│  • Primary Button: "Download for macOS (v3.4)"                              │
│    Friction Subtext: "Free 14-day trial • No credit card required"          │
│                                                                             │
│  • Primary Button: "Generate first invoice"                                │
│    Friction Subtext: "Takes ~45 seconds • Connects to Stripe & QuickBooks" │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### 5.2 Generic CTA Rejection & Transformation Matrix

Every generic button label must be replaced with a concrete action reflecting the user's immediate job-to-be-done:

| ❌ Generic AI CTA | Why It Fails | ✅ Humanized Value-First CTA | Accompanying Friction Reducer Microcopy |
|---|---|---|---|
| `Get Started` | Completely ambiguous. Does not clarify if it opens a sign-up modal, takes money, or starts a download. | `"Start free 14-day trial"` or `"Build your first board"` | `"No credit card required • 90-second setup"` |
| `Submit` | Cold, bureaucratic database command. Implies submission to authority. | `"Send message to Sarah"` or `"Confirm consultation ($35)"` | `"Encrypted & HIPAA-compliant • Cancel anytime"` |
| `Learn More` | Passive homework assignment. Signals a 2,000-word marketing wall. | `"See how the 2-click sync works"` or `"Read pricing breakdown"` | `"2-minute read • Interactive calculator included"` |
| `Sign Up Now` | Focuses on company's conversion goal rather than user value. | `"Claim your workspace"` or `"Create free account"` | `"Free for up to 5 team members • No credit card"` |
| `Buy Now` | High-friction psychological wall triggering buyer's remorse. | `"Get lifetime access ($59)"` | `"One-time payment • 30-day money-back guarantee"` |
| `Explore` | Aimless wandering. Lacks immediate utility. | `"Browse 120+ verified templates"` | `"Filter by industry • Free preview without login"` |

#### 5.3 Primary vs. Secondary Low-Commitment CTA Architecture
Never force a user into a binary "buy or leave" trap. High-performing human interfaces pair high-commitment primary actions with low-commitment secondary alternatives:

```html
<div class="cta-group">
  <!-- Primary High-Intent Action (10% Accent Fill) -->
  <button type="button" class="btn-primary">
    Start free 14-day trial
  </button>

  <!-- Secondary Low-Commitment Action (Ghost / Outline) -->
  <a href="#interactive-demo" class="btn-secondary">
    Explore live sandbox &rarr;
  </a>
</div>
<p class="cta-microcopy">
  No credit card required &bull; Takes 2 minutes &bull; Full API access included
</p>
```

**Secondary Low-Commitment Patterns:**
- Product Tour: `"Watch 2-minute product walkthrough"`
- Live Sandbox: `"Try interactive sandbox (no login required)"`
- Code / Specs: `"Inspect GitHub repository & docs"`
- Sample Output: `"Download sample generated report (PDF)"`

#### 5.4 Character Limits, Touch Targets & Viewport Wrapping
- **Character Length Limit**: Primary button labels must stay strictly under **40 characters** (recommended: 20–32 characters). Overlong button text reduces legibility and breaks on mobile. Detailed terms belong in subtext microcopy below the button.
- **Accessible Touch Target**: All clickable CTA surfaces must declare a minimum touch target of **44px × 44px** (iOS HIG) or **48px × 48px** (WCAG 2.5.5 / Android Material).
- **Viewport Wrapping Prevention**: Button labels must enforce `white-space: nowrap` within responsive flex containers to prevent ugly orphaned words on small viewports (320px–375px):

```css
.cta-group {
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.875rem;
}

.btn-cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 48px;
  min-width: 48px;
  padding: 0.75rem 1.5rem;
  font-size: 0.9375rem;
  font-weight: 550;
  white-space: nowrap;
  border-radius: 8px;
  text-decoration: none;
  cursor: pointer;
  transition: transform 120ms cubic-bezier(0.16, 1, 0.3, 1), background-color 150ms ease;
}

.btn-cta:active {
  transform: scale(0.98);
}

@media (max-width: 480px) {
  .cta-group {
    flex-direction: column;
    width: 100%;
  }
  .btn-cta {
    width: 100%;
  }
}
```

#### 5.5 Pricing Transparency in CTAs
Human CTAs build radical trust by stating prices upfront instead of hiding fees behind multi-step checkout gates:
- Transparent: `"Start consultation ($35 or copay)"`
- Transparent: `"Buy one-time license ($59) • No subscription"`
- Transparent: `"Free for teams up to 5 • $12/seat thereafter"`

#### 5.6 Dynamic Interaction States
A CTA button is not a static graphic; it communicates system status through distinct interaction phases:

| Interaction State | Visual Feedback | Copy Pattern | Accessibility Requirements |
|---|---|---|---|
| **Idle (Resting)** | Primary brand color, crisp contrast | `"Save invoice draft"` | `role="button"`, focus ring visible |
| **Hover** | 10% brightness shift, 1px lift | `"Save invoice draft"` | `:hover` styles, cursor: pointer |
| **Active (Press)** | Tactile compression: `scale(0.98)` | `"Save invoice draft"` | Hardware spring animation |
| **Loading / Submitting** | Inline spinner replaces icon | `"Saving draft..."` | `aria-busy="true"`, `aria-disabled="true"`, do not freeze layout |
| **Success / Complete** | Gentle green checkmark, brief dwell | `"Draft saved!"` | Dwell 1200ms before redirect; announce via `aria-live="polite"` |
| **Disabled** | Subdued contrast, no pointer | `"Save invoice draft"` | Provide tooltip or inline text explaining *why* disabled (e.g. *"Enter recipient email to enable save"*); do NOT use pure uncommunicative gray |

---

### Section 6: Empathetic Microcopy & Resilient Error Recovery (Feature 17)

#### 6.1 The Three-Part Empathetic Error Formula
Generic AI interfaces produce either terrifying raw system dumps (*"Error 500: An unexpected error occurred"*) or childish sycophancy (*"Oops! Something went wrong! 🙈"*). 

Human microcopy treats users as competent adults through the **Three-Part Empathetic Error Formula**:

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                 THE 3-PART EMPATHETIC ERROR FORMULA                         │
├─────────────────────────────────────────────────────────────────────────────┤
│  1. WHAT HAPPENED: Plain, human diagnosis in zero-jargon language.         │
│  2. WHY IT HAPPENED: Honest, transparent reason that NEVER blames the user.│
│  3. HOW TO FIX IT: Actionable 1-click recovery path with fallbacks.        │
│                                                                             │
│  Example:                                                                   │
│  "We couldn't connect to your Stripe account. Your API keys may have been   │
│   rotated or revoked. [Re-authenticate Stripe] or [Use manual invoice entry]│
└─────────────────────────────────────────────────────────────────────────────┘
```

#### 6.2 Banishment of Cold System Dumps & Blame-Shifting Tropes

| ❌ AI / Cold Antipattern | Why It Fails | ✅ Humanized Empathetic Error Message | Actionable 1-Click Recovery |
|---|---|---|---|
| `Error 500: An unexpected error occurred. Please contact support.` | Induces panic; gives zero insight into state of user data; leaves user stranded. | `"We couldn't generate your monthly report right now. Our servers encountered a temporary hiccup, but your underlying financial data is completely safe."` | `[Retry report generation]` or `[Download raw CSV export]` |
| `Oops! Something went wrong! 🙈` | Infantilizing, condescending, and dismissive of the user's valuable time. | `"We couldn't complete your order due to a payment processing delay."` | `[Retry card payment]` or `[Switch to PayPal]` |
| `You entered an invalid email address.` | Accusatory; shifts blame onto the user for formatting variations. | `"That email format looks a bit off (e.g., name@domain.com). Missing an '@' symbol?"` | Inline cursor auto-focus on mistake |
| `Error: Coupon code invalid.` | Frustrating dead end at the highest friction point of checkout. | `"We couldn't find the coupon code 'SUMMER50'. It expired yesterday (Oct 28th). Would you like to try 'FALL20' for 20% off?"` | `[Apply code FALL20 for 20% off]` |
| `Upload failed: Request payload too large.` | Exposes internal server architecture constraints without actionable solution. | `"'brand-assets.zip' is 68 MB. Our upload limit is 50 MB to ensure fast syncing across your team."` | `[Compress files with 1 click]` or `[Link from Google Drive]` |

#### 6.3 Contextual Empty States (Three Critical Scenarios)
Empty states must never display a sterile `"No data found."` or launch into juvenile party-popper cheerleading. Tailor empty states to the user's specific context:

1. **First-Time User (Onboarding / Zero Data):**
   - Welcoming, educational, sets realistic time expectations.
   - Example: *"No invoices yet. When you complete your first client milestone, click 'Create Invoice'—it takes about 45 seconds. [Create your first invoice]"*.
2. **User-Cleared State (Inbox Zero / Task Completed):**
   - Quiet satisfaction and calm reassurance.
   - Example: *"All caught up! You've reviewed all 18 customer tickets for today. No pending items in queue."*.
3. **Filtered / Search Zero State:**
   - Diagnostic clarity with immediate 1-click reset.
   - Example: *"No transactions matched the filter 'amount > $5,000' in October. [Clear all filters] or [Broaden date range to 90 days]"*.

#### 6.4 Offline Connectivity & Resilient Background Sync
Network dropouts are inevitable in real-world mobile and field environments. The interface must provide calm reassurance without blocking productivity:

```html
<!-- Floating Resilient Offline Toast / Banner -->
<aside class="offline-banner" role="status" aria-live="polite">
  <span class="offline-indicator" aria-hidden="true"></span>
  <div class="offline-content">
    <p class="offline-title">Working offline</p>
    <p class="offline-desc">
      Your draft is saved locally on your device. We'll automatically sync your 3 changes when your connection returns.
    </p>
  </div>
  <button type="button" class="btn-retry" onclick="triggerImmediateSync()">
    Retry now
  </button>
</aside>
```

#### 6.5 High-Stress Domain Calmness & Dignity
In FinTech, Healthcare, E-commerce, and Legal applications, system errors induce acute stress. 
- **Rule 1 (Preserve Capital & Data):** Always state explicitly that money was not deducted or medical data was preserved: *"Your card was not charged. We've reserved your consultation slot for the next 15 minutes."*
- **Rule 2 (Color Restraint):** Never flood the screen with aggressive neon red banners. Use warm terracotta (`#C85A32`) or grounded amber (`#D97706`) with high-contrast text.
- **Rule 3 (Dignity):** Respect the user's emotional state. Avoid jokes, memes, or cartoon mascots during billing failures or diagnostic errors.

#### 6.6 Accessibility & Security Protocols
- **ARIA Error Binding**: Every form validation error must link to its input via `aria-describedby` and set `aria-invalid="true"`:
  ```html
  <label for="user-email" class="form-label">Work email</label>
  <input 
    type="email" 
    id="user-email" 
    name="email" 
    class="form-input input-error" 
    aria-invalid="true" 
    aria-describedby="email-error-hint"
    value="julian@example"
  />
  <p id="email-error-hint" class="form-error-msg" role="alert">
    Looks like the domain is incomplete (e.g., julian@example.com).
  </p>
  ```
- **Security & Stack Trace Masking**: Client-facing error states must **never** leak raw stack traces, database schema details, SQL queries, internal IP addresses, or environment variables. Mask internal details behind a human-readable correlation reference:
  - *"We couldn't save your preferences right now. Our engineering team has been notified. Reference code: #PREF-8821. [Try again]"*.

---

### Section 7: Bilingual Cliché Adaptation (EN & ES) (Feature 18)

#### 7.1 The Spanish AI Cliché Blacklist & Humanization Catalog
Because LLMs are primarily trained on English corpora and translated via statistical alignment, Spanish AI copy is saturated with direct Anglicisms, literal calques, and corporate buzzwords. Below is the exhaustive reference catalog of Spanish AI clichés alongside natural Hispanic and Latin American phrasing:

| ❌ Banned Spanish AI Cliché | Why AI Generates It | Meaning / Calque Origin | ✅ Natural Human Spanish Alternative | Contextual Example in UI |
|---|---|---|---|---|
| `empoderar` / `empoderando` | Direct calque of English *"empower"*. Sounds pretentious and artificial in Spanish tech copy. | To give power / facilitate | *"Organiza"*, *"facilita"*, *"da el control a tu equipo"*, *"herramientas para"* | ❌ *"Empodera tu flujo de trabajo"*<br>✅ *"Organiza tu equipo en un solo lugar"* |
| `sin fisuras` | Direct literal translation of *"seamless"*. In Spanish, *"fisura"* refers to bone fractures or structural cracks. | Frictionless / integrated | *"Fluido"*, *"sin interrupciones"*, *"en un solo paso"*, *"directo"* | ❌ *"Una integración sin fisuras"*<br>✅ *"Conecta tus cuentas en 90 segundos"* |
| `tapiz` | Literal translation of LLM favorite *"tapestry"*. Extremely unnatural in business and software. | Complex overview / fabric | *"Resumen"*, *"panorama"*, *"vista general"*, *"panel"* | ❌ *"Un rico tapiz de datos financieros"*<br>✅ *"Tus ingresos y gastos en una sola vista"* |
| `desbloquear` | Calque of *"unlock"* (e.g. *"unlock your potential"*). In Spanish, sounds like unlocking a padlock or phone screen. | Enable / gain access | *"Descubre"*, *"activa"*, *"consigue"*, *"accede a"* | ❌ *"Desbloquea el poder de la analítica"*<br>✅ *"Descubre qué clientes pagan a tiempo"* |
| `revolucionar` | Calque of *"revolutionize"*. Cheap hyperbole lacking substance. | Radical change | *"Mejora"*, *"agiliza"*, *"moderniza"*, *"simplifica"* | ❌ *"Revoluciona tu facturación"*<br>✅ *"Facturación rápida para agencias"* |
| `transformar` | Generic corporate filler for *"transform"*. | Alter completely | *"Convierte"*, *"pasa de X a Y"*, *"reorganiza"* | ❌ *"Transforma tu negocio hoy"*<br>✅ *"Cobra en 48 horas, no en 30 días"* |
| `profundizar` | Literal translation of *"delve"*. Marker of ChatGPT academic tone. | Explore deeply | *"Revisa en detalle"*, *"analiza"*, *"conoce"* | ❌ *"Profundiza en tus métricas fiscales"*<br>✅ *"Revisa los números de este trimestre"* |
| `holístico` / `holística` | Calque of *"holistic"*. Vague pseudo-intellectual buzzword. | Comprehensive | *"Completo"*, *"integral"*, *"de principio a fin"* | ❌ *"Una solución holística para salud"*<br>✅ *"Atención médica completa desde casa"* |
| `de vanguardia` | Cliché translation of *"cutting-edge"*. Outdated 1990s marketing jargon. | Modern / advanced | *"Moderno"*, *"actualizado"*, *"avanzado"*, *"robusto"* | ❌ *"Tecnología de vanguardia"*<br>✅ *"Software rápido y sin caídas"* |
| `sin precedentes` | Calque of *"unparalleled / unprecedented"*. Unverifiable superlative. | Unrivaled | *"Destacado"*, *"único"*, o eliminar el adjetivo | ❌ *"Rendimiento sin precedentes"*<br>✅ *"Abre proyectos en 300 ms"* |
| `potenciar al máximo` | Cliché for *"supercharge / maximize"*. | Optimize | *"Aprovecha"*, *"saca más partido a"*, *"ahorra tiempo"* | ❌ *"Potencia al máximo tus ventas"*<br>✅ *"Cierra más presupuestos este mes"* |
| `navegar por el ámbito` | Horrible literal calque of *"navigate the realm of"*. | Deal with / manage | *"Gestionar"*, *"moverse por"*, *"explorar"* | ❌ *"Navega por el ámbito contable"*<br>✅ *"Gestiona tus impuestos sin errores"* |
| `libera el potencial` | Literal translation of *"unleash the potential"*. | Enable capability | *"Empieza a crear"*, *"pon en marcha"*, *"descubre"* | ❌ *"Libera el potencial de tu marca"*<br>✅ *"Crea logotipos vectoriales limpios"* |
| `eleva tu` | Calque of *"elevate your..."*. Empty escalator verb. | Improve | *"Mejora tu"*, *"optimiza"*, *"haz crecer"* | ❌ *"Eleva tu experiencia digital"*<br>✅ *"Una app rápida para tu día a día"* |

#### 7.2 Unnatural Translation Calques (Anglicisms to Eliminate)

| ❌ English Formulaic Cliché | ❌ Literal AI Translation Calque | ✅ Natural Spanish Phrasing (Human UI) |
|---|---|---|
| *"Where X meets Y"* | *"Donde la innovación se encuentra con la excelencia"* | *"Software de facturación para estudios de diseño"* |
| *"Say goodbye to X, say hello to Y"* | *"Dile adiós a las hojas de cálculo, dile hola al crecimiento"* | *"Deja de perseguir facturas impagadas manualmente"* |
| *"Click here for more information"* | *"Haga clic aquí para más información"* | *"Ver detalles y tarifas"* |
| *"Friction-free experience"* | *"Una experiencia libre de fricciones"* | *"Configuración lista en 2 minutos"* |
| *"Please enter your credentials"* | *"Por favor, introduzca sus credenciales"* | *"Escribe tu correo y contraseña"* |
| *"All-in-one platform to supercharge your team"* | *"La plataforma todo en uno para supercargar a tu equipo"* | *"El calendario de tu equipo, sin correos de ida y vuelta"* |

#### 7.3 Tone & Register Calibration: "Tú" vs. "Usted"
Spanish possesses grammatical registers that fundamentally alter the emotional distance of the interface:

- **The Informal Register ("Tú"):**
  - Standard for: SaaS, mobile apps, dev tools, e-commerce, consumer platforms, and tech startups across both Spain and Latin America.
  - Tone: Approachable, conversational, modern, collaborative.
  - Example: *"Guarda tus cambios antes de salir"* / *"¿Necesitas ayuda con tu pedido?"*.
- **The Formal Register ("Usted"):**
  - Reserved for: Private banking, asset management, clinical health diagnostics for elderly demographics, legal applications, and government tax interfaces.
  - Tone: Dignified, respectful, professional distance.
  - Example: *"Guarde sus cambios antes de salir"* / *"¿Requiere asistencia con su cuenta?"*.
- **The Golden Rule of Consistency:** Never mix registers within the same flow or component:
  - ❌ *Clash:* `"Guarda tus cambios y haga clic en continuar"` (Mixes *tus* [tú] with *haga* [usted]).
  - ✅ *Uniform Tú:* `"Guarda tus cambios y haz clic en continuar"`.
  - ✅ *Uniform Usted:* `"Guarde sus cambios y haga clic en continuar"`.

#### 7.4 Spanish Text Expansion Factor (20% to 35%)
Spanish UI copy naturally expands by **20% to 35% in length** compared to English source strings. Failing to anticipate this expansion causes broken layouts, clipped text, and awkward line breaks:

| English UI String | Length (EN) | Natural Spanish UI String | Length (ES) | Expansion Factor |
|---|:---:|---|:---:|:---:|
| `Settings` | 8 chars | `Configuración` | 13 chars | **+62%** |
| `View all` | 8 chars | `Ver todos` | 9 chars | **+12%** |
| `Search transactions` | 19 chars | `Buscar transacciones` | 20 chars | **+5%** |
| `Save changes` | 12 chars | `Guardar cambios` | 15 chars | **+25%** |
| `No credit card required` | 24 chars | `No requiere tarjeta de crédito` | 30 chars | **+25%** |
| `Download for macOS (v3.4)` | 24 chars | `Descargar para macOS (v3.4)` | 26 chars | **+8%** |
| `Start your consultation` | 23 chars | `Iniciar tu consulta médica` | 26 chars | **+13%** |

**Responsive CSS Rules for Spanish Expansion:**
1. Avoid fixed container widths (`width: 120px`). Use `min-width`, `max-content`, or flexbox auto-growth.
2. In Bento grids and cards, use `grid-template-columns: repeat(auto-fit, minmax(280px, 1fr))` rather than rigid fixed columns to allow Spanish strings to breathe.
3. Apply `white-space: nowrap` on CTA buttons alongside wrapping parent containers (`flex-wrap: wrap`) to prevent buttons from awkwardly breaking into multiple lines.

#### 7.5 Spanish Punctuation & Typography Conventions
- **Mandatory Inverted Marks (`¿` and `¡`):** In Spanish, interrogative and exclamatory phrases must open with inverted punctuation. Never drop them in UI headlines, confirmation dialogs, or helper copy:
  - ❌ *"Olvidaste tu contraseña?"* &rarr; ✅ *"¿Olvidaste tu contraseña?"*
  - ❌ *"Bienvenido a bordo!"* &rarr; ✅ *"¡Te damos la bienvenida!"*
  - ❌ *"Deseas eliminar este borrador?"* &rarr; ✅ *"¿Quieres eliminar este borrador?"*
- **Unicode Accent Fidelity:** All Spanish diacritics (`á`, `é`, `í`, `ó`, `ú`, `ñ`, `ü`) must be rendered accurately in UTF-8. Never strip accents to avoid font rendering bugs.

#### 7.6 Natural Gender-Neutral UX in Spanish
AI models frequently attempt to solve gender inclusivity in Spanish by inventing unpronounceable characters or symbols: `bienvenid@s`, `usuarixs`, `tod*s`, `amigues`. These typographical constructs violate Spanish syntax and severely break screen readers (which read *"usuari-arroba"* or *"usuari-equis"*).

Human Spanish UX achieves seamless neutrality through **natural syntactic restructuring**:

| ❌ Clunky AI Attempt | Flaw | ✅ Natural Human Restructuring | Syntactic Mechanism |
|---|---|---|---|
| `Bienvenido usuario` / `Bienvenid@` | Excludes women or breaks screen readers with `@`. | `"Te damos la bienvenida"` or `"Hola, [Nombre]"` | Verbal phrase / direct greeting |
| `El usuario debe confirmar su correo` | Unnecessary masculine singular noun. | `"Confirma tu correo para continuar"` | Direct imperative address |
| `Los doctores disponibles` | Assumes exclusively male physicians. | `"El equipo médico de guardia"` | Collective collective noun |
| `¿Estás seguro de que deseas salir?` | Gendered adjective (*seguro*). | `"¿Quieres cerrar sesión?"` or `"¿Confirmas que deseas salir?"` | Active verb construction |
| `Los desarrolladores pueden integrar...` | Masculine plural default. | `"Cualquier persona del equipo técnico puede integrar..."` | Epicene expression |

#### 7.7 Comprehensive Bilingual Side-by-Side Reference

| UI Component | English (Human Craft) | Spanish (Human Craft) | Domain Context |
|---|---|---|---|
| **Primary Hero CTA** | `"Start free 14-day trial"`<br><small>`No credit card required • Cancel anytime`</small> | `"Empieza tu prueba gratuita de 14 días"`<br><small>`Sin tarjeta de crédito • Cancela cuando quieras`</small> | B2B FinTech / SaaS |
| **Secondary Hero CTA** | `"Explore interactive sandbox &rarr;"` | `"Explora la demo interactiva &rarr;"` | B2B FinTech / SaaS |
| **Telehealth Intake CTA**| `"Start your consultation ($35)"`<br><small>`Average wait time: 8 mins`</small> | `"Iniciar tu consulta médica ($35)"`<br><small>`Tiempo de espera medio: 8 minutos`</small> | Healthcare |
| **Creative Tool CTA** | `"Download for macOS (v3.4)"`<br><small>`$59 one-time • No subscription`</small> | `"Descargar para macOS (v3.4)"`<br><small>`Pago único de $59 • Sin suscripciones`</small> | Creative Studio |
| **Coupon Code Error** | `"We couldn't find coupon code 'SAVE50'. It expired yesterday. [Try code FALL20 for 15% off]"` | `"El código 'SAVE50' ya no está activo; caducó ayer. [Aplicar código FALL20 con 15% de descuento]"` | E-Commerce Checkout |
| **Payment Network Error**| `"We couldn't reach your bank right now. Your card was not charged. [Retry payment] or [Use PayPal]"` | `"No pudimos conectar con tu banco en este momento. No te hemos cobrado nada. [Reintentar pago] o [Pagar con PayPal]"` | Checkout / High Stress |
| **File Upload Error** | `"'q3-report.pdf' exceeds our 50 MB limit. [Compress file with 1 click]"` | `"'informe-t3.pdf' supera el límite de 50 MB. [Comprimir archivo en 1 clic]"` | SaaS Productivity |
| **First-Time Empty State**| `"No invoices yet. When you complete a milestone, click 'Create Invoice'—it takes 45 seconds. [Create first invoice]"` | `"Aún no tienes facturas. Cuando completes un encargo, pulsa en 'Crear factura'—tardas menos de un minuto. [Crear primera factura]"` | Onboarding Dashboard |
| **Inbox Zero State** | `"All caught up! You've reviewed all 14 pull requests for today."` | `"¡Todo al día! Has revisado las 14 solicitudes de cambio pendientes."` | Developer Tools |
| **Filter Zero State** | `"No clients found matching 'overdue' in Madrid. [Clear all filters]"` | `"No hay clientes con cobros pendientes en Madrid. [Restablecer filtros]"` | CRM / Filter State |

---

## 5. Verification Method

To independently verify the completeness, correctness, and E2E test compliance of these specifications:

### 5.1 Programmatic Test Suite Execution
Execute the Python test runner against Tiers 1 through 4:

```powershell
# Verify Feature 16 (Value-First CTA Engineering)
py c:\Users\JULIAN\Desktop\GravyLocalTABS\.agents\teamwork\e2e_tests\run_tests.py --tier 1 --feature 16
py c:\Users\JULIAN\Desktop\GravyLocalTABS\.agents\teamwork\e2e_tests\run_tests.py --tier 2 --feature 16

# Verify Feature 17 (Empathetic Microcopy & Error Recovery)
py c:\Users\JULIAN\Desktop\GravyLocalTABS\.agents\teamwork\e2e_tests\run_tests.py --tier 1 --feature 17
py c:\Users\JULIAN\Desktop\GravyLocalTABS\.agents\teamwork\e2e_tests\run_tests.py --tier 2 --feature 17

# Verify Feature 18 (Bilingual Cliché Adaptation EN & ES)
py c:\Users\JULIAN\Desktop\GravyLocalTABS\.agents\teamwork\e2e_tests\run_tests.py --tier 1 --feature 18
py c:\Users\JULIAN\Desktop\GravyLocalTABS\.agents\teamwork\e2e_tests\run_tests.py --tier 2 --feature 18
```

### 5.2 Verification Checklist Crosswalk

| Test Method | Assertion Target | Section Reference in Spec | Verification Status |
|---|---|---|---|
| `test_f16_cta_three_part_formula_documented` | "action verb", "tangible benefit", "friction" | Section 5.1 | ✅ Covered |
| `test_f16_generic_cta_rejection` | Rejection of "Get Started", "Submit", "Learn More" | Section 5.2 | ✅ Covered |
| `test_f16_friction_reducer_microcopy_guidelines`| "friction", "no credit card", "cancel anytime" | Section 5.1, 5.2, 5.3 | ✅ Covered |
| `test_f16_secondary_cta_low_commitment` | "secondary", "demo", "preview" | Section 5.3 | ✅ Covered |
| `test_f16_concrete_humanized_cta_examples` | Quoted humanized CTAs ("free", "trial", "download")| Section 5.1, 5.2, 5.7 | ✅ Covered |
| `test_f16_boundary_cta_character_length_limits` | Button label <= 40 characters | Section 5.4 | ✅ Covered |
| `test_f16_boundary_minimum_touch_target_size` | 44px / 48px touch targets | Section 5.4 | ✅ Covered |
| `test_f16_boundary_pricing_transparency_inclusion`| Pricing in CTAs ("$", "free", "card") | Section 5.5 | ✅ Covered |
| `test_f16_boundary_button_viewport_wrap_prevention`| whitespace-nowrap and flex wrapping | Section 5.4 | ✅ Covered |
| `test_f16_boundary_form_state_reflection` | idle, loading, success, disabled states | Section 5.6 | ✅ Covered |
| `test_f17_empathetic_error_formula_documented` | "what happened", "how to fix", "error" | Section 6.1 | ✅ Covered |
| `test_f17_cold_system_dump_rejection` | Rejection of "Error 500", "unexpected error" | Section 6.2 | ✅ Covered |
| `test_f17_blame_shifting_rejection` | Rejection of "Oops!", blame shifting | Section 6.2 | ✅ Covered |
| `test_f17_actionable_one_click_recovery` | Mandatory 1-click recovery actions | Section 6.1, 6.2, 6.4 | ✅ Covered |
| `test_f17_contextual_empty_state_guidelines` | Onboarding, cleared, and filtered states | Section 6.3 | ✅ Covered |
| `test_f17_boundary_actionable_recovery_button_required`| Actionable recovery path required | Section 6.1, 6.2 | ✅ Covered |
| `test_f17_boundary_offline_connectivity_state` | Offline sync, draft caching, background retry | Section 6.4 | ✅ Covered |
| `test_f17_boundary_high_stress_domain_calmness` | Reassurance and dignity in FinTech/Health | Section 6.5 | ✅ Covered |
| `test_f17_boundary_aria_describedby_error_binding`| aria-describedby, aria-invalid="true" | Section 6.6 | ✅ Covered |
| `test_f17_boundary_security_stack_trace_masking` | Masking raw stack traces & correlation IDs | Section 6.6 | ✅ Covered |
| `test_f18_spanish_cliches_catalog_present` | empoderar, sin fisuras, español/spanish | Section 7.1 | ✅ Covered |
| `test_f18_translation_calques_documented` | Calques: "where X meets Y", "navega por el tapiz"| Section 7.2 | ✅ Covered |
| `test_f18_tu_vs_usted_tone_calibration` | "tú" vs "usted" register selection | Section 7.3 | ✅ Covered |
| `test_f18_spanish_text_expansion_factor` | 20% to 35% text expansion rules | Section 7.4 | ✅ Covered |
| `test_f18_bilingual_side_by_side_examples` | Side-by-side English and Spanish tables | Section 7.7 | ✅ Covered |
| `test_f18_boundary_spanish_unicode_and_accents`| Full UTF-8 accents (á, é, í, ó, ú, ñ, ü) | Section 7.5 | ✅ Covered |
| `test_f18_boundary_spanish_regex_word_boundaries`| Regex matches for Spanish slop list | Section 7.1 | ✅ Covered |
| `test_f18_boundary_container_auto_width_for_spanish`| Flexible container sizing, min-width, flex | Section 7.4 | ✅ Covered |
| `test_f18_boundary_inverted_punctuation_conventions`| Proper inverted marks (¿ and ¡) | Section 7.5 | ✅ Covered |
| `test_f18_boundary_gender_neutral_ux_conventions`| Natural gender-neutral phrasing without @/x | Section 7.6 | ✅ Covered |

### 5.3 Invalidation Conditions
- If any proposed CTA button exceeds 40 characters in label length.
- If any proposed error state uses patronizing "Oops!" or cold unhandled "Error 500" messages without a 1-click recovery path.
- If any Spanish translation utilizes blacklisted AI clichés (`empoderar`, `sin fisuras`, `tapiz`, `profundizar`) or artificial unpronounceable characters (`@`, `x`).
- If any proposed button layout uses hardcoded fixed pixel widths that clip 20%–35% Spanish text expansion.
