import { describe, expect, it } from "vitest";
import { readProjectDetail } from "../src/main/harness-reader.js";
import {
  preferredInitialCandidate,
  projectSummaryFromDetail,
  resolveSelectedCandidate,
  shouldResetTerminalObservationForInput,
  terminalActivityForCandidate,
  validTerminalResizeDimensions,
} from "../src/renderer/workflow.js";
import {
  createSelfHostFixture,
  makeTempRoot,
  missingWorkflowDetailSurfaces,
  workflowArtifactKeys,
  workflowDetailSurfaces,
} from "./helpers.js";

describe("renderer workflow contracts", () => {
  it("skips terminal resize dimensions from hidden or unmeasured surfaces", () => {
    expect(validTerminalResizeDimensions(80, 24)).toBe(true);
    expect(validTerminalResizeDimensions(80.8, 24.2)).toBe(true);
    expect(validTerminalResizeDimensions(0, 24)).toBe(false);
    expect(validTerminalResizeDimensions(80, 0)).toBe(false);
    expect(validTerminalResizeDimensions(Number.NaN, 24)).toBe(false);
    expect(validTerminalResizeDimensions(80, Number.POSITIVE_INFINITY)).toBe(false);
  });

  it("covers the detail data surfaces expected by the self-hosting workflow", async () => {
    const root = await makeTempRoot("renderer-detail");
    const repo = await createSelfHostFixture(root);
    const detail = await readProjectDetail(repo, "manifest", { configuredRoots: [root] });

    expect(workflowDetailSurfaces).toEqual([
      "overview",
      "queue",
      "current-task-artifacts",
      "task-artifacts",
      "recent-decisions",
      "harness-errors",
      "revisions",
      "url-editor",
    ]);
    expect(Object.keys(detail.currentTask ?? {}).sort()).toEqual([...workflowArtifactKeys].sort());
    expect(missingWorkflowDetailSurfaces(detail)).toEqual([]);
  });

  it("flags missing detail surfaces with stable helper labels", async () => {
    const root = await makeTempRoot("renderer-missing-detail");
    const repo = await createSelfHostFixture(root);
    const detail = await readProjectDetail(repo, "manifest", { configuredRoots: [root] });

    expect(missingWorkflowDetailSurfaces({ ...detail, currentTask: null })).toEqual([
      "current-task-artifacts",
    ]);
  });

  it("resolves selected managed projects even when scan candidates are incomplete", () => {
    const nestedProject = {
      id: "/workspace/Container/Nested",
      name: "Nested",
      path: "/workspace/Container/Nested",
      detection: "manifest" as const,
      repoUrl: null,
      currentBranch: "main",
      dirtyWorktree: false,
      activeTask: null,
      localUrl: null,
      testUrl: null,
      deploymentUrl: null,
    };
    const candidates = [
      {
        id: "/workspace/Container",
        name: "Container",
        path: "/workspace/Container",
        rootPath: "/workspace",
        status: "not_setup" as const,
        managedProjectId: null,
        detection: null,
      },
    ];

    const selected = resolveSelectedCandidate(candidates, new Map([[nestedProject.id, nestedProject]]), nestedProject.id);
    expect(selected).toEqual(
      expect.objectContaining({
        id: nestedProject.id,
        status: "managed",
        managedProjectId: nestedProject.id,
      }),
    );
  });

  it("prefers managed projects for the initial selection", () => {
    const notSetup = {
      id: "/workspace/Plain",
      name: "Plain",
      path: "/workspace/Plain",
      rootPath: "/workspace",
      status: "not_setup" as const,
      managedProjectId: null,
      detection: null,
    };
    const managed = {
      id: "/workspace/Managed",
      name: "Managed",
      path: "/workspace/Managed",
      rootPath: "/workspace",
      status: "managed" as const,
      managedProjectId: "/workspace/Managed",
      detection: "manifest" as const,
    };

    expect(preferredInitialCandidate([notSetup, managed])).toBe(managed);
    expect(preferredInitialCandidate([notSetup])).toBe(notSetup);
    expect(preferredInitialCandidate([])).toBeNull();
  });

  it("resolves project row terminal activity from stable candidate, project, or path keys", () => {
    const candidate = {
      id: "candidate:/workspace/App",
      name: "App",
      path: "/workspace/App",
      rootPath: "/workspace",
      status: "managed" as const,
      managedProjectId: "project:/workspace/App",
      detection: "manifest" as const,
    };

    expect(terminalActivityForCandidate(candidate, { "candidate:/workspace/App": "working" })).toBe("working");
    expect(terminalActivityForCandidate(candidate, { "project:/workspace/App": "idle" })).toBe("idle");
    expect(terminalActivityForCandidate(candidate, { "/workspace/App": "working" })).toBe("working");
    expect(terminalActivityForCandidate(candidate, {})).toBeNull();
  });

  it("does not treat terminal focus control sequences as user input", () => {
    expect(shouldResetTerminalObservationForInput("\u001b[I")).toBe(false);
    expect(shouldResetTerminalObservationForInput("\u001b[O")).toBe(false);
    expect(shouldResetTerminalObservationForInput("a")).toBe(true);
    expect(shouldResetTerminalObservationForInput("\r")).toBe(true);
    expect(shouldResetTerminalObservationForInput("\u001b[A")).toBe(true);
  });

  it("projects fresh detail status back into the list summary shape", () => {
    const detail = {
      id: "/workspace/AIGF",
      name: "AIGF",
      path: "/workspace/AIGF",
      detection: "manifest" as const,
      repoUrl: null,
      currentBranch: "main",
      dirtyWorktree: true,
      activeTask: {
        taskId: "t-007-character-explorer-upgrade",
        title: "Character explorer upgrade",
        phase: "done",
        status: "done",
        priority: 2,
      },
      localUrl: null,
      testUrl: null,
      deploymentUrl: null,
      errors: [],
      queue: { active: [], backlog: [], done: [] },
      currentTask: null,
      taskArtifacts: {},
      recentDecisions: [],
      gitHistory: [],
      development: null,
      revisions: { manifest: "1", state: "2", queue: "3" },
    };

    expect(projectSummaryFromDetail(detail)).toEqual({
      id: "/workspace/AIGF",
      name: "AIGF",
      path: "/workspace/AIGF",
      detection: "manifest",
      repoUrl: null,
      currentBranch: "main",
      dirtyWorktree: true,
      activeTask: expect.objectContaining({
        taskId: "t-007-character-explorer-upgrade",
        phase: "done",
      }),
      localUrl: null,
      testUrl: null,
      deploymentUrl: null,
      errors: [],
    });
  });
});
