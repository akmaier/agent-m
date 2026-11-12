---
id: ARC-055
title: A conversation keeps its CLI session running in a terminal of the Bridge
refines: ARC-040
forced_by:
  - THE BRIDGE'S WINDOW SHOWS EACH JOB'S CONSOLE LIVE
  - THE BRIDGE KEEPS EACH JOB'S LOG FOR SIX WEEKS
  - A CANCELLED JOB WRITES NOTHING MORE
  - NO COST IS GUESSED
  - A JOB IS RECORDED IN ITS PRODUCT REPOSITORY
  - THE BRIDGE IS ONE FILE PER PLATFORM
  - A REUSE DECISION RECORDS ITS DUE DILIGENCE
  - DUE DILIGENCE IS FETCHED, NOT RECALLED
  - A REUSED LICENCE IS SHOWN AGAINST THE PRODUCT'S
  - UC-049
  - UC-044
designs:
  - MOD-agent-processes
  - MOD-bridge-jobs
  - MOD-bridge-http
  - MOD-bridge-client
  - MOD-prompt-bar
  - MOD-bridge-build
---
# ARC-055 A conversation keeps its CLI session running in a terminal of the Bridge

## Context

UC-049 step 4: on a conversation's first message to a CLI session, its Bridge starts the agent *"in its normal
interactive mode, in auto mode, with the model chosen, in the conversation's own checkout of the product, inside a
terminal the Bridge keeps open"*; every message *"is typed into that one running agent"*, which *"keeps its context from
one message to the next"*; *"The Bridge keeps what the terminal shows, its console; the prompt bar and the Bridge's window
(UC-044, step 6) show it live while the agent works"*; the session runs until **Stop** (5a) or **Clear conversation**
(6d), or until its Bridge ends it (4g) or the agent exits (4h), and its checkout lives as long as it runs; *"Its answer is
what the agent printed after the message"*, and *"It reports no usage, and its cost is shown as unknown"*. UC-044 step 6:
such a session *"is listed there too, as running while it lives, its console what its terminal shows, kept as a job's"*.

An agent's interactive mode needs a terminal: it draws its screen with a terminal's control sequences and reads its input
as typed keys. Node's `child_process` gives pipes, not a terminal. What a terminal shows is the screen those control
sequences draw, not the bytes that draw it.

The Bridge's API already carries a message of the prompt bar to a CLI session (`POST /v1/ask` with a product and an
instance commit), a job's console (`GET /v1/jobs/{id}/log`) and the end of an agent's process (`POST /v1/jobs/{id}/cancel`).

## Decision

**The Bridge keeps a conversation's CLI session as one agent process in a pseudo-terminal, started by the conversation's
first message to it and typed into by every message; it keeps the terminal's screen, as text, as the session's log, lists
the session as one of its jobs, and ends it with its checkout when it is cancelled, when its agent exits, or when the
Bridge ends.**

- **One process, started by a message** (UC-049 step 4). The agent is started with its register row's *Session*
  arguments — its interactive mode, in its auto mode —, the conversation's model (*Model* column) and the Bridge's
  setting for that agent's Chrome integration (UC-044 step 3), in the session's checkout of the product made as a job's
  session's is, in its enclosure (ARC-054). A message that names no running session starts one; a message that names one
  is typed into it.
- **A message is typed as one input** (UC-049 step 4, *"typed into that one running agent"*): one bracketed paste
  followed by Enter, the terminals' way to hand a program a text with line breaks as one input.
- **The input is the one the conversation gives a CLI session** (MOD-prompt-bar's `session.md`, after Agent M's
  `AGENTS.md`), with the conversation so far only where the message starts a session — none for the conversation's first
  message or after *Clear conversation* (6d), the conversation so far after 4g, 4h or 5a —, since a running session has
  seen every earlier message (*"nothing of the conversation is sent to it again"*). The token file is named with the
  message that starts the session (`A CLI SESSION IS TOLD NOT TO READ ITS TOKEN FILE`).
