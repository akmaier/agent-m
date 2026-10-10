// MOD-settings-pages' implemented Settings slice: the endpoint settings MOD-browser-store already enumerates.

import { clearEverything, clearSetting, exportSettings, importSettings, listSettings, readSetting, writeSetting } from "../browser-store/index.mjs";
import { testEndpoint } from "../endpoint-calls/index.mjs";
import { notificationState, switchOff, switchOn, testNotification } from "../notifications/index.mjs";
import { explain } from "../site-frame/index.mjs";
import { readDocument, readRegister, writeDocument } from "../documents/index.mjs";
import { settingsSchemas, pseudonymisationOf } from "../personal-data/index.mjs";
import { saveFile } from "../artifact-edits/index.mjs";
import { checkProduct, credentialsFor, tokenSettingKey } from "./products.mjs";
import { connect, parseAddress } from "../repository-hosts/index.mjs";
import { pair } from "../bridge-client/index.mjs";

function el(name, className, ...children) {
  const node = document.createElement(name);
  if (className) node.className = className;
  node.append(...children);
  return node;
}

function attribute(node, name, value) {
  if (typeof node.setAttribute === "function") node.setAttribute(name, value);
  else node[name] = String(value);
}

function endpointName(key) {
  return key.slice("endpoint:".length);
}

function endpointConfig(name, setting) {
  return { name, kind: setting.kind, baseUrl: setting.url, model: setting.model, key: setting.key ?? null };
}

function resultText(result) {
  if (result.works) return `✓ ${result.model} is working.`;
  const { diagnosis } = result;
  const alternatives = diagnosis.routes.length ? ` Try this job through ${diagnosis.routes.map((route) => route === "ci" ? "CI" : "the Bridge").join(" or ")}.` : "";
  return `✗ ${diagnosis.message}${alternatives}`;
}

function stateText(lastTest) {
  if (!lastTest) return "Not set.";
  if (lastTest.outcome === "working") return `Works. Last successful test: ${lastTest.at}.`;
  return "Refused.";
}

function sharedPagesNotice(context) {
  const owner = String(context.instance?.repository ?? "").split("/")[0];
  return `Everything Agent M stores in this browser is stored for the address https://${owner}.github.io — every GitHub Pages site under that same ${owner}.github.io domain can read it.`;
}

function endpointLine(target, context, info) {
  const name = endpointName(info.key);
  const setting = readSetting(context.store, info.key);
  if (!setting) return null;
  const key = el("input", "settings-endpoint-key");
  const show = el("button", "settings-endpoint-show", "Show");
  const test = el("button", "settings-endpoint-test", "Test");
  const change = el("button", "settings-endpoint-change", "Change");
  const clear = el("button", "settings-endpoint-clear", "Clear");
  const result = el("p", "settings-endpoint-result");
  const status = el("p", "settings-endpoint-status", stateText(info.lastTest));
  key.type = "password";
  key.value = setting.key ?? "";
  key.autocomplete = "off";
  key.spellcheck = false;

  show.addEventListener("click", () => {
    const hidden = key.type === "password";
    key.type = hidden ? "text" : "password";
    show.textContent = hidden ? "Hide" : "Show";
  });
  test.addEventListener("click", async () => {
    if (setting.throughBridge) {
      result.textContent = "This local model requires Bridge setup before it can be tested. Its endpoint setting remains stored.";
      return;
    }
    result.textContent = "Testing the endpoint…";
    const checked = await testEndpoint(endpointConfig(name, setting));
    const lastTest = { at: new Date().toISOString(), outcome: checked.works ? "working" : "refused" };
    writeSetting(context.store, `last-test:${info.key}`, lastTest);
    result.textContent = resultText(checked);
    status.textContent = stateText(lastTest);
  });
  change.addEventListener("click", () => context.go("endpoints", { name }));
  clear.addEventListener("click", async () => {
    clearSetting(context.store, info.key);
    clearSetting(context.store, `last-test:${info.key}`);
    await route.render(target, context, {});
  });

  return el("section", "settings-endpoint",
    el("h3", null, info.label),
    el("p", null, `Model: ${setting.model}`),
    status,
    el("p", null, el("label", null, "API key ", key, " ", show)),
    el("p", "settings-endpoint-disclosure", `Agent M sends one short test request to ${setting.url}. Its optional key is sent only in that request's authorisation header, never in a URL or repository.`),
    el("p", null, test, " ", change, " ", clear),
    el("div", "settings-endpoint-explanation", explain("endpoint-test")),
    result,
  );
}

