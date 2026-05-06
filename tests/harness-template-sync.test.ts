import { promises as fs } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { checkHarnessTemplateSync, harnessTemplateSyncMetadataPath, updateHarnessTemplateFiles, versionOwnedHarnessTemplateFiles } from "../src/main/harness-template-sync.js";
import { scanConfiguredRoots } from "../src/main/scanner.js";
import { createHarnessRepo } from "../src/main/template-installer.js";
import { makeTempRoot, writeText } from "./helpers.js";

const templateDir = path.join(process.cwd(), "templates", "harness");

describe("harness template sync", () => {
  it("reports freshly installed harness control files as current", async () => {
    const root = await makeTempRoot("harness-template-current");
    const target = path.join(root, "CurrentProject");
    const created = await createHarnessRepo({ targetDir: target, configuredRoots: [root], projectName: "Current Project", templateDir });
    expect(created.ok).toBe(true);

    const result = await checkHarnessTemplateSync({ repoPath: target, configuredRoots: [root], templateDir });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.status).toBe("current");
    expect(result.installedVersion).toBe(result.currentVersion);
    expect(result.files.map((file) => file.path).sort()).toEqual([...versionOwnedHarnessTemplateFiles].sort());
  });

  it("detects stale files and updates only version-owned harness files", async () => {
    const root = await makeTempRoot("harness-template-stale");
    const target = path.join(root, "StaleProject");
    const created = await createHarnessRepo({ targetDir: target, configuredRoots: [root], projectName: "Stale Project", description: "Keep me", templateDir });
    expect(created.ok).toBe(true);

    const statePath = path.join(target, ".agent", "state.json");
    const gitignorePath = path.join(target, ".gitignore");
    const productPath = path.join(target, "docs", "product.md");
    const originalState = await fs.readFile(statePath, "utf8");
    const originalGitignore = "# Project ignore rules\ncustom-cache/\n";
    const originalProduct = await fs.readFile(productPath, "utf8");
    await writeText(gitignorePath, originalGitignore);
    await writeText(path.join(target, "AGENTS.md"), "# Locally edited\n");

    const stale = await checkHarnessTemplateSync({ repoPath: target, configuredRoots: [root], templateDir });
    expect(stale.ok).toBe(true);
    if (!stale.ok) return;
    expect(stale.status).toBe("stale");
    expect(stale.files.find((file) => file.path === "AGENTS.md")?.status).toBe("stale");

    const updated = await updateHarnessTemplateFiles({ repoPath: target, configuredRoots: [root], templateDir });
    expect(updated.ok).toBe(true);
    if (!updated.ok) return;
    expect(updated.files).toContain("AGENTS.md");
    expect(updated.files).toContain(harnessTemplateSyncMetadataPath);
    expect(updated.files).not.toContain(".gitignore");
    expect(await fs.readFile(statePath, "utf8")).toBe(originalState);
    expect(await fs.readFile(gitignorePath, "utf8")).toBe(originalGitignore);
    expect(await fs.readFile(productPath, "utf8")).toBe(originalProduct);

    const current = await checkHarnessTemplateSync({ repoPath: target, configuredRoots: [root], templateDir });
    expect(current.ok).toBe(true);
    if (!current.ok) return;
    expect(current.status).toBe("current");
  });

  it("treats matching old installs without sync metadata as current by content", async () => {
    const root = await makeTempRoot("harness-template-no-metadata");
    const target = path.join(root, "OldProject");
    const created = await createHarnessRepo({ targetDir: target, configuredRoots: [root], projectName: "Old Project", templateDir });
    expect(created.ok).toBe(true);
    await fs.unlink(path.join(target, harnessTemplateSyncMetadataPath));

    const result = await checkHarnessTemplateSync({ repoPath: target, configuredRoots: [root], templateDir });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.status).toBe("current");
    expect(result.installedVersion).toBeNull();
  });

  it("includes template drift status in project scan summaries", async () => {
    const root = await makeTempRoot("harness-template-scan");
    const target = path.join(root, "ScannedProject");
    const created = await createHarnessRepo({ targetDir: target, configuredRoots: [root], projectName: "Scanned Project", templateDir });
    expect(created.ok).toBe(true);
    await writeText(path.join(target, ".agent", "protocol.md"), "# Old protocol\n");

    const scan = await scanConfiguredRoots([root], { templateDir });
    expect(scan.projects[0]?.harnessTemplate?.status).toBe("stale");
    expect(scan.projects[0]?.harnessTemplate?.staleFiles).toContain(".agent/protocol.md");
  });

  it("rejects projects outside configured roots and symlinked version-owned files", async () => {
    const root = await makeTempRoot("harness-template-safe-root");
    const outside = await makeTempRoot("harness-template-safe-outside");
    const target = path.join(root, "SafeProject");
    const created = await createHarnessRepo({ targetDir: target, configuredRoots: [root], projectName: "Safe Project", templateDir });
    expect(created.ok).toBe(true);

    const outsideCheck = await checkHarnessTemplateSync({ repoPath: target, configuredRoots: [outside], templateDir });
    expect(outsideCheck.ok).toBe(false);
    if (!outsideCheck.ok) expect(outsideCheck.reason).toBe("unsafe-path");

    await fs.unlink(path.join(target, "AGENTS.md"));
    await fs.symlink(path.join(outside, "AGENTS.md"), path.join(target, "AGENTS.md"));
    const symlinkUpdate = await updateHarnessTemplateFiles({ repoPath: target, configuredRoots: [root], templateDir });
    expect(symlinkUpdate.ok).toBe(false);
    if (!symlinkUpdate.ok) expect(symlinkUpdate.reason).toBe("unsafe-path");
  });
});
