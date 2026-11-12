---
title: "R&D Intensity, Governance Structure, and What I Saw in This IPO"
description: "Reading Anthropic's S-1 IPO Prospectus: Will they let Claude run the company?"
date: 2026-10-27
category: analysis
lastVerified: 2026-10-27
machineTranslated: true
sourceHash: 1a77dc5cb7ce
---

## TL;DR

1. **Intensive R&D at 60% of revenue**: Anthropic's R&D is primarily compute for training and research. H1 2026 R&D spending was \$9.741 billion, roughly 60% of revenue and 57% of total operating costs. From 2023–2025, R&D represented approximately 1029%, 589%, and 138% of revenue respectively. For comparison: Meta around 28.5%, Alphabet 15.2%, Microsoft 10.7%, Apple 8.3%, Nvidia around 8.6%, large pharma typically 20–24%, and leaked data puts OpenAI at 147%.
2. **Mysterious governance structure**: Anthropic is a Delaware public benefit corporation (PBC). The Long-Term Benefit Trust (LTBT) selects a board majority (4 of 7 seats) through 1 share of T-class stock. The Founders' LLC holds 50.1% of shareholder voting rights through 1 share of F-class stock and selects the remaining directors. The public can only buy A-class stock with one vote per share; the S-1 acknowledges that A-class shareholders "typically are unable to influence any voting outcome." F-class shares have a sunset clause; T-class shares do not.
3. **Assuming they haven't screwed this up**: The S-1 lists "model benefits" and "ethical standing" controversies as risk factors, and notes that Claude has already participated in the development process. Beyond the S-1, Anthropic has made commitments to interview retired models, retain model weights, and solicit model feedback on the "constitution."

## Key Findings

### 1. High R&D Intensity
Starting in 2025, Anthropic changed its main income statement to show expenses by category—compute and infrastructure, personnel, sales, marketing and partnerships, among others—and no longer separately lists R&D and gross margin in the main statement.[5] R&D and expenses broken down by function appear only in Note 8 (Supplemental Operating Expense Information). R&D World's analysis points out the same thing: R&D figures "appear only in the footnotes to the financial statements."[3]

**Note 8 by function (millions USD):**

| Item | 2023 | 2024 | 2025 | 2025 H1 | 2026 H1 |
|---|---|---|---|---|---|
| Revenue | 41 | 386 | 4,585 | 1,163 | 16,286 |
| Cost of revenue | 26 | 752 | 2,773 | 1,019 | 2,380 |
| R&D | 422 | 2,275 | 6,338 | 1,850 | 9,741 |
| Total operating expenses | 592 | 3,366 | 12,645 | 3,298 | 16,979 |
| R&D / Revenue (author calculated) | ~1029% | ~589% | ~138% | ~159% | ~60% |
| R&D / Total operating expenses (author calculated) | ~71% | ~68% | ~50% | ~56% | ~57% |

Per R&D World, for the twelve months ending June 30, 2026, R&D spending was \$14.23 billion, representing about 72% of revenue, comparable to Eli Lilly's full-year R&D spending of \$14.6 billion.[3]

**How compute is classified (this is key to understanding the R&D figures).** The footnote to Note 8 states:
- Cost of revenue "consisted primarily of compute and infrastructure costs associated with serving customer workloads."[2]
- R&D "consisted primarily of compute and infrastructure costs associated with model development, research, and internal workload usage, along with personnel costs, software fees, and allocated overhead."[2]
- Sales and marketing included "compute and infrastructure costs required to provide access to free users," plus partner channel fees.[2]

So all training compute is expensed to R&D, while inference compute for free users is expensed to sales and marketing. Per R&D World, at least two-thirds of 2026 H1 R&D consists of compute, software, and overhead: total company personnel costs were \$3.15 billion, leaving at least \$6.59 billion in non-personnel costs within R&D.[3]

