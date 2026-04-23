import React, { useState } from "react";

const StrategyResult = ({ result, onBack }) => {
  const [tab, setTab] = useState("strategy");

  if (!result) return (
    <div style={styles.page}>
      <p style={{ color: "#fff" }}>No result found.</p>
      <button style={styles.backBtn} onClick={onBack}>← Back</button>
    </div>
  );

  const strategy = result.strategy || {};
  const marketing = result.marketing_plan || {};

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        {/* Header */}
        <div style={styles.topBar}>
          <button style={styles.backBtn} onClick={onBack}>← New Strategy</button>
          <div style={styles.badge}>COMPLETE</div>
        </div>

        <h1 style={styles.title}>Strategy Report</h1>

        {/* Score Banner */}
        <div style={styles.scoreBanner}>
          <ScorePill label="Overall" value={strategy.overall_score} big />
          {strategy.scores && Object.entries(strategy.scores).map(([k, v]) => (
            <ScorePill key={k} label={k.replace(/_/g, " ")} value={v} />
          ))}
        </div>

        {/* Tabs */}
        <div style={styles.tabs}>
          {["strategy", "marketing"].map(t => (
            <button
              key={t}
              style={tab === t ? styles.tabActive : styles.tab}
              onClick={() => setTab(t)}
            >
              {t === "strategy" ? "🧠 Strategy" : "📢 Marketing"}
            </button>
          ))}
        </div>

        {/* Strategy Tab */}
        {tab === "strategy" && (
          <div style={styles.content}>
            <Section title="Summary">
              <p style={styles.summary}>{strategy.summary}</p>
            </Section>

            <div style={styles.grid}>
              <Section title="📡 Channels">
                {strategy.channels?.map((c, i) => (
                  <Tag key={i} text={c} color="#00ff88" />
                ))}
              </Section>

              <Section title="⚡ Actions">
                {strategy.actions?.map((a, i) => (
                  <ListItem key={i} text={a} index={i + 1} />
                ))}
              </Section>
            </div>

            <Section title="💡 Recommendations">
              <div style={styles.recGrid}>
                {strategy.recommendations?.map((r, i) => (
                  <div key={i} style={styles.recCard}>
                    <span style={styles.recNum}>{String(i + 1).padStart(2, "0")}</span>
                    <p style={styles.recText}>{r}</p>
                  </div>
                ))}
              </div>
            </Section>
          </div>
        )}

        {/* Marketing Tab */}
        {tab === "marketing" && (
          <div style={styles.content}>
            <div style={styles.campaignHeader}>
              <div>
                <p style={styles.campaignLabel}>CAMPAIGN TYPE</p>
                <p style={styles.campaignValue}>{marketing.campaign_type || "—"}</p>
              </div>
              <div>
                <p style={styles.campaignLabel}>PRIMARY CHANNEL</p>
                <p style={styles.campaignValue}>{marketing.primary_channel || "—"}</p>
              </div>
            </div>

            <Section title="Campaign Summary">
              <p style={styles.summary}>{marketing.campaign_summary}</p>
            </Section>

            <div style={styles.grid}>
              <Section title="📝 Content Plan">
                {(marketing.content_plan || marketing.content_plan_list || []).map((c, i) => (
                  <ListItem key={i} text={c} index={i + 1} />
                ))}
              </Section>

              <Section title="📧 Email Plan">
                {(marketing.email_plan || marketing.email_plan_list || []).map((e, i) => (
                  <ListItem key={i} text={e} index={i + 1} />
                ))}
              </Section>
            </div>

            <Section title="📅 Weekly Plan">
              <div style={styles.weekGrid}>
                {(marketing.weekly_plan || marketing.weekly_plan_list || []).map((w, i) => (
                  <div key={i} style={styles.weekCard}>
                    <span style={styles.weekLabel}>WEEK {i + 1}</span>
                    <p style={styles.weekText}>{w.replace(/^Week \d+:?\s*/i, "")}</p>
                  </div>
                ))}
              </div>
            </Section>
          </div>
        )}

      </div>
    </div>
  );
};

// ── Sub-components ────────────────────────────────────────────────────────────

const Section = ({ title, children }) => (
  <div style={styles.section}>
    <h3 style={styles.sectionTitle}>{title}</h3>
    <div>{children}</div>
  </div>
);

const ScorePill = ({ label, value, big }) => {
  const color = value >= 80 ? "#00ff88" : value >= 65 ? "#ffcc00" : "#ff6644";
  return (
    <div style={{ ...styles.scorePill, borderColor: color + "44" }}>
      <span style={{ ...styles.scoreNum, color, fontSize: big ? "28px" : "20px" }}>{value}</span>
      <span style={styles.scoreLabel}>{label}</span>
    </div>
  );
};

