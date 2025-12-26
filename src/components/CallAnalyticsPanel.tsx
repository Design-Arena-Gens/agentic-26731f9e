"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { CallMessage } from "./CallSimulator";

export interface CompletedCall {
  transcript: CallMessage[];
  outcome: "success" | "follow-up" | "lost";
  completedAt: number;
}

interface CallAnalyticsPanelProps {
  calls: CompletedCall[];
}

const cardStyle: React.CSSProperties = {
  background: "rgba(9, 24, 30, 0.82)",
  border: "1px solid rgba(116, 242, 206, 0.18)",
  borderRadius: "1.4rem",
  padding: "1.5rem",
  display: "flex",
  flexDirection: "column",
  gap: "1.4rem",
  backdropFilter: "blur(22px)",
  boxShadow: "0 24px 48px rgba(0,0,0,0.25)"
};

export default function CallAnalyticsPanel({ calls }: CallAnalyticsPanelProps) {
  const stats = useMemo(() => {
    if (!calls.length) {
      return {
        conversions: 0,
        followUps: 0,
        losses: 0,
        conversionRate: 0,
        avgTalkRatio: 0,
        topObjections: [] as string[]
      };
    }
    const conversions = calls.filter((call) => call.outcome === "success").length;
    const followUps = calls.filter((call) => call.outcome === "follow-up").length;
    const losses = calls.filter((call) => call.outcome === "lost").length;
    const conversionRate = Math.round((conversions / calls.length) * 100);

    const talkRatios = calls.map((call) => {
      const agentTokens = call.transcript
        .filter((message) => message.role === "agent")
        .reduce((total, message) => total + message.content.split(" ").length, 0);
      const prospectTokens = call.transcript
        .filter((message) => message.role === "prospect")
        .reduce((total, message) => total + message.content.split(" ").length, 0);
      const totalTokens = agentTokens + prospectTokens;
      return totalTokens === 0 ? 0 : Math.round((agentTokens / totalTokens) * 100);
    });

    const avgTalkRatio =
      talkRatios.reduce((total, ratio) => total + ratio, 0) / Math.max(talkRatios.length, 1);

    const objectionCounts = new Map<string, number>();
    calls.forEach((call) => {
      call.transcript
        .filter((message) => message.role === "prospect")
        .forEach((message) => {
          const normalized = message.content.toLowerCase();
          if (normalized.includes("rate") || normalized.includes("interest")) {
            objectionCounts.set("Interest Rate", (objectionCounts.get("Interest Rate") ?? 0) + 1);
          } else if (normalized.includes("think") || normalized.includes("later")) {
            objectionCounts.set("Need More Time", (objectionCounts.get("Need More Time") ?? 0) + 1);
          } else if (normalized.includes("compare") || normalized.includes("other")) {
            objectionCounts.set("Comparing Alternatives", (objectionCounts.get("Comparing Alternatives") ?? 0) + 1);
          } else if (normalized.includes("document")) {
            objectionCounts.set("Documentation", (objectionCounts.get("Documentation") ?? 0) + 1);
          }
        });
    });

    const topObjections = Array.from(objectionCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([label, count]) => `${label} (${count})`);

    return {
      conversions,
      followUps,
      losses,
      conversionRate,
      avgTalkRatio,
      topObjections
    };
  }, [calls]);

  return (
    <motion.section
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      style={cardStyle}
    >
      <div>
        <h2 style={{ margin: 0, fontSize: "1.2rem" }}>Performance Insights</h2>
        <p style={{ margin: "0.4rem 0 0", color: "var(--muted)", fontSize: "0.9rem" }}>
          Track how your Wishfin voice agent is trending across practice calls.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "1rem"
        }}
      >
        <MetricCard label="Conversion Rate" value={`${stats.conversionRate}%`} accent="#74f2ce" />
        <MetricCard label="Won Deals" value={String(stats.conversions)} accent="#0ed2f7" />
        <MetricCard label="Follow Ups" value={String(stats.followUps)} accent="#ffd166" />
        <MetricCard label="Call Talk Ratio" value={`${Math.round(stats.avgTalkRatio)}%`} accent="#f4978e" />
      </div>

      <div
        style={{
          borderRadius: "1.05rem",
          border: "1px solid rgba(255,255,255,0.08)",
          padding: "1.1rem",
          background: "rgba(4, 20, 28, 0.55)",
          display: "flex",
          flexDirection: "column",
          gap: "0.65rem"
        }}
      >
        <h3 style={{ margin: 0, fontSize: "1rem" }}>Top Objections</h3>
        {stats.topObjections.length === 0 ? (
          <p style={{ margin: 0, color: "var(--muted)", fontSize: "0.9rem" }}>
            No objection trends yet. Run more scenarios to capture insights.
          </p>
        ) : (
          stats.topObjections.map((objection) => (
            <span
              key={objection}
              style={{
                background: "rgba(0, 180, 216, 0.12)",
                padding: "0.45rem 0.75rem",
                borderRadius: "0.8rem",
                fontSize: "0.85rem",
                color: "#c4f8ff"
              }}
            >
              {objection}
            </span>
          ))
        )}
      </div>

      <div
        style={{
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "1rem",
          padding: "1rem",
          background: "rgba(2, 16, 22, 0.45)",
          display: "flex",
          flexDirection: "column",
          gap: "0.7rem"
        }}
      >
        <h3 style={{ margin: 0, fontSize: "1rem" }}>Recent Calls</h3>
        {calls.length === 0 && (
          <p style={{ margin: 0, color: "var(--muted)", fontSize: "0.9rem" }}>
            You have not logged any practice calls yet. Play through a scenario to view a recap.
          </p>
        )}
        {calls.slice(-3).map((call, index) => (
          <div
            key={call.completedAt}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "0.75rem 0",
              borderTop: index === 0 ? "none" : "1px solid rgba(255,255,255,0.06)"
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
              <span style={{ fontWeight: 600, letterSpacing: "0.02em" }}>
                {new Date(call.completedAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit"
                })}
              </span>
              <span style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
                {call.transcript.length} exchanges · Outcome {call.outcome}
              </span>
            </div>
            <span
              style={{
                padding: "0.35rem 0.85rem",
                borderRadius: "999px",
                fontSize: "0.8rem",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                background: outcomeBadge(call.outcome).background,
                color: outcomeBadge(call.outcome).color
              }}
            >
              {call.outcome}
            </span>
          </div>
        ))}
      </div>
    </motion.section>
  );
}

function MetricCard({
  label,
  value,
  accent
}: {
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div
      style={{
        borderRadius: "1.1rem",
        background: "rgba(4, 20, 28, 0.65)",
        border: `1px solid ${accent}30`,
        padding: "1rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.35rem"
      }}
    >
      <span
        style={{
          fontSize: "0.75rem",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          color: "var(--muted)",
          fontWeight: 600
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: "1.6rem",
          fontWeight: 700,
          color: accent
        }}
      >
        {value}
      </span>
    </div>
  );
}

function outcomeBadge(outcome: "success" | "follow-up" | "lost") {
  switch (outcome) {
    case "success":
      return { background: "rgba(116, 242, 206, 0.18)", color: "#9ef0d8" };
    case "follow-up":
      return { background: "rgba(255, 205, 86, 0.18)", color: "#ffe09d" };
    case "lost":
    default:
      return { background: "rgba(255, 99, 132, 0.18)", color: "#ffc2d1" };
  }
}
