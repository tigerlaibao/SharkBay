import { describe, expect, it } from "vitest";
import { parseGitDirtyFiles } from "../src/main/git.js";

describe("git status parsing", () => {
  it("returns compact dirty file rows from porcelain output", () => {
    expect(parseGitDirtyFiles(" M src/App.tsx\nA  docs/new.md\n?? .env\nR  old.ts -> src/new.ts\n")).toEqual([
      { path: "src/App.tsx", status: "M", staged: " ", unstaged: "M" },
      { path: "docs/new.md", status: "A", staged: "A", unstaged: " " },
      { path: ".env", status: "??", staged: "?", unstaged: "?" },
      { path: "src/new.ts", status: "R", staged: "R", unstaged: " " },
    ]);
  });
});
