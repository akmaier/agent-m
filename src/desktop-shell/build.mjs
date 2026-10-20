// Module: MOD-desktop-shell
// What the build places among the app's resources, read at start: `build.json` and the publisher's `update-key.pem`.
import { readFileSync } from "node:fs";
import { join } from "node:path";

const text = (value) => typeof value === "string" && value ? value : null;
const unusable = (file, reason, cause) => new Error(`The Bridge cannot start: ${file} ${reason}.`, { cause });

// readBuild(resources: string | undefined) -> { instance, appId, origin, version, commit, updateKey }
// `resources` is the app's resources folder. Throws an Error that names build.json when the file is missing, unreadable, not
// JSON or without the instance (owner/repository) and the origin; names update-key.pem when that file exists but cannot be read.
// `updateKey` is the text of update-key.pem, or null when the file is not there (the app then offers no update).
export function readBuild(resources) {
  const file = join(resources ?? "", "build.json");
  if (!resources) throw unusable("build.json", "was not found: the app has no resources folder");
  let build;
  try { build = JSON.parse(readFileSync(file, "utf8")); }
  catch (cause) { throw unusable(file, `cannot be read (${cause.message})`, cause); }
  const instance = text(build?.instance), origin = text(build?.origin);
  if (!/^[^/\s]+\/[^/\s]+$/.test(instance ?? "")) throw unusable(file, "names no instance of the form owner/repository");
  if (!origin) throw unusable(file, "names no origin");
  return { instance, appId: text(build.appId), origin, version: text(build.version), commit: text(build.commit), updateKey: readUpdateKey(resources) };
}

function readUpdateKey(resources) {
  const file = join(resources, "update-key.pem");
  try { return readFileSync(file, "utf8"); }
  catch (cause) {
    if (cause.code === "ENOENT") return null;
    throw unusable(file, `cannot be read (${cause.message})`, cause);
  }
}
