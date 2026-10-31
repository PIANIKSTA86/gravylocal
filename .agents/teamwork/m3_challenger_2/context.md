# Milestone 3 Gate Verification: Challenger 2 (Cross-Tier Combinations & Real-World Scenarios)

## Mission
Adversarially stress-test cross-tier combinations and real-world scenarios affecting Milestone 3.

## Verification Scope
1. **Tier 3 Combinations**:
   - Run `test_tier3_combinations.py` and analyze pass/fail breakdown. Verify all M1-M3 combination tests pass:
     - `test_t3_01` (manifesto to organic UI and copy consistency)
     - `test_t3_02` (design token integration)
     - `test_t3_11` (dogfood copy audit on references)
     - `test_t3_12` (Spanish microcopy error recovery)
2. **Tier 4 Real-World Workload Scenarios**:
   - Run `test_tier4_scenarios.py` and verify all applicable scenarios pass:
     - Scenario 1 (SaaS Hero), Scenario 2 (FinTech), Scenario 3 (Telehealth), Scenario 4 (Creative Obsidian), Scenario 5 (E-commerce), Scenario 7-9 (CLI Audits), Scenario 10 (WCAG Palettes).
3. **Contrast & Math Stress**:
   - Mathematically verify contrast calculations for the 4 domain palettes (e.g. 4.5:1 for body text, 7:1 for AAA).
   - Check if dark mode surfaces satisfy monotonic elevation lightness ($L_0 < L_1 < L_2 < L_3 < L_4$).
4. Output verdict (`APPROVE` or `REQUEST_CHANGES`) with full logs in `handoff.md`.
