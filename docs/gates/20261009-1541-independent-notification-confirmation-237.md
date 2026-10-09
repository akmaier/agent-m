---
gate: Independent selected-item completion review
job: JOB-20261009-1536-p237n
decider: po-sol
role: Product Owner
model: gpt-6.1-sol
decision: passed
on:
  - ITM-237
  - UC-047
  - b25ee4e905301e763641a33ff0c45d485ffbfd04
date: 2026-10-09 15:41 UTC
---
# Independent notification confirmation: ITM-237

**REGISTER**

Selected ITM-237 is complete for Sprint 16 purposes on akmaier's explicit acceptance of delivered browser notifications, supported by the current original source, caller and independent guard evidence. This decision does not close Sprint 16: selected ITM-266's full-system work and the aggregate release-to-review gate remain separate.

## Exact evidence and independence

Published Start and review base: `cd25191c3c078708481d74089d73e91c83c35e7c`; actual Taken: **2026-10-09 15:37:20 UTC**. Review used a new isolated worktree and branch; the primary worktree remained on main.

Public human confirmation: `docs/measurements/2026-10-09_notifications-confirmed-by-akmaier.md`, blob `a9609562248f353f490d3e3d60d301332ecf11e5`. Akmaier explicitly states: “With that all notification work is tested and confirmed to work.” He also instructs Scrum to continue and confirm implementation and testing in the backlog. The public record identifies Safari, Firefox, Chrome and iPhone and attributes the result to his manual testing and acceptance.

This human acceptance supersedes the earlier uncertainty about delivery. It does not retroactively change earlier measurements or create developer-captured browser versions, native click observations or a new device audit. Earlier API settlement and synthetic event tests remain developer evidence of their actual scope; they are not observations of native banners. No further native rounds or questions are required by this assigned gate.

The notification source tree at both the review base and exact sprint pin is `e64497c33b2070dae85f73cf8052fddbc27d480c`. Original module implementation is `c5920b6eabb7987b8732e52de808fdf8ab81e31e` (developer-sonnet-c); original dashboard/main/settings wiring is `640dd28d1aee058982303f68044faedce6f0a9dd` and its bounded placement/token correction is `50dc86c1ae510b0a2c4fc9732a01528bab837e57` (developer-sonnet-a). Current notification code was not corrected for this review.

Original accepted gates read include `20261007-0952-development-release-testing-8671.md`, `20261007-1043-development-release-testing-5898.md`, `20261007-1139-development-release-testing-948a.md`, `20261007-1145-release-testing-sprint-review-99b2.md`, `20261007-1315-development-release-testing-d362.md` and `20261007-1343-development-release-testing-e286.md`. Their historical findings and TODO counts remain historical. Developer-sonnet-e wrote the independent UC-047 system/release guards and implemented none of the notification module or those caller corrections. Po-sol authored neither checked notification code nor the human-confirmation record; predecessor PO gate authors reviewed rather than implemented this behavior.

Later delivery is retained: Sprint 13 delivered ITM-239 via PR217 approved `f45cd15d3e36ef968a7226efe8fbdff61f8bf558`, merged `184b65148e557ad5769ccab466756e6f171aa94b`; ITM-271 via PR218 corrected head `2db3fd7db711e206a0b699394a41479746a766d9`, merged `56f58df28c3a46ce0e178f268daae67e567a3e77`. Originals `20261008-0146-development-release-testing-217a.md`, rejected `20261008-0201-development-release-testing-218a.md`, passed correction `20261008-0211-development-release-testing-218b.md` and aggregate `20261008-0226-release-testing-sprint-review-219.md` were read. Developer-terra-b implemented report derivation; developer-terra-e and predecessor Sonnet-e implemented none of its guarded behavior. The two current report guards meaningfully inspect unfinished/accepted waiting state, closing the historically masked states identified in 218a. Earlier pending delivery statements are not current findings.

The original AGENTS/SPEC and affected UC-047, MOD-notifications, ITM-236/237, current Sprint 16, process/participants/model, source/caller histories and guard inputs were read, or retained full original reads were verified unchanged. The pinned process model remains `ef33e2f501289930960f13b55936e9b557003993`.

## Call and data paths, with verification at the node

- Settings: `docs/assets/dashboard/settings-view.mjs:390` → `switchOn` (`src/notifications/permission.mjs:72`) → permission requested only on the person's action → current worker registration → browser-store notification switch. The component/system/release guards assert no request on main/review/settings page load and exactly one on Switch on, with the stored switch and rendered state. `settings-view.mjs:398` → `testNotification` (`permission.mjs:93`) → `showNotification` is the Test API path; its settlement alone is not a native-display observation.
- Review caller `docs/assets/dashboard-app.mjs:455` and main caller `src/home/home.mjs:124` → instance browser-store plus the existing dashboard token → `watchForAcceptance` (`src/notifications/checks.mjs:39`) → immediate check and minute timer → `due` at line 48 enforces permission/switch/five-minute age. Guards verify both callers use the supplied instance store and actual stored token, and verify paused/not-due/off behavior.
- `checks.mjs:90` → repository snapshot → `waitingForAcceptance` → path/blob comparison at line 96 → kind/repository grouping at line 110 → caller-built acceptance URL → `showNotification` at line 144 with title/body/tag/data.url. Unit and independent system/release guards inspect the emitted objects at that final API node: first-check baseline, newly waiting files, grouping past three, correct URLs, deduplication, skipped repositories and isolation of product credentials. Release-report guards verify no report before End, one completed-report notice, no unchanged repeat and removal after acceptance.
- `src/notifications/worker.mjs:10` → notificationclick → close notification → `clients.openWindow(data.url)` at line 13. Existing worker guards execute this logic through a synthetic event; they prove the URL handoff, not a real operating-system click. Native delivery is accepted by the human confirmation above.

## Current independent positive run

At the exact review base, Node v26.3.1 independently ran these existing files without edits:

```text
node --test tests/notifications.test.mjs tests/dashboard-notifications-wiring.test.mjs tests/dashboard-notifications.test.mjs tests/system-uc-047-be-told-what-waits-for-your-acceptance.test.mjs tests/release-sprint-07-uc-047-notifications.test.mjs tests/system-uc-047-release-report-waits.test.mjs tests/release-uc-047-release-report-waits.test.mjs
```

Result: **41 tests, 41 passed, 0 failed, 0 cancelled, 0 skipped, 0 TODO; duration 1608.592584 ms**. These run real notification/caller/domain code through controlled repository and browser interfaces. No native browser/device was operated. No new test or fault obligation was added; existing published counter-proofs remain attributable to their original gates.

Only this new immutable gate and a private multiline publication body were prepared. No rejected private device/audit payload or personal-settings summary is included or exported. No external write, source/test change, accepted-document/process/selection edit, release tag or report acceptance was performed. Usage and cost are unknown.
