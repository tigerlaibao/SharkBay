import { app, BrowserWindow } from "electron";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const currentDir = dirname(fileURLToPath(import.meta.url));
const devServerUrl = process.env.VITE_DEV_SERVER_URL ?? "http://127.0.0.1:5173";

let usageWindow: BrowserWindow | null = null;

export function createUsageWindow(): void {
  if (usageWindow && !usageWindow.isDestroyed()) {
    usageWindow.focus();
    return;
  }

  const preload = join(currentDir, "preload.mjs");
  usageWindow = new BrowserWindow({
    width: 1100,
    height: 780,
    minWidth: 860,
    minHeight: 580,
    title: "Token Usage",
    show: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      preload
    }
  });

  usageWindow.once("ready-to-show", () => {
    usageWindow?.show();
  });

  usageWindow.on("closed", () => {
    usageWindow = null;
  });

  if (app.isPackaged) {
    void usageWindow.loadFile(join(currentDir, "../../dist/renderer/usage-window.html"));
  } else {
    void usageWindow.loadURL(`${devServerUrl}/usage-window.html`);
  }
}
