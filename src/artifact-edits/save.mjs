// Saving one file a person edited — A SAVE IS REFUSED WHEN THE TEXT CHANGED MEANWHILE · A PERSON'S OWN INPUT IS COMMITTED
// DIRECTLY · THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK (UC-002 step 9). Part of MOD-artifact-edits (docs/architecture/
// MOD-artifact-edits.md): the file written in one commit on the default branch, through the host the caller connected with the
// person's token, on the head that was read, only while that head holds the blob the file was opened on; otherwise nothing is
// written and the newer text is returned, for the caller to keep the edit beside it (A REFUSED SAVE KEEPS THE EDIT). A refused
// read or write is the host's failure, passed on as the host names it; nothing is written then.
//
// Module: MOD-artifact-edits
//
// The model is saveReviewedFile in docs/assets/dashboard/writes.mjs, whose write path checks the opened blob (commitFiles in
// docs/assets/git-host.mjs); both stay as they are. Of the refusals the module file names, ITM-219 builds the one of a file that
// changed meanwhile; a changed identifier and a group file whose items stand in more than one place are not refused yet.

import { blobSha } from "../text-tools/index.mjs";

// saveFile(host: Host, edit: { path: string, text: string, openedBlob: string | null, openedId: string | null }) ->
// Promise<{ commit: string, blob: string } | { refused: "changed meanwhile", current: string | null, currentBlob: string | null }>
// — reads the default branch that the host's repositoryInfo names. While the file's blob there is still openedBlob — null: the
// file did not exist when it was opened, and still does not —, it commits the text in one commit on the head it read, and
// returns that commit as the host's commitFiles names it, with the blob of the text. Otherwise it writes nothing and returns the
// text and the blob the branch holds now, each null where it holds no such file. The commit is made with the token the host was
// connected with, so it is under the person's account; its message names no one. Crosses the network, through the host. Fails
// with the host's failures, unchanged: Moved (the branch moved after it was read), SecretRefused, TokenRefused,
// PermissionMissing, RateLimited, Unreachable — nothing is written then.
export async function saveFile(host, { path, text, openedBlob }) {
  const { defaultBranch } = await host.repositoryInfo();
  const head = await host.readSnapshot(defaultBranch);
  const currentBlob = head.blob(path);
  if (currentBlob !== openedBlob) return { refused: "changed meanwhile", current: await head.read(path), currentBlob };
  const { commit } = await host.commitFiles({ branch: defaultBranch, expectedHead: head.commit, files: [{ path, text }],
    message: `edit ${path.split("/").pop()} (Agent M dashboard)` });
  return { commit, blob: await blobSha(text) };
}
