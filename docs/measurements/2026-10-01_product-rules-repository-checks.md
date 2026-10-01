# The repository checks of the hard product rules — counter-proofs (ITM-050)

**MESSUNG** — 2026-10-01, branch `team/ITM-050` (on `sprint/02` at `a269411`), tests at `0733ea7` and `5d53d94`, macOS, Node 25.9.0,
Python 3.14.6, git 2.54.0. developer-opus-d (claude-opus-5-5).

The counter-proofs of the three checks the SPEC names for `NO SERVER`, `ARTIFACTS ARE MARKDOWN` and `THE PRODUCT
REPOSITORY IS SELF-SUFFICIENT` (`A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`, SOFTWARE_MAINTENANCE §4.0a rule 5). No code
changed. All three rules hold on `a269411`: each check is green on the repository from its first commit, and red on each
fault planted below.

## Suites

| | before (`a269411`) | after (`5d53d94`) |
|---|---|---|
| `node --test tests/*.test.mjs` | 332 tests — 327 pass, 5 todo | 332 tests — 327 pass, 5 todo |
| `cd tests && python3 -m unittest` | 246 (2 expected failures) | 268, OK (2 expected failures) |

24 Python tests added (`test_no_backend` 11, `test_artifact_format` 7, `test_self_sufficient` 6), 2 removed from
`tests/test_pages_layout.py` (the address scan and its counter-proof, now in `test_no_backend`). The *before* run was made
on an export of `a269411` outside a git checkout; there `test_products_folder.test_readme_is_tracked` fails for that reason
alone and is not counted as a failure.

## Which rule is checked where

| Rule | Check (SPEC-named file) | What it reads |
|---|---|---|
| `NO SERVER` | `tests/test_no_backend.py` | the built site — every tracked `.html`, `.css`, `.mjs` and `.js` under `docs/`, the vendored libraries included (there is no build step, ARC-002), and the Markdown files under `docs/` the dashboard renders |
| `ARTIFACTS ARE MARKDOWN` | `tests/test_artifact_format.py` | every tracked file in the places of ARC-006's table; every file Agent M's writers put into the fixture product |
| `THE PRODUCT REPOSITORY IS SELF-SUFFICIENT` | `tests/test_self_sufficient.py` | the fixture product made by Agent M's own writers through node: `missingLayout`, `planAcceptance` for a use case and a SPEC entry, `setProductSetting`, `formatCollaborators` |

`tests/test_pages_layout.py` keeps `THE PAGES ROOT IS DOCS` and `ONE REVIEW LAYOUT FOR EVERY PRODUCT`; its `Guards:` line no
longer names `NO SERVER`. The origin gate of the git host (`prepare` in `docs/assets/git-host.mjs`) stays checked where it
was, in `tests/review-core.d/git-host.test.mjs`; `test_no_backend` checks that every request of the site goes through it
or through another known channel, not the gate itself.

The permitted hosts in `test_no_backend` are the SPEC's list as far as it can stand in code: GitHub's API, raw and web
hosts (the repository server of the instance and of GitHub products), Microsoft Graph and its sign-in (the mail
provider — permitted, not yet called), and the loopback names of the bridge. Configured endpoints, GitLab servers and the
jump host come from settings or a product's address and never stand in the code. A package registry or resource host
enters the list with the notice that names it before the call.

## Counter-proofs on the repository

Each fault planted in a real file, the module run, the file restored (`git checkout --`, a new file removed
from the index); after all of them `git status` showed nothing but the scratch folder and the three modules were green.
Run on `0733ea7` and again on `5d53d94`, with the same result in every row. Script:
`scratchpad/itm050-developer-opus-d/plant.txt` (not committed).

