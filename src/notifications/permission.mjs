// permission.mjs — the browser's notifications: NotificationState, switching them on and off, and the test
// (docs/architecture/MOD-notifications.md, Interfaces, Parts). currentRegistration is shared with checks.mjs only
// (not part of MOD-notifications' own Interfaces): the worker's current registration, registering it again where the
// browser has dropped it.
//
// Module: MOD-notifications

import { clearSetting, readSetting, writeSetting } from "../browser-store/index.mjs";

// NotificationsError — the failures switchOn, testNotification and switchOff throw of their own (MOD-notifications,
// Interfaces): NotAvailable { available }, WorkerRefused { reason }, NotPermitted. StorageUnavailable is MOD-browser-
// store's own StoreError, thrown by writeSetting and clearSetting unchanged.
export class NotificationsError extends Error {
  constructor(name, fields, message) {
    super(message);
    this.name = name;
    Object.assign(this, fields ?? {});
  }
}

// The worker's own address, resolved against this file's so that it is found wherever the dashboard's origin serves
// this module's folder from (AGENT M'S SOURCE CODE LIVES IN SRC).
const WORKER_URL = new URL("./worker.mjs", import.meta.url);
const TEST_TAG = "test";

// An iPhone or an iPad: iOS Safari's own user agent, or iPadOS 13+, which reports as a Mac but with touch.
function iOSDevice() {
  const nav = globalThis.navigator;
  if (!nav) return false;
  if (/iPhone|iPad|iPod/.test(nav.userAgent ?? "")) return true;
  return nav.platform === "MacIntel" && (nav.maxTouchPoints ?? 0) > 1;
}

// Whether this page is open as installed from the Home Screen (standalone display), which is when Safari on an
// iPhone or an iPad shows notifications at all (UC-047 1b).
function openedFromHomeScreen() {
  const nav = globalThis.navigator;
  return nav?.standalone === true || globalThis.matchMedia?.("(display-mode: standalone)")?.matches === true;
}

// available() -> "here" | "from the Home Screen" | "no" (NotificationState) — whether this browser can show
// notifications for the dashboard as it is opened (MOD-notifications, Interfaces).
function available() {
  if (typeof globalThis.Notification === "undefined" || !globalThis.navigator?.serviceWorker) return "no";
  if (iOSDevice() && !openedFromHomeScreen()) return "from the Home Screen";
  return "here";
}

// currentRegistration() -> Promise<ServiceWorkerRegistration | null> — the worker's current registration, registering
// it again where the browser has dropped it (MOD-notifications, Interfaces: watchForAcceptance). null where this
// browser has no service worker support at all.
export async function currentRegistration() {
  const container = globalThis.navigator?.serviceWorker;
  if (!container) return null;
  const existing = await container.getRegistration(WORKER_URL);
  return existing ?? container.register(WORKER_URL);
}

// notificationState(store) -> NotificationState — the state of this browser, for the settings page; it asks nothing
// and makes no request (MOD-notifications, Interfaces).
export function notificationState(store) {
  return {
    on: readSetting(store, "notifications") !== null,
    permission: typeof globalThis.Notification === "undefined" ? "default" : globalThis.Notification.permission,
    available: available(),
  };
}

// switchOn(store) -> Promise<NotificationState> — the person's Switch on: asks the browser's permission to notify,
// the only call in Agent M that asks it; once granted, registers the worker and stores the switch as on, with no
// check made yet. Errors: NotAvailable { available }; WorkerRefused { reason }; StorageUnavailable.
export async function switchOn(store) {
  const state = available();
  if (state !== "here") {
    throw new NotificationsError("NotAvailable", { available: state }, `Notifications are not available here (${state}).`);
  }

  const permission = await globalThis.Notification.requestPermission();
  if (permission !== "granted") return notificationState(store);

  try {
    await globalThis.navigator.serviceWorker.register(WORKER_URL);
  } catch (e) {
    throw new NotificationsError("WorkerRefused", { reason: String(e?.message ?? e) },
      "The browser refused to register the notifications worker.");
  }
  writeSetting(store, "notifications", { checked: null });
  return notificationState(store);
}

// testNotification() -> Promise<void> — the person's Test: shows the test notification at once, through the
// worker's registration. Errors: NotPermitted while the permission is not granted; WorkerRefused { reason }.
export async function testNotification() {
  if (globalThis.Notification?.permission !== "granted") {
    throw new NotificationsError("NotPermitted", {}, "Notifications are not permitted in this browser.");
  }
  let registration;
  try {
    registration = await currentRegistration();
  } catch (e) {
    throw new NotificationsError("WorkerRefused", { reason: String(e?.message ?? e) },
      "The browser refused to register the notifications worker.");
  }
  if (!registration) {
    throw new NotificationsError("WorkerRefused", { reason: "no service worker support" },
      "This browser has no service worker support.");
  }
  await registration.showNotification("Notifications of Agent M are on", { tag: TEST_TAG });
}

// switchOff(store) -> Promise<void> — the person's Switch off: removes both keys (A CLEAR IS A REAL CLEAR) and
// unregisters the worker; the browser keeps its permission until the person takes it back in its own settings.
// Errors: StorageUnavailable.
export async function switchOff(store) {
  clearSetting(store, "notifications");
  clearSetting(store, "notified");
  const container = globalThis.navigator?.serviceWorker;
  const existing = await container?.getRegistration?.(WORKER_URL);
  if (existing) await existing.unregister();
}
