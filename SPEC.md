# Agent M — Specification

**VERBINDLICH (SPEC)**

This is the single binding document of Agent M. A sentence belongs here when its violation would
be a defect. Everything else — how something is built, what was measured, what is planned —
belongs in `PLAN.md`, in `docs/measurements/`, or in the code, and does not bind.

**No section of this file is written by hand.** Each one is proposed in
`docs/spec-freigaben/<date>_<name>/`, shown next to the text it would replace, and written only
when the Product Owner accepts it there (`scripts/spec_dashboard.py` in the process repository).
That is why the sections below are still empty: the skeleton fixes the anchors, the approval
fixes the content.

**Form of a requirement** (from `SOFTWARE_MAINTENANCE.md`, *"Wie eine Anforderung aussieht"*):
a **name** in capitals that is the ID and never changes, a **source with a date**, one **rule**
stated as a single testable sentence, an **occasion** of one or two lines, and the **check** that
guards it. One statement per requirement — an "and" in the rule means it is two.

---

## 0. Hard product rules

These four hold for every version of Agent M. A change to any of them is a change to what the
product is.

**NO SERVER** *(PO A. Maier, 2026-09-23)*
Agent M is delivered as a static site, repository conventions, and optional workflows; the project
operates no server, no account system and no database.
*Occasion:* a book companion that requires an account is a service, and a service that outlives
the reader's interest in it is a liability. GitHub Pages plus the reader's own repository has no
such tail.
*Check:* `tests/test_no_backend.py` — the built site contains no call to an origin other than the
configured endpoint, the GitHub API, and the local bridge.

**ARTIFACTS ARE MARKDOWN** *(Vibe Coding, ch. 9 §6)*
Every artifact Agent M produces is Markdown, with diagrams written as Mermaid inside it.
*Occasion:* text-first artifacts can be versioned, diffed in a pull request, and read by both a
person and a model. Binary diagram formats break all three at once.
*Check:* `tests/test_artifact_format.py`

**NO SECRET IN THE REPOSITORY** *(PO A. Maier, 2026-09-23)*
No API key, access token or endpoint credential is written into a repository managed by Agent M.
*Occasion:* the reader's key is their own. A tool that can leak it into a public repository has
one failure mode too many, and the failure is not recoverable by deleting the commit.
*Check:* `tests/test_no_secret_written.py` — a generated artifact containing a configured secret
value fails the run.

**THE PRODUCT REPOSITORY IS SELF-SUFFICIENT** *(PO A. Maier, 2026-09-23)*
Removing Agent M leaves a complete, readable set of artifacts behind in the product repository.
*Occasion:* lock-in is the usual price of a workflow tool. Here it can be avoided for free,
because the artifacts were going to be Markdown anyway — so it is stated as a rule rather than
left to good intentions.
*Check:* `tests/test_self_sufficient.py` — no artifact references a file or service that exists
only inside Agent M.
## 1. Identity and traceability

*(not yet approved — proposal 02)*

## 2. Requirement sources

*(not yet approved — proposal 03)*

## 3. Requirements

*(not yet approved — proposal 04)*

## 4. Use cases and models

*(not yet approved — proposal 05)*

## 5. Process models and profiles

*(not yet approved — proposal 06)*

## 6. Runtimes

*(not yet approved — proposal 07)*

## 7. Configuration and secrets

*(not yet approved — proposal 08)*

## 8. Versioning

*(not yet approved — proposal 09)*

## 9. Human gates

*(not yet approved — proposal 10)*