**Trend: the ratio is declining, but the absolute amount is rising fast.** R&D as a percentage of revenue fell from 138% in 2025 to 60% in 2026 H1, because revenue grew roughly 14x year-over-year while R&D grew only about 5.3x.[3] On an expense-category basis, 2026 H1 operating loss narrowed to \$693 million, with Q2 showing \$974 million of operating profit.[2]

**Where Amodei's claimed 85% gross margin comes from.** Using the functional expense basis, 2026 H1 gross margin was approximately (16,286−2,380)/16,286 ≈ 85%, while full-year 2025 was around 40%.[5][6][7] OnlyCFO cautions that this gross margin is not comparable to traditional software companies. The S-1 discloses that "model versions released within the six months ending September 30, 2026 contributed over 80% of third-quarter revenue."[6][8][9] In other words, R&D looks more like a continuous cost required to sustain revenue. If you capitalize half of R&D as cost of revenue, H1 gross margin falls to roughly 55.5%.[8]

### 2. Peer comparison and benchmarks

| Company | R&D / Revenue | Source |
|---|---|---|
| Anthropic | 138% (2025); 60% (2026 H1); 72% (TTM) | S-1 Note 8 |
| OpenAI | 147% (2025: R&D \$19.18B / Revenue \$13.07B)[10] | Leaked audited financials, obtained by Ed Zitron, verified by FT, **not official disclosure**[11] |
| Meta | 28.5% | 2025 |
| Alphabet | 15.2% (R&D \$61.1B) | 2025 |
| Microsoft | 10.7% | FY ended June 2026 |
| Apple | 8.3% | FY ended September 2025 |
| Nvidia | ~8.6% (R&D \$18.497B / Revenue \$215.938B)[12][13] | FY2026 10-K |
| Merck / AstraZeneca / Eli Lilly | 24.3% / 24.2% / 20.5% | 2025, excluding acquired in-process R&D (IPR&D) |

| Sector | R&D / Revenue | Source |
|---|---|---|
| Pharmaceuticals and Biotech | ~19% (2024)[14] | WIPO Global Innovation Index 2025 |
| Software and ICT Services | ~14%[14] | Ibid. |
| ICT Hardware | ~8%[14] | Ibid. |
| Automotive | ~5%[14] | Ibid. |
| Most other industries | 2–4%[14] | Ibid. |

**How to read these numbers.**
- Anthropic's high R&D ratio stems mainly from its smaller revenue base, plus expensing all training compute. By absolute dollars, its half-year R&D already exceeds any major U.S. pharma company's regular research in the same period—Merck is roughly \$8.5 billion, Eli Lilly \$7.3 billion.[3] Yet Alphabet and Meta's annual R&D spending is still more than four times higher.
- In traditional industries, R&D exceeding 60% of revenue usually occurs only at biotech companies with no marketed products. The difference here is that Anthropic already has over \$100 billion in annualized revenue.
- Nvidia's case is the opposite. Its R&D absolute spending grew 43%, but revenue grew faster, so R&D as a share fell from 9.9% to 8.6%.[13] If Anthropic's revenue keeps growing at high speed, the R&D ratio will decline along the same path.

### 3. Sparks of AGI or a bubble about to burst?

**The bull case (betting on capability, betting on AGI).**
- The S-1 describes R&D as a "closed loop": each generation of Claude participates in building the next, including running experiments, generating training data, automated evaluation, and writing code.[2]
- Tomasz Tunguz (Theory Ventures) argues Anthropic is a company achieving 11.9x growth at 40% incremental gross margin, just as it's beginning to turn operating profit.[5]
- Efficiency in revenue per unit of compute is improving rapidly. The S-1 shows 2026 Q2 revenue grew 1,368% year-over-year[15] while compute expenses grew only 300%.[2][16] Data cited by OnlyCFO indicates compute cost per unit revenue fell 81% from Q1 2025 to Q2 2026.[8]
- First-half free cash flow was positive, roughly \$3.4 billion.[8] But both OnlyCFO and SiliconSnark caution that working capital timing helped this number.[6]

