// Module: MOD-desktop-shell
import { bridgeApi, pairAnew, serveBridge } from "../bridge-http/index.mjs";
import { checkOut, jobHandlers, keepJobLogs, startWatching, stopWatching, useRepositoryTokens } from "../bridge-jobs/index.mjs";
import { mailHandlers } from "../mail-protocols/index.mjs";
import { registerStrategies } from "../job-runner/index.mjs";
import * as approvals from "../approvals/index.mjs";
import * as specChanges from "../spec-changes/index.mjs";
import * as artifactEdits from "../artifact-edits/index.mjs";
import * as sourceRegister from "../source-register/index.mjs";
import * as workPlans from "../work-plans/index.mjs";
import * as runPlanner from "../run-planner/index.mjs";
import * as runtimes from "../runtimes/index.mjs";
import * as reuseFacts from "../reuse-facts/index.mjs";
import * as resourceList from "../resource-list/index.mjs";
import * as testSchedule from "../test-schedule/index.mjs";
import * as resultRecords from "../result-records/index.mjs";
import * as issueHandling from "../issue-handling/index.mjs";
import { closeTunnels, ensureKey, openTunnels, tunnelHandlers } from "../tunnels/index.mjs";
import { composeSettingsHandlers, loadSettings } from "./settings.mjs";
import { agentEnclosure } from "../agent-enclosure/index.mjs";

const STRATEGIES = [["MOD-approvals", approvals, "approvalStrategies"], ["MOD-spec-changes", specChanges, "specStrategies"],
  ["MOD-artifact-edits", artifactEdits, "editStrategies"], ["MOD-source-register", sourceRegister, "sourceStrategies"],
  ["MOD-reuse-facts", reuseFacts, "reuseStrategies"], ["MOD-resource-list", resourceList, "resourceStrategies"],
  ["MOD-work-plans", workPlans, "workStrategies"], ["MOD-run-planner", runPlanner, "runStrategies"], ["MOD-test-schedule", testSchedule, "scheduleStrategies"],
  ["MOD-result-records", resultRecords, "resultStrategies"], ["MOD-issue-handling", issueHandling, "issueStrategies"], ["MOD-runtimes", runtimes, "routeStrategies"]];
let strategiesRegistered = false;

// The enclosure of each offered agent, by its working folder, for this Bridge's data folder (ARC-054): every process of an agent runs in it.
export const bridgeEnclosures = (dataFolder) => (folder) => agentEnclosure({ dataFolder, folder });

export function composeJobHandlers(settings, enclosures = null) {
  return jobHandlers({ agents: settings.agents ?? [], enclosures });
}

export function composeBridgeHandlers(settings, enclosures = null, dataFolder = null, { checkOutAgain } = {}) {
  return { jobs: composeJobHandlers(settings, enclosures), mail: mailHandlers(), tunnels: tunnelHandlers,
    ...(dataFolder ? { settings: composeSettingsHandlers(settings, dataFolder, { checkOutAgain }) } : {}) };
}

// The checkout of the offered agents' working folders (MOD-desktop-shell, The checkout; UC-044 step 3): run in the background, one after another, its last
// result kept in memory for the window. `checkOut()` starts one and gives the promise of its result; `last()` the result of the last that ended, or null.
export function checkoutRunner(settings, instance) {
  let running = Promise.resolve(null), last = null;
  const checkOutNow = () => (running = running.then(() => checkOut({ instance, products: settings.products ?? [], agents: settings.agents ?? [] }))
    .then((result) => (last = result), (failure) => (last = [{ agent: null, repository: instance, folder: null, commit: null, reason: failure.message }])));
  return { checkOut: checkOutNow, last: () => last };
}

export function bridgeStrategyRegistrations() {
  return STRATEGIES.filter(([_owner, module, name]) => module[name]).map(([owner, module, name]) => ({ owner, name, strategies: module[name] }));
}

export function registerBridgeStrategiesOnce() {
  if (strategiesRegistered) return;
  strategiesRegistered = true;
  for (const { owner, strategies } of bridgeStrategyRegistrations()) registerStrategies(owner, strategies);
}

export function composeWatchConfig(settings, instance, onSkipped) {
  return {
    bridgeName: settings.name,
    agents: settings.agents ?? [],
    products: (settings.products ?? []).map((address) => ({ address })),
    every: settings.every * 1000,
    instance,
    ...(onSkipped ? { onSkipped } : {}),
  };
}

// A served product the watcher skips is reported with its reason on the Bridge's error output, where nothing else is told of it.
const reportSkipped = ({ product, reason }) => console.error(`Bridge: ${product} is skipped until the next interval: ${reason}`);

export function createBridgeJobRuntime(settings, { instance, paused, startWatching, stopWatching, onSkipped = reportSkipped, enclosures = null }) {
  const config = { ...composeWatchConfig(settings, instance, onSkipped), ...(enclosures ? { enclosures } : {}) };
  let watching = false;
  const start = () => {
    registerBridgeStrategiesOnce();
    if (watching || paused()) return;
    startWatching(config);
    watching = true;
  };
  const stop = async (reason) => {
    if (!watching) return;
    watching = false;
    await stopWatching(reason);
  };
  return { start, pause: () => stop("pause"), resume: start, close: () => stop("quit") };
}

export async function compose({ instance, origin, dataFolder, port = bridgeApi.defaultPort, paused = () => false, version = null }) {
  const settings = loadSettings(dataFolder, port === 0 ? {} : { port });
  // Every git of this process reads the repository tokens the paired browser handed the Bridge, before anything reaches a repository.
  useRepositoryTokens(dataFolder);
  keepJobLogs(dataFolder);
  const key = await ensureKey(dataFolder);
  const enclosures = bridgeEnclosures(dataFolder);
  const checkout = checkoutRunner(settings, instance);
  // The pair answer names the Bridge by the settings in force and its release by build.json's version, null for a start without it.
  const bridge = await serveBridge({ host: "127.0.0.1", port: port === 0 ? 0 : settings.port, origin, dataFolder, paused, name: () => settings.name, version },
    composeBridgeHandlers(settings, enclosures, dataFolder, { checkOutAgain: () => checkout.checkOut() }));
  await openTunnels(dataFolder, settings.tunnels, Number(new URL(bridge.address).port));
  const jobs = createBridgeJobRuntime(settings, { instance, paused, startWatching, stopWatching, enclosures });
  jobs.start();
  return {
    instance,
    origin,
    settings,
    key,
    ...bridge,
    enclosures,
    // At start every working folder is checked out, in the background (MOD-desktop-shell, Start and The checkout).
    checkingOut: checkout.checkOut(),
    checkOut: () => checkout.checkOut(),
    checkout: () => checkout.last(),
    pairAnew: (token = null) => pairAnew(dataFolder, token),
    tunnels: () => tunnelHandlers["GET /v1/tunnels"]().then((answer) => answer.tunnels),
    pauseWatching: () => jobs.pause(),
    resumeWatching: () => jobs.resume(),
    close: async () => { await jobs.close(); await closeTunnels(); await bridge.close(); },
  };
}
