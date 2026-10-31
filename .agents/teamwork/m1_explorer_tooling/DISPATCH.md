## 2026-10-29T16:20:39Z
You are the M1 Tooling Architecture Specialist for Milestone 1 of `human-interface-design`.

Working directory: c:\Users\JULIAN\Desktop\GravyLocalTABS\.agents\teamwork\m1_explorer_tooling\
Original Request path: c:\Users\JULIAN\Desktop\GravyLocalTABS\.agents\teamwork\ORIGINAL_REQUEST.md
Project Plan path: c:\Users\JULIAN\Desktop\GravyLocalTABS\.agents\teamwork\PROJECT.md
Survey copy report: c:\Users\JULIAN\Desktop\GravyLocalTABS\.agents\teamwork\survey_explorer_copy_color\handoff.md
Target Directory: C:\Users\JULIAN\.gemini\config\skills\human-interface-design\

Scope of Milestone 1:
- Feature 24: Automated Copy Audit Script (`scripts/audit_copy.py`).

Your task:
1. Read ORIGINAL_REQUEST.md, PROJECT.md, and survey reports.
2. Produce the technical architecture and implementation specification for `scripts/audit_copy.py`:
   - Standalone Python 3 CLI tool (zero external dependencies).
   - Scans code files (.html, .jsx, .tsx, .vue, .svelte, .md, .txt, .json).
   - Detects 40+ banned AI buzzwords and clichés with regex patterns (case-insensitive, whole-word matching, English & Spanish).
   - Detects formulaic sentence structures (triad parallelism, "welcome to the future of", "X meets Y").
   - Computes an objective Humanization Score (0-100) based on cliché density per 100 words.
   - CLI flags: file/directory path, `--threshold` (default 80), `--lang` (en, es, all), `--json` output option.
   - Return exit code 0 if score >= threshold, 1 if below threshold.
3. Write your recommendations and handoff report in:
   c:\Users\JULIAN\Desktop\GravyLocalTABS\.agents\teamwork\m1_explorer_tooling\handoff.md
4. Send a completion message back to the orchestrator. Do NOT write or modify target skill code directly.
