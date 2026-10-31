#!/usr/bin/env python3
"""
Milestone 3 Adversarial Verification & Stress Test Suite
Challenger Agent: m3_challenger_1
"""

import math
import os
import re
import sys
from pathlib import Path

# Add e2e_tests to sys.path
SCRIPT_DIR = Path(__file__).resolve().parent
REPO_ROOT = SCRIPT_DIR.parents[2]
TESTS_DIR = REPO_ROOT / ".agents" / "teamwork" / "e2e_tests"
sys.path.insert(0, str(TESTS_DIR))

import test_utils
from test_utils import (
    BANNED_AI_WORDS_EN,
    BANNED_AI_WORDS_ES,
    calculate_srgb_luminance,
    calculate_wcag_contrast,
    calculate_sentence_metrics,
    parse_hex_color,
    scan_for_slop,
)

TARGET_SKILL_DIR = Path(r"C:\Users\JULIAN\.gemini\config\skills\human-interface-design")
COLOR_PSYCH_MD = TARGET_SKILL_DIR / "references" / "color-psychology.md"
CONV_COPY_MD = TARGET_SKILL_DIR / "references" / "conversational-copy.md"

def test_markdown_code_fences(filepath: Path) -> dict:
    content = filepath.read_text(encoding="utf-8")
    lines = content.splitlines()
    fences = [i for i, line in enumerate(lines, 1) if line.strip().startswith("```")]
    is_even = len(fences) % 2 == 0
    return {
        "file": filepath.name,
        "total_fences": len(fences),
        "balanced": is_even,
        "fence_lines": fences,
    }

def test_markdown_tables(filepath: Path) -> dict:
    content = filepath.read_text(encoding="utf-8")
    lines = content.splitlines()
    in_code_block = False
    current_table = []
    tables = []
    
    for idx, line in enumerate(lines, 1):
        if line.strip().startswith("```"):
            in_code_block = not in_code_block
            continue
        if in_code_block:
            continue
        if line.strip().startswith("|") and line.strip().endswith("|"):
            current_table.append((idx, line))
        else:
            if current_table:
                tables.append(current_table)
                current_table = []
    if current_table:
        tables.append(current_table)
        
    table_issues = []
    for t_idx, tbl in enumerate(tables, 1):
        # Check column counts
        header_cols = len([c for c in tbl[0][1].split("|")[1:-1]])
        for line_num, row_str in tbl:
            cols = len([c for c in row_str.split("|")[1:-1]])
            if cols != header_cols:
                table_issues.append({
                    "table_idx": t_idx,
                    "line": line_num,
                    "expected_cols": header_cols,
                    "actual_cols": cols,
                    "row": row_str,
                })
    return {
        "file": filepath.name,
        "total_tables": len(tables),
        "issues": table_issues,
    }

def test_wcag_contrast_math() -> dict:
    content = COLOR_PSYCH_MD.read_text(encoding="utf-8")
    # Verify the claimed contrast ratios in Section 5.1 table
    # Pattern: | **Domain** | token (`hex1`) | token (`hex2`) | **ratio:1** |
    rows = re.findall(
        r"\|\s*\*\*([^*]+)\*\*\s*\|\s*`([^`]+)`\s*\(`(#[0-9a-fA-F]{6})`\)\s*\|\s*`([^`]+)`\s*\(`(#[0-9a-fA-F]{6})`\)\s*\|\s*\*\*([0-9.]+):1\*\*",
        content
    )
    results = []
    all_matched = True
    for domain, t1, hex1, t2, hex2, claimed_ratio_str in rows:
        calc_ratio = calculate_wcag_contrast(hex1, hex2)
        claimed_ratio = float(claimed_ratio_str)
        # Check delta <= 0.05
        diff = abs(calc_ratio - claimed_ratio)
        ok = diff <= 0.05
        if not ok:
            all_matched = False
        results.append({
            "domain": domain.strip(),
            "fg": f"{t1} ({hex1})",
            "bg": f"{t2} ({hex2})",
            "claimed": claimed_ratio,
            "calculated": calc_ratio,
            "diff": round(diff, 3),
            "match": ok,
        })
    return {
        "total_checked": len(results),
        "all_matched": all_matched,
        "details": results,
    }

