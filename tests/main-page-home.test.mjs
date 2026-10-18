// MOD-main-page's route `home` — the stages, what waits for a person and what is being built (ITM-827), as the accepted text of docs/architecture/MOD-main-page.md (Interfaces: `view`, `home`)
// and UC-046 (steps 3 to 5) state it: "one card per product this browser keeps, each with its name, its process model, its bar of six stages each filled by its share, the stage it is in
// marked, … and its build — the steps or items in progress, each with the job working on it, its participant, state and elapsed time; without a product, Agent M's own card from the
// instance repository; … below the cards, what waits for a person across the instance".
// Run: node --test tests/main-page-home.test.mjs
//
// Module: MOD-main-page
// Guards: THE MAIN PAGE SHOWS EACH PRODUCT'S PROGRESS BY STAGE; THE BUILD IS SHOWN AS IT HAPPENS; WITHOUT A PRODUCT, THE MAIN PAGE SHOWS AGENT M'S OWN PROGRESS; A PAGE LOAD READS THE REPOSITORY IN BATCHES; A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT; PROGRESS AND JOB STATE ARE DERIVED, NOT STORED; A USED-UP RATE LIMIT IS NAMED, NOT BLAMED ON THE TOKEN; UC-046
// Level: unit
//
// Each test states its input and its expected values in its own text (given / input / expect); no expected value is read from a document. The real MOD-progress-measures, MOD-job-ledger,
// MOD-runtimes, MOD-bridge-client, MOD-repository-hosts, MOD-browser-store and MOD-site-frame run as they are; only `fetch` is faked, by the helper tests/main-page-home-harness.mjs. No request
// leaves the fixtures; nothing sleeps.
//
// Readings the module file leaves open, which the tests state (the pull request names them):
//   - A card is <article class="card"> with <h2> its name, <a class="card-repo"> its address, <p class="card-model"> "Developed with <model>" or, where the product declares none, "Its process
//     is chosen when implementation starts", and <ol class="stages"> of six <li class="stage" data-stage="<name>"> each with a .stage-share ("75 %", or "?" for a stage without a share) and a
//     .stage-detail; the stage the product is in is also <li class="stage is-current">. The build is <li class="build-row"> with .build-item, .build-job, .build-participant, .build-state and
//     .build-elapsed ("2h 0m 0s", as the route `jobs` writes it).
//   - What waits is <li class="wait"> reading "<kind>: <id>", and " · <product>" where the page holds more than one card; without an item, "Nothing waits for a person.".
//   - A card whose repository cannot be read is <article class="card is-error"> with the reason its host gives; the other cards are drawn.
//   - A link is a <button type="button"> that calls the ViewContext's go(route, params): "Open" at the end of an item that waits (.wait-link), "+ Add product" (.add-product, only beside Agent M's
//     own card) and "Open the token's setting" (.token-setting, in a card that could not be read). The routes are use-case, spec-entry, job (a failed job, or a gate waiting at a job's record),
//     process (a gate waiting at the declaration), add-product and settings; an item of a product also hands `product: <its address>`. No address is written by the page.
//   - The page draws no greeting, no explanation and no link from a stage (ITM-829), and no *Get your own Agent M* (ITM-655).
//   - While the page is open it reads the jobs' states again once a minute (MOD-main-page, Data: "at an interval the repository servers' rate limits allow"): the timer is a setTimeout of 60,000 milliseconds,
//     set when the cards are drawn and again after each reading, and a test fires it itself at a clock it names. A reading is made for each card that was read and whose repository this browser keeps a token
//     for (without one the network's limit is 60 requests an hour, which readings once a minute would use up): the default branch's snapshot — its commit and its tree, two requests — and the rows listJobs
//     derives from it with the live state of each job that has not ended; a record that changed is read by a request of its own. The stages, the shares, the plan,
//     the pull requests and what waits stay as they were drawn; the build's rows move. A reading that fails leaves the cards as drawn and adds <p class="warn reread-problem"> reading "The jobs' states could
//     not be read again. <product>: <the host's reason>", which the next reading that succeeds removes. Once the cards are no longer a child of the element they were drawn into, no reading is made.

import test, { afterEach } from "node:test";
import assert from "node:assert/strict";
import { view } from "../src/main-page/index.mjs";
import { sourceStrategies } from "../src/source-register/index.mjs";
import { productCard } from "../src/main-page/cards.mjs";
import { chosenProduct } from "../src/site-frame/index.mjs";
import {
  INSTANCE, OTHER, PRODUCT, INSTANCE_TOKEN, INSTANCE_URL, MISSING_URL, OTHER_TOKEN, OTHER_URL, PRODUCT_TOKEN, PRODUCT_URL, RATE_RESET,
  browser, buildOf, byClass, cardsOf, click, countReads, currentOf, draw, endedJob, failedJob, instanceFiles, network, productFiles, runningJob, smallProduct, stagesOf, timers, waitsOf, withEnd,
} from "./main-page-home-harness.mjs";

const home = view.routes.find((candidate) => candidate.name === "home");
let net;
afterEach(() => {
  net?.restore();
  timers.restore();
});

const JOB = "JOB-20261016-1000-ffff";
const RUNNING = runningJob({ id: JOB, by: "lab-pc-4" });
const SMALL = () => smallProduct({ jobs: [RUNNING] });

// TST-827001 · level: unit · module: MOD-main-page
// guards: THE MAIN PAGE SHOWS WHAT GOES ON IN THE INSTANCE
// given: the module's view
// input: its routes and its strategies read
// expect: the routes are exactly [home, jobs], home the first (the frame shows the first route for an address that names none); home is named "home", titled "Agent M", sits under no entry of the menu (entry null) and keeps the frame's default subject (no `subject`); the strategies are exactly [sourceStrategies] of MOD-source-register
test("TST-827001 the view hands the frame the routes home and jobs, home first, and the strategies of the source register", () => {
  assert.deepEqual(view.routes.map((candidate) => candidate.name), ["home", "jobs"]);
  assert.equal(home.title, "Agent M");
  assert.equal(home.entry, null);
  assert.equal("subject" in home, false);
  assert.equal(typeof home.render, "function");
  assert.deepEqual(view.strategies, [sourceStrategies]);
});

