// GitHub's pages for an edit without a token — WITHOUT A TOKEN, GITHUB'S WEB INTERFACE IS THE FALLBACK · NO TEXT TRAVELS IN A
// URL · A GITLAB PRODUCT IS WRITTEN WITH A TOKEN (UC-018 4a, 4b; UC-008 3b). Part of MOD-artifact-edits (docs/architecture/
// MOD-artifact-edits.md): one page of GitHub's web interface for each file, the editor for a file that exists and the new-file
// page for one that does not, each link carrying the path and nothing else, and the text returned beside it for the clipboard.
//
// Module: MOD-artifact-edits
//
// The model is editUrl and newFileUrl in docs/assets/git-host.mjs and the dashboard's editPanel in
// docs/assets/dashboard/review-views.mjs, which stay as they are. The pages are those of MOD-repository-hosts' webLinks
// (ITM-310), built on `main`.

import { connect } from "../repository-hosts/index.mjs";

// fallbackEditLinks(files: Array<{ path: string, text: string, existing: boolean }>, snapshot: Snapshot) ->
// Array<{ url: string, path: string, text: string, differs: boolean }> | { refused: "gitlab" }
// — for a product on GitHub, one page per file, in the order of the files: the editor of the file where it existed when the
// edit started, the new-file page where it did not, the link carrying the path only, never the text, which is returned as
// given. A product on a GitLab server is refused: it has no fallback. `differs` says that the default branch, as the snapshot
// holds it, no longer has the file as the edit started: the file is there where it did not exist, or not there where it did.
// No request is made.
export function fallbackEditLinks(files, snapshot) {
  const { repository } = snapshot;
  if (repository.server === "gitlab") return { refused: "gitlab" };
  const pages = connect(repository).webLinks();
  const held = new Set(snapshot.paths);
  return files.map(({ path, text, existing }) => ({
    url: existing ? pages.editFile(path) : pages.newFile(path, ""),
    path,
    text,
    differs: held.has(path) !== existing,
  }));
}
