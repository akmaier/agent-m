// Add a product — the product gets a key of its own, on GitHub a fine-grained token for it alone, on a GitLab server a project
// token; then its review layout is written into it (UC-001). The instance's key stays as it is.
//
// Module: MOD-dashboard-app
//
// Route #add and #add/<address>. Every view function gets `app`, the page's context (dashboard-app.mjs); the step texts above
// them are plain functions.
//
// The server's pages — the token pages, the page for a new repository — are MOD-repository-hosts' (webLinks); Step C is
// MOD-artifact-edits' review layout (writes.mjs addProduct), whose refusals MOD-repository-hosts names (HostError) and Step C
// maps to UC-001's guidance. The address is read with the git host's parseProductAddress still: its product is what the
// settings' Check, the shell's texts of a refusal, its link to a product and the GitLab steps below are given.

import { canStore } from "../review-core.mjs";
import { addProduct, clickAuthority } from "./writes.mjs";
import { parseProductAddress, isGitLab, requiredPermissions } from "../git-host.mjs";
import { parseAddress, connect } from "../../../src/repository-hosts/index.mjs";
import {
  h, sharedOriginNotice, defaultExpiry, TOKEN_DAYS, EXPIRY_WARN_DAYS, checkGitLab, reachLine, reachProduct, repositoryChoiceSteps,
  productTokenName, productTokenDescription, gitlabTokenProblem, today,
} from "./settings-view.mjs";
import { storeKeyStep, wireStoreKey } from "./setup-view.mjs";

// UC-001 2a · the product repository does not exist yet: GitHub answered 404 for it. GitHub answers a private repository the
// key does not reach with the same 404, so both ways on are named — create it, or let the key reach it (Step A). With a folded
// explanation of the choices on GitHub's page (EVERY STEP EXPLAINS ITSELF). newRepository: GitHub's page for a new repository,
// as MOD-repository-hosts names it (webLinks).
export function missingRepositoryHtml(repo, newRepository) {
  const [owner, name] = String(repo).split("/");
  return `<p>GitHub has no repository ${h(repo)} that your key can see. If it does not exist yet, create it on
    <a href="${h(newRepository)}" target="_blank" rel="noopener">GitHub's page for a new repository ↗</a>, give it its key
    (Step A) and press Check again. If it exists and is private, no key in this browser reaches it yet — do Step A.</p>
    <details class="explain"><summary>What is this?</summary><div>${EXPLAIN.newRepository(owner, name)}</div></details>`;
}

