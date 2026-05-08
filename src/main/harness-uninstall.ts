import { promises as fs } from "node:fs";
import path from "node:path";
import type { HarnessUninstallInput, HarnessUninstallResult } from "../shared/types.js";
import { containedHarnessLayout, legacyHarnessLayout } from "./harness-layout.js";
import { isPathInside, resolveRepoPath } from "./path-safety.js";

type RemovalTarget = {
  relativePath: string;
  absolutePath: string;
  kind: "file" | "directory";
  optionalContentCheck?: (content: string) => boolean;
};

type PathState = {
  exists: boolean;
  isFile: boolean;
  isDirectory: boolean;
  isSymlink: boolean;
};

const safeTaskDirPattern = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;
const legacyDocs = ["product.md", "architecture.md", "task.md", "learnings.md"];
const harnessGitignoreEntries = new Set([
  ".agent/",
  "/.agent/",
  ".agent/runner.json",
  "/.agent/runner.json",
  ".sharkbay/",
  "/.sharkbay/",
  ".sharkbay/runner.json",
  "/.sharkbay/runner.json",
  "tasks/",
  "/tasks/",
  "docs/task.md",
  "/docs/task.md",
  "docs/learnings.md",
  "/docs/learnings.md",
]);

export async function uninstallHarness(input: HarnessUninstallInput): Promise<HarnessUninstallResult> {
  let repoPath: string;
  try {
    const configuredRoots = input.configuredRoots?.length ? input.configuredRoots : [input.repoPath];
    repoPath = (await resolveRepoPath(input.repoPath, configuredRoots)).repoPath;
  } catch (error) {
    return failure("unsafe-path", error);
  }

  const blockers: string[] = [];
  const removedPaths: string[] = [];
  const skippedPaths: string[] = [];

  try {
    const targets = await buildRemovalTargets(repoPath, blockers);
    if (blockers.length) {
      return {
        ok: false,
        reason: "blocked",
        message: "Harness uninstall is blocked by safety preflight.",
        blockers,
      };
    }

    for (const target of targets) {
      const removed = await removeTarget(target);
      if (removed) {
        removedPaths.push(target.relativePath);
      } else {
        skippedPaths.push(target.relativePath);
      }
    }

    const gitignoreRemovedLines = await cleanGitignore(repoPath);
    await removeEmptyDirectory(path.join(repoPath, legacyHarnessLayout.docsDir));
    await removeEmptyDirectory(path.join(repoPath, legacyHarnessLayout.tasksDir));

    return {
      ok: true,
      repoPath,
      removedPaths: removedPaths.sort(),
      skippedPaths: skippedPaths.sort(),
      gitignoreRemovedLines,
    };
  } catch (error) {
    return failure("io-error", error);
  }
}

async function buildRemovalTargets(repoPath: string, blockers: string[]): Promise<RemovalTarget[]> {
  const targets: RemovalTarget[] = [];

  await validateGitignore(repoPath, blockers);
  await maybeAddTarget(repoPath, "AGENTS.md", "file", targets, blockers, looksLikeRippleAgentsFile);
  await maybeAddTarget(repoPath, containedHarnessLayout.rootDir, "directory", targets, blockers);
  await maybeAddTarget(repoPath, legacyHarnessLayout.rootDir, "directory", targets, blockers);

  for (const fileName of legacyDocs) {
    await maybeAddTarget(repoPath, path.join(legacyHarnessLayout.docsDir, fileName), "file", targets, blockers);
  }

  await maybeAddTarget(repoPath, path.join(legacyHarnessLayout.tasksDir, "_template"), "directory", targets, blockers);
  await addLegacyTaskTargets(repoPath, targets, blockers);

  return dedupeTargets(targets);
}

async function validateGitignore(repoPath: string, blockers: string[]): Promise<void> {
  const gitignorePath = path.join(repoPath, ".gitignore");
  const state = await pathState(gitignorePath);
  if (!state.exists) return;
  if (state.isSymlink || !state.isFile) {
    blockers.push(".gitignore must be a real file.");
  }
}

