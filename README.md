# Agent M

**Companion tool to the *Vibe Coding* book.** Agent M runs the software engineering cycle the book
teaches — requirement sources, requirements, use cases, architecture, implementation, tests,
release, manual — as an actual workflow on an actual repository, with an AI doing the work and a
human standing at the gates.

It is a **GitHub Pages site plus a set of repository conventions**. There is no server, no
account, and no database. Your product lives in your own GitHub repository; Agent M reads and
writes it through the GitHub API, and the model endpoint it talks to is whichever one you
configure in your browser.

> **Status: Phase 1 — specification and design. No implementation yet.**
> The binding requirements are being proposed one block at a time in
> [`docs/spec-freigaben/`](docs/spec-freigaben/); [`SPEC.md`](SPEC.md) fills up as they are
> approved. The design that motivates them is in [`PLAN.md`](PLAN.md).

---

## What it does

The cycle is nine stages. Each one consumes the identifiers of the stage before it, so nothing
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

## Choosing a process model

Agent M does not impose one way of working. It carries the model catalogue from the book and lets
you pick per product, because each model manages a different risk well and accepts a different one:

**Waterfall** · **V-model** · **reuse-oriented** · **incremental / prototyping** ·
**agile** · **Kanban** · **Scrum** · **DevOps** · **disciplined agile delivery at scale**

The model determines which stages exist, in what order, and where the gates sit. On top of it you
can lay a **profile** — for example IEC 62304 safety class A, B or C — which adds required
artifacts and evidence without replacing the underlying flow.

## Where the work runs

The same prompts and schemas, three drivers:

- **In your browser.** The Pages site calls the model endpoint you configured. Configuration and
  API key live in `localStorage` and never leave the machine — they are not sent to GitHub, and
  they are never written to this repository.
- **In GitHub Actions.** The same stage runs server-side against a repository secret and opens a
  pull request. Useful for long runs and for reviewers who are not you.
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
