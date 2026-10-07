// errors.mjs — the failures MOD-release-evidence throws of its own (MOD-release-evidence, Interfaces: startReleaseCandidate,
// acceptAndRelease), named the same way MOD-repository-hosts' HostError and MOD-runtimes' RuntimeError are.
//
// Module: MOD-release-evidence

export class ReleaseEvidenceError extends Error {
  constructor(name, fields, message) {
    super(message);
    this.name = name;
    Object.assign(this, fields ?? {});
  }
}
