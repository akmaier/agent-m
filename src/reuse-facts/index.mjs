// MOD-reuse-facts - the due-diligence facts of a reuse candidate, read from package registries and source repositories
// (docs/architecture/MOD-reuse-facts.md). registryFacts and licenceVerdict read package facts and licence compatibility;
// reuseStrategies adds those facts to drafted architecture decisions; hubFacts reads a model's or dataset's facts from the Hugging Face Hub; repositoryFacts reads a resource repository's licence file, last commit and committers.
//
// Module: MOD-reuse-facts

import { parseAddress, connect as connectRepositoryHost } from "../repository-hosts/index.mjs";
import { finding } from "../text-tools/index.mjs";

const OWNER = "MOD-reuse-facts";
const disk = globalThis.process?.getBuiltinModule?.("node:fs");
const REGISTRIES_FILE = new URL("./registries.md", import.meta.url);
const LICENCES_FILE = new URL("./licences.md", import.meta.url);

async function ownFile(url) {
  const answer = await fetch(url);
  if (!answer.ok) throw new Error(`${OWNER}: its ${url.pathname} was not served (${answer.status})`);
  return answer.text();
}

const own = (url) => (disk ? disk.readFileSync(url, "utf8") : ownFile(url));

const REGISTRIES = parseRegistries(await own(REGISTRIES_FILE));
const LICENCES = parseLicences(await own(LICENCES_FILE));

/**
 * @typedef {{ name: string, ecosystem: "npm" | "pypi" | "crates" | "maven", repository: string | null }} Candidate
 * @typedef {{ candidate: string, ecosystem: string, what: "exists" | "licence" | "first release" | "latest release" |
 *   "releases" | "open issues" | "closed issues" | "issues filed at" | "adoption" | "revision" | "access" |
 *   "licence file" | "last commit" | "committers in the last year", value: string, address: string,
 *   read: string }} Fact
 * @typedef {{ candidate: Candidate, facts: Fact[], licence: "compatible" | "not known to be compatible" | "not checked",
 *   found: boolean, blocked: string | null }} DueDiligence
 */

// ---------------------------------------------------------------- data files

function cellsOf(line) {
  const trimmed = line.trim();
  if (!trimmed.startsWith("|") || !trimmed.endsWith("|")) return null;
  return trimmed.slice(1, -1).split("|").map((cell) => cell.trim());
}

function tableRows(text) {
  const rows = [];
  let header = null;
  for (const line of String(text).split(/\r?\n/)) {
    const cells = cellsOf(line);
    if (!cells) continue;
    if (cells.every((cell) => /^:?-{3,}:?$/.test(cell))) continue;
    if (!header) {
      header = cells;
      continue;
    }
    rows.push(Object.fromEntries(header.map((column, at) => [column, cells[at] ?? ""])));
  }
  return rows;
}

function parseRegistries(text) {
  return new Map(tableRows(text).map((row) => [row.Ecosystem, Object.freeze({
    package: row.Package,
    adoption: row.Adoption === "-" ? "" : row.Adoption,
  })]));
}

function splitList(value) {
  return String(value ?? "").split(",").map((each) => each.trim()).filter(Boolean);
}

function parseLicences(text) {
  return new Map(tableRows(text).map((row) => [licenceKey(row["Product licence"]),
    new Set(splitList(row["Compatible candidate licences"]).map(licenceKey))]));
}

// ---------------------------------------------------------------- facts

const TODAY = () => new Date().toISOString().slice(0, 10);
const asDate = (value) => {
  if (typeof value === "function") return asDate(value());
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  const text = String(value ?? "");
  return text ? text.slice(0, 10) : TODAY();
};

function fact(candidate, what, value, address, read) {
  return {
    candidate: candidate.name,
    ecosystem: candidate.ecosystem,
    what,
    value: String(value),
    address,
    read,
  };
}

function packageAddress(candidate) {
  const registry = REGISTRIES.get(candidate.ecosystem);
  if (!registry) throw new TypeError(`unknown reuse registry ecosystem: ${candidate.ecosystem}`);
  return registry.package.replaceAll("{name}", encodeURIComponent(candidate.name));
}

function adoptionAddress(candidate) {
  const registry = REGISTRIES.get(candidate.ecosystem);
  return registry?.adoption ? registry.adoption.replaceAll("{name}", encodeURIComponent(candidate.name)) : null;
}