function bridgeLine(target, context) {
  const setting = readSetting(context.store, "bridge");
  if (!setting) return null;
  const token = el("input", "settings-bridge-token");
  const show = el("button", "settings-bridge-show", "Show");
  const change = el("button", "settings-bridge-change", "Change");
  const clear = el("button", "settings-bridge-clear", "Clear");
  token.type = "password";
  token.value = setting.token ?? "";
  token.autocomplete = "off";
  token.spellcheck = false;
  show.addEventListener("click", () => {
    const hidden = token.type === "password";
    token.type = hidden ? "text" : "password";
    show.textContent = hidden ? "Hide" : "Show";
  });
  change.addEventListener("click", () => context.go("bridge", {}));
  clear.addEventListener("click", async () => {
    clearSetting(context.store, "bridge");
    await route.render(target, context);
  });
  return el("section", "settings-bridge",
    el("h3", null, "Bridge"),
    el("p", null, `Address: ${setting.address}`),
    el("p", null, el("label", null, "Pairing token ", token, " ", show)),
    el("p", null, change, " ", clear),
  );
}

function jumpHostLine(target, context) {
  const setting = readSetting(context.store, "jump-host");
  if (!setting) return null;
  const change = el("button", "settings-jump-host-change", "Change");
  const clear = el("button", "settings-jump-host-clear", "Clear");
  change.addEventListener("click", () => context.go("bridge", {}));
  clear.addEventListener("click", async () => {
    clearSetting(context.store, "jump-host");
    await route.render(target, context);
  });
  return el("section", "settings-jump-host",
    el("h3", null, "Jump host"),
    el("p", null, `Host: ${setting.hostname}`),
    el("p", null, `HTTPS address: ${setting.httpsAddress ?? "Not configured."}`),
    el("p", null, change, " ", clear),
  );
}

function exportNotice(store) {
  const secrets = listSettings(store)
    .filter((setting) => setting.secret && readSetting(store, setting.key) !== null)
    .map((setting) => `${setting.label} (${setting.grants})`);
  const contained = secrets.length ? secrets.join("; ") : "no stored secret";
  return `This file contains every stored token, key and password. Whoever holds it can use: ${contained}. You may lock it with a passphrase; it cannot be recovered.`;
}

function exportImportControls(context) {
  const notice = el("p", "settings-export-notice", exportNotice(context.store));
  const passphrase = el("input", "settings-export-passphrase");
  const download = el("button", "settings-export-download", "Export settings");
  const file = el("input", "settings-import-file");
  const importPassphrase = el("input", "settings-import-passphrase");
  const result = el("p", "settings-import-result");
  passphrase.type = "password";
  passphrase.autocomplete = "new-password";
  importPassphrase.type = "password";
  importPassphrase.autocomplete = "current-password";
  file.type = "file";
  file.accept = "application/json";
  download.addEventListener("click", async () => {
    try {
      const text = await exportSettings(context.store, passphrase.value);
      const blob = new Blob([text], { type: "application/json" });
      const address = URL.createObjectURL(blob);
      const link = el("a");
      link.href = address;
      link.download = "agent-m-settings.json";
      link.click();
      URL.revokeObjectURL(address);
      result.textContent = "Settings export is ready.";
    } catch (error) {
      result.textContent = error.message;
    }
  });
  file.addEventListener("change", async () => {
    const chosen = file.files?.[0];
    if (!chosen) return;
    try {
      const imported = await importSettings(context.store, await chosen.text(), importPassphrase.value);
      result.textContent = `Added: ${imported.added.join(", ") || "none"}. Kept: ${imported.kept.join(", ") || "none"}.`;
    } catch (error) {
      result.textContent = error.message;
    }
  });
  return el("section", "settings-export-import",
    el("h3", null, "Export and import settings"),
    notice,
    el("p", null, el("label", null, "Optional export passphrase ", passphrase)),
    download,
    el("p", null, el("label", null, "Import settings file ", file)),
    el("p", null, el("label", null, "Import passphrase ", importPassphrase)),
    result,
  );
}

function browserClearControls(context) {
  const clear = el("button", "settings-clear-everything", "Clear everything in this browser");
  const acknowledgement = el("input", "settings-clear-ack");
  const result = el("p", "settings-clear-result");
  acknowledgement.type = "checkbox";
  clear.disabled = true;
  acknowledgement.addEventListener("change", () => { clear.disabled = !acknowledgement.checked; });
  clear.addEventListener("click", () => {
    clearEverything(context.store);
    clear.disabled = true;
    acknowledgement.checked = false;
    result.textContent = "Every Agent M setting for this instance is cleared from this browser.";
  });
  return el("section", "settings-clear",
    el("h3", null, "Clear this browser"),
    el("p", null, "This removes this instance's stored settings from localStorage and does not change a repository."),
    el("p", null, el("label", null, acknowledgement, " I understand this clears every Agent M setting in this browser.")),
    clear, result,
  );
}

