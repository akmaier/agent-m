// The kind of an identifier (ITM-232) — MOD-identifiers' IdentifierKind and kindOfIdentifier, as the accepted text of
// docs/architecture/MOD-identifiers.md states them: the kind of a string by the scheme, or null for a string that is
// none. Nothing else of the module is part of this item.
// Run: node --test tests/identifiers-kind.test.mjs
//
// Module: MOD-identifiers
// Guards: UC-047; EVERY ARTIFACT HAS AN IDENTIFIER
// Level: unit
//
// Each test states its input and its expected result before it runs (given / input / expect); the test that expects
// null first shows the same call giving a known kind on a known positive. Nothing reaches the network. The
// counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { kindOfIdentifier, instanceOfPagesAddress } from "../src/identifiers/index.mjs";

// One example of each kind the scheme (docs/architecture/MOD-identifiers.md, Data) defines, exactly as its table gives it.
const EXAMPLES = {
  requirement: "THE NAME IS THE ID AND IT SURVIVES",
  SRC: "SRC-eu-ai-act",
  UC: "UC-022",
  ARC: "ARC-048",
  MOD: "MOD-identifiers",
  TST: "TST-014",
  ITM: "ITM-202",
  RES: "RES-alex-cluster",
  JOB: "JOB-20261005-0900-a1b2",
};

// TST-472240 · level: unit · module: MOD-identifiers
// guards: EVERY ARTIFACT HAS AN IDENTIFIER
// given: one example of each kind the scheme defines — requirement, SRC, UC, ARC, MOD, TST, ITM, RES, JOB — exactly as the module file's Data table gives it
// input: kindOfIdentifier(example) for each
// expect: the kind named by the table's own row
test("kindOfIdentifier — the kind of an identifier of each kind of the scheme", () => {
  for (const [kind, example] of Object.entries(EXAMPLES)) {
    assert.equal(kindOfIdentifier(example), kind, example);
  }
});

// TST-472241 · level: unit · module: MOD-identifiers
// guards: EVERY ARTIFACT HAS AN IDENTIFIER
// given: UC-1234, four digits — the scheme gives UC three or more digits, unlike ARC, TST and ITM, which it gives exactly three
// input: kindOfIdentifier("UC-1234")
// expect: "UC"
test("kindOfIdentifier — UC takes three or more digits", () => {
  assert.equal(kindOfIdentifier("UC-1234"), "UC");
});

// TST-472242 · level: unit · module: MOD-identifiers
// guards: EVERY ARTIFACT HAS AN IDENTIFIER
// given: known positive — UC-022, a use case's identifier; then five strings that are none of the scheme's kinds: the empty string; an ordinary lowercase sentence; a name that reads like a requirement but for one lowercase letter ("NAMe"); UC-02, two digits — short of UC's three; and ARC-1234, four digits — ARC, unlike UC, takes exactly three
// input: kindOfIdentifier(each)
// expect: known positive "UC"; then null for each of the five
test("kindOfIdentifier — null for a string that is none of the scheme's kinds", () => {
  assert.equal(kindOfIdentifier("UC-022"), "UC", "known positive: a use case is read");
  assert.equal(kindOfIdentifier(""), null);
  assert.equal(kindOfIdentifier("a plain sentence in lowercase"), null);
  assert.equal(kindOfIdentifier("THE NAMe IS THE ID AND IT SURVIVES"), null);
  assert.equal(kindOfIdentifier("UC-02"), null, "short of UC's three digits");
  assert.equal(kindOfIdentifier("ARC-1234"), null, "ARC takes exactly three digits, unlike UC");
});

// TST-1302004 · level: unit · module: MOD-identifiers
// guards: EVERY ARTIFACT HAS AN IDENTIFIER
// given: the scheme's requirement, "words of capital letters A–Z, digits, apostrophes ', commas, hyphens - and dots, separated by single spaces, with at least one capital letter" (the module file's Data); names with a dot, an apostrophe, commas and a hyphen, EVERY MODEL READS AGENT M'S AGENTS.MD FIRST, A CANDIDATE IS NEW, A CHANGE, A DUPLICATE OR A CONFLICT and A RE-RUN IS 2 JOBS; counter-proofs: the lowercase md of the file name, a group title "14. Issues, mail and personal data", a number with no capital, "13.", an underscore, two spaces in a row, a space at the start, a colon, a slash, parentheses, and the use case UC-022
// input: kindOfIdentifier(each)
// expect: "requirement" for the three names; null for each counter-proof; "UC" for UC-022
test("kindOfIdentifier — a requirement is words of capitals, digits, apostrophes, commas, hyphens and dots, separated by single spaces", () => {
  assert.equal(kindOfIdentifier("EVERY MODEL READS AGENT M'S AGENTS.MD FIRST"), "requirement");
  assert.equal(kindOfIdentifier("A CANDIDATE IS NEW, A CHANGE, A DUPLICATE OR A CONFLICT"), "requirement");
  assert.equal(kindOfIdentifier("A RE-RUN IS 2 JOBS"), "requirement");
  assert.equal(kindOfIdentifier("EVERY MODEL READS AGENT M'S AGENTS.md FIRST"), null);
  assert.equal(kindOfIdentifier("14. Issues, mail and personal data"), null);
  assert.equal(kindOfIdentifier("13."), null);
  assert.equal(kindOfIdentifier("A_NAME_WITH_UNDERSCORES"), null, "an underscore");
  assert.equal(kindOfIdentifier("A NAME  WITH TWO SPACES"), null, "two spaces in a row");
  assert.equal(kindOfIdentifier(" A NAME"), null, "a space at the start");
  assert.equal(kindOfIdentifier("A NAME: WITH A COLON"), null, "a colon");
  assert.equal(kindOfIdentifier("A NAME/WITH A SLASH"), null, "a slash");
  assert.equal(kindOfIdentifier("A NAME (WITH PARENTHESES)"), null, "parentheses");
  assert.equal(kindOfIdentifier("UC-022"), "UC");
});

// TST-472243 · level: unit · module: MOD-identifiers
// guards: AN INSTANCE IS A FORK OF AGENT M
// given: a GitHub Pages hostname with a repository as its first path segment, and a known positive matching that shape
// input: instanceOfPagesAddress on that address and on a non-Pages hostname
// expect: owner/name for the Pages address, and null for the other host
test("instanceOfPagesAddress — the owner and first path segment of a Pages address, null elsewhere", () => {
  assert.equal(instanceOfPagesAddress({ hostname: "alice.github.io", pathname: "/research-agent/docs/index.html" }),
    "alice/research-agent", "known positive: a Pages hostname and repository path");
  assert.equal(instanceOfPagesAddress({ hostname: "localhost", pathname: "/research-agent/" }), null,
    "a non-Pages host is not an instance address");
});
