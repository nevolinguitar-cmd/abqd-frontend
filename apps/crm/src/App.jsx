import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Search, Moon, Sun, Plus, CheckCircle2, AlertCircle, Clock, Zap, Bot,
  BarChart3, X, User, Target, Phone, Trash2, PanelLeftClose, PanelLeftOpen, Cloud,
  Check, PlusCircle, GripHorizontal, LayoutDashboard, CalendarDays, ChevronLeft,
  ChevronRight, Users, Briefcase, Bell, Globe, Link2, Settings, Lock,
  RefreshCw, TrendingUp, Activity, PieChart, ArrowUpRight, ArrowDownRight,
  ShieldAlert, Download, Filter, Sparkles, Send, BrainCircuit, ChevronDown, Flag,
  Video, Mail, MapPin, ExternalLink, MessageCircle, Share2, BarChart2, Flame,
  CreditCard, ChevronUp, Star, MessageSquare, Play, Pause, Edit3, ArrowLeft,
  Copy, Smartphone, Workflow, KeyRound, Info
} from 'lucide-react';

/**
 * ABQD CRM — Универсальный Dashboard (Premium UI Edition)
 * Обновление: Локальное сохранение состояния CRM (deals / stages / flows) через localStorage.
 * Обновление: Календарь подготовлен под ICS MVP + OAuth + CalDAV.
 */

// ==========================================
// 1. БАЗОВЫЕ КОМПОНЕНТЫ И КОНСТАНТЫ
// ==========================================

