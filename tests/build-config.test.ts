import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import viteConfig from "../vite.config.js";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const packageJson = JSON.parse(readFileSync(join(repoRoot, "package.json"), "utf-8")) as {
  build: {
    mac: {
      entitlements: string;
      entitlementsInherit: string;
      extendInfo: Record<string, string>;
    };
  };
};

describe("build config", () => {
  it("uses relative renderer asset paths for packaged file URLs", () => {
    expect(viteConfig).toEqual(expect.objectContaining({ base: "./" }));
  });

  it("signs the macOS app with Apple Events automation support", () => {
    expect(packageJson.build.mac.entitlements).toBe("build/entitlements.mac.plist");
    expect(packageJson.build.mac.entitlementsInherit).toBe("build/entitlements.mac.inherit.plist");
    expect(packageJson.build.mac.extendInfo?.NSAppleEventsUsageDescription).toContain("Automation access");

    const entitlements = readFileSync(join(repoRoot, packageJson.build.mac.entitlements), "utf-8");

    expect(entitlements).toContain("<key>com.apple.security.automation.apple-events</key>");
    expect(entitlements).toContain("<key>com.apple.security.cs.allow-jit</key>");
    expect(entitlements).toContain("<key>com.apple.security.cs.allow-unsigned-executable-memory</key>");
    expect(entitlements).toContain("<key>com.apple.security.cs.disable-library-validation</key>");
  });
});
