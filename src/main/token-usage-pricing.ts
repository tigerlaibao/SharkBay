export type ModelPricing = {
  pattern: string;
  inputPerMtok: number;
  outputPerMtok: number;
  cacheCreationPerMtok: number | null;
  cacheReadPerMtok: number | null;
};

export const DEFAULT_PRICING: ModelPricing[] = [
  { pattern: "claude-opus-4%", inputPerMtok: 15, outputPerMtok: 75, cacheCreationPerMtok: 18.75, cacheReadPerMtok: 1.50 },
  { pattern: "claude-sonnet-4%", inputPerMtok: 3, outputPerMtok: 15, cacheCreationPerMtok: 3.75, cacheReadPerMtok: 0.30 },
  { pattern: "claude-haiku-4%", inputPerMtok: 0.80, outputPerMtok: 4, cacheCreationPerMtok: 1.0, cacheReadPerMtok: 0.08 },
  { pattern: "claude-3-5-sonnet%", inputPerMtok: 3, outputPerMtok: 15, cacheCreationPerMtok: 3.75, cacheReadPerMtok: 0.30 },
  { pattern: "claude-3-5-haiku%", inputPerMtok: 0.80, outputPerMtok: 4, cacheCreationPerMtok: 1.0, cacheReadPerMtok: 0.08 },
  { pattern: "gpt-4.1%", inputPerMtok: 2, outputPerMtok: 8, cacheCreationPerMtok: null, cacheReadPerMtok: 0.50 },
  { pattern: "gpt-4.1-mini%", inputPerMtok: 0.40, outputPerMtok: 1.60, cacheCreationPerMtok: null, cacheReadPerMtok: 0.10 },
  { pattern: "o3%", inputPerMtok: 2, outputPerMtok: 8, cacheCreationPerMtok: null, cacheReadPerMtok: 0.50 },
  { pattern: "o4-mini%", inputPerMtok: 1.10, outputPerMtok: 4.40, cacheCreationPerMtok: null, cacheReadPerMtok: 0.275 },
];

export function computeCostUsd(
  model: string | null,
  inputTokens: number,
  outputTokens: number,
  cacheCreationTokens: number,
  cacheReadTokens: number,
  pricing: ModelPricing[]
): number | null {
  if (!model) return null;
  const match = pricing.find((p) => globMatch(model, p.pattern));
  if (!match) return null;

  let cost = (inputTokens / 1_000_000) * match.inputPerMtok
    + (outputTokens / 1_000_000) * match.outputPerMtok;

  if (match.cacheCreationPerMtok != null && cacheCreationTokens > 0) {
    cost += (cacheCreationTokens / 1_000_000) * match.cacheCreationPerMtok;
  }
  if (match.cacheReadPerMtok != null && cacheReadTokens > 0) {
    cost += (cacheReadTokens / 1_000_000) * match.cacheReadPerMtok;
  }

  return Math.round(cost * 1_000_000) / 1_000_000;
}

function globMatch(value: string, pattern: string): boolean {
  const escaped = pattern.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/%/g, ".*");
  return new RegExp(`^${escaped}$`).test(value);
}
