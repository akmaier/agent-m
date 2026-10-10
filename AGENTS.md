# AGENTS.md — Binding Working Rules for Agents (Human & AI)

Applies to **every** agent working on this repository — the main agent **and** subagents. These rules take precedence over convenience. The goal is clear structure and no ad-hoc chaos.

## 1. Document hierarchy: what is binding — and what is not

| Header | Meaning | Modification |
|---|---|---|
| **BINDING (SPEC)** | Requirement. Violating it is an error. | only via the approval path defined by the product SPEC |
| **PLAN** | Intended work, draft, implementation path | may be changed freely; becomes binding only when a sentence from it is incorporated into the SPEC |
| **MEASUREMENT** | dated finding including method | is not modified retroactively; superseded findings receive a new entry alongside the old one |
| **REGISTER** | ongoing list (tickets, gaps, backlog, changelog) | may be changed freely |

**Exactly the following is binding:**

- **agent-m repository:** this `AGENTS.md` and [`SPEC.md`](SPEC.md).
- **Managed product repository:** that product’s single `SPEC.md`.

**What an agent reads before starting work:** this `AGENTS.md` and the repository’s `SPEC.md`, in the original. Read the use cases and architecture affected by the changes at hand, and read them **before editing them**. Read originals, never another agent’s summary.

**What belongs in the SPEC:** invariants, not implementation instructions. A sentence belongs there if violating it would constitute an error. Every sentence states the required target state, is testable, and contains **no** justification, ticket number, date, or measurement value — at most two pointers: `[→ Detail document §x]` and `[Verification: tests/…]`. **The justification belongs in the approval package**
(`docs/spec-freigaben/<package>/NN-*.begruendung.md`), where it is stored together with the decision that made the sentence binding.

**The approval package resides in the repository of the document being decided upon**, under `docs/spec-freigaben/`. If a decision concerns multiple repositories, it is split; a pointer across repository boundaries is not sufficient. **There is no `ersetzt/` folder** — the git history preserves the replaced text (`git show <commit>^:<file>`); a second copy would diverge.

**A pointer is a signpost, never load-bearing.** `[→ File §x]` means “there is more information there” — never “the rule is defined there.” A rule that is meant to apply must appear **in** the SPEC; a non-binding document cannot hold that rule on behalf of the SPEC.

**Every document has ONE repository as its single source of truth** — product **or** process, never both. No duplicate files across repository boundaries; an intentional snapshot is explicitly marked as such.

**No `MEMORY.md` / no auto-memory as a source of knowledge.**

**History belongs in git commit messages and version history, not in the files themselves.** Files state what holds now; do not add change logs, edit dates or accounts of previous changes to them.

## 2. Working method: SPEC-first (non-negotiable)

EVERY SPEC CHANGE MUST BE COORDINATED WITH THE USER. NO UNILATERAL ACTIONS!!!!!

**Work according to the existing [Agent M SPEC](SPEC.md).**

- Only require SPEC or use case changes if you cannot implement your task successfully against the SPEC and the use case.
- Never propose a new architecture to the user if it has not been verified against the SPEC and use cases as a whole.
- Follow **YAGNI** and **KISS**: implement only what the task requires, with the simplest design that meets the SPEC and use cases.
- This repository holds the full text of the vibe coding textbook. **Consult it first if you have questions**; it also helps understand the user. Its register is [SRC-vibe-coding](docs/sources/SRC-vibe-coding.md), and the full text is under `docs/sources/SRC-vibe-coding/2026-10-05/`.

**Provide traceable evidence for diagnosis and fix — for the user.** Root cause and proof of the fix are explained **to you (the user/PO)** — and between agents — as a concrete **call-stack/data-flow path**
(`file:line → function → transformation → failure point`, actual/expected), with **verification at the failure node** — never merely as a conclusion. Without this path, a human cannot verify either the diagnosis or whether the fix actually takes effect. Follow the requirements and Definition of Done in [Agent M’s SPEC](SPEC.md).

**The user is the human `akmaier`.** Acceptance of SPEC changes, use cases and architecture stays with that person. An agent Product Owner decides only the gates assigned to it by the declared process; it does not accept those artifacts on the human’s behalf.

**Designing.** Before proposing any design — a SPEC change, a use case, an architecture, a file layout, a data structure — read the book's design principles in the original: ch. 10 *Principles for Robust Architecture Under AI Acceleration* (`docs/sources/SRC-vibe-coding/2026-10-05/10_architectural-design.md`) and ch. 12 *Design Guidelines: One Thing at a Time* and *KISS: Keep It Simple* (`docs/sources/SRC-vibe-coding/2026-10-05/12_implementation-and-version-control.md`). Check the design against them, and name for each decision the principle it rests on:

1. **One responsibility per file, rule and use case.** Two concerns never share a file.
2. **Nothing twice.** A rule that keeps two copies equal shows a duplicate: remove the copy instead of adding the rule.
3. **Nothing the SPEC already says.** Before adding a requirement, check whether an existing one already gives it.
4. **Adding one of a kind changes nothing of another kind.** A new team changes neither the process nor another team.
5. **No special first case.** The first of a kind follows the same convention as every later one.

When the user rejects a design, derive the next one from these principles again; do not patch the rejected one.

## 3. Process

- **All requests are handled according to the [`SPEC.md`](SPEC.md) process.** The agent follows the processes and requirements defined there.

## 4. Delegation to subagents

- **Delegate large work packages to subagents.** Every subagent follows the reading rules above and works according to [Agent M’s SPEC](SPEC.md). ALL SPEC CHANGES MUST BE COORDINATED WITH THE USER.
- Production deployment and sending email remain subject to human approval; follow [Agent M’s SPEC](SPEC.md).

## 5. Git workflow: the main agent remains on `main`

- **The main agent works exclusively in the primary working tree on branch `main`.** There must be **no**
  `git checkout` / `git checkout -b` to another branch there — the primary working tree remains **at all times**
  on `main`.
- **Subagents may** work in **their own git worktrees/branches** (isolation: physically separate
  directories under `.agent/worktrees/agent-<id>/`, with their own branch) — including in parallel.
- **File-writing subagents therefore run in isolation** (their own worktree); read-only subagents
  may share the main working tree.
- **Purpose:** the primary working tree remains predictably on `main`, while subagent work stays isolated.

## 6. Hard requirements (must never regress)

- **Agent M’s product invariants have their single source of truth in [SPEC.md](SPEC.md), including §0 “Hard product rules”.** Do not duplicate or replace them here with another product’s requirements.
- **Follow Agent M’s process requirements in [SPEC.md](SPEC.md).** Its declared process, tests and gates determine how the task is carried out.

## 6a. No hacks — get to the bottom of the problem

1. **First read the existing, working caller — then probe.** Before interacting with a system
   (container, DB, API, test engine), read **how the existing code does it**:
   what staging, what paths, what environment, what authentication path. A custom access method is
   only permitted once it has been demonstrated that the existing one does not fit. *Test: “Is there a file
   that already does exactly this?” — if yes, use it or copy its pattern.*

2. **A NEGATIVE result from an ad-hoc test is not a finding until the test has been verified against a
   known POSITIVE.** “0 matches”, “not present”, “does not apply” may only be reported once
   the same tool demonstrably matches a case that MUST match.
   Grep direction, regex variants, spellings, and line breaks are common traps.

3. **Do not draw a conclusion that changes the plan before the supporting test has been run.** A statement
   such as “the baseline is unusable”, “the patch is missing”, or “the direction is X” must
   **either** be supported by evidence **or** be phrased as an open question — never as a conclusion
   followed by a test afterward. The damage is not the error itself, but the work that builds on it.

4. **No unrequested checks.** An agent performs only checks that the PO has requested
   or that a binding document requires. Do not invent additional obligations.

5. **A rule is quoted, not remembered.** Anyone relying on a rule reads it first
   and names the document and location. Verify that the cited rule applies to the task at hand.

6. **Search first, then ask.** A question to a human is itself a claim —
   namely that the matter could not be resolved independently. Before asking, research:
   the repository’s textbook first, the relevant original documents, available evidence and current practice.
   **Whatever remains unresolved is asked — but together with a sentence explaining why it could not be clarified.**
   A question without that sentence has not been properly checked.

7. **Read what a rule says, not what it might mean.** A reading that adds a word the text does not contain —
   *only*, *every*, *the same as* — is an open question, quoted with the sentence it reads, never a finding.
   A message from the user that can refer to more than one thing is the same: ask which before acting.

## 7. Separate data and code (test cases)

- **Test-case DATA must not be stored as large literals in `.py` files.** For each test battery:
  **ONE data file (Markdown, human-readable, lossless) + ONE Python file (loader/
  adapter only).** Keep large embedded `CASES` literals out of Python files.

- **The interface remains unchanged:** the loader parses the `.md` file and reconstructs **exactly** the existing
  dict structures; the runners import **the same unchanged `CASES` interface**. Such a refactor is purely
  a data/code split, **not** a behavior-change ticket (golden master:
  canonical JSON dump before == after).

- **Exception:** formats that already separate data from code remain unchanged — in particular,
  `tests/eval_corpus.jsonl` (JSONL = data separated from code) is **not** forced into Markdown.
