// MOD-notifications — the browser's notifications of what waits for the person's acceptance (docs/architecture/
// MOD-notifications.md): its interface. Of it, ITM-236 builds NotificationState, notificationState, switchOn,
// testNotification, switchOff, watchForAcceptance and the service worker worker.mjs (A PERSON IS TOLD WHAT WAITS FOR
// THEIR ACCEPTANCE, NOTIFICATIONS ARE SWITCHED ON BY THE PERSON). Making the dashboard's settings page show the line
// *Notifications*, and its main and review pages start the checks, is a change between jobs after this item.
//
// Module: MOD-notifications
//
// permission.mjs holds the state, switching on and off, and the test; checks.mjs holds watchForAcceptance. worker.mjs
// is the service worker itself, registered from permission.mjs's own folder. Every file of this folder besides this
// one is private to it.

/**
 * NotificationState — { on: boolean, permission: "default" | "granted" | "denied", available: "here" | "from the
 * Home Screen" | "no" } (MOD-notifications, Interfaces).
 * @typedef {{ on: boolean, permission: "default" | "granted" | "denied", available: "here" | "from the Home Screen" | "no" }} NotificationState
 */

export { NotificationsError, notificationState, switchOn, testNotification, switchOff } from "./permission.mjs";
export { watchForAcceptance } from "./checks.mjs";
