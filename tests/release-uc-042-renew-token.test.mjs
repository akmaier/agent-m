// Independent release tests of UC-042 alternatives 1a and 1b — Renew of an expiring or refused token —, written by a participant
// who implemented none of it.
// Module: MOD-settings-pages; MOD-site-frame
// Guards: UC-042
// Level: release
// Run: node --test tests/release-uc-042-renew-token.test.mjs
//
// UC-042 1a: "Every dashboard page shows a line *Your GitHub token expires on …* with **Renew** — a product's pages the same line
// for the product's own token —; it opens GitHub's page for a new token prefilled as when the token was set up — the instance's as
// in UC-014, step 7, a product's as in UC-001, step 3 — with the repositories to pick named beside it, and the paste field for the
// new value."
// UC-042 1b: "The line says which token, and **Renew** as in 1a; for a GitLab project token, the project's *Access tokens* page."
// Read here: "as in 1a" carries the paste field over to a GitLab project token; its repository choice does not apply, since a
// project access token is made for its one project (UC-001 3c).
//
// UC-014 step 7 prefills name, description, expiry and the permissions of ONE GITHUB TOKEN SERVES EVERY FEATURE and names
// `<owner>/agent-m` beside *Only select repositories*; UC-001 step 3 prefills the same permissions, 90 days, the product's owner,
// the name `Agent M · <owner>/<repository>` and the description `Agent M for the product <owner>/<repository>: reviews, commits,
// issues, pull requests and runs of the work you start in it.`, and names the product repository — nothing else.
//
// GitHub's page for a new fine-grained token, as GitHub documents its prefill ("Pre-filling fine-grained personal access token
// details using URL parameters", docs.github.com): https://github.com/settings/personal-access-tokens/new with `name`,
// `description`, `target_name` (the resource owner), `expires_in` (days) and one parameter per permission — `contents`, `issues`,
// `pull_requests`, `actions`, `workflows`, `secrets`, `metadata` — valued `read` or `write`. No parameter selects repositories,
// which is why they are named beside the link. The bare list https://github.com/settings/personal-access-tokens is not that page.
//
// Renew is what a person sees and activates on the line: a link that opens GitHub's page itself, or a button after whose press the
// page shows the link. Either way, where the link is shown, the repositories to pick and the paste field are shown beside it; the
// paste field is the one whose pasted value, stored from there, becomes the token this browser holds. The dashboard runs in tests/app-harness.mjs; every request is answered by a fixture, none leaves the process.

import test from "node:test";
import assert from "node:assert/strict";
import { openDashboard, repoServer, richDocument, press, setting, tokenSetting, TOKEN } from "./app-harness.mjs";

const INSTANCE = "akmaier/agent-m";
const PRODUCT = "alice/thesis-tool", PRODUCT_ADDRESS = `https://github.com/${PRODUCT}`;
const PRODUCT_TOKEN = "github_pat_PRODUCT0123456789abcdefghij";
const GL_ORIGIN = "https://gitlab.example.test", GL_PROJECT = "gitlab.example.test/group/product", GL_ADDRESS = `https://${GL_PROJECT}`;
const GL_ACCESS_TOKENS = `${GL_ADDRESS}/-/settings/access_tokens`;
const GL_TOKEN = "glpat-PRODUCT0123456789abcd";
// The new value the person pastes: a GitHub fine-grained token, or a GitLab project access token.
const newValue = (key) => (key.startsWith("gitlab-token:") ? "glpat-RENEWED0123456789abcd" : "github_pat_RENEWED0123456789abcdefghij");
const GITHUB_TOKENS = "https://github.com/settings/personal-access-tokens";
const NEW_TOKEN_PAGE = `${GITHUB_TOKENS}/new`;
// ONE GITHUB TOKEN SERVES EVERY FEATURE, in GitHub's parameter names; write includes read.
const PERMISSIONS = { contents: "write", issues: "write", pull_requests: "write", actions: "write", workflows: "write", secrets: "write", metadata: "read" };
const DETAILS = ["name", "description", "target_name", "expires_in"];
const INSTANCE_PAGE = { name: `Agent M · ${INSTANCE}`, owner: "akmaier", pick: INSTANCE };
const PRODUCT_PAGE = { name: `Agent M · ${PRODUCT}`, owner: "alice", pick: PRODUCT,
  description: `Agent M for the product ${PRODUCT}: reviews, commits, issues, pull requests and runs of the work you start in it.` };
