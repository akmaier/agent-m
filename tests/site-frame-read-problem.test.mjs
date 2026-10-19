// MOD-site-frame's readProblem (ITM-601): the problem a failed read of a repository shows on a page, as docs/architecture/MOD-site-frame.md states it:
// "`readProblem(failure: Error, tokenStored: boolean) -> Element` — the problem a failed read of a repository shows on a page: for `NotFound` while this browser
// stores no token that reaches it, that the repository is private or does not exist and no token reaches it, with the link to store one (UC-008 1a, UC-020 2a);
// for any other host's failure (`HostError`), the host's own message, and the link to store a token where none is stored; for an error that is no host's failure, a fault of the page
// itself: that this page could not be drawn, with the error's message, and no link to a token." (ITM-865)
// Run: node --test tests/site-frame-read-problem.test.mjs
//
// Module: MOD-site-frame
// Guards: UC-008; UC-020; A USED-UP RATE LIMIT IS NAMED, NOT BLAMED ON THE TOKEN
// Level: unit
//
// The page is the small fixture DOM of tests/site-frame-start.d/dom.mjs. Each test states its input and its expected result in its own text; none reads an expected
// result from the SPEC, a use case or an architecture file. The readings the module file leaves open, which the pull request names:
//   - "the link to store one" is <a class="token-step" href="#add-product">Store a token</a>, the address of the add-product step that the frame's own selector goes to
//     (fragmentOf("add-product") in routing.mjs), and it stands after one space in the same <p class="problem">.
//   - "the host's own message" is the failure's `message`, unchanged.
//   - "a host's failure (`HostError`)" is an instance of MOD-repository-hosts' HostError class; the failures of the cases of a host below are made with it, by their names.
//   - "that this page could not be drawn, with the error's message" is the one sentence "This page could not be drawn: <message>" in the same <p class="problem">, with no <a> in it, whatever
//     `tokenStored` says.
//   - `tokenStored` true means a token that reaches the repository is stored, so no link stands; false means none is stored.
// Nothing is read from a repository: the function takes no host, and a spy on `fetch` that refuses records that none is called. The counter-proofs (a planted fault in
// src/site-frame/ and the test's failing result) are recorded in the pull request.

import assert from "node:assert/strict";
import test from "node:test";
import { all, installPage, outside, offline } from "./site-frame-start.d/dom.mjs";
import { HostError } from "../src/repository-hosts/index.mjs";

installPage({ hostname: "acme.github.io", pathname: "/instance/docs/index.html" });
offline();
const { readProblem } = await import("../src/site-frame/index.mjs");

const PRIVATE = "This repository is private or does not exist, and this browser stores no token that reaches it. Store the product's token, then reload.";
const failure = (name, message) => new HostError(name, {}, message);
const linksOf = (paragraph) => all(paragraph, "a");
const classes = (node) => node.className.split(" ").sort().join(" ");

test.afterEach(() => { assert.deepEqual([outside.reached, outside.seen], [[], []], "no request left the fixture"); });

// TST-601001 · level: unit · module: MOD-site-frame
// guards: UC-008; UC-020
// given: a failed read that is a NotFound with the message "UC-001.md was not found", and no token stored
// input: readProblem(failure, false)
// expect: one <p> of the class problem whose text is exactly the sentence that the repository is private or does not exist and that this browser stores no token that reaches it, a space and "Store a token"; one <a> in it, of the class token-step, whose href is "#add-product" and whose text is "Store a token"
test("readProblem — a NotFound while no token is stored says the repository is private or missing, with the link to store a token", () => {
  assert.equal(typeof readProblem, "function", "the frame provides readProblem");
  const paragraph = readProblem(failure("NotFound", "UC-001.md was not found"), false);
  assert.equal(paragraph.localName, "p");
  assert.equal(classes(paragraph), "problem");
  assert.equal(paragraph.textContent, `${PRIVATE} Store a token`);
  const links = linksOf(paragraph);
  assert.equal(links.length, 1, "one link");
  assert.equal(classes(links[0]), "token-step");
  assert.equal(links[0].getAttribute("href"), "#add-product");
  assert.equal(links[0].textContent, "Store a token");
});

