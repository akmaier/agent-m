---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: rejected
on:
  - 0b24b56ab8eca514e4d45a523d8ba2fdd4e34490
  - https://github.com/akmaier/agent-m/pull/723
date: 2026-10-17 10:55 UTC
---
# Development → Release testing: ITM-591, A source gets a new version in the library, and a product moves to it

**REGISTER**

## Reason

ITM-591, pull request #723 into `sprint/team1/71`, at head `0b24b56a`. developer-sonnet-e wrote it.

**What holds.**
- **Red.** The tests-only commit `bd0e6481` was red in run 39026243601. Node (2) has `# fail 15` and `# todo 1`
  (existing): TST-591301 to 591315, on behaviour.
- **CI and merging.** CI is green, ten of ten in run 39026497911, and the pull request is mergeable.
- **Other checks.**
  - Eight planted faults are caught.
  - The draft run changed no existing test, and `release-uc-004` passes 55 of 55 before and after.
  - The fetch spy saw nothing, and ITM-018 passes.
- **The token budget is accepted.** TST-591313 counts it: opening `library/<source>` sends 4 requests per kept product,
  and *Move* 6 + 8.
  - The products are different repositories. `readMany` batches the files of one snapshot, so no batch can join them.
  - Their number is the person's own list of products, not the size of a repository.
  - That is unlike ITM-598 and ITM-648, whose reads grew with one repository's files and could have been batched.
- **The scope inside MOD-settings-pages is accepted.** The registration's file choice, public statement and commit loop
  became shared functions, and `sources.mjs` shares its link reading and writing (nothing twice).
  `release-uc-004` and the registration tests pass unchanged, so the existing path is covered.
- **The readings are taken:**
  - "older" is an earlier row of `## Versions`;
  - passages are shown only when every file of both versions is stored;
  - the trailers "Source moved:" and "Requirement affected:" name the move in the commit;
  - a move without a token writes nothing.

**Rejected: two new steps do not explain themselves.**
- `EVERY STEP EXPLAINS ITSELF` (SPEC.md:1055) reads: "Every step that asks something of the person carries an
  explanation that can be expanded, written for someone new to GitHub."
- *+ New version*'s panel folds the existing topics `file-only-hashed` and `source-public` (TST-591315). These explain
  hashing and publishing, not what a new version of a source is: that a version is never overwritten, and that products
  stay on theirs until moved.
- *Move* asks the person to move a product to a newer version, and folds nothing. It should say what that does: the
  requirements naming the source are marked *source changed* until looked at, and the passages shown are what changed.
- The developer did not add topics because they are MOD-site-frame's, which the item did not hold. That is the start's
  gap, by sprint 65's agreement ("names every module whose file the item must change, including MOD-site-frame for every
  new topic"). MOD-site-frame now joins the item's modules.

**What is asked, in new commits, nothing rewritten.**
1. Two topics in `src/site-frame/explanations.md`, `source-new-version` and `source-move`, each written for someone new to
   GitHub. *+ New version* and *Move* fold them through `explain`.
2. Tests that each step holds its folded topic, red first (sprint 56's agreement).
3. The draft run lists any further changed test, and stops at a release test (sprints 68 and 70).

**Findings** (sprint 63's agreement):
- **`readRegisterOf` reads each register entry with a request of its own, even with a token.** The register lives in one
  repository, so that breaks `A PAGE LOAD READS THE REPOSITORY IN BATCHES`, and it did so before this item. This is
  registered as ITM-704.
- **UC-016 step 1's other routes,** a newer commit of a repository source and a new version of an EU legal text, are not
  built. This page records versions by files. This is registered as ITM-705.
- **`saveFile` takes no commit text of the person's own: no item.** UC-016's "a commit message that names those
  requirements" is met by the trailers.
- **ITM-703,** UC-016's release test, follows this item, by another participant.
