// MOD-settings-pages' implemented Settings slice: the endpoint settings MOD-browser-store already enumerates.

import { clearEverything, clearSetting, exportSettings, importSettings, listSettings, readSetting, writeSetting } from "../browser-store/index.mjs";
import { testEndpoint } from "../endpoint-calls/index.mjs";
import { notificationState, switchOff, switchOn, testNotification } from "../notifications/index.mjs";
import { explain } from "../site-frame/index.mjs";
import { readDocument, readRegister, writeDocument } from "../documents/index.mjs";
import { participantSchema } from "../participant-list/index.mjs";
import { resourceSchema } from "../resource-list/index.mjs";
import { settingsSchemas, pseudonymisationOf } from "../personal-data/index.mjs";
import { saveFile } from "../artifact-edits/index.mjs";
import { jobWorkflowFiles } from "../runtimes/index.mjs";
import { checkProduct, credentialsFor, tokenSettingKey, route as addProductRoute } from "./products.mjs";
import { connect, parseAddress } from "../repository-hosts/index.mjs";
import { bridgeAt, pair, probe, settingsOf, testBridge } from "../bridge-client/index.mjs";
import { bridgeFailureText, bridgeSettings as endpointBridgeSettings, recordTest, route as endpointsRoute } from "./endpoints.mjs";
import { route as bridgeRoute } from "./bridge.mjs";
import { mailboxLine } from "./mailbox.mjs";

// The Settings page's own context, held by the context its tabs' forms open in.
const PAGE = Symbol("the Settings page's own context");

// The tab each Settings page shows, by the page's own context: a render the page asks for itself keeps the tab the person
// chose; Settings opened anew, with a context of its own, shows its first tab.
const chosenTabs = new WeakMap();

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

function whatIsThis(text) {
  return el("details", "explain settings-what-is-this", el("summary", null, "What is this?"), el("div", null, text));
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
  const show = el("button", "settings-endpoint-show btn small", "Show");
  const test = el("button", "settings-endpoint-test btn", "Test");
  const change = el("button", "settings-endpoint-change btn", "Change");
  const clear = el("button", "settings-endpoint-clear btn", "Clear");
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
    if (setting.bridge) {
      let bridgeSettings;
      try { bridgeSettings = endpointBridgeSettings(context.store, setting.bridge); } catch (error) {
        result.textContent = bridgeFailureText(error);
        return;
      }
      if (!bridgeSettings) {
        result.textContent = `The endpoint names Bridge ${setting.bridge}, but this browser does not keep it. Change the endpoint or set up that Bridge.`;
        return;
      }
      result.textContent = `Testing the endpoint through Bridge ${setting.bridge}…`;
      try {
        const checked = await probe(bridgeAt(bridgeSettings), "endpoint-test", endpointConfig(name, setting));
        const lastTest = recordTest(context.store, info.key, checked);
        result.textContent = resultText(checked);
        status.textContent = stateText(lastTest);
      } catch (error) {
        result.textContent = bridgeFailureText(error);
      }
      return;
    }
    result.textContent = "Testing the endpoint…";
    const checked = await testEndpoint(endpointConfig(name, setting));
    const lastTest = recordTest(context.store, info.key, checked);
    result.textContent = resultText(checked);
    status.textContent = stateText(lastTest);
  });
  change.addEventListener("click", () => context.go("endpoints", { name }));
  clear.addEventListener("click", async () => {
    clearSetting(context.store, info.key);
    clearSetting(context.store, `last-test:${info.key}`);
    await route.render(target, context, {});
  });

  return el("section", "settings-endpoint panel",
    el("h3", null, info.label),
    el("p", null, `Model: ${setting.model}`),
    status,
    el("p", null, el("label", null, "API key ", key, " ", show)),
    el("p", "settings-endpoint-disclosure", setting.bridge
      ? `Agent M sends one short test request to Bridge ${setting.bridge}. Its optional endpoint key is inside that Bridge request; Bridge and jump-host credentials are sent only as authorisation headers, never in a URL or repository.`
      : `Agent M sends one short test request to ${setting.url}. Its optional key is sent only in that request's authorisation header, never in a URL or repository.`),
    el("p", null, test, " ", change, " ", clear),
    el("div", "settings-endpoint-explanation", explain("endpoint-test")),
    result,
  );
}

function bridgeLine(target, context) {
  const setting = readSetting(context.store, "bridge");
  if (!setting) return null;
  const token = el("input", "settings-bridge-token");
  const show = el("button", "settings-bridge-show btn small", "Show");
  const change = el("button", "settings-bridge-change btn", "Change");
  const clear = el("button", "settings-bridge-clear btn", "Clear");
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
  return el("section", "settings-bridge panel",
    el("h3", null, "Bridge"),
    el("p", null, `Address: ${setting.address}`),
    el("p", null, el("label", null, "Pairing token ", token, " ", show)),
    whatIsThis("This browser keeps the Bridge address and pairing token so it can reach the Bridge. Anyone able to read this browser's Pages storage can read them."),
    el("p", null, change, " ", clear),
  );
}

