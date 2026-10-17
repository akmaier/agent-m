// MOD-main-page's route `home` — the stages, what waits for a person and what is being built (ITM-827), as the accepted text of docs/architecture/MOD-main-page.md (Interfaces: `view`, `home`)
// and UC-046 (steps 3 to 5) state it: "one card per product this browser keeps, each with its name, its process model, its bar of six stages each filled by its share, the stage it is in
// marked, … and its build — the steps or items in progress, each with the job working on it, its participant, state and elapsed time; without a product, Agent M's own card from the
// instance repository; … below the cards, what waits for a person across the instance".
// Run: node --test tests/main-page-home.test.mjs
//
// Module: MOD-main-page
// Guards: THE MAIN PAGE SHOWS EACH PRODUCT'S PROGRESS BY STAGE; THE BUILD IS SHOWN AS IT HAPPENS; WITHOUT A PRODUCT, THE MAIN PAGE SHOWS AGENT M'S OWN PROGRESS; A PAGE LOAD READS THE REPOSITORY IN BATCHES; A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT; PROGRESS AND JOB STATE ARE DERIVED, NOT STORED; UC-046
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

import test, { afterEach } from "node:test";
import assert from "node:assert/strict";
import { view } from "../src/main-page/index.mjs";
import { sourceStrategies } from "../src/source-register/index.mjs";
import { productCard } from "../src/main-page/cards.mjs";
import {
  INSTANCE, OTHER, PRODUCT, INSTANCE_TOKEN, INSTANCE_URL, MISSING_URL, OTHER_URL, PRODUCT_TOKEN, PRODUCT_URL,
  browser, buildOf, byClass, cardsOf, click, currentOf, draw, failedJob, instanceFiles, network, productFiles, runningJob, smallProduct, stagesOf, waitsOf,
} from "./main-page-home-harness.mjs";

const home = view.routes.find((candidate) => candidate.name === "home");
let net;
afterEach(() => net?.restore());

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
