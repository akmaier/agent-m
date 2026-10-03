# Accept ticked leaves out a SPEC entry whose impact list was not shown — counter-proofs (ITM-155)

**MESSUNG** — 2026-10-03, branch `team/ITM-155` (on `sprint/03` at `2948f4b`), tests at `dbc1159`, implementation at
`ba22e62`, macOS, Node 25.9.0, Python 3.14.6. developer-opus-c (claude-opus-5-5).

The counter-proofs of the checks ITM-155 adds for `A REQUIREMENT IS NOT CHANGED WITHOUT AN IMPACT LIST` on the route of
UC-006 4d — the SPEC list's *Accept ticked* (`viewSpec` → `batchBar` → `wireBatch` → `runAccept` → `acceptItems` →
`planAcceptance`) — as `A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT` requires.

## What the code did before

`planAcceptance` (`docs/assets/review-core.mjs`) left out a changed decision or module whose impact list was not shown
(`architectureRefusal`: `it.changed && it.impactShown !== true`); for a SPEC item it had no such condition, and the SPEC item
(`specItem`, `docs/assets/dashboard/spec-changes-view.mjs`) carried neither `changed` nor `impactShown`.

Which route reaches `planAcceptance` with an entry whose list was not shown, read in the code at `2948f4b`: the list's
`tickCell` offers a tick only for an entry its page has shown (`session.wasShown`), so the list cannot tick an entry that was
never opened. The entry page offers *Accept* only when the list was derived (`canAccept` holds `!impact.error`, ITM-134), but
the panel of an entry that waits for another entry of its queue (`waitPanel`) offers its tick whether or not the list could
be derived. Ticked there, with the entry it waits for, *Accept ticked* on the list wrote it. The new case of
`tests/dashboard-spec-impact.test.mjs` takes this route.

## The change

- `docs/assets/review-core.mjs` — `planAcceptance`: a SPEC item with `touches` and without `impactShown: true` is named under
  `leftOut` with the reason *its impact list was not shown — open it*, after the index and "already written" checks and
  before its proposal is read; nothing is written for it. An item without `touches` is planned as before.
- `docs/assets/dashboard/spec-changes-view.mjs` — `specItem(q, e, impact)`: the entry page hands it the impact it derived;
  the item carries `touches: true` when the list names a requirement the entry changes or withdraws, or when the list could not
  be derived (whether it touches one is then not known), and `impactShown: true` when the list was shown — as
  `reviewArch`/`fillImpact` set `impactShown` for a decision or module. The list (`viewSpec`) says beside a ticked entry whose
  item touches a requirement without its list shown: *its impact list was not shown: open it before accepting*.

## Suites

| | start (`2948f4b`) | tests only (`dbc1159`) | implementation (`ba22e62`) |
|---|---|---|---|
| `node --test tests/*.test.mjs` | 518 tests — 512 pass, 6 todo | 521 tests — 513 pass, **2 fail**, 6 todo | 521 tests — 515 pass, 6 todo |
| `cd tests && python3 -m unittest` | 367, OK (5 expected failures) | 367, OK (5 expected failures) | 367, OK (5 expected failures) |

The two failures on `dbc1159` are the two new cases that check the change; the third new case (the list's counter-proof) is
green on the code before, as a counter-proof is. CI on `dbc1159`: runs 37118557300 (push) and 37118566036 (pull request),
both red in the step *Dashboard core* on those two cases; not rerun.

## Counter-proofs

Each fault was planted in the file named on `ba22e62`, `tests/dashboard-spec-impact.test.mjs` and `tests/review-core.test.mjs`
(which runs `tests/review-core.d/gates.test.mjs`) were run, and the file was restored (its diff against `ba22e62` empty after).

New cases: **K** — gates: *A REQUIREMENT IS NOT CHANGED WITHOUT AN IMPACT LIST — a SPEC entry that touches a requirement is not
written unless its impact list was shown …*; **L** — *UC-006 4d · ITM-155: an entry ticked while its impact list could not be
shown is left out by Accept ticked on the SPEC list …*; **C** — *UC-006 4d · ITM-155 counter-proof: an adding entry and a
changing entry whose list was shown on its page are written …*.

| Planted fault | Red | Green |
|---|---|---|
| M1 — `planAcceptance` without the condition (`if (false && it.touches …)`) | K, L | C |
| M2 — `planAcceptance` ignores `impactShown` (`if (it.touches)`) | K, L, C | — |
| M3 — `specItem` never sets `impactShown` | L, C | K |
| M4 — `specItem` never sets `touches` | L | K, C |
| M5 — the list's note left out | L | K, C |
| M6 — an underivable list does not count as touching (`touches` only for a non-empty list) | L | K, C |

Each new case is red on at least one fault; K and L are red on the code before the change (`dbc1159`).

## Not changed

`batchBar` and `runAccept` (`docs/assets/dashboard/review-views.mjs`) are untouched: the left-out entry is named by the flash
`runAccept` already writes for every `leftOut`. The `waitPanel` still offers its tick when the list could not be derived; the
engine now leaves such an entry out, and the list names why.
