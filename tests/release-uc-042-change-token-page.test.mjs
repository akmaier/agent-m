// Independent release tests of UC-042 step 2's Change of a repository token, written by a participant who implemented none of it.
// Module: MOD-settings-pages
// Guards: UC-042
// Level: release
// Run: node --test tests/release-uc-042-change-token-page.test.mjs
//
// UC-042 step 2: "*Change* opens the same fields and the same notice as the use case that set it up, in place; storing a token
// asks for its expiry date, preset to the 90 days of the prefilled link." The use cases that set the tokens up: UC-014 step 7
// (the instance's GitHub token), UC-001 step 3 (a GitHub product's), UC-001 3c (a GitLab project's). The dashboard is opened
// through the public app harness; every check reads what the Settings page shows after a person's Change click.
//
// GitHub's page for a new fine-grained token, as GitHub documents its prefill ("Pre-filling fine-grained personal access token
// details using URL parameters", docs.github.com, Managing your personal access tokens): https://github.com/settings/personal-
// access-tokens/new with `name` (at most 40 characters), `description`, `target_name` (the resource owner), `expires_in` (days)
// and one parameter per permission named as GitHub names it — `contents`, `issues`, `pull_requests`, `actions`, `workflows`,
// `secrets`, `metadata` — with the access level `read` or `write` as its value; `write` includes `read`. GitHub documents no
// parameter that selects repositories, so the repository to pick is named beside the link (THE REPOSITORY CHOICE IS SPELLED OUT).

import test from "node:test";
import assert from "node:assert/strict";
import { openDashboard, repoServer, richDocument, press, tokenSetting } from "./app-harness.mjs";

const INSTANCE = "akmaier/agent-m";
const NEW_TOKEN_PAGE = "https://github.com/settings/personal-access-tokens/new";
// ONE GITHUB TOKEN SERVES EVERY FEATURE: Contents, Issues and Pull requests read and write, Actions, Workflows and Secrets read and
// write, Metadata read — in GitHub's parameter names, write including read.
const PERMISSIONS = { contents: "write", issues: "write", pull_requests: "write", actions: "write", workflows: "write", secrets: "write", metadata: "read" };
const DETAILS = ["name", "description", "target_name", "expires_in"];
const inNinetyDays = () => new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10);

const children = (node) => (node?.children ?? []).filter((child) => typeof child === "object" && child);
const all = (root, keep, found = []) => {
  for (const child of children(root)) { if (keep(child)) found.push(child); all(child, keep, found); }
  return found;
};
const hasClass = (name) => (node) => node.className?.split(/\s+/).includes(name);
// What a person sees of a line: every element under it none of whose ancestors up to the line is hidden.
const visible = (root, found = []) => {
  for (const child of children(root)) if (!child.hidden) { found.push(child); visible(child, found); }
  return found;
};
const shownText = (root) => (root?.children ?? []).map((child) => (typeof child === "string" ? child
  : child && typeof child === "object" && !child.hidden ? (children(child).length ? shownText(child) : child.textContent) : "")).join(" ");
const shownLinks = (line) => visible(line).filter((node) => node.localName === "a" && node.href);
const tokenPageLinks = (line, prefix) => shownLinks(line).filter((link) => String(link.href).startsWith(prefix));

// The Settings page's Repositories pane with `entries` in this browser, and the line titled `title`.
async function line(entries, title) {
  const server = await repoServer({ files: { "SPEC.md": "# Fixture specification\n", "docs/use-cases/README.md": "# Use cases\n" } });
  const page = await openDashboard({ server, hash: "#uc", entries });
  const dom = richDocument(), main = dom.byId("main"), replace = main.replaceChildren.bind(main);
  let mounted = [];
  main.replaceChildren = (...nodes) => { mounted = nodes; replace(...nodes); };
  await page.go("#settings");
  const pane = mounted.find((node) => hasClass("settings-tab-panel")(node) && node.textContent.includes("Repositories"));
  assert.ok(pane, "the public Settings route mounts Repositories");
  const found = all(pane, hasClass("settings-repository")).find((node) => children(node).some((child) => child.localName === "h3" && child.textContent === title));
  assert.ok(found, `the Repositories pane shows the line ${title}`);
  return { server, line: found };
}

