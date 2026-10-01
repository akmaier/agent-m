# The entry view hands the graph the queue's index — counter-proofs and requests per load (ITM-134, finding D1)

**MESSUNG** — 2026-10-02, branch `team/ITM-134-d1` from `sprint/02` at `65bce2d` (the merge of pull request #65, ITM-018's half
of D1), tests at `c353180`, macOS, Node 25.9.0, Python 3.14.6. CI runs Node 22. developer-opus-d (claude-opus-5-5).

Finding D1 of ITM-145 (`docs/measurements/2026-10-02_release-tests-sprint-02-d.md`, case 18), the view's half, sent back to
Development by the Product Owner (`docs/backlog/sprints/sprint-02.md`, *Decided on 2026-10-02*). An entry that renames a
requirement in place, or leaves it out of the section it replaces, showed no impact list and offered *Accept*. Since pull
request #65, `linkGraph` draws `{ kind: "proposes", change: "withdraw" }` to such a requirement when its `files` hold the
queue's `index.md` (and, where another entry of the queue creates the entry's heading, that entry) — the view did not hand them
over.

## Path, before and after

`dashboard/spec-changes-view.mjs` `viewSpecEntry` → `entryImpact(app, e)` → `own = { "SPEC.md", [e.proposalPath] }` →
`touchedBy(linkGraph({ files: own, status }), e.proposalPath)` → the graph finds no `index.md` among the files (`replaced` →
`[]`) → only the names the entry states → for the fixture's entry 01 with RULE ONE renamed in place: one edge `{ to: "RULE ONE
RENAMED", change: "add" }`, which `touchedBy` drops → `[]` → no list, *Accept* offered (case 18 red; the two new cases red).

After: `viewSpecEntry` passes the queue's entries (`queueEntries`, already loaded for the page) → `entryImpact(app, e, entries)`
adds `docs/spec-freigaben/<queue>/index.md` — read through `app.fileText`, the text `queueHeads` read for the same page and keeps
by `once` — and the proposal of every entry named in `e.needs` (the entries that create its heading, from `sectionForEntry`),
with their statuses → `linkGraph` reads the index row's anchor, finds the replaced section and draws `{ change: "withdraw" }` to
RULE ONE → `touchedBy` keeps it → the use cases, architecture files and tests are read as for any touching entry →
`requirementImpact(graph, "RULE ONE")` → UC-001, UC-002, `tests/one.test.mjs`, shown as *withdrawn by this entry* before the
Accept panel. Release case 18 (TITLE renamed or left out): UC-001, UC-002, MOD-cover, `tests/title.test.mjs` before *Accept*.
No other module changed; `linkGraph`'s interface as ITM-018 left it.

## Suites

| | before (`65bce2d`) | tests only (`c353180`) | after |
|---|---|---|---|
| `node --test tests/*.test.mjs` | 496 tests — 483 pass, 13 todo | 498 — 483 pass, 3 fail, 12 todo | 498 — 486 pass, 12 todo |
| `cd tests && python3 -m unittest` | 364, OK (5 expected failures) — CI run 36940748560 | 364, 1 failure (5 expected failures) | 364, OK (5 expected failures) |

On `c353180` the three node failures are case 18 of `tests/release-sprint-02-d-dashboard-app.test.mjs`, its mark removed, and
the two new cases of `tests/dashboard-spec-impact.test.mjs`; the Python failure is `test_release_sprint_02_c` *no node test opens
Agent M's own SPEC*, which runs the node suite and is red while it is. The Python figure of `65bce2d` is CI's; the local run
started on `65bce2d` but its node watcher ran after the two test files were edited, so it counted the red tree. CI on
`c353180`: runs 36941121094 and 36941138348, both red. The todo count drops by one (13 → 12): case 18's mark. No expected result of another test changed.

## Counter-proofs

Each fault planted in `docs/assets/dashboard/spec-changes-view.mjs`; `node --test tests/dashboard-spec-impact.test.mjs
tests/release-sprint-02-d-dashboard-app.test.mjs` run; the file restored; after the series it was byte-identical and both files
green (23 pass). Script: `scratchpad/itm134d1-developer-opus-d/mutate.txt` (not committed). N1 is the new case *an entry that
renames a requirement in place or leaves it out of its section lists what names it, as withdrawn, before Accept*; N2 *an entry
whose heading another entry of its queue creates lists what names a requirement it leaves out*; R18 the release case.

| | Planted fault | Red |
|---|---|---|
| V1 | the graph is given no index | N1, N2, R18 |
| V2 | the entry that creates the heading is not given | N2 |
| V3 | the index is read past the page's cache (`app.readAt`), a request of its own | N1 (the index read twice), and *the requests one load of an entry makes* |
| V4 | another file of the queue (`entscheidungen.md`) is handed over as its index | N1, N2, R18 |
| V5 | a withdrawal does not count as touching | N1, N2, R18, and the two withdrawal cases (`dashboard-spec-impact` 3, release 17) |

## Requests per load of an entry

`scratchpad/itm134d1-developer-opus-d/count-requests.txt` (not committed): the fixture of `tests/dashboard-spec-impact.test.mjs`
and its D1 variants, each entry opened with an empty file cache (cold) and again with the cache kept (warm); `index` is how often
`docs/spec-freigaben/<queue>/index.md` was read in the cold load.

| Entry | before — cold | after — cold | warm, both |
|---|---|---|---|
| 01 changes RULE ONE | 16 (14 files, index 1×) | 16 (14 files, index 1×) | 2 (commit, tree) |
| 02 adds a requirement | 8 (6 files, index 1×) | 8 (6 files, index 1×) | 2 |
| 03 withdraws RULE TWO | 15 (13 files, index 1×) | 15 (13 files, index 1×) | 2 |
| 01 renames RULE ONE in place | 9 (7 files, index 1×) | 16 (14 files, index 1×) | 2 |
| 01 leaves RULE ONE out | 9 (7 files, index 1×) | 16 (14 files, index 1×) | 2 |
| 05 after 04 leaves RULE THREE out | 10 (8 files, index 1×) | 17 (15 files, index 1×) | 2 |

The index costs no request: the queue view reads it once per load, before and after. An entry that changes, adds or withdraws
by name makes the same requests as before. An entry that takes a requirement out of its section now reads the use cases, the
architecture files and the tests (seven more files in this fixture) — the reads of an impact list, as for every touching entry;
ITM-154 holds the cost of those reads on a large repository. The diagnostic of the existing case (*the requests one load of an
entry makes*, which shares one cache between entries 02 and 01) reads 8 and 10 cold, 2 warm, before and after.

## Readings

1. **The index is the queue view's.** `entryImpact` reads it with `app.fileText`, which the page keeps per path by `once`; the
   queue view (`queueHeads`) has always read it first, so the list adds no request. No new interface: the text is reached the
   way every other text of the commit is.
2. **The creating entries are `e.needs`.** `sectionForEntry` names every entry that must be written before this one — the
   whole chain, not only the last link — so handing over exactly those is what lets the graph find the section the view shows.
   An entry whose own heading is in the SPEC needs none; the other entries of the queue are not handed over, as they cannot
   change which section this entry replaces.
3. **Withdrawn, as the graph says.** The list labels a requirement taken out of its section *withdrawn by this entry*, the label
   it already had for a withdrawal note — ITM-018's reading 1 (a rename is a withdrawal plus an addition). The new name is an
   addition and is not listed, as for any added requirement.
4. **An entry its index does not list** is read at its own first line (ITM-018's reading 2, confirmed by the Scrum Master); the
   view hands over the index whatever it lists, and the graph decides.
