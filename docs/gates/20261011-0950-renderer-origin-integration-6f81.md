---
gate: Independent integration decision before merge into sprint/team2/20
job: JOB-20261011-0947-6f81
decider: po-sol
role: Product Owner
decision: passed
on:
  - d84af17067abf895412a28d158c99ee2559baf24
  - https://github.com/akmaier/agent-m/pull/336
date: 2026-10-11 09:50 UTC
---
# PASS: the bounded renderer-origin repository check

**REGISTER**

po-sol, gpt-6.1-sol, implemented none of this check. Taken was recorded at
2026-10-11T09:48:26Z after reading the published review Start. This decision approves only PR336
head `d84af17067abf895412a28d158c99ee2559baf24` into
`0c3bfda0ff93f9306fbff3f2576f83b585cc2bcd` on `sprint/team2/20`, under integration
Start JOB-20261011-0929-d802 and its Taken. It does not decide ITM-342's Source gate.
The complete bytes of this document are the PR comment body for publication.

## Applicable rule and scope

SPEC.md:1405–1414, WHAT NO MODULE OWNS IS CHANGED BETWEEN JOBS, permits a separate PR that
“lets a check of the whole repository allow a module what the module's file states that it uses”.
The diff changes only `tests/test_no_backend.py`, whose header has no module. Accepted
MOD-markdown-render's Parts and Files declare its lazy diagram library and vendored folder;
ARC-049 declares the locally served library. This is the permitted repository-check adaptation,
not an implementation or refactoring job. No existing asserted expected result or forbidden-channel
scanner changes. The legacy vendor rules retain their exact counts and reasons through one shared
declaration (DRY); the existing evidence-callback convention supplies the narrow new allowance (KISS).

## Concrete data flow and verification

The exact renderer input is `55acb4f7ce85eaedac63df74acab4389b099ed69`:
`src/markdown-render/mermaid.mjs:47` creates a script → line 49 assigns
`new URL("./vendor/mermaid.min.js", import.meta.url).href` directly to its `src` → line 52 appends
that script. This resolves the declared vendor resource beside the module. The old check finds this
loading element but has no allowance for its path; the new check's
`tests/test_no_backend.py:118` evidence callback checks the actual fixed assignment and script form →
line 195 registers only that file's one loading element → `channel_findings` at lines 239–258 still
checks every channel's evidence and count. It does not exempt the module folder from scanning.

At lines 457–472, the new positive fixture accepts that loader and the bounded vendor channels;
the same loader in `extra.mjs` remains a finding. Changing its vendor URL to the foreign fixture
produces both the failed loader evidence and the URL finding. Existing unknown-channel,
foreign-host, missing-evidence, repeated-worker and Markdown-resource counter-proofs remain unchanged.
The static callback also rejects an indirect `src` assignment because it lacks the required fixed
assignment. These are bounded source-pattern checks, not a claim to prove every possible program safe.

The module vendor and legacy vendor at renderer head 55ac have the identical Git blob
`512acf32d3ec12f4cafe8e8d81b6d742890999b9`. The vendor README records Mermaid 12.0.0, its MIT licence,
unchanged legacy provenance and SHA-256 `28fca7ae6ebc7ed7bb63bde63136a74bfef14f296a57e403657eeb8b32836073`.
Lines 170–175 and 206–207 reuse only the three legacy inert-channel allowances at their two exact paths.
The existing whole-own-code prohibition on `workerUrl` remains; lines 299–310 verify non-vacuous
untrusted KaTeX calls in each present Mermaid copy. The baseline has no new vendor yet: `_present`
checks exact-file counts only when that file exists, so this PR does not require undelivered source.
The refreshed ITM-342 source run must exercise the delivered copy under this check.

## Original evidence reviewed

Personally read originals include AGENTS, SPEC, declared process and pinned model, Team 2 roles,
Sprint 20, integration/review Starts and Taken, accepted MOD-markdown-render and ARC-049, chapter 13,
the complete old/new check and exact diff, and the exact renderer loader and vendor provenance.
Unchanged binding/accepted identities were verified: AGENTS `588b5bd0379b44dd74007d4ebef1ceeb5d270a5c`,
SPEC `c2edff646acffef16e676327ecf7fdee86274c15`, module
`3f5c0f583d880090f51248084c245009bd0ec2bf`, ARC-049
`a96dd8b845e01fc35c54a049bd798691dce2ae92`.

Live PR metadata independently confirms the exact open head/base and both successful checks in
[CI38129311601](https://github.com/akmaier/agent-m/actions/runs/38129311601).
Both original checkout records name merge ref `7977f5f01520a814821992410463a8e3b4f05b66`, merging that
head into that base. Reviewed raw evidence includes runner/checkout records, all 16 NoServer results
at lines 8050–8065, and final Node/Python results: Node 1,199 passed, zero failures, eight existing TODOs;
Python 441 tests, successful with five skips and five expected failures. Metadata records successful
Ubuntu jobs of 80 and 82 seconds; the unchanged workflow sets each timeout to two minutes.
No local runtime was executed.

The complete unmodified raw artifact remains `/private/tmp/agent-m-renderer-origin-pass-full.log`
(8,274 lines), SHA-256 `1b8df18b60eaf91aad6207522777b8d12b20b0943c2219051effe695a7b0c64f`;
metadata remains `/private/tmp/agent-m-renderer-origin-pass-metadata.json`, SHA-256
`4a3291dc68d2f59a2c1a34066e398307b800be8204e29a464634f3d90bdf30fc`.
The raw portions reviewed above support this gate; no claim is made to have personally read every
unrelated log line. Usage and cost are null when unreported.

Root publishes this gate/comment, verifies the pins again and performs the approved merge. A's
implementation receives the approved sprint base and its own fresh CI before its separate Source decision.
