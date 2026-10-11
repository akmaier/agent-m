// The next identifier of a kind (ITM-299) — MOD-identifiers' nextIdentifier, as docs/architecture/MOD-identifiers.md states it:
// for a numbered kind, one more than the highest number of that kind ever used; for a slug kind, `<kind>-<slug>`; IdentifierTaken,
// naming the identifier, for one that was ever used — a withdrawn identifier is never given again —; and TypeError when a slug kind
// has no slug or the slug breaks the scheme. `everUsed` holds every identifier of the kind that the version history knows, the
// withdrawn ones among them. identifiersIn, positionalReferences and pagesAddress are not part of ITM-299 and are not tested here.
// Run: node --test tests/identifiers-next.test.mjs
//
// Module: MOD-identifiers
// Guards: EVERY ARTIFACT HAS AN IDENTIFIER; THE NAME IS THE ID AND IT SURVIVES; UC-007; UC-019
// Level: unit
//
// Each test names the requirements it guards and states its input and its expected result before it runs (given / input / expect);
// where a test expects something to be refused, the same call is first shown to give an identifier on a known positive. Nothing
// reaches the network. The counter-proofs are recorded in the pull request.
//
// UC-007 (main flow, step 5) assigns identifiers `UC-<nnn>` to the use cases it drafts, and UC-019 (alternative flow 7a) splits a use
// case by keeping it and adding another. Four cases the module file leaves open are read as follows, and named in the pull request:
// the first number of a numbered kind is 001; a kind outside the seven the signature lists is no kind to give an identifier of, a
// TypeError; after 999 of ARC, TST or ITM, which the scheme gives exactly three digits, there is no next identifier — a RangeError,
// not an identifier the scheme rejects; and a history that is not given at all is no empty history — a TypeError.

import test from "node:test";
import assert from "node:assert/strict";
import { kindOfIdentifier, nextIdentifier } from "../src/identifiers/index.mjs";

// The identifiers a history holds, as a generator: it can be read once, as an Iterable<string> may be.
function once(identifiers) {
  return (function* () { yield* identifiers; })();
}

// ---------------------------------------------------------------- a numbered kind

// guards: THE NAME IS THE ID AND IT SURVIVES; UC-007; UC-019
// given: the use-case identifiers the history knows — UC-001, UC-022 and UC-031, the last of them withdrawn, so that only the history
//        holds it — given in that order, in another order, as a Set and as a generator that can be read once
// input: nextIdentifier("UC", everUsed) for each of the four forms
// expect: UC-032 for each — one more than the highest number ever used, neither the number of identifiers used plus one (UC-004) nor
//         the lowest number free (UC-002), and not UC-031, which would give the withdrawn identifier again
test("nextIdentifier — a use case after UC-001, UC-022 and a withdrawn UC-031 is UC-032, whatever form the history is given in", () => {
  const history = ["UC-001", "UC-022", "UC-031"];
  assert.equal(nextIdentifier("UC", history), "UC-032");
  assert.equal(nextIdentifier("UC", ["UC-031", "UC-001", "UC-022"]), "UC-032");
  assert.equal(nextIdentifier("UC", new Set(history)), "UC-032");
  assert.equal(nextIdentifier("UC", once(history)), "UC-032");
});

// guards: EVERY ARTIFACT HAS AN IDENTIFIER
// given: histories whose highest number sits where the digits change — UC-999 and UC-1000; UC-008; UC-009; UC-099
// input: nextIdentifier("UC", everUsed) for each
// expect: UC-1001, the numbers compared as numbers and not as text (as text, UC-999 is above UC-1000); UC-009; UC-010; UC-100 —
//         the number written with three digits at least
test("nextIdentifier — the numbers are compared as numbers and written with three digits at least", () => {
  assert.equal(nextIdentifier("UC", ["UC-999", "UC-1000"]), "UC-1001");
  assert.equal(nextIdentifier("UC", ["UC-008"]), "UC-009");
  assert.equal(nextIdentifier("UC", ["UC-009"]), "UC-010");
  assert.equal(nextIdentifier("UC", ["UC-099"]), "UC-100");
});

// guards: EVERY ARTIFACT HAS AN IDENTIFIER
// given: one history that holds a different highest number for each numbered kind — UC-005, ARC-020, TST-300 and ITM-451 — and,
//        among them, identifiers of kinds that are not numbered: MOD-identifiers, SRC-eu-ai-act and a requirement's name
// input: nextIdentifier(kind, history) for UC, ARC, TST and ITM
// expect: UC-006, ARC-021, TST-301 and ITM-452 — each kind counts its own numbers, no other kind's number is one of them
test("nextIdentifier — each numbered kind counts its own numbers", () => {
  const history = ["UC-005", "ARC-020", "TST-300", "ITM-451", "MOD-identifiers", "SRC-eu-ai-act", "THE NAME IS THE ID AND IT SURVIVES"];
  assert.equal(nextIdentifier("UC", history), "UC-006");
  assert.equal(nextIdentifier("ARC", history), "ARC-021");
  assert.equal(nextIdentifier("TST", history), "TST-301");
  assert.equal(nextIdentifier("ITM", history), "ITM-452");
});

