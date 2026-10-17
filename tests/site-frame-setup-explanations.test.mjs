// The explanations of the two steps of finishing the setup (ITM-588) — MOD-site-frame's explain, for UC-014: "Both steps carry a folded *What is this?* for people new to GitHub." Step A's topic
// `setup-key` says what UC-014 step 7 gives as the "Why these?": the permissions of the one key and what each is for, and why Only select repositories; Step B's topic `setup-store` says where the
// token is kept and where it goes. What a test pins of a topic is what UC-014 gives it, in the test's own words, and nothing the topic merely happens to word.
// Run: node --test tests/site-frame-setup-explanations.test.mjs
//
// Module: MOD-site-frame
// Guards: EVERY STEP EXPLAINS ITSELF; ONE GITHUB TOKEN SERVES EVERY FEATURE; A TOKEN IS SCOPED TO WHAT IT WRITES; UC-014
// Level: unit
//
// The document comes from the helper file tests/settings-pages-setup.d/dom.mjs, set up before the dynamic imports below, since a static import of the frame would run before it. Each test states its input
// and its expected result before it runs (given / input / expect). The counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { installDocument } from "./settings-pages-setup.d/dom.mjs";

installDocument();
const { explain } = await import("../src/site-frame/index.mjs");
const { renderArtifact } = await import("../src/markdown-render/index.mjs");

const EXPLANATIONS = readFileSync(new URL("../src/site-frame/explanations.md", import.meta.url), "utf8");
// The Markdown under `## <topic>`, up to the next such line; undefined where the file holds no such line.
const topicText = (topic) => EXPLANATIONS.split(/^## /m).slice(1).find((part) => part.startsWith(`${topic}\n`))?.slice(topic.length + 1);
// The folded body's rendered text, as a person reads it: runs of whitespace collapsed to one space.
const bodyText = (topic) => (explain(topic).children[1]?.textContent ?? "").replace(/\s+/g, " ");

// TST-588015 · level: unit · module: MOD-site-frame
// guards: EVERY STEP EXPLAINS ITSELF; UC-014
// given: explanations.md; known positive — the topic repository, which the file holds
// input: explain("setup-key") and explain("setup-store")
// expect: the file holds each heading `## setup-key` and `## setup-store` exactly once, with a body; explain gives for each a <details class="explain"> without the open attribute, holding <summary>What is this?</summary> and then the topic's Markdown rendered, in which no asterisk or backtick of the Markdown shows
test("explain — setup-key and setup-store are folded What is this? with their text", () => {
  assert.match(renderArtifact("an *unclosed mark and `another").textContent, /[*`]/, "known positive: the renderer leaves a mark that is not closed standing");
  assert.ok(topicText("repository")?.trim(), "known positive: explanations.md holds the topic repository");
  for (const topic of ["setup-key", "setup-store"]) {
    assert.equal(EXPLANATIONS.split(/^## /m).slice(1).filter((part) => part.startsWith(`${topic}\n`)).length, 1, `the file holds the topic ${topic} exactly once`);
    const text = topicText(topic);
    assert.ok(text?.trim(), `the topic ${topic} has a body`);
    const folded = explain(topic);
    assert.equal(folded.localName, "details", "it is expandable");
    assert.equal(folded.className, "explain", "it uses the shared explanation presentation");
    assert.equal(folded.hasAttribute("open"), false, "it is folded");
    const [summary, body, ...more] = folded.children;
    assert.deepEqual([summary.localName, summary.textContent, more.length], ["summary", "What is this?", 0]);
    assert.equal(body.innerHTML, renderArtifact(text).innerHTML, "its body is its text, rendered");
    assert.doesNotMatch(bodyText(topic), /[*`]/, "it shows no stray Markdown");
  }
});

// TST-588016 · level: unit · module: MOD-site-frame
// guards: EVERY STEP EXPLAINS ITSELF; ONE GITHUB TOKEN SERVES EVERY FEATURE; A TOKEN IS SCOPED TO WHAT IT WRITES; UC-014 step 7
// given: the topic setup-key
// input: explain("setup-key")
// expect: known positive — the topic repository says "folder on GitHub". The text of setup-key says, for each permission of the one key, what it is for: Contents "read and write" to save and accept, Issues "read and write" for reports that become issues, Pull requests "read and write" for the jobs' changes, Actions "read and write" to start a run, Workflows "read and write" for a generated CI configuration, Metadata "read"; and why Only select repositories: GitHub preselects All repositories, which would let the page write to every repository the person owns
test("explain — setup-key: every permission of the one key and what it is for, and why Only select repositories (UC-014 step 7)", () => {
  assert.match(bodyText("repository"), /folder on GitHub/, "known positive: the search reads a topic the file holds");
  const text = bodyText("setup-key");
  assert.match(text, /Contents \(read and write\) — to save and accept\./);
  assert.match(text, /Issues \(read and write\) — for reports that become issues\./);
  assert.match(text, /Pull requests \(read and write\) — for the jobs' changes\./);
  assert.match(text, /Actions \(read and write\) — to start a run\./);
  assert.match(text, /Workflows \(read and write\) — for a generated CI configuration\./);
  assert.match(text, /Metadata \(read\) — to read the repository\./);
  assert.match(text, /Only select repositories/);
  assert.match(text, /preselects All repositories, which would let this page write to every repository you own/);
});

// TST-588017 · level: unit · module: MOD-site-frame
// guards: EVERY STEP EXPLAINS ITSELF; CONFIGURATION LIVES IN THE BROWSER; A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT; UC-014 step 8
// given: the topic setup-store
// input: explain("setup-store")
// expect: the text says the token is kept in this browser in its localStorage and never in a cookie, an address or a repository; that it is sent only to GitHub's API, as a header; and that Import settings moves it to another computer or browser
test("explain — setup-store: where the token is kept and where it goes (UC-014 step 8)", () => {
  const text = bodyText("setup-store");
  assert.match(text, /kept in this browser only, in its localStorage — never in a cookie, never in an address, never in any repository/);
  assert.match(text, /sent only to GitHub's API, as a header/);
  assert.match(text, /Import settings moves it there from an export/);
});
