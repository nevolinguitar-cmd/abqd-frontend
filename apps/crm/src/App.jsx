import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { 
  Search, Moon, Sun, Plus, CheckCircle2, AlertCircle, Clock, Zap, Bot, 
  Calendar as CalendarIcon, BarChart3, X, User, CreditCard, Target, Mail, Phone, 
  GripVertical, Edit2, Trash2, PanelLeftClose, PanelLeftOpen, Cloud, Check, PlusCircle,
  GripHorizontal, LayoutDashboard, CalendarDays, ChevronLeft, ChevronRight
} from 'lucide-react';

/**
 * ABQD CRM — Универсальный Dashboard
 * Исправление: Карточка сделки перенесена в корень, адаптивный Full-Screen на мобильных, 
 * кнопки больше не съезжают за экран.
 */

// ==========================================
// 1. КОНСТАНТЫ И ДАННЫЕ
// ==========================================

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
    id: "D-1001", company: "SOVA Studio", contact: "Анастасия", stage: "inbox", 
    amount: 180000, currency: "RUB", score: 78, phone: "+7 900 111-22-33", email: "hello@sova.studio", 
    fields: { budget: "180k", deadline: "", note: "Интерес к CRM-системе." }, tags: ["warm"], nextTaskAt: getTodayDateStr(), plugins: ["ai_agent"]
  },
  {
    id: "D-1002", company: "Nord Realty", contact: "Алексей", stage: "qual", 
    amount: 320000, currency: "RUB", score: 85, phone: "+7 900 444-55-66", email: "info@nord.re", 
    fields: { budget: "300k+", deadline: "март", note: "Нужен календарь встреч." }, tags: ["hot"], nextTaskAt: getTomorrowDateStr(), plugins: ["calendar", "analytics"]
  }
];

// ==========================================
// 2. УТИЛИТЫ И СТИЛИ
// ==========================================

const formatMoney = (amount, currency = "RUB") => {
  return new Intl.NumberFormat("ru-RU", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);
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
    accentGradient: 'bg-indigo-500', 
    accentText: 'text-indigo-400',
    calendarCellHover: 'hover:bg-white/5'
  },
  light: {
    bg: 'bg-[#F8FAFC]', panel: 'bg-white', panelBorder: 'border-slate-200',
    sidebar: 'bg-[#F1F5F9]', card: 'bg-white', cardHover: 'hover:bg-slate-50',
    text: 'text-slate-900', textMuted: 'text-slate-500', input: 'bg-slate-100 border-slate-200',
    accentGradient: 'bg-indigo-500',
    accentText: 'text-indigo-600',
    calendarCellHover: 'hover:bg-slate-50'
  }
}[theme]);

// ==========================================
// 3. UI КОМПОНЕНТЫ
// ==========================================

