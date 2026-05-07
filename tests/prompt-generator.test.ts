import { describe, expect, it } from "vitest";
import { generateNextActionPrompt } from "../src/main/prompt-generator.js";
import { createContainedHarnessFixture, makeTempRoot } from "./helpers.js";

describe("prompt generator", () => {
  it("keeps handoff prompts concise and defers rules to the protocol", () => {
    const prompt = generateNextActionPrompt({
      project: {
        name: "SharkBay",
        path: "/path/to/projects/SharkBay",
        activeTask: {
          taskId: "t-001-sharkbay-mvp-spec",
          title: "MVP",
          phase: "coding",
          status: "active",
          priority: 1,
          gateStatus: "unknown",
          requiresUserAction: false,
          userActionReason: null,
        },
        currentTask: null,
      },
      requiredChecks: ["npm test -- --runInBand"],
      stopConditions: ["Stop before touching files outside scope."],
    });

    expect(prompt).toContain("/path/to/projects/SharkBay");
    expect(prompt).toContain("t-001-sharkbay-mvp-spec");
    expect(prompt).toContain("coding");
    expect(prompt).toContain("AGENTS.md");
    expect(prompt).toContain(".agent/protocol.md");
    expect(prompt).toContain("Do not rely on chat memory");
    expect(prompt).toContain("Continue autonomously across phases");
    expect(prompt).toContain("Use subagents");
    expect(prompt).toContain("focused checkpoint commits");
    expect(prompt).not.toContain("Advance exactly one harness phase");
    expect(prompt).not.toContain("Stop conditions:");
    expect(prompt).not.toContain("Required checks:");
    expect(prompt).not.toContain("npm test -- --runInBand");
  });

  it("uses .sharkbay paths for contained projects", async () => {
    const root = await makeTempRoot("prompt-contained");
    const repo = await createContainedHarnessFixture(root, "PromptContained");

    const prompt = generateNextActionPrompt({
      project: {
        name: "PromptContained",
        path: repo,
        activeTask: {
          taskId: "t-001-fixture",
          title: "Fixture",
          phase: "coding",
          status: "active",
          priority: 1,
          gateStatus: "unknown",
          requiresUserAction: false,
          userActionReason: null,
        },
        currentTask: null,
      },
    });

    expect(prompt).toContain(".sharkbay/protocol.md");
    expect(prompt).toContain(".sharkbay/tasks/t-001-fixture/status.md");
    expect(prompt).not.toContain(".agent/protocol.md");
  });
});