// guards: EVERY ARTIFACT HAS AN IDENTIFIER; UC-007
// given: no identifier of the kind ever used — an empty history, an empty Set, and a history that holds only other kinds
// input: nextIdentifier(kind, everUsed) for UC, ARC, TST and ITM on the empty history, and for UC on each of the other two
// expect: <kind>-001 for each — the first number of a kind is 001, as UC-001 is the lowest number in use
test("nextIdentifier — the first identifier of a numbered kind is 001", () => {
  for (const kind of ["UC", "ARC", "TST", "ITM"]) assert.equal(nextIdentifier(kind, []), `${kind}-001`, kind);
  assert.equal(nextIdentifier("UC", new Set()), "UC-001");
  assert.equal(nextIdentifier("UC", ["ITM-451", "MOD-identifiers"]), "UC-001");
});

// guards: EVERY ARTIFACT HAS AN IDENTIFIER
// given: ARC, TST and ITM, which the scheme gives exactly three digits, with ARC-998, TST-998 and ITM-998 as the highest number; then
//        with 999 as the highest; and UC, which takes three digits or more, with UC-999 as the highest
// input: nextIdentifier(kind, [<kind>-001, <kind>-<highest>]) for each
// expect: <kind>-999 after 998 — still an identifier of the scheme —; after 999 a RangeError for each of ARC, TST and ITM, since
//         ARC-1000 is no identifier of the scheme (kindOfIdentifier gives null); UC-1000, which is one, for UC
test("nextIdentifier — after 999 a three-digit kind has no next identifier, a use case has UC-1000", () => {
  for (const kind of ["ARC", "TST", "ITM"]) {
    // Known positive: 999 itself is still given.
    assert.equal(nextIdentifier(kind, [`${kind}-001`, `${kind}-998`]), `${kind}-999`, kind);
    assert.equal(kindOfIdentifier(`${kind}-1000`), null, `${kind}-1000 is outside the scheme`);
    assert.throws(() => nextIdentifier(kind, [`${kind}-001`, `${kind}-999`]), RangeError, `${kind} after ${kind}-999`);
  }
  assert.equal(nextIdentifier("UC", ["UC-001", "UC-999"]), "UC-1000");
  assert.equal(kindOfIdentifier("UC-1000"), "UC");
});

// ---------------------------------------------------------------- a slug kind

// guards: EVERY ARTIFACT HAS AN IDENTIFIER
// given: the slug kinds SRC, MOD and RES with the slugs eu-ai-act, text-tools and alex-cluster, none used; and SRC with the slug
//        iec-62304, which holds digits, among SRC-vibe-coding, MOD-iec-62304 and UC-022, used before — of the same kind with another
//        slug, of another kind with this slug, and of another kind
// input: nextIdentifier(kind, everUsed, slug) for each
// expect: <kind>-<slug> for each — SRC-eu-ai-act, MOD-text-tools, RES-alex-cluster, SRC-iec-62304 —, an identifier of its kind by
//         the scheme (kindOfIdentifier gives the kind); the identifiers used before are no hindrance
test("nextIdentifier — a slug kind gets <kind>-<slug>", () => {
  for (const [kind, slug] of [["SRC", "eu-ai-act"], ["MOD", "text-tools"], ["RES", "alex-cluster"]]) {
    const id = nextIdentifier(kind, [], slug);
    assert.equal(id, `${kind}-${slug}`);
    assert.equal(kindOfIdentifier(id), kind, `${id} is an identifier of its kind`);
  }
  assert.equal(nextIdentifier("SRC", ["SRC-vibe-coding", "MOD-iec-62304", "UC-022"], "iec-62304"), "SRC-iec-62304");
});

// ---------------------------------------------------------------- an identifier ever used

// guards: THE NAME IS THE ID AND IT SURVIVES
// given: SRC-eu-ai-act and SRC-vibe-coding, identifiers the history knows — the first of them withdrawn, so that only the history
//        holds it — given as an array, as a Set and as a generator; and, to show the same call giving an identifier, the slug
//        iec-62304, which was never used
// input: nextIdentifier("SRC", used, "iec-62304"); then nextIdentifier("SRC", used, "eu-ai-act") for each of the three forms; then
//        nextIdentifier("MOD", used, "eu-ai-act")
// expect: SRC-iec-62304; for eu-ai-act an error named IdentifierTaken whose message names SRC-eu-ai-act, for each form; for MOD
//         with the slug eu-ai-act MOD-eu-ai-act — the same slug of another kind is another identifier
test("nextIdentifier — a slug ever used throws IdentifierTaken, naming the identifier", () => {
  const used = ["SRC-eu-ai-act", "SRC-vibe-coding"];
  // Known positive: a slug that was never used is given.
  assert.equal(nextIdentifier("SRC", used, "iec-62304"), "SRC-iec-62304");
  const taken = (error) => error instanceof Error && error.name === "IdentifierTaken" && error.message.includes("SRC-eu-ai-act");
  assert.throws(() => nextIdentifier("SRC", used, "eu-ai-act"), taken);
  assert.throws(() => nextIdentifier("SRC", new Set(used), "eu-ai-act"), taken);
  assert.throws(() => nextIdentifier("SRC", once(used), "eu-ai-act"), taken);
  assert.equal(nextIdentifier("MOD", used, "eu-ai-act"), "MOD-eu-ai-act");
});

