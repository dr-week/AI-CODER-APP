import { useMemo, useState } from "react";
import {
  Archive,
  ChevronDown,
  ChevronRight,
  Code2,
  Command,
  Copy,
  Download,
  FileCode2,
  FileJson,
  Folder,
  FolderOpen,
  GitBranch,
  Globe2,
  Heart,
  HelpCircle,
  LayoutTemplate,
  Monitor,
  MoreHorizontal,
  Play,
  Plus,
  RefreshCw,
  Search,
  Send,
  Settings2,
  Sparkles,
  Smartphone,
  SquareTerminal,
  Tablet,
  TerminalSquare,
  UserRound,
  WandSparkles,
  X,
} from "lucide-react";

type FileKey = "app.tsx" | "index.css" | "package.json" | "vite.config.ts";
type Device = "desktop" | "tablet" | "mobile";

const fileData: Record<FileKey, { label: string; icon: typeof FileCode2; tone: string; code: string }> = {
  "app.tsx": {
    label: "App.tsx",
    icon: FileCode2,
    tone: "text-sky-500",
    code: `import { useState } from "react";
import { ArrowRight, Check, Circle } from "lucide-react";

const habits = [
  { name: "Morning walk", detail: "20 minutes", done: true },
  { name: "Read ten pages", detail: "Atomic Habits", done: false },
  { name: "Plan tomorrow", detail: "Three priorities", done: false },
];

export default function App() {
  const [complete, setComplete] = useState(habits);

  return (
    <main className="min-h-screen bg-[#f7f8f4] text-[#20302b]">
      <header className="mx-auto flex max-w-3xl items-center justify-between px-8 py-7">
        <span className="text-lg font-semibold tracking-tight">little rituals</span>
        <button className="rounded-full bg-[#d9ead9] px-4 py-2 text-xs font-medium">
          Tuesday, Apr 16
        </button>
      </header>
      <section className="mx-auto max-w-3xl px-8 pt-12">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[.18em] text-[#789184]">
          Your gentle reset
        </p>
        <h1 className="max-w-xl text-5xl font-semibold leading-[1.08] tracking-[-.05em]">
          A few small things,
          <br /> done with care.
        </h1>
        <div className="mt-12 space-y-3">
          {complete.map((habit, index) => (
            <button key={habit.name} onClick={() => setComplete(current =>
              current.map((item, itemIndex) => itemIndex === index
                ? { ...item, done: !item.done } : item)
            )} className="flex w-full items-center gap-4 rounded-2xl border border-[#dfe8df] bg-white/70 p-4 text-left transition hover:border-[#aac3ab]">
              <span className={\`flex h-9 w-9 items-center justify-center rounded-full \${habit.done ? "bg-[#315b48] text-white" : "bg-[#edf3ed] text-[#9ab09d]"}\`}>
                {habit.done ? <Check size={16} /> : <Circle size={16} />}
              </span>
              <span className="flex-1">
                <span className={\`block text-sm font-medium \${habit.done ? "text-[#85948a] line-through" : ""}\`}>{habit.name}</span>
                <span className="mt-1 block text-xs text-[#94a39a]">{habit.detail}</span>
              </span>
              <ArrowRight size={16} className="text-[#aebcb0]" />
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}`,
  },
  "index.css": { label: "index.css", icon: FileCode2, tone: "text-violet-500", code: `@import url("https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap");

:root {
  font-family: "DM Sans", sans-serif;
  color: #20302b;
  background: #f7f8f4;
}

button { font: inherit; }`,
  },
  "package.json": { label: "package.json", icon: FileJson, tone: "text-amber-500", code: `{
  "name": "little-rituals",
  "private": true,
  "scripts": { "dev": "vite" },
  "dependencies": {
    "lucide-react": "^0.468.0",
    "react": "^18.3.1"
  }
}` },
  "vite.config.ts": { label: "vite.config.ts", icon: FileCode2, tone: "text-sky-500", code: `import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
});` },
};

function IconButton({ label, children, onClick, active = false }: { label: string; children: React.ReactNode; onClick?: () => void; active?: boolean }) {
  return <button aria-label={label} title={label} onClick={onClick} className={`flex h-8 w-8 items-center justify-center rounded-lg transition ${active ? "bg-[#e5ebe6] text-[#263f35]" : "text-[#7c8b84] hover:bg-[#eff3ef] hover:text-[#31473d]"}`}>{children}</button>;
}

