import { useEffect, useState } from "react";
import type { UsageSummaryView } from "./types";

export function UsageSummary() {
  const [summary, setSummary] = useState<UsageSummaryView | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = () => {
      window.sharkBay?.usage?.getSummary?.({ periodDays: 1 })?.then((data) => {
        if (!cancelled) setSummary(data);
      });
    };
    load();
    const timer = setInterval(load, 30_000);
    return () => { cancelled = true; clearInterval(timer); };
  }, []);

  if (!summary || (summary.totalInputTokens === 0 && summary.totalOutputTokens === 0)) {
    return null;
  }

  const tokens = formatCompact(summary.totalInputTokens + summary.totalOutputTokens);
  const cost = summary.totalCostUsd != null ? `$${summary.totalCostUsd.toFixed(2)}` : null;

  return (
    <button
      className="usage-summary-bar"
      type="button"
      title="View token usage details"
      onClick={() => window.sharkBay?.usage?.openDetail?.()}
    >
      <span className="usage-summary-tokens">{tokens} tokens</span>
      {cost && <span className="usage-summary-cost">{cost}</span>}
      <span className="usage-summary-period">{summary.periodLabel.toLowerCase()}</span>
    </button>
  );
}

function formatCompact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
  return String(n);
}
