# The gaps of UC-036 to UC-049: the proposals not yet registered

**MEASUREMENT** — 2026-10-18, `main` at `ee5d1364`, re-read at `b0b9cdae`. Method: for each use case, each step and extension compared with the
accepted module texts and with `src/` and `tests/` on `main`, each found gap written as an item, each quote checked against
the current blob, and each module checked with MOD-work-plans' `conflicts` against team 1's sprints. Registered from it:
ITM-959 to ITM-994 (ITM-994 in place of ITM-958, which team 1 registered at the same time). ITM-960 is registered and
waits: its interface is not fixed by an accepted text (see the item). The rest stand here.

The proposals of the gap analysis of UC-036 to UC-049 that are not registered as items yet, verified on `main` at `b0b9cdae`.
Item numbers are `ITM-<nnn>` (MOD-identifiers.md:54; `src/identifiers/scheme.mjs:24`), and ITM-959 to ITM-994 are taken
by this registration. ITM-995 to ITM-999 are left for team 1. The rest wait until akmaier decides whether an item number
may have more digits.

- A **READY** proposal rests on accepted texts and is registered as soon as a number is free.
- A **NEEDS-ARCH** proposal names what no accepted text states. It waits for a draft for akmaier.
- **TOUCHES-TEAM1** means its modules, or those that use them, are held or claimed by team 1
  (`docs/backlog/sprints/team1/92.md`).

Dropped as duplicates of items: NEW-044-5 is ITM-955 (merged in sprint team2/94); NEW-042-3 is ITM-957; NEW-043-5 is ITM-973 (registered from NEW-036-6, the same retryJob).

| Proposal | Status | Team 1 | Modules | Title |
|---|---|---|---|---|
| NEW-036-3 | NEEDS-ARCH | TOUCHES-TEAM1 | MOD-main-page | A job's page shows its commits, its pull request and its CI runs |
| NEW-036-5 | NEEDS-ARCH | TOUCHES-TEAM1 | MOD-runtimes, MOD-main-page | A commit a job made after its cancel is flagged, and its revert offered |
| NEW-036-8 | NEEDS-ARCH | TOUCHES-TEAM1 | MOD-main-page | A retry whose item is no longer startable names the reason and starts nothing |
| NEW-036-9 | NEEDS-ARCH | TOUCHES-TEAM1 | MOD-runtimes, MOD-main-page | A job running in another browser's tab is listed with its record and that note |
| NEW-038-5 | READY | TOUCHES-TEAM1 | MOD-personal-data | test_mail_privacy guards the rewriting of report data, the three checkers and the mailbox's places |
| NEW-039-4 | NEEDS-ARCH | INDEPENDENT for its own modules | MOD-job-catalogue, MOD-mail-handling | A participant drafts the question to a reporter |
| NEW-040-1 | READY | TOUCHES-TEAM1 | MOD-reuse-facts | hubFacts reads a model's or dataset's revision, licence and access from the Hugging Face Hub |
| NEW-040-3 | READY | TOUCHES-TEAM1 | MOD-resource-list | A model or data pinned to a branch name is named, as a repository is |
| NEW-040-4 | READY | TOUCHES-TEAM1 | MOD-site-frame | The explanations of declaring a resource |
| NEW-040-5 | READY | TOUCHES-TEAM1 | MOD-settings-pages, MOD-resource-list | The system and release tests of UC-040 |
| NEW-040-6 | NEEDS-ARCH | TOUCHES-TEAM1 | MOD-reuse-facts | A repository resource's licence file, last commit and committers of the last year |
| NEW-040-7 | NEEDS-ARCH | TOUCHES-TEAM1 | MOD-browser-store | A resource's key kept in this browser goes only to its resource |
| NEW-040-8 | NEEDS-ARCH | TOUCHES-TEAM1 | MOD-resource-list | A job that needs the product's resources names their pinned states in its inputs |
| NEW-040-9 | NEEDS-ARCH | TOUCHES-TEAM1 | MOD-settings-pages | Removing a resource, or a newer state of it, lists the jobs and tests that name it |
| NEW-040-10 | NEEDS-ARCH | TOUCHES-TEAM1 | MOD-settings-pages | A system that also works on the product opens the participant form prefilled |
| NEW-041-5 | NEEDS-ARCH | TOUCHES-TEAM1 | MOD-workflow-entries | CI starts an agent's sprint close when the sprint ends |
| NEW-041-6 | NEEDS-ARCH | TOUCHES-TEAM1 | MOD-bridge-jobs | A Bridge starts its agent's sprint close when the sprint ends |
| NEW-041-7 | NEEDS-ARCH | TOUCHES-TEAM1 | MOD-work-plans | A sprint's increment that is given up returns its done items to the backlog |
| NEW-042-1 | READY | TOUCHES-TEAM1 | MOD-settings-pages | Every repository setting is shown on the settings page with a summary and Edit |
| NEW-042-2 | READY | TOUCHES-TEAM1 | MOD-settings-pages | A withdrawn collaborator's Remove lists the files that still name them |
| NEW-042-4 | READY | TOUCHES-TEAM1 | MOD-settings-pages | The mails marked not an issue are a line of the settings page with Clear |
| NEW-043-12 | NEEDS-ARCH | TOUCHES-TEAM1 | MOD-implementation-pages | A finished run records and shows the validation of its selection |
| NEW-043-13 | READY | TOUCHES-TEAM1 | MOD-implementation-pages, MOD-run-planner, MOD-workflow-entries | The system and release tests of UC-043 |
| NEW-044-1 | READY | TOUCHES-TEAM1 | MOD-repository-hosts | A release's files are listed with their sizes and checksums |
| NEW-044-2 | READY | TOUCHES-TEAM1 | MOD-settings-pages | The settings page offers the Bridge's file for this computer |
| NEW-044-3 | READY | TOUCHES-TEAM1 | MOD-repository-hosts | A release is published whole, as a draft first |
| NEW-044-6 | READY | TOUCHES-TEAM1 | MOD-workflow-entries | A release tag builds and publishes the Bridge |
| NEW-044-7 | READY | TOUCHES-TEAM1 | MOD-desktop-shell | The Bridge's Agents view checks again for a newly installed agent |
| NEW-044-8 | READY | TOUCHES-TEAM1 | MOD-desktop-shell | Each view of the Bridge's window carries its own explanation |
| NEW-044-9 | READY | TOUCHES-TEAM1 | MOD-site-frame | The explanations of getting the Bridge and of its window |
| NEW-044-10 | READY | TOUCHES-TEAM1 | MOD-desktop-shell | The jump host is set in the Bridge's window |
| NEW-044-11 | READY | TOUCHES-TEAM1 | MOD-desktop-shell | The Bridge offers a newer release and installs it only after the person's clicks |
| NEW-044-12 | READY | TOUCHES-TEAM1 | MOD-desktop-shell | Quitting the Bridge names the jobs still running |
| NEW-044-13 | NEEDS-ARCH | INDEPENDENT | MOD-agent-processes | An agent that is not logged in is shown with its own login step |
| NEW-044-14 | NEEDS-ARCH | TOUCHES-TEAM1 | MOD-desktop-shell | The Bridge's window shows the origin it is paired with |
| NEW-044-15 | READY | TOUCHES-TEAM1 | MOD-bridge-build, MOD-desktop-shell | The release tests of the Bridge's release, its updates and its window's settings |
| NEW-045-1 | READY | TOUCHES-TEAM1 | MOD-implementation-pages | The plan page shows the architecture beside the plan's steps and their states |
| NEW-045-2 | READY | TOUCHES-TEAM1 | MOD-implementation-pages | The plan is drafted, reviewed and saved on the plan page |
| NEW-045-3 | READY | TOUCHES-TEAM1 | MOD-implementation-pages | A plan is written by hand with + Step and saved as the planner's own input |
| NEW-045-4 | NEEDS-ARCH | TOUCHES-TEAM1 | MOD-work-plans | The steps of changed, added or removed modules are marked after an architecture change |
| NEW-045-5 | READY | TOUCHES-TEAM1 | MOD-site-frame | The explanations of the implementation plan |
| NEW-045-6 | READY | TOUCHES-TEAM1 | MOD-implementation-pages, MOD-work-plans | The system and release tests of UC-045 |
| NEW-046-1 | READY | TOUCHES-TEAM1 | MOD-main-page, MOD-progress-measures | The system and release tests of UC-046 |
| NEW-048-1 | READY | TOUCHES-TEAM1 | MOD-implementation-pages | The system and release tests of UC-048 |
| NEW-048-2 | READY | TOUCHES-TEAM1 | MOD-implementation-pages | Remove team frees a team whose sprints' items have reached the default branch |
| NEW-048-3 | NEEDS-ARCH | TOUCHES-TEAM1 | MOD-implementation-pages | A team's role assignment is removed through an interface the module names |
| NEW-049-1 | NEEDS-ARCH | TOUCHES-TEAM1 | MOD-prompt-bar | A hand-over the product cannot take yet links where its job workflow and CI secrets are set up |

## NEW-036-3 — NEEDS-ARCH — TOUCHES-TEAM1

What is missing: missing: an interface MOD-main-page uses that gives a job's branch commits, its pull request and the CI runs of its commits (e.g. MOD-repository-hosts' `listPullRequests`/`listCiRuns` in MOD-main-page's Uses, or a MOD-runtimes function). **TOUCHES-TEAM1** MOD-main-page — team1/92.md:125.

````markdown
---
id: NEW-036-3
title: A job's page shows its commits, its pull request and its CI runs
level: module
realises:
  - UC-036
  - ONE DASHBOARD SHOWS EVERY JOB
modules:
  - MOD-main-page
builds_on:
  - ITM-971
tests:
  - unit
origin:
  - akmaier's direction of 2026-10-18 ("fill the backlog to implement the remaining missing UC 36 to the end")
---
# NEW-036-3 A job's page shows its commits, its pull request and its CI runs

**REGISTER**

## Outcome

MOD-main-page.md:96: "one job: its inputs, its commits and pull request, its CI runs". UC-036:90-91. MOD-main-page's
Uses name, of MOD-repository-hosts, only `parseAddress`, `connect`, `readSnapshot` and `webLinks`
(MOD-main-page.md:121-124); none reads a branch's commits, a job's pull request or its CI runs, and MOD-runtimes offers
none of them. So the item begins with a draft for akmaier naming where they are read.

## Acceptance

- The job's page lists the commits of the job's branch, its pull request and its CI runs, over a fake host, with a
  counter-proof.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
````

## NEW-036-5 — NEEDS-ARCH — TOUCHES-TEAM1

What is missing: missing: (a) a host function reading a branch's commits in MOD-runtimes' Uses; (b) which module offers and writes the revert, and through which host function. **TOUCHES-TEAM1** MOD-main-page — team1/92.md:125; MOD-runtimes (uses MOD-trace-graph, used by MOD-review-pages) — team1/92.md:122-124.

````markdown
---
id: NEW-036-5
title: A commit a job made after its cancel is flagged, and its revert offered
level: module
realises:
  - UC-036
  - A CANCELLED JOB WRITES NOTHING MORE
