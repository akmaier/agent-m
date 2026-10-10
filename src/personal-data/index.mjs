// MOD-personal-data — the canonical product settings schemas and the pseudonymisation reader.
//
// It reads only its own schema data files, once when this module loads. In Node those files come from disk; in a browser
// they come from the module's own address. Product documents remain the caller's responsibility through MOD-documents.

import { loadSchema } from "../documents/index.mjs";

const OWNER = "MOD-personal-data";
const SETTINGS_SCHEMA_FILE = new URL("./settings.schema.md", import.meta.url);
const COLLABORATORS_SCHEMA_FILE = new URL("./collaborators.schema.md", import.meta.url);
const disk = globalThis.process?.getBuiltinModule?.("node:fs");

async function ownFile(url) {
  const answer = await fetch(url);
  if (!answer.ok) throw new Error(`${OWNER}: its ${url.pathname} was not served (${answer.status})`);
  return answer.text();
}

const schemas = {
  settings: loadSchema(disk ? disk.readFileSync(SETTINGS_SCHEMA_FILE, "utf8") : await ownFile(SETTINGS_SCHEMA_FILE), OWNER),
  collaborators: loadSchema(disk ? disk.readFileSync(COLLABORATORS_SCHEMA_FILE, "utf8") : await ownFile(COLLABORATORS_SCHEMA_FILE), OWNER),
};

/**
 * settingsSchemas() -> Promise<{ settings: Schema, collaborators: Schema }> — the canonical schemas of a product's
 * docs/settings.md and docs/collaborators.md files, loaded from this module's own data files.
 */
export async function settingsSchemas() {
  return schemas;
}

/**
 * pseudonymisationOf(settings: Document | null) -> "on" | "off" — a missing product settings document, or one without
 * the canonical key, keeps pseudonymisation on; only an explicit canonical off turns it off.
 */
export function pseudonymisationOf(settings) {
  return settings?.fields?.pseudonymisation === "off" ? "off" : "on";
}
