import re
import math

p1 = r'C:\Users\JULIAN\.gemini\config\skills\human-interface-design\examples\before-after-cases.md'
with open(p1, 'r', encoding='utf-8') as f:
    text = f.read()

# Let's verify WCAG 2.2 contrast calculations
# Relative luminance formula
def hex_to_rgb(h):
    h = h.lstrip('#')
    return tuple(int(h[i:i+2], 16) / 255.0 for i in (0, 2, 4))

def srgb_to_lin(c):
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4

def luminance(hex_code):
    r, g, b = hex_to_rgb(hex_code)
    return 0.2126 * srgb_to_lin(r) + 0.7152 * srgb_to_lin(g) + 0.0722 * srgb_to_lin(b)

def contrast_ratio(hex1, hex2):
    l1 = luminance(hex1)
    l2 = luminance(hex2)
    lighter = max(l1, l2)
    darker = min(l1, l2)
    return (lighter + 0.05) / (darker + 0.05)

# In Case 1:
# Canvas: #121214
# Text Main: #F3F3F0 -> Claimed: 16.83:1
# Text Muted: #A3A39E -> Claimed: 7.39:1
# Text Subtle: #6E6E69 -> Claimed: 3.48:1
# Primary Accent: #F59E0B -> Claimed: 8.71:1

r_main = contrast_ratio('#121214', '#F3F3F0')
r_muted = contrast_ratio('#121214', '#A3A39E')
r_subtle = contrast_ratio('#121214', '#6E6E69')
r_accent = contrast_ratio('#121214', '#F59E0B')

print(f'Text Main (#F3F3F0 on #121214): {r_main:.2f}:1 (Claimed 16.83:1) -> matches: {abs(r_main - 16.83) < 0.05}')
print(f'Text Muted (#A3A39E on #121214): {r_muted:.2f}:1 (Claimed 7.39:1) -> matches: {abs(r_muted - 7.39) < 0.05}')
print(f'Text Subtle (#6E6E69 on #121214): {r_subtle:.2f}:1 (Claimed 3.48:1) -> matches: {abs(r_subtle - 3.48) < 0.05}')
print(f'Primary Accent (#F59E0B on #121214): {r_accent:.2f}:1 (Claimed 8.71:1) -> matches: {abs(r_accent - 8.71) < 0.05}')

# Check Case 2 and 3 contrast and tokens
print('\n--- Check CSS Microinteractions & Tokens in Cases ---')
for case_num, pattern in [(1, 'Case 1'), (2, 'Case 2'), (3, 'Case 3')]:
    sub = text[text.find(pattern):]
    next_pattern = f'Case {case_num + 1}'
    if text.find(next_pattern) != -1:
        sub = sub[:sub.find(next_pattern)]
    has_scale = 'scale(0.97)' in sub
    has_cubic = 'cubic-bezier' in sub
    has_focus = ':focus-visible' in sub
    has_reduced = 'prefers-reduced-motion' in sub
    has_tabular = 'tabular-nums' in sub
    print(f'{pattern}: scale(0.97)={has_scale}, cubic-bezier={has_cubic}, :focus-visible={has_focus}, prefers-reduced-motion={has_reduced}, tabular-nums={has_tabular}')
