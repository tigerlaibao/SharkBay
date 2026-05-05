import { promises as fs } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { createHarnessFixture, makeTempRoot, writeJson } from "./helpers.js";
import { isPathInside, resolveHarnessJsonFile, resolveRepoPath } from "../src/main/path-safety.js";

describe("path safety", () => {
  it("uses path-segment containment instead of string prefix matching", async () => {
    const root = await makeTempRoot("path-root");
    const repo = await createHarnessFixture(root, "SharkBay");
    const sibling = `${repo}-other`;
    await fs.mkdir(sibling);

    expect(isPathInside(repo, path.join(repo, "child"))).toBe(true);
    expect(isPathInside(repo, sibling)).toBe(false);
    await expect(resolveRepoPath(sibling, [repo])).rejects.toThrow(/outside configured roots/);
  });

  it("rejects traversal outside configured roots", async () => {
    const root = await makeTempRoot("path-traversal");
    const repo = await createHarnessFixture(root, "Repo");
    const outside = await makeTempRoot("outside");

    await expect(resolveRepoPath(path.join(repo, "..", "..", path.basename(outside)), [repo])).rejects.toThrow();
  });

  it("rejects symlinked .agent directories and harness JSON files", async () => {
    const root = await makeTempRoot("path-symlink");
    const repo = await createHarnessFixture(root, "Repo");
    const outside = await makeTempRoot("outside-agent");
    await writeJson(path.join(outside, "state.json"), { schemaVersion: 1, active: [], backlog: [], done: [] });

    await fs.rm(path.join(repo, ".agent"), { recursive: true, force: true });
    await fs.symlink(outside, path.join(repo, ".agent"));
    await expect(resolveHarnessJsonFile(repo, [root], ".agent/state.json")).rejects.toThrow(/symlink/);

    await fs.rm(path.join(repo, ".agent"), { recursive: true, force: true });
    await fs.mkdir(path.join(repo, ".agent"));
    await fs.symlink(path.join(outside, "state.json"), path.join(repo, ".agent", "state.json"));
    await expect(resolveHarnessJsonFile(repo, [root], ".agent/state.json")).rejects.toThrow(/symlink/);
  });
});