- **The console is the terminal's screen as text** (*"what the terminal shows"*). The pseudo-terminal's output is fed to
  a headless terminal emulator in the Bridge's main process, which applies the control sequences. The lines that scroll
  off its screen are the session's log, kept as a job's log is, and the lines on its screen are the log's unended part
  (`THE BRIDGE KEEPS EACH JOB'S LOG FOR SIX WEEKS`); the Bridge's window and the prompt bar read it as they read a job's
  log (`THE BRIDGE'S WINDOW SHOWS EACH JOB'S CONSOLE LIVE`; *Nothing twice*: one log, one reader).
- **The answer is what the agent printed after the message** (UC-049 step 4). The register names, per agent, the line
  its screen shows while it waits for input (*Session* column, data like every other command: `OPEN FOR EXTENSION, CLOSED
  FOR CHANGE`). Once its screen shows it after a typed message, the answer is the text printed between that message and
  that line. The session reports no usage (`NO COST IS GUESSED`).
- **The existing routes carry the session** (*Nothing twice*; `KEEP IT SIMPLE`). `POST /v1/ask` with a product and an
  instance commit, which already carries a message of the prompt bar to a CLI session, also names the running session it
  is typed into and answers with the session's identifier; `GET /v1/ask/{ask}` gives the answer. The session is listed
  under that identifier by `GET /v1/jobs`, of the kind `converse`, `running` while it lives (UC-044 step 6); its console
  is read by `GET /v1/jobs/{id}/log`; *Stop* (5a) and *Clear conversation* (6d) end it with `POST /v1/jobs/{id}/cancel`,
  which ends the agent and every process it started, so that it commits nothing more (`A CANCELLED JOB WRITES NOTHING
  MORE`). It has no job record (`A JOB IS RECORDED IN ITS PRODUCT REPOSITORY`: a conversation held in a browser tab
  leaves none).
- **A session ends with its checkout** (UC-049 4g, 4h, 5a, 6d): cancelled, its agent exited, or the Bridge quit; its
  checkout and token file are removed, its log is kept. A checkout a session left when the Bridge did not see its own end
  — its computer restarted — is removed at the Bridge's next start. A message that names a session the Bridge no longer
  runs is refused as `not-found`; the prompt bar then says how the session ended and sends the message again, starting a
  new session.

### Responsibility within the system

MOD-agent-processes starts an agent in a pseudo-terminal, types into it, keeps its screen as text and gives its answer
(`startSession`). MOD-bridge-jobs holds the running sessions — their checkouts, their logs, their listing, their end — and
answers the ask, jobs and cancel routes of MOD-bridge-http for them, which MOD-bridge-client calls for MOD-prompt-bar.
MOD-bridge-build compiles the pseudo-terminal's native addon for the app's Electron.

### The interface it offers

| Module | Functions other subsystems use |
|---|---|
| MOD-agent-processes | `startSession` |
| MOD-bridge-client | `ask` (its `session` and `onSession`), `bridgeJobLog` (its `partial`) |

## Alternatives

- **One run per message, given the conversation so far.** Each message would start a new agent, which rebuilds its
  context from the conversation it is sent again; UC-049 step 4 asks for one running agent to which nothing of the
  conversation is sent again. Rejected.
- **The agent's own resume — a new process per message that reloads the saved session.** Still one process per message,
  not *"that one running agent"*. Rejected.
- **The agents' JSON or stream output without a terminal.** Not the agent's normal interactive mode, and no terminal
  whose screen is the console (UC-049 step 4). Rejected.
- **Routes of their own for a session — start, type, answer, end.** They would repeat what the ask, log and cancel
  routes already carry (*Nothing twice*). Rejected.
- **The raw output of the pseudo-terminal as the log, drawn by a terminal in the window and in the prompt bar.** Two
  renderers more, and an answer that is a stream of control sequences. Rejected (`KEEP IT SIMPLE`): one emulator in the
  Bridge turns it into text once.