// What a failed Bridge or jump-host test says, as far as a browser lets a page know why.
function bridgeTestFailure(error) {
  if (error?.name === "NoAnswer") return `The Bridge gave no answer. Possible causes: ${error.likely?.join(", ") ?? "its address"}.`;
  if (error?.name === "TokenRefused") return "The Bridge refused its pairing token. Copy its current token and pair it again.";
  if (error?.name === "JumpHostLoginRefused") return "The jump host refused its web login. Check that login in Bridge settings and save it again.";
  if (error?.name === "JumpHostMissing") return "This Bridge is reached through the jump host, and no jump host is stored. Set it up on the Bridge page.";
  if (error?.name === "Timeout") return "The Bridge did not answer in time. Check that it is running, then test again.";
  return error?.message ?? String(error);
}

// The agents on the Bridge `name` that the instance's participants name: the rows of docs/participants.md whose route is `bridge <name> agent <agent>`.
async function participantsOnBridge(host, name) {
  const { defaultBranch } = await host.repositoryInfo();
  const text = await (await host.readSnapshot(defaultBranch)).read("docs/participants.md");
  if (text === null || text === undefined) return [];
  return readRegister(participantSchema(), "docs/participants.md", text).rows
    .map(({ cells }) => ({ name: cells.Name, route: /^bridge (\S+) agent (\S+)$/.exec(String(cells.Route ?? "").trim()) }))
    .filter(({ route }) => route && route[1] === name).map((row) => `${row.name} (${row.route[2]})`);
}

// The resources of the list docs/resources.md of a repository whose route is exactly `bridge <name>`, by their names (MOD-resource-list, Data: Route); a repository that holds no list has none.
async function resourcesOnBridge(host, name) {
  const { defaultBranch } = await host.repositoryInfo();
  const snapshot = await host.readSnapshot(defaultBranch);
  if (!snapshot.paths.includes("docs/resources.md")) return [];
  const text = await snapshot.read("docs/resources.md");
  if (text === null || text === undefined) return [];
  return readRegister(resourceSchema(), "docs/resources.md", text).rows
    .filter(({ cells }) => /^bridge (\S+)$/.exec(String(cells.Route ?? "").trim())?.[1] === name).map(({ cells }) => cells.Name);
}

// What clearing the Bridge `name` stops working in this browser, said before it is cleared (UC-042, 2a): the endpoints, the participants, the resources of the instance and of the chosen
// product, and the mailbox that name it. Participants and resources that cannot be read are said to be unread, never left out as if there were none.
async function clearingConsequence(context, name) {
  const endpoints = listSettings(context.store).filter((setting) => setting.key.startsWith("endpoint:"))
    .filter((setting) => readSetting(context.store, setting.key)?.bridge === name).map((setting) => endpointName(setting.key));
  let participants = [], unread = null;
  if (context.instance?.host) {
    try { participants = await participantsOnBridge(context.instance.host, name); } catch (error) { unread = error?.message ?? String(error); }
  }
  const lists = [];
  for (const [label, host] of [["instance", context.instance?.host], ["product", context.product?.host]]) {
    if (!host) continue;
    try { lists.push({ label, names: await resourcesOnBridge(host, name), unread: null }); } catch (error) { lists.push({ label, names: [], unread: error?.message ?? String(error) }); }
  }
  const mailbox = readSetting(context.store, "mailbox")?.imap?.bridge === name;
  const plural = (list, one, many) => (list.length === 1 ? one : many);
  const sentences = [
    ...(endpoints.length ? [`${plural(endpoints, "The endpoint", "The endpoints")} ${endpoints.join(", ")} ${plural(endpoints, "names", "name")} it.`] : []),
    ...(participants.length ? [`${plural(participants, "The participant", "The participants")} ${participants.join(", ")} ${plural(participants, "names", "name")} it.`] : []),
    ...(unread ? [`The participants could not be read (${unread}), so those that name it are not listed.`] : []),
    ...lists.flatMap(({ label, names, unread: why }) => [
      ...(names.length ? [`${plural(names, "The resource", "The resources")} ${names.join(", ")} of the ${label} ${plural(names, "names", "name")} it.`] : []),
      ...(why ? [`The ${label}'s resources could not be read (${why}), so those that name it are not listed.`] : []),
    ]),
    ...(mailbox ? ["The mailbox connection names it."] : []),
  ];
  return sentences.length ? `${sentences.join(" ")} ${unread && sentences.length === 1 ? "" : "They will have no Bridge to go through."}`.trim() : "Nothing in this browser names this Bridge.";
}