const SOON = new Date(Date.now() + 5 * 86400000).toISOString().slice(0, 10);
const FILES = { "SPEC.md": "# Fixture specification\n", "docs/use-cases/README.md": "# Use cases\n" };
const json401 = (message) => new Response(JSON.stringify({ message }), { status: 401, headers: { "content-type": "application/json" } });

// ---------------------------------------------------------------- what a person sees of a part of the page

const unescape = (s) => s.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, "&");
const children = (node) => (node?.children ?? []).filter((child) => typeof child === "object" && child);
const visible = (root, found = []) => {
  for (const child of children(root)) if (!child.hidden) { found.push(child); visible(child, found); }
  return found;
};
const shownText = (root) => (root?.children ?? []).map((child) => (typeof child === "string" ? unescape(child.replace(/<[^>]+>/g, " "))
  : child && typeof child === "object" && !child.hidden ? (children(child).length ? shownText(child) : child.textContent) : "")).join(" ");

// A part of the page as the person sees it: its text, its links, its buttons and its fields. `root` holds element nodes; an
// element the page filled with an HTML string is read from that string, without elements marked hidden.
function seen(root) {
  if (root.html !== undefined) {
    const html = String(root.html).replace(/<(\w+)\b[^>]*\shidden\b[^>]*>[\s\S]*?<\/\1>/g, "");
    return {
      text: unescape(html.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " "),
      links: [...html.matchAll(/<a\b[^>]*\shref="([^"]*)"[^>]*>([\s\S]*?)<\/a>/g)].map((m) => ({ href: unescape(m[1]), text: unescape(m[2].replace(/<[^>]+>/g, "")) })),
      buttons: [],
      fields: [...html.matchAll(/<input\b[^>]*>/g)].map((m) => ({ type: /\stype="([^"]*)"/.exec(m[0])?.[1] ?? "text",
        value: unescape(/\svalue="([^"]*)"/.exec(m[0])?.[1] ?? ""), disabled: /\sdisabled\b/.test(m[0]), readOnly: /\sreadonly\b/.test(m[0]) })),
    };
  }
  const shown = visible(root);
  return {
    text: shownText(root).replace(/\s+/g, " "),
    links: shown.filter((node) => node.localName === "a" && node.href).map((node) => ({ href: String(node.href), text: node.textContent })),
    buttons: shown.filter((node) => node.localName === "button"),
    fields: shown.filter((node) => node.localName === "input"),
  };
}
const isRenew = (text) => /^\s*Renew\b/.test(text ?? "");

// The element `id` of the page, with what the page last put into it: element nodes, or an HTML string.
function tracked(dom, id) {
  const element = dom.byId(id);
  let nodes = null;
  const replace = element.replaceChildren.bind(element), append = element.append.bind(element);
  element.replaceChildren = (...items) => { nodes = items; replace(...items); };
  element.append = (...items) => { nodes = [...(nodes ?? []), ...items]; append(...items); };
  const inner = Object.getOwnPropertyDescriptor(element, "innerHTML");
  Object.defineProperty(element, "innerHTML", { configurable: true, enumerable: true, get: inner.get,
    set(value) { nodes = null; inner.set.call(element, value); } });
  return () => (nodes ? { children: nodes } : { html: element.innerHTML });
}

// ---------------------------------------------------------------- the dashboard

// A dashboard page at `hash` (with `search`), this browser holding `entries`; the frame's notice place and <main> are tracked.
async function dashboard({ server, entries, search = "", hash }) {
  const page = await openDashboard({ server, hash: "#uc", token: null, search, entries });
  const dom = richDocument();
  const banner = tracked(dom, "token-banner"), main = tracked(dom, "main");
  await page.go(hash);
  return { page, server, banner, main };
}