- **The system's `script` program as the terminal.** It exists on macOS and Linux, not on Windows (`THE BRIDGE IS ONE
  FILE PER PLATFORM`). Rejected.
- **`@homebridge/node-pty-prebuilt-multiarch`**, a fork of node-pty with prebuilt binaries. The Bridge's build compiles
  the addon for the app's Electron on each platform's runner either way (MOD-bridge-build), and the fork has about a
  hundredth of node-pty's adoption. Rejected.
- **Stripping control sequences from the raw output (`strip-ansi`).** A screen an agent redraws in place leaves every
  earlier state of it in the text, so the text is not what the terminal shows. Rejected.

## Due diligence

Agent M's own licence is MIT (its `LICENSE` file). Adoption is the package's downloads in the last month the npm registry
reports (2026-10-13 to 2026-11-11). Releases are the registry's versions without a pre-release suffix, with all versions
in brackets.

| Candidate | Licence | Compatible with MIT | First release | Latest release | Releases | Open / closed issues | Adoption | Read from | Read on |
|---|---|---|---|---|---|---|---|---|---|
| node-pty — chosen | MIT | yes | 0.0.1, 2017-01-07 | 1.1.0, 2025-12-22 | 33 (202) | 54 / 490 | 20,302,258 | [1] | 2026-11-12 |
| @homebridge/node-pty-prebuilt-multiarch | MIT | yes | 0.11.0, 2023-10-12 | 0.15.0, 2026-10-29 | 18 (64) | 1 / 35 | 223,598 | [2] | 2026-11-12 |
| @xterm/headless — chosen | MIT | yes | 5.4.0, 2024-03-01 | 6.0.0, 2025-12-22 | 3 (527) | 225 / 2,703 (xterm.js) | 13,173,616 | [3] | 2026-11-12 |
| strip-ansi | MIT | yes | 0.1.0, 2013-12-07 | 7.2.0, 2026-02-26 | 23 (23) | 0 / 26 | 2,537,358,075 | [4] | 2026-11-12 |

No candidate is marked: every licence is MIT.

- [1] https://registry.npmjs.org/node-pty · https://api.npmjs.org/downloads/point/last-month/node-pty ·
  https://api.github.com/search/issues?q=repo:microsoft/node-pty+is:issue+is:open and `+is:closed`
- [2] https://registry.npmjs.org/@homebridge%2Fnode-pty-prebuilt-multiarch ·
  https://api.npmjs.org/downloads/point/last-month/@homebridge/node-pty-prebuilt-multiarch ·
  https://api.github.com/search/issues?q=repo:homebridge/node-pty-prebuilt-multiarch+is:issue+is:open and `+is:closed`
- [3] https://registry.npmjs.org/@xterm%2Fheadless · https://api.npmjs.org/downloads/point/last-month/@xterm/headless ·
  https://api.github.com/search/issues?q=repo:xtermjs/xterm.js+is:issue+is:open and `+is:closed`
- [4] https://registry.npmjs.org/strip-ansi · https://api.npmjs.org/downloads/point/last-month/strip-ansi ·
  https://api.github.com/search/issues?q=repo:chalk/strip-ansi+is:issue+is:open and `+is:closed`

## Consequences

- A conversation's later messages carry the page, the chapters for the page and the person's words, not the
  conversation; the agent answers from the context it kept.
- A session waits idle between messages and holds its checkout, with its token file, until it ends.
- The Bridge carries one native addon, node-pty's, compiled for each platform's Electron by the release build.
- The line each agent shows while it waits for input is the one part of the answer that depends on how the agent draws
  its screen; it is data in the register.
- A session's log holds what its terminal showed — the messages typed into it among it — in the Bridge's data folder,
  for six weeks, as a job's log; it enters no repository.
- A Bridge that ends loses its sessions; the conversation in the tab keeps its messages (UC-049 4g).
