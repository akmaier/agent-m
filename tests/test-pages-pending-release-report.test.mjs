// MOD-test-pages' pending release-report route (ITM-289).  This controlled DOM/host case keeps all repository data
// in memory and names the route's failure node: resolving a pending report must happen before the new-release form
// reads its next-version data.
//
// TST-289001
// level: unit
// module: MOD-test-pages
// guards: UC-013; UC-047; A PERSON IS TOLD WHAT WAITS FOR THEIR ACCEPTANCE; THE RELEASE TEST REPORT IS ACCEPTED BY A PERSON
// given: the selected product has a notification address for release and its pending-report lookup is refused by the host.
// input: render the release route with no new-candidate interaction.
// expect: the route names that pending report cannot be reopened and does not read or offer the new-release form.

import test from "node:test";
import assert from "node:assert/strict";

class Element {
  constructor(name) { this.name = name; this.children = []; this.className = ""; }
  append(...nodes) { this.children.push(...nodes); }
  replaceChildren(...nodes) { this.children = nodes; }
  addEventListener() {}
  get textContent() { return this.children.map((child) => child?.textContent ?? String(child)).join(""); }
}

globalThis.document = { createElement: (name) => new Element(name) };

const { route } = await import("../src/test-pages/release.mjs");

// The pending-read sentinel is the observable failure node. repositoryInfo is a separate sentinel: reaching it means
// the route attempted the new-release form before reporting the pending read failure.
test("TST-289001: a refused pending-report lookup is named before the new-release form", async () => {
  const target = new Element("target");
  const host = {
    async listTags() { throw new Error("pending report read refused"); },
    async repositoryInfo() { throw new Error("new-release form was read"); },
  };

  await route.render(target, { product: { host } }, {});

  assert.match(target.textContent, /pending report read refused/i);
  assert.doesNotMatch(target.textContent, /New release/);
});
