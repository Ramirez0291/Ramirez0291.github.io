---
title: "Teach Your Agent to Search"
description: "Sometimes an Agent's problem isn't bad code. It's starting to code too soon."
date: 2026-10-26
category: notes
lastVerified: 2026-10-26
machineTranslated: true
sourceHash: 75f004d25ee6
---

## 1. Boosting Agent Research Performance with a Few Simple Skills

On October 20, 2026, the paper *Automating ML for Science: Can Frontier Agents Climb Scientific Hills in the Wild?* was published on arXiv ([arXiv:2610.28763](https://arxiv.org/abs/2610.28763)).
The experiments in the paper covered 11 scientific domains and 20 benchmarks, investigating whether frontier Coding Agents can autonomously improve existing published best models from the benchmarks.

The paper added three targeted Skills to the Agent: Research Ideation, Experiment Management, and Scheduled Checklists. The average relative improvements on the 20 benchmarks before and after adding the Skills are as follows:

| Agent | No Skills | With Skills |
| --- | --- | --- |
| Claude Opus 4.6 (Claude Code) | 10.4% | 20.1% |
| Codex (GPT-5.4) | 4.4% | 8.1% |

The paper also summarized three failure modes of Agents:

1. **Novelty Miscalibration**: The Agent's judgment of what is "novel" is systematically misaligned with humans, often treating mature conventional techniques as innovation (the example in the paper is treating cosine learning rate scheduling as a breakthrough).
2. **Resource Under-utilization**: GPUs frequently sit idle, experiments that could run in parallel are executed sequentially, or cause CPU/GPU resource contention.
3. **Exploration Collapse**: As the run progresses, the Agent's strategy narrows, quickly locking into familiar local optimization patterns and repeatedly tuning parameters, but rarely seeking new breakthroughs from the domain itself.

## 2. Why Might Breadth-First Search Improve Engineering Quality?

Bringing the above theory to everyday engineering, it manifests as: the Agent starts writing code directly without fully understanding the situation.

I believe that by requiring the Agent to conduct breadth-first search before code tasks, improvements can be achieved.

1. **Reduce reinventing the wheel**

   An Agent might spend hours implementing a set of task scheduling, retry, or state management mechanisms without knowing that mature components already solve most of the problem. Breadth-first search can help it identify existing solutions and redirect focus to differentiated requirements.

2. **Expand the candidate space for architectural decisions**

   An Agent can often write a complete design for one solution but may not seriously compare two other architectures. Searching existing practices first can elevate decisions from "can this solution be implemented" to "why is this solution better than alternatives."

3. **Discover hidden costs early**

   Open source project Issues, migration guides, security announcements, and design discussions often reveal compatibility, performance, and maintenance issues that the README doesn't emphasize. This information is especially useful in avoiding architectural errors.

4. **Gain practical experience beyond the model's training knowledge**

   The Agent's internal knowledge may not include major API changes that happened recently in a framework, or design patterns the community has abandoned. Verified external information can help it update its judgment.

But keep in mind:

Finding a mature solution doesn't mean you must adopt it.

My recommended approach is to learn the architectural patterns, conventions, and design experience from it; at most, borrow specific implementation details from open source projects.

## 3. How to Design an Engineering Skill

I define it as an Architecture Discovery Gate, with the following flow:

1. **Understand requirements and current codebase**: First understand existing implementations, the tech stack, and constraints.
2. **Determine if external research is needed**: Decide whether to trigger research based on novelty level, decision risk, and whether existing knowledge is sufficient.
3. **Research from three categories of sources**:
    - Standards and specifications: RFCs, official documentation
    - Open source ecosystem: code, versions, maintenance status
    - Counter-evidence: Issues, vulnerabilities, limitations
4. **Compare candidate solutions and record ADRs**: Among the three choices of "reuse existing solutions, implement ourselves, maintain status quo," compare at least the applicable ones and document the decision rationale with an ADR (Architecture Decision Record).
5. **Small-scale verification → implementation → independent testing**: Use actual engineering evidence to prove the solution is viable, rather than treating search results as proof of correctness.

Also: if your organization has its own codebase, search internally first, then externally.

If you want to go one step further?

Then let multiple SubAgents search for different answers.

But I recommend adding one constraint here: multiple Agents cannot simply search the same keywords and then vote on which solution is better.

Because this often results in highly redundant results.

Assign each Agent independent search objectives, for example, corresponding to the three categories of sources in step 3 above: one searches standards and specifications, one searches the open source ecosystem, one specifically looks for counter-evidence.

## 4. Don't Let Them Engage in Unsupervised Adversarial Competition

I ran an experiment. Initially, I just built a stage where several AIs would compete against each other until reaching consensus.

Several experimental topics unexpectedly yielded decent conclusions, so I gave them a task—build a document platform to categorize documents and generate reports.

After models from three different vendors burned through three weeks' worth of \$20 tier subscriptions (I'm not sure why they needed so long, but out of curiosity I didn't stop their spree), they handed me something that defended against every edge case imaginable, required perfect input to produce results, performed multiple hash checks on every piece of data, made users rely entirely on code instructions, needed the approval of Agents from three vendors each in three completely isolated sandboxes in safe mode every time content was added before a vote could determine whether to proceed, and was extraordinarily unfriendly to carbon-based lifeforms—a monstrosity of waste.

This document platform experienced a classic form of architectural bloat:

- One Agent raised a data integrity risk, so hash validation was added.
- Another Agent raised a single point of failure risk, so multi-Agent approval was added.
- The third Agent raised a security risk in the approval process, so isolation mechanisms were added.
- In the end, every part of the system had solid technical justification, but no one was responsible for answering: the user just wanted to organize documents nicely, so why go through so many gates?

The reason is simple: there was no role in the development process with the authority to judge whether a risk is worth solving, and how much can be sacrificed to solve it.

This creates a special phenomenon of Goodhart's Law: when architectural correctness, risk coverage, and review consistency become optimization targets, the user value that actually matters gets squeezed out of the optimization process.

Back to the paper cited in section one: the Research Ideation Skill encourages the Agent to expand its search space at the start of the task, while the Scheduled Checklists that trigger every hour are used to detect whether the Agent has fallen back into mechanical tuning. The paper also acknowledges that these Skills were summarized from Claude Code's execution trajectories and the effectiveness may not fully transfer to other tasks and Agents.

What we should learn from the paper is minimum effective behavioral intervention, not mimicking an increasingly complex system of human social governance.

## 5. My Current Workflow

When writing this article, my own Vibe Coding workflow is roughly as follows:

0. **Product intent and boundaries**: What do I need to accomplish? What things must stay simple? What things do I leave alone for now?
1. **Investigation**: Main Agent determines project stage, existing tech stack and delivery scope, while dispatching a Research SubAgent to search for existing solutions, maintenance status, and engineering experience.
2. **Technical solution comparison and architectural decision**: I and the Main Agent are responsible for deciding, prioritizing product goals, and controlling dependencies and complexity.
3. **The skepticism phase**: A Skeptic SubAgent is responsible for raising bounded objections.
4. **Delivery judgment**: Check whether the operational chain can work, judge whether it can be delivered.

So, before letting your Agent write the first line of code, teach it to search first.
