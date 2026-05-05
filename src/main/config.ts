import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import type { AppConfig, IpcRuntimeLike, RemoveRootInput, RootConfigInput } from "../shared/types.js";
import { isRecord } from "../shared/schema.js";
import { writeJsonAtomic, readJsonFile } from "./json-file.js";

const defaultConfigPath = path.join(os.homedir(), ".sharkbay", "config.json");

export function getConfigPath(explicitPath = process.env.SHARKBAY_CONFIG_PATH): string {
  return path.resolve(explicitPath || defaultConfigPath);
}

export function getRuntimeConfigPath(runtime: IpcRuntimeLike): string {
  return path.join(runtime.userDataPath, "config.json");
}

export function createDefaultConfig(): AppConfig {
  return {
    schemaVersion: 1,
    configuredRoots: [],
    updatedAt: today(),
  };
}

export async function loadAppConfig(configPath = getConfigPath()): Promise<AppConfig> {
  const result = await readJsonFile(configPath);
  if (!result.ok) {
    if (result.reason === "missing") {
      return createDefaultConfig();
    }
    throw new Error(`Unable to load app config: ${result.message}`);
  }
  return normalizeAppConfig(result.data);
}

export async function getConfiguredRoots(runtime: IpcRuntimeLike): Promise<AppConfig> {
  return loadAppConfig(getRuntimeConfigPath(runtime));
}

export async function saveAppConfig(config: AppConfig, configPath = getConfigPath()): Promise<void> {
  await fs.mkdir(path.dirname(configPath), { recursive: true });
  await writeJsonAtomic(configPath, normalizeAppConfig(config));
}

export async function addConfiguredRoot(rootPath: string, configPath?: string): Promise<AppConfig>;
export async function addConfiguredRoot(runtime: IpcRuntimeLike, input: RootConfigInput): Promise<AppConfig>;
export async function addConfiguredRoot(first: string | IpcRuntimeLike, second?: string | RootConfigInput): Promise<AppConfig> {
  const rootPath = typeof first === "string" ? first : rootFromInput(second);
  const configPath = typeof first === "string" ? second as string | undefined : getRuntimeConfigPath(first);
  const config = await loadAppConfig(configPath);
  const absolute = path.resolve(rootPath);
  if (!config.configuredRoots.includes(absolute)) {
    config.configuredRoots.push(absolute);
  }
  config.updatedAt = today();
  await saveAppConfig(config, configPath);
  return config;
}

export async function removeConfiguredRoot(rootPath: string, configPath?: string): Promise<AppConfig>;
export async function removeConfiguredRoot(runtime: IpcRuntimeLike, input: RemoveRootInput): Promise<AppConfig>;
export async function removeConfiguredRoot(first: string | IpcRuntimeLike, second?: string | RemoveRootInput): Promise<AppConfig> {
  const rootPath = typeof first === "string" ? first : rootFromInput(second);
  const configPath = typeof first === "string" ? second as string | undefined : getRuntimeConfigPath(first);
  const config = await loadAppConfig(configPath);
  const absolute = path.resolve(rootPath);
  config.configuredRoots = config.configuredRoots.filter((root) => root !== absolute);
  config.updatedAt = today();
  await saveAppConfig(config, configPath);
  return config;
}

function rootFromInput(input: string | RootConfigInput | RemoveRootInput | undefined): string {
  if (typeof input === "string") return input;
  const rootPath = input?.path || input?.rootPath;
  if (!rootPath) {
    throw new Error("Root path is required");
  }
  return rootPath;
}

function normalizeAppConfig(value: unknown): AppConfig {
  if (!isRecord(value)) return createDefaultConfig();
  return {
    schemaVersion: 1,
    configuredRoots: Array.isArray(value.configuredRoots)
      ? [...new Set(value.configuredRoots.filter((item): item is string => typeof item === "string").map((item) => path.resolve(item)))]
      : [],
    updatedAt: typeof value.updatedAt === "string" ? value.updatedAt : today(),
  };
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}
