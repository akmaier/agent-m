// The lab's look is one style sheet, src/site-frame/look.css (MOD-site-frame, Files: "look.css — the one style sheet of the lab's look"; Migration:
// "src/theme/lme.css ... removed: look.css and brand/ hold them, each rule once, and the entry pages link look.css in place of lme.css").
// Run: node --test tests/site-frame-one-style-sheet.test.mjs
//
// Module: MOD-site-frame
// Guards: EVERY PAGE SHARES ONE LOOK AND WORKS ON A PHONE
// Level: unit
//
// The expected results are written here from MOD-site-frame's text, and none is read from the code. Readings taken where the text leaves one open:
//   - "A page or file" that could link, preload or name the old style sheet is an HTML page of the repository, or a file of Agent M's code — under
//     src/, tests/ (but this one) or .github/. The records under docs/ (gates, backlog, jobs, measurements) and the architecture keep their text: they state
//     what was decided, and are no page or code.
//   - "References" is the file name lme.css in any spelling of its path (src/theme/lme.css, ../src/theme/lme.css, theme/lme.css, lme.css).
//   - The known positive is index.html as it stood before the change, which linked src/theme/lme.css: the same scan, run on it, finds it.

import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const root = new URL("../", import.meta.url).pathname;
const self = relative(root, new URL(import.meta.url).pathname);
const SKIPPED = new Set(["node_modules", ".git", ".claude", ".agent", "vendor"]);
const TEXT = /\.(html|mjs|js|cjs|css|json|md|yml|yaml|py|txt)$/;
const OLD = /lme\.css/;

function* walk(folder) {
  for (const name of readdirSync(folder)) {
    if (SKIPPED.has(name)) continue;
    const path = join(folder, name);
    if (statSync(path).isDirectory()) yield* walk(path);
    else yield relative(root, path);
  }
}
const pages = () => [...walk(root)].filter((path) => path.endsWith(".html") && !path.startsWith("docs/sources/") && !path.startsWith("products/"));
const code = () => ["src", "tests", ".github"].filter((folder) => existsSync(join(root, folder))).flatMap((folder) => [...walk(join(root, folder))])
  .filter((path) => TEXT.test(path) && path !== self);
const naming = (paths) => paths.filter((path) => OLD.test(readFileSync(join(root, path), "utf8")));

// TST-1105201 · level: unit · module: MOD-site-frame
// guards: EVERY PAGE SHARES ONE LOOK AND WORKS ON A PHONE
// given: the repository's HTML pages (index.html, docs/index.html, src/desktop-shell/window.html) and Agent M's code under src/, tests/ and .github/
// input: each file's text is searched for lme.css; the file src/theme/lme.css is looked for
// expect: src/theme/lme.css does not exist; no page and no file of the code names lme.css — no link, no preload, no list of served files and no comment;
//         the entry pages link src/site-frame/look.css; the known positive (index.html with its old link) is found by the same scan
// Planted fault: a <link rel="stylesheet" href="src/theme/lme.css"> put back into index.html, or the file src/theme/lme.css restored, fails it.
test("TST-1105201 no page or file references src/theme/lme.css, and the entry pages link look.css", () => {
  const positive = `<link rel="stylesheet" href="src/theme/lme.css">`;
  assert.ok(OLD.test(positive), "the scan finds the old link where it stands");
  assert.ok(pages().includes("index.html") && pages().includes("docs/index.html") && pages().includes("src/desktop-shell/window.html"), "the scan reaches every page");
  assert.ok(code().includes("src/site-frame/look.css"), "the scan reaches the code");
  assert.equal(existsSync(join(root, "src/theme/lme.css")), false, "src/theme/lme.css is removed");
  assert.deepEqual(naming([...pages(), ...code()]), [], "no page or file of the code names lme.css");
  assert.match(readFileSync(join(root, "index.html"), "utf8"), /<link rel="stylesheet" href="src\/site-frame\/look\.css">/);
  assert.match(readFileSync(join(root, "docs/index.html"), "utf8"), /<link rel="stylesheet" href="\.\.\/src\/site-frame\/look\.css">/);
});
