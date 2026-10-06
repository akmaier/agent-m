// Hashes — git's blob SHA-1 of a text, through the platform's WebCrypto, which browsers and Node both offer (MOD-text-tools,
// Parts). The module's SHA-256 belongs here too and is not built yet.
//
// Module: MOD-text-tools

const encoder = new TextEncoder();
const hex = (digest) => [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");

// blobSha(text: string) -> Promise<string> — git's blob SHA-1 of the text's UTF-8 bytes, as 40 lowercase hexadecimal digits:
// the SHA-1 of `blob <length in bytes>`, a zero byte and the bytes, the same as `git hash-object` gives for the file. The text
// is hashed as given; a caller that read a file must pass its exact bytes, line endings included, or the SHA names another
// text. Copied from the blob SHA with which docs/assets/git-host.mjs checks a text it read.
export async function blobSha(text) {
  const body = encoder.encode(text);
  const head = encoder.encode(`blob ${body.length}\0`);
  const all = new Uint8Array(head.length + body.length);
  all.set(head);
  all.set(body, head.length);
  return hex(await globalThis.crypto.subtle.digest("SHA-1", all));
}
