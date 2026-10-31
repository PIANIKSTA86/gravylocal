import re
from pathlib import Path

skill_dir = Path(r"C:\Users\JULIAN\.gemini\config\skills\human-interface-design")
files = [
    skill_dir / "references" / "color-psychology.md",
    skill_dir / "references" / "conversational-copy.md",
]

for f in files:
    content = f.read_text(encoding="utf-8")
    lines = content.splitlines()
    fences = [l for l in lines if l.strip().startswith("```")]
    print(f"{f.name}:")
    print(f"  Total lines: {len(lines)}")
    print(f"  Total code fences: {len(fences)} (even? {len(fences) % 2 == 0})")
    
    # Table column consistency check
    in_table = False
    col_counts = []
    broken_rows = []
    for lno, line in enumerate(lines, 1):
        if line.strip().startswith("|") and line.strip().endswith("|"):
            parts = [c.strip() for c in line.split("|")[1:-1]]
            if "---" in line:
                expected_cols = len(parts)
            else:
                col_counts.append((lno, len(parts)))
        else:
            if col_counts:
                # check table
                first_len = col_counts[0][1]
                for l_num, c_len in col_counts:
                    if c_len != first_len:
                        broken_rows.append((l_num, c_len, first_len))
                col_counts = []
    print(f"  Broken table rows: {len(broken_rows)}")
    if broken_rows:
        print("  Sample broken rows:", broken_rows[:5])