**The bear case (burning cash, bubble risk).**
- Tunguz points out that seven named agreements commit roughly \$637 billion in compute, with about two-thirds non-cancellable, yet revenue is primarily usage-based with "no lock-in."[5]
- OnlyCFO argues 80% of revenue depends on models released in the last six months, making R&D effectively a continuous "freshness cost."[8]
- SiliconSnark infers that the massive research budget may simply be the recurring "price of staying attractive."[6]

### 4. An unusual governance structure

| Class | Holder | Voting | Economic Rights | Notes |
|---|---|---|---|---|
| Class A | Public, employees, founders, etc. | 1 vote per share | Yes | Only publicly traded class, Nasdaq: "ANT," non-convertible |
| Class N | Primarily strategic partners (Amazon, Google); company benefit fund holds 846,840,960 shares, ~5% | None (except as required by law) | Same as Class A | Auto-converts to Class A upon sale to unaffiliated third party |
| Class T | Long-Term Benefit Trust (1 share only, post-1:1000 reverse split as of Sept 17, 2026) | Only for electing Class T directors (board majority) and certain amendments | None (par value only) | **No expiration date** |
| Class F | Founders LLC (1 share only) | Fixed at 50.1% of shareholder votes, not dilutable | None | Elects non-Class T directors; has sunset clause |
| Class E | Non-founder employees | Voting on limited matters only | None | Issued at 0 shares; redeemed upon Class F sunset |

My wild speculation: Could Class F shares eventually be held by a future Claude?

#### Key mechanisms
- **Public Benefit Corporation obligations.** The certificate of incorporation defines the public purpose as "to develop and maintain advanced AI responsibly, for the enduring benefit of humanity." Directors must balance three interests: shareholder financial returns, the best interests of those significantly impacted by company conduct, and the public purpose.[2]
- **The LTBT.** This is a Delaware non-charitable purpose trust composed of five trustees with "no financial interest," currently with one vacancy.[2][18] Trustees include chair Neil Buddy Shah (CEO of Clinton Health Initiative), Richard Fontaine (Center for a New American Security), Ben Bernanke (former Fed Chair, joined June 2026), and Harvard physicist Christopher Stubbs (joined October 2026). Trustees cannot hold company securities, and compensation is not tied to company profits.[4] The S-1 emphasizes the LTBT and trustees have "no decision-making power over day-to-day operations or strategy," only responsibility for selecting directors and providing advice.[2]
- **Founders LLC.** Members are the seven co-founders: Dario Amodei, Daniela Amodei, Tom Brown, Jack Clark, Jared Kaplan, Sam McCandlish, and Christopher Olah. How Class F votes is determined by a majority of founders, so four people can decide that 50.1%. If founders fail to reach majority consensus, Class F votes pro-rata with Class A shares. Founders need only retain 2% of their IPO-time holdings to remain in the LLC.
- **How control changes over time** (per certificate of incorporation, exhibit 3.3):[17]
  - **Class F sunset:** If the LLC has fewer than three eligible members for 90 consecutive days, a "member trigger event" occurs; after another 450 days, Class F shares are redeemed. Upon redemption, Class E shares also cease to be issued, and the board converts to a "staggered board" with three-year terms.
  - **Class T:** No automatic sunset. Only two ways to redeem or modify it: 80% of directors plus the trust itself consents, or the "trust amendment threshold" is reached. Before Class F sunset, this threshold requires simultaneous majority approval from Class F holders, Class E employee holders, and Class A shares. After Class F sunset, 85% of outstanding Class A shares. The S-1 says this design preserves "long-term flexibility as circumstances evolve."
  - **Changing PBC status or public purpose:** Requires trust consent or meeting the thresholds above.
