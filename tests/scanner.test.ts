import { promises as fs } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { createHarnessFixture, makeTempRoot, writeJson, writeText } from "./helpers.js";
import { scanConfiguredRoots, scanProjects } from "../src/main/scanner.js";

describe("scanner", () => {
  it("discovers manifest and protocol-fallback repos", async () => {
    const root = await makeTempRoot("scanner");
    await createHarnessFixture(root, "ManifestRepo");
    await writeText(path.join(root, "ProtocolRepo", ".agent", "protocol.md"), "# Protocol\n");

    const result = await scanConfiguredRoots([root]);
    expect(result.projects.map((project) => [project.name, project.detection])).toContainEqual(["ManifestRepo", "manifest"]);
    expect(result.projects.map((project) => [project.name, project.detection])).toContainEqual(["ProtocolRepo", "protocol-fallback"]);
    expect(result.candidates.map((candidate) => [candidate.name, candidate.status])).toContainEqual(["ManifestRepo", "managed"]);
    expect(result.candidates.map((candidate) => [candidate.name, candidate.status])).toContainEqual(["ProtocolRepo", "managed"]);
  });

  it("returns direct child candidates without treating plain folders as managed projects", async () => {
    const root = await makeTempRoot("scanner-candidates");
    await createHarnessFixture(root, "ManagedRepo");
    await fs.mkdir(path.join(root, "PlainRepo"), { recursive: true });
    await createHarnessFixture(path.join(root, "Container"), "NestedManagedRepo");

    const result = await scanConfiguredRoots([root]);
    expect(result.projects.map((project) => project.name).sort()).toEqual(["ManagedRepo", "NestedManagedRepo"]);
    expect(result.candidates.map((candidate) => [candidate.name, candidate.status]).sort()).toEqual([
      ["Container", "not_setup"],
      ["ManagedRepo", "managed"],
      ["NestedManagedRepo", "managed"],
      ["PlainRepo", "not_setup"],
    ]);

    const plain = result.candidates.find((candidate) => candidate.name === "PlainRepo");
    expect(plain?.managedProjectId).toBeNull();
    expect(plain?.detection).toBeNull();
  });

  it("includes a configured root when the root itself is managed", async () => {
    const parent = await makeTempRoot("scanner-root-project");
    const repo = await createHarnessFixture(parent, "RootProject");
    const realRepo = await fs.realpath(repo);

    const result = await scanConfiguredRoots([repo]);
    expect(result.projects.map((project) => project.path)).toContain(realRepo);
    expect(result.candidates).toContainEqual(
      expect.objectContaining({
        path: realRepo,
        status: "managed",
        managedProjectId: realRepo,
      }),
    );
  });

  it("skips heavy ignored directories without aborting unavailable roots", async () => {
    const root = await makeTempRoot("scanner-ignore");
    await createHarnessFixture(path.join(root, "node_modules"), "HiddenRepo");
    await createHarnessFixture(path.join(root, "dist"), "BuiltRepo");
    await fs.mkdir(path.join(root, ".cache", "Nested"), { recursive: true });
    await fs.mkdir(path.join(root, ".hidden-project"), { recursive: true });
    await createHarnessFixture(root, "VisibleRepo");

    const result = await scanConfiguredRoots([root, path.join(root, "missing")]);
    expect(result.roots.some((scanRoot) => !scanRoot.available)).toBe(true);
    expect(result.projects.map((project) => project.name)).toEqual(["VisibleRepo"]);
    expect(result.candidates.map((candidate) => candidate.name)).toEqual(["VisibleRepo"]);
  });

  it("does not follow symlinked child directories as candidates", async () => {
    const root = await makeTempRoot("scanner-symlink-root");
    const outside = await makeTempRoot("scanner-symlink-outside");
    await fs.mkdir(path.join(root, "PlainRepo"), { recursive: true });
    await fs.symlink(outside, path.join(root, "LinkedOutside"), "dir");

    const result = await scanConfiguredRoots([root]);
    expect(result.candidates.map((candidate) => candidate.name)).toEqual(["PlainRepo"]);
  });

  it("runtime scan ignores renderer-supplied configured roots", async () => {
    const allowedRoot = await makeTempRoot("scanner-runtime-allowed");
    const outsideRoot = await makeTempRoot("scanner-runtime-outside");
    const userDataPath = await makeTempRoot("scanner-runtime-config");
    await createHarnessFixture(allowedRoot, "AllowedRepo");
    await createHarnessFixture(outsideRoot, "OutsideRepo");
    await writeJson(path.join(userDataPath, "config.json"), {
      schemaVersion: 1,
      configuredRoots: [allowedRoot],
      updatedAt: "2026-05-05",
    });

    const result = await scanProjects({ userDataPath }, { configuredRoots: [outsideRoot] });
    expect(result.roots).toHaveLength(1);
    expect(result.roots[0]?.inputPath).toBe(allowedRoot);
    expect(result.projects.map((project) => project.name)).toEqual(["AllowedRepo"]);
    expect(result.candidates.map((candidate) => candidate.name)).toEqual(["AllowedRepo"]);
  });
});
