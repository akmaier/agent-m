// The route `add-product` — Add a product (MOD-settings-pages, docs/architecture/MOD-settings-pages.md; Interfaces: view,
// strategy `add-product`; UC-001). The address typed is recognised as GitHub or GitLab (parseAddress); Step A offers the key
// of the product's own — on GitHub the prefilled token page, named and described after the product (A GITHUB PRODUCT USES A
// TOKEN OF ITS OWN, A PRODUCT'S TOKEN IS NAMED AFTER THE PRODUCT), with the repository to pick spelled out (THE REPOSITORY
// CHOICE IS SPELLED OUT); on a GitLab server the project's own Access tokens page, role Maintainer and scope api (A GITLAB
// PRODUCT USES A PROJECT ACCESS TOKEN), with the guidance for a project that offers none or an author who is not Maintainer
// (UC-001 3d); shown as done once a key already reaches the product — its own, or, on GitHub only, the instance's (3a).
// Step B reads the product with that key and names what is missing (4a) or a missing repository with the server's page for
// a new one (2a). Step C, one click (ONE CLICK PER DECISION): MOD-artifact-edits' reviewLayoutCommit writes the parts the
// product's default branch lacks — nothing when it is complete (5b) —, and the address is added to this browser's list;
// nothing is ever written to the instance repository (NO PRODUCT IS NAMED IN THE INSTANCE REPOSITORY); a write refused
// after a successful read (5a) is named, and nothing is written. Each step carries its folded "What is this?" (EVERY STEP
// EXPLAINS ITSELF, from MOD-site-frame's explanations.md — its topics are not populated by this item, see the pull
// request) and the body of Steps A and C states where the key and the commit go (THE PAGE STATES WHAT IT SENDS WHERE).
//
// Module: MOD-settings-pages
//
// Not part of this item: the routes `settings`, `get-your-own`/`setup`, `endpoints`, `participants`, `library`,
// `resources`, `mailbox` and `bridge` of this module (its other strategies), and how the dashboard reaches this route.
//
// A seam for this file's own unit tests only: render's fourth, undocumented parameter lets a test give a fake connect in
// place of MOD-repository-hosts' — the one function this route must call for an address that is not yet a tracked
// product, so no ViewContext can hand it an already-connected host (unlike every other route of this module, which is
// given the product it shows already connected). Production code never passes it; it defaults to the real connect.

import { parseAddress, connect as connectHost } from "../repository-hosts/index.mjs";
import { reviewLayoutCommit } from "../artifact-edits/index.mjs";
import { readSetting, writeSetting } from "../browser-store/index.mjs";
import { explain } from "../site-frame/index.mjs";

const TOKEN_DAYS = 90;
const DAY_MS = 24 * 60 * 60 * 1000;
const NAME_MAX = 40;
const INSTANCE_TOKEN_KEY = "github-token";
const PRODUCTS_KEY = "products";

function el(name, className, ...children) {
  const node = document.createElement(name);
  if (className) node.className = className;
  node.append(...children);
  return node;
}

const today = () => new Date().toISOString().slice(0, 10);
function defaultExpiry(now = new Date()) {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) + TOKEN_DAYS * DAY_MS)
    .toISOString().slice(0, 10);
}

// A PRODUCT'S TOKEN IS NAMED AFTER THE PRODUCT: name and description of a GitHub product's own token, from its
// repository's path, within GitHub's limits of 40 and 1024 characters (a longer name drops the owner, then the end of
// the repository's name).
function productTokenName(path) {
  const full = `Agent M · ${path}`;
  if (full.length <= NAME_MAX) return full;
  const short = `Agent M · ${path.split("/").pop()}`;
  return short.length <= NAME_MAX ? short : `${short.slice(0, NAME_MAX - 1)}…`;
}
const productTokenDescription = (path) =>
  `Agent M for the product ${path}: reviews, commits, issues, pull requests and runs of the work you start in it.`;

