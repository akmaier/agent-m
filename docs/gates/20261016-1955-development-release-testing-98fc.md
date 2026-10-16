---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: rejected
on:
  - c10480b79c7ab1d155a3340c2f251a1ed3c87c7a
  - https://github.com/akmaier/agent-m/pull/627
date: 2026-10-16 19:55 UTC
---
# Development → Release testing: ITM-548, The job workflow is added to a product's .gitlab-ci.yml, every other line kept

**REGISTER**

## Reason

ITM-548, pull request #627 into `sprint/team1/51`, at head `c10480b7`. developer-sonnet-a wrote it, as `51.md` assigns.

**An `inputs:` written inline makes the file hold the key twice.** `src/runtimes/ci.mjs:121` looks for the header's
`inputs:` only as a line that ends after the colon (`/^\s+inputs:\s*$/`). A header with `inputs: {}` is therefore not
found. Line 123 then adds a second block `inputs:` before the `---`, so the header's map holds `inputs` twice. Line 161
does the same for the existing entry's `inputs:`.

ITM-548's reading refuses a single-string or map `include:` as `GitlabCiNotList`, because adding to it would rewrite a
line of the product's own. An inline `inputs:` is the same case. Here the outcome is worse than a rewrite: the YAML
becomes one that GitLab may read otherwise, or refuse.

The item now settles it. An inline `inputs:`, in the header or in the existing entry, is refused with the same
`GitlabCiNotList`, whose message names the part that is not written as a block, and nothing is written.

The developer adds this as a new commit, with a test that is red on `c10480b7`: a header with `inputs: {}`, and an entry
with `inputs: { job: x }`, each refused, with nothing returned. A planted fault that drops the refusal must fail it.

**The other checks hold on this head and carry over:**
1. **Red first.** `6e155a84` was pushed alone. Run 38957443151 fails exactly:
   - TST-548101 and TST-548102 on node (3);
   - TST-548001–007 on node (6);

   on behaviour. TST-548008 holds on purpose, since a product without a file gets the whole file as before.
2. **CI is green** on `c10480b7`, in run 38958113408. `git merge-tree` merges it into `sprint/team1/51` without a
   conflict.
3. **Scope.** `src/runtimes/ci.mjs` and `src/settings-pages/settings.mjs`, and two new test files.
   - No existing test changes.
   - Under a refusing spy, 353 tests make no request.
   - ITM-018 passes.
   - The release tests give the one known failure of TST-320321902, as on the base.
4. **Counter-proofs.** Four planted faults are each caught.

**The developer's readings 1–4 are within the item:**
- an inline list `include: [..]` is refused, as a map is;
- an existing entry written as a plain string is refused, since it cannot pass inputs without a rewrite;
- the entry is written quoted, as ITM-532's template writes it, and an existing one is known with or without quotes or a
  leading slash;
- a final newline is added when something is added.
