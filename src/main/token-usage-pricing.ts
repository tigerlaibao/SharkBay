export type ModelPricing = {
  pattern: string;
  inputPerMtok: number;
  outputPerMtok: number;
  cacheCreationPerMtok: number | null;
  cacheReadPerMtok: number | null;
};

export const DEFAULT_PRICING: ModelPricing[] = [];