async function change(view) {
  const buttons = visible(view.line).filter((node) => node.localName === "button" && node.textContent === "Change");
  assert.equal(buttons.length, 1, "the line shows one Change");
  await press(view.server, buttons[0]);
}

// The one GitHub new-token link Change shows, as its query: the page, the details, and exactly ONE GITHUB TOKEN SERVES EVERY
// FEATURE's permissions — nothing more, nothing less.
function githubTokenPage(view, { name, description, owner }) {
  const links = tokenPageLinks(view.line, "https://github.com/settings/personal-access-tokens/new");
  assert.equal(links.length, 1, "failure node: Change shows one link to GitHub's page for a new fine-grained token");
  const url = new URL(links[0].href);
  assert.equal(`${url.origin}${url.pathname}`, NEW_TOKEN_PAGE);
  const query = Object.fromEntries(url.searchParams);
  assert.equal(url.searchParams.size, Object.keys(query).length, "no parameter is given twice");
  assert.deepEqual(Object.fromEntries(Object.entries(query).filter(([key]) => !DETAILS.includes(key))), PERMISSIONS,
    "failure node: the link asks for exactly the permissions every feature needs");
  if (name instanceof RegExp) assert.match(query.name, name); else assert.equal(query.name, name);
  assert.ok([...query.name].length <= 40, "the name stays within GitHub's 40 characters");
  if (description === undefined) assert.ok(query.description?.trim(), "a description is prefilled");
  else assert.equal(query.description, description);
  assert.equal(query.target_name, owner, "the repository's owner is the token's owner");
  assert.equal(query.expires_in, "90", "the prefilled link asks for 90 days");
  return query;
}

// The same notice as the use case that set the token up (UC-014 step 8, UC-001 step 3): every Pages site of the owner reads what
// this browser stores, acknowledged with I have read this; the expiry the person confirms is preset to 90 days.
function sameFieldsAndNotice(view) {
  const text = shownText(view.line);
  assert.match(text, /Pages site/i, "Change shows the shared Pages origin notice");
  assert.match(text, /I have read this/);
  const expiry = all(view.line, (node) => node.localName === "input" && node.type === "date");
  assert.equal(expiry.length, 1, "the line asks for one expiry date");
  return expiry[0];
}

// TST-1803101
// level: release
// module: MOD-settings-pages
// guards: UC-042; UC-014; THE TOKEN LINK IS PREFILLED; ONE GITHUB TOKEN SERVES EVERY FEATURE; THE REPOSITORY CHOICE IS SPELLED OUT; A TOKEN IS SCOPED TO WHAT IT WRITES
// given: the instance akmaier/agent-m with its GitHub token stored in this browser and no expiry recorded
// input: the person opens Settings, Repositories, and presses Change on the line GitHub token
// expect: before Change no new-token page is linked; after it, one link to https://github.com/settings/personal-access-tokens/new with name "Agent M · akmaier/agent-m", a description, target_name akmaier, expires_in 90 and exactly contents, issues, pull_requests, actions, workflows, secrets write and metadata read; beside it "Only select repositories" and akmaier/agent-m; the shared Pages notice with I have read this; the expiry preset to 90 days from today
test("TST-1803101: Change of the instance's GitHub token opens UC-014's prefilled token page, its notice and a 90-day expiry", async () => {
  const view = await line({}, "GitHub token");
  assert.equal(tokenPageLinks(view.line, "https://github.com/settings/personal-access-tokens/new").length, 0,
    "known state before the click: the token page belongs to what Change opens");
  await change(view);
  githubTokenPage(view, { name: `Agent M · ${INSTANCE}`, owner: "akmaier" });
  const text = shownText(view.line);
  assert.match(text, /Only select repositories/, "failure node: the repository choice is spelled out beside the link");
  assert.ok(text.includes(INSTANCE), "the instance's repository is named as the one to pick");
  assert.equal(sameFieldsAndNotice(view).value, inNinetyDays());
});

