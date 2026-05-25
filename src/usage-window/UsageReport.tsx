import { useEffect, useMemo, useState } from "react";
import type { UsageGroupRowView, UsageReportFilterView, UsageReportResultView } from "../renderer/types.js";

type QuickRange = "1" | "7" | "30" | "all";

export function UsageReport() {
  const [report, setReport] = useState<UsageReportResultView | null>(null);
  const [projectFilter, setProjectFilter] = useState("");
  const [agentFilter, setAgentFilter] = useState("");
  const [quickRange, setQuickRange] = useState<QuickRange>("7");
  const [loading, setLoading] = useState(true);

  const filter = useMemo((): UsageReportFilterView => {
    const f: UsageReportFilterView = {};
    if (projectFilter) f.projectPath = projectFilter;
    if (agentFilter) f.agentId = agentFilter;
    if (quickRange !== "all") {
      const days = Number(quickRange);
      f.startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
    }
    return f;
  }, [projectFilter, agentFilter, quickRange]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    window.sharkBay?.usage?.getReport?.(filter)?.then((result) => {
      if (!cancelled) {
        setReport(normalizeUsageReport(result));
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [filter]);

  const projects = report?.byProject.map((r) => r.key).filter(Boolean) ?? [];
  const agents = report?.byAgent.map((r) => r.key).filter(Boolean) ?? [];

  return (
    <div className="app-shell" data-theme="day">
      <div className="usage-window">
        <div className="usage-titlebar">
          <h1>Token Usage</h1>
        </div>

        <div className="usage-filters">
          <div className="filter-group">
            <span className="filter-label">Project</span>
            <select value={projectFilter} onChange={(e) => setProjectFilter(e.target.value)}>
              <option value="">All Projects</option>
              {projects.map((p) => (
                <option key={p} value={p}>{shortPath(p)}</option>
              ))}
            </select>
          </div>

          <div className="filter-separator" />

          <div className="filter-group">
            <span className="filter-label">Agent</span>
            <select value={agentFilter} onChange={(e) => setAgentFilter(e.target.value)}>
              <option value="">All Agents</option>
              {agents.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>

          <div className="filter-separator" />

          <div className="filter-group">
            <span className="filter-label">Period</span>
            <div className="quick-range">
              {(["1", "7", "30", "all"] as QuickRange[]).map((r) => (
                <button
                  key={r}
                  className={r === quickRange ? "is-active" : ""}
                  onClick={() => setQuickRange(r)}
                >
                  {r === "1" ? "Today" : r === "all" ? "All" : `${r} Days`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {report && !loading ? (
          <>
            <div className="usage-overview">
              <SummaryCards report={report} days={quickRange === "all" ? null : Number(quickRange)} />
              <DailyChart byDay={report.byDay} rangeDays={quickRange === "all" ? null : Number(quickRange)} />
            </div>
            <div className="usage-content">
              <BreakdownTable title="By Project" rows={report.byProject} labelFn={shortPath} />
              <BreakdownTable title="By Agent" rows={report.byAgent} labelFn={(k) => k} isAgent />
              <DailyBreakdown byDay={report.byDay} />
            </div>
          </>
        ) : (
          <div className="usage-empty">{loading ? "Loading..." : "No usage data yet."}</div>
        )}
      </div>
    </div>
  );
}

type RawUsageGroupRowView = Partial<UsageGroupRowView> & {
  key?: string | null;
  input_tokens?: number | null;
  output_tokens?: number | null;
  cache_read_tokens?: number | null;
};

type RawUsageTotalsView = Partial<UsageReportResultView["totals"]> & {
  input_tokens?: number | null;
  output_tokens?: number | null;
  cache_read_tokens?: number | null;
};

type RawUsageReportResultView = Partial<UsageReportResultView> & {
  byProject?: RawUsageGroupRowView[];
  byAgent?: RawUsageGroupRowView[];
  byDay?: RawUsageGroupRowView[];
  totals?: RawUsageTotalsView;
};

function normalizeUsageReport(report: UsageReportResultView): UsageReportResultView {
  const raw = report as RawUsageReportResultView;
  const totals: RawUsageTotalsView = raw.totals ?? {};
  return {
    byProject: (raw.byProject ?? []).map(normalizeUsageGroupRow),
    byAgent: (raw.byAgent ?? []).map(normalizeUsageGroupRow),
    byDay: (raw.byDay ?? []).map(normalizeUsageGroupRow),
    totals: {
      inputTokens: finiteNumber(totals.inputTokens ?? totals.input_tokens),
      outputTokens: finiteNumber(totals.outputTokens ?? totals.output_tokens),
      cacheReadTokens: finiteNumber(totals.cacheReadTokens ?? totals.cache_read_tokens),
      costUsd: null,
    },
  };
}

function normalizeUsageGroupRow(row: RawUsageGroupRowView): UsageGroupRowView {
  return {
    key: row.key ?? "Unknown",
    inputTokens: finiteNumber(row.inputTokens ?? row.input_tokens),
    outputTokens: finiteNumber(row.outputTokens ?? row.output_tokens),
    cacheReadTokens: finiteNumber(row.cacheReadTokens ?? row.cache_read_tokens),
    costUsd: null,
  };
}

function finiteNumber(value: number | null | undefined): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function SummaryCards({ report, days }: { report: UsageReportResultView; days: number | null }) {
  const { totals } = report;
  const dayCount = days ?? Math.max(report.byDay.length, 1);
  const avgInput = dayCount > 0 ? Math.round(totals.inputTokens / dayCount) : 0;

  return (
    <div className="usage-summary-cards">
      <div className="summary-card">
        <span className="card-label">Input Tokens</span>
        <span className="card-value">{formatTokens(totals.inputTokens)}</span>
        <span className="card-sub">avg {formatTokens(avgInput)} / day</span>
      </div>
      <div className="summary-card">
        <span className="card-label">Output Tokens</span>
        <span className="card-value">{formatTokens(totals.outputTokens)}</span>
      </div>
      <div className="summary-card">
        <span className="card-label">Cache Read</span>
        <span className="card-value">{formatTokens(totals.cacheReadTokens)}</span>
        {totals.inputTokens > 0 && (
          <span className="card-sub">
            {Math.round((totals.cacheReadTokens / (totals.inputTokens + totals.cacheReadTokens)) * 100)}% cache hit
          </span>
        )}
      </div>
    </div>
  );
}

function DailyChart({ byDay, rangeDays }: { byDay: UsageGroupRowView[]; rangeDays: number | null }) {
  const days = fillDayGaps(byDay, rangeDays ?? 30);
  const maxTokens = Math.max(...days.map((d) => d.inputTokens + d.outputTokens), 1);

  return (
    <div className="usage-section">
      <div className="usage-chart">
        <div className="chart-legend">
          <span className="legend-input">Input</span>
          <span className="legend-output">Output</span>
        </div>
        <div className="chart-bars">
          {days.map((day, index) => {
            const inputPct = (day.inputTokens / maxTokens) * 85;
            const outputPct = (day.outputTokens / maxTokens) * 85;
            const labelInterval = days.length > 14 ? 5 : 2;
            const showLabel = days.length <= 10 || index === 0 || index === days.length - 1 || index % labelInterval === 0;
            return (
              <div key={day.key} className="chart-bar-group">
                <div className="chart-bar-stack">
                  <div className="chart-bar-input" style={{ height: `${inputPct}%` }} />
                  <div className="chart-bar-output" style={{ height: `${outputPct}%` }} />
                </div>
                <span className={showLabel ? "chart-bar-label" : "chart-bar-label is-hidden"}>{formatDate(day.key)}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function BreakdownTable({ title, rows, labelFn, isAgent }: {
  title: string;
  rows: UsageGroupRowView[];
  labelFn: (key: string) => string;
  isAgent?: boolean;
}) {
  return (
    <div className="usage-section">
      <span className="section-title">{title}</span>
      <div className="table-wrapper">
        <table className="usage-table">
          <thead>
            <tr>
              <th>{isAgent ? "Agent" : "Project"}</th>
              <th>Input</th>
              <th>Output</th>
              <th>Cache Read</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.key}>
                <td>
                  {isAgent ? (
                    <span className="agent-badge" title={row.key}>{labelFn(row.key)}</span>
                  ) : (
                    <span className="table-label" title={row.key}>{labelFn(row.key)}</span>
                  )}
                </td>
                <td className="tokens-cell">{row.inputTokens.toLocaleString()}</td>
                <td className="tokens-cell">{row.outputTokens.toLocaleString()}</td>
                <td className="tokens-cell">{row.cacheReadTokens > 0 ? row.cacheReadTokens.toLocaleString() : "—"}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={4} style={{ textAlign: "center", color: "#7a8587" }}>No data</td></tr>
            )}
          </tbody>
        </table>
        {rows.length > 0 && (
          <div className="table-footer">
            <span>{rows.length} {isAgent ? "agents" : "projects"}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function formatDate(iso: string): string {
  const [, m, d] = iso.split("-");
  return `${Number(m)}/${Number(d)}`;
}

function shortPath(p: string): string {
  const parts = p.split("/");
  return parts[parts.length - 1] || p;
}

function fillDayGaps(byDay: UsageGroupRowView[], rangeDays: number): UsageGroupRowView[] {
  const map = new Map(byDay.map((d) => [d.key, d]));
  const result: UsageGroupRowView[] = [];
  const now = new Date();
  for (let i = rangeDays - 1; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const key = date.toISOString().slice(0, 10);
    result.push(map.get(key) ?? { key, inputTokens: 0, outputTokens: 0, cacheReadTokens: 0, costUsd: null });
  }
  return result;
}

function DailyBreakdown({ byDay }: { byDay: UsageGroupRowView[] }) {
  const days = [...byDay].slice(0, 14);
  if (days.length === 0) return null;

  return (
    <div className="usage-section full-width">
      <span className="section-title">Daily Breakdown</span>
      <div className="table-wrapper">
        <table className="usage-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Input</th>
              <th>Output</th>
              <th>Cache Read</th>
            </tr>
          </thead>
          <tbody>
            {days.map((row) => (
              <tr key={row.key}>
                <td>{row.key}</td>
                <td className="tokens-cell">{row.inputTokens.toLocaleString()}</td>
                <td className="tokens-cell">{row.outputTokens.toLocaleString()}</td>
                <td className="tokens-cell">{row.cacheReadTokens > 0 ? row.cacheReadTokens.toLocaleString() : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="table-footer">
          <span>{days.length} days</span>
        </div>
      </div>
    </div>
  );
}
