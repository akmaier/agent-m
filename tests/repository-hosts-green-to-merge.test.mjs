// MOD-repository-hosts' RepositoryInfo `greenToMerge` and WebLinks `branchProtection` (ITM-1170), as docs/architecture/MOD-repository-hosts.md states them: "`greenToMerge` whether the server refuses a merge into the
// default branch until its required checks have passed — on GitHub a protection of that branch, or an active rule of a ruleset that applies to it, that requires status checks; on GitLab the project's setting that
// pipelines must succeed —, `null` where the stored token may not read it"; "`branchProtection` the page on which the rule behind `greenToMerge` is set". UC-042 step 2: a token's *Test* "sends one harmless request",
// and the settings page's *Test* of a repository token is one call of `repositoryInfo` (src/settings-pages/settings.mjs).
// Run: node --test tests/repository-hosts-green-to-merge.test.mjs
//
// Module: MOD-repository-hosts
// Guards: UC-024; UC-042; CODE ENTERS THE DEFAULT BRANCH THROUGH A PULL REQUEST WITH GREEN CI; A BROWSER SETTING IS TESTED AND CLEARED WHERE IT IS SHOWN
// Level: unit
//
// Deterministic, no network: GitHub's GraphQL API and REST API and GitLab's REST API v4 are fakes of `fetch` that record every request. Readings the texts leave open, which the tests state (the pull request names them):
//   - On GitHub with a token, repositoryInfo asks the GraphQL API once (ITM-1170, "The reading taken"). The branch's protection is read from the default branch's `refUpdateRule` — the protection rule as a reader
//     of the repository may see it, with the contexts of its required status checks — and its `rules`, the active rules of the rulesets that apply to it; GitHub gives `branchProtectionRule` to administrators only.
//     Either requiring a check makes greenToMerge true; both read and neither requiring one, false; an error naming either field, or no default branch, null.
//   - Without a token GitHub's GraphQL API takes no request, so repositoryInfo reads the repository's REST record, and greenToMerge is null.
//   - On GitLab, greenToMerge is `only_allow_merge_if_pipeline_succeeds` of the project's record, and null where the record does not hold it.
//   - branchProtection is GitHub's <repository>/settings/branches and GitLab's <project>/-/settings/merge_requests, where "Pipelines must succeed" is set.
// Each test states its input and its expected result before it runs. The counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { parseAddress, connect } from "../src/repository-hosts/index.mjs";

const GITHUB_TOKEN = "github_pat_GREENtoMERGE0123456789abcdef";
const GITLAB_TOKEN = "glpat-GREENtoMERGE0123456789";
const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

async function using(fetchFn, run) {
  const real = globalThis.fetch;
  globalThis.fetch = fetchFn;
  try { return await run(); } finally { globalThis.fetch = real; }
}

// The default branch of each fixture repository, as GitHub's GraphQL API gives `defaultBranchRef` with `refUpdateRule` and `rules` (docs.github.com/en/graphql/reference/objects#ref), and the errors it adds.
const REF = {
  protected: { ref: { name: "main", refUpdateRule: { requiredStatusCheckContexts: ["agent-m tests"] }, rules: { nodes: [] } } },
  ruleset: { ref: { name: "trunk", refUpdateRule: null, rules: { nodes: [{ type: "PULL_REQUEST" }, { type: "REQUIRED_STATUS_CHECKS" }] } } },
  "no-checks": { ref: { name: "main", refUpdateRule: { requiredStatusCheckContexts: [] }, rules: { nodes: [{ type: "DELETION" }] } } },
  open: { ref: { name: "main", refUpdateRule: null, rules: { nodes: [] } } },
  "rules-unread": { ref: { name: "main", refUpdateRule: null, rules: null },
    errors: [{ type: "FORBIDDEN", path: ["repository", "defaultBranchRef", "rules"], message: "Resource not accessible by personal access token" }] },
  empty: { ref: null },
};