function TreeFile({ file, selected, onClick }: { file: FileKey; selected: boolean; onClick: () => void }) {
  const data = fileData[file];
  const Icon = data.icon;
  return <button onClick={onClick} className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[12px] transition ${selected ? "bg-[#e6eee7] font-medium text-[#29463a]" : "text-[#718078] hover:bg-[#f0f4f0]"}`}>
    <Icon size={14} className={data.tone} /><span>{data.label}</span>
  </button>;
}

export function Workspace() {
  const [selectedFile, setSelectedFile] = useState<FileKey>("app.tsx");
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState([{ from: "ai", text: "I set up a calm foundation for your habit tracker. Want to shape the first screen together?" }]);
  const [device, setDevice] = useState<Device>("desktop");
  const [running, setRunning] = useState(false);
  const [chatOpen, setChatOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<"preview" | "code">("preview");
  const [copied, setCopied] = useState(false);
  const current = useMemo(() => fileData[selectedFile], [selectedFile]);

  const submitPrompt = () => {
    const trimmed = prompt.trim();
    if (!trimmed) return;
    setMessages((items) => [...items, { from: "user", text: trimmed }, { from: "ai", text: "Nice direction. I’ll map that into the workspace and keep the first pass focused." }]);
    setPrompt("");
  };

  return (
    <div className="min-h-screen min-w-[980px] overflow-hidden bg-[#f4f6f3] text-[#27352e]" style={{ fontFamily: "'DM Sans', ui-sans-serif, system-ui" }}>
      <style>{`
        @keyframes pulse-soft { 0%,100%{opacity:.5} 50%{opacity:1} }
        .workspace-grid { background-image: linear-gradient(#e8ede8 1px, transparent 1px),linear-gradient(90deg,#e8ede8 1px,transparent 1px); background-size: 18px 18px; }
        .code-line:hover { background: rgba(221,231,222,.55); }
        .preview-frame { transition: width .25s ease, height .25s ease; }
      `}</style>
      <header className="flex h-[52px] items-center justify-between border-b border-[#dce4dc] bg-[#fbfcfa] px-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5 border-r border-[#e0e7e1] pr-4">
            <div className="flex h-7 w-7 items-center justify-center rounded-[9px] bg-[#2d604b] text-white shadow-sm"><Sparkles size={15} /></div>
            <span className="text-[14px] font-semibold tracking-[-.02em]">sprout</span>
          </div>
          <button className="flex items-center gap-2 rounded-md px-2 py-1 text-[13px] font-medium hover:bg-[#f0f4f0]"><span>Little Rituals</span><ChevronDown size={14} className="text-[#8a978f]" /></button>
          <span className="rounded-full bg-[#eaf2eb] px-2 py-0.5 text-[10px] font-medium text-[#55715e]">Starter</span>
        </div>
        <div className="flex items-center gap-1">
          <button className="mr-2 flex items-center gap-2 rounded-md border border-[#dbe4dc] bg-white px-2.5 py-1.5 text-[11px] text-[#65756c] shadow-sm hover:bg-[#f7faf7]"><GitBranch size={13} /> main <ChevronDown size={12} /></button>
          <IconButton label="Help"><HelpCircle size={16} /></IconButton>
          <IconButton label="Settings"><Settings2 size={16} /></IconButton>
          <div className="ml-2 flex h-7 w-7 items-center justify-center rounded-full bg-[#d6e7d7] text-[11px] font-semibold text-[#3e6049]">AM</div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-52px)] min-h-[690px]">
        <aside className="flex w-[286px] shrink-0 flex-col border-r border-[#dce4dc] bg-[#f9fbf8]">
          <div className="border-b border-[#e3eae3] px-4 pb-4 pt-4">
            <div className="mb-3 flex items-center justify-between"><span className="text-[11px] font-semibold uppercase tracking-[.13em] text-[#87948b]">Build with AI</span><IconButton label="New thread"><Plus size={15} /></IconButton></div>
            <div className="rounded-xl border border-[#cbdccc] bg-white p-3 shadow-[0_3px_10px_rgba(39,63,48,.04)]">
              <div className="mb-2 flex items-center gap-2 text-[11px] text-[#809087]"><WandSparkles size={13} className="text-[#468160]" /> Ask sprout to change anything</div>
              <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submitPrompt(); } }} placeholder="Describe what you want to build..." className="h-14 w-full resize-none bg-transparent text-[12px] leading-5 text-[#405149] outline-none placeholder:text-[#a4afa8]" />
              <div className="flex items-center justify-between border-t border-[#edf1ed] pt-2"><span className="text-[10px] text-[#abb6ae]">⌘ ↵ to send</span><button onClick={submitPrompt} className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#2e654d] text-white transition hover:bg-[#24563f]"><Send size={13} /></button></div>
            </div>
          </div>
          <div className="flex-1 overflow-hidden">
            {chatOpen && <div className="border-b border-[#e3eae3] px-4 py-3">
              {messages.map((message, index) => <div key={index} className={`mb-3 flex gap-2 ${message.from === "user" ? "justify-end" : ""}`}>
                {message.from === "ai" && <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-[#dcebdd] text-[#3b7453]"><Sparkles size={11} /></div>}
                <p className={`max-w-[208px] rounded-xl px-2.5 py-2 text-[11px] leading-[1.5] ${message.from === "user" ? "bg-[#e5eee5] text-[#446052]" : "bg-[#f1f5f1] text-[#728078]"}`}>{message.text}</p>
              </div>)}
            </div>}
            <div className="px-4 py-4">
              <div className="mb-2 flex items-center justify-between"><span className="text-[11px] font-semibold uppercase tracking-[.13em] text-[#87948b]">Project files</span><IconButton label="Collapse chat" active={chatOpen} onClick={() => setChatOpen(!chatOpen)}><ChevronDown size={14} /></IconButton></div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 px-2 py-1.5 text-[12px] font-medium text-[#4d6255]"><ChevronDown size={13} /><FolderOpen size={15} className="text-[#77947e]" /> little-rituals</div>
                <div className="ml-4 border-l border-[#dce6dd] pl-2">
                  {(["app.tsx", "index.css", "package.json", "vite.config.ts"] as FileKey[]).map(file => <TreeFile key={file} file={file} selected={selectedFile === file} onClick={() => setSelectedFile(file)} />)}
                </div>
                <div className="mt-3 flex items-center gap-1.5 px-2 py-1.5 text-[12px] text-[#7b8981]"><ChevronRight size={13} /><Folder size={15} className="text-[#a2b5a5]" /> public</div>
              </div>
            </div>
          </div>
          <div className="border-t border-[#e3eae3] px-4 py-3"><div className="flex items-center justify-between text-[11px] text-[#829087]"><span className="flex items-center gap-1.5"><Globe2 size={13} className="text-[#609570]" /> Preview is live</span><span className="flex items-center gap-1"><span className="h-1.5 w-1.5 animate-[pulse-soft_2s_ease-in-out_infinite] rounded-full bg-[#65a174]" /> ready</span></div></div>
        </aside>

        <main className="flex min-w-0 flex-1 flex-col">
          <div className="flex h-11 items-center justify-between border-b border-[#dce4dc] bg-[#fbfcfa] px-4">
            <div className="flex items-center gap-1">
              <button onClick={() => setActiveTab("preview")} className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-[12px] font-medium ${activeTab === "preview" ? "bg-[#e7efe7] text-[#315640]" : "text-[#87938b] hover:bg-[#f0f4f0]"}`}><Monitor size={14} /> Preview</button>
              <button onClick={() => setActiveTab("code")} className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-[12px] font-medium ${activeTab === "code" ? "bg-[#e7efe7] text-[#315640]" : "text-[#87938b] hover:bg-[#f0f4f0]"}`}><Code2 size={14} /> Code</button>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="mr-2 text-[11px] text-[#8b978f]">All changes saved</span>
              <button onClick={() => { setRunning(true); setTimeout(() => setRunning(false), 900); }} className="flex items-center gap-1.5 rounded-md bg-[#2e654d] px-3 py-1.5 text-[11px] font-semibold text-white shadow-sm transition hover:bg-[#24563f]"><Play size={12} fill="currentColor" /> {running ? "Running..." : "Run"}</button>
              <IconButton label="More options"><MoreHorizontal size={16} /></IconButton>
            </div>
          </div>
          {activeTab === "code" ? <div className="flex min-h-0 flex-1 bg-[#fbfcfa]">
            <div className="w-12 shrink-0 border-r border-[#e2e9e2] bg-[#f5f8f5] pt-4 text-right font-mono text-[11px] leading-6 text-[#a7b2aa]">{current.code.split("\n").map((_, i) => <div key={i} className="pr-3">{i + 1}</div>)}</div>
            <div className="min-w-0 flex-1 overflow-auto pt-4 font-mono text-[12px] leading-6 text-[#52655a]">{current.code.split("\n").map((line, i) => <div key={i} className="code-line whitespace-pre px-4"><span className={line.includes("import") ? "text-[#647caa]" : line.includes("className") ? "text-[#9b6d46]" : line.includes("const") || line.includes("return") ? "text-[#547c69]" : ""}>{line || " "}</span></div>)}</div>
            <div className="w-[220px] shrink-0 border-l border-[#e2e9e2] bg-[#f7faf7] p-4"><div className="mb-3 text-[10px] font-semibold uppercase tracking-[.13em] text-[#96a39a]">File outline</div><div className="space-y-2 text-[11px] text-[#79877e]"><div className="flex gap-2"><SquareTerminal size={13} /> App</div><div className="flex gap-2"><LayoutTemplate size={13} /> habits</div><div className="flex gap-2"><Code2 size={13} /> complete</div></div></div>
          </div> : <div className="workspace-grid flex min-h-0 flex-1 items-center justify-center overflow-hidden p-10">
            <div className={`preview-frame relative overflow-hidden rounded-xl border border-[#cad9cb] bg-white shadow-[0_15px_45px_rgba(52,80,58,.12)] ${device === "desktop" ? "h-[min(76vh,650px)] w-[min(78vw,880px)]" : device === "tablet" ? "h-[min(76vh,650px)] w-[620px]" : "h-[min(76vh,650px)] w-[360px]"}`}>
              <div className="flex h-9 items-center justify-between border-b border-[#e6ece6] bg-[#fbfcfa] px-3"><div className="flex gap-1.5"><span className="h-2 w-2 rounded-full bg-[#e0a49b]" /><span className="h-2 w-2 rounded-full bg-[#e4c995]" /><span className="h-2 w-2 rounded-full bg-[#9fc3a4]" /></div><div className="flex items-center gap-1 rounded-md bg-[#f0f4f0] px-2 py-1 text-[9px] text-[#829188]"><LockIcon /> little-rituals.local</div><div className="w-10" /></div>
              <div className="h-[calc(100%-36px)] overflow-auto bg-[#f7f8f4] px-8 pb-10 text-[#20302b]">
                <div className="mx-auto flex max-w-3xl items-center justify-between py-6"><span className="text-base font-semibold tracking-tight">little rituals</span><span className="rounded-full bg-[#d9ead9] px-3 py-1.5 text-[9px] font-medium text-[#55715e]">Tuesday, Apr 16</span></div>
                <div className="mx-auto max-w-3xl pt-12"><p className="mb-2 text-[9px] font-semibold uppercase tracking-[.18em] text-[#789184]">Your gentle reset</p><h1 className="text-[clamp(29px,4vw,48px)] font-semibold leading-[1.08] tracking-[-.06em]">A few small things,<br /> done with care.</h1>
                  <div className="mt-10 space-y-2.5">{[["Morning walk","20 minutes",true],["Read ten pages","Atomic Habits",false],["Plan tomorrow","Three priorities",false]].map(([name, detail, done]) => <div key={String(name)} className="flex items-center gap-3 rounded-2xl border border-[#dfe8df] bg-white/70 p-3"><span className={`flex h-8 w-8 items-center justify-center rounded-full ${done ? "bg-[#315b48] text-white" : "bg-[#edf3ed] text-[#9ab09d]"}`}>{done ? <span className="text-xs">✓</span> : <span className="h-2 w-2 rounded-full border border-[#9ab09d]" />}</span><span className="flex-1"><span className={`block text-[11px] font-medium ${done ? "text-[#85948a] line-through" : ""}`}>{String(name)}</span><span className="mt-1 block text-[9px] text-[#94a39a]">{String(detail)}</span></span><ChevronRight size={14} className="text-[#aebcb0]" /></div>)}</div>
                </div>
              </div>
            </div>
          </div>}
          <div className="flex h-10 items-center justify-between border-t border-[#dce4dc] bg-[#fbfcfa] px-4 text-[10px] text-[#8b978f]">
            <div className="flex items-center gap-3"><span className="flex items-center gap-1.5"><GitBranch size={12} /> main</span><span>•</span><span>3 files changed</span></div>
            <div className="flex items-center gap-1 rounded-lg bg-[#f0f4f0] p-0.5">
              <button onClick={() => setDevice("desktop")} className={`rounded-md p-1.5 ${device === "desktop" ? "bg-white text-[#41664e] shadow-sm" : "text-[#98a39c]"}`}><Monitor size={13} /></button>
              <button onClick={() => setDevice("tablet")} className={`rounded-md p-1.5 ${device === "tablet" ? "bg-white text-[#41664e] shadow-sm" : "text-[#98a39c]"}`}><Tablet size={13} /></button>
              <button onClick={() => setDevice("mobile")} className={`rounded-md p-1.5 ${device === "mobile" ? "bg-white text-[#41664e] shadow-sm" : "text-[#98a39c]"}`}><Smartphone size={13} /></button>
            </div>
            <div className="flex items-center gap-2"><button onClick={() => { navigator.clipboard?.writeText(current.code); setCopied(true); setTimeout(() => setCopied(false), 1000); }} className="flex items-center gap-1 hover:text-[#466951]"><Copy size={12} /> {copied ? "Copied" : "Copy code"}</button><Download size={12} /></div>
          </div>
        </main>
      </div>
    </div>
  );
}

function LockIcon() {
  return <span className="inline-block h-1.5 w-1.5 rounded-full border border-[#839488]" />;
}