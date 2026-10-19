// MOD-prompt-bar, places.mjs — the places of the restricted sources that a message's job is given (docs/architecture/MOD-prompt-bar.md: Parts; MOD-job-runner.md: Interfaces, JobContext.places).
//
// Module: MOD-prompt-bar
//
// `places.sources` gives, for every restricted source, the places its licence allows; `places.contents` the paths of the product that hold a restricted source's content, which the job's tool
// read-file refuses to a drafter at another place. Where the texts leave a reading open, this file states the one it takes:
//   - The restricted sources are those of the instance's register, `docs/sources/SRC-*.md` of the instance, whether or not the product links them: the job's tools read any path of the product, so
//     a restricted source's content is kept from a place its licence does not allow wherever the product holds it.
//   - A source's content lies in the folder `docs/sources/<its id>/` of the product (MOD-source-register, Data: "A version's content lies in docs/sources/SRC-<slug>/<version>/").
// It reads the instance's snapshot and writes nothing.

import { readDocument } from "../documents/index.mjs";
import { permittedPlaces, registerPaths, sourceSchemas } from "../source-register/index.mjs";

/**
 * restrictedPlaces(snapshot: Snapshot) -> Promise<{ sources: Record<string, string[]>, contents: { source: string, paths: string[] }[] }> — for each source of the register at that snapshot
 * whose content may not be republished (an unknown licence counts as restricted), the places it allows, and the folder of the product that holds its content; in the order of the register's paths.
 * Empty for an instance without sources.
 */
export async function restrictedPlaces(snapshot) {
  const { entry } = sourceSchemas();
  const sources = {}, contents = [];
  for (const path of registerPaths(snapshot.paths)) {
    const allowed = permittedPlaces(readDocument(entry, path, (await snapshot.read(path)) ?? ""));
    if (allowed === "any") continue;
    const id = path.slice(path.lastIndexOf("/") + 1, -".md".length);
    sources[id] = allowed;
    contents.push({ source: id, paths: [`docs/sources/${id}`] });
  }
  return { sources, contents };
}
