import { promises as fs } from "node:fs";
import { execFile } from "node:child_process";
import path from "node:path";
import { promisify } from "node:util";
import { describe, expect, it } from "vitest";
import { createGitRepoFixture, makeTempRoot, writeJson } from "./helpers.js";
import { getRuntimeConfigPath } from "../src/main/config.js";
import { scanProjects } from "../src/main/scanner.js";

const execFileAsync = promisify(execFile);

async function writeProjectConfig(userDataPath: string, configuredProjects: string[], extra: Record<string, unknown> = {}): Promise<void> {
  await writeJson(getRuntimeConfigPath({ userDataPath }), {
    schemaVersion: 1,
    configuredProjects,
    updatedAt: "2026-05-16",
    ...extra,
  });
}

describe("scanner", () => {
  const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=", "base64");

  it("lists manually configured projects sorted by name", async () => {
    const userDataPath = await makeTempRoot("scanner-manual-user-data");
    const root = await makeTempRoot("scanner-manual-root");
    const projectB = await createGitRepoFixture(root, "ProjectB");
    const projectA = await createGitRepoFixture(root, "ProjectA");
    await writeProjectConfig(userDataPath, [projectB, projectA]);

    const result = await scanProjects({ userDataPath });

    expect(result.candidates.map((c) => c.name)).toEqual(["ProjectA", "ProjectB"]);
  });

  it("ignores legacy configured roots and unconfigured repositories", async () => {
    const userDataPath = await makeTempRoot("scanner-legacy-roots-user-data");
    const root = await makeTempRoot("scanner-legacy-roots");
    const scannedRepo = await createGitRepoFixture(root, "ScannedRepo");
    const manualRepo = await createGitRepoFixture(root, "ManualRepo");
    await writeProjectConfig(userDataPath, [manualRepo], { configuredRoots: [root] });

    const result = await scanProjects({ userDataPath });

    expect(result.candidates.map((c) => c.path)).toEqual([await fs.realpath(manualRepo)]);
    expect(result.candidates.map((c) => c.path)).not.toContain(await fs.realpath(scannedRepo));
  });

  it("discovers project dev services from package.json scripts", async () => {
    const userDataPath = await makeTempRoot("scanner-services-user-data");
    const root = await makeTempRoot("scanner-services");
    const repo = await createGitRepoFixture(root, "ServiceApp");
    await writeJson(path.join(repo, "package.json"), {
      name: "service-app",
      scripts: { dev: "vite", start: "node server.js" },
    });
    await writeProjectConfig(userDataPath, [repo]);

    const result = await scanProjects({ userDataPath });
    const candidate = result.candidates.find((c) => c.name === "ServiceApp");

    expect(candidate?.services.length).toBeGreaterThan(0);
  });

  it("adds git dirty worktree state to project rows", async () => {
    const userDataPath = await makeTempRoot("scanner-dirty-user-data");
    const root = await makeTempRoot("scanner-dirty");
    const repo = path.join(root, "DirtyRepo");
    await fs.mkdir(repo, { recursive: true });
    await execFileAsync("git", ["init"], { cwd: repo });
    await writeJson(path.join(repo, "package.json"), { name: "dirty-repo", version: "1.0.0" });
    await writeProjectConfig(userDataPath, [repo]);

    const result = await scanProjects({ userDataPath });
    const candidate = result.candidates.find((c) => c.name === "DirtyRepo");

    expect(candidate?.dirtyWorktree).toBe(true);
  });

  it("adds package-declared local icon candidates to project rows", async () => {
    const userDataPath = await makeTempRoot("scanner-icons-user-data");
    const root = await makeTempRoot("scanner-icons");
    const repo = await createGitRepoFixture(root, "IconRepo");
    await writeJson(path.join(repo, "package.json"), {
      build: { mac: { icon: "resources/custom-icon.png" } },
    });
    await fs.mkdir(path.join(repo, "resources"), { recursive: true });
    await fs.writeFile(path.join(repo, "resources", "custom-icon.png"), png);
    await writeProjectConfig(userDataPath, [repo]);

    const result = await scanProjects({ userDataPath });
    const candidate = result.candidates.find((c) => c.name === "IconRepo");

    expect(candidate?.iconSources[0]).toEqual(expect.objectContaining({ kind: "local", label: "custom-icon.png" }));
    expect(candidate?.iconSources[0]?.url).toMatch(/^data:image\/png;base64,/);
  });
});
