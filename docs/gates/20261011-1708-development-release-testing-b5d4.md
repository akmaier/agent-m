---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - a86a15e490955bc99821560670238c266bfdb5b5
  - https://github.com/akmaier/agent-m/pull/385
date: 2026-10-11 17:08 UTC
---
# Development → Release testing: ITM-312

**REGISTER**

## Reason

ITM-312, pull request #385 by developer-sonnet-d into `sprint/team1/17`, on head `a86a15e`, against the item and
MOD-repository-hosts' accepted file as they stand on the sprint's branch. All five points hold:
- The first commit, `1e04a62`, holds only `tests/repository-hosts-clone.test.mjs`, and CI was red on it (run
  38157561349): node failed on exactly its 6 tests. The second tests-only commit, `f01931a`, adds the cases the faults
  planted on the draft left standing, red on 8 (run 38157761780).
- CI is green on the head (run 38158167391): node 1566 tests, 0 failed; python 441 tests, OK. On the first code commit,
  `49ffef1`, python failed, `test_no_backend` and `test_release_sprint_02_d` refusing a dynamic `import()`; the head
  takes Node's modules through `process.getBuiltinModule` and a static import instead.
- Only MOD-repository-hosts' folder — the new `local-git.mjs` and `index.mjs` — and the new test whose header names the
  module change; no existing test or expected result changes. `openPullRequest`, which the host now offers and refuses
  with `NotSupported` until its REST adapters exist, is an interface the module file names.
- The 8 new tests name what they guard in their file's header — among them `WITHOUT A TOKEN, THE INSTANCE'S WORKFLOW
  WRITES THE CHANGE` and `NO SECRET IN THE REPOSITORY` — and MOD-repository-hosts, with 19 planted faults recorded.
- The Acceptance holds, with a bare repository in a temporary folder as the origin and a clone of it: a snapshot at a
  branch with its paths and a file's text; a commit the clone lacks fetched, one the origin lacks `NotFound`; two files
  committed and pushed in one commit at the expected head; `Moved`, nothing pushed, after another commit landed first;
  a file holding a configured secret refused by its path; a pull request through the clone `NotSupported`; the node
  job, these tests among them, within CI's two minutes.

Noted for the sprint's review, no condition of this gate: a browser that refuses a clone cannot be tested in Node; files
are committed with mode 100644; only a commit identifier is fetched; and the commit is signed with the clone's own git
identity.
