// Independent release coverage for ITM-290's approved MOD-personal-data and MOD-browser-store producers.

import test from "node:test";
import assert from "node:assert/strict";
import { documentFindings, readDocument, readRegister, writeDocument } from "../src/documents/index.mjs";
import { clearEverything, openStore, secretValues, writeSetting } from "../src/browser-store/index.mjs";
import { pseudonymisationOf, settingsSchemas } from "../src/personal-data/index.mjs";

const INSTANCE = "release/example";
const OTHER = "other/example";
const prefix = (instance) => `agent-m:${instance}:`;

function memoryStorage(initial = {}) {
  const values = new Map(Object.entries(initial));
  return { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key), get length() { return values.size; }, key: (index) => [...values.keys()][index] ?? null };
}
function install(storage) { Object.defineProperty(globalThis, "localStorage", { configurable: true, writable: true, value: storage }); }

// TST-290105
// level: release
// module: MOD-personal-data
// guards: PSEUDONYMISATION IS ON UNLESS A PRODUCT SWITCHES IT OFF
// given: canonical product settings documents with no value, explicit on, explicit off, and retained unrelated document content
// input: public settingsSchemas, MOD-documents read/write round trips, and pseudonymisationOf
// expect: docs/settings.md is the canonical schema, missing or on remains on, only explicit off disables it, and unrelated content survives the round trip
test("TST-290105: canonical product settings retain unrelated text and switch pseudonymisation off only explicitly", async () => {
  const { settings } = await settingsSchemas();
  const text = "---\npseudonymisation: off\n---\n# Settings of this product\n\n## Retained note\n\nKeep this unrelated product text.\n";
  const off = readDocument(settings, "docs/settings.md", text);
  assert.deepEqual(documentFindings(settings, off), []);
  assert.equal(settings.path, "docs/settings.md");
  assert.equal(pseudonymisationOf(null), "on");
  assert.equal(pseudonymisationOf(readDocument(settings, "docs/settings.md", "# Settings of this product\n")), "on");
  assert.equal(pseudonymisationOf(readDocument(settings, "docs/settings.md", "---\npseudonymisation: on\n---\n# Settings of this product\n")), "on");
  assert.equal(pseudonymisationOf(off), "off");
  assert.equal(writeDocument(settings, off), text);
});

// TST-290106
// level: release
// module: MOD-personal-data
// guards: A PERSON IS NAMED BY ACCOUNT OR WITH CONSENT
// given: the canonical collaborators register with a named account, affirmative agreement, and an unrelated retained section
// input: public settingsSchemas and MOD-documents readRegister/writeDocument through the collaborators schema
// expect: the canonical register preserves Name, Account and Agreed yes with its unrelated text, while a missing affirmative agreement is a schema finding
test("TST-290106: canonical collaborator consent is represented in a retained product register", async () => {
  const { collaborators } = await settingsSchemas();
  const text = "# Collaborators of this product\n\n| Name | Account | Agreed |\n|---|---|---|\n| Ada Example | ada-example | yes |\n\n## Retained note\n\nConsent was recorded with the product.\n";
  const { document, rows } = readRegister(collaborators, "docs/collaborators.md", text);
  assert.deepEqual(rows, [{ line: 5, cells: { Name: "Ada Example", Account: "ada-example", Agreed: "yes" } }]);
  assert.equal(writeDocument(collaborators, document), text);
  const missing = readDocument(collaborators, "docs/collaborators.md", text.replace("| Ada Example | ada-example | yes |", "| Ada Example | ada-example | no |"));
  assert.match(documentFindings(collaborators, missing)[0].what, /Agreed/);
});

// TST-290107
// level: release
// module: MOD-browser-store
// guards: A CLEAR IS A REAL CLEAR; CONFIGURATION LIVES IN THE BROWSER
// given: one browser storage with known and unknown raw entries for this instance, another instance, and unrelated browser state
// input: public clearEverything(openStore(instance))
// expect: every raw entry under this instance prefix is removed while other-instance and unrelated bytes remain unchanged
test("TST-290107: public clearEverything removes all raw instance storage without crossing prefixes", () => {
  const storage = memoryStorage({ [`${prefix(INSTANCE)}github-token`]: '{"value":"token"}', [`${prefix(INSTANCE)}retired-entry`]: "raw-byte",
    [`${prefix(OTHER)}github-token`]: "other-byte", "unrelated": "kept-byte" });
  install(storage);
  clearEverything(openStore(INSTANCE));
  assert.equal(storage.getItem(`${prefix(INSTANCE)}github-token`), null);
  assert.equal(storage.getItem(`${prefix(INSTANCE)}retired-entry`), null);
  assert.equal(storage.getItem(`${prefix(OTHER)}github-token`), "other-byte");
  assert.equal(storage.getItem("unrelated"), "kept-byte");
});

// TST-290108
// level: release
// module: MOD-browser-store
// guards: NO SECRET IN THE REPOSITORY; A STORED SECRET IS HIDDEN UNTIL SHOWN
// given: canonical token, endpoint, Bridge, remote-session and both supported jump-host credential shapes plus configuration and test metadata
// input: public secretValues over the instance store
// expect: exact credential values include string and object jump-host passwords, while usernames, addresses, configuration and test metadata are excluded
test("TST-290108: public secretValues returns credentials only for both jump-host login shapes", () => {
  install(memoryStorage());
  const store = openStore(INSTANCE);
  writeSetting(store, "github-token", { value: "instance-token", name: "configuration-name" });
  writeSetting(store, "endpoint:main", { url: "https://models.example.test/v1", key: "endpoint-key", model: "small" });
  writeSetting(store, "bridge", { address: "https://bridge.example.test", token: "bridge-token" });
  writeSetting(store, "jump-host", { hostname: "jump.example.test", user: "ssh-user", login: { user: "web-user", password: "object-password" } });
  writeSetting(store, "remote-session:lab", { port: 40100, token: "remote-token" });
  writeSetting(store, "github-token:owner/product", { value: "product-token" });
  writeSetting(store, "last-test:endpoint:main", { at: "2026-10-10", outcome: "works" });
  assert.deepEqual(secretValues(store).sort(), ["instance-token", "endpoint-key", "bridge-token", "object-password", "remote-token", "product-token"].sort());
  writeSetting(store, "jump-host", { hostname: "jump.example.test", user: "ssh-user", login: "legacy-password" });
  assert.ok(secretValues(store).includes("legacy-password"));
  assert.ok(!secretValues(store).includes("ssh-user"));
  assert.ok(!secretValues(store).includes("https://bridge.example.test"));
});