// ---------------------------------------------------------------- a history that is not given

// guards: THE NAME IS THE ID AND IT SURVIVES
// given: an empty history, to show the same calls giving identifiers; then no history at all — the argument left out, undefined and
//        null — for a numbered kind and for a slug kind
// input: nextIdentifier("UC", []) and nextIdentifier("SRC", [], "eu-ai-act"); then nextIdentifier("UC"), and each of the two kinds
//        with undefined and with null for the history
// expect: UC-001 and SRC-eu-ai-act for the empty history; a TypeError for each of the others — a history that is not given is not an
//         empty one, since an identifier withdrawn long ago would then be given again
test("nextIdentifier — a history that is not given is no empty history", () => {
  // Known positive: an empty history is a history that holds nothing.
  assert.equal(nextIdentifier("UC", []), "UC-001");
  assert.equal(nextIdentifier("SRC", [], "eu-ai-act"), "SRC-eu-ai-act");
  assert.throws(() => nextIdentifier("UC"), TypeError, "UC with no second argument");
  for (const missing of [undefined, null]) {
    assert.throws(() => nextIdentifier("UC", missing), TypeError, `UC with ${missing} for the history`);
    assert.throws(() => nextIdentifier("SRC", missing, "eu-ai-act"), TypeError, `SRC with ${missing} for the history`);
  }
});

// ---------------------------------------------------------------- no slug, or a slug that breaks the scheme

// guards: EVERY ARTIFACT HAS AN IDENTIFIER
// given: RES with the slug alex-cluster, to show the same call giving an identifier; then each slug kind — SRC, MOD, RES — with no
//        slug and with null; and SRC with the empty slug, a slug that is a number, and slugs that break the scheme — capital letters,
//        a blank inside, a blank at the end, a double hyphen, a hyphen at the start, a hyphen at the end, an underscore, a slash
// input: nextIdentifier(kind, [], slug) for each
// expect: RES-alex-cluster; a TypeError for each of the others
test("nextIdentifier — a slug kind without a slug, or with a slug that breaks the scheme, throws TypeError", () => {
  // Known positive: a slug that keeps the scheme is given.
  assert.equal(nextIdentifier("RES", [], "alex-cluster"), "RES-alex-cluster");
  for (const kind of ["SRC", "MOD", "RES"]) {
    assert.throws(() => nextIdentifier(kind, []), TypeError, `${kind} without a slug`);
    assert.throws(() => nextIdentifier(kind, [], null), TypeError, `${kind} with null for a slug`);
  }
  for (const slug of ["", 5, "Eu-Ai-Act", "eu ai act", "eu-ai-act ", "eu--ai", "-eu", "eu-", "eu_ai", "eu/ai"]) {
    assert.throws(() => nextIdentifier("SRC", [], slug), TypeError, `the slug ${JSON.stringify(slug)}`);
  }
});

// ---------------------------------------------------------------- a kind that gets no identifier from it

// guards: EVERY ARTIFACT HAS AN IDENTIFIER
// given: UC, to show the same call giving an identifier; then JOB and "requirement", kinds of the scheme that the signature does not
//        list; and a name that is no kind at all — FOO, the lowercase uc, the empty string, undefined and a number; and JOB with the
//        slug 20261005-0900-a1b2, which makes JOB-20261005-0900-a1b2, an identifier of the scheme, though not one this gives
// input: nextIdentifier(kind, []) and nextIdentifier(kind, [], "x") for each of the others; and nextIdentifier("JOB", [], the slug)
// expect: UC-001; a TypeError for each of the others, with a slug and without, and for the JOB whose identifier the scheme accepts
test("nextIdentifier — a kind outside the seven it lists throws TypeError", () => {
  // Known positive: a kind the signature lists is given an identifier.
  assert.equal(nextIdentifier("UC", []), "UC-001");
  for (const kind of ["JOB", "requirement", "FOO", "uc", "", undefined, 5]) {
    assert.throws(() => nextIdentifier(kind, []), TypeError, `the kind ${String(kind)} without a slug`);
    assert.throws(() => nextIdentifier(kind, [], "x"), TypeError, `the kind ${String(kind)} with a slug`);
  }
  assert.equal(kindOfIdentifier("JOB-20261005-0900-a1b2"), "JOB", "the scheme accepts this identifier");
  assert.throws(() => nextIdentifier("JOB", [], "20261005-0900-a1b2"), TypeError, "a JOB identifier is not given by nextIdentifier");
});
