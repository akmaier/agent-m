# Sprint19 UC003 refill readiness

**MEASUREMENT — 2026-10-10 05:23:28 UTC**

Method: po-sol / gpt-6.1-sol read the full published JOB-20261010-0515-eec2 Start before actual dedicated-clock
Taken 05:16:47 UTC and fresh isolation codex/p19-refill-uc003 from bbc87a4a1197be7cc20cfe9ff9e1c723b96b05cb.
This is a new Start sprint selection ceremony at05:23:28 UTC under UC032 step6/alternative6a. Add ITM-294,
remove none, retain selected290/291/292/257/293. Actual291 release merge aee35f9b4c2f20939b1ed6d49d60933f8e95ac4d
at05:07:43 UTC freed the fourth slot. Selected291/292 stay done;290/257/293/294 are the four in-progress outcomes,
including waiting review. Root publishes this decision and a fresh bounded Developer Start before test writing.

## Original contracts and readiness

AGENTS §1/6a requires originals and the existing working caller. Original AGENTS/SPEC/README/Team2 declaration,
participants/model, affected accepted architecture and retained personally full-read source/test/history inputs were
verified against unchanged blob and SHA256 pins, with fresh full current Sprint19, ordered backlog, UC003/UC032/UC044,
candidate items266/267/270/281/286, proxy/client/endpoint/handler source and relevant current caller/test reads.
The immutable private input inventory records the exact retained versus fresh method; another agent's summary is not
an original read. All current implementation pins use actual delivered sprint merge aee35f9b, not main's older source.

UC032's original Description and steps3–6 order module interfaces before subsystem integration and system testing.
UC003 alternative2a uses the Bridge for an own model, with Safari's configured HTTPS route via UC0446a5. The latter
requires the web server's own login, loopback reverse end, instance-only CORS and a browser-trusted host certificate.
MOD-bridge-client Public interface proxyConfiguration requires: “preflights answered by the web server itself and
never forwarded”. Its Apache and nginx choices are both accepted supported outputs. These contracts support a bounded
component integration of the already-delivered modules; they do not make every unfinished UC044 feature a dependency.

Concrete actual path: public dashboard Settings/endpoints adapter → src/settings-pages/endpoints.mjs bridgeSettings
and Save/Test (store before request) → public bridgeAt/probe with separate Basic login and Bridge-token headers →
actual proxyConfiguration output (src/settings-pages/bridge.mjs:153–154 exposes both server choices) → authenticated
TLS web server's session route → jump-host loopback reverse end → production MOD-tunnels own-key runtime and
desktop compose → MOD-bridge-http endpoint-probe dispatch → MOD-bridge-jobs jobHandlers → endpoint-calls.testEndpoint
→ controlled own-model response → endpoint status. compose supplies jobHandlers; the endpoint-probe dispatch exists.
The proposed tests observe this real joined path, without changing its API or substituting a direct Bridge fetch.

The known-positive comparison is current TST-266002 in tests/release-uc-003-dashboard-https-bridge.test.mjs:61–72:
it observes the public page and separate login, but its repoServer handler forwards nativeFetch directly to
bridge.address. Actual proxyConfiguration calls in tests/bridge-client-tunnel-plans.test.mjs:80 and
release-itm-282-bridge-client.test.mjs:31 check emitted configuration text. Current291 release and runtime286 positives
exercise actual own-key SSH reverse bytes separately. The verified public-call search finds these positive call sites;
this is a concrete integration coverage gap, not a diagnosed product failure or an ad-hoc negative runtime result.

Existing270's direct main/4a/4b/2b system/release outcome is delivered;266's configured forwarding fixture is retained.
267 requires actual authorized current Chrome/Firefox/Safari and a running browser-trusted authenticated host, which
are not present in the retained evidence. A fixture CA trusted only by a controlled client/process is explicitly not
that evidence. 281 advances UC002 after the standing UC003 priority. New294 fills the necessary lower-level joined
HTTPS/reverse integration before the separate real-browser outcome, after its delivered prerequisites in backlog order.
Actual trusted-host provisioning and permitted browser measurement remain required for267; this selection claims
neither267 readiness nor whole UC003/UC044 completion. No discovery/update/watch/mail/signing prerequisite is invented.

## Assignment and execution boundary

Assign declared developer-terra-a to new component integration tests only; A may test the delivered subsystem through
its public interfaces. Reserve developer-terra-e for later independent release evidence, sequentially with E's existing
257/293/290 assignments. SPEC §12 lines1418–1422 says: “A test of level `release` is generated or written by a participant
other than the one that implemented the behaviour it tests.” Prior exact guarded/predecessor history is retained;
root rechecks all current source/caller/test authorship before the later release Start. Component authorship is not
represented as independent release authorship. One context per participant and root plus at most three active children
remain; publication does not itself start a fourth child. No extra per-assertion fault quota or invented test-only
first-red is required. A concrete failure, if established, returns its real failure path for a bounded owned correction.

Temporary real Apache/nginx/TLS/SSH integration is future controlled Ubuntu work only, with each complete job <=120s,
existing staging patterns, no TLS-verification bypass or system trust change, and no paid service/external SSH/personal
state. This planning turn runs no product tests or runtime. Notifications and ordinary browser-direct endpoints remain;
accepted own-model2a alone uses this path. Settings290's public caller/layout and independent delivery remain separate;
UC004/005/006 backlog fill waits for that actual delivery. No accepted document, process/model/participants/DoD changes.

Usage:null; cost:null. This decision changes only the backlog item/order/current
Sprint register and this new dated measurement. Earlier measurements, exact gates and done selections are retained.