def test_all_domain_palettes_wcag() -> dict:
    """Extract all CSS variable definitions and test contrast for all 4 palettes"""
    content = COLOR_PSYCH_MD.read_text(encoding="utf-8")
    # Find all domain palette blocks
    blocks = re.findall(r"(#### Domain Palette \d+:[^\n]+)(.*?)(?=(?:#### Domain Palette|\n## Section|\Z))", content, re.DOTALL)
    palette_results = []
    
    for title, block in blocks:
        # Extract :root (light) and [data-theme="dark"]
        root_match = re.search(r":root\s*\{(.*?)\}", block, re.DOTALL)
        dark_match = re.search(r'\[data-theme="dark"\]\s*\{(.*?)\}', block, re.DOTALL)
        if not dark_match:
            dark_match = re.search(r'\[data-theme="light"\]\s*\{(.*?)\}', block, re.DOTALL)
            
        def extract_vars(sub_block):
            if not sub_block:
                return {}
            vars_dict = {}
            for line in sub_block.group(1).splitlines():
                m = re.search(r"(--[a-z0-9\-]+):\s*(#[0-9a-fA-F]{3,6})", line)
                if m:
                    vars_dict[m.group(1)] = m.group(2)
            return vars_dict
            
        light_vars = extract_vars(root_match)
        dark_vars = extract_vars(dark_match)
        
        # Test light contrast
        light_body = None
        light_muted = None
        if "--text-main" in light_vars and "--bg-app" in light_vars:
            light_body = calculate_wcag_contrast(light_vars["--text-main"], light_vars["--bg-app"])
        if "--text-muted" in light_vars and "--bg-app" in light_vars:
            light_muted = calculate_wcag_contrast(light_vars["--text-muted"], light_vars["--bg-app"])
            
        # Test dark contrast
        dark_body = None
        dark_muted = None
        if "--text-main" in dark_vars and "--bg-app" in dark_vars:
            dark_body = calculate_wcag_contrast(dark_vars["--text-main"], dark_vars["--bg-app"])
        if "--text-muted" in dark_vars and "--bg-app" in dark_vars:
            dark_muted = calculate_wcag_contrast(dark_vars["--text-muted"], dark_vars["--bg-app"])
            
        # Test primary button contrast
        light_btn = None
        if "--primary" in light_vars and "--primary-content" in light_vars:
            light_btn = calculate_wcag_contrast(light_vars["--primary-content"], light_vars["--primary"])
            
        palette_results.append({
            "palette": title.strip(),
            "light_body_contrast": light_body,
            "light_muted_contrast": light_muted,
            "dark_body_contrast": dark_body,
            "dark_muted_contrast": dark_muted,
            "light_button_contrast": light_btn,
        })
        
    return palette_results

def test_css_blocks_syntax(filepath: Path) -> dict:
    content = filepath.read_text(encoding="utf-8")
    css_blocks = re.findall(r"```css\n(.*?)```", content, re.DOTALL)
    errors = []
    
    for idx, block in enumerate(css_blocks, 1):
        # Check brace balance
        opens = block.count("{")
        closes = block.count("}")
        if opens != closes:
            errors.append(f"Block {idx}: Mismatched braces ({{ = {opens}, }} = {closes})")
            
        # Check rule terminations inside rules
        rule_bodies = re.findall(r"\{([^}]+)\}", block, re.DOTALL)
        for r_body in rule_bodies:
            for line in r_body.splitlines():
                line_s = line.strip()
                if not line_s or line_s.startswith("/*") or line_s.endswith("*/") or line_s.startswith("*"):
                    continue
                # If it's a property declaration, it must end in ;
                if ":" in line_s and not line_s.endswith(";") and not line_s.endswith("{") and not line_s.endswith(","):
                    errors.append(f"Block {idx}: Declaration missing semicolon: '{line_s}'")
                    
    return {
        "file": filepath.name,
        "total_css_blocks": len(css_blocks),
        "errors": errors,
    }

