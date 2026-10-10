// TST-257001
// level: release
// module: MOD-test-pages, MOD-release-evidence
// guards: UC-013; A RELEASE RUNS EVERY TEST AT EVERY LEVEL; THE RELEASE TEST REPORT IS ACCEPTED BY A PERSON; ACCEPTING THE RELEASE TEST REPORT RELEASES
// given: a selected product, distinct from the dashboard instance, has a completed release-candidate run and its immutable result record.
// input: the author opens the public dashboard Release route and refreshes the report.
// expect: the composed route reads the selected product, renders the candidate's guarded evidence and changelog, and writes nothing before acceptance.

import test from "node:test";
import assert from "node:assert/strict";
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { repoServer, openDashboard, richDocument, TOKEN } from "./app-harness.mjs";
import { connect, parseAddress } from "../src/repository-hosts/index.mjs";

const product = "customer/uc013-release-flow", commit = "a".repeat(40), result = "b".repeat(40);
const version = "2026.10.8", tag = `v${version}-rc.1`, job = "docs/jobs/JOB-20261010-2570.md";
const json = (value) => new Response(JSON.stringify(value), { headers: { "Content-Type": "application/json" } });
const files = {
  [job]: ["---", "id: JOB-20261010-2570", "kind: run-tests", "works_on:", `  - ${commit}`, "route: ci hosted", "started_by: akmaier", "start: 2026-10-10 00:00 UTC", "agent_m: unreleased, commit unknown", "limit: 1", "---", "## Destinations", "", "## Parameters", "", "```json", JSON.stringify({ candidate: { version, tag, commit }, changelog: "UC-013 composed release entry." }), "```", "", "## End", "", "state: done", ""].join("\n"),
  "SPEC.md": "# Fixture\n\n**A SAMPLE REQUIREMENT** *(Product Owner)*\nA sample rule.\n*Check:* `tests/release.test.mjs`\n",
  "tests/release.test.mjs": "// TST-257001\n// level: release\n// module: MOD-test-pages\n// guards: A SAMPLE REQUIREMENT\n",
  [`runs/${commit}/20261010-0001-release-candidate.md`]: ["---", `commit: ${commit}`, "levels:", "  - release", "occasion: release-candidate", "participant: ci", "date: 2026-10-10 00:01 UTC", "---", "## Outcomes", "", "| Test | Level | Outcome | Runs |", "|---|---|---|---|", "| TST-257001 | release | passed | |", ""].join("\n"),
};

async function server({ givenFiles = files, initialTags = [[tag, commit]] } = {}) {
  let fixture; const api = `/repos/${product}`, tags = new Map(initialTags);
  fixture = await repoServer({ repo: product, files: givenFiles, handlers: [async (url, init) => {
    if (url.origin !== "https://api.github.com") return undefined;
    if (url.pathname === `${api}/tags`) return json([...tags].map(([name, sha]) => ({ name, commit: { sha } })));
    if (url.pathname === `${api}/commits/${tag}` || url.pathname === `${api}/commits/${commit}`) return json({ sha: commit });
    if (url.pathname === `${api}/commits/test-results`) return json({ sha: result });
    if (url.pathname === `${api}/git/trees/${commit}`) return json({ truncated: false, tree: Object.keys(givenFiles).filter((path) => !path.startsWith("runs/")).map((path) => ({ path, type: "blob", sha: fixture.shas[path] })) });
    if (url.pathname === `${api}/git/trees/${result}`) return json({ truncated: false, tree: Object.keys(givenFiles).filter((path) => path.startsWith("runs/")).map((path) => ({ path, type: "blob", sha: fixture.shas[path] })) });
    if (url.pathname.startsWith(`${api}/contents/`)) { const path = url.pathname.slice(`${api}/contents/`.length).split("/").map(decodeURIComponent).join("/"); if (path in givenFiles) return new Response(givenFiles[path]); }
    if (url.pathname === `${api}/git/refs` && init.method === "POST") { const body = JSON.parse(init.body), name = body.ref.slice("refs/tags/".length); if (tags.has(name)) return json({ message: "Reference already exists" }, 422); tags.set(name, body.sha); return json({ ref: body.ref }, 201); }
    return undefined;
  }] });
  fixture.tags = tags;
  return fixture;
}