// TST-1803102
// level: release
// module: MOD-settings-pages
// guards: UC-042; UC-001; THE TOKEN LINK IS PREFILLED; ONE GITHUB TOKEN SERVES EVERY FEATURE; THE REPOSITORY CHOICE IS SPELLED OUT; A GITHUB PRODUCT USES A TOKEN OF ITS OWN
// given: a GitHub product alice/thesis-tool whose own token is stored in this browser, with no expiry recorded
// input: the person presses Change on the line GitHub token: alice/thesis-tool
// expect: one link to GitHub's new-token page with name "Agent M · alice/thesis-tool", description "Agent M for the product alice/thesis-tool: reviews, commits, issues, pull requests and runs of the work you start in it.", target_name alice, expires_in 90 and exactly every feature's permissions; beside it "Only select repositories" and alice/thesis-tool, not the instance; the notice; the expiry preset to 90 days
test("TST-1803102: Change of a GitHub product's token opens UC-001's prefilled token page for that product", async () => {
  const view = await line(tokenSetting("github-token:alice/thesis-tool", "github_pat_PRODUCT0123456789abcdefghij", { name: "Agent M · alice/thesis-tool" }),
    "GitHub token: alice/thesis-tool");
  await change(view);
  githubTokenPage(view, { name: "Agent M · alice/thesis-tool", owner: "alice",
    description: "Agent M for the product alice/thesis-tool: reviews, commits, issues, pull requests and runs of the work you start in it." });
  const text = shownText(view.line);
  assert.match(text, /Only select repositories/);
  assert.ok(text.includes("alice/thesis-tool"), "the product's repository is named as the one to pick");
  assert.ok(!text.includes(INSTANCE), "the instance is not among the repositories to pick");
  assert.equal(sameFieldsAndNotice(view).value, inNinetyDays());
});

// TST-1803103
// level: release
// module: MOD-settings-pages
// guards: UC-042; UC-001; THE TOKEN LINK IS PREFILLED
// given: a GitHub product alice/a-very-long-repository-name-for-testing (55 characters as "Agent M · alice/…") with its own token stored
// input: the person presses Change on that product's token line
// expect: the prefilled name drops the owner and then the end of the repository's name: it begins "Agent M · a-very-long", holds no "alice/", and has at most 40 characters
test("TST-1803103: a product's prefilled token name stays within GitHub's 40 characters by dropping the owner first", async () => {
  const path = "alice/a-very-long-repository-name-for-testing";
  const view = await line(tokenSetting(`github-token:${path}`, "github_pat_PRODUCT0123456789abcdefghij", { name: "Agent M" }), `GitHub token: ${path}`);
  await change(view);
  const query = githubTokenPage(view, { name: /^Agent M · a-very-long/, owner: "alice",
    description: `Agent M for the product ${path}: reviews, commits, issues, pull requests and runs of the work you start in it.` });
  assert.ok(!query.name.includes("alice/"), "the owner is dropped first");
});

// TST-1803104
// level: release
// module: MOD-settings-pages
// guards: UC-042; UC-001; A GITLAB PRODUCT USES A PROJECT ACCESS TOKEN
// given: a GitLab project gitlab.example.test/group/product whose project access token is stored in this browser
// input: the person presses Change on the line GitLab token: gitlab.example.test/group/product
// expect: Change adds one link to the project's Access tokens page https://gitlab.example.test/group/product/-/settings/access_tokens, beside it role Maintainer and scope api; no GitHub token page; the notice; the expiry preset to 90 days
test("TST-1803104: Change of a GitLab project token opens the project's Access tokens page with UC-001 3c's settings", async () => {
  const project = "gitlab.example.test/group/product";
  const view = await line(tokenSetting(`gitlab-token:${project}`, "glpat-PRODUCT0123456789abcd", { name: "Agent M" }), `GitLab token: ${project}`);
  const before = tokenPageLinks(view.line, `https://${project}/-/settings/access_tokens`).length; // Renew of 1b links it already
  await change(view);
  assert.equal(tokenPageLinks(view.line, `https://${project}/-/settings/access_tokens`).length, before + 1,
    "failure node: Change shows one more link to the project's Access tokens page");
  assert.equal(tokenPageLinks(view.line, "https://github.com/settings/personal-access-tokens/new").length, 0, "a GitLab token is not created on GitHub");
  const text = shownText(view.line);
  assert.match(text, /Maintainer/);
  assert.match(text, /\bapi\b/);
  assert.equal(sameFieldsAndNotice(view).value, inNinetyDays());
});