async function fetchJson(fetcher, address) {
  let answer;
  try {
    answer = await fetcher(address);
  } catch (error) {
    return { blocked: String(error?.message ?? error) };
  }
  if (answer.status === 404) return { notFound: true };
  if (!answer.ok) {
    const reason = `${answer.status} ${answer.statusText ?? ""}`.trim();
    return { blocked: reason };
  }
  try {
    return { json: await answer.json() };
  } catch (error) {
    return { blocked: `invalid JSON: ${String(error?.message ?? error)}` };
  }
}

function blocked(candidate, address, reason) {
  return { candidate, facts: [], licence: "not checked", found: false,
    blocked: `${candidate.ecosystem} at ${address}: ${reason}` };
}

function notFound(candidate, address, read) {
  return { candidate, facts: [fact(candidate, "exists", "not found - the name may be invented", address, read)],
    licence: "not checked", found: false, blocked: null };
}

function licenceKey(value) {
  return String(value ?? "").trim().toLowerCase();
}

function normalLicence(value) {
  const text = String(value ?? "").trim();
  if (!text || /^unknown$/i.test(text) || /^n\/?a$/i.test(text)) return null;
  return text;
}

/**
 * licenceVerdict(candidate, product) -> "compatible" | "not known to be compatible" | "not checked"
 * @param {string | null} candidate
 * @param {string | null} product
 */
export function licenceVerdict(candidate, product) {
  const productLicence = normalLicence(product);
  const candidateLicence = normalLicence(candidate);
  if (!productLicence || !candidateLicence) return "not checked";
  const compatible = LICENCES.get(licenceKey(productLicence));
  return compatible?.has(licenceKey(candidateLicence)) ? "compatible" : "not known to be compatible";
}

function dateOnly(value) {
  const text = String(value ?? "");
  return text ? text.slice(0, 10) : null;
}

function datedVersion(version, date) {
  return date ? `${version} on ${date}` : version;
}

function sortedReleases(records) {
  return records.filter((record) => record.version && record.date)
    .sort((a, b) => a.date.localeCompare(b.date) || a.version.localeCompare(b.version));
}

function normalRepository(value) {
  const text = typeof value === "string" ? value : String(value?.url ?? "");
  return text.trim().replace(/^git\+/, "").replace(/^git:/, "https:").replace(/\.git$/, "");
}

function npmFacts(candidate, data, address, read) {
  const versions = Object.keys(data?.versions ?? {});
  const releases = sortedReleases(versions.map((version) => ({ version, date: dateOnly(data?.time?.[version]) })));
  const latestVersion = data?.["dist-tags"]?.latest ?? releases.at(-1)?.version ?? versions.at(-1) ?? null;
  const latest = latestVersion ? { version: latestVersion, date: dateOnly(data?.time?.[latestVersion]) } : null;
  const licence = normalLicence(data?.license ?? data?.licenses?.type ?? (Array.isArray(data?.licenses) ? data.licenses[0]?.type : null));
  return {
    licence,
    repository: candidate.repository ?? normalRepository(data?.repository),
    facts: [
      fact(candidate, "exists", "yes", address, read),
      ...(licence ? [fact(candidate, "licence", licence, address, read)] : []),
      ...(releases[0] ? [fact(candidate, "first release", datedVersion(releases[0].version, releases[0].date), address, read)] : []),
      ...(latest ? [fact(candidate, "latest release", datedVersion(latest.version, latest.date), address, read)] : []),
      ...(versions.length ? [fact(candidate, "releases", versions.length, address, read)] : []),
    ],
  };
}

function pypiFacts(candidate, data, address, read) {
  const releases = sortedReleases(Object.entries(data?.releases ?? {}).map(([version, files]) => ({
    version,
    date: dateOnly((Array.isArray(files) ? files : []).find((file) => file?.upload_time_iso_8601 || file?.upload_time)
      ?.upload_time_iso_8601 ?? (Array.isArray(files) ? files : [])[0]?.upload_time),
  })));
  const latestVersion = data?.info?.version ?? releases.at(-1)?.version ?? null;
  const latest = releases.find((release) => release.version === latestVersion) ?? (latestVersion ? { version: latestVersion, date: null } : null);
  const licence = normalLicence(data?.info?.license);
  return {
    licence,
    repository: candidate.repository ?? normalRepository(data?.info?.project_urls?.Source ?? data?.info?.project_urls?.Repository),
    adoption: Number.isFinite(data?.info?.downloads?.last_month) ? `${data.info.downloads.last_month} downloads last month` : null,
    facts: [
      fact(candidate, "exists", "yes", address, read),
      ...(licence ? [fact(candidate, "licence", licence, address, read)] : []),
      ...(releases[0] ? [fact(candidate, "first release", datedVersion(releases[0].version, releases[0].date), address, read)] : []),
      ...(latest ? [fact(candidate, "latest release", datedVersion(latest.version, latest.date), address, read)] : []),
      ...(Object.keys(data?.releases ?? {}).length ? [fact(candidate, "releases", Object.keys(data.releases).length, address, read)] : []),
    ],
  };
}

