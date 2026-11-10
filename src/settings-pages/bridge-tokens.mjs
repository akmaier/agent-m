// bridge-tokens.mjs — the repository tokens handed to the Bridges this browser keeps (MOD-settings-pages, Interfaces: The repository tokens a Bridge holds;
// UC-044 step 4). A token's write or clear hands the tokens; a Bridge's write does so only as a pairing (pairedNow), so that saving the HTTPS address or
// naming a Bridge through the jump host still contacts nothing.
//
// Module: MOD-settings-pages
//
// A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT: a token leaves the browser in the body of a request to a Bridge this browser is paired with, with that Bridge's
// pairing token, and the Bridge sends it on only to the token's server. Each write or clear of a repository token, or of a Bridge, hands every Bridge the whole
// set, so that a Bridge forgets a token the browser no longer keeps (A CLEAR IS A REAL CLEAR); a pairing hands them too, where the browser keeps any.

import { bridgeAt, handTokens, settingsOf } from "../bridge-client/index.mjs";
import { listSettings, readSetting, watchSettings } from "../browser-store/index.mjs";
import { notice } from "../site-frame/index.mjs";
import { tokenKeyAddress } from "./products.mjs";

const TOKEN = /^(?:github-token|github-token:.+|gitlab-token:.+)$/;

// The stores this page keeps its Bridges informed of, by their storage and prefix: one listener each, however often a route is shown.
const informed = new WeakMap();

/** repositoryTokens(store, instance) -> { repository, token }[] — every repository token the store keeps, with the address of the repository its key names. */
export function repositoryTokens(store, instance) {
  return listSettings(store).filter(({ key }) => TOKEN.test(key)).flatMap(({ key }) => {
    const token = readSetting(store, key)?.value, address = tokenKeyAddress(key, instance);
    return typeof token === "string" && token && address ? [{ repository: address.web, token }] : [];
  });
}

// The Bridges this browser keeps, each once: every `bridge:<name>`, and `bridge`, the one paired last, where no named one has its address.
function keptBridges(store) {
  const named = listSettings(store).filter(({ key }) => key.startsWith("bridge:"))
    .map(({ key }) => ({ ...readSetting(store, key), name: key.slice("bridge:".length) })).filter((entry) => typeof entry.token === "string");
  const last = readSetting(store, "bridge");
  const lastIsNamed = named.some((entry) => entry.address === last?.address);
  return [...named, ...(last && typeof last.address === "string" && !lastIsNamed ? [{ ...last, name: "paired last" }] : [])];
}

/**
 * handToBridges(store, instance) -> Promise<{ name, kept } | { name, error }[]> — hands every Bridge this browser keeps every repository token it keeps
 * (MOD-bridge-client's handTokens). A Bridge that does not take them is named with the reason in a notice of the frame, and keeps what it held.
 */
export async function handToBridges(store, instance) {
  const tokens = repositoryTokens(store, instance);
  const jumpHost = readSetting(store, "jump-host");
  return Promise.all(keptBridges(store).map(async (entry) => {
    try {
      return { name: entry.name, kept: (await handTokens(bridgeAt(settingsOf(entry, jumpHost)), tokens)).kept };
    } catch (error) {
      // A page without a frame — no place for notices — has no one to tell.
      try { notice("unreachable", { text: `The Bridge ${entry.name} did not take this browser's repository tokens: ${error?.message ?? error}` }); } catch { /* no notice place */ }
      return { name: entry.name, error };
    }
  }));
}

/**
 * keepBridgesInformed(store, instance) -> void — from now on, each write or clear of a repository token in the store hands the Bridges the tokens
 * (handToBridges), once for the writes of one turn of the page. A Bridge's own write hands nothing by itself: a Bridge stored without a pairing — the HTTPS
 * address saved, a Bridge through the jump host named — is not contacted (`pairedNow` hands the tokens after a pairing).
 */
export function keepBridgesInformed(store, instance) {
  const prefixes = informed.get(store.storage) ?? new Set();
  informed.set(store.storage, prefixes);
  if (prefixes.has(store.prefix)) return;
  prefixes.add(store.prefix);
  let pending = false;
  watchSettings(store, (key) => {
    if (!TOKEN.test(key) || pending) return;
    pending = true;
    queueMicrotask(() => { pending = false; handToBridges(store, instance); });
  });
}

/** pairedNow(store, instance) -> Promise — after a pairing: the Bridges are handed the tokens, where this browser keeps any (UC-044 step 4). */
export async function pairedNow(store, instance) {
  return repositoryTokens(store, instance).length ? handToBridges(store, instance) : [];
}
