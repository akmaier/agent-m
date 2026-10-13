// The explanations of reviewing, accepting and editing (ITM-347) — MOD-site-frame's explain, for the steps of the review pages
// that ask something of the person: what accepting does and what an approval record is; what a blob SHA is; why an edit after
// acceptance reopens the review; why a SPEC edit waits for approval while a use-case edit is saved at once; what a change queue is,
// and its order; GitHub's page without a token (UC-006 steps 2 and 4, 4b to 4d; UC-008 steps 1 to 3, 2a, 3b to 3e; UC-018). The
// review pages (ITM-355, ITM-357, ITM-358, ITM-359) show them folded.
// Run: node --test tests/site-frame-review-explanations.test.mjs
//
// Module: MOD-site-frame
// Guards: UC-006; UC-008; UC-018; EVERY STEP EXPLAINS ITSELF
// Level: unit
//
// This imports the module's existing browser harness unchanged, as tests/site-frame-endpoint-explanations.test.mjs does, then
// exercises the public explain interface; the topics are this file's only subject. The topics are the six the item's Outcome
// names, each under a slug of its own, which the review pages will name once built; explain and the way it renders a topic are
// MOD-site-frame's and are not changed. What a test pins of a topic is what the use cases and the SPEC say of the step — each claim
// a sentence of the topic makes, read from UC-006, UC-008, UC-018 and the requirements they realise (ACCEPTANCE IS A COMMIT BY THE
// ACCEPTING PERSON, AN APPROVAL NAMES THE EXACT TEXT, STATUS IS DERIVED FROM THE RECORDS, A SAVE IS REFUSED WHEN THE TEXT CHANGED
// MEANWHILE, A SPEC EDIT IS SAVED AS A PROPOSAL, A QUEUE IS ACCEPTED IN ITS ORDER, A PERSON'S EDITS COLLECT IN ONE OPEN QUEUE,
// WITHOUT A TOKEN, GITHUB'S WEB INTERFACE IS THE FALLBACK, NO TEXT TRAVELS IN A URL, SEVERAL FILES ARE ACCEPTED IN ONE CLICK, A
// CHANGED FILE IS SHOWN AGAINST ITS LAST ACCEPTED TEXT) — and nothing a topic merely happens to word. Each test states its input and
// its expected result before it runs (given / input / expect); where a test asserts that something is absent, the same check is
// first shown to find it on a known positive. The counter-proofs are recorded in the pull request.

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
// The folded body's rendered text, as a person reads it: runs of whitespace collapsed to one space, since textContent keeps the
// file's own line breaks, which a browser's rendering of a paragraph does not show.
const bodyText = (topic) => (explain(topic).children[1]?.textContent ?? "").replace(/\s+/g, " ");

const TOPICS = [
  "accepting",
  "blob-sha",
  "edit-after-acceptance",
  "spec-edit-waits-for-approval",
  "change-queue",
  "github-page-without-token",
];

// The claims a topic's rendered text must make: each a pattern and what it says.
function assertClaims(topic, claims) {
  assert.ok(topicText(topic)?.trim(), `known positive: explanations.md holds the topic ${topic}`);
  const text = bodyText(topic);
  for (const [pattern, says] of claims) assert.match(text, pattern, `${topic}: it says ${says}`);
}