// The Bridges this browser keeps, each under its name: `bridge:<name>`.
function bridgeNamedLine(target, context, info) {
  const name = info.key.slice("bridge:".length);
  const entry = readSetting(context.store, info.key);
  if (!entry || typeof entry !== "object") return null;
  const token = el("input", "settings-bridge-named-token");
  const show = el("button", "settings-bridge-named-show btn small", "Show");
  const test = el("button", "settings-bridge-named-test btn", "Test");
  const change = el("button", "settings-bridge-named-change btn", "Change");
  const clear = el("button", "settings-bridge-named-clear btn", "Clear");
  const result = el("p", "settings-bridge-named-result");
  const status = el("p", "settings-bridge-named-status", stateText(info.lastTest));
  token.type = "password";
  token.value = entry.token ?? "";
  token.autocomplete = "off";
  token.spellcheck = false;
  const where = () => (typeof entry.address === "string" ? entry.address : `port ${entry.port} of the jump host`);
  show.addEventListener("click", () => {
    const hidden = token.type === "password";
    token.type = hidden ? "text" : "password";
    show.textContent = hidden ? "Hide" : "Show";
  });
  change.addEventListener("click", () => context.go("bridge", { name }));
  test.addEventListener("click", async () => {
    let lastTest;
    try {
      const settings = settingsOf({ name, ...entry }, readSetting(context.store, "jump-host"));
      result.textContent = `Testing ${name} at ${settings.address}…`;
      await testBridge(bridgeAt(settings));
      lastTest = { at: new Date().toISOString(), outcome: "working" };
      result.textContent = `✓ ${name} answers at ${settings.address}.`;
    } catch (error) {
      lastTest = { at: new Date().toISOString(), outcome: "refused" };
      result.textContent = `✗ ${bridgeTestFailure(error)}`;
    }
    writeSetting(context.store, `last-test:${info.key}`, lastTest);
    status.textContent = stateText(lastTest);
  });
  clear.addEventListener("click", async () => {
    const consequence = await clearingConsequence(context, name);
    if (typeof globalThis.confirm !== "function" || !globalThis.confirm(`Clear the Bridge ${name} from this browser? ${consequence}`)) return;
    clearSetting(context.store, info.key);
    clearSetting(context.store, `last-test:${info.key}`);
    await route.render(target, context, {});
  });
  return el("section", "settings-bridge-named panel",
    el("h3", null, "Bridge: ", el("span", "settings-bridge-named-name", name)), status,
    el("p", null, `Reached at: ${where()}`),
    el("p", null, el("label", null, "Pairing token ", token, " ", show)),
    whatIsThis("This browser keeps the Bridge's address, or its port on the jump host, and its pairing token under the name the Bridge reports. Anyone able to read this browser's Pages storage can read them."),
    el("p", null, test, " ", change, " ", clear), result,
  );
}

function jumpHostLine(target, context) {
  const setting = readSetting(context.store, "jump-host");
  if (!setting) return null;
  const test = el("button", "settings-jump-host-test btn", "Test");
  const result = el("p", "settings-jump-host-result");
  const status = el("p", "settings-jump-host-status", stateText(readSetting(context.store, "last-test:jump-host")));
  test.addEventListener("click", async () => {
    if (!setting.httpsAddress) { result.textContent = "No HTTPS address is stored for the jump host, so there is nothing to call."; return; }
    let outcome = "working";
    try {
      result.textContent = `Calling ${setting.httpsAddress}…`;
      // The jump host serves only the paths of Bridges: the path asked for is answered by its web server after the login, not by a Bridge,
      // and the placeholder in the token header is no secret.
      await testBridge(bridgeAt({ address: setting.httpsAddress, token: "jump-host-test", ...(setting.login ? { login: setting.login } : {}) }));
      result.textContent = `✓ The jump host's web server answers at ${setting.httpsAddress}.`;
    } catch (error) {
      if (error?.name === "BridgeFailed" || (error?.name === "TokenRefused" && setting.login)) {
        result.textContent = `✓ The jump host's web server answers at ${setting.httpsAddress} and accepted its login.`;
      } else {
        outcome = "refused";
        result.textContent = error?.name === "JumpHostLoginRefused" ? "✗ The jump host's web server refused its login. Check the web login and save it again."
          : `✗ ${bridgeTestFailure(error)}`;
      }
    }
    const lastTest = { at: new Date().toISOString(), outcome };
    writeSetting(context.store, "last-test:jump-host", lastTest);
    status.textContent = stateText(lastTest);
  });
  const change = el("button", "settings-jump-host-change btn", "Change");
  const clear = el("button", "settings-jump-host-clear btn", "Clear");
  change.addEventListener("click", () => context.go("bridge", {}));
  clear.addEventListener("click", async () => {
    clearSetting(context.store, "jump-host");
    await route.render(target, context);
  });
  return el("section", "settings-jump-host panel",
    el("h3", null, "Jump host"),
    el("p", null, `Host: ${setting.hostname}`),
    el("p", null, `HTTPS address: ${setting.httpsAddress ?? "Not configured."}`),
    whatIsThis("This browser keeps the jump-host connection details so the Bridge can prepare remote sessions. Anyone able to read this browser's Pages storage can read them."),
    status, el("p", null, test, " ", change, " ", clear), result,
  );
}

// Whether the export would carry the mailbox's sign-in tokens: the sign-in library's keys are no setting of their own, so the export itself says.
async function carriesSignIn(store) {
  return Object.keys(JSON.parse(await exportSettings(store)).foreign ?? {}).length > 0;
}

function exportNotice(store, signIn) {
  const secrets = listSettings(store)
    .filter((setting) => setting.secret && (readSetting(store, setting.key) !== null || (setting.key === "mailbox-sign-in" && signIn)))
    .map((setting) => `${setting.label} (${setting.grants})`);
  const contained = secrets.length ? secrets.join("; ") : "no stored secret";
  return `This file contains every stored token, key and password. Whoever holds it can use: ${contained}. You may lock it with a passphrase; it cannot be recovered.`;
}

