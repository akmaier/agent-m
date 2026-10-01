// Add a product — on GitHub the instance's token is extended to reach it, on a GitLab server the product gets a project token
// of its own; then its review layout is written into it (UC-001).
//
// Module: MOD-dashboard-app
//
// Route #add and #add/<address>. Every view function gets `app`, the page's context (dashboard-app.mjs); the step texts above
// them are plain functions.

import { canStore, addProduct } from "../review-core.mjs";
import { parseProductAddress, isGitLab, gitlabTokenPageUrl, tokenListUrl } from "../git-host.mjs";
import {
  h, sharedOriginNotice, tokenLinkUrl, defaultExpiry, TOKEN_DAYS, EXPIRY_WARN_DAYS, checkReach, checkGitLab, reachLine,
  gitlabTokenProblem, today,
} from "./settings-view.mjs";
import { createKeyStep, storeKeyStep, wireStoreKey } from "./setup-view.mjs";

// UC-001: the instance's token (created in UC-014) is extended by one repository — same token,
// nothing to copy. The token's name is the one tokenLinkUrl gave it, so the person can find it.
export function extendTokenSteps(instance, product) {
  const name = new URLSearchParams(new URL(tokenLinkUrl(instance)).search).get("name");
  return [
    `Click the token “${name}”, then “Edit”.`,
    `Under “Repository access” → “Select repositories”, add “${product}” — keep “${instance}” selected.`,
    "Press “Update” at the bottom. The token itself stays the same — nothing to copy, nothing to paste here.",
  ];
}

// UC-001 3c · A GITLAB PRODUCT USES A PROJECT ACCESS TOKEN: the steps on the page gitlabTokenPageUrl (git-host.mjs) opens.
export function gitlabTokenSteps(product) {
  return [
    `The button opens Settings → Access tokens of ${product.repo} on ${product.host}; there, press “Add new token”.`,
    "Token name: Agent M.",
    `Expiration date: a date of your choice — ${TOKEN_DAYS} days from today is a good default. Enter the same date below.`,
    "Select a role: Maintainer — GitLab lets only Maintainers push to a protected default branch. Select scopes: api — nothing else.",
    "Press “Create project access token” and copy the token GitLab now shows — it starts with glpat- and is shown only once.",
  ];
}

// UC-001 3d: the server offers no project access tokens, or the person is not Maintainer — and why a personal
// token is broader. GitLab: "On GitLab.com, project access tokens require a Premium or Ultimate subscription …
// On GitLab Self-Managed … available with any license"; prerequisite "The Maintainer or Owner role for the project".
export function gitlabNoProjectTokens(product) {
  const where = product.host === "gitlab.com"
    ? "On gitlab.com, project access tokens need a Premium or Ultimate subscription: a project on the Free tier offers none " +
      "(the Access tokens page says so, or has no “Add new token”)."
    : `${product.host} is a self-managed GitLab: it offers project access tokens with any licence, unless its administrators or ` +
      "the project's group have switched their creation off.";
  return `${where} To create one you need the Maintainer or Owner role in the project — if Settings → Access tokens is not ` +
    "in your sidebar, you do not have it: ask a Maintainer to create the token for you, or to give you the role. " +
    `A personal access token would also work here, but it is broader: with scope api it reaches every project you can reach on ` +
    `${product.host}, not only this one (A TOKEN IS SCOPED TO WHAT IT WRITES). You decide. Either way, Agent M stores it for ` +
    "this product only and sends it only to this project's API.";
}

const EXPLAIN = {
  repo: `A <em>repository</em> is the folder on GitHub that holds a project's files and their history. Paste its
    address as your browser shows it, <code>https://github.com/owner/name</code> — or, for a project on a GitLab server,
    that project's address, with all its groups (<code>group/subgroup/project</code>). The product's requirements and use
    cases will live in that repository; this dashboard only shows them.`,
  gitlabToken: `A <em>project access token</em> is a key GitLab creates for one project only. With role <em>Maintainer</em> and
    scope <em>api</em> it lets this page make commits in that project — accepting and editing — and nowhere else on the
    server. <em>Maintainer</em>, because GitLab protects a project's default branch against pushes by Developers unless the
    project changes that; a Maintainer token can also change the project's settings, but still only in this one project. You choose its expiry date; you can revoke it on the same page at any time, and it stops working immediately.<br><br>
    <strong>Why a project token?</strong> A personal token with scope api would reach every project you can reach on the
    server. Each GitLab product therefore gets its own token; the GitHub key of your instance is not involved.`,
  gitlabStore: `The token is saved in this browser only (its <code>localStorage</code>), under this product's address — never in
    a cookie, an address or a repository. It is sent only to this project's API on its own server, as a header: never to
    GitHub, another GitLab or the model endpoint. Settings shows it, tests it and clears it; <em>Export settings</em> moves it.`,
  gitlabAdd: `One click writes one commit under the token's account into the GitLab project: the folders Agent M uses
    (<code>docs/use-cases/</code>, <code>docs/approvals/</code>, <code>docs/spec-freigaben/</code>), an empty
    <code>SPEC.md</code> and a <code>CHANGELOG.md</code> — only those that do not exist yet. It is an ordinary commit you
    can see and revert on GitLab; if nothing is missing, nothing is committed. The project's address is kept in this
    browser's list only; nothing is written into your instance.`,
  extend: `Your key was created for this instance only, on purpose: it can write nowhere else. A new product has to
    be added to it once. GitHub lets you change which repositories an existing key reaches; the key's text stays
    the same, so there is nothing to copy into Agent M. You can remove the product from the key again the same way.`,
  check: `Agent M reads the product repository with your key. For a private repository, success proves the key
    reaches it. A public repository can be read by anyone, so there the proof comes with the first write in Step C —
    if the key does not reach it yet, Step C says so and nothing is written.`,
  add: `One click writes one commit under your account into the product repository: the folders Agent M uses
    (<code>docs/use-cases/</code>, <code>docs/approvals/</code>, <code>docs/spec-freigaben/</code>), an empty
    <code>SPEC.md</code> and a <code>CHANGELOG.md</code> — only those that do not exist yet. It is an ordinary commit you
    can see and revert on GitHub; if nothing is missing, nothing is committed.<br><br>
    <strong>Why the product list lives in this browser only:</strong> the product's address is kept in this browser's
    storage, beside your key — nothing is written into your instance. So your fork never shows which products you
    work on, and it can be synced with Agent M without conflict. Another browser starts with an empty list; add the
    product there again. “Clear everything” in Settings removes the list with the key.`,
};

