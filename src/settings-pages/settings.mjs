// MOD-settings-pages' implemented Settings slice: the endpoint settings MOD-browser-store already enumerates.

import { clearSetting, exportSettings, importSettings, listSettings, readSetting, writeSetting } from "../browser-store/index.mjs";
import { testEndpoint } from "../endpoint-calls/index.mjs";
import { explain } from "../site-frame/index.mjs";

function el(name, className, ...children) {
  const node = document.createElement(name);
  if (className) node.className = className;
  node.append(...children);
  return node;
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
    target.replaceChildren(
      el("h2", null, "Settings"),
      el("h3", null, "This browser"),
      el("div", "settings-browser-explanation", explain("endpoint-route")),
      el("p", "notice settings-shared-origin", sharedPagesNotice(context)),
      ...(bridge ? [bridge] : []),
      ...(jumpHost ? [jumpHost] : []),
      el("div", "settings-endpoints", ...endpoints),
      exportImportControls(context),
    );
  },
};