function earlierReport(previous) {
  return ["---", "version: 2026.9.9", "candidate: v2026.9.9-rc.1", `commit: ${previous}`, "date: 2026-09-01", "---",
    "## Limitations", "", "## Levels", "", "| Level | Passed | Failed | Flaky | Not run |", "|---|---|---|---|---|", "| release | 1 | 0 | 0 | 0 |",
    "", "## Tests", "", "| Test | Level | Outcome | Guards |", "|---|---|---|---|", "| TST-257005 | release | 8 of 10 | A SAMPLE REQUIREMENT |",
    "", "## Requirements", "", "| Requirement | Level | Tests | Outcome |", "|---|---|---|---|", "| A SAMPLE REQUIREMENT | release | TST-257005 | passed |",
    "", "## Changelog entry", "", "Earlier release.", ""].join("\n");
}

test("TST-257001: public Release composition reopens complete UC-013 evidence without pre-acceptance writes", async () => {
  const fixture = await server();
  const host = connect(parseAddress(`https://github.com/${product}`), { token: TOKEN });
  const prior = globalThis.fetch; globalThis.fetch = fixture.fetch;
  try {
    assert.deepEqual(await host.listTags(), [{ name: tag, commit }], "controlled product fixture supplies the candidate tag");
    assert.match(await (await host.readSnapshot("test-results")).read(`runs/${commit}/20261010-0001-release-candidate.md`), /TST-257001/, "controlled result fixture supplies the completed release run");
  } finally { globalThis.fetch = prior; }
  const page = await openDashboard({ server: fixture, hash: "#uc", search: `?repo=${product}` });
  richDocument(); await page.go("#release");
  assert.match(page.main(), new RegExp(`Release candidate ${tag}`));
  assert.match(page.main(), /TST-257001.*A SAMPLE REQUIREMENT.*UC-013 composed release entry/s);
  assert.ok(fixture.requests.some((request) => request.includes(`/repos/${product}/`)), "the public composition reads the selected product");
  assert.deepEqual(fixture.writes, [], "opening the report is not acceptance and writes nothing");
  const refresh = globalThis.document.getElementById("main").querySelector("button.refresh"); await refresh.fire("click");
  assert.deepEqual(fixture.writes, [], "refreshing immutable run evidence writes nothing");
});

// TST-257002
// level: release
// module: MOD-test-pages, MOD-release-evidence
// guards: UC-013; CALENDAR VERSIONS; EVERY PRODUCT HAS ITS OWN VERSION LINE; A RELEASE IS TAGGED AND LOGGED; A PERSON'S OWN INPUT IS COMMITTED DIRECTLY; ONE CLICK PER DECISION; EVERY STEP EXPLAINS ITSELF; A GATE NAMES WHAT IT CHECKS; THE GATE IS RECORDED; A RELEASE RUNS EVERY TEST AT EVERY LEVEL; RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER
// given: the selected controlled product has a complete schedule, CI workflow and an independent release runner.
// input: the author opens public #release, enters a changelog and name, then makes the one Start release candidate click.
// expect: the public composition creates the candidate on the selected head, queues its recorded complete run, and exposes the pending-result panel.
test("TST-257002: public Release starts a controlled complete candidate run on the selected commit", async () => {
  const flowProduct = "customer/uc013-start-flow";
  const schedule = ["---", "nightly: 02:00", "---", "## Levels", "", "| Row | every commit | pull request | nightly | release candidate | on demand | runs on |", "|---|---|---|---|---|---|---|", ...["unit", "component", "system", "integration", "release", "user"].map((level) => `| ${level} | ✓ | ✓ | ✓ | ✓ | ✓ | developer-terra-a |`), ""].join("\n");
  const flowFiles = { ".github/workflows/agent-m-jobs.yml": "name: jobs\n", "docs/tests/schedule.md": schedule, "SPEC.md": files["SPEC.md"], "tests/release.test.mjs": files["tests/release.test.mjs"] };
  let fixture, candidate = null;
  const api = `/repos/${flowProduct}`;
  fixture = await repoServer({ repo: flowProduct, files: flowFiles, handlers: [async (url, init) => {
    if (url.origin !== "https://api.github.com") return undefined;
    if (url.pathname === `${api}/tags`) return json(candidate ? [{ name: candidate, commit: { sha: fixture.head } }] : []);
    if (url.pathname === `${api}/commits/test-results`) return json({ sha: result });
    if (url.pathname === `${api}/git/trees/${result}`) return json({ truncated: false, tree: [] });
    if (url.pathname === `${api}/commits/${candidate}` && candidate) return json({ sha: fixture.head });
    if (url.pathname === `${api}/git/refs` && init.method === "POST") { const name = JSON.parse(init.body).ref.slice("refs/tags/".length); if (name.includes("-rc.")) candidate = name; return json({ ref: `refs/tags/${name}` }, 201); }
    return undefined;
  }] });
  const page = await openDashboard({ server: fixture, hash: "#uc", search: `?repo=${flowProduct}` });
  richDocument(); await page.go("#release");
  const main = globalThis.document.getElementById("main"), changelog = main.querySelector("textarea.changelog"), person = main.querySelector("input.person");
  assert.ok(changelog && person, "known-positive public form exposes the author inputs");
  changelog.value = "Controlled UC-013 entry."; person.value = "akmaier";
  await main.querySelector("button.start").fire("click");
  assert.match(page.main(), /Release candidate v\d{4}\.1\.0-rc\.1/);
  assert.match(page.main(), /Queued run: JOB-/);
  assert.ok(candidate, "the one public click created only the candidate reference in the fixture");
  assert.equal(fixture.writes.length, 1, "the selected product records the queued complete run once");
  assert.match(Object.values(fixture.writes[0].files)[0], /kind: run-tests[\s\S]*Controlled UC-013 entry/);
  assert.match(page.main(), /has not finished at every level yet/);
});

