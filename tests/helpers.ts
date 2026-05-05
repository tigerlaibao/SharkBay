import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import type { ProjectDetail, ProjectSummary, TaskArtifacts } from "../src/shared/types.js";

export const workflowArtifactKeys = [
  "statusMarkdown",
  "specMarkdown",
  "designMarkdown",
  "designReviewMarkdown",
  "contractMarkdown",
  "implementationMarkdown",
  "codeReviewMarkdown",
  "verificationMarkdown",
  "decisionsMarkdown",
] as const satisfies Array<keyof TaskArtifacts>;

export const workflowDetailSurfaces = [
  "overview",
  "queue",
  "current-task-artifacts",
  "recent-decisions",
  "harness-errors",
  "runner-lifecycle",
  "revisions",
  "url-editor",
  "prompt",
] as const;

export async function makeTempRoot(prefix: string): Promise<string> {
  return fs.mkdtemp(path.join(os.tmpdir(), `sharkbay-${prefix}-`));
}

export async function writeJson(filePath: string, data: unknown): Promise<void> {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

export async function writeText(filePath: string, content: string): Promise<void> {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, content, "utf8");
}

export async function createHarnessFixture(root: string, name = "FixtureApp"): Promise<string> {
  const repo = path.join(root, name);
  await fs.mkdir(path.join(repo, ".agent"), { recursive: true });
  await writeJson(path.join(repo, ".agent", "manifest.json"), {
    schemaVersion: 1,
    project: { name, slug: name.toLowerCase() },
    repository: { githubUrl: "git@example.test:fixture/repo.git" },
    runtime: { localUrl: "http://manifest.local", testUrl: "unknown", deploymentUrl: "https://manifest.example" },
    files: { development: ".agent/development.json" },
  });
  await writeJson(path.join(repo, ".agent", "development.json"), {
    schemaVersion: 1,
    updatedAt: "2026-05-05T12:30:00+08:00",
    maintainedBy: "test-agent",
    stack: { frontend: ["React", "TypeScript"], runtime: ["Node.js"] },
    environment: { packageManager: "npm", setupCommands: ["npm install"], requiredEnvFiles: [] },
    commands: { dev: ["npm run dev"], test: ["npm test"] },
    endpoints: {
      local: [{ label: "Fixture local", url: "http://localhost:5173", ports: [5173], source: "test" }],
      test: [],
      production: [],
    },
    ports: [{ port: 5173, protocol: "http", purpose: "Fixture dev server", status: "expected" }],
    tools: ["vitest"],
    notes: [],
  });
  await writeJson(path.join(repo, ".agent", "state.json"), {
    schemaVersion: 1,
    updatedAt: "2026-05-05",
    repository: { currentBranch: "main", dirtyWorktree: false },
    project: { localUrl: "unknown", testUrl: "", deploymentUrl: "https://state.example" },
    currentTask: { taskId: "t-001-fixture", phase: "coding", nextAction: "Test it", blockedBy: [] },
    recentDecisions: [{ date: "2026-05-05", decision: "Test decision", source: "test" }],
    customStateKey: true,
  });
  await writeJson(path.join(repo, ".agent", "queue.json"), {
    schemaVersion: 1,
    updatedAt: "2026-05-05",
    active: [
      {
        priority: 1,
        taskId: "t-001-fixture",
        title: "Fixture task",
        phase: "coding",
        dependsOn: [],
        status: "active",
        customTaskKey: "keep-me",
      },
    ],
    backlog: [],
    done: [],
  });
  await writeText(path.join(repo, ".agent", "protocol.md"), "# Protocol\n");
  await writeText(path.join(repo, "tasks", "t-001-fixture", "status.md"), "# Status\n");
  await writeText(path.join(repo, "tasks", "t-001-fixture", "contract.md"), "# Contract\n");
  return repo;
}

