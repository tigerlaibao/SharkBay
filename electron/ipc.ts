import { BrowserWindow, ipcMain } from "electron";
import {
  addConfiguredRoot,
  getConfiguredRoots,
  removeConfiguredRoot,
  setAppearanceTheme
} from "../src/main/config.js";
import { readProjectDetail } from "../src/main/harness-reader.js";
import { checkHarnessTemplateSync, updateHarnessTemplateFiles } from "../src/main/harness-template-sync.js";
import { migrateLegacyHarnessToContained } from "../src/main/legacy-harness-cleanup.js";
import {
  updateHarnessManifest,
  updateHarnessQueue,
  updateHarnessState,
  updateProjectUrls
} from "../src/main/harness-writer.js";
import { generateNextActionPrompt } from "../src/main/prompt-generator.js";
import { scanProjects } from "../src/main/scanner.js";
import { createHarnessRepo } from "../src/main/template-installer.js";
import { TerminalManager } from "../src/main/terminal.js";
import type {
  AppConfig,
  AppearanceTheme,
  AppearanceThemeInput,
  CreateHarnessRepoInput,
  CreateHarnessRepoResult,
  HarnessJsonPatchInput,
  HarnessTemplateSyncCheckInput,
  HarnessTemplateSyncCheckResult,
  HarnessTemplateSyncUpdateInput,
  HarnessTemplateSyncUpdateResult,
  LegacyHarnessCleanupCheckInput,
  LegacyHarnessCleanupMigrationResult,
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
  TerminalInput,
  TerminalResizeInput,
  TerminalSession,
  TerminalUpdateEvent,
  UpdateProjectUrlsInput
} from "../src/shared/types.js";

export type IpcRuntime = {
  userDataPath: string;
  templateRoot: string;
};

export type IpcCallbacks = {
  onAppearanceThemeChanged?: (theme: AppearanceTheme) => void;
};

export type SharkBayIpcServices = {
  listRoots: () => Promise<AppConfig>;
  addRoot: (input: RootConfigInput) => Promise<AppConfig>;
  removeRoot: (input: RemoveRootInput) => Promise<AppConfig>;
  setAppearanceTheme: (input: AppearanceThemeInput) => Promise<AppConfig>;
  scanProjects: (input?: ProjectScanInput) => Promise<ScanProjectsResult>;
  getProjectDetail: (input: ProjectDetailInput) => Promise<ProjectDetail>;
  updateProjectUrls: (input: UpdateProjectUrlsInput) => Promise<SafeWriteResult>;
  updateHarnessState: (input: HarnessJsonPatchInput) => Promise<SafeWriteResult>;
  updateHarnessManifest: (input: HarnessJsonPatchInput) => Promise<SafeWriteResult>;
  updateHarnessQueue: (input: HarnessJsonPatchInput) => Promise<SafeWriteResult>;
  checkHarnessTemplateSync: (input: HarnessTemplateSyncCheckInput) => Promise<HarnessTemplateSyncCheckResult>;
  updateHarnessTemplateFiles: (input: HarnessTemplateSyncUpdateInput) => Promise<HarnessTemplateSyncUpdateResult>;
  migrateLegacyHarness: (input: LegacyHarnessCleanupCheckInput) => Promise<LegacyHarnessCleanupMigrationResult>;
  createHarnessRepo: (input: CreateHarnessRepoInput) => Promise<CreateHarnessRepoResult>;
  nextActionPrompt: (input: NextActionPromptInput) => Promise<NextActionPromptResult>;
  createTerminal: (input: TerminalCreateInput) => Promise<TerminalSession>;
  terminalInput: (input: TerminalInput) => Promise<TerminalSession>;
  resizeTerminal: (input: TerminalResizeInput) => Promise<TerminalSession>;
  closeTerminal: (input: TerminalCloseInput) => Promise<TerminalSession>;
};

