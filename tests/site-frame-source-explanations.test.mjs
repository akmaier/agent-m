// The explanations of registering a source (ITM-345) — MOD-site-frame's explain, for the steps of UC-004 that ask something of the
// person: the four kinds of source with an example each; name, authority and licence with examples; where a standard's designation
// stands on its cover page and why the amendment matters; a file that is only hashed; what becomes public. The library page (ITM-350)
// shows them folded.
// Run: node --test tests/site-frame-source-explanations.test.mjs
//
// Module: MOD-site-frame
// Guards: EVERY STEP EXPLAINS ITSELF; A STANDARD IS REGISTERED BY ITS DESIGNATION; UC-004
// Level: unit
//
// This imports the module's existing browser harness unchanged, as tests/site-frame-participant-explanations.test.mjs does, then exercises
// the public explain interface; the topics are this file's only subject. The seven topics are the item's Outcome: the kind field is
// explained by `source-kinds` itself, which names the four kinds, so there is no topic of its own for it. What a test pins of a topic is
// what UC-004 (and UC-005 7a for the authority) says of the step — each claim a sentence of the topic makes — and nothing a topic merely
// happens to word. No topic points to the book: none was found that treats a source library. Each test states its input and its expected
// result before it runs (given / input / expect). The counter-proofs are recorded in the pull request.

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

const TOPICS = ["source-kinds", "source-name", "source-authority", "source-licence", "standard-designation", "file-only-hashed", "source-public"];

// The claims a topic's rendered text must make: each a pattern and what it says.
function assertClaims(topic, claims) {
  assert.ok(topicText(topic)?.trim(), `known positive: explanations.md holds the topic ${topic}`);
  const text = bodyText(topic);
  for (const [pattern, says] of claims) assert.match(text, pattern, `${topic}: it says ${says}`);
}

