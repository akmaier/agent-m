// Accepted Host scheduling prerequisites for ITM-476 / JOB-20261015-1903-6678.
// Module: MOD-repository-hosts
// Guards: UC-027; GITLAB PRODUCTS ARE SUPPORTED; A REMOTE INTERFACE NAMES HOW IT FAILS; NO SECRET IN THE REPOSITORY
// Level: unit
// Run: node --test tests/repository-hosts-pipeline-schedule.test.mjs
// API fixtures follow https://docs.gitlab.com/api/pipeline_schedules/ (read 2026-10-15):
// list schedules, POST/PUT a schedule, retrieve it with variables, POST/PUT variables.
// Reads and writes below are fake fetch calls only. Expected results stay independent of the adapter's implementation.

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { connect, parseAddress, HostError } from "../src/repository-hosts/index.mjs";

const data = JSON.parse(readFileSync(new URL("./fixtures/repository-hosts/pipeline-schedule.json", import.meta.url), "utf8"));
const address = parseAddress("https://gitlab.example.org/space/schedule-tool");
const api = `${address.origin}/api/v4/projects/space%2Fschedule-tool`;
const schedules = `${api}/pipeline_schedules`;
const token = "glpat-SCHEDULEfixture0123456789";
const json = (status, value, headers = {}) => new Response(JSON.stringify(value), {
  status, headers: { "Content-Type": "application/json", ...headers },
});

async function serving(answer, run) {
  const requests = [], original = globalThis.fetch;
  globalThis.fetch = async (input, init = {}) => {
    const request = { url: new URL(String(input)), method: init.method ?? "GET",
      headers: Object.fromEntries(new Headers(init.headers).entries()), body: init.body ? JSON.parse(init.body) : null };
    requests.push(request);
    return answer(request);
  };
  try { return { result: await run(), requests }; } finally { globalThis.fetch = original; }
}

// A stateful API fixture: pagination and variable endpoints follow the published API, not a second production client.
function server(initial = [], refuse = null) {
  const records = structuredClone(initial), writes = [];
  let next = 900;
  const answer = (r) => {
    if (r.url.href === api && r.method === "GET") return json(200, data.repository);
    const denied = refuse?.(r);
    if (denied) return denied;
    assert.equal(r.url.origin + r.url.pathname.slice(0, api.length - r.url.origin.length), api);
    assert.equal(r.headers["private-token"], token);
    assert.equal(r.url.href.includes(token), false);
    const suffix = r.url.pathname.slice(new URL(schedules).pathname.length);
    if (r.url.pathname === new URL(schedules).pathname && r.method === "GET") {
      const page = Number(r.url.searchParams.get("page") ?? 1), per = Number(r.url.searchParams.get("per_page") ?? 20);
      return json(200, records.slice((page - 1) * per, page * per).map(({ variables, ...record }) => record));
    }
    if (r.url.pathname === new URL(schedules).pathname && r.method === "POST") {
      const record = { id: next++, ...r.body, variables: [] };
      records.push(record); writes.push({ method: r.method, suffix, body: r.body });
      return json(201, record);
    }
    const found = /^\/(\d+)(?:\/variables(?:\/([^/]+))?)?$/.exec(suffix);
    const record = found && records.find((entry) => entry.id === Number(found[1]));
    assert.ok(record, `unrouted schedule request: ${r.method} ${r.url.pathname}`);
    if (r.method === "GET") return json(200, record);
    writes.push({ method: r.method, suffix, body: r.body });
    if (!suffix.includes("/variables")) {
      assert.equal(r.method, "PUT"); Object.assign(record, r.body); return json(200, record);
    }
    const key = found[2] ? decodeURIComponent(found[2]) : r.body.key;
    const variable = record.variables.find((entry) => entry.key === key);
    if (r.method === "POST") {
      assert.equal(variable, undefined, "an existing variable is updated, not created twice");
      record.variables.push({ key, value: r.body.value, variable_type: "env_var" });
    } else {
      assert.equal(r.method, "PUT"); assert.ok(variable, "only an existing variable is updated");
      variable.value = r.body.value;
    }
    return json(r.method === "POST" ? 201 : 200, record.variables.find((entry) => entry.key === key));
  };
  return { records, writes, answer };
}

