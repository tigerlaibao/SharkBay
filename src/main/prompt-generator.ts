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

  return [
    `You are working in ${input.project.path}.`,
    "",
    "Do not rely on chat memory as the source of truth. Read the harness files on disk first.",
    "",
    "Read before acting:",
    "- AGENTS.md",
    "- .agent/protocol.md",
    "- .agent/manifest.json",
    "- .agent/state.json and .agent/state.md",
    "- .agent/queue.json and .agent/queue.md",
    `- tasks/${taskId}/status.md`,
    `- tasks/${taskId}/contract.md when this phase has an implementation contract`,
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
