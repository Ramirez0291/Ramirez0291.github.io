---
title: "How I Manage Five Projects in Parallel"
description: "Stop trusting single Agents—I run on four roles and a script"
date: 2026-11-06
category: notes
lastVerified: 2026-11-06
machineTranslated: true
sourceHash: c13f3de04c6d
---

## One Agent and a Strong Enough Harness—That's All You Need?

There's a popular saying going around: a strong model and a good harness, one agent can take a product from requirements to production. Breaking down tasks? Let Claude Code or Codex handle that themselves.

I used to believe it too. Then I realized the problem: that saying conflates "can it get done" with "is what gets done what you actually want." Sure, harnesses are getting stronger, but some problems are structural—you can't intelligence your way out of them.

An agent working solo from start to finish has three blind spots that won't go away no matter how you upgrade the model:

- **I think I can handle this.** When the requirements don't specify boundaries, she'll quietly fill them in based on her own habits. Models also have a habit of slacking off when you're not looking.
- **Developers are bug factories.** Like humans, if you let the developer test their own code, you'll never find bugs—because their understanding of the requirements is identical to when they wrote the code.
- **A product manager lost in their own art.** The PM knows why the button is there, so they'll never think it's hard to find.

None of these problems have anything to do with model intelligence. They stem from the same pair of eyes playing both athlete and referee. So the solution isn't a stronger harness—it's process: who sets the problem, who solves it, who validates it, who calls the shots.

> I don't have statistics, just vibes: the worst disasters often come from the most cutting-edge models. The worst burn I took was from Fable 5.1.

## Why One Person Managing Multiple Products Never Feels On Top of Things

I manage multiple products at once, and I'm the only one who cares what they end up as.

**Cognitive debt, like a credit card.** Writing code yourself is cash payment: write a line, understand a line, comprehension gets settled instantly. Hand it to an agent, and you get the product now, but the bill for understanding comes later. Time keeps running, interest keeps compounding. More products, more debt. Jumping between projects, the version in your head is obsolete before you know it.

Agents produce faster than humans can read. You'll never pay down this debt by reading code.

**Orchestration tax, like a toll road.** To shore up agent shortcomings, a lot of people split their workflow into stacks of roles: analysts, PMs, architects, devs, QA. Each handoff loses some information. Each gate costs tokens. The finer you split the roles, the more handoffs, the more bloated the coordinator's context, the more compute you waste on "are you done yet, is it my turn" ceremonies, and the farther what you get ends up from what you originally wanted.

Two accounts pulling opposite directions: don't split, cognitive debt spirals out of control; split wrong, orchestration tax crushes you. **So the question isn't whether to split—it's where to split.**

## Five Old Tricks From Real Life

My workflow is called graph-workflow. It has four roles and one Python script. Nothing in it is fancy—office workers use these tricks every day.

**Turnstiles!**

&#91;embedded content: graph-workflow overview · four roles, one turnstile, one vault\]


### 1. One Foreman

The more people in the telephone game, the more the last sentence drifts. So I put PM, architect, orchestrator, and code review all on one role: Main. She runs the strongest model and talks to the user in the conversation window.

I split out the other roles for exactly three things: I need fresh eyes untainted by context (Tester, Punk), I need parallel work (Coder), and I need to reduce Main's context load.

Roles don't chat with each other—no small talk, no wasting context on pleasantries. They only pass files with page limits.

### 2. Requirements Checklist

A contractor won't ask where to put the outlet—they'll install it by habit. Agents do the same thing: wherever requirements are vague, they quietly decide for you.

So before work starts, there's a checklist (Gate 1). Main runs every requirement through seven categories: thresholds, mid-stream insertions, repeating triggers, time boundaries, counting conventions, runtime environment, failure recovery. She has to be like someone savvy at managing up—lay out all the options and recommendations—but the "decision" column must be filled in by the user's hand. Leave it blank? Then forget the next step.

These decisions get copied word-for-word into every task's brief. The script does word-for-word comparison—not a single character changes. That way every role downstream gets the original requirements intact.

### 3. The Test Taker Can't Write Their Own Exam

If the test taker writes the exam and grades it, the score means nothing. But letting an agent write code first and then tack on tests is exactly that: the test grows to match the code, inheriting all the buggy logic in the process.

My Tester writes the exam before any code exists, reading only the brief. The exam has two parts: visible problems go to Coder as examples, hidden problems lock in a vault outside the repo and don't unseal until test time.

And one more rule: **each set of hidden problems is used only once.** Problems that fail go back to Coder for fixes, and Tester writes a brand new set of problems that've never been seen. Even if Coder peeks, all they see is a discarded test. Three rounds without passing, the task hangs, goes to user review.

&#91;embedded content: acceptance loop for each task · hidden problems discarded after use\]


### 4. The Picky "Customer"

Artists are always lost in their own art. Product-building agents can't see the outside world either.

Punk is the most important role in my workflow. Her job is to play devil's advocate. She reads the PRD only, never the code. She takes screenshots at desktop and mobile widths, looking at the product from the user's angle: Does the main task actually complete? Did we ship what the PRD promised? Is there weird stuff poking out? Does the flow feel natural? She gives at most five objections, each with screenshots, cost, and an alternative. She checks each one against a standard UX checklist: Is there confirmation on dangerous actions? Does state persist when you leave? Is the text readable? Does a refresh lose data? That kind of thing.

