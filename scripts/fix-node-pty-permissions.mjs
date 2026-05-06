import { chmod, stat } from "node:fs/promises";
import path from "node:path";

const candidates = [
  "node_modules/node-pty/prebuilds/darwin-arm64/spawn-helper",
  "node_modules/node-pty/prebuilds/darwin-x64/spawn-helper",
  "node_modules/node-pty/build/Release/spawn-helper",
];

for (const candidate of candidates) {
  const filePath = path.resolve(candidate);
  try {
    const current = await stat(filePath);
    await chmod(filePath, current.mode | 0o755);
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      continue;
    }
    throw error;
  }
}
