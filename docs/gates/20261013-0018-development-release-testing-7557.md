---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 057b94ecbf6ac96e1a84832b1ff4e2980dfcd740
  - https://github.com/akmaier/agent-m/pull/480
date: 2026-10-13 00:18 UTC
---
# Development → Release testing: ITM-363, change a use case by prompt on the review pages, without Refine

**REGISTER**

## Reason

ITM-363, pull request #480 by developer-sonnet-d into `sprint/team1/26`, head `057b94e`. Two tests-only commits,
`f6b1c6d` and `2896e7b`, each red; `057b94e` green (run 38325654961, its second attempt). The code changes only
`src/review-pages/` — `prompt.mjs`, `jobs.mjs`, `flow.mjs`, `kinds.mjs` —, and the new test names
MOD-review-pages and its guards, with UC-019's own data. 27 faults are recorded: 26 killed, 1 equivalent (the editor
opened on the draft, which `showDraft` replaces at once). The editor is used only through `openEditor`.

The Acceptance holds but for *Refine*, which is not built and not tested. MOD-job-runner's `runJob` takes `refine`, but
MOD-review-pages' Uses name `runOnTab` and not `runJob`, and MOD-runtimes' file gives `runOnTab` the hooks `host`,
`record`, `onOutput` and `signal`, and no `refine`. No text lets the page build *Refine*, so a rejection could not
be reworked on that condition. The item passes with *Refine* unfinished, and the page offers no dead button. Building it
needs akmaier's change of MOD-runtimes' or MOD-review-pages' file; the item for it follows that change, and the
review names it.

The Bridge, checked against ITM-325 as at #473: the page queues a job on a Bridge's route with `queueJob` without
`bridge`, which MOD-runtimes' file allows ("a Bridge takes the job when it next reads the repository"), and says that
it is queued. That holds the Outcome's "a job … of an agent on a Bridge is queued on its route". What still fails by name
is an endpoint reached through a Bridge on the tab's route: the shared start hands `runOnTab` no `bridges`, and reads
the stored `throughBridge`. This is unchanged since #473, and not part of this item.

Noted for the sprint, beyond this item: the node job ran 1m56 of its two minutes, and its first two attempts were stopped
by the limit. `A PULL REQUEST'S CI RUNS WITHIN TWO MINUTES` is close to failing, and a stopped run makes check 2 fail for
every item. A change of `.github/workflows/tests.yml`, splitting the node tests across parallel jobs, should come first
in this sprint, before the next code is pushed. Whether it is one of the kinds `WHAT NO MODULE OWNS IS CHANGED BETWEEN
JOBS` names is open. The nearest is "adds or changes a workflow file that only runs an entry that a module's file names",
and the test run `node --test tests/*.test.mjs` is no module's entry as far as I read. If it is none of the kinds, it is
for akmaier.
