/**
 * GitHub Repository Template Scaffolder
 * Generates standard GitHub repository files (.github/workflows/ci.yml, LICENSE, .gitignore, README.md)
 * for generated apps to make them instantly GitHub-ready!
 */

export function scaffoldGitHubRepoFiles(projectName: string, description: string) {
  const slug = projectName.toLowerCase().replace(/[^a-z0-9]/g, '-');
  return {
    '.github/workflows/ci.yml': `name: CI Pipeline

on:
  push:
    branches: [ main, master ]
  pull_request:
    branches: [ main, master ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm install
      - run: npm run build --if-present
`,
    '.gitignore': `# Dependencies
node_modules/
.pnpm-store/

# Production Build
dist/
.next/
out/
build/

# Local Secrets & Environment
.env
.env.local
*.secrets.ts

# Logs & System
*.log
.DS_Store
Thumbs.db
`,
    'LICENSE': `MIT License

Copyright (c) ${new Date().getFullYear()} ${projectName}

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
`,
    'README.md': `# ${projectName}

${description || 'An autonomous web app generated with Velocity.'}

## 🚀 Quick Start

\`\`\`bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
\`\`\`

## 🛠️ Stack & Architecture
- **Framework**: React / Next.js / TypeScript
- **Styling**: Tailwind CSS + Theme Engine Tokens
- **Database**: Supabase Client (\`lib/supabase.ts\`)
- **Deployment**: Vercel / Netlify (\`vercel.json\`)
`,
  };
}
