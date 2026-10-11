// The explanations of connecting a mailbox (ITM-426) — MOD-site-frame's explain, for the steps of UC-037 that ask something of the
// person: the two routes, with the table of UC-037; registering the app, and that an institution may allow it only to its
// administrators, and whom to ask; where a mail provider lists its IMAP and SMTP settings; Gmail's app password, 2-Step Verification
// and work or school accounts; the processing places a mailbox's mails may go to. The mailbox page (ITM-427, ITM-428) shows them folded.
// Run: node --test tests/site-frame-mailbox-explanations.test.mjs
//
// Module: MOD-site-frame
// Guards: EVERY STEP EXPLAINS ITSELF; UC-037
// Level: unit
//
// This imports the module's existing browser harness unchanged, as tests/site-frame-source-explanations.test.mjs does, then exercises the
// public explain interface; the topics are this file's only subject. The five topics are the item's Outcome, each under a slug of its own
// that the mailbox page will name. What a test pins of a topic is what UC-037 says of the step — each claim a sentence of the topic makes
// — and nothing a topic merely happens to word. No topic points to the book: none was found that treats mail settings. Each test states
// its input and its expected result before it runs (given / input / expect). The counter-proofs are recorded in the pull request.

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

const TOPICS = ["mailbox-routes", "mailbox-app-registration", "mail-server-settings", "gmail-app-password", "mailbox-processing-places"];

// The claims a topic's rendered text must make: each a pattern and what it says.
function assertClaims(topic, claims) {
  assert.ok(topicText(topic)?.trim(), `known positive: explanations.md holds the topic ${topic}`);
  const text = bodyText(topic);
  for (const [pattern, says] of claims) assert.match(text, pattern, `${topic}: it says ${says}`);
}

