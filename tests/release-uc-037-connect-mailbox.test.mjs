// Release coverage for UC-037 Connect a mailbox. This release guard maps every requirement UC-037 realises to
// executable evidence.
// Run: node --test tests/release-uc-037-connect-mailbox.test.mjs
//
// Module: MOD-settings-pages · MOD-mail-routes · MOD-browser-store · MOD-bridge-client · MOD-mail-protocols
// Guards: UC-037; every requirement realised by UC-037
// Level: release
//
// Input: docs/use-cases/UC-037-connect-a-mailbox.md, SPEC.md and the executable mailbox checks on this commit.
// Precondition: ITM-433 adds only new test files by a participant independent of ITM-419 through ITM-430.
// Expected result: every requirement in UC-037's `realises` list has at least one existing executable evidence file,
// and no extra requirement is claimed.

import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const ROOT = new URL("../", import.meta.url);
const read = (path) => readFileSync(new URL(path, ROOT), "utf8");
const exists = (path) => existsSync(new URL(path, ROOT));

function ucRealises() {
  const names = [];
  let inRealises = false;
  for (const line of read("docs/use-cases/UC-037-connect-a-mailbox.md").split("\n")) {
    if (line === "realises:") { inRealises = true; continue; }
    if (!inRealises) continue;
    if (line.startsWith("  - ")) names.push(line.slice(4));
    else if (line === "---") break;
  }
  return names;
}

const COVERED_BY_RELEASE = {
  "A MAILBOX IS REACHED THROUGH ITS PROVIDER'S WEB API OR THROUGH THE BRIDGE": ["tests/test_mail_routes.py", "tests/system-uc-037-connect-mailbox.test.mjs"],
  "AN API MAILBOX IS OPENED BY THE PROVIDER'S SIGN-IN": ["tests/test_mail_routes.py", "tests/settings-pages-mailbox-microsoft.test.mjs"],
  "THE MAIL SIGN-IN ASKS ONLY FOR READING, DRAFTING AND SENDING": ["tests/test_mail_routes.py", "tests/settings-pages-mailbox-microsoft.test.mjs"],
  "THE MAIL SIGN-IN TOKEN GOES ONLY TO ITS PROVIDER": ["tests/mail-routes-sign-in.test.mjs", "tests/settings-pages-mailbox-microsoft.test.mjs"],
  "THE MAILBOX PASSWORD IS STORED ONLY AFTER ITS OWN DISCLOSURE": ["tests/test_settings_disclosure.py", "tests/settings-pages-mailbox-imap.test.mjs"],
  "THE MAILBOX PASSWORD LEAVES THE BROWSER ONLY TO THE BRIDGE": ["tests/test_mail_password_route.py", "tests/settings-pages-mailbox-imap.test.mjs"],
  "A MAILBOX THROUGH THE JUMP HOST IS NAMED AS READABLE THERE": ["tests/test_settings_disclosure.py", "tests/settings-pages-mailbox-imap.test.mjs"],
  "THE BRIDGE HOLDS THE MAILBOX PASSWORD ONLY FOR ONE REQUEST": ["tests/test_bridge_mail.py", "tests/mod-desktop-shell-mail-composition.test.mjs"],
  "THE MAIL SERVER IS REACHED ONLY OVER TLS": ["tests/test_bridge_mail.py", "tests/mail-protocols.test.mjs", "tests/mod-desktop-shell-mail-composition.test.mjs"],
  "READING THE MAILBOX CHANGES NOTHING IN IT": ["tests/test_bridge_mail.py", "tests/mail-protocols.test.mjs"],
  "THE SHARED PAGES ORIGIN IS DISCLOSED": ["tests/test_settings_disclosure.py", "tests/settings-pages-mailbox-imap.test.mjs"],
  "CONFIGURATION IS STORED IN LOCALSTORAGE, NOT IN A COOKIE": ["tests/test_no_config_cookie.py", "tests/settings-pages-mailbox-imap.test.mjs", "tests/settings-pages-mailbox-microsoft.test.mjs"],
  "A CREDENTIAL IS NEVER PLACED IN A URL": ["tests/test_mail_password_route.py", "tests/mail-routes-sign-in.test.mjs", "tests/settings-pages-mailbox-microsoft.test.mjs"],
  "A CLEAR IS A REAL CLEAR": ["tests/settings-pages-mailbox-connected.test.mjs", "tests/browser-store-mailbox.test.mjs"],
  "NO SECRET IN THE REPOSITORY": ["tests/settings-pages-mailbox-imap.test.mjs", "tests/settings-pages-mailbox-connected.test.mjs"],
  "THE LOCAL BRIDGE BINDS TO LOOPBACK ONLY": ["tests/mod-desktop-shell-mail-composition.test.mjs", "tests/release-uc-011-local-cli-session.test.mjs"],
  "THE LOCAL BRIDGE REQUIRES A TOKEN": ["tests/mod-desktop-shell-mail-composition.test.mjs", "tests/bridge-http-mail.test.mjs"],
  "THE PLACES A MAILBOX'S MAIL MAY GO ARE CONFIGURED": ["tests/settings-pages-mailbox-imap.test.mjs", "tests/settings-pages-mailbox-connected.test.mjs"],
  "A PLACE OUTSIDE THE EU IS NAMED AS NOT COMPLIANT": ["tests/test_settings_disclosure.py", "tests/settings-pages-mailbox-imap.test.mjs", "tests/settings-pages-mailbox-connected.test.mjs"],
  "A MAIL IS FOUND AGAIN BY ITS IDENTIFIER": ["tests/settings-pages-mailbox-imap.test.mjs", "tests/settings-pages-mailbox-connected.test.mjs"],
  "MAIL STAYS IN THE MAILBOX": ["tests/test_bridge_mail.py", "tests/mail-protocols.test.mjs", "tests/settings-pages-mailbox-connected.test.mjs"],
  "ONE CLICK PER DECISION": ["tests/settings-pages-mailbox-imap.test.mjs", "tests/settings-pages-mailbox-microsoft.test.mjs"],
  "EVERY STEP EXPLAINS ITSELF": ["tests/site-frame-mailbox-explanations.test.mjs", "tests/settings-pages-mailbox-imap.test.mjs", "tests/settings-pages-mailbox-microsoft.test.mjs"],
};

