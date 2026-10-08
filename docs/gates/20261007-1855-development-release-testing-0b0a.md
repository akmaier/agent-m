---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 27f9ae89dd81c58e68b13625ccdd4483491ea5b9
  - https://github.com/akmaier/agent-m/pull/194
date: 2026-10-07 18:55 UTC
---
# Development → Release testing: ITM-253

**REGISTER**

## Reason

ITM-253, a job queued on CI: pull request #194 by developer-sonnet-c, on head `27f9ae8`, branched from `sprint/12` at
`a0bc752`.
- The first commit, `eb71a5f`, holds only `tests/runtimes-ci.test.mjs`, and CI was red on it (run 37668215301). The node
  job failed on exactly that file, whose module did not exist yet, beside the suite's known todo marks.
- CI is green on the head (run 37669525888): node 886 tests, 0 fail, 11 todo; python 396, OK. The python run on
  `7dc9c53` was red on a JSDoc `import(` in a comment; `27f9ae8` writes it in prose and changes nothing else.
- Only `src/runtimes/` — `index.mjs` and `ci.mjs`, among the module's Parts — and the new test, whose header names
  MOD-runtimes, changed.
- The four new tests name what they guard and the module, and each has its counter-proof recorded. Run on the head with
  the fault planted, each turns its test red: `Moved` swallowed; no presence check; the host's failures renamed; and the
  branch assumed `main`.
- The Acceptance holds, with the host replaced by a fake whose default branch is `trunk`:
  - the start record is committed at its path, on the head that was read, in one commit;
  - a moved head is refused, with nothing written;
  - `WorkflowMissing` names the job workflow's file on GitHub and on GitLab for a product without it;
  - the host's failures are passed on by name.

Noted, no reason by themselves; they go to the review:
- `queueOnCi` calls the host's `repositoryInfo`, which MOD-runtimes' file does not list among what it uses. `queueJob`
  is given no branch, `commitFiles` needs one, and the file's Data starts the job workflow on a push to the default
  branch. `repositoryInfo` is the one function of the host that names it, as for MOD-artifact-edits at #100.
- On GitLab, `WorkflowMissing` looks for the file `.gitlab/agent-m-jobs.yml`, not for its include in `.gitlab-ci.yml`,
  which MOD-runtimes' Data names with it. No line of the Acceptance asks for it.
