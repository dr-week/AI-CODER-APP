# Velocity

Velocity is an Expo-based mobile AI coding workspace for generating, importing, and browsing small web projects directly on a device.

## What it does

- Generate a project from a short description using your own AI provider
- Use Groq's low-cost `llama-3.1-8b-instant` model by default
- Use Ollama for a local, zero-cost provider
- Save generated files locally under the app's document storage
- Browse real saved files in the built-in code editor
- Import public GitHub repositories by URL
- Skip large binary files during repository imports
- Preview deployed websites or local-network development servers in a WebView
- Keep API keys, project metadata, and preview URLs on the device

## Project layout

```text
artifacts/ai-coder-app/
├── app/                 # Expo Router screens
│   ├── (tabs)/          # Home, Projects, and Settings
│   ├── editor.tsx       # Local file browser and code viewer
│   └── preview.tsx      # Deployed/LAN website viewer
├── lib/
│   ├── githubImport.ts  # Public GitHub repository importer
│   ├── generatePrompt.ts
│   ├── saveProject.ts   # Local filesystem and metadata persistence
│   └── useGenerate.ts   # Direct provider requests
└── assets/images/       # App icon and splash artwork
```

## Run locally

This repository is a pnpm workspace. From the repository root:

```bash
pnpm install
pnpm --filter @workspace/ai-coder-app run dev
```

Then scan the Expo QR code with Expo Go, or press `w` to open the web preview.

Type-check the mobile app with:

```bash
pnpm --filter @workspace/ai-coder-app run typecheck
```

## Configure an AI provider

Open **Settings** in the app and choose a provider:

| Provider | Configuration |
| --- | --- |
| Groq | Paste a Groq API key. Uses `llama-3.1-8b-instant`. |
| OpenAI | Paste an OpenAI API key. |
| Anthropic | Provider option retained for compatibility. |
| Ollama | Enter the reachable Ollama base URL, such as `http://192.168.1.20:11434`. |

Credentials are stored locally in the app. The app sends generation requests directly to the selected provider; there is no project relay server.

## Import a GitHub project

1. Open the **Projects** tab.
2. Paste a public repository URL, for example:

   ```text
   https://github.com/ntegrals/december
   ```

3. Tap **Import**.
4. Open the imported project to browse its source files.

Imports are limited to readable source files up to 1 MB each and skip common binary assets. Nested directories are preserved in local storage.

## Live previews

Open a project's monitor icon to use **Live Preview**. The viewer accepts:

- A deployed URL such as GitHub Pages, Vercel, or Netlify
- A local development server reachable from the phone, such as `http://192.168.1.20:3000`

The phone and development computer must be on the same Wi-Fi network for LAN previews. Preview URLs are saved per project.

## Privacy

Generated projects, imported source files, provider settings, and preview URLs are kept locally on the device. Do not commit API keys or other credentials to this repository.

## License

This project is a personal/open-source mobile workspace built with Expo and React Native.