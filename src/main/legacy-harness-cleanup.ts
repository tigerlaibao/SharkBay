import { promises as fs } from "node:fs";
import path from "node:path";
import type {
  LegacyHarnessCleanupCheckInput,
  LegacyHarnessCleanupCheckResult,
  LegacyHarnessCleanupMigrationResult,
  LegacyHarnessCleanupMove,
  LegacyHarnessCleanupSummary,
} from "../shared/types.js";
import { containedHarnessLayout, legacyHarnessLayout } from "./harness-layout.js";
import { isPathInside, resolveRepoPath } from "./path-safety.js";

type MovePlan = LegacyHarnessCleanupMove & {
  sourcePath: string;
  targetPath: string;
};

const legacyAgentFiles: Array<[string, string]> = [
  [legacyHarnessLayout.manifestJson, containedHarnessLayout.manifestJson],
  [legacyHarnessLayout.stateJson, containedHarnessLayout.stateJson],
  [legacyHarnessLayout.queueJson, containedHarnessLayout.queueJson],
  [legacyHarnessLayout.stateMarkdown, containedHarnessLayout.stateMarkdown],
  [legacyHarnessLayout.queueMarkdown, containedHarnessLayout.queueMarkdown],
  [legacyHarnessLayout.developmentJson, containedHarnessLayout.developmentJson],
  [legacyHarnessLayout.runnerJson, containedHarnessLayout.runnerJson],
  [legacyHarnessLayout.protocolMarkdown, containedHarnessLayout.protocolMarkdown],
  [legacyHarnessLayout.qualityRulesMarkdown, containedHarnessLayout.qualityRulesMarkdown],
  [legacyHarnessLayout.templateSyncJson, containedHarnessLayout.templateSyncJson],
];

const legacyDocs = ["product.md", "architecture.md", "task.md", "learnings.md"];
const safeTaskDirPattern = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;

export async function checkLegacyHarnessCleanup(input: LegacyHarnessCleanupCheckInput): Promise<LegacyHarnessCleanupCheckResult> {
  try {
    const plan = await buildCleanupPlan(input);
    return {
      ok: true,
      repoPath: plan.repoPath,
      status: plan.status,
      message: plan.message,
      moves: publicMoves(plan.moves),
      blockers: plan.blockers,
    };
  } catch (error) {
    return failure("unsafe-path", error);
  }
}

export async function migrateLegacyHarnessToContained(input: LegacyHarnessCleanupCheckInput): Promise<LegacyHarnessCleanupMigrationResult> {
  let plan: CleanupPlan;
  try {
    plan = await buildCleanupPlan(input);
  } catch (error) {
    return failure("unsafe-path", error);
  }

  if (plan.status !== "ready") {
    return {
      ok: false,
      reason: "blocked",
      message: plan.message,
      blockers: plan.blockers,
    };
  }

  try {
    for (const move of plan.moves) {
      await fs.mkdir(path.dirname(move.targetPath), { recursive: true });
      await fs.rename(move.sourcePath, move.targetPath);
    }

    const removedLegacyDirs: string[] = [];
    for (const relativePath of [legacyHarnessLayout.rootDir, legacyHarnessLayout.docsDir, legacyHarnessLayout.tasksDir]) {
      if (await removeIfEmpty(path.join(plan.repoPath, relativePath))) {
        removedLegacyDirs.push(relativePath);
      }
    }

    return {
      ok: true,
      repoPath: plan.repoPath,
      status: "migrated",
      moves: publicMoves(plan.moves),
      removedLegacyDirs,
    };
  } catch (error) {
    return failure("io-error", error);
  }
}

type CleanupPlan = {
  repoPath: string;
  status: LegacyHarnessCleanupSummary["status"];
  message: string;
  moves: MovePlan[];
  blockers: string[];
};

async function buildCleanupPlan(input: LegacyHarnessCleanupCheckInput): Promise<CleanupPlan> {
  const configuredRoots = input.configuredRoots?.length ? input.configuredRoots : [input.repoPath];
  const safeRepo = await resolveRepoPath(input.repoPath, configuredRoots);
  const repoPath = safeRepo.repoPath;
  const legacyRoot = path.join(repoPath, legacyHarnessLayout.rootDir);
  const containedRoot = path.join(repoPath, containedHarnessLayout.rootDir);
  const legacyRootState = await pathState(legacyRoot);
  const containedRootState = await pathState(containedRoot);
  const blockers: string[] = [];

  if (legacyRootState.exists && (!legacyRootState.isDirectory || legacyRootState.isSymlink)) {
    blockers.push(`${legacyHarnessLayout.rootDir} must be a real directory.`);
  }

  if (containedRootState.exists && (!containedRootState.isDirectory || containedRootState.isSymlink)) {
    blockers.push(`${containedHarnessLayout.rootDir} must be a real directory.`);
  }

  if (!legacyRootState.exists) {
    return {
      repoPath,
      status: "not_needed",
      message: "No legacy .agent harness root was found.",
      moves: [],
      blockers,
    };
  }

  if (containedRootState.exists) {
    blockers.push("Both .agent and .sharkbay exist; mixed-layout cleanup requires a separate conflict resolution pass.");
  }

  const moves = await collectRecognizedMoves(repoPath, blockers);
  if (moves.length === 0) {
    blockers.push("No recognized legacy harness files were found to migrate.");
  }

  await validateMoveTargets(repoPath, moves, blockers);

  if (blockers.length) {
    return {
      repoPath,
      status: "blocked",
      message: "Legacy harness cleanup is blocked by safety preflight.",
      moves: publicPlanMoves(moves),
      blockers,
    };
  }

  return {
    repoPath,
    status: "ready",
    message: "Legacy harness files can be moved into .sharkbay.",
    moves,
    blockers: [],
  };
}