// TST-472838 · level: unit · module: MOD-site-frame
// guards: EVERY STEP EXPLAINS ITSELF; UC-006; UC-008; UC-018
// given: explanations.md, and the six topics of reviewing, accepting and editing
// input: explain(topic) for each
// expect: each is the folded What is this? — a <details class="explain"> without the open attribute, holding <summary>What is this?</summary> and then the topic's Markdown rendered, the HTML MOD-markdown-render's renderArtifact gives for it, in which no asterisk or backtick of the Markdown source is left standing
test("explain — each topic of reviewing, accepting and editing is a folded What is this? with its text", () => {
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

// TST-472839 · level: unit · module: MOD-site-frame
// guards: ACCEPTANCE IS A COMMIT BY THE ACCEPTING PERSON; AN APPROVAL NAMES THE EXACT TEXT; SEVERAL FILES ARE ACCEPTED IN ONE CLICK; UC-008 (steps 3 to 5, 3d, 3e); UC-006 (steps 4 and 6)
// given: the topic accepting
// input: explain("accepting")
// expect: text saying accepting is a commit — one saved change to the repository — under the accepting person's own account, which Git records with who and when; that it adds an approval record, a file under docs/approvals/ that names the blob SHA of exactly the text shown; that several files accepted at once get one record each, a file that changed after it was shown left out and named; and that for a SPEC change the same commit replaces the section byte for byte and adds the decision
test("explain — accepting: what accepting does and what an approval record is (UC-006, UC-008)", () => {
  assertClaims("accepting", [
    [/Accepting is a commit made under your own account/, "accepting is a commit made under the accepting person's own account"],
    [/a commit is one saved change to the repository/, "what a commit is"],
    [/who accepted and when/, "Git records who accepted and when"],
    [/approval record/, "what it adds is an approval record"],
    [/docs\/approvals\//, "where the record stands"],
    [/blob SHA/, "the record names the text by its blob SHA"],
    [/exactly the text you were shown/, "it names exactly the text shown"],
    [/one approval record per file/, "several files accepted at once get a record each"],
    [/left out and named/, "a file that changed after it was shown is left out and named"],
    [/byte for byte/, "a SPEC section is replaced byte for byte"],
    [/adds the decision/, "the decision is added"],
  ]);
});

// TST-472840 · level: unit · module: MOD-site-frame
// guards: AN APPROVAL NAMES THE EXACT TEXT; A SAVE IS REFUSED WHEN THE TEXT CHANGED MEANWHILE; UC-008 (step 4); UC-018 (steps 2 and 5)
// given: the topic blob-sha
// input: explain("blob-sha")
// expect: text saying what a blob SHA is — the number Git computes from the content of a file, the same for the same text and another after any change —, that an approval record names the text by it, and that the editor notes the SHA of the text it opened, so that Save writes nothing when the file on the branch has another
test("explain — blob-sha: what a blob SHA is (UC-008, UC-018)", () => {
  assertClaims("blob-sha", [
    [/A blob SHA is the number Git computes from the content of a file/, "what a blob SHA is"],
    [/same text always gives the same SHA/, "the same text gives the same SHA"],
    [/any change to the text[^.]*gives another/, "any change gives another"],
    [/names the file and the blob SHA of the text you saw/, "an approval record names the file and the blob SHA of the text seen"],
    [/about that text and no other/, "so the record is about that text and no other"],
    [/editor notes the SHA of the text it opened/, "the editor notes the SHA it opened"],
    [/compares it with the file on the branch/, "Save compares it with the file on the branch"],
    [/nothing is written/, "a save writes nothing when the SHA on the branch is another"],
  ]);
});

// TST-472841 · level: unit · module: MOD-site-frame
// guards: STATUS IS DERIVED FROM THE RECORDS; A CHANGED FILE IS SHOWN AGAINST ITS LAST ACCEPTED TEXT; UC-008 (steps 2a and 5a); UC-018 (step 6)
// given: the topic edit-after-acceptance
// input: explain("edit-after-acceptance")
// expect: text saying an edit gives the file another blob SHA, that no approval record names it, so that the file shows as changed since acceptance without anyone resetting a status — whether a file counts as accepted is worked out from the records, and a record vouches for the text it names only —, and that the difference to the text the most recent record names is shown above the text, to be accepted again
test("explain — edit-after-acceptance: why an edit after acceptance reopens the review (UC-008, UC-018)", () => {
  assertClaims("edit-after-acceptance", [
    [/approval record names the accepted text by its blob SHA/, "an approval record names the accepted text by its blob SHA"],
    [/edited afterwards, by you in the editor or by anyone else/, "an edit by anyone counts"],
    [/another blob SHA/, "an edit gives the file another blob SHA"],
    [/no approval record names it/, "no record names the new text"],
    [/changed since acceptance/, "the file shows as changed since acceptance"],
    [/nobody has to reset a status/, "nobody resets a status"],
    [/counts as accepted is worked out every time from the records/, "whether a file counts as accepted is derived from the records"],
    [/a record can only vouch for the text it names/, "a record vouches for the text it names only"],
    [/difference to the text the most recent record/, "the difference to the last accepted text is shown"],
    [/accept the new text/, "the new text is accepted as before"],
  ]);
});

// TST-472842 · level: unit · module: MOD-site-frame
// guards: A SPEC EDIT IS SAVED AS A PROPOSAL; A SPECIFICATION CHANGE IS APPROVED BEFORE IT IS WRITTEN; STATUS IS DERIVED FROM THE RECORDS; UC-018 (goal and step 6); UC-006 (steps 2 and 6)
// given: the topic spec-edit-waits-for-approval
// input: explain("spec-edit-waits-for-approval")
// expect: text saying the SPEC is what the rest is checked against, so a change to it is a decision: a saved requirement becomes a proposal in a change queue under docs/spec-freigaben/, the dashboard never writes it straight into SPEC.md, and it is written only after a reviewer has accepted it seen beside the current text; and that a use case, a draft to be read and corrected, is saved at once and is open until an approval record names the saved text, so that nothing relies on it before
test("explain — spec-edit-waits-for-approval: why a SPEC edit waits and a use-case edit is saved at once (UC-018)", () => {
  assertClaims("spec-edit-waits-for-approval", [
    [/checked against/, "the rest of the product is checked against the SPEC"],
    [/a change to it is a decision/, "so a change to it is a decision"],
    [/never writes it straight into SPEC\.md/, "the dashboard never writes an edit straight into the SPEC"],
    [/proposal/, "a saved requirement is a proposal"],
    [/docs\/spec-freigaben\//, "where the proposal is written"],
    [/beside the current text/, "the reviewer sees it beside the current text"],
    [/only then is it written/, "it is written into the SPEC only after it is accepted"],
    [/use case[^.]*saved at once/, "a use case is saved at once"],
    [/draft to be read and corrected/, "because a use case is a draft to be read and corrected"],
    [/open[^.]*until an approval record names/, "it is open until a record names the saved text"],
    [/nothing relies on it/, "so nothing relies on it before it is accepted"],
  ]);
});

// TST-472843 · level: unit · module: MOD-site-frame
// guards: A QUEUE IS ACCEPTED IN ITS ORDER; A PERSON'S EDITS COLLECT IN ONE OPEN QUEUE; A SPEC EDIT IS SAVED AS A PROPOSAL; UC-006 (steps 6 and 4d); UC-018 (step 6)
// given: the topic change-queue
// input: explain("change-queue")
// expect: text saying a change queue is a folder under docs/spec-freigaben/ with entries, an index.md and entscheidungen.md; that an entry is open until accepted; that a person's edits collect in the newest queue of the day without an accepted entry; and that entries accepted together are written in the order of the queue's index, in one commit, one whose heading another entry creates only together with or after that entry
test("explain — change-queue: what a change queue is, and its order (UC-006, UC-018)", () => {
  assertClaims("change-queue", [
    [/folder under docs\/spec-freigaben\//, "a queue is a folder under docs/spec-freigaben/"],
    [/proposed changes to the SPEC/, "it holds proposed changes to the SPEC"],
    [/one SPEC section as it is proposed/, "an entry is one SPEC section as it is proposed"],
    [/index\.md lists the entries in order/, "its index lists the entries in order"],
    [/entscheidungen\.md records each decision as it is taken/, "its decisions file records each decision as it is taken"],
    [/open until/, "an entry is open until accepted"],
    [/newest queue of the day/, "a person's edits collect in the newest queue of the day"],
    [/order of the queue's index/, "entries accepted together are written in the order of the index"],
    [/one commit/, "in one commit"],
    [/together with or after/, "an entry that needs another is offered only together with or after it"],
    [/names the entry it waits for/, "the dashboard names the entry it waits for"],
  ]);
});

// TST-472844 · level: unit · module: MOD-site-frame
// guards: WITHOUT A TOKEN, GITHUB'S WEB INTERFACE IS THE FALLBACK; NO TEXT TRAVELS IN A URL; A GITLAB PRODUCT IS WRITTEN WITH A TOKEN; UC-008 (steps 3b, 3c, 4a); UC-006 (step 4b); UC-018 (step 4a)
// given: the topic github-page-without-token
// input: explain("github-page-without-token")
// expect: text saying that a token is a key created on GitHub and stored in this browser, with which the dashboard makes the commit; that without a token it opens GitHub's own page — the page for a new file with the record filled in to accept, GitHub's editor with the text on the clipboard to edit —, and that the link never carries the reviewed text; that Commit changes there makes the commit; that without write access GitHub makes a pull request, a proposal for the maintainers to review, which counts once a maintainer merges it; that a record that did not arrive is shown with a copy button; and that GitLab has no such page and needs the project's own token
test("explain — github-page-without-token: what GitHub's page is when no token is stored (UC-006, UC-008, UC-018)", () => {
  assertClaims("github-page-without-token", [
    [/With a token[^.]*the dashboard makes the commit for you/, "with a token the dashboard makes the commit"],
    [/a key you create on GitHub and store in this browser/, "what a token is"],
    [/Without a token it cannot/, "without a token it cannot"],
    [/as far as GitHub allows/, "GitHub's page is prepared as far as GitHub allows"],
    [/page for a new file/, "to accept, GitHub's page for a new file"],
    [/record filled in/, "with the record filled in"],
    [/editor, with your edited text on the clipboard/, "to edit, GitHub's editor with the text on the clipboard"],
    [/never the text you reviewed/, "the link never carries the reviewed text"],
    [/Commit changes/, "the commit is made there"],
    [/reload the dashboard/, "then the dashboard is reloaded"],
    [/Without write access to the repository, GitHub makes your commit a pull request/,
      "without write access it becomes a pull request"],
    [/a proposal for the maintainers to review/, "what a pull request is"],
    [/a maintainer merges it/, "it counts once a maintainer merges it"],
    [/copy button/, "a record that did not arrive is shown with a copy button"],
    [/exact path/, "and the exact path of the file"],
    [/GitLab/, "GitLab has no such page"],
    [/project's own token/, "and needs the project's own token"],
  ]);
});

// TST-472845 · level: unit · module: MOD-site-frame
// guards: EVERY STEP EXPLAINS ITSELF
// given: the topics of reviewing, accepting and editing, and the book Vibe Coding, whose chapter 8 treats how requirements change and whose chapter 12 treats version control and the pull request as a review gate
// input: the rendered text of each topic
// expect: the topics about accepting, about an edit after acceptance, and about GitHub's page, which are about Git and review, point to chapter 12, section 10, of the book, on version control and the pull request as a review gate; the topics about a SPEC edit and about the change queue, which are about how a requirement changes, to chapter 8, section 6, on how requirements evolve; the topic about a blob SHA, on which the book has no passage, needs none
test("explain — the topics of reviewing, accepting and editing point to the book where it treats them", () => {
  const POINTERS = [
    ["accepting", /In the book Vibe Coding: chapter 12, section 10\./],
    ["edit-after-acceptance", /In the book Vibe Coding: chapter 12, section 10\./],
    ["github-page-without-token", /In the book Vibe Coding: chapter 12, section 10\./],
    ["spec-edit-waits-for-approval", /In the book Vibe Coding: chapter 8, section 6\./],
    ["change-queue", /In the book Vibe Coding: chapter 8, section 6\./],
  ];
  for (const [topic, pointer] of POINTERS) {
    assert.ok(topicText(topic)?.trim(), `known positive: explanations.md holds the topic ${topic}`);
    assert.match(bodyText(topic), pointer, `${topic}: it points to the book`);
  }
});