function repositoryLine(context, info) {
  if (info.key !== "github-token" && info.key !== "products" &&
    !info.key.startsWith("github-token:") && !info.key.startsWith("gitlab-token:")) return null;
  if (info.key === "products") {
    const change = el("button", "settings-repository-change", "Add or remove products");
    const clear = el("button", "settings-repository-clear", "Clear");
    const status = el("p", "settings-repository-status", "Product addresses are stored in this browser.");
    change.addEventListener("click", () => context.go("add-product", {}));
    clear.addEventListener("click", () => {
      if (typeof globalThis.confirm !== "function" || !globalThis.confirm("Clear all managed products and their stored tokens from this browser?")) return;
      for (const web of readSetting(context.store, "products") ?? []) clearProductToken(context.store, web);
      clearSetting(context.store, info.key);
      status.textContent = "Cleared from this browser with every product's own token.";
    });
    return el("section", "settings-repository", el("h3", null, info.label), status, el("p", null, change, " ", clear));
  }
  const stored = readSetting(context.store, info.key);
  const value = el("input", "settings-repository-secret");
  const show = el("button", "settings-repository-show", "Show");
  const acknowledgement = el("input", "settings-repository-ack");
  const expiry = el("input", "settings-repository-expiry");
  const save = el("button", "settings-repository-save", "Save");
  const test = el("button", "settings-repository-test", "Test");
  const clear = el("button", "settings-repository-clear", "Clear");
  const change = el("button", "settings-repository-change", "Change");
  const result = el("p", "settings-repository-result");
  const address = repositoryAddress(context, info.key);
  const links = address ? connect(address, {}).webLinks() : null;
  const renewal = el("a", "settings-repository-renew", "Renew token ↗");
  if (links) renewal.href = links.projectTokens ?? links.tokens;
  else renewal.textContent = "Renewal link needs a repository address.";
  const status = el("p", "settings-repository-status", repositoryStatus(info, stored));
  const secret = stored?.value ?? "";
  value.type = "password";
  value.value = secret;
  value.autocomplete = "off";
  value.spellcheck = false;
  expiry.type = "date";
  expiry.value = stored?.expires ?? new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10);
  acknowledgement.type = "checkbox";
  acknowledgement.disabled = true;
  value.disabled = true;
  expiry.disabled = true;
  save.disabled = true;
  show.addEventListener("click", () => {
    const hidden = value.type === "password";
    value.type = hidden ? "text" : "password";
    show.textContent = hidden ? "Hide" : "Show";
  });
  acknowledgement.addEventListener("change", () => {
    value.disabled = expiry.disabled = save.disabled = !acknowledgement.checked;
    if (acknowledgement.checked) value.focus();
  });
  change.addEventListener("click", () => {
    acknowledgement.disabled = false;
    result.textContent = "Read the shared-browser notice, then acknowledge it before saving a replacement token.";
    acknowledgement.focus();
  });
  save.addEventListener("click", () => {
    const next = value.value.trim();
    if (!acknowledgement.checked || !next || !expiry.value) { result.textContent = "Acknowledge the notice, paste the token, and enter its expiry date first."; return; }
    writeSetting(context.store, info.key, { ...stored, value: next, name: stored?.name ?? info.label, expires: expiry.value, stored: new Date().toISOString().slice(0, 10) });
    clearSetting(context.store, `last-test:${info.key}`);
    status.textContent = repositoryStatus({ ...info, expires: expiry.value, lastTest: null }, readSetting(context.store, info.key));
    result.textContent = "Saved in this browser. Test it before using it.";
  });
  test.addEventListener("click", async () => {
    const setting = readSetting(context.store, info.key);
    if (!setting?.value) { result.textContent = "Save a token before testing it."; return; }
    if (!address) { result.textContent = "This stored token has no readable repository address to test. Change or clear it in this browser."; return; }
    result.textContent = "Testing the repository token…";
    let lastTest;
    try {
      await connect(address, { token: setting.value, tokenName: setting.name ?? info.label }).repositoryInfo();
      lastTest = { at: new Date().toISOString(), outcome: "working" };
      result.textContent = "✓ The repository token is working.";
    } catch (error) {
      lastTest = { at: new Date().toISOString(), outcome: "refused" };
      result.textContent = `✗ ${error.message}`;
    }
    writeSetting(context.store, `last-test:${info.key}`, lastTest);
    status.textContent = repositoryStatus({ ...info, lastTest }, setting);
  });
  clear.addEventListener("click", () => {
    const consequence = info.key === "github-token"
      ? "Without it, accepting and editing go through GitHub's own pages, products cannot be added, and private repositories cannot be read."
      : "Without it, this product can be read only if it is public, and nothing can be accepted or saved in it.";
    if (!globalThis.confirm(`Clear this token from this browser? ${consequence}`)) return;
    clearSetting(context.store, info.key);
    clearSetting(context.store, `last-test:${info.key}`);
    value.value = "";
    status.textContent = `Cleared from this browser. ${consequence}`;
  });
  return el("section", "settings-repository",
    el("h3", null, info.label), status,
    el("p", null, el("label", null, "Stored token ", value, " ", show)),
    el("p", null, `Expires on `, expiry, " ", renewal),
    el("details", "settings-repository-explanation", el("summary", null, "Why this token is needed"), el("p", null, "This token is used only to read and write this repository. Give it the minimum repository scope needed for that purpose.")),
    el("p", "notice settings-repository-shared-origin", sharedPagesNotice(context)),
    el("p", null, el("label", null, acknowledgement, " I have read this.")),
    el("p", null, change, " ", save, " ", test, " ", clear), result,
  );
}

