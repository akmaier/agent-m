// The path of a Bridge at the jump host's HTTPS address, made here and nowhere else: settingsOf (index.mjs) and proxyConfiguration (proxy.mjs) both use it.
//
// Module: MOD-bridge-client

export const bridgePath = (name) => `/bridge/${name}`;
