# Sprint 19 tunnel-runtime test observer

**MEASUREMENT — 2026-10-10 05:23:36 UTC**

Scope: test-only PR292 head `d22631244067023cd0f44c1c0c2adb26e65955af` against approved `aee35f9b4c2f20939b1ed6d49d60933f8e95ac4d`, under JOB-20261010-0454-739e. No production code or existing expected result changes.

The earlier confidence-source run38024694987 transferred the expected forward bytes and enforced the loopback/host-key boundaries, but its TST-286903 observer reported no keepalive value. Production `src/tunnels/index.mjs` resolves ssh2 relative to its source URL; the eval worker previously resolved it relative to the eval entry. Concurrent native-fixture dependency staging can give those two bases different Client objects. The original failing run did not record its resolved paths, so that race remains an inference.

The corrected worker uses `createRequire(source)` before importing production `openTunnels`. Its spy records the actual Client.connect calls; the original assertion still requires keepalive30000, correct bytes, non-loopback refusal, changed-host-key refusal and no forbidden forwarding. Only after those assertions pass does the outer test print the identity witness.

Own Ubuntu CI38027159911 is SUCCESS: Python63s,396 tests with5 skipped and6 expected failures; Node72s,1108 tests with1100 pass,0 fail and8 inherited TODOs. Both jobs satisfy120s. Actual checkout `4e1225a9cad6a6ccc62d39d8d207f089a88575f2` has parents aee35f9 and d226312; its tree `2fbb416fffb24f068ace914a5e3cce9bc71c5b61` equals the candidate head.

At2026-10-10T05:21:03.9391699Z the actual positive prints resolved `/tmp/agent-m-286-ssh2-1.17.0/node_modules/ssh2/lib/index.js`, clientConnects3, keepalive30000. This confirms the corrected observer on this controlled run; it does not reconstruct the earlier unlogged identity.

Full original CI raw, metadata and checkout API are retained as `/private/tmp/root-p19-ci-38027159911.log`, `.json` and `-commit.json`. Raw SHA256 `eee3db4fe56b298ddf59cd2e3175963b58b877f426fd9c53bf4b3201f3ca7410`. The current owned test SHA256 is `0e7f0491b9e02be77df6a6402eec4632f7493808375d3d3b6276e2be65f516d6`.

Developer-terra-d personally read all14 authoritative existing same-guard inputs and post-baseline E901 in bounded original chunks before final review; the earlier truncated outputs and four-path static selection were superseded truthfully. The immutable delivery receipt is `/private/tmp/terra-d-p19-runtime-identity-delivery.md`. No local runtime, native browser or personal-device operation occurred. Independent PO approval and actual merge remain pending.
