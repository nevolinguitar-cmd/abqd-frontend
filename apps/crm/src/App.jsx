import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { 
  Search, Moon, Sun, Plus, CheckCircle2, AlertCircle, Clock, Zap, Bot, 
  Calendar, BarChart3, X, User, CreditCard, Target, Mail, Phone, 
  GripVertical, Edit2, Trash2, PanelLeftClose, PanelLeftOpen, Cloud, Check, PlusCircle
} from 'lucide-react';

/**
 * ABQD CRM — Универсальный Dashboard
 * Архитектура: Модульная, с изоляцией состояний, кастомными хуками и оптимизацией рендеринга.
 */

// ==========================================
// 1. КОНСТАНТЫ И ДАННЫЕ
// ==========================================

const PLUGINS = [
  { id: "ai_agent", title: "AI агент", icon: <Bot className="w-4 h-4" />, desc: "Next Action и резюме" },
  { id: "calendar", title: "Календарь", icon: <Calendar className="w-4 h-4" />, desc: "Встречи и слоты" },
  { id: "analytics", title: "Аналитика", icon: <BarChart3 className="w-4 h-4" />, desc: "Конверсия воронки" },
];

const INITIAL_STAGES = [
  { key: "inbox", title: "Входящие", color: "bg-slate-400", gates: [] },
  { key: "qual", title: "Квалификация", color: "bg-blue-400", gates: ["budget", "deadline"] },
  { key: "proposal", title: "Предложение", color: "bg-indigo-400", gates: ["decisionMaker", "email"] },
  { key: "contract", title: "Договор", color: "bg-violet-400", gates: ["inn", "legalName"] },
  { key: "won", title: "Выиграно", color: "bg-emerald-400", gates: [] },
  { key: "lost", title: "Потеряно", color: "bg-rose-400", gates: ["lostReason"] },
];

const ROLES = {
  novice: { title: "Новички", desc: "Работа с новыми лидами" },
  worker: { title: "Рабочие", desc: "Ведение текущих сделок" },
};

const INITIAL_DEALS = [
  {
    id: "D-1001", company: "SOVA Studio", contact: "Анастасия", stage: "inbox", 
    amount: 180000, currency: "RUB", score: 78, phone: "+7 900 111-22-33", email: "hello@sova.studio", 
    fields: { budget: "180k", deadline: "", note: "Интерес к CRM-системе." }, tags: ["warm"], nextTaskAt: "2026-02-25", plugins: ["ai_agent"]
  },
  {
    id: "D-1002", company: "Nord Realty", contact: "Алексей", stage: "qual", 
    amount: 320000, currency: "RUB", score: 85, phone: "+7 900 444-55-66", email: "info@nord.re", 
    fields: { budget: "300k+", deadline: "март", note: "Нужен календарь встреч." }, tags: ["hot"], nextTaskAt: "2026-02-22", plugins: ["calendar", "analytics"]
  }
];

// ==========================================
// 2. УТИЛИТЫ И СТИЛИ
// ==========================================

const formatMoney = (amount, currency = "RUB") => {
  return new Intl.NumberFormat("ru-RU", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);
};

const getScoreInfo = (score) => {
  if (score >= 85) return { text: "Горячий", color: "text-orange-400 bg-orange-400/10 border-orange-400/20 shadow-[0_0_12px_rgba(251,146,60,0.15)]" };
  if (score >= 70) return { text: "Тёплый", color: "text-amber-400 bg-amber-400/10 border-amber-400/20 shadow-[0_0_12px_rgba(251,191,36,0.15)]" };
  return { text: "Холодный", color: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20 shadow-[0_0_12px_rgba(34,211,238,0.15)]" };
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
    bg: 'bg-[#161922]', panel: 'bg-[#212631]', panelBorder: 'border-white/5',
    sidebar: 'bg-[#1C212B]', card: 'bg-[#262C3A]', cardHover: 'hover:bg-[#2D3446]',
    text: 'text-slate-200', textMuted: 'text-slate-400', input: 'bg-white/5 border-white/10'
  },
  light: {
    bg: 'bg-[#F8FAFC]', panel: 'bg-white', panelBorder: 'border-slate-200',
    sidebar: 'bg-[#F1F5F9]', card: 'bg-white', cardHover: 'hover:bg-slate-50',
    text: 'text-slate-900', textMuted: 'text-slate-500', input: 'bg-slate-100 border-slate-200'
  }
}[theme]);

