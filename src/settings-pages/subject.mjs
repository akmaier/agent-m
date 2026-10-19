// The subject the Settings page gives the prompt bar (MOD-settings-pages, Interfaces: "Each route gives the prompt bar its subject, of the kind `converse` (UC-049 3c): the page
// names each setting and whether it is stored ... never a value"). One line per setting this browser can keep, with whether it is stored; a value is never read into a line.
//
// Module: MOD-settings-pages

import { listSettings, readSetting } from "../browser-store/index.mjs";

// The line a setting is named by: the secret a family keeps, for the settings whose label does not say it.
function nameOf(info) {
  if (info.key === "mailbox") return "Mailbox (its password or sign-in)";
  if (info.key.startsWith("endpoint:")) return `Endpoint key: ${info.key.slice("endpoint:".length)}`;
  return info.label;
}

// Whether a setting is stored: the key holds a value; an endpoint without a key is stored but its key is not.
function isStored(info, store) {
  const kept = readSetting(store, info.key);
  if (kept === null || kept === undefined) return false;
  if (info.key.startsWith("endpoint:")) return typeof kept?.key === "string" && kept.key !== "";
  return true;
}

// Settings that are records of the browser, not settings a person sets: they are not named.
const RECORDS = ["notified", "browser"];
const named = (info) => info.label !== undefined && !RECORDS.includes(info.key) && !/^(last-test|acknowledged):/.test(info.key);

/**
 * settingsSubject(context, drawn) -> Subject — of the kind `converse`; its page is the title, the menu entry's label, the address of the page, the text the page has drawn (`drawn()`;
 * an input's value is no text, so no stored secret is in it) and one line `<setting>: stored` or `<setting>: not set` for each setting.
 */
export function settingsSubject(context, drawn = () => "") {
  const address = context.product?.address ?? `https://github.com/${context.instance.repository}`;
  return {
    key: context.product ? `settings/product=${encodeURIComponent(context.product.address)}` : "settings",
    title: "Settings",
    kind: "converse",
    entry: "settings",
    paramsFor: () => ({
      page: ["Settings", "Settings", address, drawn(), ...listSettings(context.store).filter(named).map((info) => `${nameOf(info)}: ${isStored(info, context.store) ? "stored" : "not set"}`)].join("\n"),
    }),
    draftRoute: null,
    withhold: null,
    refuses: [],
  };
}
