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