// The Settings page's Repositories pane, and in it the line titled `title`.
async function settingsLine(view, title) {
  await view.page.go("#settings");
  const mounted = view.main();
  const pane = children(mounted).find((node) => node.className?.split(/\s+/).includes("settings-tab-panel") && node.textContent.includes("Repositories"));
  assert.ok(pane, "the public Settings route mounts Repositories");
  const line = [pane, ...visible(pane)].find((node) => node.className?.split(/\s+/).includes("settings-repository")
    && children(node).some((child) => child.localName === "h3" && child.textContent === title));
  assert.ok(line, `the Repositories pane shows the line ${title}`);
  return line;
}

// The person activates Renew in `part()`: a link is followed — it must itself be the page asked for —, a button is pressed.
// -> the Renew link, or null after a button.
async function renew(server, part, what) {
  const shown = seen(part());
  const links = shown.links.filter((link) => isRenew(link.text)), buttons = shown.buttons.filter((button) => isRenew(button.textContent));
  assert.equal(links.length + buttons.length, 1, `failure node: the ${what} shows one Renew`);
  if (buttons.length) await press(server, buttons[0]);
  return links[0] ?? null;
}

// GitHub's page for a new fine-grained token, prefilled as `expected` (UC-014 step 7 or UC-001 step 3), is what every link to
// GitHub's token pages in `part` opens — at least one —, with the repository to pick and the paste field beside it.
function githubRenewal(part, expected, renewLink) {
  const shown = seen(part);
  const links = shown.links.filter((link) => link.href.startsWith(GITHUB_TOKENS));
  assert.ok(links.length >= 1, "failure node: Renew shows a link to GitHub's page for a new token");
  if (renewLink) assert.ok(links.some((link) => link.href === renewLink.href), "the Renew link is that link");
  for (const link of links) {
    const url = new URL(link.href);
    assert.equal(`${url.origin}${url.pathname}`, NEW_TOKEN_PAGE, "failure node: Renew opens the page for a new token, not the list of tokens");
    const query = Object.fromEntries(url.searchParams);
    assert.equal(url.searchParams.size, Object.keys(query).length, "no parameter is given twice");
    assert.deepEqual(Object.fromEntries(Object.entries(query).filter(([key]) => !DETAILS.includes(key))), PERMISSIONS,
      "failure node: exactly the permissions every feature needs");
    assert.equal(query.name, expected.name);
    assert.ok([...query.name].length <= 40, "within GitHub's 40 characters");
    if (expected.description) assert.equal(query.description, expected.description);
    else assert.ok(query.description?.trim() && !query.description.includes("for the product"), "the instance's description is prefilled");
    assert.equal(query.target_name, expected.owner, "the repository's owner is the token's owner");
    assert.equal(query.expires_in, "90", "the prefilled link asks for 90 days");
  }
  assert.match(shown.text, /Only select repositories/, "failure node: the repository choice is spelled out beside the link");
  // The repository to pick is named with the choice, after it — the token's name or the line's title, which name it before,
  // do not count.
  assert.ok(shown.text.slice(shown.text.search(/Only select repositories/)).includes(expected.pick),
    `failure node: ${expected.pick} is named as the repository to pick`);
}

// The paste field for the new value is beside the link in `part`: the person ticks what the notice there asks to be read, pastes
// a new value into its one text or password field that can be typed in, and presses its one Save or Store; this browser then
// holds that value as the token `key`. A field that only shows the stored token, with nothing to store it, is not that field.
async function pasted(server, part, key) {
  for (const box of seen(part).fields.filter((field) => field.type === "checkbox" && !field.checked)) { box.checked = true; await box.fire?.("change"); }
  const fields = seen(part).fields.filter((field) => ["password", "text"].includes(field.type || "text") && !field.disabled && !field.readOnly);
  assert.equal(fields.length, 1, "failure node: one field for the new value is beside the link");
  fields[0].value = newValue(key);
  await fields[0].fire?.("input"); await fields[0].fire?.("change");
  const stores = seen(part).buttons.filter((button) => /^\s*(Save|Store)\b/.test(button.textContent));
  assert.equal(stores.length, 1, "failure node: the pasted value is stored from beside the link");
  await press(server, stores[0]);
  assert.equal(JSON.parse(localStorage.getItem(`agent-m:${INSTANCE}:${key}`) ?? "{}").value, newValue(key),
    `failure node: the value pasted there replaces the stored ${key}`);
}

