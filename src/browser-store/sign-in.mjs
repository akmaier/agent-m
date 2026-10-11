// The keys Microsoft's sign-in library writes for its token cache in localStorage, under its own names (ARC-053; msal-browser, vendored in
// src/mail-routes/vendor/), found for one connection by the client identifier its `mailbox` entry names (docs/architecture/MOD-browser-store.md, Data:
// `mailbox-sign-in`). Pure over a view of the keys: { names(): string[], get(name): string | null }.
//
// Module: MOD-browser-store
//
// The library's key names, as the vendored 5.24.0 builds them: `msal.<client>.<name>` for what belongs to one client identifier (the active account, the
// request parameters, …); `msal.<n>.token.keys.<client>`, the list of the id, access and refresh token entries of that client, whose names are the
// credential keys; `msal.<n>.account.keys`, the list shared by every client identifier, naming the account entries; and `msal.interaction.status`, which
// holds the client identifier of a sign-in in progress. A credential entry carries `homeAccountId` and `secret`; an account entry carries the
// `homeAccountId` of its person and no credential type. The library-wide keys (`msal.version`, `msal.browser.*`) belong to no connection.

const parse = (text) => { try { return JSON.parse(text); } catch { return null; } };
const object = (value) => (value !== null && typeof value === "object" && !Array.isArray(value) ? value : null);
const escape = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const NONE = { keys: [], credentials: [], accountEntries: [], secrets: [], version: 3 };

// signInOf(view, clientId) -> { keys, credentials, accountEntries, secrets, version } — every key of the library for `clientId` that `view` holds, sorted:
// `credentials` the token entries, `accountEntries` the account entries of their persons, `secrets` the token values, `version` the library's cache
// version in the name of the token list (3 where there is none).
export function signInOf(view, clientId) {
  if (typeof clientId !== "string" || !clientId) return NONE;
  const names = view.names();
  const own = names.filter((name) => name.startsWith(`msal.${clientId}.`));
  const tokenLists = names.filter((name) => new RegExp(`^msal\\.(?:\\d+\\.)?token\\.keys\\.${escape(clientId)}$`).test(name));
  const credentials = tokenLists.flatMap((name) => {
    const lists = object(parse(view.get(name))) ?? {};
    return ["idToken", "accessToken", "refreshToken"].flatMap((kind) => (Array.isArray(lists[kind]) ? lists[kind] : []));
  }).filter((name) => typeof name === "string" && view.get(name) !== null);
  const entries = credentials.map((name) => object(parse(view.get(name))) ?? {});
  const homes = new Set(entries.map((entry) => entry.homeAccountId).filter((home) => typeof home === "string" && home));
  const accountEntries = names.filter((name) => {
    if (credentials.includes(name) || name.startsWith("msal.")) return false;
    const entry = object(parse(view.get(name)));
    return entry !== null && homes.has(entry.homeAccountId) && entry.credentialType === undefined && name.startsWith(`${entry.homeAccountId}-`);
  });
  const interaction = object(parse(view.get("msal.interaction.status")))?.clientId === clientId ? ["msal.interaction.status"] : [];
  const keys = [...new Set([...own, ...tokenLists, ...credentials, ...accountEntries, ...interaction])].sort();
  const version = Number(/^msal\.(\d+)\./.exec(tokenLists[0] ?? "")?.[1] ?? 3);
  return { keys, credentials, accountEntries, secrets: entries.map((entry) => entry.secret).filter((secret) => typeof secret === "string"), version };
}

// The view of a store's localStorage.
export const viewOfStorage = (storage) => ({
  names: () => Array.from({ length: storage.length }, (_, index) => storage.key(index)).filter((name) => typeof name === "string"),
  get: (name) => storage.getItem(name),
});

// The view of the text values of an export's `foreign` object.
export const viewOfObject = (foreign) => ({ names: () => Object.keys(foreign), get: (name) => (typeof foreign[name] === "string" ? foreign[name] : null) });

// removeSignIn(storage, found) -> void — removes the keys found, and the account entries among them from the shared lists `msal.<n>.account.keys`.
export function removeSignIn(storage, found) {
  for (let index = storage.length - 1; index >= 0; index -= 1) {
    const name = storage.key(index);
    if (!/^msal\.(?:\d+\.)?account\.keys$/.test(name ?? "")) continue;
    const list = parse(storage.getItem(name));
    if (Array.isArray(list)) storage.setItem(name, JSON.stringify(list.filter((entry) => !found.accountEntries.includes(entry))));
  }
  for (const key of found.keys) storage.removeItem(key);
}

// addAccounts(storage, found) -> void — names the account entries written in the shared list of the library's version, making the list if there is none.
export function addAccounts(storage, found) {
  if (!found.accountEntries.length) return;
  const name = `msal.${found.version}.account.keys`;
  const list = parse(storage.getItem(name));
  const present = Array.isArray(list) ? list : [];
  storage.setItem(name, JSON.stringify([...present, ...found.accountEntries.filter((entry) => !present.includes(entry))]));
}