function exportImportControls(context, signIn) {
  const notice = el("p", "settings-export-notice", exportNotice(context.store, signIn));
  const passphrase = el("input", "settings-export-passphrase");
  const download = el("button", "settings-export-download btn primary", "Export settings");
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
  return el("section", "settings-export-import panel",
    el("h3", null, "Export and import settings"),
    notice,
    el("p", null, el("label", null, "Optional export passphrase ", passphrase)),
    download,
    el("p", null, el("label", null, "Import settings file ", file)),
    el("p", null, el("label", null, "Import passphrase ", importPassphrase)),
    whatIsThis("Export copies this browser's settings, including secrets, into a file for this person to keep or move. Import reads that file into this browser; whoever holds an unlocked export can read its settings."),
    result,
  );
}

function browserClearControls(context) {
  const clear = el("button", "settings-clear-everything btn", "Clear everything in this browser");
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
  return el("section", "settings-clear panel",
    el("h3", null, "Clear this browser"),
    el("p", null, "This removes this instance's stored settings from localStorage and does not change a repository."),
    whatIsThis("This removes every Agent M setting held in this browser. It changes no repository, and any Pages site under the same owner domain that can read this storage loses access too."),
    el("p", null, el("label", null, acknowledgement, " I understand this clears every Agent M setting in this browser.")),
    clear, result,
  );
}

