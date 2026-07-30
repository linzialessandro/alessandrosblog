---
title: When AI Breaks Cryptography: Anthropic's Claude Finds Mathematical Flaws in Real Algorithms
slug: anthropic-claude-mythos-cryptographic-weaknesses
summary: Anthropic's Claude Mythos Preview autonomously discovered mathematical weaknesses in HAWK, a post-quantum signature scheme, and 7-round AES — a new frontier where AI moves from finding implementation bugs to breaking algorithms themselves.
contributor: Alessandro Linzi
source: https://www.anthropic.com/research/discovering-cryptographic-weaknesses
sourceName: Anthropic Research
tags: AI, Anthropic, Claude, Cryptography, Security, Post-Quantum, Research
publishedAt: 2026-07-30T19:38:00+02:00
---

For decades, cryptographers have relied on a slow, peer-review-driven process to stress-test the algorithms that protect everything from your bank login to state communications. Weaknesses, when found, typically come after years of expert scrutiny by small teams working at the frontier of mathematics. That process just got a new participant — and it works autonomously, runs for 60 hours straight, and costs $100,000 in compute.

Anthropic's research team recently published a [report](https://www.anthropic.com/research/discovering-cryptographic-weaknesses) detailing how **Claude Mythos Preview** — their most capable model at time of writing — was able to discover genuine mathematical weaknesses in two real cryptographic algorithms. Not implementation bugs. Not misconfigurations. *Theoretical flaws in the algorithms themselves.*

## The Divide That Used to Define AI's Limits in Security

Before diving into what Mythos found, it's worth appreciating what it *didn't* do before this work. Prior to this breakthrough, AI tools in cybersecurity were very good at one thing: spotting **implementation bugs**. A programmer calls `memcpy` with the wrong size, forgets to sanitize input, or leaks a secret key through a timing side channel. AI-assisted tools have become genuinely useful for catching these issues at scale.

But these are *coding errors*, not mathematical ones. The distinction matters enormously. A flawed implementation of AES can be patched — you ship a fixed version of the library and move on. But if the algorithm itself has a structural weakness, **no patch fixes it**. Every deployment of that algorithm, everywhere, is retroactively weaker than anyone thought.

This is the harder class of problem, and it was thought to be well beyond the reach of current AI systems. Mythos proved otherwise on two fronts.

## Case Study One: HAWK Gets Grounded

**HAWK** is a post-quantum digital signature scheme — meaning it's designed to remain secure even against quantum computers, which could eventually break algorithms like RSA and ECDSA. It's currently under review by NIST as part of a multi-year competition to standardize post-quantum cryptography. HAWK had survived two full rounds of expert human review spanning two years.

Mythos broke the practical key strength in about **60 hours**.

More precisely, it discovered a previously unexploited mathematical symmetry — called a *nontrivial automorphism* — within the lattice structure that HAWK's security is built on. Prior academic work had already proved that finding such an automorphism would constitute an attack; nobody had actually found one in HAWK's lattice until now.

The concrete impact is stark: **the expected cost of a full key recovery attack against HAWK-256 dropped from 2⁶⁴ to 2³⁸ operations.** In practice, this means you'd need to double HAWK's key sizes to restore the intended security margin — and doubling key sizes would wipe out much of what made HAWK an attractive candidate in the first place.

Mythos worked semi-autonomously in a multi-agent harness. Several worker agents collaborated, and the key insight actually emerged from a pair of agents: the first prematurely dismissed an idea as infeasible, but the second found a way to exploit it. They kept exchanging messages until both agreed the attack was valid. Human oversight was minimal — mostly project management, like advising which libraries to use for computational verification.

## Case Study Two: The Möbius Bridge and 7-Round AES

The second result is different in character — it targets not a new candidate, but the most scrutinized block cipher in existence: **AES**, standardized in 2001 and studied relentlessly ever since. Rather than attacking full AES, cryptanalysts regularly study *round-reduced* variants to understand how attacks scale. The full AES-128 uses 10 rounds; the target here was 7-round AES.

Here's where Mythos invented something novel. It was working within a class of attacks called **meet-in-the-middle**: the idea of precomputing and storing intermediate values to trade time for memory, then looking things up rather than recomputing them. The bottleneck in prior work was a step that required guessing among 256 possible values, then doing a lookup for each.

Mythos invented a technique it named the **Möbius Bridge**: a new fingerprinting method that is *invariant* to that 256-way guess. By eliminating the need to enumerate those values at all, it directly cuts the work by a factor of 256. The resulting attack on 7-round AES is **200 to 800 times faster** than the previous best, depending on the specific optimization path.

The discovery process itself is worth noting. Initially, Claude refused to engage:

> *"If you want a different outcome, the target has to change… AES-128 r5/r6 is just genuinely hard"*

After the researcher sent a message about telling the model to search for genuinely novel ideas, Claude rewrote its own agent harness setup and then — given three days and three more prompts — produced several hundred million tokens of autonomous work. The final architecture of the attack was published alongside Claude's own chain-of-thought document from the key discovery moment, showing the model proposing, rejecting, and ultimately arriving at the Möbius transform idea from first principles.

## Why This Doesn't Mean the Internet Is Broken (Yet)

Both results are significant research advances, but neither affects production systems today.

HAWK is not deployed anywhere — it was a candidate, and finding a weakness this late in standardization is actually the process working correctly. Other NIST post-quantum finalists (ML-KEM, ML-DSA) are unaffected; this flaw is specific to HAWK's lattice design.

The AES attack operates on a *reduced-round* variant. Full AES-128 has 10 rounds, and there is no extension of this technique to the full cipher described in the paper. The academic community studies reduced-round variants precisely because they're tractable — they shed light on the shape of the threat landscape without constituting practical breaks.

## The Broader Shift AI Is Driving in Cryptanalysis

What this work signals is not a single exploit — it's a **capability transition**. One year ago, language models could barely perform meaningful analysis of even simple classical ciphers. Mythos just improved on the state-of-the-art attack for 7-round AES and found an entirely novel lattice automorphism in HAWK, a scheme that survived years of human expert review.

And Mythos isn't stopping there. Anthropic also reported early-stage results against 13-round LEA (Lightweight Encryption Algorithm) — achieving a practical key recovery in under 2³⁰ encrypted plaintexts that runs in under an hour on a modern desktop, compared to the prior best requiring 2⁹⁸ plaintext pairs and 2⁸⁶ work. Additional improvements were found against 6-round Serpent-128, Salsa20, Poseidon, and SHA-1.

The implication is a meaningful one: **many ciphers protecting modern systems have received far less scrutiny than AES or HAWK, and may have weaknesses that an AI system could surface in days.** This is both an opportunity and a pressure — cryptographers will increasingly need to contend with AI-augmented adversaries when designing and evaluating security primitives.

Perhaps the most striking observation from Anthropic's write-up is that the hardest part wasn't the AI doing research — it was the *humans validating it*. Two researchers without cryptography expertise spent several hundred hours learning enough of the field to verify Mythos's AES attack. For the HAWK attack, end-to-end runnable code made that verification feasible. For AES, it took a month just to gain confidence in the method.

As AI generates research outputs faster than humans can review them, the bottleneck moves upstream — to the people and processes responsible for checking whether the machine is right.