modules:
  - MOD-runtimes
  - MOD-main-page
builds_on:
  - ITM-972
tests:
  - unit
origin:
  - akmaier's direction of 2026-10-18 ("fill the backlog to implement the remaining missing UC 36 to the end")
---
# NEW-036-5 A commit a job made after its cancel is flagged, and its revert offered

**REGISTER**

## Outcome

UC-036:150-152 (6a): "If the job later pushes anyway, Agent M flags the commit as written after the cancel, and offers
to revert it." MOD-runtimes.md:187-188 states that `liveState` reports "a commit the job's branch got after a cancel …
in `writtenAfterCancel` (UC-036)". The code gives `[]` always: `src/runtimes/index.mjs:78`, "no way to read a branch's
commits is among this module's Uses". No module states the revert. The item begins with a draft for akmaier.

## Acceptance

- A fixture branch with a commit after the record's `cancelled` end is reported in `writtenAfterCancel` and flagged on
  the job's page with *Revert*; a branch without one reports none.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
````

## NEW-036-8 — NEEDS-ARCH — TOUCHES-TEAM1

What is missing: missing: MOD-work-plans.startable (with the facts it needs) in MOD-main-page's Uses, or the refusal stated in `retryJob`. **TOUCHES-TEAM1** MOD-main-page — team1/92.md:125.

````markdown
---
id: NEW-036-8
title: A retry whose item is no longer startable names the reason and starts nothing
level: module
realises:
  - UC-036
  - A TIME BOX WORKS ONLY ON WHAT WAS SELECTED FOR IT
  - NO JOB STARTS ABOVE THE WORK-IN-PROGRESS LIMIT
modules:
  - MOD-main-page
builds_on:
  - ITM-974
tests:
  - unit
origin:
  - akmaier's direction of 2026-10-18 ("fill the backlog to implement the remaining missing UC 36 to the end")
---
# NEW-036-8 A retry whose item is no longer startable names the reason and starts nothing

**REGISTER**

## Outcome

UC-036:153-154 (7a): "The retried job's item is no longer startable, for example because the sprint ended or the WIP
limit is reached. Agent M names the reason and starts nothing (UC-034, step 2)." MOD-work-plans states `startable`, and
MOD-prompt-bar and MOD-implementation-pages use it (MOD-prompt-bar.md:52, MOD-implementation-pages.md:50).
MOD-main-page's Uses do not name it, and `retryJob` (MOD-runtimes.md:200-204) states no such refusal. The item begins
with a draft for akmaier.

## Acceptance

- A retry of a job whose item left its sprint, or whose role assignment is at its WIP limit, names the reason and writes
  nothing; counter-proof: a startable item is retried.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
````

## NEW-036-9 — NEEDS-ARCH — TOUCHES-TEAM1

What is missing: missing: how a tab job of another browser is told from one whose tab closed (a record part, a heartbeat, or a state *running elsewhere*), and in which module (MOD-runtimes `liveState` or MOD-job-ledger `jobState`). **TOUCHES-TEAM1** MOD-runtimes — team1/92.md:122-124; MOD-main-page — team1/92.md:125.

````markdown
---
id: NEW-036-9
title: A job running in another browser's tab is listed with its record and that note
level: module
realises:
  - UC-036
  - ONE DASHBOARD SHOWS EVERY JOB
  - PROGRESS AND JOB STATE ARE DERIVED, NOT STORED
modules:
  - MOD-runtimes
  - MOD-main-page
builds_on:
  - ITM-535
tests:
  - unit
origin:
  - akmaier's direction of 2026-10-18 ("fill the backlog to implement the remaining missing UC 36 to the end")
---
# NEW-036-9 A job running in another browser's tab is listed with its record and that note

**REGISTER**

## Outcome

UC-036:136-138 (1b): "A job was started in another browser and runs in its tab. Its record is listed, with the note that
its live state and log exist only in that tab". On `main` such a job is shown *ended without record*:
`src/runtimes/index.mjs:84` gives `known: false` for a tab job this tab does not hold, and `src/job-ledger/states.mjs:20`
turns that into *ended without record* (1c). ARC-046:256 and MOD-runtimes.md:98-99 say only that a tab job "dies with the
tab; its record then shows it as ended without record". Nothing in the architecture tells 1b from 1c. The item begins
with a draft for akmaier.

## Acceptance

- A tab job of another browser that is still running is listed with the note and its folded explanation recommending a
  CI or Bridge route; one whose tab has closed is *ended without record*. Each with a counter-proof.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
````

## NEW-038-5 — READY — TOUCHES-TEAM1

````markdown
---
id: NEW-038-5
title: test_mail_privacy guards the rewriting of report data, the three checkers and the mailbox's places
level: module
realises:
  - REPORT DATA LEAVES THE MAILBOX ONLY REWRITTEN WITHOUT PERSONS
  - A REWRITTEN TEXT IS CHECKED BY THREE LLMS
  - NO CHECKER IS THE REWRITER
  - A TEXT FROM A MAIL IS SEARCHED FOR THAT MAIL'S PEOPLE
  - PSEUDONYMISATION IS ON UNLESS A PRODUCT SWITCHES IT OFF
  - THE PLACES A MAILBOX'S MAIL MAY GO ARE CONFIGURED
  - UC-038
modules:
  - MOD-personal-data
builds_on:
tests:
  - release
origin:
  - akmaier's direction of 2026-10-18 ("fill the backlog to implement the remaining missing UC 36 to the end")
---
# NEW-038-5 test_mail_privacy guards the rewriting of report data, the three checkers and the mailbox's places

**REGISTER**

## Outcome

SPEC.md names `tests/test_mail_privacy.py` as the check of these requirements (:2115-2116, :2136-2137, :2148-2151,
:2157-2159, :2164-2166, :2170-2171). The file does not exist. The code they guard is built: `personHits`
(`src/personal-data/people.mjs:67`), `checkersFor` (`checkers.mjs:13`), the recipe `report-data` with `PlaceNotAllowed`
and the check `people-search` (`strategies.mjs:13-41`), `pseudonymisationOf` (`index.mjs:41`). Its unit tests exist
(`tests/personal-data-*.test.mjs`); the release check the SPEC names does not.

## Acceptance

- `tests/test_mail_privacy.py` with its cases in `tests/test_mail_privacy.md`, each case as SPEC.md states its check:
  - an issue text with the sender's name or a signature name is refused and the hit named; without it, it passes;
  - a fixture log with a name, address, phone, IP and home-directory path, rewritten by a fixture participant, holds none
    of them; a rewrite that keeps one is refused;
  - three fixture checkers of which one reports a name: nothing written, the finding goes back; none reporting: written;
  - a checker set with the rewriter or its model is refused before anything is sent;
  - a product without the setting gets rewritten data, one that switched it off the original;
  - a mail is not given to a participant at an unlisted place, and is to one at a listed place.
- The rates the SPEC names are reported, not gated.
- Each test fails on a planted fault in `src/personal-data/`.
- Written by a participant that did not implement ITM-838 or ITM-839. Only tests that name MOD-personal-data change.
````

## NEW-039-4 — NEEDS-ARCH — INDEPENDENT for its own modules

What is missing: What is missing: - MOD-job-catalogue names no kind that drafts a question to a reporter for an open issue; - MOD-mail-handling names no recipe for its inputs. They would be the open issue, the person's point to ask and the   listed mail, unless `draft-replies` and `reply-inputs` are stated to cover open issues; - MOD-maintenance-pages.md:120 does not say that *Ask the reporter* has a run panel.

````markdown
---
id: NEW-039-4
title: A participant drafts the question to a reporter
level: module
realises:
  - UC-039
modules:
  - MOD-job-catalogue
  - MOD-mail-handling
builds_on:
  - ITM-968
  - ITM-954
tests:
  - unit
origin:
  - akmaier's direction of 2026-10-18 ("fill the backlog to implement the remaining missing UC 36 to the end")
---
# NEW-039-4 A participant drafts the question to a reporter

**REGISTER**

## Outcome

UC-039.md:150-152: "On an open issue, the author presses **Ask the reporter**; a question is drafted (by a participant
or by hand), shown complete as in step 4, and sent with **Send and wait**". ITM-968 builds the question written by
hand. A question drafted by a participant has no kind:
- MOD-job-catalogue.md:107 has only `draft-replies`, "one reply per mail". Its kind file says "Drafts one reply per mail
  of a closed issue" (`src/job-catalogue/kinds/draft-replies/kind.md`).
- The recipe `reply-inputs` (MOD-mail-handling.md:123-124) gives "the issue, what solved it ..., and each listed mail
  without a reply". That is not an open issue and the question to ask.

**It waits for a draft for akmaier.**

## Acceptance

- Once the architecture names the kind and its recipe, a participant's question for an open issue is stored as a draft
  and sent only as ITM-968 sends it.
- The first commit holds only the tests. No stub is committed.
````

## NEW-040-1 — READY — TOUCHES-TEAM1

````markdown
---
id: NEW-040-1
title: hubFacts reads a model's or dataset's revision, licence and access from the Hugging Face Hub
level: module
realises:
  - UC-040
  - DUE DILIGENCE IS FETCHED, NOT RECALLED
  - A RESOURCE IS PINNED TO AN EXACT STATE
modules:
  - MOD-reuse-facts
builds_on:
tests:
  - unit
origin:
  - akmaier's direction of 2026-10-18 ("fill the backlog to implement the remaining missing UC 36 to the end")
---
# NEW-040-1 hubFacts reads a model's or dataset's revision, licence and access from the Hugging Face Hub

**REGISTER**

## Outcome

UC-040.md:100-101: "**data / model on Hugging Face:** Agent M reads the current revision and the licence from the Hub
and pins the revision — where the Hub answers the browser, which is not yet measured (3b)." MOD-reuse-facts.md:108-110
states: "`hubFacts(id: string) -> Promise<Fact[]>` — a model's or dataset's revision, licence and whether it is gated or
private, read from the Hugging Face Hub, across the network, each with its address and date; a Hub that does not answer a
browser is named in the failure `HubBlocked { reason }`, and `NotFound { address }` for an unknown identifier."

`src/reuse-facts/index.mjs:329-333` throws `NotBuilt` ("hubFacts is not part of ITM-435"). ITM-435 (merged, team2/28)
built `registryFacts` and left `hubFacts` to "a later backlog item"; none exists. MOD-settings-pages' resources page
(ITM-642) reads the Hub through it (MOD-settings-pages.md:75-76, :258-259), and MOD-resource-list's `readPin` takes the
Hub reader from its caller (MOD-resource-list.md:93-96). The Hub's addresses are data in `registries.md`
(MOD-reuse-facts.md:43-44).

## Acceptance

