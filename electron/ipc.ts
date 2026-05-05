import { ipcMain } from "electron";
import {
  addConfiguredRoot,
  getConfiguredRoots,
  removeConfiguredRoot
} from "../src/main/config.js";
import { readProjectDetail } from "../src/main/harness-reader.js";
import {
  updateHarnessManifest,
  updateHarnessQueue,
  updateHarnessState,
  updateProjectUrls
} from "../src/main/harness-writer.js";
import { generateNextActionPrompt } from "../src/main/prompt-generator.js";
import { scanProjects } from "../src/main/scanner.js";
import { createHarnessRepo } from "../src/main/template-installer.js";
import type {
  AppConfig,
  CreateHarnessRepoInput,
  CreateHarnessRepoResult,
  HarnessJsonPatchInput,
  NextActionPromptInput,
  NextActionPromptResult,
  ProjectDetail,
  ProjectDetailInput,
  ProjectScanInput,
  ProjectSummary,
  ScanProjectsResult,
  RemoveRootInput,
  RootConfigInput,
  SafeWriteResult,
  UpdateProjectUrlsInput
} from "../src/shared/types.js";

export type IpcRuntime = {
  userDataPath: string;
  templateRoot: string;
};

export type SharkBayIpcServices = {
  listRoots: () => Promise<AppConfig>;
  addRoot: (input: RootConfigInput) => Promise<AppConfig>;
  removeRoot: (input: RemoveRootInput) => Promise<AppConfig>;
  scanProjects: (input?: ProjectScanInput) => Promise<ScanProjectsResult>;
  getProjectDetail: (input: ProjectDetailInput) => Promise<ProjectDetail>;
  updateProjectUrls: (input: UpdateProjectUrlsInput) => Promise<SafeWriteResult>;
  updateHarnessState: (input: HarnessJsonPatchInput) => Promise<SafeWriteResult>;
  updateHarnessManifest: (input: HarnessJsonPatchInput) => Promise<SafeWriteResult>;
  updateHarnessQueue: (input: HarnessJsonPatchInput) => Promise<SafeWriteResult>;
  createHarnessRepo: (input: CreateHarnessRepoInput) => Promise<CreateHarnessRepoResult>;
  nextActionPrompt: (input: NextActionPromptInput) => Promise<NextActionPromptResult>;
};

const channels = {
  listRoots: "config:listRoots",
  addRoot: "config:addRoot",
  removeRoot: "config:removeRoot",
  scanProjects: "projects:scan",
  getProjectDetail: "projects:getDetail",
  updateProjectUrls: "projects:updateUrls",
  updateHarnessState: "harness:updateState",
  updateHarnessManifest: "harness:updateManifest",
  updateHarnessQueue: "harness:updateQueue",
  createHarnessRepo: "projects:createHarnessRepo",
  nextActionPrompt: "prompts:nextAction"
} as const;

function createDefaultServices(runtime: IpcRuntime): SharkBayIpcServices {
  return {
    listRoots: () => getConfiguredRoots(runtime),
    addRoot: (input) => addConfiguredRoot(runtime, input),
    removeRoot: (input) => removeConfiguredRoot(runtime, input),
    scanProjects: (input) => scanProjects(runtime, input),
    getProjectDetail: (input) => readProjectDetail(runtime, input),
    updateProjectUrls: (input) => updateProjectUrls(runtime, input),
    updateHarnessState: (input) => updateHarnessState(runtime, input),
    updateHarnessManifest: (input) => updateHarnessManifest(runtime, input),
    updateHarnessQueue: (input) => updateHarnessQueue(runtime, input),
    createHarnessRepo: (input) => createHarnessRepo(runtime, input),
    nextActionPrompt: (input) => generateNextActionPrompt(runtime, input)
  };
}

function handle<Payload, Result>(
  channel: string,
  callback: (payload: Payload) => Promise<Result>
): void {
  ipcMain.removeHandler(channel);
  ipcMain.handle(channel, (_event, payload: Payload) => callback(payload));
}

export function registerIpcHandlers(
  runtime: IpcRuntime,
  services: SharkBayIpcServices = createDefaultServices(runtime)
): void {
  handle<void, AppConfig>(channels.listRoots, () => services.listRoots());
  handle<RootConfigInput, AppConfig>(channels.addRoot, (payload) => services.addRoot(payload));
  handle<RemoveRootInput, AppConfig>(channels.removeRoot, (payload) =>
    services.removeRoot(payload)
  );
  handle<ProjectScanInput | undefined, ScanProjectsResult>(channels.scanProjects, (payload) =>
    services.scanProjects(payload)
  );
  handle<ProjectDetailInput, ProjectDetail>(channels.getProjectDetail, (payload) =>
    services.getProjectDetail(payload)
  );
  handle<UpdateProjectUrlsInput, SafeWriteResult>(channels.updateProjectUrls, (payload) =>
    services.updateProjectUrls(payload)
  );
  handle<HarnessJsonPatchInput, SafeWriteResult>(channels.updateHarnessState, (payload) =>
    services.updateHarnessState(payload)
  );
  handle<HarnessJsonPatchInput, SafeWriteResult>(channels.updateHarnessManifest, (payload) =>
    services.updateHarnessManifest(payload)
  );
  handle<HarnessJsonPatchInput, SafeWriteResult>(channels.updateHarnessQueue, (payload) =>
    services.updateHarnessQueue(payload)
  );
  handle<CreateHarnessRepoInput, CreateHarnessRepoResult>(channels.createHarnessRepo, (payload) =>
    services.createHarnessRepo(payload)
  );
  handle<NextActionPromptInput, NextActionPromptResult>(channels.nextActionPrompt, (payload) =>
    services.nextActionPrompt(payload)
  );
}