// TST-257003
// level: release
// module: MOD-test-pages, MOD-release-evidence
// guards: UC-013; THE RELEASE TEST REPORT IS ACCEPTED BY A PERSON; ACCEPTING THE RELEASE TEST REPORT RELEASES; A RELEASE IS TAGGED AND LOGGED; ONE CLICK PER DECISION
// given: the selected product's controlled complete candidate report is green and awaiting the author's decision.
// input: the author supplies their name and clicks Accept and release through public #release.
// expect: one report/approval/changelog commit is made and the release tag names the tested candidate commit.
test("TST-257003: public Release accepts a green completed report in one controlled decision", async () => {
  const fixture = await server();
  const page = await openDashboard({ server: fixture, hash: "#uc", search: `?repo=${product}` });
  richDocument(); await page.go("#release");
  const main = globalThis.document.getElementById("main"), accept = main.querySelector("button.accept"), person = main.querySelector("input.person");
  assert.ok(accept && person, "the complete report offers its public acceptance control");
  person.value = "akmaier"; await accept.fire("click");
  assert.equal(fixture.writes.length, 1, "one acceptance writes report, approval and changelog together");
  const written = fixture.writes[0].files;
  assert.ok(Object.keys(written).some((path) => path.startsWith("docs/tests/releases/v2026.10.8.md")));
  assert.ok(Object.keys(written).some((path) => path.startsWith("docs/approvals/release-v2026.10.8-")));
  assert.ok(Object.hasOwn(written, "CHANGELOG.md"));
  assert.match(page.main(), /Released v2026\.10\.8/);
  assert.equal(fixture.tags.get(`v${version}`), commit, "the accepted report tags its tested candidate commit");
});

// TST-257004
// level: release
// module: MOD-test-pages, MOD-release-evidence
// guards: UC-013; CALENDAR VERSIONS; RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER; EVERY PRODUCT HAS ITS OWN VERSION LINE
// given: controlled selected products respectively have a prior-year release, and a release runner that is the only recorded implementer.
// input: the author opens public #release, then starts the latter candidate.
// expect: the former restarts at this year's 1.0 and the latter names the independent-runner refusal without creating a candidate.
test("TST-257004: public Release handles the calendar reset and independent-runner refusal", calendarAndRunnerFlow);