function cratesFacts(candidate, data, address, read) {
  const crate = data?.crate;
  if (!crate) return null;
  const licence = normalLicence(crate.license);
  return {
    licence,
    repository: candidate.repository ?? normalRepository(crate.repository),
    adoption: Number.isFinite(crate.downloads) ? `${crate.downloads} downloads total` : null,
    facts: [
      fact(candidate, "exists", "yes", address, read),
      ...(licence ? [fact(candidate, "licence", licence, address, read)] : []),
      ...(crate.created_at ? [fact(candidate, "first release", dateOnly(crate.created_at), address, read)] : []),
      ...(crate.newest_version ? [fact(candidate, "latest release", datedVersion(crate.newest_version, dateOnly(crate.updated_at)), address, read)] : []),
      ...(Number.isFinite(crate.versions) ? [fact(candidate, "releases", crate.versions, address, read)] : []),
    ],
  };
}

function mavenFacts(candidate, data, address, read) {
  const doc = data?.response?.docs?.[0] ?? null;
  if (!doc || data?.response?.numFound === 0) return null;
  return {
    licence: null,
    repository: candidate.repository,
    facts: [
      fact(candidate, "exists", "yes", address, read),
      ...(doc.latestVersion ? [fact(candidate, "latest release", datedVersion(doc.latestVersion, dateOnly(doc.timestamp)), address, read)] : []),
      ...(Number.isFinite(doc.versionCount) ? [fact(candidate, "releases", doc.versionCount, address, read)] : []),
    ],
  };
}

function registryPayloadFacts(candidate, data, address, read) {
  if (candidate.ecosystem === "npm") return npmFacts(candidate, data, address, read);
  if (candidate.ecosystem === "pypi") return pypiFacts(candidate, data, address, read);
  if (candidate.ecosystem === "crates") return cratesFacts(candidate, data, address, read);
  if (candidate.ecosystem === "maven") return mavenFacts(candidate, data, address, read);
  throw new TypeError(`unknown reuse registry ecosystem: ${candidate.ecosystem}`);
}

function issuePage(address) {
  return address.server === "github" ? `${address.web}/issues` : `${address.web}/-/issues`;
}

async function issueFacts(candidate, repository, options, read) {
  const repo = normalRepository(repository);
  if (!repo) return [];
  const address = parseAddress(repo);
  const host = await (options.connect ?? connectRepositoryHost)(address, {});
  if (typeof host.repositoryInfo === "function") await host.repositoryInfo();
  const counts = await host.issueCounts();
  return [
    fact(candidate, "open issues", counts.open, address.web, read),
    fact(candidate, "closed issues", counts.closed, address.web, read),
    fact(candidate, "issues filed at", issuePage(address), address.web, read),
  ];
}

async function adoptionFact(candidate, address, parsed, fetcher, read) {
  if (parsed.adoption) return fact(candidate, "adoption", parsed.adoption, address, read);
  const adoption = adoptionAddress(candidate);
  if (!adoption) return null;
  const answer = await fetchJson(fetcher, adoption);
  if (answer.blocked) return { blocked: blocked(candidate, adoption, answer.blocked) };
  if (answer.notFound) return null;
  const downloads = answer.json?.downloads;
  if (!Number.isFinite(downloads)) return null;
  return fact(candidate, "adoption", `${downloads} downloads last month`, adoption, read);
}

/**
 * registryFacts(candidate, productLicence) -> Promise<DueDiligence>
 * @param {Candidate} candidate
 * @param {string | null} productLicence
 * @param {{ fetch?: typeof fetch, connect?: typeof connectRepositoryHost, now?: (() => string | Date) | string | Date }} options
 * @returns {Promise<DueDiligence>}
 */
