// TST-289101
// level: component
// module: MOD-test-pages
// guards: UC-013; UC-047; A PERSON IS TOLD WHAT WAITS FOR THEIR ACCEPTANCE; THE RELEASE TEST REPORT IS ACCEPTED BY A PERSON
// given: a selected product, distinct from the dashboard instance, with a completed recorded release candidate and result.
// input: the person opens #release, then checks that pending report again.
// expect: the public dashboard caller reopens the candidate and its guarded result without an opening or refresh write.

import test from "node:test";
import assert from "node:assert/strict";
import { repoServer, openDashboard, richDocument, TOKEN } from "./app-harness.mjs";
import { connect, parseAddress } from "../src/repository-hosts/index.mjs";

const PRODUCT = "customer/release-fixture", COMMIT = "a".repeat(40), VERSION = "2026.10.8";
const TAG = `v${VERSION}-rc.1`, JOB = "docs/jobs/JOB-20261009-0148-2890.md", RESULT = "b".repeat(40);
const json = (value) => new Response(JSON.stringify(value), { headers: { "Content-Type": "application/json" } });
const jobRecord = () => ["---", "id: JOB-20261009-0148-2890", "kind: run-tests", "works_on:", `  - ${COMMIT}`,
  "route: ci hosted", "started_by: akmaier", "start: 2026-10-09 01:48 UTC", "agent_m: unreleased, commit unknown", "limit: 1", "---",
  "## Destinations", "", "## Parameters", "", "```json", JSON.stringify({ candidate: { version: VERSION, tag: TAG, commit: COMMIT }, changelog: "Recorded release entry." }), "```", "",
  "## End", "", "at: 2026-10-09 02:00 UTC", "state: done", ""].join("\n");
const specification = ["# Fixture product", "", "**A SAMPLE REQUIREMENT** *(Product Owner)*", "A sample rule.", "*Check:* `tests/pending.test.mjs`", ""].join("\n");
const declaration = ["// TST-100", "// level: unit", "// guards: A SAMPLE REQUIREMENT", ""].join("\n");
const resultRecord = () => ["---", `commit: ${COMMIT}`, "levels:", "  - unit", "occasion: release-candidate", "participant: ci", "date: 2026-10-09 02:00 UTC", "---",
  "## Outcomes", "", "| Test | Level | Outcome | Runs |", "|---|---|---|---|", "| TST-100 | unit | passed | |", ""].join("\n");

async function selectedProductServer({ pending }) {
  const files = pending ? { [JOB]: jobRecord(), "SPEC.md": specification, "tests/pending.test.mjs": declaration,
    [`runs/${COMMIT}/20261009-0200-release-candidate.md`]: resultRecord() } : {};
  let server;
  const api = `/repos/${PRODUCT}`;
  server = await repoServer({ repo: PRODUCT, files, handlers: [async (url) => {
    if (url.origin !== "https://api.github.com") return undefined;
    if (url.pathname === `${api}/tags`) return json(pending ? [{ name: TAG, commit: { sha: COMMIT } }] : []);
    if (pending && (url.pathname === `${api}/commits/${TAG}` || url.pathname === `${api}/commits/${COMMIT}`)) return json({ sha: COMMIT });
    if (pending && url.pathname === `${api}/commits/test-results`) return json({ sha: RESULT });
    if (pending && url.pathname === `${api}/git/trees/${COMMIT}`) return json({ truncated: false,
      tree: Object.keys(files).filter((path) => !path.startsWith("runs/")).map((path) => ({ path, type: "blob", sha: server.shas[path] })) });
    if (pending && url.pathname === `${api}/git/trees/${RESULT}`) return json({ truncated: false,
      tree: Object.keys(files).filter((path) => path.startsWith("runs/")).map((path) => ({ path, type: "blob", sha: server.shas[path] })) });
    if (pending && url.pathname.startsWith(`${api}/contents/`)) {
      const path = url.pathname.slice(`${api}/contents/`.length).split("/").map(decodeURIComponent).join("/");
      if (path in files) return new Response(files[path]);
    }
    return undefined;
  }] });
  return server;
}

async function assertSelectedProductFixture(server, { pending }) {
  const host = connect(parseAddress(`https://github.com/${PRODUCT}`), { token: TOKEN });
  const priorFetch = globalThis.fetch;
  globalThis.fetch = server.fetch;
  try {
    const tags = await host.listTags();
    if (!pending) {
      assert.deepEqual(tags, [], "the actual selected product host has no pending candidate tag");
      assert.deepEqual((await host.readSnapshot("main")).paths, [], "the actual selected product host has an empty main snapshot");
      return;
    }
    assert.deepEqual(tags, [{ name: TAG, commit: COMMIT }], "the actual selected product host lists the pending candidate");
    const candidate = await host.readSnapshot(TAG);
    assert.match(await candidate.read(JOB), /state: done/);
    assert.match(await candidate.read("tests/pending.test.mjs"), /TST-100/);
    const results = await host.readSnapshot("test-results");
    assert.match(await results.read(`runs/${COMMIT}/20261009-0200-release-candidate.md`), /\| TST-100 \| unit \| passed/);
  } finally { globalThis.fetch = priorFetch; }
}

test("TST-289101: public #release reopens the selected product's pending report without writes", async () => {
  const server = await selectedProductServer({ pending: true });
  await assertSelectedProductFixture(server, { pending: true });
  const page = await openDashboard({ server, hash: "#uc", search: `?repo=${PRODUCT}` });
  richDocument();
  await page.go("#release");
  assert.match(page.main(), new RegExp(`Release candidate ${TAG}`));
  assert.match(page.main(), /TST-100.*A SAMPLE REQUIREMENT.*Recorded release entry/s);
  assert.ok(server.requests.some((request) => request.includes(`/repos/${PRODUCT}/`)), "the public caller uses T.product.address, not the instance repository");
  assert.deepEqual(server.writes, [], "opening the selected product's pending report writes nothing");
  const refresh = globalThis.document.getElementById("main").querySelector("button.refresh");
  assert.ok(refresh, "the public caller exposes the delivered report refresh");
  await refresh.fire("click");
  assert.deepEqual(server.writes, [], "refreshing the selected product's pending report writes nothing");
});

// TST-289102
// level: component
// module: MOD-test-pages
// guards: UC-013; UC-047; A PERSON IS TOLD WHAT WAITS FOR THEIR ACCEPTANCE
// given: a selected product, distinct from the dashboard instance, with no candidate report awaiting acceptance.
// input: the person opens #release after the dashboard has mounted.
// expect: the public caller keeps the delivered new-release form for that selected product.
test("TST-289102: public #release keeps the new-release form when the selected product has no pending report", async () => {
  const server = await selectedProductServer({ pending: false });
  await assertSelectedProductFixture(server, { pending: false });
  const page = await openDashboard({ server, hash: "#uc", search: `?repo=${PRODUCT}` });
  richDocument();
  await page.go("#release");
  assert.match(page.main(), /New release.*Start release candidate/s);
  assert.ok(server.requests.some((request) => request.includes(`/repos/${PRODUCT}/`)), "the form is resolved for T.product.address");
  assert.deepEqual(server.writes, [], "opening the selected product's new-release form writes nothing");
});