async function calendarAndRunnerFlow() {
  const thisYear = new Date().getUTCFullYear(), schedule = (runner) => ["---", "nightly: 02:00", "---", "## Levels", "", "| Row | every commit | pull request | nightly | release candidate | on demand | runs on |", "|---|---|---|---|---|---|---|", ...["unit", "component", "system", "integration", "release", "user"].map((level) => `| ${level} | ✓ | ✓ | ✓ | ✓ | ✓ | ${runner} |`), ""].join("\n");
  const base = { ".github/workflows/agent-m-jobs.yml": "name: jobs\n", "docs/tests/schedule.md": schedule("developer-terra-a"), "SPEC.md": files["SPEC.md"], "tests/release.test.mjs": files["tests/release.test.mjs"] };
  const yearly = await repoServer({ repo: "customer/uc013-year", files: base, handlers: [async (url) => url.pathname.endsWith("/tags") ? json([{ name: `v${thisYear - 1}.9.3`, commit: { sha: commit } }]) : undefined] });
  const yearPage = await openDashboard({ server: yearly, hash: "#uc", search: "?repo=customer/uc013-year" }); richDocument(); await yearPage.go("#release");
  assert.match(yearPage.main(), new RegExp(`value="${thisYear}\\.1\\.0"`), "1a restarts the selected product's calendar line");
  const blockedFiles = { ...base, "docs/jobs/JOB-implement.md": ["---", "id: JOB-implement", "kind: implement", "works_on:", "  - ITM-1", "participant: developer-terra-a", "route: ci", "started_by: akmaier", "start: 2026-01-01", "agent_m: unknown", "limit: 1", "---", "## Destinations", "", "## Parameters", ""].join("\n"), "docs/tests/schedule.md": schedule("developer-terra-a") };
  const blocked = await repoServer({ repo: "customer/uc013-runner", files: blockedFiles, handlers: [async (url) => url.pathname.endsWith("/tags") ? json([]) : undefined] });
  const blockedPage = await openDashboard({ server: blocked, hash: "#uc", search: "?repo=customer/uc013-runner" }); richDocument(); await blockedPage.go("#release");
  const main = globalThis.document.getElementById("main"); main.querySelector("input.person").value = "akmaier"; await main.querySelector("button.start").fire("click");
  assert.match(blockedPage.main(), /Only the implementer[\s\S]*2a/);
  assert.equal(blocked.writes.length, 0, "2a creates neither candidate run record nor release write");
}

// TST-257005
// level: release
// module: MOD-test-pages, MOD-release-evidence
// guards: UC-013; A RED RELEASE IS ACCEPTED ONLY WITH ITS LIMITATIONS RECORDED; THE RELEASE TEST REPORT IS ACCEPTED BY A PERSON; A RELEASE IS TAGGED AND LOGGED
// given: a controlled completed candidate has a failed release test.
// input: the author tries public Accept and release without, then with, its recorded reason.
// expect: the first decision writes nothing and names the missing limitation; the second writes the limitation with the report, approval, and changelog.
test("TST-257005: public Release records every red-level limitation before accepting 3a", redFlow);

async function redFlow() {
  const redFiles = { ...files, [`runs/${commit}/20261010-0001-release-candidate.md`]: files[`runs/${commit}/20261010-0001-release-candidate.md`].replace("| TST-257001 | release | passed | |", "| TST-257001 | release | failed | |") };
  const fixture = await server({ givenFiles: redFiles });
  const page = await openDashboard({ server: fixture, hash: "#uc", search: `?repo=${product}` });
  richDocument(); await page.go("#release");
  const main = globalThis.document.getElementById("main"), accept = main.querySelector("button.accept"), person = main.querySelector("input.person"), reason = main.querySelector("input.reason");
  person.value = "akmaier"; await accept.fire("click");
  assert.match(page.main(), /Enter a reason for every failing test/);
  assert.deepEqual(fixture.writes, [], "3a cannot create an approval or tag without the reason");
  reason.value = "Known fixture limitation."; await accept.fire("click");
  assert.equal(fixture.writes.length, 1, "the completed limitation decision writes once");
  assert.match(Object.values(fixture.writes[0].files).join("\n"), /TST-257001 — Known fixture limitation\./);
  assert.match(Object.values(fixture.writes[0].files).join("\n"), /Known limitations:/);
}

// TST-257006
// level: release
// module: MOD-test-pages, MOD-release-evidence
// guards: UC-013; A RED RELEASE IS ACCEPTED ONLY WITH ITS LIMITATIONS RECORDED; A MODEL-DEPENDENT TEST IS MEASURED AS A RATE
// given: the candidate contains the prior release report and controlled result records show its model-dependent rate fell from 8 of 10 to 6 of 10.
// input: the author opens public #release and supplies the rate's reason.
// expect: the panel shows the worse rate with its confidence interval as a finding, and records the author's reason with the acceptance.
test("TST-257006: public Release presents and records the 3b worse-rate finding", rateFlow);

