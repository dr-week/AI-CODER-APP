/**
 * Local Q&A database — no API, no AI model.
 * Uses keyword matching to find the best answer.
 */

export type QAEntry = {
  id: string;
  keywords: string[];
  question: string; // canonical form shown as suggestion
  answer: string;
};

export const QA_DATABASE: QAEntry[] = [
  // ── App basics ──────────────────────────────────────────────────────────────
  {
    id: 'what-is-app',
    keywords: ['what', 'is', 'app', 'velocity', 'coder', 'tool', 'this', 'about', 'do'],
    question: 'What is this app?',
    answer:
      'Velocity AI Coder is a mobile-first tool that lets you describe an app idea in plain English, generate working code with AI, and preview or export it — all from your phone. Your API keys stay on your device and are never sent to a relay server.',
  },
  {
    id: 'how-generate',
    keywords: ['how', 'generate', 'create', 'build', 'make', 'code', 'start', 'new', 'project'],
    question: 'How do I generate an app?',
    answer:
      'Go to the Build tab, type a description of what you want to build in the text box (e.g. "a to-do list with dark mode"), then tap the send button. The AI will generate files for your project and take you straight to the editor.',
  },
  {
    id: 'api-key',
    keywords: ['api', 'key', 'openai', 'gemini', 'anthropic', 'claude', 'gpt', 'token', 'secret', 'settings'],
    question: 'How do I set my API key?',
    answer:
      'Open the Settings tab and paste your API key into the field at the top. Your key is stored locally with AsyncStorage — it never leaves your device. You can use OpenAI, Gemini, or Anthropic keys depending on the model you select.',
  },
  {
    id: 'models',
    keywords: ['model', 'gpt', 'gemini', 'claude', 'openai', 'anthropic', 'choose', 'switch', 'which'],
    question: 'Which AI models are supported?',
    answer:
      'The app supports GPT-4o / GPT-4o-mini (OpenAI), Gemini 1.5 Flash / Pro (Google), and Claude 3 Haiku / Sonnet (Anthropic). Switch between them in the Settings tab under "Model".',
  },
  {
    id: 'projects-tab',
    keywords: ['projects', 'saved', 'find', 'where', 'list', 'history', 'previous', 'old'],
    question: 'Where are my saved projects?',
    answer:
      'All generated projects appear in the Projects tab. Tap any project card to open it in the editor. Projects are stored locally on your device in the app\'s document directory.',
  },
  {
    id: 'editor',
    keywords: ['editor', 'edit', 'change', 'modify', 'file', 'code', 'view', 'open'],
    question: 'How does the code editor work?',
    answer:
      'The Editor screen shows all files in your project. Tap a file to view its contents. You can request AI changes by typing in the prompt bar at the bottom — the AI rewrites only the file you have open.',
  },
  {
    id: 'preview',
    keywords: ['preview', 'run', 'see', 'live', 'browser', 'webview', 'url', 'open'],
    question: 'How do I preview my project?',
    answer:
      'From the editor, tap the eye (Preview) button. In the preview screen you can paste a deployed URL or a local network URL (e.g. http://192.168.1.x:3000) to load your running app inside a WebView.',
  },
  {
    id: 'import-github',
    keywords: ['import', 'github', 'repo', 'repository', 'existing', 'load', 'from'],
    question: 'Can I import a GitHub repository?',
    answer:
      'Yes! On the Build tab tap "Import from GitHub" and paste a public GitHub URL. The app fetches up to 80 source files (skipping images and binaries) and loads them into a new project you can then edit with AI.',
  },
  {
    id: 'offline',
    keywords: ['offline', 'internet', 'connection', 'network', 'without', 'data'],
    question: 'Does the app work offline?',
    answer:
      'The editor and project browser work fully offline. You only need an internet connection when generating new code with AI or importing a GitHub repository. All your saved projects are always available locally.',
  },
  {
    id: 'delete-project',
    keywords: ['delete', 'remove', 'clear', 'erase', 'project', 'trash'],
    question: 'How do I delete a project?',
    answer:
      'In the Projects tab, long-press a project card or swipe left (on iOS) to reveal the delete option. This removes the project from your list and deletes all its files from device storage.',
  },
  {
    id: 'themes',
    keywords: ['theme', 'color', 'dark', 'light', 'appearance', 'style', 'violet', 'ember', 'ocean', 'look'],
    question: 'Can I change the app theme?',
    answer:
      'Open Settings and scroll to the Appearance section. You can pick from Aurora Violet, Ember Red, and Ocean Blue themes. The theme is saved locally and persists across restarts.',
  },
  {
    id: 'cost',
    keywords: ['cost', 'free', 'price', 'pay', 'money', 'charge', 'bill', 'subscription'],
    question: 'Is the app free? What does it cost?',
    answer:
      'The app itself is free. Costs depend on your AI provider. OpenAI, Gemini, and Anthropic charge per-token based on their pricing. You use your own API key so you are billed directly by the provider — the app has no subscription fee.',
  },
  {
    id: 'privacy',
    keywords: ['privacy', 'data', 'safe', 'secure', 'send', 'store', 'collect', 'personal'],
    question: 'Is my data private?',
    answer:
      'Yes. Your API keys and project files are stored only on your device. The app sends your prompt directly to your chosen AI provider — it does not go through any intermediate server. No telemetry or analytics data is collected.',
  },
  {
    id: 'export',
    keywords: ['export', 'share', 'download', 'zip', 'send', 'save', 'outside'],
    question: 'Can I export my project?',
    answer:
      'You can share individual files via the native share sheet in the editor. A full project ZIP export feature is planned for a future release. In the meantime you can copy file contents and paste them into your local development environment.',
  },
  {
    id: 'error-generation',
    keywords: ['error', 'failed', 'fail', 'broken', 'wrong', 'issue', 'problem', 'generation', 'not working'],
    question: 'Why is code generation failing?',
    answer:
      'Common causes: (1) Missing or invalid API key — check Settings. (2) The AI quota for your account is exhausted. (3) Your prompt was too vague — try adding more detail. (4) Network connection issue. Check the error message shown on the Build screen for specifics.',
  },
  {
    id: 'file-types',
    keywords: ['file', 'type', 'tsx', 'ts', 'js', 'json', 'css', 'html', 'support', 'format'],
    question: 'What file types are generated?',
    answer:
      'By default the AI generates TypeScript/React Native files: index.tsx, package.json, and README.md. You can ask it to generate additional files by including them in your prompt, e.g. "include styles.ts and a utils folder".',
  },
  {
    id: 'help',
    keywords: ['help', 'support', 'guide', 'documentation', 'faq', 'question', 'how'],
    question: 'Where can I get help?',
    answer:
      'You\'re in the right place! This Help chat answers common questions about the app. For bugs or feature requests, check the README.md in your project or open an issue on the GitHub repository.',
  },
  {
    id: 'greeting',
    keywords: ['hi', 'hello', 'hey', 'greet', 'howdy', 'hola', 'namaste', 'good'],
    question: 'Hello!',
    answer:
      'Hey there! 👋 I\'m the Velocity AI Coder help assistant. I can answer questions about using the app — generating projects, managing API keys, the editor, themes, and more. What would you like to know?',
  },
  {
    id: 'thanks',
    keywords: ['thank', 'thanks', 'appreciate', 'great', 'awesome', 'perfect', 'nice'],
    question: 'Thank you!',
    answer: 'You\'re welcome! 😊 Let me know if you have any other questions about the app.',
  },
];

