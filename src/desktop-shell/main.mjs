// Module: MOD-desktop-shell
import { compose } from "./compose.mjs";

const option = (name) => process.argv.slice(2).find((value) => value.startsWith(`${name}=`))?.slice(name.length + 1);
const instance = option("--instance") ?? "akmaier/agent-m";
const origin = option("--origin") ?? "https://akmaier.github.io";

export async function start(electron, dataFolder) {
  const bridge = await compose({ instance, origin, dataFolder });
  await electron.app.whenReady();
  electron.ipcMain.handle("bridge-state", () => ({ address: bridge.address, token: bridge.token, instance }));
  electron.ipcMain.handle("pair-anew", async () => {
    bridge.token = await bridge.pairAnew();
    return bridge.token;
  });
  electron.ipcMain.handle("copy", async (_event, text) => electron.clipboard.writeText(text));
  electron.protocol.handle("agent-m", (request) => electron.net.fetch(new URL(request.url.replace("agent-m://", "file://")).href));
  const window = new electron.BrowserWindow({ webPreferences: { preload: new URL("./preload.cjs", import.meta.url).pathname, contextIsolation: true, nodeIntegration: false } });
  await window.loadFile(new URL("./window.html", import.meta.url).pathname);
  electron.app.on("before-quit", () => bridge.close());
  return bridge;
}

if (process.versions.electron) {
  const electron = await import("electron");
  const folder = option("--data-folder") ?? electron.app.getPath("userData");
  start(electron, folder).catch((failure) => { console.error(failure.message); electron.app.quit(); });
}