- Unit tests that name MOD-reuse-facts, over a fake fetch: a public model's revision, licence and *not gated*, each with
  its address and date; a gated or private one marked so; an unknown identifier `NotFound` with the address; a refused
  call `HubBlocked` with the reason and no facts. Counter-proof: a fact without address or date fails.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/reuse-facts/` and the tests that name MOD-reuse-facts change.

**READY.** **TOUCHES-TEAM1** MOD-settings-pages, which uses `MOD-reuse-facts.hubFacts` (MOD-settings-pages.md:76) and is held
by team1/92.md:114: "MOD-settings-pages: ITM-638, ITM-642, ITM-639, ITM-703;". Startable once that hold ends.
````

## NEW-040-3 — READY — TOUCHES-TEAM1

````markdown
---
id: NEW-040-3
title: A model or data pinned to a branch name is named, as a repository is
level: unit
realises:
  - UC-040
  - A RESOURCE IS PINNED TO AN EXACT STATE
modules:
  - MOD-resource-list
builds_on:
tests:
  - unit
origin:
  - akmaier's direction of 2026-10-18 ("fill the backlog to implement the remaining missing UC 36 to the end")
---
# NEW-040-3 A model or data pinned to a branch name is named, as a repository is

**REGISTER**

## Outcome

UC-040.md:168-169 (3b): "The author pastes the revision from the Hub's *Files and versions* page; Agent M accepts only a
full commit hash, not a branch name such as `main`." MOD-resource-list.md:89-90: `resourceFindings` checks "the pin's form
for the kind — a full commit, not a branch name such as `main` —", and its Data (:58) pins data and a model to "a revision
or the SHA-256 of every file".

`src/resource-list/rules.mjs:49-51` checks the form for a repository only. Measured at `8bc49c6f`: `resourceFindings` of an
entry pinned to `main` gives `A RESOURCE IS PINNED TO AN EXACT STATE` for a repository (the known positive) and nothing for
a model or for data.

**Reading taken (AGENTS.md §6a.6):** a revision on the Hub is its 40-hex commit, so a data or model pin is a 40-hex
revision, or the per-file SHA-256 map the Data names. If the developer finds the schema's language cannot hold the map, the
item stops and reports it.

## Acceptance

- A model and a data entry pinned to `main`, a seven-digit abbreviation or a tag each give an error naming the rule, the
  resource and the pin; a 40-hex revision gives none. Counter-proof: the repository cases of TST-472587 stay as they are.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/resource-list/` and the tests that name MOD-resource-list change.

**READY.** **TOUCHES-TEAM1** MOD-settings-pages, which uses `MOD-resource-list.resourceFindings` (MOD-settings-pages.md:70),
held by team1/92.md:114: "MOD-settings-pages: ITM-638, ITM-642, ITM-639, ITM-703;".
````

## NEW-040-4 — READY — TOUCHES-TEAM1

````markdown
---
id: NEW-040-4
title: The explanations of declaring a resource
level: module
realises:
  - UC-040
  - EVERY STEP EXPLAINS ITSELF
modules:
  - MOD-site-frame
builds_on:
tests:
  - unit
origin:
  - akmaier's direction of 2026-10-18 ("fill the backlog to implement the remaining missing UC 36 to the end")
---
# NEW-040-4 The explanations of declaring a resource

**REGISTER**

## Outcome

UC-040 asks for folded texts at: step 1, "A folded **What is this?** explains the three-way difference above with the
examples" (:92-93); step 2, "each kind carries one sentence and an example" (:94-95); step 5, "The folded explanation
repeats ch. 10's warning that a leaked key is like a published credit-card number" (:114-115); 2b and 4b, links to UC-015
and UC-004 (:160-161, :174-176); 4c, "the folded explanation of the PEAKS example from ch. 6 §5" (:177-178).
MOD-site-frame.md:78 names "`explanations.md` — the folded explanations, as data", and :99 "one section `## <topic>` per
topic".

`src/site-frame/explanations.md` has no topic for resources (its `## source-kinds` at :495 and the source page's text at
:782, which links UC-040, are the known positives of the search). ITM-642's page draws these topics.

## Acceptance

- `explanations.md` holds the topics above, each worded from UC-040's table (:48-53) and kinds (:65-72), with the links
  to UC-015, UC-004 and UC-017 as the source page's topic links UC-040.
- The frame's check of topics (ITM-646 where it is merged, else a unit test) finds every topic the resources route names;
  counter-proof: a removed topic is reported.
- The first commit holds only the tests, and CI is red on it.

**READY.** **TOUCHES-TEAM1** MOD-site-frame, team1/92.md:115: "MOD-site-frame: ITM-915, ITM-646, ITM-641;".
````

## NEW-040-5 — READY — TOUCHES-TEAM1

````markdown
---
id: NEW-040-5
title: The system and release tests of UC-040
level: system
realises:
  - UC-040
  - A PRODUCT DECLARES ITS RESOURCES
  - A RESTRICTED RESOURCE IS REFERENCED, NEVER COPIED
  - A PINNED RESOURCE MOVES ONLY WHEN A PERSON MOVES IT
  - INSTANCE AND PRODUCT RESOURCES ARE INDEPENDENT
modules:
  - MOD-settings-pages
  - MOD-resource-list
builds_on:
  - ITM-642
  - NEW-040-1
  - ITM-960
  - NEW-040-4
tests:
  - system
  - release
origin:
  - akmaier's direction of 2026-10-18 ("fill the backlog to implement the remaining missing UC 36 to the end")
---
# NEW-040-5 The system and release tests of UC-040

**REGISTER**

## Outcome

UC-040's postcondition (:193-199): "`docs/resources.md` of the product repository names every resource the product is
built with, tested on or calls at runtime ... No credential and no restricted content is in the product repository. Jobs
that need a resource run only where it is reachable, against the pinned state." No test file guards UC-040's flow
(`tests/*uc-040*` is empty; `tests/release-uc-037-connect-mailbox.test.mjs` is the known positive).

## Acceptance

- A system test through the frame's routes `resources` and `resources/instance` over a fake host and a fake Bridge: main
  flow steps 1-8 for a repository, a compute resource on a Bridge and one on a runner; 1b, 2c, 3a, 4a, 7a, 7b, 7c, 9a, 9b.
  It checks: one commit of `docs/resources.md` per *Save*; no secret value and no restricted content in any commit; the
  instance's list unchanged by a product's save, and the reverse; *Move* the only change of a pin.
- A release test of the same flow, written by a participant other than the implementer of ITM-642
  (`RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER`). Counter-proof: a fault planted in the page's save fails it.
- Steps that wait on a NEEDS-ARCH item (NEW-040-6 to NEW-040-10) are left out and named in the test's header.

**READY** for the parts the accepted text states; it starts after ITM-642. **TOUCHES-TEAM1** MOD-settings-pages,
team1/92.md:114: "MOD-settings-pages: ITM-638, ITM-642, ITM-639, ITM-703;".
````

## NEW-040-6 — NEEDS-ARCH — TOUCHES-TEAM1

What is missing: for the inputs: MOD-job-catalogue's `resources: product` decides only the routes (MOD-job-catalogue.md:57), and `resourceStrategies` offers only `resource-check` (MOD-resource-list.md:112-113). Missing: the recipe (or part) that gives a job of a kind with `resources: product` the resources it needs with their pins, and which kinds use it.

````markdown
---
id: NEW-040-6
title: A repository resource's licence file, last commit and committers of the last year
level: module
realises:
  - UC-040
  - DUE DILIGENCE IS FETCHED, NOT RECALLED
modules:
  - MOD-reuse-facts
builds_on:
tests:
  - unit
origin:
  - akmaier's direction of 2026-10-18 ("fill the backlog to implement the remaining missing UC 36 to the end")
---
# NEW-040-6 A repository resource's licence file, last commit and committers of the last year

**REGISTER**

## Outcome

UC-040.md:97-99: for a repository, Agent M "shows the licence file if there is one, the date of the last commit and how
many people committed in the last year — the due-diligence view of ch. 6 §5."