export async function registryFacts(candidate, productLicence, options = {}) {
  const read = asDate(options.now ?? TODAY);
  const address = packageAddress(candidate);
  const fetcher = options.fetch ?? globalThis.fetch;
  if (typeof fetcher !== "function") throw new TypeError("registryFacts needs fetch to read package registries");

  const answer = await fetchJson(fetcher, address);
  if (answer.blocked) return blocked(candidate, address, answer.blocked);
  if (answer.notFound) return notFound(candidate, address, read);

  const parsed = registryPayloadFacts(candidate, answer.json, address, read);
  if (!parsed) return notFound(candidate, address, read);

  let issues;
  try {
    issues = await issueFacts(candidate, parsed.repository, options, read);
  } catch (error) {
    return blocked(candidate, parsed.repository || address, String(error?.message ?? error));
  }

  const adoption = await adoptionFact(candidate, address, parsed, fetcher, read);
  if (adoption?.blocked) return adoption.blocked;

  return {
    candidate,
    facts: [...parsed.facts, ...issues, ...(adoption ? [adoption] : [])],
    licence: licenceVerdict(parsed.licence, productLicence),
    found: true,
    blocked: null,
  };
}

// The Hub's own origin, as registries.md writes it in front of /api/: the only one a Hub key is sent to (MOD-reuse-facts, Interfaces: hubFacts).
const HUB_ORIGIN = REGISTRIES.get("huggingface-model").package.split("/api/")[0];
// A Hub identifier is the Hub's own path: `owner/name` or a bare `name` for a model, `datasets/owner/name` or `datasets/name` for a dataset.
const HUB_SEGMENT = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;

function hubFailure(name, properties, message) {
  return Object.assign(new Error(message), { name }, properties);
}

function hubAddress(id) {
  const wanted = "owner/name for a model, datasets/owner/name for a dataset";
  if (typeof id !== "string") throw new TypeError(`hubFacts needs a Hub identifier: ${wanted}`);
  const parts = id.split("/");
  const dataset = parts[0] === "datasets";
  const path = dataset ? parts.slice(1) : parts;
  if (path.length < 1 || path.length > 2 || !path.every((part) => HUB_SEGMENT.test(part))) {
    throw new TypeError(`hubFacts needs a Hub identifier: ${wanted}, not "${id}"`);
  }
  const registry = REGISTRIES.get(dataset ? "huggingface-dataset" : "huggingface-model");
  return registry.package.replaceAll("{name}", path.map(encodeURIComponent).join("/"));
}

const hubLicence = (data) => {
  const fromTag = (Array.isArray(data?.tags) ? data.tags : []).find((tag) => /^license:/.test(String(tag)));
  return normalLicence(data?.cardData?.license ?? (fromTag ? String(fromTag).slice("license:".length) : null));
};

/**
 * hubFacts(id, key?) -> Promise<Fact[]> — a model's or dataset's revision, licence and access (public, gated, private) read from the Hugging Face
 * Hub at the addresses of registries.md, each fact with its address and the date. `key` goes only to the Hub's own origin, in Authorization.
 * Rejects with HubBlocked { reason } where the Hub does not answer or answers no success, and NotFound { address } for an unknown identifier;
 * a TypeError for a text that is no Hub identifier, before any request.
 * @param {string} id
 * @param {string} [key]
 * @returns {Promise<Fact[]>}
 */
export async function hubFacts(id, key) {
  const address = hubAddress(id);
  const read = TODAY();
  const fetcher = globalThis.fetch;
  if (typeof fetcher !== "function") throw new TypeError("hubFacts needs fetch to read the Hugging Face Hub");
  const headers = key && address.startsWith(`${HUB_ORIGIN}/`) ? { Authorization: `Bearer ${key}` } : {};
  let answer;
  try {
    answer = await fetcher(address, { headers });
  } catch (error) {
    throw hubFailure("HubBlocked", { reason: String(error?.message ?? error) }, `The Hugging Face Hub could not be read at ${address}.`);
  }
  if (answer.status === 404) throw hubFailure("NotFound", { address }, `The Hugging Face Hub knows nothing at ${address}.`);
  if (!answer.ok) {
    const reason = `${answer.status} ${answer.statusText ?? ""}`.trim();
    throw hubFailure("HubBlocked", { reason }, `The Hugging Face Hub answered ${reason} at ${address}.`);
  }
  let data;
  try {
    data = await answer.json();
  } catch (error) {
    throw hubFailure("HubBlocked", { reason: `invalid JSON: ${String(error?.message ?? error)}` }, `The Hugging Face Hub answered no JSON at ${address}.`);
  }
  const candidate = { name: id, ecosystem: "huggingface" };
  const licence = hubLicence(data);
  const access = data?.private === true ? "private" : typeof data?.gated === "string" ? `gated (${data.gated})` : data?.gated === true ? "gated" : "public";
  return [
    ...(typeof data?.sha === "string" && data.sha ? [fact(candidate, "revision", data.sha, address, read)] : []),
    ...(licence ? [fact(candidate, "licence", licence, address, read)] : []),
    fact(candidate, "access", access, address, read),
  ];
}

