import sys
from pathlib import Path

# Add target script to path
sys.path.insert(0, r"C:\Users\JULIAN\.gemini\config\skills\human-interface-design\scripts")
import audit_copy

def run_tests():
    lex_all = audit_copy.get_compiled_lexicon("all")
    formulas_all = audit_copy.get_compiled_formulas("all")

    tests = [
        # 1. HTML attributes with #, quotes, classes
        ('<a href="#elevate" class="btn-unleash" data-action="revolutionize">Normal Link Text</a>', "index.html", 0, "HTML attributes with #, quotes, and buzzwords"),
        ('<div title="seamless" data-elevate="true">Visible content here</div>', "index.html", 0, "HTML title and data attribute with buzzwords"),
        ('<a href="#unleash">Unleash Your Potential</a>', "index.html", 1, "Buzzword in visible text but not href"),
        
        # 2. Markdown headings
        ('# Unleash Your Potential', "readme.md", 1, "Markdown H1 buzzword"),
        ('### Delve into the Tapestry', "doc.md", 2, "Markdown H3 multiple buzzwords"),
        ('# Seamless integration #', "readme.markdown", 1, "Closed markdown ATX heading"),
        ('## Safe and clean heading', "readme.md", 0, "Markdown heading without buzzwords"),
        ('# Unleash in comment', "script.py", 0, "Python comment starting with # should be ignored"),
        ('# Unleash in comment', "script.sh", 0, "Bash comment starting with # should be ignored"),
        
        # 3. CSS classes and selectors
        ('.btn-frictionless { color: red; }', "style.css", 0, "CSS hyphenated class btn-frictionless"),
        ('.btn-sumergete { color: blue; }', "style.css", 0, "CSS hyphenated class btn-sumergete"),
        ('#elevate { margin: 0; }', "style.css", 0, "CSS ID selector #elevate"),
        ('color: #elevate;', "style.css", 0, "CSS property value #elevate"),
        
        # 4. Quoted buzzwords in copy
        ('He called it "effortless" and \'seamless\'.', "doc.txt", 2, "Quoted buzzwords in running copy"),
        
        # 5. Alternation grouping in formulas
        ('In today\'s fast-paced world, speed matters.', "article.txt", 1, "Formula alternation 1"),
        ('In an ever-changing world, quality counts.', "article.txt", 1, "Formula alternation 2"),
        ('En el mundo acelerado de hoy, todo cambia.', "articulo.txt", 1, "Formula Spanish alternation 1"),
        ('En un mundo cada vez más digital.', "articulo.txt", 1, "Formula Spanish alternation 2"),
        
        # 6. Multiline HTML tag
        ('<button\n  class="btn-frictionless"\n  id="elevate">\n  Click here\n</button>', "index.html", 0, "Multiline HTML tag with hyphenated class and ID")
    ]

    all_passed = True
    for content, fname, expected_count, desc in tests:
        w, findings = audit_copy.audit_file_content(content, lex_all, formulas_all, file_path=fname)
        actual_count = len(findings)
        if actual_count == expected_count:
            print(f"[PASS] {desc}: expected={expected_count}, got={actual_count}")
        else:
            print(f"[FAIL] {desc}: expected={expected_count}, got={actual_count}, findings={[f['matched_text'] for f in findings]}")
            all_passed = False

    return all_passed

if __name__ == "__main__":
    success = run_tests()
    sys.exit(0 if success else 1)
