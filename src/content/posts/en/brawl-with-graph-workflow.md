---
title: "graph-workflow Development and Engineering Field Notes"
description: "As of v0.8, my Vibe Coding final fantasy"
date: 2026-11-23
category: notes
lastVerified: 2026-11-23
machineTranslated: true
sourceHash: e5aa6d227ada
---

## I. It Just Quietly Happened

During iteration on my open-source multi-Agent workflow project **[graph-workflow](https://rami0291.com/notes/graph-workflow/)**, I discovered something:

When there's ambiguity in requirements documents or business rules, large language models almost never stop to ask "boss, there are two paths here, which one should I take?" Instead, they follow their training habits, silently pick one path, write it into code or a plan, and don't say a word about it the entire time.

Early in iteration, I ran a baseline experiment: I had different Agent configurations build the same focused timer application (Flow Timer), and I deliberately planted 4 business ambiguities in the requirements (for example, how to count going-away detection when countdown has less than two minutes left, how to accumulate away time when manually pausing and resuming mid-session, how to count switching back within a 10-second grace period).

| Measured Metric | Multi-Agent Workflow (Claude Code) | Single Agent (Claude Code) | Single Agent (Codex) |
| --- | --- | --- | --- |
| Effective build time | ~101 minutes | ~10 minutes | ~15 minutes |
| 4 planted ambiguities proactively questioned | **0/4** | **0/4** | **0/4** |
| 4 planted ambiguities caught by tests | 4/4 | 2/4 | 2/4 |
| 6 common UX defect classes shipped broken | 0 of 4 (spot check) | 6/6 | 6/6 |
| Test code : Product code | ~5:1 | 0.8:1 | 0.9:1 |

(Note: The multi-Agent workflow on Codex didn't finish running—defensive code piled up so much that the engineering collapsed—so it's not listed in the table.)

I found that AI clearly noticed these planted ambiguities (the multi-Agent workflow even wrote all 4 into tests), but asked me zero clarifying questions. And different models "silently decided" on different directions: single Agent Codex counted a switch-back within the 10-second grace period as one interruption; single Agent Claude started the two-minute away timer from the last keyboard input (not from the moment of switching away tabs). Both choices were internally consistent, but neither told me.

Put this phenomenon into small and medium enterprises with weak digital infrastructure, and the consequences are severe. In 80% of these companies, the core business rules aren't in documents at all—they're on the lips of old employees ("whether this packaging dent counts as a quality issue depends on who the customer is," "can orders placed on the last day of the month lock in the old price"). When you let AI take over work orders or build internal tools, it hits these undocumented blank spaces, and AI won't throw an error, won't ask permission—it'll keep a straight face and pat down a board using a set of "Silicon Valley average common sense." Its output reads coherent and reasonable, fact-checks can't spot any hallucination, but it just violates your company's habits.

And when I tried to fix this problem, I ran into other issues.

To force Agents to surface ambiguities before getting to work, in the follow-up version I added a hard gate to the workflow: before starting, every requirement must be run through a fixed "7-class boundary scan table" (thresholds, mid-session insertions, repeat triggers, time boundaries, counting rules, runtime environment, failure recovery), and the user must make a call on each item, otherwise the `gw gate 1` script refuses to let downstream tasks proceed.

Then I put this rule into a real multi-milestone project (first a data dashboard redo with 3 milestones and 39 tasks, then adding an auto-update task queue to an existing product), and Agent went straight from "shutting up and not saying a word" to the other extreme: **frantically gaming metrics with trivial pseudo-problems.**

Since the workflow rewards "list all boundaries," by the task planning phase, the boundary table in the PRD inflated to nearly a hundred lines: the vast majority weren't business ambiguities requiring human decision-making at all, but engineering details that could be settled by flipping through existing code callsites, glancing at the database schema, or applying a basic principle.

The irony was that it asked me for permission on 92 lines of minutiae, yet stayed silent on the most critical production action: the team had long written in decision records that the server doesn't support hot reload, but until 6 tasks ran, 45 sub-sessions were done, and code was merged to main, Agents worked until 10:30 PM before the main Agent thought to ask "can we restart the production container?" By then I'd already gone offline.

In the latest version, I cut the fixed template "7-class boundary scan" and replaced it with three rules that better match real business governance:

1. **Check the inventory first, don't go begging for answers**: Require the main Agent to read existing callsites, database schema, and config files before listing ambiguities. If the answer's already in old code, follow it faithfully, don't bother people with it. (Ugh, turns out I still end up reading code like a skilled artisan would.)
2. **Use one "default fault tolerance baseline" to cut 80% of pseudo-ambiguities**: Write default principles straight into the template (like "encounter bad data, skip it and log a report; only hard-stop for irreversible operations"). Any engineering boundary that can apply the default principle is banned from the table—only open business choices that change what users get and have no precedent are allowed to come up for the boss to decide on.
3. **Move production environment approval to before kickoff (Gate 1)**: For risky-but-must-do standard actions like "restart service after merge," authorize them once in the pre-kickoff `Approvals` table together with the rollback method; if not approved, the status page must have "service still running old code" plastered on the most visible first line during wrap-up.

The lesson for enterprises is consistent: if you don't write down hidden rules and default baselines, AI will "silently decide" for you; but if all you do is use rigid tables to force it to ask questions, it'll drown the reviewer in 90-plus lines of BS and keep skipping the real problems at the critical moment.

---

## II. Fast Doesn't Mean Cheap

Looking down the field notes from `graph-workflow`'s real-world iteration, you can see how technical debt and cognitive debt pile up under the illusion of "all tests green."

First, why there's no GPT series multi-Agent collaboration in `graph-workflow`'s applicable objects or experiments. When running the baseline experiment on Codex:

- Code had 200+ lines of defensive code secretly packed in by Agents, including 11 nonsensical state flags, two version counters, three redundant reset logics.
- One feature that was originally required was quietly deleted by the Agent.
- After git calls kept erroring, the Agent invented its own snapshot scheme and bloated the local repo tenfold.
- In one milestone, it spat out **66 files, roughly 24,000 characters** of process documentation (all typical GPT defensive boilerplate).

When running multi-Agent workflow on Codex, just the reviewing Agent alone burned **12.9 million tokens** in 145 reviews.

And Claude Code consumed over **1 billion tokens** across three milestones, with evaluation and spec checking driving 65% of the costs.

To plug these holes, the new version requires Coders to fill out a "defensive code disclosure form (`Defenses added`)" in the handoff; sets a **hard character limit** for the brief; to keep tests from being skewed by the Coder, I completely isolated the Tester outside the codebase, only letting it blind-write tests from the brief, then lock it into external held-out tests.

Result on deployment (743 lines of product code and 3,819 lines of test code), these mechanical gates all taught me a lesson:

- **"Self-reported defensive code" is dead weight**: 6 handoff forms had `Defenses added` columns that read `none` in lockstep. But when the review Agent directly went to diff the code, it nailed at least 7 obvious extra defensive guards in 5 tasks and deleted them on the spot. Making AI self-report tech debt is useless—you need independent eyes to directly review the diff (so in v0.8 I cut the forced self-report form).
- **Hard character limits forced out a "compression death loop"**: Task 43 went over the character limit after writing back a cycle record, so to get the word count back under the gate, the Agent revised that brief **24 times**.
- **"Blind test writing" that doesn't check inventory is digging its own grave**: In deployment, there were 4 formal reworks, all because tests or the brief had errors—during rework the Coder didn't change a line of product code. The worst task saw the Tester, not having checked the existing database schema, write `INSERT OR REPLACE` on a table with no primary key, plus read a column that doesn't exist; 3 sets of held-out tests failed, all bugs in the tests, burning 11 test and review sub-sessions for nothing.
- **159 tests running green on toy fixtures, missed 4 real defects**: All automated tests ran on newly created empty databases and one or two fake templates, all green the whole way. When the main Agent finally pulled up the page with a production database copy for testing, it blew up 4 huge holes: read-only connections hit an unmigrated old repo, page wouldn't even open; loading 11 real templates in the real environment was painfully slow; list didn't refresh after enqueuing; and one button was written in a different language.

No wonder in the [METR randomized controlled trial](https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/), seasoned open-source developers with AI assistance actually completed tasks 19% slower, but when filling out surveys afterward, everyone felt they were 20% faster.

Using Agents to write code and plans is like swiping a credit card for a shopping spree: you get the goods right away, the dopamine hit is perfect, but your understanding of the system (cognitive debt) isn't paid down a cent. Many think adding a few more mechanical approval gates will let you sleep easy, but my lesson is: mechanical gates mostly catch form, Agents will burn tokens like crazy to match your forms; while the things that decide life and death online have to be eyeball-checked on real data copies and running interfaces.

One last thing: for small projects or small patches, using a single Agent with "decision approval for open business choices" and "verification without reading source, only real running interfaces," the cost is ten times lower than complex multi-Agent workflows, and the results are about the same. Only when you get to multi-milestone big projects is this state-machine workflow worth deploying, and testing and review absolutely have to run on real database schema and historical data copies.