// TST-827002 · level: unit · module: MOD-main-page
// guards: THE MAIN PAGE SHOWS EACH PRODUCT'S PROGRESS BY STAGE; UC-046 (step 3, 3c)
// given: this browser keeps the product alice/product, which holds two requirements, two use cases of which UC-001 is accepted, one backlog item, no architecture file, no tag and no declared process model
// input: the route home drawn
// expect: one card named "alice/product", its address https://github.com/alice/product, saying "Its process is chosen when implementation starts", with six stages in this order — Requirements 100 % "2 requirements, no change open", Use cases 50 % "1 of 2 accepted", Architecture 0 % "not designed yet", Implementation ? "the process is configured when implementation starts", Tests ? "the commits of the default branch are unknown", Release 0 % "no release yet" — and the stage it is in marked: Use cases, and only it; counter-proof: with both use cases accepted, Use cases reads 100 % "2 of 2 accepted" and the stage marked is Architecture
test("TST-827002 a kept product has a card with its six stages, each with its share, and the stage it is in marked", async () => {
  net = network({ [PRODUCT]: smallProduct(), [INSTANCE]: instanceFiles() });
  net.install();
  const target = await draw(home, browser());
  const [card, ...others] = cardsOf(target);
  assert.equal(others.length, 0);
  assert.equal(byClass(card, "card-head")[0].children[0].textContent, "alice/product");
  assert.equal(byClass(card, "card-repo")[0].getAttribute("href"), PRODUCT_URL);
  assert.equal(byClass(card, "card-model")[0].textContent, "Its process is chosen when implementation starts");
  assert.deepEqual(stagesOf(card), [
    ["Requirements", "100 %", "2 requirements, no change open"], ["Use cases", "50 %", "1 of 2 accepted"], ["Architecture", "0 %", "not designed yet"],
    ["Implementation", "?", "the process is configured when implementation starts"], ["Tests", "?", "the commits of the default branch are unknown"], ["Release", "0 %", "no release yet"],
  ]);
  assert.deepEqual(currentOf(card), ["Use cases"]);

  net.restore();
  net = network({ [PRODUCT]: smallProduct({ accepted: ["UC-001", "UC-002"] }), [INSTANCE]: instanceFiles() });
  net.install();
  const both = cardsOf(await draw(home, browser()))[0];
  assert.deepEqual(stagesOf(both)[1], ["Use cases", "100 %", "2 of 2 accepted"]);
  assert.deepEqual(currentOf(both), ["Architecture"]);
});

// TST-827003 · level: unit · module: MOD-main-page
// guards: THE BUILD IS SHOWN AS IT HAPPENS; PROGRESS AND JOB STATE ARE DERIVED, NOT STORED; UC-046 (step 4)
// given: the product of TST-827002 with UC-001 accepted, the item ITM-0900 that builds on it and a job record JOB-20261016-1000-ffff of dev-cli for ITM-0900, taken by the Bridge lab-pc-4 and not ended, started at 10:00 UTC; the clock at 12:00 UTC; this browser keeps lab-pc-4, which lists that job as running
// input: the route home drawn; and drawn again where lab-pc-4 lists no job
// expect: the build holds one row, ["ITM-0900", "JOB-20261016-1000-ffff", "dev-cli", "running", "2h 0m 0s"], and lab-pc-4 was asked exactly once; counter-proof: where the Bridge lists no job, the same row is ["ITM-0900", "JOB-20261016-1000-ffff", "dev-cli", "ended without record", "0h 0m 0s"] — the state and the elapsed time come from what the runtime reports (MOD-job-ledger counts a job's time only while its runtime knows it), and not from the record alone; a product whose item has no job has no build
test("TST-827003 the build lists the item in progress with its job, participant, state and elapsed time, the state as the job's runtime reports it", async () => {
  net = network({ [PRODUCT]: SMALL(), [INSTANCE]: instanceFiles() }, { bridgeLists: JOB });
  net.install();
  const card = cardsOf(await draw(home, browser()))[0];
  assert.deepEqual(buildOf(card), [["ITM-0900", JOB, "dev-cli", "running", "2h 0m 0s"]]);
  assert.equal(net.bridgeAsked(), 1);

  net.restore();
  net = network({ [PRODUCT]: SMALL(), [INSTANCE]: instanceFiles() }, { bridgeLists: null });
  net.install();
  assert.deepEqual(buildOf(cardsOf(await draw(home, browser()))[0]), [["ITM-0900", JOB, "dev-cli", "ended without record", "0h 0m 0s"]]);

  net.restore();
  net = network({ [PRODUCT]: smallProduct(), [INSTANCE]: instanceFiles() });
  net.install();
  assert.deepEqual(buildOf(cardsOf(await draw(home, browser()))[0]), []);
  assert.equal(net.bridgeAsked(), 0);
});

// TST-827004 · level: unit · module: MOD-main-page
// guards: THE MAIN PAGE SHOWS WHAT GOES ON IN THE INSTANCE; UC-046 (step 5)
// given: the product of TST-827002 (UC-001 accepted, UC-002 open), and a second kept product bob/other that holds one open use case UC-001 and one accepted use case UC-002
// input: the route home drawn with the first product only; with both; and with the first product's UC-002 accepted
// expect: with one card the list reads "use case: UC-002"; with both cards it reads "use case: UC-002 · alice/product" and "use case: UC-001 · bob/other"; counter-proof: once UC-002 of the first product is accepted too, the first product's line is gone, and where nothing at all waits the page says "Nothing waits for a person."
test("TST-827004 what waits for a person across the cards, each with its kind and identifier and its product where there are several", async () => {
  const other = smallProduct({ accepted: ["UC-002"] });
  net = network({ [PRODUCT]: smallProduct(), [OTHER]: other, [INSTANCE]: instanceFiles() });
  net.install();
  assert.deepEqual(waitsOf(await draw(home, browser({ products: [PRODUCT_URL] }))), ["use case: UC-002"]);
  const both = await draw(home, browser({ products: [PRODUCT_URL, OTHER_URL], tokens: { [PRODUCT]: PRODUCT_TOKEN } }));
  assert.deepEqual(waitsOf(both), ["use case: UC-002 · alice/product", "use case: UC-001 · bob/other"]);
  assert.equal(cardsOf(both).length, 2);

  net.restore();
  net = network({ [PRODUCT]: smallProduct({ accepted: ["UC-001", "UC-002"] }), [OTHER]: smallProduct({ accepted: ["UC-001", "UC-002"] }), [INSTANCE]: instanceFiles() });
  net.install();
  const none = await draw(home, browser({ products: [PRODUCT_URL] }));
  assert.deepEqual(waitsOf(none), []);
  assert.equal(byClass(none, "waits").at(-1).textContent.includes("Nothing waits for a person."), true);
});

