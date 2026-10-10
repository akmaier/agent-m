// Module: MOD-desktop-shell
import { confirmDecision, explain, notice, startPage } from "../site-frame/index.mjs";

const button = (label, action) => { const control = document.createElement("button"); control.textContent = label; control.addEventListener("click", action); return control; };
async function pairing(target) {
  const state = await window.bridge.state();
  target.replaceChildren();
  if (state.failure) {
    const heading = document.createElement("h1"), detail = document.createElement("p");
    heading.textContent = "Agent M Bridge could not start";
    detail.textContent = `${state.failure.name}: ${state.failure.message}${state.failure.folder ? ` (${state.failure.folder})` : ""}`;
    target.append(heading, detail, explain("bridge-pairing"));
    if (state.failure.name === "PortInUse") { const port = document.createElement("input"); port.type = "number"; port.value = "4712"; const retry = button("Use this port", async () => { await window.bridge.retryPort(port.value); await pairing(target); }); target.append(port, retry); }
    target.append(button("Quit", () => window.bridge.quit()));
    notice("unreachable", { text: detail.textContent }); return;
  }
  const heading = document.createElement("h1"), address = document.createElement("code"), token = document.createElement("code"), controls = document.createElement("p");
  heading.textContent = "Agent M Bridge pairing"; address.textContent = state.address; token.textContent = state.token;
  controls.append(button("Copy address", () => window.bridge.copy(state.address)), button("Copy token", () => window.bridge.copy(state.token)), button(state.paused ? "Resume" : "Pause", async () => { await window.bridge[state.paused ? "resume" : "pause"](); await pairing(target); }), button("Pair anew", async () => {
    const decision = await confirmDecision({ title: "Replace pairing", lines: ["Every paired browser must pair again. The old token will stop working."], confirm: "Pair anew" });
    if (decision.confirmed) { await window.bridge.pairAnew(); notice("info", { text: "The pairing token was replaced. Pair this dashboard again." }); await pairing(target); }
  }), button("Quit", () => window.bridge.quit()));
  target.append(heading, explain("bridge-pairing"), document.createTextNode("Address: "), address, document.createElement("br"), document.createTextNode("Pairing token: "), token, controls);
}
const field = (label, value, type = "text") => {
  const input = document.createElement("input"), caption = document.createElement("label");
  input.type = type; input.value = value ?? ""; caption.textContent = label; caption.append(input); return { caption, input };
};
async function settings(target) {
  const state = await window.bridge.state("settings"), value = state.settings;
  const name = field("Name", value.name), port = field("Port", value.port, "number"), products = field("Products (one address per line)", value.products.join("\n")), every = field("Interval seconds", value.every, "number");
  const save = button("Save settings", async () => { await window.bridge.state("save-settings", { name: name.input.value, port: Number(port.input.value), products: products.input.value.split("\n").filter(Boolean), every: Number(every.input.value) }); await settings(target); });
  const exportText = field("Settings export", ""), passphrase = field("Passphrase", "", "password"), session = field("Remote session name", ""), own = field("This is my own computer", "", "checkbox");
  const imported = button("Import settings export", async () => { await window.bridge.state("import-settings", { text: exportText.input.value, passphrase: passphrase.input.value, session: session.input.value, ownComputer: own.input.checked, name: name.input.value }); await settings(target); });
  target.replaceChildren(Object.assign(document.createElement("h1"), { textContent: "Bridge settings" }), explain("bridge-pairing"), name.caption, port.caption, products.caption, every.caption, save, exportText.caption, passphrase.caption, session.caption, own.caption, imported);
}
async function tunnels(target) {
  const state = await window.bridge.state("tunnels"), heading = document.createElement("h1"), key = document.createElement("code"), list = document.createElement("ul");
  heading.textContent = "Tunnels"; key.textContent = state.publicKey;
  for (const tunnel of state.tunnels) { const item = document.createElement("li"); item.textContent = `${tunnel.name}: ${tunnel.state}${tunnel.reason ? ` (${tunnel.reason})` : ""}`; list.append(item); }
  target.replaceChildren(heading, explain("bridge-pairing"), document.createTextNode("Public key: "), key, button("Copy public key", () => window.bridge.copy(state.publicKey)), list);
}
await startPage({ page: "bridge", views: [{ strategies: [], routes: [{ name: "pairing", entry: null, title: "Pairing", render: pairing }, { name: "settings", entry: null, title: "Settings", render: settings }, { name: "tunnels", entry: null, title: "Tunnels", render: tunnels }] }], menuViews: [] });
