import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

/**
 * ABQD CRM — Prototype
 * Goals (Sprint 1, per notes):
 * - Deal Card (360 View): Inline-edit + unified Timeline + sticky actions (F-pattern)
 * - Pipeline: Kanban drag&drop + Stepper + Qualifying Gates (block stage change if required fields missing)
 * - Comms: click-to-call + call logging modal
 * - Productivity: when a task is completed -> require "Next action" creation
 * - UX rules: <= 3 clicks to key actions, no blocking UI (async saves + toasts), mobile card view
 * - Light by default + Dark toggle
 */

// -------------------------
// DEMO PIPELINE (Stages + Gates)
// -------------------------
const demoStages = [
  { key: "inbox", title: "Входящие", hint: "Новые касания и лиды", gates: [] },
  { key: "qual", title: "Квалификация", hint: "Понимаем цель/контекст", gates: ["budget", "deadline"] },
  { key: "proposal", title: "Предложение", hint: "КП / условия", gates: ["decisionMaker", "email"] },
  { key: "contract", title: "Договор", hint: "Юр. данные и согласование", gates: ["inn", "legalName"] },
  { key: "won", title: "Выиграно", hint: "Достигнута цель", gates: [] },
  { key: "lost", title: "Потеряно", hint: "Причина и ретеншн", gates: ["lostReason"] },
];

const stageTitleByKey = Object.fromEntries(demoStages.map((s) => [s.key, s.title]));

const roleDefs = {
  hunter: { title: "Hunter", subtitle: "Новые лиды · дозвон · КП", icon: "🎯" },
  farmer: { title: "Farmer", subtitle: "Удержание · LTV · продления", icon: "🌿" },
};

// -------------------------
// PLANS (demo billing gates)
// -------------------------
const planRanks = { free: 0, starter: 1, pro: 2, business: 3 };
const planTitles = { free: "Free", starter: "Start", pro: "Pro", business: "Business" };

function planTitle(key) {
  return planTitles[key] || "Free";
}

function isPluginUnlockedForPlan(plugin, planKey) {
  const min = plugin?.minPlan || "free";
  return (planRanks[planKey] ?? 0) >= (planRanks[min] ?? 0);
}

function pluginMinPlanText(plugin) {
  const min = plugin?.minPlan || "free";
  return `${planTitle(min)}+`;
}

function pluginHoverTitle(plugin) {
  if (!plugin) return "";
  return `${plugin.title} — ${plugin.desc} • Доступ: ${pluginMinPlanText(plugin)}`;
}


// -------------------------
// PLUGINS (catalog)
// -------------------------
const pluginCatalog = [
  {
    id: "ai_agent",
    title: "AI агент",
    icon: "🤖",
    minPlan: "pro",
    desc: "Автозадачи, подсказки Next Action, резюме звонков/чатов.",
  },
  {
    id: "calendar",
    title: "Календарь",
    icon: "🗓️",
    minPlan: "starter",
    desc: "Слоты, встречи, напоминания, синхронизация (Google/Outlook — позже).",
  },
  {
    id: "constructor",
    title: "Конструктор",
    icon: "⌁",
    minPlan: "free",
    desc: "Быстрый доступ к визитке/профилю: создание, публикация, NFC.",
  },
  {
    id: "analytics",
    title: "Аналитика",
    icon: "📈",
    minPlan: "pro",
    desc: "Конверсия, скорость воронки, причины потерь, LTV (позже).",
  },
  {
    id: "automation",
    title: "Автоматизации",
    icon: "⚡",
    minPlan: "business",
    desc: "Триггеры: этап → действие, таймеры, вебхуки, интеграции.",
  },
];


// -------------------------
// DEMO DEALS
// -------------------------
const now = () => new Date().toISOString();

const demoDealsSeed = [
  {
    id: "D-1001",
    company: "SOVA Studio",
    contact: "Анастасия · директор",
    stage: "inbox",
    amount: 180000,
    currency: "RUB",
    score: 78,
    phone: "+7 900 111-22-33",
    email: "hello@sova.studio",
    fields: {
      budget: "",
      deadline: "",
      decisionMaker: "",
      inn: "",
      legalName: "",
      lostReason: "",
      note: "Интерес: NFC-значок + CRM. Нужны кейсы и примеры воронок.",
    },
    tags: ["nfc", "crm", "warm"],
    plugins: ["constructor"],
    nextTaskAt: "2026-01-27",
    tasks: [
      { id: "T-1", title: "Первый звонок", due: "2026-01-26", done: false },
      { id: "T-2", title: "Отправить кейс", due: "2026-01-27", done: false },
    ],
    timeline: [
      { id: "A-1", type: "nfc", at: "2026-01-25T11:10:00.000Z", text: "NFC tap → меню услуг" },
      { id: "A-2", type: "note", at: "2026-01-25T12:40:00.000Z", text: "Попросила примеры воронок" },
    ],
  },
  {
    id: "D-1002",
    company: "Nord Realty",
    contact: "Ольга · риелтор",
    stage: "qual",
    amount: 95000,
    currency: "RUB",
    score: 71,
    phone: "+7 999 222-33-44",
    email: "",
    fields: {
      budget: "95 000",
      deadline: "2026-02-01",
      decisionMaker: "",
      inn: "",
      legalName: "",
      lostReason: "",
      note: "Нужна быстрая передача контактов + календарь встреч.",
    },
    tags: ["realty", "qual"],
    plugins: ["calendar"],
    nextTaskAt: "2026-01-26",
    tasks: [{ id: "T-3", title: "Квалификация: ЛПР + email", due: "2026-01-26", done: false }],
    timeline: [
      { id: "A-3", type: "call", at: "2026-01-25T16:05:00.000Z", text: "Звонок — пропущен" },
      { id: "A-4", type: "msg", at: "2026-01-25T16:06:00.000Z", text: "WhatsApp → отправил сообщение" },
    ],
  },
  {
    id: "D-1003",
    company: "ABQD Partners",
    contact: "Максим · закупки",
    stage: "proposal",
    amount: 240000,
    currency: "RUB",
    score: 86,
    phone: "+7 901 333-44-55",
    email: "team@abqd.partners",
    fields: {
      budget: "240 000",
      deadline: "2026-02-10",
      decisionMaker: "Максим",
      inn: "",
      legalName: "",
      lostReason: "",
      note: "Ждут КП: варианты по меткам/значкам + пакет CRM.",
    },
    tags: ["hot", "proposal"],
    plugins: ["ai_agent", "analytics"],
    nextTaskAt: "2026-01-28",
    tasks: [{ id: "T-4", title: "Подготовить КП", due: "2026-01-28", done: false }],
    timeline: [
      { id: "A-5", type: "msg", at: "2026-01-24T10:10:00.000Z", text: "Telegram — ответила" },
      { id: "A-6", type: "email", at: "2026-01-24T12:30:00.000Z", text: "Email → отправили структуру КП" },
    ],
  },
  {
    id: "D-1004",
    company: "Kataraksis Club",
    contact: "Ирина · юрист",
    stage: "contract",
    amount: 320000,
    currency: "RUB",
    score: 83,
    phone: "+7 903 444-55-66",
    email: "legal@kataraksis.club",
    fields: {
      budget: "320 000",
      deadline: "2026-02-15",
      decisionMaker: "Ирина",
      inn: "1007027885",
      legalName: "ООО \"Катараксис клуб\"",
      lostReason: "",
      note: "Согласование договора, правки по оплате и закрывающим.",
    },
    tags: ["legal", "contract"],
    plugins: ["ai_agent"],
    nextTaskAt: "2026-01-26",
    tasks: [{ id: "T-5", title: "Согласование договора", due: "2026-01-26", done: false }],
    timeline: [
      { id: "A-7", type: "nfc", at: "2026-01-23T09:00:00.000Z", text: "NFC tap → прайс" },
      { id: "A-8", type: "status", at: "2026-01-23T09:01:00.000Z", text: "Статус → Договор" },
    ],
  },
  {
    id: "D-1005",
    company: "Orion Media",
    contact: "Сергей · владелец",
    stage: "won",
    amount: 150000,
    currency: "RUB",
    score: 90,
    phone: "+7 905 555-66-77",
    email: "owner@orion.media",
    fields: {
      budget: "150 000",
      deadline: "2026-01-22",
      decisionMaker: "Сергей",
      inn: "7700000000",
      legalName: "ООО \"Орион Медиа\"",
      lostReason: "",
      note: "Онбординг завершён, готовим автоматизации на 30 дней.",
    },
    tags: ["onboarding", "won"],
    plugins: ["constructor", "automation"],
    nextTaskAt: "",
    tasks: [{ id: "T-6", title: "Онбординг клиента", due: "2026-01-22", done: true }],
    timeline: [
      { id: "A-9", type: "status", at: "2026-01-20T13:20:00.000Z", text: "Договор — подписан" },
      { id: "A-10", type: "note", at: "2026-01-21T08:10:00.000Z", text: "Старт работ: KPI + план 30 дней" },
    ],
  },
];

// -------------------------
// HELPERS
// -------------------------
function cx() {
  return Array.prototype.slice
    .call(arguments)
    .filter(Boolean)
    .join(" ");
}

function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}

function scoreLabel(score) {
  if (score >= 85) return { text: "Горячий", tone: "hot" };
  if (score >= 70) return { text: "Тёплый", tone: "warm" };
  if (score >= 55) return { text: "Холодный", tone: "cold" };
  return { text: "Слабый", tone: "weak" };
}

function createSearchString(deal) {
  const base = [
    deal.company,
    deal.contact,
    deal.id,
    deal.stage,
    deal.email,
    deal.phone,
    (deal.tags || []).join(" "),
    JSON.stringify(deal.fields || {}),
  ]
    .filter(Boolean)
    .join(" ");
  return base.toLowerCase();
}

function formatMoney(amount, currency) {
  try {
    const a = Number(amount || 0);
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: currency || "RUB",
      maximumFractionDigits: 0,
    }).format(a);
  } catch {
    return `${amount || 0} ${currency || "RUB"}`;
  }
}

function isoToHuman(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleString("ru-RU", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
  } catch {
    return iso;
  }
}

function isOverdue(dateStr) {
  if (!dateStr) return false;
  const d = new Date(dateStr + "T23:59:59.000Z");
  return d.getTime() < Date.now();
}

