---
id: ITM-115
title: Measure whether the Hugging Face Hub answers the dashboard's request
kind: measurement
level: 1
realises:
  - BROWSER REACHABILITY IS MEASURED, NOT ASSUMED
  - A RESOURCE IS PINNED TO AN EXACT STATE
modules: []
depends_on:
  - ITM-047
origin: backlog refinement 2026-10-01
---
# ITM-115 Measure whether the Hugging Face Hub answers the dashboard's request

**REGISTER**

## Outcome

UC-040 3b says it is not yet measured: a preflight and a read of a model's current revision and licence from the Pages origin; the result decides whether UC-040 step 3 reads the revision or asks the person to paste it.

## Realises

- `BROWSER REACHABILITY IS MEASURED, NOT ASSUMED`
- `A RESOURCE IS PINNED TO AN EXACT STATE`

## Where it came from

UC-040 alternative flow 3b ("not yet measured").

## Modules

- none — a repository check or a measurement: the rule is checked across the repository or by a person, not by one module's code (ARC-020 decision 5).

Files it creates or changes:

- `docs/measurements/<date>_hugging-face-cors.md` (new)

## Kind and level

- Job kind: **measurement** — not a coding job: a person measures or decides, and the result is a dated file in `docs/measurements/`.
- Level: **1** — browser and hosted CI; nothing installed.

## Checks of the SPEC this measurement bears on

- `tests/test_measurement_present.py` — `BROWSER REACHABILITY IS MEASURED, NOT ASSUMED`
- `tests/test_resources.py` — `A RESOURCE IS PINNED TO AN EXACT STATE`

## Acceptance criteria

From the SPEC's checks:

- `BROWSER REACHABILITY IS MEASURED, NOT ASSUMED` — `tests/test_measurement_present.py` — a released runtime has a dated measurement file.
- `A RESOURCE IS PINNED TO AN EXACT STATE` — `tests/test_resources.py` — a `model` entry without revision or hash fails; counter-proof: the same entry with a 40-hex revision passes, and a `compute` entry without a pin passes.

Further:

- The measurement file states its method, date, environment and every raw result, and is not edited afterwards.
- Where the result contradicts the architecture, it is reported as a finding to the PO; nothing in SPEC.md, the use cases or the architecture is changed by this item.

## Depends on

- ITM-047 — the resource reader

## Needs a person

A preflight with `curl` can be made by an agent with network access; the confirming browser call is made by a person.
