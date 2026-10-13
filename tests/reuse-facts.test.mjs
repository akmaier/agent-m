// MOD-reuse-facts' registryFacts and licenceVerdict (ITM-435), as docs/architecture/MOD-reuse-facts.md states them:
// registryFacts(candidate, productLicence) reads a package registry and the candidate's source repository, returning every
// fact with the address read and the read date; licenceVerdict(candidate, product) reads licences.md.
// Run: node --test tests/reuse-facts.test.mjs
//
// Module: MOD-reuse-facts
// Guards: UC-022; DUE DILIGENCE IS FETCHED, NOT RECALLED; A REUSED LICENCE IS SHOWN AGAINST THE PRODUCT'S; A REUSE DECISION RECORDS ITS DUE DILIGENCE
// Level: unit
//
// Each test states its input and its expected result before it runs (given / input / expect). No test reaches the network:
// registries are fakes of fetch, and the source repository is a fake host that keeps to MOD-repository-hosts' issueCounts
// interface.

import test from "node:test";
import assert from "node:assert/strict";
import { registryFacts, licenceVerdict } from "../src/reuse-facts/index.mjs";

const READ = "2026-10-13";
const NPM_LEFT_PAD = "https://registry.npmjs.org/left-pad";
const NPM_LEFT_PAD_DOWNLOADS = "https://api.npmjs.org/downloads/point/last-month/left-pad";
const NPM_MISSING = "https://registry.npmjs.org/missing-lib";
const NPM_BLOCKED = "https://registry.npmjs.org/blocked-lib";
const PYPI_REPORT_HELPER = "https://pypi.org/pypi/report-helper/json";