function repositoryAddress(context, key) {
  try {
    if (key === "github-token") return parseAddress(`https://github.com/${context.instance.repository}`);
    if (key.startsWith("github-token:")) return parseAddress(`https://github.com/${key.slice("github-token:".length)}`);
    return parseAddress(`https://${key.slice("gitlab-token:".length)}`);
  } catch { return null; }
}

function repositoryStatus(info, stored) {
  if (!stored?.value) return "Not set.";
  const test = info.lastTest;
  const tested = test?.outcome === "working" ? ` Works. Last successful test: ${test.at}.` : test?.outcome === "refused" ? " Refused." : "";
  if (!info.expires) return `Stored in this browser.${tested}`;
  const days = Math.ceil((Date.parse(info.expires) - Date.now()) / 86400000);
  const expiry = days <= 14 ? `Expires on ${info.expires}; renew soon.` : `Expires on ${info.expires}.`;
  return `${expiry}${tested}`;
}

function productListControls(target, context) {
  const products = readSetting(context.store, "products");
  if (!Array.isArray(products) || !products.length) return null;
  const lines = products.map((web) => {
    const test = el("button", "settings-product-test", "Test");
    const remove = el("button", "settings-product-remove", "Remove");
    const result = el("p", "settings-product-list-result");
    test.addEventListener("click", async () => {
      try {
        const address = parseAddress(web);
        result.textContent = "Testing the product repository…";
        const checked = await checkProduct(address, credentialsFor(context.store, address));
        result.textContent = checked.ok ? `✓ ${web} is reachable.` : `✗ ${checked.error.message}`;
      } catch (error) { result.textContent = `✗ ${error.message}`; }
    });
    remove.addEventListener("click", async () => {
      if (typeof globalThis.confirm !== "function" || !globalThis.confirm(`Remove ${web} and its stored token from this browser?`)) return;
      clearProductToken(context.store, web);
      writeSetting(context.store, "products", products.filter((candidate) => candidate !== web));
      await route.render(target, context, {});
    });
    return el("section", "settings-product-list-item", el("h4", null, web), el("p", null, test, " ", remove), result);
  });
  return el("section", "settings-product-list", el("h3", null, "Managed products"), ...lines);
}

function clearProductToken(store, web) {
  const key = tokenSettingKey(parseAddress(web));
  clearSetting(store, key);
  clearSetting(store, `last-test:${key}`);
}

