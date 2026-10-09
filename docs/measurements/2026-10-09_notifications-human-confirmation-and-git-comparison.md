# Notification confirmation and comparison with Claude's implementation

**MEASUREMENT** — 2026-10-09, by scrum-master-session, from akmaier's statements in this session, local Git objects and read-only HTTPS downloads of the deployed files. No native UI or device control was used for this comparison.

## Human observations

Akmaier reported that computer-control testing interfered with typing, that a Chrome permission prompt was dismissed while he tried to allow it, and that Focus settings were disrupted and synchronised to the iPhone. He disabled Codex computer-use Accessibility. Native testing by agents is stopped; permissions and Focus remain under his control. The earlier developer observations and action audit remain separate evidence and do not override his reports.

After configuring the setup himself, he stated:

- "chrome works if I do \"switch-off\", \"switch-on\", \"test\", but works only once, not for multiple clicks."
- "Safari can produce several notifications after \"turn off\", \"turn on\", and it will do one notification for each test."
- "notification on iphone works again. It also synched the broken focus setting that you created."
- "firefox works the same way as safari works."

These confirm his current banner observations, not a measured notification-link click. No current Firefox or iPhone OS/browser version was supplied with these statements. The earlier native-browser versions cannot substitute for missing versions in this human observation.

## Git and deployed-byte comparison

Read Claude Sonnet's complete commit messages for c5920b6eabb7987b8732e52de808fdf8ab81e31e (notification module), 640dd28d1aee058982303f68044faedce6f0a9dd (public callers) and 50dc86c1ae510b0a2c4fc9732a01528bab837e57 (notification Settings placement and token correction).

The entire `src/notifications/` tree has Git object e64497c33b2070dae85f73cf8052fddbc27d480c in Claude's implementation, current main4a7f08f and sprint/16 e4f980ea. Same-method positive Git diff c5920b6^ to c5920b6 reports four created files; comparison of c5920b6 with main and sprint reports no difference. The notification Settings file matches Claude's50dc86c exactly. Restoring those files from the two exact commits produced no working-tree change and therefore no code-change commit.

Read-only HTTP200 downloads from `https://akmaier.github.io/agent-m/` matched the original Git bytes:

| File | SHA256 of both Claude's original and deployed response |
|---|---|
| src/notifications/index.mjs | dc4b59478b9e0ef5bdc4d56c6e0a519ee4c4781e7162da28a65f681389a28616 |
| src/notifications/permission.mjs | daee42b1cba291e544325d169f324a9e156e2673ef0658ac246effb2a53111b6 |
| src/notifications/checks.mjs | eaa9f414723cb759680a37c911c1a31befd6ffd716dc64a46718c64f492008f8 |
| src/notifications/worker.mjs | 896d2e501fad647c7f1dbeb92aeaa7988b1bec9ae660a1d4e101e51eeb70f43b |
| docs/assets/dashboard/settings-view.mjs | 3943ae3f322be7be9f135c1db99ec390b339a78687c36e755f2423a2bc721a20 |

This comparison is bounded to those files. Later product-store migration changed the token-store setup used by acceptance checks; it does not change the public Test call below. No blanket claim that every caller or dependency is identical is made.

## Chrome repeated-Test path

`docs/assets/dashboard/settings-view.mjs:396–399` handles Test → `src/notifications/permission.mjs:93–108` checks granted permission and calls `currentRegistration()` → lines52–56 get the existing module worker registration → line108 calls `showNotification("Notifications of Agent M are on", { tag: "test" })`. No Chrome/Safari/Firefox-specific branch chooses different Test options. The iPhone-specific availability check concerns opening from the Home Screen; it does not change those options.

Chrome documents silent replacement when later notifications reuse a tag without opting into re-alerting. The Notifications standard defaults `renotify` to false. This matches the human's Chrome-only repeated-Test result; the observed Safari and Firefox presentation differs despite the same JavaScript input. A small candidate correction is `renotify: true` for the Test notification, retaining its tag and leaving normal acceptance-notification deduplication alone. No correction was applied or native verification inferred from documentation.

Primary sources read on2026-10-09: [Chrome notification behaviour](https://developer.chrome.com/blog/notifications), [Notifications standard, showing a notification](https://notifications.spec.whatwg.org/#showing-a-notification).
