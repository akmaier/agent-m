// Module: MOD-desktop-shell
// Guards: ONE DEFINITION, THREE DRIVERS; UC-011; UC-024
// Level: component
//
// ITM-567: the desktop shell registers MOD-runtimes' `routeStrategies`, the writer `branch-and-pull-request`, with the job runner of the Bridge, as MOD-desktop-shell's Uses state it
// ("the registry of the Bridge's job runner, filled with the strategies of every kind a Bridge may run: [...] `MOD-runtimes.routeStrategies`"). No window and no server is started;
// no request is made (a fetch that fails the test replaces the real one). Whether a name is registered is shown through the runner's own refusal: registering the same writer under
// another owner throws DuplicateStrategy naming the first owner. The registrations of the other modules are TST-367002's.

import assert from "node:assert/strict";
import test from "node:test";
import { registerStrategies } from "../src/job-runner/index.mjs";
import { bridgeStrategyRegistrations, registerBridgeStrategiesOnce } from "../src/desktop-shell/compose.mjs";

// TST-567008 · level: component · module: MOD-desktop-shell
// guards: ONE DEFINITION, THREE DRIVERS; UC-024
// given: the desktop composition module and nothing registered with the job runner yet; a probe that, before the Bridge registers, registers a writer under a name no module offers
// input: bridgeStrategyRegistrations(), then registerBridgeStrategiesOnce(), then registerStrategies("probe", { writers: { "branch-and-pull-request": … } })
// expect: the registrations list MOD-runtimes' routeStrategies, whose strategies offer the writer `branch-and-pull-request`; registering them all raises no DuplicateStrategy; afterwards registering the writer branch-and-pull-request throws DuplicateStrategy { strategy: "branch-and-pull-request", owners: ["MOD-runtimes", "probe"] }; no request is made
// Planted fault: leaving routeStrategies out of the registered list makes the DuplicateStrategy assertion fail.
test("the Bridge registers the writer branch-and-pull-request under MOD-runtimes — MOD-desktop-shell", () => {
  const real = globalThis.fetch, calls = [];
  globalThis.fetch = async (...args) => { calls.push(args); throw new Error("registering must make no request"); };
  try {
    registerStrategies("probe", { writers: { "a-writer-no-module-offers": async () => ({}) } });
    const routes = bridgeStrategyRegistrations().find(({ owner }) => owner === "MOD-runtimes");
    assert.equal(routes?.name, "routeStrategies", "failure node: the list names MOD-runtimes.routeStrategies");
    assert.equal(typeof routes.strategies?.writers?.["branch-and-pull-request"], "function");
    assert.doesNotThrow(() => registerBridgeStrategiesOnce());
    assert.throws(() => registerStrategies("probe", { writers: { "branch-and-pull-request": async () => ({}) } }),
      (error) => error.name === "DuplicateStrategy" && error.strategy === "branch-and-pull-request" && JSON.stringify(error.owners) === JSON.stringify(["MOD-runtimes", "probe"]));
  } finally {
    globalThis.fetch = real;
  }
  assert.deepEqual(calls, []);
});
