// menu.mjs — the eight entries of the menu and the links they lead to (docs/architecture/MOD-site-frame.md, Parts). The menu
// follows the process: the requirements, the use cases, the architecture, the implementation, the tests and the releases in this
// order, then the maintenance — issues and mail — and the settings (THE MENU FOLLOWS THE PROCESS).
//
// Module: MOD-site-frame
// Private to the module: index.mjs uses it.

const ENTRIES = [
  ["requirements", "Requirements"], ["use-cases", "Use cases"], ["architecture", "Architecture"],
  ["implementation", "Implementation"], ["tests", "Tests"], ["releases", "Releases"],
  ["maintenance", "Maintenance"], ["settings", "Settings"],
];

// The label of a menu entry, or undefined for a name that is no entry.
export const labelOf = (key) => ENTRIES.find(([entry]) => entry === key)?.[1];

// The link to an entry: on the review pages the entry's name as the fragment, on the main page the same fragment on the review
// pages, which stand at docs/index.html beside it.
export const linkOf = (page, key) => page === "main" ? `docs/index.html#${key}` : `#${key}`;

/**
 * menuOf(page: "main" | "review", loaded: string[]) -> MenuEntry[] — the eight entries in the order of the process, each
 * { key, label, href: string | null, title }. On the review pages `loaded` names the entries some loaded view serves; the others have
 * href null and a title that says they are not built yet. On the main page every entry links into the review pages, which say there
 * when an entry is not built yet, so `loaded` is not read.
 */
export function menuOf(page, loaded) {
  return ENTRIES.map(([key, label]) => {
    const built = page === "main" || loaded.includes(key);
    return { key, label, href: built ? linkOf(page, key) : null, title: built ? label : `${label} — not built yet` };
  });
}