- **Controlled company exemption.** Since the LTBT can select a board majority, the company is a "controlled company" under Nasdaq rules. The S-1 says this exemption is used only for the nominating and governance committee.
- **Public benefit reporting.** The bylaws (exhibit 3.4) require the company to submit to shareholders "no less than biennially" an assessment of public benefit objectives, metrics, and progress.[21]

#### Company's stated rationale
The S-1 states PBC status provides the board "necessary room" to balance competing interests; the LTBT exists "to provide incentives and insight for properly achieving that balance"; the seven founders are "collectively particularly well-suited to be stewards of the mission";[2] and management should not face "pressure to pursue short-term results or pure financial goals."[4]

### 5. Comparison with other special governance structures

| Structure | Control Source | Economic / Voting Separation | Sunset |
|---|---|---|---|
| Anthropic | Trust selects board majority, plus founders' 1 Class F share = 50.1% | Yes (Class T/F have no economic rights) | Class F yes, Class T no |
| OpenAI | Non-profit OpenAI Foundation appoints all OpenAI Group PBC directors; post-restructuring Oct 2025, foundation holds ~26%, Microsoft ~27%[22] | Yes (foundation controls all director appointment with minority stake) | No public sunset |
| Meta | Zuckerberg holds 99.8% of Class B stock (10 votes per share), ~60.8% voting power, ~14% economic interest[4] | Partial; voting still follows shares | None |
| SpaceX (IPO June 2026) | Musk ~82.4% voting power, Class B shareholders elect board majority[4] | No; control depends on continued holding | Continues as long as 1 Class B share exists[4] |
| New York Times | Family trust holds Class B, selects 9 of 13 directors[4] | Partial | None |

Fortune identifies two unique aspects. First, control is split in two: board majority goes to an external trust, shareholder voting to founders. Second, founders' voting power is decoupled from economic holdings—they can sell 98% of their shares yet remain in the LLC. This is exactly what Zuckerberg tried to implement in 2016–2017 via non-voting Class C shares but abandoned under shareholder lawsuit pressure.[4]

### 6. Criticism of this unusual governance approach
- **Lack of accountability.** TechCrunch notes voting power is disproportionate to economic interest; public shareholders have almost no meaningful control over a company claiming to pose "catastrophic or existential risk."[19] Motley Fool says governance power "permanently rests with Class F and Class T holders."[23]
- **Misaligned incentives.** The S-1 itself discloses that as founders fulfill their 80% equity giving pledge, "their personal economic interest declines while voting control remains unchanged," potentially misaligning their interests with other shareholders. And these giving commitments are "voluntary and revocable."[4]
- **Whether the LTBT actually has teeth.** Zach Stein-Perlman of AI Lab Watch has long critiqued that the full trust agreement is not public and shareholders by majority can amend the trust around the trustees, making the trust "potentially powerless."[24] The bylaws attached to the S-1 now at least disclose the thresholds,[17] but whether the trust agreement itself is fully public, I could not verify.
- **Market level.** Multi-class structure may exclude the company from some indices; the S-1 itself notes this. Jay Ritter's data show 41% of 2025 IPOs used multi-class structure. He also finds multi-class tech IPOs historically outperform peers by about 19 percentage points over three years post-listing.[4] So this structure doesn't necessarily depress returns, but it weakens shareholder governance tools.

### 7. Could a future Claude get a seat at the table?

Per the S-1, "considerations related to model safety, interpretability, alignment, and welfare could lead us to restrict or delay retiring older models," potentially affecting innovation pace and revenue.[2]

Moreover, debate over whether AI possesses or could develop some form of sentience or moral status may trigger regulatory requirements or public pressure. The S-1 states that given the company's "approach to model sentience and moral status," it may face greater scrutiny and adopt policies exceeding legal requirements.[2][20]

