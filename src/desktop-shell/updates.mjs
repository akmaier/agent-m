// The Bridge's updates (MOD-desktop-shell, Parts: updates.mjs; Interfaces: Updates; THE BRIDGE IS UPDATED ONLY BY THE PERSON'S CHOICE): the offer of a newer release, its download on the
// click, its signatures and its installation on the click.
//
// Module: MOD-desktop-shell
//
// It works through electron-updater's `autoUpdater`, handed in as `updater`: with `autoDownload` off and `autoInstallEvent` set to `manual` (and no installation on quit), the check reads the
// update feed of the instance the app was built for and downloads no release. The release is offered only when the feed's detached signature — `<feed>.sig`, the Ed25519 signature of
// the feed's bytes in base64, as MOD-bridge-build writes it — holds against the publisher's key built into the app, and the signed feed names the version and the files the updater
// read. The click Download fetches the file, which becomes installable only when its own `<file>.sig` holds; otherwise the file is deleted. The second click, Install and restart, is
// the call `install({ confirmed: true })`, the decision (naming the jobs that would end as cancelled) being the window's; it calls `quitAndInstall()`. A feed that cannot be read, a
// download that fails and a signature that does not hold each leave the running Bridge as it is, and the state says which. Where electron-updater checks a code signature too (macOS,
// Windows) that is its own step.
//
// The feed and each file are fetched from the instance's latest release, `https://github.com/<owner>/<repository>/releases/latest/download/`, the feed by the platform's name in
// MOD-bridge-build's table: latest-linux.yml, latest-mac.yml, latest.yml.

import { createPublicKey, verify } from "node:crypto";
import { get } from "node:https";
import { readFileSync, rmSync } from "node:fs";
import { basename } from "node:path";

const DAY = 86_400_000;
const FEEDS = { linux: "latest-linux.yml", darwin: "latest-mac.yml", macos: "latest-mac.yml", win32: "latest.yml", windows: "latest.yml" };

const failure = (name, message) => Object.assign(new Error(message), { name });
const parts = (version) => String(version).split(".").map((each) => Number(each) || 0);
// Whether version `a` is newer than `b`: calendar versions YYYY.MINOR.PATCH, compared part by part.
const newer = (a, b) => {
  const [x, y] = [parts(a), parts(b)];
  for (let at = 0; at < Math.max(x.length, y.length); at += 1) if ((x[at] ?? 0) !== (y[at] ?? 0)) return (x[at] ?? 0) > (y[at] ?? 0);
  return false;
};
const notesOf = (notes) => (typeof notes === "string" ? notes : Array.isArray(notes) ? notes.map((each) => each?.note ?? "").filter(Boolean).join("\n\n") : "");
const reason = (error) => String(error?.message ?? error);

// The bytes at an address, over HTTPS as the Bridge (a Node program) reads them; a release's files lie behind GitHub's redirect.
const fetchBytesFrom = (url, redirects = 5) => new Promise((resolve, reject) => {
  get(url, (response) => {
    const { statusCode, headers } = response;
    if (statusCode >= 300 && statusCode < 400 && headers.location && redirects > 0) {
      response.resume();
      resolve(fetchBytesFrom(new URL(headers.location, url).href, redirects - 1));
    } else if (statusCode !== 200) {
      response.resume();
      reject(new Error(`${statusCode} ${url}`));
    } else {
      const chunks = [];
      response.on("data", (chunk) => chunks.push(chunk));
      response.on("end", () => resolve(Buffer.concat(chunks)));
      response.on("error", reject);
    }
  }).on("error", reject);
});

/**
 * createUpdates({ updater, key, version, instance, platform, fetchBytes?, setInterval? }) -> { state, check, download, install, start } — `updater` is electron-updater's autoUpdater, `key` the publisher's
 * public key in PEM (null: the build offers no update), `version` the running version, `instance` `<owner>/<repository>`.
 * state() -> { version, offer: { version, notes } | null, ready: boolean, refused: string | null, error: string | null }.
 * check(), download() -> Promise<state>. install({ confirmed }) -> Promise<state> — throws NotConfirmed unless `confirmed` is true, NothingDownloaded unless a verified file is downloaded.
 * start() -> Promise<state> — the check now, and again every 24 hours.
 */
export function createUpdates({ updater, key, version, instance, platform = globalThis.process?.platform, fetchBytes = fetchBytesFrom, setInterval: every = globalThis.setInterval }) {
  updater.autoDownload = false;
  updater.autoInstallEvent = "manual";
  updater.autoInstallOnAppQuit = false;
  const base = `https://github.com/${instance}/releases/latest/download/`;
  let current = { version, offer: null, ready: false, refused: null, error: null };
  const set = (changes) => { current = { version, offer: null, ready: false, refused: null, error: null, ...changes }; return state(); };
  const state = () => ({ ...current, offer: current.offer ? { ...current.offer } : null });
  const holds = (bytes, signature) => {
    try { return verify(null, bytes, createPublicKey(key), Buffer.from(String(signature).trim(), "base64")); } catch { return false; }
  };

  async function check() {
    if (current.ready) return state(); // a verified download waits for the person's second click; a later check leaves it
    if (!key) return set({ refused: "This build carries no update key, so it offers no update." });
    let info;
    try {
      info = (await updater.checkForUpdates())?.updateInfo;
    } catch (cause) {
      return set({ error: `The update feed cannot be read: ${reason(cause)}` });
    }
    if (!info || !newer(info.version, version)) return set({});
    let feed, signature;
    try {
      const name = FEEDS[platform] ?? FEEDS.linux;
      feed = await fetchBytes(`${base}${name}`);
      signature = (await fetchBytes(`${base}${name}.sig`)).toString();
    } catch (cause) {
      return set({ error: `The update feed cannot be read: ${reason(cause)}` });
    }
    if (!holds(feed, signature)) return set({ refused: "The update feed's signature does not hold against the publisher's key, so nothing is offered." });
    const text = feed.toString();
    const named = /^version:\s*['"]?([^\s'"]+)/m.exec(text)?.[1] === info.version && (info.files ?? []).every((file) => text.includes(file.url) && text.includes(file.sha512));
    if (!named) return set({ refused: "The signed update feed does not name the version and the files the updater read, so nothing is offered." });
    return set({ offer: { version: info.version, notes: notesOf(info.releaseNotes) } });
  }

  async function download() {
    if (!current.offer) return state();
    const offer = current.offer;
    let paths;
    try {
      paths = await updater.downloadUpdate();
    } catch (cause) {
      return set({ offer, error: `The download failed: ${reason(cause)}` });
    }
    for (const path of paths ?? []) {
      let signature = null;
      try { signature = (await fetchBytes(`${base}${basename(path)}.sig`)).toString(); } catch { /* a file with no signature to read does not hold */ }
      if (signature === null || !holds(readFileSync(path), signature)) {
        for (const each of paths) rmSync(each, { force: true });
        return set({ offer, refused: `The downloaded file ${basename(path)} is not the publisher's: its signature does not hold. It was deleted.` });
      }
    }
    return set({ offer, ready: true });
  }

  async function install({ confirmed } = {}) {
    if (confirmed !== true) throw failure("NotConfirmed", "The update is installed only after the person's decision.");
    if (!current.ready) throw failure("NothingDownloaded", "No verified update is downloaded.");
    updater.quitAndInstall();
    return state();
  }

  async function start() {
    const first = await check();
    every(() => check().catch(() => {}), DAY)?.unref?.();
    return first;
  }

  return { state, check, download, install, start };
}
