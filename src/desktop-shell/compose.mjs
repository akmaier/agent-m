// Module: MOD-desktop-shell
import { bridgeApi, pairAnew, serveBridge } from "../bridge-http/index.mjs";
import { jobHandlers } from "../bridge-jobs/index.mjs";

export async function compose({ instance, origin, dataFolder, port = bridgeApi.defaultPort, paused = () => false }) {
  const bridge = await serveBridge({ host: "127.0.0.1", port, origin, dataFolder, paused }, { jobs: jobHandlers() });
  return { instance, origin, ...bridge, pairAnew: () => pairAnew(dataFolder, null) };
}
