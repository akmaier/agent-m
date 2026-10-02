---
id: ITM-150
title: The expiry warning offers the paste field for the renewed token — beside Renew, on every page, for the GitHub token and a GitLab project token alike
kind: implementation
level: 1
realises:
  - A TOKEN'S EXPIRY IS WARNED OF IN ADVANCE
  - AN EXPIRED TOKEN IS NAMED AND ITS RENEWAL LINKED
  - THE GITHUB TOKEN IS PASTED, NOT OBTAINED BY LOGIN
  - UC-042
modules:
  - MOD-dashboard-app
depends_on:
  - ITM-130
  - ITM-133
  - ITM-136
origin: release tests of sprint 01 (ITM-141)
---
# ITM-150 The expiry warning offers the paste field for the renewed token — beside Renew, on every page, for the GitHub token and a GitLab project token alike

**REGISTER**

## Outcome

UC-042 1a: "Every dashboard page shows a line *Your GitHub token expires on …* with **Renew**; it opens GitHub's page of
that token, where *Regenerate token* keeps its permissions and repositories, **and the paste field for the new value**";
1b: a refused token's line, "**Renew** as in 1a; for a GitLab project token, the project's *Access tokens* page". Today
the line has the text, *Renew* and a sentence that names where to paste ("Then paste it under Settings → GitHub token →
Change."), but no field. Path: `dashboard-app.mjs` `route` (and `showBanner`) → `dashboard/settings-view.mjs`
`tokenBannerHtml` → `expiryWarning` or `tokenRefusal` → the text, `Renew ↗` to `renewUrl`, and `RENEW_TEXT` /
`GITLAB_RENEW_TEXT` of `git-host.mjs`. Ist: no field, no control that opens one; Soll: the line carries the paste field
for the new value with its expiry date — the same two inputs, checks and store call as *Change* on the settings page
(`wireSettings`: the token's form, `store.setToken(v, exp)`; for a GitLab project token the project's form,
`store.setGitLabToken(address, token, expires)`) — and *Store*; storing clears the kept test state as *Change* does and
the line disappears when the new date is beyond fourteen days. The sentence that names the settings page goes, since the
field is now where the sentence pointed.

## Realises

- `A TOKEN'S EXPIRY IS WARNED OF IN ADVANCE` — the warning carries what the person does about it
- `AN EXPIRED TOKEN IS NAMED AND ITS RENEWAL LINKED` — "only the new value has to be pasted" (the rule's occasion): here
- `THE GITHUB TOKEN IS PASTED, NOT OBTAINED BY LOGIN`
- UC-042 — Manage settings in one place (1a, 1b)

## Where it came from

Release tests of the sprint 01 increment (ITM-141, pull request #48 into `sprint/02`): finding **R3** of
`docs/measurements/2026-10-01_release-tests-sprint-01.md`, case 41 — marked `{ todo }` in
`tests/release-sprint-01-dashboard-app.test.mjs` ("FINDING R3"). ITM-123's characterisation of 1a asserts the text and
*Renew* and did not pin the field; no backlog item named it (ITM-136 keeps the line's state across reloads; ITM-098 is
the instance section).

Architecture decisions its modules follow: ARC-001, ARC-002, ARC-003, ARC-005.

## Modules

- MOD-dashboard-app (shells) — uses MOD-artifacts, MOD-bridge-server, MOD-bridge-tunnel, MOD-ci-generator, MOD-derivation, MOD-git-host, MOD-job-harness, MOD-mail-flow, MOD-mailbox, MOD-participants, MOD-process-model, MOD-pseudonymiser, MOD-review-core, MOD-run-engine, MOD-settings-store, MOD-source-library, MOD-test-records, MOD-traceability, MOD-work-items

The pull request changes only code files and tests that name one of these modules
(`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`). MOD-settings-store is not among them: the two store calls exist.
MOD-git-host is not among them: `tokenIdentity`, `RENEW_TEXT` and `GITLAB_RENEW_TEXT` stay (the settings page's
`tokenRefusal` text still reads them; whether their last sentence is reworded is MOD-git-host's and not this item's).

Files it creates or changes:

- `docs/assets/dashboard/settings-view.mjs` (`tokenBannerHtml` carries the field, the date and *Store*; a wire function
  for the line — the checks and the store call of the *Change* form's handler in `wireSettings`, shared, not copied)
- `docs/assets/dashboard-app.mjs` (`route` and `showBanner` wire the line after rendering it; the banner slot
  `#token-banner` lies outside `<main>`)
- `tests/dashboard-token-banner-paste.test.mjs` (new — run in `tests/app-harness.mjs`)
- `tests/release-sprint-01-dashboard-app.test.mjs` (case "release · UC-042 1a: the expiry line offers the paste field
  for the renewed value" loses its `{ todo }` mark and becomes an ordinary test; nothing else in the file)

## Kind and level

- Job kind: **implementation** — its first commit holds only tests and CI is red on it
  (`AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST`).
- Level: **1** — browser and hosted CI; nothing installed.

## Tests the SPEC names

- `tests/test_settings_page.py` — `A TOKEN'S EXPIRY IS WARNED OF IN ADVANCE` (`test_the_banner_on_every_page_carries_renew`
  gains the field)
- `tests/review-core.test.mjs` — `AN EXPIRED TOKEN IS NAMED AND ITS RENEWAL LINKED` (the adapter's half, in
  `tests/review-core.d/git-host.test.mjs`; exists, not changed)

## Acceptance criteria

From the postcondition of UC-042 (Manage settings in one place), for the part this item builds:

> - Browser settings changed or cleared here are changed or cleared in `localStorage` itself; repository
>   settings changed here are commits under the person's account.

Further:

- With a GitHub token that expires within fourteen days, every page's warning line has *Renew* and a paste field with
  an expiry date; a new value stored there is in `localStorage` with its date, the kept test state is reset, and the
  line is gone on the next page when the date is beyond fourteen days (release case 41). Counter-proofs: a token that
  expires later shows no line (`tests/test_settings_page.py`, "far from expiry, no banner" — holds); a value that is not
  a token is refused with the *Change* form's sentence and nothing is stored.
- The refused token's line (1b) carries the same field; for a GitLab product's refused or expiring project token the
  field stores that project's token and date, and *Renew* keeps the project's *Access tokens* page.
- No token value appears in a URL or leaves the page before *Store* (`A CREDENTIAL IS NEVER PLACED IN A URL`).
- Every new code file and test names its module, and every test names what it guards and its level (ARC-020).
- Every new test is shown red on a planted fault, recorded with the change (`A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`).
- CI is green on the pull request and the default Definition of Done holds (`THE DEFAULT DEFINITION OF DONE IS THE JOB RULES`).

## Depends on

- ITM-130 — changes `docs/assets/dashboard-app.mjs` and `docs/assets/dashboard/settings-view.mjs` first (sprint 02, strand A)
- ITM-133 — changes `docs/assets/dashboard-app.mjs` first (sprint 02, strand A)
- ITM-136 — the last change to both files in sprint 02: the token's test state moves from memory into the store, and the
  reset this item makes on *Store* goes to where ITM-136 keeps it

## Needs a person

No.

## Callers and the tests that assert what changes (checked at filing, 2026-10-01)

`tokenBannerHtml` is called in `dashboard-app.mjs` twice (`route`, `showBanner`) and in the tests below; its arguments do
not change. The line's markup is asserted in `tests/dashboard-review-flows.test.mjs` ("UC-042 1a", "UC-042 1b": the
`<strong>` text, the *Renew* anchor and "Regenerate token", by `includes`), `tests/test_settings_page.py`
(`test_the_banner_on_every_page_carries_renew`, by `assertIn`, with the empty banner as counter-proof) and
`tests/review-core.d/git-host.test.mjs` (the GitLab banner names the project token and its *Access tokens* page) — all
MOD-dashboard-app or MOD-git-host test files that match by content, none asserts the absence of a field; they hold when
the field is added beside what they quote and change only if that markup changes. The release test file lies on
`sprint/02` until that sprint is merged; this item starts from a `main` that holds it.