// ==========================================
// 3. UI КОМПОНЕНТЫ (Переиспользуемые)
// ==========================================

const Badge = ({ children, className = "" }) => (
  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition-all duration-300 ${className}`}>{children}</span>
);

const ResponsiveLogo = ({ className = "w-10 h-10" }) => (
  <div className={`${className} relative flex items-center justify-center transition-transform hover:scale-105 duration-300`}>
    <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl shadow-lg flex items-center justify-center">
      <Zap className="text-white w-5 h-5 fill-current" />
    </div>
  </div>
);

// ==========================================
// 4. КОМПОНЕНТЫ АРХИТЕКТУРЫ
// ==========================================

// --- Модальное окно редактирования сделки (С ИЗОЛЯЦИЕЙ СОСТОЯНИЯ) ---
const DealEditorModal = ({ deal, stages, themeStyles, onSave, onClose, onDelete, onCallAI, isSyncing }) => {
  const [draft, setDraft] = useState(deal);

  // Кастомный хук для автосохранения локального состояния
  useEffect(() => {
    if (JSON.stringify(draft) === JSON.stringify(deal)) return;
    const timer = setTimeout(() => onSave(draft), 600); // Debounce 600ms
    return () => clearTimeout(timer);
  }, [draft, deal, onSave]);

  const togglePlugin = (pluginId) => {
    const plugins = draft.plugins || [];
    setDraft({ ...draft, plugins: plugins.includes(pluginId) ? plugins.filter(id => id !== pluginId) : [...plugins, pluginId] });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#0B0E14]/70 backdrop-blur-lg animate-in fade-in duration-300">
      <div className="absolute inset-0 cursor-pointer" onClick={onClose} />
      <aside className={`relative w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col rounded-[40px] border shadow-2xl animate-in zoom-in-95 duration-300 ${themeStyles.panel} ${themeStyles.panelBorder}`}>
        
        {/* Header Модалки */}
        <div className="p-8 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-3xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-[0_8px_20px_rgba(99,102,241,0.3)]">
              <Target size={28} />
            </div>
            <div className="text-left">
              <input 
                value={draft.company} onChange={(e) => setDraft({...draft, company: e.target.value})} 
                className={`font-black text-2xl bg-transparent outline-none focus:text-indigo-400 w-full tracking-tight transition-colors ${themeStyles.text}`} 
                placeholder="Название компании" 
              />
              <div className="flex items-center gap-2 text-xs font-bold opacity-40 mt-1 uppercase tracking-widest">
                  <span>{draft.id}</span><span>·</span>
                  <input value={draft.contact} onChange={(e) => setDraft({...draft, contact: e.target.value})} className="bg-transparent outline-none focus:text-indigo-400" />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isSyncing ? <Cloud className="text-indigo-400 animate-pulse mr-2" size={20} /> : <Check className="text-emerald-400 mr-2" size={20} />}
            <button onClick={() => onDelete(draft.id)} className="p-4 hover:bg-rose-500/10 text-rose-500 rounded-3xl transition-all"><Trash2 size={20} /></button>
            <button onClick={onClose} className="p-4 hover:bg-white/10 rounded-3xl transition-all"><X size={20} className="opacity-40" /></button>
          </div>
        </div>

        {/* Тело Модалки */}
        <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar">
          
          <div className="space-y-4 text-left">
              <h3 className="text-xs font-black uppercase tracking-widest opacity-30 flex items-center gap-2"><Zap size={14} /> Инструменты обслуживания</h3>
              <div className="flex flex-wrap gap-3">
                {PLUGINS.map(p => {
                  const isActive = draft.plugins?.includes(p.id);
                  return (
                    <button key={p.id} onClick={() => togglePlugin(p.id)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border text-xs font-bold transition-all duration-300 ${isActive ? 'bg-indigo-500/10 border-indigo-500/40 text-indigo-400 shadow-[0_0_12px_rgba(99,102,241,0.1)]' : `${themeStyles.input} ${themeStyles.textMuted} opacity-60 hover:opacity-100`}`}>
                      {p.icon}<span>{p.title}</span>{isActive && <CheckCircle2 size={12} className="ml-1" />}
                    </button>
                  );
                })}
              </div>
          </div>

          <div className="grid grid-cols-2 gap-8">
              <div className="space-y-2 text-left">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-30 px-1">Этап сделки</label>
                <select value={draft.stage} onChange={(e) => setDraft({...draft, stage: e.target.value})} className={`w-full p-4 rounded-[20px] text-sm font-bold border outline-none transition-all ${themeStyles.input} ${themeStyles.text} focus:ring-4 focus:ring-indigo-500/10`}>
                  {stages.map(s => <option key={s.key} value={s.key} className="bg-[#1C212B]">{s.title}</option>)}
                </select>
              </div>
              <div className="space-y-2 text-left">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-30 px-1">Бюджет сделки</label>
                <input type="number" value={draft.amount} onChange={(e) => setDraft({...draft, amount: parseFloat(e.target.value) || 0})} className={`w-full p-4 rounded-[20px] text-sm font-bold border outline-none transition-all ${themeStyles.input} ${themeStyles.text} focus:ring-4 focus:ring-indigo-500/10`} />
              </div>
          </div>

          <div className="space-y-6 text-left">
              <h3 className="text-xs font-black uppercase tracking-widest opacity-30 flex items-center gap-2"><User size={14} /> Контактная информация</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className={`flex items-center gap-3 p-5 rounded-[24px] border ${themeStyles.input}`}><Mail size={18} className="text-indigo-400 opacity-40" /><input value={draft.email || ""} onChange={(e) => setDraft({...draft, email: e.target.value})} placeholder="Email адрес" className="bg-transparent text-sm w-full outline-none font-semibold" /></div>
                <div className={`flex items-center gap-3 p-5 rounded-[24px] border ${themeStyles.input}`}><Phone size={18} className="text-indigo-400 opacity-40" /><input value={draft.phone || ""} onChange={(e) => setDraft({...draft, phone: e.target.value})} placeholder="Телефон" className="bg-transparent text-sm w-full outline-none font-semibold" /></div>
              </div>
          </div>

          <div className="space-y-6 text-left">
              <div className="flex justify-between items-center">
              <h3 className="text-xs font-black uppercase tracking-widest opacity-30 flex items-center gap-2">Заметки и Аналитика</h3>
              <button onClick={() => onCallAI(draft, setDraft)} className="text-[10px] font-black uppercase tracking-tighter bg-indigo-500/10 text-indigo-400 px-4 py-2 rounded-full border border-indigo-500/20 hover:bg-indigo-500/20 transition-all flex items-center gap-2"><Zap size={10} className="fill-current" /> AI Помощник</button>
              </div>
              <textarea 
              value={draft.fields.note || ""} onChange={(e) => setDraft({...draft, fields: {...draft.fields, note: e.target.value}})} 
              placeholder="Описание сделки, детали звонков, договоренности..." 
              className={`w-full h-52 p-6 rounded-[32px] text-sm leading-relaxed border outline-none resize-none transition-all ${themeStyles.input} ${themeStyles.text} focus:border-indigo-500/50 focus:ring-8 focus:ring-indigo-500/5`} 
              />
          </div>
        </div>

        <div className="p-8 border-t border-white/5 flex gap-4">
          <button onClick={onClose} className="w-full h-14 rounded-[24px] bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm transition-all active:scale-[0.98] shadow-lg shadow-black/20">Готово</button>
        </div>
      </aside>
    </div>
  );
};

