import { createRequire } from "node:module";
import type * as LydellPty from "@lydell/node-pty";

const requireFromHere = createRequire(import.meta.url);

const isBun = typeof (globalThis as { Bun?: unknown }).Bun !== "undefined";
const moduleName = isBun ? "bun-pty" : "@lydell/node-pty";

const ptyModule = requireFromHere(moduleName) as typeof LydellPty;

export const spawn = ptyModule.spawn;
export type IPty = LydellPty.IPty;
