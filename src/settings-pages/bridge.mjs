// MOD-settings-pages' Bridge configuration route (UC-044).  Pairing is the only operation here that contacts a
// Bridge; the jump-host record is browser configuration and its Save button deliberately makes no request.

import { allocatePort, pair, proxyConfiguration, tunnelCommands } from "../bridge-client/index.mjs";
import { clearSetting, listSettings, readSetting, writeSetting } from "../browser-store/index.mjs";
import { explain } from "../site-frame/index.mjs";

function el(name, className, ...children) {
  const node = document.createElement(name);
  if (className) node.className = className;
  node.append(...children);
  return node;
}

function sharedPagesNotice(context) {
  const owner = String(context.instance?.repository ?? "").split("/")[0];
  return `Everything Agent M stores in this browser is stored for the address https://${owner}.github.io — every GitHub Pages site under that same ${owner}.github.io domain can read it.`;
}

function failureText(error) {
  if (error?.name === "TokenRefused") return "The Bridge refused this pairing token. Copy its current token and pair again.";
  if (error?.name === "JumpHostLoginRefused") return "The jump host refused its login. Check the jump-host login and save it again.";
  if (error?.name === "NoAnswer") return `The Bridge gave no answer. Check ${error.likely?.join(", ") ?? "its address"}.`;
  if (error?.name === "Timeout") return "The Bridge did not answer in time. Check that it is running, then pair again.";
  return `The Bridge could not be paired: ${error?.message ?? error}.`;
}

function applyBridge(fields, setting) {
  fields.address.value = setting?.address ?? "http://127.0.0.1:4711";
  fields.token.value = setting?.token ?? "";
}

function applyJumpHost(fields, setting) {
  fields.hostname.value = setting?.hostname ?? "";
  fields.user.value = setting?.user ?? "";
  fields.sshPort.value = String(setting?.sshPort ?? 22);
  fields.portFirst.value = String(setting?.portRange?.[0] ?? 40100);
  fields.portLast.value = String(setting?.portRange?.[1] ?? 40199);
  fields.httpsAddress.value = setting?.httpsAddress ?? "";
  fields.loginUser.value = setting?.login?.user ?? "";
  fields.loginPassword.value = setting?.login?.password ?? "";
}

function trustedHttpsAddress(value) {
  let url;
  try { url = new URL(value); } catch { return null; }
  return url.protocol === "https:" && !url.username && !url.password ? url.toString().replace(/\/$/, "") : null;
}

function remoteSessions(store) {
  return listSettings(store)
    .filter((setting) => setting.key.startsWith("remote-session:"))
    .map((setting) => {
      const session = readSetting(store, setting.key);
      return session && typeof session === "object" ? { ...session, name: setting.key.slice("remote-session:".length) } : null;
    })
    .filter(Boolean);
}

function instanceOrigin() {
  const origin = globalThis.location?.origin;
  return typeof origin === "string" && origin.startsWith("https://") ? origin : null;
}

function usableJumpHost(jumpHost) {
  return jumpHost && typeof jumpHost.hostname === "string" && jumpHost.hostname && typeof jumpHost.user === "string" && jumpHost.user
    && Number.isInteger(jumpHost.sshPort) && Array.isArray(jumpHost.portRange);
}

