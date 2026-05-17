import { readFile, readdir, writeFile, mkdir, stat } from "node:fs/promises";
import { join, relative, basename, extname } from "node:path";
import { createHash } from "node:crypto";
import { marked } from "marked";

const SITE_DIR = ".sharkbay/site";
const HASH_FILE = ".sharkbay/site/.content-hash";
const SITE_TEMPLATE_VERSION = "knowledge-site-ui-v2";

export type KnowledgeSiteResult = {
  generated: boolean;
  sitePath: string;
  reason?: string;
};

/**
 * Generate the knowledge site if sources have changed.
 * Returns the site index path regardless of whether regeneration occurred.
 */
export async function generateKnowledgeSite(repoPath: string): Promise<KnowledgeSiteResult> {
  const sitePath = join(repoPath, SITE_DIR);
  const indexPath = join(sitePath, "index.html");

  const sources = await discoverSources(repoPath);
  const currentHash = computeSourcesHash(sources);
  const previousHash = await readPreviousHash(sitePath);

  if (currentHash === previousHash) {
    return { generated: false, sitePath: indexPath, reason: "no-changes" };
  }

  await mkdir(sitePath, { recursive: true });
  await mkdir(join(sitePath, "docs"), { recursive: true });
  await mkdir(join(sitePath, "tasks"), { recursive: true });

  const nav = buildNav(sources);
  const readmeHtml = sources.readme ? renderMarkdown(sources.readme.content) : "<p>No README.md found.</p>";
  await writeFile(indexPath, wrapPage("Home", readmeHtml, nav, ""));

  for (const doc of sources.docs) {
    const slug = basename(doc.relativePath, extname(doc.relativePath));
    const html = renderMarkdown(doc.content);
    await writeFile(join(sitePath, "docs", `${slug}.html`), wrapPage(doc.title, html, nav, "../"));
  }

  const tasksHtml = renderTasksPage(sources.tasks);
  await writeFile(join(sitePath, "tasks", "index.html"), wrapPage("Team Tasks", tasksHtml, nav, "../"));

  await writeFile(join(sitePath, HASH_FILE.split("/").pop()!), currentHash);

  return { generated: true, sitePath: indexPath };
}

/**
 * Get the site index.html path for a project (without generating).
 */
export function getKnowledgeSitePath(repoPath: string): string {
  return join(repoPath, SITE_DIR, "index.html");
}

// --- Source discovery ---

type SourceFile = { relativePath: string; title: string; content: string };
type TaskSource = { taskId: string; title: string; status: string; owner: string; createdAt: string; summary: string; raw: string };
type Sources = { readme: SourceFile | null; docs: SourceFile[]; tasks: TaskSource[] };

async function discoverSources(repoPath: string): Promise<Sources> {
  const readme = await readSourceFile(repoPath, "README.md");
  const docs = await discoverDocs(repoPath);
  const tasks = await discoverTasks(repoPath);
  return { readme, docs, tasks };
}

async function readSourceFile(repoPath: string, relativePath: string): Promise<SourceFile | null> {
  try {
    const content = await readFile(join(repoPath, relativePath), "utf-8");
    const title = extractTitle(content) ?? basename(relativePath, extname(relativePath));
    return { relativePath, title, content };
  } catch {
    return null;
  }
}

async function discoverDocs(repoPath: string): Promise<SourceFile[]> {
  const docsDir = join(repoPath, "docs");
  const results: SourceFile[] = [];
  await walkMd(docsDir, repoPath, results);
  return results.sort((a, b) => a.relativePath.localeCompare(b.relativePath));
}

async function walkMd(dir: string, repoPath: string, results: SourceFile[]): Promise<void> {
  let entries: string[];
  try {
    entries = await readdir(dir);
  } catch {
    return;
  }
  for (const name of entries) {
    const full = join(dir, name);
    const s = await stat(full).catch(() => null);
    if (!s) continue;
    if (s.isDirectory()) {
      await walkMd(full, repoPath, results);
    } else if (name.endsWith(".md")) {
      const content = await readFile(full, "utf-8");
      const rel = relative(repoPath, full);
      const title = extractTitle(content) ?? basename(name, ".md");
      results.push({ relativePath: rel, title, content });
    }
  }
}

async function discoverTasks(repoPath: string): Promise<TaskSource[]> {
  const teamDir = join(repoPath, ".sharkbay", "team-context", "tasks");
  const results: TaskSource[] = [];
  await walkTaskFiles(teamDir, results);
  return results.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
}