function dueTone(dateStr) {
  if (!dateStr) return "none";
  const d = new Date(dateStr + "T00:00:00.000Z");
  const today = new Date();
  const t0 = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const t1 = new Date(t0);
  t1.setDate(t0.getDate() + 1);

  if (d.getTime() < t0.getTime()) return "bad";
  if (d.getTime() >= t0.getTime() && d.getTime() < t1.getTime()) return "warn";
  return "good";
}

// -------------------------
// MOCK API (async, non-blocking)
// -------------------------
const mockApi = {
  saveDealPatch: async (dealId, patch) => {
    // emulate latency + occasional failure
    await new Promise((r) => setTimeout(r, 260));
    if (Math.random() < 0.03) throw new Error("NETWORK");
    return { ok: true, dealId, patch };
  },
  appendTimeline: async (dealId, event) => {
    await new Promise((r) => setTimeout(r, 200));
    return { ok: true, dealId, event };
  },
  moveStage: async (dealId, toStage, missing) => {
    await new Promise((r) => setTimeout(r, 220));
    if (missing && missing.length) {
      return { ok: false, code: "GATES", missing };
    }
    return { ok: true, dealId, toStage };
  },
};

// -------------------------
// THEME (light default + saved)
// -------------------------
function useStoredTheme() {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("abqd_crm_theme");
      if (saved === "dark" || saved === "light") {
        setTheme(saved);
        return;
      }
      const prefersDark =
        typeof window !== "undefined" &&
        !!window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches;
      setTheme(prefersDark ? "dark" : "light");
    } catch {
      // ignore
    }
  }, []);

  const set = (t) => {
    setTheme(t);
    try {
      window.localStorage.setItem("abqd_crm_theme", t);
    } catch {
      // ignore
    }
  };

  return [theme, set];
}

// -------------------------
// TOASTS
// -------------------------
function useToasts() {
  const [toasts, setToasts] = useState([]);

  const push = useCallback((tone, title, text) => {
    const id = `toast_${Math.random().toString(16).slice(2)}`;
    const t = { id, tone, title, text };
    setToasts((prev) => [t, ...prev].slice(0, 6));
    setTimeout(() => {
      setToasts((prev) => prev.filter((x) => x.id !== id));
    }, 3200);
  }, []);

  return { toasts, push };
}

