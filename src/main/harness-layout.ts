import { promises as fs } from "node:fs";
import path from "node:path";
import type { DetectionMode, HarnessJsonFile, HarnessLayoutKind } from "../shared/types.js";

export type HarnessLayout = {
  kind: HarnessLayoutKind;
  rootDir: ".sharkbay" | ".agent";
  manifestJson: string;
  stateJson: string;
  queueJson: string;
  stateMarkdown: string;
  queueMarkdown: string;
  developmentJson: string;
  runnerJson: string;
  protocolMarkdown: string;
  qualityRulesMarkdown: string;
  templateSyncJson: string;
  docsDir: string;
  tasksDir: string;
};

export type DetectedHarnessLayout = {
  layout: HarnessLayout;
  detection: DetectionMode;
};

export const containedHarnessLayout: HarnessLayout = {
  kind: "contained",
  rootDir: ".sharkbay",
  manifestJson: ".sharkbay/manifest.json",
  stateJson: ".sharkbay/state.json",
  queueJson: ".sharkbay/queue.json",
  stateMarkdown: ".sharkbay/state.md",
  queueMarkdown: ".sharkbay/queue.md",
  developmentJson: ".sharkbay/development.json",
  runnerJson: ".sharkbay/runner.json",
  protocolMarkdown: ".sharkbay/protocol.md",
  qualityRulesMarkdown: ".sharkbay/quality-rules.md",
  templateSyncJson: ".sharkbay/template-sync.json",
  docsDir: ".sharkbay/docs",
  tasksDir: ".sharkbay/tasks",
};

export const legacyHarnessLayout: HarnessLayout = {
  kind: "legacy",
  rootDir: ".agent",
  manifestJson: ".agent/manifest.json",
  stateJson: ".agent/state.json",
  queueJson: ".agent/queue.json",
  stateMarkdown: ".agent/state.md",
  queueMarkdown: ".agent/queue.md",
  developmentJson: ".agent/development.json",
  runnerJson: ".agent/runner.json",
  protocolMarkdown: ".agent/protocol.md",
  qualityRulesMarkdown: ".agent/quality-rules.md",
  templateSyncJson: ".agent/template-sync.json",
  docsDir: "docs",
  tasksDir: "tasks",
};

export const harnessLayouts = [containedHarnessLayout, legacyHarnessLayout] as const;

export function layoutForKind(kind: HarnessLayoutKind): HarnessLayout {
  return kind === "contained" ? containedHarnessLayout : legacyHarnessLayout;
}

export function harnessJsonRelativePath(layout: HarnessLayout, file: HarnessJsonFile): string {
  if (file === ".agent/manifest.json") return layout.manifestJson;
  if (file === ".agent/state.json") return layout.stateJson;
  return layout.queueJson;
}

export function logicalHarnessJsonLabel(file: HarnessJsonFile): "manifest" | "state" | "queue" {
  if (file === ".agent/manifest.json") return "manifest";
  if (file === ".agent/state.json") return "state";
  return "queue";
}

export function harnessJsonFileForLabel(label: "manifest" | "state" | "queue"): HarnessJsonFile {
  if (label === "manifest") return ".agent/manifest.json";
  if (label === "state") return ".agent/state.json";
  return ".agent/queue.json";
}

export async function detectHarnessLayout(repoPath: string): Promise<DetectedHarnessLayout | null> {
  for (const layout of harnessLayouts) {
    const detection = await detectLayout(repoPath, layout);
    if (detection) return { layout, detection };
  }
  return null;
}

export async function isExistingHarnessLayout(repoPath: string): Promise<boolean> {
  for (const layout of harnessLayouts) {
    if (await existingLayoutRoot(repoPath, layout)) return true;
  }
  return false;
}

async function detectLayout(repoPath: string, layout: HarnessLayout): Promise<DetectionMode | null> {
  if (!await existingLayoutRoot(repoPath, layout)) return null;
  if (await exists(path.join(repoPath, layout.manifestJson))) return "manifest";
  if (await exists(path.join(repoPath, layout.protocolMarkdown))) return "protocol-fallback";
  return null;
}

async function existingLayoutRoot(repoPath: string, layout: HarnessLayout): Promise<boolean> {
  try {
    const stat = await fs.lstat(path.join(repoPath, layout.rootDir));
    return stat.isDirectory() && !stat.isSymbolicLink();
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
