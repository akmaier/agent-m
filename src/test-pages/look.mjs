// The site's one look as the Tests entry's routes draw it (ITM-1223; EVERY PAGE SHARES ONE LOOK AND WORKS ON A PHONE): the frame's head — the route's
// heading and the line of where it reads — with the Tests entry's views under it, and the frame's table (class list) whose cells carry the column's title
// as data-label, the one rule by which the frame's style sheet reflows a table on a phone (MOD-site-frame, look.css).
//
// The views stand in the order of a person's audit, the setup of the batteries first and then their results: Schedule, Browser, Runs, Audit, Generate
// (UC-027 1, UC-029 1, UC-028 1, UC-030 1, UC-026 1). The Browser and the Audit are MOD-trace-pages' views, reached by their fragments only. The links are
// the frame's buttons (btn); the one shown is marked as the current page (aria-current="page") and drawn as the frame's primary one.
//
// Reading the texts leave open: a link carries its route's fragment as its address, and its click goes through the context's `go`, so that the product
// chosen stays in the address however the page carries it.
//
// Module: MOD-test-pages

export const TESTS_VIEWS = [
  { label: "Schedule", name: "schedule", params: {} },
  { label: "Browser", name: "trace", params: { key: "tests" } },
  { label: "Runs", name: "runs", params: {} },
  { label: "Audit", name: "trace", params: { key: "audit" } },
  { label: "Generate", name: "generate", params: {} },
];

function el(name, className, ...children) {
  const node = document.createElement(name);
  if (className) node.className = className;
  node.append(...children);
  return node;
}

const fragmentOf = ({ name, params }) => `#${[name, ...Object.entries(params).map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)].join("/")}`;

// testsHead(context, { title, shown, reads }) -> Element — <section class="head">: the heading `title`, the muted line `reads` (nodes or text) where one
// is given, and the five views, `shown` (the label of the view drawn) marked.
export function testsHead(context, { title, shown, reads = null }) {
  const links = TESTS_VIEWS.map((view) => {
    const current = view.label === shown;
    const link = el("a", current ? "btn primary" : "btn", view.label);
    link.setAttribute("href", fragmentOf(view));
    if (current) link.setAttribute("aria-current", "page");
    link.addEventListener("click", (event) => {
      event?.preventDefault?.();
      context.go(view.name, view.params);
    });
    return link;
  });
  const views = el("nav", "tests-views", ...links);
  views.setAttribute("aria-label", "Tests");
  return el("section", "head", el("h2", null, title), ...(reads ? [el("p", "muted", ...[].concat(reads))] : []), views);
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
