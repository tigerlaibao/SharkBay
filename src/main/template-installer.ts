import { promises as fs } from "node:fs";
import path from "node:path";
import type { CreateHarnessRepoInput, CreateHarnessRepoResult, IpcRuntimeLike } from "../shared/types.js";
import { getRuntimeConfigPath, loadAppConfig } from "./config.js";
import { harnessTemplateSyncMetadataPath, writeCurrentTemplateSyncMetadata } from "./harness-template-sync.js";
import { isExistingHarnessLayout } from "./harness-layout.js";
import { assertCreateTargetInsideConfiguredRoots } from "./path-safety.js";

export function createHarnessRepo(input: CreateHarnessRepoInput): Promise<CreateHarnessRepoResult>;
export function createHarnessRepo(runtime: IpcRuntimeLike, input: CreateHarnessRepoInput): Promise<CreateHarnessRepoResult>;
export async function createHarnessRepo(
  first: CreateHarnessRepoInput | IpcRuntimeLike,
  second?: CreateHarnessRepoInput,
): Promise<CreateHarnessRepoResult> {
  const runtime = second ? (first as IpcRuntimeLike) : null;
  const input = second ?? (first as CreateHarnessRepoInput);
  const targetDir = path.resolve(input.targetDir);
  const templateDir = path.resolve(input.templateDir || runtime?.templateRoot || path.join(process.cwd(), "templates", "harness"));
  const configuredRoots = runtime
    ? (await loadAppConfig(getRuntimeConfigPath(runtime))).configuredRoots
    : input.configuredRoots;

  try {
    await assertCreateTargetInsideConfiguredRoots(targetDir, configuredRoots);
  } catch (error) {
    return { ok: false, reason: "unsafe-path", message: messageOf(error) };
  }

  try {
    const templateStat = await fs.stat(templateDir);
    if (!templateStat.isDirectory()) {
      return { ok: false, reason: "template-missing", message: "Harness template directory is missing" };
    }
  } catch (error) {
    return { ok: false, reason: "template-missing", message: messageOf(error) };
  }

  try {
    await fs.mkdir(targetDir, { recursive: true });
    const entries = await fs.readdir(targetDir);
    if (entries.length > 0 && !input.allowExistingDirectory) {
      return { ok: false, reason: "non-empty-target", message: "Target directory must be empty" };
    }
    if (await isExistingHarnessLayout(targetDir)) {
      return { ok: false, reason: "existing-harness", message: "Target already contains harness files" };
    }

    const variables = templateVariables(input);
    const files = await copyTemplateTree(templateDir, targetDir, variables);
    await writeCurrentTemplateSyncMetadata(targetDir, templateDir);
    return { ok: true, path: targetDir, files: [...files, harnessTemplateSyncMetadataPath].sort() };
  } catch (error) {
    if (error instanceof FileCollisionError) {
      return { ok: false, reason: "file-collision", message: error.message };
    }
    return { ok: false, reason: "io-error", message: messageOf(error) };
  }
}

class FileCollisionError extends Error {
  constructor(filePath: string) {
    super(`Refusing to overwrite existing file: ${filePath}`);
    this.name = "FileCollisionError";
  }
}

async function copyTemplateTree(
  templateRoot: string,
  targetRoot: string,
  variables: Record<string, string>,
): Promise<string[]> {
  const written: string[] = [];
  const files = await collectTemplateFiles(templateRoot, targetRoot);

  for (const file of files) {
    if (await exists(file.target)) {
      throw new FileCollisionError(file.target);
    }
  }

  for (const file of files) {
    await fs.mkdir(path.dirname(file.target), { recursive: true });
    const rendered = renderTemplate(await fs.readFile(file.source, "utf8"), variables);
    await fs.writeFile(file.target, rendered, { encoding: "utf8", mode: 0o600 });
    written.push(file.relativePath);
  }

  return written.sort();
}

async function collectTemplateFiles(templateRoot: string, targetRoot: string): Promise<Array<{ source: string; target: string; relativePath: string }>> {
  const files: Array<{ source: string; target: string; relativePath: string }> = [];
  async function copyDirectory(sourceDir: string, targetDir: string): Promise<void> {
    const entries = await fs.readdir(sourceDir, { withFileTypes: true });
    for (const entry of entries) {
      const source = path.join(sourceDir, entry.name);
      const target = path.join(targetDir, entry.name);
      if (entry.isDirectory()) {
        await copyDirectory(source, target);
        continue;
      }
      if (!entry.isFile()) continue;
      files.push({ source, target, relativePath: path.relative(targetRoot, target) });
    }
  }

  await copyDirectory(templateRoot, targetRoot);
  return files;
}

function renderTemplate(template: string, variables: Record<string, string>): string {
  return template.replace(/\{\{([A-Z_]+)\}\}/g, (_, name: string) => variables[name] ?? "");
}

function templateVariables(input: CreateHarnessRepoInput): Record<string, string> {
  const slug = input.projectSlug || slugify(input.projectName);
  return {
    PROJECT_NAME: input.projectName,
    PROJECT_SLUG: slug,
    DESCRIPTION: input.description || "",
    DATE: new Date().toISOString().slice(0, 10),
  };
}

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function exists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
