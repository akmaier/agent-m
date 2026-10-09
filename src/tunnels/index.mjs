import { createHash } from "node:crypto";
import { chmodSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";

const require = createRequire(import.meta.url);
const { utils } = require("ssh2");

function notWritable(folder, cause) {
  const error = new Error(`The key folder is not writable: ${folder}`, { cause });
  error.name = "NotWritable";
  error.folder = folder;
  return error;
}

function fingerprintOf(publicKey) {
  const key = utils.parseKey(publicKey);
  return `SHA256:${createHash("sha256").update(key.getPublicSSH()).digest("base64").replace(/=+$/, "")}`;
}

function matchedPair(privateKey, publicKey) {
  const privatePart = utils.parseKey(privateKey);
  const publicPart = utils.parseKey(publicKey);
  return privatePart.type === "ssh-ed25519" && privatePart.getPublicSSH().compare(publicPart.getPublicSSH()) === 0;
}

export async function ensureKey(dataFolder) {
  const sshFolder = join(dataFolder, "ssh");
  const privatePath = join(sshFolder, "id_ed25519");
  const publicPath = join(sshFolder, "id_ed25519.pub");
  try {
    mkdirSync(sshFolder, { recursive: true, mode: 0o700 });
    let privateKey;
    let publicKey;
    if (existsSync(privatePath) && existsSync(publicPath)) {
      privateKey = readFileSync(privatePath, "utf8");
      publicKey = readFileSync(publicPath, "utf8");
    } else {
      ({ private: privateKey, public: publicKey } = utils.generateKeyPairSync("ed25519"));
      writeFileSync(privatePath, privateKey, { mode: 0o600 });
      chmodSync(privatePath, 0o600);
      writeFileSync(publicPath, publicKey, { mode: 0o644 });
    }
    if (!matchedPair(privateKey, publicKey)) throw new Error("The stored SSH key pair does not correspond.");
    return { publicKey, fingerprint: fingerprintOf(publicKey) };
  } catch (error) {
    if (error?.name === "NotWritable") throw error;
    if (error?.code === "EACCES" || error?.code === "EPERM" || error?.code === "EROFS") throw notWritable(dataFolder, error);
    throw error;
  }
}
