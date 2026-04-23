import React, { useState, useEffect } from "react";

const API = "http://localhost:8001";

// ── Auth helpers ──────────────────────────────────────────────────────────────
const getToken = () => localStorage.getItem("token");
const getUser = () => {
  try { return JSON.parse(localStorage.getItem("user")); } catch { return null; }
};
const authHeaders = () => ({
  "Content-Type": "application/json",
  "Authorization": `Bearer ${getToken()}`
});

const apiFetch = async (path, options = {}) => {
  const res = await fetch(API + path, options);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Error ${res.status}`);
  }
  return res.json();
};

// ══════════════════════════════════════════════════════════════════════════════
// MAIN APP
// ══════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [user, setUser] = useState(getUser());
  const [view, setView] = useState("dashboard");
  const [result, setResult] = useState(null);
  const [activeStrategyId, setActiveStrategyId] = useState(null);

  const handleLogin = (userData) => {
    setUser(userData);
    setView("dashboard");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  if (!user) return <AuthPage onLogin={handleLogin} />;

  return (
    <div style={s.app}>
      <Navbar user={user} onLogout={handleLogout} onNav={setView} currentView={view} />
      <div style={s.main}>
        {view === "dashboard" && (
          <Dashboard
            user={user}
            onNewPlan={() => setView("form")}
            onWeeklyUpdate={(id) => { setActiveStrategyId(id); setView("weekly"); }}
            onViewResult={(r) => { setResult(r); setView("result"); }}
          />
        )}
        {view === "form" && (
          <GoalForm
            onResult={(data) => { setResult(data); setView("result"); }}
            onBack={() => setView("dashboard")}
          />
        )}
        {view === "result" && (
          <StrategyResult
            result={result}
            onBack={() => setView("dashboard")}
            onWeeklyUpdate={(id) => { setActiveStrategyId(id); setView("weekly"); }}
          />
        )}
        {view === "weekly" && (
          <WeeklyUpdateForm
            strategyId={activeStrategyId}
            onBack={() => setView("dashboard")}
            onDone={() => setView("dashboard")}
          />
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// AUTH PAGE
// ══════════════════════════════════════════════════════════════════════════════
function AuthPage({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ email: "", name: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async () => {
    if (!form.email || !form.password) { setError("Please fill in all fields."); return; }
    if (mode === "register" && !form.name) { setError("Please enter your name."); return; }
    setError(""); setLoading(true);
    try {
      const path = mode === "login" ? "/auth/login" : "/auth/register";
      const body = mode === "login"
        ? { email: form.email, password: form.password }
        : { email: form.email, name: form.name, password: form.password };
      const data = await apiFetch(path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user", JSON.stringify({ id: data.user_id, name: data.name, email: data.email }));
      onLogin({ id: data.user_id, name: data.name, email: data.email });
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  const handleKey = (e) => { if (e.key === "Enter") submit(); };

  return (
    <div style={s.authPage}>
      <div style={s.authCard}>
        <div style={s.authBadge}>AI POWERED</div>
        <h1 style={s.authTitle}>Autonomous Business<br />Operator AI</h1>
        <p style={s.authSub}>Multi-agent AI · RAG Memory · Weekly refinement</p>

        <div style={s.authTabs}>
          {["login", "register"].map(m => (
            <button key={m} style={mode === m ? s.authTabActive : s.authTab}
              onClick={() => { setMode(m); setError(""); }}>
              {m === "login" ? "Sign In" : "Create Account"}
            </button>
          ))}
        </div>

        {mode === "register" && (
          <div style={{ marginBottom: 14 }}>
            <label style={s.fieldLabel}>YOUR NAME</label>
            <input name="name" placeholder="e.g. Alex" value={form.name}
              onChange={handle} onKeyDown={handleKey} style={s.input}
              onFocus={e => e.target.style.borderColor = "#00ff88"}
              onBlur={e => e.target.style.borderColor = "#222"} />
          </div>
        )}
        <div style={{ marginBottom: 14 }}>
          <label style={s.fieldLabel}>EMAIL</label>
          <input name="email" type="email" placeholder="you@example.com" value={form.email}
            onChange={handle} onKeyDown={handleKey} style={s.input}
            onFocus={e => e.target.style.borderColor = "#00ff88"}
            onBlur={e => e.target.style.borderColor = "#222"} />
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={s.fieldLabel}>PASSWORD</label>
          <input name="password" type="password" placeholder="••••••••" value={form.password}
            onChange={handle} onKeyDown={handleKey} style={s.input}
            onFocus={e => e.target.style.borderColor = "#00ff88"}
            onBlur={e => e.target.style.borderColor = "#222"} />
        </div>

        {error && <p style={s.error}>{error}</p>}

        <button style={loading ? { ...s.btnGreen, opacity: 0.6, cursor: "not-allowed" } : s.btnGreen}
          onClick={submit} disabled={loading}>
          {loading ? "Please wait..." : mode === "login" ? "→ Sign In" : "→ Create Account"}
        </button>

        <p style={s.authFooter}>
          {mode === "login" ? "No account? " : "Already have one? "}
          <span style={{ color: "#00ff88", cursor: "pointer" }}
            onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}>
            {mode === "login" ? "Create one" : "Sign in"}
          </span>
        </p>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// NAVBAR
// ══════════════════════════════════════════════════════════════════════════════
function Navbar({ user, onLogout, onNav, currentView }) {
  return (
    <div style={s.navbar}>
      <span style={s.navLogo} onClick={() => onNav("dashboard")}>⚡ BizAI</span>
      <div style={s.navLinks}>
        <NavBtn label="Dashboard" view="dashboard" current={currentView} onClick={onNav} />
        <NavBtn label="New Plan" view="form" current={currentView} onClick={onNav} />
      </div>
      <div style={s.navRight}>
        <span style={s.navUser}>{user.name}</span>
        <button style={s.navLogout} onClick={onLogout}>Logout</button>
      </div>
    </div>
  );
}

const NavBtn = ({ label, view, current, onClick }) => (
  <button style={current === view ? s.navLinkActive : s.navLink} onClick={() => onClick(view)}>
    {label}
  </button>
);

// ══════════════════════════════════════════════════════════════════════════════
// DASHBOARD
// ══════════════════════════════════════════════════════════════════════════════
function Dashboard({ user, onNewPlan, onWeeklyUpdate, onViewResult }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch("/history", { headers: authHeaders() })
      .then(setHistory)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={s.page}>
      <div style={s.pageHeader}>
        <div>
          <h1 style={s.pageTitle}>Welcome back, {user.name} 👋</h1>
          <p style={s.pageSub}>Your AI-powered business growth dashboard</p>
        </div>
        <button style={s.btnGreen} onClick={onNewPlan}>+ New Strategy</button>
      </div>

      {loading && <p style={s.muted}>Loading your strategies...</p>}
      {error && <p style={s.error}>{error}</p>}

      {!loading && history.length === 0 && (
        <div style={s.emptyState}>
          <p style={s.emptyIcon}>🚀</p>
          <h3 style={s.emptyTitle}>No strategies yet</h3>
          <p style={s.emptySub}>Generate your first AI-powered business strategy to get started</p>
          <button style={s.btnGreen} onClick={onNewPlan}>Generate First Strategy</button>
        </div>
      )}

      {!loading && history.length > 0 && (
        <>
          {/* Stats row */}
          <div style={s.statsRow}>
            <StatCard label="Total Strategies" value={history.length} />
            <StatCard label="Avg Score" value={Math.round(history.reduce((a, b) => a + b.overall_score, 0) / history.length)} />
            <StatCard label="Best Score" value={Math.max(...history.map(h => h.overall_score))} />
          </div>

          <h2 style={s.sectionHeading}>Your Strategies</h2>
          <div style={s.cardGrid}>
            {history.map(item => (
              <div key={item.id} style={s.historyCard}>
                <div style={s.historyCardTop}>
                  <span style={s.historyBiz}>{item.business_type}</span>
                  <span style={{
                    ...s.scoreBadge,
                    color: item.overall_score >= 80 ? "#00ff88" : item.overall_score >= 65 ? "#ffcc00" : "#ff6644"
                  }}>{item.overall_score}</span>
                </div>
                <p style={s.historyGoal}>{item.goal}</p>
                <p style={s.historySummary}>{item.summary?.slice(0, 100)}...</p>
                <div style={s.historyTags}>
                  {item.channels?.slice(0, 2).map((c, i) => (
                    <span key={i} style={s.miniTag}>{c}</span>
                  ))}
                </div>
                <div style={s.historyActions}>
                  <button style={s.btnSmall}
                    onClick={() => onViewResult({ strategy: item, marketing_plan: {}, strategy_id: item.id })}>
                    View
                  </button>
                  <button style={s.btnSmallGreen} onClick={() => onWeeklyUpdate(item.id)}>
                    Weekly Update →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

const StatCard = ({ label, value }) => (
  <div style={s.statCard}>
    <span style={s.statValue}>{value}</span>
    <span style={s.statLabel}>{label}</span>
  </div>
);

// ══════════════════════════════════════════════════════════════════════════════
// GOAL FORM
// ══════════════════════════════════════════════════════════════════════════════
function GoalForm({ onResult, onBack }) {
  const [form, setForm] = useState({ goal: "", business_type: "", target_audience: "", budget: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async () => {
    if (!form.goal || !form.business_type || !form.target_audience || !form.budget) {
      setError("Please fill in all fields."); return;
    }
    setError(""); setLoading(true);
    try {
      const data = await apiFetch("/submit-goal", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ ...form, budget: parseFloat(form.budget) })
      });
      onResult(data);
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  return (
    <div style={s.page}>
      <button style={s.backBtn} onClick={onBack}>← Back</button>
      <h1 style={s.pageTitle}>New Strategy</h1>
      <p style={s.pageSub}>AI agents will generate a strategy + marketing plan tailored to your business</p>

      <div style={s.formCard}>
        <div style={s.terminalBar}>
          <span style={s.dot1}/><span style={s.dot2}/><span style={s.dot3}/>
          <span style={s.terminalTitle}>submit_goal.json</span>
        </div>
        <div style={{ padding: 24 }}>
          {[
            { label: "GOAL", name: "goal", placeholder: "e.g. Increase monthly revenue by 30%" },
            { label: "BUSINESS TYPE", name: "business_type", placeholder: "e.g. Coffee Shop, SaaS, E-commerce" },
            { label: "TARGET AUDIENCE", name: "target_audience", placeholder: "e.g. Young professionals aged 22-35" },
            { label: "BUDGET ($)", name: "budget", placeholder: "e.g. 5000", type: "number" },
          ].map(f => (
            <div key={f.name} style={{ marginBottom: 20 }}>
              <label style={s.fieldLabel}>{f.label}</label>
              <input name={f.name} type={f.type || "text"} placeholder={f.placeholder}
                value={form[f.name]} onChange={handle} style={s.input}
                onFocus={e => e.target.style.borderColor = "#00ff88"}
                onBlur={e => e.target.style.borderColor = "#222"} />
            </div>
          ))}

          {error && <p style={s.error}>{error}</p>}

          <button style={loading ? s.btnDim : s.btnGreen} onClick={submit} disabled={loading}>
            {loading ? "⟳ Generating — takes 1-3 minutes..." : "→ Generate Strategy"}
          </button>

          {loading && (
            <p style={s.loadingNote}>
              🤖 Strategy Agent is thinking...<br />
              📢 Marketing Agent will follow...<br />
              💾 Results saved to RAG memory for future improvement
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// STRATEGY RESULT
// ══════════════════════════════════════════════════════════════════════════════
function StrategyResult({ result, onBack, onWeeklyUpdate }) {
  const [tab, setTab] = useState("strategy");
  const strategy = result?.strategy || {};
  const marketing = result?.marketing_plan || {};
  const strategyId = result?.strategy_id;

  return (
    <div style={s.page}>
      <div style={s.pageHeader}>
        <button style={s.backBtn} onClick={onBack}>← Dashboard</button>
        {strategyId && (
          <button style={s.btnSmallGreen} onClick={() => onWeeklyUpdate(strategyId)}>
            Submit Weekly Update →
          </button>
        )}
      </div>

      <h1 style={s.pageTitle}>Strategy Report</h1>

      {/* Score Banner */}
      <div style={s.scoreBar}>
        <ScorePill label="Overall" value={strategy.overall_score} big />
        {strategy.scores && Object.entries(strategy.scores).map(([k, v]) => (
          <ScorePill key={k} label={k.replace(/_/g, " ")} value={v} />
        ))}
      </div>

      {/* Tabs */}
      <div style={s.tabRow}>
        {["strategy", "marketing"].map(t => (
          <button key={t} style={tab === t ? s.tabActive : s.tab} onClick={() => setTab(t)}>
            {t === "strategy" ? "🧠 Strategy" : "📢 Marketing"}
          </button>
        ))}
      </div>

      {tab === "strategy" && (
        <div style={s.sections}>
          <Section title="Summary">
            <p style={s.bodyText}>{strategy.summary}</p>
          </Section>
          <div style={s.twoCol}>
            <Section title="📡 Channels">
              {strategy.channels?.map((c, i) => <Tag key={i} text={c} />)}
            </Section>
            <Section title="⚡ Actions">
              {strategy.actions?.map((a, i) => <ListItem key={i} n={i + 1} text={a} />)}
            </Section>
          </div>
          <Section title="💡 Recommendations">
            <div style={s.recGrid}>
              {strategy.recommendations?.map((r, i) => (
                <div key={i} style={s.recCard}>
                  <span style={s.recNum}>{String(i + 1).padStart(2, "0")}</span>
                  <p style={s.recText}>{r}</p>
                </div>
              ))}
            </div>
          </Section>
        </div>
      )}

      {tab === "marketing" && (
        <div style={s.sections}>
          <div style={s.campaignMeta}>
            <MetaItem label="Campaign Type" value={marketing.campaign_type} />
            <MetaItem label="Primary Channel" value={marketing.primary_channel} />
          </div>
          <Section title="Summary">
            <p style={s.bodyText}>{marketing.campaign_summary}</p>
          </Section>
          <div style={s.twoCol}>
            <Section title="📝 Content Plan">
              {(marketing.content_plan || []).map((c, i) => <ListItem key={i} n={i + 1} text={c} />)}
            </Section>
            <Section title="📧 Email Plan">
              {(marketing.email_plan || []).map((e, i) => <ListItem key={i} n={i + 1} text={e} />)}
            </Section>
          </div>
          <Section title="📅 Weekly Plan">
            <div style={s.weekGrid}>
              {(marketing.weekly_plan || []).map((w, i) => (
                <div key={i} style={s.weekCard}>
                  <span style={s.weekLabel}>WEEK {i + 1}</span>
                  <p style={s.weekText}>{w.replace(/^Week \d+:?\s*/i, "")}</p>
                </div>
              ))}
            </div>
          </Section>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// WEEKLY UPDATE FORM
// ══════════════════════════════════════════════════════════════════════════════
function WeeklyUpdateForm({ strategyId, onBack, onDone }) {
  const [form, setForm] = useState({
    week_number: 1,
    update_text: "",
    leads_generated: 0,
    revenue_change: 0,
    top_channel: "",
    send_email: false,
    sender_email: "",
    sender_app_password: "",
    recipient_email: "",
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handle = (e) => {
    const val = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm({ ...form, [e.target.name]: val });
  };

  const submit = async () => {
    if (!form.update_text) { setError("Please describe what happened this week."); return; }
    if (form.send_email && (!form.sender_email || !form.sender_app_password || !form.recipient_email)) {
      setError("To send email, please fill in all three email fields."); return;
    }
    setError(""); setLoading(true);
    try {
      const data = await apiFetch("/weekly-update", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          strategy_id: strategyId,
          week_number: parseInt(form.week_number),
          update_text: form.update_text,
          leads_generated: parseInt(form.leads_generated) || 0,
          revenue_change: parseFloat(form.revenue_change) || 0,
          top_channel: form.top_channel,
          send_email: form.send_email,
          sender_email: form.send_email ? form.sender_email : null,
          sender_app_password: form.send_email ? form.sender_app_password : null,
          recipient_email: form.send_email ? form.recipient_email : null,
        })
      });
      setResult(data);
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  if (result) return (
    <div style={s.page}>
      <div style={s.successCard}>
        <p style={s.successIcon}>✅</p>
        <h2 style={s.successTitle}>Week {result.week_number} Update Saved!</h2>
        <p style={s.successSub}>
          Your refined plan has been generated by AI.
          {form.send_email && ` Email sent to ${form.recipient_email}.`}
        </p>
        <div style={s.refinedPlan}>
          <h3 style={s.refinedTitle}>AI REFINED PLAN FOR NEXT WEEK</h3>
          <p style={s.bodyText}>{result.refined_summary}</p>
        </div>
        <button style={s.btnGreen} onClick={onDone}>← Back to Dashboard</button>
      </div>
    </div>
  );

  return (
    <div style={s.page}>
      <button style={s.backBtn} onClick={onBack}>← Back</button>
      <h1 style={s.pageTitle}>Weekly Update</h1>
      <p style={s.pageSub}>Tell us how this week went. AI will generate a refined plan for next week.</p>

      <div style={s.formCard}>
        <div style={s.terminalBar}>
          <span style={s.dot1}/><span style={s.dot2}/><span style={s.dot3}/>
          <span style={s.terminalTitle}>weekly_update.json</span>
        </div>
        <div style={{ padding: 24 }}>

          <div style={{ marginBottom: 20 }}>
            <label style={s.fieldLabel}>WEEK NUMBER</label>
            <input name="week_number" type="number" min="1" max="52"
              value={form.week_number} onChange={handle}
              style={{ ...s.input, width: 100 }} />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={s.fieldLabel}>WHAT HAPPENED THIS WEEK? *</label>
            <textarea name="update_text"
              placeholder="e.g. Launched Instagram campaign, got 45 leads, email open rate was 32%, SEO is slow to pick up..."
              value={form.update_text} onChange={handle}
              style={{ ...s.input, height: 110, resize: "vertical" }} />
          </div>

          <div style={s.metricsRow}>
            <div style={{ flex: 1 }}>
              <label style={s.fieldLabel}>LEADS GENERATED</label>
              <input name="leads_generated" type="number" placeholder="0"
                value={form.leads_generated} onChange={handle} style={s.input} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={s.fieldLabel}>REVENUE CHANGE (%)</label>
              <input name="revenue_change" type="number" placeholder="0"
                value={form.revenue_change} onChange={handle} style={s.input} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={s.fieldLabel}>TOP CHANNEL</label>
              <input name="top_channel" placeholder="e.g. Instagram"
                value={form.top_channel} onChange={handle} style={s.input} />
            </div>
          </div>

          {/* Email toggle */}
          <div style={s.emailToggle}>
            <label style={s.toggleRow}>
              <input type="checkbox" name="send_email"
                checked={form.send_email} onChange={handle}
                style={{ marginRight: 10, accentColor: "#00ff88" }} />
              <span style={{ color: "#ccc", fontSize: 13 }}>
                Send refined plan to my email
              </span>
              <span style={s.optionalBadge}>OPTIONAL</span>
            </label>
          </div>

          {/* Email fields */}
          {form.send_email && (
            <div style={s.emailSection}>
              <p style={s.emailNote}>
                📧 Requires a{" "}
                <a href="https://myaccount.google.com/apppasswords" target="_blank"
                  rel="noreferrer" style={{ color: "#00ff88" }}>
                  Gmail App Password
                </a>
                {" "}— not your regular Gmail password.
                Go to Google Account → Security → 2-Step Verification → App Passwords → Generate one for "Mail".
              </p>
              <div style={{ marginBottom: 14 }}>
                <label style={s.fieldLabel}>YOUR GMAIL ADDRESS (sends from)</label>
                <input name="sender_email" type="email" placeholder="your@gmail.com"
                  value={form.sender_email} onChange={handle} style={s.input}
                  onFocus={e => e.target.style.borderColor = "#00ff88"}
                  onBlur={e => e.target.style.borderColor = "#222"} />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={s.fieldLabel}>GMAIL APP PASSWORD</label>
                <input name="sender_app_password" type="password"
                  placeholder="16-character app password"
                  value={form.sender_app_password} onChange={handle} style={s.input}
                  onFocus={e => e.target.style.borderColor = "#00ff88"}
                  onBlur={e => e.target.style.borderColor = "#222"} />
              </div>
              <div>
                <label style={s.fieldLabel}>SEND TO (recipient email)</label>
                <input name="recipient_email" type="email"
                  placeholder="can be same as above or different"
                  value={form.recipient_email} onChange={handle} style={s.input}
                  onFocus={e => e.target.style.borderColor = "#00ff88"}
                  onBlur={e => e.target.style.borderColor = "#222"} />
              </div>
            </div>
          )}

          {error && <p style={s.error}>{error}</p>}

          <button style={loading ? s.btnDim : s.btnGreen}
            onClick={submit} disabled={loading}>
            {loading
              ? "⟳ AI is refining your plan..."
              : form.send_email
                ? "→ Submit Update & Send Email"
                : "→ Submit Update & Get Refined Plan"}
          </button>

          {loading && (
            <p style={s.loadingNote}>
              🤖 Analysing your week...<br />
              💡 Generating refined plan via llama3.2...<br />
              💾 Storing to RAG memory...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// SHARED SUB-COMPONENTS
// ══════════════════════════════════════════════════════════════════════════════
const Section = ({ title, children }) => (
  <div style={s.section}>
    <h3 style={s.sectionTitle}>{title}</h3>
    <div>{children}</div>
  </div>
);

const ScorePill = ({ label, value, big }) => {
  const color = !value ? "#444" : value >= 80 ? "#00ff88" : value >= 65 ? "#ffcc00" : "#ff6644";
  return (
    <div style={{ ...s.scorePill, borderColor: color + "44" }}>
      <span style={{ color, fontSize: big ? 26 : 18, fontWeight: 700 }}>{value ?? "—"}</span>
      <span style={s.scoreLabel}>{label}</span>
    </div>
  );
};

const Tag = ({ text }) => <span style={s.tag}>{text}</span>;

const ListItem = ({ n, text }) => (
  <div style={s.listItem}>
    <span style={s.listNum}>{n}</span>
    <span style={s.listText}>{text}</span>
  </div>
);

const MetaItem = ({ label, value }) => (
  <div>
    <p style={s.metaLabel}>{label}</p>
    <p style={s.metaValue}>{value || "—"}</p>
  </div>
);

// ══════════════════════════════════════════════════════════════════════════════
// STYLES
// ══════════════════════════════════════════════════════════════════════════════
const s = {
  app: { minHeight: "100vh", background: "#0a0a0a", fontFamily: "'IBM Plex Mono','Courier New',monospace" },
  main: { maxWidth: 920, margin: "0 auto", padding: "0 20px 60px" },

  // Auth
  authPage: { minHeight: "100vh", background: "#0a0a0a", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 },
  authCard: { width: "100%", maxWidth: 440, background: "#111", border: "1px solid #1e1e1e", borderRadius: 12, padding: 36 },
  authBadge: { display: "inline-block", background: "#00ff8811", color: "#00ff88", border: "1px solid #00ff8833", borderRadius: 4, padding: "3px 10px", fontSize: 10, letterSpacing: 2, marginBottom: 16 },
  authTitle: { color: "#fff", fontSize: 26, fontWeight: 700, margin: "0 0 8px", lineHeight: 1.2 },
  authSub: { color: "#444", fontSize: 12, margin: "0 0 28px", letterSpacing: 0.5 },
  authTabs: { display: "flex", gap: 8, marginBottom: 24 },
  authTab: { flex: 1, padding: 10, background: "transparent", border: "1px solid #1e1e1e", borderRadius: 6, color: "#555", cursor: "pointer", fontSize: 12, fontFamily: "inherit" },
  authTabActive: { flex: 1, padding: 10, background: "#0d0d0d", border: "1px solid #00ff8844", borderRadius: 6, color: "#00ff88", cursor: "pointer", fontSize: 12, fontFamily: "inherit" },
  authFooter: { color: "#333", fontSize: 12, textAlign: "center", marginTop: 20 },

  // Navbar
  navbar: { background: "#0d0d0d", borderBottom: "1px solid #161616", padding: "0 24px", height: 50, display: "flex", alignItems: "center", gap: 20, position: "sticky", top: 0, zIndex: 100 },
  navLogo: { color: "#00ff88", fontWeight: 700, fontSize: 14, cursor: "pointer", letterSpacing: 1, marginRight: 8 },
  navLinks: { display: "flex", gap: 4, flex: 1 },
  navLink: { background: "transparent", border: "none", color: "#444", fontSize: 12, cursor: "pointer", padding: "6px 10px", borderRadius: 4, fontFamily: "inherit" },
  navLinkActive: { background: "#161616", border: "none", color: "#00ff88", fontSize: 12, cursor: "pointer", padding: "6px 10px", borderRadius: 4, fontFamily: "inherit" },
  navRight: { display: "flex", alignItems: "center", gap: 12 },
  navUser: { color: "#333", fontSize: 11 },
  navLogout: { background: "transparent", border: "1px solid #1e1e1e", color: "#444", fontSize: 11, padding: "4px 10px", borderRadius: 4, cursor: "pointer", fontFamily: "inherit" },

  // Pages
  page: { padding: "28px 0" },
  pageHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 12 },
  pageTitle: { color: "#fff", fontSize: 24, fontWeight: 700, margin: "0 0 4px" },
  pageSub: { color: "#444", fontSize: 12, margin: 0 },
  muted: { color: "#333", fontSize: 12 },
  sectionHeading: { color: "#666", fontSize: 11, letterSpacing: 2, margin: "28px 0 14px", fontWeight: 600 },

  // Stats
  statsRow: { display: "flex", gap: 12, marginBottom: 28 },
  statCard: { flex: 1, background: "#111", border: "1px solid #1a1a1a", borderRadius: 8, padding: "16px 20px", display: "flex", flexDirection: "column", gap: 4 },
  statValue: { color: "#00ff88", fontSize: 28, fontWeight: 700 },
  statLabel: { color: "#444", fontSize: 10, letterSpacing: 1 },

  // Dashboard cards
  emptyState: { textAlign: "center", padding: "60px 20px", background: "#111", border: "1px solid #1a1a1a", borderRadius: 12 },
  emptyIcon: { fontSize: 36, margin: "0 0 12px" },
  emptyTitle: { color: "#fff", fontSize: 16, fontWeight: 700, margin: "0 0 8px" },
  emptySub: { color: "#444", fontSize: 12, margin: "0 0 20px", lineHeight: 1.6 },
  cardGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))", gap: 14 },
  historyCard: { background: "#111", border: "1px solid #1a1a1a", borderRadius: 10, padding: 18 },
  historyCardTop: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  historyBiz: { color: "#00ff88", fontSize: 11, fontWeight: 600, letterSpacing: 0.5 },
  scoreBadge: { fontSize: 20, fontWeight: 700 },
  historyGoal: { color: "#ddd", fontSize: 13, margin: "0 0 6px", lineHeight: 1.4, fontWeight: 600 },
  historySummary: { color: "#444", fontSize: 11, lineHeight: 1.6, margin: "0 0 12px" },
  historyTags: { display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 },
  miniTag: { background: "#00ff8811", color: "#00ff88", border: "1px solid #00ff8822", borderRadius: 3, padding: "2px 8px", fontSize: 10 },
  historyActions: { display: "flex", gap: 8 },

  // Form
  formCard: { background: "#111", border: "1px solid #1a1a1a", borderRadius: 10, overflow: "hidden", maxWidth: 580 },
  terminalBar: { background: "#0d0d0d", borderBottom: "1px solid #1a1a1a", padding: "10px 16px", display: "flex", alignItems: "center", gap: 6 },
  dot1: { width: 10, height: 10, borderRadius: "50%", background: "#ff5f57", display: "inline-block" },
  dot2: { width: 10, height: 10, borderRadius: "50%", background: "#febc2e", display: "inline-block" },
  dot3: { width: 10, height: 10, borderRadius: "50%", background: "#28c840", display: "inline-block" },
  terminalTitle: { color: "#2a2a2a", fontSize: 11, marginLeft: 8 },
  fieldLabel: { display: "block", color: "#00ff88", fontSize: 10, letterSpacing: 2, marginBottom: 6, fontWeight: 600 },
  input: { width: "100%", background: "#0a0a0a", border: "1px solid #222", borderRadius: 6, padding: "10px 12px", color: "#fff", fontSize: 13, outline: "none", fontFamily: "inherit", boxSizing: "border-box", transition: "border-color 0.2s" },
  loadingNote: { color: "#333", fontSize: 11, lineHeight: 2, textAlign: "center", marginTop: 14 },
  metricsRow: { display: "flex", gap: 12, marginBottom: 20 },

  // Email
  emailToggle: { margin: "4px 0 16px", padding: "12px 14px", background: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: 6 },
  toggleRow: { display: "flex", alignItems: "center", cursor: "pointer" },
  optionalBadge: { marginLeft: "auto", background: "#1a1a1a", color: "#333", fontSize: 9, letterSpacing: 2, padding: "2px 8px", borderRadius: 3 },
  emailSection: { background: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: 8, padding: 18, marginBottom: 20 },
  emailNote: { color: "#444", fontSize: 11, lineHeight: 1.8, margin: "0 0 16px" },

  // Results
  scoreBar: { display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 22, padding: 18, background: "#111", border: "1px solid #1a1a1a", borderRadius: 10 },
  scorePill: { display: "flex", flexDirection: "column", alignItems: "center", padding: "8px 14px", border: "1px solid #1a1a1a", borderRadius: 8, minWidth: 70 },
  scoreLabel: { color: "#333", fontSize: 9, letterSpacing: 1, marginTop: 4, textTransform: "uppercase" },
  tabRow: { display: "flex", gap: 8, marginBottom: 18 },
  tab: { padding: "8px 18px", background: "transparent", border: "1px solid #1a1a1a", borderRadius: 6, color: "#444", cursor: "pointer", fontSize: 12, fontFamily: "inherit" },
  tabActive: { padding: "8px 18px", background: "#0d0d0d", border: "1px solid #00ff8833", borderRadius: 6, color: "#00ff88", cursor: "pointer", fontSize: 12, fontFamily: "inherit" },
  sections: { display: "flex", flexDirection: "column", gap: 14 },
  section: { background: "#111", border: "1px solid #1a1a1a", borderRadius: 10, padding: 20 },
  sectionTitle: { color: "#888", fontSize: 11, fontWeight: 600, margin: "0 0 14px", letterSpacing: 0.5 },
  twoCol: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 },
  bodyText: { color: "#999", fontSize: 13, lineHeight: 1.7, margin: 0 },
  tag: { display: "inline-block", background: "#00ff8811", color: "#00ff88", border: "1px solid #00ff8822", borderRadius: 4, padding: "4px 10px", fontSize: 11, marginRight: 6, marginBottom: 6 },
  listItem: { display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 10 },
  listNum: { background: "#161616", color: "#00ff88", minWidth: 20, height: 20, borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, flexShrink: 0 },
  listText: { color: "#bbb", fontSize: 12, lineHeight: 1.5 },
  recGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 },
  recCard: { background: "#0d0d0d", border: "1px solid #161616", borderRadius: 8, padding: 14 },
  recNum: { color: "#1e1e1e", fontSize: 22, fontWeight: 700, display: "block", marginBottom: 6 },
  recText: { color: "#888", fontSize: 12, lineHeight: 1.5, margin: 0 },
  campaignMeta: { display: "flex", gap: 24, padding: "14px 20px", background: "#111", border: "1px solid #1a1a1a", borderRadius: 10 },
  metaLabel: { color: "#333", fontSize: 9, letterSpacing: 2, margin: "0 0 4px" },
  metaValue: { color: "#00ff88", fontSize: 13, fontWeight: 600, margin: 0 },
  weekGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 },
  weekCard: { background: "#0d0d0d", border: "1px solid #161616", borderRadius: 8, padding: 14 },
  weekLabel: { color: "#2a2a2a", fontSize: 9, letterSpacing: 2, display: "block", marginBottom: 6 },
  weekText: { color: "#888", fontSize: 12, lineHeight: 1.5, margin: 0 },

  // Weekly success
  successCard: { maxWidth: 520, background: "#111", border: "1px solid #1a1a1a", borderRadius: 12, padding: 36, textAlign: "center" },
  successIcon: { fontSize: 36, margin: "0 0 12px" },
  successTitle: { color: "#fff", fontSize: 20, fontWeight: 700, margin: "0 0 8px" },
  successSub: { color: "#555", fontSize: 12, margin: "0 0 24px", lineHeight: 1.6 },
  refinedPlan: { background: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: 8, padding: 20, marginBottom: 24, textAlign: "left" },
  refinedTitle: { color: "#00ff88", fontSize: 10, letterSpacing: 2, margin: "0 0 10px" },

  // Buttons
  btnGreen: { background: "#00ff88", color: "#000", border: "none", borderRadius: 6, padding: "10px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", width: "100%" },
  btnDim: { background: "#111", color: "#00ff88", border: "1px solid #00ff8822", borderRadius: 6, padding: "10px 20px", fontSize: 13, cursor: "not-allowed", fontFamily: "inherit", width: "100%" },
  btnSmall: { background: "transparent", border: "1px solid #1e1e1e", color: "#555", borderRadius: 4, padding: "6px 12px", fontSize: 11, cursor: "pointer", fontFamily: "inherit" },
  btnSmallGreen: { background: "#00ff8811", border: "1px solid #00ff8822", color: "#00ff88", borderRadius: 4, padding: "6px 12px", fontSize: 11, cursor: "pointer", fontFamily: "inherit" },
  backBtn: { background: "transparent", border: "1px solid #1e1e1e", color: "#444", borderRadius: 6, padding: "6px 14px", fontSize: 11, cursor: "pointer", fontFamily: "inherit", marginBottom: 20, display: "inline-block" },
  error: { color: "#ff5555", fontSize: 12, padding: "8px 12px", background: "#ff000011", border: "1px solid #ff000022", borderRadius: 4, marginBottom: 16 },
};