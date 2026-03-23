import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Search, Moon, Sun, Plus, CheckCircle2, AlertCircle, Clock, Zap, Bot,
  Calendar as CalendarIcon, BarChart3, X, Users, Target, Phone, Video, Briefcase, Bell, Globe, Check, Link2, Settings, Lock,
  Trash2, PanelLeftClose, PanelLeftOpen, Cloud, PlusCircle, RefreshCw,
  GripHorizontal, LayoutDashboard, CalendarDays, ChevronLeft, ChevronRight,
  MessageSquare, Paperclip, History, FileText, Send, Mail, MapPin, Eye, ExternalLink,
  MessageCircle, Save, GripVertical, ChevronDown, TrendingUp, Target as TargetIcon, BrainCircuit
} from 'lucide-react';

// ==========================================
// 1. КОНСТАНТЫ И CRM API
// ==========================================

const CRM_API_BASE = 'https://api.abqd.ru/api/v1/crm';
const AUTH_TOKEN_KEY = 'abqd_token';

const getAuthToken = () => {
  try {
    return localStorage.getItem(AUTH_TOKEN_KEY) || '';
  } catch {
    return '';
  }
};

const getAuthHeaders = () => {
  const token = getAuthToken();
  if (!token) return null;
  return {
    'Content-Type': 'application/json',
    'Authorization': token.startsWith('Bearer ') ? token : `Bearer ${token}`,
  };
};

async function crmLoadState() {
  const headers = getAuthHeaders();
  if (!headers) throw new Error('NO_AUTH_TOKEN');

  const res = await fetch(`${CRM_API_BASE}/state`, {
    method: 'GET',
    headers,
  });

  if (!res.ok) {
    throw new Error(`CRM_LOAD_HTTP_${res.status}`);
  }

  const data = await res.json();
  const state = data?.state || data || {};

  return {
    deals: Array.isArray(state.deals) ? state.deals.map(normalizeDeal) : [],
    stages: Array.isArray(state.stages) ? state.stages : [],
  };
}

async function crmSaveState(payload) {
  const headers = getAuthHeaders();
  if (!headers) throw new Error('NO_AUTH_TOKEN');

  const res = await fetch(`${CRM_API_BASE}/state`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`CRM_SAVE_HTTP_${res.status}`);
  }

  return await res.json();
}

const PLUGINS = [
  { id: "ai_agent", title: "AI агент", icon: <Bot className="w-4 h-4" />, desc: "Next Action и резюме" },
  { id: "calendar", title: "Календарь", icon: <CalendarIcon className="w-4 h-4" />, desc: "Встречи и слоты" },
  { id: "analytics", title: "Аналитика", icon: <BarChart3 className="w-4 h-4" />, desc: "Конверсия воронки" },
];

const INITIAL_STAGES = [
  { key: "inbox", title: "Входящие", color: "bg-slate-400", gates: [] },
  { key: "qual", title: "Квалификация", color: "bg-blue-400", gates: ["budget", "deadline"] },
  { key: "proposal", title: "Предложение", color: "bg-indigo-400", gates: ["decisionMaker", "email"] },
  { key: "contract", title: "Договор", color: "bg-violet-400", gates: ["inn", "legalName"] },
  { key: "won", title: "Выиграно", color: "bg-emerald-400", gates: [] },
];

const ROLES = {
  novice: { title: "Новички", desc: "Работа с новыми лидами" },
  worker: { title: "Рабочие", desc: "Ведение текущих сделок" },
};

const getTodayDateStr = () => new Date().toISOString().split('T')[0];
const getTomorrowDateStr = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
};

const INITIAL_DEALS = [
  {
    id: "D-1001", company: "SOVA Studio", contact: "Анастасия", stage: "contract",
    amount: 180000, currency: "RUB", score: 78, phone: "+7 900 111-22-33", email: "hello@sova.studio",
    fields: { budget: "180k", deadline: "", note: "Интерес к CRM-системе.", address: "г. Москва, ул. Тверская, д. 15" }, tags: ["warm"], nextTaskAt: getTodayDateStr(), plugins: ["ai_agent"],
    priority: "high", status: "active",
    participants: [{ id: 'u1', name: 'Иван И.', role: 'owner', avatar: 'bg-indigo-500' }],
    externalContacts: [{ id: 'c1', name: 'Анастасия', company: 'SOVA Studio', role: 'CEO', phone: '+7 900 111-22-33' }],
    attachments: [{ id: 'f1', name: 'ТЗ_проект.pdf', size: '2.4 MB', type: 'pdf', provider: 'google' }],
    connectedChannels: ['telegram'],
    messages: [{ id: 'm1', text: 'Добрый день! Отправили вам ТЗ на ознакомление.', channel: 'telegram', author: 'Анастасия', isOutbound: false, time: '10:45' }],
    activities: [{ id: 'a1', text: 'Карточка создана', date: getTodayDateStr(), time: '10:00', type: 'system' }],
    touches: [
      { id: 't1', user: 'Анна С.', action: 'Прочитала Telegram', time: '10 мин назад' },
      { id: 't2', user: 'Иван И.', action: 'Открыл карточку', time: '1 час назад' }
    ]
  },
  {
    id: "D-1002", company: "Nord Realty", contact: "Алексей", stage: "inbox",
    amount: 320000, currency: "RUB", score: 85, phone: "+7 900 444-55-66", email: "info@nord.re",
    fields: { budget: "300k+", deadline: "март", note: "Нужен календарь встреч.", address: "" }, tags: ["hot"], nextTaskAt: getTomorrowDateStr(), plugins: ["calendar", "analytics"],
    priority: "normal", status: "active",
    participants: [{ id: 'u1', name: 'Иван И.', role: 'owner', avatar: 'bg-indigo-500' }, { id: 'u2', name: 'Анна С.', role: 'editor', avatar: 'bg-rose-500' }],
    externalContacts: [{ id: 'c2', name: 'Алексей', company: 'Nord Realty', role: 'CTO', phone: '+7 900 444-55-66' }],
    attachments: [],
    connectedChannels: [],
    messages: [],
    activities: [{ id: 'a2', text: 'Карточка переведена во Входящие', date: getTodayDateStr(), time: '14:20', type: 'stage_change' }],
    touches: [{ id: 't3', user: 'Иван И.', action: 'Просмотр контактов', time: 'Вчера' }]
  },
  {
    id: "D-1003", company: "Мойка окон", contact: "Сергей", stage: "contract",
    amount: 50000, currency: "RUB", score: 40, phone: "", email: "",
    fields: { budget: "", deadline: "", note: "", address: "" }, tags: [], nextTaskAt: "", plugins: [],
    priority: "normal", status: "active",
    participants: [], externalContacts: [], attachments: [], connectedChannels: [], messages: [], activities: [], touches: []
  }
];

const DAYS_OF_WEEK = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
const MONTHS = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];

// ==========================================
// 2. УТИЛИТЫ И СТИЛИ
// ==========================================

const formatMoney = (amount, currency = "RUB") => {
  return new Intl.NumberFormat("ru-RU", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount || 0);
};