const Badge = ({ children, className = "" }) => (
  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition-all duration-300 ${className}`}>{children}</span>
);

const ResponsiveLogo = ({ className = "w-10 h-10" }) => (
  <div className={`${className} relative flex items-center justify-center transition-transform hover:scale-105 duration-300`}>
    <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg flex items-center justify-center">
      <Zap className="text-white w-5 h-5 fill-current" />
    </div>
  </div>
);

// ==========================================
// 4. КОМПОНЕНТ КАЛЕНДАРЯ
// ==========================================

const CalendarView = ({ deals, onOpenDeal, themeStyles, theme }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const startDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const monthNames = [
    "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", 
    "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"
  ];
  const dayNames = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const handleToday = () => setCurrentDate(new Date());

  const renderCalendarCells = () => {
    const cells = [];
    const todayStr = new Date().toISOString().split('T')[0];

    for (let i = 0; i < startDay; i++) {
      cells.push(<div key={`empty-${i}`} className={`min-h-[120px] p-2 border-b border-r ${themeStyles.panelBorder} opacity-20`} />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayDeals = deals.filter(d => d.nextTaskAt === dateStr);
      const isToday = dateStr === todayStr;

      cells.push(
        <div key={day} className={`min-h-[140px] p-3 border-b border-r ${themeStyles.panelBorder} ${themeStyles.calendarCellHover} transition-colors flex flex-col gap-2 relative`}>
          <div className="flex justify-between items-start">
            <span className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-indigo-500 text-white shadow-md' : themeStyles.textMuted}`}>
              {day}
            </span>
          </div>
          <div className="flex-1 flex flex-col gap-1.5 overflow-y-auto custom-scrollbar pr-1">
            {dayDeals.map(deal => (
              <div 
                key={deal.id} 
                onClick={() => onOpenDeal(deal.id)}
                className={`text-xs p-2 rounded-lg cursor-pointer transition-all border shadow-sm truncate ${theme === 'dark' ? 'bg-[#221f30] border-white/5 hover:border-indigo-500/50' : 'bg-white border-slate-200 hover:border-indigo-500'}`}
                title={`${deal.company} - ${deal.contact}`}
              >
                <div className="font-bold truncate">{deal.company}</div>
                <div className={`truncate opacity-60 mt-0.5 ${themeStyles.accentText}`}>{formatMoney(deal.amount)}</div>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return cells;
  };

  return (
    <div className="flex flex-col h-full p-4 sm:p-8 overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h2 className={`text-2xl font-black tracking-tight ${themeStyles.text}`}>
          {monthNames[month]} <span className="opacity-40">{year}</span>
        </h2>
        <div className="flex items-center gap-2">
          <button onClick={handleToday} className={`px-4 py-2 rounded-xl text-xs font-bold border ${themeStyles.panelBorder} ${themeStyles.textMuted} hover:text-indigo-400 transition-colors`}>
            Сегодня
          </button>
          <div className={`flex items-center rounded-xl border ${themeStyles.panelBorder} overflow-hidden`}>
            <button onClick={handlePrevMonth} className={`p-2 hover:bg-white/5 transition-colors ${themeStyles.textMuted}`}><ChevronLeft size={18} /></button>
            <div className={`w-px h-5 ${themeStyles.panelBorder} bg-current opacity-20`} />
            <button onClick={handleNextMonth} className={`p-2 hover:bg-white/5 transition-colors ${themeStyles.textMuted}`}><ChevronRight size={18} /></button>
          </div>
        </div>
      </div>

      <div className={`flex-1 rounded-2xl sm:rounded-[32px] border ${themeStyles.panelBorder} ${themeStyles.panel} shadow-xl overflow-hidden flex flex-col`}>
        <div className={`grid grid-cols-7 border-b ${themeStyles.panelBorder} bg-white/5`}>
          {dayNames.map(day => (
            <div key={day} className={`p-2 sm:p-3 text-center text-[10px] font-black uppercase tracking-widest ${themeStyles.textMuted}`}>
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 flex-1 overflow-y-auto custom-scrollbar auto-rows-[minmax(100px,auto)] sm:auto-rows-[minmax(140px,auto)]">
          {renderCalendarCells()}
        </div>
      </div>
    </div>
  );
};


// ==========================================
// 5. МОДАЛЬНОЕ ОКНО РЕДАКТИРОВАНИЯ СДЕЛКИ
// ==========================================

const DealEditorModal = ({ deal, stages, themeStyles, onSave, onClose, onDelete, onCallAI, isSyncing }) => {
  const [draft, setDraft] = useState(deal);

  useEffect(() => {
    if (JSON.stringify(draft) === JSON.stringify(deal)) return;
    const timer = setTimeout(() => onSave(draft), 600);
    return () => clearTimeout(timer);
  }, [draft, deal, onSave]);

  const togglePlugin = (pluginId) => {
    const plugins = draft.plugins || [];
    setDraft({ ...draft, plugins: plugins.includes(pluginId) ? plugins.filter(id => id !== pluginId) : [...plugins, pluginId] });
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-end sm:items-center justify-center p-0 sm:p-6 bg-[#0f0c1b]/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="absolute inset-0 cursor-pointer hidden sm:block" onClick={onClose} />
      
      {/* ОБНОВЛЕНИЕ ДЛЯ МОБИЛЬНЫХ:
        h-[100dvh] делает карточку на весь экран на телефонах.
        sm:h-auto возвращает автоматическую высоту на ПК.
        rounded-none убирает скругления на мобильных.
      */}
      <aside className={`relative w-full max-w-2xl h-[100dvh] sm:h-auto sm:max-h-[90vh] overflow-hidden flex flex-col rounded-none sm:rounded-[32px] border-0 sm:border-2 shadow-2xl animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-300 ${themeStyles.panel} ${themeStyles.panelBorder}`}>
        
        <div className="p-4 sm:p-8 border-b border-white/5 flex items-center justify-between shrink-0">
          {/* min-w-0 и flex-1 нужны, чтобы инпуты не выталкивали крестик */}
          <div className="flex items-center gap-3 sm:gap-5 min-w-0 flex-1">
            <div className={`hidden sm:flex w-14 h-14 rounded-2xl bg-indigo-500/10 items-center justify-center text-indigo-500 shrink-0`}>
              <Target size={28} />
            </div>
            <div className="text-left min-w-0 flex-1">
              <input 
                value={draft.company} onChange={(e) => setDraft({...draft, company: e.target.value})} 
                className={`font-black text-xl sm:text-2xl bg-transparent outline-none focus:text-indigo-400 w-full tracking-tight transition-colors truncate ${themeStyles.text}`} 
                placeholder="Название компании" 
              />
              <div className="flex items-center gap-2 text-[10px] sm:text-xs font-bold opacity-40 mt-1 uppercase tracking-widest truncate">
                  <span className="shrink-0">{draft.id}</span>
                  <span className="shrink-0">·</span>
                  <input value={draft.contact} onChange={(e) => setDraft({...draft, contact: e.target.value})} className="bg-transparent outline-none focus:text-indigo-400 min-w-0 w-full truncate" placeholder="Имя контакта" />
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-1 sm:gap-2 shrink-0 ml-2">
            {isSyncing && <Cloud className="text-indigo-400 animate-pulse hidden sm:block mr-2" size={20} />}
            <button onClick={() => onDelete(draft.id)} className="p-2 sm:p-4 hover:bg-rose-500/10 text-rose-500 rounded-xl sm:rounded-2xl transition-all" title="Удалить"><Trash2 size={20} /></button>
            <button onClick={onClose} className="p-2 sm:p-4 hover:bg-white/10 rounded-xl sm:rounded-2xl transition-all" title="Закрыть"><X size={24} className="opacity-40" /></button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 sm:p-10 space-y-8 sm:space-y-10 custom-scrollbar">
          
          <div className="space-y-4 text-left">
              <h3 className="text-xs font-black uppercase tracking-widest opacity-30 flex items-center gap-2"><Zap size={14} /> Инструменты обслуживания</h3>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                {PLUGINS.map(p => {
                  const isActive = draft.plugins?.includes(p.id);
                  return (
                    <button key={p.id} onClick={() => togglePlugin(p.id)}
                      className={`flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl border text-xs font-bold transition-all duration-300 ${isActive ? 'bg-indigo-500/10 border-indigo-500/40 text-indigo-400 shadow-sm' : `${themeStyles.input} ${themeStyles.textMuted} opacity-60 hover:opacity-100`}`}>
                      {p.icon}<span>{p.title}</span>{isActive && <CheckCircle2 size={12} className="ml-1" />}
                    </button>
                  );
                })}
              </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
              <div className="space-y-2 text-left">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-30 px-1">Этап сделки</label>
                <select value={draft.stage} onChange={(e) => setDraft({...draft, stage: e.target.value})} className={`w-full p-4 rounded-xl text-sm font-bold border outline-none transition-all ${themeStyles.input} ${themeStyles.text} focus:ring-2 focus:ring-indigo-500/20`}>
                  {stages.map(s => <option key={s.key} value={s.key} className={themeStyles.panel}>{s.title}</option>)}
                </select>
              </div>
              <div className="space-y-2 text-left">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-30 px-1">Дата сделки (для календаря)</label>
                <input type="date" value={draft.nextTaskAt || ""} onChange={(e) => setDraft({...draft, nextTaskAt: e.target.value})} className={`w-full p-4 rounded-xl text-sm font-bold border outline-none transition-all ${themeStyles.input} ${themeStyles.text} focus:ring-2 focus:ring-indigo-500/20`} />
              </div>
          </div>

          <div className="space-y-4 sm:space-y-6 text-left">
              <h3 className="text-xs font-black uppercase tracking-widest opacity-30 flex items-center gap-2"><User size={14} /> Основная информация</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2 text-left">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-30 px-1">Бюджет сделки</label>
                  <input type="number" value={draft.amount} onChange={(e) => setDraft({...draft, amount: parseFloat(e.target.value) || 0})} className={`w-full p-4 rounded-xl text-sm font-bold border outline-none transition-all ${themeStyles.input} ${themeStyles.text} focus:ring-2 focus:ring-indigo-500/20`} />
                </div>
                <div className="space-y-2 text-left">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-30 px-1">Телефон</label>
                  <div className={`flex items-center gap-3 p-4 rounded-xl border ${themeStyles.input}`}><Phone size={18} className="text-indigo-400 opacity-40" /><input value={draft.phone || ""} onChange={(e) => setDraft({...draft, phone: e.target.value})} placeholder="Телефон" className="bg-transparent text-sm w-full outline-none font-semibold" /></div>
                </div>
              </div>
          </div>

          <div className="space-y-4 sm:space-y-6 text-left">
              <div className="flex justify-between items-center">
              <h3 className="text-xs font-black uppercase tracking-widest opacity-30 flex items-center gap-2">Заметки и Аналитика</h3>
              <button onClick={() => onCallAI(draft, setDraft)} className="text-[10px] font-black uppercase tracking-tighter bg-indigo-500/10 text-indigo-400 px-3 py-2 rounded-full border border-indigo-500/20 hover:bg-indigo-500/20 transition-all flex items-center gap-2"><Zap size={10} className="fill-current" /> AI Помощник</button>
              </div>
              <textarea 
              value={draft.fields.note || ""} onChange={(e) => setDraft({...draft, fields: {...draft.fields, note: e.target.value}})} 
              placeholder="Описание сделки, детали звонков, договоренности..." 
              className={`w-full h-40 sm:h-52 p-4 sm:p-5 rounded-2xl text-sm leading-relaxed border outline-none resize-none transition-all ${themeStyles.input} ${themeStyles.text} focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10`} 
              />
          </div>
        </div>

        <div className="p-4 sm:p-8 border-t border-white/5 flex gap-4 shrink-0 pb-6 sm:pb-8">
          <button onClick={onClose} className="w-full h-12 sm:h-14 rounded-xl sm:rounded-[24px] bg-[#2a253a] hover:bg-[#352f44] text-white font-bold text-sm transition-all active:scale-[0.98]">Готово</button>
        </div>
      </aside>
    </div>
  );
};

// ==========================================
// 6. ГЛАВНЫЙ КОМПОНЕНТ ПРИЛОЖЕНИЯ
// ==========================================

export default function App() {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('abqd_theme') || 'light';
    }
    return 'light';
  });

  useEffect(() => {
    localStorage.setItem('abqd_theme', theme);
  }, [theme]);

  const [currentView, setCurrentView] = useState('kanban'); // 'kanban' | 'calendar'
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  const [deals, setDeals] = useState(INITIAL_DEALS);
  const [stages, setStages] = useState(INITIAL_STAGES);
  
  const [selectedId, setSelectedId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentRole, setCurrentRole] = useState("novice");
  const [activePluginsFilter, setActivePluginsFilter] = useState([]);
  
  const [toasts, setToasts] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);
  
  // Drag and Drop State (Safe Declarative Implementation)
  const [dragType, setDragType] = useState(null); // 'deal' | 'stage'
  const [draggedId, setDraggedId] = useState(null);
  const [dragOverId, setDragOverId] = useState(null);

  const [editingStageKey, setEditingStageKey] = useState(null);
  const [renameValue, setRenameValue] = useState("");

  const themeStyles = useMemo(() => getThemeStyles(theme), [theme]);

  const addToast = useCallback((type, title, message) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);

  const handleCallAI = async (currentDraft, setDraftFunction) => {
    addToast("info", "AI думает", "Анализируем контекст сделки...");
    setTimeout(() => {
      setDraftFunction(prev => ({
        ...prev,
        fields: { ...prev.fields, note: (prev.fields.note || "") + "\n\n[AI]: Не забудьте обсудить архитектурный проект на следующей встрече." }
      }));
    }, 800);
  };

  const handleSaveDeal = useCallback((updatedDeal) => {
    setIsSyncing(true);
    setDeals(prev => prev.map(d => d.id === updatedDeal.id ? updatedDeal : d));
    setTimeout(() => setIsSyncing(false), 400); 
  }, []);

  const handleAddDeal = (stageKey) => {
    const newId = `D-${Math.floor(Math.random() * 9000) + 1000}`;
    const newDeal = {
      id: newId, company: "Новая сделка", contact: "Контакт", stage: stageKey,
      amount: 0, currency: "RUB", score: 50, phone: "", email: "", fields: { budget: "", deadline: "", note: "" },
      tags: [], nextTaskAt: getTodayDateStr(), plugins: []
    };
    setDeals(prev => [newDeal, ...prev]);
    setSelectedId(newId);
  };

  const handleDeleteDeal = (id) => {
    setDeals(prev => prev.filter(d => d.id !== id));
    setSelectedId(null);
    addToast("warn", "Сделка удалена", "Данные безвозвратно стерты.");
  };

  const handleMoveDeal = (dealId, newStage) => {
    setDeals(prev => prev.map(d => d.id === dealId ? { ...d, stage: newStage } : d));
  };

  const handleAddStage = () => {
    const newKey = `stage_${Date.now()}`;
    setStages(prev => [...prev, { key: newKey, title: "Новый этап", color: "bg-indigo-400", gates: [] }]);
    setEditingStageKey(newKey);
    setRenameValue("Новый этап");
    setTimeout(() => {
      const board = document.getElementById('board-container');
      if (board) board.scrollLeft = board.scrollWidth;
    }, 100);
  };

  const handleDeleteStage = (key) => {
    if (deals.some(d => d.stage === key)) {
      addToast("error", "Удаление отменено", "Сначала переместите или удалите все сделки из этого этапа.");
      return;
    }
    setStages(prev => prev.filter(s => s.key !== key));
    addToast("info", "Этап удален", "Столбец успешно удален из воронки.");
  };

  const handleRenameStage = (key, newTitle) => {
    if (!newTitle.trim()) { setEditingStageKey(null); return; }
    setStages(prev => prev.map(s => s.key === key ? { ...s, title: newTitle } : s));
    setEditingStageKey(null);
  };

  const moveStageOrder = (draggedKey, overKey) => {
    if (draggedKey === overKey) return;
    setStages(prev => {
      const draggedIndex = prev.findIndex(s => s.key === draggedKey);
      const overIndex = prev.findIndex(s => s.key === overKey);
      const newStages = [...prev];
      const [draggedStage] = newStages.splice(draggedIndex, 1);
      newStages.splice(overIndex, 0, draggedStage);
      return newStages;
    });
  };

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
    <div className={`flex h-screen w-full transition-colors duration-500 font-sans ${themeStyles.bg} ${themeStyles.text}`}>
      
      {/* SIDEBAR */}
      <aside className={`relative border-r flex flex-col p-4 transition-all duration-300 ease-in-out z-40 ${isSidebarCollapsed ? 'w-20' : 'w-64'} ${themeStyles.sidebar} ${themeStyles.panelBorder}`}>
        <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className={`absolute -right-3 top-10 z-50 w-6 h-6 rounded-full border flex items-center justify-center transition-all shadow-xl ${theme === 'dark' ? 'bg-[#2D3446] border-white/10 text-white hover:text-indigo-400' : 'bg-white border-slate-200 text-slate-400 hover:text-indigo-500'}`}>
          {isSidebarCollapsed ? <PanelLeftOpen size={14} /> : <PanelLeftClose size={14} />}
        </button>

        <div className="space-y-2 mb-6">
          <button 
            onClick={() => setCurrentView('kanban')}
            className={`w-full flex items-center rounded-xl transition-all duration-300 ${isSidebarCollapsed ? 'justify-center p-3' : 'gap-3 px-4 py-3'} ${currentView === 'kanban' ? 'bg-indigo-500 text-white shadow-md' : `hover:bg-white/5 ${themeStyles.textMuted}`}`}
            title={isSidebarCollapsed ? "Доска" : ''}
          >
            <LayoutDashboard size={18} />
            {!isSidebarCollapsed && <span className="text-sm font-bold">Доска</span>}
          </button>
          <button 
            onClick={() => setCurrentView('calendar')}
            className={`w-full flex items-center rounded-xl transition-all duration-300 ${isSidebarCollapsed ? 'justify-center p-3' : 'gap-3 px-4 py-3'} ${currentView === 'calendar' ? 'bg-indigo-500 text-white shadow-md' : `hover:bg-white/5 ${themeStyles.textMuted}`}`}
            title={isSidebarCollapsed ? "Календарь" : ''}
          >
            <CalendarDays size={18} />
            {!isSidebarCollapsed && <span className="text-sm font-bold">Календарь</span>}
          </button>
        </div>

        <div className={`w-full h-px ${themeStyles.panelBorder} border-t mb-6`} />

        <div className="space-y-1 flex-1 overflow-y-auto no-scrollbar">
          {!isSidebarCollapsed && <p className={`text-[10px] font-bold uppercase tracking-widest px-2 mb-4 ${themeStyles.textMuted} opacity-50 text-left`}>Фильтры плагинов</p>}
          {PLUGINS.map(p => (
            <button key={p.id} onClick={() => setActivePluginsFilter(prev => prev.includes(p.id) ? prev.filter(x => x !== p.id) : [...prev, p.id])}
              className={`w-full flex items-center rounded-xl transition-all duration-300 group mb-2 ${isSidebarCollapsed ? 'justify-center p-3' : 'gap-3 px-4 py-2.5'} ${activePluginsFilter.includes(p.id) ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : `hover:bg-white/5 ${themeStyles.textMuted} border border-transparent`}`}>
              <div className={`${activePluginsFilter.includes(p.id) ? 'text-indigo-400' : 'group-hover:text-indigo-400 transition-colors'}`}>{p.icon}</div>
              {!isSidebarCollapsed && <span className="text-sm font-semibold truncate text-left">{p.title}</span>}
            </button>
          ))}
        </div>

        <div className="mt-auto pb-4 flex justify-center border-t border-white/5 pt-4">
           <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-3 rounded-2xl hover:bg-white/5 transition-all group flex items-center justify-center">
              {theme === 'dark' ? <Sun size={20} className="text-amber-500/40 group-hover:text-amber-400 transition-colors duration-300" /> : <Moon size={20} className="text-indigo-500/50 group-hover:text-indigo-500 transition-colors duration-300" />}
           </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col min-w-0 relative overflow-hidden">
        
        {/* HEADER */}
        <header className={`h-16 border-b flex items-center justify-between px-4 sm:px-6 z-10 transition-colors ${themeStyles.panel} ${themeStyles.panelBorder} backdrop-blur-md bg-opacity-80`}>
          <div className="flex items-center gap-4 flex-1 max-w-xl">
            <div className="relative w-full">
              <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40 ${themeStyles.textMuted}`} />
              <input type="text" placeholder={currentView === 'kanban' ? "Поиск..." : "Поиск..."} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full h-10 pl-10 sm:pl-12 pr-4 rounded-xl text-sm border outline-none transition-all ${themeStyles.input} ${themeStyles.text} focus:border-indigo-500/30 focus:bg-[#1C1929]`} />
            </div>
          </div>
          <div className="flex items-center gap-3">
             {isSyncing && (
               <div className="hidden sm:flex items-center gap-2 text-[10px] font-bold text-indigo-400 animate-pulse mr-4 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                 <Cloud size={14} /> <span>Синхронизация</span>
               </div>
             )}
            <div className={`flex items-center gap-1 p-1.5 rounded-xl border ${themeStyles.panelBorder} ${theme === 'dark' ? 'bg-[#141120]' : 'bg-slate-100'}`}>
              {Object.keys(ROLES).map(k => (
                <button key={k} onClick={() => setCurrentRole(k)} className={`px-3 sm:px-5 py-2 rounded-lg text-[10px] sm:text-xs font-bold transition-all duration-300 ${currentRole === k ? `bg-indigo-500 text-white shadow-sm` : `opacity-40 hover:opacity-100 ${themeStyles.text}`}`}>
                  {ROLES[k].title}
                </button>
              ))}
            </div>
          </div>
        </header>

        {/* DYNAMIC VIEW: KANBAN OR CALENDAR */}
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
onDragOver={(e) => { e.preventDefault(); setDragOverId(stage.key); }}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (dragType === 'deal' && draggedId) handleMoveDeal(draggedId, stage.key);
                    if (dragType === 'stage' && draggedId) moveStageOrder(draggedId, stage.key);
                    setDragType(null); setDraggedId(null); setDragOverId(null);
                  }}
                  onDragLeave={() => setDragOverId(null)}
                  className={`flex-none w-[280px] sm:w-[320px] flex flex-col group/col rounded-2xl transition-all duration-300 border-2 ${isStageDragged ? 'opacity-50 border-indigo-500/40' : ''} ${isStageDragOver ? 'border-indigo-500/40 bg-indigo-500/5 scale-[1.02] shadow-xl' : isDealDragOver ? 'border-indigo-500/30 bg-indigo-500/5' : 'border-transparent'}`}
                >
                  <div className="flex flex-col mb-4 px-2">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-3 flex-1 min-w-0 text-left">
                        <button
  type="button"
  draggable
  onDragStart={(e) => {
    e.stopPropagation();
    setDragType('stage');
    setDraggedId(stage.key);
    e.dataTransfer.effectAllowed = 'move';
  }}
  onDragEnd={(e) => {
    e.stopPropagation();
    setDragType(null);
    setDraggedId(null);
    setDragOverId(null);
  }}
  className="p-1.5 rounded-md hover:bg-white/5 opacity-60 hover:opacity-100 cursor-grab active:cursor-grabbing"
  title="Перетащить колонку"
