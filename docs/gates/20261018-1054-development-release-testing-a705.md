---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - d5f7c9e0a68e4a1febcf48a21666193027ccfa9b
  - https://github.com/akmaier/agent-m/pull/884
date: 2026-10-18 10:54 UTC
---
# Development → Release testing: ITM-705, a repository source gets a new version

**REGISTER**

## Reason

ITM-705 (MOD-settings-pages, MOD-source-register), pull request #884 into `sprint/team1/89`, passes on `d5f7c9e0`.

1. **Red first.** `511c51a2` holds only the two new test files. Run 39120392064 is red on its seven new tests, as the Scrum
   Master confirmed. `d5f7c9e0` only removes TST-705008, as ruled in `cf89b7f6`. That test cited a requirement it does not
   guard, and the other six tests stand.
2. **The change** (`4b89bcab`, only `src/settings-pages/library.mjs`, `src/source-register/content.mjs` and `index.mjs`):
   - `versionCommits` takes `version.commit`. The row's `Read from` records `<address> commit <commit>`. A repository's
     version needs no files, and `SameBytes` compares the commit (`index.mjs:214-220`). That is the text akmaier accepted
     in `831c98f5`.
   - In the library, a source whose `identifier` is a repository's address, and no EU legal text's (`repositoryOf`), offers
     no files. On *Save* it reads the commit the default branch stands at, through `currentCommit`, the same read the
     registration makes, and records it.
   - That host passes the stored secrets (sprint 81's agreement).
   - The item history at the old `library.mjs:23` ("since ITM-458") is removed, as noted at ITM-704's gate. I read it in
     the diff.
3. **Green.** Run 39120818176 on `d5f7c9e0` passes all twelve jobs. `git merge-tree --write-tree` merges the head into
   `sprint/team1/89` without a conflict (tree `07e2a9da`).
4. **The Acceptance holds:** "*+ New version* of a repository source records the newer commit it reads, and is refused
   for the commit an existing version records".
   - I replayed a counter-proof in a clean checkout of the head: with `SameBytes` comparing files instead of the commit, 5
     of 7 of the item's tests fail. Restored, `src/` is clean.
   - The developer's three counter-proofs each fail their tests: the commit comparison dropped, the legal-text exclusion
     dropped, and the commit not passed on *Save*.
   - One *Save* makes three repository requests, and opening the panel makes none, as the developer measured. That is
     within `A PAGE LOAD READS THE REPOSITORY IN BATCHES`.
5. **Release and system tests (agreement 83).** I ran on the head, with the Bridge packages installed as CI does:
   - the library's and the source register's tests with the settings release and system tests: 127 of 127;
   - the tests that import `src/source-register/` (`release-evidence-audit`, `system-uc-022-derive-architecture`): 15 of 15.

**Finding 4 needs no item.** An `https` ELI address parses as a GitLab project in MOD-repository-hosts' `parseAddress`.
That is its rule for any server that is not GitHub, because GitLab servers are configured. The only place where an
identifier can be either a repository or a legal text is `repositoryOf`, and it excludes legal texts first, as TST-705007
pins.

**developer-sonnet-a's next item is ITM-914, then ITM-900.**
