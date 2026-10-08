const { contextBridge, ipcRenderer } = require("electron");
contextBridge.exposeInMainWorld("bridge", { copy: (text) => ipcRenderer.invoke("copy", text), pairAnew: () => ipcRenderer.invoke("pair-anew") });