// TST-827005 · level: unit · module: MOD-main-page
// guards: WITHOUT A PRODUCT, THE MAIN PAGE SHOWS AGENT M'S OWN PROGRESS; UC-046 (3a)
// given: this browser keeps no product; the instance alice/agent-m holds the files of the product of TST-827002
// input: the route home drawn; and drawn where the browser keeps the product alice/product
// expect: one card named "Agent M" at https://github.com/alice/agent-m, whose stages are read from the instance repository (Use cases 50 % "1 of 2 accepted"); counter-proof: with a product kept, no card is named "Agent M" and the product's is
test("TST-827005 while this browser keeps no product, the one card is Agent M's own, read from the instance repository", async () => {
  net = network({ [INSTANCE]: smallProduct(), [PRODUCT]: productFiles({ items: 1, jobs: 0 }) });
  net.install();
  const own = cardsOf(await draw(home, browser({ products: [] })));
  assert.equal(own.length, 1);
  assert.equal(byClass(own[0], "card-head")[0].children[0].textContent, "Agent M");
  assert.equal(byClass(own[0], "card-repo")[0].getAttribute("href"), INSTANCE_URL);
  assert.deepEqual(stagesOf(own[0])[1], ["Use cases", "50 %", "1 of 2 accepted"]);

  const kept = cardsOf(await draw(home, browser({ products: [PRODUCT_URL] })));
  assert.deepEqual(kept.map((card) => byClass(card, "card-head")[0].children[0].textContent), ["alice/product"]);
});

// TST-827006 · level: unit · module: MOD-main-page
// guards: A PAGE LOAD READS THE REPOSITORY IN BATCHES; UC-046
// given: this browser keeps the product alice/product of 600 backlog items, 400 job records, SPEC.md and one test file, with a token for it and one for the instance, whose repository holds its participant list
// input: the route home drawn; the fake's requests counted
// expect: 22 requests in all — the repository 2 (the instance's and the product's), the commits 3 (the instance's main, the product's main and test-results), the trees 2, the pull requests 1, the tags 1 and 13 batch requests of at most a hundred files; not one file is read by a request of its own; every request carries an Authorization header
test("TST-827006 with a token, the route home reads 600 items and 400 job records in 13 batches, 22 requests in all", async () => {
  net = network({ [PRODUCT]: productFiles({ items: 600, jobs: 400 }), [INSTANCE]: instanceFiles() });
  net.install();
  const target = await draw(home, browser());
  const kinds = {};
  for (const { kind } of net.server.log) kinds[kind] = (kinds[kind] ?? 0) + 1;
  assert.equal(cardsOf(target).length, 1);
  assert.equal(byClass(target, "is-error").length, 0);
  assert.equal(net.requests.length, 22);
  assert.deepEqual(kinds, { repository: 2, commit: 3, tree: 2, "pull requests": 1, tags: 1, batch: 13 });
  assert.deepEqual(net.server.log.filter((entry) => entry.kind === "file"), []);
  assert.deepEqual(net.requests.filter((request) => request.authorization === null), []);
});

// TST-827007 · level: unit · module: MOD-main-page
// guards: A PAGE LOAD READS THE REPOSITORY IN BATCHES; UC-046
// given: the product, the instance and the browser of TST-827006, with no token stored for the instance or the product, so that the host has no batch request and every file is read by a request of its own
// input: the route home drawn; the fake's requests counted
// expect: 1,012 requests in all — the repository 2, the commits 3, the trees 2, the pull requests 1, the tags 1 and 1,003 files each by a request of its own (the 600 items, the 400 job records, SPEC.md, the test file and the instance's participant list); no batch request; no request carries an Authorization header
test("TST-827007 without a token, the route home reads every file by a request of its own, 1,012 requests in all", async () => {
  net = network({ [PRODUCT]: productFiles({ items: 600, jobs: 400 }), [INSTANCE]: instanceFiles() });
  net.install();
  const target = await draw(home, browser({ tokens: {}, instanceToken: null }));
  const kinds = {};
  for (const { kind } of net.server.log) kinds[kind] = (kinds[kind] ?? 0) + 1;
  assert.equal(byClass(target, "is-error").length, 0);
  assert.equal(net.requests.length, 1012);
  assert.deepEqual(kinds, { repository: 2, commit: 3, tree: 2, "pull requests": 1, tags: 1, file: 1003 });
  assert.deepEqual(net.requests.filter((request) => request.authorization !== null), []);
});

// TST-827008 · level: unit · module: MOD-main-page
// guards: A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT; UC-046
// given: this browser keeps the product alice/product with its own token and the instance with the instance's token
// input: the route home drawn; every request to a repository sorted by the repository it names
// expect: known positive — requests to alice/product and to alice/agent-m were made; every request to alice/product carries the product's token and no other, every request to alice/agent-m carries the instance's; no request to another address
test("TST-827008 each repository is read with the token this browser keeps for it, and a token reaches no other repository", async () => {
  net = network({ [PRODUCT]: SMALL(), [INSTANCE]: instanceFiles() }, { bridgeLists: JOB });
  net.install();
  await draw(home, browser());
  const product = net.requests.filter((request) => request.url.includes(`/repos/${PRODUCT}`) || request.url.includes(`githubusercontent.com/${PRODUCT}/`));
  const instance = net.requests.filter((request) => request.url.includes(`/repos/${INSTANCE}`) || request.url.includes(`githubusercontent.com/${INSTANCE}/`));
  assert.ok(product.length > 0 && instance.length > 0, "known positive: both repositories were read");
  assert.deepEqual([...new Set(product.map((request) => request.authorization))], [`Bearer ${PRODUCT_TOKEN}`]);
  assert.deepEqual([...new Set(instance.map((request) => request.authorization))], [`Bearer ${INSTANCE_TOKEN}`]);
  assert.deepEqual(net.requests.filter((request) => request.host !== "api.github.com" && request.host !== "127.0.0.1:4711").map((request) => request.host), []);
});

// TST-827009 · level: unit · module: MOD-main-page
// guards: THE MAIN PAGE SHOWS WHAT GOES ON IN THE INSTANCE; UC-046 (3b)
// given: this browser keeps the product alice/product and a product carol/missing that the server does not find
// input: the route home drawn
// expect: two cards; the first is alice/product's with its six stages; the second is <article class="card is-error"> named "carol/missing" with its address and the reason its host gives, "https://github.com/carol/missing was not found — a private repository is found only with a token that reaches it."; what waits is still the first product's, "use case: UC-002 · alice/product"; counter-proof: with carol/missing left out, no card is an error
test("TST-827009 a product whose repository cannot be read has a card that says so, and the other cards are drawn", async () => {
  net = network({ [PRODUCT]: smallProduct(), [INSTANCE]: instanceFiles() });
  net.install();
  const target = await draw(home, browser({ products: [PRODUCT_URL, MISSING_URL] }));
  const [good, bad, ...rest] = cardsOf(target);
  assert.equal(rest.length, 0);
  assert.equal(stagesOf(good).length, 6);
  assert.equal(good.className.includes("is-error"), false);
  assert.equal(bad.className.includes("is-error"), true);
  assert.equal(byClass(bad, "card-head")[0].children[0].textContent, "carol/missing");
  assert.equal(byClass(bad, "warn")[0].textContent, `${MISSING_URL} was not found — a private repository is found only with a token that reaches it.`);
  assert.deepEqual(waitsOf(target), ["use case: UC-002 · alice/product"]);
  assert.equal(byClass(await draw(home, browser({ products: [PRODUCT_URL] })), "is-error").length, 0);
});