// ==========================================
// 5. ГЛАВНЫЙ КОМПОНЕНТ ПРИЛОЖЕНИЯ
// ==========================================

export default function App() {
  const [theme, setTheme] = useState('dark');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
const [deals, setDeals] = useState(INITIAL_DEALS);
  const [stages, setStages] = useState(INITIAL_STAGES);
  const [selectedId, setSelectedId] = useState(null);
  
  // Состояния фильтров
  const [searchQuery, setSearchQuery] = useState("");
  const [currentRole, setCurrentRole] = useState("novice");
  const [activePluginsFilter, setActivePluginsFilter] = useState([]);
  
  // Состояния UI
  const [toasts, setToasts] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [crmHydrated, setCrmHydrated] = useState(false);
  const [draggedDealId, setDraggedDealId] = useState(null);
  const [dragOverStage, setDragOverStage] = useState(null);
  const [editingStageKey, setEditingStageKey] = useState(null);
  const [renameValue, setRenameValue] = useState("");

  const themeStyles = useMemo(() => getThemeStyles(theme), [theme]);

  // --- Toasts Logic ---
  const addToast = useCallback((type, title, message) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  }, []);

  
  // --- ABQD_CRM_SYNC_v1 ---
  const CRM_API = "https://api.abqd.ru";

  useEffect(() => {
    const token = localStorage.getItem("abqd_token") || "";
    if (!token) { setCrmHydrated(true); return; }

    let alive = true;
    setIsSyncing(true);

    fetch(CRM_API + "/api/v1/crm/state", {
      headers: { authorization: "Bearer " + token }
    })
      .then(r => r.ok ? r.json() : Promise.reject(r))
      .then(data => {
        if (!alive) return;
        const st = data?.state;
        if (st?.stages?.length) setStages(st.stages);
        if (st?.deals?.length) setDeals(st.deals);
      })
      .catch(() => {})
      .finally(() => {
        if (!alive) return;
        setIsSyncing(false);
        setCrmHydrated(true);
      });

    return () => { alive = false; };
  }, []);

  useEffect(() => {
    if (!crmHydrated) return;
    const token = localStorage.getItem("abqd_token") || "";
    if (!token) return;

    const t = setTimeout(() => {
      setIsSyncing(true);
      fetch(CRM_API + "/api/v1/crm/state", {
        method: "PUT",
        headers: {
          "content-type": "application/json",
          authorization: "Bearer " + token
        },
        body: JSON.stringify({ stages, deals })
      })
        .catch(() => {})
        .finally(() => setIsSyncing(false));
    }, 800);

    return () => clearTimeout(t);
  }, [stages, deals, crmHydrated]);
