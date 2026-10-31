import subprocess
import tempfile
from pathlib import Path

after_text = """
DISPATCH ENGINE NODE POOL v3.4
Background worker queues running at sub-millisecond latency.
Execute 50,000 parallel jobs without lock contention or dropped tasks. Local SQLite state partitions keep memory usage pinned under 32 MB with zero external database dependencies.
Start free 14-day trial
Inspect live benchmark (v3.4)
No credit card required · 2-minute setup · Full API access included
Latency SLA 0.82 ms p99 dispatch
Heap Cap < 32 MB 50k job stream
Uptime SLA 99.992% audited SOC2
worker-pool-node-01 ACTIVE
QUEUE_DRAIN_EVENT 42,890 ops/s
worker_pool --workers=16 --wal-sync
Partition #04 locked 0.11 ms · 0 dropped packets
HEAP_ALLOCATION 28.4 / 32.0 MB
Zero GC freeze OK
STATE_STORAGE Local SQLite WAL
Cryptographic SHA-256 hash verified for 50,000 journal entries.
Auto-failover: enabled Health: 100%
"""

audit_script = Path(r"C:\Users\JULIAN\.gemini\config\skills\human-interface-design\scripts\audit_copy.py")

with tempfile.NamedTemporaryFile("w", suffix=".txt", delete=False, encoding="utf-8") as f:
    f.write(after_text)
    temp_p = Path(f.name)

try:
    res = subprocess.run(
        [r"C:\Users\JULIAN\AppData\Local\Python\bin\python.exe", str(audit_script), str(temp_p), "--format", "json"],
        capture_output=True,
        text=True,
        encoding="utf-8"
    )
    print("STDOUT:", res.stdout)
    print("STDERR:", res.stderr)
    print("RETURN CODE:", res.returncode)
finally:
    if temp_p.exists():
        temp_p.unlink()
