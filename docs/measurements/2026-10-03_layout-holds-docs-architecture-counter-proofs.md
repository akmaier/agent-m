# The layout Add product writes holds docs/architecture/ — counter-proofs (ITM-148)

**MESSUNG** — 2026-10-03, branch `team/ITM-148` (on `sprint/03` at `c915734`), tests at `da928ab` and `ca143c7`,
implementation at `31211f6`, macOS, Node 25.9.0, Python 3.14.6. developer-opus-c (claude-opus-5-5).

The counter-proofs of the expectations ITM-148 changes for finding **R1** of the sprint 01 release tests
(`docs/measurements/2026-10-01_release-tests-sprint-01.md`, case 3): *Add product* wrote five files and none under
`docs/architecture/` (UC-001 step 5, `ONE REVIEW LAYOUT FOR EVERY PRODUCT`, `ADDING A PRODUCT CREATES ITS LAYOUT`;
`A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`).

## The change

`docs/assets/review-core.mjs` `missingLayout(existingPaths, product)` adds `docs/architecture/README.md` — *"# Architecture /
One file per decision, `ARC-<nnn>-<slug>.md`, and one per module, `MOD-<slug>.md`. Reviewed on the Agent M dashboard."* —
unless the product has the file or anything under `docs/architecture/` (the prefix rule of the other three READMEs). Path:
`dashboard/add-product-view.mjs` `wireAddGo` → `dashboard/writes.mjs` `addProduct` (GitHub and GitLab branches pass what
`missingLayout` returns) → `missingLayout`. No code file of MOD-dashboard-app changes.

## Changed expectations (old → new)

| File · case | Old | New |
|---|---|---|
| `tests/review-core.test.mjs` · *ADDING A PRODUCT CREATES ITS LAYOUT — only what is missing* | `missingLayout([])`: five files; with `SPEC.md` and a use case: three | six files and four, each with `docs/architecture/README.md`; **new:** the README names `ARC-<nnn>-<slug>.md`, `MOD-<slug>.md` and the Agent M dashboard; **new counter-proof:** with `docs/architecture/ARC-001-x.md` the five files of before, no README there |
| `tests/review-core.d/dashboard-writes.test.mjs` · *THE DASHBOARD KEEPS ITS PRODUCTS IN THE BROWSER — …* | GitHub tree: five files | six, with `docs/architecture/README.md` |
| same file · *UC-001 5b: a product with the complete layout …* | `full` without `docs/architecture/` | `full` with `docs/architecture/MOD-x.md` (no commit still) |
| same file · *ADDING A PRODUCT CREATES ITS LAYOUT — on GitLab, …* | four `create` actions | five, with `docs/architecture/README.md` |
| `tests/dashboard-review-flows.test.mjs` · constant `LAYOUT` (cases 3b, 3c, 5b, *a product without any layout …*) | five paths | six, with `docs/architecture/README.md` |
| same file · *UC-001 main flow: … writes only the missing layout …* (**not named by the item**) | three files | four, with `docs/architecture/README.md` |
| `tests/release-sprint-01-dashboard-app.test.mjs` · *release · UC-001 5: the layout written into a new product holds docs/architecture/* | `{ todo: "FINDING R1 …" }` | mark removed; expectation unchanged |

The item named four cases of `dashboard-review-flows.test.mjs` and "nothing else in the file"; the main-flow case asserts the
layout with a literal list and went red on the implementation — found by running the suite, changed in its own commit
(`ca143c7`).

## Suites

| | start (`c915734`) | tests only (`da928ab`) | implementation (`31211f6`) |
|---|---|---|---|
| `node --test tests/*.test.mjs` | 505 tests — 498 pass, 7 todo | 505 tests — 492 pass, **7 fail**, 6 todo | 505 tests — 499 pass, 6 todo |
| `cd tests && python3 -m unittest` | 366, OK (5 expected failures) | 366, **1 failure** (5 expected failures) | 366, OK (5 expected failures) |

The seven node failures on `da928ab`: the `missingLayout` case, the GitHub and the GitLab case of `dashboard-writes`, three
of the four `LAYOUT` cases (3b, 3c, *without any layout*) and the release case. The 5b cases stay green on the old
code: there is nothing to write either way. The one Python failure is `test_release_sprint_02_c.NoTestOpensAgentMsOwnSpec`,
which runs the node suite inside it. CI on `da928ab`: runs 37117042131 (push) and 37117051340 (pull request), both red in the
step *Python checks* on that case; not rerun. On `31211f6` the main-flow case is green; on `da928ab` it was green with its old
list and is red on `31211f6` without `ca143c7`.

`todo` drops from 7 to 6: the R1 mark; R2, R3 and the others are unchanged.

## Counter-proofs

Each fault was planted in `docs/assets/review-core.mjs` on the implementation, the four test files were run, and the file was
restored (its diff against `31211f6` empty after). Script: the session scratchpad, `itm148-developer-opus-c/planted-faults.txt`.

| Planted fault | Red | Green |
|---|---|---|
| P1 — the prefix rule dropped (`dirPrefix` `null`) | *only what is missing* (the new counter-proof), *UC-001 5b* of `dashboard-writes` (a commit is written for `docs/architecture/MOD-x.md`) | *5b* of `dashboard-review-flows` — its `LAYOUT` holds the README itself, so the path rule alone keeps it |
| P2 — the README without `MOD-<slug>.md` | *only what is missing* (the README's text) | the rest — they check paths |
| P3 — written at `docs/architecture.md` | the `missingLayout`, GitHub and GitLab cases, 3b, 3c, *without any layout*, the main flow, the release case | the 5b cases |
| P4 — the entry removed (the code before the change) | as P3 | the 5b cases |

Each changed expectation is red on at least one fault; the 5b pair, which asserts that nothing is written, is red on P1 through
`dashboard-writes` and is the counter-proof of the prefix rule on the commit path.

## Not changed

`tests/test_self_sufficient.py` builds its fixture product with `missingLayout([])` and asserts with `assertIn`; it now also
checks the new README for references into Agent M (none: `ARC-<nnn>-<slug>.md` and `MOD-<slug>.md` are placeholders) and stays
green. `docs/architecture/MOD-review-core.md` describes `missingLayout` as writing "the README files of use cases, approval
records and SPEC queues"; it does not name the architecture README, and this item changes no architecture file.