// --- AI Logic ---
  const handleCallAI = async (currentDraft, setDraftFunction) => {
    addToast("info", "AI думает", "Генерация инсайтов...");
    setTimeout(() => {
      setDraftFunction(prev => ({
        ...prev,
        fields: { ...prev.fields, note: (prev.fields.note || "") + "\n\n[AI]: Рекомендуется проверить активность плагинов для ускорения сделки." }
      }));
    }, 800);
  };

  // --- CRUD Сделок ---
  const handleSaveDeal = useCallback((updatedDeal) => {
    setIsSyncing(true);
    setDeals(prev => prev.map(d => d.id === updatedDeal.id ? updatedDeal : d));
    setTimeout(() => setIsSyncing(false), 400); // Имитация сети
  }, []);

  const handleAddDeal = (stageKey) => {
    const newId = `D-${Math.floor(Math.random() * 9000) + 1000}`;
    const newDeal = {
      id: newId, company: "Новая сделка", contact: "Контакт", stage: stageKey,
      amount: 0, currency: "RUB", score: 50, phone: "", email: "", fields: { budget: "", deadline: "", note: "" },
      tags: [], nextTaskAt: new Date().toISOString().split('T')[0], plugins: []
    };
    setDeals(prev => [newDeal, ...prev]);
    setSelectedId(newId);
  };

  const handleDeleteDeal = (id) => {
    setDeals(prev => prev.filter(d => d.id !== id));
    setSelectedId(null);
    addToast("warn", "Сделка удалена", "Данные стерты.");
  };

  const handleMoveStage = (dealId, newStage) => {
    const dealToMove = deals.find(d => d.id === dealId);
    if (!dealToMove) return;
    const stageInfo = stages.find(s => s.key === newStage);
    const missing = stageInfo.gates.filter(g => !dealToMove.fields[g]);
    
    setDeals(prev => prev.map(d => d.id === dealId ? { ...d, stage: newStage } : d));
    
    if (missing.length > 0) addToast("warn", "Нужны данные", `Для этапа "${stageInfo.title}" не хватает: ${missing.join(", ")}`);
  };

  const handleRenameStage = (key, newTitle) => {
    if (!newTitle.trim()) { setEditingStageKey(null); return; }
    setStages(prev => prev.map(s => s.key === key ? { ...s, title: newTitle } : s));
    setEditingStageKey(null);
  };

  // --- Вычисляемые данные (Мемоизация) ---
  const filteredDeals = useMemo(() => {
    return deals.filter(d => {
      const matchesSearch = d.company.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = currentRole === "novice" || d.stage !== "inbox";
      const matchesPlugins = activePluginsFilter.length === 0 || d.plugins?.some(p => activePluginsFilter.includes(p));
      return matchesSearch && matchesRole && matchesPlugins;
    });
  }, [deals, searchQuery, currentRole, activePluginsFilter]);

  const dealsByStage = useMemo(() => {
    const map = {};
    stages.forEach(s => map[s.key] = []);
    filteredDeals.forEach(d => map[d.stage]?.push(d));
    return map;
  }, [filteredDeals, stages]);

  const selectedDeal = useMemo(() => deals.find(d => d.id === selectedId), [deals, selectedId]);

  return (
    <div className={`flex w-full transition-colors duration-500 font-sans ${themeStyles.bg} ${themeStyles.text}`} style={ { height: '100vh', paddingBottom: '5vh', boxSizing: 'border-box' } }>
      
      {/* SIDEBAR */}
      {isSidebarOpen && (
        <div data-abqd-sidebar-overlay className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm sm:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      <aside className={`fixed sm:relative inset-y-0 left-0 sm:inset-auto z-50 sm:z-40 w-72 ${isSidebarCollapsed ? 'sm:w-20' : 'sm:w-64'} border-r flex flex-col p-4 transition-all duration-300 ease-in-out transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} sm:translate-x-0 ${themeStyles.sidebar} ${themeStyles.panelBorder}`}>

        <div data-abqd-sidebar-close className="sm:hidden flex justify-end mb-2">
          <button onClick={() => setIsSidebarOpen(false)} className={`p-2 rounded-xl border ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-slate-100 border-slate-200'}`} aria-label="Закрыть меню">
            <X size={18} />
          </button>
        </div>

        <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className={`hidden sm:flex absolute -right-3 top-10 z-50 w-6 h-6 rounded-full border flex items-center justify-center transition-all shadow-xl ${theme === 'dark' ? 'bg-[#2D3446] border-white/10 text-white hover:text-indigo-400' : 'bg-white border-slate-200 text-slate-400 hover:text-indigo-500'}`}>
          {isSidebarCollapsed ? <PanelLeftOpen size={14} /> : <PanelLeftClose size={14} />}
        </button>

        <div className="space-y-1 flex-1 overflow-y-auto no-scrollbar pt-2">
          {!isSidebarCollapsed && <p className={`text-[10px] font-bold uppercase tracking-wider px-2 mb-6 ${themeStyles.textMuted} opacity-50 text-left`}>Фильтр плагинов</p>}
          {PLUGINS.map(p => (
            <button key={p.id} onClick={() => { setActivePluginsFilter(prev => prev.includes(p.id) ? prev.filter(x => x !== p.id) : [...prev, p.id]); setIsSidebarOpen(false); }}
              className={`w-full flex items-center rounded-2xl transition-all duration-300 group mb-1 ${isSidebarCollapsed ? 'justify-center p-3' : 'gap-3 px-3 py-3'} ${activePluginsFilter.includes(p.id) ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.1)]' : `hover:bg-white/5 ${themeStyles.textMuted} border border-transparent`}`}>
              <div className={`${activePluginsFilter.includes(p.id) ? 'text-indigo-400' : 'group-hover:text-indigo-400 transition-colors'}`}>{p.icon}</div>
              {!isSidebarCollapsed && <span className="text-sm font-semibold truncate text-left">{p.title}</span>}
            </button>
          ))}
        </div>

        <div className="mt-auto pb-4 flex justify-center border-t border-white/5 pt-4">
           <button onClick={() => { setTheme(theme === 'dark' ? 'light' : 'dark'); setIsSidebarOpen(false); }} className="p-3 rounded-2xl hover:bg-white/5 transition-all group flex items-center justify-center">
              {theme === 'dark' ? <Sun size={20} className="text-amber-500/40 group-hover:text-amber-400 transition-colors duration-300" /> : <Moon size={20} className="text-indigo-500/50 group-hover:text-indigo-500 transition-colors duration-300" />}
           </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col min-w-0 relative overflow-hidden">
        
        {/* HEADER */}
        <header className={`h-16 border-b flex items-center justify-between px-6 z-10 transition-colors ${themeStyles.panel} ${themeStyles.panelBorder} backdrop-blur-md bg-opacity-80`}>
          <div className="flex items-center gap-3 flex-1 max-w-xl">
            <button data-abqd-burger onClick={() => setIsSidebarOpen(true)} className={`sm:hidden p-2 rounded-xl border ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-slate-100 border-slate-200'}`} aria-label="Открыть меню">
              <PanelLeftOpen size={18} />
            </button>
            <div className="relative w-full">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-30 ${themeStyles.textMuted}`} />
              <input type="text" placeholder="Поиск по сделкам..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full h-10 pl-10 pr-4 rounded-2xl text-sm border focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all ${themeStyles.input} ${themeStyles.text}`} />
            </div>
          </div>
          <div className="flex items-center gap-3">
             {isSyncing && (
               <div className="flex items-center gap-2 text-[10px] font-bold text-indigo-400 animate-pulse mr-4 bg-indigo-500/5 px-3 py-1 rounded-full border border-indigo-500/10">
                 <Cloud size={14} /> <span>Синхронизация</span>
               </div>
             )}
            <div className={`flex items-center gap-1 p-1 rounded-2xl border ${themeStyles.panelBorder} ${theme === 'dark' ? 'bg-white/5' : 'bg-slate-100'}`}>
              {Object.keys(ROLES).map(k => (
                <button key={k} onClick={() => setCurrentRole(k)} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 ${currentRole === k ? 'bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-[0_4px_12px_rgba(99,102,241,0.3)]' : `opacity-40 hover:opacity-100 ${themeStyles.text}`}`}>
                  {ROLES[k].title}
                </button>
              ))}
            </div>
          </div>
        </header>

        {/* BOARD */}
        <div className="flex-1 overflow-x-auto flex p-8 gap-8 scrollbar-hide">
          {stages.map(stage => (
            <div key={stage.key} onDragOver={(e) => { e.preventDefault(); setDragOverStage(stage.key); }} onDrop={(e) => { e.preventDefault(); handleMoveStage(e.dataTransfer.getData("dealId"), stage.key); setDragOverStage(null); }} onDragLeave={() => setDragOverStage(null)}
              className={`flex-none w-[300px] flex flex-col group/col rounded-3xl transition-all duration-200 border-2 ${dragOverStage === stage.key ? 'border-indigo-500/40 bg-indigo-500/5 shadow-2xl shadow-indigo-500/10 scale-[1.01]' : 'border-transparent'}`}>
              
              <div className="flex items-center justify-between mb-6 px-1">
                <div className="flex items-center gap-3 flex-1 min-w-0 text-left">
                  <div className={`w-2 h-2 rounded-full ${stage.color} shadow-[0_0_10px_currentColor]`} />
                  {editingStageKey === stage.key ? (
                    <input autoFocus value={renameValue} onChange={(e) => setRenameValue(e.target.value)} onBlur={() => handleRenameStage(stage.key, renameValue)} onKeyDown={(e) => e.key === 'Enter' && handleRenameStage(stage.key, renameValue)} className={`bg-transparent font-bold text-sm uppercase outline-none border-b border-indigo-500 w-full ${themeStyles.text}`} />
                  ) : (
                    <h3 onClick={() => { setEditingStageKey(stage.key); setRenameValue(stage.title); }} className={`font-bold text-sm uppercase tracking-[0.1em] truncate cursor-pointer hover:text-indigo-400 transition-colors ${themeStyles.textMuted}`}>{stage.title}</h3>
                  )}
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg ${theme === 'dark' ? 'bg-white/5 text-slate-500' : 'bg-slate-200 text-slate-500'}`}>{dealsByStage[stage.key]?.length || 0}</span>
                </div>
                <button onClick={() => handleAddDeal(stage.key)} className="opacity-0 group-hover/col:opacity-100 p-2 bg-indigo-500/10 text-indigo-400 rounded-xl hover:bg-indigo-500/20 transition-all"><Plus size={16} /></button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-4 pb-6 px-1 custom-scrollbar">
                {dealsByStage[stage.key]?.map(deal => {
                  const score = getScoreInfo(deal.score);
                  const isDragged = draggedDealId === deal.id;
                  return (
                    <div key={deal.id} draggable onDragStart={(e) => { setDraggedDealId(deal.id); e.dataTransfer.setData("dealId", deal.id); setTimeout(()=>e.target.style.opacity='0.5',0); }} onDragEnd={(e) => { e.target.style.opacity='1'; setDraggedDealId(null); setDragOverStage(null); }} onClick={() => setSelectedId(deal.id)}
                      className={`group p-5 rounded-[24px] border cursor-grab active:cursor-grabbing transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${selectedId === deal.id ? 'border-indigo-500/50 bg-indigo-500/5 ring-1 ring-indigo-500/20 shadow-[0_8px_30px_rgba(99,102,241,0.15)]' : isDragged ? 'border-indigo-500/50 bg-indigo-500/10 ring-2 ring-indigo-500/20' : `${themeStyles.card} ${themeStyles.panelBorder} ${themeStyles.cardHover} shadow-sm`}`}>
                      <div className="flex justify-between items-start mb-3 text-left"><h4 className={`font-bold text-sm truncate pr-2 ${themeStyles.text}`}>{deal.company}</h4><Badge className={score.color}>{deal.score}</Badge></div>
                      <div className="flex items-center justify-between text-[11px] mb-4 text-left"><span className={themeStyles.textMuted}>{deal.contact}</span><span className="font-black text-indigo-400 tracking-tighter">{formatMoney(deal.amount)}</span></div>
                      
                      <div className="flex items-center gap-2 pt-3 border-t border-white/5">
                        <div className="flex -space-x-1.5 overflow-hidden">
                          {deal.plugins?.length > 0 ? deal.plugins.map(pid => {
                              const p = PLUGINS.find(item => item.id === pid);
                              return p ? <div key={pid} className="w-6 h-6 rounded-full bg-[#1C212B] border border-white/5 flex items-center justify-center text-indigo-400 shadow-sm" title={p.title}>{p.icon}</div> : null;
                            }) : <span className="text-[9px] opacity-20 uppercase font-bold tracking-tighter">Нет инструментов</span>}
                        </div>
                        <div className="flex-1" />
                        <GripVertical size={12} className={`${themeStyles.textMuted} opacity-0 group-hover:opacity-100 transition-opacity`} />
                      </div>
                    </div>
                  );
                })}
                <button onClick={() => handleAddDeal(stage.key)} className={`w-full py-4 rounded-[24px] border-2 border-dashed ${themeStyles.panelBorder} opacity-20 hover:opacity-100 hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-all text-[11px] font-bold flex items-center justify-center gap-2 ${themeStyles.textMuted}`}><Plus size={14} /> Добавить сделку</button>
              </div>
            </div>
          ))}
        </div>

        {/* MODAL EDITOR */}
        {selectedDeal && (
          <DealEditorModal 
            deal={selectedDeal} 
            stages={stages} 
            themeStyles={themeStyles} 
            isSyncing={isSyncing}
            onSave={handleSaveDeal} 
            onClose={() => setSelectedId(null)} 
            onDelete={handleDeleteDeal}
            onCallAI={handleCallAI}
          />
        )}

        {/* TOASTS */}
        <div className="fixed top-20 right-8 z-[200] space-y-4 pointer-events-none">
          {toasts.map(t => (
            <div key={t.id} className={`flex items-start gap-4 p-5 rounded-[28px] shadow-2xl border backdrop-blur-xl animate-in slide-in-from-right duration-500 pointer-events-auto min-w-[280px] ${theme === 'dark' ? 'bg-[#1C212B]/90 border-white/10' : 'bg-white/90 border-slate-200'}`}>
              <div className={`mt-0.5 ${t.type === 'success' ? 'text-emerald-400' : t.type === 'error' ? 'text-rose-400' : 'text-indigo-400'}`}>{t.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}</div>
              <div className="flex-1 text-left"><p className="font-black text-xs uppercase tracking-wider">{t.title}</p><p className={`text-[11px] font-medium mt-1 ${themeStyles.textMuted}`}>{t.message}</p></div>
            </div>
          ))}
        </div>
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.15); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(99,102,241,0.3); }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}} />
    </div>
  );
}
