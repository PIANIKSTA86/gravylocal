import re
import json
from typing import List, Dict, Any, Tuple

# Load actual LEXICON_EN, LEXICON_ES, FORMULAS from audit_copy.py
import sys
sys.path.insert(0, r"C:\Users\JULIAN\.gemini\config\skills\human-interface-design\scripts")
import audit_copy

# Proposed get_compiled_lexicon
def proposed_get_compiled_lexicon(lang: str) -> List[Tuple[re.Pattern, str, str]]:
    raw_entries: List[Dict[str, Any]] = []
    if lang in ("en", "all"):
        raw_entries.extend(audit_copy.LEXICON_EN)
    if lang in ("es", "all"):
        raw_entries.extend(audit_copy.LEXICON_ES)

    compiled: List[Tuple[re.Pattern, str, str]] = []
    for item in raw_entries:
        # Refined boundary with non-capturing group and # / = protection
        regex_str = r"(?<!=)(?<!=[\"'{])(?<![\w\-#/])(?:" + item["pattern"] + r")(?![\w\-#/])"
        try:
            pattern = re.compile(regex_str, re.IGNORECASE)
            compiled.append((pattern, item["category"], item["replacement"]))
        except re.error as e:
            print(f"Error compiling {regex_str}: {e}")
    return compiled

# Proposed get_compiled_formulas
def proposed_get_compiled_formulas(lang: str) -> List[Tuple[re.Pattern, str, str]]:
    compiled: List[Tuple[re.Pattern, str, str]] = []
    for item in audit_copy.FORMULAS:
        if lang != "all" and item["lang"] != lang:
            continue
        pat_str = item["pattern"]
        # Fix lines 187 & 193 unparenthesized alternation if present
        if "fast-paced world|in" in pat_str or "fast[\-\s]paced\s+world|in" in pat_str:
            pat_str = r"(?<![\w\-#])(?:in\s+today'?s\s+fast[\-\s]paced\s+world|in\s+an\s+ever[\-\s]changing\s+world)(?![\w\-#])"
        elif "acelerado\s+de\s+hoy|en" in pat_str:
            pat_str = r"(?<![\w\-#])(?:en\s+el\s+mundo\s+acelerado\s+de\s+hoy|en\s+un\s+mundo\s+cada\s+vez\s+m[aá]s)(?![\w\-#])"
        else:
            pat_str = pat_str.replace(r"(?<![\w\-])", r"(?<![\w\-#])").replace(r"(?![\w\-])", r"(?![\w\-#])")
        try:
            pattern = re.compile(pat_str, re.IGNORECASE)
            compiled.append((pattern, item["name"], item["replacement"]))
        except re.error as e:
            print(f"Error compiling formula {pat_str}: {e}")
    return compiled

# Proposed audit_file_content
def proposed_audit_file_content(content: str, lang: str = "all") -> Tuple[int, List[Dict[str, Any]]]:
    lex = proposed_get_compiled_lexicon(lang)
    formulas = proposed_get_compiled_formulas(lang)
    lines = content.splitlines()
    findings: List[Dict[str, Any]] = []

    # Calculate total words in text
    all_text = " ".join(lines)
    clean_text = re.sub(r"<[^>]+>", " ", all_text)
    words = [w for w in re.split(r"[\s\.,;:!?\"'()\[\]{}]+", clean_text) if w]
    word_count = len(words)

    in_block_comment = False
    in_code_block = False

    for line_idx, line in enumerate(lines):
        line_num = line_idx + 1
        stripped = line.strip()

        # Handle fenced markdown code blocks (```)
        if stripped.startswith("```"):
            in_code_block = not in_code_block
            continue
        if in_code_block:
            continue

        # Handle basic block comment boundaries (CSS / JS / HTML)
        if "/*" in stripped:
            in_block_comment = True
        if in_block_comment:
            if "*/" in stripped:
                in_block_comment = False
            continue
        if stripped.startswith("<!--") and stripped.endswith("-->"):
            continue

        # Handle comments: Do NOT skip markdown headings (# followed by space or ##)
        if stripped.startswith("//"):
            continue
        if stripped.startswith("#"):
            # Markdown headings start with # followed by space, or multiple # then space
            if re.match(r"^#{1,6}\s+", stripped):
                # This is a markdown heading! Do NOT skip!
                pass
            else:
                # Python / shell comment (e.g. # comment)
                continue

        # Tag masking: mask HTML tags <...> with identical length whitespace to preserve column numbers
        if "<" in line and ">" in line:
            line_to_scan = re.sub(r"<[^>]+>", lambda m: " " * len(m.group(0)), line)
        else:
            line_to_scan = line

        # 1. Buzzwords
        for pattern, category, replacement in lex:
            for match in pattern.finditer(line_to_scan):
                col_num = match.start() + 1
                matched_str = match.group(0)
                start_snip = max(0, match.start() - 25)
                end_snip = min(len(line), match.end() + 25)
                snippet = line[start_snip:end_snip].strip()
                findings.append({
                    "line": line_num,
                    "col": col_num,
                    "category": category,
                    "matched_text": matched_str,
                    "snippet": snippet,
                    "replacement": replacement,
                    "weight": 1.0
                })

        # 2. Formulas
        for pattern, formula_name, replacement in formulas:
            for match in pattern.finditer(line_to_scan):
                findings.append({
                    "line": line_num,
                    "col": match.start() + 1,
                    "category": f"Formula: {formula_name}",
                    "matched_text": match.group(0),
                    "snippet": line.strip()[:80],
                    "replacement": replacement,
                    "weight": 2.5
                })

    # 3. Triads
    triads = audit_copy.detect_triad_parallelism(lines)
    findings.extend(triads)
    findings.sort(key=lambda x: (x["line"], x["col"]))
    return word_count, findings

