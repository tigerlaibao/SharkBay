import { promises as fs } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { createContainedHarnessFixture, createHarnessFixture, makeTempRoot, writeJson } from "./helpers.js";
import { applyHarnessPatch, updateProjectUrls } from "../src/main/harness-writer.js";
import { readJsonFile } from "../src/main/json-file.js";

describe("harness writer", () => {
  it("writes contained .sharkbay state when the project uses the contained layout", async () => {
    const root = await makeTempRoot("writer-contained");
    const repo = await createContainedHarnessFixture(root, "ContainedWriterRepo");
    const file = path.join(repo, ".sharkbay", "state.json");
    const before = await readJsonFile(file);
    if (!before.ok) throw new Error("fixture failed");

    const result = await applyHarnessPatch({
      repoPath: repo,
      configuredRoots: [root],
      file: ".agent/state.json",
      expectedRevision: before.revision,
      patch: { type: "updateProjectUrls", urls: { localUrl: "https://contained.example" } },
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const after = await readJsonFile(file);
    if (!after.ok || typeof after.data !== "object" || after.data === null) throw new Error("reread failed");
    expect((after.data as any).project.localUrl).toBe("https://contained.example");
    await expect(fs.access(path.join(repo, ".agent", "state.json"))).rejects.toThrow();
  });

  it("updates state URLs while preserving unknown fields and returning a new revision", async () => {
    const root = await makeTempRoot("writer");
    const repo = await createHarnessFixture(root, "WriterRepo");
    const file = path.join(repo, ".agent", "state.json");
    const before = await readJsonFile(file);
    if (!before.ok) throw new Error("fixture failed");

    const result = await applyHarnessPatch({
      repoPath: repo,
      configuredRoots: [root],
      file: ".agent/state.json",
      expectedRevision: before.revision,
      patch: { type: "updateProjectUrls", urls: { localUrl: " http://localhost:5173 ", testUrl: "   " } },
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.revision).not.toBe(before.revision);
    const after = await readJsonFile(file);
    if (!after.ok || typeof after.data !== "object" || after.data === null) throw new Error("reread failed");
    const data = after.data as Record<string, any>;
    expect(data.customStateKey).toBe(true);
    expect(data.project.localUrl).toBe("http://localhost:5173");
    expect(data.project.testUrl).toBeNull();
    expect(await fs.readFile(file, "utf8")).toMatch(/\n$/);
  });

  it("blocks stale revisions and leaves the file untouched", async () => {
    const root = await makeTempRoot("writer-conflict");
    const repo = await createHarnessFixture(root, "ConflictRepo");
    const file = path.join(repo, ".agent", "state.json");
    const before = await readJsonFile(file);
    if (!before.ok) throw new Error("fixture failed");
    await writeJson(file, { schemaVersion: 1, project: {}, recentDecisions: [], changed: true });

    const result = await applyHarnessPatch({
      repoPath: repo,
      configuredRoots: [root],
      file: ".agent/state.json",
      expectedRevision: before.revision,
      patch: { type: "updateProjectUrls", urls: { localUrl: "https://example.com" } },
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBe("conflict");
    expect((result.latestData as any).changed).toBe(true);
  });

  it("rejects invalid JSON, unsupported file/patch pairs, invalid URLs, and symlinked target files", async () => {
    const root = await makeTempRoot("writer-invalid");
    const repo = await createHarnessFixture(root, "InvalidRepo");
    const stateFile = path.join(repo, ".agent", "state.json");
    const before = await readJsonFile(stateFile);
    if (!before.ok) throw new Error("fixture failed");

    const unsupported = await applyHarnessPatch({
      repoPath: repo,
      configuredRoots: [root],
      file: ".agent/manifest.json",
      expectedRevision: "unused",
      patch: { type: "updateProjectUrls", urls: { localUrl: "https://example.com" } },
    });
    expect(unsupported.ok).toBe(false);
    if (!unsupported.ok) expect(unsupported.reason).toBe("unsupported-patch");

    const invalidUrl = await applyHarnessPatch({
      repoPath: repo,
      configuredRoots: [root],
      file: ".agent/state.json",
      expectedRevision: before.revision,
      patch: { type: "updateProjectUrls", urls: { localUrl: "ftp://example.com" } },
    });
    expect(invalidUrl.ok).toBe(false);
    if (!invalidUrl.ok) expect(invalidUrl.reason).toBe("invalid-schema");

    await fs.writeFile(stateFile, "{ nope", "utf8");
    const invalidJson = await applyHarnessPatch({
      repoPath: repo,
      configuredRoots: [root],
      file: ".agent/state.json",
      expectedRevision: before.revision,
      patch: { type: "updateProjectUrls", urls: { localUrl: "https://example.com" } },
    });
    expect(invalidJson.ok).toBe(false);
    if (!invalidJson.ok) expect(invalidJson.reason).toBe("invalid-json");

    await fs.unlink(stateFile);
    await fs.symlink(path.join(root, "outside-state.json"), stateFile);
    const symlinked = await applyHarnessPatch({
      repoPath: repo,
      configuredRoots: [root],
      file: ".agent/state.json",
      expectedRevision: before.revision,
      patch: { type: "updateProjectUrls", urls: { localUrl: "https://example.com" } },
    });
    expect(symlinked.ok).toBe(false);
    if (!symlinked.ok) expect(symlinked.reason).toBe("unsafe-path");
  });

  it("updates queue tasks without dropping unknown task fields", async () => {
    const root = await makeTempRoot("writer-queue");
    const repo = await createHarnessFixture(root, "QueueRepo");
    const file = path.join(repo, ".agent", "queue.json");
    const before = await readJsonFile(file);
    if (!before.ok) throw new Error("fixture failed");

    const result = await applyHarnessPatch({
      repoPath: repo,
      configuredRoots: [root],
      file: ".agent/queue.json",
      expectedRevision: before.revision,
      patch: { type: "updateQueueTask", section: "active", taskId: "t-001-fixture", changes: { phase: "verification" } },
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const data = result.data as any;
    expect(data.active[0].phase).toBe("verification");
    expect(data.active[0].customTaskKey).toBe("keep-me");
  });

  it("runtime URL updates ignore renderer-supplied configured roots", async () => {
    const allowedRoot = await makeTempRoot("writer-runtime-allowed");
    const outsideRoot = await makeTempRoot("writer-runtime-outside");
    const userDataPath = await makeTempRoot("writer-runtime-config");
    const allowedRepo = await createHarnessFixture(allowedRoot, "AllowedWriter");
    const outsideRepo = await createHarnessFixture(outsideRoot, "OutsideWriter");
    const outsideState = await readJsonFile(path.join(outsideRepo, ".agent", "state.json"));
    if (!outsideState.ok) throw new Error("fixture failed");
    await writeJson(path.join(userDataPath, "config.json"), {
      schemaVersion: 1,
      configuredRoots: [allowedRoot],
      updatedAt: "2026-05-05",
    });

    const result = await updateProjectUrls(
      { userDataPath },
      {
        repoPath: outsideRepo,
        configuredRoots: [outsideRoot],
        expectedRevision: outsideState.revision,
        urls: { localUrl: "https://bypass.example" },
      },
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe("unsafe-path");

    const allowedState = await readJsonFile(path.join(allowedRepo, ".agent", "state.json"));
    expect(allowedState.ok).toBe(true);
  });
});
