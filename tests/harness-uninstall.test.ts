import { promises as fs } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { cleanGitignoreContent, uninstallHarness } from "../src/main/harness-uninstall.js";
import { createContainedHarnessFixture, createHarnessFixture, makeTempRoot, writeText } from "./helpers.js";

describe("harness uninstall", () => {
  it("removes contained harness files and only matching gitignore lines", async () => {
    const root = await makeTempRoot("harness-uninstall-contained");
    const repo = await createContainedHarnessFixture(root, "ContainedUninstall");
    await writeText(path.join(repo, "AGENTS.md"), [
      "# AGENTS.md",
      "",
      "This repository uses a tool-neutral Ripple harness.",
      "Use `.sharkbay/` for control files.",
      "",
    ].join("\n"));
    await writeText(path.join(repo, ".gitignore"), [
      "node_modules/",
      "",
      "# Local SharkBay harness runtime",
      ".sharkbay/runner.json",
      "",
      "dist/",
      "",
    ].join("\n"));

    const result = await uninstallHarness({ repoPath: repo, configuredRoots: [root] });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.removedPaths).toContain(".sharkbay");
    expect(result.removedPaths).toContain("AGENTS.md");
    expect(result.gitignoreRemovedLines).toEqual([".sharkbay/runner.json"]);
    await expect(fs.access(path.join(repo, ".sharkbay"))).rejects.toMatchObject({ code: "ENOENT" });
    await expect(fs.access(path.join(repo, "AGENTS.md"))).rejects.toMatchObject({ code: "ENOENT" });
    expect(await fs.readFile(path.join(repo, ".gitignore"), "utf8")).toBe("node_modules/\ndist/\n");
  });

  it("removes recognized legacy harness files while preserving unrelated docs and tasks", async () => {
    const root = await makeTempRoot("harness-uninstall-legacy");
    const repo = await createHarnessFixture(root, "LegacyUninstall");
    await writeText(path.join(repo, "AGENTS.md"), "# Project-owned instructions\n");
    await writeText(path.join(repo, "docs", "product.md"), "# Product\n");
    await writeText(path.join(repo, "docs", "guide.md"), "# Keep\n");
    await writeText(path.join(repo, "tasks", "notes", "readme.md"), "# Keep\n");
    await writeText(path.join(repo, ".gitignore"), [
      "node_modules/",
      "",
      "# Local Ripple harness state",
      ".agent/",
      "tasks/",
      "docs/task.md",
      "docs/learnings.md",
      ".agent/runner.json",
      "",
      ".env",
      "",
    ].join("\n"));

    const result = await uninstallHarness({ repoPath: repo, configuredRoots: [root] });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.removedPaths).toContain(".agent");
    expect(result.removedPaths).toContain("docs/product.md");
    expect(result.removedPaths).toContain("tasks/t-001-fixture");
    expect(result.skippedPaths).toContain("AGENTS.md");
    await expect(fs.access(path.join(repo, ".agent"))).rejects.toMatchObject({ code: "ENOENT" });
    await expect(fs.access(path.join(repo, "docs", "product.md"))).rejects.toMatchObject({ code: "ENOENT" });
    await expect(fs.access(path.join(repo, "tasks", "t-001-fixture"))).rejects.toMatchObject({ code: "ENOENT" });
    await expect(fs.access(path.join(repo, "AGENTS.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(repo, "docs", "guide.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(repo, "tasks", "notes", "readme.md"))).resolves.toBeUndefined();
    expect(await fs.readFile(path.join(repo, ".gitignore"), "utf8")).toBe("node_modules/\n.env\n");
  });

  it("rejects paths outside configured roots and symlinked harness files", async () => {
    const root = await makeTempRoot("harness-uninstall-root");
    const outside = await makeTempRoot("harness-uninstall-outside");
    const outsideRepo = await createContainedHarnessFixture(outside, "OutsideUninstall");

    const unsafe = await uninstallHarness({ repoPath: outsideRepo, configuredRoots: [root] });
    expect(unsafe.ok).toBe(false);
    if (!unsafe.ok) expect(unsafe.reason).toBe("unsafe-path");

    const repo = await createContainedHarnessFixture(root, "SymlinkUninstall");
    await fs.unlink(path.join(repo, ".sharkbay", "protocol.md"));
    await fs.symlink(path.join(outside, "protocol.md"), path.join(repo, ".sharkbay", "protocol.md"));

    const blocked = await uninstallHarness({ repoPath: repo, configuredRoots: [root] });
    expect(blocked.ok).toBe(false);
    if (!blocked.ok) {
      expect(blocked.reason).toBe("blocked");
      expect(blocked.blockers?.join("\n")).toContain(".sharkbay/protocol.md cannot be a symlink.");
    }
  });

  it("cleans only recognized gitignore patterns and adjacent harness marker comments", () => {
    const cleaned = cleanGitignoreContent([
      "# Build output",
      "dist/",
      "",
      "# Local SharkBay dogfood harness state",
      "/.agent/",
      "/tasks/",
      "/docs/task.md",
      "/docs/learnings.md",
      "",
      "# User docs",
      "docs/",
      "",
    ].join("\n"));

    expect(cleaned.removedLines).toEqual(["/.agent/", "/tasks/", "/docs/task.md", "/docs/learnings.md"]);
    expect(cleaned.content).toBe("# Build output\ndist/\n# User docs\ndocs/\n");
  });
});