// The parts a dashboard page shows after Renew, the one holding a link to `prefix` first.
const holding = (view, prefix) => {
  const parts = [view.banner(), view.main()];
  return parts.find((part) => seen(part).links.some((link) => link.href.startsWith(prefix))) ?? parts[0];
};

// A fixture server's answer to a request that carries `token`: by the header GitHub reads, or the one GitLab reads.
const carries = (init, token) => Object.entries(init?.headers ?? {}).some(([name, value]) =>
  ["authorization", "private-token"].includes(name.toLowerCase()) && String(value).includes(token));
const GL_API = `/api/v4/projects/${encodeURIComponent(GL_PROJECT.slice(GL_PROJECT.indexOf("/") + 1))}`;
// The GitLab server of the project: it refuses the stored project token, and answers the project's metadata to any other one.
const gitlabRefusing = (url, init) => {
  if (url.origin !== GL_ORIGIN) return undefined;
  if (carries(init, GL_TOKEN)) return json401("401 Unauthorized");
  if ((init?.method ?? "GET") === "GET" && url.pathname === GL_API) return new Response(JSON.stringify({ path_with_namespace: GL_PROJECT.slice(GL_PROJECT.indexOf("/") + 1),
    default_branch: "main", visibility: "private", permissions: { project_access: { access_level: 40 }, group_access: null } }), { status: 200, headers: { "content-type": "application/json" } });
  return new Response(JSON.stringify({ message: "404 Not Found" }), { status: 404, headers: { "content-type": "application/json" } });
};
const gitlabEntries = () => ({ ...tokenSetting("github-token", TOKEN, { name: `Agent M · ${INSTANCE}` }), ...setting("products", [GL_ADDRESS]),
  ...tokenSetting(`gitlab-token:${GL_PROJECT}`, GL_TOKEN, { name: "Agent M" }) });
// What Renew of a GitLab project token shows in `part`: the project's Access tokens page, no GitHub token page.
function gitlabRenewal(part, renewLink) {
  const shown = seen(part);
  assert.ok(shown.links.some((each) => each.href === GL_ACCESS_TOKENS), "failure node: Renew shows the project's Access tokens page");
  if (renewLink) assert.equal(renewLink.href, GL_ACCESS_TOKENS, "the Renew link opens the project's Access tokens page");
  assert.ok(!shown.links.some((each) => each.href.startsWith(GITHUB_TOKENS)), "a GitLab project token is not renewed on GitHub");
}
async function pressTest(server, line) {
  const tests = seen(line).buttons.filter((button) => button.textContent === "Test");
  assert.equal(tests.length, 1, "the line shows one Test");
  await press(server, tests[0]);
  assert.match(seen(line).text, /Refused/, "the refusal is shown on the line");
}

// ---------------------------------------------------------------- 1a: a token expires within fourteen days

// TST-1803201
// level: release
// module: MOD-site-frame; MOD-settings-pages
// guards: UC-042; UC-014; A TOKEN'S EXPIRY IS WARNED OF IN ADVANCE; THE TOKEN LINK IS PREFILLED; ONE GITHUB TOKEN SERVES EVERY FEATURE; THE REPOSITORY CHOICE IS SPELLED OUT
// given: the instance akmaier/agent-m whose GitHub token, stored in this browser, expires in five days
// input: the person opens the dashboard's #spec page, activates Renew on the line that warns of the expiry, pastes a new value beside the link and stores it
// expect: the line says "Your GitHub token expires on <date>"; Renew opens https://github.com/settings/personal-access-tokens/new with name "Agent M · akmaier/agent-m", a description, target_name akmaier, expires_in 90, exactly contents, issues, pull_requests, actions, workflows, secrets write and metadata read; beside it "Only select repositories" and akmaier/agent-m, and one field whose pasted value, stored, is this browser's GitHub token
test("TST-1803201: Renew on a dashboard page opens UC-014's prefilled token page, names the instance and offers the paste field", async () => {
  const server = await repoServer({ files: FILES });
  const view = await dashboard({ server, hash: "#spec",
    entries: tokenSetting("github-token", TOKEN, { name: `Agent M · ${INSTANCE}`, expires: SOON }) });
  assert.match(seen(view.banner()).text, new RegExp(`Your GitHub token expires on ${SOON}`), "the line of 1a is shown");
  const link = await renew(server, view.banner, "expiry line");
  githubRenewal(holding(view, GITHUB_TOKENS), INSTANCE_PAGE, link);
  await pasted(server, holding(view, GITHUB_TOKENS), "github-token");
});

