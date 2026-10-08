// Module: MOD-desktop-shell
// Guards: UC-044; UC-003; THE BRIDGE RUNS AS AN APP; THE LOCAL BRIDGE BINDS TO LOOPBACK ONLY
// Level: component
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const here = new URL("../src/desktop-shell/", import.meta.url);

test("the Electron source entry composes the real loopback Bridge with private preload", () => {
  const main = readFileSync(new URL("main.mjs", here), "utf8");
  const compose = readFileSync(new URL("compose.mjs", here), "utf8");
  assert.match(main, /electron/);
  assert.match(main, /preload\.cjs/);
  assert.match(compose, /serveBridge/);
  assert.match(compose, /127\.0\.0\.1/);
});