function notificationsControls(context) {
  const result = el("p", "settings-notifications-result");
  const state = notificationState(context.store);
  const status = el("p", "settings-notifications-status", state.on ? "On." : "Off.");
  const on = el("button", "settings-notifications-on", "Switch on");
  const test = el("button", "settings-notifications-test", "Test");
  const off = el("button", "settings-notifications-off", "Switch off");
  const refresh = (next) => {
    status.textContent = next.on ? "On. Agent M checks every five minutes only while a dashboard page is open; checks go to repository servers with this browser's tokens."
      : next.permission === "denied" ? "Blocked. Allow notifications for this site in the browser's own site settings, then reload."
        : next.available === "from the Home Screen" ? "On iPhone or iPad, add this site to the Home Screen before switching notifications on."
          : next.available === "no" ? "Notifications are not available in this browser." : "Off.";
    on.disabled = next.on || next.permission === "denied";
    test.disabled = !next.on;
    off.disabled = !next.on;
  };
  refresh(state);
  on.addEventListener("click", async () => {
    try { refresh(await switchOn(context.store)); }
    catch (error) { result.textContent = error.message; }
  });
  test.addEventListener("click", async () => {
    try { await testNotification(); result.textContent = "Test notification sent."; }
    catch (error) { result.textContent = error.message; }
  });
  off.addEventListener("click", async () => {
    await switchOff(context.store);
    refresh(notificationState(context.store));
    result.textContent = "Off. Browser permission remains until you remove it in browser settings.";
  });
  return el("section", "settings-notifications",
    el("h3", null, "Notifications"), status,
    el("p", null, on, " ", test, " ", off),
    explain("notifications"), result,
  );
}

function remoteSessionLine(target, context, info) {
  if (!info.key.startsWith("remote-session:")) return null;
  const session = readSetting(context.store, info.key);
  if (!session) return null;
  const token = el("input", "settings-remote-session-token");
  const show = el("button", "settings-remote-session-show", "Show");
  const test = el("button", "settings-remote-session-test", "Test");
  const change = el("button", "settings-remote-session-change", "Change");
  const clear = el("button", "settings-remote-session-clear", "Clear");
  const result = el("p", "settings-remote-session-result");
  token.type = "password";
  token.value = session.token ?? "";
  token.autocomplete = "off";
  token.spellcheck = false;
  show.addEventListener("click", () => {
    const hidden = token.type === "password";
    token.type = hidden ? "text" : "password";
    show.textContent = hidden ? "Hide" : "Show";
  });
  change.addEventListener("click", () => context.go("bridge", { name: info.key.slice("remote-session:".length) }));
  test.addEventListener("click", async () => {
    if (!Number.isInteger(session.port) || !session.token) { result.textContent = "This remote session needs a forwarded port and copied Bridge token before it can be tested."; return; }
    result.textContent = `Testing the forwarded Bridge at localhost:${session.port}…`;
    try {
      await pair(`http://localhost:${session.port}`, session.token);
      result.textContent = `✓ The forwarded Bridge answers at localhost:${session.port}.`;
    } catch (error) { result.textContent = `✗ ${error.message}`; }
  });
  clear.addEventListener("click", async () => {
    clearSetting(context.store, info.key);
    result.textContent = "Cleared from this browser.";
    await route.render(target, context, {});
  });
  return el("section", "settings-remote-session",
    el("h3", null, info.label),
    el("p", null, `Forwarded port: ${session.port ?? "Not configured."}`),
    el("p", null, el("label", null, "Copied Bridge token ", token, " ", show)),
    el("p", null, "Tunnel commands and proxy configuration are prepared on the Bridge page; no tunnel is started here."),
    el("p", null, test, " ", change, " ", clear), result,
  );
}