**NEEDS-ARCH.** No interface gives these facts. MOD-reuse-facts' `Candidate` has `ecosystem: "npm" | "pypi" | "crates" |
"maven"` and `Fact.what` lists registry facts only (MOD-reuse-facts.md:95-99); MOD-settings-pages names `registryFacts`
and `hubFacts` for "what a repository or the Hugging Face Hub says about a resource" (:258-259), but `registryFacts` takes a
package candidate. Missing: the function (in MOD-reuse-facts, or a reading named in MOD-repository-hosts) that reads a
repository's licence file, last commit date and number of committers in the last year, with its type and failures.

## Acceptance

- Written once the architecture names the function.

**TOUCHES-TEAM1** MOD-settings-pages (its user), team1/92.md:114.
````

## NEW-040-7 — NEEDS-ARCH — TOUCHES-TEAM1

What is missing: for the inputs: MOD-job-catalogue's `resources: product` decides only the routes (MOD-job-catalogue.md:57), and `resourceStrategies` offers only `resource-check` (MOD-resource-list.md:112-113). Missing: the recipe (or part) that gives a job of a kind with `resources: product` the resources it needs with their pins, and which kinds use it.

````markdown
---
id: NEW-040-7
title: A resource's key kept in this browser goes only to its resource
level: module
realises:
  - UC-040
  - A RESOURCE CREDENTIAL GOES ONLY TO ITS RESOURCE
  - CONFIGURATION IS STORED IN LOCALSTORAGE, NOT IN A COOKIE
modules:
  - MOD-browser-store
builds_on:
tests:
  - unit
origin:
  - akmaier's direction of 2026-10-18 ("fill the backlog to implement the remaining missing UC 36 to the end")
---
# NEW-040-7 A resource's key kept in this browser goes only to its resource

**REGISTER**

## Outcome

UC-040.md:112-114: the credential may be held "as a **key in this browser**, stored in `localStorage` and sent only to that
resource's server"; 3c (:170-171): "Agent M asks for a Hugging Face token at step 5 and uses it only for requests to
Hugging Face." MOD-resource-list's Secret column allows `browser` (MOD-resource-list.md:64).

**NEEDS-ARCH.** MOD-browser-store's catalogue (MOD-browser-store.md:64-81) has no key for a resource's credential, and "A
key outside this catalogue is never written" (:83-84). No module states which request carries the key (for the Hub,
`hubFacts` takes only `id`, MOD-reuse-facts.md:108). Missing: the catalogue key (for example `resource-key:<name>`) and the
interface that attaches it only to the resource's own origin.

## Acceptance

- Written once the architecture names the key and the request that carries it.

**TOUCHES-TEAM1**: MOD-settings-pages uses MOD-browser-store (MOD-settings-pages.md:18-27), team1/92.md:114.
````

## NEW-040-8 — NEEDS-ARCH — TOUCHES-TEAM1

What is missing: for the inputs: MOD-job-catalogue's `resources: product` decides only the routes (MOD-job-catalogue.md:57), and `resourceStrategies` offers only `resource-check` (MOD-resource-list.md:112-113). Missing: the recipe (or part) that gives a job of a kind with `resources: product` the resources it needs with their pins, and which kinds use it.

````markdown
---
id: NEW-040-8
title: A job that needs the product's resources names their pinned states in its inputs
level: module
realises:
  - UC-040
  - A RESOURCE IS PINNED TO AN EXACT STATE
modules:
  - MOD-resource-list
builds_on:
tests:
  - unit
origin:
  - akmaier's direction of 2026-10-18 ("fill the backlog to implement the remaining missing UC 36 to the end")
---
# NEW-040-8 A job that needs the product's resources names their pinned states in its inputs

**REGISTER**

## Outcome

UC-040.md:126-128: "when a job that needs the resource is started (UC-010, UC-011), Agent M offers only the runtimes and
participants that reach it by its route, and names the pinned state in the job's inputs."

The routes are built (`src/runtimes/routes.mjs:68-85`). **NEEDS-ARCH** for the inputs: MOD-job-catalogue's `resources:
product` decides only the routes (MOD-job-catalogue.md:57), and `resourceStrategies` offers only `resource-check`
(MOD-resource-list.md:112-113). Missing: the recipe (or part) that gives a job of a kind with `resources: product` the
resources it needs with their pins, and which kinds use it.

## Acceptance

- Written once the architecture names the recipe.

**TOUCHES-TEAM1** if placed in MOD-resource-list (used by MOD-settings-pages, team1/92.md:114).
````

## NEW-040-9 — NEEDS-ARCH — TOUCHES-TEAM1

What is missing: NEEDS-ARCH.** MOD-browser-store's catalogue (MOD-browser-store.md:64-81) has no key for a resource's credential, and "A key outside this catalogue is never written" (:83-84). No module states which request carries the key (for the Hub, `hubFacts` takes only `id`, MOD-reuse-facts.md:108). Missing: the catalogue key (for example `resource-key:<name>`) and the interface that attaches it only to the resource's own origin.

````markdown
---
id: NEW-040-9
title: Removing a resource, or a newer state of it, lists the jobs and tests that name it
level: module
realises:
  - UC-040
  - A PINNED RESOURCE MOVES ONLY WHEN A PERSON MOVES IT
modules:
  - MOD-settings-pages
builds_on:
  - ITM-642
tests:
  - unit
origin:
  - akmaier's direction of 2026-10-18 ("fill the backlog to implement the remaining missing UC 36 to the end")
---
# NEW-040-9 Removing a resource, or a newer state of it, lists the jobs and tests that name it

**REGISTER**

## Outcome

UC-040.md:151-152 (1a): "Agent M lists the jobs and tests that name it; they are listed, not changed". UC-040.md:185-187
(9a): "The dashboard shows it beside the pin with the jobs that use the resource".

**NEEDS-ARCH.** The resources route (accepted 447a1a58:186-190) states "a newer state upstream with *Move*" and nothing of
removal or of the jobs and tests that use a resource. No module provides "the jobs and tests that name a resource".
Missing: that function (its owner and what "names" means — a job record's inputs, a test's header) and its place in the
resources route's text.

## Acceptance

- Written once the architecture names the function.

**TOUCHES-TEAM1** MOD-settings-pages, team1/92.md:114.
````

## NEW-040-10 — NEEDS-ARCH — TOUCHES-TEAM1

What is missing: NEEDS-ARCH** for the inputs: MOD-job-catalogue's `resources: product` decides only the routes (MOD-job-catalogue.md:57), and `resourceStrategies` offers only `resource-check` (MOD-resource-list.md:112-113). Missing: the recipe (or part) that gives a job of a kind with `resources: product` the resources it needs with their pins, and which kinds use it.

````markdown
---
id: NEW-040-10
title: A system that also works on the product opens the participant form prefilled
level: module
realises:
  - UC-040
  - ONE SYSTEM IN TWO ROLES IS TWO ENTRIES
modules:
  - MOD-settings-pages
builds_on:
  - ITM-642
tests:
  - unit
origin:
  - akmaier's direction of 2026-10-18 ("fill the backlog to implement the remaining missing UC 36 to the end")
---
# NEW-040-10 A system that also works on the product opens the participant form prefilled

**REGISTER**

## Outcome

UC-040.md:156-159 (2a): "a link opens UC-017 with type and address prefilled. The two entries share no fields."

**NEEDS-ARCH.** MOD-settings-pages' `participants` route (MOD-settings-pages.md:170-178) states no prefill handed from
another route. Missing: how the resources route hands the type and address to the `participants` route (route
parameters), in MOD-settings-pages' text.

## Acceptance

- Written once the architecture states the hand-over.

**TOUCHES-TEAM1** MOD-settings-pages, team1/92.md:114.

## Summary

10 gaps: READY 5 (NEW-040-1 to 5), NEEDS-ARCH 5 (NEW-040-6 to 10). INDEPENDENT: ITM-960 only. Open items that cover
steps: ITM-642 (page, team 1, waits for MOD-settings-pages' acceptance), ITM-843 (`resourceNeeds`, team 1). No step was
found built without a test.
````

## NEW-041-5 — NEEDS-ARCH — TOUCHES-TEAM1

What is missing: NEEDS-ARCH — changes MOD-workflow-entries — TOUCHES-TEAM1

````markdown
---
id: NEW-041-5
title: CI starts an agent's sprint close when the sprint ends
level: module
realises:
  - UC-041
  - A SPRINT CLOSED BY AN AGENT STARTS BY ITSELF
  - CLOSING A SPRINT CAN BE ASSIGNED TO A PARTICIPANT
modules:
  - MOD-workflow-entries
builds_on:
  - ITM-618
  - ITM-619
  - ITM-620
tests:
  - unit
origin:
  - akmaier's direction of 2026-10-18 ("fill the backlog to implement the remaining missing UC 36 to the end")
---
# NEW-041-5 CI starts an agent's sprint close when the sprint ends

**REGISTER**

## Outcome

MOD-workflow-entries.md:165-167: "`onSchedule(env)` — on the product's schedule: the events in time, such as the end of a
sprint's time box, whose close, if the product assigned it to an agent, is queued for that agent's route (`A SPRINT CLOSED
BY AN AGENT STARTS BY ITSELF`)." `onSchedule` is not built (`src/workflow-entries/product.mjs:3-4`).

Waits for a draft for akmaier: the entry for a sprint without a time box, and the function that says which sprint has
ended and whom its close is assigned to (see above).

## Acceptance

- Unit tests that name MOD-workflow-entries: a sprint whose time box ended and whose `closer` is a CI agent gets one queued
  `close-sprint` job on that agent's route; a sprint closed already, or one closed by a person, gets none.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
````

## NEW-041-6 — NEEDS-ARCH — TOUCHES-TEAM1

What is missing: NEEDS-ARCH — changes MOD-bridge-jobs — TOUCHES-TEAM1

````markdown
---
id: NEW-041-6
title: A Bridge starts its agent's sprint close when the sprint ends
level: module
realises:
  - UC-041
  - A SPRINT CLOSED BY AN AGENT STARTS BY ITSELF
modules:
  - MOD-bridge-jobs
builds_on:
  - ITM-618
  - ITM-619
  - ITM-620
tests:
  - unit
origin:
  - akmaier's direction of 2026-10-18 ("fill the backlog to implement the remaining missing UC 36 to the end")
---
# NEW-041-6 A Bridge starts its agent's sprint close when the sprint ends

**REGISTER**

## Outcome

MOD-bridge-jobs.md:121-123, `startWatching`: "a sprint whose close the product assigned to one of this Bridge's agents is
closed by that agent when its time box ends or every selected item is done". Not built: `src/bridge-jobs/watch.mjs:2-3`.

Waits for a draft for akmaier: the interface that gives which sprint has ended and who closes it (see above).

## Acceptance

- Unit tests that name MOD-bridge-jobs: with a served fixture product whose sprint's `closer` is an agent this Bridge
  offers, a watch round after the time box's end runs `close-sprint` once; a sprint closed by another participant is left.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
````

## NEW-041-7 — NEEDS-ARCH — TOUCHES-TEAM1

What is missing: NEEDS-ARCH — changes MOD-bridge-jobs — TOUCHES-TEAM1

````markdown
---
id: NEW-041-7
title: A sprint's increment that is given up returns its done items to the backlog
level: module
realises:
  - UC-041
  - A SPRINT HOLDS ITS ITEMS UNTIL THEY REACH THE DEFAULT BRANCH
modules:
  - MOD-work-plans
builds_on:
  - ITM-990
tests:
  - unit
origin:
  - akmaier's direction of 2026-10-18 ("fill the backlog to implement the remaining missing UC 36 to the end")
---
# NEW-041-7 A sprint's increment that is given up returns its done items to the backlog

**REGISTER**

## Outcome

UC-041 7b, quoted above. Waits for a draft for akmaier of how giving up is recorded and how `heldItems` reads it.

## Acceptance

- Unit tests that name MOD-work-plans: after the increment is given up, `heldItems` holds none of the sprint's done items.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
````

## NEW-042-1 — READY — TOUCHES-TEAM1

````markdown
---
id: NEW-042-1
title: Every repository setting is shown on the settings page with a summary and Edit
level: module
realises:
  - UC-042
  - EVERY SETTING IS REACHED FROM ONE PAGE
  - A PRODUCT'S SETTINGS LIVE IN ITS REPOSITORY
modules:
  - MOD-settings-pages
builds_on:
  - ITM-638
  - ITM-642
tests:
  - unit
origin:
  - akmaier's direction of 2026-10-18 ("fill the backlog to implement the remaining missing UC 36 to the end")
---
# NEW-042-1 Every repository setting is shown on the settings page with a summary and Edit

**REGISTER**

## Outcome

MOD-settings-pages.md:142-144: "A repository setting has a summary and *Edit*, opening its form here or the page where it is
kept — the product's process on the implementation pages, its schedule on the test pages." UC-042 step 3 (UC-042.md:77-79):
"**Instance** and **product** sections show each setting as a short summary with **Edit**, which opens the owning use case's
form in place." The settings of UC-042's table (UC-042.md:44-45): for the instance, participants, source library, process
models, the instance's resources; for a product, process model, role assignments, Definition of Done, test schedule, linked
sources, resources.

Today the product section holds pseudonymisation, collaborators and the job workflow, and the instance section recording
conversations (`src/settings-pages/settings.mjs:613`, `:900-1037`); none of the others is on the page. The quote stands in
the accepted blob `447a1a58`; the item starts once akmaier has accepted the current text again.

## Acceptance

- Unit tests that name MOD-settings-pages, over a fake host with a fixture instance and product: each of the ten settings is
  one line with a summary read from its file — or *not set* — and *Edit*, which opens its route; *Edit* of a product's process
  opens `process`, of its test schedule the test pages' route.
- Counter-proof: a fixture repository setting without a line fails `tests/test_settings_page.py`'s rule that every setting has
  its place on the page.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/settings-pages/` and the tests that name MOD-settings-pages change.
````

## NEW-042-2 — READY — TOUCHES-TEAM1

````markdown
---
id: NEW-042-2
title: A withdrawn collaborator's Remove lists the files that still name them
level: module
realises:
  - UC-042
  - A PERSON IS NAMED BY ACCOUNT OR WITH CONSENT