| | Planted fault | Module | Red tests | Result |
|---|---|---|---|---|
| N1 | `fetch("https://telemetry.example.org/v1", …)` appended to `docs/assets/dashboard/how-view.mjs` | `test_no_backend` | test_every_address_in_the_own_code_names_a_permitted_host, test_requests_leave_only_through_the_known_channels | FAILED (failures=2) |
| N2 | `<script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js">` in `docs/index.html` | `test_no_backend` | test_every_address_in_the_own_code_names_a_permitted_host, test_requests_leave_only_through_the_known_channels | FAILED (failures=2) |
| N3 | `request` in `docs/assets/git-host.mjs` sends `fetch(url, opts)` without `prepare` | `test_no_backend` | test_requests_leave_only_through_the_known_channels | FAILED (failures=1) |
| N4 | `elk: { workerUrl: "https://cdn.example/elk-worker.js" }` in the dashboard's `mermaid.initialize` | `test_no_backend` | test_every_address_in_the_own_code_names_a_permitted_host, test_the_dashboard_sets_no_worker_address_for_mermaid | FAILED (failures=2) |
| N5 | `@import url("https://fonts.googleapis.com/…")` appended to `docs/assets/style.css` | `test_no_backend` | test_every_address_in_the_own_code_names_a_permitted_host, test_requests_leave_only_through_the_known_channels | FAILED (failures=2) |
| N6 | `![](https://tracker.example/p.png)` appended to `docs/use-cases/UC-001-add-a-managed-product.md` | `test_no_backend` | test_no_served_markdown_loads_from_another_host | FAILED (failures=1) |
| N7 | `trust:!0` added to KaTeX's options in `docs/assets/vendor/mermaid.min.js` | `test_no_backend` | test_mermaid_renders_katex_untrusted | FAILED (failures=1) |
| A1 | a new file `docs/architecture/components.svg` (intent to add) | `test_artifact_format` | test_every_artifact_of_this_repository_is_markdown_with_mermaid_diagrams | FAILED (failures=1) |
| A2 | a new file `docs/approvals/UC-001-0123456789ab.json` (intent to add) | `test_artifact_format` | test_every_artifact_of_this_repository_is_markdown_with_mermaid_diagrams | FAILED (failures=1) |
| A3 | a ` ```plantuml ` block appended to `docs/architecture/ARC-001-static-site-no-server.md` | `test_artifact_format` | test_every_artifact_of_this_repository_is_markdown_with_mermaid_diagrams | FAILED (failures=1) |
| A4 | `approvalPath` in `docs/assets/review-core.mjs` names `.json` | `test_artifact_format` | test_every_file_agent_m_writes_into_a_product_is_markdown_with_mermaid_diagrams | FAILED (failures=1) |
| A5 | `missingLayout` writes `![layout](layout.png)` into the use-case README | `test_artifact_format` | test_every_file_agent_m_writes_into_a_product_is_markdown_with_mermaid_diagrams | FAILED (failures=1) |
| S1 | `missingLayout`'s approvals README names `docs/assets/dashboard/writes.mjs` | `test_self_sufficient` | test_no_artifact_of_the_fixture_product_references_what_exists_only_inside_agent_m | FAILED (failures=1) |
| S2 | `setProductSetting` names `https://akmaier.github.io/agent-m/#settings` | `test_self_sufficient` | test_no_artifact_of_the_fixture_product_references_what_exists_only_inside_agent_m | FAILED (failures=1) |
| S3 | `formatCollaborators` names `tools/apply_approvals.py` | `test_self_sufficient` | test_no_artifact_of_the_fixture_product_references_what_exists_only_inside_agent_m | FAILED (failures=1) |
| S4 | the SPEC skeleton of `missingLayout` names `http://localhost:8765` | `test_self_sufficient` | test_no_artifact_of_the_fixture_product_references_what_exists_only_inside_agent_m | FAILED (failures=1) |
| S5 | `recordText` adds `written-by: docs/assets/review-core.mjs` to every approval record | `test_self_sufficient` | test_no_artifact_of_the_fixture_product_references_what_exists_only_inside_agent_m | FAILED (failures=1) |

`5d53d94` corrects one reader found by this measurement itself: the served-Markdown check of `test_no_backend` read
the planted faults quoted in code spans of this file as loads. A code span or a fence is rendered as text; the check now
reads outside them, and the counter-proof in the suite holds both cases.

## Counter-proofs inside the suite

Each module also runs its readers on planted texts on every run, so that a reader that stops finding is red at once:
`test_no_backend` — a foreign address, ten unknown channels (fetch, beacon, WebSocket, XMLHttpRequest, a dynamic import
from a CDN, a worker, a created script element, an image tag with a foreign address, CSS `@import` and `url()`), a
permitted channel without its evidence or found more often than permitted, a method named `fetch` and a comment that are
no call, a Markdown file that loads from other hosts and the same addresses in a code span and a fence, which must pass; `test_artifact_format` — a JSON record and an SVG file, PlantUML and
dot blocks, a Markdown image, an HTML image and a link to a draw.io file, and the same things inside code and fences
that must pass; `test_self_sufficient` — Agent M's own files (by code span, prose and relative link), Agent M's Pages site,
repository and API, the bridge, and paths the product holds or nobody holds, which must pass. Known positives on real
files keep each reader honest: the use cases' Mermaid blocks, the image of `tests/fixtures/use-cases/UC-013-image-diagram.md`,
the queue folder and record paths the fixture product names.

## Observed, not decided here

- The fixture product's generated texts say where the files are changed — *"Reviewed on the Agent M dashboard"*,
  *"written by the Agent M dashboard"*, *"accepted on the Agent M dashboard"* (`missingLayout`, `docs/assets/review-core.mjs`),
  *"Changed on the Agent M dashboard (Settings)"* (`setProductSetting`, `formatCollaborators`,
  `docs/assets/pseudonymiser.mjs`). `test_self_sufficient` reads a reference as a path or an address; it does not count
  naming the tool in prose as one. Whether such a sentence is a reference to a service that exists only inside Agent M is
  a reading of the SPEC's check that only `akmaier` can settle.
- The dashboard renders a Markdown file with `DOMPurify.sanitize(marked.parse(text))` (`md` in
  `docs/assets/dashboard-app.mjs`, no options). Read in the vendored `docs/assets/vendor/purify.es.mjs`, not run in a
  browser: its default tags include `img` (`html$1`, in `DEFAULT_ALLOWED_TAGS`) and `IS_ALLOWED_URI` admits `https:`. So
  a product's artifact with an image on another host would, by that reading, be fetched from that host when shown. `test_no_backend` checks the Markdown
  this repository serves, which holds no such image; a product's files are not in this repository. Whether rendering
  such an image is a call of the built site in the sense of `NO SERVER` is not decided here.