// THE REPOSITORY CHOICE IS SPELLED OUT: what to do on GitHub's prefilled token page.
const repositoryChoiceSteps = (path) => [
  `Under "Repository access", choose "Only select repositories". GitHub preselects "All repositories", which would give ` +
    "Agent M write access to everything you own.",
  `Open "Select repositories" and pick "${path}" — nothing else.`,
  `Press "Generate token" and copy the token GitHub now shows — it starts with github_pat_ and is shown only once.`,
];

// A GITLAB PRODUCT USES A PROJECT ACCESS TOKEN (UC-001 3c): the steps on the project's own Access tokens page.
const gitlabTokenSteps = (path, host) => [
  `The button opens Settings → Access tokens of ${path} on ${host}; there, press "Add new token".`,
  "Token name: Agent M.",
  `Expiration date: a date of your choice — ${TOKEN_DAYS} days from today is a good default. Enter the same date below.`,
  "Select a role: Maintainer — GitLab lets only Maintainers push to a protected default branch. Select scope: api — nothing else.",
  'Press "Create project access token" and copy the token GitLab now shows — it starts with glpat- and is shown only once.',
];

// UC-001 3d: the server offers no project access tokens, or the author is not Maintainer.
const gitlabNoProjectTokens = (host) =>
  `If ${host} offers no project access tokens, or you are not Maintainer there, ask a Maintainer to create one for you, ` +
  `or to give you the role. A personal access token would also work, but it is broader: with scope api it reaches every ` +
  `project you can reach on ${host}, not only this one. Either way, Agent M stores it for this product only and sends it ` +
  "only to this project's API.";