function repositoryLine(target, context, info) {
  if (info.key !== "github-token" && info.key !== "products" &&
    !info.key.startsWith("github-token:") && !info.key.startsWith("gitlab-token:")) return null;
  if (info.key === "products") {
    const change = el("button", "settings-repository-change btn", "Add or remove products");
    const clear = el("button", "settings-repository-clear btn", "Clear");
    const status = el("p", "settings-repository-status", "Product addresses are stored in this browser.");
    change.addEventListener("click", () => context.go("add-product", {}));
    clear.addEventListener("click", async () => {
      if (typeof globalThis.confirm !== "function" || !globalThis.confirm("Clear all managed products and their stored tokens from this browser?")) return;
      for (const web of readSetting(context.store, "products") ?? []) clearProductToken(context.store, web);
      clearSetting(context.store, info.key);
      status.textContent = "Cleared from this browser with every product's own token.";
      await route.render(target, context, {});
    });
    return el("section", "settings-repository panel", el("h3", null, info.label), status,
      whatIsThis("This browser keeps the list of managed product addresses so it can open their repository settings. Any Pages site under the same owner domain can read that browser storage."),
      el("p", null, change, " ", clear));
  }
  const stored = readSetting(context.store, info.key);
  const value = el("input", "settings-repository-secret");
  const show = el("button", "settings-repository-show btn small", "Show");
  const acknowledgement = el("input", "settings-repository-ack");
  const expiry = el("input", "settings-repository-expiry");
  const save = el("button", "settings-repository-save btn primary", "Save");
  const test = el("button", "settings-repository-test btn", "Test");
  const clear = el("button", "settings-repository-clear btn", "Clear");
  const change = el("button", "settings-repository-change btn", "Change");
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
  acknowledgement.checked = Boolean(readSetting(context.store, "acknowledged:shared-origin"));
  acknowledgement.disabled = true;
  value.disabled = true;
  expiry.disabled = true;
  save.disabled = true;
  // UC-042 step 2: Change opens the form — the notice, I have read this and Save — in place; until then none of it is shown.
  const notice = el("p", "notice settings-repository-shared-origin", sharedPagesNotice(context));
  const acknowledgementLine = el("p", null, el("label", null, acknowledgement, " I have read this."));
  notice.hidden = acknowledgementLine.hidden = save.hidden = true;
  show.addEventListener("click", () => {
    const hidden = value.type === "password";
    value.type = hidden ? "text" : "password";
    show.textContent = hidden ? "Hide" : "Show";
  });
  acknowledgement.addEventListener("change", () => {
    if (acknowledgement.checked) writeSetting(context.store, "acknowledged:shared-origin", new Date().toISOString().slice(0, 10));
    else clearSetting(context.store, "acknowledged:shared-origin");
    value.disabled = expiry.disabled = save.disabled = !acknowledgement.checked;
    if (acknowledgement.checked) value.focus();
  });
  change.addEventListener("click", () => {
    notice.hidden = acknowledgementLine.hidden = save.hidden = false;
    acknowledgement.disabled = false;
    const alreadyAcknowledged = Boolean(readSetting(context.store, "acknowledged:shared-origin"));
    acknowledgement.checked = alreadyAcknowledged;
    if (alreadyAcknowledged) {
      value.disabled = expiry.disabled = save.disabled = false;
      result.textContent = "The shared-browser notice was already acknowledged in this browser.";
      value.focus();
    } else {
      result.textContent = "Read the shared-browser notice, then acknowledge it before saving a replacement token.";
      acknowledgement.focus();
    }
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
  return el("section", "settings-repository panel",
    el("h3", null, info.label), status,
    el("p", null, el("label", null, "Stored token ", value, " ", show)),
    el("p", null, `Expires on `, expiry, " ", renewal),
    whatIsThis("This browser keeps this token so Agent M can read and write this repository. Any Pages site under the same owner domain can read it; give it only the minimum repository scope needed."),
    notice, acknowledgementLine,
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
    const test = el("button", "settings-product-test btn", "Test");
    const remove = el("button", "settings-product-remove btn", "Remove");
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
    return el("section", "settings-product-list-item", el("h4", null, web),
      whatIsThis("This browser keeps this product address and its optional token so it can test and open the repository. Any Pages site under the same owner domain can read that browser storage."),
      el("p", null, test, " ", remove), result);
  });
  return el("section", "settings-product-list panel", el("h3", null, "Managed products"),
    whatIsThis("This browser keeps the managed product list so it can show each repository's settings. Any Pages site under the same owner domain can read that browser storage."), ...lines);
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
  const on = el("button", "settings-notifications-on btn", "Switch on");
  const test = el("button", "settings-notifications-test btn", "Test");
  const off = el("button", "settings-notifications-off btn", "Switch off");
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
  return el("section", "settings-notifications panel",
    el("h3", null, "Notifications"), status,
    el("p", null, on, " ", test, " ", off),
    whatIsThis("Notifications let this browser alert you when something needs your attention. This browser stores whether notifications are switched on; the browser and any Pages site under the same owner domain able to read this storage can read that switch. While a dashboard page is open, it checks every five minutes for open SPEC changes, use cases, architecture files, and release test reports waiting for Accept and release. Checks go only to repository servers with the tokens of this browser and nowhere else. Nothing is checked while no dashboard page is open."), result,
  );
}

function remoteSessionLine(target, context, info) {
  if (!info.key.startsWith("remote-session:")) return null;
  const session = readSetting(context.store, info.key);
  if (!session) return null;
  const token = el("input", "settings-remote-session-token");
  const show = el("button", "settings-remote-session-show btn small", "Show");
  const test = el("button", "settings-remote-session-test btn", "Test");
  const change = el("button", "settings-remote-session-change btn", "Change");
  const clear = el("button", "settings-remote-session-clear btn", "Clear");
  const result = el("p", "settings-remote-session-result");
  const status = el("p", "settings-remote-session-status", stateText(info.lastTest));
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
      const lastTest = { at: new Date().toISOString(), outcome: "working" };
      writeSetting(context.store, `last-test:${info.key}`, lastTest);
      status.textContent = stateText(lastTest);
      result.textContent = `✓ The forwarded Bridge answers at localhost:${session.port}.`;
    } catch (error) {
      const lastTest = { at: new Date().toISOString(), outcome: "refused" };
      writeSetting(context.store, `last-test:${info.key}`, lastTest);
      status.textContent = stateText(lastTest);
      result.textContent = `✗ ${error.message}`;
    }
  });
  clear.addEventListener("click", async () => {
    clearSetting(context.store, info.key);
    clearSetting(context.store, `last-test:${info.key}`);
    result.textContent = "Cleared from this browser.";
    await route.render(target, context, {});
  });
  return el("section", "settings-remote-session panel",
    el("h3", null, info.label), status,
    el("p", null, `Forwarded port: ${session.port ?? "Not configured."}`),
    el("p", null, el("label", null, "Copied Bridge token ", token, " ", show)),
    el("p", null, "Tunnel commands and proxy configuration are prepared on the Bridge page; no tunnel is started here."),
    whatIsThis("This browser keeps the forwarded port and copied Bridge token for this remote session. Any Pages site under the same owner domain can read them; the Bridge reads its own tunnel settings."),
    el("p", null, test, " ", change, " ", clear), result,
  );
}

function ciRoute(text) {
  const route = String(text ?? "").trim();
  const current = /^ci\s+(hosted|runner:(\S+))\s+secret\s+(\S+)$/.exec(route);
  if (current) return { runner: current[2] ?? null, secret: current[3] };
  const legacy = /^workflow\s+\S+\s+on\s+(github-hosted|self-hosted)\s+secret\s+(\S+)$/.exec(route);
  if (legacy) return { runner: legacy[1] === "github-hosted" ? null : legacy[1], secret: legacy[2] };
  return null;
}

async function jobWorkflowInput(context) {
  if (!context.instance?.host) throw new Error("The instance repository is not connected.");
  const { defaultBranch } = await context.instance.host.repositoryInfo();
  const snapshot = await context.instance.host.readSnapshot(defaultBranch);
  const participants = await snapshot.read("docs/participants.md");
  const rows = participants ? readRegister(participantSchema(), "docs/participants.md", participants).rows : [];
  const ci = rows.map(({ cells }) => ciRoute(cells.Route)).filter(Boolean);
  const keys = [...new Set(ci.map((route) => route.secret))];
  const runners = [...new Set(ci.map((route) => route.runner).filter(Boolean))];
  return {
    instance: { repository: context.instance.repository, commit: snapshot.commit },
    secrets: { token: "AGENT_M_TOKEN", keys },
    runners,
  };
}

