import { EventEmitter } from "node:events";
import os from "node:os";
import path from "node:path";
import * as pty from "node-pty";
import { getConfiguredRoots } from "./config.js";
import { resolveRepoPath } from "./path-safety.js";
import type {
  IpcRuntimeLike,
  TerminalCloseInput,
  TerminalCreateInput,
  TerminalDataEvent,
  TerminalExitEvent,
  TerminalInput,
  TerminalResizeInput,
  TerminalSession,
} from "../shared/types.js";

type TerminalRecord = TerminalSession & {
  pty: pty.IPty;
};

export const terminalShellEnvironment = {
  SHELL_SESSIONS_DISABLE: "1",
  TERM_PROGRAM: "SharkBay",
} as const;

export type TerminalManagerEvents = {
  data: [TerminalDataEvent];
  exit: [TerminalExitEvent];
};

export class TerminalManager extends EventEmitter<TerminalManagerEvents> {
  private sessions = new Map<string, TerminalRecord>();
  private sequence = 0;

  async create(runtime: IpcRuntimeLike, input: TerminalCreateInput): Promise<TerminalSession> {
    const cwd = await resolveTerminalCwd(runtime, input.cwd);
    const shell = preferredShell();
    const id = `term-${Date.now().toString(36)}-${++this.sequence}`;
    const command = terminalCommand(shell);
    const ptyProcess = pty.spawn(command.file, command.args, {
      cwd,
      cols: input.cols ?? 80,
      rows: input.rows ?? 24,
      name: "xterm-256color",
      env: {
        ...process.env,
        TERM: process.env.TERM || "xterm-256color",
        COLORTERM: process.env.COLORTERM || "truecolor",
        ...terminalShellEnvironment,
      },
    });
    const session: TerminalRecord = {
      id,
      cwd,
      title: input.title?.trim() || path.basename(cwd) || cwd,
      shell,
      pid: ptyProcess.pid ?? null,
      status: "running",
      createdAt: new Date().toISOString(),
      pty: ptyProcess,
    };

    this.sessions.set(id, session);
    ptyProcess.onData((data) => {
      this.emit("data", { sessionId: id, data, stream: "stdout" });
    });
    ptyProcess.onExit(({ exitCode, signal }) => {
      session.status = "exited";
      this.emit("exit", { sessionId: id, exitCode, signal: signal === undefined ? null : String(signal) });
    });

    return publicSession(session);
  }

  input(input: TerminalInput): TerminalSession {
    const session = this.requireSession(input.sessionId);
    if (session.status !== "running") {
      throw new Error("Terminal session has exited");
    }
    session.pty.write(input.data);
    return publicSession(session);
  }

  resize(input: TerminalResizeInput): TerminalSession {
    const session = this.requireSession(input.sessionId);
    if (session.status === "running") {
      session.pty.resize(Math.max(1, input.cols), Math.max(1, input.rows));
    }
    return publicSession(session);
  }

  close(input: TerminalCloseInput): TerminalSession {
    const session = this.requireSession(input.sessionId);
    if (session.status === "running") {
      session.pty.kill();
    }
    this.sessions.delete(input.sessionId);
    return publicSession({ ...session, status: "exited" });
  }

  list(): TerminalSession[] {
    return [...this.sessions.values()].map(publicSession);
  }

  closeAll(): void {
    for (const id of [...this.sessions.keys()]) {
      this.close({ sessionId: id });
    }
  }

  private requireSession(sessionId: string): TerminalRecord {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error("Unknown terminal session");
    }
    return session;
  }
}

export async function resolveTerminalCwd(runtime: IpcRuntimeLike, cwd: string): Promise<string> {
  if (!cwd?.trim()) {
    throw new Error("Terminal cwd is required");
  }
  const config = await getConfiguredRoots(runtime);
  const safeRepo = await resolveRepoPath(cwd, config.configuredRoots);
  return safeRepo.repoPath;
}

export function terminalCommand(shell: string): { file: string; args: string[] } {
  return { file: shell, args: ["-l"] };
}

function preferredShell(): string {
  const shell = process.env.SHELL;
  if (shell && path.isAbsolute(shell)) {
    return shell;
  }
  return os.userInfo().shell || "/bin/zsh";
}

function publicSession(session: TerminalRecord | TerminalSession): TerminalSession {
  return {
    id: session.id,
    cwd: session.cwd,
    title: session.title,
    shell: session.shell,
    pid: session.pid,
    status: session.status,
    createdAt: session.createdAt,
  };
}