const channels = {
  listRoots: "config:listRoots",
  addRoot: "config:addRoot",
  removeRoot: "config:removeRoot",
  setAppearanceTheme: "config:setAppearanceTheme",
  scanProjects: "projects:scan",
  getProjectDetail: "projects:getDetail",
  updateProjectUrls: "projects:updateUrls",
  updateHarnessState: "harness:updateState",
  updateHarnessManifest: "harness:updateManifest",
  updateHarnessQueue: "harness:updateQueue",
  checkHarnessTemplateSync: "harness:checkTemplateSync",
  updateHarnessTemplateFiles: "harness:updateTemplateFiles",
  migrateLegacyHarness: "harness:migrateLegacy",
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

const terminalManager = new TerminalManager();

export function closeAllTerminalSessions(): void {
  terminalManager.closeAll();
}

function createDefaultServices(runtime: IpcRuntime): SharkBayIpcServices {
  return {
    listRoots: () => getConfiguredRoots(runtime),
    addRoot: (input) => addConfiguredRoot(runtime, input),
    removeRoot: (input) => removeConfiguredRoot(runtime, input),
    setAppearanceTheme: (input) => setAppearanceTheme(runtime, input),
    scanProjects: (input) => scanProjects(runtime, input),
    getProjectDetail: (input) => readProjectDetail(runtime, input),
    updateProjectUrls: (input) => updateProjectUrls(runtime, input),
    updateHarnessState: (input) => updateHarnessState(runtime, input),
    updateHarnessManifest: (input) => updateHarnessManifest(runtime, input),
    updateHarnessQueue: (input) => updateHarnessQueue(runtime, input),
    checkHarnessTemplateSync: async (input) => {
      const configuredRoots = (await getConfiguredRoots(runtime)).configuredRoots;
      return checkHarnessTemplateSync({ ...input, configuredRoots, templateDir: runtime.templateRoot });
    },
    updateHarnessTemplateFiles: async (input) => {
      const configuredRoots = (await getConfiguredRoots(runtime)).configuredRoots;
      return updateHarnessTemplateFiles({ ...input, configuredRoots, templateDir: runtime.templateRoot });
    },
    migrateLegacyHarness: async (input) => {
      const configuredRoots = (await getConfiguredRoots(runtime)).configuredRoots;
      return migrateLegacyHarnessToContained({ ...input, configuredRoots });
    },
    createHarnessRepo: (input) => createHarnessRepo(runtime, input),
    nextActionPrompt: (input) => generateNextActionPrompt(runtime, input),
    createTerminal: (input) => terminalManager.create(runtime, input),
    terminalInput: (input) => Promise.resolve(terminalManager.input(input)),
    resizeTerminal: (input) => Promise.resolve(terminalManager.resize(input)),
    closeTerminal: (input) => Promise.resolve(terminalManager.close(input))
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
  services: SharkBayIpcServices = createDefaultServices(runtime),
  callbacks: IpcCallbacks = {}
): void {
  terminalManager.removeAllListeners("data");
  terminalManager.removeAllListeners("update");
  terminalManager.removeAllListeners("exit");
  terminalManager.on("data", (event) => {
    BrowserWindow.getAllWindows().forEach((window) => {
      window.webContents.send(channels.terminalData, event);
    });
  });
  terminalManager.on("update", (event: TerminalUpdateEvent) => {
    BrowserWindow.getAllWindows().forEach((window) => {
      window.webContents.send(channels.terminalUpdate, event);
    });
  });
  terminalManager.on("exit", (event) => {
    BrowserWindow.getAllWindows().forEach((window) => {
      window.webContents.send(channels.terminalExit, event);
    });
  });
  handle<void, AppConfig>(channels.listRoots, () => services.listRoots());
  handle<RootConfigInput, AppConfig>(channels.addRoot, (payload) => services.addRoot(payload));
  handle<RemoveRootInput, AppConfig>(channels.removeRoot, (payload) =>
    services.removeRoot(payload)
  );
  handle<AppearanceThemeInput, AppConfig>(channels.setAppearanceTheme, (payload) =>
    services.setAppearanceTheme(payload).then((config) => {
      callbacks.onAppearanceThemeChanged?.(config.appearanceTheme);
      return config;
    })
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
  handle<HarnessTemplateSyncCheckInput, HarnessTemplateSyncCheckResult>(channels.checkHarnessTemplateSync, (payload) =>
    services.checkHarnessTemplateSync(payload)
  );
  handle<HarnessTemplateSyncUpdateInput, HarnessTemplateSyncUpdateResult>(channels.updateHarnessTemplateFiles, (payload) =>
    services.updateHarnessTemplateFiles(payload)
  );
  handle<LegacyHarnessCleanupCheckInput, LegacyHarnessCleanupMigrationResult>(channels.migrateLegacyHarness, (payload) =>
    services.migrateLegacyHarness(payload)
  );
  handle<CreateHarnessRepoInput, CreateHarnessRepoResult>(channels.createHarnessRepo, (payload) =>
    services.createHarnessRepo(payload)
  );
  handle<NextActionPromptInput, NextActionPromptResult>(channels.nextActionPrompt, (payload) =>
    services.nextActionPrompt(payload)
  );
  handle<TerminalCreateInput, TerminalSession>(channels.createTerminal, (payload) =>
    services.createTerminal(payload)
  );
  handle<TerminalInput, TerminalSession>(channels.terminalInput, (payload) =>
    services.terminalInput(payload)
  );
  handle<TerminalResizeInput, TerminalSession>(channels.resizeTerminal, (payload) =>
    services.resizeTerminal(payload)
  );
  handle<TerminalCloseInput, TerminalSession>(channels.closeTerminal, (payload) =>
    services.closeTerminal(payload)
  );
}