function scheduleMethod(host) {
  assert.equal(typeof host.setPipelineSchedule, "function", "public Host.setPipelineSchedule is implemented");
  return (value) => host.setPipelineSchedule(value);
}
function assertSchedule(record, wanted) {
  assert.deepEqual(Object.fromEntries(["description", "cron", "ref", "active"].map((key) => [key, record[key]])),
    Object.fromEntries(["description", "cron", "ref", "active"].map((key) => [key, wanted[key]])));
  assert.equal(record.cron_timezone, wanted.timezone);
  for (const [key, value] of Object.entries(wanted.variables ?? {})) {
    assert.equal(record.variables.find((entry) => entry.key === key)?.value, value, key);
  }
}

// TST-476400
// level: unit
// module: MOD-repository-hosts
// guards: GITLAB PRODUCTS ARE SUPPORTED; UC-027
// given: the controlled project response in pipeline-schedule.json, with Maintainer access
// input: public connect(address, credentials).repositoryInfo()
// expect: integration/ci, private, writable, not archived and the fixture description, after exactly one fake GET
test("TST-476400: existing public Host and project fixture are a positive control", async () => {
  const { result, requests } = await serving(server().answer, () => connect(address, { token }).repositoryInfo());
  assert.deepEqual(result, { defaultBranch: "integration/ci", visibility: "private", canWrite: true,
    archived: false, description: "Schedule fixture" });
  assert.deepEqual(requests.map((r) => [r.method, r.url.href]), [["GET", api]]);
});

// TST-476401
// level: unit
// module: MOD-repository-hosts
// guards: UC-027; A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT
// given: a GitLab project with no schedule and the complete request fixture
// input: public setPipelineSchedule(request)
// expect: one schedule with the supplied description, cron, timezone, ref, active and both non-secret variables; string id and project schedules URL
test("TST-476401: GitLab creates the supplied pipeline schedule and variables", async () => {
  const fake = server(), call = scheduleMethod(connect(address, { token }));
  const { result } = await serving(fake.answer, () => call(data.request));
  assert.equal(fake.records.length, 1);
  assertSchedule(fake.records[0], data.request);
  assert.equal(fake.writes.filter((r) => r.method === "POST" && r.suffix === "").length, 1);
  assert.deepEqual(result, { id: String(fake.records[0].id), url: `${address.web}/-/pipeline_schedules` });
});

// TST-476402
// level: unit
// module: MOD-repository-hosts
// guards: UC-027
// given: 100 unrelated schedules followed by the same-description fixture, with an existing ROWS variable
// input: setPipelineSchedule(changed), then save that same changed schedule again
// expect: both saves return id 731; no duplicate schedule, unrelated records unchanged, supplied false flag/timezone/ref and new or updated variables persisted
test("TST-476402: GitLab finds later-page descriptions and updates idempotently", async () => {
  const unrelated = Array.from({ length: 100 }, (_, i) => ({ id: i + 1, description: `Other ${i}`, variables: [] }));
  const fake = server([...unrelated, data.existing]), call = scheduleMethod(connect(address, { token }));
  const { result } = await serving(fake.answer, async () => [await call(data.changed), await call(data.changed)]);
  assert.deepEqual(result, Array.from({ length: 2 }, () => ({ id: "731", url: `${address.web}/-/pipeline_schedules` })));
  assert.equal(fake.records.length, 101);
  assert.deepEqual(fake.records.slice(0, 100), unrelated);
  assertSchedule(fake.records[100], data.changed);
  assert.equal(fake.writes.filter((r) => r.method === "POST" && r.suffix === "").length, 0);
  assert.equal(fake.records[100].variables.filter((entry) => entry.key === "REPORT").length, 1);
  assert.deepEqual(fake.records[100].variables.find((entry) => entry.key === "KEEP"),
    data.existing.variables.find((entry) => entry.key === "KEEP"), "an unmentioned variable survives both updates");
});

// TST-476403
// level: unit
// module: MOD-repository-hosts
// guards: UC-027; A REMOTE INTERFACE NAMES HOW IT FAILS
// given: a public GitHub Host and the otherwise valid schedule fixture
// input: setPipelineSchedule(request)
// expect: public HostError NotSupported, with no request because GitHub schedules belong to workflow files
test("TST-476403: GitHub scheduling is explicitly NotSupported without a request", async () => {
  const call = scheduleMethod(connect(parseAddress("https://github.com/carol/schedule-tool")));
  const { requests } = await serving(() => { assert.fail("GitHub schedule must not request an API"); }, async () => {
    await assert.rejects(call(data.request), (error) => error instanceof HostError && error.name === "NotSupported");
  });
  assert.equal(requests.length, 0);
});