async function jobWorkflowLine(context, { address, defaultBranch, snapshot, canWrite }) {
  const status = el("p", "settings-job-workflow-status");
  const result = el("p", "settings-job-workflow-result");
  const secretList = el("p", "settings-job-workflow-secrets");
  const secretsPage = el("a", "settings-job-workflow-secrets-link", "Open the repository's secrets page");
  secretsPage.href = connect(address, {}).webLinks().secrets;
  const install = el("button", "settings-job-workflow-install btn primary", "Install");
  let offerInstall = false;
  let files = [], expectedHead = snapshot.commit;
  try {
    const input = await jobWorkflowInput(context);
    files = jobWorkflowFiles(address.server, input.instance, input.secrets, input.runners);
    const current = await Promise.all(files.map(async (file) => [file.path, await snapshot.read(file.path)]));
    const missing = current.filter(([, text]) => text === null || text === undefined).map(([path]) => path);
    const different = current.filter(([, text], index) => text !== null && text !== undefined && text !== files[index].text).map(([path]) => path);
    const installed = missing.length === 0 && different.length === 0;
    status.textContent = installed ? "Installed for this instance commit."
      : missing.length === files.length ? "Not installed."
        : `Workflow files are different from this instance commit: ${[...missing, ...different].join(", ")}.`;
    secretList.textContent = `Secrets named: ${[input.secrets.token, ...input.secrets.keys].join(", ") || input.secrets.token}. `;
    offerInstall = !installed && canWrite;
  } catch (error) {
    status.textContent = `The workflow state cannot be read: ${error.message}`;
    secretList.textContent = "Secrets named: AGENT_M_TOKEN.";
  }
  install.addEventListener("click", async (event) => {
    if (!event.isTrusted) return;
    try {
      const { commit } = await context.product.host.commitFiles({
        branch: defaultBranch,
        expectedHead,
        files,
        message: "Install Agent M job workflow",
      });
      status.textContent = "Installed for this instance commit.";
      install.hidden = true;
      install.disabled = true;
      result.textContent = commit ? `Committed ${commit}.` : "Committed.";
    } catch (error) {
      result.textContent = error.message;
    }
  });
  return el("section", "settings-job-workflow panel",
    el("h4", null, "Agent M's job workflow"),
    status,
    secretList,
    el("p", null, secretsPage),
    whatIsThis("The product repository keeps Agent M's job workflow. The files name this instance commit and the CI secrets by name only: AGENT_M_TOKEN for the person's repository token and one key secret for each CI participant. The secret values are entered on the repository server's secrets page, not in Agent M."),
    ...(offerInstall ? [el("p", null, install)] : []),
    result,
  );
}