// A fake GitHub: the GraphQL API answers the repository's fields for each fixture; the REST API answers the repository's record, its default branch with its protection and the rules of that branch — what a
// repositoryInfo with a REST call per part would ask for.
function fakeGitHub() {
  const requests = [];
  const fetch = async (input, init = {}) => {
    const url = new URL(String(input));
    const body = init.body ? JSON.parse(init.body) : null;
    requests.push({ method: init.method ?? "GET", path: url.pathname, query: body?.query ?? null, authorization: new Headers(init.headers).get("authorization") });
    if (url.pathname === "/graphql") {
      const fixture = REF[body.variables.name];
      if (!fixture) return json({ data: { repository: null }, errors: [{ type: "NOT_FOUND", path: ["repository"], message: "Could not resolve to a Repository" }] });
      return json({ data: { repository: { visibility: body.variables.name === "open" ? "PUBLIC" : "PRIVATE", isPrivate: body.variables.name !== "open", viewerPermission: body.variables.name === "open" ? "READ" : "WRITE",
        isArchived: false, description: `the ${body.variables.name} fixture`, defaultBranchRef: fixture.ref } }, ...(fixture.errors ? { errors: fixture.errors } : {}) });
    }
    const [, , owner, name, ...rest] = url.pathname.split("/");
    if (!REF[name]) return json({ message: "Not Found" }, 404);
    if (rest.length === 0) return json({ default_branch: REF[name].ref?.name ?? "main", visibility: name === "open" ? "public" : "private", private: name !== "open", archived: false, description: `${owner}'s ${name}`, permissions: { push: false } });
    return json(rest[0] === "branches" ? { name: rest[1], protected: false } : []);
  };
  return { fetch, requests };
}
const github = (name, token = GITHUB_TOKEN) => connect(parseAddress(`https://github.com/acme/${name}`), token ? { token, tokenName: "acme's token" } : {});

// TST-1170001 · level: unit · module: MOD-repository-hosts
// guards: UC-042; A BROWSER SETTING IS TESTED AND CLEARED WHERE IT IS SHOWN
// given: a fake GitHub that answers the GraphQL API and the REST API; the repository acme/protected, whose default branch main requires the status check "agent-m tests"; a host with a token
// input: repositoryInfo()
// expect: one request, a POST to GitHub's GraphQL API with the token as Authorization, and no request to the REST API; the answer is { defaultBranch: "main", visibility: "private", canWrite: true, archived: false, description: "the protected fixture", greenToMerge: true }; counter-proof: a repositoryInfo that reads the record, the branch and its rules by a REST call each sends three requests
test("repositoryInfo on GitHub with a token is one request of the GraphQL API, and gives greenToMerge", async () => {
  const fake = fakeGitHub();
  const info = await using(fake.fetch, () => github("protected").repositoryInfo());
  assert.deepEqual(info, { defaultBranch: "main", visibility: "private", canWrite: true, archived: false, description: "the protected fixture", greenToMerge: true });
  assert.equal(fake.requests.length, 1, `one request: ${JSON.stringify(fake.requests.map((r) => `${r.method} ${r.path}`))}`);
  assert.deepEqual([fake.requests[0].method, fake.requests[0].path, fake.requests[0].authorization], ["POST", "/graphql", `Bearer ${GITHUB_TOKEN}`]);
  assert.ok(!fake.requests.some((r) => r.path.startsWith("/repos/")), "no request to the REST API");
});

// TST-1170002 · level: unit · module: MOD-repository-hosts
// guards: UC-024; CODE ENTERS THE DEFAULT BRANCH THROUGH A PULL REQUEST WITH GREEN CI
// given: GitHub repositories whose default branch is protected with a required check (protected), covered by a ruleset with a rule REQUIRED_STATUS_CHECKS and no protection (ruleset), protected without a required check (no-checks), neither protected nor covered (open), with rules the token may not read (rules-unread), and without any branch (empty)
// input: repositoryInfo() of each, with a token
// expect: greenToMerge true, true, false, false, null, null; each in one request; known positive: open is read as public and not writable, its default branch main
test("greenToMerge on GitHub: a required check of the branch's protection or of a ruleset is true, neither is false, what cannot be read is null", async () => {
  const fake = fakeGitHub();
  const expected = { protected: true, ruleset: true, "no-checks": false, open: false, "rules-unread": null, empty: null };
  for (const [name, green] of Object.entries(expected)) {
    fake.requests.length = 0;
    const info = await using(fake.fetch, () => github(name).repositoryInfo());
    assert.equal(info.greenToMerge, green, name);
    assert.equal(fake.requests.length, 1, `${name}: one request`);
    if (name === "open") assert.deepEqual([info.defaultBranch, info.visibility, info.canWrite], ["main", "public", false], "known positive: the repository's other fields");
  }
});

