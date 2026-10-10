// Where a version's files lie, and reading them with their hashes checked (MOD-source-register, Parts: content.mjs).
//
// Module: MOD-source-register
//
// A version's content lies in `docs/sources/SRC-<slug>/<version>/` of the repository that holds it — the instance when the
// licence permits republishing, the named content repository otherwise (Data). readContent asks its caller for that
// repository's host by the version's source: the caller holds the register entry, and with it where its content lies.
// SourceVersion is the type index.mjs states; Document and Host are MOD-documents' and MOD-repository-hosts' types.

import { sha256 } from "../text-tools/index.mjs";

const encoder = new TextEncoder();

// A failure of its own, by name, with the fields MOD-source-register's Interfaces give it.
export const failure = (name, message, fields) => Object.assign(new Error(message), { name, ...fields });

export const unquoted = (text) => String(text ?? "").trim().replace(/^`|`$/g, "");

// The files of a version and their SHA-256, as the table under `### Files of <version>` in the entry's `## Versions` lists
// them — the version written with or without backticks.
function filesOf(versions, version) {
  const lines = versions.text.split("\n");
  const at = lines.findIndex((line) => line.trim() === `### Files of ${version}` || line.trim() === `### Files of \`${version}\``);
  if (at < 0) return [];
  const files = [];
  for (const line of lines.slice(at + 1)) {
    if (/^#{1,3} /.test(line)) break;
    const row = /^\| `([^`]+)` \| `([0-9a-f]{64})` \|/.exec(line.trim());
    if (row) files.push({ name: row[1], sha256: row[2], stored: true });
  }
  return files;
}

// A version's hash: the SHA-256 of the lines `<SHA-256 of the file>  <file name>`, one per file, sorted by name, each ending
// with a line break (Data).
async function versionHash(files) {
  const lines = [...files].sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))
    .map((file) => `${file.sha256}  ${file.name}\n`);
  return sha256(lines.join(""));
}

/**
 * versionRecord(entry: Document, version: string, hash: string) -> SourceVersion | null — the version of a register entry
 * that its `## Versions` names `version`, with its files and their SHA-256 from the table under `### Files of <version>`,
 * and `hash` as the version's hash; null when the entry records no such version.
 * @param {Document} entry
 */
export function versionRecord(entry, version, hash) {
  const versions = entry.sections.find((section) => section.heading === "## Versions");
  const row = versions?.rows?.find((each) => unquoted(each.cells.Version) === version);
  if (!row) return null;
  return { source: entry.id, version, date: String(row.cells.Date ?? ""), retrieved: null, repositoryVersion: null,
    commit: null, files: filesOf(versions, version), hash };
}

/**
 * newestVersion(entry: Document) -> Promise<SourceVersion | null> — the newest version of a register entry: the last row of
 * its `## Versions`, with its files and their SHA-256, and its version's hash computed from them; null when the entry
 * records no version.
 * @param {Document} entry
 */
export async function newestVersion(entry) {
  const versions = entry.sections.find((section) => section.heading === "## Versions");
  const row = versions?.rows?.at(-1);
  if (!row) return null;
  const version = unquoted(row.cells.Version);
  return versionRecord(entry, version, await versionHash(filesOf(versions, version)));
}

/**
 * readContent(version: SourceVersion, open: (repository: string) => Promise<Host>) -> Promise<{ name: string, bytes:
 * Uint8Array }[]> — reads every stored file of the version from `docs/sources/<source>/<version>/` of the repository that
 * holds it, whose host `open` gives for the version's source, at its default branch, and checks each against its recorded
 * SHA-256. Throws HashMismatch { file, expected, actual } for a file whose bytes changed, and ContentUnreadable
 * { repository, reason } for a file the holder does not hold; and what the host throws.
 */
export async function readContent(version, open) {
  const host = await open(version.source);
  const snapshot = await host.readSnapshot((await host.repositoryInfo()).defaultBranch);
  const read = [];
  for (const file of version.files.filter((each) => each.stored)) {
    const path = `docs/sources/${version.source}/${version.version}/${file.name}`;
    const text = await snapshot.read(path);
    if (text === null) {
      throw failure("ContentUnreadable", `${snapshot.repository.path} does not hold ${path}`,
        { repository: snapshot.repository.path, reason: `it does not hold ${path}` });
    }
    const actual = await sha256(text);
    if (actual !== file.sha256) {
      throw failure("HashMismatch", `${path} has the SHA-256 ${actual}, not the ${file.sha256} its version records`,
        { file: file.name, expected: file.sha256, actual });
    }
    read.push({ name: file.name, bytes: encoder.encode(text) });
  }
  return read;
}
