import { promises as fs } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { getRuntimeConfigPath } from "../src/main/config.js";
import {
  applyTerminalInputData,
  resolveTerminalCwd,
  terminalCommand,
  terminalDisplayTitle,
  terminalShellEnvironment,
  TerminalManager,
} from "../src/main/terminal.js";
import { createHarnessFixture, makeTempRoot, writeJson } from "./helpers.js";

describe("terminal cwd validation", () => {
  it("starts shells without interactive TTY-only flags or Apple session restore", () => {
    expect(terminalCommand("/bin/zsh")).toEqual({ file: "/bin/zsh", args: ["-l"] });
    expect(terminalCommand("/bin/zsh").args).not.toContain("-i");
    expect(terminalShellEnvironment).toMatchObject({
      SHELL_SESSIONS_DISABLE: "1",
      TERM_PROGRAM: "SharkBay",
    });
  });

  it("allows project directories inside configured roots", async () => {
    const userDataPath = await makeTempRoot("terminal-config");
    const root = await makeTempRoot("terminal-root");
    const repo = await createHarnessFixture(root, "TerminalRepo");
    await writeJson(getRuntimeConfigPath({ userDataPath }), {
      schemaVersion: 1,
      configuredRoots: [root],
      updatedAt: "2026-05-06",
    });

    await expect(resolveTerminalCwd({ userDataPath }, repo)).resolves.toBe(await fs.realpath(repo));
  });

  it("derives titles from project-relative cwd and foreground commands", () => {
    const root = path.join(path.sep, "Users", "shark", "Projects", "SharkBay");

    expect(terminalDisplayTitle({
      projectRoot: root,
      currentCwd: root,
      shell: "/bin/zsh",
      foregroundProcess: "zsh",
    })).toBe(".");
    expect(terminalDisplayTitle({
      projectRoot: root,
      currentCwd: path.join(root, "src", "main"),
      shell: "/bin/zsh",
      foregroundProcess: "zsh",
    })).toBe(path.join("src", "main"));
    expect(terminalDisplayTitle({
      projectRoot: root,
      currentCwd: path.join(root, "src"),
      shell: "/bin/zsh",
      foregroundProcess: "node",
      activeCommandLine: "pnpm dev:server",
    })).toBe("pnpm dev:server");
    expect(terminalDisplayTitle({
      projectRoot: root,
      currentCwd: root,
      shell: "/bin/zsh",
      foregroundProcess: "top",
    })).toBe("top");
  });

  it("tracks submitted command lines from terminal input", () => {
    expect(applyTerminalInputData("", "pnpm dev:server\r")).toEqual({
      pendingInputLine: "",
      submittedCommand: "pnpm dev:server",
    });
    expect(applyTerminalInputData("pnpm dev:serve", "r\n")).toEqual({
      pendingInputLine: "",
      submittedCommand: "pnpm dev:server",
    });
    expect(applyTerminalInputData("codexx", "\u007f\r")).toEqual({
      pendingInputLine: "",
      submittedCommand: "codex",
    });
    expect(applyTerminalInputData("claude", "\u0015top\r")).toEqual({
      pendingInputLine: "",
      submittedCommand: "top",
    });
  });

  it("rejects directories outside configured roots", async () => {
    const userDataPath = await makeTempRoot("terminal-config");
    const root = await makeTempRoot("terminal-root");
    const outsideRoot = await makeTempRoot("terminal-outside");
    const outsideRepo = path.join(outsideRoot, "OutsideRepo");
    await fs.mkdir(outsideRepo);
    await writeJson(getRuntimeConfigPath({ userDataPath }), {
      schemaVersion: 1,
      configuredRoots: [root],
      updatedAt: "2026-05-06",
    });

    await expect(resolveTerminalCwd({ userDataPath }, outsideRepo)).rejects.toThrow(/outside configured roots/);
  });

  it("creates and closes a terminal session in a safe cwd", async () => {
    const userDataPath = await makeTempRoot("terminal-config");
    const root = await makeTempRoot("terminal-root");
    const repo = await createHarnessFixture(root, "TerminalRepo");
    await writeJson(getRuntimeConfigPath({ userDataPath }), {
      schemaVersion: 1,
      configuredRoots: [root],
      updatedAt: "2026-05-06",
    });

    const manager = new TerminalManager();
    const session = await manager.create({ userDataPath }, { cwd: repo, title: "TerminalRepo" });

    try {
      expect(session.cwd).toBe(await fs.realpath(repo));
      expect(session.title).toBe(".");
      expect(session.status).toBe("running");
      expect(manager.list()).toHaveLength(1);
    } finally {
      manager.close({ sessionId: session.id });
    }

    expect(manager.list()).toHaveLength(0);
  });

  it("accepts input and streams command output", async () => {
    const userDataPath = await makeTempRoot("terminal-config");
    const root = await makeTempRoot("terminal-root");
    const repo = await createHarnessFixture(root, "TerminalRepo");
    await writeJson(getRuntimeConfigPath({ userDataPath }), {
      schemaVersion: 1,
      configuredRoots: [root],
      updatedAt: "2026-05-06",
    });

    const manager = new TerminalManager();
    const session = await manager.create({ userDataPath }, { cwd: repo, title: "TerminalRepo" });
    const output = new Promise<string>((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error("terminal output timed out")), 3000);
      manager.on("data", (event) => {
        if (event.sessionId === session.id && event.data.includes("sharkbay-terminal-ok")) {
          clearTimeout(timeout);
          resolve(event.data);
        }
      });
    });

    try {
      manager.input({ sessionId: session.id, data: "printf 'sharkbay-terminal-ok\\n'\n" });
      await expect(output).resolves.toContain("sharkbay-terminal-ok");
    } finally {
      manager.close({ sessionId: session.id });
    }
  });
});
