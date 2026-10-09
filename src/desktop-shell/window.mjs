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
await startPage({ page: "bridge", views: [{ strategies: [], routes: [{ name: "pairing", entry: null, title: "Pairing", render: pairing }] }], menuViews: [] });
