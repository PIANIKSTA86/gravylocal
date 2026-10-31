import re
from html.parser import HTMLParser

p1 = r'C:\Users\JULIAN\.gemini\config\skills\human-interface-design\examples\before-after-cases.md'
with open(p1, 'r', encoding='utf-8') as f:
    text = f.read()

html_blocks = re.findall(r'```html\n(.*?)```', text, re.DOTALL)
case3_after = html_blocks[5]

class A11yChecker(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids = set()
        self.labels = []
        self.inputs = []
        self.aria_describedby = []
        self.aria_lives = []

    def handle_starttag(self, tag, attrs):
        attr_dict = dict(attrs)
        if 'id' in attr_dict:
            self.ids.add(attr_dict['id'])
        if tag == 'label':
            self.labels.append(attr_dict.get('for'))
        if tag in ['input', 'select', 'textarea']:
            self.inputs.append((
                attr_dict.get('id'),
                attr_dict.get('type'),
                attr_dict.get('inputmode'),
                attr_dict.get('aria-describedby'),
                attr_dict.get('aria-invalid')
            ))
        if 'aria-describedby' in attr_dict:
            for ref in attr_dict['aria-describedby'].split():
                self.aria_describedby.append((ref, tag))
        if 'aria-live' in attr_dict:
            self.aria_lives.append((tag, attr_dict.get('role'), attr_dict.get('aria-live')))

checker = A11yChecker()
checker.feed(case3_after)

print('IDs in Case 3 After Form:', checker.ids)
print('\nLabels (for attributes):', checker.labels)
for lbl in checker.labels:
    assert lbl in checker.ids, f'Label for="{lbl}" does not match any element ID!'
print('-> All <label for=...> match valid element IDs!')

print('\nInputs found:')
for inp in checker.inputs:
    print(' ', inp)
    assert inp[0] in checker.ids, f'Input ID {inp[0]} missing!'

print('\nARIA describedby references:')
for ref, tag in checker.aria_describedby:
    print(f'  {tag} -> #{ref} (target exists: {ref in checker.ids})')
    assert ref in checker.ids, f'aria-describedby reference #{ref} does not exist in DOM!'
print('-> All aria-describedby references point to valid elements!')

print('\nARIA live regions:')
for item in checker.aria_lives:
    print(' ', item)
