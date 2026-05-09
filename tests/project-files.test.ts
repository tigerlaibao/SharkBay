import { promises as fs } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { isEditableProjectFile, listProjectFiles } from "../src/main/project-files.js";
import { makeTempRoot, writeText } from "./helpers.js";

describe("project file listing", () => {
  it("returns a sorted editable project file tree inside configured roots", async () => {
    const root = await makeTempRoot("project-files");
    const repo = path.join(root, "Fixture");
    await writeText(path.join(repo, "README.md"), "# Fixture\n");
    await writeText(path.join(repo, "src", "App.tsx"), "export function App() { return null; }\n");
    await writeText(path.join(repo, "src", "logo.png"), "not really an image\n");
    await writeText(path.join(repo, "node_modules", "ignored", "index.ts"), "ignored\n");
    await writeText(path.join(repo, ".git", "config"), "ignored\n");
    await writeText(path.join(root, "outside", "secret.md"), "secret\n");
    await fs.symlink(path.join(root, "outside"), path.join(repo, "linked-outside"));

    const result = await listProjectFiles({ userDataPath: root }, { repoPath: repo, configuredRoots: [root] });

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.files.map((item) => item.path)).toEqual(["src", "README.md"]);
    const src = result.files.find((item) => item.path === "src");
    expect(src?.children?.map((item) => item.path)).toEqual(["src/App.tsx", "src/logo.png"]);
    expect(src?.children?.find((item) => item.path === "src/App.tsx")?.editable).toBe(true);
    expect(src?.children?.find((item) => item.path === "src/logo.png")?.editable).toBe(false);
  });

  it("rejects repositories outside configured roots", async () => {
    const root = await makeTempRoot("project-files-root");
    const outside = await makeTempRoot("project-files-outside");
    await writeText(path.join(outside, "README.md"), "# Outside\n");

    const result = await listProjectFiles({ userDataPath: root }, { repoPath: outside, configuredRoots: [root] });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBe("unsafe-path");
  });

  it("classifies common editable file names and extensions", () => {
    expect(isEditableProjectFile("AGENTS.md")).toBe(true);
    expect(isEditableProjectFile("src/main.ts")).toBe(true);
    expect(isEditableProjectFile(".env")).toBe(true);
    expect(isEditableProjectFile(".env.local")).toBe(true);
    expect(isEditableProjectFile("bad\nname.md")).toBe(false);
    expect(isEditableProjectFile("image.png")).toBe(false);
  });
});
