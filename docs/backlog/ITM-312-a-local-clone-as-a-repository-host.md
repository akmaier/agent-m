---
id: ITM-312
title: A local clone as a repository host
level: module
realises:
  - UC-006
  - UC-010
  - UC-011
  - WITHOUT A TOKEN, THE INSTANCE'S WORKFLOW WRITES THE CHANGE
  - A REVIEWED ARTIFACT ENTERS THE DEFAULT BRANCH AS OPEN
  - NO SECRET IN THE REPOSITORY
  - A REMOTE INTERFACE NAMES HOW IT FAILS
modules:
  - MOD-repository-hosts
builds_on:
  - ITM-205
  - ITM-247
tests:
  - unit
origin:
  - UC-006 4c
  - UC-010 step 4
  - UC-011 step 4
---
# ITM-312 A local clone as a repository host

**REGISTER**

## Outcome

MOD-repository-hosts' adapter for a local clone, `local-git.mjs`, as its file states it, in Node only. `connect(address,
{ clone })` gives a host whose `readSnapshot` reads the clone at a branch, a tag or a commit, first fetching a commit
the clone lacks from its origin with the clone's own credentials — `NotFound` when the origin lacks it too —; whose
`commitFiles` commits all files in one commit on a branch and pushes only when the push fast-forwards, else `Moved` with
nothing pushed, and refuses a file holding a configured secret with `SecretRefused` as the REST adapters do; and whose
other functions use the REST adapter where a token is given, or throw `NotSupported`. `index.mjs` loads the adapter only
in Node; in a browser a clone stays refused with `NotSupported`. The instance's workflow entry (ITM-364), the job
workflow's entries (ITM-365) and the Bridge (ITM-327) write through it. History, tags and pull requests through a clone
are not part of this item.

## Acceptance

- Unit tests that name MOD-repository-hosts state, before the code exists, with a bare repository in a temporary
  folder as the origin and a clone of it, which is not the network: a snapshot at a branch with its paths and a file's
  text; a commit the clone lacks fetched from the origin, and one the origin lacks `NotFound`; two files committed and
  pushed in one commit while the origin's branch stands at the expected head; `Moved`, with nothing pushed, after
  another commit landed first; a file holding a configured secret refused by its path; a pull request through the
  clone `NotSupported`.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof is recorded in the pull
  request; the tests finish within CI's two minutes.
- The existing tests stay green, with no expected result changed.
- Only `src/repository-hosts/` and the tests that name MOD-repository-hosts change.