const getScoreInfo = (score) => {
  if (score >= 85) return { text: "Горячий", color: "text-orange-400 bg-orange-400/10 border-orange-400/20" };
  if (score >= 70) return { text: "Тёплый", color: "text-amber-400 bg-amber-400/10 border-amber-400/20" };
  return { text: "Холодный", color: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20" };
};

const getDueStatus = (dateStr) => {
  if (!dateStr) return "none";
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  if (target < today) return "expired";
  if (target.getTime() === today.getTime()) return "today";
  return "future";
};

const getThemeStyles = (theme) => ({
  dark: {
    bg: 'bg-[#0f0c1b]',
    panel: 'bg-[#1b1828]',
    panelBorder: 'border-[#2a253a]',
    sidebar: 'bg-[#141120]',
    card: 'bg-[#221f30]',
    cardHover: 'hover:bg-[#2a263a]',
    text: 'text-[#F3F4F6]',
    textMuted: 'text-[#8b8698]',
    input: 'bg-[#141120] border-[#2a253a]',
    accentGradient: 'bg-gradient-to-r from-[#fe387b] to-[#7a31ff]',
    accentText: 'text-indigo-400',
    calendarCellHover: 'hover:bg-[#1a1725]/50'
  },
  light: {
    bg: 'bg-[#F8FAFC]', panel: 'bg-white', panelBorder: 'border-slate-200',
    sidebar: 'bg-[#F1F5F9]', card: 'bg-white', cardHover: 'hover:bg-slate-50',
    text: 'text-slate-900', textMuted: 'text-slate-500', input: 'bg-slate-100 border-slate-200',
    accentGradient: 'bg-gradient-to-r from-[#fe387b] to-[#7a31ff]',
    accentText: 'text-indigo-600',
    calendarCellHover: 'hover:bg-slate-50'
  }
}[theme]);

const Badge = ({ children, className = "" }) => (
  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition-all duration-300 ${className}`}>{children}</span>
);

const ensureArray = (v) => Array.isArray(v) ? v : [];
const ensureObject = (v) => (v && typeof v === 'object' && !Array.isArray(v)) ? v : {};

const normalizeDeal = (d = {}) => ({
  ...d,
  id: d?.id || `D-${Date.now()}`,
  company: d?.company || "Новая сделка",
  contact: d?.contact || "-",
  stage: d?.stage || "inbox",
  amount: Number(d?.amount) || 0,
  currency: d?.currency || "RUB",
  score: Number(d?.score) || 50,
  phone: d?.phone || "",
  email: d?.email || "",
  source: d?.source || "Неизвестно",
  address: d?.address || "",
  priority: d?.priority || "medium",
  description: d?.description || "",
  nextStep: d?.nextStep || "",
  nextTaskAt: d?.nextTaskAt || "",
  status: d?.status || "active",
  fields: ensureObject(d?.fields),
  tags: ensureArray(d?.tags),
  plugins: ensureArray(d?.plugins),
  participants: ensureArray(d?.participants),
  externalContacts: ensureArray(d?.externalContacts),
  attachments: ensureArray(d?.attachments),
  connectedChannels: ensureArray(d?.connectedChannels),
  messages: ensureArray(d?.messages),
  activities: ensureArray(d?.activities),
  touches: ensureArray(d?.touches),
});

// ==========================================
// 3. ПОДКОМПОНЕНТЫ
// ==========================================

function AnalyticsView({ deals, stages, themeStyles, theme, onOpenDeal }) {
  const [targetRevenue] = useState(1000000);
  const [aiQuery, setAiQuery] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const wonDeals = deals.filter(d => d.stage === 'won');
  const totalWon = wonDeals.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
  const potentialDeals = deals.filter(d => d.stage !== 'won');
  const potentialAmount = potentialDeals.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
  const dealsWithAmount = deals.filter(d => Number(d.amount) > 0);
  const avgCheck = dealsWithAmount.length > 0
    ? dealsWithAmount.reduce((sum, d) => sum + Number(d.amount), 0) / dealsWithAmount.length
    : 0;
  const winRate = deals.length > 0 ? ((wonDeals.length / deals.length) * 100).toFixed(1) : 0;
  const progressPercent = targetRevenue > 0 ? Math.min((totalWon / targetRevenue) * 100, 100).toFixed(1) : 0;

  const volumeByStage = stages.map(s => {
    const stDeals = deals.filter(d => d.stage === s.key);
    const sum = stDeals.reduce((acc, d) => acc + (Number(d.amount) || 0), 0);
    return { ...s, amount: sum, count: stDeals.length };
  });

  const topTouches = [...deals]
    .map(d => ({ ...d, touchCount: ensureArray(d.touches).length }))
    .sort((a, b) => b.touchCount - a.touchCount)
    .slice(0, 5);

  const handleGeneratePlan = () => {
    setIsAnalyzing(true);
    setAiResponse("");
    setTimeout(() => {
      setAiResponse(
        "Анализ завершен.\n\n" +
        "1. Обратите внимание на сделку 'Nord Realty' — высокий чек и мало касаний.\n" +
        "2. У 'SOVA Studio' этап 'Договор' — идеальный момент для закрытия.\n" +
        "3. Есть сделки без суммы — обновите данные для точной аналитики."
      );
      setIsAnalyzing(false);
    }, 1200);
  };

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-8 h-full overflow-y-auto custom-scrollbar animate-in fade-in duration-300">
      <div className="max-w-6xl w-full mx-auto space-y-8">
        <div>
          <h2 className={`text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-3 ${themeStyles.text}`}>
            <div className={`p-2.5 rounded-2xl text-white shadow-lg ${themeStyles.accentGradient}`}>
              <BarChart3 size={28} />
            </div>
            Аналитика и Цели
          </h2>
          <p className={`text-sm mt-2 font-medium ${themeStyles.textMuted}`}>
            Управление показателями и поиск точек роста.
          </p>
        </div>

        <div className={`p-6 sm:p-8 rounded-[2rem] border shadow-xl ${themeStyles.panel} ${themeStyles.panelBorder}`}>
          <div className="flex items-center gap-3 mb-6">
            <Zap size={20} className={themeStyles.accentText} />
            <div>
              <h3 className={`text-lg font-black tracking-tight ${themeStyles.text}`}>AI-Стратег</h3>
              <p className={`text-[10px] uppercase tracking-widest ${themeStyles.textMuted}`}>Искусственный интеллект анализирует воронку.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <textarea
                value={aiQuery}
                onChange={e => setAiQuery(e.target.value)}
                placeholder="Задайте вопрос по воронке..."
                className={`w-full h-32 p-5 rounded-2xl text-sm leading-relaxed border outline-none resize-none transition-all ${themeStyles.input} ${themeStyles.text}`}
              />
              <button
                onClick={handleGeneratePlan}
                disabled={isAnalyzing}
                className={`w-full px-6 py-4 rounded-2xl font-bold text-sm text-white shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 ${themeStyles.accentGradient} ${isAnalyzing ? 'opacity-70' : 'hover:opacity-90'}`}
              >
                {isAnalyzing ? <RefreshCw size={18} className="animate-spin" /> : <Bot size={18} />}
                {isAnalyzing ? 'Анализирую...' : 'Сгенерировать план'}
              </button>
            </div>

            <div className={`p-6 rounded-2xl border flex flex-col ${theme === 'dark' ? 'bg-[#141120] border-[#2a2636]' : 'bg-slate-50 border-slate-200'}`}>
              <h4 className={`text-[10px] font-black uppercase tracking-widest mb-4 flex items-center gap-2 ${themeStyles.textMuted}`}>
                <FileText size={14} /> Отчет нейросети
              </h4>
              {aiResponse ? (
                <div className={`text-sm leading-relaxed whitespace-pre-wrap flex-1 overflow-y-auto custom-scrollbar pr-2 ${themeStyles.text}`}>
                  {aiResponse}
                </div>
              ) : (
                <div className={`flex-1 flex flex-col items-center justify-center text-center opacity-40 ${themeStyles.textMuted}`}>
                  <BrainCircuit size={48} className="mb-4 opacity-50" />
                  <p className="text-sm font-medium max-w-xs">Отправьте запрос слева, чтобы получить стратегию.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className={`p-6 rounded-3xl border shadow-sm flex flex-col justify-between ${themeStyles.panel} ${themeStyles.panelBorder}`}>
            <div>
              <p className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${themeStyles.textMuted} mb-2`}>
                <TargetIcon size={12} /> Прогресс выручки
              </p>
              <h3 className={`text-2xl font-black tracking-tight ${themeStyles.text}`}>{formatMoney(totalWon)}</h3>
            </div>
            <div className="mt-6 space-y-2">
              <div className="flex justify-between items-center text-[10px] font-bold">
                <span className={themeStyles.textMuted}>Цель: {formatMoney(targetRevenue)}</span>
                <span className={themeStyles.accentText}>{progressPercent}%</span>
              </div>
              <div className={`w-full h-2 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-[#141120]' : 'bg-slate-100'}`}>
                <div className={`h-full rounded-full ${themeStyles.accentGradient}`} style={{ width: `${progressPercent}%` }} />
              </div>
            </div>
          </div>

          <div className={`p-6 rounded-3xl border shadow-sm flex flex-col justify-between ${themeStyles.panel} ${themeStyles.panelBorder}`}>
            <div>
              <p className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${themeStyles.textMuted} mb-2`}>
                <TrendingUp size={12} /> Потенциал в работе
              </p>
              <h3 className={`text-2xl font-black tracking-tight ${themeStyles.text}`}>{formatMoney(potentialAmount)}</h3>
            </div>
            <div className="mt-6">
              <p className={`text-xs font-medium ${themeStyles.textMuted}`}>Сумма всех активных сделок в воронке.</p>
            </div>
          </div>

          <div className={`p-6 rounded-3xl border shadow-sm flex flex-col justify-between ${themeStyles.panel} ${themeStyles.panelBorder}`}>
            <div>
              <p className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${themeStyles.textMuted} mb-2`}>
                <Briefcase size={12} /> Средний чек
              </p>
              <h3 className={`text-2xl font-black tracking-tight ${themeStyles.text}`}>{formatMoney(avgCheck)}</h3>
            </div>
            <div className="mt-6">
              <p className={`text-xs font-medium ${themeStyles.textMuted}`}>По сделкам с суммой.</p>
            </div>
          </div>

          <div className={`p-6 rounded-3xl border shadow-sm flex flex-col justify-between ${themeStyles.panel} ${themeStyles.panelBorder}`}>
            <div>
              <p className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${themeStyles.textMuted} mb-2`}>
                <CheckCircle2 size={12} /> Успешность
              </p>
              <h3 className={`text-2xl font-black tracking-tight ${themeStyles.text}`}>{winRate}%</h3>
            </div>
            <div className="mt-6">
              <p className={`text-xs font-medium ${themeStyles.textMuted}`}>Процент успешно закрытых карточек.</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-8">
          <div className={`p-6 sm:p-8 rounded-[2rem] border shadow-xl ${themeStyles.panel} ${themeStyles.panelBorder}`}>
            <div className="mb-6">
              <h3 className={`text-lg font-black tracking-tight ${themeStyles.text}`}>Матрица потенциала</h3>
              <p className={`text-xs mt-1 ${themeStyles.textMuted}`}>Объем средств по этапам.</p>
            </div>
            <div className="space-y-4">
              {volumeByStage.map(s => {
                const maxAmount = Math.max(...volumeByStage.map(x => x.amount), 1);
                const percent = (s.amount / maxAmount) * 100;
                return (
                  <div key={s.key} className="space-y-2">
                    <div className="flex justify-between items-end">
                      <span className={`text-sm font-bold ${themeStyles.text}`}>{s.title}</span>
                      <span className={`text-xs font-black ${themeStyles.textMuted}`}>{formatMoney(s.amount)}</span>
                    </div>
                    <div className={`w-full h-3 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-[#141120]' : 'bg-slate-100'}`}>
                      <div className={`h-full rounded-full transition-all duration-500 ${s.color}`} style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className={`p-6 sm:p-8 rounded-[2rem] border shadow-xl flex flex-col ${themeStyles.panel} ${themeStyles.panelBorder}`}>
            <div className="mb-6">
              <h3 className={`text-lg font-black tracking-tight ${themeStyles.text}`}>Интенсивность касаний</h3>
              <p className={`text-xs mt-1 ${themeStyles.textMuted}`}>Топ карточек по касаниям.</p>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto pr-2 custom-scrollbar">
              {topTouches.map(deal => {
                const stageObj = stages.find(s => s.key === deal.stage);
                return (
                  <div key={deal.id} onClick={() => onOpenDeal(deal.id)} className={`flex items-center justify-between p-4 rounded-2xl border shadow-sm transition-all cursor-pointer group hover:border-[#7a31ff]/50 ${theme === 'dark' ? 'bg-[#141120] border-[#2a2636]' : 'bg-slate-50 border-slate-200'}`}>
                    <div className="flex flex-col min-w-0">
                      <span className={`text-sm font-bold truncate group-hover:text-[#7a31ff] transition-colors ${themeStyles.text}`}>{deal.company}</span>
                      <span className={`text-[10px] mt-1 truncate ${themeStyles.textMuted}`}>{stageObj ? stageObj.title : deal.stage}</span>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right flex flex-col items-end">
                        <span className={`text-xs font-black flex items-center gap-1 ${themeStyles.accentText}`}><Eye size={12} /> {deal.touchCount} касаний</span>
                        <span className={`text-[10px] font-bold mt-1 ${themeStyles.textMuted}`}>{formatMoney(deal.amount)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
              {topTouches.length === 0 && (
                <div className={`text-sm text-center py-4 opacity-50 ${themeStyles.textMuted}`}>Нет карточек в работе</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function IntegrationSection({ isSyncing, connections, onOpenSettings, themeStyles, theme }) {
  return (
    <div className={`rounded-3xl p-6 shadow-2xl border ${themeStyles.panel} ${themeStyles.panelBorder} transition-colors`}>
      <h3 className={`text-[11px] font-black uppercase tracking-[0.2em] mb-5 flex items-center justify-between ${themeStyles.textMuted}`}>
        Интеграции
        {isSyncing && <RefreshCw size={12} className="animate-spin text-[#fe387b]" />}
      </h3>
      <div className="space-y-3">
        <div className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${theme === 'dark' ? 'bg-[#0c0a13] border-[#2a2636]' : 'bg-blue-50 border-blue-100'}`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl shadow-sm border ${themeStyles.panel} ${theme === 'dark' ? 'border-[#2a2636]' : 'border-blue-200'}`}>
              <Users size={16} className={theme === 'dark' ? 'text-white' : 'text-blue-600'} />
            </div>
            <span className={`text-xs font-black tracking-tight ${themeStyles.text}`}>CRM Dashboard</span>
          </div>
          <div className="w-2 h-2 rounded-full bg-[#10b981] shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
        </div>

        <button onClick={() => onOpenSettings('google')} className={`w-full flex items-center justify-between p-3 rounded-2xl border transition-all group ${connections.google ? (theme === 'dark' ? 'bg-[#0c0a13] border-[#3b82f6]/50 text-white' : 'bg-blue-50 border-blue-300 text-blue-700') : (theme === 'dark' ? 'bg-transparent border-[#2a2636] text-[#888399] hover:border-[#7a31ff]/50' : 'bg-transparent border-slate-200 text-slate-500 hover:border-blue-400')}`}>
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 flex items-center justify-center rounded-xl border transition-all ${connections.google ? (theme === 'dark' ? 'bg-[#161420] border-[#3b82f6]/30' : 'bg-white border-blue-200') : (theme === 'dark' ? 'bg-[#161420] border-[#2a2636] group-hover:scale-110' : 'bg-slate-50 border-slate-200 group-hover:scale-110')}`}>
              <img src="https://www.google.com/favicon.ico" alt="G" className={`w-4 h-4 ${connections.google ? '' : 'grayscale group-hover:grayscale-0 transition-all'}`} />
            </div>
            <span className={`text-xs font-bold transition-colors ${connections.google ? '' : `group-hover:${themeStyles.text}`}`}>Google Calendar</span>
          </div>
          {connections.google ? (
            <div className="flex items-center gap-2">
              <Check size={16} className="text-[#3b82f6]" />
              <div className="p-1 hover:bg-black/10 rounded-md transition-colors"><Settings size={14} className={`${themeStyles.textMuted} hover:text-[#3b82f6]`} /></div>
            </div>
          ) : <Link2 size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />}
        </button>

        <button onClick={() => onOpenSettings('yandex')} className={`w-full flex items-center justify-between p-3 rounded-2xl border transition-all group ${connections.yandex ? (theme === 'dark' ? 'bg-[#0c0a13] border-[#ff4d6d]/50 text-white' : 'bg-red-50 border-red-300 text-red-700') : (theme === 'dark' ? 'bg-transparent border-[#2a2636] text-[#888399] hover:border-[#ff4d6d]/50' : 'bg-transparent border-slate-200 text-slate-500 hover:border-red-400')}`}>
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 flex items-center justify-center rounded-xl border transition-all ${connections.yandex ? (theme === 'dark' ? 'bg-[#161420] border-[#ff4d6d]/30' : 'bg-white border-red-200') : (theme === 'dark' ? 'bg-[#161420] border-[#2a2636] group-hover:scale-110' : 'bg-slate-50 border-slate-200 group-hover:scale-110')}`}>
              <Globe size={16} className={connections.yandex ? 'text-[#ff4d6d]' : `${themeStyles.textMuted} group-hover:text-[#ff4d6d] transition-colors`} />
            </div>
            <span className={`text-xs font-bold transition-colors ${connections.yandex ? '' : `group-hover:${themeStyles.text}`}`}>Yandex Calendar</span>
          </div>
          {connections.yandex ? (
            <div className="flex items-center gap-2">
              <Check size={16} className="text-[#ff4d6d]" />
              <div className="p-1 hover:bg-black/10 rounded-md transition-colors"><Settings size={14} className={`${themeStyles.textMuted} hover:text-[#ff4d6d]`} /></div>
            </div>
          ) : <Link2 size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />}
        </button>
      </div>
    </div>
  );
}

function AgendaSection({ leads, yandexEvents, onOpenDeal, themeStyles, theme }) {
  const allEvents = [...leads, ...yandexEvents].sort((a, b) => a.day - b.day);

  return (
    <div className={`rounded-3xl p-6 shadow-2xl border ${themeStyles.panel} ${themeStyles.panelBorder} transition-colors`}>
      <h3 className={`font-black flex items-center gap-3 mb-6 tracking-tight ${themeStyles.text}`}>
        <Briefcase size={20} className={theme === 'dark' ? 'text-[#7a31ff]' : 'text-indigo-600'} />
        Ближайшие дела
      </h3>
      <div className="space-y-6">
        {allEvents.length > 0 ? allEvents.slice(0, 5).map((item, idx) => (
          <div key={idx} onClick={() => { if (item.client && onOpenDeal) onOpenDeal(item.id); }} className="flex gap-4 group cursor-pointer">
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-[11px] font-black transition-all shadow-sm border ${item.client ? (theme === 'dark' ? 'bg-[#0c0a13] border-[#2a2636] text-white group-hover:border-[#7a31ff] group-hover:text-[#7a31ff]' : 'bg-white border-slate-200 text-slate-700 group-hover:border-indigo-500 group-hover:text-indigo-600') : (theme === 'dark' ? 'bg-[#ff4d6d]/10 border-[#ff4d6d]/20 text-[#ff4d6d] group-hover:border-[#ff4d6d]' : 'bg-red-50 border-red-200 text-red-600')}`}>
                {item.day}
              </div>
              <div className={`w-0.5 flex-1 mt-2 rounded-full ${theme === 'dark' ? 'bg-[#2a2636]' : 'bg-slate-200'}`} />
            </div>
            <div className="pt-1 flex-1 pb-2 min-w-0">
              <div className={`text-sm font-black leading-none transition-colors truncate ${themeStyles.text} ${theme === 'dark' ? 'group-hover:text-[#7a31ff]' : 'group-hover:text-indigo-600'}`}>
                {item.client || item.title}
              </div>
              <div className={`text-[10px] mt-2 flex items-center gap-1.5 uppercase tracking-widest font-black ${themeStyles.textMuted}`}>
                {item.client ? (
                  <>{item.type === 'phone' ? <Phone size={10} className="text-emerald-500 shrink-0" /> : <Video size={10} className="text-blue-500 shrink-0" />} <span className="truncate">{item.action}</span></>
                ) : (
                  <><Globe size={10} className={theme === 'dark' ? 'text-[#ff4d6d] shrink-0' : 'text-red-500 shrink-0'} /> <span className="truncate">{item.time} (YANDEX)</span></>
                )}
              </div>
            </div>
          </div>
        )) : (
          <div className={`text-xs italic text-center py-4 ${themeStyles.textMuted}`}>Событий не найдено</div>
        )}
      </div>
    </div>
  );
}

function ApiSettingsModal({ type, isActive, onClose, onSave, onDisconnect, themeStyles, theme }) {
  const isGoogle = type === 'google';

  return (
    <div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center p-0 sm:p-6 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-0 cursor-pointer hidden sm:block" onClick={onClose} />
      <aside className={`relative w-full max-w-md h-[100dvh] sm:h-auto sm:max-h-[90vh] overflow-hidden flex flex-col rounded-none sm:rounded-[2rem] border-0 sm:border shadow-2xl animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-300 ${themeStyles.panel} ${themeStyles.panelBorder}`}>
        <div className={`p-4 sm:p-6 border-b flex items-center justify-between shrink-0 ${theme === 'dark' ? 'border-white/5' : 'border-slate-100'}`}>
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 flex items-center justify-center rounded-2xl border ${isGoogle ? (theme === 'dark' ? 'bg-[#0c0a13] border-[#3b82f6]/30' : 'bg-blue-50 border-blue-200') : (theme === 'dark' ? 'bg-[#0c0a13] border-[#ff4d6d]/30' : 'bg-red-50 border-red-200')}`}>
              {isGoogle ? <img src="https://www.google.com/favicon.ico" alt="G" className="w-6 h-6" /> : <Globe size={24} className={theme === 'dark' ? 'text-[#ff4d6d]' : 'text-red-500'} />}
            </div>
            <div>
              <h2 className={`text-xl font-black ${themeStyles.text}`}>Настройка API</h2>
              <p className={`text-xs font-bold uppercase tracking-wider mt-1 ${themeStyles.textMuted}`}>{isGoogle ? 'Google Calendar' : 'Yandex Calendar'}</p>
            </div>
          </div>
          <button onClick={onClose} className={`p-2 rounded-full transition-colors ${theme === 'dark' ? 'bg-[#0c0a13] hover:bg-[#2a2636] text-[#888399] hover:text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800'}`}><X size={16} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 custom-scrollbar">
          <div>
            <label className={`text-[10px] font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5 ${themeStyles.textMuted}`}><Lock size={10} /> Client ID</label>
            <input type="text" className={`w-full rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors ${themeStyles.input} ${themeStyles.text}`} placeholder={isGoogle ? "xxxx.apps.googleusercontent.com" : "ID приложения Яндекс OAuth"} defaultValue={isActive ? "a1b2c3d4e5f6g7h8.apps.yandex.ru" : ""} />
          </div>
          <div>
            <label className={`text-[10px] font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5 ${themeStyles.textMuted}`}><Lock size={10} /> {isGoogle ? 'Client Secret' : 'OAuth Token'}</label>
            <input type="password" className={`w-full rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors ${themeStyles.input} ${themeStyles.text}`} placeholder="••••••••••••••••" defaultValue={isActive ? "1234567890" : ""} />
          </div>
          {!isGoogle && (
            <div>
              <label className={`text-[10px] font-bold uppercase tracking-wider mb-2 block ${themeStyles.textMuted}`}>CalDAV URL (Опционально)</label>
              <input type="text" className={`w-full rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors ${themeStyles.input} ${themeStyles.text}`} defaultValue="https://caldav.yandex.ru" />
            </div>
          )}
        </div>

        <div className={`p-4 sm:p-6 border-t flex items-center gap-3 shrink-0 ${theme === 'dark' ? 'border-white/5' : 'border-slate-100'}`}>
          {isActive ? (
            <>
              <button onClick={onSave} className={`flex-1 px-4 py-3 rounded-xl font-bold text-xs transition-colors ${theme === 'dark' ? 'bg-[#2a2636] hover:bg-[#383347] text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-800'}`}>ОБНОВИТЬ КЛЮЧИ</button>
              <button onClick={onDisconnect} className={`px-4 py-3 rounded-xl font-bold text-xs transition-colors border ${theme === 'dark' ? 'bg-[#ff4d6d]/10 hover:bg-[#ff4d6d]/20 text-[#ff4d6d] border-[#ff4d6d]/20' : 'bg-red-50 hover:bg-red-100 text-red-600 border-red-200'}`}>ОТКЛЮЧИТЬ</button>
            </>
          ) : (
            <button onClick={onSave} className={`w-full px-4 py-3 text-white rounded-xl font-bold text-xs transition-opacity shadow-lg ${themeStyles.accentGradient} hover:opacity-90`}>ПОДКЛЮЧИТЬ {isGoogle ? 'GOOGLE' : 'YANDEX'}</button>
          )}
        </div>
      </aside>
    </div>
  );
}

function CalendarView({ deals, onOpenDeal, themeStyles, theme, stages }) {
  const [viewDate, setViewDate] = useState(new Date());
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [settingsModal, setSettingsModal] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [connections, setConnections] = useState({ google: false, yandex: false });

  const sync = useCallback(() => {
    setIsSyncing(true);
    setTimeout(() => setIsSyncing(false), 600);
  }, []);

  const dealsHash = JSON.stringify(deals);
  useEffect(() => { sync(); }, [viewDate.getMonth(), connections.yandex, connections.google, dealsHash, sync]);

  const connectSystem = (sys) => setConnections(prev => ({ ...prev, [sys]: true }));
  const disconnectSystem = (sys) => setConnections(prev => ({ ...prev, [sys]: false }));
  const changeMonth = (offset) => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + offset, 1));

  const leads = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    return deals
      .filter(d => {
        if (!d.nextTaskAt) return false;
        const date = new Date(d.nextTaskAt);
        return date.getMonth() === month && date.getFullYear() === year;
      })
      .map(d => {
        const stageObj = stages.find(s => s.key === d.stage);
        let color = 'blue';
        if (d.stage === 'won') color = 'emerald';
        else if (d.stage === 'contract') color = 'amber';

        return {
          id: d.id,
          client: d.company || 'Без названия',
          action: stageObj ? stageObj.title : 'Задача',
          day: new Date(d.nextTaskAt).getDate(),
          color: color,
          type: d.phone ? 'phone' : 'meeting'
        };
      });
  }, [deals, viewDate, stages]);

  const events = connections.google ? [{ id: 'g1', title: 'Google: Планерка', time: '09:00', day: 15 }] : [];
  const yandexEvents = connections.yandex ? [{ id: 'y1', title: 'Yandex: Обед', time: '13:00', day: 20 }] : [];

  const gridCells = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startOffset = firstDay === 0 ? 6 : firstDay - 1;

    const cells = [];
    for (let i = 0; i < startOffset; i++) cells.push({ day: null, current: false });
    for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, current: true });
    while (cells.length < 42) cells.push({ day: null, current: false });
    return cells;
  }, [viewDate]);

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 h-full overflow-y-auto custom-scrollbar">
      <main className={`flex-1 flex flex-col rounded-[2rem] border shadow-xl transition-all duration-500 ${theme === 'dark' ? 'bg-[#1b1828]/70 border-[#2a253a] backdrop-blur-2xl' : 'bg-white/70 border-slate-200 backdrop-blur-2xl'}`}>
        <div className={`p-4 sm:p-6 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-40 rounded-t-[2rem] ${theme === 'dark' ? 'border-[#2a2636]/50 bg-transparent' : 'border-slate-200/50 bg-white/20'}`}>
          <div className="flex items-center gap-4 sm:gap-6">
            <h2 className={`text-xl sm:text-2xl font-black min-w-[140px] sm:min-w-[180px] tracking-tight ${themeStyles.text}`}>
              {MONTHS[viewDate.getMonth()]} <span className={`font-medium ${themeStyles.textMuted}`}>{viewDate.getFullYear()}</span>
            </h2>
            <div className={`flex p-1 rounded-2xl border backdrop-blur-md ${theme === 'dark' ? 'bg-[#0c0a13]/60 border-[#2a2636]/50' : 'bg-slate-100/50 border-transparent'}`}>
              <button onClick={() => changeMonth(-1)} className={`p-1.5 sm:p-2 rounded-xl transition-all ${theme === 'dark' ? 'hover:bg-[#1e1b2b] text-[#888399] hover:text-white' : 'hover:bg-white text-slate-600'}`}><ChevronLeft size={20} /></button>
              <button onClick={() => changeMonth(1)} className={`p-1.5 sm:p-2 rounded-xl transition-all ${theme === 'dark' ? 'hover:bg-[#1e1b2b] text-[#888399] hover:text-white' : 'hover:bg-white text-slate-600'}`}><ChevronRight size={20} /></button>
            </div>
          </div>
          <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3 w-full sm:w-auto relative">
            {activeDropdown && <div className="fixed inset-0 z-40" onClick={() => setActiveDropdown(null)} />}
            <div className="flex items-center gap-2">
              <button onClick={() => setActiveDropdown(prev => prev === 'integrations' ? null : 'integrations')} className={`flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-bold rounded-2xl transition-all border z-50 ${activeDropdown === 'integrations' ? themeStyles.accentGradient + ' text-white border-transparent shadow-lg' : theme === 'dark' ? 'bg-[#2a2636]/50 text-white border-[#2a2636] hover:bg-[#383347]/60' : 'bg-white/50 text-slate-700 border-slate-200/50 hover:bg-white/80'}`}>
                <Cloud size={16} />
                <span className="hidden sm:inline">Интеграции</span>
                {isSyncing && <RefreshCw size={12} className="animate-spin hidden sm:block" />}
              </button>
              <button onClick={() => setActiveDropdown(prev => prev === 'agenda' ? null : 'agenda')} className={`flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-bold rounded-2xl transition-all border z-50 ${activeDropdown === 'agenda' ? themeStyles.accentGradient + ' text-white border-transparent shadow-lg' : theme === 'dark' ? 'bg-[#2a2636]/50 text-white border-[#2a2636] hover:bg-[#383347]/60' : 'bg-white/50 text-slate-700 border-slate-200/50 hover:bg-white/80'}`}>
                <Briefcase size={16} />
                <span className="hidden sm:inline">Повестка</span>
                {leads.length + yandexEvents.length > 0 && <span className={`px-1.5 py-0.5 rounded-md text-[10px] ml-1 ${activeDropdown === 'agenda' ? 'bg-white/20' : theme === 'dark' ? 'bg-[#1a1725] text-[#888399]' : 'bg-slate-200 text-slate-500'}`}>{leads.length + yandexEvents.length}</span>}
              </button>
            </div>
            <div className="w-px h-6 bg-current opacity-20 hidden sm:block mx-1"></div>
            <button onClick={() => setViewDate(new Date())} className={`px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-bold rounded-2xl transition-all border ${theme === 'dark' ? 'bg-[#2a2636]/50 text-white border-[#2a2636] hover:bg-[#383347]/60' : 'bg-white/50 text-slate-700 border-slate-200/50 hover:bg-white/80'}`}>Сегодня</button>
            {activeDropdown && (
              <div className="absolute top-full left-0 sm:left-auto right-0 mt-3 w-[calc(100vw-2rem)] sm:w-[360px] z-50 animate-in fade-in slide-in-from-top-4 duration-200">
                {activeDropdown === 'integrations' && <IntegrationSection isSyncing={isSyncing} connections={connections} onOpenSettings={(type) => { setSettingsModal(type); setActiveDropdown(null); }} themeStyles={themeStyles} theme={theme} />}
                {activeDropdown === 'agenda' && <AgendaSection leads={leads} yandexEvents={yandexEvents} onOpenDeal={(id) => { if (onOpenDeal) onOpenDeal(id); setActiveDropdown(null); }} themeStyles={themeStyles} theme={theme} />}
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 flex flex-col min-h-[600px] overflow-hidden rounded-b-[2rem]">
          <div className={`grid grid-cols-7 border-b backdrop-blur-md ${theme === 'dark' ? 'border-[#2a2636]/50 bg-[#0c0a13]/30' : 'border-slate-200/20 bg-slate-50/30'}`}>
            {DAYS_OF_WEEK.map(day => (
              <div key={day} className={`py-4 text-center text-[10px] font-black uppercase tracking-[0.2em] ${themeStyles.textMuted}`}>{day}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 flex-1">
            {gridCells.map((cell, idx) => {
              const isToday = cell.current && cell.day === new Date().getDate() && viewDate.getMonth() === new Date().getMonth();
              const dayLeads = leads.filter(l => l.day === cell.day);
              const dayEvents = events.filter(e => e.day === cell.day);
              const dayYandex = yandexEvents.filter(y => y.day === cell.day);

              return (
                <div key={idx} className={`min-h-[125px] border-r border-b p-2.5 flex flex-col gap-1.5 transition-all cursor-pointer ${theme === 'dark' ? 'border-[#2a2636]/50 hover:bg-[#1a1725]/50' : 'border-slate-200/20 hover:bg-white/30'} ${!cell.current ? 'opacity-20' : ''}`}>
                  <div className="flex justify-between items-start mb-1">
                    <span className={`text-sm font-black w-8 h-8 flex items-center justify-center rounded-xl transition-all ${isToday ? `${themeStyles.accentGradient} text-white shadow-lg` : themeStyles.textMuted}`}>{cell.day}</span>
                  </div>
                  <div className="space-y-1 overflow-hidden">
                    {dayLeads.map(lead => (
                      <div key={lead.id} onClick={(e) => { e.stopPropagation(); if (onOpenDeal) onOpenDeal(lead.id); }} className={`p-1.5 rounded-xl shadow-sm truncate transition-colors border backdrop-blur-sm ${theme === 'dark' ? 'bg-[#0c0a13]/80 border-[#2a2636] hover:border-[#7a31ff]/50' : 'bg-white/80 border-slate-200/50 hover:border-indigo-400'}`} title="Открыть карточку сделки">
                        <div className="flex items-center gap-2">
                          <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${lead.color === 'blue' ? 'bg-blue-500' : lead.color === 'emerald' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                          <span className={`text-[10px] font-bold truncate ${theme === 'dark' ? 'text-[#d1cfd7]' : 'text-slate-700'}`}>{lead.client}</span>
                        </div>
                      </div>
                    ))}
                    {dayEvents.map(event => (
                      <div key={event.id} className={`p-1.5 rounded-lg text-[9px] font-bold flex items-center gap-1.5 shadow-md border ${theme === 'dark' ? 'bg-[#2a2636]/90 text-white border-[#383347]' : 'bg-slate-800 text-white border-transparent'}`}>
                        <Bell size={10} className={theme === 'dark' ? 'text-[#888399]' : 'text-slate-400'} /> <span className="truncate">{event.title}</span>
                      </div>
                    ))}
                    {dayYandex.map(y => (
                      <div key={y.id} className={`p-1.5 rounded-lg text-[9px] font-black flex items-center gap-1.5 shadow-sm border ${theme === 'dark' ? 'bg-[#ff4d6d]/10 text-[#ff4d6d] border-[#ff4d6d]/20' : 'bg-red-50 text-red-600 border-red-200'}`}>
                        <Globe size={10} className="shrink-0" /> <span className="truncate uppercase">{y.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {settingsModal && <ApiSettingsModal type={settingsModal} isActive={connections[settingsModal]} onClose={() => setSettingsModal(null)} onSave={() => { connectSystem(settingsModal); setSettingsModal(null); sync(); }} onDisconnect={() => { disconnectSystem(settingsModal); setSettingsModal(null); sync(); }} themeStyles={themeStyles} theme={theme} />}
    </div>
  );
}

function BotsView({ themeStyles, theme }) {
  const [bots, setBots] = useState([
    {
      id: 'bot_1',
      name: 'Основной Lead-бот',
      token: '123456789:AABBCCddEEffGG_hhIIjjKKllMMnnOOpp',
      isActive: true,
      questions: [
        { id: 1, text: 'Здравствуйте! Как я могу к вам обращаться?', field: 'Имя контакта (contact)' },
        { id: 2, text: 'Отлично! Напишите ваш контактный номер телефона.', field: 'Телефон (phone)' },
        { id: 3, text: 'Кратко опишите, какая задача перед вами стоит?', field: 'Заметки (note)' },
        { id: 4, text: 'Какой примерный бюджет вы планируете?', field: 'Бюджет (amount)' }
      ]
    }
  ]);

  const [selectedBotId, setSelectedBotId] = useState('bot_1');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const selectedBot = bots.find(b => b.id === selectedBotId) || bots[0];

  const updateSelectedBot = (updates) => {
    setBots(bots.map(b => b.id === selectedBotId ? { ...b, ...updates } : b));
  };

  const handleAddBot = () => {
    const newBot = {
      id: `bot_${Date.now()}`,
      name: `Новый бот ${bots.length + 1}`,
      token: '',
      isActive: false,
      questions: [
        { id: Date.now(), text: 'Здравствуйте! Чем могу помочь?', field: 'Заметки (note)' }
      ]
    };
    setBots([...bots, newBot]);
    setSelectedBotId(newBot.id);
    setIsDropdownOpen(false);
  };

  const handleDeleteBot = () => {
    if (bots.length === 1) {
      alert("Должен остаться хотя бы один бот!");
      return;
    }
    const filteredBots = bots.filter(b => b.id !== selectedBotId);
    setBots(filteredBots);
    setSelectedBotId(filteredBots[0].id);
  };

  const handleAddQuestion = () => {
    const newQ = { id: Date.now(), text: 'Новый вопрос', field: 'Заметки (note)' };
    updateSelectedBot({ questions: [...selectedBot.questions, newQ] });
  };

  const handleUpdateQuestion = (qId, field, value) => {
    updateSelectedBot({
      questions: selectedBot.questions.map(q => q.id === qId ? { ...q, [field]: value } : q)
    });
  };

  const handleRemoveQuestion = (qId) => {
    updateSelectedBot({
      questions: selectedBot.questions.filter(q => q.id !== qId)
    });
  };

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-8 h-full overflow-y-auto custom-scrollbar animate-in fade-in duration-300">
      <div className="max-w-4xl w-full mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-50">
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-3 ${themeStyles.text} hover:opacity-80 transition-opacity`}
            >
              <div className="p-2.5 bg-[#0088cc] rounded-2xl text-white shadow-lg shadow-[#0088cc]/30">
                <MessageCircle size={28} />
              </div>
              {selectedBot.name}
              <ChevronDown size={24} className={`transition-transform duration-300 opacity-50 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isDropdownOpen && (
              <div className={`absolute top-full left-0 mt-4 w-80 rounded-2xl border shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 ${themeStyles.panel} ${themeStyles.panelBorder}`}>
                <div className="max-h-60 overflow-y-auto custom-scrollbar p-2">
                  {bots.map(b => (
                    <button
                      key={b.id}
                      onClick={() => { setSelectedBotId(b.id); setIsDropdownOpen(false); }}
                      className={`w-full flex items-center justify-between p-3 rounded-xl text-sm font-bold transition-colors ${selectedBotId === b.id ? 'bg-[#0088cc]/10 text-[#0088cc]' : `hover:bg-slate-100 dark:hover:bg-[#2a2636] ${themeStyles.text}`}`}
                    >
                      <div className="flex items-center gap-3 truncate">
                        <Bot size={16} className="shrink-0" />
                        <span className="truncate">{b.name}</span>
                      </div>
                      {b.isActive && <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] shrink-0" />}
                    </button>
                  ))}
                </div>
                <div className={`p-2 border-t ${theme === 'dark' ? 'border-[#2a2636]' : 'border-slate-100'}`}>
                  <button
                    onClick={handleAddBot}
                    className="w-full flex items-center justify-center gap-2 p-3 rounded-xl text-sm font-bold text-emerald-500 hover:bg-emerald-500/10 transition-colors"
                  >
                    <Plus size={16} /> Создать нового бота
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className={`text-xs font-bold uppercase tracking-widest ${selectedBot.isActive ? 'text-emerald-500' : themeStyles.textMuted}`}>
              {selectedBot.isActive ? 'Бот активен' : 'Бот выключен'}
            </span>
            <button
              onClick={() => updateSelectedBot({ isActive: !selectedBot.isActive })}
              className={`relative w-14 h-8 rounded-full transition-all duration-300 focus:outline-none shadow-inner ${selectedBot.isActive ? 'bg-emerald-500' : theme === 'dark' ? 'bg-[#2a2636]' : 'bg-slate-200'}`}
            >
              <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-all duration-300 shadow-sm ${selectedBot.isActive ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>
        </div>

        <div className={`p-6 sm:p-8 rounded-[2rem] border shadow-xl ${themeStyles.panel} ${themeStyles.panelBorder}`}>
          <div className="flex items-center justify-between mb-6">
            <h3 className={`text-xs font-black uppercase tracking-widest flex items-center gap-2 ${themeStyles.textMuted}`}>
              <Settings size={14} /> Основные настройки
            </h3>
            {bots.length > 1 && (
              <button onClick={handleDeleteBot} className="text-rose-500 hover:text-rose-400 p-2 rounded-xl hover:bg-rose-500/10 transition-colors" title="Удалить бота">
                <Trash2 size={16} />
              </button>
            )}
          </div>

          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1 space-y-2">
              <label className={`text-[10px] font-bold uppercase tracking-wider px-1 ${themeStyles.textMuted}`}>Название бота</label>
              <input
                type="text"
                value={selectedBot.name}
                onChange={(e) => updateSelectedBot({ name: e.target.value })}
                className={`w-full px-4 py-4 rounded-2xl text-sm font-bold border outline-none transition-all ${themeStyles.input} ${themeStyles.text}`}
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1 w-full space-y-2">
              <label className={`text-[10px] font-bold uppercase tracking-wider px-1 ${themeStyles.textMuted}`}>API Token</label>
              <div className="relative">
                <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40 ${themeStyles.textMuted}`} />
                <input
                  type="password"
                  value={selectedBot.token}
                  onChange={(e) => updateSelectedBot({ token: e.target.value })}
                  placeholder="Введите токен бота..."
                  className={`w-full pl-12 pr-4 py-4 rounded-2xl text-sm font-bold border outline-none transition-all ${themeStyles.input} ${themeStyles.text}`}
                />
              </div>
            </div>
            <button className={`w-full sm:w-auto px-8 py-4 rounded-2xl font-bold text-sm text-white shadow-lg transition-all active:scale-95 ${themeStyles.accentGradient}`}>
              Проверить связь
            </button>
          </div>
        </div>

        <div className={`p-6 sm:p-8 rounded-[2rem] border shadow-xl ${themeStyles.panel} ${themeStyles.panelBorder}`}>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className={`text-xs font-black uppercase tracking-widest flex items-center gap-2 ${themeStyles.textMuted}`}>
                <Save size={14} /> Воронка вопросов
              </h3>
              <p className={`text-[10px] mt-1 ${themeStyles.textMuted}`}>Настройте опрос клиента.</p>
            </div>
            <button
              onClick={handleAddQuestion}
              className={`text-[10px] font-bold uppercase flex items-center gap-1 px-4 py-2 rounded-xl border transition-all ${theme === 'dark' ? 'bg-[#2a2636] border-[#383347] text-white hover:border-[#7a31ff]' : 'bg-slate-100 border-slate-200 text-slate-700 hover:border-indigo-400'}`}
            >
              <Plus size={12} /> Добавить
            </button>
          </div>

          <div className="relative space-y-4">
            <div className={`absolute left-[23px] top-4 bottom-4 w-0.5 ${theme === 'dark' ? 'bg-[#2a2636]' : 'bg-slate-200'} z-0`} />

            {selectedBot.questions.map((q, index) => (
              <div key={q.id} className="relative z-10 flex gap-4 group">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 border shadow-sm ${theme === 'dark' ? 'bg-[#141120] border-[#2a2636] text-[#888399] group-hover:border-[#0088cc] group-hover:text-[#0088cc]' : 'bg-white border-slate-200 text-slate-500 group-hover:border-[#0088cc] group-hover:text-[#0088cc]'} transition-colors`}>
                  {index + 1}
                </div>

                <div className={`flex-1 flex flex-col xl:flex-row gap-4 p-4 sm:p-5 rounded-2xl border transition-all shadow-sm ${theme === 'dark' ? 'bg-[#141120] border-[#2a2636] group-hover:border-[#383347]' : 'bg-slate-50 border-slate-200 group-hover:border-slate-300'}`}>
                  <div className="flex-1 space-y-2">
                    <label className={`text-[10px] font-bold uppercase tracking-wider px-1 ${themeStyles.textMuted}`}>Текст сообщения</label>
                    <input
                      type="text"
                      value={q.text}
                      onChange={(e) => handleUpdateQuestion(q.id, 'text', e.target.value)}
                      className={`w-full p-3 rounded-xl text-sm border outline-none transition-all ${themeStyles.input} ${themeStyles.text}`}
                    />
                  </div>
                  <div className="xl:w-64 space-y-2 shrink-0">
                    <label className={`text-[10px] font-bold uppercase tracking-wider px-1 ${themeStyles.textMuted}`}>Сохранить в поле</label>
                    <select
                      value={q.field}
                      onChange={(e) => handleUpdateQuestion(q.id, 'field', e.target.value)}
                      className={`w-full p-3 rounded-xl text-sm font-semibold border outline-none transition-all ${themeStyles.input} ${themeStyles.text}`}
                    >
                      <option value="Имя контакта (contact)">Имя контакта (contact)</option>
                      <option value="Телефон (phone)">Телефон (phone)</option>
                      <option value="Заметки (note)">Заметки (note)</option>
                      <option value="Бюджет (amount)">Бюджет (amount)</option>
                      <option value="Адрес (address)">Адрес (address)</option>
                      <option value="other">Другое поле...</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2 pt-6 xl:pt-0">
                    <button onClick={() => handleRemoveQuestion(q.id)} className="p-2 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors opacity-0 group-hover:opacity-100">
                      <Trash2 size={16} />
                    </button>
                    <GripVertical size={20} className={`${themeStyles.textMuted} cursor-grab opacity-30 hover:opacity-100 transition-opacity`} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex justify-end">
            <button className={`px-6 py-3 rounded-xl font-bold text-sm text-white shadow-lg transition-all active:scale-95 flex items-center gap-2 bg-[#0088cc] hover:bg-[#0077b3]`}>
              <Save size={16} /> Сохранить сценарий
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const DealEditorModal = ({ deal, stages, themeStyles, theme, onSave, onClose, onDelete, onCallAI, isSyncing }) => {
  const [draft, setDraft] = useState(normalizeDeal(deal));
  const [activeTab, setActiveTab] = useState('info');
  const [messageText, setMessageText] = useState("");
  const [selectedChannel, setSelectedChannel] = useState("telegram");
  const [storageProvider, setStorageProvider] = useState('google');

  const channels = [
    { id: 'telegram', label: 'Telegram', color: 'bg-[#0088cc]' },
    { id: 'whatsapp', label: 'WhatsApp', color: 'bg-[#25D366]' },
    { id: 'vk', label: 'VK', color: 'bg-[#0077FF]' },
    { id: 'max', label: 'Max', color: 'bg-purple-500' },
    { id: 'email', label: 'Email', color: 'bg-rose-500' },
  ];

  useEffect(() => {
    const normalizedDeal = normalizeDeal(deal);
    if (JSON.stringify(draft) === JSON.stringify(normalizedDeal)) return;
    setDraft(normalizedDeal);
  }, [deal]);

  useEffect(() => {
    if (JSON.stringify(draft) === JSON.stringify(normalizeDeal(deal))) return;
    const timer = setTimeout(() => onSave(normalizeDeal(draft)), 600);
    return () => clearTimeout(timer);
  }, [draft, deal, onSave]);

  const togglePlugin = (pluginId) => {
    const plugins = ensureArray(draft.plugins);
    setDraft({ ...draft, plugins: plugins.includes(pluginId) ? plugins.filter(id => id !== pluginId) : [...plugins, pluginId] });
  };

  const handleConnectChannel = (channelId) => {
    const channelName = channels.find(c => c.id === channelId)?.label;
    setDraft(prev => ({
      ...prev,
      connectedChannels: [...ensureArray(prev.connectedChannels), channelId],
      activities: [
        { id: `act_${Date.now()}`, text: `Синхронизирован канал: ${channelName}`, date: getTodayDateStr(), time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), type: 'integration' },
        ...ensureArray(prev.activities)
      ]
    }));
  };

  const handleSendMessage = () => {
    if (!messageText.trim()) return;
    const newMessage = {
      id: `m_${Date.now()}`,
      text: messageText,
      channel: selectedChannel,
      author: 'Вы',
      isOutbound: true,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setDraft(prev => ({
      ...prev,
      messages: [...ensureArray(prev.messages), newMessage]
    }));
    setMessageText("");
  };

  const handleMockUpload = () => {
    const newFile = {
      id: `f_${Date.now()}`,
      name: `document_${Math.floor(Math.random() * 1000)}.pdf`,
      size: `${(Math.random() * 5 + 0.1).toFixed(1)} MB`,
      type: 'pdf',
      provider: storageProvider
    };

    setDraft(prev => ({
      ...prev,
      attachments: [newFile, ...ensureArray(prev.attachments)],
      activities: [
        {
          id: `act_${Date.now()}`,
          text: `Загружен файл: ${newFile.name} (${storageProvider === 'google' ? 'Google Cloud' : 'Yandex Cloud'})`,
          date: getTodayDateStr(),
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: 'upload'
        },
        ...ensureArray(prev.activities)
      ]
    }));
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    if (tabId === 'chat') {
      setDraft(prev => ({
        ...prev,
        touches: [
          { id: `t_${Date.now()}`, user: 'Вы', action: 'Чтение сообщений', time: 'Только что' },
          ...ensureArray(prev.touches)
        ]
      }));
    } else if (tabId === 'files') {
      setDraft(prev => ({
        ...prev,
        touches: [
          { id: `t_${Date.now()}`, user: 'Вы', action: 'Просмотр файлов', time: 'Только что' },
          ...ensureArray(prev.touches)
        ]
      }));
    }
  };

  const tabs = [
    { id: 'info', icon: <Target size={16} />, label: 'О проекте' },
    { id: 'chat', icon: <MessageSquare size={16} />, label: 'Сообщения', count: draft.messages?.length || 0 },
    { id: 'files', icon: <Paperclip size={16} />, label: 'Файлы', count: draft.attachments?.length || 0 },
    { id: 'team', icon: <Users size={16} />, label: 'Участники', count: (draft.participants?.length || 0) + (draft.externalContacts?.length || 0) },
    { id: 'history', icon: <History size={16} />, label: 'История' },
  ];

  return (
    <div className="fixed inset-0 z-[999] flex items-end sm:items-center justify-center p-0 sm:p-6 bg-[#0f0c1b]/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="absolute inset-0 cursor-pointer hidden sm:block" onClick={onClose} />

      <aside className={`relative w-full max-w-4xl h-[100dvh] sm:h-[85vh] overflow-hidden flex flex-col sm:flex-row rounded-none sm:rounded-[32px] border-0 sm:border-2 shadow-2xl animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-300 ${themeStyles.panel} ${themeStyles.panelBorder}`}>
        <div className={`flex sm:flex-col gap-2 p-4 sm:p-6 border-b sm:border-b-0 sm:border-r overflow-x-auto sm:overflow-visible shrink-0 custom-scrollbar ${theme === 'dark' ? 'border-[#2a2636]/50 bg-[#141120]' : 'border-slate-200/50 bg-slate-50'}`}>
          <div className="hidden sm:block pb-6 mb-6 border-b border-current opacity-20">
            <div className={`w-12 h-12 rounded-2xl items-center justify-center flex ${theme === 'dark' ? 'bg-[#2a2636] text-white' : 'bg-indigo-100 text-indigo-600'}`}>
              <Briefcase size={24} />
            </div>
          </div>

          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all font-bold text-sm whitespace-nowrap shrink-0 sm:w-48 ${activeTab === tab.id ? `${themeStyles.accentGradient} text-white shadow-md` : `hover:bg-black/5 dark:hover:bg-white/5 ${themeStyles.textMuted}`}`}
            >
              {tab.icon}
              <span className="flex-1 text-left">{tab.label}</span>
              {tab.count > 0 && (
                <span className={`px-2 py-0.5 rounded-lg text-[10px] ${activeTab === tab.id ? 'bg-white/20' : theme === 'dark' ? 'bg-[#2a2636]' : 'bg-slate-200'}`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <div className={`p-4 sm:p-6 border-b flex items-center justify-between shrink-0 ${theme === 'dark' ? 'border-[#2a2636]/50' : 'border-slate-200/50'}`}>
            <div className="flex items-center gap-4 min-w-0 flex-1">
              <div className="text-left min-w-0 flex-1">
                <input
                  value={draft.company}
                  onChange={(e) => setDraft({...draft, company: e.target.value})}
                  className={`font-black text-xl sm:text-2xl bg-transparent outline-none focus:text-indigo-400 w-full tracking-tight transition-colors truncate ${themeStyles.text}`}
                  placeholder="Название проекта/клиента"
                />
                <div className={`flex items-center gap-2 text-xs font-bold mt-1 uppercase tracking-widest truncate ${themeStyles.textMuted}`}>
                  <span className="shrink-0">{draft.id}</span>
                  <span className="shrink-0">·</span>
                  <span className="truncate">{draft.contact}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 ml-4">
              {isSyncing && <Cloud className="text-indigo-400 animate-pulse hidden sm:block mr-2" size={20} />}
              <button onClick={() => onDelete(draft.id)} className="p-3 hover:bg-rose-500/10 text-rose-500 rounded-2xl transition-all" title="Удалить"><Trash2 size={18} /></button>
              <button onClick={onClose} className={`p-3 rounded-2xl transition-all ${theme === 'dark' ? 'hover:bg-white/10 text-[#888399] hover:text-white' : 'hover:bg-slate-200 text-slate-500 hover:text-slate-800'}`} title="Закрыть"><X size={20} /></button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 sm:p-8 custom-scrollbar">
            {activeTab === 'info' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className={`text-[10px] font-black uppercase tracking-widest px-1 ${themeStyles.textMuted}`}>Этап проекта</label>
                    <select value={draft.stage} onChange={(e) => setDraft({...draft, stage: e.target.value})} className={`w-full p-4 rounded-2xl text-sm font-bold border outline-none transition-all ${themeStyles.input} ${themeStyles.text}`}>
                      {stages.map(s => <option key={s.key} value={s.key} className={themeStyles.panel}>{s.title}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className={`text-[10px] font-black uppercase tracking-widest px-1 ${themeStyles.textMuted}`}>Дата (Слот в календаре)</label>
                    <input type="date" value={draft.nextTaskAt || ""} onChange={(e) => setDraft({...draft, nextTaskAt: e.target.value})} className={`w-full p-4 rounded-2xl text-sm font-bold border outline-none transition-all ${themeStyles.input} ${themeStyles.text}`} />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2 text-left">
                    <label className={`text-[10px] font-black uppercase tracking-widest px-1 ${themeStyles.textMuted}`}>Бюджет / Сумма</label>
                    <input type="number" value={draft.amount} onChange={(e) => setDraft({...draft, amount: parseFloat(e.target.value) || 0})} className={`w-full p-4 rounded-2xl text-sm font-bold border outline-none transition-all ${themeStyles.input} ${themeStyles.text}`} />
                  </div>
                  <div className="space-y-2 text-left">
                    <label className={`text-[10px] font-black uppercase tracking-widest px-1 ${themeStyles.textMuted}`}>Главный телефон</label>
                    <div className={`flex items-center gap-3 p-4 rounded-2xl border ${themeStyles.input}`}>
                      <Phone size={18} className="text-indigo-400 opacity-40 shrink-0" />
                      <input value={draft.phone || ""} onChange={(e) => setDraft({...draft, phone: e.target.value})} placeholder="+7 ..." className={`bg-transparent text-sm w-full outline-none font-semibold ${themeStyles.text}`} />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2 text-left">
                    <div className="flex items-center justify-between px-1">
                      <label className={`text-[10px] font-black uppercase tracking-widest ${themeStyles.textMuted} opacity-60`}>Адрес (Локация проекта)</label>
                      {draft.fields.address && draft.fields.address.trim() !== '' && (
                        <a
                          href={`https://yandex.ru/maps/?text=${encodeURIComponent(draft.fields.address)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`text-[10px] font-bold uppercase flex items-center gap-1 hover:text-indigo-400 transition-colors ${themeStyles.accentText}`}
                          title="Открыть в Картах"
                        >
                          <ExternalLink size={12} /> На карте
                        </a>
                      )}
                    </div>
                    <div className={`flex items-center gap-3 p-4 rounded-2xl border ${themeStyles.input}`}>
                      <MapPin size={18} className="text-indigo-400 opacity-40 shrink-0" />
                      <input value={draft.fields.address || ""} onChange={(e) => setDraft({...draft, fields: {...draft.fields, address: e.target.value}})} placeholder="Город, улица, дом..." className={`bg-transparent text-sm w-full outline-none font-semibold ${themeStyles.text}`} />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${themeStyles.textMuted}`}><Zap size={14} /> Подключенные плагины</h3>
                  <div className="flex flex-wrap gap-2">
                    {PLUGINS.map(p => {
                      const isActive = draft.plugins?.includes(p.id);
                      return (
                        <button key={p.id} onClick={() => togglePlugin(p.id)}
                          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all duration-300 ${isActive ? `bg-indigo-500/10 border-indigo-500/40 ${themeStyles.accentText} shadow-sm` : `${themeStyles.input} ${themeStyles.textMuted} opacity-60 hover:opacity-100`}`}>
                          {p.icon}<span>{p.title}</span>{isActive && <CheckCircle2 size={12} className="ml-1" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className={`text-[10px] font-black uppercase tracking-widest px-1 ${themeStyles.textMuted}`}>Рабочие заметки</label>
                    <button onClick={() => onCallAI(draft, setDraft)} className={`text-[10px] font-black uppercase tracking-tighter bg-indigo-500/10 ${themeStyles.accentText} px-3 py-1.5 rounded-full border border-indigo-500/20 hover:bg-indigo-500/20 transition-all flex items-center gap-2`}><Zap size={10} className="fill-current" /> AI Помощник</button>
                  </div>
                  <textarea
                    value={draft.fields.note || ""} onChange={(e) => setDraft({...draft, fields: {...draft.fields, note: e.target.value}})}
                    placeholder="Описание проекта, договоренности..."
                    className={`w-full h-40 p-5 rounded-2xl text-sm leading-relaxed border outline-none resize-none transition-all ${themeStyles.input} ${themeStyles.text}`}
                  />
                </div>
              </div>
            )}

            {activeTab === 'chat' && (
              <div className="flex flex-col h-full animate-in fade-in duration-300">
                <div className={`p-4 mb-4 rounded-2xl border flex items-center justify-between ${theme === 'dark' ? 'bg-[#141120] border-[#2a2636]' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="flex items-center gap-3 text-sm font-bold">
                    <MessageSquare size={18} className={themeStyles.accentText} />
                    <span className={themeStyles.text}>Единая лента сообщений</span>
                  </div>
                  <Badge className="bg-indigo-500/10 text-indigo-500 border-indigo-500/20">v1 Architecture</Badge>
                </div>

                <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2 custom-scrollbar">
                  {draft.messages?.length > 0 ? draft.messages.map(msg => (
                    <div key={msg.id} className={`flex flex-col ${msg.isOutbound ? 'items-end' : 'items-start'}`}>
                      <div className="flex items-end gap-2 mb-1">
                        <span className={`text-[10px] font-bold ${themeStyles.textMuted}`}>{msg.author}</span>
                        <span className="text-[9px] opacity-40">{msg.time}</span>
                        <Badge className="bg-black/5 dark:bg-white/5 opacity-50 px-1.5">{msg.channel}</Badge>
                      </div>
                      <div className={`max-w-[90%] sm:max-w-[80%] p-4 rounded-2xl text-sm ${msg.isOutbound ? `${themeStyles.accentGradient} text-white rounded-tr-sm shadow-md` : `${theme === 'dark' ? 'bg-[#221f30] border border-[#2a2636]' : 'bg-white border border-slate-200'} ${themeStyles.text} rounded-tl-sm shadow-sm`}`}>
                        {msg.text}
                      </div>
                    </div>
                  )) : (
                    <div className={`py-4 flex items-center justify-center text-sm ${themeStyles.textMuted}`}>Сообщений пока нет</div>
                  )}
                </div>

                <div className={`mt-auto relative flex flex-col gap-3 pt-2 border-t ${theme === 'dark' ? 'border-white/5' : 'border-slate-100'}`}>
                  <div className="flex items-center justify-between gap-2 overflow-x-auto custom-scrollbar pb-1">
                    <div className="flex items-center gap-2">
                      {channels.map(ch => {
                        const isConnected = draft.connectedChannels?.includes(ch.id);
                        return (
                          <button
                            key={ch.id}
                            onClick={() => setSelectedChannel(ch.id)}
                            className={`text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all shrink-0 flex items-center gap-1.5 ${selectedChannel === ch.id ? `${ch.color} text-white shadow-sm` : `${theme === 'dark' ? 'bg-[#141120] text-[#8b8698] hover:text-white' : 'bg-slate-100 text-slate-500 hover:text-slate-800'}`} ${!isConnected && selectedChannel !== ch.id ? 'opacity-50' : ''}`}
                          >
                            {ch.label}
                            {isConnected && <CheckCircle2 size={10} className={selectedChannel === ch.id ? "text-white" : themeStyles.accentText} />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {draft.connectedChannels?.includes(selectedChannel) ? (
                    <div className="relative animate-in fade-in">
                      <input
                        type="text"
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder={`Написать через ${channels.find(c => c.id === selectedChannel)?.label}...`}
                        className={`w-full p-4 pr-14 rounded-2xl text-sm border outline-none ${themeStyles.input} ${themeStyles.text}`}
                      />
                      <button onClick={handleSendMessage} className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl text-white ${themeStyles.accentGradient} hover:opacity-90 transition-all`}><Send size={16} /></button>
                    </div>
                  ) : (
                    <div className={`w-full p-4 border-2 border-dashed rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 transition-all animate-in fade-in ${theme === 'dark' ? 'border-[#2a2636] bg-[#141120]' : 'border-slate-200 bg-slate-50'}`}>
                      <div className="flex items-center gap-3 text-left">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${channels.find(c => c.id === selectedChannel)?.color}`}>
                          {selectedChannel === 'email' ? <Mail size={14} /> : <Globe size={14} />}
                        </div>
                        <div>
                          <p className={`text-xs font-bold ${themeStyles.text}`}>Канал не синхронизирован</p>
                          <p className={`text-[10px] ${themeStyles.textMuted} mt-0.5`}>Подключите {channels.find(c => c.id === selectedChannel)?.label}</p>
                        </div>
                      </div>
                      <button onClick={() => handleConnectChannel(selectedChannel)} className={`px-4 py-2 rounded-xl text-xs font-bold text-white shadow-md transition-all active:scale-95 w-full sm:w-auto ${themeStyles.accentGradient}`}>
                        Синхронизировать
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'files' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="flex items-center justify-between">
                  <h3 className={`text-xs font-black uppercase tracking-widest flex items-center gap-2 ${themeStyles.textMuted} opacity-60`}><Cloud size={14} /> Выбор хранилища</h3>
                  <div className={`flex items-center gap-1 p-1 rounded-xl border ${themeStyles.panelBorder} ${themeStyles.input}`}>
                    <button onClick={() => setStorageProvider('google')} className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all flex items-center gap-1.5 ${storageProvider === 'google' ? 'bg-blue-500 text-white shadow-sm' : `opacity-50 hover:opacity-100 ${themeStyles.text}`}`}>
                      <img src="https://www.google.com/favicon.ico" alt="G" className={`w-3 h-3 ${storageProvider === 'google' ? 'brightness-0 invert' : 'grayscale'}`} /> Google Cloud
                    </button>
                    <button onClick={() => setStorageProvider('yandex')} className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all flex items-center gap-1.5 ${storageProvider === 'yandex' ? 'bg-red-500 text-white shadow-sm' : `opacity-50 hover:opacity-100 ${themeStyles.text}`}`}>
                      <Globe size={12} className={storageProvider === 'yandex' ? 'text-white' : ''} /> Yandex Cloud
                    </button>
                  </div>
                </div>

                <div
                  onClick={handleMockUpload}
                  className={`w-full p-8 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center gap-3 text-center cursor-pointer transition-all ${
                    storageProvider === 'google'
                      ? 'hover:bg-blue-500/5 hover:border-blue-500/40 ' + (theme === 'dark' ? 'border-[#2a2636] bg-[#141120]' : 'border-slate-200 bg-slate-50')
                      : 'hover:bg-red-500/5 hover:border-red-500/40 ' + (theme === 'dark' ? 'border-[#2a2636] bg-[#141120]' : 'border-slate-200 bg-slate-50')
                  }`}
                >
                  <div className={`p-4 rounded-full ${storageProvider === 'google' ? 'bg-blue-500/10 text-blue-500' : 'bg-red-500/10 text-red-500'}`}>
                    <Cloud size={24} />
                  </div>
                  <div>
                    <p className={`text-sm font-bold ${themeStyles.text}`}>
                      Загрузить файлы в {storageProvider === 'google' ? 'Google Cloud' : 'Yandex Cloud'}
                    </p>
                    <p className={`text-xs mt-1 ${themeStyles.textMuted}`}>Перетащите документы сюда или кликните</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {draft.attachments?.length > 0 ? draft.attachments.map(file => (
                    <div key={file.id} className={`flex items-center gap-4 p-4 rounded-2xl border shadow-sm group ${themeStyles.panelBorder} ${themeStyles.panel}`}>
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${theme === 'dark' ? 'bg-[#2a2636] text-white' : 'bg-slate-100 text-slate-600'}`}>
                        <FileText size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-bold truncate ${themeStyles.text}`}>{file.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className={`text-[10px] font-medium uppercase tracking-wider ${themeStyles.textMuted}`}>{file.size} • {file.type}</p>
                          {(file.provider || storageProvider) && (
                            <Badge className={file.provider === 'google' || (!file.provider && storageProvider === 'google') ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}>
                              {file.provider === 'google' || (!file.provider && storageProvider === 'google') ? 'G-Cloud' : 'Y-Cloud'}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <button className="p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all text-rose-500 hover:bg-rose-500/10"><Trash2 size={16} /></button>
                    </div>
                  )) : (
                    <div className={`col-span-full py-8 text-center text-sm ${themeStyles.textMuted}`}>Нет прикрепленных файлов</div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'team' && (
              <div className="space-y-8 animate-in fade-in duration-300">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className={`text-xs font-black uppercase tracking-widest ${themeStyles.textMuted}`}>Внутренняя команда</h3>
                    <button className={`text-[10px] font-bold uppercase flex items-center gap-1 hover:text-indigo-400 ${themeStyles.accentText}`}><Plus size={12} /> Добавить</button>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    {draft.participants?.map(p => (
                      <div key={p.id} className={`flex items-center justify-between p-4 rounded-2xl border shadow-sm ${themeStyles.panelBorder} ${themeStyles.panel}`}>
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full text-white flex items-center justify-center text-xs font-bold ${p.avatar || 'bg-slate-500'}`}>{p.name.charAt(0)}</div>
                          <span className={`text-sm font-bold ${themeStyles.text}`}>{p.name}</span>
                        </div>
                        <Badge className="bg-indigo-500/10 text-indigo-500 border-indigo-500/20">{p.role}</Badge>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className={`text-xs font-black uppercase tracking-widest ${themeStyles.textMuted}`}>Внешние контакты</h3>
                    <button className={`text-[10px] font-bold uppercase flex items-center gap-1 hover:text-indigo-400 ${themeStyles.accentText}`}><Plus size={12} /> Добавить</button>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    {draft.externalContacts?.length > 0 ? draft.externalContacts.map(c => (
                      <div key={c.id} className={`flex items-center justify-between p-4 rounded-2xl border shadow-sm ${themeStyles.panelBorder} ${themeStyles.panel}`}>
                        <div className="flex flex-col text-left">
                          <span className={`text-sm font-bold ${themeStyles.text}`}>{c.name}</span>
                          <span className={`text-[10px] mt-1 ${themeStyles.textMuted}`}>{c.role} @ {c.company}</span>
                        </div>
                        <div className="flex gap-2">
                          <button className={`p-2 rounded-xl transition-colors ${theme === 'dark' ? 'bg-[#2a2636] hover:bg-[#383347] text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-800'}`}><Phone size={14} /></button>
                          <button className={`p-2 rounded-xl transition-colors ${theme === 'dark' ? 'bg-[#2a2636] hover:bg-[#383347] text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-800'}`}><MessageSquare size={14} /></button>
                        </div>
                      </div>
                    )) : (
                      <div className={`text-sm ${themeStyles.textMuted}`}>Нет внешних контактов</div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in duration-300">
                <div className="space-y-4">
                  <h3 className={`text-xs font-black uppercase tracking-widest flex items-center gap-2 ${themeStyles.textMuted} opacity-60`}>
                    <History size={14} /> Журнал действий
                  </h3>
                  <div className="space-y-6 relative ml-4 border-l-2 border-slate-200 dark:border-[#2a2636]">
                    {draft.activities?.map(act => (
                      <div key={act.id} className="relative pl-6">
                        <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-4 ${theme === 'dark' ? 'bg-indigo-500 border-[#1b1828]' : 'bg-indigo-500 border-white'}`} />
                        <div className={`p-4 rounded-2xl border shadow-sm ${themeStyles.panelBorder} ${themeStyles.panel}`}>
                          <div className="flex items-center justify-between mb-1">
                            <span className={`text-[10px] font-bold uppercase tracking-widest ${themeStyles.textMuted}`}>{act.date} • {act.time}</span>
                            <Badge className="bg-slate-500/10 text-slate-400 border-slate-500/20">{act.type}</Badge>
                          </div>
                          <p className={`text-sm font-medium ${themeStyles.text}`}>{act.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className={`text-xs font-black uppercase tracking-widest flex items-center gap-2 ${themeStyles.textMuted} opacity-60`}>
                    <Eye size={14} /> История просмотров
                  </h3>
                  <div className="grid grid-cols-1 gap-3">
                    {draft.touches?.length > 0 ? draft.touches.map(t => (
                      <div key={t.id} className={`flex items-center justify-between p-4 rounded-2xl border shadow-sm ${themeStyles.panelBorder} ${themeStyles.panel}`}>
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white shrink-0 ${theme === 'dark' ? 'bg-[#2a2636]' : 'bg-indigo-500'}`}>
                            {t.user.charAt(0)}
                          </div>
                          <div className="flex flex-col text-left min-w-0">
                            <span className={`text-sm font-bold truncate ${themeStyles.text}`}>{t.user}</span>
                            <span className={`text-[10px] mt-0.5 truncate ${themeStyles.textMuted}`}>{t.action}</span>
                          </div>
                        </div>
                        <span className={`text-[10px] font-bold shrink-0 ml-2 ${themeStyles.textMuted}`}>{t.time}</span>
                      </div>
                    )) : (
                      <div className={`text-sm text-center py-4 ${themeStyles.textMuted}`}>Нет истории просмотров</div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
};

export default function DashboardNew() {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('abqd_theme') || 'light';
    }
    return 'light';
  });

  const [currentView, setCurrentView] = useState('kanban');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const [deals, setDeals] = useState([]);
  const [stages, setStages] = useState([]);
  const [crmLoaded, setCrmLoaded] = useState(false);

  const [selectedId, setSelectedId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentRole, setCurrentRole] = useState("novice");

  const [toasts, setToasts] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);

  const [dragType, setDragType] = useState(null);
  const [draggedId, setDraggedId] = useState(null);
  const [dragOverId, setDragOverId] = useState(null);

  const [editingStageKey, setEditingStageKey] = useState(null);
  const [renameValue, setRenameValue] = useState("");

  const themeStyles = useMemo(() => getThemeStyles(theme), [theme]);

  useEffect(() => {
    localStorage.setItem('abqd_theme', theme);
  }, [theme]);

  const addToast = useCallback((type, title, message) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadCrm = async () => {
      try {
        setIsSyncing(true);
        const state = await crmLoadState();

        if (cancelled) return;

        setDeals(Array.isArray(state.deals) ? state.deals.map(normalizeDeal) : []);
        setStages(state.stages.length ? state.stages : INITIAL_STAGES);
        setCrmLoaded(true);
      } catch (e) {
        console.error('CRM LOAD ERROR', e);
        if (cancelled) return;
        setDeals([]);
        setStages(INITIAL_STAGES);
        setCrmLoaded(true);
        addToast("error", "CRM не загрузилась", "Показаны только базовые этапы без демо-сделок.");
      } finally {
        if (!cancelled) setIsSyncing(false);
      }
    };

    loadCrm();

    return () => {
      cancelled = true;
    };
  }, [addToast]);

  const handleCallAI = async (currentDraft, setDraftFunction) => {
    addToast("info", "AI думает", "Анализируем контекст сделки...");
    setTimeout(() => {
      setDraftFunction(prev => ({
        ...prev,
        fields: { ...prev.fields, note: (prev.fields.note || "") + "\n\n[AI]: Обязательно проверить документацию перед следующим звонком." },
        activities: [{ id: Date.now().toString(), text: 'Использован AI Помощник', date: getTodayDateStr(), time: 'Сейчас', type: 'ai_action' }, ...(prev.activities || [])]
      }));
    }, 800);
  };

  const handleSaveDeal = useCallback((updatedDeal) => {
    setIsSyncing(true);

    setDeals(prev => {
      const normalizedUpdatedDeal = normalizeDeal(updatedDeal);
      const newDeals = prev.map(d => d.id === normalizedUpdatedDeal.id ? normalizedUpdatedDeal : d).map(normalizeDeal);

      crmSaveState({ deals: newDeals, stages })
        .then(() => {
          setIsSyncing(false);
        })
        .catch((e) => {
          console.error('CRM SAVE ERROR', e);
          setIsSyncing(false);
          addToast("error", "Ошибка сохранения", "Изменения не удалось отправить в CRM API.");
        });

      return newDeals;
    });
  }, [stages, addToast]);

  const handleAddDeal = (stageKey) => {
    const newId = `D-${Math.floor(Math.random() * 9000) + 1000}`;
    const newDeal = {
      id: newId, company: "Новый проект", contact: "Неизвестно", stage: stageKey,
      amount: 0, currency: "RUB", score: 50, phone: "", email: "", fields: { budget: "", deadline: "", note: "", address: "" },
      tags: [], nextTaskAt: getTodayDateStr(), plugins: [],
      participants: [{ id: 'u1', name: 'Вы', role: 'owner', avatar: 'bg-indigo-500' }],
      externalContacts: [], attachments: [], connectedChannels: [], messages: [], touches: [],
      activities: [{ id: 'a1', text: 'Карточка создана', date: getTodayDateStr(), time: 'Сейчас', type: 'system' }]
    };

    setDeals(prev => {
      const newDeals = [normalizeDeal(newDeal), ...prev.map(normalizeDeal)];

      setIsSyncing(true);
      crmSaveState({ deals: newDeals, stages })
        .then(() => setIsSyncing(false))
        .catch((e) => {
          console.error('CRM SAVE ERROR', e);
          setIsSyncing(false);
          addToast("error", "Ошибка сохранения", "Новая карточка не сохранилась в CRM API.");
        });

      return newDeals;
    });

    setSelectedId(newId);
  };

  const handleDeleteDeal = (id) => {
    setDeals(prev => {
      const newDeals = prev.filter(d => d.id !== id).map(normalizeDeal);

      setIsSyncing(true);
      crmSaveState({ deals: newDeals, stages })
        .then(() => setIsSyncing(false))
        .catch((e) => {
          console.error('CRM SAVE ERROR', e);
          setIsSyncing(false);
          addToast("error", "Ошибка удаления", "Удаление не сохранилось в CRM API.");
        });

      return newDeals;
    });

    setSelectedId(null);
    addToast("warn", "Проект удален", "Данные контейнера перемещены в корзину.");
  };

  const handleMoveDeal = (dealId, newStage) => {
    setDeals(prev => {
      const newDeals = prev.map(d =>
        d.id === dealId
          ? normalizeDeal({
              ...d,
              stage: newStage,
              activities: [
                { id: Date.now().toString(), text: `Смена этапа: ${newStage}`, date: getTodayDateStr(), time: 'Сейчас', type: 'stage_change' },
                ...ensureArray(d.activities)
              ]
            })
          : normalizeDeal(d)
      );

      setIsSyncing(true);
      crmSaveState({ deals: newDeals, stages })
        .then(() => setIsSyncing(false))
        .catch((e) => {
          console.error('CRM SAVE ERROR', e);
          setIsSyncing(false);
          addToast("error", "Ошибка сохранения", "Перемещение карточки не сохранилось.");
        });

      return newDeals;
    });
  };

  const handleAddStage = () => {
    const newKey = `stage_${Date.now()}`;
    const newStages = [...stages, { key: newKey, title: "Новый этап", color: "bg-indigo-400", gates: [] }];

    setStages(newStages);
    setEditingStageKey(newKey);
    setRenameValue("Новый этап");

    setIsSyncing(true);
    crmSaveState({ deals, stages: newStages })
      .then(() => setIsSyncing(false))
      .catch((e) => {
        console.error('CRM SAVE ERROR', e);
        setIsSyncing(false);
        addToast("error", "Ошибка сохранения", "Новый этап не сохранился.");
      });

    setTimeout(() => {
      const board = document.getElementById('board-container');
      if (board) board.scrollLeft = board.scrollWidth;
    }, 100);
  };

  const handleDeleteStage = (key) => {
    if (deals.some(d => d.stage === key)) {
      addToast("error", "Удаление отменено", "Сначала переместите или удалите все проекты из этого этапа.");
      return;
    }

    const newStages = stages.filter(s => s.key !== key);
    setStages(newStages);

    setIsSyncing(true);
    crmSaveState({ deals, stages: newStages })
      .then(() => {
        setIsSyncing(false);
        addToast("info", "Этап удален", "Столбец успешно удален из воронки.");
      })
      .catch((e) => {
        console.error('CRM SAVE ERROR', e);
        setIsSyncing(false);
        addToast("error", "Ошибка сохранения", "Удаление этапа не сохранилось.");
      });
  };

  const handleRenameStage = (key, newTitle) => {
    if (!newTitle.trim()) {
      setEditingStageKey(null);
      return;
    }

    const newStages = stages.map(s => s.key === key ? { ...s, title: newTitle } : s);
    setStages(newStages);
    setEditingStageKey(null);

    setIsSyncing(true);
    crmSaveState({ deals, stages: newStages })
      .then(() => setIsSyncing(false))
      .catch((e) => {
        console.error('CRM SAVE ERROR', e);
        setIsSyncing(false);
        addToast("error", "Ошибка сохранения", "Переименование этапа не сохранилось.");
      });
  };

  const moveStageOrder = (draggedKey, overKey) => {
    if (draggedKey === overKey) return;

    const draggedIndex = stages.findIndex(s => s.key === draggedKey);
    const overIndex = stages.findIndex(s => s.key === overKey);

    const newStages = [...stages];
    const [draggedStage] = newStages.splice(draggedIndex, 1);
    newStages.splice(overIndex, 0, draggedStage);

    setStages(newStages);

    setIsSyncing(true);
    crmSaveState({ deals, stages: newStages })
      .then(() => setIsSyncing(false))
      .catch((e) => {
        console.error('CRM SAVE ERROR', e);
        setIsSyncing(false);
        addToast("error", "Ошибка сохранения", "Новый порядок этапов не сохранился.");
      });
  };

  const filteredDeals = useMemo(() => {
    return deals.filter(d => {
      const matchesSearch = String(d.company || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = currentRole === "novice" || d.stage !== "inbox";
      return matchesSearch && matchesRole;
    });
  }, [deals, searchQuery, currentRole]);

  const dealsByStage = useMemo(() => {
    const map = {};
    stages.forEach(s => map[s.key] = []);
    filteredDeals.forEach(d => map[d.stage]?.push(d));
    return map;
  }, [filteredDeals, stages]);

  const selectedDeal = useMemo(() => {
    const found = deals.find(d => d.id === selectedId);
    return found ? normalizeDeal(found) : null;
  }, [deals, selectedId]);

  if (!crmLoaded) {
    return (
      <div className={`flex h-screen w-full items-center justify-center ${themeStyles.bg} ${themeStyles.text}`}>
        <div className={`px-6 py-5 rounded-3xl border shadow-xl ${themeStyles.panel} ${themeStyles.panelBorder}`}>
          <div className="flex items-center gap-3">
            <RefreshCw size={18} className="animate-spin text-indigo-500" />
            <div>
              <div className="text-sm font-black">Загрузка CRM</div>
              <div className={`text-xs mt-1 ${themeStyles.textMuted}`}>Подключаем данные пользователя…</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex h-screen w-full transition-colors duration-500 font-sans ${themeStyles.bg} ${themeStyles.text} ${theme === 'dark' ? 'dark' : ''}`}>
      <aside className={`relative border-r flex flex-col p-4 transition-all duration-300 ease-in-out z-40 ${isSidebarCollapsed ? 'w-20' : 'w-64'} ${themeStyles.sidebar} ${themeStyles.panelBorder}`}>
        <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className={`absolute -right-3 top-10 z-50 w-6 h-6 rounded-full border flex items-center justify-center transition-all shadow-xl ${theme === 'dark' ? 'bg-[#2D3446] border-white/10 text-white hover:text-indigo-400' : 'bg-white border-slate-200 text-slate-400 hover:text-indigo-500'}`}>
          {isSidebarCollapsed ? <PanelLeftOpen size={14} /> : <PanelLeftClose size={14} />}
        </button>

        <div className="space-y-2 mb-6 flex-1">
          <button
            onClick={() => setCurrentView('kanban')}
            className={`w-full flex items-center rounded-xl transition-all duration-300 ${isSidebarCollapsed ? 'justify-center p-3' : 'gap-3 px-4 py-3'} ${currentView === 'kanban' ? `${themeStyles.accentGradient} text-white shadow-md` : `hover:bg-black/5 dark:hover:bg-white/5 ${themeStyles.textMuted}`}`}
            title={isSidebarCollapsed ? "Доска" : ''}
          >
            <LayoutDashboard size={18} />
            {!isSidebarCollapsed && <span className="text-sm font-bold">Доска</span>}
          </button>

          <button
            onClick={() => setCurrentView('calendar')}
            className={`w-full flex items-center rounded-xl transition-all duration-300 ${isSidebarCollapsed ? 'justify-center p-3' : 'gap-3 px-4 py-3'} ${currentView === 'calendar' ? `${themeStyles.accentGradient} text-white shadow-md` : `hover:bg-black/5 dark:hover:bg-white/5 ${themeStyles.textMuted}`}`}
            title={isSidebarCollapsed ? "Календарь" : ''}
          >
            <CalendarDays size={18} />
            {!isSidebarCollapsed && <span className="text-sm font-bold">Календарь</span>}
          </button>

          <button
            onClick={() => setCurrentView('bots')}
            className={`w-full flex items-center rounded-xl transition-all duration-300 ${isSidebarCollapsed ? 'justify-center p-3' : 'gap-3 px-4 py-3'} ${currentView === 'bots' ? `${themeStyles.accentGradient} text-white shadow-md` : `hover:bg-black/5 dark:hover:bg-white/5 ${themeStyles.textMuted}`}`}
            title={isSidebarCollapsed ? "Автоматизация" : ''}
          >
            <Bot size={18} />
            {!isSidebarCollapsed && <span className="text-sm font-bold">Автоматизация</span>}
          </button>

          <button
            onClick={() => setCurrentView('analytics')}
            className={`w-full flex items-center rounded-xl transition-all duration-300 ${isSidebarCollapsed ? 'justify-center p-3' : 'gap-3 px-4 py-3'} ${currentView === 'analytics' ? `${themeStyles.accentGradient} text-white shadow-md` : `hover:bg-black/5 dark:hover:bg-white/5 ${themeStyles.textMuted}`}`}
            title={isSidebarCollapsed ? "Аналитика" : ''}
          >
            <BarChart3 size={18} />
            {!isSidebarCollapsed && <span className="text-sm font-bold">Аналитика</span>}
          </button>
        </div>

        <div className="mt-auto pb-4 flex justify-center border-t border-slate-200/50 dark:border-white/5 pt-4">
          <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-3 rounded-2xl hover:bg-black/5 dark:hover:bg-white/5 transition-all group flex items-center justify-center">
            {theme === 'dark' ? <Sun size={20} className="text-amber-500/40 group-hover:text-amber-400 transition-colors duration-300" /> : <Moon size={20} className="text-slate-400 group-hover:text-slate-600 transition-colors duration-300" />}
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 relative overflow-hidden">
        <header className={`h-16 border-b flex items-center justify-between px-4 sm:px-6 z-10 transition-colors ${themeStyles.panel} ${themeStyles.panelBorder}`}>
          <div className="flex items-center gap-4 flex-1 max-w-xl">
            <div className="relative w-full">
              <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40 ${themeStyles.textMuted}`} />
              <input type="text" placeholder={currentView === 'kanban' ? "Поиск по проектам..." : currentView === 'calendar' ? "Поиск по событиям..." : currentView === 'analytics' ? "Поиск в аналитике..." : "Поиск по настройкам..."} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full h-10 pl-10 sm:pl-12 pr-4 rounded-xl text-sm border outline-none transition-all ${themeStyles.input} ${themeStyles.text} ${theme === 'dark' ? 'focus:bg-[#1C1929]' : 'focus:bg-white'}`} />
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isSyncing && (
              <div className="hidden sm:flex items-center gap-2 text-[10px] font-bold text-indigo-500 animate-pulse mr-4 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                <Cloud size={14} /> <span>Синхронизация</span>
              </div>
            )}
            <div className={`flex items-center gap-1 p-1.5 rounded-xl border ${themeStyles.panelBorder} ${themeStyles.input}`}>
              {Object.keys(ROLES).map(k => (
                <button key={k} onClick={() => setCurrentRole(k)} className={`px-3 sm:px-5 py-2 rounded-lg text-[10px] sm:text-xs font-bold transition-all duration-300 ${currentRole === k ? `${themeStyles.accentGradient} text-white shadow-sm` : `opacity-40 hover:opacity-100 ${themeStyles.text}`}`}>
                  {ROLES[k].title}
                </button>
              ))}
            </div>
          </div>
        </header>

        {currentView === 'kanban' ? (
          <div id="board-container" className="flex-1 overflow-x-auto overflow-y-hidden flex p-4 sm:p-8 gap-4 sm:gap-8 custom-scrollbar">
            {stages.map(stage => {
              const stageDeals = dealsByStage[stage.key] || [];
              const stageTotalAmount = stageDeals.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
              const isStageDragged = dragType === 'stage' && draggedId === stage.key;
              const isStageDragOver = dragType === 'stage' && dragOverId === stage.key;
              const isDealDragOver = dragType === 'deal' && dragOverId === stage.key;

              return (
                <div key={stage.key}
                  draggable
                  onDragStart={(e) => {
                    if (e.target && e.target.tagName && e.target.tagName.toLowerCase() === 'input') return e.preventDefault();
                    setDragType('stage');
                    setDraggedId(stage.key);
                    e.dataTransfer.effectAllowed = 'move';
                    e.dataTransfer.setData('text/plain', stage.key);
                    e.dataTransfer.setData('stageId', stage.key);
                  }}
                  onDragEnd={() => {
                    setDragType(null);
                    setDraggedId(null);
                    setDragOverId(null);
                  }}
                  onDragOver={(e) => { e.preventDefault(); setDragOverId(stage.key); }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const droppedDealId = e.dataTransfer.getData("dealId") || (dragType === 'deal' ? draggedId : null);
                    const droppedStageId = e.dataTransfer.getData("stageId") || (dragType === 'stage' ? draggedId : null);

                    if (droppedDealId) handleMoveDeal(droppedDealId, stage.key);
                    if (droppedStageId) moveStageOrder(droppedStageId, stage.key);

                    setDragType(null); setDraggedId(null); setDragOverId(null);
                  }}
                  onDragLeave={() => setDragOverId(null)}
                  className={`flex-none w-[280px] sm:w-[320px] flex flex-col group/col rounded-2xl transition-all duration-300 border-2 ${isStageDragged ? 'opacity-50 border-indigo-500/40' : ''} ${isStageDragOver ? 'border-indigo-500/40 bg-indigo-500/5 scale-[1.02] shadow-xl' : isDealDragOver ? 'border-indigo-500/30 bg-indigo-500/5' : 'border-transparent'}`}
                >
                  <div className="flex flex-col mb-4 px-2 cursor-grab active:cursor-grabbing">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-3 flex-1 min-w-0 text-left">
                        <GripHorizontal size={16} className={`${themeStyles.textMuted} opacity-30 group-hover/col:opacity-100 shrink-0 transition-opacity`} />
                        <div className={`w-2 h-2 rounded-full ${stage.color} shrink-0`} />
                        {editingStageKey === stage.key ? (
                          <input autoFocus value={renameValue} onChange={(e) => setRenameValue(e.target.value)} onBlur={() => handleRenameStage(stage.key, renameValue)} onKeyDown={(e) => e.key === 'Enter' && handleRenameStage(stage.key, renameValue)} className={`bg-transparent font-bold text-sm uppercase tracking-wider outline-none border-b border-indigo-500 w-full ${themeStyles.text}`} />
                        ) : (
                          <h3 onClick={() => { setEditingStageKey(stage.key); setRenameValue(stage.title); }} className={`font-bold text-sm uppercase tracking-wider truncate cursor-text hover:text-indigo-500 transition-colors ${themeStyles.textMuted}`}>{stage.title}</h3>
                        )}
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover/col:opacity-100 transition-opacity">
                        <button onClick={() => handleDeleteStage(stage.key)} className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded-md transition-colors cursor-pointer" title="Удалить этап"><Trash2 size={14} /></button>
                        <button onClick={() => handleAddDeal(stage.key)} className="p-1.5 text-indigo-500 hover:bg-indigo-500/10 rounded-md transition-colors cursor-pointer" title="Добавить проект"><Plus size={16} /></button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pl-9 mt-1">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${theme === 'dark' ? 'bg-[#2a253a] text-[#8b8698]' : 'bg-slate-200 text-slate-500'}`}>{stageDeals.length}</span>
                      <span className="text-[11px] font-medium opacity-50">{formatMoney(stageTotalAmount)}</span>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-3 pb-6 px-1 custom-scrollbar">
                    {stageDeals.map(deal => {
                      const score = getScoreInfo(deal.score);
                      const isDragged = dragType === 'deal' && draggedId === deal.id;

                      return (
                        <div key={deal.id} draggable
                          onDragStart={(e) => {
                            e.stopPropagation();
                            setDragType('deal');
                            setDraggedId(deal.id);
                            e.dataTransfer.effectAllowed = 'move';
                            e.dataTransfer.setData('text/plain', deal.id);
                            e.dataTransfer.setData("dealId", deal.id);
                          }}
                          onDragEnd={(e) => {
                            e.stopPropagation();
                            setDragType(null);
                            setDraggedId(null);
                            setDragOverId(null);
                          }}
                          onClick={() => setSelectedId(deal.id)}
                          className={`group/card p-4 rounded-2xl border cursor-grab active:cursor-grabbing transition-all duration-200 hover:shadow-lg ${selectedId === deal.id ? 'border-indigo-500/50 bg-indigo-500/5 ring-1 ring-indigo-500/20' : isDragged ? 'opacity-50 border-indigo-500/50 bg-indigo-500/10 ring-2 ring-indigo-500/20' : `${themeStyles.card} ${themeStyles.panelBorder} ${themeStyles.cardHover} shadow-sm`}`}
                        >
                          <div className="flex justify-between items-start mb-2 text-left">
                            <h4 className={`font-bold text-sm truncate pr-2 ${themeStyles.text}`}>{deal.company}</h4>
                            <Badge className={score.color}>{deal.score}</Badge>
                          </div>
                          <div className="flex items-center justify-between text-[11px] mb-3 text-left">
                            <span className={themeStyles.textMuted}>{deal.contact}</span>
                            <span className={`font-bold tracking-tight ${themeStyles.accentText}`}>{formatMoney(deal.amount)}</span>
                          </div>

                          <div className={`flex items-center gap-2 pt-3 mt-2 border-t ${themeStyles.panelBorder}`}>
                            <div className="flex -space-x-1.5 overflow-hidden shrink-0">
                              {deal.plugins?.length > 0 ? deal.plugins.map(pid => {
                                const p = PLUGINS.find(item => item.id === pid);
                                return p ? <div key={pid} className={`w-6 h-6 rounded-full ${themeStyles.bg} border ${themeStyles.panelBorder} flex items-center justify-center text-indigo-500 shadow-sm z-10 hover:z-20`} title={p.title}>{p.icon}</div> : null;
                              }) : <span className="text-[10px] opacity-40 font-medium mt-1">Нет плагинов</span>}
                            </div>

                            <div className="flex gap-2 shrink-0 ml-1">
                              {deal.messages?.length > 0 && (
                                <div className={`flex items-center gap-1 text-[10px] font-bold ${themeStyles.textMuted}`} title="Сообщения">
                                  <MessageSquare size={10} /> {deal.messages.length}
                                </div>
                              )}
                              {deal.attachments?.length > 0 && (
                                <div className={`flex items-center gap-1 text-[10px] font-bold ${themeStyles.textMuted}`} title="Вложения">
                                  <Paperclip size={10} /> {deal.attachments.length}
                                </div>
                              )}
                            </div>

                            <div className="flex-1" />

                            {deal.nextTaskAt && (
                              <div className={`flex items-center gap-1 text-[10px] font-bold shrink-0 ${getDueStatus(deal.nextTaskAt) === "expired" ? "text-rose-500" : getDueStatus(deal.nextTaskAt) === "today" ? "text-amber-500" : "text-emerald-500"}`}>
                                <Clock size={10} /> <span>{deal.nextTaskAt.slice(5)}</span>
                              </div>
                            )}

                            {deal.participants?.length > 0 && (
                              <div className="flex -space-x-1.5 overflow-hidden shrink-0 ml-1">
                                {deal.participants.map((p, i) => (
                                  <div key={i} className={`w-5 h-5 rounded-full text-[8px] text-white flex items-center justify-center font-bold border border-white dark:border-[#221f30] ${p.avatar || 'bg-slate-500'}`} title={p.name}>{p.name.charAt(0)}</div>
                                ))}
                              </div>
                            )}

                            <GripHorizontal size={14} className={`${themeStyles.textMuted} opacity-0 group-hover/card:opacity-60 transition-opacity shrink-0 ml-1`} />
                          </div>
                        </div>
                      );
                    })}
                    <button onClick={() => handleAddDeal(stage.key)} className={`w-full py-3 rounded-xl border-2 border-dashed ${themeStyles.panelBorder} opacity-40 hover:opacity-100 hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-all text-xs font-medium flex items-center justify-center gap-2 ${themeStyles.textMuted}`}><Plus size={14} /> Создать проект</button>
                  </div>
                </div>
              );
            })}

            <div className="flex-none w-[280px] sm:w-[320px] flex flex-col">
              <button onClick={handleAddStage} className={`w-full h-14 rounded-xl border-2 border-dashed ${themeStyles.panelBorder} opacity-40 hover:opacity-100 hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all flex items-center justify-center gap-2 font-medium text-sm ${themeStyles.textMuted}`}>
                <PlusCircle size={16} /> Добавить этап
              </button>
            </div>
          </div>
        ) : currentView === 'calendar' ? (
          <CalendarView deals={filteredDeals} onOpenDeal={(id) => setSelectedId(id)} themeStyles={themeStyles} theme={theme} stages={stages} />
        ) : currentView === 'bots' ? (
          <BotsView themeStyles={themeStyles} theme={theme} />
        ) : (
          <AnalyticsView deals={filteredDeals} stages={stages} themeStyles={themeStyles} theme={theme} onOpenDeal={(id) => setSelectedId(id)} />
        )}
      </main>

      {selectedDeal && (
        <DealEditorModal
          deal={selectedDeal} stages={stages} themeStyles={themeStyles} theme={theme} isSyncing={isSyncing}
          onSave={handleSaveDeal} onClose={() => setSelectedId(null)} onDelete={handleDeleteDeal} onCallAI={handleCallAI}
        />
      )}

      <div className="fixed top-20 right-4 sm:right-8 z-[1000] space-y-4 pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className={`flex items-start gap-4 p-4 rounded-xl shadow-xl border backdrop-blur-xl animate-in slide-in-from-right duration-300 pointer-events-auto min-w-[280px] ${theme === 'dark' ? 'bg-[#1b1828]/95 border-[#2a253a]' : 'bg-white/95 border-slate-200'}`}>
            <div className={`mt-0.5 ${t.type === 'success' ? 'text-emerald-500' : t.type === 'error' ? 'text-rose-500' : 'text-indigo-500'}`}>
              {t.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            </div>
            <div className="flex-1 text-left"><p className="font-bold text-sm">{t.title}</p><p className={`text-xs mt-1 ${themeStyles.textMuted}`}>{t.message}</p></div>
          </div>
        ))}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 5px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.15); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(99,102,241,0.3); }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}} />
    </div>
  );
}