// TST-827010 · level: unit · module: MOD-main-page
// guards: THE BUILD IS SHOWN AS IT HAPPENS; UC-046 (4a)
// given: a build of one row whose job's runtime does not answer, as MOD-progress-measures' buildInProgress gives it (reachable false), and a build of one row whose runtime answers
// input: productCard drawn with each
// expect: the first row ends with "not reachable" and shows the state its record gives ("running"); the second row has no such mark
test("TST-827010 a build row whose runtime does not answer is marked as not reachable, with the state its record gives", () => {
  const shares = [{ stage: "Implementation", share: 0.5, detail: "1 of 2 items done" }];
  const row = (reachable) => ({ item: "ITM-0900", job: JOB, participant: "dev-cli", state: "running", elapsed: 7200, reachable });
  const draw1 = (reachable) => productCard({ title: "alice/product", address: PRODUCT_URL, model: "Kanban", shares, current: "Implementation", build: [row(reachable)] });
  const missing = draw1(false), answering = draw1(true);
  assert.deepEqual(byClass(missing, "not-reachable").map((node) => node.textContent), ["not reachable"]);
  assert.deepEqual(byClass(answering, "not-reachable"), []);
  assert.deepEqual(buildOf(missing), [["ITM-0900", JOB, "dev-cli", "running", "2h 0m 0s"]]);
  assert.equal(byClass(missing, "card-model")[0].textContent, "Developed with Kanban");
});

// TST-827011 · level: unit · module: MOD-main-page
// guards: THE MAIN PAGE SHOWS WHAT GOES ON IN THE INSTANCE; UC-046 (step 5)
// given: the product alice/product with the open use case UC-002, an open SPEC change entry (queue 2026-10-01a_fixture, entry 1) and a failed job JOB-20261016-1000-ffff; the browser's ViewContext records every call of go(route, params)
// input: the route home drawn; the "Open" button of each of the three items pressed in turn
// expect: three items wait, each with one button; pressing them calls go exactly as ["use-case", { id: "UC-002", product: "https://github.com/alice/product" }], ["spec-entry", { id: "spec-2026-10-01a_fixture-01", product: … }] and ["job", { id: "JOB-20261016-1000-ffff", product: … }], in the order of the list, and nothing before the press; counter-proof: with Agent M's own card (no product kept) the call for its open use case is ["use-case", { id: "UC-002" }] with no product
test("TST-827011 each item that waits for a person opens the page where it is decided, through the ViewContext's go", async () => {
  net = network({ [PRODUCT]: smallProduct({ queue: true, jobs: [failedJob({ id: JOB, by: "lab-pc-4" })] }), [INSTANCE]: instanceFiles() });
  net.install();
  const context = browser();
  const target = await draw(home, context);
  assert.equal(waitsOf(target).length, 3);
  assert.deepEqual(context.went, []);
  const buttons = byClass(target, "wait-link");
  assert.equal(buttons.length, 3);
  for (const button of buttons) click(button);
  const product = { product: PRODUCT_URL };
  assert.deepEqual(context.went, [["use-case", { id: "UC-002", ...product }], ["spec-entry", { id: "spec-2026-10-01a_fixture-01", ...product }], ["job", { id: JOB, ...product }]]);

  net.restore();
  net = network({ [INSTANCE]: smallProduct(), [PRODUCT]: smallProduct() });
  net.install();
  const own = browser({ products: [] });
  const ownTarget = await draw(home, own);
  click(byClass(ownTarget, "wait-link")[0]);
  assert.deepEqual(own.went, [["use-case", { id: "UC-002" }]]);
});

// TST-827012 · level: unit · module: MOD-main-page
// guards: WITHOUT A PRODUCT, THE MAIN PAGE SHOWS AGENT M'S OWN PROGRESS; UC-046 (3a)
// given: this browser keeps no product; and, for the counter-proof, keeps alice/product
// input: the route home drawn; the "+ Add product" button pressed
// expect: one button reading "+ Add product" stands beside Agent M's card, and pressing it calls go("add-product", {}) once; with a product kept there is no such button
test("TST-827012 while no product is kept, + Add product opens the add-product route", async () => {
  net = network({ [INSTANCE]: smallProduct(), [PRODUCT]: smallProduct() });
  net.install();
  const context = browser({ products: [] });
  const target = await draw(home, context);
  const [add, ...more] = byClass(target, "add-product");
  assert.equal(more.length, 0);
  assert.equal(add.textContent, "+ Add product");
  assert.deepEqual(context.went, []);
  click(add);
  assert.deepEqual(context.went, [["add-product", {}]]);
  assert.deepEqual(byClass(await draw(home, browser({ products: [PRODUCT_URL] })), "add-product"), []);
});

// TST-827013 · level: unit · module: MOD-main-page
// guards: THE MAIN PAGE SHOWS WHAT GOES ON IN THE INSTANCE; UC-046 (3b)
// given: this browser keeps alice/product and carol/missing, which the server does not find
// input: the route home drawn; the token-setting button of carol/missing's card pressed
// expect: the unreadable card holds one button reading "Open the token's setting", the readable card none; pressing it calls go("settings", none given) once
test("TST-827013 a card whose repository cannot be read opens the token's setting", async () => {
  net = network({ [PRODUCT]: smallProduct(), [INSTANCE]: instanceFiles() });
  net.install();
  const context = browser({ products: [PRODUCT_URL, MISSING_URL] });
  const [good, bad] = cardsOf(await draw(home, context));
  assert.deepEqual(byClass(good, "token-setting"), []);
  const [setting, ...more] = byClass(bad, "token-setting");
  assert.equal(more.length, 0);
  assert.equal(setting.textContent, "Open the token's setting");
  click(setting);
  assert.deepEqual(context.went, [["settings", {}]]);
});

// ---------------------------------------------------------------- the jobs' states read again while the page is open (ITM-847)

const at = (clock) => Date.parse(`2026-10-16T${clock}:00Z`);
const waitingDelays = () => timers.waiting.map((timer) => timer.delay);
// A request's address with the commit of a tree left out, so that the expected address is written whole.
const addressOf = (request) => new URL(request.url).pathname.replace(/[0-9a-f]{40}$/, "<commit>");
const problemsOf = (target) => byClass(target, "reread-problem").map((node) => node.textContent);

