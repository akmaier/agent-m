---
id: ITM-1029
title: A job that needs the product's resources names their pinned states in its inputs
level: module
realises:
  - UC-040
  - A RESOURCE IS PINNED TO AN EXACT STATE
modules:
  - MOD-resource-list
  - MOD-job-catalogue
builds_on:
tests:
  - unit
origin:
  - the gap analysis of UC-036 to UC-049 on main, proposal NEW-040-8, read against the accepted texts on main at 40e04d8d
  - akmaier's direction of 2026-10-18 ("fill the backlog to implement the remaining missing UC 36 to the end")
---
# ITM-1029 A job that needs the product's resources names their pinned states in its inputs

**REGISTER**

## Outcome

UC-040.md:126-128: "when a job that needs the resource is started (UC-010, UC-011), Agent M offers only the runtimes and
participants that reach it by its route, and names the pinned state in the job's inputs."

The routes are built (`src/runtimes/routes.mjs:68-85`).

## The accepted text

The draft for this item is accepted (`1c30ad0b` and the acceptances before it); quoted from `main` at 40e04d8d:

MOD-resource-list.md:118-122:

> - `resourceStrategies` — `Partial<Strategies>` with the recipe `resource-check`: the resource a job names and the harmless
>   request to make on the runner, as one part; and the recipe `resource-pins`: for a job of a kind with `resources:
>   product`, one part with each resource of the product's list that the job's route reaches (`reachableBy`) and its pin,
>   which its start record names among its `inputs` (UC-040, a job that needs a resource).

## Acceptance

- A unit test naming MOD-resource-list: for a job of `implement` on a route that reaches two of three resources,
  `resource-pins` gives one part with those two and their pins, and the kinds with `resources: product` name the recipe.
- Counter-proof: a resource the route does not reach in the part fails the test.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only the folders of the named modules and their tests change.