const Badge = ({ children, className = "" }) => (
  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition-all duration-300 ${className}`}>
    {children}
  </span>
);

const INITIAL_STAGES = [
  { key: "inbox", title: "Входящие", color: "bg-slate-400" },
  { key: "qual", title: "Квалификация", color: "bg-blue-400" },
  { key: "proposal", title: "Предложение", color: "bg-indigo-400" },
  { key: "contract", title: "Договор", color: "bg-violet-400" },
  { key: "won", title: "Выиграно", color: "bg-emerald-400" },
];

const MARKETING_SOURCES_LIST = ['Telegram Ads', 'SEO / Сайт', 'Холодный обзвон', 'Рефералка', 'Личные связи', 'Неизвестно'];

const PRIORITIES = [
  { key: 'low', title: 'Низкий', color: 'text-slate-400 border-slate-200 dark:border-white/10' },
  { key: 'medium', title: 'Средний', color: 'text-amber-500 border-amber-200 dark:border-amber-500/30' },
  { key: 'high', title: 'Высокий', color: 'text-rose-500 border-rose-200 dark:border-rose-500/30' },
];

const getTodayDateStr = () => new Date().toISOString().split('T')[0];

const INITIAL_DEALS = [
  {
    id: "D-1001",
    company: "SOVA Studio",
    contact: "Анастасия",
    stage: "inbox",
    amount: 180000,
    currency: "RUB",
    score: 78,
    phone: "79001112233",
    email: "hello@sova.studio",
    source: "Telegram Ads",
    address: "Москва, ул. Ленина, 10",
    priority: 'high',
    description: "Планируют внедрение CRM до конца квартала.",
    nextStep: "Подготовить презентацию модулей",
    nextTaskAt: getTodayDateStr(),
    touches: 12
  },
  {
    id: "D-1002",
    company: "Nord Realty",
    contact: "Алексей",
    stage: "qual",
    amount: 320000,
    currency: "RUB",
    score: 85,
    phone: "79004445566",
    email: "info@nord.re",
    source: "SEO / Сайт",
    address: "Санкт-Петербург, Невский пр-т, 1",
    priority: 'medium',
    description: "Крупное агентство недвижимости.",
    nextStep: "Созвон по API интеграции",
    nextTaskAt: getTodayDateStr(),
    touches: 5
  },
  {
    id: "D-1003",
    company: "TechFlow",
    contact: "Иван",
    stage: "won",
    amount: 450000,
    currency: "RUB",
    score: 92,
    phone: "79991234567",
    email: "ivan@techflow.ru",
    source: "Рефералка",
    address: "Екатеринбург",
    priority: 'low',
    description: "Оплата получена.",
    nextStep: "Передача в аккаунтинг",
    nextTaskAt: "",
    touches: 24
  }
];

const INITIAL_FLOWS = [
  {
    id: "flow_101",
    name: "Создать лид (Базовый)",
    category: "crm",
    is_active: true,
    entry: { command: "/lead", keywords: [] },
    nodes: [
      { id: "q1", type: "text", key: "company", title: "Какая компания?", required: true, next: "q2" },
      { id: "q2", type: "text", key: "contact", title: "Имя контактного лица?", required: false, next: "q3" },
      { id: "q3", type: "date", key: "nextTaskAt", title: "Дата следующего действия?", required: false, next: "done" },
      { id: "done", type: "action", action: "create_deal" }
    ],
    created_at: Date.now() - 86400000,
    updated_at: Date.now(),
    version: 1
  },
  {
    id: "flow_102",
    name: "Опрос удовлетворенности",
    category: "support",
    is_active: false,
    entry: { command: "/nps", keywords: [] },
    nodes: [
      { id: "q1", type: "choice", key: "rating", title: "Оцените работу от 1 до 5", required: true, options: ["1", "2", "3", "4", "5"], next: "done" },
      { id: "done", type: "action", action: "log_support" }
    ],
    created_at: Date.now() - 172800000,
    updated_at: Date.now(),
    version: 1
  }
];

const FLOW_CATEGORIES = [
  { id: 'crm', label: 'CRM (Продажи)' },
  { id: 'support', label: 'Поддержка' },
  { id: 'sales', label: 'Маркетинг' }
];

const DAYS_OF_WEEK = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
const MONTHS = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];

// ==========================================
// 2. УТИЛИТЫ И ПРЕМИУМ-СТИЛИ
// ==========================================

const formatMoney = (amount) => {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0
  }).format(amount || 0);
};

const getScoreInfo = (score) => {
  if (score >= 85) return { text: "Горячий", color: "text-orange-500 bg-orange-500/10 border-orange-500/20" };
  if (score >= 70) return { text: "Тёплый", color: "text-amber-500 bg-amber-500/10 border-amber-500/20" };
  return { text: "Холодный", color: "text-cyan-500 bg-cyan-500/10 border-cyan-500/20" };
};

const getDueStatus = (dateStr) => {
  if (!dateStr) return "none";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  if (target < today) return "expired";
  if (target.getTime() === today.getTime()) return "today";
  return "future";
};

const getThemeStyles = (theme) => ({
  dark: {
    bg: 'bg-[#18181b]',
    panel: 'bg-[#222226]/95 backdrop-blur-xl',
    panelBorder: 'border-white/[0.06]',
    sidebar: 'bg-[#18181b]/80 backdrop-blur-2xl',
    card: 'bg-white/[0.03]',
    cardHover: 'hover:bg-white/[0.06] hover:shadow-[0_8px_30px_rgba(0,0,0,0.3)] hover:border-white/[0.08]',
    text: 'text-zinc-100',
    textMuted: 'text-zinc-400',
    input: 'bg-white/[0.03] border-white/[0.05] focus:bg-white/[0.06] focus:border-indigo-500/50 hover:bg-white/[0.05] focus:ring-4 focus:ring-indigo-500/10',
    accentGradient: 'bg-gradient-to-r from-indigo-500 to-violet-600',
    accentText: 'text-indigo-400',
    calendarCellHover: 'hover:bg-white/[0.03]'
  },
  light: {
    bg: 'bg-[#f8fafc]',
    panel: 'bg-white/95 backdrop-blur-xl',
    panelBorder: 'border-slate-200/50',
    sidebar: 'bg-[#f8fafc]/80 backdrop-blur-2xl',
    card: 'bg-white',
    cardHover: 'hover:bg-slate-50/80 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:border-indigo-500/20',
    text: 'text-slate-900',
    textMuted: 'text-slate-500',
    input: 'bg-black/[0.02] border-black/[0.04] focus:bg-white focus:border-indigo-400/50 hover:bg-black/[0.04] focus:ring-4 focus:ring-indigo-500/10',
    accentGradient: 'bg-gradient-to-r from-indigo-500 to-violet-600',
    accentText: 'text-indigo-600',
    calendarCellHover: 'hover:bg-slate-50'
  }
}[theme]);

const STORAGE_KEYS = {
  theme: 'abqd_theme',
  deals: 'abqd_crm_deals_v1',
  stages: 'abqd_crm_stages_v1',
  flows: 'abqd_crm_flows_v1',
};

const safeReadJSON = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
};

const safeWriteJSON = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
};

// ==========================================
// 3. КОМПОНЕНТ "СЦЕНАРИИ" (BOT FLOWS)
// ==========================================

const BotFlowsView = ({ themeStyles, theme, flows, setFlows }) => {
  const [activeTab, setActiveTab] = useState('crm');
  const [editingFlowId, setEditingFlowId] = useState(null);
  const [editingData, setEditingData] = useState(null);
  const [tgLinkToken, setTgLinkToken] = useState(null);
  const [isLinking, setIsLinking] = useState(false);

  const filteredFlows = useMemo(() => flows.filter(f => f.category === activeTab), [flows, activeTab]);

  const handleCreateNew = () => {
    setEditingData({
      id: `flow_${Date.now()}`,
      name: "Новый сценарий",
      category: activeTab,
      is_active: false,
      entry: { command: "/new_command", keywords: [] },
      nodes: [
        { id: "q1", type: "text", key: "question", title: "Ваш вопрос?", required: true, next: "done" },
        { id: "done", type: "action", action: "create_deal" }
      ],
      created_at: Date.now(),
      updated_at: Date.now(),
      version: 1
    });
    setEditingFlowId('new');
  };

  const handleEdit = (flow) => {
    setEditingData(JSON.parse(JSON.stringify(flow)));
    setEditingFlowId(flow.id);
  };

  const handleSave = () => {
    if (editingFlowId === 'new') setFlows([...flows, editingData]);
    else setFlows(flows.map(f => f.id === editingData.id ? editingData : f));
    setEditingFlowId(null);
    setEditingData(null);
  };

  const handleDelete = (id) => {
    if (window.confirm("Удалить сценарий?")) setFlows(flows.filter(f => f.id !== id));
  };

  const handleToggleStatus = (id) => {
    setFlows(flows.map(f => f.id === id ? { ...f, is_active: !f.is_active } : f));
  };

  const generateTgLink = () => {
    setIsLinking(true);
    setTimeout(() => {
      setTgLinkToken(Math.random().toString(36).substring(2, 10));
      setIsLinking(false);
    }, 600);
  };

  if (editingFlowId && editingData) {
    return (
      <div className="flex flex-col h-full p-4 pb-32 sm:pb-8 sm:p-8 overflow-y-auto custom-scrollbar gap-6 animate-in fade-in duration-300">
        <div className="flex items-center justify-between">
          <button onClick={() => setEditingFlowId(null)} className={`flex items-center gap-2 text-sm font-bold transition-colors ${themeStyles.textMuted} hover:${themeStyles.text}`}>
            <ArrowLeft size={16} /> Назад к списку
          </button>
          <button onClick={handleSave} className={`px-5 py-2.5 rounded-xl text-white font-bold text-sm shadow-lg shadow-indigo-500/20 hover:-translate-y-0.5 transition-all ${themeStyles.accentGradient}`}>
            Сохранить сценарий
          </button>
        </div>

        <div className={`p-6 sm:p-8 rounded-[2rem] border ${themeStyles.panelBorder} ${themeStyles.panel} shadow-md`}>
          <h3 className={`text-lg font-black mb-6 ${themeStyles.text}`}>Основные настройки</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase opacity-40 tracking-widest">Название сценария</label>
              <input value={editingData.name} onChange={e => setEditingData({ ...editingData, name: e.target.value })} className={`w-full p-3.5 rounded-xl border outline-none font-bold text-sm transition-all ${themeStyles.input} ${themeStyles.text}`} />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase opacity-40 tracking-widest">Команда Telegram</label>
              <input value={editingData.entry.command} onChange={e => setEditingData({ ...editingData, entry: { ...editingData.entry, command: e.target.value } })} className={`w-full p-3.5 rounded-xl border outline-none font-bold text-sm transition-all text-indigo-500 ${themeStyles.input}`} />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase opacity-40 tracking-widest">Категория (Режим)</label>
              <select value={editingData.category} onChange={e => setEditingData({ ...editingData, category: e.target.value })} className={`w-full p-3.5 rounded-xl border outline-none font-bold text-sm transition-all ${themeStyles.input} ${themeStyles.text} [&>option]:bg-white dark:[&>option]:bg-[#222226]`}>
                {FLOW_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className={`p-6 sm:p-8 rounded-[2rem] border ${themeStyles.panelBorder} ${themeStyles.panel} shadow-md`}>
          <div className="flex items-center justify-between mb-6">
            <h3 className={`text-lg font-black ${themeStyles.text} flex items-center gap-2`}>
              <Workflow size={20} className="text-indigo-500" /> Шаги (Вопросы)
            </h3>
            <span className={`text-xs font-bold px-3 py-1 rounded-full bg-black/5 dark:bg-white/5 ${themeStyles.textMuted}`}>Узлов: {editingData.nodes.length}</span>
          </div>

          <div className="space-y-4">
            {editingData.nodes.map((node, index) => {
              const isAction = node.type === 'action';
              return (
                <div key={node.id} className={`p-5 rounded-2xl border relative flex gap-4 ${isAction ? 'bg-indigo-500/5 border-indigo-500/30' : themeStyles.card + ' ' + themeStyles.panelBorder}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-black text-xs ${isAction ? 'bg-indigo-500 text-white' : 'bg-black/10 dark:bg-white/10 ' + themeStyles.text}`}>
                    {index + 1}
                  </div>
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center justify-between">
                      <select
                        value={node.type}
                        onChange={(e) => {
                          const newNodes = [...editingData.nodes];
                          newNodes[index].type = e.target.value;
                          if (e.target.value === 'action') newNodes[index].action = 'create_deal';
                          setEditingData({ ...editingData, nodes: newNodes });
                        }}
                        className={`p-2 rounded-lg border outline-none font-bold text-xs transition-all ${isAction ? 'bg-indigo-500 text-white border-transparent' : themeStyles.input + ' ' + themeStyles.text} [&>option]:bg-white dark:[&>option]:bg-[#222226]`}
                      >
                        <option value="text">Текст (Ответ)</option>
                        <option value="date">Дата</option>
                        <option value="choice">Выбор (Кнопки)</option>
                        <option value="action">Действие (Финал)</option>
                      </select>
                      <button
                        onClick={() => {
                          const newNodes = editingData.nodes.filter((_, i) => i !== index);
                          setEditingData({ ...editingData, nodes: newNodes });
                        }}
                        className="text-rose-500 opacity-50 hover:opacity-100 p-1"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    {!isAction ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <input
                            placeholder="Текст вопроса в Telegram..."
                            value={node.title || ''}
                            onChange={(e) => {
                              const newNodes = [...editingData.nodes];
                              newNodes[index].title = e.target.value;
                              setEditingData({ ...editingData, nodes: newNodes });
                            }}
                            className={`w-full p-3 rounded-xl border outline-none font-medium text-sm transition-all ${themeStyles.input} ${themeStyles.text}`}
                          />
                        </div>
                        <div className="flex gap-4 items-center">
                          <input
                            placeholder="Ключ (напр. company)"
                            value={node.key || ''}
                            onChange={(e) => {
                              const newNodes = [...editingData.nodes];
                              newNodes[index].key = e.target.value;
                              setEditingData({ ...editingData, nodes: newNodes });
                            }}
                            className={`flex-1 p-3 rounded-xl border outline-none font-mono text-xs transition-all ${themeStyles.input} ${themeStyles.textMuted}`}
                          />
                          <label className={`flex items-center gap-2 text-xs font-bold cursor-pointer ${themeStyles.text}`}>
                            <input
                              type="checkbox"
                              checked={node.required || false}
                              onChange={(e) => {
                                const newNodes = [...editingData.nodes];
                                newNodes[index].required = e.target.checked;
                                setEditingData({ ...editingData, nodes: newNodes });
                              }}
                              className="w-4 h-4 rounded text-indigo-500 accent-indigo-500"
                            />
                            Обязательно
                          </label>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <span className={`text-sm font-bold ${themeStyles.text}`}>Действие:</span>
                        <select
                          value={node.action}
                          onChange={(e) => {
                            const newNodes = [...editingData.nodes];
                            newNodes[index].action = e.target.value;
                            setEditingData({ ...editingData, nodes: newNodes });
                          }}
                          className={`p-2 rounded-lg border outline-none font-mono text-xs transition-all bg-transparent border-indigo-500/30 text-indigo-500 [&>option]:bg-white dark:[&>option]:bg-[#222226]`}
                        >
                          <option value="create_deal">Создать сделку в CRM</option>
                          <option value="log_support">Оставить тикет (Support)</option>
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={() => {
              const newNode = { id: `q${Date.now()}`, type: "text", key: "new_key", title: "Новый вопрос", required: false, next: "done" };
              const nodes = [...editingData.nodes];
              if (nodes.length > 0 && nodes[nodes.length - 1].type === 'action') nodes.splice(nodes.length - 1, 0, newNode);
              else nodes.push(newNode);
              setEditingData({ ...editingData, nodes });
            }}
            className={`mt-6 w-full py-4 rounded-xl border-2 border-dashed border-indigo-500/20 text-indigo-500 font-bold text-sm hover:bg-indigo-500/5 hover:border-indigo-500/50 transition-all flex items-center justify-center gap-2`}
          >
            <Plus size={18} /> Добавить шаг
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full p-4 pb-32 sm:pb-8 sm:p-8 overflow-y-auto custom-scrollbar gap-8 animate-in fade-in duration-300">
      <div className="flex flex-col lg:flex-row justify-between gap-6 items-start lg:items-center">
        <div>
          <h2 className={`text-2xl sm:text-3xl font-black tracking-tight ${themeStyles.text}`}>Боты и Сценарии</h2>
          <p className={`text-sm mt-1 ${themeStyles.textMuted}`}>Настройка воронок для Telegram-бота и создание лидов из чата.</p>
        </div>

        <div className={`p-4 sm:p-5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center gap-4 shadow-sm w-full lg:w-auto ${themeStyles.panelBorder} ${theme === 'dark' ? 'bg-indigo-500/10' : 'bg-indigo-50'}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-500 text-white flex items-center justify-center shrink-0">
              <Smartphone size={20} />
            </div>
            <div>
              <h4 className={`text-sm font-black ${themeStyles.text}`}>Telegram Бот</h4>
              <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mt-0.5">@abqd_robot</p>
            </div>
          </div>

          {!tgLinkToken ? (
            <button onClick={generateTgLink} disabled={isLinking} className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white dark:bg-[#222226] border border-black/5 dark:border-white/5 shadow-sm text-sm font-bold hover:scale-105 transition-transform text-indigo-500 disabled:opacity-50">
              {isLinking ? 'Генерация...' : 'Получить ссылку (Deep-link)'}
            </button>
          ) : (
            <div className="flex items-center gap-2 bg-white dark:bg-[#18181b] p-2 rounded-xl border border-indigo-500/30 w-full sm:w-auto">
              <input readOnly value={`https://t.me/abqd_robot?start=link_${tgLinkToken}`} className="bg-transparent outline-none text-xs font-mono text-indigo-500 w-full sm:w-48 px-2" />
              <button onClick={() => alert('Скопировано!')} className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20"><Copy size={14} /></button>
            </div>
          )}
        </div>
      </div>

      <div className={`flex p-1.5 rounded-2xl border w-full sm:w-max shadow-inner ${themeStyles.panelBorder} ${themeStyles.panel}`}>
        {FLOW_CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveTab(cat.id)}
            className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${activeTab === cat.id ? 'bg-indigo-500 text-white shadow-md' : `hover:bg-black/5 dark:hover:bg-white/5 ${themeStyles.textMuted}`}`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className={`p-4 rounded-xl border-l-4 border-indigo-500 bg-indigo-500/5 ${themeStyles.panelBorder}`}>
        <p className={`text-sm font-medium ${themeStyles.text}`}>
          <span className="font-black">Как это работает:</span> В Telegram выберите режим <code className="bg-indigo-500/10 text-indigo-500 px-1.5 py-0.5 rounded">/mode {activeTab}</code> или отправьте команду (например <code className="bg-indigo-500/10 text-indigo-500 px-1.5 py-0.5 rounded">/lead</code>). Бот проведет опрос и мгновенно создаст карточку в CRM.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <button onClick={handleCreateNew} className={`h-full min-h-[180px] rounded-[2rem] border-2 border-dashed flex flex-col items-center justify-center gap-3 transition-all hover:-translate-y-1 hover:shadow-xl ${themeStyles.panelBorder} ${themeStyles.panel} hover:border-indigo-500/50 group`}>
          <div className="w-12 h-12 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Plus size={24} />
          </div>
          <span className={`text-sm font-black ${themeStyles.text}`}>Создать сценарий</span>
        </button>

        {filteredFlows.map(flow => (
          <div key={flow.id} className={`p-6 sm:p-7 rounded-[2rem] border flex flex-col justify-between transition-all hover:-translate-y-1 hover:shadow-xl ${themeStyles.panelBorder} ${themeStyles.card}`}>
            <div>
              <div className="flex justify-between items-start mb-4">
                <div className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold ${flow.is_active ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-slate-500/10 text-slate-500 border border-slate-500/20'}`}>
                  {flow.entry.command}
                </div>
                <button onClick={() => handleToggleStatus(flow.id)} className={`p-1.5 rounded-full transition-colors ${flow.is_active ? 'text-emerald-500 hover:bg-emerald-500/10' : 'text-slate-400 hover:bg-slate-500/10'}`} title={flow.is_active ? "Выключить" : "Включить"}>
                  {flow.is_active ? <Pause size={20} /> : <Play size={20} />}
                </button>
              </div>
              <h3 className={`text-lg font-black tracking-tight mb-2 ${themeStyles.text} ${!flow.is_active && 'opacity-50'}`}>{flow.name}</h3>
              <p className={`text-xs font-bold ${themeStyles.textMuted} mb-4 flex items-center gap-1.5`}><Workflow size={12} /> {flow.nodes.length} шагов (вопросов)</p>
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-black/5 dark:border-white/5">
              <button onClick={() => handleEdit(flow)} className="flex-1 py-2.5 rounded-xl bg-indigo-500/10 text-indigo-500 font-bold text-xs hover:bg-indigo-500/20 transition-colors flex items-center justify-center gap-2">
                <Edit3 size={14} /> Настроить
              </button>
              <button onClick={() => handleDelete(flow.id)} className="p-2.5 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 transition-colors">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ==========================================
// 4. КОМПОНЕНТ АНАЛИТИКИ (AI ИДЕИ И ЦЕЛИ)
// ==========================================

const AnalyticsView = ({ deals, themeStyles, theme, setTheme, stages }) => {
  const [isAiHQOpen, setIsAiHQOpen] = useState(true);
  const [isDynamicsOpen, setIsDynamicsOpen] = useState(true);
  const [reflectionText, setReflectionText] = useState('');
  const [aiResponse, setAiResponse] = useState(null);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [revenueGoal, setRevenueGoal] = useState(1000000);

  const metrics = useMemo(() => {
    const totalCount = deals.length || 1;
    const won = deals.filter(d => d.stage === 'won');
    const totalRevenue = won.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
    const totalActiveAmount = deals.filter(d => d.stage !== 'won').reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
    const avgTouches = deals.reduce((sum, d) => sum + (d.touches || 0), 0) / totalCount;

    return {
      totalRevenue,
      totalActiveAmount,
      avgCheck: won.length > 0 ? totalRevenue / won.length : 0,
      winRate: ((won.length / totalCount) * 100).toFixed(1),
      avgTouches: avgTouches.toFixed(1)
    };
  }, [deals]);

  const stageStats = useMemo(() => {
    return stages.map(s => {
      const stageDeals = deals.filter(d => d.stage === s.key);
      const sum = stageDeals.reduce((acc, d) => acc + (Number(d.amount) || 0), 0);
      return { key: s.key, label: s.title, sum, count: stageDeals.length, color: s.color };
    });
  }, [deals, stages]);

  const marketingSources = useMemo(() => {
    const sourcesMap = {};
    deals.forEach(d => {
      const s = d.source || 'Неизвестно';
      if (!sourcesMap[s]) sourcesMap[s] = { name: s, leads: 0, revenue: 0 };
      sourcesMap[s].leads += 1;
      if (d.stage === 'won') sourcesMap[s].revenue += (Number(d.amount) || 0);
    });
    return Object.values(sourcesMap).sort((a, b) => b.leads - a.leads);
  }, [deals]);

  const goalProgress = Math.min((metrics.totalRevenue / (revenueGoal || 1)) * 100, 100).toFixed(1);

  const handleAiBrainstorm = () => {
    if (!reflectionText.trim()) return;
    setIsAiThinking(true);
    setTimeout(() => {
      setAiResponse(
`💡 АНАЛИЗ ПЕРСПЕКТИВ И ИДЕИ:

1. Выявление зависшего капитала: Основной объем средств (${formatMoney(metrics.totalActiveAmount)}) сейчас находится на этапах Квалификации. Идея: предложите клиентам тестовый доступ или бонус за быстрое принятие решения.

2. Дисциплина касаний: У вас есть карточки с очень малым индексом касаний (менее 5). Идея: Настройте автоматическую WhatsApp-рассылку для подогрева интереса.

3. Лидеры привлечения: Источник "${marketingSources[0]?.name || 'Текущий топ'}" показывает лучшую конверсию. Перспектива: Реинвестируйте 20% бюджета из других каналов сюда для ускорения достижения плана (${goalProgress}% выполнено).`
      );
      setIsAiThinking(false);
    }, 1500);
  };

  return (
    <div className="w-full h-full overflow-y-auto custom-scrollbar">
      <div className="max-w-[1600px] mx-auto flex flex-col gap-8 sm:gap-12 p-4 sm:p-8 pb-32 sm:pb-12 min-h-max">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
          <div>
            <h2 className={`text-3xl sm:text-4xl font-black tracking-tight ${themeStyles.text}`}>Аналитика и Цели</h2>
            <p className={`text-sm mt-1.5 font-medium ${themeStyles.textMuted}`}>Управление показателями и поиск точек роста.</p>
          </div>
          <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className={`p-3.5 rounded-2xl border ${themeStyles.panelBorder} ${themeStyles.panel} shadow-sm hover:scale-105 transition-all duration-300 group shrink-0`}>
            {theme === 'dark' ? <Sun size={20} className="text-amber-400 group-hover:rotate-45 transition-transform duration-500" /> : <Moon size={20} className="text-indigo-500 group-hover:-rotate-12 transition-transform duration-500" />}
          </button>
        </div>

        <div className={`rounded-[2.5rem] border shadow-sm overflow-hidden transition-all duration-500 ${themeStyles.panelBorder} ${themeStyles.panel} relative shrink-0`}>
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-400 via-purple-500 to-indigo-400 opacity-80" />

          <button onClick={() => setIsAiHQOpen(!isAiHQOpen)} className="w-full p-6 sm:p-10 flex items-center justify-between group outline-none">
            <div className="flex items-center gap-5 text-left">
              <div className={`w-16 h-16 rounded-[1.25rem] flex items-center justify-center shadow-inner ${theme === 'dark' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-50 text-indigo-600'} group-hover:scale-105 transition-transform duration-500`}>
                <Bot size={32} strokeWidth={1.5} />
              </div>
              <div>
                <h3 className={`text-xl sm:text-2xl font-black tracking-tight ${themeStyles.text}`}>AI-Стратег</h3>
                <p className={`text-sm mt-1 font-medium ${themeStyles.textMuted}`}>Искусственный интеллект анализирует вашу воронку.</p>
              </div>
            </div>
            <div className={`p-3 rounded-full border transition-all duration-500 ${isAiHQOpen ? 'bg-blue-500/10 border-blue-500/30 text-blue-500 rotate-180' : `${themeStyles.panelBorder} opacity-50 group-hover:opacity-100`}`}>
              <ChevronDown size={20} />
            </div>
          </button>

          {isAiHQOpen && (
            <div className="p-6 sm:p-10 pt-0 animate-in slide-in-from-top-4 fade-in duration-500 grid grid-cols-1 lg:grid-cols-5 gap-6 sm:gap-10 border-t border-black/5 dark:border-white/5 mt-2">
              <div className="space-y-5 lg:col-span-2 flex flex-col">
                <div className="relative flex-1 flex flex-col">
                  <textarea
                    value={reflectionText}
                    onChange={(e) => setReflectionText(e.target.value)}
                    placeholder="Опишите ситуацию. Например: 'Как мне ускорить сделки на этапе квалификации?'"
                    className={`flex-1 w-full min-h-[160px] p-6 rounded-3xl border outline-none text-sm font-medium shadow-inner resize-none transition-all duration-300 ${themeStyles.input} ${themeStyles.text} focus:border-indigo-500/50 focus:shadow-[0_0_20px_rgba(99,102,241,0.1)]`}
                  />
                  <div className="absolute top-5 right-5 opacity-20 pointer-events-none">
                    <BrainCircuit size={28} />
                  </div>
                </div>
                <button
                  onClick={handleAiBrainstorm}
                  disabled={isAiThinking}
                  className={`w-full py-4 sm:py-5 rounded-2xl font-black text-sm tracking-wide shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.98] transition-all flex items-center justify-center gap-3 ${isAiThinking ? 'bg-indigo-400 text-white/80 cursor-wait' : 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-indigo-500/25'}`}
                >
                  {isAiThinking ? (
                    <><RefreshCw size={18} className="animate-spin" /> Анализирую данные...</>
                  ) : (
                    <><Sparkles size={18} /> Сгенерировать план действий</>
                  )}
                </button>
              </div>

              <div className={`lg:col-span-3 p-6 sm:p-10 rounded-[2rem] border relative overflow-hidden flex flex-col ${theme === 'dark' ? 'bg-[#18181b]/80 border-white/[0.04]' : 'bg-white border-slate-200 shadow-sm'}`}>
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="flex items-center gap-2.5 mb-6 opacity-60 relative z-10">
                  <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                  <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${themeStyles.text}`}>Отчет нейросети</span>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10">
                  {aiResponse ? (
                    <p className={`text-sm sm:text-base leading-relaxed font-medium whitespace-pre-wrap ${themeStyles.text} animate-in fade-in duration-700`}>
                      {aiResponse}
                    </p>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-40 py-10">
                      <Bot size={56} strokeWidth={1} className="mb-5 text-indigo-500" />
                      <p className={`text-sm font-medium max-w-md ${themeStyles.text}`}>Задайте вопрос слева, и я проанализирую все ваши карточки, воронку и касания, чтобы найти скрытую прибыль.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className={`p-8 sm:p-12 rounded-[2.5rem] border shadow-sm relative overflow-hidden flex flex-col justify-center min-h-[280px] shrink-0 ${themeStyles.panelBorder} ${themeStyles.panel}`}>
          <div className={`absolute top-1/2 -translate-y-1/2 -right-12 sm:right-0 p-6 opacity-[0.02] ${themeStyles.accentText} pointer-events-none`}>
            <Target size={280} strokeWidth={1} />
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 relative z-10 w-full mb-10">
            <div>
              <h3 className={`text-2xl sm:text-3xl font-black flex items-center gap-3 tracking-tight ${themeStyles.text}`}>
                <Flag size={28} className="text-emerald-500" /> Прогресс выручки
              </h3>
              <p className={`text-sm sm:text-base mt-2 font-medium opacity-60 ${themeStyles.text}`}>Сумма по всем успешно закрытым сделкам</p>
            </div>

            <div className="flex flex-col sm:items-end gap-2 w-full sm:w-auto">
              <span className={`text-[10px] font-black uppercase tracking-widest opacity-40 ${themeStyles.text}`}>Установленная цель (₽)</span>
              <input
                type="number"
                value={revenueGoal}
                onChange={(e) => setRevenueGoal(Number(e.target.value))}
                className={`w-full sm:w-56 px-6 py-4 text-xl font-black rounded-2xl border outline-none transition-all shadow-inner text-right ${themeStyles.input} ${themeStyles.text} focus:border-emerald-500/50`}
              />
            </div>
          </div>

          <div className="relative z-10 w-full mt-auto">
            <div className="flex items-end justify-between mb-5 px-2">
              <span className="text-5xl sm:text-7xl font-black text-emerald-500 tracking-tighter drop-shadow-sm">{formatMoney(metrics.totalRevenue)}</span>
              <div className="text-right">
                <span className={`text-3xl sm:text-5xl font-black tracking-tight ${themeStyles.text}`}>{goalProgress}%</span>
              </div>
            </div>
            <div className="w-full h-6 sm:h-8 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden p-1.5 shadow-inner backdrop-blur-sm border border-black/5 dark:border-white/5">
              <div
                style={{ width: `${goalProgress}%` }}
                className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all duration-1000 ease-out shadow-sm relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white/30 to-transparent" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 shrink-0">
          {[
            { label: 'Потенциал в работе', val: formatMoney(metrics.totalActiveAmount), color: 'text-indigo-500', bgGlow: 'bg-indigo-500', Icon: Zap },
            { label: 'Средний чек', val: formatMoney(metrics.avgCheck), color: themeStyles.text, bgGlow: 'bg-slate-500', Icon: CreditCard },
            { label: 'Успешность (Win Rate)', val: metrics.winRate + '%', color: 'text-emerald-500', bgGlow: 'bg-emerald-500', Icon: Activity },
          ].map((m, i) => (
            <div key={i} className={`p-8 sm:p-10 rounded-[2.5rem] border ${themeStyles.panelBorder} ${themeStyles.panel} shadow-sm group transition-all duration-500 hover:-translate-y-2 hover:shadow-xl relative overflow-hidden cursor-default`}>
              <div className={`absolute -right-8 -top-8 w-40 h-40 rounded-full ${m.bgGlow} opacity-[0.03] group-hover:opacity-10 blur-3xl group-hover:scale-150 transition-all duration-700 pointer-events-none`} />
              <div className="flex justify-between items-start mb-8 relative z-10">
                <p className={`text-[11px] sm:text-xs font-black uppercase tracking-widest opacity-50 ${themeStyles.text}`}>{m.label}</p>
                <div className={`p-3 rounded-2xl bg-black/5 dark:bg-white/5 ${m.color} group-hover:scale-110 transition-transform duration-300`}>
                  <m.Icon size={22} strokeWidth={2} />
                </div>
              </div>
              <h3 className={`text-4xl sm:text-5xl font-black tracking-tighter relative z-10 ${m.color}`}>{m.val}</h3>
            </div>
          ))}
        </div>

        <div className={`rounded-[2.5rem] border shadow-sm overflow-hidden transition-all duration-500 shrink-0 ${themeStyles.panelBorder} ${themeStyles.panel}`}>
          <button onClick={() => setIsDynamicsOpen(!isDynamicsOpen)} className="w-full p-6 sm:p-10 flex items-center justify-between group outline-none">
            <div className="flex items-center gap-5 text-left">
              <div className={`w-16 h-16 rounded-[1.25rem] flex items-center justify-center shadow-inner ${theme === 'dark' ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600'} group-hover:scale-105 transition-transform duration-500`}>
                <BarChart2 size={32} strokeWidth={1.5} />
              </div>
              <div>
                <h3 className={`text-xl sm:text-2xl font-black tracking-tight ${themeStyles.text}`}>Матрица потенциала</h3>
                <p className={`text-sm mt-1 font-medium ${themeStyles.textMuted}`}>Визуализация воронки и плотность работы с клиентами.</p>
              </div>
            </div>
            <div className={`p-3 rounded-full border transition-all duration-500 ${isDynamicsOpen ? 'bg-blue-500/10 border-blue-500/30 text-blue-500 rotate-180' : `${themeStyles.panelBorder} opacity-50 group-hover:opacity-100`}`}>
              <ChevronDown size={20} />
            </div>
          </button>

          {isDynamicsOpen && (
            <div className="p-6 sm:p-10 pt-0 animate-in slide-in-from-top-4 fade-in duration-500 border-t border-black/5 dark:border-white/5 mt-2">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-10 sm:gap-12 mt-8">
                <div className="flex flex-col bg-black/[0.01] dark:bg-white/[0.01] p-6 sm:p-8 rounded-[2rem] border border-black/5 dark:border-white/5">
                  <h4 className={`text-[10px] font-black uppercase tracking-widest opacity-50 mb-10 flex items-center gap-2 ${themeStyles.text}`}>
                    <PieChart size={14} /> Объем средств по этапам
                  </h4>
                  <div className="flex items-end justify-between gap-2 sm:gap-4 h-72 sm:h-80 pb-2 border-b-2 border-black/5 dark:border-white/5 mt-auto relative">
                    {stageStats.filter(s => s.key !== 'won').map((s, i) => {
                      const maxVal = Math.max(...stageStats.filter(x => x.key !== 'won').map(x => x.sum)) || 1;
                      const height = Math.max((s.sum / maxVal) * 100, 8);
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center justify-end group relative h-full">
                          <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-xs font-black px-4 py-2 rounded-xl shadow-xl z-20 transform translate-y-2 group-hover:translate-y-0 pointer-events-none whitespace-nowrap">
                            {formatMoney(s.sum)}
                          </div>
                          <div
                            style={{ height: `${height}%` }}
                            className={`w-full max-w-[64px] rounded-t-2xl ${s.color} opacity-90 group-hover:opacity-100 group-hover:shadow-[0_0_20px_rgba(0,0,0,0.1)] transition-all duration-500 relative overflow-hidden`}
                          >
                            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white/20 to-transparent" />
                          </div>
                          <span className={`text-[10px] font-bold mt-5 text-center truncate w-full opacity-60 group-hover:opacity-100 transition-opacity ${themeStyles.text}`}>{s.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex flex-col bg-black/[0.01] dark:bg-white/[0.01] p-6 sm:p-8 rounded-[2rem] border border-black/5 dark:border-white/5">
                  <h4 className={`text-[10px] font-black uppercase tracking-widest opacity-50 mb-6 flex items-center gap-2 ${themeStyles.text}`}>
                    <Flame size={14} /> Интенсивность касаний (Топ карточек)
                  </h4>
                  <div className="space-y-4 overflow-y-auto h-72 sm:h-80 custom-scrollbar pr-3">
                    {deals.filter(d => d.stage !== 'won').sort((a, b) => (b.touches || 0) - (a.touches || 0)).map((d) => {
                      const isHot = d.touches > 15;
                      const touchColor = isHot ? 'text-orange-500' : d.touches > 5 ? 'text-amber-500' : 'text-slate-400';
                      const bgHover = isHot ? 'hover:border-orange-500/30' : 'hover:border-indigo-500/30';
                      const stg = stages.find(s => s.key === d.stage);

                      return (
                        <div key={d.id} className={`p-5 rounded-2xl border ${themeStyles.panelBorder} ${themeStyles.card} flex items-center justify-between group ${bgHover} transition-all duration-300 shadow-sm hover:shadow-md cursor-default`}>
                          <div className="flex flex-col min-w-0 pr-4">
                            <p className={`text-base font-black truncate tracking-tight ${themeStyles.text}`}>{d.company}</p>
                            <div className="flex items-center gap-2 mt-2 opacity-60 group-hover:opacity-100 transition-opacity">
                              <span className={`w-2.5 h-2.5 rounded-full shrink-0 shadow-sm ${stg?.color}`} />
                              <span className={`text-xs font-bold truncate ${themeStyles.text}`}>{stg?.title}</span>
                            </div>
                          </div>
                          <div className="text-right shrink-0 flex flex-col items-end">
                            <div className={`flex items-center gap-1.5 text-base font-black ${touchColor}`}>
                              {isHot && <Flame size={16} className="animate-pulse" />}
                              {d.touches || 0} <span className="text-[10px] uppercase tracking-widest opacity-50 font-bold">касаний</span>
                            </div>
                            <p className={`text-sm font-bold mt-1.5 opacity-80 ${themeStyles.text}`}>{formatMoney(d.amount)}</p>
                          </div>
                        </div>
                      );
                    })}
                    {deals.filter(d => d.stage !== 'won').length === 0 && (
                      <div className="h-full flex items-center justify-center">
                        <p className={`text-sm font-bold opacity-40 ${themeStyles.text}`}>Нет активных сделок для анализа</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 5. КОМПОНЕНТЫ КАЛЕНДАРЯ
// ==========================================

const CalendarView = ({ deals, themeStyles, theme, onOpenDeal }) => {
  const [viewDate, setViewDate] = useState(new Date());

  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [syncSettings, setSyncSettings] = useState({ googleTwoWay: false, yandexTwoWay: false });
  const [connections, setConnections] = useState({ google: false, yandex: false });

  const [showYandexModal, setShowYandexModal] = useState(false);
  const [yandexCreds, setYandexCreds] = useState({ email: '', appPassword: '' });

  const [isSyncing, setIsSyncing] = useState(false);
  const [icsToken] = useState('abqd_cal_8f9x2k1l');

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDay = new Date(year, month, 1).getDay();
  const startOffset = startDay === 0 ? 6 : startDay - 1;

  const handleGoogleConnect = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setConnections(prev => ({ ...prev, google: !prev.google }));
      setIsSyncing(false);
      if (!connections.google) {
        alert("✅ Google Calendar успешно подключен через OAuth.");
      }
    }, 1500);
  };

  const handleYandexConnectSubmit = () => {
    if (!yandexCreds.email || !yandexCreds.appPassword) {
      alert("Пожалуйста, введите Email и Пароль приложения.");
      return;
    }
    setIsSyncing(true);
    setTimeout(() => {
      setConnections(prev => ({ ...prev, yandex: true }));
      setShowYandexModal(false);
      setIsSyncing(false);
      alert("✅ Yandex Calendar успешно подключен по протоколу CalDAV.");
    }, 1500);
  };

  const handleYandexDisconnect = () => {
    setConnections(prev => ({ ...prev, yandex: false }));
    setYandexCreds({ email: '', appPassword: '' });
  };

  const copyIcsLink = () => {
    navigator.clipboard.writeText(`https://api.abqd.ru/api/v1/calendar/${icsToken}.ics`);
    alert("Ссылка на ICS-календарь скопирована!\n\nВы можете добавить её в Google Calendar ('Добавить по URL') или Яндекс.Календарь для просмотра событий ABQD в режиме 'Только чтение'.");
  };

  const monthLeads = useMemo(() => {
    return deals.filter(d => d.nextTaskAt && new Date(d.nextTaskAt).getMonth() === month && new Date(d.nextTaskAt).getFullYear() === year);
  }, [deals, month, year]);

  const externalEvents = useMemo(() => {
    const evs = [];
    if (connections.google) {
      evs.push({ id: 'g1', title: 'Google: Презентация', day: 10, type: 'google' });
      evs.push({ id: 'g2', title: 'Google: Планерка', day: 22, type: 'google' });
    }
    if (connections.yandex) {
      evs.push({ id: 'y1', title: 'Yandex: Встреча', day: 14, type: 'yandex' });
      evs.push({ id: 'y2', title: 'Yandex: Обед с партнером', day: 26, type: 'yandex' });
    }
    return evs;
  }, [connections]);

  const cells = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="flex flex-col h-full p-4 pb-32 sm:p-8 overflow-hidden gap-6 relative">
      <div className={`p-4 sm:p-6 rounded-[2rem] border ${themeStyles.panelBorder} ${themeStyles.panel} flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-md relative z-10`}>
        <div className="flex items-center gap-4">
          <h2 className={`text-xl sm:text-2xl font-black tracking-tight ${themeStyles.text}`}>{MONTHS[month]} <span className="opacity-40">{year}</span></h2>
          <div className="flex border rounded-xl border-slate-200 dark:border-white/10 overflow-hidden shadow-sm">
            <button onClick={() => setViewDate(new Date(year, month - 1))} className="p-2 sm:p-2.5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"><ChevronLeft size={16} /></button>
            <button onClick={() => setViewDate(new Date())} className="px-3 text-[10px] sm:text-xs font-bold border-x border-slate-200 dark:border-white/10 hover:text-indigo-500 transition-colors">СЕГОДНЯ</button>
            <button onClick={() => setViewDate(new Date(year, month + 1))} className="p-2 sm:p-2.5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"><ChevronRight size={16} /></button>
          </div>
        </div>

        <button
          onClick={() => setIsSyncModalOpen(true)}
          className={`w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 sm:py-2.5 text-xs font-bold rounded-xl transition-all shadow-sm border ${themeStyles.panelBorder} ${themeStyles.text} hover:scale-[1.02] bg-white dark:bg-[#222226]`}
        >
          <Cloud size={16} className="text-indigo-500" /> <span>Настройки синхронизации</span>
          {(connections.google || connections.yandex) && <div className="w-2 h-2 rounded-full bg-emerald-500 ml-1 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>}
        </button>
      </div>

      <div className={`flex-1 rounded-[2rem] border overflow-hidden flex flex-col ${themeStyles.panelBorder} ${themeStyles.panel} shadow-lg z-0`}>
        <div className="grid grid-cols-7 border-b border-slate-100 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.02]">
          {DAYS_OF_WEEK.map(d => <div key={d} className="py-4 text-center text-[10px] font-black uppercase tracking-widest text-slate-400">{d}</div>)}
        </div>
        <div className="grid grid-cols-7 flex-1 overflow-y-auto custom-scrollbar">
          {cells.map((d, i) => {
            const isToday = d === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();
            const dayDeals = monthLeads.filter(l => new Date(l.nextTaskAt).getDate() === d);
            const dayExtEvents = externalEvents.filter(e => e.day === d);

            return (
              <div key={i} className={`min-h-[120px] border-r border-b border-slate-100 dark:border-white/5 p-2 sm:p-3 flex flex-col gap-1.5 transition-colors ${themeStyles.calendarCellHover} ${!d ? 'opacity-5' : ''}`}>
                {d && <span className={`w-7 h-7 flex items-center justify-center rounded-xl text-xs font-black mb-1 ${isToday ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30' : themeStyles.textMuted}`}>{d}</span>}

                {dayDeals.map(deal => (
                  <div key={deal.id} onClick={() => onOpenDeal(deal.id)} className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-[9px] font-bold truncate text-indigo-500 cursor-pointer hover:bg-indigo-500/20 transition-colors">
                    {deal.company}
                  </div>
                ))}

                {dayExtEvents.map(ev => (
                  <div key={ev.id} className={`p-1.5 rounded-lg text-[9px] font-bold truncate cursor-default flex items-center gap-1.5 shadow-sm border ${ev.type === 'google' ? (theme === 'dark' ? 'bg-[#3b82f6]/10 text-[#3b82f6] border-[#3b82f6]/20' : 'bg-blue-50 text-blue-600 border-blue-200') : (theme === 'dark' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-amber-50 text-amber-600 border-amber-200')}`}>
                    {ev.type === 'google'
                      ? <img src="https://www.google.com/favicon.ico" className="w-2.5 h-2.5 grayscale opacity-70" alt="G" />
                      : <img src="https://yandex.ru/favicon.ico" className="w-2.5 h-2.5 grayscale opacity-70" alt="Y" />}
                    {ev.title}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {isSyncModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/50 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="absolute inset-0 cursor-pointer" onClick={() => !showYandexModal && setIsSyncModalOpen(false)} />

          <div className={`relative w-full max-w-2xl rounded-[2.5rem] flex flex-col ${themeStyles.panel} ${themeStyles.panelBorder} shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-hidden`}>
            <div className="p-6 sm:p-8 border-b border-black/5 dark:border-white/[0.06] flex justify-between items-center bg-white/60 dark:bg-[#222226]/80">
              <div>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight">Интеграция с календарями</h2>
                <p className={`text-sm mt-1 font-medium ${themeStyles.textMuted}`}>ABQD является основным источником данных (Source of Truth).</p>
              </div>
              <button onClick={() => setIsSyncModalOpen(false)} className="p-2 sm:p-3 rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors shrink-0"><X size={20} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8 custom-scrollbar">
              <div className={`p-6 rounded-[2rem] border ${themeStyles.panelBorder} ${theme === 'dark' ? 'bg-white/[0.02]' : 'bg-slate-50'}`}>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
                    <Globe size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-black flex items-center gap-2">Подписка по ссылке (ICS) <Badge className="bg-indigo-500/10 text-indigo-500 border-indigo-500/20">Самый надежный</Badge></h3>
                    <p className={`text-sm mt-1.5 font-medium ${themeStyles.textMuted}`}>Добавьте эту ссылку в любой календарь на телефоне или ПК. События будут зеркалироваться в режиме "Только чтение".</p>

                    <div className="mt-4 flex flex-col sm:flex-row items-center gap-2 bg-white dark:bg-[#18181b] p-2 rounded-xl border border-indigo-500/30">
                      <input readOnly value={`https://api.abqd.ru/api/v1/calendar/${icsToken}.ics`} className="bg-transparent outline-none text-xs font-mono text-indigo-500 w-full px-3 py-2" />
                      <button onClick={copyIcsLink} className="w-full sm:w-auto px-4 py-2 rounded-lg bg-indigo-500 text-white font-bold text-xs hover:bg-indigo-600 transition-colors shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2 shrink-0">
                        <Copy size={14} /> Скопировать
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-black uppercase tracking-widest opacity-40 mb-4 px-2">Прямое подключение (Опционально)</h3>

                <div className="space-y-4">
                  <div className={`p-5 rounded-2xl border ${themeStyles.panelBorder} ${theme === 'dark' ? 'bg-[#18181b]' : 'bg-white'} flex flex-col sm:flex-row items-center justify-between gap-4 transition-colors ${connections.google && 'border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.1)]'}`}>
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      <img src="https://www.google.com/favicon.ico" alt="G" className="w-8 h-8" />
                      <div>
                        <h4 className="font-bold text-sm">Google Calendar</h4>
                        <p className={`text-xs mt-0.5 ${themeStyles.textMuted}`}>Авторизация через OAuth 2.0</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                      {connections.google && (
                        <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                          <input
                            type="checkbox"
                            checked={syncSettings.googleTwoWay}
                            onChange={(e) => setSyncSettings({ ...syncSettings, googleTwoWay: e.target.checked })}
                            className="w-4 h-4 rounded text-blue-500 accent-blue-500"
                          />
                          2-Way Sync (Beta)
                        </label>
                      )}
                      <button
                        onClick={handleGoogleConnect}
                        disabled={isSyncing}
                        className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${connections.google ? 'bg-rose-500/10 text-rose-500 hover:bg-rose-500/20' : 'bg-blue-500 text-white shadow-md shadow-blue-500/20 hover:bg-blue-600'}`}
                      >
                        {isSyncing ? <RefreshCw size={14} className="animate-spin" /> : (connections.google ? 'Отключить' : 'Подключить Google')}
                      </button>
                    </div>
                  </div>

                  <div className={`p-5 rounded-2xl border ${themeStyles.panelBorder} ${theme === 'dark' ? 'bg-[#18181b]' : 'bg-white'} flex flex-col sm:flex-row items-center justify-between gap-4 transition-colors ${connections.yandex && 'border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.1)]'}`}>
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      <img src="https://yandex.ru/favicon.ico" alt="Y" className="w-8 h-8" />
                      <div>
                        <h4 className="font-bold text-sm">Яндекс.Календарь</h4>
                        <p className={`text-xs mt-0.5 ${themeStyles.textMuted}`}>Подключение по протоколу CalDAV</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                      {connections.yandex && (
                        <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                          <input
                            type="checkbox"
                            checked={syncSettings.yandexTwoWay}
                            onChange={(e) => setSyncSettings({ ...syncSettings, yandexTwoWay: e.target.checked })}
                            className="w-4 h-4 rounded text-amber-500 accent-amber-500"
                          />
                          2-Way Sync (Beta)
                        </label>
                      )}
                      <button
                        onClick={() => connections.yandex ? handleYandexDisconnect() : setShowYandexModal(true)}
                        disabled={isSyncing}
                        className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${connections.yandex ? 'bg-rose-500/10 text-rose-500 hover:bg-rose-500/20' : 'bg-amber-500 text-white shadow-md shadow-amber-500/20 hover:bg-amber-600'}`}
                      >
                        {connections.yandex ? 'Отключить' : 'Настроить CalDAV'}
                      </button>
                    </div>
                  </div>
                </div>

                <div className={`mt-5 p-4 rounded-xl flex items-start gap-3 bg-amber-500/5 border border-amber-500/20 text-amber-600 dark:text-amber-500`}>
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                  <p className="text-xs font-medium leading-relaxed">
                    Двусторонняя синхронизация (Two-way sync) работает в режиме Beta. Если событие изменено одновременно в ABQD и внешнем календаре, применяется правило <span className="font-bold">Last Write Wins</span> (побеждает последнее изменение).
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showYandexModal && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className={`relative w-full max-w-sm rounded-[2rem] p-8 flex flex-col ${themeStyles.panel} ${themeStyles.panelBorder} shadow-2xl animate-in zoom-in-95`}>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <img src="https://yandex.ru/favicon.ico" alt="Y" className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black">Доступ CalDAV</h3>
                <p className={`text-xs mt-1 ${themeStyles.textMuted}`}>Для Яндекс.Календаря</p>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="space-y-1.5">
                <label className={`text-[10px] font-black uppercase tracking-widest opacity-60 ${themeStyles.text} flex items-center gap-1.5`}><Mail size={12} /> Email Яндекс</label>
                <input type="email" placeholder="ваша-почта@yandex.ru" value={yandexCreds.email} onChange={e => setYandexCreds({ ...yandexCreds, email: e.target.value })} className={`w-full p-4 rounded-2xl border outline-none font-medium text-sm transition-all ${themeStyles.input} ${themeStyles.text}`} />
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className={`text-[10px] font-black uppercase tracking-widest opacity-60 ${themeStyles.text} flex items-center gap-1.5`}><KeyRound size={12} /> Пароль приложения</label>
                  <a href="https://id.yandex.ru/security/app-passwords" target="_blank" rel="noreferrer" className="text-[10px] font-bold text-amber-500 hover:underline flex items-center gap-1"><Info size={10} /> Как получить?</a>
                </div>
                <input type="password" placeholder="••••••••" value={yandexCreds.appPassword} onChange={e => setYandexCreds({ ...yandexCreds, appPassword: e.target.value })} className={`w-full p-4 rounded-2xl border outline-none font-medium text-sm transition-all ${themeStyles.input} ${themeStyles.text}`} />
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setShowYandexModal(false)} className={`flex-1 py-3.5 rounded-xl font-bold text-sm border ${themeStyles.panelBorder} hover:bg-black/5 dark:hover:bg-white/5 transition-colors`}>Отмена</button>
              <button onClick={handleYandexConnectSubmit} disabled={isSyncing} className={`flex-1 py-3.5 rounded-xl font-bold text-sm bg-amber-500 text-white shadow-md hover:bg-amber-600 transition-colors flex items-center justify-center`}>
                {isSyncing ? <RefreshCw size={16} className="animate-spin" /> : 'Подключить'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// 6. ГЛАВНЫЙ КОМПОНЕНТ APP
// ==========================================

export default function App() {
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.theme) || 'dark';
    } catch {
      return 'dark';
    }
  });

  const [currentView, setCurrentView] = useState('kanban');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const [deals, setDeals] = useState(() => safeReadJSON(STORAGE_KEYS.deals, INITIAL_DEALS));
  const [stages, setStages] = useState(() => safeReadJSON(STORAGE_KEYS.stages, INITIAL_STAGES));
  const [flows, setFlows] = useState(() => safeReadJSON(STORAGE_KEYS.flows, INITIAL_FLOWS));

  const [selectedId, setSelectedId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);

  const [draggedStageIdx, setDraggedStageIdx] = useState(null);
  const [dragOverStageIdx, setDragOverStageIdx] = useState(null);
  const [draggedDealId, setDraggedDealId] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.theme, theme);
    } catch {
      // ignore
    }
  }, [theme]);

  useEffect(() => {
    safeWriteJSON(STORAGE_KEYS.deals, deals);
  }, [deals]);

  useEffect(() => {
    safeWriteJSON(STORAGE_KEYS.stages, stages);
  }, [stages]);

  useEffect(() => {
    safeWriteJSON(STORAGE_KEYS.flows, flows);
  }, [flows]);

  const themeStyles = useMemo(() => getThemeStyles(theme), [theme]);

  const handleSaveDeal = useCallback((updatedDeal) => {
    setIsSyncing(true);
    setDeals(prev => prev.map(d => d.id === updatedDeal.id ? updatedDeal : d));
    setTimeout(() => setIsSyncing(false), 400);
  }, []);

  const handleDeleteDeal = (dealId) => {
    if (window.confirm("Вы уверены, что хотите удалить эту сделку? Это действие нельзя отменить.")) {
      setDeals(prev => prev.filter(d => d.id !== dealId));
      setSelectedId(null);
    }
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverStageIdx !== index) setDragOverStageIdx(index);
  };

  const handleDrop = (e, dropIndex, stageKey) => {
    e.preventDefault();
    const dealId = e.dataTransfer.getData('dealId');
    const stageIndexText = e.dataTransfer.getData('stageIndex');

    if (dealId) {
      setDeals(prev => prev.map(d => d.id === dealId ? { ...d, stage: stageKey } : d));
      setIsSyncing(true);
      setTimeout(() => setIsSyncing(false), 400);
    } else if (stageIndexText) {
      const dragIndex = parseInt(stageIndexText, 10);
      if (dragIndex !== dropIndex) {
        const newStages = [...stages];
        const [draggedItem] = newStages.splice(dragIndex, 1);
        newStages.splice(dropIndex, 0, draggedItem);
        setStages(newStages);
      }
    }

    setDragOverStageIdx(null);
    setDraggedStageIdx(null);
    setDraggedDealId(null);
  };

  const handleStageDragStart = (e, index) => {
    setDraggedStageIdx(index);
    e.dataTransfer.setData('stageIndex', index.toString());
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleAddStage = () => {
    const title = window.prompt("Введите название новой колонки:", "Новый этап");
    if (title) {
      const newKey = "stage_" + Date.now();
      const colors = ["bg-pink-400", "bg-cyan-400", "bg-lime-400", "bg-fuchsia-400", "bg-sky-400", "bg-orange-400"];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      setStages(prev => [...prev, { key: newKey, title, color: randomColor }]);
    }
  };

  const handleDeleteStage = (keyToRemove) => {
    if (keyToRemove === 'inbox') {
      alert('Нельзя удалить базовую колонку "Входящие"');
      return;
    }
    if (window.confirm("Вы уверены, что хотите удалить колонку? Все сделки из неё будут безопасно перемещены во 'Входящие'.")) {
      setStages(prev => prev.filter(s => s.key !== keyToRemove));
      setDeals(prev => prev.map(d => d.stage === keyToRemove ? { ...d, stage: 'inbox' } : d));
    }
  };

  const filteredDeals = useMemo(() => {
    return deals.filter(d => d.company.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [deals, searchQuery]);

  const selectedDeal = deals.find(d => d.id === selectedId);

  return (
    <div className={`flex h-screen w-full font-sans transition-colors duration-500 relative overflow-hidden ${themeStyles.bg} ${themeStyles.text}`}>
      <aside className={`hidden sm:flex relative border-r p-5 transition-all duration-300 z-40 ${isSidebarCollapsed ? 'w-24' : 'w-72'} ${themeStyles.sidebar} ${themeStyles.panelBorder}`}>
        <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className={`absolute -right-3.5 top-12 w-7 h-7 rounded-full border flex items-center justify-center shadow-sm transition-all hover:scale-110 z-50 ${themeStyles.panel} ${themeStyles.panelBorder} ${themeStyles.textMuted} hover:text-indigo-500 dark:hover:text-indigo-400`}>
          {isSidebarCollapsed ? <PanelLeftOpen size={14} /> : <PanelLeftClose size={14} />}
        </button>

        <div className="space-y-2 flex-1 mt-14 overflow-y-auto custom-scrollbar pr-2 pb-4">
          {[
            { id: 'kanban', label: 'Доска', Icon: LayoutDashboard },
            { id: 'calendar', label: 'Календарь', Icon: CalendarDays },
            { id: 'analytics', label: 'Аналитика', Icon: BarChart3 },
            { id: 'botflows', label: 'Сценарии', Icon: MessageSquare },
          ].map(item => (
            <button key={item.id} onClick={() => setCurrentView(item.id)} className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 ${currentView === item.id ? `${themeStyles.accentGradient} text-white shadow-xl shadow-indigo-500/20` : `hover:bg-black/5 dark:hover:bg-white/5 ${themeStyles.textMuted} hover:text-current`}`}>
              <item.Icon size={20} /> {!isSidebarCollapsed && <span className="text-sm font-bold tracking-wide">{item.label}</span>}
            </button>
          ))}
        </div>
      </aside>

      <nav className="sm:hidden fixed bottom-6 left-4 right-4 h-16 rounded-[2rem] z-50 flex items-center justify-around px-2 shadow-[0_10px_40px_rgba(0,0,0,0.2)] border border-white/10 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl transition-all">
        {[
          { id: 'kanban', label: 'Доска', Icon: LayoutDashboard },
          { id: 'calendar', label: 'График', Icon: CalendarDays },
          { id: 'botflows', label: 'Боты', Icon: MessageSquare },
          { id: 'analytics', label: 'Итоги', Icon: BarChart3 },
        ].map(item => (
          <button key={item.id} onClick={() => setCurrentView(item.id)} className={`flex flex-col items-center justify-center w-16 h-12 rounded-xl transition-all ${currentView === item.id ? 'bg-indigo-500/10 text-indigo-500' : themeStyles.textMuted}`}>
            <item.Icon size={20} className={currentView === item.id ? 'mb-0.5' : 'opacity-70'} />
            {currentView === item.id && <span className="text-[9px] font-black">{item.label}</span>}
          </button>
        ))}
      </nav>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {(currentView === 'kanban' || currentView === 'calendar') && (
          <header className={`h-20 shrink-0 border-b flex items-center justify-between px-6 sm:px-8 z-10 ${themeStyles.panel} ${themeStyles.panelBorder}`}>
            <div className="flex items-center gap-4 flex-1 max-w-2xl">
              <div className="relative w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" />
                <input type="text" placeholder="Поиск сделок..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className={`w-full h-11 pl-12 pr-4 rounded-2xl text-sm font-medium border outline-none transition-all ${themeStyles.input} ${themeStyles.text} focus:shadow-sm focus:border-indigo-500/50`} />
              </div>
            </div>
            <div className="flex items-center gap-4 ml-6">
              {isSyncing && <Cloud size={16} className="text-indigo-400 animate-pulse hidden sm:block" />}
              <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className={`p-2.5 rounded-xl border ${themeStyles.panelBorder} ${themeStyles.panel} shadow-sm hover:scale-105 transition-transform`}>
                {theme === 'dark' ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-indigo-500" />}
              </button>
            </div>
          </header>
        )}

        {currentView === 'kanban' && (
          <div className="flex-1 overflow-x-auto flex px-4 py-6 pb-32 sm:p-8 gap-4 sm:gap-6 custom-scrollbar snap-x snap-mandatory sm:snap-none">
            {stages.map((stage, index) => (
              <div
                key={stage.key}
                draggable
                onDragStart={(e) => handleStageDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragLeave={() => setDragOverStageIdx(null)}
                onDrop={(e) => handleDrop(e, index, stage.key)}
                onDragEnd={() => { setDraggedStageIdx(null); setDragOverStageIdx(null); setDraggedDealId(null); }}
                className={`flex-none w-[85vw] max-w-[320px] sm:w-[320px] flex flex-col gap-5 snap-center sm:snap-align-none transition-all duration-300 ${draggedStageIdx === index ? 'opacity-40 scale-95' : 'opacity-100'} ${dragOverStageIdx === index && draggedStageIdx !== index ? 'bg-indigo-500/5 rounded-[2rem] outline outline-2 outline-indigo-500/50 outline-dashed scale-[1.02]' : ''}`}
              >
                <div className="flex items-center justify-between px-2 cursor-grab active:cursor-grabbing group">
                  <div className="flex items-center gap-3 pointer-events-none">
                    <GripHorizontal size={14} className="opacity-30 group-hover:opacity-100 transition-opacity" />
                    <div className={`w-2.5 h-2.5 rounded-full ${stage.color} shadow-sm`} />
                    <h4 className="text-xs font-black uppercase tracking-[0.15em] opacity-70 truncate max-w-[120px]">{stage.title}</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-black px-2 py-1 rounded-lg bg-black/5 dark:bg-white/5 ${themeStyles.textMuted}`}>{filteredDeals.filter(d => d.stage === stage.key).length}</span>
                    <button onClick={(e) => { e.stopPropagation(); handleDeleteStage(stage.key); }} className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-rose-500 hover:bg-rose-500/10 rounded-lg cursor-pointer" title="Удалить колонку">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto space-y-4 px-1 custom-scrollbar pb-4">
                  {filteredDeals.filter(d => d.stage === stage.key).map(deal => (
                    <div
                      key={deal.id}
                      draggable
                      onDragStart={(e) => {
                        e.stopPropagation();
                        setDraggedDealId(deal.id);
                        e.dataTransfer.setData('dealId', deal.id);
                        e.dataTransfer.effectAllowed = 'move';
                      }}
                      onDragEnd={(e) => {
                        e.stopPropagation();
                        setDraggedDealId(null);
                        setDragOverStageIdx(null);
                      }}
                      onClick={() => setSelectedId(deal.id)}
                      className={`p-5 rounded-2xl border cursor-pointer transition-all duration-300 ${themeStyles.card} ${themeStyles.panelBorder} hover:-translate-y-1 hover:shadow-xl ${draggedDealId === deal.id ? 'opacity-40 scale-95' : 'opacity-100'}`}
                    >
                      <div className="flex justify-between items-start mb-1.5 pointer-events-none">
                        <h4 className="font-black text-sm truncate pr-2 tracking-tight">{deal.company}</h4>
                        {deal.priority === 'high' && <div className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)] animate-pulse shrink-0 mt-1" title="Высокий приоритет" />}
                      </div>
                      <div className="flex justify-between items-center mb-4 pointer-events-none">
                        <span className="text-[10px] font-medium opacity-50 truncate w-32">{deal.nextStep || deal.contact}</span>
                        <span className={`text-sm font-black tracking-tighter ${themeStyles.accentText}`}>{formatMoney(deal.amount)}</span>
                      </div>
                      <div className="flex items-center justify-between border-t border-black/5 dark:border-white/5 pt-3 pointer-events-none">
                        <Badge className={getScoreInfo(deal.score).color}>{deal.score}</Badge>
                        {deal.nextTaskAt && (
                          <div className={`text-[9px] font-bold flex items-center gap-1 ${getDueStatus(deal.nextTaskAt) === 'expired' ? 'text-rose-500' : 'text-emerald-500'}`}>
                            <Clock size={10} /> {deal.nextTaskAt.slice(5)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={() => {
                      const id = `D-${Math.floor(Math.random() * 9000)}`;
                      setDeals([...deals, {
                        id,
                        company: "Новая сделка",
                        contact: "-",
                        stage: stage.key,
                        amount: 0,
                        score: 50,
                        source: "Неизвестно",
                        address: "",
                        description: "",
                        nextTaskAt: getTodayDateStr(),
                        touches: 0
                      }]);
                      setSelectedId(id);
                    }}
                    className={`w-full py-4 rounded-2xl border-2 border-dashed border-black/10 dark:border-white/10 opacity-40 hover:opacity-100 hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all text-[11px] font-black uppercase tracking-widest ${themeStyles.textMuted}`}
                  >
                    + Добавить
                  </button>
                </div>
              </div>
            ))}

            <div
              onClick={handleAddStage}
              className="flex-none w-[85vw] max-w-[320px] sm:w-[320px] flex flex-col items-center justify-center gap-3 border-2 border-dashed border-black/10 dark:border-white/10 rounded-[2.5rem] opacity-50 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5 hover:border-indigo-500/30 transition-all cursor-pointer h-full max-h-[80vh] min-h-[400px]"
            >
              <div className="w-14 h-14 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                <Plus size={28} />
              </div>
              <span className={`text-sm font-black ${themeStyles.text}`}>Добавить колонку</span>
            </div>
          </div>
        )}

        {currentView === 'analytics' && <AnalyticsView deals={deals} themeStyles={themeStyles} theme={theme} setTheme={setTheme} stages={stages} />}
        {currentView === 'calendar' && <CalendarView deals={deals} themeStyles={themeStyles} theme={theme} onOpenDeal={setSelectedId} />}
        {currentView === 'botflows' && <BotFlowsView flows={flows} setFlows={setFlows} themeStyles={themeStyles} theme={theme} />}
      </main>

      {selectedId && selectedDeal && (
        <div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center p-0 sm:p-6 bg-black/40 dark:bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="absolute inset-0 hidden sm:block cursor-pointer" onClick={() => setSelectedId(null)} />

          <div className={`relative w-full max-w-4xl h-[95dvh] sm:h-auto sm:max-h-[90vh] rounded-t-[2rem] sm:rounded-[2.5rem] flex flex-col ${themeStyles.panel} ${themeStyles.panelBorder} shadow-2xl animate-in slide-in-from-bottom-8 sm:zoom-in-95 duration-300`}>
            <div className="sm:hidden absolute top-0 left-0 w-full flex justify-center pt-3 z-30 pointer-events-none">
              <div className="w-12 h-1.5 rounded-full bg-black/10 dark:bg-white/10" />
            </div>

            <div className="sticky top-0 z-20 pt-8 pb-5 px-5 sm:p-8 border-b border-black/5 dark:border-white/[0.06] flex justify-between items-center backdrop-blur-2xl bg-white/60 dark:bg-[#222226]/80 rounded-t-[2rem] sm:rounded-t-[2.5rem]">
              <div className="flex items-center gap-4 sm:gap-5 min-w-0">
                <div className={`hidden sm:flex w-14 h-14 rounded-2xl items-center justify-center shadow-inner ${selectedDeal.priority === 'high' ? 'bg-rose-500/10 text-rose-500' : selectedDeal.priority === 'medium' ? 'bg-amber-500/10 text-amber-500' : 'bg-slate-500/10 text-slate-500'}`}>
                  <Target size={24} />
                </div>
                <div className="min-w-0">
                  <h2 className="text-xl sm:text-2xl font-black tracking-tight truncate pr-4">{selectedDeal.company}</h2>
                  <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                    <span className="text-[10px] font-black uppercase opacity-40 tracking-widest">ID: {selectedDeal.id}</span>
                    <span className="opacity-20 text-[10px]">•</span>
                    <span className="text-[10px] font-black uppercase text-orange-500 flex items-center gap-1"><Flame size={12} className="mb-0.5" /> {selectedDeal.touches || 0} касаний</span>
                    <button onClick={() => handleDeleteDeal(selectedDeal.id)} className="ml-1 p-1 rounded-md bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 transition-colors flex items-center justify-center" title="Удалить сделку">
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setSelectedId(null)} className="p-2 sm:p-3 rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors shrink-0"><X size={20} /></button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-8 custom-scrollbar">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase opacity-40 px-1 flex items-center gap-1.5 tracking-widest"><Zap size={12} /> Быстрая связь</label>
                <div className="grid grid-cols-3 gap-3">
                  <a href={`https://wa.me/${selectedDeal.phone?.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" onClick={() => handleSaveDeal({ ...selectedDeal, touches: (selectedDeal.touches || 0) + 1 })} className="flex flex-col sm:flex-row items-center justify-center gap-2 py-3 rounded-2xl bg-emerald-500 text-white font-bold text-[10px] sm:text-sm shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:-translate-y-0.5 active:scale-95 transition-all"><MessageCircle size={18} /> <span className="hidden sm:inline">WhatsApp</span></a>
                  <a href={`https://t.me/${selectedDeal.phone?.startsWith('+') ? selectedDeal.phone : '+' + selectedDeal.phone}`} target="_blank" rel="noreferrer" onClick={() => handleSaveDeal({ ...selectedDeal, touches: (selectedDeal.touches || 0) + 1 })} className="flex flex-col sm:flex-row items-center justify-center gap-2 py-3 rounded-2xl bg-sky-500 text-white font-bold text-[10px] sm:text-sm shadow-lg shadow-sky-500/20 hover:shadow-xl hover:-translate-y-0.5 active:scale-95 transition-all"><Send size={18} /> <span className="hidden sm:inline">Telegram</span></a>
                  <a href={`https://max.ru/direct/${selectedDeal.phone}`} target="_blank" rel="noreferrer" onClick={() => handleSaveDeal({ ...selectedDeal, touches: (selectedDeal.touches || 0) + 1 })} className="flex flex-col sm:flex-row items-center justify-center gap-2 py-3 rounded-2xl bg-indigo-600 text-white font-bold text-[10px] sm:text-sm shadow-lg shadow-indigo-600/20 hover:shadow-xl hover:-translate-y-0.5 active:scale-95 transition-all"><Share2 size={18} /> <span className="hidden sm:inline">MAX</span></a>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase opacity-40 px-1 tracking-widest">Название компании</label>
                    <input className={`w-full p-4 rounded-2xl border outline-none transition-all text-sm font-bold ${themeStyles.input} ${themeStyles.text}`} value={selectedDeal.company} onChange={(e) => handleSaveDeal({ ...selectedDeal, company: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase opacity-40 px-1 tracking-widest">Сумма сделки (₽)</label>
                    <input type="number" className={`w-full p-4 rounded-2xl border outline-none transition-all text-sm font-black text-indigo-500 ${themeStyles.input}`} value={selectedDeal.amount} onChange={(e) => handleSaveDeal({ ...selectedDeal, amount: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase opacity-40 px-1 flex items-center gap-1.5 tracking-widest"><Phone size={12} /> Телефон</label>
                    <input className={`w-full p-4 rounded-2xl border outline-none transition-all text-sm font-medium ${themeStyles.input} ${themeStyles.text}`} value={selectedDeal.phone || ""} onChange={(e) => handleSaveDeal({ ...selectedDeal, phone: e.target.value })} placeholder="79000000000" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase opacity-40 px-1 flex items-center gap-1.5 tracking-widest"><Mail size={12} /> Электронная почта</label>
                    <input className={`w-full p-4 rounded-2xl border outline-none transition-all text-sm font-medium ${themeStyles.input} ${themeStyles.text}`} value={selectedDeal.email || ""} onChange={(e) => handleSaveDeal({ ...selectedDeal, email: e.target.value })} placeholder="mail@example.com" />
                  </div>
                </div>

                <div className={`p-6 rounded-3xl border space-y-5 transition-colors duration-300 ${theme === 'dark' ? 'bg-white/[0.02] border-white/[0.05]' : 'bg-indigo-50/40 border-indigo-100/50'}`}>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase opacity-40 px-1 flex items-center gap-1.5 tracking-widest"><Star size={12} /> Приоритет</label>
                    <select className={`w-full p-3.5 rounded-xl border outline-none font-black text-xs transition-all ${themeStyles.input} ${themeStyles.text} [&>option]:bg-white dark:[&>option]:bg-[#222226]`} value={selectedDeal.priority || 'medium'} onChange={(e) => handleSaveDeal({ ...selectedDeal, priority: e.target.value })}>
                      {PRIORITIES.map(p => <option key={p.key} value={p.key} className={p.color}>{p.title}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase opacity-40 px-1 flex items-center gap-1.5 tracking-widest"><Clock size={12} /> Дедлайн</label>
                    <input type="date" className={`w-full p-3.5 rounded-xl border outline-none font-black text-xs transition-all ${themeStyles.input} ${themeStyles.text} dark:[color-scheme:dark]`} value={selectedDeal.nextTaskAt || ""} onChange={(e) => handleSaveDeal({ ...selectedDeal, nextTaskAt: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase opacity-40 px-1 tracking-widest">Этап воронки</label>
                    <select className={`w-full p-3.5 rounded-xl border outline-none font-black text-xs transition-all ${themeStyles.input} ${themeStyles.text} [&>option]:bg-white dark:[&>option]:bg-[#222226]`} value={selectedDeal.stage || "inbox"} onChange={(e) => handleSaveDeal({ ...selectedDeal, stage: e.target.value })}>
                      {stages.map(s => <option key={s.key} value={s.key}>{s.title}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase opacity-40 px-1 flex items-center gap-1.5 tracking-widest"><ArrowUpRight size={12} /> Следующий конкретный шаг</label>
                <input className={`w-full p-4 sm:p-5 rounded-2xl border outline-none transition-all text-sm font-black ${themeStyles.input} text-indigo-500`} value={selectedDeal.nextStep || ""} onChange={(e) => handleSaveDeal({ ...selectedDeal, nextStep: e.target.value })} placeholder="Что нужно сделать дальше?" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-[10px] font-black uppercase opacity-40 flex items-center gap-1.5 tracking-widest"><MapPin size={12} /> Адрес объекта</label>
                    {selectedDeal.address && (
                      <a href={`https://yandex.ru/maps/?text=${encodeURIComponent(selectedDeal.address)}`} target="_blank" rel="noreferrer" className="text-[10px] font-black text-indigo-500 hover:underline flex items-center gap-1"><ExternalLink size={10} /> На карте</a>
                    )}
                  </div>
                  <input className={`w-full p-4 rounded-2xl border outline-none transition-all text-sm font-medium ${themeStyles.input} ${themeStyles.text}`} value={selectedDeal.address || ""} onChange={(e) => handleSaveDeal({ ...selectedDeal, address: e.target.value })} placeholder="Город, улица, дом..." />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase opacity-40 px-1 tracking-widest">Источник трафика</label>
                  <select className={`w-full p-4 rounded-2xl border outline-none transition-all text-sm font-medium ${themeStyles.input} ${themeStyles.text}`} value={selectedDeal.source || "Неизвестно"} onChange={(e) => handleSaveDeal({ ...selectedDeal, source: e.target.value })}>
                    {MARKETING_SOURCES_LIST.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase opacity-40 px-1 tracking-widest">История и заметки</label>
                <textarea rows={5} className={`w-full p-5 rounded-3xl border outline-none resize-none leading-relaxed text-sm font-medium ${themeStyles.input} ${themeStyles.text}`} value={selectedDeal.description || ""} onChange={(e) => handleSaveDeal({ ...selectedDeal, description: e.target.value })} placeholder="Важные нюансы переговоров..." />
              </div>
            </div>

            <div className="sticky bottom-0 z-20 p-5 sm:p-8 border-t border-black/5 dark:border-white/[0.06] backdrop-blur-2xl bg-white/60 dark:bg-[#222226]/80 rounded-b-none sm:rounded-b-[2.5rem]">
              <button onClick={() => setSelectedId(null)} className={`w-full py-5 rounded-2xl font-black text-sm sm:text-base shadow-xl shadow-indigo-500/25 active:scale-[0.98] transition-all text-white ${themeStyles.accentGradient} hover:brightness-110`}>
                СОХРАНИТЬ И ЗАКРЫТЬ
              </button>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{
        __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
          border-radius: 10px;
          margin: 4px 0;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(99,102,241,0.4);
          border-radius: 10px;
          border: 2px solid transparent;
          background-clip: padding-box;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(99,102,241,0.8);
        }

        @media (max-width: 640px) {
          .custom-scrollbar::-webkit-scrollbar {
            width: 5px;
            height: 5px;
            display: block;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
            margin: 2px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(99,102,241,0.4);
            border-radius: 4px;
            border: none;
          }
        }
      `}} />
    </div>
  );
}
