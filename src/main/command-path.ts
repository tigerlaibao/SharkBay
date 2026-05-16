import { execFile } from "node:child_process";
import { constants as fsConstants, promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const fallbackCommandDirectories = [
  ".local/bin",
  ".bun/bin",
  ".nvm/current/bin",
  "/opt/homebrew/bin",
  "/opt/homebrew/sbin",
  "/usr/local/bin",
  "/usr/bin",
  "/bin",
  "/usr/sbin",
  "/sbin",
];

export async function resolveCommandPath(
  command: string,
  fallbackDirectories = fallbackCommandDirectories,
  homeDirectory = os.homedir()
): Promise<string | null> {
  if (!/^[\w.-]+$/u.test(command)) return null;
  try {
    const result = await execFileAsync("/bin/zsh", ["-lc", `command -v ${command}`], { timeout: 3000 });
    const firstPath = result.stdout.trim().split(/\r?\n/u)[0] ?? null;
    if (firstPath) return firstPath;
  } catch {
    // Finder-launched macOS apps often start with a sparse PATH. Fall through to
    // common install locations used by local developer CLIs.
  }

  for (const directory of fallbackDirectories) {
    const executablePath = directory.startsWith("/")
      ? path.join(directory, command)
      : path.join(homeDirectory, directory, command);
    if (await isExecutableFile(executablePath)) {
      return executablePath;
    }
  }
  return null;
}

async function isExecutableFile(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath, fsConstants.X_OK);
    const stat = await fs.stat(filePath);
    return stat.isFile();
  } catch {
    return false;
  }
}
