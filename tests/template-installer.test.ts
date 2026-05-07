import { promises as fs } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { makeTempRoot, writeJson, writeText } from "./helpers.js";
import { createHarnessRepo } from "../src/main/template-installer.js";

describe("template installer", () => {
  it("creates a harness repo from bundled templates", async () => {
    const root = await makeTempRoot("template");
    const target = path.join(root, "NewProject");

    const result = await createHarnessRepo({
      targetDir: target,
      configuredRoots: [root],
      projectName: "New Project",
      description: "A test project",
      templateDir: path.join(process.cwd(), "templates", "harness"),
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.files).toContain("AGENTS.md");
    expect(result.files).not.toContain(".gitignore");
    expect(result.files).toContain(".sharkbay/template-sync.json");
    expect(result.files).toContain(".sharkbay/manifest.json");
    expect(result.files).toContain(".sharkbay/docs/product.md");
    const agents = await fs.readFile(path.join(target, "AGENTS.md"), "utf8");
    const protocol = await fs.readFile(path.join(target, ".sharkbay", "protocol.md"), "utf8");
    expect(agents).toContain("Do not rely on chat memory");
    expect(agents).toContain("Continue autonomously across phases");
    expect(agents).toContain("do not leave completed harness initialization or phase work uncommitted");
    expect(protocol).toContain("Do not skip phase gates");
    expect(protocol).toContain("Default to autonomous forward progress");
    expect(protocol).toContain("checkpoint commits are required");
    expect(await fs.readFile(path.join(target, ".sharkbay", "tasks", "t-001-initial-task", "status.md"), "utf8")).toContain("must commit the installed harness files");
    await expect(fs.access(path.join(target, ".gitignore"))).rejects.toThrow();
    await expect(fs.access(path.join(target, ".agent"))).rejects.toThrow();
    await expect(fs.access(path.join(target, "docs"))).rejects.toThrow();
    await expect(fs.access(path.join(target, "tasks"))).rejects.toThrow();
    expect(await fs.readFile(path.join(target, ".sharkbay", "template-sync.json"), "utf8")).toContain('"source": "sharkbay/templates/harness"');
    expect(await fs.readFile(path.join(target, ".sharkbay", "manifest.json"), "utf8")).toContain('"name": "New Project"');
  });

  it("refuses non-empty targets and targets outside configured roots", async () => {
    const root = await makeTempRoot("template-refuse");
    const target = path.join(root, "Existing");
    await writeText(path.join(target, "README.md"), "# Existing\n");

    const nonEmpty = await createHarnessRepo({ targetDir: target, configuredRoots: [root], projectName: "Existing" });
    expect(nonEmpty.ok).toBe(false);
    if (!nonEmpty.ok) expect(nonEmpty.reason).toBe("non-empty-target");

    const outside = await makeTempRoot("template-outside");
    const unsafe = await createHarnessRepo({ targetDir: path.join(outside, "New"), configuredRoots: [root], projectName: "Unsafe" });
    expect(unsafe.ok).toBe(false);
    if (!unsafe.ok) expect(unsafe.reason).toBe("unsafe-path");
  });

  it("installs harness files into an existing directory only when explicitly allowed", async () => {
    const root = await makeTempRoot("template-existing");
    const target = path.join(root, "ExistingProject");
    await writeText(path.join(target, "README.md"), "# Existing\n");

    const result = await createHarnessRepo({
      targetDir: target,
      configuredRoots: [root],
      projectName: "Existing Project",
      allowExistingDirectory: true,
      templateDir: path.join(process.cwd(), "templates", "harness"),
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.files).toContain("AGENTS.md");
    expect(result.files).toContain(".sharkbay/manifest.json");
    expect(await fs.readFile(path.join(target, "README.md"), "utf8")).toBe("# Existing\n");
    expect(await fs.readFile(path.join(target, ".sharkbay", "manifest.json"), "utf8")).toContain('"name": "Existing Project"');
  });

  it("preserves existing project gitignore during existing directory setup", async () => {
    const root = await makeTempRoot("template-existing-gitignore");
    const target = path.join(root, "ExistingGitignore");
    const originalGitignore = "node_modules/\n.env\n";
    await writeText(path.join(target, ".gitignore"), originalGitignore);

    const result = await createHarnessRepo({
      targetDir: target,
      configuredRoots: [root],
      projectName: "Existing Gitignore",
      allowExistingDirectory: true,
      templateDir: path.join(process.cwd(), "templates", "harness"),
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.files).toContain("AGENTS.md");
    expect(result.files).toContain(".sharkbay/manifest.json");
    expect(result.files).not.toContain(".gitignore");
    expect(await fs.readFile(path.join(target, ".gitignore"), "utf8")).toBe(originalGitignore);
    expect(await fs.readFile(path.join(target, ".sharkbay", "manifest.json"), "utf8")).toContain('"name": "Existing Gitignore"');
  });

  it("refuses existing harness files and template collisions during existing directory setup", async () => {
    const root = await makeTempRoot("template-collisions");
    const withAgent = path.join(root, "WithAgent");
    await writeText(path.join(withAgent, ".agent", "protocol.md"), "# Existing\n");

    const existingHarness = await createHarnessRepo({
      targetDir: withAgent,
      configuredRoots: [root],
      projectName: "With Agent",
      allowExistingDirectory: true,
    });
    expect(existingHarness.ok).toBe(false);
    if (!existingHarness.ok) expect(existingHarness.reason).toBe("existing-harness");

    const withSharkbay = path.join(root, "WithSharkbay");
    await writeText(path.join(withSharkbay, ".sharkbay", "protocol.md"), "# Existing\n");
    const existingContainedHarness = await createHarnessRepo({
      targetDir: withSharkbay,
      configuredRoots: [root],
      projectName: "With Sharkbay",
      allowExistingDirectory: true,
    });
    expect(existingContainedHarness.ok).toBe(false);
    if (!existingContainedHarness.ok) expect(existingContainedHarness.reason).toBe("existing-harness");

    const withPartialSharkbay = path.join(root, "PartialSharkbay");
    await writeText(path.join(withPartialSharkbay, ".sharkbay", "docs", "product.md"), "# Existing product\n");
    const collided = await createHarnessRepo({
      targetDir: withPartialSharkbay,
      configuredRoots: [root],
      projectName: "Collision",
      allowExistingDirectory: true,
      templateDir: path.join(process.cwd(), "templates", "harness"),
    });
    expect(collided.ok).toBe(false);
    if (!collided.ok) expect(collided.reason).toBe("existing-harness");
    expect(await fs.readFile(path.join(withPartialSharkbay, ".sharkbay", "docs", "product.md"), "utf8")).toBe("# Existing product\n");
    await expect(fs.access(path.join(withPartialSharkbay, ".sharkbay", "manifest.json"))).rejects.toThrow();
  });

  it("refuses to overwrite an existing root AGENTS.md during existing directory setup", async () => {
    const root = await makeTempRoot("template-agents-collision");
    const target = path.join(root, "ExistingAgents");
    await writeText(path.join(target, "AGENTS.md"), "# Existing local agent rules\n");

    const result = await createHarnessRepo({
      targetDir: target,
      configuredRoots: [root],
      projectName: "Existing Agents",
      allowExistingDirectory: true,
      templateDir: path.join(process.cwd(), "templates", "harness"),
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toBe("file-collision");
      expect(result.message).toContain("AGENTS.md");
    }
    expect(await fs.readFile(path.join(target, "AGENTS.md"), "utf8")).toBe("# Existing local agent rules\n");
    await expect(fs.access(path.join(target, ".sharkbay"))).rejects.toThrow();
  });

  it("runtime create uses persisted roots and rejects symlink targets", async () => {
    const root = await makeTempRoot("template-runtime-root");
    const outside = await makeTempRoot("template-runtime-outside");
    const userDataPath = await makeTempRoot("template-runtime-config");
    await writeJson(path.join(userDataPath, "config.json"), {
      schemaVersion: 1,
      configuredRoots: [root],
      updatedAt: "2026-05-05",
    });

    const outsideTarget = path.join(outside, "RuntimeBypass");
    const bypass = await createHarnessRepo(
      { userDataPath, templateRoot: path.join(process.cwd(), "templates", "harness") },
      { targetDir: outsideTarget, configuredRoots: [outside], projectName: "Bypass" },
    );
    expect(bypass.ok).toBe(false);
    if (!bypass.ok) expect(bypass.reason).toBe("unsafe-path");

    const symlinkTarget = path.join(root, "SymlinkTarget");
    await fs.symlink(outside, symlinkTarget);
    const symlinked = await createHarnessRepo({ targetDir: symlinkTarget, configuredRoots: [root], projectName: "Symlinked" });
    expect(symlinked.ok).toBe(false);
    if (!symlinked.ok) expect(symlinked.reason).toBe("unsafe-path");
  });

  it("runtime existing directory setup uses persisted roots", async () => {
    const root = await makeTempRoot("template-runtime-existing-root");
    const outside = await makeTempRoot("template-runtime-existing-outside");
    const userDataPath = await makeTempRoot("template-runtime-existing-config");
    await writeJson(path.join(userDataPath, "config.json"), {
      schemaVersion: 1,
      configuredRoots: [root],
      updatedAt: "2026-05-05",
    });

    const allowedTarget = path.join(root, "AllowedExisting");
    await writeText(path.join(allowedTarget, "README.md"), "# Allowed\n");
    const allowed = await createHarnessRepo(
      { userDataPath, templateRoot: path.join(process.cwd(), "templates", "harness") },
      {
        targetDir: allowedTarget,
        configuredRoots: [outside],
        projectName: "Allowed Existing",
        allowExistingDirectory: true,
      },
    );
    expect(allowed.ok).toBe(true);

    const outsideTarget = path.join(outside, "OutsideExisting");
    await writeText(path.join(outsideTarget, "README.md"), "# Outside\n");
    const rejected = await createHarnessRepo(
      { userDataPath, templateRoot: path.join(process.cwd(), "templates", "harness") },
      {
        targetDir: outsideTarget,
        configuredRoots: [outside],
        projectName: "Outside Existing",
        allowExistingDirectory: true,
      },
    );
    expect(rejected.ok).toBe(false);
    if (!rejected.ok) expect(rejected.reason).toBe("unsafe-path");
  });
});
