// Module: MOD-desktop-shell
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { bridgeApi } from "../bridge-http/index.mjs";
import { tunnelCommands } from "../bridge-client/index.mjs";
import { readExport } from "../browser-store/index.mjs";

const SETTINGS_FILE = "settings.json";
const KEY_FILE = (dataFolder) => join(dataFolder, "ssh", "id_ed25519");
const fields = ["agent-m-bridge-settings", "name", "port", "products", "every", "paused", "jumpHost", "tunnels"];

const defaults = (dataFolder, supplied = {}) => ({
  "agent-m-bridge-settings": 1, name: supplied.name ?? "Bridge", port: supplied.port ?? bridgeApi.defaultPort,
  products: supplied.products ?? [], every: supplied.every ?? 300, paused: supplied.paused ?? false,
  jumpHost: supplied.jumpHost ?? null, tunnels: supplied.tunnels ?? [],
});

const fileOf = (dataFolder) => join(dataFolder, SETTINGS_FILE);
const error = (name, message) => Object.assign(new Error(message), { name });
function canonical(dataFolder, value) {
  const result = defaults(dataFolder, value);
  for (const field of fields) result[field] = value?.[field] ?? result[field];
  if (result["agent-m-bridge-settings"] !== 1 || !Number.isInteger(result.port) || result.port < 1 || result.port > 65535 ||
    !Array.isArray(result.products) || !Number.isInteger(result.every) || result.every < 1 || typeof result.paused !== "boolean" ||
    !Array.isArray(result.tunnels)) throw error("InvalidSettings", "Bridge settings are invalid.");
  return Object.fromEntries(fields.map((field) => [field, field === "tunnels" ? result[field].map((plan) => ({ ...plan, keyFile: KEY_FILE(dataFolder) })) : result[field]]));
}

export function loadSettings(dataFolder, supplied = {}) {
  if (!existsSync(fileOf(dataFolder))) return canonical(dataFolder, supplied);
  return canonical(dataFolder, JSON.parse(readFileSync(fileOf(dataFolder), "utf8")));
}

export function saveSettings(dataFolder, value) {
  const settings = canonical(dataFolder, value);
  mkdirSync(dataFolder, { recursive: true, mode: 0o700 });
  writeFileSync(fileOf(dataFolder), JSON.stringify(settings), { encoding: "utf8", mode: 0o600 });
  return settings;
}

function sessions(settings) {
  return Object.entries(settings).flatMap(([key, value]) => key.startsWith("remote-session:") && value && typeof value === "object"
    ? [{ name: key.slice("remote-session:".length), ...value }] : []);
}

export async function takeExport(dataFolder, choice, text) {
  const exported = await readExport(text, choice?.passphrase ?? "");
  if (exported.instance !== choice?.instance) throw error("WrongInstance", "This settings export belongs to another Agent M instance.");
  const jumpHost = exported.settings["jump-host"] ?? null;
  const selected = choice?.ownComputer ? sessions(exported.settings) : sessions(exported.settings).filter((session) => session.name === choice?.session);
  if (!jumpHost || !selected.length) throw error("MissingTunnelSettings", "The export has no selected remote session and jump host.");
  const port = bridgeApi.defaultPort;
  const keyFile = KEY_FILE(dataFolder);
  const tunnels = selected.map((session) => {
    const plans = tunnelCommands(jumpHost, session, port, { remote: keyFile, local: keyFile }).plans;
    return plans.find((plan) => plan.direction === (choice.ownComputer ? "forward" : "reverse"));
  });
  const first = selected[0];
  const settings = saveSettings(dataFolder, {
    name: choice.ownComputer ? choice.name ?? "Bridge" : first.name, port,
    products: exported.settings.products ?? [], every: 300, paused: false, jumpHost, tunnels,
  });
  return { ...settings, pairingToken: choice.ownComputer ? null : first.token ?? null };
}
