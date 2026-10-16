// The explanations of the routes and of the participants (ITM-349) — MOD-site-frame's explain, for the steps of UC-017, UC-010 and UC-011
// that ask something of the person: each of the five types of participant with an example and what it means for cost, speed and
// control; capabilities and the processing place; why a CI agent's workflow reaches nothing stored in this browser, the self-hosted
// runner, and why only for a private repository; the SSH key as an Actions secret and its cost; an agent's test through the Bridge;
// Agent M's job workflow, its two secrets and billing per use; a job handed to a Bridge with the computer's own login; the route over
// HTTPS through the jump host. The participants page and the job workflow's line (ITM-352, ITM-351) show them folded.
// Run: node --test tests/site-frame-participant-explanations.test.mjs
//
// Module: MOD-site-frame
// Guards: EVERY STEP EXPLAINS ITSELF; UC-010; UC-011; UC-017
// Level: unit
//
// This imports the module's existing browser harness unchanged, as tests/site-frame-drafting-explanations.test.mjs does, then exercises the
// public explain interface; the topics are this file's only subject. The twelve topics are those the item's Outcome lists, each under a
// slug of its own that the pages will name. What a test pins of a topic is what UC-017, UC-010, UC-011 and UC-044 say of the step —
// each claim a sentence of the topic makes — and nothing a topic merely happens to word. The item names two secrets "by name"; no use case
// or workflow in the repository gives their names, so the topic names them by what they hold. The book is pointed to once, for keys and
// billing per call. Each test states its input and its expected result before it runs (given / input / expect). The counter-proofs are
// recorded in the pull request.

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

const TOPICS = ["participant-person", "participant-model-endpoint", "participant-ci-agent", "participant-cli-agent",
  "participant-sandboxed-agent", "capabilities-and-place", "ci-agent-runner", "ci-ssh-alternative", "agent-test", "job-workflow",
  "bridge-own-login", "bridge-https-route"];

// The claims a topic's rendered text must make: each a pattern and what it says.
function assertClaims(topic, claims) {
  assert.ok(topicText(topic)?.trim(), `known positive: explanations.md holds the topic ${topic}`);
  const text = bodyText(topic);
  for (const [pattern, says] of claims) assert.match(text, pattern, `${topic}: it says ${says}`);
}