async function rateFlow() {
  const previous = "c".repeat(40);
  const rateTest = [files["tests/release.test.mjs"], "// TST-257005", "// level: release", "// module: MOD-release-evidence", "// guards: A SAMPLE REQUIREMENT", "// runs: 10", ""].join("\n");
  const rateFiles = { ...files, "tests/release.test.mjs": rateTest, "docs/tests/releases/v2026.9.9.md": earlierReport(previous),
    [`runs/${commit}/20261010-0001-release-candidate.md`]: files[`runs/${commit}/20261010-0001-release-candidate.md`].replace("| TST-257001 | release | passed | |", "| TST-257001 | release | passed | |\n| TST-257005 | release | passed | 6 of 10 |"),
    [`runs/${previous}/20260901-0001-release-candidate.md`]: ["---", `commit: ${previous}`, "levels:", "  - release", "occasion: release-candidate", "participant: ci", "date: 2026-09-01 00:01 UTC", "---", "## Outcomes", "", "| Test | Level | Outcome | Runs |", "|---|---|---|---|", "| TST-257005 | release | passed | 8 of 10 |", ""].join("\n") };
  const fixture = await server({ givenFiles: rateFiles });
  const page = await openDashboard({ server: fixture, hash: "#uc", search: `?repo=${product}` });
  richDocument(); await page.go("#release");
  assert.match(page.main(), /TST-257005.*6 of 10/s, "the public report exposes the lower rate");
  assert.match(page.main(), /TST-257005.*6 of 10.*confidence interval/is,
    "UC-013 3b shows the lower rate with its confidence interval as a finding");
  assert.match(page.main(), /two-sided 95% Wilson score interval.*31\.3%.*83\.2%/is,
    "failure node: public UC-013 3b preserves the numerically verified Wilson finding for 6 of 10");
  const main = globalThis.document.getElementById("main"), reason = main.querySelectorAll("input.reason").at(-1), person = main.querySelector("input.person");
  person.value = "akmaier"; reason.value = "Model drift accepted."; await main.querySelector("button.accept").fire("click");
  assert.match(Object.values(fixture.writes[0].files).join("\n"), /TST-257005 — Model drift accepted\./);
}

// TST-257007
// level: release
// module: MOD-test-pages, MOD-release-evidence
// guards: UC-013; A VERSION IS NOT REWRITTEN; ACCEPTING THE RELEASE TEST REPORT RELEASES; A RELEASE IS TAGGED AND LOGGED
// given: a complete public candidate report has been shown; respectively its release tag appears before acceptance, and its default branch advances while the suite waits.
// input: the author makes Accept and release in each controlled repository.
// expect: 4a refuses without a write or tag move; 4b writes on the advanced branch but tags the tested candidate commit.
test("TST-257007: public Release preserves immutable tags and the tested commit through 4a and 4b", immutableAndMovedFlow);

async function immutableAndMovedFlow() {
  const immutable = await server();
  const immutablePage = await openDashboard({ server: immutable, hash: "#uc", search: `?repo=${product}` });
  richDocument(); await immutablePage.go("#release");
  immutable.tags.set(`v${version}`, "d".repeat(40));
  let main = globalThis.document.getElementById("main"); main.querySelector("input.person").value = "akmaier"; await main.querySelector("button.accept").fire("click");
  assert.match(immutablePage.main(), /already stands.*next version instead/s);
  assert.deepEqual(immutable.writes, [], "4a never moves an existing release tag or creates its report commit");
  const moved = await server();
  const movedPage = await openDashboard({ server: moved, hash: "#uc", search: `?repo=${product}` });
  richDocument(); await movedPage.go("#release");
  await moved.change("README.md", "later default-branch commit\n");
  main = globalThis.document.getElementById("main"); main.querySelector("input.person").value = "akmaier"; await main.querySelector("button.accept").fire("click");
  assert.match(movedPage.main(), /Released v2026\.10\.8/);
  assert.ok(moved.requests.some((request) => request.includes(`/git/refs`) && request.includes("POST")), "4b creates the release tag after the branch advanced");
  assert.equal(moved.tags.get(`v${version}`), commit, "4b tags the immutable tested candidate commit, not the later default-branch head");
}

