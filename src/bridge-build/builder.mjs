// The Bridge's file of one platform (docs/architecture/MOD-bridge-build.md, Interfaces: buildPlatform): from the instance's checkout at the release tag it
// installs the app's packages from the lockfile, builds the platform's files with electron-builder, signs them and notarises the macOS ones, writes the
// detached signatures, the checksums and `platform-build.json`, checks each code signature with the platform's own verifier and each detached signature
// with the public key, and runs the tunnel check. With any failure the platform's files are not handed on.
//
// Module: MOD-bridge-build

import { cpSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { appDescription } from "../desktop-shell/index.mjs";
import { checksumsText, publicPem, sha256Hex, signatureHolds, signBytes } from "./sign.mjs";
import { ReleaseError } from "./publish.mjs";
import { loadSsh2, nativeAddon, run, tunnelCheck, verifyCodeSignature } from "./check.mjs";

const PLATFORMS = ["macos", "windows", "linux"];
const MANIFEST = JSON.parse(readFileSync(new URL("./package.json", import.meta.url), "utf8"));
// The secrets of the release workflow's environment (Data), by platform; the update key is every platform's.
const SECRETS = {
  macos: ["BRIDGE_UPDATE_KEY", "BRIDGE_MACOS_CERTIFICATE", "BRIDGE_MACOS_CERTIFICATE_PASSWORD", "BRIDGE_NOTARY_KEY", "BRIDGE_NOTARY_KEY_ID", "BRIDGE_NOTARY_ISSUER"],
  windows: ["BRIDGE_UPDATE_KEY", "BRIDGE_WINDOWS_CERTIFICATE", "BRIDGE_WINDOWS_CERTIFICATE_PASSWORD"],
  linux: ["BRIDGE_UPDATE_KEY"],
};
const FLAGS = { macos: ["--mac"], windows: ["--win", "--x64"], linux: ["--linux", "--x64"] };
// The released files of a platform (Data, the table), by electron-builder's target.
const EXTENSIONS = { dmg: "dmg", zip: "zip", nsis: "exe", AppImage: "AppImage" };
const FEEDS = { macos: "latest-mac.yml", windows: "latest.yml", linux: "latest-linux.yml" };
const NAME = "Agent-M-Bridge";

const buildFailed = (reason) => new ReleaseError("BuildFailed", { reason }, `the build failed: ${reason}`);

/**
 * electron-builder's configuration for one platform, made from `appDescription` (MOD-desktop-shell) and the release: the app's name, its main entry, its
 * window and its preload, its icons and the resources `build.json` and `update-key.pem`; the one file the platform's table names; the feed of the
 * instance's releases; and Electron's fuses (Data).
 */
export function builderConfig(description, { platform, version, appId, owner, repository, folders, resources, output }) {
  const named = (ext) => `${NAME}-${version}-${platform}.${ext}`;
  const fuses = {
    runAsNode: false, enableNodeOptionsEnvironmentVariable: false, enableNodeCliInspectArguments: false, onlyLoadAppFromAsar: true,
    enableEmbeddedAsarIntegrityValidation: platform !== "linux",
  };
  return {
    appId,
    productName: description.productName,
    executableName: description.productName.toLowerCase().replaceAll(" ", "-"),
    electronVersion: MANIFEST.devDependencies.electron,
    asar: true,
    electronFuses: fuses,
    directories: { output, buildResources: dirname(description.main) },
    files: ["package.json", "LICENSE", description.main, description.window, description.preload, ...folders.map((folder) => `src/${folder}/**/*`)],
    extraMetadata: { version, main: description.main },
    extraResources: [
      { from: join(resources, description.resources.build), to: description.resources.build },
      { from: join(resources, description.resources.updateKey), to: description.resources.updateKey },
    ],
    publish: { provider: "github", owner, repo: repository },
    ...(platform === "macos" ? {
      mac: { target: [{ target: "dmg", arch: ["universal"] }, { target: "zip", arch: ["universal"] }], artifactName: named("${ext}"), icon: description.icons.macos, hardenedRuntime: true, notarize: true },
    } : {}),
    ...(platform === "windows" ? {
      win: { target: [{ target: "nsis", arch: ["x64"] }], artifactName: named("${ext}"), icon: description.icons.windows, requestedExecutionLevel: "asInvoker" },
      nsis: { oneClick: true, perMachine: false, artifactName: named("${ext}") },
    } : {}),
    ...(platform === "linux" ? {
      linux: { target: [{ target: "AppImage", arch: ["x64"] }], artifactName: named("${ext}"), icon: description.icons.linux },
    } : {}),
  };
}

// The module folders below src/ that the entry reaches through relative imports, each by its folder name; the entry's own folder is among them.
function reachedFolders(srcRoot, entry) {
  const reached = new Set();
  const queue = [resolve(srcRoot, "..", entry)];
  const seen = new Set();
  while (queue.length) {
    const file = queue.pop();
    if (seen.has(file) || !existsSync(file)) continue;
    seen.add(file);
    const relative = file.slice(srcRoot.length + 1).split(/[\\/]/);
    if (file.startsWith(`${srcRoot}/`) && relative.length > 1 && !reached.has(relative[0])) {
      reached.add(relative[0]);
      for (const sibling of readdirSync(join(srcRoot, relative[0]), { recursive: true })) if (/\.(mjs|cjs|js)$/.test(sibling) && !sibling.includes("node_modules")) queue.push(join(srcRoot, relative[0], sibling));
    }
    for (const match of readFileSync(file, "utf8").matchAll(/(?:\bfrom\s*|\bimport\s*\(?\s*|\brequire\s*\(\s*)["'](\.{1,2}\/[^"']+)["']/g)) queue.push(resolve(dirname(file), match[1]));
  }
  return [...reached].sort();
}

// The owner and the repository of the instance, from the checkout's origin.
function instanceOf(origin) {
  const match = /[:/]([^/:]+)\/([^/]+?)(?:\.git)?\/?$/.exec(origin);
  if (!match) throw buildFailed(`the checkout's origin ${origin} names no owner and repository`);
  return { owner: match[1], repository: match[2] };
}

const text = async (command, args, options) => {
  const result = await run(command, args, options);
  if (result.code !== 0) throw buildFailed(`${command} ${args.join(" ")}: ${result.output.trim().slice(-500)}`);
  return result.output.trim();
};

// The files of the platform's table that electron-builder wrote into `output`, with their feed and block maps, by name.
function releasedFiles(platform, version, output) {
  const names = readdirSync(output).filter((name) => statSync(join(output, name)).isFile());
  const wanted = (name) => name === FEEDS[platform] || new RegExp(`^${NAME}-${version.replaceAll(".", "\\.")}-${platform}\\.(dmg|zip|exe|AppImage)(\\.blockmap)?$`).test(name);
  const files = names.filter(wanted).sort();
  const mains = Object.values(EXTENSIONS).filter((ext) => files.includes(`${NAME}-${version}-${platform}.${ext}`));
  const expected = { macos: ["dmg", "zip"], windows: ["exe"], linux: ["AppImage"] }[platform];
  const missing = expected.filter((ext) => !mains.includes(ext));
  if (missing.length || !files.includes(FEEDS[platform])) {
    throw buildFailed(`electron-builder wrote no ${[...missing.map((ext) => `${NAME}-${version}-${platform}.${ext}`), ...(files.includes(FEEDS[platform]) ? [] : [FEEDS[platform]])].join(", ")}`);
  }
  return files;
}

const unpackedOf = (platform, output, description) => {
  if (platform === "macos") {
    const folder = readdirSync(output).find((name) => /^mac/.test(name) && existsSync(join(output, name, `${description.productName}.app`)));
    if (!folder) throw buildFailed("electron-builder wrote no unpacked macOS app");
    const app = join(output, folder, `${description.productName}.app`);
    return { app, executable: join(app, "Contents", "MacOS", description.productName) };
  }
  const executable = platform === "windows" ? join(output, "win-unpacked", `${description.productName}.exe`) : join(output, "linux-unpacked", description.productName.toLowerCase().replaceAll(" ", "-"));
  if (!existsSync(executable)) throw buildFailed(`electron-builder wrote no unpacked app ${executable}`);
  return { app: null, executable };
};

/**
 * buildPlatform({ platform, checkout, tag, folder }) -> Promise<PlatformBuild>
 * Errors: SecretMissing { secret } — before anything is built —, BuildFailed { reason }, NotarisationFailed { reason }, SignatureInvalid { file },
 * NativeAddonFound { file }, TunnelCheckFailed { reason }; with any of them the platform's files are not handed on.
 */
export async function buildPlatform({ platform, checkout, tag, folder }) {
  const environment = globalThis.process.env;
  if (!PLATFORMS.includes(platform)) throw buildFailed(`${platform} is no platform of the Bridge`);
  for (const secret of SECRETS[platform]) {
    if (!environment[secret]) throw new ReleaseError("SecretMissing", { secret }, `${secret} is not set in the environment`);
  }
  const version = /^v(\d{4}\.\d+\.\d+)$/.exec(tag)?.[1];
  if (!version) throw buildFailed(`the tag ${tag} is no vYYYY.minor.patch`);
  const privatePem = environment.BRIDGE_UPDATE_KEY;
  const secrets = SECRETS[platform].map((name) => environment[name]);
  const scrub = (reason) => secrets.reduce((shown, secret) => shown.replaceAll(secret, "***"), String(reason));

  const work = mkdtempSync(join(tmpdir(), "bridge-build-"));
  const written = [];
  try {
    const { owner, repository } = instanceOf(await text("git", ["-C", checkout, "remote", "get-url", "origin"]));
    const commit = await text("git", ["-C", checkout, "rev-parse", "HEAD"]);
    const appId = `io.github.${owner}.${repository}.bridge`;

    // The app, staged away from the checkout: its manifest and lockfile, Agent M's LICENSE, and the module folders the entry reaches.
    const stage = join(work, "app");
    const resources = join(work, "resources");
    const output = join(work, "out");
    mkdirSync(stage, { recursive: true });
    mkdirSync(resources);
    for (const file of ["package.json", "package-lock.json"]) cpSync(join(checkout, "src", "bridge-build", file), join(stage, file));
    cpSync(join(checkout, "LICENSE"), join(stage, "LICENSE"));
    const folders = reachedFolders(join(checkout, "src"), appDescription.main);
    for (const name of folders) {
      cpSync(join(checkout, "src", name), join(stage, "src", name), { recursive: true, filter: (path) => !/(^|[\\/])(node_modules|\.git)([\\/]|$)/.test(path.slice(join(checkout, "src", name).length)) });
    }
    writeFileSync(join(resources, appDescription.resources.build), JSON.stringify({ instance: `${owner}/${repository}`, appId, origin: `https://${owner}.github.io`, version, commit }));
    writeFileSync(join(resources, appDescription.resources.updateKey), publicPem(privatePem));

    const builderEnv = { ...environment };
    for (const name of Object.keys(builderEnv)) if (name.startsWith("BRIDGE_")) delete builderEnv[name];
    const installed = await run("npm", ["ci", "--omit=optional", "--ignore-scripts"], { cwd: stage, env: builderEnv });
    if (installed.code !== 0) throw buildFailed(scrub(`npm ci: ${installed.output.trim().slice(-500)}`));
    const addon = nativeAddon(join(stage, "node_modules"), stage);
    if (addon) throw new ReleaseError("NativeAddonFound", { file: addon }, `${addon}: the app holds a compiled Node addon`);

    const config = builderConfig(appDescription, { platform, version, appId, owner, repository, folders, resources, output });
    const configFile = join(work, "electron-builder.json");
    writeFileSync(configFile, JSON.stringify(config));
    if (platform === "linux") builderEnv.CSC_IDENTITY_AUTO_DISCOVERY = "false";
    if (platform === "macos") {
      const noteKey = join(work, "notary-key.p8");
      writeFileSync(noteKey, environment.BRIDGE_NOTARY_KEY, { mode: 0o600 });
      Object.assign(builderEnv, { CSC_LINK: environment.BRIDGE_MACOS_CERTIFICATE, CSC_KEY_PASSWORD: environment.BRIDGE_MACOS_CERTIFICATE_PASSWORD, APPLE_API_KEY: noteKey, APPLE_API_KEY_ID: environment.BRIDGE_NOTARY_KEY_ID, APPLE_API_ISSUER: environment.BRIDGE_NOTARY_ISSUER });
    }
    if (platform === "windows") Object.assign(builderEnv, { CSC_LINK: environment.BRIDGE_WINDOWS_CERTIFICATE, CSC_KEY_PASSWORD: environment.BRIDGE_WINDOWS_CERTIFICATE_PASSWORD });
    const built = await run(join(stage, "node_modules", ".bin", `electron-builder${globalThis.process.platform === "win32" ? ".cmd" : ""}`), [...FLAGS[platform], "--config", configFile, "--publish", "never"], { cwd: stage, env: builderEnv });
    if (built.code !== 0) {
      const reason = scrub(built.output.trim().slice(-1000));
      throw platform === "macos" && /notari[sz]/i.test(built.output) ? new ReleaseError("NotarisationFailed", { reason }, `notarisation failed: ${reason}`) : buildFailed(reason);
    }
    const unpacked = unpackedOf(platform, output, appDescription);
    const outputAddon = nativeAddon(output);
    if (outputAddon) throw new ReleaseError("NativeAddonFound", { file: outputAddon }, `${outputAddon}: the app holds a compiled Node addon`);

    // The files, handed on only at the end: copied into the folder with their detached signatures and the checksums.
    mkdirSync(folder, { recursive: true });
    const files = releasedFiles(platform, version, output).map((name) => {
      const bytes = readFileSync(join(output, name));
      writeFileSync(join(folder, name), bytes);
      written.push(name);
      const signature = signBytes(privatePem, bytes);
      writeFileSync(join(folder, `${name}.sig`), signature);
      written.push(`${name}.sig`);
      return { name, size: bytes.length, sha256: sha256Hex(bytes), signature };
    });
    writeFileSync(join(folder, "SHA256SUMS"), checksumsText(files));
    written.push("SHA256SUMS");

    const installerName = files.find((file) => /\.(dmg|exe)$/.test(file.name))?.name;
    await verifyCodeSignature({ platform, app: unpacked.app, installer: join(folder, installerName ?? ""), file: installerName, env: environment });
    const publicKey = readFileSync(join(resources, appDescription.resources.updateKey), "utf8");
    const sums = readFileSync(join(folder, "SHA256SUMS"), "utf8").split("\n");
    for (const file of files) {
      const bytes = readFileSync(join(folder, file.name));
      const detached = readFileSync(join(folder, `${file.name}.sig`), "utf8");
      if (sha256Hex(bytes) !== file.sha256 || !sums.includes(`${file.sha256}  ${file.name}`) || !signatureHolds(publicKey, bytes, detached)) {
        throw new ReleaseError("SignatureInvalid", { file: file.name }, `${file.name}: its checksum or detached signature does not hold`);
      }
    }

    await tunnelCheck({ platform, executable: unpacked.executable, appId, ssh2: loadSsh2(stage) });

    const result = { platform, version, folder, files };
    writeFileSync(join(folder, "platform-build.json"), JSON.stringify(result));
    return result;
  } catch (error) {
    for (const name of [...written, "platform-build.json"]) rmSync(join(folder, name), { force: true });
    throw error;
  } finally {
    rmSync(work, { recursive: true, force: true });
  }
}
