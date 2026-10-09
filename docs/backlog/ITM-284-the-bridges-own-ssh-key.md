---
id: ITM-284
title: The Bridge's own SSH key
level: module
realises:
  - UC-044
  - THE BRIDGE CREATES ITS OWN SSH KEY
  - NO SECRET IN THE REPOSITORY
modules:
  - MOD-tunnels
builds_on: []
tests:
  - unit
origin:
  - UC-044
---
# ITM-284 The Bridge's own SSH key

**REGISTER**

## Outcome

Implement only MOD-tunnels.ensureKey(dataFolder) through src/tunnels/index.mjs: first use makes the Bridge's Ed25519 pair in ssh/id_ed25519 and ssh/id_ed25519.pub within the supplied per-user folder, with user-only private-key access; later calls reuse that key. Return only publicKey and fingerprint; NotWritable names the folder. Follow accepted ARC-052: use the real ssh2 utils.generateKeyPairSync('ed25519') output in OpenSSH format, not a fabricated crypto/key stub or manually converted PEM substitute. The verified primary ssh2 v1.17.0 README documents generateKeyPairSync and parseKey/getPublicSSH; check correspondence and fingerprint against the real key data.

MOD-desktop-shell's accepted start and UC-0446a2 need this key, but the current source pairing app supplies no key or tunnel controls. This independent unit slice uses no TunnelPlan, bridgeApi or SSH connection and needs no unfinished module interface. openTunnels/closeTunnels/tunnelState/tunnelHandlers, known-host handling, shell composition and window controls remain later work. No system SSH executable, native launch, personal key, real host or repository file is used.

## Acceptance

- Public unit cases in newly created controlled temporary folders prove Ed25519 private/public correspondence, the returned public key/fingerprint, exact private-key permissions and reuse across calls/restarts without replacing either file.
- Unwritable controlled-folder input yields NotWritable naming its folder; no private key is returned, exported, logged or written outside that folder. Positive generation/reuse remains available while refusal is tested.
- Only src/tunnels/ and new tests naming MOD-tunnels change. No manifest, lockfile, build, helper, native-control or network operation belongs to this bounded implementation. A demonstrated unowned tooling need requires a separately bounded between-jobs scope before editing.
- The first writing commit contains only new tests and has actual red CI before implementation. Final exact-head full CI is green. Each new case declares a unique numeric TST, one unit level, module, guarded requirement/use case, readable precondition/input/expected result and its own executed relevant guarded-code fault, failure and byte-exact-restored positive. Existing expected results are not weakened. No paid service is called.
- The source PR names its concrete accepted consumer/data path and the actual failure node. Independent selected-item release coverage follows the approved merge; module source readiness and the aggregate release gate remain distinct.

## Source-test dependency readiness

Use the existing approved outside-checkout acquisition pattern in tests/desktop-shell.test.mjs: its runtime() acquires an exact package with npm install --no-save --prefix in a temporary cache, verifies availability and fails honestly if acquisition fails. New MOD-tunnels-named test adapters may acquire ssh2@1.17.0 in their own temporary cache outside the checkout and launch an ordinary Node child with that cache's node_modules on its dependency resolution path (for example NODE_PATH with normal Node createRequire resolution). The child calls the real public ensureKey source with the real ssh2 package; no alternate production entry or injected generator substitutes for it. Keep dependency acquisition and test setup in the new module-named adapter; source uses ordinary Node package resolution, never a hard-coded temporary path or automatic package installation. Installed release packaging remains MOD-bridge-build's later scope.

Before interpreting the tests-only red result, verify the real acquired package's version and known-positive generation/parse correspondence in the same child runtime. The red must then be the absent ensureKey/outcome, not unavailable ssh2. Preserve actual tests-first red CI, final full CI and existing CI budget. No repository manifest, lockfile or existing helper changes are needed by this pattern. If it demonstrably cannot run within the existing checks, stop at the concrete tooling failure and require a separately bounded between-jobs integration before source work; do not bypass the accepted key design. This is runtime acquisition for a controlled unit test, with no SSH connection, native app or device interaction.
