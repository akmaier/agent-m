// Legacy keys — the entries an earlier dashboard kept in this browser under the prefix `agent-m.`, moved once into the
// instance's keys of the catalogue (MOD-browser-store, Interfaces: openStore), so that a person whose browser still holds them
// keeps their token, their products, their jump host and their remote sessions.
//
// Module: MOD-browser-store
//
// An entry is removed only once what it holds stands in the instance's keys, read back; an entry that cannot be moved — a
// jump host that names key files, a remote session that names the Bridge's port, a test of an unknown form — stays where it
// is. A value the instance already keeps is never replaced.

import { getRaw, setRaw } from "./store.mjs";

const OLD = "agent-m.";
const TOKEN = `${OLD}github-token`, TOKEN_EXPIRES = `${OLD}github-token-expires`, TOKEN_TESTED = `${OLD}github-token-tested`;
const PRODUCTS = `${OLD}products`, GITLAB_TOKENS = `${OLD}gitlab-tokens`, GITHUB_PRODUCT_TOKENS = `${OLD}github-product-tokens`;
const JUMP_HOST = `${OLD}jump-host`, REMOTE_SESSIONS = `${OLD}remote-sessions`;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

const day = () => new Date().toISOString().slice(0, 10);
const json = (raw, fallback) => { try { return raw === null || raw === undefined ? fallback : JSON.parse(raw); } catch { return fallback; } };
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

// The instance's setting under `key`, as readSetting reads it, and its write, as writeSetting writes a key of the catalogue.
const read = (store, key) => json(getRaw(store, key), null);
const write = (store, key, value) => setRaw(store, key, JSON.stringify(value));

// The old entries, as the earlier dashboard read them.
function oldOf(storage) {
  const get = (key) => { try { return storage.getItem(key); } catch { return null; } };
  // A token's last test: { ok: "YYYY-MM-DD" }, { refused: true }, or null.
  const tokenTest = (v) => (!v || typeof v !== "object" ? null : v.refused === true ? { refused: true }
    : typeof v.ok === "string" && DATE.test(v.ok) ? { ok: v.ok } : null);
  // { address: { token, expires, tested? } } — a map of product tokens, each with a token.
  const tokenMap = (raw) => {
    const map = json(raw, {});
    if (!map || typeof map !== "object" || Array.isArray(map)) return {};
    return Object.fromEntries(Object.entries(map).filter(([, v]) => v && typeof v.token === "string" && v.token).map(([address, v]) => {
      const tested = tokenTest(v.tested);
      return [address, { token: v.token, expires: typeof v.expires === "string" && v.expires ? v.expires : null, ...(tested ? { tested } : {}) }];
    }));
  };
  const token = get(TOKEN) || null;
  const products = json(get(PRODUCTS), []);
  const jump = json(get(JUMP_HOST), null);
  const sessions = json(get(REMOTE_SESSIONS), []);
  return {
    token,
    expires: get(TOKEN_EXPIRES) || null,
    tested: token ? tokenTest(json(get(TOKEN_TESTED), null)) : null,
    products: Array.isArray(products) ? products.filter((address) => typeof address === "string") : [],
    github: tokenMap(get(GITHUB_PRODUCT_TOKENS)),
    gitlab: tokenMap(get(GITLAB_TOKENS)),
    jump: jump && typeof jump === "object" && !Array.isArray(jump) ? jump : null,
    sessions: (Array.isArray(sessions) ? sessions : []).filter((s) => s && typeof s.name === "string" && Number.isInteger(s.port)),
  };
}