// UC-001 3c/3d · a product on a GitLab server: its own project token, created on its Access tokens page.
function gitlabSteps(app, parsed) {
  const { T, store, stepHtml } = app;
  const stored = store.getGitLabToken(parsed.address);
  const a = stepHtml({ title: "Step A · Create a key for this project",
    body: `<p><a class="btn primary" href="${h(gitlabTokenPageUrl(parsed))}" target="_blank" rel="noopener">Open Access tokens on ${h(parsed.host)} ↗</a></p>
      <p>On that page:</p>
      <ol class="choices">${gitlabTokenSteps(parsed).map((x) => `<li>${h(x)}</li>`).join("")}</ol>
      <details><summary>The page offers no project access tokens, or you are not Maintainer</summary><p>${h(gitlabNoProjectTokens(parsed))}</p></details>`,
    explain: EXPLAIN.gitlabToken });
  const b = stepHtml({ title: "Step B · Give the key to Agent M",
    body: `${stored ? `<p>✓ A token for this project is stored in this browser${stored.expires ? ` (expires on ${h(stored.expires)})` : ""}.
        <button class="btn" id="gl-check">Check</button> — or paste a new one below.</p>` : ""}
      <p class="notice">${h(sharedOriginNotice(T.instance.split("/")[0]))}</p>
      <p><label><input type="checkbox" id="gl-ack"> I have read this.</label></p>
      <p><input type="password" id="gl-token" placeholder="glpat-…" autocomplete="off" spellcheck="false" disabled aria-label="GitLab project token"></p>
      <p><label>Expires on <input type="date" id="gl-expires" value="${h(defaultExpiry())}" disabled></label>
        <span class="muted small">The date you chose on GitLab. Agent M warns ${EXPIRY_WARN_DAYS} days before.</span></p>
      <p><button class="btn" id="gl-store" disabled>Store and check</button></p>
      <p id="gl-check-out" class="muted"></p>`,
    explain: EXPLAIN.gitlabStore });
  const c = stepHtml({ title: "Step C · Add the product",
    body: `<p><button class="btn primary" id="add-go" ${stored ? "" : "disabled"}>Add product</button></p>
      <p id="add-result" class="muted">${stored ? "" : "Store the project's token in Step B first."}</p>`,
    explain: EXPLAIN.gitlabAdd });
  return a + b + c;
}

function wireGitLabSteps(app, parsed) {
  const { store, tokenState } = app;
  const ack = document.getElementById("gl-ack"), tok = document.getElementById("gl-token"), exp = document.getElementById("gl-expires");
  const btn = document.getElementById("gl-store"), out = document.getElementById("gl-check-out");
  const check = async () => {
    out.textContent = `Reading ${parsed.address}…`;
    const x = await checkGitLab(app, parsed, store.getGitLabToken(parsed.address)?.token);
    if (x.ok) tokenState.gitlab[parsed.address] = { ok: today(), refused: false };
    out.innerHTML = reachLine([parsed.address, x]);
    const go = document.getElementById("add-go");
    go.disabled = !store.getGitLabToken(parsed.address);
    document.getElementById("add-result").textContent = go.disabled ? "Store the project's token in Step B first." : "";
  };
  ack.addEventListener("change", () => { tok.disabled = exp.disabled = btn.disabled = !canStore(ack.checked); });
  document.getElementById("gl-check")?.addEventListener("click", check);
  btn.addEventListener("click", async () => {
    const v = tok.value.trim();
    if (!canStore(ack.checked)) return;
    const bad = gitlabTokenProblem(v, exp.value);
    if (bad) { out.textContent = bad; return; }
    store.setGitLabToken(parsed.address, v, exp.value);
    tok.value = "";
    tokenState.gitlab[parsed.address] = {};
    await check();
  });
}