async function maybeAddTarget(
  repoPath: string,
  relativePath: string,
  kind: RemovalTarget["kind"],
  targets: RemovalTarget[],
  blockers: string[],
  optionalContentCheck?: RemovalTarget["optionalContentCheck"],
): Promise<void> {
  const absolutePath = path.join(repoPath, relativePath);
  if (!isPathInside(repoPath, absolutePath)) {
    blockers.push(`${relativePath} resolves outside the repository.`);
    return;
  }

  const state = await pathState(absolutePath);
  if (!state.exists) return;
  if (state.isSymlink) {
    blockers.push(`${relativePath} cannot be a symlink.`);
    return;
  }
  if (kind === "file" && !state.isFile) {
    blockers.push(`${relativePath} must be a file.`);
    return;
  }
  if (kind === "directory" && !state.isDirectory) {
    blockers.push(`${relativePath} must be a directory.`);
    return;
  }
  if (kind === "directory") {
    await rejectNestedSymlinks(absolutePath, relativePath, blockers);
  }

  targets.push({ relativePath, absolutePath, kind, optionalContentCheck });
}

async function addLegacyTaskTargets(repoPath: string, targets: RemovalTarget[], blockers: string[]): Promise<void> {
  const tasksDir = path.join(repoPath, legacyHarnessLayout.tasksDir);
  const state = await pathState(tasksDir);
  if (!state.exists) return;
  if (!state.isDirectory || state.isSymlink) {
    blockers.push(`${legacyHarnessLayout.tasksDir} must be a real directory.`);
    return;
  }

  const entries = await fs.readdir(tasksDir, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory() || entry.name === "_template") continue;
    if (!safeTaskDirPattern.test(entry.name)) {
      if (await exists(path.join(tasksDir, entry.name, "status.md"))) {
        blockers.push(`Task directory ${path.join(legacyHarnessLayout.tasksDir, entry.name)} has an unsafe name.`);
      }
      continue;
    }
    if (await exists(path.join(tasksDir, entry.name, "status.md"))) {
      await maybeAddTarget(repoPath, path.join(legacyHarnessLayout.tasksDir, entry.name), "directory", targets, blockers);
    }
  }
}

async function removeTarget(target: RemovalTarget): Promise<boolean> {
  if (target.optionalContentCheck) {
    const content = await fs.readFile(target.absolutePath, "utf8");
    if (!target.optionalContentCheck(content)) {
      return false;
    }
  }

  await fs.rm(target.absolutePath, { recursive: target.kind === "directory", force: false });
  return true;
}

async function cleanGitignore(repoPath: string): Promise<string[]> {
  const gitignorePath = path.join(repoPath, ".gitignore");
  if (!await exists(gitignorePath)) return [];

  const state = await pathState(gitignorePath);
  if (state.isSymlink || !state.isFile) {
    throw new Error(".gitignore must be a real file.");
  }

  const original = await fs.readFile(gitignorePath, "utf8");
  const cleaned = cleanGitignoreContent(original);
  if (!cleaned.removedLines.length) return [];

  await fs.writeFile(gitignorePath, cleaned.content, "utf8");
  return cleaned.removedLines;
}

export function cleanGitignoreContent(content: string): { content: string; removedLines: string[] } {
  const hadFinalNewline = content.endsWith("\n");
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  if (hadFinalNewline) lines.pop();

  const removeIndices = new Set<number>();
  const patternIndices: number[] = [];
  const removedLines: string[] = [];

  lines.forEach((line, index) => {
    if (harnessGitignoreEntries.has(line.trim())) {
      removeIndices.add(index);
      patternIndices.push(index);
      removedLines.push(line);
    }
  });

  if (!removeIndices.size) {
    return { content, removedLines: [] };
  }

  for (const index of [...removeIndices]) {
    markAdjacentHarnessCommentBlock(lines, index, removeIndices);
  }
  markHarnessPatternRunSpacing(lines, patternIndices, removeIndices);

  const nextLines = lines.filter((_, index) => !removeIndices.has(index));
  return {
    content: nextLines.length ? `${nextLines.join("\n")}${hadFinalNewline ? "\n" : ""}` : "",
    removedLines,
  };
}

