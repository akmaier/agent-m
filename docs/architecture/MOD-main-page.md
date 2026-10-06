---
id: MOD-main-page
title: The main page and every job of the instance
folder: src/main-page/
realises:
follows:
  - ARC-038
uses:
  - MOD-site-frame.View
  - MOD-site-frame.chosenProduct
  - MOD-site-frame.instanceOf
  - MOD-site-frame.explain
  - MOD-site-frame.notice
  - MOD-site-frame.confirmDecision
  - MOD-browser-store.readSetting
  - MOD-bridge-client.bridgeAt
  - MOD-repository-hosts.parseAddress
  - MOD-repository-hosts.connect
  - MOD-repository-hosts.readSnapshot
  - MOD-repository-hosts.webLinks
  - MOD-progress-measures.productFacts
  - MOD-progress-measures.stageShares
  - MOD-progress-measures.currentStage
  - MOD-progress-measures.buildInProgress
  - MOD-progress-measures.waitingForAPerson
  - MOD-product-process.mayDecide
  - MOD-product-process.recordGateDecision
  - MOD-job-ledger.listJobs
  - MOD-job-ledger.jobState
  - MOD-job-ledger.jobCost
  - MOD-runtimes.routesFor
  - MOD-runtimes.liveState
  - MOD-runtimes.jobLog
  - MOD-runtimes.cancelJob
  - MOD-runtimes.retryJob
provides:
  - view
---
# MOD-main-page The main page and every job of the instance

## Responsibility

It belongs to the Site (ARC-038). Its one responsibility is the page at the root of the instance's Pages address: what
goes on in the instance — each product's progress as a bar of six stages, or Agent M's own while the browser manages no
product, the build as it happens, what waits for a person — and every job of every product, with its detail and the
decisions a person takes on a job. It serves UC-046 and UC-036, and opens at its list of what waits for a notification of
UC-047.

It shows only what the services derive; it computes no share and no state of its own (`PROGRESS AND JOB STATE ARE
DERIVED, NOT STORED`). It runs no job in the tab, so it hands the frame no strategies: retrying a job that ran in a tab
opens the view that runs its kind, with the job's inputs.

It runs in a browser, loaded by `index.html` through MOD-site-frame.

## Parts

- `index.mjs` — the interface: `view`.
- `cards.mjs` — the greeting, a card per product or Agent M's own card, its stage bar and its build.
- `waits.mjs` — what waits for a person.
- `jobs.mjs` — the list of every job and a job's detail.

## Data

It keeps nothing but the screen. It builds a handle for each Bridge this browser keeps from its settings, so that the
live states, logs and cancels of jobs on Bridges reach them. While the page is open it reads the jobs' states again at
an interval the repository servers' rate limits allow, so the build stays current; it stores nothing between readings.

## Interfaces

- `view: View` — the routes of the main page, `{ routes, strategies: [] }`:
  - `home` — the greeting with its folded explanation; one card per product this browser keeps, each with its name, its
    process model, its bar of six stages each filled by its share, the stage it is in marked, a click on a stage leading
    to that stage's page under `docs/` for the product, and its build — the steps or items in progress, each with the job
    working on it, its participant, state and elapsed time; without a product, Agent M's own card from the instance
    repository and *+ Add product*; a card whose repository cannot be read says which and links the token's setting;
    below the cards, what waits for a person across the instance, each item linked to the page where it is decided. With
    `params.at` set to `waits`, the page opens at that list — the address a notification of more than three files that
    have come to wait carries (MOD-notifications).
  - `jobs` — every job of every product and of the instance in one list, waiting at a gate first, filtered by product,
    state, participant or runtime; each row with identifier, product, what it works on, kind, participant, where it
    runs, state, elapsed time and cost where known; a source that cannot be reached is named with its reason.
  - `job` (`params.id`) — one job: its inputs, its commits and pull request, its CI runs, its log while it runs, its
    cost — or *unknown* (`NO COST IS GUESSED`); *Cancel* for a queued, running or waiting job, whose end, cancelled,
    MOD-runtimes' `cancelJob` appends once its runtime confirms; *Retry* for a failed, cancelled or ended job,
    as a new job, with the same participant or another holder of its role on a route offered for it; for a job waiting
    at a gate, the gate — what it checks, what to examine, who decides — and, for a person who may decide it, *Pass gate*
    and *Reject* with a reason. *Pass gate* stays unavailable, with the role and its holders named, for a person who does
    not hold the deciding role or did the work the gate checks (`A GATE IS NOT DECIDED BY THE PARTICIPANT WHOSE WORK IT
    CHECKS`). The decision is recorded with `recordGateDecision` under the person's account; the job's route resumes or
    ends the job when it notices the record (ARC-037).

## Files

It writes, on a person's click: a gate record, through `recordGateDecision`; through `cancelJob`, the end of a cancelled
job in its record under `docs/jobs/`. It reads each product's repository and the
instance repository through their hosts, and the browser's store for the products, tokens and Bridges it keeps.

## Uses

- MOD-site-frame.View — the interface it provides; MOD-site-frame.chosenProduct, MOD-site-frame.instanceOf — the
  product chosen and the instance; MOD-site-frame.explain — the folded explanations of the page, its states and runtimes;
  MOD-site-frame.notice — a refused token, a used-up rate limit, a source not reached; MOD-site-frame.confirmDecision —
  cancel, retry and a gate's decision.
- MOD-browser-store.readSetting — the products this browser keeps, their tokens, the Bridges' settings.
- MOD-bridge-client.bridgeAt — a handle for each Bridge this browser keeps.
- MOD-repository-hosts.parseAddress, MOD-repository-hosts.connect — each product's host;
  MOD-repository-hosts.readSnapshot — the job records of every product, for the list of jobs;
  MOD-repository-hosts.webLinks — a token's
  setting and a run's page.
- MOD-progress-measures.productFacts, MOD-progress-measures.stageShares, MOD-progress-measures.currentStage,
  MOD-progress-measures.buildInProgress, MOD-progress-measures.waitingForAPerson — the cards, the workflow and gate
  states of a product, and what waits.
- MOD-product-process.mayDecide — whether this person may decide the gate a job waits at;
  MOD-product-process.recordGateDecision — the decision.
- MOD-job-ledger.listJobs, MOD-job-ledger.jobState, MOD-job-ledger.jobCost — the jobs, their states and costs;
- MOD-runtimes.routesFor — the routes a retry may take, for the product's resource needs in its facts;
  MOD-runtimes.liveState, MOD-runtimes.jobLog,
  MOD-runtimes.cancelJob, MOD-runtimes.retryJob — live states, logs, cancel and retry at each job's route, the Bridges
  handed in.
