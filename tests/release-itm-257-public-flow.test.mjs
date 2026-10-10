// TST-257001
// level: release
// module: MOD-test-pages, MOD-release-evidence
// guards: UC-013; A RELEASE RUNS EVERY TEST AT EVERY LEVEL; THE RELEASE TEST REPORT IS ACCEPTED BY A PERSON; ACCEPTING THE RELEASE TEST REPORT RELEASES
// given: a selected product, distinct from the dashboard instance, has a completed release-candidate run and its immutable result record.
// input: the author opens the public dashboard Release route and refreshes the report.
// expect: the composed route reads the selected product, renders the candidate's guarded evidence and changelog, and writes nothing before acceptance.

import test from "node:test";
import assert from "node:assert/strict";
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

async function server() {
  let fixture; const api = `/repos/${product}`, tags = new Map([[tag, commit]]);
  fixture = await repoServer({ repo: product, files, handlers: [async (url, init) => {
    if (url.origin !== "https://api.github.com") return undefined;
    if (url.pathname === `${api}/tags`) return json([...tags].map(([name, sha]) => ({ name, commit: { sha } })));
    if (url.pathname === `${api}/commits/${tag}` || url.pathname === `${api}/commits/${commit}`) return json({ sha: commit });
    if (url.pathname === `${api}/commits/test-results`) return json({ sha: result });
    if (url.pathname === `${api}/git/trees/${commit}`) return json({ truncated: false, tree: Object.keys(files).filter((path) => !path.startsWith("runs/")).map((path) => ({ path, type: "blob", sha: fixture.shas[path] })) });
    if (url.pathname === `${api}/git/trees/${result}`) return json({ truncated: false, tree: Object.keys(files).filter((path) => path.startsWith("runs/")).map((path) => ({ path, type: "blob", sha: fixture.shas[path] })) });
    if (url.pathname.startsWith(`${api}/contents/`)) { const path = url.pathname.slice(`${api}/contents/`.length).split("/").map(decodeURIComponent).join("/"); if (path in files) return new Response(files[path]); }
    if (url.pathname === `${api}/git/refs` && init.method === "POST") { const body = JSON.parse(init.body), name = body.ref.slice("refs/tags/".length); if (tags.has(name)) return json({ message: "Reference already exists" }, 422); tags.set(name, body.sha); return json({ ref: body.ref }, 201); }
    return undefined;
  }] });
  return fixture;
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
// level: system
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
    if (url.pathname === `${api}/git/refs` && init.method === "POST") { candidate = JSON.parse(init.body).ref.slice("refs/tags/".length); return json({ ref: `refs/tags/${candidate}` }, 201); }
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
// level: system
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
});

// TST-257004
// level: system
// module: MOD-test-pages, MOD-release-evidence
// guards: UC-013; CALENDAR VERSIONS; RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER; EVERY PRODUCT HAS ITS OWN VERSION LINE
// given: controlled selected products respectively have a prior-year release, and a release runner that is the only recorded implementer.
// input: the author opens public #release, then starts the latter candidate.
// expect: the former restarts at this year's 1.0 and the latter names the independent-runner refusal without creating a candidate.
test("TST-257004: public Release handles the calendar reset and independent-runner refusal", async () => {
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
});