// ---------------------------------------------------------------- a resource repository

// The licence file of a repository: LICENSE, LICENCE or COPYING at the root, with or without an extension.
const LICENCE_FILE = /^(?:LICEN[CS]E|COPYING)(?:\.[A-Za-z0-9]+)?$/i;
// The licences a licence file's title names, by the identifier licences.md uses.
const LICENCE_TITLES = [[/\bMIT License\b/i, "MIT"], [/\bApache License\b[\s\S]{0,80}\bVersion 2\.0\b/i, "Apache-2.0"], [/\bBSD 2-Clause\b/i, "BSD-2-Clause"],
  [/\bBSD 3-Clause\b/i, "BSD-3-Clause"], [/\bISC License\b/i, "ISC"]];
const YEAR_MS = 365 * 24 * 60 * 60 * 1000;

/**
 * repositoryFacts(host, productLicence, options?) -> Promise<{ facts: Fact[], licence }> — what a resource repository says about itself, through the host its caller connected: the licence file at
 * the default branch's head (readSnapshot), the date of the last commit and the number of distinct authors of the commits of the last year (readHistory with changes: false, newest first, read until
 * a commit older than a year), each with its address and date; the licence the file's text names against `productLicence` by licenceVerdict. A repository without a licence file gives the fact
 * `licence file` with the value `none`. Fails as the host fails. `options.now` is the day it is read, as registryFacts takes it.
 * @param {object} host MOD-repository-hosts' Host
 * @param {string | null} productLicence
 * @param {{ now?: (() => string | Date) | string | Date }} [options]
 */
export async function repositoryFacts(host, productLicence, options = {}) {
  const now = options.now instanceof Date ? options.now : new Date(typeof options.now === "function" ? options.now() : options.now ?? Date.now());
  const read = asDate(now);
  const { defaultBranch } = await host.repositoryInfo();
  const snapshot = await host.readSnapshot(defaultBranch);
  const web = snapshot.repository.web;
  const candidate = { name: snapshot.repository.path, ecosystem: "repository" };
  const file = snapshot.paths.find((path) => !path.includes("/") && LICENCE_FILE.test(path)) ?? null;
  const text = file === null ? null : await snapshot.read(file);

  const since = now.getTime() - YEAR_MS;
  let limit = 100, history;
  for (;;) {
    history = await host.readHistory(null, { ref: defaultBranch, limit, changes: false });
    if (history.length < limit || history.some((entry) => Date.parse(entry.date) < since)) break;
    limit *= 2;
  }
  const lastYear = history.filter((entry) => Date.parse(entry.date) >= since);
  const committers = new Set(lastYear.map((entry) => entry.author.account ?? entry.author.name));
  const detected = text === null ? null : LICENCE_TITLES.find(([title]) => title.test(text))?.[1] ?? null;
  return {
    facts: [
      fact(candidate, "licence file", file ?? "none", file === null ? web : `${web}/blob/${defaultBranch}/${file}`, read),
      ...(history[0] ? [fact(candidate, "last commit", dateOnly(history[0].date), `${web}/commit/${history[0].commit}`, read)] : []),
      fact(candidate, "committers in the last year", committers.size, `${web}/commits/${defaultBranch}`, read),
    ],
    licence: licenceVerdict(detected, productLicence),
  };
}

// ---------------------------------------------------------------- due-diligence step

const ARC_PATH = /^docs\/architecture\/ARC-\d{3}-[a-z0-9]+(?:-[a-z0-9]+)*\.md$/;
const DECISION_SECTIONS = Object.freeze([
  ["## Decision", "chosen"],
  ["## Alternatives", "alternative"],
]);

