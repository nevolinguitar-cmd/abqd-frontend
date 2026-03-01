import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Search, Moon, Sun, Plus, CheckCircle2, AlertCircle, Clock, Zap, Bot, 
  BarChart3, X, User, Target, Phone, Trash2, PanelLeftClose, PanelLeftOpen, Cloud, 
  Check, PlusCircle, GripHorizontal, LayoutDashboard, CalendarDays, ChevronLeft, 
  ChevronRight, Users, Video, Briefcase, Bell, Globe, Link2, Settings, Lock, 
  RefreshCw, TrendingUp, Activity, PieChart, ArrowUpRight, ArrowDownRight, 
  ShieldAlert, Download, Filter, Sparkles, Send, BrainCircuit, ChevronDown, Flag
} from 'lucide-react';

/**
 * ABQD CRM — Универсальный Dashboard
 * Обновление: Аналитика полностью привязана к реальным данным карточек (Синхронизация).
 */

// ==========================================
// 1. КОНСТАНТЫ И ДАННЫЕ
// ==========================================

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

const MARKETING_SOURCES_LIST = ['Telegram Ads', 'SEO / Сайт', 'Холодный обзвон', 'Рефералка', 'Личные связи', 'Неизвестно'];

const getTodayDateStr = () => new Date().toISOString().split('T')[0];
const getTomorrowDateStr = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
};
const getPastDateStr = () => {
  const d = new Date();
  d.setDate(d.getDate() - 2); // Имитация просроченной задачи
  return d.toISOString().split('T')[0];
};

const INITIAL_DEALS = [
  {
    id: "D-1001", company: "SOVA Studio", contact: "Анастасия", stage: "inbox", 
    amount: 180000, currency: "RUB", score: 78, phone: "+7 900 111-22-33", email: "hello@sova.studio", 
    source: "Telegram Ads",
    fields: { budget: "180k", deadline: "", note: "Интерес к CRM-системе." }, tags: ["warm"], nextTaskAt: getTodayDateStr()
  },
  {
    id: "D-1002", company: "Nord Realty", contact: "Алексей", stage: "qual", 
    amount: 320000, currency: "RUB", score: 85, phone: "+7 900 444-55-66", email: "info@nord.re", 
    source: "SEO / Сайт",
    fields: { budget: "300k+", deadline: "март", note: "Нужен календарь встреч." }, tags: ["hot"], nextTaskAt: getPastDateStr()
  },
  {
    id: "D-1003", company: "TechFlow", contact: "Иван", stage: "won", 
    amount: 450000, currency: "RUB", score: 92, phone: "+7 999 123-45-67", email: "ivan@techflow.ru", 
    source: "Рефералка",
    fields: { budget: "450k", deadline: "февраль", note: "Оплата получена." }, tags: ["hot", "closed"], nextTaskAt: ""
  }
];

const DAYS_OF_WEEK = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
const MONTHS = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];

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
    calendarCellHover: 'hover:bg-[#1a1725]/50',
    chartBar: 'bg-indigo-500/20 border-indigo-500/50'
  },
  light: {
    bg: 'bg-[#F8FAFC]', panel: 'bg-white', panelBorder: 'border-slate-200',
    sidebar: 'bg-[#F1F5F9]', card: 'bg-white', cardHover: 'hover:bg-slate-50',
    text: 'text-slate-900', textMuted: 'text-slate-500', input: 'bg-slate-100 border-slate-200',
    accentGradient: 'bg-indigo-500',
    accentText: 'text-indigo-600',
    calendarCellHover: 'hover:bg-slate-50',
    chartBar: 'bg-indigo-100 border-indigo-300'
  }
}[theme]);

