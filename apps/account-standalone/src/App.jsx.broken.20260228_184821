import React, { useState } from 'react';
import { Shield, Key, CreditCard, Clock, User, CheckCircle2, Sun, Moon } from 'lucide-react';

import useAccountData from "./useAccountData";

export default function App() {
  // Данные из API (персональные)
  const { loading, userData } = useAccountData();

  // Состояния
  const [isDarkTheme, setIsDarkTheme] = useState(true); // Состояние темы
  
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const [passwordSaved, setPasswordSaved] = useState(false);

  const [autoRenew, setAutoRenew] = useState(true);
  const [isLoadingRenew, setIsLoadingRenew] = useState(false);

  // Расчет остатка подписки для светящегося кластера (без ошибок и отрицательных значений)
  const calculateProgress = () => {
    if (!userData?.paidUntil) return { remainingPercentage: 0, daysLeft: null };

    const now = Date.now();
    const start = (userData.startDate || new Date()).getTime();
    const end = userData.paidUntil.getTime();

    const totalMs = Math.max(1, end - start);
    const remainingMs = Math.max(0, end - now);

    let remainingPercentage = (remainingMs / totalMs) * 100;
    remainingPercentage = Math.max(0, Math.min(remainingPercentage, 100));

    const daysLeft = Math.ceil(remainingMs / (1000 * 60 * 60 * 24));
    return { remainingPercentage, daysLeft };
  };

  const { remainingPercentage, daysLeft } = calculateProgress();

  // Определение цвета кластера в зависимости от остатка дней
  const getClusterColor = (percentage) => {
    if (percentage > 20) return {
       dark: 'bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.9)]',
       light: 'bg-blue-500 shadow-[0_0_6px_rgba(59,130,246,0.5)]'
    };
    if (percentage > 5) return {
       dark: 'bg-yellow-400 shadow-[0_0_12px_rgba(250,204,21,0.9)]',
       light: 'bg-yellow-400 shadow-[0_0_6px_rgba(250,204,21,0.5)]'
    };
    return {
       dark: 'bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.9)]',
       light: 'bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.5)]'
    };
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    setPasswordSaved(true);
    setTimeout(() => setPasswordSaved(false), 3000);
    setPasswords({ current: '', new: '', confirm: '' });
  };

  const handleToggleAutoRenew = () => {
    setIsLoadingRenew(true);
    setTimeout(() => {
      setAutoRenew(!autoRenew);
      setIsLoadingRenew(false);
    }, 1000);
  };

  // Объект с классами для светлой и темной темы для чистоты кода
  const t = {
    bgRoot: isDarkTheme ? 'bg-[#0b0f19] text-gray-300' : 'bg-slate-50 text-slate-600',
    title: isDarkTheme ? 'text-white' : 'text-slate-900',
    card: isDarkTheme ? 'bg-[#151b28] border-gray-800 shadow-black/20' : 'bg-white border-slate-200 shadow-slate-200/60',
    cardTitle: isDarkTheme ? 'text-white' : 'text-slate-900',
    textMuted: isDarkTheme ? 'text-gray-400' : 'text-slate-500',
    textHighlight: isDarkTheme ? 'text-white' : 'text-slate-900',
    textLabel: isDarkTheme ? 'text-gray-500' : 'text-slate-400',
    innerBox: isDarkTheme ? 'bg-[#0b0f19] border-gray-800/60' : 'bg-slate-50 border-slate-200',
    badge: isDarkTheme ? 'bg-white text-black' : 'bg-slate-900 text-white',
    iconBoxGray: isDarkTheme ? 'bg-gray-800 text-gray-300' : 'bg-slate-100 text-slate-600',
    btnPrimary: isDarkTheme ? 'bg-white hover:bg-gray-200 text-black' : 'bg-slate-900 hover:bg-slate-800 text-white',
    btnSecondary: isDarkTheme ? 'bg-gray-800 hover:bg-gray-700 text-white border-gray-700' : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-sm',
    btnThemeToggle: isDarkTheme ? 'text-gray-500 hover:text-yellow-400 hover:bg-gray-800' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-200',
    input: isDarkTheme ? 'bg-[#0b0f19] border-gray-700 text-white placeholder-gray-600' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400',
    inputDisabled: isDarkTheme ? 'bg-[#0b0f19] border-gray-800 text-gray-400' : 'bg-slate-100 border-slate-200 text-slate-500',
    autoRenewCard: isDarkTheme ? 'from-[#151b28] to-[#0d131f] border-gray-800' : 'from-white to-slate-50 border-slate-200',
    clusterEmpty: isDarkTheme ? 'bg-gray-800/40' : 'bg-slate-200/70',
    link: isDarkTheme ? 'text-gray-500 decoration-gray-600/60 hover:text-gray-300 hover:decoration-gray-400' : 'text-slate-500 decoration-slate-300 hover:text-slate-700 hover:decoration-slate-400',
    btnEnableRenew: isDarkTheme ? 'border-green-900/50 bg-green-500/10 text-green-400 hover:bg-green-500/20' : 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100',
    iconBlue: isDarkTheme ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600',
    iconPurple: isDarkTheme ? 'bg-purple-500/10 text-purple-400' : 'bg-purple-50 text-purple-600',
  };

  // --- ABQD_RENEW_CURRENT_PLAN_v1 ---
  const [isPayingRenew, setIsPayingRenew] = useState(false);

  async function renewCurrentPlan(){
    try{
      setIsPayingRenew(true);
      const API = "https://api.abqd.ru";
      const token = localStorage.getItem("abqd_token") || "";
      if (!token){
        window.location.href = "/auth/?next=%2Faccount%2F";
        return;
      }
      const planRaw = String(userData?.plan || "").toLowerCase();
      const plan = planRaw.includes("full") ? "full" : (planRaw.includes("pro") ? "pro" : "full");
      const return_url = window.location.origin + "/pay/return/?next=%2Faccount%2F";

      const r = await fetch(API + "/api/v1/payments/create", {
        method: "POST",
        headers: { "content-type":"application/json", authorization:"Bearer " + token },
        body: JSON.stringify({ plan, return_url })
      });

      const j = await r.json().catch(()=>null);
      if (r.status === 401){
        window.location.href = "/auth/?next=%2Faccount%2F";
        return;
      }
      const url = j && j.confirmation_url;
      if (!url){
        alert("Не удалось начать оплату (нет confirmation_url).");
        setIsPayingRenew(false);
        return;
      }
      window.location.href = url;
    } catch(e){
      console.warn(e);
      alert("Ошибка запуска оплаты: " + String(e));
      setIsPayingRenew(false);
    }
  }
  // --- end ABQD_RENEW_CURRENT_PLAN_v1 ---

  return (
    <div className={`min-h-screen font-sans selection:bg-blue-500/30 transition-colors duration-300 ${t.bgRoot}`}>
      
      {/* Основной контент */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 lg:py-12">
        
        {/* Заголовок и переключатель темы */}
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <h1 className={`text-2xl sm:text-3xl font-bold transition-colors ${t.title}`}>Аккаунт</h1>
          
          <button 
            onClick={() => setIsDarkTheme(!isDarkTheme)}
            className={`p-2.5 rounded-xl transition-colors ${t.btnThemeToggle}`}
            title={isDarkTheme ? "Светлая тема" : "Тёмная тема"}
            aria-label="Переключить тему"
          >
            {isDarkTheme ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Левая колонка (Информация и подписка) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Карточка подписки */}
            <div className={`border rounded-2xl p-5 sm:p-6 shadow-lg transition-colors ${t.card}`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-lg shrink-0 transition-colors ${t.iconBlue}`}>
                    <CreditCard size={24} />
                  </div>
                  <div>
                    <h2 className={`text-lg sm:text-xl font-semibold transition-colors ${t.cardTitle}`}>Текущий тариф</h2>
                    <p className={`text-xs sm:text-sm transition-colors ${t.textMuted}`}>Управление вашей подпиской</p>
                  </div>
                </div>
                <div className={`self-start sm:self-auto px-4 py-1.5 font-bold rounded-lg uppercase tracking-wide text-xs sm:text-sm shadow-sm transition-colors ${t.badge}`}>
                  План: {userData.plan}
                </div>
              </div>

              <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 p-4 rounded-xl border transition-colors ${t.innerBox}`}>
                <div>
                  <div className={`text-xs uppercase font-semibold mb-1 transition-colors ${t.textLabel}`}>Статус</div>
                  <div className="text-green-500 font-medium flex items-center gap-1.5">
                    <CheckCircle2 size={16} />
                    {userData.status}
                  </div>
                </div>
                <div>
                  <div className={`text-xs uppercase font-semibold mb-1 transition-colors ${t.textLabel}`}>Оплачено до</div>
                  <div className={`font-medium transition-colors ${t.textHighlight}`}>
                    {((userData.paidUntil) ? userData.paidUntil.toLocaleDateString('ru-RU') : '—')} <span className={`text-xs sm:text-sm sm:ml-1 block sm:inline transition-colors ${t.textLabel}`}>{((userData.paidUntil) ? userData.paidUntil.toLocaleTimeString('ru-RU') : '—')}</span>
                  </div>
                </div>
              </div>

              {/* Светящийся кластер (остаток подписки) */}
              <div className="mb-6">
                <div className="flex justify-between items-end text-xs sm:text-sm mb-3">
                  <span className={`transition-colors font-medium ${t.textMuted}`}>Остаток подписки</span>
                  <span className={`font-bold text-lg leading-none transition-colors ${t.textHighlight}`}>{daysLeft} <span className="text-sm font-normal">дней</span></span>
                </div>
                
                <div className="flex justify-between items-center gap-[2px] sm:gap-1 h-3 sm:h-3.5 mb-2">
                  {Array.from({ length: 40 }).map((_, i) => {
                    const activeSegmentsCount = Math.ceil((remainingPercentage / 100) * 40);
                    const isActive = i < activeSegmentsCount;
                    const isLastActive = i === activeSegmentsCount - 1;
                    const clusterColors = getClusterColor(remainingPercentage);
                    
                    return (
                      <div 
                        key={i}
                        className={`flex-1 h-full rounded-[1px] transition-all duration-700 ease-out ${
                          isActive 
                            ? isDarkTheme ? clusterColors.dark : clusterColors.light
                            : t.clusterEmpty
                        } ${isLastActive && autoRenew ? 'animate-pulse' : ''}`}
                      />
                    );
                  })}
                </div>
                
                <div className={`flex justify-between text-[10px] sm:text-xs transition-colors ${t.textLabel}`}>
                  <span>Сегодня</span>
                  <span>{((userData.paidUntil) ? userData.paidUntil.toLocaleDateString('ru-RU') : '—')}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button className="w-full sm:flex-1 bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 px-4 rounded-xl transition-colors shadow-lg shadow-blue-900/20" type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); renewCurrentPlan(); }} disabled={isPayingRenew}>{isPayingRenew ? "Переходим к оплате…" : "Продлить тариф"}</button></div>
            </div>

            {/* Профиль пользователя */}
             <div className={`border rounded-2xl p-5 sm:p-6 shadow-lg transition-colors ${t.card}`}>
              <div className="flex items-center gap-3 mb-6">
                 <div className={`p-2.5 rounded-lg transition-colors ${t.iconBoxGray}`}>
                    <User size={24} />
                  </div>
                <h2 className={`text-lg sm:text-xl font-semibold transition-colors ${t.cardTitle}`}>Профиль</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 transition-colors ${t.textMuted}`}>Email пользователя</label>
                  <input 
                    type="text" 
                    readOnly 
                    value={userData.email} 
                    className={`w-full border rounded-xl px-4 py-3 focus:outline-none opacity-80 cursor-not-allowed transition-colors ${t.inputDisabled}`}
                  />
                </div>
              </div>
            </div>

          </div>

          {/* Правая колонка (Безопасность) */}
          <div className="space-y-6">
            
            {/* Карточка смены пароля */}
            <div className={`border rounded-2xl p-5 sm:p-6 shadow-lg transition-colors ${t.card}`}>
              <div className="flex items-center gap-3 mb-6">
                <div className={`p-2.5 rounded-lg transition-colors ${t.iconPurple}`}>
                  <Shield size={24} />
                </div>
                <h2 className={`text-lg sm:text-xl font-semibold transition-colors ${t.cardTitle}`}>Безопасность</h2>
              </div>

              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1.5 transition-colors ${t.textMuted}`}>Текущий пароль</label>
                  <div className="relative">
                    <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors ${t.textLabel}`}>
                      <Key size={16} />
                    </div>
                    <input 
                      type="password" 
                      placeholder="••••••••"
                      value={passwords.current}
                      onChange={(e) => setPasswords({...passwords, current: e.target.value})}
                      className={`w-full border rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors ${t.input}`}
                      required
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <label className={`block text-sm font-medium mb-1.5 transition-colors ${t.textMuted}`}>Новый пароль</label>
                  <input 
                    type="password" 
                    placeholder="Минимум 8 символов"
                    value={passwords.new}
                    onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                    className={`w-full border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors ${t.input}`}
                    required
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1.5 transition-colors ${t.textMuted}`}>Подтвердите пароль</label>
                  <input 
                    type="password" 
                    placeholder="Повторите новый пароль"
                    value={passwords.confirm}
                    onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                    className={`w-full border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors ${t.input}`}
                    required
                  />
                </div>

                <div className="pt-4">
                  <button 
                    type="submit" 
                    className={`w-full font-semibold py-2.5 px-4 rounded-xl transition-colors flex justify-center items-center gap-2 ${t.btnPrimary}`}
                  >
                    {passwordSaved ? (
                      <>
                        <CheckCircle2 size={18} className="text-green-500" />
                        Сохранено
                      </>
                    ) : (
                      'Обновить пароль'
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Карточка автопродления */}
            <div className={`bg-gradient-to-br border rounded-2xl p-5 sm:p-6 relative overflow-hidden transition-all duration-300 ${t.autoRenewCard}`}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
              
              <Clock className={autoRenew ? "text-blue-500 mb-4" : `mb-4 transition-colors ${t.textLabel}`} size={28} />
              <h3 className={`font-medium mb-2 transition-colors ${t.cardTitle}`}>Автопродление {autoRenew ? 'включено' : 'отключено'}</h3>
              
              <p className={`text-sm mb-6 leading-relaxed min-h-[60px] transition-colors ${t.textMuted}`}>
                {autoRenew 
                  ? `Ваша подписка будет автоматически продлена ${((userData.paidUntil) ? userData.paidUntil.toLocaleDateString('ru-RU') : '—')}. Вы можете отменить автопродление в любой момент.`
                  : `Подписка будет активна до ${((userData.paidUntil) ? userData.paidUntil.toLocaleDateString('ru-RU') : '—')}, после чего доступ будет приостановлен. Новых списаний не будет.`
                }
              </p>

              <div className="flex justify-start">
                <button 
                  onClick={handleToggleAutoRenew}
                  disabled={isLoadingRenew}
                  className={`transition-all duration-300 flex items-center gap-2 ${
                    autoRenew 
                      ? `text-xs underline underline-offset-4 ${t.link}` 
                      : `w-full py-2.5 px-4 rounded-xl font-medium text-sm border justify-center ${t.btnEnableRenew}`
                  } ${isLoadingRenew ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isLoadingRenew ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                      {autoRenew ? 'Отмена...' : 'Включение...'}
                    </>
                  ) : autoRenew ? (
                    'Отменить автопродление'
                  ) : (
                    'Включить автопродление'
                  )}
                </button>
              </div>
            </div>

          </div>
        </div>
      </main>

    </div>
  );
}