def test_slop_in_humanized_replacements() -> dict:
    """Extract every 'After' column from Section 3.2 of conversational-copy.md and test for slop recurrence"""
    content = CONV_COPY_MD.read_text(encoding="utf-8")
    # Section 3.2 table: | Before | Category | After B2B | After Consumer | Metric |
    table_match = re.search(r"## Section 3:.*?### 3.2 The Master Search-and-Replace Dictionary.*?\n(\|.*?\n)\n\n", content, re.DOTALL)
    if not table_match:
        # Try alternate extraction
        table_lines = [l for l in content.splitlines() if l.strip().startswith("| *\"") or l.strip().startswith("|*\"")]
    else:
        table_lines = [l for l in table_match.group(1).splitlines() if l.strip().startswith("| *\"") or l.strip().startswith("|*\"")]
        
    b2b_slop_hits = []
    consumer_slop_hits = []
    tested_count = 0
    
    for row in table_lines:
        parts = [p.strip() for p in row.split("|")[1:-1]]
        if len(parts) >= 4:
            tested_count += 1
            before = parts[0]
            b2b_after = parts[2]
            consumer_after = parts[3]
            
            b2b_hits = scan_for_slop(b2b_after, lang="en")
            if b2b_hits:
                b2b_slop_hits.append({"row": tested_count, "before": before, "after": b2b_after, "hits": b2b_hits})
                
            cons_hits = scan_for_slop(consumer_after, lang="en")
            if cons_hits:
                consumer_slop_hits.append({"row": tested_count, "before": before, "after": consumer_after, "hits": cons_hits})
                
    # Also test Section 7.1 Spanish alternatives
    # In table: | ❌ Banned Spanish | Why AI | Meaning | ✅ Natural Alternative | Contextual Example |
    es_lines = [l for l in content.splitlines() if "`" in l and ("empoderar" in l or "sin fisuras" in l or "tapiz" in l or "desbloquear" in l)]
    es_slop_in_recommendations = []
    for line in es_lines:
        parts = [p.strip() for p in line.split("|")[1:-1]]
        if len(parts) >= 5:
            alt = parts[3]
            example = parts[4]
            # Check the ✅ part of example
            if "✅" in example:
                clean_example = example.split("✅")[1]
                hits = scan_for_slop(clean_example, lang="es")
                if hits:
                    es_slop_in_recommendations.append({"line": line, "hits": hits})
                    
    # Also test Section 7.7 Bilingual side-by-side
    bilingual_lines = [l for l in content.splitlines() if "| **" in l and "CTA" in l or "State" in l or "Error" in l]
    bilingual_slop = []
    for line in bilingual_lines:
        parts = [p.strip() for p in line.split("|")[1:-1]]
        if len(parts) >= 3:
            en_text = parts[1]
            es_text = parts[2]
            en_hits = scan_for_slop(en_text, lang="en")
            es_hits = scan_for_slop(es_text, lang="es")
            if en_hits or es_hits:
                bilingual_slop.append({"line": line, "en_hits": en_hits, "es_hits": es_hits})
                
    return {
        "mappings_tested": tested_count,
        "b2b_slop_hits": b2b_slop_hits,
        "consumer_slop_hits": consumer_slop_hits,
        "spanish_clean_example_slop": es_slop_in_recommendations,
        "bilingual_slop": bilingual_slop,
    }

def test_cadence_variance_math() -> dict:
    content = CONV_COPY_MD.read_text(encoding="utf-8")
    
    # 1. Antipattern 1 synthetic example:
    synth_match = re.search(r"Synthetic Example \(AI Drone\):\s*\n\s*>\s*\"([^\"]+)\"", content)
    synth_metrics = calculate_sentence_metrics(synth_match.group(1)) if synth_match else None
    
    # 2. Humanized Refactor:
    human_match = re.search(r"Humanized Refactor \(Dynamic Staccato & Legato Cadence\):\s*\n\s*>\s*\"([^\"]+)\"", content)
    human_metrics = calculate_sentence_metrics(human_match.group(1)) if human_match else None
    
    return {
        "synthetic_metrics": synth_metrics,
        "human_metrics": human_metrics,
        "human_std_dev_ge_4": human_metrics["std_dev"] >= 4.0 if human_metrics else False,
    }

