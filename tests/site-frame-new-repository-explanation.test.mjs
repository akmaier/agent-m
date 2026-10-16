// The explanation of the choices on a server's page for a new repository (ITM-575) — MOD-site-frame's explain, for UC-001 2a: "Agent M says so and links GitHub's page for a new
// repository, with a folded explanation of the choices there". The notice of a missing repository on the add-product page names the topic `new-repository` (tests/settings-pages-add-
// product-new-repository.test.mjs). What a test pins of the topic is what UC-001 2a and the sprint's reading give it — the choices of the server's page (the owner, the name, the
// visibility, the starter files; a GitLab server's project name and visibility), and a private repository where the product holds what it should not publish — and nothing the
// topic merely happens to word.
// Run: node --test tests/site-frame-new-repository-explanation.test.mjs
//
// Module: MOD-site-frame
// Guards: EVERY STEP EXPLAINS ITSELF; UC-001
// Level: unit
//
// This imports the module's existing browser harness unchanged, as tests/site-frame-mailbox-explanations.test.mjs does, then exercises the public explain interface. Each test
// states its input and its expected result before it runs (given / input / expect). The counter-proofs are recorded in the pull request.

import "./site-frame.test.mjs";
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { renderArtifact } from "../src/markdown-render/index.mjs";
import { explain } from "../src/site-frame/index.mjs";

const EXPLANATIONS = readFileSync(new URL("../src/site-frame/explanations.md", import.meta.url), "utf8");
// The Markdown under `## <topic>`, up to the next such line; undefined where the file holds no such line.
const topicText = (topic) => EXPLANATIONS.split(/^## /m).slice(1).find((part) => part.startsWith(`${topic}\n`))
  ?.slice(topic.length + 1);
// The folded body's rendered text, as a person reads it: runs of whitespace collapsed to one space.
const bodyText = (topic) => (explain(topic).children[1]?.textContent ?? "").replace(/\s+/g, " ");

// TST-575005 · level: unit · module: MOD-site-frame
// guards: EVERY STEP EXPLAINS ITSELF; UC-001 2a
// given: explanations.md; known positive — the topic repository, which the file holds
// input: explain("new-repository")
// expect: the file holds the heading `## new-repository` exactly once; explain gives a <details class="explain"> without the open attribute, holding <summary>What is this?</summary> and then the topic's Markdown rendered, in which no asterisk or backtick of the Markdown shows
test("explain — new-repository is a folded What is this? with its text", () => {
  assert.match(renderArtifact("an *unclosed mark and `another").textContent, /[*`]/, "known positive: the renderer leaves a mark that is not closed standing");
  assert.ok(topicText("repository")?.trim(), "known positive: explanations.md holds the topic repository");
  assert.equal(EXPLANATIONS.split(/^## /m).slice(1).filter((part) => part.startsWith("new-repository\n")).length, 1, "the file holds the topic new-repository exactly once");
  const text = topicText("new-repository");
  assert.ok(text?.trim(), "the topic has a body");
  const folded = explain("new-repository");
  assert.equal(folded.localName, "details", "it is expandable");
  assert.equal(folded.className, "explain", "it uses the shared explanation presentation");
  assert.equal(folded.hasAttribute("open"), false, "it is folded");
  const [summary, body, ...more] = folded.children;
  assert.deepEqual([summary.localName, summary.textContent, more.length], ["summary", "What is this?", 0]);
  assert.equal(body.innerHTML, renderArtifact(text).innerHTML, "its body is its text, rendered");
  assert.doesNotMatch(bodyText("new-repository"), /[*`]/, "it shows no stray Markdown");
});

// TST-575006 · level: unit · module: MOD-site-frame
// guards: EVERY STEP EXPLAINS ITSELF; UC-001 2a (the choices there)
// given: the topic new-repository
// input: explain("new-repository")
// expect: known positive — the topic repository says "folder on GitHub". The text of new-repository names the choices of the server's page: the owner of the repository, the name it is given, its visibility as Public and Private, the starter files README and .gitignore and a licence, and a GitLab server's page for a new project
test("explain — new-repository: the choices on the server's page for a new repository (UC-001 2a)", () => {
  assert.match(bodyText("repository"), /folder on GitHub/, "known positive: the search reads a topic the file holds");
  const text = bodyText("new-repository");
  assert.match(text, /owner/i, "it says who owns the repository");
  assert.match(text, /name/i, "it says the repository is given a name");
  assert.match(text, /visibility/i, "it names the visibility");
  assert.match(text, /Public/, "it names a public repository");
  assert.match(text, /Private/, "it names a private repository");
  assert.match(text, /README/, "it names the README among the starter files");
  assert.match(text, /\.gitignore/, "it names the .gitignore among the starter files");
  assert.match(text, /licen[cs]e/i, "it names the licence among the starter files");
  assert.match(text, /GitLab/, "it covers a GitLab server's page for a new project");
});

// TST-575007 · level: unit · module: MOD-site-frame
// guards: EVERY STEP EXPLAINS ITSELF; UC-001 2a (the sprint's reading: a private repository where the product holds what it should not publish)
// given: the topic new-repository
// input: explain("new-repository")
// expect: known positive — the topic review-layout-commit says "only whatever of this is missing". The text of new-repository names a private repository as the place for a product that holds what it should not publish, and says that what a public repository holds is published
test("explain — new-repository: a private repository is named for what the product should not publish", () => {
  assert.match(bodyText("review-layout-commit"), /only whatever of this is missing/, "known positive: the search reads a topic the file holds");
  const text = bodyText("new-repository");
  assert.match(text, /private repository/, "it names a private repository");
  assert.match(text, /should not publish/, "it names what a product should not publish as the reason");
  assert.match(text, /public repository[^.]*(published|readable|anyone)/i, "it says what a public repository means");
});
