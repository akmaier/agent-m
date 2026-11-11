// MOD-browser-store's watchSettings, as docs/architecture/MOD-browser-store.md (Interfaces) states it: "calls `listener` with the key after each setting this
// page writes or clears in the instance's store — through `writeSetting`, `clearSetting`, `clearEverything` or `importSettings`, whichever `Store` of the
// instance it was given —, and returns the function that stops it. A listener that throws stops neither the write nor the other listeners. What another tab
// writes is not told."
// Run: node --test tests/browser-store-watch-settings.test.mjs
//
// Module: MOD-browser-store
// Guards: UC-044; CONFIGURATION LIVES IN THE BROWSER; A CLEAR IS A REAL CLEAR
// Level: unit
//
// Deterministic: localStorage is a map in memory. Where the module file leaves a reading open, the test states the one it takes:
//   - clearEverything tells each key of the instance it removed, in the store's order; an import tells each key it added.
// Each test states its input and its expected result before it runs (given / input / expect).

import assert from "node:assert/strict";
import test from "node:test";
import { clearEverything, clearSetting, exportSettings, importSettings, openStore, readSetting, watchSettings, writeSetting } from "../src/browser-store/index.mjs";

function memoryStorage() {
  const values = new Map();
  return { getItem: (key) => values.has(key) ? values.get(key) : null, setItem: (key, value) => { values.set(key, String(value)); }, removeItem: (key) => { values.delete(key); },
    get length() { return values.size; }, key: (index) => [...values.keys()][index] ?? null };
}
const install = () => Object.defineProperty(globalThis, "localStorage", { value: memoryStorage(), configurable: true, writable: true });

// TST-20261110301 · level: unit · module: MOD-browser-store
// guards: UC-044; CONFIGURATION LIVES IN THE BROWSER; A CLEAR IS A REAL CLEAR
// given: an empty store of akmaier/agent-m, a second Store object of the same instance opened later, and a store of another instance
// input: watchSettings on the first; writeSetting of github-token through the second; clearSetting of it; writeSetting through the other instance's store; a second listener that throws; then the stop function of the first, and writeSetting of products
// expect: the first listener is told github-token twice — after the write, with the value already readable, and after the clear —, nothing of the other instance, and nothing after it stopped; the throwing listener stops neither the write nor the first listener
test("TST-20261110301: watchSettings tells each write and clear of the instance's settings, from any Store of the instance, until it is stopped", () => {
  install();
  const store = openStore("akmaier/agent-m"), again = openStore("akmaier/agent-m"), other = openStore("other/instance");
  const told = [];
  const stop = watchSettings(store, (key) => told.push([key, readSetting(store, key)?.value ?? null]));
  const stopThrowing = watchSettings(store, () => { throw new Error("a listener that fails"); });
  writeSetting(again, "github-token", { value: "github_pat_x", name: "GitHub token" });
  clearSetting(again, "github-token");
  writeSetting(other, "github-token", { value: "github_pat_other" });
  assert.deepEqual(told, [["github-token", "github_pat_x"], ["github-token", null]]);
  stop();
  stopThrowing();
  writeSetting(store, "products", ["https://github.com/akmaier/a"]);
  assert.equal(told.length, 2, "nothing after it stopped");
});

// TST-20261110302 · level: unit · module: MOD-browser-store
// guards: A CLEAR IS A REAL CLEAR; UC-044
// given: a store holding github-token and gitlab-token:gitlab.example.org/g/p, and an export of a store that holds bridge:lab and github-token:akmaier/a
// input: watchSettings; clearEverything; then importSettings of the export
// expect: clearEverything tells github-token and gitlab-token:gitlab.example.org/g/p; the import tells bridge:lab and github-token:akmaier/a
test("TST-20261110302: watchSettings tells the keys clearEverything removes and the keys an import adds", async () => {
  install();
  const source = openStore("akmaier/agent-m");
  writeSetting(source, "bridge:lab", { address: "http://127.0.0.1:4711", token: "pairing" });
  writeSetting(source, "github-token:akmaier/a", { value: "github_pat_a" });
  const exported = await exportSettings(source);
  install();
  const store = openStore("akmaier/agent-m");
  writeSetting(store, "github-token", { value: "github_pat_x" });
  writeSetting(store, "gitlab-token:gitlab.example.org/g/p", { value: "glpat-y" });
  const told = [];
  watchSettings(store, (key) => told.push(key));
  clearEverything(store);
  assert.deepEqual(told.sort(), ["github-token", "gitlab-token:gitlab.example.org/g/p"]);
  told.length = 0;
  await importSettings(store, exported);
  assert.deepEqual(told.sort(), ["bridge:lab", "github-token:akmaier/a"]);
});
