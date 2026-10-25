// The views of the review pages under docs/ and the sections of their settings page — one table, read by the review pages
// (docs/assets/dashboard-app.mjs, which loads each view's file by its name) and by the main page (its menu links only to
// views whose file is built).
//
// Every view and every settings section the accepted use cases call for. A view or section whose file is not built yet — not
// named in docs/assets/dashboard/built.json — is not shown and not asked for; a later change adds one as a new file below
// docs/assets/dashboard/ and one line of built.json, without editing this table.
// view: the route (#<view>/…) and file: the view's module below docs/assets/dashboard/. section: a part of the settings page;
// built in: rendered by a module's route through dashboard-app's public route dispatch — a section by MOD-settings-pages' route settings.
export const DASHBOARD = [
  { view: "uc", file: "review-views.mjs", useCases: ["UC-008"] },
  { view: "arc", file: "review-views.mjs", useCases: ["UC-022", "UC-023"] },
  { view: "spec", file: "spec-changes-view.mjs", useCases: ["UC-006", "UC-018"] },
  { view: "review", file: "review-views.mjs", useCases: ["UC-008", "UC-022", "UC-023"] },
  { view: "specification", file: "specification-view.mjs", useCases: ["UC-020"] },
  { view: "arrange", file: "arrange-view.mjs", useCases: ["UC-021"] },
  { view: "derive-requirements", file: "derive-requirements-view.mjs", useCases: ["UC-005"] },
  { view: "derive-use-cases", file: "derive-use-cases-view.mjs", useCases: ["UC-007"] },
  { view: "derive-architecture", file: "derive-architecture-view.mjs", useCases: ["UC-022"] },
  { view: "modules", file: "modules-view.mjs", useCases: ["UC-025"] },
  { view: "library", file: "library-view.mjs", useCases: ["UC-004", "UC-016"] },
  { view: "sources", file: "sources-view.mjs", useCases: ["UC-015"] },
  { view: "resources", file: "resources-view.mjs", useCases: ["UC-040"] },
  { view: "participants", file: "participants-view.mjs", useCases: ["UC-017"] },
  { view: "process-models", file: "process-models-view.mjs", useCases: ["UC-031"] },
  // UC-002 and UC-048 are rendered by MOD-implementation-pages through dashboard-app's public route dispatch; they have no dashboard view file.
  { view: "process", builtIn: true, useCases: ["UC-002"] },
  { view: "roles", builtIn: true, useCases: ["UC-048"] },
  // UC-032 and UC-033 are rendered by MOD-implementation-pages through dashboard-app's public route dispatch; they have no dashboard view file.
  { view: "backlog", builtIn: true, useCases: ["UC-032", "UC-033"] },
  { view: "progress", file: "progress-view.mjs", useCases: ["UC-035"] },
  { view: "sprint-close", file: "sprint-close-view.mjs", useCases: ["UC-041"] },
  { view: "jobs", file: "jobs-view.mjs", useCases: ["UC-036"] },
  { view: "run", file: "run-view.mjs", useCases: ["UC-043", "UC-034", "UC-024"] },
  { view: "tests", file: "tests-runs-view.mjs", useCases: ["UC-028"] },
  { view: "tests-browser", file: "tests-browser-view.mjs", useCases: ["UC-029"] },
  { view: "tests-schedule", file: "tests-schedule-view.mjs", useCases: ["UC-027"] },
  { view: "tests-generate", file: "tests-generate-view.mjs", useCases: ["UC-026"] },
  // UC-013 is rendered by MOD-test-pages through dashboard-app's public route dispatch; it has no dashboard view file.
  { view: "release", builtIn: true, useCases: ["UC-013"] },
  { view: "audit", file: "audit-view.mjs", useCases: ["UC-030"] },
  { view: "issues", file: "issues-view.mjs", useCases: ["UC-012", "UC-033"] },
  // UC-038 is rendered by MOD-maintenance-pages through dashboard-app's public route dispatch; it has no dashboard view file.
  { view: "mail", builtIn: true, useCases: ["UC-038"] },
  // UC-039 is rendered by MOD-maintenance-pages through dashboard-app's public route dispatch; it has no dashboard view file.
  { view: "replies", builtIn: true, useCases: ["UC-039"] },
  { view: "how", file: "how-view.mjs", useCases: ["UC-006", "UC-008"] },
  // UC-042 is rendered by MOD-settings-pages through dashboard-app's public route dispatch; it has no dashboard view file.
  { view: "settings", builtIn: true, useCases: ["UC-042"] },
  // UC-001 is rendered by MOD-settings-pages through dashboard-app's public route dispatch; it has no dashboard view file.
  { view: "add", builtIn: true, useCases: ["UC-001"] },
  // UC-014 is rendered by MOD-settings-pages through dashboard-app's public route dispatch; it has no dashboard view file.
  { view: "setup", builtIn: true, useCases: ["UC-014"] },
  { view: "get-your-own", file: "get-your-own-view.mjs", useCases: ["UC-014"] },
  { section: "browser", builtIn: true, useCases: ["UC-042"] },
  { section: "endpoints", builtIn: true, useCases: ["UC-003"] },
  { section: "mailbox", file: "settings/mailbox.mjs", useCases: ["UC-037"] },
  { section: "bridge", file: "settings/bridge.mjs", useCases: ["UC-044"] },
  { section: "instance", file: "settings/instance.mjs", useCases: ["UC-042"] },
  { section: "product", builtIn: true, useCases: ["UC-042"] },
  { section: "export", builtIn: true, useCases: ["UC-042"] },
  { section: "clear", builtIn: true, useCases: ["UC-042"] },
];

// The views that are built: those whose file is in builtFiles, the list of docs/assets/dashboard/built.json, and the built-in
// ones, which the app hands to a module's route. -> Set of view names
export function builtViews(builtFiles) {
  const built = new Set(builtFiles);
  return new Set(DASHBOARD.filter((v) => v.view && (v.builtIn || built.has(v.file))).map((v) => v.view));
}