export const route = {
  name: "bridge",
  entry: "settings",
  title: "Bridge",
  async render(target, context, params = {}) {
    const address = el("input", "bridge-address");
    const token = el("input", "bridge-token");
    const show = el("button", "bridge-show", "Show");
    const pairButton = el("button", "bridge-pair", "Pair Bridge");
    const clear = el("button", "bridge-clear", "Clear");
    const result = el("p", "bridge-result");
    const hostname = el("input", "jump-host-name");
    const user = el("input", "jump-host-user");
    const sshPort = el("input", "jump-host-ssh-port");
    const portFirst = el("input", "jump-host-port-first");
    const portLast = el("input", "jump-host-port-last");
    const httpsAddress = el("input", "jump-host-https-address");
    const httpsBridgeToken = el("input", "jump-host-bridge-token");
    const showHttpsBridgeToken = el("button", "jump-host-bridge-show", "Show");
    const loginUser = el("input", "jump-host-login-user");
    const loginPassword = el("input", "jump-host-login-password");
    const showLoginPassword = el("button", "jump-host-login-show", "Show");
    const saveJumpHost = el("button", "jump-host-save", "Save HTTPS connection");
    const jumpResult = el("p", "jump-host-result");
    const remoteSessionSelect = el("select", "remote-session-select");
    const remoteSessionName = el("input", "remote-session-name");
    const remoteSessionToken = el("input", "remote-session-token");
    const showRemoteSessionToken = el("button", "remote-session-show", "Show");
    const remoteKey = el("input", "remote-session-reverse-key");
    const localKey = el("input", "remote-session-forward-key");
    const saveRemoteSession = el("button", "remote-session-save", "Save remote session");
    const remoteResult = el("p", "remote-session-result");
    const remoteCommands = el("pre", "remote-session-commands");
    const remoteApache = el("pre", "remote-session-proxy-apache");
    const remoteNginx = el("pre", "remote-session-proxy-nginx");
    const httpsExplanation = el("details", "explain",
      el("summary", null, "What is this?"),
      el("p", null, "Use an HTTPS address with a certificate your browser trusts. The jump host's web login is separate from the Bridge address and pairing token, and the web server must require that login before forwarding to the Bridge."),
      el("p", null, "The jump host must allow this dashboard's Pages origin only. Saving this configuration stores it in this browser and does not contact the HTTPS address; it remains untested until you choose a later Bridge action."));
    const bridgeFields = { address, token };
    const jumpFields = { hostname, user, sshPort, portFirst, portLast, httpsAddress, loginUser, loginPassword };

    address.placeholder = "Bridge address";
    token.type = "password";
    token.placeholder = "Copied pairing token";
    hostname.placeholder = "Jump-host name";
    user.placeholder = "SSH user";
    sshPort.type = portFirst.type = portLast.type = "number";
    httpsAddress.placeholder = "Trusted HTTPS Bridge address";
    httpsBridgeToken.type = "password";
    httpsBridgeToken.placeholder = "Copied Bridge pairing token";
    loginUser.placeholder = "Jump-host web login";
    loginPassword.type = "password";
    loginPassword.placeholder = "Jump-host web password";
    remoteSessionName.placeholder = "Remote session name";
    remoteSessionToken.type = "password";
    remoteSessionToken.placeholder = "Copied remote Bridge token";
    remoteKey.placeholder = "Remote SSH key file";
    localKey.placeholder = "Local SSH key file";
    remoteKey.value = "~/.ssh/agent-m-remote";
    localKey.value = "~/.ssh/agent-m-local";
    for (const input of [address, token, hostname, user, httpsAddress, httpsBridgeToken, loginUser, loginPassword]) { input.autocomplete = "off"; input.spellcheck = false; }
    applyBridge(bridgeFields, readSetting(context.store, "bridge"));
    applyJumpHost(jumpFields, readSetting(context.store, "jump-host"));
    const savedBridge = readSetting(context.store, "bridge");
    if (savedBridge?.address?.startsWith("https://")) httpsBridgeToken.value = savedBridge.token ?? "";

    const sessions = remoteSessions(context.store);
    const selectedName = sessions.some((session) => session.name === params.name) ? params.name : sessions.at(-1)?.name ?? "";
    function selectedSession() { return sessions.find((session) => session.name === remoteSessionSelect.value) ?? null; }
    function applyRemoteSession(session) {
      remoteSessionSelect.value = session?.name ?? "";
      remoteSessionName.value = session?.name ?? "";
      remoteSessionToken.value = session?.token ?? "";
    }
    function renderRemoteSetup(session) {
      if (!session) { remoteCommands.textContent = ""; remoteApache.textContent = ""; remoteNginx.textContent = ""; return; }
      const jumpHost = readSetting(context.store, "jump-host");
      const origin = instanceOrigin();
      if (!usableJumpHost(jumpHost) || !origin) return;
      const commands = tunnelCommands(jumpHost, session, undefined, { remote: remoteKey.value.trim(), local: localKey.value.trim() });
      remoteCommands.textContent = `${commands.reverse}\n\n${commands.forward}\n\n${commands.service}`;
      const allSessions = remoteSessions(context.store);
      remoteApache.textContent = proxyConfiguration(jumpHost, allSessions, origin, "apache");
      remoteNginx.textContent = proxyConfiguration(jumpHost, allSessions, origin, "nginx");
    }
    for (const session of sessions) remoteSessionSelect.append(el("option", null, session.name));
    applyRemoteSession(sessions.find((session) => session.name === selectedName) ?? null);
    renderRemoteSetup(selectedSession());

    show.addEventListener("click", () => {
      const hidden = token.type === "password";
      token.type = hidden ? "text" : "password";
      show.textContent = hidden ? "Hide" : "Show";
    });
    for (const [secret, toggle] of [[httpsBridgeToken, showHttpsBridgeToken], [loginPassword, showLoginPassword]]) {
      toggle.addEventListener("click", () => {
        const hidden = secret.type === "password";
        secret.type = hidden ? "text" : "password";
        toggle.textContent = hidden ? "Hide" : "Show";
      });
    }
    pairButton.addEventListener("click", async () => {
      const copiedToken = token.value.trim();
      if (!address.value.trim() || !copiedToken) { result.textContent = "Enter the Bridge address and copied pairing token first."; return; }
      result.textContent = "Pairing the Bridge…";
      try {
        const settings = await pair(address.value.trim(), copiedToken);
        writeSetting(context.store, "bridge", settings);
        applyBridge(bridgeFields, settings);
        result.textContent = "The Bridge is paired in this browser.";
      } catch (error) {
        result.textContent = failureText(error);
      }
    });
    clear.addEventListener("click", async () => {
      clearSetting(context.store, "bridge");
      applyBridge(bridgeFields, null);
      result.textContent = "The Bridge setting is cleared from this browser.";
    });
    saveJumpHost.addEventListener("click", () => {
      const trustedAddress = httpsAddress.value.trim() ? trustedHttpsAddress(httpsAddress.value.trim()) : null;
      if (httpsAddress.value.trim() && !trustedAddress) { jumpResult.textContent = "Enter a trusted HTTPS Bridge address without a credential in its URL."; return; }
      const saved = {
        hostname: hostname.value.trim(), user: user.value.trim(), sshPort: Number(sshPort.value), portRange: [Number(portFirst.value), Number(portLast.value)],
        ...(trustedAddress ? { httpsAddress: trustedAddress } : {}),
        ...(loginUser.value.trim() || loginPassword.value ? { login: { user: loginUser.value.trim(), password: loginPassword.value } } : {}),
      };
      writeSetting(context.store, "jump-host", saved);
      const copiedToken = httpsBridgeToken.value.trim();
      if (trustedAddress && copiedToken) writeSetting(context.store, "bridge", { address: trustedAddress, token: copiedToken });
      jumpResult.textContent = "The HTTPS jump-host connection is saved in this browser and remains untested. It has not contacted that address.";
    });
    remoteSessionSelect.addEventListener("change", () => {
      applyRemoteSession(selectedSession());
      renderRemoteSetup(selectedSession());
    });
    showRemoteSessionToken.addEventListener("click", () => {
      const hidden = remoteSessionToken.type === "password";
      remoteSessionToken.type = hidden ? "text" : "password";
      showRemoteSessionToken.textContent = hidden ? "Hide" : "Show";
    });
    saveRemoteSession.addEventListener("click", () => {
      const jumpHost = readSetting(context.store, "jump-host");
      const name = remoteSessionName.value.trim();
      const token = remoteSessionToken.value.trim();
      if (!usableJumpHost(jumpHost)) { remoteResult.textContent = "The jump host is required; set it up before adding a remote session."; return; }
      if (!name || !token) { remoteResult.textContent = "Enter a remote-session name and copied Bridge token first."; return; }
      const current = remoteSessions(context.store);
      const previous = current.find((session) => session.name === name);
      try {
        const port = previous?.port ?? allocatePort(jumpHost.portRange, current);
        const stored = { port, token };
        const session = { ...stored, name };
        writeSetting(context.store, `remote-session:${name}`, stored);
        sessions.splice(0, sessions.length, ...remoteSessions(context.store));
        remoteSessionSelect.replaceChildren(...sessions.map((item) => el("option", null, item.name)));
        applyRemoteSession(session);
        renderRemoteSetup(session);
        remoteResult.textContent = "Remote-session setup text is ready. It has not started a tunnel or tested an HTTPS connection.";
      } catch (error) {
        remoteResult.textContent = error?.name === "NoFreePort" ? error.message : `Remote-session setup needs valid settings: ${error?.message ?? error}`;
      }
    });

    target.replaceChildren(
      el("h2", null, "Connect a Bridge"),
      el("p", "notice bridge-shared-origin", sharedPagesNotice(context)),
      el("p", null, "The copied pairing token is sent only to the Bridge address when you choose Pair Bridge."),
      el("p", null, el("label", null, "Bridge address ", address)),
      el("p", null, el("label", null, "Pairing token ", token, " ", show)),
      el("p", null, pairButton, " ", clear),
      explain("bridge-pairing"), result,
      el("h3", null, "Trusted HTTPS jump host"),
      httpsExplanation,
      el("p", null, el("label", null, "Host ", hostname)),
      el("p", null, el("label", null, "SSH user ", user)),
      el("p", null, el("label", null, "SSH port ", sshPort)),
      el("p", null, el("label", null, "Forwarded-port range ", portFirst, " to ", portLast)),
      el("p", null, el("label", null, "HTTPS Bridge address ", httpsAddress)),
      el("p", null, el("label", null, "Copied Bridge token ", httpsBridgeToken, " ", showHttpsBridgeToken)),
      el("p", null, el("label", null, "Web login ", loginUser)),
      el("p", null, el("label", null, "Web password ", loginPassword, " ", showLoginPassword)),
      el("p", null, saveJumpHost), jumpResult,
      el("h3", null, "Remote session"),
      el("p", null, "Add or select a remote Bridge session. The commands and proxy configuration are setup text only; they do not start a tunnel or test HTTPS."),
      el("p", null, el("label", null, "Stored session ", remoteSessionSelect)),
      el("p", null, el("label", null, "Session name ", remoteSessionName)),
      el("p", null, el("label", null, "Copied remote Bridge token ", remoteSessionToken, " ", showRemoteSessionToken)),
      el("p", null, el("label", null, "Remote SSH key file ", remoteKey)),
      el("p", null, el("label", null, "Local SSH key file ", localKey)),
      el("p", null, saveRemoteSession), remoteResult,
      el("h4", null, "Tunnel commands"), remoteCommands,
      el("h4", null, "Apache HTTPS proxy configuration"), remoteApache,
      el("h4", null, "nginx HTTPS proxy configuration"), remoteNginx,
    );
  },
};
