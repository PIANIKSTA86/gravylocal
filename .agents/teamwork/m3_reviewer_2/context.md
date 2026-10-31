# Milestone 3 Gate Verification: Reviewer 2 (Conversational Copywriting)

## Mission
Independently review `C:\Users\JULIAN\.gemini\config\skills\human-interface-design\references\conversational-copy.md` against requirements R3, Features 13–18, and E2E test assertions.

## Target Artifacts
- Target: `C:\Users\JULIAN\.gemini\config\skills\human-interface-design\references\conversational-copy.md`
- Original Request: `c:\Users\JULIAN\Desktop\GravyLocalTABS\.agents\teamwork\ORIGINAL_REQUEST.md`
- Master Plan: `c:\Users\JULIAN\Desktop\GravyLocalTABS\.agents\teamwork\PROJECT.md`
- Worker Handoff: `c:\Users\JULIAN\Desktop\GravyLocalTABS\.agents\teamwork\m3_worker\handoff.md`

## Review Checklist
1. **Feature 13 (The LLM Slop Blacklist)**:
   - Check blacklist covering 48+ banned buzzwords with linguistic categorization, contextual usage, and explicit ban rationale.
2. **Feature 14 (Cliché Search-and-Replace Dictionary)**:
   - Check mapping table with 24+ before/after pairs with Enterprise and Consumer tone variants and measurable metrics.
3. **Feature 15 (Staccato & Legato Cadence Tuning)**:
   - Gary Provost cadence rhythm principles, syllable count variation, punctuation dynamics, and practical cadence audits.
4. **Feature 16 (Value-First CTA Engineering)**:
   - First-person vs second-person perspective, concrete benefit formulas, friction reduction subcopy, mobile touch target sizes (>= 44px/48px), character limits (<= 40 chars).
5. **Feature 17 (Empathetic Microcopy & Error Recovery)**:
   - Three-part error formula: (1) what happened plainly, (2) why without blame, (3) 1-click recovery action.
   - Form field error inline binding (`aria-describedby`, `aria-invalid="true"`), masking technical stack traces, empty states with clear first actions.
6. **Feature 18 (Bilingual Cliché Adaptation EN & ES)**:
   - Spanish AI translation artifacts catalog ("sumérgete", "revoluciona", "empoderar", "sin fisuras", "a la vanguardia", "desata").
   - Calque elimination, tú vs usted register, 20-35% text expansion design allowances, inverted question/exclamation punctuation, natural gender neutrality.
7. **Execution Verification**:
   - Run: `py c:\Users\JULIAN\Desktop\GravyLocalTABS\.agents\teamwork\e2e_tests\run_tests.py --tier 1 --feature 13`
   - Run: `py c:\Users\JULIAN\Desktop\GravyLocalTABS\.agents\teamwork\e2e_tests\run_tests.py --tier 1 --feature 14`
   - Run: `py c:\Users\JULIAN\Desktop\GravyLocalTABS\.agents\teamwork\e2e_tests\run_tests.py --tier 1 --feature 15`
   - Run: `py c:\Users\JULIAN\Desktop\GravyLocalTABS\.agents\teamwork\e2e_tests\run_tests.py --tier 1 --feature 16`
   - Run: `py c:\Users\JULIAN\Desktop\GravyLocalTABS\.agents\teamwork\e2e_tests\run_tests.py --tier 1 --feature 17`
   - Run: `py c:\Users\JULIAN\Desktop\GravyLocalTABS\.agents\teamwork\e2e_tests\run_tests.py --tier 1 --feature 18`
   - Run: `py C:\Users\JULIAN\.gemini\config\skills\human-interface-design\scripts\audit_copy.py C:\Users\JULIAN\.gemini\config\skills\human-interface-design\references\conversational-copy.md`
8. Output verdict (`APPROVE` or `REQUEST_CHANGES`) in `handoff.md`.
