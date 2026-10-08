const node = () => {
  const builtin = globalThis.process?.getBuiltinModule;
  if (!builtin) throw new Error("Bridge pairing requires Node.");
  return { disk: builtin("node:fs/promises"), crypto: builtin("node:crypto"), path: builtin("node:path") };
};

const tokenPath = (folder) => node().path.join(folder, "pairing-token");

export async function currentToken(dataFolder) {
  try { return (await node().disk.readFile(tokenPath(dataFolder), "utf8")).trim(); }
  catch (error) {
    if (error.code !== "ENOENT") throw error;
    return pairAnew(dataFolder, null);
  }
}

export async function pairAnew(dataFolder, token) {
  try {
    const { disk, crypto } = node();
    await disk.mkdir(dataFolder, { recursive: true, mode: 0o700 });
    const value = token ?? crypto.randomBytes(32).toString("base64url");
    await disk.writeFile(tokenPath(dataFolder), value, { encoding: "utf8", mode: 0o600 });
    await disk.chmod(tokenPath(dataFolder), 0o600);
    return value;
  } catch (failure) {
    failure.name = "NotWritable";
    failure.folder = dataFolder;
    throw failure;
  }
}
