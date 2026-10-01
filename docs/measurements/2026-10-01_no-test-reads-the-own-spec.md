# No test reads Agent M's own SPEC.md — the readers found, and the counter-proofs on fixture text (ITM-128)

**MESSUNG** — 2026-10-01, branch `team/ITM-128` (on `sprint/02` at `b80079d`), macOS, Node 25.9.0, Python 3.14.6.

## 1. Which tests open the repository's own `SPEC.md`

**Method.** Both suites ran as CI runs them (`node --test tests/*.test.mjs`; `cd tests && python3 -m unittest`), each
with a tracer loaded before any test module:

- Node: a module given to `node --import` that wraps `readFileSync`, `readFile`, `open`, `openSync`,
  `createReadStream`, `readdir`/`readdirSync`, the three `fs.promises` readers, every `child_process` starter and
  `fetch`, and appends each call with its absolute path to a log. `node --test` hands the flag to every test process.
- Python: a `sitecustomize.py` on `PYTHONPATH` that registers an audit hook (`sys.addaudithook`) and logs every
  `open`, `os.listdir`, `os.scandir` and `subprocess.Popen` event with its path or arguments.

**Known positive first** (CLAUDE.md §6a.2). The read named in the item —
`readFileSync(new URL("../SPEC.md", import.meta.url))` in `tests/architecture-format.test.mjs` — had to appear in the
Node log; it did, once. Only then was an absence read as one.

**Result at `b80079d`** (node 244 tests, python 197, all green):

| Reader | Opens the root `SPEC.md` | How |
|---|---|---|
| `tests/architecture-format.test.mjs`, test *specRequirements — the names in SPEC.md …* | yes, 1× | `readFileSync(new URL("../SPEC.md", …))`, the four assertions on the real SPEC |
| `tests/test_products_folder.py`, `test_instance_repository_names_no_product` | yes, 1× | `git ls-files` over the instance repository, then `read_bytes()` of every committed file — `SPEC.md` among them — searched for product addresses |
| every other test | no | the other `SPEC.md` files opened are fixtures (`tests/fixtures/architecture/`, `identity/v1`, `identity/v2`, `groups/repo/`) or files the tests wrote into temporary directories |

No test starts `git show`, `git cat-file` or a file server over the repository root: the subprocesses logged are
`git hash-object`, `git ls-files`/`check-ignore`/`status` in the repository or in temporary ones, `node --check` on
`docs/assets/`, and `node -e`/`python3 -c` children that receive their texts on standard input. The static search
(`../SPEC.md`, `ROOT / "SPEC.md"`, `join(…, "SPEC.md")`) finds the same single line in `architecture-format.test.mjs`
and nothing else outside fixtures and temporary roots.

**After the change** the Node log holds no read of the root `SPEC.md` (244 tests, green). The Python reader in
`tests/test_products_folder.py` is unchanged — it is outside ITM-128's module and its files (see the pull request).

## 2. Counter-proofs of the specRequirements test on fixture text

The four assertions that read the real SPEC now run on fixture text: the section of
`tests/fixtures/architecture/SPEC.md` under 84 headings of its own (`## 1. Rules` … `## 84. Rules`, each name
suffixed with its number — 252 requirements), followed by `## 85. Withdrawn and live` with three requirements in the
shapes the real SPEC supplied — a withdrawal on one line after a rewording (`OLD RULE ON ONE LINE`), the live
requirement that replaces it right after it, with an extension in its source (`RULE ONE REPLACES IT`), and a live
name holding the word WITHDRAWN (`A RENAMED RULE IS WITHDRAWN AND ADDED`). The expected values are those of the old
assertions: more than 250 requirements, `true`, `false`, `false`.

**Method.** Each mutation replaced exactly one piece of text in `docs/assets/artifacts/requirements.mjs`
(`parseRequirements`, which `specRequirements` returns). Three versions of the test file then ran with
`node --test --test-reporter=tap`: the file as it was at `b80079d` (reading `../SPEC.md`); the same file without the
four lines that read it (the fixture assertions only); and the new file. Then both full suites ran against the new
file, and the code was restored (`git diff` empty). Unmutated, all three versions were green (6 of 6).

| Mutation | Old, reads `../SPEC.md` | Old without the read | New, fixture text | Full suites (new) |
|---|---|---|---|---|
| F1 a withdrawal written on one line is read as live — only a `withdrawn` after a line break counts (`/\n\s*withdrawn/i`) | red | **green** | red | node 2 of 244 red; python OK |
| F2 WITHDRAWN in the name counts as a withdrawal — the whole head is searched (`m[0]` for `m[2]`) | red | **green** | red | node 1 of 244 red; python OK |
| F3 a withdrawal carries over to the requirement right after it | red | **green** | red | node 3 of 244 red; python 7 failures |
| F4 only the requirements before the second `## ` heading are read | red | **green** | red | node 7 of 244 red; python 4 failures, 1 error |

In every row the red test of the two red columns is *specRequirements — the names in SPEC.md; a withdrawn one is
marked; prose in bold is no requirement*. The middle column is the gap the real SPEC used to close: without it, the
fixture alone caught none of the four faults. F1 is the fault the item names (a withdrawn requirement read as live).

## 3. Both suites

| | before (`b80079d`) | after |
|---|---|---|
| `node --test tests/*.test.mjs` | 244 tests, 244 pass | 244 tests, 244 pass |
| `cd tests && python3 -m unittest` | 197 tests, OK | 197 tests, OK |