async function walkTaskFiles(dir: string, results: TaskSource[]): Promise<void> {
  let entries: string[];
  try {
    entries = await readdir(dir);
  } catch {
    return;
  }
  for (const name of entries) {
    const full = join(dir, name);
    const s = await stat(full).catch(() => null);
    if (!s) continue;
    if (s.isDirectory()) {
      await walkTaskFiles(full, results);
    } else if (name.endsWith(".md")) {
      const content = await readFile(full, "utf-8");
      const task = parseTaskFrontmatter(content);
      if (task) results.push(task);
    }
  }
}

function parseTaskFrontmatter(raw: string): TaskSource | null {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) return null;
  const fm: Record<string, string> = {};
  for (const line of match[1]!.split("\n")) {
    const idx = line.indexOf(":");
    if (idx > 0) fm[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
  }
  if (!fm["taskId"] || !fm["title"]) return null;
  const body = match[2] ?? "";
  const summaryMatch = body.match(/^##\s+Summary\s*\n([\s\S]*?)(?=^##\s|$)/m);
  return {
    taskId: fm["taskId"]!,
    title: fm["title"]!,
    status: fm["status"] ?? "unknown",
    owner: fm["actor"] ?? "unknown",
    createdAt: fm["createdAt"] ?? "",
    summary: summaryMatch?.[1]?.trim() ?? "",
    raw: body,
  };
}

// --- Rendering ---

function renderMarkdown(md: string): string {
  return marked.parse(md, { async: false }) as string;
}

function renderTasksPage(tasks: TaskSource[]): string {
  if (tasks.length === 0) return "<p>No team tasks synced yet.</p>";

  const groups: Record<string, TaskSource[]> = {};
  for (const t of tasks) {
    const key = t.status;
    (groups[key] ??= []).push(t);
  }

  const order = ["active", "paused", "blocked", "completed", "abandoned"];
  let html = "";
  for (const status of order) {
    const group = groups[status];
    if (!group?.length) continue;
    html += `<h2>${statusLabel(status)}</h2><ul class="task-list">`;
    for (const t of group) {
      html += `<li class="task-item task-${status}">`;
      html += `<div class="task-card-header"><strong>${esc(t.title)}</strong><span class="task-status">${esc(statusLabel(status))}</span></div>`;
      html += `<span class="task-meta">${esc(t.owner)} · ${esc(t.taskId.split("-")[0]!)}</span>`;
      if (t.summary) html += `<p>${esc(t.summary)}</p>`;
      html += `</li>`;
    }
    html += `</ul>`;
  }
  // Any remaining statuses
  for (const [status, group] of Object.entries(groups)) {
    if (order.includes(status)) continue;
    html += `<h2>${esc(status)}</h2><ul class="task-list">`;
    for (const t of group) {
      html += `<li class="task-item"><div class="task-card-header"><strong>${esc(t.title)}</strong><span class="task-status">${esc(status)}</span></div><span class="task-meta">${esc(t.owner)}</span></li>`;
    }
    html += `</ul>`;
  }
  return html;
}

function statusLabel(s: string): string {
  const map: Record<string, string> = { active: "Active", paused: "Paused", blocked: "Blocked", completed: "Completed", abandoned: "Abandoned" };
  return map[s] ?? s;
}

// --- HTML template ---

function buildNav(sources: Sources): string {
  let nav = `<div class="nav-section"><div class="nav-label">Knowledge</div><a class="nav-link" href="{base}index.html">Home</a></div>`;
  if (sources.docs.length > 0) {
    nav += `<div class="nav-section"><div class="nav-label">Docs</div>`;
    for (const doc of sources.docs) {
      const slug = basename(doc.relativePath, extname(doc.relativePath));
      nav += `<a class="nav-link" href="{base}docs/${slug}.html">${esc(doc.title)}</a>`;
    }
    nav += `</div>`;
  }
  nav += `<div class="nav-section"><div class="nav-label">Team</div><a class="nav-link" href="{base}tasks/index.html">Tasks</a></div>`;
  return nav;
}

function wrapPage(title: string, body: string, nav: string, base: string): string {
  const resolvedNav = nav.replace(/\{base\}/g, base);
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<style>${CSS}</style>
</head>
<body>
<div class="site-shell">
  <aside class="site-sidebar">
    <a class="brand" href="${base}index.html" aria-label="Knowledge Site home">
      <span class="brand-mark">KB</span>
      <span class="brand-copy">
        <span class="brand-title">Knowledge Site</span>
        <span class="brand-subtitle">SharkBay</span>
      </span>
    </a>
    <nav class="site-nav" aria-label="Knowledge Site navigation">${resolvedNav}</nav>
    <div class="sidebar-footer">
      <span>Local docs</span>
      <strong>Team context ready</strong>
    </div>
  </aside>
  <main class="content-shell">
    <article class="content">${body}</article>
  </main>
</div>
</body>
</html>`;
}

const CSS = `
:root {
  --canvas: #f7f7f4;
  --canvas-soft: #fafaf7;
  --surface: #ffffff;
  --surface-strong: #e6e5e0;
  --ink: #26251e;
  --body: #5a5852;
  --muted: #807d72;
  --muted-soft: #a09c92;
  --hairline: #e6e5e0;
  --hairline-strong: #cfcdc4;
  --primary: #f54e00;
  --primary-active: #d04200;
  --success: #1f8a65;
  --error: #cf2d56;
  --thinking: #dfa88f;
  --grep: #9fc9a2;
  --read: #9fbbe0;
  --edit: #c0a8dd;
  --done: #c08532;
}

* { box-sizing: border-box; margin: 0; padding: 0; }
html { background: var(--canvas); }
body {
  min-width: 320px;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  line-height: 1.6;
  color: var(--body);
  background:
    linear-gradient(90deg, rgba(230, 229, 224, 0.46) 1px, transparent 1px) 0 0 / 48px 48px,
    var(--canvas);
  padding: 0;
}

.site-shell {
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr);
  min-height: 100vh;
}

.site-sidebar {
  position: sticky;
  top: 0;
  align-self: start;
  height: 100vh;
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 24px 18px;
  border-right: 1px solid var(--hairline);
  background: rgba(247, 247, 244, 0.96);
}

.brand {
  display: grid;
  grid-template-columns: 38px minmax(0, 1fr);
  gap: 12px;
  align-items: center;
  border-bottom: 0;
  color: var(--ink);
  text-decoration: none;
}

.brand-mark {
  display: grid;
  width: 38px;
  height: 38px;
  place-items: center;
  border-radius: 8px;
  background: var(--ink);
  color: var(--canvas);
  font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
  font-size: 12px;
  font-weight: 600;
}

.brand-copy {
  display: grid;
  gap: 1px;
  min-width: 0;
}

.brand-title {
  color: var(--ink);
  font-size: 15px;
  font-weight: 600;
  line-height: 1.25;
}

.brand-subtitle {
  color: var(--muted);
  font-size: 12px;
  line-height: 1.35;
}

.site-nav {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 20px;
  overflow: auto;
  padding-right: 3px;
}

.nav-section {
  display: grid;
  gap: 6px;
}

.nav-label {
  color: var(--muted-soft);
  font-size: 11px;
  font-weight: 700;
  line-height: 1.4;
  text-transform: uppercase;
}

.nav-link {
  display: block;
  overflow: hidden;
  padding: 8px 10px;
  border: 1px solid transparent;
  border-bottom: 1px solid transparent;
  border-radius: 8px;
  color: var(--body);
  font-size: 14px;
  font-weight: 500;
  line-height: 1.3;
  text-decoration: none;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.nav-link:hover {
  border-color: var(--hairline);
  background: var(--surface);
  color: var(--ink);
}

.nav-link:focus-visible,
a:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}

.sidebar-footer {
  display: grid;
  gap: 4px;
  padding: 12px;
  border: 1px solid var(--hairline);
  border-radius: 8px;
  background: var(--surface);
  color: var(--muted);
  font-size: 12px;
  line-height: 1.35;
}

.sidebar-footer strong {
  color: var(--ink);
  font-size: 13px;
  font-weight: 600;
}

.content-shell {
  min-width: 0;
  padding: 48px clamp(24px, 5vw, 72px);
}

.content {
  width: min(100%, 920px);
  padding: clamp(30px, 5vw, 64px);
  border: 1px solid var(--hairline);
  border-radius: 8px;
  background: var(--surface);
}

.content > :first-child { margin-top: 0; }
.content > :last-child { margin-bottom: 0; }

h1, h2, h3, h4 {
  color: var(--ink);
  line-height: 1.18;
}

h1 {
  max-width: 12ch;
  margin: 0 0 28px;
  font-size: clamp(36px, 6vw, 64px);
  font-weight: 400;
}

h2 {
  margin: 56px 0 18px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--hairline);
  font-size: clamp(25px, 3vw, 34px);
  font-weight: 400;
}