modules:
  - MOD-settings-pages
builds_on:
tests:
  - unit
origin:
  - akmaier's direction of 2026-10-18 ("fill the backlog to implement the remaining missing UC 36 to the end")
---
# NEW-042-2 A withdrawn collaborator's Remove lists the files that still name them

**REGISTER**

## Outcome

UC-042 5a (UC-042.md:147-149): "**Remove** takes them off the list with one click and lists the files on the default branch
that still name them, for the person to change; the page says that earlier commits keep the name in the history."
MOD-settings-pages.md:260-261 uses "MOD-personal-data.namedPersonFindings — a product's pseudonymisation and collaborators,
and the files that still name a collaborator who withdrew."

*Remove* and the history note are built (`src/settings-pages/settings.mjs:1011-1019`). The list of files is not:
`namedPersonFindings` (`src/personal-data/consent.mjs:14`, built) is not called by the page.

## Acceptance

- Unit tests that name MOD-settings-pages, over a fake host whose default branch has two files naming the collaborator:
  after *Remove*, the page lists exactly those two files; with none, it says so.
- Counter-proof: a page that lists no file while one names the collaborator fails.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/settings-pages/` and the tests that name MOD-settings-pages change.
````

## NEW-042-4 — READY — TOUCHES-TEAM1

````markdown
---
id: NEW-042-4
title: The mails marked not an issue are a line of the settings page with Clear
level: module
realises:
  - UC-042
  - EVERY SETTING IS REACHED FROM ONE PAGE
  - A BROWSER SETTING IS TESTED AND CLEARED WHERE IT IS SHOWN
modules:
  - MOD-settings-pages
builds_on:
  - NEW-042-3
tests:
  - unit
origin:
  - akmaier's direction of 2026-10-18 ("fill the backlog to implement the remaining missing UC 36 to the end")
---
# NEW-042-4 The mails marked not an issue are a line of the settings page with Clear

**REGISTER**

## Outcome

MOD-settings-pages.md:132-134: "`settings` — three sections — this browser, the instance, each product —, one line per setting
with its state ... A browser setting has *Test*, *Change* and *Clear*". The setting is `not-an-issue` (NEW-042-3). It holds
identifiers only, so the line shows how many mails are marked and *Clear*; there is nothing to test or change.

## Acceptance

- Unit tests that name MOD-settings-pages: with three marked identifiers the line says three and offers *Clear*, which after
  one confirmation removes the key from `localStorage`; with none, *not set*.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/settings-pages/` and the tests that name MOD-settings-pages change.
````

## NEW-043-12 — NEEDS-ARCH — TOUCHES-TEAM1

What is missing: NEEDS-ARCH — changes MOD-implementation-pages and the drivers — TOUCHES-TEAM1

````markdown
---
id: NEW-043-12
title: A finished run records and shows the validation of its selection
level: module
realises:
  - UC-043
  - A RUN ENDS WITH THE VALIDATION OF ITS MODULES
modules:
  - MOD-implementation-pages
builds_on:
  - ITM-982
tests:
  - unit
origin:
  - akmaier's direction of 2026-10-18 ("fill the backlog to implement the remaining missing UC 36 to the end")
---
# NEW-043-12 A finished run records and shows the validation of its selection

**REGISTER**

## Outcome

UC-043 step 8, quoted above. Waits for a draft for akmaier of the `finish` action's writer and the route's end view.

## Acceptance

- Unit tests: a finished run's record ends `done` with its validation, and the run page shows each module's requirements,
  code, tests and gaps beside the run's jobs and pull requests.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
````

## NEW-043-13 — READY — TOUCHES-TEAM1

````markdown
---
id: NEW-043-13
title: The system and release tests of UC-043
level: system
realises:
  - UC-043
modules:
  - MOD-implementation-pages
  - MOD-run-planner
  - MOD-workflow-entries
builds_on:
  - ITM-982
  - ITM-984
  - ITM-985
  - NEW-043-12
tests:
  - system
  - release
origin:
  - akmaier's direction of 2026-10-18 ("fill the backlog to implement the remaining missing UC 36 to the end")
---
# NEW-043-13 The system and release tests of UC-043

**REGISTER**

## Outcome

No test of level `release` names UC-043, and `tests/` holds neither `tests/test_process_run.py` — the check SPEC.md names for
`A RUN EXECUTES THE PROCESS MODEL OVER A SELECTION`, `A RUN CONTINUES WITHOUT A CLICK BETWEEN ITS JOBS`, `A RUN FOLLOWS THE
MODULES' INTERFACES`, `A RUN SETS UP CI BEFORE IT IMPLEMENTS`, `A RUN HAS LIMITS FIXED AT ITS START` and `A RUN ENDS WITH THE
VALIDATION OF ITS MODULES` — nor `tests/test_job_record.py`, the check of `A RUN IS A JOB THAT NAMES ITS JOBS`. The system
test walks UC-043's main flow and alternative flows as the dashboard and CI reach them. They are written by a participant
who implements none of the items they test (`RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER`).

## Acceptance

- Every requirement UC-043 realises has a release test; each new test's counter-proof is recorded in the pull request.
- Where the system and UC-043 disagree, the test follows UC-043 and the disagreement is named as a finding.
- Only tests change.
````

## NEW-044-1 — READY — TOUCHES-TEAM1

````markdown
---
id: NEW-044-1
title: A release's files are listed with their sizes and checksums
level: module
realises:
  - UC-044
  - THE BRIDGE IS ONE FILE PER PLATFORM
modules:
  - MOD-repository-hosts
builds_on:
tests:
  - unit
origin:
  - akmaier's direction of 2026-10-18 ("fill the backlog to implement the remaining missing UC 36 to the end")
---
# NEW-044-1 A release's files are listed with their sizes and checksums

**REGISTER**

## Outcome

MOD-repository-hosts.md:242-247: "`listReleaseAssets(tag: string | "latest") -> Promise<Release>` — a release and its files,
as the Bridge's download page offers them (UC-044): name, size, the download address, and the SHA-256 the server reports for
each file. ... where the server reports none the caller links the release's checksum file ... fails with `NotFound` when the
release does not exist, `TokenRefused`, `RateLimited`, `Unreachable`, and `NotSupported` through a clone." `Release` is
stated at MOD-repository-hosts.md:141-142. Neither is built (`listReleaseAssets` is in no file of `src/repository-hosts/`).

## Acceptance

- Unit tests that name MOD-repository-hosts, over a fake GitHub API: `latest` and a named tag give each asset's name, size,
  address and the server's SHA-256, `null` where it reports none; a missing release throws `NotFound`; a clone throws
  `NotSupported`.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/repository-hosts/` and the tests that name MOD-repository-hosts change.
````

## NEW-044-2 — READY — TOUCHES-TEAM1

````markdown
---
id: NEW-044-2
title: The settings page offers the Bridge's file for this computer
level: module
realises:
  - UC-044
  - AGENT M WORKS WITHOUT A LOCAL INSTALLATION
  - THE BRIDGE IS ONE FILE PER PLATFORM
  - EVERY STEP EXPLAINS ITSELF
modules:
  - MOD-settings-pages
builds_on:
  - NEW-044-1
  - NEW-044-9
tests:
  - unit
origin:
  - akmaier's direction of 2026-10-18 ("fill the backlog to implement the remaining missing UC 36 to the end")
---
# NEW-044-2 The settings page offers the Bridge's file for this computer

**REGISTER**

## Outcome

MOD-settings-pages.md:198-199: "`bridge` — the release's file for this computer's system with its size and the SHA-256 the
server reports for it, or, where the server reports none, a link to the release's checksum file". UC-044 step 1
(UC-044.md:62-64): "The page explains the two levels with the table above, recognises the operating system, and offers the
one file for it — on Windows an installer —, signed by the publisher of the release, with its size and checksum", and step 2
(UC-044.md:67-69): "a folded **Why this warning?** on the download page says so, shows the publisher's name to look for, and
names **More info → Run anyway**". The route `bridge` has no download today (`src/settings-pages/bridge.mjs`).

## Acceptance

- Unit tests that name MOD-settings-pages, with a fake release of the four files of MOD-bridge-build: on macOS the `.dmg`, on
  Windows the `.exe`, on Linux the `.AppImage` is offered with its size and SHA-256; without a reported SHA-256 the checksum
  file is linked; the explanations of the two levels and of the warning are folded beside it.
- Counter-proof: offering the macOS `.zip` (the updater's file) to a person fails.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/settings-pages/` and the tests that name MOD-settings-pages change.
````

## NEW-044-3 — READY — TOUCHES-TEAM1

````markdown
---
id: NEW-044-3
title: A release is published whole, as a draft first
level: module
realises:
  - UC-044
  - THE BRIDGE IS SIGNED BY ITS PUBLISHER
  - A VERSION IS NOT REWRITTEN
modules:
  - MOD-repository-hosts
builds_on:
  - NEW-044-1
tests:
  - unit
origin:
  - akmaier's direction of 2026-10-18 ("fill the backlog to implement the remaining missing UC 36 to the end")
---
# NEW-044-3 A release is published whole, as a draft first

**REGISTER**

## Outcome

MOD-repository-hosts.md:248-255: "`publishRelease(tag, release: { name, notes, files }) -> Promise<Release>` — on GitHub,
creates the release of a tag that stands: first as a draft, then each file uploaded to it, then published, so that no
release is seen with only part of its files. ... An existing release of the tag is never replaced (`A VERSION IS NOT
REWRITTEN`). On a GitLab server and through a clone without a token it throws `NotSupported`." Not built.

## Acceptance

- Unit tests that name MOD-repository-hosts, over a fake GitHub API: a release is created as a draft, every file uploaded, then
  published, and the returned `Release` carries each file's address and SHA-256; a tag with a release throws `ReleaseExists`;
  a failed upload leaves the draft unpublished and throws `UploadFailed { file }`.
- Counter-proof: publishing before the last upload fails.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/repository-hosts/` and the tests that name MOD-repository-hosts change.
````

## NEW-044-6 — READY — TOUCHES-TEAM1

````markdown
---
id: NEW-044-6
title: A release tag builds and publishes the Bridge
level: module
realises:
  - UC-044
  - THE BRIDGE IS SIGNED BY ITS PUBLISHER
  - THE BRIDGE IS ONE FILE PER PLATFORM
modules:
  - MOD-workflow-entries
builds_on:
  - NEW-044-5
tests:
  - unit
origin:
  - akmaier's direction of 2026-10-18 ("fill the backlog to implement the remaining missing UC 36 to the end")
---
# NEW-044-6 A release tag builds and publishes the Bridge

**REGISTER**

## Outcome

MOD-workflow-entries.md:208-211: "`onReleaseTagged(env) -> Promise<EntryStatus>` — in the instance, on a release tag: on each
platform's runner, the Bridge's file of that platform, signed; then the files, checksums, signatures and update feed published
as the release of the tag (`THE BRIDGE IS SIGNED BY ITS PUBLISHER`); nothing is published when a signature cannot be
verified." Not built: `src/workflow-entries/instance.mjs` exports `onApprovalsCommitted` and `onSourcesCommitted` only. The
instance's workflow file under `.github/workflows/` that runs it on the three platforms' runners is part of this item.

## Acceptance

- Unit tests that name MOD-workflow-entries, with MOD-bridge-build's functions faked: a tag runs `buildPlatform` per platform
  and `publishRelease` once; a missing secret ends `not run` naming it; a failed signature ends `failed` with nothing
  published.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/workflow-entries/`, the instance's release workflow file and the tests that name MOD-workflow-entries change.
