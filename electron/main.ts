import { app, BrowserWindow, shell } from "electron";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { registerIpcHandlers } from "./ipc.js";

const currentFile = fileURLToPath(import.meta.url);
const currentDir = dirname(currentFile);
const devServerUrl = process.env.VITE_DEV_SERVER_URL ?? "http://127.0.0.1:5173";

let mainWindow: BrowserWindow | null = null;

function createMainWindow(): BrowserWindow {
  const preload = join(currentDir, "preload.mjs");
  const window = new BrowserWindow({
    width: 1320,
    height: 860,
    minWidth: 1040,
    minHeight: 680,
    title: "SharkBay",
    show: false,
    backgroundColor: "#f7f8fa",
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      preload
    }
  });

  window.once("ready-to-show", () => {
    window.show();
  });

  window.webContents.setWindowOpenHandler(({ url }) => {
    void shell.openExternal(url);
    return { action: "deny" };
  });

  if (app.isPackaged) {
    void window.loadFile(join(currentDir, "../../dist/renderer/index.html"));
  } else {
    void window.loadURL(devServerUrl);
    window.webContents.openDevTools({ mode: "detach" });
  }

  return window;
}

app.whenReady().then(() => {
  registerIpcHandlers({
    userDataPath: app.getPath("userData"),
    templateRoot: app.isPackaged
      ? join(process.resourcesPath, "templates", "harness")
      : join(app.getAppPath(), "templates", "harness")
  });

  mainWindow = createMainWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      mainWindow = createMainWindow();
    }
  });
});

app.on("window-all-closed", () => {
  mainWindow = null;

  if (process.platform !== "darwin") {
    app.quit();
  }
});
