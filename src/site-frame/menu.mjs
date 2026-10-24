// menu.mjs — the eight entries of the menu and the links they lead to, and the button that folds them on a narrow screen
// (docs/architecture/MOD-site-frame.md, Parts). The menu
// follows the process: the requirements, the use cases, the architecture, the implementation, the tests and the releases in this
// order, then the maintenance — issues and mail — and the settings (THE MENU FOLLOWS THE PROCESS).
//
// Module: MOD-site-frame
// Private to the module: index.mjs and dashboard-app.mjs use it.

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
 * menuOf(page: "main" | "review", loaded: string[], product?: string | null) -> MenuEntry[] — the eight entries in the order of the
 * process, each { key, label, href: string | null, title }. On the review pages `loaded` names the entries some loaded view serves; the
 * others have href null and a title that says they are not built yet. On the main page every entry links into the review pages, which
 * say there when an entry is not built yet, so `loaded` is not read. With `product`, the address of a product this browser keeps, each
 * href that is not null ends in `/product=` and the address percent-encoded, the form `chosenProduct` reads back; this is the one place
 * that writes it.
 */
export function menuOf(page, loaded, product = null) {
  const withProduct = (href) => (product ? `${href}/product=${encodeURIComponent(product)}` : href);
  return ENTRIES.map(([key, label]) => {
    const built = page === "main" || loaded.includes(key);
    return { key, label, href: built ? withProduct(linkOf(page, key)) : null, title: built ? label : `${label} — not built yet` };
  });
}

/**
 * foldMenu(menu: Element) -> Element — the button that folds the menu on a narrow screen, which the caller puts right before `menu`
 * in its header. It is a <button class="menu-button btn"> named Menu, which controls the menu (aria-controls, the menu's id, given one
 * if it has none) and states its fold in aria-expanded: "false" at first, and each click turns it; a click on one of the menu's
 * links folds it again. look.css shows the button on a screen up to 760 px wide and hides the menu while it is folded; wider, the
 * button is not shown and the menu stands as it is.
 */
export function foldMenu(menu) {
  if (!menu.getAttribute("id")) menu.setAttribute("id", "site-menu");
  const button = document.createElement("button");
  button.setAttribute("type", "button");
  button.setAttribute("class", "menu-button btn");
  button.setAttribute("aria-controls", menu.getAttribute("id"));
  button.setAttribute("aria-expanded", "false");
  const icon = document.createElement("span");
  icon.setAttribute("aria-hidden", "true");
  icon.textContent = "☰";
  button.append(icon, " Menu");
  const fold = (open) => button.setAttribute("aria-expanded", String(open));
  button.addEventListener("click", () => fold(button.getAttribute("aria-expanded") !== "true"));
  menu.addEventListener("click", (event) => { if (event.target?.closest?.("a[href]")) fold(false); });
  return button;
}
