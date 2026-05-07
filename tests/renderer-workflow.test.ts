import { describe, expect, it } from "vitest";
import { readProjectDetail } from "../src/main/harness-reader.js";
import { agentHandoffReason, displayGateStatus, nextReadyBacklogTask, preferredInitialCandidate, projectNeedsUserAction, projectSummaryFromDetail, resolveSelectedCandidate, taskStatusKind, taskStatusLabel, userActionReason, validTerminalResizeDimensions } from "../src/renderer/workflow.js";
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
      "runner-lifecycle",
      "revisions",
      "url-editor",
      "prompt",
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
      "prompt",
    ]);
  });

  it("uses stable display gate fallbacks for active workflow tasks", () => {
    expect(displayGateStatus({ activeTask: { taskId: "t-003", phase: "coding" } })).toBe("pending");
    expect(displayGateStatus({ activeTask: { taskId: "t-003", phase: "blocked" } })).toBe("blocked");
    expect(displayGateStatus({ activeTask: { taskId: "t-003", phase: "blocked", gateStatus: "unknown" } })).toBe("blocked");
    expect(displayGateStatus({ activeTask: { taskId: "t-002", phase: "done" } })).toBe("pass");
    expect(displayGateStatus({ gateStatus: "unknown", activeTask: { taskId: "t-003", phase: "coding" } })).toBe("pending");
    expect(displayGateStatus({ gateStatus: "blocked", activeTask: { taskId: "t-003", phase: "coding" } })).toBe("blocked");
    expect(displayGateStatus({ activeTask: { taskId: "t-003", phase: "coding", gateStatus: "pass" } })).toBe("pass");
    expect(displayGateStatus({ activeTask: null })).toBe("unknown");
  });

  it("separates urgent user action from agent handoff state", () => {
    expect(projectNeedsUserAction({ activeTask: null })).toBe(false);
    expect(projectNeedsUserAction({ activeTask: { taskId: "t-009", phase: "done" } })).toBe(false);
    expect(projectNeedsUserAction({ activeTask: { taskId: "t-009", phase: "done" }, gateStatus: "pass" })).toBe(false);
    expect(projectNeedsUserAction({ activeTask: { taskId: "t-010", phase: "intake", status: "active" } })).toBe(false);
    expect(projectNeedsUserAction({ activeTask: { taskId: "t-009", phase: "spec" } })).toBe(false);
    expect(projectNeedsUserAction({ activeTask: { taskId: "t-009", phase: "coding" } })).toBe(false);
    expect(projectNeedsUserAction({ activeTask: { taskId: "t-009", phase: "design_review" } })).toBe(false);
    expect(projectNeedsUserAction({ activeTask: { taskId: "t-009", phase: "code_review" } })).toBe(false);
    expect(projectNeedsUserAction({ activeTask: { taskId: "t-009", phase: "verification" } })).toBe(false);
    expect(projectNeedsUserAction({ activeTask: { taskId: "t-009", phase: "coding" }, runner: { status: "running" } })).toBe(false);
    expect(projectNeedsUserAction({ activeTask: { taskId: "t-009", phase: "coding" }, runner: { status: "stale" } })).toBe(true);
    expect(projectNeedsUserAction({ activeTask: { taskId: "t-009", phase: "coding" }, runner: { status: "waiting_for_human", reason: "Choose a path" } })).toBe(true);
    expect(projectNeedsUserAction({ activeTask: null, runner: { status: "waiting_for_human", reason: "Choose a project" } })).toBe(true);
    expect(projectNeedsUserAction({ activeTask: { taskId: "t-009", phase: "coding" }, runner: { status: "blocked", reason: "Missing token" } })).toBe(true);
    expect(projectNeedsUserAction({ activeTask: null, runner: { status: "running", taskId: "t-999", taskRegistrationStatus: "missing" } })).toBe(true);
    expect(projectNeedsUserAction({ activeTask: null, runner: { status: "running", taskId: "t-999", taskRegistrationStatus: "inactive" } })).toBe(true);
    expect(projectNeedsUserAction({ activeTask: null, runner: { status: "running", taskId: "t-999", taskRegistrationStatus: "mismatched" } })).toBe(true);
    expect(projectNeedsUserAction({ activeTask: null, runner: { status: "idle", taskId: "t-999", taskRegistrationStatus: "missing" } })).toBe(false);
    expect(projectNeedsUserAction({ activeTask: { taskId: "t-009", phase: "blocked" } })).toBe(true);
    expect(projectNeedsUserAction({ activeTask: { taskId: "t-009", phase: "coding" }, gateStatus: "blocked" })).toBe(true);
    expect(projectNeedsUserAction({ activeTask: { taskId: "t-009", phase: "coding", requiresUserAction: true } })).toBe(true);
    expect(projectNeedsUserAction({ activeTask: { taskId: "t-009", phase: "coding", userActionReason: "Review generated prompt" } })).toBe(true);
    expect(userActionReason({ activeTask: { taskId: "t-010", phase: "intake", status: "active" } })).toBeNull();
    expect(agentHandoffReason({ activeTask: { taskId: "t-010", phase: "intake", status: "active" } })).toBe("Agent handoff needed");
    expect(agentHandoffReason({ activeTask: { taskId: "t-010", phase: "coding" }, runner: { status: "unknown" } })).toBe("Agent handoff needed");
    expect(agentHandoffReason({ activeTask: { taskId: "t-010", phase: "coding" }, runner: { status: "running" } })).toBeNull();
    expect(agentHandoffReason({ activeTask: { taskId: "t-010", phase: "coding" }, runner: { status: "stale" } })).toBeNull();
    expect(agentHandoffReason({
      activeTask: { taskId: "t-006", phase: "done" },
      queue: {
        backlog: [{ taskId: "t-007", phase: "backlog", status: "backlog", dependsOn: ["t-006"] }],
        done: [{ taskId: "t-006", phase: "done", status: "done" }],
      },
    })).toBe("Agent handoff needed");
    expect(nextReadyBacklogTask({
      queue: {
        backlog: [{ taskId: "t-008", phase: "backlog", status: "backlog", dependsOn: ["t-007"] }],
        done: [{ taskId: "t-006", phase: "done", status: "done" }],
      },
    })).toBeNull();
    expect(userActionReason({ activeTask: { taskId: "t-009", phase: "coding", requiresUserAction: true, userActionReason: "Approve deploy" } })).toBe("Approve deploy");
    expect(userActionReason({ activeTask: { taskId: "t-009", phase: "coding" }, runner: { status: "waiting_for_human", reason: "Approve design" } })).toBe("Approve design");
    expect(userActionReason({ activeTask: null, runner: { status: "waiting_for_human", reason: "Choose a project" } })).toBe("Choose a project");
    expect(userActionReason({ activeTask: null, runner: { status: "running", taskId: "t-999", taskRegistrationStatus: "missing" } })).toBe("Runner task t-999 is not registered");
    expect(userActionReason({ activeTask: null, runner: { status: "running", taskId: "t-999", taskRegistrationStatus: "mismatched" } })).toBe("Runner task t-999 does not match currentTask");
  });

  it("prefers normalized task status over activeTask phase for project row labels", () => {
    expect(taskStatusLabel({ taskStatus: { kind: "done", label: "done" }, activeTask: null })).toBe("done");
    expect(taskStatusKind({ taskStatus: { kind: "done", label: "done" }, activeTask: null })).toBe("done");
    expect(taskStatusLabel({ taskStatus: { kind: "ready", label: "ready" }, activeTask: { taskId: "t-001", phase: "done" } })).toBe("ready");
    expect(taskStatusKind({ taskStatus: { kind: "ready", label: "ready" }, activeTask: { taskId: "t-001", phase: "done" } })).toBe("ready");
    expect(taskStatusLabel({ activeTask: { taskId: "t-002", phase: "coding" } })).toBe("coding");
    expect(taskStatusKind({ activeTask: { taskId: "t-002", phase: "coding" } })).toBe("active");
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
        gateStatus: "pass" as const,
        requiresUserAction: false,
        userActionReason: null,
      },
      taskStatus: {
        kind: "done" as const,
        label: "done",
        taskId: "t-007-character-explorer-upgrade",
        title: "Character explorer upgrade",
        phase: "done",
        counts: { active: 0, backlog: 0, done: 1 },
      },
      runner: null,
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
      taskStatus: expect.objectContaining({
        kind: "done",
        label: "done",
      }),
      runner: null,
      localUrl: null,
      testUrl: null,
      deploymentUrl: null,
      errors: [],
    });
  });
});
