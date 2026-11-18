// seatbelt.mjs — macOS: the profile `/usr/bin/sandbox-exec` puts around an agent (MOD-agent-enclosure, Data; ARC-054).
//
// Module: MOD-agent-enclosure
//
// A later rule of a profile overrides an earlier one for the same operation (docs/measurements/2026-10-27_what-an-agent-on-a-bridge-reaches.md): the
// profile allows by default, denies every write but temporary files and /dev, then denies reading and writing the person's home, allows reading the
// metadata of each folder of the home on the way to an agent's folder — so that a program that resolves its path, as Claude Code does for its settings,
// can stat them, though it cannot list them —, allows reading and writing the agent's folders, and only then hides the places that hold credentials, so that a hidden place inside an allowed folder stays hidden. The
// paths are matched as the system resolves them; the caller resolves them first.

// A string of the profile language, with its quote and backslash escaped.
const quoted = (text) => `"${String(text).replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
const subpaths = (paths) => paths.map((path) => `  (subpath ${quoted(path)})`).join("\n");
const literals = (paths) => paths.map((path) => `  (literal ${quoted(path)})`).join("\n");

// The folders from the person's home down to each folder's parent, each once: the path to a folder of the home; none for a folder outside it.
function ancestors(personHome, folders) {
  const found = new Set();
  for (const folder of folders) {
    if (!folder.startsWith(`${personHome}/`)) continue;
    for (let at = folder.slice(0, folder.lastIndexOf("/")); at.length >= personHome.length; at = at.slice(0, at.lastIndexOf("/"))) found.add(at);
  }
  return [...found];
}

// The services through which a process of the user reaches the keychain.
const KEYCHAIN = ["com.apple.SecurityServer", "com.apple.securityd.xpc", "com.apple.secd"];
// Where a process writes temporary files: the shared folder and the user's own below /private/var/folders.
const TEMPORARY = ["/private/tmp", "/private/var/folders", "/dev"];

/**
 * seatbeltProfile({ personHome, folders, hidden }) -> string — the profile: writing only temporary files, /dev and below `folders`; neither reading nor
 * writing the person's home `personHome`, but the metadata of the folders on the way to each of `folders`, and below `folders` both; neither reading nor writing below `hidden`; no lookup of the keychain's services.
 * The SSH agent's socket stays open. Pure.
 */
export function seatbeltProfile({ personHome, folders, hidden }) {
  return [
    "(version 1)",
    "(allow default)",
    "(deny file-write*)",
    `(allow file-write*\n${subpaths(TEMPORARY)})`,
    `(deny file-read* file-write*\n${subpaths([personHome])})`,
    ...(ancestors(personHome, folders).length ? [`(allow file-read-metadata\n${literals(ancestors(personHome, folders))})`] : []),
    `(allow file-read* file-write*\n${subpaths(folders)})`,
    ...(hidden.length ? [`(deny file-read* file-write*\n${subpaths(hidden)})`] : []),
    `(deny mach-lookup${KEYCHAIN.map((name) => ` (global-name ${quoted(name)})`).join("")})`,
    "",
  ].join("\n");
}
