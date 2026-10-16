---
id: ITM-522
title: Whether a branch holds a commit
level: module
realises:
  - A SPRINT HOLDS ITS ITEMS UNTIL THEY REACH THE DEFAULT BRANCH
  - A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT
  - UC-032
modules:
  - MOD-repository-hosts
builds_on:
tests:
  - unit
origin:
  - MOD-repository-hosts, accepted by akmaier at 83312204 (blob 94b908e9ee43), Interfaces: containsCommit
---
# ITM-522 Whether a branch holds a commit

**REGISTER**

## Outcome

The host's `containsCommit(branch, commit)` tells whether the branch's history holds the commit, as MOD-repository-hosts'
file states it:
- on GitHub and GitLab, through the server's comparison of the two;
- in a clone, with `git merge-base --is-ancestor`.
A commit the server does not know is not contained. It crosses the network and fails as `readSnapshot` fails. It is the
fact a caller hands MOD-work-plans' `heldItems` as `onDefault` (ITM-516).

What the module file leaves unstated, and what is built. The Developer confirms each request against the server's
documentation and names the page in the pull request.
- **GitHub.** `GET /repos/{owner}/{repo}/compare/{commit}...{branch}`. The branch holds the commit when the answer's
  `behind_by` is 0, which GitHub reports as status `ahead` or `identical`. A 404 or 422 for an unknown commit is not
  contained.
- **GitLab.** `GET /projects/:id/repository/merge_base?refs[]={commit}&refs[]={branch}`. The branch holds the commit when
  the merge base's `id` is the commit. A 404 or 400 for an unknown commit is not contained.
- **A clone.** `git merge-base --is-ancestor <commit> <branch>`. Exit 0 is contained, exit 1 is not, and any other exit —
  an unknown commit — is not contained.
- **The request.** It is a read with the repository's own token, through the adapter's existing request helper and origin
  gate. No new `fetch` is added.

No existing test's expected result changes, release tests included; no test lists a host's functions.

## Acceptance

- Unit tests name MOD-repository-hosts and state, before the code exists, against fixture servers and a fixture clone:
  - a commit on the branch is contained;
  - a commit off the branch is not;
  - an unknown commit is not;
  - a refused token is `TokenRefused`, and a used-up limit `RateLimited`;
  - the request carries the token only to its own server.
- The first commit holds only these tests, and CI is red on it. Every new test's counter-proof is recorded in the pull
  request.
- Each test states its expected values in its own text (`A TEST DOES NOT TAKE ITS EXPECTED RESULT FROM A DOCUMENT`); an
  existing test that the change turns red is not changed here: the Developer stops and names it.
- Only `src/repository-hosts/` and the tests that name MOD-repository-hosts change.