const FALLBACK_ANSWER =
  "I'm not sure about that one. Try asking about: generating projects, API keys, models, the editor, previewing, themes, importing from GitHub, or exporting.";

/** Score an entry by counting how many of the user's words match entry keywords */
function scoreEntry(entry: QAEntry, words: string[]): number {
  let score = 0;
  for (const word of words) {
    if (entry.keywords.some(k => k === word || k.startsWith(word) || word.startsWith(k))) {
      score += 1;
    }
  }
  return score;
}

/** Find the best matching QA entry for a user message */
export function findAnswer(message: string): { answer: string; matched: boolean } {
  const words = message
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 1);

  if (words.length === 0) {
    return { answer: FALLBACK_ANSWER, matched: false };
  }

  let bestScore = 0;
  let bestEntry: QAEntry | null = null;

  for (const entry of QA_DATABASE) {
    const score = scoreEntry(entry, words);
    if (score > bestScore) {
      bestScore = score;
      bestEntry = entry;
    }
  }

  if (bestEntry && bestScore >= 1) {
    return { answer: bestEntry.answer, matched: true };
  }

  return { answer: FALLBACK_ANSWER, matched: false };
}

/** Return a list of suggested questions for the empty state */
export function getSuggestions(): QAEntry[] {
  return QA_DATABASE.filter(e =>
    ['what-is-app', 'how-generate', 'api-key', 'models', 'themes', 'privacy'].includes(e.id),
  );
}
