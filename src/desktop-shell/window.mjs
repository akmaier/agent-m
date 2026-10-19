// Module: MOD-desktop-shell
import { confirmDecision, explain, notice, startPage } from "../site-frame/index.mjs";

const button = (label, action) => { const control = document.createElement("button"); control.textContent = label; control.addEventListener("click", action); return control; };
const navigation = (context) => { const links = document.createElement("p"); links.append(button("Agents", () => context.go("agents")), button("Pairing", () => context.go("pairing")), button("Settings", () => context.go("settings")), button("Tunnels", () => context.go("tunnels"))); return links; };
// Which origin the Bridge is paired with: the one MOD-bridge-http's pairedWith() gives, or that no request with the token has come since this start.
const pairedLine = (state) => Object.assign(document.createElement("p"), { textContent: state.pairedWith ? `This Bridge is paired with ${state.pairedWith}.` : "This Bridge is not yet paired since this start." });
async function pairing(target, context) {
  const state = await window.bridge.state();
  target.replaceChildren();
  if (state.failure) {
    const heading = document.createElement("h1"), detail = document.createElement("p");
    heading.textContent = "Agent M Bridge could not start";
    detail.textContent = `${state.failure.name}: ${state.failure.message}${state.failure.folder ? ` (${state.failure.folder})` : ""}`;
    target.append(heading, detail, explain("bridge-pairing"));
    if (state.failure.name === "PortInUse") { const port = document.createElement("input"); port.type = "number"; port.value = "4712"; const retry = button("Use this port", async () => { await window.bridge.retryPort(port.value); await pairing(target, context); }); target.append(port, retry); }
    target.append(button("Quit", () => quit()));
    notice("unreachable", { text: detail.textContent }); return;
  }
  const heading = document.createElement("h1"), address = document.createElement("code"), token = document.createElement("code"), controls = document.createElement("p");
  heading.textContent = "Agent M Bridge pairing"; address.textContent = state.address; token.textContent = state.token;
  controls.append(button("Copy address", () => window.bridge.copy(state.address)), button("Copy token", () => window.bridge.copy(state.token)), button(state.paused ? "Resume" : "Pause", async () => { await window.bridge[state.paused ? "resume" : "pause"](); await pairing(target, context); }), button("Pair anew", async () => {
    const decision = await confirmDecision({ title: "Replace pairing", lines: ["Every paired browser must pair again. The old token will stop working."], confirm: "Pair anew" });
    if (decision.confirmed) { await window.bridge.pairAnew(); notice("info", { text: "The pairing token was replaced. Pair this dashboard again." }); await pairing(target, context); }
  }), button("Quit", () => quit()));
  target.append(heading, navigation(context), explain("bridge-pairing"), document.createTextNode("Address: "), address, document.createElement("br"), document.createTextNode("Pairing token: "), token, pairedLine(state), controls);
}
// Quit names the jobs still running, which then end as cancelled, and quits when the person confirms; with none running it quits at once (UC-044 7b).
const quit = async () => {
  const running = (await window.bridge.state("running-jobs")).jobs ?? [];
  if (running.length) {
    const decision = await confirmDecision({ title: "Quit the Agent M Bridge", lines: [`${running.length === 1 ? "This job is" : "These jobs are"} still running and will end as cancelled:`,
      ...running.map((job) => `${job.id} (${job.kind}, ${job.agent}, ${job.product})`)], confirm: "Quit" });
    if (!decision.confirmed) return;
  }
  window.bridge.quit();
};
// The main process asks for the same decision when the tray's Quit is pressed while jobs run.
window.bridge.onQuitRequested?.(() => quit());
const field = (label, value, type = "text") => {
  const input = document.createElement("input"), caption = document.createElement("label");
  input.type = type; input.value = value ?? ""; caption.textContent = label; caption.append(input); return { caption, input };
};
const area = (label, value) => { const input = document.createElement("textarea"), caption = document.createElement("label"); input.value = value ?? ""; caption.textContent = label; caption.append(input); return { caption, input }; };
const installUrl = (agent, platform) => agent.install?.[platform] ?? Object.values(agent.install ?? {})[0] ?? null;
async function agents(target, context) {
  const state = await window.bridge.state("agents"), selected = new Map((state.selected ?? []).map((agent) => [agent.name, agent.folder]));
  const heading = document.createElement("h1"), list = document.createElement("div"), result = document.createElement("p"), rows = [];
  heading.textContent = "Bridge agents";
  for (const agent of state.agents ?? []) {
    const row = document.createElement("p"), name = document.createElement("strong"), status = document.createElement("span");
    name.textContent = agent.name;
    if (agent.installed) {
      const tick = document.createElement("input"), folder = field(" Working folder", selected.get(agent.name) ?? "");
      tick.type = "checkbox"; tick.checked = selected.has(agent.name);
      status.textContent = ` ${agent.version ?? "installed"}${agent.loggedIn === false ? " not logged in" : " ready"}`;
      const choose = button("Choose folder", async () => { const chosen = await window.bridge.chooseFolder(); if (chosen) { folder.input.value = chosen; tick.checked = true; } });
      row.append(tick, name, status, folder.caption, choose);
      rows.push({ agent, tick, folder: folder.input });
    } else {
      const link = document.createElement("a");
      link.textContent = "How to install";
      const href = installUrl(agent, state.platform);
      if (href) link.setAttribute("href", href);
      status.textContent = " missing ";
      row.append(name, status, link);
    }
    list.append(row);
  }
  const save = button("Save agents", async () => {
    const agents = rows.filter(({ agent, tick, folder }) => agent.installed && tick.checked && folder.value)
      .map(({ agent, folder }) => ({ name: agent.name, folder: folder.value }));
    await window.bridge.state("save-agents", { agents });
    result.textContent = `Saved ${agents.length} agent(s).`;
  });
  const access = button("Test access", async () => {
    const answer = await window.bridge.state("test-access");
    const refused = (answer.results ?? []).filter((entry) => !entry.reachable);
    if (!refused.length) { result.textContent = "All repositories reached."; return; }
    const failures = document.createElement("ul");
    for (const entry of refused) {
      const item = document.createElement("li");
      item.textContent = `${entry.repository}: ${entry.reason}`;
      failures.append(item);
    }
    result.replaceChildren(failures);
  });
  // Check again reads the installed agents anew, so that one installed meanwhile is listed without the Bridge restarting (UC-044 3a).
  const again = button("Check again", () => agents(target, context));
  target.replaceChildren(heading, navigation(context), explain("bridge-own-login"), list, again, save, access, result);
}
let taken = null;
async function settings(target, context) {
  const state = await window.bridge.state("settings"), value = state.settings;
  const name = field("Name", value.name), port = field("Port", value.port, "number"), products = area("Products", value.products.join("\n")), every = field("Interval seconds", value.every, "number");
  const save = button("Save settings", async () => {
    await window.bridge.state("save-settings", { name: name.input.value, port: Number(port.input.value), products: products.input.value.split("\n").filter(Boolean), every: Number(every.input.value) });
    await settings(target, context);
  });
  const exportText = area("Settings export", ""), passphrase = field("Passphrase", "", "password"), bridge = field("Bridge name", ""), own = field("This is my own computer", "", "checkbox");
  const result = document.createElement("p");
  const imported = button("Import settings export", async () => {
    try {
      const answer = await window.bridge.state("import-settings", { text: exportText.input.value, passphrase: passphrase.input.value, bridge: bridge.input.value, ownComputer: own.input.checked, name: name.input.value });
      taken = answer.taken;
      await settings(target, context);
    } catch (failure) {
      result.textContent = `Import refused: ${failure.message}`;
      notice("unreachable", { text: result.textContent });
    }
  });
  if (taken) result.textContent = `Taken over: ${taken.products.length} product address(es), jump host ${taken.jumpHost.hostname}, ${taken.tunnels.length} tunnel plan(s).`;
  target.replaceChildren(Object.assign(document.createElement("h1"), { textContent: "Bridge settings" }), navigation(context), explain("bridge-import-export"), name.caption, port.caption, products.caption, every.caption, save, exportText.caption, passphrase.caption, bridge.caption, own.caption, imported, result);
}
async function tunnels(target, context) {
  const state = await window.bridge.state("tunnels"), heading = document.createElement("h1"), key = document.createElement("code"), list = document.createElement("ul");
  heading.textContent = "Tunnels"; key.textContent = state.publicKey;
  for (const tunnel of state.tunnels) { const item = document.createElement("li"); item.textContent = `${tunnel.name}: ${tunnel.state}${tunnel.reason ? ` (${tunnel.reason})` : ""}`; list.append(item); }
  const jump = (await window.bridge.state("settings")).settings.jumpHost, instruction = document.createElement("p");
  instruction.textContent = jump ? `Add this public key to ~/.ssh/authorized_keys for ${jump.user}@${jump.hostname}, or give it to that jump host's administrator.` : "Set a jump host in a settings export to open tunnels.";
  target.replaceChildren(heading, navigation(context), explain("bridge-tunnels"), document.createTextNode("Public key: "), key, button("Copy public key", () => window.bridge.copy(state.publicKey)), instruction, list);
}
await startPage({ page: "bridge", views: [{ strategies: [], routes: [{ name: "pairing", entry: null, title: "Pairing", render: pairing }, { name: "agents", entry: null, title: "Agents", render: agents }, { name: "settings", entry: null, title: "Settings", render: settings }, { name: "tunnels", entry: null, title: "Tunnels", render: tunnels }] }], menuViews: [] });
