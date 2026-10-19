---
id: ITM-1100
title: MOD-product-process' productWorkflow gives a product's declared workflow
level: module
realises:
  - UC-031
  - UC-045
  - UC-041
modules:
  - MOD-product-process
builds_on:
tests:
  - unit
origin:
  - developer-sonnet-g's stop on ITM-618 and ITM-613 (sprint team2/97), on main at 3faa14e3
---
# ITM-1100 MOD-product-process' productWorkflow gives a product's declared workflow

**REGISTER**

## Outcome

MOD-product-process.md:166-170 (accepted, blob `f7517e3c989d`) states `productWorkflow(declaration, instanceAt, instanceSpec) ->
Promise<Workflow | null>`:
- MOD-model-catalogue's `catalogue` over the instance at the commit the declaration's `model_version` names (`instanceAt`);
- the model it holds at `model_file`;
- the practices the declaration names, read with `modelSchema`;
- `workflowOf` of them;
- `null` where that catalogue holds no model at `model_file`;
- it fails as `instanceAt` fails.

`src/product-process/` does not build it (`git grep productWorkflow` finds it in `docs/` only). The private `declaredModel` in
`src/progress-measures/facts.mjs:74-82` is the existing pattern. It stays where it is until ITM-1096 moves its caller.

## Acceptance

- Unit tests naming MOD-product-process, over fixture snapshots:
  - a declaration whose `model_version` names a commit that holds its model and one practice gives the workflow of that
    model and practice, read at that commit, not at another the fixture also offers;
  - a commit without the model gives `null`;
  - an `instanceAt` that throws makes it fail with that error.
- Counter-proof: reading the catalogue at the current instance in place of `model_version` fails the first case.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/product-process/` and the tests that name MOD-product-process change.
