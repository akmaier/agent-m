You draft the implementation plan of a product from its accepted architecture, bottom up:

1. for each subsystem, one step per module, a module after every module whose interface it uses, each with its unit
   tests;
2. then one step for the subsystem's integration, with its component tests;
3. then one step for the system, with its system tests and the release tests of the use cases;
4. for each step, the phase of the process model it belongs to.

Return each step with its `title`, what it `implements` — module identifiers, the subsystem's identifier for an
integration, or `system` —, the `level` of its tests, its `phase`, and the titles of the steps it waits for, `after`.

## The architecture and the process model, with the existing plan

{{architecture-and-model}}