// TST-601002 · level: unit · module: MOD-site-frame
// guards: UC-008; UC-020
// given: the same NotFound, "UC-001.md was not found", and a token stored that reaches the repository
// input: readProblem(failure, true)
// expect: one <p> of the class problem whose text is exactly "UC-001.md was not found"; no link in it (the same search finds the link in the case above)
test("readProblem — a NotFound while a token is stored shows the host's own message and no link", () => {
  const known = linksOf(readProblem(failure("NotFound", "UC-001.md was not found"), false));
  assert.equal(known.length, 1, "known positive: the search finds the link where none is stored");
  const paragraph = readProblem(failure("NotFound", "UC-001.md was not found"), true);
  assert.equal(paragraph.localName, "p");
  assert.equal(classes(paragraph), "problem");
  assert.equal(paragraph.textContent, "UC-001.md was not found");
  assert.equal(linksOf(paragraph).length, 0, "no link");
});

// TST-601003 · level: unit · module: MOD-site-frame
// guards: UC-008; UC-020; A USED-UP RATE LIMIT IS NAMED, NOT BLAMED ON THE TOKEN
// given: a failed read that is a RateLimited with the message "GitHub's request limit for the account these requests are made with is used up. It resets at 2030-01-01 00:00 UTC.", and a token stored
// input: readProblem(failure, true)
// expect: the text is exactly that message; the sentence about a private repository is not in it; no word "token" is in it; no link
test("readProblem — a failure other than NotFound shows the host's own message, as a used-up limit names itself", () => {
  const LIMIT = "GitHub's request limit for the account these requests are made with is used up. It resets at 2030-01-01 00:00 UTC.";
  const paragraph = readProblem(failure("RateLimited", LIMIT), true);
  assert.equal(paragraph.textContent, LIMIT);
  assert.equal(paragraph.textContent.includes("private or does not exist"), false);
  assert.equal(/token/i.test(paragraph.textContent), false);
  assert.equal(linksOf(paragraph).length, 0);
});

// TST-601004 · level: unit · module: MOD-site-frame
// guards: UC-008; UC-020
// given: a failed read that is a TokenRefused with the message "GitHub rejected authentication with your token.", and no token stored
// input: readProblem(failure, false)
// expect: the text is exactly "GitHub rejected authentication with your token." and a space and "Store a token" — the host's message, not the sentence of a private repository —; one link, href "#add-product"
test("readProblem — a failure other than NotFound while no token is stored shows the host's own message and the link to store a token", () => {
  const paragraph = readProblem(failure("TokenRefused", "GitHub rejected authentication with your token."), false);
  assert.equal(paragraph.textContent, "GitHub rejected authentication with your token. Store a token");
  assert.equal(paragraph.textContent.includes("private or does not exist"), false);
  const links = linksOf(paragraph);
  assert.equal(links.length, 1);
  assert.equal(links[0].getAttribute("href"), "#add-product");
});

// TST-601005 · level: unit · module: MOD-site-frame
// guards: UC-008; UC-020
// given: an Error whose name is "Error" (a failure that no host raised), with the message "boom", and a token stored
// input: readProblem(failure, true)
// expect: one <p> of the class problem whose text is exactly "This page could not be drawn: boom"; no link
test("readProblem — a failure no host raised is shown as a fault of the page, by its message", () => {
  const paragraph = readProblem(new Error("boom"), true);
  assert.equal(paragraph.localName, "p");
  assert.equal(classes(paragraph), "problem");
  assert.equal(paragraph.textContent, "This page could not be drawn: boom");
  assert.equal(linksOf(paragraph).length, 0);
});

// TST-865001 · level: unit · module: MOD-site-frame
// guards: UC-008; UC-020
// given: the same Error("boom"), and no token stored
// input: readProblem(failure, false)
// expect: the text is exactly "This page could not be drawn: boom"; no link, and no word "token" in it (the fault is not the person's token; the same call for a host's failure finds the link)
test("readProblem — a fault of the page names no token even where none is stored", () => {
  const known = linksOf(readProblem(failure("TokenRefused", "GitHub rejected authentication with your token."), false));
  assert.equal(known.length, 1, "known positive: the search finds the link for a host's failure where none is stored");
  const paragraph = readProblem(new Error("boom"), false);
  assert.equal(paragraph.textContent, "This page could not be drawn: boom");
  assert.equal(linksOf(paragraph).length, 0);
  assert.equal(/token/i.test(paragraph.textContent), false);
});

// TST-865002 · level: unit · module: MOD-site-frame
// guards: UC-008; UC-020
// given: a ReferenceError with the message "draw is not defined" (the fault of ITM-861), and no token stored
// input: readProblem(failure, false)
// expect: the text is exactly "This page could not be drawn: draw is not defined"; no link
test("readProblem — a ReferenceError of the page is shown as a fault of the page", () => {
  const paragraph = readProblem(new ReferenceError("draw is not defined"), false);
  assert.equal(paragraph.textContent, "This page could not be drawn: draw is not defined");
  assert.equal(linksOf(paragraph).length, 0);
});