// TST-1170003 · level: unit · module: MOD-repository-hosts
// guards: UC-042
// given: the fake GitHub; the repository acme/open read without a token; the repository acme/missing, which the fake does not hold, read with a token
// input: repositoryInfo() of acme/open without a token; repositoryInfo() of acme/missing with one
// expect: without a token, one request to the REST record of the repository, none to the GraphQL API, and greenToMerge null, the default branch main; acme/missing fails with NotFound after one request
test("repositoryInfo on GitHub without a token reads the REST record with greenToMerge null, and a repository the token cannot see is NotFound", async () => {
  const fake = fakeGitHub();
  const info = await using(fake.fetch, () => github("open", null).repositoryInfo());
  assert.deepEqual(fake.requests.map((r) => `${r.method} ${r.path}`), ["GET /repos/acme/open"]);
  assert.equal(fake.requests[0].authorization, null);
  assert.deepEqual([info.defaultBranch, info.canWrite, info.greenToMerge], ["main", false, null]);
  fake.requests.length = 0;
  const failure = await using(fake.fetch, () => github("missing").repositoryInfo().then(() => null, (error) => error));
  assert.equal(failure?.name, "NotFound");
  assert.equal(fake.requests.length, 1);
});

// A fake GitLab server: "Get a single project" with the setting `only_allow_merge_if_pipeline_succeeds` as `pipelines` gives it (absent where undefined).
function fakeGitLab(pipelines) {
  const requests = [];
  const fetch = async (input) => {
    requests.push(new URL(String(input)).pathname);
    return json({ id: 7, default_branch: "main", visibility: "private", archived: false, description: "", permissions: { project_access: { access_level: 40 } },
      ...(pipelines === undefined ? {} : { only_allow_merge_if_pipeline_succeeds: pipelines }) });
  };
  return { fetch, requests };
}

// TST-1170004 · level: unit · module: MOD-repository-hosts
// guards: UC-024; UC-042
// given: a GitLab project whose setting "Pipelines must succeed" is on, one where it is off, and one whose record does not hold the setting; a host with the project's token
// input: repositoryInfo() of each
// expect: greenToMerge true, false, null; each in one request, to the project's record; known positive: the default branch main and canWrite true for a Maintainer
test("greenToMerge on GitLab is the project's setting that pipelines must succeed, null where its record does not hold it", async () => {
  for (const [pipelines, green] of [[true, true], [false, false], [undefined, null]]) {
    const fake = fakeGitLab(pipelines);
    const info = await using(fake.fetch, () => connect(parseAddress("https://gitlab.example.org/acme/tool"), { token: GITLAB_TOKEN }).repositoryInfo());
    assert.equal(info.greenToMerge, green, String(pipelines));
    assert.deepEqual(fake.requests, ["/api/v4/projects/acme%2Ftool"]);
    assert.deepEqual([info.defaultBranch, info.canWrite], ["main", true], "known positive");
  }
});

// TST-1170005 · level: unit · module: MOD-repository-hosts
// guards: UC-024
// given: the repository https://github.com/acme/product and the GitLab project https://gitlab.example.org/space/group/tool, each connected with a token; known positive: each one's Actions or pipelines page
// input: webLinks().branchProtection of each
// expect: https://github.com/acme/product/settings/branches and https://gitlab.example.org/space/group/tool/-/settings/merge_requests; neither holds the token; no request is made
test("webLinks gives the page on which the rule behind greenToMerge is set", async () => {
  const requests = [];
  await using(async (input) => { requests.push(String(input)); throw new Error("webLinks reaches no server"); }, () => {
    const gh = connect(parseAddress("https://github.com/acme/product"), { token: GITHUB_TOKEN }).webLinks();
    const gl = connect(parseAddress("https://gitlab.example.org/space/group/tool"), { token: GITLAB_TOKEN }).webLinks();
    assert.equal(gh.actions, "https://github.com/acme/product/actions", "known positive");
    assert.equal(gl.actions, "https://gitlab.example.org/space/group/tool/-/pipelines", "known positive");
    assert.equal(gh.branchProtection, "https://github.com/acme/product/settings/branches");
    assert.equal(gl.branchProtection, "https://gitlab.example.org/space/group/tool/-/settings/merge_requests");
    assert.ok(!gh.branchProtection.includes(GITHUB_TOKEN) && !gl.branchProtection.includes(GITLAB_TOKEN));
  });
  assert.deepEqual(requests, []);
});