async function productControls(context) {
  if (!context.product) return el("section", "settings-product", el("p", null, "Choose a product to edit its repository settings."));
  const { settings, collaborators } = await settingsSchemas();
  const repository = await context.product.host.repositoryInfo();
  const { defaultBranch } = repository;
  const address = parseAddress(context.product.address);
  const credential = credentialsFor(context.store, address);
  const canWrite = Boolean(credential?.token && repository.canWrite === true);
  const snapshot = await context.product.host.readSnapshot(defaultBranch);
  const settingsText = await snapshot.read(settings.path);
  const collaboratorsText = await snapshot.read(collaborators.path);
  const legacyOff = (text) => /(^|\n)- pseudonymisation: off(?:\n|$)/.test(text ?? "");
  const settingState = (document, text) => legacyOff(text) ? "off" : pseudonymisationOf(document);
  let settingsDocument = readDocument(settings, settings.path, settingsText ?? "# Settings of this product\n");
  let collaboratorsBytes = collaboratorsText ?? "# Collaborators of this product\n\n| Name | Account | Agreed on |\n|---|---|---|\n";
  let collaboratorsDocument = readDocument(collaborators, collaborators.path, collaboratorsBytes);
  let settingsBlob = snapshot.blob(settings.path), collaboratorsBlob = snapshot.blob(collaborators.path);
  let settingsBytes = settingsText ?? "# Settings of this product\n";
  const legacyCollaborators = [...collaboratorsBytes.matchAll(/^\|\s*([^|]+?)\s*\|\s*@?([^|]+?)\s*\|\s*(\d{4}-\d{2}-\d{2})\s*\|\s*$/gm)]
    .map((row) => ({ name: row[1].trim(), account: row[2].trim().replace(/^@/, ""), agreed: row[3] }));
  const collaboratorRows = legacyCollaborators.length ? legacyCollaborators : (collaboratorsDocument.sections[0]?.rows ?? [])
    .map((row) => ({ name: row.cells.Name, account: String(row.cells.Account ?? "").replace(/^@/, ""), agreed: row.cells["Agreed on"] ?? row.cells.Agreed ?? "recorded" }));
  const state = el("p", "settings-pseudonymisation-state", `Pseudonymisation is ${settingState(settingsDocument, settingsBytes)}.`);
  const collaboratorRecords = el("ul", "settings-collaborator-records", ...collaboratorRows.map((row) => el("li", null, `${row.name} · @${row.account} · agreed on ${row.agreed}`)));
  const access = repository.canWrite === true ? "writable" : repository.canWrite === false ? "read-only" : "not reported";
  if (!canWrite) {
    const tokenStep = el("button", "settings-product-token-step", "Open the token step of UC-001");
    tokenStep.addEventListener("click", () => context.go("add-product", {}));
    const reason = credential?.token ? "The repository reports this credential cannot write." : "This browser has no token that can write to this product.";
    return el("section", "settings-product",
      el("h3", null, `Product · ${context.product.address}`),
      el("p", "settings-product-access", `Repository access: ${access}.`),
      el("p", "settings-product-read-only", `Read-only: ${reason} `, tokenStep),
      state,
      el("h4", null, "Collaborators"),
      el("ul", "settings-collaborator-records", ...collaboratorRows.map((row) => el("li", null, `${row.name} · @${row.account} · agreed on ${row.agreed}`))));
  }
  const off = el("input", "settings-pseudonymisation-off"); off.type = "checkbox"; off.checked = settingState(settingsDocument, settingsBytes) === "off";
  const acknowledgement = el("input", "settings-pseudonymisation-ack"); acknowledgement.type = "checkbox";
  const save = el("button", "settings-pseudonymisation-save", "Save pseudonymisation");
  const pseudoResult = el("p", "settings-pseudonymisation-result");
  save.addEventListener("click", async (event) => {
    if (!event.isTrusted) return;
    if (off.checked && !acknowledgement.checked) { pseudoResult.textContent = "Tick I have read this before switching pseudonymisation off."; return; }
    const legacy = /(^|\n)- pseudonymisation: (?:on|off)(?=\n|$)/;
    const edited = { ...settingsDocument, fields: { ...settingsDocument.fields, pseudonymisation: off.checked ? "off" : "on" } };
    const text = legacy.test(settingsBytes) ? (off.checked ? settingsBytes.replace(legacy, "$1- pseudonymisation: off") : settingsBytes.replace(legacy, "$1"))
      : (writeDocument(settings, edited) || `---\npseudonymisation: ${off.checked ? "off" : "on"}\n---\n# Settings of this product\n`);
    const result = await saveFile(context.product.host, { path: settings.path, text, openedBlob: settingsBlob });
    if (result.refused) { pseudoResult.textContent = "Product settings changed meanwhile; nothing was written."; return; }
    settingsBlob = result.blob; settingsBytes = text; settingsDocument = readDocument(settings, settings.path, text);
    state.textContent = `Pseudonymisation is ${settingState(settingsDocument, settingsBytes)}.`;
    pseudoResult.textContent = "Saved in the product repository.";
  });
  const name = el("input", "settings-collaborator-name"), account = el("input", "settings-collaborator-account");
  const agreed = el("input", "settings-collaborator-agreed"); agreed.type = "checkbox";
  const agreedDate = el("input", "settings-collaborator-agreed-date"); agreedDate.type = "date"; agreedDate.value = new Date().toISOString().slice(0, 10);
  const add = el("button", "settings-collaborator-save", "Save collaborator"); const collabResult = el("p", "settings-collaborator-result");
  const removeName = el("input", "settings-collaborator-remove-name"), removeAccount = el("input", "settings-collaborator-remove-account");
  const remove = el("button", "settings-collaborator-remove", "Remove collaborator consent");
  add.addEventListener("click", async (event) => {
    if (!event.isTrusted) return;
    if (!agreed.checked) { collabResult.textContent = "Tick that this person has agreed to be named."; return; }
    const legacyRows = [...collaboratorsBytes.matchAll(/^\|\s*([^|]+?)\s*\|\s*@?([^|]+?)\s*\|\s*(\d{4}-\d{2}-\d{2})\s*\|\s*$/gm)];
    if (legacyRows.length || /\| Name \| Account \| Agreed on \|/.test(collaboratorsBytes)) {
      const date = agreedDate.value;
      const text = `${collaboratorsBytes}${collaboratorsBytes.endsWith("\n") ? "" : "\n"}| ${name.value.trim()} | @${account.value.trim().replace(/^@/, "")} | ${date} |\n`;
      const result = await saveFile(context.product.host, { path: collaborators.path, text, openedBlob: collaboratorsBlob });
      if (result.refused) { collabResult.textContent = "Collaborators changed meanwhile; nothing was written."; return; }
      collaboratorsBlob = result.blob; collaboratorsBytes = text;
      const records = el("li", null, `${name.value.trim()} · @${account.value.trim().replace(/^@/, "")} · agreed on ${date}`);
      collaboratorRecords.append(records);
      collabResult.textContent = "Saved in the product repository."; return;
    }
    const rows = collaboratorsDocument.sections[0]?.rows ?? [];
    const edited = { ...collaboratorsDocument, sections: [{ ...(collaboratorsDocument.sections[0] ?? { heading: "# Collaborators of this product", line: 1, text: "", rows: [] }), rows: [...rows, { line: null, cells: { Name: name.value.trim(), Account: account.value.trim(), Agreed: "yes" } }] }] };
    const text = writeDocument(collaborators, edited) || `# Collaborators of this product\n\n| Name | Account | Agreed |\n|---|---|---|\n| ${name.value.trim()} | ${account.value.trim()} | yes |\n`;
    const result = await saveFile(context.product.host, { path: collaborators.path, text, openedBlob: collaboratorsBlob });
    if (result.refused) { collabResult.textContent = "Collaborators changed meanwhile; nothing was written."; return; }
    collaboratorsBlob = result.blob; collaboratorsDocument = readDocument(collaborators, collaborators.path, text);
    collaboratorRecords.append(el("li", null, `${name.value.trim()} · @${account.value.trim().replace(/^@/, "")} · agreed on recorded`));
    collabResult.textContent = "Saved in the product repository.";
  });
  remove.addEventListener("click", async (event) => {
    if (!event.isTrusted) return;
    const wantedName = removeName.value.trim(), wantedAccount = removeAccount.value.trim().replace(/^@/, "");
    if (!wantedName || !wantedAccount) { collabResult.textContent = "Enter the collaborator name and account to remove consent."; return; }
    const legacyRows = [...collaboratorsBytes.matchAll(/^\|\s*([^|]+?)\s*\|\s*@?([^|]+?)\s*\|\s*(\d{4}-\d{2}-\d{2})\s*\|\s*$/gm)];
    const legacy = legacyRows.find((row) => row[1].trim() === wantedName && row[2].trim().replace(/^@/, "") === wantedAccount);
    let text;
    if (legacy) text = collaboratorsBytes.replace(legacy[0], "");
    else {
      const rows = collaboratorsDocument.sections[0]?.rows ?? [];
      const kept = rows.filter((row) => row.cells.Name !== wantedName || String(row.cells.Account ?? "").replace(/^@/, "") !== wantedAccount);
      if (kept.length === rows.length) { collabResult.textContent = "No matching consenting collaborator is stored."; return; }
      text = writeDocument(collaborators, { ...collaboratorsDocument, sections: [{ ...collaboratorsDocument.sections[0], rows: kept }] });
    }
    const result = await saveFile(context.product.host, { path: collaborators.path, text, openedBlob: collaboratorsBlob });
    if (result.refused) { collabResult.textContent = "Collaborators changed meanwhile; nothing was written."; return; }
    collaboratorsBlob = result.blob; collaboratorsBytes = text; collaboratorsDocument = readDocument(collaborators, collaborators.path, text);
    collaboratorRecords.replaceChildren(...Array.from(collaboratorRecords.childNodes).filter((node) => !node.textContent.includes(`${wantedName} · @${wantedAccount} ·`)));
    collabResult.textContent = "Removed this collaborator's consent record; earlier commits keep the name in the history. ";
    if (result.commit) { const address = parseAddress(context.product.address); const link = el("a", "settings-collaborator-withdrawal-commit", "View removal commit"); link.href = `${address.web}/${address.kind === "gitlab" ? "-/commit" : "commit"}/${result.commit}`; collabResult.append(link); }
  });
  return el("section", "settings-product",
    el("h3", null, `Product · ${context.product.address}`), state,
    el("p", null, el("label", null, off, " Switch pseudonymisation off")),
    el("p", "notice", "When off, report data enters issues and the repository unchanged. In a public product it is published; use only a protected, non-public data space. Data already written remains in history; removing that data requires a history rewrite."),
    el("p", null, el("label", null, acknowledgement, " I have read this."), " ", save), pseudoResult,
    el("h4", null, "Collaborators"),
    collaboratorRecords,
    el("p", null, el("label", null, "Name ", name)), el("p", null, el("label", null, "Account ", account)),
    el("p", null, el("label", null, agreed, " This person has agreed to be named."), " ", el("label", null, "Consent date ", agreedDate), " ", add),
    el("h4", null, "Remove collaborator consent"),
    el("p", null, el("label", null, "Name ", removeName)), el("p", null, el("label", null, "Account ", removeAccount)),
    el("p", null, "Earlier commits keep the name in the history. ", remove), collabResult);
}