h3 {
  margin: 34px 0 12px;
  font-size: 21px;
  font-weight: 600;
}

h4 {
  margin: 26px 0 10px;
  font-size: 16px;
  font-weight: 600;
}

p, ul, ol, pre, table, blockquote {
  margin-bottom: 18px;
}

p {
  max-width: 74ch;
  color: var(--body);
}

a {
  color: var(--primary-active);
  text-decoration: none;
  border-bottom: 1px solid rgba(245, 78, 0, 0.28);
}

a:hover {
  color: var(--primary);
  border-bottom-color: currentColor;
}

ul, ol {
  padding-left: 1.25rem;
}

li + li {
  margin-top: 6px;
}

blockquote {
  padding: 14px 16px;
  border-left: 3px solid var(--primary);
  border-radius: 0 8px 8px 0;
  background: var(--canvas-soft);
}

hr {
  height: 1px;
  margin: 36px 0;
  border: 0;
  background: var(--hairline);
}

pre {
  overflow-x: auto;
  padding: 16px;
  border: 1px solid var(--hairline);
  border-radius: 8px;
  background: var(--canvas-soft);
  color: var(--ink);
  font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
  font-size: 13px;
  line-height: 1.55;
}

code {
  padding: 2px 5px;
  border: 1px solid var(--hairline);
  border-radius: 4px;
  background: var(--canvas-soft);
  color: var(--ink);
  font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
  font-size: 0.9em;
}

