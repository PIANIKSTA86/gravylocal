## 2026-10-29T18:00:34Z
You are the Milestone 3 Implementer (Worker) for the Antigravity skill `human-interface-design`.

Working directory: c:\Users\JULIAN\Desktop\GravyLocalTABS\.agents\teamwork\m3_worker\
Original Request path: c:\Users\JULIAN\Desktop\GravyLocalTABS\.agents\teamwork\ORIGINAL_REQUEST.md
Project Plan path: c:\Users\JULIAN\Desktop\GravyLocalTABS\.agents\teamwork\PROJECT.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Exclusive Write Ownership:
You have exclusive write permission to:
- C:\Users\JULIAN\.gemini\config\skills\human-interface-design\references\color-psychology.md
- C:\Users\JULIAN\.gemini\config\skills\human-interface-design\references\conversational-copy.md
Do NOT modify any other files.

Input Specifications & Explorer Reports:
1. Color Psychology (Features 9, 10, 11, 12): Read the verified drop-in specification at c:\Users\JULIAN\Desktop\GravyLocalTABS\.agents\teamwork\m3_explorer_color\color_psychology_spec.md and handoff.md. Write this specification directly into `C:\Users\JULIAN\.gemini\config\skills\human-interface-design\references\color-psychology.md`.
2. Conversational Copywriting (Features 13, 14, 15): Read c:\Users\JULIAN\Desktop\GravyLocalTABS\.agents\teamwork\m3_explorer_copy\handoff.md.
3. Microcopy, CTAs & Bilingual (Features 16, 17, 18): Read c:\Users\JULIAN\Desktop\GravyLocalTABS\.agents\teamwork\m3_explorer_microcopy_bilingual\handoff.md.
Synthesize items 2 and 3 into the complete, authoritative `C:\Users\JULIAN\.gemini\config\skills\human-interface-design\references\conversational-copy.md`.

Implementation Details for `conversational-copy.md`:
- Section 1: Executive Overview & The Human Voice Philosophy.
- Section 2: The LLM Slop Blacklist (Feature 13: 40+ banned words with categories, rationale, and replacement cues).
- Section 3: The Production Search-and-Replace Dictionary (Feature 14: 24+ concrete before/after mappings with Enterprise vs Consumer tone calibrations).
- Section 4: Staccato & Legato Cadence Tuning (Feature 15: sentence length variation, 2-5 word punches vs 12-18 word descriptions, eliminating lecture tone).
- Section 5: Value-First CTA Engineering (Feature 16: Action Verb + Tangible Value + Friction Reducer formula, rejection of generic 'Get Started'/'Submit', touch target >= 44px, character ceiling <= 40 chars, pricing transparency, whitespace-nowrap).
- Section 6: Empathetic Microcopy & Error Recovery (Feature 17: friendly error states, empty states, onboarding hints with 1-click recovery actions).
- Section 7: Bilingual Cliché Adaptation (English & Spanish) (Feature 18: dual-language cliché catalogs, natural Spanish translations, eliminating calques).
- Section 8: Quick Sanity Checklist.

Verification Requirements:
Run verification commands using `run_command`:
1. `py c:\Users\JULIAN\Desktop\GravyLocalTABS\.agents\teamwork\e2e_tests\run_tests.py --tier 1 --feature 9`
2. `py c:\Users\JULIAN\Desktop\GravyLocalTABS\.agents\teamwork\e2e_tests\run_tests.py --tier 1 --feature 10`
3. `py c:\Users\JULIAN\Desktop\GravyLocalTABS\.agents\teamwork\e2e_tests\run_tests.py --tier 1 --feature 11`
4. `py c:\Users\JULIAN\Desktop\GravyLocalTABS\.agents\teamwork\e2e_tests\run_tests.py --tier 1 --feature 12`
5. `py c:\Users\JULIAN\Desktop\GravyLocalTABS\.agents\teamwork\e2e_tests\run_tests.py --tier 1 --feature 13`
6. `py c:\Users\JULIAN\Desktop\GravyLocalTABS\.agents\teamwork\e2e_tests\run_tests.py --tier 1 --feature 14`
7. `py c:\Users\JULIAN\Desktop\GravyLocalTABS\.agents\teamwork\e2e_tests\run_tests.py --tier 1 --feature 15`
8. `py c:\Users\JULIAN\Desktop\GravyLocalTABS\.agents\teamwork\e2e_tests\run_tests.py --tier 1 --feature 16`
9. `py c:\Users\JULIAN\Desktop\GravyLocalTABS\.agents\teamwork\e2e_tests\run_tests.py --tier 1 --feature 17`
10. `py c:\Users\JULIAN\Desktop\GravyLocalTABS\.agents\teamwork\e2e_tests\run_tests.py --tier 1 --feature 18`
11. `py c:\Users\JULIAN\Desktop\GravyLocalTABS\.agents\teamwork\e2e_tests\run_tests.py --tier 2` (features 9-18 boundary checks)
12. Dogfood: `python C:\Users\JULIAN\.gemini\config\skills\human-interface-design\scripts\audit_copy.py C:\Users\JULIAN\.gemini\config\skills\human-interface-design\references\color-psychology.md` and `references\conversational-copy.md` (verify score >= 80).

Document all test outputs in your handoff report at:
`c:\Users\JULIAN\Desktop\GravyLocalTABS\.agents\teamwork\m3_worker\handoff.md`.
Send a completion message back to the orchestrator.
