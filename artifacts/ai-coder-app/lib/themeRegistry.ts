/**
 * Component Registry & Theme Pack Engine
 * Manages pre-built modular theme packs, component manifests, and auto-injection.
 */

export interface ThemeComponent {
  key: string;
  category: 'navigation' | 'marketing' | 'data' | 'forms' | 'feedback';
  path: string;
  props: string[];
  code: string;
}

export interface ThemePack {
  id: string;
  name: string;
  version: string;
  framework: string;
  description: string;
  components: ThemeComponent[];
}

export const BUILTIN_THEME_PACKS: ThemePack[] = [
  {
    id: 'glassmorphism-dark',
    name: 'Glassmorphism Dark Pack',
    version: '1.0.0',
    framework: 'nextjs-tailwind',
    description: 'Modern translucent glass cards, neon accents, and sleek blur layers.',
    components: [
      {
        key: 'SidebarNav',
        category: 'navigation',
        path: 'components/ui/SidebarNav.tsx',
        props: ['items', 'activeRoute', 'isCollapsed'],
        code: `import React from 'react';\n\nexport function SidebarNav({ items, activeRoute }: { items: { label: string; href: string }[]; activeRoute?: string }) {\n  return (\n    <nav className="w-64 bg-slate-900/80 backdrop-blur-md border-r border-white/10 p-4">\n      <div className="font-bold text-lg mb-4 text-white">VELOCITY</div>\n      {items.map(i => (\n        <a key={i.href} href={i.href} className={\`block px-3 py-2 rounded-lg text-sm mb-1 \${activeRoute === i.href ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-white/5'}\`}>\n          {i.label}\n        </a>\n      ))}\n    </nav>\n  );\n}\n`,
      },
      {
        key: 'HeroSection',
        category: 'marketing',
        path: 'components/ui/HeroSection.tsx',
        props: ['title', 'subtitle', 'ctaText'],
        code: `import React from 'react';\n\nexport function HeroSection({ title, subtitle, ctaText }: { title: string; subtitle: string; ctaText: string }) {\n  return (\n    <section className="py-16 px-6 text-center bg-gradient-to-b from-indigo-900/30 to-transparent rounded-2xl border border-white/10 my-6">\n      <h1 className="text-4xl font-extrabold text-white mb-3">{title}</h1>\n      <p className="text-slate-300 max-w-lg mx-auto mb-6">{subtitle}</p>\n      <button className="px-6 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-semibold shadow-lg shadow-indigo-500/30 transition">{ctaText}</button>\n    </section>\n  );\n}\n`,
      },
      {
        key: 'StatCard',
        category: 'data',
        path: 'components/ui/StatCard.tsx',
        props: ['label', 'value', 'change', 'trend'],
        code: `import React from 'react';\n\nexport function StatCard({ label, value, change }: { label: string; value: string; change?: string }) {\n  return (\n    <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-lg">\n      <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">{label}</div>\n      <div className="text-2xl font-bold text-white mt-1">{value}</div>\n      {change && <div className="text-xs text-emerald-400 mt-2">↑ {change} this week</div>}\n    </div>\n  );\n}\n`,
      },
    ],
  },
  {
    id: 'shadcn-enterprise',
    name: 'Shadcn Enterprise Pack',
    version: '1.0.0',
    framework: 'nextjs-tailwind',
    description: 'High-contrast accessible dark slate tokens for enterprise dashboards.',
    components: [
      {
        key: 'HeaderV1',
        category: 'navigation',
        path: 'components/ui/HeaderV1.tsx',
        props: ['title', 'userProfile'],
        code: `import React from 'react';\n\nexport function HeaderV1({ title }: { title: string }) {\n  return (\n    <header className="h-16 px-6 border-b border-slate-800 bg-slate-950 flex items-center justify-between">\n      <h2 className="text-slate-100 font-semibold">{title}</h2>\n      <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">USER</div>\n    </header>\n  );\n}\n`,
      },
      {
        key: 'FormCard',
        category: 'forms',
        path: 'components/ui/FormCard.tsx',
        props: ['title', 'fields', 'onSubmit'],
        code: `import React from 'react';\n\nexport function FormCard({ title, fields }: { title: string; fields: string[] }) {\n  return (\n    <form className="p-6 rounded-lg bg-slate-900 border border-slate-800 gap-4 flex flex-col">\n      <h3 className="text-lg font-bold text-slate-100">{title}</h3>\n      {fields.map(f => (\n        <input key={f} placeholder={f} className="px-4 py-2.5 rounded-md bg-slate-950 border border-slate-800 text-sm text-slate-200 focus:outline-none focus:border-blue-500" />\n      ))}\n      <button type="submit" className="py-2.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm">Submit</button>\n    </form>\n  );\n}\n`,
      },
    ],
  },
  {
    id: 'daisyui-cyberpunk',
    name: 'DaisyUI Cyberpunk Pack',
    version: '1.0.0',
    framework: 'vite-tailwind',
    description: 'Vibrant cyberpunk neon yellow and cyan high-octane UI elements.',
    components: [
      {
        key: 'MetricGrid',
        category: 'data',
        path: 'components/ui/MetricGrid.tsx',
        props: ['metrics'],
        code: `import React from 'react';\n\nexport function MetricGrid({ metrics }: { metrics: { title: string; val: string }[] }) {\n  return (\n    <div className="grid grid-cols-2 gap-4 my-4">\n      {metrics.map(m => (\n        <div key={m.title} className="p-4 bg-yellow-400/10 border-2 border-yellow-400 text-yellow-300 font-mono rounded-none">\n          <div className="text-xs uppercase">{m.title}</div>\n          <div className="text-3xl font-extrabold">{m.val}</div>\n        </div>\n      ))}\n    </div>\n  );\n}\n`,
      },
    ],
  },
  {
    id: 'vue-pinia-tailwind',
    name: 'Vue 3 + Pinia + Tailwind Pack',
    version: '1.0.0',
    framework: 'vue3-vite',
    description: 'Clean reactive Vue 3 components with Pinia store integrations.',
    components: [
      {
        key: 'VueHeaderNav',
        category: 'navigation',
        path: 'components/ui/VueHeaderNav.vue',
        props: ['title', 'navItems'],
        code: `<template>\n  <header className="h-16 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between text-white">\n    <div className="font-bold text-lg">{{ title }}</div>\n    <nav className="flex gap-4">\n      <a v-for="item in navItems" :key="item.href" :href="item.href" className="text-sm text-slate-300 hover:text-white">{{ item.label }}</a>\n    </nav>\n  </header>\n</template>\n<script setup>\ndefineProps(['title', 'navItems']);\n</script>`,
      },
      {
        key: 'VueStatTile',
        category: 'data',
        path: 'components/ui/VueStatTile.vue',
        props: ['label', 'val'],
        code: `<template>\n  <div className="p-4 rounded-xl bg-slate-800 border border-slate-700 text-white">\n    <div className="text-xs text-slate-400 font-medium">{{ label }}</div>\n    <div className="text-2xl font-bold mt-1">{{ val }}</div>\n  </div>\n</template>\n<script setup>\ndefineProps(['label', 'val']);\n</script>`,
      },
    ],
  },
];

export function getThemePack(id: string): ThemePack {
  return BUILTIN_THEME_PACKS.find(p => p.id === id) || BUILTIN_THEME_PACKS[0];
}

/**
 * Injects active theme pack component manifest into system prompt instructions.
 */
export function buildThemePromptManifest(packId = 'glassmorphism-dark'): string {
  const pack = getThemePack(packId);
  const componentList = pack.components
    .map(c => `- <${c.key} /> (${c.category}) -> props: [${c.props.join(', ')}]`)
    .join('\n');

  return `
ACTIVE THEME PACK REGISTRY: "${pack.name}"
DO NOT write raw 500-line CSS if a pre-made component exists.

AVAILABLE PRE-MADE COMPONENT BLOCKS (Import from '@/components/ui/'):
${componentList}
`.trim();
}

/**
 * Injects actual source code files of theme components into generated app files bundle.
 */
export function injectThemeComponentFiles(files: Record<string, string>, packId = 'glassmorphism-dark') {
  const pack = getThemePack(packId);
  for (const comp of pack.components) {
    if (!files[comp.path]) {
      files[comp.path] = comp.code;
    }
  }
}