// -------------------------
// STYLES
// -------------------------
const css = `
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&display=swap');

:root{--radius:22px;}

[data-theme='dark']{
  /* +10% brighter dark theme (eye-friendly) */
  --bg:#121216;
  --fg:#f4f4f5;
  --muted:rgba(244,244,245,.66);
  --muted2:rgba(244,244,245,.50);
  --bd:rgba(244,244,245,.18);
  --bd2:rgba(244,244,245,.12);
  --panel:linear-gradient(135deg, rgba(56,56,64,.52), rgba(44,44,52,.34));
  --chip:rgba(28,28,34,.34);
  --chip2:rgba(28,28,34,.50);
  --shadow:rgba(0,0,0,.42);
  --shine:rgba(255,255,255,.10);
  --good:rgba(16,185,129,.18);
  --warn:rgba(245,158,11,.18);
  --bad:rgba(244,63,94,.18);
}

[data-theme='light']{
  /* Neutral light theme (no violet tint) */
  --bg:#f6f7f9;
  --fg:#0b0b0f;
  --muted:rgba(11,11,15,.62);
  --muted2:rgba(11,11,15,.42);
  --bd:rgba(11,11,15,.14);
  --bd2:rgba(11,11,15,.10);
  --panel:linear-gradient(135deg, rgba(255,255,255,.88), rgba(238,240,244,.78));
  --chip:rgba(255,255,255,.64);
  --chip2:rgba(240,242,246,.82);
  --shadow:rgba(0,0,0,.16);
  --shine:rgba(0,0,0,.04);
  --good:rgba(16,185,129,.12);
  --warn:rgba(245,158,11,.12);
  --bad:rgba(244,63,94,.12);
}



.abqd-root{min-height:100vh;background:var(--bg);color:var(--fg);font-family:Montserrat,system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;}
.abqd-wrap{max-width:1780px;margin:0 auto;padding:14px 12px 84px;}

.abqd-grid{display:grid;grid-template-columns:1fr;gap:12px;}
@media (min-width:1060px){.abqd-grid{grid-template-columns:var(--sbw,280px) 1fr;}}

.abqd-onlyDesktop{display:none;}
@media (min-width:1060px){.abqd-onlyDesktop{display:inline-flex;}}

.abqd-sidebar{display:grid;gap:12px;}
.abqd-slimOnly{display:none;}
.abqd-wideOnly{display:block;}
.abqd-sidebar.is-slim .abqd-slimOnly{display:block;}
.abqd-sidebar.is-slim .abqd-wideOnly{display:none;}
.abqd-sidebar.is-slim .abqd-section{padding:12px;}
.abqd-sidebar.is-slim .abqd-h1{font-size:13px;}

.abqd-radius{border-radius:var(--radius);}
.abqd-glass{position:relative;border:1px solid var(--bd);background:var(--panel);backdrop-filter:blur(18px) saturate(120%);-webkit-backdrop-filter:blur(18px) saturate(120%);box-shadow:0 20px 60px var(--shadow), inset 0 1px 0 rgba(255,255,255,.08);}
.abqd-glow{pointer-events:none;position:absolute;inset:0;border-radius:var(--radius);mask-image:radial-gradient(60% 60% at 50% 0%,#000,transparent);-webkit-mask-image:radial-gradient(60% 60% at 50% 0%,#000,transparent);}
.abqd-glow::before{content:'';position:absolute;left:50%;top:-56px;transform:translateX(-50%);width:560px;height:140px;border-radius:999px;background:var(--shine);}

.abqd-top{position:sticky;top:0;z-index:10;display:grid;gap:10px;}

.abqd-bar{padding:12px 12px;background:var(--panel);}
.abqd-barRow{display:flex;flex-wrap:wrap;align-items:center;gap:10px;}

.abqd-brand{display:flex;align-items:center;gap:10px;min-width:240px;}
.abqd-brandLogo{display:block;height:34px;width:auto;}
.abqd-brandMeta{line-height:1.1;}
.abqd-brandSub{font-size:12px;color:var(--muted);}

.abqd-inputWrap{position:relative;flex:1;min-width:240px;}
.abqd-input{width:100%;border-radius:18px;border:1px solid var(--bd);background:var(--chip2);padding:11px 12px 11px 34px;color:var(--fg);outline:none;}
.abqd-input::placeholder{color:var(--muted2);} 
.abqd-inputIcon{position:absolute;left:12px;top:50%;transform:translateY(-50%);color:var(--muted2);font-size:14px;}

.abqd-btn{border-radius:16px;border:1px solid var(--bd);background:rgba(255,255,255,.08);color:var(--fg);padding:10px 12px;font-weight:800;font-size:13px;cursor:pointer;transition:transform .08s ease,filter .2s ease;}
[data-theme='light'] .abqd-btn{background:rgba(0,0,0,.04);} 
.abqd-btn:hover{filter:brightness(1.06);} 
.abqd-btn:active{transform:translateY(1px);} 
.abqd-btn--secondary{background:var(--chip2);} 
.abqd-btn--sm{padding:7px 10px;font-size:12px;border-radius:14px;} 
.abqd-btn--danger{background:rgba(244,63,94,.12);} 
.abqd-btn--full{width:100%;margin-top:10px;} 

.abqd-toggle{display:flex;align-items:center;border:1px solid var(--bd);background:var(--chip2);border-radius:16px;padding:3px;} 
.abqd-toggleBtn{border:0;background:transparent;color:var(--muted);font-weight:900;font-size:12px;padding:7px 10px;border-radius:13px;cursor:pointer;} 
.abqd-toggleBtn.is-active{background:var(--chip);color:var(--fg);} 

.abqd-pill{display:inline-flex;align-items:center;gap:6px;border:1px solid var(--bd);background:var(--chip);padding:4px 10px;border-radius:999px;font-size:12px;font-weight:900;} 
.abqd-ibox{display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;border-radius:12px;border:1px solid var(--bd);background:var(--chip2);font-size:12px;opacity:.9;} 

.abqd-section{padding:14px;} 
.abqd-h1{font-size:18px;font-weight:900;letter-spacing:-.015em;} 
.abqd-h2{font-size:16px;font-weight:900;letter-spacing:-.012em;} 
.abqd-muted{color:var(--muted);} 
.abqd-strong{font-weight:900;} 
.abqd-trunc{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;} 
.abqd-sep{height:1px;background:var(--bd2);} 

.abqd-tabs{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px;} 
.abqd-tab{border:1px solid var(--bd);background:var(--chip2);color:var(--muted);border-radius:999px;padding:8px 12px;font-weight:900;font-size:12px;cursor:pointer;} 
.abqd-tab.is-active{background:var(--chip);color:var(--fg);} 

.abqd-kanban{display:flex;gap:12px;overflow-x:auto;padding-bottom:6px;}
.abqd-kanban::-webkit-scrollbar{height:8px;}
.abqd-kanban::-webkit-scrollbar-thumb{background:rgba(127,127,127,.25);border-radius:999px;}

.abqd-col{width:300px;min-width:300px;padding:14px;background:var(--panel);border-radius:var(--radius);} 
.abqd-colHead{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;} 
.abqd-colTitle{font-weight:900;font-size:13px;} 
.abqd-colHint{font-size:12px;color:var(--muted);} 

.abqd-cardRail{margin-top:10px;overflow-x:auto;padding-bottom:6px;} 
.abqd-cardRail::-webkit-scrollbar{height:8px;} 
.abqd-cardRail::-webkit-scrollbar-thumb{background:rgba(127,127,127,.20);border-radius:999px;} 

/* 4 вниз → затем вправо */
.abqd-cardGrid{display:grid;grid-auto-flow:column;grid-template-rows:repeat(4,auto);gap:10px;align-content:start;} 
.abqd-cardGrid.is-compact{grid-auto-columns:250px;} 
.abqd-cardGrid:not(.is-compact){grid-auto-columns:270px;} 

.abqd-dealBtn{border:0;background:transparent;padding:0;cursor:pointer;text-align:left;}
.abqd-deal{padding:12px;transition:filter .18s ease, transform .18s ease;}
.abqd-deal:hover{filter:brightness(1.06);transform:translateY(-1px);} 

.abqd-dealTop{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;}
.abqd-dealTitle{display:flex;align-items:center;gap:8px;font-weight:900;font-size:13px;}
.abqd-dealSub{font-size:12px;color:var(--muted);margin-top:2px;}
.abqd-dealMeta{display:flex;flex-wrap:wrap;gap:8px;margin-top:8px;}
.abqd-metaChip{display:inline-flex;align-items:center;gap:8px;border:1px solid var(--bd);background:var(--chip2);border-radius:999px;padding:6px 10px;font-size:12px;color:var(--fg);max-width:100%;}

.abqd-tags{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px;}
.abqd-tag{border:1px solid var(--bd);background:var(--chip);border-radius:999px;padding:6px 10px;font-size:12px;font-weight:900;}

.abqd-score{display:inline-flex;align-items:center;gap:8px;border:1px solid var(--bd);background:var(--chip2);border-radius:999px;padding:6px 10px;font-weight:900;font-size:12px;white-space:nowrap;}
.abqd-scoreDot{width:7px;height:7px;border-radius:50%;background:var(--fg);opacity:.75;}
.abqd-score.tone-hot{border-color:rgba(16,185,129,.30);background:rgba(16,185,129,.10);} 
.abqd-score.tone-warm{border-color:rgba(245,158,11,.26);background:rgba(245,158,11,.10);} 
.abqd-score.tone-cold{border-color:rgba(161,161,170,.26);background:rgba(161,161,170,.10);} 
.abqd-score.tone-weak{border-color:rgba(244,63,94,.26);background:rgba(244,63,94,.10);} 

.abqd-health{display:inline-flex;align-items:center;gap:8px;border:1px solid var(--bd);background:var(--chip2);border-radius:999px;padding:6px 10px;font-weight:900;font-size:12px;}
.abqd-healthDot{width:7px;height:7px;border-radius:50%;}
.abqd-health.good{background:var(--good);} 
.abqd-health.warn{background:var(--warn);} 
.abqd-health.bad{background:var(--bad);} 

.abqd-droptarget{outline:2px dashed transparent;outline-offset:6px;border-radius:var(--radius);} 
.abqd-droptarget.is-over{outline-color:rgba(124,58,237,.45);} 

/* Drawer */
.abqd-drawerWrap{position:fixed;inset:0;z-index:50;} 
.abqd-drawerBackdrop{position:absolute;inset:0;background:rgba(0,0,0,.42);border:0;} 
.abqd-drawer{position:absolute;right:0;top:0;height:100%;width:min(640px,100%);padding:12px;} 
.abqd-drawerCard{height:100%;display:flex;flex-direction:column;overflow:hidden;} 
.abqd-drawerHead{position:sticky;top:0;z-index:2;display:flex;align-items:center;justify-content:space-between;gap:10px;padding:14px;background:var(--panel);} 
.abqd-drawerBody{padding:14px;overflow:auto;} 

.abqd-actions{display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end;}

.abqd-stepper{display:flex;gap:8px;flex-wrap:wrap;}
.abqd-step{border:1px solid var(--bd);background:var(--chip2);border-radius:999px;padding:7px 10px;font-weight:900;font-size:12px;cursor:pointer;}
.abqd-step.is-active{background:var(--chip);}
.abqd-step.is-blocked{opacity:.55;}

.abqd-box{border:1px solid var(--bd);background:var(--chip);border-radius:var(--radius);padding:14px;margin-bottom:12px;} 
.abqd-boxTitle{font-weight:900;margin-bottom:8px;} 
.abqd-boxText{font-weight:700;font-size:13px;line-height:1.35;} 

.abqd-formGrid{display:grid;grid-template-columns:1fr 1fr;gap:10px;}
@media (max-width:560px){.abqd-formGrid{grid-template-columns:1fr;}}

.abqd-field{border:1px solid var(--bd);background:var(--chip2);border-radius:18px;padding:10px;}
.abqd-fieldLabel{font-size:12px;color:var(--muted);font-weight:800;}
.abqd-fieldValue{margin-top:4px;font-weight:900;font-size:13px;}
.abqd-fieldValue.is-missing{outline:2px solid rgba(244,63,94,.35);outline-offset:2px;border-radius:10px;}
.abqd-fieldInput{margin-top:6px;width:100%;border-radius:14px;border:1px solid var(--bd);background:rgba(255,255,255,.06);padding:8px 10px;color:var(--fg);outline:none;}
[data-theme='light'] .abqd-fieldInput{background:rgba(0,0,0,.03);} 

.abqd-list{display:grid;gap:8px;margin-top:8px;}
.abqd-listRow{border:1px solid var(--bd);background:var(--chip2);border-radius:18px;padding:10px;font-weight:700;font-size:13px;}
.abqd-timeRow{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;}
.abqd-timeMeta{font-size:12px;color:var(--muted);}

.abqd-modalWrap{position:fixed;inset:0;z-index:60;display:flex;align-items:center;justify-content:center;padding:12px;}
.abqd-modal{width:min(520px,100%);}

.abqd-toasts{position:fixed;left:12px;bottom:12px;z-index:70;display:grid;gap:10px;width:min(360px,92vw);}
.abqd-toast{border:1px solid var(--bd);background:var(--panel);border-radius:18px;padding:10px 12px;}
.abqd-toastTitle{font-weight:900;}
.abqd-toastText{font-size:12px;color:var(--muted);margin-top:2px;line-height:1.25;}
.abqd-toast.tone-good{border-color:rgba(16,185,129,.35);} 
.abqd-toast.tone-warn{border-color:rgba(245,158,11,.35);} 
.abqd-toast.tone-bad{border-color:rgba(244,63,94,.35);} 

/* Mobile rule: no tables; everything is cards already. Keep side column collapsible feel. */
.abqd-foot{margin-top:10px;font-size:12px;color:var(--muted2);padding:0 4px;}

/* Metallic aluminum finish */
.abqd-metal{position:relative;background:radial-gradient(140% 120% at 20% 0%, rgba(255,255,255,.22), rgba(255,255,255,0) 55%),linear-gradient(135deg, rgba(255,255,255,.14), rgba(255,255,255,.06));}
[data-theme='light'] .abqd-metal{background:radial-gradient(140% 120% at 20% 0%, rgba(255,255,255,.95), rgba(255,255,255,0) 55%),linear-gradient(135deg, rgba(255,255,255,.92), rgba(232,235,240,.78));}
.abqd-metal::before{content:"";position:absolute;inset:0;border-radius:inherit;pointer-events:none;background:linear-gradient(180deg, rgba(255,255,255,.18), rgba(255,255,255,0) 40%),linear-gradient(90deg, rgba(255,255,255,.10), rgba(255,255,255,0) 35%, rgba(255,255,255,.08) 70%, rgba(255,255,255,0));opacity:.85;}
[data-theme='light'] .abqd-metal::before{opacity:.70;}

/* PLUGINS (Catalog + Assignment) */
.abqd-pluginArea{border:1px dashed var(--bd);background:var(--chip2);border-radius:var(--radius);padding:12px;}
.abqd-pluginArea.is-over{outline:2px solid rgba(124,58,237,.45);outline-offset:4px;}
.abqd-pluginChips{display:flex;flex-wrap:wrap;gap:10px;}
.abqd-pluginChip{display:flex;align-items:center;gap:10px;border:1px solid var(--bd);background:var(--chip);border-radius:999px;padding:8px 10px;font-weight:900;font-size:12px;}
.abqd-pluginIcon{display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;border-radius:12px;border:1px solid var(--bd);background:var(--chip2);}
.abqd-pluginTitle{max-width:220px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.abqd-pluginRemove{border:0;background:transparent;color:var(--muted);cursor:pointer;font-size:16px;line-height:1;padding:0 4px;}
.abqd-pluginEmpty{color:var(--muted);font-weight:800;font-size:12px;}

.abqd-pluginGrid{display:flex;flex-wrap:wrap;gap:12px;margin-top:12px;}

.abqd-plug{position:relative;display:flex;flex-direction:column;align-items:center;}
.abqd-plugBtn{width:46px;height:46px;border-radius:16px;border:1px solid var(--bd);background:var(--chip2);color:var(--fg);cursor:grab;font-size:20px;display:flex;align-items:center;justify-content:center;transition:filter .18s ease, transform .08s ease;}
.abqd-plugBtn:hover{filter:brightness(1.06);} 
.abqd-plugBtn:active{transform:translateY(1px);cursor:grabbing;}
.abqd-plug.is-installed .abqd-plugBtn{opacity:.85;}
.abqd-plug.is-locked .abqd-plugBtn{opacity:.58;cursor:not-allowed;}
.abqd-plug.is-locked .abqd-plugBtn:hover{filter:none;}
.abqd-lockBadge{position:absolute;right:-6px;top:-6px;display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;border-radius:12px;border:1px solid var(--bd);background:var(--panel);font-size:12px;box-shadow:0 12px 30px var(--shadow);}
.abqd-plugLabel{font-size:11px;color:var(--muted2);margin-top:6px;line-height:1.2;font-weight:900;max-width:92px;text-align:center;}

.abqd-plugTip{position:absolute;left:50%;bottom:56px;transform:translate(-50%,-6px);min-width:220px;max-width:280px;opacity:0;pointer-events:none;transition:opacity .15s ease, transform .15s ease;border:1px solid var(--bd);background:var(--panel);border-radius:18px;padding:10px;box-shadow:0 18px 50px var(--shadow);z-index:60;}
.abqd-plug:hover .abqd-plugTip{opacity:1;transform:translate(-50%,-12px);} 
.abqd-plugName{font-weight:900;font-size:12px;}
.abqd-plugDesc{font-size:12px;color:var(--muted);margin-top:4px;line-height:1.3;}
.abqd-plugMeta{font-size:11px;color:var(--muted2);margin-top:6px;line-height:1.25;font-weight:800;}

/* Plugins Drawer (left) */
.abqd-pdrawerWrap{position:fixed;inset:0;z-index:55;}
.abqd-pdrawer{position:absolute;left:0;top:0;height:100%;width:min(460px,100%);padding:12px;}
.abqd-pdrawerCard{height:100%;display:flex;flex-direction:column;overflow:hidden;}
.abqd-pdrawerHead{position:sticky;top:0;z-index:2;display:flex;align-items:flex-start;justify-content:space-between;gap:10px;padding:14px;background:var(--panel);}
.abqd-pdrawerBody{padding:14px;overflow:auto;}

`;

// -------------------------
// UI ATOMS
// -------------------------
function GlassCard({ children, className }) {
  return (
    <div className={cx("abqd-glass abqd-radius", className)}>
      <div className="abqd-glow" aria-hidden />
      {children}
    </div>
  );
}

