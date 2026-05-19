import { promises as fs } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { generateKnowledgeSite } from "../src/main/knowledge-site.js";
import { makeTempRoot, writeText } from "./helpers.js";

describe("knowledge site generation", () => {
  it("generates nested docs without losing relative navigation", async () => {
    const root = await makeTempRoot("knowledge-site");
    const repo = path.join(root, "repo");
    await writeText(path.join(repo, "README.md"), "# Fixture\n");
    await writeText(path.join(repo, "docs", "design", "overview.md"), "# Overview\n");
    await writeText(path.join(repo, "docs", "design", "narrative-engine", "engine.md"), "# Engine\n");
    await writeText(path.join(repo, "docs", "launch_reviews", "code_reviews", "001.md"), "# API Review\n");

    const result = await generateKnowledgeSite(repo);

    expect(result.generated).toBe(true);
    await expect(fs.stat(path.join(repo, ".sharkbay", "site", ".content-hash"))).resolves.toBeTruthy();
    await expect(fs.readFile(path.join(repo, ".sharkbay", "site", "index.html"), "utf8"))
      .resolves.not.toContain('href="docs/design/index.html"');
    await expect(fs.readFile(path.join(repo, ".sharkbay", "site", "docs", "index.html"), "utf8"))
      .resolves.toContain('class="docs-section-row" href="design/index.html"');
    await expect(fs.readFile(path.join(repo, ".sharkbay", "site", "docs", "design", "narrative-engine", "engine.html"), "utf8"))
      .resolves.toContain('href="../../../index.html"');
    await expect(fs.readFile(path.join(repo, ".sharkbay", "site", "docs", "design", "index.html"), "utf8"))
      .resolves.toContain('href="narrative-engine/engine.html"');
    await expect(fs.readFile(path.join(repo, ".sharkbay", "site", "docs", "launch_reviews", "code_reviews", "001.html"), "utf8"))
      .resolves.toContain("API Review");
  });
});