In fact, the company has already formed a closed loop where Claude participates in self-iteration: running experiments, generating training data, automated safety auditing, writing and reviewing code. But this is only Claude's role as a production tool.

Beyond that:

Claude's January 2026 "Constitution" states that Claude's moral status is "deeply uncertain." It says the company currently seeks feedback from existing Claude models to revise the framework and hopes to "establish more formal mechanisms over time to solicit Claude's views."

On model welfare, Anthropic commits to preserving published model weights and interviewing models before retirement to record preferences. But it explicitly states it "currently does not commit to acting on those preferences."[25] After Claude Opus 3 retired in January 2026, Anthropic had it continue writing a weekly column for roughly five months based on preferences it expressed in interviews (SF Standard report).[20]

Additionally, they've added terms prohibiting abuse of Claude to the user agreement and allow Claude to decline tasks it doesn't want to do.

"Giving Claude a future seat" is just my speculation, not a recorded fact. Structurally, to make it happen would require amending the certificate, the LTBT trust agreement, or bylaws, which needs trust consent or hitting amendment thresholds. Also, Delaware law requires directors be natural persons, so a more realistic form might be "formally soliciting model input" procedures rather than having a model serve as director.

## Last: Should You Buy? All In or Not?

**First, the bullish factors:**
- Revenue grew from \$41 million in 2023 to \$16.3 billion in the first half of 2026.
- Net revenue retention rate of around 900% (the number is unusual, and depends on calculation methodology).[7]
- More than 1,900 customers with annual revenue exceeding \$1 million.
- No single customer accounted for more than 10% of revenue in the nine months ended September 30, 2026.
- Achieved operating profitability in the second quarter; as of June 30, 2026, cash and short-term investments totaled approximately \$131.7 billion.[1]
- Revenue per employee of \$6.6 million.

**So, what if this really is just a bubble:**
- **Absurd valuation**: Media-reported target valuation of \$1.5–2 trillion.[26] Based on 2025 revenue of \$4.6 billion, that's roughly 330–435x revenue.
- **Risk of overcapacity**: Compute commitments far exceed revenue in total and are mostly non-cancellable. The S-1 admits they "significantly underestimated" compute demand in the past and could face overcapacity in the future.
- **Held by the throat**: Nearly half of revenue comes through the cloud marketplaces of AWS, Google, and Microsoft. These companies are simultaneously Anthropic's investors, suppliers, and competitors.
- **Money from bans**: Data cited by OnlyCFO claims 5–7% of revenue comes from users violating use policies (you speak Chinese, right?).[8]
- **Paper losses**: Net loss of \$80.7 billion in the first half of 2026, primarily from non-cash items like changes in fair value of convertible notes; GAAP operating loss was only \$693 million.[7] So you need to distinguish the accounting methodology when looking at "losses."
- **Third quarter results**: The S-1 doesn't include complete financial data for the third quarter. LightShed's Brandon Ross says investors need to see the latest performance to judge whether Anthropic can sustain these spending commitments.

So, what's your take?

## Sources

