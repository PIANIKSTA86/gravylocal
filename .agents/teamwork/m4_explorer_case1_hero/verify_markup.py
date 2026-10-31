import re
import sys

before_html = """
<div class="hero-container-ai" style="background-color: #000000; padding: 48px 24px; text-align: center; min-height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center;">
  <div class="hero-badge" style="display: inline-block; padding: 6px 16px; border-radius: 9999px; background: rgba(99, 102, 241, 0.15); border: 1px solid #8B5CF6; color: #06B6D4; font-size: 14px; margin-bottom: 24px;">
    Next-Gen AI Platform v2.0
  </div>
  <div class="hero-content" style="max-width: 1200px; margin: 0 auto;">
    <h1 style="font-size: 56px; line-height: 1.5; color: #FFFFFF; margin-bottom: 24px; font-weight: 800;">
      Unleash the full potential of your team with our revolutionary platform
    </h1>
    <p style="font-size: 20px; line-height: 1.6; color: #9CA3AF; margin-bottom: 32px; max-width: 1100px;">
      Delve into a rich tapestry of insights designed to empower sustained growth, supercharge collaboration, and elevate your enterprise productivity with our seamless, game-changing suite.
    </p>
    <div class="hero-cta-group" style="display: flex; justify-content: center; gap: 16px; margin-bottom: 48px;">
      <button type="button" style="padding: 16px 36px; border-radius: 8px; border: none; background: linear-gradient(135deg, #6366F1, #8B5CF6, #06B6D4); color: #FFFFFF; font-size: 18px; font-weight: 600; box-shadow: 0 0 25px rgba(6, 182, 212, 0.6); cursor: pointer;">
        Get Started
      </button>
      <button type="button" style="padding: 16px 36px; border-radius: 8px; border: 1px solid #8B5CF6; background: transparent; color: #FFFFFF; font-size: 18px; font-weight: 600; cursor: pointer;">
        Learn More
      </button>
    </div>
    <div class="hero-mockup-wrapper" style="position: relative; max-width: 900px; margin: 0 auto;">
      <div class="hero-glow-blob" style="position: absolute; top: -20px; left: 10%; width: 80%; height: 200px; background: radial-gradient(circle, rgba(139, 92, 246, 0.4) 0%, rgba(6, 182, 212, 0.2) 60%, transparent 80%); filter: blur(40px);"></div>
      <div class="hero-mockup-card" style="position: relative; background: #0A0A0B; border: 1px solid #27272A; border-radius: 16px; padding: 32px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);">
        <div style="height: 280px; display: flex; align-items: center; justify-content: center; color: #6B7280; font-size: 16px;">
          [ Generic Dashboard Mockup with Equal Three Columns ]
        </div>
      </div>
    </div>
  </div>
</div>
"""