// TST-847001 · level: unit · module: MOD-main-page
// guards: THE BUILD IS SHOWN AS IT HAPPENS; UC-046 (step 4)
// given: this browser keeps alice/product, whose job JOB-20261016-1000-ffff runs on the Bridge lab-pc-4; the timers a page sets are kept by the test and fired by it
// input: the route home drawn; the timer fired at 12:01 UTC; and, for the counter-proof, the route drawn where the one product kept is carol/missing, which cannot be read
// expect: after the draw exactly one timer waits, of 60000 milliseconds; after it was fired exactly one waits again, of 60000 milliseconds; counter-proof: where no card could be read, no timer waits
test("TST-847001 the page reads the jobs' states again once a minute, and sets no timer where no card was read", async () => {
  net = network({ [PRODUCT]: SMALL(), [INSTANCE]: instanceFiles() }, { bridgeLists: JOB });
  net.install();
  await draw(home, browser());
  assert.deepEqual(waitingDelays(), [60000]);
  await timers.fire(at("12:01"));
  assert.deepEqual(waitingDelays(), [60000]);

  timers.restore();
  await draw(home, browser({ products: [MISSING_URL] }));
  assert.deepEqual(waitingDelays(), []);
});

// TST-847002 · level: unit · module: MOD-main-page
// guards: A PAGE LOAD READS THE REPOSITORY IN BATCHES; A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT; PROGRESS AND JOB STATE ARE DERIVED, NOT STORED; UC-046 (step 4)
// given: this browser keeps the product alice/product of 600 backlog items and 400 job records, none of them taken or ended, with a token for it and one for the instance (the page of TST-827006 read it in 22 requests)
// input: the route home drawn; the timer fired at 12:01 UTC, the requests since the draw counted; then one job record, JOB-20261014-0900-0001, given its end on the server and the timer fired at 12:02
// expect: the first reading sends exactly 2 requests, both to alice/product and both with the product's token — the commit of main and the tree of that commit —, and not one file, batch, pull request, tag or repository
// request, and none to alice/agent-m; counter-proof: the reading after the record changed sends 3 — the commit, the tree and the changed record by a request of its own, docs/jobs/JOB-20261014-0900-0001.md —,
// and the 399 records that did not change are not read again
test("TST-847002 with a token, a reading of the jobs' states is the product's commit and tree, 2 requests, and a record that changed costs 1 more", async () => {
  net = network({ [PRODUCT]: productFiles({ items: 600, jobs: 400 }), [INSTANCE]: instanceFiles() });
  net.install();
  await draw(home, browser());
  assert.equal(net.requests.length, 22);
  const sent = net.requests.length, logged = net.server.log.length;
  await timers.fire(at("12:01"));
  assert.deepEqual(net.requests.slice(sent).map(addressOf), ["/repos/alice/product/commits/main", "/repos/alice/product/git/trees/<commit>"]);
  assert.deepEqual(net.requests.slice(sent).map((request) => request.authorization), [`Bearer ${PRODUCT_TOKEN}`, `Bearer ${PRODUCT_TOKEN}`]);
  assert.deepEqual(net.server.log.slice(logged).map((entry) => [entry.kind, ...entry.files]), [["commit"], ["tree"]]);

  const record = "docs/jobs/JOB-20261014-0900-0001.md";
  const files = productFiles({ items: 600, jobs: 400 });
  files[record] = withEnd(files[record], "done");
  net.change(PRODUCT, files);
  const again = net.requests.length, loggedAgain = net.server.log.length;
  await timers.fire(at("12:02"));
  assert.equal(net.requests.length - again, 3);
  assert.deepEqual(net.server.log.slice(loggedAgain).map((entry) => [entry.kind, ...entry.files]), [["commit"], ["tree"], ["file", record]]);
});

// TST-847003 · level: unit · module: MOD-main-page
// guards: THE BUILD IS SHOWN AS IT HAPPENS; UC-046 (step 4)
// given: the product, the instance and the browser of TST-847002, with no token stored for the instance or the product (the page of TST-827007 read it in 1,012 requests); and, for the counter-proof, the same
// where the product's token is stored and the instance's is not
// input: the route home drawn
// expect: 1,012 requests for the draw and no timer waiting, so that no reading is made — GitHub's limit without a token is 60 requests an hour for the network, which a reading each minute would use up in half an
// hour; counter-proof: with the product's token stored, one timer of 60000 milliseconds waits
test("TST-847003 a card whose repository this browser keeps no token for is not read again", async () => {
  net = network({ [PRODUCT]: productFiles({ items: 600, jobs: 400 }), [INSTANCE]: instanceFiles() });
  net.install();
  await draw(home, browser({ tokens: {}, instanceToken: null }));
  assert.equal(net.requests.length, 1012);
  assert.deepEqual(waitingDelays(), []);

  net.restore();
  timers.restore();
  net = network({ [PRODUCT]: productFiles({ items: 600, jobs: 400 }), [INSTANCE]: instanceFiles() });
  net.install();
  await draw(home, browser({ instanceToken: null }));
  assert.deepEqual(waitingDelays(), [60000]);
});

// TST-847004 · level: unit · module: MOD-main-page
// guards: THE BUILD IS SHOWN AS IT HAPPENS; PROGRESS AND JOB STATE ARE DERIVED, NOT STORED; UC-046 (step 4, 4a)
// given: the product of TST-827003 (UC-001 accepted, the item ITM-0900, the job JOB-20261016-1000-ffff of dev-cli taken by the Bridge lab-pc-4 and not ended, started at 10:00 UTC), which lab-pc-4 lists as running; the page drawn at 12:00 UTC
// input: the timer fired at 12:01; the Bridge then listing no job and the timer fired at 12:02; the record then ended as done at 11:00 UTC on the server and the timer fired at 12:03
// expect: the build holds one row throughout — after the draw ["ITM-0900", JOB, "dev-cli", "running", "2h 0m 0s"]; after 12:01 the same row at "2h 1m 0s", the Bridge asked once more (2 times in all); after 12:02
// ["ITM-0900", JOB, "dev-cli", "ended without record", "0h 0m 0s"], the Bridge asked a third time; after 12:03 ["ITM-0900", JOB, "dev-cli", "done", "1h 0m 0s"] and the Bridge not asked again (3 in all), since a record
// that has its end needs no runtime
test("TST-847004 the build's row moves with the job's record and its runtime: running, ended without record, done", async () => {
  net = network({ [PRODUCT]: SMALL(), [INSTANCE]: instanceFiles() }, { bridgeLists: JOB });
  net.install();
  const target = await draw(home, browser());
  assert.deepEqual(buildOf(cardsOf(target)[0]), [["ITM-0900", JOB, "dev-cli", "running", "2h 0m 0s"]]);
  assert.equal(net.bridgeAsked(), 1);

  await timers.fire(at("12:01"));
  assert.deepEqual(buildOf(cardsOf(target)[0]), [["ITM-0900", JOB, "dev-cli", "running", "2h 1m 0s"]]);
  assert.equal(net.bridgeAsked(), 2);

  net.bridgeLists = null;
  await timers.fire(at("12:02"));
  assert.deepEqual(buildOf(cardsOf(target)[0]), [["ITM-0900", JOB, "dev-cli", "ended without record", "0h 0m 0s"]]);
  assert.equal(net.bridgeAsked(), 3);

  net.change(PRODUCT, smallProduct({ jobs: [endedJob({ id: JOB, by: "lab-pc-4", state: "done" })] }));
  await timers.fire(at("12:03"));
  assert.deepEqual(buildOf(cardsOf(target)[0]), [["ITM-0900", JOB, "dev-cli", "done", "1h 0m 0s"]]);
  assert.equal(net.bridgeAsked(), 3);
});

