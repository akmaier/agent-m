---
id: ARC-055
title: A conversation keeps its CLI session running in a terminal of the Bridge
refines: ARC-040
forced_by:
  - THE BRIDGE'S WINDOW SHOWS EACH JOB'S CONSOLE LIVE
  - THE BRIDGE KEEPS EACH JOB'S LOG FOR SIX WEEKS
  - A CANCELLED JOB WRITES NOTHING MORE
  - NO COST IS GUESSED
  - ONE DASHBOARD SHOWS EVERY JOB
  - A JOB IS RECORDED IN ITS PRODUCT REPOSITORY
  - A LOCAL AGENT USES THE PERSON'S OWN LOGIN
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
  - MOD-desktop-shell
---
# ARC-055 A conversation keeps its CLI session running in a terminal of the Bridge

## Context

A message of the prompt bar to a CLI session — Claude Code, Codex or opencode on a Bridge (UC-049 step 4) — has so far
started the agent once per message, without a conversation, given the conversation so far, and ended it with its
answer. Every message therefore sent the whole conversation again, and the agent rebuilt its context from it each time,
paying for that in tokens. The person decided: *"I actually don't want the sessions to end with the command. Otherwise,
this will burn a lot of tokens. I want to keep them running without losing their contexts."* and *"We want to be able to
read what the model is doing on the console buffer. json is not suited for this."*

Each of the three agents has a normal interactive mode, which keeps its context while it waits for the next input, and
an auto mode, in which it acts without asking for each tool: Claude Code's `--permission-mode auto`, Codex's
`--approve-for-me`, opencode's `--auto` (their `--help`, read on 2026-11-12: Claude Code 2.1.322, codex-cli 0.166.0,
opencode 2.2.5). An interactive mode needs a terminal: the agent draws its screen with a terminal's control sequences and
reads its input as typed keys. Node offers no terminal of its own: `child_process` gives pipes, on which these agents do
not start interactively.

A job handed to a Bridge (UC-011) has a record, a task and an end; no person types a second message into it.

## Decision

**The first message of a prompt-bar conversation with a CLI session starts the agent, interactive and in auto mode, in a
pseudo-terminal the Bridge keeps open; every message of that conversation, the first among them, is typed into that one
process; the Bridge keeps what the terminal shows as the session's console, and ends the session only when the person
stops it or clears the conversation, when the agent exits, or when the Bridge ends.** A job stays one run per job.

- **One process per conversation** (the person's decision; `KEEP IT SIMPLE`: the agent keeps its own context, nothing
  Agent M rebuilds). The agent is started as its register row's *Session* column says, with the conversation's model
  (Model column) and the other options every start of that agent on the Bridge gets (MOD-agent-processes), in the
  session's checkout of the product (MOD-bridge-jobs), in its enclosure (ARC-054), as every process of an agent the
  Bridge starts.
- **No special first message** (*No special first case*). Starting the session and typing a message are two requests:
  the session is started with no input, and each message, the first as every later one, is typed into it with the same
  text, `session.md` (MOD-prompt-bar), which begins with the path of Agent M's `AGENTS.md` in the session's checkout of
  the instance (`EVERY MODEL READS AGENT M'S AGENTS.MD FIRST`, for a participant that works in a checkout of the
  instance) and gives the page, the chapters for the page as their paths there, the messages the session has not seen,
  and the person's message. A running session has seen every earlier message, so that place is empty and nothing is
  sent again; a session started after one was lost (UC-049 4g) is given the conversation so far there.
- **A message is typed as one bracketed paste followed by Enter** — the terminals' standard way to hand a program a
  text with line breaks as one input, which all three agents read; no command line, no file.
- **The console is the terminal's text.** The pseudo-terminal's output is fed to a headless terminal emulator in the
  Bridge's main process, which keeps the screen and its scrollback as text lines, the control sequences applied. Those
  lines are the session's log, kept as a job's log is (`THE BRIDGE KEEPS EACH JOB'S LOG FOR SIX WEEKS`), read through
  the same `jobLog` and `GET /v1/jobs/{id}/log` (*Nothing twice*: one log, one reader); the lines the screen shows below
  the scrollback are its unended part. The Bridge's window and the prompt bar show that log live, as text, with no
  terminal of their own (`KEEP IT SIMPLE`). No JSON output is asked of the agent.