function tabbedSettings(panes) {
  const tabs = el("div", "settings-tabs");
  attribute(tabs, "role", "tablist");
  const buttons = [];
  const select = (selected) => {
    for (const { button, pane } of buttons) {
      const chosen = button === selected;
      attribute(button, "aria-selected", String(chosen));
      button.tabIndex = chosen ? 0 : -1;
      pane.hidden = !chosen;
    }
    selected.focus();
  };
  for (const pane of panes) {
    attribute(pane.node, "role", "tabpanel");
    attribute(pane.node, "aria-label", pane.name);
    const button = el("button", "settings-tab btn", pane.name);
    attribute(button, "role", "tab");
    attribute(button, "aria-controls", pane.id);
    pane.node.id = pane.id;
    button.addEventListener("click", () => select(button));
    button.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      event.preventDefault();
      const index = buttons.findIndex((candidate) => candidate.button === button);
      select(buttons[(index + (event.key === "ArrowRight" ? 1 : buttons.length - 1)) % buttons.length].button);
    });
    buttons.push({ button, pane: pane.node });
    tabs.append(button);
  }
  select(buttons[0].button);
  return { tabs, panels: panes.map((pane) => pane.node) };
}

function configurationControls(context) {
  const endpoint = el("button", "settings-endpoint-configure", "Configure a model endpoint");
  const bridge = el("button", "settings-bridge-configure", "Configure the Agent M Bridge");
  endpoint.addEventListener("click", () => context.go("endpoints", {}));
  bridge.addEventListener("click", () => context.go("bridge", {}));
  return el("p", "settings-configure", endpoint, " ", bridge);
}

