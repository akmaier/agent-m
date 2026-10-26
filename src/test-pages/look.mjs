// What this module's routes of Tests share of the site's one look (ITM-1223; EVERY PAGE SHARES ONE LOOK AND WORKS ON A PHONE), as
// docs/architecture/MOD-test-pages.md states it: the frame's head — the route's heading and the line of where it reads, the address, the ref read and how —
// with the Tests entry's views of views.mjs under it; and the frame's table (class list) whose cells carry their column's title as data-label, the one rule
// by which the frame's style sheet reflows a table on a phone (MOD-site-frame, look.css).
//
// Module: MOD-test-pages

import { testsViews } from "./views.mjs";

function el(name, className, ...children) {
  const node = document.createElement(name);
  if (className) node.className = className;
  node.append(...children);
  return node;
}

// testsHead(context, { title, shown, reads }) -> Element — <section class="head">: the heading `title`, the muted line `reads` (nodes or text) where one
// is given, and the Tests entry's views, `shown` (the label of the view drawn) marked.
export function testsHead(context, { title, shown, reads = null }) {
  return el("section", "head", el("h2", null, title), ...(reads ? [el("p", "muted", ...[].concat(reads))] : []), testsViews(context, shown));
}

// readsAt(address, ref, what?) -> Node[] — the line of where a page of a product reads: its address, the ref read, and how.
export function readsAt(address, ref, what = "read now from the repository; nothing here is stored.") {
  return [`${address} · `, el("code", null, ref), ` · ${what}`];
}

// column(label, ...children) -> <td data-label="label"> — a cell of the frame's table, labelled by its column's title.
export function column(label, ...children) {
  const node = el("td", null, ...children);
  node.setAttribute("data-label", label);
  return node;
}

// listTable(columns, rows) -> <table class="list"> — the frame's table of `rows` under the column titles `columns`.
export const listTable = (columns, rows) => el("table", "list", el("thead", null, el("tr", null, ...columns.map((title) => el("th", null, title)))),
  el("tbody", null, ...rows));