// TST-1803202
// level: release
// module: MOD-site-frame; MOD-settings-pages
// guards: UC-042; UC-001; A TOKEN'S EXPIRY IS WARNED OF IN ADVANCE; THE TOKEN LINK IS PREFILLED; ONE GITHUB TOKEN SERVES EVERY FEATURE; A GITHUB PRODUCT USES A TOKEN OF ITS OWN; A PRODUCT'S TOKEN IS NAMED AFTER THE PRODUCT
// given: the GitHub product alice/thesis-tool is chosen; its own token, stored in this browser, expires in five days; the instance's token in ninety
// input: the person opens the product's #spec page, activates Renew on the line that warns of the expiry, pastes a new value beside the link and stores it
// expect: the line names the product's token and "expires on <date>"; Renew opens GitHub's new-token page with name "Agent M · alice/thesis-tool", description "Agent M for the product alice/thesis-tool: reviews, commits, issues, pull requests and runs of the work you start in it.", target_name alice, expires_in 90 and exactly every feature's permissions; beside it "Only select repositories" and alice/thesis-tool, and one field whose pasted value, stored, is the product's token
test("TST-1803202: Renew on a product's page opens UC-001's prefilled token page for the product's own token", async () => {
  const server = await repoServer({ repo: PRODUCT, files: FILES });
  const view = await dashboard({ server, hash: "#spec", search: `?product=${encodeURIComponent(PRODUCT_ADDRESS)}`, entries: {
    ...tokenSetting("github-token", TOKEN, { name: `Agent M · ${INSTANCE}`, expires: new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10) }),
    ...setting("products", [PRODUCT_ADDRESS]),
    ...tokenSetting(`github-token:${PRODUCT}`, PRODUCT_TOKEN, { name: `Agent M · ${PRODUCT}`, expires: SOON }) } });
  const text = seen(view.banner()).text;
  assert.match(text, new RegExp(`expires on ${SOON}`), "the line of 1a is shown for the product's token");
  assert.ok(text.includes(PRODUCT), "the line is the product's token's");
  const link = await renew(server, view.banner, "expiry line");
  githubRenewal(holding(view, GITHUB_TOKENS), PRODUCT_PAGE, link);
  await pasted(server, holding(view, GITHUB_TOKENS), `github-token:${PRODUCT}`);
});

// TST-1803203
// level: release
// module: MOD-settings-pages
// guards: UC-042; UC-014; A TOKEN'S EXPIRY IS WARNED OF IN ADVANCE; THE TOKEN LINK IS PREFILLED; ONE GITHUB TOKEN SERVES EVERY FEATURE; THE REPOSITORY CHOICE IS SPELLED OUT
// given: the instance's GitHub token, stored in this browser, expires in five days
// input: the person opens Settings, Repositories, activates Renew on the line GitHub token, pastes a new value beside the link and stores it
// expect: within that line, Renew opens UC-014's prefilled new-token page (as TST-1803201), with "Only select repositories", akmaier/agent-m and one field whose pasted value, stored, is this browser's GitHub token
test("TST-1803203: Renew on the Settings line of an expiring instance token opens UC-014's prefilled page with the paste field", async () => {
  const server = await repoServer({ files: FILES });
  const view = await dashboard({ server, hash: "#uc", entries: tokenSetting("github-token", TOKEN, { name: `Agent M · ${INSTANCE}`, expires: SOON }) });
  const line = await settingsLine(view, "GitHub token");
  assert.ok(seen(line).text.includes(SOON), "the line shows the expiry date");
  const link = await renew(server, () => line, "line");
  githubRenewal(line, INSTANCE_PAGE, link);
  await pasted(server, line, "github-token");
});

