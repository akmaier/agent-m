// MOD-review-pages — the review pages of the dashboard (docs/architecture/MOD-review-pages.md): its interface. ITM-355 builds the
// view with the route of the use cases: the list with each use case's status, one use case, and accepting it; ITM-356 adds
// Review all: `use-case/id=all`, every use case not yet accepted in sequence, and accepting what is shown.
//
// Module: MOD-review-pages
//
// It belongs to the Site (ARC-038) and runs in a browser. It reads statuses only from MOD-approvals, and writes only when a
// person clicks Accept or Accept ticked. Every other file of this folder is private to the module.

import { approvalStrategies } from "../approvals/index.mjs";
import { editStrategies } from "../artifact-edits/index.mjs";
import { sourceStrategies } from "../source-register/index.mjs";
import { specStrategies } from "../spec-changes/index.mjs";
import { reviewRoute } from "./flow.mjs";
import { DECISIONS, MODULES, REQUIREMENT, REQUIREMENT_NEW, SPEC_ENTRIES, USE_CASES } from "./kinds.mjs";

// view — what the frame loads: one route for the use cases, `use-case` (the list) and `use-case/id=<id>` (one use case).
// `use-case/id=all` is Review all. ITM-440 adds the routes `decision` and `module` in the same form: the files with their status, one
// file with the section of what it rests on that is not accepted, and accepting it.
export const view = { routes: [reviewRoute(USE_CASES), reviewRoute(DECISIONS), reviewRoute(MODULES), reviewRoute(SPEC_ENTRIES), reviewRoute(REQUIREMENT), reviewRoute(REQUIREMENT_NEW)], strategies: [approvalStrategies, specStrategies, editStrategies, sourceStrategies] };