// TST-847005 · level: unit · module: MOD-main-page
// guards: THE BUILD IS SHOWN AS IT HAPPENS; PROGRESS AND JOB STATE ARE DERIVED, NOT STORED; UC-046 (steps 3 to 5)
// given: the product of TST-847004 drawn at 12:00 UTC (Use cases 50 % "1 of 2 accepted", "use case: UC-002" waiting); then, on the server, UC-002 accepted and the job ended as done
// input: the timer fired at 12:01; and, for the counter-proof, the route drawn anew
// expect: the build's row reads "done"; the six stages are exactly what they were (Use cases still 50 % "1 of 2 accepted") and what waits is still "use case: UC-002"; the reading sent 3 requests — the commit, the
// tree and the job's record, docs/jobs/JOB-20261016-1000-ffff.md — and read no use case and no approval record; counter-proof: the route drawn anew reads Use cases 100 % "2 of 2 accepted" and nothing waits,
// so that the change was on the server and only the reading left it alone
test("TST-847005 a reading moves the build's rows and nothing else: the stages and what waits stay as drawn", async () => {
  net = network({ [PRODUCT]: SMALL(), [INSTANCE]: instanceFiles() }, { bridgeLists: JOB });
  net.install();
  const target = await draw(home, browser());
  const stages = stagesOf(cardsOf(target)[0]);
  assert.deepEqual(stages[1], ["Use cases", "50 %", "1 of 2 accepted"]);
  assert.deepEqual(waitsOf(target), ["use case: UC-002"]);

  net.change(PRODUCT, smallProduct({ accepted: ["UC-001", "UC-002"], jobs: [endedJob({ id: JOB, by: "lab-pc-4", state: "done" })] }));
  const logged = net.server.log.length;
  await timers.fire(at("12:01"));
  assert.deepEqual(buildOf(cardsOf(target)[0]), [["ITM-0900", JOB, "dev-cli", "done", "1h 0m 0s"]]);
  assert.deepEqual(stagesOf(cardsOf(target)[0]), stages);
  assert.deepEqual(waitsOf(target), ["use case: UC-002"]);
  assert.deepEqual(net.server.log.slice(logged).map((entry) => [entry.kind, ...entry.files]), [["commit"], ["tree"], ["file", `docs/jobs/${JOB}.md`]]);

  const anew = await draw(home, browser());
  assert.deepEqual(stagesOf(cardsOf(anew)[0])[1], ["Use cases", "100 %", "2 of 2 accepted"]);
  assert.deepEqual(waitsOf(anew), []);
});

// TST-847006 · level: unit · module: MOD-main-page
// guards: A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT; UC-046 (3b, step 4)
// given: this browser keeps alice/product and bob/other, each with a token of its own, and carol/missing, which the server does not find; the page drawn with two cards and one that says it could not be read;
// and, for the counter-proof, the same where bob/other has no token stored
// input: the timer fired at 12:01 UTC, the requests since the draw listed
// expect: exactly 4 requests, the commit of main and the tree of each of alice/product and bob/other — no request to carol/missing and none to the instance alice/agent-m —, those to alice/product carrying
// "Bearer <the product's token>" and those to bob/other carrying "Bearer <bob/other's token>"; counter-proof: where bob/other has no token, exactly 2 requests, the commit of main and the tree of alice/product
test("TST-847006 a reading asks each card that was read, and has a token, for its commit and tree with its own token, and no other", async () => {
  net = network({ [PRODUCT]: smallProduct(), [OTHER]: smallProduct({ accepted: ["UC-002"] }), [INSTANCE]: instanceFiles() });
  net.install();
  const products = [PRODUCT_URL, OTHER_URL, MISSING_URL];
  const target = await draw(home, browser({ products, tokens: { [PRODUCT]: PRODUCT_TOKEN, [OTHER]: OTHER_TOKEN } }));
  assert.equal(cardsOf(target).length, 3);
  assert.equal(byClass(target, "is-error").length, 1);
  const sent = net.requests.length;
  await timers.fire(at("12:01"));
  const added = net.requests.slice(sent);
  assert.deepEqual(added.map(addressOf).sort(), ["/repos/alice/product/commits/main", "/repos/alice/product/git/trees/<commit>", "/repos/bob/other/commits/main", "/repos/bob/other/git/trees/<commit>"]);
  assert.deepEqual(added.filter((request) => request.url.includes("/repos/alice/product/")).map((request) => request.authorization), [`Bearer ${PRODUCT_TOKEN}`, `Bearer ${PRODUCT_TOKEN}`]);
  assert.deepEqual(added.filter((request) => request.url.includes("/repos/bob/other/")).map((request) => request.authorization), [`Bearer ${OTHER_TOKEN}`, `Bearer ${OTHER_TOKEN}`]);

  timers.restore();
  await draw(home, browser({ products, tokens: { [PRODUCT]: PRODUCT_TOKEN } }));
  const sentAgain = net.requests.length;
  await timers.fire(at("12:02"));
  assert.deepEqual(net.requests.slice(sentAgain).map(addressOf), ["/repos/alice/product/commits/main", "/repos/alice/product/git/trees/<commit>"]);
});

// TST-847007 · level: unit · module: MOD-main-page
// guards: THE BUILD IS SHOWN AS IT HAPPENS; UC-046 (step 4)
// given: the page drawn into an element, with a job running; the timer fired once while the cards are in the element
// input: the frame draws another route into the same element (the cards are no longer in it); the timer set after the first reading is fired
// expect: the first firing sends 2 requests to GitHub and 1 to the Bridge lab-pc-4 (the job has not ended) and sets the next timer; the second sends none and sets none, so that no reading is made once the route is
// no longer shown
test("TST-847007 the readings stop once the route is no longer the one shown", async () => {
  net = network({ [PRODUCT]: SMALL(), [INSTANCE]: instanceFiles() }, { bridgeLists: JOB });
  net.install();
  const target = await draw(home, browser());
  const sent = net.requests.length;
  await timers.fire(at("12:01"));
  assert.equal(net.requests.slice(sent).filter((request) => request.host === "api.github.com").length, 2);
  assert.equal(net.requests.slice(sent).filter((request) => request.host === "127.0.0.1:4711").length, 1);
  assert.deepEqual(waitingDelays(), [60000]);

  target.replaceChildren("Another route is drawn here.");
  const later = net.requests.length;
  await timers.fire(at("12:02"));
  assert.equal(net.requests.length, later);
  assert.deepEqual(waitingDelays(), []);
});

