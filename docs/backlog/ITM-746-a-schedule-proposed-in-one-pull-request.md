---
id: ITM-746
title: A schedule proposed in one pull request, and the nightly pipeline schedule on GitLab
level: module
realises:
  - UC-027
  - THE CI CONFIGURATION IS GENERATED FROM THE SCHEDULE
  - GITLAB PRODUCTS ARE SUPPORTED
  - CODE ENTERS THE DEFAULT BRANCH THROUGH A PULL REQUEST WITH GREEN CI
modules:
  - MOD-test-schedule
builds_on:
  - ITM-744
  - ITM-749
  - ITM-950
tests:
  - unit
origin:
  - akmaier's request of 2026-10-17 to implement UC-021 to UC-035
  - ITM-476's "Schedule proposals use [openPullRequest]; GitLab nightly scheduling uses [setPipelineSchedule]", separated from it as ITM-635 was
---
# ITM-746 A schedule proposed in one pull request, and the nightly pipeline schedule on GitLab

**REGISTER**

## Outcome

MOD-test-schedule's `proposeSchedule(host, schedule, context)` and `applyPipelineSchedule(host, schedule)`, in
`propose.mjs`, as its file states them.
- **`proposeSchedule`** writes one branch from the head that was read and makes one commit on it. The commit holds the
  schedule file, the generated file and, on GitLab, `.gitlab-ci.yml` with its include entry. It then opens one pull
  request that holds them, and that pull request says when a foreign configuration stays beside Agent M's (UC-027 1a).
  A schedule with an error finding writes nothing.
- **`applyPipelineSchedule`** sets the nightly pipeline schedule through the host's `setPipelineSchedule` (ITM-749)
  after the merge. On GitHub it gives `null`.

The host's `createBranch`, `commitFiles` and `openPullRequest` are built.

## Acceptance

- With a fake host:
  - one branch, one commit holding exactly the files named, and one pull request;
  - `InvalidSchedule` with nothing written;
  - `Moved` passed on;
  - on GitLab, the pipeline schedule set once at the declared time, and saving again updates it instead of adding a
    second one;
  - `null` on GitHub.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/test-schedule/` and the tests that name MOD-test-schedule change.

## Settled at sprint team2/89's start, 2026-10-18 (po-opus-b): (b), a module text change only

The question left for akmaier (`docs/backlog/sprints/team2/82.md:83-89`): MOD-test-schedule's Uses do not name `repositoryInfo`. `proposeSchedule` opens its pull request into the default branch (`openPullRequest` needs `base`, MOD-repository-hosts.md:201), and `applyPipelineSchedule(host, schedule)` sets a schedule on it. The default branch is given
only by `RepositoryInfo.defaultBranch` (MOD-repository-hosts.md:136, `repositoryInfo()` at :185-186): a `Snapshot`'s
`ref` is what it was read at (:106, :168), here a commit. Its Uses name `readSnapshot`, `createBranch`, `commitFiles`, `openPullRequest` and `setPipelineSchedule` one by one, so the absence reads as a gap of the Uses;
`grep -c repositoryInfo` gives 0 for MOD-test-schedule.md and 3 for MOD-runtimes.md (the known positive).

**The draft**, committed as `c2f0a91e`: MOD-test-schedule's Uses gain `MOD-repository-hosts.repositoryInfo`, for the default branch
a schedule's pull request goes into and the pipeline schedule runs on,
in the form 13 other module files name it (e.g. MOD-runtimes.md:261). Principles: *no special first case* — named like
the module's other host functions; *nothing twice* — the default branch comes from the host the function already
receives, not from a second copy in a context.

The item builds on the acceptance of that draft. While team 1's sprint 87 runs, MOD-test-schedule is used by its modules
(MOD-trace-pages), so the item is held.

**Stopped at its stop clauses (sprint team1/92, developer-sonnet-a).**
- `proposeSchedule` commits the schedule file (MOD-test-schedule.md:142-146). `commitFiles` takes a file's `text`, `bytes`
  or `delete` (`src/repository-hosts/index.mjs:93`), and a `Document` holds no full text. The writer of a Document's text
  is MOD-documents.writeDocument (MOD-documents.md:266), which MOD-test-schedule.md does not name. **The draft for akmaier
  adds it.** This item waits for that acceptance.
- `applyPipelineSchedule` returns the page of the pipeline schedules, which `webLinks().pipelineSchedules` would give. It
  is not built (ITM-950).
- **Read when it starts again,** each against the texts, and drafted where they say nothing:
  1. how `applyPipelineSchedule` tells the server, since a Host has no server field;
  2. the values the module file does not state: the schedule's description, its ref, the variable of the rows, the
     branch's name, and the pull request's title and body;
  3. how a foreign configuration is found at the head;
  4. a GitLab `include:` that is a string or a map. MOD-runtimes' `mergeGitlabCi` (`src/runtimes/ci.mjs:114`) does this
     privately, and writing it again would be a copy;
  5. `NotSupported` without a token, which `createBranch`, `openPullRequest` and `setPipelineSchedule` throw but no
     failures list names.

