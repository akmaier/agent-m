---
id: ITM-157
title: The dashboard renders no image from a host the page does not name — a product artifact's image loads from the git hosts only
kind: implementation
level: 1
realises:
  - NO SERVER
  - UC-008
modules:
  - MOD-dashboard-app
depends_on:
  - ITM-162
origin: sprint 02 review input (ITM-050's measurement record)
---
# ITM-157 The dashboard renders no image from a host the page does not name — a product artifact's image loads from the git hosts only

**REGISTER**

## Outcome

`NO SERVER`'s check: "the built site contains no call to an origin other than the configured endpoints, the repository
servers of the instance and its products, … and the package registries and resource hosts the page names before it calls
them." The dashboard renders every Markdown artifact with `DOMPurify.sanitize(marked.parse(text))` (`md` in
`docs/assets/dashboard-app.mjs`, no options); DOMPurify's defaults keep `img` and admit `https:` addresses, so a product's
use case with `![](https://other.host/x.png)` makes the viewer's browser call that host when the page shows it — a call the
page names nowhere, to a host the product's author chose, carrying the viewer's address (ITM-050's record,
`docs/measurements/2026-10-01_product-rules-repository-checks.md`, *Observed, not decided here*). `test_no_backend` checks
the Markdown this repository serves, not a product's. Soll: `md` lets an image through only when its address is one of the
hosts the page already calls for that product — its git host (the raw host of GitHub, the product's GitLab server) — or a
`data:` address; every other `img` is dropped, and in its place the page shows the address as text, so that nothing is
hidden from the reviewer (a DOMPurify hook on `uponSanitizeAttribute`, or `ALLOWED_URI_REGEXP` per product). Mermaid
diagrams are unaffected (`ARTIFACTS ARE MARKDOWN`).

## Realises

- `NO SERVER` — the page calls no origin it does not name, for a product's artifacts as for its own
- UC-008 — Review and accept a use case (step 2: the dashboard renders its text and diagram)

## Where it came from

Sprint 02 review input: ITM-050's record (developer-opus-d, 2026-10-01) read the vendored DOMPurify and left the reading of
`NO SERVER` open; the Scrum Master raised it at the gate decisions of 2026-10-02. The Product Owner's reading: the check's
own words settle it — a call to a host the page does not name is what the check forbids —, and the behaviour this item
builds is safe under either reading. Not a release-test finding; no mark in any test.

Architecture decisions its modules follow: ARC-001, ARC-003, ARC-005.

## Modules

- MOD-dashboard-app (shells) — uses MOD-artifacts, MOD-bridge-server, MOD-bridge-tunnel, MOD-ci-generator, MOD-derivation, MOD-git-host, MOD-job-harness, MOD-mail-flow, MOD-mailbox, MOD-participants, MOD-process-model, MOD-pseudonymiser, MOD-review-core, MOD-run-engine, MOD-settings-store, MOD-source-library, MOD-test-records, MOD-traceability, MOD-work-items

The pull request changes only code files and tests that name one of these modules (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).

Files it creates or changes:

- `docs/assets/dashboard-app.mjs` (`md` takes the product's hosts; the hook)
- `tests/dashboard-markdown-images.test.mjs` (new — run in `tests/app-harness.mjs`: a use case with three images — the product's raw host, a `data:` address, a foreign host — rendered; the first two are `img`, the third is text; no request to the foreign host)

## Kind and level

- Job kind: **implementation** — its first commit holds only tests and CI is red on it (`AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST`).
- Level: **1** — browser and hosted CI; nothing installed.

## Tests the SPEC names

- `tests/test_no_backend.py` — `NO SERVER` (exists; checks the repository's own Markdown and the page's origins, not a product's artifact — the app-harness test above is this item's check)

## Acceptance criteria

From the postcondition of UC-008 (Review and accept a use case), for the part this item builds:

> - An approval record names the file and the SHA of the accepted text; the commit names who and
>   when.

Further:

- A product's use case with an image on a foreign host is rendered without an `img` for it, the address shown as text, and the harness sees no request to that host; an image on the product's raw host or GitLab server, or a `data:` image, is rendered as `img`; the Mermaid block of the same file is rendered as today.
- The instance's own files are rendered as today (every app-harness check unchanged).
- Every new test is shown red on a planted fault, recorded with the change (`A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`).
- CI is green on the pull request and the default Definition of Done holds (`THE DEFAULT DEFINITION OF DONE IS THE JOB RULES`).

## Depends on

- ITM-162 — changes `docs/assets/dashboard-app.mjs` before this item (sprint 03, strand B; added at the sprint 03 planning:
  both change the shell, the bar first)

## Needs a person

No. Should `akmaier` read `NO SERVER` as not reaching a product's images, the item is withdrawn, not widened.