// TST-472824 · level: unit · module: MOD-site-frame
// guards: EVERY STEP EXPLAINS ITSELF; UC-010; UC-011; UC-017
// given: explanations.md, and the twelve topics of the routes and of the participants
// input: explain(topic) for each
// expect: each is the folded What is this? — a <details class="explain"> without the open attribute, holding <summary>What is this?</summary> and then the topic's Markdown rendered, in which no asterisk or backtick of the source is left standing
test("explain — each topic of the routes and of the participants is a folded What is this? with its text", () => {
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

// TST-472825 · level: unit · module: MOD-site-frame
// guards: A PARTICIPANT DECLARES ITS CAPABILITIES; UC-017 (steps 2 and 3, table)
// given: the topic participant-person
// input: explain("participant-person")
// expect: text saying a person is a colleague reached through a GitHub or GitLab account and the dashboard, can do everything and takes the decisions; what it means for cost, speed and control
test("explain — participant-person: a person (UC-017)", () => {
  assertClaims("participant-person", [
    [/colleague, reached through their GitHub or GitLab account/, "a person is a colleague reached through a GitHub or GitLab account"],
    [/through the dashboard/, "through the dashboard"],
    [/They can do everything/, "a person can do everything"],
    [/only a person takes the decisions that need one/, "only a person takes the decisions"],
    [/Nothing is billed for a person/, "nothing is billed for a person"],
    [/works at the speed of a person/, "a person works at the speed of a person"],
    [/you control the work by doing it yourself/, "control is doing it yourself"],
  ]);
});

// TST-472826 · level: unit · module: MOD-site-frame
// guards: A PARTICIPANT DECLARES ITS CAPABILITIES; UC-017 (steps 2 and 3, table)
// given: the topic participant-model-endpoint
// input: explain("participant-model-endpoint")
// expect: text saying a model endpoint is a model reached over the network, with examples; that it only drafts text; that a hosted one is billed per use and one you run costs the machine; that you control which model answers and where hosted data is processed; reached directly or through a Bridge
test("explain — participant-model-endpoint: a model endpoint (UC-017)", () => {
  assertClaims("participant-model-endpoint", [
    [/language model that you reach over the network/, "a model endpoint is a model reached over the network"],
    [/NHR hub, an OpenAI or Anthropic\s+endpoint, or a model server such as Ollama/, "examples: NHR hub, OpenAI, Anthropic, Ollama"],
    [/drafts text and nothing else/, "it drafts text and nothing else"],
    [/cannot read or change a repository/, "it cannot read or change a repository"],
    [/answers quickly/, "it answers quickly"],
    [/hosted endpoint is billed per use by its provider/, "a hosted endpoint is billed per use by its provider"],
    [/a model you run yourself costs you the machine/, "a model you run yourself costs the machine"],
    [/control which model answers and, for a hosted one, where your data is processed/, "you control the model and where hosted data is processed"],
    [/directly, or through a Bridge the configuration names/, "the browser reaches it directly or through a Bridge"],
  ]);
});

// TST-472827 · level: unit · module: MOD-site-frame
// guards: A PARTICIPANT DECLARES ITS CAPABILITIES; UC-017 (steps 2 and 3, table)
// given: the topic participant-ci-agent
// input: explain("participant-ci-agent")
// expect: text saying a CI agent runs inside a GitHub Actions or GitLab CI job, reached through a workflow; that it reads, writes, runs code and tests; that on GitHub's machines nothing is installed but each call is billed per use and a job takes a workflow run; that a self-hosted runner is a program on a machine you control and gives more control
test("explain — participant-ci-agent: a CI agent (UC-017)", () => {
  assertClaims("participant-ci-agent", [
    [/runs inside a GitHub Actions or GitLab CI job/, "a CI agent runs inside a GitHub Actions or GitLab CI job"],
    [/reached through a workflow/, "reached through a workflow"],
    [/read\s+and write the repository and run code and tests/, "it reads and writes the repository and runs code and tests"],
    [/needs nothing installed/, "on GitHub's machines nothing is installed"],
    [/billed per\s+use by the agent's provider/, "each call is billed per use by the agent's provider"],
    [/takes the time of a workflow run/, "a job takes the time of a workflow run"],
    [/self-hosted runner, a program you install on a\s+machine you control/, "a self-hosted runner is a program installed on a machine you control"],
    [/you control more of it/, "with a runner you control more of it"],
  ]);
});

// TST-472828 · level: unit · module: MOD-site-frame
// guards: A PARTICIPANT DECLARES ITS CAPABILITIES; UC-017 (steps 2 and 3, table)
// given: the topic participant-cli-agent
// input: explain("participant-cli-agent")
// expect: text saying a CLI agent is a coding agent such as Claude Code or Codex on a computer of the person's, reached through the Bridge; its capabilities; that it uses its own login and so the person's subscription; that it starts at once; that it is the most controlled, working in its own folder
test("explain — participant-cli-agent: a CLI agent (UC-017)", () => {
  assertClaims("participant-cli-agent", [
    [/coding agent such as Claude Code or Codex/, "a CLI agent is a coding agent such as Claude Code or Codex"],
    [/computer of yours, reached through the Bridge/, "on a computer of the person's, reached through the Bridge"],
    [/run code and tests, and use tools/, "it can run code and tests and use tools"],
    [/own login on that\s+computer/, "it signs in with its own login on that computer"],
    [/uses your subscription instead of a key billed per call/, "so it uses the subscription, not a key billed per call"],
    [/starts at once/, "it starts at once"],
    [/control it the most/, "the person controls it the most"],
    [/working folder of its own/, "it works in a working folder of its own"],
  ]);
});

// TST-472829 · level: unit · module: MOD-site-frame
// guards: A PARTICIPANT DECLARES ITS CAPABILITIES; UC-017 (steps 2 and 3, table)
// given: the topic participant-sandboxed-agent
// input: explain("participant-sandboxed-agent")
// expect: text saying a sandboxed agent is a CLI agent inside a virtual machine or container reached through the Bridge in it over a tunnel; that it does what a CLI agent does, isolated; and that it is the choice when the agent should not touch the rest of the computer
test("explain — participant-sandboxed-agent: a sandboxed agent (UC-017)", () => {
  assertClaims("participant-sandboxed-agent", [
    [/CLI agent inside a virtual machine or a container/, "a sandboxed agent is a CLI agent inside a VM or container"],
    [/Bridge in it, over a tunnel/, "reached through the Bridge in it, over a tunnel"],
    [/can do what a CLI agent does, but isolated/, "it does what a CLI agent does, isolated"],
    [/sees only what the sandbox holds/, "it sees only what the sandbox holds"],
    [/control it by what you put in the sandbox/, "control is what is put in the sandbox"],
    [/should not touch the rest of your computer/, "it is the choice when the agent should not touch the rest of the computer"],
  ]);
});

// TST-472830 · level: unit · module: MOD-site-frame
// guards: A PARTICIPANT DECLARES ITS CAPABILITIES; A PARTICIPANT DECLARES WHERE IT PROCESSES DATA; RESTRICTED CONTENT GOES ONLY WHERE ITS SOURCE PERMITS; UC-017 (steps 4, 5 and 5a)
// given: the topic capabilities-and-place
// input: explain("capabilities-and-place")
// expect: text naming the six capabilities, saying they are preset for the type and adjusted, that a role needs a participant with every capability it needs, and what the processing place is and why it matters for linked sources
test("explain — capabilities-and-place: capabilities and the processing place (UC-017)", () => {
  assertClaims("capabilities-and-place", [
    [/draft text, read the repository, write to the repository, run code and tests, use\s+tools, reach the web/, "the six capabilities"],
    [/presets the ones typical for the type and you adjust them/, "they are preset for the type and adjusted"],
    [/every capability the role needs/, "a role needs a participant with every capability it needs"],
    [/where the data given to the participant is\s+processed/, "the processing place is where the data given to it is processed"],
    [/this machine for a CLI agent/, "example: this machine for a CLI agent"],
    [/permit its content only at\s+certain places/, "a source may permit its content only at certain places"],
    [/never given that source's content/, "a participant elsewhere is never given that content"],
  ]);
});

// TST-472831 · level: unit · module: MOD-site-frame
// guards: UC-017 (step 3, CI agent); A CI AGENT'S DRAFT ENTERS AS OPEN
// given: the topic ci-agent-runner
// input: explain("ci-agent-runner")
// expect: text saying a workflow runs on its runner, not in this browser, so nothing stored here reaches it; that a self-hosted runner on the agent's own machine reaches the agent locally with no inbound SSH, no key on GitHub, and works behind NAT; and that it serves private repositories only, since a fork's pull request could run code on the machine
test("explain — ci-agent-runner: why a CI agent's workflow reaches nothing stored here, the runner, and why only private (UC-017)", () => {
  assertClaims("ci-agent-runner", [
    [/runs on its runner, on GitHub's machines or on a machine you installed a runner on, and not in this browser/, "a workflow runs on its runner, not in this browser"],
    [/nothing stored in this browser, neither a token nor an SSH key, reaches it/, "nothing stored in the browser reaches it"],
    [/its key is an Actions secret/, "its key is an Actions secret"],
    [/self-hosted runner on that agent's machine/, "install a self-hosted runner on the agent's machine"],
    [/reaches the agent locally, with no inbound SSH and no key stored on GitHub/, "it reaches the agent locally, no inbound SSH, no key on GitHub"],
    [/machine behind NAT, because the runner only connects\s+out/, "it works behind NAT because the runner only connects out"],
    [/serves private repositories only/, "a self-hosted runner serves private repositories only"],
    [/pull request from any fork could run its own code on your machine/, "because a fork's pull request could run its own code on the machine"],
    [/refuses a public one and says\s+why/, "the dashboard refuses a public repository and says why"],
    [/for each product that would use it/, "this holds for each product that would use the participant"],
  ]);
});

// TST-472832 · level: unit · module: MOD-site-frame
// guards: UC-017 (alternative 3b)
// given: the topic ci-ssh-alternative
// input: explain("ci-ssh-alternative")
// expect: text saying a workflow can reach an agent behind SSH without a runner, at two costs — the SSH key stored as an Actions secret and a machine reachable from the internet — and that the runner is recommended
test("explain — ci-ssh-alternative: the SSH key as an Actions secret and its cost (UC-017 3b)", () => {
  assertClaims("ci-ssh-alternative", [
    [/reach an agent behind SSH instead/, "a workflow can reach an agent behind SSH instead"],
    [/SSH key\s+has to be stored as an Actions secret on GitHub/, "the SSH key has to be stored as an Actions secret"],
    [/reachable from the internet by GitHub's machines/, "the machine has to be reachable from the internet by GitHub's machines"],
    [/runner is the recommended way/, "the runner is recommended"],
    [/needs neither/, "because it needs neither"],
  ]);
});

// TST-472833 · level: unit · module: MOD-site-frame
// guards: UC-017 (steps 6 and 6a)
// given: the topic agent-test
// input: explain("agent-test")
// expect: text saying the test sends a harmless request through the Bridge the participant names and shows what answered; that if the Bridge does not answer the dashboard names the reason and saves nothing until the person decides to save untested
test("explain — agent-test: an agent's test through the Bridge (UC-017)", () => {
  assertClaims("agent-test", [
    [/sends a harmless request through the Bridge the participant names/, "the test sends a harmless request through the Bridge the participant names"],
    [/shows what answered/, "and shows what answered"],
    [/does not answer, the dashboard names the reason/, "if the Bridge does not answer the dashboard names the reason"],
    [/not running,\s+a wrong address or a missing token/, "such as not running, a wrong address or a missing token"],
    [/saves nothing until you decide to save it untested/, "nothing is saved until the person decides to save untested"],
  ]);
});

// TST-472834 · level: unit · module: MOD-site-frame
// guards: THE PAGE NAMES WHERE IT SENDS; UC-010 (precondition); EVERY STEP EXPLAINS ITSELF
// given: the topic job-workflow
// input: explain("job-workflow")
// expect: text saying the job workflow runs a job on GitHub's machines; reads two Actions secrets, the key of the agent or endpoint and the person's Agent M token, each named by the dashboard, which opens the secrets page and never asks for the value; that the token makes the job's pushes start CI; that the calls are billed per use by the agent's provider; and a pointer to chapter 10, section 6 of the book
test("explain — job-workflow: Agent M's job workflow, its two secrets and the billing (UC-010)", () => {
  assertClaims("job-workflow", [
    [/workflow in the product repository that runs a job on GitHub's machines/, "the job workflow is in the product repository and runs a job on GitHub's machines"],
    [/reads two secrets/, "it reads two secrets"],
    [/Actions secrets/, "set as Actions secrets"],
    [/key of the agent or endpoint, and your Agent M token/, "the agent's or endpoint's key and the person's Agent M token"],
    [/names each\s+secret and opens the repository's secrets page for it/, "the dashboard names each secret and opens the secrets page"],
    [/never asks for the value/, "and never asks for the value"],
    [/pushes and pull requests start CI like your own/, "the token makes the job's pushes and pull requests start CI"],
    [/billed per use\s+by the agent's provider/, "the calls are billed per use by the agent's provider"],
    [/In the book Vibe Coding: chapter 10, section 6, on API tokens\./, "it points to chapter 10, section 6 of the book"],
  ]);
});

// TST-472835 · level: unit · module: MOD-site-frame
// guards: UC-011 (preconditions, 3c); UC-044 (step 3)
// given: the topic bridge-own-login
// input: explain("bridge-own-login")
// expect: text saying a job handed to a Bridge runs on the person's computer with the agent's own login and the computer's own git login, with no key on GitHub, using the person's subscription; and that the git login must reach the instance and the product, the Bridge otherwise refusing the job and naming the repository
test("explain — bridge-own-login: a job handed to a Bridge with the computer's own login (UC-011)", () => {
  assertClaims("bridge-own-login", [
    [/runs on your computer with the agent's own login and with the computer's own git login/, "the job runs on the person's computer with the agent's own login and the computer's git login"],
    [/No key is\s+stored for it on GitHub/, "no key is stored for it on GitHub"],
    [/uses your subscription/, "the job uses the person's subscription"],
    [/git login must reach the\s+instance and the product/, "the git login must reach the instance and the product"],
    [/refuses the job and names the repository/, "otherwise the Bridge refuses the job and names the repository"],
  ]);
});

// TST-472836 · level: unit · module: MOD-site-frame
// guards: UC-011 (alternative 2a, 1c)
// given: the topic bridge-https-route
// input: explain("bridge-https-route")
// expect: text saying some browsers, as Safari, block the call to the Bridge's local address http://127.0.0.1; that the site says why and points to the route over HTTPS through the jump host; and that the same route reaches a machine behind NAT
test("explain — bridge-https-route: the route over HTTPS through the jump host (UC-011 2a)", () => {
  assertClaims("bridge-https-route", [
    [/block the call to the Bridge's local address/, "some browsers block the call to the Bridge's local address"],
    [/http:\/\/127\.0\.0\.1/, "the address is http://127.0.0.1"],
    [/as Safari does/, "Safari does"],
    [/site then says why/, "the site says why"],
    [/Bridge reached over HTTPS through the jump host/, "and points to the Bridge reached over HTTPS through the jump host"],
    [/Use that route when your browser blocks the local\s+address/, "use that route when the browser blocks the local address"],
    [/same route reaches a machine behind NAT/, "the same route reaches a machine behind NAT"],
  ]);
});

// TST-472837 · level: unit · module: MOD-site-frame
// guards: EVERY STEP EXPLAINS ITSELF
// given: the twelve topics, and the book Vibe Coding, whose chapter 10, section 6 treats API tokens: a secret credential, charged per request, never committed to a repository
// input: the rendered text of each topic
// expect: the topic about the job workflow, which is about keys and billing per call, points to chapter 10, section 6; no other of the twelve points to a chapter of the book
test("explain — the topics of the routes and of the participants point to the book only where it treats them", () => {
  assert.match(bodyText("job-workflow"), /In the book Vibe Coding: chapter 10, section 6, on API tokens\./, "job-workflow points to the book");
  for (const topic of TOPICS.filter((each) => each !== "job-workflow")) {
    assert.ok(topicText(topic)?.trim(), `known positive: explanations.md holds the topic ${topic}`);
    assert.doesNotMatch(bodyText(topic), /Vibe Coding/, `${topic}: it points to no chapter`);
  }
});
