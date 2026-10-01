# Release tests of sprint 02, strand D — results, counter-proofs, findings (ITM-145)

**MESSUNG** — 2026-10-02, branch `team/ITM-145` from `sprint/02` at `a22de0a` (the merge of pull request #60, ITM-134 — the last
item of strand D), brought forward to `50441e2` (pull requests #62 and #63, the release tests of strands B and A; no file under
`docs/assets/` and not `tests/app-harness.mjs` changed in between), macOS, Node 25.9.0, Python 3.14.6. CI runs Node 22
(`.github/workflows/tests.yml`).

**Author.** `tester-opus` (claude-opus-5-5), the Release tester of `docs/process.md`, who implemented none of ITM-125, ITM-131,
ITM-132, ITM-050, ITM-018 and ITM-134 (`RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER`). Every expectation was written from the
texts of UC-001, UC-006, UC-008, UC-020, UC-025 and UC-042, the SPEC rules the six items realise, and the items' *Outcome* where
ITM-145 points to it. The code was read only to learn how to drive it (which function, which control, which request the page
makes); the implementers' tests and measurement records were read after the release tests were written — their test names for
the overlaps below, and the findings sections to know whether D1 was already recorded (it was not).

## Files and commands

| File | Module | Level | Cases |
|---|---|---|---|
| `tests/release-sprint-02-d-settings-store.test.mjs` | MOD-settings-store | release | 2 green |
| `tests/release-sprint-02-d-dashboard-app.test.mjs` | MOD-dashboard-app | release | 16 (15 green, 1 todo = finding D1) |
| `tests/release-sprint-02-d-traceability.test.mjs` | MOD-traceability | release | 8 (7 green, 1 todo = finding D1) |
| `tests/test_release_sprint_02_d.py` | none (ARC-020 decision 5, as ITM-050's checks) | release | 7 green |

Commands, on the branch with these four files at `50441e2`: `cd tests && python3 -m unittest` → `Ran 361 tests … OK (expected
failures=6)` (7 of them these); `node --test tests/*.test.mjs` → `tests 494, pass 479, fail 0, todo 15` (26 of them these, 2 of
the todo). The same counts on `a22de0a` with these files, less strands A's and B's: Python 361, node 420 — 410 pass, 10 todo.

How the code is driven: the dashboard runs in `tests/app-harness.mjs` — its real views, page loads and clicks —, GitHub's API
served from a fixture repository written in the test file (the instance's own artifacts of a made-up "Thesis tool": a SPEC in the
SPEC's own form of a requirement, one change queue of three entries, use cases, a decision, two modules, tests with their header
lines), and a product repository to add served beside it; GitHub's contents API answers a request for JSON with the file's blob
SHA, as GitHub documents it. MOD-traceability's functions are called on a fixture map of path to text and once on the tracked
files of this repository, read with node's `fs` — all but Agent M's own `SPEC.md`, which no test opens (ITM-128; the watcher of
`tests/test_release_sprint_02_c.py` stays green). ITM-050's three checks are run as CI runs them, on a copy of this repository —
every tracked file in a temporary git repository of its own, a placeholder in place of `SPEC.md` — first as it is, then with one
planted violation at a time; each check module runs without its own `counter_proof` tests, which read planted texts, not the
repository. About 8 seconds of the Python step.

## The tests, with the rule or flow each was written from, and their counter-proofs

A mutation replaced texts in one code file (MD16: two places in one file); the release file that guards it then ran (`node --test
--test-reporter=tap`, or `python3 -m unittest -v`), and the file was restored byte for byte —
`scratchpad/itm145-tester-opus/mutate.txt` (not committed). Before and after the series every green case was green. A case
marked todo is red on the increment itself — that is its red result.

| # | Case | Rule or flow it is written from | Item | Red under |
|---|---|---|---|---|
| | **`release-sprint-02-d-settings-store.test.mjs`** | | | |
| 1 | the GitHub token's grant names commits, issues, pull requests and workflow runs, under the person's account; every write permission of the one list has its word | ONE GITHUB TOKEN SERVES EVERY FEATURE · AN EXPORT STATES THAT IT CONTAINS SECRETS | ITM-125 | MS1 |
| 2 | every key the store writes is named; every secret states what it grants — the GitLab token its project, a session's token its session | AN EXPORT STATES THAT IT CONTAINS SECRETS | ITM-125 | MS2 |
| | **`release-sprint-02-d-dashboard-app.test.mjs`** | | | |
| 3 | the settings page's notice before *Export settings* names the GitHub token with pull requests; a stored GitLab project token with its grant; with nothing stored, no GitHub token claimed | AN EXPORT STATES THAT IT CONTAINS SECRETS · UC-042 6 | ITM-125 | MS1, MS2, MD1 |
| 4 | a use case changed after the editor opened: *Save* writes nothing, the edit stays in the textarea, the newer text is shown beside it, the refusal says it changed | A REFUSED SAVE KEEPS THE EDIT · A SAVE IS REFUSED WHEN THE TEXT CHANGED MEANWHILE · UC-008 3a | ITM-131 | MD2, MD3, MD4, MD5, MD6 |
| 5 | the same for an architecture decision | same | ITM-131 | MD2–MD6 |
| 6 | the same for a module | same | ITM-131 | MD2–MD6 |
| 7 | the same for a SPEC change proposal on the SPEC changes page | same · UC-006 3a | ITM-131 | MD2–MD6 |
| 8 | without a commit meanwhile, *Save* writes one commit of exactly the edited text; no newer version shown | UC-008 3a | ITM-131 | MD6 |
| 9 | *Check* on an address GitHub answers 404 for: says so, links `https://github.com/new`, with a folded *What is this?*; nothing written; an existing repository gets no such link | UC-001 2a · EVERY STEP EXPLAINS ITSELF | ITM-132 | MD7, MD8, MD11 |
| 10 | *Add product* on that address: the link, nothing written, the address not in the browser's list | UC-001 2a | ITM-132 | MD7 |
| 11 | after *Check* on a private repository the key reads, Step A is shown as done and asks nothing on GitHub; before *Check*, after a 404, and for a public repository (step 4) it keeps its instructions | UC-001 3a, step 4 | ITM-132 | MD9, MD10 |
| 12 | with the key reaching the product, one click on *Add product* writes the layout in one commit (SPEC.md, CHANGELOG.md, the use-case, approval and queue folders), keeps the README, lists the address in the browser, writes nothing into the instance | ONE CLICK PER DECISION · UC-001 3a, postcondition | ITM-132 | MD12 |
| 13 | every step — just typed, Step A done, the repository missing — and the address field carry a folded *What is this?* with text | EVERY STEP EXPLAINS ITSELF | ITM-132 | MD8, MD9, MD11, MD13 |
| 14 | an entry changing TITLE lists UC-001, UC-002, MOD-cover, `tests/title.test.mjs` before *Accept*; not UC-003 (a longer name), not a test of another requirement — with a token | A REQUIREMENT IS NOT CHANGED WITHOUT AN IMPACT LIST · UC-006 3b | ITM-134 | MD16, MD17 |
| 15 | the same without a token, before the GitHub path | same · UC-006 4b | ITM-134 | MD16, MD17 |
| 16 | an entry repeating a requirement word for word and adding a new one shows no impact list, not even an empty one | UC-006 3b | ITM-134 | MD15 |
| 17 | an entry withdrawing EXPORT IS A PDF lists what still names it — UC-001, ARC-001, MOD-exporter, `tests/export.test.mjs` — before *Accept* | UC-006 3b | ITM-134 | MD14, MD16, MD17 |
| 18 | an entry that takes TITLE out of its section — renamed in place, or left out — lists what references TITLE before *Accept* | A REQUIREMENT IS NOT CHANGED WITHOUT AN IMPACT LIST · UC-006 3b, step 6 | ITM-134 | **todo — finding D1** |
| | **`release-sprint-02-d-traceability.test.mjs`** | | | |
| 19 | what traces to TITLE — source, two use cases, module, two tests, entry 01 as a change — and to PDF its decision; an added name proposed, a repeated one not; an applied entry proposes nothing; a matrix file kept by hand changes nothing; an edited use case is seen at once; the same files give the same graph | THE TRACEABILITY MATRIX IS DERIVED · UC-020 3, 5 | ITM-018 | MG1, MG2, MG3, MG11 |
| 20 | renumbered sections, a moved requirement and a renamed use-case file change no edge; "§2", "SPEC.md §2", "SPEC.md:12" link to nothing and are kept as unknown names | A REFERENCE NAMES THE IDENTIFIER, NOT THE POSITION | ITM-018 | MG3, MG13 |
| 21 | unrealised SERIF, UC-003 realising nothing, OLD EXPORT unknown with the withdrawal note (from UC-002, MOD-legacy, a test), PRINT IN COLOUR without it, SERIF untested; the graph still answers; no gaps — empty lists | UNREALISED REQUIREMENTS ARE REPORTED, NOT FORBIDDEN · UC-020 7, 5b, 7a | ITM-018 | MG3, MG4, MG5 |
| 22 | module rows with status, code and tests; every gap of UC-025 4 incl. two modules in one file (3a) and withdrawn names (4b) — a requirement, a decision, a module | MODULE GAPS ARE REPORTED, NOT FORBIDDEN · UC-025 3, 4, 3a, 4b | ITM-018 | MG6, MG7, MG12 |
| 23 | the impact list of TITLE, of PDF, of the withdrawn OLD EXPORT; nothing for a name nothing states; not the longer name | A REQUIREMENT IS NOT CHANGED WITHOUT AN IMPACT LIST | ITM-018 | MG3, MG8 |
| 24 | an entry whose section no longer states TITLE touches TITLE (change or withdrawal) | A REQUIREMENT IS NOT CHANGED WITHOUT AN IMPACT LIST · UC-020 3 | ITM-018 | **todo — finding D1** |
| 25 | a decision's change lists the modules following it with code and tests, and the names kept, added, removed; a module's change lists the user of a removed interface first as broken, the user of an altered one, the module itself; an unchanged one affects no user | AN ARCHITECTURE CHANGE IS NOT ACCEPTED WITHOUT AN IMPACT LIST · UC-023 | ITM-018 | MG9, MG10 |
| 26 | this repository's commit: the same graph twice; use cases, decisions, modules, code, tests present; no edge to a position; every edge to an identifier; every unknown name with its note and what names it; gaps and rows are lists | THE TRACEABILITY MATRIX IS DERIVED · A REFERENCE NAMES THE IDENTIFIER, NOT THE POSITION · both REPORTED, NOT FORBIDDEN | ITM-018 | MG11 |
| | **`test_release_sprint_02_d.py`** | | | |
| 27 | the copy of the repository passes all three checks | NO SERVER · ARTIFACTS ARE MARKDOWN · THE PRODUCT REPOSITORY IS SELF-SUFFICIENT | ITM-050 | MP2, MP7, MP8 |
| 28 | NO SERVER refuses a beacon to an analytics host, a CDN script in the page, a tracker image in a served Markdown file — each named | NO SERVER | ITM-050 | MP1 |
| 29 | NO SERVER passes a view naming GitHub's API, Microsoft Graph and the local bridge, reading through the git host | NO SERVER | ITM-050 | MP2 |
| 30 | ARTIFACTS ARE MARKDOWN refuses an SVG diagram, a PlantUML block in a use case, a JSON approval record, Agent M's writer putting an image diagram into a new product's SPEC | ARTIFACTS ARE MARKDOWN | ITM-050 | MP3, MP4, MP7 |
| 31 | ARTIFACTS ARE MARKDOWN passes a Mermaid diagram | ARTIFACTS ARE MARKDOWN | ITM-050 | MP7 |
| 32 | SELF-SUFFICIENT refuses Agent M's writer naming `tools/apply_approvals.py` or linking the dashboard's address in a new product's SPEC | THE PRODUCT REPOSITORY IS SELF-SUFFICIENT | ITM-050 | MP5, MP6 |
| 33 | SELF-SUFFICIENT passes the writer naming the product's own folder | THE PRODUCT REPOSITORY IS SELF-SUFFICIENT | ITM-050 | MP8 |

The mutations:

| Id | File | Planted fault |
|---|---|---|
| MS1 | `settings-store.mjs` | the GitHub token's grant of before ITM-125: "commits, issues and workflow runs" |
| MS2 | `settings-store.mjs` | the GitLab project tokens' grant is empty |
| MD1 | `dashboard/settings-view.mjs` | the export notice names only the GitHub token |
| MD2 | `dashboard/review-views.mjs` | a refused save does not show the newer version |
| MD3 | `dashboard/review-views.mjs` | the "newer version" shown is the edit itself |
| MD4 | `dashboard/review-views.mjs` | a refused save reloads the view, dropping the edit |
| MD5 | `dashboard/review-views.mjs` | Save sends no expected blob — the write is not refused |
| MD6 | `dashboard/review-views.mjs` | Save writes the opened text, not the edit |
| MD7 | `dashboard/add-product-view.mjs` | the page for a new repository is `https://github.com/` |
| MD8 | `dashboard/add-product-view.mjs` | *Check* on a 404 shows only the error line |
| MD9 | `dashboard/add-product-view.mjs` | Step A is never shown as done |
| MD10 | `dashboard/add-product-view.mjs` | Step A is shown as done for a public repository too |
| MD11 | `dashboard/add-product-view.mjs` | the missing-repository answer has no folded explanation |
| MD12 | `dashboard/writes.mjs` | Add product does not list the GitHub product in the browser |
| MD13 | `dashboard-app.mjs` | `stepHtml` renders Step B without its explanation |
| MD14 | `dashboard/spec-changes-view.mjs` | a withdrawal does not count as touching |
| MD15 | `dashboard/spec-changes-view.mjs` | an added requirement counts as touching |
| MD16 | `dashboard/spec-changes-view.mjs` | the impact list stands after the Accept panel |
| MD17 | `dashboard/spec-changes-view.mjs` | the tests are not read for the impact list |
| MG1 | `traceability/graph.mjs` | `tracesTo` gives no proposals |
| MG2 | `traceability/graph.mjs` | `tracesTo` keeps its first answer per name (a stored matrix) |
| MG3 | `traceability/graph.mjs` | a use case's edges start at its file path, not its identifier |
| MG4 | `traceability/graph.mjs` | no unknown name carries the withdrawal note |
| MG5 | `traceability/graph.mjs` | `coverageGaps` lists no unrealised requirement |
| MG6 | `traceability/graph.mjs` | a file naming two modules is no gap |
| MG7 | `traceability/graph.mjs` | a test guarding what its module does not realise is no gap |
| MG8 | `traceability/graph.mjs` | the impact list leaves out the tests |
| MG9 | `traceability.mjs` | the user of a removed interface is not marked broken |
| MG10 | `traceability.mjs` | an altered interface affects no user |
| MG11 | `traceability/graph.mjs` | each graph carries a running number — two builds differ |
| MG12 | `traceability/graph.mjs` | a withdrawn decision or module is not remembered as withdrawn |
| MG13 | `traceability/graph.mjs` | a name with "§" or ending in ":<line>" is dropped from the unknown names |
| MP1 | `tests/test_no_backend.py` | `markdown_loads` finds nothing |
| MP2 | `tests/test_no_backend.py` | `api.github.com` is not a permitted host |
| MP3 | `tests/test_artifact_format.py` | no fenced language counts as another diagram language |
| MP4 | `tests/test_artifact_format.py` | a file that is not `.md` is not reported |
| MP5 | `tests/test_self_sufficient.py` | no address is a service of Agent M |
| MP6 | `tests/test_self_sufficient.py` | no path is reported |
| MP7 | `tests/test_artifact_format.py` | `mermaid` counts as another diagram language |
| MP8 | `tests/test_self_sufficient.py` | a path counts as Agent M's even when the product holds it too |

Three weak first versions were repaired before this record: (1) the Step A of cases 11 and 13 was first read from the steps'
HTML, which the harness does not update when the view redraws Step A in an element of its own — red on a view that was right; it
is now read from that element. (2) The Python cases first ran each check module whole: under MP6 the module's own counter-proof
test went red, so case 32 was "refused" for the wrong reason and stayed green; the checks now run without their `counter_proof`
tests, and MP6 turns case 32 red. (3) Case 16 first asserted only that no artifact is named; an empty list for an added
requirement (MD15) would have passed — it now also asserts that no impact list stands on the page.

## Finding

A rule or acceptance criterion of a strand-D item that the code on `sprint/02` does not keep. It stays marked in both test files
with its item; the strand's developer takes the items up again, red first, and the gate *Release testing → Sprint review* for
strand D is decided only when no mark is left (ITM-145, *Kind and level*).

**D1 — an entry that takes a requirement out of its section shows no impact list (back to Development: ITM-134, ITM-018).**
UC-006 3b: "The change touches an existing requirement. The dashboard lists the artifacts that reference its name before the
reviewer decides." `A REQUIREMENT IS NOT CHANGED WITHOUT AN IMPACT LIST`: "Before an existing requirement is changed, the
artifacts that reference it are listed." UC-006 step 6 replaces the entry's section byte for byte, so an entry for
`## 2. Title page` whose text states THE TITLE PAGE NAMES THE AUTHOR AND THE SUPERVISOR (TITLE renamed in place) — or no
requirement at all — takes TITLE out of the SPEC when accepted, without a withdrawal note, while UC-001, UC-002, MOD-cover and
`tests/title.test.mjs` still name it. Path:
`dashboard/spec-changes-view.mjs` `viewSpecEntry` → `:125` `entryImpact` → `:129` `touchedBy(linkGraph({ files: own, status }),
e.proposalPath)` → `traceability/graph.mjs:78` `isQueueEntry` → `:84` `for (const r of parseRequirements(text(path)).values())` —
only the names the entry's text states → `:86` TITLE is not among them: no edge; the new name is not in the SPEC: `"add"` → `:89`
`edge(path, name, "proposes", { change: "add" })` → `spec-changes-view.mjs:122` `touchedBy` keeps `change` and `withdraw` only →
`[]` → `:129` returns `[]` → `:200` `impact.list.length || impact.error ? specImpactHtml(impact) : ""` → no list, and *Accept* is
offered. Ist (measured, `scratchpad/itm145-tester-opus/probe-rename.mjs`): renamed — the entry's `proposes` edges are
`[{ to: "THE TITLE PAGE NAMES THE AUTHOR AND THE SUPERVISOR", change: "add" }]`; left out — `[]`; `requirementImpact(graph, TITLE)`
lists UC-001 all the while. Soll: an edge to TITLE as a change or a withdrawal, and on the page UC-001, UC-002, MOD-cover and
`tests/title.test.mjs` before *Accept*. Cases 18 and 24. Where the fix lies is not decided here: the graph does not read the queue
index, so it cannot know which section an entry replaces; the view does (`e.current`, the section the entry replaces, from
`sectionForEntry`) and could count every requirement of the current section that the entry no longer states. The dashboard's own
editor proposes a rename as a withdrawal and an addition (`A RENAMED REQUIREMENT IS WITHDRAWN AND ADDED`); an entry written
elsewhere — by hand, as Agent M's own queues are, or by a CI agent (`A CI AGENT'S DRAFT ENTERS AS OPEN`) — need not be, and those
are the entries a reviewer sees on this page.

## Readings where the documents were open

1. **UC-006 3b, "touches an existing requirement"** — read to include an entry that takes a requirement out of its section
   without naming it again (D1), since accepting it changes the SPEC's set of requirements as a withdrawal does.
2. **"before the reviewer decides"** (UC-006 3b) — read as: on the entry's page, above the *Accept* control; without a token,
   above the GitHub path that accepts there.
3. **UC-001 3a, "Step A is shown as done"** — read with step 4 ("for a *public* repository a read succeeds even without the
   token's permission"): done after *Check* when the key read a private repository; for a public one Step A is not called done and
   the line says write access is confirmed by the first write. Not asked: Step A done before *Check*.
4. **ONE GITHUB TOKEN SERVES EVERY FEATURE** — the write each permission carries, as the grant must name it: Contents — commits;
   Issues — issues; Pull requests — pull requests; Actions — workflow runs; Workflows — commits to the CI configuration (covered by
   "commits").
5. **AN EXPORT STATES THAT IT CONTAINS SECRETS, "every token, key and password it holds"** — the three secrets the store writes
   today; model keys, the bridge's token and the mailbox password are not stored yet (their items are not built).
6. **NO SERVER, "the package registries and resource hosts the page names before it calls them"** — no such host is called
   today; the check permits none, and no case asks for one named before a call.
7. **AN ARCHITECTURE CHANGE IS NOT ACCEPTED WITHOUT AN IMPACT LIST, "requirements that reference it"** — read as the names that
   force the decision, before and after the change.
8. **UC-020 step 7, "requirements realised by no use case"** — the SPEC's; whether a requirement only an open entry proposes is
   listed as unrealised is not asserted either way.
9. **The graph "over this repository"** (ITM-145) — built without Agent M's own `SPEC.md` (ITM-128; the Scrum Master's reading
   lets a whole-repository scan include it, but the node watcher of `tests/test_release_sprint_02_c.py`, case 25, counts any
   open), so this repository's requirements enter only as its queue entries state them; the case asserts what every graph owes,
   no value read from a file.
10. **ITM-050's checks "pass the repository"** — run on a copy of every tracked file with a placeholder in place of `SPEC.md`,
    each without its own counter-proof tests (they read planted texts, not the repository).

## Known findings not re-tested

- **R1** (Add product writes no `docs/architecture/`), **R2**, **R3** — case 12 asks for the other layout folders and leaves
  `docs/architecture/` out.
- **F1–F3, V1, G1, G2, C1, S1** — not in this strand's flows. S1's two Python readers of `SPEC.md` are not added to: no file of
  this item opens it.
- **A1–A5** (strand A, merged meanwhile) — none concerns a flow of this strand.

## Not covered

- A refused save of a **GitLab** product (`commitFilesGitLab` refuses with the same text, the view is the same) — it would need a
  fake GitLab server for tree, files and commits; not built for this item.
- A save refused because the branch moved between reading its head and writing (a fast-forward refused, `422`): the edit stays,
  no newer version is shown; whether that is "a refused save" of the rule was not decided here.

## Overlaps with the implementers' tests

Read after the cases were written. Cases 1–3 overlap `tests/test_settings_disclosure.py` (`test_the_github_grant_names_every_write_of_the_one_token`,
`test_the_notice_names_each_secret_and_what_it_grants`); cases 4–8 overlap `tests/review-core.d/refused-save.test.mjs` (a use case
and a proposal; the decision and the module are new here, as is the main path); cases 9–11 overlap `tests/dashboard-add-product.test.mjs`
(2a at Check and at Add product, 3a done, a 404 and a public repository); cases 12 and 13 are new; cases 14–17 overlap
`tests/dashboard-spec-impact.test.mjs` (change, add, withdrawal; the no-token route is new); cases 19–25 overlap
`tests/test_matrix_derived.py`, `tests/test_references.py`, `tests/test_coverage_report.py` and `tests/test_impact_list.py`
(withdrawn decisions and modules, a rename of a use-case file and an applied entry are new); case 26 and cases 27–33 are new —
ITM-050's own counter-proofs run the checks' readers on planted texts, these run the checks on a planted repository. D1 (cases 18,
24) is covered by none.