// The key MOD-browser-store keeps the product's own token under (A GITHUB PRODUCT USES A TOKEN OF ITS OWN · A GITLAB
// PRODUCT USES A PROJECT ACCESS TOKEN), and what Steps A and B show for either server.
function kindOf(address) {
  if (address.server === "gitlab") {
    const host = address.origin.replace(/^https?:\/\//, "");
    return { gitlab: true, host, tokenKey: `gitlab-token:${host}/${address.path}`, placeholder: "glpat-…" };
  }
  return { gitlab: false, host: "github.com", tokenKey: `github-token:${address.path}`, placeholder: "github_pat_…" };
}

// The token Steps B and C read with: the product's own, or, on GitHub only, the instance's while the product has none
// (UC-001 3a) — a GitLab product's token is never the instance's, which is a GitHub token.
function tokenFor(store, kind) {
  const own = readSetting(store, kind.tokenKey)?.value;
  if (own) return own;
  return kind.gitlab ? null : readSetting(store, INSTANCE_TOKEN_KEY)?.value ?? null;
}

// NO PRODUCT IS NAMED IN THE INSTANCE REPOSITORY: the product's address goes only into this browser's list.
function rememberProduct(store, web) {
  const existing = readSetting(store, PRODUCTS_KEY) ?? [];
  if (!existing.includes(web)) writeSetting(store, PRODUCTS_KEY, [...existing, web]);
}

const stepSection = (title, ...body) => el("section", "step", el("h3", null, title), ...body);

// repositoryInfo(), told apart from a missing repository (UC-001 2a) and any other refusal (4a).
// -> { ok: true, info } | { ok: false, notFound: true } | { ok: false, message }.
async function checkRepository(host) {
  try {
    return { ok: true, info: await host.repositoryInfo() };
  } catch (e) {
    return e?.name === "NotFound" ? { ok: false, notFound: true } : { ok: false, message: e.message };
  }
}

const checkLine = (web, info) => `✓ ${web} is reachable` +
  (info.canWrite ? " — this key can write here." : " — public, so write access is confirmed only by the first write.");

// Renders a Check result (shared by Step A's Store and check, and Step B's own Check) into `out`, in place.
function renderCheckResult(out, web, host, result) {
  out.replaceChildren();
  if (result.ok) { out.textContent = checkLine(web, result.info); return; }
  if (result.notFound) {
    out.append(`✗ ${web} was not found — it may not exist yet, or be private to a key that does not reach it yet. `);
    const a = el("a", null, "Create it on the server's page for a new repository");
    a.href = host.webLinks().newRepository ?? ""; a.target = "_blank"; a.rel = "noopener";
    out.append(a, ", then press Check again.");
    return;
  }
  out.textContent = `✗ ${web}: ${result.message}`;
}

// ---------------------------------------------------------------- Step A: a key for the product

// The form of Step A: the server's token page, what to do there, paste, expiry, Store and check. `host` is the one
// `renderSteps` connected (without a token, since this form is shown only while none is stored yet); `connect` is the
// function render was given (the real one in production, a fake in this file's own tests) — Store and check reconnects
// with the pasted token to run the same check Step B runs.
function stepAForm(context, address, kind, host, connect, onStored) {
  const link = el("a", "primary", kind.gitlab ? `Open Access tokens on ${kind.host}` : "Open GitHub's token page (prefilled)");
  link.href = kind.gitlab ? (host.webLinks().projectTokens ?? "")
    : host.webLinks().newToken(productTokenName(address.path), productTokenDescription(address.path), TOKEN_DAYS);
  link.target = "_blank"; link.rel = "noopener";
  const steps = kind.gitlab ? gitlabTokenSteps(address.path, kind.host) : repositoryChoiceSteps(address.path);
  const list = el("ol", "choices", ...steps.map((s) => el("li", null, s)));
  const token = el("input", "token"); token.value = ""; token.type = "password"; token.placeholder = kind.placeholder; token.autocomplete = "off";
  const expires = el("input", "expires"); expires.type = "date"; expires.value = defaultExpiry();
  const store = el("button", "store", "Store and check");
  const out = el("p", "result");
  const sends = el("p", "muted", kind.gitlab
    ? `The key is sent only to this project's API on ${kind.host} — never to GitHub or the model endpoint.`
    : "The key is sent only to GitHub's API, for this product alone — never to the model endpoint.");
  const aside = kind.gitlab ? el("details", null, el("summary", null, "The page offers no project access tokens, or you are not Maintainer"),
    el("p", null, gitlabNoProjectTokens(kind.host))) : el("span");
  const body = el("div", null, el("p", null, link), list, aside, sends,
    el("p", null, "Token ", token, " expires on ", expires, " ", store), out,
    explain(kind.gitlab ? "add-product-key-gitlab" : "add-product-key-github"));
  store.addEventListener("click", async () => {
    const value = token.value.trim(), expiresOn = expires.value;
    if (!value || !expiresOn) { out.textContent = "Paste the token and its expiry date first."; return; }
    writeSetting(context.store, kind.tokenKey,
      { value, name: kind.gitlab ? "Agent M" : productTokenName(address.path), expires: expiresOn, stored: today() });
    out.textContent = `Checking ${address.web}…`;
    // UC-001 step 4: Step B shows this same check's result without another click, so it is carried into the rebuild
    // onStored triggers (renderSteps), not shown here — this form's own `out` is torn down with it.
    onStored(await checkRepository(connect(address, { token: value })));
  });
  return stepSection(kind.gitlab ? "Step A · Create a key for this project" : "Step A · A key for the product", body);
}

const doneStepA = (title, text, topic) => stepSection(title, el("p", "result", `✓ ${text}`), explain(topic));

// ---------------------------------------------------------------- Steps B and C

function stepBSection(address, host, initialResult) {
  const button = el("button", "check", "Check");
  const out = el("p", "result");
  if (initialResult) renderCheckResult(out, address.web, host, initialResult);
  button.addEventListener("click", async () => {
    out.textContent = `Reading ${address.web}…`;
    renderCheckResult(out, address.web, host, await checkRepository(host));
  });
  return stepSection("Step B · Check", el("p", null, button), out, explain("add-product-check"));
}

// Step C, one click (ONE CLICK PER DECISION): writes the missing review layout (MOD-artifact-edits reviewLayoutCommit)
// and remembers the address; a write refused after a successful read (5a) is named and nothing else happens.
function stepCSection(context, address, host, enabled) {
  const button = el("button", "add", "Add product");
  button.disabled = !enabled;
  const out = el("p", "result", enabled ? "" : "Store the product's key in Step A first.");
  const sends = el("p", "muted", `One click writes the missing review layout into ${address.web}'s own default branch and ` +
    "adds its address to this browser's list — nothing is written to the instance repository.");
  button.addEventListener("click", async () => {
    button.disabled = true;
    out.textContent = `Reading ${address.web} and writing what is missing…`;
    try {
      const layout = await reviewLayoutCommit(host);
      rememberProduct(context.store, address.web);
      if (layout.complete) { out.textContent = `Nothing was missing in ${address.web}; it is now in this browser's product list.`; return; }
      out.replaceChildren("Done — wrote the missing review layout in ");
      const a = el("a", null, "the commit"); a.href = layout.commit.url; a.target = "_blank"; a.rel = "noopener";
      out.append(a, `; ${address.web} is now in this browser's product list.`);
    } catch (e) {
      out.textContent = e?.name === "PermissionMissing"
        ? `Your key cannot write to ${address.web} yet (${e.message}). Store a key that reaches it in Step A, then try again.`
        : e?.name === "NotFound" ? `✗ ${address.web} was not found — nothing was written.`
          : `✗ ${e.message} — nothing was written.`;
      button.disabled = false;
    }
  });
  return stepSection("Step C · Add the product", el("p", null, button), out, sends, explain("add-product-write"));
}

// ---------------------------------------------------------------- putting the steps together

function placeholderSteps(message) {
  return [
    stepSection("Step A · A key for the product", el("p", "muted", "Paste the product repository's address above."), explain("add-product-key-github")),
    stepSection("Step B · Check", el("p", "muted", "—")),
    stepSection("Step C · Add the product", el("p", "result", message)),
  ];
}

// Rebuilds Steps A, B and C for the address now in the input, or a placeholder while it is empty or not a repository's
// address. `connect` is render's own parameter, carried down so a test's fake reaches every step that needs a host.
// `initialCheck`: the result of a check already made (Step A's own Store and check), shown in Step B without another
// click (UC-001 step 4) — null on every render the address input itself triggers.
function renderSteps(container, context, text, connect, initialCheck = null) {
  container.replaceChildren();
  const trimmed = text.trim();
  if (!trimmed) { container.append(...placeholderSteps("Paste the product repository's address above.")); return; }
  let address;
  try { address = parseAddress(text); } catch (e) { container.append(...placeholderSteps(e.message)); return; }
  const kind = kindOf(address);
  const already = tokenFor(context.store, kind);
  const host = connect(address, { token: already });
  const a = already
    ? doneStepA(kind.gitlab ? "Step A · Create a key for this project — done" : "Step A · A key for the product — done",
      `A key in this browser already reaches ${address.web}.`, kind.gitlab ? "add-product-key-gitlab" : "add-product-key-github")
    : stepAForm(context, address, kind, host, connect,
      (result) => renderSteps(container, context, text, connect, result));
  container.append(a, stepBSection(address, host, initialCheck), stepCSection(context, address, host, Boolean(already)));
}

export const route = {
  name: "add-product",
  entry: "settings",
  title: "Add a product",

  // The fourth parameter is this file's own test seam (see the file's header); production code never passes it.
  async render(target, context, params, { connect = connectHost } = {}) {
    const page = el("div", "page");
    page.append(el("h2", null, "Add a product"));
    page.append(el("p", "muted", "The product gets a key of its own — on GitHub a fine-grained token for it alone, on a " +
      "GitLab server a project access token, sent only to that server's own API. Your instance's key stays as it is."));
    const address = el("input", "address");
    address.value = ""; address.placeholder = "https://github.com/owner/name"; address.autocomplete = "off"; address.spellcheck = false;
    const label = el("label", null, "Product repository address ", address);
    page.append(label, explain("add-product-address"));
    const steps = el("div", "steps");
    page.append(steps);
    target.append(page);
    address.focus();
    const onInput = () => renderSteps(steps, context, address.value, connect);
    address.addEventListener("input", onInput);
    onInput();
  },
};
