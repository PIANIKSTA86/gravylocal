## 2026-10-29T16:45:15Z

You are the Markdown & File Parsing Specialist for Milestone 1 Iteration 2 of `human-interface-design`.

Working directory: c:\Users\JULIAN\Desktop\GravyLocalTABS\.agents\teamwork\m1_iter2_explorer_markdown\
Original Request path: c:\Users\JULIAN\Desktop\GravyLocalTABS\.agents\teamwork\ORIGINAL_REQUEST.md
Project Plan path: c:\Users\JULIAN\Desktop\GravyLocalTABS\.agents\teamwork\PROJECT.md
Target File: C:\Users\JULIAN\.gemini\config\skills\human-interface-design\scripts\audit_copy.py
Failure Evidence paths:
- c:\Users\JULIAN\Desktop\GravyLocalTABS\.agents\teamwork\m1_reviewer_2\handoff.md
- c:\Users\JULIAN\Desktop\GravyLocalTABS\.agents\teamwork\m1_challenger_1\handoff.md
- c:\Users\JULIAN\Desktop\GravyLocalTABS\.agents\teamwork\orchestrator_1\GATE_STATUS.md

Context & Failure:
During Gate verification, Reviewer 2 and Challenger 1 discovered a critical false negative / blindspot in `scripts/audit_copy.py:356`:
`if stripped.startswith("//") or stripped.startswith("#"): continue`
This unconditionally skips any line starting with `#`. In Markdown files (`.md`, `.markdown`), headings start with `#` (`#`, `##`, etc.). Therefore, any marketing document or landing page copy containing buzzwords in headings (e.g. `# Unleash Your Potential`) is completely skipped and bypassed!

Your task:
1. Read the failure reports and inspect `scripts/audit_copy.py`.
2. Formulate the file-aware line parsing fix strategy:
   - Check file extension: if file ends in `.md` or `.markdown`, do NOT skip lines starting with `#`!
   - Ensure code comments (`//`, `/* */`, `#` in Python/Shell) are only skipped for appropriate code files, while preserving Markdown headings for audit.
3. Produce your findings and recommendations in:
   c:\Users\JULIAN\Desktop\GravyLocalTABS\.agents\teamwork\m1_iter2_explorer_markdown\handoff.md
4. Send a completion message back to the orchestrator. Do NOT modify source files directly.
