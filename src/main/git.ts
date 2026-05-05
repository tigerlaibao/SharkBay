import { execFile } from "node:child_process";
import { promisify } from "node:util";
import type { GitEvent, GitMetadata } from "../shared/types.js";

const execFileAsync = promisify(execFile);

export async function readGitMetadata(repoPath: string): Promise<GitMetadata> {
  try {
    const gitRoot = await git(repoPath, ["rev-parse", "--show-toplevel"]);
    const [currentBranch, defaultBranch, remoteOrigin, status] = await Promise.all([
      git(repoPath, ["branch", "--show-current"]).catch(() => null),
      readDefaultBranch(repoPath),
      git(repoPath, ["config", "--get", "remote.origin.url"]).catch(() => null),
      git(repoPath, ["status", "--porcelain"]).catch(() => null),
    ]);

    return {
      isGitRepository: true,
      gitRoot,
      currentBranch,
      defaultBranch,
      remoteOrigin,
      githubUrl: remoteOrigin,
      dirtyWorktree: status === null ? null : status.length > 0,
    };
  } catch {
    return {
      isGitRepository: false,
      gitRoot: null,
      currentBranch: null,
      defaultBranch: null,
      remoteOrigin: null,
      githubUrl: null,
      dirtyWorktree: null,
    };
  }
}

export async function readGitHistory(repoPath: string, limit = 50): Promise<GitEvent[]> {
  const raw = await git(repoPath, [
    "reflog",
    "--date=iso-strict",
    "--format=%H%x1f%gd%x1f%gs%x1f%cd",
    `-n${limit}`,
  ]).catch(() => "");

  if (!raw) {
    return [];
  }

  return raw.split("\n").flatMap((line) => {
    const [hash, selector, action, date] = line.split("\x1f");
    if (!hash || !selector || !action || !date) {
      return [];
    }
    return [{ hash, selector, action, date }];
  });
}

async function readDefaultBranch(repoPath: string): Promise<string | null> {
  const symbolic = await git(repoPath, ["symbolic-ref", "refs/remotes/origin/HEAD"]).catch(() => null);
  if (symbolic) {
    return symbolic.replace(/^refs\/remotes\/origin\//, "");
  }
  return git(repoPath, ["config", "--get", "init.defaultBranch"]).catch(() => null);
}

async function git(repoPath: string, args: string[]): Promise<string> {
  const { stdout } = await execFileAsync("git", ["-C", repoPath, ...args], {
    timeout: 3000,
    maxBuffer: 1024 * 1024,
  });
  return stdout.trim();
}
