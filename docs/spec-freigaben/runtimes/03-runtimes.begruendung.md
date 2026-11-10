# 6. Runtimes: the Bridge's window shows each job's console live, holding only its last lines

**The change.**
- `THE BRIDGE'S WINDOW SHOWS EACH JOB'S CONSOLE LIVE`, new, after `A LOCAL AGENT USES THE PERSON'S OWN LOGIN`: the
  Bridge's window shows, for each job the Bridge took since it started, the last 1000 lines its agent has written to its
  output, as the agent writes them. Its check is `tests/mod-desktop-shell-job-console.test.mjs`.

Every other byte of the section is carried over.

**Why.** akmaier asked on 2026-11-10: "Can we see in the bridge what it does? Would be cool to see the console buffer
through the bridge window in live to see what happens.", and then: "I don't want to see a log growing. I want a
live-console style log. It should have only a limited buffer. Otherwise the idea is good." No requirement of the SPEC
gives it: `ONE DASHBOARD SHOWS EVERY JOB` gives a link to a job's log on the dashboard, `THE BRIDGE RUNS AS AN APP` and
`THE BRIDGE IS CONFIGURED IN ITS WINDOW OR FROM AN EXPORT` say nothing of a job in the window (*Nothing the SPEC already
says*).

The limit is part of the rule, since a console that held every line would be the log growing that akmaier does not want;
1000 lines are some screens of an agent's output, enough to see what it does now. The rule names the window, where the
person watches; that the Bridge itself holds no more than these lines — so that the window and `GET /v1/jobs/{id}/log`
read one buffer and a long job does not fill the Bridge's memory — is MOD-bridge-jobs' design, drafted beside this entry,
and no rule of its own (*Nothing twice*).

**Impact list.**
- `THE BRIDGE'S WINDOW SHOWS EACH JOB'S CONSOLE LIVE`, new: no artifact names it yet. UC-044 (step 6, *the jobs*, and the
  requirement among those it realises), MOD-desktop-shell (the view *Jobs*), MOD-bridge-jobs (a job's log holds its last
  1000 lines, counted from the job's first line; `jobLog`, `listJobs`) and MOD-site-frame (`look.css`: the console pane,
  class `console`) are drafted beside this entry.
- Through MOD-bridge-jobs' buffer, `GET /v1/jobs/{id}/log` answers from the same last 1000 lines: its line numbers stay
  those of the job's whole output, so that MOD-runtimes' `followBridgeLog`, and the dashboard and the prompt bar that read
  through it, go on asking from the `next` of their last answer; a reader more than 1000 lines behind receives the lines
  still held. The protocol of MOD-bridge-http, `{ lines, next, ended }`, is unchanged.
- The check is a test of level `unit` by the implementer; a release test of the requirement is to be written by a
  participant other than the implementer (`RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER`).

**Origin.** github.com/akmaier, the request of 2026-11-10 in a conversation with Claude Code, quoted above.