// TST-847008 · level: unit · module: MOD-main-page
// guards: THE BUILD IS SHOWN AS IT HAPPENS; UC-046 (step 4)
// given: the page drawn at 12:00 UTC with a job running (row "2h 0m 0s"); GitHub then answers every request of its API with a server error, 500
// input: the timer fired at 12:01; GitHub then answering again and the timer fired at 12:02
// expect: after the failure the row still reads ["ITM-0900", JOB, "dev-cli", "running", "2h 0m 0s"], one paragraph reads "The jobs' states could not be read again. alice/product: GitHub answered 500", and one timer
// waits, of 60000 milliseconds (a failure that is no used-up limit is tried again at the next interval); after the answer the row reads "2h 2m 0s" and no such paragraph is left
test("TST-847008 a reading that fails leaves the cards as drawn, says why, and the next reading is made at the next interval", async () => {
  net = network({ [PRODUCT]: SMALL(), [INSTANCE]: instanceFiles() }, { bridgeLists: JOB });
  net.install();
  const target = await draw(home, browser());
  net.refusing = { how: "error" };
  await timers.fire(at("12:01"));
  assert.deepEqual(buildOf(cardsOf(target)[0]), [["ITM-0900", JOB, "dev-cli", "running", "2h 0m 0s"]]);
  assert.deepEqual(problemsOf(target), ["The jobs' states could not be read again. alice/product: GitHub answered 500"]);
  assert.deepEqual(waitingDelays(), [60000]);

  net.refusing = null;
  await timers.fire(at("12:02"));
  assert.deepEqual(buildOf(cardsOf(target)[0]), [["ITM-0900", JOB, "dev-cli", "running", "2h 2m 0s"]]);
  assert.deepEqual(problemsOf(target), []);
});

// TST-847009 · level: unit · module: MOD-main-page
// guards: WITHOUT A PRODUCT, THE MAIN PAGE SHOWS AGENT M'S OWN PROGRESS; A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT; UC-046 (3a, step 4)
// given: this browser keeps no product; the instance alice/agent-m holds the files of the product of TST-847004, whose job lab-pc-4 lists as running; the page drawn at 12:00 UTC
// input: the timer fired at 12:01 UTC, the requests since the draw listed
// expect: exactly 2 requests, the commit of main and its tree of alice/agent-m, both with "Bearer <the instance's token>", and none to alice/product; the Bridge lab-pc-4 is asked once more (2 times in all); the row reads
// ["ITM-0900", JOB, "dev-cli", "running", "2h 1m 0s"]
test("TST-847009 Agent M's own card is read again through the instance's host, 2 requests with the instance's token", async () => {
  net = network({ [INSTANCE]: SMALL(), [PRODUCT]: smallProduct() }, { bridgeLists: JOB });
  net.install();
  const target = await draw(home, browser({ products: [] }));
  assert.equal(net.bridgeAsked(), 1);
  const sent = net.requests.length;
  await timers.fire(at("12:01"));
  const added = net.requests.slice(sent).filter((request) => request.host === "api.github.com");
  assert.deepEqual(added.map(addressOf), ["/repos/alice/agent-m/commits/main", "/repos/alice/agent-m/git/trees/<commit>"]);
  assert.deepEqual(added.map((request) => request.authorization), [`Bearer ${INSTANCE_TOKEN}`, `Bearer ${INSTANCE_TOKEN}`]);
  assert.equal(net.requests.length - sent, 3);
  assert.equal(net.bridgeAsked(), 2);
  assert.deepEqual(buildOf(cardsOf(target)[0]), [["ITM-0900", JOB, "dev-cli", "running", "2h 1m 0s"]]);
});

// TST-847010 · level: unit · module: MOD-main-page
// guards: THE BUILD IS SHOWN AS IT HAPPENS; PROGRESS AND JOB STATE ARE DERIVED, NOT STORED; UC-046 (step 4)
// given: the product with two jobs, JOB-20261016-1000-aaaa and JOB-20261016-1000-bbbb, taken by CI runs (https://github.com/alice/product/actions/runs/101 and …/102) and not ended; the job workflow's run list, one page,
// holds run 101 in progress and run 102 completed with success
// input: the route home drawn; the timer fired at 12:01 UTC, the requests since the draw listed
// expect: 4 requests in all — the commit, the tree and, for each of the two jobs, one request of the job workflow's run list (/repos/alice/product/actions/workflows/agent-m-jobs.yml/runs); where no job
// is taken by a CI run (TST-847002), the reading sends no such request
test("TST-847010 a job taken by a CI run that has not ended costs one request of the run list for each job, in each reading", async () => {
  const run = (id, status, conclusion) => ({ id, status, conclusion, html_url: `https://github.com/alice/product/actions/runs/${id}`, path: ".github/workflows/agent-m-jobs.yml", head_sha: "a".repeat(40), event: "push" });
  const jobs = [runningJob({ id: "JOB-20261016-1000-aaaa", by: "https://github.com/alice/product/actions/runs/101" }), runningJob({ id: "JOB-20261016-1000-bbbb", by: "https://github.com/alice/product/actions/runs/102" })];
  net = network({ [PRODUCT]: smallProduct({ jobs }), [INSTANCE]: instanceFiles() });
  net.ciRuns = [run(101, "in_progress", null), run(102, "completed", "success")];
  net.install();
  await draw(home, browser());
  const sent = net.requests.length;
  await timers.fire(at("12:01"));
  assert.deepEqual(net.requests.slice(sent).map(addressOf), ["/repos/alice/product/commits/main", "/repos/alice/product/git/trees/<commit>",
    "/repos/alice/product/actions/workflows/agent-m-jobs.yml/runs", "/repos/alice/product/actions/workflows/agent-m-jobs.yml/runs"]);
});