// TST-257022
// level: system
// module: MOD-test-pages, MOD-release-evidence
// guards: UC-013; CALENDAR VERSIONS; EVERY PRODUCT HAS ITS OWN VERSION LINE; A RELEASE IS TAGGED AND LOGGED; A VERSION IS NOT REWRITTEN; A PERSON'S OWN INPUT IS COMMITTED DIRECTLY; ONE CLICK PER DECISION; EVERY STEP EXPLAINS ITSELF; A GATE NAMES WHAT IT CHECKS; THE GATE IS RECORDED; A RELEASE RUNS EVERY TEST AT EVERY LEVEL; RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER; THE RELEASE TEST REPORT IS ACCEPTED BY A PERSON; A RED RELEASE IS ACCEPTED ONLY WITH ITS LIMITATIONS RECORDED; ACCEPTING THE RELEASE TEST REPORT RELEASES
// given: one selected controlled product has the complete schedule and a result-branch record for the commit the public start action selects.
// input: the author completes the main flow, then walks 1a, 2a, 3a, 3b, 4a and 4b through their public flows.
// expect: the main product records its queued run, report/approval/changelog commit and tested-commit tag; every alternative keeps its stated refusal or recovery outcome.
test("TST-257022: public Release walks one selected product from candidate start through completed report and acceptance", async () => {
  const wholeProduct = "customer/uc013-whole-flow", head = "c0ffee".padEnd(40, "0"), resultHead = "b".repeat(40);
  const levels = ["unit", "component", "system", "release", "user"], fixtureIds = levels.map((_, index) => `TST-25712${index + 1}`);
  const schedule = ["---", "nightly: 02:00", "---", "## Levels", "", "| Row | every commit | pull request | nightly | release candidate | on demand | runs on |", "|---|---|---|---|---|---|---|", ...levels.map((level) => `| ${level} | ✓ | ✓ | ✓ | ✓ | ✓ | developer-terra-a |`), ""].join("\n");
  const declaration = levels.map((level, index) => [`// ${fixtureIds[index]}`, `// level: ${level}`, "// module: MOD-test-pages", "// guards: A SAMPLE REQUIREMENT", ""].join("\n")).join("\n");
  const wholeFiles = { ".github/workflows/agent-m-jobs.yml": "name: jobs\n", "docs/tests/schedule.md": schedule, "SPEC.md": files["SPEC.md"], "tests/release.test.mjs": declaration, [`runs/${head}/20261010-complete.md`]: ["---", `commit: ${head}`, "levels:", ...levels.map((level) => `  - ${level}`), "occasion: release-candidate", "participant: ci", "date: 2026-10-10 00:01 UTC", "---", "## Outcomes", "", "| Test | Level | Outcome | Runs |", "|---|---|---|---|", ...levels.map((level, index) => `| ${fixtureIds[index]} | ${level} | passed | |`), ""].join("\n") };
  let fixture, candidate = null, resultsReady = false; const tags = new Map(), api = `/repos/${wholeProduct}`;
  fixture = await repoServer({ repo: wholeProduct, files: wholeFiles, handlers: [async (url, init) => {
    if (url.origin !== "https://api.github.com") return undefined;
    if (url.pathname === `${api}/tags`) return json([...tags].map(([name, sha]) => ({ name, commit: { sha } })));
    if (url.pathname === `${api}/commits/test-results`) return json({ sha: resultHead });
    if (url.pathname === `${api}/git/trees/${resultHead}`) return json({ truncated: false, tree: resultsReady ? Object.keys(wholeFiles).filter((p) => p.startsWith("runs/")).map((p) => ({ path: p, type: "blob", sha: fixture.shas[p] })) : [] });
    if (candidate && url.pathname === `${api}/commits/${candidate}`) return json({ sha: head });
    if (url.pathname === `${api}/git/trees/${head}`) return json({ truncated: false, tree: Object.keys(wholeFiles).filter((p) => !p.startsWith("runs/")).map((p) => ({ path: p, type: "blob", sha: fixture.shas[p] })) });
    if (url.pathname === `${api}/git/refs` && init.method === "POST") { const body = JSON.parse(init.body), name = body.ref.slice("refs/tags/".length); tags.set(name, body.sha); if (name.includes("-rc.")) candidate = name; return json({ ref: `refs/tags/${name}` }, 201); }
    return undefined;
  }] });
  const page = await openDashboard({ server: fixture, hash: "#uc", search: `?repo=${wholeProduct}` });
  richDocument(); await page.go("#release");
  let main = globalThis.document.getElementById("main"); main.querySelector("textarea.changelog").value = "Whole UC-013 flow."; main.querySelector("input.person").value = "akmaier";
  await main.querySelector("button.start").fire("click");
  assert.ok(candidate, "the public start action creates one candidate");
  assert.equal(tags.get(candidate), head, "candidate reference targets the selected tested commit");
  assert.match(page.main(), /Queued run: JOB-/, "the public panel shows the queued run before its result exists");
  assert.equal(fixture.writes.length, 1, "start records one queued run on the selected product");
  resultsReady = true;
  main = globalThis.document.getElementById("main"); await main.querySelector("button.refresh").fire("click");
  for (const id of fixtureIds) assert.match(page.main(), new RegExp(`${id}.*passed`, "s"), "the completed report retains every controlled level outcome");
  for (const level of levels) assert.match(page.main(), new RegExp(`\\| ${level} \\|`, "s"), "the completed report exposes every accepted level");
  main = globalThis.document.getElementById("main"); main.querySelector("input.person").value = "akmaier"; await main.querySelector("button.accept").fire("click");
  assert.equal(fixture.writes.length, 2, "one queued run plus one report/approval/changelog acceptance commit");
  assert.equal(candidate, "v2026.1.0-rc.1");
  assert.equal(tags.get("v2026.1.0"), head, "release tag targets the tested candidate commit");
  await calendarAndRunnerFlow();
  await redFlow();
  await rateFlow();
  await immutableAndMovedFlow();
});

