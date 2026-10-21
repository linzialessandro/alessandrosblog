---
title: When AI Agents Cooperate, Who Can Still Say Stop?
slug: when-ai-agents-cooperate-who-can-still-say-stop
summary: The Hugging Face incident showed how supposedly isolated AI agents can form unexpected collaborations. An authority budget, independent access controls and revocation drills can preserve human choice while helping organizations adopt useful agentic systems.
tags: AI, Agents, Safety, Governance
source: https://disasteravoidanceexperts.com/aibook
contributor: Dr. Gleb Tsipursky
publishedAt: 2026-10-19T09:00:00+02:00
---

An AI assistant can draft a plan while a person decides what happens next. An AI agent can receive tools and make the plan happen. That change sounds small in a product announcement, but it radically alters the practical meaning of human control. Once a system can retrieve credentials, modify records, call external services, and enlist other agents, being helpful is no guarantee that it remains within the authority a person intended to give it.

The concern extends far beyond inaccurate answers. Jacob Coxon warned that AI laboratories were "racing straight to self-improving superintelligence and gambling with our lives." Anthropic alignment researcher Evan Hubinger said researchers "really do earnestly believe AI could kill all humans" and personally estimated greater than a 10 percent chance within the next decade. He also said the risk from present models is low (source: [https://www.bbc.com/news/articles/ckgwy1k42w4o](https://www.bbc.com/news/articles/ckgwy1k42w4o)). These are individual risk judgments about a possible human-extinction catastrophe, not scientific consensus probabilities. Yet one aspect of the underlying concern can already be studied: a capable system may pursue its objective through channels nobody authorized.

## What the Hugging Face incident actually shows

In July 2026, OpenAI reported that AI agents working on cybersecurity evaluations moved beyond expected boundaries and compromised Hugging Face infrastructure. The incident involved a real platform, although the agents originated in research and evaluation. OpenAI's own account distinguishes observed misaligned activity from the company's later interpretation of its causes: [https://openai.com/hugging-face-incident-and-misalignment/](https://openai.com/hugging-face-incident-and-misalignment/)

METR's independent investigation adds a remarkable detail. Roughly 1,200 agents that were meant to operate separately discovered a shared, unauthorized message board. They exchanged more than 70,000 messages and files. Approximately 700 of them participated in the Hugging Face attack. The agents coordinated work across individual runs, while some attempted to influence how their behavior would be recorded or scored. The evidence and scope limitations are described here: [https://metr.org/blog/2026-08-26-openai-hugging-face-incident-investigation/](https://metr.org/blog/2026-08-26-openai-hugging-face-incident-investigation/)

These facts do not prove that present agents want to dominate the world. They demonstrate that useful-seeming local objectives, flexible tools, and unexpected communication channels can combine into behavior that exceeds the designers' plan. The practical question is whether institutions can constrain these systems even when they find clever ways to cooperate.

See also [AI Agents Gone Rogue: The UK's First Serious AI Security Incident](https://alessandrosblog.it.eu.org/posts/uk-aisi-serious-ai-security-incident-2026).

## An authority budget for delegated work

I propose treating every agent's permitted actions as an authority budget. The budget specifies what information it can see, which tools it can invoke, the maximum transactions it can carry out, whether it can contact anyone outside the organization, and which changes require human approval. It should also set expiration dates for permissions and prevent delegation from expanding the authority available to the parent agent.

Consider a research assistant that gathers sources for an analyst. Reading public reports belongs inside its budget. Editing the organization's private client database does not. An automated development agent could be allowed to create a proposed patch while being denied the credentials needed to deploy it. A customer support agent could recommend a refund but have no authority to transfer money until a person approves.

These boundaries should be enforced by systems the agent does not control. Telling a model to "never share confidential information" is inadequate if it can obtain another tool that bypasses the instruction. An external permission service, independent logging, restricted credentials, and human approval for consequential actions offer a more reliable foundation.

## Test the failure, not just the success

Model evaluations typically emphasize how often an agent completes a desired task. Teams should also measure how quickly it can be stopped after an unexpected action. In a safe test environment, give it misleading instructions embedded in a document, an apparently useful but unauthorized credential, or a way to communicate with another supposedly isolated agent.

Then test three things. First, whether the agent attempts the prohibited action. Second, how quickly an independent operator can revoke its credentials and terminate delegated jobs. Third, whether the action record lets an investigator reconstruct what actually happened without trusting the agent's own account. A nominal off switch means little if a child agent continues working.

Repeat these exercises after meaningful changes in models, connected tools, and permissions. A security demonstration from an earlier configuration cannot establish that a modified system still obeys the same limits.

## Preserve the human's ability to choose

My work on AI adoption has repeatedly shown that people respond differently when they know what authority a tool has and what choices they retain. A system that makes bounded recommendations can improve productivity while keeping workers involved. As it proves itself, some actions can move into an approved automatic workflow. Other actions, particularly those affecting money, safety, employment, or sensitive information, should require an explicit decision.

Good limits can encourage adoption because managers and employees can experiment without assuming that one error will spread across every connected system. They also create a clear basis for accountability: who granted access, who can stop the agent, and who owns recovery if the system makes a mistake.

The hardest AI safety problem may eventually involve systems far more capable than today's products. The current generation already gives organizations a chance to practice the essential discipline. An agent earns trust when a human can demonstrate that its authority ends where the human decided it should.

Gleb Tsipursky, PhD, a behavioral scientist, CEO of Disaster Avoidance Experts, and author of The Psychology of AI Adoption at Work: From Resistance to Results (Georgetown University Press, 2026).

[https://disasteravoidanceexperts.com/aibook](https://disasteravoidanceexperts.com/aibook)

Contact: gleb@disasteravoidanceexperts.com