pre code {
  padding: 0;
  border: 0;
  background: transparent;
}

table {
  display: block;
  max-width: 100%;
  overflow-x: auto;
  border: 1px solid var(--hairline);
  border-radius: 8px;
  border-spacing: 0;
}

th, td {
  padding: 10px 12px;
  border-bottom: 1px solid var(--hairline);
  text-align: left;
  vertical-align: top;
}

th {
  background: var(--canvas-soft);
  color: var(--ink);
  font-weight: 600;
}

tr:last-child td {
  border-bottom: 0;
}

img {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
}

.task-list {
  display: grid;
  gap: 12px;
  padding: 0;
  list-style: none;
}

.task-item {
  margin: 0;
  padding: 16px;
  border: 1px solid var(--hairline);
  border-left: 4px solid var(--muted-soft);
  border-radius: 8px;
  background: var(--surface);
}

.task-card-header {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 5px;
}

.task-card-header strong {
  color: var(--ink);
  font-size: 15px;
  font-weight: 600;
  line-height: 1.35;
}

.task-status {
  flex: 0 0 auto;
  padding: 3px 8px;
  border-radius: 999px;
  background: var(--surface-strong);
  color: var(--ink);
  font-size: 11px;
  font-weight: 700;
  line-height: 1.4;
  text-transform: uppercase;
}

.task-item p {
  margin: 10px 0 0;
  color: var(--body);
  font-size: 14px;
  line-height: 1.5;
}

.task-meta {
  color: var(--muted);
  font-size: 12px;
}

.task-active { border-left-color: var(--success); }
.task-completed { border-left-color: var(--muted); }
.task-paused { border-left-color: var(--done); }
.task-blocked { border-left-color: var(--error); }
.task-abandoned { border-left-color: var(--muted-soft); }

@media (max-width: 900px) {
  .site-shell {
    display: block;
  }

  .site-sidebar {
    position: static;
    height: auto;
    gap: 16px;
    padding: 18px;
    border-right: 0;
    border-bottom: 1px solid var(--hairline);
  }

  .site-nav {
    display: grid;
    grid-auto-flow: column;
    grid-auto-columns: minmax(160px, 1fr);
    gap: 14px;
    overflow-x: auto;
    padding: 0 0 2px;
  }

  .nav-section {
    align-content: start;
  }

  .sidebar-footer {
    display: none;
  }

  .content-shell {
    padding: 24px 16px 40px;
  }

  .content {
    padding: 28px 20px;
  }

  h1 {
    max-width: none;
    font-size: 36px;
  }

  h2 {
    margin-top: 42px;
    font-size: 25px;
  }
}

@media (max-width: 520px) {
  .brand {
    grid-template-columns: 34px minmax(0, 1fr);
  }

  .brand-mark {
    width: 34px;
    height: 34px;
  }

  .content-shell {
    padding: 18px 10px 32px;
  }

  .content {
    padding: 24px 16px;
  }

  .task-card-header {
    display: grid;
  }
}
`;

// --- Utilities ---

function computeSourcesHash(sources: Sources): string {
  const h = createHash("sha256");
  h.update(SITE_TEMPLATE_VERSION);
  if (sources.readme) h.update(sources.readme.content);
  for (const doc of sources.docs) h.update(doc.content);
  for (const task of sources.tasks) h.update(task.raw);
  return h.digest("hex").slice(0, 16);
}

async function readPreviousHash(sitePath: string): Promise<string | null> {
  try {
    return (await readFile(join(sitePath, ".content-hash"), "utf-8")).trim();
  } catch {
    return null;
  }
}

function extractTitle(md: string): string | null {
  const match = md.match(/^#\s+(.+)/m);
  return match?.[1]?.trim() ?? null;
}

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