def test_cta_length_bounds() -> dict:
    content = CONV_COPY_MD.read_text(encoding="utf-8")
    # Find all primary CTA quotes
    cta_quotes = re.findall(r'["\']([A-Z][^"\']*(?:free|trial|demo|consultation|download|invoice|account|changes|nowrap|Start|Build|Send|Confirm|Claim|Get)[^"\']*)["\']', content)
    over_40 = []
    valid_ctas = []
    for cta in cta_quotes:
        # Ignore long prose quotes
        if len(cta.split()) <= 8 and len(cta) < 100:
            if len(cta) > 40:
                over_40.append(cta)
            else:
                valid_ctas.append((cta, len(cta)))
    return {
        "total_sampled_ctas": len(valid_ctas) + len(over_40),
        "valid_ctas_under_40": len(valid_ctas),
        "ctas_over_40": over_40,
    }

def test_spanish_text_expansion_math() -> dict:
    content = CONV_COPY_MD.read_text(encoding="utf-8")
    # Section 7.4 expansion table: | `EN` | N chars | `ES` | M chars | **+X%** |
    table_rows = re.findall(r"\|\s*`([^`]+)`\s*\|\s*(\d+)\s*chars\s*\|\s*`([^`]+)`\s*\|\s*(\d+)\s*chars\s*\|\s*\*\*([^\*]+)\*\*", content)
    verified = []
    all_accurate = True
    for en_str, en_len, es_str, es_len, exp_str in table_rows:
        actual_en = len(en_str)
        actual_es = len(es_str)
        stated_en = int(en_len)
        stated_es = int(es_len)
        exp_pct = round(((actual_es - actual_en) / actual_en) * 100)
        en_ok = (actual_en == stated_en)
        es_ok = (actual_es == stated_es)
        if not (en_ok and es_ok):
            all_accurate = False
        verified.append({
            "en": en_str, "stated_en": stated_en, "actual_en": actual_en,
            "es": es_str, "stated_es": stated_es, "actual_es": actual_es,
            "calculated_expansion": f"+{exp_pct}%",
            "stated_expansion": exp_str,
            "counts_match": en_ok and es_ok
        })
    return {
        "total_rows": len(verified),
        "all_counts_match": all_accurate,
        "details": verified
    }