// TST-433101 - level: release - module: MOD-settings-pages; MOD-mail-routes; MOD-browser-store; MOD-bridge-client; MOD-mail-protocols
// guards: UC-037; every requirement realised by UC-037
// given: UC-037's realised requirements and the evidence map in this release test
// input: compare the realised requirements with COVERED_BY_RELEASE
// expect: every realised requirement is covered exactly once in the map, and every evidence file exists
test("TST-433101: UC-037 release coverage names every realised requirement and its executable evidence", () => {
  const realised = ucRealises();
  assert.deepEqual([...new Set(realised)].sort(), realised.toSorted(), "the use case realises each requirement once");
  assert.deepEqual(Object.keys(COVERED_BY_RELEASE).sort(), realised.toSorted());

  for (const [requirement, files] of Object.entries(COVERED_BY_RELEASE)) {
    assert.ok(files.length > 0, `${requirement} has release evidence`);
    for (const file of files) assert.ok(exists(file), `${requirement} evidence exists: ${file}`);
  }
});

// TST-433102 - level: release - module: MOD-test-document
// guards: UC-037; A TEST STATES ITS EXPECTED RESULT BEFORE IT RUNS
// given: the evidence files of UC-037
// input: read the files' text
// expect: every evidence file is an executable test file and at least one evidence file is at release level for the Bridge, route and disclosure checks
test("TST-433102: UC-037 evidence includes release-level route, password, disclosure and Bridge checks", () => {
  const allFiles = [...new Set(Object.values(COVERED_BY_RELEASE).flat())];
  assert.ok(allFiles.every((file) => /^tests\/.+(\.test\.mjs|\.py)$/.test(file)), "only executable tests are named");
  for (const file of allFiles) assert.match(read(file), /Level: (unit|component|system|release)/, `${file} has a level declaration`);

  for (const file of ["tests/test_mail_routes.py", "tests/test_mail_password_route.py", "tests/test_settings_disclosure.py", "tests/test_bridge_mail.py"]) {
    assert.match(read(file), /level: release/i, `${file} has release-level cases`);
  }
});