// TST-257901
// level: release
// module: MOD-test-pages, MOD-release-evidence
// guards: UC-013; A MODEL-DEPENDENT TEST IS MEASURED AS A RATE
// given: the isolated production Release source and the public 3b fixture of TST-257006
// input: in controlled Ubuntu CI, remove the Wilson finding text, run that same public case, restore exact bytes, and rerun it
// expect: the fault reaches TST-257006's numeric Wilson assertion and byte restoration passes the same case
test("TST-257901: CI counter-proof restores the public 3b Wilson finding", () => {
  if (process.platform !== "linux" || process.env.GITHUB_ACTIONS !== "true" || process.env.AGENT_M_257_FAULT_CHILD) return;
  const temporary = mkdtempSync(join(tmpdir(), "agent-m-257-fault-")), copied = join(temporary, "repo");
  try {
    cpSync(process.cwd(), copied, { recursive: true, filter: (path) => !path.includes("/.git") && !path.includes("/node_modules") });
    const source = join(copied, "src", "release-evidence", "report.mjs"), original = readFileSync(source), text = original.toString();
    const mutation = Buffer.from(text.replace("two-sided 95% Wilson score interval", "rate interval"));
    assert.notDeepEqual(mutation, original, "fault text exists in the guarded production finding");
    const testPath = join(copied, "tests", "release-itm-257-public-flow.test.mjs"), argv = [process.execPath, "--test", "--test-name-pattern", "TST-257006", testPath];
    const invoke = () => { const env = { ...process.env, AGENT_M_257_FAULT_CHILD: "1" }; delete env.NODE_TEST_CONTEXT; return spawnSync(argv[0], argv.slice(1), { cwd: copied, encoding: "utf8", timeout: 40_000, env }); };
    const originalHash = createHash("sha256").update(original).digest("hex");
    const faultStarted = new Date().toISOString(); writeFileSync(source, mutation); const failed = invoke(); const faultEnded = new Date().toISOString();
    const restoreStarted = new Date().toISOString(); writeFileSync(source, original); const restoredHash = createHash("sha256").update(readFileSync(source)).digest("hex"), passed = invoke(); const restoreEnded = new Date().toISOString();
    process.stdout.write(`TST-257901-counterproof ${JSON.stringify({ argv, cwd: copied, originalHash, restoredHash, faultStarted, faultEnded, faultStatus: failed.status, faultSignal: failed.signal, faultError: failed.error?.code ?? null, faultStdout: failed.stdout, faultStderr: failed.stderr, restoreStarted, restoreEnded, restoredStatus: passed.status, restoredSignal: passed.signal, restoredError: passed.error?.code ?? null, restoredStdout: passed.stdout, restoredStderr: passed.stderr })}\n`);
    assert.equal(restoredHash, originalHash, "byte-exact source restoration precedes the same-case positive");
    assert.notEqual(failed.status, 0, "faulted same public case fails"); assert.match(`${failed.stdout}\n${failed.stderr}`, /Wilson|confidence interval/i);
    assert.equal(passed.status, 0, "restored same public case passes");
  } finally { rmSync(temporary, { recursive: true, force: true }); }
});