// TST-476404
// level: unit
// module: MOD-repository-hosts
// guards: NO SECRET IN THE REPOSITORY; UC-027
// given: a working schedule with non-secret variables, then a variable containing the configured secret or host token
// input: setPipelineSchedule with each variable value
// expect: clean schedule succeeds; credential-bearing variables reject before any write and the rejection never repeats the value
test("TST-476404: pipeline variables cannot write configured credentials", async () => {
  const secret = "configured-SCHEDULE-secret-0123456789";
  const call = scheduleMethod(connect(address, { token, secrets: [secret] }));
  const good = server();
  await serving(good.answer, () => call(data.request));
  assert.equal(good.records.length, 1, "known positive with non-secret variables");
  for (const value of [secret, token]) {
    const fake = server();
    await serving(fake.answer, async () => {
      await assert.rejects(call({ ...data.request, variables: { ROWS: `prefix-${value}-suffix` } }), (error) => {
        assert.equal(error.message.includes(value), false); return true;
      });
    });
    assert.equal(fake.writes.length, 0);
  }
});

// TST-476405
// level: unit
// module: MOD-repository-hosts
// guards: A REMOTE INTERFACE NAMES HOW IT FAILS; UC-027
// given: a successful schedule control; refusals at list/create/update/variable writes and a failing transport
// input: setPipelineSchedule with the request or changed fixture
// expect: TokenRefused for 401, PermissionMissing for 403, RateLimited for 429, Unreachable for 500 or transport failure, never successful scheduling
test("TST-476405: pipeline lookup and every write preserve documented Host failures", async () => {
  const call = scheduleMethod(connect(address, { token }));
  assert.ok((await serving(server().answer, () => call(data.request))).result.id, "known positive");
  const cases = [
    { stage: "list", status: 401, name: "TokenRefused" },
    { stage: "create", status: 403, name: "PermissionMissing" },
    { stage: "update", status: 429, name: "RateLimited" },
    { stage: "variable", status: 500, name: "Unreachable" },
    { stage: "list", status: null, name: "Unreachable" },
  ];
  for (const entry of cases) {
    const fake = server(entry.stage === "update" ? [data.existing] : [], (r) => {
      const match = entry.stage === "list" ? r.method === "GET" && r.url.pathname === new URL(schedules).pathname
        : entry.stage === "create" ? r.method === "POST" && r.url.pathname === new URL(schedules).pathname
          : entry.stage === "update" ? r.method === "PUT" && !r.url.pathname.includes("/variables")
            : r.method !== "GET" && r.url.pathname.includes("/variables");
      if (!match) return null;
      if (entry.status === null) throw new TypeError("fixture transport unavailable");
      return json(entry.status, { message: "fixture refusal" });
    });
    await serving(fake.answer, () => assert.rejects(call(entry.stage === "update" ? data.changed : data.request),
      (error) => error instanceof HostError && error.name === entry.name, entry.stage));
  }
});

// TST-476406
// level: unit
// module: MOD-repository-hosts
// guards: UC-027; DEVELOP AGAINST INTERFACES
// given: a Host configured with a clone and project token, and one with the same clone but no token
// input: setPipelineSchedule(request)
// expect: the token-bearing clone delegates to the REST schedule API; the tokenless clone rejects NotSupported without a request
test("TST-476406: clone scheduling uses REST only when credentials were supplied", async () => {
  const fake = server(), call = scheduleMethod(connect(address, { token, clone: "/tmp/unused-schedule-fixture" }));
  assert.ok((await serving(fake.answer, () => call(data.request))).result.id);
  assert.equal(fake.records.length, 1);
  const without = scheduleMethod(connect(address, { clone: "/tmp/unused-schedule-fixture" }));
  const { requests } = await serving(() => assert.fail("tokenless clone must not request"),
    () => assert.rejects(without(data.request), (error) => error instanceof HostError && error.name === "NotSupported"));
  assert.equal(requests.length, 0);
});