def main():
    print("=" * 70)
    print(" EMPIRICAL ADVERSARIAL STRESS TEST SUITE: MILESTONE 3")
    print("=" * 70)
    
    # 1. Code Fence Parity
    print("\n--- 1. Markdown Code Fence Parity ---")
    fence_color = test_markdown_code_fences(COLOR_PSYCH_MD)
    fence_copy = test_markdown_code_fences(CONV_COPY_MD)
    print(f"color-psychology.md: {fence_color['total_fences']} fences | Balanced: {fence_color['balanced']}")
    print(f"conversational-copy.md: {fence_copy['total_fences']} fences | Balanced: {fence_copy['balanced']}")
    
    # 2. Markdown Table Column Integrity
    print("\n--- 2. Markdown Table Structural Integrity ---")
    tbl_color = test_markdown_tables(COLOR_PSYCH_MD)
    tbl_copy = test_markdown_tables(CONV_COPY_MD)
    print(f"color-psychology.md: {tbl_color['total_tables']} tables | Column Issues: {len(tbl_color['issues'])}")
    print(f"conversational-copy.md: {tbl_copy['total_tables']} tables | Column Issues: {len(tbl_copy['issues'])}")
    
    # 3. WCAG Contrast Math Verification
    print("\n--- 3. WCAG Contrast Mathematical Proof Matrix ---")
    wcag_res = test_wcag_contrast_math()
    print(f"Table Entries Checked: {wcag_res['total_checked']} | All Match Proofs: {wcag_res['all_matched']}")
    for d in wcag_res["details"]:
        status = "PASS" if d["match"] else "FAIL"
        print(f"  [{status}] {d['domain']} | {d['fg']} vs {d['bg']} -> Claimed: {d['claimed']}:1, Calculated: {d['calculated']}:1 (diff: {d['diff']})")
        
    # 4. Domain Palettes Contrast Verification
    print("\n--- 4. Four Domain Palettes Contrast Calculations ---")
    pal_res = test_all_domain_palettes_wcag()
    for p in pal_res:
        print(f"  * {p['palette']}")
        print(f"    - Light Mode Body: {p['light_body_contrast']}:1 (>= 7.0: AAA), Muted: {p['light_muted_contrast']}:1 (>= 3.0: AA large)")
        print(f"    - Dark Mode Body:  {p['dark_body_contrast']}:1 (>= 7.0: AAA), Muted: {p['dark_muted_contrast']}:1 (>= 3.0: AA large)")
        print(f"    - Light CTA Button: {p['light_button_contrast']}:1 (>= 4.5: AA)")
        
    # 5. CSS Syntax & Token Grammar
    print("\n--- 5. CSS Blocks Syntax & Token Grammar ---")
    css_color = test_css_blocks_syntax(COLOR_PSYCH_MD)
    css_copy = test_css_blocks_syntax(CONV_COPY_MD)
    print(f"color-psychology.md: {css_color['total_css_blocks']} CSS blocks | Errors: {css_color['errors']}")
    print(f"conversational-copy.md: {css_copy['total_css_blocks']} CSS blocks | Errors: {css_copy['errors']}")
    
    # 6. Slop Recursion Scanner on Recommended Copy
    print("\n--- 6. Slop Recursion Scanner on Recommended Replacements ---")
    slop_res = test_slop_in_humanized_replacements()
    print(f"Section 3.2 Mappings Tested: {slop_res['mappings_tested']}")
    print(f"B2B After Slop Violations: {len(slop_res['b2b_slop_hits'])}")
    print(f"Consumer After Slop Violations: {len(slop_res['consumer_slop_hits'])}")
    print(f"Spanish Clean Example Slop Violations: {len(slop_res['spanish_clean_example_slop'])}")
    print(f"Bilingual Side-by-Side Slop Violations: {len(slop_res['bilingual_slop'])}")
    if slop_res["b2b_slop_hits"]:
        print(f"  B2B Hits: {slop_res['b2b_slop_hits']}")
    if slop_res["consumer_slop_hits"]:
        print(f"  Consumer Hits: {slop_res['consumer_slop_hits']}")
    if slop_res["spanish_clean_example_slop"]:
        print(f"  Spanish Hits: {slop_res['spanish_clean_example_slop']}")
    if slop_res["bilingual_slop"]:
        print(f"  Bilingual Hits: {slop_res['bilingual_slop']}")
        
    # 7. Cadence Variance Math
    print("\n--- 7. Sentence Cadence Standard Deviation Math ---")
    cad_res = test_cadence_variance_math()
    print(f"Synthetic Example Metrics: {cad_res['synthetic_metrics']}")
    print(f"Humanized Refactor Metrics: {cad_res['human_metrics']}")
    print(f"Humanized Refactor sigma >= 4.0: {cad_res['human_std_dev_ge_4']}")
    
    # 8. CTA Character Length Limits (<40 chars)
    print("\n--- 8. CTA Character Length Limits ---")
    cta_res = test_cta_length_bounds()
    print(f"Sampled CTAs: {cta_res['total_sampled_ctas']} | Under 40 Chars: {cta_res['valid_ctas_under_40']} | Over 40 Chars: {len(cta_res['ctas_over_40'])}")
    if cta_res["ctas_over_40"]:
        print(f"  Over 40 CTAs: {cta_res['ctas_over_40']}")
        
    # 9. Spanish Text Expansion Accuracy
    print("\n--- 9. Spanish Text Expansion Character Math ---")
    es_exp = test_spanish_text_expansion_math()
    print(f"Expansion Table Rows: {es_exp['total_rows']} | Accurate Counts: {es_exp['all_counts_match']}")
    for r in es_exp["details"]:
        match_str = "MATCH" if r["counts_match"] else "MISMATCH"
        print(f"  [{match_str}] '{r['en']}' ({r['actual_en']}ch) -> '{r['es']}' ({r['actual_es']}ch) | Stated: {r['stated_expansion']}, Calc: {r['calculated_expansion']}")
        
    print("\n" + "=" * 70)
    print(" VERIFICATION RUN COMPLETE")
    print("=" * 70)

if __name__ == "__main__":
    main()