````

## NEW-044-7 — READY — TOUCHES-TEAM1

````markdown
---
id: NEW-044-7
title: The Bridge's Agents view checks again for a newly installed agent
level: module
realises:
  - UC-044
  - THE BRIDGE GUIDES THE INSTALLATION OF A MISSING AGENT
  - THE BRIDGE FINDS THE INSTALLED AGENTS
modules:
  - MOD-desktop-shell
builds_on:
tests:
  - unit
origin:
  - akmaier's direction of 2026-10-18 ("fill the backlog to implement the remaining missing UC 36 to the end")
---
# NEW-044-7 The Bridge's Agents view checks again for a newly installed agent

**REGISTER**

## Outcome

MOD-desktop-shell.md:166-167: "*Agents* — every supported agent with its version, ready and logged in, or missing with its
vendor's installation page for this platform, and *Check again*". UC-044 3a (UC-044.md:106-107): "After installing one,
**Check again** lists it." The view has *How to install* (`src/desktop-shell/window.mjs:48`) and no *Check again*.

## Acceptance

- A unit test that names MOD-desktop-shell, with fixture executables: an agent missing at the first reading and put on the
  path is listed as installed after *Check again*, without restarting the Bridge.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/desktop-shell/` and the tests that name MOD-desktop-shell change.
````

## NEW-044-8 — READY — TOUCHES-TEAM1

````markdown
---
id: NEW-044-8
title: Each view of the Bridge's window carries its own explanation
level: module
realises:
  - UC-044
  - EVERY STEP EXPLAINS ITSELF
modules:
  - MOD-desktop-shell
builds_on:
  - NEW-044-9
tests:
  - unit
origin:
  - akmaier's direction of 2026-10-18 ("fill the backlog to implement the remaining missing UC 36 to the end")
---
# NEW-044-8 Each view of the Bridge's window carries its own explanation

**REGISTER**

## Outcome

MOD-desktop-shell.md:165: "The window's views, drawn with the site's frame as the page `bridge`, each with its explanation".
UC-044 step 3 (UC-044.md:73-74): "A folded explanation says that the agent will use its own login on this computer, so no key
is needed and the person's subscription pays." Every view calls `explain("bridge-pairing")` (`src/desktop-shell/window.mjs`,
five calls); the topic `bridge-own-login` exists (`src/site-frame/explanations.md:483`) and no view names it.

## Acceptance

- A unit test that names MOD-desktop-shell: *Agents*, *Pairing*, *Tunnels*, *Settings* and *Updates* each name their own topic,
  *Agents* `bridge-own-login`; the frame's own check finds every topic named.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/desktop-shell/` and the tests that name MOD-desktop-shell change.
````

## NEW-044-9 — READY — TOUCHES-TEAM1

````markdown
---
id: NEW-044-9
title: The explanations of getting the Bridge and of its window
level: module
realises:
  - UC-044
  - EVERY STEP EXPLAINS ITSELF
modules:
  - MOD-site-frame
builds_on:
tests:
  - unit
origin:
  - akmaier's direction of 2026-10-18 ("fill the backlog to implement the remaining missing UC 36 to the end")
---
# NEW-044-9 The explanations of getting the Bridge and of its window

**REGISTER**

## Outcome

MOD-site-frame.md:100-103: `explanations.md` "holds the topics of the site's pages and those of the Bridge's window ...: the
coding agents and how to install a missing one, the pairing token and pairing anew, the jump host and the public key, the
tunnels, importing a settings export, updates, and why a newly signed release may still be warned about." Of the Bridge's,
`explanations.md` holds `bridge-pairing`, `bridge-own-login` and `bridge-https-route` (`:277`, `:483`, `:489`). Missing: the
two levels of UC-044's table, the warning of a newly signed release (*Why this warning?*, UC-044.md:67-69), installing a
missing agent, the jump host and the public key, the tunnels, importing an export in the window, and updates.

## Acceptance

- `explanations.md` holds each topic above; the frame's own check finds none missing for the page `bridge` and the route
  `bridge`.
- A unit test that names MOD-site-frame renders each, with a counter-proof of a topic left out.
- Only `src/site-frame/` and the tests that name MOD-site-frame change.
````

## NEW-044-10 — READY — TOUCHES-TEAM1

````markdown
---
id: NEW-044-10
title: The jump host is set in the Bridge's window
level: module
realises:
  - UC-044
  - THE BRIDGE IS CONFIGURED IN ITS WINDOW OR FROM AN EXPORT
  - THE BRIDGE OPENS ITS TUNNELS ITSELF
modules:
  - MOD-desktop-shell
builds_on:
tests:
  - unit
origin:
  - akmaier's direction of 2026-10-18 ("fill the backlog to implement the remaining missing UC 36 to the end")
---
# NEW-044-10 The jump host is set in the Bridge's window

**REGISTER**

## Outcome

MOD-desktop-shell.md:64-65: "It keeps the Bridge's settings, set in the window or taken from the dashboard's export", and
:174: "*Tunnels* — the jump host; the Bridge's public key with *Copy* ...". UC-044 6a.1 (UC-044.md:123-124): "In the bridge's
window the person enters the jump host — hostname, SSH user —, or imports the dashboard's settings export". The window offers
only the export: `src/desktop-shell/window.mjs:104` "Set a jump host in a settings export to open tunnels." The settings file
already keeps `jumpHost` (`src/desktop-shell/settings.mjs:12`, `:35`).

## Acceptance

- A unit test that names MOD-desktop-shell: hostname, SSH user and port entered in the window are kept in `settings.json`'s
  `jumpHost`, and the Tunnels view then names `user@hostname` in its sentence; an empty hostname is refused.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/desktop-shell/` and the tests that name MOD-desktop-shell change.
````

## NEW-044-11 — READY — TOUCHES-TEAM1

````markdown
---
id: NEW-044-11
title: The Bridge offers a newer release and installs it only after the person's clicks
level: module
realises:
  - UC-044
  - THE BRIDGE IS UPDATED ONLY BY THE PERSON'S CHOICE
modules:
  - MOD-desktop-shell
builds_on:
  - NEW-044-5
tests:
  - unit
origin:
  - akmaier's direction of 2026-10-18 ("fill the backlog to implement the remaining missing UC 36 to the end")
---
# NEW-044-11 The Bridge offers a newer release and installs it only after the person's clicks

**REGISTER**

## Outcome

MOD-desktop-shell.md:182-192: "**Updates** (`THE BRIDGE IS UPDATED ONLY BY THE PERSON'S CHOICE`), through electron-updater with
`autoDownload` off ... it offers a newer release only when the feed's detached signature holds against the publisher's key
built into the app ... *Download* — the person's click — fetches the file, which becomes installable only when its own
detached signature holds ...; otherwise the file is deleted and the window says that it is not the publisher's. *Install and
restart* — a second click, after a decision that names the jobs that would end as cancelled — calls `quitAndInstall()`."
The Parts name `updates.mjs` (MOD-desktop-shell.md:78); it does not exist, and the window has no *Updates* view
(`src/desktop-shell/window.mjs:107`). UC-044 7a (UC-044.md:141-142).

## Acceptance

- Unit tests that name MOD-desktop-shell, with a fake update feed and a test key: a newer release with a valid feed signature
  is offered with its notes; a feed whose signature fails offers nothing; a downloaded file whose signature fails is deleted
  and named; *Install and restart* names the running jobs and installs only after its decision.
- Counter-proof: an update installed without the second click fails.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/desktop-shell/` and the tests that name MOD-desktop-shell change.
````

## NEW-044-12 — READY — TOUCHES-TEAM1

````markdown
---
id: NEW-044-12
title: Quitting the Bridge names the jobs still running
level: module
realises:
  - UC-044
  - THE BRIDGE RUNS AS AN APP
modules:
  - MOD-desktop-shell
builds_on:
tests:
  - unit
origin:
  - akmaier's direction of 2026-10-18 ("fill the backlog to implement the remaining missing UC 36 to the end")
---
# NEW-044-12 Quitting the Bridge names the jobs still running

**REGISTER**

## Outcome

MOD-desktop-shell.md:179-181: "*Quit* names the jobs still running, which then end as cancelled, and stops the watching, the
tunnels and the server." UC-044 7b (UC-044.md:143-144). *Quit* calls `window.bridge.quit()` at once
(`src/desktop-shell/window.mjs:15`, `:23`; `src/desktop-shell/main.mjs:107`); `stopWatching("quit")` already ends running jobs
as cancelled (`src/bridge-jobs/watch.mjs:247`).

## Acceptance

- A unit test that names MOD-desktop-shell: with two running jobs, *Quit* shows a decision naming both; confirming quits and
  both records end cancelled; declining leaves the Bridge running. With none running it quits at once.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/desktop-shell/` and the tests that name MOD-desktop-shell change.
````

## NEW-044-13 — NEEDS-ARCH — INDEPENDENT

What is missing: NEEDS-ARCH — changes MOD-agent-processes (and MOD-desktop-shell) — INDEPENDENT of team 1's current holds

````markdown
---
id: NEW-044-13
title: An agent that is not logged in is shown with its own login step
level: module
realises:
  - UC-044
  - A LOCAL AGENT USES THE PERSON'S OWN LOGIN
modules:
  - MOD-agent-processes
builds_on:
tests:
  - unit
origin:
  - akmaier's direction of 2026-10-18 ("fill the backlog to implement the remaining missing UC 36 to the end")
---
# NEW-044-13 An agent that is not logged in is shown with its own login step

**REGISTER**

## Outcome

UC-044 3b, quoted above. Waits for a draft for akmaier of where the login step is kept (the register) and how `Agent` carries
it.

## Acceptance

- Unit tests: an installed agent whose login check fails is returned with `loggedIn: false` and its login step from the
  register; nothing asks for a password.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
````

## NEW-044-14 — NEEDS-ARCH — TOUCHES-TEAM1

What is missing: NEEDS-ARCH — changes MOD-agent-processes (and MOD-desktop-shell) — INDEPENDENT of team 1's current holds

````markdown
---
id: NEW-044-14
title: The Bridge's window shows the origin it is paired with
level: module
realises:
  - UC-044
  - THE BRIDGE IS PAIRED ONCE
modules:
  - MOD-desktop-shell
builds_on:
tests:
  - unit
origin:
  - akmaier's direction of 2026-10-18 ("fill the backlog to implement the remaining missing UC 36 to the end")
---
# NEW-044-14 The Bridge's window shows the origin it is paired with

**REGISTER**

## Outcome

