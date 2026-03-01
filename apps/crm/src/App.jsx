
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
  Copy, Smartphone, Workflow
} from 'lucide-react';

const Badge = ({ children, className = "" }) => (
  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition-all duration-300 ${className}`}>{children}</span>
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

const INITIAL_FLOWS = [
  {
    id: "flow_101", name: "Создать лид (Базовый)", category: "crm", is_active: true,
    entry: { command: "/lead", keywords: [] },
    nodes: [
      { id: "q1", type: "text", key: "company", title: "Какая компания?", required: true, next: "q2" },
      { id: "q2", type: "text", key: "contact", title: "Имя контактного лица?", required: false, next: "q3" },
      { id: "q3", type: "date", key: "nextTaskAt", title: "Дата следующего действия?", required: false, next: "done" },
      { id: "done", type: "action", action: "create_deal" }
    ],
    created_at: Date.now() - 86400000, updated_at: Date.now(), version: 1
  }
];

const FLOW_CATEGORIES = [
  { id: 'crm', label: 'CRM (Продажи)' },
  { id: 'support', label: 'Поддержка' },
  { id: 'sales', label: 'Маркетинг' }
];

const DAYS_OF_WEEK = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
const MONTHS = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];

const formatMoney = (amount) => new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB", maximumFractionDigits: 0 }).format(amount || 0);

const getScoreInfo = (score) => {
  if (score >= 85) return { text: "Горячий", color: "text-orange-500 bg-orange-500/10 border-orange-500/20" };
  if (score >= 70) return { text: "Тёплый", color: "text-amber-500 bg-amber-500/10 border-amber-500/20" };
  return { text: "Холодный", color: "text-cyan-500 bg-cyan-500/10 border-cyan-500/20" };
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
  dark: { bg: 'bg-[#18181b]', panel: 'bg-[#222226]/95 backdrop-blur-xl', panelBorder: 'border-white/[0.06]', sidebar: 'bg-[#18181b]/80 backdrop-blur-2xl', card: 'bg-white/[0.03]', cardHover: 'hover:bg-white/[0.06] hover:shadow-[0_8px_30px_rgba(0,0,0,0.3)] hover:border-white/[0.08]', text: 'text-zinc-100', textMuted: 'text-zinc-400', input: 'bg-white/[0.03] border-white/[0.05] focus:bg-white/[0.06] focus:border-indigo-500/50 hover:bg-white/[0.05] focus:ring-4 focus:ring-indigo-500/10', accentGradient: 'bg-gradient-to-r from-indigo-500 to-violet-600', accentText: 'text-indigo-400', calendarCellHover: 'hover:bg-white/[0.03]' },
  light: { bg: 'bg-[#f8fafc]', panel: 'bg-white/95 backdrop-blur-xl', panelBorder: 'border-slate-200/50', sidebar: 'bg-[#f8fafc]/80 backdrop-blur-2xl', card: 'bg-white', cardHover: 'hover:bg-slate-50/80 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:border-indigo-500/20', text: 'text-slate-900', textMuted: 'text-slate-500', input: 'bg-black/[0.02] border-black/[0.04] focus:bg-white focus:border-indigo-400/50 hover:bg-black/[0.04] focus:ring-4 focus:ring-indigo-500/10', accentGradient: 'bg-gradient-to-r from-indigo-500 to-violet-600', accentText: 'text-indigo-600', calendarCellHover: 'hover:bg-slate-50' }
}[theme]);

// ==========================================
// BotFlowsView (БЕЗ ИЗМЕНЕНИЙ)
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
      id: `flow_${Date.now()}`, name: "Новый сценарий", category: activeTab, is_active: false,
      entry: { command: "/new_command", keywords: [] },
      nodes: [{ id: "q1", type: "text", key: "question", title: "Ваш вопрос?", required: true, next: "done" }, { id: "done", type: "action", action: "create_deal" }],
      created_at: Date.now(), updated_at: Date.now(), version: 1
    });
    setEditingFlowId('new');
  };

  const handleEdit = (flow) => { setEditingData(JSON.parse(JSON.stringify(flow))); setEditingFlowId(flow.id); };
  const handleSave = () => {
    if (editingFlowId === 'new') setFlows([...flows, editingData]);
    else setFlows(flows.map(f => f.id === editingData.id ? editingData : f));
    setEditingFlowId(null); setEditingData(null);
  };
  const handleDelete = (id) => { if(window.confirm("Удалить сценарий?")) setFlows(flows.filter(f => f.id !== id)); };
  const handleToggleStatus = (id) => setFlows(flows.map(f => f.id === id ? { ...f, is_active: !f.is_active } : f));
  const generateTgLink = () => { setIsLinking(true); setTimeout(() => { setTgLinkToken(Math.random().toString(36).substring(2, 10)); setIsLinking(false); }, 600); };

  if (editingFlowId && editingData) {
    return (
      <div className="flex flex-col h-full p-4 pb-32 sm:pb-8 sm:p-8 overflow-y-auto custom-scrollbar gap-6 animate-in fade-in duration-300">
        <div className="flex items-center justify-between">
          <button onClick={() => setEditingFlowId(null)} className={`flex items-center gap-2 text-sm font-bold transition-colors ${themeStyles.textMuted} hover:${themeStyles.text}`}><ArrowLeft size={16} /> Назад</button>
          <button onClick={handleSave} className={`px-5 py-2.5 rounded-xl text-white font-bold text-sm shadow-lg shadow-indigo-500/20 hover:-translate-y-0.5 transition-all ${themeStyles.accentGradient}`}>Сохранить</button>
        </div>
        <div className={`p-6 sm:p-8 rounded-[2rem] border ${themeStyles.panelBorder} ${themeStyles.panel} shadow-md`}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="space-y-2"><label className="text-[10px] font-black uppercase opacity-40">Название</label><input value={editingData.name} onChange={e => setEditingData({...editingData, name: e.target.value})} className={`w-full p-3.5 rounded-xl border outline-none font-bold text-sm ${themeStyles.input} ${themeStyles.text}`} /></div>
            <div className="space-y-2"><label className="text-[10px] font-black uppercase opacity-40">Команда TG</label><input value={editingData.entry.command} onChange={e => setEditingData({...editingData, entry: { ...editingData.entry, command: e.target.value }})} className={`w-full p-3.5 rounded-xl border outline-none font-bold text-sm text-indigo-500 ${themeStyles.input}`} /></div>
            <div className="space-y-2"><label className="text-[10px] font-black uppercase opacity-40">Категория</label><select value={editingData.category} onChange={e => setEditingData({...editingData, category: e.target.value})} className={`w-full p-3.5 rounded-xl border outline-none font-bold text-sm ${themeStyles.input} ${themeStyles.text} [&>option]:bg-white dark:[&>option]:bg-[#222226]`}>{FLOW_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}</select></div>
          </div>
        </div>
        <div className={`p-6 sm:p-8 rounded-[2rem] border ${themeStyles.panelBorder} ${themeStyles.panel} shadow-md`}>
          <div className="space-y-4">
            {editingData.nodes.map((node, index) => {
              const isAction = node.type === 'action';
              return (
                <div key={node.id} className={`p-5 rounded-2xl border flex gap-4 ${isAction ? 'bg-indigo-500/5 border-indigo-500/30' : themeStyles.card + ' ' + themeStyles.panelBorder}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-black text-xs ${isAction ? 'bg-indigo-500 text-white' : 'bg-black/10 dark:bg-white/10 ' + themeStyles.text}`}>{index + 1}</div>
                  <div className="flex-1 space-y-4">
                    <div className="flex justify-between">
                      <select value={node.type} onChange={(e) => { const newNodes = [...editingData.nodes]; newNodes[index].type = e.target.value; if (e.target.value === 'action') newNodes[index].action = 'create_deal'; setEditingData({...editingData, nodes: newNodes}); }} className={`p-2 rounded-lg border outline-none font-bold text-xs ${isAction ? 'bg-indigo-500 text-white border-transparent' : themeStyles.input + ' ' + themeStyles.text} [&>option]:bg-white dark:[&>option]:bg-[#222226]`}>
                        <option value="text">Текст (Ответ)</option><option value="date">Дата</option><option value="choice">Выбор (Кнопки)</option><option value="action">Действие (Финал)</option>
                      </select>
                      <button onClick={() => { const newNodes = editingData.nodes.filter((_, i) => i !== index); setEditingData({...editingData, nodes: newNodes}); }} className="text-rose-500 opacity-50 hover:opacity-100 p-1"><Trash2 size={16}/></button>
                    </div>
                    {!isAction ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <input placeholder="Текст вопроса..." value={node.title || ''} onChange={(e) => { const newNodes = [...editingData.nodes]; newNodes[index].title = e.target.value; setEditingData({...editingData, nodes: newNodes}); }} className={`w-full p-3 rounded-xl border outline-none font-medium text-sm ${themeStyles.input} ${themeStyles.text}`} />
                        <div className="flex gap-4 items-center">
                          <input placeholder="Ключ (напр. company)" value={node.key || ''} onChange={(e) => { const newNodes = [...editingData.nodes]; newNodes[index].key = e.target.value; setEditingData({...editingData, nodes: newNodes}); }} className={`flex-1 p-3 rounded-xl border outline-none font-mono text-xs ${themeStyles.input} ${themeStyles.textMuted}`} />
                          <label className={`flex items-center gap-2 text-xs font-bold cursor-pointer ${themeStyles.text}`}><input type="checkbox" checked={node.required || false} onChange={(e) => { const newNodes = [...editingData.nodes]; newNodes[index].required = e.target.checked; setEditingData({...editingData, nodes: newNodes}); }} className="w-4 h-4 rounded text-indigo-500" /> Обязательно</label>
                        </div>
                      </div>
                    ) : (
                      <select value={node.action} onChange={(e) => { const newNodes = [...editingData.nodes]; newNodes[index].action = e.target.value; setEditingData({...editingData, nodes: newNodes}); }} className={`p-2 rounded-lg border outline-none font-mono text-xs bg-transparent border-indigo-500/30 text-indigo-500 [&>option]:bg-white dark:[&>option]:bg-[#222226]`}>
                        <option value="create_deal">Создать сделку в CRM</option><option value="log_support">Оставить тикет (Support)</option>
                      </select>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <button onClick={() => { const newNode = { id: `q${Date.now()}`, type: "text", key: "new_key", title: "Новый вопрос", required: false, next: "done" }; const nodes = [...editingData.nodes]; if (nodes.length > 0 && nodes[nodes.length - 1].type === 'action') { nodes.splice(nodes.length - 1, 0, newNode); } else { nodes.push(newNode); } setEditingData({...editingData, nodes}); }} className="mt-6 w-full py-4 rounded-xl border-2 border-dashed border-indigo-500/20 text-indigo-500 font-bold text-sm hover:bg-indigo-500/5 transition-all flex items-center justify-center gap-2"><Plus size={18} /> Добавить шаг</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full p-4 pb-32 sm:pb-8 sm:p-8 overflow-y-auto custom-scrollbar gap-8 animate-in fade-in duration-300">
      <div className="flex flex-col lg:flex-row justify-between gap-6 items-start lg:items-center">
        <div><h2 className={`text-2xl sm:text-3xl font-black ${themeStyles.text}`}>Боты и Сценарии</h2></div>
        <div className={`p-4 rounded-2xl border flex items-center gap-4 ${themeStyles.panelBorder} ${theme === 'dark' ? 'bg-indigo-500/10' : 'bg-indigo-50'}`}>
           <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-indigo-500 text-white flex items-center justify-center"><Smartphone size={20} /></div><div><h4 className={`text-sm font-black ${themeStyles.text}`}>Telegram Бот</h4><p className="text-[10px] font-bold text-indigo-500 uppercase">@abqd_robot</p></div></div>
           {!tgLinkToken ? <button onClick={generateTgLink} disabled={isLinking} className="px-5 py-2.5 rounded-xl bg-white dark:bg-[#222226] border border-black/5 dark:border-white/5 shadow-sm text-sm font-bold text-indigo-500">{isLinking ? 'Генерация...' : 'Получить ссылку'}</button> : <div className="flex items-center gap-2 bg-white dark:bg-[#18181b] p-2 rounded-xl border border-indigo-500/30"><input readOnly value={`https://t.me/abqd_robot?start=${tgLinkToken}`} className="bg-transparent outline-none text-xs font-mono text-indigo-500 w-48 px-2" /><button onClick={() => alert('Скопировано!')} className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500"><Copy size={14}/></button></div>}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <button onClick={handleCreateNew} className={`min-h-[180px] rounded-[2rem] border-2 border-dashed flex flex-col items-center justify-center gap-3 hover:-translate-y-1 ${themeStyles.panelBorder} ${themeStyles.panel}`}><Plus size={24} className="text-indigo-500" /><span className={`text-sm font-black ${themeStyles.text}`}>Создать сценарий</span></button>
        {filteredFlows.map(flow => (
          <div key={flow.id} className={`p-6 rounded-[2rem] border flex flex-col justify-between hover:-translate-y-1 ${themeStyles.panelBorder} ${themeStyles.card}`}>
            <div>
              <div className="flex justify-between items-start mb-4">
                <div className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold ${flow.is_active ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-500/10 text-slate-500'}`}>{flow.entry.command}</div>
                <button onClick={() => handleToggleStatus(flow.id)} className={`p-1.5 rounded-full ${flow.is_active ? 'text-emerald-500' : 'text-slate-400'}`}>{flow.is_active ? <Pause size={20}/> : <Play size={20}/>}</button>
              </div>
              <h3 className={`text-lg font-black mb-2 ${themeStyles.text}`}>{flow.name}</h3>
              <p className={`text-xs font-bold ${themeStyles.textMuted} mb-4 flex items-center gap-1.5`}><Workflow size={12}/> {flow.nodes.length} шагов</p>
            </div>
            <div className="flex items-center gap-3 pt-4 border-t border-black/5 dark:border-white/5">
              <button onClick={() => handleEdit(flow)} className="flex-1 py-2.5 rounded-xl bg-indigo-500/10 text-indigo-500 font-bold text-xs flex items-center justify-center gap-2"><Edit3 size={14} /> Настроить</button>
              <button onClick={() => handleDelete(flow.id)} className="p-2.5 rounded-xl bg-rose-500/10 text-rose-500"><Trash2 size={16} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ==========================================
// AnalyticsView (БЕЗ ИЗМЕНЕНИЙ)
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
    return { totalRevenue, totalActiveAmount, avgCheck: won.length > 0 ? totalRevenue / won.length : 0, winRate: ((won.length / totalCount) * 100).toFixed(1), avgTouches: avgTouches.toFixed(1) };
  }, [deals]);

  const stageStats = useMemo(() => stages.map(s => {
    const stageDeals = deals.filter(d => d.stage === s.key);
    const sum = stageDeals.reduce((acc, d) => acc + (Number(d.amount) || 0), 0);
    return { key: s.key, label: s.title, sum, count: stageDeals.length, color: s.color };
  }), [deals, stages]);

  const marketingSources = useMemo(() => {
    const sourcesMap = {};
    deals.forEach(d => {
      const s = d.source || 'Неизвестно';
      if (!sourcesMap[s]) sourcesMap[s] = { name: s, leads: 0, revenue: 0 };
      sourcesMap[s].leads += 1;
      if (d.stage === 'won') sourcesMap[s].revenue += (Number(d.amount) || 0);
    });
    return Object.values(sourcesMap).sort((a,b) => b.leads - a.leads);
  }, [deals]);

  const goalProgress = Math.min((metrics.totalRevenue / (revenueGoal || 1)) * 100, 100).toFixed(1);

  const handleAiBrainstorm = () => {
    if (!reflectionText.trim()) return;
    setIsAiThinking(true);
    setTimeout(() => {
      setAiResponse(`💡 АНАЛИЗ ПЕРСПЕКТИВ И ИДЕИ:\n\n1. Выявление зависшего капитала: Основной объем средств (${formatMoney(metrics.totalActiveAmount)}) сейчас находится в воронке. Идея: предложите клиентам тестовый доступ.\n\n2. Лидеры привлечения: Источник "${marketingSources[0]?.name || 'Текущий топ'}" дает лучшую конверсию. Переведите 20% бюджета сюда.`);
      setIsAiThinking(false);
    }, 2000);
  };

  return (
    <div className="flex flex-col h-full p-4 pb-32 sm:pb-8 sm:p-8 overflow-y-auto custom-scrollbar gap-8">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div><h2 className={`text-2xl sm:text-3xl font-black ${themeStyles.text}`}>Аналитика и Цели</h2></div>
      </div>

      <div className={`rounded-[2rem] border shadow-xl overflow-hidden ${themeStyles.panelBorder} ${themeStyles.panel} relative`}>
        <div className="absolute top-0 left-0 w-full h-1.5 bg-indigo-500" />
        <button onClick={() => setIsAiHQOpen(!isAiHQOpen)} className="w-full p-6 sm:p-8 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${theme === 'dark' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}><Bot size={28} /></div>
            <div className="text-left"><h3 className={`text-xl font-black ${themeStyles.text}`}>AI-Помощник</h3></div>
          </div>
          <ChevronDown size={20} className={`transition-transform ${isAiHQOpen ? 'rotate-180' : ''}`} />
        </button>
        {isAiHQOpen && (
          <div className="p-6 sm:p-8 pt-0 grid grid-cols-1 md:grid-cols-5 gap-8">
            <div className="space-y-5 md:col-span-2 flex flex-col">
              <textarea value={reflectionText} onChange={(e) => setReflectionText(e.target.value)} placeholder="Например: Как быстрее закрыть сделки?" className={`flex-1 w-full min-h-[120px] p-5 rounded-2xl border outline-none text-sm resize-none ${themeStyles.input} ${themeStyles.text}`} />
              <button onClick={handleAiBrainstorm} disabled={isAiThinking} className="w-full py-4 rounded-2xl bg-indigo-500 text-white font-black hover:opacity-90">{isAiThinking ? 'Анализирую...' : 'Сгенерировать идеи'}</button>
            </div>
            <div className={`md:col-span-3 p-6 sm:p-8 rounded-[2rem] border flex flex-col justify-center ${theme === 'dark' ? 'bg-[#141419]/50 border-white/5' : 'bg-indigo-50/50 border-indigo-100'}`}>
              <p className={`text-sm leading-relaxed font-medium whitespace-pre-wrap ${themeStyles.text}`}>{aiResponse || "Задайте вопрос слева. Я изучу все карточки на доске."}</p>
            </div>
          </div>
        )}
      </div>

      <div className={`p-6 sm:p-8 rounded-[2rem] border shadow-lg relative overflow-hidden ${themeStyles.panelBorder} ${themeStyles.panel}`}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 relative z-10">
          <div><h3 className={`text-xl font-black flex items-center gap-2 ${themeStyles.text}`}>Прогресс выполнения плана</h3></div>
          <div className="flex items-center gap-3 bg-black/5 dark:bg-white/5 p-2 rounded-2xl"><span className={`text-[10px] font-black uppercase ${themeStyles.textMuted} pl-3`}>План:</span><input type="number" value={revenueGoal} onChange={(e) => setRevenueGoal(Number(e.target.value))} className={`w-32 px-4 py-2 text-sm font-black rounded-xl border outline-none ${themeStyles.input} ${themeStyles.text}`} /></div>
        </div>
        <div className="relative z-10">
          <div className="flex items-end justify-between mb-4"><span className="text-4xl sm:text-5xl font-black text-emerald-500 tracking-tighter">{formatMoney(metrics.totalRevenue)}</span><span className={`text-2xl font-black ${themeStyles.text}`}>{goalProgress}%</span></div>
          <div className="w-full h-4 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden p-0.5"><div style={{ width: `${goalProgress}%` }} className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all duration-1000" /></div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        {[ { label: 'Потенциал в работе', val: formatMoney(metrics.totalActiveAmount), color: 'text-indigo-500', Icon: Zap }, { label: 'Средний чек', val: formatMoney(metrics.avgCheck), color: themeStyles.text, Icon: CreditCard }, { label: 'Win Rate', val: metrics.winRate + '%', color: 'text-amber-500', Icon: Activity } ].map((m, i) => (
          <div key={i} className={`p-6 rounded-[2rem] border ${themeStyles.panelBorder} ${themeStyles.panel} shadow-sm group hover:-translate-y-1 transition-transform`}><div className="flex justify-between mb-4"><p className={`text-[10px] font-black uppercase tracking-widest ${themeStyles.textMuted}`}>{m.label}</p><div className={`p-2 rounded-xl bg-black/5 dark:bg-white/5 ${m.color}`}><m.Icon size={16} /></div></div><h3 className={`text-2xl sm:text-3xl font-black tracking-tighter ${m.color}`}>{m.val}</h3></div>
        ))}
      </div>

      <div className={`rounded-[2rem] border shadow-xl overflow-hidden ${themeStyles.panelBorder} ${themeStyles.panel}`}>
        <div className={`w-full h-1.5 bg-gradient-to-r from-blue-400 to-indigo-500`} />
        <button onClick={() => setIsDynamicsOpen(!isDynamicsOpen)} className="w-full p-6 sm:p-8 flex items-center justify-between"><div className="flex items-center gap-5"><div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${theme === 'dark' ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600'}`}><BarChart2 size={28} /></div><div className="text-left"><h3 className={`text-xl font-black ${themeStyles.text}`}>Матрица потенциала</h3></div></div><ChevronDown size={20} className={`transition-transform ${isDynamicsOpen ? 'rotate-180' : ''}`} /></button>
        {isDynamicsOpen && (
          <div className="p-6 sm:p-8 pt-0 grid grid-cols-1 xl:grid-cols-2 gap-10 mt-2 border-t border-black/5 dark:border-white/5">
            <div className="flex flex-col mt-6">
              <h4 className={`text-[10px] font-black uppercase tracking-widest opacity-60 mb-8 flex items-center gap-2 ${themeStyles.text}`}><BarChart3 size={14}/> График перспектив</h4>
              <div className="flex items-end justify-between gap-3 h-56 pb-2 border-b border-black/10 dark:border-white/10 mt-auto">
                {stageStats.filter(s => s.key !== 'won').map((s, i) => {
                  const maxVal = Math.max(...stageStats.filter(x => x.key !== 'won').map(x => x.sum)) || 1;
                  const height = Math.max((s.sum / maxVal) * 100, 5); 
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center justify-end relative h-full group">
                      <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-800 dark:bg-white text-white dark:text-zinc-900 text-[10px] font-bold px-3 py-1.5 rounded-lg whitespace-nowrap shadow-lg z-10 pointer-events-none">{formatMoney(s.sum)}</div>
                      <div style={{ height: `${height}%` }} className={`w-full max-w-[48px] rounded-t-2xl ${s.color} opacity-80 group-hover:opacity-100 transition-all duration-700`} />
                      <span className={`text-[10px] font-bold mt-4 text-center truncate w-full ${themeStyles.textMuted}`}>{s.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="mt-6">
              <h4 className={`text-[10px] font-black uppercase tracking-widest opacity-60 mb-6 flex items-center gap-2 ${themeStyles.text}`}><Activity size={14}/> Динамика (Касания)</h4>
              <div className="space-y-4 overflow-y-auto max-h-[280px] custom-scrollbar pr-2">
                {deals.filter(d => d.stage !== 'won').sort((a,b) => (b.touches || 0) - (a.touches || 0)).map((d) => (
                  <div key={d.id} className={`p-4 rounded-2xl border ${themeStyles.panelBorder} ${themeStyles.card} flex justify-between shadow-sm`}><div className="flex flex-col min-w-0 pr-4"><p className={`text-sm font-black truncate ${themeStyles.text}`}>{d.company}</p></div><div className="text-right shrink-0"><p className={`text-sm font-black ${d.touches > 15 ? 'text-emerald-500' : 'text-amber-500'}`}>{d.touches || 0} <span className="text-[9px] uppercase tracking-widest opacity-50">касаний</span></p><p className={`text-xs font-bold mt-1.5 ${themeStyles.text}`}>{formatMoney(d.amount)}</p></div></div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ==========================================
// 5. КОМПОНЕНТ КАЛЕНДАРЯ (ОБНОВЛЕННЫЙ С НАСТРОЙКАМИ)
// ==========================================
const CalendarView = ({ deals, themeStyles, theme, onOpenDeal }) => {
  const [viewDate, setViewDate] = useState(new Date());
  
  // Состояния для расширенных настроек календаря
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [configModal, setConfigModal] = useState(null); // 'google' | 'yandex' | null
  const [isSyncing, setIsSyncing] = useState(false);

  // Хранилище настроек календаря пользователя (сохраняется в localStorage)
  const [calendarSettings, setCalendarSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('abqd_cal_settings');
      return saved ? JSON.parse(saved) : {
        google: { active: false, clientId: '', calendarId: '' },
        yandex: { active: false, token: '', caldavUrl: 'https://caldav.yandex.ru' }
      };
    } catch(e) { 
      return { google: { active: false, clientId: '', calendarId: '' }, yandex: { active: false, token: '', caldavUrl: 'https://caldav.yandex.ru' } };
    }
  });

  const saveSettings = (newSettings) => {
    setCalendarSettings(newSettings);
    localStorage.setItem('abqd_cal_settings', JSON.stringify(newSettings));
  };

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => setIsSyncing(false), 800);
  };

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDay = new Date(year, month, 1).getDay();
  const startOffset = startDay === 0 ? 6 : startDay - 1;

  const monthLeads = useMemo(() => {
    return deals.filter(d => d.nextTaskAt && new Date(d.nextTaskAt).getMonth() === month && new Date(d.nextTaskAt).getFullYear() === year);
  }, [deals, month, year]);

  // Моковые события появляются только если календарь 'active' в настройках пользователя
  const externalEvents = useMemo(() => {
    const evs = [];
    if (calendarSettings.google.active) {
      evs.push({ id: 'g1', title: 'Google: Презентация', day: 10, type: 'google' });
      evs.push({ id: 'g2', title: 'Google: Планерка', day: 22, type: 'google' });
    }
    if (calendarSettings.yandex.active) {
      evs.push({ id: 'y1', title: 'Yandex: Встреча', day: 14, type: 'yandex' });
      evs.push({ id: 'y2', title: 'Yandex: Обед с партнером', day: 26, type: 'yandex' });
    }
    return evs;
  }, [calendarSettings]);

  const cells = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="flex flex-col h-full p-4 pb-32 sm:p-8 overflow-hidden gap-6 relative">
      <div className={`p-4 sm:p-6 rounded-[2rem] border ${themeStyles.panelBorder} ${themeStyles.panel} flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-md relative z-30`}>
        <div className="flex items-center gap-4">
          <h2 className={`text-xl sm:text-2xl font-black tracking-tight ${themeStyles.text}`}>{MONTHS[month]} <span className="opacity-40">{year}</span></h2>
          <div className="flex border rounded-xl border-slate-200 dark:border-white/10 overflow-hidden shadow-sm">
            <button onClick={() => setViewDate(new Date(year, month - 1))} className="p-2 sm:p-2.5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"><ChevronLeft size={16}/></button>
            <button onClick={() => setViewDate(new Date())} className="px-3 text-[10px] sm:text-xs font-bold border-x border-slate-200 dark:border-white/10 hover:text-indigo-500 transition-colors">СЕГОДНЯ</button>
            <button onClick={() => setViewDate(new Date(year, month + 1))} className="p-2 sm:p-2.5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"><ChevronRight size={16}/></button>
          </div>
        </div>
        
        <div className="relative w-full sm:w-auto">
          {activeDropdown && <div className="fixed inset-0 z-30" onClick={() => setActiveDropdown(null)}/>}
          <button onClick={() => setActiveDropdown(activeDropdown === 'int' ? null : 'int')} className={`w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-3 sm:py-2.5 text-xs font-bold rounded-xl transition-all shadow-sm border z-40 relative ${activeDropdown === 'int' ? themeStyles.accentGradient + ' text-white border-transparent' : themeStyles.panelBorder + ' ' + themeStyles.text + ' hover:scale-[1.02]'}`}>
            <Cloud size={16} /> <span>Интеграции</span>
            {isSyncing && <RefreshCw size={12} className="animate-spin ml-1" />}
          </button>

          {/* ВЫПАДАЮЩАЯ ПАНЕЛЬ ИНТЕГРАЦИЙ */}
          {activeDropdown === 'int' && (
            <div className={`absolute top-full right-0 mt-3 w-full sm:w-72 p-6 rounded-[2rem] border shadow-2xl z-50 backdrop-blur-2xl animate-in fade-in slide-in-from-top-4 duration-200 ${themeStyles.panel} ${themeStyles.panelBorder}`}>
              <h3 className={`text-[10px] font-black uppercase tracking-widest mb-5 flex items-center justify-between ${themeStyles.textMuted}`}>Персональные календари</h3>
              <div className="space-y-3">
                <div className={`flex flex-col p-2 rounded-2xl border transition-all ${calendarSettings.google.active ? (theme === 'dark' ? 'bg-[#141120] border-[#3b82f6]/50 shadow-[0_0_15px_rgba(59,130,246,0.1)]' : 'bg-blue-50 border-blue-300') : (theme === 'dark' ? 'bg-transparent border-[#2a253a]' : 'bg-transparent border-slate-200')}`}>
                  <div className="flex items-center justify-between p-2">
                    <div className="flex items-center gap-3">
                      <img src="https://www.google.com/favicon.ico" alt="G" className={`w-4 h-4 ${calendarSettings.google.active ? '' : 'grayscale opacity-50'}`} />
                      <span className={`text-xs font-bold ${calendarSettings.google.active ? 'text-blue-500' : themeStyles.textMuted}`}>Google Calendar</span>
                    </div>
                    <button onClick={() => { setConfigModal('google'); setActiveDropdown(null); }} className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors"><Settings size={16} className={themeStyles.textMuted}/></button>
                  </div>
                </div>

                <div className={`flex flex-col p-2 rounded-2xl border transition-all ${calendarSettings.yandex.active ? (theme === 'dark' ? 'bg-[#141120] border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.1)]' : 'bg-amber-50 border-amber-300') : (theme === 'dark' ? 'bg-transparent border-[#2a253a]' : 'bg-transparent border-slate-200')}`}>
                  <div className="flex items-center justify-between p-2">
                    <div className="flex items-center gap-3">
                      <img src="https://yandex.ru/favicon.ico" alt="Y" className={`w-4 h-4 ${calendarSettings.yandex.active ? '' : 'grayscale opacity-50'}`} />
                      <span className={`text-xs font-bold ${calendarSettings.yandex.active ? 'text-amber-500' : themeStyles.textMuted}`}>Yandex Calendar</span>
                    </div>
                    <button onClick={() => { setConfigModal('yandex'); setActiveDropdown(null); }} className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors"><Settings size={16} className={themeStyles.textMuted}/></button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className={`flex-1 rounded-[2rem] border overflow-hidden flex flex-col ${themeStyles.panelBorder} ${themeStyles.panel} shadow-lg z-10`}>
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
                {dayDeals.map(deal => <div key={deal.id} onClick={() => onOpenDeal(deal.id)} className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-[9px] font-bold truncate text-indigo-500 cursor-pointer hover:bg-indigo-500/20 transition-colors">{deal.company}</div>)}
                {dayExtEvents.map(ev => (
                  <div key={ev.id} className={`p-1.5 rounded-lg text-[9px] font-bold truncate cursor-default flex items-center gap-1.5 shadow-sm border ${ev.type === 'google' ? (theme === 'dark' ? 'bg-[#3b82f6]/10 text-[#3b82f6] border-[#3b82f6]/20' : 'bg-blue-50 text-blue-600 border-blue-200') : (theme === 'dark' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-amber-50 text-amber-600 border-amber-200')}`}>
                    {ev.type === 'google' ? <img src="https://www.google.com/favicon.ico" className="w-2.5 h-2.5 grayscale opacity-70" alt="G"/> : <img src="https://yandex.ru/favicon.ico" className="w-2.5 h-2.5 grayscale opacity-70" alt="Y"/>}
                    {ev.title}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {/* МОДАЛЬНОЕ ОКНО ПЕРСОНАЛЬНЫХ НАСТРОЕК КАЛЕНДАРЯ */}
      {configModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
           <div className={`w-full max-w-md p-6 sm:p-8 rounded-[2rem] border shadow-2xl relative ${themeStyles.panel} ${themeStyles.panelBorder} animate-in zoom-in-95`}>
              <div className="flex justify-between items-start mb-6">
                 <div className="flex items-center gap-4">
                   <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner ${configModal === 'google' ? 'bg-blue-500/10' : 'bg-amber-500/10'}`}>
                     <img src={configModal === 'google' ? "https://www.google.com/favicon.ico" : "https://yandex.ru/favicon.ico"} alt="Logo" className="w-6 h-6" />
                   </div>
                   <div>
                     <h3 className={`text-lg font-black ${themeStyles.text}`}>Настройка {configModal === 'google' ? 'Google' : 'Yandex'}</h3>
                     <p className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${themeStyles.textMuted}`}>Персональный доступ</p>
                   </div>
                 </div>
                 <button onClick={() => setConfigModal(null)} className={`p-2 rounded-full transition-colors bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 ${themeStyles.textMuted}`}><X size={20}/></button>
              </div>
              
              <div className="space-y-5">
                {configModal === 'google' && (
                  <>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest opacity-40 flex items-center gap-1.5"><Lock size={12}/> Client ID (OAuth)</label>
                      <input value={calendarSettings.google.clientId} onChange={e => saveSettings({...calendarSettings, google: {...calendarSettings.google, clientId: e.target.value}})} placeholder="xxxx.apps.googleusercontent.com" className={`w-full p-4 rounded-xl border text-sm font-medium outline-none transition-all focus:border-blue-500/50 ${themeStyles.input} ${themeStyles.text}`} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest opacity-40 flex items-center gap-1.5"><CalendarDays size={12}/> Calendar ID (Опционально)</label>
                      <input value={calendarSettings.google.calendarId} onChange={e => saveSettings({...calendarSettings, google: {...calendarSettings.google, calendarId: e.target.value}})} placeholder="primary или user@gmail.com" className={`w-full p-4 rounded-xl border text-sm font-medium outline-none transition-all focus:border-blue-500/50 ${themeStyles.input} ${themeStyles.text}`} />
                    </div>
                  </>
                )}

                {configModal === 'yandex' && (
                  <>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest opacity-40 flex items-center gap-1.5"><Lock size={12}/> Пароль приложения (Token)</label>
                      <input type="password" value={calendarSettings.yandex.token} onChange={e => saveSettings({...calendarSettings, yandex: {...calendarSettings.yandex, token: e.target.value}})} placeholder="••••••••••••••••" className={`w-full p-4 rounded-xl border text-sm font-medium outline-none transition-all focus:border-amber-500/50 ${themeStyles.input} ${themeStyles.text}`} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest opacity-40 flex items-center gap-1.5"><Link2 size={12}/> CalDAV URL</label>
                      <input value={calendarSettings.yandex.caldavUrl} onChange={e => saveSettings({...calendarSettings, yandex: {...calendarSettings.yandex, caldavUrl: e.target.value}})} className={`w-full p-4 rounded-xl border text-sm font-medium outline-none transition-all focus:border-amber-500/50 ${themeStyles.input} ${themeStyles.text}`} />
                    </div>
                  </>
                )}
              </div>

              <div className="flex gap-3 mt-8">
                <button onClick={() => {
                  saveSettings({...calendarSettings, [configModal]: {...calendarSettings[configModal], active: true}});
                  setConfigModal(null); handleSync();
                }} className={`flex-1 py-3.5 rounded-xl font-black text-sm text-white shadow-lg active:scale-95 transition-all ${configModal === 'google' ? 'bg-blue-500 hover:bg-blue-600 shadow-blue-500/20' : 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20'}`}>
                  СОХРАНИТЬ И ВКЛЮЧИТЬ
                </button>
                
                {calendarSettings[configModal].active && (
                  <button onClick={() => {
                    saveSettings({...calendarSettings, [configModal]: {...calendarSettings[configModal], active: false, token: '', clientId: ''}});
                    setConfigModal(null);
                  }} className="px-5 py-3.5 rounded-xl font-black text-sm text-rose-500 bg-rose-500/10 hover:bg-rose-500/20 transition-colors">Отключить</button>
                )}
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// MAIN APP COMPONENT (СИНХРОНИЗАЦИЯ API)
// ==========================================
export default function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('abqd_theme') || 'dark'); 
  const [currentView, setCurrentView] = useState('kanban'); 
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [stages, setStages] = useState(INITIAL_STAGES);
  const [flows, setFlows] = useState(INITIAL_FLOWS);
  const [selectedId, setSelectedId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);

  // СИНХРОНИЗАЦИЯ: База + LocalStorage
  const API_URL = "https://api.abqd.ru/api/deals";
  const [deals, setDeals] = useState(() => {
    try {
      const cached = localStorage.getItem('abqd_crm_deals');
      return cached ? JSON.parse(cached) : [];
    } catch(e) { return []; }
  });

  const fetchDeals = useCallback(async () => {
    try {
      const res = await fetch(API_URL);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setDeals(data);
          localStorage.setItem('abqd_crm_deals', JSON.stringify(data));
        }
      }
    } catch(e) {}
  }, []);

  useEffect(() => {
    fetchDeals();
    const interval = setInterval(fetchDeals, 3000); 
    window.addEventListener('focus', fetchDeals);
    return () => { clearInterval(interval); window.removeEventListener('focus', fetchDeals); };
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
  }, [API_URL]);

  const handleAddDeal = async (stageKey) => {
    const newId = `D-${Math.floor(Math.random()*9000)}`;
    const newDeal = { id: newId, company: "Новая сделка", contact: "-", stage: stageKey, amount: 0, score: 50, source: "Неизвестно", address: "", description: "", priority: "medium", nextTaskAt: getTodayDateStr(), touches: 0 };
    setIsSyncing(true);
    setDeals(prev => {
        const nd = [...prev, newDeal];
        localStorage.setItem('abqd_crm_deals', JSON.stringify(nd));
        return nd;
    });
    setSelectedId(newId);
    try { await fetch(API_URL, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(newDeal) }); } catch(e) {} finally { setIsSyncing(false); }
  };

  const handleDeleteDeal = async (id) => {
    setDeals(prev => {
        const nd = prev.filter(d => d.id !== id);
        localStorage.setItem('abqd_crm_deals', JSON.stringify(nd));
        return nd;
    });
    setSelectedId(null);
    try { await fetch(`${API_URL}/${id}`, { method: 'DELETE' }); } catch(e) {}
  };

  const [draggedStageIdx, setDraggedStageIdx] = useState(null);
  const [dragOverStageIdx, setDragOverStageIdx] = useState(null);

  const handleDealDragStart = (e, dealId) => { e.dataTransfer.setData('dealId', dealId); e.dataTransfer.effectAllowed = 'move'; };
  const handleDealDrop = async (e, targetStage) => {
    e.preventDefault();
    const dealId = e.dataTransfer.getData('dealId');
    if (dealId) {
      setDeals(prev => {
        const nd = prev.map(d => d.id === dealId ? { ...d, stage: targetStage } : d);
        localStorage.setItem('abqd_crm_deals', JSON.stringify(nd));
        return nd;
      });
      try { await fetch(`${API_URL}/${dealId}/stage`, { method: 'PATCH', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ stage: targetStage }) }); } catch(e) {}
    }
  };

  const handleStageDragStart = (e, index) => { setDraggedStageIdx(index); e.dataTransfer.setData('text/plain', index); e.dataTransfer.effectAllowed = 'move'; };
  const handleStageDragOver = (e, index) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; if (dragOverStageIdx !== index) setDragOverStageIdx(index); };
  const handleStageDrop = (e, dropIndex) => {
    e.preventDefault();
    if (draggedStageIdx !== null && draggedStageIdx !== dropIndex) {
      const newStages = [...stages];
      const [draggedItem] = newStages.splice(draggedStageIdx, 1);
      newStages.splice(dropIndex, 0, draggedItem);
      setStages(newStages);
    }
    setDragOverStageIdx(null); setDraggedStageIdx(null);
  };

  const filteredDeals = useMemo(() => deals.filter(d => d.company.toLowerCase().includes(searchQuery.toLowerCase())), [deals, searchQuery]);
  const selectedDeal = deals.find(d => d.id === selectedId);

  return (
    <div className={`flex h-screen w-full font-sans transition-colors duration-500 relative overflow-hidden ${themeStyles.bg} ${themeStyles.text}`}>
      {/* DESKTOP SIDEBAR */}
      <aside className={`hidden sm:flex relative border-r p-5 transition-all duration-300 z-40 ${isSidebarCollapsed ? 'w-24' : 'w-72'} ${themeStyles.sidebar} ${themeStyles.panelBorder}`}>
        <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className={`absolute -right-3.5 top-12 w-7 h-7 rounded-full border flex items-center justify-center shadow-sm z-50 transition-transform hover:scale-110 ${themeStyles.panel} ${themeStyles.panelBorder} ${themeStyles.textMuted}`}>{isSidebarCollapsed ? <PanelLeftOpen size={14} /> : <PanelLeftClose size={14} />}</button>
        <div className="space-y-2 flex-1 mt-14 overflow-y-auto custom-scrollbar pr-2 pb-4">
          {[ { id: 'kanban', label: 'Доска', Icon: LayoutDashboard }, { id: 'calendar', label: 'Календарь', Icon: CalendarDays }, { id: 'analytics', label: 'Аналитика', Icon: BarChart3 }, { id: 'botflows', label: 'Сценарии', Icon: MessageSquare } ].map(item => (
            <button key={item.id} onClick={() => setCurrentView(item.id)} className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all ${currentView === item.id ? `${themeStyles.accentGradient} text-white shadow-xl` : `hover:bg-black/5 dark:hover:bg-white/5 ${themeStyles.textMuted}`}`}><item.Icon size={20} /> {!isSidebarCollapsed && <span className="text-sm font-bold tracking-wide">{item.label}</span>}</button>
          ))}
        </div>
      </aside>

      {/* MOBILE NAV */}
      <nav className="sm:hidden fixed bottom-6 left-4 right-4 h-16 rounded-[2rem] z-50 flex items-center justify-around px-2 shadow-[0_10px_40px_rgba(0,0,0,0.2)] border border-white/10 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl">
        {[ { id: 'kanban', label: 'Доска', Icon: LayoutDashboard }, { id: 'calendar', label: 'График', Icon: CalendarDays }, { id: 'botflows', label: 'Боты', Icon: MessageSquare }, { id: 'analytics', label: 'Итоги', Icon: BarChart3 } ].map(item => (
           <button key={item.id} onClick={() => setCurrentView(item.id)} className={`flex flex-col items-center justify-center w-16 h-12 rounded-xl transition-all ${currentView === item.id ? 'bg-indigo-500/10 text-indigo-500' : themeStyles.textMuted}`}><item.Icon size={20} className={currentView === item.id ? 'mb-0.5' : 'opacity-70'} />{currentView === item.id && <span className="text-[9px] font-black">{item.label}</span>}</button>
        ))}
      </nav>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {(currentView === 'kanban' || currentView === 'calendar') && (
          <header className={`h-20 shrink-0 border-b flex items-center justify-between px-6 sm:px-8 z-10 ${themeStyles.panel} ${themeStyles.panelBorder}`}>
            <div className="relative w-full max-w-2xl"><Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" /><input type="text" placeholder="Поиск сделок..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className={`w-full h-11 pl-12 pr-4 rounded-2xl text-sm font-medium border outline-none transition-all ${themeStyles.input} ${themeStyles.text} focus:border-indigo-500/50`} /></div>
            <div className="flex items-center gap-4 ml-6">{isSyncing && <Cloud size={16} className="text-indigo-400 animate-pulse hidden sm:block" />}<button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className={`p-2.5 rounded-xl border transition-transform hover:scale-105 ${themeStyles.panelBorder} ${themeStyles.panel}`}>{theme === 'dark' ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-indigo-500" />}</button></div>
          </header>
        )}

        {currentView === 'kanban' && (
          <div className="flex-1 overflow-x-auto flex px-4 py-6 pb-32 sm:p-8 gap-4 sm:gap-6 custom-scrollbar snap-x snap-mandatory sm:snap-none">
            {stages.map((stage, index) => (
              <div key={stage.key} onDragOver={(e) => handleStageDragOver(e, index)} onDragLeave={() => setDragOverStageIdx(null)} onDrop={(e) => { const dealId = e.dataTransfer.getData('dealId'); if(dealId) { handleDealDrop(e, stage.key); } else { handleStageDrop(e, index); } }} onDragStart={(e) => handleStageDragStart(e, index)} onDragEnd={() => { setDraggedStageIdx(null); setDragOverStageIdx(null); }} draggable className={`flex-none w-[85vw] max-w-[320px] sm:w-[320px] flex flex-col gap-5 snap-center sm:snap-align-none transition-all duration-300 ${draggedStageIdx === index ? 'opacity-40 scale-95' : 'opacity-100'} ${dragOverStageIdx === index && draggedStageIdx !== index ? 'bg-indigo-500/5 rounded-[2rem] outline outline-2 outline-indigo-500/50 outline-dashed scale-[1.02]' : ''}`}>
                <div className="flex items-center justify-between px-2 cursor-grab active:cursor-grabbing group"><div className="flex items-center gap-3"><GripHorizontal size={14} className="opacity-30 group-hover:opacity-100 transition-opacity pointer-events-none" /><div className={`w-2.5 h-2.5 rounded-full ${stage.color} shadow-sm`} /><h4 className="text-xs font-black uppercase tracking-[0.15em] opacity-70 pointer-events-none">{stage.title}</h4></div><span className={`text-[10px] font-black px-2 py-1 rounded-lg bg-black/5 dark:bg-white/5 ${themeStyles.textMuted}`}>{filteredDeals.filter(d => d.stage === stage.key).length}</span></div>
                <div className="flex-1 overflow-y-auto space-y-4 px-1 custom-scrollbar pb-4">
                  {filteredDeals.filter(d => d.stage === stage.key).map(deal => (
                    <div key={deal.id} draggable onDragStart={(e) => handleDealDragStart(e, deal.id)} onClick={() => setSelectedId(deal.id)} className={`p-5 rounded-2xl border cursor-pointer sm:cursor-grab active:cursor-grabbing transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${themeStyles.card} ${themeStyles.panelBorder}`}>
                      <div className="flex justify-between items-start mb-1.5"><h4 className="font-black text-sm truncate pr-2">{deal.company}</h4>{deal.priority === 'high' && <div className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)] animate-pulse shrink-0 mt-1" />}</div>
                      <div className="flex justify-between items-center mb-4"><span className="text-[10px] font-medium opacity-50 truncate w-32">{deal.nextStep || deal.contact}</span><span className={`text-sm font-black tracking-tighter ${themeStyles.accentText}`}>{formatMoney(deal.amount)}</span></div>
                      <div className="flex items-center justify-between border-t border-black/5 dark:border-white/5 pt-3"><Badge className={getScoreInfo(deal.score).color}>{deal.score}</Badge>{deal.nextTaskAt && <div className={`text-[9px] font-bold flex items-center gap-1 ${getDueStatus(deal.nextTaskAt) === 'expired' ? 'text-rose-500' : 'text-emerald-500'}`}><Clock size={10} /> {deal.nextTaskAt.slice(5)}</div>}</div>
                    </div>
                  ))}
                  <button onClick={() => handleAddDeal(stage.key)} className={`w-full py-4 rounded-2xl border-2 border-dashed border-black/10 dark:border-white/10 opacity-40 hover:opacity-100 transition-all text-[11px] font-black uppercase tracking-widest hover:border-indigo-500/50 hover:bg-indigo-500/5 ${themeStyles.textMuted}`}>+ Добавить</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {currentView === 'analytics' && <AnalyticsView deals={deals} themeStyles={themeStyles} theme={theme} setTheme={setTheme} stages={stages} />}
        {currentView === 'calendar' && <CalendarView deals={deals} themeStyles={themeStyles} theme={theme} onOpenDeal={setSelectedId} />}
        {currentView === 'botflows' && <BotFlowsView flows={flows} setFlows={setFlows} themeStyles={themeStyles} theme={theme} />}
      </main>

      {/* МОДАЛКА РЕДАКТИРОВАНИЯ СДЕЛКИ */}
      {selectedId && selectedDeal && (
        <div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center p-0 sm:p-6 bg-black/40 dark:bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="absolute inset-0 hidden sm:block cursor-pointer" onClick={() => setSelectedId(null)} />
           <div className={`relative w-full max-w-4xl h-[95dvh] sm:h-auto sm:max-h-[90vh] rounded-t-[2rem] sm:rounded-[2.5rem] flex flex-col shadow-2xl animate-in slide-in-from-bottom-8 sm:zoom-in-95 ${themeStyles.panel} ${themeStyles.panelBorder}`}>
              <div className="sm:hidden absolute top-0 left-0 w-full flex justify-center pt-3 z-30 pointer-events-none"><div className="w-12 h-1.5 rounded-full bg-black/10 dark:bg-white/10" /></div>
              <div className="sticky top-0 z-20 pt-8 pb-5 px-5 sm:p-8 border-b border-black/5 dark:border-white/[0.06] flex justify-between items-center backdrop-blur-2xl bg-white/60 dark:bg-[#222226]/80 rounded-t-[2rem] sm:rounded-t-[2.5rem]">
                <div className="flex items-center gap-4 sm:gap-5 min-w-0">
                  <div className={`hidden sm:flex w-14 h-14 rounded-2xl items-center justify-center shadow-inner ${selectedDeal.priority === 'high' ? 'bg-rose-500/10 text-rose-500' : 'bg-slate-500/10 text-slate-500'}`}><Target size={24}/></div>
                  <div className="min-w-0"><h2 className="text-xl sm:text-2xl font-black tracking-tight truncate pr-4">{selectedDeal.company}</h2><div className="flex items-center gap-3 mt-1.5"><span className="text-[10px] font-black uppercase opacity-40 tracking-widest">ID: {selectedDeal.id}</span><span className="opacity-20 text-[10px]">•</span><span className="text-[10px] font-black uppercase text-orange-500 flex items-center gap-1"><Flame size={12} className="mb-0.5"/> {selectedDeal.touches || 0} касаний</span></div></div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleDeleteDeal(selectedDeal.id)} className="p-2 sm:p-3 rounded-full text-rose-500 hover:bg-rose-500/10 transition-colors shrink-0"><Trash2 size={20}/></button>
                  <button onClick={() => setSelectedId(null)} className="p-2 sm:p-3 rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors shrink-0"><X size={20}/></button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-8 custom-scrollbar">
                <div className="space-y-3"><label className="text-[10px] font-black uppercase opacity-40 px-1 flex items-center gap-1.5 tracking-widest"><Zap size={12}/> Быстрая связь</label><div className="grid grid-cols-3 gap-3"><a href={`https://wa.me/${selectedDeal.phone?.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" onClick={() => handleSaveDeal({...selectedDeal, touches: (selectedDeal.touches || 0) + 1})} className="flex flex-col sm:flex-row items-center justify-center gap-2 py-3 rounded-2xl bg-emerald-500 text-white font-bold text-[10px] sm:text-sm shadow-lg hover:-translate-y-0.5 transition-all"><MessageCircle size={18}/> <span className="hidden sm:inline">WhatsApp</span></a><a href={`https://t.me/${selectedDeal.phone?.startsWith('+') ? selectedDeal.phone : '+' + selectedDeal.phone}`} target="_blank" rel="noreferrer" onClick={() => handleSaveDeal({...selectedDeal, touches: (selectedDeal.touches || 0) + 1})} className="flex flex-col sm:flex-row items-center justify-center gap-2 py-3 rounded-2xl bg-sky-500 text-white font-bold text-[10px] sm:text-sm shadow-lg hover:-translate-y-0.5 transition-all"><Send size={18}/> <span className="hidden sm:inline">Telegram</span></a><a href={`https://max.ru/direct/${selectedDeal.phone}`} target="_blank" rel="noreferrer" onClick={() => handleSaveDeal({...selectedDeal, touches: (selectedDeal.touches || 0) + 1})} className="flex flex-col sm:flex-row items-center justify-center gap-2 py-3 rounded-2xl bg-indigo-600 text-white font-bold text-[10px] sm:text-sm shadow-lg hover:-translate-y-0.5 transition-all"><Share2 size={18}/> <span className="hidden sm:inline">MAX</span></a></div></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                  <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
                    <div className="space-y-2"><label className="text-[10px] font-black uppercase opacity-40 px-1">Название компании</label><input className={`w-full p-4 rounded-2xl border outline-none transition-all text-sm font-bold ${themeStyles.input} ${themeStyles.text}`} value={selectedDeal.company} onChange={(e) => handleSaveDeal({...selectedDeal, company: e.target.value})} /></div>
                    <div className="space-y-2"><label className="text-[10px] font-black uppercase opacity-40 px-1">Сумма сделки (₽)</label><input type="number" className={`w-full p-4 rounded-2xl border outline-none transition-all text-sm font-black text-indigo-500 ${themeStyles.input}`} value={selectedDeal.amount} onChange={(e) => handleSaveDeal({...selectedDeal, amount: Number(e.target.value)})} /></div>
                    <div className="space-y-2"><label className="text-[10px] font-black uppercase opacity-40 px-1 flex items-center gap-1.5"><Phone size={12}/> Телефон</label><input className={`w-full p-4 rounded-2xl border outline-none transition-all text-sm font-medium ${themeStyles.input} ${themeStyles.text}`} value={selectedDeal.phone || ""} onChange={(e) => handleSaveDeal({...selectedDeal, phone: e.target.value})} placeholder="79000000000" /></div>
                    <div className="space-y-2"><label className="text-[10px] font-black uppercase opacity-40 px-1 flex items-center gap-1.5"><Mail size={12}/> Электронная почта</label><input className={`w-full p-4 rounded-2xl border outline-none transition-all text-sm font-medium ${themeStyles.input} ${themeStyles.text}`} value={selectedDeal.email || ""} onChange={(e) => handleSaveDeal({...selectedDeal, email: e.target.value})} placeholder="mail@example.com" /></div>
                  </div>
                  <div className={`p-6 rounded-3xl border space-y-5 transition-colors duration-300 ${theme === 'dark' ? 'bg-white/[0.02] border-white/[0.05]' : 'bg-indigo-50/40 border-indigo-100/50'}`}>
                    <div className="space-y-2"><label className="text-[10px] font-black uppercase opacity-40 px-1">Приоритет</label><select className={`w-full p-3.5 rounded-xl border outline-none font-black text-xs transition-all ${themeStyles.input} ${themeStyles.text} [&>option]:bg-white dark:[&>option]:bg-[#222226]`} value={selectedDeal.priority || 'medium'} onChange={(e) => handleSaveDeal({...selectedDeal, priority: e.target.value})}>{PRIORITIES.map(p => <option key={p.key} value={p.key} className={p.color}>{p.title}</option>)}</select></div>
                    <div className="space-y-2"><label className="text-[10px] font-black uppercase opacity-40 px-1">Дедлайн</label><input type="date" className={`w-full p-3.5 rounded-xl border outline-none font-black text-xs transition-all ${themeStyles.input} ${themeStyles.text} dark:[color-scheme:dark]`} value={selectedDeal.nextTaskAt || ""} onChange={(e) => handleSaveDeal({...selectedDeal, nextTaskAt: e.target.value})} /></div>
                    <div className="space-y-2"><label className="text-[10px] font-black uppercase opacity-40 px-1">Этап воронки</label><select className={`w-full p-3.5 rounded-xl border outline-none font-black text-xs transition-all ${themeStyles.input} ${themeStyles.text} [&>option]:bg-white dark:[&>option]:bg-[#222226]`} value={selectedDeal.stage || "inbox"} onChange={(e) => handleSaveDeal({...selectedDeal, stage: e.target.value})}>{stages.map(s => <option key={s.key} value={s.key}>{s.title}</option>)}</select></div>
                  </div>
                </div>
                <div className="space-y-2"><label className="text-[10px] font-black uppercase opacity-40 px-1 flex items-center gap-1.5"><ArrowUpRight size={12}/> Следующий шаг</label><input className={`w-full p-4 sm:p-5 rounded-2xl border outline-none transition-all text-sm font-black text-indigo-500 ${themeStyles.input}`} value={selectedDeal.nextStep || ""} onChange={(e) => handleSaveDeal({...selectedDeal, nextStep: e.target.value})} /></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
                  <div className="space-y-2"><div className="flex justify-between items-center px-1"><label className="text-[10px] font-black uppercase opacity-40 flex items-center gap-1.5"><MapPin size={12}/> Адрес</label>{selectedDeal.address && <a href={`https://yandex.ru/maps/?text=${encodeURIComponent(selectedDeal.address)}`} target="_blank" rel="noreferrer" className="text-[10px] font-black text-indigo-500 hover:underline flex items-center gap-1"><ExternalLink size={10}/> На карте</a>}</div><input className={`w-full p-4 rounded-2xl border outline-none transition-all text-sm font-medium ${themeStyles.input} ${themeStyles.text}`} value={selectedDeal.address || ""} onChange={(e) => handleSaveDeal({...selectedDeal, address: e.target.value})} /></div>
                  <div className="space-y-2"><label className="text-[10px] font-black uppercase opacity-40 px-1">Источник трафика</label><select className={`w-full p-4 rounded-2xl border outline-none transition-all text-sm font-medium ${themeStyles.input} ${themeStyles.text}`} value={selectedDeal.source || "Неизвестно"} onChange={(e) => handleSaveDeal({...selectedDeal, source: e.target.value})}>{MARKETING_SOURCES_LIST.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
                </div>
                <div className="space-y-2"><label className="text-[10px] font-black uppercase opacity-40 px-1">История и заметки</label><textarea rows={5} className={`w-full p-5 rounded-3xl border outline-none resize-none leading-relaxed text-sm font-medium ${themeStyles.input} ${themeStyles.text}`} value={selectedDeal.description || ""} onChange={(e) => handleSaveDeal({...selectedDeal, description: e.target.value})} /></div>
              </div>
              <div className="sticky bottom-0 z-20 p-5 sm:p-8 border-t border-black/5 dark:border-white/[0.06] backdrop-blur-2xl bg-white/60 dark:bg-[#222226]/80 rounded-b-none sm:rounded-b-[2.5rem]">
                <button onClick={() => setSelectedId(null)} className={`w-full py-5 rounded-2xl font-black text-sm sm:text-base shadow-xl active:scale-[0.98] transition-all text-white ${themeStyles.accentGradient}`}>СОХРАНИТЬ И ЗАКРЫТЬ</button>
              </div>
           </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; border-radius: 10px; margin: 4px 0; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.4); border-radius: 10px; border: 2px solid transparent; background-clip: padding-box; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(99,102,241,0.8); }
        @media (max-width: 640px) {
           .custom-scrollbar::-webkit-scrollbar { width: 5px; height: 5px; display: block; }
           .custom-scrollbar::-webkit-scrollbar-track { background: transparent; margin: 2px; }
           .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.4); border-radius: 4px; border: none; }
        }
      `}} />
    </div>
  );
}
