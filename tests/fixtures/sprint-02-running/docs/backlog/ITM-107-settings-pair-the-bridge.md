---
id: ITM-107
title: Pair the bridge on the settings page — download page, pairing, the HTTPS route, agents as participants
kind: implementation
level: 2
realises:
  - THE JUMP HOST AND THE REMOTE SESSIONS ARE SETTINGS
  - THE SHARED PAGES ORIGIN IS DISCLOSED
  - A BROWSER SETTING IS TESTED AND CLEARED WHERE IT IS SHOWN
  - UC-044
  - UC-042
  - UC-011
modules:
  - MOD-settings-store
  - MOD-dashboard-app
depends_on:
  - ITM-067
  - ITM-099
  - ITM-100
  - ITM-080
  - ITM-105
origin: backlog refinement 2026-10-01
---
# ITM-107 Pair the bridge on the settings page — download page, pairing, the HTTPS route, agents as participants

**REGISTER**

## Outcome

UC-044 on the dashboard: *Get the Agent M Bridge* with the file for the system, its size and checksum and the SmartScreen explanation; the Local Network Access prompt explained before the first pairing; the pairing token pasted under the shared-origin notice, *Pair* and its test; each remote session's route (*loopback* or *HTTPS* with the jump host's address and web-server login) and the web-server blocks; each ready agent added as a CLI agent in one click; the bridge's *Test* in the participants view.

## Realises

- `THE JUMP HOST AND THE REMOTE SESSIONS ARE SETTINGS`
- `THE SHARED PAGES ORIGIN IS DISCLOSED`
- `A BROWSER SETTING IS TESTED AND CLEARED WHERE IT IS SHOWN`
- UC-044 — Install and pair the Agent M Bridge
- UC-042 — Manage settings in one place
- UC-011 — Hand a job to a local CLI session

## Where it came from

Backlog refinement of 2026-10-01 (SOFTWARE_MAINTENANCE.md Phase 2) from the accepted architecture — MOD-settings-store, MOD-dashboard-app; UC-044, UC-042.

Architecture decisions its modules follow: ARC-001, ARC-002, ARC-003, ARC-005.

## Modules

- MOD-settings-store (adapters) — uses no other module
- MOD-dashboard-app (shells) — uses MOD-artifacts, MOD-bridge-server, MOD-bridge-tunnel, MOD-ci-generator, MOD-derivation, MOD-git-host, MOD-job-harness, MOD-mail-flow, MOD-mailbox, MOD-participants, MOD-process-model, MOD-pseudonymiser, MOD-review-core, MOD-run-engine, MOD-settings-store, MOD-source-library, MOD-test-records, MOD-traceability, MOD-work-items

The pull request changes only code files and tests that name one of these modules (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).

Files it creates or changes:

- `docs/assets/settings-store.mjs`
- `docs/assets/dashboard/settings/bridge.mjs` (new)
- `docs/assets/dashboard/participants-view.mjs`
- `tests/test_settings_page.py`
- `tests/dashboard-settings-bridge.test.mjs` (new)

## Kind and level

- Job kind: **implementation** — its first commit holds only tests and CI is red on it (`AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST`).
- Level: **2** — needs the Agent M Bridge on a person's computer.

## Tests the SPEC names

- `tests/test_settings_disclosure.py` — `THE SHARED PAGES ORIGIN IS DISCLOSED`
- `tests/test_settings_page.py` — `THE JUMP HOST AND THE REMOTE SESSIONS ARE SETTINGS`; `A BROWSER SETTING IS TESTED AND CLEARED WHERE IT IS SHOWN`

## Acceptance criteria

From the SPEC's checks:

- `THE JUMP HOST AND THE REMOTE SESSIONS ARE SETTINGS` — `tests/test_settings_page.py`
- `THE SHARED PAGES ORIGIN IS DISCLOSED` — `tests/test_settings_disclosure.py`
- `A BROWSER SETTING IS TESTED AND CLEARED WHERE IT IS SHOWN` — `tests/test_settings_page.py`

From the postcondition of UC-044 (Install and pair the Agent M Bridge), for the part this item builds:

> - The bridge runs as an app on this computer, paired with the person's dashboard; nothing was typed in a
>   terminal.
> - Its installed agents are available as participants and use their own login; no key passed through
>   Agent M.
> - If configured, its tunnel to the jump host is open and ends on the jump host's loopback; its private SSH key
>   never left this computer.

From the postcondition of UC-042 (Manage settings in one place), for the part this item builds:

> - The person has seen every setting Agent M uses, where it is kept, and whether it works.
> - Browser settings changed or cleared here are changed or cleared in `localStorage` itself; repository
>   settings changed here are commits under the person's account.
> - No secret was shown in full except on **Show**, written to a repository, or put into a URL; an export
>   holds them only after the notice.

From the postcondition of UC-011 (Hand a job to a local CLI session), for the part this item builds:

> - The artifacts arrived as open; nothing counts as accepted before a person accepts it.
> - The bridge never listened on a non-loopback interface.

Further:

- Every new code file and test names its module, and every test names what it guards and its level (ARC-020).
- Every new test is shown red on a planted fault, recorded with the change (`A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`).
- CI is green on the pull request and the default Definition of Done holds (`THE DEFAULT DEFINITION OF DONE IS THE JOB RULES`).

## Depends on

- ITM-067 — changes settings-store.mjs and tests/test_settings_page.py after it
- ITM-099 — bridge client
- ITM-100 — HTTPS route and web-server blocks
- ITM-080 — adds the bridge's Test and one-click agents to the participants view
- ITM-105 — agents as participants

## Needs a person

No.
