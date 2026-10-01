# Participants of this instance

**REGISTER**

The people and agents who work on the products of this instance (UC-017, ARC-019 decision 5): one row per
participant — its name, one of the five types, the model every participant that works with a language model
names, the capabilities it declares, where the data given to it is processed, and how Agent M reaches it.
No key, token or password is ever written here (`NO SECRET IN THE REPOSITORY`). A product assigns its roles
from this list (`docs/process.md`).

Capabilities are those of `A PARTICIPANT DECLARES ITS CAPABILITIES`: draft text, read the repository, write to
the repository, run code and tests, use tools, reach the web.

| Name | Type | Model | Capabilities | Processing place | Route |
|---|---|---|---|---|---|
| akmaier | person | — | draft text, read the repository, write to the repository, run code and tests, use tools, reach the web | — | the GitHub account `akmaier`, on the dashboard and on GitHub's own pages |
| po-fable | CLI agent | claude-fable-5-1 | draft text, read the repository, write to the repository, run code and tests, use tools, reach the web | Anthropic, a provider in the USA | Claude Code on the Mac of `akmaier`, started by `akmaier`; reached without the Agent M Bridge until it exists (ITM-102) |
| scrum-master-session | CLI agent | claude-opus-5-5 | draft text, read the repository, write to the repository, run code and tests, use tools, reach the web | Anthropic, a provider in the USA | the Claude Code session on the Mac of `akmaier` that `akmaier` talks to and that starts the other agents; reached without the Agent M Bridge until it exists (ITM-102) |
| developer-opus-a | CLI agent | claude-opus-5-5 | draft text, read the repository, write to the repository, run code and tests, use tools, reach the web | Anthropic, a provider in the USA | Claude Code on the Mac of `akmaier`, in a git worktree of its own; reached without the Agent M Bridge until it exists (ITM-102) |
| developer-opus-b | CLI agent | claude-opus-5-5 | draft text, read the repository, write to the repository, run code and tests, use tools, reach the web | Anthropic, a provider in the USA | Claude Code on the Mac of `akmaier`, in a git worktree of its own; reached without the Agent M Bridge until it exists (ITM-102) |
| developer-opus-c | CLI agent | claude-opus-5-5 | draft text, read the repository, write to the repository, run code and tests, use tools, reach the web | Anthropic, a provider in the USA | Claude Code on the Mac of `akmaier`, in a git worktree of its own; reached without the Agent M Bridge until it exists (ITM-102) |
| developer-opus-d | CLI agent | claude-opus-5-5 | draft text, read the repository, write to the repository, run code and tests, use tools, reach the web | Anthropic, a provider in the USA | Claude Code on the Mac of `akmaier`, in a git worktree of its own; reached without the Agent M Bridge until it exists (ITM-102) |
| tester-opus | CLI agent | claude-opus-5-5 | draft text, read the repository, write to the repository, run code and tests, use tools, reach the web | Anthropic, a provider in the USA | Claude Code on the Mac of `akmaier`, in a git worktree of its own; reached without the Agent M Bridge until it exists (ITM-102) |

`akmaier` is the one person: the only participant who accepts SPEC changes, use cases, architecture decisions and
modules, by approval records committed under that account (`ACCEPTANCE IS A COMMIT BY THE ACCEPTING PERSON`).
The developers are one participant per parallel team; adding a team is adding a row. `developer-opus-d` was named
`scrum-master-opus` until 2026-10-01 and closed sprint 01 under that name; since then the Scrum Master is
`scrum-master-session` (PO decision akmaier, 2026-10-01).