// UC-001 · Add a product
async function viewAddProduct(app, preset = "") {
  const { T, main, stepHtml } = app;
  const ghToken = app.ghToken;
  const owner = T.instance.split("/")[0];
  main().innerHTML = `
    <p class="crumbs"><a href="#uc">← back</a></p>
    <section class="head"><h2>Add a product</h2>
      <p class="muted">On GitHub, your instance's key is extended to reach the product; on a GitLab server, the product gets a key
      of its own.</p></section>
    <section class="panel">
      <label>Product repository address <input id="add-repo" value="${h(preset)}" placeholder="https://github.com/${h(owner)}/my-project" spellcheck="false" autocomplete="off"></label>
      <details class="explain"><summary>What is this?</summary><div>${EXPLAIN.repo}</div></details>
    </section>
    <div id="add-steps"></div>`;
  const input = document.getElementById("add-repo");
  const steps = document.getElementById("add-steps");
  const render = () => {
    const parsed = parseProductAddress(input.value);
    if (!parsed.error && isGitLab(parsed)) {
      steps.innerHTML = gitlabSteps(app, parsed);
      wireGitLabSteps(app, parsed);
      wireAddGo(app, parsed);
      return;
    }
    const valid = !parsed.error, repo = parsed.repo;
    const product = valid ? repo : "<your product>";
    const c = stepHtml({ title: "Step C · Add the product",
      body: `<p><button class="btn primary" id="add-go" ${valid && ghToken() ? "" : "disabled"}>Add product</button></p>
        <p id="add-result" class="muted">${!valid ? h(input.value.trim() ? parsed.error : "Paste the product repository's address above.") : !ghToken() ? "Store your key in Step B first." : ""}</p>`,
      explain: EXPLAIN.add });
    if (ghToken()) {
      const a = stepHtml({ title: "Step A · Let your key reach the product",
        body: `<p><a class="btn" href="${h(tokenListUrl())}" target="_blank" rel="noopener">Open your tokens on GitHub ↗</a></p>
          <p>On that page:</p>
          <ol class="choices">${extendTokenSteps(T.instance, product).map((s) => `<li>${h(s)}</li>`).join("")}</ol>`,
        explain: EXPLAIN.extend });
      const b = stepHtml({ title: "Step B · Check",
        body: `<p><button class="btn" id="add-check-btn" ${valid ? "" : "disabled"}>Check</button></p><p id="add-check" class="muted"></p>`,
        explain: EXPLAIN.check });
      steps.innerHTML = a + b + c;
      document.getElementById("add-check-btn").addEventListener("click", async () => {
        document.getElementById("add-check").innerHTML = reachLine([repo, await checkReach(app, repo)]);
      });
    } else {
      steps.innerHTML = createKeyStep(app, [T.instance, product]) + storeKeyStep(app) + c;
      wireStoreKey(app, () => [T.instance, ...(valid ? [repo] : [])], () => {
        document.getElementById("add-go").disabled = !valid;
        document.getElementById("add-result").textContent = valid ? "" : "Paste the product repository's address above.";
      });
    }
    wireAddGo(app, parsed);
  };
  input.addEventListener("input", render);
  render();
}

// UC-001 Step C: the layout goes into the product repository; the address into this browser's list only. A GitLab
// product is written with its own project token, a GitHub one with the instance's key.
function wireAddGo(app, parsed) {
  const { store, noteRefusal, errorText, gitlabWriteRefusal, loadProducts, renderProductSelector, productHref } = app;
  const ghToken = app.ghToken;
  document.getElementById("add-go").addEventListener("click", async (ev) => {
    const out = document.getElementById("add-result"), b = ev.currentTarget, repo = parsed.repo, gl = isGitLab(parsed);
    b.disabled = true;
    try {
      out.textContent = `Reading ${repo} and writing what is missing…`;
      const r = await addProduct({ address: parsed.address, token: gl ? store.getGitLabToken(parsed.address)?.token : ghToken(), click: ev, store });
      loadProducts();
      renderProductSelector();
      out.innerHTML = `Done — ${r.commit
        ? `<a href="${h(r.commit.url)}" target="_blank" rel="noopener">layout in ${h(repo)}</a>`
        : "nothing was missing in the product"}; ${h(parsed.address)} is now in this browser's product list.
        <a class="btn primary" href="${h(productHref(parsed))}">Open ${h(repo)} →</a>`;
    } catch (e) {
      noteRefusal(e, gl ? parsed : null);
      out.textContent = app.rateLimitText(e, gl ? parsed : null) || (gl ? gitlabWriteRefusal(e, parsed) || errorText(e, parsed)
        : /403|404/.test(e.message)
          ? `Your key cannot write to ${repo} yet (${e.message}). Do Step A — add the product to your key on GitHub — and click again.`
          : errorText(e, null));
      b.disabled = false;
    }
  });
}

export const routes = { add: (app, a) => viewAddProduct(app, a ? decodeURIComponent(a) : "") };
