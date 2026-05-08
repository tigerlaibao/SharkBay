import { promises as fs } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { createContainedHarnessFixture, createHarnessFixture, makeTempRoot, writeJson, writeText } from "./helpers.js";
import { scanConfiguredRoots, scanProjects } from "../src/main/scanner.js";

describe("scanner", () => {
  it("adds ordered local icon and favicon candidates to project rows", async () => {
    const root = await makeTempRoot("scanner-icons");
    const repo = await createHarnessFixture(root, "IconRepo");
    await writeJson(path.join(repo, "package.json"), {
      build: { mac: { icon: "resources/custom-icon.png" } },
    });
    await fs.mkdir(path.join(repo, "resources"), { recursive: true });
    await fs.writeFile(
      path.join(repo, "resources", "custom-icon.png"),
      Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=", "base64"),
    );
    await fs.mkdir(path.join(repo, "public"), { recursive: true });
    await fs.writeFile(
      path.join(repo, "public", "favicon.png"),
      Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=", "base64"),
    );

    const result = await scanConfiguredRoots([root]);
    const project = result.projects.find((item) => item.name === "IconRepo");
    const candidate = result.candidates.find((item) => item.name === "IconRepo");

    expect(project?.iconSources[0]).toEqual(expect.objectContaining({ kind: "local", label: "custom-icon.png" }));
    expect(project?.iconSources[0]?.url).toMatch(/^data:image\/png;base64,/);
    expect(project?.iconSources.some((source) => source.kind === "favicon" && source.url === "https://state.example/favicon.ico")).toBe(true);
    expect(candidate?.iconSources[0]).toEqual(project?.iconSources[0]);
  });

  it("adds local icon candidates to not-setup project rows", async () => {
    const root = await makeTempRoot("scanner-not-setup-icons");
    const plainRepo = path.join(root, "PlainRepo");
    await fs.mkdir(path.join(plainRepo, "resources"), { recursive: true });
    await fs.writeFile(
      path.join(plainRepo, "resources", "icon.png"),
      Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=", "base64"),
    );

    const result = await scanConfiguredRoots([root]);
    const candidate = result.candidates.find((item) => item.name === "PlainRepo");

    expect(candidate?.status).toBe("not_setup");
    expect(candidate?.iconSources[0]).toEqual(expect.objectContaining({ kind: "local", label: "icon.png" }));
  });

  it("adds root package.json dev services to project candidates", async () => {
    const root = await makeTempRoot("scanner-dev-services");
    const plainRepo = path.join(root, "PlainRepo");
    await fs.mkdir(plainRepo, { recursive: true });
    await writeJson(path.join(plainRepo, "package.json"), {
      packageManager: "pnpm@9.0.0",
      scripts: {
        dev: "vite",
      },
    });

    const result = await scanConfiguredRoots([root]);
    const candidate = result.candidates.find((item) => item.name === "PlainRepo");

    expect(candidate?.services).toEqual([
      {
        id: "dev",
        label: "dev",
        command: "pnpm dev",
        script: "vite",
      },
    ]);
  });

  it("prefers semantic project icons over app icons for project rows", async () => {
    const root = await makeTempRoot("scanner-project-icon");
    const plainRepo = path.join(root, "PlainRepo");
    const image = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=", "base64");
    await fs.mkdir(path.join(plainRepo, "resources"), { recursive: true });
    await fs.writeFile(path.join(plainRepo, "resources", "project-icon.png"), image);
    await fs.writeFile(path.join(plainRepo, "resources", "app-icon.png"), image);

    const result = await scanConfiguredRoots([root]);
    const candidate = result.candidates.find((item) => item.name === "PlainRepo");

    expect(candidate?.iconSources[0]).toEqual(expect.objectContaining({ kind: "local", label: "project-icon.png" }));
  });

  it("discovers manifest and protocol-fallback repos", async () => {
    const root = await makeTempRoot("scanner");
    await createHarnessFixture(root, "ManifestRepo");
    await createContainedHarnessFixture(root, "ContainedRepo");
    await writeText(path.join(root, "ProtocolRepo", ".agent", "protocol.md"), "# Protocol\n");

    const result = await scanConfiguredRoots([root]);
    expect(result.projects.map((project) => [project.name, project.detection])).toContainEqual(["ContainedRepo", "manifest"]);
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
