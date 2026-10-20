// The explanations of the guided page `get-your-own` (UC-014 steps 1 to 5) — MOD-site-frame's explain, for "Every step carries a folded What is this? for people new to GitHub":
// the topic of the GitHub name (why an organisation used for nothing else is recommended), of each of the four steps (fork, Pages, Actions, open the dashboard) and of the
// licence. What a test pins of a topic is what UC-014 gives it, in the test's own words, and nothing the topic merely happens to word.
// Run: node --test tests/site-frame-get-your-own-explanations.test.mjs
//
// Module: MOD-site-frame
// Guards: EVERY STEP EXPLAINS ITSELF; THE SHARED PAGES ORIGIN IS DISCLOSED; AGENT M IS MIT-LICENSED; UC-014
// Level: unit
//
// The document comes from tests/settings-pages-setup.d/dom.mjs, set up before the dynamic imports below. Each test states its input and its expected result before it runs
// (given / input / expect). The counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { installDocument } from "./settings-pages-setup.d/dom.mjs";

installDocument();
const { explain } = await import("../src/site-frame/index.mjs");
const { renderArtifact } = await import("../src/markdown-render/index.mjs");

const EXPLANATIONS = readFileSync(new URL("../src/site-frame/explanations.md", import.meta.url), "utf8");
const TOPICS = ["get-your-own-owner", "get-your-own-fork", "get-your-own-pages", "get-your-own-actions", "get-your-own-open", "get-your-own-licence"];
// The Markdown under `## <topic>`, up to the next such line; undefined where the file holds no such line.
const topicText = (topic) => EXPLANATIONS.split(/^## /m).slice(1).find((part) => part.startsWith(`${topic}\n`))?.slice(topic.length + 1);
// The folded body's rendered text, as a person reads it: runs of whitespace collapsed to one space.
const bodyText = (topic) => (explain(topic).children[1]?.textContent ?? "").replace(/\s+/g, " ");

// TST-587013 · level: unit · module: MOD-site-frame
// guards: EVERY STEP EXPLAINS ITSELF; UC-014
// given: explanations.md; known positive — the topic repository, which the file holds
// input: explain of each topic get-your-own-owner, -fork, -pages, -actions, -open and -licence
// expect: the file holds each heading exactly once, with a body; explain gives for each a <details class="explain"> without the open attribute, holding <summary>What is this?</summary> and then the
//   topic's Markdown rendered, in which no asterisk or backtick of the Markdown shows
test("explain — the topics of get-your-own are folded What is this? with their text", () => {
  assert.ok(topicText("repository")?.trim(), "known positive: explanations.md holds the topic repository");
  assert.match(renderArtifact("an *unclosed mark and `another").textContent, /[*`]/, "known positive: the renderer leaves a mark that is not closed standing");
  for (const topic of TOPICS) {
    assert.equal(EXPLANATIONS.split(/^## /m).slice(1).filter((part) => part.startsWith(`${topic}\n`)).length, 1, `the file holds the topic ${topic} exactly once`);
    const text = topicText(topic);
    assert.ok(text?.trim(), `the topic ${topic} has a body`);
    const folded = explain(topic);
    assert.equal(folded.localName, "details", "it is expandable");
    assert.equal(folded.className, "explain");
    assert.equal(folded.hasAttribute("open"), false, "it is folded");
    const [summary, body, ...more] = folded.children;
    assert.deepEqual([summary.localName, summary.textContent, more.length], ["summary", "What is this?", 0]);
    assert.equal(body.innerHTML, renderArtifact(text).innerHTML, "its body is its text, rendered");
    assert.doesNotMatch(bodyText(topic), /[*`]/, "it shows no stray Markdown");
  }
});

// TST-587014 · level: unit · module: MOD-site-frame
// guards: EVERY STEP EXPLAINS ITSELF; THE SHARED PAGES ORIGIN IS DISCLOSED; UC-014
// given: the topic get-your-own-owner; known positive — bodyText of the topic repository says "folder on GitHub"
// input: bodyText("get-your-own-owner")
// expect: it says the fork goes to a GitHub account or to an organisation; that an account or organisation used for nothing else is recommended; and the reason — every GitHub Pages site under
//   the same <owner>.github.io address can read what this browser stores for the dashboard
test("explain — get-your-own-owner says why an account used for nothing else is recommended", () => {
  assert.match(bodyText("repository"), /folder on GitHub/, "known positive: the search reads a topic the file holds");
  const text = bodyText("get-your-own-owner");
  assert.match(text, /account or an organi[sz]ation/);
  assert.match(text, /used for nothing else/);
  assert.match(text, /every GitHub Pages site/i);
  assert.match(text, /github\.io/);
  assert.match(text, /can read/);
});

// TST-587015 · level: unit · module: MOD-site-frame
// guards: EVERY STEP EXPLAINS ITSELF; AN INSTANCE IS A FORK OF AGENT M; UC-014
// given: the topics get-your-own-fork and get-your-own-pages
// input: bodyText of each
// expect: the fork topic says a fork is one's own copy of Agent M on GitHub and names the button "Create fork"; the Pages topic says GitHub's Pages publishes the repository as a website, that
//   no one but the owner can switch it on, and what to choose: "Deploy from a branch", the branch "main", the folder "/ (root)" and "Save"
test("explain — get-your-own-fork and get-your-own-pages say what a fork and Pages are, and what to choose", () => {
  const fork = bodyText("get-your-own-fork");
  assert.match(fork, /your own copy of Agent M/);
  assert.match(fork, /Create fork/);
  const pages = bodyText("get-your-own-pages");
  assert.match(pages, /website/);
  assert.match(pages, /no one but the owner/);
  for (const phrase of ["Deploy from a branch", "main", "/ (root)", "Save"]) assert.ok(pages.includes(phrase), `the Pages topic names ${phrase}`);
});

// TST-587016 · level: unit · module: MOD-site-frame
// guards: EVERY STEP EXPLAINS ITSELF; UC-014; AGENT M IS MIT-LICENSED
// given: the topics get-your-own-actions, get-your-own-open and get-your-own-licence
// input: bodyText of each
// expect: the Actions topic says GitHub disables workflows on every fork until its owner enables them; that they are needed only to fetch EU legal texts and to write an accepted change of the
//   instance's own SPEC without a token; that everything else works without them and that the dashboard shows the step again when a feature first needs them; the open topic says GitHub needs about a
//   minute after the Pages step before the address answers; the licence topic says Agent M is MIT-licensed, which allows the fork, and that the licence of every product stays the person's
test("explain — get-your-own-actions, -open and -licence say what UC-014 gives them", () => {
  const actions = bodyText("get-your-own-actions");
  assert.match(actions, /disables workflows on every fork until its owner enables them/);
  assert.match(actions, /EU legal texts/);
  assert.match(actions, /accepted change of the instance's own SPEC without a token/);
  assert.match(actions, /works without them/);
  assert.match(actions, /shows this step again/);
  assert.match(bodyText("get-your-own-open"), /about a minute/);
  const licence = bodyText("get-your-own-licence");
  assert.match(licence, /MIT licen[cs]e/);
  assert.match(licence, /allows the fork/);
  assert.match(licence, /licence of every product stays yours/);
});