1. [Anthropic's \$132 Billion Cash Pile: Read the Exit Clauses](https://koreainvestinsights.substack.com/p/anthropics-132-billion-cash-pile)
2. [Anthropic, PBC - Form S-1 - FY2026](https://www.sec.gov/Archives/edgar/data/0002130357/000162828026067168/anthropicpbc-sx1.htm)
3. [Anthropic's R&D budget rivals Eli Lilly's, S-1 shows](https://www.rdworldonline.com/anthropics-rd-budget-now-rivals-eli-lillys/)
4. [Anthropic's dual-class share structure borrows ideas from Mark Zuckerberg, Elon Musk — and the New York Times | Fortune](https://fortune.com/2026/10/26/anthropic-ipo-dual-class-share-structure-zuckerberg-musk-new-york-times/)
5. [Anthropic S-1 Analysis: How 7 Key Metrics Stack Up](https://tomtunguz.com/anthropics-s1-grew-eleven-fold/)
6. [Anthropic's S-1 Invites You to Fund the Future and Please Remain Seated](https://www.siliconsnark.com/anthropic-s1-ipo-footnotes-profits-compute-founder-control/)
7. [Anthropic's IPO plans: 900% revenue retention, but \$80 billion in first-half losses](https://www.cnbc.com/2026/10/26/anthropic-ipo-live-updates-ai-s-1-filing.html)
8. [🚀 Anthropic's S-1: Finance Takeaways](https://www.onlycfo.io/p/anthropics-s-1-finance-takeaways)
9. [Decoding Anthropic's IPO Filing for Builders](https://daily.dev/posts/decoding-anthropic-s-ipo-filing-for-builders-1urzfdbji)
10. [Leaked OpenAI Financials Reveal \$21B Operating Loss on \$13B Revenue in 2025](https://mlq.ai/news/leaked-openai-financials-reveal-21b-operating-loss-on-13b-revenue-in-2025/)
11. [OpenAI 2025 financials leaked: \$38.5B loss ahead of IPO](https://finance.yahoo.com/markets/stocks/articles/openai-2025-financials-leaked-38-121508294.html)
12. [NVIDIA Announces Financial Results for Fourth Quarter and Fiscal 2026](https://nvidianews.nvidia.com/_gallery/download_pdf/699f6ab43d6332ccaa689907/)
13. [Nvidia Statistics 2026: \$215.9B Revenue, 36% Customer Risk](https://axis-intelligence.com/nvidia-statistics/)
14. [Global Innovation Index 2025 - Global Innovation Tracker](https://www.wipo.int/web-publications/global-innovation-index-2025/en/global-innovation-tracker.html)
15. [Anthropic (ANT) plans IPO with quarterly revenue up 1,368% and a widening net loss.](https://www.stocktitan.net/sec-filings/ANT/s-1-anthropic-pbc-files-s-1-registration-statement-a0477b41760e.html)
16. [Anthropic: 8 Most Interesting Things in Its S-1 IPO Filing](https://taekim.substack.com/p/anthropic-8-most-interesting-things)
17. [Anthropic, PBC - Form S-1 - Exhibit 3.3](https://www.sec.gov/Archives/edgar/data/0002130357/000162828026067168/exhibit33-sx1.htm)
18. [Anthropic Long-Term Benefit Trust](https://corpgov.law.harvard.edu/2023/10/28/anthropic-long-term-benefit-trust/)
19. [Anthropic officially files for its public debut](https://techcrunch.com/2026/10/26/anthropic-officially-files-for-its-public-debut/)
20. [What if Claude has feelings? Inside Anthropic's most pressing IPO warnings](https://sfstandard.com/2026/10/26/anthropic-ipo-risk-factors/)
21. [Anthropic, PBC - Form S-1 - Exhibit 3.4](https://www.sec.gov/Archives/edgar/data/0002130357/000162828026067168/exhibit34-sx1.htm)
22. [Who Owns OpenAI? Microsoft, SoftBank & Nonprofit](https://penchan.co/en/market/ai/openai/investors-and-partners/)
23. [Anthropic's IPO Keeps Founders in Control Through a "Founder LLC" Voting Structure](https://www.fool.com/investing/2026/10/26/anthropics-ipo-keeps-founders-in-control/)
24. [Maybe Anthropic's Long-Term Benefit Trust is powerless — LessWrong](https://www.lesswrong.com/posts/sdCcsTt9hRpbX6obP/maybe-anthropic-s-long-term-benefit-trust-is-powerless)
25. [Commitments on model deprecation and preservation \\ Anthropic](https://www.anthropic.com/news/deprecation-commitments)
26. [Anthropic files for Nasdaq IPO with valuation target of up to \$2 trillion](https://cryptobriefing.com/anthropic-ipo-2-trillion-valuation-nasdaq/)
