// The Bridge's release and its publication (docs/architecture/MOD-bridge-build.md, Interfaces: publishRelease): after the three platforms,
// checks that each platform's build is there and that every checksum and detached signature still holds; reads again the due diligence of
// every package the app carries and publishes nothing when a licence is no longer known to be compatible with Agent M's; writes SHA256SUMS
// and its signature; publishes every file with its signature as the release `Agent M V` of the tag through the host's publishRelease; then
// compares the SHA-256 the server reports for each file with its own.
//
// Module: MOD-bridge-build

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { registryFacts } from "../reuse-facts/index.mjs";
import { checksumsText, sha256Hex, signBytes, signatureHolds } from "./sign.mjs";

const PLATFORMS = ["macos", "windows", "linux"];
const KEY = "BRIDGE_UPDATE_KEY";
const MANIFEST = JSON.parse(readFileSync(new URL("./package.json", import.meta.url), "utf8"));
const LOCK = JSON.parse(readFileSync(new URL("./package-lock.json", import.meta.url), "utf8")).packages;
// The packages the app carries: "the packages above that the app needs at run time" — the manifest's run-time packages, and electron, the
// runtime the app ships, which stands under devDependencies because electron-builder requires it there. electron-builder builds, it is not carried.
const CARRIED = [...new Set(["electron", ...Object.keys(MANIFEST.dependencies ?? {})])];

// One failure, named by `name`, with its fields (MOD-bridge-build, Interfaces): BuildMissing { platform } · SignatureInvalid { file } ·
// LicenceNotCompatible { package } · ChecksumMismatch { file } · SecretMissing { secret }.
export class ReleaseError extends Error {
  constructor(name, fields, message) {
    super(message);
    this.name = name;
    Object.assign(this, fields);
  }
}

const buildMissing = (platform, why) => new ReleaseError("BuildMissing", { platform }, `the ${platform} build is missing: ${why}`);

function readBuild(folder) {
  try {
    return JSON.parse(readFileSync(join(folder, "platform-build.json"), "utf8"));
  } catch {
    return null;
  }
}

// The files of the three platforms' builds, read from their folders: every file's bytes, checked against its recorded checksum and size and
// against its detached signature. A changed byte fails both; the signature is the check an attacker who rewrites the checksum meets.
function checkedFiles(folders, privatePem) {
  const builds = new Map();
  for (const folder of folders) {
    const build = readBuild(folder);
    if (build && PLATFORMS.includes(build.platform) && !builds.has(build.platform)) builds.set(build.platform, { build, folder });
  }
  const files = [];
  for (const platform of PLATFORMS) {
    const found = builds.get(platform);
    if (!found) throw buildMissing(platform, "no folder holds its platform-build.json");
    for (const entry of found.build.files ?? []) {
      let bytes;
      try {
        bytes = readFileSync(join(found.folder, entry.name));
      } catch {
        throw buildMissing(platform, `${entry.name} is not in its folder`);
      }
      if (sha256Hex(bytes) !== entry.sha256 || bytes.length !== entry.size || !signatureHolds(privatePem, bytes, entry.signature)) {
        throw new ReleaseError("SignatureInvalid", { file: entry.name }, `${entry.name}: its checksum or detached signature does not hold`);
      }
      files.push({ name: entry.name, bytes, sha256: entry.sha256, signature: entry.signature });
    }
  }
  return { files, publishers: publishersOf(builds) };
}

// The due diligence of every package the app carries at run time, read again, against Agent M's licence.
async function dueDiligence() {
  const read = [];
  for (const name of CARRIED) {
    const facts = await registryFacts({ name, ecosystem: "npm", repository: null }, MANIFEST.license);
    if (facts.licence === "not known to be compatible") {
      throw new ReleaseError("LicenceNotCompatible", { package: name }, `${name}: its licence is not known to be compatible with ${MANIFEST.license}`);
    }
    read.push(facts);
  }
  return read;
}

const SYSTEMS = { macos: "macOS", windows: "Windows" };

// The publisher each signed platform's build recorded: macOS's and Windows's, a name; a build that records none is missing (Linux has none to record).
function publishersOf(builds) {
  return Object.entries(SYSTEMS).map(([platform, system]) => {
    const name = builds.get(platform)?.build.publisher;
    if (typeof name !== "string" || !name.trim()) throw buildMissing(platform, "its build records no publisher");
    return `Publisher (${system}): ${name.trim()}`;
  });
}

function notesOf(version, commit, facts, publishers) {
  const lines = facts.map((each) => {
    const licence = each.facts.find((fact) => fact.what === "licence")?.value ?? "none read";
    return `- ${each.candidate.name} ${LOCK[`node_modules/${each.candidate.name}`]?.version ?? ""} (${each.candidate.ecosystem}): ${licence}, ${each.licence} with ${MANIFEST.license}, read ${each.facts[0]?.read ?? "-"}`;
  });
  return `Agent M Bridge ${version}\n\nVersion: ${version}\nCommit: ${commit}\n\n${publishers.join("\n")}\n\nDue diligence read before this release:\n${lines.join("\n")}\n`;
}

/**
 * publishRelease(host, { tag, folders }) -> Promise<{ published: string[], facts: DueDiligence[] }>
 * Errors: BuildMissing { platform }, SignatureInvalid { file }, LicenceNotCompatible { package } — nothing is published then —,
 * ChecksumMismatch { file }, SecretMissing { secret }, and what the host names.
 */
export async function publishRelease(host, { tag, folders }) {
  const privatePem = globalThis.process?.env?.[KEY];
  if (!privatePem) throw new ReleaseError("SecretMissing", { secret: KEY }, `${KEY} is not set in the environment`);
  const version = tag.replace(/^v/, "");
  const { files: built, publishers } = checkedFiles(folders, privatePem);
  const facts = await dueDiligence();
  const commit = (await host.listTags(tag)).find((each) => each.name === tag)?.commit;
  if (!commit) throw new ReleaseError("NotFound", { what: tag }, `the tag ${tag} stands on no commit`);

  const sums = Buffer.from(checksumsText(built));
  const uploads = [...built, { name: "SHA256SUMS", bytes: sums }];
  const files = uploads.flatMap((file) => [
    { name: file.name, bytes: file.bytes },
    { name: `${file.name}.sig`, bytes: Buffer.from(file.signature ?? signBytes(privatePem, file.bytes)) },
  ]).map((file) => ({ ...file, contentType: "application/octet-stream" }));

  const release = await host.publishRelease(tag, { name: `Agent M ${version}`, notes: notesOf(version, commit, facts, publishers), files });
  const reported = new Map(release.assets.map((asset) => [asset.name, asset.sha256]));
  for (const file of files) {
    if (reported.get(file.name) !== sha256Hex(file.bytes)) {
      throw new ReleaseError("ChecksumMismatch", { file: file.name }, `${file.name}: the server reports another SHA-256 than its own`);
    }
  }
  return { published: files.map((file) => file.name), facts };
}
