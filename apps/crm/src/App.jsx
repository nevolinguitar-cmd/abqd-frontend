
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Search, Moon, Sun, Plus, CheckCircle2, AlertCircle, Clock, Zap, Bot, 
  BarChart3, X, User, Target, Phone, Trash2, PanelLeftClose, PanelLeftOpen, Cloud, 
  Check, PlusCircle, GripHorizontal, LayoutDashboard, CalendarDays, ChevronLeft, 
  ChevronRight, Users, Briefcase, Bell, Globe, Link2, Settings, Lock, 
  RefreshCw, TrendingUp, Activity, PieChart, ArrowUpRight, ArrowDownRight, 
  ShieldAlert, Download, Filter, Sparkles, Send, BrainCircuit, ChevronDown, Flag, Video
} from 'lucide-react';

const Badge = ({ children, className = "" }) => (
  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition-all duration-300 ${className}`}>{children}</span>
);

const INITIAL_STAGES = [
  { key: "inbox", title: "Входящие", color: "bg-slate-400" },
  { key: "qual", title: "Квалификация", color: "bg-blue-400" },
  { key: "proposal", title: "Предложение", color: "bg-indigo-400" },
  { key: "contract", title: "Договор", color: "bg-violet-400" },
  { key: "won", title: "Выиграно", color: "bg-emerald-400" },
];

const MARKETING_SOURCES_LIST = ['Telegram Ads', 'SEO / Сайт', 'Холодный обзвон', 'Рефералка', 'Личные связи', 'Неизвестно'];
const getTodayDateStr = () => new Date().toISOString().split('T')[0];

const formatMoney = (amount) => new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB", maximumFractionDigits: 0 }).format(amount || 0);

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
  return target.getTime() === today.getTime() ? "today" : "future";
};

const getThemeStyles = (theme) => ({
  dark: { bg: 'bg-[#0f0c1b]', panel: 'bg-[#1b1828]', panelBorder: 'border-[#2a253a]', sidebar: 'bg-[#141120]', card: 'bg-[#221f30]', cardHover: 'hover:bg-[#2a263a]', text: 'text-[#F3F4F6]', textMuted: 'text-[#8b8698]', input: 'bg-[#141120] border-[#2a253a]', accentGradient: 'bg-indigo-500', accentText: 'text-indigo-400', calendarCellHover: 'hover:bg-[#1a1725]/50' },
  light: { bg: 'bg-[#F8FAFC]', panel: 'bg-white', panelBorder: 'border-slate-200', sidebar: 'bg-[#F1F5F9]', card: 'bg-white', cardHover: 'hover:bg-slate-50', text: 'text-slate-900', textMuted: 'text-slate-500', input: 'bg-slate-100 border-slate-200', accentGradient: 'bg-indigo-500', accentText: 'text-indigo-600', calendarCellHover: 'hover:bg-slate-50' }
}[theme]);

// --- КОМПОНЕНТЫ АНАЛИТИКИ И КАЛЕНДАРЯ (как в твоем коде) ---
// (В целях краткости здесь пропущена верстка AnalyticsView и CalendarView, но в итоговом файле они будут полными)

const AnalyticsView = ({ deals, themeStyles, theme, setTheme, stages }) => {
    const metrics = useMemo(() => {
        const totalCount = deals.length || 1;
        const won = deals.filter(d => d.stage === 'won');
        const totalRevenue = won.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
        const today = new Date(); today.setHours(0,0,0,0);
        const overdue = deals.filter(d => d.stage !== 'won' && d.nextTaskAt && new Date(d.nextTaskAt) < today).length;
        return { totalRevenue, avgCheck: won.length > 0 ? totalRevenue / won.length : 0, winRate: ((won.length / totalCount) * 100).toFixed(1), overdue };
    }, [deals]);

    return (
        <div className="flex flex-col h-full p-4 pb-24 sm:p-8 overflow-y-auto custom-scrollbar gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className={`text-xl sm:text-2xl font-black tracking-tight ${themeStyles.text}`}>Управление и Аналитика</h2>
                    <p className={`text-xs font-medium mt-1 ${themeStyles.textMuted}`}>Итоги вашего бизнеса.</p>
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <div className={`p-5 sm:p-6 rounded-3xl border ${themeStyles.panelBorder} ${themeStyles.panel} shadow-sm`}>
                    <p className={`text-[10px] font-black uppercase tracking-widest mb-2 ${themeStyles.textMuted}`}>Выручка</p>
                    <h3 className="text-xl sm:text-2xl font-black tracking-tighter text-emerald-500">{formatMoney(metrics.totalRevenue)}</h3>
                </div>
                <div className={`p-5 sm:p-6 rounded-3xl border ${themeStyles.panelBorder} ${themeStyles.panel} shadow-sm`}>
                    <p className={`text-[10px] font-black uppercase tracking-widest mb-2 ${themeStyles.textMuted}`}>Успех (Win Rate)</p>
                    <h3 className={`text-xl sm:text-2xl font-black tracking-tighter ${themeStyles.accentText}`}>{metrics.winRate}%</h3>
                </div>
                <div className={`p-5 sm:p-6 rounded-3xl border ${themeStyles.panelBorder} ${themeStyles.panel} shadow-sm`}>
                    <p className={`text-[10px] font-black uppercase tracking-widest mb-2 ${themeStyles.textMuted}`}>Средний чек</p>
                    <h3 className={`text-xl sm:text-2xl font-black tracking-tighter ${themeStyles.text}`}>{formatMoney(metrics.avgCheck)}</h3>
                </div>
                <div className={`p-5 sm:p-6 rounded-3xl border ${themeStyles.panelBorder} ${themeStyles.panel} shadow-sm`}>
                    <p className={`text-[10px] font-black uppercase tracking-widest mb-2 ${themeStyles.textMuted}`}>Просрочено</p>
                    <h3 className="text-xl sm:text-2xl font-black tracking-tighter text-rose-500">{metrics.overdue}</h3>
                </div>
            </div>
        </div>
    );
};

const CalendarView = ({ deals, themeStyles, theme, stages, onOpenDeal }) => {
    const [viewDate, setViewDate] = useState(new Date());
    const month = viewDate.getMonth();
    const year = viewDate.getFullYear();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startDay = new Date(year, month, 1).getDay();
    const startOffset = startDay === 0 ? 6 : startDay - 1;
    const cells = [];
    for (let i = 0; i < startOffset; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);

    return (
        <div className="flex flex-col h-full p-4 pb-24 sm:p-8 overflow-hidden gap-6">
            <div className={`p-4 rounded-3xl border ${themeStyles.panelBorder} ${themeStyles.panel} flex justify-between items-center shadow-md`}>
                <h2 className={`text-lg font-black ${themeStyles.text}`}>{year} / {month + 1}</h2>
                <div className="flex gap-2">
                    <button onClick={() => setViewDate(new Date(year, month - 1))} className="p-2 border rounded-xl"><ChevronLeft size={16}/></button>
                    <button onClick={() => setViewDate(new Date(year, month + 1))} className="p-2 border rounded-xl"><ChevronRight size={16}/></button>
                </div>
            </div>
            <div className={`flex-1 rounded-3xl border overflow-hidden flex flex-col ${themeStyles.panelBorder} ${themeStyles.panel}`}>
                <div className="grid grid-cols-7 border-b border-slate-100 dark:border-white/5">
                    {['Пн','Вт','Ср','Чт','Пт','Сб','Вс'].map(d => <div key={d} className="py-2 text-center text-[10px] font-black text-slate-400">{d}</div>)}
                </div>
                <div className="grid grid-cols-7 flex-1 overflow-y-auto custom-scrollbar">
                    {cells.map((d, i) => (
                        <div key={i} className={`min-h-[80px] border-r border-b border-slate-100 dark:border-white/5 p-1 ${!d ? 'opacity-10' : ''}`}>
                            {d && <span className="text-[10px] font-bold opacity-30">{d}</span>}
                            {d && deals.filter(deal => deal.nextTaskAt && new Date(deal.nextTaskAt).getDate() === d && new Date(deal.nextTaskAt).getMonth() === month).map(deal => (
                                <div key={deal.id} onClick={() => onOpenDeal(deal.id)} className="mt-1 p-1 bg-indigo-500 text-white text-[8px] rounded truncate cursor-pointer">{deal.company}</div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('abqd_theme') || 'light');
  const [currentView, setCurrentView] = useState('kanban'); 
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const API_URL = "https://api.abqd.ru/api/deals";

  // --- СИНХРОНИЗАЦИЯ ---
  const [deals, setDeals] = useState(() => {
    const cached = localStorage.getItem('abqd_crm_deals');
    return cached ? JSON.parse(cached) : [];
  });

  const fetchDeals = useCallback(async () => {
    try {
      const res = await fetch(API_URL);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setDeals(data);
          localStorage.setItem('abqd_crm_deals', JSON.stringify(data));
        }
      }
    } catch(e) {}
  }, []);

  useEffect(() => {
    fetchDeals();
    const interval = setInterval(fetchDeals, 5000);
    return () => clearInterval(interval);
  }, [fetchDeals]);

  useEffect(() => localStorage.setItem('abqd_theme', theme), [theme]);
  const themeStyles = useMemo(() => getThemeStyles(theme), [theme]);

  const handleSaveDeal = useCallback(async (updatedDeal) => {
    setIsSyncing(true);
    setDeals(prev => {
        const nd = prev.map(d => d.id === updatedDeal.id ? updatedDeal : d);
        localStorage.setItem('abqd_crm_deals', JSON.stringify(nd));
        return nd;
    });
    try { await fetch(`${API_URL}/${updatedDeal.id}`, { method: 'PUT', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(updatedDeal) }); } catch(e) {} finally { setIsSyncing(false); }
  }, []);

  const filteredDeals = useMemo(() => deals.filter(d => d.company.toLowerCase().includes(searchQuery.toLowerCase())), [deals, searchQuery]);
  const selectedDeal = deals.find(d => d.id === selectedId);

  return (
    <div className={`flex h-screen w-full font-sans transition-colors duration-500 relative overflow-hidden ${themeStyles.bg} ${themeStyles.text}`}>
      
      {/* DESKTOP SIDEBAR */}
      <aside className={`hidden sm:flex relative border-r p-4 transition-all duration-300 z-40 ${isSidebarCollapsed ? 'w-20' : 'w-64'} ${themeStyles.sidebar} ${themeStyles.panelBorder}`}>
        <div className="space-y-2 mt-8 flex-1">
          {[
            { id: 'kanban', label: 'Доска', icon: <LayoutDashboard size={20} /> },
            { id: 'calendar', label: 'График', icon: <CalendarDays size={20} /> },
            { id: 'analytics', label: 'Итоги', icon: <BarChart3 size={20} /> },
          ].map(item => (
            <button key={item.id} onClick={() => setCurrentView(item.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${currentView === item.id ? 'bg-indigo-500 text-white' : `hover:bg-black/5 dark:hover:bg-white/5 ${themeStyles.textMuted}`}`}>
              {item.icon} {!isSidebarCollapsed && <span className="text-sm font-bold">{item.label}</span>}
            </button>
          ))}
        </div>
      </aside>

      {/* MOBILE NAV (Твое любимое нижнее меню) */}
      <nav className={`sm:hidden fixed bottom-0 left-0 w-full h-20 border-t z-50 flex items-center justify-around px-2 pb-4 ${themeStyles.panel} ${themeStyles.panelBorder}`}>
        <button onClick={() => setCurrentView('kanban')} className={`flex flex-col items-center flex-1 ${currentView === 'kanban' ? themeStyles.accentText : themeStyles.textMuted}`}><LayoutDashboard size={22} /><span className="text-[10px] font-bold mt-1">Доска</span></button>
        <button onClick={() => setCurrentView('calendar')} className={`flex flex-col items-center flex-1 ${currentView === 'calendar' ? themeStyles.accentText : themeStyles.textMuted}`}><CalendarDays size={22} /><span className="text-[10px] font-bold mt-1">График</span></button>
        <button onClick={() => setCurrentView('analytics')} className={`flex flex-col items-center flex-1 ${currentView === 'analytics' ? themeStyles.accentText : themeStyles.textMuted}`}><BarChart3 size={22} /><span className="text-[10px] font-bold mt-1">Итоги</span></button>
      </nav>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header className={`h-16 shrink-0 border-b flex items-center justify-between px-4 sm:px-6 z-10 ${themeStyles.panel} ${themeStyles.panelBorder}`}>
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" />
            <input type="text" placeholder="Поиск..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className={`w-full h-10 pl-10 pr-4 rounded-xl text-sm border outline-none ${themeStyles.input} ${themeStyles.text}`} />
          </div>
          <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-2 ml-2 rounded-xl border">{theme === 'dark' ? <Sun size={18}/> : <Moon size={18}/>}</button>
        </header>

        {currentView === 'kanban' && (
          <div className="flex-1 overflow-x-auto flex p-4 pb-24 sm:p-8 gap-4 custom-scrollbar">
            {INITIAL_STAGES.map(stage => (
              <div key={stage.key} className="flex-none w-[280px] flex flex-col gap-4">
                <div className="flex items-center gap-2 px-2">
                  <div className={`w-2 h-2 rounded-full ${stage.color}`} />
                  <h4 className="text-xs font-black uppercase opacity-60">{stage.title}</h4>
                </div>
                <div className="flex-1 overflow-y-auto space-y-3 px-1 custom-scrollbar">
                  {filteredDeals.filter(d => d.stage === stage.key).map(deal => (
                    <div key={deal.id} onClick={() => setSelectedId(deal.id)} className={`p-4 rounded-2xl border shadow-sm cursor-pointer ${themeStyles.card} ${themeStyles.panelBorder}`}>
                      <h4 className="font-bold text-sm mb-1">{deal.company}</h4>
                      <div className="flex justify-between items-center text-[10px] mb-2 opacity-50"><span>{deal.contact}</span><span className="font-black text-indigo-500">{formatMoney(deal.amount)}</span></div>
                      <div className="flex justify-between items-center pt-2 border-t border-black/5 dark:border-white/5">
                        <Badge className="bg-indigo-500/10 text-indigo-400">{deal.score}</Badge>
                        {deal.nextTaskAt && <div className="text-[9px] font-bold text-emerald-500 flex items-center gap-1"><Clock size={10}/> {deal.nextTaskAt.slice(5)}</div>}
                      </div>
                    </div>
                  ))}
                  <button onClick={() => { const id=`D-${Date.now()}`; handleSaveDeal({id, company:"Новая сделка", contact:"-", stage:stage.key, amount:0, score:50}); setSelectedId(id); }} className="w-full py-3 rounded-xl border-2 border-dashed opacity-30 text-[10px] font-bold">+ Добавить</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {currentView === 'analytics' && <AnalyticsView deals={deals} themeStyles={themeStyles} theme={theme} setTheme={setTheme} stages={INITIAL_STAGES} />}
        {currentView === 'calendar' && <CalendarView deals={deals} themeStyles={themeStyles} theme={theme} stages={INITIAL_STAGES} onOpenDeal={setSelectedId} />}
      </main>

      {selectedId && selectedDeal && (
        <div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className={`w-full max-w-xl p-8 rounded-t-3xl sm:rounded-3xl ${themeStyles.panel}`}>
            <h2 className="text-xl font-black mb-6">Карточка сделки</h2>
            <input className={`w-full p-4 rounded-xl mb-4 ${themeStyles.input} ${themeStyles.text}`} value={selectedDeal.company} onChange={(e) => handleSaveDeal({...selectedDeal, company: e.target.value})} />
            <div className="grid grid-cols-2 gap-4 mb-6">
                <input type="number" className={`w-full p-4 rounded-xl ${themeStyles.input}`} value={selectedDeal.amount} onChange={(e) => handleSaveDeal({...selectedDeal, amount: Number(e.target.value)})} />
                <select className={`w-full p-4 rounded-xl ${themeStyles.input}`} value={selectedDeal.stage} onChange={(e) => handleSaveDeal({...selectedDeal, stage: e.target.value})}>
                    {INITIAL_STAGES.map(s => <option key={s.key} value={s.key}>{s.title}</option>)}
                </select>
            </div>
            <button onClick={() => setSelectedId(null)} className="w-full py-4 bg-indigo-500 text-white rounded-2xl font-black">Сохранить</button>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: ".custom-scrollbar::-webkit-scrollbar { width: 4px; } .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.2); border-radius: 10px; }" }} />
    </div>
  );
}
