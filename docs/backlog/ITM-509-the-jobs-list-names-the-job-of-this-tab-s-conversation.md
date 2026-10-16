---
id: ITM-509
title: The main page's list of every job, with the job of this tab's conversation
level: module
realises:
  - UC-046
  - UC-049
  - ONE DASHBOARD SHOWS EVERY JOB
  - PROGRESS AND JOB STATE ARE DERIVED, NOT STORED
modules:
  - MOD-main-page
builds_on:
  - ITM-500
  - ITM-504
  - ITM-506
  - ITM-535
  - ITM-545
tests:
  - unit
origin:
  - the architecture of the prompt bar, accepted by akmaier at 7e893c63 (110d2499)
  - MOD-main-page, Interfaces: view (`jobs`, strategies)
  - sprint team1/47: MOD-main-page has no code (`src/main-page/` does not exist), so this item builds the module, cut to the route `jobs`
---
# ITM-509 The main page's list of every job, with the job of this tab's conversation

**REGISTER**

## Outcome

MOD-main-page's first code, cut to what the list of every job needs. The routes `home` and `job`, the stage bars, what
waits for a person, and reading the states again at an interval are later items. `src/main-page/` does not exist yet.
- **The files.** `src/main-page/index.mjs` provides `view` = `{ routes: [jobs], strategies: [sourceStrategies] }`
  (MOD-main-page, Parts and Interfaces). `src/main-page/jobs.mjs` holds the route.
- **The route `jobs`.** Its `entry` is `null`: the main page's routes are not among the menu's eight entries
  (MOD-site-frame, Route). Its title is "Every job". It keeps the frame's default subject.
- **The list** holds every job of every product and of the instance (`ONE DASHBOARD SHOWS EVERY JOB`):
  - **The sources.** The instance's repository, and each address of the setting `products` (`readSetting`). Each is
    connected with `connect(parseAddress(address), { token, tokenName })`. The token is the one MOD-browser-store's
    catalogue keeps for it: `github-token:<owner>/<repository>` or `gitlab-token:<server>/<project>` for a product, and
    `github-token` for the instance, as `chosenProduct` connects a product.
  - **The jobs.** Each source's default branch is read with `readSnapshot`. Its jobs come from
    `listJobs(products, live)` (MOD-job-ledger), which derives each row's state, elapsed time and cost and puts the
    jobs waiting at a gate first. The page computes no state of its own (`PROGRESS AND JOB STATE ARE DERIVED, NOT
    STORED`).
  - **The live states.** Each job whose record has no end is asked once, when the list is drawn, with `liveState(record,
    { host }, bridges)` (MOD-runtimes). `bridges` holds a handle (`bridgeAt`) for each Bridge a record's `by:` names and
    this browser keeps under `bridge:<name>`. A live state that is not reachable is shown as its reason, never an error.
  - **A row** shows the identifier, the product's address, what it works on, the kind, the participant, where it runs,
    the state, the elapsed time and the cost:
    - "where it runs" is the record's `## Taken` `by:`, or "not taken";
    - the elapsed time is in hours, minutes and seconds;
    - the cost is shown where `jobCost` knows it, and "unknown" otherwise (`NO COST IS GUESSED`).
  - **This tab's conversation.** Where `currentJob()` (MOD-prompt-bar) gives a running message, it is listed first among
    the rows that do not wait at a gate. It shows as "this tab's", with its kind, participant and the time since it
    started, in the state `running`, and with no identifier, since it has no record. Once it has ended it is no longer
    listed.
  - **A source that cannot be read** is named above the list, with its address and the reason its host gives.
  - **The filters.** Four filters narrow the list: product, state, participant and where it runs. Each offers "all" and
    the values the rows hold.
- **The strategies.** The view hands the frame `[sourceStrategies]` (MOD-source-register), so that a conversation on the
  main page receives the book's chapters of its page.
- **Not in this item.** `index.html` still loads the old home page. Loading the main page through the frame's
  `start.mjs` belongs to the item that builds `home`, and waits for akmaier's acceptance of ITM-534's draft
  (`300ec0c1`).

No existing test's expected result changes: no test names MOD-main-page.

## Acceptance

- **A full list.** In a small DOM, with fixture hosts for the instance and two products, the route lists every job of
  the three. Waiting jobs come first, and each row has the fields above. A job's cost is "unknown" where it is not
  known.
- **This tab's job.** A running message of this tab is listed as this tab's, and is gone once it has ended.
- **An unreadable source.** A product whose repository cannot be read is named with its reason, and the others are
  still listed.
- **An unreachable runtime.** A live state that is not reachable shows its reason.
- **The filters.** Each of the four filters narrows the rows.
- **The view.** Its strategies are `[sourceStrategies]`.
- **No requests leave.** The tests run under a `fetch` spy, and no request leaves the fixtures.
- **Tests first.** The first commit holds only the tests, and CI is red on it. No stub is committed.
- **Expected values in the tests.** Each test states its expected values in its own text.