function sectionLines(text, heading) {
  const lines = String(text).split(/\r?\n/);
  const start = lines.findIndex((line) => line.trim() === heading);
  if (start < 0) return [];
  let end = lines.length;
  for (let at = start + 1; at < lines.length; at += 1) {
    if (/^##\s+/.test(lines[at])) {
      end = at;
      break;
    }
  }
  return lines.slice(start + 1, end).map((line, at) => ({ text: line, line: start + at + 2 }));
}

function valueOf(row, name) {
  const found = Object.entries(row).find(([key]) => key.toLowerCase() === name.toLowerCase());
  return found ? found[1] : "";
}

function plainCell(value) {
  return String(value ?? "")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .trim();
}

function normalEcosystem(value) {
  const text = plainCell(value).toLowerCase();
  return REGISTRIES.has(text) ? text : null;
}

function candidateFrom(row, fallbackRole, line) {
  const rawName = plainCell(valueOf(row, "Candidate") || valueOf(row, "Name"));
  const namedEcosystem = /\((npm|pypi|crates|maven)\)/i.exec(rawName)?.[1] ?? "";
  const ecosystem = normalEcosystem(valueOf(row, "Ecosystem") || namedEcosystem);
  const name = rawName
    .replace(/\s+-\s+(chosen|alternative)$/i, "")
    .replace(/\s+\((npm|pypi|crates|maven)\)$/i, "")
    .trim();
  if (!name || !ecosystem) return null;
  const repository = plainCell(valueOf(row, "Repository") || valueOf(row, "Source repository")) || null;
  return { candidate: { name, ecosystem, repository }, line,
    role: plainCell(valueOf(row, "Role")).toLowerCase() || fallbackRole };
}

function candidateRowsIn(lines, fallbackRole) {
  const rows = [];
  let header = null;
  for (const line of lines) {
    const cells = cellsOf(line.text);
    if (!cells) {
      header = null;
      continue;
    }
    if (cells.every((cell) => /^:?-{3,}:?$/.test(cell))) continue;
    if (!header) {
      header = cells;
      continue;
    }
    if (!header.some((cell) => cell.toLowerCase() === "candidate")) continue;
    const row = Object.fromEntries(header.map((column, at) => [column, cells[at] ?? ""]));
    const candidate = candidateFrom(row, fallbackRole, line.line);
    if (candidate) rows.push(candidate);
  }
  return rows;
}

function reuseCandidates(text) {
  return DECISION_SECTIONS.flatMap(([heading, role]) => candidateRowsIn(sectionLines(text, heading), role));
}

function licenceFromLicenseFile(text) {
  const body = String(text ?? "").trim();
  if (!body) return null;
  const first = body.split(/\r?\n/).find((line) => line.trim())?.trim() ?? "";
  const spdx = /^SPDX-License-Identifier:\s*(.+)$/i.exec(first)?.[1]?.trim();
  if (spdx) return spdx;
  if (/MIT License/i.test(body) || /^MIT$/i.test(first)) return "MIT";
  if (/Apache License/i.test(body) && /Version 2\.0/i.test(body)) return "Apache-2.0";
  if (/GNU GENERAL PUBLIC LICENSE/i.test(body) && /Version 3/i.test(body)) return "GPL-3.0";
  if (/BSD 3-Clause/i.test(body) || /Redistribution and use in source and binary forms/i.test(body)) return "BSD-3-Clause";
  if (/ISC License/i.test(body) || /^ISC$/i.test(first)) return "ISC";
  return first.length <= 80 ? first : null;
}

async function productLicence(context) {
  const text = await context?.product?.snapshot?.read?.("LICENSE");
  return licenceFromLicenseFile(text);
}

