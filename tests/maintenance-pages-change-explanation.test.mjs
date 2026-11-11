// The explanation of the section Change of an issue's page says what Save does as UC-012 step 6 and docs/architecture/MOD-maintenance-pages.md state it: the change of requirements drafted with the issue as its origin,
// then "*Save*, which writes them as the kind's writer does, naming the issue, and links each entry written to the page where it is accepted"; UC-012 step 6: Agent M "writes them as entries under
// `docs/spec-freigaben/`, each naming the issue". A change drafted by prompt is the participant's new text, without classes (UC-019): the explanation names no candidate and no conflict.
// Run: node --test tests/maintenance-pages-change-explanation.test.mjs
//
// Module: MOD-maintenance-pages
// Guards: EVERY STEP EXPLAINS ITSELF; UC-012
// Level: component
//
// The world is tests/maintenance-pages-world.mjs: its fake GitHub holds the issues of alice/product; the route `issue` is the real one.

import test, { afterEach } from "node:test";
import assert from "node:assert/strict";
import { PRODUCT_URL, draw } from "./main-page-home-harness.mjs";
import { connect, parseAddress } from "../src/repository-hosts/index.mjs";
import { byClass, one, restoreWorld, textOf, waitFor, world, routeNamed, pages } from "./maintenance-pages-world.mjs";

afterEach(restoreWorld);

const issueRecord = (number, labels) => ({ number, title: `Issue ${number}`, body: `Text of issue ${number}.`, state: "open", labels, comments: [] });

/** The explanation folded in the section of `name` of issue 7, labelled change. */
async function explanationOf(name) {
  const w = world({ mails: [], issues: [issueRecord(7, ["change"])] });
  w.context.product = { address: PRODUCT_URL, kind: "github", host: connect(parseAddress(PRODUCT_URL), { token: "github_pat_CHANGE0EXPLANATION0123456789ab" }), tokenStored: true };
  assert.ok(routeNamed("issue"), `the route issue: ${pages.error?.message}`);
  const detail = await draw(routeNamed("issue"), w.context, { number: "7" });
  await waitFor(() => byClass(detail, name).length > 0);
  const section = one(detail, name);
  assert.ok(section, `issue 7 shows its section ${name}`);
  return textOf(one(section, "explain"));
}

// TST-20261111201 · level: component · module: MOD-maintenance-pages
// guards: EVERY STEP EXPLAINS ITSELF; UC-012
// given: known positive first — the section Analyse of the same page explains itself; the product alice/product with its open issue 7, labelled change
// input: the route issue is drawn for issue 7
// expect: the explanation of the section Change says that Save writes the drafted change as entries under docs/spec-freigaben/, as the kind's writer writes them, each naming this issue, and links each entry to the page where it is accepted;
//   it names no candidates, no conflict and no class
test("TST-20261111201 the section Change explains Save as UC-012 step 6 states it: the drafted change written as entries naming the issue, no candidates and no conflict", async () => {
  assert.match(await explanationOf("issue-analysis"), /Analyse asks the participant/, "known positive: the section Analyse explains itself");
  restoreWorld();
  const text = await explanationOf("issue-change");
  assert.match(text, /Save writes the drafted change/);
  assert.match(text, /as entries under docs\/spec-freigaben\//);
  assert.match(text, /each naming this issue/);
  assert.match(text, /the page where it is accepted/);
  assert.doesNotMatch(text, /candidate/i);
  assert.doesNotMatch(text, /conflict/i);
  assert.doesNotMatch(text, /\bclass/i);
});