export const route = {
  name: "settings",
  entry: "settings",
  title: "Settings",
  async render(target, context) {
    const endpoints = listSettings(context.store)
      .filter((setting) => setting.key.startsWith("endpoint:"))
      .map((setting) => endpointLine(target, context, setting))
      .filter(Boolean);
    const bridge = bridgeLine(target, context);
    const jumpHost = jumpHostLine(target, context);
    const remoteSessions = listSettings(context.store).map((info) => remoteSessionLine(target, context, info)).filter(Boolean);
    const general = el("section", "settings-tab-panel",
      el("h3", null, "General · this browser"),
      el("div", "settings-browser-explanation", explain("endpoint-route")),
      el("p", "notice settings-shared-origin", sharedPagesNotice(context)),
      exportImportControls(context), browserClearControls(context));
    const product = await productControls(context);
    const productList = productListControls(target, context);
    const repositories = el("section", "settings-tab-panel",
      el("h3", null, "Repositories · browser credentials and product records"),
      ...listSettings(context.store).map((info) => repositoryLine(context, info)).filter(Boolean),
      ...(productList ? [productList] : []), product);
    const endpointPane = el("section", "settings-tab-panel",
      el("h3", null, "Endpoints & Agents · this browser"),
      configurationControls(context),
      ...(bridge ? [bridge] : []), ...(jumpHost ? [jumpHost] : []),
      ...remoteSessions,
      el("div", "settings-endpoints", ...endpoints));
    const usability = el("section", "settings-tab-panel",
      el("h3", null, "Usability · this browser"), notificationsControls(context));
    const tabbed = tabbedSettings([
      { name: "General", id: "settings-general", node: general },
      { name: "Repositories", id: "settings-repositories", node: repositories },
      { name: "Endpoints & Agents", id: "settings-endpoints-agents", node: endpointPane },
      { name: "Usability", id: "settings-usability", node: usability },
    ]);
    target.replaceChildren(el("h2", null, "Settings"), tabbed.tabs, ...tabbed.panels);
  },
};
