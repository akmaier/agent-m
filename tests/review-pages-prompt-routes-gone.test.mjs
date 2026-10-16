// MOD-review-pages and MOD-trace-pages hold no route, file, link or button for changing by prompt (ITM-551), as the accepted texts of docs/architecture/MOD-review-pages.md and
// MOD-trace-pages.md state their routes: the review pages' routes are `<k>`, `<k>/<id>`, `<k>/all`, `<k>/<id>/edit` with `requirement/<name>/edit` and `requirements/new`, `draft`,
// `<k>/draft` and `arrange/<group kind>`, and a change is asked for in the prompt bar and shown on `draft` (UC-019 step 8, UC-049 step 5). The routes `<k>/<id>/prompt`,
// `requirement/<name>/prompt` and `requirements/prompt` are not among them; the specification view's buttons are Edit, + Requirement and Arrange (tests/trace-pages-edit-links.test.mjs).
// Run: node --test tests/review-pages-prompt-routes-gone.test.mjs
//
// Module: MOD-review-pages
// Guards: UC-019; UC-049
// Level: unit
//
// The fixtures are tests/review-pages-draft-world.mjs'. Each test states a known positive: the same page shows what stays (its Edit link), and the same scan finds what it must find.
// Where the texts leave a reading open, the test states the one it takes, and the pull request names it:
//   - A route is gone when no file of the module draws it and no page links it: the part `prompt` of an address is read by nothing, so it no longer changes the page (tests/review-pages-subjects.test.mjs).
// Each test states its input and its expected result before it runs (given / input / expect). The counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { byClass, draw, fakeProduct, fetched, find } from "./review-pages-draft-world.mjs";

test.afterEach(() => { assert.deepEqual(fetched.splice(0), [], "no request left the fixtures"); });
const ROOT = new URL("../", import.meta.url);

// TST-551001 · level: unit · module: MOD-review-pages
// guards: UC-019 (step 1)
// given: the open use case UC-007 of a product, with a token
// input: the route use-case with the id UC-007
// expect: the page offers Edit, a link to #use-case/id=UC-007/edit=1, as the known positive; it offers no Change by prompt: no anchor of the class prompt-link, no text "Change by prompt" and no anchor whose address holds "prompt"
test("use-case/<id> — the page offers no Change by prompt", async () => {
  const fake = fakeProduct();
  const { target } = await draw(fake, "use-case", { id: "UC-007" });
  const anchors = find(target, (node) => node.localName === "a");
  assert.deepEqual(byClass(target, "a", "edit-link").map((node) => node.getAttribute("href")), ["#use-case/id=UC-007/edit=1"], "known positive: Edit stays");
  assert.equal(byClass(target, "a", "prompt-link").length, 0);
  assert.equal(target.textContent.includes("Change by prompt"), false);
  assert.deepEqual(anchors.map((node) => node.getAttribute("href")).filter((href) => (href ?? "").includes("prompt")), []);
});

// TST-551002 · level: unit · module: MOD-review-pages
// guards: UC-019
// given: the folder src/review-pages/ of this repository
// input: whether src/review-pages/prompt.mjs and src/review-pages/requirements-prompt.mjs exist
// expect: neither exists; the files that the draft route and the editors use — conversation-draft.mjs, file-drafts.mjs, candidates.mjs, common.mjs — exist, as the known positive
test("src/review-pages — prompt.mjs and requirements-prompt.mjs are removed", () => {
  for (const kept of ["conversation-draft.mjs", "file-drafts.mjs", "candidates.mjs", "common.mjs"]) assert.equal(existsSync(new URL(`src/review-pages/${kept}`, ROOT)), true, `known positive: ${kept}`);
  assert.equal(existsSync(new URL("src/review-pages/prompt.mjs", ROOT)), false);
  assert.equal(existsSync(new URL("src/review-pages/requirements-prompt.mjs", ROOT)), false);
});

// TST-551003 · level: unit · module: MOD-review-pages
// guards: UC-019; UC-049
// given: every .mjs file of src/review-pages/ and src/trace-pages/
// input: the files scanned for the texts "Change by prompt", "prompt=1" and "/prompt"
// expect: no file holds any of them; the same scan finds the text "export" in every file as the known positive
test("src/review-pages and src/trace-pages — no text names Change by prompt or a prompt route", () => {
  const files = ["src/review-pages/", "src/trace-pages/"].flatMap((folder) => readdirSync(new URL(folder, ROOT)).filter((name) => name.endsWith(".mjs")).map((name) => `${folder}${name}`));
  const holding = (needle) => files.filter((path) => readFileSync(new URL(path, ROOT), "utf8").includes(needle));
  assert.ok(files.length >= 15, "known positive: the folders hold their files");
  assert.equal(holding("export").length, files.length, "known positive: the scan finds a text every file holds");
  for (const needle of ["Change by prompt", "prompt=1", "/prompt"]) assert.deepEqual(holding(needle), [], needle);
});