// TST-847011 · level: unit · module: MOD-main-page
// guards: A USED-UP RATE LIMIT IS NAMED, NOT BLAMED ON THE TOKEN; UC-046 (step 4)
// given: the page drawn at 12:00 UTC with a job running (row "2h 0m 0s"); GitHub then refuses its API with a used-up limit of the account, which resets at 13:00 UTC (X-RateLimit-Reset 2026-10-16T13:00:00Z)
// input: the timer fired at 12:01; the limit then given back and the timer fired at 13:00
// expect: after the refusal the row still reads ["ITM-0900", JOB, "dev-cli", "running", "2h 0m 0s"], one paragraph reads "The jobs' states could not be read again. alice/product: GitHub's request limit for the
// account these requests are made with is used up; it resets at 2026-10-16T13:00:00.000Z.", and one timer waits, of 3540000 milliseconds — the 59 minutes from 12:01 to the reset at 13:00, not the 60000 of an
// ordinary interval; the reading at 13:00 sends 2 requests, the row reads "3h 0m 0s", no such paragraph is left, and the next timer is of 60000 milliseconds
test("TST-847011 a used-up limit makes the next reading wait until the limit resets, 3,540,000 milliseconds from 12:01 to 13:00", async () => {
  assert.equal(RATE_RESET, Date.parse("2026-10-16T13:00:00Z"));
  net = network({ [PRODUCT]: SMALL(), [INSTANCE]: instanceFiles() }, { bridgeLists: JOB });
  net.install();
  const target = await draw(home, browser());
  net.refusing = { how: "limit" };
  await timers.fire(at("12:01"));
  assert.deepEqual(buildOf(cardsOf(target)[0]), [["ITM-0900", JOB, "dev-cli", "running", "2h 0m 0s"]]);
  assert.deepEqual(problemsOf(target), ["The jobs' states could not be read again. alice/product: GitHub's request limit for the account these requests are made with is used up; it resets at 2026-10-16T13:00:00.000Z."]);
  assert.deepEqual(waitingDelays(), [3540000]);

  net.refusing = null;
  const sent = net.requests.length;
  await timers.fire(at("13:00"));
  assert.equal(net.requests.slice(sent).filter((request) => request.host === "api.github.com").length, 2);
  assert.deepEqual(buildOf(cardsOf(target)[0]), [["ITM-0900", JOB, "dev-cli", "running", "3h 0m 0s"]]);
  assert.deepEqual(problemsOf(target), []);
  assert.deepEqual(waitingDelays(), [60000]);
});

// TST-847012 · level: unit · module: MOD-main-page
// guards: A USED-UP RATE LIMIT IS NAMED, NOT BLAMED ON THE TOKEN; A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT; UC-046 (step 4)
// given: this browser keeps alice/product and bob/other, each with a token of its own; the page drawn at 12:00 UTC; GitHub then refuses requests to alice/product only, with a used-up limit that resets at 13:00 UTC
// input: the timer fired at 12:01; the timer fired at 12:02, the requests since each firing listed
// expect: the firing at 12:01 sends 3 requests — the commit of main of alice/product, which is refused, and the commit and the tree of bob/other —, and one timer waits, of 60000 milliseconds, since bob/other's
// card is due at 12:02 while alice/product's waits for 13:00; the firing at 12:02 sends exactly 2 requests, the commit and the tree of bob/other, none to alice/product; the paragraph naming alice/product's limit is
// still shown after it
test("TST-847012 a limit used up by one card's token holds back only that card; the other card is read at the ordinary interval", async () => {
  net = network({ [PRODUCT]: smallProduct(), [OTHER]: smallProduct({ accepted: ["UC-002"] }), [INSTANCE]: instanceFiles() });
  net.install();
  const target = await draw(home, browser({ products: [PRODUCT_URL, OTHER_URL], tokens: { [PRODUCT]: PRODUCT_TOKEN, [OTHER]: OTHER_TOKEN } }));
  net.refusing = { how: "limit", repository: PRODUCT };
  let sent = net.requests.length;
  await timers.fire(at("12:01"));
  assert.deepEqual(net.requests.slice(sent).map(addressOf).sort(), ["/repos/alice/product/commits/main", "/repos/bob/other/commits/main", "/repos/bob/other/git/trees/<commit>"]);
  assert.deepEqual(waitingDelays(), [60000]);

  sent = net.requests.length;
  await timers.fire(at("12:02"));
  assert.deepEqual(net.requests.slice(sent).map(addressOf), ["/repos/bob/other/commits/main", "/repos/bob/other/git/trees/<commit>"]);
  assert.equal(problemsOf(target).length, 1);
  assert.equal(problemsOf(target)[0].includes("alice/product: GitHub's request limit"), true);
});

// TST-847013 · level: unit · module: MOD-main-page
// guards: A USED-UP RATE LIMIT IS NAMED, NOT BLAMED ON THE TOKEN; UC-046 (step 4)
// given: the page drawn at 12:00 UTC with a job running; GitHub then refuses its API with a used-up limit of the account and sends no time at which it resets (no X-RateLimit-Reset)
// input: the timer fired at 12:01
// expect: one paragraph reads "The jobs' states could not be read again. alice/product: GitHub's request limit for the account these requests are made with is used up; GitHub does not tell this page when it
// resets.", and one timer waits, of 60000 milliseconds, since no time is known to wait until
test("TST-847013 a used-up limit with no reset time given is tried again at the ordinary interval", async () => {
  net = network({ [PRODUCT]: SMALL(), [INSTANCE]: instanceFiles() }, { bridgeLists: JOB });
  net.install();
  const target = await draw(home, browser());
  net.refusing = { how: "limit, no reset time" };
  await timers.fire(at("12:01"));
  assert.deepEqual(problemsOf(target), ["The jobs' states could not be read again. alice/product: GitHub's request limit for the account these requests are made with is used up; GitHub does not tell this page when it resets."]);
  assert.deepEqual(waitingDelays(), [60000]);
});

// ---------------------------------------------------------------- whether a token is stored is the frame's to say (ITM-856)

// TST-856004 · level: unit · module: MOD-main-page
// guards: THE MAIN PAGE SHOWS WHAT GOES ON IN THE INSTANCE; A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT; UC-046 (step 4)
// given: this browser keeps the product alice/product, with its own token github-token:alice/product; and, for the counter-proof, the same browser with no token of that product; the pages are counted by the
// reads of that one key from the browser's local storage — the number of reads one call of MOD-site-frame's chosenProduct makes for the product, and the number the route home makes in drawing its card
// input: chosenProduct({ store, fragment: "#home/product=<the product>" }) called alone, its reads of the key counted; then the route home drawn on a fresh browser of the same kind, its reads counted
// expect: the call alone reads the key at least once (known positive: the count sees a read) and the route home reads it exactly as often as that call alone, with a token and without — the route reads nothing for "is a token
// stored" besides what the frame's chosenProduct reads and says — , and the card, drawn with the token, sets the timer of the readings again (one timer of 60000 milliseconds) and, drawn without it, sets none
test("TST-856004 the route home reads the product's token key no oftener than the frame's chosenProduct does, and takes from it whether a token is stored", async () => {
  const key = `github-token:${PRODUCT}`;
  for (const [tokens, delays] of [[{ [PRODUCT]: PRODUCT_TOKEN }, [60000]], [{}, []]]) {
    net = network({ [PRODUCT]: smallProduct(), [INSTANCE]: instanceFiles() });
    net.install();
    const alone = browser({ tokens });
    const aloneReads = countReads(alone.store, key);
    await chosenProduct({ store: alone.store, fragment: `#home/product=${encodeURIComponent(PRODUCT_URL)}` });
    assert.ok(aloneReads.count >= 1, "known positive: the count sees the read chosenProduct makes");

    const context = browser({ tokens });
    const reads = countReads(context.store, key);
    await draw(home, context);
    assert.equal(reads.count, aloneReads.count);
    assert.deepEqual(waitingDelays(), delays);
    net.restore();
    timers.restore();
  }
});