// The instance's key of a product's own token: `github-token:<owner>/<repository>` or `gitlab-token:<server>/<project>`.
function tokenKey(address) {
  const url = new URL(address);
  const path = url.pathname.replace(/^\//, "");
  return url.hostname === "github.com" ? `github-token:${path}` : `gitlab-token:${url.hostname}/${path}`;
}

// An old test as the instance's last-test value: { converted, value } — converted false for a test of no known form.
function lastTest(test, kind) {
  if (!test) return { converted: true, value: null };
  const at = kind === "session" ? test.up : test.ok;
  if (typeof at === "string") return { converted: true, value: { at, outcome: "working" } };
  if (kind === "token" && test.refused === true) return { converted: true, value: { at: "unknown", outcome: "refused" } };
  return { converted: false, value: null };
}

// Copies one setting and its last test into the instance's keys, unless the instance keeps one already; whether the instance
// now holds what was copied.
function copy(store, key, value, matches, test) {
  if (read(store, key) === null) write(store, key, value);
  if (!matches(read(store, key))) return false;
  if (!test.converted) return false;
  if (test.value) {
    const testKey = `last-test:${key}`;
    if (read(store, testKey) === null) write(store, testKey, test.value);
    if (!same(read(store, testKey), test.value)) return false;
  }
  return true;
}

function copyToken(store, key, token, expires, name, tested) {
  if (typeof token !== "string") return false;
  return copy(store, key, { value: token, name, expires: expires ?? null, stored: day() },
    (kept) => kept?.value === token && (kept.expires ?? null) === (expires ?? null), lastTest(tested, "token"));
}

function copyProducts(store, products) {
  if (!products.length) return true;
  const kept = read(store, "products");
  const next = [...new Set([...(Array.isArray(kept) ? kept : []), ...products])];
  if (kept === null || next.length !== kept.length) write(store, "products", next);
  const stored = read(store, "products");
  return Array.isArray(stored) && products.every((address) => stored.includes(address));
}

// moveLegacyKeys(store, instance) -> void — moves the old entries of this browser into the instance's keys: the GitHub token
// with its expiry and last test (`github-token`), each product's own token (`github-token:…`, `gitlab-token:…`), the products,
// the jump host without key files (`jump-host`) and each remote session without a Bridge port (`remote-session:<name>`), and
// removes each old entry whose content now stands there.
export function moveLegacyKeys(store, instance) {
  const storage = store.storage;
  const remove = (key) => { try { storage.removeItem(key); } catch { /* it stays where it is */ } };
  const setOld = (key, value, empty) => { try { if (empty) storage.removeItem(key); else storage.setItem(key, JSON.stringify(value)); } catch { /* as before */ } };
  const old = oldOf(storage);

  if (old.token && copyToken(store, "github-token", old.token, old.expires, `Agent M · ${instance}`, old.tested)) {
    [TOKEN, TOKEN_EXPIRES, TOKEN_TESTED].forEach(remove);
  }

  const sources = [...Object.entries(old.github).map(([address, value]) => ({ address, value, map: GITHUB_PRODUCT_TOKENS })),
    ...Object.entries(old.gitlab).map(([address, value]) => ({ address, value, map: GITLAB_TOKENS }))];
  const converted = new Set(sources.filter(({ address, value }) => copyToken(store, tokenKey(address), value.token, value.expires,
    "Agent M", value.tested)).map(({ address }) => address));
  const maps = { [GITHUB_PRODUCT_TOKENS]: { ...old.github }, [GITLAB_TOKENS]: { ...old.gitlab } };
  let products = [...old.products];
  if (copyProducts(store, [...new Set([...old.products, ...converted])])) {
    const before = products.length;
    for (const address of old.products) {
      const source = sources.find((each) => each.address === address);
      if (!source || converted.has(address)) {
        products = products.filter((each) => each !== address);
        for (const map of Object.values(maps)) delete map[address];
      }
    }
    for (const source of sources) if (!products.includes(source.address) && converted.has(source.address)) delete maps[source.map][source.address];
    if (products.length !== before) setOld(PRODUCTS, products, false);
    for (const [key, map] of Object.entries(maps)) {
      const before = key === GITHUB_PRODUCT_TOKENS ? old.github : old.gitlab;
      if (Object.keys(before).length !== Object.keys(map).length) setOld(key, map, Object.keys(map).length === 0);
    }
  }

  const jump = old.jump;
  if (jump && typeof jump.host === "string" && typeof jump.user === "string" && Number.isInteger(jump.portFrom)
    && Number.isInteger(jump.portTo) && !jump.reverseKey && !jump.forwardKey && read(store, "jump-host") === null) {
    const value = { hostname: jump.host, user: jump.user, sshPort: 22, portRange: [jump.portFrom, jump.portTo] };
    write(store, "jump-host", value);
    if (same(read(store, "jump-host"), value)) remove(JUMP_HOST);
  }

  let sessions = old.sessions;
  for (const session of old.sessions) {
    if (typeof session.token !== "string" || session.bridgePort !== undefined) continue;
    const moved = copy(store, `remote-session:${session.name}`, { port: session.port, token: session.token },
      (kept) => same(kept, { port: session.port, token: session.token }), lastTest(session.tested, "session"));
    if (moved) {
      sessions = sessions.filter((each) => each.name !== session.name);
      setOld(REMOTE_SESSIONS, sessions, sessions.length === 0);
    }
  }
}
