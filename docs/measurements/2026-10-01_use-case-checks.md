# Use-case checks — the dashboard's reader, its Python twin, and their counter-proofs

**MESSUNG** — 2026-10-01, branch `team/ITM-010` (from `sprint/01` at `cfecd40`), macOS, Node 25, Python 3.14. ITM-010
(implementation job): `docs/assets/artifacts/use-cases.mjs` (`parseUseCase`, `useCaseProblems`) and its Python twin
`use_case_findings` in `tests/artifact_checks.py`. This file records the red first commit and the counter-proof of every new
test (SOFTWARE_MAINTENANCE §4.0a rule 5, `A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`).

## 1. The first commit is red

`104b7bf` holds only tests: `tests/artifacts-twin.test.mjs`, `tests/test_usecase_realises.py`,
`tests/test_diagrams_are_mermaid.py`, the fixtures of `tests/fixtures/use-cases/` and one test in
`tests/review-core.d/artifacts.test.mjs`. Locally, Python ran 95 tests with 2 errors: `ImportError: cannot import name
'use_case_findings'`, once for each new Python file. Node ran 136 tests with 1 failing: `tests/artifacts-twin.test.mjs`, with
`ERR_MODULE_NOT_FOUND` for `docs/assets/artifacts/use-cases.mjs`. In CI, both runs of pull request #30 on that commit failed
in the step *Python checks*, with the same two `ImportError`s (runs 36888377113 and 36888395656).

## 2. Counter-proofs

**Method.** A script (not committed) planted one fault at a time and restored the file afterwards. A fault was either one
exact string replaced in one file, or one file planted. The script refused a replacement that did not occur exactly once,
and one that left the file unchanged. For each fault it ran `cd tests && python3 -m unittest` and
`node --test tests/*.test.mjs`. It read the failing tests from unittest's `FAIL:` and `ERROR:` lines, and from node's list
after `✖ failing tests:`. Both suites were green before the series and after it.

Every row is red. The rows marked *JS* change the dashboard's reader, the rows marked *py* change the twin, and the rows
marked *repository* change this repository's own use cases and folders.

