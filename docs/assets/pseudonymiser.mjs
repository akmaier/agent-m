// Pseudonymiser — personal data in a product's repository: whether its pseudonymisation is on (docs/settings.md), and who
// agreed to be named (docs/collaborators.md). Feature (ARC-003): it reads nothing itself and writes nothing; the caller gives it
// the texts and commits what it returns.
//
// Module: MOD-pseudonymiser

// ---------------------------------------------------------------- the product's settings (UC-042 4–5, SPEC §14)
//
// A PRODUCT'S SETTINGS LIVE IN ITS REPOSITORY: docs/settings.md, one line `- name: value` per setting; a
// setting that is not listed has its default. PSEUDONYMISATION IS ON UNLESS A PRODUCT SWITCHES IT OFF.

export const PRODUCT_SETTINGS_PATH = "docs/settings.md";
export const COLLABORATORS_PATH = "docs/collaborators.md";

export const SETTING_LINE = /^- ([a-z][a-z0-9-]*):[ \t]*(.+?)[ \t]*$/;

export function parseProductSettings(text) {
  const out = {};
  for (const line of String(text || "").split("\n")) {
    const m = SETTING_LINE.exec(line);
    if (m) out[m[1]] = m[2];
  }
  return out;
}

export const pseudonymisationOn = (text) => parseProductSettings(text).pseudonymisation !== "off";

// Set one setting's line (value null removes it); every other line of the file stays as it was.
export function setProductSetting(text, name, value, product) {
  let t = text || `# Settings of ${product}\n\nHow this product is developed, for everyone who works on it and every agent that runs for it.\n` +
    "Changed on the Agent M dashboard (Settings). One line `- name: value` per setting; a setting not listed has its default.\n\n";
  const lines = t.split("\n");
  const at = lines.findIndex((l) => SETTING_LINE.exec(l)?.[1] === name);
  if (at >= 0) {
    if (value === null) lines.splice(at, 1); else lines[at] = `- ${name}: ${value}`;
    return lines.join("\n");
  }
  if (value === null) return t;
  if (!t.endsWith("\n")) t += "\n";
  return `${t}- ${name}: ${value}\n`;
}

// ---------------------------------------------------------------- collaborators (SPEC §14)

// A PERSON IS NAMED BY ACCOUNT OR WITH CONSENT: docs/collaborators.md, one table row per person who agreed
// to be named — name, account, date agreed.
const ACCOUNT_RE = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,38})$/;
// GitLab user names: letters, digits, '_', '-', '.'; not starting with '-', not ending in '.', '.git' or '.atom'
// (NAMESPACE_FORMAT_REGEX_JS and NO_SUFFIX_REGEX of lib/gitlab/path_regex.rb, URL_MAX_LENGTH 255).
const GITLAB_ACCOUNT_RE = /^(?:[A-Za-z0-9_.][A-Za-z0-9_.-]{0,254}[A-Za-z0-9_-]|[A-Za-z0-9_])$/;
const accountOk = (a, gitlab) => (gitlab ? GITLAB_ACCOUNT_RE.test(a) && !/\.(git|atom)$/.test(a) : ACCOUNT_RE.test(a));

export function parseCollaborators(text) {
  const out = [];
  for (const line of String(text || "").split("\n")) {
    const m = /^\|\s*([^|]+?)\s*\|\s*@?([A-Za-z0-9_.-]+)\s*\|\s*(\d{4}-\d{2}-\d{2})\s*\|\s*$/.exec(line);
    if (m) out.push({ name: m[1], account: m[2], agreed: m[3] });
  }
  return out;
}

export function formatCollaborators(list, product) {
  return `# Collaborators of ${product}\n\nPeople who agreed to be named in this repository, with the date they agreed. Anyone else is\n` +
    "named only by their account. Changed on the Agent M dashboard (Settings).\n\n| Name | Account | Agreed on |\n|---|---|---|\n" +
    list.map((c) => `| ${c.name} | @${c.account} | ${c.agreed} |\n`).join("");
}

// gitlab: the product is on a GitLab server, whose user names differ from GitHub's.
export function addCollaborator(list, { name, account, agreed, consent, gitlab = false }) {
  if (consent !== true) throw new Error("Tick “this person has agreed to be named” — without it, a person is named only by account.");
  const n = String(name ?? "").trim(), a = String(account ?? "").trim().replace(/^@/, ""), d = String(agreed ?? "").trim();
  if (!n || /[|\n]/.test(n)) throw new Error("Enter the person's name (without “|”).");
  if (!accountOk(a, gitlab)) throw new Error(`“${a}” is not a ${gitlab ? "GitLab user" : "GitHub account"} name.`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) throw new Error("Enter the date they agreed as YYYY-MM-DD.");
  if (list.some((c) => c.account.toLowerCase() === a.toLowerCase())) throw new Error(`@${a} is already listed.`);
  return [...list, { name: n, account: a, agreed: d }];
}

export const removeCollaborator = (list, account) => list.filter((c) => c.account !== account);
