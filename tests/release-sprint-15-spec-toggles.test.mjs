// The current requirement controls remain read-only with and without dashboard credentials (ITM-278).
//
// Module: MOD-trace-pages
// Guards: UC-020; A REQUIREMENT HAS FOUR FIELDS
// Level: release

import assert from "node:assert/strict";
import test from "node:test";
import { TOKEN, openDashboard, repoServer } from "./app-harness.mjs";

const SPEC = `# Read-only toggles

## A section

**READ-ONLY REQUIREMENT** *(Source)*
The current rule is readable.
*Check:* \`tests/read-only.test.mjs\`
`;
const QUEUE = "2026-10-08_toggle-release";
const FILES = {
  "SPEC.md": SPEC,
  [`docs/spec-freigaben/${QUEUE}/index.md`]: "# Queue\n\n**Zieldatei aller Einträge:** `SPEC.md`\n",
  [`docs/spec-freigaben/${QUEUE}/entscheidungen.md`]: "# Decisions\n",
};
const writes = (server) => server.requests.filter((request) => /^(write|other|handler) (?!GET )/.test(request));

function controls() {
  const main = globalThis.document.getElementById("main");
  const table = main.querySelector("table.list");
  table.removeAttribute = (name) => { delete table[name]; };
  return { table, section: main.querySelector("button.spec-section-toggle"), requirement: main.querySelector("button.requirement-name") };
}

// CASE ITM-278-RELEASE-01
// given: the public #spec dashboard, once with its stored token and once with no token
// input: open the fresh section then open, close, and reopen its current requirement
// expect: both views expose the same current detail and neither interaction writes a repository
test("the release dashboard toggles current requirements without writes with or without a token", async () => {
  for (const [label, token] of [["stored token", TOKEN], ["no token", null]]) {
    const server = await repoServer({ files: FILES });
    const page = await openDashboard({ server, hash: "#spec", token });
    const { table, section, requirement } = controls();
    const detail = globalThis.document.getElementById("main").querySelector("tr.requirement-opened");
    assert.equal(table.hidden, "hidden", `${label}: known positive, a fresh section begins collapsed`);
    assert.ok(section && requirement, `${label}: known positive, the public controls are rendered`);
    await page.click("button.spec-section-toggle");
    assert.equal(table.hidden, undefined, `${label}: the heading opens its current list`);
    await requirement.fire("click", { isTrusted: true });
    assert.match(detail?.textContent ?? "", /The current rule is readable\./,
      `${label}: the first requirement click opens its readable detail`);
    await requirement.fire("click", { isTrusted: true });
    assert.equal(detail?.textContent, "", `${label}: the second requirement click closes its detail`);
    await requirement.fire("click", { isTrusted: true });
    assert.match(detail?.textContent ?? "", /The current rule is readable\./,
      `${label}: the third requirement click reopens its detail`);
    assert.deepEqual(writes(server), [], `${label}: the overview and its controls make no write request`);
    assert.deepEqual(server.writes, [], `${label}: the repository remains unchanged`);
  }
});