async function productControls(context) {
  if (!context.product) return el("section", "settings-product panel",
    el("p", null, "Choose a product to edit its repository settings."),
    whatIsThis("A chosen product repository keeps its pseudonymisation setting and collaborator consent records, which every repository reader can read. This browser reads them to show their current state."));
  const { settings, collaborators } = await settingsSchemas();
  let repository;
  try { repository = await context.product.host.repositoryInfo(); }
  catch (error) {
    return el("section", "settings-product panel",
      el("h3", null, `Product · ${context.product.address}`),
      el("p", "settings-product-read-only", `Repository metadata is unavailable: ${error.message}`),
      whatIsThis("This browser keeps the selected product address and token. Its token remains available in the repository settings above."));
  }
  const { defaultBranch } = repository;
  const address = parseAddress(context.product.address);
  const credential = credentialsFor(context.store, address);
  const canWrite = Boolean(credential?.token && repository.canWrite === true);
  const snapshot = await context.product.host.readSnapshot(defaultBranch);
  const workflow = await jobWorkflowLine(context, { address, defaultBranch, snapshot, canWrite });
  const settingsText = await snapshot.read(settings.path);
  const collaboratorsText = await snapshot.read(collaborators.path);
  const legacyOff = (text) => /(^|\n)- pseudonymisation: off(?:\n|$)/.test(text ?? "");
  const settingState = (document, text) => legacyOff(text) ? "off" : pseudonymisationOf(document);
  let settingsDocument = readDocument(settings, settings.path, settingsText ?? "# Settings of this product\n");
  const newCollaborators = `# Collaborators of ${address.path}\n\n| Name | Account | Agreed |\n|---|---|---|\n`;
  let collaboratorsBytes = collaboratorsText ?? newCollaborators;
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
    const tokenStep = el("button", "settings-product-token-step btn", "Open the token step of UC-001");
    tokenStep.addEventListener("click", () => context.go("add-product", { address: context.product.address }));
    const reason = credential?.token ? "The repository reports this credential cannot write." : "This browser has no token that can write to this product.";
    return el("section", "settings-product panel",
      el("h3", null, `Product · ${context.product.address}`),
      el("p", "settings-product-access", `Repository access: ${access}.`),
      el("p", "settings-product-read-only", `Read-only: ${reason} `, tokenStep),
      state,
      workflow,
      whatIsThis("This product repository keeps its pseudonymisation setting and collaborator consent records, which every repository reader can read. This browser only reads them to show their current state."),
      el("h4", null, "Collaborators"),
      el("ul", "settings-collaborator-records", ...collaboratorRows.map((row) => el("li", null, `${row.name} · @${row.account} · agreed on ${row.agreed}`))));
  }
  const off = el("input", "settings-pseudonymisation-off"); off.type = "checkbox"; off.checked = settingState(settingsDocument, settingsBytes) === "off";
  const acknowledgement = el("input", "settings-pseudonymisation-ack"); acknowledgement.type = "checkbox";
  const save = el("button", "settings-pseudonymisation-save btn primary", "Save pseudonymisation");
  const pseudoResult = el("p", "settings-pseudonymisation-result");
  save.addEventListener("click", async (event) => {
    if (!event.isTrusted) return;
    if (off.checked && !acknowledgement.checked) { pseudoResult.textContent = "Tick I have read this before switching pseudonymisation off."; return; }
    const legacy = /(^|\n)- pseudonymisation: (?:on|off)(?=\n|$)/;
    const edited = { ...settingsDocument, fields: { ...settingsDocument.fields, pseudonymisation: off.checked ? "off" : "on" } };
    const text = legacy.test(settingsBytes) ? (off.checked ? settingsBytes.replace(legacy, "$1- pseudonymisation: off") : settingsBytes.replace(legacy, ""))
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
  const add = el("button", "settings-collaborator-save btn primary", "Save collaborator"); const collabResult = el("p", "settings-collaborator-result");
  const removeName = el("input", "settings-collaborator-remove-name"), removeAccount = el("input", "settings-collaborator-remove-account");
  const remove = el("button", "settings-collaborator-remove btn", "Remove collaborator consent");
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
    const text = writeDocument(collaborators, edited) || `${newCollaborators}| ${name.value.trim()} | ${account.value.trim()} | yes |\n`;
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
    if (legacy) text = `${collaboratorsBytes.slice(0, legacy.index)}${collaboratorsBytes.slice(legacy.index + legacy[0].length).replace(/^\n/, "")}`;
    else {
      const rows = collaboratorsDocument.sections[0]?.rows ?? [];
      const kept = rows.filter((row) => row.cells.Name !== wantedName || String(row.cells.Account ?? "").replace(/^@/, "") !== wantedAccount);
      if (kept.length === rows.length) { collabResult.textContent = "No matching consenting collaborator is stored."; return; }
      text = writeDocument(collaborators, { ...collaboratorsDocument, sections: [{ ...collaboratorsDocument.sections[0], rows: kept }] });
    }
    const result = await saveFile(context.product.host, { path: collaborators.path, text, openedBlob: collaboratorsBlob });
    if (result.refused) { collabResult.textContent = "Collaborators changed meanwhile; nothing was written."; return; }
    collaboratorsBlob = result.blob; collaboratorsBytes = text; collaboratorsDocument = readDocument(collaborators, collaborators.path, text);
    collaboratorRecords.replaceChildren(...Array.from(collaboratorRecords.childNodes).filter((node) => !node.textContent.startsWith(`${wantedName} · @${wantedAccount} ·`)));
    collabResult.textContent = "Removed this collaborator's consent record; earlier commits keep the name in the history. ";
    if (result.commit) { const address = parseAddress(context.product.address); const link = el("a", "settings-collaborator-withdrawal-commit", "View removal commit"); link.href = `${address.web}/${address.server === "gitlab" ? "-/commit" : "commit"}/${result.commit}`; collabResult.append(link); }
  });
  const publication = repository.visibility === "public" ? `${address.server === "github" ? "GitHub" : "GitLab"} reports ${address.path} as public: the data will be published — anyone on the internet can read it.` : `The repository is not reported public; use only a protected, non-public data space.`;
  return el("section", "settings-product panel",
    el("h3", null, `Product · ${context.product.address}`), state,
    whatIsThis("This product repository keeps pseudonymisation and collaborator consent records for everyone who works on it. This browser reads them and writes them only after a person's Save click."),
    workflow,
    el("p", null, el("label", null, off, " Switch pseudonymisation off")),
    el("p", "notice", "With pseudonymisation on, report data is rewritten without persons while keeping its technical content."),
    el("p", "notice", `With pseudonymisation off, report data from mails — the names, addresses and other details of the people who write — enters the issues and the repository of ${address.path} unchanged. This is advisable only on a protected, non-public data space. Issue texts themselves stay neutral either way. ${publication} Data already written remains in history; removing that data requires a history rewrite.`),
    el("p", null, el("label", null, acknowledgement, " I have read this."), " ", save), pseudoResult,
    el("h4", null, "Collaborators"),
    collaboratorRecords,
    el("p", null, el("label", null, "Name ", name)), el("p", null, el("label", null, "Account ", account)),
    el("p", null, el("label", null, agreed, " This person has agreed to be named."), " ", el("label", null, "Consent date ", agreedDate), " ", add),
    el("h4", null, "Remove collaborator consent"),
    el("p", null, el("label", null, "Name ", removeName)), el("p", null, el("label", null, "Account ", removeAccount)),
    el("p", null, "Earlier commits keep the name in the history. ", remove), collabResult);
}

