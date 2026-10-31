import os
import re

p_rubric = r'C:\Users\JULIAN\.gemini\config\skills\human-interface-design\references\audit-rubric.md'
p_cases = r'C:\Users\JULIAN\.gemini\config\skills\human-interface-design\examples\before-after-cases.md'

print('=== 1. STRESS-TESTING AUDIT RUBRIC MATH & TIERS ===')
with open(p_rubric, 'r', encoding='utf-8') as f:
    rubric_text = f.read()

# Check Dimensions
dims = re.findall(r'Dimension\s+(\d+):.*?\(\$D_(\d+)\$\)', rubric_text)
print('Found dimensions:', dims)
assert len(dims) == 6, f'Expected 6 dimensions, found {len(dims)}'
assert [d[0] for d in dims] == ['1', '2', '3', '4', '5', '6']

# Check Quality Tiers from Section 3 headers
tiers = re.findall(r'###\s+Tier\s+(\d+):\s+(.*?)\((\d+)[–\-](\d+)\s+pts\)', rubric_text)
print('Found tier headers:', tiers)
assert len(tiers) == 4, f'Expected 4 tiers, found {len(tiers)}'

covered_pts = set()
for t_num, t_name, low, high in tiers:
    r = range(int(low), int(high) + 1)
    # Check no overlap
    overlap = covered_pts.intersection(r)
    assert not overlap, f'Tier {t_num} overlaps with existing points: {overlap}'
    covered_pts.update(r)

assert covered_pts == set(range(0, 31)), f'Tiers do not continuously cover 0 to 30! Covered: {sorted(covered_pts)}'
print('-> Tiers strictly cover 0 to 30 points with zero gaps and zero overlaps!')

# Check Forensic Case Study Math in Section 5
print('\n=== Forensic Case Study Score Check ===')
m = re.search(r'### Forensic Defect Breakdown & Deductions:(.*?)### Composite Audit Verdict:', rubric_text, re.DOTALL)
if m:
    case_breakdown = m.group(1)
    d_scores = re.findall(r'\$D_(\d)\$\s*=\s*(\d+)/5', case_breakdown)
    print('Forensic Dimension scores found:', d_scores)
    total_case = sum(int(score) for _, score in d_scores)
    print(f'Sum of forensic scores: {total_case}/30')
    m_composite = re.search(r'Composite Humanization Score.*?(\d+)/30', rubric_text)
    if m_composite:
        print(f'Reported composite score: {m_composite.group(1)}/30')
        assert total_case == int(m_composite.group(1)), f'Math mismatch! Sum is {total_case} but reported {m_composite.group(1)}'
        print('-> Forensic Case Study scores match exactly!')

print('\n=== 2. STRESS-TESTING 10-POINT CHECKLIST ===')
q_items = re.findall(r'###\s+\[\s*\]\s+(Q\d+):\s+(.*?)\?', rubric_text)
print(f'Checklist questions found: {len(q_items)}')
assert len(q_items) == 10, f'Expected 10 checklist questions, found {len(q_items)}'
for q_id, q_text in q_items:
    q_section = rubric_text[rubric_text.find(q_id):rubric_text.find(q_id) + 1000]
    next_q = f'Q{int(q_id[1:]) + 1}'
    if rubric_text.find(next_q) != -1:
        q_section = rubric_text[rubric_text.find(q_id):rubric_text.find(next_q)]
    has_rem = 'Remediation Pointer' in q_section or 'remediation' in q_section.lower()
    has_link = '.md' in q_section
    print(f'  {q_id}: has_remediation_label={has_rem}, has_link={has_link}')
    assert has_link, f'{q_id} lacks remediation link to reference docs!'

print('-> All 10 checklist questions have valid remediation pointers!')

print('\n=== 3. STRESS-TESTING AFTER SECTIONS FOR BANNED AI WORDS ===')
with open(p_cases, 'r', encoding='utf-8') as f:
    cases_text = f.read()

# Banned slop words list
banned_words = [
    'empower', 'seamlessly', 'seamless', 'elevate', 'delve', 'supercharge', 
    'unleash', 'tapestry', 'game-changer', 'revolutionize', 'testament',
    'beacon', 'plethora', 'dynamic world', 'in today\'s'
]

# Check that AFTER code and copy sections do not use banned words carelessly
# Slicing after sections:
# Case 1 After:
case1_after = cases_text[cases_text.find('## 3. After (Humanized Production Craft)'):cases_text.find('# Case 2:')]
# Case 2 After:
case2_after = cases_text[cases_text.find('## 3. After: Humanized Handcrafted Implementation'):cases_text.find('# Case 3:')]
# Case 3 After:
case3_after = cases_text[cases_text.find('## 3. After: Humanized Handcrafted Implementation'):]

for name, chunk in [('Case 1 After', case1_after), ('Case 2 After', case2_after), ('Case 3 After', case3_after)]:
    found_banned = []
    # ignore markdown explanations that cite banned words like: 'Replacing empty promises with...'
    # check inside code blocks
    code_blocks = re.findall(r'```(?:html)?\n(.*?)```', chunk, re.DOTALL)
    for cb in code_blocks:
        for bw in banned_words:
            if re.search(r'\b' + re.escape(bw) + r'\b', cb, re.IGNORECASE):
                found_banned.append((bw, cb[:100]))
    print(f'{name} code blocks banned words found: {len(found_banned)}')
    assert len(found_banned) == 0, f'{name} contains banned words in production code blocks: {found_banned}'

print('-> All AFTER production code blocks are 100% clean of banned AI slop words!')
