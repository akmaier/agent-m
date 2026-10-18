// The Bridge app's installed packages are ignored by git (ITM-912) — CI and the developers install MOD-bridge-build's packages into
// `src/bridge-build/node_modules/` (`npm install --prefix src/bridge-build`, .github/workflows/tests.yml), and `git add -A` must not commit them.
// For AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES. Run: node --test tests/bridge-build-installed-packages-ignored.test.mjs
//
// Module: MOD-bridge-build
// Guards: AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES
// Level: unit
//
// `git check-ignore -v --no-index <path>` prints `<source>:<line>:<pattern>\t<path>` for the rule that ignores a path and exits 1 for a path no rule ignores;
// `--no-index` asks the rule alone, so the answer is the same whether or not the folder exists or a file of it is tracked. Nothing is installed.

import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const checkIgnore = (path) => {
  const r = spawnSync("git", ["check-ignore", "-v", "--no-index", path], { cwd: ROOT, encoding: "utf8" });
  return { status: r.status, out: r.stdout.trim() };
};

// TST-912001 · level: unit · module: MOD-bridge-build
// guards: AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES
// given: the repository's .gitignore; the known positive node_modules/x, which the root rule `/node_modules/` ignores
// input: git check-ignore -v --no-index node_modules/x
// expect: exit 0 and the rule `.gitignore:<n>:/node_modules/` — the probe finds a rule where one must be
test("check-ignore finds the rule of the known positive node_modules/x", () => {
  const r = checkIgnore("node_modules/x");
  assert.equal(r.status, 0, r.out);
  assert.match(r.out, /^\.gitignore:\d+:\/node_modules\/\tnode_modules\/x$/);
});

// TST-912002 · level: unit · module: MOD-bridge-build
// guards: AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES
// given: the repository's .gitignore
// input: git check-ignore -v --no-index src/bridge-build/node_modules/x
// expect: exit 0 and the rule `.gitignore:<n>:/src/bridge-build/node_modules/`
test("the installed packages of the Bridge app are ignored by .gitignore", () => {
  const r = checkIgnore("src/bridge-build/node_modules/x");
  assert.equal(r.status, 0, "src/bridge-build/node_modules/x is not ignored");
  assert.match(r.out, /^\.gitignore:\d+:\/src\/bridge-build\/node_modules\/\tsrc\/bridge-build\/node_modules\/x$/);
});

// TST-912003 · level: unit · module: MOD-bridge-build
// guards: AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES
// given: the repository's .gitignore
// input: git check-ignore -v --no-index on src/bridge-build/package.json and src/bridge-build/package-lock.json
// expect: exit 1 and no output for each — the module's own files stay tracked
test("the Bridge app's package.json and package-lock.json are not ignored", () => {
  for (const file of ["src/bridge-build/package.json", "src/bridge-build/package-lock.json"]) {
    const r = checkIgnore(file);
    assert.equal(r.status, 1, `${file}: ${r.out}`);
    assert.equal(r.out, "");
  }
});
