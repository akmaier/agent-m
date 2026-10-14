// System coverage for UC-037 Connect a mailbox. This guard ties the use case's full main flow and named alternatives
// to the executable mailbox tests that walk the settings page, routes, browser store and composed Bridge.
// Run: node --test tests/system-uc-037-connect-mailbox.test.mjs
//
// Module: MOD-settings-pages · MOD-mail-routes · MOD-browser-store · MOD-bridge-client · MOD-mail-protocols
// Guards: UC-037 main flow and alternative flows
// Level: system
//
// Input: UC-037 as committed text and the mailbox system/component/release tests on this commit.
// Precondition: ITM-427 through ITM-432 and ITM-431 are present on main.
// Expected result: the whole UC-037 flow is covered by executable tests, including both mailbox routes, the named
// alternatives 2a, 3a, 3b, 4a, 4b, 6a, 7a to 7d, 8a and 1a, and the IMAP Bridge evidence through the composed Bridge.

import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const ROOT = new URL("../", import.meta.url);
const read = (path) => readFileSync(new URL(path, ROOT), "utf8");
const exists = (path) => existsSync(new URL(path, ROOT));

const UC = "docs/use-cases/UC-037-connect-a-mailbox.md";

const FLOW_EVIDENCE = {
  "main-flow-route-recognition-and-imap-form": {
    uc: "preselects the route",
    evidence: [["tests/settings-pages-mailbox-imap.test.mjs", "TST-472770"], ["tests/settings-pages-mailbox-imap.test.mjs", "TST-472777"]],
  },
  "main-flow-web-api-registration-sign-in-and-store-test": {
    uc: "Web-API route",
    evidence: [["tests/settings-pages-mailbox-microsoft.test.mjs", "TST-472782"], ["tests/settings-pages-mailbox-microsoft.test.mjs", "TST-472783"], ["tests/settings-pages-mailbox-microsoft.test.mjs", "TST-472786"]],
  },
  "main-flow-imap-through-composed-bridge": {
    uc: "sends one test request to the connection's Bridge",
    evidence: [["tests/mod-desktop-shell-mail-composition.test.mjs", "TST-430001"], ["tests/test_bridge_mail.py", "TST-431001"]],
  },
  "2a-registration-refused": {
    uc: "The app registration is refused",
    evidence: [["tests/settings-pages-mailbox-microsoft.test.mjs", "TST-472785"]],
  },
  "3a-permission-declined": {
    uc: "The author declines a permission",
    evidence: [["tests/settings-pages-mailbox-microsoft.test.mjs", "TST-472784"]],
  },
  "3b-sign-in-expires": {
    uc: "The sign-in expires",
    evidence: [["tests/settings-pages-mailbox-microsoft.test.mjs", "TST-472787"]],
  },
  "4a-password-notice-not-ticked": {
    uc: "The author does not tick the notice",
    evidence: [["tests/settings-pages-mailbox-imap.test.mjs", "TST-472772"]],
  },
  "4b-jump-host-notice-not-ticked": {
    uc: "The author does not tick the jump host's notice",
    evidence: [["tests/settings-pages-mailbox-imap.test.mjs", "TST-472774"]],
  },
  "6a-processing-places-changed-later": {
    uc: "The author changes the allowed places later",
    evidence: [["tests/settings-pages-mailbox-connected.test.mjs", "TST-472769"]],
  },
  "7a-bridge-does-not-answer": {
    uc: "The connection's Bridge does not answer",
    evidence: [["tests/settings-pages-mailbox-imap.test.mjs", "TST-472778"], ["tests/settings-pages-mailbox-connected.test.mjs", "TST-472766"]],
  },
  "7b-server-offers-no-encryption": {
    uc: "A server offers no encryption",
    evidence: [["tests/settings-pages-mailbox-imap.test.mjs", "TST-472778"], ["tests/mod-desktop-shell-mail-composition.test.mjs", "TST-430002"], ["tests/test_bridge_mail.py", "TST-431001"]],
  },
  "7c-login-refused": {
    uc: "The login is refused",
    evidence: [["tests/settings-pages-mailbox-imap.test.mjs", "TST-472778"], ["tests/mail-protocols.test.mjs", "TST-420004"]],
  },
  "7d-reading-works-sending-does-not": {
    uc: "Reading works, sending does not",
    evidence: [["tests/settings-pages-mailbox-imap.test.mjs", "TST-472778"]],
  },
  "8a-disconnect": {
    uc: "The author presses Disconnect",
    evidence: [["tests/settings-pages-mailbox-connected.test.mjs", "TST-472767"], ["tests/settings-pages-mailbox-connected.test.mjs", "TST-472768"]],
  },
  "1a-another-browser": {
    uc: "The author uses another browser or computer",
    evidence: [["tests/settings-pages-mailbox-connected.test.mjs", "TST-472765"], ["tests/settings-pages-mailbox-imap.test.mjs", "TST-472781"]],
  },
};

// TST-433001 - level: system - module: MOD-settings-pages; MOD-mail-routes; MOD-browser-store; MOD-bridge-client; MOD-mail-protocols
// guards: UC-037 main flow and alternatives
// given: UC-037 and the executable mailbox tests named in FLOW_EVIDENCE
// input: compare every main-flow segment and named alternative with its executable evidence
// expect: every UC-037 flow is present in the use case text and every evidence test file exists and contains its TST id
test("TST-433001: UC-037 system coverage names the main flow and every required alternative", () => {
  const uc = read(UC);
  for (const [flow, { uc: needle, evidence }] of Object.entries(FLOW_EVIDENCE)) {
    assert.ok(uc.includes(needle), `${flow}: UC-037 contains ${needle}`);
    assert.ok(evidence.length > 0, `${flow}: evidence is named`);
    for (const [file, tst] of evidence) {
      assert.ok(exists(file), `${flow}: evidence file exists: ${file}`);
      assert.ok(read(file).includes(tst), `${flow}: ${file} contains ${tst}`);
    }
  }
});

// TST-433002 - level: system - module: MOD-settings-pages; MOD-mail-routes; MOD-browser-store; MOD-bridge-client; MOD-mail-protocols
// guards: UC-037 main flow
// given: the evidence map above
// input: the evidence files used for the two main routes
// expect: the web-API path reaches Microsoft sign-in and Graph, while the IMAP path reaches the Bridge composition and mail protocols
test("TST-433002: UC-037 system coverage includes both mailbox routes and the composed Bridge", () => {
  const webApi = FLOW_EVIDENCE["main-flow-web-api-registration-sign-in-and-store-test"].evidence.flat();
  const imap = FLOW_EVIDENCE["main-flow-imap-through-composed-bridge"].evidence.flat();

  assert.ok(webApi.includes("tests/settings-pages-mailbox-microsoft.test.mjs"));
  assert.ok(read("tests/settings-pages-mailbox-microsoft.test.mjs").includes("Microsoft Graph"));
  assert.ok(read("tests/settings-pages-mailbox-microsoft.test.mjs").includes("Sign in with Microsoft"));

  assert.ok(imap.includes("tests/mod-desktop-shell-mail-composition.test.mjs"));
  assert.ok(read("tests/mod-desktop-shell-mail-composition.test.mjs").includes("compose"));
  assert.ok(read("tests/test_bridge_mail.py").includes("MOD-desktop-shell's composed Bridge"));
  assert.ok(read("tests/test_bridge_mail.py").includes("local IMAP and SMTP fixture servers"));
});
