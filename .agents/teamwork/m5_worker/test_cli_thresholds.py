import sys
import subprocess
from pathlib import Path

PYTHON_EXE = sys.executable
TARGET_SCRIPT = Path(r"C:\Users\JULIAN\.gemini\config\skills\human-interface-design\scripts\audit_copy.py")

# Create temporary clean file
clean_f = Path(r"c:\Users\JULIAN\Desktop\GravyLocalTABS\.agents\teamwork\m5_worker\clean_sample.txt")
clean_f.write_text("This is an authentic human sentence crafted with genuine care and clarity.", encoding="utf-8")

def run(args):
    proc = subprocess.run([PYTHON_EXE, str(TARGET_SCRIPT)] + args, capture_output=True, text=True)
    return proc.returncode, proc.stdout, proc.stderr

# Test 1: Valid threshold
rc, out, err = run(["--threshold", "80", str(clean_f)])
assert rc == 0, f"Expected 0 for 80, got {rc}: {err}"

# Test 2: Negative threshold -> exit code 2
rc, out, err = run(["--threshold", "-10", str(clean_f)])
assert rc == 2, f"Expected 2 for -10, got {rc}: {err}"
assert "--threshold must be a finite number between 0.0 and 100.0" in err

# Test 3: Greater than 100 -> exit code 2
rc, out, err = run(["--threshold", "120", str(clean_f)])
assert rc == 2, f"Expected 2 for 120, got {rc}: {err}"
assert "--threshold must be a finite number between 0.0 and 100.0" in err

# Test 4: NaN -> exit code 2
rc, out, err = run(["--threshold", "nan", str(clean_f)])
assert rc == 2, f"Expected 2 for nan, got {rc}: {err}"
assert "--threshold must be a finite number between 0.0 and 100.0" in err

# Test 5: Inf -> exit code 2
rc, out, err = run(["--threshold", "inf", str(clean_f)])
assert rc == 2, f"Expected 2 for inf, got {rc}: {err}"
assert "--threshold must be a finite number between 0.0 and 100.0" in err

# Test 6: Boundary 0.0 -> exit code 0
rc, out, err = run(["--threshold", "0.0", str(clean_f)])
assert rc == 0, f"Expected 0 for 0.0, got {rc}: {err}"

# Test 7: Boundary 100.0 -> exit code 0
rc, out, err = run(["--threshold", "100.0", str(clean_f)])
assert rc == 0, f"Expected 0 for 100.0, got {rc}: {err}"

print("SUCCESS: All threshold validation edge cases verified successfully!")
