// Module: MOD-desktop-shell
import { renderArtifact } from "../markdown-render/index.mjs";
import { confirmDecision, explain, notice, startPage } from "../site-frame/index.mjs";

// A button in the site's look (MOD-site-frame, look.css): btn, with "primary" for the action a route leads with and "small" for one beside a line of text.
const button = (label, action, kind = "") => { const control = document.createElement("button"); control.className = kind ? `btn ${kind}` : "btn"; control.textContent = label; control.addEventListener("click", action); return control; };
const navigation = (context) => { const links = document.createElement("p"); links.append(button("Agents", () => context.go("agents")), button("Pairing", () => context.go("pairing")), button("Settings", () => context.go("settings")), button("Tunnels", () => context.go("tunnels")), button("Updates", () => context.go("updates"))); return links; };
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
    if (state.failure.name === "PortInUse") { const port = document.createElement("input"); port.type = "number"; port.value = "4712"; const retry = button("Use this port", async () => { await window.bridge.retryPort(port.value); await pairing(target, context); }, "primary"); target.append(port, retry); }
    target.append(button("Quit", () => quit()));
    notice("unreachable", { text: detail.textContent }); return;
  }
  const heading = document.createElement("h1"), address = document.createElement("code"), token = document.createElement("code"), controls = document.createElement("p");
  heading.textContent = "Agent M Bridge pairing"; address.textContent = state.address; token.textContent = state.token;
  controls.append(button("Copy address", () => window.bridge.copy(state.address)), button("Copy token", () => window.bridge.copy(state.token), "primary"), button(state.paused ? "Resume" : "Pause", async () => { await window.bridge[state.paused ? "resume" : "pause"](); await pairing(target, context); }), button("Pair anew", async () => {
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
// The last checkout's result (UC-044 step 3): for each agent and repository the commit its clone holds, or the repository not reached with git's reason.
function checkedOut(result, checkout, saved = null) {
  if (!Array.isArray(checkout)) return;
  if (!checkout.length) { result.textContent = `${saved ? `${saved} ` : ""}Nothing to check out: tick an agent and choose the folder.`; return; }
  const lines = document.createElement("ul");
  for (const entry of checkout) {
    const item = document.createElement("li");
    item.textContent = `${entry.agent}: ${entry.repository} ${entry.commit ? `checked out at ${entry.commit.slice(0, 12)}` : `not reached: ${entry.reason}`}`;
    lines.append(item);
  }
  result.replaceChildren(...(saved ? [saved] : []), lines);
}
async function agents(target, context) {
  const state = await window.bridge.state("agents"), selected = new Map((state.selected ?? []).map((agent) => [agent.name, agent]));
  const heading = document.createElement("h1"), list = document.createElement("div"), result = document.createElement("p"), rows = [];
  heading.textContent = "Bridge agents";
  // The one folder that holds the working folder of each ticked agent, <folder>/<agent>, which the Bridge makes (UC-044 step 3).
  const folder = field("Folder of the agents' working folders ", state.folder ?? "");
  const choose = button("Choose folder", async () => { const chosen = await window.bridge.chooseFolder(); if (chosen) folder.input.value = chosen; }, "small");
  for (const agent of state.agents ?? []) {
    const row = document.createElement("p"), name = document.createElement("strong"), status = document.createElement("span");
    name.textContent = agent.name;
    if (agent.installed) {
      const kept = selected.get(agent.name) ?? null;
      const tick = document.createElement("input");
      tick.type = "checkbox"; tick.checked = kept !== null;
      status.textContent = ` ${agent.version ?? "installed"}${agent.loggedIn === false ? " not logged in" : " ready"}${kept?.folder ? `, working in ${kept.folder}` : ""}`;
      row.append(tick, name, status);
      // The agent's enclosure (ARC-054): whether it works here, else why and its one-time step; whether the agent is logged in there, else its login step.
      const enclosed = state.enclosures?.[agent.name];
      if (enclosed) {
        const line = document.createElement("span");
        if (!enclosed.works) {
          line.textContent = ` Not enclosed: ${enclosed.reason}. One-time step: ${enclosed.setup}. `;
          row.append(line, button("Set up", async () => { const done = await window.bridge.state("enclosure-setup", { name: agent.name }); result.textContent = done.done ? "Set up." : `Not set up: ${done.reason}`; }, "small"));
        } else if (!enclosed.loggedIn) {
          line.textContent = " Not logged in in its enclosure. ";
          row.append(line, button("Log in", async () => { await window.bridge.state("agent-login", { name: agent.name }); result.textContent = `A terminal runs ${agent.name}'s own login step; press Check again when it is done.`; }, "small"));
        } else {
          line.textContent = " Enclosed and logged in.";
          row.append(line);
        }
      }
      // Its declaration as a connection (UC-044 step 5): the place where it processes data, this machine preset; its capabilities, every one preset; each model it can
      // run with its context in tokens, one per line as `<model> <context>`.
      const declaration = document.createElement("span"), place = field(" Place", kept?.place ?? "this machine"), ticks = [];
      declaration.append(place.caption);
      for (const capability of state.capabilities ?? []) {
        const box = field(` ${capability}`, "", "checkbox");
        box.input.checked = kept ? (kept.capabilities ?? []).includes(capability) : true;
        ticks.push([capability, box.input]);
        declaration.append(box.caption);
      }
      const models = area(" Models, one per line: model and context in tokens", (kept?.models ?? []).map((each) => `${each.model} ${each.context ?? ""}`.trim()).join("\n"));
      declaration.append(models.caption);
      row.append(declaration);
      rows.push({ agent, tick, place: place.input, ticks, models: models.input });
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
  // Save agents keeps the ticked agents and the folder; the Bridge then checks out at once, and its result is shown when the checkout has ended.
  const save = button("Save agents", async () => {
    const agents = rows.filter(({ agent, tick }) => agent.installed && tick.checked)
      .map(({ agent, place, ticks, models }) => ({ name: agent.name, place: place.value.trim() || "this machine",
        capabilities: ticks.filter(([, box]) => box.checked).map(([capability]) => capability),
        models: models.value.split("\n").map((line) => line.trim().split(/\s+/)).filter(([model]) => model).map(([model, context]) => ({ model, context: Number(context) || null })) }));
    await window.bridge.state("save-agents", { agents, folder: folder.input.value.trim() || null });
    const saved = `Saved ${agents.length} agent(s).`;
    result.textContent = `${saved} Checking out the instance and the products…`;
    checkedOut(result, (await window.bridge.state("checkout")).checkout, saved);
  }, "primary");
  checkedOut(result, state.checkout);
  // Check again reads the installed agents anew, so that one installed meanwhile is listed without the Bridge restarting (UC-044 3a).
  const again = button("Check again", () => agents(target, context));
  target.replaceChildren(heading, navigation(context), explain("bridge-own-login"), folder.caption, choose, list, again, save, result);
}
let taken = null;
async function settings(target, context) {
  const state = await window.bridge.state("settings"), value = state.settings;
  const name = field("Name", value.name), port = field("Port", value.port, "number"), products = area("Products", value.products.join("\n")), every = field("Interval seconds", value.every, "number");
  const save = button("Save settings", async () => {
    await window.bridge.state("save-settings", { name: name.input.value, port: Number(port.input.value), products: products.input.value.split("\n").filter(Boolean), every: Number(every.input.value) });
    await settings(target, context);
  }, "primary");
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
  instruction.textContent = jump ? `Add this public key to ~/.ssh/authorized_keys for ${jump.user}@${jump.hostname}, or give it to that jump host's administrator.` : "Enter a jump host below, or import a settings export, to open tunnels.";
  // The jump host is entered here or taken from the dashboard's export (UC-044 6a.1): the hostname, the SSH user and the SSH port.
  const host = field("Jump host", jump?.hostname), user = field("SSH user", jump?.user), sshPort = field("SSH port", jump?.sshPort ?? 22, "number"), saved = document.createElement("p");
  const saveHost = button("Save jump host", async () => {
    try {
      await window.bridge.state("save-jump-host", { hostname: host.input.value, user: user.input.value, sshPort: sshPort.input.value });
      await tunnels(target, context);
    } catch (failure) { saved.textContent = `Not saved: ${failure.message}`; notice("unreachable", { text: saved.textContent }); }
  }, "primary");
  target.replaceChildren(heading, navigation(context), explain("bridge-tunnels"), document.createTextNode("Public key: "), key, button("Copy public key", () => window.bridge.copy(state.publicKey), "small"), instruction, list, host.caption, user.caption, sshPort.caption, saveHost, saved);
}
// Updates (UC-044 7a): the running version and a newer release when there is one, with its notes; Download is the person's first click, Install and restart the second, after a
// decision that names the jobs that would end as cancelled. A feed that cannot be read, a download that fails and a signature that does not hold are said, and change nothing.
async function updates(target, context) {
  const state = await window.bridge.state("updates");
  const paragraph = (text) => Object.assign(document.createElement("p"), { textContent: text });
  const heading = Object.assign(document.createElement("h1"), { textContent: "Agent M Bridge updates" });
  const shown = [heading, navigation(context), explain("bridge-updates"), paragraph(`Running version ${state.version ?? "unknown"}.`)];
  if (state.error) shown.push(paragraph(state.error));
  if (state.refused) shown.push(paragraph(state.refused));
  if (state.offer) {
    const notes = document.createElement("div");
    // The notes are rendered by the site's renderer; where it can render nothing, they are shown as they are written.
    try { notes.append(renderArtifact(state.offer.notes ?? "")); } catch { /* shown as written, below */ }
    if (!notes.textContent) notes.textContent = state.offer.notes ?? "";
    shown.push(paragraph(`Version ${state.offer.version} is available.`), notes);
    if (!state.ready) shown.push(button("Download", async () => { await window.bridge.state("download-update"); await updates(target, context); }, "primary"));
    else {
      shown.push(paragraph("The update is downloaded and its signature holds."), button("Install and restart", async () => {
        const running = (await window.bridge.state("running-jobs")).jobs ?? [];
        const decision = await confirmDecision({ title: "Install the update and restart the Agent M Bridge",
          lines: running.length ? [`${running.length === 1 ? "This job is" : "These jobs are"} still running and will end as cancelled:`, ...running.map((job) => `${job.id} (${job.kind}, ${job.agent}, ${job.product})`)] : ["No job is running."],
          confirm: "Install and restart" });
        if (decision.confirmed) await window.bridge.state("install-update", { confirmed: true });
      }, "primary"));
    }
  } else if (!state.error && !state.refused) shown.push(paragraph("No newer release is offered."));
  target.replaceChildren(...shown);
}
await startPage({ page: "bridge", views: [{ strategies: [], routes: [{ name: "pairing", entry: null, title: "Pairing", render: pairing }, { name: "agents", entry: null, title: "Agents", render: agents }, { name: "settings", entry: null, title: "Settings", render: settings }, { name: "tunnels", entry: null, title: "Tunnels", render: tunnels }, { name: "updates", entry: null, title: "Updates", render: updates }] }], menuViews: [] });
