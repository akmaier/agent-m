// MOD-bridge-build — the Bridge's release: one signed file per platform, and its update feed (docs/architecture/MOD-bridge-build.md).
// publishRelease checks the three platforms' builds, their detached signatures and the packages' licences, and publishes the release.
// buildPlatform builds, signs and checks the file of one platform.
//
// Module: MOD-bridge-build

/**
 * @typedef {{ platform: "macos" | "windows" | "linux", version: string, folder: string,
 *   files: { name: string, size: number, sha256: string, signature: string }[] }} PlatformBuild
 */

export { buildPlatform } from "./builder.mjs";
export { publishRelease } from "./publish.mjs";