async function collectRecognizedMoves(repoPath: string, blockers: string[]): Promise<MovePlan[]> {
  const moves: MovePlan[] = [];

  for (const [source, target] of legacyAgentFiles) {
    await maybeAddMove(repoPath, source, target, "file", moves, blockers);
  }

  for (const fileName of legacyDocs) {
    await maybeAddMove(
      repoPath,
      path.join(legacyHarnessLayout.docsDir, fileName),
      path.join(containedHarnessLayout.docsDir, fileName),
      "file",
      moves,
      blockers,
    );
  }

  await maybeAddMove(
    repoPath,
    path.join(legacyHarnessLayout.tasksDir, "_template"),
    path.join(containedHarnessLayout.tasksDir, "_template"),
    "directory",
    moves,
    blockers,
  );

  const tasksDir = path.join(repoPath, legacyHarnessLayout.tasksDir);
  const tasksState = await pathState(tasksDir);
  if (tasksState.exists) {
    if (!tasksState.isDirectory || tasksState.isSymlink) {
      blockers.push(`${legacyHarnessLayout.tasksDir} must be a real directory.`);
    } else {
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
          await maybeAddMove(
            repoPath,
            path.join(legacyHarnessLayout.tasksDir, entry.name),
            path.join(containedHarnessLayout.tasksDir, entry.name),
            "directory",
            moves,
            blockers,
          );
        }
      }
    }
  }

  const docsState = await pathState(path.join(repoPath, legacyHarnessLayout.docsDir));
  if (docsState.exists && (!docsState.isDirectory || docsState.isSymlink)) {
    blockers.push(`${legacyHarnessLayout.docsDir} must be a real directory.`);
  }

  return moves;
}

async function maybeAddMove(
  repoPath: string,
  source: string,
  target: string,
  kind: LegacyHarnessCleanupMove["kind"],
  moves: MovePlan[],
  blockers: string[],
): Promise<void> {
  const sourcePath = path.join(repoPath, source);
  const sourceState = await pathState(sourcePath);
  if (!sourceState.exists) return;
  if (sourceState.isSymlink) {
    blockers.push(`${source} cannot be a symlink.`);
    return;
  }
  if (kind === "file" && !sourceState.isFile) {
    blockers.push(`${source} must be a file.`);
    return;
  }
  if (kind === "directory" && !sourceState.isDirectory) {
    blockers.push(`${source} must be a directory.`);
    return;
  }
  if (kind === "directory") {
    await rejectNestedSymlinks(sourcePath, source, blockers);
  }

  moves.push({
    source,
    target,
    kind,
    sourcePath,
    targetPath: path.join(repoPath, target),
  });
}

async function validateMoveTargets(repoPath: string, moves: MovePlan[], blockers: string[]): Promise<void> {
  const seenTargets = new Set<string>();
  for (const move of moves) {
    if (!isPathInside(repoPath, move.sourcePath) || !isPathInside(repoPath, move.targetPath)) {
      blockers.push(`${move.source} resolves outside the repository.`);
      continue;
    }
    if (seenTargets.has(move.target)) {
      blockers.push(`Multiple legacy files would write ${move.target}.`);
      continue;
    }
    seenTargets.add(move.target);
    if (await exists(move.targetPath)) {
      blockers.push(`${move.target} already exists.`);
    }
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

async function removeIfEmpty(dirPath: string): Promise<boolean> {
  try {
    await fs.rmdir(dirPath);
    return true;
  } catch (error) {
    if (isErrorCode(error, "ENOENT") || isErrorCode(error, "ENOTEMPTY")) return false;
    throw error;
  }
}

function publicMoves(moves: MovePlan[]): LegacyHarnessCleanupMove[] {
  return moves.map(({ source, target, kind }) => ({ source, target, kind }));
}

function publicPlanMoves(moves: MovePlan[]): MovePlan[] {
  return moves;
}

async function pathState(targetPath: string): Promise<{ exists: boolean; isSymlink: boolean; isDirectory: boolean; isFile: boolean }> {
  try {
    const stat = await fs.lstat(targetPath);
    return {
      exists: true,
      isSymlink: stat.isSymbolicLink(),
      isDirectory: stat.isDirectory(),
      isFile: stat.isFile(),
    };
  } catch (error) {
    if (isErrorCode(error, "ENOENT")) {
      return { exists: false, isSymlink: false, isDirectory: false, isFile: false };
    }
    throw error;
  }
}

async function exists(targetPath: string): Promise<boolean> {
  try {
    await fs.access(targetPath);
    return true;
  } catch (error) {
    if (isErrorCode(error, "ENOENT")) return false;
    throw error;
  }
}

function failure(reason: "unsafe-path" | "io-error", error: unknown): LegacyHarnessCleanupCheckResult & LegacyHarnessCleanupMigrationResult {
  return {
    ok: false,
    reason,
    message: error instanceof Error ? error.message : String(error),
  };
}

function isErrorCode(error: unknown, code: string): boolean {
  return typeof error === "object" && error !== null && "code" in error && (error as { code?: unknown }).code === code;
}
