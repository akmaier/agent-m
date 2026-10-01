// The product's personal-data settings (docs/assets/pseudonymiser.mjs) — deterministic, no network.
// Run through tests/review-core.test.mjs, which SPEC.md names for these checks: node --test tests/*.test.mjs
//
// Module: MOD-pseudonymiser
// Guards: PSEUDONYMISATION IS ON UNLESS A PRODUCT SWITCHES IT OFF; A PERSON IS NAMED BY ACCOUNT OR WITH CONSENT; UC-042
// Level: unit
//
// Every check here was run once against a deliberately broken implementation (SOFTWARE_MAINTENANCE
// §4.0a rule 5): a check that cannot fail checks nothing. The mutations are listed in
// docs/measurements/2026-09-30_review-dashboard-mutations.md.

import test from "node:test";
import assert from "node:assert/strict";
import {
  parseProductSettings, pseudonymisationOn, parseCollaborators, formatCollaborators, addCollaborator, removeCollaborator,
  setProductSetting,
} from "../../docs/assets/pseudonymiser.mjs";
import { SETTINGS_OFF, PEOPLE } from "./helpers.mjs";

// ---------------------------------------------------------------- settings in one place (UC-042)
// PSEUDONYMISATION IS ON UNLESS A PRODUCT SWITCHES IT OFF · A PERSON IS NAMED BY ACCOUNT OR WITH CONSENT

test("PSEUDONYMISATION IS ON UNLESS A PRODUCT SWITCHES IT OFF — docs/settings.md, one line per setting", () => {
  assert.equal(pseudonymisationOn(null), true, "no file: on");
  assert.equal(pseudonymisationOn("# Settings\n"), true, "no setting: on");
  assert.equal(pseudonymisationOn(SETTINGS_OFF), false);
  assert.deepEqual(parseProductSettings(SETTINGS_OFF), { pseudonymisation: "off" });
  const created = setProductSetting(null, "pseudonymisation", "off", "alice/thesis");
  assert.match(created, /^# Settings of alice\/thesis\n/);
  assert.deepEqual(parseProductSettings(created), { pseudonymisation: "off" });
  // Switching back on removes the line; everything else of the file stays as it was.
  const on = setProductSetting(SETTINGS_OFF, "pseudonymisation", null, "alice/thesis");
  assert.equal(on, "# Settings of alice/thesis\n\nintro\n\n");
  assert.equal(pseudonymisationOn(on), true);
  assert.equal(setProductSetting(on, "pseudonymisation", "off", "alice/thesis"), "# Settings of alice/thesis\n\nintro\n\n- pseudonymisation: off\n");
});

test("A PERSON IS NAMED BY ACCOUNT OR WITH CONSENT — docs/collaborators.md parses and formats losslessly", () => {
  const text = formatCollaborators(PEOPLE, "alice/thesis");
  assert.match(text, /^# Collaborators of alice\/thesis\n/);
  assert.match(text, /\| Jane Doe \| @jdoe \| 2026-09-30 \|/);
  assert.deepEqual(parseCollaborators(text), PEOPLE);
  assert.deepEqual(parseCollaborators(null), []);
  assert.deepEqual(parseCollaborators(formatCollaborators([], "alice/thesis")), []);
});

test("+ Collaborator needs the tick 'this person has agreed to be named'; Remove takes one off", () => {
  const add = { name: "Ann Lee", account: "annlee", agreed: "2026-09-30" };
  assert.throws(() => addCollaborator(PEOPLE, { ...add, consent: false }), /agreed to be named/);
  const more = addCollaborator(PEOPLE, { ...add, consent: true });
  assert.deepEqual(more.at(-1), add);
  assert.throws(() => addCollaborator(more, { ...add, consent: true }), /already listed/);
  for (const bad of [{ account: "not an account" }, { agreed: "30.09.2026" }, { name: "" }, { name: "A | B" }]) {
    assert.throws(() => addCollaborator(PEOPLE, { ...add, ...bad, consent: true }), Error, JSON.stringify(bad));
  }
  assert.deepEqual(removeCollaborator(more, "annlee"), PEOPLE);
});

// ---------------------------------------------------------------- collaborators by the account syntax of the product's server

test("A PERSON IS NAMED BY ACCOUNT OR WITH CONSENT — a GitLab product accepts GitLab user names, a GitHub product GitHub's", () => {
  const add = { name: "Ann Lee", agreed: "2026-09-30", consent: true };
  // GitLab: letters, digits, '_', '-', '.'; not starting with '-', not ending in '.', '.git' or '.atom' (lib/gitlab/path_regex.rb).
  for (const a of ["ann.lee", "ann_lee", "a", "_x", "ann-lee.2"]) {
    assert.equal(addCollaborator([], { ...add, account: a, gitlab: true }).at(-1).account, a, a);
  }
  for (const a of ["-ann", "ann.", "ann.git", "ann.atom", "ann lee", "ann@x"]) {
    assert.throws(() => addCollaborator([], { ...add, account: a, gitlab: true }), /GitLab/, a);
  }
  // GitHub stays as it was: no '.' or '_'.
  for (const a of ["ann.lee", "ann_lee", "-ann"]) assert.throws(() => addCollaborator([], { ...add, account: a }), /GitHub/, a);
  assert.equal(addCollaborator([], { ...add, account: "ann-lee" }).at(-1).account, "ann-lee");
  // The file keeps such names: a GitLab name with '.' and '_' survives formatting and parsing.
  const list = [{ name: "Ann Lee", account: "ann.lee_2", agreed: "2026-09-30" }];
  assert.deepEqual(parseCollaborators(formatCollaborators(list, "grp/proj")), list);
});
