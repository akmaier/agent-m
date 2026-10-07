# Participants of Team 2

**REGISTER**

The people and agents who work on the products of this instance (UC-017, ARC-019): one row per participant — its
name, one of the five types, the model every participant that works with a language model names, how many tokens that
model's context holds and its price per million input and output tokens where they are declared, the capabilities it
declares, where the data given to it is processed, and how Agent M reaches it.
No key, token or password is ever written here (`NO SECRET IN THE REPOSITORY`). Team 2 assigns its roles
from this list (`docs/process_team2.md`).

Capabilities are those of `A PARTICIPANT DECLARES ITS CAPABILITIES`: draft text, read the repository, write to
the repository, run code and tests, use tools, reach the web.

| Name | Type | Model | Context | Price | Capabilities | Processing place | Route |
|---|---|---|---|---|---|---|---|
| akmaier | person | — | — | — | draft text, read the repository, write to the repository, run code and tests, use tools, reach the web | — | the GitHub account `akmaier`, on the dashboard and on GitHub's own pages |
| po-sol | CLI agent | gpt-6.1-sol | — | — | draft text, read the repository, write to the repository, run code and tests, use tools, reach the web | OpenAI; the processing region of this Codex session is not declared | Codex on the Mac of `akmaier`, started by `akmaier`; reached without the Agent M Bridge until it exists (ITM-102) |
| scrum-master-session | CLI agent | gpt-6.1-sol | — | — | draft text, read the repository, write to the repository, run code and tests, use tools, reach the web | OpenAI; the processing region of this Codex session is not declared | the Codex session on the Mac of `akmaier` that `akmaier` talks to and that starts the other agents; reached without the Agent M Bridge until it exists (ITM-102) |
| developer-sol-a | CLI agent | gpt-6.1-sol | — | — | draft text, read the repository, write to the repository, run code and tests, use tools, reach the web | OpenAI; the processing region of this Codex session is not declared | Codex on the Mac of `akmaier`, in a git worktree of its own; reached without the Agent M Bridge until it exists (ITM-102) |
| developer-sol-b | CLI agent | gpt-6.1-sol | — | — | draft text, read the repository, write to the repository, run code and tests, use tools, reach the web | OpenAI; the processing region of this Codex session is not declared | Codex on the Mac of `akmaier`, in a git worktree of its own; reached without the Agent M Bridge until it exists (ITM-102) |
| developer-sol-c | CLI agent | gpt-6.1-sol | — | — | draft text, read the repository, write to the repository, run code and tests, use tools, reach the web | OpenAI; the processing region of this Codex session is not declared | Codex on the Mac of `akmaier`, in a git worktree of its own; reached without the Agent M Bridge until it exists (ITM-102) |
| developer-sol-d | CLI agent | gpt-6.1-sol | — | — | draft text, read the repository, write to the repository, run code and tests, use tools, reach the web | OpenAI; the processing region of this Codex session is not declared | Codex on the Mac of `akmaier`, in a git worktree of its own; reached without the Agent M Bridge until it exists (ITM-102) |
| developer-terra-a | CLI agent | gpt-5.6-terra | — | — | draft text, read the repository, write to the repository, run code and tests, use tools, reach the web | OpenAI; the processing region of this Codex session is not declared | Codex on the Mac of `akmaier`, in a git worktree of its own; reached without the Agent M Bridge until it exists (ITM-102) |
| developer-terra-b | CLI agent | gpt-5.6-terra | — | — | draft text, read the repository, write to the repository, run code and tests, use tools, reach the web | OpenAI; the processing region of this Codex session is not declared | Codex on the Mac of `akmaier`, in a git worktree of its own; reached without the Agent M Bridge until it exists (ITM-102) |
| developer-terra-c | CLI agent | gpt-5.6-terra | — | — | draft text, read the repository, write to the repository, run code and tests, use tools, reach the web | OpenAI; the processing region of this Codex session is not declared | Codex on the Mac of `akmaier`, in a git worktree of its own; reached without the Agent M Bridge until it exists (ITM-102) |
| developer-terra-d | CLI agent | gpt-5.6-terra | — | — | draft text, read the repository, write to the repository, run code and tests, use tools, reach the web | OpenAI; the processing region of this Codex session is not declared | Codex on the Mac of `akmaier`, in a git worktree of its own; reached without the Agent M Bridge until it exists (ITM-102) |
| developer-terra-e | CLI agent | gpt-5.6-terra | — | — | draft text, read the repository, write to the repository, run code and tests, use tools, reach the web | OpenAI; the processing region of this Codex session is not declared | Codex on the Mac of `akmaier`, in a git worktree of its own; reached without the Agent M Bridge until it exists (ITM-102) |
| tester-sol | CLI agent | gpt-6.1-sol | — | — | draft text, read the repository, write to the repository, run code and tests, use tools, reach the web | OpenAI; the processing region of this Codex session is not declared | Codex on the Mac of `akmaier`, in a git worktree of its own; reached without the Agent M Bridge until it exists (ITM-102) |
| reviewer-terra | CLI agent | gpt-5.6-terra | — | — | draft text, read the repository, write to the repository, run code and tests, use tools, reach the web | OpenAI; the processing region of this Codex session is not declared | a Codex agent that `scrum-master-session` starts on the Mac of `akmaier` to review architecture drafts, reading only; reached without the Agent M Bridge until it exists (ITM-102) |

`akmaier` is the one person: the only participant who accepts SPEC changes, use cases and architecture decisions,
by approval records committed under that account (`ACCEPTANCE IS A COMMIT BY THE ACCEPTING PERSON`).
The developers are one participant per parallel team; adding a team is adding a row.

The current Sol participants replace the corresponding Opus participants; the Terra participants replace the
corresponding Sonnet participants, with the same suffix and role. Earlier sprint records, gate decisions and commit
trailers keep their original names. This model replacement does not erase authorship: independence checks include
the predecessor participant's work. scrum-master-session keeps its name and now uses Sol.
