---
title: "Prompt ルールがモデル習慣に負ける理由"
description: "AI Coding Agent のための決定論的グラフワークフロー構築"
date: 2026-11-03
category: notes
lastVerified: 2026-11-03
machineTranslated: true
sourceHash: bff1bc1129e3
---

## Two traps

I run several projects at once with coding agents, and two things kept going wrong. I no longer had time to read the long reports the agents wrote. And after a few rounds of context compaction, the main agent lost sight of the project as a whole and spent its effort on small tweaks and defensive code.

If you have built anything multi-week with frontier coding agents (Claude Code, Codex, Cursor), you have probably hit both of the usual fixes, and seen each fail in its own way:

1. **The single-agent trap.** One agent is fast and usually right. It also settles every ambiguous product question on its own without telling you, writes tests that mirror its own implementation, piles on defensive scaffolding (catch-alls, redundant state flags, repeated resets), and never looks at the UI it shipped.
2. **The ceremony trap.** The common alternative is a simulated company: analyst, PM, architect, scrum master, developer and QA, each a chatting persona. Every hand-off loses information, the context windows swell, and the agents write long Markdown to each other instead of code. I tried loop- and graph-shaped versions of this, and the more layers my intent passed through, the less of it survived, the same way orders get lost in a tall management hierarchy.

`graph-workflow` (`gw`) is what I built instead. Over the past month I took it from v0 to v0.5, putting it on real work, measuring it and rebuilding it after each round. It is open source under the MIT License. Here is what each version taught me.

---

## v0.1 → v0.2: one brain, tests first, an objector with eyes

v0.1 drew on three papers: MAST's taxonomy of 14 multi-agent failure modes (arXiv 2503.13657); AgentCoder (arXiv 2312.13010), which separates writing tests from writing code; and SpecBench (arXiv 2605.21384), where a model that could see the tests produced a 2,900-line "compiler" that was mostly a lookup table of the test inputs.

### Principle 1: PM, architect and reviewer in one brain (`Main`)

The most expensive hand-off in software is between product and architecture, and putting the two in separate LLM sessions invites drift. So **PM, architect, orchestrator and code reviewer are one role, `Main`**, running on the strongest model. Subagents exist only where a separate perspective or a separate workspace earns its cost:

- **`gw-tester`** sees only the task brief and writes tests before any code exists.
- **`gw-coder`** works in its own Git worktree (`<repo>.gw/N`) with the brief, the files it may change, and the visible tests.
- **`gw-punk`**, the designated objector, sees only the PRD and screenshots of the running product, never the source.
- **The human**, called the CEO in the workflow (that's me), steps in at **Gate 1** (the plan) and **Gate 3** (a three-minute try of each milestone). The per-task loop, **Gate 2**, runs without me.

### Principle 2: hand-offs are files, not chat

Subagents never talk to each other. Every hand-off is a file in `docs/workflow/`: `brief-N.md`, `test-plan-N.md`, `handoff-N.md`, `objections-M.md`, `gate-M.md`.

v0.2 split the Tester's output into **visible tests**, which the Coder gets, and **held-out tests**, kept outside the repo for acceptance. It also let Punk take and read screenshots. Its first real job was Milestone 1 of a native desktop pet app (Tauri, Rust, TypeScript), run on Codex.

---

## v0.2 → v0.3: the desktop pet post-mortem

Milestone 1 passed every automated test on the first loop. Then I opened the repository:

1. **Paperwork.** Five tasks had produced **66 workflow files, about 24,000 words**. I stopped reading after the first one. If a gate's material can't be read in three minutes, the gate becomes a rubber stamp.
2. **Micromanaging briefs.** Briefs ran 8–9 KB and dictated about 85% of the internal interface decisions. The Coder had little left to decide.
3. **No tests where the bugs were.** No test reached the native window and orchestration layer, which is where the defensive code had piled up. No held-out test ever failed.
4. **Smuggled defenses.** The prompt said not to, and the code still carried about 200 lines of them: **11 state flags, two version counters and triple resets**. None of it broke a test, so Main's review let it through.
5. **Quiet changes.** A reminder feature had moved behind an "Advanced" submenu, and nobody told me.
6. **Homemade version control.** Git wasn't set up, so the agent invented its own snapshot scheme. The working copy grew to **5.2 GB**, dependencies and build output included.

### What v0.3 changed

- **Page budgets and a fixed file layout.** The brief, test plan, Punk report and gate packet get one page each (about 500 words). No other files.
- **A one-page gate packet** that must list **every feature removed, hidden or moved**.
- **A named risk layer.** Each brief names the layer most likely to break, and at least one test, or a written manual check, has to reach it.
- **`## Defenses added`.** The Coder lists every guard, flag, retry or fallback it added and the failure each one prevents. Defensive code in the diff that isn't on the list fails review.

---

## v0.3 → v0.4: moving the rules into `gw.py`

Reviewing v0.3 made one thing plain: **a prompt is a request, and a habit trained in by heavy RL is a reflex.** Rules like "don't edit files outside the brief", "keep sections short" and "don't go looking for the held-out tests" mostly hold, until a task gets hard.

There was a second cost. Having Main create worktrees, copy held-out tests and run merges by hand filled its context with mechanics. A separate model with a clean context caught the 11 flags that Main had waved through.

v0.4 moves every mechanical rule out of the prompt and into **`scripts/gw.py`**, a single Python file that uses only the standard library. Each task moves through these states:

```text
[briefed] -> gw planned -> [planned] -> gw seal   -> [sealed]   -> gw open    -> [coding]
[coding]  -> gw check   -> [review]  -> gw review -> [reviewed] -> gw holdout -> [passed]
[passed]  -> gw merge   -> [merged]  -> gw close  -> [done]
```

A command run out of order is refused, and the error names the command to run next.

### Three mechanisms in v0.4

1. **Single-use held-out sets (`gw seal`, `gw burn`).** Held-out tests are sealed in `~/.gw-vault/`, outside the repository, and copied into the worktree only for the run. When a set fails, Main's feedback to the Coder leaks part of it, so `gw burn N` turns the spent set into visible tests and the Tester writes a fresh one. The vault won't stop a Coder that goes looking for it; single use makes looking pointless.
2. **Orchestration as a headless state machine.** UI, window lifecycles and timers get split in two:
   - **Pure core:** `step(state, event) -> (state, effects)`. Plain data in and out, and time arrives as an event (`Tick(now)`). The Tester feeds it reordered, duplicated and interleaved event sequences, and the tests run in milliseconds.
   - **Thin shell:** turns OS or DOM facts into events and carries out effects one to one. `gw check` scans shell files and fails the task if any of them imports the state type. The shell has no unit tests; Punk and I test it by using it.
3. **A document linter (`gw docs`).** Every file in `docs/workflow/` is either a **record** (tables only, no prose) or a **thinking** file (at most three sentences per heading, bullets of 40 words or fewer). `gw docs` counts and rejects anything over.

---

## v0.4 → v0.5: the *Flow Timer* benchmark

With v0.4 in place I ran a four-way comparison on *Flow Timer*, a focus timer with idle detection. The spec contained **four planted ambiguities**: idle starting with under two minutes left, idle interleaved with a manual pause, rapid clicks, and a return inside the grace window (including the countdown crossing zero during it).

1. `graph-workflow` v0.4 on **Claude Code**
2. `graph-workflow` v0.4 on **Codex**
3. a **single agent** on Claude Code, no workflow
4. a **single agent** on Codex, no workflow

### The numbers

| | v0.4, Claude Code | v0.4, Codex | Single, Claude Code | Single, Codex |
| :--- | :--- | :--- | :--- | :--- |
| Finished | yes | under half | yes | yes |
| Active build time | ≈ 101 min | — | ≈ 10 min | 15 min |
| Orchestrator tokens | 410k peak, 40.7M cache reads | 48.1M total, 12.9M of it in 145 approval reviews | 161k peak, 4.5M cache reads | 1.1M cache reads |
| Planted cases put to the human | 0 / 4 | 0 / 4 | 0 / 4 | 0 / 4 |
| Planted cases pinned by tests | 4 / 4 | — | 2 / 4 | 2 / 4 |
| Six common UX faults shipped | 0 of 4 checked (2 unchecked) | — | 6 / 6 | 6 / 6 |
| Tests : product code (lines) | ≈ 5 : 1 (192 unit + 17 e2e) | — | 0.8 : 1 | 0.9 : 1 |

**The workflow did not produce a more correct timer.** All three finished builds behave the same on the four planted cases. Ten times the build time bought evidence and safety: a test pinning every planted case, a confirmation before skipping a session, a warning before leaving the page, state in the tab title, and browser tests.

Four findings shaped v0.5.

#### 1. Ambiguous cases get decided silently, workflow or not

None of the four builds asked about any planted case. The workflow did ask me four questions up front, but none of them was about the planted cases. The single agents matched the workflow on those four, and each made one more call it never mentioned. Single Codex counts a return inside the grace window as an interruption. Single Claude starts the two-minute away timer from the last input instead of from the tab switch. Either choice is reasonable, and I wasn't told about either.

**v0.5: a Gate 1 edge-case sweep.** The PRD gets an eight-column `## Edge cases` table. Main checks every requirement against seven categories (`threshold`, `interleave`, `repeat`, `time-cross`, `counting`, `environment`, `failure`) and writes a row, with options and a recommendation, for each case that can be read two ways. A category with nothing in dispute gets a single `- No dispute:` line, so the table doesn't balloon to requirements × categories. The CEO fills in the `Decision` column. **`gw gate 1` refuses until every category is covered and every row has a CEO decision, and `gw brief` refuses to run before Gate 1.** Each brief copies its rows verbatim, and every row must be named by a test.

#### 2. A builder doesn't see its own product

Both single-agent builds shipped all six of a set of common UX faults: skip with no confirmation, no state in the tab title, text contrast below WCAG AA, focus not moved to a banner when it appears, touch targets under 44 px, and nothing to stop a reload from losing the session. The single Codex agent took four screenshots and fixed a phone layout on its own, and still missed contrast and focus. Having eyes wasn't enough. It needed a reviewer whose only job is to object.

**v0.5:** those six are now Punk's `Always check` table, and its report has to say which ones it checked.

#### 3. Too much verification

On Claude Code, verification took **47% of the 139-minute wall time** (Tester 36 min, Punk 29 min), while the Coder took **6%** (8 min). Another 27% went to waiting for me at gates; take that out and you get the ≈ 101 active minutes in the table. The Tester wrote 192 unit tests against a cap of 171 that existed only in the prompt, about five lines of test code per line of product code. And 25 of those tests (13%) opened files under `src/` and searched the source for strings instead of checking behavior.

**v0.5:** `gw planned N` counts test cases with a regex, allows at most **one visible and two held-out tests** per acceptance criterion or edge-case row, and rejects any test that reads product source files as text.

#### 4. The coordination tax

Main read 40.7M cached tokens because a long-running orchestrator session pays for its whole context on every turn. Main's context grew from 79k to 410k tokens, and 26% of its requests were procedural overhead. On Codex the cost took a different form: an approval reviewer ran 145 reviews worth 12.9M tokens, and the agent stopped to ask me after every task.

**v0.5, as a prototype: `gw drive`.** Instead of Main driving the script, **the script drives Main**. Each step of a task (brief → tests → spec check → code → review → loop notes) runs as a **fresh `claude -p --output-format json` session with no prior conversation**. It gets only that step's file paths, and `gw`'s gates sit between steps. Main becomes a judge whose output ends with `VERDICT: done | pass | fail | rerun-tester | stop`. `gw finish N` chains review pass → held-out run → merge → close into one call that stops at the first failure.

So far `gw drive` has only run end to end against a fake CLI. Whether it lowers the tax is the next experiment.

The same run turned up a smaller fix. On Windows, `git worktree remove --force` followed a junction for `node_modules` and emptied the main checkout's copy. `gw close` now removes links before deleting a worktree, and can be rerun after a partial failure.

---

## What to take from it

- **For a small project, skip most of it.** On Flow Timer a single agent was about ten times cheaper and just as correct. Take the Gate 1 edge-case sweep and a Punk pass; between them they cover the two gaps the single agents had.
- **For a build with several milestones,** the parts that keep paying off are the held-out sets, the defense audit, the headless state machine for glue code, and moving every rule a script can check into the script.
- **v0.5 hasn't run on a real project yet.** Its changes answer the benchmark; the next test is a large project.

`graph-workflow` v0.5 is MIT-licensed, needs only the Python 3.8+ standard library, and installs into your personal skills folder (`~/.claude/skills/graph-workflow`). I'd welcome benchmarks, failure reports and PRs, especially ones that show where it doesn't help.

👉 **GitHub:** https://github.com/Ramirez0291/graph-workflow