function Button({ children, variant, onClick, small, className, type }) {
  const v = variant || "primary";
  const t = type || "button";
  return (
    <button
      type={t}
      onClick={onClick}
      className={cx(
        "abqd-btn",
        v === "secondary" && "abqd-btn--secondary",
        v === "danger" && "abqd-btn--danger",
        small && "abqd-btn--sm",
        className
      )}
    >
      {children}
    </button>
  );
}

function Input({ value, onChange, placeholder }) {
  return (
    <div className="abqd-inputWrap">
      <span className="abqd-inputIcon" aria-hidden>
        ⌕
      </span>
      <input className="abqd-input" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  );
}

function ThemeToggle({ theme, setTheme }) {
  return (
    <div className="abqd-toggle">
      <button type="button" className={cx("abqd-toggleBtn", theme === "light" && "is-active")} onClick={() => setTheme("light")}>
        Светлая
      </button>
      <button type="button" className={cx("abqd-toggleBtn", theme === "dark" && "is-active")} onClick={() => setTheme("dark")}>
        Тёмная
      </button>
    </div>
  );
}

function ScoreBadge({ score }) {
  const s = scoreLabel(score);
  return (
    <span className={cx("abqd-score", `tone-${s.tone}`)}>
      <span className="abqd-scoreDot" />
      {s.text} · {score}
    </span>
  );
}

function HealthBadge({ nextTaskAt }) {
  const tone = dueTone(nextTaskAt);
  const label = tone === "bad" ? "Просрочено" : tone === "warn" ? "Сегодня" : tone === "good" ? "Есть план" : "Нет задач";
  return (
    <span className={cx("abqd-health", tone)}>
      <span className="abqd-healthDot" style={{ background: tone === "bad" ? "rgba(244,63,94,.75)" : tone === "warn" ? "rgba(245,158,11,.75)" : tone === "good" ? "rgba(16,185,129,.75)" : "rgba(161,161,170,.65)" }} />
      {label}
    </span>
  );
}

// -------------------------
// DEAL CARD (Kanban item)
// -------------------------
function DealCard({ deal, onOpen, onDragStart }) {
  return (
    <button
      type="button"
      className="abqd-dealBtn"
      onClick={() => onOpen(deal)}
      draggable
      onDragStart={(e) => onDragStart(e, deal.id)}
      title="Открыть сделку"
    >
      <GlassCard className="abqd-deal">
        <div className="abqd-dealTop">
          <div style={{ minWidth: 0 }}>
            <div className="abqd-dealTitle">
              <span className="abqd-trunc">{deal.company}</span>
            </div>
            <div className="abqd-dealSub abqd-trunc">{deal.contact}</div>
          </div>
          <ScoreBadge score={deal.score} />
        </div>

        <div className="abqd-dealMeta">
          <span className="abqd-metaChip">
            <span className="abqd-ibox">💳</span>
            <span className="abqd-trunc">{formatMoney(deal.amount, deal.currency)}</span>
          </span>
          <span className="abqd-metaChip">
            <span className="abqd-ibox">⎈</span>
            <span className="abqd-trunc">{stageTitleByKey[deal.stage] || deal.stage}</span>
          </span>
          <span className="abqd-metaChip">
            <span className="abqd-ibox">🔌</span>
            <span className="abqd-trunc">{(deal.plugins || []).length} плаг.</span>
          </span>
          <HealthBadge nextTaskAt={deal.nextTaskAt} />
        </div>

        <div className="abqd-tags">
          {(deal.tags || []).slice(0, 4).map((t) => (
            <span key={t} className="abqd-tag">
              #{t}
            </span>
          ))}
        </div>
      </GlassCard>
    </button>
  );
}

// -------------------------
// MODALS
// -------------------------
function Modal({ title, children, onClose, actions }) {
  return (
    <div className="abqd-modalWrap" role="dialog" aria-modal="true">
      <button className="abqd-drawerBackdrop" onClick={onClose} aria-label="Закрыть" />
      <div className="abqd-modal">
        <GlassCard className="abqd-section">
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10 }}>
            <div>
              <div className="abqd-h1">{title}</div>
            </div>
            <Button variant="secondary" onClick={onClose}>
              Закрыть
            </Button>
          </div>
          <div className="abqd-sep" style={{ margin: "12px 0" }} />
          {children}
          {actions ? <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 12, flexWrap: "wrap" }}>{actions}</div> : null}
        </GlassCard>
      </div>
    </div>
  );
}