UC-044 step 4, quoted above. Waits for a draft for akmaier of how the Bridge notices a pairing and tells its window.

## Acceptance

- A unit test: after a request with the token from the instance's origin, the Pairing view says *paired with* that origin;
  after *Pair anew*, it says *not paired* until the next such request.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
````

## NEW-044-15 — READY — TOUCHES-TEAM1

````markdown
---
id: NEW-044-15
title: The release tests of the Bridge's release, its updates and its window's settings
level: release
realises:
  - UC-044
  - THE BRIDGE IS ONE FILE PER PLATFORM
  - THE BRIDGE IS SIGNED BY ITS PUBLISHER
  - THE BRIDGE IS UPDATED ONLY BY THE PERSON'S CHOICE
  - THE BRIDGE IS CONFIGURED IN ITS WINDOW OR FROM AN EXPORT
modules:
  - MOD-bridge-build
  - MOD-desktop-shell
builds_on:
  - NEW-044-6
  - NEW-044-10
  - NEW-044-11
tests:
  - release
origin:
  - akmaier's direction of 2026-10-18 ("fill the backlog to implement the remaining missing UC 36 to the end")
---
# NEW-044-15 The release tests of the Bridge's release, its updates and its window's settings

**REGISTER**

## Outcome

SPEC.md names `tests/test_bridge_release.py` for `THE BRIDGE IS ONE FILE PER PLATFORM` ("the release build yields one file per
platform, and each starts, after installation where it is an installer, on a machine without Node or Deno"), `THE BRIDGE IS
SIGNED BY ITS PUBLISHER` and `THE BRIDGE IS UPDATED ONLY BY THE PERSON'S CHOICE`, and `tests/test_bridge_settings.py` for `THE
BRIDGE IS CONFIGURED IN ITS WINDOW OR FROM AN EXPORT`. Neither file exists. They are written by a participant who implements
none of the items they test (`RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER`).

## Acceptance

- Both files exist and guard their requirements as SPEC.md states the checks; each new test's counter-proof is recorded in the
  pull request.
- Where the Bridge and UC-044 disagree, the test follows UC-044 and the disagreement is named as a finding.
- Only tests change.
````

## NEW-045-1 — READY — TOUCHES-TEAM1

````markdown
---
id: NEW-045-1
title: The plan page shows the architecture beside the plan's steps and their states
level: module
realises:
  - UC-045
  - PROGRESS AND JOB STATE ARE DERIVED, NOT STORED
  - DIAGRAMS ARE MERMAID IN MARKDOWN
modules:
  - MOD-implementation-pages
builds_on:
  - NEW-045-5
tests:
  - unit
origin:
  - akmaier's direction of 2026-10-18 ("fill the backlog to implement the remaining missing UC 36 to the end")
---
# NEW-045-1 The plan page shows the architecture beside the plan's steps and their states

**REGISTER**

## Outcome

MOD-implementation-pages.md:156-157: "`plan` — the architecture's subsystems and modules beside the plan's steps with their
derived states and what each waits for". UC-045 step 1 (UC-045.md:63-66), 1a and 1b (UC-045.md:105-107). The route is not
built (`src/implementation-pages/index.mjs:3`). `itemStates` already orders the steps by `docs/plan/order.md` and gives a
step that waits for a gate as `waiting` (`src/work-plans/states.mjs:27-62`, `:166`).

## Acceptance

- Unit tests that name MOD-implementation-pages, over a fake host with a fixture V-model product:
  - the system, its subsystems and their modules are shown beside the steps in their order, each with its state and what it
    waits for, and a Mermaid diagram of the steps;
  - a product whose model works from a backlog links to the backlog and shows no plan;
  - with an open architecture file, the page names it and offers nothing to plan.
- Counter-proof: steps shown in file order instead of `order.md`'s fail.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/implementation-pages/` and the tests that name MOD-implementation-pages change.
````

## NEW-045-2 — READY — TOUCHES-TEAM1

````markdown
---
id: NEW-045-2
title: The plan is drafted, reviewed and saved on the plan page
level: module
realises:
  - UC-045
  - A GENERATED ARTIFACT IS A PROPOSAL
  - THE PAGE NAMES WHERE IT SENDS
  - ONE CLICK PER DECISION
modules:
  - MOD-implementation-pages
builds_on:
  - NEW-045-1
  - ITM-613
  - ITM-614
tests:
  - unit
origin:
  - akmaier's direction of 2026-10-18 ("fill the backlog to implement the remaining missing UC 36 to the end")
---
# NEW-045-2 The plan is drafted, reviewed and saved on the plan page

**REGISTER**

## Outcome

MOD-implementation-pages.md:157-159: "*Draft the plan* with its run panel, run in this tab and attended, whose result waits
for the planner; the draft reviewed in order, reordered, split, merged or edited where its dependencies allow; *Save plan*,
which lets the drafted plan go on as the planner left it". MOD-job-catalogue.md:129-130: for a kind of `review: person` the
click is "*Save plan* (UC-045) — ... through MOD-job-runner's `writeResult`". UC-045 steps 2, 4 and 5 (UC-045.md:67-69,
:80-84).

## Acceptance

- Unit tests that name MOD-implementation-pages, with a fixture drafting participant:
  - the run panel names the participant, its processing place and the parts `architecture-and-model` sends;
  - the returned draft is shown in its order with a diagram; a reorder that puts a module before one whose interface it
    uses is refused with that finding;
  - *Save plan* calls `writeResult` with the draft as the planner left it, which writes one commit through `plan-steps`.
- Counter-proof: a save that writes the draft as returned, ignoring the planner's edit, fails.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/implementation-pages/` and the tests that name MOD-implementation-pages change.
````

## NEW-045-3 — READY — TOUCHES-TEAM1

````markdown
---
id: NEW-045-3
title: A plan is written by hand with + Step and saved as the planner's own input
level: module
realises:
  - UC-045
  - A PERSON'S OWN INPUT IS COMMITTED DIRECTLY
  - EVERY ARTIFACT HAS AN IDENTIFIER
modules:
  - MOD-implementation-pages
builds_on:
  - NEW-045-1
  - ITM-614
tests:
  - unit
origin:
  - akmaier's direction of 2026-10-18 ("fill the backlog to implement the remaining missing UC 36 to the end")
---
# NEW-045-3 A plan is written by hand with + Step and saved as the planner's own input

**REGISTER**

## Outcome

MOD-implementation-pages.md:158-159: "*Save plan*, which ... writes a plan made by hand with `savePlan`; *+ Step*." UC-045
2a (UC-045.md:112-113): "They add steps with **+ Step**, each naming what it implements or integrates; the check of step 3
runs when they press **Save plan**, and the plan is committed as their own input." `savePlan` runs `planFindings` first and
writes nothing on an error finding (MOD-work-plans.md:179-185).

## Acceptance

- Unit tests that name MOD-implementation-pages, over a fake host: steps added with *+ Step* and saved commit one file per step
  and `docs/plan/order.md` with no provenance lines; a plan without a step for one module is refused, the finding shown, and
  nothing written.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/implementation-pages/` and the tests that name MOD-implementation-pages change.
````

## NEW-045-4 — NEEDS-ARCH — TOUCHES-TEAM1

What is missing: NEEDS-ARCH — changes MOD-work-plans — TOUCHES-TEAM1

````markdown
---
id: NEW-045-4
title: The steps of changed, added or removed modules are marked after an architecture change
level: module
realises:
  - UC-045
modules:
  - MOD-work-plans
builds_on:
  - ITM-613
tests:
  - unit
origin:
  - akmaier's direction of 2026-10-18 ("fill the backlog to implement the remaining missing UC 36 to the end")
---
# NEW-045-4 The steps of changed, added or removed modules are marked after an architecture change

**REGISTER**

## Outcome

UC-045 1c, quoted above. Waits for a draft for akmaier of where the mark is derived and how the page shows it.

## Acceptance

- Unit tests: after a module file changes, the step that implements it is marked; a removed module's step is marked; an added
  module is named as without a step. Nothing is written until the planner saves.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
````

## NEW-045-5 — READY — TOUCHES-TEAM1

````markdown
---
id: NEW-045-5
title: The explanations of the implementation plan
level: module
realises:
  - UC-045
  - EVERY STEP EXPLAINS ITSELF
modules:
  - MOD-site-frame
builds_on:
tests:
  - unit
origin:
  - akmaier's direction of 2026-10-18 ("fill the backlog to implement the remaining missing UC 36 to the end")
---
# NEW-045-5 The explanations of the implementation plan

**REGISTER**

## Outcome

MOD-site-frame.md:99-100: "`explanations.md`: one section `## <topic>` per topic ... It holds the topics of the site's
pages". UC-045 step 1 (UC-045.md:65-66): "A folded **What is this?** explains the plan with the table above and points to book
ch. 6." No topic of `explanations.md` names the plan or its steps.

## Acceptance

- `explanations.md` holds the topics the plan page names, the plan's topic with the table of UC-045 and the pointer to
  chapter 6; the frame's own check finds none missing.
- A unit test that names MOD-site-frame renders each topic, with a counter-proof of a topic left out.
- Only `src/site-frame/` and the tests that name MOD-site-frame change.
````

## NEW-045-6 — READY — TOUCHES-TEAM1

````markdown
---
id: NEW-045-6
title: The system and release tests of UC-045
level: system
realises:
  - UC-045
modules:
  - MOD-implementation-pages
  - MOD-work-plans
builds_on:
  - NEW-045-2
  - NEW-045-3
tests:
  - system
  - release
origin:
  - akmaier's direction of 2026-10-18 ("fill the backlog to implement the remaining missing UC 36 to the end")
---
# NEW-045-6 The system and release tests of UC-045

**REGISTER**

## Outcome

No test of level `release` names UC-045, and `tests/` holds neither `tests/test_implementation_plan.py` — the check SPEC.md
names for `AN IMPLEMENTATION PLAN ASSEMBLES THE SYSTEM FROM ITS MODULES` and `A PLAN STEP NAMES THE TESTS OF ITS LEVEL` — nor
`tests/test_plan_layout.py`, the check of `THE IMPLEMENTATION PLAN LIVES IN THE PRODUCT REPOSITORY`. The system test walks
UC-045's main flow and alternative flows as the dashboard reaches them. They are written by a participant who implements
none of the items they test (`RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER`).

## Acceptance

- Every requirement UC-045 realises has a release test; each new test's counter-proof is recorded in the pull request.
- Where the page and UC-045 disagree, the test follows UC-045 and the disagreement is named as a finding.
- Only tests change.
````

## NEW-046-1 — READY — TOUCHES-TEAM1

````markdown
---
id: NEW-046-1
title: The system and release tests of UC-046
level: system
realises:
  - UC-046
modules:
  - MOD-main-page
  - MOD-progress-measures
builds_on:
  - ITM-684
  - ITM-864
tests:
  - system
  - release
origin:
  - akmaier's direction of 2026-10-18 ("fill the backlog to implement the remaining missing UC 36 to the end")
---
# NEW-046-1 The system and release tests of UC-046

**REGISTER**

## Outcome

No item realises the system and release tests of UC-046, and `tests/` holds no system test of it: every test that names
UC-046 is a unit test. UC-046.md:51-66 is the main flow, ":83-91" the alternative flows; MOD-main-page.md:80-91 the route
`home` that serves them ("one card per product this browser keeps, each with its name, its process model, its bar of six
stages each filled by its share, the stage it is in marked, a click on a stage leading to that stage's page under `docs/`
for the product, and its build").

The system test walks the main flow and every alternative flow UC-046 names on the live main page, as `index.html` serves
it after ITM-684, each test stating its expected result. The existing `tests/test_main_page.py`, `tests/test_progress_derived.py`
and `tests/test_job_dashboard.py` stay; a release test is added for each requirement UC-046 realises without one, except
those whose check is "at review". They are written from UC-046 and the requirements it realises by a participant who
implements none of the items it tests (`RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER`).

## Acceptance

- Every requirement UC-046 realises with an automatic check has a release test, existing or new; each new test's
  counter-proof is recorded in the pull request.
- Where the page and UC-046 disagree, the test follows UC-046 and the disagreement is named as a finding.
- Only tests change.
````

## NEW-048-1 — READY — TOUCHES-TEAM1

````markdown
---
id: NEW-048-1
title: The system and release tests of UC-048
level: system
realises:
  - UC-048
modules:
  - MOD-implementation-pages
builds_on:
  - NEW-048-2
tests:
  - system
  - release
origin:
  - akmaier's direction of 2026-10-18 ("fill the backlog to implement the remaining missing UC 36 to the end")
---
# NEW-048-1 The system and release tests of UC-048

**REGISTER**

## Outcome

No item realises UC-048, and `tests/` holds no system test of it. UC-048.md:49-60 is the main flow, :84-100 the
alternative flows; MOD-implementation-pages.md:147-152 the route that serves them ("`roles` — *Roles* (UC-048): the
product's role assignments — its teams, in a model with sprints —, each with who fills which role, and the roles of the
model with what each needs and how many fill it").

The system test walks the main flow and every alternative flow UC-048 names, as the dashboard reaches `#roles`, each test
stating its expected result; 2a and 4b run with two teams. The existing `tests/test_role_assignment.py`,
`tests/test_model_roles.py` and `tests/test_participants.py` stay; a release test is added for each requirement UC-048
realises without one, except those whose check is "at review". They are written from UC-048 and the requirements it
realises by a participant who implements none of the items it tests (`RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER`).

## Acceptance

- Every requirement UC-048 realises with an automatic check has a release test, existing or new; each new test's
  counter-proof is recorded in the pull request.
- Where the page and UC-048 disagree, the test follows UC-048 and the disagreement is named as a finding.
- Only tests change.
````

## NEW-048-2 — READY — TOUCHES-TEAM1

````markdown
---
id: NEW-048-2
title: Remove team frees a team whose sprints' items have reached the default branch
level: module
realises:
  - UC-048
  - A SPRINT HOLDS ITS ITEMS UNTIL THEY REACH THE DEFAULT BRANCH
modules:
  - MOD-implementation-pages
builds_on:
tests:
  - unit
origin:
  - akmaier's direction of 2026-10-18 ("fill the backlog to implement the remaining missing UC 36 to the end")
---
# NEW-048-2 Remove team frees a team whose sprints' items have reached the default branch

**REGISTER**

## Outcome

UC-048.md:99-100: "While one of its sprints holds items (UC-032), the team cannot be removed, and Agent M names them;
otherwise Agent M removes its role assignment." MOD-implementation-pages.md:151-152: "a team is removed only while no
sprint of it holds an item (`heldItems`)". MOD-work-plans.md:151-153: an item's hold ends "when a merged pull request
naming it reaches the default branch".

`src/implementation-pages/roles.mjs:261` calls `heldItems` with the pull requests `"unknown"`, because
`listPullRequests` was not built when the route was (`roles.mjs:17-19`). It is built now
(`src/repository-hosts/index.mjs:347`) and named in the module's Uses (MOD-implementation-pages.md:23). So a team whose
items are all merged is refused today. *Remove team* reads the product's pull requests with `listPullRequests` and hands
them to `heldItems`. The refusal names the held items as now. The write of the removal is not changed here (NEW-048-3).

## Acceptance

- A team whose sprint selected an item whose pull request is merged into the default branch is removable; a team with an
  item whose pull request is open, or that has none, is refused and the item named. Tests state both, with a fixture host
  that serves the pull requests.
- Counter-proof: passing `"unknown"` again fails the first case.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/implementation-pages/` and the tests that name MOD-implementation-pages change.
````

## NEW-048-3 — NEEDS-ARCH — TOUCHES-TEAM1

What is missing: NEEDS-ARCH · TOUCHES-TEAM1

````markdown
---
id: NEW-048-3
title: A team's role assignment is removed through an interface the module names
level: module
realises:
  - UC-048
  - DEVELOP AGAINST INTERFACES
modules:
  - MOD-implementation-pages
builds_on:
  - NEW-048-2
tests:
  - unit
origin:
  - akmaier's direction of 2026-10-18 ("fill the backlog to implement the remaining missing UC 36 to the end")
---
# NEW-048-3 A team's role assignment is removed through an interface the module names

**REGISTER**

## Outcome

UC-048.md:100: "otherwise Agent M removes its role assignment." `src/implementation-pages/roles.mjs:268` removes it with
`product.host.commitFiles`, which MOD-implementation-pages' Uses (MOD-implementation-pages.md:21-28, :204-210) do not name.
Its Files (:188-189) name `saveFile` for the role assignments, and `saveFile` (MOD-artifact-edits.md:78-90) deletes no file.

**Waits for a draft for akmaier.** Once the architecture names how a role assignment is removed, this item moves the
removal onto that interface.

## Acceptance

- The removal goes through the interface the accepted text names; a test with a fixture host shows the one commit that
  removes `docs/role-assignments/<team>.md` and nothing else, and that nothing is written when the head moved meanwhile.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
````

## NEW-049-1 — NEEDS-ARCH — TOUCHES-TEAM1

What is missing: NEEDS-ARCH · TOUCHES-TEAM1

````markdown
---
id: NEW-049-1
title: A hand-over the product cannot take yet links where its job workflow and CI secrets are set up
level: module
realises:
  - UC-049
  - EVERY STEP EXPLAINS ITSELF
modules:
  - MOD-prompt-bar
builds_on:
  - ITM-505
tests:
  - unit
origin:
  - akmaier's direction of 2026-10-18 ("fill the backlog to implement the remaining missing UC 36 to the end")
---
# NEW-049-1 A hand-over the product cannot take yet links where its job workflow and CI secrets are set up

**REGISTER**

## Outcome

UC-049.md:151-152: "**4c. The product has no job workflow or no CI secrets yet.** Nothing is handed over; the conversation
says what is missing and links setting it up (UC-010)."

Built today: nothing is handed over, and the reason is named — `src/runtimes/routes.mjs:42` refuses the CI route with
"the product has no Agent M job workflow yet: add …", and a run without its secret ends `not run`, naming the secret
(MOD-runtimes.md:227-228). The bar shows the reason as text and links nothing: `src/prompt-bar/bar.mjs` sets a link only
for a run's address (`:42`) and goes only to the draft's route (`:244`).

**Waits for a draft for akmaier.** Once MOD-prompt-bar names where such a refusal leads, the bar shows the link beside the
reason, through the `go` the frame hands it.

## Acceptance

- A hand-over refused for a missing job workflow, and a run ended `not run` for a missing secret, each show the reason and
  a link to the place the accepted text names; a test clicks it and finds `go` called with that route.
- Counter-proof: a refusal for another reason (a requirement not accepted) shows no such link.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
````

## Added at ITM-961's pre-gate (#930, head 14bec871), by po-opus-b

Three gaps found by developer-sonnet-i and checked on the branch. Each waits for a free item number. MOD-desktop-shell
touches team 1 (as NEW-044-7).

- **NEW-044-16 — READY — MOD-desktop-shell: the Bridge reads `build.json` and `update-key.pem` at start.**
  - MOD-desktop-shell.md:132-136 and :197 have the app read its resources `build.json` and `update-key.pem`.
  - `src/desktop-shell/main.mjs:13-16` reads `--instance`, `--origin` and `--data-folder` from the command line only, and
    throws a `TypeError` without `--instance`.
  - So a packaged app started as a person starts it, without arguments, ends at once. ITM-961's real build (TST-961006)
    and its tunnel check cannot pass until this is built.
- **NEW-044-17 — READY — MOD-desktop-shell: the icons.** MOD-desktop-shell.md:82 has `icons/` hold "the app's icon for each
  platform, and the icon of the menu bar and the tray". `appDescription.icons` names `icons/macos.png`,
  `icons/windows.png` and `icons/linux.png`, but `src/desktop-shell/icons/` does not exist.
- **NEW-044-18 — the overnight run of the real Bridge build.** TST-961006 runs only with `BRIDGE_BUILD_REAL=1` on Linux.
  No workflow sets it (`.github/workflows/nightly.yml`), and Linux needs a display (xvfb) for the packaged app. Whether
  macOS Electron's `appData` follows `$HOME` is not verified. This is wiring of the nightly run (MOD-test-schedule, held by
  team 1), or a change between jobs.

## The drafts for the NEEDS-ARCH proposals (po-opus-b, 2026-10-18)

Each NEEDS-ARCH proposal above has its architecture drafted for akmaier, with no approval record. A proposal becomes READY
once its draft is accepted, and is then registered from ITM-1001 on.

| Draft | Modules | Proposals |
|---|---|---|
| `01ef6da1`, `66ee0c57` | MOD-endpoint-calls, MOD-bridge-http, MOD-bridge-jobs, MOD-bridge-client | NEW-040-2 (ITM-960) |
| `b085c774` | MOD-runtimes, MOD-main-page, MOD-job-ledger, MOD-browser-store | NEW-036-3, NEW-036-5, NEW-036-8, NEW-036-9 |
| `48002942` | MOD-job-catalogue, MOD-mail-handling, MOD-maintenance-pages | NEW-039-4 |
| `ac0889c6` | MOD-reuse-facts, MOD-browser-store, MOD-resource-list, MOD-job-catalogue, MOD-settings-pages | NEW-040-6 to NEW-040-10 |
| `7cecd3d3` | MOD-work-plans, MOD-workflow-entries, MOD-bridge-jobs, MOD-implementation-pages | NEW-041-5, NEW-041-6, NEW-041-7, NEW-045-4 |
| `f29fb96e` | MOD-run-planner, MOD-implementation-pages, MOD-workflow-entries, MOD-bridge-jobs | NEW-043-12 |
| `3d7b6767` | MOD-agent-processes, MOD-bridge-http, MOD-desktop-shell | NEW-044-13, NEW-044-14 |
| `cb78445a` | MOD-implementation-pages, MOD-prompt-bar | NEW-048-3, NEW-049-1 |
