import type { SharkBayBridge } from "./types";

declare global {
  interface Window {
    sharkBay?: SharkBayBridge;
  }
}

export {};