// -------------------------
// DRAWER (Deal 360 View)
// -------------------------
function DealDrawer({ deal, stages, missingGates, onClose, onPatch, onMoveStage, onAppendTimeline, onCompleteTask, installedPlugins, pluginCatalog, onAssignPlugin, onUnassignPlugin, plan, onExplainPluginLock }) {
  const [tab, setTab] = useState("timeline");
  const [plugOver, setPlugOver] = useState(false);

  const requiredForStage = useMemo(() => {
    const st = stages.find((s) => s.key === deal.stage);
    return st ? st.gates || [] : [];
  }, [stages, deal.stage]);

  const missingSet = useMemo(() => new Set(missingGates || []), [missingGates]);

  const quickCall = useCallback(() => {
    // click-to-call: tel: + trigger logging modal outside (handled by parent)
    try {
      window.location.href = `tel:${deal.phone}`;
    } catch {
      // ignore
    }
  }, [deal.phone]);

  return (
    <div className="abqd-drawerWrap" role="dialog" aria-modal="true">
      <button className="abqd-drawerBackdrop" onClick={onClose} aria-label="Закрыть" />
      <div className="abqd-drawer">
        <GlassCard className="abqd-drawerCard">
          <div className="abqd-drawerHead">
            <div style={{ minWidth: 0 }}>
              <div className="abqd-h1 abqd-trunc">{deal.company}</div>
              <div className="abqd-muted abqd-trunc">{deal.contact} · {deal.id}</div>
              <div style={{ marginTop: 10 }} className="abqd-stepper">
                {stages.map((s) => {
                  const isActive = s.key === deal.stage;
                  // Soft-block: clicking later stages allowed but gates checked by parent
                  return (
                    <button
                      key={s.key}
                      type="button"
                      className={cx("abqd-step", isActive && "is-active")}
                      onClick={() => onMoveStage(s.key)}
                      title={s.hint}
                    >
                      {s.title}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="abqd-actions">
              <a
                className={cx("abqd-btn", "abqd-btn--secondary")}
                href={`tel:${deal.phone}`}
                onClick={() => onAppendTimeline({ type: "call", text: "Click-to-Call" })}
                style={{ textDecoration: "none" }}
              >
                📞 Позвонить
              </a>
              <Button variant="secondary" onClick={() => onAppendTimeline({ type: "msg", text: "Открыть чат (demo)" })}>
                ✉ Написать
              </Button>
              <Button variant="secondary" onClick={() => onAppendTimeline({ type: "doc", text: "Сформирован документ (HTML)" })}>
                📄 Документ
              </Button>
              <Button variant="secondary" onClick={onClose}>
                Закрыть
              </Button>
            </div>
          </div>

          <div className="abqd-sep" />

          <div className="abqd-drawerBody">
            <div className="abqd-tabs">
              <button className={cx("abqd-tab", tab === "timeline" && "is-active")} onClick={() => setTab("timeline")}>
                Timeline
              </button>
              <button className={cx("abqd-tab", tab === "fields" && "is-active")} onClick={() => setTab("fields")}>
                Поля
              </button>
              <button className={cx("abqd-tab", tab === "tasks" && "is-active")} onClick={() => setTab("tasks")}>
                Задачи
              </button>
              <button className={cx("abqd-tab", tab === "plugins" && "is-active")} onClick={() => setTab("plugins")}>
                Плагины
              </button>
            </div>

            {tab === "timeline" ? (
              <div style={{ marginTop: 12 }}>
                <GlassCard className="abqd-box">
                  <div className="abqd-boxTitle">Единая лента истории</div>
                  <div className="abqd-muted" style={{ fontSize: 12, lineHeight: 1.45 }}>
                    Email · звонки · заметки · статусы · задачи — всё в одном месте, без вкладочного хаоса.
                  </div>

                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 10 }}>
                    <Button small variant="secondary" onClick={() => onAppendTimeline({ type: "note", text: "Заметка (demo)" })}>
                      + Заметка
                    </Button>
                    <Button small variant="secondary" onClick={() => onAppendTimeline({ type: "email", text: "Email отправлен (demo)" })}>
                      + Email
                    </Button>
                    <Button small variant="secondary" onClick={() => onAppendTimeline({ type: "status", text: `Статус → ${deal.stage}` })}>
                      + Статус
                    </Button>
                  </div>

                  <div className="abqd-list">
                    {[...(deal.timeline || [])]
                      .slice()
                      .sort((a, b) => (a.at < b.at ? 1 : -1))
                      .map((ev) => (
                        <div key={ev.id} className="abqd-listRow">
                          <div className="abqd-timeRow">
                            <div style={{ minWidth: 0 }}>
                              <div className="abqd-strong abqd-trunc">{ev.text}</div>
                              <div className="abqd-timeMeta">{isoToHuman(ev.at)} · {ev.type}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </GlassCard>
              </div>
            ) : null}

            {tab === "fields" ? (
              <div style={{ marginTop: 12 }}>
                <GlassCard className="abqd-box">
                  <div className="abqd-boxTitle">Поля (inline-edit)</div>
                  <div className="abqd-muted" style={{ fontSize: 12, lineHeight: 1.45 }}>
                    Клик → редактирование → blur сохраняет асинхронно (toast), без кнопки «Редактировать».
                  </div>

                  <div className="abqd-formGrid" style={{ marginTop: 12 }}>
                    <InlineField label="Email" value={deal.email} missing={missingSet.has("email")} onSave={(v) => onPatch({ email: v })} />
                    <InlineField label="Телефон" value={deal.phone} missing={false} onSave={(v) => onPatch({ phone: v })} />
                    <InlineField label="Бюджет" value={deal.fields.budget} missing={missingSet.has("budget")} onSave={(v) => onPatch({ fields: { ...deal.fields, budget: v } })} />
                    <InlineField label="Срок" value={deal.fields.deadline} missing={missingSet.has("deadline")} onSave={(v) => onPatch({ fields: { ...deal.fields, deadline: v } })} />
                    <InlineField label="ЛПР" value={deal.fields.decisionMaker} missing={missingSet.has("decisionMaker")} onSave={(v) => onPatch({ fields: { ...deal.fields, decisionMaker: v } })} />
                    <InlineField label="ИНН" value={deal.fields.inn} missing={missingSet.has("inn")} onSave={(v) => onPatch({ fields: { ...deal.fields, inn: v } })} />
                    <InlineField label="Юр. название" value={deal.fields.legalName} missing={missingSet.has("legalName")} onSave={(v) => onPatch({ fields: { ...deal.fields, legalName: v } })} />
                    <InlineField label="Причина потери" value={deal.fields.lostReason} missing={missingSet.has("lostReason")} onSave={(v) => onPatch({ fields: { ...deal.fields, lostReason: v } })} />
                    <InlineField label="Заметка" value={deal.fields.note} multiline missing={false} onSave={(v) => onPatch({ fields: { ...deal.fields, note: v } })} />
                  </div>

                  {requiredForStage.length ? (
                    <div className="abqd-muted" style={{ fontSize: 12, marginTop: 10, lineHeight: 1.45 }}>
                      Gate для этапа <b>{deal.stage}</b>: {requiredForStage.join(", ")}
                    </div>
                  ) : null}
                </GlassCard>
              </div>
            ) : null}

            {tab === "tasks" ? (
              <div style={{ marginTop: 12 }}>
                <GlassCard className="abqd-box">
                  <div className="abqd-boxTitle">Задачи</div>
                  <div className="abqd-muted" style={{ fontSize: 12, lineHeight: 1.45 }}>
                    Закрывая задачу — сразу фиксируем следующий шаг (Next Action), чтобы сделка не умерла.
                  </div>

                  <div className="abqd-list" style={{ marginTop: 10 }}>
                    {(deal.tasks || []).length ? (
                      (deal.tasks || [])
                        .slice()
                        .sort((a, b) => (a.due < b.due ? -1 : 1))
                        .map((t) => (
                          <div key={t.id} className="abqd-listRow">
                            <div className="abqd-timeRow">
                              <div style={{ minWidth: 0 }}>
                                <div className="abqd-strong abqd-trunc">{t.title}</div>
                                <div className="abqd-timeMeta">
                                  {t.due ? `до ${t.due}` : ""} · {t.done ? "готово" : "в работе"}
                                </div>
                              </div>
                              {!t.done ? (
                                <Button small variant="secondary" onClick={() => onCompleteTask(t.id)}>
                                  ✔ Завершить
                                </Button>
                              ) : (
                                <span className="abqd-pill">✓</span>
                              )}
                            </div>
                          </div>
                        ))
                    ) : (
                      <div className="abqd-pluginEmpty">Пока нет задач.</div>
                    )}
                  </div>
                </GlassCard>
              </div>
            ) : null}

            {tab === "plugins" ? (
              <div style={{ marginTop: 12 }}>
                <GlassCard className="abqd-box">
                  <div className="abqd-boxTitle">Плагины клиента</div>
                  <div className="abqd-muted" style={{ fontSize: 12, lineHeight: 1.45 }}>
                    Назначай плагины конкретно этой сделке/клиенту. Можно перетащить из Dock снизу прямо сюда.
                  </div>

                  <div
                    className={cx("abqd-pluginArea", plugOver && "is-over")}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setPlugOver(true);
                    }}
                    onDragLeave={() => setPlugOver(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setPlugOver(false);
                      const pid = e.dataTransfer.getData("text/abqd-plugin");
                      if (pid) onAssignPlugin(pid);
                    }}
                    style={{ marginTop: 12 }}
                  >
                    {(deal.plugins || []).length ? (
                      <div className="abqd-pluginChips">
                        {(deal.plugins || []).map((id) => {
                          const p = pluginCatalog.find((x) => x.id === id);
                          return (
                            <div key={id} className="abqd-pluginChip" title={p ? pluginHoverTitle(p) : id}>
                              <span className="abqd-pluginIcon" aria-hidden>
                                {p ? p.icon : "🔌"}
                              </span>
                              <span className="abqd-pluginTitle">{p ? p.title : id}</span>
                              <button type="button" className="abqd-pluginRemove" onClick={() => {
                                const locked = p && !isPluginUnlockedForPlan(p, plan);
                                if (locked) {
                                  onExplainPluginLock && onExplainPluginLock(id);
                                  return;
                                }
                                onUnassignPlugin(id);
                              }} aria-label="Убрать">
                                ×
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="abqd-pluginEmpty">Нет плагинов. Перетащи из Dock снизу или добавь из списка ниже.</div>
                    )}
                  </div>

                  <div className="abqd-sep" style={{ margin: "12px 0" }} />

                  <div className="abqd-muted" style={{ fontSize: 12 }}>Установлено в CRM:</div>
                  <div className="abqd-pluginChips" style={{ marginTop: 10 }}>
                    {installedPlugins && installedPlugins.length ? (
                      installedPlugins
                        .filter((pid) => !(deal.plugins || []).includes(pid))
                        .map((pid) => {
                          const p = pluginCatalog.find((x) => x.id === pid);
                          return (
                            <button
                              key={pid}
                              type="button"
                              className="abqd-pluginChip"
                              title={p ? pluginHoverTitle(p) : pid}
                              onClick={() => {
                                const locked = p && !isPluginUnlockedForPlan(p, plan);
                                if (locked) {
                                  onExplainPluginLock && onExplainPluginLock(pid);
                                  return;
                                }
                                onAssignPlugin(pid);
                              }}
                              style={{ cursor: "pointer" }}
                            >
                              <span className="abqd-pluginIcon" aria-hidden>
                                {p ? p.icon : "🔌"}
                              </span>
                              <span className="abqd-pluginTitle">{p ? p.title : pid}</span>
                            </button>
                          );
                        })
                    ) : (
                      <div className="abqd-pluginEmpty">Сначала добавь плагины из Dock снизу.</div>
                    )}
                  </div>
                </GlassCard>
              </div>
            ) : null}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

function InlineField({ label, value, onSave, missing, multiline }) {
  const [editing, setEditing] = useState(false);
  const [v, setV] = useState(value || "");

  useEffect(() => setV(value || ""), [value]);

  if (!editing) {
    return (
      <div className={cx("abqd-field", missing && "abqd-fieldValue is-missing")}>
        <div className="abqd-fieldLabel">{label}</div>
        <div className={cx("abqd-fieldValue", (!value || String(value).trim() === "") && missing && "is-missing")}>
          <button
            type="button"
            onClick={() => setEditing(true)}
            style={{
              border: 0,
              background: "transparent",
              padding: 0,
              color: "inherit",
              cursor: "pointer",
              textAlign: "left",
              fontWeight: 900,
              width: "100%",
            }}
            title="Клик для редактирования"
          >
            {String(value || "—")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="abqd-field">
      <div className="abqd-fieldLabel">{label}</div>
      {multiline ? (
        <textarea
          className="abqd-fieldInput"
          rows={3}
          value={v}
          onChange={(e) => setV(e.target.value)}
          onBlur={() => {
            setEditing(false);
            onSave(v);
          }}
          autoFocus
        />
      ) : (
        <input
          className="abqd-fieldInput"
          value={v}
          onChange={(e) => setV(e.target.value)}
          onBlur={() => {
            setEditing(false);
            onSave(v);
          }}
          autoFocus
        />
      )}
      <div className="abqd-muted" style={{ fontSize: 11, marginTop: 6 }}>
        blur → сохранить
      </div>
    </div>
  );
}

function PluginsDrawer({
  open,
  onClose,
  pluginCatalog,
  installedPlugins,
  plan,
  onAdd,
  onRemove,
  onExplainLock,
  onDragStartPlugin,
}) {
  if (!open) return null;

  return (
    <div className="abqd-pdrawerWrap" role="dialog" aria-modal="true">
      <button className="abqd-drawerBackdrop" onClick={onClose} aria-label="Закрыть" />
      <div className="abqd-pdrawer">
        <GlassCard className="abqd-pdrawerCard">
          <div className="abqd-pdrawerHead">
            <div style={{ minWidth: 0 }}>
              <div className="abqd-h1">Плагины</div>
              <div className="abqd-muted" style={{ fontSize: 12, lineHeight: 1.35 }}>
                Каталог инструментов · Наведи → описание · Перетащи в сделку → вкладка «Плагины».
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
              <span className="abqd-pill">Тариф: {planTitle(plan)}</span>
              <Button variant="secondary" onClick={onClose}>
                Закрыть
              </Button>
            </div>
          </div>

          <div className="abqd-sep" />

          <div className="abqd-pdrawerBody">
            <div className="abqd-box">
              <div className="abqd-boxTitle">Установлено в CRM</div>
              <div className="abqd-muted" style={{ fontSize: 12, lineHeight: 1.45 }}>
                Это набор доступных плагинов для назначения клиентам. В более низких тарифах — только просмотр.
              </div>

              <div className="abqd-pluginChips" style={{ marginTop: 10 }}>
                {installedPlugins && installedPlugins.length ? (
                  installedPlugins.map((id) => {
                    const p = pluginCatalog.find((x) => x.id === id);
                    const locked = p && !isPluginUnlockedForPlan(p, plan);
                    return (
                      <div key={id} className="abqd-pluginChip" title={p ? pluginHoverTitle(p) : id}>
                        <span className="abqd-pluginIcon" aria-hidden>
                          {p ? p.icon : "🔌"}
                        </span>
                        <span className="abqd-pluginTitle">{p ? p.title : id}</span>
                        {locked ? (
                          <button
                            type="button"
                            className="abqd-pluginRemove"
                            onClick={() => onExplainLock && onExplainLock(id)}
                            aria-label="Недоступно"
                            title="Недоступно в текущем тарифе"
                          >
                            🔒
                          </button>
                        ) : (
                          <button type="button" className="abqd-pluginRemove" onClick={() => onRemove(id)} aria-label="Убрать">
                            ×
                          </button>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="abqd-pluginEmpty">Пока ничего не установлено. Добавь из каталога ниже.</div>
                )}
              </div>
            </div>

            <div className="abqd-box">
              <div className="abqd-boxTitle">Каталог</div>
              <div className="abqd-muted" style={{ fontSize: 12, lineHeight: 1.45 }}>
                Клик — установить в CRM (если доступно). Перетаскивание — только для доступных.
              </div>

              <div className="abqd-pluginGrid">
                {pluginCatalog.map((p) => {
                  const installed = installedPlugins.includes(p.id);
                  const locked = !isPluginUnlockedForPlan(p, plan);
                  return (
                    <div key={p.id} className={cx("abqd-plug", installed && "is-installed", locked && "is-locked")}>
                      <button
                        type="button"
                        className="abqd-plugBtn"
                        draggable={!locked}
                        onDragStart={(e) => !locked && onDragStartPlugin(e, p.id)}
                        onClick={() => (locked ? onExplainLock && onExplainLock(p.id) : onAdd(p.id))}
                        aria-label={p.title}
                      >
                        <span aria-hidden>{p.icon}</span>
                      </button>
                      {locked ? <span className="abqd-lockBadge" aria-hidden>🔒</span> : null}

                      <div className="abqd-plugTip" role="tooltip">
                        <div className="abqd-plugName">
                          {p.title}
                          {installed ? " · добавлен" : ""}
                        </div>
                        <div className="abqd-plugDesc">{p.desc}</div>
                        <div className="abqd-plugMeta">
                          Доступ: {pluginMinPlanText(p)}{locked ? " · только просмотр" : ""}
                        </div>
                      </div>

                      <div className="abqd-plugLabel">{p.title}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

// -------------------------
// MAIN APP
// -------------------------
export default function ABQDCrmPrototypeV2() {
  const [theme, setTheme] = useStoredTheme();
  const { toasts, push } = useToasts();

  const [role, setRole] = useState("hunter");
  const [plan, setPlan] = useState("business");
  const [query, setQuery] = useState("");
  const [compact, setCompact] = useState(true);
  const [pluginsOpen, setPluginsOpen] = useState(false);
  const [sidebarSlim, setSidebarSlim] = useState(false);

  const planOrder = ["free", "starter", "pro", "business"];

  const cyclePlan = useCallback(() => {
    setPlan((prev) => {
      const i = planOrder.indexOf(prev);
      return planOrder[(i + 1) % planOrder.length];
    });
  }, []);

  const explainPluginLock = useCallback(
    (pluginId) => {
      const p = pluginCatalog.find((x) => x.id === pluginId);
      const minTxt = pluginMinPlanText(p);
      push(
        "warn",
        "Плагин в другом тарифе",
        `${p ? p.title : pluginId} доступен в тарифе ${minTxt}. Сейчас можно только посмотреть описание.`
      );
    },
    [push]
  );


  const [deals, setDeals] = useState(demoDealsSeed);
  const [activeDealId, setActiveDealId] = useState(null);
  const [drawerMissing, setDrawerMissing] = useState([]);

  const [dropOverStage, setDropOverStage] = useState(null);

  const [nextActionModal, setNextActionModal] = useState(null); // {dealId, taskId}
  const [callLogModal, setCallLogModal] = useState(null); // {dealId}

  // Plugins
  const [installedPlugins, setInstalledPlugins] = useState([]);

  const activeDeal = useMemo(() => deals.find((d) => d.id === activeDealId) || null, [deals, activeDealId]);


  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return deals;
    return deals.filter((d) => createSearchString(d).includes(q));
  }, [deals, query]);

  const byStage = useMemo(() => {
    const init = demoStages.reduce((acc, s) => {
      acc[s.key] = [];
      return acc;
    }, {});
    return filtered.reduce((acc, d) => {
      (acc[d.stage] || (acc[d.stage] = [])).push(d);
      return acc;
    }, init);
  }, [filtered]);

  const totals = useMemo(() => {
    const total = deals.length;
    const hot = deals.filter((d) => d.score >= 85).length;
    const warn = deals.filter((d) => dueTone(d.nextTaskAt) === "warn").length;
    const bad = deals.filter((d) => dueTone(d.nextTaskAt) === "bad").length;
    const money = deals.reduce((a, b) => a + (Number(b.amount) || 0), 0);
    return { total, hot, warn, bad, money };
  }, [deals]);

  const openDeal = useCallback((d) => {
    setActiveDealId(d.id);
    setDrawerMissing([]);
  }, []);

  const closeDrawer = useCallback(() => {
    setActiveDealId(null);
    setDrawerMissing([]);
  }, []);

  const computeMissingForStage = useCallback(
    (deal, toStageKey) => {
      const stage = demoStages.find((s) => s.key === toStageKey);
      const gates = (stage && stage.gates) || [];
      const missing = [];
      for (const g of gates) {
        if (g === "email") {
          if (!deal.email || String(deal.email).trim() === "") missing.push(g);
        } else {
          const v = (deal.fields || {})[g];
          if (!v || String(v).trim() === "") missing.push(g);
        }
      }
      return missing;
    },
    []
  );

  const patchDeal = useCallback(
    async (dealId, patch) => {
      // optimistic UI
      setDeals((prev) =>
        prev.map((d) => {
          if (d.id !== dealId) return d;
          const next = { ...d, ...patch };
          // deep merge for fields if provided
          if (patch.fields) next.fields = { ...(d.fields || {}), ...(patch.fields || {}) };
          return next;
        })
      );

      try {
        await mockApi.saveDealPatch(dealId, patch);
        push("good", "Сохранено", "Изменения сохранены асинхронно.");
      } catch {
        push("bad", "Ошибка", "Сеть/сервер. Проверь позже (в прототипе — рандомная ошибка). ");
      }
    },
    [push]
  );

  const appendTimeline = useCallback(
    async (dealId, ev) => {
      const event = {
        id: `A-${Math.random().toString(16).slice(2)}`,
        type: ev.type || "note",
        at: now(),
        text: ev.text || "Событие",
      };
      setDeals((prev) => prev.map((d) => (d.id === dealId ? { ...d, timeline: [event, ...(d.timeline || [])] } : d)));
      await mockApi.appendTimeline(dealId, event);
    },
    []
  );

  const attemptMoveStage = useCallback(
    async (dealId, toStageKey) => {
      const deal = deals.find((d) => d.id === dealId);
      if (!deal) return;

      if (deal.stage === toStageKey) return;

      const missing = computeMissingForStage(deal, toStageKey);
      const res = await mockApi.moveStage(dealId, toStageKey, missing);

      if (!res.ok && res.code === "GATES") {
        push("warn", "Нельзя перевести этап", `Заполни обязательные поля: ${res.missing.join(", ")}`);
        setDrawerMissing(res.missing);
        setActiveDealId(dealId);
        // also add to timeline as guard event
        appendTimeline(dealId, { type: "guard", text: `Gate: не хватает полей для этапа ${toStageKey}` });
        return;
      }

      // update stage
      setDeals((prev) =>
        prev.map((d) =>
          d.id === dealId
            ? {
                ...d,
                stage: toStageKey,
                timeline: [
                  {
                    id: `A-${Math.random().toString(16).slice(2)}`,
                    type: "status",
                    at: now(),
                    text: `Статус → ${toStageKey}`,
                  },
                  ...(d.timeline || []),
                ],
              }
            : d
        )
      );

      push("good", "Этап обновлён", `Сделка ${dealId} → ${toStageKey}`);
    },
    [deals, computeMissingForStage, push, appendTimeline]
  );

  // Drag & Drop
  const onDragStart = useCallback((e, dealId) => {
    try {
      e.dataTransfer.setData("text/plain", dealId);
      e.dataTransfer.effectAllowed = "move";
    } catch {
      // ignore
    }
  }, []);

  const onDropStage = useCallback(
    async (e, stageKey) => {
      e.preventDefault();
      setDropOverStage(null);
      const id = e.dataTransfer.getData("text/plain");
      if (!id) return;
      await attemptMoveStage(id, stageKey);
    },
    [attemptMoveStage]
  );

  const onDragOverStage = useCallback((e, stageKey) => {
    e.preventDefault();
    setDropOverStage(stageKey);
  }, []);

  const onDragLeaveStage = useCallback(() => setDropOverStage(null), []);

  // Task completion -> Next action modal
  const completeTask = useCallback(
    (dealId, taskId) => {
      setNextActionModal({ dealId, taskId });
    },
    []
  );

  const submitNextAction = useCallback(
    async (dealId, taskId, nextTitle, nextDue) => {
      // Mark completed
      setDeals((prev) =>
        prev.map((d) => {
          if (d.id !== dealId) return d;
          const tasks = (d.tasks || []).map((t) => (t.id === taskId ? { ...t, done: true } : t));
          // Create next
          const nt = {
            id: `T-${Math.random().toString(16).slice(2)}`,
            title: nextTitle,
            due: nextDue,
            done: false,
          };
          return {
            ...d,
            tasks: [...tasks, nt],
            nextTaskAt: nextDue,
            timeline: [
              { id: `A-${Math.random().toString(16).slice(2)}`, type: "task", at: now(), text: `Задача выполнена → ${taskId}` },
              { id: `A-${Math.random().toString(16).slice(2)}`, type: "task", at: now(), text: `Следующее действие: ${nextTitle} (${nextDue})` },
              ...(d.timeline || []),
            ],
          };
        })
      );
      push("good", "Ок", "Задача закрыта. Следующее действие создано.");
      setNextActionModal(null);
      await mockApi.saveDealPatch(dealId, { tasks: "updated" });
    },
    [push]
  );

  // Call logging (simple)
  const openCallLog = useCallback(
    (dealId) => {
      setCallLogModal({ dealId });
    },
    []
  );

  const submitCallLog = useCallback(
    async (dealId, resultText) => {
      await appendTimeline(dealId, { type: "call", text: `Звонок: ${resultText}` });
      push("good", "Лог звонка", "Сохранено в Timeline.");
      setCallLogModal(null);
    },
    [appendTimeline, push]
  );

  // Plugins: add/remove + drag&drop
  const addPlugin = useCallback(
    (pluginId) => {
      const p = pluginCatalog.find((x) => x.id === pluginId);

      if (p && !isPluginUnlockedForPlan(p, plan)) {
        explainPluginLock(pluginId);
        return;
      }

      setInstalledPlugins((prev) => {
        if (prev.includes(pluginId)) {
          push("warn", "Уже добавлен", p ? p.title : "Этот плагин уже в списке.");
          return prev;
        }
        push("good", "Плагин добавлен", p ? p.title : "Добавлено.");
        return [...prev, pluginId];
      });
    },
    [push, plan, explainPluginLock]
  );

  const removePlugin = useCallback(
    (pluginId) => {
      const p = pluginCatalog.find((x) => x.id === pluginId);
      setInstalledPlugins((prev) => prev.filter((x) => x !== pluginId));
      push("good", "Убрано", p ? p.title : "Плагин удалён.");
    },
    [push]
  );

  // Deal plugins (назначение плагинов конкретному клиенту)
  const assignPluginToDeal = useCallback(
    (dealId, pluginId) => {
      if (!dealId) return;
      const p = pluginCatalog.find((x) => x.id === pluginId);

      if (p && !isPluginUnlockedForPlan(p, plan)) {
        explainPluginLock(pluginId);
        return;
      }

      // auto-install if dragged from Dock
      if (!installedPlugins.includes(pluginId)) {
        addPlugin(pluginId);
      }

      setDeals((prev) =>
        prev.map((d) => {
          if (d.id !== dealId) return d;
          const cur = d.plugins || [];
          if (cur.includes(pluginId)) return d;
          const ev = {
            id: `A-${Math.random().toString(16).slice(2)}`,
            type: "plugin",
            at: now(),
            text: `Плагин подключён: ${p ? p.title : pluginId}`,
          };
          return { ...d, plugins: [...cur, pluginId], timeline: [ev, ...(d.timeline || [])] };
        })
      );

      push("good", "Плагин назначен", `${p ? p.title : pluginId}`);
    },
    [installedPlugins, addPlugin, push, plan, explainPluginLock]
  );

  const unassignPluginFromDeal = useCallback(
    (dealId, pluginId) => {
      if (!dealId) return;
      const p = pluginCatalog.find((x) => x.id === pluginId);

      setDeals((prev) =>
        prev.map((d) => {
          if (d.id !== dealId) return d;
          const cur = d.plugins || [];
          if (!cur.includes(pluginId)) return d;
          const ev = {
            id: `A-${Math.random().toString(16).slice(2)}`,
            type: "plugin",
            at: now(),
            text: `Плагин отключён: ${p ? p.title : pluginId}`,
          };
          return { ...d, plugins: cur.filter((x) => x !== pluginId), timeline: [ev, ...(d.timeline || [])] };
        })
      );

      push("good", "Плагин снят", `${p ? p.title : pluginId}`);
    },
    [push]
  );


  const onDragStartPlugin = useCallback((e, pluginId) => {
    try {
      e.dataTransfer.setData("text/abqd-plugin", pluginId);
      e.dataTransfer.effectAllowed = "copy";
    } catch {
      // ignore
    }
  }, []);

  // quick: dedup warning (demo)
  const createDeal = useCallback(() => {
    const name = "Новый клиент";
    const dup = deals.find((d) => d.company.toLowerCase() === name.toLowerCase());
    if (dup) {
      push("warn", "Похоже на дубль", `Уже есть: ${dup.company} (${dup.id})`);
      setActiveDealId(dup.id);
      return;
    }
    const d = {
      id: `D-${Math.floor(2000 + Math.random() * 9000)}`,
      company: name,
      contact: "Контакт",
      stage: "inbox",
      amount: 0,
      currency: "RUB",
      score: 55,
      phone: "",
      email: "",
      fields: { budget: "", deadline: "", decisionMaker: "", inn: "", legalName: "", lostReason: "", note: "" },
      tags: ["new"],
      plugins: [],
      nextTaskAt: "",
      tasks: [],
      timeline: [{ id: `A-${Math.random().toString(16).slice(2)}`, type: "status", at: now(), text: "Создана сделка" }],
    };
    setDeals((prev) => [d, ...prev]);
    setActiveDealId(d.id);
    push("good", "Создано", "Новая сделка создана (demo).");
  }, [deals, push]);

  // Role dashboard cards
  const dashboardCards = useMemo(() => {
    if (role === "hunter") {
      return [
        { title: "Новые (Inbox)", value: (byStage.inbox || []).length, sub: "что обработать" },
        { title: "Просрочено", value: totals.bad, sub: "сделки без будущего шага" },
        { title: "Тёплые+", value: deals.filter((d) => d.score >= 70).length, sub: "приоритет на неделю" },
      ];
    }
    return [
      { title: "Выиграно", value: (byStage.won || []).length, sub: "текущие клиенты" },
      { title: "Сегодня", value: totals.warn, sub: "продления / касания" },
      { title: "Портфель", value: formatMoney(totals.money, "RUB"), sub: "все сделки (demo)" },
    ];
  }, [role, byStage, totals, deals]);

  return (
    <div className="abqd-root" data-theme={theme}>
      <style>{css}</style>

      <div className="abqd-wrap">
        <div className="abqd-top">
          <GlassCard className="abqd-bar">
            <div className="abqd-barRow">
              <div className="abqd-brand">
                <img
                  className="abqd-brandLogo"
                  src="https://static.tildacdn.com/tild3532-3636-4132-b064-346663353861/_abqd.png"
                  alt="abqd"
                />
                <div className="abqd-brandMeta">
                  <div className="abqd-h1">CRM</div>
                  <div className="abqd-brandSub">Kanban · Stepper · Timeline · Gates · Async saves</div>
                </div>
              </div>

              <Input value={query} onChange={setQuery} placeholder="Global Search: компания, контакт, ИНН, теги…" />
              <ThemeToggle theme={theme} setTheme={setTheme} />
              <Button onClick={createDeal}>+ Новая сделка</Button>
              <Button variant="secondary" onClick={() => push("warn", "Настройки (demo)", "В спринте 2: редактор полей/ролей WYSIWYG.")}>⚙ Настройки</Button>
            </div>
          </GlassCard>

          <GlassCard className="abqd-bar">
            <div className="abqd-barRow">
              <button
                type="button"
                className={cx("abqd-btn", "abqd-metal")}
                onClick={() => push("good", "Конструктор визитки", "В проде откроем app.abqd.ru/constructor/ (в прототипе — уведомление).")}
                style={{ display: "flex", alignItems: "center", gap: 10 }}
              >
                <span className="abqd-ibox">⌁</span>
                <span style={{ fontWeight: 900 }}>Конструктор визитки</span>
                <span style={{ opacity: 0.75 }}>→</span>
              </button>

              <span className="abqd-pill">
                <span className="abqd-muted">Роль</span>
                <span style={{ width: 6 }} />
                <button
                  type="button"
                  className={cx("abqd-btn", "abqd-btn--secondary")}
                  onClick={() => setRole(role === "hunter" ? "farmer" : "hunter")}
                  style={{ padding: "7px 10px", fontSize: 12, borderRadius: 14 }}
                >
                  {roleDefs[role].icon} {roleDefs[role].title}
                </button>
              </span>

              <span className="abqd-pill" title="Демо: переключай тариф и смотри доступность плагинов">
                <span className="abqd-muted">Тариф</span>
                <span style={{ width: 6 }} />
                <button
                  type="button"
                  className={cx("abqd-btn", "abqd-btn--secondary")}
                  onClick={cyclePlan}
                  style={{ padding: "7px 10px", fontSize: 12, borderRadius: 14 }}
                >
                  {planTitle(plan)}
                </button>
              </span>

              <span className="abqd-pill">
                <span className="abqd-muted">Компактно</span>
                <span style={{ width: 6 }} />
                <input type="checkbox" checked={compact} onChange={(e) => setCompact(e.target.checked)} />
              </span>

              <Button variant="secondary" onClick={() => setPluginsOpen(true)} title="Открыть каталог плагинов">
                🔌 Плагины
              </Button>

              <span className="abqd-pill">3 клика: поиск → сделка → действие</span>
              <span className="abqd-pill">Нет блокирующих save</span>

              <div style={{ marginLeft: "auto", display: "flex", gap: 10, flexWrap: "wrap" }}>
                <Button variant="secondary" onClick={() => push("good", "Экспорт", "В спринте 2: CSV/Excel экспорт + отчёты.")}>Экспорт</Button>
                <Button variant="secondary" onClick={() => push("warn", "Воронка", "В спринте 2: редактор стадий drag&drop + инструкции на этап.")}>Воронка</Button>
              </div>
            </div>
          </GlassCard>
        </div>

        <div className="abqd-grid" style={{ "--sbw": sidebarSlim ? "108px" : "280px" }}>
          {/* LEFT */}
          <div className={cx("abqd-sidebar", sidebarSlim && "is-slim")}>
            <GlassCard className="abqd-section">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                <div className="abqd-h1" title={sidebarSlim ? `Dashboard · ${roleDefs[role].title}` : undefined}>
                  {sidebarSlim ? "📊" : <>Dashboard · {roleDefs[role].title}</>}
                </div>
                <button
                  type="button"
                  className={cx("abqd-btn", "abqd-btn--secondary", "abqd-btn--sm", "abqd-onlyDesktop")}
                  onClick={() => setSidebarSlim((v) => !v)}
                  title={sidebarSlim ? "Раскрыть панель" : "Свернуть панель"}
                  aria-label={sidebarSlim ? "Раскрыть панель" : "Свернуть панель"}
                >
                  {sidebarSlim ? "⇤" : "⇥"}
                </button>
              </div>

              <div className="abqd-wideOnly">
                <div className="abqd-muted" style={{ marginTop: 4, fontSize: 12 }}>
                  {roleDefs[role].subtitle}
                </div>
                <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
                  {dashboardCards.map((c) => (
                    <div key={c.title} className="abqd-listRow">
                      <div className="abqd-timeRow">
                        <div style={{ minWidth: 0 }}>
                          <div className="abqd-strong abqd-trunc">{c.title}</div>
                          <div className="abqd-timeMeta">{c.sub}</div>
                        </div>
                        <div className="abqd-strong" style={{ whiteSpace: "nowrap" }}>{c.value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="abqd-slimOnly" style={{ marginTop: 10, display: "grid", gap: 10 }}>
                <div className="abqd-listRow" title={roleDefs[role].subtitle}>
                  <div className="abqd-timeRow" style={{ justifyContent: "center" }}>
                    <div className="abqd-strong">{roleDefs[role].icon}</div>
                    <div className="abqd-strong">{filtered.length}</div>
                  </div>
                </div>
                <div className="abqd-listRow" title="Просрочено">
                  <div className="abqd-timeRow" style={{ justifyContent: "center" }}>
                    <div className="abqd-strong">⛔</div>
                    <div className="abqd-strong">{totals.bad}</div>
                  </div>
                </div>
                <div className="abqd-listRow" title="Тёплые+">
                  <div className="abqd-timeRow" style={{ justifyContent: "center" }}>
                    <div className="abqd-strong">🔥</div>
                    <div className="abqd-strong">{deals.filter((d) => d.score >= 70).length}</div>
                  </div>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="abqd-section">
              <div className="abqd-h1" title="Качество данных">{sidebarSlim ? "✅" : "Качество данных"}</div>

              <div className="abqd-wideOnly">
                <div className="abqd-muted" style={{ marginTop: 4, fontSize: 12, lineHeight: 1.45 }}>
                  Система должна защищать от «грязи»: маски, дедуп, обязательные поля на этап.
                </div>
                <div className="abqd-list">
                  <div className="abqd-listRow">Dedup: email/phone/ИНН (в прототипе — предупреждение)</div>
                  <div className="abqd-listRow">Gates: блокируем переход без ключевых полей</div>
                  <div className="abqd-listRow">Timeline: все события в одном журнале</div>
                </div>
              </div>

              <div className="abqd-slimOnly" style={{ marginTop: 10, display: "grid", gap: 10, justifyItems: "center" }}>
                <span className="abqd-pill" title="Dedup: email/phone/ИНН">🧼</span>
                <span className="abqd-pill" title="Gates: обязательные поля на этап">⛩️</span>
                <span className="abqd-pill" title="Timeline: единая лента">🧾</span>
              </div>
            </GlassCard>

            <GlassCard className="abqd-section">
              <div className="abqd-h1" title="Скорость">{sidebarSlim ? "⚡" : "Скорость"}</div>

              <div className="abqd-wideOnly">
                <div className="abqd-muted" style={{ marginTop: 4, fontSize: 12, lineHeight: 1.45 }}>
                  Без тяжёлых «enterprise» надстроек на старте. Сначала события + процесс + автоматизация.
                </div>
                <div className="abqd-list">
                  <div className="abqd-listRow">Асинхронные сохранения + Toast</div>
                  <div className="abqd-listRow">Inline-edit без перезагрузок</div>
                  <div className="abqd-listRow">Канбан DnD без библиотек</div>
                </div>
              </div>

              <div className="abqd-slimOnly" style={{ marginTop: 10, display: "grid", gap: 10, justifyItems: "center" }}>
                <span className="abqd-pill" title="Асинхронные сохранения">⏱️</span>
                <span className="abqd-pill" title="Inline-edit">✍️</span>
                <span className="abqd-pill" title="Drag & Drop">🧲</span>
              </div>
            </GlassCard>

            <GlassCard className="abqd-section">
              <div className="abqd-h1" title="Плагины">{sidebarSlim ? "🔌" : "Плагины"}</div>

              <div className="abqd-wideOnly">
                <div className="abqd-muted" style={{ marginTop: 4, fontSize: 12, lineHeight: 1.45 }}>
                  Открой левую панель с каталогом: установи плагины в CRM и назначай их клиентам внутри сделки.
                </div>
                <Button variant="secondary" className="abqd-btn--full" onClick={() => setPluginsOpen(true)}>
                  Открыть каталог плагинов
                </Button>
              </div>

              <div className="abqd-slimOnly" style={{ marginTop: 10, display: "grid", gap: 10, justifyItems: "center" }}>
                <Button variant="secondary" small onClick={() => setPluginsOpen(true)} title="Открыть каталог">
                  🔌
                </Button>
                <span className="abqd-pill" title="Установлено в CRM">{installedPlugins.length}</span>
              </div>
            </GlassCard>
          </div>

          {/* RIGHT */}
          <div style={{ display: "grid", gap: 12 }}>

            <GlassCard className="abqd-section">
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                <div>
                  <div className="abqd-h1">Pipeline · Канбан</div>
                  <div className="abqd-muted" style={{ marginTop: 4, fontSize: 12 }}>
                    Перетаскивай сделку между этапами. Gates проверяются на drop.
                  </div>
                </div>
                <span className="abqd-pill">Сделок: {filtered.length}</span>
              </div>

              <div style={{ marginTop: 12 }}>
                <div className="abqd-kanban">
                  {demoStages.map((stage) => (
                    <GlassCard
                      key={stage.key}
                      className={cx("abqd-col", "abqd-droptarget", dropOverStage === stage.key && "is-over")}
                      onDragOver={(e) => onDragOverStage(e, stage.key)}
                      onDragLeave={onDragLeaveStage}
                      onDrop={(e) => onDropStage(e, stage.key)}
                    >
                      <div className="abqd-colHead">
                        <div style={{ minWidth: 0 }}>
                          <div className="abqd-colTitle">{stage.title}</div>
                          <div className="abqd-colHint">{stage.hint}</div>
                        </div>
                        <span className="abqd-pill">{(byStage[stage.key] || []).length}</span>
                      </div>

                      <div className="abqd-cardRail">
                        <div className={cx("abqd-cardGrid", compact && "is-compact")}>
                          {(byStage[stage.key] || []).map((d) => (
                            <DealCard key={d.id} deal={d} onOpen={openDeal} onDragStart={onDragStart} />
                          ))}
                        </div>
                      </div>

                      <div className="abqd-muted" style={{ fontSize: 12, marginTop: 10, lineHeight: 1.35 }}>
                        Gates: {stage.gates && stage.gates.length ? stage.gates.join(", ") : "нет"}
                      </div>
                    </GlassCard>
                  ))}
                </div>
              </div>
            </GlassCard>

            <div className="abqd-foot">Это прототип: логика gates/async/toasts/drag&drop/таймлайн уже «живая». Дальше подключаем API + RBAC + биллинг + интеграции.</div>
          </div>
        </div>

        {activeDeal ? (
          <DealDrawer
            deal={activeDeal}
            stages={demoStages}
            missingGates={drawerMissing}
            onClose={closeDrawer}
            onPatch={(patch) => patchDeal(activeDeal.id, patch)}
            onMoveStage={(toStage) => attemptMoveStage(activeDeal.id, toStage)}
            onAppendTimeline={(ev) => {
              appendTimeline(activeDeal.id, ev);
              if (ev.type === "call") {
                // optional: open log modal explicitly
                openCallLog(activeDeal.id);
              }
            }}
            onCompleteTask={(taskId) => completeTask(activeDeal.id, taskId)}
            installedPlugins={installedPlugins}
            pluginCatalog={pluginCatalog}
            onAssignPlugin={(pid) => assignPluginToDeal(activeDeal.id, pid)}
            onUnassignPlugin={(pid) => unassignPluginFromDeal(activeDeal.id, pid)}
            plan={plan}
            onExplainPluginLock={explainPluginLock}
          />
        ) : null}

        {nextActionModal ? (
          <NextActionModal
            deal={deals.find((d) => d.id === nextActionModal.dealId)}
            taskId={nextActionModal.taskId}
            onClose={() => setNextActionModal(null)}
            onSubmit={(title, due) => {
              if (!title || !due) {
                push("warn", "Нужно заполнить", "Название и дата следующего действия обязательны.");
                return;
              }
              submitNextAction(nextActionModal.dealId, nextActionModal.taskId, title, due);
            }}
          />
        ) : null}

        {callLogModal ? (
          <CallLogModal
            deal={deals.find((d) => d.id === callLogModal.dealId)}
            onClose={() => setCallLogModal(null)}
            onSubmit={(txt) => submitCallLog(callLogModal.dealId, txt)}
          />
        ) : null}
        <PluginsDrawer
          open={pluginsOpen}
          onClose={() => setPluginsOpen(false)}
          pluginCatalog={pluginCatalog}
          installedPlugins={installedPlugins}
          plan={plan}
          onAdd={addPlugin}
          onRemove={removePlugin}
          onExplainLock={explainPluginLock}
          onDragStartPlugin={onDragStartPlugin}
        />

        <div className="abqd-toasts" aria-live="polite">
          {toasts.map((t) => (
            <div key={t.id} className={cx("abqd-toast", t.tone === "good" ? "tone-good" : t.tone === "warn" ? "tone-warn" : "tone-bad")}>
              <div className="abqd-toastTitle">{t.title}</div>
              <div className="abqd-toastText">{t.text}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function NextActionModal({ deal, taskId, onClose, onSubmit }) {
  const [title, setTitle] = useState("");
  const [due, setDue] = useState("2026-01-27");

  return (
    <Modal
      title="Что делаем дальше?"
      onClose={onClose}
      actions={
        <>
          <Button variant="secondary" onClick={onClose}>
            Отмена
          </Button>
          <Button onClick={() => onSubmit(title, due)}>Создать след. шаг</Button>
        </>
      }
    >
      <div className="abqd-muted" style={{ fontSize: 12, lineHeight: 1.45 }}>
        Сделка без будущего действия — потерянные деньги. Поэтому после закрытия задачи требуем следующий шаг.
      </div>

      <div style={{ marginTop: 12 }} className="abqd-formGrid">
        <div className="abqd-field">
          <div className="abqd-fieldLabel">Сделка</div>
          <div className="abqd-fieldValue">{deal ? `${deal.company} (${deal.id})` : "—"}</div>
          <div className="abqd-muted" style={{ fontSize: 11, marginTop: 6 }}>
            Закрыта задача: {taskId}
          </div>
        </div>
        <div className="abqd-field">
          <div className="abqd-fieldLabel">Дата</div>
          <input className="abqd-fieldInput" value={due} onChange={(e) => setDue(e.target.value)} />
          <div className="abqd-muted" style={{ fontSize: 11, marginTop: 6 }}>YYYY-MM-DD</div>
        </div>
        <div className="abqd-field" style={{ gridColumn: "1 / -1" }}>
          <div className="abqd-fieldLabel">Следующее действие</div>
          <input
            className="abqd-fieldInput"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Например: Перезвонить, отправить КП, уточнить ИНН…"
          />
        </div>
      </div>
    </Modal>
  );
}

function CallLogModal({ deal, onClose, onSubmit }) {
  const [txt, setTxt] = useState("Дозвонился, назначили следующий созвон");
  return (
    <Modal
      title="Лог звонка"
      onClose={onClose}
      actions={
        <>
          <Button variant="secondary" onClick={onClose}>
            Отмена
          </Button>
          <Button onClick={() => onSubmit(txt)}>Сохранить</Button>
        </>
      }
    >
      <div className="abqd-muted" style={{ fontSize: 12, lineHeight: 1.45 }}>
        Click-to-Call запускает звонок, а CRM тут же просит результат — чтобы Timeline оставался полным.
      </div>
      <div style={{ marginTop: 12 }} className="abqd-field">
        <div className="abqd-fieldLabel">Сделка</div>
        <div className="abqd-fieldValue">{deal ? `${deal.company} · ${deal.phone}` : "—"}</div>
      </div>
      <div style={{ marginTop: 10 }} className="abqd-field">
        <div className="abqd-fieldLabel">Итог</div>
        <textarea className="abqd-fieldInput" rows={3} value={txt} onChange={(e) => setTxt(e.target.value)} />
      </div>
    </Modal>
  );
}
