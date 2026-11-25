---
title: "Running Naked Through the Data Swamp"
description: "Your digital foundation still isn't solid. How are you going all-in on AI?"
date: 2026-11-21
category: analysis
lastVerified: 2026-11-21
machineTranslated: true
sourceHash: 0aec31533d47
---

Another company just plugged a shared drive that hasn't been cleaned in ten years straight into their knowledge base.

That drive is littered with hundreds of spreadsheets named things like `product_description_final_v3_will_not_change_ever.xlsx`. The same product has three different names across the ERP system, the e-commerce backend, and the sales team's spreadsheet. After seeing wall-to-wall Agent news this year, the boss made a call in Monday's all-hands: we're going to leapfrog the competition, all-in on AI.

Two months later, the AI is running. Every day it retrieves from that drive—which looks like a sorting hub that exploded after Singles' Day—at millisecond speed, with the confident tone of a broadcaster, citing product specs that were obsolete three years ago to answer customer service questions. And because the legacy business system doesn't have a single API, sales reps spend their days opening a web chat, copying in customer requirements, waiting for the AI to spit out some text, then manually copy-pasting it back into the ERP—while casually dropping two lines in the process.

That's what I mean by running naked through a data swamp.

Sound familiar? The industry is seeing these kinds of wrecks happen in bulk. [RAND's report](https://www.rand.org/) estimates that over 80% of AI projects ultimately fail—the top cause of death is getting the problem statement wrong from day one, followed closely by lacking quality data. [S&P Global's figures](https://www.spglobal.com/market-intelligence/en/news-insights/research/2025/10/generative-ai-shows-rapid-growth-but-yields-mixed-results) show that the share of enterprises deciding to abandon most of their AI pilots has skyrocketed from 17% in 2024 to 42% in 2025. In [Gartner's survey](https://www.gartner.com/en/newsroom/press-releases/2025-02-26-lack-of-ai-ready-data-puts-ai-projects-at-risk), 63% of organizations either lack or are unsure whether they have data management capabilities suitable for AI; based on this, Gartner predicts that by the end of 2026, 60% of AI projects lacking usable data will be canceled outright.

Japan's not much better. [IPA's 2025 DX Trends report](https://www.ipa.go.jp/digital/chousa/discussion-paper/tbl5kb0000006bvm-att/dx2025_activities_for_driving_growth.pdf) shows roughly eighty percent of Japanese enterprises are pursuing digital transformation (DX), but only six percent say they're actually seeing results. Among companies with fewer than 100 employees, only 46.8% are attempting DX at all, and 85.1% complain they're short on staff—and yes, they'll only pay them the legal minimum wage.

A lot of executives harbor a wishful thought: digitalization is too painful and slow—can't we skip road-building and double-jump straight past it?

To talk people out of that idea (and to save myself from explaining this over and over), I built an open-source self-assessment tool called **[AINativeBench (AI-Native Dual-Axis Diagnostic)](https://rami0291.com/ainativebench/)**. The core assessment is sixteen questions and takes five minutes to complete.

---

## 1. Why counting AI adoption alone will get you killed

Most maturity assessments out there are asking "how many accounts did you buy" and "how many tokens did you consume." But to me, talking about AI adoption without a digital foundation is like counting how many stories you've built on quicksand.

In [AINativeBench](https://rami0291.com/ainativebench/), I used two axes: the X-axis is **digital maturity**—drawing on the four pillars of digitalization—measuring whether your data flows across systems and touchpoints (connectivity), whether systems have APIs (programmability), whether processes can close loops automatically (autonomy), and whether frontline staff can adjust their own data (empowerment). The Y-axis is **AI adoption and integration**—spanning enterprise account infrastructure, knowledge base accumulation, moving beyond chat boxes, depth of production involvement, compliance guardrails, and all the way to measuring rework rates to defend against "AI tax."

Also, this diagnostic doesn't account for AI-native business models.

The two axes intersect at 60 points, creating four quadrants: top-right is the AI-native leadership zone, bottom-right is the steady momentum zone, bottom-left is the ancient fossil zone, and top-left is the most dangerous **hallucination run-naked zone**.

I also baked in four safeguards against self-delusion:

**Foundation Instability Discount**

If your AI aggressiveness exceeds your digital foundation by 10 to 20 points, the dashboard turns yellow and enters warning mode. Once it exceeds 20 points, you're flagged as "foundation instability" and a penalty formula kicks in. I believe that when a company is in the run-naked zone, every extra point of AI effort on a crumbling foundation makes things worse, not better.

**Guardrail Caps and Cross-Validation**

A lot of executives tend to give themselves high marks when filling out surveys. If you don't have an employee AI usage policy in your compliance section, then no matter how aggressive your production involvement score is, the system caps that item at 50% by force. At the same time, the back end automatically catches four patterns of contradictory responses:

- 'AI has silently integrated into backend workflows,' but your core system is closed-box legacy software. No APIs—so how is the AI result writing back to the system? (Squeezing the employees again?)
- 'A unified, dynamic knowledge source across the company,' yet you're still manually syncing Excel reconciliations. Systems aren't even connected—who's staying up half the night every day to sync the knowledge base?
- 'AI involved in core production,' but no basic automated rollback capability.
- 'AI involved in core production,' yet you haven't even bought enterprise accounts.

**Evidence Verification Rings**

Each scoring question has a checkbox: 'I have evidence I can show (policy documents, backend screenshots, monitoring data).' Questions without evidence backing get auto-downgraded one tier when calculating conservative scores. If you later trip the same landmine in the anti-pattern self-check, they drop another tier. On the matrix, your self-rating is a solid blue circle; your score after evidence review is a hollow circle.

**CEO Attention Halo**

In SMEs, most decisions come from the boss, so asking 'does leadership value digital talent' is pointless—no boss will admit they don't. Instead, I added six yes-or-no questions that only look at facts: Is there a standalone budget line item for the year (so departments don't fight over 'why are we using my budget for this')? Is there a named owner written into KPIs? Has the boss personally used AI every week in the past month—can they fire it up and show people right now? Has anyone rewritten a single job description in the past year? Do you have an example of a pilot that failed without anyone getting nailed for it? Is there a written roadmap solid enough to survive even if the boss is gone for three months?

---

## 2. Nine cyber-corporate diseases and two types of pseudo-digitalization

To help executives recognize their own company, I've mapped out 16 common anti-patterns in [AINativeBench](https://rami0291.com/ainativebench/) as corporate personas. Nine out of ten companies stuck in the hallucination run-naked zone will see themselves in these nine:

| Corporate Persona | Typical Symptoms | Landmine Hit |
| --- | --- | --- |
| **The Hallucinating Sprinter** | Master data is nowhere near aligned, yet they treat the LLM output as gospel; their own delusions outpace the AI's | Garbage in, garbage out |
| **The Bare-Data Risk Taker** | No enterprise accounts, no data masking guardrails—shipping customer core data straight to production via AI | Shadow AI and responsibility vacuums |
| **The Human API Sherpa** | Legacy systems aren't programmable, so employees become human clipboards shuttling between chat boxes and business systems all day | Human APIs |
| **The PDF Sculptor** | Moves offline paper approvals straight into OA without changing a thing, keeping approval layers intact, mistakes PDF filing for digitalization | Rules stay in people's heads, triggering silent decisions |
| **The Cyber Hoarder King** | Dumps a decade of uncleaned shared drive straight into RAG, AI confidently citing obsolete policies | Errors with citations |
| **The Screen-Click Marionette** | Passes off mouse-click simulation RPA as API-fication—one website redesign and the whole thing goes down | No transaction rollback, production incidents |
| **The Token Incinerator** | Reports "500 artifacts per day" and "a million token calls," never counts the downstream cleanup time | Bookkeeping boom, ROI unclear |
| **The PoC Ferryman** | Eight pilots per year because they ignore costs and never touch real systems—always "works great," never ships | Frozen in demos, nobody maintains it |
| **The Single-Point-of-Failure Cyber Chief** | Entire company's prompts, scripts, and data pipelines live in one person's head—they quit and everything breaks | SPOF dependency, zero governance |

We used to say: 'Management thinks the company is digitalized, but frontline work is still Excel spreadsheet art.' I break down this pseudo-digitalization into two types:

One type is the **PDF Sculptor**. They've got OA and online workflows, but they just moved offline queue-waiting onto screens. Approval thresholds, which longtime customers get fast-track treatment—the rules live in the approver's head, never written down as conditional logic.

The other type is the **Human API Sherpa**. They bought real ERP and CRM systems, but the software is still that closed-box, opaque architecture from a decade ago—either no APIs at all, or APIs without idempotency or sandboxing (the Agent times out, retries once, and you've got a duplicate purchase order).

The first needs code-based approval rules extracted from people's heads. The second needs real APIs with authentication and idempotent keys for high-frequency operations.

---

## 3. Four failure modes: 'Silent decisions' are scarier than hallucinations

Usually we think of risk in the run-naked company as a simple line: 'unstructured data → feed AI dirty data → AI hallucinates.' But I think that misses the scarier stuff.

If you break down how weak-foundation companies fail when AI gets forced on them, there are four mechanisms running in parallel.

### 1. Dirty data creates errors with sources

[OpenAI's September 2025 paper](https://openai.com/index/why-language-models-hallucinate/) shows that models hallucinate not because of dirty data—the root cause is that pretraining objectives and current benchmarks reward the model for 'guessing even when it doesn't know.' Clean enterprise data doesn't change that. A system without refusal mechanisms will fabricate even if fed textbook-perfect data.

So does that mean dirty data doesn't matter?

Vector retrieval (RAG) pulls back 'semantically similar chunks'—it has no idea which file is 'current and authoritative.' Five versions of policy coexist on the shared drive. The model retrieves the 2022-obsolete reimbursement standard, delivers the answer with a straight face, and even includes a file link. This cited error is scarier than pure fabrication: only someone deeply familiar with the business can spot this kind of 'sourced but contaminated' answer.

And if someone cuts corners and says 'skip retrieval, just cram the whole folder—hundreds of pages—into long context,' they've hit another trap. [Chroma's Context Rot experiment](https://www.beri.net/learning/chroma-context-rot-report) tested eighteen state-of-the-art models. Every single one: longer inputs degrade performance faster; dense, semantically similar noise confuses the model.

### 2. Employees become human APIs

Without programmable interfaces, Agents are stuck trash-talking in a chat box.

A lot of companies excitedly built a dozen internal helper bots, forcing employees to paste business data into templates, then paste results back. Every manual cross-window copy-paste erases the time AI saved, occasionally introduces new line misalignments, and worst of all leaves zero system logging. That's why the more bots you build, the more frontline staff want to quit.

### 3. Shadow AI and inescapable legal liability

If companies don't provide a good legitimate tool or straight-up ban it, employees will sneak customer lists and contracts into their free accounts to get home on time. [IBM's 2025 data breach report](https://newsroom.ibm.com/2025-07-30-ibm-report-13-of-organizations-reported-breaches-of-ai-models-or-applications,-97-of-which-reported-lacking-proper-ai-access-controls) did the math: 20% of surveyed organizations have already had a data breach from Shadow AI, and when heavy shadow AI users get hit, they pay an extra \$670,000 on average in remediation; among all organizations hit with AI-related breaches, 97% lacked basic AI access controls.

And don't count on blaming the LLM after things go wrong. In the famous [Moffatt v. Air Canada case](https://www.americanbar.org/groups/business_law/resources/business-law-today/2024-february/bc-tribunal-confirms-companies-remain-liable-information-provided-ai-chatbot/), Air Canada's customer service bot fabricated a bereavement refund policy that didn't exist. Air Canada argued that the chatbot was an independent legal entity and they weren't responsible for its statements—the tribunal shut that down and ordered them to pay. [Deloitte Australia](https://www.techradar.com/pro/deloitte-forced-to-refund-aussie-government-after-admitting-it-used-ai-to-produce-error-strewn-report) had to publicly apologize and refund the government after their AI-generated report was full of errors. By December 2, 2027, [the EU AI Act](https://secureprivacy.ai/blog/eu-ai-act-digital-omnibus-the-new-high-risk-ai-deadlines-after-council-approval) Annex III high-risk system compliance obligations take effect—treating 'every word the AI outputs' as the deploying company's official commitment will become the global legal default.

### 4. Silent decisions

Where rules aren't written down, the AI doesn't stop and ask—it quietly decides for you. See: [graph-workflow development and engineering battle notes](https://rami0291.com/notes/brawl-with-graph-workflow/).

## Four: How to use AI to catch up on digitalization without three years of brutal traditional DX first?

By this point, if you're a boss stuck in the high-hallucination reckless zone, you're probably asking: Do I really have to shut down all my AI, spend three years getting a consulting firm through traditional DX, then come back to AI?

You don't have to be that hopeless. My recommendation: pull AI back from your customer-facing core production workflows. Turn your guns around and use it to do the hardest slog of "catching up on data foundation work"—but you have to keep it on a short leash with deterministic code and human review as a choke point.

External research proves this path works, but don't expect it to be a one-shot deal. A 2025 [invoice extraction study published on MDPI](https://www.mdpi.com/2079-9282/14/11/2145) tested GPT-4o on real business invoices: single-field accuracy hit 97.15%, which looks great. But when you calculate the "document-level accuracy" where the entire invoice has to be perfect, it drops to 85.29%—that's roughly one botched invoice per seven. Yokohama City in Japan converted about 4,500 pages of PDF regulations into structured data queryable by RAG, and even after getting it working, their official conclusion was "continuous human tuning is mandatory."

For the work of knowledge base consolidation (the Y2 and X1 on the chart), there's a low-cost pattern called **[LLM-Wiki](https://rami0291.com/notes/why-llm-wiki-fits-sme-knowledge-bases/)**—though it's not perfect either.

It borrows the architecture Karpathy proposed in April 2026. The biggest difference from traditional RAG is: **you do the hard work of organizing knowledge at ingest-time, not query-time.**

1. **`raw/` Original Layer (read-only, never modified)**: Meeting transcripts, raw contracts, operator manuals, interviews with veteran employees—locked here unchanged as the company's single source of truth.
2. **`_proposals/` Proposal Buffer Layer**: Every new piece of documentation might require edits to 10–15 existing knowledge pages. The LLM can't modify the production wiki directly; it can only file a PR in the proposal area, where a business owner reviews and clicks confirm before it merges into the official `wiki/`.
3. **`wiki/` Compiled Layer and Weekly `Lint` Scan**: Every conclusion written into Wiki must hyperlink back to the `raw/` original. Run a `Lint` audit script weekly to catch contradictions, outdated policies, and orphaned pages.

To solve the "master data everyone interprets differently" and "silent decisions" problems mentioned earlier, deploying this Wiki requires three ground rules:

- **Entity pages must be named by model number or unique ID.** Semantic similarity isn't the same as being the same thing. Forcing ID-based pages makes everyone align on master data first.
- **Keep live data in databases, don't compile it into prose.** Inventory, pricing, order status stay in ERP or kintone. Have Agents query it real-time via MCP or API.
- **Use concrete cases to draw out what veteran employees know.** Don't ask an old-timer "What's our return policy?" They can't summarize it themselves. Take last month's real work ticket and ask: "On that shipment with damaged packaging—how did you judge the return?" Throw the interview recording into `raw/`, have the LLM draft the rule, then get the old-timer to sign off. When `Lint` flags logical gaps the next week, those become your agenda for the next interview.

(Of course, this approach has clear boundaries: the maintenance burden hasn't disappeared, just shifted from "people writing" to "people reviewing"; and the method works best when you're in the 50–100 raw documents, a few hundred Wiki pages range per topic. Beyond that, or if you need fine-grained document permissions, you'll need to bite the bullet and deploy Confluence or Notion.)

---

## Five: The three-step emergency response playbook for reckless enterprises

The [McKinsey 2026 global AI survey](https://www.mckinsey.com/capabilities/quantumblack/our-insights/the-state-of-ai) has a sober number: even though everyone's using AI, only 37% of enterprises see EBIT impact, and only about 6% count as high performers. These 6% have one thing in common: they didn't slap AI onto their old processes like a patch. They redesigned workflows and roles around AI instead.

If you run [AINativeBench](https://rami0291.com/ainativebench/), find yourself scoring 20+ points higher on the Y axis than the X axis, or hit a bunch of the 18 antipatterns in the self-check, you can run this three-stage playbook over the next year—stop the bleeding, catch up on foundation, then gradually hand over—and re-run the dual-axis diagnosis before each stage handoff:

### Stage One (0–3 months): Emergency response and inventory

- Have leadership do separate diagnostics: have the CEO, the IT lead, and business heads each independently run [AINativeBench](https://rami0291.com/ainativebench/), without comparing answers. Surface the questions with the biggest disagreements and fight it out.
- Pull AI back from production workflows to a shadow role: anything involving price changes, refunds, or promises to external customers goes back to "AI drafts, human clicks send."
- Adopt rogue AI tool sprawl into an enterprise program: audit everyone's personal free accounts, procure an enterprise tier with better features (sign the "data not used for training" agreement, turn on SSO and audit logs), hand out a one-pager of Internal AI Use Guidelines (don't cram the whole thing into the system prompt and dumb down the AI).
- Lock down 1–3 frequent pilot programs: each pilot needs a named owner, a KPI that includes **Rework Rate and cost per unit**, and clear exit conditions (to prevent "I saved 30% generation time but spent 40% fixing mistakes").
- Set the default fallback rule first, only have business sign off on exceptions: don't let AI spam hundreds of edge cases for approval. Write down one global default principle (e.g., "skip bad data and log it, only stop the system for irreversible operations"), require Agents to check existing code and DB schema first; only business ambiguities that change what the customer sees and have no precedent go onto a sign-off list—never leave it to the model to guess.

### Stage Two (3–6 months): Turn your guns around, use AI to build your foundation

- Stand up products and customers as the first master data tables: define the encoding for the whole company; you can use LLM to help align dirty encodings from legacy tables, but every mapping gets human confirmation before it enters the database.
- Use LLM-Wiki or Google Workspace to consolidate tacit knowledge: enforce `raw/` read-only, let Agents only file `_proposals/`, interview veteran staff with real cases in hand, turn brain rules into traceable Markdown.
- Build a golden test set grounded in real data (50–200 real business questions): tests must read the actual production schema first and run on anonymized historical data snapshots (don't hallucinate on empty databases and toy data); lock away part of this as a "sealed test set" and run regression every time you tweak prompts or swap models.
- Gradually replace RPA with real APIs and review the code diff directly: add standalone service accounts, test sandboxes, idempotency keys, and structured error reporting to high-frequency business actions so you can convert them directly to MCPs for Agents; don't expect AI to self-report technical debt. In CI and during independent review, directly prune defensive code by looking at diffs, and performance-test page load times on real data snapshots.

### Stage Three (6–12 months): Reset permissions within hard boundaries

- Five conditions required before an Agent goes to production: only allow Agents to manage production again when a workflow simultaneously has a single authoritative data source, a consistently passing test set, fully auditable operations, code-level hard boundaries (transaction caps, action whitelists, one-click rollback), and human veto power.
- Give Agents an onboarding record: maintain a company-wide Agent registry listing each Bot's purpose, Owner, tool permission scope, test scores, and scheduled sunset, to prevent ghost Agents left behind by departed employees still running with admin tokens in the background.
- Rewrite roles and preserve expertise: formally rewrite at least one job description; simultaneously design regular "no-AI blindtest drills" to prevent teams from forgetting how to make business judgments and becoming rubber-stamp approvers.

---

## And finally, one last reality check on myself

While writing this article and running external research and `graph-workflow` production data back through the sieve, I found three places where [AINativeBench](https://rami0291.com/ainativebench/) in its current version isn't rigorous enough:

1. The tool prescribes "immediately slow down and retreat, redirect budget to strengthening connections and APIs" for the high-hallucination reckless zone—but forgot to tell people what to do with the AI compute you're pulling back.
2. In the full-score anchor for enterprise knowledge bases, I casually lumped "RAG, LLM Wiki, long context—all acceptable" together on the same line. Cross-referenced against Chroma's long-context degradation experiments and our own comparisons, these three are fundamentally not equivalent.
3. The 60-point passing line on the quadrant and the $ Y - X > 20 $ discount line are currently just empirical thresholds I pulled out of thin air.
