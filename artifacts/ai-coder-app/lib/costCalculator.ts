/**
 * Real-Time AI Model Cost & Token Estimator
 * Calculates exact token counts and estimated generation costs based on provider rates.
 */

export type ProviderPricing = {
  provider: string;
  model: string;
  inputPerMillion: number;
  outputPerMillion: number;
  isFreeTier: boolean;
};

export const PROVIDER_PRICING: Record<string, ProviderPricing> = {
  'llama-3.1-8b-instant': {
    provider: 'Groq',
    model: 'llama-3.1-8b-instant',
    inputPerMillion: 0.05,
    outputPerMillion: 0.08,
    isFreeTier: true,
  },
  'gemini-1.5-flash': {
    provider: 'Gemini',
    model: 'gemini-1.5-flash',
    inputPerMillion: 0.075,
    outputPerMillion: 0.30,
    isFreeTier: true,
  },
  'openrouter-llama-3.1-8b': {
    provider: 'OpenRouter',
    model: 'llama-3.1-8b-free',
    inputPerMillion: 0,
    outputPerMillion: 0,
    isFreeTier: true,
  },
  'gpt-4o-mini': {
    provider: 'OpenAI',
    model: 'gpt-4o-mini',
    inputPerMillion: 0.15,
    outputPerMillion: 0.60,
    isFreeTier: false,
  },
  'claude-haiku-3-5': {
    provider: 'Anthropic',
    model: 'claude-3-5-haiku',
    inputPerMillion: 0.80,
    outputPerMillion: 4.00,
    isFreeTier: false,
  },
};

/**
 * Estimates generation cost based on prompt string length and generated file count.
 */
export function estimateGenerationCost(modelId: string, promptText: string, generatedFilesCount = 4) {
  const pricing = PROVIDER_PRICING[modelId] || PROVIDER_PRICING['llama-3.1-8b-instant'];

  // Approx 1 token ~ 4 characters
  const estInputTokens = Math.max(500, Math.ceil(promptText.length / 4) + 600); // include system prompt overhead
  const estOutputTokens = Math.max(1200, generatedFilesCount * 450);

  const inputCost = (estInputTokens / 1_000_000) * pricing.inputPerMillion;
  const outputCost = (estOutputTokens / 1_000_000) * pricing.outputPerMillion;
  const totalCost = inputCost + outputCost;

  return {
    model: pricing.model,
    provider: pricing.provider,
    inputTokens: estInputTokens,
    outputTokens: estOutputTokens,
    totalTokens: estInputTokens + estOutputTokens,
    estimatedCostFormatted: pricing.isFreeTier || totalCost === 0
      ? '$0.00 (Free Tier)'
      : `$${totalCost.toFixed(5)}`,
    isFreeTier: pricing.isFreeTier,
  };
}
