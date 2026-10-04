# The headers GitHub Pages sent with the files requested

**MESSUNG** — 2026-10-04, macOS 26.6.2, `curl 8.7.1`. Two runs: run 1 at 22:02 UTC, run 2 at 22:44 UTC. It records which
headers GitHub Pages sent with the files that were requested, for the panel in which the settings page shows another page of
the instance's Pages site (ARC-026 decision 10; UC-042 3).

## Method

Each run asks for every address with `GET`. It prints the status line, the server line, and every header line that names
`X-Frame-Options` or `Content-Security-Policy`, case-insensitively; the first command of run 1 also prints a line that
names `cross-origin`, and its second command and run 2 a `Location` line. No token is sent, and no body is kept. Run 2's
time is the clock read before and after it (22:44:02 and 22:44:06 UTC); run 1's is the time its output file was last
written (22:02:16 UTC).

Run 1, 2026-10-04, 22:02 UTC:

```
for u in https://octocat.github.io/Spoon-Knife/ https://pages.github.com/; do echo "== $u"; curl -sS -m 30 -D - -o /dev/null "$u" | tr -d '\r' | grep -i '^HTTP\|x-frame-options\|content-security-policy\|^server\|cross-origin' ; done
for u in https://octocat.github.io/ https://akmaier.github.io/ https://akmaier.github.io/agent-m/ https://docs.github.com/; do echo "== $u"; curl -sS -m 30 -D - -o /dev/null "$u" | tr -d '\r' | grep -i '^HTTP\|x-frame-options\|content-security-policy\|^server\|^location' ; done
```

Run 2, 2026-10-04, 22:44 UTC:

```
for u in https://akmaier.github.io/agent-m/ https://akmaier.github.io/agent-m/SPEC.html https://akmaier.github.io/agent-m/PLAN.html https://akmaier.github.io/agent-m/docs/ https://akmaier.github.io/agent-m/docs/index.html https://akmaier.github.io/agent-m/library.html https://docs.github.com/; do echo "== $u"; curl -sS -m 30 -D - -o /dev/null "$u" | tr -d '\r' | grep -i '^HTTP\|^server\|x-frame-options\|content-security-policy\|^location'; done
```

The addresses fall into four groups:
- **The instance's own site** (run 2). `https://akmaier.github.io/agent-m/` is an Agent M instance's site. Its root,
  `SPEC.html`, `PLAN.html` and the review page under `docs/` are files it serves. `library.html` is a page ARC-026 names
  that the site does not serve yet.
- **Other sites** (run 1). `https://octocat.github.io/` is a user's Pages site, and `https://pages.github.com/` is GitHub
  Pages' own site. The instance's root was asked for in run 1 too.
- **No site** (run 1). `https://octocat.github.io/Spoon-Knife/` and `https://akmaier.github.io/` are addresses under
  `github.io` with no site behind them.
- **The known positive** (both runs). `https://docs.github.com/` is GitHub's documentation, not a Pages site. It sends
  both headers, which shows that the method finds them where they are sent (CLAUDE.md §6a.2).

The output is copied below unchanged, except for the space that ends each status line.

## Raw header lines — run 1, 22:02 UTC

**https://octocat.github.io/Spoon-Knife/** — no site at this address
```
HTTP/2 404
server: GitHub.com
content-security-policy: default-src 'none'; style-src 'unsafe-inline'; img-src data:; connect-src 'self'
```

**https://pages.github.com/**
```
HTTP/2 200
server: GitHub.com
```

**https://octocat.github.io/**
```
HTTP/2 200
server: GitHub.com
```

**https://akmaier.github.io/** — no site at this address
```
HTTP/2 404
server: GitHub.com
content-security-policy: default-src 'none'; style-src 'unsafe-inline'; img-src data:; connect-src 'self'
```

**https://akmaier.github.io/agent-m/**
```
HTTP/2 200
server: GitHub.com
```

**https://docs.github.com/** (the known positive; not a Pages site)
```
HTTP/2 302
content-security-policy: default-src 'none';prefetch-src 'self';connect-src 'self' https://collector.githubapp.com;font-src 'self' data:;img-src 'self' github.com *.github.com *.githubusercontent.com *.githubassets.com data: placehold.it;object-src 'self';script-src 'self' github.com *.github.com *.githubusercontent.com *.githubassets.com 'self' data: 'sha256-U3LWw3Ab3GkeLl43emMGkOL69tCBBkGDB4UldMshHq0=';script-src-attr 'self';frame-src 'self' github.com *.github.com *.githubusercontent.com *.githubassets.com https://support.github.com;frame-ancestors 'self' github.com *.github.com *.githubusercontent.com *.githubassets.com;style-src 'self' github.com *.github.com *.githubusercontent.com *.githubassets.com 'self' 'unsafe-inline' data:;child-src 'self';manifest-src 'self';upgrade-insecure-requests;base-uri 'self';form-action 'self'
x-frame-options: SAMEORIGIN
location: /en
```

