// The explanations of deriving the architecture (ITM-439) — MOD-site-frame's explain, for the steps of UC-022 that ask something of the
// person: what an architecture is — the system, its subsystems and modules, the four views, the pattern families and the design
// principles —, with the table of UC-022 and a pointer to book ch. 10; the reviewing participant and its rounds; the due diligence;
// what a licence permits. The architecture's pages (ITM-442, ITM-443) show them folded.
// Run: node --test tests/site-frame-architecture-explanations.test.mjs
//
// Module: MOD-site-frame
// Guards: EVERY STEP EXPLAINS ITSELF; UC-022
// Level: unit
//
// This imports the module's existing browser harness unchanged, as tests/site-frame-mailbox-explanations.test.mjs does, then exercises the
// public explain interface; the topics are this file's only subject. The four topics are the item's Outcome, each under a slug of its own
// that the pages will name. What a test pins of a topic is what UC-022 says of the step — each claim a sentence of the topic makes — and,
// for the licence, the general facts of the licences the topic names (read from choosealicense.com, named in the pull request); the
// pointers are those of the book: chapter 10 for the architecture (its definition, views, principles and pattern families), chapter 6,
// section 5 for the due diligence of a reuse, which UC-022 itself cites. Each test states its input and its expected result before it runs
// (given / input / expect). The counter-proofs are recorded in the pull request.

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

const TOPICS = ["what-is-an-architecture", "architecture-reviewer", "due-diligence", "licence-permits"];

// The claims a topic's rendered text must make: each a pattern and what it says.
function assertClaims(topic, claims) {
  assert.ok(topicText(topic)?.trim(), `known positive: explanations.md holds the topic ${topic}`);
  const text = bodyText(topic);
  for (const [pattern, says] of claims) assert.match(text, pattern, `${topic}: it says ${says}`);
}

