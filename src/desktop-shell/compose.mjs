// Module: MOD-desktop-shell
import { bridgeApi, pairAnew, serveBridge } from "../bridge-http/index.mjs";
import { jobHandlers } from "../bridge-jobs/index.mjs";
import { closeTunnels, ensureKey, openTunnels, tunnelHandlers } from "../tunnels/index.mjs";
import { loadSettings } from "./settings.mjs";

export async function compose({ instance, origin, dataFolder, port = bridgeApi.defaultPort, paused = () => false }) {
  const settings = loadSettings(dataFolder, { port });
  const key = await ensureKey(dataFolder);
  const bridge = await serveBridge({ host: "127.0.0.1", port: settings.port, origin, dataFolder, paused }, { jobs: jobHandlers(), tunnels: tunnelHandlers });
  await openTunnels(dataFolder, settings.tunnels, settings.port);
  return { instance, origin, settings, key, ...bridge, pairAnew: (token = null) => pairAnew(dataFolder, token), tunnels: () => tunnelHandlers["GET /v1/tunnels"]().then((answer) => answer.tunnels), close: async () => { await closeTunnels(); await bridge.close(); } };
}