>
  <GripVertical size={16} />
</button>

<div className={`w-2 h-2 rounded-full ${stage.color}`} />
                        {editingStageKey === stage.key ? (
                          <input autoFocus value={renameValue} onChange={(e) => setRenameValue(e.target.value)} onBlur={() => handleRenameStage(stage.key, renameValue)} onKeyDown={(e) => e.key === 'Enter' && handleRenameStage(stage.key, renameValue)} className={`bg-transparent font-bold text-sm uppercase tracking-wider outline-none border-b border-indigo-500 w-full ${themeStyles.text}`} />
                        ) : (
                          <h3 onClick={() => { setEditingStageKey(stage.key); setRenameValue(stage.title); }} className={`font-bold text-sm uppercase tracking-wider truncate cursor-pointer hover:text-indigo-400 transition-colors ${themeStyles.textMuted}`}>{stage.title}</h3>
                        )}
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover/col:opacity-100 transition-opacity">
                        <button onClick={() => handleDeleteStage(stage.key)} className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded-md transition-colors" title="Удалить этап"><Trash2 size={14} /></button>
                        <button onClick={() => handleAddDeal(stage.key)} className="p-1.5 text-indigo-400 hover:bg-indigo-500/10 rounded-md transition-colors" title="Добавить сделку"><Plus size={16} /></button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pl-5 mt-1">
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
                            e.dataTransfer.setData("dealId", deal.id); 
                          }} 
                          onDragEnd={(e) => { 
                            e.stopPropagation(); 
                            setDragType(null); 
                            setDraggedId(null); 
                            setDragOverId(null); 
                          }} 
                          onClick={() => setSelectedId(deal.id)}
                          className={`group/card p-4 rounded-xl border cursor-grab active:cursor-grabbing transition-all duration-200 hover:shadow-lg ${selectedId === deal.id ? 'border-indigo-500/50 bg-indigo-500/5 ring-1 ring-indigo-500/20' : isDragged ? 'opacity-50 border-indigo-500/50 bg-indigo-500/10 ring-2 ring-indigo-500/20' : `${themeStyles.card} ${themeStyles.panelBorder} ${themeStyles.cardHover} shadow-sm`}`}>
                          
                          <div className="flex justify-between items-start mb-2 text-left">
                            <h4 className={`font-bold text-sm truncate pr-2 ${themeStyles.text}`}>{deal.company}</h4>
                            <Badge className={score.color}>{deal.score}</Badge>
                          </div>
                          <div className="flex items-center justify-between text-[11px] mb-3 text-left">
                            <span className={themeStyles.textMuted}>{deal.contact}</span>
                            <span className={`font-bold tracking-tight ${themeStyles.accentText}`}>{formatMoney(deal.amount)}</span>
                          </div>
                          
                          <div className="flex items-center gap-2 pt-3 border-t border-white/5">
                            <div className="flex -space-x-1.5 overflow-hidden">
                              {deal.plugins?.length > 0 ? deal.plugins.map(pid => {
                                  const p = PLUGINS.find(item => item.id === pid);
                                  return p ? <div key={pid} className={`w-6 h-6 rounded-full ${themeStyles.bg} border ${themeStyles.panelBorder} flex items-center justify-center text-indigo-400 shadow-sm z-10 hover:z-20`} title={p.title}>{p.icon}</div> : null;
                                }) : <span className="text-[10px] opacity-40 font-medium mt-1">Нет плагинов</span>}
                            </div>
                            <div className="flex-1" />
                            {deal.nextTaskAt && (
                               <div className={`flex items-center gap-1 text-[10px] font-bold ${getDueStatus(deal.nextTaskAt) === "expired" ? "text-rose-500" : getDueStatus(deal.nextTaskAt) === "today" ? "text-amber-500" : "text-emerald-500"}`}>
                                 <Clock size={10} /> <span>{deal.nextTaskAt.slice(5)}</span>
                               </div>
                            )}
                            <GripHorizontal size={14} className={`${themeStyles.textMuted} opacity-0 group-hover/card:opacity-60 transition-opacity ml-1`} />
                          </div>
                        </div>
                      );
                    })}
                    <button onClick={() => handleAddDeal(stage.key)} className={`w-full py-3 rounded-xl border-2 border-dashed ${themeStyles.panelBorder} opacity-40 hover:opacity-100 hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-all text-xs font-medium flex items-center justify-center gap-2 ${themeStyles.textMuted}`}><Plus size={14} /> Добавить сделку</button>
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
        ) : (
          <CalendarView deals={filteredDeals} onOpenDeal={(id) => setSelectedId(id)} themeStyles={themeStyles} theme={theme} />
        )}
      </main>

      {/* MODAL EDITOR */}
      {selectedDeal && (
        <DealEditorModal 
          deal={selectedDeal} stages={stages} themeStyles={themeStyles} isSyncing={isSyncing}
          onSave={handleSaveDeal} onClose={() => setSelectedId(null)} onDelete={handleDeleteDeal} onCallAI={handleCallAI}
        />
      )}

      {/* TOASTS */}
      <div className="fixed top-20 right-4 sm:right-8 z-[1000] space-y-4 pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className={`flex items-start gap-4 p-4 rounded-xl shadow-xl border backdrop-blur-xl animate-in slide-in-from-right duration-300 pointer-events-auto min-w-[280px] ${theme === 'dark' ? 'bg-[#1b1828]/95 border-[#2a253a]' : 'bg-white/95 border-slate-200'}`}>
            <div className={`mt-0.5 ${t.type === 'success' ? 'text-emerald-400' : t.type === 'error' ? 'text-rose-400' : 'text-indigo-400'}`}>
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
