import { describe, expect, it } from "vitest";
import { toUsageGroupRow } from "../src/main/token-usage-db.js";

describe("token usage db", () => {
  it("maps SQL usage report rows to renderer-facing camelCase fields", () => {
    const row = toUsageGroupRow({
      key: "/tmp/example-project",
      input_tokens: 1200,
      output_tokens: 340,
      cache_read_tokens: 56,
    });

    expect(row).toEqual({
      key: "/tmp/example-project",
      inputTokens: 1200,
      outputTokens: 340,
      cacheReadTokens: 56,
      costUsd: null,
    });
    expect(row).not.toHaveProperty("input_tokens");
  });
});