// TST-472856 · level: unit · module: MOD-site-frame
// guards: EVERY STEP EXPLAINS ITSELF; UC-004
// given: explanations.md, and the seven topics of registering a source
// input: explain(topic) for each
// expect: each is the folded What is this? — a <details class="explain"> without the open attribute, holding <summary>What is this?</summary> and then the topic's Markdown rendered, in which no asterisk or backtick of the source is left standing
test("explain — each topic of registering a source is a folded What is this? with its text", () => {
  assert.match(renderArtifact("an *unclosed mark and `another").textContent, /[*`]/,
    "known positive: the renderer leaves a mark that is not closed standing");
  for (const topic of TOPICS) {
    const text = topicText(topic);
    assert.ok(text?.trim(), `known positive: explanations.md holds the topic ${topic}`);
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

// TST-472857 · level: unit · module: MOD-site-frame
// guards: UC-004 (step 2)
// given: the topic source-kinds
// input: explain("source-kinds")
// expect: text naming the four kinds of source — an EU legal text, a standard, documents, a repository — each with an example and how it is entered
test("explain — source-kinds: the four kinds of source, with an example each (UC-004)", () => {
  assertClaims("source-kinds", [
    [/library keeps four kinds/, "the library keeps four kinds of source"],
    [/EU legal text is a law or regulation of the\s+European Union, for example the AI Act/, "an EU legal text, with the AI Act as example"],
    [/paste its EUR-Lex or ELI address/, "entered by pasting its EUR-Lex or ELI address"],
    [/standard is a norm published by a standards body, for example IEC 62304/, "a standard, with IEC 62304 as example"],
    [/enter its full designation/, "entered by its full designation"],
    [/Documents are\s+files you have, PDF, Word or Markdown files or a zip file/, "documents are PDF, Word or Markdown files or a zip file"],
    [/repository is a repository on GitHub or GitLab, public or private/, "a repository on GitHub or GitLab, public or private"],
    [/Choose the kind that matches what you have/, "choose the kind that matches what you have"],
  ]);
});

// TST-472858 · level: unit · module: MOD-site-frame
// guards: UC-004 (steps 3 and 1a)
// given: the topic source-name
// input: explain("source-name")
// expect: text saying the name is how the library and the linking products call the source, with examples, and that an existing source gets a new version, not a second registration
test("explain — source-name: the name of a source (UC-004)", () => {
  assertClaims("source-name", [
    [/how the library and the products that link the source call it/, "the name is how the library and the products call it"],
    [/AI Act or IEC 62304/, "examples of names"],
    [/shown wherever the source is linked/, "it is shown wherever the source is linked"],
    [/already in the library, do not\s+register it again/, "an existing source is not registered again"],
    [/add a new version of the existing one/, "a new version of the existing one is added"],
  ]);
});

// TST-472859 · level: unit · module: MOD-site-frame
// guards: UC-004 (step 3); UC-005 (7a)
// given: the topic source-authority
// input: explain("source-authority")
// expect: text naming the three authorities with an example each, and saying a normative source does not win automatically: a person decides, since the product may be out of its scope
test("explain — source-authority: the authority of a source (UC-004)", () => {
  assertClaims("source-authority", [
    [/Authority says how much the source binds/, "authority says how much the source binds"],
    [/Normative means its rules must be followed, for example a law or a standard/, "normative: must be followed, e.g. a law or standard"],
    [/Advisory means they are recommended, for example a guideline/, "advisory: recommended, e.g. a guideline"],
    [/Informational means they are background[^.]*for example a handbook/, "informational: background, e.g. a handbook"],
    [/normative source does not win automatically/, "a normative source does not win automatically"],
    [/a person still decides/, "a person still decides"],
    [/product may be out of that source's scope/, "because the product may be out of the source's scope"],
  ]);
});

// TST-472860 · level: unit · module: MOD-site-frame
// guards: UC-004 (steps 3 and 4b)
// given: the topic source-licence
// input: explain("source-licence")
// expect: text naming the two licences with an example each: republishable content stored in the public instance, restricted content in a repository the person names, never in the public instance; and that an unknown licence is treated as restricted
test("explain — source-licence: the licence of a source (UC-004)", () => {
  assertClaims("source-licence", [
    [/licence says whether the source's content may be republished/, "the licence says whether the content may be republished"],
    [/May be republished is for texts such as EU law or openly\s+licensed guides/, "may be republished: EU law, openly licensed guides"],
    [/stored in the public instance beside the register entry/, "their content is stored in the public instance beside the register entry"],
    [/Restricted is for content such as a\s+bought norm or internal documents/, "restricted: a bought norm, internal documents"],
    [/kept in a repository you name, never in the public instance/, "kept in a repository the person names, never in the public instance"],
    [/do not know the\s+licence, the source is treated as restricted until someone records it/, "an unknown licence is treated as restricted until recorded"],
  ]);
});

// TST-472861 · level: unit · module: MOD-site-frame
// guards: A STANDARD IS REGISTERED BY ITS DESIGNATION; UC-004 (step 4)
// given: the topic standard-designation
// input: explain("standard-designation")
// expect: text saying a standard is registered by its full designation with edition and amendments, with the example; where it stands on the cover page; why the amendment matters; and that the licence is preset to restricted
test("explain — standard-designation: where a standard's designation stands and why the amendment matters (UC-004)", () => {
  assertClaims("standard-designation", [
    [/registered by its full designation, and that includes the edition and its amendments/, "a standard is registered by its full designation, edition and amendments"],
    [/IEC 62304:2006\+AMD1:2015/, "the example IEC 62304:2006+AMD1:2015"],
    [/find it on the norm's cover page, next to the title/, "it stands on the cover page, next to the title"],
    [/year of the edition after the\s+colon/, "the year of the edition after the colon"],
    [/amendments added with a plus sign/, "amendments added with a plus sign"],
    [/amendment changes the text of the norm/, "an amendment changes the text of the norm"],
    [/requirement taken from the edition alone may differ/, "a requirement taken from the edition alone may differ"],
    [/says exactly\s+which version was used/, "the full designation says which version was used"],
    [/licence of a standard is preset to restricted/, "the licence of a standard is preset to restricted"],
  ]);
});

// TST-472862 · level: unit · module: MOD-site-frame
// guards: UC-004 (alternative 4a)
// given: the topic file-only-hashed
// input: explain("file-only-hashed")
// expect: text saying a file that is only hashed is selected but not sent: the browser computes its SHA-256 without sending the file anywhere; only the designation and the hash are recorded, with a note where the copy is kept, so the text is not stored; and anyone with the same copy can check the hash
test("explain — file-only-hashed: a file that is only hashed (UC-004 4a)", () => {
  assertClaims("file-only-hashed", [
    [/printed or local copy of a norm and do not want to upload it/, "for a printed or local copy that the person does not want to upload"],
    [/browser computes the\s+file's SHA-256/, "the browser computes the file's SHA-256"],
    [/fingerprint of its exact content/, "a SHA-256 is a fingerprint of the exact content"],
    [/without sending the file anywhere/, "without sending the file anywhere"],
    [/Only the designation and that hash are\s+recorded/, "only the designation and the hash are recorded"],
    [/note where your copy is kept/, "with a note where the copy is kept"],
    [/text itself is not stored/, "so the text itself is not stored"],
    [/Anyone holding the same copy can compute the\s+hash/, "anyone holding the same copy can compute the hash"],
  ]);
});

// TST-472863 · level: unit · module: MOD-site-frame
// guards: UC-004 (step 5)
// given: the topic source-public
// input: explain("source-public")
// expect: text saying Agent M states before saving what becomes public: the register entry always, with its fields; the content only if the licence says it may be republished; restricted content going to the named repository, public only as far as that is
test("explain — source-public: what becomes public (UC-004)", () => {
  assertClaims("source-public", [
    [/Before you save, Agent M states what becomes public/, "before saving, Agent M states what becomes public"],
    [/instance is a public fork/, "because the instance is a public fork"],
    [/register entry always becomes\s+public/, "the register entry always becomes public"],
    [/name, kind, authority, licence, versions, identifiers and hashes/, "what the entry holds"],
    [/content becomes public only if its licence\s+says it may be republished/, "the content is public only if its licence says it may be republished"],
    [/restricted content goes to the repository you name/, "restricted content goes to the repository the person names"],
    [/public only as far as that repository\s+is/, "and is public only as far as that repository is"],
  ]);
});

// TST-472864 · level: unit · module: MOD-site-frame
// guards: EVERY STEP EXPLAINS ITSELF
// given: the seven topics
// input: the rendered text of each
// expect: none points to a chapter of the book
test("explain — the topics of registering a source point to no chapter of the book", () => {
  for (const topic of TOPICS) {
    assert.ok(topicText(topic)?.trim(), `known positive: explanations.md holds the topic ${topic}`);
    assert.doesNotMatch(bodyText(topic), /Vibe Coding/, `${topic}: it points to no chapter`);
  }
});
