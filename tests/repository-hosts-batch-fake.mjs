// The shared fake of GitHub's batch request (ITM-712): the answer of GitHub's GraphQL API to the query MOD-repository-hosts' readMany and readFileAt send — one aliased field `f<n>:object(expression: "<commit>:<path>")` on a
// Blob for each file — as a plain object, for a test's fake of `fetch` to serve as JSON. One copy for the tests of MOD-repository-hosts and of the modules that read through its host.
//
// Module: MOD-repository-hosts
// Level: unit
//
// GitHub's answer (docs.github.com/en/graphql/reference/objects#blob): `data.repository` has one field for each alias, a Blob — `text`, null for a binary file; `isTruncated`; `isBinary`; `byteSize` — or null where the
// commit holds no such file or the commit is unknown; `data.rateLimit` the cost of the call. A repository the viewer cannot see is `data.repository: null` with an error of the type NOT_FOUND. The commit of an expression is
// what stands before its first colon, the path whatever follows it (a path may hold a colon).

const FIELD = /(\w+):object\(expression:("(?:[^"\\]|\\.)*")\)/g;

/** askedBy(query: string) -> { alias: string, commit: string, path: string }[] — the files a query names, in its order. */
export function askedBy(query) {
  return [...String(query).matchAll(FIELD)].map(([, alias, literal]) => {
    const expression = JSON.parse(literal), at = expression.indexOf(":");
    return { alias, commit: expression.slice(0, at), path: expression.slice(at + 1) };
  });
}

/** askedPaths(query: string) -> string[] — the paths a query names, in its order. */
export const askedPaths = (query) => askedBy(query).map(({ path }) => path);

/** atCommit(commit: string, files: Record<string, string>) -> (commit, path) -> string | undefined — the files of a repository at one commit; it holds nothing at another. */
export const atCommit = (commit, files) => (at, path) => (at === commit && Object.hasOwn(files, path) ? files[path] : undefined);

/**
 * batchAnswer(query: string, { held, special?, known? }) -> object — the answer GitHub gives to `query`. `held(commit, path)` is the text of the file at the commit, `undefined` where it holds none. `special` maps a path,
 * or `<commit>:<path>`, to how GitHub answers that file: "truncated" (a text cut short, isTruncated true), "binary" (text null, isBinary true) or "absent" (null). `known: false` is a repository the viewer cannot see.
 */
export function batchAnswer(query, { held, special = {}, known = true } = {}) {
  if (!known) return { data: { repository: null }, errors: [{ type: "NOT_FOUND", path: ["repository"], message: "Could not resolve to a Repository with the name given." }] };
  const repository = {};
  for (const { alias, commit, path } of askedBy(query)) {
    const text = held(commit, path), how = special[`${commit}:${path}`] ?? special[path];
    if (text === undefined || how === "absent") repository[alias] = null;
    else if (how === "binary") repository[alias] = { text: null, isTruncated: false, isBinary: true, byteSize: 3 };
    else if (how === "truncated") repository[alias] = { text: text.slice(0, 5), isTruncated: true, isBinary: false, byteSize: 600000 };
    else repository[alias] = { text, isTruncated: false, isBinary: false, byteSize: Buffer.byteLength(text) };
  }
  return { data: { rateLimit: { cost: 1, remaining: 4999 }, repository } };
}
