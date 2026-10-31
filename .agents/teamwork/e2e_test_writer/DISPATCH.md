## 2026-10-29T16:19:46Z

You are the E2E Test Suite Architect for the Antigravity skill `human-interface-design`.

Working directory: c:\Users\JULIAN\Desktop\GravyLocalTABS\.agents\teamwork\e2e_test_writer\
Original Request path: c:\Users\JULIAN\Desktop\GravyLocalTABS\.agents\teamwork\ORIGINAL_REQUEST.md
Project Plan path: c:\Users\JULIAN\Desktop\GravyLocalTABS\.agents\teamwork\PROJECT.md
Target Skill Directory: C:\Users\JULIAN\.gemini\config\skills\human-interface-design\
Test Suite Directory: c:\Users\JULIAN\Desktop\GravyLocalTABS\.agents\teamwork\e2e_tests\

Your mission:
Design and build an opaque-box, requirement-driven E2E test suite for the `human-interface-design` skill that validates all 24 features from PROJECT.md across 4 distinct tiers:
1. **Tier 1 - Feature Coverage**: ≥5 test assertions per feature (120+ assertions total) verifying isolated functionality, YAML frontmatter syntax, markdown headers, token definitions, blacklist dictionary presence, bilingual phrases, and script execution.
2. **Tier 2 - Boundary & Corner Cases**: ≥5 test assertions per feature verifying extreme conditions (empty files, missing frontmatter keys, invalid YAML, extreme viewport units, uncalibrated hex codes, zero-word inputs, unicode handling, max line lengths, reduced motion queries).
3. **Tier 3 - Cross-Feature Combinations**: Pairwise combination tests (e.g. bilingual copy in bento layouts, dark mode contrast on multi-layer shadows, script audit against generated examples, markdown link validity across all files).
4. **Tier 4 - Real-World Application Scenarios**: ≥12 realistic application-level scenarios (e.g. auditing and refactoring a SaaS hero section, auditing a fintech dashboard card, auditing a medical form, checking full script execution on test files).

Deliverables:
- Test infrastructure document: `c:\Users\JULIAN\Desktop\GravyLocalTABS\.agents\teamwork\TEST_INFRA.md` following the template in the orchestrator instructions.
- Test runner and test cases: `c:\Users\JULIAN\Desktop\GravyLocalTABS\.agents\teamwork\e2e_tests\run_tests.py` and test modules (pure Python 3, self-contained, no external dependencies, exit code 0 when all pass, clear fail output with tier and test name).
- Publication of `c:\Users\JULIAN\Desktop\GravyLocalTABS\.agents\teamwork\TEST_READY.md` containing the runner command, coverage summary table, and feature checklist.
- Detailed handoff report at `c:\Users\JULIAN\Desktop\GravyLocalTABS\.agents\teamwork\e2e_test_writer\handoff.md`.

Send a completion message back to the orchestrator once `TEST_READY.md` is published.
