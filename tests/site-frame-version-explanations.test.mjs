// The explanations of a source's new version and of moving a product to it (ITM-591) — MOD-site-frame's explain, for the two steps of UC-016 that ask something of the
// person: + New version and Move. Each is a folded What is this? written for someone new to GitHub. The library page (MOD-settings-pages) shows them folded at their step;
// tests/settings-pages-library-versions.test.mjs pins that.
// Run: node --test tests/site-frame-version-explanations.test.mjs
//
// Module: MOD-site-frame
// Guards: EVERY STEP EXPLAINS ITSELF; A SOURCE VERSION IS NEVER OVERWRITTEN; UC-016
// Level: unit
//
// The document is the small DOM of tests/settings-pages-harness.mjs. What a test pins of a topic is each claim UC-016 makes of the step, stated in the test's own text; the
// counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { installDocument } from "./settings-pages-harness.mjs";

installDocument();
const { explain } = await import("../src/site-frame/index.mjs");
const { renderArtifact } = await import("../src/markdown-render/index.mjs");

const EXPLANATIONS = readFileSync(new URL("../src/site-frame/explanations.md", import.meta.url), "utf8");
const topicText = (topic) => EXPLANATIONS.split(/^## /m).slice(1).find((part) => part.startsWith(`${topic}\n`))?.slice(topic.length + 1);
const bodyText = (topic) => (explain(topic).children[1]?.textContent ?? "").replace(/\s+/g, " ");

// TST-591401 · level: unit · module: MOD-site-frame
// guards: EVERY STEP EXPLAINS ITSELF; UC-016
// given: explanations.md, and the topics source-new-version and source-move
// input: explain(topic) for each
// expect: each is the folded What is this? — a <details class="explain"> without the open attribute, holding <summary>What is this?</summary> and then the topic's Markdown rendered, in which no asterisk or backtick of the source is left standing
test("explain — source-new-version and source-move are folded What is this? with their text", () => {
  for (const topic of ["source-new-version", "source-move"]) {
    const text = topicText(topic);
    assert.equal(Boolean(text?.trim()), true, `known positive: explanations.md holds the topic ${topic}`);
    const folded = explain(topic);
    assert.equal(folded.localName, "details", `${topic}: it is expandable`);
    assert.equal(folded.className, "explain", `${topic}: it uses the shared explanation presentation`);
    assert.equal(folded.hasAttribute("open"), false, `${topic}: it is folded`);
    const [summary, body, ...more] = folded.children;
    assert.deepEqual([summary.localName, summary.textContent, more.length], ["summary", "What is this?", 0], topic);
    assert.equal(body.innerHTML, renderArtifact(text).innerHTML, `${topic}: its body is its text, rendered`);
    assert.doesNotMatch(bodyText(topic), /[*`]/, `${topic}: it shows no stray Markdown`);
  }
});

// TST-591402 · level: unit · module: MOD-site-frame
// guards: UC-016; A SOURCE VERSION IS NEVER OVERWRITTEN
// given: the topic source-new-version
// input: explain("source-new-version")
// expect: text saying a new version is a newer edition or revision of a source already in the library; that it is added beside the old versions, which are never overwritten; that saving commits it to the instance repository under the person's own account; that files with exactly the same bytes as an existing version are refused and nothing is recorded; and that products stay on the version they link until the person moves them
test("explain — source-new-version: what a new version is, that none is overwritten, and that products stay on theirs (UC-016)", () => {
  assert.equal(Boolean(topicText("source-new-version")?.trim()), true, "known positive: the topic is in explanations.md");
  const text = bodyText("source-new-version");
  for (const [pattern, says] of [
    [/new version is a newer edition or revision of a source that is already in the library/, "what a new version is"],
    [/added beside the old versions, which are never overwritten/, "the old versions are never overwritten"],
    [/commit to the instance repository under your own account/, "saving commits to the instance repository under the person's account"],
    [/exactly the same bytes as an existing version[^.]*nothing is recorded/, "the same bytes are refused and nothing is recorded"],
    [/Products stay on the version they link until you move them/, "products stay on their version until moved"],
  ]) assert.match(text, pattern, `it says ${says}`);
});

// TST-915001 · level: unit · module: MOD-site-frame
// guards: EVERY STEP EXPLAINS ITSELF; UC-016
// given: the topic source-new-version
// input: explain("source-new-version")
// expect: text saying what a new version records for each kind of source — for documents and standards their files, each with its SHA-256; for a repository no file, the commit the repository stands at when the person saves, with no file of the repository stored; for an EU legal text that was fetched before no file either, the fetch run that + New version starts recording the newer text as a further version
test("explain — source-new-version: what a new version records for each kind of source (UC-016 step 1)", () => {
  assert.equal(Boolean(topicText("source-new-version")?.trim()), true, "known positive: the topic is in explanations.md");
  const text = bodyText("source-new-version");
  for (const [pattern, says] of [
    [/Documents and standards: select its files\. Your browser computes each file's SHA-256[^.]*, and the version records the files with their fingerprints/, "documents and standards record their files with their SHA-256"],
    [/A repository: select no file\. The version records the commit the repository stands at when you save/, "a repository records the commit it stands at when the person saves, with no file selected"],
    [/No file of the repository is stored/, "no file of the repository is stored"],
    [/EU legal text that was fetched before: select no file either\. \+ New version starts the fetch run for the entry, which records the newer text it fetches as a further version/, "a fetched EU legal text records the newer text its fetch run brings, with no file selected"],
  ]) assert.match(text, pattern, `it says ${says}`);
});

// TST-915002 · level: unit · module: MOD-site-frame
// guards: EVERY STEP EXPLAINS ITSELF; A SOURCE VERSION IS NEVER OVERWRITTEN; UC-016
// given: the topic source-new-version, and the route of a repository source: its new version records the commit read and no file, and a commit that an existing version records is refused (UC-016 1a)
// input: explain("source-new-version"), and for the counter-proof the sentence the topic held before — "Choose + New version, give the version a name that tells it apart, such as the edition or its date, and select its files;"
// expect: the topic does not tell the person, for every kind of source, to select the version's files — the old sentence is found by the same check, the topic is not — and it says that a commit an existing version already records is refused with nothing recorded
test("explain — source-new-version: does not tell a repository's new version to select files, and refuses a commit already recorded (UC-016 1a)", () => {
  const tellsEveryKindToSelectFiles = (text) => /Choose \+ New version[^.;:]*(,|and) select its files/.test(text);
  assert.equal(tellsEveryKindToSelectFiles("Choose + New version, give the version a name that tells it apart, such as the edition or its date, and select its files; your browser computes each file's SHA-256."), true, "known positive: the old sentence is found by the check");
  const text = bodyText("source-new-version");
  assert.equal(tellsEveryKindToSelectFiles(text), false, "the topic no longer tells every kind to select files");
  assert.match(text, /Files with exactly the same bytes as an existing version, or for a repository a commit that an existing version already records, are refused, and nothing is recorded/, "a commit that an existing version records is refused, and nothing is recorded");
});

// TST-591403 · level: unit · module: MOD-site-frame
// guards: UC-016
// given: the topic source-move
// input: explain("source-move")
// expect: text saying moving changes which version of the source the product links; that the requirements naming the source and the passages that changed are shown first; that Move writes one commit to docs/sources.md of the product's repository under the person's own account and nothing else; and that without pressing Move the product stays on its version
test("explain — source-move: what moving a product does (UC-016)", () => {
  assert.equal(Boolean(topicText("source-move")?.trim()), true, "known positive: the topic is in explanations.md");
  const text = bodyText("source-move");
  for (const [pattern, says] of [
    [/Moving a product changes which version of the source the product links/, "moving changes the linked version"],
    [/requirements that name the source and the passages that changed are shown first/, "requirements and passages are shown first"],
    [/one commit to docs\/sources\.md[^.]*under your own account, and nothing else/, "one commit to docs/sources.md under the person's account, nothing else"],
    [/Without pressing Move the product stays on its version/, "without Move the product stays"],
  ]) assert.match(text, pattern, `it says ${says}`);
});