function json(status, body) {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

function fakeRegistry(routes) {
  const requests = [];
  return {
    requests,
    fetch: async (input) => {
      const href = String(input?.url ?? input);
      requests.push(href);
      if (!Object.hasOwn(routes, href)) return json(404, { message: "not found" });
      const answer = routes[href];
      if (answer instanceof Error) throw answer;
      return json(200, answer);
    },
  };
}

function fakeRepositoryHost(counts) {
  const connected = [];
  return {
    connected,
    connect: async (address) => {
      connected.push(address.web);
      return {
        repositoryInfo: async () => ({ defaultBranch: "main", visibility: "public", canWrite: false, archived: false, description: "" }),
        issueCounts: async () => counts,
      };
    },
  };
}

const npmCandidate = Object.freeze({ name: "left-pad", ecosystem: "npm", repository: "https://github.com/acme/left-pad" });
const pypiCandidate = Object.freeze({ name: "report-helper", ecosystem: "pypi",
  repository: "https://gitlab.example.org/acme/report-helper" });

// TST-435001 - level: unit - module: MOD-reuse-facts
// guards: UC-022; DUE DILIGENCE IS FETCHED, NOT RECALLED; A REUSE DECISION RECORDS ITS DUE DILIGENCE; A REUSED LICENCE IS SHOWN AGAINST THE PRODUCT'S
// given: npm holds left-pad with licence MIT, two releases, latest 1.2.0, 1234 downloads last month; its GitHub repository holds three open and seven closed issues
// input: registryFacts({ name: "left-pad", ecosystem: "npm", repository: "https://github.com/acme/left-pad" }, "MIT")
// expect: found true, blocked null, licence compatible, and exactly the facts read: exists, licence, first release, latest release, releases, open issues, closed issues, issues filed at and adoption, each with the address read and date 2026-10-13
test("MOD-reuse-facts registryFacts - npm candidate facts include registry, licence, release, issue and adoption facts", async () => {
  const registry = fakeRegistry({
    [NPM_LEFT_PAD]: {
      license: "MIT",
      "dist-tags": { latest: "1.2.0" },
      versions: { "1.0.0": {}, "1.2.0": {} },
      time: {
        created: "2020-01-01T00:00:00.000Z",
        modified: "2022-04-02T00:00:00.000Z",
        "1.0.0": "2020-01-02T00:00:00.000Z",
        "1.2.0": "2022-04-01T00:00:00.000Z",
      },
    },
    [NPM_LEFT_PAD_DOWNLOADS]: { downloads: 1234, start: "2026-09-13", end: READ, package: "left-pad" },
  });
  const host = fakeRepositoryHost({ open: 3, closed: 7 });

  const result = await registryFacts(npmCandidate, "MIT", { fetch: registry.fetch, connect: host.connect, now: () => READ });

  assert.deepEqual(result, {
    candidate: npmCandidate,
    facts: [
      { candidate: "left-pad", ecosystem: "npm", what: "exists", value: "yes", address: NPM_LEFT_PAD, read: READ },
      { candidate: "left-pad", ecosystem: "npm", what: "licence", value: "MIT", address: NPM_LEFT_PAD, read: READ },
      { candidate: "left-pad", ecosystem: "npm", what: "first release", value: "1.0.0 on 2020-01-02", address: NPM_LEFT_PAD, read: READ },
      { candidate: "left-pad", ecosystem: "npm", what: "latest release", value: "1.2.0 on 2022-04-01", address: NPM_LEFT_PAD, read: READ },
      { candidate: "left-pad", ecosystem: "npm", what: "releases", value: "2", address: NPM_LEFT_PAD, read: READ },
      { candidate: "left-pad", ecosystem: "npm", what: "open issues", value: "3", address: "https://github.com/acme/left-pad", read: READ },
      { candidate: "left-pad", ecosystem: "npm", what: "closed issues", value: "7", address: "https://github.com/acme/left-pad", read: READ },
      { candidate: "left-pad", ecosystem: "npm", what: "issues filed at", value: "https://github.com/acme/left-pad/issues", address: "https://github.com/acme/left-pad", read: READ },
      { candidate: "left-pad", ecosystem: "npm", what: "adoption", value: "1234 downloads last month", address: NPM_LEFT_PAD_DOWNLOADS, read: READ },
    ],
    licence: "compatible",
    found: true,
    blocked: null,
  });
  assert.deepEqual(registry.requests, [NPM_LEFT_PAD, NPM_LEFT_PAD_DOWNLOADS]);
  assert.deepEqual(host.connected, ["https://github.com/acme/left-pad"]);
});

// TST-435002 - level: unit - module: MOD-reuse-facts
// guards: UC-022; DUE DILIGENCE IS FETCHED, NOT RECALLED; A REUSED LICENCE IS SHOWN AGAINST THE PRODUCT'S
// given: PyPI holds report-helper with licence BSD-3-Clause, two releases, latest 2.0.0, 321 downloads last month; its GitLab repository holds one open and four closed issues
// input: registryFacts({ name: "report-helper", ecosystem: "pypi", repository: "https://gitlab.example.org/acme/report-helper" }, "MIT")
// expect: found true, blocked null, licence compatible, and exactly the facts read, with PyPI's package address and the GitLab repository address on issue facts
test("MOD-reuse-facts registryFacts - PyPI candidate facts include registry, licence, release, issue and adoption facts", async () => {
  const registry = fakeRegistry({
    [PYPI_REPORT_HELPER]: {
      info: { license: "BSD-3-Clause", version: "2.0.0", downloads: { last_month: 321 } },
      releases: {
        "1.0.0": [{ upload_time_iso_8601: "2021-03-04T00:00:00Z" }],
        "2.0.0": [{ upload_time_iso_8601: "2024-05-06T00:00:00Z" }],
      },
    },
  });
  const host = fakeRepositoryHost({ open: 1, closed: 4 });

  const result = await registryFacts(pypiCandidate, "MIT", { fetch: registry.fetch, connect: host.connect, now: () => READ });

  assert.deepEqual(result, {
    candidate: pypiCandidate,
    facts: [
      { candidate: "report-helper", ecosystem: "pypi", what: "exists", value: "yes", address: PYPI_REPORT_HELPER, read: READ },
      { candidate: "report-helper", ecosystem: "pypi", what: "licence", value: "BSD-3-Clause", address: PYPI_REPORT_HELPER, read: READ },
      { candidate: "report-helper", ecosystem: "pypi", what: "first release", value: "1.0.0 on 2021-03-04", address: PYPI_REPORT_HELPER, read: READ },
      { candidate: "report-helper", ecosystem: "pypi", what: "latest release", value: "2.0.0 on 2024-05-06", address: PYPI_REPORT_HELPER, read: READ },
      { candidate: "report-helper", ecosystem: "pypi", what: "releases", value: "2", address: PYPI_REPORT_HELPER, read: READ },
      { candidate: "report-helper", ecosystem: "pypi", what: "open issues", value: "1", address: "https://gitlab.example.org/acme/report-helper", read: READ },
      { candidate: "report-helper", ecosystem: "pypi", what: "closed issues", value: "4", address: "https://gitlab.example.org/acme/report-helper", read: READ },
      { candidate: "report-helper", ecosystem: "pypi", what: "issues filed at", value: "https://gitlab.example.org/acme/report-helper/-/issues", address: "https://gitlab.example.org/acme/report-helper", read: READ },
      { candidate: "report-helper", ecosystem: "pypi", what: "adoption", value: "321 downloads last month", address: PYPI_REPORT_HELPER, read: READ },
    ],
    licence: "compatible",
    found: true,
    blocked: null,
  });
  assert.deepEqual(registry.requests, [PYPI_REPORT_HELPER]);
  assert.deepEqual(host.connected, ["https://gitlab.example.org/acme/report-helper"]);
});

// TST-435003 - level: unit - module: MOD-reuse-facts
// guards: UC-022; DUE DILIGENCE IS FETCHED, NOT RECALLED
// given: npm answers 404 for missing-lib
// input: registryFacts({ name: "missing-lib", ecosystem: "npm", repository: null }, "MIT")
// expect: found false, blocked null, one exists fact saying the name may be invented, with the exact address queried; no licence is checked because no candidate licence was read
test("MOD-reuse-facts registryFacts - an unknown registry candidate is not found with the address queried", async () => {
  const registry = fakeRegistry({});

  const result = await registryFacts({ name: "missing-lib", ecosystem: "npm", repository: null },
    "MIT", { fetch: registry.fetch, connect: async () => assert.fail("no repository host is reached"), now: () => READ });

  assert.deepEqual(result, {
    candidate: { name: "missing-lib", ecosystem: "npm", repository: null },
    facts: [
      { candidate: "missing-lib", ecosystem: "npm", what: "exists", value: "not found - the name may be invented",
        address: NPM_MISSING, read: READ },
    ],
    licence: "not checked",
    found: false,
    blocked: null,
  });
  assert.deepEqual(registry.requests, [NPM_MISSING]);
});

// TST-435004 - level: unit - module: MOD-reuse-facts
// guards: UC-022; DUE DILIGENCE IS FETCHED, NOT RECALLED; A REUSE DECISION RECORDS ITS DUE DILIGENCE
// given: npm refuses a browser's request for blocked-lib with TypeError("Failed to fetch")
// input: registryFacts({ name: "blocked-lib", ecosystem: "npm", repository: null }, "MIT")
// expect: blocked names npm, the address and the reason; found false; no facts are returned
test("MOD-reuse-facts registryFacts - a registry refused by the browser returns blocked with no facts", async () => {
  const registry = fakeRegistry({ [NPM_BLOCKED]: new TypeError("Failed to fetch") });

  const result = await registryFacts({ name: "blocked-lib", ecosystem: "npm", repository: null },
    "MIT", { fetch: registry.fetch, connect: async () => assert.fail("no repository host is reached"), now: () => READ });

  assert.deepEqual(result, {
    candidate: { name: "blocked-lib", ecosystem: "npm", repository: null },
    facts: [],
    licence: "not checked",
    found: false,
    blocked: "npm at https://registry.npmjs.org/blocked-lib: Failed to fetch",
  });
  assert.deepEqual(registry.requests, [NPM_BLOCKED]);
});

// TST-435005 - level: unit - module: MOD-reuse-facts
// guards: A REUSED LICENCE IS SHOWN AGAINST THE PRODUCT'S
// given: licences.md lists MIT as compatible with MIT but does not list GPL-3.0 as compatible with MIT, and a product may have no licence
// input: licenceVerdict("MIT", "MIT"), licenceVerdict("GPL-3.0", "MIT"), licenceVerdict("MIT", null)
// expect: compatible, not known to be compatible, not checked
test("MOD-reuse-facts licenceVerdict - compatible, not known and not checked are read from licences.md", () => {
  assert.equal(licenceVerdict("MIT", "MIT"), "compatible");
  assert.equal(licenceVerdict("GPL-3.0", "MIT"), "not known to be compatible");
  assert.equal(licenceVerdict("MIT", null), "not checked");
});
