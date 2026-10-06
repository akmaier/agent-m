// Setup — finish setting up an instance in this browser: create the GitHub token and give it to the dashboard (UC-014). A product
// gets a key of its own, with steps of its own (add-product-view.mjs, UC-001), whose storing is wired here too (wireStoreKey).
//
// Module: MOD-dashboard-app
//
// Route #setup. Every function gets `app`, the page's context (dashboard-app.mjs).

import { canStore } from "../review-core.mjs";
import {
  h, sharedOriginNotice, tokenLinkUrl, repositoryChoiceSteps, defaultExpiry, TOKEN_DAYS, EXPIRY_WARN_DAYS, checkReach, reachLine,
  GITHUB_PERMISSIONS, githubTokenProblem,
} from "./settings-view.mjs";

const EXPLAIN = {
  token: `A <em>token</em> is a key you create on GitHub and give to this page, so it can make commits for you — only in
    the repositories you select, only with the permissions Agent M's features need, and only until the date you
    choose. You can delete it on GitHub at any time; it then stops working immediately.<br><br>
    <strong>Why these permissions?</strong> ${GITHUB_PERMISSIONS.map((p) =>
      `<em>${h(p.permission)}</em> (${p.access === "read" ? "read" : "read and write"}): ${h(p.why)}`).join("; ")}.
    One key covers all of them. Each product you add later gets a key of its own.<br><br>
    <strong>Why “Only select repositories”?</strong> GitHub preselects “All repositories”. That would let this page write
    to every repository you own. Choosing only the repository named above limits it to what Agent M actually needs.`,
  store: `The token is saved in this browser only (its <code>localStorage</code>), never in a cookie, never in an
    address, never in any repository. It is sent only to GitHub's API, as a header. Another computer or browser
    does not have it — <em>Export settings</em> in Settings moves it there. Settings shows it, tests it and clears it.`,
};

// Step A of UC-014: create the instance's key.
// createKeyStep(app, repos, title?, { dated, explain }?) — the prefilled token page and the repositories to pick on it; `dated`
// dates the token's name, `explain` replaces the step's explanation.
export function createKeyStep(app, repos, title = "Step A · Create your key on GitHub", { dated = null, explain = EXPLAIN.token } = {}) {
  const { T, stepHtml } = app;
  return stepHtml({ title,
    body: `<p><a class="btn primary" href="${h(tokenLinkUrl(T.instance, dated))}" target="_blank" rel="noopener">Open GitHub's token page (prefilled) ↗</a></p>
      <p>On that page:</p>
      <ol class="choices">${repositoryChoiceSteps(...repos).map((s) => `<li>${h(s)}</li>`).join("")}</ol>`,
    explain });
}

// Step B of UC-014: notice, paste, store, check the given repositories.
export function storeKeyStep(app, title = "Step B · Give the key to Agent M") {
  const { T, stepHtml } = app;
  return stepHtml({ title,
    body: `<p class="notice">${h(sharedOriginNotice(T.instance.split("/")[0]))}</p>
      <p><label><input type="checkbox" id="key-ack"> I have read this.</label></p>
      <p><input type="password" id="key-token" placeholder="github_pat_…" autocomplete="off" spellcheck="false" disabled aria-label="GitHub token"></p>
      <p><label>Expires on <input type="date" id="key-expires" value="${h(defaultExpiry())}" disabled></label>
        <span class="muted small">Preset to the ${TOKEN_DAYS} days of the prefilled link — correct it if you changed it on GitHub.
        Agent M warns ${EXPIRY_WARN_DAYS} days before.</span></p>
      <p><button class="btn" id="key-store" disabled>Store and check</button></p>
      <p id="key-check" class="muted"></p>`,
    explain: EXPLAIN.store });
}

// wireStoreKey(app, reposToCheck, onStored, { save, read }?) — Store and check: `save(token, expires)` keeps the key — by default
// as the instance's —, `read(repository)` checks one repository with it — by default with the instance's.
export function wireStoreKey(app, reposToCheck, onStored, { save = (v, exp) => app.store.setToken(v, exp), read = (r) => checkReach(app, r) } = {}) {
  const { showBanner } = app;
  const ack = document.getElementById("key-ack"), tok = document.getElementById("key-token");
  const btn = document.getElementById("key-store"), out = document.getElementById("key-check");
  const expires = document.getElementById("key-expires");
  ack.addEventListener("change", () => { tok.disabled = expires.disabled = btn.disabled = !canStore(ack.checked); });
  btn.addEventListener("click", async () => {
    const v = tok.value.trim(), exp = expires.value;
    if (!canStore(ack.checked)) return;
    const bad = githubTokenProblem(v, exp);
    if (bad) { out.textContent = bad; return; }
    // A new token starts untested: storing it forgets the last test of the one before (MOD-settings-store setToken).
    save(v, exp);
    showBanner();
    tok.value = "";
    const res = await Promise.all(reposToCheck().map(async (r) => [r, await read(r)]));
    out.innerHTML = res.map(reachLine).join("<br>");
    onStored?.(res);
  });
}

// UC-014 · Finish setting up your instance
function viewSetup(app) {
  const { T, main } = app;
  main().innerHTML = `
    <p class="crumbs"><a href="#uc">← back</a></p>
    <section class="head"><h2>Finish setting up your instance</h2>
      <p class="muted">Two steps, once per browser. They give this dashboard a key that can write to
      <strong>${h(T.instance)}</strong> — and nothing else. Each product gets a key of its own when you add it.</p></section>
    ${createKeyStep(app, [T.instance])}
    ${storeKeyStep(app)}
    <p id="setup-done"></p>`;
  wireStoreKey(app, () => [T.instance], (res) => {
    if (res.every(([, x]) => x.ok)) {
      document.getElementById("setup-done").innerHTML =
        `<a class="btn primary" href="#uc">Your instance is ready →</a> <a class="btn" href="#add">+ Add a product</a>`;
    }
  });
}

export const routes = { setup: (app) => viewSetup(app) };
