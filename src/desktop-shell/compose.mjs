// Module: MOD-desktop-shell
import { bridgeApi, serveBridge } from "../bridge-http/index.mjs";

export async function compose({ instance, origin, dataFolder, port = bridgeApi.defaultPort, paused = () => false }) {
  const bridge = await serveBridge({ host: "127.0.0.1", port, origin, dataFolder, paused }, { jobs: {} });
  return { instance, origin, ...bridge, pairAnew: async () => (await import("../bridge-http/index.mjs")).pairAnew(dataFolder, null) };
}
