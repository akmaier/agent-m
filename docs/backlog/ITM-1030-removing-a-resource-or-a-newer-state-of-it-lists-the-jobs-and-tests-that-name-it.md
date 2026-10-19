---
id: ITM-1030
title: Removing a resource, or a newer state of it, lists the jobs and tests that name it
level: module
realises:
  - UC-040
  - A PINNED RESOURCE MOVES ONLY WHEN A PERSON MOVES IT
modules:
  - MOD-resource-list
  - MOD-settings-pages
builds_on:
  - ITM-642
tests:
  - unit
origin:
  - the gap analysis of UC-036 to UC-049 on main, proposal NEW-040-9, read against the accepted texts on main at 40e04d8d
  - akmaier's direction of 2026-10-18 ("fill the backlog to implement the remaining missing UC 36 to the end")
---
# ITM-1030 Removing a resource, or a newer state of it, lists the jobs and tests that name it

**REGISTER**

## Outcome

UC-040.md:151-152 (1a): "Agent M lists the jobs and tests that name it; they are listed, not changed". UC-040.md:185-187
(9a): "The dashboard shows it beside the pin with the jobs that use the resource".

## The accepted text

The draft for this item is accepted (`1c30ad0b` and the acceptances before it); quoted from `main` at 40e04d8d:

MOD-resource-list.md:114-117:

> - `namedBy(snapshot: Snapshot, name: string) -> { jobs: string[], tests: string[] }` — the job records whose `inputs` pin
>   the resource `name` and the test files whose text names it, by the paths of each, read through the snapshot. A job
>   record names a resource by the input `<name>` with its pin (MOD-job-ledger); a test names it by its name in its file. It
>   changes nothing (UC-040, a resource removed or moved to a newer state).

## Acceptance

- A unit test naming MOD-resource-list: over a fixture snapshot, `namedBy` gives the job record whose inputs pin the
  resource and the test file that names it, and nothing else; the resources page lists them on *Move* and *Remove*, and
  changes neither.
- Counter-proof: a record that names another resource listed fails the test.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only the folders of the named modules and their tests change.
