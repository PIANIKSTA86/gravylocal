import re

lex_boundary = re.compile(
    r"""(?<!=)(?<!=["'\{])(?<![\w\-#/])(?:unleash)(?![\w\-#/])""",
    re.IGNORECASE
)

t = '<button class="btn btn-primary unleash">Click</button>'
print("Without tag mask:", bool(lex_boundary.search(t)))

# Now mask HTML tags with spaces to preserve line/col alignment:
# Replace <tag ...> with spaces
def mask_html_tags(s: str) -> str:
    return re.sub(r"<[^>]+>", lambda m: " " * len(m.group(0)), s)

t_masked = mask_html_tags(t)
print("Masked line:", repr(t_masked))
print("With tag mask:", bool(lex_boundary.search(t_masked)))

# What if copy has tags:
copy_line = '<p>We empower users to do great things.</p>'
copy_masked = mask_html_tags(copy_line)
print("Copy line masked:", repr(copy_masked))
empower_pattern = re.compile(r"""(?<!=)(?<!=["'\{])(?<![\w\-#/])(?:empower)(?![\w\-#/])""", re.IGNORECASE)
m = empower_pattern.search(copy_masked)
print("Empower found:", bool(m), "start col:", m.start() if m else None)
m_orig = empower_pattern.search(copy_line)
print("Empower in orig start col:", m_orig.start() if m_orig else None)
