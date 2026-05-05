import { promises as fs } from "node:fs";
import { execFile } from "node:child_process";
import path from "node:path";
import { promisify } from "node:util";
import { describe, expect, it } from "vitest";
import { createHarnessFixture, makeTempRoot, writeJson } from "./helpers.js";
import { readProjectDetail } from "../src/main/harness-reader.js";

const execFileAsync = promisify(execFile);

describe("harness reader", () => {
  it("normalizes queue, decisions, revisions, artifacts, and URL values", async () => {
    const root = await makeTempRoot("reader");
    const repo = await createHarnessFixture(root, "ReaderRepo");

    const detail = await readProjectDetail(repo, "manifest");
    expect(detail.name).toBe("ReaderRepo");
    expect(detail.activeTask?.taskId).toBe("t-001-fixture");
    expect(detail.activeTask?.phase).toBe("coding");
    expect(detail.localUrl).toBe("http://manifest.local");
    expect(detail.testUrl).toBeNull();
    expect(detail.deploymentUrl).toBe("https://state.example");
    expect(detail.revisions.state).toMatch(/^sha256:/);
    expect(detail.currentTask?.statusMarkdown).toContain("# Status");
    expect(detail.recentDecisions).toHaveLength(1);
    expect(detail.development?.stack.frontend).toEqual(["React", "TypeScript"]);
    expect(detail.development?.commands.dev).toEqual(["npm run dev"]);
    expect(detail.development?.endpoints.local[0]?.ports).toEqual([5173]);
    expect(detail.runner.status).toBe("unknown");
  });

  it("reads recent git history from the repository reflog", async () => {
    const root = await makeTempRoot("reader-git-history");
    const repo = await createHarnessFixture(root, "GitHistoryRepo");
    await execFileAsync("git", ["-C", repo, "init"]);
    await execFileAsync("git", ["-C", repo, "config", "user.name", "SharkBay Test"]);
    await execFileAsync("git", ["-C", repo, "config", "user.email", "test@sharkbay.local"]);
    await execFileAsync("git", ["-C", repo, "add", "."]);
    await execFileAsync("git", ["-C", repo, "commit", "-m", "Initial harness"]);

    const detail = await readProjectDetail(repo, "manifest");
    expect(detail.gitHistory[0]?.action).toContain("Initial harness");
    expect(detail.gitHistory[0]?.hash).toMatch(/^[0-9a-f]{40}$/);
  });

  it("keeps projects visible when JSON is invalid and suppresses URL fallback from invalid state", async () => {
    const root = await makeTempRoot("reader-invalid");
    const repo = await createHarnessFixture(root, "BrokenRepo");
    await fs.writeFile(path.join(repo, ".agent", "state.json"), "{ not json", "utf8");

    const detail = await readProjectDetail(repo, "manifest");
    expect(detail.name).toBe("BrokenRepo");
    expect(detail.errors.some((error) => error.file.endsWith("state.json"))).toBe(true);
    expect(detail.localUrl).toBeNull();
    expect(detail.deploymentUrl).toBeNull();
  });

  it("reads manifest runtime as fallback only when state JSON is valid", async () => {
    const root = await makeTempRoot("reader-fallback");
    const repo = await createHarnessFixture(root, "FallbackRepo");
    await writeJson(path.join(repo, ".agent", "state.json"), {
      schemaVersion: 1,
      project: {},
      currentTask: { taskId: "t-001-fixture", phase: "coding" },
      recentDecisions: [],
    });

    const detail = await readProjectDetail(repo, "manifest");
    expect(detail.localUrl).toBe("http://manifest.local");
  });

  it("treats missing development metadata as normal and accepts common shorthand metadata", async () => {
    const root = await makeTempRoot("reader-development-compat");
    const repo = await createHarnessFixture(root, "DevelopmentCompatRepo");
    await fs.unlink(path.join(repo, ".agent", "development.json"));

    const missingDetail = await readProjectDetail(repo, "manifest");
    expect(missingDetail.development).toBeNull();
    expect(missingDetail.errors.some((error) => error.file.endsWith("development.json"))).toBe(false);

    await writeJson(path.join(repo, ".agent", "development.json"), {
      schemaVersion: 1,
      stack: {
        framework: "Next.js",
        language: "TypeScript",
      },
      commands: {
        dev: "npm run dev",
        build: "npm run build",
      },
      endpoints: {
        local: ["http://localhost:3000"],
        production: ["https://example.com"],
      },
      ports: [3000, { port: 3001, purpose: "API" }],
    });

    const shorthandDetail = await readProjectDetail(repo, "manifest");
    expect(shorthandDetail.development?.stack.framework).toEqual(["Next.js"]);
    expect(shorthandDetail.development?.commands.dev).toEqual(["npm run dev"]);
    expect(shorthandDetail.development?.endpoints.local[0]?.url).toBe("http://localhost:3000");
    expect(shorthandDetail.development?.ports.map((port) => port.port)).toEqual([3000, 3001]);
    expect(shorthandDetail.errors.some((error) => error.file.endsWith("development.json"))).toBe(false);
  });

  it("reads runner lifecycle metadata and derives stale running sessions", async () => {
    const root = await makeTempRoot("reader-runner");
    const repo = await createHarnessFixture(root, "RunnerRepo");
    const runnerFile = path.join(repo, ".agent", "runner.json");

    const missingRunner = await readProjectDetail(repo, "manifest");
    expect(missingRunner.runner.status).toBe("unknown");
    expect(missingRunner.errors.some((error) => error.file.endsWith("runner.json"))).toBe(false);

    await writeJson(runnerFile, {
      schemaVersion: 1,
      status: "running",
      sessionId: "test-runner",
      owner: "vitest",
      taskId: "t-001-fixture",
      phase: "coding",
      startedAt: new Date().toISOString(),
      heartbeatAt: new Date().toISOString(),
      message: "Running focused tests",
    });

    const freshRunner = await readProjectDetail(repo, "manifest");
    expect(freshRunner.runner.status).toBe("running");
    expect(freshRunner.runner.stale).toBe(false);
    expect(freshRunner.runner.taskId).toBe("t-001-fixture");

    await writeJson(runnerFile, {
      schemaVersion: 1,
      status: "running",
      heartbeatAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    });

    const staleRunner = await readProjectDetail(repo, "manifest");
    expect(staleRunner.runner.status).toBe("stale");
    expect(staleRunner.runner.stale).toBe(true);

    await writeJson(runnerFile, {
      schemaVersion: 1,
      status: "running",
    });

    const missingHeartbeatRunner = await readProjectDetail(repo, "manifest");
    expect(missingHeartbeatRunner.runner.status).toBe("stale");
    expect(missingHeartbeatRunner.runner.stale).toBe(true);

    await writeJson(runnerFile, {
      schemaVersion: 1,
      status: "waiting_for_human",
      reason: "Choose the next task",
    });

    const waitingRunner = await readProjectDetail(repo, "manifest");
    expect(waitingRunner.runner.status).toBe("waiting_for_human");
    expect(waitingRunner.runner.reason).toBe("Choose the next task");
  });

  it("keeps projects visible when runner metadata is invalid", async () => {
    const root = await makeTempRoot("reader-runner-invalid");
    const repo = await createHarnessFixture(root, "InvalidRunnerRepo");
    await writeJson(path.join(repo, ".agent", "runner.json"), {
      schemaVersion: 1,
      status: "paused",
    });

    const detail = await readProjectDetail(repo, "manifest");
    expect(detail.runner.status).toBe("unknown");
    expect(detail.errors.some((error) => error.file.endsWith("runner.json"))).toBe(true);
  });

  it("rejects symlinked harness JSON and unsafe task ids during detail reads", async () => {
    const root = await makeTempRoot("reader-symlink");
    const repo = await createHarnessFixture(root, "SymlinkRepo");
    const outside = await makeTempRoot("reader-outside");
    await writeJson(path.join(outside, "state.json"), {
      schemaVersion: 1,
      project: { localUrl: "https://symlink-leak.example" },
      recentDecisions: [],
    });
    await fs.unlink(path.join(repo, ".agent", "state.json"));
    await fs.symlink(path.join(outside, "state.json"), path.join(repo, ".agent", "state.json"));

    const symlinkDetail = await readProjectDetail(repo, "manifest");
    expect(symlinkDetail.localUrl).toBeNull();
    expect(symlinkDetail.errors.some((error) => /symlink/i.test(error.message))).toBe(true);

    await fs.unlink(path.join(repo, ".agent", "state.json"));
    await writeJson(path.join(repo, ".agent", "state.json"), {
      schemaVersion: 1,
      project: {},
      currentTask: { taskId: "../outside", phase: "coding" },
      recentDecisions: [],
    });
    await writeJson(path.join(repo, ".agent", "queue.json"), {
      schemaVersion: 1,
      active: [],
      backlog: [],
      done: [],
    });

    const unsafeTaskDetail = await readProjectDetail(repo, "manifest");
    expect(unsafeTaskDetail.currentTask).toEqual({
      statusMarkdown: null,
      specMarkdown: null,
      designMarkdown: null,
      designReviewMarkdown: null,
      contractMarkdown: null,
      codeReviewMarkdown: null,
      verificationMarkdown: null,
      decisionsMarkdown: null,
      implementationMarkdown: null,
    });
    expect(unsafeTaskDetail.errors.some((error) => /unsafe path/.test(error.message))).toBe(true);
  });
});