const Badge = ({ children, className = "" }) => (
  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition-all duration-300 ${className}`}>{children}</span>
);

// ==========================================
// 3. КОМПОНЕНТ АНАЛИТИКИ (MANAGEMENT DASHBOARD)
// ==========================================

const AnalyticsView = ({ deals, themeStyles, theme, stages }) => {
  const [accessRole, setAccessRole] = useState('owner'); 
  
  const [isAiHQOpen, setIsAiHQOpen] = useState(false);
  const [isMarketingOpen, setIsMarketingOpen] = useState(false);
  
  const [reflectionText, setReflectionText] = useState('');
  const [aiResponse, setAiResponse] = useState(null);
  const [isAiThinking, setIsAiThinking] = useState(false);

  // --- ДИНАМИЧЕСКИЕ МЕТРИКИ НА ОСНОВЕ РЕАЛЬНЫХ СДЕЛОК ---
  const metrics = useMemo(() => {
    const totalDeals = deals.length || 1; 
    const wonDeals = deals.filter(d => d.stage === 'won');
    const inboxDeals = deals.filter(d => d.stage === 'inbox');
    
    // Считаем реальную выручку
    const totalRevenue = wonDeals.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
    const avgCheck = wonDeals.length > 0 ? totalRevenue / wonDeals.length : 0;
    const winRate = (wonDeals.length / totalDeals) * 100;
    
    // Считаем просроченные задачи
    const today = new Date();
    today.setHours(0,0,0,0);
    const overdueCount = deals.filter(d => {
      if(d.stage === 'won') return false; // Завершенные сделки не просрочены
      if(!d.nextTaskAt) return false;
      const taskDate = new Date(d.nextTaskAt);
      return taskDate < today;
    }).length;

    return {
      totalRevenue,
      avgCheck,
      newLeads: inboxDeals.length,
      winRate: winRate.toFixed(1),
      wonCount: wonDeals.length,
      overdueCount
    };
  }, [deals]);

  // --- ДИНАМИЧЕСКАЯ ВОРОНКА ---
  const funnelStages = useMemo(() => {
    const totalDealsCount = deals.length || 1;
    return stages.map(stage => {
      const count = deals.filter(d => d.stage === stage.key).length;
      const sharePct = deals.length > 0 ? Math.round((count / totalDealsCount) * 100) : 0;
      return { 
        key: stage.key, 
        label: stage.title, 
        count: count, 
        conv: `${sharePct}%`, // Доля от всех сделок
        color: stage.color 
      };
    });
  }, [deals, stages]);

  // --- ДИНАМИЧЕСКИЙ МАРКЕТИНГ ---
  const marketingSources = useMemo(() => {
    const sourcesMap = {};
    deals.forEach(d => {
      const s = d.source || 'Неизвестно';
      if (!sourcesMap[s]) sourcesMap[s] = { name: s, leads: 0, won: 0, revenue: 0 };
      sourcesMap[s].leads += 1;
      if (d.stage === 'won') {
        sourcesMap[s].won += 1;
        sourcesMap[s].revenue += (Number(d.amount) || 0);
      }
    });

    return Object.values(sourcesMap)
      .sort((a, b) => b.leads - a.leads) // Сортируем по количеству лидов
      .map(src => {
        // Качество (Скор) - процент перехода из источника в оплату
        const quality = src.leads > 0 ? Math.round((src.won / src.leads) * 100) : 0;
        return {
          source: src.name,
          leads: src.leads,
          cac: 'Считается...', // CAC требует расходов, которых нет в CRM-карточке
          revenue: src.revenue,
          quality: quality
        };
      });
  }, [deals]);

  const targetRevenue = 1000000; // Цель продаж (План)
  const revenueProgress = Math.min((metrics.totalRevenue / targetRevenue) * 100, 100);
  const showFinancials = accessRole === 'owner' || accessRole === 'manager';

  const handleAiBrainstorm = () => {
    if (!reflectionText.trim()) return;
    setIsAiThinking(true);
    
    setTimeout(() => {
      const activeDeals = deals.filter(d => d.stage !== 'won' && d.stage !== 'lost');
      const hotDeals = activeDeals.filter(d => d.score >= 80).sort((a,b) => b.amount - a.amount);
      const totalActiveAmount = activeDeals.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
      
      const response = `Я проанализировал вашу воронку на данный момент. Сейчас в работе ${activeDeals.length} активных сделок на общую сумму ${formatMoney(totalActiveAmount)}.

💡 **Стратегический ответ на ваш запрос:**
Вы написали: "${reflectionText.length > 30 ? reflectionText.substring(0, 30) + '...' : reflectionText}". 
Опираясь на реальные данные, я вижу точки роста.

🚀 **Что делать прямо сейчас (Action Plan):**
1. **Быстрые деньги:** У вас ${hotDeals.length} "горячих" сделок. Самая крупная сейчас — это **${hotDeals[0]?.company || 'Нет горячих сделок'}** на сумму ${formatMoney(hotDeals[0]?.amount || 0)}. Свяжитесь с ними сегодня!
2. **Дисциплина:** В системе числится ${metrics.overdueCount} просроченных задач. Рекомендую поручить менеджеру разобрать их до конца дня.
3. **Маркетинг:** Обратите внимание, что источник "${marketingSources[0]?.source || 'Неизвестно'}" принес больше всего лидов (${marketingSources[0]?.leads || 0}). Возможно, стоит усилить туда бюджет.`;
      
      setAiResponse(response);
      setIsAiThinking(false);
    }, 2000);
  };

  return (
    <div className="flex flex-col h-full p-4 sm:p-8 overflow-y-auto custom-scrollbar gap-6">
      
      {/* HEADER АНАЛИТИКИ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className={`text-2xl font-black tracking-tight ${themeStyles.text}`}>Управление и Аналитика</h2>
          <p className={`text-xs font-medium mt-1 ${themeStyles.textMuted}`}>Данные синхронизированы с вашими реальными карточками сделок.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${themeStyles.panelBorder} ${themeStyles.panel}`}>
            <ShieldAlert size={14} className={themeStyles.textMuted} />
            <select 
              value={accessRole} onChange={(e) => setAccessRole(e.target.value)}
              className={`text-xs font-bold bg-transparent outline-none cursor-pointer ${themeStyles.text}`}
            >
              <option value="owner" className={theme === 'dark' ? 'bg-[#1b1828]' : ''}>Role: Owner (Владелец)</option>
              <option value="manager" className={theme === 'dark' ? 'bg-[#1b1828]' : ''}>Role: Manager (РОП)</option>
              <option value="sales" className={theme === 'dark' ? 'bg-[#1b1828]' : ''}>Role: Sales (Сотрудник)</option>
            </select>
          </div>
          {showFinancials && (
            <button className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${theme === 'dark' ? 'border-[#2a253a] hover:bg-white/5 text-slate-300' : 'border-slate-200 hover:bg-slate-50 text-slate-700'}`}>
              <Download size={14} /> Экспорт
            </button>
          )}
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className={`p-6 rounded-3xl border shadow-sm ${themeStyles.panelBorder} ${themeStyles.panel} relative overflow-hidden group`}>
          <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${themeStyles.accentText}`}><Target size={64} /></div>
          <p className={`text-[10px] font-black uppercase tracking-widest mb-2 ${themeStyles.textMuted}`}>Выручка (Оплачено)</p>
          <div className="flex items-end gap-3">
            <h3 className={`text-2xl font-black tracking-tighter ${showFinancials ? themeStyles.text : themeStyles.textMuted}`}>
              {showFinancials ? formatMoney(metrics.totalRevenue) : 'Скрыто'}
            </h3>
          </div>
          {showFinancials && (
            <div className="mt-4 h-1.5 w-full bg-slate-200 dark:bg-white/5 rounded-full overflow-hidden" title={`Цель: ${formatMoney(targetRevenue)}`}>
              <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${revenueProgress}%` }} />
            </div>
          )}
        </div>

        <div className={`p-6 rounded-3xl border shadow-sm ${themeStyles.panelBorder} ${themeStyles.panel}`}>
          <p className={`text-[10px] font-black uppercase tracking-widest mb-2 ${themeStyles.textMuted}`}>Новые Лиды (Входящие)</p>
          <div className="flex items-end gap-3">
            <h3 className={`text-2xl font-black tracking-tighter ${themeStyles.text}`}>{metrics.newLeads}</h3>
            {metrics.newLeads > 0 && <span className="flex items-center text-xs font-bold text-emerald-500 mb-1"><TrendingUp size={12} className="mr-1"/></span>}
          </div>
          <p className={`text-xs font-medium mt-3 ${themeStyles.textMuted}`}>Сделок в первом статусе</p>
        </div>

        <div className={`p-6 rounded-3xl border shadow-sm ${themeStyles.panelBorder} ${themeStyles.panel}`}>
          <p className={`text-[10px] font-black uppercase tracking-widest mb-2 ${themeStyles.textMuted}`}>Win Rate (Успех)</p>
          <div className="flex items-end gap-3">
            <h3 className={`text-2xl font-black tracking-tighter ${themeStyles.text}`}>{metrics.winRate}%</h3>
          </div>
          <p className={`text-xs font-medium mt-3 ${themeStyles.textMuted}`}>Оплачено: {metrics.wonCount} из {deals.length}</p>
        </div>

        <div className={`p-6 rounded-3xl border shadow-sm ${themeStyles.panelBorder} ${themeStyles.panel}`}>
          <p className={`text-[10px] font-black uppercase tracking-widest mb-2 ${themeStyles.textMuted}`}>Средний Чек</p>
          <div className="flex items-end gap-3">
            <h3 className={`text-2xl font-black tracking-tighter ${showFinancials ? themeStyles.text : themeStyles.textMuted}`}>
              {showFinancials ? formatMoney(metrics.avgCheck) : 'Скрыто'}
            </h3>
          </div>
          <p className={`text-xs font-medium mt-3 ${themeStyles.textMuted}`}>На основе успешных сделок</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ВОРОНКА (FUNNEL) */}
        <div className={`col-span-1 lg:col-span-2 p-6 rounded-3xl border shadow-sm ${themeStyles.panelBorder} ${themeStyles.panel}`}>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className={`font-black tracking-tight flex items-center gap-2 ${themeStyles.text}`}><Filter size={18} className={themeStyles.accentText} /> Воронка продаж</h3>
              <p className={`text-xs mt-1 ${themeStyles.textMuted}`}>Распределение ваших текущих сделок по этапам</p>
            </div>
          </div>
          
          <div className="space-y-4">
            {funnelStages.map((stage, idx) => {
              // Ищем максимум для расчета ширины полоски
              const maxCount = Math.max(...funnelStages.map(s => s.count)) || 1;
              const widthPct = Math.max((stage.count / maxCount) * 100, 5); 
              
              return (
                <div key={stage.key} className="flex items-center gap-4">
                  <div className={`w-32 sm:w-40 text-right text-xs font-bold ${themeStyles.textMuted} truncate`}>{stage.label}</div>
                  <div className="flex-1 flex items-center gap-3">
                    <div className="flex-1 h-8 bg-black/5 dark:bg-white/5 rounded-r-xl overflow-hidden flex items-center">
                      <div 
                        style={{ width: `${widthPct}%` }} 
                        className={`h-full ${stage.color} opacity-80 rounded-r-xl flex items-center justify-end pr-3 transition-all duration-1000`}
                      >
                        <span className="text-[10px] font-black text-white/90 drop-shadow-md">{stage.count}</span>
                      </div>
                    </div>
                    <div className={`w-12 text-xs font-black ${themeStyles.text}`}>{stage.conv}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ДИСЦИПЛИНА КОМАНДЫ */}
        <div className={`col-span-1 p-6 rounded-3xl border shadow-sm flex flex-col ${themeStyles.panelBorder} ${themeStyles.panel}`}>
          <div className="mb-6">
            <h3 className={`font-black tracking-tight flex items-center gap-2 ${themeStyles.text}`}><Activity size={18} className="text-rose-500" /> Дисциплина</h3>
            <p className={`text-xs mt-1 ${themeStyles.textMuted}`}>Проверка дат в карточках</p>
          </div>
          
          <div className="flex-1 flex flex-col justify-center space-y-5">
            <div className={`p-4 rounded-2xl border transition-colors ${metrics.overdueCount > 0 ? (theme === 'dark' ? 'bg-[#141120] border-rose-500/50' : 'bg-rose-50 border-rose-200') : themeStyles.input}`}>
              <div className="flex items-center justify-between mb-1">
                <span className={`text-xs font-bold ${metrics.overdueCount > 0 ? (theme === 'dark' ? 'text-rose-400' : 'text-rose-600') : themeStyles.text}`}>Просроченные задачи</span>
                <span className={`text-lg font-black ${metrics.overdueCount > 0 ? (theme === 'dark' ? 'text-rose-400' : 'text-rose-600') : themeStyles.text}`}>{metrics.overdueCount}</span>
              </div>
              <p className={`text-[10px] font-medium mt-1 ${metrics.overdueCount > 0 ? (theme === 'dark' ? 'text-rose-500/70' : 'text-rose-500') : themeStyles.textMuted}`}>Сделки с прошедшей датой контакта</p>
            </div>

            <div className={`p-4 rounded-2xl border ${themeStyles.input}`}>
              <div className="flex items-center justify-between mb-1">
                <span className={`text-xs font-bold ${themeStyles.text}`}>Всего активных</span>
                <span className={`text-lg font-black ${themeStyles.text}`}>{deals.length - metrics.wonCount}</span>
              </div>
              <p className={`text-[10px] font-medium mt-1 ${themeStyles.textMuted}`}>Сделок в работе сейчас</p>
            </div>
          </div>
        </div>
      </div>

      {/* МАРКЕТИНГ И ИСТОЧНИКИ (Выпадающий блок) */}
      <div className={`rounded-3xl border shadow-lg relative transition-all duration-500 ease-in-out ${themeStyles.panelBorder} ${themeStyles.panel} ${isMarketingOpen ? 'ring-2 ring-emerald-500/50' : `hover:border-emerald-500/50 ${theme === 'dark' ? 'bg-[#1b1828]/80' : 'bg-white'}`}`}>
        
        <div className={`absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-400 to-teal-500 opacity-90`} />

        <button 
          onClick={() => setIsMarketingOpen(!isMarketingOpen)}
          className="w-full p-6 sm:p-8 flex items-center justify-between text-left focus:outline-none group cursor-pointer"
        >
          <div className="flex items-center gap-4 sm:gap-5">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-500 shadow-inner ${theme === 'dark' ? 'bg-[#141120] text-emerald-400' : 'bg-emerald-50 text-emerald-600'} ${isMarketingOpen ? 'rotate-12 scale-110 shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 'group-hover:scale-105'}`}>
              <PieChart size={24} />
            </div>
            <div>
              <h3 className={`text-lg sm:text-xl font-black tracking-tight flex items-center gap-2 ${themeStyles.text}`}>
                Качество маркетинга (ROI / CAC)
              </h3>
              <p className={`text-xs sm:text-sm mt-1 font-medium ${themeStyles.textMuted}`}>
                Откуда приходят ваши реальные сделки и деньги.
              </p>
            </div>
          </div>
          <div className={`p-3 rounded-full border transition-all duration-500 shrink-0 ${isMarketingOpen ? 'rotate-180 bg-emerald-500/10 border-emerald-500/30 text-emerald-500' : `${themeStyles.panelBorder} ${themeStyles.textMuted} group-hover:bg-black/5 dark:group-hover:bg-white/5`}`}>
            <ChevronDown size={20} />
          </div>
        </button>

        {isMarketingOpen && (
          <div className="animate-in slide-in-from-top-4 fade-in duration-500">
            <div className={`w-full h-px ${themeStyles.panelBorder}`} />
            
            <div className="p-6 sm:p-8 overflow-x-auto custom-scrollbar">
              <table className="w-full min-w-[600px] text-left border-collapse">
                <thead>
                  <tr className={`border-b ${themeStyles.panelBorder}`}>
                    <th className={`pb-3 text-[10px] font-black uppercase tracking-widest ${themeStyles.textMuted}`}>Источник</th>
                    <th className={`pb-3 text-[10px] font-black uppercase tracking-widest ${themeStyles.textMuted}`}>Всего Лидов</th>
                    <th className={`pb-3 text-[10px] font-black uppercase tracking-widest ${themeStyles.textMuted}`}>Принесли выручки</th>
                    <th className={`pb-3 text-[10px] font-black uppercase tracking-widest ${themeStyles.textMuted}`}>Конверсия в оплату</th>
                  </tr>
                </thead>
                <tbody>
                  {marketingSources.map((src, idx) => (
                    <tr key={idx} className={`border-b last:border-0 transition-colors ${themeStyles.panelBorder} hover:bg-black/5 dark:hover:bg-white/5`}>
                      <td className={`py-4 text-sm font-bold ${themeStyles.text}`}>{src.source}</td>
                      <td className={`py-4 text-sm font-medium ${themeStyles.text}`}>{src.leads}</td>
                      <td className={`py-4 text-sm font-black ${showFinancials && src.revenue > 0 ? 'text-emerald-500' : themeStyles.textMuted}`}>{showFinancials ? formatMoney(src.revenue) : '***'}</td>
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-1.5 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${src.quality > 50 ? 'bg-emerald-500' : src.quality > 20 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${src.quality}%` }} />
                          </div>
                          <span className={`text-xs font-bold ${themeStyles.textMuted}`}>{src.quality}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* AI-ШТАБ СТРАТЕГИИ */}
      <div className={`rounded-3xl border shadow-lg relative transition-all duration-500 ease-in-out ${themeStyles.panelBorder} ${themeStyles.panel} ${isAiHQOpen ? 'ring-2 ring-indigo-500/50' : `hover:border-indigo-500/50 ${theme === 'dark' ? 'bg-[#1b1828]/80' : 'bg-white'}`}`}>
        
        <div className={`absolute top-0 left-0 w-full h-1.5 ${themeStyles.accentGradient} opacity-90`} />
        
        <button 
          onClick={() => setIsAiHQOpen(!isAiHQOpen)}
          className="w-full p-6 sm:p-8 flex items-center justify-between text-left focus:outline-none group cursor-pointer"
        >
          <div className="flex items-center gap-4 sm:gap-5">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-500 shadow-inner ${theme === 'dark' ? 'bg-[#141120] text-indigo-400' : 'bg-indigo-50 text-indigo-600'} ${isAiHQOpen ? 'rotate-12 scale-110 shadow-[0_0_20px_rgba(99,102,241,0.3)]' : 'group-hover:scale-105'}`}>
              <Sparkles size={24} />
            </div>
            <div>
              <h3 className={`text-lg sm:text-xl font-black tracking-tight flex items-center gap-2 ${themeStyles.text}`}>
                Штаб стратегии (AI-Аналитик)
                {!isAiHQOpen && <span className="hidden sm:inline-flex relative flex h-2 w-2 ml-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span></span>}
              </h3>
              <p className={`text-xs sm:text-sm mt-1 font-medium ${themeStyles.textMuted}`}>
                {isAiHQOpen 
                  ? "Свернуть панель стратегии" 
                  : "Обсудите с ИИ вашу реальную воронку и получите план действий."}
              </p>
            </div>
          </div>
          <div className={`p-3 rounded-full border transition-all duration-500 shrink-0 ${isAiHQOpen ? 'rotate-180 bg-indigo-500/10 border-indigo-500/30 text-indigo-500' : `${themeStyles.panelBorder} ${themeStyles.textMuted} group-hover:bg-black/5 dark:group-hover:bg-white/5`}`}>
            <ChevronDown size={20} />
          </div>
        </button>

        {isAiHQOpen && (
          <div className="animate-in slide-in-from-top-4 fade-in duration-500">
            <div className={`w-full h-px ${themeStyles.panelBorder}`} />
            
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 p-6 sm:p-8 pt-6">
              <div className="flex flex-col gap-4">
                <textarea 
                  value={reflectionText}
                  onChange={(e) => setReflectionText(e.target.value)}
                  placeholder="Например: У нас много зависших сделок. Что мы можем сделать с текущей базой прямо сейчас, чтобы закрыть план продаж?"
                  className={`w-full h-32 sm:h-40 p-5 rounded-2xl text-sm leading-relaxed border outline-none resize-none transition-all shadow-inner ${themeStyles.input} ${themeStyles.text} focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10`}
                />
                <button 
                  onClick={handleAiBrainstorm}
                  disabled={isAiThinking || !reflectionText.trim()}
                  className={`flex items-center justify-center gap-3 w-full py-4 rounded-2xl text-white font-black text-sm tracking-wide transition-all active:scale-[0.98] ${isAiThinking || !reflectionText.trim() ? 'opacity-50 cursor-not-allowed bg-slate-500' : themeStyles.accentGradient + ' shadow-[0_8px_20px_rgba(99,102,241,0.25)] hover:shadow-[0_12px_25px_rgba(99,102,241,0.35)] hover:-translate-y-0.5'}`}
                >
                  {isAiThinking ? <RefreshCw size={20} className="animate-spin" /> : <Send size={20} />}
                  {isAiThinking ? 'Анализирую ваши данные...' : 'Получить action-plan'}
                </button>
              </div>

              <div className={`p-6 sm:p-8 rounded-3xl border flex flex-col transition-all ${theme === 'dark' ? 'bg-[#141120]/80 border-indigo-500/20 shadow-[inset_0_0_30px_rgba(99,102,241,0.03)]' : 'bg-indigo-50/50 border-indigo-100 shadow-[inset_0_0_30px_rgba(99,102,241,0.05)]'}`}>
                {!aiResponse && !isAiThinking && (
                  <div className="flex-1 flex flex-col items-center justify-center opacity-40 text-center min-h-[150px]">
                    <BrainCircuit size={48} className={`mb-4 ${themeStyles.textMuted}`} />
                    <p className={`text-sm font-bold leading-relaxed ${themeStyles.textMuted}`}>
                      Опишите ситуацию слева, и я<br/>
                      проанализирую карточки на доске.
                    </p>
                  </div>
                )}
                
                {isAiThinking && (
                  <div className="flex-1 flex flex-col items-center justify-center text-center min-h-[150px]">
                    <div className="relative mb-5">
                       <Bot size={48} className={`animate-bounce ${theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'}`} />
                       <Sparkles size={20} className="absolute -top-2 -right-2 text-amber-400 animate-pulse" />
                    </div>
                    <p className={`text-sm font-black tracking-wide ${theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'}`}>Изучаю ваши метрики и сделки...</p>
                  </div>
                )}
                
                {aiResponse && !isAiThinking && (
                  <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 animate-in slide-in-from-bottom-4 fade-in duration-500">
                    <div className={`flex items-center gap-3 mb-5 pb-4 border-b ${theme === 'dark' ? 'border-white/10' : 'border-black/5'}`}>
                      <div className="p-2 rounded-lg bg-indigo-500/10">
                        <Bot size={20} className={themeStyles.accentText} />
                      </div>
                      <span className={`text-xs font-black uppercase tracking-[0.2em] ${themeStyles.text}`}>Решение ИИ-Стратега</span>
                    </div>
                    <div className={`text-sm whitespace-pre-wrap leading-relaxed ${themeStyles.text}`}>
                      {aiResponse.split('\n').map((line, i) => {
                        if (line.includes('**')) {
                          const parts = line.split('**');
                          return (
                            <p key={i} className="mb-3">
                              {parts.map((part, j) => j % 2 === 1 ? <strong key={j} className={`font-black ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{part}</strong> : part)}
                            </p>
                          );
                        }
                        return <p key={i} className="mb-3">{line}</p>;
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};


// ==========================================
// 4. КОМПОНЕНТЫ КАЛЕНДАРЯ
// ==========================================

const CalendarView = ({ deals, onOpenDeal, onAddDeal, themeStyles, theme, stages }) => {
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

  const leads = useMemo(() => {
    const y = currentDate.getFullYear();
    const m = currentDate.getMonth();
    return deals
      .filter(d => {
        if (!d.nextTaskAt) return false;
        const date = new Date(d.nextTaskAt);
        return date.getMonth() === m && date.getFullYear() === y;
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
  }, [deals, currentDate, stages]);

  const renderCalendarCells = () => {
    const cells = [];
    const todayStr = new Date().toISOString().split('T')[0];

    for (let i = 0; i < startDay; i++) {
      cells.push(<div key={`empty-${i}`} className={`min-h-[120px] p-2 border-b border-r ${themeStyles.panelBorder} opacity-20`} />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isToday = dateStr === todayStr;
      
      const dayLeads = leads.filter(l => l.day === day);

      cells.push(
        <div key={day} className={`min-h-[140px] p-3 border-b border-r ${themeStyles.panelBorder} ${themeStyles.calendarCellHover} transition-colors flex flex-col gap-2 relative`}>
          <div className="flex justify-between items-start mb-1">
            <span className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-indigo-500 text-white shadow-md' : themeStyles.textMuted}`}>
              {day}
            </span>
          </div>
          <div className="flex-1 flex flex-col gap-1.5 overflow-y-auto custom-scrollbar pr-1">
             {dayLeads.map(lead => (
              <div 
                key={lead.id} 
                onClick={(e) => { e.stopPropagation(); onOpenDeal(lead.id); }}
                className={`text-[10px] p-1.5 rounded-lg cursor-pointer transition-all border shadow-sm truncate flex items-center gap-1.5 ${theme === 'dark' ? 'bg-[#221f30] border-white/5 hover:border-indigo-500/50 text-slate-200' : 'bg-white border-slate-200 hover:border-indigo-500 text-slate-700'}`}
                title={`Открыть сделку: ${lead.client}`}
              >
                <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${lead.color === 'blue' ? 'bg-blue-500' : lead.color === 'emerald' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                <span className="font-bold truncate">{lead.client}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    
    const totalCells = cells.length;
    const remaining = (7 - (totalCells % 7)) % 7;
    for (let i = 0; i < remaining; i++) {
      cells.push(<div key={`empty-end-${i}`} className={`min-h-[120px] p-2 border-b border-r ${themeStyles.panelBorder} opacity-20`} />);
    }

    return cells;
  };

  return (
    <div className="flex flex-col h-full p-4 sm:p-8 overflow-hidden gap-6">
      
      {/* ПАНЕЛЬ УПРАВЛЕНИЯ КАЛЕНДАРЕМ */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3 sm:p-4 rounded-2xl sm:rounded-[24px] border ${themeStyles.panelBorder} ${themeStyles.panel} shadow-md relative z-40`}>
        <div className="flex items-center gap-3 sm:gap-5 px-1">
          <h2 className={`text-xl sm:text-2xl font-black min-w-[140px] sm:min-w-[180px] tracking-tight ${themeStyles.text}`}>
            {monthNames[month]} <span className={`font-medium ${themeStyles.textMuted}`}>{year}</span>
          </h2>
          <div className={`flex items-center rounded-xl border ${themeStyles.panelBorder} ${theme === 'dark' ? 'bg-[#141120]' : 'bg-slate-50'}`}>
            <button onClick={handlePrevMonth} className={`p-2 sm:p-2.5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors rounded-l-xl ${themeStyles.textMuted}`}><ChevronLeft size={18} /></button>
            <button onClick={handleToday} className={`px-3 py-2 sm:px-4 sm:py-2.5 text-[11px] sm:text-xs font-bold border-l border-r ${themeStyles.panelBorder} ${themeStyles.textMuted} hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors`}>Сегодня</button>
            <button onClick={handleNextMonth} className={`p-2 sm:p-2.5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors rounded-r-xl ${themeStyles.textMuted}`}><ChevronRight size={18} /></button>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3 w-full sm:w-auto relative">
          <button onClick={onAddDeal} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold transition-all shadow-md active:scale-95`}>
            <Plus size={16} /><span className="hidden sm:inline">Создать событие</span>
          </button>
        </div>
      </div>

      {/* ОСНОВНАЯ СЕТКА КАЛЕНДАРЯ */}
      <div className={`flex-1 rounded-2xl sm:rounded-[32px] border ${themeStyles.panelBorder} ${themeStyles.panel} shadow-xl overflow-hidden flex flex-col`}>
        <div className={`grid grid-cols-7 border-b backdrop-blur-md ${theme === 'dark' ? 'border-[#2a253a] bg-[#141120]/50' : 'border-slate-200 bg-slate-50/50'}`}>
          {dayNames.map(day => (
            <div key={day} className={`p-3 sm:p-4 text-center text-[10px] sm:text-xs font-black uppercase tracking-widest ${themeStyles.textMuted}`}>{day}</div>
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

const DealEditorModal = ({ deal, stages, themeStyles, onSave, onClose, onDelete, isSyncing, theme }) => {
  const [draft, setDraft] = useState(deal);

  useEffect(() => {
    if (JSON.stringify(draft) === JSON.stringify(deal)) return;
    const timer = setTimeout(() => onSave(draft), 600);
    return () => clearTimeout(timer);
  }, [draft, deal, onSave]);

  return (
    <div className="fixed inset-0 z-[999] flex items-end sm:items-center justify-center p-0 sm:p-6 bg-[#0f0c1b]/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="absolute inset-0 cursor-pointer hidden sm:block" onClick={onClose} />
      
      <aside className={`relative w-full max-w-2xl h-[100dvh] sm:h-auto sm:max-h-[90vh] overflow-hidden flex flex-col rounded-none sm:rounded-[32px] border-0 sm:border-2 shadow-2xl animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-300 ${themeStyles.panel} ${themeStyles.panelBorder}`}>
        
        <div className="p-4 sm:p-8 border-b border-white/5 flex items-center justify-between shrink-0">
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
                <div className="space-y-2 text-left sm:col-span-2 mt-2">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-30 px-1 flex items-center gap-1.5"><Flag size={12}/> Источник маркетинга</label>
                  <select value={draft.source || 'Неизвестно'} onChange={(e) => setDraft({...draft, source: e.target.value})} className={`w-full p-4 rounded-xl text-sm font-bold border outline-none transition-all ${themeStyles.input} ${themeStyles.text} focus:ring-2 focus:ring-indigo-500/20`}>
                    {MARKETING_SOURCES_LIST.map(s => <option key={s} value={s} className={themeStyles.panel}>{s}</option>)}
                  </select>
                  <p className="text-[10px] text-emerald-500 opacity-80 pl-2 mt-1">Определяет аналитику ROMI/CAC.</p>
                </div>
              </div>
          </div>

          <div className="space-y-4 sm:space-y-6 text-left">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-black uppercase tracking-widest opacity-30 flex items-center gap-2">Заметки (Для команды)</h3>
              </div>
              <textarea 
              value={draft.fields.note || ""} onChange={(e) => setDraft({...draft, fields: {...draft.fields, note: e.target.value}})} 
              placeholder="Описание сделки, детали звонков, договоренности..." 
              className={`w-full h-40 sm:h-52 p-4 sm:p-5 rounded-2xl text-sm leading-relaxed border outline-none resize-none transition-all ${themeStyles.input} ${themeStyles.text} focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10`} 
              />
          </div>
        </div>

        <div className="p-4 sm:p-8 border-t border-white/5 flex gap-4 shrink-0 pb-6 sm:pb-8">
          <button onClick={onClose} className={`w-full h-12 sm:h-14 rounded-xl sm:rounded-[24px] text-white font-bold text-sm transition-all active:scale-[0.98] ${theme === 'dark' ? 'bg-[#2a253a] hover:bg-[#352f44]' : 'bg-slate-800 hover:bg-slate-900'}`}>Сохранить и закрыть</button>
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

  const [currentView, setCurrentView] = useState('kanban'); 
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  const [deals, setDeals] = useState(INITIAL_DEALS);
  const [stages, setStages] = useState(INITIAL_STAGES);
  
  const [selectedId, setSelectedId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [toasts, setToasts] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);
  
  const [dragType, setDragType] = useState(null); 
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

  const handleSaveDeal = useCallback((updatedDeal) => {
    setIsSyncing(true);
    setDeals(prev => prev.map(d => d.id === updatedDeal.id ? updatedDeal : d));
    setTimeout(() => setIsSyncing(false), 400); 
  }, []);

  const handleAddDeal = (stageKey = 'inbox') => {
    const newId = `D-${Math.floor(Math.random() * 9000) + 1000}`;
    const newDeal = {
      id: newId, company: "Новая сделка", contact: "Контакт", stage: stageKey,
      amount: 0, currency: "RUB", score: 50, phone: "", email: "", source: "Неизвестно", fields: { budget: "", deadline: "", note: "" },
      tags: [], nextTaskAt: getTodayDateStr()
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
      return d.company.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [deals, searchQuery]);

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

        <div className="space-y-2 mb-6 mt-4 flex-1">
          <button 
            onClick={() => setCurrentView('kanban')}
            className={`w-full flex items-center rounded-xl transition-all duration-300 ${isSidebarCollapsed ? 'justify-center p-3' : 'gap-3 px-4 py-3'} ${currentView === 'kanban' ? 'bg-indigo-500 text-white shadow-md' : `hover:bg-black/5 dark:hover:bg-white/5 ${themeStyles.textMuted}`}`}
            title={isSidebarCollapsed ? "Доска" : ''}
          >
            <LayoutDashboard size={18} />
            {!isSidebarCollapsed && <span className="text-sm font-bold">Доска</span>}
          </button>
          
          <button 
            onClick={() => setCurrentView('calendar')}
            className={`w-full flex items-center rounded-xl transition-all duration-300 ${isSidebarCollapsed ? 'justify-center p-3' : 'gap-3 px-4 py-3'} ${currentView === 'calendar' ? 'bg-indigo-500 text-white shadow-md' : `hover:bg-black/5 dark:hover:bg-white/5 ${themeStyles.textMuted}`}`}
            title={isSidebarCollapsed ? "Календарь" : ''}
          >
            <CalendarDays size={18} />
            {!isSidebarCollapsed && <span className="text-sm font-bold">Календарь</span>}
          </button>

          <button 
            onClick={() => setCurrentView('analytics')}
            className={`w-full flex items-center rounded-xl transition-all duration-300 ${isSidebarCollapsed ? 'justify-center p-3' : 'gap-3 px-4 py-3'} ${currentView === 'analytics' ? 'bg-indigo-500 text-white shadow-md' : `hover:bg-black/5 dark:hover:bg-white/5 ${themeStyles.textMuted}`}`}
            title={isSidebarCollapsed ? "Аналитика" : ''}
          >
            <BarChart3 size={18} />
            {!isSidebarCollapsed && <span className="text-sm font-bold">Аналитика</span>}
          </button>
        </div>

        <div className={`w-full h-px ${themeStyles.panelBorder} border-t mb-4`} />

        <div className="mt-auto pb-4 flex justify-center pt-4">
           <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-3 rounded-2xl hover:bg-black/5 dark:hover:bg-white/5 transition-all group flex items-center justify-center">
              {theme === 'dark' ? <Sun size={20} className="text-amber-500/40 group-hover:text-amber-400 transition-colors duration-300" /> : <Moon size={20} className="text-indigo-500/50 group-hover:text-indigo-500 transition-colors duration-300" />}
           </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col min-w-0 relative overflow-hidden">
        
        {/* HEADER */}
        {currentView !== 'analytics' && (
          <header className={`h-16 border-b flex items-center justify-between px-4 sm:px-6 z-10 transition-colors ${themeStyles.panel} ${themeStyles.panelBorder} backdrop-blur-md bg-opacity-80`}>
            <div className="flex items-center gap-4 flex-1 max-w-xl">
              <div className="relative w-full">
                <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40 ${themeStyles.textMuted}`} />
                <input type="text" placeholder={currentView === 'kanban' ? "Поиск по доске..." : "Поиск по событиям..."} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full h-10 pl-10 sm:pl-12 pr-4 rounded-xl text-sm border outline-none transition-all ${themeStyles.input} ${themeStyles.text} focus:border-indigo-500/30 focus:bg-[#1C1929]`} />
              </div>
            </div>
            <div className="flex items-center gap-3">
               {isSyncing && (
                 <div className="hidden sm:flex items-center gap-2 text-[10px] font-bold text-indigo-400 animate-pulse mr-4 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                   <Cloud size={14} /> <span>Синхронизация</span>
                 </div>
               )}
            </div>
          </header>
        )}

        {/* DYNAMIC VIEW SWITCHER */}
        {currentView === 'kanban' && (
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
                          <h3 onClick={() => { setEditingStageKey(stage.key); setRenameValue(stage.title); }} className={`font-bold text-sm uppercase tracking-wider truncate cursor-text hover:text-indigo-400 transition-colors ${themeStyles.textMuted}`}>{stage.title}</h3>
                        )}
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover/col:opacity-100 transition-opacity">
                        <button onClick={() => handleDeleteStage(stage.key)} className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded-md transition-colors cursor-pointer" title="Удалить этап"><Trash2 size={14} /></button>
                        <button onClick={() => handleAddDeal(stage.key)} className="p-1.5 text-indigo-400 hover:bg-indigo-500/10 rounded-md transition-colors cursor-pointer" title="Добавить сделку"><Plus size={16} /></button>
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
                          className={`group/card p-4 rounded-xl border cursor-grab active:cursor-grabbing transition-all duration-200 hover:shadow-lg ${selectedId === deal.id ? 'border-indigo-500/50 bg-indigo-500/5 ring-1 ring-indigo-500/20' : isDragged ? 'opacity-50 border-indigo-500/50 bg-indigo-500/10 ring-2 ring-indigo-500/20' : `${themeStyles.card} ${themeStyles.panelBorder} ${themeStyles.cardHover} shadow-sm`}`}>
                          
                          <div className="flex justify-between items-start mb-2 text-left">
                            <h4 className={`font-bold text-sm truncate pr-2 ${themeStyles.text}`}>{deal.company}</h4>
                            <Badge className={score.color}>{deal.score}</Badge>
                          </div>
                          <div className="flex items-center justify-between text-[11px] mb-3 text-left">
                            <span className={themeStyles.textMuted}>{deal.contact}</span>
                            <span className={`font-bold tracking-tight ${themeStyles.accentText}`}>{formatMoney(deal.amount)}</span>
                          </div>
                          
                          <div className="flex items-center gap-2 pt-3 border-t border-black/5 dark:border-white/5">
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
        )}

        {currentView === 'calendar' && (
          <CalendarView 
            deals={filteredDeals} 
            onOpenDeal={(id) => setSelectedId(id)} 
            onAddDeal={() => handleAddDeal('inbox')}
            themeStyles={themeStyles} 
            theme={theme} 
            stages={stages}
          />
        )}

        {currentView === 'analytics' && (
          <AnalyticsView 
            deals={deals} 
            themeStyles={themeStyles} 
            theme={theme} 
            stages={stages}
          />
        )}
      </main>

      {/* MODAL EDITOR */}
      {selectedDeal && (
        <DealEditorModal 
          deal={selectedDeal} stages={stages} themeStyles={themeStyles} theme={theme} isSyncing={isSyncing}
          onSave={handleSaveDeal} onClose={() => setSelectedId(null)} onDelete={handleDeleteDeal}
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