after_html = """
<section class="relative w-full bg-[#121214] text-[#F3F3F0] py-16 md:py-24 lg:py-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
  <div class="max-w-7xl mx-auto">
    <!-- Asymmetric 65/35 Editorial Split -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
      
      <!-- Primary Narrative Column (65% width: 7 of 12 columns) -->
      <div class="lg:col-span-7 flex flex-col items-start">
        
        <!-- Architectural Eyebrow Badge (4px micro-proximity) -->
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#1B1B1F] border border-[#2D2D34] text-xs font-mono font-medium text-[#A3A39E] mb-6">
          <span class="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
          <span>DISPATCH ENGINE &middot; NODE POOL v3.4</span>
        </div>

        <!-- Balanced Display Headline (Tight leading 1.12, balanced wrap) -->
        <h1 class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-[#F3F3F0] leading-[1.12] text-wrap: balance">
          Background worker queues running at sub-millisecond latency.
        </h1>

        <!-- Constrained Editorial Submeasure (65ch bound, text-wrap: pretty) -->
        <p class="mt-6 text-base sm:text-lg md:text-xl text-[#A3A39E] leading-relaxed max-w-[54ch] text-wrap: pretty">
          Execute 50,000 parallel jobs without lock contention or dropped tasks. Local SQLite state partitions keep memory usage pinned under 32 MB with zero external database dependencies.
        </p>

        <!-- Value-First CTA Group (Tactile Spring Physics) -->
        <div class="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
          <button type="button" class="inline-flex items-center justify-center px-6 py-3.5 rounded-lg bg-[#F59E0B] hover:bg-[#D97706] active:scale-[0.97] text-[#121214] font-semibold text-base shadow-[0_1px_2px_-1px_rgba(0,0,0,0.5),0_4px_12px_-2px_rgba(0,0,0,0.4)] transition-all duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F59E0B] focus-visible:ring-offset-2 focus-visible:ring-offset-[#121214]">
            Start free 14-day trial
          </button>
          <a href="#benchmark" class="inline-flex items-center justify-center px-6 py-3.5 rounded-lg bg-[#1B1B1F] hover:bg-[#242429] active:scale-[0.97] text-[#F3F3F0] font-medium text-base border border-[#2D2D34] hover:border-[#44444D] transition-all duration-150 ease-[cubic-bezier(0.16,1,0.3,1)]">
            Inspect live benchmark (v3.4) &rarr;
          </a>
        </div>

        <!-- Friction Reducer Microcopy -->
        <p class="mt-3 text-xs sm:text-sm text-[#A3A39E]">
          No credit card required &bull; 2-minute setup &bull; Full API access included
        </p>

        <!-- Proof Metrics Row -->
        <div class="mt-12 pt-8 border-t border-[#2D2D34] grid grid-cols-3 gap-6 sm:gap-8 w-full">
          <div>
            <div class="text-xs font-mono uppercase text-[#A3A39E] tracking-wider">Latency SLA</div>
            <div class="mt-1 text-xl sm:text-2xl font-bold text-[#F3F3F0] font-variant-numeric: tabular-nums">0.82 ms</div>
            <div class="text-xs text-[#A3A39E] mt-0.5">p99 dispatch</div>
          </div>
          <div>
            <div class="text-xs font-mono uppercase text-[#A3A39E] tracking-wider">Heap Cap</div>
            <div class="mt-1 text-xl sm:text-2xl font-bold text-[#F3F3F0] font-variant-numeric: tabular-nums">&lt; 32 MB</div>
            <div class="text-xs text-[#A3A39E] mt-0.5">50k job stream</div>
          </div>
          <div>
            <div class="text-xs font-mono uppercase text-[#A3A39E] tracking-wider">Uptime SLA</div>
            <div class="mt-1 text-xl sm:text-2xl font-bold text-[#F3F3F0] font-variant-numeric: tabular-nums">99.992%</div>
            <div class="text-xs text-[#A3A39E] mt-0.5">audited SOC2</div>
          </div>
        </div>

      </div>

      <!-- Secondary Functional Artifact Column (35% width: 5 of 12 columns) -->
      <div class="lg:col-span-5 w-full">
        <div class="relative bg-[#1B1B1F] border border-[#2D2D34] rounded-2xl p-6 sm:p-7 shadow-[0_1px_2px_-1px_rgba(0,0,0,0.5),0_4px_12px_-2px_rgba(0,0,0,0.4),0_16px_32px_-4px_rgba(0,0,0,0.35)] before:absolute before:inset-0 before:rounded-2xl before:pointer-events-none before:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
          
          <!-- Terminal Header -->
          <div class="flex items-center justify-between border-b border-[#2D2D34] pb-4 mb-5">
            <div class="flex items-center gap-2">
              <span class="w-3 h-3 rounded-full bg-[#EF4444]/60"></span>
              <span class="w-3 h-3 rounded-full bg-[#F59E0B]/60"></span>
              <span class="w-3 h-3 rounded-full bg-[#10B981]/60"></span>
              <span class="ml-2 font-mono text-xs text-[#A3A39E]">worker-pool-node-01</span>
            </div>
            <span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20">
              ACTIVE
            </span>
          </div>

          <!-- Live Telemetry Stream -->
          <div class="space-y-4 font-mono text-xs">
            
            <!-- Telemetry Block 1 -->
            <div class="bg-[#121214] border border-[#2D2D34]/80 rounded-xl p-3.5">
              <div class="flex justify-between text-[#A3A39E] mb-1.5">
                <span>QUEUE_DRAIN_EVENT</span>
                <span class="text-[#10B981] tabular-nums">42,890 ops/s</span>
              </div>
              <div class="text-[#F3F3F0]">
                <span class="text-[#F59E0B]">$</span> worker_pool --workers=16 --wal-sync
              </div>
              <div class="text-[#A3A39E] mt-1 text-[11px]">
                &rarr; Partition #04 locked 0.11 ms &bull; 0 dropped packets
              </div>
            </div>

            <!-- Telemetry Block 2 -->
            <div class="bg-[#121214] border border-[#2D2D34]/80 rounded-xl p-3.5">
              <div class="flex justify-between text-[#A3A39E] mb-1.5">
                <span>HEAP_ALLOCATION</span>
                <span class="text-[#F3F3F0] tabular-nums">28.4 / 32.0 MB</span>
              </div>
              <!-- Progress bar representation -->
              <div class="w-full bg-[#242429] rounded-full h-1.5 overflow-hidden">
                <div class="bg-[#F59E0B] h-1.5 rounded-full" style="width: 71%;"></div>
              </div>
              <div class="flex justify-between text-[11px] text-[#A3A39E] mt-1.5">
                <span>Zero GC freeze</span>
                <span class="text-[#10B981]">OK</span>
              </div>
            </div>

            <!-- Telemetry Block 3 -->
            <div class="bg-[#121214] border border-[#2D2D34]/80 rounded-xl p-3.5">
              <div class="flex justify-between text-[#A3A39E] mb-1">
                <span>STATE_STORAGE</span>
                <span class="text-[#A3A39E]">Local SQLite WAL</span>
              </div>
              <div class="text-[#A3A39E] text-[11px]">
                Cryptographic SHA-256 hash verified for 50,000 journal entries.
              </div>
            </div>

          </div>

          <!-- Card Bottom Operational Action -->
          <div class="mt-6 pt-4 border-t border-[#2D2D34] flex items-center justify-between text-xs">
            <span class="text-[#A3A39E]">Auto-failover: enabled</span>
            <span class="font-mono text-[#F59E0B]">Health: 100%</span>
          </div>

        </div>
      </div>

    </div>
  </div>
</section>
"""

def test_markup(text, name):
    open_divs = len(re.findall(r"<div\b", text))
    close_divs = len(re.findall(r"</div>", text))
    print(f"[{name}] open <div>: {open_divs}, close </div>: {close_divs}, diff: {open_divs - close_divs}")
    assert open_divs == close_divs, f"{name} has unclosed div tags!"

test_markup(before_html, "BEFORE")
test_markup(after_html, "AFTER")
print("All markup passed!")
