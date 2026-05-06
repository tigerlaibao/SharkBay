import { app, BrowserWindow, Menu, shell } from "electron";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { closeAllTerminalSessions, registerIpcHandlers } from "./ipc.js";
import { createApplicationMenuTemplate } from "../src/main/application-menu.js";
import { appChannels } from "../src/shared/app-events.js";

const currentFile = fileURLToPath(import.meta.url);
const currentDir = dirname(currentFile);
const devServerUrl = process.env.VITE_DEV_SERVER_URL ?? "http://127.0.0.1:5173";

let mainWindow: BrowserWindow | null = null;

app.setName("SharkBay");

function sendOpenSettings(window: BrowserWindow): void {
  const send = () => {
    if (!window.isDestroyed() && !window.webContents.isDestroyed()) {
      window.webContents.send(appChannels.openSettings);
    }
  };

  if (window.webContents.isLoading()) {
    window.webContents.once("did-finish-load", send);
    return;
  }

  send();
}

function openSettingsFromApplicationMenu(): void {
  if (!mainWindow || mainWindow.isDestroyed()) {
    mainWindow = createMainWindow();
  }

  if (mainWindow.isMinimized()) {
    mainWindow.restore();
  }

  mainWindow.show();
  mainWindow.focus();
  sendOpenSettings(mainWindow);
}

function installApplicationMenu(): void {
  const template = createApplicationMenuTemplate({
    appName: "SharkBay",
    isMac: process.platform === "darwin",
    openSettings: openSettingsFromApplicationMenu,
  });

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

function createMainWindow(): BrowserWindow {
  const preload = join(currentDir, "preload.mjs");
  const window = new BrowserWindow({
    width: 1500,
    height: 860,
    minWidth: 1180,
    minHeight: 680,
    title: "SharkBay",
    titleBarStyle: process.platform === "darwin" ? "hiddenInset" : "default",
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

  installApplicationMenu();
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

app.on("before-quit", () => {
  closeAllTerminalSessions();
});
