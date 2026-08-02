/**
 * Ollama Local AI Execution Adapter
 * Routes heavy Implementor & Evaluator loops to zero-cost local Ollama models (llama3.2 / qwen2.5-coder),
 * cutting API token expenditure during iterative self-healing loops.
 */

export interface OllamaRequest {
  model: string;
  messages: { role: string; content: string }[];
  stream?: boolean;
}

export function formatOllamaLocalRequest(
  promptText: string,
  systemPrompt: string,
  modelName = 'qwen2.5-coder:7b'
): { url: string; body: OllamaRequest } {
  return {
    url: 'http://localhost:11434/api/chat',
    body: {
      model: modelName,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: promptText },
      ],
      stream: false,
    },
  };
}