export async function createSelfHostFixture(root: string): Promise<string> {
  const repo = path.join(root, "SharkBay");
  const taskId = "t-002-self-hosting-ux";

  await fs.mkdir(path.join(repo, ".agent"), { recursive: true });
  await writeJson(path.join(repo, ".agent", "manifest.json"), {
    schemaVersion: 1,
    project: {
      name: "SharkBay",
      slug: "sharkbay",
      type: "local-first-macos-app",
      description: "A macOS local dashboard for harness-enabled repositories.",
    },
    repository: {
      path: ".",
      gitRoot: repo,
      remoteOrigin: "git@github.com:SharkUI/sharkbay.git",
      githubUrl: "git@github.com:SharkUI/sharkbay.git",
      defaultBranch: "main",
    },
    runtime: {
      localUrl: "http://localhost:5173",
      testUrl: "unknown",
      deploymentUrl: "https://sharkbay.example",
    },
  });
  await writeJson(path.join(repo, ".agent", "state.json"), {
    schemaVersion: 1,
    updatedAt: "2026-05-05",
    repository: {
      isGitRepository: true,
      gitRoot: repo,
      currentBranch: "main",
      defaultBranch: "main",
      remoteOrigin: "git@github.com:SharkUI/sharkbay.git",
      githubUrl: "git@github.com:SharkUI/sharkbay.git",
      dirtyWorktree: false,
    },
    project: {
      name: "SharkBay",
      localUrl: "http://localhost:5173",
      testUrl: "https://test.sharkbay.example",
      deploymentUrl: "https://sharkbay.example",
    },
    currentTask: {
      taskId,
      phase: "coding",
      nextAction: "Implement the self-hosting workflow polish according to the contract.",
      blockedBy: [],
    },
    recentDecisions: [
      {
        date: "2026-05-05",
        decision: "Design review passed for t-002-self-hosting-ux; contract written and coding opened.",
        source: "tasks/t-002-self-hosting-ux/contract.md",
      },
    ],
  });
  await writeJson(path.join(repo, ".agent", "queue.json"), {
    schemaVersion: 1,
    updatedAt: "2026-05-05",
    active: [
      {
        priority: 1,
        taskId,
        title: "Polish the self-hosting dashboard workflow",
        phase: "coding",
        dependsOn: ["t-001-sharkbay-mvp-spec"],
        status: "active",
        gateStatus: "pending",
      },
    ],
    backlog: [
      {
        priority: 2,
        taskId: "t-003-later",
        title: "Later task",
        phase: "spec",
        dependsOn: [],
        status: "backlog",
      },
    ],
    done: [
      {
        priority: 1,
        taskId: "t-001-sharkbay-mvp-spec",
        title: "Define SharkBay MVP product, architecture, and implementation plan",
        phase: "done",
        dependsOn: [],
        status: "done",
      },
    ],
  });
  await writeText(path.join(repo, ".agent", "protocol.md"), "# Protocol\n");

  const taskDir = path.join(repo, "tasks", taskId);
  await writeText(path.join(taskDir, "status.md"), "# Task Status\n\nPhase: coding\n");
  await writeText(path.join(taskDir, "spec.md"), "# Spec\n\nSelf-hosting workflow polish.\n");
  await writeText(path.join(taskDir, "design.md"), "# Design\n\nDetail view sections and safe URL editor.\n");
  await writeText(path.join(taskDir, "design-review.md"), "# Design Review\n\nPass.\n");
  await writeText(path.join(taskDir, "contract.md"), "# Implementation Contract\n\nRequired checks are explicit.\n");
  await writeText(path.join(taskDir, "implementation.md"), "# Implementation\n\nPending.\n");
  await writeText(path.join(taskDir, "code-review.md"), "# Code Review\n\nPending.\n");
  await writeText(path.join(taskDir, "verification.md"), "# Verification\n\nPending.\n");
  await writeText(path.join(taskDir, "decisions.md"), "# Decisions\n\nNo task-local decisions yet.\n");

  return repo;
}

export function missingWorkflowDetailSurfaces(detail: ProjectDetail): string[] {
  const missing: string[] = [];
  const hasOwn = (source: object, key: string): boolean => Object.prototype.hasOwnProperty.call(source, key);

  if (
    !detail.name ||
    !detail.path ||
    !detail.detection ||
    !hasOwn(detail, "repoUrl") ||
    !hasOwn(detail, "currentBranch") ||
    !hasOwn(detail, "dirtyWorktree") ||
    !hasOwn(detail, "activeTask") ||
    !hasOwn(detail, "localUrl") ||
    !hasOwn(detail, "testUrl") ||
    !hasOwn(detail, "deploymentUrl")
  ) {
    missing.push("overview");
  }

  if (!detail.queue || !["active", "backlog", "done"].every((section) => Array.isArray(detail.queue[section as keyof ProjectDetail["queue"]]))) {
    missing.push("queue");
  }

  if (!detail.currentTask || !workflowArtifactKeys.every((key) => hasOwn(detail.currentTask as TaskArtifacts, key))) {
    missing.push("current-task-artifacts");
  }

  if (!Array.isArray(detail.recentDecisions)) {
    missing.push("recent-decisions");
  }

  if (!Array.isArray(detail.errors)) {
    missing.push("harness-errors");
  }

  if (!detail.runner || typeof detail.runner.status !== "string") {
    missing.push("runner-lifecycle");
  }

  if (!detail.revisions || !["manifest", "state", "queue"].every((key) => hasOwn(detail.revisions, key))) {
    missing.push("revisions");
  }

  if (detail.detection !== "manifest" || !detail.revisions?.state || !detail.path) {
    missing.push("url-editor");
  }

  if (!detail.name || !detail.path || !detail.activeTask?.taskId || !detail.currentTask) {
    missing.push("prompt");
  }

  return missing;
}
