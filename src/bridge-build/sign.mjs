// The detached signatures and the checksums of the Bridge's release, and their checks (docs/architecture/MOD-bridge-build.md, Data): the
// Ed25519 signature of a file's bytes by the publisher's update key, in base64 on one line; and SHA256SUMS, one line `<sha256>  <name>` per file.
// The private key is given as the PEM text the release workflow's environment holds; it is never read from a file and never written anywhere.
//
// Module: MOD-bridge-build

import { createHash, createPublicKey, sign, verify } from "node:crypto";

export const sha256Hex = (bytes) => createHash("sha256").update(bytes).digest("hex");

// The detached signature of `bytes`: base64 on one line.
export const signBytes = (privatePem, bytes) => sign(null, bytes, privatePem).toString("base64");

// Whether `signature` is the publisher's signature of `bytes`; the public half is derived from the private key.
export function signatureHolds(privatePem, bytes, signature) {
  try {
    return verify(null, bytes, createPublicKey(privatePem), Buffer.from(String(signature).trim(), "base64"));
  } catch {
    return false;
  }
}

// SHA256SUMS: one line per file, in the order of the names.
export const checksumsText = (files) => [...files].sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))
  .map((file) => `${file.sha256}  ${file.name}\n`).join("");
