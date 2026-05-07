import { promises as fs } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { checkLegacyHarnessCleanup, migrateLegacyHarnessToContained } from "../src/main/legacy-harness-cleanup.js";
import { readProjectDetail } from "../src/main/harness-reader.js";
import { createContainedHarnessFixture, createHarnessFixture, makeTempRoot, writeText } from "./helpers.js";

describe("legacy harness cleanup", () => {
  it("reports contained projects as not needing legacy cleanup", async () => {
    const root = await makeTempRoot("legacy-cleanup-contained");
    const repo = await createContainedHarnessFixture(root, "ContainedProject");

    const check = await checkLegacyHarnessCleanup({ repoPath: repo, configuredRoots: [root] });
    expect(check.ok).toBe(true);
    if (!check.ok) return;
    expect(check.status).toBe("not_needed");
    expect(check.moves).toEqual([]);

    const detail = await readProjectDetail(repo, "manifest", { configuredRoots: [root] });
    expect(detail.legacyHarnessCleanup?.status).toBe("not_needed");
  });

  it("moves recognized legacy harness files and preserves unrelated root docs and tasks", async () => {
    const root = await makeTempRoot("legacy-cleanup-migrate");
    const repo = await createHarnessFixture(root, "LegacyProject");
    await writeText(path.join(repo, ".agent", "queue.md"), "# Queue\n");
    await writeText(path.join(repo, ".agent", "state.md"), "# State\n");
    await writeText(path.join(repo, ".agent", "runner.json"), "{\"status\":\"idle\"}\n");
    await writeText(path.join(repo, ".agent", "quality-rules.md"), "# Quality\n");
    await writeText(path.join(repo, "docs", "product.md"), "# Product\n");
    await writeText(path.join(repo, "docs", "architecture.md"), "# Architecture\n");
    await writeText(path.join(repo, "docs", "project-owned.md"), "# Keep root doc\n");
    await writeText(path.join(repo, "tasks", "_template", "status.md"), "# Template\n");
    await writeText(path.join(repo, "tasks", "notes", "readme.md"), "# Keep root task notes\n");
    await writeText(path.join(repo, ".gitignore"), "node_modules/\n");

    const check = await checkLegacyHarnessCleanup({ repoPath: repo, configuredRoots: [root] });
    expect(check.ok).toBe(true);
    if (!check.ok) return;
    expect(check.status).toBe("ready");
    expect(check.moves.map((move) => move.source)).toContain(".agent/manifest.json");
    expect(check.moves.map((move) => move.source)).toContain("docs/product.md");
    expect(check.moves.map((move) => move.source)).toContain("tasks/t-001-fixture");
    expect(check.moves.map((move) => move.source)).not.toContain("docs/project-owned.md");
    expect(check.moves.map((move) => move.source)).not.toContain("tasks/notes");

    const result = await migrateLegacyHarnessToContained({ repoPath: repo, configuredRoots: [root] });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.status).toBe("migrated");
    expect(result.moves.map((move) => move.target)).toContain(".sharkbay/manifest.json");
    expect(result.moves.map((move) => move.target)).toContain(".sharkbay/docs/product.md");
    expect(result.moves.map((move) => move.target)).toContain(".sharkbay/tasks/t-001-fixture");

    await expect(fs.access(path.join(repo, ".sharkbay", "manifest.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(repo, ".sharkbay", "docs", "product.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(repo, ".sharkbay", "tasks", "t-001-fixture", "status.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(repo, "docs", "project-owned.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(repo, "tasks", "notes", "readme.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(repo, ".gitignore"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(repo, ".agent"))).rejects.toMatchObject({ code: "ENOENT" });
  });

  it("blocks mixed layouts and destination conflicts before moving files", async () => {
    const root = await makeTempRoot("legacy-cleanup-mixed");
    const repo = await createHarnessFixture(root, "MixedProject");
    await writeText(path.join(repo, ".sharkbay", "manifest.json"), "{}\n");

    const check = await checkLegacyHarnessCleanup({ repoPath: repo, configuredRoots: [root] });
    expect(check.ok).toBe(true);
    if (!check.ok) return;
    expect(check.status).toBe("blocked");
    expect(check.blockers.join("\n")).toContain("Both .agent and .sharkbay exist");
    expect(check.blockers.join("\n")).toContain(".sharkbay/manifest.json already exists");

    const result = await migrateLegacyHarnessToContained({ repoPath: repo, configuredRoots: [root] });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBe("blocked");
    await expect(fs.access(path.join(repo, ".agent", "manifest.json"))).resolves.toBeUndefined();
  });

  it("blocks symlinked legacy sources", async () => {
    const root = await makeTempRoot("legacy-cleanup-symlink");
    const repo = await createHarnessFixture(root, "SymlinkProject");
    await fs.unlink(path.join(repo, ".agent", "protocol.md"));
    await fs.symlink(path.join(root, "outside-protocol.md"), path.join(repo, ".agent", "protocol.md"));

    const check = await checkLegacyHarnessCleanup({ repoPath: repo, configuredRoots: [root] });
    expect(check.ok).toBe(true);
    if (!check.ok) return;
    expect(check.status).toBe("blocked");
    expect(check.blockers).toContain(".agent/protocol.md cannot be a symlink.");
  });
});