function markHarnessPatternRunSpacing(lines: string[], patternIndices: number[], removeIndices: Set<number>): void {
  const sorted = [...patternIndices].sort((a, b) => a - b);
  for (let cursor = 0; cursor < sorted.length; cursor += 1) {
    const start = sorted[cursor] ?? 0;
    let end = start;
    while (sorted[cursor + 1] === end + 1) {
      cursor += 1;
      end = sorted[cursor] ?? end;
    }

    const beforeBlockEnd = start;
    let beforeBlockStart = start - 1;
    while (beforeBlockStart >= 0 && isCommentOrBlank(lines[beforeBlockStart] ?? "")) beforeBlockStart -= 1;
    const beforeBlock = lines.slice(beforeBlockStart + 1, beforeBlockEnd);
    if (beforeBlock.some(isHarnessMarkerComment) && (lines[end + 1] ?? "").trim() === "") {
      removeIndices.add(end + 1);
    }

    const afterBlockStart = end + 1;
    let afterBlockEnd = afterBlockStart;
    while (afterBlockEnd < lines.length && isCommentOrBlank(lines[afterBlockEnd] ?? "")) afterBlockEnd += 1;
    const afterBlock = lines.slice(afterBlockStart, afterBlockEnd);
    if (afterBlock.some(isHarnessMarkerComment) && (lines[start - 1] ?? "").trim() === "") {
      removeIndices.add(start - 1);
    }
  }
}

function markAdjacentHarnessCommentBlock(lines: string[], removedLineIndex: number, removeIndices: Set<number>): void {
  let start = removedLineIndex - 1;
  while (start >= 0 && isCommentOrBlank(lines[start] ?? "")) start -= 1;
  const beforeBlockStart = start + 1;
  const beforeBlock = lines.slice(beforeBlockStart, removedLineIndex);
  if (beforeBlock.some(isHarnessMarkerComment)) {
    for (let index = beforeBlockStart; index < removedLineIndex; index += 1) {
      removeIndices.add(index);
    }
    if ((lines[removedLineIndex + 1] ?? "").trim() === "") {
      removeIndices.add(removedLineIndex + 1);
    }
  }

  let end = removedLineIndex + 1;
  while (end < lines.length && isCommentOrBlank(lines[end] ?? "")) end += 1;
  const afterBlock = lines.slice(removedLineIndex + 1, end);
  if (afterBlock.some(isHarnessMarkerComment)) {
    for (let index = removedLineIndex + 1; index < end; index += 1) {
      removeIndices.add(index);
    }
    if ((lines[removedLineIndex - 1] ?? "").trim() === "") {
      removeIndices.add(removedLineIndex - 1);
    }
  }
}

function isCommentOrBlank(line: string): boolean {
  const trimmed = line.trim();
  return !trimmed || trimmed.startsWith("#");
}

function isHarnessMarkerComment(line: string): boolean {
  const trimmed = line.trim();
  return trimmed.startsWith("#") && /sharkbay|ripple|harness/i.test(trimmed);
}

function looksLikeRippleAgentsFile(content: string): boolean {
  return /Ripple harness/i.test(content) && /\.sharkbay\/|\.agent\//.test(content);
}

async function pathState(targetPath: string): Promise<PathState> {
  try {
    const stat = await fs.lstat(targetPath);
    return {
      exists: true,
      isFile: stat.isFile(),
      isDirectory: stat.isDirectory(),
      isSymlink: stat.isSymbolicLink(),
    };
  } catch (error) {
    if (isMissingPathError(error)) {
      return { exists: false, isFile: false, isDirectory: false, isSymlink: false };
    }
    throw error;
  }
}

async function rejectNestedSymlinks(dirPath: string, label: string, blockers: string[]): Promise<void> {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const childPath = path.join(dirPath, entry.name);
    const childLabel = path.join(label, entry.name);
    if (entry.isSymbolicLink()) {
      blockers.push(`${childLabel} cannot be a symlink.`);
      continue;
    }
    if (entry.isDirectory()) {
      await rejectNestedSymlinks(childPath, childLabel, blockers);
    }
  }
}

async function removeEmptyDirectory(dirPath: string): Promise<boolean> {
  try {
    await fs.rmdir(dirPath);
    return true;
  } catch {
    return false;
  }
}

async function exists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

function dedupeTargets(targets: RemovalTarget[]): RemovalTarget[] {
  const seen = new Set<string>();
  return targets.filter((target) => {
    if (seen.has(target.relativePath)) return false;
    seen.add(target.relativePath);
    return true;
  });
}

function isMissingPathError(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && (error as { code?: unknown }).code === "ENOENT";
}

function failure(reason: "unsafe-path" | "io-error", error: unknown): HarnessUninstallResult {
  return { ok: false, reason, message: error instanceof Error ? error.message : String(error) };
}
