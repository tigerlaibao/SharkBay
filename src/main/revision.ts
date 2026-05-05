import { createHash } from "node:crypto";
import { promises as fs } from "node:fs";

export async function computeRevision(path: string): Promise<string> {
  const [stat, content] = await Promise.all([fs.stat(path), fs.readFile(path)]);
  return revisionFromParts(stat.size, stat.mtimeMs, content);
}

export function revisionFromContent(content: Buffer | string): string {
  const buffer = Buffer.isBuffer(content) ? content : Buffer.from(content);
  return revisionFromParts(buffer.byteLength, 0, buffer);
}

function revisionFromParts(size: number, mtimeMs: number, content: Buffer): string {
  const hash = createHash("sha256").update(content).digest("hex").slice(0, 24);
  return `sha256:${hash}:size:${size}:mtime:${Math.round(mtimeMs * 1000)}`;
}
