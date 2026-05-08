import { promises as fs } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { devCommandForProject, discoverProjectDevServices } from "../src/main/dev-services.js";
import { makeTempRoot, writeJson } from "./helpers.js";

describe("project dev service discovery", () => {
  it("discovers a root package.json dev script", async () => {
    const repo = await makeTempRoot("dev-service");
    await writeJson(path.join(repo, "package.json"), {
      scripts: {
        dev: "vite --host 127.0.0.1",
      },
    });

    await expect(discoverProjectDevServices(repo)).resolves.toEqual([
      {
        id: "dev",
        label: "dev",
        command: "npm run dev",
        script: "vite --host 127.0.0.1",
      },
    ]);
  });

  it("uses package manager metadata and lockfiles for the dev command", async () => {
    const pnpmRepo = await makeTempRoot("dev-service-pnpm");
    await writeJson(path.join(pnpmRepo, "package.json"), { packageManager: "pnpm@9.0.0" });
    await expect(devCommandForProject(pnpmRepo, { packageManager: "pnpm@9.0.0" })).resolves.toBe("pnpm dev");

    const yarnRepo = await makeTempRoot("dev-service-yarn");
    await fs.writeFile(path.join(yarnRepo, "yarn.lock"), "");
    await expect(devCommandForProject(yarnRepo, {})).resolves.toBe("yarn dev");

    const bunRepo = await makeTempRoot("dev-service-bun");
    await fs.writeFile(path.join(bunRepo, "bun.lockb"), "");
    await expect(devCommandForProject(bunRepo, {})).resolves.toBe("bun run dev");
  });
});