function factValue(due, what) {
  return due.facts.find((each) => each.what === what)?.value ?? "-";
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function candidateLabel(meta) {
  return `${meta.candidate.name} (${meta.candidate.ecosystem})${meta.role === "chosen" ? " - chosen" : ""}`;
}

function tableCell(value) {
  return String(value ?? "-").replaceAll("|", "\\|");
}

function dueDiligenceRow({ meta, due }) {
  const exists = due.facts.find((each) => each.what === "exists");
  const licence = factValue(due, "licence") === "-" && exists?.value !== "yes" ? exists.value : factValue(due, "licence");
  const open = factValue(due, "open issues");
  const closed = factValue(due, "closed issues");
  const issueCounts = open === "-" || closed === "-" ? "-" : `${open} / ${closed}`;
  const addresses = unique(due.facts.map((each) => each.address)).join(", ") || "-";
  const dates = unique(due.facts.map((each) => each.read)).join(", ") || "-";
  const verdict = due.licence === "compatible" ? "yes" : due.licence;
  return `| ${[
    candidateLabel(meta),
    licence,
    verdict,
    factValue(due, "first release"),
    factValue(due, "latest release"),
    factValue(due, "releases"),
    issueCounts,
    factValue(due, "adoption"),
    addresses,
    dates,
  ].map(tableCell).join(" | ")} |`;
}

function dueDiligenceSection(results, licence) {
  const intro = licence
    ? `Product licence: ${licence}.`
    : "No product LICENSE was found; the product's licence decides what it may reuse.";
  return [
    "## Due diligence",
    "",
    intro,
    "",
    "| Candidate | Licence | Compatible with the product's licence | First release | Latest release | Releases | Open / closed issues | Adoption | Read from | Read on |",
    "|---|---|---|---|---|---|---|---|---|---|",
    ...results.map(dueDiligenceRow),
  ].join("\n");
}

function withoutDueDiligenceSection(text) {
  const lines = String(text).split(/\r?\n/);
  const start = lines.findIndex((line) => line.trim() === "## Due diligence");
  if (start < 0) return String(text);
  let end = lines.length;
  for (let at = start + 1; at < lines.length; at += 1) {
    if (/^##\s+/.test(lines[at])) {
      end = at;
      break;
    }
  }
  return [...lines.slice(0, start), ...lines.slice(end)].join("\n").replace(/\n*$/, "\n");
}

function withDueDiligenceSection(text, section) {
  const without = withoutDueDiligenceSection(text).replace(/\n*$/, "");
  const lines = without.split(/\r?\n/);
  const consequences = lines.findIndex((line) => line.trim() === "## Consequences");
  if (consequences < 0) return `${without}\n\n${section}\n`;
  const before = lines.slice(0, consequences).join("\n").replace(/\n*$/, "");
  const after = lines.slice(consequences).join("\n").replace(/^\n*/, "");
  return `${before}\n\n${section}\n\n${after}\n`;
}

function notFoundFinding(path, meta, due) {
  const exists = due.facts.find((each) => each.what === "exists");
  return finding({ artifact: path, line: meta.line, kind: "warning",
    rule: "DUE DILIGENCE IS FETCHED, NOT RECALLED",
    what: `${meta.candidate.name} was not found at ${exists?.address ?? packageAddress(meta.candidate)}`,
    fix: "check the candidate's name or choose another candidate" });
}

function blockedFinding(path, meta, due) {
  const match = /^([^ ]+) at (.*): (.*)$/.exec(due.blocked ?? "");
  const registry = match?.[1] ?? meta.candidate.ecosystem;
  const address = match?.[2] ?? packageAddress(meta.candidate);
  const reason = match?.[3] ?? due.blocked ?? "unknown";
  return finding({ artifact: path, line: meta.line, kind: "error",
    rule: "A REUSE DECISION RECORDS ITS DUE DILIGENCE",
    what: `the registry ${registry} could not be read at ${address}: ${reason}`,
    fix: "fetch the facts through a participant that can reach the web" });
}

async function dueDiligence(draft, context) {
  if (!draft || !Array.isArray(draft.files)) return { draft, findings: [] };
  const licence = await productLicence(context);
  const findings = [];
  const options = { fetch: context?.fetch, connect: context?.connect, now: context?.now };
  const files = [];

  for (const file of draft.files) {
    if (!ARC_PATH.test(file?.path ?? "") || typeof file?.text !== "string") {
      files.push(file);
      continue;
    }
    const candidates = reuseCandidates(file.text);
    if (!candidates.length) {
      files.push(file);
      continue;
    }

    const results = [];
    for (const meta of candidates) {
      const due = await registryFacts(meta.candidate, licence, options);
      results.push({ meta, due });
      if (due.blocked) findings.push(blockedFinding(file.path, meta, due));
      else if (!due.found) findings.push(notFoundFinding(file.path, meta, due));
    }

    if (results.some(({ due }) => due.blocked)) {
      files.push(file);
    } else {
      files.push({ ...file, text: withDueDiligenceSection(file.text, dueDiligenceSection(results, licence)) });
    }
  }

  return { draft: { ...draft, files }, findings };
}

export const reuseStrategies = { recipes: {}, checks: {}, preconditions: {}, steps: { "due-diligence": dueDiligence }, writers: {} };
