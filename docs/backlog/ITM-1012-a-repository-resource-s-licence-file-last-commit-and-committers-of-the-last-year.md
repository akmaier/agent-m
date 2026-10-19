---
id: ITM-1012
title: A repository resource's licence file, last commit and committers of the last year
level: module
realises:
  - UC-040
  - DUE DILIGENCE IS FETCHED, NOT RECALLED
modules:
  - MOD-reuse-facts
builds_on:
tests:
  - unit
origin:
  - the gap analysis of UC-036 to UC-049 on main, proposal NEW-040-6, read against the accepted texts on main at 40e04d8d
  - akmaier's direction of 2026-10-18 ("fill the backlog to implement the remaining missing UC 36 to the end")
---
# ITM-1012 A repository resource's licence file, last commit and committers of the last year

**REGISTER**

## Outcome

UC-040.md:97-99: for a repository, Agent M "shows the licence file if there is one, the date of the last commit and how
many people committed in the last year — the due-diligence view of ch. 6 §5."

## The accepted text

The draft for this item is accepted (`1c30ad0b` and the acceptances before it); quoted from `main` at 40e04d8d:

MOD-reuse-facts.md:111-118:

> - `repositoryFacts(host: Host, productLicence: string | null) -> Promise<{ facts: Fact[], licence: "compatible" | "not
>   known to be compatible" | "not checked" }>` — what a resource repository says about itself, through the host its
>   caller connected with the stored token of that server: the licence file at the default branch's head (`readSnapshot`,
>   the file `LICENSE`, `LICENCE` or `COPYING` with or without an extension), the date of the last commit, and the number
>   of distinct authors of the commits of the last year (`readHistory` with `changes: false`, newest first, until a commit
>   older than a year), each with its address and date; the licence against `productLicence` by `licenceVerdict`. A
>   repository without a licence file gives the fact `licence file` with the value `none`. Fails as the host fails (UC-040,
>   a repository resource).

## Acceptance

- A unit test naming MOD-reuse-facts, over a fake host: a repository with a `LICENSE` file, commits of three authors in
  the last year and an older one gives the facts `licence file`, `last commit` and `committers in the last year` (3), each
  with its address and date, and the licence verdict against the product's; one without a licence file gives `none`.
- Counter-proof: counting the authors of every commit, not only the last year's, fails the test.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/reuse-facts/` and the tests that name MOD-reuse-facts change.