// The tabs of the page: the one whose id `chosenId` names is selected, else the first; `choose` hears each id selected.
function tabbedSettings(panes, chosenId, choose) {
  const tabs = el("div", "settings-tabs");
  attribute(tabs, "role", "tablist");
  const buttons = [];
  const select = (selected) => {
    for (const { button, pane, id } of buttons) {
      const chosen = button === selected;
      attribute(button, "aria-selected", String(chosen));
      button.className = chosen ? "settings-tab btn primary" : "settings-tab btn";
      button.tabIndex = chosen ? 0 : -1;
      pane.hidden = !chosen;
      if (chosen) choose(id);
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
    buttons.push({ button, pane: pane.node, id: pane.id });
    tabs.append(button);
  }
  select((buttons.find((entry) => entry.id === chosenId) ?? buttons[0]).button);
  return { tabs, panels: panes.map((pane) => pane.node) };
}

function configurationControls(context) {
  const endpoint = el("button", "settings-endpoint-configure btn", "Configure a model endpoint");
  const bridge = el("button", "settings-bridge-configure btn", "Configure the Agent M Bridge");
  endpoint.addEventListener("click", () => context.go("endpoints", {}));
  bridge.addEventListener("click", () => context.go("bridge", {}));
  return el("p", "settings-configure", endpoint, " ", bridge);
}

export const route = {
  name: "settings",
  entry: "settings",
  title: "Settings",
  async render(target, given) {
    // A line that renders the page again hands back the context of its tab; the page keeps its own.
    const context = given[PAGE] ?? given;
    // UC-042 steps 2 and 3, UC-011 step 1, UC-044 step 4: the forms that set up a model endpoint or the Bridge open in
    // place, in the tab Endpoints & Agents under its buttons, one at a time; Add a product opens in the tab Repositories,
    // under the product list. Every other route, and these from other pages, go through the page's own context.
    // Each opens as a card, as a setting line is one; empty, the card is not shown.
    const form = el("div", "settings-configure-form panel");
    const productForm = el("div", "settings-product-form panel");
    form.hidden = productForm.hidden = true;
    // The endpoints this browser keeps, one line each, listed anew whenever the endpoint form in place stored, tested or
    // cleared one (UC-042 step 2), while the form stays open with its result.
    const endpoints = el("div", "settings-endpoints");
    const listEndpoints = () => endpoints.replaceChildren(...listSettings(context.store)
      .filter((setting) => setting.key.startsWith("endpoint:"))
      .map((setting) => endpointLine(target, inPlace, setting))
      .filter(Boolean));
    const inPlace = {
      ...context,
      [PAGE]: context,
      async go(name, params = {}) {
        const [guided, place] = { endpoints: [endpointsRoute, form], bridge: [bridgeRoute, form],
          "add-product": [addProductRoute, productForm] }[name] ?? [];
        if (!guided) return context.go(name, params);
        place.hidden = false;
        await guided.render(place, inPlace, params);
      },
      endpointsChanged: listEndpoints,
    };
    listEndpoints();
    const bridge = bridgeLine(target, inPlace);
    const jumpHost = jumpHostLine(target, inPlace);
    const remoteSessions = listSettings(context.store).map((info) => remoteSessionLine(target, inPlace, info)).filter(Boolean);
    const namedBridges = listSettings(context.store).filter((info) => info.key.startsWith("bridge:"))
      .map((info) => bridgeNamedLine(target, inPlace, info)).filter(Boolean);
    const general = el("section", "settings-tab-panel",
      el("h3", null, "General · this browser"),
      el("div", "settings-browser-explanation", explain("endpoint-route")),
      el("p", "notice settings-shared-origin", sharedPagesNotice(context)),
      exportImportControls(context, await carriesSignIn(context.store)), browserClearControls(context));
    const product = await productControls(context);
    const productList = productListControls(target, context);
    const repositories = el("section", "settings-tab-panel",
      el("h3", null, "Repositories · browser credentials and product records"),
      ...listSettings(context.store).flatMap((info) => {
        const line = repositoryLine(target, inPlace, info);
        return !line ? [] : info.key === "products" ? [line, productForm] : [line];
      }),
      ...(productList ? [productList] : []), product);
    const endpointPane = el("section", "settings-tab-panel",
      el("h3", null, "Endpoints & Agents · this browser"),
      configurationControls(inPlace), form,
      ...(bridge ? [bridge] : []), ...namedBridges, ...(jumpHost ? [jumpHost] : []),
      ...remoteSessions,
      ...(readSetting(context.store, "mailbox") ? [mailboxLine(inPlace).node] : []),
      endpoints);
    const usability = el("section", "settings-tab-panel",
      el("h3", null, "Usability · this browser"), notificationsControls(context));
    const tabbed = tabbedSettings([
      { name: "General", id: "settings-general", node: general },
      { name: "Repositories", id: "settings-repositories", node: repositories },
      { name: "Endpoints & Agents", id: "settings-endpoints-agents", node: endpointPane },
      { name: "Usability", id: "settings-usability", node: usability },
    ], chosenTabs.get(context), (id) => chosenTabs.set(context, id));
    target.replaceChildren(el("section", "head", el("h2", null, "Settings")), tabbed.tabs, ...tabbed.panels);
  },
};
