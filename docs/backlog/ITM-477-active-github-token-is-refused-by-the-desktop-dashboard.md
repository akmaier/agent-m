---
id: ITM-477
title: An active GitHub token is refused by the desktop dashboard
level: system
realises:
  - UC-042
  - A BROWSER SETTING IS TESTED AND CLEARED WHERE IT IS SHOWN
  - A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT
modules:
  - MOD-settings-pages
  - MOD-repository-hosts
builds_on:
  - ITM-475
tests:
  - system
  - release
origin:
  - akmaier's report of an active token working in the older iPhone version
---
# ITM-477 An active GitHub token is refused by the desktop dashboard

**REGISTER**

## Outcome

The desktop dashboard's repository-token Test uses the intended stored credential in its request to that token's own
repository server, and the reported active-token rejection is resolved at its demonstrated failure node. This item
does not assume that the token expired, that the desktop holds the same bytes as the iPhone, or that the rejection is
a rate limit. The human reports that the token remains active until the end of December and works in an older iPhone
version. The current Chrome Test follows the public HostError TokenRefused path, which MOD-repository-hosts maps from
HTTP 401; the actual request's credential and response have not yet been compared with the working version.

ITM-475 fixes the independently reproduced non-credential failure recording and unsupported expiry wording. Neither
fix establishes the cause of this live rejection. Candidate ownership is MOD-settings-pages and MOD-repository-hosts;
an existing composition caller is added to the assigned scope only if the data-flow evidence establishes its part.

## Acceptance

- Read the existing working caller before probing. Trace the stored setting through credential selection, request
  construction and the server response, naming actual and expected data at the failure node without recording secrets.
- Establish a known-positive request with the same repository and the intended credential before treating a negative
  comparison as a finding. Preserve the distinction between human-reported iPhone behavior and measured desktop behavior.
- Write the regression at the demonstrated failure node before production edits, obtain its failing CI result, and
  record its planted-fault and restored-pass counterproof. Independent release tests guard the repaired behavior.
- Verify the deployed main-branch dashboard's harmless Test after the fix, reporting its actual result without
  substituting a fixture pass for successful live authentication.
- Keep the credential hidden outside an expressly authorized inspection; never place it in repository evidence,
  output, a URL, or a request to another server. A denied clipboard comparison is not retried through another route.

## Intake Decision

Independent Product Owner po-sol permits registration only. The item remains unselected and has no implementation
job. The human expressly approves the specific one-request clipboard comparison after the earlier denial. This does
not authorize another credential transfer, token replacement or a request to another destination.

## Authorized Diagnostic Measurement

At 2026-10-15T17:46:57.434Z, one GET to https://api.github.com/repos/akmaier/agent-m through Agent M's existing public
connect/parseAddress/repositoryInfo interface in Node returns HTTP 401 and HostError TokenRefused. Request ID:
FF95:2B36EB:1FC3B53:2FB66B2:6AD11191. The probe uses the desktop field's stored value unchanged and permits only that
single request, with redirects refused. No rate-limit headers are present. No token is printed, saved or put in a URL;
the field is concealed and the originally empty clipboard is restored and verified empty after the request.

Data flow: settings.mjs:447-449 binds stored.value to the field -> public Host connect -> github.mjs:58 constructs
Bearer authorization -> github.mjs:141 repositoryInfo -> failures.mjs:45 fetch -> failures.mjs:98 maps 401 to
TokenRefused. The earlier controlled 200 comparison of the old and current callers verifies the harness's positive
path, not this credential's live validity. Chrome is not the sole location of the rejection. Expiry, equality with the
iPhone value and the actual cause remain unproved; no successful live intended-credential control or fix is claimed.

## Transport Audit And Controlled Reproduction

At 2026-10-15 18:02 UTC, the requested follow-up diagnostic discovers that the current Chrome extension's session
clipboard and the system clipboard are different: the session contains the 93-character field value in the expected
token format, while the system clipboard contains 32 characters, whitespace and no expected token prefix. The Node
probe refuses that input before any network request. The session clipboard is restored. No value is printed or saved.

