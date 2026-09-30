# GitLab servers answer the dashboard's cross-origin preflight

**MESSUNG** — 2026-09-30, 14:05 UTC, macOS, `curl 8.7.1`, from a machine inside the FAU network. It repeats, as a file of its
own, the measurement of 2026-09-24 that until now existed only in `docs/spec-freigaben/2026-09-24b_gitlab-produkte/index.md`
(SPEC §10 `GITLAB PRODUCTS ARE SUPPORTED`, §6 `BROWSER REACHABILITY IS MEASURED, NOT ASSUMED`).

## Method

One CORS preflight per server, as a browser sends it before a cross-origin write with a token header from the dashboard's
Pages address; no token, no body:

```
curl -s -o /dev/null -D - -X OPTIONS <url> \
  -H "Origin: https://akmaier.github.io" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: authorization,private-token"
```

`<url>` is `https://<server>/api/v4/projects` for the three GitLab servers, and — as the comparison and known positive, since the
dashboard already writes to GitHub from the browser — `https://api.github.com/repos/akmaier/agent-m/git/commits`, the endpoint
`commitFiles` posts to. The CORS lines of each answer are copied below unchanged; other headers (CSP, tracing, caching) are left
out.

## Raw header lines

**gitlab.com** — `HTTP/2 200`
```
access-control-allow-origin: *
access-control-allow-headers: authorization,private-token
access-control-allow-methods: GET, HEAD, POST, PUT, PATCH, DELETE, OPTIONS
access-control-max-age: 7200
```

**gitlab.rrze.fau.de** — `HTTP/2 200`
```
access-control-allow-headers: authorization,private-token
access-control-allow-methods: GET, HEAD, POST, PUT, PATCH, DELETE, OPTIONS
access-control-allow-origin: *
access-control-max-age: 7200
```

**gitos.rrze.fau.de** — `HTTP/1.1 200 OK`
```
Access-Control-Allow-Headers: authorization,private-token
Access-Control-Allow-Methods: GET, HEAD, POST, PUT, PATCH, DELETE, OPTIONS
Access-Control-Allow-Origin: *
Access-Control-Max-Age: 7200
```

**api.github.com** (comparison) — `HTTP/2 204`
```
access-control-allow-origin: *
access-control-allow-headers: Authorization, Content-Type, If-Match, If-Modified-Since, If-None-Match, If-Unmodified-Since, Accept-Encoding, X-GitHub-OTP, X-Requested-With, User-Agent, GraphQL-Features, X-Github-Next-Global-ID, X-GitHub-Api-Version, X-Fetch-Nonce, Copilot-Integration-Id, DD-CLIENT-TOKEN, X-Client-Application
access-control-allow-methods: GET, POST, PATCH, PUT, DELETE
access-control-max-age: 86400
```

## Result

| Server | Status | `Allow-Origin` | `authorization` allowed | `private-token` allowed | `POST` allowed |
|---|---|---|---|---|---|
| gitlab.com | 200 | `*` | yes | yes | yes |
| gitlab.rrze.fau.de | 200 | `*` | yes | yes | yes |
| gitos.rrze.fau.de | 200 | `*` | yes | yes | yes |
| api.github.com | 204 | `*` | yes | no — not needed: a GitHub token goes as `Authorization` | yes |

All three GitLab servers answer as on 2026-09-24: any origin, both token headers, `POST`/`PUT`. The comparison with GitHub
shows the method discriminates: GitHub's answer lists its own fixed header set, in which `private-token` is absent. The three
GitLab servers listed exactly the two headers requested; whether they would also list any other requested header was not
measured. Measured from inside the FAU network; whether a browser elsewhere reaches the two FAU servers is a network question,
not a CORS one.