// TST-1803204
// level: release
// module: MOD-settings-pages
// guards: UC-042; UC-001; THE TOKEN LINK IS PREFILLED; ONE GITHUB TOKEN SERVES EVERY FEATURE; A GITHUB PRODUCT USES A TOKEN OF ITS OWN; A PRODUCT'S TOKEN IS NAMED AFTER THE PRODUCT
// given: the GitHub product alice/thesis-tool whose own token, stored in this browser, expires in five days
// input: the person opens Settings, Repositories, activates Renew on the line GitHub token: alice/thesis-tool, pastes a new value beside the link and stores it
// expect: within that line, Renew opens UC-001's prefilled new-token page for alice/thesis-tool (as TST-1803202), with "Only select repositories", alice/thesis-tool — not akmaier/agent-m — and one field whose pasted value, stored, is the product's token
test("TST-1803204: Renew on the Settings line of an expiring product token opens UC-001's prefilled page for that product", async () => {
  const server = await repoServer({ repo: PRODUCT, files: FILES });
  const view = await dashboard({ server, hash: "#uc", entries: {
    ...tokenSetting("github-token", TOKEN, { name: `Agent M · ${INSTANCE}` }),
    ...tokenSetting(`github-token:${PRODUCT}`, PRODUCT_TOKEN, { name: `Agent M · ${PRODUCT}`, expires: SOON }) } });
  const line = await settingsLine(view, `GitHub token: ${PRODUCT}`);
  const link = await renew(server, () => line, "line");
  githubRenewal(line, PRODUCT_PAGE, link);
  assert.ok(!seen(line).text.includes(INSTANCE), "failure node: the instance is not among the repositories to pick");
  await pasted(server, line, `github-token:${PRODUCT}`);
});

// ---------------------------------------------------------------- 1b: a server refused a token

// TST-1803205
// level: release
// module: MOD-site-frame; MOD-repository-hosts
// guards: UC-042; UC-014; AN EXPIRED TOKEN IS NAMED AND ITS RENEWAL LINKED; THE TOKEN LINK IS PREFILLED; ONE GITHUB TOKEN SERVES EVERY FEATURE
// given: GitHub answers 401 Bad credentials to the instance's commit read with the stored token Agent M · akmaier/agent-m, and reads with any other token
// input: the person opens the dashboard's #uc page, activates Renew on the line that names the refused token, pastes a new value beside the link and stores it
// expect: the line names "Agent M · akmaier/agent-m"; Renew opens UC-014's prefilled new-token page, with "Only select repositories", akmaier/agent-m and one field whose pasted value, stored, is this browser's GitHub token
test("TST-1803205: a refused instance token is named on the page and Renew opens UC-014's prefilled page with the paste field", async () => {
  const server = await repoServer({ files: FILES, handlers: [(url, init) => (url.origin === "https://api.github.com"
    && url.pathname === `/repos/${INSTANCE}/commits/main` && carries(init, TOKEN) ? json401("Bad credentials") : undefined)] });
  const view = await dashboard({ server, hash: "#uc", entries: tokenSetting("github-token", TOKEN, { name: `Agent M · ${INSTANCE}` }) });
  assert.ok(seen(view.banner()).text.includes(`Agent M · ${INSTANCE}`), "the line says which token");
  const link = await renew(server, view.banner, "refusal line");
  githubRenewal(holding(view, GITHUB_TOKENS), INSTANCE_PAGE, link);
  await pasted(server, holding(view, GITHUB_TOKENS), "github-token");
});