The earlier 17:46 measurement checked the system value's prefix but did not compare its full identity with the browser
field. Its HTTP 401 remains the observed result, but its assertion that the exact browser value was tested outside
Chrome is not established by the saved evidence. It must not be used to exclude a browser-path problem. The current
clipboard mismatch does not establish what either clipboard contained during the earlier request.

The public Host's 200 positive control and 401 mapping pass in the same diagnostic process. A direct attempt there
returns Unreachable without an HTTP response. A private local handoff to a network-enabled Node probe is refused before
credential transfer; that process is stopped and its unused socket removed. No GitHub response body is obtained by
these attempts. Native Chrome Network-panel inspection is blocked by auto-review pending specific human approval;
that approval is requested, with authentication-header exposure identified as the risk. No native-inspection
alternative is used after the denial.

The existing dashboard-product-store-migration test file passes all seven tests. An additional in-memory probe uses
the existing public createStore and productStore callers, not real credentials. Its legacy-only positive control gives
the same value to both callers and removes the migrated duplicate. With deliberately different legacy and populated
canonical entries, createStore.getToken selects the legacy value, while productStore.getToken selects the canonical
value and leaves the conflicting legacy entry in place. The path is product-store-adapter.mjs:74 -> copyToken:45-47
(do not overwrite a populated canonical entry) -> getToken:115 (read the canonical entry). This reproduces a possible
version-dependent selection, not the state of the live browser or iPhone. No production fix or live cause is claimed.

## Reported Login Dependency And Live Positive

The human reports that the token is accepted while logged into github.com in the browser and rejected otherwise.
This is the human's reproduction condition, not a measured comparison of identical outgoing requests. It does not
establish that GitHub's token API requires a browser session, or that a conflicting stored credential is present.

At 2026-10-15T18:20:20.232Z the agent runs the deployed dashboard's existing Settings -> Repositories -> Test once.
The page reports "The repository token is working" and records a successful test at that time; the repository line
shows main at 13a09de77095 and the product metadata loads. The token remains concealed, its displayed expiry remains
2027-01-12, and the agent changes neither credentials nor GitHub login state. The token's exact bytes before and after
the human's sign-in are not compared. This is a live positive through the normal caller, not a fix or a completed
signed-out/signed-in comparison.

The caller path is settings.mjs:497 (read the saved setting) -> settings.mjs:504 (public repositoryInfo) ->
github.mjs:58 (Bearer authorization) -> failures.mjs:36-37 (authorization and credentials omit) -> failures.mjs:45
(fetch) -> settings.mjs:505-506 (record and show working). The old caller also sets credentials omit at
docs/assets/git-host.mjs:74. The implementations do not intentionally depend on GitHub's browser cookies.

A controlled public repositoryInfo probe succeeds with a document.cookie getter that would throw on access: one
request, the exact constructed fixture token in Authorization, credentials omit and zero cookie reads. The four
selected existing repository-host tests for token routing, 401 classification and repositoryInfo also pass. These
checks verify the caller's construction, not the live signed-out transport. The failing request's response body and
the signed-in/signed-out request comparison remain unobserved; the reported condition is retained for that diagnostic.

## Current Disposition

On 2026-10-15 the human reports signing out of GitHub and finding that the token still works. The incident cannot be
reproduced, and the human directs Team 2 back to its sprint work. Browser login is therefore not an established
requirement or demonstrated cause. The earlier measurements and hypotheses remain above with their limitations.

No authentication implementation job starts, no code fix is claimed, and no token rotation or login change is needed
to resume the sprint. Further live credential and native Network-panel inspection are not pursued under the pending
diagnostic request. This unselected item is retained as evidence of a currently non-reproducible incident; it is not
counted as an implemented increment or as a blocker for ITM-476.
