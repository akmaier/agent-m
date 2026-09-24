# Agent M

**Companion tool to the book [*Vibe Coding*](https://link.springer.com/book/9783032399069) (Springer).**
Agent M runs the software engineering cycle the book teaches — requirement sources, requirements, use
cases, architecture, implementation, tests, release, manual — as an actual workflow on an actual
repository, with an AI doing the work and a human standing at the gates.

It is a **GitHub Pages site plus a set of repository conventions**. There is no server, no account,
and no database. Your products live in their own GitHub repositories; Agent M reads and writes them
through the GitHub API, with a token that stays in your browser.

## Start here — your own Agent M in three steps

Every user runs their own copy (a *fork*). GitHub leaves two switches off on every fork, and only
you can turn them on:

1. **Fork this repository** — button *Fork* at the top right of this page.
2. In your fork, click the tab **Settings** (top of the page), then **Pages** in the left column.
   Under *Build and deployment* choose *Deploy from a branch*, branch `main`, folder `/docs`, and
   press *Save*.
3. Still in your fork, click the tab **Actions** and press the green button *I understand my
   workflows, go ahead and enable them*.

After a minute your dashboard is at `https://<your-github-name>.github.io/agent-m/`. From there,
**+ Add product** guides you through everything else, including the GitHub key it needs — with an
explanation behind every step if you are new to GitHub.

> **Status:** the review dashboard is live — use cases and SPEC changes are reviewed and accepted
> there. The generating jobs (requirements, use cases, architecture …) are specified in
> [`SPEC.md`](SPEC.md) and not built yet. The design is in [`PLAN.md`](PLAN.md).

---

## What it does

The cycle has nine steps. Each one consumes the identifiers of the step before it, so nothing
downstream floats free of what justified it:

| Stage | Produces | Identifier |
|---|---|---|
| 1 Sources | who or what a requirement may legitimately come from, and with what authority | `SRC-…` |
| 2 Requirements | one testable statement per requirement, with source, occasion and guarding test | `REQ-…` |
| 3 Use cases | Mermaid diagrams and use-case descriptions, each naming the requirements it realises | `UC-…` |
| 4 Architecture | decisions and library choices as ADRs, each naming the use cases that force them | `ARC-…` |
| 5 Implementation | modules mapped to architecture decisions | `MOD-…` |
| 6 Tests | cases mapped to the requirements they guard | `TST-…` |
| 7 Dashboard | coverage and drift across versions — what has no test, what has no source | — |
| 8 Release | continuous integration, version bump, changelog, tag | `vYYYY.MINOR.PATCH` |
| 9 Manual | user documentation generated from use cases, not from code | — |

Software **evolution** re-enters the cycle through GitHub Issues: an issue becomes a requirement
change first, and only then a code change — never the other way round.

## How the product is developed — and which rules it must meet

Agent M keeps two things apart that are easily mixed up:

- **The process model** says *how* the team of people and agents works: roles, phases, order, and
  where someone must approve. Agent M carries the book's five models — *plan-driven*: waterfall,
  V-model, reuse-oriented; *agile*: Scrum, Kanban — and practices you can add to any of them:
  DevOps, prototyping, incremental delivery, scaling layers.
- **Requirement sources** say *what must hold*: of the product, or of the way it is built. A standard
  such as IEC 62304 is a source. Its process rules — documented verification, risk management — do
  not replace your model; they add gates and artifacts to it.

## Where the work runs

The same prompts and schemas, three drivers:

- **In your browser.** The Pages site calls the model endpoint you configured. Configuration, API
  key and GitHub token live in the browser's `localStorage` — never in a cookie, a URL or a
  repository. The GitHub token goes only to GitHub's API.
- **In GitHub Actions.** The same job runs server-side against a repository secret; its results
  appear on the dashboard as open, for you to accept. Useful for long runs.
- **Through a local CLI session.** A loopback bridge in front of `claude` or `codex` lets the page
  hand a coding task to the agent already running on your machine.

## Versioning

Calendar versioning, `YYYY.MINOR.PATCH`, for Agent M itself **and** for every product built with
it. One Agent M instance manages several products in parallel; each keeps its own version line.

## Licence

Not yet chosen. Until a `LICENSE` file is added, default copyright applies and the contents are
not licensed for reuse.

---

*Agent M is the working code name.*