# RUN TEST BATTERY
tests = [
    # Reviewer 2 tests
    ("R2_test_9_unleash_btn", '<button class="unleash-btn">Action</button>', 0),
    ("R2_test_10_btn_frictionless", '<button class="btn-frictionless">Action</button>', 0),
    ("R2_test_11_btn_sumergete", '<button class="btn-sumergete">Accion</button>', 0),
    ("R2_test_12_markdown_heading", '# Unleash Your Potential\nSome normal body text here.\n', 1),
    ("R2_test_13_spanish_diacritics", 'Enfoque holístico y visión de vanguardia sin precedentes.\n', 3), # holístico, de vanguardia, sin precedentes

    # Challenger 1 tests
    ("C1_B1.1_hyphenated_css", '<div class="unleash-container" id="delve-header"><span class="border-seamless">Direct message</span></div>', 0),
    ("C1_B1.2_css_color_hash", '.button {\n    border-seamless: 1px solid #333;\n    color: #elevate;\n}\n', 0),
    ("C1_B1.3_css_vars", ':root {\n    --unleash-theme: #ffffff;\n    --supercharge-speed: 250ms;\n    --seamless-transition: ease-in-out;\n}\n', 0),
    ("C1_B1.4_code_comments", '// We will unleash the cache\n# Fostering connection\n/* Seamlessly handle */\n<!-- Empower user -->\n<p>Real human user interface text.</p>', 0),
    ("C1_B1.6_html_attributes", '<a href="#elevate" data-action="unleash" class="delve-nav">Jump to section</a>', 0),
    ("C1_B2.1_spanish_accents", '¡Desata el potencial! ¿Quieres potenciar tu flujo?\n¡Sumérgete en este tapiz de oportunidades!\nUn enfoque holístico sin fricción.\nNo busques más para tu empresa.', 7),
    ("C1_B2.2_uppercase", 'UNLEASH THE REVOLUTIONARY POWER OF YOUR DATA.\nDeLvE INTO THE TAPESTRY OF BESPOKE SOLUTIONS.\nOUR ROBUST PLATFORM WILL SUPERCHARGE YOUR EFFICIENCY.', 6),
    ("C1_B2.3_quoted", 'He promised an "effortless" onboarding and \'seamless\' transitions.\nThey call it a "game-changer" in the "realm" of analytics.', 4),
    ("C1_B2.6_markdown_headings", '# Unleash the Power of AI\n## Supercharge your team\n', 2),
]

all_passed = True
print("--- RUNNING EMPIRICAL VERIFICATION OF PROPOSED REGEX & BOUNDARY FIXES ---")
for name, content, expected_count in tests:
    wc, findings = proposed_audit_file_content(content)
    actual_count = len(findings)
    passed = (actual_count == expected_count)
    if not passed:
        all_passed = False
        print(f"[FAIL] {name}: Expected {expected_count} findings, got {actual_count}. Findings: {[f['matched_text'] for f in findings]}")
    else:
        print(f"[PASS] {name}: Exactly {actual_count} findings as expected.")

print(f"\nFinal Test Status: {'ALL PASSED (100%)' if all_passed else 'SOME FAILED'}")
