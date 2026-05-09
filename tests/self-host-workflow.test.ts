import { promises as fs } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { addConfiguredRoot, loadAppConfig, removeConfiguredRoot } from "../src/main/config.js";
import { readProjectDetail } from "../src/main/harness-reader.js";
import { updateProjectUrls } from "../src/main/harness-writer.js";
import { scanConfiguredRoots } from "../src/main/scanner.js";
import { createSelfHostFixture, makeTempRoot } from "./helpers.js";

describe("self-host workflow", () => {
  it("persists root add, list, and remove operations", async () => {
    const configDir = await makeTempRoot("roots-config");
    const configPath = path.join(configDir, "config.json");
    const rootA = await makeTempRoot("roots-a");
    const rootB = await makeTempRoot("roots-b");

    expect((await loadAppConfig(configPath)).configuredRoots).toEqual([]);

    await addConfiguredRoot(rootA, configPath);
    await addConfiguredRoot(path.join(rootA, "."), configPath);
    await addConfiguredRoot(rootB, configPath);

    expect((await loadAppConfig(configPath)).configuredRoots).toEqual([path.resolve(rootA), path.resolve(rootB)]);

    await removeConfiguredRoot(rootA, configPath);
    expect((await loadAppConfig(configPath)).configuredRoots).toEqual([path.resolve(rootB)]);
  });

  it("migrates legacy classic appearance config to morning", async () => {
    const configDir = await makeTempRoot("appearance-config");
    const configPath = path.join(configDir, "config.json");
    await fs.writeFile(
      configPath,
      JSON.stringify({
        schemaVersion: 1,
        configuredRoots: [],
        appearanceTheme: "classic",
        updatedAt: "2026-05-08",
      }),
      "utf8",
    );

    expect((await loadAppConfig(configPath)).appearanceTheme).toBe("morning");
  });

  it("discovers a SharkBay-like fixture as a manifest self-host project", async () => {
    const root = await makeTempRoot("self-host-scan");
    const repo = await createSelfHostFixture(root);
    const realRepo = await fs.realpath(repo);

    const scan = await scanConfiguredRoots([root]);
    const project = scan.projects.find((item) => item.path === realRepo);

    expect(project).toBeDefined();
    expect(project?.name).toBe("SharkBay");
    expect(project?.detection).toBe("manifest");
    expect(project?.activeTask?.taskId).toBe("t-002-self-hosting-ux");
    expect(project?.activeTask?.phase).toBe("coding");
  });

  it("updates URLs with a current revision and rejects stale revision conflicts", async () => {
    const root = await makeTempRoot("self-host-url");
    const repo = await createSelfHostFixture(root);
    const stateFile = path.join(repo, ".agent", "state.json");
    const before = await readProjectDetail(repo, "manifest", { configuredRoots: [root] });

    expect(before.revisions.state).toMatch(/^sha256:/);

    const saved = await updateProjectUrls({
      repoPath: repo,
      configuredRoots: [root],
      expectedRevision: before.revisions.state ?? "",
      urls: {
        localUrl: " http://127.0.0.1:5173 ",
        testUrl: "",
        deploymentUrl: "https://preview.sharkbay.example",
      },
    });

    expect(saved.ok).toBe(true);
    if (!saved.ok) return;
    expect(saved.revision).not.toBe(before.revisions.state);

    const refreshed = await readProjectDetail(repo, "manifest", { configuredRoots: [root] });
    expect(refreshed.localUrl).toBe("http://127.0.0.1:5173");
    expect(refreshed.testUrl).toBeNull();
    expect(refreshed.deploymentUrl).toBe("https://preview.sharkbay.example");
    expect(refreshed.revisions.state).toBe(saved.revision);

    const afterSaveText = await fs.readFile(stateFile, "utf8");
    const stale = await updateProjectUrls({
      repoPath: repo,
      configuredRoots: [root],
      expectedRevision: before.revisions.state ?? "",
      urls: { localUrl: "https://stale.sharkbay.example" },
    });

    expect(stale.ok).toBe(false);
    if (!stale.ok) {
      expect(stale.reason).toBe("conflict");
    }
    expect(await fs.readFile(stateFile, "utf8")).toBe(afterSaveText);
  });
});
