import { describe, expect, it } from "vitest";
import { CodeGraphManager } from "../src/core/codegraph-manager.js";
import { toLocalProjectUri } from "../src/core/project-uri.js";

describe("CodeGraphManager", () => {
  it("reads status without initializing an enabled local project", async () => {
    const calls: string[][] = [];
    const manager = new CodeGraphManager(
      async () => "/usr/local/bin/codegraph",
      async (_command, args) => {
        calls.push(args);
        return { stdout: JSON.stringify({ initialized: false }), stderr: "" };
      },
    );

    const result = await manager.readProjectStatus(toLocalProjectUri("/tmp/sharkbay-codegraph-project"), true);

    expect(result.state).toBe("uninitialized");
    expect(result.summary).toBe("CodeGraph not initialized");
    expect(calls.map((args) => args[0])).toEqual(["status"]);
  });

  it("initializes and syncs an enabled local project when ensuring status", async () => {
    let initialized = false;
    let synced = false;
    const calls: string[][] = [];
    const manager = new CodeGraphManager(
      async () => "/usr/local/bin/codegraph",
      async (_command, args) => {
        calls.push(args);
        if (args[0] === "status") {
          return {
            stdout: JSON.stringify({
              initialized,
              fileCount: initialized ? 2 : 0,
              nodeCount: initialized ? 12 : 0,
              edgeCount: initialized ? 18 : 0,
              pendingChanges: initialized && !synced ? { added: 0, modified: 1, removed: 0 } : { added: 0, modified: 0, removed: 0 },
            }),
            stderr: "",
          };
        }
        if (args[0] === "init") {
          initialized = true;
          return { stdout: "", stderr: "" };
        }
        if (args[0] === "sync") {
          synced = true;
          return { stdout: "", stderr: "" };
        }
        throw new Error(`Unexpected command: ${args.join(" ")}`);
      },
    );

    const result = await manager.ensureProjectStatus(toLocalProjectUri("/tmp/sharkbay-codegraph-project"), true);

    expect(result.state).toBe("indexed");
    expect(result.stats).toMatchObject({ files: 2, nodes: 12, edges: 18 });
    expect(calls.map((args) => args[0])).toEqual(["status", "init", "status", "sync", "status"]);
  });

  it("reports not installed without running project commands", async () => {
    const manager = new CodeGraphManager(
      async () => null,
      async () => {
        throw new Error("Should not run CodeGraph without a CLI path");
      },
    );

    const result = await manager.readProjectStatus(toLocalProjectUri("/tmp/sharkbay-codegraph-project"), true);

    expect(result.state).toBe("not-installed");
    expect(result.summary).toBe("CodeGraph CLI not installed");
  });
});