// UC-001 3c · A GITLAB PRODUCT USES A PROJECT ACCESS TOKEN: the steps on the project's Access tokens page, which Step A opens
// (MOD-repository-hosts webLinks, projectTokens).
export function gitlabTokenSteps(product) {
  const GL = requiredPermissions(product).gitlab;
  return [
    `The button opens Settings → Access tokens of ${product.repo} on ${product.host}; there, press “Add new token”.`,
    "Token name: Agent M.",
    `Expiration date: a date of your choice — ${TOKEN_DAYS} days from today is a good default. Enter the same date below.`,
    `Select a role: ${GL.role} — GitLab lets only Maintainers push to a protected default branch. Select scopes: ${GL.scope} — nothing else.`,
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
  gitlabAdd: `One click writes one commit under the token's account into the GitLab project's default branch: a short
    <code>README.md</code> in each folder Agent M uses that holds no file yet (<code>docs/use-cases/</code>,
    <code>docs/architecture/</code>, <code>docs/approvals/</code>, <code>docs/spec-freigaben/</code>), a <code>SPEC.md</code>
    that says what a requirement is and holds none yet, and a <code>CHANGELOG.md</code> with its title — only what does not
    exist yet. It is an ordinary commit you can see and revert on GitLab; if nothing is missing, nothing is committed. The
    project's address is kept in this browser's list only; nothing is written into your instance.`,
  productKey: `The product gets a key of its own: a key that reaches only the product can write nowhere else, and GitHub limits
    a key to the repositories of one owner. Your instance's key stays as it is. GitHub cannot select a repository through a
    link, but it opens the page for a new key with its name, description, owner, permissions and expiry filled in; you pick
    the product's repository there. The key is kept in this browser for this product only and sent only to GitHub's API, in
    the requests for this product; Settings shows it, tests it and clears it.`,
  newRepository: (owner, name) => `GitHub's page for a new repository asks a few things. The <em>owner</em> is the account
    or organisation the repository belongs to — for this address, <code>${h(owner)}</code>. The <em>repository name</em> is
    the last part of the address — <code>${h(name)}</code>. <em>Public</em> means anyone can read it and only the people you
    allow can change it; <em>private</em> means only you and the people you add can see it — both work with Agent M. Choose
    to add a README: a repository without any file has no branch yet, and Agent M writes its layout onto the default
    branch. A <em>.gitignore</em> and a licence are optional here; a product states its licence in a <code>LICENSE</code>
    file, which you can add now or later. Then create the repository, come back to this page, add it to your key in
    Step A and press Check.`,
  check: `Agent M reads the product repository with your key. For a private repository, success proves the key
    reaches it. A public repository can be read by anyone, so there the proof comes with the first write in Step C —
    if the key does not reach it yet, Step C says so and nothing is written.`,
  add: `One click writes one commit under your account into the product repository's default branch: a short
    <code>README.md</code> in each folder Agent M uses that holds no file yet (<code>docs/use-cases/</code>,
    <code>docs/architecture/</code>, <code>docs/approvals/</code>, <code>docs/spec-freigaben/</code>), a <code>SPEC.md</code>
    that says what a requirement is and holds none yet, and a <code>CHANGELOG.md</code> with its title — only what does not
    exist yet. It is an ordinary commit you can see and revert on GitHub; if nothing is missing, nothing is committed.<br><br>
    <strong>Why the product list lives in this browser only:</strong> the product's address is kept in this browser's
    storage, beside your key — nothing is written into your instance. So your fork never shows which products you
    work on, and it can be synced with Agent M without conflict. Another browser starts with an empty list; add the
    product there again. “Clear everything” in Settings removes the list with the key.`,
};

// UC-001 3c/3d · a product on a GitLab server: its own project token, created on its Access tokens page.
function gitlabSteps(app, parsed) {
  const { T, store, stepHtml } = app;
  const stored = store.getGitLabToken(parsed.address);
  // The project's Access tokens page, as MOD-repository-hosts names it for this project's address.
  const tokens = connect(parseAddress(parsed.address)).webLinks().projectTokens;
  const a = stepHtml({ title: "Step A · Create a key for this project",
    body: `<p><a class="btn primary" href="${h(tokens)}" target="_blank" rel="noopener">Open Access tokens on ${h(parsed.host)} ↗</a></p>
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
  const { store } = app;
  const ack = document.getElementById("gl-ack"), tok = document.getElementById("gl-token"), exp = document.getElementById("gl-expires");
  const btn = document.getElementById("gl-store"), out = document.getElementById("gl-check-out");
  const check = async () => {
    out.textContent = `Reading ${parsed.address}…`;
    const x = await checkGitLab(app, parsed, store.getGitLabToken(parsed.address)?.token);
    // The project token's last test, kept beside it (UC-042 step 1): the settings page shows it after a reload too.
    if (x.ok) store.setGitLabTokenTest(parsed.address, { ok: today() });
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
    // A new value starts untested (MOD-settings-store setGitLabToken); the check below tests it.
    store.setGitLabToken(parsed.address, v, exp.value);
    tok.value = "";
    await check();
  });
}

// UC-001 Step A on GitHub · A GITHUB PRODUCT USES A TOKEN OF ITS OWN · A PRODUCT'S TOKEN IS NAMED AFTER THE PRODUCT: one click to
// GitHub's page for the product's own key, prefilled for it — its name and description built from the product repository's name;
// the page itself is MOD-repository-hosts' (webLinks), with the product's owner as the token's owner and every permission —, and
// the product alone to pick there.
function productKeyStep(app, parsed) {
  const { stepHtml } = app;
  const page = connect(parseAddress(parsed.address)).webLinks()
    .newToken(productTokenName(parsed.repo), productTokenDescription(parsed.repo), TOKEN_DAYS);
  return stepHtml({ title: "Step A · A key for the product",
    body: `<p><a class="btn primary" href="${h(page)}" target="_blank" rel="noopener">Open GitHub's token page (prefilled) ↗</a></p>
      <p>On that page:</p>
      <ol class="choices">${repositoryChoiceSteps(parsed.repo).map((s) => `<li>${h(s)}</li>`).join("")}</ol>`,
    explain: EXPLAIN.productKey });
}

// UC-001 · Add a product
async function viewAddProduct(app, preset = "") {
  const { T, main, stepHtml, store } = app;
  const owner = T.instance.split("/")[0];
  main().innerHTML = `
    <p class="crumbs"><a href="#uc">← back</a></p>
    <section class="head"><h2>Add a product</h2>
      <p class="muted">The product gets a key of its own — on GitHub a fine-grained token for it alone, on a GitLab server a project
      access token. Your instance's key stays as it is.</p></section>
    <section class="panel">
      <label>Product repository address <input id="add-repo" value="${h(preset)}" placeholder="https://github.com/${h(owner)}/my-project" spellcheck="false" autocomplete="off"></label>
      <details class="explain"><summary>What is this?</summary><div>${EXPLAIN.repo}</div></details>
    </section>
    <div id="add-steps"></div>`;
  const input = document.getElementById("add-repo");
  // A FORM OPENS WITH ITS FIRST FIELD FOCUSED: the product repository's address.
  input.focus();
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
    // A key in this browser reaches the product: its own, or the instance's while it has none (UC-001 3a; tokenFor).
    const reaches = () => valid && Boolean(store.tokenFor(parsed));
    // The page for a new repository on the product's server, as MOD-repository-hosts names it; none before an address is read.
    const links = valid ? connect(parseAddress(parsed.address)).webLinks() : null;
    const b = stepHtml({ title: "Step B · Check",
      body: `<p><button class="btn" id="add-check-btn" ${valid ? "" : "disabled"}>Check</button></p><p id="add-check" class="muted"></p>`,
      explain: EXPLAIN.check });
    const c = stepHtml({ title: "Step C · Add the product",
      body: `<p><button class="btn primary" id="add-go" ${reaches() ? "" : "disabled"}>Add product</button></p>
        <p id="add-result" class="muted">${!valid ? h(input.value.trim() ? parsed.error : "Paste the product repository's address above.") : !reaches() ? "Store the product's key in Step A first." : ""}</p>`,
      explain: EXPLAIN.add });
    if (!valid) {
      // No product yet, so no page to prefill: Step A says what it will do once the address is read.
      const a = stepHtml({ title: "Step A · A key for the product",
        body: `<p class="muted">Paste the product repository's address above — Step A then opens GitHub's token page, prefilled for it.</p>`,
        explain: EXPLAIN.productKey });
      steps.innerHTML = `<div id="add-step-a">${a}</div>` + b + c;
      wireAddGo(app, parsed);
      return;
    }
    // UC-001 Step A: the product's own key, created on the prefilled page and stored for this product only — the instance's key
    // stays as it is (UC-001 3b: with or without one). Store and check reads the product with it; Step B then shows the product's
    // line without another click.
    const a = productKeyStep(app, parsed) + storeKeyStep(app, "Step A · Give the product's key to Agent M");
    steps.innerHTML = `<div id="add-step-a">${a}</div>` + b + c;
    const line = (x) => reachLine([repo, x]) + (x.status === 404 ? missingRepositoryHtml(repo, links.newRepository) : "");
    wireStoreKey(app, () => [repo], async (res) => {
      // UC-001 step 4 after Store and check, without another click. A product the read did not reach is read once more for the
      // status of the refusal, so that a missing repository is named with GitHub's page for a new one, as Check does (2a).
      const [, read] = res[0];
      const x = read.ok ? read : await checkProduct(app, parsed);
      if (x.ok) store.setGitHubProductTokenTest(parsed.address, { ok: today() });
      document.getElementById("add-check").innerHTML = line(x);
      document.getElementById("add-go").disabled = !reaches();
      document.getElementById("add-result").textContent = "";
    }, { save: (v, exp) => store.setGitHubProductToken(parsed.address, v, exp), read: () => reachProduct(app, parsed) });
    document.getElementById("add-check-btn").addEventListener("click", async () => {
      const x = await checkProduct(app, parsed);
      document.getElementById("add-check").innerHTML = line(x);
      // UC-001 3a: only a read of a private repository proves that the key reaches it — a public one is read by any key
      // (step 4) — so only then is Step A shown as done, naming the key that read it; after any other answer Step A keeps its
      // instructions and its paste field as they are.
      if (x.ok && x.priv) document.getElementById("add-step-a").innerHTML = stepHtml({
        title: "Step A · A key for the product — done",
        body: `<p>✓ ${store.getGitHubProductToken(parsed.address) ? "The product's key" : "Your instance's key"} already reaches ${h(repo)} — nothing to do on GitHub.
          It read this private repository, which only a key that reaches it can. Go on with Step C.</p>`,
        explain: EXPLAIN.productKey });
    });
    wireAddGo(app, parsed);
  };
  input.addEventListener("input", render);
  render();
}

// UC-001 Step B on GitHub: the product read with the key that reaches it (reachProduct, settings-view.mjs), with the status of a
// refused read kept beside its text — a 404 is UC-001 2a. -> reachProduct's answer, and `status` when the read was refused.
async function checkProduct(app, parsed) {
  let status = null;
  const x = await reachProduct({ ...app, errorText: (e, p) => { status = e?.status ?? null; return app.errorText(e, p); } }, parsed);
  return x.ok ? x : { ...x, status };
}

// UC-001 Step C: the layout goes into the product repository; the address into this browser's list only. A product is written
// with its own key — a GitLab product's project token, a GitHub product's token, or the instance's key while the GitHub product
// has none (tokenFor). MOD-artifact-edits answers with the commit and its address, which the result links (UC-001 step 5). A
// refusal is the failure MOD-repository-hosts names (HostError), told here in UC-001's words as before: NotFound on GitHub — the
// repository is missing, with GitHub's page for a new one (2a); PermissionMissing — the key cannot write there yet, back to
// Step A (5a), or GitLab's refused write; TokenRefused — the line at the top with its renewal (noteRefusal) and the token named
// (errorText); RateLimited — the limit (rateLimitText); any other in its own words (errorText).
function wireAddGo(app, parsed) {
  const { store, noteRefusal, errorText, gitlabWriteRefusal, loadProducts, renderProductSelector, productHref } = app;
  document.getElementById("add-go").addEventListener("click", async (ev) => {
    const out = document.getElementById("add-result"), b = ev.currentTarget, repo = parsed.repo, gl = isGitLab(parsed);
    // The product whose own key writes, for the name of a refusal: a GitLab product, or a GitHub product with a key of its own.
    const own = gl || store.getGitHubProductToken(parsed.address) ? parsed : null;
    b.disabled = true;
    try {
      out.textContent = `Reading ${repo} and writing what is missing…`;
      const r = await addProduct({ address: parsed.address, token: store.tokenFor(parsed), authority: clickAuthority(ev), store });
      loadProducts();
      renderProductSelector();
      out.innerHTML = `Done — ${r.complete ? "nothing was missing in the product"
        : `<a href="${h(r.commit.url)}" target="_blank" rel="noopener">layout in ${h(repo)}</a>`}; ${h(parsed.address)} is now in this browser's product list.
        <a class="btn primary" href="${h(productHref(parsed))}">Open ${h(repo)} →</a>`;
    } catch (e) {
      noteRefusal(e, own);
      const limit = app.rateLimitText(e, gl ? parsed : null);
      // UC-001 2a: the repository is not found — it does not exist yet, or the key does not see it; nothing was written.
      if (!limit && !gl && e.name === "NotFound") {
        out.innerHTML = missingRepositoryHtml(repo, connect(parseAddress(parsed.address)).webLinks().newRepository);
        b.disabled = false;
        return;
      }
      out.textContent = limit || (gl ? gitlabWriteRefusal(e, parsed) || errorText(e, parsed)
        : e.name === "PermissionMissing"
          ? `Your key cannot write to ${repo} yet (${e.message}). Do Step A — give Agent M a key that reaches the product — and click again.`
          : errorText(e, own));
      b.disabled = false;
    }
  });
}

export const routes = { add: (app, a) => viewAddProduct(app, a ? decodeURIComponent(a) : "") };