// guards: EVERY STEP EXPLAINS ITSELF; UC-022
// given: explanations.md, and the four topics of deriving the architecture
// input: explain(topic) for each
// expect: each is the folded What is this? — a <details class="explain"> without the open attribute, holding <summary>What is
//         this?</summary> and then the topic's Markdown rendered, in which no asterisk or backtick of the source is left standing
test("explain — each topic of deriving the architecture is a folded What is this? with its text", () => {
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

// guards: EVERY STEP EXPLAINS ITSELF; UC-022 (step 1, the table)
// given: the topic what-is-an-architecture
// input: explain("what-is-an-architecture")
// expect: text giving the definition, that the first architecture is derived in one piece, the system, subsystems and modules, the four kinds of file of the table, the four views with the scenarios, the three families of patterns, the eight design principles, and the pointer to chapter 10 of the book
test("explain — what-is-an-architecture: what an architecture is (UC-022 1)", () => {
  assertClaims("what-is-an-architecture", [
    [/fundamental organization of a system/, "the definition: the fundamental organization of a system"],
    [/components, their relationships to each other and to the\s+environment, and the principles guiding its design and evolution/, "its components, their relationships and the principles"],
    [/derives it from all the requirements and use cases at\s+once/, "it is derived from all requirements and use cases at once"],
    [/first architecture is drafted in one piece, with no selection/, "the first architecture is drafted in one piece, with no selection"],
    [/down to its modules and\s+their interfaces/, "it describes the system down to its modules and their interfaces"],
    [/leaves to the implementation what only an implementation can answer/, "what only an implementation can answer is left to the implementation"],
    [/system is decomposed into\s+subsystems, each with one responsibility, and each subsystem into modules/, "the system is decomposed into subsystems and modules"],
    [/decision that states the system, with its patterns, subsystems, views and one scenario for every use case/, "the file that states the system, with patterns, subsystems, views and a scenario for every use case"],
    [/one decision for\s+each subsystem/, "one decision for each subsystem"],
    [/further decisions, one for each significant choice such as a format or a library/, "further decisions for significant choices"],
    [/one file for each module/, "one file for each module"],
    [/described in four views/, "it is described in four views"],
    [/logical view of the subsystems and their abstractions/, "the logical view"],
    [/process view of how they\s+interact at runtime/, "the process view"],
    [/development view of the modules and their folders/, "the development view"],
    [/physical view of where each part runs/, "the physical view"],
    [/tied together by the scenarios/, "tied together by the scenarios"],
    [/three families: structuring patterns, adaptable-system patterns and\s+distributed-system patterns/, "the three families of patterns"],
    [/divide and conquer, design to test, KISS, YAGNI, DRY, the principle\s+of least astonishment, the open-closed principle, and developing against interfaces/, "the eight design principles"],
    [/In the book Vibe Coding: chapter 10\./, "it points to chapter 10 of the book"],
  ]);
});

// guards: A DRAFT THAT FAILS A CHECK GOES BACK TO ITS PARTICIPANT; A REVIEW FINDING IS WEIGHED BEFORE IT IS ACTED ON; THE CORRECTION LOOP HAS A FIXED LIMIT; UC-022 (step 6)
// given: the topic architecture-reviewer
// input: explain("architecture-reviewer")
// expect: text saying a second participant of another model checks the whole draft against the whole SPEC, level by level, not the modules against the use cases; findings are warnings with file, line and requirement; the deriving participant weighs each; rounds end on no finding, the limit or an unchanged round; what is shown to the person; no test or CI checks the draft
test("explain — architecture-reviewer: the reviewing participant and its rounds (UC-022 6)", () => {
  assertClaims("architecture-reviewer", [
    [/second participant, the reviewing participant, checks it as a whole against the whole SPEC/, "a reviewing participant checks the draft as a whole against the whole SPEC"],
    [/Before you see the draft/, "before the person sees the draft"],
    [/participant other than the deriving one and uses another model/, "another participant than the deriving one, using another model"],
    [/every use case against the system/, "every use case against the system"],
    [/every subsystem against the system/, "every subsystem against the system"],
    [/every module against its subsystem/, "every module against its subsystem"],
    [/does not check the modules against the use cases/, "it does not check the modules against the use cases"],
    [/names the file and line, the requirement it concerns and what does not fit/, "a finding names file, line, requirement and what does not fit"],
    [/counts as a warning/, "a finding counts as a warning"],
    [/A reviewer can be wrong/, "a reviewer can be wrong"],
    [/corrects what holds and answers what does not hold with the reason/, "the deriving participant corrects what holds and answers what does not"],
    [/each repetition is a round/, "each repetition is a round"],
    [/until no finding is left, until the round limit is\s+reached, or until a round leaves the findings unchanged/, "rounds end when no finding is left, at the limit, or when a round changes nothing"],
    [/each finding beside\s+the correction or the answer it got/, "each finding is shown beside its correction or answer"],
    [/only you can decide is shown to you and not sent back/, "a finding only the person can decide is shown and not sent back"],
    [/No test and no CI\s+run checks the draft/, "no test and no CI run checks the draft"],
  ]);
});

// guards: A REUSE DECISION RECORDS ITS DUE DILIGENCE; UC-022 (steps 7, 7a, 7b, 7d)
// given: the topic due-diligence
// input: explain("due-diligence")
// expect: text saying which facts are read from the registry and the source repository, that each is stored with address and date, what happens to a candidate not found and to an unreadable registry, that the product's own licence stands beside, and the pointer to chapter 6, section 5
test("explain — due-diligence: the due diligence (UC-022 7)", () => {
  assertClaims("due-diligence", [
    [/looks up the facts about every reuse candidate and every\s+alternative in the package registry and the source repository/, "the facts about every candidate and alternative are read from the registry and the source repository"],
    [/whether the package exists|reads whether the package exists/, "whether the package exists"],
    [/its licence/, "its licence"],
    [/dates of its\s+releases/, "the dates of its releases"],
    [/open and closed issues/, "open and closed issues"],
    [/adoption, which is the number of dependents or downloads/, "its adoption, dependents or downloads"],
    [/stored with the\s+address it was read from and the date/, "each fact is stored with its address and the date"],
    [/not found in its registry is not proposed: the\s+name may be invented/, "a candidate not found is not proposed: the name may be invented"],
    [/cannot be read from the browser, a participant that can reach the web fetches the facts/, "an unreadable registry: a participant that can reach the web fetches the facts"],
    [/cannot be written/, "until then the decision cannot be written"],
    [/your\s+product's own/, "the product's own licence stands beside"],
    [/should make you hesitate even if it is widely used/, "unmaintained packages should make one hesitate"],
    [/In the book Vibe Coding: chapter 6, section 5, on reuse\./, "it points to chapter 6, section 5"],
  ]);
});

// guards: EVERY STEP EXPLAINS ITSELF; UC-022 (steps 7c, 7d)
// given: the topic licence-permits
// input: explain("licence-permits")
// expect: text saying what a licence is and that without one there is no permission, what permissive and copyleft licences permit and ask, that a licence can restrict the product's own distribution, how Agent M marks candidates, and what happens without a LICENSE file
test("explain — licence-permits: what a licence permits (UC-022 7c)", () => {
  assertClaims("licence-permits", [
    [/licence is the permission under which you may use someone else's software/, "a licence is the permission under which software may be used"],
    [/what you may do with it and what you\s+must do in return/, "it says what you may do and what you must do in return"],
    [/Without a licence you have no permission/, "without a licence there is no permission"],
    [/exclusive copyright by default/, "code is under exclusive copyright by default"],
    [/see\s+or fork it on a code host does not allow you to use it/, "seeing or forking it does not allow use"],
    [/permissive licence such as MIT or Apache-2\.0 lets you use, change and\s+distribute the software, even commercially/, "a permissive licence lets you use, change and distribute, even commercially"],
    [/keep the copyright and licence notices/, "and mainly asks to keep the notices"],
    [/copyleft licence such\s+as the GPL/, "a copyleft licence such as the GPL"],
    [/make the source code available, under the same licence, for larger works that use\s+it/, "and asks for source under the same licence for larger works that use it"],
    [/restrict how your own product may be distributed/, "so a licence can restrict how the product may be distributed"],
    [/marks a candidate whose licence is not known to be compatible/, "a candidate whose licence is not known to be compatible is marked"],
    [/missing,\s+unknown or restrictive, the table says so in its row and you decide/, "missing, unknown or restrictive licence: the table says so and the person decides"],
    [/Without a `?LICENSE`? file[^.]*not checked/, "without a LICENSE file every candidate is marked not checked"],
    [/product's own licence decides which libraries it may reuse/, "the product's own licence decides which libraries it may reuse"],
  ]);
});

// guards: EVERY STEP EXPLAINS ITSELF
// given: the four topics, and the book Vibe Coding, whose chapter 10 treats architecture — its definition after IEEE 1471, the views, the
//        principles and the pattern families — and whose chapter 6, section 5 (Reuse-Oriented Process Design) treats due diligence
// input: the rendered text of each topic
// expect: what-is-an-architecture points to chapter 10; due-diligence to chapter 6, section 5; architecture-reviewer and licence-permits
//         to no chapter
test("explain — the topics of deriving the architecture point to the book where it treats them", () => {
  assert.match(bodyText("what-is-an-architecture"), /In the book Vibe Coding: chapter 10\./);
  assert.match(bodyText("due-diligence"), /In the book Vibe Coding: chapter 6, section 5, on reuse\./);
  for (const topic of ["architecture-reviewer", "licence-permits"]) {
    assert.ok(topicText(topic)?.trim(), `known positive: explanations.md holds the topic ${topic}`);
    assert.doesNotMatch(bodyText(topic), /Vibe Coding/, `${topic}: it points to no chapter`);
  }
});