She and Main are meant to clash. Main writes plans and reviews code—the better she does both, the less she can see her own blind spots. Punk starts cold with no context. All she knows is she's a "user" right now.

### 5. A Turnstile, Not a "Don't Cheat" Sign

To be blunt: rules in prompts are meant to be broken.

So anything that can be mechanically checked, I hand off to `gw.py`: every task's nine steps must run in order, Coder can only touch files listed in the brief, visible problems must be byte-identical, each requirement gets at most 1 visible problem and 2 hidden ones, tests can't read strings from source code, docs have word limits.

Users only show up at two gates: before work starts to sign the requirements checklist (Gate 1), and at each milestone for acceptance testing (Gate 3). Individual task acceptance in between (Gate 2) is managed by Main and the script. Users don't have to worry about it.

## How to Review Your Screw-Ups

Experience needs to transfer to the next session. Business intuition should compound with each iteration—not relying on the user to re-explain every time, and not leaving it to chance.

On roads, accident hotspots get warning signs, but that's cheap and useless. What works is guardrails and rerouting. A paragraph written into shared config is just a warning sign—agents may not follow it, lots of rules conflict with each other, and they get ignored when context gets long.

My CHANGELOG is basically a book of mistakes. Each mistake becomes a guardrail. For example:

| Problem | Guardrail |
| --- | --- |
| Pre-commit hook rejects commit, but merge command ignores the failure and still reports MERGED, then we close the task, delete the worktree, and the task code vanishes | Stop on commit failure; refuse merge if there's no new commit on the task branch |
| Template recommends junctions to share `node_modules`, force-deleting the worktree nukes the main directory dependencies too | Unlink everything before deleting the worktree |
| Two parallel tasks finish at the same time and clobber each other's state files | Reread before saving, only write your own task |
| One batch of tests scrape strings from source code, not testing actual behavior | Script rejects tests that read source |
| UI agent keeps ignoring user experience | Add it to Punk's mandatory checklist |

These problems have something in common: none are written in the requirements, and all happen at the boundary between agent and environment—hooks, links, concurrency, Windows PowerShell. Tester owns whether code matches the brief. Punk owns whether the product matches the requirements. Only the script owns "does the workflow match reality." Agents will blindside you in the dumbest places. You can't write these ahead of time, you catch them after and triage fast.

My triage principle: **if you can make it a guardrail, don't make it a warning sign.** Top to bottom, pick the first place it fits:

| Problem Type | Where It Goes | How Certain |
| --- | --- | --- |
| Process or environment failure | Checks in script | Guardrail |
| Product behavior regression | Turn used hidden problems into permanent regression tests | Guardrail |
| Agent silently decides for you again | Add category or follow-up question to checklist | Gate, stop before work starts |
| Recurring UI bugs | Punk's mandatory checklist | Gate, stop at milestones |
| This project's technical or business quirks | Gotchas in component docs, read when you use the component | Warning sign |
| Cross-project tech stack traps | Shared knowledge base for all agents | Warning sign |
| One-time event | Don't move it, just log it | — |


## This Isn't a Silver Bullet

Now for the hard truth.

- **Orchestration tax is real.** One more role means one more handoff, one more file, one more round of waiting. This whole workflow is slower and more expensive than one agent cranking it out end-to-end. The only thing you get for it: you don't have to read the code.
- **Small work isn't worth it.** For tiny requirements, Main and the checklist are enough. Maybe add Punk if you're feeling it.
- **Process breeds paperwork.** More roles, more docs explode. Cognitive debt just moves from code to natural language. So I put page limits on every document type and let the script count. (Occasionally I get models complaining about running out of paper.)
- **Changing structure or rewriting prompts isn't guaranteed to fix it.** Papers on multi-agent system failures show that tweaking prompts and tweaking topology both help, which is more effective depends on the system, and a lot of authors' own conclusion is "useful, but not enough." When something keeps failing, change the smallest thing that can actually fix it.

## The Bottom Line

1. **Harness decides whether it gets done. Process decides whether it's what you want.** Even if the next generation is cheaper and stronger, I don't think this problem goes away on its own.
2. **Posing the problem, solving it, and validating it need three different pairs of eyes.** Tests come before code. Hidden problems are used once.
3. **Humans only show up twice.** Sign the checklist before work starts, do acceptance testing at milestones. You can skip reading code entirely, but you must read the checklist carefully: cognitive debt doesn't disappear, but you can compress it into one document.
4. **If a rule can be written as code, don't write it as a prompt.** Prompts are just "suggestions."
5. **Assign a dedicated contrarian role to every product.** If no one else cares what it becomes, make someone.
6. **Account for the cost of splitting.** Adding workflow beats adding intelligence.

graph-workflow is open source under MIT: [github.com/Ramirez0291/graph-workflow](https://github.com/Ramirez0291/graph-workflow). Pull it down and give it a try. Break it. Every new break becomes a new guardrail.
