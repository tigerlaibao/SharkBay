import { describe, expect, it } from "vitest";
import viteConfig from "../vite.config.js";

describe("build config", () => {
  it("uses relative renderer asset paths for packaged file URLs", () => {
    expect(viteConfig).toEqual(expect.objectContaining({ base: "./" }));
  });
});
