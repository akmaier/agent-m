// MOD-settings-pages — the participants page and the endpoint configuration say when the prompt bar appears (ITM-1128), as UC-049 alternative 1a states it (docs/use-cases/UC-049-talk-to-an-agent-in-the-prompt-bar.md:126-128,
// blob 7c5b5c05a5b8ee46140ba571d51aa5c6f09dc5ab): "**1a. No participant is offered.** The prompt bar is not shown. The participants page and the endpoint configuration say that it appears once a model endpoint, a CLI agent or a
// sandboxed agent is configured and reachable from this browser."
// Run: node --test tests/settings-pages-prompt-bar-note.test.mjs
//
// Module: MOD-settings-pages
// Guards: UC-049; EVERY STEP EXPLAINS ITSELF
// Level: unit
//
// These tests use only MOD-settings-pages' public `view`: each route is drawn with Route.render(target, context, params) in the small DOM of tests/site-frame-dom.mjs, over a store and, for the participants register, a host that
// answers the instance's repository from memory. The readings, named in the pull request: each page says it in one sentence of its own text, beside its heading; the sentence names the prompt bar, the three kinds of participant
// and the two conditions, configured and reachable from this browser. Each test states its input and its expected result before it runs (given / input / expect). Nothing reaches the network. The counter-proofs are recorded in the pull request.

import "./site-frame-dom.mjs";
import test from "node:test";
import assert from "node:assert/strict";

const { view } = await import("../src/settings-pages/index.mjs");
const { openStore } = await import("../src/browser-store/index.mjs");

class Storage { constructor() { this.values = new Map(); } getItem(key) { return this.values.get(key) ?? null; } setItem(key, value) { this.values.set(key, String(value)); } removeItem(key) { this.values.delete(key); }
  key(at) { return [...this.values.keys()][at] ?? null; } get length() { return this.values.size; } }
const REGISTER = "# Participants of this instance\n\n| Name | Type | Model | Context | Price | Capabilities | Processing place | Route |\n|---|---|---|---|---|---|---|---|\n"
  + "| local-llm | model endpoint | model-a | 200000 | — | draft text | this machine | endpoint ep1 |\n";
const host = { repositoryInfo: async () => ({ defaultBranch: "main", visibility: "private", canWrite: true }),
  readSnapshot: async () => ({ commit: "h".repeat(40), paths: ["docs/participants.md"], read: async (path) => (path === "docs/participants.md" ? REGISTER : null), blob: () => "b".repeat(40) }),
  commitFiles: async () => ({ commit: "c".repeat(40) }), webLinks: () => ({}) };

function elements(root, match) {
  const found = [];
  (function walk(n) { for (const k of n.childNodes ?? []) if (k.nodeType === 1) { if (match(k)) found.push(k); walk(k); } })(root);
  return found;
}
async function drawn(name) {
  Object.defineProperty(globalThis, "localStorage", { configurable: true, value: new Storage() });
  const store = openStore("fixture/agent-m");
  const route = view.routes.find((candidate) => candidate.name === name);
  assert.ok(route, `the route ${name}`);
  const target = document.createElement("div");
  document.body.append(target);
  await route.render(target, { page: "review", instance: { repository: "fixture/agent-m", host }, product: null, store, go() {} }, {});
  return target;
}

// TST-1128001 · level: unit · module: MOD-settings-pages
// guards: UC-049; EVERY STEP EXPLAINS ITSELF
// given: the settings pages of a browser whose register lists one participant
// input: the participants route and the endpoint route drawn
// expect: each page holds one sentence that names the prompt bar and says that it appears once a model endpoint, a CLI agent or a sandboxed agent is configured and reachable from this browser; the sentence stands in the page's text, not in a heading or a field
// Planted fault: leaving it out of either page, or saying only that the prompt bar exists, fails that page.
test("the participants page and the endpoint configuration say that the prompt bar appears once a participant is configured and reachable", async () => {
  for (const name of ["participants", "endpoints"]) {
    const page = await drawn(name);
    const notes = elements(page, (node) => node.localName === "p" && /prompt bar/i.test(node.textContent));
    assert.equal(notes.length, 1, `the ${name} page has one sentence on the prompt bar`);
    const said = notes[0].textContent.replace(/\s+/g, " ");
    assert.match(said, /appears/i, `${name}: when it appears`);
    assert.match(said, /model endpoint, a CLI agent or a sandboxed agent/i, `${name}: which participants`);
    assert.match(said, /configured/i);
    assert.match(said, /reachable from this browser/i);
  }
});
