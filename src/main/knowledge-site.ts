import { readFile, readdir, writeFile, mkdir, stat } from "node:fs/promises";
import { join, relative, basename, extname } from "node:path";
import { createHash } from "node:crypto";
import { marked } from "marked";

const SITE_DIR = ".sharkbay/site";
const HASH_FILE = ".sharkbay/site/.content-hash";

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
      html += `<strong>${esc(t.title)}</strong> <span class="task-meta">${esc(t.owner)} · ${esc(t.taskId.split("-")[0]!)}</span>`;
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
      html += `<li class="task-item"><strong>${esc(t.title)}</strong> <span class="task-meta">${esc(t.owner)}</span></li>`;
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
  let nav = `<a href="{base}index.html">Home</a>`;
  if (sources.docs.length > 0) {
    nav += ` <a href="{base}docs/${basename(sources.docs[0]!.relativePath, ".md")}.html">Docs</a>`;
    for (const doc of sources.docs) {
      const slug = basename(doc.relativePath, extname(doc.relativePath));
      nav += ` <a href="{base}docs/${slug}.html">${esc(doc.title)}</a>`;
    }
  }
  nav += ` <a href="{base}tasks/index.html">Tasks</a>`;
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
<nav class="site-nav">${resolvedNav}</nav>
<main class="content">${body}</main>
</body>
</html>`;
}

const CSS = `
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; color: #1a1a1a; background: #fafafa; padding: 0; }
.site-nav { background: #1a2332; color: #fff; padding: 12px 24px; display: flex; flex-wrap: wrap; gap: 8px; }
.site-nav a { color: #8ecfff; text-decoration: none; font-size: 13px; }
.site-nav a:hover { text-decoration: underline; }
.content { max-width: 800px; margin: 32px auto; padding: 0 24px; }
h1, h2, h3, h4 { margin-top: 1.4em; margin-bottom: 0.4em; }
h1 { font-size: 1.6em; }
h2 { font-size: 1.3em; border-bottom: 1px solid #e0e0e0; padding-bottom: 4px; }
p, ul, ol, pre { margin-bottom: 0.8em; }
pre { background: #f0f0f0; padding: 12px; border-radius: 4px; overflow-x: auto; font-size: 13px; }
code { background: #f0f0f0; padding: 2px 5px; border-radius: 3px; font-size: 0.9em; }
pre code { background: none; padding: 0; }
a { color: #0066cc; }
ul, ol { padding-left: 1.5em; }
.task-list { list-style: none; padding: 0; }
.task-item { padding: 10px 12px; border: 1px solid #e0e0e0; border-radius: 6px; margin-bottom: 8px; }
.task-item p { margin: 4px 0 0; color: #555; font-size: 0.9em; }
.task-meta { color: #777; font-size: 0.85em; margin-left: 8px; }
.task-active { border-left: 3px solid #22c55e; }
.task-completed { border-left: 3px solid #6b7280; }
.task-paused { border-left: 3px solid #f59e0b; }
.task-blocked { border-left: 3px solid #ef4444; }
table { border-collapse: collapse; width: 100%; margin-bottom: 1em; }
th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
th { background: #f5f5f5; }
`;

// --- Utilities ---

function computeSourcesHash(sources: Sources): string {
  const h = createHash("sha256");
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
