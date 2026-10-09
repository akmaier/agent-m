# Development → Release testing — ITM-282

**MEASUREMENT**

Decision: **PASS** for [PR254](https://github.com/akmaier/agent-m/pull/254), exact source
`2c13f532658fb0b3d5f9191175367618ae3e701d`, into actual sprint/17 currently
`f84b04cc975965d32307ca74279c2d7cd17ea62b`. Independent decider po-sol, not developer-terra-b.
Fresh JOB-20261009-1707-p282, actual Taken clock2026-10-09 17:18:09 UTC; decision clock
2026-10-09 17:21:54 UTC. Usage/cost:null.

## Original reading and owned scope

Read the original published fresh Start before new isolated .agent/worktrees/agent-po-sol-282-gate-17,
branch codex/p282-source-gate-17 from mainf2ee14a5b583fdd908a93bad345504ddd5b29cfd.
Personally read full original AGENTS/SPEC/README/process_team2/participants/pinned scrum-wip in earlier jobs;
verified all remain byte-identical to df81829. Their blobs respectively
7e8f20ca35cd48a5250d143b07a469d46986f123 /1de56e76de63bfe5f3f4bb98820adad801041def /
37284376636ddf07efa58b63be4ff8a2ea12300a /eb772d456a24c145fe3f98778509f207e34e172d /
aba8b680f7df66e2807701294c960a3c29fb0148 /72fdea87d0c468ffcd53ae3a6d564623c686e22d;
pinned process commit ef33e2f501289930960f13b55936e9b557003993.
Original accepted UC003/011/044, ARC037/040/047, MOD-bridge-client/desktop-shell/tunnels had been personally
read, and were checked unchanged. Read original current Sprint17/item282/implementer Start, full accepted
MOD-bridge-client again (blob c1605d3972e8a38f8a282acfbbb64223e9b7b617 with matching human approval),
actual source/new cases, old client and independent263 guards, working legacy bridge-tunnel and its guards,
actual browser settings/endpoints and dashboard settings-view caller paths, original PR body and complete
source/predecessor commit messages. This reviewer authored none of guarded source/tests. No summary replaces
originals. Source history identifies developer-terra-b and predecessor work, not this independent gate writer.

AGENTS §6a says “First read the existing, working caller — then probe.” That is applied to the actual legacy
settings-view → bridge-tunnel path and canonical settings-pages → bridge-client → Bridge API path. AGENTS §2
requires evidence as a concrete call-stack/data-flow path with verification at the failure node; the nodes
below state actual/expected. SPEC §§11–13 supply tests-first/module ownership, canonical cases/own relevant
counterproofs and independent gate/DoD; Team2 adds no job DoD conditions. Human accepted artifacts remain
unchanged. No new correction quota or fixed manual-round cap is imposed.

The diff changes only src/bridge-client/index.mjs (two new reexports), adds owned tunnels.mjs/proxy.mjs and
new tests/bridge-client-tunnel-plans.test.mjs. No old expectation, legacy file/caller, helper, other source
module, workflow, manifest, accepted document, declaration, model or participant changes. The legacy shape
host/portFrom/portTo/session.bridgePort and result.url is reference evidence; it is not migrated. Canonical
pure output supplies later desktop-shell export→jump-host/remote-session→tunnelCommands→TunnelPlan setup;
no running tunnel, import control, provisioning or browser measurement is delivered.

## Production data path and primary directive semantics

index.mjs public reexports → tunnels.mjs:14 allocatePort checks inclusive valid range, builds occupied Set
and :18 returns lowest free port; :19–22 exhausts with NoFreePort naming first/last. tunnelCommands:25
reads accepted JumpHost hostname/user/sshPort, RemoteSession.port, supplied Bridge port or bridgeApi.defaultPort,
and separate remote/local key-file names → :35–38 explicit loopback reverse/forward, keepalives and exit-on-
forward-failure → :39–42 canonical reverse/forward plans → :43–48 service description retains reverse command.
Only file names enter output; session tokens and actual supplied jump-host password do not.

Actual browser client index.mjs:68–70 appends /v1/... to bridge.address, e.g.
https://jump.example.test/bridge/gpu-box/v1/pair. proxy.mjs pathOf → Apache source prefix
/bridge/gpu-box/ and loopback upstream http://127.0.0.1:40100/ have matching trailing slashes;
nginx prefix location has the same source and a proxy_pass URI of /. Thus /v1/pair reaches port40100
as /v1/pair, and the second named session maps to its own supplied port40102.
This follows [Apache ProxyPass URI semantics](https://httpd.apache.org/docs/2.4/mod/mod_proxy.html#proxypass)
and [nginx proxy_pass URI replacement](https://nginx.org/en/docs/http/ngx_http_proxy_module.html#proxy_pass).
It does not preserve the unwanted /bridge prefix or use an exact-only nginx location.

Apache has Basic Auth/htpasswd/Require valid-user in each forwarded Location. Actual forwarding remains
subject to that access phase. Its preflight RewriteCond/RewriteRule are in VirtualHost context, where the
leading / URL-path is matched, not an unsupported Location rewrite. Foreign OPTIONS returns403; exact
configured-origin OPTIONS returns204 locally. Non-3xx R status terminates rewriting and drops substitution.
These conclusions follow the primary [mod_rewrite contexts](https://httpd.apache.org/docs/2.4/mod/mod_rewrite.html#rewriterule),
[request phases](https://httpd.apache.org/docs/2.4/rewrite/tech.html#InternalAPI),
[R status semantics](https://httpd.apache.org/docs/2.4/rewrite/flags.html#flag_r) and
[authentication](https://httpd.apache.org/docs/2.4/howto/auth.html). Header always expressions allow the
configured origin only, under [mod_headers conditions](https://httpd.apache.org/docs/2.4/mod/mod_headers.html#header).

nginx uses two sibling location-context if directives: foreign Origin returns403 first; allowed-origin OPTIONS
then returns204 locally with explicit CORS methods/headers. No nested if occurs. Subsequent nonpreflight
forwarding requires auth_basic/auth_basic_user_file. This follows sequential location
[rewrite/return semantics](https://nginx.org/en/docs/http/ngx_http_rewrite_module.html), supported
[if-in-location headers](https://nginx.org/en/docs/http/ngx_http_headers_module.html#add_header) and
[Basic authentication](https://nginx.org/en/docs/http/ngx_http_auth_basic_module.html). Prefix location rather
than = matches /v1 suffixes, per [core location semantics](https://nginx.org/en/docs/http/ngx_http_core_module.html#location).

Both plans explicitly enable TLS443 and name certificate plus private-key file placeholders, consistent with
[Apache SSL](https://httpd.apache.org/docs/2.4/mod/mod_ssl.html#sslcertificatekeyfile) and
[nginx SSL](https://nginx.org/en/docs/http/ngx_http_ssl_module.html#ssl_certificate_key); both retain a trusted-
certificate prerequisite. These are documentary conclusions about emitted directives, not runtime server or
certificate provisioning claims. No server was installed/started. Actual current-browser/trusted TLS and SSH
reachability remain unverified later work. The corrected282003 assertions distinguish prefix/loopback mapping,
configured versus foreign preflight outcomes and both TLS file directives; they do not merely compare auth text
position. Historical source corrections and their original findings remain in commit history, not erased.

The original bridge-http index reexport remains browser-loadable: pairing resolves Node builtins only inside
node(), server resolves HTTP only inside serveBridge; neither invokes Node on module load. Current later285
retains this pattern. No speculative protocol-only import repair is required or selected.

## Complete actual CI, checkout and current dependencies

Tests-only first c5e6d202b7a92d96125670228a184484c6bf2c30 follows1860e880c2dd972cdc80700f61487620ea3952ca.
[First red37960185614](https://github.com/akmaier/agent-m/actions/runs/37960185614) actually fails new test
import because public index lacks allocatePort; the three cases cannot start. Both checkout logs name
`a35a7a714638bc51e22a7a0a1daecc4d22eb243d`, actual parents1860e880/c5e6d202,
tree125187e6bbc4cb77d4c3be8251a52a6b342859a5 equal to tests-first head tree.
Python399 OK/5skip/6expected failures56.206s. Node1041/1032pass/1fail/8TODO,0skip/cancel46.424s.
Full red7171lines/729554bytes SHA256f9b93fdc3626c18aeb92c7420fc7c6b3eb98ec2c2723d58c15300d91f08e5bda.

[Final complete37963777144](https://github.com/akmaier/agent-m/actions/runs/37963777144) is SUCCESS at exact
2c13f532658fb0b3d5f9191175367618ae3e701d. Both checkout logs name
`ae9ac5ea60e3ed72bb09f975c53f903ea3d247b3`, actual parents1f76b1657e8d8a7511268dbb5a6dae580cd0fe54
and2c13f532658fb0b3d5f9191175367618ae3e701d, tree59f754305091f9cc47ac302e890a7620673cf374.
Retrieved every actual tree entry; all1966 files exactly equal tested284 target plus only the four reviewed
282 source/test changes. This is the actual combined284+282 checkout, not the original head tree alone.
Node113932888061 SUCCESS1046/1038pass/0fail/8TODO60.784s, full66s. Python113932888229 SUCCESS399/
388ok/5skip/6expected failures46.146s, full53s. Both remain within unchanged two-minute job budget.
Native276001–006/276901 execute and pass in Linux. Full final7188lines/730971bytes
SHA25603038f6cde58322899af39fe1310a5528547e9954a1fb7158e378617367a6ad7.
Complete raw logs /private/tmp/p282-{red,final}-ci.log and every-outcome ledgers were read in full.
All399 Python names/outcomes identical; all shared Node names retain outcomes. The failed new-file import
is replaced by three passing282 cases, and final adds the three284 cases from its actual tested base.

Live PR254 OPEN/MERGEABLE at exact2c13f532, base sprint/17, both completed SUCCESS checks from37963777144.
Actual branch API target f84b04cc975965d32307ca74279c2d7cd17ea62b now adds approved285 protocol/server
and283 browser-store source/tests beyond tested1f76b165. Inspected exact target delta and original modules;
client source/tests are untouched. New browser-store is not imported by these pure builders.285 retains the
same defaultPort/token header/endpoint-test config/answer and POST route; canonical client finds probe by
method/path/kind rather than position. New route identifiers remain disjoint.

Because protocol is a real dependency, a second disposable tree uses current actual targetf84b04cc plus exactly
the four reviewed282 bytes. Selected new/client/independent263 loopback cases13/13 pass,0fail/skip/TODO/cancel,
144.258ms (/private/tmp/p282-po-current-dependencies.log). This directly verifies the preserved pair/probe
path against later protocol/server without relabelling oldCI as testing285/283 or claiming full combinedCI.
Aggregate combined Linux CI/release/closing gates remain separate; root rechecks live target/head/checks before merge.

## Actual own faults, restored positives and canonical guards

Original developer receipts in source commit messages/PR body were read. Exact-head disposable archive
/private/tmp/p282-po-disposable supplied actual source; selected new/client/declaration/trace25/25 passed
before faults,0fail/skip/TODO/cancel106.140ms. Each unchanged actual new case was selected with
node --test --test-name-pattern=TST-28200N tests/bridge-client-tunnel-plans.test.mjs.

| Case | Guarded source transformation → actual failure node | Exact restored same case |
|---|---|---|
|282001|tunnels allocation returns port+1 → test:36 actual40102 expected40101|exit0/pass1/fail0|
|282002|reverse bind changes to0.0.0.0 → test:53 loopback reverse command assertion fails|exit0/pass1/fail0|
|282003|Apache allow-origin becomes wildcard* → test:98 wildcard CORS refusal assertion fails|exit0/pass1/fail0|

Every fault exits1/fails1; each exact-byte restoration verifies equality and exits0/passes1,0skip/TODO/cancel.
Restored tunnels SHA256d15fafd9aac726f1cbedf5f6121cc585baf49d63e1aa2e20504ac3638716d462/blob
7fe560dfbc2f76a0d90a4c27182ea8a106904066; proxy SHA256829aee996cb609967acd244152c748fd395129888596e3586c33c5dc86eb12c3/blob
4eda070018c6ecb638122b3ef04d038ebbe705fa equal exact head. Unchanged indexblob
12f1010dbf4a35b75a16847c42ea1c03d7ffacb5/newtestblobc8f57eda15d4d158a9a9aa3e3b5b98849184a836.
Private actual /private/tmp/p282-po-TST-28200N-{fault,restored}.log retains each result. No new per-assertion
mutation quota is imposed; the three own-case relevant counterproofs and corrected proxy assertions are verified.

Actual canonical testDeclarations reads exactly three unique numeric282001–003 at lines30/41/73,
unit/MOD-bridge-client with lowercase guards/given/input/expect nonempty. The supported packed first-line
level/module fields are actually parsed. Real traceGraph/tracesTo positively returns282002 for the loopback
requirement, then zero for an unrelated signature requirement (/private/tmp/p282-po-declarations.log).
Retained independent263 release2 plus pure legacy tunnel4 selected cases6/6 pass,139.727ms; no whole
review-core/full-local suite runs. Old unit8 remain passing with unchanged pair/bridgeAt/probe timeout/error/body
and canonical endpoint arguments. Only constructed storage/loopback/command fixtures are used.

## Limits and disposition

Existing Python5skips (groups/nightly SPEC/sprint records) and6expected failures (CR/CRLF approval twins,
backlog order/outside-section SPEC bytes/trailing blanks) remain. Node8TODO remain R2/R3/A3/A4 and release/core
G1/G2 record-as-proposal findings. They are retained limitations, not passed product behavior.
No native Mac app/browser/clipboard/focus/system setting/accessibility/device audit, personal credentials,
real SSH or web server, paid provider, full local Node glob, external write or child agent occurred.
No source/test/contract changes were made by this reviewer. Root may publish/comment/recheck and merge only
this exact approved source. Independent E/predecessorE release writing, item-wide release, aggregate sprintCI,
review/closing and human report acceptance remain open. This source gate does not close the item or sprint,
accept human artifacts, deploy/distribute or infer running trusted HTTPS/browser/SSH reachability.
