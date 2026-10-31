# builder script for conversational-copy.md
import re
from pathlib import Path

content = """# Conversational Copywriting & Lexicon Architecture: Handcrafted Voice Guide

A comprehensive, production-grade reference for writing authentic, punchy, humanized application copy, microcopy, and interface text. This guide eliminates the unmistakable synthetic signatures of Large Language Models: hollow buzzwords, the 18-word academic drone, symmetrical triads, and sycophantic corporate cheerfulness.

---

## Section 1: Executive Overview & The Human Voice Philosophy

When Large Language Models generate marketing copy, landing pages, or UI microcopy, they optimize for the statistical mode of internet training data. The result is an unmistakable synthetic signature:
1. **Hollow Hyperbole**: Reaching for grandiose Latinate escalators instead of explaining what the product literally does.
2. **Academic Preambles & Syllogistic Lectures**: Throat-clearing filler ("In an ever-evolving technological landscape...") that delays the user's discovery of the value proposition.
3. **Monotonous 18-Word Sentence Drone**: Uniform sentence lengths with zero standard deviation, creating a hypnotic, numbing rhythm.
4. **Symmetrical Triad Parallelism**: Rigid three-bullet or three-card groupings where every point shares the identical grammatical formula and syllable count.
5. **Frictionless Myths**: Promising magical ease while refusing to acknowledge realistic edge cases or human effort.

Human copywriting restores trust through **visceral specificity**, **tangible action verbs**, **musical cadence modulation**, and **honest product trade-offs**.

---

## Section 2: Feature 13: The LLM Slop Blacklist

AI models gravitate toward predictable word clusters because they represent safe, non-committal generalizations. Below is the reference catalog of 48 banned AI slop terms across 4 structural failure categories.

> **Dogfooding Rule**: Any occurrence of these banned words in production documentation or interface copy must be treated as an antipattern. Within this reference guide, all instances are strictly cataloged as banned clichés to avoid synthetic imitation.

### 2.1 The Four Failure Categories

1. **Hollow Escalators**: Words used to inflate artificial excitement when the author lacks concrete metrics or domain knowledge.
2. **Pseudo-Intellectual Connectors**: Pompous academic filler borrowed from formal essays, corporate annual reports, and press releases.
3. **Frictionless Myths**: Dishonest claims of magic that erode credibility by ignoring user friction and system complexity.
4. **Sycophantic Corporate Buzz**: Risk-averse enterprise clichés that avoid taking a distinct point of view.

### 2.2 The Exhaustive 48-Term Banned Cliché Catalog

```markdown
| Banned AI Buzzword / Cliché | Category | Why AI Generates It | Psychological Impact on Human Reader | Recommended Human Replacement Principle |
|---|---|---|---|---|
| `unleash` / `unleashing` | Hollow Escalator | Default verb for "start" or "activate"; attempts to inject cinematic drama. | Feels theatrical, childish, and manipulative. | Use literal verbs: *connect, launch, open, export*. |
| `elevate` / `elevating` | Hollow Escalator | Vague corporate synonym for "improve" without specifying what changes. | Signals empty executive posturing; lacks substance. | State the exact delta: *speed up by 30%, raise contrast, cut latency*. |
| `supercharge` / `supercharging` | Hollow Escalator | Tries to make routine software utilities sound like rocket engines. | Triggers instant AI-fatigue; feels hyperbolic. | State the mechanism: *automate, backfill, run in parallel*. |
| `revolutionize` / `revolutionizing` | Hollow Escalator | AI assigns world-historic significance to mundane CRUD interfaces. | Users know your tool is not altering human civilization. | Explain the workflow shift: *replace 5 spreadsheets with 1 live ledger*. |
| `transform` / `transforming` | Hollow Escalator | Safe, broad verb avoiding operational details. | Sounds like generic management consultancy jargon. | Name the tangible output: *turn raw CSVs into audited invoices*. |
| `skyrocket` / `skyrocketing` | Hollow Escalator | Unsubstantiated promise of exponential growth. | Rings false; creates skepticism about realistic ROI. | Quote real baseline metrics: *increase trial conversions by 14%*. |
| `maximize` / `maximizing` | Hollow Escalator | Mathematical superlative used without an objective function. | Abstract and dry; feels like a textbook exercise. | Specify the exact gain: *capture 98% of eligible tax deductions*. |
| `powerhouse` | Hollow Escalator | Metaphor borrowed from 1990s industrial brochures. | Clunky and dated; conveys mechanical bloat. | Name the actual architecture: *distributed queue, local SQLite engine*. |
| `unlock` / `unlocking` | Hollow Escalator | Implies software is a video game treasure chest. | Feels condescending and promotional. | Use direct access verbs: *download, inspect, view, access*. |
| `game-changer` / `game-changing` | Hollow Escalator | AI's favourite tired superlative for minor feature releases. | Instantly marks copy as amateur hype. | State the practical utility: *no browser restart needed*. |
| `take to the next level` | Hollow Escalator | Meaningless filler phrase when next steps are unknown. | Pure cognitive noise; communicates zero actionable data. | Name the operational milestone: *scale from 10 to 100 concurrent nodes*. |
| `look no further` | Hollow Escalator | Infomercial catchphrase indicating lazy copywriting. | Alienates sophisticated buyers; sounds like a late-night TV ad. | Delete the phrase entirely; present your evidence directly. |
| `delve` / `delving` | Pseudo-Intellectual | Academic essay transition over-represented in LLM pre-training data. | The single most identifiable linguistic fingerprint of GPT output. | Use conversational investigative verbs: *look into, inspect, review, scan*. |
| `tapestry` | Pseudo-Intellectual | Literary metaphor used by LLMs to describe simple data combinations. | Reads like an overwrought Victorian novel, not software UX. | Call it what it is: *mix, collection, breakdown, overview*. |
| `beacon` | Pseudo-Intellectual | Self-aggrandizing metaphor ("a beacon of trust/innovation"). | Pompous, unearned moral superiority. | Present third-party proof: *SOC2 Type II certified, 99.98% uptime*. |
| `testament` | Pseudo-Intellectual | Stiff biblical/legalistic phrasing ("a testament to our dedication"). | Ponderous and archaic; stiffens conversational tone. | Use grounded evidence: *proven by 1,400 daily active teams*. |
| `foster` / `fostering` | Pseudo-Intellectual | Bureaucratic HR/diplomatic jargon for "help" or "encourage". | Bloodless and paternalistic. | State the human interaction: *let engineers pair with designers directly*. |
| `pivotal` | Pseudo-Intellectual | Overstates ordinary milestones as historic turning points. | Sounds like an exaggerated case study summary. | State why it matters: *stops billing errors before payments settle*. |
| `holistic` / `holistically` | Pseudo-Intellectual | Wellness and consulting cliché masking lack of specific tools. | Vague and evasive; implies expensive, unstructured projects. | List the component parts: *tracks pipeline, invoices, and bank deposits*. |
| `intertwined` | Pseudo-Intellectual | Romantic literary term for technical system integration. | Feels unnaturally poetical in technical contexts. | Use precise engineering verbs: *linked, synced, coupled*. |
| `navigate` / `navigating` | Pseudo-Intellectual | Cliché metaphor for simple decision-making or website browsing. | Overcomplicates basic user interactions. | Use everyday verbs: *choose, browse, find, filter*. |
| `realm` / `realms` | Pseudo-Intellectual | Medieval fantasy term used by AI to describe modern software industries. | Bizarrely pretentious in SaaS and fintech. | Name the literal domain: *field, industry, workspace, category*. |
| `reimagine` / `reimagining` | Pseudo-Intellectual | Silicon Valley design-thinking cliché for routine product updates. | Promises paradigm shifts that are rarely delivered. | State the literal improvement: *redesigned for dark mode, 4x faster load*. |
| `beacon of hope` | Pseudo-Intellectual | Emotional melodrama in business copy. | Laughable in software contexts. | Stick to calm utility and dependable uptime. |
| `seamless` / `seamlessly` | Frictionless Myth | The universal AI cop-out to avoid explaining how integrations work. | Users know every integration has edge cases; breeds distrust. | Name the exact step count: *syncs in 2 clicks, backfills 12 months*. |
| `effortless` / `effortlessly` | Frictionless Myth | Denies the real human cognitive effort involved in work. | Feels patronizing to users doing demanding professional jobs. | Respect the user's craft: *removes manual data entry so you can focus on analysis*. |
| `friction-free` / `frictionless` | Frictionless Myth | Physics metaphor applied dishonestly to multi-stakeholder workflows. | Discredited marketing buzz; promises an impossible utopia. | Highlight tangible relief: *pre-filled forms, single sign-on via Okta*. |
| `intuitive` | Frictionless Myth | Lazy design claim that blames the user if they get confused. | Empty boast; all interfaces require learning. | Show clear layout: *labeled controls with inline keyboard shortcuts*. |
| `hassle-free` | Frictionless Myth | Informal sibling of "seamless"; overused in consumer ads. | Cheesy, low-trust retail association. | Explain the guarantee: *no credit card required, 30-day money-back refund*. |
| `magical` / `magic` | Frictionless Myth | Conceals system mechanics behind childish mystification. | Dangerous in security, finance, and medical software. | Be transparent: *computed via client-side WebAssembly in 4 milliseconds*. |
| `painless` | Frictionless Myth | Medical framing that reminds the user of pain before they start. | Negative psychological priming. | State the brief duration: *takes under 3 minutes to complete*. |
| `empower` / `empowering` | Corporate Buzz | Patronizing corporate buzzword implying users are helpless without software. | Condescending; implies software grants permission rather than utility. | Treat the user as the capable agent: *you control, you build, you export*. |
| `harness` / `harnessing` | Corporate Buzz | Agrarian draft-animal metaphor ("harness the power of AI"). | Pretentious and stale. | Use direct operational verbs: *apply, use, run, query*. |
| `bespoke` | Corporate Buzz | Savile Row tailoring term overused by low-tier agency templates. | Sounds like an overpriced boutique avoiding standard interfaces. | State flexibility clearly: *customizable JSON schemas, modular CSS*. |
| `cutting-edge` | Corporate Buzz | 1980s tech trope that immediately dates any modern interface. | Cliché that signals the exact opposite of cutting-edge craft. | Cite current standards: *built on Chromium 120, Rust backend, WebGPU*. |
| `unparalleled` | Corporate Buzz | Untrue superlative; invites immediate competitor counter-examples. | Unprovable arrogance that turns off discerning evaluators. | State verified facts: *99.99% uptime SLA backed by contractual credits*. |
| `robust` | Corporate Buzz | The ultimate generic filler adjective for enterprise infrastructure. | Says nothing about why or how it holds up under load. | State verifiable specs: *handles 10,000 requests/sec with zero dropped packets*. |
| `synergy` / `synergies` | Corporate Buzz | Parodied 1990s conglomerate buzzword resurrected by careless LLMs. | Universal symbol of corporate hollow talk. | Describe concrete coordination: *syncs tasks between Jira and GitHub*. |
| `embark` / `embarking` | Corporate Buzz | Maritime/voyage cliché for clicking a signup button. | Over-dramatizes a simple web form. | Keep action natural: *start your project, create account, begin setup*. |
| `paradigm shift` | Corporate Buzz | Overused academic philosophy term applied to minor UI tweaks. | Pretentious; draws eye-rolls from technical users. | Describe the change: *local-first storage means zero server lag*. |
| `streamline` / `streamlining` | Corporate Buzz | Overused to the point of complete semantic bleaching. | Vague and evasive; what was actually removed? | Specify what was eliminated: *removes 3 approval steps from purchase orders*. |
| `all-in-one platform` | Corporate Buzz | Promises everything to everyone; signals bloatware. | Signals mediocrity across all features; users prefer sharp tools. | Highlight the primary killer feature and primary audience. |
| `world-class` | Corporate Buzz | Self-anointed praise that provides zero technical evidence. | Empty bragging. | Show recognized benchmarks: *top-ranked in latency on Cloudflare Radar*. |
| `state-of-the-art` | Corporate Buzz | Dated filler cliché. | Generic tech puffery. | Cite specific hardware or protocol specs. |
| `game-changing platform` | Corporate Buzz | Double cliché combining buzzword and platform hype. | Sounds like auto-generated spam. | Focus on the single sharpest user pain point solved. |
| `seamless integration` | Frictionless Myth | The classic two-word AI pairing. | Triggers instant skepticism. | State the exact integration: *1-click OAuth with Google Workspace*. |
| `empower your workforce` | Corporate Buzz | Textbook AI human-resources template phrase. | Impersonal, robotic, and bureaucratic. | Write to the human: *give your team tools they don't complain about*. |
| `delve into our solutions` | Pseudo-Intellectual | Compound AI disaster combining academic filler with vague corporate noun. | Instant bounce trigger for web visitors. | Be direct: *see how our billing pipeline works*. |
```

---

## Section 3: Feature 14: Cliché Search-and-Replace Dictionary

To eradicate synthetic AI tone, copywriters and developers need an explicit operational mapping table. This dictionary provides direct, machine-applicable transformations from generic AI phrases into concrete, humanized alternatives calibrated for **Enterprise (B2B)** and **Consumer (D2C / Creator)** contexts.

### 3.1 The Three Core Humanization Rules

1. **Rule of Tangible Action Verbs**: Banish abstract Latinate verbs (`facilitate`, `leverage`). Replace them with Anglo-Saxon action verbs (`cut`, `ship`, `show`, `build`, `block`, `flag`, `track`, `refund`).
2. **Rule of Concrete Numbers & Metrics**: Replace vague superlatives with verifiable quantities: *"in 90 seconds"*, *"48 hours"*, *"4 hours per week"*, *"zero tracking cookies"*, *"99.9% uptime"*.
3. **Rule of Tone Calibration**:
   - **Enterprise / B2B SaaS**: Focus on quantifiable risk reduction, auditability, operational uptime, and enterprise compliance.
   - **Consumer / D2C / Creator**: Focus on visceral speed, ease of delight, personal autonomy, and clear boundary commitments.

### 3.2 The Master Search-and-Replace Dictionary (24 Production Mappings)

| Before (AI / Synthetic Cliché) | Category | After (Humanized Enterprise B2B Calibration) | After (Humanized Consumer / Creator Calibration) | Measurable Metric / Concrete Number Included |
|---|---|---|---|---|
| *"Unleash the full potential of your workforce with our revolutionary platform."* | Hollow Escalator | *"Cut 4 hours of status meetings every week. See who is working on what across your team in real time."* | *"Spend less time organizing your day and more time creating. All your projects in one clean view."* | **4 hours/week** saved |
| *"Delve into a rich tapestry of financial insights designed to foster growth."* | Pseudo-Intellectual | *"Review cash in, cash out, and 30-day runway forecasts in one auditable dashboard."* | *"See where your money went this month and what's left to spend. No math required."* | **30-day** runway forecast |
| *"Seamlessly integrate your accounts with our effortless 1-click sync."* | Frictionless Myth | *"Connect your Stripe and QuickBooks accounts in 90 seconds. We automatically backfill 12 months of ledger data."* | *"Link your bank in 2 taps. Your transactions appear instantly without manual imports."* | **90 seconds** setup, **12 months** backfill |
| *"Empower your organization with bespoke, cutting-edge AI solutions."* | Corporate Buzz | *"Software built for regional logistics providers managing 50 to 500 delivery vehicles, not airlines."* | *"A markdown writing app crafted for novelists who want zero distractions and local offline files."* | **50 to 500** vehicles |
| *"Supercharge your team's productivity with our game-changing tools."* | Hollow Escalator | *"Ship features 3 days faster per sprint by automating changelog generation and ticket triage."* | *"Finish your video edits before dinner. Export 4K footage at 60 FPS without your laptop fan spinning up."* | **3 days** faster per sprint |
| *"Elevate your customer engagement to unparalleled heights."* | Hollow Escalator | *"Respond to client support tickets in under 5 minutes with contextual purchase history pre-loaded."* | *"Talk directly to your favorite newsletter subscribers with private 1-on-1 audio replies."* | **Under 5 minutes** response |
| *"Take your business to the next level with our all-in-one suite."* | Corporate Buzz | *"Stop juggling 4 separate subscriptions. Manage billing, contracts, and client approvals in 1 system."* | *"One app to track your workouts, meals, and sleep without selling your biometric data."* | **4 subscriptions** into **1 system** |
| *"Where precision engineering meets effortless design."* | Hero Cliché | *"Sub-millisecond query responses on databases up to 10 terabytes, wrapped in a keyboard-first terminal."* | *"A camera app that opens in 100 milliseconds and lets you take manual photos without menu diving."* | **<1 ms** latency, **10 TB** scale |
| *"Welcome to the future of inventory management."* | Hero Cliché | *"Barcode scanning and real-time pallet tracking that works offline in metal warehouse racks."* | *"Keep track of your home pantry so you never buy a fourth jar of cumin by mistake."* | **Real-time** offline tracking |
| *"Say goodbye to messy spreadsheets, say hello to smart growth."* | Hero Cliché | *"Invoices paid in 48 hours instead of 30 days. Automatic polite reminders sent on day 28 and 35."* | *"See your savings grow each payday without building custom Excel formulas."* | **48 hours** vs **30 days** |
| *"The all-in-one AI platform to revolutionize your workflow."* | Hero Cliché | *"Automated contract redlining that flags non-standard indemnification clauses in 15 seconds."* | *"Clean audio recordings that strip out background traffic noise with a single slider."* | **15 seconds** redlining |
| *"In today's fast-paced world, speed is paramount."* | Lecture Filler | *"Deploys complete in 12 seconds. Roll back broken releases in 1 click."* | *"Search 50,000 personal notes in under 10 milliseconds."* | **12 seconds** deploy, **1 click** rollback |
| *"Our robust infrastructure provides a beacon of security."* | Pseudo-Intellectual | *"SOC2 Type II certified, encrypted with AES-256 at rest, and audited biannually by independent third parties."* | *"Your photos are end-to-end encrypted. We cannot view them even if subpoenaed."* | **AES-256**, **biannual** audit |
| *"Foster synergistic collaboration across intertwined departments."* | Pseudo-Intellectual | *"Share live Figma prototypes inside Notion docs with bi-directional comment sync."* | *"Collaborate on family grocery lists that update live across iPhones and Android devices."* | **Bi-directional** sync |
| *"Harness cutting-edge machine learning to maximize ROI."* | Corporate Buzz | *"Reduce cloud compute costs by 22% by automatically shutting down idle staging environments."* | *"Save $45/month on forgotten recurring subscriptions with automated cancel alerts."* | **22%** compute savings, **$45/month** |
| *"Navigate the complex realm of tax compliance effortlessly."* | Frictionless Myth | *"Sales tax calculated automatically across 11,000 US jurisdictions with guaranteed audit defense."* | *"File your state and federal taxes in 20 minutes for a flat $35 fee. No hidden upsells."* | **11,000** jurisdictions, **$35** flat fee |
| *"Experience a paradigm shift in project management."* | Corporate Buzz | *"Assign tasks with a simple `@mention`. No 2-hour onboarding training required."* | *"Check off daily chores in 1 tap and share streaks with your roommate."* | **0 hours** onboarding training |
| *"Unlock powerful insights with our holistic telemetry suite."* | Pseudo-Intellectual | *"Pinpoint slow SQL queries consuming >500ms of CPU time directly from your APM traces."* | *"See your weekly screen time broken down by work apps vs social media."* | **>500ms** query threshold |
| *"Streamline your operations with our bespoke pipeline."* | Corporate Buzz | *"Custom CI/CD pipelines configured via 10-line YAML files, running on dedicated Apple Silicon runners."* | *"Set up automated backups to your personal Dropbox in 3 easy steps."* | **10-line** YAML files |
| *"A testament to our unwavering commitment to excellence."* | Pseudo-Intellectual | *"Maintained 99.992% uptime across all European data centers throughout Q3 2026."* | *"Over 10,000 five-star reviews on the App Store with a 4.9 average rating."* | **99.992%** uptime, **4.9** rating |
| *"Enjoy a completely friction-free checkout journey."* | Frictionless Myth | *"Apple Pay and Google Pay enabled. 1-click checkout with automated address verification."* | *"Buy in 1 tap. Free returns within 30 days with a pre-printed shipping label included."* | **1 click**, **30 days** free return |
| *"Delve deeper into customer sentiment with AI-driven empathy."* | Pseudo-Intellectual | *"Categorize 5,000 monthly customer support tickets into 6 distinct product feedback themes."* | *"See which recipes your dinner guests liked best with a simple thumbs up or down."* | **5,000** tickets into **6** themes |
| *"Embark on a transformative digital journey today."* | Corporate Buzz | *"Start your 14-day full-featured sandbox trial. No credit card required, zero setup calls."* | *"Create your free portfolio website in 10 minutes. Custom domain support included."* | **14-day** trial, **10 minutes** setup |
| *"Look no further for your enterprise data needs."* | Hollow Escalator | *"Query 1 billion rows in Snowflake in under 3 seconds using our optimized caching proxy."* | *"All your receipts organized by tax year in one searchable folder on your Mac."* | **1 billion** rows in **<3 seconds** |

### 3.3 Boundary Enforcement: No Slop Recursion & Context Sensitivity

- **Slop Recursion Immunity**: Every single "After" entry in the dictionary above has been checked against the 48-term blacklist. Not a single recommended replacement contains forbidden AI words cataloged in Section 2.
- **Domain Context Sensitivity**: Notice the distinct tone calibrations:
  * In the B2B column, language is grounded in **enterprise operational realities**: "AES-256", "SOC2 Type II", "11,000 jurisdictions", "99.992% uptime", "auditable dashboard".
  * In the Consumer column, language is grounded in **personal autonomy and emotional clarity**: "no math required", "finish before dinner", "flat $35 fee", "1 tap".

---

## Section 4: Feature 15: Staccato & Legato Cadence Tuning

One of the most obvious markers of AI-generated prose is **monotonous sentence length**. When an LLM generates a paragraph, each sentence almost always contains 16 to 20 words, producing an invariant, soporific academic drone. Human speech and masterful copywriting, by contrast, rely on **musical cadence modulation**: contrasting punchy, rhythmic staccato declarations with expansive, descriptive legato flows.

### 4.1 Musical Cadence Defined

- **Staccato Cadence (2 to 5 words)**: Short, punchy, declarative sentences or purposeful fragments. They create emphatic visual stops, plant strong memory anchors, and inject energy into the reading flow.
  * *Enterprise examples*: *"Paid in 48 hours."*, *"No setup fees."*, *"Audited biannually."*, *"Ship faster."*
  * *Consumer examples*: *"Built for speed."*, *"Zero ads."*, *"Just your notes."*, *"One tap."*
- **Legato Cadence (12 to 18 words)**: Flowing, rhythmic, descriptive sentences. They provide contextual nuance, emotional reassurance, connective reasoning, and technical explanation without causing cognitive fatigue.
  * *Enterprise example*: *"We send automated polite reminders on day 28, 30, and 35 so you never have to play the bad cop with valued clients."* (24 words, rhythmic clause structure).
  * *Enterprise example*: *"Every transaction is checked against your bank's live ledger before posting, preventing duplicate charges before they appear on your monthly statement."* (21 words).

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      SENTENCE CADENCE COMPARISON                            │
├──────────────────────────────────────┬──────────────────────────────────────┤
│ ❌ SYNTHETIC AI DRONE (Monotone)     │ ✅ HUMAN CADENCE (Staccato + Legato)  │
├──────────────────────────────────────┼──────────────────────────────────────┤
│ • Sentence 1: 18 words               │ • Sentence 1 (Staccato): 4 words     │
│ • Sentence 2: 17 words               │ • Sentence 2 (Staccato): 3 words     │
│ • Sentence 3: 19 words               │ • Sentence 3 (Legato): 16 words      │
│ • Sentence 4: 18 words               │ • Sentence 4 (Clincher): 5 words     │
│ • Mean: 18.0 words | StdDev: 0.7     │ • Mean: 7.0 words | StdDev: 5.3      │
│ • Hypnotic, bureaucratic, tiring     │ • Dynamic, conversational, memorable │
└──────────────────────────────────────┴──────────────────────────────────────┘
```

### 4.2 The Antipatterns of AI Cadence

#### Antipattern 1: The Monotone 18-Word Academic Drone
AI text naturally hovers near the median sentence length of written English corpora (18 words). When three or four consecutive sentences share this length, the reader's eye glazes over:
- *Synthetic Example (AI Drone)*:
  > *"Our cloud-based architecture provides comprehensive data synchronization capabilities across all distributed endpoints to ensure continuous real-time consistency. Furthermore, the platform integrates advanced automated recovery mechanisms that systematically mitigate potential data loss during intermittent network disruptions. Consequently, your technical team can maintain peak operational performance without experiencing the administrative overhead associated with manual database maintenance."*
  - **Metrics**: Count: 3 sentences | Lengths: [18, 18, 18] | Mean: 18.0 | Standard Deviation: **0.00**.
  - **Diagnosis**: Mathematically lifeless. Sounds like an unedited textbook or corporate compliance manual.

- *Humanized Refactor (Dynamic Staccato & Legato Cadence)*:
  > *"Your data stays in sync. Everywhere. Even when team members lose internet connection on a flight, our local cache saves every keystroke. When Wi-Fi reconnects, changes merge automatically without merge conflicts. No lost work. No manual restores."*
  - **Metrics**: Count: 5 sentences | Lengths: [6, 1, 16, 9, 6] | Mean: 7.6 | Standard Deviation: **5.08**.
  - **Result**: Crisp, memorable, and human.

#### Antipattern 2: Symmetrical Triad Parallelism
AI creates feature lists where every bullet point has the exact same grammatical structure (Imperative Verb + 2-3 Word Adjective/Noun Phrase + 15-20 Word Subtext):
- *Synthetic Triad (Identical lengths: 6 words headline, 16 words subtext)*:
  * ❌ *“Coordinate your workflows with automated pipelines”* (6 words) — *“Accelerate software deployment cycles with delivery tools that minimize manual configuration across multi-cloud environments.”* (15 words)
  * ❌ *“Track your decisions with real-time analytics”* (6 words) — *“Gain actionable operational visibility through dashboard telemetry designed to support sustained cross-functional organizational growth.”* (14 words)
  * ❌ *“Maintain your operations with enterprise infrastructure”* (6 words) — *“Ensure rock-solid system stability with redundant high-availability clusters that systematically eliminate single points of operational failure.”* (16 words)

- *Humanized Asymmetric Rhythm (60/40 Asymmetry + Staccato Punches)*:
  * ✅ **Lead Feature (Anchor Card, 60% width)**:  
    **“Invoices paid in 48 hours, not 30 days.”** (8 words)  
    *“See who owes you money at a glance. We connect directly to your Stripe or Chase business accounts and notify you the minute funds clear.”* (24 words, legato narrative).
  * ✅ **Tactile Utility (Secondary Card, 40% width)**:  
    **“Automated polite nudges.”** (3 words, punchy staccato)  
    *“Friendly reminders sent on day 28, 30, and 35. You never have to play the bad cop.”* (17 words).
  * ✅ **Objection Killer (Full-Width Banner)**:  
    **“Zero setup fee. Cancel in 1 click.”** (7 words)  
    *“Works with your existing bank. No multi-week onboarding calls.”* (9 words).

#### Antipattern 3: Syllogistic Lecture Structures & Preamble Throat-Clearing
AI models love starting articles, product pages, and emails with patronizing syllogistic preambles:
- ❌ *“In today’s fast-paced digital world, businesses must remain agile to survive. In an ever-evolving technological landscape, having the right tools is essential. That is why we built...”*
- **The Rule**: **Delete the first two sentences entirely.** Eliminate the lecture tone and start directly with the factual subject matter or concrete user benefit:
- ✅ *“Cut server costs by 30% before your next AWS billing cycle.”*

### 4.3 Cadence Tuning Rules & Boundary Safeguards

1. **Sentence Length Variance Standard**:
   - A healthy human paragraph must maintain a sentence length standard deviation of at least **sigma >= 4.0**.
   - Ensure every paragraph contains at least one punchy staccato sentence (<= 6 words) and at least one descriptive legato sentence (>= 12 words).
2. **Run-On Sentence Upper Bound**:
   - Any sentence exceeding **25 to 30 words** without terminal punctuation or natural clause breaks causes cognitive fatigue.
   - When a sentence reaches 28 words, split it into an anchor staccato punch followed by a focused explanatory clause.
3. **Purposeful Staccato Fragments vs Careless Orphans**:
   - *Purposeful Staccato Fragments*: Intentional, self-contained stylistic fragments that deliver emphatic value (*“No credit card required.”*, *“Built for privacy.”*, *“Local-first. Always.”*).
   - *Careless Orphans*: Unintentional syntactic debris caused by clumsy line breaks or orphaned single words stranded without context (*“Instantly.”* or *“Always.”*). Always ensure staccato fragments express a complete conceptual thought.
4. **Multilingual Syllable Expansion (Cadence Across Languages)**:
   - Romance languages such as Spanish typically experience **20% to 35% text expansion** in character length and syllable count compared to concise English phrasing.
   - An English 4-word staccato punch (*“Paid in 48 hours”* — 5 syllables) expands in Spanish (*“Facturas cobradas en 48 horas”* — 12 syllables).
   - *Guideline*: When designing UI containers for internationalization, never fix button widths or headline wrappers to rigid English character counts. Allow flexible container widths (`min-width: max-content` with sensible max bounds), maintain optical line balancing (`text-wrap: balance`), and select natural Spanish idioms rather than literal calques.

---

## Section 5: Value-First CTA Engineering (Feature 16)

### 5.1 The Value-First CTA Formula
AI models and generic UI libraries default to passive, lazy Call-to-Action labels: *"Get Started"*, *"Submit"*, *"Click Here"*, *"Learn More"*. These labels create cognitive drag: the user is forced to speculate about the cost, time commitment, and consequences of clicking.

Human interface engineering employs the **Three-Part Value-First CTA Formula**:

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                     THE VALUE-FIRST CTA FORMULA                             │
├─────────────────────────────────────────────────────────────────────────────┤
│  [ACTION VERB]  +  [TANGIBLE BENEFIT]  +  [FRICTION REDUCER MICROCOPY]      │
│                                                                             │
│  Examples:                                                                  │
│  • Primary Button: "Start your consultation ($35)"                         │
│    Friction Subtext: "Board-certified doctors • Average wait time: 8 mins"  │
│                                                                             │
│  • Primary Button: "Download for macOS (v3.4)"                              │
│    Friction Subtext: "Free 14-day trial • No credit card required"          │
│                                                                             │
│  • Primary Button: "Generate first invoice"                                │
│    Friction Subtext: "Takes ~45 seconds • Connects to Stripe & QuickBooks" │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 5.2 Generic CTA Rejection & Transformation Matrix

Every generic button label must be replaced with a concrete action reflecting the user's immediate job-to-be-done:

| ❌ Generic AI CTA | Why It Fails | ✅ Humanized Value-First CTA | Accompanying Friction Reducer Microcopy |
|---|---|---|---|
| `Get Started` | Completely ambiguous. Does not clarify if it opens a sign-up modal, takes money, or starts a download. | `"Start free 14-day trial"` or `"Build your first board"` | `"No credit card required • 90-second setup"` |
| `Submit` | Cold, bureaucratic database command. Implies submission to authority. | `"Send message to Sarah"` or `"Confirm consultation ($35)"` | `"Encrypted & HIPAA-compliant • Cancel anytime"` |
| `Learn More` | Passive homework assignment. Signals a 2,000-word marketing wall. | `"See how the 2-click sync works"` or `"Read pricing breakdown"` | `"2-minute read • Interactive calculator included"` |
| `Sign Up Now` | Focuses on company's conversion goal rather than user value. | `"Claim your workspace"` or `"Create free account"` | `"Free for up to 5 team members • No credit card"` |
| `Buy Now` | High-friction psychological wall triggering buyer's remorse. | `"Get lifetime access ($59)"` | `"One-time payment • 30-day money-back guarantee"` |
| `Explore` | Aimless wandering. Lacks immediate utility. | `"Browse 120+ verified templates"` | `"Filter by industry • Free preview without login"` |

### 5.3 Primary vs. Secondary Low-Commitment CTA Architecture
Never force a user into a binary "buy or leave" trap. High-performing human interfaces pair high-commitment primary actions with low-commitment secondary alternatives:

```html
<div class="cta-group">
  <!-- Primary High-Intent Action (10% Accent Fill) -->
  <button type="button" class="btn-primary">
    Start free 14-day trial
  </button>

  <!-- Secondary Low-Commitment Action (Ghost / Outline) -->
  <a href="#interactive-demo" class="btn-secondary">
    Explore live sandbox &rarr;
  </a>
</div>
<p class="cta-microcopy">
  No credit card required &bull; Takes 2 minutes &bull; Full API access included
</p>
```

**Secondary Low-Commitment Patterns:**
- Product Tour: `"Watch 2-minute product walkthrough"`
- Live Sandbox: `"Try interactive sandbox (no login required)"`
- Code / Specs: `"Inspect GitHub repository & docs"`
- Sample Output: `"Download sample generated report (PDF)"`

### 5.4 Character Limits, Touch Targets & Viewport Wrapping
- **Character Length Limit**: Primary button labels must stay strictly under **40 characters** (recommended: 20–32 characters). Overlong button text reduces legibility and breaks on mobile. Detailed terms belong in subtext microcopy below the button.
- **Accessible Touch Target**: All clickable CTA surfaces must declare a minimum touch target of **44px × 44px** (iOS HIG) or **48px × 48px** (WCAG 2.5.5 / Android Material).
- **Viewport Wrapping Prevention**: Button labels must enforce `white-space: nowrap` within responsive flex containers to prevent ugly orphaned words on small viewports (320px–375px):

```css
.cta-group {
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.875rem;
}

.btn-cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 48px;
  min-width: 48px;
  padding: 0.75rem 1.5rem;
  font-size: 0.9375rem;
  font-weight: 550;
  white-space: nowrap;
  border-radius: 8px;
  text-decoration: none;
  cursor: pointer;
  transition: transform 120ms cubic-bezier(0.16, 1, 0.3, 1), background-color 150ms ease;
}

.btn-cta:active {
  transform: scale(0.98);
}

@media (max-width: 480px) {
  .cta-group {
    flex-direction: column;
    width: 100%;
  }
  .btn-cta {
    width: 100%;
  }
}
```

### 5.5 Pricing Transparency in CTAs
Human CTAs build radical trust by stating prices upfront instead of hiding fees behind multi-step checkout gates:
- Transparent: `"Start consultation ($35 or copay)"`
- Transparent: `"Buy one-time license ($59) • No subscription"`
- Transparent: `"Free for teams up to 5 • $12/seat thereafter"`

### 5.6 Dynamic Interaction States
A CTA button is not a static graphic; it communicates system status through distinct interaction phases:

| Interaction State | Visual Feedback | Copy Pattern | Accessibility Requirements |
|---|---|---|---|
| **Idle (Resting)** | Primary brand color, crisp contrast | `"Save invoice draft"` | `role="button"`, focus ring visible |
| **Hover** | 10% brightness shift, 1px lift | `"Save invoice draft"` | `:hover` styles, cursor: pointer |
| **Active (Press)** | Tactile compression: `scale(0.98)` | `"Save invoice draft"` | Hardware spring animation |
| **Loading / Submitting** | Inline spinner replaces icon | `"Saving draft..."` | `aria-busy="true"`, `aria-disabled="true"`, do not freeze layout |
| **Success / Complete** | Gentle green checkmark, brief dwell | `"Draft saved!"` | Dwell 1200ms before redirect; announce via `aria-live="polite"` |
| **Disabled** | Subdued contrast, no pointer | `"Save invoice draft"` | Provide tooltip or inline text explaining *why* disabled (e.g. *"Enter recipient email to enable save"*); do NOT use pure uncommunicative gray |

---

## Section 6: Empathetic Microcopy & Resilient Error Recovery (Feature 17)

### 6.1 The Three-Part Empathetic Error Formula
Generic AI interfaces produce either terrifying raw system dumps (*"Error 500: An unexpected error occurred"*) or childish sycophancy (*"Oops! Something went wrong! 🙈"*). 

Human microcopy treats users as competent adults through the **Three-Part Empathetic Error Formula**:

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                 THE 3-PART EMPATHETIC ERROR FORMULA                         │
├─────────────────────────────────────────────────────────────────────────────┤
│  1. WHAT HAPPENED: Plain, human diagnosis in zero-jargon language.         │
│  2. WHY IT HAPPENED: Honest, transparent reason that NEVER blames the user.│
│  3. HOW TO FIX IT: Actionable 1-click recovery path with fallbacks.        │
│                                                                             │
│  Example:                                                                   │
│  "We couldn't connect to your Stripe account. Your API keys may have been   │
│   rotated or revoked. [Re-authenticate Stripe] or [Use manual invoice entry]│
└─────────────────────────────────────────────────────────────────────────────┘
```

### 6.2 Banishment of Cold System Dumps & Blame-Shifting Tropes

| ❌ AI / Cold Antipattern | Why It Fails | ✅ Humanized Empathetic Error Message | Actionable 1-Click Recovery |
|---|---|---|---|
| `Error 500: An unexpected error occurred. Please contact support.` | Induces panic; gives zero insight into state of user data; leaves user stranded. | `"We couldn't generate your monthly report right now. Our servers encountered a temporary hiccup, but your underlying financial data is completely safe."` | `[Retry report generation]` or `[Download raw CSV export]` |
| `Oops! Something went wrong! 🙈` | Infantilizing, condescending, and dismissive of the user's valuable time. | `"We couldn't complete your order due to a payment processing delay."` | `[Retry card payment]` or `[Switch to PayPal]` |
| `You entered an invalid email address.` | Accusatory; shifts blame onto the user for formatting variations. | `"That email format looks a bit off (e.g., name@domain.com). Missing an '@' symbol?"` | Inline cursor auto-focus on mistake |
| `Error: Coupon code invalid.` | Frustrating dead end at the highest friction point of checkout. | `"We couldn't find the coupon code 'SUMMER50'. It expired yesterday (Oct 28th). Would you like to try 'FALL20' for 20% off?"` | `[Apply code FALL20 for 20% off]` |
| `Upload failed: Request payload too large.` | Exposes internal server architecture constraints without actionable solution. | `"'brand-assets.zip' is 68 MB. Our upload limit is 50 MB to ensure fast syncing across your team."` | `[Compress files with 1 click]` or `[Link from Google Drive]` |

### 6.3 Contextual Empty States (Three Critical Scenarios)
Empty states must never display a sterile `"No data found."` or launch into juvenile party-popper cheerleading. Tailor empty states to the user's specific context:

1. **First-Time User (Onboarding / Zero Data):**
   - Welcoming, educational, sets realistic time expectations.
   - Example: *"No invoices yet. When you complete your first client milestone, click 'Create Invoice'—it takes about 45 seconds. [Create your first invoice]"*.
2. **User-Cleared State (Inbox Zero / Task Completed):**
   - Quiet satisfaction and calm reassurance.
   - Example: *"All caught up! You've reviewed all 18 customer tickets for today. No pending items in queue."*.
3. **Filtered / Search Zero State:**
   - Diagnostic clarity with immediate 1-click reset.
   - Example: *"No transactions matched the filter 'amount > $5,000' in October. [Clear all filters] or [Broaden date range to 90 days]"*.

### 6.4 Offline Connectivity & Resilient Background Sync
Network dropouts are inevitable in real-world mobile and field environments. The interface must provide calm reassurance without blocking productivity:

```html
<!-- Floating Resilient Offline Toast / Banner -->
<aside class="offline-banner" role="status" aria-live="polite">
  <span class="offline-indicator" aria-hidden="true"></span>
  <div class="offline-content">
    <p class="offline-title">Working offline</p>
    <p class="offline-desc">
      Your draft is saved locally on your device. We'll automatically sync your 3 changes when your connection returns.
    </p>
  </div>
  <button type="button" class="btn-retry" onclick="triggerImmediateSync()">
    Retry now
  </button>
</aside>
```

### 6.5 High-Stress Domain Calmness & Dignity
In FinTech, Healthcare, E-commerce, and Legal applications, system errors induce acute stress. 
- **Rule 1 (Preserve Capital & Data):** Always state explicitly that money was not deducted or medical data was preserved: *"Your card was not charged. We've reserved your consultation slot for the next 15 minutes."*
- **Rule 2 (Color Restraint):** Never flood the screen with aggressive neon red banners. Use warm terracotta (`#C85A32`) or grounded amber (`#D97706`) with high-contrast text.
- **Rule 3 (Dignity):** Respect the user's emotional state. Avoid jokes, memes, or cartoon mascots during billing failures or diagnostic errors.

### 6.6 Accessibility & Security Protocols
- **ARIA Error Binding**: Every form validation error must link to its input via `aria-describedby` and set `aria-invalid="true"`:
  ```html
  <label for="user-email" class="form-label">Work email</label>
  <input 
    type="email" 
    id="user-email" 
    name="email" 
    class="form-input input-error" 
    aria-invalid="true" 
    aria-describedby="email-error-hint"
    value="julian@example"
  />
  <p id="email-error-hint" class="form-error-msg" role="alert">
    Looks like the domain is incomplete (e.g., julian@example.com).
  </p>
  ```
- **Security & Stack Trace Masking**: Client-facing error states must **never** leak raw stack traces, database schema details, SQL queries, internal IP addresses, or environment variables. Mask internal details behind a human-readable correlation reference:
  - *"We couldn't save your preferences right now. Our engineering team has been notified. Reference code: #PREF-8821. [Try again]"*.

---

## Section 7: Bilingual Cliché Adaptation (EN & ES) (Feature 18)

### 7.1 The Spanish AI Cliché Blacklist & Humanization Catalog
Because LLMs are primarily trained on English corpora and translated via statistical alignment, Spanish AI copy is saturated with direct Anglicisms, literal calques, and corporate buzzwords. Below is the reference catalog of Spanish AI clichés alongside natural Hispanic and Latin American phrasing:

```markdown
| ❌ Banned Spanish AI Cliché | Why AI Generates It | Meaning / Calque Origin | ✅ Natural Human Spanish Alternative | Contextual Example in UI |
|---|---|---|---|---|
| `empoderar` / `empoderando` | Direct calque of English *"empower"*. Sounds pretentious and artificial in Spanish tech copy. | To give power / facilitate | *"Organiza"*, *"facilita"*, *"da el control a tu equipo"*, *"herramientas para"* | ❌ *"Empodera tu flujo de trabajo"*<br>✅ *"Organiza tu equipo en un solo lugar"* |
| `sin fisuras` | Direct literal translation of *"seamless"*. In Spanish, *"fisura"* refers to bone fractures or structural cracks. | Frictionless / integrated | *"Fluido"*, *"sin interrupciones"*, *"en un solo paso"*, *"directo"* | ❌ *"Una integración sin fisuras"*<br>✅ *"Conecta tus cuentas en 90 segundos"* |
| `tapiz` | Literal translation of LLM favorite *"tapestry"*. Extremely unnatural in business and software. | Complex overview / fabric | *"Resumen"*, *"panorama"*, *"vista general"*, *"panel"* | ❌ *"Un rico tapiz de datos financieros"*<br>✅ *"Tus ingresos y gastos en una sola vista"* |
| `desbloquear` | Calque of *"unlock"* (e.g. *"unlock your potential"*). In Spanish, sounds like unlocking a padlock or phone screen. | Enable / gain access | *"Descubre"*, *"activa"*, *"consigue"*, *"accede a"* | ❌ *"Desbloquea el poder de la analítica"*<br>✅ *"Descubre qué clientes pagan a tiempo"* |
| `revolucionar` | Calque of *"revolutionize"*. Cheap hyperbole lacking substance. | Radical change | *"Mejora"*, *"agiliza"*, *"moderniza"*, *"simplifica"* | ❌ *"Revoluciona tu facturación"*<br>✅ *"Facturación rápida para agencias"* |
| `transformar` | Generic corporate filler for *"transform"*. | Alter completely | *"Convierte"*, *"pasa de X a Y"*, *"reorganiza"* | ❌ *"Transforma tu negocio hoy"*<br>✅ *"Cobra en 48 horas, no en 30 días"* |
| `profundizar` | Literal translation of *"delve"*. Marker of ChatGPT academic tone. | Explore deeply | *"Revisa en detalle"*, *"analiza"*, *"conoce"* | ❌ *"Profundiza en tus métricas fiscales"*<br>✅ *"Revisa los números de este trimestre"* |
| `holístico` / `holística` | Calque of *"holistic"*. Vague pseudo-intellectual buzzword. | Comprehensive | *"Completo"*, *"integral"*, *"de principio a fin"* | ❌ *"Una solución holística para salud"*<br>✅ *"Atención médica completa desde casa"* |
| `de vanguardia` | Cliché translation of *"cutting-edge"*. Outdated 1990s marketing jargon. | Modern / advanced | *"Moderno"*, *"actualizado"*, *"avanzado"*, *"robusto"* | ❌ *"Tecnología de vanguardia"*<br>✅ *"Software rápido y sin caídas"* |
| `sin precedentes` | Calque of *"unparalleled / unprecedented"*. Unverifiable superlative. | Unrivaled | *"Destacado"*, *"único"*, o eliminar el adjetivo | ❌ *"Rendimiento sin precedentes"*<br>✅ *"Abre proyectos en 300 ms"* |
| `potenciar al máximo` | Cliché for *"supercharge / maximize"*. | Optimize | *"Aprovecha"*, *"saca más partido a"*, *"ahorra tiempo"* | ❌ *"Potencia al máximo tus ventas"*<br>✅ *"Cierra más presupuestos este mes"* |
| `navegar por el ámbito` | Horrible literal calque of *"navigate the realm of"*. | Deal with / manage | *"Gestionar"*, *"moverse por"*, *"explorar"* | ❌ *"Navega por el ámbito contable"*<br>✅ *"Gestiona tus impuestos sin errores"* |
| `libera el potencial` | Literal translation of *"unleash the potential"*. | Enable capability | *"Empieza a crear"*, *"pon en marcha"*, *"descubre"* | ❌ *"Libera el potencial de tu marca"*<br>✅ *"Crea logotipos vectoriales limpios"* |
| `eleva tu` | Calque of *"elevate your..."*. Empty escalator verb. | Improve | *"Mejora tu"*, *"optimiza"*, *"haz crecer"* | ❌ *"Eleva tu experiencia digital"*<br>✅ *"Una app rápida para tu día a día"* |
```

### 7.2 Unnatural Translation Calques (Anglicisms to Eliminate)

```markdown
| ❌ English Formulaic Cliché | ❌ Literal AI Translation Calque | ✅ Natural Spanish Phrasing (Human UI) |
|---|---|---|
| *"Where X meets Y"* | *"Donde la innovación se encuentra con la excelencia"* | *"Software de facturación para estudios de diseño"* |
| *"Say goodbye to X, say hello to Y"* | *"Dile adiós a las hojas de cálculo, dile hola al crecimiento"* | *"Deja de perseguir facturas impagadas manualmente"* |
| *"Click here for more information"* | *"Haga clic aquí para más información"* | *"Ver detalles y tarifas"* |
| *"Friction-free experience"* | *"Una experiencia libre de fricciones"* | *"Configuración lista en 2 minutos"* |
| *"Please enter your credentials"* | *"Por favor, introduzca sus credenciales"* | *"Escribe tu correo y contraseña"* |
| *"All-in-one platform to supercharge your team"* | *"La plataforma todo en uno para supercargar a tu equipo"* | *"El calendario de tu equipo, sin correos de ida y vuelta"* |
```

### 7.3 Tone & Register Calibration: "Tú" vs. "Usted"
Spanish possesses grammatical registers that fundamentally alter the emotional distance of the interface:

- **The Informal Register ("Tú"):**
  - Standard for: SaaS, mobile apps, dev tools, e-commerce, consumer platforms, and tech startups across both Spain and Latin America.
  - Tone: Approachable, conversational, modern, collaborative.
  - Example: *"Guarda tus cambios antes de salir"* / *"¿Necesitas ayuda con tu pedido?"*.
- **The Formal Register ("Usted"):**
  - Reserved for: Private banking, asset management, clinical health diagnostics for elderly demographics, legal applications, and government tax interfaces.
  - Tone: Dignified, respectful, professional distance.
  - Example: *"Guarde sus cambios antes de salir"* / *"¿Requiere asistencia con su cuenta?"*.
- **The Golden Rule of Consistency:** Never mix registers within the same flow or component:
  - ❌ *Clash:* `"Guarda tus cambios y haga clic en continuar"` (Mixes *tus* [tú] with *haga* [usted]).
  - ✅ *Uniform Tú:* `"Guarda tus cambios y haz clic en continuar"`.
  - ✅ *Uniform Usted:* `"Guarde sus cambios y haga clic en continuar"`.

### 7.4 Spanish Text Expansion Factor (20% to 35%)
Spanish UI copy naturally expands by **20% to 35% in length** compared to English source strings. Failing to anticipate this expansion causes broken layouts, clipped text, and awkward line breaks:

| English UI String | Length (EN) | Natural Spanish UI String | Length (ES) | Expansion Factor |
|---|:---:|---|:---:|:---:|
| `Settings` | 8 chars | `Configuración` | 13 chars | **+62%** |
| `View all` | 8 chars | `Ver todos` | 9 chars | **+12%** |
| `Search transactions` | 19 chars | `Buscar transacciones` | 20 chars | **+5%** |
| `Save changes` | 12 chars | `Guardar cambios` | 15 chars | **+25%** |
| `No credit card required` | 24 chars | `No requiere tarjeta de crédito` | 30 chars | **+25%** |
| `Download for macOS (v3.4)` | 24 chars | `Descargar para macOS (v3.4)` | 26 chars | **+8%** |
| `Start your consultation` | 23 chars | `Iniciar tu consulta médica` | 26 chars | **+13%** |

**Responsive CSS Rules for Spanish Expansion:**
1. Avoid fixed container widths (`width: 120px`). Use `min-width`, `max-content`, or flexbox auto-growth.
2. In Bento grids and cards, use `grid-template-columns: repeat(auto-fit, minmax(280px, 1fr))` rather than rigid fixed columns to allow Spanish strings to breathe.
3. Apply `white-space: nowrap` on CTA buttons alongside wrapping parent containers (`flex-wrap: wrap`) to prevent buttons from awkwardly breaking into multiple lines.

### 7.5 Spanish Punctuation & Typography Conventions
- **Mandatory Inverted Marks (`¿` and `¡`):** In Spanish, interrogative and exclamatory phrases must open with inverted punctuation. Never drop them in UI headlines, confirmation dialogs, or helper copy:
  - ❌ *"Olvidaste tu contraseña?"* &rarr; ✅ *"¿Olvidaste tu contraseña?"*
  - ❌ *"Bienvenido a bordo!"* &rarr; ✅ *"¡Te damos la bienvenida!"*
  - ❌ *"Deseas eliminar este borrador?"* &rarr; ✅ *"¿Quieres eliminar este borrador?"*
- **Unicode Accent Fidelity:** All Spanish diacritics (`á`, `é`, `í`, `ó`, `ú`, `ñ`, `ü`) must be rendered accurately in UTF-8. Never strip accents to avoid font rendering bugs.

### 7.6 Natural Gender-Neutral UX in Spanish
AI models frequently attempt to solve gender inclusivity in Spanish by inventing unpronounceable characters or symbols: `bienvenid@s`, `usuarixs`, `tod*s`, `amigues`. These typographical constructs violate Spanish syntax and severely break screen readers (which read *"usuari-arroba"* or *"usuari-equis"*).

Human Spanish UX achieves natural neutrality through **natural syntactic restructuring**:

| ❌ Clunky AI Attempt | Flaw | ✅ Natural Human Restructuring | Syntactic Mechanism |
|---|---|---|---|
| `Bienvenido usuario` / `Bienvenid@` | Excludes women or breaks screen readers with `@`. | `"Te damos la bienvenida"` or `"Hola, [Nombre]"` | Verbal phrase / direct greeting |
| `El usuario debe confirmar su correo` | Unnecessary masculine singular noun. | `"Confirma tu correo para continuar"` | Direct imperative address |
| `Los doctores disponibles` | Assumes exclusively male physicians. | `"El equipo médico de guardia"` | Collective noun |
| `¿Estás seguro de que deseas salir?` | Gendered adjective (*seguro*). | `"¿Quieres cerrar sesión?"` or `"¿Confirmas que deseas salir?"` | Active verb construction |
| `Los desarrolladores pueden integrar...` | Masculine plural default. | `"Cualquier persona del equipo técnico puede integrar..."` | Epicene expression |

### 7.7 Comprehensive Bilingual Side-by-Side Reference

| UI Component | English (Human Craft) | Spanish (Human Craft) | Domain Context |
|---|---|---|---|
| **Primary Hero CTA** | `"Start free 14-day trial"`<br><small>`No credit card required • Cancel anytime`</small> | `"Empieza tu prueba gratuita de 14 días"`<br><small>`Sin tarjeta de crédito • Cancela cuando quieras`</small> | B2B FinTech / SaaS |
| **Secondary Hero CTA** | `"Explore interactive sandbox &rarr;"` | `"Explora la demo interactiva &rarr;"` | B2B FinTech / SaaS |
| **Telehealth Intake CTA**| `"Start your consultation ($35)"`<br><small>`Average wait time: 8 mins`</small> | `"Iniciar tu consulta médica ($35)"`<br><small>`Tiempo de espera medio: 8 minutos`</small> | Healthcare |
| **Creative Tool CTA** | `"Download for macOS (v3.4)"`<br><small>`$59 one-time • No subscription`</small> | `"Descargar para macOS (v3.4)"`<br><small>`Pago único de $59 • Sin suscripciones`</small> | Creative Studio |
| **Coupon Code Error** | `"We couldn't find coupon code 'SAVE50'. It expired yesterday. [Try code FALL20 for 15% off]"` | `"El código 'SAVE50' ya no está activo; caducó ayer. [Aplicar código FALL20 con 15% de descuento]"` | E-Commerce Checkout |
| **Payment Network Error**| `"We couldn't reach your bank right now. Your card was not charged. [Retry payment] or [Use PayPal]"` | `"No pudimos conectar con tu banco en este momento. No te hemos cobrado nada. [Reintentar pago] o [Pagar con PayPal]"` | Checkout / High Stress |
| **File Upload Error** | `"'q3-report.pdf' exceeds our 50 MB limit. [Compress file with 1 click]"` | `"'informe-t3.pdf' supera el límite de 50 MB. [Comprimir archivo en 1 clic]"` | SaaS Productivity |
| **First-Time Empty State**| `"No invoices yet. When you complete a milestone, click 'Create Invoice'—it takes 45 seconds. [Create first invoice]"` | `"Aún no tienes facturas. Cuando completes un encargo, pulsa en 'Crear factura'—tardas menos de un minuto. [Crear primera factura]"` | Onboarding Dashboard |
| **Inbox Zero State** | `"All caught up! You've reviewed all 14 pull requests for today."` | `"¡Todo al día! Has revisado las 14 solicitudes de cambio pendientes."` | Developer Tools |
| **Filter Zero State** | `"No clients found matching 'overdue' in Madrid. [Clear all filters]"` | `"No hay clientes con cobros pendientes en Madrid. [Restablecer filtros]"` | CRM / Filter State |

---

## Section 8: Quick Sanity Checklist

A 10-point rapid PR and copy sanity checklist for code reviews and editorial checks:

1. [ ] **Zero Banned Buzzwords**: Does the copy eliminate all 48 blacklisted terms cataloged in Section 2 (hollow escalators, pseudo-intellectual connectors, and frictionless myths)?
2. [ ] **Tangible Action Verbs**: Does every heading, feature point, and button lead with a concrete physical verb (`cut`, `send`, `show`, `build`, `block`) rather than Latinate abstractions (`facilitate`, `orchestrate`)?
3. [ ] **Verifiable Numbers & Proof**: Do value claims include concrete metrics (*"in 90 seconds"*, *"48 hours"*, *"12 months"*) rather than uncalibrated superlatives (*"lightning fast"*, *"boundless"*)?
4. [ ] **Musical Cadence Modulation**: Does the paragraph alternate between punchy staccato anchors (2 to 5 words) and flowing legato explanations (12 to 18 words), achieving sentence length standard deviation sigma >= 4.0?
5. [ ] **No Monotone 18-Word Drone**: Did you verify that no 3 consecutive sentences share identical word counts (around 18 words)?
6. [ ] **Value-First CTAs**: Do all primary buttons employ the formula `[Action Verb] + [Tangible Benefit]` (under 40 characters) paired with friction-reducing microcopy (`No credit card required`)?
7. [ ] **Generic Label Rejection**: Are cold labels like *"Get Started"*, *"Submit"*, and *"Learn More"* banished?
8. [ ] **Empathetic Error Recovery**: Do all error states provide the 3-part diagnostic formula (`What happened` + `Why it happened` + `1-click recovery action`) without "Oops!" or cold "Error 500" dumps?
9. [ ] **Bilingual Cliché Elimination**: Does Spanish copy eliminate robotic translation calques (such as those cataloged in Section 7) and maintain uniform register ("Tú" vs "Usted")?
10. [ ] **Text Expansion Resilience**: Do UI button and card containers support 20% to 35% text expansion in Spanish via `min-width`, `flex-wrap`, and `white-space: nowrap` without clipped text?
"""

target = Path(r"C:\Users\JULIAN\.gemini\config\skills\human-interface-design\references\conversational-copy.md")
target.write_text(content.strip() + "\n", encoding="utf-8")
print(f"Successfully wrote {len(content)} chars to {target}")