// TST-1803206
// level: release
// module: MOD-settings-pages; MOD-repository-hosts
// guards: UC-042; UC-014; AN EXPIRED TOKEN IS NAMED AND ITS RENEWAL LINKED; THE TOKEN LINK IS PREFILLED; ONE GITHUB TOKEN SERVES EVERY FEATURE
// given: GitHub answers 401 Bad credentials to the instance repository read with the stored GitHub token, and reads with any other token
// input: the person presses Test on the Settings line GitHub token, activates Renew on that line, pastes a new value beside the link and stores it
// expect: the line shows Refused; Renew opens UC-014's prefilled new-token page, with "Only select repositories", akmaier/agent-m and one field whose pasted value, stored, is this browser's GitHub token
test("TST-1803206: after a refused Test, Renew on the Settings line opens UC-014's prefilled page with the paste field", async () => {
  let refused = false;
  const server = await repoServer({ files: FILES, handlers: [(url, init) => (refused && url.origin === "https://api.github.com"
    && url.pathname === `/repos/${INSTANCE}` && carries(init, TOKEN) ? json401("Bad credentials") : undefined)] });
  const view = await dashboard({ server, hash: "#uc", entries: tokenSetting("github-token", TOKEN, { name: `Agent M · ${INSTANCE}` }) });
  const line = await settingsLine(view, "GitHub token");
  refused = true;
  await pressTest(server, line);
  const link = await renew(server, () => line, "line");
  githubRenewal(line, INSTANCE_PAGE, link);
  await pasted(server, line, "github-token");
});

// TST-1803207
// level: release
// module: MOD-site-frame; MOD-repository-hosts
// guards: UC-042; UC-001; AN EXPIRED TOKEN IS NAMED AND ITS RENEWAL LINKED; A GITLAB PRODUCT USES A PROJECT ACCESS TOKEN
// given: the GitLab project gitlab.example.test/group/product is chosen; its server answers 401 to every request with the stored project access token, and the project to another token
// input: the person opens the project's #spec page, activates Renew on the line that names the refused token, pastes a new value beside the link and stores it
// expect: the line names the project; Renew opens https://gitlab.example.test/group/product/-/settings/access_tokens and links no GitHub token page; beside it one field whose pasted value, stored, is the project's token
test("TST-1803207: on a GitLab project's page, Renew of its refused token opens the project's Access tokens page, with the paste field", async () => {
  const server = await repoServer({ files: FILES, handlers: [gitlabRefusing] });
  const view = await dashboard({ server, hash: "#spec", search: `?product=${encodeURIComponent(GL_ADDRESS)}`, entries: gitlabEntries() });
  assert.ok(seen(view.banner()).text.includes(GL_PROJECT), "the line says which token");
  const link = await renew(server, view.banner, "refusal line");
  gitlabRenewal(holding(view, GL_ACCESS_TOKENS), link);
  await pasted(server, holding(view, GL_ACCESS_TOKENS), `gitlab-token:${GL_PROJECT}`);
});

// TST-1803208
// level: release
// module: MOD-settings-pages; MOD-repository-hosts
// guards: UC-042; UC-001; AN EXPIRED TOKEN IS NAMED AND ITS RENEWAL LINKED; A GITLAB PRODUCT USES A PROJECT ACCESS TOKEN
// given: the GitLab project gitlab.example.test/group/product whose server answers 401 to every request with the stored project access token, and the project to another token
// input: the person presses Test on the Settings line GitLab token: gitlab.example.test/group/product, activates Renew on that line, pastes a new value beside the link and stores it
// expect: the line shows Refused; Renew opens https://gitlab.example.test/group/product/-/settings/access_tokens and links no GitHub token page; beside it one field whose pasted value, stored, is the project's token
test("TST-1803208: on Settings, Renew of a refused GitLab project token opens the project's Access tokens page, with the paste field", async () => {
  const server = await repoServer({ files: FILES, handlers: [gitlabRefusing] });
  const view = await dashboard({ server, hash: "#uc", entries: gitlabEntries() });
  const line = await settingsLine(view, `GitLab token: ${GL_PROJECT}`);
  await pressTest(server, line);
  const link = await renew(server, () => line, "line");
  gitlabRenewal(line, link);
  await pasted(server, line, `gitlab-token:${GL_PROJECT}`);
});
