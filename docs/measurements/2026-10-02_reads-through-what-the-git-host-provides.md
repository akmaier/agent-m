# The dashboard reads only through what MOD-git-host provides — the fix of findings A1 and A2, requests and counter-proofs (ITM-130)

**MESSUNG** — 2026-10-02, branch `team/ITM-130-a1a2` from `sprint/02` at `3c0dd5e`, pull request #70, macOS, Node 25.9.0,
Python 3.14.6. CI runs Node 22 (`.github/workflows/tests.yml`).

**Author.** `developer-opus-a` (claude-opus-5-5), the developer of strand A, taking ITM-130 up again after the Product
Owner's gate decision of 2026-10-02 (`docs/backlog/sprints/sprint-02.md`, *Decided on 2026-10-02*, marks A1 and A2;
ITM-130, *Back from Release testing*).

## The findings, as paths

**A1.** `docs/assets/dashboard/writes.mjs:13` imported `fetchText` → `:94` `addProduct` (UC-001 step 5), GitHub branch →
`:113` `fetchText("https://api.github.com/repos/<repo>/git/trees/<branch>?recursive=1", {}, token)`. Ist: the tree of the
default branch read through the git host's request helper, which MOD-git-host calls internal. Soll: through
`readSnapshot({ product, ref: info.defaultBranch, token })` — the branch resolved to one commit, then that commit's tree.

