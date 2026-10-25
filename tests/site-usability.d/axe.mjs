// The accessibility checker that tests/site-accessibility.test.mjs runs in the pages it draws: axe-core, at one exact version, fetched
// from the npm registry into a folder of the test run's temporary directory the way tests/site-usability.d/browser.mjs fetches
// Electron (`npm install --no-save --prefix`). It is a package of the test run and no file of the site: nothing is vendored into the
// pages, and no workflow or package list of the repository names it. It is test code; it holds no expected result.
//
// Module: MOD-site-frame
// Level: system

import { existsSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

export const AXE_VERSION = "4.14.0";
// The rules of WCAG 2.2 at level A and AA that axe-core ships, by its tags.
export const AXE_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

const cache = join(tmpdir(), `agent-m-905-axe-core-${AXE_VERSION}`);
const script = join(cache, "node_modules/axe-core/axe.min.js");

// axeSource() -> string — the text of axe-core's script, fetched on the first call.
export function axeSource() {
  if (!existsSync(script)) {
    const install = spawnSync("npm", ["install", "--no-save", "--prefix", cache, `axe-core@${AXE_VERSION}`], { encoding: "utf8", timeout: 60000 });
    if (install.status !== 0) throw new Error(`axe-core package staging failed: ${install.stderr}`);
  }
  if (!existsSync(script)) throw new Error(`axe-core ${AXE_VERSION} was not acquired.`);
  return readFileSync(script, "utf8");
}

// The expression that runs axe-core in a page that holds its script and gives { id, nodes, target } for each violation.
export const RUN_AXE = `(async () => {
  const result = await axe.run(document, { runOnly: { type: "tag", values: ${JSON.stringify(AXE_TAGS)} }, resultTypes: ["violations"] });
  return result.violations.map((violation) => ({ id: violation.id, impact: violation.impact, nodes: violation.nodes.length,
    first: String(violation.nodes[0].target.join(" ")).slice(0, 120) }));
})()`;
