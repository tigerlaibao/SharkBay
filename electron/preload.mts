import { contextBridge, ipcRenderer } from "electron";
import { appChannels } from "../src/shared/app-events.js";
import type {
  AppConfig,
  CreateHarnessRepoInput,
  CreateHarnessRepoResult,
  HarnessJsonPatchInput,
  HarnessTemplateSyncCheckInput,
  HarnessTemplateSyncCheckResult,
  HarnessTemplateSyncUpdateInput,
  HarnessTemplateSyncUpdateResult,
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
  TerminalCloseInput,
  TerminalCreateInput,
  TerminalDataEvent,
  TerminalExitEvent,
  TerminalInput,
  TerminalResizeInput,
  TerminalSession,
  TerminalUpdateEvent,
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
  checkHarnessTemplateSync: "harness:checkTemplateSync",
  updateHarnessTemplateFiles: "harness:updateTemplateFiles",
  createHarnessRepo: "projects:createHarnessRepo",
  nextActionPrompt: "prompts:nextAction",
  createTerminal: "terminal:create",
  terminalInput: "terminal:input",
  resizeTerminal: "terminal:resize",
  closeTerminal: "terminal:close",
  terminalData: "terminal:data",
  terminalUpdate: "terminal:update",
  terminalExit: "terminal:exit"
} as const;

const openSettingsListeners = new Set<() => void>();
let openSettingsPending = false;

ipcRenderer.on(appChannels.openSettings, () => {
  if (!openSettingsListeners.size) {
    openSettingsPending = true;
    return;
  }

  openSettingsListeners.forEach((callback) => callback());
});

function invoke<Result>(channel: string, payload?: unknown): Promise<Result> {
  return ipcRenderer.invoke(channel, payload) as Promise<Result>;
}

const sharkBayApi = {
  app: {
    onOpenSettings: (callback: () => void) => {
      openSettingsListeners.add(callback);

      if (openSettingsPending) {
        openSettingsPending = false;
        queueMicrotask(callback);
      }

      return () => openSettingsListeners.delete(callback);
    }
  },
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
      invoke<SafeWriteResult>(channels.updateHarnessQueue, input),
    checkTemplateSync: (input: HarnessTemplateSyncCheckInput) =>
      invoke<HarnessTemplateSyncCheckResult>(channels.checkHarnessTemplateSync, input),
    updateTemplateFiles: (input: HarnessTemplateSyncUpdateInput) =>
      invoke<HarnessTemplateSyncUpdateResult>(channels.updateHarnessTemplateFiles, input)
  },
  prompts: {
    nextAction: (input: NextActionPromptInput) =>
      invoke<NextActionPromptResult>(channels.nextActionPrompt, input)
  },
  terminal: {
    create: (input: TerminalCreateInput) => invoke<TerminalSession>(channels.createTerminal, input),
    input: (input: TerminalInput) => invoke<TerminalSession>(channels.terminalInput, input),
    resize: (input: TerminalResizeInput) => invoke<TerminalSession>(channels.resizeTerminal, input),
    close: (input: TerminalCloseInput) => invoke<TerminalSession>(channels.closeTerminal, input),
    onData: (callback: (event: TerminalDataEvent) => void) => {
      const listener = (_event: Electron.IpcRendererEvent, payload: TerminalDataEvent) => callback(payload);
      ipcRenderer.on(channels.terminalData, listener);
      return () => ipcRenderer.removeListener(channels.terminalData, listener);
    },
    onExit: (callback: (event: TerminalExitEvent) => void) => {
      const listener = (_event: Electron.IpcRendererEvent, payload: TerminalExitEvent) => callback(payload);
      ipcRenderer.on(channels.terminalExit, listener);
      return () => ipcRenderer.removeListener(channels.terminalExit, listener);
    },
    onUpdate: (callback: (event: TerminalUpdateEvent) => void) => {
      const listener = (_event: Electron.IpcRendererEvent, payload: TerminalUpdateEvent) => callback(payload);
      ipcRenderer.on(channels.terminalUpdate, listener);
      return () => ipcRenderer.removeListener(channels.terminalUpdate, listener);
    }
  }
};

contextBridge.exposeInMainWorld("sharkBay", sharkBayApi);

export type SharkBayApi = typeof sharkBayApi;
