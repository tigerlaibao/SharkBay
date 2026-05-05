import { contextBridge, ipcRenderer } from "electron";
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

function invoke<Result>(channel: string, payload?: unknown): Promise<Result> {
  return ipcRenderer.invoke(channel, payload) as Promise<Result>;
}

const sharkBayApi = {
  listRoots: () => invoke<AppConfig>(channels.listRoots),
  addRoot: (input: RootConfigInput) => invoke<AppConfig>(channels.addRoot, input),
  removeRoot: (input: RemoveRootInput) => invoke<AppConfig>(channels.removeRoot, input),
  scanProjects: (input?: ProjectScanInput) => invoke<ScanProjectsResult>(channels.scanProjects, input),
  getProjectDetail: (input: ProjectDetailInput) =>
    invoke<ProjectDetail>(channels.getProjectDetail, input),
  updateProjectUrls: (input: UpdateProjectUrlsInput) =>
    invoke<SafeWriteResult>(channels.updateProjectUrls, input),
  createHarnessRepo: (input: CreateHarnessRepoInput) =>
    invoke<CreateHarnessRepoResult>(channels.createHarnessRepo, input),
  generateNextActionPrompt: (input: NextActionPromptInput) =>
    invoke<NextActionPromptResult>(channels.nextActionPrompt, input),
  config: {
    listRoots: () => invoke<AppConfig>(channels.listRoots),
    addRoot: (input: RootConfigInput) => invoke<AppConfig>(channels.addRoot, input),
    removeRoot: (input: RemoveRootInput) => invoke<AppConfig>(channels.removeRoot, input)
  },
  projects: {
    scan: (input?: ProjectScanInput) => invoke<ScanProjectsResult>(channels.scanProjects, input),
    getDetail: (input: ProjectDetailInput) =>
      invoke<ProjectDetail>(channels.getProjectDetail, input),
    updateUrls: (input: UpdateProjectUrlsInput) =>
      invoke<SafeWriteResult>(channels.updateProjectUrls, input),
    createHarnessRepo: (input: CreateHarnessRepoInput) =>
      invoke<CreateHarnessRepoResult>(channels.createHarnessRepo, input)
  },
  harness: {
    updateState: (input: HarnessJsonPatchInput) =>
      invoke<SafeWriteResult>(channels.updateHarnessState, input),
    updateManifest: (input: HarnessJsonPatchInput) =>
      invoke<SafeWriteResult>(channels.updateHarnessManifest, input),
    updateQueue: (input: HarnessJsonPatchInput) =>
      invoke<SafeWriteResult>(channels.updateHarnessQueue, input)
  },
  prompts: {
    nextAction: (input: NextActionPromptInput) =>
      invoke<NextActionPromptResult>(channels.nextActionPrompt, input)
  }
};

contextBridge.exposeInMainWorld("sharkBay", sharkBayApi);

export type SharkBayApi = typeof sharkBayApi;
