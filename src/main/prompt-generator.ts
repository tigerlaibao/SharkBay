import fs from "node:fs";
import path from "node:path";
import type { IpcRuntimeLike, NextActionPromptInput, NextActionPromptResult, PromptGenerationInput } from "../shared/types.js";

export function generateNextActionPrompt(input: PromptGenerationInput): string;
export function generateNextActionPrompt(runtime: IpcRuntimeLike, input: NextActionPromptInput): Promise<NextActionPromptResult>;
export function generateNextActionPrompt(
  first: PromptGenerationInput | IpcRuntimeLike,
  second?: NextActionPromptInput,
): string | Promise<NextActionPromptResult> {
  if (second) {
    return Promise.resolve({ prompt: buildPrompt(normalizePromptInput(second)) });
  }
  return buildPrompt(first as PromptGenerationInput);
}

function buildPrompt(input: PromptGenerationInput): string {
  const taskId = input.taskId || input.project.activeTask?.taskId || "unknown";
  const phase = input.phase || input.project.activeTask?.phase || "unknown";
  const paths = promptPaths(input.project.path, taskId);

  return [
    `You are working in ${input.project.path}.`,
    "",
    "Do not rely on chat memory as the source of truth. Read the harness files on disk first.",
    "",
    "Read before acting:",
    "- AGENTS.md",
    `- ${paths.protocol}`,
    `- ${paths.manifest}`,
    `- ${paths.stateJson} and ${paths.stateMarkdown}`,
    `- ${paths.queueJson} and ${paths.queueMarkdown}`,
    `- ${paths.taskStatus}`,
    `- ${paths.taskContract} when this phase has an implementation contract`,
    "",
    `Current project: ${input.project.name}`,
    `Task: ${taskId}`,
    `Current phase: ${phase}`,
    "",
    "Follow the harness protocol as the source of truth. Continue autonomously across phases until the task is done, blocked, or the protocol requires human intervention.",
    "Use subagents when they can safely shorten the work, especially for independent exploration, review, or verification.",
    "Keep JSON and Markdown harness mirrors synchronized, run the checks required by the current phase or contract, and make focused checkpoint commits.",
  ].join("\n");
}

function promptPaths(repoPath: string, taskId: string): {
  protocol: string;
  manifest: string;
  stateJson: string;
  stateMarkdown: string;
  queueJson: string;
  queueMarkdown: string;
  taskStatus: string;
  taskContract: string;
} {
  const contained = isDirectory(path.join(repoPath, ".sharkbay"));
  const base = contained ? ".sharkbay" : ".agent";
  const tasksBase = contained ? ".sharkbay/tasks" : "tasks";
  return {
    protocol: `${base}/protocol.md`,
    manifest: `${base}/manifest.json`,
    stateJson: `${base}/state.json`,
    stateMarkdown: `${base}/state.md`,
    queueJson: `${base}/queue.json`,
    queueMarkdown: `${base}/queue.md`,
    taskStatus: `${tasksBase}/${taskId}/status.md`,
    taskContract: `${tasksBase}/${taskId}/contract.md`,
  };
}

function isDirectory(filePath: string): boolean {
  try {
    return fs.statSync(filePath).isDirectory();
  } catch {
    return false;
  }
}

function normalizePromptInput(input: NextActionPromptInput): PromptGenerationInput {
  return {
    project: input.project ?? {
      name: "Unknown project",
      path: input.repoPath || input.projectId || "unknown",
      activeTask: input.taskId
        ? {
            taskId: input.taskId,
            title: input.taskId,
            phase: input.phase || "unknown",
            status: null,
            priority: null,
            gateStatus: "unknown",
            requiresUserAction: false,
            userActionReason: null,
          }
        : null,
      currentTask: null,
    },
    taskId: input.taskId,
    phase: input.phase,
    requiredChecks: input.requiredChecks,
    stopConditions: input.stopConditions,
  };
}
