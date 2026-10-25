// Hashes — git's blob SHA-1 of a text, and the SHA-256 of a text or of bytes, through the platform's WebCrypto, which
// browsers and Node both offer (MOD-text-tools, Parts).
//
// Module: MOD-text-tools

const encoder = new TextEncoder();
const hex = (digest) => [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");

// blobSha(text: string) -> Promise<string> — git's blob SHA-1 of the text's UTF-8 bytes, as 40 lowercase hexadecimal digits:
// the SHA-1 of `blob <length in bytes>`, a zero byte and the bytes, the same as `git hash-object` gives for the file. The text
// is hashed as given; a caller that read a file must pass its exact bytes, line endings included, or the SHA names another
// text.
export async function blobSha(text) {
  const body = encoder.encode(text);
  const head = encoder.encode(`blob ${body.length}\0`);
  const all = new Uint8Array(head.length + body.length);
  all.set(head);
  all.set(body, head.length);
  return hex(await globalThis.crypto.subtle.digest("SHA-1", all));
}

// sha256(content: string | Uint8Array) -> Promise<string> — the SHA-256 of the bytes, or of a string's UTF-8 bytes, as 64
// lowercase hexadecimal digits.
export async function sha256(content) {
  const bytes = typeof content === "string" ? encoder.encode(content) : content;
  return hex(await globalThis.crypto.subtle.digest("SHA-256", bytes));
}
