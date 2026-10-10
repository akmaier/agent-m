// Module: MOD-desktop-shell
import { join, resolve, sep } from "node:path";
import { pathToFileURL } from "node:url";
import electron from "electron";
import { compose } from "./compose.mjs";
import { loadSettings, saveSettings, takeExport } from "./settings.mjs";

let tray;

const option = (arguments_, name) => arguments_.find((value) => value.startsWith(`${name}=`))?.slice(name.length + 1);
const options = (arguments_ = process.argv.slice(2)) => ({ instance: option(arguments_, "--instance"), origin: option(arguments_, "--origin"), dataFolder: option(arguments_, "--data-folder"), port: Number(option(arguments_, "--port") ?? 4711) });
const pagesLocation = (instance) => {
  const [owner, repository] = instance.split("/");
  if (!owner || !repository) throw new TypeError("--instance must be owner/repository.");
  return { hostname: `${owner}.github.io`, pathname: `/${repository}` };
};
const defaultDataFolder = (electron, instance) => {
  const [owner, repository] = instance.split("/");
  return join(electron.app.getPath("appData"), `io.github.${owner}.${repository}.bridge`);
};
const sourceRoot = resolve(new URL("../", import.meta.url).pathname);
const ownFile = (pathname, repository) => {
  const prefix = `/${repository}/`;
  if (!pathname.startsWith(prefix)) return null;
  const local = resolve(sourceRoot, pathname.slice(prefix.length));
  return local.startsWith(`${sourceRoot}${sep}`) ? local : null;
};
function registerProtocol(electron, instance) {
  const { hostname, pathname } = pagesLocation(instance);
  electron.protocol.handle("agent-m", async (request) => {
    const url = new URL(request.url);
    if (url.hostname !== hostname) return new Response("Not found", { status: 404 });
    const file = ownFile(url.pathname, pathname.slice(1));
    if (!file) return new Response("Not found", { status: 404 });
    return electron.net.fetch(pathToFileURL(file).href);
  });
  return `agent-m://${hostname}${pathname}/desktop-shell/window.html`;
}
const show = (window) => { if (window.isMinimized()) window.restore(); window.show(); window.focus(); };

export async function start(electron, supplied = {}) {
  const config = typeof supplied === "string" ? { ...options(), dataFolder: supplied } : { ...options(), ...supplied };
  config.dataFolder ??= defaultDataFolder(electron, config.instance);
  if (!electron.app.requestSingleInstanceLock()) { electron.app.exit(); return null; }
  electron.protocol.registerSchemesAsPrivileged?.([{ scheme: "agent-m", privileges: { standard: true, secure: true, supportFetchAPI: true } }]);
  await electron.app.whenReady();
  const page = registerProtocol(electron, config.instance);
  const stored = loadSettings(config.dataFolder, { port: config.port });
  let bridge = null, paused = stored.paused, quitting = false, startupFailure = null;
  const window = new electron.BrowserWindow({ webPreferences: { preload: new URL("./preload.cjs", import.meta.url).pathname, contextIsolation: true, nodeIntegration: false } });
  window.webContents.setWindowOpenHandler(({ url }) => { electron.shell.openExternal(url); return { action: "deny" }; });
  window.webContents.on("will-navigate", (event, url) => { if (!url.startsWith("agent-m://")) { event.preventDefault(); electron.shell.openExternal(url); } });
  const bridgeState = async () => startupFailure ? { failure: startupFailure } : ({ address: bridge.address, token: bridge.token, instance: config.instance, paused, settings: bridge.settings, publicKey: bridge.key.publicKey, tunnels: await bridge.tunnels() });
  const restart = async () => {
    if (bridge) await bridge.close();
    bridge = await compose({ instance: config.instance, origin: config.origin, dataFolder: config.dataFolder, port: config.port, paused: () => paused });
    startupFailure = null;
    return bridgeState();
  };
  electron.ipcMain.handle("bridge-state", async (_event, action, value) => {
    if (!action) return bridgeState();
    if (startupFailure) return bridgeState();
    if (action === "settings") return { settings: bridge.settings };
    if (action === "tunnels") return { publicKey: bridge.key.publicKey, tunnels: await bridge.tunnels() };
    if (action === "save-settings") { saveSettings(config.dataFolder, { ...bridge.settings, ...value, paused }); return restart(); }
    if (action === "import-settings") {
      const taken = await takeExport(config.dataFolder, { instance: config.instance, ownComputer: Boolean(value?.ownComputer), session: value?.session, passphrase: value?.passphrase ?? "", name: value?.name }, value?.text ?? "");
      if (taken.pairingToken) await bridge.pairAnew(taken.pairingToken);
      paused = taken.paused;
      return restart();
    }
    throw new TypeError("Unknown Bridge window request.");
  });
  electron.ipcMain.handle("pair-anew", async () => { bridge.token = await bridge.pairAnew(); return bridge.token; });
  electron.ipcMain.handle("copy", (_event, text) => electron.clipboard.writeText(String(text)));
  electron.ipcMain.handle("pause", () => { paused = true; saveSettings(config.dataFolder, { ...bridge.settings, paused }); return paused; });
  electron.ipcMain.handle("resume", () => { paused = false; saveSettings(config.dataFolder, { ...bridge.settings, paused }); return paused; });
  electron.ipcMain.handle("retry-port", async (_event, port) => {
    config.port = Number(port);
    saveSettings(config.dataFolder, { ...loadSettings(config.dataFolder, { port: config.port }), port: config.port, paused });
    return restart();
  });
  electron.ipcMain.handle("quit", () => electron.app.quit());
  electron.app.on("second-instance", () => show(window));
  if (process.platform === "linux") {
    window.on("close", (event) => { if (!quitting) event.preventDefault(); });
  } else if (electron.Tray) {
    tray = new electron.Tray(electron.nativeImage.createFromPath(join(sourceRoot, "site-frame", "brand", "prl-lettered.png")));
    tray.setContextMenu(electron.Menu.buildFromTemplate([{ label: "Open Agent M Bridge", click: () => show(window) }, { label: "Pause", click: () => { paused = true; } }, { label: "Resume", click: () => { paused = false; } }, { label: "Quit", click: () => electron.app.quit() }]));
    tray.on("click", () => show(window));
    window.on("close", (event) => { if (!quitting) { event.preventDefault(); window.hide(); } });
  }
  electron.app.on("before-quit", (event) => {
    if (quitting) return;
    quitting = true;
    if (!bridge) return;
    event.preventDefault();
    bridge.close().finally(() => electron.app.exit());
  });
  try { await restart(); }
  catch (failure) { startupFailure = { name: failure.name, message: failure.message, folder: failure.folder ?? null }; }
  await window.loadURL(page);
  return bridge ?? { failure: startupFailure, close: async () => {} };
}

start(electron).catch((failure) => { console.error(failure.message); electron.app?.quit?.(); });
