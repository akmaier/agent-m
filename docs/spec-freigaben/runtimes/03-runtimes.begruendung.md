# 6. Runtimes: the Bridge keeps each job's log for six weeks, and its window shows each job's console live

**The change.**
- `THE BRIDGE KEEPS EACH JOB'S LOG FOR SIX WEEKS`, new, after `A LOCAL AGENT USES THE PERSON'S OWN LOGIN`: the Bridge
  keeps everything the agent of each job it took wrote to its output, across its restarts, for six weeks after the job
  last wrote to it and not beyond. Its check is `tests/bridge-jobs-log-cancel.test.mjs`.
- `THE BRIDGE'S WINDOW SHOWS EACH JOB'S CONSOLE LIVE`, new, after it: the Bridge's window shows, for the job chosen among
  those whose logs the Bridge keeps, the last 1000 lines its agent has written to its output, as the agent writes them.
  Its check is `tests/mod-desktop-shell-job-console.test.mjs`.

Every other byte of the section is carried over.

**Why.** akmaier asked on 2026-11-10: "Can we see in the bridge what it does? Would be cool to see the console buffer
through the bridge window in live to see what happens.", and then: "I don't want to see a log growing. I want a
live-console style log. It should have only a limited buffer. Otherwise the idea is good." Asked where the limit
belongs, he decided: "I don't want the logs to be truncated too early. I think they should have a six week buffer." The
limited buffer is therefore the console's, in the window; the log itself is kept whole, for six weeks. No requirement of
the SPEC gives either: `ONE DASHBOARD SHOWS EVERY JOB` gives a link to a job's log on the dashboard, `THE BRIDGE RUNS AS
AN APP` and `THE BRIDGE IS CONFIGURED IN ITS WINDOW OR FROM AN EXPORT` say nothing of a job in the window, and until now
the Bridge held a job's log in memory only, lost at its next start (*Nothing the SPEC already says*). They are two rules,
since each can be broken without the other: a window that shows every line, and a Bridge that forgets a log at its
restart (*One responsibility per file, rule and use case*).

Six weeks outlast a restart, so the log is kept on disk, in the Bridge's data folder, which no agent's enclosure lets the
agent read (ARC-054), readable by its user only — the design of MOD-bridge-jobs, drafted beside this entry. What is kept
is only what the agents wrote to their output; the Bridge writes no request, task, token or key into it, so that `THE
BRIDGE HOLDS THE MAILBOX PASSWORD ONLY FOR ONE REQUEST` ("no file below the bridge's directories and no log line
contains it") keeps holding: the mailbox password never reaches an agent.

**Impact list.**
- `THE BRIDGE KEEPS EACH JOB'S LOG FOR SIX WEEKS` and `THE BRIDGE'S WINDOW SHOWS EACH JOB'S CONSOLE LIVE`, new: no
  artifact names them yet. UC-044 (step 6, *the jobs*, and the two requirements among those it realises),
  MOD-desktop-shell (the view *Jobs*; `job-logs/` in the data folder; `keepJobLogs` at the start), MOD-bridge-jobs
  (`joblogs.mjs`: the logs and the listings kept on disk for six weeks; `keepJobLogs`, `listJobs`, `jobLog`) and
  MOD-site-frame (`look.css`: the console pane, class `console`) are drafted beside this entry.
- `GET /v1/jobs` and `GET /v1/jobs/{id}/log` now also answer for the jobs an earlier start of the Bridge took within the
  six weeks, and the log from any line on, the job's whole output; a job an earlier start left running is listed
  `interrupted`. The protocol of MOD-bridge-http, `{ lines, next, ended }`, is unchanged, and MOD-runtimes'
  `followBridgeLog`, and the dashboard and the prompt bar that read through it, read on as before.
- The log of a job whose task travels with the hand-over (a conversation's task, which the Bridge holds in memory only)
  holds what its agent wrote, its answer among it, on the disk of the Bridge's computer for six weeks. `A CONVERSATION IS
  WRITTEN TO A REPOSITORY ONLY WHEN RECORDING IS ON` speaks of repositories and keeps holding; whether such a job's log is
  to be kept too is akmaier's to decide.
- The checks are tests of level `unit` by the implementer; release tests of the requirements are to be written by a
  participant other than the implementer (`RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER`).

**Origin.** github.com/akmaier, the requests of 2026-11-10 in a conversation with Claude Code, quoted above.
