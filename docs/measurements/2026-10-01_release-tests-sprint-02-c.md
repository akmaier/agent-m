# Release tests of sprint 02, strand C — results, counter-proofs, findings (ITM-144)

**MESSUNG** — 2026-10-01, branch `team/ITM-144` from `sprint/02` at `a7b4b9f` (pull request #55 merged: every item of strand C —
ITM-127 #43, ITM-128 #46, ITM-146 #49, ITM-014 #52, ITM-016 #55 — is in it), macOS, Node 25.9.0, Python 3.14.6. CI runs Node 22
(`.github/workflows/tests.yml`).

**Author.** `tester-opus` (claude-opus-5-5), the Release tester of `docs/process.md`, who implemented none of the strand's items
(`RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER`). Every expectation was written from the texts of the SPEC rules and use cases
the five items realise (UC-006, UC-022, UC-032 and the rules ITM-144 lists) and from the items' *Outcome* where ITM-144 points to it.
The code was read only to learn how to drive it (which function, which port, which argument shape); the implementers' tests and
measurement records were not read before the release tests were written — only the findings sections of
`2026-10-01_approval-gates-counter-proofs.md` and `2026-10-01_apply-approvals-in-the-engine.md`, to know F1–F3, V1, G1 and G2 and
not to contradict them —, and their test names were read afterwards, for the overlaps below.

## Files and commands

| File | Module | Level | Cases |
|---|---|---|---|
| `tests/release-sprint-02-c-artifacts.test.mjs` | MOD-artifacts | release | 6 (5 green, 1 todo = finding C1) |
| `tests/release-sprint-02-c-review-core.test.mjs` | MOD-review-core | release | 12 (10 green, 2 todo = G1, G2) |
| `tests/release-sprint-02-c-git-host.test.mjs` | MOD-git-host | release | 5 green |
| `tests/test_release_sprint_02_c.py` | MOD-artifacts | release | 3 (2 green, 1 expected failure = finding S1) |

Commands, on the branch with these four files: `cd tests && python3 -m unittest` → `Ran 331 tests … OK (expected failures=6)`
(328, 5 before); `node --test tests/*.test.mjs` → `tests 366, pass 358, fail 0, todo 8` (343, 338, 5 before).

How the code is driven: the kernel functions with fixture texts written in the test files — a made-up product "Thesis tool", its
SPEC in the SPEC's own form of a requirement, one change queue, a use case, a decision, a module — never Agent M's `SPEC.md`. The
approval engine reads through its ports from a map of path to text; where git history is the evidence, the fixture is committed
in a temporary git repository. `tools/apply_approvals.py` is run on a temporary copy, its clock fixed to the same minute as the
engine's. The pull requests are read from fake GitHub and GitLab servers in the test file that answer as the two APIs are
documented to answer; no request leaves the process. `tests/test_release_sprint_02_c.py` runs both suites once more with a
watcher in every Python process (an audit hook through `sitecustomize`) and every node process (a module loaded through
`NODE_OPTIONS`); it costs about 70 seconds of the Python step.

## The tests, with the rule or flow each was written from, and their counter-proofs

A mutation replaced one text in one code file (MR4: inserted one line; MA5: one expression); the release file that guards it then
ran (`node --test --test-reporter=tap`), and the file was restored — `scratchpad/itm144-tester-opus/mutate.txt` and `mutate_py.txt`
(not committed). Before and after the series every green case was green. A case marked todo or expected-failure is red on the
increment itself — that is its red result.

| # | Case | Rule or flow it is written from | Item | Red under |
|---|---|---|---|---|
| | **`release-sprint-02-c-artifacts.test.mjs`** | | | |
| 1 | a source named as it is written, with its date — a person, a book, a wrapped source — gives no finding | A REQUIREMENT HAS A REGISTERED SOURCE (as read by akmaier, 2026-10-01) | ITM-127 | MA1 |
| 2 | an SRC- the product does not link is an error at the requirement's name and line; linked, it passes | A REQUIREMENT HAS A REGISTERED SOURCE | ITM-127 | MA2 |
| 3 | a RES- entry named as source is an error | A RESOURCE'S TERMS ENTER AS A SOURCE | ITM-127 | MA3 |
| 4 | a source without a date, an empty source, a date alone: each an error; the dated one passes | A REQUIREMENT HAS FIVE FIELDS | ITM-127 | MA4 (MA1) |
| 5 | a requirement written without any source is an error | A REQUIREMENT HAS FIVE FIELDS | ITM-127 | **todo — finding C1** |
| 6 | the reader: a withdrawn requirement is marked, also with a wrapped source; bold prose and a quoted name are no requirement | UC-022 10a · ARCHITECTURE RESTS ON ACCEPTED ARTIFACTS | ITM-128 | MA5 |
| | **`release-sprint-02-c-review-core.test.mjs`** | | | |
| 7 | nothing written without an acceptance; an acceptance writes SPEC.md with its record and decision row, no byte outside its section — the CR LF of another section kept — on the dashboard's and the workflow's route | A SPECIFICATION CHANGE IS APPROVED BEFORE IT IS WRITTEN · UC-006 4–6 | ITM-014 | MR1 |
| 8 | the approved text stands byte for byte — tab, trailing blanks, quotes, dash, umlauts, an emoji, CR LF inside — on both routes | THE APPROVED TEXT IS TAKEN VERBATIM | ITM-014 | MR2 |
| 9 | the current text beside a proposal is the section byte for byte; for an entry whose heading another creates, the text after it, naming it; an approval of another current text writes nothing | NO PROPOSAL WITHOUT THE CURRENT TEXT BESIDE IT · UC-006 2 | ITM-014 | MR3 (MR7) |
| 10 | an acceptance commit holds SPEC.md, the record and the row only; `git show HEAD^:SPEC.md` holds the replaced section, whose blob the record names; no tracked file keeps it | THE REPLACED TEXT STAYS REACHABLE · UC-006 postcondition | ITM-014 | MR4 |
| 11 | use case, decision, module: open without a record (from the records and from the names in the tree), not accepted with a record of an earlier text, accepted with one of the current text; a SPEC proposal: open → not approved → approved | A GENERATED ARTIFACT IS A PROPOSAL · A REVIEWED ARTIFACT ENTERS THE DEFAULT BRANCH AS OPEN | ITM-014 | MR5 |
| 12 | job, approval, gate and test result records are no reviewed kind of file; a use case is | A RECORD IS EVIDENCE, NOT A PROPOSAL | ITM-014 | MR6 |
| 13 | a job record without approval is not open; a use case without approval is | A RECORD IS EVIDENCE, NOT A PROPOSAL (its check, word for word) | ITM-014 | **todo — G1** |
| 14 | an acceptance handed a job record writes no approval record for it | A RECORD IS EVIDENCE, NOT A PROPOSAL | ITM-014 | **todo — G2** |
| 15 | proposal or section changed after approval, a missing field, another anchor, a proposal outside the queue, an entry the queue lacks: refused under the record's name, nothing written; an applied record and a use case's record passed over | A STALE APPROVAL IS NOT APPLIED · UC-006 4c, 5a | ITM-016 | MR7 |
| 16 | several records in one run: 01 and 02 written in the order of their names, two rows; a stale third refused beside them | UC-006 4c, 4d · postcondition | ITM-016 | MR8 (MR2, MR3) |
| 17 | the same records on the same tree: applyApprovals and `tools/apply_approvals.py` give the same files, bytes and report, and refuse alike | WITHOUT A TOKEN, THE INSTANCE'S WORKFLOW WRITES THE CHANGE ("byte for byte as tools/apply_approvals.py") | ITM-016 | MR9 (MR2, MR8) |
| 18 | a decision naming a withdrawn requirement, a bold-prose name or an open use case lists it and is not accepted, naming it; naming what is accepted, it is accepted with one record | ARCHITECTURE RESTS ON ACCEPTED ARTIFACTS · UC-022 10, 10a | ITM-128 | MR10 |
| | **`release-sprint-02-c-git-host.test.mjs`** | | | |
| 19 | GitHub and GitLab give the same three pull requests in one shape; `get` of the merged one, with a failed run, alike | GITLAB PRODUCTS ARE SUPPORTED · UC-032 1 | ITM-146 | MH1 (MH3) |
| 20 | a field GitLab's answer lacks is null — merge commit (squash commit present), description, head pipeline | GITLAB PRODUCTS ARE SUPPORTED | ITM-146 | MH2 |
| 21 | open, merged, closed told apart on both hosts; a base branch kept to | UC-032 1 (*in progress* — open; *done* — merged) | ITM-146 | MH3 |
| 22 | each token only at its own server — the GitLab one only under its project's API —, never in a URL, every request a GET; the other host's token handed over reaches no server; no token, no authorisation | A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT · A CREDENTIAL IS NEVER PLACED IN A URL | ITM-146 | MH4 |
| 23 | 250 pull requests: with `since` exactly those since, newest first, page 3 never read; after the newest, one page; without, three | "the list stopping at the date the filter names" (ITM-144) · PROGRESS AND JOB STATE ARE DERIVED, NOT STORED | ITM-146 | MH5 |
| | **`test_release_sprint_02_c.py`** | | | |
| 24 | the watcher sees every planted way of opening a scratch repository's SPEC.md — node `readFileSync`, `fs/promises` `readFile`, `git show`, Python `open`, `Path.read_text`, `git show`, node started from Python — and not the fixture SPEC.md beside it | CLAUDE.md §6a.2 (the known positive) | ITM-128 | MP2 |
| 25 | no node test opens Agent M's own SPEC.md | ITM-128 acceptance · KEIN SPEC-ZUGRIFF AUS PRODUKT-CODE | ITM-128 | MP1 |
| 26 | no Python test opens Agent M's own SPEC.md | same | ITM-128 | **expected failure — finding S1** |

The mutations:

| Id | File | Planted fault |
|---|---|---|
| MA1 | `artifacts/requirements.mjs` | a source without an SRC- identifier is reported as not linked (the reading ITM-127 removed) |
| MA2 | `artifacts/requirements.mjs` | every named SRC- counts as not linked |
| MA3 | `artifacts/requirements.mjs` | the RES- check loops over nothing |
| MA4 | `artifacts/requirements.mjs` | a source without a date is not reported |
| MA5 | `artifacts/requirements.mjs` | withdrawn is read from the first line of the source only |
| MR1 | `review-core.mjs` | `replaceSection` takes the CR off every line before the section |
| MR2 | `review-core.mjs` | `replaceSection` trims the end of every line of the proposal |
| MR3 | `review-core.mjs` | `sectionText` drops the section's last line |
| MR4 | `review-core.mjs` | `planAcceptance` also writes the replaced section to `<queue>/ersetzt-NN.md` |
| MR5 | `review-core.mjs` | `deriveReviewedStatus` says accepted for a record of any text |
| MR6 | `artifacts.mjs` | `docs/jobs/JOB-…` is a reviewed kind |
| MR7 | `review-core/apply-approvals.mjs` | the SPEC section's blob is not compared |
| MR8 | `review-core/apply-approvals.mjs` | the records are taken in reverse order |
| MR9 | `review-core/apply-approvals.mjs` | the report says `applied:` instead of `applied —` |
| MR10 | `review-core.mjs` | `architectureRefusal` checks no named requirement |
| MH1 | `git-host/pull-requests.mjs` | a GitLab merge request's head is its target branch |
| MH2 | `git-host/pull-requests.mjs` | a missing merge commit is taken from the squash commit |
| MH3 | `git-host/pull-requests.mjs` | a merged GitHub pull request is called closed |
| MH4 | `git-host/pull-requests.mjs` | a token of the other host's kind is not refused |
| MH5 | `git-host/pull-requests.mjs` | the list never stops before the end |
| MP1 | `tests/architecture-format.test.mjs` | the read ITM-128 removed is put back: `readFileSync(new URL("../SPEC.md", import.meta.url))` |
| MP2 | `tests/test_release_sprint_02_c.py` | the node watcher is left out of `NODE_OPTIONS` |

Two weak first versions were repaired before this record: cases 8 and 16 first expected the blank line between a replaced section
and the next heading to stay — both writers drop it, which is the V1 question (below), so the cases now pin the proposal's bytes and
every byte outside the section and leave the line ends between them open; the watcher first took the working directory of a
`git -C <dir>` for the place it ran and saw case 10's `git show HEAD^:SPEC.md` in a temporary repository as a read of Agent M's SPEC
— it now honours `-C`, and case 24 plants one `git show` in each language.

## Findings

Each is a rule or acceptance criterion of a strand-C item that the code on `sprint/02` does not keep. Each stays marked in the test
file with its item; the strand's developer takes the item up again, red first, and the gate *Release testing → Sprint review* for
strand C is decided only when no mark is left (ITM-144, *Kind and level*).

**C1 — a requirement written without any source passes the format check (back to Development: ITM-127).** ITM-127, *Outcome*:
"What stays an error: a missing source … (`A REQUIREMENT HAS FIVE FIELDS`)"; the rule: "A requirement consists of a name, a source
with a date, a rule, an occasion, and a check." Path: `artifacts/checks.mjs:70` `requirementChecks` →
`artifacts/requirements.mjs:45` `parseRequirements` → `:25` `HEAD` = `/^\*\*([^*\n]+)\*\*[ \t]+\*\(([\s\S]*?)\)\*/gm` needs the
`*(…)*` on the name line → a name line without it is not read as a requirement → `requirementProblems` (`:79`) never runs for it.
Ist: `formatChecks("requirement", …)` on `**NO SOURCE GIVEN**` / rule / `*Occasion:* …` / `*Check:* …` returns `[]`; Soll: one
error under `A REQUIREMENT HAS FIVE FIELDS` at that requirement. An empty `*()*` and a date alone are reported (case 4); only the
missing parenthesis is not. `formatChecks` is what a drafting job's correction loop sends back (its header, ARC-007 decision 3), so
a participant that drops the source would not be told. Bold prose stays no requirement (case 6): a bold name in capitals followed by the *Occasion:* and *Check:* fields
can be told from a bold sentence or label by those fields. Case 5.

**S1 — two Python tests open Agent M's own SPEC.md (back to Development: ITM-128; one of the two readers came with ITM-050).**
ITM-128, *Acceptance criteria*: "No file under `tests/` opens the repository's own `SPEC.md`; reading a fixture's `SPEC.md` stays
allowed"; KEIN SPEC-ZUGRIFF AUS PRODUKT-CODE (`SOFTWARE_MAINTENANCE.md`, *Prozess und Produkt*): "Kein Produkt-Code öffnet ein
SPEC-Dokument zum Lesen — kein Test, kein Skript, kein Generator." Seen by the watcher (case 26), the suite otherwise green:
- `tests/test_artifact_format.py:94` `test_every_artifact_of_this_repository_is_markdown_with_mermaid_diagrams` →
  `(ROOT / f).read_text(…)` for `f = "SPEC.md"`; `:90` requires `SPEC.md` among the places it reads (ITM-050, merged after ITM-128).
- `tests/test_products_folder.py:76` `test_instance_repository_names_no_product` → `:61` `named_products` → `:70`
  `(root / f).read_bytes()` for every committed file, `SPEC.md` included (in the repository since `5f44fbf`, 2026-09-30, so already
  when ITM-128 was merged).

No node test opens it (case 25) — the read ITM-128 named is gone. **Open question for akmaier, not decided here:** both readers are
whole-repository checks that SPEC rules name (`ARTIFACTS ARE MARKDOWN` — `tests/test_artifact_format.py`; `NO PRODUCT IS NAMED IN THE
INSTANCE REPOSITORY` — `tests/test_products_folder.py`) and read SPEC.md as one file among all, not as a source of expected values.
Whether such a scan falls under "kein Test" is a question of the process rule's reach; the test pins the criterion as ITM-128 wrote
it, and the answer decides whether the fix is code (leave SPEC.md out of the two scans) or a clarification of the rule and of
ITM-128's criterion.

**G1, G2 — already recorded by ITM-014** (`2026-10-01_approval-gates-counter-proofs.md`): the engine answers `"open"` for a job record
and writes `kind: use-case` approval records for one. Written here again from the rule's text (cases 13, 14), red for the same
reasons, marked with those names; not new. ITM-014 is a refactoring item whose own note sends a failing check to an implementation
item.

## Known findings not re-tested, and why

- **F1, F2, F3** — `tools/apply_approvals.py` reads the SPEC and the proposal with universal newlines. Marked in
  `tests/test_apply_approvals.py` and `tests/test_spec_gate.py`. Case 17 compares the twins on LF text only; cases 7 and 8 hold the
  engine's two writers to the CR LF bytes the rules ask for, which agrees with F1–F3 (the engine keeps them).
- **V1** — blank lines that end a proposal. Cases 8 and 16 assert neither keeping nor dropping them, nor the blank line before the
  next heading that goes with them.

## Readings where the documents were open

1. `A REQUIREMENT HAS A REGISTERED SOURCE` says "names at least one source linked to its product"; ITM-127 and ITM-144 record akmaier's
   reading of 2026-10-01 that a source named as it is written needs no SRC- identifier. The cases follow ITM-144.
2. ITM-146's *Outcome* says the list "stops at the first page older than the date"; its acceptance criterion "stops at the first page
   whose newest entry is older than `since`". Case 23 asserts what both readings share — the right pull requests, page 3 never read,
   one page when nothing is new enough — and not which of the two pages it stops at.
3. G1 at the engine or at the views: today no view lists `docs/jobs/` (ITM-014's record). The SPEC's check names
   `tests/review-core.test.mjs`, MOD-review-core; case 13 tests the engine.
4. `A RECORD IS EVIDENCE, NOT A PROPOSAL` names gate and test result records, whose folders the SPEC does not fix; case 12 uses
   `docs/gates/GATE-…` and `docs/test-results/…` as stand-ins — any path outside the three reviewed kinds gives the same answer.
5. S1's reach, above.
6. UC-006 4c's twin: "byte for byte as tools/apply_approvals.py" (ITM-144) and "byte for byte" (the rule) part where the tool is wrong
   (F1–F3); the engine was held to the rule, the twin to LF text.

## Overlaps with the implementers' tests (read after the release tests were written)

| Release case | Implementer's test |
|---|---|
| 1–4 | `test_requirement_has_source.py` (`a_source_named_as_it_is_written_is_no_error`, `a_source_the_product_does_not_link`, `a_resource_entry_named_as_source_is_rejected`), `test_requirement_fields.py` (`a_missing_source_is_named_as_missing`) |
| 6 | `architecture-format.test.mjs` "specRequirements — … a withdrawn one is marked; prose in bold is no requirement" |
| 7–12 | `test_spec_gate.py`, `test_verbatim.py`, `test_proposal_shows_current.py`, `test_replaced_in_history.py`, `review-core.d/gates.test.mjs` |
| 13, 14 | `gates.test.mjs` — the same G1 and G2, todo |
| 15–17 | `test_apply_approvals.py` (`the_engine_writes_the_bytes_and_the_report_of_the_python_tool`, stale and malformed cases), `review-core.d/apply-approvals.test.mjs` |
| 19–23 | `review-core.d/git-host-pulls.test.mjs` |

New against them: C1 (a name line without its source), S1 (a check of every test, Python and node, by running them), the
architecture's acceptance on a bold-prose name (case 18), and the reads with the other host's token handed over (case 22).

## Addendum, 2026-10-02 — case 26 follows ITM-128's corrected criterion (S1 decided no defect)

**MESSUNG** — 2026-10-02, branch `team/ITM-144-s1` from `sprint/02` at `5957157`, macOS, Node 25.9.0, Python 3.14.6; by
`tester-opus` (claude-opus-5-5), the author of case 26. The text above stays as it was measured on 2026-10-01; this entry stands
beside it.

**Why.** At the gate of strand C the Product Owner decided S1 is no defect (`docs/backlog/sprints/sprint-02.md`, *Decided on
2026-10-02*) and corrected ITM-128's criterion: "A whole-repository scan — a test that opens every committed file, or every
artifact, of the repository to check each against a rule … — opens `SPEC.md` as one file among all and does not fall under this
criterion, nor under `KEIN SPEC-ZUGRIFF AUS PRODUKT-CODE`". The case's expectation changes because the criterion it is written
from changed; the code does not, and no other case's expectation changes.

**The criterion as the case reads it.** An open of `SPEC.md` comes from a whole-repository scan when its call site — the chain of
test file:line frames the watcher records with the open — opens, in the same run, more than half of the repository's other
committed Markdown files (`git ls-files '*.md'` without `SPEC.md`). A read by name opens `SPEC.md` from a line that opens it alone
or with a handful of others; a `git` command or a node process naming the file is never a scan. No list of today's scans is
written into the test, so a new scan passes and a new read by name is a finding wherever it stands. For this, the Python watcher
notes, when asked, every other file of the repository a process opens, with its frames ("python read …"); the watcher's own opens
(its log, the source lines of the frames) are not noted.

| # | Case (changed) | Rule or flow | Item | Red under |
|---|---|---|---|---|
| 24 | as before, and in the planted repository a test that reads every committed file opens `SPEC.md` too: that open, and only that one, is told to come from a scan; the two opens by name, the `git show` and the node read are not | CLAUDE.md §6a.2 (the known positive), ITM-128 corrected | ITM-128 | MP2, M1 |
| 26 | every Python open of Agent M's own `SPEC.md` the watcher sees comes from a whole-repository scan — the mark is gone | ITM-128 acceptance (corrected 2026-10-02) · KEIN SPEC-ZUGRIFF AUS PRODUKT-CODE | ITM-128 | P1, P2 |

**Readings on the increment** (`scratchpad/itm144s1-tester-opus/coverage.txt`, not committed): 903 committed Markdown files
besides `SPEC.md`; the watcher sees two opens of `SPEC.md` in the Python suite —

| Call site | Other committed Markdown files it opened | From a scan |
|---|---|---|
| `test_artifact_format.py:94` | 756 of 903 | yes |
| `test_products_folder.py:78` ← `:70` (the record above says `:76`; the file has grown by two lines since) | 903 of 903 | yes |

The largest call site that opens no `SPEC.md`: `test_release_sprint_02_d.py:71` (903), `test_no_backend.py:177 ← :102` (758);
then `test_approval_records.py:27` (263), `test_groups.py` (255). Every site above the line of one half (452) is itself a scan of
the repository; every site below it reads one folder or fewer files.

**Counter-proofs** (`scratchpad/itm144s1-tester-opus/plant.txt`, each planted fault removed after its run):

| Id | Planted | Result |
|---|---|---|
| P1 | `tests/test_artifact_format.py`: a new test that reads `(ROOT / "SPEC.md")` by name | case 26 red, the open listed at `test_artifact_format.py:148` |
| P2 | `tests/test_products_folder.py`: a new test that reads `SPEC.md` and `README.md` from one loop over a written list | case 26 red, listed at `test_products_folder.py:138` (the same run as P1; the two scans not listed) |
| M1 | `not_from_a_scan` counts every Python open as a scan (`> len(markdown)` → `>= 0`) | case 24 red |

**Counts.** Before (`5957157`): `cd tests && python3 -m unittest` → `Ran 361 tests … OK (expected failures=6)`, 146 s. After:
`Ran 361 tests … OK (expected failures=5)`, 147 s; `test_release_sprint_02_c` alone 3 tests, OK, 89 s. `node --test
tests/*.test.mjs` → `tests 494, pass 479, fail 0, todo 15`, before and after (no node file changed).

**Left as it was.** Case 25 (node) still expects nothing seen: no node test opens `SPEC.md`, so the corrected criterion and the
stricter expectation agree today; a node scan would turn it red, and the node watcher records no frames to tell one. Moving the
watcher into CI's one run is ITM-158, not done here.
