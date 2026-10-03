# A product's SPEC change without a token needs a token — counter-proofs (ITM-149)

**MESSUNG** — 2026-10-03, branch `team/ITM-149` (on `sprint/03` at `2c284bf`), tests at `1998cc5`, implementation at
`1a1ae96`, macOS, Node 25.9.0, Python 3.14.6. developer-opus-d (claude-opus-5-5).

The counter-proofs of the checks ITM-149 adds for UC-006 4c, the product's half (`WITHOUT A TOKEN, THE INSTANCE'S WORKFLOW
WRITES THE CHANGE`, `EVERY STEP EXPLAINS ITSELF`), as `A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT` requires. Release
finding R2 of `docs/measurements/2026-10-01_release-tests-sprint-01.md`.

## What the code did before

`viewSpecEntry` (`docs/assets/dashboard/spec-changes-view.mjs`) → `acceptPanel` (`docs/assets/dashboard/review-views.mjs`) →
`writeRoute(T.product, null)` (`docs/assets/git-host.mjs`) answers `"github-web"` for every GitHub repository → `acceptPanel`
built `newFileUrl(T.repo, …)` "Open in GitHub to commit ↗" for a product's SPEC entry too. Its record, committed there, would
show *approved* for ever: only the instance carries the apply workflow. `githubPath` in the same file already had no page for
a product's SPEC change (UC-008 4a, the route beside a refused commit); `acceptPanel` did not ask it. The head of the SPEC list
said "the workflow writes it into `SPEC.md` … once your approval commit arrives" for any GitHub repository without a token.

## The change

- `docs/assets/dashboard/review-views.mjs` — new `productSpecTokenNeeded(app, what)`: accepting needs a token that can write to
  the product, why (no product carries the workflow; the change would stay approved), and the token step `app.tokenStepLink()`
  (`#add/<address>`, UC-001 step A, as the product's settings link it in UC-042 3a). `acceptPanel`: after the GitLab
  `"token-step"` and the `"commit"` routes, a record for which `githubPath` has no page gets that notice with a
  *What is this?* explanation instead of GitHub's new-file page.
- `docs/assets/dashboard/spec-changes-view.mjs` — `viewSpec`: without a token, not on GitLab, on a repository that is not the
  instance, the head shows the same notice instead of the workflow sentence. The instance's sentence and GitLab's stay.
- `writeRoute` and `tests/review-core.d/git-host.test.mjs` unchanged; `editPanel` unchanged (editing a proposal keeps GitHub's
  editor, UC-006 3a, 4b).

## Suites

| | start (`2c284bf`, CI run 37119108301) | tests only (`1998cc5`) | implementation (`1a1ae96`) |
|---|---|---|---|
| `node --test tests/*.test.mjs` | 535 tests — 531 pass, 4 todo | 541 tests — 535 pass, **3 fail**, 3 todo | 541 tests — 538 pass, 3 todo |
| `cd tests && python3 -m unittest` | 371, OK (5 expected failures) | 371, OK (5 expected failures) | 371, OK (5 expected failures) |

The three failures on `1998cc5` are the two new cases that check the change and release case 29, which lost its `{ todo }`
mark; the four other new cases are counter-proofs and green on the code before, as a counter-proof is. CI on `1998cc5`: run
37119418253 (push), red in the step *Dashboard core* on those three cases; not rerun.

## Counter-proofs

Each fault was planted in the file named on `1a1ae96`; `tests/dashboard-spec-product-token.test.mjs` and
`tests/release-sprint-01-dashboard-app.test.mjs` were run, and the file was restored (its diff against `1a1ae96` empty after).

New cases of `tests/dashboard-spec-product-token.test.mjs`: **E** — *UC-006 4c: a product's SPEC entry without a token offers
no GitHub page …*; **H** — *UC-006 4c: the head of a product's SPEC list without a token …*; **I** — *UC-006 4b, 4c
counter-proof: the instance's SPEC entry …*; **U** — *UC-008 3b counter-proof: a product's use case …*; **T** — *UC-006
counter-proof: a product's SPEC entry with a token keeps Accept*; **G** — *UC-006 counter-proof: a GitLab product's SPEC entry
…*. **R29** — release case 29.

| Planted fault | Red |
|---|---|
| F1 — `acceptPanel` never takes the new branch (`if (false)`) | E, R29 |
| F2 — the notice has no link to the token step | E, H |
| F3 — the list's head never treats a repository as a product (`productSpec = false`) | H |
| F4 — the list's head treats the instance as a product (without `T.repo !== T.instance`) | I |
| F5 — `acceptPanel` refuses GitHub's page for every record (`if (true)`) | I, U, and release cases UC-008 3b, UC-006 4b, UC-014 4a, UC-014 6a |
| F6 — `acceptPanel` refuses GitHub's page for every record of a product, whatever its kind | U |
| F7 — the list's head ignores a stored token | T |
| F9 — the product's panel placed before GitLab's token step, for every SPEC record not of the instance | E, T, G |

Each new case is red on at least one fault; E and H (and R29) are red on the code before the change (`1998cc5`). A fault F8
(the notice before the `"commit"` route) was prepared but not run: its anchor did not match exactly once; T is red on F7 and F9.
