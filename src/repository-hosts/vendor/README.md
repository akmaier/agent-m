# The vendored libraries of MOD-repository-hosts

**REGISTER**

The libraries that seal a CI secret's value for GitHub's Actions secrets API (libsodium's sealed box: X25519,
XSalsa20-Poly1305, and BLAKE2b for the nonce). Neither package publishes an ECMAScript module, and the site has no build
step and calls no origin it has not named (`NO SERVER`), so both are bundled once into one module and served from here.
Each keeps its own licence; Agent M's MIT licence does not cover them. Neither makes a request.

| Library | Version | Licence | Fetched from |
|---|---|---|---|
| tweetnacl | 1.0.3 | Unlicense, `LICENSE.tweetnacl` | https://registry.npmjs.org/tweetnacl/-/tweetnacl-1.0.3.tgz |
| blakejs | 1.2.1 | MIT, `LICENSE.blakejs` | https://registry.npmjs.org/blakejs/-/blakejs-1.2.1.tgz |

**The file.** `nacl-blake.mjs`, SHA-256 `13fcbe4a0358467bbff26e09d19080bf33b00fdc1e64566cafde89f7490c9f89`, made by esbuild
0.24.0 from this entry, unminified:

```js
import nacl from "tweetnacl";
import blake from "blakejs";
export const box = nacl.box;
export const scalarMultBase = nacl.scalarMult.base;
export const blake2b = blake.blake2b;
```

with `--bundle --format=esm --platform=neutral --main-fields=main --external:crypto --legal-comments=inline` and the banner
`const self = globalThis;`, so that tweetnacl finds the global object's `crypto` in a browser and in Node alike and never
reaches its `require("crypto")`. The licence files are the packages' own `LICENSE`. A version moves only by a change that
replaces the file, its licence files and this text together.