| Planted fault | File | Red |
|---|---|---|
| JS: the section ## Postcondition is not required | `docs/assets/artifacts/use-cases.mjs` | node “every fixture yields exactly the findings expected.json names — one broken copy per rule, the complete one none”; node “the Python twin reports the same findings as the dashboard's reader — on every fixture and every use case of this repository” |
| JS: a name under realises is not looked up | `docs/assets/artifacts/use-cases.mjs` | `test_usecase_realises` test_the_dashboards_reader_reports_the_same_name_on_its_line; node “every fixture yields exactly the findings expected.json names …”; node “A FINDING READS LIKE A COMPILER MESSAGE — artifact, line, kind, the rule by name, what is wrong and the correction”; node “the known names may be a list, a Set or the Map specRequirements reads; without them only the form of a name is checked”; node “the Python twin reports the same findings …” |
| JS: the form of a name is not checked | `docs/assets/artifacts/use-cases.mjs` | node “every fixture yields exactly the findings expected.json names …”; node “the known names may be a list, a Set or the Map …”; node “the Python twin reports the same findings …” |
| JS: an empty realises is accepted | `docs/assets/artifacts/use-cases.mjs` | node “every fixture yields exactly the findings expected.json names …”; node “the Python twin reports the same findings …” |
| JS: an empty actors is accepted | `docs/assets/artifacts/use-cases.mjs` | node “every fixture yields exactly the findings expected.json names …”; node “the Python twin reports the same findings …” |
| JS: any mention of a Mermaid fence counts as a block | `docs/assets/artifacts/use-cases.mjs` | node “every fixture yields exactly the findings expected.json names …”; node “the Python twin reports the same findings …” |
| JS: an image address with a query is not an image | `docs/assets/artifacts/use-cases.mjs` | `test_diagrams_are_mermaid` test_the_dashboards_reader_reports_the_same_on_their_lines; node “every fixture yields exactly the findings expected.json names …”; node “A FINDING READS LIKE A COMPILER MESSAGE …”; node “the Python twin reports the same findings …” |
| JS: an HTML `<img>` is not looked for | `docs/assets/artifacts/use-cases.mjs` | `test_diagrams_are_mermaid` test_the_dashboards_reader_reports_the_same_on_their_lines; node “every fixture yields exactly the findings expected.json names …”; node “A FINDING READS LIKE A COMPILER MESSAGE …”; node “the Python twin reports the same findings …” |
| JS: an image with a title is missed (the old pattern) | `docs/assets/artifacts/use-cases.mjs` | node “every fixture yields exactly the findings expected.json names …”; node “the Python twin reports the same findings …” |
| JS: the id is not compared with the file name | `docs/assets/artifacts/use-cases.mjs` | node “every fixture yields exactly the findings expected.json names …”; node “A FINDING READS LIKE A COMPILER MESSAGE …”; node “the Python twin reports the same findings …” |
| JS: a file name with one digit is accepted | `docs/assets/artifacts/use-cases.mjs` | node “every fixture yields exactly the findings expected.json names …”; node “A FINDING READS LIKE A COMPILER MESSAGE …”; node “the Python twin reports the same findings …” |
| JS: title is not required | `docs/assets/artifacts/use-cases.mjs` | node “every fixture yields exactly the findings expected.json names …”; node “the Python twin reports the same findings …” |
| JS: the old key stage is not named | `docs/assets/artifacts/use-cases.mjs` | node “every fixture yields exactly the findings expected.json names …”; node “the Python twin reports the same findings …” |
| JS: without front matter the checks go on | `docs/assets/artifacts/use-cases.mjs` | node “every fixture yields exactly the findings expected.json names …”; node “the Python twin reports the same findings …” |
| JS: the line of a name under realises is one too high | `docs/assets/artifacts/use-cases.mjs` | `test_usecase_realises` test_the_dashboards_reader_reports_the_same_name_on_its_line; node “A FINDING READS LIKE A COMPILER MESSAGE …” |
| JS: the line of an image counts from the file's first line | `docs/assets/artifacts/use-cases.mjs` | `test_diagrams_are_mermaid` test_the_dashboards_reader_reports_the_same_on_their_lines; node “A FINDING READS LIKE A COMPILER MESSAGE …” |
| JS: a Map of known names is read as its entries | `docs/assets/artifacts/use-cases.mjs` | node “the known names may be a list, a Set or the Map …” |
| JS: the artifact is the file name, not the identifier | `docs/assets/artifacts/use-cases.mjs` | node “A FINDING READS LIKE A COMPILER MESSAGE …” |
| JS: parseUseCase keeps the Mermaid block in its section's prose | `docs/assets/artifacts/use-cases.mjs` | node “parseUseCase — identifier, title, area, actors, realises, the sections by heading, and every Mermaid diagram” |
| JS: parseUseCase ends a section at a lower heading | `docs/assets/artifacts/use-cases.mjs` | node “parseUseCase — …” |
| JS: parseUseCase finds no diagrams | `docs/assets/artifacts/use-cases.mjs` | node “parseUseCase — …” |
| JS: identifierKept never refuses | `docs/assets/artifacts.mjs` | node “AN EDITED FILE KEEPS ITS IDENTIFIER · A SAVE IS REFUSED WHEN THE TEXT CHANGED MEANWHILE — ARC and MOD”; node “AN EDITED FILE KEEPS ITS IDENTIFIER — a use case whose text carries another identifier, or none, is refused” |
| JS: identifierKept lets a text without an id pass | `docs/assets/artifacts.mjs` | node “AN EDITED FILE KEEPS ITS IDENTIFIER · … — ARC and MOD”; node “AN EDITED FILE KEEPS ITS IDENTIFIER — a use case …” |
| py: a name under realises is not looked up | `tests/artifact_checks.py` | `test_usecase_realises` test_a_name_no_requirement_has_is_reported; `test_usecase_realises` test_the_problem_names_the_file; node “the Python twin reports the same findings …” |
| py: the form of a name is not checked | `tests/artifact_checks.py` | `test_usecase_realises` test_a_name_in_another_form_is_reported; `test_usecase_realises` test_without_known_names_only_the_form_is_checked; node “the Python twin reports the same findings …” |
| py: any mention of a Mermaid fence counts as a block (the old check) | `tests/artifact_checks.py` | `test_diagrams_are_mermaid` test_a_use_case_without_a_mermaid_block_is_reported; node “the Python twin reports the same findings …” |
| py: an HTML `<img>` is not looked for | `tests/artifact_checks.py` | `test_diagrams_are_mermaid` test_a_diagram_stored_as_an_image_is_reported; node “the Python twin reports the same findings …” |
| py: an image address with a query is not an image | `tests/artifact_checks.py` | `test_diagrams_are_mermaid` test_a_diagram_stored_as_an_image_is_reported; node “the Python twin reports the same findings …” |
| py: the id message in Python's repr (drift of one word) | `tests/artifact_checks.py` | node “the Python twin reports the same findings …” |
| py: the section ## Postcondition is not required | `tests/artifact_checks.py` | `test_usecase_fields` test_counter_proof; node “the Python twin reports the same findings …” |
| py: an empty realises is accepted | `tests/artifact_checks.py` | `test_usecase_fields` test_counter_proof; `test_usecase_realises` test_a_use_case_that_realises_nothing_is_reported; node “the Python twin reports the same findings …” |
| repository: a use case realises a name in lower case | `docs/use-cases/UC-021-group-artifacts-into-a-hierarchy.md` | `test_usecase_fields` test_every_use_case_is_complete; `test_usecase_realises` test_every_use_case_of_this_repository_names_requirements_by_name; node “every use case of this repository passes the dashboard's reader” |
| repository: a use case without its Mermaid block | `docs/use-cases/UC-021-group-artifacts-into-a-hierarchy.md` | `test_diagrams_are_mermaid` test_every_use_case_of_this_repository_has_a_mermaid_block_and_no_image; `test_usecase_fields` test_every_use_case_is_complete; node “every use case of this repository passes the dashboard's reader” |
| repository: a use case refers to an image | `docs/use-cases/UC-021-group-artifacts-into-a-hierarchy.md` | `test_diagrams_are_mermaid` test_every_use_case_of_this_repository_has_a_mermaid_block_and_no_image; `test_usecase_fields` test_every_use_case_is_complete; node “every use case of this repository passes the dashboard's reader” |
| repository: an image file beside the use cases (`docs/use-cases/flow.png`) | planted | `test_diagrams_are_mermaid` test_no_image_file_is_kept_beside_the_use_cases_and_the_architecture |
| repository: an image file beside the architecture (`docs/architecture/components.svg`) | planted | `test_diagrams_are_mermaid` test_no_image_file_is_kept_beside_the_use_cases_and_the_architecture |

The twin test is the one that catches drift. The row *py: the id message in Python's repr* changes one word of one finding,
in the Python reader only. Only `tests/artifacts-twin.test.mjs` turns red; the tests of each reader stay green.

Before and after the series: `cd tests && python3 -m unittest` ran 107 tests, OK; `node --test tests/*.test.mjs` ran 141
tests, 141 pass.
