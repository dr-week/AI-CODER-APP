# ⚡ Velocity (AI-CODER-APP)

An autonomous, cross-platform AI app builder utilizing a strict backend-first generation pipeline, Stateless MCP (July 2026 Spec), bi-directional visual canvas, real-time price estimation, and self-healing reasoning.

Created & Maintained by **Dishan Naik**.

---

## 📸 Interface Preview

![Velocity Interface Preview](file:///C:/Users/lezand/.gemini/antigravity/brain/a01f7702-a7df-4bd7-91e0-a0df88c3778c/.user_uploaded/media__1785664908359.png)

---

## 🔥 What Makes Us Different?

Unlike black-box cloud code generators, Velocity gives developers **total control, transparent telemetry, and zero vendor lock-in**:

1. **🔒 100% Privacy & Zero Relay Server:** Your API keys and source code are stored exclusively on your device. Direct client-to-LLM requests.
2. **💵 Real-Time Price & Token Estimator:** Instant cost calculation for Groq, Gemini, OpenRouter, OpenAI, and Anthropic before executing prompts.
3. **🔌 Stateless Model Context Protocol (July 2026 Spec):** Multi Round-Trip Requests (MRTR) with header-based routing (`X-MCP-Spec-Version: 2026-07-01`) for scalable tool execution.
4. **🎯 Bi-Directional Visual Canvas (Click-to-Edit):** Click any rendered preview element to isolate its source code line and send targeted diff patches.
5. **⚡ Token Optimization (85% Savings):** Progressive Disclosure Skills Router, AST Context Pruner, and High-Density Shorthands (`[BFA]`, `[TPE]`, `[ZCC]`).
6. **📱 Hybrid Environment Abstraction (Android & Desktop):** Run natively on PC or compilation-ready for the **Indus Appstore** (`com.drweek.velocity`).
7. **🔄 Self-Healing Loop & Evaluator-Optimizer:** Automatically refactors code on compiler errors (up to 3 retries) with Intelligent Human Handoff.
8. **🗄️ Auto-Provisioned Backend & Deploy Pipeline:** Auto-generates Supabase database clients (`lib/supabase.ts`), SQL schemas (`schema.sql`), and deployment scripts (`vercel.json`, `.github/workflows/ci.yml`).

---

## 🏗️ Core Architecture (The Fixed Framework)

To prevent scope creep and hallucination, Velocity enforces a rigid technology stack:

* **Framework:** Next.js (App Router) / Vue 3 + Vite / React Native / Capacitor.
* **Language:** TypeScript (Strict Mode).
* **Styling:** Tailwind CSS.
* **UI Engine:** Shadcn/ui, DaisyUI & Vue 3 Pinia (Reusable, accessible component tokens).
* **State Management:** Zustand / Pinia / React Context.

---

## ⚙️ 3-Phase Generation Pipeline

The AI agent operates in strict, sequential phases:

```mermaid
graph TD
    A[User Prompt] --> B[Procedure & Directory Selection]
    B --> C[Phase 1: Data Architecture & Backend Schemas]
    C --> D[Phase 2: Core Logic & State Wiring]
    D --> E[Phase 3: UI Polish & Theme Tokens]
    E --> F[Self-Healing Validation Loop]
    F -->|Success| G[Live WebContainer Preview & Deploy]
    F -->|Compiler Error| H[Auto-Refactor Retry 1..3]
    H --> F
```

1. **Phase 1: Backend & Data Architecture (Backend-First)**
   - Define data models, schemas, and state management stores first.
2. **Phase 2: Core Logic Integration**
   - Wire state management to basic HTML/JSX scaffolds to validate business logic.
3. **Phase 3: UI Polish & Component Assembly**
   - Assemble UI pages by reusing pre-made Theme Pack component blocks from `@/components/ui/`.

---

## 🛡️ Enterprise Operational Guardrails

* **Hierarchical Rate Limiting (`lib/rateLimiter.ts`):** Token budget tracking per minute (100k tokens/min) and hard execution timeouts (15s tool calls, 60s task loops).
* **Network Egress Domain Filter (`lib/networkEgressFilter.ts`):** Default-deny security allowlist blocking unauthorized outbound traffic.
* **Automated E2E Integration Testing (`lib/runtimeTestRunner.ts`):** Executes runtime assertions inside the sandbox before deployment pipeline is allowed to run.

---

## 📊 Telemetry & Observability

The Settings panel includes a real-time **Stats & Telemetry Dashboard**:

* **Token Consumption**: Input/Output token counter against provider rate limits.
* **Est. Session Cost**: Dollar cost calculator ($0.00 for Groq/Gemini/OpenRouter free tiers).
* **Active Target Directory**: Current target build folder (`src/app` / `artifacts/`).
* **Active Theme Engine**: Live color palette (Violet, Ember, Ocean).

---

## 🚀 Strategy & Features Checklist

- [x] **Stateless MCP (July 2026 MRTR Spec):** Header-based routing for load-balanced tool execution.
- [x] **Orchestrator-Worker Parallelization:** Multi-agent parallel task execution (`Promise.all()`).
- [x] **Live WebContainer Sandbox Preview:** Live render preview with zero-latency HMR in browser.
- [x] **Self-Healing Loop & Human Handoff:** Retries refactoring up to 3 times on compiler errors; hands off to developer if score < 80%.
- [x] **Bi-Directional Visual Canvas:** Live preview click-to-edit DOM AST line mapping.
- [x] **Database Auto-Provisioning:** Auto-scaffolds Supabase connection clients & relational schemas.
- [x] **One-Click Deploy & GitHub Sync:** Ships `vercel.json` and `.github/workflows/ci.yml`.
- [x] **Local Zero-Cost AI Execution:** Run refactoring loops through local Ollama (`qwen2.5-coder:7b` / `llama3.2`).
- [x] **Android Capacitor Abstraction Layer:** Native build target (`com.drweek.velocity`) for the **Indus Appstore**.

---

## 📊 Technical Benchmarking & Distribution

* Detailed performance and token cost benchmarks are published in [BENCHMARK.md](BENCHMARK.md).
* Open-source distribution & Indus Appstore release checklists are detailed in [DISTRIBUTION.md](DISTRIBUTION.md).

---

## 🦙 Local Ollama & E2B Setup

To run Velocity with 100% free local models:

1. **Start Ollama Local Server:**
   ```bash
   ollama run qwen2.5-coder:7b
   ```
2. **Provision E2B Cloud Sandbox (Optional for heavy native builds):**
   ```bash
   bash scripts/provision-e2b-sandbox.sh
   ```

---

## 💡 Best Practices

1. **Keep Prompts Actionable:** Specify what app features you want built (e.g. *"Build a habit tracker with Supabase data storage"*).
2. **Use Free Tier Providers First:** Start with **Groq** or **Gemini** for instant, zero-cost generation.
3. **Isolate Local Secrets:** Keep local API keys in `lib/localKeys.secrets.ts` (gitignored). Never commit keys to public branches.

---

## 🛠️ How to Contribute

Contributions are welcome! Follow these steps to set up your environment:

1. **Fork & Clone Repository:**
   ```bash
   git clone https://github.com/your-username/velocity.git
   cd velocity
   ```

2. **Install Dependencies:**
   ```bash
   pnpm install
   ```

3. **Run Typecheck & Test Suite:**
   ```bash
   pnpm run typecheck
   pnpm test
   ```

4. **Start Development Server:**
   ```bash
   pnpm run dev
   ```

5. **Submit a Pull Request:**
   - Ensure all changes pass `pnpm run typecheck` and `pnpm test` with 0 errors (30/30 tests passing).
   - Use standard PR templates provided in `.github/PULL_REQUEST_TEMPLATE.md`.

---

## 👤 Author & Maintainer

**Dishan Naik**  
*Lead Developer & AI Architect*  
- GitHub: [@dishannaik](https://github.com/dishannaik)

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.