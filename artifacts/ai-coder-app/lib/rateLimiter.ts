/**
 * Hierarchical Rate Limiter & Hard Timeout Controller
 * Tracks token budgets across User, Agent, and Tool levels,
 * and enforces strict execution timeouts to prevent runaway recursive LLM loops.
 */

export interface TokenBudget {
  maxTokensPerMinute: number;
  maxTokensPerTask: number;
  maxToolCallDurationMs: number;
  maxTaskLoopDurationMs: number;
}

export const DEFAULT_BUDGET: TokenBudget = {
  maxTokensPerMinute: 100_000,
  maxTokensPerTask: 300_000,
  maxToolCallDurationMs: 15_000,
  maxTaskLoopDurationMs: 60_000,
};

export class HierarchicalRateLimiter {
  private budget: TokenBudget;
  private usedTokensMinute = 0;
  private usedTokensTask = 0;
  private windowStart = Date.now();

  constructor(budget?: TokenBudget) {
    this.budget = budget || DEFAULT_BUDGET;
  }

  public checkTokenLimit(requestedTokens: number): { allowed: boolean; reason?: string } {
    const now = Date.now();
    if (now - this.windowStart > 60_000) {
      this.usedTokensMinute = 0;
      this.windowStart = now;
    }

    if (this.usedTokensMinute + requestedTokens > this.budget.maxTokensPerMinute) {
      return { allowed: false, reason: `User minute token limit exceeded (${this.budget.maxTokensPerMinute} tokens/min)` };
    }

    if (this.usedTokensTask + requestedTokens > this.budget.maxTokensPerTask) {
      return { allowed: false, reason: `Task token budget exceeded (${this.budget.maxTokensPerTask} tokens/task)` };
    }

    this.usedTokensMinute += requestedTokens;
    this.usedTokensTask += requestedTokens;

    return { allowed: true };
  }

  public async executeWithTimeout<T>(
    taskFn: () => Promise<T>,
    timeoutMs: number = this.budget.maxToolCallDurationMs
  ): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Execution timed out after ${timeoutMs}ms (Hard Timeout Triggered).`));
      }, timeoutMs);

      taskFn()
        .then(result => {
          clearTimeout(timer);
          resolve(result);
        })
        .catch(err => {
          clearTimeout(timer);
          reject(err);
        });
    });
  }

  public resetTaskBudget() {
    this.usedTokensTask = 0;
  }
}