const Tag = ({ text, color }) => (
  <span style={{ ...styles.tag, color, borderColor: color + "44", background: color + "11" }}>
    {text}
  </span>
);

const ListItem = ({ text, index }) => (
  <div style={styles.listItem}>
    <span style={styles.listNum}>{index}</span>
    <span style={styles.listText}>{text}</span>
  </div>
);

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = {
  page: {
    minHeight: "100vh",
    background: "#0a0a0a",
    fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
    padding: "40px 20px",
  },
  container: { maxWidth: "860px", margin: "0 auto" },
  topBar: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" },
  backBtn: {
    background: "transparent",
    border: "1px solid #333",
    color: "#888",
    padding: "8px 16px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "12px",
    fontFamily: "inherit",
  },
  badge: {
    background: "#00ff8822",
    color: "#00ff88",
    border: "1px solid #00ff8844",
    borderRadius: "4px",
    padding: "4px 10px",
    fontSize: "11px",
    letterSpacing: "2px",
  },
  title: { color: "#fff", fontSize: "28px", fontWeight: "700", margin: "0 0 24px 0" },
  scoreBanner: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
    marginBottom: "28px",
    padding: "20px",
    background: "#111",
    border: "1px solid #222",
    borderRadius: "10px",
  },
  scorePill: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "10px 16px",
    border: "1px solid #333",
    borderRadius: "8px",
    minWidth: "80px",
  },
  scoreNum: { fontWeight: "700", lineHeight: 1 },
  scoreLabel: { color: "#555", fontSize: "9px", letterSpacing: "1px", marginTop: "4px", textTransform: "uppercase" },
  tabs: { display: "flex", gap: "8px", marginBottom: "24px" },
  tab: {
    padding: "10px 20px",
    background: "transparent",
    border: "1px solid #222",
    borderRadius: "6px",
    color: "#555",
    cursor: "pointer",
    fontSize: "13px",
    fontFamily: "inherit",
  },
  tabActive: {
    padding: "10px 20px",
    background: "#111",
    border: "1px solid #00ff8844",
    borderRadius: "6px",
    color: "#00ff88",
    cursor: "pointer",
    fontSize: "13px",
    fontFamily: "inherit",
  },
  content: { display: "flex", flexDirection: "column", gap: "20px" },
  section: {
    background: "#111",
    border: "1px solid #1e1e1e",
    borderRadius: "10px",
    padding: "20px",
  },
  sectionTitle: { color: "#fff", fontSize: "13px", fontWeight: "600", margin: "0 0 14px 0", letterSpacing: "0.5px" },
  summary: { color: "#aaa", fontSize: "14px", lineHeight: "1.7", margin: 0 },
  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" },
  tag: {
    display: "inline-block",
    padding: "6px 12px",
    borderRadius: "4px",
    border: "1px solid",
    fontSize: "12px",
    marginRight: "8px",
    marginBottom: "8px",
  },
  listItem: { display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: "10px" },
  listNum: {
    background: "#1a1a1a",
    color: "#00ff88",
    minWidth: "22px",
    height: "22px",
    borderRadius: "4px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "11px",
    fontWeight: "700",
    flexShrink: 0,
  },
  listText: { color: "#bbb", fontSize: "13px", lineHeight: "1.5" },
  recGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" },
  recCard: {
    background: "#0d0d0d",
    border: "1px solid #1a1a1a",
    borderRadius: "8px",
    padding: "14px",
  },
  recNum: { color: "#333", fontSize: "24px", fontWeight: "700", display: "block", marginBottom: "6px" },
  recText: { color: "#aaa", fontSize: "12px", lineHeight: "1.6", margin: 0 },
  campaignHeader: {
    display: "flex",
    gap: "24px",
    padding: "16px 20px",
    background: "#111",
    border: "1px solid #1e1e1e",
    borderRadius: "10px",
  },
  campaignLabel: { color: "#444", fontSize: "10px", letterSpacing: "2px", margin: "0 0 4px" },
  campaignValue: { color: "#00ff88", fontSize: "14px", fontWeight: "600", margin: 0 },
  weekGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" },
  weekCard: {
    background: "#0d0d0d",
    border: "1px solid #1a1a1a",
    borderRadius: "8px",
    padding: "14px",
  },
  weekLabel: { color: "#444", fontSize: "10px", letterSpacing: "2px", display: "block", marginBottom: "6px" },
  weekText: { color: "#bbb", fontSize: "12px", lineHeight: "1.5", margin: 0 },
};

export default StrategyResult;