## Raw header lines — run 2, 22:44 UTC

**https://akmaier.github.io/agent-m/**
```
HTTP/2 200
server: GitHub.com
```

**https://akmaier.github.io/agent-m/SPEC.html**
```
HTTP/2 200
server: GitHub.com
```

**https://akmaier.github.io/agent-m/PLAN.html**
```
HTTP/2 200
server: GitHub.com
```

**https://akmaier.github.io/agent-m/docs/**
```
HTTP/2 200
server: GitHub.com
```

**https://akmaier.github.io/agent-m/docs/index.html**
```
HTTP/2 200
server: GitHub.com
```

**https://akmaier.github.io/agent-m/library.html** — not served yet
```
HTTP/2 404
server: GitHub.com
content-security-policy: default-src 'none'; style-src 'unsafe-inline'; img-src data:; connect-src 'self'
```

**https://docs.github.com/** (the known positive; not a Pages site)
```
HTTP/2 302
content-security-policy: default-src 'none';prefetch-src 'self';connect-src 'self' https://collector.githubapp.com;font-src 'self' data:;img-src 'self' github.com *.github.com *.githubusercontent.com *.githubassets.com data: placehold.it;object-src 'self';script-src 'self' github.com *.github.com *.githubusercontent.com *.githubassets.com 'self' data: 'sha256-U3LWw3Ab3GkeLl43emMGkOL69tCBBkGDB4UldMshHq0=';script-src-attr 'self';frame-src 'self' github.com *.github.com *.githubusercontent.com *.githubassets.com https://support.github.com;frame-ancestors 'self' github.com *.github.com *.githubusercontent.com *.githubassets.com;style-src 'self' github.com *.github.com *.githubusercontent.com *.githubassets.com 'self' 'unsafe-inline' data:;child-src 'self';manifest-src 'self';upgrade-insecure-requests;base-uri 'self';form-action 'self'
x-frame-options: SAMEORIGIN
location: /en
```

## Result

| Address | Run | Status | `X-Frame-Options` | `Content-Security-Policy` |
|---|---|---|---|---|
| `https://akmaier.github.io/agent-m/` | 1, 2 | 200 | — | — |
| `https://akmaier.github.io/agent-m/SPEC.html` | 2 | 200 | — | — |
| `https://akmaier.github.io/agent-m/PLAN.html` | 2 | 200 | — | — |
| `https://akmaier.github.io/agent-m/docs/` | 2 | 200 | — | — |
| `https://akmaier.github.io/agent-m/docs/index.html` | 2 | 200 | — | — |
| `https://akmaier.github.io/agent-m/library.html` | 2 | 404 | — | `default-src 'none'; style-src 'unsafe-inline'; img-src data:; connect-src 'self'` |
| `https://octocat.github.io/` | 1 | 200 | — | — |
| `https://pages.github.com/` | 1 | 200 | — | — |
| `https://octocat.github.io/Spoon-Knife/` | 1 | 404 | — | the same as for `library.html` |
| `https://akmaier.github.io/` | 1 | 404 | — | the same |
| `https://docs.github.com/` (known positive) | 1, 2 | 302 | `SAMEORIGIN` | with `frame-ancestors 'self' github.com …` |

- **The answers with status 200.** Every one came with neither header: the five files of the instance's site and the roots
  of the two other sites.
- **The 404 pages.** Each carried a Content-Security-Policy of its own, without `frame-ancestors`, and no
  `X-Frame-Options`.
- **The known positive.** It sent both headers in both runs, and the method printed them.

## What it settles for ARC-026

- **What was measured.** The files the instance's site serves that were requested — its root, `SPEC.html`, `PLAN.html` and
  the review page under `docs/` — came with neither `X-Frame-Options` nor `Content-Security-Policy`.
- **What was not measured.** The pages decision 10 opens in its panel — `library.html`, `resources.html`, `tests.html` —
  were not measured: `library.html` answered 404, with the Content-Security-Policy every 404 page above carried, and
  `resources.html` and `tests.html` were not requested. How a browser shows a page in a frame was not measured either.
- **What the header can do.** MDN says that `X-Frame-Options` "can be used to indicate whether a browser should be allowed
  to render the document in a `<frame>`, `<iframe>`, `<embed>` or `<object>`", and that set in a `<meta>` element it "has
  no effect" (`https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/X-Frame-Options`).
