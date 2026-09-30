# Open points of the architecture — what the published documentation settles

**MESSUNG** — 2026-09-30, macOS, `curl`, `gh api` and a web search, all sources read on 2026-09-30. It answers
the open measurement points named in `docs/architecture/` (ARC-009 to ARC-017) as far as documentation, issue
trackers and release notes settle them. SPEC §6 `BROWSER REACHABILITY IS MEASURED, NOT ASSUMED`; §11
`DUE DILIGENCE IS FETCHED, NOT RECALLED`.

## Method

- **Sources.** Vendor documentation first, fetched as raw Markdown where the site offers it
  (`docs.deno.com/….md`, `docs.github.com/api/article/body?pathname=…`, the GitLab and Microsoft Graph documentation
  sources, MDN's `mdn/content` and `mdn/browser-compat-data`) and otherwise as rendered HTML reduced to text;
  then release notes, issue trackers (GitHub issues through `gh api`, WebKit Bugzilla through its REST API) and,
  where no documentation exists, a vendor's forum with the vendor's own staff answering. Every quotation below is
  copied from the fetched text, not from a summary; each is shorter than fifteen words. Every source was read on
  2026-09-30; the date is not repeated in each line.
- **Negative findings.** "Not documented" is written only where the same search found a known positive in the
  same text (CLAUDE.md §6a.2). The pairs are named where they matter, for example: the word `Tray` occurs 12 times
  on Deno's tray page and 0 times on the `deno compile` reference.
- **No hands-on measurement was made.** Nothing was compiled, signed, installed, prompted or sent to an
  endpoint. Where the documentation does not settle a point, the section says **not documented — needs a
  hands-on measurement** and names that measurement.
- **What "confirmed" means in the table at the end.** The published sources say what the statement says. It does
  not mean the behaviour was observed here.

## 1. Deno tray and window

**Question.** Does `Deno.Tray` work in a plain `deno compile` binary or only with `deno desktop`; on which
desktops; what does `deno desktop` produce; is Windows on ARM a target; stable or not, and since which version?

**Findings.**

| Fact | Source | Quotation |
|---|---|---|
| The tray API is documented only in the *Desktop apps* section, for `deno desktop`. | <https://docs.deno.com/runtime/desktop/tray_and_dock.md> | "`deno desktop` is available starting in Deno v2.9.0." |
| The `deno compile` reference does not mention a tray (0 hits for `Tray`; 12 on the tray page). | <https://docs.deno.com/runtime/reference/cli/compile.md> | — |
| An open issue asks for exactly this, so today it is not offered. Issue #36778, opened 2026-09-06. | <https://github.com/denoland/deno/issues/36778> | "Allow `Deno.Tray` to be used in standalone binaries compiled via `deno compile`" |
| The desktop APIs are set up by the desktop runtime; an open pull request would move them to `Deno.desktop.Tray`. PR #35939, open. | <https://github.com/denoland/deno/pull/35939> | "`DESKTOP_JS` now creates a `Deno.desktop` namespace object" |
| A tray that cannot be created fails silently. | <https://docs.deno.com/runtime/desktop/tray_and_dock.md> | "the constructor's underlying `trayId` is `0` and subsequent calls are no-ops" |
| Platforms: macOS status item, Windows notification area, Linux AppIndicator/KStatusNotifierItem. | same page | "Requires a desktop environment that surfaces them. Most do" |
| GNOME is not named on that page (0 hits; `KStatusNotifierItem` 1 hit). | same page | — |
| KDE Plasma 6 on Wayland: no tray, `trayId` 0, Deno 2.9.5. Issue #36502, open, labels `bug`, `desktop`. | <https://github.com/denoland/deno/issues/36502> | "`Deno.Tray` appears to be completely non-functional on KDE Plasma 6 on Wayland" |
| Windows, default WebView2 backend: the tray does not react while the window is hidden; with `--backend cef` it does. Issue #36778, open. | <https://github.com/denoland/deno/issues/36778> | "The tray icon has **zero click or menu interactivity** on Windows" |
| macOS: tray missing when the `.app` was opened from Finder — fixed in Deno 2.9.1 (PR #35626, merged 2026-07-01). | <https://github.com/denoland/deno/releases/tag/v2.9.1> | "fix(desktop): show macOS tray icon in bundled .app launched via Finder" |
| Linux Wayland: the first `deno desktop` version was X11-only (PR #33441); 2.9.0 already switched to native Wayland. | <https://github.com/denoland/deno/releases/tag/v2.9.0> | "fix(desktop): use native Wayland instead of XWayland on Wayland systems" |
| macOS output: an `.app` directory (default) or a `.dmg`; the `.dmg` must be built on a Mac. | <https://docs.deno.com/runtime/desktop/distribution.md> | "the macOS `.dmg`, which shells out to `hdiutil`" |
| Windows output: a directory (default) or an `.msi`. | same page | "Default; directory with a launcher and support files." |
| The Windows directory's launcher is a batch file beside `denort.dll` (the overview page instead shows `.\main.exe`; the two pages disagree). | same page; <https://docs.deno.com/runtime/desktop/index.md> | "MyApp.bat               # launcher" |
| The `.msi` installs per machine. | distribution page | "installs the app per-machine under `%ProgramFiles%\<AppName>\`" |
| Linux output: a directory (default), `.AppImage`, `.deb`, `.rpm`. | same page | "`AppImage` is the most portable Linux format: one file, no install step" |
| `--compress` gives a self-extracting bundle, unpacked to a per-user directory at first launch. | same page | "unpacked to a per-user data directory on first launch" |
| `deno desktop` targets: five triples, none for Windows on ARM (`arm64` appears only for macOS and Linux). | same page | "macOS Intel, macOS arm64, Windows x86_64, Linux arm64, and Linux x86_64" |
| `deno compile` does target Windows on ARM. | <https://docs.deno.com/runtime/reference/cli/compile.md> | "`aarch64-pc-windows-msvc` (Windows on ARM) is supported starting in Deno 2.9.3." |
| Status: experimental; `deno desktop` has been available since v2.9.0 (released 2026-06-25). | <https://deno.com/blog/v2.9> | "deno desktop is experimental in 2.9." |
| The 2.9.0 notes list it as `feat:`, not under the `feat(unstable)` prefix used for flag-gated features; no `--unstable-*` flag is documented for it. | <https://github.com/denoland/deno/releases/tag/v2.9.0> | "feat: `deno desktop` subcommand (#33441)" |
| The build itself warns (output quoted in issue #36780, Deno 2.9.6). | <https://github.com/denoland/deno/issues/36780> | "⚠ deno desktop is experimental and subject to change" |

**Not documented — needs a hands-on measurement.** Whether `Deno.Tray` exists in a `deno compile` binary: the
documentation is silent, and issue #36778 suggests that it does not. Measurement: ARC-011 open measurement 1
unchanged — record `typeof Deno.Tray` in a `deno compile` binary (Deno 2.9.7). Tray on GNOME: the documentation
names no desktop environment. Measurement: start a `deno desktop` build on Ubuntu 24.04 GNOME and record
`tray.trayId`. The Windows launcher (`.bat` or `.exe`): build for `x86_64-pc-windows-msvc` and list the output
directory.

**Consequence for ARC-011 (decisions 2 and 4, open point "compile versus desktop") and MOD-bridge-app.** The tray
and the window exist only in the experimental `deno desktop` build. That build has no Windows-on-ARM target and
yields a per-machine `.msi` or a directory on Windows. A tray that fails is silent, so the bridge has to check
`trayId` and fall back to headless mode itself (ARC-011 decision 5). On Windows, the default WebView2 backend loses
the tray while the window is hidden, so a tray-only bridge needs the CEF backend or a visible window until #36778
is fixed. The open queue 2026-09-30h, entry 01 (the installer counts as the one file) is the SPEC side of the same
question.

## 2. Signing

**Question.** Can a `deno compile` or `deno desktop` output be signed with an Apple Developer ID and notarised,
and signed with Authenticode? How does SmartScreen treat a newly signed file?

**Findings — `deno compile`.**

| Fact | Source | Quotation |
|---|---|---|
| The historic problem: the program was appended to the runtime, so a signature failed. Issue #11154 (2021). | <https://github.com/denoland/deno/issues/11154> | "simply appends data to the deno binary (like a self-extracting ZIP)" |
| Fixed by PR #24604 (merged 2024-08-01, released in Deno 1.46.0 on 2024-08-22): the program is embedded as a section. | <https://github.com/denoland/deno/pull/24604> | "Mach-O segment on macOS and PE `RT_RCDATA` resource on Windows" |
| macOS: ad-hoc signature by default; a Developer ID signature is documented. | <https://docs.deno.com/runtime/reference/cli/compile.md> | `codesign -s "Developer ID Application: Your Name" ./main` |
| Windows: Authenticode signing is documented. | same page | `signtool sign /fd SHA256 main.exe` |
| Apple requires a Developer ID certificate, the Hardened Runtime and a secure timestamp for notarisation. | <https://developer.apple.com/documentation/security/notarizing-macos-software-before-distribution> | "Enable the Hardened Runtime capability for your app and command line targets" |
| A notarised standalone binary cannot carry its ticket; a disk image or package can. | <https://developer.apple.com/documentation/security/customizing-the-notarization-workflow> | "it's not currently possible to staple tickets to them." |
| Under the Hardened Runtime, V8 needs the JIT entitlement — stated for the `deno desktop` webview binary in open PR #36421. | <https://github.com/denoland/deno/pull/36421> | "`mmap(MAP_JIT)` is denied without `com.apple.security.cs.allow-jit`" |

**Findings — `deno desktop`.**

| Fact | Source | Quotation |
|---|---|---|
| macOS: with an identity in `deno.json`, the bundle is signed; notarisation is not done by Deno. | <https://docs.deno.com/runtime/desktop/distribution.md> | "**Notarization is still a separate step**." |
| Signed with Hardened Runtime and a secure timestamp. | same page | "the bundle is signed with Hardened Runtime and a secure timestamp" |
| Known problem: the bundle's signature was invalid on arrival and broke at first launch (Deno 2.9.4). Issue #36418, closed 2026-08-26. | <https://github.com/denoland/deno/issues/36418> | "macOS bundle signature is invalid on arrival, and self-invalidates on first launch" |
| The launch-time part was fixed in Deno 2.9.6 (PR #36574, merged 2026-08-26). | <https://github.com/denoland/deno/releases/tag/v2.9.6> | "fix(desktop): keep the macOS bundle signature valid unless an update is" |
| Still open: signing order, the JIT entitlement for the webview backend. PR #36421, open. | <https://github.com/denoland/deno/pull/36421> | "no `deno desktop` app could be distributed outside the App Store" |
| Still open with Deno 2.9.6 and ad-hoc signing: a signing error on `laufey_webview`. Issue #36780, open. | <https://github.com/denoland/deno/issues/36780> | "resource fork, Finder information, or similar detritus not allowed" |
| Windows: the output files are signed outside Deno. | distribution page | "sign the produced executables (the backend `.exe` and `denort.dll` …) externally" |
| Signing the `.msi` itself is not described on that page (the page mentions `signtool` once, for the executables). | same page | — |

**Findings — SmartScreen** (Microsoft Learn, page dated 2026-05-04, updated 2026-08-17).

| Fact | Source | Quotation |
|---|---|---|
| A freshly signed file is still flagged until reputation accumulates. | <https://learn.microsoft.com/en-us/windows/apps/package-and-deploy/smartscreen-reputation> | "app flagged as unrecognized until reputation accumulates" |
| EV no longer helps. | same page | "EV certificates no longer bypass SmartScreen." |
| Reputation takes time and volume. | same page | "it can take several weeks and hundreds of clean installs" |
| Reputation can carry over to new files signed by the same certificate. | same page | "potentially avoiding warnings on new files signed by the same trusted certificate" |
| Windows 11 Smart App Control blocks unsigned files without reputation. | same page | "Smart App Control will block execution of unsigned files" |
| Microsoft's recommended service is Artifact Signing (formerly Trusted Signing), from $9.99 per month. | same page | "Microsoft's recommended code signing service for non-Store distribution" |

**Not documented — needs a hands-on measurement.** Notarisation of a `deno compile` binary signed with the Hardened
Runtime: no Deno page describes it, and whether V8 starts without `allow-jit` is stated only for the desktop build.
Measurement: sign with `--options runtime`, with and without an entitlements file holding
`com.apple.security.cs.allow-jit`; submit with `xcrun notarytool submit`; start on a Mac that has never seen the
file; record `spctl -a -vv` and whether the program runs. The `.msi` of `deno desktop`: sign it with `signtool` and
check it with `signtool verify /pa`.

**Consequence for ARC-011 (decision 3, open measurement 3), ARC-017 (decision 3, open measurement) and
MOD-release.** Signing both outputs is documented. On macOS, a single notarised binary cannot carry its ticket, so
Gatekeeper must look it up online at first start; a `.dmg` can be stapled. On Windows, a new certificate — OV or EV —
will show the "unrecognized" warning until the file or the certificate has gathered reputation. The expectation in
ARC-011 measurement 3 ("whether SmartScreen accepts it with a fresh OV certificate") is answered by the
documentation: at first it does not. Buying EV to avoid the warning is no longer justified.

## 3. Browser to loopback

**Question.** Can a page on `https://<owner>.github.io` call `http://127.0.0.1:<port>` and `http://localhost:<port>`
with `fetch` today — Chrome, Edge, Firefox, Safari — and is loopback a secure context, exempt from mixed-content
blocking?

**Findings.**

| Browser | Fact | Source | Quotation |
|---|---|---|---|
| Chrome | Local Network Access (LNA) replaces Private Network Access (PNA). | <https://developer.chrome.com/blog/local-network-access> | "Local Network Access replaces that effort, after PNA was put on hold" |
| Chrome | On by default from 142 (blog update of 2025-09-29; the adoption guide was updated 2026-05-18). | <https://docs.google.com/document/d/1QQkqehw8umtAgz5z0um7THx-aoU251p705FbIQjDuGs/edit> | "Local Network Access restrictions will start shipping by default in Chrome 142." |
| Chrome | Loopback is prompted, not exempt. | same guide | "triggered when a connection has been made to … localhost." |
| Chrome | Loopback is defined by address, so `127.0.0.1` and `localhost` both count. | blog | "such as the IPv4 loopback prefix ( 127.0.0.0/8 )" |
| Chrome | Since 145, loopback has its own permission, `loopback-network`. | guide | "These permissions work as of Chrome 145." |
| Chrome | The prompt is shown once; the decision is kept. | guide | "the user will not see another permission prompt." |
| Chrome | Only a secure context may ask for the permission. | blog | "The ability to request this permission is restricted to secure contexts." |
| Chrome | Loopback is not mixed content. | guide | "localhost is considered a secure origin by the mixed content specification" |
| Chrome | `fetch` can mark a request for loopback. | guide | "will work if domainB.example resolves to the loopback address 127.0.0.1" (option `targetAddressSpace: 'loopback'`) |
| Chrome | WebSockets fall under LNA from 147. | guide | "Starting in Chrome 147, LNA restrictions will apply to:" |
| Chrome | Mixed content from `http://127.0.0.1` and `http://localhost` is allowed since version ≤ 79. | <https://github.com/mdn/browser-compat-data/blob/main/http/mixed-content.json> (`allow_loopback_url`, `allow_localhost_url`) | "Allow mixed content from loopback address (`http://127.0.0.1/`)." |
| Edge | The same LNA prompt, on by default from Edge 143 (page updated 2026-03-09). | <https://learn.microsoft.com/en-us/deployedge/ms-edge-local-network-access> | "start shipping by default in Microsoft Edge 143" |
| Edge | Loopback is prompted as in Chrome. | same page | "triggered when a connection is made to … localhost." |
| Edge | Mixed-content data mirrors Chrome. | browser-compat-data, as above | `"edge": "mirror"` |
| Firefox | LNA on by default since Firefox 153 (2026-07-21), including this device. | <https://www.firefox.com/en-US/firefox/153.0/releasenotes/> | "or to apps and services on your device." |
| Firefox | Mixed content from `127.0.0.1` allowed since 55, from `localhost` since 84. | browser-compat-data, as above | `allow_loopback_url` firefox `"55"`, `allow_localhost_url` firefox `"84"` |
| Safari | Mixed content from `127.0.0.1` and from `localhost` is **not** allowed. | browser-compat-data, as above | `allow_loopback_url` safari `"version_added": false` |
| Safari | MDN: Safari blocks all mixed content by default. | <https://github.com/mdn/content/blob/main/files/en-us/web/security/defenses/mixed_content/index.md> | "This is the default for Safari" |
| Safari | WebKit bug 171934 (opened 2017) is still open; last changed 2026-08-19. | <https://bugs.webkit.org/show_bug.cgi?id=171934> | "Don't treat loopback addresses (127.0.0.0/8, ::1/128, localhost, .localhost) as mixed content" — status NEW |
| Safari | WebKit calls localhost a secure origin, but still blocks mixed content from it. Bug 281149, REOPENED. | <https://bugs.webkit.org/show_bug.cgi?id=281149> | "window.isSecureOrigin is true, but you can't set secure cookies" |
| All | Loopback origins are "potentially trustworthy", so a page on them is a secure context. | <https://github.com/mdn/content/blob/main/files/en-us/web/security/defenses/secure_contexts/index.md> | "A host value of `127.0.0.0/8` or `::1/128`" |

**Answer per browser, from the documentation.** Chrome ≥ 142 and Edge ≥ 143 treat `http://127.0.0.1` and
`http://localhost` alike. There is no mixed-content block, one permission prompt per site, and the answer is
remembered. Firefox ≥ 153 has the same model. Safari blocks both addresses as mixed content from an HTTPS page, and
the WebKit bug that would change that is open. The earlier PNA preflight header is irrelevant to Chrome now; it
costs nothing to answer it.

**Not documented — needs a hands-on measurement.** Safari: the compatibility data says "blocked", but it names no
Safari version. Measurement: ARC-012 open measurement 1 on Safari 26 on macOS — `fetch("http://127.0.0.1:<port>/hello")`
from `https://akmaier.github.io`, recorded with the console message. The other browsers: the documentation settles
the behaviour; measurement 1 stays the release check that `BROWSER REACHABILITY IS MEASURED, NOT ASSUMED`
requires, including what the prompt looks like with an `Authorization` header and a JSON body.

**Consequence for ARC-012 (context, decisions 2 and 6, alternatives, open measurements 1 and 2) and
MOD-bridge-server.** The bridge's HTTP-on-loopback design works in Chrome, Edge and Firefox after one prompt. In
Safari, according to the compatibility data, the Pages dashboard cannot reach the bridge. ARC-012's rejection of
HTTPS on loopback rests on "the mixed-content exemptions", and those do not exist in Safari; that rejection needs the
PO's decision once the Safari measurement is in. The reason for "no WebSockets" has shifted: WebSockets are now
covered by the same prompt (Chrome 147, Firefox 154), not left out of it. Polling stays the simpler choice. The
`localhost` versus `127.0.0.1` question (measurement 2) is answered by the documentation: both are loopback in every
source above.

## 4. OpenSSH on Windows

**Question.** Is `ssh.exe` installed by default on Windows 10 and 11, and does adding it need an administrator?

**Findings.**

| Fact | Source | Quotation |
|---|---|---|
| Windows 10 from build 1809: not installed. | <https://learn.microsoft.com/en-us/windows-server/administration/openssh/openssh-overview> (updated 2025-02-20) | "Windows 10 build 1809 + Not installed, install and enable using optional features" |
| Windows 11 and Windows 10: not installed by default; only Windows Server 2025 has it. | <https://learn.microsoft.com/en-us/troubleshoot/windows-server/system-management-components/cant-install-openssh-features> (updated 2026-02-12) | "this situation isn't true for older versions of Windows Server or for Windows 11" |
| It is a Feature on Demand since Windows 10 version 1709. | <https://learn.microsoft.com/en-us/windows-hardware/manufacture/desktop/features-on-demand-non-language-fod> | "Availability : Windows 10, version 1709 and later" |
| Installing needs an administrator. | <https://learn.microsoft.com/en-us/windows-server/administration/openssh/openssh_install_firstuse> (updated 2025-09-04) | "An account that is a member of the built-in Administrators group." |
| The PowerShell route is run elevated. | same page | "Run PowerShell as an Administrator." |

**Answer.** Settled by documentation. The OpenSSH client is not installed by default on Windows 10 or 11, and adding
it needs an administrator. The documentation speaks of Windows 10 and 11 as a whole and names no consumer image.
ARC-013's check on a fresh Windows 11 installation would confirm it; it is not needed to decide.

**Consequence for ARC-013 (decision 5, open measurement, due-diligence row) and MOD-bridge-tunnel.** The concern
in ARC-013 holds. A non-expert on Windows has to add a Windows feature with administrator rights before the bridge
can open tunnels. The due-diligence row says the Microsoft table does not list Windows 11; the troubleshooting page
does name it. The PO's choice named in ARC-013 is now due: guide the installation, or use `ssh2` after measuring it
under `deno compile`.

## 5. Mail libraries under Deno

**Question.** Do imapflow and nodemailer work under Deno, and inside a `deno compile` binary?

**Findings.**

| Fact | Source | Quotation |
|---|---|---|
| Deno lists `node:net` and `node:tls` as partially supported (page modified 2026-07-30). | <https://docs.deno.com/runtime/reference/node_apis/> | "Partially supported modules … node:net … node:tls" |
| The documented gaps of those two modules. | same page | "createSecurePair : This symbol is currently not supported." |
| imapflow's maintainer, 2024-11-04 (issue #230): not supported. | <https://github.com/postalsys/imapflow/issues/230> | "Deno and Bun are not supported. It might work but probably does not." |
| The same maintainer, 2025-01-27. | same issue | "No plans to support anything else than Node." |
| imapflow README example fails under Deno with a zlib error; closed 2026-01-09 (issue #329). | <https://github.com/postalsys/imapflow/issues/329> | "All my email modules are Node only." |
| Newest word, 2026-09-25 (issue #401): the reader loop was reworked in 2.0.0 for runtimes like Deno, but Deno is not tested. | <https://github.com/postalsys/imapflow/issues/401> | "Deno and edge runtimes are not in the test matrix" |
| In the same issue a user reports imapflow 1.4.7 fetching a 985 083-byte message under Deno 2.9.6 (`deno run`). | same issue | "deno 2.9.6 + imapflow, same fetch — 985 083 bytes in about 200 ms" |
| nodemailer's maintainer (issue #1331, 2021): no Deno work planned. | <https://github.com/nodemailer/nodemailer/issues/1331> | "There are no plans to migrate or change anything in this regard." |
| nodemailer on port 587 (STARTTLS) failed under Deno 2.0.4, fixed later. Deno issue #26735, closed 2024-12-15. | <https://github.com/denoland/deno/issues/26735> | "This is fixed on canary." |

**Not documented — needs a hands-on measurement.** No source says anything about either library inside a
`deno compile` binary. Measurement: ARC-014 open measurement 1 unchanged. Compile a program with imapflow ≥ 2.0.7
and nodemailer; read a mailbox of more than 1 MB over implicit TLS and over STARTTLS; send over 465 and 587 against
a local test server; record each result.

**Consequence for ARC-014 (decision 2, due diligence, open measurement 1) and MOD-bridge-mail.** Both libraries are
maintained for Node only, and their maintainer says so; a working Deno run is a user's report, not a promise. The
ARC-014 fallback — a small IMAP client over `Deno.connectTls` — gains weight. In issue #401, raw
`Deno.connectTls` fetched the same message in 379 ms in a runtime where imapflow hung.

## 6. Mail sign-in from a static site

**Question.** Can Microsoft's code flow with PKCE run from a GitHub Pages origin without a server, with which
refresh-token lifetime; which Graph scopes; can a browser-only app reach Gmail other than by the implicit or token
flow; does the token model give refresh tokens; which Gmail scopes, and are they restricted?

**Findings — Microsoft** (<https://learn.microsoft.com/en-us/entra/identity-platform/v2-oauth2-auth-code-flow>,
updated 2026-01-09).

| Fact | Quotation |
|---|---|
| A redirect URI of type `spa` enables the flow with CORS on the token endpoint; no client secret or server is involved. | "supports auth code flow with PKCE and cross-origin resource sharing (CORS)" |
| Tokens for single-page apps last a day. | "Single page apps get a token with a 24-hour lifetime" |
| The refresh token too, and it is not extended by refreshing. | "the refresh token expires after 24 hours." |
| The daily renewal needs a pop-up or page load where third-party cookies are blocked. | "in browsers without third-party cookies, such as Safari." |

**Findings — Microsoft Graph delegated permissions** (permission tables in
<https://github.com/microsoftgraph/microsoft-graph-docs-contrib>, `api-reference/v1.0/includes/permissions/`; the
descriptions from <https://learn.microsoft.com/en-us/graph/permissions-reference>).

| Need | Endpoint | Least privileged | Quotation |
|---|---|---|---|
| list mails with headers | `GET /me/messages` | `Mail.ReadBasic` | "except body, previewBody, attachments and any extended properties" |
| read the text | same | `Mail.Read` (listed as higher privileged) | "Allows the app to read the signed-in user's mailbox." |
| store a reply draft | `POST /me/messages/{id}/createReply` | `Mail.ReadWrite` | "create, read, update, and delete email in user mailboxes" |
| send | `POST /me/messages/{id}/send`, `POST /me/sendMail` | `Mail.Send` | "Allows the app to send mail as users in the organization." |
| refresh token | — | `offline_access` | "Maintain access to data you have given it access to" |

All three `Mail.*` delegated permissions are marked "AdminConsentRequired … No" in the reference; a tenant's own
consent policy may still restrict them.

**Findings — Google.**

| Fact | Source | Quotation |
|---|---|---|
| The code flow needs a server. | <https://developers.google.com/identity/oauth2/web/guides/choose-authorization-model> (updated 2026-05-26) | "Yes, for endpoint hosting and storage." |
| The implicit (token) flow gives no refresh token. | same page | "Refresh token issued No Yes" (implicit, code) |
| Each new token needs a click. | same page | "A user gesture such as button press or clicking on a link is required" |
| Google Identity Services' token model: short-lived tokens, new one on a click. | <https://developers.google.com/identity/oauth2/web/guides/use-token-model> | "obtain a new token by calling requestAccessToken() from a user-driven event" |
| The lifetime is given per token (`expires_in`); the documented example is 3600 s. | <https://developers.google.com/identity/protocols/oauth2/javascript-implicit-flow> (updated 2026-09-14) | "`expires_in=3600`" |
| Implementing the implicit flow by hand is discouraged. | same page | "strongly discouraged due to security vulnerabilities." |
| Google recommends its library's code model instead, which needs a server for the exchange. | same page | "based on the more secure authorization code flow with PKCE." |

**Findings — Gmail scopes** (<https://developers.google.com/workspace/gmail/api/auth/scopes>, updated 2026-09-10).

| Need | Scope | Class | Quotation |
|---|---|---|---|
| read | `https://www.googleapis.com/auth/gmail.readonly` | restricted | "View your email messages and settings." |
| headers only (`Message-ID`) | `…/gmail.metadata` | restricted | "such as labels and headers, but not the email body." |
| drafts and send | `…/gmail.compose` | restricted | "Manage drafts and send emails." |
| send only | `…/gmail.send` | sensitive | "Send email on your behalf." |
| what restricted means | — | — | "require restricted scope OAuth App Verification" |
| when an assessment is required | — | — | "If you store restricted scope data on servers (or transmit)" |

**Answer.** Microsoft is settled by documentation. The flow runs from any `spa` redirect URI without a server, and
the person signs in again every 24 hours. For Gmail, a browser-only app has only the implicit/token route: no refresh
token, a click per new token. Google documents two ways to do it. Its library's token model loads Google's script,
which ARC-014 rejects. The hand-written implicit flow is the one ARC-014 chose, and Google "strongly discourages"
it. Every Gmail read scope is restricted and requires Google's restricted-scope verification for a public app.

**Not documented — needs a hands-on measurement.** Whether a Microsoft 365 tenant (FAU's) lets a user consent to
`Mail.Read`, `Mail.ReadWrite` and `Mail.Send` for an unverified `spa` app. Whether Gmail's hand-written implicit
flow still completes from `https://akmaier.github.io` (ARC-014 open measurement 2). Whether Agent M, which sends
report data to model endpoints, "transmits" restricted-scope data in Google's sense, and so needs the security
assessment. That is a question for Google's verification team, not a measurement.

**Consequence for ARC-014 (decision 1, open point "scopes", open measurement 2) and MOD-mail-api.** The scope list
ARC-014 left open is: Graph `Mail.Read`, `Mail.ReadWrite`, `Mail.Send`, `offline_access`; Gmail `gmail.readonly` and
`gmail.compose` (or `gmail.send` for sending alone). Neither provider offers a permission that is exactly "read,
draft, send". Graph's draft permission also allows update and delete. Gmail's read scope also shows settings.
`THE MAIL SIGN-IN ASKS ONLY FOR READING, DRAFTING AND SENDING` can therefore be met only as "the narrowest documented
scopes", which is for the PO to decide. The Gmail route needs a PO decision between Google's discouraged hand-written
implicit flow and Google's runtime-loaded library.

## 7. Model endpoints from the browser

**Question.** Which endpoints answer a cross-origin call from a web page?

**Findings.**

| Endpoint | Fact | Source | Quotation |
|---|---|---|---|
| Anthropic | The SDK allows browsers only on request. | <https://platform.claude.com/docs/en/cli-sdks-libraries/sdks/typescript.md> | "Enable browser support by explicitly setting `dangerouslyAllowBrowser` to `true`." |
| Anthropic | With that option, the SDK sends the header ARC-009 names. | <https://github.com/anthropics/anthropic-sdk-typescript/blob/main/src/client.ts> | `'anthropic-dangerous-direct-browser-access': 'true'` |
| Anthropic | The header's name appears in neither the TypeScript SDK page nor the API overview of the platform documentation (0 hits; `dangerouslyAllowBrowser` 3 hits). | <https://platform.claude.com/docs/en/api/overview.md> | — |
| OpenAI | The SDK allows browsers only on request and sends no extra header (client source read). | <https://github.com/openai/openai-node/blob/master/README.md> | "Web browsers: disabled by default to avoid exposing your secret API credentials." |
| OpenAI | No CORS statement found in OpenAI's documentation; on 2025-10-15, OpenAI staff called missing CORS answers a bug. | <https://community.openai.com/t/chat-completions-api-endpoint-down-blocked-any-web-browser-request/1362527> | "Yes, I can confirm this is a bug" |
| LiteLLM proxy | All origins by default; configurable. | <https://docs.litellm.ai/docs/proxy/config_settings> | "Defaults to * (all origins) when not set" (`LITELLM_CORS_ORIGINS`) |
| vLLM OpenAI server | All origins by default. | <https://docs.vllm.ai/en/latest/cli/serve/> | "--allowed-origins ¶ Allowed origins. Default: ['*']" |
| Ollama | Only local origins by default; a Pages origin must be added. | <https://raw.githubusercontent.com/ollama/ollama/main/docs/faq.mdx> | "Ollama allows cross-origin requests from `127.0.0.1` and `0.0.0.0` by default." |
| Ollama | The setting to add it. | same file | "Additional origins can be configured with `OLLAMA_ORIGINS`." |

**Not documented — needs a hands-on measurement.** The actual CORS answers of `api.anthropic.com` (with and without
the header) and of `api.openai.com`. Neither vendor documents its server behaviour; the SDKs only imply it.
Measurement: ARC-009 open measurement, a preflight from `Origin: https://akmaier.github.io` to each `/v1/…` endpoint
in the form of `2026-09-30_gitlab-cors.md`, and one real browser call with a test key.

**Consequence for ARC-009 (decision 1, open measurement "endpoint CORS") and MOD-participant-endpoint.** The header
and the two request shapes are confirmed as far as the SDK source goes. For self-hosted gateways, LiteLLM and vLLM
answer any origin unless configured otherwise. Ollama needs `OLLAMA_ORIGINS=https://<owner>.github.io`, and a
local Ollama is a loopback destination, so §3 applies to it as well: one prompt in Chrome, Edge and Firefox, and
blocked in Safari. `AN UNSUPPORTED ENDPOINT SAYS SO` can name both causes.

## 8. Automatic CI runs from jobs

**Question.** Do events created with `GITHUB_TOKEN` start workflow runs; what is the remedy; which permissions does
a fine-grained token need; can the dashboard use the same secret; and on GitLab, what can `CI_JOB_TOKEN` do?

**Findings — GitHub.** From
<https://docs.github.com/en/actions/concepts/security/github_token> (section *When `GITHUB_TOKEN` triggers workflow
runs*) and, word for word the same, section *Triggering a workflow from a workflow* of
<https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/trigger-a-workflow>:

| Documented behaviour | Quotation |
|---|---|
| The rule | "events triggered by the `GITHUB_TOKEN` will not create a new workflow run" |
| Exception 1 | "`workflow_dispatch` and `repository_dispatch` events always create workflow runs." |
| Exception 2: pull requests opened or updated by the workflow | "creates workflow runs in an **approval-required** state" |
| Which pull-request events | "with the `opened`, `synchronize`, or `reopened` activity types" |
| Who releases them | "a user with write access to the repository can start the runs" |
| How | "by selecting **Approve workflows to run**" |
| Other pull-request events | "Other `pull_request` activity types … do not create workflow runs." |
| Example: a push | "a new workflow will not run even when the repository contains a workflow" |
| Pages | "do not trigger a GitHub Pages build." |

| Documented remedy | Quotation |
|---|---|
| Use another token | "use a GitHub App installation access token or a personal access token" |
| It lifts the approval step | "lets `pull_request` workflows run automatically (without the approval prompt described above)" |
| Other events then trigger normally (label example) | "will run once this step is performed." |
| Stored as a secret — App | "store the app ID and private key as secrets." |
| Stored as a secret — personal token | "create a personal access token and store it as a secret." |
| The App route mints its token in the workflow (`actions/create-github-app-token`); the token lasts one hour. | "The installation access token will expire after 1 hour." |

Sources for the last row:
<https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/making-authenticated-api-requests-with-a-github-app-in-a-github-actions-workflow>,
<https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/generating-an-installation-access-token-for-a-github-app>.

**Fine-grained token permissions** (<https://docs.github.com/en/rest/authentication/permissions-required-for-fine-grained-personal-access-tokens>).

| Action | Endpoint | Permission |
|---|---|---|
| push a commit through the git data API | `POST /repos/{owner}/{repo}/git/commits`, `PATCH /repos/{owner}/{repo}/git/refs/{ref}` | *Contents* write |
| open a pull request | `POST /repos/{owner}/{repo}/pulls` | *Pull requests* write |
| merge a pull request | `PUT /repos/{owner}/{repo}/pulls/{pull_number}/merge` | *Contents* write |
| a commit that changes `.github/workflows/` | stated for the releases endpoint: <https://docs.github.com/en/rest/releases/releases> | *Workflows* write — "also need the "Workflows" repository permission (write)" |
| `GITHUB_TOKEN` and workflow files | same page | "The GITHUB_TOKEN available to GitHub Actions cannot be authorized for this" |

**Can the dashboard use the same secret?** An Actions secret cannot be read back. The secrets API lists secrets
"without revealing their encrypted values"
(<https://docs.github.com/en/rest/actions/secrets>). The dashboard can use the same token only if the person stores
its value twice: once in the browser and once as the secret. Nothing in the documentation read forbids that. A
GitHub App token needs the App's private key to be minted, so it has no place in a server-less dashboard.

**Findings — GitLab** (<https://docs.gitlab.com/ci/jobs/ci_job_token/>, source file last changed 2026-09-21).

| Fact | Quotation |
|---|---|
| The job token can push only if the project allows it; off by default. | "This setting is turned off by default." |
| Since when | "Generally available in GitLab 18.4." (history of *Allow Git push requests to your project repository*) |
| A job-token push starts no pipeline. | "When you use a job token to push to the project, no CI/CD pipelines are triggered." |
| Merge requests: read only. | "Can access the `GET /projects/:id/merge_requests` and …" |
| The fine-grained job-token permissions (beta since 18.0) also list only reading for merge requests. | <https://docs.gitlab.com/ci/jobs/fine_grained_permissions/>: "`GET /projects/:id/merge_requests` · `READ_MERGE_REQUESTS` · Read" |
| The documented remedy, from <https://docs.gitlab.com/security/tokens/> | "Avoid using personal access tokens as CI/CD variables wherever possible" |
| Its order of preference | "Job tokens (lowest access scope)", then "Project tokens", then "Group tokens" |
| How to store it | "should be protected, masked, and hidden." |

**Not documented — needs a hands-on measurement.** Whether a push or merge request made with a GitLab **project
access token** starts pipelines as usual: GitLab documents the exception only for the job token, and the project
access token pages say nothing about pipelines (0 hits for "pipeline" in `project_access_tokens.md`). Measurement:
push and open a merge request with a project access token on a test project, and record the pipelines. The same for
GitHub's *Workflows* permission on a `git push` or ref update that changes `.github/workflows/`: the documentation
read states it only for the releases endpoint. Measurement: update a workflow file through the git data API with a
fine-grained token without *Workflows*, and record the answer. Also which GitLab version runs on
`gitlab.rrze.fau.de` and `gitos.rrze.fau.de` (job-token push needs 18.4).

**Consequence for ARC-010 (consequence "GitHub does not chain `GITHUB_TOKEN` events"), ARC-015 (decisions 2 and 4),
MOD-participant-ci and MOD-ci-generator.** ARC-010's quotation and its choice (a), continuing a run by
`workflow_dispatch`, are confirmed by the documentation. For (b), the documented remedy is a GitHub App installation
token or a personal access token, stored as Actions secrets. With either, pull-request runs start without approval
and other events trigger workflows normally. A token for CI jobs that open and merge pull requests needs *Contents*
write and *Pull requests* write, and *Workflows* write where it writes CI files (`A RUN SETS UP CI BEFORE IT
IMPLEMENTS`). On GitLab, the job token cannot open a merge request, and its push starts no pipeline. A GitLab run
therefore continues through a pipeline trigger or a project access token held as a masked, protected CI/CD
variable. This is the PO's next decision.

## Statements of the architecture against these findings

*Confirmed*: the sources say what the statement says. *Contradicted*: a source says otherwise. *Open*: the sources
do not settle it. The open measurement that settles it is named in the section above.

| File | Section | Statement | Finding |
|---|---|---|---|
| ARC-009 | Decision 1 | Anthropic calls carry `anthropic-dangerous-direct-browser-access: true`, as the SDK sets it | **confirmed** (§7, SDK source); the server's CORS answer **open** |
| ARC-009 | Consequences, open measurement "endpoint CORS" | which endpoints answer a Pages origin | **open** for api.anthropic.com and api.openai.com; LiteLLM and vLLM **confirmed** (all origins by default); Ollama needs `OLLAMA_ORIGINS` (§7) |
| ARC-010 | Consequences, "GitHub does not chain `GITHUB_TOKEN` events" | quotation and the approval-required state for pull requests | **confirmed** word for word (§8) |
| ARC-010 | same, choice (a) | the engine continues by `workflow_dispatch` | **confirmed**: dispatch events "always create workflow runs" |
| ARC-010 | same, choice (b) | "a different credential named as a CI secret" | **confirmed** as GitHub's documented remedy (App installation token or personal access token); which one is **open** for the PO |
| ARC-010 | Consequences | engine workflow needs `contents: write` and `actions: write` | **confirmed** for dispatch; a CI job that opens pull requests needs *Pull requests* write, not named there (§8) |
| ARC-011 | Decision 2 | targets include `aarch64-pc-windows-msvc`, from Deno 2.9.3 | **confirmed** for `deno compile`; **contradicted** for `deno desktop`, which has no Windows-on-ARM target (§1) |
| ARC-011 | Decision 3 | signing with `codesign` and `signtool` after the build, as Deno documents | **confirmed** (§2); notarising a Hardened-Runtime `deno compile` binary **open** |
| ARC-011 | Decision 4 | `Deno.Tray` and the window with `deno desktop` from 2.9.0 | **confirmed**, and documented as experimental; open PR #35939 would rename it `Deno.desktop.Tray` (§1) |
| ARC-011 | Consequences, "compile versus desktop" | `deno desktop` outputs per platform | **confirmed**; in addition, the Windows directory's launcher is a `.bat` and the `.msi` installs per machine (§1) |
| ARC-011 | Consequences, open measurement 1 | tray in a `deno compile` binary undocumented | **confirmed** undocumented; open issue #36778 asks for it; stays **open** |
| ARC-011 | Consequences, open measurement 2 | KDE issue; GNOME and KDE to be measured | **confirmed** (#36502 open); GNOME **open**; a further open Windows issue (#36778, WebView2 with hidden window) |
| ARC-011 | Consequences, open measurement 3 | notarisation and SmartScreen with a fresh OV certificate | signing **confirmed** possible; a bare binary cannot be stapled; SmartScreen warns at first even with OV or EV — the hope of "no warning" **contradicted** (§2) |
| ARC-011 | Alternatives, `Deno.autoUpdate()` | Windows auto-update not supported | **confirmed** (PR #33441, issue #35269: "Auto-updater is unix-only") |
| ARC-012 | Context | LNA prompt for loopback, opt-in from 138, launch in 142 | **confirmed**; since Chrome 145 a separate `loopback-network` permission (§3) |
| ARC-012 | Decision 2 | no WebSockets, because LNA listed them as a limitation | decision **confirmed**; its reason is outdated — WebSockets are gated from Chrome 147 and Firefox 154 (§3) |
| ARC-012 | Decision 6 | answer `Access-Control-Allow-Private-Network` when asked | harmless; PNA is "put on hold" in Chrome (§3) |
| ARC-012 | Alternatives, HTTPS on loopback rejected | loopback HTTP fits "the mixed-content exemptions" | **contradicted** for Safari: no exemption for `127.0.0.1` or `localhost` (§3) |
| ARC-012 | Consequences, open measurement 1 | reachability per browser | Chrome, Edge, Firefox **confirmed** by documentation; Safari documented as blocked, **open** for a version-specific check |
| ARC-012 | Consequences, open measurement 2 | `localhost` versus `127.0.0.1` | **confirmed** alike in every source (§3) |
| ARC-013 | Decision 5 | the bridge guides the installation where OpenSSH is missing | **confirmed** as needed: not installed by default on Windows 10 or 11 (§4) |
| ARC-013 | Consequences, open measurement | is `ssh.exe` present on a fresh Windows 11 | **settled by documentation**: no; adding it needs an administrator (§4) |
| ARC-013 | Due diligence, OpenSSH row | "the Microsoft table does not list Windows 11" | true of that table; another Microsoft page names Windows 11 as not installed (§4) |
| ARC-014 | Decision 1, Microsoft | code flow with PKCE, `spa` redirect, CORS, 24-hour tokens | **confirmed** (§6) |
| ARC-014 | Decision 1, Google | Gmail through the implicit flow without a library | documented, but Google "strongly discourages" it; the only other browser-only route is Google's library, which ARC-014 rejects — **open** for the PO (§6) |
| ARC-014 | Decision 2 | imapflow and nodemailer through Deno's npm compatibility | **open**; both maintainers support Node only (§5) |
| ARC-014 | Consequences, open measurement 1 | imapflow and nodemailer under `deno compile` | **open** — no source (§5) |
| ARC-014 | Consequences, open measurement 2 | token endpoints from the Pages origin | Microsoft **confirmed** by documentation; Gmail implicit flow and tenant consent **open** (§6) |
| ARC-014 | Consequences, open point "scopes" | scope names not yet recorded | **answered**: Graph `Mail.Read`, `Mail.ReadWrite`, `Mail.Send`, `offline_access`; Gmail `gmail.readonly`, `gmail.compose` (restricted), `gmail.send` (sensitive) (§6) |
| ARC-014 | Consequences | Gmail asks to sign in again when the token expires | **confirmed** ("A user gesture … is required") |
| ARC-017 | Decision 3 | signing with `codesign`/notarisation and `signtool` | **confirmed** (§2); which command proves notarisation of a bare binary **open** — it cannot be stapled |
| ARC-017 | Consequences, open measurement | notarisation accepted, Windows shows the publisher without a warning | publisher name shown **confirmed**; "without a warning" **contradicted** for a new certificate (§2) |
| ARC-015 | Decision 2, GitLab | the engine and job workflows on GitLab | **open**: `CI_JOB_TOKEN` pushes start no pipeline and cannot open merge requests (§8) |
| ARC-015 | Decision 4 | result records committed to `test-results` by a CI step | on GitLab, a job-token push needs the project setting (GitLab ≥ 18.4) — **open** per server (§8) |
| MOD-bridge-app | Interfaces | tray icon and window | as ARC-011 decision 4; must check `trayId !== 0` (§1) |
| MOD-bridge-mail | Responsibility | IMAP and SMTP through the chosen libraries | as ARC-014 decision 2 — **open** |
| MOD-bridge-server | `serve` | CORS for the paired origin on loopback | works after one prompt in Chrome, Edge, Firefox; Safari **open**/blocked (§3) |
| MOD-bridge-tunnel | `superviseTunnel` | runs the system `ssh` | on Windows needs OpenSSH added by an administrator (§4) |
| MOD-mail-api | `signIn` | Microsoft PKCE `spa`; Gmail implicit flow in a popup | Microsoft **confirmed**; Gmail **open** as for ARC-014 (§6) |
| MOD-participant-ci | `driver` | dispatches the job workflow | dispatch **confirmed**; pull requests opened by the job need a token other than `GITHUB_TOKEN` to run CI without approval (§8) |
| MOD-participant-endpoint | `driver` | Anthropic header, OpenAI-compatible format | as ARC-009 (§7) |
| MOD-release | `verifyFeed`, signing gate | platform signatures verified before publishing | as ARC-017 (§2) |

## SPEC requirements these findings bear on (not changed here)

- `ONE GITHUB TOKEN SERVES EVERY FEATURE` names *Contents*, *Issues*, *Actions*, *Metadata*. A token that also opens
  pull requests or writes CI files needs *Pull requests* and *Workflows* (§8).
- `THE MAIL SIGN-IN ASKS ONLY FOR READING, DRAFTING AND SENDING`: neither provider documents a permission that
  narrow (§6).
- `THE BRIDGE IS SIGNED BY ITS PUBLISHER`: its occasion says an unsigned download is warned about. A signed one is
  warned about as well until it has reputation (§2).
- `THE BRIDGE IS ONE FILE PER PLATFORM`: open queue 2026-09-30h, entry 01, awaits acceptance (§1).
