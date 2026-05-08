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
        id: "root:dev",
        label: "dev: vite --host 127.0.0.1",
        command: "npm run dev",
        script: "vite --host 127.0.0.1",
        cwd: repo,
      },
    ]);
  });

  it("discovers root dev:* scripts with script-key labels", async () => {
    const repo = await makeTempRoot("dev-service-root-scripts");
    await writeJson(path.join(repo, "package.json"), {
      scripts: {
        "dev:server": "pnpm --filter @itsmy-life/server dev",
        "dev:web": "pnpm --filter @itsmy-life/web dev",
      },
    });
    await fs.writeFile(path.join(repo, "pnpm-lock.yaml"), "");

    await expect(discoverProjectDevServices(repo)).resolves.toEqual([
      {
        id: "root:dev:server",
        label: "dev:server",
        command: "pnpm dev:server",
        script: "pnpm --filter @itsmy-life/server dev",
        cwd: repo,
      },
      {
        id: "root:dev:web",
        label: "dev:web",
        command: "pnpm dev:web",
        script: "pnpm --filter @itsmy-life/web dev",
        cwd: repo,
      },
    ]);
  });

  it("discovers direct child dev scripts with command labels", async () => {
    const repo = await makeTempRoot("dev-service-children");
    const site = path.join(repo, "ai-girlfriend-site");
    const api = path.join(repo, "interaction-api");
    await fs.mkdir(site, { recursive: true });
    await fs.mkdir(api, { recursive: true });
    await writeJson(path.join(site, "package.json"), {
      scripts: { dev: "next dev" },
    });
    await writeJson(path.join(api, "package.json"), {
      scripts: { dev: "node src/server.js" },
    });

    await expect(discoverProjectDevServices(repo)).resolves.toEqual([
      {
        id: "ai-girlfriend-site:dev",
        label: "dev: next dev",
        command: "npm run dev",
        script: "next dev",
        cwd: site,
      },
      {
        id: "interaction-api:dev",
        label: "dev: node src/server.js",
        command: "npm run dev",
        script: "node src/server.js",
        cwd: api,
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