**A2.** `docs/assets/dashboard/settings-view.mjs:17` imported `gitlabProject` (not among MOD-git-host's `provides`) →
`:829` `checkGitLab` (UC-001's Check, UC-042's Test of a GitLab token) → `:832` `gitlabProject({ product, token })` →
`GET <server>/api/v4/projects/<id>`. Ist: a read past `provides`; the server check rested on `path_with_namespace`. Soll:
through `repositoryInfo({ product, token })`, which sends the same request and reports `visibility`, `defaultBranch` and
`role` — everything the check uses; an answer with neither a visibility nor a default branch "did not answer as a GitLab
server". No interface change.

## The fix

- `writes.mjs`: `fetchText` leaves the import; the GitHub branch of `addProduct` reads `readSnapshot(...)` and computes the
  missing layout from its tree (`readSnapshot` already keeps only blobs, as the old line filtered them).
- `settings-view.mjs`: `gitlabProject` leaves the import; `checkGitLab` reads `repositoryInfo(...)` and passes its `role` to
  `gitlabRole` — `repositoryInfo` takes the level from `project_access`, else `group_access`, else `null`, exactly as the old
  line did. Every sentence a person reads is unchanged.

## Runs

| Commit | Python (`cd tests && python3 -m unittest`) | Node (`node --test tests/*.test.mjs`) | CI |
|---|---|---|---|
| `3c0dd5e` (start) | 366, OK (expected failures=5) | 496, pass 484, fail 0, todo 12 | — |
| `e4bb464` (red: tests only) | 366, FAILED (failures=1, expected failures=5): `test_release_sprint_02_c … test_no_node_test_opens_agent_ms_own_spec`, which runs the node suite and is red while it is | 500, pass 485, fail 5, todo 10 | red — runs 36941565826 (push) and 36941579716 (pull request): *Python checks* failed with the same failure |
| fix | 366, OK (expected failures=5) | 500, pass 490, fail 0, todo 10 | see the pull request |

The five red node tests of `e4bb464`: release cases 9 and 10 (their marks removed), the changed check "no file of the
dashboard imports fetchText" (no `DIRECT_READ` exception), the new check "no file of the dashboard imports a read MOD-git-host
keeps to itself", and the new check that Add product reads a GitHub product through `readSnapshot`. The todo count drops by
two (12 → 10): release cases 9 and 10 carry no mark and pass. Four node tests are new; the two GitLab-check tests among them
are characterisations, green before and after.

## Requests

Counted with `scratchpad/itm130a-developer-opus-a/count-requests.txt` (not committed), a fake `fetch` that records every request,
before (`3c0dd5e`) and after the fix:

| Action | Before | After |
|---|---|---|
| *Add product*, GitHub product without the layout (layout written) | 7 — repository, tree by branch name, ref, commit, POST tree, POST commit, PATCH ref | 8 — repository, **commit of the branch**, tree of that commit, ref, commit, POST tree, POST commit, PATCH ref |
| *Add product*, GitHub product with the complete layout (nothing written) | 2 | 3 |
| *Add product*, GitLab product (layout written) | 11 | 11, unchanged |
| GitLab check (*Check* / *Test*), with or without the project token | 1 — `GET <server>/api/v4/projects/<id>` | 1 — the same request |

One request more on the one click of UC-001 step 5, which no page load repeats, as the item's decision foresaw. The GitLab check
sends the same request, with the token only to its own project's API.

## Counter-proofs

`scratchpad/itm130a-developer-opus-a/counter-proofs.txt` (not committed): one fault planted at a time in the fixed code, the named
test files run (`node --test --test-reporter=tap`), the file restored and checked equal to the saved text afterwards. Before and
after the series all three files are green. The red result of every new check on the unfixed code is the red commit `e4bb464`
above.

| Id | File | Fault | Red |
|---|---|---|---|
| K01 | `dashboard/writes.mjs` | `fetchText` imported again | release cases 9 and 10; "no file of the dashboard imports fetchText"; "no file of the dashboard imports a read MOD-git-host keeps to itself" |
| K02 | `dashboard/settings-view.mjs` | `gitlabProject` imported again | release case 10; "… imports a read MOD-git-host keeps to itself" |
| K03 | `dashboard/settings-view.mjs` | a namespace import of the git host | "… imports fetchText"; "… imports a read MOD-git-host keeps to itself" |
| K04 | `dashboard/writes.mjs` | `readSnapshot` asked for `HEAD` instead of the default branch | "Add product reads a GitHub product through readSnapshot" and three tests of Add product |
| K05 | `dashboard/writes.mjs` | the layout computed from an empty tree instead of the snapshot's | "UC-001 5b" (a complete layout writes nothing); the new readSnapshot test stays green — it checks the requests, 5b the layout |
| K06 | `dashboard/settings-view.mjs` | `priv` inverted (`visibility === "public"`) | "the GitLab check reports reach, branch and role as before" |
| K07 | `dashboard/settings-view.mjs` | the role taken as Developer whatever the server reports | same |
| K08 | `dashboard/settings-view.mjs` | the project read without the project token | same (the request carries no token) |
| K09 | `dashboard/settings-view.mjs` | the server check removed | "a server whose answer reports neither a visibility nor a default branch did not answer as a GitLab server" |
| K10 | `dashboard/settings-view.mjs` | the server check demands a visibility **and** a default branch | same (its known positive, an empty project with no branch yet, is refused) |

## Readings

- **Characterisation tests in the red commit.** The two GitLab-check tests pass before and after; they were committed with the
  red tests so that the commit that changes `checkGitLab` is measured against them. The commit's red result comes from the
  other three new or changed checks and the two release cases.
- **What counts as a read MOD-git-host keeps to itself.** The new repository check names `fetchText`, `request`,
  `gitlabProject`, `gitlabSnapshot` and `gitlabReadFile` — the exported functions of `git-host.mjs` that send a GET and are not
  in its `provides` — and asserts that none of them is in the `provides` list read from `docs/architecture/MOD-git-host.md`.
  Other non-provided names the dashboard imports (`REPO_RE`, `isGitLab`, the link builders, `tokenIdentity`, `writeRoute`,
  `writeFiles`, `commitFilesGitLab`) send no request or are refused without an authority; as in the release record's reading
  R3, whether code and module files agree on those is ITM-138's.
- **Fixtures of other tests.** `tests/dashboard-add-product.test.mjs`, `tests/dashboard-review-flows.test.mjs`,
  `tests/release-sprint-01-dashboard-app.test.mjs` and `tests/release-sprint-02-d-dashboard-app.test.mjs` answer a GitHub tree
  read by branch name (the first three by mapping it onto their fake server's head, the last with the server's files). Add
  product no longer makes that read; the server of `tests/app-harness.mjs` they build on already answers `GET /commits/main` and
  the tree of the head, so they pass unchanged. Their route is now unused; it is left as it is (not this item's fixture).
