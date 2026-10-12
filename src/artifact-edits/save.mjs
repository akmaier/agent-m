// Saving the file or files a person edited — A SAVE IS REFUSED WHEN THE TEXT CHANGED MEANWHILE · A PERSON'S OWN INPUT IS COMMITTED
// DIRECTLY · THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK (UC-002 step 9). Part of MOD-artifact-edits (docs/architecture/
// MOD-artifact-edits.md): the file written in one commit on the default branch, through the host the caller connected with the
// person's token, on the head that was read, only while that head holds the blob the file was opened on; otherwise nothing is
// written and the newer text is returned, for the caller to keep the edit beside it (A REFUSED SAVE KEEPS THE EDIT). A refused
// read or write is the host's failure, passed on as the host names it; nothing is written then.
//
// Module: MOD-artifact-edits
//
// The model is saveReviewedFile in docs/assets/dashboard/writes.mjs, whose write path checks the opened blob (commitFiles in
// docs/assets/git-host.mjs) and whose kernel identifierKept refuses a changed identifier; both stay as they are. Of the refusals
// the module file names, ITM-219 builds the one of a file that changed meanwhile and ITM-335 that of a changed identifier; a
// group file whose items stand in more than one place is not refused yet. ITM-395 adds several edits in one commit, a job's
// trailers at the end of its message, and keptIdentifier.

import { blobSha } from "../text-tools/index.mjs";
import { artifactSchemaOf, readDocument } from "../documents/index.mjs";

// The identifier a text declares, read by the schema of its kind: the `id` of its front matter, null where it has none — and
// for a path of no schema, whose identifier this module cannot read.
export function declaredId(path, text) {
  const schema = artifactSchemaOf(path);
  const id = schema ? readDocument(schema, path, text).fields[schema.identifier.field] : undefined;
  return typeof id === "string" && id ? id : null;
}

// saveFile(host: Host, edit | edits: { path: string, text: string, openedBlob: string | null, openedId: string | null,
// trailers?: string[] }) -> Promise<{ commit: string, blob: string | string[] } | { refused: "changed meanwhile", current: string |
// null, currentBlob: string | null } | { refused: "identifier changed", openedId: string, nowId: string | null }>
// — one edit, or several: the files one instruction by prompt changed. In the order of the edits, for a file opened with an
// identifier (openedId; a caller that gives none, or null, is not asked) whose text now declares another, or none, it writes
// nothing and returns both identifiers (AN EDITED FILE KEEPS ITS IDENTIFIER); for a file whose blob on the default branch that
// the host's repositoryInfo names is no longer openedBlob — null: the file did not exist when it was opened, and still does not —
// it writes nothing and returns the text and the blob the branch holds now, each null where it holds no such file. The first
// refusal is the one returned, and nothing is written for any of the files. Otherwise it commits all the texts in one commit on
// the head it read, and returns that commit as the host's commitFiles names it, with the blob of the text — a list of blobs, in
// the order of the edits, when the edits came as a list. The message names the files and ends, after a blank line, with the
// trailers of the edits, each line once (a job's provenance lines; none for a person's own edit); the files hold none. The commit
// is made with the token the host was connected with, so it is under the person's account. Crosses the network, through the host.
// Fails with the host's failures, unchanged: Moved (the branch moved after it was read), SecretRefused, TokenRefused,
// PermissionMissing, RateLimited, Unreachable — nothing is written then.
export async function saveFile(host, given) {
  const several = Array.isArray(given);
  const edits = several ? given : [given];
  let branch = null, head = null;
  for (const { path, text, openedBlob, openedId } of edits) {
    if (openedId) {
      const nowId = declaredId(path, text);
      if (nowId !== openedId) return { refused: "identifier changed", openedId, nowId };
    }
    if (head === null) {
      branch = (await host.repositoryInfo()).defaultBranch;
      head = await host.readSnapshot(branch);
    }
    const currentBlob = head.blob(path);
    if (currentBlob !== openedBlob) return { refused: "changed meanwhile", current: await head.read(path), currentBlob };
  }
  const trailers = [...new Set(edits.flatMap((e) => e.trailers ?? []))];
  const names = edits.map((e) => e.path.split("/").pop()).join(", ");
  const { commit } = await host.commitFiles({ branch, expectedHead: head.commit,
    files: edits.map(({ path, text }) => ({ path, text })),
    message: `edit ${names} (Agent M dashboard)${trailers.length ? `\n\n${trailers.join("\n")}` : ""}` });
  const blobs = await Promise.all(edits.map((e) => blobSha(e.text)));
  return { commit, blob: several ? blobs : blobs[0] };
}

// keptIdentifier(text: string, openedId: string) -> string — the text with the `id` of its front matter set back to openedId,
// every other byte unchanged (a line `id:` of the body is no id); a text whose id is openedId, or that has no front matter or no
// id line, comes back as it is. A drafted change whose loop left another identifier opens in the editor with the one it was
// opened with (UC-019 7a).
export function keptIdentifier(text, openedId) {
  const front = /^---\r?\n[\s\S]*?\r?\n---(?=\r?\n|$)/.exec(text);
  if (!front) return text;
  const fixed = front[0].replace(/^(id:[ \t]*)([^\r\n]*)/m, (line, _key, value) => (value.trim() === openedId ? line : `id: ${openedId}`));
  return fixed + text.slice(front[0].length);
}
