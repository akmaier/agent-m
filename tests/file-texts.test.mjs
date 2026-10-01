// The texts of files read, kept in the browser's Cache Storage by blob SHA — settings-store.mjs createFileTexts. Deterministic,
// no network. Run: node --test tests/*.test.mjs
//
// Module: MOD-settings-store
// Guards: A CLEAR IS A REAL CLEAR
// Level: unit
//
// SPEC §7 A CLEAR IS A REAL CLEAR · CONFIGURATION LIVES IN THE BROWSER. Moved out of tests/status-by-names.test.mjs, unchanged,
// when it was split by module.

import test from "node:test";
import assert from "node:assert/strict";
import * as settings from "../docs/assets/settings-store.mjs";
import { fakeCaches } from "./app-harness.mjs";

test("the file texts live in Cache Storage under their key; a clear removes them; without Cache Storage nothing is kept", async () => {
  const caches = fakeCaches(), kept = settings.createFileTexts(caches);
  await kept.put("github.com/a/b/" + "a".repeat(40), "text ä\n");
  assert.equal(await kept.get("github.com/a/b/" + "a".repeat(40)), "text ä\n");
  assert.deepEqual([...caches.stores.keys()], [settings.FILE_TEXTS]);
  assert.ok(!settings.FILE_TEXTS.startsWith(settings.PREFIX), "not a localStorage key of the settings");
  assert.equal(await kept.clear(), true);
  assert.equal(caches.stores.size, 0, "A CLEAR IS A REAL CLEAR");
  assert.equal(await kept.get("github.com/a/b/" + "a".repeat(40)), null);
  // Counter-proof: a Cache Storage that keeps its store after delete is reported.
  const stuck = { ...fakeCaches(), delete: async () => false, has: async () => true };
  assert.equal(await settings.createFileTexts(stuck).clear(), false);
  // No Cache Storage, or one that refuses: nothing kept, nothing thrown.
  const none = settings.createFileTexts(null);
  await none.put("k", "x");
  assert.equal(await none.get("k"), null);
  assert.equal(await none.clear(), true);
  const refusing = { open: async () => { throw new Error("SecurityError"); }, delete: async () => { throw new Error("SecurityError"); },
    has: async () => { throw new Error("SecurityError"); } };
  const r = settings.createFileTexts(refusing);
  await r.put("k", "x");
  assert.equal(await r.get("k"), null);
  assert.equal(await r.clear(), true);
});