- **The answer is what the agent printed after the message.** The register names, per agent, the sign its screen shows
  while it waits for input (*Session* column, data like every other command, so that a changed CLI is a changed row:
  `OPEN FOR EXTENSION, CLOSED FOR CHANGE`). Once the screen shows it after a typed message, the answer is the text of the
  lines between the typed message and that sign. An interactive agent reports no usage there: the session's cost is
  unknown (`NO COST IS GUESSED`).
- **A session is listed as a job of its Bridge**, of the kind `converse`, under its own identifier, `running` while it
  lives, then `done` (cleared, or exited with 0), `cancelled` (stopped, or the Bridge quit), `failed` (exited otherwise)
  or `interrupted` (an earlier start of the Bridge) — the states `listJobs` already gives —, so that the window's *Jobs*
  view shows its console and *Quit* and *Install and restart* name it (*Nothing twice*: no second list, no second
  console). It has no job record: a conversation held in a browser tab leaves none (`A JOB IS RECORDED IN ITS PRODUCT
  REPOSITORY`). In the job dashboard it is the tab's conversation (MOD-prompt-bar's `currentJob`), running while its
  session lives (`ONE DASHBOARD SHOWS EVERY JOB`).
- **Its checkout lives as long as the session**, and is removed with its token file when the session ends; a checkout an
  earlier start of the Bridge left is removed at the next start.
- **Stop ends the process** — the agent and every process it started, as a cancel does (`stopTree`) —, so that the
  session commits nothing more (`A CANCELLED JOB WRITES NOTHING MORE`).
- **A job stays one run per job** (`YOU AREN'T GONNA NEED IT`): a job's task is given once and its end is recorded with
  its last commit (UC-011 step 5); a process kept open after it would wait for a message nobody types.

### Responsibility within the system

MOD-agent-processes starts an agent in a pseudo-terminal, types into it, keeps its screen as text and says when it
waits (`startSession`). MOD-bridge-jobs holds the sessions of the prompt bar — their checkouts, their logs, their
answers — and answers the session routes of MOD-bridge-http, which MOD-bridge-client calls for MOD-prompt-bar.
MOD-desktop-shell shows the sessions' consoles in its *Jobs* view, as it shows a job's.

### The interface it offers

| Module | Functions other subsystems use |
|---|---|
| MOD-agent-processes | `startSession` |
| MOD-bridge-client | `startSession`, `typeIntoSession`, `sessionAnswer`, `endSession` |

## Alternatives

- **One run per message with the conversation so far, as before.** Rejected by the person: it sends the conversation
  again with every message and pays for the context each time.
- **The agent's own resume — `claude --resume`, `codex resume`, `opencode --session` — once per message.** Each message
  starts a process again and the agent reloads its saved history, which is read again as input; the person wants the
  process kept running. Rejected.
- **The agents' JSON or stream output** (`claude -p --output-format stream-json`, `codex exec --json`, `opencode run
  --format json`). Rejected by the person: the console buffer is to be read as the agent shows it.
- **The raw output of the pseudo-terminal as the log, drawn by a terminal in the window and in the prompt bar.** Two
  renderers more, and an answer that is a stream of control sequences. Rejected (`KEEP IT SIMPLE`): one emulator in the
  Bridge turns it into text once.
- **The system's `script` program as the terminal.** It exists on macOS and Linux, not on Windows (`THE BRIDGE IS ONE
  FILE PER PLATFORM`). Rejected.
- **`@homebridge/node-pty-prebuilt-multiarch`**, a fork of node-pty shipping prebuilt binaries. The Bridge's build
  rebuilds native modules for its Electron anyway (ARC-050); the fork follows node-pty with a hundredth of its adoption.
  Rejected.
- **Stripping control sequences from the raw output (`strip-ansi`).** A screen an agent redraws in place leaves every
  earlier state of it in the text. Rejected.
- **Ending a session after a time without a message.** It would lose the context the person wants kept. Rejected.

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

- A conversation's later messages carry only the page, the chapters' paths and the person's words; the agent answers
  from the context it kept.
- A session waits, idle, between messages; it uses no model while it waits. It holds its checkout, with its token file,
  until it ends.
- The Bridge carries a native module, node-pty, built for each platform's Electron by the release build (MOD-bridge-build).
- The sign each agent shows while it waits for input is the one part of the answer that depends on how an agent draws
  its screen; it is data in the register and is tested against each agent's recorded screen.
- A session's log holds what its terminal showed — the messages typed into it among it —, in the Bridge's data folder,
  for six weeks, as a job's log; it enters no repository.
- A Bridge that restarts loses its sessions; the conversation in the tab does not lose its messages (UC-049 4g).