// guards: EVERY STEP EXPLAINS ITSELF; UC-037
// given: explanations.md, and the five topics of connecting a mailbox
// input: explain(topic) for each
// expect: each is the folded What is this? — a <details class="explain"> without the open attribute, holding <summary>What is
//         this?</summary> and then the topic's Markdown rendered, in which no asterisk or backtick of the source is left standing
test("explain — each topic of connecting a mailbox is a folded What is this? with its text", () => {
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

// guards: A MAILBOX IS REACHED THROUGH ITS PROVIDER'S WEB API OR THROUGH THE BRIDGE; THE MAILBOX PASSWORD LEAVES THE BROWSER ONLY TO THE BRIDGE; UC-037 (step 1, table)
// given: the topic mailbox-routes
// input: explain("mailbox-routes")
// expect: text giving the two routes with the table's rows: for whom, how to sign in, what each needs, why
test("explain — mailbox-routes: the two routes (UC-037)", () => {
  assertClaims("mailbox-routes", [
    [/two ways to connect a mailbox/, "there are two ways to connect a mailbox"],
    [/mail provider decides which one you use/, "the mail provider decides"],
    [/web API[^.]*route is for Microsoft\s+365/, "the web API route is for Microsoft 365"],
    [/goes directly from the dashboard/, "it goes directly from the dashboard"],
    [/provider's own sign-in, so Agent M never sees your password/, "signing in is the provider's own, so Agent M never sees the password"],
    [/register an app with Microsoft once, whose return address is this dashboard/, "it needs a one-time app registration whose return address is the dashboard"],
    [/allows web pages to\s+call its mail API/, "why: Microsoft allows web pages to call its mail API"],
    [/IMAP and SMTP[^.]*route is for every other mail server/, "the IMAP and SMTP route is for every other mail server"],
    [/Gmail, FAU's Exchange, a university's\s+IMAP server or a small provider/, "examples of such servers"],
    [/mailbox password, which is stored in this browser after a notice/, "it needs the mailbox password, stored in this browser after a notice"],
    [/Bridge running and paired with this browser/, "and a Bridge running and paired with this browser"],
    [/browsers let no web page open an IMAP or SMTP\s+connection/, "why: browsers let no web page open an IMAP or SMTP connection"],
    [/proposes the route from your mail address, and you can change it/, "Agent M proposes the route from the address and it can be changed"],
  ]);
});

// guards: UC-037 (step 2, alternative 2a)
// given: the topic mailbox-app-registration
// input: explain("mailbox-app-registration")
// expect: text saying the app is registered once: what to enter (name Agent M, single-page application, the return address, the client ID copied back); that an institution may allow it only to its administrators; whom to ask and for what; and the IMAP route in the meantime
test("explain — mailbox-app-registration: registering the app, and whom to ask (UC-037 2, 2a)", () => {
  assertClaims("mailbox-app-registration", [
    [/register an app with Microsoft once/, "the app is registered once"],
    [/the name Agent M,/, "the name Agent M"],
    [/kind \*?single-page application\*?/, "the kind single-page application"],
    [/return address of this\s+dashboard, with a copy button/, "the return address of the dashboard, with a copy button"],
    [/copy the app's client ID back into the dashboard/, "the client ID is copied back"],
    [/Many institutions allow this only to\s+their administrators/, "an institution may allow it only to its administrators"],
    [/ask the administrator of your institution's Microsoft account/, "whom to ask: the administrator of the institution's Microsoft account"],
    [/single-page application with this return address and the three mail\s+permissions/, "what to ask for: a single-page application with this return address and the three mail permissions"],
    [/IMAP route can serve in the meantime if your provider also offers IMAP/, "the IMAP route can serve in the meantime"],
  ]);
});

// guards: UC-037 (step 4.1)
// given: the topic mail-server-settings
// input: explain("mail-server-settings")
// expect: text saying where a mail provider usually lists the IMAP and SMTP settings, and the presets for the ports
test("explain — mail-server-settings: where a provider lists IMAP and SMTP settings (UC-037 4.1)", () => {
  assertClaims("mail-server-settings", [
    [/enter the IMAP server and the SMTP server with their ports/, "the IMAP and the SMTP server are entered with their ports"],
    [/usually lists these settings in\s+its help pages, or in the mail settings of your account/, "a provider usually lists them in its help pages or in the account's mail settings"],
    [/heading such as \*?IMAP\*? or \*?server settings\*?/, "under a heading such as IMAP or server settings"],
    [/port 993 with implicit TLS for IMAP/, "preset: 993 with implicit TLS for IMAP"],
    [/port 587 with STARTTLS or port 465 with implicit TLS\s+for SMTP/, "preset: 587 with STARTTLS or 465 with implicit TLS for SMTP"],
    [/account name as your address/, "the account name is preset as the address"],
    [/Correct whatever differs/, "and what differs is corrected"],
  ]);
});

// guards: UC-037 (step 4.2, alternative 7c)
// given: the topic gmail-app-password
// input: explain("gmail-app-password")
// expect: text saying Gmail refuses the account password over IMAP and accepts an app password; that this needs 2-Step Verification; that work or school accounts may not offer it, the organisation's administrator deciding; and the same when a login is refused with two-factor login on
test("explain — gmail-app-password: Gmail's app password, 2-Step Verification, and work or school accounts (UC-037 4.2, 7c)", () => {
  assertClaims("gmail-app-password", [
    [/Gmail refuses your account password over IMAP/, "Gmail refuses the account password over IMAP"],
    [/accepts an \*?app password\*? instead/, "it accepts an app password instead"],
    [/password that Google creates for one\s+program/, "what an app password is"],
    [/needs 2-Step Verification to be switched on/, "it needs 2-Step Verification"],
    [/security settings/, "created in the account's security settings"],
    [/Work or school accounts may not offer\s+app passwords/, "work or school accounts may not offer app passwords"],
    [/organisation's administrator decides/, "the organisation's administrator decides"],
    [/refuses\s+the login although the password is right/, "also when a server refuses the login although the password is right"],
    [/require an app password instead of the account password when two-factor\s+login is on/, "some providers require an app password when two-factor login is on"],
  ]);
});

// guards: UC-037 (step 6, alternative 6a)
// given: the topic mailbox-processing-places
// input: explain("mailbox-processing-places")
// expect: text saying what the processing places are, with examples; that none is ticked at first and mails are then only read; the notice for a place outside the EU naming the GDPR and the AI Act, which can still be allowed and is recorded; and that places can be changed later without recalling a mail already handed over
test("explain — mailbox-processing-places: the processing places a mailbox's mails may go to (UC-037 6, 6a)", () => {
  assertClaims("mailbox-processing-places", [
    [/places where the participants of this instance process the data they are given/, "places are where the participants process the data they are given"],
    [/this\s+machine\*?, \*?FAU data centre \(EU\)\*? or \*?US cloud provider/, "examples of places"],
    [/tick the places to which this mailbox's mails may be given/, "the person ticks the places mails may be given to"],
    [/Nothing is\s+ticked at first/, "nothing is ticked at first"],
    [/mails are only read and never handed to a participant/, "until a place is ticked mails are only read, never handed to a participant"],
    [/outside the\s+European Union/, "a place outside the EU"],
    [/tells you before saving that processing personal data there does not comply with the EU's rules/, "the notice says processing personal data there does not comply with the EU's rules"],
    [/GDPR\s+for transferring personal data and the EU AI Act/, "the notice names the GDPR and the EU AI Act"],
    [/You can still allow it, and this connection records that you did/, "it can still be allowed and the connection records that"],
    [/Settings, Mailbox, Processing places/, "places can be changed later under Settings, Mailbox, Processing places"],
    [/already handed to a participant is not recalled/, "a mail already handed over is not recalled"],
  ]);
});

// guards: EVERY STEP EXPLAINS ITSELF
// given: the five topics
// input: the rendered text of each
// expect: none points to a chapter of the book
test("explain — the topics of connecting a mailbox point to no chapter of the book", () => {
  for (const topic of TOPICS) {
    assert.ok(topicText(topic)?.trim(), `known positive: explanations.md holds the topic ${topic}`);
    assert.doesNotMatch(bodyText(topic), /Vibe Coding/, `${topic}: it points to no chapter`);
  }
});

// guards: EVERY STEP EXPLAINS ITSELF; UC-037 (step 4.2: "A folded explanation links Google's page for creating one")
// given: the renderer, shown on a Markdown link as the known positive; and the five topics of connecting a mailbox
// input: explain("gmail-app-password"), and explain of each of the other four
// expect: the app-password topic holds exactly one link, to https://myaccount.google.com/apppasswords — the address that Google's own
//         help page "Sign in with app passwords" (https://support.google.com/accounts/answer/185833) gives as "Create and manage your
//         app passwords" — whose text names app passwords; none of the other four holds a link
test("explain — gmail-app-password: links Google's page for creating an app password (UC-037 4.2)", () => {
  const links = (element) => element.getElementsByTagName("a");
  assert.equal(links(renderArtifact("[a page](https://example.org/page)")).length, 1, "known positive: the renderer keeps a Markdown link");

  const found = links(explain("gmail-app-password"));
  assert.equal(found.length, 1, "one link");
  assert.equal(found[0].getAttribute("href"), "https://myaccount.google.com/apppasswords");
  assert.match(found[0].textContent, /app passwords/i, "the link says what it leads to");
  for (const topic of TOPICS.filter((each) => each !== "gmail-app-password")) {
    assert.ok(topicText(topic)?.trim(), `known positive: explanations.md holds the topic ${topic}`);
    assert.equal(links(explain(topic)).length, 0, `${topic}: no link`);
  }
});
