// sealed-box.mjs — a value sealed to a public key as libsodium's crypto_box_seal seals it, which GitHub's Actions secrets API takes
// ("Create or update a repository secret": the value encrypted with the repository's public key, using LibSodium).
//
// Module: MOD-repository-hosts
//
// The sealed box is the ephemeral public key, followed by crypto_box of the message under the nonce BLAKE2b-192(ephemeral public
// key ‖ recipient public key), with the ephemeral secret key and the recipient's public key. The ephemeral secret key is 32 random
// bytes from the platform's crypto.getRandomValues, used once and zeroed. Pure apart from that randomness; no request is made.

import { blake2b, box, scalarMultBase } from "./vendor/nacl-blake.mjs";

const fromBase64 = (text) => Uint8Array.from(atob(text), (c) => c.charCodeAt(0));
const toBase64 = (bytes) => btoa(Array.from(bytes, (b) => String.fromCharCode(b)).join(""));

/**
 * sealToBase64(value: string, publicKey: string) -> string — `value`, as UTF-8, sealed to the base64 X25519 public key `publicKey`,
 * in base64. Throws TypeError for a public key that is not 32 bytes.
 */
export function sealToBase64(value, publicKey) {
  const recipient = fromBase64(publicKey);
  if (recipient.length !== 32) throw new TypeError("a sealed box is sealed to a public key of 32 bytes");
  const secret = globalThis.crypto.getRandomValues(new Uint8Array(32));
  const ephemeral = scalarMultBase(secret);
  const both = new Uint8Array(64);
  both.set(ephemeral);
  both.set(recipient, 32);
  const sealed = box(new TextEncoder().encode(value), blake2b(both, undefined, 24), recipient, secret);
  secret.fill(0);
  const out = new Uint8Array(32 + sealed.length);
  out.set(ephemeral);
  out.set(sealed, 32);
  return toBase64(out);
}
